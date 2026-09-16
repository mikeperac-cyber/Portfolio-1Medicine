-- ==============================================================================
-- Seed Data: High-Impact Health Explainers, Quizzes, Resources, and Citations
-- ==============================================================================

-- 1. Topics
INSERT INTO public.topics (id, slug, category, icon_name, reading_level, estimated_read_minutes)
VALUES
('a0000000-0000-0000-0000-000000000001', 'diabetes-prevention', 'chronic-disease', 'Activity', 'Grade 5-6 (Plain Language)', 4),
('a0000000-0000-0000-0000-000000000002', 'vaccination-basics', 'prevention', 'ShieldCheck', 'Grade 5-6 (Plain Language)', 3),
('a0000000-0000-0000-0000-000000000003', 'medication-safety', 'medications', 'Pill', 'Grade 5-6 (Plain Language)', 4),
('a0000000-0000-0000-0000-000000000004', 'mental-health-support', 'mental-health', 'Smile', 'Grade 5-6 (Plain Language)', 4),
('a0000000-0000-0000-0000-000000000005', 'doctor-appointment-prep', 'navigation', 'CalendarCheck', 'Grade 5-6 (Plain Language)', 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Articles (English)
INSERT INTO public.articles (id, topic_id, locale, title, summary, content_markdown, key_takeaways, vetted_sources, reviewed_by, reviewer_role, reviewed_at, status)
VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'en',
    'Understanding and Preventing Type 2 Diabetes',
    'Learn how blood sugar works, what prediabetes means, and simple daily habits that keep your energy steady and your body strong.',
    '## What is Diabetes?

When you eat, your body breaks down food into a type of sugar called **glucose**. A helper hormone made in your pancreas, called **insulin**, acts like a key. It unlocks your cells so the sugar can go inside and give you energy.

In **Type 2 diabetes**, the key stops working smoothly. Sugar stays trapped in your bloodstream instead of fueling your muscles and brain. Over time, high blood sugar can tire your heart, kidneys, and eyes.

### What is Prediabetes?
Prediabetes is like a flashing yellow traffic light. Your blood sugar is higher than normal, but not yet in the diabetes range. **The wonderful news is that prediabetes can be reversed.** Small changes today make a huge difference tomorrow.

### Simple Steps You Can Take
1. **The Healthy Plate Method**: Fill half your plate with colorful vegetables (spinach, cabbage, carrots), one quarter with lean protein (beans, chicken, eggs), and one quarter with whole grains (brown rice, whole wheat tortillas).
2. **Move for 30 Minutes**: You do not need an expensive gym. Brisk walking with a neighbor, dancing to music, or taking the stairs all count.
3. **Drink Water Instead of Sweetened Beverages**: Sodas, sweet teas, and energy drinks spike blood sugar quickly. Choosing water or infused lemon water protects your kidneys.',
    '["Prediabetes can be reversed with small daily habits.", "Use the Plate Method: 1/2 vegetables, 1/4 protein, 1/4 grains.", "A 30-minute daily brisk walk makes your insulin work better.", "Ask your clinic about a simple A1C blood test."]'::jsonb,
    '[
        {"name": "Diabetes Overview and Prevention", "organization": "World Health Organization (WHO)", "url": "https://www.who.int/news-room/fact-sheets/detail/diabetes", "publication_year": 2023},
        {"name": "Prediabetes - Your Chance to Prevent Type 2 Diabetes", "organization": "Centers for Disease Control and Prevention (CDC)", "url": "https://www.cdc.gov/diabetes/basics/prediabetes.html", "publication_year": 2024},
        {"name": "Healthy Living & Clinical Guidelines", "organization": "American Diabetes Association", "url": "https://diabetes.org", "publication_year": 2023}
    ]'::jsonb,
    'Dr. Elena Gomez, MD',
    'Community Health Physician & Clinical Director',
    '2024-10-12',
    'published'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'en',
    'Vaccines: How They Protect You and Your Family',
    'Vaccines act like a practice drill for your immune system, helping your body defeat dangerous germs before they make you sick.',
    '## How Do Vaccines Work?

Think of your immune system as a neighborhood defense team. When a new germ enters your body, your immune system needs time to learn how to fight it.

A vaccine gives your body a safe "practice drill." It shows your immune system a weakened or harmless piece of the germ. Your body practices making **antibodies** (defense shields). If the real virus or bacteria ever attacks you later, your body recognizes it right away and defeats it quickly.

### Are Vaccines Safe?
Yes. Before any vaccine is approved for the public, scientific safety boards test it carefully in thousands of diverse volunteers. After approval, doctors and health ministries continue to monitor safety constantly.

### Mild Side Effects Are Normal
It is very common to feel a sore arm, slight tiredness, or a low fever for 24 to 48 hours after receiving a shot. This is not the illness—it is proof that your body is successfully building strong protection!',
    '["Vaccines teach your body to fight germs without getting sick.", "Severe side effects are extremely rare; mild soreness shows your immune system is working.", "Community vaccines protect babies and elders who cannot be vaccinated.", "Most neighborhood clinics provide free or low-cost vaccines."]'::jsonb,
    '[
        {"name": "How Vaccines Work", "organization": "World Health Organization (WHO)", "url": "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/covid-19-vaccines/how-do-vaccines-work", "publication_year": 2023},
        {"name": "Vaccines & Immunizations Guidance", "organization": "Centers for Disease Control and Prevention (CDC)", "url": "https://www.cdc.gov/vaccines/index.html", "publication_year": 2024}
    ]'::jsonb,
    'Nurse Practitioner Marcus Vance, FNP-C',
    'Lead Immunization Specialist, Public Health Coalition',
    '2024-11-04',
    'published'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'en',
    'Medication Safety: Taking Your Prescriptions Confidently',
    'Simple guidelines to take medicines correctly, prevent unwanted side effects, and safely organize your daily pills.',
    '## Why Medication Timing and Dosing Matters

Prescription medicines are carefully balanced recipes designed to keep your blood pressure, sugar, or infections under control. Taking too much can cause harm, and skipping doses can stop the medicine from protecting you.

### 4 Golden Rules of Safe Medication
1. **Never Share Medications**: A medicine that heals your friend might dangerously interact with your blood pressure or kidneys.
2. **Keep an Updated Medicine Bag**: Bring all your pill bottles, vitamins, and herbal teas in a clean bag to your doctor or pharmacist so they can check for interactions.
3. **Use a Pill Organizer Box**: A 7-day pill organizer (available for $2 at most pharmacies) helps you see immediately whether you took your morning or night pills.
4. **Always Ask Before Stopping**: If a pill gives you nausea, dizziness, or an upset stomach, call your clinic right away. Never stop cold-turkey on blood pressure or mental health medications without your doctor guiding you.',
    '["Always bring all your pill bottles and vitamins to every appointment.", "Never share prescription medicines with friends or family.", "Use a 7-day pill organizer to prevent missed or double doses.", "Never stop high blood pressure pills suddenly without talking to your doctor."]'::jsonb,
    '[
        {"name": "Medication Safety Basics", "organization": "Centers for Disease Control and Prevention (CDC)", "url": "https://www.cdc.gov/medicationsafety/basics.html", "publication_year": 2023},
        {"name": "Medication Without Harm Global Patient Safety Challenge", "organization": "World Health Organization (WHO)", "url": "https://www.who.int/initiatives/medication-without-harm", "publication_year": 2022}
    ]'::jsonb,
    'PharmD Amina Patel',
    'Clinical Pharmacist & Health Literacy Educator',
    '2024-09-18',
    'published'
);

-- 3. Articles (Spanish)
INSERT INTO public.articles (id, topic_id, locale, title, summary, content_markdown, key_takeaways, vetted_sources, reviewed_by, reviewer_role, reviewed_at, status)
VALUES
(
    'b0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    'es',
    'Entendiendo y Previniendo la Diabetes Tipo 2',
    'Aprenda cómo funciona el azúcar en sangre, qué significa la prediabetes y hábitos diarios simples que mantienen su energía y salud.',
    '## ¿Qué es la Diabetes?

Cuando come, su cuerpo descompone los alimentos en un tipo de azúcar llamado **glucosa**. Una hormona producida en el páncreas llamada **insulina** actúa como una llave. Abre las células para que el azúcar entre y le dé energía.

En la **diabetes tipo 2**, la llave no funciona bien. El azúcar se queda atrapada en la sangre en lugar de alimentar sus músculos y cerebro. Con el tiempo, el azúcar alta puede afectar su corazón, riñones y ojos.

### ¿Qué es la Prediabetes?
La prediabetes es como un semáforo en amarillo. Su azúcar está más alta de lo normal, pero aún no en el nivel de diabetes. **La buena noticia es que la prediabetes se puede revertir.** Pequeños cambios hoy transforman su salud mañana.

### Pasos Prácticos
1. **El Método del Plato Saludable**: Llene la mitad de su plato con verduras frescas (espinacas, repollo, nopales), un cuarto con proteína (frijoles, pollo, huevos) y un cuarto con granos integrales (arroz integral, tortillas de maíz).
2. **Camine 30 Minutos al Día**: No necesita un gimnasio caro. Caminar con su familia o bailar cuenta.
3. **Tome Agua en Lugar de Refrescos**: Las bebidas azucaradas suben el azúcar rápidamente. Tomar agua cuida sus riñones.',
    '["La prediabetes se puede revertir con pequeños cambios diarios.", "Use el Plato Saludable: 1/2 verduras, 1/4 proteína, 1/4 granos.", "Caminar 30 minutos al día ayuda a que la insulina funcione mejor.", "Pida en su clínica una prueba de sangre A1C."]'::jsonb,
    '[
        {"name": "Diabetes Información y Prevención", "organization": "Organización Mundial de la Salud (OMS)", "url": "https://www.who.int/es/news-room/fact-sheets/detail/diabetes", "publication_year": 2023},
        {"name": "Prediabetes: Su Oportunidad para Prevenir la Diabetes Tipo 2", "organization": "CDC en Español", "url": "https://www.cdc.gov/diabetes/spanish/basics/prediabetes.html", "publication_year": 2024}
    ]'::jsonb,
    'Dra. Elena Gómez, MD',
    'Médica Comunitaria y Directora Clínica',
    '2024-10-12',
    'published'
);

-- 4. Articles (Turkish / Türkçe)
INSERT INTO public.articles (id, topic_id, locale, title, summary, content_markdown, key_takeaways, vetted_sources, reviewed_by, reviewer_role, reviewed_at, status)
VALUES
(
    'b0000000-0000-0000-0000-000000000011',
    'a0000000-0000-0000-0000-000000000001',
    'tr',
    'Tip 2 Diyabeti Anlamak ve Önlemek',
    'Kan şekerinin nasıl çalıştığını, gizli şekerin (prediyabet) ne anlama geldiğini ve vücudunuzu güçlü tutacak basit günlük alışkanlıkları öğrenin.',
    '## Diyabet Nedir?

Yemek yediğinizde vücudunuz besinleri **glukoz** adı verilen bir şeker türüne dönüştürür. Pankreasta üretilen **insülin** hormonu ise bir anahtar görevi görür. Hücrelerinizin kapısını açarak şekerin içeri girmesini ve size enerji vermesini sağlar.

**Tip 2 diyabette** bu anahtar artık düzgün çalışmaz. Şeker hücrelerin içine girip kaslarınıza enerji vermek yerine kanda birikir. Zamanla yüksek kan şekeri kalbinizi, böbreklerinizi ve gözlerinizi yorabilir.

### Prediyabet (Gizli Şeker) Nedir?
Prediyabet sarı yanan bir trafik lambası gibidir. Kan şekeriniz normalden yüksektir ancak henüz diyabet seviyesinde değildir. **En sevindirici haber ise prediyabetin tamamen geri döndürülebilir olmasıdır.** Bugün atacağınız küçük adımlar geleceğinizi korur.

### Uygulayabileceğiniz Basit Adımlar
1. **Sağlıklı Tabak Yöntemi**: Tabağınızın yarısını renkli sebzelerle doldurun.
2. **Günde 30 Dakika Yürüyün**: Mahallede tempolu yürüyüş insülinin çalışmasını kolaylaştırır.
3. **Şekerli İçecekler Yerine Su İçin**: Su veya limonlu su tüketmek böbreklerinizi korur.',
    '["Prediyabet (gizli şeker) küçük günlük alışkanlıklarla tamamen geri döndürülebilir.", "Sağlıklı Tabak Kuralı: 1/2 sebze, 1/4 protein, 1/4 tam tahıl.", "Günde 30 dakika tempolu yürüyüş insülinin hücrelere girmesini kolaylaştırır.", "Toplum sağlığı merkezinizden basit bir HbA1c kan testi isteyebilirsiniz."]'::jsonb,
    '[
        {"name": "Diyabet Bilgi Notu ve Önleme", "organization": "Dünya Sağlık Örgütü (WHO / DSÖ)", "url": "https://www.who.int/news-room/fact-sheets/detail/diabetes", "publication_year": 2023},
        {"name": "Türkiye Diyabet Önleme ve Kontrol Kılavuzu", "organization": "T.C. Sağlık Bakanlığı", "url": "https://hsgm.saglik.gov.tr", "publication_year": 2023}
    ]'::jsonb,
    'Uzm. Dr. Mehmet Kaya',
    'Halk Sağlığı ve Aile Hekimliği Uzmanı',
    '2024-10-12',
    'published'
);

-- 5. Community Resources
INSERT INTO public.resources (id, name, description, address, city, state, postal_code, latitude, longitude, phone, services, languages_spoken, hours_schedule, wheelchair_accessible, sliding_scale_available, accepts_uninsured, map_url)
VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Esperanza Community Health Center',
    'Federally Qualified Health Center offering comprehensive primary care, pediatric immunizations, diabetes care, and low-cost pharmacy.',
    '1420 S. Mission St',
    'San Francisco',
    'CA',
    '94110',
    37.7512,
    -122.4183,
    '(415) 555-0192',
    '["sliding_scale", "free_vaccines", "diabetes_education", "prenatal", "pharmacy", "interpreter"]'::jsonb,
    '["English", "Spanish", "Turkish / Türkçe"]'::jsonb,
    '{"Mon-Thu": "8:00 AM - 7:00 PM", "Fri": "8:00 AM - 5:00 PM", "Sat": "8:30 AM - 1:00 PM"}'::jsonb,
    true,
    true,
    true,
    'https://maps.google.com/?q=37.7512,-122.4183'
)
ON CONFLICT (id) DO NOTHING;
