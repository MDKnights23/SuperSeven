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
const COMMISSIONER_EMAIL = 'matthewhellmann2013@gmail.com';
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
  const isSecureContext = process.env.NODE_ENV === 'production' || process.env.HTTPS === 'true';
  const secureFlag = isSecureContext ? '; Secure' : '';
  const sameSite = isSecureContext ? 'None' : 'Lax';
  return `session=${token}; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=86400${secureFlag}`;
}

function clearSessionCookie() {
  const isSecureContext = process.env.NODE_ENV === 'production' || process.env.HTTPS === 'true';
  const secureFlag = isSecureContext ? '; Secure' : '';
  const sameSite = isSecureContext ? 'None' : 'Lax';
  return `session=; HttpOnly; SameSite=${sameSite}; Path=/; Max-Age=0${secureFlag}`;
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

function isCommissioner(email) {
  return typeof email === 'string' && email.toLowerCase() === COMMISSIONER_EMAIL.toLowerCase();
}

function sanitizeDisplayName(name, fallbackEmail) {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) {
    return fallbackEmail;
  }
  return trimmed.slice(0, 40);
}

function normalizeDisplayNameKey(value) {
  return sanitizeDisplayName(value, '').trim().toLowerCase();
}

async function entryNameExists(ownerEmail, displayName, excludeEntryId = null) {
  const normalizedEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  const normalizedDisplayName = normalizeDisplayNameKey(displayName);
  if (!validEmail(normalizedEmail) || !normalizedDisplayName) {
    return false;
  }

  let query = supabase
    .from('user_entries')
    .select('id, display_name')
    .eq('owner_email', normalizedEmail);
  if (excludeEntryId) {
    query = query.neq('id', excludeEntryId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).some((entry) => normalizeDisplayNameKey(entry.display_name) === normalizedDisplayName);
}

function normalizeAvatarInitial(value) {
  const cleaned = String(value ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
  return cleaned || 'P';
}

function normalizeAvatarColor(value, fallback) {
  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) {
    return fallback;
  }
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(candidate) ? candidate : fallback;
}

function normalizeStandingsUserRow(row) {
  return {
    id: row.id,
    entryId: row.id,
    ownerEmail: row.owner_email || row.email,
    email: row.owner_email || row.email,
    name: row.display_name || row.email,
    picks: Array.isArray(row.picks) ? row.picks : [],
    superLocks: row.super_locks && typeof row.super_locks === 'object' ? row.super_locks : {},
    joinedContests: Array.isArray(row.joined_contests) ? row.joined_contests : [],
    paid: Boolean(row.paid),
    avatarInitial: normalizeAvatarInitial(row.avatar_initial),
    avatarColor: normalizeAvatarColor(row.avatar_color, '#7c3aed'),
    avatarTextColor: normalizeAvatarColor(row.avatar_text_color, '#ffffff')
  };
}

function getDefaultAvatarInitial(displayName, fallback = 'P') {
  return normalizeAvatarInitial(String(displayName || fallback).trim().charAt(0) || fallback);
}

async function ensureUserEntry(ownerEmail) {
  const normalizedEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  if (!validEmail(normalizedEmail)) {
    return;
  }

  const { data: existingEntries, error: entriesError } = await supabase
    .from('user_entries')
    .select('id')
    .eq('owner_email', normalizedEmail)
    .limit(1);
  if (entriesError) throw entriesError;

  if (Array.isArray(existingEntries) && existingEntries.length > 0) {
    return;
  }

  const { data: legacyRow, error: legacyError } = await supabase
    .from('standings_users')
    .select('display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (legacyError) throw legacyError;

  const { error } = await supabase
    .from('user_entries')
    .insert({
      id: crypto.randomUUID(),
      owner_email: normalizedEmail,
      display_name: sanitizeDisplayName(legacyRow?.display_name || normalizedEmail, normalizedEmail),
      picks: Array.isArray(legacyRow?.picks) ? legacyRow.picks : [],
      super_locks: legacyRow?.super_locks && typeof legacyRow.super_locks === 'object' ? legacyRow.super_locks : {},
      joined_contests: Array.isArray(legacyRow?.joined_contests) && legacyRow.joined_contests.length ? legacyRow.joined_contests : ['super7'],
      paid: Boolean(legacyRow?.paid),
      avatar_initial: normalizeAvatarInitial(legacyRow?.avatar_initial || getDefaultAvatarInitial(legacyRow?.display_name || normalizedEmail)),
      avatar_color: normalizeAvatarColor(legacyRow?.avatar_color, '#7c3aed'),
      avatar_text_color: normalizeAvatarColor(legacyRow?.avatar_text_color, '#ffffff'),
      updated_at: new Date().toISOString()
    });
  if (error) throw error;
}

async function getUserEntries(ownerEmail) {
  const normalizedEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  if (!validEmail(normalizedEmail)) {
    return [];
  }

  const { data, error } = await supabase
    .from('user_entries')
    .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color, updated_at')
    .eq('owner_email', normalizedEmail)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(normalizeStandingsUserRow);
}

async function listCommissionerUsers() {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('email, created_at')
    .order('created_at', { ascending: false });
  if (usersError) throw usersError;

  const { data: standingsRows, error: standingsError } = await supabase
    .from('standings_users')
    .select('email, display_name');
  if (standingsError) throw standingsError;

  const displayNamesByEmail = new Map((standingsRows || []).map((row) => [String(row.email).toLowerCase(), row.display_name || row.email]));

  return (users || []).map((user) => ({
    email: user.email,
    displayName: displayNamesByEmail.get(String(user.email).toLowerCase()) || user.email
  }));
}

async function handleApi(request, response) {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

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
        await ensureUserEntry(email);
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
        await ensureUserEntry(email);
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

    if (request.method === 'GET' && requestUrl.pathname === '/api/commish-users') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }
      if (!isCommissioner(session.email)) {
        return sendJson(response, 403, { error: 'Only the commissioner can view member details.' });
      }

      const users = await listCommissionerUsers();
      return sendJson(response, 200, { users });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/commish-remove-user') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }
      if (!isCommissioner(session.email)) {
        return sendJson(response, 403, { error: 'Only the commissioner can remove members.' });
      }

      const { email: rawEmail } = await readRequestBody(request);
      const targetEmail = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
      if (!validEmail(targetEmail)) {
        return sendJson(response, 400, { error: 'Valid email is required.' });
      }
      if (targetEmail === COMMISSIONER_EMAIL.toLowerCase()) {
        return sendJson(response, 403, { error: 'The commissioner account cannot be removed.' });
      }

      const { error } = await supabase.from('users').delete().eq('email', targetEmail);
      if (error) throw error;

      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/standings-users') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      await ensureUserEntry(session.email);

      const { data: entryRows, error: entriesError } = await supabase
        .from('user_entries')
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color, updated_at')
        .order('updated_at', { ascending: false });
      if (entriesError) throw entriesError;

      const users = (entryRows || []).map(normalizeStandingsUserRow);
      return sendJson(response, 200, { users });
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/entries-me') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      await ensureUserEntry(session.email);
      const entries = await getUserEntries(session.email);
      return sendJson(response, 200, { entries });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/entries') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const body = await readRequestBody(request);
      const ownerEmail = session.email;
      const { data: existingEntries, error: existingError } = await supabase
        .from('user_entries')
        .select('id')
        .eq('owner_email', ownerEmail);
      if (existingError) throw existingError;

      if ((existingEntries || []).length >= 3) {
        return sendJson(response, 400, { error: 'Each email address may have at most 3 entries.' });
      }

      const displayName = sanitizeDisplayName(body.displayName, ownerEmail);
      if (await entryNameExists(ownerEmail, displayName)) {
        return sendJson(response, 409, { error: 'That entry name already exists for this email address.' });
      }
      const avatarInitial = normalizeAvatarInitial(body.avatarInitial || getDefaultAvatarInitial(displayName || ownerEmail));
      const avatarColor = normalizeAvatarColor(body.avatarColor, '#7c3aed');
      const avatarTextColor = normalizeAvatarColor(body.avatarTextColor, '#ffffff');

      const { data, error } = await supabase
        .from('user_entries')
        .insert({
          id: crypto.randomUUID(),
          owner_email: ownerEmail,
          display_name: displayName,
          picks: [],
          super_locks: {},
          joined_contests: ['super7'],
          paid: false,
          avatar_initial: avatarInitial,
          avatar_color: avatarColor,
          avatar_text_color: avatarTextColor,
          updated_at: new Date().toISOString()
        })
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
        .single();
      if (error) throw error;

      return sendJson(response, 200, { entry: normalizeStandingsUserRow(data) });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/entries-delete') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const body = await readRequestBody(request);
      const entryId = typeof body.entryId === 'string' ? body.entryId.trim() : '';
      const entryName = sanitizeDisplayName(body.entryName, '');
      if (!entryId) {
        return sendJson(response, 400, { error: 'Entry ID is required.' });
      }

      const { data: ownerEntries, error: ownerEntriesError } = await supabase
        .from('user_entries')
        .select('id')
        .eq('owner_email', session.email);
      if (ownerEntriesError) throw ownerEntriesError;

      if ((ownerEntries || []).length <= 1) {
        return sendJson(response, 400, { error: 'You must keep at least one entry for this email address.' });
      }

      const { data: targetEntry, error: targetEntryError } = await supabase
        .from('user_entries')
        .select('id, owner_email, display_name')
        .eq('id', entryId)
        .eq('owner_email', session.email)
        .maybeSingle();
      if (targetEntryError) throw targetEntryError;
      let resolvedEntry = targetEntry;

      if (!resolvedEntry && entryName) {
        const { data: nameMatch, error: nameMatchError } = await supabase
          .from('user_entries')
          .select('id, owner_email, display_name')
          .eq('owner_email', session.email)
          .eq('display_name', entryName)
          .maybeSingle();
        if (nameMatchError) throw nameMatchError;
        resolvedEntry = nameMatch;
      }

      if (!resolvedEntry) {
        return sendJson(response, 404, { error: 'Could not locate that entry. Refresh the page and try again.' });
      }

      const { error } = await supabase
        .from('user_entries')
        .delete()
        .eq('id', resolvedEntry.id)
        .eq('owner_email', session.email);
      if (error) throw error;

      return sendJson(response, 200, { ok: true, removedEntryId: resolvedEntry.id, removedName: resolvedEntry.display_name });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/avatar-me') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const body = await readRequestBody(request);
      await ensureUserEntry(session.email);

      let targetEntryId = typeof body.entryId === 'string' ? body.entryId.trim() : '';
      let targetQuery = supabase
        .from('user_entries')
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
        .eq('owner_email', session.email);
      if (targetEntryId) {
        targetQuery = targetQuery.eq('id', targetEntryId);
      }

      const { data: targetRows, error: existingError } = await targetQuery.order('updated_at', { ascending: false }).limit(1);
      if (existingError) throw existingError;
      const existingRow = Array.isArray(targetRows) && targetRows.length ? targetRows[0] : null;
      if (!existingRow) {
        return sendJson(response, 404, { error: 'Entry not found.' });
      }

      const displayName = sanitizeDisplayName(existingRow?.display_name || session.email, session.email);
      if (await entryNameExists(session.email, displayName, existingRow.id)) {
        return sendJson(response, 409, { error: 'That entry name already exists for this email address.' });
      }
      const picks = Array.isArray(existingRow?.picks) ? existingRow.picks : [];
      const superLocks = existingRow?.super_locks && typeof existingRow.super_locks === 'object' ? existingRow.super_locks : {};
      const joinedContests = Array.isArray(existingRow?.joined_contests) ? existingRow.joined_contests : ['super7'];
      const avatarInitial = normalizeAvatarInitial(body.initial || body.avatarInitial || body.avatar_initial || existingRow?.avatar_initial || 'P');
      const avatarColor = normalizeAvatarColor(body.color || body.avatarColor || body.avatar_color || existingRow?.avatar_color, '#7c3aed');
      const avatarTextColor = normalizeAvatarColor(body.textColor || body.avatarTextColor || body.avatar_text_color || existingRow?.avatar_text_color, '#ffffff');

      const { data, error } = await supabase
        .from('user_entries')
        .upsert({
          id: existingRow.id,
          owner_email: session.email,
          display_name: displayName,
          picks,
          super_locks: superLocks,
          joined_contests: joinedContests,
          avatar_initial: avatarInitial,
          avatar_color: avatarColor,
          avatar_text_color: avatarTextColor,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
        .single();
      if (error) throw error;

      return sendJson(response, 200, { user: normalizeStandingsUserRow(data) });
    }

    if (request.method === 'PUT' && requestUrl.pathname === '/api/standings-me') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const body = await readRequestBody(request);
      await ensureUserEntry(session.email);

      let targetEntryId = typeof body.entryId === 'string' ? body.entryId.trim() : '';
      let targetQuery = supabase
        .from('user_entries')
        .select('id, owner_email, paid')
        .eq('owner_email', session.email);
      if (targetEntryId) {
        targetQuery = targetQuery.eq('id', targetEntryId);
      }
      const { data: entryRows, error: entryLookupError } = await targetQuery.order('updated_at', { ascending: false }).limit(1);
      if (entryLookupError) throw entryLookupError;
      const targetEntry = Array.isArray(entryRows) && entryRows.length ? entryRows[0] : null;
      if (!targetEntry) {
        return sendJson(response, 404, { error: 'Entry not found.' });
      }

      const displayName = sanitizeDisplayName(body.displayName, session.email);
      if (await entryNameExists(session.email, displayName, targetEntry.id)) {
        return sendJson(response, 409, { error: 'That entry name already exists for this email address.' });
      }
      const picks = Array.isArray(body.picks) ? body.picks : [];
      const superLocks = body.superLocks && typeof body.superLocks === 'object' ? body.superLocks : {};
      const joinedContests = Array.isArray(body.joinedContests) ? body.joinedContests : [];

      const { data, error } = await supabase
        .from('user_entries')
        .upsert({
          id: targetEntry.id,
          owner_email: session.email,
          display_name: displayName,
          picks,
          super_locks: superLocks,
          joined_contests: joinedContests,
          paid: Boolean(targetEntry.paid),
          avatar_initial: normalizeAvatarInitial(body.avatarInitial || body.avatar_initial || 'P'),
          avatar_color: normalizeAvatarColor(body.avatarColor || body.avatar_color, '#7c3aed'),
          avatar_text_color: normalizeAvatarColor(body.avatarTextColor || body.avatar_text_color, '#ffffff'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
        .single();
      if (error) throw error;

      return sendJson(response, 200, { user: normalizeStandingsUserRow(data) });
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/standings-me') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      await ensureUserEntry(session.email);
      const entries = await getUserEntries(session.email);
      const user = entries[0] || null;
      return sendJson(response, 200, { user, entries });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/standings-paid') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }
      if (!isCommissioner(session.email)) {
        return sendJson(response, 403, { error: 'Only commissioner can update paid status.' });
      }

      const body = await readRequestBody(request);
      const isPaid = Boolean(body.isPaid);

      if (typeof body.entryId === 'string' && body.entryId.trim()) {
        const { error } = await supabase
          .from('user_entries')
          .update({ paid: isPaid, updated_at: new Date().toISOString() })
          .eq('id', body.entryId.trim());
        if (error) throw error;
        return sendJson(response, 200, { ok: true });
      }

      const targetEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      if (!validEmail(targetEmail)) {
        return sendJson(response, 400, { error: 'Entry ID or valid email is required.' });
      }

      const { error } = await supabase
        .from('user_entries')
        .update({ paid: isPaid, updated_at: new Date().toISOString() })
        .eq('owner_email', targetEmail);
      if (error) throw error;

      return sendJson(response, 200, { ok: true });
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/standings-user-picks') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }
      if (!isCommissioner(session.email)) {
        return sendJson(response, 403, { error: 'Only commissioner can update other player picks.' });
      }

      const body = await readRequestBody(request);
      const picks = Array.isArray(body.picks) ? body.picks : [];
      const superLocks = body.superLocks && typeof body.superLocks === 'object' ? body.superLocks : {};

      let existingRow = null;
      if (typeof body.entryId === 'string' && body.entryId.trim()) {
        const { data, error } = await supabase
          .from('user_entries')
          .select('id, owner_email, display_name, paid, joined_contests, avatar_initial, avatar_color, avatar_text_color')
          .eq('id', body.entryId.trim())
          .maybeSingle();
        if (error) throw error;
        existingRow = data;
      } else {
        const targetEmail = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
        if (!validEmail(targetEmail)) {
          return sendJson(response, 400, { error: 'Entry ID or valid email is required.' });
        }
        const { data, error } = await supabase
          .from('user_entries')
          .select('id, owner_email, display_name, paid, joined_contests, avatar_initial, avatar_color, avatar_text_color')
          .eq('owner_email', targetEmail)
          .eq('display_name', sanitizeDisplayName(body.displayName, targetEmail))
          .maybeSingle();
        if (error) throw error;
        existingRow = data;
      }

      if (!existingRow) {
        return sendJson(response, 404, { error: 'Entry not found.' });
      }

      const targetEmail = existingRow.owner_email;

      const displayName = sanitizeDisplayName(body.displayName, targetEmail);
      const avatarInitial = normalizeAvatarInitial(body.avatarInitial || body.avatar_initial || existingRow?.avatar_initial || 'P');
      const avatarColor = normalizeAvatarColor(body.avatarColor || body.avatar_color || existingRow?.avatar_color, '#7c3aed');
      const avatarTextColor = normalizeAvatarColor(body.avatarTextColor || body.avatar_text_color || existingRow?.avatar_text_color, '#ffffff');
      const { data, error } = await supabase
        .from('user_entries')
        .upsert({
          id: existingRow.id,
          owner_email: targetEmail,
          display_name: displayName || existingRow?.display_name || targetEmail,
          picks,
          super_locks: superLocks,
          joined_contests: Array.isArray(existingRow?.joined_contests) ? existingRow.joined_contests : [],
          paid: Boolean(existingRow?.paid),
          avatar_initial: avatarInitial,
          avatar_color: avatarColor,
          avatar_text_color: avatarTextColor,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        .select('id, owner_email, display_name, picks, super_locks, joined_contests, paid, avatar_initial, avatar_color, avatar_text_color')
        .single();
      if (error) throw error;

      return sendJson(response, 200, { user: normalizeStandingsUserRow(data) });
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
