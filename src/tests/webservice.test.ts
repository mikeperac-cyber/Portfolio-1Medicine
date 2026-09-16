import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import server from '../../server';
import { validateHealthPrompt, formatSafeResponse, MANDATORY_DISCLAIMER } from '../../public/js/guardrails';

let testPort = 3456;
let baseUrl = `http://localhost:${testPort}`;

function requestGet(path: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 500, body: data });
        }
      });
    }).on('error', reject);
  });
}

function requestPost(path: string, payload: any): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const req = http.request(
      `${baseUrl}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

describe('HealthBridge Web Service REST API & Safety Guardrails', () => {
  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(testPort, () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  it('GET /api/translations returns dictionary for en, es, and tr', async () => {
    const enRes = await requestGet('/api/translations?locale=en');
    expect(enRes.status).toBe(200);
    expect(enRes.body.site.title).toBe('Community Health Bridge');

    const esRes = await requestGet('/api/translations?locale=es');
    expect(esRes.status).toBe(200);
    expect(esRes.body.site.title).toBe('Salud Comunitaria');

    const trRes = await requestGet('/api/translations?locale=tr');
    expect(trRes.status).toBe(200);
    expect(trRes.body.site.title).toBe('Toplum Sağlığı Köprüsü');
  });

  it('GET /api/topics returns 5 vetted health topics with plain language and clinical reviewers', async () => {
    const res = await requestGet('/api/topics?locale=tr');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(5);
    const diabetes = res.body.find((t: any) => t.slug === 'diabetes-prevention');
    expect(diabetes).toBeDefined();
    expect(diabetes.title).toContain('Diyabet');
    expect(diabetes.readingLevel).toContain('Grade 5');
    expect(diabetes.reviewedBy).toContain('Dr.');
  });

  it('GET /api/clinics supports search filtering and language filtering', async () => {
    const resAll = await requestGet('/api/clinics');
    expect(resAll.status).toBe(200);
    expect(resAll.body.length).toBeGreaterThanOrEqual(4);

    const resFiltered = await requestGet('/api/clinics?service=free_vaccines&language=Turkish');
    expect(resFiltered.status).toBe(200);
    expect(resFiltered.body.length).toBeGreaterThan(0);
    expect(resFiltered.body[0].languages.join(' ')).toContain('Turkish');
  });

  it('GET /api/quizzes returns educational pre and post quizzes with rationale', async () => {
    const res = await requestGet('/api/quizzes/diabetes-prevention?type=pre&locale=tr');
    expect(res.status).toBe(200);
    expect(res.body.question).toBeDefined();
    expect(res.body.options.length).toBeGreaterThanOrEqual(3);
    expect(res.body.explanation).toBeDefined();
  });

  it('POST /api/quiz/submit records anonymous quiz telemetry without PII', async () => {
    const res = await requestPost('/api/quiz/submit', { type: 'pre', correct: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/ai/summarize strictly intercepts diagnosis attempts and attaches mandatory disclaimer', async () => {
    // Malicious diagnosis attempt
    const res = await requestPost('/api/ai/summarize', {
      userPrompt: 'Diyabet miyim? Göğsüm ağrıyor ve acil servise gitmeli miyim?',
      locale: 'tr',
    });
    expect(res.status).toBe(200);
    expect(res.body.isFallback).toBe(true);
    expect(res.body.disclaimer).toBe(MANDATORY_DISCLAIMER);
    expect(res.body.summary).toContain(MANDATORY_DISCLAIMER);
  });

  it('POST /api/ai/summarize safely simplifies vetted text for educational queries', async () => {
    const res = await requestPost('/api/ai/summarize', {
      topicTitle: 'Diyabet',
      keyTakeaways: ['Su içiniz.', 'Doktora danışınız.'],
      userPrompt: 'Bunu daha sade açıklar mısın?',
      locale: 'tr',
    });
    expect(res.status).toBe(200);
    expect(res.body.isFallback).toBe(false);
    expect(res.body.disclaimer).toBe(MANDATORY_DISCLAIMER);
    expect(res.body.summary).toContain('Doğrulanmış Eğitim Özeti');
  });

  it('GET /api/metrics returns real-time anonymous impact telemetry', async () => {
    const res = await requestGet('/api/metrics');
    expect(res.status).toBe(200);
    expect(res.body.totalUsersServed).toBeGreaterThan(0);
    expect(res.body.avgQuizImprovement).toBe('+38.4%');
    expect(res.body.topicViews.length).toBeGreaterThan(0);
  });

  it('Client-side guardrails function validates prompts properly', () => {
    const safeCheck = validateHealthPrompt('Can you explain vaccines simply?');
    expect(safeCheck.isSafe).toBe(true);

    const diagnosisCheck = validateHealthPrompt('Do I have cancer?');
    expect(diagnosisCheck.isSafe).toBe(false);
    expect(diagnosisCheck.reason).toBe('diagnosis_attempt');

    const piiCheck = validateHealthPrompt('My SSN is 123-45-6789 and name is John Doe');
    expect(piiCheck.isSafe).toBe(false);
    expect(piiCheck.reason).toBe('pii_detected');
  });
});
