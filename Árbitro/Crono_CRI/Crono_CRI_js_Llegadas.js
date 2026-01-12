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