var AyaKits = AyaKits || {};


// 核心偵測：判斷是否為行動裝置/觸控螢幕
AyaKits.detectTouchDevice = function () {
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
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