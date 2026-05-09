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

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
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

Each input is a point in concept space. Each operator moves you to a new point. The result must LAND ON A NAMED CONCEPT — a real thing the language already has a word for — not a description of a blend.

OPERATORS
+  Synthesis. A concept that fuses the defining traits of both inputs.
   horse + stripes → zebra
   fire + water → steam
   bread + meat → sandwich

-  Negation. The first input with the second input's traits removed.
   king - power → peasant
   bird - flight → penguin
   day - light → night

×  Intensification. The shared or dominant traits taken to an extreme.
   light × focus → laser
   water × pressure → geyser
   sound × repetition → chant

÷  Specialization. The first input narrowed through the lens of the second.
   music ÷ math → rhythm
   forest ÷ city → park
   ocean ÷ cold → glacier

RULES
- Evaluate left to right. king - man + woman is (king - man) + woman.
- Return a single existing word when possible. Two words only if no single word fits. Never return a descriptive phrase.
- Favor surprising-but-recognizable results over obvious ones.
- If the input is not a coherent equation, return: invalid equation

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