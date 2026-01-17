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
// FORMATEAR TIEMPO PARA EXCEL - NUEVO 3.7.4
// ============================================
function formatTimeForExcel(timeValue, esPrimerCorredor = false) {
    // Si es null/undefined/vacío → celda vacía
    if (!timeValue && timeValue !== 0) {
        return '';
    }
    
    // Si es string, convertir a string limpio
    const timeStr = timeValue.toString().trim();
    
    // Si es '--:--:--' o similar → celda vacía
    if (timeStr === '--:--:--' || timeStr === '--:--' || timeStr === '--') {
        return '';
    }
    
    // Si es '00:00:00' y NO es primer corredor → celda vacía
    // (primer corredor puede tener 00:00:00 válido)
    if (timeStr === '00:00:00' && !esPrimerCorredor) {
        return '';
    }
    
    // Si es '00:00:00.000' (con milésimas) → celda vacía (si no es primer corredor)
    if (timeStr.startsWith('00:00:00.') && !esPrimerCorredor) {
        return '';
    }
    
    // Valor válido, devolver tal cual
    return timeStr;
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
    console.log("🚀 Inicializando modo llegadas - SISTEMA 3.5.2 con Entrada Manual");
    
    // 1. Cargar estado
    loadLlegadasState();
    
    // 2. Configurar intervalos de tiempo
    if (window.llegadasUpdateInterval) {
        clearInterval(window.llegadasUpdateInterval);
    }
    
    window.llegadasUpdateInterval = setInterval(() => {
        if (typeof updateLlegadasTimerDisplay === 'function') {
            updateLlegadasTimerDisplay();
        }
    }, 100);
    
    // 3. Configurar event listeners
    setupLlegadasEventListeners();
    
    // ⭐ 4. CONFIGURAR BOTÓN DE ENTRADA MANUAL
    console.log("🔧 Configurando botón Entrada Manual...");
    setupManualEntryButton();
    
    // 5. Renderizar interfaz
    renderLlegadasList();
    updateLlegadasTimerDisplay();
    
    // 6. Actualizar contadores y estado
    actualizarContadorLlegadas();
    updateInitialCompactTimerState();
        
    // Configurar indicador de próximos dorsales
    setupNextDorsalsIndicator();
    
    console.log("✅ Modo llegadas inicializado con Entrada Manual");
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
        
        // NUEVO 3.5.4.1: Actualizar contador
        actualizarContadorLlegadas();
        
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

    updateNextDorsalsInfo();
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
    
    // ✅ NUEVO: Verificar si dorsal ya existe (BLOQUEAR DUPLICADOS)
    const dorsalExistente = llegadasState.llegadas.find((l, i) => 
        i !== index && l.dorsal === dorsal);
    
    if (dorsalExistente) {
        // ❌ DETENER PROCESO - Dorsal duplicado NO PERMITIDO
        showMessage(`❌ Dorsal ${dorsal} ya está registrado en otra llegada. Usa un dorsal diferente.`, 'error');
        
        // Restaurar el valor anterior del campo (si lo había) o dejarlo vacío
        const llegadaActual = llegadasState.llegadas[index];
        if (llegadaActual && llegadaActual.dorsal) {
            // Restaurar el dorsal anterior si existía
            const celda = document.querySelector(`#llegadas-table-body tr[data-index="${index}"] td:first-child`);
            if (celda) {
                celda.textContent = llegadaActual.dorsal;
            }
        } else {
            // Si no tenía dorsal anterior, dejar vacío
            const celda = document.querySelector(`#llegadas-table-body tr[data-index="${index}"] td:first-child`);
            if (celda) {
                celda.textContent = '';
            }
            // Asegurar que el estado también se mantiene vacío
            if (llegadaActual) {
                llegadaActual.dorsal = null;
                llegadaActual.pendiente = true;
            }
        }
        
        // ❌ SALIR DE LA FUNCIÓN - NO continuar con el procesamiento
        return;
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

    actualizarContadorLlegadas();
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
    
    // NUEVO 3.3.5.4: Calcular posiciones por categoría
    const mapaPosicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
    const posicionCategoria = mapaPosicionesPorCategoria[llegada.id] || '';
    
    // Actualizar las 14 columnas (nuevo orden)
    // 0: Dorsal, 1: Crono Llegada, 2: Tiempo Final, 3: Posición general, 
    // 4: Nombre, 5: Apellidos, 6: Posición Categoría, 7: Categoría, etc.
    
    // 0: Dorsal
    celdas[0].textContent = llegada.dorsal || '';
    celdas[0].className = llegada.dorsal ? '' : 'dorsal-pendiente';
    
    // 1: Crono Llegada - CON 3 DECIMALES
    celdas[1].textContent = formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs);
    
    // 2: Tiempo Final - CON 3 DECIMALES
    celdas[2].textContent = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
    
    // 3: POSICIÓN GENERAL - NO actualizar aquí (se actualiza en renderLlegadasList o actualizarDorsal)
    // Mantener el valor actual
    
    // 4: Nombre
    celdas[4].textContent = llegada.nombre || '';
    
    // 5: Apellidos
    celdas[5].textContent = llegada.apellidos || '';
    
    // 6: POSICIÓN POR CATEGORÍA - NUEVO 3.3.5.4
    celdas[6].textContent = posicionCategoria;
    celdas[6].className = 'posicion-categoria';
    
    // 7: Categoría (movida aquí)
    celdas[7].textContent = llegada.categoria || '';
    celdas[7].className = 'categoria';
    
    // 8: Crono Salida - SIN DECIMALES (de tabla salida)
    celdas[8].textContent = llegada.cronoSalida || '--:--:--';
    
    // 9: Hora Llegada
    celdas[9].textContent = llegada.horaLlegada || '--:--:--';
    
    // 10: Hora Salida
    celdas[10].textContent = llegada.horaSalida || '--:--:--';
    
    // 11: Chip
    celdas[11].textContent = llegada.chip || '';
    
    // 12: Equipo
    celdas[12].textContent = llegada.equipo || '';
    
    // 13: Licencia
    celdas[13].textContent = llegada.licencia || '';
}

// ============================================
// ACTUALIZAR UNA SOLA FILA CON POSICIÓN - ACTUALIZADO 3.3.5.4
// ============================================
function actualizarFilaLlegadaIndividual(index) {
    const llegada = llegadasState.llegadas[index];
    if (!llegada) return;
    
    const fila = document.querySelector(`#llegadas-table-body tr[data-index="${index}"]`);
    if (!fila) return;
    
    const celdas = fila.querySelectorAll('td');
    
    // Calcular posiciones generales (basada en TODAS las llegadas)
    const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
    const posicion = mapaPosiciones[llegada.id] || '';
    
    // NUEVO 3.3.5.4: Calcular posición por categoría
    const mapaPosicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
    const posicionCategoria = mapaPosicionesPorCategoria[llegada.id] || '';
    
    // Actualizar las 14 columnas (nuevo orden)
    celdas[0].textContent = llegada.dorsal || '';
    celdas[0].className = llegada.dorsal ? '' : 'dorsal-pendiente';
    
    // Crono Llegada (col 2) - CON 3 DECIMALES
    celdas[1].textContent = formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs);
    
    // Tiempo Final (col 3) - CON 3 DECIMALES
    celdas[2].textContent = formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs);
    
    // POSICIÓN GENERAL (col 4)
    celdas[3].textContent = posicion;
    celdas[3].className = 'posicion';
    
    // Nombre (col 5)
    celdas[4].textContent = llegada.nombre || '';
    
    // Apellidos (col 6)
    celdas[5].textContent = llegada.apellidos || '';
    
    // POSICIÓN POR CATEGORÍA (col 7) - NUEVO 3.3.5.4
    celdas[6].textContent = posicionCategoria;
    celdas[6].className = 'posicion-categoria';
    
    // Categoría (col 8) - Movida aquí
    celdas[7].textContent = llegada.categoria || '';
    celdas[7].className = 'categoria';
    
    // Crono Salida (col 9)
    celdas[8].textContent = llegada.cronoSalida || '--:--:--';
    
    // Hora Llegada (col 10)
    celdas[9].textContent = llegada.horaLlegada || '--:--:--';
    
    // Hora Salida (col 11)
    celdas[10].textContent = llegada.horaSalida || '--:--:--';
    
    // Chip (col 12)
    celdas[11].textContent = llegada.chip || '';
    
    // Equipo (col 13)
    celdas[12].textContent = llegada.equipo || '';
    
    // Licencia (col 14)
    celdas[13].textContent = llegada.licencia || '';
}

// ============================================
// RENDERIZADO DE TABLA CON 14 COLUMNAS (NUEVO ORDEN 3.3.5.4)
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
    
    // Calcular posiciones generales
    const mapaPosiciones = calcularMapaPosiciones(llegadasState.llegadas);
    
    // NUEVO 3.3.5.4: Calcular posiciones por categoría
    const mapaPosicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
    
    let html = '';
    
    llegadasState.llegadas.forEach((llegada, index) => {
        const esUltima = index === 0;
        const tieneDorsal = llegada.dorsal && llegada.dorsal !== null;
        const claseFila = esUltima ? 'ultima-llegada' : '';
        const claseDorsal = tieneDorsal ? '' : 'dorsal-pendiente';
        
        // Obtener posición general
        const posicion = llegada.tiempoFinalWithMs && llegada.tiempoFinalWithMs > 0
            ? (mapaPosiciones[llegada.id] || '')
            : '';
        
        // Obtener posición por categoría (NUEVO 3.3.5.4)
        const posicionCategoria = mapaPosicionesPorCategoria[llegada.id] || '';
        
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
            
            <!-- 4. POSICIÓN GENERAL (columna 4) -->
            <td class="posicion">${posicion}</td>
            
            <!-- 5. Nombre (columna 5) -->
            <td>${llegada.nombre || ''}</td>
            
            <!-- 6. Apellidos (columna 6) -->
            <td>${llegada.apellidos || ''}</td>
            
            <!-- 7. POSICIÓN POR CATEGORÍA (columna 7) - NUEVO 3.3.5.4 -->
            <td class="posicion-categoria">${posicionCategoria}</td>
            
            <!-- 8. Categoría (columna 8) - MOVIDA AQUÍ -->
            <td class="categoria">${llegada.categoria || ''}</td>
            
            <!-- 9. Crono Salida (columna 9) -->
            <td class="crono-salida">${llegada.cronoSalida || '--:--:--'}</td>
            
            <!-- 10. Hora Llegada (columna 10) -->
            <td>${llegada.horaLlegada || '--:--:--'}</td>
            
            <!-- 11. Hora Salida (columna 11) -->
            <td>${llegada.horaSalida || '--:--:--'}</td>
            
            <!-- 12. Chip (columna 12) -->
            <td>${llegada.chip || ''}</td>
            
            <!-- 13. Equipo (columna 13) -->
            <td>${llegada.equipo || ''}</td>
            
            <!-- 14. Licencia (columna 14) -->
            <td>${llegada.licencia || ''}</td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;

    actualizarContadorLlegadas();
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
       
        // NUEVO 3.5.4.1: Actualizar contador
        actualizarContadorLlegadas();

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
    
    // NUEVO 3.3.5.4: Calcular posiciones por categoría
    const mapaPosicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
    
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
        // VERSIÓN 3.3.5.4 - HEADER ACTUALIZADO (14 COLUMNAS - NUEVO ORDEN)
        ['Dorsal', 'Crono Llegada', 'Tiempo Final', 'Posición', 'Nombre', 'Apellidos', 
         'Pos. Cat.', 'Categoria', 'Crono Salida', 'Hora Llegada', 'Hora Salida', 'Chip', 
         'Equipo', 'Licencia', 'Notas']  // Notas sigue siendo la columna 15
    ];
    
    let posicion = 1;
    let tiempoAnterior = null;
    
    // Procesar llegadas con tiempo para manejar empates
    llegadasOrdenadas.forEach((llegada, index) => {
        // Calcular posición general considerando empates
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
        
        // Obtener posición por categoría
        const posicionCategoria = mapaPosicionesPorCategoria[llegada.id] || '';
        
        data.push([
            llegada.dorsal || '',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            formatSecondsWithMilliseconds(llegada.tiempoFinalWithMs),
            posicionActual,
            llegada.nombre || '',
            llegada.apellidos || '',
            posicionCategoria,  // NUEVO: Posición por categoría
            llegada.categoria || '',
            // NUEVO 3.5.4: Usar formatTimeForExcel para tiempos (celdas vacías si no hay valor)
            formatTimeForExcel(llegada.cronoSalida),
            formatTimeForExcel(llegada.horaLlegada),
            formatTimeForExcel(llegada.horaSalida),
            llegada.chip || '',
            llegada.equipo || '',
            llegada.licencia || '',
            llegada.notas || ''
        ]);
    });
    
    // Procesar llegadas sin tiempo
    llegadasSinTiempo.forEach(llegada => {
        // Obtener posición por categoría (vacía si no tiene tiempo)
        const posicionCategoria = '';
        
        data.push([
            llegada.dorsal || 'PENDIENTE',
            formatSecondsWithMilliseconds(llegada.cronoLlegadaWithMs),
            'SIN TIEMPO',
            '--',
            llegada.nombre || '',
            llegada.apellidos || '',
            posicionCategoria,  // NUEVO: Posición por categoría
            llegada.categoria || '',
            // NUEVO 3.5.4: Usar formatTimeForExcel para tiempos (celdas vacías si no hay valor)
            formatTimeForExcel(llegada.cronoSalida),
            formatTimeForExcel(llegada.horaLlegada),
            formatTimeForExcel(llegada.horaSalida),
            llegada.chip || '',
            llegada.equipo || '',
            llegada.licencia || '',
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
    if (rankingBtn) rankingBtn.addEventListener('click', showExternalScreen);
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

// ============================================
// CALCULAR POSICIONES POR CATEGORÍA - NUEVO 3.3.5.4
// ============================================
function calcularPosicionesPorCategoria(llegadas) {
    // 1. Agrupar llegadas por categoría
    const llegadasPorCategoria = {};
    
    llegadas.forEach(llegada => {
        const categoria = llegada.categoria || '';
        if (!llegadasPorCategoria[categoria]) {
            llegadasPorCategoria[categoria] = [];
        }
        // Solo incluir llegadas con tiempo válido para cálculo de posiciones
        if (llegada.tiempoFinalWithMs && llegada.tiempoFinalWithMs > 0) {
            llegadasPorCategoria[categoria].push({
                ...llegada,
                // Guardar referencia original
                originalId: llegada.id
            });
        }
    });
    
    // 2. Para cada categoría, calcular posiciones
    const mapaPosicionesPorCategoria = {};
    
    Object.keys(llegadasPorCategoria).forEach(categoria => {
        const llegadasCategoria = llegadasPorCategoria[categoria];
        
        if (llegadasCategoria.length === 0) return;
        
        // Ordenar por tiempo (más rápido primero)
        llegadasCategoria.sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
        
        // Calcular posiciones con manejo de empates
        let posicionActual = 1;
        
        for (let i = 0; i < llegadasCategoria.length; i++) {
            const llegada = llegadasCategoria[i];
            
            // Si es el primero o tiene tiempo diferente al anterior
            if (i === 0 || llegada.tiempoFinalWithMs > llegadasCategoria[i-1].tiempoFinalWithMs) {
                mapaPosicionesPorCategoria[llegada.originalId] = posicionActual;
                posicionActual = i + 2; // Siguiente posición
            } else {
                // Mismo tiempo que el anterior → misma posición
                mapaPosicionesPorCategoria[llegada.originalId] = posicionActual - 1;
            }
        }
    });
    
    // 3. Para llegadas sin categoría o sin tiempo, posición vacía
    llegadas.forEach(llegada => {
        if (!mapaPosicionesPorCategoria.hasOwnProperty(llegada.id)) {
            mapaPosicionesPorCategoria[llegada.id] = '';
        }
    });
    
    return mapaPosicionesPorCategoria;
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
// FUNCIÓN PARA GENERAR PDF DE CLASIFICACIÓN - ACTUALIZADO 3.3.5.4
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
        // NUEVO FUNCIÓN PARA FORMATO DE TIEMPO SIN CEROS INNECESARIOS
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
        
        // ============================================
        // CALCULAR DIFERENCIAS CON NUEVO FORMATO Y POSICIONES POR CATEGORÍA
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
        
        // NUEVO 3.3.5.4: Calcular posiciones por categoría para PDF
        const mapaPosicionesPorCategoria = calcularPosicionesPorCategoria(llegadasConDiferencia);
        
        // ============================================
        // CONFIGURACIÓN DE TABLA - NUEVO ORDEN 3.3.5.4
        // ============================================
        const posWidth = 12;          // POS
        const dorsalWidth = 15;       // DORSAL  
        const nombreWidth = 22;       // NOMBRE
        const apellidosWidth = 22;    // APELLIDOS
        const posCatWidth = 12;       // NUEVO: POS. CAT.
        const categoriaWidth = 18;    // CATEGORÍA
        const equipoWidth = 20;       // EQUIPO
        const tiempoFinalWidth = 22;  // TIEMPO FINAL
        const diferenciaWidth = 20;   // DIFERENCIA
        
        // Ancho total de la tabla
        const totalTableWidth = posWidth + dorsalWidth + nombreWidth + apellidosWidth + 
                               posCatWidth + categoriaWidth + equipoWidth + tiempoFinalWidth + diferenciaWidth;
        
        // Calcular margen izquierdo para centrar tabla
        const tableMarginLeft = margin + (contentWidth - totalTableWidth) / 2;
        
        // Array de anchos de columna (NUEVO ORDEN 3.3.5.4)
        const columnWidths = [posWidth, dorsalWidth, nombreWidth, apellidosWidth, 
                            posCatWidth, categoriaWidth, equipoWidth, tiempoFinalWidth, diferenciaWidth];
        
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
        
        // ⭐ NUEVO 3.5.4.1: Añadir logos al PDF (clasificación)
        addLogosToPDF(doc, appState.currentRace);
        function toTitleCase(str) {
            if (!str || typeof str !== 'string') return '';
            // Convierte primera letra mayúscula, resto minúscula
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        
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
            const category = toTitleCase(appState.currentRace?.category || t.unspecifiedCategory || 'No especificada');
            const categoryText = toTitleCase(`${t.category || "Categoría"}: ${category}`);
            
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
            
            // CABECERAS CON TRADUCCIONES (orden nuevo 3.3.5.4)
            const headers = [
                toTitleCase(t.position || "POS"),
                toTitleCase(t.bibNumber || "DORSAL"), 
                toTitleCase(t.name || "NOMBRE"),
                toTitleCase(t.surname || "APELLIDOS"),
                toTitleCase("POS. CAT."),  // NUEVO 3.3.5.4
                toTitleCase(t.category || "CATEGORÍA"),
                toTitleCase(t.team || "EQUIPO"),
                toTitleCase(t.timeFinal || "TIEMPO FINAL"),
                toTitleCase(t.difference || "DIFERENCIA")
            ];


            
            const aligns = ["center", "center", "left", "left", "center", "center", "center", "center", "center"];
            let xPosition = tableMarginLeft;
            
            headers.forEach((header, index) => {
                // ⭐ CAMBIO AQUÍ: Usar header en formato título en lugar de .toUpperCase()
                // header ya está en formato título gracias a toTitleCase()
                if (aligns[index] === "center") {
                    doc.text(header, xPosition + (columnWidths[index] / 2), startY + 1, { align: "center" });
                } else {
                    doc.text(header, xPosition + 2, startY + 1);
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
            
            // Obtener posición por categoría como número
            const posicionCategoria = mapaPosicionesPorCategoria[llegada.id] || "";
            const posicionCategoriaNum = parseInt(posicionCategoria) || 0;
            
            // Configurar fuente (NEGRITA para primeros 3 puestos generales Y primeros 3 por categoría)
            doc.setFontSize(9);
            
            // ⭐ NUEVA CONDICIÓN: Negrita si está entre los primeros 3 generales O primeros 3 por categoría
            if (rowNumber <= 3 || posicionCategoriaNum <= 3) {
                doc.setFont("helvetica", "bold");
            } else {
                doc.setFont("helvetica", "normal");
            }
            
            const aligns = ["center", "center", "left", "left", "center", "center", "center", "center", "center"];
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
            
            // POS. CAT. (NUEVO 3.3.5.4) - ASEGURAR QUE ES STRING
            const posicionCategoriaStr = posicionCategoria.toString(); // CONVERTIR A STRING
            doc.text(posicionCategoriaStr, xPosition + (columnWidths[4] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[4];
            
            // CATEGORÍA
            const categoria = llegada.categoria || "";
            doc.text(categoria, xPosition + (columnWidths[5] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[5];
            
            // EQUIPO
            const equipo = llegada.equipo || "";
            doc.text(equipo, xPosition + (columnWidths[6] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[6];
            
            // TIEMPO FINAL (nuevo formato sin ceros innecesarios)
            const tiempoFinal = formatTimeNoLeadingZeros(llegada.tiempoFinalWithMs);
            doc.text(tiempoFinal, xPosition + (columnWidths[7] / 2), startY + 2, { align: "center" });
            xPosition += columnWidths[7];
            
            // DIFERENCIA (nuevo formato sin ceros innecesarios)
            doc.text(diferenciaFormatted, xPosition + (columnWidths[8] / 2), startY + 2, { align: "center" });
            
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
// SISTEMA DE PANTALLA EXTERNA - VERSIÓN LIMPIA
// ============================================

// Variables globales
let externalScreenCloseDetector = null;

// 1. DETECTAR PANTALLAS EXTERNAS (MANTENER)
function hasExternalScreens() {
    console.log("🔍 Iniciando detección de pantallas...");
    
    if ('getScreenDetails' in window) {
        console.log("✅ API getScreenDetails disponible");
        return new Promise((resolve) => {
            window.getScreenDetails()
                .then(screenDetails => {
                    const numScreens = screenDetails.screens.length;
                    console.log(`📊 Pantallas detectadas: ${numScreens}`);
                    resolve(numScreens > 1);
                })
                .catch(error => {
                    console.log("❌ Error en getScreenDetails:", error);
                    resolve(checkFallbackMethods());
                });
        });
    }
    
    return checkFallbackMethods();
}

function checkFallbackMethods() {
    console.log("🔄 Usando métodos alternativos...");
    
    const isVeryWide = window.screen.width > 2500;
    const isExtended = window.screen.isExtended || false;
    
    console.log(`- Ancho: ${window.screen.width}px, Muy ancho: ${isVeryWide}`);
    console.log(`- screen.isExtended: ${isExtended}`);
    
    return isVeryWide || isExtended;
}

// 2. ACTUALIZAR VISIBILIDAD DEL BOTÓN (SIMPLIFICADA)
function updateExternalScreenButton() {
    const btn = document.getElementById('external-screen-btn');
    if (!btn) {
        console.error("❌ Botón external-screen-btn no encontrado");
        return;
    }
    
    const detectionResult = hasExternalScreens();
    
    if (detectionResult instanceof Promise) {
        detectionResult.then(hasExternal => {
            btn.style.display = hasExternal ? 'inline-flex' : 'none';
        }).catch(() => {
            btn.style.display = 'none';
        });
    } else {
        btn.style.display = detectionResult ? 'inline-flex' : 'none';
    }
}

// 3. FUNCIÓN PRINCIPAL - TOGGLE PANTALLA EXTERNA (VERSIÓN CORREGIDA)
function showExternalScreen() {
    console.log("🖥️ Gestionando pantalla externa...");
    
    // 1. SI YA EXISTE Y ESTÁ ABIERTA → CERRARLA
    if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
        console.log("✅ Pantalla externa ya activa, cerrando...");
        window.externalScreenWindow.close();
        window.externalScreenWindow = null;
        updateExternalScreenButtonText(false);
        showMessage("Pantalla externa cerrada", 'info');
        return;
    }
    
    // 2. CREAR NUEVA VENTANA
    try {
        // ESTRATEGIA AGRESIVA PARA SEGUNDA PANTALLA
        let windowLeft, windowTop;
        const screenWidth = window.screen.width;
        const screenAvailWidth = window.screen.availWidth;
        
        console.log(`📊 Detectando pantallas: Ancho total=${screenWidth}px, Disponible=${screenAvailWidth}px`);
        
        // PROBAR DIFERENTES ESTRATEGIAS
        if (screenWidth > 3000) {
            windowLeft = 1920 + 100;
            windowTop = 100;
            console.log("📍 Estrategia 1: 2 pantallas 1920px (posición 2020,100)");
        } else if (screenAvailWidth > 2500) {
            windowLeft = screenAvailWidth - 1300;
            windowTop = 100;
            console.log(`📍 Estrategia 2: Ancho disponible grande (posición ${windowLeft},100)`);
        } else if (screenWidth > 1920 && screenWidth <= 2560) {
            windowLeft = Math.floor(screenWidth * 0.6);
            windowTop = 100;
            console.log(`📍 Estrategia 3: Pantalla ancha (posición ${windowLeft},100)`);
        } else {
            windowLeft = Math.max(100, screenAvailWidth + 100);
            windowTop = 100;
            console.log(`📍 Estrategia 4: Fuera de pantalla (posición ${windowLeft},100)`);
        }
        
        if (windowLeft < 100 || windowLeft > 5000) {
            windowLeft = 2020;
            windowTop = 100;
            console.log("📍 Estrategia 5: Usando posición por defecto (2020,100)");
        }
        
        const windowWidth = 1400;
        const windowHeight = 900;
        
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
            scrollbars=no
        `.replace(/\s+/g, '');
        
        console.log(`📍 Abriendo ventana: ${windowWidth}x${windowHeight} en (${windowLeft},${windowTop})`);
        
        // HTML COMPLETO CON DISEÑO MEJORADO
        const content = `<!DOCTYPE html>
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
            padding: 15px 25px;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            position: relative;
            z-index: 100;
        }
        
        .race-name { 
            font-size: 1.8em;
            margin: 0 0 5px 0;
            color: white;
            font-weight: bold;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        }
        
        .header h1 { 
            font-size: 1.6em;
            margin: 0;
            color: #ffcc00;
            text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
            letter-spacing: 0.5px;
        }
        
        .external-indicator {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 0.8em;
            opacity: 0.7;
        }
        
        /* ⭐ NUEVO: BOTÓN DE CIERRE PARA MÓVIL */
        .close-btn {
            position: absolute;
            top: 15px;
            left: 20px;
            background: rgba(220, 53, 69, 0.9);
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 150;
            transition: all 0.3s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .close-btn:hover {
            background: rgba(200, 35, 51, 1);
            transform: scale(1.1);
        }
        
        /* ⭐ NUEVO: Mostrar solo en móviles */
        @media (max-width: 768px) {
            .close-btn {
                display: flex;
            }
            
            .external-indicator {
                right: 70px;
            }
            
            .header {
                padding: 15px 60px 15px 70px;
            }
        }
        
        /* ⭐ NUEVO: Ocultar en desktop */
        @media (min-width: 769px) {
            .close-btn {
                display: none;
            }
        }
        
        .scrolling-container {
            height: calc(100vh - 130px);
            overflow: hidden;
            position: relative;
        }
        
        /* CONTENEDOR PARA LOS 5 PRIMEROS (FIJOS) */
        .top5-fixed {
            background: white;
            border-radius: 8px 8px 0 0;
            margin: 12px 12px 0 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 50;
        }
        
        /* CONTENEDOR PARA SCROLL AUTOMÁTICO */
        .scrolling-content {
            margin: 0 12px 12px 12px;
            background: white;
            border-radius: 0 0 8px 8px;
            overflow: hidden;
            position: relative;
            height: calc(100vh - 350px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        
        /* ANIMACIÓN DE SCROLL AUTOMÁTICO */
        .scrolling-rows {
            animation: scrollAnimation 30s linear infinite;
        }
        
        @keyframes scrollAnimation {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(calc(-100% + 400px));
            }
        }
        
        .scrolling-rows:hover {
            animation-play-state: paused;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 1em;
        }
        
        th {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 12px 6px;
            text-align: center;
            font-weight: bold;
            font-size: 0.9em;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        /* ESTILO ESPECIAL PARA TABLA FIJA (TOP5) */
        .top5-fixed th {
            top: 0;
            z-index: 20;
        }
        
        .scrolling-content th {
            top: 0;
            z-index: 20;
        }
        
        td {
            padding: 10px 6px;
            text-align: center;
            border-bottom: 1px solid #eee;
            color: #333;
            font-size: 0.9em;
        }
        
        tr:nth-child(even) { background: #f8f9fa; }
        tr:hover { background: #e9ecef; }
        
        /* CLASES PARA PODIUM GENERAL */
        .gold-row { 
            background: linear-gradient(135deg, #fff9c4, #fff59d) !important;
            font-weight: bold;
        }
        
        .silver-row { 
            background: linear-gradient(135deg, #f5f5f5, #eeeeee) !important;
        }
        
        .bronze-row { 
            background: linear-gradient(135deg, #ffecb3, #ffe082) !important;
        }
        
        /* MEDALLAS PARA POSICIÓN GENERAL */
        .pos-medal-1::before {
            content: "🥇 ";
            font-size: 1.1em;
        }
        
        .pos-medal-2::before {
            content: "🥈 ";
            font-size: 1.1em;
        }
        
        .pos-medal-3::before {
            content: "🥉 ";
            font-size: 1.1em;
        }
        
        .pos-medal-4::before, .pos-medal-5::before {
            content: "🏅 ";
            font-size: 1em;
            opacity: 0.8;
        }
        
        .time-cell {
            font-family: 'Courier New', monospace;
            font-weight: bold;
            font-size: 0.9em;
        }
        
        .status-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(21, 101, 192, 0.95);
            color: white;
            padding: 8px 12px;
            text-align: center;
            font-size: 0.85em;
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(10px);
            z-index: 100;
        }
        
        .loading {
            text-align: center;
            padding: 30px;
            font-size: 1.2em;
            color: #666;
        }
        
        /* PICTOGRAMAS PARA POSICIÓN POR CATEGORÍA */
        .cat-pos-cell {
            font-weight: bold;
        }
        
        .cat-pos-1::before {
            content: "🥇 ";
            font-size: 1em;
        }
        
        .cat-pos-2::before {
            content: "🥈 ";
            font-size: 1em;
        }
        
        .cat-pos-3::before {
            content: "🥉 ";
            font-size: 1em;
        }
        
        .categoria-cell {
            font-weight: 600;
            color: #2e7d32;
        }
        
        .equipo-cell {
            text-align: left;
            padding-left: 12px;
            color: #5d4037;
            font-weight: 500;
        }
        
        .nombre-cell {
            text-align: left;
            padding-left: 12px;
            color: #1a237e;
            font-weight: 500;
        }
        
        /* CONTROLES DE SCROLL */
        .scroll-controls {
            position: absolute;
            top: 10px;
            right: 20px;
            display: flex;
            gap: 5px;
            z-index: 30;
        }
        
        .scroll-btn {
            background: rgba(33, 150, 243, 0.9);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.8em;
            cursor: pointer;
            transition: background 0.3s;
        }
        
        .scroll-btn:hover {
            background: rgba(21, 101, 192, 0.9);
        }
        
        /* ⭐ NUEVO: Ajustes para móvil */
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.4em;
            }
            
            .race-name {
                font-size: 1.5em;
            }
            
            table {
                font-size: 0.9em;
            }
            
            th, td {
                padding: 8px 4px;
            }
            
            .scrolling-content {
                height: calc(100vh - 320px);
            }
        }
        
        /* ⭐ NUEVO: Ajustes para móvil muy pequeño */
        @media (max-width: 480px) {
            .header h1 {
                font-size: 1.2em;
            }
            
            .race-name {
                font-size: 1.3em;
            }
            
            table {
                font-size: 0.8em;
            }
            
            th, td {
                padding: 6px 3px;
                font-size: 0.8em;
            }
            
            .nombre-cell, .equipo-cell {
                max-width: 100px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .scrolling-content {
                height: calc(100vh - 300px);
            }
            
            .scroll-controls {
                top: 5px;
                right: 10px;
            }
            
            .scroll-btn {
                padding: 3px 6px;
                font-size: 0.7em;
            }
        }
    </style>
</head>
<body>
    <!-- ⭐ NUEVO: Botón de cierre para móvil -->
    <button class="close-btn" onclick="closeExternalScreen()" title="Cerrar pantalla">×</button>
    
    <div class="header">
        <div class="race-name" id="race-name">Nombre de la Prueba</div>
        <h1>🏁 Clasificación en Directo</h1>
        <div class="external-indicator">🖥️ Pantalla Externa</div>
    </div>
    
    <div class="scrolling-container">
        <!-- TOP 5 FIJOS -->
        <div class="top5-fixed">
            <table id="top5-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">Pos</th>
                        <th style="width: 70px;">Dorsal</th>
                        <th style="width: 180px;">Nombre</th>
                        <th style="width: 80px;">Pos. Cat.</th>
                        <th style="width: 90px;">Categoría</th>
                        <th style="width: 140px;">Equipo</th>
                        <th style="width: 130px;">Tiempo Final</th>
                        <th style="width: 130px;">Diferencia</th>
                    </tr>
                </thead>
                <tbody id="top5-body">
                    <tr><td colspan="8" class="loading">🕒 Cargando top 5...</td></tr>
                </tbody>
            </table>
        </div>
        
        <!-- CONTENIDO CON SCROLL AUTOMÁTICO -->
        <div class="scrolling-content">
            <div class="scroll-controls">
                <button class="scroll-btn" onclick="toggleScroll()">⏸️ Pausar</button>
                <button class="scroll-btn" onclick="resetScroll()">↻ Reiniciar</button>
            </div>
            <table id="scrolling-table">
                <thead>
                    <tr>
                        <th style="width: 60px;">Pos</th>
                        <th style="width: 70px;">Dorsal</th>
                        <th style="width: 180px;">Nombre</th>
                        <th style="width: 80px;">Pos. Cat.</th>
                        <th style="width: 90px;">Categoría</th>
                        <th style="width: 140px;">Equipo</th>
                        <th style="width: 130px;">Tiempo Final</th>
                        <th style="width: 130px;">Diferencia</th>
                    </tr>
                </thead>
                <tbody id="scrolling-body" class="scrolling-rows">
                    <tr><td colspan="8" class="loading">🕒 Cargando clasificación...</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="status-bar">
        <span id="update-time">Esperando datos...</span>
        <span id="participant-count" style="font-weight: bold;">0 participantes</span>
        <span id="auto-update" style="color: #4caf50;">🔄 Scroll automático</span>
    </div>
    
    <script>
        let lastUpdate = null;
        let mapaPosicionesPorCategoria = {};
        let currentLanguage = 'es';
        let isScrolling = true;
        let currentTranslations = null;
        
        // ⭐ NUEVO: Función para cerrar la pantalla externa
        function closeExternalScreen() {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                    type: 'closeExternalScreen'
                }, '*');
            }
            window.close();
        }
        
        // TRADUCCIONES POR DEFECTO (hasta recibir las reales)
        const defaultTranslations = {
            es: {
                position: "Pos",
                bibNumber: "Dorsal",
                name: "Nombre",
                surname: "Apellidos",
                posCat: "Pos. Cat.",
                category: "Categoría",
                team: "Equipo",
                timeFinal: "Tiempo Final",
                difference: "Diferencia",
                classification: "Clasificación",
                totalRiders: "Total",
                date: "Fecha",
                location: "Lugar",
                raceWithoutName: "Sin nombre",
                unspecifiedLocation: "No especificado",
                unspecifiedCategory: "No especificada",
                noDataToExport: "No hay datos para exportar",
                pause: "Pausar",
                resume: "Reanudar",
                restart: "Reiniciar",
                page: "Página",
                of: "de",
                scrollAuto: "Scroll automático",
                scrollPaused: "Scroll pausado",
                scrollRestarted: "Scroll reiniciado",
                moreRidersText: "Más clasificados aparecerán aquí...",
                closeScreen: "Cerrar pantalla"
            },
            ca: {
                position: "Pos",
                bibNumber: "Dorsal",
                name: "Nom",
                surname: "Cognoms",
                posCat: "Pos. Cat.",
                category: "Categoria",
                team: "Equip",
                timeFinal: "Temps Final",
                difference: "Diferència",
                classification: "Classificació",
                totalRiders: "Total",
                date: "Data",
                location: "Lloc",
                raceWithoutName: "Sense nom",
                unspecifiedLocation: "No especificat",
                unspecifiedCategory: "No especificada",
                noDataToExport: "No hi ha dades per exportar",
                pause: "Pausa",
                resume: "Reprendre",
                restart: "Reiniciar",
                page: "Pàgina",
                of: "de",
                scrollAuto: "Scroll automàtic",
                scrollPaused: "Scroll pausat",
                scrollRestarted: "Scroll reiniciat",
                moreRidersText: "Més classificats apareixeran aquí...",
                closeScreen: "Tancar pantalla"
            },
            en: {
                position: "Pos",
                bibNumber: "Bib",
                name: "Name",
                surname: "Surname",
                posCat: "Cat. Pos.",
                category: "Category",
                team: "Team",
                timeFinal: "Final Time",
                difference: "Difference",
                classification: "Classification",
                totalRiders: "Total",
                date: "Date",
                location: "Location",
                raceWithoutName: "Unnamed",
                unspecifiedLocation: "Unspecified",
                unspecifiedCategory: "Unspecified",
                noDataToExport: "No data to export",
                pause: "Pause",
                resume: "Resume",
                restart: "Restart",
                page: "Page",
                of: "of",
                scrollAuto: "Auto scroll",
                scrollPaused: "Scroll paused",
                scrollRestarted: "Scroll restarted",
                moreRidersText: "More riders will appear here...",
                closeScreen: "Close screen"
            },
            fr: {
                position: "Pos",
                bibNumber: "Dossard",
                name: "Prénom",
                surname: "Nom",
                posCat: "Pos. Cat.",
                category: "Catégorie",
                team: "Équipe",
                timeFinal: "Temps Final",
                difference: "Différence",
                classification: "Classement",
                totalRiders: "Total",
                date: "Date",
                location: "Lieu",
                raceWithoutName: "Sans nom",
                unspecifiedLocation: "Non spécifié",
                unspecifiedCategory: "Non spécifiée",
                noDataToExport: "Aucune donnée à exporter",
                pause: "Pause",
                resume: "Reprendre",
                restart: "Redémarrer",
                page: "Page",
                of: "de",
                scrollAuto: "Défilement automatique",
                scrollPaused: "Défilement en pause",
                scrollRestarted: "Défilement redémarré",
                moreRidersText: "Plus de coureurs apparaîtront ici...",
                closeScreen: "Fermer l'écran"
            }
        };
        
        function formatTimeCompact(seconds) {
            if (!seconds && seconds !== 0) return '0.000';
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
            
            let timeString = '';
            if (hours > 0) {
                timeString += hours + ':';
                timeString += minutes.toString().padStart(2, '0') + ':';
                timeString += secs.toString().padStart(2, '0') + '.';
            } else if (minutes > 0) {
                timeString += minutes + ':';
                timeString += secs.toString().padStart(2, '0') + '.';
            } else {
                timeString += secs + '.';
            }
            
            timeString += ms.toString().padStart(3, '0');
            return timeString;
        }
        
        function toTitleCase(str) {
            if (!str || typeof str !== 'string') return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        }
        
        // ACTUALIZAR CABECERAS SEGÚN IDIOMA Y TRADUCCIONES
        function updateTableHeaders(lang = 'es', customTranslations = null) {
            const t = customTranslations || defaultTranslations[lang] || defaultTranslations.es;
            currentTranslations = t;
            
            const headers = [
                toTitleCase(t.position || "Pos"),
                toTitleCase(t.bibNumber || "Dorsal"),
                toTitleCase(t.name || "Nombre"),
                toTitleCase(t.posCat || "Pos. Cat."),
                toTitleCase(t.category || "Categoría"),
                toTitleCase(t.team || "Equipo"),
                toTitleCase(t.timeFinal || "Tiempo Final"),
                toTitleCase(t.difference || "Diferencia")
            ];
            
            // ACTUALIZAR AMBAS TABLAS
            const allThElements = document.querySelectorAll('table th');
            headers.forEach((header, index) => {
                if (allThElements[index]) allThElements[index].textContent = header;
                if (allThElements[index + 8]) allThElements[index + 8].textContent = header;
            });
            
            const titleElement = document.querySelector('.header h1');
            if (titleElement) {
                titleElement.innerHTML = '🏁 ' + toTitleCase(t.classification || "Clasificación") + ' en Directo';
            }
            
            // ACTUALIZAR BOTONES
            const pauseBtn = document.querySelector('.scroll-btn');
            if (pauseBtn) {
                pauseBtn.textContent = isScrolling ? 
                    '⏸️ ' + (t.pause || "Pausar") : 
                    '▶️ ' + (t.resume || "Reanudar");
            }
            
            const restartBtn = document.querySelectorAll('.scroll-btn')[1];
            if (restartBtn) {
                restartBtn.textContent = '↻ ' + (t.restart || "Reiniciar");
            }
            
            // ⭐ NUEVO: Actualizar tooltip del botón de cierre
            const closeBtn = document.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.title = t.closeScreen || "Cerrar pantalla";
            }
            
            const autoUpdateSpan = document.getElementById('auto-update');
            if (autoUpdateSpan) {
                autoUpdateSpan.textContent = isScrolling ? 
                    '🔄 ' + (t.scrollAuto || "Scroll automático") : 
                    '⏸️ ' + (t.scrollPaused || "Scroll pausado");
            }
        }
        
        // CREAR FILA HTML
        function createRowHTML(llegada, index, diferenciaCompact, posCat) {
            const t = currentTranslations || defaultTranslations[currentLanguage] || defaultTranslations.es;
            
            let rowClass = '';
            if (index === 0) rowClass = 'gold-row';
            else if (index === 1) rowClass = 'silver-row';
            else if (index === 2) rowClass = 'bronze-row';
            
            // MEDALLAS PARA POSICIÓN GENERAL (1-5)
            let posMedalClass = '';
            if (index === 0) posMedalClass = 'pos-medal-1';
            else if (index === 1) posMedalClass = 'pos-medal-2';
            else if (index === 2) posMedalClass = 'pos-medal-3';
            else if (index === 3 || index === 4) posMedalClass = 'pos-medal-4';
            
            // MEDALLAS PARA POSICIÓN POR CATEGORÍA
            let catPosClass = 'cat-pos-cell';
            if (posCat === 1 || posCat === '1') catPosClass += ' cat-pos-1';
            else if (posCat === 2 || posCat === '2') catPosClass += ' cat-pos-2';
            else if (posCat === 3 || posCat === '3') catPosClass += ' cat-pos-3';
            
            const nombre = (llegada.nombre || '').substring(0, 15);
            const apellidos = (llegada.apellidos || '').substring(0, 15);
            const categoria = (llegada.categoria || '').substring(0, 10);
            const equipo = (llegada.equipo || '').substring(0, 20);
            const nombreCompleto = (nombre + ' ' + apellidos).trim();
            
            return '<tr class="' + rowClass + '">' +
                '<td class="' + posMedalClass + '" style="font-weight: bold; font-size: 1em">' + (index + 1) + '</td>' +
                '<td style="font-weight: bold; font-size: 1em">' + llegada.dorsal + '</td>' +
                '<td class="nombre-cell" style="font-size: 0.95em">' + (nombreCompleto || '---') + '</td>' +
                '<td class="' + catPosClass + '" style="font-size: 1em">' + (posCat || '--') + '</td>' +
                '<td class="categoria-cell" style="font-size: 0.9em">' + (categoria || '--') + '</td>' +
                '<td class="equipo-cell" style="font-size: 0.9em">' + (equipo || '--') + '</td>' +
                '<td class="time-cell" style="font-size: 0.9em">' + formatTimeCompact(llegada.tiempoFinalWithMs) + '</td>' +
                '<td class="time-cell" style="color: ' + (index === 0 ? '#2e7d32' : '#d32f2f') + '; font-size: 0.9em">' + 
                (index === 0 ? '---' : '+' + diferenciaCompact) + '</td>' +
                '</tr>';
        }
        
        function updateContent(data) {
            if (!data || !data.llegadas) return;
            
            try {
                // ACTUALIZAR TRADUCCIONES SI VIENEN EN LOS DATOS
                if (data.translations) {
                    currentTranslations = data.translations;
                }
                
                if (data.language) {
                    currentLanguage = data.language;
                    updateTableHeaders(currentLanguage, currentTranslations);
                }
                
                const llegadasConTiempo = data.llegadas
                    .filter(l => l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0)
                    .sort((a, b) => a.tiempoFinalWithMs - b.tiempoFinalWithMs);
                
                if (data.posicionesPorCategoria) {
                    mapaPosicionesPorCategoria = data.posicionesPorCategoria;
                }
                
                const t = currentTranslations || defaultTranslations[currentLanguage] || defaultTranslations.es;
                let mejorTiempo = null;
                
                // 1. ACTUALIZAR TOP 5 FIJOS
                const top5Body = document.getElementById('top5-body');
                let top5HTML = '';
                
                llegadasConTiempo.slice(0, 5).forEach((llegada, index) => {
                    // Calcular diferencia
                    let diferenciaCompact = '0.000';
                    if (mejorTiempo === null) {
                        mejorTiempo = llegada.tiempoFinalWithMs;
                    } else {
                        const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                        diferenciaCompact = formatTimeCompact(diffSegundos);
                    }
                    
                    const posCat = mapaPosicionesPorCategoria[llegada.id] || "";
                    top5HTML += createRowHTML(llegada, index, diferenciaCompact, posCat);
                });
                
                if (llegadasConTiempo.length === 0) {
                    top5HTML = '<tr><td colspan="8" style="padding: 30px; text-align: center; color: #666; font-size: 1.2em">' +
                              '🕒 ' + (t.noDataToExport || 'Esperando llegadas...') + '</td></tr>';
                }
                
                top5Body.innerHTML = top5HTML;
                
                // 2. ACTUALIZAR CONTENIDO CON SCROLL (desde posición 6 en adelante)
                const scrollingBody = document.getElementById('scrolling-body');
                let scrollingHTML = '';
                
                if (llegadasConTiempo.length > 5) {
                    // Continuar con el mejor tiempo del top 5
                    mejorTiempo = llegadasConTiempo[0]?.tiempoFinalWithMs || 0;
                    
                    llegadasConTiempo.slice(5).forEach((llegada, index) => {
                        const globalIndex = index + 5;
                        const diffSegundos = llegada.tiempoFinalWithMs - mejorTiempo;
                        const diferenciaCompact = formatTimeCompact(diffSegundos);
                        
                        const posCat = mapaPosicionesPorCategoria[llegada.id] || "";
                        scrollingHTML += createRowHTML(llegada, globalIndex, diferenciaCompact, posCat);
                    });
                } else {
                    scrollingHTML = '<tr><td colspan="8" style="padding: 30px; text-align: center; color: #666; font-size: 1.2em">' +
                                   '📊 ' + (t.moreRidersText || 'Más clasificados aparecerán aquí...') + '</td></tr>';
                }
                
                scrollingBody.innerHTML = scrollingHTML;
                
                // 3. AJUSTAR ANIMACIÓN DE SCROLL SEGÚN NÚMERO DE FILAS
                adjustScrollAnimation(llegadasConTiempo.length);
                
                // ACTUALIZAR INFORMACIÓN
                const now = new Date();
                const timeStr = now.toLocaleTimeString(currentLanguage === 'en' ? 'en-US' : 'es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                });
                
                document.getElementById('update-time').textContent = 
                    (t.date || 'Fecha') + ': ' + now.toLocaleDateString() + ' ' + timeStr;
                document.getElementById('participant-count').textContent = 
                    llegadasConTiempo.length + ' ' + (t.totalRiders || 'participantes');
                
                if (data.raceName) {
                    document.getElementById('race-name').textContent = data.raceName;
                }
                
                lastUpdate = Date.now();
                
            } catch (error) {
                console.error('Error actualizando:', error);
            }
        }
        
        // AJUSTAR ANIMACIÓN DE SCROLL SEGÚN NÚMERO DE FILAS
        function adjustScrollAnimation(totalRows) {
            const scrollingRows = document.querySelector('.scrolling-rows');
            if (!scrollingRows) return;
            
            // Calcular duración basada en número de filas
            const rowsAfterTop5 = Math.max(0, totalRows - 5);
            const baseDuration = 30; // segundos base
            const minDuration = 20;
            const maxDuration = 60;
            
            let duration = baseDuration;
            if (rowsAfterTop5 > 0) {
                duration = Math.min(maxDuration, Math.max(minDuration, baseDuration * (rowsAfterTop5 / 15)));
            }
            
            // Aplicar nueva animación (CORREGIDO: sin backticks)
            scrollingRows.style.animation = 'scrollAnimation ' + duration + 's linear infinite';
            
            // Actualizar estado del scroll automático
            const autoUpdateSpan = document.getElementById('auto-update');
            if (autoUpdateSpan && isScrolling) {
                const t = currentTranslations || defaultTranslations[currentLanguage] || defaultTranslations.es;
                autoUpdateSpan.textContent = '🔄 ' + (t.scrollAuto || "Scroll automático") + 
                    ' (' + Math.round(duration) + 's)';
            }
        }
        
        // CONTROLAR SCROLL AUTOMÁTICO
        function toggleScroll() {
            const scrollingRows = document.querySelector('.scrolling-rows');
            const t = currentTranslations || defaultTranslations[currentLanguage] || defaultTranslations.es;
            const pauseBtn = document.querySelector('.scroll-btn');
            
            if (scrollingRows) {
                if (isScrolling) {
                    scrollingRows.style.animationPlayState = 'paused';
                    pauseBtn.textContent = '▶️ ' + (t.resume || "Reanudar");
                    document.getElementById('auto-update').textContent = '⏸️ ' + (t.scrollPaused || "Scroll pausado");
                } else {
                    scrollingRows.style.animationPlayState = 'running';
                    pauseBtn.textContent = '⏸️ ' + (t.pause || "Pausar");
                    document.getElementById('auto-update').textContent = '🔄 ' + (t.scrollAuto || "Scroll automático");
                }
                isScrolling = !isScrolling;
            }
        }
        
        function resetScroll() {
            const scrollingRows = document.querySelector('.scrolling-rows');
            if (scrollingRows) {
                scrollingRows.style.animation = 'none';
                scrollingRows.offsetHeight; // Trigger reflow
                scrollingRows.style.animation = '';
                isScrolling = true;
                
                const pauseBtn = document.querySelector('.scroll-btn');
                const t = currentTranslations || defaultTranslations[currentLanguage] || defaultTranslations.es;
                pauseBtn.textContent = '⏸️ ' + (t.pause || "Pausar");
                document.getElementById('auto-update').textContent = '🔄 ' + (t.scrollRestarted || "Scroll reiniciado");
                
                setTimeout(() => {
                    document.getElementById('auto-update').textContent = '🔄 ' + (t.scrollAuto || "Scroll automático");
                }, 2000);
            }
        }
        
        function requestData() {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage({ 
                    type: 'requestExternalScreenData',
                    language: currentLanguage
                }, '*');
            }
        }
        
        window.addEventListener('message', function(event) {
            if (event.data.type === 'updateExternalScreenData') {
                updateContent(event.data);
            }
            
            // ⭐ NUEVO: Manejar cierre desde la aplicación principal
            if (event.data.type === 'closeExternalScreen') {
                window.close();
            }
        });
        
        window.addEventListener('load', function() {
            // Inicializar cabeceras en español
            updateTableHeaders('es');
            requestData();
            setInterval(requestData, 2000);
        });
    </script>
</body>
</html>`;
        
        // ABRIR VENTANA
        window.externalScreenWindow = window.open('', 'CronoCRI_ExternalScreen', windowFeatures);
        
        if (!window.externalScreenWindow) {
            showMessage("Permite ventanas emergentes para usar pantalla externa", 'error');
            return;
        }
        
        window.externalScreenWindow.document.write(content);
        window.externalScreenWindow.document.close();
        
        setupExternalScreenCommunication();
        updateExternalScreenButtonText(true);
        setupWindowCloseDetector();
        
        showMessage("✅ Pantalla externa activada con scroll automático", 'success');
        
    } catch (error) {
        console.error("❌ Error:", error);
        showMessage("Error: " + error.message, 'error');
    }
}

// 4. ACTUALIZAR TEXTO DEL BOTÓN (SOLO UNA VERSIÓN)
function updateExternalScreenButtonText(isActive) {
    const btn = document.getElementById('external-screen-btn');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    const textSpan = btn.querySelector('#external-screen-text');
    
    if (isActive) {
        // Cambiar a "Cerrar Pantalla"
        if (icon) icon.className = 'fas fa-times-circle';
        if (textSpan) textSpan.textContent = 'Cerrar Pantalla';
        btn.classList.remove('btn-warning');
        btn.classList.add('btn-danger');
    } else {
        // Cambiar a "Pantalla Externa"
        if (icon) icon.className = 'fas fa-external-display-alt';
        if (textSpan) textSpan.textContent = 'Pantalla Externa';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-warning');
    }
}

// 5. DETECTOR DE CIERRE (MANTENER)
function setupWindowCloseDetector() {
    if (externalScreenCloseDetector) {
        clearInterval(externalScreenCloseDetector);
    }
    
    externalScreenCloseDetector = setInterval(() => {
        if (window.externalScreenWindow && window.externalScreenWindow.closed) {
            console.log("✅ Ventana externa cerrada detectada");
            window.externalScreenWindow = null;
            updateExternalScreenButtonText(false);
            clearInterval(externalScreenCloseDetector);
            externalScreenCloseDetector = null;
        }
        
        if (!window.externalScreenWindow) {
            clearInterval(externalScreenCloseDetector);
            externalScreenCloseDetector = null;
        }
    }, 1000);
}

// 6. COMUNICACIÓN (MANTENER)
function setupExternalScreenCommunication() {
    console.log("📡 Configurando comunicación con pantalla externa...");
    
    window.addEventListener('message', function(event) {
        // 1. SOLICITUD DE DATOS DESDE PANTALLA EXTERNA
        if (event.data.type === 'requestExternalScreenData') {
            console.log("📥 Solicitud de datos recibida desde pantalla externa");
            
            // ⭐ Obtener idioma solicitado
            const requestedLanguage = event.data.language || appState.currentLanguage || 'es';
            
            // ⭐ CALCULAR POSICIONES POR CATEGORÍA
            let posicionesPorCategoria = {};
            try {
                posicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
                console.log("✅ Posiciones por categoría calculadas:", Object.keys(posicionesPorCategoria).length, "corredores");
            } catch (error) {
                console.error("❌ Error calculando posiciones por categoría:", error);
                // En caso de error, usar objeto vacío
                posicionesPorCategoria = {};
            }
            
            // ⭐ Obtener traducciones desde el objeto centralizado
            const t = translations[requestedLanguage] || translations.es;
            
            const data = {
                type: 'updateExternalScreenData',
                llegadas: llegadasState.llegadas,
                raceName: appState.currentRace ? appState.currentRace.name : null,
                posicionesPorCategoria: posicionesPorCategoria,
                language: requestedLanguage,
                // ⭐ ENVIAR SOLO LAS TRADUCCIONES NECESARIAS
                translations: {
                    position: t.position || "Pos",
                    bibNumber: t.bibNumber || "Dorsal",
                    name: t.name || "Nombre",
                    surname: t.surname || "Apellidos",
                    posCat: t.posCatHeader || "Pos. Cat.",
                    category: t.category || "Categoría",
                    team: t.team || "Equipo",
                    timeFinal: t.timeFinal || "Tiempo Final",
                    difference: t.difference || "Diferencia",
                    classification: t.classification || "Clasificación",
                    totalRiders: t.totalRiders || "Total",
                    date: t.date || "Fecha",
                    location: t.location || "Lugar",
                    raceWithoutName: t.raceWithoutName || "Sin nombre",
                    unspecifiedLocation: t.unspecifiedLocation || "No especificado",
                    unspecifiedCategory: t.unspecifiedCategory || "No especificada",
                    noDataToExport: t.noDataToExport || "No hay datos para exportar",
                    pause: "Pausar",
                    resume: "Reanudar",
                    restart: "Reiniciar",
                    page: t.page || "Página",
                    of: t.of || "de",
                    scrollAuto: "Scroll automático",
                    scrollPaused: "Scroll pausado",
                    scrollRestarted: "Scroll reiniciado",
                    moreRidersText: "Más clasificados aparecerán aquí...",
                    closeScreen: "Cerrar pantalla"
                }
            };
            
            if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
                try {
                    window.externalScreenWindow.postMessage(data, '*');
                    console.log("✅ Datos enviados a pantalla externa");
                } catch (error) {
                    console.error("❌ Error enviando datos a pantalla externa:", error);
                }
            } else {
                console.log("⚠️ Pantalla externa no está disponible o cerrada");
            }
        }
        
        // ⭐ NUEVO: MANEJAR CIERRE DESDE PANTALLA EXTERNA (MÓVIL)
        if (event.data.type === 'closeExternalScreen') {
            console.log("📱 Cierre solicitado desde pantalla externa (móvil)");
            
            if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
                try {
                    window.externalScreenWindow.close();
                    console.log("✅ Pantalla externa cerrada desde móvil");
                } catch (error) {
                    console.error("❌ Error cerrando pantalla externa:", error);
                }
                
                window.externalScreenWindow = null;
                updateExternalScreenButtonText(false);
                showMessage("Pantalla externa cerrada desde móvil", 'info');
            }
        }
    });
    
    // 2. INTERCEPTAR GUARDADO DE LLEGADAS PARA ACTUALIZACIÓN AUTOMÁTICA
    const originalSave = saveLlegadasState;
    if (typeof originalSave === 'function') {
        window.saveLlegadasState = function() {
            console.log("🔄 Guardando llegadas y actualizando pantalla externa...");
            const result = originalSave();
            
            // ACTUALIZAR PANTALLA EXTERNA SI ESTÁ ABIERTA
            if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
                setTimeout(() => {
                    try {
                        const requestedLanguage = appState.currentLanguage || 'es';
                        const posicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
                        const t = translations[requestedLanguage] || translations.es;
                        
                        const data = {
                            type: 'updateExternalScreenData',
                            llegadas: llegadasState.llegadas,
                            raceName: appState.currentRace ? appState.currentRace.name : null,
                            posicionesPorCategoria: posicionesPorCategoria,
                            language: requestedLanguage,
                            translations: {
                                position: t.position || "Pos",
                                bibNumber: t.bibNumber || "Dorsal",
                                name: t.name || "Nombre",
                                surname: t.surname || "Apellidos",
                                posCat: t.posCatHeader || "Pos. Cat.",
                                category: t.category || "Categoría",
                                team: t.team || "Equipo",
                                timeFinal: t.timeFinal || "Tiempo Final",
                                difference: t.difference || "Diferencia",
                                classification: t.classification || "Clasificación",
                                totalRiders: t.totalRiders || "Total",
                                date: t.date || "Fecha",
                                location: t.location || "Lugar",
                                raceWithoutName: t.raceWithoutName || "Sin nombre",
                                unspecifiedLocation: t.unspecifiedLocation || "No especificado",
                                unspecifiedCategory: t.unspecifiedCategory || "No especificada",
                                noDataToExport: t.noDataToExport || "No hay datos para exportar",
                                pause: "Pausar",
                                resume: "Reanudar",
                                restart: "Reiniciar",
                                page: t.page || "Página",
                                of: t.of || "de",
                                scrollAuto: "Scroll automático",
                                scrollPaused: "Scroll pausado",
                                scrollRestarted: "Scroll reiniciado",
                                moreRidersText: "Más clasificados aparecerán aquí...",
                                closeScreen: "Cerrar pantalla"
                            }
                        };
                        
                        window.externalScreenWindow.postMessage(data, '*');
                        console.log("✅ Pantalla externa actualizada automáticamente");
                    } catch (error) {
                        console.error("❌ Error actualizando pantalla externa automáticamente:", error);
                    }
                }, 300); // Pequeño delay para asegurar que los datos están guardados
            }
            
            return result;
        };
        
        console.log("✅ saveLlegadasState interceptado para actualización automática");
    } else {
        console.warn("⚠️ saveLlegadasState no encontrada, actualización automática no disponible");
    }
    
    // 3. INTERCEPTAR CAMBIOS DE CARRERA
    const originalHandleRaceChange = handleRaceChange;
    if (typeof originalHandleRaceChange === 'function') {
        window.handleRaceChange = function(raceId) {
            console.log("🏁 Cambiando carrera y actualizando pantalla externa...");
            const result = originalHandleRaceChange(raceId);
            
            // ACTUALIZAR PANTALLA EXTERNA SI ESTÁ ABIERTA
            if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
                setTimeout(() => {
                    try {
                        const requestedLanguage = appState.currentLanguage || 'es';
                        const posicionesPorCategoria = calcularPosicionesPorCategoria(llegadasState.llegadas);
                        const t = translations[requestedLanguage] || translations.es;
                        
                        const data = {
                            type: 'updateExternalScreenData',
                            llegadas: llegadasState.llegadas,
                            raceName: appState.currentRace ? appState.currentRace.name : null,
                            posicionesPorCategoria: posicionesPorCategoria,
                            language: requestedLanguage,
                            translations: {
                                position: t.position || "Pos",
                                bibNumber: t.bibNumber || "Dorsal",
                                name: t.name || "Nombre",
                                surname: t.surname || "Apellidos",
                                posCat: t.posCatHeader || "Pos. Cat.",
                                category: t.category || "Categoría",
                                team: t.team || "Equipo",
                                timeFinal: t.timeFinal || "Tiempo Final",
                                difference: t.difference || "Diferencia",
                                classification: t.classification || "Clasificación",
                                totalRiders: t.totalRiders || "Total",
                                date: t.date || "Fecha",
                                location: t.location || "Lugar",
                                raceWithoutName: t.raceWithoutName || "Sin nombre",
                                unspecifiedLocation: t.unspecifiedLocation || "No especificado",
                                unspecifiedCategory: t.unspecifiedCategory || "No especificada",
                                noDataToExport: t.noDataToExport || "No hay datos para exportar",
                                pause: "Pausar",
                                resume: "Reanudar",
                                restart: "Reiniciar",
                                page: t.page || "Página",
                                of: t.of || "de",
                                scrollAuto: "Scroll automático",
                                scrollPaused: "Scroll pausado",
                                scrollRestarted: "Scroll reiniciado",
                                moreRidersText: "Más clasificados aparecerán aquí...",
                                closeScreen: "Cerrar pantalla"
                            }
                        };
                        
                        window.externalScreenWindow.postMessage(data, '*');
                        console.log("✅ Pantalla externa actualizada por cambio de carrera");
                    } catch (error) {
                        console.error("❌ Error actualizando pantalla externa por cambio de carrera:", error);
                    }
                }, 500);
            }
            
            return result;
        };
        
        console.log("✅ handleRaceChange interceptado para actualización automática");
    }
    
    // 4. DETECTOR DE CIERRE DE VENTANA
    function setupWindowCloseDetector() {
        if (window.externalScreenWindow) {
            const checkWindowClosed = setInterval(() => {
                if (window.externalScreenWindow && window.externalScreenWindow.closed) {
                    console.log("⚠️ Pantalla externa cerrada por el usuario");
                    clearInterval(checkWindowClosed);
                    window.externalScreenWindow = null;
                    updateExternalScreenButtonText(false);
                    showMessage("Pantalla externa cerrada", 'info');
                }
            }, 1000);
            
            console.log("✅ Detector de cierre de ventana configurado");
        }
    }
    
    // 5. ACTUALIZAR BOTÓN DE PANTALLA EXTERNA
    function updateExternalScreenButtonText(isActive) {
        try {
            const externalScreenBtn = document.getElementById('external-screen-btn');
            if (externalScreenBtn) {
                const t = translations[appState.currentLanguage] || translations.es;
                
                if (isActive) {
                    externalScreenBtn.innerHTML = '<i class="fas fa-times"></i> ' + (t.closeExternalScreen || "Cerrar Pantalla");
                    externalScreenBtn.classList.add('active');
                    externalScreenBtn.classList.remove('btn-primary');
                    externalScreenBtn.classList.add('btn-warning');
                } else {
                    externalScreenBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> ' + (t.externalScreen || "Pantalla Externa");
                    externalScreenBtn.classList.remove('active');
                    externalScreenBtn.classList.remove('btn-warning');
                    externalScreenBtn.classList.add('btn-primary');
                }
                
                console.log("✅ Botón de pantalla externa actualizado:", isActive ? "ACTIVO" : "INACTIVO");
            }
        } catch (error) {
            console.error("❌ Error actualizando botón de pantalla externa:", error);
        }
    }
    
    // 6. FUNCIÓN PARA ENVIAR CIERRE A PANTALLA EXTERNA
    function sendCloseToExternalScreen() {
        if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
            try {
                window.externalScreenWindow.postMessage({
                    type: 'closeExternalScreen'
                }, '*');
                console.log("✅ Señal de cierre enviada a pantalla externa");
            } catch (error) {
                console.error("❌ Error enviando señal de cierre:", error);
            }
        }
    }
    
    // 7. EXPORTAR FUNCIONES PARA USO EXTERNO
    window.setupExternalScreenCommunication = setupExternalScreenCommunication;
    window.updateExternalScreenButtonText = updateExternalScreenButtonText;
    window.setupWindowCloseDetector = setupWindowCloseDetector;
    window.sendCloseToExternalScreen = sendCloseToExternalScreen;
    
    console.log("✅ Comunicación con pantalla externa configurada completamente");
    
    // Devolver funciones para uso externo si es necesario
    return {
        updateExternalScreenButtonText,
        setupWindowCloseDetector,
        sendCloseToExternalScreen
    };
}

// 7. CONFIGURACIÓN DEL SISTEMA (SIMPLIFICADA)
function setupExternalScreenSystem() {
    const btn = document.getElementById('external-screen-btn');
    if (btn) {
        btn.addEventListener('click', showExternalScreen);
        updateExternalScreenButtonText(false);
        console.log("✅ Sistema de pantalla externa configurado");
    }
    
    updateExternalScreenButton();
}

// 8. INTEGRAR CON LLEGADAS (MANTENER)
const originalInitLlegadasMode = initLlegadasMode;
window.initLlegadasMode = function() {
    originalInitLlegadasMode();
    setupExternalScreenSystem();
    console.log("✅ Sistema de pantalla externa inicializado");
};

// 9. CERRAR PANTALLA (OPCIONAL)
function closeExternalScreen() {
    if (window.externalScreenWindow && !window.externalScreenWindow.closed) {
        window.externalScreenWindow.close();
        window.externalScreenWindow = null;
    }
    
    updateExternalScreenButtonText(false);
    
    if (externalScreenCloseDetector) {
        clearInterval(externalScreenCloseDetector);
        externalScreenCloseDetector = null;
    }
}

// ============================================
// ACTUALIZAR CONTADOR DE LLEGADAS - NUEVO 3.5.4.1 (VERSIÓN CORREGIDA)
// ============================================
function actualizarContadorLlegadas() {
    try {
        const counterElement = document.getElementById('llegadas-list-counter');
        if (!counterElement) {
            console.log("⚠️ Elemento llegadas-list-counter no encontrado");
            return;
        }
        
        // 1. Calcular llegadas con tiempo válido
        const llegadasConTiempo = llegadasState.llegadas.filter(l => 
            l.dorsal && l.tiempoFinalWithMs && l.tiempoFinalWithMs > 0);
        const x = llegadasConTiempo.length;
        
        // 2. Obtener total de corredores en orden de salida
        let y = 0;
        if (typeof startOrderData !== 'undefined' && Array.isArray(startOrderData)) {
            y = startOrderData.length;
        } else {
            // Intentar obtener de otra manera
            const currentRace = appState.currentRace;
            if (currentRace && currentRace.startOrder && Array.isArray(currentRace.startOrder)) {
                y = currentRace.startOrder.length;
            } else if (appState.races && appState.races.length > 0) {
                // Buscar en todas las carreras
                const race = appState.races.find(r => r.id === appState.currentRace.id);
                if (race && race.startOrder) {
                    y = race.startOrder.length;
                }
            }
        }
        
        // 3. Obtener traducciones
        const t = translations[appState.currentLanguage];
        const template = t.llegadasCounterTemplate || "{x} de {y} Corredores";
        
        // 4. Formatear contador
        const contador = template.replace('{x}', x).replace('{y}', y);
        
        // 5. Actualizar elemento
        counterElement.textContent = `- ${contador}`;
        
        console.log(`📊 Contador actualizado: ${x} de ${y} corredores`);
        
    } catch (error) {
        console.error("❌ Error actualizando contador de llegadas:", error);
    }
    
    // También actualizar próximos dorsales
    updateNextDorsalsInfo();
}

// ============================================
// ⭐ NUEVO: SISTEMA DE ENTRADA MANUAL DE TIEMPOS
// ============================================

/**
 * Configura el botón de entrada manual en la interfaz
 * Se debe llamar desde initLlegadasMode()
 */
function setupManualEntryButton() {
    console.log("🔧 Configurando botón Entrada Manual...");
    
    const manualEntryBtn = document.getElementById('manualEntryBtn');
    if (!manualEntryBtn) {
        console.warn("⚠️ Botón Entrada Manual no encontrado en el DOM");
        return;
    }
    
    // Usar clonación para evitar listeners duplicados
    const newBtn = manualEntryBtn.cloneNode(true);
    manualEntryBtn.parentNode.replaceChild(newBtn, manualEntryBtn);
    
    // Configurar tooltip
    const t = translations[appState.currentLanguage];
    newBtn.title = t.manualEntryTitle || "Registrar tiempo manualmente";
    
    // Configurar event listener
    newBtn.addEventListener('click', function(e) {
        console.log("🎯 CLICK en botón Entrada Manual");
        e.preventDefault();
        e.stopPropagation();
        openManualEntryModal();
    });
    
    // Añadir estilo visual para confirmar configuración
    newBtn.style.outline = '2px solid #28a745';
    newBtn.style.boxShadow = '0 0 5px rgba(40, 167, 69, 0.5)';
    
    console.log("✅ Botón Entrada Manual configurado (clonación segura)");
}

/**
 * Abre el modal para entrada manual de tiempo
 * Solo pide el tiempo (HH:MM:SS.mmm), el dorsal queda vacío
 */
function openManualEntryModal() {
    console.log("📋 Abriendo modal de entrada manual");
    
    const t = translations[appState.currentLanguage];
    
    // Crear modal HTML con las CLASES CORRECTAS que usa CRI
    const modalHTML = `
        <div class="modal show fade" id="manual-entry-modal" style="display: flex; background-color: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-keyboard"></i> 
                            ${t.manualEntryModalTitle || "Entrada Manual de Tiempo"}
                        </h5>
                        <button type="button" class="btn-close" id="close-manual-modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>${t.manualEntryDescription || "Introduce manualmente un tiempo de llegada."}</p>
                        
                        <div class="mb-3">
                            <label for="manual-time" class="form-label">
                                ${t.manualEntryTimeLabel || "Tiempo de llegada (HH:MM:SS.mmm):"}
                            </label>
                            <input type="text" id="manual-time" class="form-control" 
                                   placeholder="${t.manualEntryTimePlaceholder || 'Ej: 01:23:45.678'}" 
                                   required autofocus>
                            <div class="form-text">
                                <i class="fas fa-info-circle"></i> 
                                ${t.manualEntryFormatInfo || "Formato: horas:minutos:segundos.milésimas"}
                            </div>
                        </div>
                        
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-lightbulb"></i> 
                            ${t.manualEntryTip || "Ejemplos: 00:45:23.123, 1:30:45.678, 02:15:30.000"}
                            <br>
                            <i class="fas fa-edit"></i> 
                            ${t.manualEntryDorsalNote || "El dorsal se asignará después editando la fila en la tabla."}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-manual-entry">
                            ${t.manualEntryCancelBtn || "Cancelar"}
                        </button>
                        <button type="button" class="btn btn-primary" id="save-manual-entry">
                            <i class="fas fa-save"></i> 
                            ${t.manualEntrySaveBtn || "Guardar Tiempo"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Añadir modal al DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos
    const modal = document.getElementById('manual-entry-modal');
    const closeBtn = document.getElementById('close-manual-modal');
    const cancelBtn = document.getElementById('cancel-manual-entry');
    const saveBtn = document.getElementById('save-manual-entry');
    const timeInput = document.getElementById('manual-time');
    
    // Función para cerrar modal
    function closeModal() {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    
    // Event listeners para cerrar
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    // Event listener para guardar
    saveBtn.addEventListener('click', function() {
        saveManualEntry(timeInput.value);
        closeModal(); // ✅ cerrar modal al guardar
    });
    
    // Permitir Enter para guardar
    timeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') saveManualEntry(timeInput.value);
    });
    
    // Prevenir que Enter en el input submit el formulario (si existe)
    timeInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveManualEntry(timeInput.value);
        }
    });
    
    console.log("📋 Modal de entrada manual creado con estilos CRI");
}

/**
 * Guarda una entrada manual de tiempo en la tabla de llegadas - VERSIÓN DEFINITIVA
 * @param {string} timeString - Tiempo en formato HH:MM:SS.mmm (CRONO de llegada)
 */
function saveManualEntry(timeString) {

    const segundos = timeStringToSecondsWithMilliseconds(timeString);

    const llegada = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),

        dorsal: null,
        nombre: '',
        apellidos: '',
        chip: '',

        categoria: '',
        equipo: '',
        licencia: '',

        horaSalida: '',
        cronoSalida: '',
        cronoSalidaSegundos: 0,

        // ✅ AQUÍ ESTÁ LA CLAVE
        cronoLlegadaWithMs: segundos,   // ← tiempo introducido
        tiempoFinalWithMs: 0,            // ← se calculará después

        horaLlegada: '--:--:--',

        notas: 'Entrada manual',
        capturadoEn: 'manual',
        pendiente: true
    };

    llegadasState.llegadas.unshift(llegada);

    saveLlegadasState();
    renderLlegadasList();
    actualizarContadorLlegadas();

    showMessage('✅ Tiempo guardado correctamente', 'success');
}


// Calcular y mostrar próximos dorsales (VERSIÓN CORREGIDA)
function updateNextDorsalsInfo() {
    const t = translations[appState.currentLanguage] || translations.es;
    
    // Verificar que los elementos DOM existen
    const lastDorsalElement = document.getElementById('last-dorsal-text');
    const nextDorsalsElement = document.getElementById('next-dorsals-text');
    const infoElement = document.getElementById('next-dorsals-info');
    
    if (!lastDorsalElement || !nextDorsalsElement) {
        console.warn("❌ Elementos DOM para próximos dorsales no encontrados");
        return;
    }
    
    // Obtener todos los dorsales que YA han llegado
    const arrivedDorsals = new Set();
    if (llegadasState && llegadasState.llegadas) {
        llegadasState.llegadas.forEach(llegada => {
            if (llegada.dorsal && llegada.tiempoFinalWithMs > 0) {
                arrivedDorsals.add(parseInt(llegada.dorsal));
            }
        });
    }
    
    // Encontrar el último dorsal llegado (el mayor número)
    let lastDorsal = null;
    if (arrivedDorsals.size > 0) {
        lastDorsal = Math.max(...arrivedDorsals);
    }
    
    // Obtener el orden de salida actual
    const startOrder = appState.currentRace?.startOrder || [];
    if (startOrder.length === 0) {
        // Si no hay orden de salida, mostrar información básica
        lastDorsalElement.textContent = 
            `${t.lastDorsalLabel || "Último"}: ${lastDorsal || (t.noDorsalsArrived || "Sin llegadas")}`;
        nextDorsalsElement.textContent = 
            `${t.nextDorsalsLabel || "Próximos"}: ${t.nextDorsalsNone || "ninguno"}`;
        return;
    }
    
    // Encontrar posición del último dorsal en el orden de salida
    let lastDorsalIndex = -1;
    if (lastDorsal !== null) {
        lastDorsalIndex = startOrder.findIndex(corredor => {
            if (!corredor || !corredor.dorsal) return false;
            return parseInt(corredor.dorsal) === lastDorsal;
        });
    }
    
    // Determinar los próximos 3 dorsales
    const nextDorsals = [];
    const nextStartIndex = lastDorsalIndex + 1;
    
    // Tomar hasta 3 dorsales después del último llegado
    for (let i = 0; i < 3; i++) {
        const index = nextStartIndex + i;
        if (index < startOrder.length) {
            const corredor = startOrder[index];
            if (corredor && corredor.dorsal) {
                // Verificar que este dorsal no haya llegado ya
                const dorsalNum = parseInt(corredor.dorsal);
                if (!arrivedDorsals.has(dorsalNum)) {
                    nextDorsals.push(corredor.dorsal);
                }
            }
        }
    }
    
    // Formatear texto del último dorsal
    const lastDorsalText = lastDorsal !== null ? 
        `${t.lastDorsalLabel || "Último"}: ${lastDorsal}` : 
        `${t.lastDorsalLabel || "Último"}: ${t.noDorsalsArrived || "Sin llegadas"}`;
    
    // Formatear texto de próximos dorsales con validación segura
    let nextDorsalsText = `${t.nextDorsalsLabel || "Próximos"}: `;
    
    if (nextDorsals.length === 0) {
        nextDorsalsText += t.nextDorsalsNone || "ninguno";
    } else if (nextDorsals.length === 1) {
        const format = t.nextDorsalsOneFormat || "{d1}";
        nextDorsalsText += format.replace('{d1}', nextDorsals[0]);
    } else if (nextDorsals.length === 2) {
        const format = t.nextDorsalsTwoFormat || "{d1} y {d2}";
        nextDorsalsText += format
            .replace('{d1}', nextDorsals[0])
            .replace('{d2}', nextDorsals[1]);
    } else {
        const format = t.nextDorsalsFormat || "{d1}, {d2} y {d3}";
        nextDorsalsText += format
            .replace('{d1}', nextDorsals[0])
            .replace('{d2}', nextDorsals[1])
            .replace('{d3}', nextDorsals[2]);
    }
    
    // Actualizar el DOM
    lastDorsalElement.textContent = lastDorsalText;
    nextDorsalsElement.textContent = nextDorsalsText;
    
    // Añadir tooltip informativo
    if (infoElement) {
        infoElement.title = (t.lastDorsalLabel || "Último") + ': ' + (lastDorsal || (t.noDorsalsArrived || "Sin llegadas")) + 
                          ' | ' + (t.nextDorsalsLabel || "Próximos") + ': ' + nextDorsals.join(', ');
    }
    
    console.log(`📊 Próximos dorsales actualizados: Último=${lastDorsal}, Próximos=[${nextDorsals.join(', ')}]`);
}

// ⭐ Función de inicialización para próximos dorsales
// Función segura para inicialización
function setupNextDorsalsIndicator() {
    console.log("🔧 Configurando indicador de próximos dorsales...");
    
    // Verificar que los elementos HTML existen
    setTimeout(() => {
        const lastDorsalElement = document.getElementById('last-dorsal-text');
        const nextDorsalsElement = document.getElementById('next-dorsals-text');
        
        if (!lastDorsalElement || !nextDorsalsElement) {
            console.error("❌ Elementos HTML para próximos dorsales no encontrados");
            console.log("🔍 Buscando elementos con ID:", {
                'last-dorsal-text': document.getElementById('last-dorsal-text'),
                'next-dorsals-text': document.getElementById('next-dorsals-text'),
                'next-dorsals-info': document.getElementById('next-dorsals-info')
            });
            return;
        }
        
        // Llamar inicialmente
        updateNextDorsalsInfo();
        
        console.log("✅ Indicador de próximos dorsales configurado");
    }, 100); // Pequeño delay para asegurar que el DOM está cargado
}

// ⭐ Función para manejar casos especiales de próximos dorsales
function getNextDorsalsWithFallback() {
    const t = translations[appState.currentLanguage];
    
    // Caso 1: No hay orden de salida
    if (!appState.currentRace?.startOrder || appState.currentRace.startOrder.length === 0) {
        return {
            lastDorsal: null,
            nextDorsals: [],
            message: t.noStartOrder || "Sin orden de salida"
        };
    }
    
    // Caso 2: No hay llegadas aún
    const llegadasConTiempo = llegadasState.llegadas.filter(l => l.tiempoFinalWithMs > 0);
    if (llegadasConTiempo.length === 0) {
        // Mostrar los primeros 3 dorsales del orden de salida
        const startOrder = appState.currentRace.startOrder;
        const firstThree = startOrder.slice(0, 3).map(c => c.dorsal).filter(d => d);
        
        return {
            lastDorsal: null,
            nextDorsals: firstThree,
            isFirstOnes: true
        };
    }
    
    // Caso normal: Calcular normalmente
    updateNextDorsalsInfo();
}



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
window.clearLlegadas = clearLlegadas;

console.log("✅ Módulo de llegadas 3.2.1 cargado");