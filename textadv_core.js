// UI 渲染與核心邏輯
const locationNameEl = document.getElementById("locationName");
const dialogTextEl = document.getElementById("dialogText");
const optionsEl = document.getElementById("options");
const inventoryEl = document.getElementById("inventory");
const statusTextEl = document.getElementById("statusText");
const restartBtn = document.getElementById("restartBtn");
const sceneIconEl = document.getElementById("sceneIcon");
const HPEl = document.getElementById("HP");
const SAEl = document.getElementById("SANITY");
const COEl = document.getElementById("COIN");
const FAEl = document.getElementById("FAME");
const DOEl = document.getElementById("DOOM");

const POEl = document.getElementById("POWER");
const KNEl = document.getElementById("KNOWLEDGE");
const CHEl = document.getElementById("CHARM");
const LPEl = document.getElementById("LOCK PICKING");
const CREl = document.getElementById("CREATIVITY");

const ATEl = document.getElementById("ATTACK");
const DFEl = document.getElementById("DEFENSE");
const LOEl = document.getElementById("LOGIC");
const DEEl = document.getElementById("DEDUCTION");
const CTEl = document.getElementById("CONCENTRATION");

function setStatus(text, append=false) {
    if (!append){
        statusTextEl.textContent = text;
    } else {
        statusTextEl.textContent += text;
    }
    
}

function addItem(itemKey) {
    state.inventory.push(itemKey);
    renderInventory();
}

function removeItem(itemKey) {
    if (state.inventory.includes(itemKey)) {
        const index = state.inventory.indexOf(itemKey);

        // 2. 確定有找到該元素（indexOf 找不到時會回傳 -1）
        if (index !== -1) {
            // 從 index 位置開始刪除 1 個元素
            state.inventory.splice(index, 1);
        }
    }
    renderInventory();
}

// 渲染上方可點擊的道具與夥伴列表
function renderInventory() {
    inventoryEl.innerHTML = ""; // 觸發渲染前先清空是沒問題的

    EqAllSlot.forEach((slotKey) => {
        // 1. 如果有武器，建立標籤文字與按鈕
        if (state[slotKey]) {
            // 使用 TextNode 加入文字，就不會破壞 DOM 結構
            inventoryEl.appendChild(document.createTextNode(`${EqAllSlotName[slotKey]}：`));

            const btn = document.createElement("button");
            btn.className = "inv-btn";
            btn.textContent = ITEM_DATA[state[slotKey]].name;
            btn.addEventListener("click", () => inspectSomething(state[slotKey], ITEM_DATA[state[slotKey]].eq_slot));
            inventoryEl.appendChild(btn);
        }
    });

    if (state.parnter.length > 0) {
        inventoryEl.appendChild(document.createTextNode("隊員："));
    }

    // 3. 生成獲得的道具按鈕
    state.parnter.forEach((itemKey) => {
        const btn = document.createElement("button");
        btn.className = "inv-btn partner";
        btn.textContent = ITEM_DATA[itemKey].name;
        btn.addEventListener("click", () => inspectSomething(itemKey));
        inventoryEl.appendChild(btn);
    });

    // 2. 判斷並加入標題文字
    if (state.inventory.length > 0) {
        inventoryEl.appendChild(document.createTextNode("道具："));
    } else {
        inventoryEl.appendChild(document.createTextNode("道具：無"));
    }

    // 3. 生成獲得的道具按鈕
    state.inventory.forEach((itemKey) => {
        const btn = document.createElement("button");
        btn.className = "inv-btn";
        btn.textContent = ITEM_DATA[itemKey].name;
        btn.addEventListener("click", () => inspectSomething(itemKey));
        inventoryEl.appendChild(btn);
    });
}

// 進入調查/對話模式
function inspectSomething(target, eq_slot = null) {
    if (state.ended) return;
    state.inspecting = target;
    state.inspecting_slot = eq_slot;
    render();
}

function endGame(type) {
    state.ended = true;
    const ending = endings[type];
    locationNameEl.textContent = ending.title;
    dialogTextEl.textContent = ending.text;
    sceneIconEl.textContent = "⚖️";

    optionsEl.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span>重啟冒險 🔁</span><span class="option-key">重開</span>`;
    btn.addEventListener("click", restartGame);
    optionsEl.appendChild(btn);

    setStatus("冒險已宣告落幕。");
}
// 解析值的通用函式：若是函式就執行，不是就直接回傳
const resolveValue = (val) => (typeof val === 'function' ? val() : val);
// 核心渲染邏輯：區分「現場探索」與「互動面板」
function render() {
    // 更新能力值
    updateStats();
    renderInventory();
    optionsEl.innerHTML = "";

    if (state.ended) return;

    // 情況 A：正在進行道具調查或夥伴交談
    if (state.inspecting !== null) {

        // 道具調查
        const item = ITEM_DATA[state.inspecting];
        locationNameEl.textContent = `🔍 調查中：${item.name}`;
        sceneIconEl.textContent = "🧩";
        dialogTextEl.textContent = item.desc;
        let skillCounter = 0;
        let skillDesc = "";
        AllSkill.forEach((skillKey) => {
            if (item[skillKey]) {
                if (skillCounter > 0) skillDesc += ", ";
                skillDesc += AllSkillName[AllSkill.indexOf(skillKey)] + `：${item[skillKey]}`;
                skillCounter += 1;
            }
        });
        if (skillCounter > 0) {
            dialogTextEl.textContent += "。\n修正值：" + skillDesc;
        }


        if (state.parnter.includes(state.inspecting)) {
            locationNameEl.textContent = `💬 與隊員互動中：${item.name}`;
            sceneIconEl.textContent = "🌹";
        }

        // console.log(item.hp);
        if ((item.hp && state.hp < 100) || (item.sanity && state.sanity < 100)) {
            const useBtn = document.createElement("button");
            useBtn.className = "option-btn";
            useBtn.innerHTML = `<span>使用道具 🤏</span><span class="option-key">選項</span>`;
            useBtn.addEventListener("click", () => {
                setStatus(item.result);
                if (item.doom) state.doom += item.doom;
                if (item.hp) state.hp += item.hp;
                if (state.hp > 100) state.hp = 100;
                if (item.sanity) state.sanity += item.sanity
                if (state.sanity > 100) state.sanity = 100;
                if (!item.repeat) removeItem(state.inspecting);
                state.inspecting = null;
                render();
            });
            optionsEl.appendChild(useBtn);
        }

        if (item.eq_slot && !state.inspecting_slot) {
            const eqBtn = document.createElement("button");
            eqBtn.className = "option-btn";
            eqBtn.innerHTML = `<span>裝備 👌</span><span class="option-key">選項</span>`;
            eqBtn.addEventListener("click", () => {
                console.log(state.inventory);
                setStatus(`裝備了：${item.name}`);
                equipItem(state.inspecting);
                state.inspecting = null;
                render();
                console.log(state.inventory);
            });
            optionsEl.appendChild(eqBtn);
        }

        if (state.inspecting_slot) {
            const uneqBtn = document.createElement("button");
            uneqBtn.className = "option-btn";
            uneqBtn.innerHTML = `<span>卸下裝備 👌</span><span class="option-key">選項</span>`;
            uneqBtn.addEventListener("click", () => {
                setStatus(`卸下裝備了：${item.name}`);
                unequipItem(state.inspecting_slot);
                state.inspecting = null;
                state.inspecting_slot = null;
                render();
            });
            optionsEl.appendChild(uneqBtn);
        }


        // 生成返回現場的按鈕
        const returnBtn = document.createElement("button");
        returnBtn.className = "option-btn";
        returnBtn.innerHTML = `<span>繼續冒險 ↩️</span><span class="option-key">返回</span>`;
        returnBtn.addEventListener("click", () => {
            state.inspecting = null;
            render();
        });
        optionsEl.appendChild(returnBtn);
        return;
    }

    // 情況 B：正常場景探索
    const finalLoc = {
        ...locations, 
        ...tavern_single_events,
    };
    const loc = finalLoc[state.location];
    locationNameEl.textContent = loc.name;
    dialogTextEl.textContent = resolveValue(loc.text);
    sceneIconEl.textContent = "💀";

    if (state.hp <= 12) dialogTextEl.textContent += "\n(😓你覺得身體不適。)";
    if (state.sanity <= 12) dialogTextEl.textContent += "\n(🤪你覺得非常恐慌。)";

    const optionDefs = loc.options();
    optionDefs.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        const opt_text = resolveValue(opt.text);
        btn.innerHTML = `<span>${opt_text}</span><span class="option-key">選項 ${index + 1}</span>`;

        // 遊戲核心
        btn.addEventListener("click", () => {
            if (opt.action) {
                opt.action();
                state.sanity -= 1;
            }
            if (opt.next) {
                state.location = resolveValue(opt.next);
                if (loc.random_battle_dice) {
                    let random_battle_dice = Math.random();
                    console.log(random_battle_dice);
                    if (random_battle_dice >= 1 - loc.random_battle_dice && state.location != "random_battle") {
                        state.location_save = state.location;
                        state.location = "random_battle";
                    }
                }
            }
            render();
        });
        optionsEl.appendChild(btn);
    });
    state.hp = Math.min(state.hp, 100);
    state.hp = Math.max(state.hp, 0);
    state.sanity = Math.min(state.sanity, 100);
    state.sanity = Math.max(state.sanity, 0);
    state.doom = Math.min(state.doom, 100);
    state.doom = Math.max(state.doom, 0);
    state.fame = Math.max(state.fame, 0);
    const setDiffStatus = (tag, oval, nval, otext) => {if(oval!=nval&&oval!=otext) setStatus(`\n${tag}: `+oval+"➡️"+nval, true)};
    const AllSkillDOM = [HPEl, SAEl, COEl, FAEl, DOEl, POEl, KNEl, CHEl, LPEl, CREl, ATEl, DFEl, LOEl, DEEl, CTEl];
    AllSkill.forEach((v, i)=>{
        if ("開始選擇你的命運⋯" != statusTextEl.textContent){
            setDiffStatus(v.toUpperCase(), AllSkillDOM[i].textContent, `${state[v]}`, "?");
        }
        AllSkillDOM[i].textContent=`${state[v]}`;
    });
    if(!state.ended) AyaKits.saveGame(state, autosavename);
    if (state.hp <= 0) endGame("dead");
    if (state.sanity <= 0) endGame("void");
    if (state.doom >= 100) endGame("doom");
}

function restartGame() {
    state = structuredClone(state_default);
    setStatus("開始選擇你的命運⋯");
    render();
}

// 輔助函式：根據當前裝備重新計算角色屬性
function updateStats() {
    //1. default
    AllSkill.forEach((skillKey) => {
        if (!["hp", "sanity", "coin", "fame", "doom"].includes(skillKey)) {
            state[skillKey] = state_default[skillKey];
        }

    });

    //2. eq
    EqAllSlot.forEach((slotKey) => {
        if (state[slotKey] && ITEM_DATA[state[slotKey]]) {
            AllSkill.forEach((skillKey) => {
                state[skillKey] += ITEM_DATA[state[slotKey]][skillKey] || 0
            });
        }
    });

    state.parnter.forEach((member) => {
        AllSkill.forEach((skillKey) => {
            state[skillKey] += ITEM_DATA[member][skillKey] || 0
        });
    });

    state.atk += state.power + Math.floor(state.charm / 2) + Math.floor(state.knowledge / 4);
    state.def += state.charm + Math.floor(state.power / 2) + Math.floor(state.knowledge / 4);
}

// 2. 穿上裝備
function equipItem(itemName) {
    // console.log(itemName);
    // console.log(state.inventory);
    // 檢查背包是否有該道具
    const item_data = ITEM_DATA[itemName];
    const slot = item_data.eq_slot; // "weapon" 或 "armor"

    // 從背包移除要裝備的道具
    removeItem(itemName)
    // console.log(state.inventory);
    // 如果目標位置已有裝備，先卸下回到背包
    if (state[slot]) {
        addItem(state[slot]);
    }

    // 裝上新裝備並更新能力值
    state[slot] = itemName;
    // console.log(state.inventory);
}

// 3. 卸下裝備
function unequipItem(slot) {

    console.log(state.inventory);
    // 將裝備移回背包
    const unequippedItem = state[slot];
    addItem(unequippedItem);
    state[slot] = null;



    console.log(state.inventory);
}

restartBtn.addEventListener("click", restartGame);

// 啟動遊戲
render();