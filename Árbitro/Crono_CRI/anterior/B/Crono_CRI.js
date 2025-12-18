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
    aggressiveMode: false,
    isVariableMode: false
};
window.savingNotesIndex = null;

// ============================================
// INICIALIZACIÓN
// ============================================
// En la función initApp():
function initApp() {
    console.log("Inicializando aplicación...");
    
    loadLanguagePreference();
    loadRacesFromStorage();
    loadAppState();
    // loadIntervalConfig(); // ELIMINAR esta línea
    loadAudioPreferences();
    
    setTimeout(() => verifyAudioFiles(), 500);
    setTimeout(() => preloadVoiceAudios(), 1000);

    loadRaceData();
    
    updateLanguageUI();
    updateSalidaText();
    renderRacesSelect();
    setupSorting();
    
    setInterval(updateTotalTime, 1000);
    setInterval(updateCurrentTime, 1000);
    
    setupServiceWorker();
    setupPWA();
    setupCountdownResize();
    adjustCountdownSize();
    adjustInfoCornersSize();
    
    // setupIntervalsEvents(); // ELIMINAR
    // setupEditIntervalModalEvents(); // ELIMINAR
    setupEventListeners();
    setupAudioEventListeners();
    
    // setTimeout(() => setupSpecificIntervalListeners(), 500); // ELIMINAR
    
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    
    console.log("Aplicación inicializada.");
    console.log(`Idioma inicial: ${appState.currentLanguage}`);
    console.log(`Tipo de audio: ${appState.audioType}`);
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

// En setupEventListeners(), eliminar todas las referencias a tramos:
function setupEventListeners() {
    console.log("Configurando event listeners...");
    
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
    
    // ELIMINAR estas referencias:
    // document.getElementById('same-interval-btn').addEventListener('click', ...);
    // document.getElementById('variable-interval-btn').addEventListener('click', ...);
    // document.getElementById('add-interval-btn').addEventListener('click', ...);
    
    // También eliminar en el modal de ajustes la referencia a isVariableMode:
    document.getElementById('save-adjustments-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        
        const newNextTime = parseInt(document.getElementById('adjust-next-time').value) || 60;
        const newDeparted = parseInt(document.getElementById('adjust-departed').value) || 0;
        
        if (newNextTime <= 0 || newDeparted < 0) {
            showMessage(t.invalidValues, 'error');
            return;
        }
        
        appState.departedCount = newDeparted;
        appState.nextCorredorTime = newNextTime; // Actualizar directamente
        
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
        
        document.getElementById('departed-count').textContent = newDeparted;
        updateCountdownDisplay();
        
        document.getElementById('adjust-times-modal').classList.remove('active');
        resumeCountdownVisual();
        saveAppState();
        
        const message = t.adjustmentsSaved
            .replace('{seconds}', newNextTime)
            .replace('{corredor}', newDeparted + 1);
        showMessage(message, 'success');
    });
    
    // Eliminar la referencia a intervalos en el doble clic:
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
            
            // Actualizar directamente (sin tramos)
            appState.nextCorredorTime = seconds;
            
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
                .replace('{corredor}', appState.departedCount + 2);
            showMessage(message, 'success');
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                finishEdit();
            }
        });
    });
    
    // Resto del código (mantener lo que sí funciona)...
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
        appState.isVariableMode = state.isVariableMode || false;
        
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
        
        document.getElementById('departed-count').textContent = appState.departedCount;
        document.getElementById('start-position').value = appState.departedCount + 1;
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
    
    updateNextCorredorDisplay();
    renderDeparturesList();
    
    console.log("Datos cargados para carrera:", appState.currentRace.name);
    console.log("Salidas:", appState.departureTimes.length);
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
    
    const cadenceMode = appState.isVariableMode ? 'variable' : 'single';
    
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex === -1) {
        console.log("Carrera no encontrada en el array");
        return;
    }
    
    let intervalsToSave = [];
    
    if (cadenceMode === 'variable') {
        intervalsToSave = [...appState.intervals];
    } else {
        intervalsToSave = appState.intervals.length > 0 ? [...appState.intervals] : [];
    }
    
    appState.races[raceIndex] = {
        ...appState.currentRace,
        cadenceMode: cadenceMode,
        departures: [...appState.departureTimes],
        intervals: intervalsToSave,
        lastModified: new Date().toISOString()
    };
    
    appState.currentRace = appState.races[raceIndex];
    
    saveRacesToStorage();
    
    console.log("Datos guardados para carrera:", appState.currentRace.name);
    console.log("Modo:", cadenceMode);
    console.log("Salidas con notas:", appState.departureTimes.length);
    console.log("Intervalos guardados:", intervalsToSave.length);
}

function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) {
        localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
    }
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
    
    const newRace = {
        id: Date.now(),
        name: name,
        description: description,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        cadenceMode: 'single',
        departures: [],
        intervals: []
    };
    
    appState.races.push(newRace);
    appState.currentRace = newRace;
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    appState.isVariableMode = false;
    
    switchToSingleMode();
    
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('start-position').value = 1;
    renderDeparturesList();
    
    saveRacesToStorage();
    renderRacesSelect();
    
    document.getElementById('new-race-modal').classList.remove('active');
    document.getElementById('new-race-name').value = '';
    document.getElementById('new-race-description').value = '';
    
    showMessage(t.raceCreated, 'success');
    
    console.log("Nueva carrera creada:", name, "Modo:", 'single');
}

function deleteCurrentRace() {
    if (!appState.currentRace) return;
    
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races.splice(raceIndex, 1);
        appState.currentRace = null;
        
        if (appState.countdownActive) {
            stopCountdown();
            document.getElementById('countdown-screen').classList.remove('active');
            document.querySelectorAll('.hide-on-countdown').forEach(el => {
                el.style.display = '';
            });
        }
        
        appState.departureTimes = [];
        appState.departedCount = 0;
        appState.intervals = [];
        appState.isVariableMode = false;
        
        document.getElementById('start-position').value = 1;
        document.getElementById('departed-count').textContent = 0;
        
        document.getElementById('single-interval-config').style.display = 'block';
        document.getElementById('variable-interval-config').style.display = 'none';
        document.getElementById('same-interval-btn').classList.add('active');
        document.getElementById('variable-interval-btn').classList.remove('active');
        
        saveRacesToStorage();
        renderRacesSelect();
        renderDeparturesList();
        
        document.getElementById('delete-race-modal').classList.remove('active');
        
        showMessage(translations[appState.currentLanguage].raceDeleted, 'success');
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
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    console.log("Configurando event listeners...");
    
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
    
    document.getElementById('exit-complete-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.add('active');
    });

    document.getElementById('restart-modal-close').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
    });

    document.getElementById('restart-cancel-btn').addEventListener('click', () => {
        document.getElementById('restart-confirm-modal').classList.remove('active');
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
        
        appState.departedCount = 0;
        appState.departureTimes = [];
        
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
        document.getElementById('total-time-value').textContent = '00:00:00';
        
        localStorage.removeItem('countdown-app-state');
        
        document.getElementById('restart-confirm-modal').classList.remove('active');
        
        showMessage(t.sessionRestarted, 'success');
        console.log("Sesión reiniciada, TODOS los datos borrados");
    });

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
    
    document.getElementById('delete-race-modal-close').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });
    
    document.getElementById('delete-race-cancel-btn').addEventListener('click', () => {
        document.getElementById('delete-race-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-modal-close').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('clear-departures-cancel-btn').addEventListener('click', () => {
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    
    document.getElementById('suggestions-modal-close').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-suggestion-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.remove('active');
    });
    
    document.getElementById('new-race-modal-close').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });
    
    document.getElementById('cancel-create-race-btn').addEventListener('click', () => {
        document.getElementById('new-race-modal').classList.remove('active');
    });
    
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
        
        if (appState.isVariableMode) {
            updateFutureIntervals(startFromCorredor, newNextTime);
        } else {
            updateSingleIntervalForFuture(startFromCorredor, newNextTime);
        }
        
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
            console.log("Modo:", appState.currentRace.cadenceMode || 'single');
            console.log("Salidas:", appState.departureTimes.length);
            console.log("Intervalos:", appState.intervals.length);
        } else {
            appState.currentRace = null;
            appState.departureTimes = [];
            appState.departedCount = 0;
            appState.intervals = [];
            appState.isVariableMode = false;
            
            document.getElementById('departed-count').textContent = 0;
            document.getElementById('start-position').value = 1;
            renderDeparturesList();
            
            document.getElementById('single-interval-config').style.display = 'block';
            document.getElementById('variable-interval-config').style.display = 'none';
            document.getElementById('same-interval-btn').classList.add('active');
            document.getElementById('variable-interval-btn').classList.remove('active');
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
    
    document.getElementById('delete-race-confirm-btn').addEventListener('click', () => {
        deleteCurrentRace();
    });

    
    document.getElementById('start-position').addEventListener('change', function() {
        const position = parseInt(this.value) || 1;
        appState.departedCount = Math.max(0, position - 1);
        document.getElementById('departed-count').textContent = appState.departedCount;
        updateCurrentInterval();
        saveAppState();
        console.log("Posición actualizada:", position, "Salidos:", appState.departedCount);
    });
    
    document.getElementById('start-position').addEventListener('blur', function() {
        const position = parseInt(this.value) || 1;
        appState.departedCount = Math.max(0, position - 1);
        document.getElementById('departed-count').textContent = appState.departedCount;
        updateCurrentInterval();
        saveAppState();
    });
    
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
    
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    
    document.getElementById('start-countdown-btn').addEventListener('click', startCountdown);
    
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
            
            if (appState.isVariableMode) {
                updateFutureIntervals(startFromCorredor, seconds);
            } else {
                updateSingleIntervalForFuture(startFromCorredor, seconds);
            }
            
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
    
    document.getElementById('suggestions-btn').addEventListener('click', () => {
        document.getElementById('suggestions-modal').classList.add('active');
        document.getElementById('suggestion-text').focus();
    });
    
    document.getElementById('send-suggestion-btn').addEventListener('click', sendSuggestion);
    
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
    
    document.getElementById('adjust-next-time').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('adjust-departed').addEventListener('click', function(e) {
        e.stopPropagation();
    });
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