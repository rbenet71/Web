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

// ============================================
// PUNTO DE ENTRADA Y CONFIGURACIÓN GLOBAL
// ============================================

// ESTADO DE LA APLICACIÓN
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
    departureTimes: [],
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
    console.log("Inicializando aplicación Crono CRI...");
    
    // Verificar si ya se inicializó
    if (window.appInitialized) {
        console.log("La aplicación ya está inicializada");
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
            departureTimes: [],
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
            console.log("✅ Carrera actual cargada desde localStorage:", appState.currentRace ? appState.currentRace.name : "Ninguna");
        } catch (error) {
            console.error("❌ Error cargando carrera actual:", error);
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
        console.error("❌ Función updateLanguageUI no disponible");
    }
    
    // Añadir estilos para botones deshabilitados
    if (typeof addDisabledButtonStyles === 'function') {
        addDisabledButtonStyles();
    }
    
    // Actualizar estado inicial de botones
    if (typeof updateDeleteRaceButtonState === 'function') {
        updateDeleteRaceButtonState();
    }
    
    if (typeof updateRaceActionButtonsState === 'function') {
        updateRaceActionButtonsState();
    }
    
    // Renderizar selector de carreras
    if (typeof renderRacesSelect === 'function') {
        renderRacesSelect();
    }
    
    // Cargar datos de carrera (si hay carrera seleccionada)
    if (typeof loadRaceData === 'function') {
        loadRaceData();
    }
    
    // Configurar inputs de tiempo para móviles
    if (typeof setupTimeInputs === 'function') {
        setupTimeInputs();
    }
    
    // Configurar event listeners principales
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
    
    // Configurar event listeners de orden de salida
    if (typeof setupStartOrderEventListeners === 'function') {
        setupStartOrderEventListeners();
    }
    
    // Configurar UI
    if (typeof setupCardToggles === 'function') {
        setupCardToggles();
    }
    
    if (typeof initModeSlider === 'function') {
        initModeSlider();
    }
    
    if (typeof setupModalEventListeners === 'function') {
        setupModalEventListeners();
    }
    
    if (typeof setupModalActionListeners === 'function') {
        setupModalActionListeners();
    }
    
    if (typeof setupLanguageButtons === 'function') {
        setupLanguageButtons();
    }
    
    // Configurar Service Worker (PWA)
    if (typeof setupServiceWorker === 'function') {
        setupServiceWorker();
    }
    
    // Configurar PWA
    if (typeof setupPWA === 'function') {
        setupPWA();
    }
    
    // Inicializar tarjeta de gestión de carrera
    if (typeof initRaceManagementCard === 'function') {
        initRaceManagementCard();
    }
    
    // Cargar orden de salida después de carrera
    if (typeof loadStartOrderData === 'function') {
        loadStartOrderData();
    }
    
    // Actualizar tabla de orden de salida
    console.log("Actualizando tabla de orden de salida...");
    console.log("startOrderData disponible?", !!startOrderData);
    if (startOrderData) {
        console.log("Número de corredores en startOrderData:", startOrderData.length);
    }
    
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled();
    }
    
    // Inicializar selector de modo
    if (typeof initModeSlider === 'function') {
        // Ya se llamó arriba, pero llamamos a la función específica si existe separada
    }
    
    // Configurar eventos del formulario de carrera
    if (typeof setupRaceFormEvents === 'function') {
        setupRaceFormEvents();
    }
    
    // Configurar ordenación para tabla
    if (typeof setupStartOrderTableSorting === 'function') {
        setupStartOrderTableSorting();
    }
    
    // Inicializar módulo PDF
    if (typeof initPDFModule === 'function') {
        initPDFModule();
    }
    
    // Inicializar módulo de backup
    if (typeof initBackupModule === 'function') {
        initBackupModule();
    }
    
    // Precargar audios
    if (typeof preloadVoiceAudios === 'function') {
        preloadVoiceAudios();
    }
    
    // Configurar botón de exportar PDF
    if (typeof setupPDFExportButton === 'function') {
        setupPDFExportButton();
    }
    
    // Actualizar título de gestión de carrera
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    console.log("Aplicación inicializada correctamente");
    console.log("Estado final:");
    console.log("- Carrera actual:", appState.currentRace ? appState.currentRace.name : "Ninguna");
    console.log("- Corredores en orden de salida:", startOrderData ? startOrderData.length : 0);
    
    // Marcar como completamente inicializada
    setTimeout(() => {
        window.appFullyInitialized = true;
        console.log("✅ Aplicación completamente inicializada y lista");
    }, 500);
}
// Guardar estado antes de cerrar
window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) {
        if (typeof saveLastUpdate === 'function') saveLastUpdate();
    }
});
// ============================================
// EVENT LISTENERS PRINCIPALES
// ============================================
// ============================================
// EVENT LISTENERS PRINCIPALES
// ============================================
function setupEventListeners() {
    console.log('Configurando event listeners principales...');
    
    // 1. Selector de idioma
    const languageSelector = document.getElementById('language-selector');
    if (languageSelector) {
        languageSelector.addEventListener('change', function(e) {
            const newLanguage = e.target.value;
            if (window.appState && window.appState.currentLanguage !== newLanguage) {
                window.appState.currentLanguage = newLanguage;
                if (typeof updateLanguageUI === 'function') {
                    updateLanguageUI();
                }
                // Guardar preferencia de idioma
                localStorage.setItem('cri_language', newLanguage);
                console.log('Idioma cambiado a:', newLanguage);
            }
        });
    }
    
    // 2. Configuración de audio
    const audioTypeSelector = document.getElementById('audio-type-selector');
    if (audioTypeSelector) {
        audioTypeSelector.addEventListener('change', function(e) {
            if (window.appState) {
                window.appState.audioType = e.target.value;
                // Opcional: Guardar preferencia
                localStorage.setItem('cri_audio_type', e.target.value);
            }
        });
    }
    
    // 3. Cambio de carrera
    const raceSelector = document.getElementById('race-selector');
    if (raceSelector) {
        raceSelector.addEventListener('change', handleRaceChange);
    }
    
    // 4. Botón de nueva carrera
    const newRaceBtn = document.getElementById('new-race-btn');
    if (newRaceBtn) {
        newRaceBtn.addEventListener('click', function() {
            // Lógica para crear nueva carrera
            if (typeof showNewRaceModal === 'function') {
                showNewRaceModal();
            } else {
                console.warn('Función showNewRaceModal no disponible');
            }
        });
    }
    
    // 5. Botón de editar carrera
    const editRaceBtn = document.getElementById('edit-race-btn');
    if (editRaceBtn) {
        editRaceBtn.addEventListener('click', function() {
            if (typeof editRaceDetails === 'function') {
                editRaceDetails();
            }
        });
    }
    
    // 6. Botón de eliminar carrera
    const deleteRaceBtn = document.getElementById('delete-race-btn');
    if (deleteRaceBtn) {
        deleteRaceBtn.addEventListener('click', function() {
            if (typeof deleteCurrentRace === 'function') {
                deleteCurrentRace();
            }
        });
    }
    

    
    // 8. Botón de exportar Excel
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', function() {
            if (typeof exportStartOrder === 'function') {
                exportStartOrder();
            }
        });
    }
    
    // 9. Botón de exportar PDF
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            if (typeof generateStartOrderPDF === 'function') {
                generateStartOrderPDF();
            }
        });
    }
    
    // 11. Botón de copia de seguridad
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', function() {
            if (typeof createRaceBackup === 'function') {
                createRaceBackup();
            }
        });
    }
    
    // 12. Botón de restaurar backup
    const restoreBtn = document.getElementById('restore-btn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', function() {
            if (typeof restoreRaceFromBackup === 'function') {
                restoreRaceFromBackup();
            }
        });
    }
    
    // 13. Botón de limpiar datos
    const clearDataBtn = document.getElementById('clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            if (typeof clearAppData === 'function') {
                clearAppData();
            }
        });
    }
    
    // 14. Botón de ayuda/información
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', function() {
            if (typeof showHelpModal === 'function') {
                showHelpModal();
            }
        });
    }
    
    // 15. Atajos de teclado globales
    document.addEventListener('keydown', function(e) {
        // Solo si no hay inputs activos
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(e.key) {
            case ' ': // Espacio - Iniciar/pausar cuenta atrás
                if (typeof toggleCountdown === 'function') {
                    toggleCountdown();
                }
                break;
            case 'Enter': // Enter - Registrar salida
                if (typeof registerDeparture === 'function') {
                    registerDeparture();
                }
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
                if (e.ctrlKey && typeof resetCountdown === 'function') {
                    resetCountdown();
                }
                break;
            case 's': // S - Siguiente intervalo (con Ctrl)
                if (e.ctrlKey && typeof nextInterval === 'function') {
                    nextInterval();
                }
                break;
        }
    });
    
    // 16. Listeners específicos para orden de salida
    setupStartOrderEventListeners();
    
    // 17. Listener para cambio de modo (salidas/llegadas)
    const modeSlider = document.getElementById('mode-slider');
    if (modeSlider) {
        modeSlider.addEventListener('change', function(e) {
            if (window.isModeChanging) return;
            window.isModeChanging = true;
            
            const newMode = e.target.checked ? 'llegadas' : 'salidas';
            console.log('Cambiando modo a:', newMode);
            
            // Lógica de cambio de modo
            if (typeof switchAppMode === 'function') {
                switchAppMode(newMode);
            }
            
            setTimeout(() => {
                window.isModeChanging = false;
            }, 100);
        });
    }
    
    // 18. Listener para instalación PWA
    window.addEventListener('beforeinstallprompt', (e) => {
        // Previene que el navegador muestre el prompt automático
        e.preventDefault();
        // Guarda el evento para poder mostrarlo más tarde
        window.deferredPrompt = e;
        
        // Opcional: Mostrar botón de instalación
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', async () => {
                if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    const { outcome } = await window.deferredPrompt.userChoice;
                    console.log(`User response to the install prompt: ${outcome}`);
                    window.deferredPrompt = null;
                }
            });
        }
    });
    
    // 19. Listener para actualizaciones del Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (window.updateAvailable) {
                // Mostrar notificación de actualización disponible
                if (typeof showMessage === 'function') {
                    showMessage('Nueva versión disponible. Recarga la página.', 'info');
                }
            }
        });
    }
    
    // 20. Listener para visibilidad de página (pausar cuenta atrás cuando no está visible)
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && window.appState && window.appState.countdownActive) {
            console.log('Página no visible, considerando pausar cuenta atrás...');
            // Aquí podrías pausar automáticamente el countdown
        }
    });
    
    console.log('Event listeners principales configurados');
}

// ============================================
// EVENT LISTENERS PARA ORDEN DE SALIDA
// ============================================
function setupStartOrderEventListeners() {
    
    if (window.startOrderListenersConfigured) {
        console.log("Event listeners de orden de salida ya configurados");
        return;
    }
    console.log("Configurando event listeners de orden de salida...");
    
    // Botón para crear plantilla
    const createTemplateBtn = document.getElementById('create-template-btn');
    if (createTemplateBtn && typeof createStartOrderTemplate === 'function') {
        createTemplateBtn.addEventListener('click', createStartOrderTemplate);
    }
    
    // Botón para importar orden
    const importOrderBtn = document.getElementById('import-order-btn');
    if (importOrderBtn && typeof importStartOrder === 'function') {
        importOrderBtn.addEventListener('click', importStartOrder);
    }
    
    // Botón para eliminar orden
    const deleteOrderBtn = document.getElementById('delete-order-btn');
    if (deleteOrderBtn && typeof deleteStartOrder === 'function') {
        deleteOrderBtn.addEventListener('click', deleteStartOrder);
    }
    
    // Botón para exportar orden
    const exportOrderBtn = document.getElementById('export-order-btn');
    if (exportOrderBtn && typeof exportStartOrder === 'function') {
        exportOrderBtn.addEventListener('click', exportStartOrder);
    }
    
    const exportPDFBtn = document.getElementById('export-order-pdf-btn');
    if (exportPDFBtn) {
        console.log("Configurando botón de exportar PDF...");
        exportPDFBtn.addEventListener('click', generateStartOrderPDF);
    }
   
    // BOTÓN AÑADIR CORREDOR - USANDO LA NUEVA FUNCIÓN
    const addRiderBtn = document.getElementById('add-rider-btn');
    if (addRiderBtn) {
        console.log("Configurando botón añadir corredor con nueva funcionalidad...");
        addRiderBtn.addEventListener('click', function() {
            console.log("Botón añadir corredor clickeado");
            if (typeof showRiderPositionModal === 'function') {
                showRiderPositionModal();
            } else if (typeof addNewRider === 'function') {
                addNewRider(); // Fallback a la versión antigua
            } else {
                console.error("Función addNewRider no encontrada");
            }
        });
    }
    
    // Botón para limpiar lista
    const clearDeparturesBtn = document.getElementById('clear-departures-btn');
    if (clearDeparturesBtn) {
        clearDeparturesBtn.addEventListener('click', () => {
            const modal = document.getElementById('clear-departures-modal');
            if (modal) modal.classList.add('active');
        });
    }
    
    // Botón para exportar a Excel
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn && typeof exportToExcel === 'function') {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    // Botón para reiniciar completamente
    const exitCompleteBtn = document.getElementById('exit-complete-btn');
    if (exitCompleteBtn) {
        exitCompleteBtn.addEventListener('click', () => {
            const modal = document.getElementById('restart-confirm-modal');
            if (modal) modal.classList.add('active');
        });
    }
    
    // Botón para iniciar cuenta atrás
    const startCountdownBtn = document.getElementById('start-countdown-btn');
    if (startCountdownBtn && typeof startCountdown === 'function') {
        startCountdownBtn.addEventListener('click', startCountdown);
    }

 // En Crono_CRI_js_Main.js, línea 682 aproximadamente

console.log("✅ Aplicación completamente inicializada y lista");

// 🔥 CORRECCIÓN DE INTERVALOS DE TIEMPO 🔥

// 1. Iniciar actualización de hora del sistema (debe existir en UI.js)
if (typeof updateSystemTimeDisplay === 'function') {
    updateSystemTimeDisplay();
    setInterval(updateSystemTimeDisplay, 1000); // Actualizar cada segundo
    console.log("⏰ Actualización de hora del sistema iniciada");
}

// 2. Iniciar actualización de hora actual (si existe)
if (typeof updateCurrentTime === 'function') {
    setInterval(updateCurrentTime, 1000);
    console.log("⏰ Actualización de hora actual iniciada");
}

// 3. Si updateCurrentTime no existe, usar una función alternativa
if (typeof updateCurrentTime === 'undefined') {
    // Crear función simple para mostrar hora actual
    function updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { hour12: false });
        const currentTimeElement = document.getElementById('current-time-value');
        if (currentTimeElement) {
            currentTimeElement.textContent = timeString;
        }
    }
    
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    console.log("⏰ Función updateCurrentTime creada e iniciada");
}

// 4. Configurar redimensionamiento del countdown (si existe)
if (typeof setupCountdownResize === 'function') {
    setupCountdownResize();
    console.log("📱 Redimensionamiento del countdown configurado");
}

// 5. Iniciar actualización de cuenta atrás si está activa
function updateCountdownIfActive() {
    if (appState.countdownActive && typeof updateCountdownDisplay === 'function') {
        updateCountdownDisplay();
    }
}

// Actualizar countdown cada segundo
setInterval(updateCountdownIfActive, 1000);

console.log("⏰ Todos los intervalos de tiempo iniciados correctamente");

    window.startOrderListenersConfigured = true;
    console.log("Event listeners de orden de salida configurados.");
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
// ============================================
// FUNCIÓN CORREGIDA PARA CAMBIAR DE CARRERA
// ============================================
function handleRaceChange(raceId) {
    console.log("🔄 Cambiando carrera a ID:", raceId);
    
    if (!raceId || raceId === 0) {
        console.log("⚠️ ID de carrera inválido o 0");
        return;
    }
    
    // Encontrar la carrera seleccionada
    const selectedRace = appState.races.find(r => r.id === raceId);
    
    if (!selectedRace) {
        console.error("❌ No se encontró la carrera con ID:", raceId);
        const t = translations[appState.currentLanguage];
        showMessage(t.raceNotFound || 'Carrera no encontrada', 'error');
        return;
    }
    
    console.log("✅ Carrera encontrada:", selectedRace.name);
    
    // 1. Establecer nueva carrera como actual
    appState.currentRace = selectedRace;
    
    // 2. Guardar en localStorage
    localStorage.setItem('countdown-current-race', JSON.stringify(selectedRace));
    
    // 3. Cargar datos de la nueva carrera
    if (typeof loadRaceData === 'function') {
        loadRaceData();
    }
    
    if (typeof loadStartOrderData === 'function') {
        loadStartOrderData();
    }
    
    // 4. Actualizar UI
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    if (typeof updateDeleteRaceButtonState === 'function') {
        updateDeleteRaceButtonState();
    }
    
    if (typeof updateRaceActionButtonsState === 'function') {
        updateRaceActionButtonsState();
    }
    
    // 5. Actualizar el selector para mostrar la opción seleccionada
    const racesSelect = document.getElementById('races-select');
    if (racesSelect) {
        racesSelect.value = selectedRace.id;
        console.log("✅ Selector actualizado a carrera:", selectedRace.name);
    }
    
    console.log(`✅ Carrera cambiada a: ${selectedRace.name} (ID: ${selectedRace.id})`);
    
    // 6. Mostrar mensaje de confirmación
    const t = translations[appState.currentLanguage];
    showMessage(`${t.raceSelected || 'Carrera seleccionada'}: ${selectedRace.name}`, 'success');
}
function handleKeyboardShortcuts(e) {
    // ESC para pausar cuenta atrás
    if (e.key === 'Escape' && appState.countdownActive && !appState.configModalOpen) {
        pauseCountdownVisual();
        document.getElementById('config-during-countdown-modal').classList.add('active');
    }
    
    // Ctrl+Enter para iniciar cuenta atrás
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('start-countdown-btn').click();
    }
    
    // Tecla L para registro rápido de llegada
    if ((e.key === 'l' || e.key === 'L') && 
        document.getElementById('mode-llegadas-content').classList.contains('active') && 
        llegadasState.timerActive) {
        showQuickRegisterLlegada();
    }
}
// ============================================
// ESTADO DE ORDENACIÓN PARA TABLA DE ORDEN DE SALIDA
// ============================================
let startOrderSortState = { 
    column: 'order', 
    direction: 'asc' 
};
