var AyaKits = AyaKits || {};


AyaKits.SecureRandom = function () {
  // 建立一個存放 32 位元無符號整數（0 ~ 4,294,967,295）的陣列
  const array = new Uint32Array(1);
  
  // 用作業系統的熵源填滿隨機數
  crypto.getRandomValues(array);
  
  // 除以最大可能值 (2^32)，換算成 0 ~ 1 之間的浮點數
  return array[0] / (0xFFFFFFFF + 1);
}
/**
 * 模擬擲骰子
 * @param {number|string} sides - 骰子的面數（例如：6 面骰、20 面骰）
 * @returns {number|null} 骰出來的點數（1 到 sides 之間的整數），若輸入無效則傳回 null
 */
AyaKits.rollDice = function (sides) {
    // 防呆機制：將輸入轉換成整數
    const parsedSides = parseInt(sides, 10);

    // 確保輸入是有效的正整數
    if (isNaN(parsedSides) || parsedSides < 1) {
        console.error("請輸入大於或等於 1 的有效數字。");
        return null;
    }

    // 核心邏輯：Math.random() 產生 [0, 1) 的值
    // 乘以面數後得到 [0, sides) 的值
    // 用 Math.floor 捨去小數點後得到 0 到 sides - 1 的整數
    // 最後 + 1 補回偏移量，得到 1 到 sides 的整數
    return Math.floor(AyaKits.SecureRandom() * parsedSides) + 1;
}

/**
 * 請求指定 HTML 元素進入全螢幕模式（支援主流瀏覽器前綴）
 * @param {HTMLElement} element - 想要放大成全螢幕的 DOM 元素
 * @returns {void}
 */
AyaKits.launchFullScreen = function (element) {
    // 檢查並呼叫標準的全螢幕方法
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    // 支援舊版 Firefox 瀏覽器
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    // 支援舊版 Chrome, Safari 和 Opera 瀏覽器
    else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
    // 支援舊版 IE/Edge 瀏覽器
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

/**
 * 結束並退出全螢幕模式（支援主流瀏覽器前綴）
 * @returns {void}
 */
AyaKits.exitFullScreen = function () {
    // 檢查並呼叫標準的退出全螢幕方法
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
    // 支援舊版 Firefox 瀏覽器
    else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    }
    // 支援舊版 Chrome, Safari 和 Opera 瀏覽器
    else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
    // 支援舊版 IE/Edge 瀏覽器
    else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * 偵測當前執行環境是否為行動裝置或支援觸控螢幕的設備
 * @returns {boolean} 如果支援觸控則回傳 true，否則回傳 false
 */
AyaKits.detectTouchDevice = function () {
    // 1. 檢查 window 是否含有觸控事件物件
    // 2. 檢查現代瀏覽器的最大觸控點數是否大於 0
    // 3. 檢查舊版 IE/Edge 的最大觸控點數是否大於 0
    return ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0);
}

/**
 * 將遊戲狀態儲存至 localStorage 中
 * @param {Object} state - 要儲存的遊戲狀態物件
 * @param {string} [slotname="my_game_save_slot_1"] - 儲存存檔的 Key 值（存檔欄位名稱）
 * @returns {void}
 */
AyaKits.saveGame = function (state, slotname = "my_game_save_slot_1") {
    try {
        // 記錄本次存檔的時間戳記（1970年至今的毫秒數）
        state.lastSaved = Date.now();

        // 將儲存狀態物件序列化成 JSON 字串
        const jsonString = JSON.stringify(state);

        // 寫入瀏覽器的 localStorage 中
        localStorage.setItem(slotname, jsonString);
        // console.log("存檔成功！");
    } catch (error) {
        // 當儲存空間超過瀏覽器限制（通常為 5MB）時，會觸發 QuotaExceededError
        console.error("存檔失敗，空間可能不足：", error);
    }
}

/**
 * 深層合併兩個物件（Deep Merge）。
 * 使用 `structuredClone` 確保回傳全新獨立的物件，不會污染原始的 target 或 source。
 * 
 * @function deepMerge
 * @memberof AyaKits
 * @param {Object} target - 基礎物件（目標物件）
 * @param {Object} source - 要合併進去的物件（來源物件）
 * @returns {Object} 合併後全新的深拷貝物件
 */
AyaKits.deepMerge = function (target, source) {
    // 建立一個深拷貝的 target 作為基礎，避免改動到原始傳入的 target 物件
    const output = structuredClone(target);

    // 確保 target 與 source 兩者皆為有效的純物件才執行合併
    if (AyaKits.isObject(target) && AyaKits.isObject(source)) {
        // 疊代 source 物件的所有屬性鍵名
        Object.keys(source).forEach(key => {
            // 檢查當前 source 的屬性值是否也為純物件
            if (AyaKits.isObject(source[key])) {
                // 如果 target 當中完全沒有這個屬性
                if (!(key in target)) {
                    // 直接將 source 的該物件屬性進行深拷貝並賦值給 output
                    output[key] = structuredClone(source[key]);
                } else {
                    // 如果兩邊都擁有該物件屬性，則遞迴呼叫 deepMerge 進行深層合併
                    output[key] = AyaKits.deepMerge(target[key], source[key]);
                }
            } else {
                // 如果是一般型別值（字串、數字、布林、或 null/undefined），則直接覆蓋基礎值
                output[key] = source[key];
            }
        });
    }
    
    // 回傳合併完成後的全新物件
    return output;
}

/**
 * 檢查傳入的變數是否為純物件（Plain Object）。
 * 排除掉 null、undefined 以及陣列（Array）。
 * 
 * @function isObject
 * @memberof AyaKits
 * @param {*} item - 欲檢查的任意變數
 * @returns {boolean} 若為純物件則回傳 true，否則回傳 false
 */
AyaKits.isObject = function (item) {
    // 1. item 必須存在（排除 null 與 undefined）
    // 2. typeof 必須為 'object'
    // 3. 排除 JavaScript 預設 typeof 也算 object 的陣列型別
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * 從 localStorage 載入遊戲狀態，並與預設狀態合併
 * @param {string} [slotname="my_game_save_slot_1"] - 讀取存檔的 Key 值（存檔欄位名稱）
 * @returns {Object} 載入成功回傳合併後的狀態物件，失敗或無存檔則回傳初始預設狀態
 */
AyaKits.loadGame = function (defaultGameState, slotname = "my_game_save_slot_1") {
    // 從 localStorage 取得 JSON 字串
    const jsonString = localStorage.getItem(slotname);

    // 如果找不到存檔，直接複製並回傳預設遊戲狀態
    if (!jsonString) {
        return defaultGameState;
    }

    try {
        // 將 JSON 字串解析回 JavaScript 物件
        const loadedState = JSON.parse(jsonString);

        // 將讀取的存檔與預設值進行合併（以讀取值為主覆蓋預設值）
        // 這樣可防止未來遊戲版本更新、增加新欄位時，舊存檔缺少新欄位而導致錯誤
        return AyaKits.deepMerge(defaultGameState, loadedState);
        // return { ...defaultGameState, ...loadedState };
    } catch (error) {
        // 解析 JSON 失敗時，代表存檔可能損毀，回傳預設狀態
        console.error("存檔損毀，無法讀取：", error);
        return defaultGameState;
    }
}

/**
 * 動態建立一個吐司通知（Toast Notification）並渲染到畫面上
 * @param {HTMLElement} toastC - 用來容納 Toast 的 DOM 容器元素
 * @param {string} message - 要顯示的訊息內容
 * @param {string} [type='success'] - 通知的類型（'success' | 'warn' | 'danger'）
 * @returns {void}
 */
AyaKits.createToast = function (toastC, message, type = 'success') {
    // 1. 動態建立 div 元素並加入基礎 CSS 類別名稱
    const toast = document.createElement('div');
    toast.className = `toast-item`;

    // 2. 根據不同通知類型，設定對應的 CSS 變數背景色與文字顏色
    if (type === 'success') {
        toast.style.backgroundColor = 'var(--success)';
    }
    if (type === 'warn') {
        toast.style.backgroundColor = 'var(--warning)';
        toast.style.color = '#000';
    }
    if (type === 'danger') {
        toast.style.backgroundColor = 'var(--danger)';
    }

    // 3. 組裝 Toast 內部的 HTML 結構（包含文字內容與 X 關閉按鈕）
    toast.innerHTML = `
        <span>${message}</span>
        <span class="toast-close">&times;</span>
    `;

    // 4. 將動態生成的 Toast 元素插入到外部傳入的容器中
    toastC.appendChild(toast);

    // 5. 自動銷毀邏輯：設定 3 秒（3000 毫秒）後自動執行 dismiss 退場
    const autoDismissTimer = setTimeout(() => {
        dismiss();
    }, 3000);

    // 6. 點擊右上角 "X" 按鈕時，可提前手動銷毀
    toast.querySelector('.toast-close').addEventListener('click', () => {
        // 清除自動銷毀的定時器，避免重複觸發退場邏輯
        clearTimeout(autoDismissTimer);
        dismiss();
    });

    /**
     * 執行 Toast 退場動畫，並在動畫結束後將其自 DOM 樹徹底移除
     */
    function dismiss() {
        // 套用 CSS 退場動畫（例如漸隱、滑出）
        toast.style.animation = 'toastOut 0.3s ease forwards';

        // 監聽動畫結束事件，確認退場動畫跑完後再從 DOM 樹中刪除該節點
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }
}