// ============================================
// ARCHIVO: Crono_CRI_js_Utilidades.js
// ============================================
// DESCRIPCIÓN: Módulo central de utilidades para sistema de cronometraje
// RESPONSABILIDADES:
//   1. Manejo de conversiones tiempo ↔ segundos ↔ Excel
//   2. Sistema de audio multilingüe (beep/voz/none)
//   3. Exportación a Excel y PDF con formatos profesionales
//   4. Utilidades generales de mantenimiento y persistencia
//   5. Funciones auxiliares de formato y validación
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - timeToSeconds() / secondsToTime()    - Conversiones tiempo↔segundos
//   - exportToExcel()                      - Exporta datos de salidas
//   - exportStartOrder()                   - Exporta orden con 19 columnas
//   - generateStartOrderPDF()              - Genera PDF profesional
//   - playSound() / playVoiceAudio()       - Sistema de audio
//   - initAudioOnInteraction()             - Inicializa contexto de audio
// 
// SISTEMA DE AUDIO:
//   ✓ Tres modos: beep, voice, none
//   ✓ 4 idiomas: es, en, ca, fr
//   ✓ Precarga inteligente de archivos OGG
//   ✓ Fallback a beep si falla voz
//   ✓ Verificación de archivos disponibles
// 
// EXPORTACIONES:
//   ✓ Excel: 19 columnas con diferencias (+/-)
//   ✓ PDF: Diseño profesional con colores alternados
//   ✓ Validación estricta de formatos de tiempo
// 
// PROTECCIONES IMPLEMENTADAS:
//   ✓ Validación regex para formatos HH:MM:SS
//   ✓ Manejo de errores en reproducción de audio
//   ✓ Limpieza de datos antiguos en localStorage
//   ✓ Precarga de librerías dinámicas (jsPDF)
// 
// ARCHIVOS RELACIONADOS:
//   ← Todos los módulos: Usan funciones de utilidad
//   → Salidas_*.js: Proporciona conversiones tiempo
//   → UI_*.js: Usa funciones de sonido y formato
//   → Excel_*.js: Usa funciones de exportación
// ============================================

// ============================================
// MÓDULO DE UTILIDADES GENERALES
// ============================================




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
    
    // 1. Configurar botones de opción de audio (.audio-option)
    const audioOptions = document.querySelectorAll('.audio-option');
    
    audioOptions.forEach(option => {
        // Remover cualquier listener previo para evitar duplicados
        const newOption = option.cloneNode(true);
        option.parentNode.replaceChild(newOption, option);
        
        newOption.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const audioType = this.getAttribute('data-audio-type');
            console.log(`🎵 Botón de audio clickeado: ${audioType}`);
            
            if (typeof selectAudioType === 'function') {
                selectAudioType(audioType);
            } else {
                console.error("❌ Función selectAudioType no disponible");
                // Fallback manual
                appState.audioType = audioType;
                localStorage.setItem('countdown-audio-type', audioType);
                
                // Actualizar UI
                document.querySelectorAll('.audio-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                
                showMessage(`Audio configurado: ${audioType}`, 'success');
            }
        });
    });
    
    // 2. Configurar botón de prueba de audio (#test-audio-btn)
    const testAudioBtn = document.getElementById('test-audio-btn');
    if (testAudioBtn) {
        
        // Clonar para eliminar listeners previos
        const newTestBtn = testAudioBtn.cloneNode(true);
        testAudioBtn.parentNode.replaceChild(newTestBtn, testAudioBtn);
        
        newTestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("🔊 Probando audio...");
            
            if (typeof testCurrentAudio === 'function') {
                testCurrentAudio();
            } else {
                console.error("❌ Función testCurrentAudio no disponible");
                // Fallback simple
                if (appState.audioType === 'beep') {
                    generateBeep(440, 0.5);
                    showMessage("Beep de prueba", 'info');
                } else if (appState.audioType === 'voice') {
                    showMessage("Modo voz activado (prueba no disponible)", 'info');
                } else {
                    showMessage("Audio desactivado", 'info');
                }
            }
        });
    } else {
        console.warn("⚠️ Botón #test-audio-btn no encontrado en el DOM");
    }
    
    // 3. Configurar selectores de tipo de audio (#audio-type-selector)
    const audioTypeSelect = document.getElementById('audio-type-selector');
    if (audioTypeSelect) {
        console.log("✅ Selector de tipo de audio encontrado");
        
        audioTypeSelect.addEventListener('change', function(e) {
            const audioType = e.target.value;
            console.log(`🎵 Tipo de audio cambiado vía selector: ${audioType}`);
            
            if (typeof selectAudioType === 'function') {
                selectAudioType(audioType);
            } else {
                appState.audioType = audioType;
                localStorage.setItem('countdown-audio-type', audioType);
                showMessage(`Audio configurado: ${audioType}`, 'success');
            }
        });
        
        // Establecer valor actual
        audioTypeSelect.value = appState.audioType;
    }
    
    // 4. Configurar botones de idioma de audio si existen
    const audioLanguageButtons = document.querySelectorAll('[data-audio-lang]');
    audioLanguageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-audio-lang');
            if (appState.currentLanguage !== lang) {
                appState.currentLanguage = lang;
                localStorage.setItem('cri_language', lang);
                showMessage(`Idioma cambiado a: ${lang}`, 'success');
            }
        });
    });
    
    // 5. Actualizar UI de botones de audio
    setTimeout(() => {
        if (typeof updateAudioButtonsUI === 'function') {
            updateAudioButtonsUI();
        } else {
            // Actualización manual
            document.querySelectorAll('.audio-option').forEach(option => {
                const audioType = option.getAttribute('data-audio-type');
                if (audioType === appState.audioType) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        }
    }, 100);
    
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

// ============================================
// FUNCIÓN PARA EXPORTAR ORDEN DE SALIDA A EXCEL
// ============================================

function exportStartOrder() {
    const t = translations[appState.currentLanguage];
    
    if (!startOrderData || startOrderData.length === 0) {
        showMessage(t.noOrderToExport || 'No hay datos para exportar', 'warning');
        return;
    }
    
    // Mostrar mensaje de progreso
    showMessage(t.exportingOrder || 'Exportando orden de salida...', 'info');
    
    // Crear encabezados CORREGIDOS (22 columnas - INCLUYENDO NUEVOS CAMPOS)
    const headers = [
        'Orden', 
        'Dorsal', 
        'Crono Salida', 
        'Hora Salida', 
        'Diferencia',
        'Nombre', 
        'Apellidos', 
        'Categoría',    // NUEVO - posición 7
        'Equipo',       // NUEVO - posición 8
        'Licencia',     // NUEVO - posición 9
        'Chip',         // MOVIDO - posición 10 (antes estaba en 8)
        'Hora Salida Real', 
        'Crono Salida Real', 
        'Hora Salida Prevista', 
        'Crono Salida Prevista', 
        'Hora Salida Importado', 
        'Crono Salida Importado', 
        'Crono Segundos', 
        'Hora Segundos',
        'Crono Salida Real Segundos', 
        'Hora Salida Real Segundos',
        'Diferencia Segundos'
    ];
    
    // Crear los datos
    const data = [headers];
    
    // Añadir todas las filas de datos
    startOrderData.forEach(rider => {
        // Calcular valores que puedan faltar
        const cronoSegundos = rider.cronoSegundos || timeToSeconds(rider.cronoSalida) || 0;
        const horaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
        const cronoRealSegundos = rider.cronoSalidaRealSegundos || timeToSeconds(rider.cronoSalidaReal) || 0;
        const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
        const cronoPrevistoSegundos = timeToSeconds(rider.cronoSalidaPrevista) || cronoSegundos;
        const horaPrevistaSegundos = timeToSeconds(rider.horaSalidaPrevista) || horaSegundos;
        
        // Calcular diferencia - PRIMERO intentar usar la diferencia del rider
        let diferenciaFormato = '';
        let diferenciaSegundos = 0;
        
        if (rider.diferencia && rider.diferencia !== '' && rider.diferencia !== '00:00:00') {
            // Usar la diferencia existente del rider
            diferenciaFormato = rider.diferencia;
            
            // Extraer segundos de la diferencia (formato: "00:01:00 (+)" o "00:01:00 (-)")
            const diffMatch = rider.diferencia.match(/(\d{2}:\d{2}:\d{2})/);
            if (diffMatch) {
                diferenciaSegundos = timeToSeconds(diffMatch[1]);
                // Aplicar signo
                if (rider.diferencia.includes('(-)') || rider.diferencia.includes('-')) {
                    diferenciaSegundos = -Math.abs(diferenciaSegundos);
                } else if (rider.diferencia.includes('(+)') || rider.diferencia.includes('+')) {
                    diferenciaSegundos = Math.abs(diferenciaSegundos);
                }
            }
        } 
        // Si no hay diferencia pero hay datos reales y previstos, calcularla
        else if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
            diferenciaSegundos = horaRealSegundos - horaPrevistaSegundos;
            if (diferenciaSegundos !== 0) {
                diferenciaFormato = secondsToTime(Math.abs(diferenciaSegundos)) + 
                    (diferenciaSegundos > 0 ? ' (+)' : ' (-)');
            } else {
                diferenciaFormato = '00:00:00';
            }
        }
        // Si hay diferenciaSegundos en el rider, usarla
        else if (rider.diferenciaSegundos && rider.diferenciaSegundos !== 0) {
            diferenciaSegundos = rider.diferenciaSegundos;
            diferenciaFormato = secondsToTime(Math.abs(diferenciaSegundos)) + 
                (diferenciaSegundos > 0 ? ' (+)' : ' (-)');
        }
        // Si no hay datos para calcular diferencia
        else {
            diferenciaFormato = '';
            diferenciaSegundos = 0;
        }
        
        const row = [
            rider.order || '',
            rider.dorsal || '',
            formatTimeValue(rider.cronoSalida) || '00:00:00',
            formatTimeValue(rider.horaSalida) || '09:00:00',
            diferenciaFormato,
            rider.nombre || '',
            rider.apellidos || '',
            rider.categoria || '',     // NUEVO - posición 7
            rider.equipo || '',        // NUEVO - posición 8
            rider.licencia || '',      // NUEVO - posición 9
            rider.chip || '',          // MOVIDO - posición 10
            formatTimeValue(rider.horaSalidaReal) || '',
            formatTimeValue(rider.cronoSalidaReal) || '',
            formatTimeValue(rider.horaSalidaPrevista) || formatTimeValue(rider.horaSalida) || '09:00:00',
            formatTimeValue(rider.cronoSalidaPrevista) || formatTimeValue(rider.cronoSalida) || '00:00:00',
            formatTimeValue(rider.horaSalidaImportado) || '',
            formatTimeValue(rider.cronoSalidaImportado) || '',
            cronoSegundos,
            horaSegundos,
            cronoRealSegundos,
            horaRealSegundos,
            diferenciaSegundos
        ];
        
        data.push(row);
    });
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(data, { cellStyles: true });
    const wb = XLSX.utils.book_new();
    
    // Nombre de la hoja
    const sheetName = appState.currentRace ? 
        `Orden_Salida_${appState.currentRace.name.substring(0, 25)}` : 
        'Orden_Salida';
    
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    
    // Ajustar anchos de columna CORREGIDOS (22 columnas)
    const colWidths = [
        {wch: 8},   // 1. Orden
        {wch: 8},   // 2. Dorsal
        {wch: 12},  // 3. Crono Salida
        {wch: 12},  // 4. Hora Salida
        {wch: 15},  // 5. Diferencia
        {wch: 15},  // 6. Nombre
        {wch: 20},  // 7. Apellidos
        {wch: 12},  // 8. Categoría - NUEVO
        {wch: 15},  // 9. Equipo - NUEVO
        {wch: 12},  // 10. Licencia - NUEVO
        {wch: 12},  // 11. Chip - MOVIDO
        {wch: 12},  // 12. Hora Salida Real
        {wch: 12},  // 13. Crono Salida Real
        {wch: 12},  // 14. Hora Salida Prevista
        {wch: 12},  // 15. Crono Salida Prevista
        {wch: 12},  // 16. Hora Salida Importado
        {wch: 12},  // 17. Crono Salida Importado
        {wch: 12},  // 18. Crono Segundos
        {wch: 12},  // 19. Hora Segundos
        {wch: 12},  // 20. Crono Salida Real Segundos
        {wch: 12},  // 21. Hora Salida Real Segundos
        {wch: 12}   // 22. Diferencia Segundos
    ];
    ws['!cols'] = colWidths;
    
    // Auto-filtro
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: startOrderData.length, c: headers.length - 1 }
        })
    };
    
    // Formato de número para columnas de segundos
    const numberColumns = [17, 18, 19, 20, 21]; // Índices de columnas de segundos (0-based): 17-21
    
    // Aplicar formato a las filas
    for (let i = 1; i <= startOrderData.length; i++) {
        numberColumns.forEach(colIndex => {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: colIndex });
            if (ws[cellRef]) {
                ws[cellRef].z = '0';
            }
        });
        
        // Formato tiempo para columnas de tiempo
        const timeColumns = [2, 3, 11, 12, 13, 14, 15, 16]; // Índices de columnas de tiempo
        timeColumns.forEach(colIndex => {
            const cellRef = XLSX.utils.encode_cell({ r: i, c: colIndex });
            if (ws[cellRef] && ws[cellRef].v && ws[cellRef].v !== '') {
                // Si es un número (valor Excel), mantener formato tiempo
                if (typeof ws[cellRef].v === 'number') {
                    ws[cellRef].z = 'hh:mm:ss';
                }
            }
        });
        
        // Formato especial para columna de Diferencia (columna 4, índice 4)
        const diferenciaCellRef = XLSX.utils.encode_cell({ r: i, c: 4 });
        if (ws[diferenciaCellRef] && ws[diferenciaCellRef].v) {
            // Aplicar formato de texto para mantener los signos (+)/(-)
            ws[diferenciaCellRef].t = 's'; // Tipo string
        }
    }
    
    // Generar nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
    
    let filename;
    if (appState.currentRace) {
        const safeRaceName = appState.currentRace.name
            .replace(/[^a-z0-9]/gi, '_')
            .substring(0, 30);
        filename = `orden_salida_${safeRaceName}_${dateStr}_${timeStr}.xlsx`;
    } else {
        filename = `orden_salida_${dateStr}_${timeStr}.xlsx`;
    }
    
    // Guardar archivo
    XLSX.writeFile(wb, filename);
    
    // Mostrar mensaje de éxito con estadísticas
    const statsMessage = `${t.orderExported || 'Orden de salida exportado'} - ${startOrderData.length} corredores, ${headers.length} columnas`;
    showMessage(statsMessage, 'success');
    
    console.log("Orden de salida exportado:", filename);
    console.log("Columnas exportadas:", headers.length);
    console.log("Estructura de columnas:", headers);
    
    // Log detallado del primer corredor para verificar diferencia
    if (startOrderData.length > 0) {
        const firstRider = startOrderData[0];
        console.log("Primer corredor exportado - Diferencia:", {
            order: firstRider.order,
            dorsal: firstRider.dorsal,
            diferencia: firstRider.diferencia,
            diferenciaSegundos: firstRider.diferenciaSegundos,
            categoria: firstRider.categoria,  // NUEVO
            equipo: firstRider.equipo,        // NUEVO
            licencia: firstRider.licencia,    // NUEVO
            horaSalida: firstRider.horaSalida,
            horaSalidaReal: firstRider.horaSalidaReal,
            exportadoComo: data[1][4]
        });
    }
}


function excelTimeToSeconds(excelTime) {
    // Excel almacena el tiempo como fracción de un día
    // 1 = 24 horas, 0.0416666666666667 = 1 hora, 0.000694444444444444 = 1 minuto
    if (typeof excelTime === 'number' && excelTime < 1) {
        return Math.round(excelTime * 86400); // 86400 segundos en un día
    }
    return 0;
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
    
    if (!startOrderData || startOrderData.length === 0) {
        showMessage(t.noDataToExport, 'error');
        return;
    }

    try {
        // Obtener datos de la carrera
        const race = appState.currentRace || {};
        const raceName = race.name || t.raceWithoutName;
        const location = race.location || t.unspecifiedLocation;
        const eventType = race.eventType || t.unspecifiedEventType;
        const category = race.category || t.unspecifiedCategory;
        
        // Obtener fechas
        const eventDate = race.date ? new Date(race.date) : new Date();
        const dateStr = eventDate.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Obtener tiempos de salida
        const firstRider = startOrderData[0];
        const lastRider = startOrderData[startOrderData.length - 1];
        const firstStartTime = firstRider ? firstRider.horaSalida : "00:00:00";
        const lastStartTime = lastRider ? lastRider.horaSalida : "00:00:00";
        const totalRiders = startOrderData.length;
        
        // FUNCIÓN PARA FORMATEAR CRONO
        function formatCronoForPDF(rider) {
            if (rider.order === 1) {
                return "00:00:00";
            }
            
            if (rider.timeDisplay && rider.timeDisplay !== "--:--:--") {
                const timeParts = rider.timeDisplay.split(':');
                if (timeParts.length === 2) {
                    return `00:${rider.timeDisplay}`;
                }
                return rider.timeDisplay;
            }
            
            const seconds = rider.cronoSegundos || 0;
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        // FUNCIÓN MEJORADA PARA TEXTO LARGO (usa todo el espacio disponible)
        function handleLongText(text, columnWidth, padding = 4) {
            if (!text) return "";
            
            // Ancho disponible para texto (columna - padding)
            const availableWidth = columnWidth - padding;
            
            // En jsPDF, aproximadamente 2.5mm por carácter en fuente size 9
            const charsPerMM = 0.8; // 1mm ≈ 0.4 caracteres (2.5mm por char)
            const maxChars = Math.floor(availableWidth * charsPerMM);
            
            // Si el texto cabe completamente, devolverlo
            if (text.length <= maxChars) {
                return text;
            }
            
            // Si no cabe, truncar inteligentemente
            // Buscar último espacio antes del límite
            let truncateAt = maxChars - 3; // Dejar espacio para "..."
            
            // Buscar un espacio para no cortar palabras
            if (truncateAt > 20) { // Solo si hay suficiente texto
                let lastSpace = text.lastIndexOf(' ', truncateAt);
                if (lastSpace > maxChars * 0.7) { // Si el espacio está en una posición razonable
                    truncateAt = lastSpace;
                }
            }
            
            // Asegurar mínimo de 10 caracteres
            truncateAt = Math.max(10, truncateAt);
            
            return text.substring(0, truncateAt) + "...";
        }
        
        // CREAR PDF
        let { jsPDF } = window.jspdf;
        let doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15; // Reducido margen para más espacio
        const contentWidth = pageWidth - 2 * margin;
        
        // ANCHOS OPTIMIZADOS PARA 9 COLUMNAS
        const posWidth = 8;          // POS
        const dorsalWidth = 10;      // DORSAL
        const nombreWidth = 22;      // NOMBRE
        const apellidosWidth = 22;   // APELLIDOS
        const categoriaWidth = 15;   // CATEGORÍA
        const equipoWidth = 20;      // EQUIPO
        const licenciaWidth = 12;    // LICENCIA
        const horaSalidaWidth = 18;  // HORA SALIDA
        const cronoWidth = 18;       // CRONO
        
        // Ancho total de la tabla
        const totalTableWidth = posWidth + dorsalWidth + nombreWidth + apellidosWidth + 
                               categoriaWidth + equipoWidth + licenciaWidth + 
                               horaSalidaWidth + cronoWidth;
        
        // Calcular margen izquierdo para centrar tabla
        const tableMarginLeft = margin + (contentWidth - totalTableWidth) / 2;
        
        // Array de anchos de columna
        const columnWidths = [
            posWidth, dorsalWidth, nombreWidth, apellidosWidth, 
            categoriaWidth, equipoWidth, licenciaWidth, 
            horaSalidaWidth, cronoWidth
        ];
        
        // CALCULAR FILAS POR PÁGINA
        const headerHeight = 50;
        const footerHeight = 15;
        const rowHeight = 6;
        const availableHeight = pageHeight - headerHeight - footerHeight - 20;
        const maxRowsPerPage = Math.floor(availableHeight / rowHeight);
        const totalPages = Math.ceil(totalRiders / maxRowsPerPage);
        
        let pageNumber = 1;
        let currentY = 15;
        let rowIndex = 0;
        
        // Variables para control de cambio de diferencia
        let lastDifference = null;
        let useGrayBackground = false;
        
        // FUNCIÓN PARA DIBUJAR CABECERA (CON TRADUCCIONES)
        function drawPageHeader() {
            let y = 15;
            
            // 1. NOMBRE DE LA PRUEBA (centrado) - AZUL
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(66, 133, 244);
            doc.text(raceName.toUpperCase(), pageWidth / 2, y, { align: "center" });
            y += 8;
            
            // 2. "ORDEN DE SALIDA" (centrado) - NEGRO (usar traducción)
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            const orderTitle = t.startOrder || "ORDEN DE SALIDA";
            doc.text(orderTitle.toUpperCase(), pageWidth / 2, y, { align: "center" });
            y += 15;
            
            // 3. LÍNEA 1: Lugar (izquierda) y Fecha (derecha)
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const locationText = `${t.location || "Lugar"}: ${location}`;
            const dateText = `${t.date || "Fecha"}: ${dateStr}`;
            doc.text(locationText, margin, y);
            doc.text(dateText, pageWidth - margin, y, { align: "right" });
            y += 6;
            
            // 4. LÍNEA 2: Tipo de prueba (izquierda) y Total Corredores (derecha)
            const tipoCategoria = `${eventType} - ${category}`;
            const totalRidersText = `${t.totalRiders || "Total Corredores"}: ${totalRiders}`;
            doc.text(tipoCategoria, margin, y);
            doc.text(totalRidersText, pageWidth - margin, y, { align: "right" });
            y += 6;
            
            // 5. LÍNEA 3: Salidas (usar traducciones)
            const firstDepartureText = `${t.firstDeparture || "Salida Primer Corredor"}: ${firstStartTime}`;
            const lastDepartureText = `${t.lastDeparture || "Salida Último Corredor"}: ${lastStartTime}`;
            doc.text(firstDepartureText, margin, y);
            doc.text(lastDepartureText, pageWidth - margin, y, { align: "right" });
            y += 10;
            
            return y;
        }
        
        // FUNCIÓN PARA DIBUJAR CABECERA DE TABLA (CON TRADUCCIONES)
        function drawTableHeaders(startY) {
            // Fondo azul para cabecera
            doc.setFillColor(66, 133, 244);
            doc.rect(tableMarginLeft, startY - 3, totalTableWidth, 8, 'F');
            
            // Texto de cabeceras en blanco (usar traducciones)
            doc.setFontSize(9); // Reducido tamaño para que quepan 9 columnas
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            
            // Usar traducciones para cabeceras de tabla
            const headers = [
                t.position || "POS",
                t.bibNumber || "DORSAL", 
                t.name || "NOMBRE",
                t.surname || "APELLIDOS",
                t.category || "CAT",
                t.team || "EQUIPO",
                t.license || "LIC",
                t.startTime || "H.SALIDA",
                t.time || "CRONO"
            ];
            
            const aligns = ["center", "center", "left", "left", "center", "left", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            headers.forEach((header, index) => {
                if (aligns[index] === "center") {
                    doc.text(header, xPosition + (columnWidths[index] / 2), startY + 1, { align: "center" });
                } else {
                    doc.text(header, xPosition + 2, startY + 1);
                }
                xPosition += columnWidths[index];
            });
            
            return startY + 8;
        }
        
        // FUNCIÓN PARA OBTENER DIFERENCIA
        function getRiderDifference(rider) {
            return rider.diferencia || rider.cronoSalida || rider.cronoSegundos || 0;
        }
        
        // FUNCIÓN PARA DIBUJAR UNA FILA DE DATOS
        function drawDataRow(rider, startY, rowNumber, currentDifference) {
            // Para las DOS PRIMERAS filas, siempre blanco
            if (rowNumber <= 2) {
                useGrayBackground = false;
            } 
            // A partir del TERCER corredor, verificar cambio
            else if (currentDifference !== lastDifference) {
                useGrayBackground = !useGrayBackground; // Alternar cuando cambia diferencia
            }
            
            // Aplicar fondo gris si corresponde
            if (useGrayBackground) {
                doc.setFillColor(224, 255, 255);
                doc.rect(tableMarginLeft, startY - 2, totalTableWidth, rowHeight, 'F');
            }
            
            // Actualizar última diferencia SOLO si no es la primera fila
            if (rowNumber >= 2) {
                lastDifference = currentDifference;
            }
            
            lastDifference = currentDifference;
            
            doc.setFontSize(8); // Reducido tamaño para que quepan 9 columnas
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            
            const aligns = ["center", "center", "left", "left", "center", "left", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            // 1. POS
            doc.text(rider.order.toString(), xPosition + (columnWidths[0] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[0];
            
            // 2. DORSAL
            doc.text(rider.dorsal.toString(), xPosition + (columnWidths[1] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[1];
            
            // 3. NOMBRE
            const nombre = rider.nombre || "";
            const adjustedNombre = handleLongText(nombre, columnWidths[2]);
            doc.text(adjustedNombre, xPosition + 2, startY + 2);
            xPosition += columnWidths[2];
            
            // 4. APELLIDOS
            const apellidos = rider.apellidos || "";
            const adjustedApellidos = handleLongText(apellidos, columnWidths[3]);
            doc.text(adjustedApellidos, xPosition + 2, startY + 2);
            xPosition += columnWidths[3];
            
            // 5. CATEGORÍA
            const categoria = rider.categoria || "";
            const adjustedCategoria = handleLongText(categoria, columnWidths[4]);
            doc.text(adjustedCategoria, xPosition + (columnWidths[4] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[4];
            
            // 6. EQUIPO
            const equipo = rider.equipo || "";
            const adjustedEquipo = handleLongText(equipo, columnWidths[5]);
            doc.text(adjustedEquipo, xPosition + 2, startY + 2);
            xPosition += columnWidths[5];
            
            // 7. LICENCIA
            const licencia = rider.licencia || "";
            const adjustedLicencia = handleLongText(licencia, columnWidths[6]);
            doc.text(adjustedLicencia, xPosition + (columnWidths[6] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[6];
            
            // 8. HORA SALIDA
            const horaSalida = rider.horaSalida || "00:00:00";
            doc.text(horaSalida, xPosition + (columnWidths[7] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[7];
            
            // 9. CRONO
            const timeForDisplay = formatCronoForPDF(rider);
            doc.text(timeForDisplay, xPosition + (columnWidths[8] / 2), startY + 2, { align: "center" });
            
            // Línea divisoria fina
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.line(tableMarginLeft, startY + 4, tableMarginLeft + totalTableWidth, startY + 4);
            
            return startY + rowHeight;
        }
        
        // FUNCIÓN PARA PIE DE PÁGINA
        function drawPageFooter(pageNum, totalPages) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
            const dateStr = now.toLocaleDateString('es-ES');
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            
            // Fecha y hora
            doc.text(`${timeStr} - ${dateStr}`, margin, pageHeight - 10);
            
            // Número de página (usar traducción si existe)
            const pageText = t.page || "Página";
            doc.text(`${pageText} ${pageNum} ${t.of || "de"} ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
        }
        
        // DIBUJAR PRIMERA PÁGINA
        currentY = drawPageHeader();
        currentY = drawTableHeaders(currentY);
        
        // PROCESAR TODAS LAS FILAS
        startOrderData.forEach((rider, index) => {
            if (rowIndex >= maxRowsPerPage) {
                drawPageFooter(pageNumber, totalPages);
                doc.addPage();
                pageNumber++;
                rowIndex = 0;
                lastDifference = null;
                useGrayBackground = false;
                
                currentY = 15;
                currentY = drawPageHeader();
                currentY = drawTableHeaders(currentY);
            }
            
            const currentDifference = getRiderDifference(rider);
            currentY = drawDataRow(rider, currentY, rowIndex + 1, currentDifference);
            rowIndex++;
        });
        
        drawPageFooter(pageNumber, totalPages);
        
        // Guardar PDF
        const now = new Date();
        const dateFileStr = now.toISOString().split('T')[0];
        const fileName = `orden_salida_${raceName.replace(/\s+/g, '_')}_${dateFileStr}.pdf`;
        
        doc.save(fileName);
        
        showMessage(t.pdfExportedSuccess, 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showMessage(t.pdfExportError || 'Error al generar PDF', 'error');
    }
}

// Función auxiliar para obtener diferencia formateada para PDF
function getRiderDifferenceForPDF(rider) {
    if (rider.diferencia && rider.diferencia !== '' && rider.diferencia !== '00:00:00') {
        // Extraer solo la parte numérica para comparación
        const match = rider.diferencia.match(/(\d{2}:\d{2}:\d{2})/);
        return match ? match[1] : rider.diferencia;
    }
    
    // Calcular diferencia si hay datos reales y previstos
    const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
    const horaPrevistaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
    
    if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
        const diferencia = horaRealSegundos - horaPrevistaSegundos;
        return diferencia !== 0 ? `DIFF:${diferencia}` : 'DIFF:0';
    }
    
    return 'NO_DIFF';
}

// Función para formatear tiempo para PDF (base 60) - Asegúrate de que existe
function formatTimeForPDF(totalSeconds) {
    if (!totalSeconds && totalSeconds !== 0) return '00:00';
    
    const secs = Math.abs(Math.round(totalSeconds));
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0 || seconds > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return '00:00';
    }
}



// Función auxiliar para pie de página
function drawPageFooter() {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('es-ES');
    
    doc.text(`Generated: ${timeStr} - ${dateStr}`, 15, pageHeight - 10);
    doc.text(`Crono CRI`, pageWidth / 2, pageHeight - 10, { align: "center" });
}

// Función auxiliar para obtener diferencia formateada para PDF
function getRiderDifferenceForPDF(rider) {
    if (rider.diferencia && rider.diferencia !== '' && rider.diferencia !== '00:00:00') {
        // Extraer solo la parte numérica para comparación
        const match = rider.diferencia.match(/(\d{2}:\d{2}:\d{2})/);
        return match ? match[1] : rider.diferencia;
    }
    
    // Calcular diferencia si hay datos reales y previstos
    const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
    const horaPrevistaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
    
    if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
        const diferencia = horaRealSegundos - horaPrevistaSegundos;
        return diferencia !== 0 ? `DIFF:${diferencia}` : 'DIFF:0';
    }
    
    return 'NO_DIFF';
}

// Función para formatear tiempo para PDF (base 60)
function formatTimeForPDF(totalSeconds) {
    if (!totalSeconds && totalSeconds !== 0) return '00:00';
    
    const secs = Math.abs(Math.round(totalSeconds));
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0 || seconds > 0) {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        return '00:00';
    }
}

// Función auxiliar para obtener la diferencia formateada
function getRiderDifferenceDisplay(rider) {
    if (rider.diferencia && rider.diferencia !== '' && rider.diferencia !== '00:00:00') {
        return rider.diferencia;
    }
    
    // Calcular diferencia si hay datos reales y previstos
    const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
    const horaPrevistaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
    
    if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
        const diferencia = horaRealSegundos - horaPrevistaSegundos;
        if (diferencia !== 0) {
            const diferenciaAbs = Math.abs(diferencia);
            const signo = diferencia > 0 ? '+' : '-';
            return `${secondsToTime(diferenciaAbs)} ${signo}`;
        }
    }
    
    return '--:--:--';
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
        jspdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.1.1/jspdf.umd.min.js';
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
// Función para convertir segundos a formato MM:SS (CORREGIDA)
function secondsToMMSS(seconds) {
    if (!seconds && seconds !== 0) return '00:00';
    
    // Asegurarnos de que sea un número entero
    const secs = Math.abs(Math.round(seconds));
    
    // Calcular minutos y segundos
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    
    // Formatear como MM:SS
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
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
    
    showMessage(t.creatingPDF || 'Generando PDF...', 'info');
    
    try {
        if (typeof jspdf === 'undefined') {
            console.log("jsPDF no está cargado, cargando dinámicamente...");
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.1.1/jspdf.umd.min.js';
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
        
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        const race = appState.currentRace;
        
        // Variables para controlar cambios en la diferencia
        let lastDiferencia = null;
        let rowColorIndex = 0; // 0 = blanco, 1 = gris claro
        const lightGray = [248, 249, 250]; // Gris claro
        const white = [255, 255, 255]; // Blanco
        
        // Función para dibujar encabezados
        function drawHeaders(y) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Pos', 20, y);
            doc.text('Crono', 35, y);
            doc.text('Hora', 55, y);
            doc.text('Dorsal', 75, y);
            doc.text('Nombre', 95, y);
            doc.text('Apellidos', 140, y);
        }
        
        // Función para dibujar cabecera de carrera
        function drawRaceHeader(y) {
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('ORDEN DE SALIDA', 105, y, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(race.name || 'Sin nombre', 105, y + 10, { align: 'center' });
            
            if (race.date) {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(race.date, 105, y + 16, { align: 'center' });
            }
            
            doc.setFontSize(10);
            doc.text(`Hora inicio: ${race.firstStartTime || '09:00:00'}`, 105, y + 22, { align: 'center' });
            doc.text(`Total corredores: ${startOrderData.length}`, 105, y + 28, { align: 'center' });
            
            doc.setDrawColor(200, 200, 200);
            doc.line(20, y + 32, 190, y + 32);
            
            return y + 35;
        }
        
        let yPos = 20;
        let currentPage = 1;
        let rowsOnThisPage = 0;
        const maxRowsPerPage = 35;
        
        // Dibujar cabecera en la primera página
        yPos = drawRaceHeader(yPos);
        
        // Dibujar encabezados de columnas en la primera página
        drawHeaders(yPos);
        yPos += 7;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        // Procesar todos los corredores
        for (let index = 0; index < startOrderData.length; index++) {
            const rider = startOrderData[index];
            const diferencia = rider.diferencia || '--:--:--';
            
            // Verificar si necesitamos nueva página
            if (rowsOnThisPage >= maxRowsPerPage || yPos > 270) {
                // Nueva página
                doc.addPage();
                currentPage++;
                rowsOnThisPage = 0;
                yPos = 20;
                
                // Dibujar número de página en la cabecera
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.setTextColor(150, 150, 150);
                doc.text(`Página ${currentPage}`, 185, 15, { align: 'right' });
                doc.setTextColor(0, 0, 0);
                
                // Dibujar encabezados de columnas en la nueva página
                drawHeaders(yPos);
                yPos += 7;
                doc.setDrawColor(200, 200, 200);
                doc.line(20, yPos, 190, yPos);
                yPos += 10;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
            }
            
            // Determinar si la diferencia cambió
            if (diferencia !== lastDiferencia) {
                // Alternar color cuando cambia la diferencia
                rowColorIndex = rowColorIndex === 0 ? 1 : 0;
                lastDiferencia = diferencia;
            }
            
            // Asignar color de fondo según rowColorIndex
            const backgroundColor = rowColorIndex === 0 ? white : lightGray;
            
            // Dibujar fondo de fila
            doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
            doc.rect(20, yPos - 5, 170, 7, 'F');
            
            // Dibujar borde de separación cada 5 filas
            if (index > 0 && index % 5 === 0) {
                doc.setDrawColor(150, 150, 150);
                doc.setLineWidth(0.3);
                doc.line(20, yPos - 5, 190, yPos - 5);
                doc.setLineWidth(0.1);
            }
            
            const horaSalida = rider.horaSalida || '00:00:00';
            
            let cronoDisplay;
            
            if (index === 0) {
                cronoDisplay = '00:00';
            } else {
                const cronoSalida = rider.cronoSalida || '00:00:00';
                
                if (cronoSalida && cronoSalida.includes(':')) {
                    const parts = cronoSalida.split(':');
                    if (parts.length === 3) {
                        const horas = parseInt(parts[0]) || 0;
                        const minutos = parseInt(parts[1]) || 0;
                        const segundos = parseInt(parts[2]) || 0;
                        
                        if (horas === 0) {
                            cronoDisplay = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                        } else {
                            cronoDisplay = `${horas}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
                        }
                    } else {
                        cronoDisplay = cronoSalida;
                    }
                } else if (cronoSalida && !isNaN(cronoSalida)) {
                    const segundos = parseInt(cronoSalida) || 0;
                    const minutos = Math.floor(segundos / 60);
                    const segsRestantes = segundos % 60;
                    cronoDisplay = `${minutos.toString().padStart(2, '0')}:${segsRestantes.toString().padStart(2, '0')}`;
                } else {
                    cronoDisplay = cronoSalida || '00:00';
                }
            }
            
            // Mostrar datos
            doc.text((index + 1).toString(), 20, yPos);
            doc.text(cronoDisplay, 35, yPos);
            doc.text(horaSalida, 55, yPos);
            doc.text(rider.dorsal ? rider.dorsal.toString() : '-', 75, yPos);
            
            // Truncar nombres si son muy largos
            let nombre = rider.nombre || '-';
            let apellidos = rider.apellidos || '-';
            
            if (nombre.length > 15) nombre = nombre.substring(0, 15) + '...';
            if (apellidos.length > 20) apellidos = apellidos.substring(0, 20) + '...';
            
            doc.text(nombre, 95, yPos);
            doc.text(apellidos, 140, yPos);
            
            // Línea divisoria entre filas
            doc.setDrawColor(220, 220, 220);
            doc.line(20, yPos + 2, 190, yPos + 2);
            
            yPos += 7;
            rowsOnThisPage++;
            
            console.log(`Corredor ${index + 1}: diferencia=${diferencia}, colorIndex=${rowColorIndex}`);
        }
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, 285, { align: 'center' });
        doc.text('Crono CRI - Sistema de Cronometraje', 105, 290, { align: 'center' });
        
        const filename = `Orden_Salida_${race.name.replace(/[^a-z0-9ñÑáéíóúÁÉÍÓÚ\s]/gi, '_').substring(0, 30)}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        showMessage(`✅ PDF generado exitosamente: ${filename}`, 'success');
        
        console.log("PDF simplificado generado exitosamente:", filename);
        
    } catch (error) {
        console.error('Error generando PDF simplificado:', error);
        showMessage(`❌ Error al generar el PDF: ${error.message}`, 'error');
    }
}

// ============================================
// CONFIGURAR BOTÓN DE PDF (VERSIÓN SIMPLIFICADA)
// ============================================
function setupPDFExportButton() {
    
    // Buscar el botón de exportar PDF que ya existe en el HTML
    const pdfButton = document.getElementById('export-order-pdf-btn');
    
    if (!pdfButton) {
        console.error("No se encontró el botón de exportar PDF en el DOM");
        return;
    }
    
    // Verificar si ya tiene un event listener (para evitar duplicados)
    const newButton = pdfButton.cloneNode(true);
    pdfButton.parentNode.replaceChild(newButton, pdfButton);
    
    // Configurar el evento click
    newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Añadir efecto visual de clic
        this.style.backgroundColor = '#a93226';
        setTimeout(() => {
            this.style.backgroundColor = '#e74c3c';
        }, 150);
        
        // Llamar a la función de generación de PDF
        if (typeof generateStartOrderPDF === 'function') {
            generateStartOrderPDF();
        } else if (typeof generateSimpleStartOrderPDF === 'function') {
            generateSimpleStartOrderPDF();
        } else {
            console.error("No se encontró la función de generación de PDF");
            showMessage('Error: Función de PDF no disponible', 'error');
        }
    });

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
   
    // Control para evitar inicialización múltiple
    if (window.pdfModuleInitialized) {
        console.log("Módulo PDF ya inicializado");
        return;
    }
    
    // Configurar botón de PDF después de un pequeño retraso
    setTimeout(() => {
        setupPDFExportButton();
    }, 500);
    
    window.pdfModuleInitialized = true;
    console.log("✅ Módulo PDF inicializado correctamente");
}

// ============================================
// FUNCIÓN PARA FORMATEAR TIEMPOS CORRECTAMENTE
// ============================================

function formatTimeForDisplay(totalSeconds, format = 'HH:MM:SS') {
    if (!totalSeconds && totalSeconds !== 0) return '00:00:00';
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    switch(format) {
        case 'HH:MM:SS':
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        case 'MM:SS':
            if (hours > 0) {
                // Si hay horas, mostrarlas
                return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        case 'TIME_COLUMN': // Para la columna TIME del PDF
            if (totalSeconds < 3600) {
                // Menos de 1 hora: mostrar MM:SS
                return `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                // Más de 1 hora: mostrar H:MM:SS
                return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        
        default:
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Función auxiliar para convertir tiempos del PDF
function parsePDFTime(timeStr) {
    // Si viene del PDF en formato "01:00" (minutos:segundos)
    if (timeStr && timeStr.includes(':') && timeStr.length === 5) {
        const parts = timeStr.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return (minutes * 60) + seconds;
    }
    
    // Si viene en formato "00:01:00" (horas:minutos:segundos)
    if (timeStr && timeStr.includes(':') && timeStr.length === 8) {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    return 0;
}

// Función auxiliar para obtener el índice original
function getOriginalIndex(order, dorsal) {
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}







// En Crono_CRI_js_Salidas.js, agrega estas funciones:

let savedScrollPosition = 0;

function saveScrollPosition() {
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    if (tableWrapper) {
        savedScrollPosition = tableWrapper.scrollTop;
    }
}

function restoreScrollPosition() {
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    if (tableWrapper) {
        tableWrapper.scrollTop = savedScrollPosition;
    }
}

function setupTableScrollListeners() {
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    if (tableWrapper) {
        // Guardar posición al hacer scroll
        tableWrapper.addEventListener('scroll', function() {
            savedScrollPosition = this.scrollTop;
        });
        
        // Ajustar tamaño del wrapper dinámicamente
        adjustTableWrapperHeight();
        
        // Reajustar en redimensionamiento
        window.addEventListener('resize', adjustTableWrapperHeight);
    }
}

function adjustTableWrapperHeight() {
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    if (!tableWrapper) return;
    
    const viewportHeight = window.innerHeight;
    const containerTop = tableWrapper.getBoundingClientRect().top;
    const availableHeight = viewportHeight - containerTop - 30; // 30px de margen
    
    // Establecer altura máxima dinámica
    const maxHeight = Math.min(availableHeight, 500); // Máximo 500px
    tableWrapper.style.maxHeight = `${maxHeight}px`;
}

// ============================================
// DIAGNÓSTICO DEL ESTADO ACTUAL
// ============================================
function diagnoseCurrentState() {
    console.log("🔍 === DIAGNÓSTICO DEL ESTADO ACTUAL ===");
    
    // 1. Estado de la aplicación
    console.log("1. ESTADO DE LA APLICACIÓN:");
    console.log("   - Carrera actual:", appState.currentRace ? 
        `${appState.currentRace.name} (ID: ${appState.currentRace.id})` : 
        "Ninguna");
    console.log("   - Total carreras:", appState.races.length);
    
    // 2. Carreras disponibles
    console.log("2. CARRERAS DISPONIBLES:");
    appState.races.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} (ID: ${race.id})`);
    });
    
    // 3. Selector en DOM
    console.log("3. SELECTOR EN DOM:");
    const racesSelect = document.getElementById('race-select');
    if (racesSelect) {
        console.log("   ✅ Encontrado");
        console.log("   - Valor seleccionado:", racesSelect.value);
        console.log("   - Opciones:", racesSelect.options.length);
        
        // Mostrar opciones actuales
        console.log("   - Opciones actuales:");
        for (let i = 0; i < racesSelect.options.length; i++) {
            const option = racesSelect.options[i];
            console.log(`     ${i}. ${option.value}: ${option.textContent} ${option.selected ? '✅' : ''}`);
        }
    } else {
        console.log("   ❌ No encontrado");
    }
    
    // 4. LocalStorage
    console.log("4. LOCALSTORAGE:");
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    console.log("   - Carreras guardadas:", savedRaces.length);
    
    // 5. Verificar sincronización
    console.log("5. SINCRONIZACIÓN:");
    const memoryIds = appState.races.map(r => r.id).sort();
    const storageIds = savedRaces.map(r => r.id).sort();
    const synced = JSON.stringify(memoryIds) === JSON.stringify(storageIds);
    
    if (synced) {
        console.log("   ✅ Memoria y localStorage sincronizados");
    } else {
        console.log("   ❌ DESINCRONIZADO");
        console.log("   - IDs en memoria:", memoryIds);
        console.log("   - IDs en localStorage:", storageIds);
    }
    
    console.log("=== FIN DEL DIAGNÓSTICO ===");
}

// ============================================
// LIMPIAR TODAS LAS CARRERAS COMPLETAMENTE
// ============================================
function clearAllRaces() {
    console.log("🧨 LIMPIANDO TODAS LAS CARRERAS...");
    
    // Confirmación
    const t = translations[appState.currentLanguage];
    if (!confirm(t.confirmDeleteAllRaces || "¿Estás seguro de que quieres eliminar TODAS las carreras? Esta acción no se puede deshacer.")) {
        console.log("❌ Limpieza cancelada por el usuario");
        return;
    }
    
    // 1. Limpiar estado de la aplicación
    appState.races = [];
    appState.currentRace = null;
    startOrderData = [];
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    appState.raceStartTime = null;
    
    // 2. Limpiar TODO localStorage relacionado con carreras
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('race-') || 
            key === 'countdown-races' || 
            key === 'countdown-current-race' ||
            key === 'start-order-data' ||
            key.startsWith('cri_start_order')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Eliminado: ${key}`);
    });
    
    // 3. Resetear UI
    const elementsToReset = [
        { id: 'first-start-time', defaultValue: '09:00:00' },
        { id: 'total-riders', defaultValue: '1' },
        { id: 'start-position', defaultValue: '1' }
    ];
    
    elementsToReset.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.value = item.defaultValue;
        }
    });
    
    // 4. Actualizar selector (vacío)
    if (typeof renderRacesSelect === 'function') {
        renderRacesSelect();
    }
    
    // 5. Actualizar UI
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    if (typeof updateRaceActionButtonsState === 'function') {
        updateRaceActionButtonsState();
    }
    
    // 6. Actualizar tabla vacía
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled(true);
    }
    
    console.log("✅ TODAS las carreras eliminadas completamente");
    showMessage(t.allRacesDeleted || "Todas las carreras eliminadas correctamente", 'success');
}

// ============================================
// DIAGNÓSTICO ESPECÍFICO DEL PROBLEMA DE CARRERAS FANTASMA
// ============================================
function diagnoseGhostRace() {
    console.log("👻 === DIAGNÓSTICO DE CARRERA FANTASMA ===");
    
    // 1. Obtener el selector
    const racesSelect = document.getElementById('race-select');
    if (!racesSelect) {
        console.error("❌ Selector no encontrado");
        return;
    }
    
    console.log("1. SELECTOR ACTUAL:");
    console.log(`   - Valor seleccionado: ${racesSelect.value}`);
    console.log(`   - Opciones totales: ${racesSelect.options.length}`);
    
    // Mostrar todas las opciones
    console.log("   - Opciones en el selector:");
    for (let i = 0; i < racesSelect.options.length; i++) {
        const option = racesSelect.options[i];
        console.log(`     ${i}. ${option.value}: "${option.textContent}" ${option.selected ? '✅ SELECCIONADA' : ''}`);
    }
    
    // 2. Estado de la aplicación
    console.log("\n2. ESTADO DE LA APLICACIÓN:");
    console.log(`   - Carreras en memoria: ${appState.races.length}`);
    console.log(`   - Carrera actual: ${appState.currentRace ? appState.currentRace.name + ' (ID: ' + appState.currentRace.id + ')' : 'Ninguna'}`);
    
    // Mostrar carreras en memoria
    appState.races.forEach((race, index) => {
        console.log(`     ${index + 1}. ${race.name} (ID: ${race.id})`);
    });
    
    // 3. localStorage
    console.log("\n3. LOCALSTORAGE:");
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    console.log(`   - Carreras guardadas: ${savedRaces.length}`);
    
    savedRaces.forEach((race, index) => {
        console.log(`     ${index + 1}. ${race.name} (ID: ${race.id})`);
    });
    
    // 4. Encontrar la carrera fantasma
    console.log("\n4. BUSCANDO CARRERA FANTASMA:");
    
    // Opción seleccionada en el selector
    const selectedOption = racesSelect.options[racesSelect.selectedIndex];
    if (selectedOption && selectedOption.value !== "0") {
        const selectedId = parseInt(selectedOption.value);
        
        // Buscar en memoria
        const inMemory = appState.races.find(r => r.id === selectedId);
        // Buscar en localStorage
        const inStorage = savedRaces.find(r => r.id === selectedId);
        
        console.log(`   - Opción seleccionada: ID ${selectedId} -> "${selectedOption.textContent}"`);
        console.log(`   - ¿En memoria? ${inMemory ? '✅ SÍ' : '❌ NO'}`);
        console.log(`   - ¿En localStorage? ${inStorage ? '✅ SÍ' : '❌ NO'}`);
        
        if (!inMemory && !inStorage) {
            console.log("   🚨 ¡CARRERA FANTASMA ENCONTRADA!");
            console.log(`   Esta carrera (ID: ${selectedId}) no existe en ningún lado pero aparece en el selector.`);
        }
    } else {
        console.log("   - Ninguna opción seleccionada (valor 0)");
    }
    
    // 5. Recomendaciones
    console.log("\n5. ACCIONES RECOMENDADAS:");
    
    if (racesSelect.options.length === 1 && racesSelect.options[0].value === "0") {
        console.log("   ✅ Selector vacío (solo opción por defecto)");
    } else if (racesSelect.options.length > 1) {
        console.log("   🛠️ Ejecuta: fixGhostRace() para limpiar el selector");
    }
    
    console.log("=== FIN DEL DIAGNÓSTICO ===");
}

// ============================================
// ARREGLAR PROBLEMA DE CARRERA FANTASMA
// ============================================
function fixGhostRace() {
    console.log("🔧 ARREGLANDO PROBLEMA DE CARRERA FANTASMA...");
    
    const t = translations[appState.currentLanguage];
    const racesSelect = document.getElementById('race-select');
    
    if (!racesSelect) {
        console.error("❌ Selector no encontrado");
        return;
    }
    
    // 1. Verificar si hay opciones fantasmas
    const ghostOptions = [];
    for (let i = 0; i < racesSelect.options.length; i++) {
        const option = racesSelect.options[i];
        if (option.value !== "0") {
            const optionId = parseInt(option.value);
            
            // Buscar si existe
            const existsInMemory = appState.races.find(r => r.id === optionId);
            const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
            const existsInStorage = savedRaces.find(r => r.id === optionId);
            
            if (!existsInMemory && !existsInStorage) {
                ghostOptions.push({
                    index: i,
                    id: optionId,
                    text: option.textContent
                });
            }
        }
    }
    
    if (ghostOptions.length === 0) {
        console.log("✅ No se encontraron opciones fantasma");
        showMessage(t.noGhostRaces || "No hay carreras fantasma", 'info');
        return;
    }
    
    console.log(`🚨 Encontradas ${ghostOptions.length} opciones fantasma:`);
    ghostOptions.forEach(ghost => {
        console.log(`   - Índice ${ghost.index}: ID ${ghost.id} -> "${ghost.text}"`);
    });
    
    // 2. Confirmar con el usuario
    if (!confirm(t.confirmFixGhostRaces || `¿Eliminar ${ghostOptions.length} carrera(s) fantasma del selector?`)) {
        console.log("❌ Operación cancelada por el usuario");
        return;
    }
    
    // 3. Eliminar opciones fantasma (en orden inverso para no afectar índices)
    ghostOptions.sort((a, b) => b.index - a.index).forEach(ghost => {
        racesSelect.remove(ghost.index);
        console.log(`🗑️ Eliminada opción fantasma: "${ghost.text}"`);
    });
    
    // 4. Forzar selección por defecto
    racesSelect.value = "0";
    racesSelect.selectedIndex = 0;
    
    // 5. Si no quedan opciones reales, resetear estado
    let hasRealRaces = false;
    for (let i = 0; i < racesSelect.options.length; i++) {
        if (racesSelect.options[i].value !== "0") {
            hasRealRaces = true;
            break;
        }
    }
    
    if (!hasRealRaces) {
        console.log("ℹ️ No quedan carreras reales, reseteando estado...");
        appState.currentRace = null;
        localStorage.removeItem('countdown-current-race');
        
        if (typeof updateRaceManagementCardTitle === 'function') {
            updateRaceManagementCardTitle();
        }
        
        if (typeof updateRaceActionButtonsState === 'function') {
            updateRaceActionButtonsState();
        }
    }
    
    console.log("✅ Problema de carrera fantasma solucionado");
    showMessage(t.ghostRacesFixed || "Carreras fantasma eliminadas del selector", 'success');
}

function formatTimeValue(value) {
    // Si es undefined, null o vacío, devolver cadena vacía
    if (value === undefined || value === null || value === '') {
        return '';
    }
    
    // Si es un string con signos de diferencia, devolverlo tal cual
    if (typeof value === 'string' && (value.includes('(+)') || value.includes('(-)'))) {
        return value;
    }
    
    // Si es un número (formato Excel o segundos)
    if (typeof value === 'number') {
        // Si es un número de Excel (formato de fecha/hora, valor entre 0 y 1)
        if (value < 1 && value > 0) {
            // Es un valor de tiempo de Excel (1 = 24 horas)
            const totalSeconds = Math.round(value * 86400); // 86400 segundos en un día
            return secondsToTime(totalSeconds);
        } else {
            // Es un número de segundos
            return secondsToTime(value);
        }
    }
    
    // Si ya es un string de tiempo
    if (typeof value === 'string') {
        let timeStr = value.trim();
        
        // Si está vacío después de trim
        if (timeStr === '') return '';
        
        // Si ya tiene formato HH:MM:SS completo, devolverlo formateado
        if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0]).toString().padStart(2, '0');
            const minutes = parseInt(parts[1]).toString().padStart(2, '0');
            const seconds = parseInt(parts[2]).toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }
        
        // Si es HH:MM, agregar :00
        if (timeStr.match(/^\d{1,2}:\d{2}$/)) {
            const parts = timeStr.split(':');
            const hours = parseInt(parts[0]).toString().padStart(2, '0');
            const minutes = parseInt(parts[1]).toString().padStart(2, '0');
            return `${hours}:${minutes}:00`;
        }
        
        // Si es un número string, convertirlo a tiempo
        if (!isNaN(timeStr) && timeStr !== '') {
            return secondsToTime(parseInt(timeStr));
        }
        
        // Para otros casos (como "--:--:--"), devolver el string original
        return timeStr;
    }
    
    // Para cualquier otro tipo, devolver cadena vacía
    return '';
}

function secondsToTime(totalSeconds) {
    // Manejar valores no válidos
    if (!totalSeconds && totalSeconds !== 0) return '00:00:00';
    if (totalSeconds < 0) totalSeconds = 0;
    
    // Asegurar que sea un número entero
    const secs = Math.abs(Math.round(totalSeconds));
    
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeString) {
    // Si es undefined, null, vacío o formato inválido
    if (!timeString || timeString === '' || timeString === '--:--:--' || timeString === '00:00:00') {
        return 0;
    }
    
    // Si ya es un número
    if (typeof timeString === 'number') {
        return timeString;
    }
    
    // Si es string, convertir a tiempo
    let formattedTime = timeString.toString().trim();
    
    // Agregar segundos si faltan
    const parts = formattedTime.split(':');
    
    if (parts.length === 3) {
        // Formato HH:MM:SS
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return (hours * 3600) + (minutes * 60) + seconds;
    } else if (parts.length === 2) {
        // Formato HH:MM → agregar 0 segundos
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        return (hours * 3600) + (minutes * 60);
    } else if (parts.length === 1 && !isNaN(formattedTime)) {
        // Es solo un número (segundos)
        return parseInt(formattedTime) || 0;
    }
    
    return 0;
}

/* funCIONES ANULADas
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

// Función para formatear tiempo
function formatTimeValue(timeStr) {
    if (!timeStr) return '00:00:00';
    
    // Asegurar formato HH:MM:SS
    let formattedTime = timeStr.toString().trim();
    
    if (!formattedTime.includes(':')) {
        return '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        // Formato HH:MM -> agregar :00
        parts.push('00');
    }
    
    // Asegurar 2 dígitos
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].padStart(2, '0');
    const seconds = parts[2] ? parts[2].padStart(2, '0') : '00';
    
    return `${hours}:${minutes}:${seconds}`;
}

// Función auxiliar para formatear tiempo (asegurar formato HH:MM:SS)
function formatTimeValue(timeStr) {
    // Si es undefined, null o vacío, devolver cadena vacía
    if (timeStr === undefined || timeStr === null || timeStr === '') {
        return '';
    }
    
    // Si ya es un string con signos de diferencia, devolverlo tal cual
    if (typeof timeStr === 'string' && (timeStr.includes('(+)') || timeStr.includes('(-)'))) {
        return timeStr;
    }
    
    // Convertir a string si es un número
    if (typeof timeStr === 'number') {
        // Si es un número de Excel (formato de fecha/hora), convertirlo a string
        // En Excel, 1 = 24 horas, 0.0416666666666667 = 1 hora
        if (timeStr < 1 && timeStr > 0) {
            // Es un valor de tiempo de Excel
            const totalSeconds = Math.round(timeStr * 86400); // 86400 segundos en un día
            return secondsToTime(totalSeconds);
        } else {
            // Es un número de segundos
            return secondsToTime(timeStr);
        }
    }
    
    // Asegurarnos de que es un string
    timeStr = String(timeStr).trim();
    
    // Si ya tiene formato HH:MM:SS, devolverlo
    if (timeStr.includes(':') && timeStr.length >= 8) {
        return timeStr;
    }
    
    // Si es un número string, convertirlo a tiempo
    if (!isNaN(timeStr) && timeStr !== '') {
        return secondsToTime(parseInt(timeStr));
    }
    
    // Si es HH:MM, agregar :00
    if (timeStr.includes(':') && timeStr.length === 5) {
        return timeStr + ':00';
    }
    
    // Para otros casos, devolver el string original
    return timeStr;
}
***************************************************************

function secondsToTime(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Función para convertir segundos a tiempo
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

// Función para convertir tiempo a segundos (debe existir)
function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '') return 0;
    
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        formattedTime = '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        parts.push('00');
    }
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
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

// Función para convertir tiempo a segundos
function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '') return 0;
    
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        formattedTime = '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        parts.push('00');
    }
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

*/


