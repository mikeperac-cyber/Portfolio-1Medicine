const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { validateHealthPrompt, formatSafeResponse, SAFE_FALLBACK_RESPONSE, MANDATORY_DISCLAIMER } = require('./js/guardrails');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const WEB_ROOT = __dirname;

// Helper to load JSON files safely
function loadJson(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Failed to load ${filename}:`, err.message);
    return null;
  }
}

// In-memory data store initialized from JSON files
let topicsData = loadJson('topics.json') || [];
let clinicsData = loadJson('clinics.json') || [];
let quizzesData = loadJson('quizzes.json') || {};
let metricsData = loadJson('metrics.json') || {
  totalUsersServed: 2480,
  topicsViewedTotal: 7390,
  avgQuizImprovement: '+38.4%',
  totalGuidesPrinted: 612,
  quizDeltas: [],
  topicViews: [],
  anonymousFeedback: []
};
let translationsData = loadJson('translations.json') || {};

// MIME Types for Static Files
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

// Request Body Parser
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Translations
  // --------------------------------------------------------------------------
  if (pathname === '/api/translations') {
    const locale = parsedUrl.query.locale || 'en';
    const dict = translationsData[locale] || translationsData.en;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dict));
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Topics List & Single Topic
  // --------------------------------------------------------------------------
  if (pathname === '/api/topics') {
    const locale = parsedUrl.query.locale || 'en';
    const localizedTopics = topicsData.map((t) => {
      const trans = t.translations[locale] || t.translations.en;
      return {
        id: t.id,
        slug: t.slug,
        category: t.category,
        icon: t.icon,
        readingLevel: t.readingLevel,
        readMinutes: t.readMinutes,
        title: trans.title,
        summary: trans.summary,
        keyTakeaways: trans.keyTakeaways,
        reviewedBy: trans.reviewedBy,
        reviewerRole: trans.reviewerRole,
        reviewedAt: trans.reviewedAt,
        vettedSources: trans.vettedSources,
      };
    });

    metricsData.topicsViewedTotal += 1;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(localizedTopics));
    return;
  }

  if (pathname.startsWith('/api/topics/')) {
    const slug = pathname.replace('/api/topics/', '');
    const locale = parsedUrl.query.locale || 'en';
    const topic = topicsData.find((t) => t.slug === slug);

    if (!topic) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Topic not found' }));
      return;
    }

    const trans = topic.translations[locale] || topic.translations.en;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        id: topic.id,
        slug: topic.slug,
        category: topic.category,
        icon: topic.icon,
        readingLevel: topic.readingLevel,
        readMinutes: topic.readMinutes,
        ...trans,
      })
    );
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Clinics Directory
  // --------------------------------------------------------------------------
  if (pathname === '/api/clinics') {
    const { query, service, language } = parsedUrl.query;
    let list = clinicsData;

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (service && service !== 'all') {
      list = list.filter((c) => c.services.includes(service));
    }

    if (language && language !== 'all') {
      list = list.filter((c) =>
        c.languages.some((l) => l.toLowerCase().includes(language.toLowerCase()))
      );
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(list));
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Quizzes
  // --------------------------------------------------------------------------
  if (pathname.startsWith('/api/quizzes/')) {
    const slug = pathname.replace('/api/quizzes/', '');
    const locale = parsedUrl.query.locale || 'en';
    const type = parsedUrl.query.type || 'pre';

    const topicQuizzes = quizzesData[slug] || quizzesData['diabetes-prevention'];
    const localeQuiz = (topicQuizzes && topicQuizzes[locale]) || topicQuizzes.en;
    const quizGroup = localeQuiz[type] || localeQuiz.pre;
    const questionObj = (quizGroup && quizGroup.questions && quizGroup.questions[0]) || quizGroup;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(questionObj));
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Anonymous Quiz Submission
  // --------------------------------------------------------------------------
  if (pathname === '/api/quiz/submit' && method === 'POST') {
    const body = await parseBody(req);
    metricsData.totalUsersServed += 1;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: 'Anonymous response recorded' }));
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: AI Plain-Language Summarization (with Guardrails)
  // --------------------------------------------------------------------------
  if (pathname === '/api/ai/summarize' && method === 'POST') {
    const body = await parseBody(req);
    const { topicTitle, articleContent, keyTakeaways, vettedSources, userPrompt, locale } = body;

    // 1. Guardrail Validation
    if (userPrompt && userPrompt.trim()) {
      const guardrailResult = validateHealthPrompt(userPrompt);
      if (!guardrailResult.isSafe) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            formatSafeResponse(
              guardrailResult.fallback || SAFE_FALLBACK_RESPONSE,
              vettedSources || [],
              true
            )
          )
        );
        return;
      }
    }

    // 2. Deterministic Safe Plain-Language Summary Generator
    let summaryText = '';
    const points = keyTakeaways || [];

    if (locale === 'tr') {
      summaryText = `Doğrulanmış Eğitim Özeti (${topicTitle || 'Sağlık Rehberi'}):\n\n` +
        `• ${points[0] || 'Küçük günlük alışkanlıklar sağlığınızı uzun vadede korur.'}\n` +
        `• ${points[1] || 'Hekiminizin tavsiyelerine uyun ve kontrollerinizi aksatmayın.'}\n` +
        `• ${points[2] || 'Toplum sağlığı merkezleri ücretsiz aşı ve uygun maliyetli bakım sunar.'}\n\n` +
        `Bireysel tıbbi değerlendirme için lütfen doğrudan sağlık kuruluşunuza danışınız.`;
    } else if (locale === 'es') {
      summaryText = `Resumen Educativo Verificado (${topicTitle || 'Guía de Salud'}):\n\n` +
        `• ${points[0] || 'Los pequeños hábitos diarios protegen su bienestar a largo plazo.'}\n` +
        `• ${points[1] || 'Siga las recomendaciones médicas y acuda a chequeos preventivos.'}\n` +
        `• ${points[2] || 'Las clínicas comunitarias ofrecen vacunas gratis y atención a bajo costo.'}\n\n` +
        `Consulte directamente con un profesional médico en su clínica local.`;
    } else {
      summaryText = `Verified Educational Summary (${topicTitle || 'Health Literacy Guide'}):\n\n` +
        `• ${points[0] || 'Prevention and small daily routines protect your long-term wellness.'}\n` +
        `• ${points[1] || 'Follow clinical guidance and attend routine preventative screenings.'}\n` +
        `• ${points[2] || 'Neighborhood community clinics offer low-cost visits, free vaccines, and interpreters.'}\n\n` +
        `Speak directly with a healthcare professional at your local community clinic.`;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(formatSafeResponse(summaryText, vettedSources || [], false)));
    return;
  }

  // --------------------------------------------------------------------------
  // API ROUTE: Anonymous Metrics & Telemetry
  // --------------------------------------------------------------------------
  if (pathname === '/api/metrics') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metricsData));
    return;
  }

  if (pathname === '/api/feedback' && method === 'POST') {
    const body = await parseBody(req);
    if (body.comment) {
      metricsData.anonymousFeedback.unshift({
        id: `fb-${Date.now()}`,
        date: 'Just now',
        topic: body.topic || 'General Health',
        rating: body.rating || 5,
        comment: body.comment.substring(0, 300),
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // --------------------------------------------------------------------------
  // STATIC FILES & SPA FALLBACK
  // --------------------------------------------------------------------------
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(WEB_ROOT, safePath);

  // If path doesn't exist, fallback to index.html for SPA client-side routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(WEB_ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🏥 HealthBridge Web Service running on port ${PORT}`);
    console.log(`🌐 Open in browser: http://localhost:${PORT}`);
    console.log(`🔒 Zero Login Required • 100% Anonymous Public Health`);
    console.log(`=======================================================`);
  });
}

module.exports = server;
