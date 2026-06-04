(function () {
  if (window.__chromePassInjected) return;
  window.__chromePassInjected = true;

  // Origin (e.g. "https://example.com") instead of bare hostname — avoids
  // collapsing http and https into the same vault entry. Bail out on opaque
  // origins ("null"), which happen on sandboxed iframes and some file:// pages.
  const HOST_URL = window.location.origin;
  if (!HOST_URL || HOST_URL === 'null') return;

  const translations = {
    en: {
      title: 'Chrome Pass',
      unlockTitle: 'Unlock to sign in',
      unlockPlaceholder: 'Master password',
      unlockButton: 'Unlock',
      migrateHint: 'Encryption upgrade — enter your existing master password.',
      setupRequired: 'Please open the extension popup to set up your master password first.',
      wrongPassword: 'Wrong master password.',
      noEntries: 'No saved accounts for this site.',
      savedAccounts: 'Saved accounts',
      saveCurrent: 'Save this account',
      saveSuccess: 'Saved.',
      updateSuccess: 'Updated.',
      saveNeedsUsername: 'Fill in username and password first.',
      close: 'Close',
      lockedHint: 'Locked — enter master password to use saved accounts.',
      generate: 'Generate password',
      genLength: 'Length',
      genLower: 'a-z',
      genUpper: 'A-Z',
      genDigits: '0-9',
      genSymbols: 'Symbols',
      genUseFill: 'Use & fill',
      genNeedClass: 'Pick at least one character set.',
      suppressSite: "Don't auto-show on this site",
      enableAutofill: 'Re-enable auto-show here',
      autofillEnabled: 'Auto-show re-enabled.',
      suppressedHint: 'Auto-show is off for this site.'
    },
    zh_CN: {
      title: 'Chrome Pass',
      unlockTitle: '解锁以登录',
      unlockPlaceholder: '主密码',
      unlockButton: '解锁',
      migrateHint: '加密升级 — 请输入您原本的主密码。',
      setupRequired: '请先打开扩展弹窗设定主密码。',
      wrongPassword: '主密码错误。',
      noEntries: '此网站尚无已储存的帐号。',
      savedAccounts: '已储存的帐号',
      saveCurrent: '储存此帐号',
      saveSuccess: '已储存。',
      updateSuccess: '已更新。',
      saveNeedsUsername: '请先填入帐号和密码。',
      close: '关闭',
      lockedHint: '已锁定 — 请输入主密码以使用已储存的帐号。',
      generate: '生成密码',
      genLength: '长度',
      genLower: 'a-z',
      genUpper: 'A-Z',
      genDigits: '0-9',
      genSymbols: '符号',
      genUseFill: '使用并填入',
      genNeedClass: '请至少选择一种字符集。',
      suppressSite: '此网站不再自动显示',
      enableAutofill: '重新开启自动显示',
      autofillEnabled: '已重新开启自动显示。',
      suppressedHint: '此网站的自动显示已关闭。'
    },
    zh_TW: {
      title: 'Chrome Pass',
      unlockTitle: '解鎖以登入',
      unlockPlaceholder: '主密碼',
      unlockButton: '解鎖',
      migrateHint: '加密升級 — 請輸入您原本的主密碼。',
      setupRequired: '請先開啟擴充功能彈窗設定主密碼。',
      wrongPassword: '主密碼錯誤。',
      noEntries: '此網站尚無已儲存的帳號。',
      savedAccounts: '已儲存的帳號',
      saveCurrent: '儲存此帳號',
      saveSuccess: '已儲存。',
      updateSuccess: '已更新。',
      saveNeedsUsername: '請先填入帳號與密碼。',
      close: '關閉',
      lockedHint: '已鎖定 — 請輸入主密碼以使用已儲存的帳號。',
      generate: '產生密碼',
      genLength: '長度',
      genLower: 'a-z',
      genUpper: 'A-Z',
      genDigits: '0-9',
      genSymbols: '符號',
      genUseFill: '使用並填入',
      genNeedClass: '請至少選擇一種字元集。',
      suppressSite: '此網站不再自動顯示',
      enableAutofill: '重新開啟自動顯示',
      autofillEnabled: '已重新開啟自動顯示。',
      suppressedHint: '此網站的自動顯示已關閉。'
    },
    ja: {
      title: 'Chrome Pass',
      unlockTitle: 'ロック解除してログイン',
      unlockPlaceholder: 'マスターパスワード',
      unlockButton: 'ロック解除',
      migrateHint: '暗号化アップグレード — 既存のマスターパスワードを入力してください。',
      setupRequired: '先に拡張機能のポップアップでマスターパスワードを設定してください。',
      wrongPassword: 'マスターパスワードが違います。',
      noEntries: 'このサイトの保存済みアカウントはありません。',
      savedAccounts: '保存済みアカウント',
      saveCurrent: 'このアカウントを保存',
      saveSuccess: '保存しました。',
      updateSuccess: '更新しました。',
      saveNeedsUsername: 'ユーザー名とパスワードを入力してください。',
      close: '閉じる',
      lockedHint: 'ロック中 — マスターパスワードを入力してください。',
      generate: 'パスワード生成',
      genLength: '長さ',
      genLower: 'a-z',
      genUpper: 'A-Z',
      genDigits: '0-9',
      genSymbols: '記号',
      genUseFill: '使用して入力',
      genNeedClass: '少なくとも 1 種類を選んでください。',
      suppressSite: 'このサイトで自動表示しない',
      enableAutofill: 'このサイトで自動表示を再開',
      autofillEnabled: '自動表示を再開しました。',
      suppressedHint: 'このサイトの自動表示はオフです。'
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

  // --- Per-site auto-show suppression ---
  // When the user picks "don't auto-show on this site", we record this origin in
  // a reserved chrome.storage.local key (a map of origin -> true). focusin then
  // stops auto-opening the popup on this origin until it's re-enabled — from this
  // popup's footer or the extension popup's settings. The keyboard shortcut still
  // force-opens regardless, so the user can always save deliberately.
  const AUTOFILL_SUPPRESS_KEY = '__autofillSuppressed__';
  let autofillSuppressed = false;

  function loadSuppressed() {
    try {
      chrome.storage.local.get(AUTOFILL_SUPPRESS_KEY, (res) => {
        const map = res && res[AUTOFILL_SUPPRESS_KEY];
        autofillSuppressed = !!(map && map[HOST_URL]);
      });
    } catch (e) { /* extension context invalidated; ignore */ }
  }

  function setSuppressed(on) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get(AUTOFILL_SUPPRESS_KEY, (res) => {
          const map = { ...((res && res[AUTOFILL_SUPPRESS_KEY]) || {}) };
          if (on) map[HOST_URL] = true; else delete map[HOST_URL];
          autofillSuppressed = on;
          chrome.storage.local.set({ [AUTOFILL_SUPPRESS_KEY]: map }, () => resolve());
        });
      } catch (e) { resolve(); }
    });
  }

  loadSuppressed();

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.userLanguage) loadLang();
      if (changes[AUTOFILL_SUPPRESS_KEY]) loadSuppressed();
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

  // --- Password generator ---
  // Cryptographically secure password using crypto.getRandomValues with
  // rejection sampling (drop bytes ≥ floor(256 / N) * N) so character
  // selection is uniform across the chosen alphabet.
  const GEN_LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const GEN_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const GEN_DIGITS = '0123456789';
  const GEN_SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';

  function generatePassword({ length, lower, upper, digits, symbols }) {
    let alphabet = '';
    if (lower) alphabet += GEN_LOWER;
    if (upper) alphabet += GEN_UPPER;
    if (digits) alphabet += GEN_DIGITS;
    if (symbols) alphabet += GEN_SYMBOLS;
    if (!alphabet) return '';
    const n = alphabet.length;
    const cutoff = Math.floor(256 / n) * n;
    const out = [];
    const buf = new Uint8Array(length * 2);
    while (out.length < length) {
      crypto.getRandomValues(buf);
      for (let i = 0; i < buf.length && out.length < length; i++) {
        if (buf[i] < cutoff) out.push(alphabet[buf[i] % n]);
      }
    }
    return out.join('');
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
    .gen-panel { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 8px; margin-top: 8px; }
    .gen-output {
      display: flex; gap: 6px; align-items: center; margin-bottom: 6px;
    }
    .gen-output input {
      flex: 1; padding: 6px 8px; border: 1px solid #ccd0d5; border-radius: 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: 12px;
      background: #fff; color: #212529;
    }
    .gen-row {
      display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
      font-size: 12px; color: #495057; margin-top: 6px;
    }
    .gen-row label { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
    .gen-row input[type="range"] { flex: 1; min-width: 80px; }
    .gen-row .length-val { font-variant-numeric: tabular-nums; min-width: 22px; text-align: right; }
    .gen-actions { display: flex; gap: 6px; margin-top: 8px; }
    .gen-actions .btn { flex: 1; padding: 6px 8px; font-size: 12px; }
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

    // Shown only when the popup was force-opened (keyboard shortcut) on a site
    // where auto-show is currently off, so the user knows why it didn't pop up.
    if (autofillSuppressed) {
      const sh = document.createElement('p');
      sh.className = 'hint';
      sh.textContent = t.suppressedHint;
      body.appendChild(sh);
    }

    const vaultState = await sendBg({ type: 'GET_VAULT_STATE' });
    if (!vaultState || vaultState.status !== 'success') {
      const err = document.createElement('div');
      err.className = 'toast error';
      err.textContent = (vaultState && vaultState.message) || 'Error';
      body.appendChild(err);
      return;
    }

    if (vaultState.unlocked) {
      const list = await sendBg({ type: 'LIST_ENTRIES', payload: { url: HOST_URL } });
      const entries = (list && list.status === 'success') ? list.entries : [];
      renderEntries(body, entries);
      renderSaveSection(body);
    } else if (vaultState.state === 'setup') {
      renderSetupRequired(body);
    } else {
      renderUnlock(body, vaultState.state);
    }

    renderFooter(body);
  }

  // Site-level control, shown in every state: suppress auto-show on this origin,
  // or (if already suppressed) re-enable it.
  function renderFooter(body) {
    const divider = document.createElement('div');
    divider.className = 'divider';
    body.appendChild(divider);

    const btn = document.createElement('button');
    btn.className = 'btn secondary block';
    if (autofillSuppressed) {
      btn.textContent = t.enableAutofill;
      btn.addEventListener('click', async () => {
        await setSuppressed(false);
        showToast(t.autofillEnabled, false);
        setTimeout(() => render(), 500);
      });
    } else {
      btn.textContent = t.suppressSite;
      btn.addEventListener('click', async () => {
        await setSuppressed(true);
        hidePopup();
      });
    }
    body.appendChild(btn);
  }

  function renderSetupRequired(body) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = t.setupRequired;
    body.appendChild(hint);
  }

  function renderUnlock(body, state) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = state === 'migrate' ? t.migrateHint : t.unlockTitle;
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
        const code = res && res.code;
        const msg = code === 'WRONG_PASSWORD' ? t.wrongPassword : ((res && res.message) || 'Error');
        showToast(msg, true);
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

    renderGenerator(body);
  }

  function renderGenerator(body) {
    const toggle = document.createElement('button');
    toggle.className = 'btn secondary block';
    toggle.style.marginTop = '6px';
    toggle.textContent = t.generate;
    body.appendChild(toggle);

    const panel = document.createElement('div');
    panel.className = 'gen-panel';
    panel.style.display = 'none';
    body.appendChild(panel);

    const output = document.createElement('div');
    output.className = 'gen-output';
    const outInput = document.createElement('input');
    outInput.type = 'text';
    outInput.readOnly = true;
    outInput.spellcheck = false;
    output.appendChild(outInput);
    panel.appendChild(output);

    const lenRow = document.createElement('div');
    lenRow.className = 'gen-row';
    const lenLabel = document.createElement('span');
    lenLabel.textContent = t.genLength;
    const lenSlider = document.createElement('input');
    lenSlider.type = 'range';
    lenSlider.min = '8';
    lenSlider.max = '40';
    lenSlider.value = '16';
    const lenVal = document.createElement('span');
    lenVal.className = 'length-val';
    lenVal.textContent = lenSlider.value;
    lenSlider.addEventListener('input', () => { lenVal.textContent = lenSlider.value; regenerate(); });
    lenRow.appendChild(lenLabel);
    lenRow.appendChild(lenSlider);
    lenRow.appendChild(lenVal);
    panel.appendChild(lenRow);

    const classRow = document.createElement('div');
    classRow.className = 'gen-row';
    const makeBox = (label, checked) => {
      const wrap = document.createElement('label');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = checked;
      cb.addEventListener('change', regenerate);
      const span = document.createElement('span');
      span.textContent = label;
      wrap.appendChild(cb);
      wrap.appendChild(span);
      classRow.appendChild(wrap);
      return cb;
    };
    const cbLower = makeBox(t.genLower, true);
    const cbUpper = makeBox(t.genUpper, true);
    const cbDigits = makeBox(t.genDigits, true);
    const cbSymbols = makeBox(t.genSymbols, true);
    panel.appendChild(classRow);

    const actions = document.createElement('div');
    actions.className = 'gen-actions';
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn secondary';
    refreshBtn.textContent = '↻';
    refreshBtn.title = t.generate;
    refreshBtn.addEventListener('click', regenerate);
    const useBtn = document.createElement('button');
    useBtn.className = 'btn';
    useBtn.textContent = t.genUseFill;
    useBtn.addEventListener('click', () => {
      if (!outInput.value || !currentPasswordInput) return;
      setNativeValue(currentPasswordInput, outInput.value);
      panel.style.display = 'none';
    });
    actions.appendChild(refreshBtn);
    actions.appendChild(useBtn);
    panel.appendChild(actions);

    function regenerate() {
      const opts = {
        length: parseInt(lenSlider.value, 10) || 16,
        lower: cbLower.checked,
        upper: cbUpper.checked,
        digits: cbDigits.checked,
        symbols: cbSymbols.checked
      };
      const pwd = generatePassword(opts);
      outInput.value = pwd;
      if (!pwd) showToast(t.genNeedClass, true);
    }

    toggle.addEventListener('click', () => {
      const open = panel.style.display !== 'none';
      panel.style.display = open ? 'none' : 'block';
      if (!open && !outInput.value) regenerate();
    });
  }

  // --- Event wiring ---
  document.addEventListener('focusin', (e) => {
    const tgt = e.target;
    if (!tgt || !tgt.matches || !tgt.matches('input[type="password"]')) return;
    if (autofillSuppressed) return;
    if (suppressForElement.has(tgt)) return;
    currentPasswordInput = tgt;
    render();
  });

  // Force-open shortcut (Alt+Shift+P): bring up the popup even when auto-show is
  // suppressed for this site, so the user can still save a password or re-enable.
  // Capture phase + e.code so it survives pages that stopPropagation on keydown
  // and is layout-independent.
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
    if (e.code !== 'KeyP') return;
    const active = document.activeElement;
    const tgt = (active && active.matches && active.matches('input[type="password"]'))
      ? active
      : document.querySelector('input[type="password"]');
    if (!tgt) return;
    e.preventDefault();
    currentPasswordInput = tgt;
    render();
  }, true);

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
