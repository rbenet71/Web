function registerDeparture() {
    const salidaNumber = appState.departedCount + 1;
    appState.departedCount++;
    let accumulatedSeconds = 0;
    if (appState.raceStartTime) accumulatedSeconds = Math.floor((Date.now() - appState.raceStartTime) / 1000);
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

function setupSorting() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            if (sortState.column === column) sortState.direction = sortState.direction === 'asc' ? 'desc' : 'asc';
            else { sortState.column = column; sortState.direction = 'asc'; }
            renderDeparturesList();
        });
    });
}

function updateSortIndicators() {
    document.querySelectorAll('.departures-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        const column = th.getAttribute('data-sort');
        if (column === sortState.column) th.classList.add(sortState.direction);
    });
}

function setupEditingMode(index) {
    const inputElement = document.querySelector(`.departure-notes-input[data-index="${index}"]`);
    const saveButton = document.querySelector(`.save-notes-btn[data-index="${index}"]`);
    const cancelButton = document.querySelector(`.cancel-notes-btn[data-index="${index}"]`);
    if (inputElement) {
        inputElement.addEventListener('click', e => e.stopPropagation());
        inputElement.addEventListener('focus', e => e.stopPropagation());
        inputElement.addEventListener('blur', function(e) {
            e.stopPropagation();
            if (!e.relatedTarget || (!e.relatedTarget.classList.contains('save-notes-btn') && !e.relatedTarget.classList.contains('cancel-notes-btn'))) saveNotes(index);
        });
        inputElement.addEventListener('keydown', function(e) {
            e.stopPropagation();
            if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
                e.preventDefault(); saveNotes(index);
            }
        });
        setTimeout(() => { inputElement.focus(); inputElement.select(); }, 100);
    }
    if (saveButton) {
        saveButton.addEventListener('click', function(e) { e.preventDefault(); saveNotes(index); });
        const buttonContainer = saveButton.closest('.notes-buttons');
        if (buttonContainer) buttonContainer.addEventListener('click', e => e.stopPropagation());
    }
    if (cancelButton) cancelButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (index >= 0 && index < appState.departureTimes.length) {
            appState.departureTimes[index].editing = false;
            renderDeparturesList();
        }
    });
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
    setTimeout(() => renderDeparturesList(), 50);
}

function clearRaceDepartures() {
    const t = translations[appState.currentLanguage];
    if (!appState.currentRace) { showMessage(t.selectRaceFirst, 'error'); return; }
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    document.getElementById('start-position').value = 1;
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('total-time-value').textContent = '00:00:00';
    saveRaceData();
    renderDeparturesList();
    showMessage(t.departuresCleared, 'success');
}

function exportToExcel() {
    const t = translations[appState.currentLanguage];
    if (appState.departureTimes.length === 0) { showMessage(t.noDataToExport, 'warning'); return; }
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
        data.push([departure.corredor, timeValue, departure.notes || '', date.toLocaleDateString(), date.toLocaleTimeString(), departure.timestamp]);
    });
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Salidas");
    const colWidths = [{wch: 8}, {wch: 10}, {wch: 50}, {wch: 12}, {wch: 10}, {wch: 15}];
    ws['!cols'] = colWidths;
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let R = 0; R <= 4; R++) {
        for (let C = 0; C <= 1; C++) {
            const cellAddress = XLSX.utils.encode_cell({r: R, c: C});
            if (!ws[cellAddress]) continue;
            ws[cellAddress].s = { font: { bold: true }, fill: { fgColor: { rgb: "E0E0E0" } } };
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
    ws['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: headerRow, c: 0 }, e: { r: headerRow + sortedForExport.length, c: 5 } }) };
    const raceName = appState.currentRace ? appState.currentRace.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50) : 'carrera';
    const date = new Date().toISOString().split('T')[0];
    const filename = `salidas_${raceName}_${date}.xlsx`;
    XLSX.writeFile(wb, filename);
    showMessage(t.excelExported, 'success');
}