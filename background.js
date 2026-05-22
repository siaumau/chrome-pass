// CryptoJS is kept ONLY for migrating legacy v1 ciphertext to v2.
// New encryption uses the Web Crypto API (PBKDF2 + AES-GCM).
try {
  importScripts('crypto-js.js');
} catch (e) {
  console.error('Failed to import crypto-js.js', e);
}

// --- Constants ---
const META_KEY = '__meta__';
const SETTINGS_KEY = '__settings__';
const VERIFIER_PLAINTEXT = 'chrome-pass-verify-v2';
const PBKDF2_ITERATIONS = 300000;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const RESERVED_KEYS = new Set(['userLanguage', META_KEY, SETTINGS_KEY]);
const AUTO_LOCK_ALARM = 'chrome-pass-auto-lock';
const DEFAULT_AUTO_LOCK_MINUTES = 15;
const ALLOWED_AUTO_LOCK_MINUTES = new Set([0, 1, 5, 15, 30, 60]);

// --- Base64 helpers ---
function bytesToBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i]);
  return btoa(str);
}
function base64ToBytes(b64) {
  const str = atob(b64);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

// --- Web Crypto helpers ---
async function deriveRawKey(masterPassword, saltBytes) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const raw = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    256
  );
  return new Uint8Array(raw);
}

async function importAesKey(rawBytes) {
  return crypto.subtle.importKey(
    'raw',
    rawBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptString(plaintext, cryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  return { v: 2, iv: bytesToBase64(iv), ct: bytesToBase64(ct) };
}

async function decryptString(encObj, cryptoKey) {
  const iv = base64ToBytes(encObj.iv);
  const ct = base64ToBytes(encObj.ct);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
  return new TextDecoder().decode(plain);
}

// --- Storage helpers ---
const getLocalStorage = (keys) => new Promise((r) => chrome.storage.local.get(keys, r));
const setLocalStorage = (data) => new Promise((r) => chrome.storage.local.set(data, r));
const removeLocalStorage = (keys) => new Promise((r) => chrome.storage.local.remove(keys, r));
const getSessionStorage = (keys) => new Promise((r) => chrome.storage.session.get(keys, r));
const setSessionStorage = (data) => new Promise((r) => chrome.storage.session.set(data, r));
const clearSessionStorage = () => new Promise((r) => chrome.storage.session.clear(r));
const queryTabs = (q) => new Promise((r) => chrome.tabs.query(q, r));
const sendMessageToTab = (tabId, msg) => new Promise((res, rej) => {
  chrome.tabs.sendMessage(tabId, msg, (response) => {
    if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
    else res(response);
  });
});

async function getSessionKey() {
  const { sessionKey } = await getSessionStorage('sessionKey');
  if (!sessionKey) return null;
  return importAesKey(base64ToBytes(sessionKey));
}

function isCredentialKey(key) { return !RESERVED_KEYS.has(key); }
function isRestrictedURL(url) {
  return !url || url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('view-source:');
}
function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

// --- Ciphertext shape ---
function isV2Ciphertext(value) {
  return value && typeof value === 'object' && value.v === 2
    && typeof value.iv === 'string' && typeof value.ct === 'string';
}
function isV1Ciphertext(value) {
  return typeof value === 'string' && value.startsWith('enc::');
}

// Legacy CryptoJS decrypt — only used to migrate v1 data on first unlock after upgrade.
function legacyDecrypt(encryptedData, masterPassword) {
  if (typeof CryptoJS === 'undefined' || !masterPassword || !encryptedData) return null;
  if (!encryptedData.startsWith('enc::')) return null;
  try {
    const ciphertext = encryptedData.substring(5);
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterPassword);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text || null;
  } catch (e) {
    return null;
  }
}

// --- Entries shape ---
function toEntries(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && 'username' in value && 'password' in value) {
    return [{ id: '__legacy__', username: value.username, password: value.password, label: '', createdAt: 0 }];
  }
  return [];
}

async function getEntriesForUrl(url) {
  const result = await getLocalStorage(url);
  return toEntries(result[url]);
}

// --- Vault state ---
async function hasAnyV1Data() {
  const all = await getLocalStorage(null);
  for (const key in all) {
    if (!isCredentialKey(key)) continue;
    const entries = toEntries(all[key]);
    for (const e of entries) {
      if (isV1Ciphertext(e.password)) return true;
    }
  }
  return false;
}

async function getVaultState() {
  const { [META_KEY]: meta } = await getLocalStorage(META_KEY);
  const { sessionKey } = await getSessionStorage('sessionKey');
  const unlocked = !!sessionKey;
  if (meta && meta.version === 2) {
    return { state: 'unlock', unlocked };
  }
  const hasV1 = await hasAnyV1Data();
  return { state: hasV1 ? 'migrate' : 'setup', unlocked: false };
}

// --- Settings ---
async function getSettings() {
  const { [SETTINGS_KEY]: s } = await getLocalStorage(SETTINGS_KEY);
  const minutes = s && ALLOWED_AUTO_LOCK_MINUTES.has(s.autoLockMinutes)
    ? s.autoLockMinutes
    : DEFAULT_AUTO_LOCK_MINUTES;
  return { autoLockMinutes: minutes };
}

async function setSettings(patch) {
  const current = await getSettings();
  const next = { ...current };
  if (patch && typeof patch.autoLockMinutes === 'number'
      && ALLOWED_AUTO_LOCK_MINUTES.has(patch.autoLockMinutes)) {
    next.autoLockMinutes = patch.autoLockMinutes;
  }
  await setLocalStorage({ [SETTINGS_KEY]: next });
  return next;
}

// --- Auto-lock alarm ---
// Reschedules the alarm to fire `autoLockMinutes` from now. Called on unlock
// AND on every successful unlocked operation, so user activity keeps the
// vault open. autoLockMinutes === 0 means "never".
async function rescheduleAutoLock() {
  const { sessionKey } = await getSessionStorage('sessionKey');
  if (!sessionKey) {
    await chrome.alarms.clear(AUTO_LOCK_ALARM);
    return;
  }
  const { autoLockMinutes } = await getSettings();
  if (!autoLockMinutes) {
    await chrome.alarms.clear(AUTO_LOCK_ALARM);
    return;
  }
  await chrome.alarms.create(AUTO_LOCK_ALARM, { delayInMinutes: autoLockMinutes });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === AUTO_LOCK_ALARM) {
    clearSessionStorage().catch((e) => console.error('BG: auto-lock failed', e));
  }
});

// --- Origin key migration ---
// Pre-2026-05 storage keyed entries by bare hostname (e.g. "example.com"),
// which collapses http/https. Rename any bare-hostname key to "https://<host>"
// to make protocol explicit. If both shapes exist, merge entry arrays — dedup
// by username, keeping the entry with the larger createdAt.
function looksLikeOriginKey(key) {
  return /^(https?:|file:|chrome-extension:)\/\//.test(key);
}

function mergeEntryArrays(a, b) {
  const byUsername = new Map();
  const consider = (e) => {
    if (!e || typeof e !== 'object' || !e.username) return;
    const prev = byUsername.get(e.username);
    if (!prev || (e.createdAt || 0) > (prev.createdAt || 0)) {
      byUsername.set(e.username, e);
    }
  };
  toEntries(a).forEach(consider);
  toEntries(b).forEach(consider);
  return Array.from(byUsername.values());
}

async function migrateHostnameToOriginIfNeeded() {
  const all = await getLocalStorage(null);
  const updates = {};
  const removes = [];
  let dirty = false;
  for (const key in all) {
    if (!isCredentialKey(key)) continue;
    if (looksLikeOriginKey(key)) continue;
    const originKey = 'https://' + key;
    const merged = mergeEntryArrays(all[originKey], all[key]);
    if (merged.length) updates[originKey] = merged;
    removes.push(key);
    dirty = true;
  }
  if (dirty) {
    if (Object.keys(updates).length) await setLocalStorage(updates);
    if (removes.length) await removeLocalStorage(removes);
    console.log('BG: Migrated', removes.length, 'hostname keys to origin form.');
  }
}

// --- Storage shape migration (legacy single-object → array). Independent of crypto. ---
async function migrateStorageShapeIfNeeded() {
  const all = await getLocalStorage(null);
  const updates = {};
  let dirty = false;
  for (const key in all) {
    if (!isCredentialKey(key)) continue;
    const value = all[key];
    if (Array.isArray(value)) continue;
    if (value && typeof value === 'object' && 'username' in value && 'password' in value) {
      updates[key] = [{
        id: newId(),
        username: value.username,
        password: value.password,
        label: '',
        createdAt: Date.now()
      }];
      dirty = true;
    }
  }
  if (dirty) {
    await setLocalStorage(updates);
    console.log('BG: Migrated', Object.keys(updates).length, 'legacy entries to array shape.');
  }
}

async function runMigrations() {
  await migrateStorageShapeIfNeeded();
  await migrateHostnameToOriginIfNeeded();
}
chrome.runtime.onInstalled.addListener(() => { runMigrations(); });
chrome.runtime.onStartup.addListener(() => { runMigrations(); });

// --- Handlers ---

async function handleGetVaultState() {
  const s = await getVaultState();
  return { status: 'success', ...s };
}

async function handleSetup(payload) {
  const { masterPassword, confirmPassword } = payload || {};
  if (!masterPassword) return { status: 'error', code: 'EMPTY_PASSWORD' };
  if (masterPassword !== confirmPassword) return { status: 'error', code: 'PASSWORD_MISMATCH' };

  const existing = await getLocalStorage(META_KEY);
  if (existing[META_KEY]) return { status: 'error', code: 'ALREADY_INITIALIZED' };

  // Reject setup if v1 data exists — caller should use UNLOCK_REQUEST to migrate.
  if (await hasAnyV1Data()) return { status: 'error', code: 'V1_DATA_EXISTS' };

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const rawKey = await deriveRawKey(masterPassword, salt);
  const cryptoKey = await importAesKey(rawKey);
  const verifier = await encryptString(VERIFIER_PLAINTEXT, cryptoKey);

  await setLocalStorage({
    [META_KEY]: {
      version: 2,
      kdf: 'PBKDF2',
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
      salt: bytesToBase64(salt),
      verifier
    }
  });
  await setSessionStorage({ sessionKey: bytesToBase64(rawKey) });
  await rescheduleAutoLock();
  return { status: 'success' };
}

async function handleUnlock(payload) {
  const { masterPassword } = payload || {};
  if (!masterPassword) return { status: 'error', code: 'EMPTY_PASSWORD' };

  const { [META_KEY]: meta } = await getLocalStorage(META_KEY);

  if (meta && meta.version === 2) {
    const salt = base64ToBytes(meta.salt);
    const rawKey = await deriveRawKey(masterPassword, salt);
    const cryptoKey = await importAesKey(rawKey);
    try {
      const text = await decryptString(meta.verifier, cryptoKey);
      if (text !== VERIFIER_PLAINTEXT) throw new Error('verifier mismatch');
    } catch (e) {
      return { status: 'error', code: 'WRONG_PASSWORD' };
    }
    await setSessionStorage({ sessionKey: bytesToBase64(rawKey) });
    await rescheduleAutoLock();
    return { status: 'success' };
  }

  // No __meta__ yet — either fresh install or v1 install awaiting migration.
  if (!(await hasAnyV1Data())) return { status: 'error', code: 'NEEDS_SETUP' };
  return migrateAndUnlock(masterPassword);
}

async function migrateAndUnlock(masterPassword) {
  if (typeof CryptoJS === 'undefined') {
    return { status: 'error', code: 'LEGACY_DECRYPT_UNAVAILABLE' };
  }
  const all = await getLocalStorage(null);

  // Pass 1: decrypt EVERY v1 entry up-front. If any fails, the password is wrong
  // (or that single entry is corrupted) — either way, abort before touching storage.
  const plaintexts = Object.create(null);
  let foundV1 = false;
  for (const key in all) {
    if (!isCredentialKey(key)) continue;
    for (const e of toEntries(all[key])) {
      if (!isV1Ciphertext(e.password)) continue;
      foundV1 = true;
      const plain = legacyDecrypt(e.password, masterPassword);
      if (plain === null) return { status: 'error', code: 'WRONG_PASSWORD' };
      (plaintexts[key] = plaintexts[key] || {})[e.id] = plain;
    }
  }
  if (!foundV1) return { status: 'error', code: 'NEEDS_SETUP' };

  // Pass 2: re-encrypt with v2 crypto. All decryptions already succeeded, so this
  // cannot fail mid-way for crypto reasons. Storage write is atomic across keys.
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const rawKey = await deriveRawKey(masterPassword, salt);
  const cryptoKey = await importAesKey(rawKey);
  const verifier = await encryptString(VERIFIER_PLAINTEXT, cryptoKey);

  const updates = {};
  let migratedCount = 0;
  for (const key in all) {
    if (!isCredentialKey(key)) continue;
    const entries = toEntries(all[key]);
    let changed = false;
    const newEntries = [];
    for (const e of entries) {
      if (isV1Ciphertext(e.password)) {
        const plain = plaintexts[key][e.id];
        const newCt = await encryptString(plain, cryptoKey);
        newEntries.push({ ...e, password: newCt });
        changed = true;
        migratedCount++;
      } else {
        newEntries.push(e);
      }
    }
    if (changed) updates[key] = newEntries;
  }
  updates[META_KEY] = {
    version: 2,
    kdf: 'PBKDF2',
    iterations: PBKDF2_ITERATIONS,
    hash: 'SHA-256',
    salt: bytesToBase64(salt),
    verifier
  };
  await setLocalStorage(updates);
  await setSessionStorage({ sessionKey: bytesToBase64(rawKey) });
  await rescheduleAutoLock();
  console.log('BG: Migrated', migratedCount, 'entries from v1 to v2.');
  return { status: 'success', migrated: migratedCount };
}

async function handleLock() {
  await clearSessionStorage();
  await chrome.alarms.clear(AUTO_LOCK_ALARM);
  return { status: 'success' };
}

async function handleCheckUnlocked() {
  const { sessionKey } = await getSessionStorage('sessionKey');
  return { status: 'success', unlocked: !!sessionKey };
}

async function handleListEntries(payload) {
  const { url } = payload || {};
  const { sessionKey } = await getSessionStorage('sessionKey');
  const entries = await getEntriesForUrl(url);
  return {
    status: 'success',
    unlocked: !!sessionKey,
    entries: entries.map((e) => ({ id: e.id, username: e.username, label: e.label || '' }))
  };
}

async function handleSaveFromPage(payload) {
  const { url, username, password, label } = payload || {};
  if (!url || !username || !password) {
    return { status: 'error', message: 'Missing url/username/password.' };
  }
  const cryptoKey = await getSessionKey();
  if (!cryptoKey) return { status: 'error', message: 'Locked.' };

  const encrypted = await encryptString(password, cryptoKey);

  const entries = await getEntriesForUrl(url);
  const existingIdx = entries.findIndex((e) => e.username === username);
  if (existingIdx >= 0) {
    entries[existingIdx] = {
      ...entries[existingIdx],
      password: encrypted,
      label: label || entries[existingIdx].label || ''
    };
  } else {
    entries.push({
      id: newId(), username, password: encrypted,
      label: label || '', createdAt: Date.now()
    });
  }
  await setLocalStorage({ [url]: entries });
  return { status: 'success', updated: existingIdx >= 0 };
}

async function handleDeleteEntry(payload) {
  const { url, entryId } = payload || {};
  const entries = await getEntriesForUrl(url);
  const remaining = entries.filter((e) => e.id !== entryId);
  if (remaining.length === 0) {
    await removeLocalStorage(url);
  } else {
    await setLocalStorage({ [url]: remaining });
  }
  return { status: 'success' };
}

async function handleGetDecrypted(payload) {
  const { url, entryId } = payload || {};
  const cryptoKey = await getSessionKey();
  if (!cryptoKey) return { status: 'error', message: 'Locked.' };

  const entries = await getEntriesForUrl(url);
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return { status: 'error', message: 'Entry not found.' };

  try {
    if (isV2Ciphertext(entry.password)) {
      const plain = await decryptString(entry.password, cryptoKey);
      return { status: 'success', username: entry.username, password: plain };
    }
    if (isV1Ciphertext(entry.password)) {
      return { status: 'error', message: 'Legacy entry not migrated — lock and unlock again to migrate.' };
    }
    return { status: 'error', message: 'Unknown ciphertext shape.' };
  } catch (e) {
    return { status: 'error', message: 'Decryption failed.' };
  }
}

async function handleFillRequest(payload) {
  const { url, entryId } = payload || {};
  const decrypted = await handleGetDecrypted({ url, entryId });
  if (decrypted.status !== 'success') return decrypted;

  const tabs = await queryTabs({ active: true, currentWindow: true });
  if (tabs.length === 0) return { status: 'error', message: 'No active tab.' };
  const tab = tabs[0];
  if (isRestrictedURL(tab.url)) {
    return { status: 'error', message: 'Cannot fill on restricted browser pages.' };
  }
  try {
    const contentResponse = await sendMessageToTab(tab.id, {
      type: 'FILL_CREDENTIALS',
      payload: { username: decrypted.username, password: decrypted.password }
    });
    return contentResponse || { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.message || 'Content script not responsive.' };
  }
}

async function handleGetSettings() {
  const settings = await getSettings();
  return { status: 'success', settings };
}

async function handleSetSettings(payload) {
  const settings = await setSettings(payload || {});
  await rescheduleAutoLock();
  return { status: 'success', settings };
}

// Messages that count as "user activity" and should reset the auto-lock timer.
// Excludes pure status pings (GET_VAULT_STATE, CHECK_UNLOCKED) so background
// polling from other surfaces doesn't keep the vault open indefinitely.
const ACTIVITY_MESSAGES = new Set([
  'LIST_ENTRIES', 'SAVE_FROM_PAGE', 'DELETE_ENTRY', 'GET_DECRYPTED', 'FILL_REQUEST'
]);

// --- Router ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const route = async () => {
    switch (request.type) {
      case 'GET_VAULT_STATE': return handleGetVaultState();
      case 'SETUP_VAULT': return handleSetup(request.payload);
      case 'UNLOCK_REQUEST': return handleUnlock(request.payload);
      case 'LOCK': return handleLock();
      case 'CHECK_UNLOCKED': return handleCheckUnlocked();
      case 'LIST_ENTRIES': return handleListEntries(request.payload);
      case 'SAVE_FROM_PAGE': return handleSaveFromPage(request.payload);
      case 'DELETE_ENTRY': return handleDeleteEntry(request.payload);
      case 'GET_DECRYPTED': return handleGetDecrypted(request.payload);
      case 'FILL_REQUEST': return handleFillRequest(request.payload);
      case 'GET_SETTINGS': return handleGetSettings();
      case 'SET_SETTINGS': return handleSetSettings(request.payload);
      default: return { status: 'error', message: 'Unknown message type: ' + request.type };
    }
  };
  route().then((result) => {
    if (ACTIVITY_MESSAGES.has(request.type) && result && result.status === 'success') {
      rescheduleAutoLock().catch(() => {});
    }
    sendResponse(result);
  }).catch((e) => {
    console.error('BG: handler error', e);
    sendResponse({ status: 'error', message: e.message || String(e) });
  });
  return true;
});
