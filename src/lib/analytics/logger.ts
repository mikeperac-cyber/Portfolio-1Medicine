import { isSupabaseConfigured, supabase } from '../supabase/client';

export type EventType = 'page_view' | 'guide_printed' | 'qr_scanned' | 'resource_clicked' | 'quiz_completed';

export async function logAnonymousEvent(eventType: EventType, dimension?: string) {
  if (typeof window === 'undefined') return;

  try {
    // If Supabase is configured, record in public.site_metrics
    if (isSupabaseConfigured()) {
      try {
        await supabase.rpc('increment_metric', {
          p_metric_type: eventType,
          p_dimension: dimension || 'general',
        });
      } catch {
        // Fallback to simple insert
        await supabase.from('site_metrics').insert({
          metric_type: eventType,
          dimension: dimension || 'general',
          count: 1,
        });
      }
    }

    // Also persist in local storage for instantaneous offline metric aggregation
    const key = `health_metric_${eventType}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (current + 1).toString());
  } catch (err) {
    // Analytics failures must never interrupt user flow
    console.debug('Anonymous telemetry event error:', err);
  }
}
