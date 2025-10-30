// /api/chat.js
// Vercel Serverless-Function (Node 18+). Kein extra Paket nötig.

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// Kleine Helper-Funktion für einheitliche Antworten
function sendJSON(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  // Nur POST erlauben
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJSON(res, 405, { error: true, message: "Use POST /api/chat" });
  }

  try {
    const { message } = JSON.parse(req.body || "{}");
    if (!message || typeof message !== "string") {
      return sendJSON(res, 400, { error: true, message: "Missing 'message' string." });
    }

    // Kein Key? – freundliche Fallback-Antwort statt Crash
    if (!OPENAI_KEY) {
      return sendJSON(res, 200, {
        reply:
          "Hinweis: Es ist kein OPENAI_API_KEY gesetzt. Echo-Antwort:\n\n" +
          `„${message}“`,
      });
    }

    // OpenAI Chat Completions (einfach & robust)
    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // günstig & gut; bei Bedarf ändern
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "Antworte kurz, klar und auf Deutsch. Sei hilfreich und direkt.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const data = await apiRes.json();

    // API-Fehler sauber abfangen (z. B. insufficient_quota)
    if (!apiRes.ok) {
      const msg =
        data?.error?.message ||
        `OpenAI error (${apiRes.status}) – prüfe Key/Quota.`;
      return sendJSON(res, 200, {
        error: true,
        reply:
          "Ich konnte gerade nicht antworten (API-Fehler). Bitte später nochmal.\n\n" +
          `Details: ${msg}`,
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim() ||
      "Keine Antwort erhalten.";

    return sendJSON(res, 200, { reply });
  } catch (err) {
    return sendJSON(res, 200, {
      error: true,
      reply: "Unerwarteter Fehler. Versuch es gleich nochmal.",
    });
  }
};