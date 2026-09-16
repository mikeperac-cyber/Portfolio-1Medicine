import {
  validateAndSanitizePrompt,
  formatSafeAiResponse,
  AiSummaryResponse,
  SAFE_FALLBACK_RESPONSE,
  MANDATORY_DISCLAIMER,
} from './guardrails';
import { VettedSource } from '../supabase/mock-data';

export interface SummarizeTopicInput {
  topicTitle: string;
  articleText: string;
  keyTakeaways: string[];
  vettedSources: VettedSource[];
  userPrompt?: string;
  locale?: 'en' | 'es' | 'tr';
}

export async function summarizeVettedHealthText(
  input: SummarizeTopicInput
): Promise<AiSummaryResponse> {
  const { topicTitle, articleText, keyTakeaways, vettedSources, userPrompt, locale = 'en' } = input;

  // 1. Enforce guardrails on user prompt if provided
  if (userPrompt && userPrompt.trim().length > 0) {
    const validation = validateAndSanitizePrompt(userPrompt);
    if (!validation.isSafe) {
      return formatSafeAiResponse(
        validation.fallbackMessage || SAFE_FALLBACK_RESPONSE,
        vettedSources,
        true,
        validation.reason
      );
    }
  }

  // 2. Check if an external LLM key is present (Gemini / OpenAI)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const systemInstruction = `You are a community health literacy assistant.
CRITICAL SAFETY RULES:
1. You may ONLY answer using the provided vetted article text below.
2. NEVER diagnose illnesses, triage symptoms, or tell anyone what disease they might have.
3. NEVER prescribe medications or advise altering dosages.
4. Keep explanations at a 5th-grade reading level using simple, compassionate language in ${locale === 'tr' ? 'Turkish' : locale === 'es' ? 'Spanish' : 'English'}.
5. You MUST include the exact sentence: "${MANDATORY_DISCLAIMER}" at the very end.`;

      const promptBody = `Vetted Health Explainer: "${topicTitle}"
---
${articleText}
---
Key Official Takeaways:
${keyTakeaways.map((t) => `- ${t}`).join('\n')}

User request: ${userPrompt || 'Please summarize this in 3 simple sentences for someone learning about this for the first time.'}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemInstruction}\n\n${promptBody}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const postValidation = validateAndSanitizePrompt(candidateText);
          if (!postValidation.isSafe) {
            return formatSafeAiResponse(SAFE_FALLBACK_RESPONSE, vettedSources, true, 'post_generation_flag');
          }
          return formatSafeAiResponse(candidateText, vettedSources, false);
        }
      }
    } catch (err) {
      console.warn('External LLM call failed, falling back to deterministic safe summarizer:', err);
    }
  }

  // 3. High-Fidelity Deterministic Safe Plain-Language Summarizer
  let summaryBody = '';

  if (locale === 'tr') {
    summaryBody = `Doğrulanmış Eğitim Özeti (${topicTitle}):\n\n` +
      `• ${keyTakeaways[0] || 'Önleyici adımlar ve günlük küçük alışkanlıklar sağlığınızı korur.'}\n` +
      `• ${keyTakeaways[1] || 'Hekiminizin tavsiyelerine uyun ve düzenli kontrollerinizi aksatmayın.'}\n` +
      `• ${keyTakeaways[2] || 'Toplum ve aile sağlığı merkezleri uygun maliyetli rehberlik ve aşılar sunar.'}\n\n` +
      `Kişisel tıbbi değerlendirme için lütfen doğrudan sağlık ocağınıza veya hekiminize danışınız.`;
  } else if (locale === 'es') {
    summaryBody = `Resumen Educativo Verificado (${topicTitle}):\n\n` +
      `• ${keyTakeaways[0] || 'La prevención y los hábitos diarios protegen su salud.'}\n` +
      `• ${keyTakeaways[1] || 'Siga las recomendaciones de su médico y acuda a chequeos regulares.'}\n` +
      `• ${keyTakeaways[2] || 'Su clínica local comunitaria ofrece orientación y vacunas a bajo costo.'}\n\n` +
      `Recuerde que puede consultar a su clínica comunitaria para una evaluación personalizada con un profesional médico.`;
  } else {
    summaryBody = `Verified Educational Summary (${topicTitle}):\n\n` +
      `• ${keyTakeaways[0] || 'Prevention and small daily routines protect your long-term wellness.'}\n` +
      `• ${keyTakeaways[1] || 'Follow clinical guidance and attend routine preventative screenings.'}\n` +
      `• ${keyTakeaways[2] || 'Neighborhood community clinics offer low-cost visits, free vaccines, and interpreters.'}\n\n` +
      `Speak directly with a healthcare professional at your local clinic for personalized care.`;
  }

  return formatSafeAiResponse(summaryBody, vettedSources, false);
}
