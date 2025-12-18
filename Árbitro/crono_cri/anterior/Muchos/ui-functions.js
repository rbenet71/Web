function updateLanguageUI() {
    const lang = appState.currentLanguage;
    const t = translations[lang];
    document.getElementById('app-title-text').textContent = t.appTitle;
    document.getElementById('languages-label').textContent = t.languagesLabel;
    document.getElementById('card-race-title').textContent = t.cardRaceTitle;
    document.getElementById('new-race-text').textContent = t.newRaceText;
    document.getElementById('delete-race-text').textContent = t.deleteRaceText;
    document.getElementById('card-time-title').textContent = t.cardTimeTitle;
    document.getElementById('same-interval-text').textContent = t.sameIntervalText;
    document.getElementById('variable-interval-text').textContent = t.variableIntervalText;
    document.getElementById('interval-time-label').textContent = t.intervalTimeLabel;
    document.getElementById('minutes-text').textContent = t.minutesText;
    document.getElementById('seconds-text').textContent = t.secondsText;
    document.getElementById('add-interval-label').textContent = t.addIntervalLabel;
    document.getElementById('to-text').textContent = t.toText;
    document.getElementById('add-interval-text').textContent = t.addIntervalText;
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
    document.querySelectorAll('.flag').forEach(flag => flag.classList.remove('active'));
    document.getElementById('flag-' + lang).classList.add('active');
    updateModalTexts();
}

function renderDeparturesList() {
    const tableBody = document.getElementById('departures-table-body');
    const emptyState = document.getElementById('departures-empty');
    if (appState.departureTimes.length === 0) { tableBody.innerHTML = ''; emptyState.style.display = 'block'; return; }
    emptyState.style.display = 'none';
    const sortedDepartures = [...appState.departureTimes].sort((a, b) => {
        let valueA, valueB;
        switch(sortState.column) {
            case 'dorsal': valueA = a.corredor; valueB = b.corredor; break;
            case 'timeValue': valueA = a.elapsedSeconds || 0; valueB = b.elapsedSeconds || 0; break;
            case 'notes': valueA = (a.notes || '').toLowerCase(); valueB = (b.notes || '').toLowerCase(); break;
            case 'date': valueA = a.timestamp; valueB = b.timestamp; break;
            default: valueA = a.timestamp; valueB = b.timestamp;
        }
        if (sortState.direction === 'asc') return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
        else return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
    });
    tableBody.innerHTML = '';
    sortedDepartures.forEach((departure, displayIndex) => {
        const originalIndex = appState.departureTimes.findIndex(d => d.corredor === departure.corredor && d.timestamp === departure.timestamp);
        const row = document.createElement('tr');
        const time = new Date(departure.timestamp);
        const timeStr = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = time.toLocaleDateString('es-ES');
        const t = translations[appState.currentLanguage];
        const actualIndex = originalIndex !== -1 ? originalIndex : displayIndex;
        row.innerHTML = `
            <td class="departure-dorsal-cell">${departure.corredor}</td>
            <td class="departure-time-value-cell">${departure.timeValue || '--:--:--'}</td>
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
            <td class="departure-date-cell">${dateStr}<br>${timeStr}</td>
        `;
        tableBody.appendChild(row);
        if (departure.editing) setupEditingMode(actualIndex);
        else {
            const displayElement = row.querySelector('.departure-notes-display');
            if (displayElement) displayElement.addEventListener('click', function(e) {
                e.stopPropagation();
                const idx = parseInt(this.getAttribute('data-index'));
                if (idx >= 0 && idx < appState.departureTimes.length) {
                    appState.departureTimes[idx].editing = true;
                    renderDeparturesList();
                }
            });
        }
    });
    updateSortIndicators();
}