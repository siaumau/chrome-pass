document.addEventListener('DOMContentLoaded', () => {
  const translations = {
    en: {
      popupTitle: "Local Secure Password Manager",
      exportButton: "Export",
      noPasswords: "No passwords saved yet.",
      noMatches: "No matching entries.",
      usernameLabel: "Username: ",
      fillButton: "Fill",
      deleteButton: "Delete",
      exportAlert: "No passwords to export.",
      languageTitle: "Select Language",
      masterPasswordTitle: "Master Password",
      saveKeyButton: "Save Key",
      masterPasswordPlaceholder: "Enter your master password",
      unlockPrompt: "Please enter your master password to unlock.",
      searchPlaceholder: "Search site or username...",
      confirmDelete: "Delete this entry?",
      fillIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      deleteIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
    },
    zh_CN: {
      popupTitle: "本地安全密码管理器",
      exportButton: "导出",
      noPasswords: "尚未保存任何密码。",
      noMatches: "没有符合的项目。",
      usernameLabel: "用户名：",
      fillButton: "填充",
      deleteButton: "删除",
      exportAlert: "没有密码可以导出。",
      languageTitle: "选择语言",
      masterPasswordTitle: "主密码",
      saveKeyButton: "保存密钥",
      searchPlaceholder: "搜索网站或用户名...",
      confirmDelete: "要删除这一组帐号吗？"
    },
    zh_TW: {
      popupTitle: "本地安全密碼管理器",
      exportButton: "匯出",
      noPasswords: "尚未儲存任何密碼。",
      noMatches: "沒有符合的項目。",
      usernameLabel: "使用者名稱：",
      fillButton: "填入",
      deleteButton: "刪除",
      exportAlert: "沒有密碼可以匯出。",
      languageTitle: "選擇語言",
      masterPasswordTitle: "主密碼",
      saveKeyButton: "儲存金鑰",
      searchPlaceholder: "搜尋網站或帳號...",
      confirmDelete: "要刪除這一組帳號嗎？"
    },
    ja: {
      popupTitle: "ローカルセキュアパスワードマネージャー",
      exportButton: "エクスポート",
      noPasswords: "パスワードはまだ保存されていません。",
      noMatches: "一致する項目がありません。",
      usernameLabel: "ユーザー名：",
      fillButton: "入力",
      deleteButton: "削除",
      exportAlert: "エクスポートするパスワードがありません。",
      languageTitle: "言語を選択",
      masterPasswordTitle: "マスターパスワード",
      saveKeyButton: "キーを保存",
      searchPlaceholder: "サイトまたはユーザー名を検索...",
      confirmDelete: "このアカウントを削除しますか？"
    },
    ko: {
      popupTitle: "로컬 보안 비밀번호 관리자",
      exportButton: "내보내기",
      noPasswords: "저장된 비밀번호가 없습니다.",
      noMatches: "일치하는 항목이 없습니다.",
      usernameLabel: "사용자 이름:",
      fillButton: "채우기",
      deleteButton: "삭제",
      exportAlert: "내보낼 비밀번호가 없습니다.",
      languageTitle: "언어 선택",
      masterPasswordTitle: "마스터 비밀번호",
      saveKeyButton: "키 저장",
      searchPlaceholder: "사이트 또는 사용자 이름 검색...",
      confirmDelete: "이 항목을 삭제하시겠습니까?"
    },
    fr: {
      popupTitle: "Gestionnaire de mots de passe local",
      exportButton: "Exporter",
      noPasswords: "Aucun mot de passe enregistré.",
      noMatches: "Aucune entrée correspondante.",
      usernameLabel: "Nom d'utilisateur : ",
      fillButton: "Remplir",
      deleteButton: "Supprimer",
      exportAlert: "Aucun mot de passe à exporter.",
      languageTitle: "Sélectionner la langue",
      masterPasswordTitle: "Mot de passe principal",
      saveKeyButton: "Enregistrer la clé",
      searchPlaceholder: "Rechercher un site ou un nom d'utilisateur...",
      confirmDelete: "Supprimer cette entrée ?"
    },
    id: {
      popupTitle: "Manajer Kata Sandi Aman Lokal",
      exportButton: "Ekspor",
      noPasswords: "Belum ada kata sandi yang disimpan.",
      noMatches: "Tidak ada entri yang cocok.",
      usernameLabel: "Nama pengguna: ",
      fillButton: "Isi",
      deleteButton: "Hapus",
      exportAlert: "Tidak ada kata sandi untuk diekspor.",
      languageTitle: "Pilih Bahasa",
      masterPasswordTitle: "Kata Sandi Utama",
      saveKeyButton: "Simpan Kunci",
      searchPlaceholder: "Cari situs atau nama pengguna...",
      confirmDelete: "Hapus entri ini?"
    },
    hi: {
      popupTitle: "स्थानीय सुरक्षित पासवर्ड प्रबंधक",
      exportButton: "निर्यात",
      noPasswords: "कोई पासवर्ड अभी तक सहेजा नहीं गया है।",
      noMatches: "कोई मेल खाने वाली प्रविष्टि नहीं।",
      usernameLabel: "उपयोगकर्ता नाम: ",
      fillButton: "भरें",
      deleteButton: "हटाएं",
      exportAlert: "निर्यात करने के लिए कोई पासवर्ड नहीं है।",
      languageTitle: "भाषा चुनें",
      masterPasswordTitle: "मास्टर पासवर्ड",
      saveKeyButton: "कुंजी सहेजें",
      searchPlaceholder: "साइट या उपयोगकर्ता नाम खोजें...",
      confirmDelete: "इस प्रविष्टि को हटाएं?"
    },
    vi: {
      popupTitle: "Trình quản lý mật khẩu an toàn",
      exportButton: "Xuất",
      noPasswords: "Chưa có mật khẩu nào được lưu.",
      noMatches: "Không có mục nào phù hợp.",
      usernameLabel: "Tên người dùng: ",
      fillButton: "Điền",
      deleteButton: "Xóa",
      exportAlert: "Không có mật khẩu để xuất.",
      languageTitle: "Chọn ngôn ngữ",
      masterPasswordTitle: "Mật khẩu chủ",
      saveKeyButton: "Lưu khóa",
      searchPlaceholder: "Tìm trang web hoặc tên người dùng...",
      confirmDelete: "Xóa mục này?"
    }
  };

  const passwordList = document.getElementById('password-list');
  const languageSelect = document.getElementById('language-select');
  const popupTitle = document.getElementById('popup-title');
  const exportButton = document.getElementById('export-button');
  const exportButtonText = exportButton.querySelector('.button-text');
  const masterPasswordTitle = document.getElementById('master-password-title');
  const masterPasswordInput = document.getElementById('master-password-input');
  const saveMasterPasswordButton = document.getElementById('save-master-password');
  const saveMasterPasswordButtonText = saveMasterPasswordButton.querySelector('.button-text');
  const masterPasswordSection = document.querySelector('.master-password-section');
  const searchInput = document.getElementById('search-input');
  const searchBar = document.querySelector('.search-bar');

  let currentLang = 'en';
  let searchQuery = '';

  const tr = () => ({ ...translations.en, ...translations[currentLang] });

  function applyTranslations(lang) {
    const t = { ...translations.en, ...translations[lang] };
    popupTitle.textContent = t.popupTitle;
    exportButtonText.textContent = t.exportButton;
    languageSelect.title = t.languageTitle;
    masterPasswordTitle.textContent = t.masterPasswordTitle;
    saveMasterPasswordButtonText.textContent = t.saveKeyButton;
    masterPasswordInput.placeholder = t.masterPasswordPlaceholder;
    searchInput.placeholder = t.searchPlaceholder;
    currentLang = lang;
    checkMasterPasswordStatus();
  }

  function checkMasterPasswordStatus() {
    const t = tr();
    chrome.storage.session.get('masterPassword', (result) => {
      if (result.masterPassword) {
        masterPasswordSection.style.display = 'none';
        passwordList.style.display = 'block';
        searchBar.style.display = 'flex';
        renderPasswords();
      } else {
        masterPasswordSection.style.display = 'block';
        searchBar.style.display = 'none';
        passwordList.innerHTML = `<li style="text-align: center; justify-content: center;">${t.unlockPrompt}</li>`;
        passwordList.style.display = 'block';
      }
    });
  }

  // Normalise stored value to array form regardless of legacy shape.
  function toEntries(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object' && 'username' in value) {
      return [{ id: '__legacy__', username: value.username, password: value.password, label: '', createdAt: 0 }];
    }
    return [];
  }

  function renderPasswords() {
    const t = tr();
    chrome.storage.local.get(null, (items) => {
      passwordList.innerHTML = '';
      const credentials = { ...items };
      delete credentials.userLanguage;

      if (Object.keys(credentials).length === 0) {
        const li = document.createElement('li');
        li.textContent = t.noPasswords;
        li.style.textAlign = 'center';
        li.style.justifyContent = 'center';
        passwordList.appendChild(li);
        return;
      }

      const q = searchQuery.trim().toLowerCase();
      let anyMatch = false;

      const urls = Object.keys(credentials).sort();
      urls.forEach((url) => {
        const entries = toEntries(credentials[url]);
        const filtered = q
          ? entries.filter((e) => url.toLowerCase().includes(q) || (e.username || '').toLowerCase().includes(q))
          : entries;
        if (!filtered.length) return;
        anyMatch = true;

        const group = document.createElement('div');
        group.className = 'url-group';

        const head = document.createElement('div');
        head.className = 'url-header';
        head.textContent = url;
        group.appendChild(head);

        filtered.forEach((entry) => {
          const row = document.createElement('div');
          row.className = 'entry-row';

          const uname = document.createElement('span');
          uname.className = 'username';
          uname.textContent = entry.username;
          row.appendChild(uname);

          const actions = document.createElement('div');
          actions.className = 'actions';

          const fillBtn = document.createElement('button');
          fillBtn.innerHTML = `${t.fillIcon} ${t.fillButton}`;
          fillBtn.addEventListener('click', () => {
            chrome.runtime.sendMessage(
              { type: 'FILL_REQUEST', payload: { url, entryId: entry.id } },
              (response) => {
                if (chrome.runtime.lastError) {
                  alert(chrome.runtime.lastError.message);
                } else if (response && response.status === 'success') {
                  window.close();
                } else {
                  alert((response && response.message) || 'Fill failed.');
                }
              }
            );
          });
          actions.appendChild(fillBtn);

          const delBtn = document.createElement('button');
          delBtn.className = 'delete';
          delBtn.innerHTML = `${t.deleteIcon} ${t.deleteButton}`;
          delBtn.addEventListener('click', () => {
            if (!confirm(t.confirmDelete)) return;
            chrome.runtime.sendMessage(
              { type: 'DELETE_ENTRY', payload: { url, entryId: entry.id } },
              () => renderPasswords()
            );
          });
          actions.appendChild(delBtn);

          row.appendChild(actions);
          group.appendChild(row);
        });

        passwordList.appendChild(group);
      });

      if (!anyMatch) {
        const li = document.createElement('li');
        li.textContent = q ? t.noMatches : t.noPasswords;
        li.style.textAlign = 'center';
        li.style.justifyContent = 'center';
        passwordList.appendChild(li);
      }
    });
  }

  function init() {
    chrome.storage.local.get('userLanguage', (result) => {
      const savedLang = result.userLanguage || 'en';
      languageSelect.value = savedLang;
      currentLang = savedLang;
      applyTranslations(currentLang);
    });

    languageSelect.addEventListener('change', (e) => {
      const newLang = e.target.value;
      chrome.storage.local.set({ userLanguage: newLang }, () => applyTranslations(newLang));
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderPasswords();
    });

    saveMasterPasswordButton.addEventListener('click', () => {
      const masterPassword = masterPasswordInput.value;
      if (!masterPassword) return;
      chrome.runtime.sendMessage({ type: 'UNLOCK_REQUEST', payload: { masterPassword } }, () => {
        masterPasswordInput.value = '';
        checkMasterPasswordStatus();
      });
    });

    masterPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); saveMasterPasswordButton.click(); }
    });

    exportButton.addEventListener('click', () => {
      const t = tr();
      chrome.storage.local.get(null, (items) => {
        const credentials = { ...items };
        delete credentials.userLanguage;
        if (Object.keys(credentials).length === 0) {
          alert(t.exportAlert);
          return;
        }
        const dataStr = JSON.stringify(credentials, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'passwords-encrypted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  init();
});
