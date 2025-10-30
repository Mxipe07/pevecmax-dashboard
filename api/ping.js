export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');
    if (!url) return new Response(JSON.stringify({ ok: false }), { status: 400 });
    const started = Date.now();
    const res = await fetch(url, { method: 'HEAD' });
    const ms = Date.now() - started;
    return new Response(JSON.stringify({ ok: res.ok, status: res.status, ms }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 200 });
  }
}