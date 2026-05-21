// Import the encryption library
try {
  importScripts('crypto-js.js');
} catch (e) {
  console.error('Failed to import crypto-js.js', e);
}

// --- Encryption helpers ---
function encrypt(data, key) {
  if (typeof CryptoJS === 'undefined' || !key) return null;
  try {
    return 'enc::' + CryptoJS.AES.encrypt(data, key).toString();
  } catch (e) {
    console.error('BG: Encryption failed:', e);
    return null;
  }
}

function decrypt(encryptedData, key) {
  if (typeof CryptoJS === 'undefined' || !key || !encryptedData) return null;
  if (!encryptedData.startsWith('enc::')) return encryptedData;
  try {
    const ciphertext = encryptedData.substring(5);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) throw new Error('Empty result — likely wrong key.');
    return originalText;
  } catch (e) {
    console.error('BG: Decryption failed:', e);
    return null;
  }
}

// --- Storage helpers ---
const getLocalStorage = (keys) => new Promise((r) => chrome.storage.local.get(keys, r));
const setLocalStorage = (data) => new Promise((r) => chrome.storage.local.set(data, r));
const removeLocalStorage = (keys) => new Promise((r) => chrome.storage.local.remove(keys, r));
const getSessionStorage = (keys) => new Promise((r) => chrome.storage.session.get(keys, r));
const setSessionStorage = (data) => new Promise((r) => chrome.storage.session.set(data, r));
const queryTabs = (q) => new Promise((r) => chrome.tabs.query(q, r));
const sendMessageToTab = (tabId, msg) => new Promise((res, rej) => {
  chrome.tabs.sendMessage(tabId, msg, (response) => {
    if (chrome.runtime.lastError) rej(chrome.runtime.lastError);
    else res(response);
  });
});

const RESERVED_KEYS = new Set(['userLanguage']);

function isCredentialKey(key) {
  return !RESERVED_KEYS.has(key);
}

function isRestrictedURL(url) {
  return !url || url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('view-source:');
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'id-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
}

// Migrate legacy single-entry shape {url: {username, password}} to array shape.
async function migrateStorageIfNeeded() {
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

chrome.runtime.onInstalled.addListener(() => { migrateStorageIfNeeded(); });
chrome.runtime.onStartup.addListener(() => { migrateStorageIfNeeded(); });

// Always returns an array (possibly empty) for the given URL.
async function getEntriesForUrl(url) {
  const result = await getLocalStorage(url);
  const value = result[url];
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && 'username' in value) {
    const migrated = [{
      id: newId(),
      username: value.username,
      password: value.password,
      label: '',
      createdAt: Date.now()
    }];
    await setLocalStorage({ [url]: migrated });
    return migrated;
  }
  return [];
}

// --- Handlers (return promise; sendResponse wired at bottom) ---

async function handleUnlock(payload) {
  const { masterPassword } = payload || {};
  if (!masterPassword) return { status: 'error', message: 'Empty master password.' };
  await setSessionStorage({ masterPassword });
  return { status: 'success' };
}

async function handleCheckUnlocked() {
  const { masterPassword } = await getSessionStorage('masterPassword');
  return { status: 'success', unlocked: !!masterPassword };
}

// Returns metadata only (no passwords) — content script never needs to see them.
async function handleListEntries(payload) {
  const { url } = payload || {};
  const { masterPassword } = await getSessionStorage('masterPassword');
  const entries = await getEntriesForUrl(url);
  return {
    status: 'success',
    unlocked: !!masterPassword,
    entries: entries.map((e) => ({ id: e.id, username: e.username, label: e.label || '' }))
  };
}

async function handleSaveFromPage(payload) {
  const { url, username, password, label } = payload || {};
  if (!url || !username || !password) {
    return { status: 'error', message: 'Missing url/username/password.' };
  }
  const { masterPassword } = await getSessionStorage('masterPassword');
  if (!masterPassword) return { status: 'error', message: 'Locked.' };

  const encrypted = encrypt(password, masterPassword);
  if (!encrypted) return { status: 'error', message: 'Encryption failed.' };

  const entries = await getEntriesForUrl(url);
  // If an entry with the same username already exists, update its password instead of duplicating.
  const existingIdx = entries.findIndex((e) => e.username === username);
  if (existingIdx >= 0) {
    entries[existingIdx] = { ...entries[existingIdx], password: encrypted, label: label || entries[existingIdx].label || '' };
  } else {
    entries.push({ id: newId(), username, password: encrypted, label: label || '', createdAt: Date.now() });
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

// Returns decrypted credentials to the caller (used by the in-page mini popup).
async function handleGetDecrypted(payload) {
  const { url, entryId } = payload || {};
  const { masterPassword } = await getSessionStorage('masterPassword');
  if (!masterPassword) return { status: 'error', message: 'Locked.' };

  const entries = await getEntriesForUrl(url);
  const entry = entries.find((e) => e.id === entryId);
  if (!entry) return { status: 'error', message: 'Entry not found.' };

  const decryptedPassword = decrypt(entry.password, masterPassword);
  if (!decryptedPassword) return { status: 'error', message: 'Decryption failed.' };
  return { status: 'success', username: entry.username, password: decryptedPassword };
}

// Fill via the active tab (used by popup's "Fill" button).
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

// --- Message router ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const route = async () => {
    switch (request.type) {
      case 'UNLOCK_REQUEST': return handleUnlock(request.payload);
      case 'CHECK_UNLOCKED': return handleCheckUnlocked();
      case 'LIST_ENTRIES': return handleListEntries(request.payload);
      case 'SAVE_FROM_PAGE': return handleSaveFromPage(request.payload);
      case 'DELETE_ENTRY': return handleDeleteEntry(request.payload);
      case 'GET_DECRYPTED': return handleGetDecrypted(request.payload);
      case 'FILL_REQUEST': return handleFillRequest(request.payload);
      default: return { status: 'error', message: 'Unknown message type: ' + request.type };
    }
  };
  route().then(sendResponse).catch((e) => {
    console.error('BG: handler error', e);
    sendResponse({ status: 'error', message: e.message || String(e) });
  });
  return true; // keep channel open for async response
});
