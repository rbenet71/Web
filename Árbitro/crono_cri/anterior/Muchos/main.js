let sortState = { column: 'time', direction: 'desc' };
let editingIntervalIndex = -1;
const intervalConfig = { singleMode: { minutes: 1, seconds: 0, saved: false }, variableMode: { intervals: [], saved: false } };

function initApp() {
    console.log("Inicializando aplicación...");
    loadLanguagePreference();
    loadRacesFromStorage();
    loadAppState();
    loadIntervalConfig();
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
    preloadVoiceAudios();
    setupIntervalsEvents();
    setupEditIntervalModalEvents();
    setupEventListeners();
    setupAudioEventListeners();
    setTimeout(() => setupSpecificIntervalListeners(), 500);
    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);
    console.log("Aplicación inicializada. Idioma:", appState.currentLanguage, "Audio:", appState.audioType);
}

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
    document.getElementById('restart-confirm-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (appState.countdownActive) {
            stopCountdown();
            document.getElementById('countdown-screen').classList.remove('active');
            document.querySelectorAll('.hide-on-countdown').forEach(el => el.style.display = '');
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
        console.log("Sesión reiniciada");
    });
    document.getElementById('start-countdown-btn').addEventListener('click', startCountdown);
    document.getElementById('race-select').addEventListener('change', function() {
        const index = parseInt(this.value);
        if (index >= 0 && index < appState.races.length) {
            if (appState.currentRace) saveRaceData();
            appState.currentRace = appState.races[index];
            loadRaceData();
            saveRacesToStorage();
            console.log("Cambiada a carrera:", appState.currentRace.name);
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
        if (!appState.currentRace) { showMessage(t.selectRaceFirst, 'error'); return; }
        document.getElementById('delete-race-modal').classList.add('active');
    });
    document.getElementById('delete-race-confirm-btn').addEventListener('click', deleteCurrentRace);
    document.getElementById('same-interval-btn').addEventListener('click', function() {
        switchToSingleMode();
        if (appState.currentRace) saveRaceData();
    });
    document.getElementById('variable-interval-btn').addEventListener('click', function() {
        switchToVariableMode();
        if (appState.currentRace) saveRaceData();
    });
    document.getElementById('add-interval-btn').addEventListener('click', addVariableInterval);
    document.getElementById('clear-departures-btn').addEventListener('click', () => {
        const t = translations[appState.currentLanguage];
        if (appState.departureTimes.length === 0) { showMessage(t.listAlreadyEmpty, 'info'); return; }
        document.getElementById('clear-departures-modal').classList.add('active');
    });
    document.getElementById('clear-departures-confirm-btn').addEventListener('click', () => {
        clearRaceDepartures();
        document.getElementById('clear-departures-modal').classList.remove('active');
    });
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('config-toggle').addEventListener('click', function(e) {
        e.stopPropagation();
        const t = translations[appState.currentLanguage];
        if (appState.countdownActive && appState.countdownValue <= 12) { showMessage(t.waitCountdownEnd, 'warning'); return; }
        if (appState.countdownActive && !appState.configModalOpen) {
            pauseCountdownVisual();
            document.getElementById('config-during-countdown-modal').classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', initApp);
window.addEventListener('beforeunload', () => { if (appState.countdownActive) saveLastUpdate(); });
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