// ============================================
// MÓDULO DE LLEGADAS - SISTEMA DIRECTO
// ============================================
// DESCRIPCIÓN: Sistema de llegadas directo - tiempo a tabla sin diálogos
// FUNCIONAMIENTO:
// 1. Pulsas "Registrar Llegada" → Captura tiempo inmediato
// 2. Se inserta directamente en la tabla con dorsal vacío
// 3. El usuario introduce dorsal directamente en la tabla
// 4. Tabla en orden inverso (último arriba)
// ============================================

// Variables globales
let llegadasPendientes = [];
let tiempoCapturaActiva = false;

// Estado de llegadas - DECLARACIÓN CONDICIONAL
if (typeof llegadasState === 'undefined') {
    window.llegadasState = {
        llegadas: [],
        importedSalidas: [],
        currentTime: 0
    };
}

// ============================================
// FUNCIONES DE TIEMPO
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

function formatMillisecondsToTimeSimple(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let milliseconds = ms % 1000;
    
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;
    
    // Formato HH:MM:SS
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// CRONÓMETRO DE LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas - SISTEMA DIRECTO");
    
    // Cargar estado guardado
    loadLlegadasState();
    
    // Inicializar cronómetro
    updateLlegadasTimerDisplay();
    
    // Iniciar intervalo de actualización
    if (window.llegadasUpdateInterval) {
        clearInterval(window.llegadasUpdateInterval);
    }
    
    window.llegadasUpdateInterval = setInterval(() => {
        if (typeof updateLlegadasTimerDisplay === 'function') {
            updateLlegadasTimerDisplay();
        }
    }, 100);
    
    // Configurar listeners
    setupLlegadasEventListeners();
    
    // Renderizar lista
    renderLlegadasList();
    
    console.log("Modo llegadas inicializado - SISTEMA DIRECTO");
}

function updateLlegadasTimerDisplay() {
    const display = document.getElementById('llegadas-timer-display');
    if (!display) return;
    
    const currentTimeSeconds = getCurrentTimeInSeconds();
    const firstStartSeconds = getFirstStartTimeInSeconds();
    
    let diferenciaSegundos = currentTimeSeconds - firstStartSeconds;
    if (diferenciaSegundos < 0) {
        diferenciaSegundos = 0;
    }
    
    display.textContent = secondsToTime(diferenciaSegundos);
    llegadasState.currentTime = diferenciaSegundos;
}

// ============================================
// SISTEMA DIRECTO - CAPTURA INMEDIATA A TABLA
// ============================================
function capturarLlegadaDirecta() {
    if (tiempoCapturaActiva) {
        console.log("⚠️ Captura ya en progreso");
        return;
    }
    
    tiempoCapturaActiva = true;
    
    try {
        console.log("⏱️ Capturando llegada DIRECTAMENTE...");
        
        // Obtener tiempo actual
        const currentTimeMs = getCurrentTimeInMilliseconds();
        const firstStartMs = getFirstStartTimeInMilliseconds();
        
        let diferenciaMs = currentTimeMs - firstStartMs;
        if (diferenciaMs < 0) diferenciaMs = 0;
        
        // Crear llegada con dorsal vacío (se asignará después)
        const llegada = {
            id: Date.now() + Math.random(),
            timestamp: currentTimeMs,
            dorsal: null, // Vacío - el usuario lo introducirá después
            nombre: '',
            horaSalida: '',
            horaLlegada: formatMillisecondsToTime(currentTimeMs),
            tiempoCrono: formatMillisecondsToTime(diferenciaMs),
            milliseconds: diferenciaMs,
            notas: '',
            capturadoEn: new Date().toLocaleTimeString(),
            pendiente: true // Marcar como pendiente de asignar dorsal
        };
        
        // Añadir al PRINCIPIO de la lista (orden inverso)
        llegadasState.llegadas.unshift(llegada);
        
        // Guardar y renderizar
        saveLlegadasState();
        renderLlegadasList();
        
        // Mostrar confirmación breve
        showMessage(`Tiempo capturado: ${llegada.tiempoCrono.split('.')[0]}`, 'success', 1500);
        
        // Hacer focus en el campo de dorsal de la primera fila
        setTimeout(() => {
            const primeraFila = document.querySelector('#llegadas-table-body tr:first-child');
            if (primeraFila) {
                const dorsalCell = primeraFila.querySelector('td:first-child');
                if (dorsalCell) {
                    dorsalCell.focus();
                }
            }
        }, 300);
        
        console.log("✅ Llegada añadida directamente a tabla");
        
    } catch (error) {
        console.error("❌ Error capturando llegada:", error);
        showMessage("Error al capturar llegada", 'error');
    } finally {
        setTimeout(() => {
            tiempoCapturaActiva = false;
        }, 200);
    }
}

// ============================================
// RENDERIZADO DE TABLA CON EDICIÓN DIRECTA
// ============================================
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
    
    // Crear tabla completa
    let html = '';
    
    llegadasState.llegadas.forEach((llegada, index) => {
        const esUltima = index === 0; // La primera en la lista es la última en llegar
        const tieneDorsal = llegada.dorsal && llegada.dorsal !== null;
        const claseFila = esUltima ? 'ultima-llegada' : '';
        const claseDorsal = tieneDorsal ? '' : 'dorsal-pendiente';
        
        // Formatear tiempos para visualización
        const horaLlegadaDisplay = llegada.horaLlegada ? 
            llegada.horaLlegada.split('.')[0] : '--:--:--';
        const tiempoCronoDisplay = llegada.tiempoCrono ? 
            llegada.tiempoCrono.split('.')[0] : '--:--:--';
        
        // Nombre (se autocompletará al poner dorsal)
        const nombreDisplay = llegada.nombre || 
            (tieneDorsal ? getNombreFromDorsal(llegada.dorsal) : '');
        
        html += `
        <tr class="${claseFila}" data-id="${llegada.id}" data-index="${index}">
            <td class="${claseDorsal}" contenteditable="true" 
                onfocus="this.classList.add('editing')"
                onblur="this.classList.remove('editing'); actualizarDorsal(${index}, this.textContent)"
                onkeypress="if(event.key === 'Enter') { this.blur(); event.preventDefault(); }">
                ${tieneDorsal ? llegada.dorsal : ''}
            </td>
            <td>${nombreDisplay}</td>
            <td>${llegada.horaSalida || '--:--:--'}</td>
            <td><strong>${horaLlegadaDisplay}</strong></td>
            <td><strong class="tiempo-crono">${tiempoCronoDisplay}</strong></td>
            <td contenteditable="true"
                onfocus="this.classList.add('editing')"
                onblur="this.classList.remove('editing'); actualizarNotas(${index}, this.textContent)"
                onkeypress="if(event.key === 'Enter') { this.blur(); event.preventDefault(); }">
                ${llegada.notas || ''}
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Añadir estilos dinámicos
    setTimeout(() => {
        const filasPendientes = document.querySelectorAll('.dorsal-pendiente');
        filasPendientes.forEach(fila => {
            fila.style.backgroundColor = '#fff3cd';
            fila.style.borderLeft = '4px solid #ffc107';
        });
    }, 100);
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN EN TIEMPO REAL
// ============================================
function actualizarDorsal(index, nuevoDorsal) {
    if (!llegadasState.llegadas[index]) return;
    
    const dorsal = parseInt(nuevoDorsal.trim());
    
    if (isNaN(dorsal) || dorsal <= 0) {
        // Si no es un dorsal válido, dejar vacío
        llegadasState.llegadas[index].dorsal = null;
        llegadasState.llegadas[index].nombre = '';
    } else {
        // Verificar si el dorsal ya existe
        const dorsalExistente = llegadasState.llegadas.find((l, i) => 
            i !== index && l.dorsal === dorsal);
        
        if (dorsalExistente) {
            showMessage(`⚠️ Dorsal ${dorsal} ya registrado`, 'warning');
            // Restaurar valor anterior
            const fila = document.querySelector(`#llegadas-table-body tr[data-index="${index}"] td:first-child`);
            if (fila) {
                fila.textContent = llegadasState.llegadas[index].dorsal || '';
            }
            return;
        }
        
        // Actualizar dorsal
        llegadasState.llegadas[index].dorsal = dorsal;
        llegadasState.llegadas[index].pendiente = false;
        
        // Buscar y actualizar nombre automáticamente
        const nombreCompleto = getNombreFromDorsal(dorsal);
        if (nombreCompleto) {
            llegadasState.llegadas[index].nombre = nombreCompleto;
            
            // Actualizar celda de nombre en tiempo real
            const nombreCell = document.querySelector(`#llegadas-table-body tr[data-index="${index}"] td:nth-child(2)`);
            if (nombreCell) {
                nombreCell.textContent = nombreCompleto;
            }
        }
        
        // Actualizar hora de salida si existe
        const salidaData = llegadasState.importedSalidas.find(s => s.dorsal === dorsal);
        if (salidaData && salidaData.horaSalida) {
            llegadasState.llegadas[index].horaSalida = salidaData.horaSalida;
            
            // Actualizar celda de hora salida
            const salidaCell = document.querySelector(`#llegadas-table-body tr[data-index="${index}"] td:nth-child(3)`);
            if (salidaCell) {
                salidaCell.textContent = salidaData.horaSalida;
            }
        }
        
        showMessage(`✅ Dorsal ${dorsal} asignado`, 'success', 1000);
    }
    
    saveLlegadasState();
}

function actualizarNotas(index, nuevasNotas) {
    if (llegadasState.llegadas[index]) {
        llegadasState.llegadas[index].notas = nuevasNotas.trim();
        saveLlegadasState();
    }
}

function getNombreFromDorsal(dorsal) {
    // Buscar en datos importados
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
// FUNCIONES DE GESTIÓN
// ============================================
function clearLlegadas() {
    if (llegadasState.llegadas.length === 0) {
        showMessage("No hay llegadas registradas", 'info');
        return;
    }
    
    if (confirm(`¿Eliminar todas las ${llegadasState.llegadas.length} llegadas registradas?`)) {
        llegadasState.llegadas = [];
        saveLlegadasState();
        renderLlegadasList();
        showMessage("Todas las llegadas eliminadas", 'success');
    }
}

// ============================================
// FUNCIONES DE CLASIFICACIÓN Y EXPORTACIÓN
// ============================================
function showRankingModal() {
    const t = translations[appState.currentLanguage];
    
    const llegadasConTiempo = llegadasState.llegadas.filter(l => 
        l.dorsal && l.milliseconds && l.milliseconds > 0);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noRankingText, 'info');
        return;
    }
    
    // Ordenar por tiempo
    llegadasConTiempo.sort((a, b) => a.milliseconds - b.milliseconds);
    
    const tableBody = document.getElementById('ranking-table-body');
    const emptyState = document.getElementById('ranking-empty');
    
    if (llegadasConTiempo.length > 0) {
        emptyState.style.display = 'none';
        
        let html = '';
        let bestTime = null;
        
        llegadasConTiempo.forEach((llegada, index) => {
            const tiempoDisplay = llegada.tiempoCrono ? 
                llegada.tiempoCrono.split('.')[0] : formatMillisecondsToTimeSimple(llegada.milliseconds);
            
            let diferencia = '--:--:--';
            if (bestTime === null) {
                bestTime = llegada.milliseconds;
            } else {
                const diffMs = llegada.milliseconds - bestTime;
                diferencia = formatMillisecondsToTimeSimple(diffMs);
            }
            
            html += `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${llegada.dorsal}</td>
                <td>${llegada.nombre || getNombreFromDorsal(llegada.dorsal)}</td>
                <td><strong>${tiempoDisplay}</strong></td>
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
    
    // Exportar en orden cronológico (primero en llegar primero)
    llegadasState.llegadas.slice().reverse().forEach(llegada => {
        data.push([
            llegada.dorsal || 'PENDIENTE',
            llegada.nombre || getNombreFromDorsal(llegada.dorsal) || '',
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
    
    const llegadasConTiempo = llegadasState.llegadas.filter(l => 
        l.dorsal && l.milliseconds && l.milliseconds > 0);
    
    llegadasConTiempo.sort((a, b) => a.milliseconds - b.milliseconds);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Fecha de exportación', new Date().toLocaleDateString()],
        ['Hora de exportación', new Date().toLocaleTimeString()],
        ['Total en clasificación', llegadasConTiempo.length],
        [''],
        ['Posición', 'Dorsal', 'Nombre', 'Tiempo Crono', 'Diferencia']
    ];
    
    let bestTime = null;
    llegadasConTiempo.forEach((llegada, index) => {
        const tiempoDisplay = llegada.tiempoCrono ? 
            llegada.tiempoCrono.split('.')[0] : formatMillisecondsToTimeSimple(llegada.milliseconds);
        
        let diferencia = '--:--:--';
        if (bestTime === null) {
            bestTime = llegada.milliseconds;
        } else {
            const diffMs = llegada.milliseconds - bestTime;
            diferencia = formatMillisecondsToTimeSimple(diffMs);
        }
        
        data.push([
            index + 1,
            llegada.dorsal,
            llegada.nombre || getNombreFromDorsal(llegada.dorsal),
            tiempoDisplay,
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
// PERSISTENCIA
// ============================================
function loadLlegadasState() {
    const savedState = localStorage.getItem('llegadas-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        llegadasState.llegadas = state.llegadas || [];
        llegadasState.importedSalidas = state.importedSalidas || [];
        llegadasState.currentTime = state.currentTime || 0;
        console.log("Estado de llegadas cargado:", llegadasState.llegadas.length, "llegadas");
    }
}

function saveLlegadasState() {
    localStorage.setItem('llegadas-state', JSON.stringify({
        llegadas: llegadasState.llegadas,
        importedSalidas: llegadasState.importedSalidas,
        currentTime: llegadasState.currentTime
    }));
}

// ============================================
// CONFIGURACIÓN DE LISTENERS
// ============================================
function setupLlegadasEventListeners() {
    console.log("🔧 Configurando listeners del modo llegadas - SISTEMA DIRECTO");
    
    // Botón principal "Registrar Llegada" - CAPTURA DIRECTA
    const registerBtn = document.getElementById('register-llegada-btn');
    if (registerBtn) {
        const newRegisterBtn = registerBtn.cloneNode(true);
        registerBtn.parentNode.replaceChild(newRegisterBtn, registerBtn);
        
        document.getElementById('register-llegada-btn').addEventListener('click', function(e) {
            console.log("🎯 CAPTURA DIRECTA de llegada");
            e.preventDefault();
            e.stopPropagation();
            capturarLlegadaDirecta();
        });
    }
    
    // Botón de registro rápido (flotante)
    const quickBtn = document.getElementById('quick-register-btn');
    if (quickBtn) {
        const newQuickBtn = quickBtn.cloneNode(true);
        quickBtn.parentNode.replaceChild(newQuickBtn, quickBtn);
        
        document.getElementById('quick-register-btn').addEventListener('click', function(e) {
            console.log("⚡ CAPTURA RÁPIDA DIRECTA");
            e.preventDefault();
            e.stopPropagation();
            capturarLlegadaDirecta();
        });
    }
    
    // Botones de gestión
    const clearBtn = document.getElementById('clear-llegadas-btn');
    const exportBtn = document.getElementById('export-llegadas-btn');
    const rankingBtn = document.getElementById('show-ranking-btn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearLlegadas);
    if (exportBtn) exportBtn.addEventListener('click', exportLlegadasToExcel);
    if (rankingBtn) rankingBtn.addEventListener('click', showRankingModal);
    
    console.log("✅ Listeners del modo llegadas configurados - SISTEMA DIRECTO");
}

// ============================================
// EXPORTACIÓN DE FUNCIONES
// ============================================
window.initLlegadasMode = initLlegadasMode;
window.capturarLlegadaDirecta = capturarLlegadaDirecta;
window.actualizarDorsal = actualizarDorsal;
window.actualizarNotas = actualizarNotas;
window.showRankingModal = showRankingModal;
window.exportLlegadasToExcel = exportLlegadasToExcel;
window.exportRankingToExcel = exportRankingToExcel;
window.clearLlegadas = clearLlegadas;

console.log("✅ Módulo de llegadas DIRECTO cargado y listo");