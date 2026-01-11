// ============================================
// MÓDULO DE LLEGADAS - SISTEMA 3.1.5 CORREGIDO
// ============================================
// ORDEN DE 9 COLUMNAS:
// 1. Dorsal
// 2. Crono Llegada (capturado)
// 3. Tiempo Final (Crono Llegada - Crono Salida)
// 4. Nombre
// 5. Apellidos
// 6. Crono Salida (de salida: Real > Previsto)
// 7. Hora Llegada (capturada)
// 8. Hora Salida (de salida: Real > Previsto)
// 9. Chip
// ============================================

// Variables globales
let tiempoCapturaActiva = false;

// Estado de llegadas
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

// ============================================
// FUNCIÓN PARA OBTENER DATOS DE CORREDOR - SISTEMA 3.1.5
// ============================================
function obtenerDatosCorredor(dorsal) {
    console.log(`🔍 Buscando dorsal ${dorsal} en startOrderData...`);
    
    const corredor = startOrderData.find(r => r.dorsal === dorsal);
    
    // SI NO ENCUENTRA EL DORSAL, DEVOLVER OBJETO VACÍO PERO NO NULL
    if (!corredor) {
        console.log(`⚠️ Dorsal ${dorsal} no encontrado - datos vacíos`);
        return {
            dorsal: dorsal,
            nombre: '',
            apellidos: '',
            chip: '',
            // VERSIÓN 3.1.5 - CAMPOS NUEVOS
            categoria: '',
            equipo: '',
            licencia: '',
            horaSalida: '',
            cronoSalida: '',  // VACÍO si no se encuentra
            cronoSalidaSegundos: 0,  // CERO si no se encuentra
            orden: 0
        };
    }
    
    // SISTEMA 3.1.5 - PRIORIDAD MEJORADA
    // 1. Verificar horaSalidaReal (si existe y es válida)
    let horaSalidaSeleccionada = '';
    let cronoSalidaSeleccionada = '';
    
    const tieneHoraSalidaRealValida = corredor.horaSalidaReal && 
                                     corredor.horaSalidaReal !== '--:--:--' && 
                                     corredor.horaSalidaReal.trim() !== '';
    
    if (tieneHoraSalidaRealValida) {
        // USAR HORA SALIDA REAL (sistema 3.1.5)
        horaSalidaSeleccionada = corredor.horaSalidaReal;
        
        // Verificar también cronoSalidaReal (si existe y es válida)
        const tieneCronoRealValido = corredor.cronoSalidaReal && 
                                    corredor.cronoSalidaReal !== '--:--:--' && 
                                    corredor.cronoSalidaReal.trim() !== '';
        
        if (tieneCronoRealValido) {
            cronoSalidaSeleccionada = corredor.cronoSalidaReal;
        } else {
            // Si cronoSalidaReal no es válido, usar cronoSalida
            cronoSalidaSeleccionada = corredor.cronoSalida || '';
        }
    } else {
        // USAR HORA SALIDA PREVISTA (sistema anterior)
        horaSalidaSeleccionada = corredor.horaSalida || '';
        cronoSalidaSeleccionada = corredor.cronoSalida || '';
    }
    
    // OBTENER CRONO SALIDA - LÓGICA ESPECIAL PARA PRIMER CORREDOR
    let cronoSalida = '';
    let cronoSalidaSegundos = 0;
    
    const esPrimerCorredor = corredor.orden && corredor.orden === 1;
    
    if (esPrimerCorredor) {
        // PRIMER CORREDOR: Aceptar crono salida incluso si es "00:00:00"
        cronoSalida = cronoSalidaSeleccionada;
        
        // Convertir a segundos (acepta 00:00:00 como válido para primer corredor)
        if (cronoSalida && cronoSalida !== '--:--:--') {
            cronoSalidaSegundos = timeToSeconds(cronoSalida);
        }
    } else {
        // RESTO DE CORREDORES: Solo traer cronoSalida si tiene valor válido
        cronoSalida = cronoSalidaSeleccionada;
        
        // Convertir a segundos solo si hay valor y no es "00:00:00" o "--:--:--"
        if (cronoSalida && cronoSalida !== '00:00:00' && cronoSalida !== '--:--:--') {
            cronoSalidaSegundos = timeToSeconds(cronoSalida);
        }
    }
    
    return {
        dorsal: corredor.dorsal,
        nombre: corredor.nombre || '',
        apellidos: corredor.apellidos || '',
        chip: corredor.chip || '',
        // VERSIÓN 3.1.5 - CAMPOS NUEVOS (IMPORTACIÓN COMENTADA HASTA QUE EXISTAN EN startOrderData)
        categoria: '', // corredor.categoria || '',
        equipo: '', // corredor.equipo || '',
        licencia: '', // corredor.licencia || '',
        horaSalida: horaSalidaSeleccionada,
        cronoSalida: cronoSalida,
        cronoSalidaSegundos: cronoSalidaSegundos,
        orden: corredor.orden || 0
    };
}

// ============================================
// CRONÓMETRO DE LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas - SISTEMA 3.1.5");
    
    loadLlegadasState();
    updateLlegadasTimerDisplay();
    
    if (window.llegadasUpdateInterval) {
        clearInterval(window.llegadasUpdateInterval);
    }
    
    window.llegadasUpdateInterval = setInterval(() => {
        if (typeof updateLlegadasTimerDisplay === 'function') {
            updateLlegadasTimerDisplay();
        }
    }, 100);
    
    setupLlegadasEventListeners();
    renderLlegadasList();
    
    console.log("Modo llegadas inicializado");
}

function updateLlegadasTimerDisplay() {
    const display = document.getElementById('llegadas-timer-display');
    if (!display) return;
    
    const currentTimeSeconds = getCurrentTimeInSeconds();
    const firstStartSeconds = getFirstStartTimeInSeconds();
    
    let diferenciaSegundos = currentTimeSeconds - firstStartSeconds;
    if (diferenciaSegundos < 0) diferenciaSegundos = 0;
    
    display.textContent = secondsToTime(diferenciaSegundos);
    llegadasState.currentTime = diferenciaSegundos;
}

// ============================================
// CAPTURA DIRECTA DE LLEGADA
// ============================================
function capturarLlegadaDirecta() {
    if (tiempoCapturaActiva) return;
    
    tiempoCapturaActiva = true;
    
    try {
        console.log("⏱️ Capturando llegada...");
        
        // Obtener tiempo actual CON MILÉSIMAS
        const now = new Date();
        const currentTimeWithMs = getCurrentTimeInSecondsWithMilliseconds();
        const firstStartSeconds = getFirstStartTimeInSeconds();
        
        // Hora Llegada (HH:MM:SS)
        const horaHours = now.getHours().toString().padStart(2, '0');
        const horaMinutes = now.getMinutes().toString().padStart(2, '0');
        const horaSeconds = now.getSeconds().toString().padStart(2, '0');
        const horaLlegada = `${horaHours}:${horaMinutes}:${horaSeconds}`;
        
        // Crono Llegada CON MILÉSIMAS
        let cronoLlegadaWithMs = currentTimeWithMs - firstStartSeconds;
        if (cronoLlegadaWithMs < 0) cronoLlegadaWithMs = 0;
        
        // Crear llegada con milésimas
        const llegada = {
            id: Date.now() + Math.random(),
            timestamp: Date.now(),
            dorsal: null,
            nombre: '',
            apellidos: '',
            chip: '',
            // VERSIÓN 3.1.5 - CAMPOS NUEVOS (ACTIVOS)
            categoria: '',
            equipo: '',
            licencia: '',
            horaSalida: '',
            cronoSalida: '',
            cronoSalidaSegundos: 0,
            horaLlegada: horaLlegada,
            cronoLlegadaWithMs: cronoLlegadaWithMs, // CON MILÉSIMAS
            tiempoFinalWithMs: 0, // CON MILÉSIMAS
            notas: '',
            capturadoEn: new Date().toLocaleTimeString(),
            pendiente: true
        };
        
        // Añadir al principio (orden inverso)
        llegadasState.llegadas.unshift(llegada);
        
        saveLlegadasState();
        renderLlegadasList();
        
        showMessage(`Llegada capturada: ${formatSecondsWithMilliseconds(cronoLlegadaWithMs)}`, 'success', 1500);
        
        // Focus en dorsal
        setTimeout(() => {
            const primeraFila = document.querySelector('#llegadas-table-body tr:first-child');
            if (primeraFila) {
                const dorsalCell = primeraFila.querySelector('td:first-child');
                if (dorsalCell) dorsalCell.focus();
            }
        }, 300);
        
    } catch (error) {
        console.error("❌ Error:", error);
        showMessage("Error al capturar", 'error');
    } finally {
        setTimeout(() => { tiempoCapturaActiva = false; }, 200);
    }
}

// ============================================
// ACTUALIZACIÓN DE DORSAL CON CÁLCULO
// ============================================
function actualizarDorsal(index, nuevoDorsal) {
    if (!llegadasState.llegadas[index]) return;
    
    const dorsal = parseInt(nuevoDorsal.trim());
    
    if (isNaN(dorsal) || dorsal <= 0) {
        resetearDatosLlegada(index);
        return;
    }
    
    // Verificar si dorsal ya existe (PERMITIR DUPLICADOS PARA PRUEBAS)
    const dorsalExistente = llegadasState.llegadas.find((l, i) => 
        i !== index && l.dorsal === dorsal);
    
    if (dorsalExistente) {
        // Mostrar advertencia pero PERMITIR igualmente
        showMessage(`⚠️ Dorsal ${dorsal} ya registrado - se mantendrá igual`, 'warning');
        // Continuar igualmente sin resetear
    }
    
    // Buscar datos en tabla de salida (SIEMPRE devuelve algo)
    const datosCorredor = obtenerDatosCorredor(dorsal);
    
    // Actualizar llegada CON O SIN DATOS ENCONTRADOS
    const llegada = llegadasState.llegadas[index];
    
    llegada.dorsal = dorsal;
    llegada.nombre = datosCorredor.nombre;
    llegada.apellidos = datosCorredor.apellidos;
    llegada.chip = datosCorredor.chip;
    llegada.horaSalida = datosCorredor.horaSalida;
    llegada.cronoSalida = datosCorredor.cronoSalida;
    llegada.cronoSalidaSegundos = datosCorredor.cronoSalidaSegundos;
    llegada.pendiente = false;
    
    // CALCULAR TIEMPO FINAL SOLO SI HAY CRONO SALIDA (no es primer corredor)
    if (llegada.cronoSalidaSegundos > 0 && llegada.cronoLlegadaWithMs > 0) {
        llegada.tiempoFinalWithMs = llegada.cronoLlegadaWithMs - llegada.cronoSalidaSegundos;
        if (llegada.tiempoFinalWithMs < 0) llegada.tiempoFinalWithMs = 0;
    } else {
        // Si es primer corredor o no tiene cronoSalida, Tiempo Final = Crono Llegada
        llegada.tiempoFinalWithMs = llegada.cronoLlegadaWithMs;
    }
    
    saveLlegadasState();
    actualizarFilaLlegada(index);
    
    // Mensaje diferente según si se encontró o no
    if (datosCorredor.nombre || datosCorredor.apellidos) {
        const tiempoFinalDisplay = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
        showMessage(`✅ Dorsal ${dorsal}: ${tiempoFinalDisplay}`, 'success', 2000);
    } else {
        showMessage(`📝 Dorsal ${dorsal} almacenado (datos no encontrados)`, 'info', 2000);
    }
}

function resetearDatosLlegada(index) {
    const llegada = llegadasState.llegadas[index];
    if (!llegada) return;
    
    llegada.dorsal = null;
    llegada.nombre = '';
    llegada.apellidos = '';
    llegada.chip = '';
    llegada.horaSalida = '';
    llegada.cronoSalida = '';
    llegada.cronoSalidaSegundos = 0;
    llegada.tiempoFinalSegundos = 0;
    llegada.pendiente = true;
    
    saveLlegadasState();
    actualizarFilaLlegada(index);
}

function actualizarFilaLlegada(index) {
    const llegada = llegadasState.llegadas[index];
    if (!llegada) return;
    
    const fila = document.querySelector(`#llegadas-table-body tr[data-index="${index}"]`);
    if (!fila) return;
    
    const celdas = fila.querySelectorAll('td');
    
    // Actualizar las 12 columnas con formato correcto (9 + 3 nuevas)
    celdas[0].textContent = llegada.dorsal || '';
    celdas[0].className = llegada.dorsal ? '' : 'dorsal-pendiente';
    
    // Crono Llegada (col 2) - CON 3 DECIMALES
    celdas[1].textContent = formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs);
    
    // Tiempo Final (col 3) - CON 3 DECIMALES
    celdas[2].textContent = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
    
    // Nombre (col 4)
    celdas[3].textContent = llegada.nombre || '';
    
    // Apellidos (col 5)
    celdas[4].textContent = llegada.apellidos || '';
    
    // Crono Salida (col 6) - SIN DECIMALES (de tabla salida)
    celdas[5].textContent = llegada.cronoSalida || '--:--:--';
    
    // Hora Llegada (col 7)
    celdas[6].textContent = llegada.horaLlegada || '--:--:--';
    
    // Hora Salida (col 8)
    celdas[7].textContent = llegada.horaSalida || '--:--:--';
    
    // Chip (col 9)
    celdas[8].textContent = llegada.chip || '';
    
    // VERSIÓN 3.1.5 - NUEVAS COLUMNAS (ACTIVAS)
    celdas[9].textContent = llegada.categoria || '';
    celdas[10].textContent = llegada.equipo || '';
    celdas[11].textContent = llegada.licencia || '';
}


// ============================================
// RENDERIZADO DE TABLA CON 9 COLUMNAS
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
    
    let html = '';
    
    llegadasState.llegadas.forEach((llegada, index) => {
        const esUltima = index === 0;
        const tieneDorsal = llegada.dorsal && llegada.dorsal !== null;
        const claseFila = esUltima ? 'ultima-llegada' : '';
        const claseDorsal = tieneDorsal ? '' : 'dorsal-pendiente';
        
        html += `
        <tr class="${claseFila}" data-id="${llegada.id}" data-index="${index}">
            <!-- 1. Dorsal -->
            <td class="${claseDorsal}" contenteditable="true" 
                onfocus="this.classList.add('editing')"
                onblur="this.classList.remove('editing'); actualizarDorsal(${index}, this.textContent)"
                onkeypress="if(event.key === 'Enter') { this.blur(); event.preventDefault(); }">
                ${tieneDorsal ? llegada.dorsal : ''}
            </td>
            
            <!-- 2. Crono Llegada -->
            <td class="crono-llegada">${formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs)}</td>
            
            <!-- 3. Tiempo Final -->
            <td class="tiempo-final">${formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs)}</td>
            
            <!-- 4. Nombre -->
            <td>${llegada.nombre || ''}</td>
            
            <!-- 5. Apellidos -->
            <td>${llegada.apellidos || ''}</td>
            
            <!-- 6. Crono Salida -->
            <td class="crono-salida">${llegada.cronoSalida || '--:--:--'}</td>
            
            <!-- 7. Hora Llegada -->
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            
            <!-- 8. Hora Salida -->
            <td>${llegada.horaSalida || '--:--:--'}</td>
            
            <!-- 9. Chip -->
            <td>${llegada.chip || ''}</td>
            
            <!-- VERSIÓN 3.1.5 - CAMPOS NUEVOS (ACTIVOS) -->
            <!-- 10. Categoría -->
            <td>${llegada.categoria || ''}</td>
            
            <!-- 11. Equipo -->
            <td>${llegada.equipo || ''}</td>
            
            <!-- 12. Licencia -->
            <td>${llegada.licencia || ''}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function actualizarNotas(index, nuevasNotas) {
    if (llegadasState.llegadas[index]) {
        llegadasState.llegadas[index].notas = nuevasNotas.trim();
        saveLlegadasState();
    }
}

function clearLlegadas() {
    if (llegadasState.llegadas.length === 0) {
        showMessage("No hay llegadas", 'info');
        return;
    }
    
    if (confirm(`¿Eliminar ${llegadasState.llegadas.length} llegadas?`)) {
        llegadasState.llegadas = [];
        saveLlegadasState();
        renderLlegadasList();
        showMessage("Llegadas eliminadas", 'success');
    }
}


// ============================================
// CLASIFICACIÓN POR TIEMPO FINAL - ACTUALIZADO
// ============================================
function showRankingModal() {
    const t = translations[appState.currentLanguage];
    
    // Filtrar por tiempo final calculado (USANDO tiempoFinalWithMs)
    const llegadasConTiempo = llegadasState.llegadas.filter(l => 
        l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noRankingText, 'info');
        return;
    }
    
    // ORDENAR POR TIEMPO FINAL MÁS BAJO (más rápido)
    llegadasConTiempo.sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    const tableBody = document.getElementById('ranking-table-body');
    const emptyState = document.getElementById('ranking-empty');
    
    if (llegadasConTiempo.length > 0) {
        emptyState.style.display = 'none';
        
        let html = '';
        let mejorTiempo = null;
        
        llegadasConTiempo.forEach((llegada, index) => {
            // Diferencia con el mejor
            let diferencia = '--:--:--.000';
            if (mejorTiempo === null) {
                mejorTiempo = llegada.tiempoFinalWithMs;
            } else {
                const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                diferencia = formatSecondsWithMilliseconds(diffSegundos);
            }
            
            const clasePuesto = index < 3 ? `puesto-${index + 1}` : '';
            
            html += `
            <tr class="${clasePuesto}">
                <td><strong>${index + 1}</strong></td>
                <td>${llegada.dorsal}</td>
                <td><strong class="tiempo-final-ranking">${formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs)}</strong></td>
                <td>${diferencia}</td>
                <td>${llegada.nombre || ''}</td>
                <td>${llegada.apellidos || ''}</td>
                <td>${llegada.categoria || ''}</td>
                <td>${llegada.equipo || ''}</td>
            </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } else {
        emptyState.style.display = 'block';
    }
    
    // Mostrar el modal
    document.getElementById('ranking-modal').classList.add('active');
    
    // Configurar los botones del modal DESPUÉS de mostrar el modal
    setTimeout(() => {
        setupRankingModalButtons();
    }, 50);
}
// ============================================
// EXPORTACIÓN - ACTUALIZADO
// ============================================
function exportLlegadasToExcel() {
    const t = translations[appState.currentLanguage];
    
    if (llegadasState.llegadas.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    // Ordenar por tiempo final (USANDO tiempoFinalWithMs)
    const llegadasOrdenadas = [...llegadasState.llegadas]
        .filter(l => l.tiempoFinalWithMs > 0)
        .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    const llegadasSinTiempo = llegadasState.llegadas.filter(l => !l.tiempoFinalWithMs || l.tiempoFinalWithMs <= 0);
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Fecha', new Date().toLocaleDateString()],
        ['Hora', new Date().toLocaleTimeString()],
        ['Total llegadas', llegadasState.llegadas.length],
        [''],
        // VERSIÓN 3.1.5 - HEADER ACTUALIZADO (12 COLUMNAS + NOTAS)
        ['Pos', 'Dorsal', 'Crono Llegada', 'Tiempo Final', 'Nombre', 'Apellidos', 
         'Crono Salida', 'Hora Llegada', 'Hora Salida', 'Chip', 
         'Categoria', 'Equipo', 'Licencia', 'Notas']
    ];
    
    let posicion = 1;
    llegadasOrdenadas.forEach(llegada => {
        data.push([
            posicion++,
            llegada.dorsal || '',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs),
            llegada.nombre || '',
            llegada.apellidos || '',
            llegada.cronoSalida || '',
            llegada.horaLlegada || '',
            llegada.horaSalida || '',
            llegada.chip || '',
            llegada.categoria || '', // NUEVO CAMPO 3.1.5
            llegada.equipo || '', // NUEVO CAMPO 3.1.5
            llegada.licencia || '', // NUEVO CAMPO 3.1.5
            llegada.notas || ''
        ]);
    });
    
    llegadasSinTiempo.forEach(llegada => {
        data.push([
            '--',
            llegada.dorsal || 'PENDIENTE',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            'SIN TIEMPO',
            llegada.nombre || '',
            llegada.apellidos || '',
            llegada.cronoSalida || '',
            llegada.horaLlegada || '',
            llegada.horaSalida || '',
            llegada.chip || '',
            llegada.categoria || '', // NUEVO CAMPO 3.1.5
            llegada.equipo || '', // NUEVO CAMPO 3.1.5
            llegada.licencia || '', // NUEVO CAMPO 3.1.5
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
    
    const llegadasConTiempo = llegadasState.llegadas
        .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
        .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    const data = [
        ['Carrera', appState.currentRace ? appState.currentRace.name : 'Sin nombre'],
        ['Fecha', new Date().toLocaleDateString()],
        ['Hora', new Date().toLocaleTimeString()],
        ['Total', llegadasConTiempo.length],
        [''],
        // VERSIÓN 3.1.5 - HEADER ACTUALIZADO
        ['Pos', 'Dorsal', 'Nombre', 'Categoria', 'Equipo', 'Crono Salida', 
         'Crono Llegada', 'Tiempo Final', 'Diferencia']
    ];
    
    let mejorTiempo = null;
    llegadasConTiempo.forEach((llegada, index) => {
        let diferencia = '--:--:--.000';
        if (mejorTiempo === null) {
            mejorTiempo = llegada.tiempoFinalWithMs;
        } else {
            const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
            diferencia = formatSecondsWithMilliseconds(diffSegundos);
        }
        
        const nombreCompleto = llegada.nombre && llegada.apellidos ? 
            `${llegada.nombre} ${llegada.apellidos}` : '';
        
        data.push([
            index + 1,
            llegada.dorsal,
            nombreCompleto,
            llegada.categoria || '', // NUEVO CAMPO 3.1.5
            llegada.equipo || '', // NUEVO CAMPO 3.1.5
            llegada.cronoSalida || '--:--:--',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs),
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
        console.log("Estado cargado:", llegadasState.llegadas.length, "llegadas");
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
    console.log("🔧 Configurando listeners - SISTEMA 3.1.5");
    
    // Botón Registrar Llegada
    const registerBtn = document.getElementById('register-llegada-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', capturarLlegadaDirecta);
    }
    
    // Botón rápido
    const quickBtn = document.getElementById('quick-register-btn');
    if (quickBtn) {
        quickBtn.addEventListener('click', capturarLlegadaDirecta);
    }
    
    // Botones gestión
    const clearBtn = document.getElementById('clear-llegadas-btn');
    const exportBtn = document.getElementById('export-llegadas-btn');
    const rankingBtn = document.getElementById('show-ranking-btn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearLlegadas);
    if (exportBtn) exportBtn.addEventListener('click', exportLlegadasToExcel);
    if (rankingBtn) rankingBtn.addEventListener('click', showRankingModal);
    
    console.log("✅ Listeners configurados");
}
// Añade esta función en Crono_CRI_js_Llegadas.js
function formatSecondsWithMilliseconds(seconds) {
    if (!seconds && seconds !== 0) return '00:00:00.000';
    
    const totalSeconds = Math.abs(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const milliseconds = Math.round((seconds - Math.floor(seconds)) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Función para obtener segundos con milésimas
function getCurrentTimeInSecondsWithMilliseconds() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
}



// ============================================
// FUNCIÓN PARA GENERAR PDF DE CLASIFICACIÓN
// ============================================
// ============================================
// FUNCIÓN PARA GENERAR PDF DE CLASIFICACIÓN
// ============================================
function exportRankingToPDF() {
    console.log("📄 Iniciando exportación a PDF de clasificación...");
    
    const t = translations[appState.currentLanguage];
    
    const llegadasConTiempo = llegadasState.llegadas
        .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
        .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    if (llegadasConTiempo.length === 0) {
        showMessage(t.noDataToExport, 'warning');
        return;
    }
    
    try {
        console.log(`📊 Generando PDF de clasificación con ${llegadasConTiempo.length} participantes`);
        
        // INTENTAR DIFERENTES FORMAS DE ACCEDER A jsPDF
        let jsPDFConstructor;
        
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            console.log("✅ Usando window.jspdf.jsPDF");
            jsPDFConstructor = window.jspdf.jsPDF;
        } else if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
            console.log("✅ Usando jspdf.jsPDF");
            jsPDFConstructor = jspdf.jsPDF;
        } else {
            console.error("❌ jsPDF no está disponible");
            showMessage('Error: La librería PDF no está cargada. Recarga la página.', 'error');
            return;
        }
        
        // CREAR PDF (misma orientación que orden de salida)
        let doc = new jsPDFConstructor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const contentWidth = pageWidth - 2 * margin;
        
        // ANCHOS DE COLUMNAS (8 columnas: Pos, Dorsal, Tiempo Final, Diferencia, Nombre, Apellidos, Categoría, Equipo)
        const posWidth = 12;          // POS
        const dorsalWidth = 15;       // DORSAL  
        const tiempoFinalWidth = 25;  // TIEMPO FINAL
        const diferenciaWidth = 25;   // DIFERENCIA
        
        // Calcular espacio para Nombre, Apellidos, Categoría, Equipo
        const fixedWidths = posWidth + dorsalWidth + tiempoFinalWidth + diferenciaWidth;
        const remainingWidth = contentWidth - fixedWidths;
        
        // Distribuir: 30% Nombre, 30% Apellidos, 20% Categoría, 20% Equipo
        const nombreWidth = Math.floor(remainingWidth * 0.30);
        const apellidosWidth = Math.floor(remainingWidth * 0.30);
        const categoriaWidth = Math.floor(remainingWidth * 0.20);
        const equipoWidth = Math.floor(remainingWidth * 0.20);
        
        // Ancho total de la tabla
        const totalTableWidth = fixedWidths + nombreWidth + apellidosWidth + categoriaWidth + equipoWidth;
        
        // Calcular margen izquierdo para centrar tabla
        const tableMarginLeft = margin + (contentWidth - totalTableWidth) / 2;
        
        // Array de anchos de columna
        const columnWidths = [posWidth, dorsalWidth, nombreWidth, apellidosWidth, tiempoFinalWidth, diferenciaWidth, categoriaWidth, equipoWidth];
        
        console.log(`PDF Clasificación - Anchos: POS=${posWidth}, DORSAL=${dorsalWidth}, NOMBRE=${nombreWidth}, APELLIDOS=${apellidosWidth}, TIEMPO=${tiempoFinalWidth}, DIF=${diferenciaWidth}, CAT=${categoriaWidth}, EQUIPO=${equipoWidth}`);
        
        // CALCULAR FILAS POR PÁGINA (igual que orden de salida)
        const headerHeight = 50;
        const footerHeight = 15;
        const rowHeight = 6;
        const availableHeight = pageHeight - headerHeight - footerHeight - 20;
        const maxRowsPerPage = Math.floor(availableHeight / rowHeight);
        const totalPages = Math.ceil(llegadasConTiempo.length / maxRowsPerPage);
        
        let pageNumber = 1;
        let currentY = 15;
        let rowIndex = 0;
        
        // Variables para control de colores alternados
        let lastDifference = null;
        let useGrayBackground = false;
        const lightGray = [248, 249, 250]; // Gris claro
        const white = [255, 255, 255];     // Blanco
        
        // FUNCIÓN PARA DIBUJAR CABECERA DE PÁGINA (IGUAL QUE ORDEN DE SALIDA)
        function drawPageHeader() {
            let y = 15;
            
            // 1. NOMBRE DE LA PRUEBA (centrado) - AZUL
            const raceName = appState.currentRace ? appState.currentRace.name : t.raceWithoutName || 'Sin nombre';
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(66, 133, 244); // Azul Google
            doc.text(raceName.toUpperCase(), pageWidth / 2, y, { align: "center" });
            y += 8;
            
            // 2. "CLASIFICACIÓN" (centrado) - NEGRO
            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            const title = t.classification || "CLASIFICACIÓN";
            doc.text(title.toUpperCase(), pageWidth / 2, y, { align: "center" });
            y += 15;
            
            // 3. LÍNEA 1: Fecha (izquierda) y Hora (derecha)
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const now = new Date();
            const dateStr = now.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
            
            const dateText = `${t.date || "Fecha"}: ${dateStr}`;
            const timeText = `${t.time || "Hora"}: ${timeStr}`;
            doc.text(dateText, margin, y);
            doc.text(timeText, pageWidth - margin, y, { align: "right" });
            y += 6;
            
            // 4. LÍNEA 2: Lugar (izquierda) y Total Clasificados (derecha)
            const location = appState.currentRace?.location || t.unspecifiedLocation || 'No especificado';
            const locationText = `${t.location || "Lugar"}: ${location}`;
            const totalText = `${t.totalRiders || "Total clasificados"}: ${llegadasConTiempo.length}`;
            doc.text(locationText, margin, y);
            doc.text(totalText, pageWidth - margin, y, { align: "right" });
            y += 6;
            
            // 5. LÍNEA 3: Categoría (izquierda) y Equipo (derecha si hay)
            const category = appState.currentRace?.category || t.unspecifiedCategory || 'No especificada';
            const categoryText = `${t.category || "Categoría"}: ${category}`;
            
            // Obtener primer equipo si existe
            const firstTeam = llegadasConTiempo[0]?.equipo || '';
            const teamText = firstTeam ? `${t.team || "Equipo"}: ${firstTeam}` : '';
            
            doc.text(categoryText, margin, y);
            if (teamText) {
                doc.text(teamText, pageWidth - margin, y, { align: "right" });
            }
            y += 10;
            
            return y;
        }
        
        // FUNCIÓN PARA DIBUJAR CABECERA DE TABLA
        function drawTableHeaders(startY) {
            // Fondo azul para cabecera
            doc.setFillColor(66, 133, 244); // Azul Google
            doc.rect(tableMarginLeft, startY - 3, totalTableWidth, 8, 'F');
            
            // Texto de cabeceras en blanco
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            
            // Cabeceras de tabla (usar traducciones si están disponibles)
            const headers = [
                t.position || "POS",
                t.bibNumber || "DORSAL", 
                t.name || "NOMBRE",
                t.surname || "APELLIDOS",
                "TIEMPO FINAL",
                "DIFERENCIA",
                t.category || "CATEGORÍA",
                t.team || "EQUIPO"
            ];
            
            const aligns = ["center", "center", "left", "left", "center", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            headers.forEach((header, index) => {
                if (aligns[index] === "center") {
                    doc.text(header, xPosition + (columnWidths[index] / 2), startY + 1, { align: "center" });
                } else {
                    doc.text(header, xPosition + 2, startY + 1);
                }
                xPosition += columnWidths[index];
            });
            
            return startY + 8;
        }
        
        // FUNCIÓN PARA MANEJAR TEXTO LARGO (igual que orden de salida)
        function handleLongText(text, columnWidth, padding = 4) {
            if (!text) return "";
            
            const availableWidth = columnWidth - padding;
            const charsPerMM = 0.8; // 1mm ≈ 0.4 caracteres (2.5mm por char)
            const maxChars = Math.floor(availableWidth * charsPerMM);
            
            if (text.length <= maxChars) {
                return text;
            }
            
            let truncateAt = maxChars - 3;
            
            if (truncateAt > 20) {
                let lastSpace = text.lastIndexOf(' ', truncateAt);
                if (lastSpace > maxChars * 0.7) {
                    truncateAt = lastSpace;
                }
            }
            
            truncateAt = Math.max(10, truncateAt);
            return text.substring(0, truncateAt) + "...";
        }
        
        // FUNCIÓN PARA DIBUJAR UNA FILA DE DATOS
        function drawDataRow(llegada, startY, rowNumber, diferencia) {
            // Para las DOS PRIMERAS filas, siempre blanco
            if (rowNumber <= 2) {
                useGrayBackground = false;
            } 
            // A partir del TERCER corredor, verificar cambio
            else if (diferencia !== lastDifference) {
                useGrayBackground = !useGrayBackground; // Alternar cuando cambia diferencia
            }
            
            // Aplicar fondo gris si corresponde
            if (useGrayBackground) {
                doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.rect(tableMarginLeft, startY - 2, totalTableWidth, rowHeight, 'F');
            }
            
            // Resaltar los 3 primeros puestos con color amarillo
            if (rowNumber <= 3) {
                doc.setFillColor(255, 255, 204); // Amarillo claro
                doc.rect(tableMarginLeft, startY - 2, totalTableWidth, rowHeight, 'F');
            }
            
            // Actualizar última diferencia SOLO si no es la primera fila
            if (rowNumber >= 2) {
                lastDifference = diferencia;
            }
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            
            // Para los primeros 3 puestos, usar negrita
            if (rowNumber <= 3) {
                doc.setFont("helvetica", "bold");
            }
            
            doc.setTextColor(0, 0, 0);
            
            const aligns = ["center", "center", "left", "left", "center", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            // POS
            doc.text(rowNumber.toString(), xPosition + (columnWidths[0] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[0];
            
            // DORSAL
            doc.text(llegada.dorsal.toString(), xPosition + (columnWidths[1] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[1];
            
            // NOMBRE
            const nombre = llegada.nombre || "";
            const adjustedNombre = handleLongText(nombre, columnWidths[2]);
            doc.text(adjustedNombre, xPosition + 2, startY + 2);
            xPosition += columnWidths[2];
            
            // APELLIDOS
            const apellidos = llegada.apellidos || "";
            const adjustedApellidos = handleLongText(apellidos, columnWidths[3]);
            doc.text(adjustedApellidos, xPosition + 2, startY + 2);
            xPosition += columnWidths[3];
            
            // TIEMPO FINAL
            const tiempoFinal = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
            doc.text(tiempoFinal, xPosition + (columnWidths[4] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[4];
            
            // DIFERENCIA
            doc.text(diferencia, xPosition + (columnWidths[5] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[5];
            
            // CATEGORÍA
            const categoria = llegada.categoria || "";
            doc.text(categoria, xPosition + (columnWidths[6] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[6];
            
            // EQUIPO
            const equipo = llegada.equipo || "";
            doc.text(equipo, xPosition + (columnWidths[7] / 2), startY + 2, { align: "center" });
            
            // Línea divisoria entre filas
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.2);
            doc.line(tableMarginLeft, startY + 4, tableMarginLeft + totalTableWidth, startY + 4);
            
            return startY + rowHeight;
        }
        
        // FUNCIÓN PARA PIE DE PÁGINA (IGUAL QUE ORDEN DE SALIDA)
        function drawPageFooter(pageNum, totalPages) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
            const dateStr = now.toLocaleDateString('es-ES');
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            
            // Fecha y hora de generación
            doc.text(`${timeStr} - ${dateStr}`, margin, pageHeight - 10);
            
            // Número de página
            const pageText = t.page || "Página";
            doc.text(`${pageText} ${pageNum} ${t.of || "de"} ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
            
            // Sistema de cronometraje
            doc.text('Crono CRI - Sistema de Cronometraje 3.1.5', pageWidth / 2, pageHeight - 5, { align: "center" });
        }
        
        // CALCULAR DIFERENCIAS ANTES DE DIBUJAR
        let mejorTiempo = llegadasConTiempo[0]?.tiempoFinalWithMs || 0;
        const llegadasConDiferencia = llegadasConTiempo.map((llegada, index) => {
            let diferencia = '--:--:--.000';
            if (index === 0) {
                diferencia = '00:00:00.000';
            } else {
                const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                diferencia = formatSecondsWithMilliseconds(diffSegundos);
            }
            return { ...llegada, diferencia };
        });
        
        // DIBUJAR PRIMERA PÁGINA
        currentY = drawPageHeader();
        currentY = drawTableHeaders(currentY);
        
        // PROCESAR TODAS LAS FILAS CON PAGINACIÓN
        llegadasConDiferencia.forEach((llegada, index) => {
            if (rowIndex >= maxRowsPerPage) {
                drawPageFooter(pageNumber, totalPages);
                doc.addPage();
                pageNumber++;
                rowIndex = 0;
                lastDifference = null;
                useGrayBackground = false;
                
                currentY = 15;
                currentY = drawPageHeader();
                currentY = drawTableHeaders(currentY);
            }
            
            currentY = drawDataRow(llegada, currentY, index + 1, llegada.diferencia);
            rowIndex++;
        });
        
        // DIBUJAR PIE DE PÁGINA FINAL
        drawPageFooter(pageNumber, totalPages);
        
        // Guardar PDF
        const raceName = appState.currentRace ? appState.currentRace.name.replace(/\s+/g, '_').substring(0, 30) : 'carrera';
        const now = new Date();
        const dateFileStr = now.toISOString().split('T')[0];
        const timeFileStr = now.getHours().toString().padStart(2, '0') + now.getMinutes().toString().padStart(2, '0');
        const filename = `Clasificacion_${raceName}_${dateFileStr}_${timeFileStr}.pdf`;
        
        doc.save(filename);
        
        showMessage('✅ PDF de clasificación generado con éxito', 'success');
        console.log("PDF de clasificación generado exitosamente:", filename);
        
    } catch (error) {
        console.error('❌ Error generando PDF de clasificación:', error);
        showMessage(`❌ Error al generar el PDF: ${error.message}`, 'error');
    }
}



// ============================================
// CONFIGURAR BOTONES DEL MODAL DE CLASIFICACIÓN
// ============================================
function setupRankingModalButtons() {
    console.log("🔧 Configurando botones del modal de ranking...");
    
    // Botón para cerrar modal (X)
    const closeModalBtn = document.getElementById('ranking-modal-close');
    if (closeModalBtn) {
        // Remover listener anterior si existe
        const newCloseBtn = closeModalBtn.cloneNode(true);
        closeModalBtn.parentNode.replaceChild(newCloseBtn, closeModalBtn);
        
        document.getElementById('ranking-modal-close').addEventListener('click', function() {
            document.getElementById('ranking-modal').classList.remove('active');
        });
    }
    
    // Botón para cerrar modal (Cerrar)
    const closeBtn = document.getElementById('close-ranking-btn');
    if (closeBtn) {
        // Remover listener anterior si existe
        const newBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
        
        document.getElementById('close-ranking-btn').addEventListener('click', function() {
            document.getElementById('ranking-modal').classList.remove('active');
        });
    }
    
    // Botón para exportar PDF
    const exportPdfBtn = document.getElementById('export-ranking-pdf-btn');
    if (exportPdfBtn) {
        console.log("✅ Botón PDF encontrado, configurando listener...");
        
        // Remover listener anterior si existe (para evitar duplicados)
        const newPdfBtn = exportPdfBtn.cloneNode(true);
        exportPdfBtn.parentNode.replaceChild(newPdfBtn, exportPdfBtn);
        
        // Agregar nuevo listener
        document.getElementById('export-ranking-pdf-btn').addEventListener('click', function(e) {
            e.preventDefault();
            console.log("🖨️ Botón Exportar PDF clickeado");
            exportRankingToPDF();
        });
    } else {
        console.error("❌ NO se encontró el botón export-ranking-pdf-btn");
        console.log("Buscando en el documento:", document.querySelectorAll('#export-ranking-pdf-btn'));
    }
}


// ============================================
// EXPORTACIÓN GLOBAL
// ============================================
window.initLlegadasMode = initLlegadasMode;
window.capturarLlegadaDirecta = capturarLlegadaDirecta;
window.actualizarDorsal = actualizarDorsal;
window.showRankingModal = showRankingModal;
window.exportLlegadasToExcel = exportLlegadasToExcel;
window.exportRankingToExcel = exportRankingToExcel;
window.clearLlegadas = clearLlegadas;

console.log("✅ Módulo de llegadas 3.1.5 cargado");