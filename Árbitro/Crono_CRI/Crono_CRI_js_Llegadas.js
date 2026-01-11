// ============================================
// MÓDULO DE LLEGADAS - CRONÓMETRO Y REGISTRO
// ============================================
// DESCRIPCIÓN: Sistema completo de llegadas con cronómetro y clasificación
// RESPONSABILIDADES:
// 1. Cronómetro independiente para registro de llegadas
// 2. Sistema de registro manual y rápido de llegadas
// 3. Importación de datos de salidas para cálculo automático
// 4. Clasificación automática por tiempos crono
// 5. Exportación a Excel de llegadas y clasificación
// 6. Persistencia del estado del cronómetro y registros
//
// FUNCIONES CRÍTICAS EXPORTADAS:
// - startLlegadasTimer() - Inicia cronómetro de llegadas
// - showQuickRegisterLlegada() - Registro rápido con dorsal
// - importSalidasForLlegadas() - Importa datos de salidas
// - showRankingModal() - Muestra clasificación ordenada
// - exportLlegadasToExcel() - Exporta llegadas a Excel
//
// DEPENDENCIAS:
// - llegadasState (global) - Estado específico del módulo
// - appState (global) - Estado principal
// - translations (global) - Traducciones
// - startOrderData (global) - Para obtener nombres de corredores
// - timeToSeconds()/secondsToTime() - Conversiones de tiempo
//
// ARCHIVOS RELACIONADOS:
// → Main.js: Inicialización y listeners
// → Storage_Pwa.js: Guarda datos de llegadas en carrera
// → UI.js: Modales y componentes visuales
// ============================================

// ============================================
// MÓDULO DE LLEGADAS - CRONÓMETRO Y REGISTRO
// ============================================

// ============================================
// FUNCIONES AUXILIARES DE TIEMPO
// ============================================
function getCurrentTimeInSeconds() {
    const now = new Date();
    return (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
}

function getCurrentTimeInMilliseconds() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    return (hours * 3600000) + (minutes * 60000) + (seconds * 1000) + milliseconds;
}

function getFirstStartTimeInSeconds() {
    const firstStartElement = document.getElementById('first-start-time');
    if (firstStartElement && firstStartElement.value) {
        return timeToSeconds(firstStartElement.value);
    }
    return 0;
}

function getFirstStartTimeInMilliseconds() {
    const firstStartElement = document.getElementById('first-start-time');
    if (firstStartElement && firstStartElement.value) {
        return timeToSeconds(firstStartElement.value) * 1000;
    }
    return 0;
}

function formatMillisecondsToTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let milliseconds = ms % 1000;
    
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    // Formato HH:MM:SS.mmm
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// ============================================
// FUNCIONES DEL CRONÓMETRO DE LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas...");
    
    // Cargar estado guardado
    loadLlegadasState();
    
    // Inicializar cronómetro
    updateLlegadasTimerDisplay();
    
    // 🔥 MODIFICADO: Iniciar intervalo de actualización del timer
    // Limpiar intervalo previo si existe
    if (window.llegadasUpdateInterval) {
        clearInterval(window.llegadasUpdateInterval);
        console.log("🔄 Intervalo previo de llegadas limpiado");
    }
    
    // 🔥 CAMBIO IMPORTANTE: El timer debe actualizarse SIEMPRE en modo llegadas
    // No solo cuando está "activo" porque el cálculo es hora_actual - first_start_time
    window.llegadasUpdateInterval = setInterval(() => {
        // ACTUALIZAR SIEMPRE, independientemente de timerActive
        // Porque el cálculo es hora actual - primera salida
        if (typeof updateLlegadasTimerDisplay === 'function') {
            updateLlegadasTimerDisplay();
        }
        
        // 🔥 OPCIONAL: Solo ejecutar otras lógicas si timerActive es true
        if (window.llegadasState && window.llegadasState.timerActive) {
            // Guardar estado cada 10 segundos (solo si está activo)
            if (llegadasState.currentTime % 10 === 0) {
                saveLlegadasState();
            }
        }
    }, 100); // Actualizar cada 100ms para mayor precisión
    
    console.log("⏱️ Intervalo de actualización del timer configurado (SIEMPRE activo, 100ms)");
    
    // Renderizar lista si hay datos
    renderLlegadasList();
    
    console.log("Modo llegadas inicializado");
}

function startLlegadasTimer() {
    const t = translations[appState.currentLanguage];
    
    if (!llegadasState.timerActive) {
        llegadasState.timerActive = true;
        llegadasState.timerStarted = true;
        
        // 🔥 MODIFICADO: No crear un nuevo intervalo, ya existe uno
        // Solo marcar como activo para otras funciones (registro de llegadas, etc.)
        showMessage(t.timerStarted, 'success');
        console.log("Cronómetro de llegadas marcado como activo");
        
        // 🔥 AÑADIDO: Guardar estado inmediatamente
        saveLlegadasState();
    }
}

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

function updateLlegadasTimerDisplay() {
    const display = document.getElementById('llegadas-timer-display');
    if (!display) return;
    
    // Obtener hora actual y first-start-time en segundos
    const currentTimeSeconds = getCurrentTimeInSeconds();
    const firstStartSeconds = getFirstStartTimeInSeconds();
    
    // Calcular diferencia
    let diferenciaSegundos = currentTimeSeconds - firstStartSeconds;
    
    // Si es negativo (la carrera no ha empezado), mostrar 00:00:00
    if (diferenciaSegundos < 0) {
        diferenciaSegundos = 0;
    }
    
    // Convertir a HH:MM:SS (sin milésimas para display)
    display.textContent = secondsToTime(diferenciaSegundos);
    
    // Actualizar estado en segundos (para otros cálculos)
    llegadasState.currentTime = diferenciaSegundos;
}

// ============================================
// FUNCIONES DE REGISTRO DE LLEGADAS
// ============================================
function showRegisterLlegadaModal() {
    const modal = document.getElementById('register-llegada-modal');
    const horaInput = document.getElementById('llegada-hora');
    
    // Establecer hora actual CON MILÉSIMAS
    const currentTimeMs = getCurrentTimeInMilliseconds();
    const firstStartMs = getFirstStartTimeInMilliseconds();
    
    let diferenciaMs = currentTimeMs - firstStartMs;
    if (diferenciaMs < 0) diferenciaMs = 0;
    
    horaInput.value = formatMillisecondsToTime(currentTimeMs);
    
    // Limpiar otros campos
    document.getElementById('llegada-dorsal').value = '';
    document.getElementById('llegada-notas').value = '';
    
    modal.classList.add('active');
}

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
    
    // OBTENER TIEMPOS CON MILÉSIMAS
    const currentTimeMs = getCurrentTimeInMilliseconds();
    const firstStartMs = getFirstStartTimeInMilliseconds();
    
    let diferenciaMs = currentTimeMs - firstStartMs;
    if (diferenciaMs < 0) diferenciaMs = 0;
    
    // Crear llegada CON PRECISIÓN DE MILÉSIMAS
    const llegada = {
        dorsal: dorsalNum,
        horaSalida: '',
        horaLlegada: formatMillisecondsToTime(currentTimeMs), // HH:MM:SS.mmm
        tiempoCrono: formatMillisecondsToTime(diferenciaMs), // HH:MM:SS.mmm
        notas: 'Registro rápido',
        timestamp: Date.now(),
        milliseconds: diferenciaMs // Guardar también en milisegundos para cálculos
    };
    
    // Intentar obtener hora de salida si hay datos importados
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsalNum);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida) * 1000; // Convertir a ms
            const tiempoCronoMs = currentTimeMs - segundosSalida - firstStartMs;
            if (tiempoCronoMs > 0) {
                llegada.tiempoCrono = formatMillisecondsToTime(tiempoCronoMs);
                llegada.milliseconds = tiempoCronoMs;
            }
        }
    }
    
    llegadasState.llegadas.push(llegada);
    saveLlegadasState();
    renderLlegadasList();
    
    showMessage(t.llegadaRegistered.replace('{dorsal}', dorsalNum), 'success');
}

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
    
    // OBTENER HORA ACTUAL CON MILÉSIMAS
    const currentTimeMs = getCurrentTimeInMilliseconds();
    const firstStartMs = getFirstStartTimeInMilliseconds();
    
    // Calcular diferencia en milisegundos
    let diferenciaMs = currentTimeMs - firstStartMs;
    if (diferenciaMs < 0) diferenciaMs = 0;
    
    // Crear llegada CON PRECISIÓN DE MILÉSIMAS
    const llegada = {
        dorsal: dorsal,
        horaSalida: '',
        horaLlegada: formatMillisecondsToTime(currentTimeMs), // HH:MM:SS.mmm
        tiempoCrono: formatMillisecondsToTime(diferenciaMs), // HH:MM:SS.mmm
        notas: notasInput.value.trim(),
        timestamp: Date.now(),
        milliseconds: diferenciaMs // Guardar también en milisegundos para cálculos
    };
    
    // Intentar obtener hora de salida
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida) * 1000; // Convertir a ms
            const tiempoCronoMs = currentTimeMs - segundosSalida - firstStartMs;
            if (tiempoCronoMs > 0) {
                llegada.tiempoCrono = formatMillisecondsToTime(tiempoCronoMs);
                llegada.milliseconds = tiempoCronoMs;
            }
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

// ============================================
// FUNCIONES DE GESTIÓN DE LLEGADAS
// ============================================
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
    
    // Usar DocumentFragment para mejor rendimiento
    const fragment = document.createDocumentFragment();
    
    llegadasState.llegadas.forEach((llegada, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-index', index);
        
        row.innerHTML = `
            <td>${llegada.dorsal}</td>
            <td>${getNombreFromDorsal(llegada.dorsal)}</td>
            <td>${llegada.horaSalida || '--:--:--'}</td>
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            <td>${llegada.tiempoCrono || '--:--:--'}</td>
            <td>${llegada.notas || ''}</td>
        `;
        
        fragment.appendChild(row);
    });
    
    // Limpiar y añadir todo de una vez
    tableBody.innerHTML = '';
    tableBody.appendChild(fragment);
}

function getNombreFromDorsal(dorsal) {
    // Buscar en datos importados de llegadas
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
    if (salidaData && salidaData.nombre && salidaData.apellidos) {
        return `${salidaData.nombre} ${salidaData.apellidos}`;
    }
    
    // Buscar en datos de orden de salida
    const orderData = startOrderData.find(r => r.dorsal === dorsal);
    if (orderData && orderData.nombre && orderData.apellidos) {
        return `${orderData.nombre} ${orderData.apellidos}`;
    }
    
    return '';
}

// ============================================
// FUNCIONES DE IMPORTACIÓN DE SALIDAS
// ============================================
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
                        const segundosSalida = timeToSeconds(salidaData.horaSalida) * 1000;
                        const horaLlegadaParts = llegada.horaLlegada.split('.');
                        const horaLlegadaBase = horaLlegadaParts[0];
                        const milliseconds = horaLlegadaParts[1] ? parseInt(horaLlegadaParts[1]) : 0;
                        const segundosLlegada = timeToSeconds(horaLlegadaBase) * 1000 + milliseconds;
                        const tiempoCronoMs = segundosLlegada - segundosSalida - getFirstStartTimeInMilliseconds();
                        
                        if (tiempoCronoMs > 0) {
                            llegada.tiempoCrono = formatMillisecondsToTime(tiempoCronoMs);
                            llegada.milliseconds = tiempoCronoMs;
                        }
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

// ============================================
// FUNCIONES DE CLASIFICACIÓN
// ============================================
function showRankingModal() {
    const t = translations[appState.currentLanguage];
    
    // Filtrar llegadas que tienen tiempo crono (usando milliseconds para precisión)
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.milliseconds && l.milliseconds > 0);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noRankingText, 'info');
        return;
    }
    
    // Ordenar por tiempo crono en milisegundos (ascendente)
    llegadasConTiempo.sort((a, b) => {
        return a.milliseconds - b.milliseconds;
    });
    
    // Generar tabla de ranking
    const tableBody = document.getElementById('ranking-table-body');
    const emptyState = document.getElementById('ranking-empty');
    
    if (llegadasConTiempo.length > 0) {
        emptyState.style.display = 'none';
        
        let html = '';
        let bestTime = null;
        
        llegadasConTiempo.forEach((llegada, index) => {
            const tiempoMs = llegada.milliseconds;
            
            let diferencia = '';
            if (bestTime === null) {
                bestTime = tiempoMs;
                diferencia = '--:--:--.000';
            } else {
                const diffMs = tiempoMs - bestTime;
                diferencia = formatMillisecondsToTime(diffMs);
            }
            
            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${llegada.dorsal}</td>
                <td>${getNombreFromDorsal(llegada.dorsal)}</td>
                <td>${llegada.tiempoCrono || formatMillisecondsToTime(tiempoMs)}</td>
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

// ============================================
// FUNCIONES DE EXPORTACIÓN
// ============================================
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

function exportRankingToExcel() {
    const t = translations[appState.currentLanguage];
    
    // Filtrar y ordenar usando milisegundos para precisión
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.milliseconds && l.milliseconds > 0);
    llegadasConTiempo.sort((a, b) => a.milliseconds - b.milliseconds);
    
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
        const tiempoMs = llegada.milliseconds;
        
        let diferencia = '';
        if (bestTime === null) {
            bestTime = tiempoMs;
            diferencia = '--:--:--.000';
        } else {
            const diffMs = tiempoMs - bestTime;
            diferencia = formatMillisecondsToTime(diffMs);
        }
        
        data.push([
            index + 1,
            llegada.dorsal,
            getNombreFromDorsal(llegada.dorsal),
            llegada.tiempoCrono || formatMillisecondsToTime(tiempoMs),
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
// FUNCIONES DE PERSISTENCIA DE LLEGADAS
// ============================================
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
            startLlegadasTimer();
        }
        
        console.log("Estado de llegadas cargado:", llegadasState.llegadas.length, "llegadas");
    }
}

function saveLlegadasState() {
    localStorage.setItem('llegadas-state', JSON.stringify({
        llegadas: llegadasState.llegadas,
        importedSalidas: llegadasState.importedSalidas,
        currentTime: llegadasState.currentTime,
        timerStarted: llegadasState.timerActive || llegadasState.timerStarted
    }));
}

// ============================================
// FUNCIONES AUXILIARES DE LLEGADAS
// ============================================
function setupLlegadasEventListeners() {
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
}