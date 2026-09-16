-- ==============================================================================
-- Community Health Bridge / Salud Comunitaria Database Schema
-- Multi-lingual, Accessible, Culturally Attuned Health Literacy Platform
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Topics Table (Core health themes)
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- chronic-disease, prevention, medications, mental-health, navigation
    icon_name VARCHAR(50) NOT NULL DEFAULT 'HeartPulse',
    reading_level VARCHAR(30) NOT NULL DEFAULT 'Grade 5-6 (Plain Language)',
    estimated_read_minutes INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Articles Table (Localized plain-language explainers with clinical review tracking)
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL DEFAULT 'en', -- 'en', 'es', etc.
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    key_takeaways JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of bullet strings
    vetted_sources JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ name, organization, url, publication_year }]
    reviewed_by VARCHAR(200) NOT NULL,
    reviewer_role VARCHAR(200) NOT NULL,
    reviewed_at DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'published', -- draft, partner_review, published
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_topic_locale UNIQUE (topic_id, locale)
);

-- 3. Resources / Community Clinics Table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    phone VARCHAR(30) NOT NULL,
    services JSONB NOT NULL DEFAULT '[]'::jsonb, -- ['sliding_scale', 'free_vaccines', 'mental_health', 'dental', 'prenatal', 'interpreter']
    languages_spoken JSONB NOT NULL DEFAULT '["English"]'::jsonb, -- ['English', 'Spanish', 'Vietnamese', 'Cantonese', 'Arabic']
    hours_schedule JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "Mon-Fri": "8:00 AM - 5:00 PM", "Sat": "9:00 AM - 1:00 PM" }
    wheelchair_accessible BOOLEAN NOT NULL DEFAULT true,
    sliding_scale_available BOOLEAN NOT NULL DEFAULT true,
    accepts_uninsured BOOLEAN NOT NULL DEFAULT true,
    map_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Quizzes Table (Pre and Post learning assessments per topic)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    quiz_type VARCHAR(20) NOT NULL, -- 'pre' or 'post'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_topic_locale_type UNIQUE (topic_id, locale, quiz_type)
);

-- 5. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    order_index INT NOT NULL DEFAULT 0,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ id: 0, text: "..." }, { id: 1, text: "..." }]
    correct_option_index INT NOT NULL,
    explanation TEXT NOT NULL, -- Educational rationale displayed after answering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Quiz Responses Table (STRICTLY ANONYMOUS - No PII, No names, No IPs, No user accounts)
CREATE TABLE IF NOT EXISTS public.quiz_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL, -- Client-generated ephemeral anonymous token
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    quiz_type VARCHAR(20) NOT NULL, -- 'pre' or 'post'
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent_seconds INT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Community Feedback Table (Anonymous ratings and input)
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_slug VARCHAR(100),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    was_helpful BOOLEAN,
    feedback_text TEXT,
    locale VARCHAR(10) NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Anonymous Site Metrics Table (Aggregated daily counters for community reach)
CREATE TABLE IF NOT EXISTS public.site_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_type VARCHAR(50) NOT NULL, -- 'page_view', 'guide_printed', 'qr_scanned', 'resource_clicked'
    dimension VARCHAR(100), -- topic_slug or resource_id
    count INT NOT NULL DEFAULT 1,
    CONSTRAINT unique_daily_metric UNIQUE (metric_date, metric_type, dimension)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;

-- Public can read all published content
CREATE POLICY "Public topics select" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public articles select" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "Public resources select" ON public.resources FOR SELECT USING (true);
CREATE POLICY "Public quizzes select" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Public quiz questions select" ON public.quiz_questions FOR SELECT USING (true);

-- Public can insert anonymous responses and feedback
CREATE POLICY "Public anonymous quiz response insert" ON public.quiz_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public feedback insert" ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public site metrics insert" ON public.site_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Public site metrics update" ON public.site_metrics FOR UPDATE USING (true);

-- Admins / service role can perform all actions
CREATE POLICY "Admin full topics" ON public.topics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full articles" ON public.articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full resources" ON public.resources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full quizzes" ON public.quizzes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full quiz_questions" ON public.quiz_questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read quiz_responses" ON public.quiz_responses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read feedback" ON public.feedback FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin read site_metrics" ON public.site_metrics FOR SELECT USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_articles_topic_locale ON public.articles(topic_id, locale);
CREATE INDEX IF NOT EXISTS idx_articles_status ON public.articles(status);
CREATE INDEX IF NOT EXISTS idx_quiz_topic_locale ON public.quizzes(topic_id, locale);
CREATE INDEX IF NOT EXISTS idx_quiz_responses_topic_session ON public.quiz_responses(topic_id, session_id);
CREATE INDEX IF NOT EXISTS idx_site_metrics_date_type ON public.site_metrics(metric_date, metric_type);
