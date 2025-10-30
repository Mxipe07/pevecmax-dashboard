function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
}
function sign(payload, secret){
  const header = b64url(JSON.stringify({ alg:"HS256", typ:"JWT" }));
  const body   = b64url(JSON.stringify(payload));
  const crypto = await import('node:crypto');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${header}.${body}.${sig}`;
}
async function verify(token, secret){
  const [h,p,s] = token.split('.');
  const crypto = await import('node:crypto');
  const expect = crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  if (s !== expect) throw new Error('bad sig');
  return JSON.parse(Buffer.from(p.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const cookieState = (req.headers.cookie || '').split('; ').find(c=>c.startsWith('pmx_oauth_state='))?.split('=')[1];

    if (!code || !state || state !== cookieState) {
      res.writeHead(400); res.end('Invalid state'); return;
    }

    // Token tauschen
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.OAUTH_REDIRECT_URL,
        grant_type: 'authorization_code'
      })
    });
    const token = await tokenRes.json();
    if (!token.id_token) { res.writeHead(500); res.end('No id_token'); return; }

    // id_token Payload decoden (Profilbild etc. kommt direkt mit)
    const [, payloadB64] = token.id_token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64.replace(/-/g,'+').replace(/_/g,'/'), 'base64').toString('utf8'));

    const user = {
      sub: payload.sub,
      name: payload.name || '',
      email: payload.email || '',
      picture: payload.picture || '',
      iat: Math.floor(Date.now()/1000),
      exp: Math.floor(Date.now()/1000) + 7*24*3600 // 7 Tage
    };

    // eigene Session-JWT signieren (nur Userdaten, keine Google-Secrets)
    const jwt = await sign(user, process.env.SESSION_SECRET);

    // Cookies setzen
    res.setHeader('Set-Cookie', [
      `pmx_session=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${7*24*3600}`,
      `pmx_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    ]);

    res.writeHead(302, { Location: '/' });
    res.end();
  } catch (e) {
    res.writeHead(500); res.end('Auth error');
  }
}