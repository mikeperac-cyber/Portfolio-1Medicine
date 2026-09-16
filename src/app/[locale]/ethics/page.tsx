import { Metadata } from 'next';
import { ShieldCheck, BookOpenCheck, CheckCircle2, AlertTriangle, Lock, Users, Stethoscope, FileCode2 } from 'lucide-react';
import { Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { MANDATORY_DISCLAIMER } from '@/lib/ai/guardrails';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const isSpanish = params.locale === 'es';
  return {
    title: isSpanish ? 'Ética y Fuentes | Salud Comunitaria' : 'Ethics & Sources | Community Health Bridge',
    description: isSpanish
      ? 'Metodología de revisión clínica, lista de fuentes aprobadas y por qué excluimos el diagnóstico por IA.'
      : 'Clinical review methodology, approved public health sources, and why AI diagnosis is excluded.',
  };
}

export default async function EthicsPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isSpanish = locale === 'es';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-health-100 text-health-800 border border-health-300 px-3 py-1 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-health-600" />
          <span>{isSpanish ? 'Transparencia y Estándares Éticos' : 'Transparency & Safety Standards'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {dict.ethics.title}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {dict.ethics.subtitle}
        </p>
      </header>

      {/* Mandatory Clinical Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3.5 text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <strong className="block font-bold">
            {isSpanish ? 'Aviso Ético Esencial' : 'Essential Ethical Boundary'}
          </strong>
          <p className="text-amber-900 leading-relaxed font-semibold">
            {MANDATORY_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Section 1: Why AI Diagnosis and Triage are Excluded */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm" aria-labelledby="why-no-diagnosis">
        <div className="flex items-center gap-2.5 text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h2 id="why-no-diagnosis" className="text-xl sm:text-2xl font-bold">
            {dict.ethics.whyNoDiagnosisTitle}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {dict.ethics.whyNoDiagnosisText}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
            <strong className="font-bold text-slate-900 block">
              {isSpanish ? '1. Prevención del Sesgo Algorítmico' : '1. Algorithmic Bias Mitigation'}
            </strong>
            <p className="text-slate-600 leading-relaxed">
              {isSpanish
                ? 'Los modelos diagnósticos comerciales suelen ser entrenados con poblaciones no representativas y fallan al interpretar síntomas descritos en dialectos culturales.'
                : 'Diagnostic LLMs trained predominantly on high-income populations misinterpret symptoms articulated in community idioms of distress.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
            <strong className="font-bold text-slate-900 block">
              {isSpanish ? '2. Cero Alucinaciones Médicas' : '2. Zero Hallucination Risk'}
            </strong>
            <p className="text-slate-600 leading-relaxed">
              {isSpanish
                ? 'Al restringir la IA únicamente a resumir fuentes públicas validadas, se elimina por completo la invención de tratamientos o medicamentos.'
                : 'By restricting AI prompts strictly to pre-vetted official text, we eliminate toxic hallucinations, drug interactions, and dosage fabrications.'}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
            <strong className="font-bold text-slate-900 block">
              {isSpanish ? '3. Puente a Profesionales Reales' : '3. Human Provider Priority'}
            </strong>
            <p className="text-slate-600 leading-relaxed">
              {isSpanish
                ? 'El software jamás debe sustituir la relación humana con un médico de cabecera en una clínica comunitaria accesible.'
                : 'Digital tools must empower patients to ask great questions at community clinics, never replace real clinical examination.'}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: 4-Step Review Workflow */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm" aria-labelledby="review-workflow">
        <div className="flex items-center gap-2.5 text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-health-100 text-health-700 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h2 id="review-workflow" className="text-xl sm:text-2xl font-bold">
            {dict.ethics.workflowTitle}
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-health-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              1
            </div>
            <div>
              <strong className="font-bold text-slate-900 block">
                {isSpanish ? 'Extracción de Fuentes Oficiales y Aprobadas' : 'Curated Evidence Extraction'}
              </strong>
              <p className="text-slate-600 mt-0.5">
                {isSpanish
                  ? 'La evidencia proviene exclusivamente de la Organización Mundial de la Salud (OMS), los Centros para el Control y la Prevención de Enfermedades (CDC), el NIH y ministerios de salud.'
                  : 'Source evidence is derived strictly from the World Health Organization (WHO), CDC, National Institutes of Health (NIH), and government health ministries.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-health-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              2
            </div>
            <div>
              <strong className="font-bold text-slate-900 block">
                {isSpanish ? 'Redacción en Lenguaje Sencillo (Nivel 5to-6to Grado)' : 'Plain-Language Translation (Grade 5-6)'}
              </strong>
              <p className="text-slate-600 mt-0.5">
                {isSpanish
                  ? 'Se eliminan tecnicismos médicos complejos y se redactan explicaciones visuales con analogías claras (ej. la insulina como una llave).'
                  : 'Medical jargon is replaced with relatable everyday metaphors and tested against Flesch-Kincaid grade 5-6 readability metrics.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-health-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              3
            </div>
            <div>
              <strong className="font-bold text-slate-900 block">
                {isSpanish ? 'Validación por Médicos Comunitarios y Promotores' : 'Clinical & Community Promoter Sign-off'}
              </strong>
              <p className="text-slate-600 mt-0.5">
                {isSpanish
                  ? 'Médicos de atención primaria, enfermeros y promotores de salud bilingües revisan la precisión clínica y la sensibilidad cultural.'
                  : 'Practicing primary care clinicians, nurse practitioners, and bilingual Community Health Workers audit cultural accuracy and clinical truth.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              4
            </div>
            <div>
              <strong className="font-bold text-slate-900 block">
                {isSpanish ? 'Publicación con Responsabilidad y Trazabilidad' : 'Versioned Accountable Publishing'}
              </strong>
              <p className="text-slate-600 mt-0.5">
                {isSpanish
                  ? 'Cada guía publicada muestra de manera transparente quién la revisó, su cargo médico, la fecha y enlaces a las fuentes originales.'
                  : 'Every published explainer permanently displays the reviewer name, clinical title, verification date, and linked primary citations.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Approved Official Sources Registry */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-sm" aria-labelledby="approved-sources">
        <div className="flex items-center gap-2.5 text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <h2 id="approved-sources" className="text-xl sm:text-2xl font-bold">
            {isSpanish ? 'Registro de Fuentes Oficiales Aprobadas' : 'Approved Official Sources Registry'}
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">World Health Organization (WHO / OMS)</span>
            <p className="text-slate-600">Global clinical guidance, factsheets on noncommunicable diseases, vaccine efficacy standards.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Centers for Disease Control and Prevention (CDC / CDC en Español)</span>
            <p className="text-slate-600">Prediabetes reversal trials, national immunization schedules, medication safety alerts.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Substance Abuse and Mental Health Services Administration (SAMHSA)</span>
            <p className="text-slate-600">Bilingual 988 lifeline protocols, crisis counseling standards, emotional wellness materials.</p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-1">
            <span className="font-bold text-slate-900 block">Institute for Healthcare Improvement (IHI - Ask Me 3®)</span>
            <p className="text-slate-600">Patient-doctor communication frameworks and question guides for marginalized communities.</p>
          </div>
        </div>
      </section>

      {/* Section 4: Privacy & Zero PII Pledge */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-3 shadow-sm">
        <div className="flex items-center gap-2.5 text-slate-900">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {isSpanish ? 'Privacidad Absoluta: Cero Datos Personales' : 'Zero Identifying Data Collection Pledge'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {isSpanish
            ? 'Para garantizar la seguridad y tranquilidad de todos los miembros de la comunidad, esta aplicación no solicita nombres, apellidos, números de teléfono, correos electrónicos, números de seguro social ni expedientes médicos. Todas las evaluaciones y métricas son 100% anónimas.'
            : 'To ensure complete psychological safety for all community members regardless of background or legal status, this web application collects NO personal names, phone numbers, emails, Social Security numbers, or medical records. All quizzes and analytics events are strictly anonymous.'}
        </p>
      </section>
    </div>
  );
}
