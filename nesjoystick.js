
// 狀態資料結構 (這可以直接代入你的遊戲迴圈 Loop 中)
const gamepadState = {
    joystick: { active: false, x: 0, y: 0, dir: 'NONE' },
    buttonA: 0,
    buttonB: 0,
    select: 0,
    start: 0
};

// DOM 元素快取
const joyPanel = document.getElementById('touch-container');
const joyZone = document.getElementById('joystick-zone');
const joyBase = document.getElementById('joystick-base');
const joyStick = document.getElementById('joystick-stick');
const joydebug = document.getElementById('debug-panel');

if (!AyaKits.detectTouchDevice()) {
    joyPanel.style.display = "none";
    joydebug.style.display = "none";
}
if (document.title != "NES 網頁動態觸控搖桿測試") {
    joydebug.style.display = "none";
}

// 搖桿運算暫存變數
let joyTouchId = null;
let startX = 0;
let startY = 0;
const maxRadius = 50; // 搖桿移動的最大半徑(像素)
// console.log(joyZone);
// ------------------ 1. 左側不固定位置搖桿邏輯 ------------------
joyZone.addEventListener('touchstart', (e) => {
    // console.log('touchstart');
    // 如果已經有搖桿在被操控，忽略其他左側觸控
    if (joyTouchId !== null) return;

    // 取得第一個觸發的觸控點
    const touch = e.changedTouches[0];
    joyTouchId = touch.identifier;

    // 設定中心點為玩家點擊的位置
    startX = touch.clientX;
    startY = touch.clientY - 48;

    // 顯示搖桿外圈並定位
    joyBase.style.left = `${startX}px`;
    joyBase.style.top = `${startY}px`;
    joyBase.style.display = 'block';

    gamepadState.joystick.active = true;
    updateUI();
});

joyZone.addEventListener('touchmove', (e) => {
    if (joyTouchId === null) return;

    // 找到對應原觸控 ID 的點
    let touch = null;
    for (let t of e.touches) {
        if (t.identifier === joyTouchId) {
            touch = t;
            break;
        }
    }
    if (!touch) return;

    // 計算手指距離中心的位移
    let deltaX = touch.clientX - startX;
    let deltaY = touch.clientY - 48 - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // 限制內圈不能超出最大半徑
    if (distance > maxRadius) {
        const angle = Math.atan2(deltaY, deltaX);
        deltaX = Math.cos(angle) * maxRadius;
        deltaY = Math.sin(angle) * maxRadius;
    }

    // 更新內圈的視覺位置 (CSS 偏移)
    joyStick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

    // 正規化數值 (-1.0 到 1.0 之間)
    gamepadState.joystick.x = parseFloat((deltaX / maxRadius).toFixed(2));
    gamepadState.joystick.y = parseFloat((deltaY / maxRadius).toFixed(2));

    // 判斷紅白機 4/8 方向十字鍵
    gamepadState.joystick.dir = calculateDirection(gamepadState.joystick.x, gamepadState.joystick.y);

    updateUI();
});

// 結束觸控
const endJoystick = (e) => {
    if (joyTouchId === null) return;

    // 檢查釋放的是否為搖桿的觸控點
    for (let t of e.changedTouches) {
        if (t.identifier === joyTouchId) {
            joyTouchId = null;
            joyBase.style.display = 'none';
            joyStick.style.transform = 'translate(-50%, -50%)'; // 歸位

            gamepadState.joystick.active = false;
            gamepadState.joystick.x = 0;
            gamepadState.joystick.y = 0;
            gamepadState.joystick.dir = 'NONE';

            updateUI();
            break;
        }
    }
};

joyZone.addEventListener('touchend', endJoystick);
joyZone.addEventListener('touchcancel', endJoystick);
// ------------------ 2. 右側與中央常規按鈕邏輯 ------------------
bindButton('btn-a', 'buttonA');
bindButton('btn-b', 'buttonB');
bindButton('btn-select', 'select');
bindButton('btn-start', 'start');
// ------------------ 3. 數據面板 UI 更新 ------------------
const valJoyStatus = document.getElementById('val-joy-status');
const valJoyVector = document.getElementById('val-joy-vector');
const valJoyDir = document.getElementById('val-joy-dir');
const valBtnA = document.getElementById('val-btn-a');
const valBtnB = document.getElementById('val-btn-b');
const valBtnSel = document.getElementById('val-btn-select');
const valBtnSta = document.getElementById('val-btn-start');

// ------------------ 函式庫 ------------------
// 依據 X, Y 向量推算十字鍵方向
function calculateDirection(x, y) {
    const threshold = 0.3; // 靈敏度門檻
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) return 'NONE';

    const angle = Math.atan2(y, x) * (180 / Math.PI); // 轉為角度 -180 ~ 180

    if (angle >= -22.5 && angle < 22.5) return 'RIGHT';
    if (angle >= 22.5 && angle < 67.5) return 'DOWN_RIGHT';
    if (angle >= 67.5 && angle < 112.5) return 'DOWN';
    if (angle >= 112.5 && angle < 157.5) return 'DOWN_LEFT';
    if (angle >= 157.5 || angle < -157.5) return 'LEFT';
    if (angle >= -157.5 && angle < -112.5) return 'UP_LEFT';
    if (angle >= -112.5 && angle < -67.5) return 'UP';
    if (angle >= -67.5 && angle < -22.5) return 'UP_RIGHT';

    return 'NONE';
}
// 使用多點觸控通用綁定，確保多鍵齊發不會衝突
function bindButton(elementId, stateKey) {
    const btn = document.getElementById(elementId);

    const press = (e) => {
        e.preventDefault(); // 防止手機瀏覽器放大或模擬點擊
        gamepadState[stateKey] = 1;
        btn.classList.add('active');
        triggerVibrate();
        updateUI();
    };

    const release = (e) => {
        e.preventDefault();
        gamepadState[stateKey] = 0;
        btn.classList.remove('active');
        updateUI();
    };

    btn.addEventListener('touchstart', press);
    btn.addEventListener('touchend', release);
    btn.addEventListener('touchcancel', release);
}

// 觸覺微震動回饋 (只在實機手機上有用)
function triggerVibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(12);
    }
}

function updateUI() {
    if (gamepadState.joystick.active) {
        valJoyStatus.textContent = "操控中";
        valJoyStatus.style.color = "#55ff55";
    } else {
        valJoyStatus.textContent = "放開";
        valJoyStatus.style.color = "#ff5555";
    }

    valJoyVector.textContent = `X: ${gamepadState.joystick.x.toFixed(2)}, Y: ${gamepadState.joystick.y.toFixed(2)}`;
    valJoyDir.textContent = gamepadState.joystick.dir;

    valBtnA.textContent = gamepadState.buttonA;
    valBtnA.style.color = gamepadState.buttonA ? '#ff5555' : '#fff';

    valBtnB.textContent = gamepadState.buttonB;
    valBtnB.style.color = gamepadState.buttonB ? '#ff5555' : '#fff';

    valBtnSel.textContent = gamepadState.select;
    valBtnSel.style.color = gamepadState.select ? '#ff5555' : '#fff';

    valBtnSta.textContent = gamepadState.start;
    valBtnSta.style.color = gamepadState.start ? '#ff5555' : '#fff';
}