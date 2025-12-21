// ============================================
// FUNCIONES PARA EL HISTORIAL DE SALIDAS
// ============================================
function registerDeparture() {
    const salidaNumber = appState.departedCount + 1;
    appState.departedCount++;
    
    let accumulatedSeconds = 0;
    
    if (appState.raceStartTime) {
        accumulatedSeconds = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    }
    
    const hours = Math.floor(accumulatedSeconds / 3600);
    const minutes = Math.floor((accumulatedSeconds % 3600) / 60);
    const seconds = accumulatedSeconds % 60;
    const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const departure = {
        corredor: salidaNumber,
        timestamp: Date.now(),
        notes: '',
        editing: false,
        timeValue: timeValue,
        elapsedSeconds: accumulatedSeconds
    };
    
    appState.departureTimes.push(departure);
    
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
    
    if (appState.departureTimes.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
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
        
        const row = document.createElement('tr');
        
        const time = new Date(departure.timestamp);
        const timeStr = time.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        const dateStr = time.toLocaleDateString('es-ES');
        
        const t = translations[appState.currentLanguage];
        const actualIndex = originalIndex !== -1 ? originalIndex : displayIndex;
        
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
        
        const buttonContainer = saveButton.closest('.notes-buttons');
        if (buttonContainer) {
            buttonContainer.addEventListener('click', function(e) { e.stopPropagation(); });
        }
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
    
    if (appState.currentRace) {
        const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
        if (raceIndex !== -1) {
            appState.races[raceIndex].departures = [...appState.departureTimes];
            saveRacesToStorage();
            console.log("Nota guardada para corredor:", appState.departureTimes[index].corredor);
        }
    }
    
    setTimeout(() => { renderDeparturesList(); }, 50);
}

// ============================================
// FUNCIONES DE INTERFAZ DE USUARIO
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

function updateModalTexts() {
    const t = translations[appState.currentLanguage];
    
    document.getElementById('help-modal-title').textContent = t.helpModalTitle;
    document.getElementById('help-modal-text1').textContent = t.helpModalText1;
    document.getElementById('help-modal-subtitle1').textContent = t.helpModalSubtitle1;
    document.getElementById('help-modal-subtitle2').textContent = t.helpModalSubtitle2;
    document.getElementById('help-modal-subtitle3').textContent = t.helpModalSubtitle3;
    document.getElementById('help-modal-text2').textContent = t.helpModalText2;
    document.getElementById('help-modal-ok').textContent = t.understood;
    
    document.getElementById('red-background-text').textContent = t.redBackground;
    document.getElementById('yellow-background-text').textContent = t.yellowBackground;
    document.getElementById('green-background-text').textContent = t.greenBackground;
    document.getElementById('red-numbers-text').textContent = t.redNumbers;
    document.getElementById('countdown-normal-desc').textContent = t.countdownNormalDesc;
    document.getElementById('configured-sections-label').textContent = t.configuredSections;
    document.getElementById('countdown-warning-desc').textContent = t.countdownWarningDesc;
    document.getElementById('countdown-critical-desc').textContent = t.countdownCriticalDesc;
    document.getElementById('countdown-salida-desc').textContent = t.countdownSalidaDesc;
    
    document.getElementById('beep-high-text').textContent = t.beepHigh;
    document.getElementById('beep-high-desc').textContent = t.beepHighDesc;
    document.getElementById('beep-every-second-text').textContent = t.beepEverySecond;
    document.getElementById('beep-every-second-desc').textContent = t.beepEverySecondDesc;
    document.getElementById('beep-low-text').textContent = t.beepLow;
    document.getElementById('beep-low-desc').textContent = t.beepLowDesc;
    
    const helpList = document.getElementById('help-modal-list');
    if (helpList) {
        helpList.innerHTML = '';
        t.helpModalList.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.style.marginBottom = '8px';
            helpList.appendChild(li);
        });
    }
    
    document.getElementById('edit-interval-modal-title').textContent = t.editIntervalModalTitle;
    document.getElementById('departure-header-dorsal').textContent = t.departureHeaderDorsal;
    document.getElementById('departure-header-time').textContent = t.departureHeaderTime;
    document.getElementById('departure-header-notes').textContent = t.departureHeaderNotes;
    document.getElementById('departure-header-date').textContent = t.departureHeaderDate;
    document.getElementById('no-departures-text').textContent = t.noDeparturesText;
    
    if (appState.departureTimes.length > 0) renderDeparturesList();
    
    document.getElementById('delete-race-modal-title').textContent = t.deleteRaceModalTitle;
    document.getElementById('delete-race-modal-text').textContent = t.deleteRaceModalText;
    document.getElementById('delete-race-confirm-btn').textContent = t.deleteConfirm;
    document.getElementById('delete-race-cancel-btn').textContent = t.cancel;
    
    document.getElementById('clear-departures-modal-title').textContent = t.clearDeparturesModalTitle;
    document.getElementById('clear-departures-modal-text').textContent = t.clearDeparturesModalText;
    document.getElementById('clear-departures-confirm-btn').textContent = t.clear;
    document.getElementById('clear-departures-cancel-btn').textContent = t.cancel;
    
    document.getElementById('suggestions-modal-title').textContent = t.suggestionsModalTitle;
    document.getElementById('suggestion-email-label').textContent = t.suggestionEmailLabel;
    document.getElementById('suggestion-text-label').textContent = t.suggestionTextLabel;
    document.getElementById('send-suggestion-btn').textContent = t.sendSuggestion;
    document.getElementById('cancel-suggestion-btn').textContent = t.cancel;
    
    document.getElementById('new-race-modal-title').textContent = t.newRaceModalTitle;
    document.getElementById('new-race-name-label').textContent = t.newRaceNameLabel;
    document.getElementById('new-race-desc-label').textContent = t.newRaceDescLabel;
    document.getElementById('create-race-btn').textContent = t.createRace;
    document.getElementById('cancel-create-race-btn').textContent = t.cancel;
    
    document.getElementById('restart-modal-title').textContent = t.restartModalTitle;
    document.getElementById('restart-modal-text').textContent = t.restartModalText;
    document.getElementById('restart-confirm-btn').textContent = t.restartConfirm;
    document.getElementById('restart-cancel-btn').textContent = t.cancel;

    const helpModalText = document.querySelector('#help-modal .modal-body');
    if (helpModalText) {
        const audioSection = document.createElement('div');
        audioSection.innerHTML = `
            <h4 id="help-modal-subtitle3">Opciones de sonido:</h4>
            <ul>
                <li><strong>Sonidos Beep:</strong> Beeps electrónicos para cada segundo</li>
                <li><strong>Voz grabada:</strong> Voz humana contando en tu idioma (es, en, ca, fr)</li>
                <li><strong>Sin sonido:</strong> Solo efectos visuales</li>
            </ul>
        `;
        helpModalText.appendChild(audioSection);
    }
}

function renderIntervalsList() {
    const container = document.getElementById('intervals-list');
    container.innerHTML = '';
    
    const sortedIntervals = [...appState.intervals].sort((a, b) => a.from - b.from);
    
    sortedIntervals.forEach((interval, index) => {
        const row = document.createElement('div');
        row.className = 'interval-row';
        row.setAttribute('data-index', index);
        row.innerHTML = `
            <div class="interval-info">
                <div class="interval-range">
                    <strong>${interval.from} - ${interval.to}</strong>
                </div>
                <div class="interval-time">
                    <i class="fas fa-clock"></i> 
                    ${interval.minutes}min ${interval.seconds.toString().padStart(2, '0')}s
                </div>
            </div>
            <div class="interval-actions">
                <button class="btn btn-secondary btn-sm edit-interval-btn" 
                        data-index="${index}" 
                        title="Editar este tramo"
                        onclick="event.stopPropagation();">
                    <i class="fas fa-edit"></i>
                    <span class="btn-text">Editar</span>
                </button>
                <button class="btn btn-danger btn-sm remove-interval-btn" 
                        data-index="${index}" 
                        title="Eliminar este tramo"
                        onclick="event.stopPropagation();">
                    <i class="fas fa-trash"></i>
                    <span class="btn-text">Eliminar</span>
                </button>
            </div>
        `;
        updateIntervalCount();

        setTimeout(() => { refreshIntervalButtons(); }, 100);
        container.appendChild(row);
    });
    
    if (appState.intervals.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
            <i class="fas fa-plus-circle" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px;"></i>
            <p style="color: var(--gray); font-style: italic;">
                No hay tramos configurados. Añade el primer tramo usando el formulario superior.
            </p>
        `;
        container.appendChild(emptyMessage);
    }
    
    updateIntervalCount();
}

// ============================================
// FUNCIÓN PARA ACTUALIZAR HORA ACTUAL
// ============================================
function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    const countdownDisplay = document.getElementById('current-time-value');
    if (countdownDisplay) countdownDisplay.textContent = timeStr;
    
    const systemTimeDisplay = document.getElementById('current-system-time');
    if (systemTimeDisplay) systemTimeDisplay.textContent = timeStr;
}

updateCurrentTime();