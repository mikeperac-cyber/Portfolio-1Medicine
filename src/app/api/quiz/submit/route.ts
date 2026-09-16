import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, topicId, topicSlug, quizType, score, totalQuestions, locale } = body;

    if (!sessionId || !quizType) {
      return NextResponse.json({ error: 'Invalid quiz payload' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      await supabase.from('quiz_responses').insert({
        session_id: sessionId,
        topic_id: topicId,
        quiz_type: quizType,
        score,
        total_questions: totalQuestions,
        locale: locale || 'en',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
