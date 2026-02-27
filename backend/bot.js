/* eslint-disable no-unused-vars */
/* eslint-disable no-useless-escape */

/*
· Pure WH/WB/Pray Bot with Human Behavior
· Zoo Tracking & Hidden Animal Detection
· Advanced Human Typing Simulation
· Original Captcha Protection System
· ONLY wh, wb, OwOpray COMMANDS
*/

process.emitWarning = (warning, type) => {
    if (type === "DeprecationWarning") return;
    console.warn(warning);
};

const fs = require("fs");
const path = require("path");
const { Client, WebhookClient } = require("discord.js-selfbot-v13");
const { exec } = require("child_process");

// ADVANCED HUMAN BEHAVIOR CONFIGURATION
const HUMAN_BEHAVIOR = {
    typing: {
        minDelay: 800,
        maxDelay: 3500,
        randomPauses: true,
        variableSpeed: true,
        thinkingTime: {
            short: 500,
            medium: 1200,
            long: 2500
        }
    },
    commands: {
        randomOrder: false,
        humanErrors: false,
        variableTiming: true
    }
};

// Animal tiers based on your chart + HIDDEN ANIMAL
const ANIMAL_TIERS = {
    'common': { rate: '58.8489%', xp: 1, emoji: '<:common:41652003771383808>', display: 'Common' },
    'uncommon': { rate: '30%', xp: 3, emoji: '🟢', display: 'Uncommon' },
    'rare': { rate: '10%', xp: 10, emoji: '🔵', display: 'Rare' },
    'epic': { rate: '1%', xp: 250, emoji: '🟣', display: 'Epic' },
    'mythical': { rate: '0.1%', xp: 5000, emoji: '🟠', display: 'Mythical' },
    'legendary': { rate: '0.5%', xp: 1000, emoji: '🟡', display: 'Legendary' },
    'fabled': { rate: '0.01%', xp: 50000, emoji: '🌟', display: 'Fabled' },
    'divine': { rate: '0.05%', xp: 15000, emoji: '💫', display: 'Divine' },
    'special': { rate: '???', xp: 30000, emoji: '🎯', display: 'Special' },
    'box': { rate: 'Depends', xp: 50000, emoji: '📦', display: 'Box' },
    'godly': { rate: '0.001%', xp: 300000, emoji: '👑', display: 'Godly' },
    'event': { rate: 'Depends', xp: 250000, emoji: '🎉', display: 'Event' },                                                    'hidden': { rate: '0.0001%', xp: 300000, emoji: '<a:hidden:459203677438083074>', display: 'Hidden' }                    };
                                                              // Load config - SAME CONFIG AS BEFORE (NO CHANGES)
let config;
try {                                                             config = require("./config.json");
} catch (error) {                                                 console.log("Config file missing! Creating default config...");                                                             config = {
        main: {
            token: "YOUR_USER_TOKEN_HERE",                                userid: "YOUR_USER_ID",
            commandschannelid: "YOUR_MAIN_CHANNEL_ID"                 },
        settings: {
            autoresume: true,                                             humanBehavior: HUMAN_BEHAVIOR,
            intervals: {
                wh: { min: 16000, max: 24000 },
                wb: { min: 17000, max: 26000 },
                pray: { min: 325000, max: 345000 }
            },
            prayConfig: {
                channelid: "YOUR_PRAY_CHANNEL_ID",
                targetUser: "SPECIFIC_USER_FOR_PRAY"
            },
            zooTracking: {
                enabled: true,
                save_file: "zoo_data.txt",
                webhook: {
                    enabled: true,
                    url: "https://discord.com/api/webhooks/YOUR_ZOO_WEBHOOK_ID/YOUR_ZOO_WEBHOOK_TOKEN",
                    update_interval: 10
                }
            },
            captcha: {
                autosolve: true,
                alerttype: {
                    desktop: {
                        notification: true,
                        prompt: true,                                                 force: false
                    },                                                            webhook: true,
                    webhookurl: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
                    termux: {
                        notification: true,                                           vibration: 3000,
                        toast: true                                               }
                }                                                         }
        }
    };                                                            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));                                                     }

const client = new Client({                                       checkUpdate: false,
    syncStatus: false
});

// Check if running in Termux
const isTermux = process.env.PREFIX && process.env.PREFIX.includes("com.termux");                                           
// Global state with Zoo Tracking - REMOVED OWO/UWUCOOKIE COUNTERS
let botState = {
    name: "PureWHWBBot",
    type: "Secondary",
    paused: false,                                                captchadetected: false,
    istermux: isTermux,
    total: {
        // REMOVED: owo and uwucookie counters
        wh: 0,                                                        wb: 0,
        pray: 0,
        captcha: 0,
        solvedcaptcha: 0
    },
    zoo: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        mythical: 0,
        legendary: 0,
        fabled: 0,
        divine: 0,
        special: 0,
        box: 0,
        godly: 0,
        event: 0,
        hidden: 0,
        total_caught: 0,
        total_xp: 0,
        last_update: 0,
        session_start: {
            common: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            mythical: 0,
            legendary: 0,
            fabled: 0,
            divine: 0,
            special: 0,
            box: 0,
            godly: 0,
            event: 0,
            hidden: 0,
            total_caught: 0,
            total_xp: 0
        }
    },
    intervals: {                                                      // REMOVED: owo/uwucookie interval
        wh: null,
        wb: null,                                                     pray: null
    },
    temp: {
        started: false,
        lastCommandTime: 0
    }
};

// ADVANCED HUMAN-LIKE UTILITY FUNCTIONS
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const humanDelay = (minMs = 800, maxMs = 3500) => {
    return delay(Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs);                                                  };
                                                              const simulateHumanTyping = async (channel, message) => {
    if (!config.settings.humanBehavior) return;               
    // Start typing indicator (like human pressing button)        await channel.sendTyping();                                                                                                 // Variable typing speed simulation
    const baseTime = message.length * 20;                         const variation = baseTime * 0.4;                             const totalTime = baseTime + (Math.random() * variation * 2 - variation);                                               
    // Simulate human typing rhythm                               const words = message.split(' ');
    let currentTime = 0;                                      
    for (let i = 0; i < words.length; i++) {                          const word = words[i];                                        const wordTime = word.length * 25;
                                                                      // Natural pause between words
        if (i > 0) {                                                      const pauseTime = 80 + Math.random() * 120;                   await delay(pauseTime);                                       currentTime += pauseTime;                                 }

        // Occasionally slightly longer pause (thinking)
        if (Math.random() < 0.1) {
            await delay(200 + Math.random() * 300);
            currentTime += 200 + Math.random() * 300;
        }

        currentTime += wordTime;                                  }
                                                                  // Ensure minimum typing time
    const remainingTime = totalTime - currentTime;                if (remainingTime > 0) {
        await delay(remainingTime);                               }
                                                                  return message;
};                                                            
// ZOO TRACKING FUNCTIONS                                     function detectAnimalTier(messageContent) {
    const content = messageContent.toLowerCase();

    // Check for HIDDEN animal first (most rare)                  if (content.includes('hidden') && content.includes('<a:hidden:459203677438083074>')) {
        return 'hidden';
    }

    // Check for common pattern                                   if (content.includes('common') && content.includes('<:common:41652003771383808>')) {
        return 'common';                                          }

    // Check other tiers by keywords                              const tierKeywords = {
        'uncommon': ['uncommon'],
        'rare': ['rare'],
        'epic': ['epic'],                                             'mythical': ['mythical'],
        'legendary': ['legendary'],                                   'fabled': ['fabled'],
        'divine': ['divine'],                                         'special': ['special'],
        'box': ['box'],                                               'godly': ['godly'],
        'event': ['event']
    };

    for (const [tier, keywords] of Object.entries(tierKeywords)) {
        if (keywords.some(keyword => content.includes(keyword))) {
            return tier;
        }                                                         }

    return null;
}                                                                                                                           function updateZooStats(tier) {
    if (!ANIMAL_TIERS[tier]) return;
                                                                  botState.zoo[tier]++;                                         botState.zoo.total_caught++;
    botState.zoo.total_xp += ANIMAL_TIERS[tier].xp;

    // Update session stats
    botState.zoo.session_start[tier]++;
    botState.zoo.session_start.total_caught++;                    botState.zoo.session_start.total_xp += ANIMAL_TIERS[tier].xp;

    botState.zoo.last_update = Date.now();                    
    console.log(`🎯 Animal Caught: ${tier} (+${ANIMAL_TIERS[tier].xp} XP)`);
    console.log(`📊 Zoo Stats: ${botState.zoo.total_caught} total animals, ${botState.zoo.total_xp} total XP`);             
    // Special celebration for HIDDEN animal                      if (tier === 'hidden') {
        console.log(`🎉🎉🎉 ULTRA RARE HIDDEN ANIMAL CAUGHT!  🎉🎉🎉`);
        console.log(`🎉 This is extremely rare (0.0001% chance)! 🎉`);
                                                                      // Send special webhook for HIDDEN
        sendZooWebhook("hidden_animal", {
            tier: tier,
            xp: ANIMAL_TIERS[tier].xp,                                    rate: ANIMAL_TIERS[tier].rate,                                emoji: ANIMAL_TIERS[tier].emoji
        });
    }

    // Auto-save after each catch
    if (config.settings.zooTracking?.enabled) {
        saveZooDataSimple();
    }
}
                                                              function getZooFileName() {
    return "zoo_data_whwbbot.txt";                            }
                                                              function loadZooData() {
    const fileName = getZooFileName();
                                                                  try {
        if (fs.existsSync(fileName)) {                                    const data = fs.readFileSync(fileName, 'utf8');
            const lines = data.split('\n').filter(line => line.trim());

            console.log(`📁 Loading zoo data from ${fileName}...`);
                                                                          // Reset session data
            Object.keys(botState.zoo.session_start).forEach(key => {                                                                        botState.zoo.session_start[key] = 0;
            });

            // Parse each line
            lines.forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':').map(part => part.trim());
                    const tier = key.toLowerCase();

                    if (ANIMAL_TIERS[tier] && !isNaN(parseInt(value))) {
                        const count = parseInt(value);
                        botState.zoo[tier] = count;
                        botState.zoo.total_caught += count;                           botState.zoo.total_xp += count * ANIMAL_TIERS[tier].xp;                                                                 }
                }                                                         });

            console.log(`✅ Zoo data loaded: ${botState.zoo.total_caught} total animals`);
            return true;                                              }
    } catch (error) {                                                 console.error(`❌ Error loading zoo data:`, error.message);
    }                                                         
    return false;                                             }

function saveZooDataSimple() {                                    if (!config.settings.zooTracking?.enabled) return false;

    const fileName = getZooFileName();

    try {
        let fileContent = `ZOO DATA WH/WB BOT - ${new Date().toLocaleString()}\n\n`;

        // Simple format for easy parsing
        for (const [tier, data] of Object.entries(ANIMAL_TIERS)) {
            fileContent += `${data.display}: ${botState.zoo[tier]}\n`;
        }                                                     
        fileContent += `\nTotal: ${botState.zoo.total_caught}\n`;
        fileContent += `Total XP: ${botState.zoo.total_xp}\n`;        fileContent += `Session Caught: ${botState.zoo.session_start.total_caught}\n`;                                              fileContent += `Session XP: ${botState.zoo.session_start.total_xp}\n`;
                                                                      // Add hidden animal achievement note
        if (botState.zoo.hidden > 0) {                                    fileContent += `\n🎉 HIDDEN Animals: ${botState.zoo.hidden} (ULTRA RARE!)\n`;                                           }

        fs.writeFileSync(fileName, fileContent);
        return true;
    } catch (error) {
        console.error(`❌ Error saving zoo data:`, error.message);
        return false;                                             }
}

async function sendZooWebhook(eventType, data = {}) {
    if (!config.settings.zooTracking?.webhook?.enabled) return;

    try {                                                             const webhookClient = new WebhookClient({                         url: config.settings.zooTracking.webhook.url
        });                                                   
        let message, username;
                                                                      if (eventType === "hidden_animal") {                              message = `# 🎉🎉🎉 ULTRA RARE HIDDEN ANIMAL CAUGHT! 🎉🎉🎉\n`;
            message += `@everyone @here\n`;
            message += `**User:** ${client.user.username} (WH/WB Bot)\n`;
            message += `**Animal:** 🎭 HIDDEN ${data.emoji}\n`;
            message += `**XP Gained:** 🎊 ${data.xp} XP 🎊\n`;
            message += `**Rate:** ${data.rate} (EXTREMELY RARE!)\n`;
            message += `**Time:** ${new Date().toLocaleString()}\n\n`;
            message += `**Total HIDDEN Animals:** ${botState.zoo.hidden}\n`;
            message += `**Total Animals:** ${botState.zoo.total_caught}\n\n`;                                                           message += `🎊 **CONGRATULATIONS! THIS IS EXTREMELY RARE!** 🎊\n`;                                                          message += `You are one of the lucky few to catch a HIDDEN animal!`;                                                        username = "🎉 ULTRA RARE HIDDEN! (WH/WB Bot)";
        }                                                     
        if (message) {
            await webhookClient.send({                                        content: message,
                username: username,                                           avatarURL: client.user.displayAvatarURL()
            });                                                           console.log(`📢 Zoo webhook sent: ${eventType}`);
        }
    } catch (error) {
        console.error(`❌ Failed to send zoo webhook:`, error.message);
    }
}

// HUMAN-LIKE COMMAND SCHEDULER
class AdvancedHumanScheduler {
    constructor() {
        this.lastExecution = 0;
        this.commandHistory = [];
    }

    async executeWithHumanBehavior(type, executeFn) {
        const now = Date.now();
        const minDelay = config.settings.humanBehavior.typing.minDelay;
        const maxDelay = config.settings.humanBehavior.typing.maxDelay;
        const timeSinceLast = now - this.lastExecution;
        const requiredDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        if (timeSinceLast < requiredDelay) {
            await delay(requiredDelay - timeSinceLast);
        }

        try {
            await executeFn();
            this.lastExecution = Date.now();
            this.commandHistory.push({ type, timestamp: now });

            // Random extended pause (like human getting distracted)
            if (config.settings.humanBehavior.typing.randomPauses && Math.random() < 0.08) {
                await delay(3000 + Math.random() * 7000);
            }
        } catch (error) {
            console.error(`Error executing ${type}:`, error);
        }
    }

    getRandomInterval(type) {
        const intervalConfig = config.settings.intervals[type];
        if (intervalConfig.min && intervalConfig.max) {
            return Math.floor(Math.random() * (intervalConfig.max - intervalConfig.min + 1)) + intervalConfig.min;
        }
        return intervalConfig;
    }
}

const humanScheduler = new AdvancedHumanScheduler();

// ORIGINAL CAPTCHA SYSTEM FUNCTIONS
function isWebCaptchaMessage(msgcontent, helloChristopher, canulickmymonster) {
    const suspiciousPhrases = [".com", "please use the link"];
    const hasSuspiciousContent = suspiciousPhrases.some((phrase) =>                                                                 msgcontent.includes(phrase),                              );
    return hasSuspiciousContent || helloChristopher || canulickmymonster;                                                   }
                                                              // ORIGINAL TERMUX NOTIFICATION FUNCTION
async function sendTermuxNotification(type, client) {             if (!client.global.istermux) return;

    try {
        if (type === "captcha_detected") {
            if (client.config.settings.captcha.alerttype.termux.notification) {                                                             const notificationCmd = `termux-notification --title "🚨 CAPTCHA DETECTED" --content "Click to open captcha page → https://owobot.com/captcha" --priority max --button1 "OPEN CAPTCHA" --button1-action "termux-open-url https://owobot.com/captcha" --button2 "DISMISS" --button2-action "" --ongoing --led-color FF0000`;
                exec(notificationCmd);                                    }
                                                                          setTimeout(() => {
                if (client.config.settings.captcha.alerttype.termux.vibration) {                                                                let vibrationTime = client.config.settings.captcha.alerttype.termux.vibration;                                              if (isNaN(vibrationTime) || vibrationTime < 1000) vibrationTime = 3000;
                    exec(`termux-vibrate -d ${vibrationTime}`);
                }
            }, 500);

            setTimeout(() => {
                if (client.config.settings.captcha.alerttype.termux.toast) {
                    exec(`termux-toast -b red -c white "🚨 CAPTCHA! Open: https://owobot.com/captcha"`);
                }
            }, 1000);

            setTimeout(() => {
                exec(`termux-open-url "https://owobot.com/captcha"`);
            }, 2000);
        } else if (type === "captcha_solved") {
            exec(`termux-notification --id captcha_alert --cancel`, () => {});

            if (client.config.settings.captcha.alerttype.termux.notification) {
                const notificationCmd = `termux-notification --title "✅ CAPTCHA SOLVED" --content "${client.user.username} - Bot resuming..." --priority default`;
                exec(notificationCmd);
            }

            if (client.config.settings.captcha.alerttype.termux.toast) {
                const toastCmd = `termux-toast -b green -c black "✅ CAPTCHA SOLVED"`;
                exec(toastCmd);
            }
        }
    } catch (error) {
        console.error("❌ Termux notification error:", error);    }
}

// ORIGINAL WEBHOOK NOTIFICATION FUNCTION
async function sendWebhookNotification(type, client) {
    if (!client.config.settings.captcha.alerttype.webhook ||
        !client.config.settings.captcha.alerttype.webhookurl ||
        client.config.settings.captcha.alerttype.webhookurl.length < 10) {
        console.log("🔕 Webhook disabled or URL not set");
        return;
    }

    try {
        const webhookClient = new WebhookClient({
            url: client.config.settings.captcha.alerttype.webhookurl
        });

        let message, username;

        if (type === "captcha_detected") {
            message = `# 🔴 CAPTCHA DETECTED 🔴\n`;                       message += `|@everyone @here| ${client.user.username}\n`;
            message += `**Type:** ${client.global.type}\n`;
            message += `**Total Captchas:** ${client.global.total.captcha}\n`;
            message += `**Time:** ${new Date().toLocaleString()}\n\n`;
            message += `🔗 **CAPTCHA LINK:** https://owobot.com/captcha\n\n`;

            if (!client.config.settings.autoresume) {
                message += `**Action Required:** Use \`${client.config.settings.prefix}resume\` after solving captcha\n`;               } else {
                message += `**Auto Resume:** Enabled - Bot will resume automatically after captcha solve\n`;
            }

            message += `\n⚠️ **CLICK THE LINK ABOVE AND SOLVE CAPTCHA IMMEDIATELY!** ⚠️`;
            username = "🚨 Captcha Alert - WH/WB Bot";

        } else if (type === "captcha_solved") {
            message = `# 🟢 CAPTCHA SOLVED 🟢\n`;
            message += `@everyone @here| ${client.user.username}\n`;
            message += `**Type:** ${client.global.type}\n`;
            message += `**Total Solved:** ${client.global.total.solvedcaptcha}\n`;
            message += `**Time:** ${new Date().toLocaleString()}\n`;
            message += `**Status:** Bot has been resumed automatically`;
            username = "✅ Captcha Solved - WH/WB Bot";               }

        await webhookClient.send({
            content: message,
            username: username,
            avatarURL: client.user.displayAvatarURL()
        });

        console.log(`📢 ${type === 'captcha_detected' ? 'Webhook alert' : 'Webhook solved notification'} sent successfully!`);
    } catch (webhookError) {
        console.error(`❌ Failed to send ${type} webhook:`, webhookError.message);
    }
}

// Setup client                                               client.config = config;
client.basic = config.main;
client.delay = delay;
client.humanDelay = humanDelay;
client.simulateHumanTyping = simulateHumanTyping;             client.global = botState;

// PURE WH/WB/PRAY COMMANDS ONLY - NO OWO/UWUCOOKIE
function startPureCommands() {
    // Stop existing intervals
    Object.values(client.global.intervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });

    // REMOVED: owo/uwucookie interval completely

    // wh command with human variation
    client.global.intervals.wh = setInterval(async () => {
        if (!client.global.paused && !client.global.captchadetected) {                                                                  await humanScheduler.executeWithHumanBehavior('wh', async () => {                                                               try {
                    const channel = client.channels.cache.get(client.basic.commandschannelid);
                    if (channel) {
                        await simulateHumanTyping(channel, "wh");
                        await channel.send("wh");
                        client.global.total.wh++;

                        console.log(`[${new Date().toLocaleTimeString()}] 🤖 wh sent (Human-like) - Total: ${client.global.total.wh}`);
                    }
                } catch (error) {
                    console.error("Error sending wh:", error);
                }
            });
        }
    }, humanScheduler.getRandomInterval('wh'));

    // wb command with human timing
    client.global.intervals.wb = setInterval(async () => {
        if (!client.global.paused && !client.global.captchadetected) {
            await humanScheduler.executeWithHumanBehavior('wb', async () => {                                                               try {
                    const channel = client.channels.cache.get(client.basic.commandschannelid);
                    if (channel) {
                        await simulateHumanTyping(channel, "wb");
                        await channel.send("wb");
                        client.global.total.wb++;

                        console.log(`[${new Date().toLocaleTimeString()}] 🤖 wb sent (Human-like) - Total: ${client.global.total.wb}`);
                    }
                } catch (error) {                                                 console.error("Error sending wb:", error);
                }
            });
        }                                                         }, humanScheduler.getRandomInterval('wb'));

    // PRAY COMMAND - Specific channel & user with human behavior
    if (client.config.settings.prayConfig) {
        const prayConfig = client.config.settings.prayConfig;
        client.global.intervals.pray = setInterval(async () => {
            if (!client.global.paused && !client.global.captchadetected) {
                await humanScheduler.executeWithHumanBehavior('pray', async () => {
                    try {
                        const prayChannel = client.channels.cache.get(prayConfig.channelid);
                        if (prayChannel) {
                            // Longer human-like delay for pray (more thoughtful)
                            await humanDelay(1500, 4000);
                            await simulateHumanTyping(prayChannel, `OwOpray ${prayConfig.targetUser}`);
                            await prayChannel.send(`OwOpray ${prayConfig.targetUser}`);
                            client.global.total.pray++;

                            console.log(`[${new Date().toLocaleTimeString()}] 🙏 Pray sent to ${prayConfig.targetUser} - Total: ${client.global.total.pray}`);                                                    }
                    } catch (error) {
                        console.error("Error sending pray:", error);
                    }
                });
            }
        }, humanScheduler.getRandomInterval('pray'));             }
                                                                  console.log("🦊 PURE WH/WB/PRAY BOT Started!");
    console.log("✨ Features: Advanced human typing, no owo/uwucookie, silent operation");
    console.log("🔧 Commands: wh, wb, OwOpray (specific user)");
    console.log("🚫 REMOVED: owo and Uwucookie commands completely");
}                                                             
// Make available globally                                    client.startAutoCommands = startPureCommands;
                                                              // MESSAGE EVENT HANDLER WITH ZOO TRACKING & ORIGINAL CAPTCHA SYSTEM                                                        client.on('messageCreate', async (message) => {
    // ZOO TRACKING - Detect animal catches                       if (message.author.id === "408785106942164992" &&
        message.content.includes('caught a') &&                       message.content.includes('gained') &&
        config.settings.zooTracking?.enabled) {               
        const tier = detectAnimalTier(message.content);               if (tier) {
            updateZooStats(tier);                             
            // Human-like reaction delay                                  await humanDelay(500, 2000);
                                                                          console.log(`🎯 Animal detected: ${tier} (+${ANIMAL_TIERS[tier].xp} XP)`);                                              }
    }                                                         
    // ORIGINAL CAPTCHA DETECTION SYSTEM                          if (message.author.id === "408785106942164992") {
        let rawmsgcontent = message.content.toLowerCase();            let channeltype = message.channel.type;
        let msgcontent = removeInvisibleChars(rawmsgcontent);         let helloChristopher, canulickmymonster;

        const CHANNEL_IDS = [client.basic.commandschannelid]; 
        if (
            CHANNEL_IDS.includes(message.channel.id) &&
            message.content.toLowerCase().includes(`<@${client.user.id}>`) &&
            (msgcontent.includes("please complete your captcha") ||
                msgcontent.includes("verify that you are human") ||
                msgcontent.includes("are you a real human") ||
                msgcontent.includes("i​t m​ay resu​lt i​n a​ ban") ||
                msgcontent.includes("p​lease complet​e thi​s with​in 1​0 m​inutes") ||
                msgcontent.includes("please use the link below so i can check") ||                                                          msgcontent.includes("captcha")) &&
            !client.global.captchadetected
        ) {
            client.global.paused = true;
            client.global.captchadetected = true;
            client.global.total.captcha++;

            console.log("🚨 CAPTCHA DETECTED! 🚨");
            console.log(`Total Captchas: ${client.global.total.captcha}`);
            console.log("Bot has been paused automatically");

            if (message.components && message.components.length > 0 && message.components[0].components[0]) {
                helloChristopher = message.components[0].components.find(
                    (button) => button.url && button.url.toLowerCase().includes("owobot.com")
                );
                canulickmymonster = message.components[0].components[0].url &&
                    message.components[0].components[0].url.toLowerCase().includes("owobot.com");
            }

            // Send BOTH notifications (ORIGINAL SYSTEM)
            console.log("🔄 Sending alerts...");
            await sendWebhookNotification("captcha_detected", client);
            await sendTermuxNotification("captcha_detected", client);

            // Auto-solve captcha if enabled
            if (client.config.settings.captcha.autosolve &&
                isWebCaptchaMessage(msgcontent, helloChristopher, canulickmymonster)) {
                console.log("Auto-solving captcha...");
                // Add your captcha auto-solve logic here
            }
        }

        // Check if captcha is solved
        if (msgcontent.includes("i have verified") && channeltype === "DM") {                                                           client.global.captchadetected = false;
            client.global.total.solvedcaptcha++;

            console.log("✅ CAPTCHA SOLVED!");
            console.log(`Solved Captchas: ${client.global.total.solvedcaptcha}`);

            // Send BOTH solved notifications (ORIGINAL SYSTEM)
            await sendWebhookNotification("captcha_solved", client);
            await sendTermuxNotification("captcha_solved", client);

            if (client.config.settings.autoresume) {
                client.global.paused = false;
                console.log("Bot resuming automatically...");
                startPureCommands(); // Restart auto commands
            } else {
                console.log(`Use ${client.config.settings.prefix}resume to restart the bot`);
            }
        }
    }                                                         });

// Client ready event                                         client.on('ready', async () => {
    console.log(`✅ PURE WH/WB/PRAY BOT - Logged in as ${client.user.tag}!`);
    console.log(`📱 Running in Termux: ${client.global.istermux ? 'Yes' : 'No'}`);
    console.log(`🦊 Human Behavior: Advanced Typing Simulation`);
    console.log(`🔔 Webhook Alerts: ${client.config.settings.captcha.alerttype.webhook ? 'Enabled' : 'Disabled'}`);
    console.log(`🐾 Zoo Tracking: ${config.settings.zooTracking?.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`🎯 COMMANDS: ONLY wh, wb, OwOpray`);
    console.log(`🚫 REMOVED: owo and Uwucookie commands completely`);

    // Load existing zoo data
    if (config.settings.zooTracking?.enabled) {
        loadZooData();
        console.log("🐾 Zoo tracking system activated with file saving");

        if (botState.zoo.hidden > 0) {
            console.log(`🎉 You have ${botState.zoo.hidden} HIDDEN animal(s)! 🎉`);
        }
    }

    if (!client.global.temp.started) {
        client.global.temp.started = true;
        startPureCommands();
    }
});

// Error handling
client.on('error', (error) => {                                   console.error('❌ PURE WH/WB BOT Client error:', error);
});

// Auto-save zoo data every 5 minutes
setInterval(() => {                                               if (config.settings.zooTracking?.enabled && client.user) {
        saveZooDataSimple();                                          console.log("💾 Auto-saved WH/WB BOT zoo data");
    }
}, 5 * 60 * 1000);

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping PURE WH/WB BOT...');

    // Save zoo data before shutdown
    if (config.settings.zooTracking?.enabled) {
        saveZooDataSimple();
        console.log("💾 WH/WB BOT Zoo data saved before shutdown");
    }

    Object.values(client.global.intervals).forEach(interval => {
        if (interval) clearInterval(interval);
    });
    client.destroy();
    process.exit(0);
});

// Login                                                      client.login(config.main.token).catch(error => {
    console.error('PURE WH/WB BOT Login failed:', error);         process.exit(1);
});                                                           
// Utility function                                           const removeInvisibleChars = (str) => str.replace(/[^\x20-\x7E]/g, '');
