// ============================================
// MÓDULO DE LLEGADAS - SISTEMA 3.2.1 CORREGIDO
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
// FUNCIÓN PARA OBTENER DATOS DE CORREDOR - SISTEMA 3.2.1
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
            // VERSIÓN 3.2.1 - CAMPOS NUEVOS
            categoria: '',
            equipo: '',
            licencia: '',
            horaSalida: '',
            cronoSalida: '',  // VACÍO si no se encuentra
            cronoSalidaSegundos: 0,  // CERO si no se encuentra
            orden: 0
        };
    }
    
    // SISTEMA 3.2.1 - PRIORIDAD MEJORADA
    // 1. Verificar horaSalidaReal (si existe y es válida)
    let horaSalidaSeleccionada = '';
    let cronoSalidaSeleccionada = '';
    
    const tieneHoraSalidaRealValida = corredor.horaSalidaReal && 
                                     corredor.horaSalidaReal !== '--:--:--' && 
                                     corredor.horaSalidaReal.trim() !== '';
    
    if (tieneHoraSalidaRealValida) {
        // USAR HORA SALIDA REAL (sistema 3.2.1)
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
    
    const esPrimerCorredor = corredor.order && corredor.order === 1;
    
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
        // VERSIÓN 3.2.1 - CAMPOS NUEVOS DESCOMENTADOS
        categoria: corredor.categoria || '',
        equipo: corredor.equipo || '',
        licencia: corredor.licencia || '',
        horaSalida: horaSalidaSeleccionada,
        cronoSalida: cronoSalida,
        cronoSalidaSegundos: cronoSalidaSegundos,
        orden: corredor.order || 0  // CORRECCIÓN: usar 'order' no 'orden'
    };
}

// ============================================
// CRONÓMETRO DE LLEGADAS
// ============================================
function initLlegadasMode() {
    console.log("Inicializando modo llegadas - SISTEMA 3.2.1");
    
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
            // VERSIÓN 3.2.1 - CAMPOS NUEVOS (ACTIVOS)
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
    
    // Guardar tiempo anterior para comparar
    const llegada = llegadasState.llegadas[index];
    const tiempoAnterior = llegada.tiempoFinalWithMs || 0;
    
    // Actualizar llegada - CORRECCIÓN: AÑADIR LOS 3 NUEVOS CAMPOS
    llegada.dorsal = dorsal;
    llegada.nombre = datosCorredor.nombre;
    llegada.apellidos = datosCorredor.apellidos;
    llegada.chip = datosCorredor.chip;
    
    // ✅ AÑADIDO: ACTUALIZAR LOS 3 NUEVOS CAMPOS
    llegada.categoria = datosCorredor.categoria;
    llegada.equipo = datosCorredor.equipo;
    llegada.licencia = datosCorredor.licencia;
    
    llegada.horaSalida = datosCorredor.horaSalida;
    llegada.cronoSalida = datosCorredor.cronoSalida;
    llegada.cronoSalidaSegundos = datosCorredor.cronoSalidaSegundos;
    llegada.pendiente = false;
    
    // CALCULAR NUEVO TIEMPO FINAL
    let tiempoNuevo = 0;
    if (llegada.cronoSalidaSegundos > 0 && llegada.cronoLlegadaWithMs > 0) {
        tiempoNuevo = llegada.cronoLlegadaWithMs - llegada.cronoSalidaSegundos;
        if (tiempoNuevo < 0) tiempoNuevo = 0;
    } else {
        tiempoNuevo = llegada.cronoLlegadaWithMs;
    }
    
    llegada.tiempoFinalWithMs = tiempoNuevo;
    
    saveLlegadasState();
    actualizarFilaLlegada(index);
    
    // ✅ DETECTAR SI EL TIEMPO CAMBIÓ
    const tiempoCambioSignificativo = 
        (tiempoAnterior <= 0 && tiempoNuevo > 0) ||  // Sin tiempo → Con tiempo
        (tiempoAnterior > 0 && tiempoNuevo <= 0) ||  // Con tiempo → Sin tiempo
        Math.abs(tiempoAnterior - tiempoNuevo) > 0.001; // Tiempo cambió
    
    // ✅ SI CAMBIÓ EL TIEMPO → ACTUALIZAR TODAS LAS POSICIONES
    if (tiempoCambioSignificativo) {
        console.log(`🔄 Tiempo cambió (${tiempoAnterior} → ${tiempoNuevo}), actualizando TODAS las posiciones...`);
        
        setTimeout(() => {
            try {
                // 1. Calcular mapa de posiciones
                const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
                
                // 2. Actualizar TODAS las filas
                const filas = document.querySelectorAll('#llegadas-table-body tr');
                filas.forEach((fila, i) => {
                    const llegadaActual = llegadasState.llegadas[i];
                    if (!llegadaActual) return;
                    
                    const celdaPosicion = fila.querySelector('td:nth-child(4)'); // Columna 4
                    if (celdaPosicion) {
                        const nuevaPosicion = llegadaActual.tiempoFinalWithMs && llegadaActual.tiempoFinalWithMs > 0
                            ? (mapaPosiciones[llegadaActual.id] || '')
                            : '';
                        celdaPosicion.textContent = nuevaPosicion;
                    }
                });
                
                console.log('✅ Todas las posiciones actualizadas');
            } catch (error) {
                console.error('❌ Error actualizando posiciones:', error);
            }
        }, 200);
    }
    
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
    
    // Guardar si tenía tiempo antes
    const teniaTiempo = llegada.tiempoFinalWithMs && llegada.tiempoFinalWithMs > 0;
    
    llegada.dorsal = null;
    llegada.nombre = '';
    llegada.apellidos = '';
    llegada.chip = '';
    llegada.horaSalida = '';
    llegada.cronoSalida = '';
    llegada.cronoSalidaSegundos = 0;
    llegada.tiempoFinalWithMs = 0;
    llegada.pendiente = true;
    
    saveLlegadasState();
    actualizarFilaLlegada(index);
    
    // ✅ SI TENÍA TIEMPO Y AHORA NO → ACTUALIZAR TODAS LAS POSICIONES
    if (teniaTiempo) {
        console.log('🔄 Se eliminó tiempo, actualizando TODAS las posiciones...');
        
        setTimeout(() => {
            try {
                const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
                
                const filas = document.querySelectorAll('#llegadas-table-body tr');
                filas.forEach((fila, i) => {
                    const llegadaActual = llegadasState.llegadas[i];
                    if (!llegadaActual) return;
                    
                    const celdaPosicion = fila.querySelector('td:nth-child(4)');
                    if (celdaPosicion) {
                        const nuevaPosicion = llegadaActual.tiempoFinalWithMs && llegadaActual.tiempoFinalWithMs > 0
                            ? (mapaPosiciones[llegadaActual.id] || '')
                            : '';
                        celdaPosicion.textContent = nuevaPosicion;
                    }
                });
            } catch (error) {
                console.error('❌ Error actualizando posiciones:', error);
            }
        }, 200);
    }
}

function actualizarFilaLlegada(index) {
    const llegada = llegadasState.llegadas[index];
    if (!llegada) return;
    
    const fila = document.querySelector(`#llegadas-table-body tr[data-index="${index}"]`);
    if (!fila) return;
    
    const celdas = fila.querySelectorAll('td');
    
    // Actualizar las 13 columnas (12 originales + posición) - VERSIÓN 3.2.1
    // 0: Dorsal, 1: Crono Llegada, 2: Tiempo Final, 3: Posición, 4: Nombre, etc.
    
    // 0: Dorsal
    celdas[0].textContent = llegada.dorsal || '';
    celdas[0].className = llegada.dorsal ? '' : 'dorsal-pendiente';
    
    // 1: Crono Llegada - CON 3 DECIMALES
    celdas[1].textContent = formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs);
    
    // 2: Tiempo Final - CON 3 DECIMALES
    celdas[2].textContent = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
    
    // 3: POSICIÓN - NO actualizar aquí (se actualiza en renderLlegadasList o actualizarDorsal)
    // Mantener el valor actual
    
    // 4: Nombre
    celdas[4].textContent = llegada.nombre || '';
    
    // 5: Apellidos
    celdas[5].textContent = llegada.apellidos || '';
    
    // 6: Crono Salida - SIN DECIMALES (de tabla salida)
    celdas[6].textContent = llegada.cronoSalida || '--:--:--';
    
    // 7: Hora Llegada
    celdas[7].textContent = llegada.horaLlegada || '--:--:--';
    
    // 8: Hora Salida
    celdas[8].textContent = llegada.horaSalida || '--:--:--';
    
    // 9: Chip
    celdas[9].textContent = llegada.chip || '';
    
    // VERSIÓN 3.2.1 - NUEVAS COLUMNAS (ACTIVAS)
    // 10: Categoría
    celdas[10].textContent = llegada.categoria || '';
    
    // 11: Equipo
    celdas[11].textContent = llegada.equipo || '';
    
    // 12: Licencia
    celdas[12].textContent = llegada.licencia || '';
}

// ============================================
// ACTUALIZAR UNA SOLA FILA CON POSICIÓN - NUEVO 3.2.1
// ============================================
function actualizarFilaLlegadaIndividual(index) {
    const llegada = llegadasState.llegadas[index];
    if (!llegada) return;
    
    const fila = document.querySelector(`#llegadas-table-body tr[data-index="${index}"]`);
    if (!fila) return;
    
    const celdas = fila.querySelectorAll('td');
    
    // Calcular posición actual (basada en TODAS las llegadas)
    const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
    const posicion = mapaPosiciones[llegada.id] || '';
    
    // Actualizar las 13 columnas
    celdas[0].textContent = llegada.dorsal || '';
    celdas[0].className = llegada.dorsal ? '' : 'dorsal-pendiente';
    
    // Crono Llegada (col 2) - CON 3 DECIMALES
    celdas[1].textContent = formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs);
    
    // Tiempo Final (col 3) - CON 3 DECIMALES
    celdas[2].textContent = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
    
    // POSICIÓN (col 4) - NUEVO 3.2.1
    celdas[3].textContent = posicion;
    celdas[3].className = 'posicion';
    
    // Nombre (col 5)
    celdas[4].textContent = llegada.nombre || '';
    
    // Apellidos (col 6)
    celdas[5].textContent = llegada.apellidos || '';
    
    // Crono Salida (col 7)
    celdas[6].textContent = llegada.cronoSalida || '--:--:--';
    
    // Hora Llegada (col 8)
    celdas[7].textContent = llegada.horaLlegada || '--:--:--';
    
    // Hora Salida (col 9)
    celdas[8].textContent = llegada.horaSalida || '--:--:--';
    
    // Chip (col 10)
    celdas[9].textContent = llegada.chip || '';
    
    // Categoría (col 11)
    celdas[10].textContent = llegada.categoria || '';
    
    // Equipo (col 12)
    celdas[11].textContent = llegada.equipo || '';
    
    // Licencia (col 13)
    celdas[12].textContent = llegada.licencia || '';
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
    
    // NUEVO 3.2.1: Calcular posiciones ANTES de renderizar
    const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
    
    let html = '';
    
    llegadasState.llegadas.forEach((llegada, index) => {
        const esUltima = index === 0;
        const tieneDorsal = llegada.dorsal && llegada.dorsal !== null;
        const claseFila = esUltima ? 'ultima-llegada' : '';
        const claseDorsal = tieneDorsal ? '' : 'dorsal-pendiente';
        
        // Obtener posición del mapa
        const posicion = llegada.tiempoFinalWithMs && llegada.tiempoFinalWithMs > 0
            ? (mapaPosiciones[llegada.id] || '')
            : '';
        
        html += `
        <tr class="${claseFila}" data-id="${llegada.id}" data-index="${index}">
            <!-- 1. Dorsal (columna 1) -->
            <td class="${claseDorsal}" contenteditable="true" 
                onfocus="this.classList.add('editing')"
                onblur="this.classList.remove('editing'); actualizarDorsal(${index}, this.textContent)"
                onkeypress="if(event.key === 'Enter') { this.blur(); event.preventDefault(); }">
                ${tieneDorsal ? llegada.dorsal : ''}
            </td>
            
            <!-- 2. Crono Llegada (columna 2) -->
            <td class="crono-llegada">${formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs)}</td>
            
            <!-- 3. Tiempo Final (columna 3) -->
            <td class="tiempo-final">${formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs)}</td>
            
            <!-- 4. POSICIÓN (columna 4) - NUEVO 3.2.1 - SOLO LECTURA -->
            <td class="posicion">${posicion}</td>
            
            <!-- 5. Nombre (columna 5) -->
            <td>${llegada.nombre || ''}</td>
            
            <!-- 6. Apellidos (columna 6) -->
            <td>${llegada.apellidos || ''}</td>
            
            <!-- 7. Crono Salida (columna 7) -->
            <td class="crono-salida">${llegada.cronoSalida || '--:--:--'}</td>
            
            <!-- 8. Hora Llegada (columna 8) -->
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            
            <!-- 9. Hora Salida (columna 9) -->
            <td>${llegada.horaSalida || '--:--:--'}</td>
            
            <!-- 10. Chip (columna 10) -->
            <td>${llegada.chip || ''}</td>
            
            <!-- VERSIÓN 3.2.1 - CAMPOS NUEVOS (ACTIVOS) -->
            <!-- 11. Categoría (columna 11) -->
            <td>${llegada.categoria || ''}</td>
            
            <!-- 12. Equipo (columna 12) -->
            <td>${llegada.equipo || ''}</td>
            
            <!-- 13. Licencia (columna 13) -->
            <td>${llegada.licencia || ''}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// =====================================
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
        // VERSIÓN 3.2.1 - HEADER ACTUALIZADO (13 COLUMNAS + NOTAS)
        ['Dorsal', 'Crono Llegada', 'Tiempo Final', 'Posición', 'Nombre', 'Apellidos', 
         'Crono Salida', 'Hora Llegada', 'Hora Salida', 'Chip', 
         'Categoria', 'Equipo', 'Licencia', 'Notas']
    ];
    
    let posicion = 1;
    let tiempoAnterior = null;
    
    // Procesar llegadas con tiempo para manejar empates
    llegadasOrdenadas.forEach((llegada, index) => {
        // Calcular posición considerando empates
        let posicionActual = posicion;
        if (index > 0 && tiempoAnterior !== null && 
            llegada.tiempoFinalWithMs === tiempoAnterior) {
            // Mismo tiempo que el anterior, misma posición
            posicionActual = posicion - 1;
        } else {
            // Tiempo diferente, incrementar posición
            posicion = index + 1;
            posicionActual = posicion;
            tiempoAnterior = llegada.tiempoFinalWithMs;
        }
        
        data.push([
            llegada.dorsal || '',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs),
            posicionActual, // NUEVO: Posición calculada
            llegada.nombre || '',
            llegada.apellidos || '',
            llegada.cronoSalida || '',
            llegada.horaLlegada || '',
            llegada.horaSalida || '',
            llegada.chip || '',
            llegada.categoria || '', // NUEVO CAMPO 3.2.1
            llegada.equipo || '', // NUEVO CAMPO 3.2.1
            llegada.licencia || '', // NUEVO CAMPO 3.2.1
            llegada.notas || ''
        ]);
    });
    
    // Procesar llegadas sin tiempo
    llegadasSinTiempo.forEach(llegada => {
        data.push([
            llegada.dorsal || 'PENDIENTE',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            'SIN TIEMPO',
            '--', // Sin posición
            llegada.nombre || '',
            llegada.apellidos || '',
            llegada.cronoSalida || '',
            llegada.horaLlegada || '',
            llegada.horaSalida || '',
            llegada.chip || '',
            llegada.categoria || '', // NUEVO CAMPO 3.2.1
            llegada.equipo || '', // NUEVO CAMPO 3.2.1
            llegada.licencia || '', // NUEVO CAMPO 3.2.1
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
        // VERSIÓN 3.2.1 - HEADER ACTUALIZADO
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
            llegada.categoria || '', // NUEVO CAMPO 3.2.1
            llegada.equipo || '', // NUEVO CAMPO 3.2.1
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
    
    // Botón Registrar Llegada
    const registerBtn = document.getElementById('registerLlegadaBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', capturarLlegadaDirecta);
    }
    
    // Botón rápido
    const quickBtn = document.getElementById('quickRegisterBtn');
    if (quickBtn) {
        quickBtn.addEventListener('click', capturarLlegadaDirecta);
    }
    
    // Botones gestión - TODOS EN CAMELCASE
    const clearBtn = document.getElementById('clearLlegadasBtn');
    const exportBtn = document.getElementById('exportLlegadasBtn');
    const rankingBtn = document.getElementById('showRankingBtn');
    const exportPdfDirectBtn = document.getElementById('exportRankingPdfDirectBtn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearLlegadas);
    if (exportBtn) exportBtn.addEventListener('click', exportLlegadasToExcel);
    if (rankingBtn) rankingBtn.addEventListener('click', showRankingModal);
    if (exportPdfDirectBtn) {
        exportPdfDirectBtn.addEventListener('click', exportRankingToPDF);
        console.log("✅ Listener añadido para exportRankingPdfDirectBtn");
    } else {
        console.error("❌ NO se encontró exportRankingPdfDirectBtn");
    }
    
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

// ============================================
// CALCULAR POSICIONES BASADAS EN TIEMPO FINAL - NUEVO 3.2.1
// ============================================
function calcularPosiciones(llegadas) {
    // 1. Filtrar llegadas con tiempo final válido
    const llegadasConTiempo = llegadas.filter(l => 
        l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0);
    
    // 2. Ordenar por tiempo final (más rápido primero)
    llegadasConTiempo.sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    // 3. Asignar posiciones (1, 2, 3...)
    // Manejar empates: mismos tiempos = misma posición
    let posicionActual = 1;
    let tiempoAnterior = null;
    
    llegadasConTiempo.forEach((llegada, index) => {
        if (tiempoAnterior === null || llegada.tiempoFinalWithMs > tiempoAnterior) {
            // Tiempo diferente, posición normal
            llegada.posicion = posicionActual;
            tiempoAnterior = llegada.tiempoFinalWithMs;
        } else {
            // Mismo tiempo que el anterior, misma posición
            llegada.posicion = posicionActual - 1;
        }
        posicionActual++;
    });
    
    // 4. Para llegadas sin tiempo, mantener posición vacía
    const llegadasSinTiempo = llegadas.filter(l => 
        !l.tiempoFinalWithMs || l.tiempoFinalWithMs <= 0);
    
    llegadasSinTiempo.forEach(llegada => {
        llegada.posicion = '';
    });
    
    // 5. Devolver todas las llegadas
    return [...llegadasConTiempo, ...llegadasSinTiempo];
}

// ============================================
// RECALCULAR TODAS LAS POSICIONES - NUEVO 3.2.1
// ============================================
function recalcularTodasLasPosiciones() {
    console.log('🧮 Iniciando recálculo de posiciones...');
    
    // 1. Evitar múltiples recalculos simultáneos
    if (window.recalculacionPosicionesPendiente) {
        console.log('⏭️ Ya hay un recálculo pendiente, omitiendo...');
        return;
    }
    
    window.recalculacionPosicionesPendiente = true;
    
    // 2. Ejecutar con delay para no bloquear UI
    setTimeout(() => {
        try {
            console.log('🔢 Procesando recálculo de posiciones...');
            
            // 3. Filtrar llegadas con tiempo final válido
            const llegadasConTiempo = llegadasState.llegadas.filter(l => 
                l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0);
            
            console.log(`📊 ${llegadasConTiempo.length} llegadas con tiempo de ${llegadasState.llegadas.length} totales`);
            
            if (llegadasConTiempo.length === 0) {
                // No hay tiempos → todas las posiciones vacías
                console.log('📭 No hay llegadas con tiempo, limpiando posiciones...');
                document.querySelectorAll('#llegadas-table-body td.posicion').forEach(celda => {
                    celda.textContent = '';
                });
                return;
            }
            
            // 4. Ordenar por tiempo (más rápido primero)
            const llegadasOrdenadas = [...llegadasConTiempo].sort((a, b) => 
                a.tiempoFinalWithMs - b.tiempoFinalWithMs);
            
            // 5. Calcular posiciones con manejo de empates
            const mapaPosiciones = {};
            let posicionActual = 1;
            let tiempoAnterior = null;
            
            llegadasOrdenadas.forEach((llegada, index) => {
                if (tiempoAnterior === null || llegada.tiempoFinalWithMs > tiempoAnterior) {
                    // Tiempo diferente → posición nueva
                    mapaPosiciones[llegada.id] = posicionActual;
                    tiempoAnterior = llegada.tiempoFinalWithMs;
                } else {
                    // Mismo tiempo → misma posición
                    mapaPosiciones[llegada.id] = posicionActual - 1;
                }
                posicionActual++;
            });
            
            console.log('🗺️ Mapa de posiciones calculado:', mapaPosiciones);
            
            // 6. Actualizar las celdas de posición en la tabla
            const filas = document.querySelectorAll('#llegadas-table-body tr');
            let actualizadas = 0;
            
            filas.forEach((fila, index) => {
                const llegada = llegadasState.llegadas[index];
                if (!llegada) return;
                
                // La columna 4 es posición (0: dorsal, 1: cronoLlegada, 2: tiempoFinal, 3: posición)
                const celdaPosicion = fila.querySelector('td:nth-child(4)');
                if (!celdaPosicion) {
                    console.warn(`⚠️ No se encontró celda de posición en fila ${index}`);
                    return;
                }
                
                // Determinar nueva posición
                let nuevaPosicion = '';
                if (llegada.tiempoFinalWithMs && llegada.tiempoFinalWithMs > 0) {
                    nuevaPosicion = mapaPosiciones[llegada.id] || '';
                }
                
                // Solo actualizar si cambió
                if (celdaPosicion.textContent !== nuevaPosicion.toString()) {
                    celdaPosicion.textContent = nuevaPosicion;
                    celdaPosicion.className = 'posicion';
                    actualizadas++;
                }
            });
            
            console.log(`✅ Recálculo completado: ${actualizadas} posiciones actualizadas`);
            
        } catch (error) {
            console.error('❌ Error en recálculo de posiciones:', error);
        } finally {
            window.recalculacionPosicionesPendiente = false;
        }
    }, 400); // 400ms de delay
}

// ============================================
// CALCULAR MAPA DE POSICIONES SIN CAMBIAR ORDEN - CORREGIDA 3.2.1
// ============================================
function calcularMapaPosiciones(llegadas) {
    // 1. Filtrar llegadas con tiempo final válido
    const llegadasConTiempo = llegadas.filter(l => 
        l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0);
    
    if (llegadasConTiempo.length === 0) {
        return {};
    }
    
    // 2. Hacer copia para ordenar (sin modificar original)
    const llegadasParaOrdenar = [...llegadasConTiempo];
    
    // 3. Ordenar por tiempo final (más rápido primero)
    llegadasParaOrdenar.sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    console.log('🔢 Llegadas ordenadas por tiempo:');
    llegadasParaOrdenar.forEach((l, i) => {
        ;
    });
    
    // 4. Crear mapa {id: posicion} con manejo de empates CORREGIDO
    const mapaPosiciones = {};
    let posicionActual = 1;
    
    for (let i = 0; i < llegadasParaOrdenar.length; i++) {
        const llegada = llegadasParaOrdenar[i];
        
        // Si es el primero o tiene tiempo diferente al anterior
        if (i === 0 || llegada.tiempoFinalWithMs > llegadasParaOrdenar[i-1].tiempoFinalWithMs) {
            mapaPosiciones[llegada.id] = posicionActual;
            posicionActual = i + 2; // Siguiente posición
        } else {
            // Mismo tiempo que el anterior → misma posición
            mapaPosiciones[llegada.id] = posicionActual - 1;
        }
    }
    
    console.log('🗺️ Mapa de posiciones calculado:', mapaPosiciones);
    return mapaPosiciones;
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
        
        // ACCEDER A JSPDF
        let jsPDFConstructor;
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
            jsPDFConstructor = window.jspdf.jsPDF;
        } else if (typeof jspdf !== 'undefined' && jspdf.jsPDF) {
            jsPDFConstructor = jspdf.jsPDF;
        } else {
            console.error("❌ jsPDF no está disponible");
            showMessage('Error: La librería PDF no está cargada. Recarga la página.', 'error');
            return;
        }
        
        // CREAR PDF
        let doc = new jsPDFConstructor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        const contentWidth = pageWidth - 2 * margin;
        
        // ============================================
        // NUEVA FUNCIÓN PARA FORMATO DE TIEMPO SIN CEROS INNECESARIOS
        // ============================================
        function formatTimeNoLeadingZeros(seconds) {
            if (!seconds && seconds !== 0) return '0.000';
            
            const totalSeconds = Math.abs(seconds);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const secs = Math.floor(totalSeconds % 60);
            const milliseconds = Math.round((seconds - Math.floor(seconds)) * 1000);
            
            // Formatear sin ceros a la izquierda si no son necesarios
            let timeString = '';
            
            if (hours > 0) {
                timeString += `${hours}:`;
                timeString += `${minutes.toString().padStart(2, '0')}:`;
                timeString += `${secs.toString().padStart(2, '0')}.`;
            } else if (minutes > 0) {
                timeString += `${minutes}:`;
                timeString += `${secs.toString().padStart(2, '0')}.`;
            } else {
                timeString += `${secs}.`;
            }
            
            timeString += `${milliseconds.toString().padStart(3, '0')}`;
            return timeString;
        }
        
        // ANCHOS DE COLUMNAS - ORDEN NUEVO
        const posWidth = 12;          // POS
        const dorsalWidth = 15;       // DORSAL  
        const nombreWidth = 22;       // NOMBRE
        const apellidosWidth = 22;    // APELLIDOS
        const categoriaWidth = 18;    // CATEGORÍA
        const equipoWidth = 20;       // EQUIPO
        const tiempoFinalWidth = 22;  // TIEMPO FINAL
        const diferenciaWidth = 20;   // DIFERENCIA
        
        // Ancho total de la tabla
        const totalTableWidth = posWidth + dorsalWidth + nombreWidth + apellidosWidth + 
                               categoriaWidth + equipoWidth + tiempoFinalWidth + diferenciaWidth;
        
        // Calcular margen izquierdo para centrar tabla
        const tableMarginLeft = margin + (contentWidth - totalTableWidth) / 2;
        
        // Array de anchos de columna (NUEVO ORDEN)
        const columnWidths = [posWidth, dorsalWidth, nombreWidth, apellidosWidth, 
                            categoriaWidth, equipoWidth, tiempoFinalWidth, diferenciaWidth];
        
        // CALCULAR FILAS POR PÁGINA
        const headerHeight = 35; // Más compacto
        const footerHeight = 10;
        const rowHeight = 6;
        const availableHeight = pageHeight - headerHeight - footerHeight - 20;
        const maxRowsPerPage = Math.floor(availableHeight / rowHeight);
        const totalPages = Math.ceil(llegadasConTiempo.length / maxRowsPerPage);
        
        let pageNumber = 1;
        let currentY = 10; // Empezar más arriba
        let rowIndex = 0;
        
        // Colores para filas alternadas - SOLO BLANCO Y GRIS
        const lightGray = [240, 240, 240]; // Gris claro para filas pares
        const white = [255, 255, 255];     // Blanco para filas impares
        
        // ============================================
        // FUNCIÓN PARA DIBUJAR CABECERA DE PÁGINA (SIN FONDO)
        // ============================================
        function drawPageHeader() {
            let y = 10;
            
            // 1. "CLASIFICACIÓN" (centrado) - Grande y en negrita
            const title = t.classification || "CLASIFICACIÓN";
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0);
            doc.text(title.toUpperCase(), pageWidth / 2, y, { align: "center" });
            y += 7;
            
            // 2. Nombre de la carrera (más pequeño)
            const raceName = appState.currentRace ? appState.currentRace.name : t.raceWithoutName || 'Sin nombre';
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(raceName, pageWidth / 2, y, { align: "center" });
            y += 10;
            
            // 3. INFORMACIÓN EN 2 LÍNEAS (SIN FONDO)
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 0);
            
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
            
            // LÍNEA 1: Fecha y Total
            const fechaText = `${t.date || "Fecha"}: ${dateStr}`;
            const totalText = `${t.totalRiders || "Total"}: ${llegadasConTiempo.length}`;
            
            doc.text(fechaText, margin, y);
            doc.text(totalText, pageWidth - margin, y, { align: "right" });
            y += 5;
            
            // LÍNEA 2: Lugar y Categoría
            const location = appState.currentRace?.location || t.unspecifiedLocation || 'No especificado';
            const locationText = `${t.location || "Lugar"}: ${location}`;
            const category = appState.currentRace?.category || t.unspecifiedCategory || 'No especificada';
            const categoryText = `${t.category || "Categoría"}: ${category}`;
            
            doc.text(locationText, margin, y);
            doc.text(categoryText, pageWidth - margin, y, { align: "right" });
            y += 8;
            
            return y;
        }
        
        // ============================================
        // FUNCIÓN PARA DIBUJAR CABECERA DE TABLA
        // ============================================
        function drawTableHeaders(startY) {
            // Fondo gris oscuro para cabecera
            doc.setFillColor(70, 70, 70); // Gris oscuro
            doc.rect(tableMarginLeft, startY - 3, totalTableWidth, 8, 'F');
            
            // Texto de cabeceras en blanco
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            
            // CABECERAS CON TRADUCCIONES (orden nuevo)
            const headers = [
                t.position || "POS",
                t.bibNumber || "DORSAL", 
                t.name || "NOMBRE",
                t.surname || "APELLIDOS",
                t.category || "CATEGORÍA",
                t.team || "EQUIPO",
                t.timeFinal || "TIEMPO FINAL",
                t.difference || "DIFERENCIA"
            ];
            
            const aligns = ["center", "center", "left", "left", "center", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            headers.forEach((header, index) => {
                // Convertir a mayúsculas para modo título
                const headerUpper = header.toUpperCase();
                if (aligns[index] === "center") {
                    doc.text(headerUpper, xPosition + (columnWidths[index] / 2), startY + 1, { align: "center" });
                } else {
                    doc.text(headerUpper, xPosition + 2, startY + 1);
                }
                xPosition += columnWidths[index];
            });
            
            return startY + 8;
        }
        
        // ============================================
        // FUNCIÓN PARA MANEJAR TEXTO LARGO
        // ============================================
        function handleLongText(text, columnWidth, padding = 4) {
            if (!text) return "";
            
            const availableWidth = columnWidth - padding;
            const charsPerMM = 0.8;
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
        
        // ============================================
        // FUNCIÓN PARA DIBUJAR UNA FILA DE DATOS - SOLO BLANCO/GRIS
        // ============================================
        function drawDataRow(llegada, startY, rowNumber, diferenciaFormatted) {
            // ALTERNANCIA DE COLORES: impar = blanco, par = gris
            const isEvenRow = rowNumber % 2 === 0;
            
            // Aplicar fondo según si es fila par (gris) o impar (blanco)
            if (isEvenRow) {
                // FILAS PARES (2, 4, 6...): GRIS CLARO
                doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
                doc.rect(tableMarginLeft, startY - 2, totalTableWidth, rowHeight, 'F');
                // Texto normal sobre gris
                doc.setTextColor(0, 0, 0);
            } else {
                // FILAS IMPARES (1, 3, 5...): BLANCO (no hacer nada, fondo por defecto)
                // Texto normal sobre blanco
                doc.setTextColor(0, 0, 0);
            }
            
            // Configurar fuente (NEGRITA para primeros 3 puestos)
            doc.setFontSize(9);
            
            if (rowNumber <= 3) {
                doc.setFont("helvetica", "bold");
            } else {
                doc.setFont("helvetica", "normal");
            }
            
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
            
            // CATEGORÍA
            const categoria = llegada.categoria || "";
            doc.text(categoria, xPosition + (columnWidths[4] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[4];
            
            // EQUIPO
            const equipo = llegada.equipo || "";
            doc.text(equipo, xPosition + (columnWidths[5] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[5];
            
            // TIEMPO FINAL (nuevo formato sin ceros innecesarios)
            const tiempoFinal = formatTimeNoLeadingZeros(llegada.tiempoFinalWithMs);
            doc.text(tiempoFinal, xPosition + (columnWidths[6] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[6];
            
            // DIFERENCIA (nuevo formato sin ceros innecesarios)
            doc.text(diferenciaFormatted, xPosition + (columnWidths[7] / 2), startY + 2, { align: "center" });
            
            // Línea divisoria entre filas (muy sutil)
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(tableMarginLeft, startY + 4, tableMarginLeft + totalTableWidth, startY + 4);
            
            return startY + rowHeight;
        }
        
        // ============================================
        // FUNCIÓN PARA PIE DE PÁGINA (SIN "Crono CRI" y CORRECTO POSICIONAMIENTO)
        // ============================================
        function drawPageFooter(pageNum, totalPages) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false
            });
            const dateStr = now.toLocaleDateString('es-ES');
            
            doc.setFontSize(7);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(120, 120, 120);
            
            // Hora y fecha (IZQUIERDA)
            doc.text(`${timeStr} - ${dateStr}`, margin, pageHeight - 7);
            
            // Número de página (DERECHA) - CORREGIDO
            const pageText = t.page || "Página";
            doc.text(`${pageText} ${pageNum} ${t.of || "de"} ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
            
            // NOTA: ELIMINADO "Crono CRI - Sistema de Cronometraje 3.1.6"
        }
        
        // ============================================
        // CALCULAR DIFERENCIAS CON NUEVO FORMATO
        // ============================================
        let mejorTiempo = llegadasConTiempo[0]?.tiempoFinalWithMs || 0;
        const llegadasConDiferencia = llegadasConTiempo.map((llegada, index) => {
            let diferenciaFormatted = '0.000';
            if (index === 0) {
                diferenciaFormatted = '0.000';
            } else {
                const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                diferenciaFormatted = formatTimeNoLeadingZeros(diffSegundos);
            }
            return { ...llegada, diferenciaFormatted };
        });
        
        // ============================================
        // GENERAR PDF CON PAGINACIÓN
        // ============================================
        currentY = drawPageHeader();
        currentY = drawTableHeaders(currentY);
        
        // PROCESAR TODAS LAS FILAS CON PAGINACIÓN
        llegadasConDiferencia.forEach((llegada, index) => {
            if (rowIndex >= maxRowsPerPage) {
                drawPageFooter(pageNumber, totalPages);
                doc.addPage();
                pageNumber++;
                rowIndex = 0;
                
                currentY = 10;
                currentY = drawPageHeader();
                currentY = drawTableHeaders(currentY);
            }
            
            // Pasar rowNumber = índice + 1 (para que empiece en 1, no en 0)
            currentY = drawDataRow(llegada, currentY, index + 1, llegada.diferenciaFormatted);
            rowIndex++;
        });
        
        // DIBUJAR PIE DE PÁGINA FINAL
        drawPageFooter(pageNumber, totalPages);
        
        // ============================================
        // GUARDAR PDF
        // ============================================
        const raceName = appState.currentRace ? 
            appState.currentRace.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) : 
            'carrera';
        const now = new Date();
        const dateFileStr = now.toISOString().split('T')[0];
        const timeFileStr = now.getHours().toString().padStart(2, '0') + 
                          now.getMinutes().toString().padStart(2, '0');
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
// SISTEMA DE PANTALLA EXTERNA - TODO EN LLEGADAS.JS
// ============================================

let externalScreenInterval = null;
let externalScreenActive = false;

// 1. DETECTAR PANTALLAS EXTERNAS
function hasExternalScreens() {
    console.log("🔍 Iniciando detección de pantallas...");
    
    // MÉTODO 1: API MODERNA (Chrome 100+, Edge 100+)
    if ('getScreenDetails' in window) {
        console.log("✅ API getScreenDetails disponible");
        return new Promise((resolve) => {
            window.getScreenDetails()
                .then(screenDetails => {
                    const numScreens = screenDetails.screens.length;
                    console.log(`📊 Pantallas detectadas (getScreenDetails): ${numScreens}`);
                    resolve(numScreens > 1);
                })
                .catch(error => {
                    console.log("❌ Error en getScreenDetails:", error);
                    resolve(checkFallbackMethods());
                });
        });
    }
    
    // MÉTODO 2: DETECCIÓN POR ANCHO (para navegadores antiguos)
    return checkFallbackMethods();
}

// Función auxiliar para métodos alternativos
function checkFallbackMethods() {
    console.log("🔄 Usando métodos alternativos...");
    
    // A. Detectar por tamaño de pantalla (si el ancho es > 2500px, probablemente sean 2 pantallas)
    const isVeryWide = window.screen.width > 2500;
    console.log(`- Ancho de pantalla: ${window.screen.width}px, Muy ancho (>2500): ${isVeryWide}`);
    
    // B. Detectar por disponibilidad (algunos navegadores)
    const isExtended = window.screen.isExtended || false;
    console.log(`- screen.isExtended: ${isExtended}`);
    
    // C. Detectar por matchMedia
    let mediaMatchResult = false;
    try {
        mediaMatchResult = window.matchMedia('(min-width: 2000px)').matches;
        console.log(`- matchMedia (>2000px): ${mediaMatchResult}`);
    } catch (e) {
        console.log("❌ Error en matchMedia");
    }
    
    // RESULTADO FINAL: Cualquiera de estos métodos puede indicar pantallas múltiples
    const result = isVeryWide || isExtended || mediaMatchResult;
    console.log(`📋 Resultado detección: ${result}`);
    
    return result;
}

// 2. ACTUALIZAR VISIBILIDAD DEL BOTÓN
function updateExternalScreenButton() {
    const btn = document.getElementById('external-screen-btn');
    if (!btn) {
        console.error("❌ Botón external-screen-btn no encontrado");
        return;
    }
    
    console.log("🔄 Actualizando botón pantalla externa...");
    
    // La nueva función puede devolver una Promesa
    const detectionResult = hasExternalScreens();
    
    if (detectionResult instanceof Promise) {
        // Es una promesa (API moderna)
        detectionResult.then(hasExternal => {
            console.log(`✅ Resultado promesa: ${hasExternal}`);
            btn.style.display = hasExternal ? 'inline-flex' : 'none';
            
            // Forzar visibilidad para testing si es necesario
            if (!hasExternal) {
                console.log("⚠️ No detectado, pero forzando para testing...");
                btn.style.display = 'inline-flex'; // <-- CAMBIA ESTO TEMPORALMENTE
            }
        }).catch(error => {
            console.error("❌ Error en detección:", error);
            btn.style.display = 'none';
        });
    } else {
        // Es un booleano (métodos antiguos)
        console.log(`✅ Resultado booleano: ${detectionResult}`);
        btn.style.display = detectionResult ? 'inline-flex' : 'none';
        
        // Forzar visibilidad para testing si es necesario
        if (!detectionResult) {
            console.log("⚠️ No detectado, pero forzando para testing...");
            btn.style.display = 'inline-flex'; // <-- CAMBIA ESTO TEMPORALMENTE
        }
    }
}

// REEMPLAZA la función showExternalScreen() con ESTO:

let externalWindow = null;

function showExternalScreen() {
    console.log("🖥️ Gestionando pantalla externa...");
    
    // 1. SI YA EXISTE Y ESTÁ ABIERTA → CERRARLA
    if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
        console.log("✅ Pantalla externa ya activa, cerrando...");
        window.externalScreenWindow.close();
        window.externalScreenWindow = null;
        showMessage("Pantalla externa cerrada", 'info');
        return;
    }
    
    // 2. SI NO EXISTE → CREAR NUEVA
    try {
        // Calcular posición para segunda pantalla (a la derecha de la principal)
        const primaryScreenWidth = window.screen.width;
        const secondaryScreenLeft = primaryScreenWidth + 100;
        
        const windowWidth = 1200;
        const windowHeight = 800;
        const windowLeft = secondaryScreenLeft + 100;
        const windowTop = 100;
        
        const windowFeatures = `
            width=${windowWidth},
            height=${windowHeight},
            left=${windowLeft},
            top=${windowTop},
            menubar=no,
            toolbar=no,
            location=no,
            status=no,
            resizable=yes,
            scrollbars=yes
        `.replace(/\s+/g, '');
        
        console.log(`📍 Abriendo ventana en: left=${windowLeft}, top=${windowTop}`);
        
        // Contenido HTML MEJORADO (SIN BOTÓN FEO DE CERRAR)
        const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Crono CRI - Pantalla Externa</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    background: linear-gradient(135deg, #0a0a0a, #1a1a1a);
                    color: white;
                    height: 100vh;
                    overflow: hidden;
                }
                
                .header { 
                    background: linear-gradient(135deg, #1a237e, #0d47a1);
                    padding: 30px 25px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                }
                
                .header h1 { 
                    font-size: 2.8em; 
                    margin: 0 0 10px 0; 
                    color: white;
                    text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
                    letter-spacing: 1px;
                }
                
                .subtitle {
                    font-size: 1.3em;
                    opacity: 0.9;
                }
                
                .content {
                    height: calc(100vh - 160px);
                    overflow-y: auto;
                    padding: 20px;
                }
                
                .table-container {
                    max-width: 95%;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 1.5em;
                }
                
                th {
                    background: linear-gradient(135deg, #2c3e50, #34495e);
                    color: white;
                    padding: 25px 15px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 1.1em;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                
                td {
                    padding: 20px 15px;
                    text-align: center;
                    border-bottom: 1px solid #eee;
                    color: #333;
                }
                
                tr:nth-child(even) { background: #f8f9fa; }
                tr:hover { background: #e9ecef; }
                
                .gold { 
                    background: linear-gradient(135deg, #ffd700, #ffecb3) !important; 
                    font-weight: bold;
                    color: #333;
                }
                
                .silver { 
                    background: linear-gradient(135deg, #c0c0c0, #e0e0e0) !important; 
                    color: #333;
                }
                
                .bronze { 
                    background: linear-gradient(135deg, #cd7f32, #e0b880) !important; 
                    color: #333;
                }
                
                .time-cell {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    font-size: 1.1em;
                }
                
                .status-bar {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(21, 101, 192, 0.95);
                    color: white;
                    padding: 12px 20px;
                    text-align: center;
                    font-size: 1em;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }
                
                .loading {
                    text-align: center;
                    padding: 60px;
                    font-size: 1.8em;
                    color: #666;
                }
                
                /* Indicador sutil de que está en pantalla externa */
                .external-indicator {
                    position: absolute;
                    top: 15px;
                    right: 20px;
                    font-size: 0.9em;
                    opacity: 0.7;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏁 CLASIFICACIÓN EN DIRECTO</h1>
                <div class="subtitle" id="race-title">Crono CRI - Modo Llegadas</div>
                <div class="external-indicator">🖥️ Pantalla Externa</div>
            </div>
            
            <div class="content">
                <div class="table-container">
                    <table id="ranking-table">
                        <thead>
                            <tr>
                                <th style="width: 100px;">POS</th>
                                <th style="width: 120px;">DORSAL</th>
                                <th>NOMBRE</th>
                                <th style="width: 200px;">TIEMPO FINAL</th>
                                <th style="width: 200px;">DIFERENCIA</th>
                            </tr>
                        </thead>
                        <tbody id="table-body">
                            <tr>
                                <td colspan="5" class="loading">🕒 Cargando clasificación...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="status-bar">
                <span id="update-time">Esperando datos...</span>
                <span id="participant-count" style="font-weight: bold;">0 participantes</span>
                <span id="auto-update" style="color: #4caf50;">🔄 Actualización automática</span>
            </div>
            
            <script>
                // Variables
                let lastUpdate = null;
                
                // Formatear tiempo
                function formatTime(seconds) {
                    if (!seconds && seconds !== 0) return '00:00:00.000';
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    const secs = Math.floor(seconds % 60);
                    const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
                    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}.\${ms.toString().padStart(3, '0')}\`;
                }
                
                // Actualizar contenido
                function updateContent(data) {
                    if (!data || !data.llegadas) return;
                    
                    try {
                        // Filtrar y ordenar llegadas
                        const llegadasConTiempo = data.llegadas
                            .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
                            .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
                        
                        const tbody = document.getElementById('table-body');
                        let html = '';
                        let mejorTiempo = null;
                        
                        // Generar filas
                        llegadasConTiempo.forEach((llegada, index) => {
                            // Calcular diferencia
                            let diferencia = '0.000';
                            if (mejorTiempo === null) {
                                mejorTiempo = llegada.tiempoFinalWithMs;
                            } else {
                                const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                                diferencia = formatTime(diffSegundos);
                            }
                            
                            // Clase para podio
                            let rowClass = '';
                            if (index === 0) rowClass = 'gold';
                            else if (index === 1) rowClass = 'silver';
                            else if (index === 2) rowClass = 'bronze';
                            
                            const nombreCompleto = \`\${llegada.nombre || ''} \${llegada.apellidos || ''}\`.trim();
                            
                            html += \`
                            <tr class="\${rowClass}">
                                <td style="font-weight: \${index < 3 ? 'bold' : 'normal'}; font-size: 1.3em">
                                    \${index + 1}
                                </td>
                                <td style="font-weight: bold; font-size: 1.4em">
                                    \${llegada.dorsal}
                                </td>
                                <td style="text-align: left; padding-left: 30px; font-size: 1.2em">
                                    \${nombreCompleto || '---'}
                                </td>
                                <td class="time-cell">
                                    \${formatTime(llegada.tiempoFinalWithMs)}
                                </td>
                                <td class="time-cell" style="color: \${index === 0 ? '#2e7d32' : '#d32f2f'}">
                                    \${index === 0 ? '---' : \`+\${diferencia}\`}
                                </td>
                            </tr>
                            \`;
                        });
                        
                        // Si no hay datos
                        if (llegadasConTiempo.length === 0) {
                            html = \`
                            <tr>
                                <td colspan="5" style="padding: 60px; text-align: center; color: #666; font-size: 1.8em">
                                    🕒 Esperando llegadas...
                                </td>
                            </tr>
                            \`;
                        }
                        
                        tbody.innerHTML = html;
                        
                        // Actualizar información
                        document.getElementById('update-time').textContent = 
                            \`Última actualización: \${new Date().toLocaleTimeString()}\`;
                        document.getElementById('participant-count').textContent = 
                            \`\${llegadasConTiempo.length} participantes\`;
                        
                        // Actualizar título si hay datos de carrera
                        if (data.raceName) {
                            document.getElementById('race-title').textContent = data.raceName;
                        }
                        
                        lastUpdate = Date.now();
                        
                    } catch (error) {
                        console.error('Error actualizando:', error);
                    }
                }
                
                // Solicitar datos
                function requestData() {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({ 
                            type: 'requestExternalScreenData' 
                        }, '*');
                    }
                }
                
                // Escuchar mensajes del padre
                window.addEventListener('message', function(event) {
                    if (event.data.type === 'updateExternalScreenData') {
                        updateContent(event.data);
                    }
                });
                
                // Inicializar
                window.addEventListener('load', function() {
                    requestData();
                    
                    // Auto-refrescar cada 2 segundos
                    setInterval(requestData, 2000);
                });
                
                // Cerrar automáticamente si la ventana principal se cierra
                window.addEventListener('beforeunload', function() {
                    // No hacer nada - dejar que el padre maneje el cierre
                });
                
                // Intentar pantalla completa (opcional, descomenta si quieres)
                /*
                setTimeout(() => {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen().catch(e => {
                            console.log('Pantalla completa no disponible:', e);
                        });
                    }
                }, 1000);
                */
                
            </script>
        </body>
        </html>
        `;
        
        // Abrir la ventana
        window.externalScreenWindow = window.open('', 'CronoCRI_ExternalScreen', windowFeatures);
        
        if (!window.externalScreenWindow) {
            showMessage("Permite ventanas emergentes para usar pantalla externa", 'error');
            return;
        }
        
        // Escribir contenido
        window.externalScreenWindow.document.write(content);
        window.externalScreenWindow.document.close();
        
        // Configurar comunicación
        setupExternalScreenCommunication();
        
        // Actualizar texto del botón para indicar que se puede cerrar
        updateExternalScreenButtonState(true);
        
        showMessage("✅ Pantalla externa activada", 'success');
        
    } catch (error) {
        console.error("❌ Error:", error);
        showMessage("Error: " + error.message, 'error');
    }
}

// Función para actualizar estado del botón
function updateExternalScreenButtonState(isActive) {
    const btn = document.getElementById('external-screen-btn');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    const text = btn.querySelector('#external-screen-text');
    
    if (isActive) {
        // Cambiar a "Cerrar Pantalla"
        if (icon) icon.className = 'fas fa-times-circle';
        if (text) text.textContent = 'Cerrar Pantalla';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-danger');
    } else {
        // Cambiar a "Pantalla Externa"
        if (icon) icon.className = 'fas fa-external-display-alt';
        if (text) text.textContent = 'Pantalla Externa';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-warning');
    }
}

// Modificar setupExternalScreenSystem para incluir detección de cierre
function setupExternalScreenSystem() {
    const btn = document.getElementById('external-screen-btn');
    if (btn) {
        btn.addEventListener('click', showExternalScreen);
        console.log("✅ Listener añadido a botón Pantalla Externa");
    }
    
    // Verificar periódicamente si la ventana se cerró
    setInterval(() => {
        if (window.externalScreenWindow && window.externalScreenWindow.closed) {
            window.externalScreenWindow = null;
            updateExternalScreenButtonState(false);
            console.log("✅ Ventana externa cerrada detectada");
        }
    }, 1000);
    
    // Actualizar visibilidad inicial
    updateExternalScreenButton();
}

// Modificar closeExternalScreen (ahora se llama desde showExternalScreen)
function closeExternalScreen() {
    // Esta función ahora es manejada por showExternalScreen
    // Mantenemos la función por compatibilidad
    if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
        window.externalScreenWindow.close();
        window.externalScreenWindow = null;
        updateExternalScreenButtonState(false);
    }
}

// Configurar comunicación entre ventanas
function setupExternalScreenCommunication() {
    // Escuchar solicitudes de datos desde la ventana externa
    window.addEventListener('message', function(event) {
        if (event.data.type === 'requestExternalScreenData') {
            // Enviar datos actualizados
            const data = {
                type: 'updateExternalScreenData',
                llegadas: llegadasState.llegadas,
                raceName: appState.currentRace ? appState.currentRace.name : null
            };
            
            if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
                window.externalScreenWindow.postMessage(data, '*');
            }
        }
    });
    
    // También enviar datos automáticamente cuando cambien
    const originalSaveLlegadasState = saveLlegadasState;
    window.saveLlegadasState = function() {
        const result = originalSaveLlegadasState();
        
        // Enviar datos a la ventana externa si está abierta
        if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
            setTimeout(() => {
                const data = {
                    type: 'updateExternalScreenData',
                    llegadas: llegadasState.llegadas,
                    raceName: appState.currentRace ? appState.currentRace.name : null
                };
                window.externalScreenWindow.postMessage(data, '*');
            }, 300);
        }
        
        return result;
    };
}

// Modificar closeExternalScreen para cerrar la ventana
function closeExternalScreen() {
    console.log("🖥️ Cerrando pantalla externa...");
    
    if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
        window.externalScreenWindow.close();
        window.externalScreenWindow = null;
    }
    
    showMessage("Pantalla externa cerrada", 'info');
}

// Función para actualizar el contenido de la pantalla externa
function updateExternalScreenContent() {
    if (!externalScreenActive) return;
    
    const container = document.getElementById('external-screen-container');
    if (!container) {
        externalScreenActive = false;
        return;
    }
    
    try {
        // Obtener datos actualizados
        const llegadasConTiempo = llegadasState.llegadas
            .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
            .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
        
        const tbody = document.getElementById('external-screen-table-body');
        if (!tbody) return;
        
        let html = '';
        let mejorTiempo = null;
        
        // Generar filas de tabla
        llegadasConTiempo.forEach((llegada, index) => {
            // Calcular diferencia
            let diferencia = '0.000';
            if (mejorTiempo === null) {
                mejorTiempo = llegada.tiempoFinalWithMs;
            } else {
                const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                diferencia = formatSecondsWithMilliseconds(diffSegundos);
            }
            
            // Clases para podio
            let rowClass = '';
            if (index === 0) rowClass = 'background: linear-gradient(135deg, #ffd700, #ffecb3); font-weight: bold;';
            else if (index === 1) rowClass = 'background: linear-gradient(135deg, #c0c0c0, #e0e0e0);';
            else if (index === 2) rowClass = 'background: linear-gradient(135deg, #cd7f32, #e0b880);';
            else if (index % 2 === 0) rowClass = 'background: #f8f9fa;';
            
            const nombreCompleto = `${llegada.nombre || ''} ${llegada.apellidos || ''}`.trim();
            
            html += `
            <tr style="${rowClass}">
                <td style="padding: 15px; text-align: center; font-size: 1.2em; font-weight: ${index < 3 ? 'bold' : 'normal'}">
                    ${index + 1}
                </td>
                <td style="padding: 15px; text-align: center; font-weight: bold; font-size: 1.3em">
                    ${llegada.dorsal}
                </td>
                <td style="padding: 15px; text-align: left; font-size: 1.1em">
                    ${nombreCompleto || '---'}
                </td>
                <td style="padding: 15px; text-align: center; font-family: monospace; font-weight: bold; font-size: 1.2em">
                    ${formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs)}
                </td>
                <td style="padding: 15px; text-align: center; font-family: monospace; font-size: 1.1em; color: ${index === 0 ? '#2e7d32' : '#d32f2f'}">
                    ${index === 0 ? '---' : `+${diferencia}`}
                </td>
            </tr>
            `;
        });
        
        // Si no hay datos
        if (llegadasConTiempo.length === 0) {
            html = `
            <tr>
                <td colspan="5" style="padding: 60px; text-align: center; color: #666; font-size: 1.3em">
                    🕒 Esperando llegadas...
                </td>
            </tr>
            `;
        }
        
        tbody.innerHTML = html;
        
        // Actualizar información de estado
        const updateTime = document.getElementById('external-screen-update-time');
        const count = document.getElementById('external-screen-count');
        
        if (updateTime) {
            updateTime.textContent = `Última actualización: ${new Date().toLocaleTimeString()}`;
        }
        
        if (count) {
            count.textContent = `${llegadasConTiempo.length} participantes`;
        }
        
        console.log(`🔄 Pantalla externa actualizada: ${llegadasConTiempo.length} participantes`);
        
    } catch (error) {
        console.error("❌ Error actualizando pantalla externa:", error);
    }
}

// Modificar closeExternalScreen para manejar el nuevo sistema
function closeExternalScreen() {
    console.log("🖥️ Cerrando pantalla externa...");
    
    externalScreenActive = false;
    
    // Salir de pantalla completa si estamos en ella
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    
    // Eliminar contenedor
    const container = document.getElementById('external-screen-container');
    if (container) {
        container.remove();
    }
    
    // Detener actualizaciones
    if (externalScreenInterval) {
        clearInterval(externalScreenInterval);
        externalScreenInterval = null;
    }
    
    showMessage("Pantalla externa cerrada", 'info');
}

// Modificar startExternalScreenUpdates para el nuevo sistema
function startExternalScreenUpdates() {
    if (externalScreenInterval) {
        clearInterval(externalScreenInterval);
    }
    
    // Actualizar cada 2 segundos
    externalScreenInterval = setInterval(() => {
        if (externalScreenActive) {
            updateExternalScreenContent();
        }
    }, 2000);
    
    // También actualizar cuando se guardan nuevas llegadas
    const originalSaveLlegadasState = saveLlegadasState;
    window.saveLlegadasState = function() {
        const result = originalSaveLlegadasState();
        
        // Actualizar pantalla externa si está activa
        if (externalScreenActive) {
            setTimeout(updateExternalScreenContent, 300);
        }
        
        return result;
    };
}


// Abrir ventana en pantalla específica
function openWindowOnScreen(screen) {
    console.log(`📍 Abriendo en pantalla: ${screen.width}x${screen.height} en (${screen.left}, ${screen.top})`);
    
    // Configuración de la ventana
    const width = Math.min(screen.availWidth - 100, 1200);
    const height = Math.min(screen.availHeight - 100, 800);
    const left = screen.left + (screen.availWidth - width) / 2;
    const top = screen.top + (screen.availHeight - height) / 2;
    
    // Parámetros de la ventana
    const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        menubar=no,
        toolbar=no,
        location=no,
        status=no,
        resizable=yes,
        scrollbars=yes
    `.replace(/\s+/g, '');
    
    // Crear contenido HTML para la ventana
    const content = generateExternalScreenContent();
    
    // Abrir ventana
    externalWindow = window.open('', 'CronoCRI_ExternalScreen', windowFeatures);
    
    if (!externalWindow) {
        showMessage("El navegador bloqueó la ventana emergente. Permite popups.", 'error');
        return;
    }
    
    // Escribir contenido
    externalWindow.document.write(content);
    externalWindow.document.close();
    
    // Configurar actualizaciones automáticas
    startExternalScreenUpdates();
    
    showMessage("Pantalla externa abierta en segunda pantalla", 'success');
}

// Método alternativo (cuando no podemos detectar la pantalla)
function openFallbackWindow() {
    console.log("🔄 Usando método alternativo...");
    
    // Intentar abrir en el lado derecho de la pantalla principal
    const width = 1200;
    const height = 800;
    const left = window.screen.availWidth + 100; // Forzar a la derecha
    const top = 100;
    
    const windowFeatures = `
        width=${width},
        height=${height},
        left=${left},
        top=${top},
        menubar=no,
        toolbar=no,
        location=no,
        status=no,
        resizable=yes,
        scrollbars=yes
    `.replace(/\s+/g, '');
    
    const content = generateExternalScreenContent();
    externalWindow = window.open('', 'CronoCRI_ExternalScreen', windowFeatures);
    
    if (!externalWindow) {
        showMessage("Permite ventanas emergentes para usar pantalla externa", 'error');
        return;
    }
    
    externalWindow.document.write(content);
    externalWindow.document.close();
    startExternalScreenUpdates();
    
    showMessage("Pantalla externa abierta", 'success');
}

// Generar contenido HTML para la ventana externa
function generateExternalScreenContent() {
    const t = translations[appState.currentLanguage];
    
    // Obtener datos actualizados
    const llegadasConTiempo = llegadasState.llegadas
        .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
        .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
    
    // Construir tabla HTML
    let tableRows = '';
    let mejorTiempo = null;
    
    llegadasConTiempo.forEach((llegada, index) => {
        let diferencia = '0.000';
        if (mejorTiempo === null) {
            mejorTiempo = llegada.tiempoFinalWithMs;
        } else {
            const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
            diferencia = formatSecondsWithMilliseconds(diffSegundos);
        }
        
        tableRows += `
        <tr class="${index < 3 ? 'puesto-' + (index + 1) : ''}">
            <td><strong>${index + 1}</strong></td>
            <td>${llegada.dorsal}</td>
            <td><strong>${formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs)}</strong></td>
            <td>${diferencia}</td>
            <td>${llegada.nombre || ''}</td>
            <td>${llegada.apellidos || ''}</td>
            <td>${llegada.categoria || ''}</td>
            <td>${llegada.equipo || ''}</td>
        </tr>
        `;
    });
    
    // HTML completo
    return `
    <!DOCTYPE html>
    <html lang="${appState.currentLanguage}">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Crono CRI - Pantalla Externa</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: Arial, sans-serif; 
                background: #1a1a1a; 
                color: white;
                padding: 20px;
                height: 100vh;
                overflow: hidden;
            }
            .container { 
                max-width: 100%; 
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .header { 
                background: #2c3e50; 
                color: white; 
                padding: 15px; 
                text-align: center;
                border-radius: 8px 8px 0 0;
                margin-bottom: 10px;
            }
            .header h1 { font-size: 2em; margin-bottom: 5px; }
            .header .subtitle { font-size: 0.9em; opacity: 0.8; }
            .content {
                flex: 1;
                overflow-y: auto;
                background: white;
                color: #333;
                border-radius: 0 0 8px 8px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 1.2em;
            }
            th {
                background: #34495e;
                color: white;
                padding: 12px 8px;
                text-align: center;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            td {
                padding: 10px 8px;
                text-align: center;
                border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) { background: #f8f9fa; }
            tr:hover { background: #e9ecef; }
            .puesto-1 { background: #ffd700 !important; font-weight: bold; }
            .puesto-2 { background: #c0c0c0 !important; }
            .puesto-3 { background: #cd7f32 !important; }
            .status-bar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #2c3e50;
                color: white;
                padding: 8px;
                text-align: center;
                font-size: 0.9em;
            }
            .close-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #e74c3c;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                cursor: pointer;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏁 ${t.classification || 'CLASIFICACIÓN'}</h1>
                <div class="subtitle">
                    ${appState.currentRace ? appState.currentRace.name : 'Carrera'} | 
                    ${new Date().toLocaleTimeString()} | 
                    <span id="count">${llegadasConTiempo.length} participantes</span>
                </div>
                <button class="close-btn" onclick="window.close()">✕ Cerrar</button>
            </div>
            
            <div class="content">
                <table id="ranking-table">
                    <thead>
                        <tr>
                            <th>POS</th>
                            <th>DORSAL</th>
                            <th>TIEMPO FINAL</th>
                            <th>DIFERENCIA</th>
                            <th>NOMBRE</th>
                            <th>APELLIDOS</th>
                            <th>CATEGORÍA</th>
                            <th>EQUIPO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows || '<tr><td colspan="8" style="text-align:center;padding:40px;">Esperando datos...</td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <div class="status-bar">
                <span id="update-time">Última actualización: ${new Date().toLocaleTimeString()}</span> | 
                <span id="auto-update">Actualización automática activada</span>
            </div>
        </div>
        
        <script>
            // Función para actualizar desde la ventana principal
            function updateContent(data) {
                if (data && data.llegadas) {
                    const tbody = document.querySelector('#ranking-table tbody');
                    let html = '';
                    let mejorTiempo = null;
                    
                    // Ordenar por tiempo
                    const llegadasOrdenadas = data.llegadas
                        .filter(l => l.tiempoFinalWithMs > 0)
                        .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
                    
                    llegadasOrdenadas.forEach((llegada, index) => {
                        let diferencia = '0.000';
                        if (mejorTiempo === null) {
                            mejorTiempo = llegada.tiempoFinalWithMs;
                        } else {
                            const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                            diferencia = formatTime(diffSegundos);
                        }
                        
                        html += \`
                        <tr class="\${index < 3 ? 'puesto-' + (index + 1) : ''}">
                            <td><strong>\${index + 1}</strong></td>
                            <td>\${llegada.dorsal}</td>
                            <td><strong>\${formatTime(llegada.tiempoFinalWithMs)}</strong></td>
                            <td>\${diferencia}</td>
                            <td>\${llegada.nombre || ''}</td>
                            <td>\${llegada.apellidos || ''}</td>
                            <td>\${llegada.categoria || ''}</td>
                            <td>\${llegada.equipo || ''}</td>
                        </tr>
                        \`;
                    });
                    
                    tbody.innerHTML = html || '<tr><td colspan="8" style="text-align:center;padding:40px;">Esperando datos...</td></tr>';
                    document.getElementById('count').textContent = llegadasOrdenadas.length + ' participantes';
                    document.getElementById('update-time').textContent = 'Última actualización: ' + new Date().toLocaleTimeString();
                }
            }
            
            function formatTime(seconds) {
                if (!seconds && seconds !== 0) return '00:00:00.000';
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = Math.floor(seconds % 60);
                const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
                return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}.\${ms.toString().padStart(3, '0')}\`;
            }
            
            // Solicitar datos iniciales al padre
            if (window.opener) {
                window.opener.postMessage({ type: 'requestData' }, '*');
            }
            
            // Escuchar actualizaciones del padre
            window.addEventListener('message', function(event) {
                if (event.data.type === 'updateData') {
                    updateContent(event.data);
                }
            });
            
            // Auto-refrescar cada 30 segundos por si falla la conexión
            setInterval(() => {
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage({ type: 'requestData' }, '*');
                }
            }, 30000);
        </script>
    </body>
    </html>
    `;
}

// 4. CERRAR PANTALLA EXTERNA
function closeExternalScreen() {
    console.log("🖥️ Desactivando pantalla externa...");
    
    externalScreenActive = false;
    
    // A. Detener actualizaciones automáticas
    if (externalScreenInterval) {
        clearInterval(externalScreenInterval);
        externalScreenInterval = null;
    }
    
    // B. Restaurar estilos originales del modal
    const modal = document.getElementById('ranking-modal');
    if (modal && modal._originalStyles) {
        Object.assign(modal.style, modal._originalStyles);
        delete modal._originalStyles;
    }
    
    // C. Mostrar botones normales
    const closeSelectors = ['.modal-close', '#close-ranking-btn', '#export-ranking-pdf-btn'];
    closeSelectors.forEach(selector => {
        const elem = modal?.querySelector(selector);
        if (elem) elem.style.display = '';
    });
    
    // D. Eliminar botón de cerrar específico
    const customCloseBtn = modal?.querySelector('#external-screen-close-btn');
    if (customCloseBtn) customCloseBtn.remove();
    
    // E. Restaurar tabla
    const table = modal?.querySelector('#ranking-table');
    if (table) {
        table.style.fontSize = '';
        table.style.width = '';
    }
    
    // F. Cerrar modal
    if (modal) {
        modal.classList.remove('active');
    }
    
    showMessage("Pantalla externa desactivada", 'info');
}

// 5. ACTUALIZACIONES AUTOMÁTICAS
function startExternalScreenUpdates() {
    // Limpiar intervalo anterior
    if (externalScreenInterval) {
        clearInterval(externalScreenInterval);
    }
    
    // Actualizar cada 3 segundos si el modal está visible
    externalScreenInterval = setInterval(() => {
        if (!externalScreenActive) return;
        
        const modal = document.getElementById('ranking-modal');
        if (!modal || !modal.classList.contains('active')) return;
        
        // Forzar actualización de la clasificación
        showRankingModal();
        console.log("🔄 Actualizando pantalla externa automáticamente");
    }, 3000);
    
    // También actualizar cuando haya cambios en llegadas
    const originalSaveLlegadasState = saveLlegadasState;
    window.saveLlegadasState = function() {
        originalSaveLlegadasState();
        
        if (externalScreenActive) {
            setTimeout(() => {
                const modal = document.getElementById('ranking-modal');
                if (modal && modal.classList.contains('active')) {
                    showRankingModal();
                }
            }, 500);
        }
    };
}

// 6. CONFIGURAR EVENT LISTENERS (TODO EN LLEGADAS.JS)
function setupExternalScreenSystem() {
    // A. Configurar botón
    const btn = document.getElementById('external-screen-btn');
    if (btn) {
        btn.addEventListener('click', showExternalScreen);
        console.log("✅ Listener añadido a botón Pantalla Externa");
    } else {
        console.error("❌ No se encontró #external-screen-btn");
    }
    
    // B. Actualizar visibilidad inicial
    updateExternalScreenButton();
    
    // C. Detectar cambios en pantallas
    window.addEventListener('resize', function() {
        setTimeout(updateExternalScreenButton, 500);
    });
    
    // D. Detectar cuando el modo llegadas se activa
    const modeSlider = document.querySelector('.mode-slider');
    if (modeSlider) {
        modeSlider.addEventListener('click', function() {
            setTimeout(updateExternalScreenButton, 300);
        });
    }
}

// 7. INTEGRAR CON INICIALIZACIÓN DE LLEGADAS
// Modificar initLlegadasMode() para incluir el sistema
const originalInitLlegadasMode = initLlegadasMode;
window.initLlegadasMode = function() {
    originalInitLlegadasMode();
    setupExternalScreenSystem();
    console.log("✅ Sistema de pantalla externa inicializado");
};

// 8. EXPORTAR FUNCIONES
window.showExternalScreen = showExternalScreen;
window.closeExternalScreen = closeExternalScreen;
window.updateExternalScreenButton = updateExternalScreenButton;

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

console.log("✅ Módulo de llegadas 3.2.1 cargado");