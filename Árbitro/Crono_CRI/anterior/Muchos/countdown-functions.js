function startCountdown() {
    console.log("Iniciando cuenta atrás...");
    const t = translations[appState.currentLanguage];
    if (!appState.currentRace) { showMessage(t.selectRaceFirst, 'error'); return; }
    const isVariableMode = document.getElementById('variable-interval-config').style.display !== 'none';
    appState.isVariableMode = isVariableMode;
    if (isVariableMode && appState.intervals.length === 0) { showMessage(t.configureAtLeastOneInterval, 'error'); return; }
    updateCadenceTime();
    if (appState.intervals.length === 0) { showMessage(t.noIntervalsConfigured, 'error'); return; }
    document.querySelectorAll('.hide-on-countdown').forEach(el => el.style.display = 'none');
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
    updateCurrentInterval();
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
    if (appState.countdownInterval) clearInterval(appState.countdownInterval);
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    keepScreenAwake();
    if (!isVariableMode && appState.currentRace) {
        appState.currentRace.intervals = [...appState.intervals];
        saveRaceData();
    }
    saveAppState();
    showMessage(t.countdownStarted, 'success');
    console.log("Cuenta atrás iniciada correctamente.");
}

function updateCountdown() {
    if (!appState.countdownActive || appState.countdownPaused) return;
    const currentTime = Date.now();
    const elapsedFromRaceStart = Math.floor((currentTime - appState.raceStartTime) / 1000);
    const expectedElapsedTime = appState.accumulatedTime + (appState.nextCorredorTime - appState.countdownValue);
    if (Math.abs(elapsedFromRaceStart - expectedElapsedTime) > 1) {
        appState.countdownValue = Math.max(0, appState.nextCorredorTime - (elapsedFromRaceStart - appState.accumulatedTime));
    } else appState.countdownValue--;
    if (appState.countdownValue <= 0) { handleCountdownZero(); return; }
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
        if (appState.audioType === 'beep') playSound('beep');
        else if (appState.audioType === 'voice') playSound('number');
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
    if (appState.countdownValue % 10 === 0) saveAppState();
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

function stopCountdown() {
    console.log("Deteniendo cuenta atrás...");
    if (appState.countdownInterval) { clearInterval(appState.countdownInterval); appState.countdownInterval = null; }
    if (appState.salidaTimeout) { clearTimeout(appState.salidaTimeout); appState.salidaTimeout = null; }
    appState.countdownActive = false;
    appState.countdownPaused = false;
    appState.raceStartTime = null;
    appState.accumulatedTime = 0;
    appState.aggressiveMode = false;
    appState.configModalOpen = false;
    document.body.classList.remove('countdown-normal', 'countdown-warning', 'countdown-critical', 'countdown-salida');
    document.getElementById('countdown-screen').classList.remove('aggressive-numbers');
    document.body.style.backgroundColor = '';
    document.body.style.background = '';
    document.body.style.animation = '';
    document.getElementById('total-time-value').textContent = '00:00:00';
    localStorage.removeItem('countdown-app-state');
    console.log("Cuenta atrás detenida");
}