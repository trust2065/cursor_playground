# macOS 瀏覽器自動分流設定：從 Chrome 強制以 Brave 開啟 YouTube 連結

## 系統架構

-   **系統層級路由：** [Finicky](https://github.com/johnste/finicky)
-   **瀏覽器端攔截：** Tampermonkey (Chrome 擴充功能)

---

## Step 1: 安裝與設定 Finicky

1.  使用 Homebrew 安裝 Finicky：
    ```bash
    brew install --cask finicky
    ```

2.  建立並編輯 Finicky 設定檔：
    ```bash
    touch ~/.finicky.js
    ```

3.  將以下配置寫入 `~/.finicky.js`：

    ```javascript
    module.exports = {
      defaultBrowser: "Google Chrome",

      rewrite: [
        {
          // 1. 攔截所有透過 finicky:// 傳進來的請求
          // 2. 使用 Regex 把 "finicky://https?//+" 替換回標準的 "https://"
          match: /^finicky:\/\/https?\/+/,
          url: ({ urlString }) => {
            return urlString.replace(/^finicky:\/\/https?\/+/, "https://");
          }
        }
      ],

      handlers: [
        {
          // 當網址被 rewrite 還原後，這裡的 match 就能正確抓到 youtube
          match: [
            "*.youtube.com/*",
            "youtu.be/*",
            "youtube.com/*"
          ],
          browser: "Brave Browser"
        }
      ]
    };
    ```

## Step 2: 更改 macOS 預設瀏覽器

1.  前往 **系統設定 (System Settings)** > **桌面與 Dock (Desktop & Dock)**。
2.  將 **預設網頁瀏覽器 (Default web browser)** 更改為 **Finicky**。

## Step 3: 設定 Chrome 端的 Tampermonkey 攔截腳本

由於 Chrome 預設會在應用程式內直接開啟連結（不經過 macOS 系統路由），需透過腳本強制將 YouTube 連結拋給系統處理。

1.  在 Chrome 中安裝 Tampermonkey 擴充功能。
2.  新增腳本，貼上以下程式碼並儲存 (**Cmd + S**)：

    ```javascript
    // ==UserScript==
    // @name        Kick YT to System (Finicky Protocol)
    // @match       https://gemini.google.com/*
    // @grant       none
    // ==/UserScript==

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (a && /youtube\.com|youtu\.be/.test(a.href)) {
            // 阻止 Chrome 的預設開啟行為
            e.preventDefault();

            let targetUrl = a.href;

            // 處理 Google 重新導向網址 (如適用)
            if (targetUrl.includes('google.com/url')) {
                const urlParams = new URLSearchParams(new URL(targetUrl).search);
                targetUrl = urlParams.get('url') || targetUrl;
            }

            // 移除原有的 :// 避免系統解析錯誤，並加上 finicky:// 呼叫系統預設路由
            const cleanUrl = targetUrl.replace('://', '//');
            const kickUrl = "finicky://" + cleanUrl;

            console.log('Kicking to Finicky:', kickUrl);
            window.location.assign(kickUrl);
        }
    }, true);
    ```

## Step 4: 測試驗證

1.  重新整理 Gemini 頁面。
2.  點擊任意 YouTube 連結。

**預期行為：** Chrome 不會開啟新分頁，而是直接喚醒 Brave Browser 並載入該影片。