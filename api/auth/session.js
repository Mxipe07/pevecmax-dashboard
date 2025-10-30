async function verify(token, secret){
  const [h,p,s] = token.split('.');
  const crypto = await import('node:crypto');
  const expect = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  if (s !== expect) throw new Error('bad sig');
  const data = JSON.parse(Buffer.from(p.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('utf8'));
  if (!data.exp || data.exp < Math.floor(Date.now()/1000)) throw new Error('expired');
  return data;
}

export default async function handler(req, res) {
  try {
    const cookie = (req.headers.cookie || '').split('; ').find(c=>c.startsWith('pmx_session='))?.split('=')[1];
    if (!cookie) { res.writeHead(401); res.end('no'); return; }
    const user = await verify(cookie, process.env.SESSION_SECRET);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ user }));
  } catch {
    res.writeHead(401); res.end('no');
  }
}