export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).json({ ok: true, time: new Date().toISOString() });
}