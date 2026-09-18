const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createStore } = require('./lib/store');
const { security, compress, middleware, send, error, parseBody, checkOrigin, textField } = require('./lib/http');
const { validateHealthPrompt, formatSafeResponse } = require('./js/guardrails');
const summarize = require('./lib/summarize');
const load = (name) => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', name + '.json'), 'utf8'));
const topics = load('topics');
const clinics = load('clinics');
const quizzes = load('quizzes');
const translations = load('translations');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png' };

function createHandler(options = {}) {
  const store = options.store || createStore();
  const webRoot = options.webRoot || (fs.existsSync(path.join(__dirname, 'dist/index.html')) ? path.join(__dirname, 'dist') : __dirname);
  const log = options.log || ((entry) => console.log(JSON.stringify(entry)));
  let inFlight = 0;
  async function handle(req, res) {
    const started = performance.now();
    let route = 'invalid';
    let acquired = false;
    try {
      await middleware(security, req, res);
      await middleware(compress, req, res);
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      const url = new URL(req.url, 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);
      if (pathname.startsWith('/api/')) {
        route = pathname.replace(/\/topics\/.+/, '/topics/:slug').replace(/\/quizzes\/.+/, '/quizzes/:slug');
        const known = ['/api/topics', '/api/topics/:slug', '/api/clinics', '/api/translations',
          '/api/quizzes/:slug', '/api/metrics', '/api/quiz/submit', '/api/feedback', '/api/ai/summarize', '/api/telemetry', '/api/health'];
        if (!known.includes(route)) { route = 'unknown'; throw error(404, 'API route not found'); }
        res.once('finish', () => log({ event: 'api_request', route, method: req.method,
          status: res.statusCode, durationMs: Math.round((performance.now() - started) * 100) / 100 }));
        if (pathname === '/api/health' && ['GET', 'HEAD'].includes(req.method)) {
          await store.initialize();
          return send(req, res, 200, { status: 'ok' });
        }
        const write = ['/api/quiz/submit', '/api/feedback', '/api/ai/summarize', '/api/telemetry'].includes(pathname);
        if (write ? req.method !== 'POST' : !['GET', 'HEAD'].includes(req.method)) {
          res.setHeader('Allow', write ? 'POST' : 'GET, HEAD');
          throw error(405, 'Method not allowed');
        }
        if (write) checkOrigin(req);
        if (inFlight >= 64) throw error(503, 'Server is busy; please retry');
        inFlight++; acquired = true;
        // Trust only the header overwritten by Vercel, never arbitrary forwarded headers.
        const ip = process.env.VERCEL ? (req.headers['x-vercel-forwarded-for'] || req.socket.remoteAddress) : req.socket.remoteAddress;
        if (!await store.allow(ip, write ? 'write' : 'read', options.rateLimit || (write ? 30 : 300))) {
          res.setHeader('Retry-After', Math.ceil((60000 - Date.now() % 60000) / 1000));
          throw error(429, 'Too many requests; please retry shortly');
        }
        let locale = url.searchParams.get('locale') || 'en';
        if (!['en', 'es', 'tr'].includes(locale)) locale = 'en';
        const reply = (data) => send(req, res, 200, data, MIME['.json'], 'public, max-age=0, must-revalidate');
        if (pathname === '/api/translations') return reply(translations[locale]);
        if (pathname === '/api/topics') {
          if (req.method === 'GET') await store.mutate((metrics) => { metrics.topicsViewedTotal++; });
          return reply(topics.map((topic) => {
            const { id, slug, category, icon, readingLevel, readMinutes } = topic;
            const { content: _content, ...localized } = topic.translations[locale] || topic.translations.en;
            return { id, slug, category, icon, readingLevel, readMinutes, ...localized };
          }));
        }
        if (pathname.startsWith('/api/topics/')) {
          const topic = topics.find((entry) => entry.slug === pathname.slice('/api/topics/'.length));
          if (!topic) throw error(404, 'Topic not found');
          const { translations: localized, ...base } = topic;
          return reply({ ...base, ...(localized[locale] || localized.en) });
        }
        if (pathname === '/api/clinics') {
          const query = (url.searchParams.get('query') || '').toLowerCase();
          const service = url.searchParams.get('service');
          const language = url.searchParams.get('language');
          if (query.length > 200) throw error(400, 'Search query is too long');
          return reply(clinics.filter((clinic) =>
            (!query || [clinic.name, clinic.address, clinic.city, clinic.description].some((value) => value.toLowerCase().includes(query))) &&
            (!service || service === 'all' || clinic.services.includes(service)) &&
            (!language || language === 'all' || clinic.languages.some((value) => value.toLowerCase().includes(language.toLowerCase())))));
        }
        if (pathname.startsWith('/api/quizzes/')) {
          const slug = pathname.slice('/api/quizzes/'.length);
          if (!Object.hasOwn(quizzes, slug)) throw error(404, 'Quiz not found');
          const group = quizzes[slug][locale] || quizzes[slug].en;
          const type = url.searchParams.get('type') === 'post' ? 'post' : 'pre';
          return reply(group[type]?.questions?.[0] || group[type]);
        }
        if (pathname === '/api/metrics') return send(req, res, 200, await store.read());
        const body = await parseBody(req);
        if (pathname === '/api/quiz/submit') {
          const topic = textField(body, 'topic', 100, true);
          if (!['pre', 'post'].includes(body.type) || typeof body.correct !== 'boolean' ||
            (topic !== 'general' && !topics.some((entry) => entry.slug === topic))) throw error(400, 'Invalid quiz submission');
          await store.mutate((metrics) => { metrics.totalUsersServed++; });
          return send(req, res, 200, { success: true, message: 'Anonymous response recorded' });
        }
        if (pathname === '/api/feedback') {
          const comment = textField(body, 'comment', 300, true);
          const topic = textField(body, 'topic', 100) || 'General Health';
          if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) throw error(400, 'Rating must be 1 through 5');
          if (validateHealthPrompt(comment + ' ' + topic).reason === 'pii_detected') throw error(400, 'Do not include personal identifying information');
          await store.mutate((metrics) => {
            metrics.anonymousFeedback.unshift({ id: randomUUID(), date: new Date().toISOString().slice(0, 10), topic, rating: body.rating, comment });
            metrics.anonymousFeedback = metrics.anonymousFeedback.slice(0, 100);
          });
          return send(req, res, 200, { success: true });
        }
        if (pathname === '/api/telemetry') {
          if (!['LCP', 'INP', 'CLS', 'JS_ERROR'].includes(body.name) || typeof body.value !== 'number' ||
            !Number.isFinite(body.value) || body.value < 0 || body.value > (body.name === 'CLS' ? 100 : 600000)) throw error(400, 'Invalid performance measurement');
          await store.mutate((metrics) => {
            metrics.performance ||= {};
            const entry = metrics.performance[body.name] ||= { count: 0, total: 0, max: 0 };
            entry.count++; entry.total += body.value; entry.max = Math.max(entry.max, body.value);
          });
          return send(req, res, 202, { success: true });
        }
        if (pathname === '/api/ai/summarize') {
          const userPrompt = textField(body, 'userPrompt', 2000);
          textField(body, 'topicTitle', 200);
          textField(body, 'articleContent', 20000);
          if (body.locale !== undefined && !['en', 'es', 'tr'].includes(body.locale)) throw error(400, 'Invalid locale');
          if (body.keyTakeaways !== undefined && (!Array.isArray(body.keyTakeaways) || body.keyTakeaways.length > 20 || body.keyTakeaways.some((value) => typeof value !== 'string' || value.length > 1000))) throw error(400, 'Invalid keyTakeaways');
          // Citations come from the reviewed catalog, never caller-supplied HTML or URLs.
          const topic = topics.find((entry) => Object.values(entry.translations).some((t) => t.title === body.topicTitle));
          const vettedSources = topic ? (topic.translations[body.locale || locale] || topic.translations.en).vettedSources : [];
          if (userPrompt) {
            const result = validateHealthPrompt(userPrompt);
            if (!result.isSafe) return send(req, res, 200, formatSafeResponse(result.fallback, vettedSources, true));
          }
          return send(req, res, 200, summarize({ ...body, vettedSources }));
        }
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); throw error(405, 'Method not allowed'); }
      if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some((part) => part === '..' || part.startsWith('.'))) throw error(404, 'Not found');
      let publicPath = pathname === '/' ? '/index.html' : pathname;
      const publicFile = /^(?:\/(?:index\.html|offline\.html|manifest\.json|icon\.svg|icon-(?:192|512)\.png|sw\.js)|\/assets\/[a-zA-Z0-9.-]+\.(?:css|js|svg)|\/css\/style\.css|\/js\/(?:app|guardrails|platform|web-vitals)\.js|\/data\/(?:topics|clinics|quizzes|translations|metrics)\.json)$/;
      if (!publicFile.test(publicPath)) {
        if (/^\/(?:en|es|tr|topics|clinics|ethics|admin)(?:\/[a-z0-9-]+)?\/?$/.test(publicPath)) publicPath = '/index.html';
        else throw error(404, 'Not found');
      }
      let file = path.join(webRoot, publicPath);
      if (webRoot === __dirname && publicPath === '/js/web-vitals.js') file = path.join(__dirname, 'node_modules/web-vitals/dist/web-vitals.iife.js');
      let content;
      try { content = await fs.promises.readFile(file); } catch { throw error(404, 'Not found'); }
      const immutable = /^\/assets\/.+\.[a-f0-9]{12}\.(css|js|svg)$/.test(publicPath);
      return send(req, res, 200, content, MIME[path.extname(file)], immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
    } catch (err) {
      const status = err instanceof URIError ? 400 : err.status || 500;
      if (status >= 500) log({ event: 'server_error', route, status });
      if (!res.headersSent) send(req, res, status, { error: status >= 500 ? 'Service temporarily unavailable' : err.message });
      else res.end();
    } finally { if (acquired) inFlight--; }
  }
  handle.store = store;
  return handle;
}
function createServer(options) {
  const handler = createHandler(options);
  const server = http.createServer(handler);
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.on('close', () => handler.store.close());
  return server;
}
if (require.main === module) {
  const server = createServer();
  server.listen(Number(process.env.PORT || 3000), () => console.log(`HealthBridge listening on http://localhost:${server.address().port}`));
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => server.close());
}
module.exports = { createHandler, createServer };
