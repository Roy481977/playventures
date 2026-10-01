// Shared-password gate: main password opens the full Rain plan, the Lucky Rain
// password opens only the frozen casino copy at /luckyrain/.
const MAINS = ['roysentme', '123456'];   // full site (incl. /api and /luckyrain)
const LUCKY = 'lucky2027';      // Lucky Rain casino plan only

const loginHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Business Plan</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#f9f9f7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.card{background:#fcfcfb;border:1px solid rgba(11,11,11,.1);border-radius:16px;padding:34px 38px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.06)}
h1{font-size:17px;margin:0 0 4px}p{color:#52514e;font-size:13px;margin:0 0 18px}
input{font:inherit;padding:10px 12px;border:1px solid #e1e0d9;border-radius:9px;width:200px;text-align:center;font-size:15px}
button{font:inherit;margin-top:12px;padding:10px 22px;border:none;border-radius:9px;background:#2a78d6;color:#fff;font-weight:600;cursor:pointer;display:block;width:100%}
.err{color:#d03b3b;font-size:12px;margin-top:10px;min-height:15px}</style></head>
<body><form class="card" method="GET" action="/auth">
<h1>Business Plan</h1><p>Enter password</p>
<input type="password" name="pw" autofocus autocomplete="current-password">
<button type="submit">Enter</button><div class="err">__ERR__</div>
</form></body></html>`;

export const config = { matcher: ['/((?!favicon.ico).*)'] };

function setCookie(pw, dest) {
  return new Response(null, { status: 302, headers: {
    'Location': dest,
    'Set-Cookie': 'rg_auth=' + pw + '; Path=/; Max-Age=2592000; SameSite=Lax; HttpOnly'
  }});
}

export default function middleware(req) {
  const url = new URL(req.url);
  const cookies = req.headers.get('cookie') || '';
  const inLucky = url.pathname === '/luckyrain' || url.pathname.startsWith('/luckyrain/');
  if (MAINS.some(pw => cookies.includes('rg_auth=' + pw))) return;   // full access
  if (cookies.includes('rg_auth=' + LUCKY)) {                  // Lucky Rain only
    if (inLucky) return;
    return new Response(null, { status: 302, headers: { 'Location': '/luckyrain/' } });
  }
  if (url.pathname === '/auth') {
    const pw = url.searchParams.get('pw');
    if (MAINS.includes(pw)) return setCookie(pw, '/');
    if (pw === LUCKY) return setCookie(LUCKY, '/luckyrain/');
    return new Response(loginHtml.replace('__ERR__', 'Wrong password'), { status: 401, headers: { 'Content-Type': 'text/html' } });
  }
  return new Response(loginHtml.replace('__ERR__', ''), { status: 401, headers: { 'Content-Type': 'text/html' } });
}
