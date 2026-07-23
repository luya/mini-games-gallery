var AyaNarratives = AyaNarratives || {};

AyaNarratives.tavern_single_events = {
    Abyss_Assassin: {
        name: "⚔️ 黑袍刺客",
        text: () => {
            if (!AyaGlobals.GameState.flags.battle) {
                AyaGlobals.GameState.mob_state.hp = Math.max(10, AyaKits.rollDice(20));
                AyaGlobals.GameState.mob_state.sanity = Math.max(10, AyaKits.rollDice(20));
                AyaGlobals.GameState.mob_state.atk = Math.max(15, AyaKits.rollDice(25));
                AyaGlobals.GameState.mob_state.def = Math.max(15, AyaKits.rollDice(25));
                AyaGlobals.GameState.mob_state.coin = AyaKits.rollDice(50);
                AyaGlobals.GameState.mob_state.fame = AyaKits.rollDice(3);
                AyaGlobals.GameState.mob_state.doom = AyaKits.rollDice(3);
                AyaGlobals.GameState.mob_state.traits.unshift("Human");
                AyaGlobals.GameState.mob_state.skills.unshift("Pursuit");
                AyaGlobals.GameState.flags.battle = true
                // AyaKits.audio.changeTrack('fight.ogg', true, true);                
            }
            let base = "來至深淵的索命者，散發異常的殺氣。\n";
            base += `HP: ${AyaGlobals.GameState.mob_state.hp}`;
            base += ` SA: ${AyaGlobals.GameState.mob_state.sanity}`;
            base += `\nAT: ${AyaGlobals.GameState.mob_state.atk}`;
            base += ` DE: ${AyaGlobals.GameState.mob_state.def}`;

            if (AyaGlobals.GameState.flags.battle && (AyaGlobals.GameState.mob_state.hp <= 0 || AyaGlobals.GameState.mob_state.sanity <= 0)) {
                base = "作戰勝利！";
                if (AyaGlobals.GameState.mob_state.hp <= 0) {
                    base += `\n敵人傷重不治，已經死亡。`;
                } else {
                    base += `\n敵人失去理智，已經昏厥，並且瀕臨死亡。`;
                }
            }

            return base;
        },//⚔️🛡️
        options: () => {
            let opts = [
                {
                    text: "👊 攻擊", next: "Abyss_Assassin",
                    action: () => {
                        playerAttack();
                    }
                },
                {
                    text: "💢 怒吼", next: "Abyss_Assassin",
                    action: () => {
                        playerRoar();
                    }
                },
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.knowledge + AyaGlobals.GameState.charm + AyaGlobals.GameState.concentration;
                    },
                    event_lv : 10 * 4,
                    text: function() {
                        return "👣 逃跑 " + `成功率：${Math.floor(this.self_confidence * 100 / (this.event_lv))}% 🎲`;
                    },
                    next: function() {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus("成功！", true);
                            AyaKits.audio.stop();
                            return AyaGlobals.GameState.location_save;
                        } else {
                            AyaGlobals.setStatus("失敗！", true);
                            enemyPursuit();
                            return "Abyss_Assassin";
                        }
                    },
                    action: () => {
                        AyaGlobals.setStatus("你試圖逃跑…");
                    }
                },
            ];
            if (AyaGlobals.GameState.flags.battle && (AyaGlobals.GameState.mob_state.hp <= 0 || AyaGlobals.GameState.mob_state.sanity <= 0)) {
                opts = [
                    {
                        text: "👣 離開戰場", next: AyaGlobals.GameState.location_save,
                        action: () => {
                            AyaGlobals.GameState.fame += AyaKits.rollDice(AyaGlobals.GameState.mob_state.fame);
                            AyaGlobals.GameState.mob_state.fame = 0;
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(AyaGlobals.GameState.mob_state.doom);
                            AyaGlobals.GameState.mob_state.doom = 0;
                            AyaGlobals.GameState.flags.battle = false;
                            AyaKits.audio.stop();
                            AyaGlobals.setStatus("👣 戰鬥結束");
                        }
                    },
                ];
                if (AyaGlobals.GameState.mob_state.coin != 0) {
                    opts.unshift({
                        text: "👁️ 收刮財物", next: "Abyss_Assassin",
                        action: () => {
                            if (AyaGlobals.GameState.mob_state.coin > 0) {
                                AyaGlobals.setStatus("👁️ 收刮財物成功");
                                AyaGlobals.GameState.coin += AyaGlobals.GameState.mob_state.coin;
                                AyaGlobals.GameState.mob_state.coin = 0;
                            } else {
                                AyaGlobals.setStatus("👁️ 收刮財物失敗");
                            }
                        }
                    });
                }

            }
            return opts;
        }
    },
    Apple_Problem: {
        name: "🍎 水果攤的災難",
        text: () => {
            return "廣場裡面有人打架，一旁的水果攤被撞翻。" +
                "\n後來人群一封而散。";
        },
        options: () => {
            let opts = [
                {
                    text: () => {
                        return "出手幫忙 ✔️ ";
                    },
                    action: () => {
                        AyaGlobals.setStatus(
                            "你幫忙整理散落的貨物。\n並且得到感謝。"
                        );
                        AyaGlobals.GameState.coin += AyaKits.rollDice(10);
                        AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                        AyaGlobals.GameState.sanity += AyaKits.rollDice(2);
                        AyaGlobals.GameState.fame += AyaKits.rollDice(2);
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "冷眼旁觀 ❌",
                    action: () => { AyaGlobals.setStatus("你默默地離開了。") },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
            ];
            return opts;
        }
    },
    Meat_Problem: {
        name: "🍖 大胃王比賽",
        text: () => {
            return "酒館旁的餐廳，正在舉行比賽，你也被吸引過去湊熱鬧。" +
                "\n獎品是老闆準備的神秘禮物。";
        },
        options: () => {
            let opts = [
                {
                    // 1. 使用 getter，確保每次存取 self_confidence 時都是拿最新的 AyaGlobals.GameState 數值
                    self_confidence : function() {
                        console.log(AyaGlobals.GameState.power + AyaGlobals.GameState.knowledge + AyaGlobals.GameState.charm + AyaGlobals.GameState.creativity);
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.knowledge + AyaGlobals.GameState.charm + AyaGlobals.GameState.creativity;
                    },
                    event_lv: 12 * 4,

                    text: function() {
                        console.log(this);
                        console.log(this.self_confidence(), this.event_lv);
                        console.log(Math.floor(this.self_confidence() * 100 / this.event_lv));
                        return "接受挑戰 ✔️ " + `成功率：${Math.floor(this.self_confidence() * 100 / this.event_lv)}% 🎲`;
                    },

                    // 2. 改為一般函式，這樣內部的 this 才會指向目前這個物件
                    action: function() {
                        const event_dice = AyaKits.rollDice(this.event_lv);

                        // 直接使用 this.self_confidence 與 this.event_lv
                        if ((event_dice + this.self_confidence()) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你贏得了大胃王比賽。\n並且得到神秘禮物以及獎金。" +
                                `檢定：${event_dice}+${this.self_confidence()}>=${this.event_lv} 🎲`
                            );
                            addItem(AyaGlobals.ITEMS.BBQ);
                            AyaGlobals.GameState.coin += AyaKits.rollDice(100);
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(3);
                        } else {
                            let result_text = "你挑戰失敗，並且吐了滿地，並請要支付參賽費用。";
                            if (AyaGlobals.GameState.coin < 10) {
                                result_text += "\n你身上金錢不夠，被迫勞動服務。";
                                AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            } else {
                                AyaGlobals.GameState.coin -= 10;
                            }
                            AyaGlobals.setStatus(result_text + `檢定：${event_dice}+${this.self_confidence()}<=${this.event_lv} 🎲`);
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(50);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(25);
                            AyaGlobals.GameState.fame -= AyaKits.rollDice(3);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(3);
                        }
                    },

                    next: function() {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "放棄 ❌",
                    action: () => { AyaGlobals.setStatus("你放棄大胃王比賽。") },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
            ];
            return opts;
        }
    },
    Eye_On_Gallows: {
        name: "👁️ 懸樑上的眼球",
        text: () => {
            return "酒館外舊絞刑架上掛著一個用麻繩繫住的玻璃罐。\n" +
                "裡面有一顆仍在眨動的巨大眼球，正死死凝視著你。";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.creativity;
                    },
                    event_lv : 12 * 2,

                    text: function() {
                        return "試圖凝視玻璃罐 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function() {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "眼球受到精神反嗜，裡面的黑血濺了一地，眼球化為灰燼。\n你從玻璃罐碎片中撿到了幾枚金幣。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(20);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(2);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(2);
                        } else {
                            AyaGlobals.setStatus(
                                "罐中的眼球向你發出尖銳的神經刺痛感！你痛苦地抱頭倒地。" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(5);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.fame -= AyaKits.rollDice(2);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(2);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "移開視線離開 ❌",
                    action: () => {
                        AyaGlobals.setStatus("你快速轉過身去，強迫自己無視那股不安的視線。");
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(2);
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Sacrifice_Sheet: {
        name: "📜 唱詩班的皮紙",
        text: () => {
            return "巷口一名穿著破爛袍子的狂熱信徒正高聲吟誦。\n" +
                "他手中握著羊皮紙，上面用異形文字記滿了不詳的符號。\n" +
                "沒有人敢靠近他，或是匆忙的低頭經過。";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.knowledge + AyaGlobals.GameState.charm;
                    },
                    event_lv : 9 * 2,
                    text: function () {
                        return "辨識符號並斥責 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function () {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你指出了他咒文中的謬誤。信徒大驚失色，視你為賢者，拱手讓出了供奉的財物。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(20);
                            // AyaGlobals.GameState.knowledge += AyaKits.rollDice(2);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(4);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(3);
                        } else {
                            AyaGlobals.setStatus(
                                "你試圖解析那些符號，某些不可名狀的聲音直衝腦海！你大口吐血。" +
                                `\n檢定：${event_dice}+${this.self_confidencecheck_val}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.fame -= AyaKits.rollDice(3);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(3);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "快步通過 ❌",
                    action: () => { AyaGlobals.setStatus("你摀住耳朵，迅速離開了瘋狂的吟誦聲。"); },
                    next: () => {
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Whispering_Well: {
        name: "🩸 井底的低語",
        text: () => {
            return "酒館附近的廢棄枯井傳出陣陣濕潤的喘息聲。\n" +
                "井口周圍漫延著詭異的黑色黏液，似乎有某種古老存在正從底部甦醒。";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.knowledge + AyaGlobals.GameState.charm + AyaGlobals.GameState.creativity;
                    },
                    event_lv : 13 * 4,
                    text: function () {
                        return "凝視井底並且行動 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function () {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你克服了恐懼，用重石暫時壓制了井口。\n黏液貌似不甘心地鑽回去，消失無影。" +
                                "視線變得清晰，你發現到不少金幣掉在地上。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(80);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(5);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(4);
                        } else {
                            AyaGlobals.setStatus(
                                "井底伸出了黏稠的觸手！你受到驚嚇後勉強逃脫。" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(4);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "無視離開 ❌",
                    action: () => { AyaGlobals.setStatus("你假裝什麼都沒聽見，默默地遠離了枯井。"); },
                    next: () => {
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Midnight_Clock: {
        name: "🕰️ 逆行的老時鐘",
        text: () => {
            return "酒館附近的小巷深處有一座停擺多年的廢棄老時鐘，當你靠近時，此刻指針竟開始急速逆轉。\n" +
                "伴隨著刺耳的金屬摩擦聲，空氣中泛起一股令人窒息的腐敗氣味。";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.logic + AyaGlobals.GameState.deduction;
                    },
                    event_lv : 9 * 3,
                    text: function () {
                        return "推算齒輪規律與異像來源 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function () {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你冷靜地透過指針跳動的頻率推算出了異象結界點的虛弱時刻，然後立刻破壞了時鐘。" +
                                "\n現場遺留下了些許金幣。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(30);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(3);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(3);
                        } else {
                            AyaGlobals.setStatus(
                                "逆轉的時針引發了短暫的時空錯亂，你的肉體被錯位的時間割傷，理智也差點完全斷線！" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(3);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "避開鐘樓 ❌",
                    action: () => { AyaGlobals.setStatus("你按捺住好奇心，快速離開了刺耳的鐘樓響聲。"); },
                    next: () => {
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Locked_Iron_Casket: {
        name: "🔒 纏鐵絲的黑木箱",
        text: () => {
            return "在酒館附近的一間無人使用的地下室的陰暗角落裡，擺著一個被粗鐵鏈與重鎖緊扣的黑木箱。\n" +
                "箱子內部不斷發出微弱的指甲抓撓聲，彷彿裡面關著某種渴望逃脫的東西。";
        },
        options: () => {
            let opts = [
                {   
                    get self_confidence() {
                        return AyaGlobals.GameState.lock_picking + AyaGlobals.GameState.concentration;
                    },
                    event_lv : 10 * 2,
                    text: function () {
                        return "屏息撬開鐵鎖 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function () {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "憑藉極高的專注與技巧，你成功解開了複雜的鎖扣。\n箱子裡只有一堆黑灰與前人遺留的豐厚財寶！" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(200);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(3);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(2);
                        } else {
                            AyaGlobals.setStatus(
                                "鎖頭喀嗒一聲斷裂，一股黑色的瘴氣從箱縫爆發噴向你的臉部！" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(20);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(2);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "無視離開 ❌",
                    action: () => { AyaGlobals.setStatus("你退後幾步，決定不碰這個詭異的箱子。"); },
                    next: () => {
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(-3);
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Cursed_Cultist: {
        name: "🔪 突襲的畸形教徒",
        text: () => {
            return "一名全身長滿不規則眼球與腫塊的異教徒突然從小巷躍出！\n" +
                "他手中揮舞著短刀，瘋狂地咆哮著怪異未知名字向你撲來！";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.power + AyaGlobals.GameState.charm + AyaGlobals.GameState.concentration;
                    },
                    event_lv : 8 * 3,
                    text: function () {
                        return "正面反擊 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function () {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你果斷出招將畸形教徒擊倒在地！他在哀嚎中化為一灘黑水。\n你從他的遺物中搜刮出了不少硬幣，並贏得了目擊者的讚許。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(35);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(10);
                        } else {
                            AyaGlobals.setStatus(
                                "教徒的動作極其怪異，你躲避不及被短刀劃傷，對方後來臉色鐵青的逃跑了。" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.hp -= AyaKits.rollDice(10);
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame -= AyaKits.rollDice(5);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(8);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "狼狽逃跑 ❌",
                    action: () => {
                        AyaGlobals.setStatus("你轉身狂奔才甩開了那名瘋子，但逃跑時不小心摔傷了。");
                        AyaGlobals.GameState.hp -= AyaKits.rollDice(5);
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Faceless_Merchant: {
        name: "🎭 無面者的密販",
        text: () => {
            return "廣場旁邊的密林角落裡坐著一位包裹在厚重斗篷下的神秘商販。\n" +
                "當他抬起頭時，你發現他的兜帽下沒有五官，只有一片虛無的黑洞。";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.charm + AyaGlobals.GameState.creativity;
                    },
                    event_lv : 10 * 2,
                    text: function() {
                        return "試圖與之心理博弈並交涉 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function() {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你的鎮定與談吐引起了無面者的興趣。他低聲吟誦後，贈予了些許金幣。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(50);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(5);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(5);
                            AyaGlobals.GameState.doom -= AyaKits.rollDice(3);
                        } else {
                            AyaGlobals.setStatus(
                                "無面者看穿了你的虛張聲勢，黑洞中傳出刺耳的神經噪音，強行剝奪了你的理智！" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(12);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(3);

                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "拒絕接觸 ❌",
                    action: () => {
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                        AyaGlobals.setStatus("你打了個冷顫，立刻遠離了那個令人不安的座位。");
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    },
    Portrait_In_Ash: {
        name: "🖼️ 灰燼中的自畫像",
        text: () => {
            return "酒館外被焚毀的廢墟中，懸掛著一幅完好無損的油畫。\n" +
                "畫中的人物輪廓正在不斷變化，最後竟然變成了你自己死狀慘烈的模樣！";
        },
        options: () => {
            let opts = [
                {
                    get self_confidence() {
                        return AyaGlobals.GameState.concentration + AyaGlobals.GameState.knowledge;
                    },
                    event_lv : 11 * 2,
                    text: function() {
                        return "強忍恐懼破解詛咒畫作 ✔️ " + `成功率：${Math.min(100, Math.floor(this.self_confidence * 100 / this.event_lv))}% 🎲`;
                    },
                    action: function() {
                        const event_dice = AyaKits.rollDice(this.event_lv);
                        if ((event_dice + this.self_confidence) >= this.event_lv) {
                            AyaGlobals.setStatus(
                                "你維持住高度的專注力，用秘術撕碎了畫作，破解了針對你的詛咒魔咒！\n畫框後方掉出了不少前人藏匿的金幣。" +
                                `\n檢定：${event_dice}+${this.self_confidence}>=${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.coin += AyaKits.rollDice(45);
                            AyaGlobals.GameState.sanity += AyaKits.rollDice(10);
                            AyaGlobals.GameState.fame += AyaKits.rollDice(5);
                        } else {
                            AyaGlobals.setStatus(
                                "油畫中自己的慘狀深深印入你的腦海，詛咒發作！你的精神遭受重創，末日預言進一步實現。" +
                                `\n檢定：${event_dice}+${this.self_confidence}<${this.event_lv} 🎲`
                            );
                            AyaGlobals.GameState.sanity -= AyaKits.rollDice(15);
                            AyaGlobals.GameState.doom += AyaKits.rollDice(3);
                        }
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                },
                {
                    text: "閉眼焚毀 ❌",
                    action: () => {
                        AyaGlobals.setStatus("你閉上雙眼點火燒掉了畫作，雖然避開了精神衝擊，但被飛濺的火星燙傷。");
                        AyaGlobals.GameState.hp -= AyaKits.rollDice(5);
                        AyaGlobals.GameState.sanity -= AyaKits.rollDice(3);
                    },
                    next: () => {
                        return `${AyaGlobals.GameState.location_save}`;
                    }
                }
            ];
            return opts;
        }
    }
};
//場景設定
AyaNarratives.locations = {
    Tavern_Room: {
        name: "🛌 綠石酒館二樓住所",
        text: () => {
            let base = "軟木塞拔開的沉悶聲、窗外遠處集市的喧鬧聲、微弱的晨光透過帶有綠苔的玻璃窗照進來。";
            if (!AyaGlobals.GameState.flags.metWorld) {
                base = "你在吱吱作響的木板床上睜開眼。\n空氣中瀰漫著綠石酒館特有的麥芽甜味與潮濕木頭的氣息。";
                base += "\n這裡是你在這個區域臨時租下的二樓房間，空間狹小，但足夠安全。";
                base += "\n是時候該去冒險者公會接受任務，你必須在出門前做好準備。";
                AyaGlobals.GameState.flags.metWorld = true;
            }
            // if(!AyaKits.audio.isPlaying){
            //     AyaKits.audio.changeTrack("wind_chimes.ogg", true, true);
            // }
            return base;
        },
        options: () => {
            let opts = [
                {
                    text: "休息 💤",
                    action: () => {
                        AyaGlobals.setStatus("你不知不覺的睡著了。\n但是被惡夢驚醒，你無法記得夢裡的回憶。");
                        AyaGlobals.GameState.hp += 100;
                        AyaGlobals.GameState.sanity += 100;
                        AyaGlobals.GameState.doom += AyaKits.rollDice(4);
                    },
                    next: () => {
                        return "Tavern_Room";
                    }
                },
                { text: "離開房間，前往一樓 🍺", next: "Tavern", action: () => { AyaGlobals.setStatus("你來到了綠石酒館。") } },
            ];
            return opts;
        }
    },
    Tavern: {
        name: "🍺 綠石酒館",
        text: () => {
            let base = "喧鬧的酒杯碰撞聲與吟遊詩人不成調的琴聲在空氣中交織。\n微黃的光暈從苔蘚螢光石與沉重鐵燈籠中滲出。";
            if (!AyaGlobals.GameState.flags.metTavern) {
                base = "推開房門，熱氣與酒氣撲面而來。";
                base += "\n一樓的酒館大廳早已坐半滿：";
                base += "\n矮人傭兵正大聲抱怨昨晚的黑啤酒，\n酒保綠石老爹正用一塊發黑的抹布用力擦拭吧檯。";
                AyaGlobals.GameState.flags.metTavern = true;
            }
            return base;
        },
        options: () => {
            let opts = [

                { text: "前往公會 🏟️", next: "Tavern_Room", action: () => { AyaGlobals.setStatus("你到達了冒險公會。") } },
                { text: "回到住所 🛌", next: "Tavern_Room", action: () => { AyaGlobals.setStatus("你回到了二樓住所。") } },
            ];

            opts.unshift(
                {
                    text: "探索四周 🎲",
                    next: () => {
                        AyaGlobals.GameState.doom += 1;
                        AyaGlobals.GameState.location_save = "Tavern";
                        // return AyaKits.getRandomEvent(tavern_single_events).key;
                        return "Meat_Problem";
                        // return "Abyss_Assassin";
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
            if (!AyaGlobals.GameState.flags.metAlys) {
                base = "一個穿著黑袍的刺客向你靠近，你也注意到黑暗處有人在注視著你們。";
            }
            if (AyaGlobals.GameState.flags.metAlys && !AyaGlobals.GameState.inventory.includes(ITEMS.ALYS)) {
                base = "黑暗處的黑影並沒有離開。";
            }

            return base;
        },
        options: () => {
            let opts = [
                { text: "往北邊行走 🏘️", next: "village_path_1" },
                { text: "向南方前進 ⛪", next: "village_path_3" },
            ];
            if (!AyaGlobals.GameState.flags.metAlys) {
                opts = [
                    {
                        text: "⚔️ 進入作戰", next: "random_battle",
                        action: () => {
                            AyaGlobals.GameState.flags.battleForAlys = true;
                            AyaGlobals.GameState.location_save = AyaGlobals.GameState.location;
                        }
                    },
                ];
            }
            if (AyaGlobals.GameState.flags.metAlys && !AyaGlobals.GameState.inventory.includes(ITEMS.ALYS)) {
                opts = [
                    { text: "💬 與黑影對話", next: AyaGlobals.GameState.location },
                ];
            }

            return opts;
        }
    },
    // 首次作戰💬🔥💪

    // 村莊廣場🧼❄️♨️🍽️🛎️📚📜💰🍻🍖🌿⚔️🛡️🗡️🏹🪓⛏️⚒️➶ 
    // 😴 💤🛏️🥪🌮🌯🍅🍎🍊🍇
    //🧤🥾👢🩰👡👠🥿👗👙💎💍📿🎶📓📃📙📘📗📕📔📖🪔🕯️🗝️🪑
    //💬👁️‍🗨️💭🌙☀️🌫️⛈️🌨️🌧️🌈❄️⛰️🏰🗝️🪑🧾✉️📄💰🍀
};

// 6 種結局設定
AyaNarratives.endings = {
    End_Test: {
        name: "🍎 結局測試",
        text: () => {
            return "結局測試。";
        },
        options: () => {
            let opts = [
                {
                    text: () => {
                        return "結局測試 ✔️ ";
                    },
                    action: () => {
                        AyaGlobals.setStatus(
                            "結局測試。"
                        );
                    },
                    next: () => {
                        return `End_Test`;
                    }
                },
            ];
            return opts;
        }
    },
    void: {
        title: "壞結局一：歸於虛無",
        text: "你最終沒能揭開這片土地的謎題。"+
        "\n你暴露在虛無的侵蝕下太久導致瘋狂，你的身體與靈魂被漸漸化為純粹的黑暗粒子。"+
        "\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    },
    dead: {
        title: "壞結局二：肉體損壞",
        text: "你最終沒能揭開這片土地的謎題。"+
        "\n你過度使用身體導致受傷過於嚴重，你的身體與靈魂被漸漸化為純粹的黑暗粒子。"+
        "\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    },
    doom: {
        title: "壞結局三：末日降臨",
        text: "你最終沒能揭開這片土地的謎題。"+
        "\n你虛度太多時光導致毒霧遽增覆蓋了整個地區，所有人的身體與靈魂被漸漸化為純粹的黑暗粒子。"+
        "\n世界上徹底抹消了你存在過的痕跡。沒有人記得你來過，連黑影也嫌棄地吹散了你的灰燼。"
    }
};