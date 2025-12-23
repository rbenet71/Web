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
// INICIALIZACIÓN PRINCIPAL - VERSIÓN CORREGIDA
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
    
    // Cargar preferencias básicas
    if (typeof loadLanguagePreference === 'function') loadLanguagePreference();
    if (typeof loadRacesFromStorage === 'function') loadRacesFromStorage();
    if (typeof loadAppState === 'function') loadAppState();
    if (typeof loadAudioPreferences === 'function') loadAudioPreferences();
    
    // Inicializar UI básica
    if (typeof updateLanguageUI === 'function') updateLanguageUI();
    if (typeof updateSalidaText === 'function') updateSalidaText();
    if (typeof renderRacesSelect === 'function') renderRacesSelect();
    
    // ============================================
    // CORRECCIÓN CRÍTICA: CARGAR DATOS EN ORDEN CORRECTO
    // ============================================
    
    // Primero: Cargar los datos de la carrera actual
    if (typeof loadRaceData === 'function') {
        console.log("Cargando datos de carrera...");
        loadRaceData();
    }
    
    // Segundo: Esperar a que la carrera se cargue antes de cargar el orden de salida
    setTimeout(() => {
        console.log("Cargando orden de salida después de carrera...");
        
        // Asegurarnos de que startOrderData se cargue desde la carrera actual
        if (typeof loadStartOrderData === 'function') {
            loadStartOrderData();
        } else {
            console.error("ERROR: loadStartOrderData no está disponible");
        }
        
        // Después de cargar el orden, actualizar la tabla
        setTimeout(() => {
            console.log("Actualizando tabla de orden de salida...");
            console.log("startOrderData disponible?", typeof startOrderData !== 'undefined');
            console.log("Número de corredores en startOrderData:", startOrderData ? startOrderData.length : 0);
            
            if (typeof updateStartOrderTableThrottled === 'function') {
                updateStartOrderTableThrottled(true); // Forzar actualización inmediata
            } else if (typeof updateStartOrderTable === 'function') {
                updateStartOrderTable();
            }
            
            // Actualizar UI relacionada con el orden de salida
            if (typeof updateStartOrderUI === 'function') {
                updateStartOrderUI();
            }
        }, 100);
    }, 150); // Esperar a que loadRaceData termine
    
    // ============================================
    // CONTINUAR CON EL RESTO DE LA INICIALIZACIÓN
    // ============================================
    
    // Configurar inputs de tiempo mejorados
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
    
    // Inicializar módulo PDF
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
    
    // Inicializar tarjeta de gestión de carrera
    if (typeof initRaceManagementCard === 'function') {
        initRaceManagementCard();
        console.log("Tarjeta de gestión de carrera inicializada");
    }
    
    // Actualizar título inicial de la tarjeta de gestión
    if (typeof updateRaceManagementCardTitle === 'function') {
        setTimeout(() => {
            updateRaceManagementCardTitle();
            console.log("Título de gestión de carrera actualizado inicialmente");
        }, 200); // Dar más tiempo después de cargar la carrera
    }
    
    // Marcar como inicializada después de que todo esté listo
    setTimeout(() => {
        window.appInitialized = true;
        console.log("Aplicación inicializada correctamente");
        console.log("Estado final:");
        console.log("- Carrera actual:", appState.currentRace ? appState.currentRace.name : "Ninguna");
        console.log("- Corredores en orden de salida:", startOrderData ? startOrderData.length : 0);
    }, 300);
    
    // Configurar botones de idioma
    setupLanguageButtons();
    
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
    
    // 7. Botón de importar Excel
    const importExcelBtn = document.getElementById('import-excel-btn');
    if (importExcelBtn) {
        importExcelBtn.addEventListener('click', function() {
            if (typeof importExcelTemplate === 'function') {
                importExcelTemplate();
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
        
        // AÑADIR ESTO: Actualizar título de la tarjeta de gestión
        if (typeof updateRaceManagementCardTitle === 'function') {
            updateRaceManagementCardTitle();
        }
    } else {
        appState.currentRace = null;
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        
        document.getElementById('departed-count').textContent = 0;
        document.getElementById('start-position').value = 1;
        renderDeparturesList();
        
        // AÑADIR ESTO: Actualizar título de la tarjeta de gestión cuando no hay carrera
        if (typeof updateRaceManagementCardTitle === 'function') {
            updateRaceManagementCardTitle();
        }
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
