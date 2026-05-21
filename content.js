(function () {
  if (window.__chromePassInjected) return;
  window.__chromePassInjected = true;

  const HOST_URL = window.location.hostname;

  const translations = {
    en: {
      title: 'Chrome Pass',
      unlockTitle: 'Unlock to sign in',
      unlockPlaceholder: 'Master password',
      unlockButton: 'Unlock',
      noEntries: 'No saved accounts for this site.',
      savedAccounts: 'Saved accounts',
      saveCurrent: 'Save this account',
      saveSuccess: 'Saved.',
      updateSuccess: 'Updated.',
      saveNeedsUsername: 'Fill in username and password first.',
      close: 'Close',
      lockedHint: 'Locked — enter master password to use saved accounts.'
    },
    zh_CN: {
      title: 'Chrome Pass',
      unlockTitle: '解锁以登录',
      unlockPlaceholder: '主密码',
      unlockButton: '解锁',
      noEntries: '此网站尚无已储存的帐号。',
      savedAccounts: '已储存的帐号',
      saveCurrent: '储存此帐号',
      saveSuccess: '已储存。',
      updateSuccess: '已更新。',
      saveNeedsUsername: '请先填入帐号和密码。',
      close: '关闭',
      lockedHint: '已锁定 — 请输入主密码以使用已储存的帐号。'
    },
    zh_TW: {
      title: 'Chrome Pass',
      unlockTitle: '解鎖以登入',
      unlockPlaceholder: '主密碼',
      unlockButton: '解鎖',
      noEntries: '此網站尚無已儲存的帳號。',
      savedAccounts: '已儲存的帳號',
      saveCurrent: '儲存此帳號',
      saveSuccess: '已儲存。',
      updateSuccess: '已更新。',
      saveNeedsUsername: '請先填入帳號與密碼。',
      close: '關閉',
      lockedHint: '已鎖定 — 請輸入主密碼以使用已儲存的帳號。'
    },
    ja: {
      title: 'Chrome Pass',
      unlockTitle: 'ロック解除してログイン',
      unlockPlaceholder: 'マスターパスワード',
      unlockButton: 'ロック解除',
      noEntries: 'このサイトの保存済みアカウントはありません。',
      savedAccounts: '保存済みアカウント',
      saveCurrent: 'このアカウントを保存',
      saveSuccess: '保存しました。',
      updateSuccess: '更新しました。',
      saveNeedsUsername: 'ユーザー名とパスワードを入力してください。',
      close: '閉じる',
      lockedHint: 'ロック中 — マスターパスワードを入力してください。'
    }
  };

  let userLang = 'en';
  let t = translations.en;

  function loadLang() {
    try {
      chrome.storage.local.get('userLanguage', (res) => {
        userLang = res && res.userLanguage ? res.userLanguage : 'en';
        t = { ...translations.en, ...(translations[userLang] || {}) };
      });
    } catch (e) { /* extension context invalidated; ignore */ }
  }
  loadLang();
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.userLanguage) loadLang();
    });
  } catch (e) { /* ignore */ }

  // --- Helpers ---
  function sendBg(message) {
    return new Promise((resolve) => {
      try {
        if (!chrome.runtime || !chrome.runtime.id) {
          resolve({ status: 'error', message: 'Extension context invalidated.' });
          return;
        }
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ status: 'error', message: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        resolve({ status: 'error', message: String(e) });
      }
    });
  }

  function findUsernameInput(passwordInput) {
    const verificationKeywords = ['code', 'otp', 'captcha', 'verify'];
    const isCandidate = (input) => {
      if (!input || input === passwordInput) return false;
      const tag = (input.type || '').toLowerCase();
      if (!['email', 'text', 'tel', ''].includes(tag)) return false;
      if ((input.autocomplete || '').toLowerCase() === 'one-time-code') return false;
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      return !verificationKeywords.some((k) => name.includes(k) || id.includes(k));
    };

    const form = passwordInput.closest('form');
    if (form) {
      const candidates = Array.from(form.querySelectorAll('input')).filter(isCandidate);
      if (candidates.length) return candidates.find((c) => c.value) || candidates[0];
    }

    let cur = passwordInput.parentElement;
    for (let i = 0; i < 6 && cur; i++) {
      const candidates = Array.from(cur.querySelectorAll('input')).filter(isCandidate);
      if (candidates.length) return candidates.find((c) => c.value) || candidates[0];
      cur = cur.parentElement;
    }
    return null;
  }

  function setNativeValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function fillIntoPage(passwordInput, username, password) {
    const usernameInput = findUsernameInput(passwordInput);
    if (usernameInput && username) setNativeValue(usernameInput, username);
    setNativeValue(passwordInput, password);
  }

  // --- Shadow DOM popup ---
  const SHADOW_CSS = `
    :host { all: initial; }
    .panel {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      width: 280px;
      background: #fff;
      color: #212529;
      border: 1px solid #dee2e6;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      overflow: hidden;
      font-size: 13px;
    }
    .header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 12px; border-bottom: 1px solid #eee; background: #fafafa;
    }
    .header .title { font-weight: 600; color: #212529; }
    .header .close {
      background: none; border: none; cursor: pointer; padding: 2px 6px;
      font-size: 16px; line-height: 1; color: #6c757d;
    }
    .header .close:hover { color: #212529; }
    .body { padding: 10px 12px; }
    .row { display: flex; gap: 8px; align-items: center; }
    .row + .row { margin-top: 8px; }
    .field {
      flex: 1; padding: 8px 10px; border: 1px solid #ccd0d5; border-radius: 6px;
      font-size: 13px; outline: none; background: #fff; color: #212529;
    }
    .field:focus { border-color: #4A90E2; box-shadow: 0 0 0 2px rgba(74,144,226,0.18); }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      background: #007bff; color: #fff; border: none; border-radius: 6px;
      padding: 8px 12px; font-size: 13px; cursor: pointer; white-space: nowrap;
    }
    .btn:hover { background: #0069d9; }
    .btn.secondary { background: #f1f3f5; color: #212529; border: 1px solid #dee2e6; }
    .btn.secondary:hover { background: #e9ecef; }
    .btn.block { width: 100%; padding: 9px 12px; }
    .hint { color: #6c757d; font-size: 12px; margin: 0 0 8px; }
    .section-title { font-size: 11px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 6px; }
    .entry-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; margin-bottom: 10px; }
    .entry {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 10px; border: 1px solid #e9ecef; border-radius: 6px;
      cursor: pointer; transition: background-color 0.15s, border-color 0.15s;
    }
    .entry:hover { background: #f6faff; border-color: #b3d7ff; }
    .entry .uname { font-weight: 500; color: #212529; overflow: hidden; text-overflow: ellipsis; }
    .entry .label { font-size: 11px; color: #6c757d; }
    .toast { margin-top: 8px; font-size: 12px; color: #155724; background: #d4edda; padding: 6px 8px; border-radius: 4px; }
    .toast.error { color: #721c24; background: #f8d7da; }
    .divider { height: 1px; background: #eee; margin: 10px 0; }
  `;

  let host = null;
  let shadow = null;
  let currentPasswordInput = null;
  let suppressForElement = new WeakSet(); // elements user closed for

  function ensureHost() {
    if (host && document.documentElement.contains(host)) return;
    host = document.createElement('div');
    host.id = '__chrome_pass_host__';
    host.style.cssText = 'position: fixed; top: 0; left: 0; z-index: 2147483647; display: none;';
    document.documentElement.appendChild(host);
    shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = SHADOW_CSS;
    shadow.appendChild(style);
    const root = document.createElement('div');
    root.className = 'panel';
    root.id = 'root';
    shadow.appendChild(root);
  }

  function positionAt(input) {
    const rect = input.getBoundingClientRect();
    const panelWidth = 280;
    let left = rect.left;
    const maxLeft = window.innerWidth - panelWidth - 8;
    if (left > maxLeft) left = Math.max(8, maxLeft);
    host.style.top = (rect.bottom + 4) + 'px';
    host.style.left = left + 'px';
    host.style.display = 'block';
  }

  function hidePopup() {
    if (host) host.style.display = 'none';
  }

  function showToast(msg, isError) {
    const root = shadow.getElementById('root');
    const existing = root.querySelector('.toast');
    if (existing) existing.remove();
    const div = document.createElement('div');
    div.className = 'toast' + (isError ? ' error' : '');
    div.textContent = msg;
    root.appendChild(div);
    setTimeout(() => { div.remove(); }, 1800);
  }

  async function render() {
    if (!currentPasswordInput) return;
    ensureHost();
    positionAt(currentPasswordInput);

    const root = shadow.getElementById('root');
    root.innerHTML = '';

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = t.title;
    const close = document.createElement('button');
    close.className = 'close';
    close.title = t.close;
    close.textContent = '×';
    close.addEventListener('click', () => {
      if (currentPasswordInput) suppressForElement.add(currentPasswordInput);
      hidePopup();
    });
    header.appendChild(title);
    header.appendChild(close);
    root.appendChild(header);

    const body = document.createElement('div');
    body.className = 'body';
    root.appendChild(body);

    const status = await sendBg({ type: 'LIST_ENTRIES', payload: { url: HOST_URL } });
    if (!status || status.status !== 'success') {
      const err = document.createElement('div');
      err.className = 'toast error';
      err.textContent = (status && status.message) || 'Error';
      body.appendChild(err);
      return;
    }

    if (!status.unlocked) {
      renderUnlock(body);
    } else {
      renderEntries(body, status.entries);
      renderSaveSection(body);
    }
  }

  function renderUnlock(body) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = t.unlockTitle;
    body.appendChild(hint);

    const row = document.createElement('div');
    row.className = 'row';
    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'field';
    input.placeholder = t.unlockPlaceholder;
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = t.unlockButton;
    const submit = async () => {
      const val = input.value;
      if (!val) return;
      const res = await sendBg({ type: 'UNLOCK_REQUEST', payload: { masterPassword: val } });
      if (res && res.status === 'success') {
        input.value = '';
        await render();
      } else {
        showToast((res && res.message) || 'Error', true);
      }
    };
    btn.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    row.appendChild(input);
    row.appendChild(btn);
    body.appendChild(row);
    setTimeout(() => input.focus(), 0);
  }

  function renderEntries(body, entries) {
    if (entries && entries.length) {
      const head = document.createElement('p');
      head.className = 'section-title';
      head.textContent = t.savedAccounts;
      body.appendChild(head);

      const list = document.createElement('div');
      list.className = 'entry-list';
      entries.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'entry';
        const left = document.createElement('div');
        const uname = document.createElement('div');
        uname.className = 'uname';
        uname.textContent = entry.username;
        left.appendChild(uname);
        if (entry.label) {
          const lab = document.createElement('div');
          lab.className = 'label';
          lab.textContent = entry.label;
          left.appendChild(lab);
        }
        item.appendChild(left);
        item.addEventListener('click', async () => {
          const res = await sendBg({ type: 'GET_DECRYPTED', payload: { url: HOST_URL, entryId: entry.id } });
          if (res && res.status === 'success' && currentPasswordInput) {
            fillIntoPage(currentPasswordInput, res.username, res.password);
            hidePopup();
          } else {
            showToast((res && res.message) || 'Error', true);
          }
        });
        list.appendChild(item);
      });
      body.appendChild(list);
    } else {
      const hint = document.createElement('p');
      hint.className = 'hint';
      hint.textContent = t.noEntries;
      body.appendChild(hint);
    }
  }

  function renderSaveSection(body) {
    const divider = document.createElement('div');
    divider.className = 'divider';
    body.appendChild(divider);

    const btn = document.createElement('button');
    btn.className = 'btn block';
    btn.textContent = t.saveCurrent;
    btn.addEventListener('click', async () => {
      if (!currentPasswordInput) return;
      const password = currentPasswordInput.value;
      const usernameInput = findUsernameInput(currentPasswordInput);
      const username = usernameInput ? usernameInput.value : '';
      if (!password || !username) {
        showToast(t.saveNeedsUsername, true);
        return;
      }
      const res = await sendBg({
        type: 'SAVE_FROM_PAGE',
        payload: { url: HOST_URL, username, password }
      });
      if (res && res.status === 'success') {
        showToast(res.updated ? t.updateSuccess : t.saveSuccess, false);
        setTimeout(() => render(), 600);
      } else {
        showToast((res && res.message) || 'Error', true);
      }
    });
    body.appendChild(btn);
  }

  // --- Event wiring ---
  document.addEventListener('focusin', (e) => {
    const tgt = e.target;
    if (!tgt || !tgt.matches || !tgt.matches('input[type="password"]')) return;
    if (suppressForElement.has(tgt)) return;
    currentPasswordInput = tgt;
    render();
  });

  document.addEventListener('mousedown', (e) => {
    if (!host || host.style.display === 'none') return;
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(host)) return;
    if (e.target === currentPasswordInput) return;
    hidePopup();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && host && host.style.display !== 'none') hidePopup();
  });

  const reposition = () => {
    if (currentPasswordInput && host && host.style.display !== 'none') {
      if (!document.contains(currentPasswordInput)) { hidePopup(); return; }
      positionAt(currentPasswordInput);
    }
  };
  window.addEventListener('scroll', reposition, true);
  window.addEventListener('resize', reposition);

  // Fill request from popup (background -> active tab)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type !== 'FILL_CREDENTIALS') return false;
    const { username, password } = request.payload || {};
    const passwordInput = currentPasswordInput && document.contains(currentPasswordInput)
      ? currentPasswordInput
      : document.querySelector('input[type="password"]');
    if (!passwordInput) {
      sendResponse({ status: 'error', message: 'No password field on page.' });
      return true;
    }
    fillIntoPage(passwordInput, username, password);
    sendResponse({ status: 'success' });
    return true;
  });
})();
