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

// ============================================
// MÓDULO DE COPIA DE SEGURIDAD
// ============================================

// ============================================
// MÓDULO DE COPIA DE SEGURIDAD POR CARRERA
// ============================================

// ============================================
// FUNCIONES DE COPIA DE SEGURIDAD
// ============================================

function setupBackupEventListeners() {
    console.log("Configurando listeners de copia de seguridad...");
    
    // Botón de copia de seguridad
    const backupBtn = document.getElementById('backup-race-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', createRaceBackup);
    }
    
    // Botón de restauración
    const restoreBtn = document.getElementById('restore-race-btn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreRaceFromBackup);
    }
    
    console.log("Listeners de copia de seguridad configurados");
}

function createRaceBackup() {
    const t = translations[appState.currentLanguage];
    
    // Verificar si hay una carrera seleccionada
    if (!appState.currentRace) {
        showMessage(t.noRaceSelected, 'warning');
        return;
    }
    
    // Mostrar mensaje de progreso
    showMessage(t.creatingBackup, 'info');
    
    // Preparar datos específicos de la carrera
    const raceBackupData = {
        version: '1.0',
        appName: 'Crono CRI',
        exportDate: new Date().toISOString(),
        exportVersion: 'V_19_12_2025',
        dataType: 'single-race',
        race: {
            // Copiar todos los datos de la carrera actual
            id: appState.currentRace.id,
            name: appState.currentRace.name,
            description: appState.currentRace.description || '',
            firstStartTime: appState.currentRace.firstStartTime || '09:00:00',
            createdAt: appState.currentRace.createdAt,
            lastModified: new Date().toISOString(),
            departures: appState.currentRace.departures ? [...appState.currentRace.departures] : [],
            intervals: appState.currentRace.intervals ? [...appState.currentRace.intervals] : [],
            startOrder: appState.currentRace.startOrder ? [...appState.currentRace.startOrder] : []
        },
        // Incluir también datos del estado actual relacionados con esta carrera
        currentState: {
            departureTimes: appState.departureTimes ? [...appState.departureTimes] : [],
            departedCount: appState.departedCount,
            raceStartTime: appState.raceStartTime,
            nextCorredorTime: appState.nextCorredorTime
        },
        metadata: {
            raceName: appState.currentRace.name,
            totalDepartures: appState.currentRace.departures ? appState.currentRace.departures.length : 0,
            totalInStartOrder: appState.currentRace.startOrder ? appState.currentRace.startOrder.length : 0,
            backupDate: new Date().toLocaleDateString('es-ES'),
            backupTime: new Date().toLocaleTimeString('es-ES')
        }
    };
    
    // Si estamos en modo llegadas y hay datos para esta carrera, incluirlos
    if (llegadasState.importedSalidas && llegadasState.importedSalidas.length > 0) {
        // Filtrar llegadas que pertenecen a esta carrera (basado en datos de salida)
        const raceLlegadas = llegadasState.llegadas.filter(llegada => {
            // Aquí podrías añadir lógica para filtrar por carrera si tienes un campo de identificación
            return true; // Por ahora incluye todas
        });
        
        if (raceLlegadas.length > 0) {
            raceBackupData.race.llegadas = raceLlegadas;
            raceBackupData.metadata.totalLlegadas = raceLlegadas.length;
        }
    }
    
    // Contar estadísticas
    const totalDepartures = raceBackupData.race.departures.length;
    const totalInOrder = raceBackupData.race.startOrder.length;
    const totalLlegadas = raceBackupData.race.llegadas ? raceBackupData.race.llegadas.length : 0;
    
    // Crear nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
    const safeRaceName = appState.currentRace.name
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 30);
    const filename = `crono_cri_${safeRaceName}_${dateStr}_${timeStr}.json`;
    
    // Crear Blob y descargar
    const blob = new Blob([JSON.stringify(raceBackupData, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Mostrar mensaje de éxito
    const successMessage = t.backupCreated.replace('{filename}', filename);
    let detailMessage = `${totalDepartures} salidas`;
    
    if (totalInOrder > 0) {
        detailMessage += `, ${totalInOrder} en orden de salida`;
    }
    
    if (totalLlegadas > 0) {
        detailMessage += `, ${totalLlegadas} llegadas`;
    }
    
    showMessage(`${successMessage} - ${detailMessage}`, 'success');
    
    console.log("Copia de seguridad de carrera creada:", filename);
    console.log("Contenido:", raceBackupData.metadata);
}

function restoreRaceFromBackup() {
    const t = translations[appState.currentLanguage];
    
    // Crear input de archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Mostrar mensaje de progreso
        showMessage(t.restoringData, 'info');
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const backupData = JSON.parse(event.target.result);
                
                // Validar archivo de backup
                if (!isValidRaceBackupFile(backupData)) {
                    showMessage(t.invalidBackupFile, 'error');
                    return;
                }
                
                // Verificar que sea una copia de carrera individual
                if (backupData.dataType !== 'single-race') {
                    showMessage('Este archivo no es una copia de carrera individual', 'error');
                    return;
                }
                
                // Mostrar confirmación con opciones
                showRaceRestoreOptions(backupData);
                
            } catch (error) {
                console.error('Error parsing backup file:', error);
                showMessage(t.restoreError, 'error');
            }
        };
        
        reader.onerror = () => {
            showMessage(t.restoreError, 'error');
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    
    // Limpiar input
    setTimeout(() => {
        if (input.parentNode) {
            document.body.removeChild(input);
        }
    }, 1000);
}

function isValidRaceBackupFile(data) {
    return data && 
           data.version && 
           data.appName === 'Crono CRI' &&
           data.dataType === 'single-race' &&
           data.race && 
           data.race.name;
}

function showRaceRestoreOptions(backupData) {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de opciones
    const modal = document.createElement('div');
    modal.id = 'race-restore-options-modal';
    modal.className = 'modal';
    
    const raceName = backupData.race.name;
    const totalDepartures = backupData.race.departures ? backupData.race.departures.length : 0;
    const totalInOrder = backupData.race.startOrder ? backupData.race.startOrder.length : 0;
    const totalLlegadas = backupData.race.llegadas ? backupData.race.llegadas.length : 0;
    const backupDate = formatBackupDate(backupData.exportDate);
    
    // Verificar si ya existe una carrera con este nombre
    const existingRaceIndex = appState.races.findIndex(r => r.name === raceName);
    const raceExists = existingRaceIndex !== -1;
    
    modal.innerHTML = `
        <div class="modal-content medium-modal">
            <div class="modal-header">
                <h3>${t.restoreTitle} - ${raceName}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="restore-race-info">
                    <div class="restore-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${t.restoreWarning}</p>
                    </div>
                    
                    <div class="restore-details">
                        <h4>Información de la copia:</h4>
                        <p><i class="fas fa-flag-checkered"></i> Carrera: <strong>${raceName}</strong></p>
                        <p><i class="fas fa-clock"></i> Salidas registradas: <strong>${totalDepartures}</strong></p>
                        <p><i class="fas fa-list-ol"></i> En orden de salida: <strong>${totalInOrder}</strong></p>
                        ${totalLlegadas > 0 ? `<p><i class="fas fa-flag-checkered"></i> Llegadas: <strong>${totalLlegadas}</strong></p>` : ''}
                        <p><i class="fas fa-calendar"></i> Fecha backup: <strong>${backupDate}</strong></p>
                    </div>
                    
                    ${raceExists ? `
                    <div class="restore-existing-warning">
                        <i class="fas fa-exclamation-circle"></i>
                        <p><strong>¡Atención!</strong> Ya existe una carrera con el nombre "${raceName}".</p>
                    </div>
                    
                    <div class="restore-options">
                        <h4>Opciones de restauración:</h4>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="restore-option" value="replace" checked>
                                <span class="radio-label">Reemplazar carrera existente</span>
                                <span class="radio-description">Sobrescribirá la carrera "${raceName}" actual</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="restore-option" value="rename">
                                <span class="radio-label">Crear como nueva carrera</span>
                                <span class="radio-description">Se creará como "${raceName} (restaurada)"</span>
                            </label>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="restore-data-selection">
                        <h4>¿Qué datos restaurar?</h4>
                        <div class="checkbox-group">
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="departures" checked>
                                <span class="checkbox-label">Datos de salidas (${totalDepartures})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="startOrder" ${totalInOrder > 0 ? 'checked' : ''} ${totalInOrder === 0 ? 'disabled' : ''}>
                                <span class="checkbox-label">Orden de salida (${totalInOrder})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="llegadas" ${totalLlegadas > 0 ? 'checked' : ''} ${totalLlegadas === 0 ? 'disabled' : ''}>
                                <span class="checkbox-label">Datos de llegadas (${totalLlegadas})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="config" checked>
                                <span class="checkbox-label">Configuración (hora inicio, etc.)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-race-restore-btn">
                    <i class="fas fa-check"></i> ${t.confirmRestore?.split('?')[0] || 'Confirmar Restauración'}
                </button>
                <button class="btn btn-danger" id="cancel-race-restore-btn">
                    <i class="fas fa-times"></i> ${t.cancel || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupRaceRestoreModalEvents(modal, backupData, raceExists, existingRaceIndex);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function setupRaceRestoreModalEvents(modal, backupData, raceExists, existingRaceIndex) {
    const confirmBtn = modal.querySelector('#confirm-race-restore-btn');
    const cancelBtn = modal.querySelector('#cancel-race-restore-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar restauración
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Obtener opciones seleccionadas
        const restoreOption = modal.querySelector('input[name="restore-option"]:checked')?.value || 'replace';
        const selectedData = Array.from(modal.querySelectorAll('input[name="restore-data"]:checked'))
            .map(cb => cb.value);
        
        // Realizar la restauración
        performRaceRestore(backupData, restoreOption, selectedData, existingRaceIndex);
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Cancelar
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.timeChangeCancelled || 'Operación cancelada', 'info');
    });
    
    // Cerrar con la X
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
        }
    });
    
    // Añadir estilos
    addRaceRestoreModalStyles();
}

function performRaceRestore(backupData, restoreOption, selectedData, existingRaceIndex) {
    const t = translations[appState.currentLanguage];
    
    try {
        // Detener procesos activos si están relacionados con esta carrera
        if (appState.countdownActive && appState.currentRace) {
            const currentRaceName = appState.currentRace.name;
            const backupRaceName = backupData.race.name;
            
            if (currentRaceName === backupRaceName || 
                (restoreOption === 'replace' && existingRaceIndex !== -1 && 
                 appState.races[existingRaceIndex].name === backupRaceName)) {
                stopCountdown();
            }
        }
        
        // Preparar datos restaurados
        let restoredRace = {
            id: backupData.race.id,
            name: backupData.race.name,
            description: backupData.race.description || '',
            firstStartTime: backupData.race.firstStartTime || '09:00:00',
            createdAt: backupData.race.createdAt,
            lastModified: new Date().toISOString()
        };
        
        // Aplicar datos seleccionados
        if (selectedData.includes('departures')) {
            restoredRace.departures = backupData.race.departures ? [...backupData.race.departures] : [];
        } else {
            restoredRace.departures = [];
        }
        
        if (selectedData.includes('startOrder')) {
            restoredRace.startOrder = backupData.race.startOrder ? [...backupData.race.startOrder] : [];
        } else {
            restoredRace.startOrder = [];
        }
        
        if (selectedData.includes('llegadas') && backupData.race.llegadas) {
            restoredRace.llegadas = [...backupData.race.llegadas];
        }
        
        if (selectedData.includes('config')) {
            restoredRace.intervals = backupData.race.intervals ? [...backupData.race.intervals] : [];
        } else {
            restoredRace.intervals = [];
        }
        
        // Manejar opciones de restauración
        if (restoreOption === 'rename' || (existingRaceIndex === -1)) {
            // Crear nueva carrera con nombre modificado
            if (restoreOption === 'rename') {
                restoredRace.name = `${backupData.race.name} (restaurada ${new Date().toLocaleDateString('es-ES')})`;
            }
            restoredRace.id = Date.now(); // Nuevo ID
            restoredRace.createdAt = new Date().toISOString();
            
            appState.races.push(restoredRace);
            appState.currentRace = restoredRace;
            
        } else if (restoreOption === 'replace' && existingRaceIndex !== -1) {
            // Reemplazar carrera existente
            restoredRace.id = appState.races[existingRaceIndex].id; // Mantener ID original
            restoredRace.createdAt = appState.races[existingRaceIndex].createdAt; // Mantener fecha creación
            
            appState.races[existingRaceIndex] = restoredRace;
            
            // Si esta era la carrera actual, actualizarla
            if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
                appState.currentRace = restoredRace;
            }
        }
        
        // Si esta carrera restaurada es la actual, cargar sus datos
        if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
            // Cargar datos específicos del estado actual
            if (selectedData.includes('departures') && backupData.currentState) {
                appState.departureTimes = backupData.currentState.departureTimes ? 
                    [...backupData.currentState.departureTimes] : [];
                appState.departedCount = backupData.currentState.departedCount || 0;
                appState.raceStartTime = backupData.currentState.raceStartTime || null;
                appState.nextCorredorTime = backupData.currentState.nextCorredorTime || 60;
            }
            
            // Cargar datos de llegadas si se seleccionaron
            if (selectedData.includes('llegadas') && backupData.race.llegadas) {
                // Actualizar estado de llegadas
                if (!llegadasState.llegadas) {
                    llegadasState.llegadas = [];
                }
                // Filtrar llegadas existentes de esta carrera y añadir las nuevas
                llegadasState.llegadas = [
                    ...llegadasState.llegadas.filter(l => 
                        !backupData.race.llegadas.some(bl => bl.dorsal === l.dorsal)
                    ),
                    ...backupData.race.llegadas
                ];
            }
            
            // Cargar datos de orden de salida
            if (selectedData.includes('startOrder') && backupData.race.startOrder) {
                startOrderData = [...backupData.race.startOrder];
            }
        }
        
        // Guardar en localStorage
        saveRacesToStorage();
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
        
        // Actualizar UI
        renderRacesSelect();
        
        if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
            loadRaceData();
            renderDeparturesList();
            renderLlegadasList();
            updateStartOrderTable();
        }
        
        // Mostrar mensaje de éxito
        let successDetails = [];
        if (selectedData.includes('departures')) {
            successDetails.push(`${restoredRace.departures.length} salidas`);
        }
        if (selectedData.includes('startOrder') && restoredRace.startOrder.length > 0) {
            successDetails.push(`${restoredRace.startOrder.length} en orden de salida`);
        }
        if (selectedData.includes('llegadas') && restoredRace.llegadas && restoredRace.llegadas.length > 0) {
            successDetails.push(`${restoredRace.llegadas.length} llegadas`);
        }
        
        const successMessage = `${t.restoreSuccess} - ${restoredRace.name}`;
        const detailMessage = successDetails.length > 0 ? `(${successDetails.join(', ')})` : '';
        
        showMessage(`${successMessage} ${detailMessage}`, 'success');
        
        console.log("Carrera restaurada:", restoredRace.name);
        console.log("Datos incluidos:", selectedData);
        
    } catch (error) {
        console.error('Error restoring race data:', error);
        showMessage(t.restoreError, 'error');
    }
}

function formatBackupDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function addRaceRestoreModalStyles() {
    if (document.getElementById('race-restore-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'race-restore-modal-styles';
    style.textContent = `
        .restore-race-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .restore-warning {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .restore-existing-warning {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: var(--border-radius);
            color: #721c24;
        }
        
        .restore-warning i,
        .restore-existing-warning i {
            font-size: 1.5rem;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .restore-warning i {
            color: #f39c12;
        }
        
        .restore-existing-warning i {
            color: #e74c3c;
        }
        
        .restore-details {
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
        }
        
        .restore-details h4,
        .restore-options h4,
        .restore-data-selection h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--dark);
            font-size: 1.1rem;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 8px;
        }
        
        .restore-details p {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
            color: var(--gray);
        }
        
        .restore-details i {
            color: var(--primary);
            width: 20px;
            text-align: center;
        }
        
        .restore-details strong {
            color: var(--dark);
            margin-left: 5px;
        }
        
        /* Opciones de radio */
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 15px 0;
        }
        
        .radio-option {
            display: flex;
            flex-direction: column;
            padding: 12px;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .radio-option:hover {
            border-color: var(--primary);
            background: #e8f4fd;
        }
        
        .radio-option input[type="radio"]:checked + .radio-label {
            color: var(--primary);
            font-weight: 600;
        }
        
        .radio-option input[type="radio"]:checked ~ .radio-description {
            color: var(--dark);
        }
        
        .radio-label {
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .radio-description {
            font-size: 0.9rem;
            color: var(--gray);
            margin-left: 24px;
        }
        
        /* Opciones de checkbox */
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 15px 0;
        }
        
        .checkbox-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
        
        .checkbox-option:hover {
            background: #e8f4fd;
        }
        
        .checkbox-option input[type="checkbox"]:disabled + .checkbox-label {
            color: #adb5bd;
            cursor: not-allowed;
        }
        
        .checkbox-label {
            font-weight: 500;
        }
        
        .medium-modal {
            max-width: 600px;
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Añadir esta función al archivo principal (Main.js)
function initBackupModule() {
    if (typeof setupBackupEventListeners === 'function') {
        setupBackupEventListeners();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initBackupModule, 1000);
});