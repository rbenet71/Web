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
// INICIALIZACIÓN PRINCIPAL
// ============================================
function initApp() {
    console.log("Inicializando aplicación Crono CRI...");
    
    // Variables para controlar inicializaciones únicas
    let mainListenersConfigured = false;
    let startOrderListenersConfigured = false;
    let backupModuleInitialized = false;
    
    // Marcar que la app no está completamente inicializada aún
    window.appInitialized = false;
    
    // Limpiar datos antiguos
    if (typeof cleanupOldData === 'function') cleanupOldData();
    
    // Cargar preferencias
    if (typeof loadLanguagePreference === 'function') loadLanguagePreference();
    if (typeof loadRacesFromStorage === 'function') loadRacesFromStorage();
    if (typeof loadAppState === 'function') loadAppState();
    if (typeof loadAudioPreferences === 'function') loadAudioPreferences();
    
    // Inicializar UI
    if (typeof updateLanguageUI === 'function') updateLanguageUI();
    if (typeof updateSalidaText === 'function') updateSalidaText();
    if (typeof renderRacesSelect === 'function') renderRacesSelect();
    
    // Asegurar el orden correcto de carga
    if (typeof loadStartOrderData === 'function') {
        loadStartOrderData(); // Cargar primero los datos de orden
    }
    
    if (typeof loadRaceData === 'function') {
        // Pequeño retraso para asegurar que startOrderData esté cargado
        setTimeout(() => {
            loadRaceData();
        }, 50);
    }

    // Configurar inputs de tiempo mejorados (INTEGRADO EN SALIDAS)
    if (typeof setupTimeInputs === 'function') setupTimeInputs();
    
    // Configurar TODOS los listeners (solo una vez)
    if (typeof setupEventListeners === 'function' && !mainListenersConfigured) {
        setupEventListeners();
        mainListenersConfigured = true;
    }
    
    if (typeof setupCardToggles === 'function') setupCardToggles();
    if (typeof setupAudioEventListeners === 'function') setupAudioEventListeners();
    if (typeof setupModalEventListeners === 'function') setupModalEventListeners();
    if (typeof setupModalActionListeners === 'function') setupModalActionListeners();
    if (typeof setupSorting === 'function') setupSorting();
    if (typeof setupLlegadasEventListeners === 'function') setupLlegadasEventListeners();
    
    // Configurar listeners de orden de salida (solo una vez)
    if (typeof setupStartOrderEventListeners === 'function' && !startOrderListenersConfigured) {
        setupStartOrderEventListeners();
        startOrderListenersConfigured = true;
    }
    
    // Configurar módulo de backup (solo una vez)
    if (typeof initBackupModule === 'function' && !window.backupModuleInitialized) {
        setTimeout(initBackupModule, 1500);
    }
    
    // Configurar eventos del formulario de carrera
    if (typeof setupRaceFormEvents === 'function') {
        setTimeout(setupRaceFormEvents, 500);
    }
    
    // Configurar ordenación para tabla de orden de salida
    setTimeout(() => {
        if (typeof setupStartOrderTableSorting === 'function') {
            setupStartOrderTableSorting();
        }
    }, 500);
    
    // Inicializar módulo PDF (después de que todo esté cargado)
    setTimeout(() => {
        if (typeof initPDFModule === 'function') {
            initPDFModule();
        }
    }, 1000);
    
    // Inicializar timers
    setInterval(updateSystemTimeDisplay, 1000);
    setInterval(updateTimeDifference, 1000);
    setInterval(updateTotalTime, 1000);
    setInterval(updateCurrentTime, 1000);
    

    // Inicializar modo slider
    setTimeout(() => {
        if (typeof initModeSlider === 'function') initModeSlider();
    }, 300);
    
    // Precargar audios
    setTimeout(() => {
        if (typeof verifyAudioFiles === 'function') verifyAudioFiles();
    }, 1500);
    setTimeout(() => {
        if (typeof preloadVoiceAudios === 'function') preloadVoiceAudios();
    }, 2000);
    
    // Configurar PWA
    if (typeof setupServiceWorker === 'function') setupServiceWorker();
    if (typeof setupPWA === 'function') setupPWA();
    if (typeof setupCountdownResize === 'function') setupCountdownResize();
    
    // Eventos de audio
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    
    // Marcar como inicializada después de un pequeño retraso
    setTimeout(() => {
        window.appInitialized = true;
        console.log("Aplicación inicializada correctamente (marcada como appInitialized=true)");
    }, 500);
    
    console.log("Aplicación inicializando...");
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
    console.log("Configurando event listeners principales...");
    
    // Idiomas
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            appState.currentLanguage = lang;
            localStorage.setItem('countdown-language', lang);
            updateLanguageUI();
            updateSalidaText();
        });
    });
    
    // Botones de expandir/colapsar
    document.getElementById('expand-all-btn')?.addEventListener('click', () => toggleAllCards('expand'));
    document.getElementById('collapse-all-btn')?.addEventListener('click', () => toggleAllCards('collapse'));
    
    // Selector de carrera
    document.getElementById('race-select').addEventListener('change', handleRaceChange);
    
    // Botón de nueva carrera
    document.getElementById('new-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.add('active');
        document.getElementById('new-race-name').focus();
        
    });
    document.getElementById('edit-race-btn').addEventListener('click', editRaceDetails);
    
    // Botón de eliminar carrera
    document.getElementById('delete-race-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (!appState.currentRace) {
            showMessage(t.selectRaceFirst, 'error');
            return;
        }
        document.getElementById('delete-race-modal').classList.add('active');
    });
    
    // Botón de ayuda
    document.getElementById('help-icon-header').addEventListener('click', function() {
        window.open('Crono_CRI_ayuda.html', '_blank');
    });
    
    // NOTA: setupStartOrderEventListeners() se elimina de aquí
    // Se llamará directamente desde initApp()
    
    // Atajos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    console.log("Event listeners principales configurados");
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

    window.startOrderListenersConfigured = true;
    console.log("Event listeners de orden de salida configurados.");
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
function handleRaceChange() {
    const index = parseInt(this.value);
    if (index >= 0 && index < appState.races.length) {
        if (appState.currentRace) {
            saveRaceData();
        }
        
        appState.currentRace = appState.races[index];
        loadRaceData();
        saveRacesToStorage();
        onRaceChanged();
    } else {
        appState.currentRace = null;
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        
        document.getElementById('departed-count').textContent = 0;
        document.getElementById('start-position').value = 1;
        renderDeparturesList();
    }
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