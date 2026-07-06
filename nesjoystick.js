class VirtualJoystick {
    constructor() {
        this.isTouchDevice = this.detectTouchDevice();
        
        // 搖桿公開狀態
        this.state = {
            active: false,
            x: 0,
            y: 0,
            dir: 'NONE'
        };

        this.touchId = null;
        this.startX = 0;
        this.startY = 0;
        this.maxRadius = 50; // 搖桿移動最大半徑

        // 只有非電腦（觸控裝置）才初始化搖桿
        if (this.isTouchDevice) {
            this.initDOM();
            this.bindEvents();
        }
    }

    // 核心偵測：判斷是否為行動裝置/觸控螢幕
    detectTouchDevice() {
        return ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0) || 
               (navigator.msMaxTouchPoints > 0);
    }

    // 動態產生搖桿需要的 HTML 與 CSS
    initDOM() {
        // 1. 建立感應左半邊的 Zone
        this.zone = document.createElement('div');
        this.zone.style.cssText = `
            position: absolute; left: 0; top: 0; width: 50%; height: 100%;
            z-index: 999; touch-action: none;
        `;

        // 2. 建立搖桿外圈
        this.base = document.createElement('div');
        this.base.style.cssText = `
            position: absolute; width: 100px; height: 100px;
            background: rgba(255, 255, 255, 0.2); border: 3px solid rgba(255, 255, 255, 0.5);
            border-radius: 50%; display: none; transform: translate(-50%, -50%);
            pointer-events: none;
        `;

        // 3. 建立搖桿內圈（搖桿頭）
        this.stick = document.createElement('div');
        this.stick.style.cssText = `
            position: absolute; left: 50%; top: 50%; width: 40px; height: 40px;
            background: rgba(255, 0, 0, 0.7); border-radius: 50%;
            transform: translate(-50%, -50%);
        `;

        // 組裝並塞入 body
        this.base.appendChild(this.stick);
        document.body.appendChild(this.zone);
        document.body.appendChild(this.base);
    }

    // 綁定觸控事件
    bindEvents() {
        this.zone.addEventListener('touchstart', (e) => {
            if (this.touchId !== null) return;

            const touch = e.changedTouches[0];
            this.touchId = touch.identifier;

            this.startX = touch.clientX;
            this.startY = touch.clientY;

            this.base.style.left = `${this.startX}px`;
            this.base.style.top = `${this.startY}px`;
            this.base.style.display = 'block';

            this.state.active = true;
        });

        this.zone.addEventListener('touchmove', (e) => {
            if (this.touchId === null) return;

            let touch = null;
            for (let t of e.touches) {
                if (t.identifier === this.touchId) { touch = t; break; }
            }
            if (!touch) return;

            let deltaX = touch.clientX - this.startX;
            let deltaY = touch.clientY - this.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            if (distance > this.maxRadius) {
                const angle = Math.atan2(deltaY, deltaX);
                deltaX = Math.cos(angle) * this.maxRadius;
                deltaY = Math.sin(angle) * this.maxRadius;
            }

            this.stick.style.transform = `translate(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px))`;

            this.state.x = parseFloat((deltaX / this.maxRadius).toFixed(2));
            this.state.y = parseFloat((deltaY / this.maxRadius).toFixed(2));
            this.state.dir = this.calculateDirection(this.state.x, this.state.y);
        });

        const endJoystick = (e) => {
            if (this.touchId === null) return;
            for (let t of e.changedTouches) {
                if (t.identifier === this.touchId) {
                    this.touchId = null;
                    this.base.style.display = 'none';
                    this.stick.style.transform = 'translate(-50%, -50%)';
                    
                    this.state.active = false;
                    this.state.x = 0;
                    this.state.y = 0;
                    this.state.dir = 'NONE';
                    break;
                }
            }
        };

        this.zone.addEventListener('touchend', endJoystick);
        this.zone.addEventListener('touchcancel', endJoystick);
    }

    calculateDirection(x, y) {
        const threshold = 0.4; // 稍微調高門檻，防止手機滑動太敏感
        if (Math.abs(x) < threshold && Math.abs(y) < threshold) return 'NONE';

        const angle = Math.atan2(y, x) * (180 / Math.PI);
        if (angle >= -45 && angle < 45) return 'RIGHT';
        if (angle >= 45 && angle < 135) return 'DOWN';
        if (angle >= 135 || angle < -135) return 'LEFT';
        if (angle >= -135 && angle < -45) return 'UP';
        return 'NONE';
    }

    // 對外開放獲取目前狀態的方法
    getState() {
        return this.state;
    }
}