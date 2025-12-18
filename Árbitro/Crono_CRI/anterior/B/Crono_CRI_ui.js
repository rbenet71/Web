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

function updateLanguageUI() {
    const lang = appState.currentLanguage;
    const t = translations[lang];

    document.getElementById('audio-config-title').textContent = t.audioConfigTitle;
    document.getElementById('beep-option-title').textContent = t.beepOptionTitle;
    document.getElementById('test-audio-text').textContent = t.testAudioText;

    document.querySelectorAll('.audio-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`.audio-option[data-audio-type="${appState.audioType}"]`).classList.add('active');

    document.getElementById('app-title-text').textContent = t.appTitle;
    document.getElementById('languages-label').textContent = t.languagesLabel;
    document.getElementById('card-race-title').textContent = t.cardRaceTitle;
    document.getElementById('new-race-text').textContent = t.newRaceText;
    document.getElementById('delete-race-text').textContent = t.deleteRaceText;
    document.getElementById('card-time-title').textContent = t.cardTimeTitle;
    
    // SOLO MANTENER ESTOS (eliminar referencias a tramos variables)
    document.getElementById('interval-time-label').textContent = t.intervalTimeLabel;
    document.getElementById('minutes-text').textContent = t.minutesText;
    document.getElementById('seconds-text').textContent = t.secondsText;
    
    document.getElementById('start-from-x-text').textContent = t.currentPositionText;
    
    document.getElementById('card-departures-title').textContent = t.cardDeparturesTitle;
    document.getElementById('clear-departures-text').textContent = t.clearDeparturesText;
    document.getElementById('export-excel-text').textContent = t.exportExcelText;
    document.getElementById('start-countdown-text').textContent = t.startCountdownText;
    document.getElementById('exit-complete-text').textContent = t.exitCompleteText;
    document.getElementById('total-time-label').textContent = t.totalTimeLabel;
    document.getElementById('countdown-label').textContent = t.countdownlabel;
    
    document.getElementById('next-corredor-label').textContent = t.nextCorredorLabel;
    document.getElementById('departed-label').textContent = t.departedLabel;
    document.getElementById('help-text').textContent = t.helpText;
    document.getElementById('suggestions-text').textContent = t.suggestionsText;
    document.getElementById('install-text').textContent = t.installText;
    document.getElementById('update-text').textContent = t.updateText;

    const salidaDisplay = document.getElementById('salida-display');
    if (salidaDisplay) salidaDisplay.textContent = t.salidaText;
    
    document.querySelectorAll('.flag').forEach(flag => {
        flag.classList.remove('active');
    });
    
    // Verificar que el elemento existe antes de usarlo
    const flagElement = document.getElementById('flag-' + lang);
    if (flagElement) {
        flagElement.classList.add('active');
    } else {
        console.warn(`Elemento flag-${lang} no encontrado`);
    }
    
    updateModalTexts();
}
function updateModalTexts() {
    const t = translations[appState.currentLanguage];
    
    // Función auxiliar para establecer texto solo si el elemento existe
    function setTextIfExists(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        } else {
            console.warn(`Elemento ${elementId} no encontrado para establecer texto`);
        }
    }
    
    // Usar la función auxiliar para todos los elementos
    setTextIfExists('help-modal-title', t.helpModalTitle);
    setTextIfExists('help-modal-text1', t.helpModalText1);
    setTextIfExists('help-modal-subtitle1', t.helpModalSubtitle1);
    setTextIfExists('help-modal-subtitle2', t.helpModalSubtitle2);
    setTextIfExists('help-modal-subtitle3', t.helpModalSubtitle3);
    setTextIfExists('help-modal-text2', t.helpModalText2);
    setTextIfExists('help-modal-ok', t.understood);
    
    setTextIfExists('red-background-text', t.redBackground);
    setTextIfExists('yellow-background-text', t.yellowBackground);
    setTextIfExists('green-background-text', t.greenBackground);
    setTextIfExists('red-numbers-text', t.redNumbers);
    setTextIfExists('countdown-normal-desc', t.countdownNormalDesc);
    setTextIfExists('countdown-warning-desc', t.countdownWarningDesc);
    setTextIfExists('countdown-critical-desc', t.countdownCriticalDesc);
    setTextIfExists('countdown-salida-desc', t.countdownSalidaDesc);
    
    setTextIfExists('beep-high-text', t.beepHigh);
    setTextIfExists('beep-high-desc', t.beepHighDesc);
    setTextIfExists('beep-every-second-text', t.beepEverySecond);
    setTextIfExists('beep-every-second-desc', t.beepEverySecondDesc);
    setTextIfExists('beep-low-text', t.beepLow);
    setTextIfExists('beep-low-desc', t.beepLowDesc);
    
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
    
    setTextIfExists('departure-header-dorsal', t.departureHeaderDorsal);
    setTextIfExists('departure-header-time', t.departureHeaderTime);
    setTextIfExists('departure-header-notes', t.departureHeaderNotes);
    setTextIfExists('departure-header-date', t.departureHeaderDate);
    setTextIfExists('no-departures-text', t.noDeparturesText);
    
    if (appState.departureTimes.length > 0) renderDeparturesList();
    
    setTextIfExists('delete-race-modal-title', t.deleteRaceModalTitle);
    setTextIfExists('delete-race-modal-text', t.deleteRaceModalText);
    setTextIfExists('delete-race-confirm-btn', t.deleteConfirm);
    setTextIfExists('delete-race-cancel-btn', t.cancel);
    
    setTextIfExists('clear-departures-modal-title', t.clearDeparturesModalTitle);
    setTextIfExists('clear-departures-modal-text', t.clearDeparturesModalText);
    setTextIfExists('clear-departures-confirm-btn', t.clear);
    setTextIfExists('clear-departures-cancel-btn', t.cancel);
    
    setTextIfExists('suggestions-modal-title', t.suggestionsModalTitle);
    setTextIfExists('suggestion-email-label', t.suggestionEmailLabel);
    setTextIfExists('suggestion-text-label', t.suggestionTextLabel);
    setTextIfExists('send-suggestion-btn', t.sendSuggestion);
    setTextIfExists('cancel-suggestion-btn', t.cancel);
    
    setTextIfExists('new-race-modal-title', t.newRaceModalTitle);
    setTextIfExists('new-race-name-label', t.newRaceNameLabel);
    setTextIfExists('new-race-desc-label', t.newRaceDescLabel);
    setTextIfExists('create-race-btn', t.createRace);
    setTextIfExists('cancel-create-race-btn', t.cancel);
    
    setTextIfExists('restart-modal-title', t.restartModalTitle);
    setTextIfExists('restart-modal-text', t.restartModalText);
    setTextIfExists('restart-confirm-btn', t.restartConfirm);
    setTextIfExists('restart-cancel-btn', t.cancel);

    const helpModalText = document.querySelector('#help-modal .modal-body');
    if (helpModalText) {
        // Verificar si ya existe la sección de audio para no duplicarla
        let audioSection = document.querySelector('#help-modal .modal-body .audio-info-section');
        if (!audioSection) {
            audioSection = document.createElement('div');
            audioSection.className = 'audio-info-section';
            audioSection.innerHTML = `
                <h4>Opciones de sonido:</h4>
                <ul>
                    <li><strong>Sonidos Beep:</strong> Beeps electrónicos para cada segundo</li>
                    <li><strong>Voz grabada:</strong> Voz humana contando en tu idioma (es, en, ca, fr)</li>
                    <li><strong>Sin sonido:</strong> Solo efectos visuales</li>
                </ul>
            `;
            helpModalText.appendChild(audioSection);
        }
    }
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