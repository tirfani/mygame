require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.join(__dirname, 'users.json');
const MAX_BOTS = 5;

// Frontend URL (Netlify)
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

// Ensure users.json exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
}

// Helper: read users
function readUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

// Helper: write users
function writeUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
}

// In-memory process tracking
const runningBots = new Map();

// ---------- Middleware ----------
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        secure: process.env.NODE_ENV === 'production', // true on Render (HTTPS)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Helper to get user's bot folder
function getUserBotFolder(userId) {
    const folder = path.join(__dirname, 'bots', `user_${userId}`);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    return folder;
}

// Generate config for a user
function generateConfig(user) {
    return {
        main: {
            token: user.token,
            userid: user.user_id,
            commandschannelid: user.cmd_channel
        },
        settings: {
            autoresume: true,
            humanBehavior: {
                typing: {
                    minDelay: 800, maxDelay: 3500, randomPauses: true, variableSpeed: true,
                    thinkingTime: { short: 500, medium: 1200, long: 2500 }
                },
                commands: { randomOrder: false, humanErrors: false, variableTiming: true }
            },
            intervals: {
                wh: { min: 16000, max: 24000 },
                wb: { min: 17000, max: 26000 },
                pray: { min: 325000, max: 345000 }
            },
            prayConfig: {
                channelid: user.pray_channel,
                targetUser: user.pray_target
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
                    desktop: { notification: true, prompt: true, force: false },
                    webhook: true,
                    webhookurl: "https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN",
                    termux: { notification: true, vibration: 3000, toast: true }
                }
            }
        }
    };
}

// ---------- Routes ----------

// Register
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: 'Email and password required' });

    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        token: '',
        user_id: '',
        cmd_channel: '',
        pray_channel: '',
        pray_target: ''
    };
    users.push(newUser);
    writeUsers(users);
    res.json({ success: true, message: 'Registration successful' });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.json({ success: false, message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ success: false, message: 'Invalid email or password' });

    req.session.userId = user.id;
    res.json({ success: true });
});

// Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Get current user
app.get('/api/user', (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });
    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    if (!user) return res.json({ loggedIn: false });
    const { password, ...safeUser } = user;
    res.json({ loggedIn: true, user: safeUser });
});

// Update bot config
app.post('/api/config', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Not logged in' });
    const { token, user_id, cmd_channel, pray_channel, pray_target } = req.body;
    const users = readUsers();
    const index = users.findIndex(u => u.id === req.session.userId);
    if (index === -1) return res.json({ success: false, message: 'User not found' });

    users[index].token = token || '';
    users[index].user_id = user_id || '';
    users[index].cmd_channel = cmd_channel || '';
    users[index].pray_channel = pray_channel || '';
    users[index].pray_target = pray_target || '';
    writeUsers(users);
    res.json({ success: true });
});

// Start bot
app.post('/api/bot/start', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Not logged in' });

    if (runningBots.size >= MAX_BOTS) {
        return res.json({ success: false, message: `Maximum ${MAX_BOTS} bots already running. Please stop another bot first.` });
    }

    const users = readUsers();
    const user = users.find(u => u.id === req.session.userId);
    if (!user) return res.json({ success: false, message: 'User not found' });

    if (!user.token || !user.user_id || !user.cmd_channel || !user.pray_channel || !user.pray_target) {
        return res.json({ success: false, message: 'Please save your bot configuration first' });
    }

    if (runningBots.has(user.id)) {
        return res.json({ success: false, message: 'Bot is already running' });
    }

    // Prepare bot folder
    const botFolder = getUserBotFolder(user.id);

    // Write config.json
    const config = generateConfig(user);
    fs.writeFileSync(path.join(botFolder, 'config.json'), JSON.stringify(config, null, 4));

    // Copy bot.js (assuming it's in root)
    const sourceBotJs = path.join(__dirname, 'bot.js');
    const targetBotJs = path.join(botFolder, 'bot.js');
    if (!fs.existsSync(targetBotJs)) {
        fs.copyFileSync(sourceBotJs, targetBotJs);
    }

    // Spawn process
    const botProcess = spawn('node', ['bot.js'], {
        cwd: botFolder,
        stdio: ['ignore', 'pipe', 'pipe']
    });

    runningBots.set(user.id, botProcess);

    botProcess.stdout.on('data', (data) => {
        console.log(`[User ${user.id}] ${data}`);
    });
    botProcess.stderr.on('data', (data) => {
        console.error(`[User ${user.id} ERROR] ${data}`);
    });

    botProcess.on('close', (code) => {
        console.log(`[User ${user.id}] bot exited with code ${code}`);
        runningBots.delete(user.id);
    });

    res.json({ success: true, message: 'Bot started' });
});

// Stop bot
app.post('/api/bot/stop', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ success: false, message: 'Not logged in' });

    const botProcess = runningBots.get(req.session.userId);
    if (!botProcess) return res.json({ success: false, message: 'Bot not running' });

    botProcess.kill();
    runningBots.delete(req.session.userId);
    res.json({ success: true, message: 'Bot stopped' });
});

// Get bot status
app.get('/api/bot/status', (req, res) => {
    if (!req.session.userId) return res.json({ running: false });
    res.json({ running: runningBots.has(req.session.userId) });
});

// Global stats
app.get('/api/stats', (req, res) => {
    res.json({ runningCount: runningBots.size, maxBots: MAX_BOTS });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Accepting requests from: ${FRONTEND_URL}`);
});
