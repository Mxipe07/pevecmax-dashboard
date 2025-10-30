export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    if (req.method !== 'POST')
      return new Response('Only POST allowed', { status: 405 });

    const { message } = await req.json();

    // Wenn kein API-Key gesetzt ist, gibt’s ein einfaches Echo
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ reply: `(Testmodus) Du sagtest: ${message}` }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // OpenAI-API-Call
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Du bist ein freundlicher KI-Assistent für pevecmax.uk.' },
          { role: 'user', content: message }
        ],
        temperature: 0.7
      })
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ reply: `Fehler: ${err}` }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Keine Antwort.';
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ reply: `Fehler: ${e.message}` }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}