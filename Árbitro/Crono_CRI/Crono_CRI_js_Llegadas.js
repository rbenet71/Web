// ============================================
// MÓDULO DE LLEGADAS - CRONÓMETRO Y REGISTRO
// ============================================

// ============================================
// FUNCIONES DEL CRONÓMETRO DE LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas...");
    
    // Cargar estado guardado
    loadLlegadasState();
    
    // Inicializar cronómetro
    updateLlegadasTimerDisplay();
    
    // Renderizar lista si hay datos
    renderLlegadasList();
    
    console.log("Modo llegadas inicializado");
}

function startLlegadasTimer() {
    const t = translations[appState.currentLanguage];
    
    if (!llegadasState.timerActive) {
        // Si no hay tiempo de inicio, usar el tiempo actual
        if (!llegadasState.startTime) {
            llegadasState.startTime = Date.now() - (llegadasState.currentTime * 1000);
        }
        
        llegadasState.timerActive = true;
        llegadasState.timerStarted = true;
        
        // Iniciar intervalo de actualización
        llegadasState.timerInterval = setInterval(() => {
            llegadasState.currentTime = Math.floor((Date.now() - llegadasState.startTime) / 1000);
            updateLlegadasTimerDisplay();
            
            // Guardar estado cada 10 segundos
            if (llegadasState.currentTime % 10 === 0) {
                saveLlegadasState();
            }
        }, 100);
        
        showMessage(t.timerStarted, 'success');
        console.log("Cronómetro de llegadas iniciado");
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
    
    const hours = Math.floor(llegadasState.currentTime / 3600);
    const minutes = Math.floor((llegadasState.currentTime % 3600) / 60);
    const seconds = llegadasState.currentTime % 60;
    
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// FUNCIONES DE REGISTRO DE LLEGADAS
// ============================================
function showRegisterLlegadaModal() {
    const modal = document.getElementById('register-llegada-modal');
    const horaInput = document.getElementById('llegada-hora');
    
    // Establecer hora actual
    horaInput.value = secondsToTime(llegadasState.currentTime);
    
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
    
    // Crear llegada
    const llegada = {
        dorsal: dorsalNum,
        horaSalida: '',
        horaLlegada: secondsToTime(llegadasState.currentTime),
        tiempoCrono: '',
        notas: 'Registro rápido',
        timestamp: Date.now()
    };
    
    // Intentar obtener hora de salida si hay datos importados
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsalNum);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida);
            const tiempoCronoSegundos = llegadasState.currentTime - segundosSalida;
            llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
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
    
    // Crear llegada
    const llegada = {
        dorsal: dorsal,
        horaSalida: '',
        horaLlegada: document.getElementById('llegada-hora').value,
        tiempoCrono: '',
        notas: notasInput.value.trim(),
        timestamp: Date.now()
    };
    
    // Intentar obtener hora de salida
    const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
    if (salidaData) {
        llegada.horaSalida = salidaData.horaSalida;
        if (salidaData.horaSalida) {
            const segundosSalida = timeToSeconds(salidaData.horaSalida);
            const segundosLlegada = timeToSeconds(llegada.horaLlegada);
            const tiempoCronoSegundos = segundosLlegada - segundosSalida;
            llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
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
    
    let html = '';
    llegadasState.llegadas.forEach((llegada, index) => {
        html += `
        <tr data-index="${index}">
            <td>${llegada.dorsal}</td>
            <td>${getNombreFromDorsal(llegada.dorsal)}</td>
            <td>${llegada.horaSalida || '--:--:--'}</td>
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            <td>${llegada.tiempoCrono || '--:--:--'}</td>
            <td>${llegada.notas || ''}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
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
                        const segundosSalida = timeToSeconds(salidaData.horaSalida);
                        const segundosLlegada = timeToSeconds(llegada.horaLlegada);
                        const tiempoCronoSegundos = segundosLlegada - segundosSalida;
                        llegada.tiempoCrono = secondsToTime(tiempoCronoSegundos);
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
    
    // Filtrar llegadas que tienen tiempo crono
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.tiempoCrono && l.tiempoCrono !== '--:--:--');
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noRankingText, 'info');
        return;
    }
    
    // Ordenar por tiempo crono (ascendente)
    llegadasConTiempo.sort((a, b) => {
        return timeToSeconds(a.tiempoCrono) - timeToSeconds(b.tiempoCrono);
    });
    
    // Generar tabla de ranking
    const tableBody = document.getElementById('ranking-table-body');
    const emptyState = document.getElementById('ranking-empty');
    
    if (llegadasConTiempo.length > 0) {
        emptyState.style.display = 'none';
        
        let html = '';
        let bestTime = null;
        
        llegadasConTiempo.forEach((llegada, index) => {
            const tiempoSegundos = timeToSeconds(llegada.tiempoCrono);
            
            let diferencia = '';
            if (bestTime === null) {
                bestTime = tiempoSegundos;
                diferencia = '--:--:--';
            } else {
                const diffSegundos = tiempoSegundos - bestTime;
                diferencia = secondsToTime(diffSegundos);
            }
            
            html += `
            <tr>
                <td>${index + 1}</td>
                <td>${llegada.dorsal}</td>
                <td>${getNombreFromDorsal(llegada.dorsal)}</td>
                <td>${llegada.tiempoCrono}</td>
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
    
    // Filtrar y ordenar como en showRankingModal
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.tiempoCrono && l.tiempoCrono !== '--:--:--');
    llegadasConTiempo.sort((a, b) => timeToSeconds(a.tiempoCrono) - timeToSeconds(b.tiempoCrono));
    
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
        const tiempoSegundos = timeToSeconds(llegada.tiempoCrono);
        
        let diferencia = '';
        if (bestTime === null) {
            bestTime = tiempoSegundos;
            diferencia = '--:--:--';
        } else {
            const diffSegundos = tiempoSegundos - bestTime;
            diferencia = secondsToTime(diffSegundos);
        }
        
        data.push([
            index + 1,
            llegada.dorsal,
            getNombreFromDorsal(llegada.dorsal),
            llegada.tiempoCrono,
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
            llegadasState.startTime = Date.now() - (state.currentTime * 1000);
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