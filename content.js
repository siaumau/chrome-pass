// 监听来自 background.js 或 popup.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILL_CREDENTIALS') {
    const { username, password } = request.payload;

    // 这是一个简化的选择器，可能需要根据实际网站进行调整
    // 寻找 type="password" 的输入框
    const passwordInput = document.querySelector('input[type="password"]');
    if (passwordInput) {
      // 假设密码框所在的表单是登录表单
      const form = passwordInput.closest('form');
      if (form) {
        // 在表单内寻找用户名输入框 (email, text, 等)
        const usernameInput = form.querySelector('input[type="email"], input[type="text"], input[type="tel"]');
        if (usernameInput) {
          usernameInput.value = username;
          passwordInput.value = password;
          console.log('凭据已填充。');
          sendResponse({ status: 'success' });
        } else {
          console.log('未能在表单中找到用户名输入框。');
          sendResponse({ status: 'error', message: '未找到用户名输入框' });
        }
      } else {
        console.log('未找到密码框所在的表单。');
        sendResponse({ status: 'error', message: '未找到登录表单' });
      }
    } else {
      console.log('未在页面上找到密码输入框。');
      sendResponse({ status: 'error', message: '未找到密码输入框' });
    }
  }
  
  // 保持消息通道开放以进行异步响应
  return true;
});

// 监听表单提交以保存凭据
document.addEventListener('submit', (e) => {
  const form = e.target;
  const passwordInput = form.querySelector('input[type="password"]');

  // 必须有密码字段，并且有值
  if (!passwordInput || !passwordInput.value) {
    return;
  }

  const textInputs = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]'));
  
  // 过滤掉可能是验证码的输入框
  const verificationKeywords = ['code', 'otp', 'captcha', 'verify'];
  const potentialUserInputs = textInputs.filter(input => {
    // 排除密码字段本身（如果它的type是text）
    if (input === passwordInput) return false;
    
    // 检查常见属性
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const autocomplete = (input.autocomplete || '').toLowerCase();

    if (autocomplete === 'one-time-code') return false;
    
    return !verificationKeywords.some(keyword => name.includes(keyword) || id.includes(keyword));
  });

  let usernameInput;
  // 如果过滤后只剩一个，那么它很可能就是用户名字段
  if (potentialUserInputs.length === 1) {
    usernameInput = potentialUserInputs[0];
  } else if (potentialUserInputs.length > 1) {
    // 如果有多个，这是一个更复杂的场景。作为一个简单的备用方案，
    // 我们可以选择第一个非空的输入框。
    usernameInput = potentialUserInputs.find(input => input.value);
  }

  if (usernameInput && usernameInput.value) {
    // 发现登录行为，发送消息到 background script
    chrome.runtime.sendMessage({
      type: 'SAVE_CREDENTIALS',
      payload: {
        url: window.location.hostname, // 使用 hostname 作为 key
        username: usernameInput.value,
        password: passwordInput.value
      }
    });
  }
}, true); // 使用捕获阶段以确保在页面自己的脚本之前运行
