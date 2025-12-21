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
        console.log("No hay carrera seleccionada para cargar datos");
        return;
    }
    
    console.log("Cargando datos para carrera:", appState.currentRace.name);
    
    // Cargar datos específicos de la carrera
    const raceData = localStorage.getItem(`race-${appState.currentRace.id}`);
    if (raceData) {
        const data = JSON.parse(raceData);
        
        appState.raceStartTime = data.raceStartTime || '';
        appState.departureTimes = data.departureTimes || [];
        appState.departedCount = data.departedCount || 0;
        appState.intervals = data.intervals || [];
        
        console.log("Hora inicio:", appState.raceStartTime);
        console.log("Salidas:", appState.departedCount);
        
        // Actualizar UI con los datos cargados
        if (document.getElementById('start-time')) {
            document.getElementById('start-time').value = appState.raceStartTime || '';
        }
        
        document.getElementById('departed-count').textContent = appState.departedCount;
        
        // Asegurar que startOrderData esté cargado antes de llamar a updateStartOrderUI
        if (typeof startOrderData !== 'undefined' && startOrderData.length > 0) {
            console.log("startOrderData ya cargado, llamando a updateStartOrderUI");
            updateStartOrderUI();
        } else {
            console.log("startOrderData no está disponible aún, posponiendo updateStartOrderUI");
            // Posponer la actualización hasta que startOrderData esté listo
            setTimeout(() => {
                if (typeof startOrderData !== 'undefined' && startOrderData.length > 0) {
                    updateStartOrderUI();
                }
            }, 100);
        }
        
        renderDeparturesList();
    } else {
        console.log("No hay datos guardados para esta carrera");
    }
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
        updateStartOrderTableThrottled();
    }
    
    if (typeof updateStartOrderUI === 'function') {
        updateStartOrderUI();
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
    
    // Obtener valores del formulario
    const name = document.getElementById('new-race-name').value.trim();
    const date = document.getElementById('new-race-date').value;
    const category = document.getElementById('new-race-category').value;
    const organizer = document.getElementById('new-race-organizer').value.trim();
    const location = document.getElementById('new-race-location').value.trim();
    const description = document.getElementById('new-race-description').value.trim();
    
    // Obtener modalidad
    const modalityInput = document.querySelector('input[name="modality"]:checked');
    let modality = modalityInput ? modalityInput.value : 'CRI';
    let otherModality = '';
    
    if (modality === 'Otras') {
        otherModality = document.getElementById('new-race-other-modality').value.trim();
        if (otherModality) {
            modality = otherModality;
        }
    }
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate, 'error');
        return;
    }
    
    // Obtener hora de inicio predeterminada
    const firstStartTime = document.getElementById('first-start-time').value || "09:00:00";
    
    // Crear objeto de carrera con todos los datos
    const newRace = {
        id: Date.now(),
        name: name,
        date: date,
        category: category,
        organizer: organizer,
        location: location,
        modality: modality,
        description: description,
        firstStartTime: firstStartTime,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        departures: [],
        intervals: [],
        startOrder: [],
        metadata: {
            originalModality: modalityInput ? modalityInput.value : 'CRI',
            otherModality: otherModality
        }
    };
    
    // Añadir a la lista de carreras
    appState.races.push(newRace);
    appState.currentRace = newRace;
    
    // Resetear datos de estado
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    
    // Resetear datos de orden de salida
    startOrderData = [];
    document.getElementById('total-riders').value = 1;
    updateStartOrderTableThrottled();
    
    // Actualizar UI
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('start-position').value = 1;
    renderDeparturesList();
    
    // Guardar y actualizar
    saveRacesToStorage();
    renderRacesSelect();
    
    // Cerrar modal y limpiar formulario
    document.getElementById('new-race-modal').classList.remove('active');
    resetRaceForm();
    
    // Mostrar mensaje de éxito
    showMessage(t.raceCreated, 'success');
    
    console.log("Nueva carrera creada:", newRace);
}


function resetRaceForm() {
    // Limpiar todos los campos del formulario
    document.getElementById('new-race-name').value = '';
    document.getElementById('new-race-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('new-race-category').value = '';
    document.getElementById('new-race-organizer').value = '';
    document.getElementById('new-race-location').value = '';
    document.getElementById('new-race-description').value = '';
    
    // Resetear modalidad a CRI por defecto
    document.getElementById('modality-cri').checked = true;
    document.getElementById('new-race-other-modality').value = '';
    document.getElementById('other-modality-container').style.display = 'none';
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
        updateStartOrderTableThrottled();
        
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
        showMessage(t.listAlreadyEmpty || 'La lista ya está vacía', 'info');
        return;
    }
    
    // Crear modal personalizado en lugar de window.confirm
    createDeleteOrderConfirmationModal();
}

function createDeleteOrderConfirmationModal() {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.id = 'delete-order-confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> ${t.deleteOrderTitle || 'Eliminar Orden de Salida'}</h3>
                <button class="modal-close" id="delete-order-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="delete-confirm-message">
                    <div class="warning-icon-large">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="warning-content">
                        <p class="warning-title">${t.confirmDeleteOrder || '¿Estás seguro de que quieres eliminar TODO el orden de salida?'}</p>
                        <p class="warning-subtitle">${t.deleteWarning || 'Esta acción no se puede deshacer.'}</p>
                        
                        <div class="delete-stats">
                            <div class="stat-item">
                                <i class="fas fa-users"></i>
                                <span class="stat-label">Corredores:</span>
                                <span class="stat-value">${startOrderData.length}</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-list-ol"></i>
                                <span class="stat-label">Datos:</span>
                                <span class="stat-value">${startOrderData.length} registros</span>
                            </div>
                        </div>
                        
                        <div class="data-preview-small">
                            <h4>Vista previa de datos a eliminar:</h4>
                            <div class="preview-scroll">
                                ${getOrderPreviewForModal()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" id="confirm-delete-order-btn">
                    <i class="fas fa-trash"></i>
                    ${t.confirmDelete || 'Sí, eliminar todo'}
                </button>
                <button class="btn btn-secondary" id="cancel-delete-order-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelButtonText || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupDeleteOrderModalEvents(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Añadir estilos si no existen
    addDeleteOrderModalStyles();
}

function getOrderPreviewForModal() {
    // Mostrar solo los primeros 3 corredores como vista previa
    const previewCount = Math.min(3, startOrderData.length);
    let html = '<table class="mini-preview-table">';
    
    for (let i = 0; i < previewCount; i++) {
        const rider = startOrderData[i];
        html += `
        <tr>
            <td class="preview-order">${rider.order}</td>
            <td class="preview-dorsal">${rider.dorsal}</td>
            <td class="preview-name">${rider.nombre || ''} ${rider.apellidos || ''}</td>
            <td class="preview-time">${rider.horaSalida || ''}</td>
        </tr>
        `;
    }
    
    html += '</table>';
    
    if (startOrderData.length > 3) {
        html += `
        <div class="preview-more-info">
            <i class="fas fa-ellipsis-h"></i>
            ${startOrderData.length - 3} ${translations[appState.currentLanguage].moreRiders || 'más corredores...'}
        </div>
        `;
    }
    
    return html;
}

function setupDeleteOrderModalEvents(modal) {
    const confirmBtn = modal.querySelector('#confirm-delete-order-btn');
    const cancelBtn = modal.querySelector('#cancel-delete-order-btn');
    const closeBtn = modal.querySelector('#delete-order-close');
    
    // Confirmar eliminación
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Eliminar todos los datos
        startOrderData = [];
        
        // Actualizar UI
        document.getElementById('total-riders').value = 1;
        updateStartOrderTableThrottled();
        
        // Guardar los cambios
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
        
        // También actualizar en la carrera actual si existe
        if (appState.currentRace) {
            saveRaceData();
        }
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        // Mostrar mensaje de éxito
        const t = translations[appState.currentLanguage];
        showMessage(t.orderDeleted || 'Orden de salida eliminado correctamente', 'success');
        
        console.log("Orden de salida eliminado completamente");
    });
    
    // Cancelar eliminación
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.deleteCancelled || 'Eliminación cancelada', 'info');
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
    
    // Prevenir que el evento se propague al contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function addDeleteOrderModalStyles() {
    if (document.getElementById('delete-order-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'delete-order-modal-styles';
    style.textContent = `
        /* Estilos para el modal de eliminar orden */
        #delete-order-confirm-modal .modal-content {
            max-width: 500px;
        }
        
        .delete-confirm-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px 10px;
        }
        
        .warning-icon-large {
            font-size: 3.5rem;
            color: #dc3545;
            margin-bottom: 20px;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .warning-content {
            width: 100%;
        }
        
        .warning-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--danger);
            margin-bottom: 10px;
        }
        
        .warning-subtitle {
            font-size: 1rem;
            color: var(--gray);
            margin-bottom: 25px;
        }
        
        .delete-stats {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .stat-item i {
            font-size: 1.8rem;
            color: var(--danger);
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .stat-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--danger);
        }
        
        .data-preview-small {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .data-preview-small h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--gray-dark);
            font-size: 1rem;
            text-align: center;
        }
        
        .preview-scroll {
            max-height: 150px;
            overflow-y: auto;
            padding: 5px;
        }
        
        .mini-preview-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .mini-preview-table tr {
            border-bottom: 1px solid #dee2e6;
        }
        
        .mini-preview-table tr:last-child {
            border-bottom: none;
        }
        
        .mini-preview-table td {
            padding: 8px 5px;
            text-align: left;
        }
        
        .preview-order {
            width: 20%;
            font-weight: 600;
            color: var(--primary);
        }
        
        .preview-dorsal {
            width: 15%;
            font-weight: 600;
            color: var(--info);
        }
        
        .preview-name {
            width: 45%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--dark);
        }
        
        .preview-time {
            width: 20%;
            font-family: 'Courier New', monospace;
            color: var(--success);
        }
        
        .preview-more-info {
            text-align: center;
            padding: 10px;
            color: var(--gray);
            font-style: italic;
            font-size: 0.9rem;
        }
        
        .preview-more-info i {
            margin-right: 5px;
        }
        
        /* Scrollbar personalizada */
        .preview-scroll::-webkit-scrollbar {
            width: 6px;
        }
        
        .preview-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        .preview-scroll::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        
        .preview-scroll::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Modal footer específico */
        #delete-order-confirm-modal .modal-footer {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding: 20px;
            border-top: 1px solid #dee2e6;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            #delete-order-confirm-modal .modal-content {
                margin: 15px;
                width: calc(100% - 30px);
            }
            
            .delete-stats {
                flex-direction: column;
                gap: 20px;
            }
            
            #delete-order-confirm-modal .modal-footer {
                flex-direction: column;
            }
            
            #delete-order-confirm-modal .modal-footer button {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
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
    updateStartOrderTableThrottled();
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
    
    updateStartOrderTableThrottled();
    
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
        showMessage(t.noRaceSelected || 'No hay carrera seleccionada', 'warning');
        return;
    }
    
    // Mostrar mensaje de progreso
    showMessage(t.creatingBackup || 'Creando copia de seguridad...', 'info');
    
    // Buscar la carrera completa en el array de carreras
    const raceInArray = appState.races.find(r => r.id === appState.currentRace.id);
    
    if (!raceInArray) {
        showMessage('No se encontraron datos completos de la carrera', 'error');
        return;
    }
    
    // Preparar datos COMPLETOS de la carrera
    const raceBackupData = {
        version: '1.0',
        appName: 'Crono CRI',
        exportDate: new Date().toISOString(),
        exportVersion: 'V_19_12_2025',
        dataType: 'single-race',
        race: {
            // Copiar TODOS los datos de la carrera del array
            id: raceInArray.id,
            name: raceInArray.name,
            date: raceInArray.date || new Date().toISOString().split('T')[0],
            category: raceInArray.category || '',
            organizer: raceInArray.organizer || '',
            location: raceInArray.location || '',
            modality: raceInArray.modality || 'CRI',
            description: raceInArray.description || '',
            firstStartTime: raceInArray.firstStartTime || '09:00:00',
            createdAt: raceInArray.createdAt,
            lastModified: new Date().toISOString(),
            departures: raceInArray.departures ? [...raceInArray.departures] : [],
            intervals: raceInArray.intervals ? [...raceInArray.intervals] : [],
            startOrder: raceInArray.startOrder ? [...raceInArray.startOrder] : [],
            metadata: raceInArray.metadata || {},
            
            // Incluir todos los datos adicionales que pueda tener
            ...(raceInArray.llegadas && { llegadas: [...raceInArray.llegadas] })
        },
        // Incluir también datos del estado actual relacionados con esta carrera
        currentState: {
            departureTimes: appState.departureTimes ? [...appState.departureTimes] : [],
            departedCount: appState.departedCount,
            raceStartTime: appState.raceStartTime,
            nextCorredorTime: appState.nextCorredorTime,
            countdownActive: appState.countdownActive,
            countdownPaused: appState.countdownPaused,
            countdownValue: appState.countdownValue
        },
        metadata: {
            raceName: raceInArray.name,
            raceDate: raceInArray.date,
            raceCategory: raceInArray.category,
            raceModality: raceInArray.modality,
            totalDepartures: raceInArray.departures ? raceInArray.departures.length : 0,
            totalInStartOrder: raceInArray.startOrder ? raceInArray.startOrder.length : 0,
            backupDate: new Date().toLocaleDateString('es-ES'),
            backupTime: new Date().toLocaleTimeString('es-ES')
        }
    };
    
    // Incluir datos de llegadas del estado global si existen para esta carrera
    if (llegadasState.llegadas && llegadasState.llegadas.length > 0) {
        // Filtrar llegadas por carrera (si tienes un campo de identificación de carrera)
        const raceLlegadas = llegadasState.llegadas.filter(llegada => {
            // Añadir lógica de filtrado si es necesario
            return true; // Por ahora incluye todas
        });
        
        if (raceLlegadas.length > 0) {
            raceBackupData.race.llegadas = [...raceLlegadas];
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
    const safeRaceName = raceInArray.name
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
    
    // Mostrar mensaje de éxito - CORREGIDO
    const successMessage = t.backupCreated ? 
        t.backupCreated.replace('{filename}', filename) : 
        `Copia de seguridad creada: ${filename}`;
    
    let detailMessage = `${totalDepartures} salidas`;
    
    if (totalInOrder > 0) {
        detailMessage += `, ${totalInOrder} en orden de salida`;
    }
    
    if (totalLlegadas > 0) {
        detailMessage += `, ${totalLlegadas} llegadas`;
    }
    
    // Añadir información básica de la carrera
    detailMessage += ` | ${raceInArray.name}`;
    if (raceInArray.date) {
        detailMessage += ` (${raceInArray.date})`;
    }
    if (raceInArray.category) {
        detailMessage += ` - ${raceInArray.category}`;
    }
    
    showMessage(`${successMessage} - ${detailMessage}`, 'success');
    
    console.log("Copia de seguridad de carrera creada:", filename);
    console.log("Carrera:", raceInArray.name, "ID:", raceInArray.id);
    console.log("Datos incluidos:", raceBackupData.metadata);
    
    // Mostrar detalles en consola para depuración
    console.log("Detalles completos de la carrera guardada:", {
        nombre: raceInArray.name,
        fecha: raceInArray.date,
        categoria: raceInArray.category,
        modalidad: raceInArray.modality,
        organizador: raceInArray.organizer,
        ubicacion: raceInArray.location,
        descripcion: raceInArray.description,
        horaInicio: raceInArray.firstStartTime,
        salidas: totalDepartures,
        ordenSalida: totalInOrder,
        llegadas: totalLlegadas
    });
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
        
        // Preparar datos restaurados COMPLETOS
        let restoredRace = {
            id: backupData.race.id,
            name: backupData.race.name,
            date: backupData.race.date || new Date().toISOString().split('T')[0],
            category: backupData.race.category || '',
            organizer: backupData.race.organizer || '',
            location: backupData.race.location || '',
            modality: backupData.race.modality || 'CRI',
            description: backupData.race.description || '',
            firstStartTime: backupData.race.firstStartTime || '09:00:00',
            createdAt: backupData.race.createdAt,
            lastModified: new Date().toISOString(),
            metadata: backupData.race.metadata || {}
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
            // También restaurar configuración si existe
            if (backupData.race.firstStartTime) {
                restoredRace.firstStartTime = backupData.race.firstStartTime;
            }
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
            const originalId = appState.races[existingRaceIndex].id;
            const originalCreatedAt = appState.races[existingRaceIndex].createdAt;
            
            // Preservar ID y fecha de creación original
            restoredRace.id = originalId;
            restoredRace.createdAt = originalCreatedAt;
            
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
            
            // Actualizar campos en la UI si es necesario
            if (selectedData.includes('config')) {
                // Actualizar hora de inicio en el input
                const firstStartTimeInput = document.getElementById('first-start-time');
                if (firstStartTimeInput && restoredRace.firstStartTime) {
                    firstStartTimeInput.value = restoredRace.firstStartTime;
                }
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
            updateStartOrderTableThrottled();
            updateRaceManagementCardTitle();
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
        
        console.log("Carrera restaurada COMPLETA:", {
            nombre: restoredRace.name,
            fecha: restoredRace.date,
            categoria: restoredRace.category,
            modalidad: restoredRace.modality,
            salidas: restoredRace.departures.length,
            ordenSalida: restoredRace.startOrder.length,
            llegadas: restoredRace.llegadas ? restoredRace.llegadas.length : 0
        });
        
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
    // Verificar si ya se inicializó
    if (window.backupModuleInitialized) {
        console.log("Módulo de backup ya inicializado");
        return;
    }
    
    if (typeof setupBackupEventListeners === 'function') {
        setupBackupEventListeners();
        window.backupModuleInitialized = true;
        console.log("Módulo de backup inicializado");
    }
}

function setupRaceFormEvents() {
    // Verificar si ya se configuró
    if (window.raceFormEventsConfigured) {
        console.log("Eventos del formulario de carrera ya configurados");
        return;
    }
    
    console.log("Configurando eventos del formulario de carrera...");
    
    // Mostrar/ocultar campo de "Otras modalidades"
    document.querySelectorAll('input[name="modality"]').forEach(input => {
        input.addEventListener('change', function() {
            const otherContainer = document.getElementById('other-modality-container');
            if (this.value === 'Otras') {
                otherContainer.style.display = 'block';
                document.getElementById('new-race-other-modality').focus();
            } else {
                otherContainer.style.display = 'none';
                document.getElementById('new-race-other-modality').value = '';
            }
        });
    });
    
    // Validación en tiempo real del nombre
    const nameInput = document.getElementById('new-race-name');
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('invalid-input');
            } else {
                this.classList.remove('invalid-input');
            }
        });
    }
    
    window.raceFormEventsConfigured = true;
    console.log("Eventos del formulario de carrera configurados");
}
// ============================================
// FUNCIÓN PARA EDITAR DETALLES DE LA CARRERA
// ============================================
function editRaceDetails() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst || 'Selecciona una carrera primero', 'error');
        return;
    }
    
    const race = appState.currentRace;
    const modal = document.getElementById('edit-race-modal');
    
    if (!modal) {
        console.error("Modal de edición de carrera no encontrado");
        showMessage("Error: No se puede abrir el editor", 'error');
        return;
    }
    
    // Llenar el formulario con los datos actuales
    document.getElementById('edit-race-name').value = race.name;
    document.getElementById('edit-race-category').value = race.category || '';
    document.getElementById('edit-race-organizer').value = race.organizer || '';
    document.getElementById('edit-race-location').value = race.location || '';
    document.getElementById('edit-race-date').value = race.date || new Date().toISOString().split('T')[0];
    document.getElementById('edit-race-description').value = race.description || '';
    
    // Configurar modalidad
    const modality = race.modality || 'CRI';
    const originalModality = race.metadata?.originalModality || 'CRI';
    
    // Resetear todos los radios primero
    document.querySelectorAll('input[name="edit-modality"]').forEach(radio => {
        radio.checked = false;
    });
    
    if (originalModality === 'CRI') {
        document.getElementById('edit-modality-cri').checked = true;
    } else if (originalModality === 'CRE') {
        document.getElementById('edit-modality-cre').checked = true;
    } else if (originalModality === 'Descenso') {
        document.getElementById('edit-modality-descenso').checked = true;
    } else if (originalModality === 'Otras') {
        document.getElementById('edit-modality-otras').checked = true;
        document.getElementById('edit-race-other-modality').value = modality;
        document.getElementById('edit-other-modality-container').style.display = 'block';
    } else {
        // Si es una modalidad personalizada
        document.getElementById('edit-modality-otras').checked = true;
        document.getElementById('edit-race-other-modality').value = modality;
        document.getElementById('edit-other-modality-container').style.display = 'block';
    }
    
    // Mostrar/ocultar campo de otras modalidades
    const otherContainer = document.getElementById('edit-other-modality-container');
    if (originalModality === 'Otras' || !['CRI', 'CRE', 'Descenso'].includes(originalModality)) {
        otherContainer.style.display = 'block';
    } else {
        otherContainer.style.display = 'none';
    }
    
    // Mostrar información de creación
    if (race.createdAt) {
        const createdDate = new Date(race.createdAt);
        document.getElementById('edit-race-created-at').textContent = 
            createdDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    }
    
    if (race.lastModified) {
        const modifiedDate = new Date(race.lastModified);
        document.getElementById('edit-race-last-modified').textContent = 
            modifiedDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    }
    
    // Configurar eventos de modalidad
    document.querySelectorAll('input[name="edit-modality"]').forEach(input => {
        input.addEventListener('change', function() {
            const otherEditContainer = document.getElementById('edit-other-modality-container');
            if (this.value === 'Otras') {
                otherEditContainer.style.display = 'block';
                document.getElementById('edit-race-other-modality').focus();
            } else {
                otherEditContainer.style.display = 'none';
                document.getElementById('edit-race-other-modality').value = '';
            }
        });
    });
    
    // Configurar botón de guardar
    const saveBtn = modal.querySelector('#save-edit-race-btn');
    if (saveBtn) {
        saveBtn.onclick = saveEditedRace;
    }
    
    // Configurar botón de cancelar
    const cancelBtn = modal.querySelector('#cancel-edit-race-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modal.classList.remove('active');
        };
    }
    
    // Configurar cierre del modal
    const closeBtn = modal.querySelector('#edit-race-modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.classList.remove('active');
        };
    }
    
    // Cerrar al hacer clic fuera
    modal.onclick = function(e) {
        if (e.target === this) {
            modal.classList.remove('active');
        }
    };
    
    // Mostrar modal
    modal.classList.add('active');
    document.getElementById('edit-race-name').focus();
    
    console.log("Editando carrera:", race.name, "ID:", race.id);
}

// ============================================
// FUNCIÓN PARA GUARDAR CARRERA EDITADA (CON VALIDACIÓN)
// ============================================
function saveEditedRace() {
    const t = translations[appState.currentLanguage];
    const modal = document.getElementById('edit-race-modal');
    
    // Verificar que el modal existe
    if (!modal) {
        console.error("Modal de edición no encontrado");
        showMessage("Error: No se puede guardar los cambios", 'error');
        return;
    }
    
    // Obtener elementos con verificación
    const nameElement = document.getElementById('edit-race-name');
    const categoryElement = document.getElementById('edit-race-category');
    const organizerElement = document.getElementById('edit-race-organizer');
    const locationElement = document.getElementById('edit-race-location');
    const dateElement = document.getElementById('edit-race-date');
    const descriptionElement = document.getElementById('edit-race-description');
    const otherModalityElement = document.getElementById('edit-race-other-modality');
    
    // Verificar que todos los elementos requeridos existen
    if (!nameElement || !dateElement) {
        console.error("Elementos del formulario no encontrados");
        console.log("Elementos encontrados:", {
            nameElement: !!nameElement,
            categoryElement: !!categoryElement,
            organizerElement: !!organizerElement,
            locationElement: !!locationElement,
            dateElement: !!dateElement,
            descriptionElement: !!descriptionElement,
            otherModalityElement: !!otherModalityElement
        });
        showMessage("Error: Formulario incompleto", 'error');
        return;
    }
    
    // Obtener valores del formulario
    const name = nameElement.value.trim();
    const category = categoryElement ? categoryElement.value.trim() : '';
    const organizer = organizerElement ? organizerElement.value.trim() : '';
    const location = locationElement ? locationElement.value.trim() : '';
    const date = dateElement.value;
    const description = descriptionElement ? descriptionElement.value.trim() : '';
    
    // Obtener modalidad
    const modalityInput = document.querySelector('input[name="edit-modality"]:checked');
    let modality = modalityInput ? modalityInput.value : 'CRI';
    let otherModality = '';
    
    if (modality === 'Otras' && otherModalityElement) {
        otherModality = otherModalityElement.value.trim();
        if (otherModality) {
            modality = otherModality;
        }
    }
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName || 'Introduce un nombre para la carrera', 'error');
        nameElement.focus();
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate || 'Introduce una fecha válida', 'error');
        dateElement.focus();
        return;
    }
    
    // Buscar el índice de la carrera actual
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    
    if (raceIndex === -1) {
        showMessage(t.raceNotFound || 'Carrera no encontrada', 'error');
        modal.classList.remove('active');
        return;
    }
    
    // Crear copia actualizada de la carrera
    const updatedRace = {
        ...appState.currentRace, // Mantener todas las propiedades existentes
        name: name,
        category: category,
        organizer: organizer,
        location: location,
        date: date,
        modality: modality,
        description: description,
        lastModified: new Date().toISOString()
    };
    
    // Actualizar metadata si existe
    if (!updatedRace.metadata) {
        updatedRace.metadata = {};
    }
    updatedRace.metadata.originalModality = modalityInput ? modalityInput.value : 'CRI';
    updatedRace.metadata.otherModality = otherModality;
    
    // Actualizar la carrera en el array
    appState.races[raceIndex] = updatedRace;
    
    // Actualizar la carrera actual
    appState.currentRace = updatedRace;
    
    // Guardar en localStorage
    saveRacesToStorage();
    
    // Actualizar el selector de carreras
    renderRacesSelect();
    
    // Actualizar título de la tarjeta de gestión
    updateRaceManagementCardTitle();
    
    // Cerrar modal
    modal.classList.remove('active');
    
    // Mostrar mensaje de éxito
    showMessage(t.raceUpdated || 'Carrera actualizada correctamente', 'success');
    
    console.log(`Carrera "${name}" actualizada correctamente`, {
        id: updatedRace.id,
        name: updatedRace.name,
        date: updatedRace.date,
        category: updatedRace.category,
        modality: updatedRace.modality
    });
}

function saveRaceChanges() {
    const t = translations[appState.currentLanguage];
    
    // Obtener valores del formulario
    const name = document.getElementById('new-race-name').value.trim();
    const date = document.getElementById('new-race-date').value;
    const category = document.getElementById('new-race-category').value;
    const organizer = document.getElementById('new-race-organizer').value.trim();
    const location = document.getElementById('new-race-location').value.trim();
    const description = document.getElementById('new-race-description').value.trim();
    
    // Obtener modalidad
    const modalityInput = document.querySelector('input[name="modality"]:checked');
    let modality = modalityInput ? modalityInput.value : 'CRI';
    let otherModality = '';
    
    if (modality === 'Otras') {
        otherModality = document.getElementById('new-race-other-modality').value.trim();
        if (otherModality) {
            modality = otherModality;
        }
    }
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate, 'error');
        return;
    }
    
    // Actualizar carrera actual
    appState.currentRace.name = name;
    appState.currentRace.date = date;
    appState.currentRace.category = category;
    appState.currentRace.organizer = organizer;
    appState.currentRace.location = location;
    appState.currentRace.modality = modality;
    appState.currentRace.description = description;
    appState.currentRace.lastModified = new Date().toISOString();
    
    if (!appState.currentRace.metadata) {
        appState.currentRace.metadata = {};
    }
    appState.currentRace.metadata.originalModality = modalityInput ? modalityInput.value : 'CRI';
    appState.currentRace.metadata.otherModality = otherModality;
    
    // Actualizar en el array de carreras
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races[raceIndex] = { ...appState.currentRace };
    }
    
    // Guardar cambios
    saveRacesToStorage();
    renderRacesSelect();
    
    // Cerrar modal y resetear
    document.getElementById('new-race-modal').classList.remove('active');
    resetRaceForm();
    
    // Restaurar botón original
    const createBtn = document.getElementById('create-race-btn');
    createBtn.textContent = t.createRace || 'Crear carrera';
    createBtn.onclick = createNewRace;
    
    // Actualizar título del modal
    document.getElementById('new-race-modal-title').textContent = t.newRaceModalTitle || 'Nueva carrera';
    
    // Mostrar mensaje de éxito
    showMessage(t.raceUpdated || 'Carrera actualizada correctamente', 'success');
    
    // Actualizar título de la tarjeta
    updateRaceManagementCardTitle();
    
    console.log("Carrera actualizada:", appState.currentRace);
}