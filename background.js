// 监听来自 popup.js 和 content.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FILL_REQUEST') {
    const { url } = request.payload;

    // 1. 从 storage 获取凭据
    chrome.storage.local.get(url, (result) => {
      if (result[url]) {
        const { username, password } = result[url];

        // 2. 获取当前活动的标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            
            // 3. 向 content.js 发送填充消息
            chrome.tabs.sendMessage(
              tabId,
              {
                type: 'FILL_CREDENTIALS',
                payload: { username, password }
              },
              (response) => {
                if (chrome.runtime.lastError) {
                  // 如果 content script 没有准备好，可能会发生错误
                  console.error('发送消息失败:', chrome.runtime.lastError.message);
                  sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
                } else {
                  console.log('收到来自 content script 的响应:', response);
                  sendResponse(response);
                }
              }
            );
          } else {
            console.error('找不到活动的标签页。');
            sendResponse({ status: 'error', message: '找不到活动的标签页' });
          }
        });
      } else {
        console.error(`在 storage 中找不到 ${url} 的凭据。`);
        sendResponse({ status: 'error', message: '找不到凭据' });
      }
    });

    // 返回 true 表示我们将异步发送响应
    return true;
  } else if (request.type === 'SAVE_CREDENTIALS') {
    const { url, username, password } = request.payload;
    const data = { [url]: { username, password } };
    
    // 保存到 chrome.storage
    chrome.storage.local.set(data, () => {
      console.log(`凭据已为 ${url} 保存。`);
      // 可以选择发送一个桌面通知来提示用户
      // chrome.notifications.create(...)
    });
  }
});
