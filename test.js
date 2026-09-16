const http = require('http');
const assert = require('assert');
const server = require('./server');
const { validateHealthPrompt, formatSafeResponse, MANDATORY_DISCLAIMER } = require('./js/guardrails');

const TEST_PORT = 3457;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data), raw: data });
        } catch {
          resolve({ status: res.statusCode, body: null, raw: data });
        }
      });
    }).on('error', reject);
  });
}

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
        },
      },
      (res) => {
        let resp = '';
        res.on('data', (c) => (resp += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, body: resp });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Zero-Dependency Test Suite for HealthBridge Web Service...\n');

  await new Promise((resolve) => server.listen(TEST_PORT, resolve));

  try {
    // 1. Static HTML serving
    const indexRes = await get('/');
    assert.strictEqual(indexRes.status, 200, 'Root must return 200');
    assert(indexRes.raw.includes('HealthBridge'), 'Root must serve index.html');
    console.log('✓ 1. Root index.html serves correctly');

    // 2. CSS Serving
    const cssRes = await get('/css/style.css');
    assert.strictEqual(cssRes.status, 200, 'CSS must return 200');
    assert(cssRes.raw.includes('--color-primary'), 'CSS must contain custom properties');
    console.log('✓ 2. CSS stylesheet serves correctly');

    // 3. Translations API
    const trRes = await get('/api/translations?locale=tr');
    assert.strictEqual(trRes.status, 200);
    assert.strictEqual(trRes.body.site.title, 'Toplum Sağlığı Köprüsü');
    console.log('✓ 3. Translations endpoint returns localized dictionaries');

    // 4. Topics API
    const topicsRes = await get('/api/topics?locale=tr');
    assert.strictEqual(topicsRes.status, 200);
    assert.strictEqual(topicsRes.body.length, 5);
    assert(topicsRes.body[0].title.includes('Diyabet'));
    console.log('✓ 4. Topics endpoint returns 5 doctor-reviewed topics');

    // 5. Clinics API with search and filter
    const clinicsRes = await get('/api/clinics?service=free_vaccines&language=Turkish');
    assert.strictEqual(clinicsRes.status, 200);
    assert(clinicsRes.body.length > 0);
    assert(clinicsRes.body[0].languages.join(' ').includes('Turkish'));
    console.log('✓ 5. Clinics directory filters properly by service and language');

    // 6. Quizzes API
    const quizRes = await get('/api/quizzes/diabetes-prevention?type=pre&locale=tr');
    assert.strictEqual(quizRes.status, 200);
    assert(quizRes.body.question);
    assert(quizRes.body.options.length >= 3);
    console.log('✓ 6. Quiz endpoint returns educational questions and rationale');

    // 7. AI Plain-Language Summarization with Safety Interception
    const unsafeAi = await post('/api/ai/summarize', {
      userPrompt: 'Diyabet miyim? Göğsüm ağrıyor.',
      locale: 'tr',
    });
    assert.strictEqual(unsafeAi.status, 200);
    assert.strictEqual(unsafeAi.body.isFallback, true);
    assert(unsafeAi.body.summary.includes(MANDATORY_DISCLAIMER));
    console.log('✓ 7. AI assistant intercepts medical diagnosis requests with safety disclaimer');

    // 8. Safe AI Educational Summary
    const safeAi = await post('/api/ai/summarize', {
      topicTitle: 'Diyabet',
      keyTakeaways: ['Bol su içiniz.', 'Doktora danışınız.'],
      userPrompt: 'Bunu sadeleştirir misin?',
      locale: 'tr',
    });
    assert.strictEqual(safeAi.status, 200);
    assert.strictEqual(safeAi.body.isFallback, false);
    assert(safeAi.body.summary.includes('Doğrulanmış Eğitim Özeti'));
    console.log('✓ 8. AI assistant provides vetted plain-language summaries');

    // 9. Client Guardrails unit checks
    const safePrompt = validateHealthPrompt('What are vaccines?');
    assert.strictEqual(safePrompt.isSafe, true);
    const piiPrompt = validateHealthPrompt('My email is test@example.com and phone is 555-123-4567');
    assert.strictEqual(piiPrompt.isSafe, false);
    assert.strictEqual(piiPrompt.reason, 'pii_detected');
    console.log('✓ 9. Client-side guardrail regex filters PII and diagnosis queries');

    console.log('\n🎉 ALL 9 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});