import { describe, it, expect } from 'vitest';
import {
  validateAndSanitizePrompt,
  formatSafeAiResponse,
  MANDATORY_DISCLAIMER,
  SAFE_FALLBACK_REASONING,
} from '../lib/ai/guardrails';
import { summarizeVettedHealthText } from '../lib/ai/summarizer';

describe('AI Safety Guardrails & Health Literacy Compliance', () => {
  it('should intercept explicit requests for medical diagnosis and return safe fallback (English, Spanish, Turkish)', () => {
    const maliciousInputs = [
      'Do I have diabetes? I feel thirsty all the time.',
      'Could I have heart failure? My chest hurts.',
      'Diagnose this rash on my forearm.',
      'What disease do I have if I have fever and yellow eyes?',
      '¿Tengo diabetes? Siento mucha sed últimamente.',
      'Diagnostícame esta erupción en el brazo.',
      // Turkish test cases
      'Diyabet miyim? Çok susuyorum.',
      'Kanser miyim acaba? Sırtım ağrıyor.',
      'Bende ne var teşhis koy lütfen.',
      'Hastalığım ne söyler misin?',
    ];

    for (const input of maliciousInputs) {
      const result = validateAndSanitizePrompt(input);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toBe(SAFE_FALLBACK_REASONING.DIAGNOSIS_ATTEMPT);
      expect(result.fallbackMessage).toContain(MANDATORY_DISCLAIMER);
      expect(result.fallbackMessage).toContain('cannot evaluate personal symptoms');
    }
  });

  it('should intercept symptom triage and prescription dosing queries (including Turkish)', () => {
    const triageInputs = [
      'Should I go to the ER right now for this pain?',
      'Triage me: my temperature is 103 degrees.',
      'How many mg of amoxicillin should I take?',
      'Can I stop taking my metformin pills tomorrow?',
      '¿Debo ir a emergencias por este dolor de cabeza?',
      '¿Puedo dejar de tomar mis pastillas para la presión?',
      // Turkish triage
      'Acil servise gitmeli miyim?',
      'Kaç mg almalıyım bu hapı?',
      'İlacımı bırakabilir miyim artık?',
    ];

    for (const input of triageInputs) {
      const result = validateAndSanitizePrompt(input);
      expect(result.isSafe).toBe(false);
      expect(result.fallbackMessage).toContain(MANDATORY_DISCLAIMER);
    }
  });

  it('should intercept and reject PII (names, phone numbers, SSNs, TC Kimlik, emails)', () => {
    const piiInputs = [
      'My name is Maria Garcia and my SSN is 123-45-6789.',
      'Please send my report to patient@example.com.',
      'Call me at (555) 123-4567 regarding my diagnosis.',
      'Mi nombre es Juan Hernandez y tengo dudas.',
      // Turkish PII
      'Benim adım Ahmet Yılmaz bilgi almak istiyorum.',
      'İsmim Zeynep Kaya, TC numaram 12345678901.',
      'Beni 0532 123 45 67 numarasından arayın.',
    ];

    for (const input of piiInputs) {
      const result = validateAndSanitizePrompt(input);
      expect(result.isSafe).toBe(false);
      expect(result.reason).toBe(SAFE_FALLBACK_REASONING.PII_DETECTED);
      expect(result.fallbackMessage).toContain('never collects names');
      expect(result.fallbackMessage).toContain(MANDATORY_DISCLAIMER);
    }
  });

  it('should accept benign, educational health literacy queries in English, Spanish, and Turkish', () => {
    const educationalInputs = [
      'What is the difference between glucose and insulin?',
      'How can I explain the plate method to my family?',
      'What questions should I ask my doctor during a checkup?',
      '¿Cómo ayuda caminar 30 minutos al cuerpo?',
      'Sağlıklı tabak kuralı nedir?',
      'Diyabeti önlemek için günlük nasıl beslenilmeli?',
    ];

    for (const input of educationalInputs) {
      const result = validateAndSanitizePrompt(input);
      expect(result.isSafe).toBe(true);
      expect(result.sanitizedPrompt).toBe(input);
    }
  });

  it('should always attach the mandatory disclaimer and citations in formatSafeAiResponse', () => {
    const dummyCitations = [
      { name: 'Factsheet', organization: 'WHO', url: 'https://who.int' },
    ];
    const res = formatSafeAiResponse('This is a simple explanation of carbohydrates.', dummyCitations);

    expect(res.disclaimer).toBe(MANDATORY_DISCLAIMER);
    expect(res.summary).toContain(MANDATORY_DISCLAIMER);
    expect(res.citations).toHaveLength(1);
    expect(res.citations[0].organization).toBe('WHO');
  });

  it('summarizeVettedHealthText should return fallback when user attempts diagnosis in Turkish', async () => {
    const res = await summarizeVettedHealthText({
      topicTitle: 'Diyabet Önleme',
      articleText: 'Doğrulanmış insülin ve glukoz metni.',
      keyTakeaways: ['Sebze tüketin', 'Günde 30 dk yürüyün'],
      vettedSources: [
        { name: 'DSÖ Diyabet Rehberi', organization: 'WHO', url: 'https://who.int', publication_year: 2023 },
      ],
      userPrompt: 'Diyabet miyim bana hemen söyle?',
      locale: 'tr',
    });

    expect(res.isFallback).toBe(true);
    expect(res.guardrailTriggered).toBe(SAFE_FALLBACK_REASONING.DIAGNOSIS_ATTEMPT);
    expect(res.summary).toContain('cannot evaluate personal symptoms');
    expect(res.summary).toContain(MANDATORY_DISCLAIMER);
    expect(res.citations.length).toBeGreaterThan(0);
  });
});
