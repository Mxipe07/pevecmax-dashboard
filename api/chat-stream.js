// /api/chat-stream.js  – CommonJS kompatibel (Vercel Node runtime)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) {
    res.status(500).json({ error: 'OPENAI_API_KEY not set' });
    return;
  }

  // Body sicher einlesen (string oder schon geparst)
  let body = {};
  try {
    if (typeof req.body === 'string') body = JSON.parse(req.body || '{}');
    else if (req.body && typeof req.body === 'object') body = req.body;
    else {
      let buf = '';
      for await (const chunk of req) buf += chunk;
      body = JSON.parse(buf || '{}');
    }
  } catch {
    body = {};
  }

  const userMsg = (body.message || '').toString().trim();

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        stream: true,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text();
      res.status(upstream.status || 500).end(text || 'Upstream error');
      return;
    }

    // Streaming-Antwort durchreichen
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache, no-transform',
    });

    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('Chat proxy error:', err);
    res.status(500).json({ error: 'Chat API error' });
  }
};