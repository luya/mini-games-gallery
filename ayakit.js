var AyaKits = AyaKits || {};


// 核心偵測：判斷是否為行動裝置/觸控螢幕
AyaKits.detectTouchDevice = function()  {
    return ('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0) || 
            (navigator.msMaxTouchPoints > 0);
}