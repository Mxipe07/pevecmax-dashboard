export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { message } = await req.json();
  const reply = `(${new Date().toLocaleTimeString()}) Echo: ${message}`;
  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json' }
  });
}