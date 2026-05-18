async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

const API = {
  getConceptEmoji: async (text) => {
    const data = await postJson('/api/openai/emoji-generator', {
      messages: [{ role: 'user', content: text }],
    });
    return data.emoji;
  },

  getSolution: async (equation, model = 'gpt4') => {
    const prompt = `Solve this conceptual equation: ${equation}.`;
    const endpoint =
      model === 'gpt4'
        ? '/api/openai/concept-calculator'
        : '/api/anthropic/concept-calculator';
    const data = await postJson(endpoint, {
      messages: [{ role: 'user', content: prompt }],
    });
    if (model === 'gpt4') {
      if (data?.choices?.[0]?.message) {
        return data.choices[0].message.content;
      }
    } else if (data?.content) {
      return data.content;
    }
    console.error('Unexpected response structure:', data);
    throw new Error('Unexpected response structure from server');
  },

  saveEquation: async (equation, solution) => {
    return postJson('/api/save-equation', { equation, solution });
  },
};

export default API;
