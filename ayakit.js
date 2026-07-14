var AyaKits = AyaKits || {};

AyaKits.launchFullScreen = function (element) {
    // 檢查並呼叫各瀏覽器支援的全螢幕方法
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari 和 Opera
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
    }
}

AyaKits.exitFullScreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari 和 Opera
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
    }
}

// 核心偵測：判斷是否為行動裝置/觸控螢幕
AyaKits.detectTouchDevice = function () {
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
}

AyaKits.saveGame = function (state, slotname = "my_game_save_slot_1") {
    try {
        state.lastSaved = Date.now(); // 記錄存檔時間
        const jsonString = JSON.stringify(state);
        localStorage.setItem(slotname, jsonString);
        console.log("存檔成功！");
    } catch (error) {
        // 如果超過 5MB，會觸發 QuotaExceededError
        console.error("存檔失敗，空間可能不足：", error);
    }
}

AyaKits.loadGame = function (slotname = "my_game_save_slot_1") {
    const jsonString = localStorage.getItem(slotname);
    if (!jsonString) {
        return { ...defaultGameState }; // 沒存檔就給初始值
    }
    try {
        const loadedState = JSON.parse(jsonString);
        // 建議與預設值合併，防止遊戲更新後，舊存檔缺少新欄位而報錯
        return { ...defaultGameState, ...loadedState };
    } catch (error) {
        console.error("存檔損毀，無法讀取：", error);
        return { ...defaultGameState };
    }
}


AyaKits.createToast = function (toastC, message, type = 'success') {
    // 1. 動態建立 div 元素
    const toast = document.createElement('div');
    toast.className = `toast-item`;

    // 2. 根據類型設定外觀色彩
    if (type === 'success') toast.style.backgroundColor = 'var(--success)';
    if (type === 'warn') { toast.style.backgroundColor = 'var(--warning)'; toast.style.color = '#000'; }
    if (type === 'danger') toast.style.backgroundColor = 'var(--danger)';

    // 3. 組裝內部文字與關閉按鈕
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close">&times;</span>
    `;

    // 4. 將 Toast 塞進全域容器中
    toastC.appendChild(toast);
    // log(`DOM 操作 | 創建 [${type.toUpperCase()}] 通知`, type);

    // 5. 自動銷毀邏輯 (3秒後自動消失)
    const autoDismissTimer = setTimeout(() => {
        dismiss();
    }, 3000);

    // 6. 點擊 X 提前手動銷毀
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoDismissTimer); // 清除定時器，避免重複執行
        dismiss();
    });

    // 銷毀用的封裝函式（加上退場動畫）
    function dismiss() {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        // 等退場動畫跑完後，再徹底從 DOM 樹移出元素
        toast.addEventListener('animationend', () => {
            toast.remove();
            // log('DOM 操作 | 通知生命週期結束，已重記憶體銷毀');
        });
    }
}