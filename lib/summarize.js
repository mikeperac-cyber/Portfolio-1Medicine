const { formatSafeResponse } = require('../js/guardrails');
module.exports = function summarize({ topicTitle, keyTakeaways, locale, vettedSources }) {
    let summaryText;
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

return formatSafeResponse(summaryText, vettedSources || [], false);
};
