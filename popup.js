document.addEventListener('DOMContentLoaded', () => {
  const passwordList = document.getElementById('password-list');

  // 从 Chrome Storage 加载并显示密码
  chrome.storage.local.get(null, (items) => {
    // items 是一个包含所有已保存数据的对象
    passwordList.innerHTML = ''; // 清空列表
    if (Object.keys(items).length === 0) {
      const li = document.createElement('li');
      li.textContent = '尚未保存任何密码。';
      li.style.textAlign = 'center';
      passwordList.appendChild(li);
      return;
    }

    for (const key in items) {
      if (items.hasOwnProperty(key)) {
        const credential = items[key];
        const listItem = document.createElement('li');

        const infoDiv = document.createElement('div');
        infoDiv.className = 'credential-info';

        const urlSpan = document.createElement('span');
        urlSpan.className = 'url';
        urlSpan.textContent = key; // key 是网站的 URL
        infoDiv.appendChild(urlSpan);

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = `用户名: ${credential.username}`;
        infoDiv.appendChild(usernameSpan);
        
        listItem.appendChild(infoDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'actions';

        const fillButton = document.createElement('button');
        fillButton.textContent = '填充';
        fillButton.dataset.url = key;
        fillButton.addEventListener('click', (e) => {
          const url = e.target.dataset.url;
          // 向 background.js 发送填充请求
          chrome.runtime.sendMessage({
            type: 'FILL_REQUEST',
            payload: { url }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('填充请求失败:', chrome.runtime.lastError.message);
            } else if (response && response.status === 'success') {
              console.log('凭据填充成功。');
              window.close(); // 成功后关闭弹出窗口
            } else {
              console.error('填充失败:', response?.message);
            }
          });
        });
        actionsDiv.appendChild(fillButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.className = 'delete';
        deleteButton.dataset.url = key;
        deleteButton.addEventListener('click', (e) => {
          const url = e.target.dataset.url;
          // 从 storage 中删除
          chrome.storage.local.remove(url, () => {
            console.log(`${url} 的凭据已被删除`);
            // 从界面上移除该项
            e.target.closest('li').remove();
          });
        });
        actionsDiv.appendChild(deleteButton);

        listItem.appendChild(actionsDiv);
        passwordList.appendChild(listItem);
      }
    }
  });

  const exportButton = document.getElementById('export-button');
  exportButton.addEventListener('click', () => {
    chrome.storage.local.get(null, (items) => {
      if (Object.keys(items).length === 0) {
        alert('没有密码可以汇出。');
        return;
      }
      const dataStr = JSON.stringify(items, null, 2);
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
});
