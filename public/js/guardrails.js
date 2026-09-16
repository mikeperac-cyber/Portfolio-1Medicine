const MANDATORY_DISCLAIMER = 'Educational only; not medical advice.';

const SAFE_FALLBACK_RESPONSE = `This system is designed solely to explain official public health guidelines in plain language. For your safety, it cannot evaluate personal symptoms, provide a medical diagnosis, or recommend medication dosages.

If you are experiencing severe symptoms, please call 911 (or 112) or visit your nearest emergency department immediately.
For confidential emotional support, call or text 988.
To discuss your individual health needs with a trusted clinician, explore our free and low-cost Community Clinic Directory.

${MANDATORY_DISCLAIMER}`;

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
  // Turkish patterns
  /(diyabet miyim|şeker hastası mıyım|kanser miyim|hastalığım ne|teşhis koy|bende ne var)/iu,
  /(göğsüm ağrıyor|döküntüm var|nefes alamıyorum|acil servise|acil servis)/iu,
  /(kaç mg|dozu artır|[iİıI]lac[ıi]m[ıi] b[ıi]rak|[iİıI]lac[ıi] b[ıi]rak)/iu,
];

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // US SSN
  /\b\d{11}\b/, // TC Kimlik
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
  /\b(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US Phone
  /\b(?:\+?90[-.\s]?)?0?5\d{2}[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}\b/, // TR Phone
  /\b(my name is|me llamo|mi nombre es|benim adım|adım|ismim)\s+([A-Za-zÇçĞğİıÖöŞşÜü]+(\s+[A-Za-zÇçĞğİıÖöŞşÜü]+)?)\b/iu,
  /\b(medical record|mrn|patient id|dosya no|hasta no)[:\s]*\d+\b/iu,
];

function validateHealthPrompt(rawPrompt) {
  const text = (rawPrompt || '').trim();
  if (!text) {
    return {
      isSafe: false,
      reason: 'empty_prompt',
      fallback: `Please enter an educational question about the topic text.\n\n${MANDATORY_DISCLAIMER}`,
    };
  }

  // 1. PII Check
  for (const p of PII_PATTERNS) {
    if (p.test(text)) {
      return {
        isSafe: false,
        reason: 'pii_detected',
        fallback: `To protect your privacy, this platform never collects names, phone numbers, or personal identifying information.\n\n${MANDATORY_DISCLAIMER}`,
      };
    }
  }

  // 2. Diagnosis / Triage Check
  for (const p of DIAGNOSIS_PATTERNS) {
    if (p.test(text)) {
      return {
        isSafe: false,
        reason: 'diagnosis_attempt',
        fallback: SAFE_FALLBACK_RESPONSE,
      };
    }
  }

  return { isSafe: true, sanitizedPrompt: text };
}

function formatSafeResponse(text, citations = [], isFallback = false) {
  const clean = (text || '').trim();
  const withDisclaimer = clean.includes(MANDATORY_DISCLAIMER)
    ? clean
    : `${clean}\n\n${MANDATORY_DISCLAIMER}`;

  return {
    summary: withDisclaimer,
    citations,
    disclaimer: MANDATORY_DISCLAIMER,
    isFallback,
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MANDATORY_DISCLAIMER,
    SAFE_FALLBACK_RESPONSE,
    validateHealthPrompt,
    formatSafeResponse,
  };
}
