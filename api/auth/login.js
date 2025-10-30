export default async function handler(req, res) {
  const state = Math.random().toString(36).slice(2) + Date.now();
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.OAUTH_REDIRECT_URL,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    include_granted_scopes: 'true',
    prompt: 'consent',
    state
  });

  // CSRF-Guard
  res.setHeader('Set-Cookie', [
    `pmx_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  ]);

  res.writeHead(302, { Location: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  res.end();
}