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
window.savingNotesIndex = null;

// ============================================
// INICIALIZACIÓN
// ============================================

function initApp() {
    console.log("Inicializando aplicación...");
    
    loadLanguagePreference();
    loadRacesFromStorage();
    loadAppState();
    loadAudioPreferences();
    
    setTimeout(() => verifyAudioFiles(), 500);
    setTimeout(() => preloadVoiceAudios(), 1000);
    
    loadRaceData();
    
    initModeSlider();
    
    updateLanguageUI();
    updateSalidaText();
    renderRacesSelect();
    setupSorting();
    
    // AGREGAR AQUÍ LOS INTERVALOS PARA EL RELOJ
    // Actualizar hora del sistema cada segundo
    updateSystemTimeDisplay(); // Ejecutar inmediatamente
    setInterval(updateSystemTimeDisplay, 1000);
    
    // Actualizar diferencia de tiempo cada segundo
    updateTimeDifference(); // Ejecutar inmediatamente  
    setInterval(updateTimeDifference, 1000);
    
    // Los intervalos existentes
    setInterval(updateTotalTime, 1000);
    setInterval(updateCurrentTime, 1000);
    
    setupServiceWorker();
    setupPWA();
    setupCountdownResize();
    adjustCountdownSize();
    adjustInfoCornersSize();
    
    setupEventListeners();
    setupAudioEventListeners();
    
    // AGREGAR AQUÍ LOS LISTENERS ESPECÍFICOS DE MODALES
    setupModalEventListeners();
    
    // Cargar modo guardado
    const savedMode = localStorage.getItem('app-mode') || 'salida';
    setTimeout(() => {
        changeMode(savedMode);
    }, 100);
    
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    
    console.log("Aplicación inicializada.");
    console.log(`Idioma inicial: ${appState.currentLanguage}`);
    console.log(`Tipo de audio: ${appState.audioType}`);
}
// AGREGAR ESTA NUEVA FUNCIÓN
function setupModalEventListeners() {
    console.log("Configurando event listeners de modales...");
    
    // Botón de crear carrera
    document.getElementById('create-race-btn').addEventListener('click', createNewRace);
    
    // Botón de eliminar carrera
    document.getElementById('delete-race-confirm-btn').addEventListener('click', deleteCurrentRace);
    
    console.log("Event listeners de modales configurados.");
}

// AGREGAR ESTA NUEVA FUNCIÓN
function setupModalEventListeners() {
    console.log("Configurando event listeners de modales...");
    
    // Botón de crear carrera
    document.getElementById('create-race-btn').addEventListener('click', createNewRace);
    
    // Botón de eliminar carrera
    document.getElementById('delete-race-confirm-btn').addEventListener('click', deleteCurrentRace);
    
    console.log("Event listeners de modales configurados.");
}



// En loadAppState():
function loadAppState() {
    const savedState = localStorage.getItem('countdown-app-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        appState.departedCount = state.departedCount || 0;
        appState.nextCorredorTime = state.nextCorredorTime || 60;
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

function setupEventListeners() {
    console.log("Configurando event listeners...");
    
    // ============================================
    // LISTENERS GENERALES
    // ============================================
    
    document.querySelectorAll('.flag').forEach(flag => {
        flag.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            appState.currentLanguage = lang;
            localStorage.setItem('countdown-language', lang);
            updateLanguageUI();
            updateSalidaText();
            console.log(`Idioma cambiado a: ${lang}`);
        });
    });
    
    // ============================================
    // LISTENERS PARA SELECTOR DE MODO
    // ============================================
    
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            changeMode(mode);
        });
    });

    // ============================================
    // LISTENERS PARA REINICIO COMPLETO
    // ============================================
    
    document.getElementById('exit-complete-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.add('active');
    });

    document.getElementById('restart-modal-close').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
    });

    document.getElementById('restart-cancel-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
    });

    document.getElementById('delete-race-cancel-btn').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });

    document.getElementById('delete-race-modal-close').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });

    document.getElementById('restart-confirm-btn').addEventListener('click', () => {
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
        
        appState.departedCount = 0;
        appState.departureTimes = [];
        
        // Limpiar llegadas también
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
        
        document.getElementById('departed-count').textContent = '0';
        document.getElementById('start-position').value = 1;
        updateNextCorredorDisplay();
        
        renderDeparturesList();
        renderLlegadasList();
        document.getElementById('total-time-value').textContent = '00:00:00';
        
        // Actualizar cronómetro de llegadas
        document.getElementById('llegadas-timer-display').textContent = '00:00:00';
        
        localStorage.removeItem('countdown-app-state');
        localStorage.removeItem('llegadas-state');
        
        document.getElementById('restart-confirm-modal').classList.remove('active');
        
        showMessage(t.sessionRestarted, 'success');
        console.log("Sesión reiniciada, TODOS los datos borrados");
    });

    // ============================================
    // LISTENERS PARA AYUDA
    // ============================================
    
    document.getElementById('help-icon-header').addEventListener('click', function() {
        window.open('Crono_CRI_ayuda.html', '_blank');
    });

    document.getElementById('footer-help-btn').addEventListener('click', function() {
        window.open('Crono_CRI_ayuda.html', '_blank');
    });
    
    document.getElementById('help-modal-close').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });
    
    document.getElementById('help-modal-ok').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('active');
    });

    // ============================================
    // LISTENERS PARA CARRERA
    // ============================================
    
    document.getElementById('race-select').addEventListener('change', function() {
        const index = parseInt(this.value);
        if (index >= 0 && index < appState.races.length) {
            if (appState.currentRace) {
                saveRaceData();
            }
            
            appState.currentRace = appState.races[index];
            loadRaceData();
            saveRacesToStorage();
            
            console.log("Cambiada a carrera:", appState.currentRace.name);
        } else {
            appState.currentRace = null;
            appState.departureTimes = [];
            appState.departedCount = 0;
            appState.intervals = [];
            
            document.getElementById('departed-count').textContent = 0;
            document.getElementById('start-position').value = 1;
            renderDeparturesList();
            
            document.getElementById('single-interval-config').style.display = 'block';
        }
    });
    
    document.getElementById('new-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.add('active');
        document.getElementById('new-race-name').focus();
    });
    
    document.getElementById('create-race-btn').addEventListener('click', createNewRace);
    
    document.getElementById('delete-race-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (!appState.currentRace) {
            showMessage(t.selectRaceFirst, 'error');
            return;
        }
        document.getElementById('delete-race-modal').classList.add('active');
    });
    

    
    document.getElementById('new-race-modal-close').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-create-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });

    // ============================================
    // LISTENERS PARA ORDEN DE SALIDA
    // ============================================
    
    document.getElementById('start-position').addEventListener('change', function() {
        const position = parseInt(this.value) || 1;
        appState.departedCount = Math.max(0, position - 1);
        document.getElementById('departed-count').textContent = appState.departedCount;
        updateCurrentInterval();
        saveAppState();
        console.log("Posición actualizada:", position, "Salidos:", appState.departedCount);
    });
    
    document.getElementById('first-start-time').addEventListener('change', function() {
        updateStartOrderTimes();
        if (appState.currentRace) {
            saveRaceData();
            const t = translations[appState.currentLanguage];
            showMessage(t.startTimeUpdated, 'success');
        }
    });
    
    document.getElementById('total-riders').addEventListener('change', updateStartOrderTable);
    
    document.getElementById('create-template-btn').addEventListener('click', createStartOrderTemplate);
    document.getElementById('import-order-btn').addEventListener('click', importStartOrder);
    document.getElementById('delete-order-btn').addEventListener('click', deleteStartOrder);
    document.getElementById('export-order-btn').addEventListener('click', exportStartOrder);
    document.getElementById('add-rider-btn').addEventListener('click', addNewRider);

    // ============================================
    // LISTENERS PARA MODO SALIDA
    // ============================================
    
    document.getElementById('interval-minutes').addEventListener('change', function() {
        intervalConfig.singleMode.minutes = parseInt(this.value) || 0;
        saveIntervalConfig();
        updateCadenceTime();
    });

    document.getElementById('interval-seconds').addEventListener('change', function() {
        intervalConfig.singleMode.seconds = parseInt(this.value) || 0;
        saveIntervalConfig();
        updateCadenceTime();
    });
    
    document.getElementById('start-countdown-btn').addEventListener('click', startCountdown);
    
    document.getElementById('clear-departures-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (appState.departureTimes.length === 0) {
            showMessage(t.listAlreadyEmpty, 'info');
            return;
        }
        document.getElementById('clear-departures-modal').classList.add('active');
    });
    
    document.getElementById('clear-departures-confirm-btn').addEventListener('click', () => {
        clearRaceDepartures();
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-modal-close').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-cancel-btn').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);

    // ============================================
    // LISTENERS PARA PANTALLA DE CUENTA ATRÁS
    // ============================================
    
    document.getElementById('config-toggle').addEventListener('click', function(e) {
        e.stopPropagation();
        
        const t = translations[appState.currentLanguage];
        
        if (appState.countdownActive && appState.countdownValue <= 12) {
            showMessage(t.waitCountdownEnd, 'warning');
            return;
        }
        
        if (appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
    });

    document.getElementById('config-toggle').addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
    });

    document.getElementById('next-corredor-time').addEventListener('dblclick', function(e) {
        e.stopPropagation();

        if (!canModifyDuringCountdown()) {
            return;
        }

        const t = translations[appState.currentLanguage];

        if (!appState.countdownActive) {
            showMessage(t.countdownNotActive, 'warning');
            return;
        }
        
        const currentText = this.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'inline-edit-input';
        input.value = currentText;
        input.placeholder = 'Ej: 1:30 o 90';
        
        this.innerHTML = '';
        this.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const value = input.value.trim();
            let seconds = 0;
            
            if (value.includes(':')) {
                const parts = value.split(':');
                const mins = parseInt(parts[0]) || 0;
                const secs = parseInt(parts[1]) || 0;
                seconds = mins * 60 + secs;
            } else if (value.toLowerCase().includes('min')) {
                const mins = parseInt(value) || 0;
                seconds = mins * 60;
            } else {
                seconds = parseInt(value) || 0;
            }
            
            if (seconds <= 0) {
                showMessage(t.enterValidTime, 'error');
                this.textContent = currentText;
                return;
            }
            
            const currentCorredor = appState.departedCount + 1;
            const startFromCorredor = currentCorredor + 1;
            
            console.log(`Corredor actual: ${currentCorredor}, Aplicar desde: ${startFromCorredor}`);
            
            const displayText = seconds >= 60 ? 
                `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}` : 
                seconds + "s";
            
            this.textContent = displayText;
            
            saveAppState();
            if (appState.currentRace) {
                saveRaceData();
            }
            
            const message = t.timeUpdated
                .replace('{seconds}', seconds)
                .replace('{corredor}', startFromCorredor);
            showMessage(message, 'success');
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    });
    
    document.getElementById('departed-count').addEventListener('dblclick', function(e) {
        e.stopPropagation();
        if (!canModifyDuringCountdown()) {
            return;
        }
        
        const currentValue = parseInt(this.textContent) || 0;
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inline-edit-input';
        input.value = currentValue;
        input.min = 0;
        
        this.innerHTML = '';
        this.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newValue = parseInt(input.value) || 0;
            appState.departedCount = newValue;
            document.getElementById('start-position').value = newValue + 1;
            this.textContent = newValue;
            updateCurrentInterval();
            saveAppState();
            renderDeparturesList();
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    });

    // ============================================
    // LISTENERS PARA MODALES DE CONFIGURACIÓN DURANTE CUENTA ATRÁS
    // ============================================
    
    document.getElementById('config-during-countdown-close').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('resume-countdown-btn').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('stop-countdown-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        stopCountdown();
        document.getElementById('countdown-screen').classList.remove('active');
        document.querySelectorAll('.hide-on-countdown').forEach(el => {
            el.style.display = '';
        });
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        showMessage(t.countdownStopped, 'info');
    });
    
    document.getElementById('adjust-times-btn').addEventListener('click', () => {
        document.getElementById('config-during-countdown-modal').classList.remove('active');
        document.getElementById('adjust-times-modal').classList.add('active');
        
        document.getElementById('adjust-next-time').value = appState.nextCorredorTime;
        document.getElementById('adjust-departed').value = appState.departedCount;
    });

    document.getElementById('adjust-times-close').addEventListener('click', () => {
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('cancel-adjustments-btn').addEventListener('click', () => {
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
    });
    
    document.getElementById('save-adjustments-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        
        const newNextTime = parseInt(document.getElementById('adjust-next-time').value) || 60;
        const newDeparted = parseInt(document.getElementById('adjust-departed').value) || 0;
        
        if (newNextTime <= 0 || newDeparted < 0) {
            showMessage(t.invalidValues, 'error');
            return;
        }
        
        appState.departedCount = newDeparted;
        
        const currentCorredor = appState.departedCount + 1;
        const startFromCorredor = currentCorredor + 1;

        document.getElementById('start-position').value = newDeparted + 1;
        
        const displayElement = document.getElementById('next-corredor-time');
        if (displayElement) {
            if (newNextTime >= 60) {
                const minutes = Math.floor(newNextTime / 60);
                const seconds = newNextTime % 60;
                displayElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                displayElement.textContent = newNextTime + "s";
            }
        }
        
        updateCurrentInterval();
        updateNextCorredorDisplay();
        document.getElementById('departed-count').textContent = newDeparted;
        updateCountdownDisplay();
        
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
        saveAppState();
        
        const message = t.adjustmentsSaved
            .replace('{seconds}', newNextTime)
            .replace('{corredor}', startFromCorredor);
        showMessage(message, 'success');
    });

    document.getElementById('adjust-next-time').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('adjust-departed').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // ============================================
    // LISTENERS PARA MODO LLEGADAS
    // ============================================
    
    // Cronómetro de llegadas
    document.getElementById('start-llegadas-btn').addEventListener('click', startLlegadasTimer);
    document.getElementById('stop-llegadas-btn').addEventListener('click', stopLlegadasTimer);
    
    // Registro de llegadas
    document.getElementById('register-llegada-btn').addEventListener('click', () => {
        if (!llegadasState.timerActive) {
            const t = translations[appState.currentLanguage];
            showMessage(t.startTimerFirst, 'warning');
            return;
        }
        showRegisterLlegadaModal();
    });
    
    document.getElementById('quick-register-btn').addEventListener('click', () => {
        if (!llegadasState.timerActive) {
            const t = translations[appState.currentLanguage];
            showMessage(t.startTimerFirst, 'warning');
            return;
        }
        showQuickRegisterLlegada();
    });
    
    // Importación de salidas
    document.getElementById('import-llegadas-btn').addEventListener('click', () => {
        document.getElementById('import-salidas-modal').classList.add('active');
    });
    
    // Gestión de llegadas
    document.getElementById('clear-llegadas-btn').addEventListener('click', clearLlegadas);
    document.getElementById('export-llegadas-btn').addEventListener('click', exportLlegadasToExcel);
    document.getElementById('show-ranking-btn').addEventListener('click', showRankingModal);

    // ============================================
    // LISTENERS PARA MODALES DE LLEGADAS
    // ============================================
    
    // Modal de registro de llegada
    document.getElementById('register-llegada-modal-close').addEventListener('click', () => {
        document.getElementById('register-llegada-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-llegada-btn').addEventListener('click', () => {
        document.getElementById('register-llegada-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-llegada-btn').addEventListener('click', confirmRegisterLlegada);
    
    // Modal de importación de salidas
    document.getElementById('import-salidas-modal-close').addEventListener('click', () => {
        document.getElementById('import-salidas-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-import-salidas-btn').addEventListener('click', () => {
        document.getElementById('import-salidas-modal').classList.remove('active');
    });
    
    document.getElementById('confirm-import-salidas-btn').addEventListener('click', importSalidasForLlegadas);
    
    document.getElementById('salidas-file-input').addEventListener('change', function() {
        previewImportFile(this);
    });
    
    // Modal de clasificación
    document.getElementById('ranking-modal-close').addEventListener('click', () => {
        document.getElementById('ranking-modal').classList.remove('active');
    });
    
    document.getElementById('close-ranking-btn').addEventListener('click', () => {
        document.getElementById('ranking-modal').classList.remove('active');
    });
    
    document.getElementById('export-ranking-btn').addEventListener('click', exportRankingToExcel);

    // ============================================
    // LISTENERS PARA AUDIO
    // ============================================
    
    // Configuración de audio
    document.querySelectorAll('.audio-option').forEach(option => {
        option.addEventListener('click', function() {
            const audioType = this.getAttribute('data-audio-type');
            selectAudioType(audioType);
        });
    });
    
    document.getElementById('test-audio-btn').addEventListener('click', testCurrentAudio);

    // ============================================
    // LISTENERS PARA SUGERENCIAS
    // ============================================
    
    document.getElementById('suggestions-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.add('active');
        document.getElementById('suggestion-text').focus();
    });
    
    document.getElementById('send-suggestion-btn').addEventListener('click', sendSuggestion);
    
    document.getElementById('suggestions-modal-close').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-suggestion-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });

    // ============================================
    // LISTENERS PARA PWA
    // ============================================
    
    document.getElementById('install-btn').addEventListener('click', installPWA);
    
    document.getElementById('update-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.update();
                showMessage(t.updateChecked, 'info');
            });
        }
    });

    // ============================================
    // LISTENERS PARA CIERRE DE MODALES AL HACER CLIC FUERA
    // ============================================
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (modal.id === 'config-during-countdown-modal' || 
                    modal.id === 'adjust-times-modal') {
                    resumeCountdownVisual();
                }
            }
        });
    });

    // ============================================
    // LISTENERS PARA EVENTOS DE TECLADO
    // ============================================
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
        
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('start-countdown-btn').click();
        }
        
        // Atajo para registro rápido de llegada (tecla L)
        if (e.key === 'l' || e.key === 'L') {
            if (document.getElementById('mode-llegadas-content').classList.contains('active') && 
                llegadasState.timerActive) {
                showQuickRegisterLlegada();
            }
        }
    });

    console.log("Todos los event listeners configurados.");
}

// ============================================
// FUNCIONES DE CARGA Y GUARDADO
// ============================================
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('countdown-language');
    if (savedLang && translations[savedLang]) {
        appState.currentLanguage = savedLang;
    }
}

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

function loadRaceData() {
    if (!appState.currentRace) {
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.nextCorredorTime = 60;
        startOrderData = [];
        
        document.getElementById('departed-count').textContent = appState.departedCount;
        document.getElementById('start-position').value = appState.departedCount + 1;
        document.getElementById('first-start-time').value = "09:00";
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
        document.getElementById('first-start-time').value = "09:00";
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
    updateTimeDifference(); // Actualizar diferencia de tiempo
    
    console.log("Datos cargados para carrera:", appState.currentRace.name);
    console.log("Hora inicio:", document.getElementById('first-start-time').value);
    console.log("Salidas:", appState.departureTimes.length);
    console.log("Orden de salida:", startOrderData.length, "corredores");
}


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
    const currentFirstStartTime = document.getElementById('first-start-time').value || "09:00";
    
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

function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) {
        localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
    }
    console.log("Carreras guardadas en localStorage:", appState.races.length);
}

// ============================================
// FUNCIONES DE CARRERA
// ============================================
function createNewRace() {
    const t = translations[appState.currentLanguage];
    
    const name = document.getElementById('new-race-name').value.trim();
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    const description = document.getElementById('new-race-description').value.trim();
    const firstStartTime = document.getElementById('first-start-time').value || "09:00";
    
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
    console.log("Modo: single");
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
        document.getElementById('first-start-time').value = "09:00";
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

function exportToExcel() {
    const t = translations[appState.currentLanguage];
    
    if (appState.departureTimes.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const sortedForExport = [...appState.departureTimes].sort((a, b) => a.corredor - b.corredor);
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Descripción', appState.currentRace ? (appState.currentRace.description || 'Sin descripción') : ''],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Hora de exportación', new Date().toLocaleTimeString()],
        ['Total de salidas', appState.departureTimes.length],
        [''],
        ['Salida', 'Tiempo', 'Nota', 'Fecha', 'Hora', 'Timestamp']
    ];
    
    sortedForExport.forEach(departure => {
        const date = new Date(departure.timestamp);
        const timeValue = departure.timeValue || '--:--:--';
        
        data.push([
            departure.corredor,
            timeValue,
            departure.notes || '',
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            departure.timestamp
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salidas");
    
    const colWidths = [
        {wch: 8},
        {wch: 10},
        {wch: 50},
        {wch: 12},
        {wch: 10},
        {wch: 15}
    ];
    ws['!cols'] = colWidths;
    
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 0; R <= 4; R++) {
        for (let C = 0; C <= 1; C++) {
            const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E0E0E0" } }
            };
        }
    }
    
    const headerRow = 6;
    for (let C = 0; C <= 5; C++) {
        const cellAddress = XLSX.utils.encode_cell({r: headerRow, c: C});
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2C3E50" } },
            alignment: { horizontal: "center" }
        };
    }
    
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: headerRow, c: 0 },
            e: { r: headerRow + sortedForExport.length, c: 5 }
        })
    };
    
    const raceName = appState.currentRace ? 
        appState.currentRace.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50) : 'carrera';
    const date = new Date().toISOString().split('T')[0];
    const filename = `salidas_${raceName}_${date}.xlsx`;
    
    XLSX.writeFile(wb, filename);
    showMessage(t.excelExported, 'success');
}

// ============================================
// FUNCIONES DE CUENTA ATRÁS
// ============================================
function startCountdown() {
    console.log("Iniciando cuenta atrás...");
    
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    // Siempre modo único
    updateCadenceTime();
    
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = 'none';
    });
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('active');
    countdownScreen.classList.remove('aggressive-numbers');
    
    appState.raceStartTime = Date.now();
    appState.accumulatedTime = 0;
    
    const startPosition = parseInt(document.getElementById('start-position').value) || 1;
    appState.departedCount = startPosition - 1;
    document.getElementById('departed-count').textContent = appState.departedCount;
    
    if (startPosition > 1) {
        appState.departureTimes = [];
        if (appState.currentRace) {
            appState.currentRace.departures = [];
            saveRaceData();
        }
    }
    
    appState.countdownActive = true;
    appState.countdownPaused = false;
    appState.countdownValue = appState.nextCorredorTime;
    appState.aggressiveMode = false;
    
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    
    countdownScreen.classList.remove('countdown-salida-active');
    
    document.getElementById('countdown-label').style.opacity = '1';
    document.getElementById('countdown-label').style.visibility = 'visible';
    
    updateCountdownDisplay();
    
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
    }
    
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    
    keepScreenAwake();
    
    saveAppState();
    
    showMessage(t.countdownStarted, 'success');
    console.log("Cuenta atrás iniciada correctamente.");
}


function updateCadenceTime() {
    const minutes = parseInt(document.getElementById('interval-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    appState.nextCorredorTime = totalSeconds;
    
    console.log("Intervalo único configurado:", minutes, "min", seconds, "seg");
    
    updateNextCorredorDisplay();
}

function updateCountdown() {
    if (!appState.countdownActive || appState.countdownPaused) return;
    
    const currentTime = Date.now();
    const elapsedFromRaceStart = Math.floor((currentTime - appState.raceStartTime) / 1000);
    
    const expectedElapsedTime = appState.accumulatedTime + 
        (appState.nextCorredorTime - appState.countdownValue);
    
    if (Math.abs(elapsedFromRaceStart - expectedElapsedTime) > 1) {
        appState.countdownValue = Math.max(0, appState.nextCorredorTime - 
            (elapsedFromRaceStart - appState.accumulatedTime));
    } else {
        appState.countdownValue--;
    }
    
    if (appState.countdownValue <= 0) {
        handleCountdownZero();
        return;
    }
    
    updateCountdownDisplay();
    
    if (appState.countdownValue === 10) {
        document.body.classList.remove('countdown-normal');
        document.body.classList.add('countdown-warning');
        playSound('warning');
        
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.remove('aggressive-numbers');
        appState.aggressiveMode = false;
    } else if (appState.countdownValue === 5) {
        document.body.classList.remove('countdown-warning');
        document.body.classList.add('countdown-critical');
        playSound('critical');
        
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.add('aggressive-numbers');
        appState.aggressiveMode = true;
    } else if (appState.countdownValue < 5 && appState.countdownValue > 0) {
        if (appState.audioType === 'beep') {
            playSound('beep');
        } else if (appState.audioType === 'voice') {
            playSound('number');
        }
        
        if (!appState.aggressiveMode) {
            const countdownScreen = document.getElementById('countdown-screen');
            countdownScreen.classList.add('aggressive-numbers');
            appState.aggressiveMode = true;
        }
    } else if (appState.countdownValue > 5 && appState.aggressiveMode) {
        const countdownScreen = document.getElementById('countdown-screen');
        countdownScreen.classList.remove('aggressive-numbers');
        appState.aggressiveMode = false;
    }
    
    if (appState.countdownValue % 10 === 0) {
        saveAppState();
    }
}

function updateCountdownDisplay() {
    const display = document.getElementById('countdown-display');
    
    if (appState.countdownValue >= 60) {
        const minutes = Math.floor(appState.countdownValue / 60);
        const seconds = appState.countdownValue % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = appState.countdownValue.toString();
    }
    
    updateNextCorredorDisplay();
    adjustCountdownSize();
}

function handleCountdownZero() {
    clearInterval(appState.countdownInterval);
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('countdown-salida-active');
    
    countdownScreen.classList.remove('aggressive-numbers');
    appState.aggressiveMode = false;
    
    document.body.classList.remove('countdown-critical', 'countdown-warning', 'countdown-normal');
    document.body.classList.add('countdown-salida');
    
    const salidaDisplay = document.getElementById('salida-display');
    salidaDisplay.classList.add('show');
    
    playSound('salida');
    
    registerDeparture();
    
    appState.accumulatedTime += appState.nextCorredorTime;
    
    appState.salidaTimeout = setTimeout(() => {
        salidaDisplay.classList.remove('show');
        countdownScreen.classList.remove('countdown-salida-active');
        prepareNextCountdown();
    }, 2000);
}

function canModifyDuringCountdown() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.countdownActive) return true;
    
    if (appState.countdownValue <= 15) {
        showMessage(t.waitCountdownEnd, 'warning');
        return false;
    }
    
    return true;
}

function prepareNextCountdown() {
    updateCurrentInterval();
    
    appState.countdownValue = Math.max(0, appState.nextCorredorTime - 2);
    
    document.body.classList.remove('countdown-salida');
    document.body.classList.add('countdown-normal');
    
    document.getElementById('countdown-label').style.opacity = '1';
    document.getElementById('countdown-label').style.visibility = 'visible';
    
    updateCountdownDisplay();
    
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    
    saveAppState();
}

function updateCurrentInterval() {
    const currentCorredor = appState.departedCount + 1;
    
    const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
    
    for (let i = 0; i < sortedIntervals.length; i++) {
        const interval = sortedIntervals[i];
        
        if (currentCorredor >= interval.from && currentCorredor <= interval.to) {
            appState.currentIntervalIndex = i;
            appState.nextCorredorTime = interval.totalSeconds;
            return;
        }
    }
    
    if (sortedIntervals.length > 0) {
        const lastInterval = sortedIntervals[sortedIntervals.length - 1];
        if (currentCorredor > lastInterval.to) {
            appState.nextCorredorTime = lastInterval.totalSeconds;
            appState.currentIntervalIndex = sortedIntervals.length - 1;
        }
    } else {
        appState.nextCorredorTime = 60;
    }
}

function updateNextCorredorDisplay() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    
    const nextCorredorNumber = appState.departedCount + 2;
    
    let timeForNextCorredor = appState.nextCorredorTime;
    
    if (appState.intervals && appState.intervals.length > 0) {
        const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
        
        for (const interval of sortedIntervals) {
            if (nextCorredorNumber >= interval.from && nextCorredorNumber <= interval.to) {
                timeForNextCorredor = interval.totalSeconds;
                break;
            }
        }
        
        if (timeForNextCorredor === appState.nextCorredorTime) {
            const lastInterval = sortedIntervals[sortedIntervals.length - 1];
            if (lastInterval && nextCorredorNumber > lastInterval.to) {
                timeForNextCorredor = lastInterval.totalSeconds;
            }
        }
    }
    
    if (timeForNextCorredor >= 60) {
        const minutes = Math.floor(timeForNextCorredor / 60);
        const seconds = timeForNextCorredor % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = timeForNextCorredor + "s";
    }
    
    console.log(`Display actualizado: Próximo corredor (${nextCorredorNumber}) sale en ${timeForNextCorredor}s`);
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

function stopCountdown() {
    console.log("Deteniendo cuenta atrás...");
    
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
        appState.countdownInterval = null;
    }
    
    if (appState.salidaTimeout) {
        clearTimeout(appState.salidaTimeout);
        appState.salidaTimeout = null;
    }
    
    appState.countdownActive = false;
    appState.countdownPaused = false;
    appState.raceStartTime = null;
    appState.accumulatedTime = 0;
    appState.aggressiveMode = false;
    appState.configModalOpen = false;
    
    document.body.classList.remove(
        'countdown-normal', 
        'countdown-warning', 
        'countdown-critical', 
        'countdown-salida'
    );
    
    document.getElementById('countdown-screen').classList.remove('aggressive-numbers');
    
    document.body.style.backgroundColor = '';
    document.body.style.background = '';
    document.body.style.animation = '';
    
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    localStorage.removeItem('countdown-app-state');
    
    console.log("Cuenta atrás detenida");
}

function pauseCountdownVisual() {
    appState.countdownPaused = true;
    appState.configModalOpen = true;
}

function resumeCountdownVisual() {
    appState.countdownPaused = false;
    appState.configModalOpen = false;
}


// ============================================
// FUNCIONES DE INTERFAZ
// ============================================
function updateSalidaText() {
    const lang = appState.currentLanguage;
    const t = translations[lang];
    const salidaDisplay = document.getElementById('salida-display');
    
    if (salidaDisplay) {
        salidaDisplay.textContent = t.salidaText;
    }
}

function renderRacesSelect() {
    const select = document.getElementById('race-select');
    select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
    
    appState.races.forEach((race, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = race.name;
        if (appState.currentRace && race.id === appState.currentRace.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ============================================
// FUNCIONES PARA GESTIÓN DEL ORDEN DE SALIDA
// ============================================

let startOrderData = [];

function updateSystemTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('current-system-time-display').textContent = timeString;
    updateTimeDifference();
}

function updateTimeDifference() {
    const firstStartTime = document.getElementById('first-start-time').value;
    if (!firstStartTime) return;
    
    const [hours, minutes] = firstStartTime.split(':').map(Number);
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, 0, 0);
    
    if (startTime < now) {
        startTime.setDate(startTime.getDate() + 1);
    }
    
    const diffMs = startTime - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffMinutes = Math.floor((diffSeconds % 3600) / 60);
    const diffSecs = diffSeconds % 60;
    
    const diffString = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
    document.getElementById('time-difference-display').textContent = diffString;
}





function createStartOrderTemplate() {
    const t = translations[appState.currentLanguage];
    
    // Mostrar modal de configuración
    document.getElementById('template-config-modal').classList.add('active');
    
    // Configurar botones del modal
    document.getElementById('generate-template-btn').onclick = function() {
        generateTemplateFromUserInput();
    };
    
    document.getElementById('cancel-template-btn').onclick = function() {
        document.getElementById('template-config-modal').classList.remove('active');
    };
    
    document.getElementById('template-config-modal-close').onclick = function() {
        document.getElementById('template-config-modal').classList.remove('active');
    };
}

function generateTemplateFromUserInput() {
    const t = translations[appState.currentLanguage];
    
    // Obtener valores del usuario
    const numCorredores = parseInt(document.getElementById('template-num-corredores').value) || 10;
    const intervalo = document.getElementById('template-intervalo').value || '00:01:00';
    const horaInicio = document.getElementById('template-hora-inicio').value || '09:00:00';
    
    // Validar valores
    if (numCorredores <= 0 || numCorredores > 1000) {
        showMessage(t.enterValidRiders, 'error');
        return;
    }
    
    if (!isValidTime(intervalo)) {
        showMessage(t.enterValidInterval, 'error');
        return;
    }
    
    if (!isValidTime(horaInicio)) {
        showMessage(t.enterValidStartTime, 'error');
        return;
    }
    
    // Cerrar modal
    document.getElementById('template-config-modal').classList.remove('active');
    
    // Convertir intervalo a valor numérico de Excel
    const intervaloExcel = timeToExcelValue(intervalo);
    const horaInicioExcel = timeToExcelValue(horaInicio);
    
    // Crear encabezados
    const headers = ['Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Diferencia', 'Nombre', 'Apellidos', 'Chip', 
                    'Hora Salida Real', 'Crono Salida Real', 'Hora Salida Prevista', 'Crono Salida Prevista', 
                    'Hora Salida Importado', 'Crono Salida Importado', 'Crono Segundos', 'Hora Segundos'];
    
    // Crear los datos
    const data = [headers];
    
    for (let i = 1; i <= numCorredores; i++) {
        const row = new Array(headers.length).fill('');
        
        // Orden
        row[0] = i;
        
        // Crono Salida (C)
        if (i === 1) {
            row[2] = { t: 'n', v: 0, z: 'hh:mm:ss' }; // 00:00:00
        } else {
            row[2] = { t: 'n', f: `C${i}+E${i+1}`, z: 'hh:mm:ss' };
        }
        
        // Hora Salida (D)
        if (i === 1) {
            row[3] = { t: 'n', v: horaInicioExcel, z: 'hh:mm:ss' }; // Hora inicio del usuario
        } else {
            row[3] = { t: 'n', f: `D${i}+E${i+1}`, z: 'hh:mm:ss' };
        }
        
        // Diferencia (E)
        if (i === 1) {
            row[4] = { t: 'n', v: 0, z: 'hh:mm:ss' }; // 00:00:00
        } else {
            row[4] = { t: 'n', v: intervaloExcel, z: 'hh:mm:ss' }; // Intervalo del usuario
        }
        
        // Crono Segundos (O) - columna 14
        row[14] = { t: 'n', f: `HOUR(C${i+1})*3600 + MINUTE(C${i+1})*60 + SECOND(C${i+1})` };
        
        // Hora Segundos (P) - columna 15
        row[15] = { t: 'n', f: `HOUR(D${i+1})*3600 + MINUTE(D${i+1})*60 + SECOND(D${i+1})` };
        
        data.push(row);
    }
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(data, { cellStyles: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Salida");
    
    // Ajustar anchos
    const colWidths = [
        {wch: 8}, {wch: 8}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 15}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}
    ];
    ws['!cols'] = colWidths;
    
    // Aplicar formato HORA a las columnas C, D, E e I-N
    for (let r = 1; r <= numCorredores; r++) {
        // Columnas C, D, E (2, 3, 4)
        for (let c = 2; c <= 4; c++) {
            const cell = XLSX.utils.encode_cell({r: r, c: c});
            if (ws[cell]) {
                // Asegurar formato de hora
                ws[cell].z = ws[cell].z || 'hh:mm:ss';
                if (!ws[cell].s) ws[cell].s = {};
                ws[cell].s.numFmt = 'hh:mm:ss';
            }
        }
        
        // Columnas I-N (8-13) - solo formato, vacías
        for (let c = 8; c <= 13; c++) {
            const cell = XLSX.utils.encode_cell({r: r, c: c});
            if (!ws[cell]) {
                ws[cell] = { t: 's', v: '' };
            }
            ws[cell].z = 'hh:mm:ss';
            if (!ws[cell].s) ws[cell].s = {};
            ws[cell].s.numFmt = 'hh:mm:ss';
        }
    }
    
    // Auto-filtro
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: numCorredores, c: headers.length - 1 }
        })
    };
    
    // Generar nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `plantilla_orden_salida_${numCorredores}_corredores_${dateStr}.xlsx`;
    
    // Guardar archivo
    XLSX.writeFile(wb, filename);
    
    // Mostrar mensaje de éxito
    const message = t.templateCreatedCustom
        .replace('{count}', numCorredores)
        .replace('{interval}', intervalo)
        .replace('{startTime}', horaInicio);
    
    showMessage(message, 'success');
    
    console.log(`Plantilla creada con ${numCorredores} corredores, intervalo ${intervalo}, inicio ${horaInicio}`);
}

// Función para validar formato de tiempo HH:MM:SS
function isValidTime(timeStr) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(timeStr);
}

// Función para convertir tiempo HH:MM:SS a valor numérico de Excel
function timeToExcelValue(timeStr) {
    if (!timeStr) return 0;
    
    const parts = timeStr.split(':');
    if (parts.length !== 3) return 0;
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    // En Excel: 1 = 24 horas, 1/24 = 1 hora, 1/24/60 = 1 minuto, 1/24/60/60 = 1 segundo
    return (hours / 24) + (minutes / 24 / 60) + (seconds / 24 / 60 / 60);
}



function importStartOrder() {
    const t = translations[appState.currentLanguage];
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    showMessage(t.fileEmpty, 'error');
                    return;
                }
                
                // Verificar que el archivo tenga los encabezados correctos
                const headers = jsonData[0];
                const expectedHeaders = ['Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Nombre', 'Apellidos', 'Chip'];
                
                // Procesar los datos (ahora con todos los campos)
                startOrderData = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row && row.length >= 7) {
                        const rider = {
                            order: parseInt(row[0]) || (i),
                            dorsal: parseInt(row[1]) || 0,
                            cronoSalida: row[2] || '',
                            horaSalida: row[3] || '',
                            nombre: row[4] || '',
                            apellidos: row[5] || '',
                            chip: row[6] || '',
                            horaSalidaReal: row[7] || '',
                            cronoSalidaReal: row[8] || '',
                            horaSalidaPrevista: row[9] || '',
                            cronoSalidaPrevista: row[10] || '',
                            horaSalidaImportado: row[11] || '',
                            cronoSalidaImportado: row[12] || '',
                            cronoSegundos: timeToSeconds(row[2]),
                            horaSegundos: timeToSeconds(row[3])
                        };
                        
                        // Si faltan valores, calcularlos
                        if (!rider.horaSalida) {
                            rider.horaSalida = calculateStartTime(i-1);
                        }
                        if (!rider.cronoSalida) {
                            rider.cronoSalida = secondsToTime((i-1) * 60);
                        }
                        
                        startOrderData.push(rider);
                    }
                }
                
                // Ordenar por número de orden
                startOrderData.sort((a, b) => a.order - b.order);
                
                document.getElementById('total-riders').value = startOrderData.length;
                updateStartOrderTable();
                saveStartOrderData();
                
                showMessage(t.orderImported.replace('{count}', startOrderData.length), 'success');
            } catch (error) {
                console.error('Error importing file:', error);
                showMessage(t.importError, 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };
    
    input.click();
}


function deleteStartOrder() {
    const t = translations[appState.currentLanguage];
    
    if (startOrderData.length === 0) {
        showMessage(t.listAlreadyEmpty, 'info');
        return;
    }
    
    if (confirm(t.confirmDeleteOrder)) {
        startOrderData = [];
        updateStartOrderTable();
        document.getElementById('total-riders').value = 1;
        saveStartOrderData();
        showMessage(t.orderDeleted, 'success');
    }
}

function exportStartOrder() {
    const t = translations[appState.currentLanguage];
    
    if (startOrderData.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    // Usar los mismos campos que la plantilla
    const data = [
        ['Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Nombre', 'Apellidos', 'Chip', 
         'Hora Salida Real', 'Crono Salida Real', 'Hora Salida Prevista', 'Crono Salida Prevista', 
         'Hora Salida Importado', 'Crono Salida Importado', 'Crono Segundos', 'Hora Segundos']
    ];
    
    startOrderData.forEach(rider => {
        data.push([
            rider.order,
            rider.dorsal,
            rider.cronoSalida,
            rider.horaSalida,
            rider.nombre,
            rider.apellidos,
            rider.chip,
            rider.horaSalidaReal,
            rider.cronoSalidaReal,
            rider.horaSalidaPrevista,
            rider.cronoSalidaPrevista,
            rider.horaSalidaImportado,
            rider.cronoSalidaImportado,
            rider.cronoSegundos,
            rider.horaSegundos
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orden Salida");
    
    // Mismo formato que la plantilla
    const colWidths = [
        {wch: 8}, {wch: 8}, {wch: 12}, {wch: 12}, {wch: 15}, {wch: 20}, {wch: 12},
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}
    ];
    ws['!cols'] = colWidths;
    
    // Formatear encabezados
    const headerRow = 0;
    for (let C = 0; C < data[0].length; C++) {
        const cellAddress = XLSX.utils.encode_cell({r: headerRow, c: C});
        if (ws[cellAddress]) {
            ws[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2C3E50" } },
                alignment: { horizontal: "center" }
            };
        }
    }
    
    // Auto-filtro para facilitar la navegación
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: startOrderData.length, c: data[0].length - 1 }
        })
    };
    
    const filename = `orden_salida_${appState.currentRace ? appState.currentRace.name.replace(/[^a-z0-9]/gi, '_') : 'sin_nombre'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showMessage(t.orderExported, 'success');
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

function updateStartOrderTable() {
    const tableBody = document.getElementById('start-order-table-body');
    const emptyState = document.getElementById('start-order-empty');
    
    if (startOrderData.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let html = '';
    startOrderData.forEach((rider, index) => {
        html += `
        <tr data-index="${index}">
            <td class="number-cell editable" data-field="order">${rider.order}</td>
            <td class="number-cell editable" data-field="dorsal">${rider.dorsal}</td>
            <td class="time-cell editable" data-field="cronoSalida">${rider.cronoSalida}</td>
            <td class="time-cell editable" data-field="horaSalida">${rider.horaSalida}</td>
            <td class="name-cell editable" data-field="nombre">${rider.nombre}</td>
            <td class="name-cell editable" data-field="apellidos">${rider.apellidos}</td>
            <td class="editable" data-field="chip">${rider.chip}</td>
            <td class="time-cell editable" data-field="horaSalidaReal">${rider.horaSalidaReal}</td>
            <td class="time-cell editable" data-field="cronoSalidaReal">${rider.cronoSalidaReal}</td>
            <td class="time-cell">${rider.horaSalidaPrevista}</td>
            <td class="time-cell">${rider.cronoSalidaPrevista}</td>
            <td class="time-cell">${rider.horaSalidaImportado}</td>
            <td class="time-cell">${rider.cronoSalidaImportado}</td>
            <td class="number-cell">${rider.cronoSegundos}</td>
            <td class="number-cell">${rider.horaSegundos}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Añadir event listeners para celdas editables
    document.querySelectorAll('.start-order-table td.editable').forEach(cell => {
        cell.addEventListener('click', handleTableCellClick);
    });
}

function handleTableCellClick(e) {
    const cell = e.target;
    const field = cell.getAttribute('data-field');
    const rowIndex = cell.closest('tr').getAttribute('data-index');
    const currentValue = cell.textContent;
    
    let input;
    if (field === 'horaSalida' || field === 'horaSalidaReal' || 
        field === 'cronoSalida' || field === 'cronoSalidaReal') {
        input = document.createElement('input');
        input.type = 'time';
        input.step = '1';
        input.value = currentValue;
    } else if (field === 'order' || field === 'dorsal' || field === 'cronoSegundos' || field === 'horaSegundos') {
        input = document.createElement('input');
        input.type = 'number';
        input.value = currentValue;
    } else {
        input = document.createElement('input');
        input.type = 'text';
        input.value = currentValue;
    }
    
    input.className = 'table-edit-input';
    
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
    input.select();
    
    const finishEdit = () => {
        const newValue = input.value.trim();
        cell.textContent = newValue;
        
        // Actualizar los datos
        startOrderData[rowIndex][field] = newValue;
        
        // Si es un tiempo, actualizar también los segundos
        if (field === 'horaSalida' || field === 'horaSalidaReal') {
            startOrderData[rowIndex][field + 'Segundos'] = timeToSeconds(newValue);
        } else if (field === 'cronoSalida' || field === 'cronoSalidaReal') {
            startOrderData[rowIndex][field + 'Segundos'] = timeToSeconds(newValue);
        }
        
        saveStartOrderData();
    };
    
    input.addEventListener('blur', finishEdit);
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });
}

function calculateStartTime(index) {
    const firstStartTime = document.getElementById('first-start-time').value;
    if (!firstStartTime) return '09:00:00';
    
    const [hours, minutes] = firstStartTime.split(':').map(Number);
    const interval = 60; // 1 minuto entre salidas
    
    const totalSeconds = (hours * 3600) + (minutes * 60) + (index * interval);
    const newHours = Math.floor(totalSeconds / 3600) % 24;
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeString) {
    if (!timeString) return 0;
    
    const parts = timeString.split(':');
    if (parts.length === 3) {
        return (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
    } else if (parts.length === 2) {
        return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
    }
    return 0;
}

function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

// ============================================
// INICIALIZACIÓN AL CARGAR
// ============================================
document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) saveLastUpdate();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && appState.countdownActive && !appState.configModalOpen) {
        pauseCountdownVisual();
        document.getElementById('config-during-countdown-modal').classList.add('active');
    }
    
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('start-countdown-btn').click();
    }
});

// ============================================
// INICIALIZACIÓN DEL MODO LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas...");
    
    // Cargar estado guardado
    loadLlegadasState();
    
    // Inicializar cronómetro
    updateLlegadasTimerDisplay();
    
    // Renderizar lista si hay datos
    renderLlegadasList();
    
    console.log("Modo llegadas inicializado");
}

function setupLlegadasEventListeners() {
    document.getElementById('start-llegadas-btn').addEventListener('click', startLlegadasTimer);
    document.getElementById('stop-llegadas-btn').addEventListener('click', stopLlegadasTimer);
    document.getElementById('register-llegada-btn').addEventListener('click', registerLlegada);
    document.getElementById('import-llegadas-btn').addEventListener('click', importSalidasForLlegadas);
    document.getElementById('quick-register-btn').addEventListener('click', quickRegisterLlegada);
    document.getElementById('clear-llegadas-btn').addEventListener('click', clearLlegadas);
    document.getElementById('export-llegadas-btn').addEventListener('click', exportLlegadasToExcel);
    document.getElementById('show-ranking-btn').addEventListener('click', showRanking);
}

function startLlegadasTimer() {
    if (!llegadasState.timerActive) {
        llegadasState.startTime = Date.now() - (llegadasState.currentTime * 1000);
        llegadasState.timerActive = true;
        
        llegadasState.timerInterval = setInterval(() => {
            llegadasState.currentTime = Math.floor((Date.now() - llegadasState.startTime) / 1000);
            updateLlegadasTimer();
        }, 100);
        
        showMessage("Cronómetro de llegadas iniciado", "success");
    }
}

function stopLlegadasTimer() {
    if (llegadasState.timerActive) {
        clearInterval(llegadasState.timerInterval);
        llegadasState.timerActive = false;
        showMessage("Cronómetro detenido", "info");
    }
}

function updateLlegadasTimer() {
    const display = document.getElementById('llegadas-timer-display');
    if (!display) return;
    
    const hours = Math.floor(llegadasState.currentTime / 3600);
    const minutes = Math.floor((llegadasState.currentTime % 3600) / 60);
    const seconds = llegadasState.currentTime % 60;
    
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ... funciones restantes para el modo llegadas

// ####

// ============================================
// FUNCIONES PARA EL MODO LLEGADAS
// ============================================

// Estado del modo llegadas
let llegadasState = {
    timerActive: false,
    startTime: null,
    currentTime: 0,
    timerInterval: null,
    llegadas: [],
    importedSalidas: [],
    timerStarted: false
};

// Inicializar cronómetro de llegadas
function initLlegadasMode() {
    console.log("Inicializando modo llegadas...");
    
    // Cargar estado guardado
    loadLlegadasState();
    
    // Inicializar cronómetro
    updateLlegadasTimerDisplay();
    
    // Renderizar lista si hay datos
    renderLlegadasList();
}

// Cargar estado de llegadas
function loadLlegadasState() {
    const savedState = localStorage.getItem('llegadas-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        llegadasState.llegadas = state.llegadas || [];
        llegadasState.importedSalidas = state.importedSalidas || [];
        llegadasState.currentTime = state.currentTime || 0;
        llegadasState.timerStarted = state.timerStarted || false;
        
        if (state.timerStarted) {
            // Si el cronómetro estaba activo, reiniciarlo desde el tiempo guardado
            llegadasState.startTime = Date.now() - (state.currentTime * 1000);
            startLlegadasTimer();
        }
        
        console.log("Estado de llegadas cargado:", llegadasState.llegadas.length, "llegadas");
    }
}

// Guardar estado de llegadas
function saveLlegadasState() {
    localStorage.setItem('llegadas-state', JSON.stringify({
        llegadas: llegadasState.llegadas,
        importedSalidas: llegadasState.importedSalidas,
        currentTime: llegadasState.currentTime,
        timerStarted: llegadasState.timerActive || llegadasState.timerStarted
    }));
}

// Iniciar cronómetro de llegadas
function startLlegadasTimer() {
    const t = translations[appState.currentLanguage];
    
    if (!llegadasState.timerActive) {
        // Si no hay tiempo de inicio, usar el tiempo actual
        if (!llegadasState.startTime) {
            llegadasState.startTime = Date.now() - (llegadasState.currentTime * 1000);
        }
        
        llegadasState.timerActive = true;
        llegadasState.timerStarted = true;
        
        llegadasState.timerInterval = setInterval(() => {
            llegadasState.currentTime = Math.floor((Date.now() - llegadasState.startTime) / 1000);
            updateLlegadasTimerDisplay();
            
            // Guardar estado cada 10 segundos
            if (llegadasState.currentTime % 10 === 0) {
                saveLlegadasState();
            }
        }, 100);
        
        showMessage(t.timerStarted, 'success');
        console.log("Cronómetro de llegadas iniciado");
    }
}

// Detener cronómetro de llegadas
function stopLlegadasTimer() {
    const t = translations[appState.currentLanguage];
    
    if (llegadasState.timerActive) {
        clearInterval(llegadasState.timerInterval);
        llegadasState.timerActive = false;
        saveLlegadasState();
        
        showMessage(t.timerStopped, 'info');
        console.log("Cronómetro de llegadas detenido");
    }
}

// Actualizar display del cronómetro
function updateLlegadasTimerDisplay() {
    const display = document.getElementById('llegadas-timer-display');
    if (!display) return;
    
    const hours = Math.floor(llegadasState.currentTime / 3600);
    const minutes = Math.floor((llegadasState.currentTime % 3600) / 60);
    const seconds = llegadasState.currentTime % 60;
    
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Mostrar modal de registro de llegada
function showRegisterLlegadaModal() {
    const modal = document.getElementById('register-llegada-modal');
    const horaInput = document.getElementById('llegada-hora');
    
    // Establecer hora actual
    horaInput.value = secondsToTime(llegadasState.currentTime);
    
    // Limpiar otros campos
    document.getElementById('llegada-dorsal').value = '';
    document.getElementById('llegada-notas').value = '';
    
    modal.classList.add('active');
}

// Registro rápido de llegada
function showQuickRegisterLlegada() {
    const t = translations[appState.currentLanguage];
    
    // Pedir dorsal rápidamente
    const dorsal = prompt(t.enterDorsal);
    if (!dorsal || isNaN(dorsal) || parseInt(dorsal) <= 0) {
        showMessage(t.invalidDorsal, 'error');
        return;
    }
    
    const dorsalNum = parseInt(dorsal);
    
    // Verificar si ya existe llegada para este dorsal
    const existingLlegada = llegadasState.llegadas.find(l => l.dorsal === dorsalNum);
    if (existingLlegada) {
        showMessage(t.llegadaAlreadyExists.replace('{dorsal}', dorsalNum), 'warning');
        return;
    }
    
    // Crear llegada
    const llegada = {
        dorsal: dorsalNum,
        horaSalida: '',
        horaLlegada: secondsToTime(llegadasState.currentTime),
        tiempoCrono: '',
        notas: 'Registro rápido',
        timestamp: Date.now()
    };
    
    // Intentar obtener hora de salida si hay datos importados
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsalNum);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida);
            const tiempoCronoSegundos = llegadasState.currentTime - segundosSalida;
            llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
        }
    }
    
    llegadasState.llegadas.push(llegada);
    saveLlegadasState();
    renderLlegadasList();
    
    showMessage(t.llegadaRegistered.replace('{dorsal}', dorsalNum), 'success');
}

// Confirmar registro de llegada desde modal
function confirmRegisterLlegada() {
    const t = translations[appState.currentLanguage];
    
    const dorsalInput = document.getElementById('llegada-dorsal');
    const notasInput = document.getElementById('llegada-notas');
    
    const dorsal = parseInt(dorsalInput.value);
    if (!dorsal || isNaN(dorsal) || dorsal <= 0) {
        showMessage(t.enterDorsal, 'error');
        return;
    }
    
    // Verificar si ya existe
    const existingLlegada = llegadasState.llegadas.find(l => l.dorsal === dorsal);
    if (existingLlegada) {
        showMessage(t.llegadaAlreadyExists.replace('{dorsal}', dorsal), 'warning');
        return;
    }
    
    // Crear llegada
    const llegada = {
        dorsal: dorsal,
        horaSalida: '',
        horaLlegada: document.getElementById('llegada-hora').value,
        tiempoCrono: '',
        notas: notasInput.value.trim(),
        timestamp: Date.now()
    };
    
    // Intentar obtener hora de salida
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida);
            const segundosLlegada = timeToSeconds(llegada.horaLlegada);
            const tiempoCronoSegundos = segundosLlegada - segundosSalida;
            llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
        }
    } else {
        // Si no hay datos de salida, mostrar advertencia
        showMessage(t.noStartTimeData, 'warning');
    }
    
    llegadasState.llegadas.push(llegada);
    saveLlegadasState();
    renderLlegadasList();
    
    document.getElementById('register-llegada-modal').classList.remove('active');
    showMessage(t.llegadaRegistered.replace('{dorsal}', dorsal), 'success');
}

// Limpiar llegadas
function clearLlegadas() {
    const t = translations[appState.currentLanguage];
    
    if (llegadasState.llegadas.length === 0) {
        showMessage(t.listAlreadyEmpty, 'info');
        return;
    }
    
    if (confirm(t.confirmClearLlegadas || "¿Estás seguro de que quieres limpiar todas las llegadas registradas?")) {
        llegadasState.llegadas = [];
        saveLlegadasState();
        renderLlegadasList();
        showMessage(t.llegadasCleared, 'success');
    }
}

// Renderizar lista de llegadas
function renderLlegadasList() {
    const tableBody = document.getElementById('llegadas-table-body');
    const emptyState = document.getElementById('llegadas-empty');
    
    if (!tableBody || !emptyState) return;
    
    if (llegadasState.llegadas.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let html = '';
    llegadasState.llegadas.forEach((llegada, index) => {
        html += `
        <tr data-index="${index}">
            <td>${llegada.dorsal}</td>
            <td>${getNombreFromDorsal(llegada.dorsal)}</td>
            <td>${llegada.horaSalida || '--:--:--'}</td>
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            <td>${llegada.tiempoCrono || '--:--:--'}</td>
            <td>${llegada.notas || ''}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Obtener nombre del corredor por dorsal (de datos importados)
function getNombreFromDorsal(dorsal) {
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
    if (salidaData && salidaData.nombre && salidaData.apellidos) {
        return `${salidaData.nombre} ${salidaData.apellidos}`;
    }
    
    const orderData = startOrderData.find(r => r.dorsal === dorsal);
    if (orderData && orderData.nombre && orderData.apellidos) {
        return `${orderData.nombre} ${orderData.apellidos}`;
    }
    
    return '';
}

// Vista previa de archivo de importación
function previewImportFile(input) {
    const previewContainer = document.getElementById('import-preview');
    const previewContent = document.getElementById('import-preview-content');
    
    if (!input.files || !input.files[0]) {
        previewContainer.style.display = 'none';
        return;
    }
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            let previewHtml = '<table style="width:100%; font-size:12px;">';
            const maxRows = Math.min(5, jsonData.length);
            
            for (let i = 0; i < maxRows; i++) {
                previewHtml += '<tr>';
                const row = jsonData[i] || [];
                for (let j = 0; j < Math.min(6, row.length); j++) {
                    previewHtml += `<td style="border:1px solid #ddd; padding:4px;">${row[j] || ''}</td>`;
                }
                previewHtml += '</tr>';
            }
            previewHtml += '</table>';
            
            previewContent.innerHTML = previewHtml;
            previewContainer.style.display = 'block';
        } catch (error) {
            previewContent.innerHTML = 'Error al leer el archivo';
            previewContainer.style.display = 'block';
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Importar datos de salidas
function importSalidasForLlegadas() {
    const t = translations[appState.currentLanguage];
    const fileInput = document.getElementById('salidas-file-input');
    
    if (!fileInput.files || !fileInput.files[0]) {
        showMessage(t.selectFileFirst, 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            
            llegadasState.importedSalidas = [];
            
            // Procesar datos (asumiendo formato estándar)
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (row && row.length >= 7) {
                    const salida = {
                        dorsal: parseInt(row[1]) || 0,
                        nombre: row[2] || '',
                        apellidos: row[3] || '',
                        horaSalida: row[5] || '',
                        cronoSalida: row[6] || '',
                        timestamp: Date.now()
                    };
                    
                    if (salida.dorsal > 0) {
                        llegadasState.importedSalidas.push(salida);
                    }
                }
            }
            
            saveLlegadasState();
            
            // Actualizar llegadas existentes con datos de salida
            llegadasState.llegadas.forEach(llegada => {
                const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === llegada.dorsal);
                if (salidaData) {
                    llegada.horaSalida = salidaData.horaSalida;
                    if (salidaData.horaSalida && llegada.horaLlegada) {
                        const segundosSalida = timeToSeconds(salidaData.horaSalida);
                        const segundosLlegada = timeToSeconds(llegada.horaLlegada);
                        const tiempoCronoSegundos = segundosLlegada - segundosSalida;
                        llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
                    }
                }
            });
            
            renderLlegadasList();
            
            document.getElementById('import-salidas-modal').classList.remove('active');
            showMessage(t.importSuccess.replace('{count}', llegadasState.importedSalidas.length), 'success');
            
        } catch (error) {
            console.error('Error importing file:', error);
            showMessage(t.importError, 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
}

// Mostrar modal de clasificación
function showRankingModal() {
    const t = translations[appState.currentLanguage];
    
    // Filtrar llegadas que tienen tiempo crono
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.tiempoCrono && l.tiempoCrono !== '--:--:--');
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noRankingText, 'info');
        return;
    }
    
    // Ordenar por tiempo crono (ascendente)
    llegadasConTiempo.sort((a, b) => {
        return timeToSeconds(a.tiempoCrono) - timeToSeconds(b.tiempoCrono);
    });
    
    // Generar tabla de ranking
    const tableBody = document.getElementById('ranking-table-body');
    const emptyState = document.getElementById('ranking-empty');
    
    if (llegadasConTiempo.length > 0) {
        emptyState.style.display = 'none';
        
        let html = '';
        let bestTime = null;
        
        llegadasConTiempo.forEach((llegada, index) => {
            const tiempoSegundos = timeToSeconds(llegada.tiempoCrono);
            
            let diferencia = '';
            if (bestTime === null) {
                bestTime = tiempoSegundos;
                diferencia = '--:--:--';
            } else {
                const diffSegundos = tiempoSegundos - bestTime;
                diferencia = secondsToTime(diffSegundos);
            }
            
            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${llegada.dorsal}</td>
                <td>${getNombreFromDorsal(llegada.dorsal)}</td>
                <td>${llegada.tiempoCrono}</td>
                <td>${diferencia}</td>
            </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } else {
        emptyState.style.display = 'block';
    }
    
    document.getElementById('ranking-modal').classList.add('active');
}

// Exportar llegadas a Excel
function exportLlegadasToExcel() {
    const t = translations[appState.currentLanguage];
    
    if (llegadasState.llegadas.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Hora de exportación', new Date().toLocaleTimeString()],
        ['Total de llegadas', llegadasState.llegadas.length],
        [''],
        ['Dorsal', 'Nombre', 'Hora Salida', 'Hora Llegada', 'Tiempo Crono', 'Notas']
    ];
    
    llegadasState.llegadas.forEach(llegada => {
        data.push([
            llegada.dorsal,
            getNombreFromDorsal(llegada.dorsal),
            llegada.horaSalida || '',
            llegada.horaLlegada || '',
            llegada.tiempoCrono || '',
            llegada.notas || ''
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Llegadas");
    
    const filename = `llegadas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showMessage(t.llegadasExported, 'success');
}

// Exportar ranking a Excel
function exportRankingToExcel() {
    const t = translations[appState.currentLanguage];
    
    // Filtrar y ordenar como en showRankingModal
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.tiempoCrono && l.tiempoCrono !== '--:--:--');
    llegadasConTiempo.sort((a, b) => timeToSeconds(a.tiempoCrono) - timeToSeconds(b.tiempoCrono));
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Hora de exportación', new Date().toLocaleTimeString()],
        ['Total en ranking', llegadasConTiempo.length],
        [''],
        ['Posición', 'Dorsal', 'Nombre', 'Tiempo Crono', 'Diferencia']
    ];
    
    let bestTime = null;
    llegadasConTiempo.forEach((llegada, index) => {
        const tiempoSegundos = timeToSeconds(llegada.tiempoCrono);
        
        let diferencia = '';
        if (bestTime === null) {
            bestTime = tiempoSegundos;
            diferencia = '--:--:--';
        } else {
            const diffSegundos = tiempoSegundos - bestTime;
            diferencia = secondsToTime(diffSegundos);
        }
        
        data.push([
            index + 1,
            llegada.dorsal,
            getNombreFromDorsal(llegada.dorsal),
            llegada.tiempoCrono,
            diferencia
        ]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clasificación");
    
    const filename = `clasificacion_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showMessage(t.rankingExported, 'success');
}

// ============================================
// FUNCIONES UTILITARIAS ADICIONALES
// ============================================

// Convertir tiempo "HH:MM:SS" a segundos
function timeToSeconds(timeString) {
    if (!timeString || timeString === '--:--:--') return 0;
    
    const parts = timeString.split(':');
    if (parts.length === 3) {
        return (parseInt(parts[0]) * 3600) + (parseInt(parts[1]) * 60) + parseInt(parts[2]);
    } else if (parts.length === 2) {
        return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
    }
    return 0;
}

// Convertir segundos a tiempo "HH:MM:SS"
function secondsToTime(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Cambiar modo de operación
function changeMode(mode) {
    const t = translations[appState.currentLanguage];
    
    // Actualizar opciones activas
    document.querySelectorAll('.mode-option').forEach(opt => {
        opt.classList.remove('active');
    });
    //document.querySelector(`.mode-option[data-mode="${mode}"]`).classList.add('active');
    
    // Mostrar/ocultar contenido
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(`mode-${mode}-content`).classList.add('active');
    
    // Guardar preferencia
    localStorage.setItem('app-mode', mode);
    
    // Si cambia a modo llegadas, inicializarlo
    if (mode === 'llegadas') {
        initLlegadasMode();
    }
    
    // Mostrar mensaje traducido
    const modeName = mode === 'salida' ? t.modeSalidaTitle : t.modeLlegadasTitle;
    showMessage(t.modeChanged.replace('{mode}', modeName), 'info');
    
    console.log(`Modo cambiado a: ${mode}`);
}