import OpenAI from 'openai';
import { OPENAI_MODEL_EMOJI } from '@/lib/models';

export async function POST(request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { messages } = await request.json();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_EMOJI,
      messages: [
        {
          role: 'system',
          content:
            'You are an AI that suggests a single emoji that best represents a given concept. Respond with only the emoji, nothing else.',
        },
        ...messages,
      ],
      store: true,
      metadata: { endpoint: 'emojigen' },
      max_completion_tokens: 64,
    });

    const message = completion.choices?.[0]?.message;
    if (!message) {
      console.error('Unexpected OpenAI API response structure:', completion);
      return Response.json(
        { error: 'Unexpected API response structure' },
        { status: 500 }
      );
    }
    return Response.json({ emoji: message.content.trim() });
  } catch (error) {
    console.error('Error in emoji generator:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
