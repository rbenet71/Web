function updateCadenceTime() {
    const isVariableMode = document.getElementById('variable-interval-config').style.display !== 'none';
    appState.isVariableMode = isVariableMode;
    
    if (!isVariableMode) {
        const minutes = parseInt(document.getElementById('interval-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
        const totalSeconds = minutes * 60 + seconds;
        appState.nextCorredorTime = totalSeconds;
        appState.intervals = [{
            from: 1,
            to: 9999,
            minutes: minutes,
            seconds: seconds,
            totalSeconds: totalSeconds
        }];
        console.log("Intervalo único creado:", minutes, "min", seconds, "seg");
    } else updateCurrentInterval();
    updateNextCorredorDisplay();
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
    } else appState.nextCorredorTime = 60;
}

function updateNextCorredorDisplay() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    const nextCorredorNumber = appState.departedCount + 2;
    let timeForNextCorredor = appState.nextCorredorTime;
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
            if (lastInterval && nextCorredorNumber > lastInterval.to) timeForNextCorredor = lastInterval.totalSeconds;
        }
    }
    if (timeForNextCorredor >= 60) {
        const minutes = Math.floor(timeForNextCorredor / 60);
        const seconds = timeForNextCorredor % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else display.textContent = timeForNextCorredor + "s";
    console.log(`Display actualizado: Próximo corredor (${nextCorredorNumber}) sale en ${timeForNextCorredor}s`);
}

function addVariableInterval() {
    const t = translations[appState.currentLanguage];
    const from = parseInt(document.getElementById('from-corredor').value) || 1;
    const to = parseInt(document.getElementById('to-corredor').value) || 10;
    const minutes = parseInt(document.getElementById('var-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('var-seconds').value) || 0;
    if (from > to) { showMessage(t.fromMustBeLessThanTo, 'error'); return; }
    if (minutes === 0 && seconds === 0) { showMessage(t.enterValidTimeValue, 'error'); return; }
    for (const interval of appState.intervals) {
        if ((from >= interval.from && from <= interval.to) || (to >= interval.from && to <= interval.to) || (from <= interval.from && to >= interval.to)) {
            showMessage(`${t.intervalOverlaps} ${interval.from}-${interval.to}`, 'error'); return;
        }
    }
    const totalSeconds = minutes * 60 + seconds;
    const newInterval = { from: from, to: to, minutes: minutes, seconds: seconds, totalSeconds: totalSeconds };
    appState.intervals.push(newInterval);
    appState.intervals.sort((a, b) => a.from - b.from);
    renderIntervalsList();
    if (appState.currentRace) {
        appState.currentRace.cadenceMode = 'variable';
        appState.currentRace.intervals = [...appState.intervals];
        saveRaceData();
    }
    intervalConfig.variableMode = { intervals: [...appState.intervals], saved: true };
    saveIntervalConfig();
    document.getElementById('from-corredor').value = to + 1;
    document.getElementById('to-corredor').value = to + 10;
    document.getElementById('var-minutes').value = 1;
    document.getElementById('var-seconds').value = 0;
    setTimeout(() => refreshIntervalButtons(), 100);
    showMessage(t.intervalAdded, 'success');
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
                <div class="interval-range"><strong>${interval.from} - ${interval.to}</strong></div>
                <div class="interval-time"><i class="fas fa-clock"></i> ${interval.minutes}min ${interval.seconds.toString().padStart(2, '0')}s</div>
            </div>
            <div class="interval-actions">
                <button class="btn btn-secondary btn-sm edit-interval-btn" data-index="${index}" title="Editar este tramo" onclick="event.stopPropagation();">
                    <i class="fas fa-edit"></i><span class="btn-text">Editar</span>
                </button>
                <button class="btn btn-danger btn-sm remove-interval-btn" data-index="${index}" title="Eliminar este tramo" onclick="event.stopPropagation();">
                    <i class="fas fa-trash"></i><span class="btn-text">Eliminar</span>
                </button>
            </div>
        `;
        container.appendChild(row);
    });
    if (appState.intervals.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `<i class="fas fa-plus-circle" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px;"></i>
            <p style="color: var(--gray); font-style: italic;">No hay tramos configurados. Añade el primer tramo usando el formulario superior.</p>`;
        container.appendChild(emptyMessage);
    }
    updateIntervalCount();
    setTimeout(() => refreshIntervalButtons(), 100);
}

function setupIntervalsEvents() {
    console.log("Configurando eventos de intervalos...");
    document.addEventListener('click', function(e) {
        const isInNotesContainer = e.target.closest('.notes-edit-container');
        const isNotesButton = e.target.closest('.save-notes-btn') || e.target.closest('.cancel-notes-btn');
        const isNotesInput = e.target.closest('.departure-notes-input');
        if (isInNotesContainer || isNotesButton || isNotesInput) { console.log("Evento en área de notas - ignorando eventos de intervalos"); return; }
        const deleteButton = e.target.closest('.remove-interval-btn');
        if (deleteButton) {
            console.log("Botón ELIMINAR detectado");
            e.preventDefault(); e.stopPropagation();
            const index = parseInt(deleteButton.getAttribute('data-index'));
            console.log("Índice del intervalo a eliminar:", index);
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                const interval = appState.intervals[index];
                const t = translations[appState.currentLanguage];
                const confirmMessage = t.confirmDeleteInterval.replace('{from}', interval.from).replace('{to}', interval.to);
                if (confirm(confirmMessage)) {
                    appState.intervals.splice(index, 1);
                    renderIntervalsList();
                    intervalConfig.variableMode = { intervals: [...appState.intervals], saved: true };
                    saveIntervalConfig();
                    if (appState.currentRace) { appState.currentRace.intervals = [...appState.intervals]; saveRaceData(); }
                    if (appState.countdownActive) { updateCurrentInterval(); saveAppState(); }
                    showMessage(t.intervalDeleted, 'success');
                    console.log("Intervalo eliminado. Total restante:", appState.intervals.length);
                }
            } else console.error("Índice inválido:", index);
            return false;
        }
        const editButton = e.target.closest('.edit-interval-btn');
        if (editButton) {
            console.log("Botón EDITAR detectado");
            e.preventDefault(); e.stopPropagation();
            const index = parseInt(editButton.getAttribute('data-index'));
            console.log("Índice del intervalo a editar:", index);
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                console.log("Abriendo modal para editar intervalo:", index);
                openEditIntervalModal(index);
            } else console.error("Índice inválido para editar:", index);
            return false;
        }
    });
    document.addEventListener('dblclick', function(e) {
        const isInNotesContainer = e.target.closest('.notes-edit-container');
        const isNotesButton = e.target.closest('.save-notes-btn') || e.target.closest('.cancel-notes-btn');
        const isNotesInput = e.target.closest('.departure-notes-input');
        if (isInNotesContainer || isNotesButton || isNotesInput) { console.log("Doble clic en área de notas - ignorando"); return; }
        const row = e.target.closest('.interval-row');
        if (row && !e.target.closest('button')) {
            e.preventDefault(); e.stopPropagation();
            const index = parseInt(row.getAttribute('data-index'));
            if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
                console.log("DOBLE CLIC en fila para editar intervalo:", index);
                openEditIntervalModal(index);
            }
        }
    });
    console.log("Eventos de intervalos configurados correctamente");
}

function setupSpecificIntervalListeners() {
    console.log("Configurando listeners específicos para intervalos...");
    document.querySelectorAll('.remove-interval-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Evento click directo en botón eliminar");
            e.preventDefault(); e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            handleRemoveInterval(index);
        });
    });
    document.querySelectorAll('.edit-interval-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            console.log("Evento click directo en botón editar");
            e.preventDefault(); e.stopPropagation();
            const index = parseInt(this.getAttribute('data-index'));
            if (!isNaN(index)) openEditIntervalModal(index);
        });
    });
}

function handleRemoveInterval(index) {
    const t = translations[appState.currentLanguage];
    if (!isNaN(index) && index >= 0 && index < appState.intervals.length) {
        const interval = appState.intervals[index];
        const confirmMessage = t.confirmDeleteInterval.replace('{from}', interval.from).replace('{to}', interval.to);
        if (confirm(confirmMessage)) {
            appState.intervals.splice(index, 1);
            renderIntervalsList();
            intervalConfig.variableMode = { intervals: [...appState.intervals], saved: true };
            saveIntervalConfig();
            if (appState.currentRace) { appState.currentRace.intervals = [...appState.intervals]; saveRaceData(); }
            if (appState.countdownActive) { updateCurrentInterval(); saveAppState(); }
            showMessage(t.intervalDeleted, 'success');
            console.log("Intervalo eliminado. Total restante:", appState.intervals.length);
            setTimeout(() => setupSpecificIntervalListeners(), 100);
        }
    }
}

function refreshIntervalButtons() {
    document.querySelectorAll('.remove-interval-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    document.querySelectorAll('.edit-interval-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
    setupSpecificIntervalListeners();
}

function openEditIntervalModal(index) {
    console.log("Abriendo modal de edición para índice:", index);
    const t = translations[appState.currentLanguage];
    if (index < 0 || index >= appState.intervals.length) {
        console.error("Índice inválido:", index);
        showMessage(t.noIntervalSelected, 'error');
        return;
    }
    const interval = appState.intervals[index];
    console.log("Intervalo a editar:", interval);
    editingIntervalIndex = index;
    document.getElementById('edit-from-corredor').value = interval.from;
    document.getElementById('edit-to-corredor').value = interval.to;
    document.getElementById('edit-interval-minutes').value = interval.minutes;
    document.getElementById('edit-interval-seconds').value = interval.seconds;
    document.getElementById('edit-interval-modal').classList.add('active');
    document.getElementById('edit-from-corredor').focus();
    console.log("Modal abierto correctamente");
}

function closeEditIntervalModal() {
    console.log("Cerrando modal de edición de intervalo");
    editingIntervalIndex = -1;
    document.getElementById('edit-from-corredor').value = '';
    document.getElementById('edit-to-corredor').value = '';
    document.getElementById('edit-interval-minutes').value = '';
    document.getElementById('edit-interval-seconds').value = '';
    document.getElementById('edit-interval-modal').classList.remove('active');
    console.log("Modal cerrado");
}

function saveEditedInterval() {
    console.log("saveEditedInterval iniciado, índice:", editingIntervalIndex);
    const t = translations[appState.currentLanguage];
    if (editingIntervalIndex < 0 || editingIntervalIndex >= appState.intervals.length) {
        console.error("No hay tramo seleccionado para editar");
        showMessage(t.noIntervalSelected, 'error');
        closeEditIntervalModal();
        return;
    }
    const from = parseInt(document.getElementById('edit-from-corredor').value) || 1;
    const to = parseInt(document.getElementById('edit-to-corredor').value) || 10;
    const minutes = parseInt(document.getElementById('edit-interval-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('edit-interval-seconds').value) || 0;
    console.log("Valores del formulario:", {from, to, minutes, seconds});
    if (from > to) { showMessage(t.fromMustBeLessThanTo, 'error'); return; }
    if (minutes === 0 && seconds === 0) { showMessage(t.enterValidTimeValue, 'error'); return; }
    for (let i = 0; i < appState.intervals.length; i++) {
        if (i === editingIntervalIndex) continue;
        const interval = appState.intervals[i];
        if ((from >= interval.from && from <= interval.to) || (to >= interval.from && to <= interval.to) || (from <= interval.from && to >= interval.to)) {
            showMessage(`${t.intervalOverlaps} ${interval.from}-${interval.to}`, 'error');
            return;
        }
    }
    const totalSeconds = minutes * 60 + seconds;
    const updatedInterval = { from: from, to: to, minutes: minutes, seconds: seconds, totalSeconds: totalSeconds };
    console.log("Intervalo actualizado:", updatedInterval);
    appState.intervals[editingIntervalIndex] = updatedInterval;
    appState.intervals.sort((a, b) => a.from - b.from);
    const newIndex = appState.intervals.findIndex(interval => interval.from === from && interval.to === to && interval.totalSeconds === totalSeconds);
    console.log("Nuevo índice después de ordenar:", newIndex);
    renderIntervalsList();
    intervalConfig.variableMode = { intervals: [...appState.intervals], saved: true };
    saveIntervalConfig();
    if (appState.currentRace) { appState.currentRace.intervals = [...appState.intervals]; saveRaceData(); }
    if (appState.countdownActive) { updateCurrentInterval(); saveAppState(); }
    closeEditIntervalModal();
    showMessage(t.intervalUpdated, 'success');
    console.log("Intervalo guardado correctamente");
}

function cancelEditInterval() {
    console.log("Cancelando edición de intervalo");
    closeEditIntervalModal();
}

function setupEditIntervalModalEvents() {
    console.log("Configurando eventos del modal de edición...");
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'save-edit-interval-btn') {
            e.preventDefault(); e.stopPropagation(); console.log("Botón Guardar Cambios clickeado"); saveEditedInterval();
        }
        if (e.target && e.target.id === 'cancel-edit-interval-btn') {
            e.preventDefault(); e.stopPropagation(); console.log("Botón Cancelar clickeado"); cancelEditInterval();
        }
        if (e.target && e.target.id === 'edit-interval-modal-close') {
            e.preventDefault(); e.stopPropagation(); console.log("Botón Cerrar modal clickeado"); cancelEditInterval();
        }
    });
    document.getElementById('edit-interval-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('edit-interval-modal')) cancelEditInterval();
    });
    document.getElementById('edit-interval-form').addEventListener('click', (e) => e.stopPropagation());
    document.querySelectorAll('.edit-interval-input').forEach(input => input.addEventListener('click', (e) => e.stopPropagation()));
    document.getElementById('edit-interval-form').addEventListener('submit', (e) => {
        e.preventDefault(); e.stopPropagation(); console.log("Formulario de edición enviado"); saveEditedInterval();
    });
    const saveBtn = document.getElementById('save-edit-interval-btn');
    const cancelBtn = document.getElementById('cancel-edit-interval-btn');
    const closeBtn = document.getElementById('edit-interval-modal-close');
    if (saveBtn) saveBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); saveEditedInterval(); });
    if (cancelBtn) cancelBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); cancelEditInterval(); });
    if (closeBtn) closeBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); cancelEditInterval(); });
}