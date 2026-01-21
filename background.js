// Import the encryption library
try {
  importScripts('crypto-js.js');
} catch (e) {
  console.error('Failed to import crypto-js.js', e);
}

// --- Encryption and Decryption Helpers ---

function encrypt(data, key) {
  if (typeof CryptoJS === 'undefined') {
    console.error("BG: CryptoJS library is not loaded. Cannot encrypt.");
    return null;
  }
  if (!key) return null;
  try {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    // Add a prefix to distinguish encrypted passwords
    return "enc::" + encrypted;
  } catch (e) {
    console.error("BG: Encryption failed:", e);
    return null;
  }
}

function decrypt(encryptedData, key) {
  if (typeof CryptoJS === 'undefined') {
    console.error("BG: CryptoJS library is not loaded. Cannot decrypt.");
    return null;
  }
  if (!key || !encryptedData) { // Added check for !encryptedData
    return encryptedData; // If no key or no data, return as is.
  }
  if (!encryptedData.startsWith("enc::")) {
    console.warn("BG: Attempted to decrypt non-prefixed data. Assuming it's unencrypted or already decrypted.");
    return encryptedData; // Not encrypted with our prefix, return original
  }
  try {
    const ciphertext = encryptedData.substring(5); // Remove "enc::" prefix
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    if (!originalText) {
      throw new Error("Decryption resulted in empty string, likely wrong key or corrupt data.");
    }
    return originalText;
  } catch (e) {
    console.error("BG: Decryption failed:", e);
    return null; // Return null on failure
  }
}

// Helper to promisify chrome.storage.local.get
const getLocalStorage = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, resolve);
  });
};

// Helper to promisify chrome.storage.local.set
const setLocalStorage = (data) => {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, resolve);
  });
};

// Helper to promisify chrome.storage.session.get
const getSessionStorage = (keys) => {
  return new Promise((resolve) => {
    chrome.storage.session.get(keys, resolve);
  });
};

// Helper to promisify chrome.tabs.query
const queryTabs = (queryInfo) => {
  return new Promise((resolve) => {
    chrome.tabs.query(queryInfo, resolve);
  });
};

// Helper to promisify chrome.tabs.sendMessage
const sendMessageToTab = (tabId, message) => {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
};

// Helper function to check if a URL is a restricted Chrome URL
function isRestrictedURL(url) {
  return url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('view-source:');
}

// Listen for messages from popup.js and content.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === 'FILL_REQUEST') {
    console.log('BG: Received FILL_REQUEST:', request.payload.url);
    const { url } = request.payload;

    try {
      const { masterPassword } = await getSessionStorage('masterPassword');
      if (!masterPassword) {
        console.log('BG: Master password not set. Sending error response.');
        sendResponse({ status: 'error', message: 'Master password is not set in this session.' });
        return true; // Indicate async response
      }
      console.log('BG: Master password retrieved.');

      const storedResult = await getLocalStorage(url);
      if (!storedResult[url]) {
        console.log('BG: No credentials found for URL. Sending error response.');
        sendResponse({ status: 'error', message: `No credentials found for ${url}.` });
        return true; // Indicate async response
      }
      console.log('BG: Credentials found for URL.');

      let { username, password } = storedResult[url];

      // Decrypt the password
      const decryptedPassword = decrypt(password, masterPassword);
      console.log('BG: Decryption attempted. Result:', decryptedPassword ? 'success' : 'failed');

      if (!decryptedPassword || decryptedPassword === password) { 
        console.log('BG: Decryption failed or returned original password. Sending error response.');
        sendResponse({ status: 'error', message: 'Decryption failed. Is the master password correct for this entry?' });
        return true; // Indicate async response
      }
      password = decryptedPassword;
      console.log('BG: Password successfully decrypted.');

      const tabs = await queryTabs({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        console.log('BG: No active tab found. Sending error response.');
        sendResponse({ status: 'error', message: 'No active tab found.' });
        return true; // Indicate async response
      }
      const tabId = tabs[0].id;
      const tabUrl = tabs[0].url; // Get the tab's URL
      console.log('BG: Active tab found:', tabId, 'URL:', tabUrl);

      if (isRestrictedURL(tabUrl)) {
        console.log('BG: Cannot fill on restricted URL. Sending error response.');
        sendResponse({ status: 'error', message: 'Cannot fill passwords on special browser pages (e.g., chrome://, about:, view-source:).' });
        return true; // Indicate async response
      }

      try {
        console.log('BG: Sending FILL_CREDENTIALS to content script...');
        const contentResponse = await sendMessageToTab(tabId, { type: 'FILL_CREDENTIALS', payload: { username, password } });
        console.log('BG: Content script response:', contentResponse); // New log
        console.log('BG: Received response from content script. Relaying to popup.');
        sendResponse(contentResponse);
      } catch (contentError) {
        console.error('BG: Error sending message to content script:', contentError);
        sendResponse({ status: 'error', message: `Failed to fill: ${contentError.message || 'Content script not responsive.'}` });
      }

    } catch (e) {
      console.error('BG: Unhandled error during FILL_REQUEST:', e);
      sendResponse({ status: 'error', message: e.message || 'An unknown error occurred during fill operation.' });
    }
    console.log('BG: FILL_REQUEST handler ending. Returning true.');
    return true; // Indicate that sendResponse will be called asynchronously
  
  } else if (request.type === 'SAVE_CREDENTIALS') {
    console.log('BG: Received SAVE_CREDENTIALS request.');
    const { url, username, password } = request.payload;

    try {
      const { masterPassword } = await getSessionStorage('masterPassword');
      if (!masterPassword) {
        console.warn("BG: Attempted to save credentials but master password is not set. Saving unencrypted.");
        const unencryptedData = { [url]: { username, password } };
        await setLocalStorage(unencryptedData);
        return false; // No async response needed for save for now
      }

      // Encrypt the password
      const encryptedPassword = encrypt(password, masterPassword);

      if (!encryptedPassword) {
        console.error("BG: Failed to encrypt password. Credentials not saved.");
        return false;
      }

      const dataToSave = { [url]: { username, password: encryptedPassword } };
      await setLocalStorage(dataToSave);
      console.log(`BG: Credentials saved and encrypted for ${url}.`);

    } catch (e) {
      console.error('BG: Unhandled error during SAVE_CREDENTIALS:', e);
    }
    console.log('BG: SAVE_CREDENTIALS handler ending. Returning false.');
    return false; // No async response expected/required for SAVE_CREDENTIALS for now.
  }
  console.log('BG: Unhandled message type:', request.type);
  return false; // For any unhandled message types, no async response.
});
