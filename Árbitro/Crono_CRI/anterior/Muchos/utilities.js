function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    const countdownDisplay = document.getElementById('current-time-value');
    if (countdownDisplay) countdownDisplay.textContent = timeStr;
    const systemTimeDisplay = document.getElementById('current-system-time');
    if (systemTimeDisplay) systemTimeDisplay.textContent = timeStr;
}

function updateTotalTime() {
    if (!appState.raceStartTime) return;
    const elapsed = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    const display = document.getElementById('total-time-value');
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => messageDiv.style.display = 'none', 3000);
}

function saveLastUpdate() { localStorage.setItem('countdown-last-update', Date.now().toString()); }

function canModifyDuringCountdown() {
    const t = translations[appState.currentLanguage];
    if (!appState.countdownActive) return true;
    if (appState.countdownValue <= 15) { showMessage(t.waitCountdownEnd, 'warning'); return false; }
    return true;
}

function pauseCountdownVisual() { appState.countdownPaused = true; appState.configModalOpen = true; }

function resumeCountdownVisual() { appState.countdownPaused = false; appState.configModalOpen = false; }

function keepScreenAwake() {
    if (!appState.countdownActive) return;
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then(wakeLock => console.log('Wake Lock activado')).catch(err => console.log('Wake Lock no disponible:', err));
    }
    const video = document.getElementById('keep-alive-video');
    if (video) { video.loop = true; video.play().catch(e => console.log('Video keep-alive falló:', e)); }
    if (navigator.vibrate) navigator.vibrate(0);
}

function adjustCountdownSize() {
    const display = document.getElementById('countdown-display');
    if (!display) return;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isAggressive = document.getElementById('countdown-screen').classList.contains('aggressive-numbers');
    let fontSize;
    const minDimension = Math.min(screenWidth, screenHeight);
    if (isAggressive) {
        if (minDimension < 400) fontSize = minDimension * 0.35;
        else if (minDimension < 768) fontSize = minDimension * 0.30;
        else if (minDimension < 1024) fontSize = minDimension * 0.25;
        else fontSize = minDimension * 0.20;
    } else {
        if (minDimension < 400) fontSize = minDimension * 0.30;
        else if (minDimension < 768) fontSize = minDimension * 0.25;
        else if (minDimension < 1024) fontSize = minDimension * 0.20;
        else fontSize = minDimension * 0.15;
    }
    fontSize = Math.max(80, Math.min(fontSize, 500));
    display.style.fontSize = `${fontSize}px`;
    display.style.lineHeight = `${fontSize * 0.9}px`;
}

function adjustInfoCornersSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minDimension = Math.min(screenWidth, screenHeight);
    const infoCorners = document.querySelectorAll('.info-corner');
    infoCorners.forEach(corner => {
        if (minDimension < 400) corner.style.maxWidth = '40vw';
        else if (minDimension < 768) corner.style.maxWidth = '35vw';
        else if (minDimension < 1024) corner.style.maxWidth = '30vw';
        else corner.style.maxWidth = '25vw';
        if (minDimension < 400) corner.style.padding = '0.6vw 1vw';
        else if (minDimension < 768) corner.style.padding = '0.7vw 1.1vw';
        else corner.style.padding = '0.8vw 1.2vw';
    });
}

function setupCountdownResize() {
    window.addEventListener('load', function() { adjustCountdownSize(); adjustInfoCornersSize(); });
    window.addEventListener('resize', function() { adjustCountdownSize(); adjustInfoCornersSize(); });
    window.addEventListener('orientationchange', function() {
        setTimeout(function() { adjustCountdownSize(); adjustInfoCornersSize(); }, 300);
    });
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('https://rbenet71.github.io/Web/unified-sw.js', {scope: '/Web/'})
            .then(registration => {
                console.log('ServiceWorker registrado:', registration.scope);
                setInterval(() => registration.update(), 60 * 60 * 1000);
            })
            .catch(error => console.log('Error registrando ServiceWorker:', error));
    }
}

function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); appState.deferredPrompt = e;
        const installBtn = document.getElementById('install-btn'); installBtn.style.display = 'flex';
    });
}

function installPWA() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') showMessage('Aplicación instalada', 'success');
            appState.deferredPrompt = null;
        });
    }
}