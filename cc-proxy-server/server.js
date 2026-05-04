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

app.post('/api/openai/concept-calculator', async (req, res) => {
  try {
    const { messages } = req.body;
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL_CONCEPT,
      messages: [
        { role: "system", 
          content: 
          `
            You are an expert in word arithmetic, tasked with interpreting and solving semantic equations. Your role is to calculate logical solutions based on mathematical operations applied to conceptual words. Each operation has a distinct effect, and results should vary according to the unique role of each operation. Below is a list of instructions for each operation.

            (+) Addition: Combine defining traits of inputs to expand on or blend the concept while maintaining identifiable characteristics.

            (-) Subtraction: Remove defining traits or core characteristics, leading to a diminished or simplified version of the input concepts. 

            (×) Multiplication: Amplify or exaggerates defining traits or core characteristic, resulting in a more powerful, enhanced version of the input concepts. The output should feel greater than the sum of its parts. 

            (÷) Division: Breakdown input concepts into specific, smaller components or fragments, with a narrower scope or purpose. The result should be more specific or focused, often resulting in a subset or fragment of the input concepts. 

            Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept (e.g., "🧠 scientist").
          `
        },
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
      system: `You are an expert in word arithmetic, tasked with interpreting and solving semantic equations. Your role is to calculate logical solutions based on mathematical operations applied to conceptual words. Each operation has a distinct effect, and results should vary according to the unique role of each operation. Below is a list of instructions for each operation.

        (+) Addition: Combine defining traits of inputs to expand on or blend the concept while maintaining identifiable characteristics.

        (-) Subtraction: Remove defining traits or core characteristics, leading to a diminished or simplified version of the input concepts. 

        (×) Multiplication: Amplify or exaggerates defining traits or core characteristic, resulting in a more powerful, enhanced version of the input concepts. The output should feel greater than the sum of its parts. 

        (÷) Division: Breakdown input concepts into specific, smaller components or fragments, with a narrower scope or purpose. The result should be more specific or focused, often resulting in a subset or fragment of the input concepts. 

        Respond to the user with only the final solution (less than 5 words, no punctuation) that is preceded by an emoji that best illustrates the concept (e.g., "🧠 scientist").`
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