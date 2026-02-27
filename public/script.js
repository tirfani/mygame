const apiBase = ''; // same origin

const statusText = document.getElementById('statusText');
const refreshBtn = document.getElementById('refreshBtn');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const messageBox = document.getElementById('messageBox');

// Fetch bot status
async function fetchStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.running) {
            statusText.textContent = '🟢 Running';
            statusText.className = 'status-running';
        } else {
            statusText.textContent = '🔴 Stopped';
            statusText.className = 'status-stopped';
        }
    } catch (err) {
        statusText.textContent = '❌ Error';
    }
}

// Show message
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 5000);
}

// Start bot
startBtn.addEventListener('click', async () => {
    const token = document.getElementById('token').value.trim();
    const userid = document.getElementById('userid').value.trim();
    const cmdChannel = document.getElementById('cmdChannel').value.trim();
    const prayChannel = document.getElementById('prayChannel').value.trim();
    const prayUser = document.getElementById('prayUser').value.trim();

    if (!token || !userid || !cmdChannel || !prayChannel || !prayUser) {
        showMessage('❌ All fields are required!', 'error');
        return;
    }

    startBtn.disabled = true;
    stopBtn.disabled = false;
    showMessage('Starting bot...', 'success');

    try {
        const res = await fetch('/api/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, userid, cmdChannel, prayChannel, prayUser })
        });
        const data = await res.json();
        if (data.success) {
            showMessage('✅ Bot started successfully!', 'success');
            fetchStatus();
        } else {
            showMessage('❌ ' + data.message, 'error');
            startBtn.disabled = false;
        }
    } catch (err) {
        showMessage('❌ Failed to start bot', 'error');
        startBtn.disabled = false;
    }
});

// Stop bot
stopBtn.addEventListener('click', async () => {
    stopBtn.disabled = true;
    try {
        const res = await fetch('/api/stop', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            showMessage('⏹️ Bot stopped', 'success');
            fetchStatus();
        } else {
            showMessage('❌ ' + data.message, 'error');
        }
    } catch (err) {
        showMessage('❌ Failed to stop bot', 'error');
    }
    stopBtn.disabled = false;
    startBtn.disabled = false;
});

refreshBtn.addEventListener('click', fetchStatus);

// Initial status check
fetchStatus();
setInterval(fetchStatus, 5000); // refresh every 5 sec
