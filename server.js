const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const PORT = Number(process.env.PORT) || 3000;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured.');
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});
const publicFiles = {
  '/': ['index.html', 'text/html'],
  '/index.html': ['index.html', 'text/html'],
  '/script.js': ['script.js', 'text/javascript'],
  '/styles.css': ['styles.css', 'text/css']
};

function sendJson(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
  response.end(JSON.stringify(body));
}

function sessionCookie(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${secure}`;
}

function clearSessionCookie() {
  return 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0';
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const separator = part.indexOf('=');
    return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
  }));
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [salt, key] = storedHash.split(':');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey));
    });
  });
}

async function readRequestBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 10_000) throw new Error('Request body too large.');
  }
  return JSON.parse(body || '{}');
}

function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function createSession(email) {
  const token = crypto.randomBytes(32).toString('hex');
  const { error } = await supabase.from('sessions').insert({
    token_hash: hashSessionToken(token),
    email,
    expires_at: new Date(Date.now() + 86_400_000).toISOString()
  });
  if (error) throw error;
  return token;
}

async function currentSession(request) {
  const token = parseCookies(request).session;
  if (!token) return null;
  const { data, error } = await supabase
    .from('sessions')
    .select('email, expires_at')
    .eq('token_hash', hashSessionToken(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data ? { token, email: data.email } : null;
}

async function handleApi(request, response) {
  try {
    if (request.method === 'GET' && request.url === '/api/session') {
      const session = await currentSession(request);
      return session ? sendJson(response, 200, { email: session.email }) : sendJson(response, 401, { error: 'Not signed in.' });
    }

    if (request.method === 'POST' && (request.url === '/api/signup' || request.url === '/api/login')) {
      const { email: rawEmail, password } = await readRequestBody(request);
      const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
      if (!validEmail(email)) return sendJson(response, 400, { error: 'Enter a valid email address.' });
      if (typeof password !== 'string' || password.length < 8) return sendJson(response, 400, { error: 'Password must be at least 8 characters.' });

      if (request.url === '/api/signup') {
        const { error } = await supabase.from('users').insert({
          email,
          password_hash: await hashPassword(password)
        });
        if (error?.code === '23505') return sendJson(response, 409, { error: 'An account with that email already exists.' });
        if (error) throw error;
      } else {
        const { data: user, error } = await supabase
          .from('users')
          .select('password_hash')
          .eq('email', email)
          .maybeSingle();
        if (error) throw error;
        if (!user || !(await verifyPassword(password, user.password_hash))) {
          return sendJson(response, 401, { error: 'Invalid email or password.' });
        }
      }

      return sendJson(response, 200, { email }, { 'Set-Cookie': sessionCookie(await createSession(email)) });
    }

    if (request.method === 'POST' && request.url === '/api/logout') {
      const session = await currentSession(request);
      if (session) {
        const { error } = await supabase.from('sessions').delete().eq('token_hash', hashSessionToken(session.token));
        if (error) throw error;
      }
      return sendJson(response, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    }

    sendJson(response, 404, { error: 'Not found.' });
  } catch (error) {
    console.error(error);
    sendJson(response, 400, { error: 'Unable to process the request.' });
  }
}

const server = http.createServer(async (request, response) => {
  if (request.url.startsWith('/api/')) return handleApi(request, response);
  const file = publicFiles[request.url];
  if (!file) return sendJson(response, 404, { error: 'Not found.' });
  try {
    response.writeHead(200, { 'Content-Type': file[1], 'X-Content-Type-Options': 'nosniff' });
    response.end(await fs.readFile(path.join(__dirname, file[0])));
  } catch {
    sendJson(response, 500, { error: 'Unable to load the page.' });
  }
});

server.listen(PORT, () => console.log(`Login website running at http://localhost:${PORT}`));
