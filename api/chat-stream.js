// /api/chat-stream.js  – Node 20 Serverless (Vercel)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end('Only POST allowed');
    return;
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_DEFAULT;

  // Body (Vercel liefert ggf. String)
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const message = (body.message || '').toString().trim();

  // Streaming-Header
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    if (!message) {
      res.write('Fehlende Eingabe.');
      return res.end();
    }

    if (!OPENAI_KEY) {
      res.write(`Echo: ${message}\n(Kein OPENAI_API_KEY gesetzt)`);
      return res.end();
    }

    // OpenAI Chat Completions (stream)
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: 'Du bist ein hilfreicher, knapper Assistent.' },
          { role: 'user', content: message }
        ]
      })
    });

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => '');
      res.statusCode = 500;
      res.write('Upstream-Error: ' + t);
      return res.end();
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    // SSE-Stream in Klartext zusammenführen
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      // Die API sendet Server-Sent-Events (Zeilen mit "data: ...")
      for (const line of chunk.split('\n')) {
        const m = line.trim();
        if (!m.startsWith('data:')) continue;
        const data = m.slice(5).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content || '';
          if (delta) res.write(delta);
        } catch {
          // ignorieren
        }
      }
    }

    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end('Server-Error: ' + (err?.message || String(err)));
  }
}