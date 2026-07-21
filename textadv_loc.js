function getRandomEvent(eventsObject) {
    const keys = Object.keys(eventsObject);
    if (keys.length === 0) return null; // 避免物件是空的造成錯誤
    
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return {
        key: randomKey,
        event: eventsObject[randomKey]
    };
}
const tavern_single_events = {
    Meat_Problem: {
        name: "🍖 大胃王比賽",
        text: () => {
            let base = "酒館旁的餐廳，正在舉行比賽。";
            return base;
        },
        options: () => {
            let opts = [
                { text: "接受挑戰 ✔️", next: "Tavern" , action: () => {setStatus("你贏得了大胃王比賽。")}},
                { text: "放棄 ❌", next: "Tavern" , action: () => {setStatus("你放棄大胃王比賽。")}},
            ];
            return opts;
        }
    },
};
//場景設定
const locations = {
    Tavern_Room: {
        name: "🛌 綠石酒館二樓住所",
        text: () => {
            let base = "軟木塞拔開的沉悶聲、窗外遠處集市的喧鬧聲、微弱的晨光透過帶有綠苔的玻璃窗照進來。";
            if (!state.flags.metWorld) {
                base = "你在吱吱作響的木板床上睜開眼。\n空氣中瀰漫著綠石酒館特有的麥芽甜味與潮濕木頭的氣息。";
                base += "\n這裡是你在這個區域臨時租下的二樓房間，空間狹小，但足夠安全。";
                base += "\n是時候該去冒險者公會接受任務，你必須在出門前做好準備。";
                state.flags.metWorld = true;
            }
            return base;
        },
        options: () => {
            let opts = [
                { text: "離開房間，前往一樓 🍺", next: "Tavern" , action: () => {setStatus("你來到了綠石酒館。")}},
            ];
            return opts;
        }
    },
    Tavern: {
        name: "🍺 綠石酒館",
        text: () => {
            let base = "喧鬧的酒杯碰撞聲與吟遊詩人不成調的琴聲在空氣中交織。\n微黃的光暈從苔蘚螢光石與沉重鐵燈籠中滲出。";
            if (!state.flags.metTavern) {
                base = "推開房門，熱氣與酒氣撲面而來。";
                base += "\n一樓的酒館大廳早已坐半滿：";
                base += "\n矮人傭兵正大聲抱怨昨晚的黑啤酒，\n酒保綠石老爹正用一塊發黑的抹布用力擦拭吧檯。";
                state.flags.metTavern = true;
            }
            return base;
        },
        options: () => {
            let opts = [
                
                { text: "前往公會 🏟️", next: "Tavern_Room" , action: () => {setStatus("你到達了冒險公會。")}},
                { text: "回到住所 🛌", next: "Tavern_Room", action: () => {setStatus("你回到了二樓住所。")}},
            ];
            
            opts.unshift(
                { 
                    text: "探索四周 🎲", 
                    next: ()=>{
                        state.doom +=1;
                        return getRandomEvent(tavern_single_events).key
                    }
                }
            );
            return opts;
        }
    },



    // 村莊小路 2
    village_path_2: {
        name: "☘️ 一般道路",
        text: () => {
            let base = "一個普通的道路。";
            if (!state.flags.metAlys) {
                base = "一個穿著黑袍的刺客向你靠近，你也注意到黑暗處有人在注視著你們。";
            }
            if (state.flags.metAlys && !state.inventory.includes(ITEMS.ALYS)) {
                base = "黑暗處的黑影並沒有離開。";
            }

            return base;
        },
        options: () => {
            let opts = [
                { text: "往北邊行走 🏘️", next: "village_path_1" },
                { text: "向南方前進 ⛪", next: "village_path_3" },
            ];
            if (!state.flags.metAlys) {
                opts = [
                    {
                        text: "⚔️ 進入作戰", next: "random_battle",
                        action: () => {
                            state.flags.battleForAlys = true;
                            state.location_save = state.location;
                        }
                    },
                ];
            }
            if (state.flags.metAlys && !state.inventory.includes(ITEMS.ALYS)) {
                opts = [
                    { text: "💬 與黑影對話", next: state.location },
                ];
            }

            return opts;
        }
    },
    // 首次作戰💬🔥💪
    random_battle: {
        name: "⚔️ 作戰中",
        text: () => {
            if (!state.flags.battle) {
                state.mob_state.hp = 25;
                state.mob_state.sanity = 25;
                state.mob_state.atk = 1;
                state.mob_state.def = 0;
                state.mob_state.coin = 50;
                state.mob_state.fame = 3;
                state.mob_state.doom = -1;
                if (state.flags.battleForAlys) {
                    state.mob_state.hp = 25;
                    state.mob_state.sanity = 25;
                    state.mob_state.atk = 1;
                    state.mob_state.def = 0;
                    state.mob_state.coin = 50;
                    state.mob_state.fame = 3;
                    state.mob_state.doom = -1;
                }
                state.flags.battle = true

            }
            let base = "黑袍刺客\n";
            if (state.flags.battleForAlys) {
                base = "黑袍刺客\n";
            }
            base += `HP: ${state.mob_state.hp}`;
            base += `\nSA: ${state.mob_state.sanity}`;

            if (state.flags.battle && (state.mob_state.hp <= 0 || state.mob_state.sanity <= 0)) {
                base = "作戰勝利！";
            }

            return base;
        },
        options: () => {

            let opts = [
                {
                    text: "💪 肉搏攻擊", next: "random_battle",
                    action: () => {
                        setStatus("敵人被你猛力攻擊。");
                        state.mob_state.hp -= 10;
                        state.mob_state.sanity -= 1;
                        state.hp -= state.mob_state.atk;
                    }
                },
                {
                    text: "💬 戰吼", next: "random_battle",
                    action: () => {
                        setStatus("敵人被你震攝。");
                        state.mob_state.hp -= 1;
                        state.mob_state.sanity -= 10;
                        state.hp -= state.mob_state.atk;
                    }
                },
            ];
            if (state.flags.battle && (state.mob_state.hp <= 0 || state.mob_state.sanity <= 0)) {
                opts = [
                    {
                        text: "👁️ 收刮財物", next: "random_battle",
                        action: () => {
                            if (state.mob_state.coin > 0) {
                                setStatus("👁️ 收刮財物成功");
                                state.coin += state.mob_state.coin;
                                state.mob_state.coin = 0;
                            } else {
                                setStatus("👁️ 收刮財物失敗");
                            }
                        }
                    },
                    {
                        text: "👣 離開戰場", next: state.location_save,
                        action: () => {
                            state.fame += state.mob_state.fame;
                            state.mob_state.fame = 0;
                            state.doom += state.mob_state.doom;
                            state.mob_state.doom = 0;
                            state.flags.battle = false;
                            state.flags.battleForAlys = false;
                            state.flags.metAlys = true;
                        }
                    },
                ];
            }
            return opts;
        }
    },
    // 村莊廣場🧼❄️♨️🍽️🛎️📚📜💰🍻🍖🌿⚔️🛡️🗡️🏹🪓⛏️⚒️➶ 
    // 😴 💤🛏️🥪🌮🌯🍅🍎🍊🍇
    //🧤🥾👢🩰👡👠🥿👗👙💎💍📿🎶📓📃📙📘📗📕📔📖🪔🕯️🗝️🪑
    //💬👁️‍🗨️💭🌙☀️🌫️⛈️🌨️🌧️🌈❄️⛰️🏰🗝️🪑🧾✉️📄💰🍀
};

// 6 種結局設定
const endings = {
    door: {
        title: "結局一：裂隙之門 (常規結局)",
        text: "你接受了黑暗的召喚，踏入了無盡虛空。\n從此，你成為了新一代的裂隙之門，肉體消逝，靈魂永遠徘徊在虛實的邊緣。\n你將永世孤獨，直到下一個迷途者的到來⋯⋯"
    },
    seal: {
        title: "結局二：封印者 (常規結局)",
        text: "你將野獸顱骨獻祭給祭壇，強行切斷了世界與外部裂隙的連結。\n天空的裂痕癒合了，世界重獲光明。\n但你明白，裂隙並未消失，它被永久鎖在你的內心。每當黑夜降臨，你便會聽見體內傳來瘋狂的低語。"
    },
    godslayer: {
        title: "結局三：弒神之刃 (戰鬥結局)",
        text: "你揮舞著沉重的審判者大劍，帶著無上決意斬斷了王座上的神祕黑影！\n黑夜在不甘的慘叫聲中褪去。然而，失去了古老神明的壓制，混亂的法則開始失控。\n為了維持世界運轉，你被迫坐上了那冰冷的倒錯王座，成為新的、孤獨的監管者。"
    },
    salvation: {
        title: "結局四：盲女的救贖 (同伴結局)",
        text: "你選擇了燃燒自己的存在，將裂隙指環的所有力量注入艾莉絲的體內。\n黑暗的詛咒從她身上剝離，她的雙眼重見光明。她流著淚逃離了這片破碎之地，活了下去。\n而你，自願代替她下沉，成為沉入深淵底部的石塊，永遠沉睡。"
    },
    loop: {
        title: "結局五：時間無限循環 (隱藏真結局)",
        text: "在世界毀滅的終點，你激活了倒流沙漏，並詠唱殘頁上的禁忌神術。\n整片星空開始瘋狂倒轉，時間的洪流將你猛烈扯回⋯⋯\n\n當你再度睜開眼時，四周是熟悉的冷硬泥土。你回到了起點的無名墓前。\n耳邊隱約響起地下的低語：「你不是第一次來這裡了⋯⋯」"
    },
    void: {
        title: "結局六：歸於虛無 (壞結局一)",
        text: "你沒能揭開這片土地的謎題。你暴露在虛無的侵蝕下太久導致瘋狂，你的身體與靈魂被漸漸化為純粹的黑暗粒子。\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    },
    dead: {
        title: "結局七：肉體損壞 (壞結局二)",
        text: "你沒能揭開這片土地的謎題。你過度使用身體導致受傷過於嚴重，你的身體與靈魂被漸漸化為純粹的黑暗粒子。\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    },
    doom: {
        title: "結局八：末日降臨 (壞結局三)",
        text: "你沒能揭開這片土地的謎題。你虛度太多時光導致毒霧遽增覆蓋了整個地區，所有人的身體與靈魂被漸漸化為純粹的黑暗粒子。\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    }
};