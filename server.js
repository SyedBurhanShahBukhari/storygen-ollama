/**
 * Local AI Story Generator server (Node 18+)
 * - Serves the frontend from /public
 * - Proxies requests to local Ollama (http://localhost:11434)
 * - No paid API keys required
 *
 * Usage:
 *   1) Install Node 18+
 *   2) npm i express cors
 *   3) Install Ollama and run: ollama pull qwen2.5:7b-instruct
 *   4) node server.js
 *   5) Open http://localhost:3000
 */
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.MODEL || 'qwen2.5:7b-instruct'; // change to 'mistral:7b-instruct' if you prefer

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function buildMessages(body) {
  const sys = `You are an award-winning fiction ghostwriter. You never include prefaces or disclaimers—only the story. You follow the user's constraints carefully, keep coherence, and avoid repetition. If the user asks for a length, aim near it.`;
  const user = body.prompt || 'Write a short story.';
  return [
    { role: 'system', content: sys },
    { role: 'user', content: user }
  ];
}

app.post('/api/generate', async (req, res) => {
  try {
    // Node 18+ has global fetch
    if (typeof fetch !== 'function') {
      return res.status(500).json({ error: 'Node 18+ required (global fetch missing).' });
    }

    const messages = buildMessages(req.body || {});
    const temperature = 0.9;
    const ollamaResp = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: false,
        options: {
          temperature,
          num_ctx: 4096
        }
      })
    });

    if (!ollamaResp.ok) {
      const text = await ollamaResp.text();
      return res.status(500).json({ error: 'Ollama returned an error', details: text });
    }

    const data = await ollamaResp.json();
    // Ollama chat returns { message: { role, content }, done: true }
    const story = data?.message?.content || data?.response || '';
    res.json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Story generator ready: http://localhost:${PORT}`);
  console.log(`Using model: ${MODEL}`);
});
