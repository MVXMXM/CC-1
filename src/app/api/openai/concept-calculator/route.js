import OpenAI from 'openai';
import { CONCEPT_CALCULATOR_SYSTEM_PROMPT } from '@/lib/prompts';
import { OPENAI_MODEL_CONCEPT } from '@/lib/models';

export async function POST(request) {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { messages } = await request.json();
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_CONCEPT,
      messages: [
        { role: 'system', content: CONCEPT_CALCULATOR_SYSTEM_PROMPT },
        ...messages,
      ],
      store: true,
      metadata: { endpoint: 'operation' },
      max_completion_tokens: 1000,
    });
    return Response.json(completion);
  } catch (error) {
    console.error('Error in concept calculator:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
