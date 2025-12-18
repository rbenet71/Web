function loadIntervalConfig() {
    const savedConfig = localStorage.getItem('countdown-interval-config');
    if (savedConfig) {
        try {
            const config = JSON.parse(savedConfig);
            if (config.singleMode) intervalConfig.singleMode = config.singleMode;
            if (config.variableMode) intervalConfig.variableMode = config.variableMode;
        } catch (e) { console.error("Error cargando configuración:", e); }
    }
}

function saveIntervalConfig() {
    localStorage.setItem('countdown-interval-config', JSON.stringify(intervalConfig));
}

function switchToSingleMode() {
    if (document.getElementById('variable-interval-config').style.display !== 'none') {
        if (appState.currentRace) {
            appState.currentRace.intervals = [...appState.intervals];
            appState.currentRace.cadenceMode = 'variable';
            saveRaceData();
        }
        intervalConfig.variableMode = { intervals: [...appState.intervals], saved: true };
        saveIntervalConfig();
    }
    document.getElementById('interval-minutes').value = intervalConfig.singleMode.minutes;
    document.getElementById('interval-seconds').value = intervalConfig.singleMode.seconds;
    document.getElementById('single-interval-config').style.display = 'block';
    document.getElementById('variable-interval-config').style.display = 'none';
    document.getElementById('same-interval-btn').classList.add('active');
    document.getElementById('variable-interval-btn').classList.remove('active');
    const totalSeconds = intervalConfig.singleMode.minutes * 60 + intervalConfig.singleMode.seconds;
    appState.isVariableMode = false;
    if (appState.currentRace) {
        appState.currentRace.cadenceMode = 'single';
        if (appState.intervals.length > 0) appState.currentRace.intervals = [...appState.intervals];
        else appState.currentRace.intervals = [];
        saveRaceData();
    }
    appState.nextCorredorTime = totalSeconds;
    updateNextCorredorDisplay();
    console.log("Modo single activado. Intervalos:", appState.intervals.length);
}

function switchToVariableMode() {
    const currentMinutes = parseInt(document.getElementById('interval-minutes').value) || 0;
    const currentSeconds = parseInt(document.getElementById('interval-seconds').value) || 0;
    intervalConfig.singleMode = { minutes: currentMinutes, seconds: currentSeconds, saved: true };
    saveIntervalConfig();
    document.getElementById('single-interval-config').style.display = 'none';
    document.getElementById('variable-interval-config').style.display = 'block';
    document.getElementById('same-interval-btn').classList.remove('active');
    document.getElementById('variable-interval-btn').classList.add('active');
    appState.isVariableMode = true;
    if (appState.currentRace && appState.currentRace.intervals && appState.currentRace.intervals.length > 0) {
        appState.intervals = [...appState.currentRace.intervals];
        renderIntervalsList();
    } else if (intervalConfig.variableMode.saved && intervalConfig.variableMode.intervals.length > 0) {
        appState.intervals = [...intervalConfig.variableMode.intervals];
        renderIntervalsList();
        if (appState.currentRace) {
            appState.currentRace.cadenceMode = 'variable';
            appState.currentRace.intervals = [...appState.intervals];
            saveRaceData();
        }
    } else {
        appState.intervals = [];
        renderIntervalsList();
    }
    console.log("Modo variable activado. Intervalos:", appState.intervals.length);
}

function loadAudioPreferences() {
    const savedAudioType = localStorage.getItem('countdown-audio-type');
    if (savedAudioType && ['beep', 'voice', 'none'].includes(savedAudioType)) appState.audioType = savedAudioType;
}

function selectAudioType(audioType) {
    appState.audioType = audioType;
    document.querySelectorAll('.audio-option').forEach(option => option.classList.remove('active'));
    document.querySelector(`.audio-option[data-audio-type="${audioType}"]`).classList.add('active');
    localStorage.setItem('countdown-audio-type', audioType);
    console.log("Tipo de audio seleccionado:", audioType);
}

function setupAudioEventListeners() {
    document.querySelectorAll('.audio-option').forEach(option => {
        option.addEventListener('click', function() {
            const audioType = this.getAttribute('data-audio-type');
            selectAudioType(audioType);
        });
    });
    document.getElementById('test-audio-btn').addEventListener('click', testCurrentAudio);
}

function testCurrentAudio() {
    const t = translations[appState.currentLanguage];
    console.clear();
    console.log("=== PRUEBA COMPLETA DE AUDIO ===");
    console.log("Idioma:", appState.currentLanguage);
    console.log("Tipo de audio:", appState.audioType);
    console.log("Convención: 0.ogg = SALIDA/GO/DÉPART/SORTIDA\n");
    if (appState.audioType === 'none') {
        showMessage("Modo sin sonido activado", 'info');
        return;
    }
    if (appState.audioType === 'beep') {
        console.log("Probando beeps...");
        generateBeep(300, 0.5, 'square');
        setTimeout(() => generateBeep(500, 0.3, 'sine'), 600);
        setTimeout(() => generateBeep(800, 1.5, 'sine'), 1200);
        showMessage("Probando sonido beep", 'info');
    } else if (appState.audioType === 'voice') {
        console.log("Probando secuencia de carrera completa:");
        console.log("1. Advertencia (10 segundos)...");
        playVoiceAudio(10);
        setTimeout(() => { console.log("2. Cinco segundos..."); playVoiceAudio(5); }, 1500);
        setTimeout(() => { console.log("3. Cuatro..."); playVoiceAudio(4); }, 3000);
        setTimeout(() => { console.log("4. Tres..."); playVoiceAudio(3); }, 4500);
        setTimeout(() => { console.log("5. Dos..."); playVoiceAudio(2); }, 6000);
        setTimeout(() => { console.log("6. Uno..."); playVoiceAudio(1); }, 7500);
        setTimeout(() => { console.log("7. ¡SALIDA! (0)..."); playVoiceAudio(0); }, 9000);
        showMessage(`Probando voz en ${appState.currentLanguage}`, 'info');
    }
}