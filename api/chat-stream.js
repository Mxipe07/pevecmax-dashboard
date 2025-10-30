// /api/chat-stream.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Only POST allowed");
    return;
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const message = (body.message || "").toString().trim();

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Transfer-Encoding", "chunked");

  try {
    if (!message) {
      res.write("Keine Nachricht empfangen.");
      return res.end();
    }

    if (!OPENAI_KEY) {
      res.write(`Echo: ${message} (kein OPENAI_API_KEY gesetzt)`);
      return res.end();
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        stream: true,
        temperature: 0.5,
        messages: [
          { role: "system", content: "Antworte kurz, freundlich und auf Deutsch." },
          { role: "user", content: message },
        ],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const t = await upstream.text().catch(() => "");
      res.write("API-Fehler: " + (t || upstream.statusText));
      return res.end();
    }

    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    for await (const chunk of upstream.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.replace(/^data:\s*/, "");
        if (data === "[DONE]") return res.end();

        try {
          const json = JSON.parse(data);
          const piece = json?.choices?.[0]?.delta?.content || "";
          if (piece) res.write(piece);
        } catch {}
      }
    }

    res.end();
  } catch (err) {
    res.write("Serverfehler: " + (err.message || String(err)));
    res.end();
  }
}
