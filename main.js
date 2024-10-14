const { app, BrowserWindow, Menu } = require('electron');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,  // ウィンドウフレームを非表示に
        transparent: true,  // ウィンドウを透明にする
        alwaysOnTop: true,  // ウィンドウを常に最前面に表示
        webPreferences: {
            nodeIntegration: false,  // セキュリティ向上のため無効化
            contextIsolation: true,  // セキュリティ向上のため有効化
        }
    });

    // メニューバーを削除
    Menu.setApplicationMenu(null);

    // YouTubeのページをロード
    win.loadURL('https://www.youtube.com');

    // YouTubeページが読み込まれた後にスタイルとシアターモードを適用
    win.webContents.on('did-finish-load', () => {
        // CSSでスクロールバーを非表示にし、動画の横幅を100%にする
        win.webContents.insertCSS(`
            /* スクロールバーを非表示に */
            ::-webkit-scrollbar {
                width: 0px;  /* 横スクロールバーの幅を0に */
                height: 0px; /* 縦スクロールバーの幅を0に */
            }

            /* ページ全体のスクロールは可能にするがスクロールバーは非表示 */
            html,body {
                overflow: scroll !important;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* Internet Explorer 10+ */
            }
            html::-webkit-scrollbar, body::-webkit-scrollbar {
                display: none;
            }
            ytd-watch-flexy[full-bleed-player] #full-bleed-container.ytd-watch-flexy {
                max-height: none !important;
                min-height: auto !important;
            }
            /* 動画部分のスタイルを調整 */
            #movie_player {
                width: 100% !important;
            }

            /* 動画コンテナの幅を100%に設定 */
            .html5-video-container {
                width: 100% !important;
            }

            /* 動画自体も幅100%に設定 */
            video {
                left: 0 !important;
                width: 100% !important;
                height: auto !important;
            }

            /* ドラッグエリアのスタイル */
            #container #start, #container #center {
                position: relative;
            }
            #container #start::before, #container #center::before {
                background-color: #1f1f1f;
                -webkit-app-region: drag;
                position: absolute;
                content: "";
                top: 50%;
                left: calc(100% + 10px);
                transform: translateY(-50%);
                width: 40px;
                height: 40px;
                z-index: 10000;
            }
        `);

        // YouTubeのプレイヤーをシアターモードに自動で切り替える
        win.webContents.executeJavaScript(`
            document.addEventListener('DOMContentLoaded', function() {
                const theaterButton = document.querySelector('.ytp-size-button');
                const isTheaterMode = document.querySelector('.ytp-theater-mode');

                if (!isTheaterMode && theaterButton) {
                    theaterButton.click();  // シアターモードに切り替え
                }
            });
        `);
    });

    // ウィンドウが閉じられたときの処理
    win.on('closed', () => {
        win = null;
    });
}

// アプリ起動時の処理
app.on('ready', createWindow);

// すべてのウィンドウが閉じられたらアプリを終了
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 再度ウィンドウがアクティブになった場合の処理（macOS向け）
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
