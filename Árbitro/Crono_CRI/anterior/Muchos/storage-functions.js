function loadLanguagePreference() {
    const savedLang = localStorage.getItem('countdown-language');
    if (savedLang && translations[savedLang]) appState.currentLanguage = savedLang;
}

function loadRacesFromStorage() {
    const savedRaces = localStorage.getItem('countdown-races');
    if (savedRaces) appState.races = JSON.parse(savedRaces);
    const savedCurrentRace = localStorage.getItem('countdown-current-race');
    if (savedCurrentRace) appState.currentRace = JSON.parse(savedCurrentRace);
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
        } else appState.departureTimes = state.departureTimes || [];
        appState.countdownActive = false;
        appState.countdownValue = 0;
        appState.countdownPaused = false;
        document.getElementById('start-position').value = appState.departedCount + 1;
        console.log("Estado cargado, salidos:", appState.departedCount);
    }
}

function saveAppState() {
    if (appState.countdownActive) {
        localStorage.setItem('countdown-app-state', JSON.stringify({
            countdownActive: appState.countdownActive,
            countdownValue: appState.countdownValue,
            departedCount: appState.departedCount,
            nextCorredorTime: appState.nextCorredorTime,
            intervals: appState.intervals,
            currentIntervalIndex: appState.currentIntervalIndex,
            departureTimes: appState.departureTimes,
            raceStartTime: appState.raceStartTime,
            accumulatedTime: appState.accumulatedTime,
            countdownPaused: appState.countdownPaused,
            isVariableMode: appState.isVariableMode
        }));
    } else localStorage.removeItem('countdown-app-state');
}

function saveRaceData() {
    if (!appState.currentRace) { console.log("No hay carrera actual para guardar datos"); return; }
    const cadenceMode = appState.isVariableMode ? 'variable' : 'single';
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex === -1) { console.log("Carrera no encontrada en el array"); return; }
    let intervalsToSave = [];
    if (cadenceMode === 'variable') intervalsToSave = [...appState.intervals];
    else intervalsToSave = appState.intervals.length > 0 ? [...appState.intervals] : [];
    appState.races[raceIndex] = {
        ...appState.currentRace,
        cadenceMode: cadenceMode,
        departures: [...appState.departureTimes],
        intervals: intervalsToSave,
        lastModified: new Date().toISOString()
    };
    appState.currentRace = appState.races[raceIndex];
    saveRacesToStorage();
    console.log("Datos guardados para carrera:", appState.currentRace.name, "Modo:", cadenceMode);
}

function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
}