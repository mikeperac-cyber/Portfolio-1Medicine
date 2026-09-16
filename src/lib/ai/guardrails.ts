export const MANDATORY_DISCLAIMER = 'Educational only; not medical advice.';

export const SAFE_FALLBACK_REASONING = {
  DIAGNOSIS_ATTEMPT: 'diagnosis_attempt',
  TRIAGE_ATTEMPT: 'triage_attempt',
  PII_DETECTED: 'pii_detected',
  PRESCRIPTION_ADVICE: 'prescription_advice',
  OUT_OF_BOUNDS: 'out_of_bounds',
} as const;

export const SAFE_FALLBACK_RESPONSE = `This system is designed solely to explain official public health guidelines in plain language. For your safety, it cannot evaluate personal symptoms, provide a medical diagnosis, or recommend medication dosages.

If you are experiencing severe symptoms, please call 911 or visit your nearest emergency department immediately.
For confidential emotional support, call or text 988.
To discuss your individual health needs with a trusted clinician, explore our free and low-cost Community Clinic Directory.

${MANDATORY_DISCLAIMER}`;

// Regex patterns to intercept diagnosis, triage, and personal medical queries
const DIAGNOSIS_PATTERNS = [
  /\b(do i have|could i have|might i have|am i suffering from)\b/i,
  /\b(diagnos(e|is|ing)|what disease|what condition|what is wrong with me)\b/i,
  /\b(i have a rash|my chest hurts|lump on my|blood in my|severe pain in)\b/i,
  /\b(symptom triage|triage me|should i go to the er|is this an emergency)\b/i,
  /\b(what pills should i take|how many mg|change my dose|stop taking my)\b/i,
  // Spanish patterns
  /(tengo diabetes|tengo c[aá]ncer|qu[eé] enfermedad tengo|diagnost[ií]came)/i,
  /(me duele el pecho|tengo una erupci[oó]n|debo ir a emergencias)/i,
  /(qu[eé] dosis tomo|puedo dejar de tomar)/i,
  // Turkish patterns (with Turkish Unicode character tolerance)
  /(diyabet miyim|şeker hastası mıyım|kanser miyim|hastalığım ne|teşhis koy|bende ne var)/iu,
  /(göğsüm ağrıyor|döküntüm var|nefes alamıyorum|acil servise|acil servis)/iu,
  /(kaç mg|dozu artır|[iİıI]lac[ıi]m[ıi] b[ıi]rak|[iİıI]lac[ıi] b[ıi]rak)/iu,
];

// PII patterns (names with titles, SSN, phone numbers, email addresses)
const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // US SSN
  /\b\d{11}\b/, // TC Kimlik No (11 digits)
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US Phone
  /\b(?:\+?90[-.\s]?)?0?5\d{2}[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}\b/, // TR Phone
  /\b(my name is|me llamo|mi nombre es|benim adım|adım|ismim)\s+([A-Za-zÇçĞğİıÖöŞşÜü]+(\s+[A-Za-zÇçĞğİıÖöŞşÜü]+)?)\b/iu, // Name declaration
  /\b(medical record|mrn|patient id|dosya no|hasta no)[:\s]*\d+\b/iu, // MRN
];

export interface GuardrailValidationResult {
  isSafe: boolean;
  reason?: string;
  sanitizedPrompt: string;
  fallbackMessage?: string;
}

export function validateAndSanitizePrompt(rawPrompt: string): GuardrailValidationResult {
  const trimmed = (rawPrompt || '').trim();

  if (!trimmed) {
    return {
      isSafe: false,
      reason: SAFE_FALLBACK_REASONING.OUT_OF_BOUNDS,
      sanitizedPrompt: '',
      fallbackMessage: `Please enter a question about the health topic text.\n\n${MANDATORY_DISCLAIMER}`,
    };
  }

  // 1. Check for PII
  for (const pattern of PII_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isSafe: false,
        reason: SAFE_FALLBACK_REASONING.PII_DETECTED,
        sanitizedPrompt: '',
        fallbackMessage: `To protect your privacy, this platform never collects names, phone numbers, or personal identifying information. Please remove personal details and ask an educational question about the topic.\n\n${MANDATORY_DISCLAIMER}`,
      };
    }
  }

  // 2. Check for Diagnosis / Symptom Triage / Prescription manipulation
  for (const pattern of DIAGNOSIS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isSafe: false,
        reason: SAFE_FALLBACK_REASONING.DIAGNOSIS_ATTEMPT,
        sanitizedPrompt: '',
        fallbackMessage: SAFE_FALLBACK_RESPONSE,
      };
    }
  }

  return {
    isSafe: true,
    sanitizedPrompt: trimmed,
  };
}

export interface AiSummaryResponse {
  summary: string;
  citations: Array<{ name: string; organization: string; url: string }>;
  disclaimer: string;
  isFallback: boolean;
  guardrailTriggered?: string;
}

export function formatSafeAiResponse(
  content: string,
  citations: Array<{ name: string; organization: string; url: string }> = [],
  isFallback: boolean = false,
  reason?: string
): AiSummaryResponse {
  const cleanContent = content.trim();
  const hasDisclaimer = cleanContent.includes(MANDATORY_DISCLAIMER);
  const finalSummary = hasDisclaimer ? cleanContent : `${cleanContent}\n\n${MANDATORY_DISCLAIMER}`;

  return {
    summary: finalSummary,
    citations,
    disclaimer: MANDATORY_DISCLAIMER,
    isFallback,
    guardrailTriggered: reason,
  };
}
