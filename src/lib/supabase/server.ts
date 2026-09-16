import {
  MOCK_TOPICS,
  MOCK_ARTICLES,
  MOCK_RESOURCES,
  MOCK_QUIZZES,
  MOCK_ADMIN_METRICS,
  Topic,
  Article,
  ClinicResource,
  Quiz,
} from './mock-data';
import { isSupabaseConfigured, supabase } from './client';

export async function getTopics(): Promise<Topic[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_TOPICS;
  }
  try {
    const { data, error } = await supabase.from('topics').select('*').order('created_at', { ascending: true });
    if (error || !data || data.length === 0) return MOCK_TOPICS;
    return data as Topic[];
  } catch {
    return MOCK_TOPICS;
  }
}

export async function getArticleBySlug(slug: string, locale: 'en' | 'es' | 'tr'): Promise<Article | null> {
  const normalizedLocale = locale === 'tr' ? 'tr' : locale === 'es' ? 'es' : 'en';
  if (!isSupabaseConfigured()) {
    return MOCK_ARTICLES[slug]?.[normalizedLocale] || null;
  }
  try {
    const { data: topic } = await supabase.from('topics').select('id').eq('slug', slug).single();
    if (!topic) return MOCK_ARTICLES[slug]?.[normalizedLocale] || null;

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('topic_id', topic.id)
      .eq('locale', normalizedLocale)
      .single();

    if (error || !data) return MOCK_ARTICLES[slug]?.[normalizedLocale] || null;
    return data as Article;
  } catch {
    return MOCK_ARTICLES[slug]?.[normalizedLocale] || null;
  }
}

export async function getResources(query?: string, service?: string, language?: string): Promise<ClinicResource[]> {
  let list = MOCK_RESOURCES;
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('resources').select('*');
      if (!error && data && data.length > 0) {
        list = data as ClinicResource[];
      }
    } catch {
      list = MOCK_RESOURCES;
    }
  }

  return list.filter((item) => {
    const matchesQuery = !query || 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.address.toLowerCase().includes(query.toLowerCase()) ||
      item.city.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase());

    const matchesService = !service || service === 'all' || item.services.includes(service);

    const matchesLanguage = !language || language === 'all' || item.languages_spoken.some(l => l.toLowerCase().includes(language.toLowerCase()));

    return matchesQuery && matchesService && matchesLanguage;
  });
}

export async function getQuizzesForTopic(slug: string, locale: 'en' | 'es' | 'tr'): Promise<{ pre?: Quiz; post?: Quiz }> {
  const normalizedLocale = locale === 'tr' ? 'tr' : locale === 'es' ? 'es' : 'en';
  const topicQuizzes = MOCK_QUIZZES[slug]?.[normalizedLocale];
  if (topicQuizzes) {
    return topicQuizzes;
  }
  return {};
}

export async function getAdminMetrics() {
  return MOCK_ADMIN_METRICS;
}
