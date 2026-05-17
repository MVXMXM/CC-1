import { Anthropic } from '@anthropic-ai/sdk';
import { CONCEPT_CALCULATOR_SYSTEM_PROMPT } from '@/lib/prompts';
import { ANTHROPIC_MODEL_CONCEPT } from '@/lib/models';

export async function POST(request) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const { messages } = await request.json();
    const message = messages[0].content;

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL_CONCEPT,
      max_tokens: 4096,
      messages: [{ role: 'user', content: message }],
      system: CONCEPT_CALCULATOR_SYSTEM_PROMPT,
    });

    const textBlock = Array.isArray(response.content)
      ? response.content.find((b) => b.type === 'text')
      : null;
    if (!textBlock?.text) {
      throw new Error('Unexpected response structure from Anthropic');
    }
    return Response.json({ content: textBlock.text });
  } catch (error) {
    console.error('Detailed error in Anthropic concept calculator:', error);
    return Response.json(
      { error: error.message, details: error.response?.data || error.stack },
      { status: 500 }
    );
  }
}
