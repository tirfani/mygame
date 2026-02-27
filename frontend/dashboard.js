const API_BASE = 'https://mygame-ag53.onrender.com'; // <-- CHANGE THIS

async function loadUser() {
    const res = await fetch(`${API_BASE}/api/user`, { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) {
        window.location.href = '/';
        return;
    }
    document.getElementById('token').value = data.user.token || '';
    document.getElementById('user_id').value = data.user.user_id || '';
    document.getElementById('cmd_channel').value = data.user.cmd_channel || '';
    document.getElementById('pray_channel').value = data.user.pray_channel || '';
    document.getElementById('pray_target').value = data.user.pray_target || '';
}

async function loadStatus() {
    const res = await fetch(`${API_BASE}/api/bot/status`, { credentials: 'include' });
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

async function loadStats() {
    const res = await fetch(`${API_BASE}/api/stats`);
    const data = await res.json();
    document.getElementById('globalCount').textContent = data.runningCount;
}

document.getElementById('configForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('token').value;
    const user_id = document.getElementById('user_id').value;
    const cmd_channel = document.getElementById('cmd_channel').value;
    const pray_channel = document.getElementById('pray_channel').value;
    const pray_target = document.getElementById('pray_target').value;
    const res = await fetch(`${API_BASE}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, user_id, cmd_channel, pray_channel, pray_target })
    });
    const data = await res.json();
    if (data.success) {
        showMessage('✅ Config saved', 'success');
    } else {
        showMessage('❌ Error saving config', 'error');
    }
});

document.getElementById('startBtn').addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/api/bot/start`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
        showMessage('✅ Bot started', 'success');
        loadStatus();
        loadStats();
    } else {
        showMessage('❌ ' + data.message, 'error');
    }
});

document.getElementById('stopBtn').addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/api/bot/stop`, { method: 'POST', credentials: 'include' });
    const data = await res.json();
    if (data.success) {
        showMessage('⏹️ Bot stopped', 'success');
        loadStatus();
        loadStats();
    } else {
        showMessage('❌ ' + data.message, 'error');
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = '/';
});

function showMessage(text, type) {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    setTimeout(() => msg.textContent = '', 3000);
}

loadUser();
loadStatus();
loadStats();
setInterval(loadStats, 5000);
