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

function createExcelTemplate(numCorredores, intervalo, horaInicio) {
    const t = translations[appState.currentLanguage];
    
    // Convertir intervalo a valor numérico de Excel
    const intervaloExcel = timeToExcelValue(intervalo);
    const horaInicioExcel = timeToExcelValue(horaInicio);
    
    // Crear encabezados - AÑADIR LOS NUEVOS CAMPOS
    const headers = ['Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Diferencia', 'Nombre', 'Apellidos', 'Chip', 
                    'Hora Salida Real', 'Crono Salida Real', 
                    'Crono Salida Real Segundos', 'Hora Salida Real Segundos',  // NUEVOS CAMPOS
                    'Hora Salida Prevista', 'Crono Salida Prevista', 
                    'Hora Salida Importado', 'Crono Salida Importado', 
                    'Crono Segundos', 'Hora Segundos'];
    
    // Crear los datos
    const data = [headers];
    
    for (let i = 1; i <= numCorredores; i++) {
        const row = new Array(headers.length).fill('');
        
        // Orden
        row[0] = i;
        
        // Crono Salida (C)
        if (i === 1) {
            row[2] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[2] = { t: 'n', f: `C${i}+E${i+1}`, z: 'hh:mm:ss' };
        }
        
        // Hora Salida (D)
        if (i === 1) {
            row[3] = { t: 'n', v: horaInicioExcel, z: 'hh:mm:ss' };
        } else {
            row[3] = { t: 'n', f: `D${i}+E${i+1}`, z: 'hh:mm:ss' };
        }
        
        // Diferencia (E)
        if (i === 1) {
            row[4] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[4] = { t: 'n', v: intervaloExcel, z: 'hh:mm:ss' };
        }
        
        // Crono Salida Real Segundos (K) - fórmula para convertir tiempo a segundos
        row[10] = { t: 'n', f: `HOUR(I${i+1})*3600 + MINUTE(I${i+1})*60 + SECOND(I${i+1})` };
        
        // Hora Salida Real Segundos (L) - fórmula para convertir tiempo a segundos
        row[11] = { t: 'n', f: `HOUR(H${i+1})*3600 + MINUTE(H${i+1})*60 + SECOND(H${i+1})` };
        
        // Crono Segundos (Q)
        row[16] = { t: 'n', f: `HOUR(C${i+1})*3600 + MINUTE(C${i+1})*60 + SECOND(C${i+1})` };
        
        // Hora Segundos (R)
        row[17] = { t: 'n', f: `HOUR(D${i+1})*3600 + MINUTE(D${i+1})*60 + SECOND(D${i+1})` };
        
        data.push(row);
    }
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(data, { cellStyles: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Salida");
    
    // Ajustar anchos - actualizar para incluir nuevas columnas
    const colWidths = [
        {wch: 8}, {wch: 8}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 15}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 10}, {wch: 10},  // Nuevas columnas para segundos reales
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12}
    ];
    ws['!cols'] = colWidths;
    
    // Aplicar formato HORA a las columnas de tiempo
    for (let r = 1; r <= numCorredores; r++) {
        // Columnas de tiempo (C, D, H, I, M, N, O, P)
        const timeColumns = [2, 3, 8, 9, 12, 13, 14, 15];
        
        timeColumns.forEach(c => {
            const cell = XLSX.utils.encode_cell({r: r, c: c});
            if (!ws[cell]) {
                ws[cell] = { t: 's', v: '' };
            }
            ws[cell].z = 'hh:mm:ss';
            if (!ws[cell].s) ws[cell].s = {};
            ws[cell].s.numFmt = 'hh:mm:ss';
        });
        
        // Columnas de segundos (K, L, Q, R) - números enteros
        const secondsColumns = [10, 11, 16, 17];
        secondsColumns.forEach(c => {
            const cell = XLSX.utils.encode_cell({r: r, c: c});
            if (ws[cell] && !ws[cell].s) ws[cell].s = {};
            if (ws[cell] && ws[cell].s) {
                ws[cell].s.numFmt = '0';
            }
        });
    }
    
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

function importStartOrder() {
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
                
                // Mostrar mensaje de éxito
                const message = t.orderImported.replace('{count}', startOrderData.length);
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

function processImportedOrderData(jsonData) {
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
    
    // Actualizar UI
    updateStartOrderUI();
}

function createRiderFromRow(row, columnIndexes, index) {
    const rider = {
        order: getCellValue(row, columnIndexes['Orden']) || index,
        dorsal: getCellValue(row, columnIndexes['Dorsal']) || 0,
        cronoSalida: formatTimeValue(getCellValue(row, columnIndexes['Crono Salida'])),
        horaSalida: formatTimeValue(getCellValue(row, columnIndexes['Hora Salida'])),
        nombre: getCellValue(row, columnIndexes['Nombre']) || '',
        apellidos: getCellValue(row, columnIndexes['Apellidos']) || '',
        chip: getCellValue(row, columnIndexes['Chip']) || '',
        horaSalidaReal: formatTimeValue(getCellValue(row, columnIndexes['Hora Salida Real'])),
        cronoSalidaReal: formatTimeValue(getCellValue(row, columnIndexes['Crono Salida Real'])),
        
        // NUEVOS CAMPOS PARA SEGUNDOS
        cronoSalidaRealSegundos: parseInt(getCellValue(row, columnIndexes['Crono Salida Real Segundos'])) || 0,
        horaSalidaRealSegundos: parseInt(getCellValue(row, columnIndexes['Hora Salida Real Segundos'])) || 0,
        
        horaSalidaPrevista: formatTimeValue(getCellValue(row, columnIndexes['Hora Salida Prevista'])),
        cronoSalidaPrevista: formatTimeValue(getCellValue(row, columnIndexes['Crono Salida Prevista'])),
        horaSalidaImportado: formatTimeValue(getCellValue(row, columnIndexes['Hora Salida Importado'])),
        cronoSalidaImportado: formatTimeValue(getCellValue(row, columnIndexes['Crono Salida Importado'])),
        cronoSegundos: parseInt(getCellValue(row, columnIndexes['Crono Segundos'])) || 0,
        horaSegundos: parseInt(getCellValue(row, columnIndexes['Hora Segundos'])) || 0
    };
    
    // Aplicar lógica de relleno automático (modificar esta función)
    applyImportRules(rider, index - 1);
    
    return rider;
}

function applyImportRules(rider, index) {
    // 1. Si faltan valores críticos, calcularlos
    if (!rider.horaSalida || rider.horaSalida === '00:00:00' || rider.horaSalida === '') {
        rider.horaSalida = calculateStartTime(index);
    }
    if (!rider.cronoSalida || rider.cronoSalida === '00:00:00' || rider.cronoSalida === '') {
        rider.cronoSalida = secondsToTime(index * 60);
    }
    
    // 2. Rellenar campos importados si están vacíos
    if (!rider.horaSalidaImportado || rider.horaSalidaImportado === '00:00:00' || rider.horaSalidaImportado === '') {
        rider.horaSalidaImportado = rider.horaSalida;
    }
    if (!rider.cronoSalidaImportado || rider.cronoSalidaImportado === '00:00:00' || rider.cronoSalidaImportado === '') {
        rider.cronoSalidaImportado = rider.cronoSalida;
    }
    
    // 3. Rellenar campos previstos si están vacíos
    if (!rider.horaSalidaPrevista || rider.horaSalidaPrevista === '00:00:00' || rider.horaSalidaPrevista === '') {
        rider.horaSalidaPrevista = rider.horaSalida;
    }
    if (!rider.cronoSalidaPrevista || rider.cronoSalidaPrevista === '00:00:00' || rider.cronoSalidaPrevista === '') {
        rider.cronoSalidaPrevista = rider.cronoSalida;
    }
    
    // 4. Rellenar campos reales si están vacíos
    if (!rider.horaSalidaReal || rider.horaSalidaReal === '00:00:00' || rider.horaSalidaReal === '') {
        rider.horaSalidaReal = rider.horaSalida;
    }
    if (!rider.cronoSalidaReal || rider.cronoSalidaReal === '00:00:00' || rider.cronoSalidaReal === '') {
        rider.cronoSalidaReal = rider.cronoSalida;
    }
    
    // 5. Calcular segundos si no están presentes
    if (!rider.cronoSegundos || rider.cronoSegundos === 0) {
        rider.cronoSegundos = timeToSeconds(rider.cronoSalida);
    }
    if (!rider.horaSegundos || rider.horaSegundos === 0) {
        rider.horaSegundos = timeToSeconds(rider.horaSalida);
    }
    
    // 6. CALCULAR LOS NUEVOS SEGUNDOS REALES SI NO EXISTEN
    if (!rider.cronoSalidaRealSegundos || rider.cronoSalidaRealSegundos === 0) {
        rider.cronoSalidaRealSegundos = timeToSeconds(rider.cronoSalidaReal);
    }
    if (!rider.horaSalidaRealSegundos || rider.horaSalidaRealSegundos === 0) {
        rider.horaSalidaRealSegundos = timeToSeconds(rider.horaSalidaReal);
    }
}

function updateStartOrderUI() {
    const totalCorredores = startOrderData.length;
    document.getElementById('total-riders').value = totalCorredores;
    
    // Actualizar hora de inicio basada en el primer corredor
    if (startOrderData.length > 0 && startOrderData[0].horaSalida) {
        const firstTime = startOrderData[0].horaSalida;
        
        // Asegurar formato HH:MM:SS completo
        let horaInicioValue = firstTime;
        
        // Si solo tiene formato HH:MM, agregar :00
        if (horaInicioValue && horaInicioValue.length === 5) {
            horaInicioValue += ':00';
        }
        
        // Si no tiene segundos, agregarlos
        const parts = horaInicioValue.split(':');
        if (parts.length === 2) {
            horaInicioValue += ':00';
        }
        
        // Validar y formatear correctamente
        horaInicioValue = formatTimeValue(horaInicioValue);
        
        document.getElementById('first-start-time').value = horaInicioValue;
        
        // Actualizar el valor original también
        originalTimeValue = horaInicioValue;
        
        console.log('Hora de inicio actualizada desde Excel:', horaInicioValue);
    }
    
    // Actualizar tabla
    updateStartOrderTable();
    
    // Guardar datos
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
}
function updateStartOrderTable() {
    const tableBody = document.getElementById('start-order-table-body');
    const emptyState = document.getElementById('start-order-empty');
    
    if (!tableBody || !emptyState) return;
    
    if (startOrderData.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    let html = '';
    startOrderData.forEach((rider, index) => {
        html += `
        <tr data-index="${index}">
            <td class="number-cell editable" data-field="order">${rider.order}</td>
            <td class="number-cell editable" data-field="dorsal">${rider.dorsal}</td>
            <td class="time-cell editable" data-field="cronoSalida">${rider.cronoSalida}</td>
            <td class="time-cell editable" data-field="horaSalida">${rider.horaSalida}</td>
            <td class="name-cell editable" data-field="nombre">${rider.nombre}</td>
            <td class="name-cell editable" data-field="apellidos">${rider.apellidos}</td>
            <td class="editable" data-field="chip">${rider.chip}</td>
            <td class="time-cell editable" data-field="horaSalidaReal">${rider.horaSalidaReal}</td>
            <td class="time-cell editable" data-field="cronoSalidaReal">${rider.cronoSalidaReal}</td>
            
            <!-- NUEVOS CAMPOS - solo lectura -->
            <td class="number-cell">${rider.cronoSalidaRealSegundos}</td>
            <td class="number-cell">${rider.horaSalidaRealSegundos}</td>
            
            <td class="time-cell">${rider.horaSalidaPrevista}</td>
            <td class="time-cell">${rider.cronoSalidaPrevista}</td>
            <td class="time-cell">${rider.horaSalidaImportado}</td>
            <td class="time-cell">${rider.cronoSalidaImportado}</td>
            <td class="number-cell">${rider.cronoSegundos}</td>
            <td class="number-cell">${rider.horaSegundos}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Añadir event listeners para edición
    document.querySelectorAll('.start-order-table td.editable').forEach(cell => {
        cell.addEventListener('click', handleTableCellClick);
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
    
    // Calcular y almacenar diferencias antes de cambiar
    const differences = [];
    startOrderData.forEach((rider, index) => {
        differences[index] = (rider.horaSegundos || 0) - oldFirstSeconds;
    });
    
    // Aplicar nuevas horas manteniendo diferencias y actualizando horaSegundos
    startOrderData.forEach((rider, index) => {
        // Calcular nuevos segundos
        rider.horaSegundos = newFirstSeconds + differences[index];
        
        // Convertir a formato HH:MM:SS
        rider.horaSalida = secondsToTime(rider.horaSegundos);
        
        console.log(`Corredor ${index + 1}: Diferencia ${differences[index]}s -> ${rider.horaSalida} (${rider.horaSegundos}s)`);
    });
    
    // Actualizar valores
    originalTimeValue = newTime;
    document.getElementById('first-start-time').value = newTime;
    
    // Actualizar UI y guardar
    if (typeof updateStartOrderUI === 'function') {
        updateStartOrderUI();
    } else {
        updateStartOrderTable();
    }
    
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    console.log('Actualización completada manteniendo diferencias exactas');
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


