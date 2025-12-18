function generateBeep(frequency, duration, type = 'sine') {
    try {
        if (!appState.audioContext) {
            appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (appState.audioContext.state === 'suspended') appState.audioContext.resume();
        const oscillator = appState.audioContext.createOscillator();
        const gainNode = appState.audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(appState.audioContext.destination);
        oscillator.frequency.setValueAtTime(frequency, appState.audioContext.currentTime);
        oscillator.type = type;
        gainNode.gain.setValueAtTime(0.3, appState.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, appState.audioContext.currentTime + duration);
        oscillator.start(appState.audioContext.currentTime);
        oscillator.stop(appState.audioContext.currentTime + duration);
    } catch (error) { console.log("Error generando beep:", error); }
}

function preloadVoiceAudios() {
    console.log("Precargando audios de voz .ogg...");
    const languages = ['es', 'en', 'ca', 'fr'];
    const numbers = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    let loadedCount = 0;
    const totalToLoad = languages.length * numbers.length;
    
    languages.forEach(lang => {
        appState.voiceAudioCache[lang] = {};
        numbers.forEach(num => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.src = `audio/${lang}_${num}.ogg`;
            audio.addEventListener('canplaythrough', () => {
                appState.voiceAudioCache[lang][num] = audio;
                loadedCount++;
                console.log(`✅ Audio cargado: ${lang}_${num}.ogg (${loadedCount}/${totalToLoad})`);
            });
            audio.addEventListener('error', (e) => {
                console.error(`❌ ERROR cargando ${audio.src}:`, e.type);
                loadedCount++;
            });
            audio.load();
        });
    });
}

function playVoiceAudio(number) {
    if (appState.audioType !== 'voice') return;
    console.log(`🔊 Reproduciendo: ${appState.currentLanguage}_${number}.ogg`);
    try {
        const lang = appState.currentLanguage;
        if (appState.voiceAudioCache[lang] && appState.voiceAudioCache[lang][number]) {
            const audio = appState.voiceAudioCache[lang][number];
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) playPromise.catch(error => {
                console.warn(`Error reproduciendo audio precargado ${lang}_${number}:`, error);
                loadAndPlayAudioDirectly(lang, number);
            });
        } else loadAndPlayAudioDirectly(lang, number);
    } catch (error) {
        console.error("❌ Error crítico en playVoiceAudio:", error);
        generateBeep(500, 0.3, 'sine');
    }
}

function playSound(type) {
    if (appState.audioType === 'none') return;
    try {
        switch(type) {
            case 'warning':
                if (appState.audioType === 'beep') generateBeep(300, 1.5, 'square');
                else if (appState.audioType === 'voice') playVoiceAudio(10);
                break;
            case 'critical':
                if (appState.audioType === 'beep') generateBeep(500, 0.3, 'sine');
                else if (appState.audioType === 'voice') playVoiceAudio(5);
                break;
            case 'salida':
                if (appState.audioType === 'beep') generateBeep(800, 1.5, 'sine');
                else if (appState.audioType === 'voice') playVoiceAudio(0);
                break;
            case 'beep':
                if (appState.audioType === 'beep') generateBeep(500, 0.3, 'sine');
                break;
            case 'number':
                if (appState.audioType === 'voice' && appState.countdownValue >= 0) {
                    if (appState.countdownValue <= 4 && appState.countdownValue > 0) {
                        playVoiceAudio(appState.countdownValue);
                    }
                }
                break;
        }
    } catch (error) { console.log("Error en playSound:", error); }
}