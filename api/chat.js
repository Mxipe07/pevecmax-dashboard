// /api/chat.js
// Vercel Serverless Function – OpenAI Anbindung
// funktioniert ohne Zusatzpakete

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).json({ error: true, message: "Only POST allowed" });
    return;
  }

  const OPENAI_KEY = process.env.OPENAI_API_KEY;

  try {
    const { message } = JSON.parse(req.body || "{}");

    if (!message) {
      return res.status(400).json({ error: true, reply: "Fehler: Keine Nachricht empfangen." });
    }

    if (!OPENAI_KEY) {
      return res.status(200).json({ reply: `Echo: ${message}\n(Kein API-Key gesetzt)` });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: "Antworte kurz, klar und auf Deutsch." },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.error?.message || "Unbekannter API-Fehler";
      return res.status(200).json({ error: true, reply: "Fehler von OpenAI: " + msg });
    }

    const reply = data.choices?.[0]?.message?.content?.trim() || "Keine Antwort.";
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(200).json({
      error: true,
      reply: "Serverfehler: " + (err.message || JSON.stringify(err)),
    });
  }
}