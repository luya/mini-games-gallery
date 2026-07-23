(function () {
    AyaGlobals.GameState = AyaKits.loadGame(structuredClone(AyaGlobals.STATE_DEFAULT), AyaGlobals.AUTO_SAVE_NAME);

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

    function setStatus(text, append = false) {
        if (!append) {
            statusTextEl.textContent = text;
        } else {
            statusTextEl.textContent += text;
        }
    }

    AyaGlobals.setStatus = setStatus;

    function addItem(itemKey) {
        AyaGlobals.GameState.inventory.push(itemKey);
        renderInventory();
    }

    AyaGlobals.addItem = addItem;

    function removeItem(itemKey) {
        if (AyaGlobals.GameState.inventory.includes(itemKey)) {
            const index = AyaGlobals.GameState.inventory.indexOf(itemKey);

            // 2. 確定有找到該元素（indexOf 找不到時會回傳 -1）
            if (index !== -1) {
                // 從 index 位置開始刪除 1 個元素
                AyaGlobals.GameState.inventory.splice(index, 1);
            }
        }
        renderInventory();
    }

    
    AyaGlobals.removeItem = removeItem;

    // 渲染上方可點擊的道具與夥伴列表
    function renderInventory() {
        inventoryEl.innerHTML = ""; // 觸發渲染前先清空是沒問題的

        AyaGlobals.EQ_ALL_SLOT.forEach((slotKey) => {
            // 1. 如果有武器，建立標籤文字與按鈕
            if (AyaGlobals.GameState[slotKey]) {
                // 使用 TextNode 加入文字，就不會破壞 DOM 結構
                inventoryEl.appendChild(document.createTextNode(`${AyaGlobals.EQ_ALL_SLOT_NAME[slotKey]}：`));

                const btn = document.createElement("button");
                btn.className = "inv-btn";
                btn.textContent = AyaGlobals.ITEM_DATA[AyaGlobals.GameState[slotKey]].name;
                btn.addEventListener("click", () => inspectSomething(AyaGlobals.GameState[slotKey], AyaGlobals.ITEM_DATA[AyaGlobals.GameState[slotKey]].eq_slot));
                inventoryEl.appendChild(btn);
            }
        });

        if (AyaGlobals.GameState.parnter.length > 0) {
            inventoryEl.appendChild(document.createTextNode("隊員："));
        }

        // 3. 生成獲得的道具按鈕
        AyaGlobals.GameState.parnter.forEach((itemKey) => {
            const btn = document.createElement("button");
            btn.className = "inv-btn partner";
            btn.textContent = AyaGlobals.ITEM_DATA[itemKey].name;
            btn.addEventListener("click", () => inspectSomething(itemKey));
            inventoryEl.appendChild(btn);
        });

        // 2. 判斷並加入標題文字
        if (AyaGlobals.GameState.inventory.length > 0) {
            inventoryEl.appendChild(document.createTextNode("道具："));
        } else {
            inventoryEl.appendChild(document.createTextNode("道具：無"));
        }

        // 3. 生成獲得的道具按鈕
        AyaGlobals.GameState.inventory.forEach((itemKey) => {
            const btn = document.createElement("button");
            btn.className = "inv-btn";
            btn.textContent = AyaGlobals.ITEM_DATA[itemKey].name;
            btn.addEventListener("click", () => inspectSomething(itemKey));
            inventoryEl.appendChild(btn);
        });
    }

    // 進入調查/對話模式
    function inspectSomething(target, eq_slot = null) {
        if (AyaGlobals.GameState.ended) return;
        AyaGlobals.GameState.inspecting = target;
        AyaGlobals.GameState.inspecting_slot = eq_slot;
        render();
    }
    function playerAttack() {
        AyaGlobals.setStatus("你向敵人發起攻擊。");
        let damage = AyaKits.rollDice(Math.max(1, AyaGlobals.GameState.atk - AyaGlobals.GameState.mob_state.def));
        AyaGlobals.GameState.mob_state.hp -= damage;
        // AyaKits.audio.playSFX("ogg/shu.ogg");
        AyaGlobals.setStatus(`\n你造成了${damage}傷害。`, true);
        AyaGlobals.GameState.mob_state.sanity -= AyaKits.rollDice(3);
        if (AyaGlobals.GameState.mob_state.hp <= 0 || AyaGlobals.GameState.mob_state.sanity <= 0) return;
        damage = AyaKits.rollDice(Math.max(1, AyaGlobals.GameState.mob_state.atk - AyaGlobals.GameState.def));
        AyaGlobals.GameState.hp -= damage;
        AyaGlobals.GameState.sanity -= AyaKits.rollDice(2);
        AyaGlobals.setStatus(`\n敵人回擊，對你造成了${damage}傷害。`, true);
    }

    AyaGlobals.playerAttack = playerAttack;
    function playerRoar() {
        AyaGlobals.setStatus("敵人被你震攝。");
        let damage = AyaKits.rollDice(10);
        AyaGlobals.GameState.mob_state.sanity -= damage;
        // AyaKits.audio.playSFX("ogg/woman_roar.ogg");
        AyaGlobals.setStatus(`\n你造成了${damage}精神傷害。`, true);
        AyaGlobals.GameState.sanity += AyaKits.rollDice(3);
        AyaGlobals.setStatus(`\n你覺得精神抖擻。`, true);
        if (AyaGlobals.GameState.mob_state.hp <= 0 || AyaGlobals.GameState.mob_state.sanity <= 0) return;
        damage = AyaKits.rollDice(Math.max(1, (AyaGlobals.GameState.mob_state.atk / 2) - AyaGlobals.GameState.def));
        AyaGlobals.GameState.hp -= damage;
        AyaGlobals.setStatus(`\n敵人回神後，對你造成了${damage}傷害。`, true);
    }
AyaGlobals.playerRoar = playerRoar;
    function enemyPursuit() {
        if (AyaGlobals.GameState.flags.battle) {
            let damage = AyaKits.rollDice(Math.max(1, AyaGlobals.GameState.mob_state.atk - AyaGlobals.GameState.def));
            if (!AyaGlobals.GameState.mob_state.skills.includes("Pursuit")) {
                AyaGlobals.GameState.hp -= damage;
                AyaGlobals.setStatus(`\n敵人趁機追擊，對你造成了${damage}傷害。`, true);
            } else {
                AyaGlobals.GameState.hp -= damage;
                AyaGlobals.setStatus(`\n敵人趁機瘋狂追擊，對你造成了${damage * 2}傷害。`, true);
            }
        }
    }
AyaGlobals.enemyPursuit = enemyPursuit;


    function endGame(type) {
        AyaGlobals.GameState.ended = true;
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

        AyaGlobals.setStatus("冒險已宣告落幕。");
    }

    function render() {
        // 更新能力值
        updateStats();
        renderInventory();
        optionsEl.innerHTML = "";

        if (AyaGlobals.GameState.ended) return;

        // 情況 A：正在進行道具調查或夥伴交談
        if (AyaGlobals.GameState.inspecting !== null) {

            // 道具調查
            const item = AyaGlobals.ITEM_DATA[AyaGlobals.GameState.inspecting];
            locationNameEl.textContent = `🔍 調查中：${item.name}`;
            sceneIconEl.textContent = "🧩";
            dialogTextEl.textContent = item.desc;
            let skillCounter = 0;
            let skillDesc = "";
            AyaGlobals.ALL_SKILL.forEach((skillKey) => {
                if (item[skillKey]) {
                    if (skillCounter > 0) skillDesc += ", ";
                    skillDesc += AyaGlobals.ALL_SKILL_NAME[AyaGlobals.ALL_SKILL.indexOf(skillKey)] + `：${item[skillKey]}`;
                    skillCounter += 1;
                }
            });
            if (skillCounter > 0) {
                dialogTextEl.textContent += "。\n修正值：" + skillDesc;
            }


            if (AyaGlobals.GameState.parnter.includes(AyaGlobals.GameState.inspecting)) {
                locationNameEl.textContent = `💬 與隊員互動中：${item.name}`;
                sceneIconEl.textContent = "🌹";
            }

            // console.log(item.hp);
            if ((item.hp && AyaGlobals.GameState.hp < 100) || (item.sanity && AyaGlobals.GameState.sanity < 100)) {
                const useBtn = document.createElement("button");
                useBtn.className = "option-btn";
                useBtn.innerHTML = `<span>使用道具 🤏</span><span class="option-key">選項</span>`;
                useBtn.addEventListener("click", () => {
                    if (item.result) {
                        AyaGlobals.setStatus(item.result);
                    } else {
                        AyaGlobals.setStatus(`你使用了道具：${item.name}`);
                    }
                    if (item.doom) AyaGlobals.GameState.doom += item.doom;
                    if (item.hp) AyaGlobals.GameState.hp += item.hp;
                    if (AyaGlobals.GameState.hp > 100) AyaGlobals.GameState.hp = 100;
                    if (item.sanity) AyaGlobals.GameState.sanity += item.sanity
                    if (AyaGlobals.GameState.sanity > 100) AyaGlobals.GameState.sanity = 100;
                    if (!item.repeat) removeItem(AyaGlobals.GameState.inspecting);
                    AyaGlobals.GameState.inspecting = null;
                    enemyPursuit();
                    render();
                });
                optionsEl.appendChild(useBtn);
            }

            if (item.eq_slot && !AyaGlobals.GameState.inspecting_slot) {
                const eqBtn = document.createElement("button");
                eqBtn.className = "option-btn";
                eqBtn.innerHTML = `<span>裝備 👌</span><span class="option-key">選項</span>`;
                eqBtn.addEventListener("click", () => {
                    // console.log(AyaGlobals.GameState.inventory);
                    AyaGlobals.setStatus(`你裝備了：${item.name}`);
                    equipItem(AyaGlobals.GameState.inspecting);
                    AyaGlobals.GameState.inspecting = null;
                    enemyPursuit();
                    render();
                    //console.log(AyaGlobals.GameState.inventory);
                });
                optionsEl.appendChild(eqBtn);
            }

            if (AyaGlobals.GameState.inspecting_slot) {
                const uneqBtn = document.createElement("button");
                uneqBtn.className = "option-btn";
                uneqBtn.innerHTML = `<span>卸下裝備 👌</span><span class="option-key">選項</span>`;
                uneqBtn.addEventListener("click", () => {
                    AyaGlobals.setStatus(`你卸下裝備了：${item.name}`);
                    unequipItem(AyaGlobals.GameState.inspecting_slot);
                    AyaGlobals.GameState.inspecting = null;
                    AyaGlobals.GameState.inspecting_slot = null;
                    enemyPursuit();
                    render();
                });
                optionsEl.appendChild(uneqBtn);
            }


            // 生成返回現場的按鈕
            const returnBtn = document.createElement("button");
            returnBtn.className = "option-btn";
            returnBtn.innerHTML = `<span>繼續冒險 ↩️</span><span class="option-key">返回</span>`;
            returnBtn.addEventListener("click", () => {
                AyaGlobals.GameState.inspecting = null;
                render();
            });
            optionsEl.appendChild(returnBtn);
            return;
        }

        // 情況 B：正常場景探索
        const finalLoc = {
            ...AyaNarratives.locations,
            ...AyaNarratives.tavern_single_events,
            ...AyaNarratives.endings,
        };
        const loc = finalLoc[AyaGlobals.GameState.location];
        locationNameEl.textContent = loc.name;
        dialogTextEl.textContent = typeof loc.text === 'function' ? loc.text() : loc.text;
        sceneIconEl.textContent = "🍀";

        if (AyaGlobals.GameState.hp <= 12) dialogTextEl.textContent += "\n(😓你覺得身體不適。)";
        if (AyaGlobals.GameState.sanity <= 12) dialogTextEl.textContent += "\n(🤪你覺得非常恐慌。)";

        const optionDefs = loc.options();
        optionDefs.forEach((opt, index) => {
            const btn = document.createElement("button");
            btn.className = "option-btn";
            const opt_text = typeof opt.text === 'function' ? opt.text() : opt.text;
            btn.innerHTML = `<span>${opt_text}</span><span class="option-key">選項 ${index + 1}</span>`;

            // 遊戲核心
            btn.addEventListener("click", () => {
                if (opt.action) {
                    opt.action();
                    AyaGlobals.GameState.sanity -= 1;
                }
                if (opt.next) {
                    AyaGlobals.GameState.location = typeof opt.next === 'function' ? opt.next() : opt.next;
                    if (AyaGlobals.GameState.hp <= 0) AyaGlobals.GameState.location = "End_Test";
                    if (AyaGlobals.GameState.sanity <= 0) AyaGlobals.GameState.location = "End_Test";
                    if (AyaGlobals.GameState.doom >= 100) AyaGlobals.GameState.location = "End_Test";
                    // if (loc.random_battle_dice) {
                    //     let random_battle_dice = Math.random();
                    //     console.log(random_battle_dice);
                    //     if (random_battle_dice >= 1 - loc.random_battle_dice && AyaGlobals.GameState.location != "random_battle") {
                    //         AyaGlobals.GameState.location_save = AyaGlobals.GameState.location;
                    //         AyaGlobals.GameState.location = "random_battle";
                    //     }
                    // }
                }
                render();
            });
            optionsEl.appendChild(btn);
        });
        AyaGlobals.GameState.hp = Math.min(AyaGlobals.GameState.hp, 100);
        AyaGlobals.GameState.hp = Math.max(AyaGlobals.GameState.hp, 0);
        AyaGlobals.GameState.sanity = Math.min(AyaGlobals.GameState.sanity, 100);
        AyaGlobals.GameState.sanity = Math.max(AyaGlobals.GameState.sanity, 0);
        AyaGlobals.GameState.doom = Math.min(AyaGlobals.GameState.doom, 100);
        AyaGlobals.GameState.doom = Math.max(AyaGlobals.GameState.doom, 0);
        AyaGlobals.GameState.fame = Math.max(AyaGlobals.GameState.fame, 0);
        const setDiffStatus = (tag, oval, nval, otext) => { if (oval != nval && oval != otext) AyaGlobals.setStatus(`\n${tag}: ` + oval + "➡️" + nval, true) };
        const AllSkillDOM = [HPEl, SAEl, COEl, FAEl, DOEl, POEl, KNEl, CHEl, LPEl, CREl, ATEl, DFEl, LOEl, DEEl, CTEl];
        AyaGlobals.ALL_SKILL.forEach((v, i) => {
            if ("開始選擇你的命運⋯" != statusTextEl.textContent) {
                setDiffStatus(v.toUpperCase(), AllSkillDOM[i].textContent, `${AyaGlobals.GameState[v]}`, "?");
            }
            AllSkillDOM[i].textContent = `${AyaGlobals.GameState[v]}`;
        });
        if (!AyaGlobals.GameState.ended) AyaKits.saveGame(AyaGlobals.GameState, AyaGlobals.AUTO_SAVE_NAME);
        // if (AyaGlobals.GameState.hp <= 0) endGame("dead");
        // if (AyaGlobals.GameState.sanity <= 0) endGame("void");
        // if (AyaGlobals.GameState.doom >= 100) endGame("doom");
    }

    function restartGame() {
        AyaGlobals.GameState = structuredClone(AyaGlobals.STATE_DEFAULT);
        AyaGlobals.setStatus("開始選擇你的命運⋯");
        render();
    }

    // 輔助函式：根據當前裝備重新計算角色屬性
    function updateStats() {
        //1. default
        AyaGlobals.ALL_SKILL.forEach((skillKey) => {
            if (!["hp", "sanity", "coin", "fame", "doom"].includes(skillKey)) {
                AyaGlobals.GameState[skillKey] = AyaGlobals.STATE_DEFAULT[skillKey];
            }

        });

        //2. eq
        AyaGlobals.EQ_ALL_SLOT.forEach((slotKey) => {
            if (AyaGlobals.GameState[slotKey] && AyaGlobals.ITEM_DATA[AyaGlobals.GameState[slotKey]]) {
                AyaGlobals.ALL_SKILL.forEach((skillKey) => {
                    AyaGlobals.GameState[skillKey] += AyaGlobals.ITEM_DATA[AyaGlobals.GameState[slotKey]][skillKey] || 0
                });
            }
        });

        AyaGlobals.GameState.parnter.forEach((member) => {
            AyaGlobals.ALL_SKILL.forEach((skillKey) => {
                AyaGlobals.GameState[skillKey] += AyaGlobals.ITEM_DATA[member][skillKey] || 0
            });
        });

        AyaGlobals.GameState.atk += AyaGlobals.GameState.power + Math.floor(AyaGlobals.GameState.charm / 2) + Math.floor(AyaGlobals.GameState.knowledge / 4);
        AyaGlobals.GameState.def += AyaGlobals.GameState.charm + Math.floor(AyaGlobals.GameState.power / 2) + Math.floor(AyaGlobals.GameState.knowledge / 4);
    }

    // 2. 穿上裝備
    function equipItem(itemName) {
        // console.log(itemName);
        // console.log(AyaGlobals.GameState.inventory);
        // 檢查背包是否有該道具
        const item_data = AyaGlobals.ITEM_DATA[itemName];
        const slot = item_data.eq_slot; // "weapon" 或 "armor"

        // 從背包移除要裝備的道具
        removeItem(itemName)
        // console.log(AyaGlobals.GameState.inventory);
        // 如果目標位置已有裝備，先卸下回到背包
        if (AyaGlobals.GameState[slot]) {
            addItem(AyaGlobals.GameState[slot]);
        }

        // 裝上新裝備並更新能力值
        AyaGlobals.GameState[slot] = itemName;
        // console.log(AyaGlobals.GameState.inventory);
    }

    // 3. 卸下裝備
    function unequipItem(slot) {

        console.log(AyaGlobals.GameState.inventory);
        // 將裝備移回背包
        const unequippedItem = AyaGlobals.GameState[slot];
        addItem(unequippedItem);
        AyaGlobals.GameState[slot] = null;



        console.log(AyaGlobals.GameState.inventory);
    }

    restartBtn.addEventListener("click", restartGame);

    // 啟動遊戲
    render();
})();
