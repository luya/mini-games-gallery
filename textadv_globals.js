//Naming Space
var AyaGlobals = AyaGlobals || {};
// Constants 🔓⚒️⚖️⛓️🔗⚔️🛡️⭐☀️🌙
AyaGlobals.ITEM_DATA = {
    ALYS: {
        name: "艾莉絲 👩🏻‍🦳", desc: "艾莉絲：『快點思考下一步吧，看著我沒有意義。』",
        power: 1, knowledge: 2, charm: 3, lock_picking: 7, creativity: 5,
        atk: 7, def: 7, logic: 3, deduction: 3, concentration: 3,
    },

    SWORD: { name: "冒險長劍 🗡️", desc: "冒險者常用的防身武器，需要有耐心的保養。", atk: 5, eq_slot: "weapon" },
    SHIELD: { name: "冒險小盾 🛡️", desc: "專為方便攜帶而設計，並不是十分完善。", def: 3, eq_slot: "shield" },
    RATION: { name: "營養口糧 🍪", desc: "旅行者愛用的補給品。", hp: 25, sanity: 25, doom: -1 },
    BACON: { name: "煙燻培根 🥓", desc: "香氣十足的便利食物。", hp: 40, sanity: 40, doom: 1 },
    MEAT: { name: "新鮮生肉 🥩", desc: "還滴著紅血，生吃應該也是可以。", hp: 50, sanity: 50, doom: -1 },
    BBQ: { name: "炙烤骨肉 🍖", desc: "帶骨的強身大餐。", hp: 75, sanity: 75, doom: 2 },
};

AyaGlobals.ITEMS = {
    ALYS: "ALYS",
    SWORD: "SWORD",
    SHIELD: "SHIELD",
    RATION: "RATION",
    BACON: "BACON",
    MEAT: "MEAT",
    BBQ: "BBQ",
};

// 夥伴隨「不同場景」或是「關鍵場景」變更的動態對話庫
AyaGlobals.PARTNER_DIALOGUE = {
    graveyard_west: "艾莉絲環顧四周：『‧‧‧，噁心的地方。。』",
    graveyard_center: "艾莉絲：『這裡是一切的原點。』",
    graveyard_east: "艾莉絲：『該不會衝出殭屍吧？媽阿，噁心的地方。』",
};

AyaGlobals.EQ_ALL_SLOT = ["weapon", "shield", "armor"];
AyaGlobals.EQ_ALL_SLOT_NAME = { weapon: "武器", shield: "盾牌", armor: "穿著" };
AyaGlobals.ALL_SKILL = [
    "hp", "sanity", "coin", "fame", "doom",
    "power", "knowledge", "charm", "lock_picking", "creativity",
    "atk", "def", "logic", "deduction", "concentration",
];
AyaGlobals.ALL_SKILL_NAME = [
    "體力", "理智", "金錢", "名聲", "末日",
    "力量", "知識", "魅力", "開鎖", "創造",
    "攻擊", "防禦", "邏輯", "推理", "集中",
];
// 遊戲狀態
AyaGlobals.STATE_DEFAULT = {
    location: "Tavern_Room",
    location_save: "Tavern_Room",
    inventory: [AyaGlobals.ITEMS.SWORD, AyaGlobals.ITEMS.SHIELD, AyaGlobals.ITEMS.RATION, AyaGlobals.ITEMS.BACON],
    parnter: [AyaGlobals.ITEMS.ALYS],
    hp: 100,
    sanity: 100,
    coin: 0,
    fame: 0,
    doom: 0,
    power: 6,
    knowledge: 6,
    charm: 6,
    lock_picking: 2,
    creativity: 3,
    atk: 0,
    def: 0,
    logic: 5,
    deduction: 6,
    concentration: 4,
    weapon: null,
    shield: null,
    armor: null,
    ended: false,
    inspecting: null, // 當前正在檢視的道具 Key 或 'Alys'，為 null 表示在正常場景
    flags: {
        metWorld: false,
        metTavern: false,
        unlockGraveyardWestGate: false,
        unlockGuardHouse: false,
        firstKnock: false,
        welcomeToCathedral: false,
        metAlys: false,
        battle: false,
        battleForAlys: false,
    },
    mob_state: {
        hp: 100,
        sanity: 100,
        atk: 0,
        def: 0,
        coin: 0,
        fame: 0,
        doom: 0,
        traits: [],
        skills: [],
    }
};
AyaGlobals.AUTO_SAVE_NAME = "Kingdom_of_Abyss_Auto.sav";
//Globals
AyaGlobals.GameState = structuredClone(AyaGlobals.STATE_DEFAULT);//不能有function
//Interfaces
AyaGlobals.setStatus = function (text, append = false) {console.log("setStatus: 未實作", text, append)};