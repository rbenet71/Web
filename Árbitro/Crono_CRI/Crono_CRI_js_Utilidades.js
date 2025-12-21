// ============================================
// MÓDULO DE UTILIDADES GENERALES
// ============================================

// ============================================
// FUNCIONES DE MANEJO DE TIEMPO
// ============================================
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

function secondsToTime(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function formatTimeWithSeconds(timeStr) {
    if (!timeStr) return '00:00:00';
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        // Ya tiene segundos, asegurar formato de 2 dígitos
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    } else if (parts.length === 2) {
        // Solo tiene horas y minutos, agregar segundos
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
    }
    return '00:00:00';
}

function calculateStartTime(index) {
    const firstStartTime = document.getElementById('first-start-time').value;
    if (!firstStartTime) return '09:00:00';
    
    // Extraer horas, minutos y segundos del formato HH:MM:SS
    const timeParts = firstStartTime.split(':');
    let hours = 0, minutes = 0, seconds = 0;
    
    if (timeParts.length >= 1) hours = parseInt(timeParts[0]) || 0;
    if (timeParts.length >= 2) minutes = parseInt(timeParts[1]) || 0;
    if (timeParts.length >= 3) seconds = parseInt(timeParts[2]) || 0;
    
    const interval = 60; // 1 minuto entre salidas
    
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds + (index * interval);
    const newHours = Math.floor(totalSeconds / 3600) % 24;
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
}

function isValidTime(timeStr) {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(timeStr);
}

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

// ============================================
// FUNCIONES DE MANEJO DE ARCHIVOS EXCEL
// ============================================
function formatTimeValue(value) {
    if (!value && value !== 0) return '';
    
    // Si es un número (formato Excel)
    if (typeof value === 'number') {
        // Convertir valor decimal de Excel a tiempo
        const totalSeconds = Math.round(value * 86400); // 24 horas * 60 minutos * 60 segundos
        const hours = Math.floor(totalSeconds / 3600) % 24;
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Si ya es un string de tiempo
    if (typeof value === 'string') {
        // Limpiar el string
        let timeStr = value.trim();
        
        // Añadir segundos si faltan
        if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
            timeStr += ':00';
        }
        
        // Verificar formato HH:MM:SS
        if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0]).toString().padStart(2, '0');
            const minutes = parseInt(parts[1]).toString().padStart(2, '0');
            const seconds = parseInt(parts[2]).toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
    }
    
    return '';
}

function getCellValue(row, index) {
    if (index === undefined || index < 0) return null;
    return row[index] !== undefined ? row[index] : null;
}

// ============================================
// FUNCIONES DE SONIDO
// ============================================
function generateBeep(frequency, duration, type = 'sine') {
    try {
        if (!appState.audioContext) {
            appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (appState.audioContext.state === 'suspended') {
            appState.audioContext.resume();
        }
        
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
        
    } catch (error) {
        console.log("Error generando beep:", error);
    }
}

function initAudioOnInteraction() {
    if (!appState.audioContext) {
        appState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (appState.audioContext.state === 'suspended') {
        appState.audioContext.resume().then(() => {
            generateBeep(440, 0.1);
        });
    }
    
    document.removeEventListener('click', initAudioOnInteraction);
    document.removeEventListener('keydown', initAudioOnInteraction);
}

function preloadVoiceAudios() {
    console.log("Precargando audios de voz .ogg...");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const numbers = [10, 5, 4, 3, 2, 1, 0];
    
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
            });
            
            audio.addEventListener('error', (e) => {
                console.error(`❌ ERROR cargando ${audio.src}:`, e.type);
                console.error("  Verifica que exista: audio/" + lang + "_" + num + ".ogg");
                
                if (num === 0) {
                    console.error("  IMPORTANTE: El archivo 0.ogg es para 'SALIDA'/'GO'/'DÉPART'");
                }
                
                loadedCount++;
            });
            
            audio.load();
        });
    });
    
    setTimeout(() => {
        console.log(`\n=== RESUMEN DE CARGA DE AUDIOS ===`);
        console.log(`Cargados: ${loadedCount}/${totalToLoad}`);
    }, 3000);
}

function playVoiceAudio(number) {
    if (appState.audioType !== 'voice') return;
       
    try {
        const lang = appState.currentLanguage;
        
        if (appState.voiceAudioCache[lang] && appState.voiceAudioCache[lang][number]) {
            const audio = appState.voiceAudioCache[lang][number];
            audio.currentTime = 0;
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error reproduciendo audio precargado ${lang}_${number}:`, error);
                    loadAndPlayAudioDirectly(lang, number);
                });
            }
        } else {
            loadAndPlayAudioDirectly(lang, number);
        }
        
    } catch (error) {
        console.error("❌ Error crítico en playVoiceAudio:", error);
        generateBeep(500, 0.3, 'sine');
    }
}

function loadAndPlayAudioDirectly(lang, number) {
    console.log(`📥 Cargando directamente: ${lang}_${number}.ogg`);
    
    const audio = new Audio();
    audio.src = `audio/${lang}_${number}.ogg`;
    
    audio.play().then(() => {
        console.log(`✅ Audio reproducido directamente: ${lang}_${number}.ogg`);
    }).catch(error => {
        console.error(`❌ Error reproduciendo ${lang}_${number}.ogg:`, error);
        
        if (error.name === 'NotAllowedError') {
            console.error("  El usuario no ha interactuado con la página");
            console.error("  Haz clic en la página primero");
        } else if (error.name === 'NotFoundError') {
            console.error("  El archivo no se encuentra");
            console.error("  Verifica la ruta: " + audio.src);
        }
        
        generateBeep(500, 0.3, 'sine');
    });
}

function playSound(type) {
    if (appState.audioType === 'none') return;
    
    try {
        switch(type) {
            case 'warning':
                if (appState.audioType === 'beep') {
                    generateBeep(300, 1.5, 'square');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(10);
                }
                break;
                
            case 'critical':
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(5);
                }
                break;
                
            case 'salida':
                if (appState.audioType === 'beep') {
                    generateBeep(800, 1.5, 'sine');
                } else if (appState.audioType === 'voice') {
                    playVoiceAudio(0);
                }
                break;
                
            case 'beep':
                if (appState.audioType === 'beep') {
                    generateBeep(500, 0.3, 'sine');
                }
                break;
                
            case 'number':
                if (appState.audioType === 'voice' && appState.countdownValue >= 0) {
                    if (appState.countdownValue <= 4 && appState.countdownValue > 0) {
                        playVoiceAudio(appState.countdownValue);
                    }
                }
                break;
        }
    } catch (error) {
        console.log("Error en playSound:", error);
    }
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
        
        setTimeout(() => {
            console.log("2. Cinco segundos...");
            playVoiceAudio(5);
        }, 1500);
        
        setTimeout(() => {
            console.log("3. Cuatro...");
            playVoiceAudio(4);
        }, 3000);
        
        setTimeout(() => {
            console.log("4. Tres...");
            playVoiceAudio(3);
        }, 4500);
        
        setTimeout(() => {
            console.log("5. Dos...");
            playVoiceAudio(2);
        }, 6000);
        
        setTimeout(() => {
            console.log("6. Uno...");
            playVoiceAudio(1);
        }, 7500);
        
        setTimeout(() => {
            console.log("7. ¡SALIDA! (0)...");
            playVoiceAudio(0);
        }, 9000);
        
        showMessage(`Probando voz en ${appState.currentLanguage}`, 'info');
    }
}

function selectAudioType(audioType) {
    appState.audioType = audioType;
    
    document.querySelectorAll('.audio-option').forEach(option => {
        option.classList.remove('active');
    });
    
    document.querySelector(`.audio-option[data-audio-type="${audioType}"]`).classList.add('active');
    
    localStorage.setItem('countdown-audio-type', audioType);
    
    console.log("Tipo de audio seleccionado:", audioType);
}

function loadAudioPreferences() {
    const savedAudioType = localStorage.getItem('countdown-audio-type');
    if (savedAudioType && ['beep', 'voice', 'none'].includes(savedAudioType)) {
        appState.audioType = savedAudioType;
    }
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

// ============================================
// FUNCIONES DE VERIFICACIÓN DE AUDIO
// ============================================
function verifyAudioFiles() {
    console.log("=== VERIFICACIÓN DE ARCHIVOS .ogg ===");
    console.log("CONVENCIÓN: 0.ogg = audio de SALIDA\n");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const requiredNumbers = [10, 5, 4, 3, 2, 1, 0];
    
    languages.forEach(lang => {
        console.log(`\n📁 Idioma: ${lang.toUpperCase()}`);
        
        requiredNumbers.forEach(num => {
            const audio = new Audio();
            const url = `audio/${lang}_${num}.ogg`;
            audio.src = url;
        
            
            audio.addEventListener('error', (e) => {
                if (num === 0) {
                    console.log(`  ❌ ${lang}_${num}.ogg - SALIDA (FALTA!)`);
                } else {
                    console.log(`  ❌ ${lang}_${num}.ogg`);
                }
                console.log(`      Ruta probada: ${url}`);
            });
            
            audio.load();
        });
    });
}

function checkAvailableAudioFiles() {
    console.log("=== VERIFICANDO ARCHIVOS DE AUDIO ===");
    
    const languages = ['es', 'en', 'ca', 'fr'];
    const testNumbers = [10, 5, 1];
    
    languages.forEach(lang => {
        console.log(`\n📁 Idioma: ${lang}`);
        
        testNumbers.forEach(num => {
            const formats = ['.mp3', '.ogg', '.wav'];
            formats.forEach(format => {
                const audio = new Audio();
                const url = `audio/${lang}_${num}${format}`;
                
                audio.addEventListener('canplaythrough', () => {
                    console.log(`  ✅ ${lang}_${num}${format} - DISPONIBLE`);
                });
                
                audio.addEventListener('error', (e) => {
                    console.log(`  ❌ ${lang}_${num}${format} - NO DISPONIBLE (${e.type})`);
                });
                
                audio.src = url;
                audio.load();
            });
        });
        
        const formats = ['.mp3', '.ogg', '.wav'];
        formats.forEach(format => {
            const audio = new Audio();
            const url = `audio/${lang}_salida${format}`;
            
            audio.addEventListener('canplaythrough', () => {
                console.log(`  ✅ ${lang}_salida${format} - DISPONIBLE`);
            });
            
            audio.addEventListener('error', (e) => {
                console.log(`  ❌ ${lang}_salida${format} - NO DISPONIBLE (${e.type})`);
            });
            
            audio.src = url;
            audio.load();
        });
    });
}

function showExpectedFilenames() {
    console.log("=== NOMBRES DE ARCHIVOS ESPERADOS ===");
    console.log("(Para carpeta audio/)\n");
    
    const languages = {
        'es': 'Español',
        'en': 'English', 
        'ca': 'Català',
        'fr': 'Français'
    };
    
    Object.entries(languages).forEach(([code, name]) => {
        console.log(`\n${name} (${code}):`);
        console.log(`  ${code}_10.ogg  → "diez" / "ten" / "deu" / "dix"`);
        console.log(`  ${code}_9.ogg   → "nueve" / "nine" / "nou" / "neuf"`);
        console.log(`  ${code}_8.ogg   → "ocho" / "eight" / "vuit" / "huit"`);
        console.log(`  ${code}_7.ogg   → "siete" / "seven" / "set" / "sept"`);
        console.log(`  ${code}_6.ogg   → "seis" / "six" / "sis" / "six"`);
        console.log(`  ${code}_5.ogg   → "cinco" / "five" / "cinc" / "cinq"`);
        console.log(`  ${code}_4.ogg   → "cuatro" / "four" / "quatre" / "quatre"`);
        console.log(`  ${code}_3.ogg   → "tres" / "three" / "tres" / "trois"`);
        console.log(`  ${code}_2.ogg   → "dos" / "two" / "dos" / "deux"`);
        console.log(`  ${code}_1.ogg   → "uno" / "one" / "un" / "un"`);
        console.log(`  ${code}_0.ogg   → "¡SALIDA!" / "GO!" / "SORTIDA!" / "DÉPART!"`);
    });
    
    console.log("\n=== TOTAL DE ARCHIVOS NECESARIOS ===");
    console.log("4 idiomas × 11 números = 44 archivos .ogg");
}

function fallbackVoiceAudio(number, lang) {
    console.log(`Usando fallback para: ${lang}_${number}`);
    
    const audio = new Audio();
    const formats = ['.mp3', '.ogg', '.wav'];
    
    for (const format of formats) {
        audio.src = `audio/${lang}_${number}${format}`;
        
        audio.addEventListener('error', () => {
            console.log(`Formato ${format} no funciona para ${lang}_${number}`);
        });
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`Formato ${format} funciona para ${lang}_${number}`);
            audio.play().catch(e => {
                console.warn("Error reproduciendo fallback:", e);
                generateBeep(500, 0.3, 'sine');
            });
            return;
        });
        
        audio.load();
    }
}

// ============================================
// FUNCIONES DE EXPORTACIÓN EXCEL
// ============================================
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
    
    // Formatear encabezados
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

// ============================================
// FUNCIONES DE MANTENIMIENTO DE PANTALLA
// ============================================
function keepScreenAwake() {
    if (!appState.countdownActive) return;
    
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
            .then(wakeLock => {
                console.log('Wake Lock activado');
            })
            .catch(err => {
                console.log('Wake Lock no disponible:', err);
            });
    }
    
    const video = document.getElementById('keep-alive-video');
    if (video) {
        video.loop = true;
        video.play().catch(e => console.log('Video keep-alive falló:', e));
    }
    
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
}

// ============================================
// FUNCIONES DE LIMPIEZA DE DATOS
// ============================================
function cleanupOldData() {
    console.log("Limpiando datos antiguos...");
    
    // Eliminar claves duplicadas
    const oldKeys = ['selectedMode', 'mode', 'appMode'];
    oldKeys.forEach(key => {
        if (localStorage.getItem(key)) {
            console.log(`Eliminando clave antigua: ${key}`);
            localStorage.removeItem(key);
        }
    });
    
    // Unificar en 'app-mode' si hay datos en otras claves
    const possibleModes = {
        'selectedMode': localStorage.getItem('selectedMode'),
        'mode': localStorage.getItem('mode'),
        'appMode': localStorage.getItem('appMode')
    };
    
    // Encontrar el primer modo válido
    for (const [key, value] of Object.entries(possibleModes)) {
        if (value && (value === 'salida' || value === 'llegadas')) {
            console.log(`Migrando modo de ${key}=${value} a app-mode`);
            localStorage.setItem('app-mode', value);
            localStorage.removeItem(key);
            break;
        }
    }
    
    console.log("Limpieza de datos completada");
}

// ============================================
// FUNCIONES DE GUARDADO TEMPORAL
// ============================================
function saveLastUpdate() {
    localStorage.setItem('countdown-last-update', Date.now().toString());
}

// ============================================
// FUNCIÓN PARA GENERAR PDF DEL ORDEN DE SALIDA (MEJORADA)
// ============================================
function generateStartOrderPDF() {
    const t = translations[appState.currentLanguage];
    
    // Verificar si hay una carrera seleccionada
    if (!appState.currentRace) {
        showMessage(t.noRaceSelected || 'Selecciona una carrera primero', 'warning');
        return;
    }
    
    // Verificar si hay datos de orden de salida
    if (!startOrderData || startOrderData.length === 0) {
        showMessage(t.noStartOrderData || 'No hay datos de orden de salida para exportar', 'warning');
        return;
    }
    
    // Verificar que jsPDF esté disponible
    if (typeof jspdf === 'undefined') {
        console.error("jsPDF no está disponible");
        showMessage(t.pdfLibraryMissing || 'La librería PDF no está cargada', 'error');
        return;
    }
    
    // Mostrar mensaje de progreso
    showMessage(t.creatingPDF || 'Generando PDF...', 'info');
    
    try {
        // Crear documento PDF
        const { jsPDF } = jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Obtener datos de la carrera
        const race = appState.currentRace;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        
        // Calcular hora final del último corredor
        const startTime = race.firstStartTime || '09:00:00';
        const startTimeSeconds = timeToSeconds(startTime);
        let lastRiderTime = 0;
        
        if (startOrderData.length > 0) {
            startOrderData.forEach(rider => {
                if (rider.cronoSegundos > lastRiderTime) {
                    lastRiderTime = rider.cronoSegundos;
                }
            });
        }
        
        const endTimeSeconds = startTimeSeconds + lastRiderTime;
        const endTime = secondsToTime(endTimeSeconds);
        
        // Calcular número total de páginas ANTES de dibujar
        const rowsPerPage = 35;
        const totalPages = Math.ceil(startOrderData.length / rowsPerPage);
        
        // Configurar fuente y colores
        const primaryColor = [41, 128, 185];
        const textColor = [44, 62, 80];
        const lightGray = [248, 249, 250];
        
        let yPos = margin;
        
        // ============================
        // CABECERA COMPACTA (CON TRADUCCIONES)
        // ============================
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(race.name.toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        // Usar texto traducido
        const orderText = t.pdfOrderOfStart || 'ORDEN DE SALIDA';
        doc.text(orderText, pageWidth / 2, yPos + 5, { align: 'center' });
        
        yPos += 10;
        
        // ============================
        // INFORMACIÓN BÁSICA
        // ============================
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Línea 1: Organizador y Población
        let line1 = '';
        if (race.organizer) line1 += race.organizer;
        if (race.location) line1 += (line1 ? ' - ' : '') + race.location;
        if (line1) {
            doc.text(line1, pageWidth / 2, yPos, { align: 'center' });
            yPos += 4;
        }
        
        // Línea 2: Fecha
        if (race.date) {
            const formattedDate = formatDateShort(race.date);
            doc.text(formattedDate, pageWidth / 2, yPos, { align: 'center' });
            yPos += 4;
        }
        
        // Línea divisoria
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
        
        // ============================
        // DATOS TÉCNICOS (CON TRADUCCIONES)
        // ============================
        doc.setFontSize(8);
        
        // Modalidad, Categoría y Total (traducido)
        let techInfo = '';
        if (race.modality) techInfo += race.modality;
        if (race.category) techInfo += (techInfo ? ' - ' : '') + race.category;
        if (techInfo) techInfo += ` | `;
        techInfo += `${t.riders || 'Corredores'}: ${startOrderData.length}`;
        
        // Horas de inicio y fin (traducido)
        const startText = t.start || 'Inicio';
        const finalText = t.final || 'Final';
        const timesInfo = `${startText}: ${startTime} | ${finalText}: ${endTime}`;
        
        doc.text(techInfo, margin, yPos);
        doc.text(timesInfo, pageWidth - margin, yPos, { align: 'right' });
        
        yPos += 6;
        
        // ============================
        // PREPARAR DATOS PARA LA TABLA (CON TRADUCCIONES)
        // ============================
        const tableData = [];
        // Usar textos traducidos para encabezados
        const tableHeaders = [
            t.position || 'POS',
            t.number || 'DORSAL',
            t.name || 'NOMBRE',
            t.surname || 'APELLIDOS',
            t.startTime || 'HORA SALIDA',
            t.crono || 'CRONO'
        ];
        
        startOrderData.forEach((rider, index) => {
            const riderStartSeconds = startTimeSeconds + (rider.cronoSegundos || 0);
            const riderStartTime = secondsToTime(riderStartSeconds);
            const cronoDisplay = secondsToMMSS(rider.cronoSegundos || 0);
            
            tableData.push([
                (index + 1).toString(),
                rider.dorsal ? rider.dorsal.toString() : '--',
                rider.nombre ? rider.nombre.trim() : '--',
                rider.apellidos ? rider.apellidos.trim() : '--',
                riderStartTime,
                cronoDisplay
            ]);
        });
        
        // Anchos de columna para centrar la tabla
        const colWidths = [12, 18, 38, 48, 25, 18];
        const totalTableWidth = colWidths.reduce((a, b) => a + b, 0);
        const tableStartX = (pageWidth - totalTableWidth) / 2;
        
        // Función para dibujar encabezados de tabla
        function drawTableHeaders(yPosition) {
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            
            let xPos = tableStartX;
            tableHeaders.forEach((header, i) => {
                const cellWidth = colWidths[i];
                
                // Dibujar fondo de celda
                doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.rect(xPos, yPosition, cellWidth, 5.5, 'F');
                
                // Dibujar texto centrado
                const centerX = xPos + (cellWidth / 2);
                doc.text(header, centerX, yPosition + 3.5, { align: 'center' });
                
                xPos += cellWidth;
            });
        }
        
        // Función para dibujar el pie de página (CON TRADUCCIONES)
        function drawFooter(pageNum) {
            const footerY = pageHeight - 8;
            
            // Fecha y hora actual (formato local)
            const now = new Date();
            const generatedTime = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const generatedDate = now.toLocaleDateString('es-ES');
            
            // Usar texto traducido si existe
            const generatedText = t.generated || 'Generado';
            
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120, 120, 120);
            
            // Hora y fecha (izquierda) - con texto traducido
            doc.text(`${generatedText}: ${generatedTime} - ${generatedDate}`, margin, footerY);
            
            // Número de página (derecha) - texto traducido
            const pageText = t.page || 'Página';
            const ofText = t.of || 'de';
            const pageString = `${pageText} ${pageNum} ${ofText} ${totalPages}`;
            doc.text(pageString, pageWidth - margin, footerY, { align: 'right' });
        }
        
        // Dibujar pie de página en la primera página
        drawFooter(1);
        
        // Dibujar encabezados de tabla en la primera página
        drawTableHeaders(yPos);
        const initialTableY = yPos;
        yPos += 5.5;
        
        // Verificar si AutoTable está disponible
        if (typeof doc.autoTable === 'function') {
            // Variable para controlar si ya dibujamos encabezados manualmente
            let headersDrawnOnFirstPage = false;
            
            // Configurar AutoTable
            const tableOptions = {
                startY: yPos,
                head: [tableHeaders],
                body: tableData,
                margin: { 
                    left: tableStartX, 
                    right: pageWidth - tableStartX - totalTableWidth 
                },
                tableWidth: totalTableWidth,
                theme: 'grid',
                // NO mostrar encabezados automáticamente (los dibujamos manualmente)
                showHead: 'never',
                headStyles: {
                    fillColor: primaryColor,
                    textColor: 255,
                    fontStyle: 'bold',
                    fontSize: 8,
                    cellPadding: 2,
                    halign: 'center',
                    valign: 'middle',
                    lineWidth: 0.1
                },
                bodyStyles: {
                    fontSize: 7.5,
                    cellPadding: 1.5,
                    textColor: textColor,
                    lineColor: [200, 200, 200],
                    valign: 'middle',
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { 
                        cellWidth: colWidths[0],
                        halign: 'center',
                        minCellWidth: colWidths[0]
                    },
                    1: { 
                        cellWidth: colWidths[1],
                        halign: 'center',
                        minCellWidth: colWidths[1]
                    },
                    2: { 
                        cellWidth: colWidths[2],
                        halign: 'left',
                        minCellWidth: colWidths[2]
                    },
                    3: { 
                        cellWidth: colWidths[3],
                        halign: 'left',
                        minCellWidth: colWidths[3]
                    },
                    4: { 
                        cellWidth: colWidths[4],
                        halign: 'center',
                        minCellWidth: colWidths[4]
                    },
                    5: { 
                        cellWidth: colWidths[5],
                        halign: 'center',
                        minCellWidth: colWidths[5]
                    }
                },
                styles: {
                    overflow: 'linebreak',
                    cellPadding: 1.5,
                    lineWidth: 0.1,
                    lineColor: [200, 200, 200],
                    font: 'helvetica',
                    fontStyle: 'normal'
                },
                // Configuración de páginas
                rowPageBreak: 'auto',
                // Margen para el pie de página
                margin: { 
                    top: yPos, 
                    bottom: 12, 
                    left: tableStartX, 
                    right: pageWidth - tableStartX - totalTableWidth 
                },
                
                // Callback ANTES de dibujar cada página
                willDrawPage: function(data) {
                    // Dibujar encabezados manualmente en TODAS las páginas
                    if (!headersDrawnOnFirstPage) {
                        // Primera página - usar posición inicial
                        drawTableHeaders(initialTableY);
                        headersDrawnOnFirstPage = true;
                    } else {
                        // Páginas siguientes - dibujar encabezados arriba
                        const headerY = margin;
                        drawTableHeaders(headerY);
                    }
                },
                
                // Callback DESPUÉS de dibujar cada página
                didDrawPage: function(data) {
                    // Dibujar pie de página
                    drawFooter(data.pageNumber);
                },
                
                willDrawCell: function(data) {
                    // Resaltar cada 5 filas
                    if (data.row.index > 0 && data.row.index % 5 === 0) {
                        data.cell.styles.fillColor = lightGray;
                    }
                    
                    // Resaltar primera fila en primera página
                    if (data.row.index === 0 && data.pageNumber === 1) {
                        data.cell.styles.fontStyle = 'bold';
                        data.cell.styles.fillColor = [240, 248, 255];
                    }
                    
                    // Asegurar que el dorsal quede en una línea
                    if (data.column.index === 1 && data.cell.text) {
                        if (data.cell.text.length > 6) {
                            data.cell.text = data.cell.text.substring(0, 6);
                        }
                    }
                    
                    // Truncar texto largo en nombre/apellidos
                    if ((data.column.index === 2 || data.column.index === 3) && data.cell.text) {
                        if (data.cell.text.length > 20) {
                            data.cell.text = data.cell.text.substring(0, 20) + '...';
                        }
                    }
                }
            };
            
            // Crear la tabla
            doc.autoTable(tableOptions);
            
        } else {
            // Fallback: tabla manual sin AutoTable
            console.log("AutoTable no disponible, usando método manual");
            
            // Función para dibujar una página de la tabla
            function drawTablePage(startIndex, pageNum) {
                // Si no es la primera página, añadir nueva página y dibujar encabezados
                if (pageNum > 1) {
                    doc.addPage();
                    yPos = margin;
                    
                    // Dibujar encabezados al principio de la página
                    drawTableHeaders(yPos);
                    yPos += 5.5;
                    
                    // Dibujar pie de página
                    drawFooter(pageNum);
                }
                
                // Dibujar filas
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(7.5);
                doc.setTextColor(textColor[0], textColor[1], textColor[2]);
                
                const rowsOnThisPage = Math.min(rowsPerPage, tableData.length - startIndex);
                
                for (let i = 0; i < rowsOnThisPage; i++) {
                    const rowIndex = startIndex + i;
                    const row = tableData[rowIndex];
                    
                    // Verificar si necesitamos nueva página
                    if (yPos > pageHeight - 20) {
                        // Dibujar página siguiente
                        drawTablePage(rowIndex, pageNum + 1);
                        return;
                    }
                    
                    // Resaltar cada 5 filas
                    if (rowIndex > 0 && rowIndex % 5 === 0) {
                        doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
                        doc.rect(tableStartX, yPos - 3.5, totalTableWidth, 5.5, 'F');
                    }
                    
                    // Dibujar celdas
                    let xPos = tableStartX;
                    row.forEach((cell, colIndex) => {
                        const cellWidth = colWidths[colIndex];
                        const align = (colIndex === 0 || colIndex === 1 || colIndex === 4 || colIndex === 5) ? 'center' : 'left';
                        
                        // Truncar texto si es necesario
                        let displayText = cell;
                        if (colIndex === 1 && cell.length > 6) {
                            displayText = cell.substring(0, 6);
                        } else if ((colIndex === 2 || colIndex === 3) && cell.length > 20) {
                            displayText = cell.substring(0, 20) + '...';
                        }
                        
                        const textX = align === 'center' ? xPos + (cellWidth / 2) : xPos + 1;
                        
                        doc.text(displayText, textX, yPos + 3.5, { align: align });
                        xPos += cellWidth;
                    });
                    
                    // Línea divisoria
                    doc.setDrawColor(220, 220, 220);
                    doc.line(tableStartX, yPos + 5.5, tableStartX + totalTableWidth, yPos + 5.5);
                    
                    yPos += 5.5;
                }
                
                // Si es la última página de esta llamada, dibujar pie de página
                if (startIndex + rowsOnThisPage >= tableData.length) {
                    drawFooter(pageNum);
                }
            }
            
            // Empezar a dibujar la tabla
            drawTablePage(0, 1);
        }
        
        // ============================
        // GUARDAR EL PDF
        // ============================
        const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const safeRaceName = race.name
            .replace(/[^a-z0-9ñÑáéíóúÁÉÍÓÚ\s]/gi, '_')
            .replace(/\s+/g, '_')
            .substring(0, 30);
        const filename = `Orden_Salida_${safeRaceName}_${dateStr}.pdf`;
        
        doc.save(filename);
        
        showMessage(`✅ ${t.pdfGenerated || 'PDF generado'}: ${filename}`, 'success');
        
        console.log("PDF generado exitosamente:", {
            archivo: filename,
            carrera: race.name,
            corredores: startOrderData.length,
            paginas: totalPages,
            idioma: appState.currentLanguage
        });
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showMessage(`❌ ${t.pdfError || 'Error'}: ${error.message}`, 'error');
    }
}

// Función auxiliar para formatear fecha corta
function formatDateShort(dateString) {
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        const formatted = date.toLocaleDateString('es-ES', options);
        return formatted.replace(/^(\w)/, match => match.toUpperCase());
    } catch (e) {
        return dateString.split('-').reverse().join('/');
    }
}
// ============================================
// FUNCIÓN PARA CARGAR JSPDF DINÁMICAMENTE
// ============================================
function loadJSPDFLibrary() {
    return new Promise((resolve, reject) => {
        // Verificar si ya está cargado
        if (typeof window.jspdf !== 'undefined') {
            resolve();
            return;
        }
        
        console.log("Cargando librería jsPDF dinámicamente...");
        
        // Crear script para jsPDF
        const jspdfScript = document.createElement('script');
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        jspdfScript.integrity = 'sha512-qZvrmS2ekKPF2mSznTQsxqPgnpkI4DNTlrdUmTzrDgektczlKNRRhy5X5AAOnx5S09ydFYWWNSfcEqDTTHgtNA==';
        jspdfScript.crossOrigin = 'anonymous';
        
        // Crear script para AutoTable
        const autotableScript = document.createElement('script');
        autotableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
        autotableScript.integrity = 'sha512-XdquZ5dW5lK1/7ZEQe7l5qTq5q7Yk7HkQpGcgPhPcFZrGqZaxBvW0k+1+uXeSqNvKJb8sRlKzGX7ciAJK2p7XA==';
        autotableScript.crossOrigin = 'anonymous';
        
        // Cargar jsPDF primero
        jspdfScript.onload = () => {
            console.log("jsPDF cargado correctamente");
            
            // Cargar AutoTable después
            autotableScript.onload = () => {
                console.log("AutoTable cargado correctamente");
                resolve();
            };
            
            autotableScript.onerror = (error) => {
                console.error("Error cargando AutoTable:", error);
                reject(new Error("No se pudo cargar AutoTable"));
            };
            
            document.head.appendChild(autotableScript);
        };
        
        jspdfScript.onerror = (error) => {
            console.error("Error cargando jsPDF:", error);
            reject(new Error("No se pudo cargar jsPDF"));
        };
        
        document.head.appendChild(jspdfScript);
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Función para formatear fecha de manera legible
function formatDateForDisplay(dateString) {
    try {
        const date = new Date(dateString);
        
        // Formato largo en español
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatted = date.toLocaleDateString('es-ES', options);
        
        // Capitalizar primera letra
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        
    } catch (e) {
        console.warn("Error formateando fecha:", e);
        return dateString || 'Fecha no especificada';
    }
}

// Función para convertir segundos a formato MM:SS
function secondsToMMSS(seconds) {
    if (!seconds && seconds !== 0) return '00:00';
    
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Función para convertir tiempo a segundos
function timeToSeconds(timeStr) {
    if (!timeStr) return 0;
    
    // Asegurar formato HH:MM:SS
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        formattedTime = '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        // Formato HH:MM -> agregar :00
        parts.push('00');
    }
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

// Función para convertir segundos a tiempo HH:MM:SS
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// CONFIGURAR BOTÓN DE PDF EN LA INTERFAZ
// ============================================
function setupPDFExportButton() {
    console.log("Configurando botón de exportar PDF...");
    
    // Buscar el contenedor de exportación
    const exportContainer = document.querySelector('.start-order-actions');
    if (!exportContainer) {
        console.error("No se encontró el contenedor de acciones de orden de salida");
        return;
    }
    
    // Verificar si el botón ya existe
    if (document.getElementById('export-pdf-btn')) {
        console.log("El botón de PDF ya existe");
        return;
    }
    
    // Crear botón de PDF
    const pdfButton = document.createElement('button');
    pdfButton.id = 'export-pdf-btn';
    pdfButton.className = 'btn btn-pdf';
    pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i> Generar PDF';
    pdfButton.title = 'Generar PDF del orden de salida con todos los datos de la carrera';
    
    // Añadir estilos específicos
    pdfButton.style.backgroundColor = '#e74c3c';
    pdfButton.style.color = 'white';
    pdfButton.style.border = 'none';
    pdfButton.style.marginLeft = '8px';
    pdfButton.style.padding = '8px 15px';
    pdfButton.style.borderRadius = '4px';
    pdfButton.style.cursor = 'pointer';
    pdfButton.style.fontWeight = 'bold';
    pdfButton.style.transition = 'all 0.3s';
    
    // Efecto hover
    pdfButton.onmouseover = function() {
        this.style.backgroundColor = '#c0392b';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    };
    
    pdfButton.onmouseout = function() {
        this.style.backgroundColor = '#e74c3c';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };
    
    // Añadir event listener - USAR LA FUNCIÓN SIMPLE POR AHORA
    pdfButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Añadir efecto de clic
        this.style.backgroundColor = '#a93226';
        setTimeout(() => {
            this.style.backgroundColor = '#e74c3c';
        }, 150);
        
        // Llamar a la función SIMPLE de generación de PDF
        generateSimpleStartOrderPDF();
    });
    
    // Insertar después del botón de Excel
    const excelButton = document.getElementById('export-excel-btn');
    if (excelButton && excelButton.parentNode) {
        excelButton.parentNode.insertBefore(pdfButton, excelButton.nextSibling);
    } else {
        // Si no hay botón de Excel, añadir al final
        exportContainer.appendChild(pdfButton);
    }
    
    console.log("Botón de exportar PDF configurado exitosamente");
}

// ============================================
// INICIALIZAR MÓDULO PDF MEJORADO
// ============================================
function initPDFModule() {
    console.log("Inicializando módulo PDF mejorado...");
    
    // Configurar botón de PDF
    setTimeout(() => {
        setupPDFExportButton();
    }, 1000);
    
    // Añadir estilos CSS para el botón
    const style = document.createElement('style');
    style.id = 'pdf-button-styles';
    style.textContent = `
        .btn-pdf {
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .btn-pdf:hover {
            background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .btn-pdf:active {
            transform: translateY(0);
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .btn-pdf i {
            margin-right: 5px;
        }
    `;
    
    document.head.appendChild(style);
    
    // Verificar dependencias
    setTimeout(() => {
        if (typeof window.jspdf === 'undefined') {
            console.warn("jsPDF no está cargado. El botón de PDF funcionará pero intentará cargar la librería cuando sea necesario.");
        }
    }, 2000);
    
    console.log("✅ Módulo PDF inicializado correctamente");
}

// ============================================
// FUNCIÓN SIMPLIFICADA DE GENERACIÓN DE PDF (VERSIÓN ROBUSTA)
// ============================================
function generateSimpleStartOrderPDF() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.noRaceSelected, 'warning');
        return;
    }
    
    if (!startOrderData || startOrderData.length === 0) {
        showMessage(t.noStartOrderData, 'warning');
        return;
    }
    
    console.log("Generando PDF del orden de salida...");
    
    // Mostrar mensaje de progreso
    showMessage(t.creatingPDF || 'Generando PDF...', 'info');
    
    try {
        // Verificar si jsPDF está disponible
        if (typeof jspdf === 'undefined') {
            console.log("jsPDF no está cargado, cargando dinámicamente...");
            
            // Cargar jsPDF dinámicamente
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = function() {
                console.log("jsPDF cargado, generando PDF...");
                setTimeout(generateSimpleStartOrderPDF, 500);
            };
            script.onerror = function() {
                showMessage('Error cargando la librería PDF', 'error');
            };
            document.head.appendChild(script);
            return;
        }
        
        // Usar jsPDF directamente (sin window.jspdf)
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        const race = appState.currentRace;
        const startTime = race.firstStartTime || '09:00:00';
        
        let yPos = 20;
        
        // Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('ORDEN DE SALIDA', 105, yPos, { align: 'center' });
        yPos += 10;
        
        // Línea
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        yPos += 15;
        
        // Datos de la carrera
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Carrera:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(race.name || 'Sin nombre', 50, yPos);
        yPos += 8;
        
        if (race.date) {
            doc.setFont('helvetica', 'bold');
            doc.text('Fecha:', 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(race.date, 50, yPos);
            yPos += 8;
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('Hora inicio:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(startTime, 50, yPos);
        yPos += 8;
        
        doc.setFont('helvetica', 'bold');
        doc.text('Total corredores:', 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(startOrderData.length.toString(), 60, yPos);
        yPos += 15;
        
        // Encabezados de la tabla
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Pos', 20, yPos);
        doc.text('Crono', 35, yPos);
        doc.text('Hora', 55, yPos);
        doc.text('Dorsal', 75, yPos);
        doc.text('Nombre', 95, yPos);
        doc.text('Apellidos', 140, yPos);
        yPos += 7;
        
        // Línea de encabezado
        doc.setLineWidth(0.3);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        // Datos de los corredores
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        startOrderData.forEach((rider, index) => {
            // Verificar si necesitamos nueva página
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
                
                // Encabezados en nueva página
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text('Pos', 20, yPos);
                doc.text('Crono', 35, yPos);
                doc.text('Hora', 55, yPos);
                doc.text('Dorsal', 75, yPos);
                doc.text('Nombre', 95, yPos);
                doc.text('Apellidos', 140, yPos);
                yPos += 10;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
            }
            
            // Calcular hora de salida para este corredor
            const startTimeSeconds = timeToSeconds(startTime);
            const riderStartSeconds = startTimeSeconds + (rider.cronoSegundos || 0);
            const riderStartTime = secondsToTime(riderStartSeconds);
            
            // Mostrar datos
            doc.text((index + 1).toString(), 20, yPos);
            doc.text(secondsToMMSS(rider.cronoSegundos || 0), 35, yPos);
            doc.text(riderStartTime, 55, yPos);
            doc.text(rider.dorsal ? rider.dorsal.toString() : '-', 75, yPos);
            doc.text(rider.nombre || '-', 95, yPos);
            doc.text(rider.apellidos || '-', 140, yPos);
            
            yPos += 7;
        });
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, 285, { align: 'center' });
        doc.text('Crono CRI - Sistema de Cronometraje', 105, 290, { align: 'center' });
        
        // Guardar el PDF
        const filename = `Orden_Salida_${race.name.replace(/[^a-z0-9ñÑáéíóúÁÉÍÓÚ\s]/gi, '_').substring(0, 30)}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Mostrar mensaje de éxito
        showMessage(`✅ PDF generado exitosamente: ${filename}`, 'success');
        
        console.log("PDF generado exitosamente:", filename);
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        showMessage(`❌ Error al generar el PDF: ${error.message}`, 'error');
    }
}

// ============================================
// CONFIGURAR BOTÓN DE PDF (VERSIÓN SIMPLIFICADA)
// ============================================
function setupPDFExportButton() {
    console.log("Configurando botón de exportar PDF...");
    
    // Buscar el contenedor de exportación
    const exportContainer = document.querySelector('.start-order-actions');
    if (!exportContainer) {
        console.error("No se encontró el contenedor de acciones de orden de salida");
        return;
    }
    
    // Verificar si el botón ya existe
    if (document.getElementById('export-pdf-btn')) {
        console.log("El botón de PDF ya existe, reconfigurando...");
        // Actualizar el event listener existente
        const existingBtn = document.getElementById('export-pdf-btn');
        existingBtn.onclick = handlePDFExport;
        return;
    }
    
    // Crear botón de PDF
    const pdfButton = document.createElement('button');
    pdfButton.id = 'export-pdf-btn';
    pdfButton.className = 'btn btn-pdf';
    pdfButton.innerHTML = '<i class="fas fa-file-pdf"></i> Generar PDF';
    pdfButton.title = 'Generar PDF del orden de salida con todos los datos de la carrera';
    
    // Añadir estilos específicos
    pdfButton.style.backgroundColor = '#e74c3c';
    pdfButton.style.color = 'white';
    pdfButton.style.border = 'none';
    pdfButton.style.marginLeft = '8px';
    pdfButton.style.padding = '8px 15px';
    pdfButton.style.borderRadius = '4px';
    pdfButton.style.cursor = 'pointer';
    pdfButton.style.fontWeight = 'bold';
    pdfButton.style.transition = 'all 0.3s';
    pdfButton.style.display = 'flex';
    pdfButton.style.alignItems = 'center';
    pdfButton.style.justifyContent = 'center';
    pdfButton.style.gap = '5px';
    
    // Efecto hover
    pdfButton.onmouseover = function() {
        this.style.backgroundColor = '#c0392b';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    };
    
    pdfButton.onmouseout = function() {
        this.style.backgroundColor = '#e74c3c';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    };
    
    // Añadir event listener
    pdfButton.addEventListener('click', handlePDFExport);
    
    // Insertar después del botón de Excel
    const excelButton = document.getElementById('export-excel-btn');
    if (excelButton && excelButton.parentNode) {
        excelButton.parentNode.insertBefore(pdfButton, excelButton.nextSibling);
    } else {
        // Si no hay botón de Excel, añadir al final
        exportContainer.appendChild(pdfButton);
    }
    
    console.log("✅ Botón de exportar PDF configurado exitosamente");
}

function handlePDFExport(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Añadir efecto de clic
    const button = e.target.closest('button') || e.target;
    button.style.backgroundColor = '#a93226';
    setTimeout(() => {
        button.style.backgroundColor = '#e74c3c';
    }, 150);
    
    // Llamar a la función de generación de PDF
    generateSimpleStartOrderPDF();
}

// ============================================
// INICIALIZAR MÓDULO PDF MEJORADO
// ============================================
function initPDFModule() {
    console.log("Inicializando módulo PDF...");
    
    // Configurar botón de PDF después de un pequeño retraso
    setTimeout(() => {
        setupPDFExportButton();
    }, 1000);
    
    // Añadir estilos CSS para el botón
    if (!document.getElementById('pdf-button-styles')) {
        const style = document.createElement('style');
        style.id = 'pdf-button-styles';
        style.textContent = `
            .btn-pdf {
                background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.3s;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            
            .btn-pdf:hover {
                background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .btn-pdf:active {
                transform: translateY(0);
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            
            .btn-pdf i {
                margin-right: 5px;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log("✅ Módulo PDF inicializado correctamente");
}