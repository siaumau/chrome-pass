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
      setupKeyButton: "Create",
      unlockKeyButton: "Unlock",
      masterPasswordPlaceholder: "Enter your master password",
      confirmPasswordPlaceholder: "Confirm master password",
      unlockPrompt: "Please enter your master password to unlock.",
      setupTitle: "Set Master Password",
      setupHint: "First-time setup — choose a master password. You will need it every time you unlock; it cannot be recovered.",
      unlockHint: "Enter your master password to unlock.",
      migrateHint: "Upgrading encryption. Enter your existing master password — your saved data will be re-encrypted with stronger keys.",
      searchPlaceholder: "Search site or username...",
      confirmDelete: "Delete this entry?",
      errPasswordMismatch: "The two passwords do not match.",
      errWrongPassword: "Wrong master password.",
      errEmptyPassword: "Please enter a password.",
      errMigrationFailed: "Failed to migrate existing data. Please report this issue.",
      errGeneric: "Something went wrong. Please try again.",
      errPasswordTooShort: "Master password must be at least 8 characters.",
      strengthWeak: "Weak",
      strengthFair: "Fair",
      strengthGood: "Good",
      strengthStrong: "Strong",
      autoLockLabel: "Auto-lock after",
      autoLockNever: "Never",
      lockNowButton: "Lock now",
      settingsTitle: "Settings",
      autoLockUnit: "min",
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
      setupKeyButton: "建立",
      unlockKeyButton: "解锁",
      masterPasswordPlaceholder: "输入您的主密码",
      confirmPasswordPlaceholder: "再次输入主密码",
      setupTitle: "设定主密码",
      setupHint: "首次使用 — 请设定主密码。每次解锁都会用到，且无法找回。",
      unlockHint: "请输入主密码以解锁。",
      migrateHint: "正在升级加密。请输入您原本的主密码，系统将以更强的加密重新储存资料。",
      searchPlaceholder: "搜索网站或用户名...",
      confirmDelete: "要删除这一组帐号吗？",
      errPasswordMismatch: "两次输入的密码不一致。",
      errWrongPassword: "主密码错误。",
      errEmptyPassword: "请输入密码。",
      errMigrationFailed: "升级旧资料失败，请回报问题。",
      errGeneric: "发生错误，请再试一次。",
      errPasswordTooShort: "主密码至少需要 8 个字元。",
      strengthWeak: "弱",
      strengthFair: "普通",
      strengthGood: "良好",
      strengthStrong: "强",
      autoLockLabel: "自动锁定",
      autoLockNever: "永不",
      lockNowButton: "立即锁定",
      settingsTitle: "设定",
      autoLockUnit: "分钟"
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
      setupKeyButton: "建立",
      unlockKeyButton: "解鎖",
      masterPasswordPlaceholder: "輸入您的主密碼",
      confirmPasswordPlaceholder: "再次輸入主密碼",
      setupTitle: "設定主密碼",
      setupHint: "首次使用 — 請設定主密碼。每次解鎖都會用到，且無法找回。",
      unlockHint: "請輸入主密碼以解鎖。",
      migrateHint: "正在升級加密。請輸入您原本的主密碼，系統會用更強的加密重新儲存資料。",
      searchPlaceholder: "搜尋網站或帳號...",
      confirmDelete: "要刪除這一組帳號嗎？",
      errPasswordMismatch: "兩次輸入的密碼不一致。",
      errWrongPassword: "主密碼錯誤。",
      errEmptyPassword: "請輸入密碼。",
      errMigrationFailed: "升級舊資料失敗，請回報問題。",
      errGeneric: "發生錯誤，請再試一次。",
      errPasswordTooShort: "主密碼至少需要 8 個字元。",
      strengthWeak: "弱",
      strengthFair: "普通",
      strengthGood: "良好",
      strengthStrong: "強",
      autoLockLabel: "自動鎖定",
      autoLockNever: "永不",
      lockNowButton: "立即鎖定",
      settingsTitle: "設定",
      autoLockUnit: "分鐘"
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
      setupKeyButton: "作成",
      unlockKeyButton: "ロック解除",
      masterPasswordPlaceholder: "マスターパスワードを入力",
      confirmPasswordPlaceholder: "もう一度入力",
      setupTitle: "マスターパスワードの設定",
      setupHint: "初回設定 — マスターパスワードを決めてください。解除のたびに使用し、復元できません。",
      unlockHint: "マスターパスワードを入力してください。",
      migrateHint: "暗号化をアップグレード中。既存のマスターパスワードを入力すると、より強い暗号で再保存されます。",
      searchPlaceholder: "サイトまたはユーザー名を検索...",
      confirmDelete: "このアカウントを削除しますか？",
      errPasswordMismatch: "二つのパスワードが一致しません。",
      errWrongPassword: "マスターパスワードが違います。",
      errEmptyPassword: "パスワードを入力してください。",
      errMigrationFailed: "既存データの移行に失敗しました。",
      errGeneric: "エラーが発生しました。",
      errPasswordTooShort: "マスターパスワードは 8 文字以上必要です。",
      strengthWeak: "弱い",
      strengthFair: "普通",
      strengthGood: "良い",
      strengthStrong: "強い",
      autoLockLabel: "自動ロック",
      autoLockNever: "なし",
      lockNowButton: "今すぐロック",
      settingsTitle: "設定",
      autoLockUnit: "分"
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
      setupKeyButton: "생성",
      unlockKeyButton: "잠금 해제",
      masterPasswordPlaceholder: "마스터 비밀번호를 입력하세요",
      confirmPasswordPlaceholder: "다시 입력하세요",
      setupTitle: "마스터 비밀번호 설정",
      setupHint: "최초 설정 — 마스터 비밀번호를 정하세요. 잠금 해제 시 매번 필요하며 복구할 수 없습니다.",
      unlockHint: "마스터 비밀번호를 입력하세요.",
      migrateHint: "암호화를 업그레이드 중입니다. 기존 마스터 비밀번호를 입력하면 더 강력한 암호로 다시 저장됩니다.",
      searchPlaceholder: "사이트 또는 사용자 이름 검색...",
      confirmDelete: "이 항목을 삭제하시겠습니까?",
      errPasswordMismatch: "두 비밀번호가 일치하지 않습니다.",
      errWrongPassword: "마스터 비밀번호가 올바르지 않습니다.",
      errEmptyPassword: "비밀번호를 입력하세요.",
      errMigrationFailed: "기존 데이터 마이그레이션에 실패했습니다.",
      errGeneric: "오류가 발생했습니다."
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
      setupKeyButton: "Créer",
      unlockKeyButton: "Déverrouiller",
      masterPasswordPlaceholder: "Saisissez votre mot de passe principal",
      confirmPasswordPlaceholder: "Confirmer le mot de passe",
      setupTitle: "Définir le mot de passe principal",
      setupHint: "Première configuration — choisissez un mot de passe principal. Il sera demandé à chaque déverrouillage et ne peut être récupéré.",
      unlockHint: "Saisissez votre mot de passe principal.",
      migrateHint: "Mise à niveau du chiffrement. Saisissez votre mot de passe actuel ; vos données seront rechiffrées avec un chiffrement plus fort.",
      searchPlaceholder: "Rechercher un site ou un nom d'utilisateur...",
      confirmDelete: "Supprimer cette entrée ?",
      errPasswordMismatch: "Les deux mots de passe ne correspondent pas.",
      errWrongPassword: "Mot de passe principal incorrect.",
      errEmptyPassword: "Veuillez saisir un mot de passe.",
      errMigrationFailed: "Échec de la migration des données existantes.",
      errGeneric: "Une erreur est survenue."
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
      setupKeyButton: "Buat",
      unlockKeyButton: "Buka kunci",
      masterPasswordPlaceholder: "Masukkan kata sandi utama",
      confirmPasswordPlaceholder: "Masukkan ulang",
      setupTitle: "Atur Kata Sandi Utama",
      setupHint: "Pengaturan pertama — pilih kata sandi utama. Anda akan membutuhkannya setiap kali membuka kunci dan tidak dapat dipulihkan.",
      unlockHint: "Masukkan kata sandi utama untuk membuka kunci.",
      migrateHint: "Memutakhirkan enkripsi. Masukkan kata sandi lama Anda; data akan dienkripsi ulang dengan kunci lebih kuat.",
      searchPlaceholder: "Cari situs atau nama pengguna...",
      confirmDelete: "Hapus entri ini?",
      errPasswordMismatch: "Kedua kata sandi tidak cocok.",
      errWrongPassword: "Kata sandi utama salah.",
      errEmptyPassword: "Masukkan kata sandi.",
      errMigrationFailed: "Gagal memigrasikan data yang ada.",
      errGeneric: "Terjadi kesalahan."
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
      setupKeyButton: "बनाएं",
      unlockKeyButton: "अनलॉक",
      masterPasswordPlaceholder: "मास्टर पासवर्ड दर्ज करें",
      confirmPasswordPlaceholder: "दोबारा दर्ज करें",
      setupTitle: "मास्टर पासवर्ड सेट करें",
      setupHint: "पहली बार सेटअप — एक मास्टर पासवर्ड चुनें। हर बार अनलॉक करने के लिए इसकी आवश्यकता होगी और इसे पुनः प्राप्त नहीं किया जा सकता।",
      unlockHint: "अनलॉक करने के लिए मास्टर पासवर्ड दर्ज करें।",
      migrateHint: "एन्क्रिप्शन अपग्रेड हो रहा है। मौजूदा मास्टर पासवर्ड दर्ज करें; आपका डेटा मजबूत कुंजी से पुनः एन्क्रिप्ट किया जाएगा।",
      searchPlaceholder: "साइट या उपयोगकर्ता नाम खोजें...",
      confirmDelete: "इस प्रविष्टि को हटाएं?",
      errPasswordMismatch: "दोनों पासवर्ड मेल नहीं खाते।",
      errWrongPassword: "मास्टर पासवर्ड गलत है।",
      errEmptyPassword: "कृपया पासवर्ड दर्ज करें।",
      errMigrationFailed: "मौजूदा डेटा माइग्रेट करने में विफल।",
      errGeneric: "कुछ गलत हुआ।"
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
      setupKeyButton: "Tạo",
      unlockKeyButton: "Mở khóa",
      masterPasswordPlaceholder: "Nhập mật khẩu chủ",
      confirmPasswordPlaceholder: "Nhập lại",
      setupTitle: "Đặt mật khẩu chủ",
      setupHint: "Thiết lập lần đầu — hãy chọn mật khẩu chủ. Mỗi lần mở khóa đều cần đến nó và không thể khôi phục.",
      unlockHint: "Nhập mật khẩu chủ để mở khóa.",
      migrateHint: "Đang nâng cấp mã hóa. Nhập mật khẩu chủ hiện tại; dữ liệu sẽ được mã hóa lại bằng khóa mạnh hơn.",
      searchPlaceholder: "Tìm trang web hoặc tên người dùng...",
      confirmDelete: "Xóa mục này?",
      errPasswordMismatch: "Hai mật khẩu không khớp.",
      errWrongPassword: "Mật khẩu chủ không đúng.",
      errEmptyPassword: "Vui lòng nhập mật khẩu.",
      errMigrationFailed: "Không thể chuyển đổi dữ liệu cũ.",
      errGeneric: "Đã xảy ra lỗi."
    }
  };

  const passwordList = document.getElementById('password-list');
  const languageSelect = document.getElementById('language-select');
  const popupTitle = document.getElementById('popup-title');
  const exportButton = document.getElementById('export-button');
  const exportButtonText = exportButton.querySelector('.button-text');
  const masterPasswordTitle = document.getElementById('master-password-title');
  const masterPasswordHint = document.getElementById('master-password-hint');
  const masterPasswordInput = document.getElementById('master-password-input');
  const masterPasswordConfirm = document.getElementById('master-password-confirm');
  const masterPasswordConfirmRow = document.querySelector('.master-password-confirm-row');
  const masterPasswordError = document.getElementById('master-password-error');
  const saveMasterPasswordButton = document.getElementById('save-master-password');
  const saveMasterPasswordButtonText = saveMasterPasswordButton.querySelector('.button-text');
  const masterPasswordSection = document.querySelector('.master-password-section');
  const searchInput = document.getElementById('search-input');
  const searchBar = document.querySelector('.search-bar');
  const strengthBox = document.getElementById('master-password-strength');
  const strengthLabel = strengthBox.querySelector('.strength-label');
  const settingsButton = document.getElementById('settings-button');
  const settingsPanel = document.getElementById('settings-panel');
  const autoLockSelect = document.getElementById('auto-lock-select');
  const autoLockLabel = document.getElementById('auto-lock-label');
  const lockNowButton = document.getElementById('lock-now-button');

  const MIN_MASTER_PASSWORD_LENGTH = 8;

  let currentLang = 'en';
  let searchQuery = '';
  let vaultState = 'unlock'; // 'setup' | 'migrate' | 'unlock'

  const tr = () => ({ ...translations.en, ...translations[currentLang] });

  function sendBg(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          resolve({ status: 'error', message: chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  function showError(text) {
    masterPasswordError.textContent = text;
    masterPasswordError.style.display = text ? 'block' : 'none';
  }

  function applyTranslations(lang) {
    const t = { ...translations.en, ...translations[lang] };
    popupTitle.textContent = t.popupTitle;
    exportButtonText.textContent = t.exportButton;
    languageSelect.title = t.languageTitle;
    masterPasswordTitle.textContent = t.masterPasswordTitle;
    masterPasswordInput.placeholder = t.masterPasswordPlaceholder;
    masterPasswordConfirm.placeholder = t.confirmPasswordPlaceholder;
    searchInput.placeholder = t.searchPlaceholder;
    settingsButton.title = t.settingsTitle;
    autoLockLabel.textContent = t.autoLockLabel;
    lockNowButton.textContent = t.lockNowButton;
    Array.from(autoLockSelect.options).forEach((opt) => {
      const v = parseInt(opt.value, 10);
      opt.textContent = v === 0 ? t.autoLockNever : `${v} ${t.autoLockUnit}`;
    });
    currentLang = lang;
    refreshVaultUI();
  }

  // Tier the score by character variety + length. Anything < 8 chars stays "weak"
  // — the actual block on submit also enforces the min length.
  function scorePasswordStrength(pwd) {
    if (!pwd) return { tier: '', label: '' };
    const t = tr();
    const len = pwd.length;
    let classes = 0;
    if (/[a-z]/.test(pwd)) classes++;
    if (/[A-Z]/.test(pwd)) classes++;
    if (/[0-9]/.test(pwd)) classes++;
    if (/[^A-Za-z0-9]/.test(pwd)) classes++;
    let score = 0;
    if (len >= 8) score++;
    if (len >= 12) score++;
    if (len >= 16) score++;
    score += Math.max(0, classes - 1);
    if (len < 8) return { tier: 'weak', label: t.strengthWeak };
    if (score <= 2) return { tier: 'weak', label: t.strengthWeak };
    if (score === 3) return { tier: 'fair', label: t.strengthFair };
    if (score === 4) return { tier: 'good', label: t.strengthGood };
    return { tier: 'strong', label: t.strengthStrong };
  }

  function updateStrengthMeter() {
    if (vaultState !== 'setup' || masterPasswordSection.style.display === 'none') {
      strengthBox.style.display = 'none';
      return;
    }
    const pwd = masterPasswordInput.value;
    if (!pwd) { strengthBox.style.display = 'none'; return; }
    const { tier, label } = scorePasswordStrength(pwd);
    strengthBox.className = 'mp-strength ' + tier;
    strengthBox.style.display = 'flex';
    strengthLabel.textContent = label;
  }

  function renderMasterPasswordSection(state) {
    const t = tr();
    showError('');
    masterPasswordInput.value = '';
    masterPasswordConfirm.value = '';
    strengthBox.style.display = 'none';

    if (state === 'setup') {
      masterPasswordTitle.textContent = t.setupTitle;
      masterPasswordHint.textContent = t.setupHint;
      masterPasswordHint.className = 'mp-hint';
      saveMasterPasswordButtonText.textContent = t.setupKeyButton;
      masterPasswordConfirmRow.style.display = 'block';
    } else if (state === 'migrate') {
      masterPasswordTitle.textContent = t.masterPasswordTitle;
      masterPasswordHint.textContent = t.migrateHint;
      masterPasswordHint.className = 'mp-hint warn';
      saveMasterPasswordButtonText.textContent = t.unlockKeyButton;
      masterPasswordConfirmRow.style.display = 'none';
    } else {
      masterPasswordTitle.textContent = t.masterPasswordTitle;
      masterPasswordHint.textContent = t.unlockHint;
      masterPasswordHint.className = 'mp-hint';
      saveMasterPasswordButtonText.textContent = t.unlockKeyButton;
      masterPasswordConfirmRow.style.display = 'none';
    }
  }

  function refreshVaultUI() {
    const t = tr();
    sendBg({ type: 'GET_VAULT_STATE' }).then((res) => {
      if (!res || res.status !== 'success') {
        masterPasswordSection.style.display = 'block';
        searchBar.style.display = 'none';
        passwordList.innerHTML = `<li style="text-align:center;justify-content:center;">${t.errGeneric}</li>`;
        return;
      }
      vaultState = res.state;

      if (res.unlocked) {
        masterPasswordSection.style.display = 'none';
        passwordList.style.display = 'block';
        searchBar.style.display = 'flex';
        renderPasswords();
      } else {
        masterPasswordSection.style.display = 'block';
        searchBar.style.display = 'none';
        passwordList.innerHTML = `<li style="text-align:center;justify-content:center;">${t.unlockPrompt}</li>`;
        passwordList.style.display = 'block';
        renderMasterPasswordSection(vaultState);
      }
    });
  }

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
      delete credentials.__meta__;

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

  function codeToMessage(code) {
    const t = tr();
    switch (code) {
      case 'EMPTY_PASSWORD': return t.errEmptyPassword;
      case 'PASSWORD_MISMATCH': return t.errPasswordMismatch;
      case 'WRONG_PASSWORD': return t.errWrongPassword;
      case 'MIGRATION_DECRYPT_FAILED': return t.errMigrationFailed;
      default: return t.errGeneric;
    }
  }

  async function submitMasterPassword() {
    const t = tr();
    showError('');
    const pwd = masterPasswordInput.value;
    if (!pwd) { showError(t.errEmptyPassword); return; }

    let res;
    if (vaultState === 'setup') {
      if (pwd.length < MIN_MASTER_PASSWORD_LENGTH) {
        showError(t.errPasswordTooShort);
        return;
      }
      const confirmPwd = masterPasswordConfirm.value;
      if (pwd !== confirmPwd) { showError(t.errPasswordMismatch); return; }
      res = await sendBg({ type: 'SETUP_VAULT', payload: { masterPassword: pwd, confirmPassword: confirmPwd } });
    } else {
      res = await sendBg({ type: 'UNLOCK_REQUEST', payload: { masterPassword: pwd } });
    }

    if (res && res.status === 'success') {
      masterPasswordInput.value = '';
      masterPasswordConfirm.value = '';
      refreshVaultUI();
    } else {
      const code = res && res.code;
      const fallback = (res && res.message) || t.errGeneric;
      showError(code ? codeToMessage(code) : fallback);
    }
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

    saveMasterPasswordButton.addEventListener('click', submitMasterPassword);

    masterPasswordInput.addEventListener('input', updateStrengthMeter);

    masterPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (vaultState === 'setup') masterPasswordConfirm.focus();
        else submitMasterPassword();
      }
    });
    masterPasswordConfirm.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); submitMasterPassword(); }
    });

    settingsButton.addEventListener('click', async () => {
      const open = settingsPanel.style.display !== 'none';
      if (open) {
        settingsPanel.style.display = 'none';
        return;
      }
      const res = await sendBg({ type: 'GET_SETTINGS' });
      const minutes = (res && res.settings && typeof res.settings.autoLockMinutes === 'number')
        ? res.settings.autoLockMinutes : 15;
      autoLockSelect.value = String(minutes);
      settingsPanel.style.display = 'block';
    });

    autoLockSelect.addEventListener('change', async () => {
      const minutes = parseInt(autoLockSelect.value, 10);
      await sendBg({ type: 'SET_SETTINGS', payload: { autoLockMinutes: minutes } });
    });

    lockNowButton.addEventListener('click', async () => {
      await sendBg({ type: 'LOCK' });
      settingsPanel.style.display = 'none';
      refreshVaultUI();
    });

    exportButton.addEventListener('click', () => {
      const t = tr();
      chrome.storage.local.get(null, (items) => {
        const credentials = { ...items };
        delete credentials.userLanguage;
        delete credentials.__meta__;
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
