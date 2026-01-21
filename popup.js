document.addEventListener('DOMContentLoaded', () => {
  const translations = {
    en: {
      popupTitle: "Local Secure Password Manager",
      exportButton: "Export",
      noPasswords: "No passwords saved yet.",
      usernameLabel: "Username: ",
      fillButton: "Fill",
      deleteButton: "Delete",
      exportAlert: "No passwords to export.",
      languageTitle: "Select Language",
      fillIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
      deleteIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`
    },
    zh_CN: {
      popupTitle: "本地安全密码管理器",
      exportButton: "导出",
      noPasswords: "尚未保存任何密码。",
      usernameLabel: "用户名：",
      fillButton: "填充",
      deleteButton: "删除",
      exportAlert: "没有密码可以导出。",
      languageTitle: "选择语言"
    },
    zh_TW: {
      popupTitle: "本地安全密碼管理器",
      exportButton: "匯出",
      noPasswords: "尚未儲存任何密碼。",
      usernameLabel: "使用者名稱：",
      fillButton: "填入",
      deleteButton: "刪除",
      exportAlert: "沒有密碼可以匯出。",
      languageTitle: "選擇語言"
    },
    ja: {
      popupTitle: "ローカルセキュアパスワードマネージャー",
      exportButton: "エクスポート",
      noPasswords: "パスワードはまだ保存されていません。",
      usernameLabel: "ユーザー名：",
      fillButton: "入力",
      deleteButton: "削除",
      exportAlert: "エクスポートするパスワードがありません。",
      languageTitle: "言語を選択"
    },
    ko: {
      popupTitle: "로컬 보안 비밀번호 관리자",
      exportButton: "내보내기",
      noPasswords: "저장된 비밀번호가 없습니다.",
      usernameLabel: "사용자 이름:",
      fillButton: "채우기",
      deleteButton: "삭제",
      exportAlert: "내보낼 비밀번호가 없습니다.",
      languageTitle: "언어 선택"
    },
    fr: {
      popupTitle: "Gestionnaire de mots de passe local",
      exportButton: "Exporter",
      noPasswords: "Aucun mot de passe enregistré.",
      usernameLabel: "Nom d'utilisateur : ",
      fillButton: "Remplir",
      deleteButton: "Supprimer",
      exportAlert: "Aucun mot de passe à exporter.",
      languageTitle: "Sélectionner la langue"
    },
    id: {
      popupTitle: "Manajer Kata Sandi Aman Lokal",
      exportButton: "Ekspor",
      noPasswords: "Belum ada kata sandi yang disimpan.",
      usernameLabel: "Nama pengguna: ",
      fillButton: "Isi",
      deleteButton: "Hapus",
      exportAlert: "Tidak ada kata sandi untuk diekspor.",
      languageTitle: "Pilih Bahasa"
    },
    hi: {
      popupTitle: "स्थानीय सुरक्षित पासवर्ड प्रबंधक",
      exportButton: "निर्यात",
      noPasswords: "कोई पासवर्ड अभी तक सहेजा नहीं गया है।",
      usernameLabel: "उपयोगकर्ता नाम: ",
      fillButton: "भरें",
      deleteButton: "हटाएं",
      exportAlert: "निर्यात करने के लिए कोई पासवर्ड नहीं है।",
      languageTitle: "भाषा चुनें"
    },
    vi: {
      popupTitle: "Trình quản lý mật khẩu an toàn",
      exportButton: "Xuất",
      noPasswords: "Chưa có mật khẩu nào được lưu.",
      usernameLabel: "Tên người dùng: ",
      fillButton: "Điền",
      deleteButton: "Xóa",
      exportAlert: "Không có mật khẩu để xuất.",
      languageTitle: "Chọn ngôn ngữ"
    }
  };

  const passwordList = document.getElementById('password-list');
  const languageSelect = document.getElementById('language-select');
  const popupTitle = document.getElementById('popup-title');
  const exportButton = document.getElementById('export-button');
  const exportButtonText = exportButton.querySelector('.button-text');

  let currentLang = 'en';

  function applyTranslations(lang) {
    const t = { ...translations.en, ...translations[lang] };
    popupTitle.textContent = t.popupTitle;
    exportButtonText.textContent = t.exportButton;
    languageSelect.title = t.languageTitle;
    currentLang = lang;
    renderPasswords();
  }

  function renderPasswords() {
    const t = { ...translations.en, ...translations[currentLang] };
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

      for (const key in credentials) {
        if (credentials.hasOwnProperty(key)) {
          const credential = credentials[key];
          const listItem = document.createElement('li');

          const infoDiv = document.createElement('div');
          infoDiv.className = 'credential-info';

          const urlSpan = document.createElement('span');
          urlSpan.className = 'url';
          urlSpan.textContent = key;
          infoDiv.appendChild(urlSpan);

          const usernameSpan = document.createElement('span');
          usernameSpan.className = 'username';
          usernameSpan.textContent = t.usernameLabel + credential.username;
          infoDiv.appendChild(usernameSpan);
          
          listItem.appendChild(infoDiv);

          const actionsDiv = document.createElement('div');
          actionsDiv.className = 'actions';

          const fillButton = document.createElement('button');
          fillButton.innerHTML = `${t.fillIcon} ${t.fillButton}`;
          fillButton.dataset.url = key;
          fillButton.addEventListener('click', (e) => {
            const url = e.currentTarget.dataset.url;
            chrome.runtime.sendMessage({ type: 'FILL_REQUEST', payload: { url } }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('Fill request failed:', chrome.runtime.lastError.message);
              } else if (response && response.status === 'success') {
                window.close();
              } else {
                console.error('Fill failed:', response?.message);
              }
            });
          });
          actionsDiv.appendChild(fillButton);

          const deleteButton = document.createElement('button');
          deleteButton.className = 'delete';
          deleteButton.innerHTML = `${t.deleteIcon} ${t.deleteButton}`;
          deleteButton.dataset.url = key;
          deleteButton.addEventListener('click', (e) => {
            const url = e.currentTarget.dataset.url;
            chrome.storage.local.remove(url, () => {
              renderPasswords();
            });
          });
          actionsDiv.appendChild(deleteButton);

          listItem.appendChild(actionsDiv);
          passwordList.appendChild(listItem);
        }
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
      chrome.storage.local.set({ userLanguage: newLang }, () => {
        applyTranslations(newLang);
      });
    });

    exportButton.addEventListener('click', () => {
      const t = { ...translations.en, ...translations[currentLang] };
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
        a.download = 'passwords.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  init();
});
