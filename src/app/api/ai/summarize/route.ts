import { NextRequest, NextResponse } from 'next/server';
import { summarizeVettedHealthText } from '@/lib/ai/summarizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicTitle, articleText, keyTakeaways, vettedSources, userPrompt, locale } = body;

    if (!topicTitle || !articleText) {
      return NextResponse.json(
        { error: 'Missing required health explainer content' },
        { status: 400 }
      );
    }

    const result = await summarizeVettedHealthText({
      topicTitle,
      articleText,
      keyTakeaways: keyTakeaways || [],
      vettedSources: vettedSources || [],
      userPrompt: userPrompt || '',
      locale: locale || 'en',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Summarization API error:', error);
    return NextResponse.json(
      {
        summary: 'An error occurred while evaluating health resources. Please refer to vetted clinic materials.\n\nEducational only; not medical advice.',
        citations: [],
        disclaimer: 'Educational only; not medical advice.',
        isFallback: true,
      },
      { status: 500 }
    );
  }
}
