// ============================================
// ARCHIVO: Crono_CRI_js_Salidas_1.js
// ============================================
// DESCRIPCIÓN: Núcleo del módulo de salidas
// RESPONSABILIDADES:
//   1. Sistema completo de cuenta atrás con sonidos y modos visuales
//   2. Gestión de salidas registradas (departures) con tabla ordenable
//   3. Sistema de intervalos múltiples para diferentes rangos de corredores
//   4. Plantillas Excel para orden de salida (generación e importación)
//   5. Procesamiento de datos importados con corrección de formatos
//   6. Funciones auxiliares de formato de tiempo para PDF/Excel
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - startCountdown()           - Inicia cuenta atrás
//   - registerDeparture()        - Registra salida de corredor
//   - processImportedOrderData() - Procesa Excel importado
//   - createExcelTemplate()      - Genera plantilla Excel
// 
// DEPENDENCIAS: 
//   - appState (global)          - Estado de la aplicación
//   - translations (global)      - Traducciones
//   - XLSX (global)              - Librería Excel
// 
// ARCHIVOS RELACIONADOS:
//   → Salidas_2.js: Usa updateStartOrderUI()
//   → Salidas_3.js: Usa formatTimeValue(), timeToSeconds()
//   → Salidas_4.js: Usa secondsToTime()
// ============================================

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
    const importedData = [];
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const rider = createRiderFromRow(row, columnIndexes, i);
        importedData.push(rider);
    }
    
    // Ordenar por número de orden
    importedData.sort((a, b) => a.order - b.order);
    
    // ASIGNAR A VARIABLE GLOBAL
    startOrderData = importedData;
    
    console.log(`📊 Datos procesados: ${startOrderData.length} corredores`);
    
    // ============ GUARDADO ROBUSTO EN LOCALSTORAGE ============
    console.log("💾 INICIANDO GUARDADO ROBUSTO...");
    
    // 1. Guardar en múltiples claves por seguridad
    try {
        // Clave principal
        localStorage.setItem('cri_start_order_data', JSON.stringify(startOrderData));
        console.log(`✅ Guardado en cri_start_order_data: ${startOrderData.length} corredores`);
        
        // Clave secundaria (compatibilidad)
        localStorage.setItem('start-order-data', JSON.stringify(startOrderData));
        console.log(`✅ Guardado en start-order-data`);
        
        // Clave de backup
        localStorage.setItem('cri_start_order_backup_' + Date.now(), JSON.stringify(startOrderData));
        console.log(`✅ Backup creado`);
        
        // 2. Actualizar carrera actual
        if (appState.currentRace) {
            console.log(`🔄 Actualizando carrera: ${appState.currentRace.name}`);
            
            // Actualizar en appState
            appState.currentRace.startOrder = [...startOrderData];
            appState.currentRace.lastModified = new Date().toISOString();
            appState.currentRace.totalRiders = startOrderData.length;
            
            // Guardar usando saveRaceData
            if (typeof saveRaceData === 'function') {
                console.log("💾 Llamando a saveRaceData()...");
                saveRaceData();
                console.log("✅ saveRaceData completado");
            }
            
            // También actualizar en el array de carreras
            const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
            if (raceIndex !== -1) {
                appState.races[raceIndex].startOrder = [...startOrderData];
                appState.races[raceIndex].totalRiders = startOrderData.length;
                appState.races[raceIndex].lastModified = new Date().toISOString();
                console.log("✅ Carrera actualizada en array");
                
                // Guardar array de carreras
                localStorage.setItem('countdown-races', JSON.stringify(appState.races));
                console.log("✅ Array de carreras guardado");
            }
        }
        
        // 3. Guardar timestamp y bandera
        localStorage.setItem('cri_last_import', new Date().toISOString());
        localStorage.setItem('cri_has_data', 'true');
        localStorage.setItem('cri_data_count', startOrderData.length.toString());
        
        console.log("✅ Datos guardados correctamente");
        
    } catch (error) {
        console.error("❌ Error crítico guardando datos:", error);
        showMessage("Error guardando datos importados", 'error');
        return;
    }
    
    // ============ ACTUALIZACIÓN DE UI ============
    console.log("🔄 Actualizando UI...");
    
    // Actualizar hora de inicio
    if (startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        let horaPrimeraSalida = primerCorredor.horaSalida || primerCorredor.horaSalidaImportado || '09:00:00';
        
        horaPrimeraSalida = formatTimeValue(horaPrimeraSalida);
        
        const firstStartTimeInput = document.getElementById('first-start-time');
        if (firstStartTimeInput) {
            firstStartTimeInput.value = horaPrimeraSalida;
            console.log(`✅ Hora de inicio actualizada: ${horaPrimeraSalida}`);
        }
    }
    
    // Actualizar total de corredores
    const totalCorredores = startOrderData.length;
    
    // Actualizar elementos de total
    const updateElements = [
        'total-corredores-display',
        'total-riders',
        'total-riders-display'
    ];
    
    updateElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.value = totalCorredores;
            } else {
                element.textContent = totalCorredores;
            }
            console.log(`✅ ${id} = ${totalCorredores}`);
        }
    });
    
    // Forzar actualización de tabla INMEDIATAMENTE
    console.log("🔄 Forzando actualización de tabla...");
    if (typeof updateStartOrderTable === 'function') {
        // Limpiar cualquier throttling pendiente
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
            window.updateStartOrderTableTimeout = null;
        }
        
        // Llamar directamente
        updateStartOrderTable();
        console.log("✅ Tabla actualizada directamente");
    }
    
    // Mostrar mensaje
    const message = t.orderImported 
        ? t.orderImported.replace('{count}', startOrderData.length)
        : `Se importaron ${startOrderData.length} corredores correctamente`;
    
    showMessage(message, 'success');
    
    // Mensaje adicional
    setTimeout(() => {
        showMessage(`Datos guardados. Recarga la página para verificar persistencia.`, 'info', 5000);
    }, 1000);
}

// ============================================
// ✅ FUNCIÓN AUXILIAR PARA FORMATEAR HORA
// ============================================
function formatTimeValue(timeStr) {
    if (!timeStr || timeStr === '') return '00:00:00';
    
    // Convertir a string si es necesario
    timeStr = String(timeStr).trim();
    
    // Si ya está en formato HH:MM:SS, devolverlo
    if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Si está en formato HH:MM, añadir segundos
    if (/^\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }
    
    // Si es un número, asumir que son segundos desde medianoche
    if (/^\d+$/.test(timeStr)) {
        const totalSeconds = parseInt(timeStr);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Por defecto, devolver 09:00:00
    return '09:00:00';
}
// ============================================
// ✅ NUEVA FUNCIÓN PARA ACTUALIZAR UI DESPUÉS DE IMPORTAR
// ============================================
function updateImportUIAfterProcessing() {
    console.log("🔄 Actualizando UI después de importación...");
    
    // 1. Actualizar hora de inicio
    if (startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        let horaPrimeraSalida = primerCorredor.horaSalida || primerCorredor.horaSalidaImportado || '09:00:00';
        
        // Formatear hora
        horaPrimeraSalida = formatTimeValue(horaPrimeraSalida);
        
        // Actualizar input
        const firstStartTimeInput = document.getElementById('first-start-time');
        if (firstStartTimeInput) {
            firstStartTimeInput.value = horaPrimeraSalida;
            console.log(`🔄 Hora de salida actualizada en UI: ${horaPrimeraSalida}`);
        }
    }
    
    // 2. Actualizar total de corredores
    const totalCorredores = startOrderData.length;
    
    // Actualizar múltiples elementos que puedan mostrar el total
    const updateElements = [
        'total-corredores-display',
        'total-riders',
        'total-riders-display'
    ];
    
    updateElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.value = totalCorredores;
            } else {
                element.textContent = totalCorredores;
            }
            console.log(`🔄 Elemento ${id} actualizado a: ${totalCorredores}`);
        }
    });
    
    // 3. Forzar actualización de la tabla SIN throttling para respuesta inmediata
    if (typeof updateStartOrderTable === 'function') {
        console.log("🔄 Actualizando tabla inmediatamente...");
        // Usar versión directa sin throttling para actualización inmediata
        updateStartOrderTable();
    } else if (typeof updateStartOrderTableThrottled === 'function') {
        console.log("🔄 Usando versión throttled de la tabla...");
        // Llamar inmediatamente
        if (updateStartOrderTableTimeout) {
            clearTimeout(updateStartOrderTableTimeout);
        }
        updateStartOrderTable();
    }
    
    // 4. Actualizar diferencia de tiempo si existe
    if (typeof updateTimeDifference === 'function') {
        setTimeout(() => {
            updateTimeDifference();
        }, 100);
    }
    
    // 5. Forzar guardado final después de actualizar UI
    setTimeout(() => {
        try {
            localStorage.setItem('cri_start_order_data_final', JSON.stringify(startOrderData));
            console.log("✅ Guardado final completado");
        } catch (error) {
            console.error("Error en guardado final:", error);
        }
    }, 1000);
    
    console.log("✅ UI actualizada después de importación");
}
// ============================================
// ✅ FUNCIÓN AUXILIAR PARA FORMATEAR HORA
// ============================================
function formatTimeValue(timeStr) {
    if (!timeStr || timeStr === '') return '00:00:00';
    
    // Convertir a string si es necesario
    timeStr = String(timeStr).trim();
    
    // Si ya está en formato HH:MM:SS, devolverlo
    if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Si está en formato HH:MM, añadir segundos
    if (/^\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }
    
    // Si es un número, asumir que son segundos desde medianoche
    if (/^\d+$/.test(timeStr)) {
        const totalSeconds = parseInt(timeStr);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Por defecto, devolver 09:00:00
    return '09:00:00';
}
// ============================================
// ✅ AÑADE ESTA NUEVA FUNCIÓN PARA GUARDAR DATOS
// ============================================
function saveImportedDataToStorage() {
    console.log("💾 Guardando datos importados en localStorage...");
    
    try {
        // 1. Guardar startOrderData en localStorage
        localStorage.setItem('cri_start_order_data', JSON.stringify(startOrderData));
        console.log(`✅ Guardados ${startOrderData.length} corredores en localStorage`);
        
        // 2. Actualizar la carrera actual con los datos importados
        if (appState.currentRace) {
            // Asegurar que la carrera tenga los datos de startOrder
            appState.currentRace.startOrder = startOrderData;
            
            // Guardar carrera actualizada
            if (typeof saveRaceData === 'function') {
                saveRaceData();
                console.log("✅ Carrera actualizada y guardada");
            } else {
                // Fallback: guardar manualmente
                const raceKey = `cri_race_${appState.currentRace.id}`;
                localStorage.setItem(raceKey, JSON.stringify(appState.currentRace));
                console.log("✅ Carrera guardada manualmente");
            }
        } else {
            console.warn("⚠️ No hay carrera seleccionada, guardando solo startOrderData");
        }
        
        // 3. Guardar en el array de carreras también
        const races = JSON.parse(localStorage.getItem('cri_races') || '[]');
        const raceIndex = races.findIndex(r => r.id === appState.currentRace?.id);
        if (raceIndex !== -1) {
            races[raceIndex].startOrder = startOrderData;
            localStorage.setItem('cri_races', JSON.stringify(races));
            console.log("✅ Carrera actualizada en lista de carreras");
        }
        
        // 4. Marcar timestamp de última importación
        localStorage.setItem('cri_last_import', new Date().toISOString());
        
        console.log("💾 Datos importados guardados correctamente en localStorage");
        
        return true;
        
    } catch (error) {
        console.error("❌ Error guardando datos importados:", error);
        return false;
    }
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
    
    // OBTENER TODOS LOS CAMPOS DEL EXCEL (AÑADIDO)
    const cronoSalidaExcel = getExcelValue('Crono Salida', '00:00:00');
    const diferenciaExcel = getExcelValue('Diferencia', '00:00:00');
    const nombreExcel = getExcelValue('Nombre', '');           // AÑADIDO
    const apellidosExcel = getExcelValue('Apellidos', '');     // AÑADIDO
    const chipExcel = getExcelValue('Chip', '');               // AÑADIDO
    
    const rider = {
        order: parseInt(getExcelValue('Orden', index + 1)) || (index + 1),
        dorsal: parseInt(getExcelValue('Dorsal', index + 1)) || (index + 1),
        
        // Campos principales - usar la hora procesada
        cronoSalida: formatTimeValue(cronoSalidaExcel),
        horaSalida: horaSalidaExcel, // ✅ Usar la hora procesada
        diferencia: formatTimeValue(diferenciaExcel),
        
        // Campos de datos personales (AÑADIDOS)
        nombre: nombreExcel,        // AÑADIDO
        apellidos: apellidosExcel,  // AÑADIDO
        chip: chipExcel,            // AÑADIDO
        
        // Campos reales vacíos inicialmente
        horaSalidaReal: '',
        cronoSalidaReal: '',
        horaSalidaRealSegundos: 0,
        cronoSalidaRealSegundos: 0,
        
        // Campos previstos (inicialmente iguales a los principales)
        horaSalidaPrevista: formatTimeValue(horaSalidaExcel),
        cronoSalidaPrevista: formatTimeValue(cronoSalidaExcel),
        
        // Campos importados (guardar lo que viene del Excel)
        horaSalidaImportado: horaSalidaExcel,
        cronoSalidaImportado: formatTimeValue(cronoSalidaExcel),
        
        // Campos en segundos para cálculos
        cronoSegundos: timeToSeconds(formatTimeValue(cronoSalidaExcel)),
        horaSegundos: timeToSeconds(horaSalidaExcel),
        
        // Diferencia en segundos (si hay diferencia, calcularla)
        diferenciaSegundos: 0
    };
    
    // Aplicar reglas de importación
    applyImportRules(rider, index);
    
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

