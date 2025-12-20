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
// FUNCIONES DE PWA Y SERVICEWORKER
// ============================================
function setupServiceWorker() {
    console.log("Configurando ServiceWorker...");
    
    // Verificar si el navegador soporta Service Workers
    if (!('serviceWorker' in navigator)) {
        console.log('Este navegador no soporta Service Workers');
        return;
    }
    
    // Verificar el protocolo actual
    const protocol = window.location.protocol;
    const isFileProtocol = protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isHttps = protocol === 'https:';
    
    // Los Service Workers NO funcionan con file://
    if (isFileProtocol) {
        console.log('ℹ️ ServiceWorker no disponible para protocolo file://');
        console.log('   La aplicación funcionará normalmente, pero sin funciones PWA.');
        console.log('   Para probar PWA, ejecuta desde un servidor local.');
        return;
    }
    
    // Solo registrar si estamos en localhost o HTTPS
    if (isLocalhost || isHttps) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('✅ ServiceWorker registrado exitosamente:', registration.scope);
                
                // Verificar actualizaciones
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Nueva versión del ServiceWorker encontrada');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('📱 Nueva versión lista para instalar');
                            appState.updateAvailable = true;
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch(error => {
                console.log('❌ Error registrando ServiceWorker:', error.name, '-', error.message);
                console.log('   Esto es normal si el archivo sw.js no existe o tiene errores.');
            });
    } else {
        console.log('⚠️ ServiceWorker requiere HTTPS o localhost');
        console.log('   Protocolo actual:', protocol);
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


// Función para formatear hora con segundos
function formatTimeWithSeconds(timeStr) {
    if (!timeStr) return '00:00:00';
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        // Ya tiene segundos, asegurar formato de 2 dígitos
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    } else if (parts.length === 2) {
        // Solo tiene horas y minutos, agregar segundos
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    }
    return '00:00:00';
}

function debugModeState() {
    console.log("=== DEPURACIÓN DE ESTADO DE MODO ===");
    
    // Verificar slider
    const slider = document.querySelector('.mode-slider');
    const activeOption = document.querySelector('.mode-slider-option.active');
    console.log("Slider data-mode:", slider ? slider.dataset.mode : "No encontrado");
    console.log("Opción activa:", activeOption ? activeOption.dataset.mode : "No encontrada");
    
    // Verificar contenido visible
    const salidaContent = document.getElementById('mode-salida-content');
    const llegadasContent = document.getElementById('mode-llegadas-content');
    console.log("Contenido salida activo:", salidaContent ? salidaContent.classList.contains('active') : "No encontrado");
    console.log("Contenido llegadas activo:", llegadasContent ? llegadasContent.classList.contains('active') : "No encontrado");
    
    // Verificar localStorage
    console.log("app-mode en localStorage:", localStorage.getItem('app-mode'));
    console.log("selectedMode en localStorage:", localStorage.getItem('selectedMode'));
    
    console.log("=== FIN DEPURACIÓN ===");
}
function cleanupOldData() {
    console.log("Limpiando datos antiguos...");
    
    // Eliminar claves duplicadas
    const oldKeys = ['selectedMode', 'mode', 'appMode'];
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            console.log(`Eliminando clave antigua: ${key}`);
            localStorage.removeItem(key);
        }
    });
    
    // Unificar en 'app-mode' si hay datos en otras claves
    const possibleModes = {
        'selectedMode': localStorage.getItem('selectedMode'),
        'mode': localStorage.getItem('mode'),
        'appMode': localStorage.getItem('appMode')
    };
    
    // Encontrar el primer modo válido
    for (const [key, value] of Object.entries(possibleModes)) {
        if (value && (value === 'salida' || value === 'llegadas')) {
            console.log(`Migrando modo de ${key}=${value} a app-mode`);
            localStorage.setItem('app-mode', value);
            localStorage.removeItem(key);
            break;
        }
    }
    
    console.log("Limpieza de datos completada");
}