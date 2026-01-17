// ============================================
// PUNTO DE ENTRADA Y CONFIGURACIÓN GLOBAL
// ============================================
// DESCRIPCIÓN: Punto de entrada principal y configuración global
// RESPONSABILIDADES:
// 1. Definición de estados globales de la aplicación
// 2. Inicialización coordinada de todos los módulos
// 3. Configuración de event listeners principales
// 4. Gestión de dependencias y orden de inicialización
// 5. Atajos de teclado globales
//
// ESTADOS GLOBALES DEFINIDOS:
// - appState: Estado principal (carrera, countdown, audio, etc.)
// - llegadasState: Estado específico del módulo de llegadas
// - sortState: Estado de ordenación de tablas
// - startOrderData: Datos de orden de salida (array)
//
// FUNCIONES CRÍTICAS:
// - initApp(): Inicialización principal coordinada
// - setupEventListeners(): Configura listeners globales
// - setupStartOrderEventListeners(): Listeners específicos de orden
// - handleRaceChange(): Gestor de cambio de carrera
//
// DEPENDENCIAS:
// → Todos los módulos: Los inicializa en orden específico
// → appState: Referenciado por todos los módulos
// → translations: Sistema de internacionalización
//
// ORDEN DE INICIALIZACIÓN:
// 1. Carga preferencias y datos guardados
// 2. Inicialización UI básica
// 3. Carga datos de carrera y orden de salida
// 4. Configuración de listeners
// 5. Inicialización de módulos especializados
// 6. Configuración PWA y timers
// ============================================
/**
 * =========================================================
 * CRONO CRI – MAIN (Bootstrap / Orquestador)
 * =========================================================
 * Punto de entrada y coordinación global de la aplicación.
 *
 * --- ESTADO GLOBAL ---
 * appState                → Estado principal de la app
 * llegadasState           → Estado del modo llegadas
 * sortState               → Estado de ordenación tablas
 * startOrderData          → Datos del orden de salida
 *
 * --- INICIALIZACIÓN ---
 * initApp()               → Inicialización completa y ordenada
 *
 * --- EVENTOS GLOBALES ---
 * setupEventListeners()   → Listeners generales UI + teclado
 * setupStartOrderEventListeners() → Listeners orden de salida
 *
 * --- CAMBIO DE CONTEXTO ---
 * handleRaceChange()      → Cambio de carrera activa
 *
 * --- UTILIDADES ---
 * openSuggestionsEmail()  → Envío de sugerencias por email
 * handleKeyboardShortcuts() → Atajos de teclado adicionales
 *
 * =========================================================
 * NOTAS:
 * - Archivo actúa como "God Bootstrap"
 * - Mezcla estado, UI, lógica y timers
 * - Existen duplicaciones de estado global
 * - Hay listeners y timers fuera de initApp()
 * =========================================================
 */

// ============================================
// SISTEMA DE LOGGING OPTIMIZADO
// ============================================
const LOG_LEVEL = {
    ERROR: 0,   // 🚨 Solo errores críticos
    WARN: 1,    // ⚠️ Problemas recuperables
    INFO: 2,    // ✅ Confirmaciones importantes
    DEBUG: 3    // 🔍 Solo desarrollo
};

// Nivel actual: cambiar a LOG_LEVEL.INFO para producción
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

function log(level, message, data = null) {
    if (level <= CURRENT_LOG_LEVEL) {
        const prefixes = ['🚨', '⚠️', '✅', '🔍'];
        const prefix = prefixes[level] || '';
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
}

// Función auxiliar para llamar funciones solo si existen
function callIfFunction(fn, fallbackMessage = null) {
    if (typeof fn === 'function') {
        return fn();
    } else if (fallbackMessage) {
        log(LOG_LEVEL.WARN, fallbackMessage);
    }
    return null;
}

// ============================================
// ESTADO DE LA APLICACIÓN
// ============================================
const appState = {
    audioType: 'beep',
    voiceAudioCache: {},
    currentLanguage: 'es',
    currentRace: null,
    races: [],
    countdownActive: false,
    countdownValue: 0,
    countdownInterval: null,
    raceStartTime: null,
    departedCount: 0,
    nextCorredorTime: 60,
    intervals: [],
    currentIntervalIndex: 0,
    audioContext: null,
    isSalidaShowing: false,
    salidaTimeout: null,
    deferredPrompt: null,
    updateAvailable: false,
    countdownPaused: false,
    accumulatedTime: 0,
    configModalOpen: false,
    variableIntervalConfig: { intervals: [], saved: false },
    soundEnabled: true,
    aggressiveMode: false
};

// ESTADO DEL MODO LLEGADAS
let llegadasState = {
    timerActive: false,
    startTime: null,
    currentTime: 0,
    timerInterval: null,
    llegadas: [],
    importedSalidas: [],
    timerStarted: false
};

// ESTADO DE ORDENACIÓN
let sortState = { column: 'time', direction: 'desc' };

// DATOS DE ORDEN DE SALIDA
let startOrderData = [];

// ============================================
// INICIALIZACIÓN PRINCIPAL DE LA APLICACIÓN
// ============================================
function initApp() {
    
    // Verificar si ya se inicializó
    if (window.appInitialized) {
        log(LOG_LEVEL.WARN, "La aplicación ya está inicializada");
        return;
    }
    
    // Marcar como inicializada
    window.appInitialized = true;
    
    // Inicializar estado global
    if (!window.appState) {
        window.appState = {
            audioType: 'beep',
            currentLanguage: 'es',
            soundEnabled: true,
            aggressiveMode: false,
            currentRace: null,
            races: [],
            countdownActive: false,
            countdownValue: 0,
            departedCount: 0,
            intervals: [],
            currentIntervalIndex: 0,
            nextCorredorTime: 60,
            accumulatedTime: 0,
            countdownPaused: false,
            configModalOpen: false,
            raceStartTime: null,
            audioContext: null,
            voiceAudioCache: {},
            deferredPrompt: null,
            updateAvailable: false
        };
    }
    
    // ============================================
    // INICIALIZACIÓN DEL SISTEMA DE AUDIO
    // ============================================
    
    // 1. Cargar preferencias de audio
    if (typeof loadAudioPreferences === 'function') {
        loadAudioPreferences();
    } else {
        log(LOG_LEVEL.WARN, "Función loadAudioPreferences no disponible - usando valores por defecto");
        // Cargar preferencia manualmente si la función no existe
        const savedAudioType = localStorage.getItem('countdown-audio-type');
        if (savedAudioType && ['beep', 'voice', 'none'].includes(savedAudioType)) {
            appState.audioType = savedAudioType;
            log(LOG_LEVEL.INFO, `Preferencia de audio cargada: ${savedAudioType}`);
        }
    }
    
    // 2. Configurar listeners de botones de audio
    if (typeof setupAudioEventListeners === 'function') {
        setupAudioEventListeners();
    } else {
        log(LOG_LEVEL.ERROR, "Función setupAudioEventListeners no disponible - botones de audio NO funcionarán");
    }
    
    // Inicializar estado de llegadas si no existe
    if (!window.llegadasState) {
        window.llegadasState = {
            timerActive: false,
            startTime: null,
            currentTime: 0,
            llegadas: []
        };
    }
    
    // Inicializar estado de ordenación si no existe
    if (!window.sortState) {
        window.sortState = {
            column: 'order',
            direction: 'asc'
        };
    }
    
    // Inicializar datos de orden de salida si no existen
    if (!window.startOrderData) {
        window.startOrderData = [];
    }

    // Inicializar sistema de cuenta atrás
    if (typeof inicializarSistemaCuentaAtras === 'function') {
        inicializarSistemaCuentaAtras();
    }
    
    // Cargar preferencia de idioma
    if (typeof loadLanguagePreference === 'function') {
        loadLanguagePreference();
    }
    
    // Cargar carreras desde almacenamiento
    if (typeof loadRacesFromStorage === 'function') {
        loadRacesFromStorage();
    }
    
    // Si hay carrera guardada como actual, cargarla
    const savedCurrentRace = localStorage.getItem('countdown-current-race');
    if (savedCurrentRace) {
        try {
            appState.currentRace = JSON.parse(savedCurrentRace);
            log(LOG_LEVEL.INFO, `Carrera actual cargada: ${appState.currentRace?.name || "Ninguna"}`);
        } catch (error) {
            log(LOG_LEVEL.ERROR, "Error cargando carrera actual:", error);
            appState.currentRace = null;
        }
    }
    
    // Cargar estado de la aplicación
    if (typeof loadAppState === 'function') {
        loadAppState();
    }
    
    // Actualizar UI al idioma actual
    if (typeof updateLanguageUI === 'function') {
        updateLanguageUI();
    } else {
        log(LOG_LEVEL.ERROR, "Función updateLanguageUI no disponible");
    }
    
    // Configuraciones rápidas (sin logs individuales)
    const quickConfigs = [
        { fn: addDisabledButtonStyles, name: 'addDisabledButtonStyles' },
        { fn: updateDeleteRaceButtonState, name: 'updateDeleteRaceButtonState' },
        { fn: updateRaceActionButtonsState, name: 'updateRaceActionButtonsState' },
        { fn: renderRacesSelect, name: 'renderRacesSelect' },
        { fn: loadRaceData, name: 'loadRaceData' },
        { fn: setupTimeInputs, name: 'setupTimeInputs' },
        { fn: setupEventListeners, name: 'setupEventListeners' },
        { fn: setupStartOrderEventListeners, name: 'setupStartOrderEventListeners' },
        { fn: setupCardToggles, name: 'setupCardToggles' },
        { fn: initModeSlider, name: 'initModeSlider' },
        { fn: setupModalEventListeners, name: 'setupModalEventListeners' },
        { fn: setupModalActionListeners, name: 'setupModalActionListeners' },
        { fn: setupLanguageButtons, name: 'setupLanguageButtons' },
        { fn: setupServiceWorker, name: 'setupServiceWorker' },
        { fn: setupPWA, name: 'setupPWA' },
        { fn: initRaceManagementCard, name: 'initRaceManagementCard' },
        { fn: loadStartOrderData, name: 'loadStartOrderData' },
        { fn: initPDFModule, name: 'initPDFModule' },
        { fn: initBackupModule, name: 'initBackupModule' },
        { fn: preloadVoiceAudios, name: 'preloadVoiceAudios' },
        { fn: setupPDFExportButton, name: 'setupPDFExportButton' },
        { fn: setupRaceFormEvents, name: 'setupRaceFormEvents' },
        { fn: setupStartOrderTableSorting, name: 'setupStartOrderTableSorting' }
    ];
    
    let configSuccess = 0;
    let configErrors = 0;
    
    quickConfigs.forEach(config => {
        if (typeof config.fn === 'function') {
            try {
                config.fn();
                configSuccess++;
            } catch (error) {
                log(LOG_LEVEL.WARN, `Error en ${config.name}:`, error);
                configErrors++;
            }
        } else {
            log(LOG_LEVEL.DEBUG, `Función ${config.name} no disponible`);
        }
    });
    
    // Actualizar tabla de orden de salida (una vez al final)
    log(LOG_LEVEL.DEBUG, `startOrderData disponible: ${!!startOrderData}, longitud: ${startOrderData?.length || 0}`);
    
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled();
    }
    
    // Iniciar intervalos de tiempo
    setupTimeIntervals();
    
    log(LOG_LEVEL.INFO, `Configuraciones completadas: ${configSuccess} éxitos, ${configErrors} errores`);
    log(LOG_LEVEL.INFO, `Estado final - Carrera: ${appState.currentRace?.name || "Ninguna"}, Corredores: ${startOrderData?.length || 0}, Audio: ${appState.audioType}`);
    
    // Marcar como completamente inicializada
    setTimeout(() => {
        window.appFullyInitialized = true;
        log(LOG_LEVEL.INFO, "Aplicación completamente inicializada y lista");
    }, 500);

    callIfFunction(setupDeleteRiderButton, "setupDeleteRiderButton");
    setupStartOrderTableRowSelection();
}

// Guardar estado antes de cerrar
window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) {
        if (typeof saveLastUpdate === 'function') saveLastUpdate();
    }
});

// ============================================
// FUNCIÓN AUXILIAR PARA INTERVALOS DE TIEMPO
// ============================================
function setupTimeIntervals() {
    // 1. Hora del sistema
    if (typeof updateSystemTimeDisplay === 'function') {
        updateSystemTimeDisplay();
        setInterval(updateSystemTimeDisplay, 1000);
    } else {
        // Fallback simple
        const updateCurrentTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('es-ES', { hour12: false });
            const currentTimeElement = document.getElementById('current-time-value');
            if (currentTimeElement) {
                currentTimeElement.textContent = timeString;
            }
        };
        updateCurrentTime();
        setInterval(updateCurrentTime, 1000);
    }
    
    // 2. Redimensionamiento
    if (typeof setupCountdownResize === 'function') {
        setupCountdownResize();
    }
    
    // 3. Actualización de cuenta atrás
    function updateCountdownIfActive() {
        if (appState.countdownActive && typeof updateCountdownDisplay === 'function') {
            updateCountdownDisplay();
        }
    }
    setInterval(updateCountdownIfActive, 1000);
    
    log(LOG_LEVEL.DEBUG, "Intervalos de tiempo configurados");
}

// ============================================
// EVENT LISTENERS PRINCIPALES
// ============================================
function setupEventListeners() {
    log(LOG_LEVEL.INFO, "Configurando event listeners principales...");
    
    // Manejadores auxiliares
    const handleLanguageChange = function(e) {
        const newLanguage = e.target.value;
        if (window.appState && window.appState.currentLanguage !== newLanguage) {
            window.appState.currentLanguage = newLanguage;
            callIfFunction(updateLanguageUI, "Función updateLanguageUI no disponible");
            localStorage.setItem('cri_language', newLanguage);
            log(LOG_LEVEL.INFO, `Idioma cambiado a: ${newLanguage}`);
        }
    };
    
    const handleAudioTypeChange = function(e) {
        if (window.appState) {
            window.appState.audioType = e.target.value;
            localStorage.setItem('cri_audio_type', e.target.value);
        }
    };
    
    const openHelpFile = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        log(LOG_LEVEL.INFO, "Abriendo archivo de ayuda...");
        window.open('Crono_CRI_ayuda.html', '_blank');
    };
    
    const openSuggestionsModal = function(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        log(LOG_LEVEL.INFO, "Abriendo modal de sugerencias...");
        const suggestionsModal = document.getElementById('suggestions-modal');
        if (suggestionsModal) {
            suggestionsModal.classList.add('active');
            
            // Resetear formulario
            setTimeout(() => {
                const emailInput = document.getElementById('email-suggestions');
                const cityInput = document.getElementById('city-suggestions');
                const suggestionInput = document.getElementById('suggestion-text');
                
                if (emailInput) {
                    emailInput.value = '';
                    emailInput.focus();
                }
                if (cityInput) cityInput.value = '';
                if (suggestionInput) suggestionInput.value = '';
            }, 100);
        } else {
            log(LOG_LEVEL.WARN, "Modal de sugerencias no encontrado - usando fallback a email");
            openSuggestionsEmail();
        }
    };
    
    const handleModeChange = function(e) {
        if (window.isModeChanging) return;
        window.isModeChanging = true;
        
        const newMode = e.target.checked ? 'llegadas' : 'salidas';
        log(LOG_LEVEL.INFO, `Cambiando modo a: ${newMode}`);
        
        callIfFunction(() => switchAppMode(newMode), `Función switchAppMode no disponible para modo ${newMode}`);
        
        setTimeout(() => {
            window.isModeChanging = false;
        }, 100);
    };
    
    // Lista de listeners principales
    const listeners = [
        { id: 'language-selector', event: 'change', handler: handleLanguageChange },
        { id: 'audio-type-selector', event: 'change', handler: handleAudioTypeChange },
        { id: 'race-selector', event: 'change', handler: handleRaceChange },
        { id: 'new-race-btn', event: 'click', handler: () => callIfFunction(showNewRaceModal, "Función showNewRaceModal no disponible") },
        { id: 'edit-race-btn', event: 'click', handler: () => callIfFunction(editRaceDetails, "Función editRaceDetails no disponible") },
        { id: 'delete-race-btn', event: 'click', handler: () => callIfFunction(deleteCurrentRace, "Función deleteCurrentRace no disponible") },
        { id: 'export-pdf-btn', event: 'click', handler: () => callIfFunction(generateStartOrderPDF, "Función generateStartOrderPDF no disponible") },
        { id: 'backup-btn', event: 'click', handler: () => callIfFunction(createRaceBackup, "Función createRaceBackup no disponible") },
        { id: 'restore-btn', event: 'click', handler: () => callIfFunction(restoreRaceFromBackup, "Función restoreRaceFromBackup no disponible") },
        { id: 'clear-data-btn', event: 'click', handler: () => callIfFunction(clearAppData, "Función clearAppData no disponible") },
        { id: 'help-btn', event: 'click', handler: openHelpFile },
        { id: 'footer-help-btn', event: 'click', handler: openHelpFile },
        { id: 'suggestions-btn', event: 'click', handler: openSuggestionsModal },
        { id: 'mode-slider', event: 'change', handler: handleModeChange }
    ];
    
    let listenersConfigured = 0;
    let listenersFailed = 0;
    
    listeners.forEach(listener => {
        const element = document.getElementById(listener.id);
        if (element) {
            try {
                element.addEventListener(listener.event, listener.handler);
                listenersConfigured++;
            } catch (error) {
                log(LOG_LEVEL.WARN, `Error configurando listener para ${listener.id}:`, error);
                listenersFailed++;
            }
        } else {
            log(LOG_LEVEL.DEBUG, `Elemento ${listener.id} no encontrado`);
        }
    });
    
    // Atajos de teclado globales
    document.addEventListener('keydown', function(e) {
        // Solo si no hay inputs activos
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case ' ': // Espacio - Iniciar/pausar cuenta atrás
                callIfFunction(toggleCountdown, "Función toggleCountdown no disponible");
                break;
            case 'Enter': // Enter - Registrar salida
                callIfFunction(registerDeparture, "Función registerDeparture no disponible");
                break;
            case 'Escape': // Escape - Cancelar modales
                const activeModal = document.querySelector('.modal.show');
                if (activeModal) {
                    const closeBtn = activeModal.querySelector('.modal-close, .btn-cancel');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                }
                break;
            case 'r': // R - Resetear cuenta atrás (con Ctrl)
                if (e.ctrlKey) {
                    callIfFunction(resetCountdown, "Función resetCountdown no disponible");
                }
                break;
            case 's': // S - Siguiente intervalo (con Ctrl)
                if (e.ctrlKey) {
                    callIfFunction(nextInterval, "Función nextInterval no disponible");
                }
                break;
        }
    });
    
    // Listeners específicos
    setupStartOrderEventListeners();
    
    // Configurar instalación PWA
    setupPWAInstallListener();
    
    // Listener para visibilidad de página
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && window.appState && window.appState.countdownActive) {
            log(LOG_LEVEL.DEBUG, "Página no visible - cuenta atrás activa");
        }
    });
    
    log(LOG_LEVEL.INFO, `Listeners configurados: ${listenersConfigured} éxitos, ${listenersFailed} fallos`);
}

// Configuración de instalación PWA
function setupPWAInstallListener() {
    // Botón de Instalar App (PWA)
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        // Ocultar inicialmente
        installBtn.style.display = 'none';
        
        // Configurar listener para when the beforeinstallprompt event is fired
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            window.deferredPrompt = e;
            
            // Mostrar el botón
            installBtn.style.display = 'flex';
            
            installBtn.addEventListener('click', async () => {
                if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    const choiceResult = await window.deferredPrompt.userChoice;
                    log(LOG_LEVEL.INFO, `Usuario eligió instalar: ${choiceResult.outcome}`);
                    window.deferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            });
        });
        
        // Verificar si ya está instalado
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            installBtn.style.display = 'none';
        }
    }
    
    // Botón de Buscar actualizaciones
    const updateBtn = document.getElementById('update-btn');
    if (updateBtn) {
        updateBtn.addEventListener('click', function(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            const protocol = window.location.protocol;
            const isFileProtocol = protocol === 'file:';
            const isLocalhost = window.location.hostname === 'localhost' || 
                               window.location.hostname === '127.0.0.1';
            const isHttps = protocol === 'https:';
            
            if (isFileProtocol) {
                log(LOG_LEVEL.WARN, "Service Workers no funcionan desde file://");
                callIfFunction(() => showMessage('Actualizaciones automáticas no disponibles desde archivos locales', 'warning'));
                return;
            }
            
            if (isLocalhost || isHttps) {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistration()
                        .then(registration => {
                            if (registration) {
                                registration.update();
                                callIfFunction(() => showMessage('Buscando actualizaciones...', 'info'));
                                
                                setTimeout(() => {
                                    if (window.updateAvailable) {
                                        callIfFunction(() => showMessage('¡Nueva versión disponible! Recarga la página.', 'success'));
                                    } else {
                                        callIfFunction(() => showMessage('Ya tienes la última versión', 'success'));
                                    }
                                }, 2000);
                            } else {
                                callIfFunction(() => showMessage('La aplicación debe instalarse primero para actualizaciones', 'info'));
                            }
                        })
                        .catch(error => {
                            log(LOG_LEVEL.ERROR, "Error buscando actualizaciones:", error);
                        });
                } else {
                    callIfFunction(() => showMessage('Navegador no compatible con actualizaciones automáticas', 'warning'));
                }
            } else {
                log(LOG_LEVEL.WARN, `Protocolo no soportado para Service Workers: ${protocol}`);
                callIfFunction(() => showMessage(`Usa HTTPS o localhost para actualizaciones automáticas`, 'info'));
            }
        });
    }
}

// Función auxiliar para abrir email de sugerencias
function openSuggestionsEmail() {
    const email = 'rbenet71@gmail.com';
    const subject = 'Sugerencias para Crono CRI';
    const body = `Hola Roberto,\n\nTengo algunas sugerencias para la aplicación Crono CRI:\n\n1. \n2. \n3. \n\n---\nApp: Crono CRI v3.7.5\nNavegador: ${navigator.userAgent}\nURL: ${window.location.href}`;
    
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.open(mailtoLink, '_blank');
}

// ============================================
// EVENT LISTENERS PARA ORDEN DE SALIDA
// ============================================
function setupStartOrderEventListeners() {
    if (window.startOrderListenersConfigured) {
        log(LOG_LEVEL.DEBUG, "Event listeners de orden de salida ya configurados");
        return;
    }
    
    log(LOG_LEVEL.INFO, "Configurando event listeners de orden de salida...");
    
    // Lista de listeners específicos - EXCLUIR delete-order-btn (ya en setupModalActionListeners)
    const orderListeners = [
        { id: 'create-template-btn', handler: createStartOrderTemplate, name: 'createStartOrderTemplate' },
        { id: 'import-order-btn', handler: importStartOrder, name: 'importStartOrder' },
        // ❌ ELIMINAR: { id: 'delete-order-btn', handler: deleteStartOrder, name: 'deleteStartOrder' },
        { id: 'export-order-btn', handler: exportStartOrder, name: 'exportStartOrder' },
        { id: 'export-order-pdf-btn', handler: generateStartOrderPDF, name: 'generateStartOrderPDF' },
        { id: 'add-rider-btn', handler: showRiderPositionModal, fallback: addNewRider, name: 'addRider' },
        { id: 'exit-complete-btn', handler: showRestartConfirmModal, name: 'restartConfirm' }
    ];
    
    orderListeners.forEach(listener => {
        const element = document.getElementById(listener.id);
        if (element) {
            element.addEventListener('click', function() {
                if (typeof listener.handler === 'function') {
                    listener.handler();
                } else if (listener.fallback && typeof listener.fallback === 'function') {
                    listener.fallback();
                } else {
                    log(LOG_LEVEL.WARN, `Función ${listener.name} no disponible`);
                }
            });
        } else {
            log(LOG_LEVEL.DEBUG, `Botón ${listener.id} no encontrado`);
        }
    });
    
    window.startOrderListenersConfigured = true;
    log(LOG_LEVEL.INFO, "Event listeners de orden de salida configurados");
}

// Función auxiliar para mostrar modal de reinicio
function showRestartConfirmModal() {
    const modal = document.getElementById('restart-confirm-modal');
    if (modal) modal.classList.add('active');
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
function handleRaceChange(raceId) {
    log(LOG_LEVEL.INFO, `Cambiando carrera a ID: ${raceId}`);
    
    if (!raceId || raceId === 0) {
        log(LOG_LEVEL.WARN, "ID de carrera inválido o 0");
        return;
    }
    
    // Encontrar la carrera seleccionada
    const selectedRace = appState.races.find(r => r.id === raceId);
    
    if (!selectedRace) {
        log(LOG_LEVEL.ERROR, `No se encontró la carrera con ID: ${raceId}`);
        const t = translations[appState.currentLanguage];
        callIfFunction(() => showMessage(t.raceNotFound || 'Carrera no encontrada', 'error'));
        return;
    }
    
    log(LOG_LEVEL.INFO, `Carrera encontrada: ${selectedRace.name}`);
    
    // 1. Establecer nueva carrera como actual
    appState.currentRace = selectedRace;
    
    // 2. Guardar en localStorage
    localStorage.setItem('countdown-current-race', JSON.stringify(selectedRace));
    
    // 3. Cargar datos de la nueva carrera
    callIfFunction(loadRaceData, "Función loadRaceData no disponible");
    callIfFunction(loadStartOrderData, "Función loadStartOrderData no disponible");
    
    // 4. Actualizar UI
    callIfFunction(updateRaceManagementCardTitle, "Función updateRaceManagementCardTitle no disponible");
    callIfFunction(updateDeleteRaceButtonState, "Función updateDeleteRaceButtonState no disponible");
    callIfFunction(updateRaceActionButtonsState, "Función updateRaceActionButtonsState no disponible");
    
    // 5. Actualizar el selector
    const racesSelect = document.getElementById('races-select');
    if (racesSelect) {
        racesSelect.value = selectedRace.id;
    }
    
    log(LOG_LEVEL.INFO, `Carrera cambiada a: ${selectedRace.name} (ID: ${selectedRace.id})`);
    
    // 6. Mostrar mensaje de confirmación
    const t = translations[appState.currentLanguage];
    callIfFunction(() => showMessage(`${t.raceSelected || 'Carrera seleccionada'}: ${selectedRace.name}`, 'success'));
}

// ============================================
// ESTADO DE ORDENACIÓN PARA TABLA DE ORDEN DE SALIDA
// ============================================
let startOrderSortState = { 
    column: 'order', 
    direction: 'asc' 
};