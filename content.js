// 监听来自 background.js 或 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILL_CREDENTIALS') {
    const { username, password } = request.payload;

    // 这是一个简化的选择器，可能需要根据实际网站进行调整
    // 寻找 type="password" 的输入框
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      let usernameInput = null;
      let container = passwordInput.closest('form'); // Try to find a form first

      if (!container) {
        // If not in a form, try to find a common parent div that might contain both username and password
        // Iterate up to a few parent elements to find a suitable container
        let currentElement = passwordInput.parentElement;
        for (let i = 0; i < 5 && currentElement; i++) { // Check up to 5 levels up
          const tempUsernameInput = currentElement.querySelector('input[type="email"], input[type="text"], input[type="tel"]');
          if (tempUsernameInput) {
            container = currentElement;
            usernameInput = tempUsernameInput;
            break;
          }
          currentElement = currentElement.parentElement;
        }
      } else {
        // If a form is found, find username input within that form
        usernameInput = container.querySelector('input[type="email"], input[type="text"], input[type="tel"]');
      }

      if (usernameInput) {
        usernameInput.value = username;
        passwordInput.value = password;
        console.log('凭据已填充。');
        sendResponse({ status: 'success' });
      } else {
        console.log('未能在页面上找到用户名输入框。');
        sendResponse({ status: 'error', message: '未找到用户名输入框' });
      }
    } else {
      console.log('未在页面上找到密码输入框。');
      sendResponse({ status: 'error', message: '未找到密码输入框' });
    }
  }
  
  // 保持消息通道开放以进行异步响应
  return true;
});

function findCredentialsAndSave(container) {
  if (!container) return;

  const passwordInput = container.querySelector('input[type="password"]');
  if (!passwordInput || !passwordInput.value) {
    return;
  }

  const textInputs = Array.from(container.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]'));
  
  const verificationKeywords = ['code', 'otp', 'captcha', 'verify'];
  const potentialUserInputs = textInputs.filter(input => {
    if (input === passwordInput) return false;
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const autocomplete = (input.autocomplete || '').toLowerCase();

    if (autocomplete === 'one-time-code') return false;
    
    return !verificationKeywords.some(keyword => name.includes(keyword) || id.includes(keyword));
  });

  let usernameInput;
  if (potentialUserInputs.length === 1) {
    usernameInput = potentialUserInputs[0];
  } else if (potentialUserInputs.length > 1) {
    usernameInput = potentialUserInputs.find(input => input.value);
  }

  if (usernameInput && usernameInput.value) {
    // Check if the extension context is still valid before sending a message
    if (chrome.runtime && chrome.runtime.id) {
      chrome.runtime.sendMessage({
        type: 'SAVE_CREDENTIALS',
        payload: {
          url: window.location.hostname,
          username: usernameInput.value,
          password: passwordInput.value
        }
      });
    } else {
      console.warn("Content script: Extension context invalidated, cannot send SAVE_CREDENTIALS message.");
    }
  }
}

// 监听表单提交以保存凭据
document.addEventListener('submit', (e) => {
  findCredentialsAndSave(e.target);
}, true);

// 监听点击事件，以捕捉由JS处理的登录
document.addEventListener('click', (e) => {
    const target = e.target;
    // Basic check if the clicked element could be a login button
    const isLoginButton = (
        (target.tagName === 'BUTTON' && (target.type === 'submit' || target.type === 'button')) ||
        (target.tagName === 'INPUT' && (target.type === 'submit' || target.type === 'button'))
    ) && (target.innerText.includes('登录') || target.value.includes('登录') || target.innerText.includes('Sign in'));

    if (isLoginButton) {
        // Find the closest form or a common ancestor div
        const form = target.closest('form');
        if (form) {
          // If it's inside a form, the 'submit' event should handle it.
          // We can still try to find credentials here as a fallback.
          setTimeout(() => findCredentialsAndSave(form), 100);
        } else {
            // If not in a form, find a reasonable ancestor container
            let ancestor = target.parentElement;
            for (let i = 0; i < 5; i++) { // Check up to 5 levels up
                if (ancestor && ancestor.querySelector('input[type="password"]')) {
                    findCredentialsAndSave(ancestor);
                    return;
                }
                if (ancestor) ancestor = ancestor.parentElement;
            }
        }
    }
}, true);
