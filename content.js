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
  const usernameInput = form.querySelector('input[type="email"], input[type="text"], input[type="tel"]');

  if (usernameInput && passwordInput && usernameInput.value && passwordInput.value) {
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
