// ============================================
// MÓDULO DE SALIDAS - CUENTA ATRÁS Y ORDEN DE SALIDA
// ============================================

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
    
    // Configurar tiempo de intervalo
    updateCadenceTime();
    
    // Ocultar elementos durante cuenta atrás
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = 'none';
    });
    
    // Activar pantalla de cuenta atrás
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('active');
    countdownScreen.classList.remove('aggressive-numbers');
    
    // Inicializar tiempos
    appState.raceStartTime = Date.now();
    appState.accumulatedTime = 0;
    
    const startPosition = parseInt(document.getElementById('start-position').value) || 1;
    appState.departedCount = startPosition - 1;
    document.getElementById('departed-count').textContent = appState.departedCount;
    
    // Limpiar salidas si empezamos desde posición > 1
    if (startPosition > 1) {
        appState.departureTimes = [];
        if (appState.currentRace) {
            appState.currentRace.departures = [];
            saveRaceData();
        }
    }
    
    // Establecer estado de cuenta atrás
    appState.countdownActive = true;
    appState.countdownPaused = false;
    appState.countdownValue = appState.nextCorredorTime;
    appState.aggressiveMode = false;
    
    // Resetear estilos visuales
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    countdownScreen.classList.remove('countdown-salida-active');
    
    // Mostrar etiqueta de cuenta atrás
    document.getElementById('countdown-label').style.opacity = '1';
    document.getElementById('countdown-label').style.visibility = 'visible';
    
    // Actualizar display
    updateCountdownDisplay();
    
    // Limpiar intervalo anterior si existe
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
    }
    
    // Iniciar intervalo de cuenta atrás
    appState.countdownInterval = setInterval(updateCountdown, 1000);
    
    // Mantener pantalla activa
    keepScreenAwake();
    
    // Guardar estado
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
    
    // Sincronizar tiempo si hay desviación
    if (Math.abs(elapsedFromRaceStart - expectedElapsedTime) > 1) {
        appState.countdownValue = Math.max(0, appState.nextCorredorTime - 
            (elapsedFromRaceStart - appState.accumulatedTime));
    } else {
        appState.countdownValue--;
    }
    
    // Manejar cuando llega a cero
    if (appState.countdownValue <= 0) {
        handleCountdownZero();
        return;
    }
    
    updateCountdownDisplay();
    
    // Cambios visuales y de sonido según el tiempo
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
    
    // Guardar estado periódicamente
    if (appState.countdownValue % 10 === 0) {
        saveAppState();
    }
}

function handleCountdownZero() {
    // Limpiar intervalo actual
    if (appState.countdownInterval) {
        clearInterval(appState.countdownInterval);
        appState.countdownInterval = null;
    }
    
    const countdownScreen = document.getElementById('countdown-screen');
    countdownScreen.classList.add('countdown-salida-active');
    
    countdownScreen.classList.remove('aggressive-numbers');
    appState.aggressiveMode = false;
    
    // Cambiar estilos para mostrar SALIDA
    document.body.classList.remove('countdown-critical', 'countdown-warning', 'countdown-normal');
    document.body.classList.add('countdown-salida');
    
    const salidaDisplay = document.getElementById('salida-display');
    salidaDisplay.classList.add('show');
    
    // Reproducir sonido de salida
    playSound('salida');
    
    // Registrar la salida del corredor actual
    registerDeparture();
    
    // Añadir tiempo al acumulado
    appState.accumulatedTime += appState.nextCorredorTime;
    
    // Incrementar contador de salidos
    appState.departedCount++;
    document.getElementById('departed-count').textContent = appState.departedCount;
    document.getElementById('start-position').value = appState.departedCount + 1;
    
    // Actualizar intervalo para el próximo corredor
    updateCurrentInterval();
    
    // Guardar estado
    saveAppState();
    if (appState.currentRace) {
        saveRaceData();
    }
    
    // Actualizar lista de salidas
    renderDeparturesList();
    
    console.log(`Corredor ${appState.departedCount} salió. Próximo: ${appState.departedCount + 1}`);
    
    // Configurar timeout para mostrar "SALIDA"
    appState.salidaTimeout = setTimeout(() => {
        salidaDisplay.classList.remove('show');
        countdownScreen.classList.remove('countdown-salida-active');
    }, 2000);
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
    
    // Resetear estilos
    document.body.classList.remove(
        'countdown-normal', 
        'countdown-warning', 
        'countdown-critical', 
        'countdown-salida'
    );
    
    document.getElementById('countdown-screen').classList.remove('aggressive-numbers');
    
    // Resetear tiempo total
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    // Limpiar estado guardado
    localStorage.removeItem('countdown-app-state');
    
    console.log("Cuenta atrás detenida");
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

function updateNextCorredorDisplay() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    
    const nextCorredorNumber = appState.departedCount + 2;
    
    let timeForNextCorredor = appState.nextCorredorTime;
    
    // Buscar en intervalos si existen
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
    
    // Formatear para display
    if (timeForNextCorredor >= 60) {
        const minutes = Math.floor(timeForNextCorredor / 60);
        const seconds = timeForNextCorredor % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = timeForNextCorredor + "s";
    }
    
    console.log(`Display actualizado: Próximo corredor (${nextCorredorNumber}) sale en ${timeForNextCorredor}s`);
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

// ============================================
// FUNCIONES DE REGISTRO DE SALIDAS
// ============================================
function registerDeparture() {
    const salidaNumber = appState.departedCount + 1;
    appState.departedCount++;
    
    let accumulatedSeconds = 0;
    
    if (appState.raceStartTime) {
        accumulatedSeconds = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    }
    
    // Formatear tiempo
    const hours = Math.floor(accumulatedSeconds / 3600);
    const minutes = Math.floor((accumulatedSeconds % 3600) / 60);
    const seconds = accumulatedSeconds % 60;
    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Crear objeto de salida
    const departure = {
        corredor: salidaNumber,
        timestamp: Date.now(),
        notes: '',
        editing: false,
        timeValue: timeValue,
        elapsedSeconds: accumulatedSeconds
    };
    
    appState.departureTimes.push(departure);
    
    // Actualizar UI
    document.getElementById('departed-count').textContent = appState.departedCount;
    document.getElementById('start-position').value = appState.departedCount + 1;
    
    renderDeparturesList();
    saveRaceData();
    saveAppState();
    
    console.log("Salida registrada - Número de salida:", salidaNumber, "Tiempo:", timeValue);
}

function renderDeparturesList() {
    const tableBody = document.getElementById('departures-table-body');
    const emptyState = document.getElementById('departures-empty');
    
    if (!tableBody || !emptyState) return;
    
    if (appState.departureTimes.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Ordenar salidas según estado actual
    const sortedDepartures = [...appState.departureTimes].sort((a, b) => {
        let valueA, valueB;
        
        switch(sortState.column) {
            case 'dorsal':
                valueA = a.corredor;
                valueB = b.corredor;
                break;
            case 'timeValue':
                valueA = a.elapsedSeconds || 0;
                valueB = b.elapsedSeconds || 0;
                break;
            case 'notes':
                valueA = (a.notes || '').toLowerCase();
                valueB = (b.notes || '').toLowerCase();
                break;
            case 'date':
                valueA = a.timestamp;
                valueB = b.timestamp;
                break;
            default:
                valueA = a.timestamp;
                valueB = b.timestamp;
        }
        
        if (sortState.direction === 'asc') {
            return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
        } else {
            return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
        }
    });
    
    tableBody.innerHTML = '';
    
    sortedDepartures.forEach((departure, displayIndex) => {
        const originalIndex = appState.departureTimes.findIndex(d => 
            d.corredor === departure.corredor && d.timestamp === departure.timestamp
        );
        
        const t = translations[appState.currentLanguage];
        const actualIndex = originalIndex !== -1 ? originalIndex : displayIndex;
        
        const time = new Date(departure.timestamp);
        const timeStr = time.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateStr = time.toLocaleDateString('es-ES');
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="departure-dorsal-cell">${departure.corredor}</td>
            <td class="departure-time-value-cell">
                ${departure.timeValue || '--:--:--'}
            </td>
            <td class="departure-notes-cell">
                ${departure.editing ? 
                    `<div class="notes-edit-container">
                        <textarea id="notes-input-${actualIndex}" class="departure-notes-input" rows="2" placeholder="${t.departurePlaceholder}" data-index="${actualIndex}">${departure.notes || ''}</textarea>
                        <div class="notes-buttons">
                            <button class="save-notes-btn" data-index="${actualIndex}">${t.saveButtonText}</button>
                            <button class="cancel-notes-btn" data-index="${actualIndex}">${t.cancelButtonText}</button>
                        </div>
                    </div>` :
                    `<div class="departure-notes-display ${!departure.notes ? 'empty' : ''}" data-index="${actualIndex}">
                        ${departure.notes || t.departurePlaceholder + '...'}
                    </div>`
                }
            </td>
            <td class="departure-date-cell">
                ${dateStr}<br>${timeStr}
            </td>
        `;
        
        tableBody.appendChild(row);
        
        // Configurar modo edición si está activo
        if (departure.editing) {
            setupEditingMode(actualIndex);
        } else {
            const displayElement = row.querySelector('.departure-notes-display');
            if (displayElement) {
                displayElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const idx = parseInt(this.getAttribute('data-index'));
                    if (idx >= 0 && idx < appState.departureTimes.length) {
                        appState.departureTimes[idx].editing = true;
                        renderDeparturesList();
                    }
                });
            }
        }
    });
    
    updateSortIndicators();
}

function setupEditingMode(index) {
    const inputElement = document.querySelector(`.departure-notes-input[data-index="${index}"]`);
    const saveButton = document.querySelector(`.save-notes-btn[data-index="${index}"]`);
    const cancelButton = document.querySelector(`.cancel-notes-btn[data-index="${index}"]`);
    
    if (inputElement) {
        inputElement.addEventListener('click', function(e) { e.stopPropagation(); });
        inputElement.addEventListener('focus', function(e) { e.stopPropagation(); });
        
        inputElement.addEventListener('blur', function(e) {
            e.stopPropagation();
            if (!e.relatedTarget || 
                (!e.relatedTarget.classList.contains('save-notes-btn') && 
                !e.relatedTarget.classList.contains('cancel-notes-btn'))) {
                saveNotes(index);
            }
        });
        
        inputElement.addEventListener('keydown', function(e) {
            e.stopPropagation();
            if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
                e.preventDefault();
                saveNotes(index);
            }
        });
        
        setTimeout(() => { inputElement.focus(); inputElement.select(); }, 100);
    }
    
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveNotes(index);
        });
    }
    
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (index >= 0 && index < appState.departureTimes.length) {
                appState.departureTimes[index].editing = false;
                renderDeparturesList();
            }
        });
    }
}

function saveNotes(index) {
    if (index < 0 || index >= appState.departureTimes.length) {
        console.error("Índice inválido en saveNotes:", index);
        return;
    }
    
    const inputElement = document.querySelector(`.departure-notes-input[data-index="${index}"]`);
    if (!inputElement) {
        console.error("Elemento input no encontrado para índice:", index);
        return;
    }
    
    const newNotes = inputElement.value.trim();
    appState.departureTimes[index].notes = newNotes;
    appState.departureTimes[index].editing = false;
    
    saveRaceData();
    saveAppState();
    
    setTimeout(() => { renderDeparturesList(); }, 50);
}

// ============================================
// FUNCIONES DE ORDEN DE SALIDA
// ============================================
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
    
    // Crear plantilla Excel
    createExcelTemplate(numCorredores, intervalo, horaInicio);
}


// ============================================
// FUNCIÓN AUXILIAR PARA FORMATEAR TIEMPO PARA PDF (BASE 60)
// ============================================

function formatTimeForPDF(totalSeconds) {
    if (!totalSeconds && totalSeconds !== 0) return '00:00';
    
    // Asegurarnos de que sea un número entero
    const secs = Math.abs(Math.round(totalSeconds));
    
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    if (hours > 0) {
        // Si hay horas: formato H:MM:SS
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0 || seconds > 0) {
        // Si solo minutos y segundos: formato MM:SS
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        // Cero segundos
        return '00:00';
    }
}

// ============================================
// FUNCIÓN PARA PROCESAR DATOS IMPORTADOS Y CORREGIR COLUMNA TIME
// ============================================

function processImportedOrderData(jsonData) {
    const t = translations[appState.currentLanguage];
    
    const headers = jsonData[0];
    const columnIndexes = {};
    
    // Mapear índices de columnas
    headers.forEach((header, index) => {
        if (header) {
            const cleanHeader = header.toString().trim();
            columnIndexes[cleanHeader] = index;
        }
    });
    
    // Procesar filas
    startOrderData = [];
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const rider = createRiderFromRow(row, columnIndexes, i);
        startOrderData.push(rider);
    }
    
    // Ordenar por número de orden
    startOrderData.sort((a, b) => a.order - b.order);
    
    // ✅ Actualizar "Salida Primero" con la hora del primer corredor
    if (startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        const horaPrimerCorredor = primerCorredor.horaSalida;
        
        // Actualizar el input #first-start-time
        const firstStartTimeInput = document.getElementById('first-start-time');
        if (firstStartTimeInput && horaPrimerCorredor) {
            // Asegurar que la hora tiene formato correcto
            let horaFormateada = horaPrimerCorredor;
            if (!horaFormateada.includes(':')) {
                horaFormateada = '09:00:00';
            } else if (horaFormateada.length === 5) {
                horaFormateada += ':00';
            }
            
            firstStartTimeInput.value = horaFormateada;
            
            // Actualizar también en appState si es necesario
            appState.raceStartTime = horaFormateada;
            
            console.log(`✅ "Salida Primero" actualizada a: ${horaFormateada}`);
        }
    }
    
    // Asegurar que todos los campos están correctos
    startOrderData.forEach(rider => {
        // Asegurar campos reales vacíos
        if (rider.horaSalidaReal !== '') {
            rider.horaSalidaReal = '';
            rider.horaSalidaRealSegundos = 0;
        }
        if (rider.cronoSalidaReal !== '') {
            rider.cronoSalidaReal = '';
            rider.cronoSalidaRealSegundos = 0;
        }
        
        // Asegurar que los campos importados tienen los datos del Excel
        if (!rider.horaSalidaImportado || rider.horaSalidaImportado === '') {
            rider.horaSalidaImportado = rider.horaSalida;
        }
        if (!rider.cronoSalidaImportado || rider.cronoSalidaImportado === '') {
            rider.cronoSalidaImportado = rider.cronoSalida;
        }
    });
    
    // ✅ FIX: Limpiar el estado de throttling antes de actualizar
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    updateStartOrderTablePending = false;
    lastUpdateTime = 0;
    
    // Actualizar UI con FORCE = true
    updateStartOrderUI();
    
    // Mostrar mensaje de éxito
    const message = t.orderImported.replace('{count}', startOrderData.length);
    showMessage(message, 'success');
}


// ============================================
// FUNCIÓN PARA CORREGIR COLUMNA TIME IMPORTADA
// ============================================

function correctImportedTimeColumn(startOrderData, jsonData, columnIndexes) {
    const timeIndex = columnIndexes['TIME'];
    
    startOrderData.forEach((rider, index) => {
        const rowIndex = index + 1; // +1 porque el índice 0 son los headers
        if (rowIndex < jsonData.length) {
            const row = jsonData[rowIndex];
            if (row && timeIndex < row.length) {
                const timeValue = row[timeIndex];
                
                if (timeValue) {
                    // Intentar parsear el tiempo
                    let correctedTime;
                    
                    if (typeof timeValue === 'number') {
                        // Si es número, asumir que son segundos
                        correctedTime = formatTimeForPDF(timeValue);
                    } else if (typeof timeValue === 'string') {
                        // Si es texto, parsearlo
                        const parsedSeconds = parseTimeString(timeValue);
                        correctedTime = formatTimeForPDF(parsedSeconds);
                    } else if (typeof timeValue === 'object' && timeValue.t === 'n') {
                        // Si es objeto de Excel
                        const excelValue = timeValue.v;
                        // Convertir de días Excel a segundos
                        const seconds = Math.round(excelValue * 86400);
                        correctedTime = formatTimeForPDF(seconds);
                    }
                    
                    // Guardar el tiempo corregido
                    if (correctedTime) {
                        rider.timeDisplay = correctedTime;
                        console.log(`Corredor ${rider.order}: TIME corregido de "${timeValue}" a "${correctedTime}"`);
                    }
                }
            }
        }
    });
}

// ============================================
// FUNCIÓN PARA PARSEAR CADENAS DE TIEMPO
// ============================================

function parseTimeString(timeStr) {
    if (!timeStr) return 0;
    
    // Quitar espacios
    timeStr = timeStr.toString().trim();
    
    // Intentar diferentes formatos
    
    // Formato "01:00" (minutos:segundos)
    if (/^\d{1,3}:\d{2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return (minutes * 60) + seconds;
    }
    
    // Formato "1:00:00" (horas:minutos:segundos)
    if (/^\d{1,3}:\d{2}:\d{2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    // Si es solo un número, asumir minutos
    if (/^\d+$/.test(timeStr)) {
        const minutes = parseInt(timeStr) || 0;
        return minutes * 60;
    }
    
    return 0;
}

function createExcelTemplate(numCorredores, intervalo, horaInicio) {
    const t = translations[appState.currentLanguage];
    
    // Convertir a segundos para cálculos
    const intervaloSeconds = timeToSeconds(intervalo);
    const horaInicioSeconds = timeToSeconds(horaInicio);
    
    // Crear encabezados
    const headers = [
        'Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Diferencia', 'Nombre', 'Apellidos', 'Chip', 
        'Hora Salida Real', 'Crono Salida Real', 
        'Hora Salida Prevista', 'Crono Salida Prevista', 
        'Hora Salida Importado', 'Crono Salida Importado', 
        'Crono Segundos', 'Hora Segundos',
        'Crono Salida Real Segundos', 'Hora Salida Real Segundos'
    ];
    
    // Crear los datos
    const data = [headers];
    
    for (let i = 1; i <= numCorredores; i++) {
        const row = new Array(headers.length).fill('');
        const excelRow = i + 1;
        
        // Orden (A)
        row[0] = i;
        
        // Dorsal (B) - VACÍO
        row[1] = '';  // <-- Cambiado: Vacío en lugar de número
        
        // Crono Salida (C) - FÓRMULA: =SI(A2=1,0,C1+E2)
        if (i === 1) {
            row[2] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[2] = { 
                t: 'n', 
                f: `IF(${XLSX.utils.encode_col(0)}${excelRow}=1,0,${XLSX.utils.encode_col(2)}${excelRow-1}+${XLSX.utils.encode_col(4)}${excelRow})`,
                z: 'hh:mm:ss' 
            };
        }
        
        // Hora Salida (D) - FÓRMULA: =SI(A2=1,hora_inicio,D1+E2)
        if (i === 1) {
            const horaExcel = horaInicioSeconds / 86400;
            row[3] = { t: 'n', v: horaExcel, z: 'hh:mm:ss' };
        } else {
            row[3] = { 
                t: 'n', 
                f: `IF(${XLSX.utils.encode_col(0)}${excelRow}=1,${horaInicioSeconds/86400},${XLSX.utils.encode_col(3)}${excelRow-1}+${XLSX.utils.encode_col(4)}${excelRow})`,
                z: 'hh:mm:ss' 
            };
        }
        
        // Diferencia (E) - VALOR: intervalo (en formato tiempo Excel)
        if (i === 1) {
            row[4] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[4] = { t: 'n', v: intervaloSeconds / 86400, z: 'hh:mm:ss' };
        }
        
        // Nombre, Apellidos, Chip (F, G, H) - VACÍOS
        row[5] = '';
        row[6] = '';
        row[7] = '';
        
        // Hora Salida Real (I) - VACÍO (para llenar manualmente)
        row[8] = '';
        
        // Crono Salida Real (J) - VACÍO (para llenar manualmente)
        row[9] = '';
        
        // Hora Salida Prevista (K) - VACÍO (para llenar manualmente)
        row[10] = '';
        
        // Crono Salida Prevista (L) - VACÍO (para llenar manualmente)
        row[11] = '';
        
        // Hora Salida Importado (M) - VACÍO
        row[12] = '';
        
        // Crono Salida Importado (N) - VACÍO
        row[13] = '';
        
        // Crono Segundos (O) - FÓRMULA: =HORA(C2)*3600+MINUTO(C2)*60+SEGUNDO(C2)
        row[14] = { 
            t: 'n', 
            f: `HOUR(${XLSX.utils.encode_col(2)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(2)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(2)}${excelRow})`
        };
        
        // Hora Segundos (P) - FÓRMULA: =HORA(D2)*3600+MINUTO(D2)*60+SEGUNDO(D2)
        row[15] = { 
            t: 'n', 
            f: `HOUR(${XLSX.utils.encode_col(3)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(3)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(3)}${excelRow})`
        };
        
        // Crono Salida Real Segundos (Q) - FÓRMULA: =SI(J2="",0,HORA(J2)*3600+MINUTO(J2)*60+SEGUNDO(J2))
        row[16] = { 
            t: 'n', 
            f: `IF(${XLSX.utils.encode_col(9)}${excelRow}="",0,HOUR(${XLSX.utils.encode_col(9)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(9)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(9)}${excelRow}))`
        };
        
        // Hora Salida Real Segundos (R) - FÓRMULA: =SI(I2="",0,HORA(I2)*3600+MINUTO(I2)*60+SEGUNDO(I2))
        row[17] = { 
            t: 'n', 
            f: `IF(${XLSX.utils.encode_col(8)}${excelRow}="",0,HOUR(${XLSX.utils.encode_col(8)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(8)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(8)}${excelRow}))`
        };
        
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
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 12}, {wch: 12}, {wch: 10}, {wch: 10}
    ];
    ws['!cols'] = colWidths;
    
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
}

// Función auxiliar para convertir tiempo a segundos (debe existir)
function timeToSeconds(timeStr) {
    if (!timeStr) return 0;
    
    // Asegurar formato HH:MM:SS
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        return parseInt(timeStr) || 0;
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

// Función auxiliar para convertir tiempo a valor de Excel
function timeToExcelValue(timeStr) {
    // En Excel, 1 = 24 horas, 1/24 = 1 hora, 1/1440 = 1 minuto, 1/86400 = 1 segundo
    const totalSeconds = timeToSeconds(timeStr);
    return totalSeconds / 86400; // 86400 segundos en un día
}

function importStartOrder() {
    const t = translations[appState.currentLanguage];
    
    // Verificar si ya hay datos en la tabla
    if (startOrderData && startOrderData.length > 0) {
        // Mostrar modal de confirmación
        showImportConfirmationModal();
        return;
    }
    
    // Si no hay datos, proceder directamente
    proceedWithImport();
}

function showImportConfirmationModal() {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.id = 'import-confirmation-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> ${t.importWarningTitle || '¡Atención!'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="warning-message">
                    <div class="warning-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="warning-text">
                        <p><strong>${t.importWarning || 'Los datos actuales se borrarán'}</strong></p>
                        <p>${t.importWarningDetails || 'Actualmente tienes'} <span class="rider-count">${startOrderData.length}</span> ${t.importWarningRiders || 'corredores en la tabla'}.</p>
                        <p>${t.importWarningQuestion || '¿Estás seguro de que quieres continuar con la importación?'}</p>
                    </div>
                </div>
                
                <div class="data-preview">
                    <h4><i class="fas fa-list"></i> ${t.currentDataPreview || 'Vista previa de datos actuales'}</h4>
                    <div class="preview-table-container">
                        <table class="preview-table">
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Dorsal</th>
                                    <th>Nombre</th>
                                    <th>Hora Salida</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getCurrentDataPreview()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-import-btn">
                    <i class="fas fa-file-import"></i>
                    ${t.confirmImport || 'Sí, importar y reemplazar'}
                </button>
                <button class="btn btn-danger" id="cancel-import-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelImport || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupImportConfirmationModalEvents(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Añadir estilos si no existen
    addImportConfirmationStyles();
}

function getCurrentDataPreview() {
    // Mostrar solo los primeros 5 corredores como vista previa
    const previewCount = Math.min(5, startOrderData.length);
    let html = '';
    
    for (let i = 0; i < previewCount; i++) {
        const rider = startOrderData[i];
        html += `
        <tr>
            <td>${rider.order}</td>
            <td>${rider.dorsal}</td>
            <td>${rider.nombre || ''} ${rider.apellidos || ''}</td>
            <td>${rider.horaSalida || '00:00:00'}</td>
        </tr>
        `;
    }
    
    if (startOrderData.length > 5) {
        html += `
        <tr>
            <td colspan="4" class="preview-more">
                <i class="fas fa-ellipsis-h"></i>
                ${startOrderData.length - 5} ${translations[appState.currentLanguage].moreRiders || 'más corredores...'}
            </td>
        </tr>
        `;
    }
    
    return html;
}

function setupImportConfirmationModalEvents(modal) {
    const confirmBtn = modal.querySelector('#confirm-import-btn');
    const cancelBtn = modal.querySelector('#cancel-import-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar importación
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        // Proceder con la importación
        setTimeout(proceedWithImport, 50);
    });
    
    // Cancelar importación
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.importCancelled || 'Importación cancelada', 'info');
    });
    
    // Cerrar con la X
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
        }
    });
    
    // Prevenir que el evento se propague al contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

function proceedWithImport() {
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
                
                // Procesar los datos
                processImportedOrderData(jsonData);
                
                // Mostrar mensaje de éxito con detalles
                const message = t.orderImported 
                    ? t.orderImported.replace('{count}', startOrderData.length)
                    : `Se importaron ${startOrderData.length} corredores correctamente`;
                
                showMessage(message, 'success');
                
            } catch (error) {
                console.error('Error importing file:', error);
                showMessage(t.importError, 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };
    
    input.click();
}

function addImportConfirmationStyles() {
    if (document.getElementById('import-confirmation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'import-confirmation-styles';
    style.textContent = `
        #import-confirmation-modal .modal-content {
            max-width: 700px;
        }
        
        .warning-message {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
            margin-bottom: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .warning-icon {
            font-size: 2rem;
            color: #f39c12;
        }
        
        .warning-text {
            flex: 1;
        }
        
        .warning-text p {
            margin: 5px 0;
        }
        
        .warning-text strong {
            font-size: 1.1rem;
        }
        
        .rider-count {
            font-weight: 700;
            color: var(--danger);
            font-size: 1.2rem;
        }
        
        .data-preview {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .data-preview h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .preview-table-container {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            border-radius: var(--border-radius);
            background: white;
        }
        
        .preview-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .preview-table th {
            background: #e9ecef;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: var(--gray-dark);
            position: sticky;
            top: 0;
            border-bottom: 2px solid #dee2e6;
        }
        
        .preview-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .preview-table tr:last-child td {
            border-bottom: none;
        }
        
        .preview-more {
            text-align: center;
            font-style: italic;
            color: var(--gray);
            background: #f8f9fa;
        }
        
        .preview-more i {
            margin-right: 5px;
        }
        
        /* Scrollbar personalizada */
        .preview-table-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .preview-table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    
    document.head.appendChild(style);
}



function createRiderFromRow(row, columnIndexes, index) {
    // Función helper para obtener valores con manejo de tipos de Excel
    const getExcelValue = (columnName, defaultValue = '') => {
        const colIndex = columnIndexes[columnName];
        if (colIndex === undefined || colIndex >= row.length) {
            return defaultValue;
        }
        
        const value = row[colIndex];
        
        // Si es undefined, null o vacío, devolver valor por defecto
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        
        // Si es un objeto de Excel (como {t: 'n', v: 0.5}), extraer el valor
        if (typeof value === 'object' && value !== null && value.t === 'n') {
            return value.v; // Valor numérico de Excel
        }
        
        // Si es un número, manejarlo como tiempo de Excel si es menor que 1
        if (typeof value === 'number') {
            if (value < 1 && value > 0) {
                // Es un tiempo de Excel, convertirlo a string HH:MM:SS
                const seconds = Math.round(value * 86400);
                return secondsToTime(seconds);
            } else if (columnName.includes('Segundos') || columnName === 'Diferencia') {
                // Es una columna de segundos o diferencia, devolver como número
                return value;
            } else {
                // Para otros números, convertir a string
                return String(value);
            }
        }
        
        // Para cualquier otro caso, convertir a string
        return String(value).trim();
    };
    
    // Leer la hora de salida del Excel - priorizar "Hora Salida"
    let horaSalidaExcel = getExcelValue('Hora Salida', '');
    
    // Si no hay "Hora Salida", intentar con "Hora Salida Importado"
    if (!horaSalidaExcel || horaSalidaExcel === '') {
        horaSalidaExcel = getExcelValue('Hora Salida Importado', '');
    }
    
    // Si sigue vacío, usar valor por defecto basado en el orden
    if (!horaSalidaExcel || horaSalidaExcel === '') {
        // Calcular hora basada en posición (9:00:00 + (index-1)*60 segundos)
        const baseSeconds = 9 * 3600; // 9:00:00 en segundos
        const positionSeconds = (index) * 60; // 1 minuto por posición
        horaSalidaExcel = secondsToTime(baseSeconds + positionSeconds);
    }
    
    // Asegurar formato HH:MM:SS
    horaSalidaExcel = formatTimeValue(horaSalidaExcel);
    
    // Continuar con el resto de la lógica...
    const cronoSalidaExcel = getExcelValue('Crono Salida', '00:00:00');
    const diferenciaExcel = getExcelValue('Diferencia', '00:00:00');
    // ... resto del código ...
    
    const rider = {
        order: parseInt(getExcelValue('Orden', index + 1)) || (index + 1),
        dorsal: parseInt(getExcelValue('Dorsal', index + 1)) || (index + 1),
        
        // Campos principales - usar la hora procesada
        cronoSalida: formatTimeValue(cronoSalidaExcel),
        horaSalida: horaSalidaExcel, // ✅ Usar la hora procesada
        diferencia: formatTimeValue(diferenciaExcel),
        
        // ... resto del código ...
    };
    
    return rider;
}
function applyImportRules(rider, index) {
    // 1. Guardar los datos importados en los campos "Importado"
    if (rider.horaSalida && rider.horaSalida !== '00:00:00' && rider.horaSalida !== '') {
        rider.horaSalidaImportado = rider.horaSalida;
    }
    if (rider.cronoSalida && rider.cronoSalida !== '00:00:00' && rider.cronoSalida !== '') {
        rider.cronoSalidaImportado = rider.cronoSalida;
    }
    if (rider.diferencia && rider.diferencia !== '00:00:00' && rider.diferencia !== '') {
        // La diferencia se mantiene como está, no necesita campo "importado" especial
    }
    
    // 2. Campos reales deben estar VACÍOS inicialmente (a menos que vengan del Excel)
    if (!rider.horaSalidaReal || rider.horaSalidaReal === '') {
        rider.horaSalidaReal = '';
        rider.horaSalidaRealSegundos = 0;
    }
    if (!rider.cronoSalidaReal || rider.cronoSalidaReal === '') {
        rider.cronoSalidaReal = '';
        rider.cronoSalidaRealSegundos = 0;
    }
    
    // 3. Si faltan valores críticos en los campos principales, calcularlos
    if (!rider.horaSalida || rider.horaSalida === '00:00:00' || rider.horaSalida === '') {
        rider.horaSalida = calculateStartTime(index);
    }
    if (!rider.cronoSalida || rider.cronoSalida === '00:00:00' || rider.cronoSalida === '') {
        rider.cronoSalida = secondsToTime(index * 60);
    }
    
    // 4. Calcular diferencia si no existe
    if ((!rider.diferencia || rider.diferencia === '' || rider.diferencia === '00:00:00') &&
        rider.horaSalidaReal && rider.horaSalidaReal !== '' &&
        rider.horaSalida && rider.horaSalida !== '') {
        
        const horaRealSegs = timeToSeconds(rider.horaSalidaReal);
        const horaPrevistaSegs = timeToSeconds(rider.horaSalida);
        
        if (horaRealSegs > 0 && horaPrevistaSegs > 0) {
            const diffSegundos = horaRealSegs - horaPrevistaSegs;
            rider.diferencia = secondsToTime(Math.abs(diffSegundos)) + 
                              (diffSegundos > 0 ? ' (+)' : diffSegundos < 0 ? ' (-)' : '');
            rider.diferenciaSegundos = diffSegundos;
        }
    }
    
    // 5. Campos previstas se llenan con los valores principales si están vacíos
    if (!rider.horaSalidaPrevista || rider.horaSalidaPrevista === '00:00:00' || rider.horaSalidaPrevista === '') {
        rider.horaSalidaPrevista = rider.horaSalida;
    }
    if (!rider.cronoSalidaPrevista || rider.cronoSalidaPrevista === '00:00:00' || rider.cronoSalidaPrevista === '') {
        rider.cronoSalidaPrevista = rider.cronoSalida;
    }
    
    // 6. Calcular segundos de los campos principales si faltan
    if (!rider.cronoSegundos || rider.cronoSegundos === 0) {
        rider.cronoSegundos = timeToSeconds(rider.cronoSalida);
    }
    if (!rider.horaSegundos || rider.horaSegundos === 0) {
        rider.horaSegundos = timeToSeconds(rider.horaSalida);
    }
    if (!rider.diferenciaSegundos && rider.diferencia && rider.diferencia !== '') {
        // Extraer segundos de la diferencia (formato: "00:01:00 (+)")
        const diffMatch = rider.diferencia.match(/(\d{2}:\d{2}:\d{2})/);
        if (diffMatch) {
            rider.diferenciaSegundos = timeToSeconds(diffMatch[1]);
            // Aplicar signo
            if (rider.diferencia.includes('(-)')) {
                rider.diferenciaSegundos = -Math.abs(rider.diferenciaSegundos);
            } else if (rider.diferencia.includes('(+)')) {
                rider.diferenciaSegundos = Math.abs(rider.diferenciaSegundos);
            }
        }
    }
    
    // 7. Asegurar que los campos importados están bien formateados
    if (rider.horaSalidaImportado && rider.horaSalidaImportado !== '') {
        rider.horaSalidaImportado = formatTimeValue(rider.horaSalidaImportado);
    } else {
        rider.horaSalidaImportado = '';
    }
    
    if (rider.cronoSalidaImportado && rider.cronoSalidaImportado !== '') {
        rider.cronoSalidaImportado = formatTimeValue(rider.cronoSalidaImportado);
    } else {
        rider.cronoSalidaImportado = '';
    }
}

function updateStartOrderUI() {
    console.log("=== updateStartOrderUI llamada ===");
    console.log("startOrderData.length:", startOrderData.length);
    
    // ✅ Actualizar hora de inicio en el input SOLO si hay datos
    const startTimeInput = document.getElementById('first-start-time');
    if (startTimeInput && startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        if (primerCorredor.horaSalida && primerCorredor.horaSalida !== '00:00:00') {
            // Asegurar formato HH:MM:SS
            let horaFormateada = primerCorredor.horaSalida;
            if (horaFormateada.length === 5) {
                horaFormateada += ':00';
            }
            startTimeInput.value = horaFormateada;
            console.log("Hora de inicio actualizada desde primer corredor:", horaFormateada);
        }
    }
    
    // Actualizar display del próximo corredor
    updateNextCorredorDisplay();
    
    // Renderizar la tabla
    console.log("Llamando a updateStartOrderTable...");
    
    // ✅ RESTAURAR: Usar la versión throttled normal
    updateStartOrderTableThrottled();
    
    console.log("=== updateStartOrderUI completada ===");
}

function updateStartOrderTable() {
    // Control de logs - activar solo en desarrollo
    const DEBUG_MODE = false;
    
    if (DEBUG_MODE) {
        console.log("=== updateStartOrderTable llamada ===");
    }
    
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    const tableBody = document.getElementById('start-order-table-body');
    const emptyState = document.getElementById('start-order-empty');
    
    if (!tableBody || !emptyState) {
        console.error("Elementos de tabla no encontrados!");
        return;
    }
    
    if (startOrderData.length === 0) {
        if (DEBUG_MODE) console.log("No hay datos, mostrando estado vacío");
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        if (tableWrapper) tableWrapper.style.display = 'none';
        return;
    }
    
    if (DEBUG_MODE) {
        console.log(`Hay ${startOrderData.length} corredores para mostrar`);
    }
    
    emptyState.style.display = 'none';
    if (tableWrapper) tableWrapper.style.display = 'block';
    
    // Ordenar datos según el estado de ordenación
    const sortedData = sortStartOrderData([...startOrderData]);
    
    let html = '';
    let processedRiders = 0;
    let errorsCount = 0;
    
    // Procesar todos los corredores
    sortedData.forEach((rider, index) => {
        processedRiders++;
        
        // Determinar si es el primer corredor
        const isFirstRider = rider.order === 1;
        
        // Calcular diferencia (si hay datos reales y previstos O si hay diferencia importada)
        let diferenciaHtml = '';
        let diferenciaClass = 'cero';
        let diferenciaValue = '';
        let diferenciaSign = '';
        let isDiferenciaEditable = !isFirstRider; // No editable para primer corredor
        
        // Primero verificar si hay diferencia importada o calculada
        if (rider.diferencia && rider.diferencia !== '' && rider.diferencia !== '00:00:00') {
            // Ya tiene diferencia asignada
            let valorLimpio = rider.diferencia;
            
            if (rider.diferencia.includes('(+)')) {
                diferenciaClass = 'positiva';
                diferenciaSign = ' (+)';
                valorLimpio = rider.diferencia.replace('(+)', '').trim();
            } else if (rider.diferencia.includes('(-)')) {
                diferenciaClass = 'negativa';
                diferenciaSign = ' (-)';
                valorLimpio = rider.diferencia.replace('(-)', '').trim();
            } else if (rider.diferencia.includes('+')) {
                diferenciaClass = 'positiva';
                diferenciaSign = ' (+)';
                valorLimpio = rider.diferencia.replace('+', '').trim();
            } else if (rider.diferencia.includes('-')) {
                diferenciaClass = 'negativa';
                diferenciaSign = ' (-)';
                valorLimpio = rider.diferencia.replace('-', '').trim();
            }
            
            diferenciaValue = valorLimpio;
            diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${valorLimpio}${diferenciaSign}</span>`;
            
            // Si no es el primer corredor, hacer editable
            if (!isFirstRider) {
                isDiferenciaEditable = true;
            }
        } else {
            // Calcular diferencia (si hay datos reales y previstos)
            const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
            const horaPrevistaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
            
            // CASO ESPECIAL: Para el segundo corredor cuando se añade uno en primera posición
            if (rider.order === 2 && startOrderData.length > 1) {
                const primerCorredor = startOrderData.find(r => r.order === 1);
                
                // Si el corredor no tiene diferencia, asignar una por defecto
                if ((!rider.diferencia || rider.diferencia === '' || rider.diferencia === '00:00:00' || rider.diferencia.includes('--:--:--')) && 
                    primerCorredor && primerCorredor.diferencia === '00:00:00') {
                    
                    // Asignar diferencia por defecto para el segundo corredor
                    diferenciaValue = '00:01:00';
                    diferenciaSign = ' (+)';
                    diferenciaClass = 'positiva';
                    diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                    
                    // Actualizar los datos del corredor
                    rider.diferencia = diferenciaValue + diferenciaSign;
                    rider.diferenciaSegundos = 60;
                    isDiferenciaEditable = true;
                    
                    if (DEBUG_MODE) {
                        console.log('Segundo corredor - Diferencia establecida por defecto:', rider.diferencia);
                    }
                } else if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
                    // Calcular diferencia real
                    const diferencia = horaRealSegundos - horaPrevistaSegundos;
                    if (diferencia !== 0) {
                        const diferenciaAbs = Math.abs(diferencia);
                        diferenciaSign = diferencia > 0 ? ' (+)' : ' (-)';
                        diferenciaClass = diferencia > 0 ? 'positiva' : 'negativa';
                        diferenciaValue = secondsToTime(diferenciaAbs);
                        diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                        isDiferenciaEditable = true;
                    } else {
                        diferenciaValue = '00:00:00';
                        diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                        if (isFirstRider) {
                            isDiferenciaEditable = false;
                        }
                    }
                } else {
                    diferenciaHtml = `<span class="diferencia vacia editable" data-value="">--:--:--</span>`;
                    isDiferenciaEditable = true;
                }
            } else if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
                const diferencia = horaRealSegundos - horaPrevistaSegundos;
                if (diferencia !== 0) {
                    const diferenciaAbs = Math.abs(diferencia);
                    diferenciaSign = diferencia > 0 ? ' (+)' : ' (-)';
                    diferenciaClass = diferencia > 0 ? 'positiva' : 'negativa';
                    diferenciaValue = secondsToTime(diferenciaAbs);
                    diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                    isDiferenciaEditable = true;
                } else {
                    diferenciaValue = '00:00:00';
                    diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                    if (isFirstRider) {
                        isDiferenciaEditable = false;
                    }
                }
            } else {
                if (isFirstRider) {
                    // Primer corredor - siempre 00:00:00
                    diferenciaValue = '00:00:00';
                    diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                    isDiferenciaEditable = false;
                } else {
                    // Otro corredor sin datos - mostrar vacío y editable
                    diferenciaHtml = `<span class="diferencia vacia editable" data-value="">--:--:--</span>`;
                    isDiferenciaEditable = true;
                }
            }
        }
        
        // Verificar datos críticos (solo en debug)
        if (DEBUG_MODE && (!rider.horaSalida || !rider.cronoSalida)) {
            console.warn(`Corredor ${index + 1} (dorsal ${rider.dorsal}) tiene datos incompletos:`, {
                horaSalida: rider.horaSalida,
                cronoSalida: rider.cronoSalida
            });
            errorsCount++;
        }
        
        // Formatear campos importados - si están vacíos, mostrar vacío
        const horaImportadoDisplay = rider.horaSalidaImportado || '';
        const cronoImportadoDisplay = rider.cronoSalidaImportado || '';
        
        // Generar HTML de la fila con campos editables/no editables
        html += `
        <tr data-index="${getOriginalIndex(rider.order, rider.dorsal)}">
            <!-- ORDEN - NO EDITABLE -->
            <td class="number-cell not-editable" data-field="order">${rider.order || ''}</td>
            
            <!-- DORSAL - EDITABLE -->
            <td class="number-cell editable" data-field="dorsal">${rider.dorsal || ''}</td>
            
            <!-- CRONO SALIDA - NO EDITABLE -->
            <td class="time-cell sortable not-editable" data-sort="cronoSalida">${rider.cronoSalida || '00:00:00'}</td>
            
            <!-- HORA SALIDA - NO EDITABLE -->
            <td class="time-cell sortable not-editable" data-sort="horaSalida">${rider.horaSalida || '00:00:00'}</td>
            
            <!-- DIFERENCIA - EDITABLE (excepto primer corredor) -->
            <td class="diferencia-cell sortable ${isDiferenciaEditable ? 'editable' : 'not-editable'}" 
                data-field="diferencia" 
                data-sort="diferencia"
                data-is-first="${isFirstRider}"
                data-original-value="${diferenciaValue}">
                ${diferenciaHtml}
            </td>
            
            <!-- NOMBRE - EDITABLE -->
            <td class="name-cell editable" data-field="nombre">${escapeHtml(rider.nombre || '')}</td>
            
            <!-- APELLIDOS - EDITABLE -->
            <td class="name-cell editable" data-field="apellidos">${escapeHtml(rider.apellidos || '')}</td>
            
            <!-- CHIP - EDITABLE -->
            <td class="editable" data-field="chip">${escapeHtml(rider.chip || '')}</td>
            
            <!-- RESTANTE DE CAMPOS - NO EDITABLES -->
            <td class="time-cell not-editable">${rider.horaSalidaReal || ''}</td>
            <td class="time-cell not-editable">${rider.cronoSalidaReal || ''}</td>
            <td class="time-cell sortable not-editable" data-sort="horaSalidaPrevista">${rider.horaSalidaPrevista || rider.horaSalida || '00:00:00'}</td>
            <td class="time-cell sortable not-editable" data-sort="cronoSalidaPrevista">${rider.cronoSalidaPrevista || rider.cronoSalida || '00:00:00'}</td>
            
            <!-- CAMPOS IMPORTADOS - SIEMPRE VACÍOS PARA NUEVOS CORREDORES -->
            <td class="time-cell not-editable importado-cell">
                ${horaImportadoDisplay}
            </td>
            <td class="time-cell not-editable importado-cell">
                ${cronoImportadoDisplay}
            </td>
            
            <td class="number-cell sortable not-editable" data-sort="cronoSegundos">${rider.cronoSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="horaSegundos">${rider.horaSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="cronoSalidaRealSegundos">${rider.cronoSalidaRealSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="horaSalidaRealSegundos">${rider.horaSalidaRealSegundos || 0}</td>
        </tr>
        `;
    });
    
    // Insertar HTML (forma más eficiente)
    if (html) {
        tableBody.innerHTML = html;
        
        // Usar event delegation en lugar de listeners individuales
        setupEventDelegation();
        
        // Actualizar indicadores de ordenación
        updateStartOrderSortIndicators();
        
        // Añadir estilos de filas alternas
        addAlternatingRowStyles();
        
        // Añadir estilos para celdas importadas vacías
        addImportadoCellStyles();
    }
    
    if (DEBUG_MODE) {
        console.log("=== updateStartOrderTable completada ===");
        console.log(`Procesados: ${processedRiders} corredores`);
        console.log(`Errores: ${errorsCount}`);
        console.log(`Celdas en tabla: ${tableBody.children.length}`);
    }
}

// Función auxiliar para añadir estilos a celdas importadas
function addImportadoCellStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('importado-cell-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'importado-cell-styles';
    style.textContent = `
        .importado-cell {
            font-style: italic;
            color: #adb5bd;
        }
        
        .importado-cell:empty::before {
            content: "--";
            color: #adb5bd;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// VARIABLES GLOBALES PARA THROTTLING
// ============================================

// Variables para throttling de updateStartOrderTable
let updateStartOrderTablePending = false;
let updateStartOrderTableTimeout = null;
let lastUpdateTime = 0; // <-- AÑADIR ESTA LÍNEA

const UPDATE_THROTTLE_DELAY = 50; // 50ms mínimo entre actualizaciones

// ============================================
// VERSIÓN THROTTLED DE updateStartOrderTable
// ============================================
function updateStartOrderTableThrottled(force = false) {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime;
    
    // Si es forzada o ha pasado suficiente tiempo, ejecutar inmediatamente
    if (force || timeSinceLastUpdate > UPDATE_THROTTLE_DELAY || !lastUpdateTime) {
        console.log("updateStartOrderTable: Ejecución inmediata (force o tiempo suficiente)");
        
        // Limpiar timeout anterior si existe
        if (updateStartOrderTableTimeout) {
            clearTimeout(updateStartOrderTableTimeout);
            updateStartOrderTableTimeout = null;
        }
        
        // Resetear estado
        updateStartOrderTablePending = false;
        
        // Ejecutar directamente
        updateStartOrderTable();
        lastUpdateTime = now;
        return;
    }
    
    // Si ya hay una actualización pendiente, solo registrar
    if (updateStartOrderTablePending) {
        console.log("updateStartOrderTable: Actualización ya programada, omitiendo llamada extra");
        return;
    }
    
    // Marcar como pendiente
    updateStartOrderTablePending = true;
    console.log("updateStartOrderTable: Programando ejecución en", UPDATE_THROTTLE_DELAY, "ms");
    
    // Programar la ejecución
    updateStartOrderTableTimeout = setTimeout(() => {
        console.log("updateStartOrderTable: Ejecutando versión throttled...");
        
        try {
            updateStartOrderTable();
            lastUpdateTime = Date.now();
        } catch (error) {
            console.error("Error en updateStartOrderTableThrottled:", error);
        }
        
        // Resetear estado
        updateStartOrderTablePending = false;
        updateStartOrderTableTimeout = null;
        
    }, UPDATE_THROTTLE_DELAY);
}


// ============================================
// FUNCIÓN PARA EJECUCIÓN CRÍTICA
// ============================================

function updateStartOrderTableCritical() {
    console.log("updateStartOrderTableCritical: Ejecución CRÍTICA");
    
    // Cancelar cualquier ejecución pendiente
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    
    // Ejecutar inmediatamente
    updateStartOrderTable();
    lastUpdateOrderTableTime = Date.now();
    updateStartOrderTablePending = false;
}

// ============================================
// FUNCIÓN PARA EJECUCIÓN CRÍTICA
// ============================================

function updateStartOrderTableCritical() {
    console.log("updateStartOrderTable: Ejecución CRÍTICA (inmediata)");
    
    // Cancelar cualquier ejecución pendiente
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    
    // Ejecutar inmediatamente
    updateStartOrderTable();
    lastUpdateTime = Date.now();
    updateStartOrderTablePending = false;
}

// ============================================
// FUNCIÓN DE FUERZA (para casos críticos)
// ============================================

function updateStartOrderTableImmediate() {
    console.log("updateStartOrderTableImmediate: Ejecución inmediata forzada");
    
    // Limpiar timeout si existe
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    
    // Resetear estado de throttling
    updateStartOrderTablePending = false;
    lastUpdateTime = 0;
    
    // Ejecutar inmediatamente
    try {
        updateStartOrderTable();
    } catch (error) {
        console.error("Error en updateStartOrderTableImmediate:", error);
        // Intentar de nuevo con un pequeño delay
        setTimeout(() => {
            updateStartOrderTable();
        }, 50);
    }
}

// ===========================================
// FUNCIONES AUXILIARES OPTIMIZADAS
// ===========================================

// Event delegation para manejar clics en celdas editables
function setupEventDelegation() {
    const tableBody = document.getElementById('start-order-table-body');
    if (!tableBody) return;
    
    // Eliminar listeners anteriores para evitar duplicados
    tableBody.removeEventListener('click', handleTableClick);
    
    // Añadir un solo listener para toda la tabla
    tableBody.addEventListener('click', handleTableClick);
}

// Handler único para todos los clics en la tabla
// ============================================
// FUNCIÓN handleTableClick CORREGIDA
// ============================================
function handleTableClick(event) {
    console.log("=== handleTableClick llamada ===");
    console.log("Elemento clicado:", event.target);
    console.log("Clase del elemento:", event.target.className);
    console.log("Tag del elemento:", event.target.tagName);
    
    const t = translations[appState.currentLanguage];
    
    // 1. Verificar si es un clic en un span de diferencia
    const target = event.target;
    
    // Si es un span con clase 'diferencia'
    if (target.classList && target.classList.contains('diferencia')) {
        console.log("Clic en elemento con clase 'diferencia'");
        
        // Obtener la celda padre
        const cell = target.closest('td');
        if (!cell) {
            console.error("No se encontró la celda padre");
            return;
        }
        
        console.log("Celda encontrada:", cell);
        console.log("¿Celda es editable?", cell.classList.contains('editable'));
        
        // Verificar si la celda padre es editable
        if (cell.classList.contains('editable')) {
            console.log("Celda padre es editable, procediendo...");
            
            if (cell.classList.contains('editing')) {
                console.log("Ya está en edición, saliendo");
                return;
            }
            
            const row = cell.closest('tr');
            if (!row) {
                console.error("No se encontró la fila padre");
                return;
            }
            
            const index = parseInt(row.getAttribute('data-index'));
            console.log("Índice del corredor:", index);
            
            const isFirstRider = cell.getAttribute('data-is-first') === 'true';
            console.log("Es primer corredor?", isFirstRider);
            
            // Si es el primer corredor, no permitir edición
            if (isFirstRider) {
                console.log("Primer corredor - no editable");
                showMessage(t.firstRiderNoDifference || 'El primer corredor no puede tener diferencia', 'info');
                return;
            }
            
            // Obtener valor actual
            let currentValue = target.getAttribute('data-value') || '';
            console.log("Valor actual (data-value):", currentValue);
            
            if (currentValue === '--:--:--' || currentValue === '') {
                currentValue = '';
                console.log("Valor limpiado a vacío");
            } else {
                // Limpiar signos si existen
                currentValue = currentValue.replace(/ \([+-]\)/g, '').trim();
                console.log("Valor después de limpiar signos:", currentValue);
            }
            
            // Iniciar edición
            console.log("Iniciando edición con valor:", currentValue);
            startDiferenciaEditing(cell, index, currentValue);
            return;
        }
    }
    
    // 2. Verificar si es un clic en una celda editable
    const cell = event.target.closest('.editable');
    console.log("Celda editable encontrada?", cell);
    
    if (!cell) {
        console.log("No es una celda editable, saliendo");
        return;
    }
    
    console.log("Celda encontrada:", cell);
    console.log("Celda tiene clase editing?", cell.classList.contains('editing'));
    
    if (cell.classList.contains('editing')) {
        console.log("Ya está en edición, saliendo");
        return;
    }
    
    event.stopPropagation();
    
    const field = cell.getAttribute('data-field');
    console.log("Campo de la celda:", field);
    
    const allowedFields = ['dorsal', 'nombre', 'apellidos', 'chip'];
    
    // Solo permitir edición de campos específicos (excluyendo diferencia que ya manejamos)
    if (!allowedFields.includes(field)) {
        console.log("Campo no permitido para edición:", field);
        return;
    }
    
    console.log("Campo permitido, procediendo...");
    
    const row = cell.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));
    console.log("Índice del corredor:", index);
    
    // Comenzar edición normal
    console.log("Iniciando edición normal para campo:", field);
    startCellEditing(cell, index, field);
}

// ============================================
// FUNCIÓN startDiferenciaEditing SIMPLIFICADA
// ============================================
function startDiferenciaEditing(cell, index, currentValue) {
    console.log("=== startDiferenciaEditing llamada ===");
    console.log("Celda:", cell);
    console.log("Índice:", index);
    console.log("Valor actual:", currentValue);
    
    const originalHTML = cell.innerHTML;
    console.log("HTML original guardado");
    
    // Crear input simple para edición directa
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'diferencia-input';
    input.placeholder = 'MM:SS o HH:MM:SS';
    input.style.cssText = 'width: 100%; height: 100%; padding: 4px 8px; border: 2px solid #4dabf7; border-radius: 4px; font-family: "Courier New", monospace; font-size: 14px; box-sizing: border-box;';
    console.log("Input creado con valor:", currentValue);
    
    // Reemplazar contenido de la celda
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    console.log("Celda actualizada con modo edición");
    
    // Enfocar el input y seleccionar todo el texto
    setTimeout(() => {
        input.focus();
        input.select();
        console.log("Input enfocado y seleccionado");
    }, 10);
    
    // Función para guardar la diferencia
    const guardarDiferencia = () => {
        console.log("=== guardarDiferencia llamada ===");
        
        let valor = input.value.trim();
        console.log("Valor del input:", valor);
        
        // Si el input está vacío, establecer diferencia a 0
        if (valor === '' || valor === '00:00:00' || valor === '0') {
            valor = '00:00:00';
            console.log("Valor vacío, establecido a 00:00:00");
        }
        
        // Si hay valor, validarlo
        if (valor && valor !== '00:00:00') {
            console.log("Validando valor:", valor);
            
            // Intentar parsear diferentes formatos
            let segundos = 0;
            
            // Formato "MM:SS"
            if (/^\d{1,3}:\d{2}$/.test(valor)) {
                const partes = valor.split(':');
                const minutos = parseInt(partes[0]) || 0;
                const segs = parseInt(partes[1]) || 0;
                segundos = (minutos * 60) + segs;
                console.log("Formato MM:SS detectado:", minutos, "min", segs, "seg ->", segundos, "segundos");
            }
            // Formato "HH:MM:SS"
            else if (/^\d{1,3}:\d{2}:\d{2}$/.test(valor)) {
                const partes = valor.split(':');
                const horas = parseInt(partes[0]) || 0;
                const minutos = parseInt(partes[1]) || 0;
                const segs = parseInt(partes[2]) || 0;
                segundos = (horas * 3600) + (minutos * 60) + segs;
                console.log("Formato HH:MM:SS detectado:", horas, "h", minutos, "min", segs, "seg ->", segundos, "segundos");
            }
            // Solo número (asumir segundos)
            else if (/^\d+$/.test(valor)) {
                segundos = parseInt(valor) || 0;
                console.log("Número detectado, interpretado como segundos:", segundos);
            } else {
                console.log("Formato no reconocido:", valor);
                showMessage('Formato inválido. Use MM:SS o HH:MM:SS', 'error');
                cell.classList.remove('editing');
                cell.innerHTML = originalHTML;
                return;
            }
            
            // Convertir segundos a formato HH:MM:SS
            const horas = Math.floor(segundos / 3600);
            const minutos = Math.floor((segundos % 3600) / 60);
            const segs = segundos % 60;
            valor = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
            console.log("Convertido a formato HH:MM:SS:", valor);
        }
        
        // Actualizar datos
        if (index >= 0 && index < startOrderData.length) {
            console.log("Actualizando corredor en índice:", index);
            const rider = startOrderData[index];
            
            // Determinar si es diferencia positiva o negativa
            // Por defecto será positiva (+), pero el usuario puede añadir manualmente signo
            let signo = '+';
            
            // Si el usuario escribió un signo, extraerlo
            const userInput = input.value.trim();
            if (userInput.startsWith('-') || userInput.includes('(-)')) {
                signo = '-';
                console.log("Signo negativo detectado");
            } else if (userInput.startsWith('+') || userInput.includes('(+)')) {
                signo = '+';
                console.log("Signo positivo detectado");
            }
            
            // Guardar diferencia
            if (valor === '00:00:00') {
                rider.diferencia = '00:00:00';
                rider.diferenciaSegundos = 0;
                console.log("Diferencia establecida a 00:00:00");
            } else {
                // Determinar texto a mostrar (con o sin signo)
                let textoDiferencia;
                if (userInput.includes('(+)') || userInput.includes('(-)')) {
                    // Si ya tiene signo en paréntesis, mantenerlo
                    textoDiferencia = valor + (signo === '+' ? ' (+)' : ' (-)');
                } else if (userInput.startsWith('+') || userInput.startsWith('-')) {
                    // Si tiene signo al inicio, convertirlo a formato con paréntesis
                    textoDiferencia = valor + (signo === '+' ? ' (+)' : ' (-)');
                } else {
                    // Por defecto, diferencia positiva
                    textoDiferencia = valor + ' (+)';
                }
                
                rider.diferencia = textoDiferencia;
                rider.diferenciaSegundos = timeToSeconds(valor) * (signo === '+' ? 1 : -1);
                console.log("Diferencia establecida:", rider.diferencia, "Segundos:", rider.diferenciaSegundos);
            }
            
            // Actualizar UI y guardar
            console.log("Actualizando UI...");
            updateStartOrderUI();
            if (typeof saveStartOrderData === 'function') {
                console.log("Guardando datos...");
                saveStartOrderData();
            }
            
            showMessage('Diferencia actualizada', 'success');
            console.log("Operación completada con éxito");
        } else {
            console.error("Índice fuera de rango:", index);
            cell.classList.remove('editing');
            cell.innerHTML = originalHTML;
        }
    };
    
    // Eventos del input
    input.addEventListener('keydown', (e) => {
        console.log("Tecla presionada en input:", e.key);
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log("Enter presionado - guardando");
            guardarDiferencia();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            console.log("Escape presionado - cancelando");
            cell.classList.remove('editing');
            cell.innerHTML = originalHTML;
        }
    });
    
    input.addEventListener('blur', () => {
        console.log("Input perdió el foco - guardando automáticamente");
        // Pequeño delay para manejar clics en otras celdas
        setTimeout(() => {
            if (cell.classList.contains('editing')) {
                guardarDiferencia();
            }
        }, 100);
    });
    
    console.log("=== startDiferenciaEditing completada ===");
}
// Función simplificada para edición normal de celdas
function startCellEditing(cell, index, field) {
    const originalValue = cell.textContent.trim();
    const input = document.createElement('input');
    
    // Configurar input según el campo
    if (field === 'dorsal') {
        input.type = 'number';
        input.min = '1';
    } else {
        input.type = 'text';
    }
    
    input.value = originalValue;
    input.className = 'cell-edit-input';
    
    // Guardar contexto
    cell.setAttribute('data-original-value', originalValue);
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    
    // Enfocar
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
    
    // Eventos
    const finalizarEdicion = () => {
        const newValue = input.value.trim();
        
        if (newValue !== originalValue && index >= 0 && index < startOrderData.length) {
            const rider = startOrderData[index];
            
            // Validar dorsal
            if (field === 'dorsal') {
                const numDorsal = parseInt(newValue);
                if (isNaN(numDorsal) || numDorsal < 1) {
                    showMessage('Dorsal inválido. Debe ser un número mayor que 0', 'error');
                    cancelarEdicion();
                    return;
                }
                
                // Verificar si el dorsal ya existe (excepto para este corredor)
                const dorsalExistente = startOrderData.find((r, i) => 
                    i !== index && r.dorsal == numDorsal
                );
                
                if (dorsalExistente) {
                    showMessage(`El dorsal ${numDorsal} ya está asignado a otro corredor`, 'warning');
                    cancelarEdicion();
                    return;
                }
                
                rider[field] = numDorsal;
            } else {
                rider[field] = newValue;
            }
            
            // Actualizar y guardar
            updateStartOrderUI();
            saveStartOrderData();
            showMessage('Campo actualizado', 'success');
        }
        
        cell.classList.remove('editing');
        cell.textContent = newValue || originalValue;
    };
    
    const cancelarEdicion = () => {
        cell.classList.remove('editing');
        cell.textContent = originalValue;
    };
    
    input.addEventListener('blur', finalizarEdicion);
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finalizarEdicion();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelarEdicion();
        }
    });
}

// Añadir estilos para los botones de diferencia
function addDiferenciaEditStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .diferencia-edit-container {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px;
        }
        
        .diferencia-input {
            padding: 4px 8px;
            border: 2px solid #4dabf7;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        .diferencia-btn {
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .diferencia-btn:hover {
            transform: scale(1.1);
            opacity: 0.9;
        }
        
        .diferencia-btn.positivo {
            background-color: #28a745;
            color: white;
        }
        
        .diferencia-btn.negativo {
            background-color: #dc3545;
            color: white;
        }
        
        .diferencia-btn.cero {
            background-color: #6c757d;
            color: white;
        }
        
        .diferencia-btn.aceptar {
            background-color: #007bff;
            color: white;
            margin-left: 5px;
        }
        
        .diferencia-btn.cancelar {
            background-color: #ffc107;
            color: #212529;
        }
        
        .diferencia.editable {
            cursor: pointer;
            transition: all 0.2s;
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            min-width: 70px;
            text-align: center;
        }
        
        .diferencia.editable:hover {
            background-color: #e3f2fd;
            box-shadow: 0 0 0 1px #4dabf7;
        }
        
        .diferencia.positiva {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .diferencia.negativa {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .diferencia.cero {
            background-color: #e9ecef;
            color: #6c757d;
            border: 1px solid #dee2e6;
        }
        
        .diferencia.vacia {
            background-color: #f8f9fa;
            color: #adb5bd;
            border: 1px dashed #dee2e6;
            font-style: italic;
        }
        
        .editable:not(.not-editable) {
            cursor: pointer;
            position: relative;
        }
        
        .editable:not(.not-editable):hover::after {
            content: "✏️";
            position: absolute;
            top: 2px;
            right: 2px;
            font-size: 10px;
            opacity: 0.7;
        }
        
        .not-editable {
            background-color: #f8f9fa !important;
            color: #6c757d !important;
            cursor: default !important;
            user-select: none !important;
        }
        
        .editing {
            background-color: #fff3cd !important;
            padding: 0 !important;
        }
        
        .cell-edit-input {
            width: 100%;
            height: 100%;
            border: 2px solid #4dabf7;
            padding: 4px 8px;
            font-size: inherit;
            font-family: inherit;
            box-sizing: border-box;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(style);
}

// Llamar a esta función durante la inicialización
addDiferenciaEditStyles();
function handleTableCellClickForDiferencia(cell, diferenciaSpan) {
    const row = cell.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));
    const field = 'diferencia';
    
    // Si ya está editando, no hacer nada
    if (cell.classList.contains('editing')) return;
    
    // Obtener el valor actual
    let currentValue = diferenciaSpan.textContent.trim();
    
    // Limpiar signos (+) y (-) para la edición
    if (currentValue.includes(' (+)')) {
        currentValue = currentValue.replace(' (+)', '').trim();
    } else if (currentValue.includes(' (-)')) {
        currentValue = currentValue.replace(' (-)', '').trim();
    }
    
    // Si es "--:--:--" o similar, usar valor vacío
    if (currentValue === '--:--:--') {
        currentValue = '';
    }
    
    // Comenzar edición
    startCellEditingForDiferencia(cell, index, field, currentValue);
}

function startCellEditingForDiferencia(cell, index, field, currentValue) {
    const originalValue = cell.innerHTML;
    
    // Crear input para edición
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'cell-edit-input';
    input.placeholder = 'HH:MM:SS';
    input.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
    
    // Guardar contexto de edición
    cell.setAttribute('data-original-value', originalValue);
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    
    // Enfocar y seleccionar
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
    
    // Configurar eventos del input
    input.addEventListener('blur', function() {
        finishCellEditingForDiferencia(cell, index, field, this.value, originalValue);
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishCellEditingForDiferencia(cell, index, field, this.value, originalValue);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelCellEditing(cell, originalValue);
        }
    });
}

function finishCellEditingForDiferencia(cell, index, field, newValue, originalValue) {
    // Si no hubo cambios, cancelar
    if (newValue === '' || newValue === '00:00:00' || newValue === '0') {
        // Para primer corredor, siempre 00:00:00
        if (index >= 0 && index < startOrderData.length) {
            const rider = startOrderData[index];
            if (rider.order === 1) {
                newValue = '00:00:00';
            }
        }
    }
    
    // Validar formato de tiempo
    if (newValue && newValue !== '' && newValue !== '00:00:00') {
        if (!validateTimeFormat(newValue)) {
            const t = translations[appState.currentLanguage];
            showMessage(t.enterValidTime || 'Formato de tiempo inválido. Use HH:MM:SS o HH:MM', 'error');
            cancelCellEditing(cell, originalValue);
            return;
        }
        
        // Asegurar formato HH:MM:SS
        if (newValue.length === 5) {
            newValue += ':00';
        }
    }
    
    // Actualizar los datos
    if (index >= 0 && index < startOrderData.length) {
        const rider = startOrderData[index];
        
        // Si es el primer corredor y se intenta poner diferencia diferente de 0
        if (rider.order === 1 && newValue !== '' && newValue !== '00:00:00' && newValue !== '0') {
            const t = translations[appState.currentLanguage];
            showMessage(t.firstRiderNoDifference || 'El primer corredor no puede tener diferencia', 'warning');
            newValue = '00:00:00';
        }
        
        // Actualizar campo diferencia
        rider.diferencia = newValue;
        
        // Si tiene valor, agregar signo
        if (newValue && newValue !== '' && newValue !== '00:00:00') {
            // Por defecto positivo, pero en realidad debería venir del usuario
            // Podríamos añadir un modo para seleccionar + o -
            rider.diferencia = newValue + ' (+)';
        }
        
        // Actualizar UI
        updateStartOrderUI();
        
        // Guardar datos
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
    }
    
    // Finalizar edición visualmente
    cell.classList.remove('editing');
    cell.removeAttribute('data-original-value');
    
    // No actualizamos directamente la celda, porque updateStartOrderUI lo hará
}

function validateTimeFormat(timeStr) {
    if (!timeStr) return true; // Permitir vacío
    
    // Permitir formato HH:MM o HH:MM:SS
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return regex.test(timeStr);
}

// Función para escapar HTML (seguridad)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para evitar múltiples llamadas (throttle)
const UPDATE_THROTTLE_MS = 50; // 50ms mínimo entre actualizaciones


// Función para añadir estilos de filas alternas (si no existe)
function addAlternatingRowStyles() {
    const rows = document.querySelectorAll('#start-order-table-body tr');
    rows.forEach((row, index) => {
        row.classList.remove('even', 'odd');
        if (index % 2 === 0) {
            row.classList.add('even');
        } else {
            row.classList.add('odd');
        }
    });
}

// Función para obtener el índice original
function getOriginalIndex(order, dorsal) {
    if (!startOrderData || startOrderData.length === 0) return 0;
    
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}
// Función auxiliar para obtener el índice original
function getOriginalIndex(order, dorsal) {
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}

// Función para ordenar los datos

// Actualiza la función sortStartOrderData en Crono_CRI_js_Salidas.js
function sortStartOrderData(data) {
    return data.sort((a, b) => {
        let valueA, valueB;
        
        switch(startOrderSortState.column) {
            case 'order':
                valueA = parseInt(a.order) || 0;
                valueB = parseInt(b.order) || 0;
                break;
            case 'dorsal':
                valueA = parseInt(a.dorsal) || 0;
                valueB = parseInt(b.dorsal) || 0;
                break;
            case 'cronoSalida':
                valueA = a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSalida':
                valueA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'diferencia':
                // Calcular diferencia: Hora Real - Hora Prevista
                const horaRealA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                const horaPrevistaA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                const diferenciaA = horaRealA - horaPrevistaA;
                
                const horaRealB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                const horaPrevistaB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                const diferenciaB = horaRealB - horaPrevistaB;
                
                valueA = diferenciaA;
                valueB = diferenciaB;
                break;
            case 'nombre':
                valueA = (a.nombre || '').toLowerCase();
                valueB = (b.nombre || '').toLowerCase();
                break;
            case 'apellidos':
                valueA = (a.apellidos || '').toLowerCase();
                valueB = (b.apellidos || '').toLowerCase();
                break;
            case 'chip':
                valueA = (a.chip || '').toLowerCase();
                valueB = (b.chip || '').toLowerCase();
                break;
            case 'horaSalidaReal':
                valueA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                valueB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                break;
            case 'cronoSalidaReal':
                valueA = a.cronoSalidaRealSegundos || timeToSeconds(a.cronoSalidaReal) || 0;
                valueB = b.cronoSalidaRealSegundos || timeToSeconds(b.cronoSalidaReal) || 0;
                break;
            case 'horaSalidaPrevista':
                valueA = timeToSeconds(a.horaSalidaPrevista) || a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = timeToSeconds(b.horaSalidaPrevista) || b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'cronoSalidaPrevista':
                valueA = timeToSeconds(a.cronoSalidaPrevista) || a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = timeToSeconds(b.cronoSalidaPrevista) || b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSalidaImportado':
                valueA = timeToSeconds(a.horaSalidaImportado) || 0;
                valueB = timeToSeconds(b.horaSalidaImportado) || 0;
                break;
            case 'cronoSalidaImportado':
                valueA = timeToSeconds(a.cronoSalidaImportado) || 0;
                valueB = timeToSeconds(b.cronoSalidaImportado) || 0;
                break;
            case 'cronoSegundos':
                valueA = a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSegundos':
                valueA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'cronoSalidaRealSegundos':
                valueA = a.cronoSalidaRealSegundos || timeToSeconds(a.cronoSalidaReal) || 0;
                valueB = b.cronoSalidaRealSegundos || timeToSeconds(b.cronoSalidaReal) || 0;
                break;
            case 'horaSalidaRealSegundos':
                valueA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                valueB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                break;
            default:
                valueA = parseInt(a.order) || 0;
                valueB = parseInt(b.order) || 0;
        }
        
        if (startOrderSortState.direction === 'asc') {
            return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
        } else {
            return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
        }
    });
}

// ============================================
// FUNCIONES AUXILIARES DE SALIDAS
// ============================================
function updateSortIndicators() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        const column = th.getAttribute('data-sort');
        if (column === sortState.column) {
            th.classList.add(sortState.direction);
        }
    });
}

function setupSorting() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            
            if (sortState.column === column) {
                sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.column = column;
                sortState.direction = 'asc';
            }
            
            renderDeparturesList();
        });
    });
}

function pauseCountdownVisual() {
    appState.countdownPaused = true;
    appState.configModalOpen = true;
}

function resumeCountdownVisual() {
    appState.countdownPaused = false;
    appState.configModalOpen = false;
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

// ============================================
// MÓDULO DE SALIDAS - CON INPUT DE TIEMPO MEJORADO
// ============================================

// ============================================
// VARIABLES DE ESTADO PARA INPUT DE TIEMPO
// ============================================
let originalTimeValue = '';
let timeInputInProgress = false;

// ============================================
// INICIALIZACIÓN DE INPUT DE TIEMPO
// ============================================
function setupTimeInputs() {
    console.log("Configurando inputs de tiempo mejorados para móviles...");
    
    // Cambiar input type="time" a text para permitir segundos en móviles
    const firstStartTime = document.getElementById('first-start-time');
    if (firstStartTime) {
        // Guardar el tipo original si es necesario
        if (firstStartTime.type === 'time') {
            firstStartTime.type = 'text';
            firstStartTime.classList.add('time-input');
        }
        
        // Configurar placeholder y validación
        firstStartTime.placeholder = 'HH:MM:SS';
        firstStartTime.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
        
        // Guardar valor original
        originalTimeValue = firstStartTime.value;
        
        // Configurar eventos
        setupTimeInputEvents(firstStartTime);
    }
    
    console.log("Inputs de tiempo configurados");
}

function setupTimeInputEvents(input) {
    // Formatear al perder foco
    input.addEventListener('blur', function() {
        formatTimeInput(this);
        handleFirstStartTimeBlur();
    });
    
    // Autoformatear mientras escribe
    input.addEventListener('input', function(e) {
        autoFormatTimeInput(this, e);
    });
    
    // Capturar teclas especiales
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = originalTimeValue;
            this.blur();
        } else if (e.key === 'Enter') {
            this.blur();
        }
    });
    
    // Guardar valor original al enfocar
    input.addEventListener('focus', function() {
        originalTimeValue = this.value;
        timeInputInProgress = true;
    });
}

// ============================================
// FUNCIONES DE FORMATEO DE TIEMPO
// ============================================
function formatTimeInput(input) {
    let value = input.value.trim();
    
    if (!value) {
        input.value = '00:00:00';
        return;
    }
    
    // Si ya tiene formato HH:MM, agregar :00
    if (/^\d{1,2}:\d{2}$/.test(value)) {
        const parts = value.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            input.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            return;
        }
    }
    
    // Quitar caracteres no numéricos
    value = value.replace(/[^0-9]/g, '');
    
    // Formatear según longitud
    if (value.length === 4) {
        // CORRECCIÓN: Interpretar como HHMM, no como MMSS
        const hours = parseInt(value.substring(0, 2));
        const minutes = parseInt(value.substring(2, 4));
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            input.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } else {
            input.value = '09:00:00'; // Valor por defecto
        }
    } 
    else if (value.length === 6) {
        // Formato HHMMSS → HH:MM:SS
        input.value = `${value.substring(0, 2)}:${value.substring(2, 4)}:${value.substring(4, 6)}`;
    } 
    else if (value.length <= 2) {
        // Formato HH (solo horas)
        const hours = parseInt(value) || 0;
        input.value = `${hours.toString().padStart(2, '0')}:00:00`;
    } 
    else {
        // Formato por defecto
        value = value.padStart(6, '0');
        input.value = `${value.substring(0, 2)}:${value.substring(2, 4)}:${value.substring(4, 6)}`;
    }
    
    // Validar el tiempo resultante
    if (!validateTime(input.value)) {
        input.classList.add('invalid-time');
        showTimeValidationMessage(input, 'Formato inválido. Use HH:MM:SS');
    } else {
        input.classList.remove('invalid-time');
    }
}

function autoFormatTimeInput(input, e) {
    let value = input.value;
    
    // Insertar automáticamente : después de 2 y 4 dígitos
    if (/^\d{2}$/.test(value) && !value.includes(':')) {
        input.value = value + ':';
    } else if (/^\d{2}:\d{2}$/.test(value) && value.match(/:/g).length === 1) {
        input.value = value + ':';
    }
    
    // Limitar a 8 caracteres (HH:MM:SS)
    if (value.length > 8) {
        input.value = value.substring(0, 8);
    }
}

function validateTime(timeStr) {
    if (!timeStr) return false;
    
    const parts = timeStr.split(':');
    if (parts.length !== 3) return false;
    
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return false;
    if (hours < 0 || hours > 23) return false;
    if (minutes < 0 || minutes > 59) return false;
    if (seconds < 0 || seconds > 59) return false;
    
    return true;
}

// ============================================
// MANEJADORES DE CAMBIO DE HORA
// ============================================
function handleFirstStartTimeBlur() {
    const input = document.getElementById('first-start-time');
    const newValue = input.value;
    
    console.log('handleFirstStartTimeBlur called');
    console.log('Nuevo valor:', newValue);
    console.log('Valor original:', originalTimeValue);
    console.log('Tiempo en progreso:', timeInputInProgress);
    
    // Si ya estamos procesando, salir
    if (timeInputInProgress === false) {
        console.log('Ya no está en progreso, saliendo...');
        return;
    }
    
    // Marcar que ya estamos procesando
    timeInputInProgress = false;
    
    // Si el valor no cambió o es inválido, no hacer nada
    if (newValue === originalTimeValue) {
        console.log('Valor no cambió, saliendo...');
        return;
    }
    
    // Validar el formato
    if (!validateTime(newValue)) {
        console.log('Formato inválido, restaurando...');
        input.value = originalTimeValue;
        
        const t = translations[appState.currentLanguage];
        showMessage(t.enterValidTime || 'Formato de hora inválido. Use HH:MM o HH:MM:SS', 'error');
        return;
    }
    
    // Si no hay datos en la tabla, actualizar directamente
    if (!startOrderData || startOrderData.length === 0) {
        console.log('No hay datos en tabla, actualizando directamente...');
        originalTimeValue = newValue;
        return;
    }
    
    // Mostrar modal de confirmación
    console.log('Mostrando modal de confirmación...');
    showTimeChangeConfirmation(newValue, originalTimeValue);
}


// ============================================
// FUNCIÓN DE CONFIRMACIÓN DE CAMBIO DE HORA
// ============================================
function showTimeChangeConfirmation(newTime, oldTime) {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de confirmación simplificado
    const modal = document.createElement('div');
    modal.id = 'time-change-confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.timeChangeTitle || 'Cambiar hora de inicio'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="time-change-comparison">
                    <div class="time-change-old">
                        <span class="time-change-label">Hora actual:</span>
                        <span class="time-change-value old-value">${oldTime}</span>
                    </div>
                    <div class="time-change-new">
                        <span class="time-change-label">Nueva hora:</span>
                        <span class="time-change-value new-value">${newTime}</span>
                    </div>
                </div>
                <div class="time-change-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${t.timeChangeWarning || '¿Estás seguro que quieres actualizar todas las horas de salida?'}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-time-change-btn">
                    <i class="fas fa-check"></i>
                    ${t.confirmChange || 'Sí, actualizar todo'}
                </button>
                <button class="btn btn-danger" id="cancel-time-change-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelChange || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupTimeChangeModalEvents(modal, newTime, oldTime);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function setupTimeChangeModalEvents(modal, newTime, oldTime) {
    const confirmBtn = modal.querySelector('#confirm-time-change-btn');
    const cancelBtn = modal.querySelector('#cancel-time-change-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar - actualizar toda la tabla
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Actualizar el valor en el input
        const input = document.getElementById('first-start-time');
        input.value = newTime;
        originalTimeValue = newTime;
        
        // Actualizar todas las horas
        updateAllStartTimes(newTime, oldTime);
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
        
        // Mostrar mensaje
        const t = translations[appState.currentLanguage];
        showMessage(t.allTimesUpdated || 'Todas las horas de salida actualizadas', 'success');
    });
    
    // Cancelar - restaurar valor original
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const input = document.getElementById('first-start-time');
        input.value = oldTime;
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
        
        const t = translations[appState.currentLanguage];
        showMessage(t.timeChangeCancelled || 'Cambio cancelado', 'info');
    });
    
    // Cerrar modal con la X
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const input = document.getElementById('first-start-time');
        input.value = oldTime;
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            const input = document.getElementById('first-start-time');
            input.value = oldTime;
            
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
            
            timeInputInProgress = false;
        }
    });
    
    // Prevenir que el evento se propague al contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Añadir estilos si no existen
    addTimeChangeStyles();
}

function updateAllStartTimes(newTime, oldTime) {
    console.log('Actualizando todas las horas de salida...');
    
    if (!validateTime(newTime) || !startOrderData || startOrderData.length === 0) {
        return;
    }
    
    const oldFirstSeconds = timeToSeconds(oldTime);
    const newFirstSeconds = timeToSeconds(newTime);
    
    // Calcular diferencia entre nueva y vieja hora
    const diferenciaSeconds = newFirstSeconds - oldFirstSeconds;
    
    console.log(`Diferencia: ${oldTime} → ${newTime} = ${diferenciaSeconds} segundos`);
    
    // Aplicar nueva hora a todos los corredores
    startOrderData.forEach((rider, index) => {
        // Actualizar hora principal
        const oldHoraSeconds = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
        rider.horaSegundos = oldHoraSeconds + diferenciaSeconds;
        rider.horaSalida = secondsToTime(rider.horaSegundos);
        
        // Actualizar hora prevista si es igual a la anterior
        const oldPrevistaSeconds = timeToSeconds(rider.horaSalidaPrevista) || 0;
        if (oldPrevistaSeconds === oldHoraSeconds || 
            rider.horaSalidaPrevista === rider.horaSalida) {
            rider.horaSalidaPrevista = rider.horaSalida;
        }
        
        console.log(`Corredor ${index + 1}: ${secondsToTime(oldHoraSeconds)} → ${rider.horaSalida}`);
    });
    
    // Actualizar valores
    originalTimeValue = newTime;
    document.getElementById('first-start-time').value = newTime;
    
    // ✅ ACTUALIZAR UI con force=true para refrescar inmediatamente
    updateStartOrderUI();
    
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    console.log('Actualización completada');
}

// Funciones auxiliares (si no existen)
function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '') return 0;
    
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

function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function validateTime(timeStr) {
    if (!timeStr) return false;
    
    // Permitir HH:MM o HH:MM:SS
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return regex.test(timeStr);
}


// ============================================
// ESTILOS PARA EL MODAL DE CONFIRMACIÓN
// ============================================
function addTimeChangeStyles() {
    if (document.getElementById('time-change-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'time-change-styles';
    style.textContent = `
        .time-change-comparison {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
        }
        
        .time-change-old, .time-change-new {
            text-align: center;
        }
        
        .time-change-label {
            display: block;
            font-size: 0.9rem;
            color: var(--gray);
            margin-bottom: 5px;
        }
        
        .time-change-value {
            display: block;
            font-size: 1.8rem;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }
        
        .old-value {
            color: var(--danger);
            text-decoration: line-through;
        }
        
        .new-value {
            color: var(--success);
        }
        
        .time-change-warning {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 15px;
            margin: 15px 0;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .time-change-warning i {
            color: #f39c12;
            font-size: 1.5rem;
            margin-top: 2px;
        }
        
        .time-change-details {
            background: #e8f4fd;
            padding: 15px;
            border-radius: var(--border-radius);
            margin-top: 15px;
        }
        
        .time-change-details p {
            margin: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .time-change-details i {
            color: var(--primary);
            width: 20px;
            text-align: center;
        }
        
        .time-change-details strong {
            margin-left: 5px;
        }
        
        .invalid-time {
            border-color: var(--danger) !important;
            background-color: #fff5f5 !important;
        }
        
        .time-validation-message {
            color: var(--danger);
            font-size: 0.85rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
    `;
    
    document.head.appendChild(style);
}

function showTimeValidationMessage(input, message) {
    // Eliminar mensaje anterior si existe
    const existingMessage = input.nextElementSibling;
    if (existingMessage && existingMessage.classList.contains('time-validation-message')) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageEl = document.createElement('div');
    messageEl.className = 'time-validation-message';
    messageEl.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    input.parentNode.insertBefore(messageEl, input.nextSibling);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        if (messageEl && messageEl.parentNode) {
            messageEl.remove();
        }
    }, 3000);
};


// ============================================
// FUNCIONES DE ORDENACIÓN PARA TABLA DE ORDEN DE SALIDA
// ============================================

function setupStartOrderTableSorting() {
    console.log("Configurando ordenación para tabla de orden de salida...");
    
    const sortableHeaders = document.querySelectorAll('.start-order-table th.sortable');
    console.log(`Encontrados ${sortableHeaders.length} encabezados ordenables`);
    
    if (sortableHeaders.length === 0) {
        console.warn("⚠️ No se encontraron encabezados con clase 'sortable'");
        console.warn("Los encabezados deben tener: class='sortable' y data-sort='nombre_campo'");
    }
    
    sortableHeaders.forEach((th, index) => {
        const column = th.getAttribute('data-sort');
        const text = th.textContent.trim();
        console.log(`Encabezado ${index + 1}: "${text}" -> data-sort="${column}"`);
        
        th.addEventListener('click', function() {
            console.log(`Clic en columna: ${column} (${text})`);
            console.log(`Estado actual: columna=${startOrderSortState.column}, dirección=${startOrderSortState.direction}`);
            
            if (startOrderSortState.column === column) {
                startOrderSortState.direction = startOrderSortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                startOrderSortState.column = column;
                startOrderSortState.direction = 'asc';
            }
            
            console.log(`Nuevo estado: columna=${startOrderSortState.column}, dirección=${startOrderSortState.direction}`);
            
            updateStartOrderTableThrottled(); 
        });
    });
    
    console.log("Ordenación configurada");
}

function updateStartOrderSortIndicators() {
    document.querySelectorAll('.start-order-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        const column = th.getAttribute('data-sort');
        if (column === startOrderSortState.column) {
            th.classList.add(startOrderSortState.direction);
        }
    });
}

// ============================================
// FUNCIONES DE ORDEN DE SALIDA (CONTINUACIÓN)
// ============================================

function addNewRider() {
    const t = translations[appState.currentLanguage];
    
    // Si no hay datos en la tabla, crear el primer corredor
    if (!startOrderData || startOrderData.length === 0) {
        createFirstRider();
        return;
    }
    
    // Mostrar modal para seleccionar posición
    showRiderPositionModal();
}

function createFirstRider() {
    const t = translations[appState.currentLanguage];
    
    // Obtener hora de inicio
    const horaInicio = document.getElementById('first-start-time').value || '09:00:00';
    
    // Crear primer corredor
    const newRider = {
        order: 1,
        dorsal: 1,
        cronoSalida: '00:00:00',
        horaSalida: horaInicio,
        nombre: '',
        apellidos: '',
        chip: '',
        horaSalidaReal: horaInicio,
        cronoSalidaReal: '00:00:00',
        cronoSalidaRealSegundos: 0,
        horaSalidaRealSegundos: timeToSeconds(horaInicio),
        horaSalidaPrevista: horaInicio,
        cronoSalidaPrevista: '00:00:00',
        horaSalidaImportado: horaInicio,
        cronoSalidaImportado: '00:00:00',
        cronoSegundos: 0,
        horaSegundos: timeToSeconds(horaInicio)
    };
    
    startOrderData = [newRider];
    updateStartOrderUI();
    
    showMessage(t.firstRiderCreated, 'success');
}

function showRiderPositionModal() {
    const t = translations[appState.currentLanguage];
    
    // Crear el modal - Asegúrate de que tenga TODOS estos elementos:
    const modal = document.createElement('div');
    modal.id = 'rider-position-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.addRider || 'Añadir Corredor'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="add-rider-form">
                    <!-- Sección de posición -->
                    <div class="form-section">
                        <h4><i class="fas fa-map-marker-alt"></i> ${t.position || 'Posición'}</h4>
                        <div class="form-group">
                            <label for="rider-position-select">${t.selectPosition || 'Seleccionar posición:'}</label>
                            <select id="rider-position-select" class="form-control">
                                <option value="end">${t.addAtEnd || 'Añadir al final'}</option>
                                <option value="beginning">${t.addAtBeginning || 'Añadir al principio'}</option>
                                <option value="specific">${t.addAtSpecificPosition || 'Posición específica...'}</option>
                            </select>
                        </div>
                        <div id="specific-position-container" class="form-group" style="display: none;">
                            <label for="specific-position-input">${t.positionNumber || 'Número de posición:'}</label>
                            <input type="number" id="specific-position-input" class="form-control" 
                                   min="1" max="${startOrderData.length + 1}" 
                                   value="${startOrderData.length + 1}">
                        </div>
                    </div>
                    
                    <!-- Sección de datos del corredor -->
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> ${t.riderData || 'Datos del Corredor'}</h4>
                        <div class="form-row">
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-dorsal"><i class="fas fa-hashtag"></i> ${t.dorsal || 'Dorsal'}:</label>
                                    <input type="number" id="rider-dorsal" class="form-control" 
                                           min="1" value="${findNextAvailableDorsal()}">
                                </div>
                            </div>
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-name"><i class="fas fa-user"></i> ${t.name || 'Nombre'}:</label>
                                    <input type="text" id="rider-name" class="form-control" 
                                           placeholder="${t.name || 'Nombre'}">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-surname"><i class="fas fa-users"></i> ${t.surname || 'Apellidos'}:</label>
                                    <input type="text" id="rider-surname" class="form-control" 
                                           placeholder="${t.surname || 'Apellidos'}">
                                </div>
                            </div>
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-chip"><i class="fas fa-microchip"></i> ${t.chip || 'Chip'}:</label>
                                    <input type="text" id="rider-chip" class="form-control" 
                                           placeholder="${t.chip || 'Código del chip'}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Vista previa -->
                    <div class="form-section">
                        <h4><i class="fas fa-eye"></i> ${t.preview || 'Vista Previa'}</h4>
                        <div class="rider-preview">
                            <div class="preview-grid">
                                <div class="preview-item">
                                    <strong>${t.position || 'Posición'}</strong>
                                    <div id="preview-position" class="preview-value">${startOrderData.length + 1}</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.dorsal || 'Dorsal'}</strong>
                                    <div id="preview-dorsal" class="preview-value">${findNextAvailableDorsal()}</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.startTime || 'Hora Salida'}</strong>
                                    <div id="preview-time" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                                <div class="preview-item">
                                    <strong>Crono Salida</strong>
                                    <div id="preview-crono" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.name || 'Nombre'}</strong>
                                    <div id="preview-name" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.surname || 'Apellidos'}</strong>
                                    <div id="preview-surname" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.chip || 'Chip'}</strong>
                                    <div id="preview-chip" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>Diferencia</strong>
                                    <div id="preview-diferencia" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información adicional -->
                    <div class="position-info">
                        <i class="fas fa-info-circle"></i>
                        <p>${t.positionInfo || 'La hora de salida se calculará automáticamente basándose en la posición y el intervalo establecido.'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-add-rider-btn">
                    <i class="fas fa-plus"></i>
                    ${t.addRiderButton || 'Añadir Corredor'}
                </button>
                <button class="btn btn-danger" id="cancel-add-rider-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelButtonText || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupRiderPositionModalEvents(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
        document.getElementById('rider-dorsal').focus();
    }, 10);
}

function setupRiderPositionModalEvents(modal) {
    const t = translations[appState.currentLanguage];
    
    // Elementos del formulario
    const positionSelect = modal.querySelector('#rider-position-select');
    const specificContainer = modal.querySelector('#specific-position-container');
    const specificInput = modal.querySelector('#specific-position-input');
    const dorsalInput = modal.querySelector('#rider-dorsal');
    const nameInput = modal.querySelector('#rider-name');
    const surnameInput = modal.querySelector('#rider-surname');
    const chipInput = modal.querySelector('#rider-chip');
    
    // Botones
    const confirmBtn = modal.querySelector('#confirm-add-rider-btn');
    const cancelBtn = modal.querySelector('#cancel-add-rider-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Función auxiliar para inicializar vista previa
    function initializeRiderPreview() {
        // Establecer valores por defecto si no existen
        if (positionSelect) {
            positionSelect.value = 'end';
        }
        
        if (specificInput) {
            specificInput.value = startOrderData.length + 1;
            specificInput.max = startOrderData.length + 1;
            specificInput.min = 1;
        }
        
        if (dorsalInput) {
            dorsalInput.value = findNextAvailableDorsal();
        }
        
        // Actualizar vista previa
        updateRiderPreview();
    }
    
    // Inicializar vista previa
    initializeRiderPreview();
    
    // Actualizar cuando cambia la selección de posición
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            if (this.value === 'specific') {
                if (specificContainer) specificContainer.style.display = 'block';
                if (specificInput) specificInput.focus();
            } else {
                if (specificContainer) specificContainer.style.display = 'none';
            }
            updateRiderPreview();
        });
    }
    
    // Actualizar cuando cambian los inputs
    [specificInput, dorsalInput, nameInput, surnameInput, chipInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateRiderPreview);
            input.addEventListener('change', updateRiderPreview);
        }
    });
    
    // ============================================
    // CONFIGURACIÓN DE BOTONES DE CONFIRMAR Y CANCELAR
    // ============================================
    
    // Confirmar - Añadir corredor
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón confirmar clickeado");
            
            // Obtener datos del formulario
            const positionType = positionSelect ? positionSelect.value : 'end';
            let position;
            
            if (positionType === 'end') {
                position = startOrderData.length + 1;
            } else if (positionType === 'beginning') {
                position = 1;
            } else if (positionType === 'specific') {
                position = specificInput ? parseInt(specificInput.value) || startOrderData.length + 1 : startOrderData.length + 1;
                if (position < 1) position = 1;
                if (position > startOrderData.length + 1) position = startOrderData.length + 1;
            } else {
                position = startOrderData.length + 1;
            }
            
            // Obtener datos del corredor
            const riderData = {
                dorsal: parseInt(dorsalInput.value) || position,
                nombre: nameInput.value.trim(),
                apellidos: surnameInput.value.trim(),
                chip: chipInput.value.trim()
            };
            
            console.log("Datos del corredor:", riderData);
            console.log("Posición:", position);
            
            // Validar dorsal
            const dorsalExistente = startOrderData.find(rider => rider.dorsal == riderData.dorsal);
            if (dorsalExistente) {
                showMessage(`El dorsal ${riderData.dorsal} ya está asignado a otro corredor`, 'warning');
                return;
            }
            
            // Cerrar modal
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            // Añadir corredor
            createNewRiderAtPosition(position, riderData);
        });
    }
    
    // Cancelar - Cerrar modal
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón cancelar clickeado");
            
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        });
    }
    
    // Cerrar con la X
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón cerrar clickeado");
            
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        });
    }
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        }
    });
    
    // Prevenir que el evento se propague al contenido
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Añadir estilos si no existen
    addRiderPositionStyles();
}

function findNextAvailableDorsal() {
    if (!startOrderData || startOrderData.length === 0) {
        return 1;
    }
    
    // Buscar el dorsal más alto
    let maxDorsal = 0;
    startOrderData.forEach(rider => {
        if (rider.dorsal > maxDorsal) {
            maxDorsal = rider.dorsal;
        }
    });
    
    return maxDorsal + 1;
}

function updateRiderPreview() {
    const modal = document.getElementById('rider-position-modal');
    if (!modal) return;
    
    // Elementos de posición
    const positionSelect = modal.querySelector('#rider-position-select');
    const specificInput = modal.querySelector('#specific-position-input');
    
    // Elementos del formulario
    const dorsalInput = modal.querySelector('#rider-dorsal');
    const nameInput = modal.querySelector('#rider-name');
    const surnameInput = modal.querySelector('#rider-surname');
    const chipInput = modal.querySelector('#rider-chip');
    
    // Elementos de vista previa
    const previewPosition = modal.querySelector('#preview-position');
    const previewDorsal = modal.querySelector('#preview-dorsal');
    const previewTime = modal.querySelector('#preview-time');
    const previewCrono = modal.querySelector('#preview-crono');
    const previewName = modal.querySelector('#preview-name');
    const previewSurname = modal.querySelector('#preview-surname');
    const previewChip = modal.querySelector('#preview-chip');
    const previewDiferencia = modal.querySelector('#preview-diferencia');
    
    // Calcular posición
    let position;
    const positionType = positionSelect ? positionSelect.value : 'end';
    
    if (positionType === 'end') {
        position = startOrderData.length + 1;
    } else if (positionType === 'beginning') {
        position = 1;
    } else if (positionType === 'specific') {
        position = specificInput ? parseInt(specificInput.value) || startOrderData.length + 1 : startOrderData.length + 1;
        if (position < 1) position = 1;
        if (position > startOrderData.length + 1) position = startOrderData.length + 1;
    } else {
        position = startOrderData.length + 1;
    }
    
    // Actualizar vista previa de posición
    if (previewPosition) {
        previewPosition.textContent = position;
    }
    
    // Actualizar vista previa de datos
    if (previewDorsal) {
        previewDorsal.textContent = (dorsalInput && dorsalInput.value) ? dorsalInput.value : position;
    }
    
    if (previewName) {
        previewName.textContent = (nameInput && nameInput.value) ? nameInput.value : '--';
    }
    
    if (previewSurname) {
        previewSurname.textContent = (surnameInput && surnameInput.value) ? surnameInput.value : '--';
    }
    
    if (previewChip) {
        previewChip.textContent = (chipInput && chipInput.value) ? chipInput.value : '--';
    }
    
    // Calcular la hora de salida y crono para esta posición
    let horaSalida = '00:00:00';
    let cronoSalida = '00:00:00';
    let diferencia = '00:00:00';
    
    if (startOrderData.length > 0) {
        if (position === 1) {
            // PRIMER CORREDOR
            cronoSalida = '00:00:00';
            horaSalida = document.getElementById('first-start-time') ? document.getElementById('first-start-time').value || '09:00:00' : '09:00:00';
            diferencia = '00:00:00';
            
            // Si ya hay corredores, mostrar la diferencia que tendría el corredor desplazado
            const primerCorredorActual = startOrderData[0];
            if (primerCorredorActual && primerCorredorActual.diferencia && 
                primerCorredorActual.diferencia !== '' && 
                primerCorredorActual.diferencia !== '00:00:00') {
                
                diferencia = primerCorredorActual.diferencia;
                console.log('Vista previa - Posición 1: Mostrando diferencia del corredor desplazado:', diferencia);
            }
        } else if (position <= startOrderData.length) {
            // Insertar en medio - usar el corredor anterior como referencia
            const corredorAnterior = startOrderData[position - 2];
            
            // Determinar diferencia a usar
            if (position - 1 < startOrderData.length) {
                // Si hay un corredor después de esta posición, usar SU diferencia
                const siguienteCorredor = startOrderData[position - 1];
                diferencia = siguienteCorredor.diferencia || '00:01:00';
            } else {
                // Si es el último, usar la diferencia del anterior
                diferencia = corredorAnterior.diferencia || '00:01:00';
            }
            
            // Limpiar signos de la diferencia para cálculos
            const diferenciaLimpia = diferencia.replace(/ \([+-]\)/g, '').trim();
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // Calcular crono salida: crono del anterior + diferencia
            const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
            const cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Calcular hora salida: hora del anterior + diferencia
            const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
            const horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
        } else {
            // Añadir al final - usar el último corredor como referencia
            const ultimoCorredor = startOrderData[startOrderData.length - 1];
            
            // Usar la diferencia del último corredor
            diferencia = ultimoCorredor.diferencia || '00:01:00';
            
            // Limpiar signos de la diferencia para cálculos
            const diferenciaLimpia = diferencia.replace(/ \([+-]\)/g, '').trim();
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // Calcular crono salida: crono del último + diferencia
            const cronoAnteriorSegundos = ultimoCorredor.cronoSegundos || timeToSeconds(ultimoCorredor.cronoSalida) || 0;
            const cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Calcular hora salida: hora del último + diferencia
            const horaAnteriorSegundos = ultimoCorredor.horaSegundos || timeToSeconds(ultimoCorredor.horaSalida) || 0;
            const horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
        }
    } else {
        // NO HAY CORREDORES EXISTENTES (primer corredor de la tabla)
        cronoSalida = '00:00:00';
        horaSalida = document.getElementById('first-start-time') ? document.getElementById('first-start-time').value || '09:00:00' : '09:00:00';
        diferencia = '00:00:00';
    }
    
    // Actualizar vista previa de tiempos
    if (previewTime) {
        previewTime.textContent = horaSalida;
    }
    
    if (previewCrono) {
        previewCrono.textContent = cronoSalida;
    }
    
    if (previewDiferencia) {
        // Mostrar diferencia con formato
        let diferenciaDisplay = diferencia;
        if (diferencia === '00:00:00' || !diferencia) {
            diferenciaDisplay = '00:00:00';
        } else if (!diferencia.includes('(+)') && !diferencia.includes('(-)')) {
            // Si no tiene signo, añadirlo como positivo por defecto
            diferenciaDisplay = diferencia + ' (+)';
        }
        previewDiferencia.textContent = diferenciaDisplay;
    }
    
    // Actualizar specific input con el valor calculado
    if (specificInput) {
        specificInput.max = startOrderData.length + 1;
        if (positionType === 'specific') {
            specificInput.value = position;
        }
    }
    
    console.log('Vista previa actualizada para posición', position, ':', {
        horaSalida,
        cronoSalida,
        diferencia
    });
}

function createNewRiderAtPosition(position, riderData = {}) {
    console.log(`=== createNewRiderAtPosition llamada para posición ${position} ===`);
    
    const t = translations[appState.currentLanguage];
    
    // Validar posición
    if (position < 1) position = 1;
    if (position > startOrderData.length + 1) position = startOrderData.length + 1;
    
    console.log(`Posición validada: ${position}, total corredores actual: ${startOrderData.length}`);
    
    // Variables para el nuevo corredor
    let cronoSalida = '00:00:00';
    let horaSalida = '09:00:00';
    let diferencia = '00:01:00 (+)'; // Diferencia por defecto
    let cronoSegundos = 0;
    let horaSegundos = 0;
    
    // Si hay corredores existentes, calcular basándose en ellos
    if (startOrderData.length > 0) {
        if (position === 1) {
            // Insertar al principio - usar la hora de inicio del input
            horaSalida = document.getElementById('first-start-time').value || '09:00:00';
            horaSegundos = timeToSeconds(horaSalida);
            diferencia = '00:00:00';
            
            console.log(`Añadiendo al principio. Hora: ${horaSalida}`);
        } else {
            // Insertar en medio o al final
            const corredorAnterior = startOrderData[position - 2];
            
            // ✅ USAR la diferencia del registro anterior
            diferencia = corredorAnterior.diferencia || '00:01:00 (+)';
            
            // Calcular diferencia en segundos (limpiar signos + o -)
            let diferenciaLimpia = diferencia;
            if (diferencia.includes('(+)')) {
                diferenciaLimpia = diferencia.replace('(+)', '').trim();
            } else if (diferencia.includes('(-)')) {
                diferenciaLimpia = diferencia.replace('(-)', '').trim();
            }
            
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // ✅ Calcular nuevos valores basados en el anterior + diferencia
            // Crono salida: crono del anterior + diferencia
            const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
            cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Hora salida: hora del anterior + diferencia
            const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
            horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
            
            console.log(`Añadiendo en posición ${position}. Usando diferencia del anterior: ${diferencia}`);
            console.log(`  Anterior: hora=${secondsToTime(horaAnteriorSegundos)}, crono=${secondsToTime(cronoAnteriorSegundos)}`);
            console.log(`  Nuevo: hora=${horaSalida}, crono=${cronoSalida}, diferencia=${diferenciaSegundos}s`);
        }
    } else {
        // Primer corredor de la tabla
        horaSalida = document.getElementById('first-start-time').value || '09:00:00';
        horaSegundos = timeToSeconds(horaSalida);
        diferencia = '00:00:00';
        console.log(`Primer corredor de la tabla. Hora: ${horaSalida}`);
    }
    
    // Crear nuevo corredor
    const nuevoCorredor = {
        order: position,
        dorsal: riderData.dorsal || position,
        
        // Campos principales (calculados arriba)
        cronoSalida: cronoSalida,
        horaSalida: horaSalida,
        diferencia: diferencia,
        
        // Datos personales
        nombre: riderData.nombre || '',
        apellidos: riderData.apellidos || '',
        chip: riderData.chip || '',
        
        // Campos reales - VACÍOS
        horaSalidaReal: '',
        cronoSalidaReal: '',
        cronoSalidaRealSegundos: 0,
        horaSalidaRealSegundos: 0,
        
        // Campos previstas - iguales a los principales
        horaSalidaPrevista: horaSalida,
        cronoSalidaPrevista: cronoSalida,
        
        // Campos importados - ✅ SIEMPRE VACÍOS para nuevos corredores
        horaSalidaImportado: '',
        cronoSalidaImportado: '',
        
        // Segundos (ya calculados arriba)
        cronoSegundos: cronoSegundos,
        horaSegundos: horaSegundos,
        diferenciaSegundos: timeToSeconds(diferencia.replace(/ \([+-]\)/g, '').trim()) || 0
    };
    
    console.log('Nuevo corredor creado:', {
        order: nuevoCorredor.order,
        dorsal: nuevoCorredor.dorsal,
        horaSalida: nuevoCorredor.horaSalida,
        cronoSalida: nuevoCorredor.cronoSalida,
        diferencia: nuevoCorredor.diferencia,
        horaSalidaImportado: nuevoCorredor.horaSalidaImportado,  // ✅ VACÍO
        cronoSalidaImportado: nuevoCorredor.cronoSalidaImportado // ✅ VACÍO
    });
    
    // Insertar corredor
    startOrderData.splice(position - 1, 0, nuevoCorredor);
    
    // Recalcular órdenes de todos los corredores
    for (let i = 0; i < startOrderData.length; i++) {
        startOrderData[i].order = i + 1;
    }
    
    // ✅ Recalcular corredores posteriores si los hay
    if (position < startOrderData.length) {
        recalculateFollowingRiders(position + 1);
    }
    
    // ✅ Actualizar UI
    updateStartOrderUI();
    
    // ✅ Guardar datos
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    // Mostrar mensaje
    const message = t.riderAddedAtPosition ? t.riderAddedAtPosition.replace('{position}', position) : `Corredor añadido en posición ${position}`;
    showMessage(message, 'success');
    
    console.log(`=== createNewRiderAtPosition completada ===`);
    
    return nuevoCorredor;
}

function recalculateFollowingRiders(fromPosition) {
    console.log(`=== Recalculando corredores desde posición ${fromPosition} ===`);
    
    if (fromPosition > startOrderData.length) {
        console.log('No hay corredores para recalcular');
        return;
    }
    
    // Ajustar fromPosition para que sea base 0
    const startIndex = Math.max(1, fromPosition - 1); // Empezar desde el corredor después del insertado
    
    for (let i = startIndex; i < startOrderData.length; i++) {
        const corredorActual = startOrderData[i];
        const corredorAnterior = startOrderData[i - 1];
        
        // 1. Actualizar orden
        corredorActual.order = i + 1;
        
        // 2. ✅ USAR la diferencia del corredor actual (NO cambiarla)
        // Si no tiene diferencia, usar la del anterior
        if (!corredorActual.diferencia || corredorActual.diferencia === '' || corredorActual.diferencia === '00:00:00') {
            corredorActual.diferencia = corredorAnterior.diferencia || '00:01:00 (+)';
        }
        
        let diferencia = corredorActual.diferencia;
        
        // 3. Calcular diferencia en segundos (limpiar signos)
        let diferenciaLimpia = diferencia;
        if (diferencia.includes('(+)')) {
            diferenciaLimpia = diferencia.replace('(+)', '').trim();
        } else if (diferencia.includes('(-)')) {
            diferenciaLimpia = diferencia.replace('(-)', '').trim();
        }
        
        const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
        
        // 4. Calcular nuevos valores basados en el anterior + diferencia
        // Crono salida: crono del anterior + diferencia
        const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
        corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
        corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
        
        // Hora salida: hora del anterior + diferencia
        const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
        corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
        corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
        
        // 5. ✅ Actualizar campos previstas (iguales a los principales)
        corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
        corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
        
        // 6. ✅ NO modificar campos importados - PRESERVAR valores existentes
        console.log(`  ${corredorActual.order}: horaSalidaImportado="${corredorActual.horaSalidaImportado}", cronoSalidaImportado="${corredorActual.cronoSalidaImportado}"`);
        
        // 7. ✅ NO modificar campos reales - PRESERVAR valores existentes
        console.log(`  ${corredorActual.order}: horaSalidaReal="${corredorActual.horaSalidaReal}", cronoSalidaReal="${corredorActual.cronoSalidaReal}"`);
        
        // 8. Actualizar diferenciaSegundos
        if (!corredorActual.diferenciaSegundos || corredorActual.diferenciaSegundos === 0) {
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
        }
        
        console.log(`Corredor ${i + 1} recalculado: ${corredorActual.horaSalida} (+${diferencia})`);
    }
    
    console.log(`=== Recalculo completado para ${startOrderData.length - startIndex} corredores ===`);
    
    // ✅ Actualizar UI después del recálculo
    updateStartOrderUI();
}

function addRiderPositionStyles() {
    if (document.getElementById('rider-position-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rider-position-styles';
    style.textContent = `
        /* Modal principal - SIN scroll */
        #rider-position-modal .modal-content {
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }
        
        /* Cuerpo del modal - CON scroll */
        #rider-position-modal .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            min-height: 0; /* Importante para flexbox */
        }
        
        /* Formulario interno - SIN scroll */
        .add-rider-form {
            max-height: none;
            overflow-y: visible;
        }
        
        /* Eliminar scrollbars innecesarios */
        .add-rider-form::-webkit-scrollbar {
            display: none;
        }
        
        .form-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .form-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .form-section h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
        }
        
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .half-width {
            flex: 1;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 5px;
            font-weight: 600;
            color: var(--gray-dark);
        }
        
        .form-group label i {
            color: var(--primary);
            width: 16px;
            text-align: center;
        }
        
        .rider-preview {
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--success);
            margin-top: 10px;
        }
        
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .preview-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .preview-item strong {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .preview-value {
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Courier New', monospace;
            padding: 5px 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            word-break: break-word;
            min-height: 36px;
            display: flex;
            align-items: center;
        }
        
        #preview-position, #preview-dorsal {
            color: var(--primary);
        }
        
        #preview-time {
            color: var(--success);
        }
        
        #preview-name, #preview-surname {
            color: var(--info);
        }
        
        #preview-chip {
            color: var(--warning);
        }
        
        .position-info {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px;
            margin: 10px 0;
            background: #e8f4fd;
            border-radius: var(--border-radius);
            color: var(--primary-dark);
        }
        
        .position-info i {
            color: var(--primary);
            margin-top: 2px;
        }
        
        .position-info p {
            margin: 0;
            font-size: 0.9rem;
        }
        
        /* Scrollbar personalizada para el modal */
        #rider-position-modal .modal-body::-webkit-scrollbar {
            width: 8px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
            margin: 5px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Footer fijo en la parte inferior */
        #rider-position-modal .modal-footer {
            margin-top: auto;
            padding: 20px;
            border-top: 1px solid #eee;
            background: white;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* Ajustes responsive */
        @media (max-width: 768px) {
            #rider-position-modal .modal-content {
                max-height: 95vh;
                margin: 10px;
                width: calc(100% - 20px);
            }
            
            .preview-grid {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                flex-direction: column;
                gap: 15px;
            }
            
            .half-width {
                width: 100%;
            }
            
            #rider-position-modal .modal-footer {
                flex-direction: column;
            }
            
            #rider-position-modal .modal-footer button {
                width: 100%;
            }
        }
        
        /* Para pantallas muy pequeñas */
        @media (max-height: 600px) {
            #rider-position-modal .modal-content {
                max-height: 85vh;
            }
            
            .form-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 10px;
            }
        }
        
        /* Para pantallas grandes */
        @media (min-height: 800px) {
            #rider-position-modal .modal-content {
                max-height: 700px;
            }
        }
    `;
    
    document.head.appendChild(style);
} 
// ============================================
// FUNCIÓN PARA MANEJAR CELDAS EDITABLES (MODIFICADA)
// ============================================

function handleTableCellClick(e) {
    // SOLO permitir edición de campos específicos
    const allowedFields = ['dorsal', 'diferencia', 'nombre', 'apellidos', 'chip'];
    
    const cell = e.target;
    
    // Verificar si es un campo editable permitido
    if (!cell.classList.contains('editable') || !cell.hasAttribute('data-field')) {
        return;
    }
    
    const field = cell.getAttribute('data-field');
    
    // Si no está en la lista de campos permitidos, no permitir edición
    if (!allowedFields.includes(field)) {
        return;
    }
    
    // Si ya está editando, no hacer nada
    if (cell.classList.contains('editing')) return;
    
    const row = cell.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));
    
    // Comenzar edición
    if (field === 'diferencia') {
        // Manejo especial para diferencia
        handleTableCellClickForDiferencia(cell, cell.querySelector('.diferencia') || cell);
    } else {
        startCellEditing(cell, index, field);
    }
}

function startCellEditing(cell, index, field) {
    const originalValue = cell.textContent.trim();
    
    // Crear input para edición
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    input.className = 'cell-edit-input';
    
    // Estilos específicos según el campo
    if (field === 'order' || field === 'dorsal') {
        input.type = 'number';
        input.min = '1';
    } else if (field.includes('time') || field.includes('crono')) {
        input.placeholder = 'HH:MM:SS';
        input.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
    }
    
    // Guardar contexto de edición
    cell.setAttribute('data-original-value', originalValue);
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    
    // Enfocar y seleccionar
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
    
    // Configurar eventos del input
    input.addEventListener('blur', function() {
        finishCellEditing(cell, index, field, this.value);
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishCellEditing(cell, index, field, this.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelCellEditing(cell, originalValue);
        }
    });
}

function finishCellEditing(cell, index, field, newValue) {
    const originalValue = cell.getAttribute('data-original-value');
    
    // Si no hubo cambios, cancelar
    if (newValue === originalValue) {
        cancelCellEditing(cell, originalValue);
        return;
    }
    
    // Validar según el campo
    if (!validateFieldValue(field, newValue)) {
        const t = translations[appState.currentLanguage];
        showMessage(t.invalidValue || 'Valor inválido', 'error');
        cancelCellEditing(cell, originalValue);
        return;
    }
    
    // Actualizar los datos
    if (index >= 0 && index < startOrderData.length) {
        const rider = startOrderData[index];
        
        // Guardar valor anterior para cálculos
        const oldValue = rider[field];
        
        // Actualizar campo
        if (field === 'order' || field === 'dorsal') {
            rider[field] = parseInt(newValue) || 0;
        } else if (field.includes('time') || field.includes('crono')) {
            // Asegurar formato HH:MM:SS
            if (newValue && !newValue.includes(':')) {
                // Si solo es un número, interpretar como segundos
                const seconds = parseInt(newValue) || 0;
                if (seconds > 0) {
                    newValue = secondsToTime(seconds);
                } else {
                    newValue = '00:00:00';
                }
            } else if (newValue && newValue.length === 5) {
                // Formato HH:MM -> agregar :00
                newValue += ':00';
            }
            rider[field] = newValue;
        } else {
            rider[field] = newValue;
        }
        
        // Si es un campo de tiempo, actualizar campos relacionados
        if (field === 'horaSalida') {
            // Actualizar segundos
            rider.horaSegundos = timeToSeconds(newValue);
            
            // Actualizar hora prevista si está vacía
            if (!rider.horaSalidaPrevista || rider.horaSalidaPrevista === '00:00:00') {
                rider.horaSalidaPrevista = newValue;
            }
            
            // Actualizar hora real si es igual a la anterior
            if (rider.horaSalidaReal === oldValue) {
                rider.horaSalidaReal = newValue;
                rider.horaSalidaRealSegundos = rider.horaSegundos;
            }
            
            // Recalcular corredores siguientes si cambió la hora
            if (newValue !== oldValue) {
                recalculateFollowingRiders(index + 2); // +2 porque index es base 0
            }
        } 
        else if (field === 'order') {
            // Si cambia el orden, reorganizar la lista
            reorganizeRiders(index, parseInt(newValue));
        }
        else if (field === 'cronoSalida') {
            rider.cronoSegundos = timeToSeconds(newValue);
            
            // Actualizar crono previsto si está vacío
            if (!rider.cronoSalidaPrevista || rider.cronoSalidaPrevista === '00:00:00') {
                rider.cronoSalidaPrevista = newValue;
            }
            
            // Actualizar crono real si es igual al anterior
            if (rider.cronoSalidaReal === oldValue) {
                rider.cronoSalidaReal = newValue;
                rider.cronoSalidaRealSegundos = rider.cronoSegundos;
            }
        }
        else if (field === 'horaSalidaReal') {
            rider.horaSalidaRealSegundos = timeToSeconds(newValue);
        }
        else if (field === 'cronoSalidaReal') {
            rider.cronoSalidaRealSegundos = timeToSeconds(newValue);
        }
        else if (field === 'dorsal') {
            // Actualizar display si dorsal sigue secuencia
            if (rider.dorsal === index + 1) {
                rider.dorsal = parseInt(newValue);
            }
        }
        
        // Actualizar UI completamente
        updateStartOrderUI();
        
        // Guardar datos
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
    }
    
    // Finalizar edición visualmente
    cell.classList.remove('editing');
    cell.removeAttribute('data-original-value');
    cell.textContent = newValue;
}

function cancelCellEditing(cell, originalValue) {
    cell.classList.remove('editing');
    cell.removeAttribute('data-original-value');
    cell.textContent = originalValue;
}

function validateFieldValue(field, value) {
    if (!value && value !== '') return false;
    
    if (field === 'order' || field === 'dorsal') {
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
    } else if (field.includes('time') || field.includes('crono')) {
        return validateTime(value);
    }
    
    return true;
}

function reorganizeRiders(changedIndex, newOrder) {
    console.log(`Reorganizando corredores: índice ${changedIndex} -> orden ${newOrder}`);
    
    if (newOrder < 1) newOrder = 1;
    if (newOrder > startOrderData.length) newOrder = startOrderData.length;
    
    const rider = startOrderData[changedIndex];
    const currentOrder = rider.order;
    
    // Si el orden no cambió realmente
    if (currentOrder === newOrder) {
        console.log('Orden no cambió, saliendo...');
        return;
    }
    
    console.log(`Moviendo corredor ${rider.dorsal} de orden ${currentOrder} a ${newOrder}`);
    
    // Remover el corredor de su posición actual
    startOrderData.splice(changedIndex, 1);
    
    // Encontrar nueva posición basada en el nuevo orden
    const newIndex = newOrder - 1;
    
    // Insertar en nueva posición
    startOrderData.splice(newIndex, 0, rider);
    
    // Recalcular todos los órdenes
    startOrderData.forEach((r, index) => {
        const oldOrder = r.order;
        r.order = index + 1;
        
        console.log(`Corredor ${r.dorsal}: orden ${oldOrder} -> ${r.order}`);
        
        // Si el dorsal sigue la secuencia, actualizarlo
        if (r.dorsal === oldOrder || r.dorsal === 0) {
            r.dorsal = r.order;
        }
    });
    
    // Recalcular todas las horas basadas en el nuevo orden
    recalculateAllStartTimes();
    
    console.log('Reorganización completada');
}

function recalculateAllStartTimes() {
    console.log('Recalculando TODAS las horas de salida...');
    
    if (startOrderData.length === 0) return;
    
    // Obtener hora de inicio del input
    const firstTimeInput = document.getElementById('first-start-time');
    const firstTime = firstTimeInput ? firstTimeInput.value : '09:00:00';
    
    // Validar formato
    let formattedFirstTime = firstTime;
    if (!formattedFirstTime.includes(':')) {
        formattedFirstTime = '09:00:00';
    } else if (formattedFirstTime.length === 5) {
        formattedFirstTime += ':00';
    }
    
    console.log(`Hora de inicio: ${formattedFirstTime}`);
    
    // Calcular para cada corredor
    startOrderData.forEach((corredor, index) => {
        // Calcular diferencia acumulada en segundos
        const diferenciaSegundos = index * 60; // 60 segundos por posición de diferencia
        
        // Calcular hora de salida
        const horaSegundos = timeToSeconds(formattedFirstTime) + diferenciaSegundos;
        
        // Actualizar campos del corredor
        corredor.horaSalida = secondsToTime(horaSegundos);
        corredor.horaSegundos = horaSegundos;
        
        // Crono salida (tiempo desde el inicio de la carrera)
        corredor.cronoSalida = secondsToTime(diferenciaSegundos);
        corredor.cronoSegundos = diferenciaSegundos;
        
        // Actualizar campos previstos si están vacíos
        if (!corredor.horaSalidaPrevista || corredor.horaSalidaPrevista === '00:00:00') {
            corredor.horaSalidaPrevista = corredor.horaSalida;
        }
        
        if (!corredor.cronoSalidaPrevista || corredor.cronoSalidaPrevista === '00:00:00') {
            corredor.cronoSalidaPrevista = corredor.cronoSalida;
        }
        
        // Actualizar campos reales si están vacíos
        if (!corredor.horaSalidaReal || corredor.horaSalidaReal === '00:00:00') {
            corredor.horaSalidaReal = corredor.horaSalida;
            corredor.horaSalidaRealSegundos = horaSegundos;
        }
        
        if (!corredor.cronoSalidaReal || corredor.cronoSalidaReal === '00:00:00') {
            corredor.cronoSalidaReal = corredor.cronoSalida;
            corredor.cronoSalidaRealSegundos = diferenciaSegundos;
        }
        
        console.log(`Corredor ${index + 1} (${corredor.dorsal}): ${corredor.horaSalida}`);
    });
    
    console.log('Recálculo completo de horas');
}

function setupRiderModalResize() {
    let resizeTimer;
    
    function adjustModalHeight() {
        const modal = document.getElementById('rider-position-modal');
        if (!modal || !modal.classList.contains('active')) return;
        
        const viewportHeight = window.innerHeight;
        const headerHeight = modal.querySelector('.modal-header')?.offsetHeight || 60;
        const footerHeight = modal.querySelector('.modal-footer')?.offsetHeight || 70;
        const padding = 40; // Padding vertical adicional
        
        const maxBodyHeight = viewportHeight - headerHeight - footerHeight - padding;
        
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.maxHeight = `${Math.max(200, maxBodyHeight)}px`;
        }
    }
    
    // Ajustar al cargar
    setTimeout(adjustModalHeight, 100);
    
    // Ajustar al redimensionar ventana
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustModalHeight, 250);
    });
    
    // Ajustar cuando el modal se hace visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const modal = document.getElementById('rider-position-modal');
                if (modal && modal.classList.contains('active')) {
                    setTimeout(adjustModalHeight, 50);
                }
            }
        });
    });
    
    const modal = document.getElementById('rider-position-modal');
    if (modal) {
        observer.observe(modal, { attributes: true });
    }
}

function calculateStartTimeForPosition(position) {
    if (startOrderData.length === 0) {
        return document.getElementById('first-start-time').value || '09:00:00';
    }
    
    let horaSalida;
    
    if (position === 1) {
        // Primer corredor
        horaSalida = document.getElementById('first-start-time').value || '09:00:00';
    } else if (position <= startOrderData.length) {
        // Insertar en medio
        const corredorAnterior = startOrderData[position - 2];
        horaSalida = corredorAnterior.horaSalida;
    } else {
        // Al final
        const ultimoCorredor = startOrderData[startOrderData.length - 1];
        
        // Calcular diferencia del último intervalo
        let intervalo = 60; // 1 minuto por defecto
        if (startOrderData.length > 1) {
            const ultimoSegundos = timeToSeconds(ultimoCorredor.horaSalida);
            const penultimoSegundos = timeToSeconds(startOrderData[startOrderData.length - 2].horaSalida);
            intervalo = ultimoSegundos - penultimoSegundos;
        }
        
        const nuevaHoraSegundos = timeToSeconds(ultimoCorredor.horaSalida) + intervalo;
        horaSalida = secondsToTime(nuevaHoraSegundos);
    }
    
    return horaSalida;
}

// Añade esto en la función addAlternatingRowStyles o en otro lugar donde añadas estilos
function addCellEditStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .not-editable {
            background-color: #f5f5f5 !important;
            color: #666 !important;
            cursor: not-allowed !important;
            user-select: none !important;
        }
        
        .editable {
            cursor: pointer !important;
            transition: background-color 0.2s !important;
        }
        
        .editable:hover {
            background-color: #e3f2fd !important;
        }
        
        .editing {
            background-color: #fff3cd !important;
            padding: 0 !important;
        }
        
        .cell-edit-input {
            width: 100% !important;
            height: 100% !important;
            border: 2px solid #4dabf7 !important;
            padding: 4px 8px !important;
            font-size: inherit !important;
            font-family: inherit !important;
            box-sizing: border-box !important;
        }
        
        .diferencia.editable {
            cursor: pointer !important;
            border: 1px dashed #ccc !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
        }
        
        .diferencia.editable:hover {
            background-color: #e3f2fd !important;
            border-color: #4dabf7 !important;
        }
        
        /* Colores para diferencias */
        .diferencia.positiva {
            color: #28a745 !important;
            font-weight: bold !important;
        }
        
        .diferencia.negativa {
            color: #dc3545 !important;
            font-weight: bold !important;
        }
        
        .diferencia.cero {
            color: #6c757d !important;
        }
        
        .diferencia.vacia {
            color: #adb5bd !important;
            font-style: italic !important;
        }
    `;
    document.head.appendChild(style);
}

// Llama a esta función durante la inicialización
addCellEditStyles();

function addDiferenciaEditStyles() {
    if (document.getElementById('diferencia-edit-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'diferencia-edit-styles';
    style.textContent = `
        .diferencia-edit-container {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px;
            background-color: #fff3cd;
        }
        
        .diferencia.editable {
            cursor: pointer !important;
            border: 1px dashed #ccc !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            min-width: 80px !important;
            display: inline-block !important;
            text-align: center !important;
            font-family: 'Courier New', monospace !important;
            font-weight: bold !important;
            transition: all 0.2s !important;
        }
        
        .diferencia.editable:hover {
            background-color: #e3f2fd !important;
            border-color: #4dabf7 !important;
            transform: scale(1.02);
        }
        
        .diferencia.positiva {
            background-color: #d4edda !important;
            color: #155724 !important;
            border: 1px solid #c3e6cb !important;
        }
        
        .diferencia.negativa {
            background-color: #f8d7da !important;
            color: #721c24 !important;
            border: 1px solid #f5c6cb !important;
        }
        
        .diferencia.cero {
            background-color: #e9ecef !important;
            color: #6c757d !important;
            border: 1px solid #dee2e6 !important;
        }
        
        .diferencia.vacia {
            background-color: #f8f9fa !important;
            color: #adb5bd !important;
            border: 1px dashed #dee2e6 !important;
            font-style: italic !important;
        }
        
        /* Estilos para botones de edición */
        .diferencia-btn {
            min-width: 28px;
            height: 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .diferencia-btn:hover {
            transform: scale(1.1);
            opacity: 0.9;
        }
        
        .diferencia-btn.positivo {
            background-color: #28a745;
            color: white;
        }
        
        .diferencia-btn.negativo {
            background-color: #dc3545;
            color: white;
        }
        
        .diferencia-btn.cero {
            background-color: #6c757d;
            color: white;
        }
        
        .diferencia-btn.aceptar {
            background-color: #007bff;
            color: white;
        }
        
        .diferencia-btn.cancelar {
            background-color: #ffc107;
            color: #212529;
        }
    `;
    document.head.appendChild(style);
    console.log("Estilos de diferencia añadidos");
}

// Llama a esta función durante la inicialización
addDiferenciaEditStyles();

function formatTimeValue(timeValue) {
    if (!timeValue) return '00:00:00';
    
    // Si ya es string, asegurarse que tenga el formato correcto
    if (typeof timeValue === 'string') {
        const parts = timeValue.split(':');
        if (parts.length === 2) {
            // Formato HH:MM -> agregar segundos
            return timeValue + ':00';
        } else if (parts.length === 3) {
            // Ya tiene formato HH:MM:SS
            return timeValue;
        }
    }
    
    // Si es número, asumir segundos
    if (typeof timeValue === 'number') {
        return secondsToTime(timeValue);
    }
    
    return '00:00:00';
}

function isRealFieldEmpty(fieldValue) {
    // Un campo real se considera vacío si:
    // 1. Es undefined o null
    // 2. Es string vacío
    // 3. Es '00:00:00' (para campos de tiempo)
    return !fieldValue || 
           fieldValue === '' || 
           fieldValue === '00:00:00' ||
           (typeof fieldValue === 'string' && fieldValue.trim() === '');
}
function isFieldPreserved(fieldName, fieldValue, defaultValue = '') {
    // Determina si un campo debe preservarse (no modificarse)
    const preserved = fieldValue && fieldValue !== '' && fieldValue !== defaultValue;
    
    if (preserved) {
        console.log(`  ${fieldName}: PRESERVADO "${fieldValue}"`);
    } else {
        console.log(`  ${fieldName}: VACÍO/por defecto (no se modifica)`);
    }
    
    return preserved;
}

// Versión simplificada usando la función auxiliar:
function recalculateFollowingRidersSimplified(fromPosition) {
    console.log(`Recalculando corredores desde posición ${fromPosition}...`);
    
    if (fromPosition >= startOrderData.length) {
        console.log('No hay corredores para recalcular');
        return;
    }
    
    for (let i = fromPosition; i < startOrderData.length; i++) {
        const corredorActual = startOrderData[i];
        const corredorAnterior = startOrderData[i - 1];
        
        // 1. Actualizar orden
        corredorActual.order = i + 1;
        
        // 2. Determinar diferencia
        let diferencia = corredorActual.diferencia;
        if (!diferencia || diferencia === '' || diferencia === '00:00:00') {
            diferencia = corredorAnterior.diferencia || '00:01:00';
            corredorActual.diferencia = diferencia;
        }
        
        // 3. Calcular diferencia en segundos
        let diferenciaLimpia = diferencia;
        if (diferencia.includes('(+)')) {
            diferenciaLimpia = diferencia.replace('(+)', '').trim();
        } else if (diferencia.includes('(-)')) {
            diferenciaLimpia = diferencia.replace('(-)', '').trim();
        }
        
        const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
        
        // 4. Calcular nuevos valores principales
        const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
        const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
        
        // Crono salida
        corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
        corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
        
        // Hora salida
        corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
        corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
        
        // 5. Actualizar campos previstas
        corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
        corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
        
        // 6. Campos reales SE PRESERVAN - NO SE MODIFICAN
        // horaSalidaReal, cronoSalidaReal, horaSalidaRealSegundos, cronoSalidaRealSegundos
        // permanecen con sus valores actuales
        
        // 7. Campos importados SE PRESERVAN - NO SE MODIFICAN
        // horaSalidaImportado, cronoSalidaImportado permanecen con sus valores actuales
        
        // 8. Actualizar dorsal si sigue secuencia automática
        if (corredorActual.dorsal === i) {
            corredorActual.dorsal = i + 1;
        }
        
        // 9. Actualizar diferenciaSegundos
        if (!corredorActual.diferenciaSegundos || corredorActual.diferenciaSegundos === 0) {
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
        }
    }
    
    console.log(`Recálculo completado. Campos reales e importados preservados.`);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

// Función para obtener el índice original
function getOriginalIndex(order, dorsal) {
    if (!startOrderData || startOrderData.length === 0) return 0;
    
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}