// ============================================
// MÓDULO DE ALMACENAMIENTO Y PWA
// ============================================

// ============================================
// FUNCIONES DE PERSISTENCIA DE DATOS
// ============================================

// Cargar preferencia de idioma
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('countdown-language');
    if (savedLang && translations[savedLang]) {
        appState.currentLanguage = savedLang;
    }
}

// Cargar carreras desde almacenamiento
function loadRacesFromStorage() {
    const savedRaces = localStorage.getItem('countdown-races');
    if (savedRaces) {
        appState.races = JSON.parse(savedRaces);
    }
    
    const savedCurrentRace = localStorage.getItem('countdown-current-race');
    if (savedCurrentRace) {
        appState.currentRace = JSON.parse(savedCurrentRace);
    }
}

// Cargar estado de la aplicación
function loadAppState() {
    const savedState = localStorage.getItem('countdown-app-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        appState.departedCount = state.departedCount || 0;
        appState.nextCorredorTime = state.nextCorredorTime || 60;
        appState.intervals = state.intervals || [];
        appState.currentIntervalIndex = state.currentIntervalIndex || 0;
        appState.accumulatedTime = state.accumulatedTime || 0;
        appState.raceStartTime = state.raceStartTime || null;
        
        if (state.departureTimes && state.departureTimes.length > 0 && state.raceStartTime) {
            appState.departureTimes = state.departureTimes.map(departure => {
                if (departure.timeValue) return departure;
                
                const elapsedSeconds = Math.floor((departure.timestamp - state.raceStartTime) / 1000);
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                const seconds = elapsedSeconds % 60;
                
                return {
                    ...departure,
                    timeValue: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                    elapsedSeconds: elapsedSeconds
                };
            });
        } else {
            appState.departureTimes = state.departureTimes || [];
        }
        
        appState.countdownActive = false;
        appState.countdownValue = 0;
        appState.countdownPaused = false;
        
        document.getElementById('start-position').value = appState.departedCount + 1;
        
        console.log("Estado cargado, salidos:", appState.departedCount);
    }
}

// Cargar datos de la carrera actual
function loadRaceData() {
    if (!appState.currentRace) {
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.nextCorredorTime = 60;
        startOrderData = [];
        
        document.getElementById('departed-count').textContent = appState.departedCount;
        document.getElementById('start-position').value = appState.departedCount + 1;
        document.getElementById('first-start-time').value = "09:00:00";
        document.getElementById('total-riders').value = 1;
        
        updateStartOrderTable();
        renderDeparturesList();
        return;
    }
    
    appState.departureTimes = appState.currentRace.departures || [];
    appState.departedCount = appState.departureTimes.length > 0 ? 
        Math.max(...appState.departureTimes.map(d => d.corredor)) : 0;
    
    document.getElementById('departed-count').textContent = appState.departedCount;
    document.getElementById('start-position').value = appState.departedCount + 1;
    
    // Configuración de intervalo único
    const minutes = parseInt(document.getElementById('interval-minutes').value) || 1;
    const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
    appState.nextCorredorTime = minutes * 60 + seconds;
    
    // CARGAR HORA DE INICIO DE LA CARRERA
    if (appState.currentRace.firstStartTime) {
        document.getElementById('first-start-time').value = appState.currentRace.firstStartTime;
    } else {
        document.getElementById('first-start-time').value = "09:00:00";
    }
    
    // Cargar datos del orden de salida si existen
    if (appState.currentRace.startOrder && appState.currentRace.startOrder.length > 0) {
        startOrderData = appState.currentRace.startOrder;
        document.getElementById('total-riders').value = startOrderData.length;
    } else {
        startOrderData = [];
        document.getElementById('total-riders').value = 1;
    }
    
    // Actualizar todas las interfaces
    updateStartOrderTable();
    updateNextCorredorDisplay();
    renderDeparturesList();
    updateTimeDifference();
    updateRaceManagementCardTitle();
    
    console.log("Datos cargados para carrera:", appState.currentRace.name);
    console.log("Hora inicio:", document.getElementById('first-start-time').value);
    console.log("Salidas:", appState.departureTimes.length);
    console.log("Orden de salida:", startOrderData.length, "corredores");
}

// Cargar datos del orden de salida
function loadStartOrderData() {
    // Primero intentar cargar desde localStorage (para compatibilidad)
    const savedData = localStorage.getItem('start-order-data');
    if (savedData) {
        try {
            startOrderData = JSON.parse(savedData);
        } catch (e) {
            console.error("Error parsing start order data:", e);
            startOrderData = [];
        }
    }
    
    // Si hay carrera actual y tiene datos de orden de salida, sobreescribir
    if (appState.currentRace && appState.currentRace.startOrder) {
        startOrderData = appState.currentRace.startOrder;
    }
    
    if (startOrderData.length > 0) {
        document.getElementById('total-riders').value = startOrderData.length;
        updateStartOrderTable();
    }
    
    console.log("Orden de salida cargado:", startOrderData.length, "corredores");
}

// Guardar estado de la aplicación
function saveAppState() {
    if (appState.countdownActive) {
        localStorage.setItem('countdown-app-state', JSON.stringify({
            countdownActive: appState.countdownActive,
            countdownValue: appState.countdownValue,
            departedCount: appState.departedCount,
            nextCorredorTime: appState.nextCorredorTime,
            departureTimes: appState.departureTimes,
            raceStartTime: appState.raceStartTime,
            accumulatedTime: appState.accumulatedTime,
            countdownPaused: appState.countdownPaused
        }));
    } else {
        localStorage.removeItem('countdown-app-state');
    }
}

// Guardar datos de la carrera
function saveRaceData() {
    if (!appState.currentRace) {
        console.log("No hay carrera actual para guardar datos");
        return;
    }
    
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex === -1) {
        console.log("Carrera no encontrada en el array");
        return;
    }
    
    let intervalsToSave = [];
    
    // GUARDAR HORA DE INICIO ACTUAL
    const currentFirstStartTime = document.getElementById('first-start-time').value || "09:00:00";
    
    // Crear el objeto actualizado de carrera
    const updatedRace = {
        ...appState.currentRace,
        firstStartTime: currentFirstStartTime,
        departures: [...appState.departureTimes],
        intervals: intervalsToSave,
        startOrder: [...startOrderData],
        lastModified: new Date().toISOString()
    };
    
    appState.races[raceIndex] = updatedRace;
    appState.currentRace = updatedRace;
    
    saveRacesToStorage();
    
    console.log("Datos guardados para carrera:", appState.currentRace.name);
    console.log("Hora inicio guardada:", currentFirstStartTime);
    console.log("Salidas con notas:", appState.departureTimes.length);
    console.log("Orden de salida:", startOrderData.length, "corredores");
    console.log("Intervalos guardados:", intervalsToSave.length);
}

// Guardar todas las carreras
function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) {
        localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
    }
    console.log("Carreras guardadas en localStorage:", appState.races.length);
}

// Guardar datos del orden de salida
function saveStartOrderData() {
    if (appState.currentRace) {
        const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
        if (raceIndex !== -1) {
            appState.races[raceIndex].startOrder = startOrderData;
            saveRacesToStorage();
        }
    }
    localStorage.setItem('start-order-data', JSON.stringify(startOrderData));
}

// ============================================
// FUNCIONES DE GESTIÓN DE CARRERAS
// ============================================
function createNewRace() {
    const t = translations[appState.currentLanguage];
    
    const name = document.getElementById('new-race-name').value.trim();
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    const description = document.getElementById('new-race-description').value.trim();
    const firstStartTime = document.getElementById('first-start-time').value || "09:00:00";
    
    const newRace = {
        id: Date.now(),
        name: name,
        description: description,
        firstStartTime: firstStartTime,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        departures: [],
        intervals: [],
        startOrder: []
    };
    
    appState.races.push(newRace);
    appState.currentRace = newRace;
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    
    // Resetear datos de orden de salida
    startOrderData = [];
    document.getElementById('total-riders').value = 1;
    updateStartOrderTable();
    
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('start-position').value = 1;
    renderDeparturesList();
    
    saveRacesToStorage();
    renderRacesSelect();
    
    document.getElementById('new-race-modal').classList.remove('active');
    document.getElementById('new-race-name').value = '';
    document.getElementById('new-race-description').value = '';
    
    showMessage(t.raceCreated, 'success');
    
    console.log("Nueva carrera creada:", name);
    console.log("Hora inicio:", firstStartTime);
}

function deleteCurrentRace() {
    if (!appState.currentRace) return;
    
    const t = translations[appState.currentLanguage];
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races.splice(raceIndex, 1);
        appState.currentRace = null;
        
        if (appState.countdownActive) {
            stopCountdown();
            const countdownScreen = document.getElementById('countdown-screen');
            if (countdownScreen) {
                countdownScreen.classList.remove('active');
            }
            document.querySelectorAll('.hide-on-countdown').forEach(el => {
                el.style.display = '';
            });
        }
        
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        
        // Resetear orden de salida
        startOrderData = [];
        document.getElementById('first-start-time').value = "09:00:00";
        document.getElementById('total-riders').value = 1;
        updateStartOrderTable();
        
        const startPositionInput = document.getElementById('start-position');
        if (startPositionInput) {
            startPositionInput.value = 1;
        }
        
        const departedCountElement = document.getElementById('departed-count');
        if (departedCountElement) {
            departedCountElement.textContent = 0;
        }
        
        const singleIntervalConfig = document.getElementById('single-interval-config');
        const variableIntervalConfig = document.getElementById('variable-interval-config');
        
        if (singleIntervalConfig && variableIntervalConfig) {
            singleIntervalConfig.style.display = 'block';
            variableIntervalConfig.style.display = 'none';
        }
        
        saveRacesToStorage();
        renderRacesSelect();
        renderDeparturesList();
        
        const deleteModal = document.getElementById('delete-race-modal');
        if (deleteModal) {
            deleteModal.classList.remove('active');
        }
        
        showMessage(t.raceDeleted, 'success');
    }
}

function clearRaceDepartures() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    document.getElementById('start-position').value = 1;
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    saveRaceData();
    renderDeparturesList();
    
    showMessage(t.departuresCleared, 'success');
}

// ============================================
// FUNCIONES DE PWA (PROGRESSIVE WEB APP)
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
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
}

function installPWA() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                const t = translations[appState.currentLanguage];
                showMessage('Aplicación instalada', 'success');
            }
            appState.deferredPrompt = null;
        });
    }
}

function showUpdateNotification() {
    // Podrías añadir aquí una notificación visual al usuario
    // de que hay una nueva versión disponible
    console.log("Nueva versión disponible. Recarga la página para actualizar.");
    
    // Ejemplo de notificación simple
    const t = translations[appState.currentLanguage];
    showMessage(t.updateAvailable || "Nueva versión disponible", 'info');
}

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
    
    showMessage(t.suggestionSent || 'Sugerencia enviada', 'success');
}

// ============================================
// FUNCIONES DE MODALES
// ============================================

function handleCompleteRestart() {
    const t = translations[appState.currentLanguage];
    
    if (appState.countdownActive) {
        stopCountdown();
        document.getElementById('countdown-screen').classList.remove('active');
        document.querySelectorAll('.hide-on-countdown').forEach(el => {
            el.style.display = '';
        });
    }
    
    // Detener cronómetro de llegadas si está activo
    if (llegadasState.timerActive) {
        stopLlegadasTimer();
    }
    
    // Resetear todos los estados
    appState.departedCount = 0;
    appState.departureTimes = [];
    llegadasState.llegadas = [];
    llegadasState.currentTime = 0;
    llegadasState.startTime = null;
    
    if (appState.currentRace) {
        appState.currentRace.departures = [];
        saveRaceData();
    }
    
    appState.nextCorredorTime = 60;
    appState.currentIntervalIndex = 0;
    appState.accumulatedTime = 0;
    appState.raceStartTime = null;
    appState.countdownActive = false;
    appState.countdownPaused = false;
    
    // Actualizar UI
    document.getElementById('departed-count').textContent = '0';
    document.getElementById('start-position').value = 1;
    updateNextCorredorDisplay();
    
    renderDeparturesList();
    renderLlegadasList();
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    // Actualizar cronómetro de llegadas
    document.getElementById('llegadas-timer-display').textContent = '00:00:00';
    
    // Limpiar almacenamiento
    localStorage.removeItem('countdown-app-state');
    localStorage.removeItem('llegadas-state');
    
    document.getElementById('restart-confirm-modal').classList.remove('active');
    
    showMessage(t.sessionRestarted, 'success');
    console.log("Sesión reiniciada, TODOS los datos borrados");
}

// ============================================
// FUNCIONES DE ORDEN DE SALIDA
// ============================================
function deleteStartOrder() {
    const t = translations[appState.currentLanguage];
    
    if (startOrderData.length === 0) {
        showMessage(t.listAlreadyEmpty, 'info');
        return;
    }
    
    // Usar confirm con un mensaje claro
    const userConfirmed = window.confirm(t.confirmDeleteOrder || "¿Estás seguro de que quieres eliminar TODO el orden de salida? Esta acción no se puede deshacer.");
    
    if (!userConfirmed) {
        return; // El usuario canceló
    }
    
    // Eliminar los datos
    startOrderData = [];
    
    // Actualizar el total de corredores a 1 (valor mínimo)
    document.getElementById('total-riders').value = 1;
    
    // Actualizar la tabla (mostrará estado vacío)
    updateStartOrderTable();
    
    // Guardar los cambios
    saveStartOrderData();
    
    // También actualizar en la carrera actual si existe
    if (appState.currentRace) {
        saveRaceData();
    }
    
    // Mostrar mensaje de éxito
    showMessage(t.orderDeleted, 'success');
    
    console.log("Orden de salida eliminado completamente");
}

function addNewRider() {
    const t = translations[appState.currentLanguage];
    const totalRiders = parseInt(document.getElementById('total-riders').value) || 1;
    
    const newRider = {
        order: startOrderData.length + 1,
        dorsal: 100 + startOrderData.length + 1,
        nombre: '',
        apellidos: '',
        chip: 'CHIP' + (100 + startOrderData.length + 1).toString().padStart(3, '0'),
        horaSalida: calculateStartTime(startOrderData.length),
        cronoSalida: secondsToTime(startOrderData.length * 60),
        horaSalidaReal: '',
        cronoSalidaReal: '',
        horaSalidaPrevista: '',
        cronoSalidaPrevista: '',
        horaSalidaImportado: '',
        cronoSalidaImportado: '',
        cronoSegundos: startOrderData.length * 60,
        horaSegundos: timeToSeconds(calculateStartTime(startOrderData.length))
    };
    
    startOrderData.push(newRider);
    document.getElementById('total-riders').value = startOrderData.length;
    updateStartOrderTable();
    saveStartOrderData();
    
    showMessage(t.riderAdded, 'success');
}

function updateStartOrderTimes() {
    updateTimeDifference();
    
    // Recalcular horas de salida para todos los corredores
    startOrderData.forEach((rider, index) => {
        rider.horaSalida = calculateStartTime(index);
        rider.horaSegundos = timeToSeconds(rider.horaSalida);
    });
    
    updateStartOrderTable();
    
    // Guardar automáticamente si hay una carrera seleccionada
    if (appState.currentRace) {
        saveRaceData();
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR
// ============================================
// Este evento se configura en CRI_main_config.js
// document.addEventListener('DOMContentLoaded', initApp);

// Guardar estado antes de cerrar
window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) saveLastUpdate();
});