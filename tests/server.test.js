const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { createServer } = require('../server');
const { createStore } = require('../lib/store');
const { validateHealthPrompt, MANDATORY_DISCLAIMER } = require('../js/guardrails');

async function fixture(t, options = {}) {
  const server = createServer({ store: createStore({ databaseUrl: '', filename: ':memory:' }), log: () => {}, ...options });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  return (url, settings = {}) => new Promise((resolve, reject) => {
    const body = settings.body === undefined ? undefined : typeof settings.body === 'string' ? settings.body : JSON.stringify(settings.body);
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path: url, method: settings.method || (body ? 'POST' : 'GET'),
      headers: { ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}), ...settings.headers } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks);
        const text = raw.toString();
        let json; try { json = JSON.parse(text); } catch { /* binary or HTML */ }
        resolve({ status: res.statusCode, headers: res.headers, raw, text, json });
      });
    });
    req.on('error', reject); req.end(body);
  });
}

test('production HTML references minified assets and real manifest icons', async (t) => {
  const request = await fixture(t);
  const index = await request('/');
  assert.equal(index.status, 200);
  assert.match(index.headers['content-security-policy'], /script-src-attr 'none'/);
  assert.doesNotMatch(index.text, /\son(?:click|submit|input|change)=/);
  for (const url of [...index.text.matchAll(/(?:src|href)="(\/assets\/[^"#]+)"/g)].map((match) => match[1])) {
    const asset = await request(url);
    assert.equal(asset.status, 200, url);
    assert.match(asset.headers['cache-control'], /31536000, immutable/);
    assert.equal((await request(url, { headers: { 'If-None-Match': asset.headers.etag } })).status, 304);
    assert.equal((await request(url, { method: 'HEAD' })).raw.length, 0);
  }
  const manifest = (await request('/manifest.json')).json;
  assert.equal(manifest.start_url, '/#/');
  for (const icon of manifest.icons) {
    const response = await request(icon.src);
    assert.equal(response.status, 200);
    assert.equal(response.headers['content-type'], 'image/png');
    assert.equal(response.raw.subarray(1, 4).toString(), 'PNG');
  }
});

test('gzip and Brotli preserve static and API response contents; q=0 is honored', async (t) => {
  const request = await fixture(t);
  for (const url of ['/', '/api/topics?locale=tr']) {
    const plain = await request(url);
    for (const [encoding, decode] of [['gzip', zlib.gunzipSync], ['br', zlib.brotliDecompressSync]]) {
      const response = await request(url, { headers: { 'Accept-Encoding': encoding } });
      assert.equal(response.headers['content-encoding'], encoding);
      assert.match(response.headers.vary, /Accept-Encoding/i);
      assert.deepEqual(decode(response.raw), plain.raw);
      assert(response.raw.length < plain.raw.length);
    }
    assert.equal((await request(url, { headers: { 'Accept-Encoding': 'gzip;q=0, br;q=0, identity;q=1' } })).headers['content-encoding'], undefined);
  }
});

test('localized catalog, filters and safe ETag revalidation', async (t) => {
  const request = await fixture(t);
  const translations = await request('/api/translations?locale=tr');
  assert.equal(translations.json.site.title, 'Toplum Sağlığı Köprüsü');
  const cached = await request('/api/translations?locale=tr', { headers: { 'If-None-Match': translations.headers.etag } });
  assert.equal(cached.status, 304); assert.equal(cached.raw.length, 0);
  assert.equal((await request('/api/translations?locale=es', { headers: { 'If-None-Match': translations.headers.etag } })).status, 200);
  const topics = await request('/api/topics?locale=tr');
  assert.equal(topics.json.length, 5); assert.match(topics.json[0].title, /Diyabet/);
  const detail = await request('/api/topics/diabetes-prevention?locale=tr');
  assert(detail.json.content);
  const clinics = (await request('/api/clinics?service=free_vaccines&language=Turkish')).json;
  assert(clinics.length); assert(clinics.every((clinic) => clinic.languages.some((language) => language.includes('Turkish'))));
  const quiz = (await request('/api/quizzes/diabetes-prevention?type=pre&locale=tr')).json;
  assert(quiz.question); assert(quiz.options.length >= 3);
  assert.equal((await request('/api/quizzes/__proto__')).status, 404);
});

test('private paths and unknown APIs cannot fall through to the SPA', async (t) => {
  const request = await fixture(t);
  for (const url of ['/server.js', '/package.json', '/.env.local', '/.git/config', '/lib/store.js', '/storage/healthbridge.sqlite', '/node_modules/helmet/index.js', '/%2e%2e%5cserver.js', '/api/missing', '/missing.js']) {
    assert.equal((await request(url)).status, 404, url);
  }
  assert.equal((await request('/%ZZ')).status, 400);
  assert.equal((await request('/en')).status, 200);
  assert.equal((await request('/api/topics', { method: 'DELETE' })).status, 405);
});

test('body validation and CSRF rejection leave the server healthy', async (t) => {
  const request = await fixture(t);
  for (const body of ['{broken', 'null', '[]', '{"userPrompt":42}', '{"keyTakeaways":"invalid"}']) {
    assert.equal((await request('/api/ai/summarize', { body })).status, 400);
  }
  assert.equal((await request('/api/ai/summarize', { body: {}, headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await request('/api/ai/summarize', { body: { userPrompt: 'x'.repeat(33000) } })).status, 413);
  assert.equal((await request('/api/ai/summarize', { body: {}, headers: { Origin: 'https://attacker.example' } })).status, 403);
  assert.equal((await request('/api/ai/summarize', { body: {}, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await request('/api/health')).status, 200);
});

test('medical guardrails remain effective and summaries are never cached', async (t) => {
  const request = await fixture(t);
  const unsafe = await request('/api/ai/summarize', { body: { userPrompt: 'Diyabet miyim? Göğsüm ağrıyor.', locale: 'tr' } });
  assert.equal(unsafe.status, 200); assert.equal(unsafe.json.isFallback, true);
  assert(unsafe.json.summary.includes(MANDATORY_DISCLAIMER));
  assert.equal(unsafe.headers['cache-control'], 'no-store');
  const safe = await request('/api/ai/summarize', { body: { userPrompt: 'Explain the guide', topicTitle: 'Diyabet', keyTakeaways: ['Bol su içiniz.'], locale: 'tr', vettedSources: [{ organization: '<script>alert(1)</script>' }] } });
  assert.equal(safe.json.isFallback, false); assert.match(safe.json.summary, /Doğrulanmış/); assert.deepEqual(safe.json.citations, []);
  assert.equal(validateHealthPrompt('My email is person@example.com').reason, 'pii_detected');
});

test('valid submissions persist and invalid fields cannot mutate metrics', async (t) => {
  const request = await fixture(t);
  const before = (await request('/api/metrics')).json;
  assert.equal((await request('/api/quiz/submit', { body: { topic: 'diabetes-prevention', type: 'pre', correct: true } })).status, 200);
  assert.equal((await request('/api/quiz/submit', { body: { topic: 'missing', type: 'pre', correct: true } })).status, 400);
  assert.equal((await request('/api/feedback', { body: { comment: 'Helpful guide', topic: 'Prevention', rating: 5 } })).status, 200);
  assert.equal((await request('/api/feedback', { body: { comment: 'person@example.com', rating: 5 } })).status, 400);
  assert.equal((await request('/api/feedback', { body: { comment: {}, rating: 5 } })).status, 400);
  assert.equal((await request('/api/telemetry', { body: { name: 'INP', value: 42 } })).status, 202);
  assert.equal((await request('/api/telemetry', { body: { name: '__proto__', value: 42 } })).status, 400);
  const after = await request('/api/metrics');
  assert.equal(after.json.totalUsersServed, before.totalUsersServed + 1);
  assert.equal(after.json.anonymousFeedback[0].comment, 'Helpful guide');
  assert.equal(after.json.performance.INP.count, 1);
  assert.equal(after.headers['cache-control'], 'no-store');
});

test('rate limits return Retry-After and cannot be bypassed with forwarded headers', async (t) => {
  const request = await fixture(t, { rateLimit: 2 });
  assert.equal((await request('/api/topics')).status, 200);
  assert.equal((await request('/api/topics')).status, 200);
  const response = await request('/api/topics', { headers: { 'X-Forwarded-For': '1.2.3.4' } });
  assert.equal(response.status, 429); assert(Number(response.headers['retry-after']) > 0);
});

test('SQLite survives restart, concurrent updates do not lose increments', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'healthbridge-'));
  const filename = path.join(directory, 'test.sqlite');
  const store = createStore({ databaseUrl: '', filename });
  const seed = await store.read();
  await Promise.all(Array.from({ length: 20 }, () => store.mutate((metrics) => metrics.totalUsersServed++)));
  await store.close();
  const reopened = createStore({ databaseUrl: '', filename });
  try { assert.equal((await reopened.read()).totalUsersServed, seed.totalUsersServed + 20); }
  finally { await reopened.close(); await fs.rm(directory, { recursive: true, force: true }); }
});

test('service worker precaches only public files and bypasses writes and APIs', async () => {
  const worker = await fs.readFile(path.join(__dirname, '../dist/sw.js'), 'utf8');
  const vm = require('node:vm');
  const listeners = {};
  const context = { self: { addEventListener: (name, callback) => { listeners[name] = callback; }, location: { origin: 'https://healthbridge.test' } }, URL };
  vm.runInNewContext(worker, context);
  for (const [method, url] of [['POST', '/api/quiz/submit'], ['GET', '/api/metrics'], ['GET', '/data/metrics.json']]) {
    listeners.fetch({ request: { method, url: 'https://healthbridge.test' + url }, respondWith: () => assert.fail(`must not intercept ${url}`) });
  }
  const paths = JSON.parse(worker.match(/const PRECACHE = (\[.+\]);/)[1]);
  for (const url of paths) await fs.access(path.join(__dirname, '../dist', url));
  assert(paths.includes('/data/topics.json'));
  assert(!paths.some((url) => url.startsWith('/api/')));
  assert.match(worker, /healthbridge-[a-f0-9]{12}/);
});
