// ============================================
// VARIABLES PARA ORDENACIÓN
// ============================================
let sortState = { column: 'time', direction: 'desc' };

// ============================================
// FUNCIONES DE SUGERENCIAS
// ============================================
function sendSuggestion() {
    const t = translations[appState.currentLanguage];
    
    const email = document.getElementById('suggestion-email').value.trim();
    const text = document.getElementById('suggestion-text').value.trim();
    
    if (!text) {
        showMessage(t.suggestionTextLabel, 'error');
        return;
    }
    
    console.log('Sugerencia enviada:', { email, text });
    
    document.getElementById('suggestions-modal').classList.remove('active');
    document.getElementById('suggestion-email').value = '';
    document.getElementById('suggestion-text').value = '';
    
    showMessage(t.suggestionSent, 'success');
}

// ============================================
// FUNCIONES DE MANEJO DE INTERVALOS
// ============================================
function handleRemoveInterval(index) {
    const t = translations[appState.currentLanguage];
    
    if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
        const interval = appState.intervals[index];
        const confirmMessage = t.confirmDeleteInterval.replace('{from}', interval.from).replace('{to}', interval.to);
        
        if (confirm(confirmMessage)) {
            appState.intervals.splice(index, 1);
            renderIntervalsList();
            
            intervalConfig.variableMode = {
                intervals: [...appState.intervals],
                saved: true
            };
            saveIntervalConfig();
            
            if (appState.currentRace) {
                appState.currentRace.intervals = [...appState.intervals];
                saveRaceData();
            }
            
            if (appState.countdownActive) {
                updateCurrentInterval();
                saveAppState();
            }
            
            showMessage(t.intervalDeleted, 'success');
            console.log("Intervalo eliminado. Total restante:", appState.intervals.length);
            
            setTimeout(() => { setupSpecificIntervalListeners(); }, 100);
        }
    }
}

// ============================================
// FUNCIONES UTILITARIAS
// ============================================
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function saveLastUpdate() {
    localStorage.setItem('countdown-last-update', Date.now().toString());
}

function keepScreenAwake() {
    if (!appState.countdownActive) return;
    
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
            .then(wakeLock => {
                console.log('Wake Lock activado');
            })
            .catch(err => {
                console.log('Wake Lock no disponible:', err);
            });
    }
    
    const video = document.getElementById('keep-alive-video');
    if (video) {
        video.loop = true;
        video.play().catch(e => console.log('Video keep-alive falló:', e));
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
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
        if (minDimension < 400) {
            fontSize = minDimension * 0.35;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.25;
        } else {
            fontSize = minDimension * 0.20;
        }
    } else {
        if (minDimension < 400) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.25;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.20;
        } else {
            fontSize = minDimension * 0.15;
        }
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
        if (minDimension < 400) {
            corner.style.maxWidth = '40vw';
        } else if (minDimension < 768) {
            corner.style.maxWidth = '35vw';
        } else if (minDimension < 1024) {
            corner.style.maxWidth = '30vw';
        } else {
            corner.style.maxWidth = '25vw';
        }
        
        if (minDimension < 400) {
            corner.style.padding = '0.6vw 1vw';
        } else if (minDimension < 768) {
            corner.style.padding = '0.7vw 1.1vw';
        } else {
            corner.style.padding = '0.8vw 1.2vw';
        }
    });
}

function setupCountdownResize() {
    window.addEventListener('load', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('resize', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustCountdownSize();
            adjustInfoCornersSize();
        }, 300);
    });
}

// ============================================
// CONFIGURACIÓN DE INTERVALOS
// ============================================
const intervalConfig = {
    singleMode: { minutes: 1, seconds: 0, saved: false },
    variableMode: { intervals: [], saved: false }
};

function loadIntervalConfig() {
    const savedConfig = localStorage.getItem('countdown-interval-config');
    
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            
            if (config.singleMode) {
                intervalConfig.singleMode = config.singleMode;
            }
            
            if (config.variableMode) {
                intervalConfig.variableMode = config.variableMode;
            }
        } catch (e) {
            console.error("Error cargando configuración:", e);
        }
    }
}

function saveIntervalConfig() {
    localStorage.setItem('countdown-interval-config', JSON.stringify(intervalConfig));
}

function updateIntervalCount() {
    const count = appState.intervals.length;
    console.log("Total de intervalos configurados:", count);
}

// ============================================
// FUNCIONES DE PWA Y SERVICEWORKER
// ============================================
function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('https://rbenet71.github.io/Web/unified-sw.js', {scope: '/Web/'})
            .then(registration => {
                console.log('ServiceWorker registrado:', registration.scope);
                
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000);
            })
            .catch(error => {
                console.log('Error registrando ServiceWorker:', error);
            });
    }
}

function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        
        const installBtn = document.getElementById('install-btn');
        installBtn.style.display = 'flex';
    });
}

function installPWA() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showMessage('Aplicación instalada', 'success');
            }
            appState.deferredPrompt = null;
        });
    }
}