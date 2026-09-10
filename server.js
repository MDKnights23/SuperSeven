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
const SMACK_TALK_MAX_CHARS = 500;
const SMACK_TALK_MAX_GIF_URL_CHARS = 1000;
const SMACK_TALK_COOLDOWN_SECONDS = 10;
const GIPHY_API_KEY = (process.env.GIPHY_API_KEY || '').trim();
const GIPHY_RATING = (process.env.GIPHY_RATING || 'pg-13').trim();
const GIPHY_LANG = (process.env.GIPHY_LANG || 'en').trim();
const FALLBACK_GIF_LIBRARY = [
  { id: '1', title: 'happy dance', url: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2N2a2hyMHhyY2l4M2ExM2NnY2kydmR0cW9kNW9qaGhvbTJrbmlydSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0MYt5jPR6QX5pnqM/giphy.gif' },
  { id: '2', title: 'you got this', url: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHBmbnE4Y2Q2N3RrN3A2YTR2ODV0NTRwcjRkYnlyc2ZiNGt2bTY3eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11sBLVxNs7v6WA/giphy.gif' },
  { id: '3', title: 'laughing', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDd6bGx4N2pqNmxseHdkdjFwaDVjZzNxM2o4aHA4OXN1dnh4a2w5NiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Q7ozWVYCR0nyW2rvPW/giphy.gif' },
  { id: '4', title: 'mind blown', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW4zNnI1eTl4ZnlrODd4dW9sM2IxN3I4OTVwN3lyYzR5Y3FtMXp2NSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xUPGcgtKxm4PADy3C0/giphy.gif' },
  { id: '5', title: 'mic drop', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXV1YWcxNnlyZGFjMDNqZWx5NTE0enBnb2o4dnQ5N2NqeWFtN2I1aiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/15BuyagtKucHm/giphy.gif' },
  { id: '6', title: 'football hype', url: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjU5c2Y4cDhoZmR0OWw1eHF5d2UwcXB1dzd1djNmMnI4dmNucXQzYiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3vRlT2k2L35Cnn5C/giphy.gif' },
  { id: '7', title: 'facepalm', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDE2d2Q5M2N5Z2llN3R0eHBzNjl5Y2RoN2hlN2lwN3hrdTdhOW42eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TJawtKM6OCKkvwCIqX/giphy.gif' },
  { id: '8', title: 'boom roasted', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2V5dWU2bmJ5cm5vN3M3dW16eG13M3hueW55c3Y5ZjJ5bjE4Y3Y2diZlcD12MV9naWZzX3NlYXJjaCZjdD1n/a93jwI0wkWTQs/giphy.gif' },
  { id: '9', title: 'crying laughing', url: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzVqN2xyeDZra2lrbXlkeGQ0eW5sbmQ2ejM5aXV6N2N4dXpwNmFnMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/10JhviFuU2gWD6/giphy.gif' },
  { id: '10', title: 'victory', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGJ2bWNwYjNldTJxOWZuaDI2cTM5MXhweXNhaTRwdjA0Njl0bWpyeSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7btPCcdNniyf0ArS/giphy.gif' },
  { id: '11', title: 'no chance', url: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTFoc2Y4MDR5YzA2YWQ3OHVza3Awd3JmNWFrYjBweWYxN2NyM3N5YiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/8vUEXZA2me7vnuUvrs/giphy.gif' },
  { id: '12', title: 'clapping', url: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnNqdmY2YXQ5M3d3Z2M4dWw0czhhM2xtOHM5dTN4eGYyODNrbWQxZSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l3q2XhfQ8oCkm1Ts4/giphy.gif' }
];
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

function sanitizeSmackTalkMessage(message) {
  if (typeof message !== 'string') {
    return '';
  }

  return message.trim().slice(0, SMACK_TALK_MAX_CHARS);
}

function sanitizeSmackTalkGifUrl(gifUrl) {
  if (typeof gifUrl !== 'string') {
    return '';
  }

  return gifUrl.trim().slice(0, SMACK_TALK_MAX_GIF_URL_CHARS);
}

function isValidSmackTalkGifUrl(gifUrl) {
  const candidate = sanitizeSmackTalkGifUrl(gifUrl);
  if (!candidate) {
    return true;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    return /\.gif($|\?)/i.test(parsed.pathname) || /giphy|tenor/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

function normalizeSmackTalkPostRow(row) {
  return {
    id: row.id,
    authorEmail: row.author_email,
    displayName: row.author_display_name || row.author_email,
    message: row.message,
    gifUrl: row.gif_url || '',
    parentPostId: row.parent_post_id || null,
    editedAt: row.edited_at || null,
    createdAt: row.created_at
  };
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

function normalizeGifSuggestionRow(result) {
  const images = result?.images || {};
  const gif = images.original?.url || images.downsized?.url || '';
  const preview = images.fixed_width_small?.url || images.preview_gif?.url || images.fixed_width?.url || gif;
  return {
    id: String(result?.id || ''),
    title: String(result?.title || result?.slug || 'GIF'),
    url: gif,
    previewUrl: preview
  };
}

function getFallbackGifSuggestions({ query = '', pos = '', limit = 18 } = {}) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(30, Number(limit))) : 18;
  const normalizedQuery = typeof query === 'string' ? query.trim().toLowerCase() : '';
  const offset = Number.isFinite(Number(pos)) ? Math.max(0, Number(pos)) : 0;
  const filtered = normalizedQuery
    ? FALLBACK_GIF_LIBRARY.filter((item) => item.title.includes(normalizedQuery))
    : FALLBACK_GIF_LIBRARY;
  const page = filtered.slice(offset, offset + safeLimit);
  const nextOffset = offset + safeLimit;

  return {
    items: page.map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      previewUrl: item.url
    })),
    next: nextOffset < filtered.length ? String(nextOffset) : ''
  };
}

async function fetchGifSuggestionsFromGiphy({ query = '', pos = '', limit = 18 } = {}) {
  if (!GIPHY_API_KEY) {
    return getFallbackGifSuggestions({ query, pos, limit });
  }

  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(30, Number(limit))) : 18;
  const normalizedQuery = typeof query === 'string' ? query.trim() : '';
  const normalizedPos = Number.isFinite(Number(pos)) ? Math.max(0, Number(pos)) : 0;
  const endpoint = normalizedQuery ? 'search' : 'trending';
  const params = new URLSearchParams({
    api_key: GIPHY_API_KEY,
    limit: String(safeLimit),
    offset: String(normalizedPos),
    rating: GIPHY_RATING,
    lang: GIPHY_LANG
  });

  if (normalizedQuery) {
    params.set('q', normalizedQuery.slice(0, 100));
  }

  const response = await fetch(`https://api.giphy.com/v1/gifs/${endpoint}?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Unable to load GIF suggestions right now.');
  }

  const payload = await response.json();
  const rows = Array.isArray(payload?.data) ? payload.data.map(normalizeGifSuggestionRow).filter((item) => item.url) : [];
  const giphyPagination = payload?.pagination || {};
  const nextOffset = Number(giphyPagination.offset || 0) + Number(giphyPagination.count || rows.length || 0);
  const hasMore = nextOffset < Number(giphyPagination.total_count || 0);
  const giphyResult = {
    items: rows,
    next: hasMore ? String(nextOffset) : ''
  };

  if (!giphyResult.items.length) {
    return getFallbackGifSuggestions({ query, pos, limit });
  }

  return giphyResult;
}

async function listSmackTalkPosts(limit = 200) {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(500, Number(limit))) : 200;
  const { data, error } = await supabase
    .from('smack_talk_posts')
    .select('id, author_email, author_display_name, message, gif_url, parent_post_id, edited_at, created_at')
    .order('created_at', { ascending: false })
    .limit(safeLimit);
  if (error) throw error;

  return (data || []).map(normalizeSmackTalkPostRow);
}

async function resolvePostingDisplayName(ownerEmail, entryId = '') {
  const normalizedOwnerEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  const normalizedEntryId = typeof entryId === 'string' ? entryId.trim() : '';

  if (normalizedEntryId) {
    const { data, error } = await supabase
      .from('user_entries')
      .select('display_name')
      .eq('id', normalizedEntryId)
      .eq('owner_email', normalizedOwnerEmail)
      .maybeSingle();
    if (error) throw error;
    if (data?.display_name) {
      return sanitizeDisplayName(data.display_name, normalizedOwnerEmail);
    }
  }

  const { data, error } = await supabase
    .from('user_entries')
    .select('display_name')
    .eq('owner_email', normalizedOwnerEmail)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  return sanitizeDisplayName(data?.display_name || normalizedOwnerEmail, normalizedOwnerEmail);
}

async function createSmackTalkPost(ownerEmail, message, entryId = '', gifUrl = '', parentPostId = '') {
  const normalizedOwnerEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  const normalizedMessage = sanitizeSmackTalkMessage(message);
  const normalizedGifUrl = sanitizeSmackTalkGifUrl(gifUrl);
  const normalizedParentPostId = typeof parentPostId === 'string' ? parentPostId.trim() : '';
  const authorDisplayName = await resolvePostingDisplayName(normalizedOwnerEmail, entryId);

  let resolvedParentPostId = null;
  if (normalizedParentPostId) {
    const { data: parentPost, error: parentLookupError } = await supabase
      .from('smack_talk_posts')
      .select('id, parent_post_id')
      .eq('id', normalizedParentPostId)
      .maybeSingle();
    if (parentLookupError) throw parentLookupError;
    if (!parentPost) {
      throw new Error('Reply target not found.');
    }

    resolvedParentPostId = parentPost.parent_post_id || parentPost.id;
  }

  const { data, error } = await supabase
    .from('smack_talk_posts')
    .insert({
      id: crypto.randomUUID(),
      author_email: normalizedOwnerEmail,
      author_display_name: authorDisplayName,
      message: normalizedMessage,
      gif_url: normalizedGifUrl || null,
      parent_post_id: resolvedParentPostId,
      edited_at: null
    })
    .select('id, author_email, author_display_name, message, gif_url, parent_post_id, edited_at, created_at')
    .single();
  if (error) throw error;

  return normalizeSmackTalkPostRow(data);
}

async function getLatestSmackTalkPostByEmail(ownerEmail) {
  const normalizedOwnerEmail = typeof ownerEmail === 'string' ? ownerEmail.trim().toLowerCase() : '';
  if (!validEmail(normalizedOwnerEmail)) {
    return null;
  }

  const { data, error } = await supabase
    .from('smack_talk_posts')
    .select('id, author_email, author_display_name, message, created_at')
    .eq('author_email', normalizedOwnerEmail)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  return data || null;
}

function getSmackTalkCooldownRemainingSeconds(latestPost) {
  if (!latestPost?.created_at) {
    return 0;
  }

  const latestCreatedMs = new Date(latestPost.created_at).getTime();
  if (!Number.isFinite(latestCreatedMs)) {
    return 0;
  }

  const elapsedSeconds = (Date.now() - latestCreatedMs) / 1000;
  const remaining = Math.ceil(SMACK_TALK_COOLDOWN_SECONDS - elapsedSeconds);
  return remaining > 0 ? remaining : 0;
}

async function deleteSmackTalkPost(postId, requesterEmail, canModerate = false) {
  const normalizedPostId = typeof postId === 'string' ? postId.trim() : '';
  const normalizedRequester = typeof requesterEmail === 'string' ? requesterEmail.trim().toLowerCase() : '';
  if (!normalizedPostId) {
    return { deleted: false, reason: 'invalid' };
  }

  const { data: post, error: postLookupError } = await supabase
    .from('smack_talk_posts')
    .select('id, author_email')
    .eq('id', normalizedPostId)
    .maybeSingle();
  if (postLookupError) throw postLookupError;
  if (!post) {
    return { deleted: false, reason: 'missing' };
  }

  const postOwner = String(post.author_email || '').trim().toLowerCase();
  const canDelete = canModerate || postOwner === normalizedRequester;
  if (!canDelete) {
    return { deleted: false, reason: 'forbidden' };
  }

  const { error } = await supabase
    .from('smack_talk_posts')
    .delete()
    .eq('id', normalizedPostId);
  if (error) throw error;

  return { deleted: true };
}

async function updateSmackTalkPost(postId, requesterEmail, canModerate = false, payload = {}) {
  const normalizedPostId = typeof postId === 'string' ? postId.trim() : '';
  const normalizedRequester = typeof requesterEmail === 'string' ? requesterEmail.trim().toLowerCase() : '';
  if (!normalizedPostId) {
    return { updated: false, reason: 'invalid' };
  }

  const { data: post, error: postLookupError } = await supabase
    .from('smack_talk_posts')
    .select('id, author_email, message, gif_url, edited_at')
    .eq('id', normalizedPostId)
    .maybeSingle();
  if (postLookupError) throw postLookupError;
  if (!post) {
    return { updated: false, reason: 'missing' };
  }

  const postOwner = String(post.author_email || '').trim().toLowerCase();
  if (!(canModerate || postOwner === normalizedRequester)) {
    return { updated: false, reason: 'forbidden' };
  }

  const nextMessage = sanitizeSmackTalkMessage(payload.message);
  const nextGifUrlRaw = sanitizeSmackTalkGifUrl(payload.gifUrl);
  if (!nextMessage || nextMessage.length > SMACK_TALK_MAX_CHARS) {
    return { updated: false, reason: 'invalid-message' };
  }
  if (!isValidSmackTalkGifUrl(nextGifUrlRaw)) {
    return { updated: false, reason: 'invalid-gif' };
  }

  const nextGifUrl = nextGifUrlRaw || null;
  const changed = post.message !== nextMessage || (post.gif_url || null) !== nextGifUrl;

  const { data, error } = await supabase
    .from('smack_talk_posts')
    .update({
      message: nextMessage,
      gif_url: nextGifUrl,
      edited_at: changed ? new Date().toISOString() : post.edited_at
    })
    .eq('id', normalizedPostId)
    .select('id, author_email, author_display_name, message, gif_url, parent_post_id, edited_at, created_at')
    .single();
  if (error) throw error;

  return { updated: true, post: normalizeSmackTalkPostRow(data) };
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

    if (request.method === 'GET' && requestUrl.pathname === '/api/smack-posts') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const posts = await listSmackTalkPosts(200);
      return sendJson(response, 200, { posts });
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/gif-suggestions') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const query = typeof requestUrl.searchParams.get('q') === 'string' ? requestUrl.searchParams.get('q') : '';
      const pos = typeof requestUrl.searchParams.get('pos') === 'string' ? requestUrl.searchParams.get('pos') : '';
      const limitRaw = requestUrl.searchParams.get('limit');
      const limit = limitRaw ? Number(limitRaw) : 18;

      try {
        const result = await fetchGifSuggestionsFromGiphy({ query, pos, limit });
        return sendJson(response, 200, result);
      } catch (error) {
        return sendJson(response, 200, getFallbackGifSuggestions({ query, pos, limit }));
      }
    }

    if (request.method === 'POST' && requestUrl.pathname === '/api/smack-posts') {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const body = await readRequestBody(request);
      const message = sanitizeSmackTalkMessage(body.message);
      const gifUrl = sanitizeSmackTalkGifUrl(body.gifUrl);
      if (!message || message.length > SMACK_TALK_MAX_CHARS) {
        return sendJson(response, 400, { error: `Message must be 1 to ${SMACK_TALK_MAX_CHARS} characters.` });
      }
      if (!isValidSmackTalkGifUrl(gifUrl)) {
        return sendJson(response, 400, { error: 'Enter a valid GIF URL (https://...gif, Giphy, or direct GIF host).' });
      }

      const latestPost = await getLatestSmackTalkPostByEmail(session.email);
      const remainingCooldownSeconds = getSmackTalkCooldownRemainingSeconds(latestPost);
      if (remainingCooldownSeconds > 0) {
        return sendJson(response, 429, { error: `Please wait ${remainingCooldownSeconds}s before posting again.` });
      }

      await ensureUserEntry(session.email);
      const entryId = typeof body.entryId === 'string' ? body.entryId.trim() : '';
      const parentPostId = typeof body.parentPostId === 'string' ? body.parentPostId.trim() : '';
      let post;
      try {
        post = await createSmackTalkPost(session.email, message, entryId, gifUrl, parentPostId);
      } catch (error) {
        if ((error.message || '').toLowerCase().includes('reply target not found')) {
          return sendJson(response, 404, { error: 'Reply target not found.' });
        }
        throw error;
      }
      return sendJson(response, 201, { post });
    }

    if (request.method === 'PUT' && requestUrl.pathname.startsWith('/api/smack-posts/')) {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const postId = decodeURIComponent(requestUrl.pathname.replace('/api/smack-posts/', '')).trim();
      if (!postId) {
        return sendJson(response, 400, { error: 'Post ID is required.' });
      }

      const body = await readRequestBody(request);
      const result = await updateSmackTalkPost(postId, session.email, isCommissioner(session.email), {
        message: body.message,
        gifUrl: body.gifUrl
      });

      if (result.reason === 'missing') {
        return sendJson(response, 404, { error: 'Smack Talk post not found.' });
      }
      if (result.reason === 'forbidden') {
        return sendJson(response, 403, { error: 'You can only edit your own posts unless you are the commissioner.' });
      }
      if (result.reason === 'invalid-message') {
        return sendJson(response, 400, { error: `Message must be 1 to ${SMACK_TALK_MAX_CHARS} characters.` });
      }
      if (result.reason === 'invalid-gif') {
        return sendJson(response, 400, { error: 'Enter a valid GIF URL (https://...gif, Giphy, or direct GIF host).' });
      }
      if (!result.updated) {
        return sendJson(response, 400, { error: 'Unable to update this Smack Talk post.' });
      }

      return sendJson(response, 200, { post: result.post });
    }

    if (request.method === 'DELETE' && requestUrl.pathname.startsWith('/api/smack-posts/')) {
      const session = await currentSession(request);
      if (!session) {
        return sendJson(response, 401, { error: 'Not signed in.' });
      }

      const postId = decodeURIComponent(requestUrl.pathname.replace('/api/smack-posts/', '')).trim();
      if (!postId) {
        return sendJson(response, 400, { error: 'Post ID is required.' });
      }

      const result = await deleteSmackTalkPost(postId, session.email, isCommissioner(session.email));
      if (result.reason === 'missing') {
        return sendJson(response, 404, { error: 'Smack Talk post not found.' });
      }
      if (result.reason === 'forbidden') {
        return sendJson(response, 403, { error: 'You can only delete your own posts unless you are the commissioner.' });
      }
      if (!result.deleted) {
        return sendJson(response, 400, { error: 'Unable to delete this Smack Talk post.' });
      }

      return sendJson(response, 200, { ok: true });
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
