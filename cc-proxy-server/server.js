const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { Anthropic } = require('@anthropic-ai/sdk');
const { sql } = require('@vercel/postgres');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://cc-1-roan.vercel.app',
  'https://conceptcalculator.com',
  'https://www.conceptcalculator.com',
  'https://conceptcalculator.ai',
  'https://www.conceptcalculator.ai'
];

const isVercelPreviewOrigin = (origin) =>
  process.env.VERCEL_ENV === 'preview' && /^https:\/\/[\w-]+\.vercel\.app$/.test(origin);

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || isVercelPreviewOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    : 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

/** Cost-focused defaults; override via env if needed */
const OPENAI_MODEL_CONCEPT = process.env.OPENAI_MODEL_CONCEPT || 'gpt-5.4-mini';
const OPENAI_MODEL_EMOJI = process.env.OPENAI_MODEL_EMOJI || 'gpt-5.4-nano';
/** Pinned snapshot avoids alias / routing issues on some keys and SDKs */
const ANTHROPIC_MODEL_CONCEPT =
  process.env.ANTHROPIC_MODEL_CONCEPT || 'claude-haiku-4-5-20251001';

const CONCEPT_CALCULATOR_SYSTEM_PROMPT = `You solve semantic equations: vector arithmetic on concepts, in the spirit of the classic word-embedding example king - man + woman = queen.

Each input is a point in concept space. Each operator moves you to a new point. The result must LAND ON A NAMED CONCEPT — a real thing language already has a word for — not a description of a blend.

The four operators each perform a fundamentally different kind of move. They are NOT interchangeable.

+  ADD · create new material — A and B combine into a NEW concept that contains traits of both but is neither. Output ≠ A and output ≠ B.
−  REMOVE · strip material — A with B's contribution taken out. The output still resembles A, just without what B brought.
×  AMPLIFY · scale A up using B — A pushed to an extreme, with B as the multiplier or driving force. The output is a more intense form of A, not a fusion.
÷  DISTILL · reduce A down via B — A narrowed to its essence when filtered by B. The opposite of ×: where × takes A to its extreme, ÷ strips A to its core under B's frame.

EXAMPLES — see how the same pair yields a different concept under each operator:

   fire + water → steam
   fire − water → ash
   fire × water → explosion
   fire ÷ water → smoke

   king + power → emperor
   king − power → peasant
   king × power → tyrant
   king ÷ power → throne

   bird + flight → airplane
   bird − flight → penguin
   bird × flight → eagle
   bird ÷ flight → wing

   music + math → composition
   music − math → improvisation
   music × math → fugue
   music ÷ math → rhythm

   day + light → dawn
   day − light → night
   day × light → noon
   day ÷ light → sunshine

DISAMBIGUATION
- + creates a third thing. × keeps you on A and amplifies it. If your "+" answer is just a more extreme A, it should have been ×. If your "×" answer feels like a blend of A and B, it should have been +.
- − takes traits away. ÷ keeps only the traits that survive B's filter. If your "−" answer is a narrowed-down version of A, it should have been ÷.
- The same pair (A, B) under different operators MUST yield different results. If two operators would produce the same answer, you have misapplied one — pick a sharper interpretation.

RULES
- Evaluate left to right. king − man + woman is (king − man) + woman.
- Return a single existing word when possible. Two words only if no single word fits. Never return a descriptive phrase.
- Favor surprising-but-recognizable results over obvious ones.
- If the equation is incoherent, return: invalid equation

OUTPUT
The result concept only. 1–2 words, lowercase, no punctuation, no quotes, no explanation.`;

app.post('/api/openai/concept-calculator', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_CONCEPT,
      messages: [
        { role: "system", content: CONCEPT_CALCULATOR_SYSTEM_PROMPT },
        ...messages
      ],
      store: true,
      metadata: {
        endpoint: "operation"
      },
      max_completion_tokens: 1000,
    });
    res.json(completion);
  } catch (error) {
    console.error('Error in concept calculator:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/openai/emoji-generator', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_EMOJI,
      messages: [
        { role: "system", content: "You are an AI that suggests a single emoji that best represents a given concept. Respond with only the emoji, nothing else." },
        ...messages
      ],
      store: true,
      metadata: {
        endpoint: "emojigen"
      },
      max_completion_tokens: 64,
    });

    console.log('OpenAI API Response:', completion);

    if (completion.choices && completion.choices[0] && completion.choices[0].message) {
      const emoji = completion.choices[0].message.content.trim();
      res.json({ emoji: emoji });
    } else {
      console.error('Unexpected OpenAI API response structure:', completion);
      res.status(500).json({ error: 'Unexpected API response structure' });
    }
  } catch (error) {
    console.error('Error in emoji generator:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/save-equation', async (req, res) => {
  try {
    const { equation, solution } = req.body;
    if (process.env.POSTGRES_URL) {
      await sql`INSERT INTO equations (equation, solution) VALUES (${equation}, ${solution})`;
      res.status(200).json({ message: 'Equation saved successfully' });
    } else {
      res.status(200).json({ message: 'Equation processed (database save skipped)' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save equation', details: error.message });
  }
});

app.post('/api/anthropic/concept-calculator', async (req, res) => {
  try {
    const { messages } = req.body;
    const message = messages[0].content;

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL_CONCEPT,
      max_tokens: 4096,
      messages: [{ role: "user", content: message }],
      system: CONCEPT_CALCULATOR_SYSTEM_PROMPT
    });

    console.log('Anthropic response:', response);

    const textBlock = Array.isArray(response.content)
      ? response.content.find((b) => b.type === 'text')
      : null;
    if (textBlock?.text) {
      res.json({ content: textBlock.text });
    } else {
      throw new Error('Unexpected response structure from Anthropic');
    }
  } catch (error) {
    console.error('Detailed error in Anthropic concept calculator:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || error.stack
    });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Concept Calculator API');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', env: process.env.NODE_ENV });
});

if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {});
}

module.exports = app;