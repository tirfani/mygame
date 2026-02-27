// Load user data and status
async function loadUser() {
    const res = await fetch('/api/user');
    const data = await res.json();
    if (!data.loggedIn) {
        window.location.href = '/';
        return;
    }
    // Fill form
    document.getElementById('token').value = data.user.token || '';
    document.getElementById('user_id').value = data.user.user_id || '';
    document.getElementById('cmd_channel').value = data.user.cmd_channel || '';
    document.getElementById('pray_channel').value = data.user.pray_channel || '';
    document.getElementById('pray_target').value = data.user.pray_target || '';
}

// Load bot status
async function loadStatus() {
    const res = await fetch('/api/bot/status');
    const data = await res.json();
    const statusEl = document.getElementById('botStatus');
    if (data.running) {
        statusEl.textContent = '🟢 Running';
        statusEl.style.color = '#00b894';
    } else {
        statusEl.textContent = '🔴 Stopped';
        statusEl.style.color = '#d63031';
    }
}

// Load global stats
async function loadStats() {
    const res = await fetch('/api/stats');
    const data = await res.json();
    document.getElementById('globalCount').textContent = data.runningCount;
}

// Save config
document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('token').value;
    const user_id = document.getElementById('user_id').value;
    const cmd_channel = document.getElementById('cmd_channel').value;
    const pray_channel = document.getElementById('pray_channel').value;
    const pray_target = document.getElementById('pray_target').value;

    const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, user_id, cmd_channel, pray_channel, pray_target })
    });
    const data = await res.json();
    if (data.success) {
        showMessage('✅ Config saved', 'success');
    } else {
        showMessage('❌ Error saving config', 'error');
    }
});

// Start bot
document.getElementById('startBtn').addEventListener('click', async () => {
    const res = await fetch('/api/bot/start', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        showMessage('✅ Bot started', 'success');
        loadStatus();
        loadStats();
    } else {
        showMessage('❌ ' + data.message, 'error');
    }
});

// Stop bot
document.getElementById('stopBtn').addEventListener('click', async () => {
    const res = await fetch('/api/bot/stop', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
        showMessage('⏹️ Bot stopped', 'success');
        loadStatus();
        loadStats();
    } else {
        showMessage('❌ ' + data.message, 'error');
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/';
});

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    setTimeout(() => msg.textContent = '', 3000);
}

// Initial load
loadUser();
loadStatus();
loadStats();
setInterval(loadStats, 5000);
