export interface Topic {
  id: string;
  slug: string;
  category: 'chronic-disease' | 'prevention' | 'medications' | 'mental-health' | 'navigation';
  icon_name: string;
  reading_level: string;
  estimated_read_minutes: number;
}

export interface VettedSource {
  name: string;
  organization: string;
  url: string;
  publication_year: number;
}

export interface Article {
  id: string;
  topic_id: string;
  locale: 'en' | 'es' | 'tr';
  title: string;
  summary: string;
  content_markdown: string;
  key_takeaways: string[];
  vetted_sources: VettedSource[];
  reviewed_by: string;
  reviewer_role: string;
  reviewed_at: string;
  status: 'draft' | 'partner_review' | 'published';
}

export interface ClinicResource {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone: string;
  services: string[];
  languages_spoken: string[];
  hours_schedule: Record<string, string>;
  wheelchair_accessible: boolean;
  sliding_scale_available: boolean;
  accepts_uninsured: boolean;
  map_url: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  order_index: number;
  question_text: string;
  options: { id: number; text: string }[];
  correct_option_index: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  topic_id: string;
  locale: 'en' | 'es' | 'tr';
  quiz_type: 'pre' | 'post';
  title: string;
  description: string;
  questions?: QuizQuestion[];
}

export interface SiteMetric {
  date: string;
  pageViews: number;
  guidesPrinted: number;
  quizzesTaken: number;
  qrScans: number;
}

export interface TopicDeltaMetric {
  topic: string;
  preScore: number;
  postScore: number;
  improvement: number;
}

export const MOCK_TOPICS: Topic[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    slug: 'diabetes-prevention',
    category: 'chronic-disease',
    icon_name: 'Activity',
    reading_level: 'Grade 5-6 (Plain Language)',
    estimated_read_minutes: 4,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    slug: 'vaccination-basics',
    category: 'prevention',
    icon_name: 'ShieldCheck',
    reading_level: 'Grade 5-6 (Plain Language)',
    estimated_read_minutes: 3,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    slug: 'medication-safety',
    category: 'medications',
    icon_name: 'Pill',
    reading_level: 'Grade 5-6 (Plain Language)',
    estimated_read_minutes: 4,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    slug: 'mental-health-support',
    category: 'mental-health',
    icon_name: 'Smile',
    reading_level: 'Grade 5-6 (Plain Language)',
    estimated_read_minutes: 4,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000005',
    slug: 'doctor-appointment-prep',
    category: 'navigation',
    icon_name: 'CalendarCheck',
    reading_level: 'Grade 5-6 (Plain Language)',
    estimated_read_minutes: 3,
  },
];

export const MOCK_ARTICLES: Record<string, Record<'en' | 'es' | 'tr', Article>> = {
  'diabetes-prevention': {
    en: {
      id: 'b0000000-0000-0000-0000-000000000001',
      topic_id: 'a0000000-0000-0000-0000-000000000001',
      locale: 'en',
      title: 'Understanding and Preventing Type 2 Diabetes',
      summary: 'Learn how blood sugar works, what prediabetes means, and simple daily habits that keep your energy steady and your body strong.',
      content_markdown: `## What is Diabetes?

When you eat, your body breaks down food into a type of sugar called **glucose**. A helper hormone made in your pancreas, called **insulin**, acts like a key. It unlocks your cells so the sugar can go inside and give you energy.

In **Type 2 diabetes**, the key stops working smoothly. Sugar stays trapped in your bloodstream instead of fueling your muscles and brain. Over time, high blood sugar can tire your heart, kidneys, and eyes.

### What is Prediabetes?
Prediabetes is like a flashing yellow traffic light. Your blood sugar is higher than normal, but not yet in the diabetes range. **The wonderful news is that prediabetes can be reversed.** Small changes today make a huge difference tomorrow.

### Simple Steps You Can Take
1. **The Healthy Plate Method**: Fill half your plate with colorful vegetables (spinach, cabbage, carrots), one quarter with lean protein (beans, chicken, eggs), and one quarter with whole grains (brown rice, whole wheat tortillas).
2. **Move for 30 Minutes**: You do not need an expensive gym. Brisk walking with a neighbor, dancing to music, or taking the stairs all count.
3. **Drink Water Instead of Sweetened Beverages**: Sodas, sweet teas, and energy drinks spike blood sugar quickly. Choosing water or infused lemon water protects your kidneys.`,
      key_takeaways: [
        'Prediabetes can be reversed with small daily habits.',
        'Use the Plate Method: 1/2 vegetables, 1/4 protein, 1/4 grains.',
        'A 30-minute daily brisk walk makes your insulin work better.',
        'Ask your local community clinic about a simple A1C blood test.',
      ],
      vetted_sources: [
        {
          name: 'Diabetes Overview and Prevention',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
          publication_year: 2023,
        },
        {
          name: 'Prediabetes - Your Chance to Prevent Type 2 Diabetes',
          organization: 'Centers for Disease Control and Prevention (CDC)',
          url: 'https://www.cdc.gov/diabetes/basics/prediabetes.html',
          publication_year: 2024,
        },
        {
          name: 'Healthy Living & Standards of Care',
          organization: 'American Diabetes Association',
          url: 'https://diabetes.org',
          publication_year: 2023,
        },
      ],
      reviewed_by: 'Dr. Elena Gomez, MD',
      reviewer_role: 'Community Health Physician & Clinical Director',
      reviewed_at: '2024-10-12',
      status: 'published',
    },
    es: {
      id: 'b0000000-0000-0000-0000-000000000004',
      topic_id: 'a0000000-0000-0000-0000-000000000001',
      locale: 'es',
      title: 'Entendiendo y Previniendo la Diabetes Tipo 2',
      summary: 'Aprenda cómo funciona el azúcar en sangre, qué significa la prediabetes y hábitos diarios simples que mantienen su energía y salud.',
      content_markdown: `## ¿Qué es la Diabetes?

Cuando usted come, su cuerpo transforma los alimentos en un tipo de azúcar llamado **glucosa**. Una hormona producida en el páncreas llamada **insulina** actúa como una llave. Abre las células para que el azúcar entre y le dé energía para trabajar y jugar.

En la **diabetes tipo 2**, la llave ya no abre bien. El azúcar se queda atrapada en su sangre en lugar de alimentar sus músculos y cerebro. Con el tiempo, el azúcar alta constante puede cansar su corazón, riñones y ojos.

### ¿Qué es la Prediabetes?
La prediabetes es como un semáforo en amarillo. Su nivel de azúcar está más alto de lo normal, pero aún no en el nivel de diabetes. **La gran noticia es que la prediabetes se puede revertir por completo.** Pequeños cambios hoy transforman su bienestar para siempre.

### Pasos Prácticos para su Día a Día
1. **El Método del Plato Saludable**: Llene la mitad de su plato con verduras frescas (espinacas, nopales, repollo, ensaladas), un cuarto con proteína (frijoles de la olla, pollo, pescado, huevos) y un cuarto con granos enteros (arroz integral o tortillas de maíz).
2. **Camine 30 Minutos al Día**: No necesita pagar un gimnasio. Caminar a paso ligero en el parque o con su familia ayuda a que su cuerpo use la insulina de inmediato.
3. **Tome Agua en Lugar de Refrescos**: Las sodas, aguas frescas muy dulces y jugos embotellados elevan el azúcar bruscamente. El agua natural o con limón cuida sus riñones.`,
      key_takeaways: [
        'La prediabetes se puede revertir con pequeños cambios diarios.',
        'Use el Plato Saludable: 1/2 verduras, 1/4 proteína, 1/4 granos.',
        'Caminar 30 minutos al día ayuda a que la insulina trabaje mejor.',
        'Pregunte en su clínica comunitaria por la prueba de sangre A1C.',
      ],
      vetted_sources: [
        {
          name: 'Diabetes Información y Prevención',
          organization: 'Organización Mundial de la Salud (OMS)',
          url: 'https://www.who.int/es/news-room/fact-sheets/detail/diabetes',
          publication_year: 2023,
        },
        {
          name: 'Prediabetes: Su Oportunidad para Prevenir la Diabetes Tipo 2',
          organization: 'CDC en Español',
          url: 'https://www.cdc.gov/diabetes/spanish/basics/prediabetes.html',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Dra. Elena Gómez, MD',
      reviewer_role: 'Médica Comunitaria y Directora Clínica',
      reviewed_at: '2024-10-12',
      status: 'published',
    },
    tr: {
      id: 'b0000000-0000-0000-0000-000000000011',
      topic_id: 'a0000000-0000-0000-0000-000000000001',
      locale: 'tr',
      title: 'Tip 2 Diyabeti Anlamak ve Önlemek',
      summary: 'Kan şekerinin nasıl çalıştığını, gizli şekerin (prediyabet) ne anlama geldiğini ve vücudunuzu güçlü tutacak basit günlük alışkanlıkları öğrenin.',
      content_markdown: `## Diyabet Nedir?

Yemek yediğinizde vücudunuz besinleri **glukoz** adı verilen bir şeker türüne dönüştürür. Pankreasta üretilen **insülin** hormonu ise bir anahtar görevi görür. Hücrelerinizin kapısını açarak şekerin içeri girmesini ve size enerji vermesini sağlar.

**Tip 2 diyabette** bu anahtar artık düzgün çalışmaz. Şeker hücrelerin içine girip kaslarınıza enerji vermek yerine kanda birikir. Zamanla yüksek kan şekeri kalbinizi, böbreklerinizi ve gözlerinizi yorabilir.

### Prediyabet (Gizli Şeker) Nedir?
Prediyabet sarı yanan bir trafik lambası gibidir. Kan şekeriniz normalden yüksektir ancak henüz diyabet seviyesinde değildir. **En sevindirici haber ise prediyabetin tamamen geri döndürülebilir olmasıdır.** Bugün atacağınız küçük adımlar geleceğinizi korur.

### Uygulayabileceğiniz Basit Adımlar
1. **Sağlıklı Tabak Yöntemi**: Tabağınızın yarısını renkli sebzelerle (ıspanak, lahana, havuç, yeşillikler), dörtte birini proteinle (mercimek, fasulye, tavuk, yumurta) ve dörtte birini tam tahıllarla (bulgur, tam buğday ekmeği) doldurun.
2. **Günde 30 Dakika Yürüyün**: Pahalı bir spor salonuna gerek yoktur. Mahallede tempolu yürümek, müzikle dans etmek veya merdiven çıkmak bile insülininizin daha iyi çalışmasını sağlar.
3. **Şekerli İçecekler Yerine Su İçin**: Gazlı içecekler, hazır meyve suları ve şekerli çaylar kan şekerini aniden yükseltir. Su veya limonlu su içmek böbreklerinizi korur.`,
      key_takeaways: [
        'Prediyabet (gizli şeker) küçük günlük alışkanlıklarla tamamen geri döndürülebilir.',
        'Sağlıklı Tabak Kuralı: 1/2 sebze, 1/4 protein, 1/4 tam tahıl.',
        'Günde 30 dakika tempolu yürüyüş insülinin hücrelere girmesini kolaylaştırır.',
        'Toplum sağlığı merkezinizden basit bir HbA1c kan testi isteyebilirsiniz.',
      ],
      vetted_sources: [
        {
          name: 'Diyabet Bilgi Notu ve Önleme',
          organization: 'Dünya Sağlık Örgütü (WHO / DSÖ)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
          publication_year: 2023,
        },
        {
          name: 'Türkiye Diyabet Önleme ve Kontrol Kılavuzu',
          organization: 'T.C. Sağlık Bakanlığı',
          url: 'https://hsgm.saglik.gov.tr',
          publication_year: 2023,
        },
        {
          name: 'Prediyabet Rehberi',
          organization: 'Hastalık Kontrol ve Önleme Merkezleri (CDC)',
          url: 'https://www.cdc.gov/diabetes/basics/prediabetes.html',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Uzm. Dr. Mehmet Kaya',
      reviewer_role: 'Halk Sağlığı ve Aile Hekimliği Uzmanı',
      reviewed_at: '2024-10-12',
      status: 'published',
    },
  },
  'vaccination-basics': {
    en: {
      id: 'b0000000-0000-0000-0000-000000000002',
      topic_id: 'a0000000-0000-0000-0000-000000000002',
      locale: 'en',
      title: 'Vaccines: How They Protect You and Your Family',
      summary: 'Vaccines act like a practice drill for your immune system, helping your body defeat dangerous germs before they make you sick.',
      content_markdown: `## How Do Vaccines Work?

Think of your immune system as a neighborhood defense team. When a new germ enters your body, your immune system needs time to learn how to fight it.

A vaccine gives your body a safe "practice drill." It shows your immune system a weakened or harmless piece of the germ. Your body practices making **antibodies** (defense shields). If the real virus or bacteria ever attacks you later, your body recognizes it right away and defeats it quickly.

### Are Vaccines Safe?
Yes. Before any vaccine is approved for the public, scientific safety boards test it carefully in thousands of diverse volunteers. After approval, doctors and health ministries continue to monitor safety constantly.

### Mild Side Effects Are Normal
It is very common to feel a sore arm, slight tiredness, or a low fever for 24 to 48 hours after receiving a shot. This is not the illness—it is proof that your body is successfully building strong protection!`,
      key_takeaways: [
        'Vaccines teach your body to fight germs without getting sick.',
        'Severe side effects are extremely rare; mild soreness shows your immune system is working.',
        'Community vaccines protect babies and elders who cannot be vaccinated.',
        'Most neighborhood clinics provide free or low-cost vaccines.',
      ],
      vetted_sources: [
        {
          name: 'How Vaccines Work',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines/how-do-vaccines-work',
          publication_year: 2023,
        },
        {
          name: 'Vaccines & Immunizations Guidance',
          organization: 'Centers for Disease Control and Prevention (CDC)',
          url: 'https://www.cdc.gov/vaccines/index.html',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Nurse Practitioner Marcus Vance, FNP-C',
      reviewer_role: 'Lead Immunization Specialist, Public Health Coalition',
      reviewed_at: '2024-11-04',
      status: 'published',
    },
    es: {
      id: 'b0000000-0000-0000-0000-000000000005',
      topic_id: 'a0000000-0000-0000-0000-000000000002',
      locale: 'es',
      title: 'Vacunas: Cómo Protegen a Usted y a su Familia',
      summary: 'Las vacunas funcionan como un simulacro de entrenamiento para sus defensas, ayudando al cuerpo a vencer enfermedades peligrosas.',
      content_markdown: `## ¿Cómo Funcionan las Vacunas?

Piense en su sistema inmunológico como un equipo de protección de su comunidad. Cuando un nuevo microbio entra en el cuerpo, sus defensas necesitan tiempo para aprender a combatirlo.

Una vacuna le da a su cuerpo un "simulacro seguro". Muestra una parte inofensiva o debilitada del microbio. Su cuerpo practica creando **anticuerpos** (escudos de defensa). Si el virus real intenta entrar después, su cuerpo lo reconoce al instante y lo vence rápidamente.

### ¿Son Seguras las Vacunas?
Sí. Antes de que cualquier vacuna llegue al público, comités de científicos y médicos la evalúan rigurosamente en miles de voluntarios. Los ministerios de salud vigilan su seguridad continuamente.

### Efectos Secundarios Leves
Sentir dolor en el brazo, cansancio leve o una pequeña calentura durante 24 a 48 horas es normal. ¡Esto demuestra que sus defensas están entrenando activamente!`,
      key_takeaways: [
        'Las vacunas enseñan al cuerpo a defenderse sin enfermarse.',
        'Los efectos secundarios graves son rarísimos; la molestia leve muestra que sus defensas están listas.',
        'Vacunarse protege a los bebés y ancianos vulnerables.',
        'La mayoría de las clínicas comunitarias ofrecen vacunas gratis o a bajo costo.',
      ],
      vetted_sources: [
        {
          name: 'Cómo funcionan las vacunas',
          organization: 'Organización Mundial de la Salud (OMS)',
          url: 'https://www.who.int/es/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines/how-do-vaccines-work',
          publication_year: 2023,
        },
        {
          name: 'Vacunas e inmunización',
          organization: 'CDC en Español',
          url: 'https://www.cdc.gov/vaccines/index-sp.html',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Enfermero Especialista Marcus Vance, FNP-C',
      reviewer_role: 'Especialista en Inmunización, Coalición de Salud Pública',
      reviewed_at: '2024-11-04',
      status: 'published',
    },
    tr: {
      id: 'b0000000-0000-0000-0000-000000000012',
      topic_id: 'a0000000-0000-0000-0000-000000000002',
      locale: 'tr',
      title: 'Aşılar: Sizi ve Ailenizi Nasıl Korur?',
      summary: 'Aşılar bağışıklık sisteminiz için bir güvenlik tatbikatı gibi çalışır ve mikroplar sizi hasta etmeden önce vücudunuzun onları yenmesini sağlar.',
      content_markdown: `## Aşılar Nasıl Çalışır?

Bağışıklık sisteminizi mahallenizi koruyan bir savunma ekibi gibi düşünün. Vücudunuza yeni bir mikrop girdiğinde, bağışıklık sisteminizin onunla nasıl savaşacağını öğrenmesi zaman alır.

Aşı vücudunuza güvenli bir "tatbikat" yaptırır. Bağışıklık sisteminize mikrobun zararsız veya zayıflatılmış küçük bir parçasını gösterir. Vücudunuz koruyucu **antikorlar** (savunma kalkanları) üretmeyi öğrenir. Gerçek mikrop daha sonra size bulaşırsa, vücudunuz onu anında tanır ve hasta olmadan hızla yok eder.

### Aşılar Güvenli midir?
Evet. Herhangi bir aşı halka sunulmadan önce bağımsız bilim kurulları tarafından binlerce gönüllü üzerinde titizlikle test edilir. Onaylandıktan sonra da sağlık bakanlıkları güvenliği sürekli denetler.

### Hafif Yan Etkiler Normaldir
Aşıdan sonraki 24-48 saat içinde kolda hafif ağrı, yorgunluk veya hafif ateş hissedilmesi çok yaygındır. Bu bir hastalık değildir; bağışıklık sisteminizin güçlü bir kalkan inşa ettiğinin kanıtıdır!`,
      key_takeaways: [
        'Aşılar hasta olmadan vücuda mikroplarla savaşmayı öğretir.',
        'Ciddi yan etkiler son derece nadirdir; koldaki hafif ağrı aşının çalıştığını gösterir.',
        'Aşı olmak henüz aşı olamayan bebekleri ve yaşlıları da korur.',
        'Toplum ve aile sağlığı merkezlerinde rutin aşılar ücretsiz uygulanır.',
      ],
      vetted_sources: [
        {
          name: 'Aşılar Nasıl Çalışır?',
          organization: 'Dünya Sağlık Örgütü (WHO / DSÖ)',
          url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines/how-do-vaccines-work',
          publication_year: 2023,
        },
        {
          name: 'Ulusal Aşı Programı ve Bilgilendirme',
          organization: 'T.C. Sağlık Bakanlığı',
          url: 'https://asi.saglik.gov.tr',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Uzm. Hemşire Zeynep Demir',
      reviewer_role: 'Aşı ve Bağışıklama Uzmanı, Toplum Sağlığı Koalisyonu',
      reviewed_at: '2024-11-04',
      status: 'published',
    },
  },
  'medication-safety': {
    en: {
      id: 'b0000000-0000-0000-0000-000000000003',
      topic_id: 'a0000000-0000-0000-0000-000000000003',
      locale: 'en',
      title: 'Medication Safety: Taking Your Prescriptions Confidently',
      summary: 'Simple guidelines to take medicines correctly, prevent unwanted side effects, and safely organize your daily pills.',
      content_markdown: `## Why Medication Timing and Dosing Matters

Prescription medicines are carefully balanced recipes designed to keep your blood pressure, sugar, or infections under control. Taking too much can cause harm, and skipping doses can stop the medicine from protecting you.

### 4 Golden Rules of Safe Medication
1. **Never Share Medications**: A medicine that heals your friend might dangerously interact with your blood pressure or kidneys.
2. **Keep an Updated Medicine Bag**: Bring all your pill bottles, vitamins, and herbal teas in a clean bag to your doctor or pharmacist so they can check for interactions.
3. **Use a Pill Organizer Box**: A 7-day pill organizer (available for $2 at most pharmacies) helps you see immediately whether you took your morning or night pills.
4. **Always Ask Before Stopping**: If a pill gives you nausea, dizziness, or an upset stomach, call your clinic right away. Never stop cold-turkey on blood pressure or mental health medications without your doctor guiding you.`,
      key_takeaways: [
        'Always bring all your pill bottles and vitamins to every appointment.',
        'Never share prescription medicines with friends or family.',
        'Use a 7-day pill organizer to prevent missed or double doses.',
        'Never stop high blood pressure pills suddenly without talking to your doctor.',
      ],
      vetted_sources: [
        {
          name: 'Medication Safety Basics',
          organization: 'Centers for Disease Control and Prevention (CDC)',
          url: 'https://www.cdc.gov/medicationsafety/basics.html',
          publication_year: 2023,
        },
        {
          name: 'Medication Without Harm Global Patient Safety Challenge',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/initiatives/medication-without-harm',
          publication_year: 2022,
        },
      ],
      reviewed_by: 'PharmD Amina Patel',
      reviewer_role: 'Clinical Pharmacist & Health Literacy Educator',
      reviewed_at: '2024-09-18',
      status: 'published',
    },
    es: {
      id: 'b0000000-0000-0000-0000-000000000006',
      topic_id: 'a0000000-0000-0000-0000-000000000003',
      locale: 'es',
      title: 'Seguridad con sus Medicamentos: Guía para Tomarlos con Confianza',
      summary: 'Pautas sencillas para tomar sus medicinas a tiempo, evitar interacciones peligrosas y organizar sus pastillas diarias.',
      content_markdown: `## Por Qué Importa el Horario y la Dosis

Los medicamentos recetados están equilibrados para mantener su presión arterial, azúcar o infecciones bajo control. Tomar de más puede ser dañino, y olvidar dosis impide que el tratamiento funcione.

### 4 Reglas de Oro
1. **Nunca Comparta Medicinas**: Una pastilla que ayudó a su vecino puede ser peligrosa para sus riñones o presión.
2. **Lleve su Bolsa de Medicinas**: Traiga todos sus frascos, vitaminas y hierbas a su cita médica para que el doctor o farmacéutico revise si hay choques entre ellos.
3. **Use un Pastillero Semanal**: Un organizador de 7 días (cuesta unos $2) le permite ver de un vistazo si ya tomó su pastilla de la mañana o la noche.
4. **Pregunte Antes de Suspender**: Si un medicamento le causa mareo o malestar estomacal, llame a su clínica. Nunca suspenda repentinamente pastillas de la presión sin la guía de su médico.`,
      key_takeaways: [
        'Lleve todos sus frascos de pastillas y vitaminas a cada cita médica.',
        'Nunca comparta medicamentos recetados con familiares o amigos.',
        'Use un pastillero de 7 días para evitar dobles dosis u olvidos.',
        'Nunca suspenda sus pastillas para la presión sin consultar a su médico.',
      ],
      vetted_sources: [
        {
          name: 'Seguridad en los medicamentos',
          organization: 'CDC en Español',
          url: 'https://www.cdc.gov/medicationsafety/basics.html',
          publication_year: 2023,
        },
        {
          name: 'Medicamentos sin daño',
          organization: 'Organización Mundial de la Salud (OMS)',
          url: 'https://www.who.int/es/initiatives/medication-without-harm',
          publication_year: 2022,
        },
      ],
      reviewed_by: 'Farmacéutica Amina Patel, PharmD',
      reviewer_role: 'Farmacéutica Clínica y Educadora de Salud',
      reviewed_at: '2024-09-18',
      status: 'published',
    },
    tr: {
      id: 'b0000000-0000-0000-0000-000000000013',
      topic_id: 'a0000000-0000-0000-0000-000000000003',
      locale: 'tr',
      title: 'İlaç Güvenliği: Reçeteli İlaçlarınızı Güvenle Kullanın',
      summary: 'İlaçlarınızı zamanında ve doğru almak, yan etkileri önlemek ve günlük haplarınızı güvenle düzenlemek için pratik rehber.',
      content_markdown: `## İlaç Saati ve Dozu Neden Çok Önemlidir?

Reçeteli ilaçlar tansiyonunuzu, şekerinizi veya enfeksiyonlarınızı dengede tutmak için hekiminiz tarafından hassas dozlarla ayarlanır. Fazla almak vücuda zarar verebilir, doz atlamak ise tedavinin etkisini sıfırlayabilir.

### Güvenli İlaç Kullanımının 4 Altın Kuralı
1. **İlaçlarınızı Asla Başkasıyla Paylaşmayın**: Bir yakınınıza iyi gelen bir ilaç, sizin tansiyonunuz veya böbrekleriniz için tehlikeli olabilir.
2. **İlaç Çantanızı Doktorunuza Götürün**: Randevunuza giderken kullandığınız tüm hap kutularını, vitaminleri ve bitkisel çayları yanınızda götürün; doktorunuz veya eczacınız birbiriyle etkileşime girip girmediklerini kontrol etsin.
3. **Haftalık İlaç Kutusu Kullanın**: 7 günlük bir ilaç kutusu sabah veya akşam hapınızı alıp almadığınızı bir bakışta görmenizi sağlar ve çift doz almayı önler.
4. **Doktora Sormadan İlacı Kesmeyin**: Bir hap baş dönmesi veya mide bulantısı yaparsa hemen kliniğinizi arayın. Özellikle tansiyon ve kalp ilaçlarını doktorunuza danışmadan aniden bırakmayın.`,
      key_takeaways: [
        'Kullandığınız tüm kutuları ve vitaminleri her randevuya yanınızda götürün.',
        'Reçeteli ilaçlarınızı asla aile üyeleriyle veya komşularınızla paylaşmayın.',
        'Atlamaları veya çift dozları önlemek için 7 günlük ilaç kutusu edinin.',
        'Tansiyon veya kronik hastalık ilaçlarını doktorunuza sormadan aniden kesmeyin.',
      ],
      vetted_sources: [
        {
          name: 'Akılcı İlaç Kullanımı ve Güvenliği',
          organization: 'T.C. Sağlık Bakanlığı TİTCK',
          url: 'https://www.titck.gov.tr',
          publication_year: 2023,
        },
        {
          name: 'Zararsız İlaç Kullanımı Küresel Girişimi',
          organization: 'Dünya Sağlık Örgütü (WHO / DSÖ)',
          url: 'https://www.who.int/initiatives/medication-without-harm',
          publication_year: 2022,
        },
      ],
      reviewed_by: 'Ecz. Canan Arslan',
      reviewer_role: 'Klinik Eczacı ve Sağlık Okuryazarlığı Eğitmeni',
      reviewed_at: '2024-09-18',
      status: 'published',
    },
  },
  'mental-health-support': {
    en: {
      id: 'b0000000-0000-0000-0000-000000000007',
      topic_id: 'a0000000-0000-0000-0000-000000000004',
      locale: 'en',
      title: 'Mental Health: Caring for Your Mind and Breaking Stigma',
      summary: 'Understanding emotional stress, knowing when to seek compassionate help, and accessing free, confidential counseling.',
      content_markdown: `## Emotional Health is Real Health

Just like our bodies can get a cold or high blood pressure, our minds can experience exhaustion, grief, and sadness. Feeling overwhelmed by work, family, or migration stress is not a sign of weakness—it is a human response to heavy burdens.

### Common Signs of Emotional Overload
- Trouble sleeping or waking up constantly worried.
- Feeling deep sadness or losing interest in activities you once enjoyed.
- Physical headaches or tight chest when thinking about daily obligations.

### Free, Confidential Help is Available
You do not have to struggle alone. Calling or texting **988** connects you with kind, trained counselors 24 hours a day in English, Spanish, and over 200 languages. Your immigration status is never asked.`,
      key_takeaways: [
        'Mental health is just as important as physical health; asking for help is strength.',
        'The 988 Suicide & Crisis Lifeline is free, confidential, and bilingual.',
        'Community clinics have counselors who speak your language and offer sliding scale payments.',
        'Daily deep breathing, sleep routines, and talking to trusted friends help build resilience.',
      ],
      vetted_sources: [
        {
          name: 'Mental Health Overview',
          organization: 'World Health Organization (WHO)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
          publication_year: 2023,
        },
        {
          name: '988 Suicide & Crisis Lifeline Resources',
          organization: 'SAMHSA',
          url: 'https://www.samhsa.gov/find-help/988',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Dr. Carlos Mendoza, PsyD',
      reviewer_role: 'Bilingual Clinical Psychologist & Community Advocate',
      reviewed_at: '2024-10-25',
      status: 'published',
    },
    es: {
      id: 'b0000000-0000-0000-0000-000000000008',
      topic_id: 'a0000000-0000-0000-0000-000000000004',
      locale: 'es',
      title: 'Salud Emocional: Cuidar Nuestra Mente y Romper el Estigma',
      summary: 'Entender el estrés emocional, saber cuándo buscar apoyo compasivo y acceder a consejería gratuita y confidencial.',
      content_markdown: `## La Salud Emocional es Salud Verdadera

Así como nuestro cuerpo puede tener gripe o presión alta, nuestra mente puede sentir agotamiento, tristeza y dolor. Sentirse abrumado por el trabajo, la familia o las dificultades no es señal de debilidad: es una respuesta humana natural a cargas pesadas.

### Señales Comunes de Sobrecarga
- Dificultad para dormir o despertarse con angustia continua.
- Sentir tristeza constante o perder el interés en cosas que antes disfrutaba.
- Dolores de cabeza o tensión en el pecho por el estrés cotidiano.

### Hay Ayuda Gratuita y Confidencial
No tiene que enfrentar esto a solas. Marcar o enviar un mensaje al **988** le comunica con consejeros amables y capacitados las 24 horas del día en español e inglés. Nunca se pregunta su estatus migratorio.`,
      key_takeaways: [
        'Cuidar su mente es igual de valioso que cuidar el cuerpo; pedir ayuda es valentía.',
        'La línea 988 es gratis, confidencial y disponible en español.',
        'Las clínicas comunitarias tienen terapeutas bilingües a bajo costo.',
        'Respirar hondo, dormir bien y hablar con personas de confianza alivia la carga.',
      ],
      vetted_sources: [
        {
          name: 'Salud Mental y Bienestar',
          organization: 'Organización Mundial de la Salud (OMS)',
          url: 'https://www.who.int/es/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
          publication_year: 2023,
        },
        {
          name: 'Línea de Prevención del Suicidio y Crisis 988',
          organization: 'SAMHSA en Español',
          url: 'https://www.samhsa.gov/find-help/988',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Dr. Carlos Mendoza, PsyD',
      reviewer_role: 'Psicólogo Clínico Bilingüe y Defensor Comunitario',
      reviewed_at: '2024-10-25',
      status: 'published',
    },
    tr: {
      id: 'b0000000-0000-0000-0000-000000000014',
      topic_id: 'a0000000-0000-0000-0000-000000000004',
      locale: 'tr',
      title: 'Ruh Sağlığı: Zihninizi Korumak ve Ön Yargıları Kırmak',
      summary: 'Duygusal stresi anlamak, ne zaman şefkatli destek isteyeceğini bilmek ve ücretsiz, gizli danışmanlığa ulaşmak.',
      content_markdown: `## Ruh Sağlığı da Beden Sağlığı Kadar Gerçektir

Tıpkı bedenimizin nezle olması veya tansiyonumuzun yükselmesi gibi zihnimiz de yorulabilir, keder ve kaygı hissedebilir. İş, aile veya hayat zorlukları karşısında bunalmak bir zayıflık işareti değildir; ağır yüklere karşı insani bir tepkidir.

### Zihinsel Yorgunluğun Yaygın Belirtileri
- Uykuya dalmakta zorlanmak veya sürekli endişeyle uyanmak.
- Önceden keyif aldığınız şeylere karşı ilginizi kaybetmek ve derin hüzün.
- Günlük sorumlulukları düşünürken baş ağrısı veya göğüste baskı hissetmek.

### Yalnız Değilsiniz, Destek Almak Güçtür
Bu zorluklarla tek başınıza mücadele etmek zorunda değilsiniz. Toplum sağlığı merkezlerindeki psikolojik danışmanlar ve kriz destek hatları gizli ve şefkatli destek sunar. Yardım istemek zayıflık değil, kendinize ve ailenize verdiğiniz değerin göstergesidir.`,
      key_takeaways: [
        'Ruh sağlığı en az beden sağlığı kadar önemlidir; yardım istemek cesarettir.',
        'Toplum sağlığı merkezlerinde ücretsiz veya düşük maliyetli danışmanlık sağlanır.',
        'Derin nefes egzersizleri, düzenli uyku ve güvenilen yakınlarla konuşmak direnci artırır.',
        'Duygusal sıkıntılar çözümsüz değildir, uzman desteğiyle aşılabilir.',
      ],
      vetted_sources: [
        {
          name: 'Ruh Sağlığı ve Psikososyal Destek',
          organization: 'Dünya Sağlık Örgütü (WHO / DSÖ)',
          url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
          publication_year: 2023,
        },
        {
          name: 'Toplum Ruh Sağlığı Hizmetleri Kılavuzu',
          organization: 'T.C. Sağlık Bakanlığı',
          url: 'https://hsgm.saglik.gov.tr',
          publication_year: 2024,
        },
      ],
      reviewed_by: 'Uzm. Psk. Elif Yıldız',
      reviewer_role: 'Klinik Psikolog ve Toplum Sağlığı Savunucusu',
      reviewed_at: '2024-10-25',
      status: 'published',
    },
  },
  'doctor-appointment-prep': {
    en: {
      id: 'b0000000-0000-0000-0000-000000000009',
      topic_id: 'a0000000-0000-0000-0000-000000000005',
      locale: 'en',
      title: 'Preparing for Your Doctor Appointment: Getting the Care You Deserve',
      summary: 'How to ask for an interpreter, 3 questions you should always ask, and what documents to bring so you never feel rushed.',
      content_markdown: `## You Have the Right to Understand Your Health Care

Visiting the clinic can feel intimidating or rushed. Remember that doctors and nurses are here to serve you. You are the expert on your own body, and you deserve clear answers in language you understand.

### Before You Leave Home
1. **Gather All Your Medications**: Put all your pill bottles, vitamins, and supplements in a bag.
2. **Write Down Your Top 2 Questions**: Doctors usually have 15 minutes. Starting with your most urgent concern ensures it gets answered first.
3. **Ask for an In-Person or Phone Interpreter**: By law in most community clinics, you have the right to a certified medical interpreter at zero cost. Never rely on children to translate medical terms.

### 3 Questions to Always Ask
1. "What is my main problem?"
2. "What do I need to do next, and why is it important?"
3. "Can you write this down or repeat it simply so I can explain it to my family?"`,
      key_takeaways: [
        'You have the legal right to a free, trained medical interpreter.',
        'Bring all your pill bottles in a bag so the clinic can verify them.',
        'Always ask: "What is my main problem, and what do I do next?"',
        'If you do not understand a medical term, politely say: "Please explain that in simple words."',
      ],
      vetted_sources: [
        {
          name: 'Ask Me 3: Good Questions for Your Good Health',
          organization: 'Institute for Healthcare Improvement (IHI)',
          url: 'https://www.ihi.org/resources/tools/ask-me-3-good-questions-your-good-health',
          publication_year: 2023,
        },
        {
          name: 'Talking to Your Doctor',
          organization: 'National Institute on Aging (NIH)',
          url: 'https://www.nia.nih.gov/health/talking-your-doctor',
          publication_year: 2023,
        },
      ],
      reviewed_by: 'Community Navigator Rosa Martinez',
      reviewer_role: 'Certified Medical Interpreter & Health Navigator',
      reviewed_at: '2024-11-10',
      status: 'published',
    },
    es: {
      id: 'b0000000-0000-0000-0000-000000000010',
      topic_id: 'a0000000-0000-0000-0000-000000000005',
      locale: 'es',
      title: 'Cómo Prepararse para su Cita Médica: Obtenga la Atención que Merece',
      summary: 'Cómo solicitar un intérprete gratuito, 3 preguntas clave que siempre debe hacer y qué llevar para no sentirse apresurado.',
      content_markdown: `## Usted Tiene Derecho a Entender su Atención Médica

Ir a la clínica puede sentirse intimidante o apresurado. Recuerde que el personal médico está para servirle. Usted es quien mejor conoce su cuerpo y merece respuestas claras en su idioma.

### Antes de Salir de Casa
1. **Junte sus Medicamentos en una Bolsa**: Lleve todos sus frascos de pastillas, vitaminas y hierbas naturales.
2. **Escriba sus 2 Dudas Principales**: Las consultas suelen durar 15 minutos. Comenzar con lo que más le preocupa asegura que se resuelva primero.
3. **Pida un Intérprete Médico Certificado**: Por ley, usted tiene derecho a un intérprete médico profesional sin costo alguno. Nunca ponga a sus hijos a traducir términos de salud difíciles.

### 3 Preguntas de Oro para su Doctor
1. "¿Cuál es mi problema principal?"
2. "¿Qué tengo que hacer ahora y por qué es importante?"
3. "¿Podría repetirlo con palabras sencillas para que se lo explique a mi familia?"`,
      key_takeaways: [
        'Tiene derecho por ley a un intérprete médico profesional y gratuito.',
        'Lleve todos sus frascos de medicinas en una bolsa a la consulta.',
        'Haga siempre las 3 preguntas clave sobre su diagnóstico y próximos pasos.',
        'Si no entiende una palabra técnica, diga: "Por favor explíquemelo en palabras sencillas".',
      ],
      vetted_sources: [
        {
          name: 'Haga 3 Preguntas Clave',
          organization: 'Institute for Healthcare Improvement (IHI)',
          url: 'https://www.ihi.org/resources/tools/ask-me-3-good-questions-your-good-health',
          publication_year: 2023,
        },
        {
          name: 'Cómo hablar con su médico',
          organization: 'Instituto Nacional sobre el Envejecimiento (NIH)',
          url: 'https://www.nia.nih.gov/espanol/hablar-su-medico',
          publication_year: 2023,
        },
      ],
      reviewed_by: 'Promotora de Salud Rosa Martínez',
      reviewer_role: 'Intérprete Médica Certificada y Navegadora de Salud Comunitaria',
      reviewed_at: '2024-11-10',
      status: 'published',
    },
    tr: {
      id: 'b0000000-0000-0000-0000-000000000015',
      topic_id: 'a0000000-0000-0000-0000-000000000005',
      locale: 'tr',
      title: 'Doktor Randevusuna Hazırlık: Hak Ettiğiniz Sağlık Hizmetini Alın',
      summary: 'Randevuda aceleye gelmemek, tercüman hakkını kullanmak ve doktora mutlaka sorulması gereken 3 altın soru rehberi.',
      content_markdown: `## Sağlık Hizmetinizi Tam Anlamaya Hakkınız Var

Sağlık kuruluşuna gitmek bazen kafa karıştırıcı veya aceleyle geçmiş gibi hissettirebilir. Doktorlar ve hemşireler size hizmet etmek için oradadır. Kendi bedeninizi en iyi siz tanırsınız ve kendi dilinizde net yanıtlar almayı hak edersiniz.

### Evden Çıkmadan Önce
1. **İlaçlarınızı Bir Torbaya Koyun**: Kullandığınız tüm reçeteli hap kutularını, tansiyon ilaçlarını ve vitaminleri yanınıza alın.
2. **En Önemli 2 Sorunuzu Bir Kağıda Yazın**: Randevular genelde 15 dakikadır. En çok endişelendiğiniz sorudan başlamak onun mutlaka yanıtlanmasını sağlar.
3. **Tıbbi Tercüman Talep Edin**: Yabancı bir ülkedeyseniz veya dili rahat konuşamıyorsanız, çoğu klinikte ücretsiz profesyonel tıbbi tercüman isteme hakkınız vardır. Çocuklarınızdan tıbbi terimleri tercüme etmelerini istemeyin.

### Doktorunuza Mutlaka Soracağınız 3 Soru
1. "Benim temel sağlık sorunum nedir?"
2. "Şimdi ne yapmam gerekiyor ve bu neden önemli?"
3. "Bunu aileme de anlatabilmem için daha sade bir dille tekrar edebilir misiniz?"`,
      key_takeaways: [
        'Kliniklerde ücretsiz profesyonel tıbbi tercüman talep etme yasal hakkınız vardır.',
        'Kullandığınız tüm kutuları bir poşete koyup doktora gösterin.',
        'Her zaman 3 altın soruyu sorun: "Sorunum ne, şimdi ne yapmalıyım ve neden önemli?"',
        'Tıbbi bir terimi anlamadığınızda: "Lütfen bunu daha sade kelimelerle açıklar mısınız?" deyin.',
      ],
      vetted_sources: [
        {
          name: 'Sağlığınız İçin 3 Doğru Soru Sorun (Ask Me 3)',
          organization: 'Institute for Healthcare Improvement (IHI)',
          url: 'https://www.ihi.org/resources/tools/ask-me-3-good-questions-your-good-health',
          publication_year: 2023,
        },
        {
          name: 'Doktorunuzla Etkili İletişim Rehberi',
          organization: 'Ulusal Yaşlanma Enstitüsü (NIH)',
          url: 'https://www.nia.nih.gov/health/talking-your-doctor',
          publication_year: 2023,
        },
      ],
      reviewed_by: 'Sağlık Rehberi Sevgi Yılmaz',
      reviewer_role: 'Sertifikalı Tıbbi İletişim Uzmanı ve Toplum Rehberi',
      reviewed_at: '2024-11-10',
      status: 'published',
    },
  },
};

export const MOCK_RESOURCES: ClinicResource[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    name: 'Esperanza Community Health Center',
    description: 'Federally Qualified Health Center offering comprehensive primary care, pediatric immunizations, diabetes education, and low-cost pharmacy.',
    address: '1420 S. Mission St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94110',
    latitude: 37.7512,
    longitude: -122.4183,
    phone: '(415) 555-0192',
    services: ['sliding_scale', 'free_vaccines', 'diabetes_education', 'prenatal', 'pharmacy', 'interpreter'],
    languages_spoken: ['English', 'Spanish', 'Mayan languages (Mam, K’iche’)', 'Turkish / Türkçe'],
    hours_schedule: {
      'Mon-Thu': '8:00 AM - 7:00 PM',
      'Fri': '8:00 AM - 5:00 PM',
      'Sat': '8:30 AM - 1:00 PM',
      'Sun': 'Closed',
    },
    wheelchair_accessible: true,
    sliding_scale_available: true,
    accepts_uninsured: true,
    map_url: 'https://maps.google.com/?q=37.7512,-122.4183',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    name: 'North Beach & Chinatown Health Center',
    description: 'Bilingual community clinic specializing in chronic disease prevention, senior wellness, dental screenings, and mental health counseling.',
    address: '889 Broadway St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94133',
    latitude: 37.7981,
    longitude: -122.4102,
    phone: '(415) 555-0344',
    services: ['sliding_scale', 'free_vaccines', 'mental_health', 'dental', 'chronic_disease'],
    languages_spoken: ['English', 'Cantonese', 'Mandarin', 'Vietnamese'],
    hours_schedule: {
      'Mon-Fri': '8:30 AM - 5:00 PM',
      'Sat': '9:00 AM - 12:30 PM',
      'Sun': 'Closed',
    },
    wheelchair_accessible: true,
    sliding_scale_available: true,
    accepts_uninsured: true,
    map_url: 'https://maps.google.com/?q=37.7981,-122.4102',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    name: 'Southeast Family Wellness & Urgent Care',
    description: 'Full-service neighborhood clinic with walk-in urgent care triage, food pharmacy vouchers, and free maternal and infant care.',
    address: '2401 Keith St',
    city: 'San Francisco',
    state: 'CA',
    postal_code: '94124',
    latitude: 37.7289,
    longitude: -122.3891,
    phone: '(415) 555-0811',
    services: ['sliding_scale', 'free_vaccines', 'mental_health', 'prenatal', 'food_support', 'interpreter'],
    languages_spoken: ['English', 'Spanish', 'Samoan', 'Tagalog', 'Turkish / Türkçe'],
    hours_schedule: {
      'Mon-Sat': '8:00 AM - 6:00 PM',
      'Sun': '10:00 AM - 2:00 PM',
    },
    wheelchair_accessible: true,
    sliding_scale_available: true,
    accepts_uninsured: true,
    map_url: 'https://maps.google.com/?q=37.7289,-122.3891',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    name: 'Oakland East Bay Community Medicine',
    description: 'Community-led health center offering sliding fee scales, free preventative dental checkups, and diabetes peer support groups.',
    address: '10700 MacArthur Blvd',
    city: 'Oakland',
    state: 'CA',
    postal_code: '94605',
    latitude: 37.7471,
    longitude: -122.1492,
    phone: '(510) 555-4920',
    services: ['sliding_scale', 'free_vaccines', 'diabetes_education', 'dental', 'mental_health'],
    languages_spoken: ['English', 'Spanish', 'Arabic', 'Mam', 'Turkish / Türkçe'],
    hours_schedule: {
      'Mon-Fri': '8:00 AM - 5:30 PM',
      'Sat': 'Closed',
      'Sun': 'Closed',
    },
    wheelchair_accessible: true,
    sliding_scale_available: true,
    accepts_uninsured: true,
    map_url: 'https://maps.google.com/?q=37.7471,-122.1492',
  },
];

export const MOCK_QUIZZES: Record<string, Record<'en' | 'es' | 'tr', Record<'pre' | 'post', Quiz>>> = {
  'diabetes-prevention': {
    en: {
      pre: {
        id: 'd0000000-0000-0000-0000-000000000001',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'en',
        quiz_type: 'pre',
        title: 'Pre-Quiz: Diabetes Knowledge Check',
        description: 'Test your baseline knowledge before exploring the guide. All answers are completely anonymous.',
        questions: [
          {
            id: 'q1',
            quiz_id: 'd0000000-0000-0000-0000-000000000001',
            order_index: 0,
            question_text: 'Can prediabetes be reversed before it turns into full Type 2 diabetes?',
            options: [
              { id: 0, text: 'No, once blood sugar is high it can never come down.' },
              { id: 1, text: 'Yes, with healthy food choices, brisk walking, and weight management.' },
              { id: 2, text: 'Only if you undergo major surgical operations.' },
            ],
            correct_option_index: 1,
            explanation: 'Studies by the CDC and WHO demonstrate that 30 minutes of brisk daily activity and balanced eating can reverse prediabetes.',
          },
          {
            id: 'q2',
            quiz_id: 'd0000000-0000-0000-0000-000000000001',
            order_index: 1,
            question_text: 'According to the Healthy Plate Method, what should fill HALF of your plate at meal times?',
            options: [
              { id: 0, text: 'Meat and processed cheese' },
              { id: 1, text: 'White rice or pasta' },
              { id: 2, text: 'Colorful non-starchy vegetables (like broccoli, greens, or carrots)' },
            ],
            correct_option_index: 2,
            explanation: 'Filling half your plate with non-starchy vegetables provides essential fiber that prevents rapid blood sugar spikes.',
          },
        ],
      },
      post: {
        id: 'd0000000-0000-0000-0000-000000000002',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'en',
        quiz_type: 'post',
        title: 'Post-Quiz: Diabetes Knowledge Check',
        description: 'See what you learned from reading the guide! anonymous results help clinics evaluate program impact.',
        questions: [
          {
            id: 'q1',
            quiz_id: 'd0000000-0000-0000-0000-000000000002',
            order_index: 0,
            question_text: 'Can prediabetes be reversed before it turns into full Type 2 diabetes?',
            options: [
              { id: 0, text: 'No, once blood sugar is high it can never come down.' },
              { id: 1, text: 'Yes, with healthy food choices, brisk walking, and weight management.' },
              { id: 2, text: 'Only if you undergo major surgical operations.' },
            ],
            correct_option_index: 1,
            explanation: 'Studies by the CDC and WHO demonstrate that 30 minutes of brisk daily activity and balanced eating can reverse prediabetes.',
          },
          {
            id: 'q2',
            quiz_id: 'd0000000-0000-0000-0000-000000000002',
            order_index: 1,
            question_text: 'According to the Healthy Plate Method, what should fill HALF of your plate at meal times?',
            options: [
              { id: 0, text: 'Meat and processed cheese' },
              { id: 1, text: 'White rice or pasta' },
              { id: 2, text: 'Colorful non-starchy vegetables (like broccoli, greens, or carrots)' },
            ],
            correct_option_index: 2,
            explanation: 'Filling half your plate with non-starchy vegetables provides essential fiber that prevents rapid blood sugar spikes.',
          },
        ],
      },
    },
    es: {
      pre: {
        id: 'd0000000-0000-0000-0000-000000000003',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'es',
        quiz_type: 'pre',
        title: 'Evaluación Inicial: ¿Qué sabemos sobre la diabetes?',
        description: 'Ponga a prueba sus conocimientos iniciales. Todas las respuestas son anónimas.',
        questions: [
          {
            id: 'q1es',
            quiz_id: 'd0000000-0000-0000-0000-000000000003',
            order_index: 0,
            question_text: '¿Se puede revertir la prediabetes antes de que se convierta en diabetes tipo 2?',
            options: [
              { id: 0, text: 'No, una vez que sube el azúcar nunca más puede bajar.' },
              { id: 1, text: 'Sí, con alimentación balanceada, caminatas y hábitos activos.' },
              { id: 2, text: 'Solo mediante una cirugía complicada.' },
            ],
            correct_option_index: 1,
            explanation: '¡Correcto! Estudios clínicos demuestran que cambios sencillos en la alimentación y caminar 30 minutos al día pueden revertir la prediabetes.',
          },
          {
            id: 'q2es',
            quiz_id: 'd0000000-0000-0000-0000-000000000003',
            order_index: 1,
            question_text: 'Según el Método del Plato Saludable, ¿qué debe llenar la MITAD de su plato?',
            options: [
              { id: 0, text: 'Carne roja y queso' },
              { id: 1, text: 'Arroz blanco o pastas' },
              { id: 2, text: 'Verduras coloridas (como espinacas, nopales o zanahorias)' },
            ],
            correct_option_index: 2,
            explanation: '¡Correcto! Llenar la mitad del plato con verduras aporta fibra que evita los picos repentinos de azúcar en la sangre.',
          },
        ],
      },
      post: {
        id: 'd0000000-0000-0000-0000-000000000004',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'es',
        quiz_type: 'post',
        title: 'Evaluación Final: ¿Qué aprendimos sobre la diabetes?',
        description: 'Compruebe lo aprendido después de leer la guía.',
        questions: [
          {
            id: 'q1es',
            quiz_id: 'd0000000-0000-0000-0000-000000000004',
            order_index: 0,
            question_text: '¿Se puede revertir la prediabetes antes de que se convierta en diabetes tipo 2?',
            options: [
              { id: 0, text: 'No, una vez que sube el azúcar nunca más puede bajar.' },
              { id: 1, text: 'Sí, con alimentación balanceada, caminatas y hábitos activos.' },
              { id: 2, text: 'Solo mediante una cirugía complicada.' },
            ],
            correct_option_index: 1,
            explanation: '¡Correcto! Estudios clínicos demuestran que cambios sencillos en la alimentación y caminar 30 minutos al día pueden revertir la prediabetes.',
          },
          {
            id: 'q2es',
            quiz_id: 'd0000000-0000-0000-0000-000000000004',
            order_index: 1,
            question_text: 'Según el Método del Plato Saludable, ¿qué debe llenar la MITAD de su plato?',
            options: [
              { id: 0, text: 'Carne roja y queso' },
              { id: 1, text: 'Arroz blanco o pastas' },
              { id: 2, text: 'Verduras coloridas (como espinacas, nopales o zanahorias)' },
            ],
            correct_option_index: 2,
            explanation: '¡Correcto! Llenar la mitad del plato con verduras aporta fibra que evita los picos repentinos de azúcar en la sangre.',
          },
        ],
      },
    },
    tr: {
      pre: {
        id: 'd0000000-0000-0000-0000-000000000005',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'tr',
        quiz_type: 'pre',
        title: 'Ön Değerlendirme: Diyabet Bilgi Kontrolü',
        description: 'Rehberi okumadan önceki bilgilerinizi test edin. Tüm yanıtlar tamamen anonimdir.',
        questions: [
          {
            id: 'q1tr',
            quiz_id: 'd0000000-0000-0000-0000-000000000005',
            order_index: 0,
            question_text: 'Prediyabet (gizli şeker), Tip 2 diyabete dönüşmeden önce geri döndürülebilir mi?',
            options: [
              { id: 0, text: 'Hayır, kan şekeri bir kez yükseldi mi bir daha düşmez.' },
              { id: 1, text: 'Evet, sağlıklı beslenme, tempolu yürüyüş ve kilo yönetimi ile geri döndürülebilir.' },
              { id: 2, text: 'Yalnızca ağır bir ameliyatla geri döner.' },
            ],
            correct_option_index: 1,
            explanation: 'Doğru! DSÖ ve Sağlık Bakanlığı klinik çalışmaları günde 30 dakika yürüyüş ve dengeli beslenme ile gizli şekerin geri döndürülebileceğini kanıtlamıştır.',
          },
          {
            id: 'q2tr',
            quiz_id: 'd0000000-0000-0000-0000-000000000005',
            order_index: 1,
            question_text: 'Sağlıklı Tabak Yöntemine göre öğünlerinizde tabağınızın YARISINI ne doldurmalıdır?',
            options: [
              { id: 0, text: 'Kırmızı et ve yağlı peynir' },
              { id: 1, text: 'Beyaz pirinç pilavı veya makarna' },
              { id: 2, text: 'Renkli sebzeler ve yeşillikler (ıspanak, havuç, brokoli vb.)' },
            ],
            correct_option_index: 2,
            explanation: 'Doğru! Tabağın yarısını nişastasız sebzelerle doldurmak, kan şekerinin ani yükselmesini engelleyen hayati lifleri sağlar.',
          },
        ],
      },
      post: {
        id: 'd0000000-0000-0000-0000-000000000006',
        topic_id: 'a0000000-0000-0000-0000-000000000001',
        locale: 'tr',
        quiz_type: 'post',
        title: 'Son Değerlendirme: Neler Öğrendik?',
        description: 'Rehberi okuduktan sonra öğrendiklerinizi değerlendirin.',
        questions: [
          {
            id: 'q1tr',
            quiz_id: 'd0000000-0000-0000-0000-000000000006',
            order_index: 0,
            question_text: 'Prediyabet (gizli şeker), Tip 2 diyabete dönüşmeden önce geri döndürülebilir mi?',
            options: [
              { id: 0, text: 'Hayır, kan şekeri bir kez yükseldi mi bir daha düşmez.' },
              { id: 1, text: 'Evet, sağlıklı beslenme, tempolu yürüyüş ve kilo yönetimi ile geri döndürülebilir.' },
              { id: 2, text: 'Yalnızca ağır bir ameliyatla geri döner.' },
            ],
            correct_option_index: 1,
            explanation: 'Doğru! DSÖ ve Sağlık Bakanlığı klinik çalışmaları günde 30 dakika yürüyüş ve dengeli beslenme ile gizli şekerin geri döndürülebileceğini kanıtlamıştır.',
          },
          {
            id: 'q2tr',
            quiz_id: 'd0000000-0000-0000-0000-000000000006',
            order_index: 1,
            question_text: 'Sağlıklı Tabak Yöntemine göre öğünlerinizde tabağınızın YARISINI ne doldurmalıdır?',
            options: [
              { id: 0, text: 'Kırmızı et ve yağlı peynir' },
              { id: 1, text: 'Beyaz pirinç pilavı veya makarna' },
              { id: 2, text: 'Renkli sebzeler ve yeşillikler (ıspanak, havuç, brokoli vb.)' },
            ],
            correct_option_index: 2,
            explanation: 'Doğru! Tabağın yarısını nişastasız sebzelerle doldurmak, kan şekerinin ani yükselmesini engelleyen hayati lifleri sağlar.',
          },
        ],
      },
    },
  },
};

export const MOCK_ADMIN_METRICS = {
  totalUsersServed: 2480,
  topicsViewedTotal: 7390,
  avgQuizImprovement: '+38.4%',
  totalGuidesPrinted: 612,
  satisfactionRating: '96.2%',
  recentActivityDays: [
    { date: 'Mon', pageViews: 320, guidesPrinted: 35, quizzesTaken: 82, qrScans: 45 },
    { date: 'Tue', pageViews: 410, guidesPrinted: 42, quizzesTaken: 110, qrScans: 60 },
    { date: 'Wed', pageViews: 480, guidesPrinted: 58, quizzesTaken: 145, qrScans: 72 },
    { date: 'Thu', pageViews: 520, guidesPrinted: 64, quizzesTaken: 160, qrScans: 85 },
    { date: 'Fri', pageViews: 590, guidesPrinted: 80, quizzesTaken: 195, qrScans: 110 },
    { date: 'Sat', pageViews: 380, guidesPrinted: 45, quizzesTaken: 90, qrScans: 68 },
    { date: 'Sun', pageViews: 340, guidesPrinted: 38, quizzesTaken: 75, qrScans: 55 },
  ],
  quizDeltas: [
    { topic: 'Diabetes Prevention', preScore: 48, postScore: 89, improvement: 41 },
    { topic: 'Vaccine Basics', preScore: 54, postScore: 92, improvement: 38 },
    { topic: 'Medication Safety', preScore: 45, postScore: 86, improvement: 41 },
    { topic: 'Mental Health Stigma', preScore: 52, postScore: 88, improvement: 36 },
    { topic: 'Doctor Appt Prep', preScore: 60, postScore: 94, improvement: 34 },
  ],
  topicViews: [
    { name: 'Diabetes Prevention', views: 2450 },
    { name: 'Medication Safety', views: 1820 },
    { name: 'Vaccine Basics', views: 1410 },
    { name: 'Doctor Appt Prep', views: 980 },
    { name: 'Mental Health', views: 730 },
  ],
  anonymousFeedback: [
    {
      id: 'fb-1',
      date: 'Today, 2:15 PM',
      topic: 'Diabetes Prevention',
      rating: 5,
      helpful: true,
      comment: 'The plate method diagram was so easy to explain to my grandmother. She loved it!',
    },
    {
      id: 'fb-2',
      date: 'Today, 11:30 AM',
      topic: 'Preparing for Doctor Appointments',
      rating: 5,
      helpful: true,
      comment: 'I printed the sheet and showed it to the receptionist to ask for a Spanish interpreter.',
    },
    {
      id: 'fb-3',
      date: 'Yesterday',
      topic: 'Medication Safety',
      rating: 5,
      helpful: true,
      comment: 'We used the 7-day pill organizer advice for my dad who was accidentally taking his pill twice.',
    },
    {
      id: 'fb-4',
      date: '2 days ago',
      topic: 'Vaccination Basics',
      rating: 4,
      helpful: true,
      comment: 'Clear explanation of why arm soreness is normal after a shot.',
    },
  ],
};
