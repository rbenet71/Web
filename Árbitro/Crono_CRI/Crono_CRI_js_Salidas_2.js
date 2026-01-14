// ============================================
// ARCHIVO: Crono_CRI_js_Salidas_2.js
// ============================================
// DESCRIPCIÓN: Sistema de edición y visualización de tabla de orden de salida
// RESPONSABILIDADES:
//   1. Renderizado optimizado de tabla con throttling (evita sobrecarga)
//   2. Sistema de eventos delegados para edición eficiente
//   3. Edición en línea de campos (dorsal, nombre, diferencia, etc.)
//   4. Gestión de diferencia con signos (+) y (-)
//   5. Inputs de tiempo mejorados para móviles
//   6. Ordenación de columnas con indicadores visuales
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - updateStartOrderTable()      - Renderiza tabla principal
//   - handleTableClick()           - Maneja clics para edición
//   - startDiferenciaEditing()     - Edición especial de diferencia
//   - setupTimeInputs()            - Configura inputs de tiempo
// 
// VARIABLES GLOBALES PROPIAS:
//   - startOrderData[]             - Datos de corredores
//   - startOrderSortState{}        - Estado de ordenación
//   - updateStartOrderTableTimeout - Control de throttling
// 
// OPTIMIZACIONES:
//   ✓ Throttling con updateStartOrderTableThrottled()
//   ✓ Event delegation para evitar múltiples listeners
//   ✓ Validación en tiempo real de formatos
// 
// ARCHIVOS RELACIONADOS:
//   ← Salidas_1.js: Recibe datos de processImportedOrderData()
//   → Salidas_3.js: Llama a updateStartOrderUI()
//   → Salidas_4.js: Llama a guardarDiferencia()
// ============================================

function updateStartOrderTable() {
    // Control de logs - activar solo en desarrollo
    const DEBUG_MODE = false;
    
    if (DEBUG_MODE) {
        console.log("=== updateStartOrderTable llamada ===");
    }
    
    const tableWrapper = document.querySelector('.table-scroll-wrapper');
    const tableBody = document.getElementById('start-order-table-body');
    const emptyState = document.getElementById('start-order-empty');
    
    if (!tableBody || !emptyState) {
        console.error("Elementos de tabla no encontrados!");
        return;
    }
    
    if (startOrderData.length === 0) {
        if (DEBUG_MODE) console.log("No hay datos, mostrando estado vacío");
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        if (tableWrapper) tableWrapper.style.display = 'none';
        return;
    }
    
    if (DEBUG_MODE) {
        console.log(`Hay ${startOrderData.length} corredores para mostrar`);
    }
    
    emptyState.style.display = 'none';
    if (tableWrapper) tableWrapper.style.display = 'block';
    
    // Ordenar datos según el estado de ordenación
    const sortedData = sortStartOrderData([...startOrderData]);
    
    let html = '';
    let processedRiders = 0;
    let errorsCount = 0;
    
    // Procesar todos los corredores
    sortedData.forEach((rider, index) => {
        processedRiders++;
        
        // Determinar si es el primer corredor
        const isFirstRider = rider.order === 1;
        
        // Calcular diferencia (si hay datos reales y previstos O si hay diferencia importada)
        let diferenciaHtml = '';
        let diferenciaClass = 'cero';
        let diferenciaValue = '';
        let diferenciaSign = '';
        let isDiferenciaEditable = !isFirstRider; // No editable para primer corredor
        
        // Primero verificar si hay diferencia importada o calculada
        if (rider.diferencia && rider.diferencia !== '') {
            // Ya tiene diferencia asignada (puede ser '00:00:00')
            let valorLimpio = rider.diferencia;
            
            if (rider.diferencia.includes('(+)')) {
                diferenciaClass = 'positiva';
                diferenciaSign = '';
                valorLimpio = rider.diferencia.replace('(+)', '').trim();
            } else if (rider.diferencia.includes('(-)')) {
                diferenciaClass = 'negativa';
                diferenciaSign = '';
                valorLimpio = rider.diferencia.replace('(-)', '').trim();
            } else if (rider.diferencia.includes('+')) {
                diferenciaClass = 'positiva';
                diferenciaSign = '';
                valorLimpio = rider.diferencia.replace('+', '').trim();
            } else if (rider.diferencia.includes('-')) {
                diferenciaClass = 'negativa';
                diferenciaSign = '';
                valorLimpio = rider.diferencia.replace('-', '').trim();
            } else if (rider.diferencia === '00:00:00') {
                diferenciaClass = 'cero';
                diferenciaSign = '';
            }
            
            diferenciaValue = valorLimpio;
            diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${valorLimpio}${diferenciaSign}</span>`;
            
            // Si no es el primer corredor, hacer editable
            if (!isFirstRider) {
                isDiferenciaEditable = true;
            }
        } else {
            // Calcular diferencia (si hay datos reales y previstos)
            const horaRealSegundos = rider.horaSalidaRealSegundos || timeToSeconds(rider.horaSalidaReal) || 0;
            const horaPrevistaSegundos = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
            
            // CASO ESPECIAL: Para el segundo corredor cuando se añade uno en primera posición
            if (rider.order === 2 && startOrderData.length > 1) {
                const primerCorredor = startOrderData.find(r => r.order === 1);
                
                // Si el corredor no tiene diferencia, asignar una por defecto
                if ((!rider.diferencia || rider.diferencia === '' || rider.diferencia === '00:00:00' || rider.diferencia.includes('--:--:--')) && 
                    primerCorredor && primerCorredor.diferencia === '00:00:00') {
                    
                    // Asignar diferencia por defecto para el segundo corredor
                    diferenciaValue = '00:01:00';
                    diferenciaSign = ' (+)';
                    diferenciaClass = 'positiva';
                    diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                    
                    // Actualizar los datos del corredor
                    rider.diferencia = diferenciaValue + diferenciaSign;
                    rider.diferenciaSegundos = 60;
                    isDiferenciaEditable = true;
                    
                    if (DEBUG_MODE) {
                        console.log('Segundo corredor - Diferencia establecida por defecto:', rider.diferencia);
                    }
                } else if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
                    // Calcular diferencia real
                    const diferencia = horaRealSegundos - horaPrevistaSegundos;
                    if (diferencia !== 0) {
                        const diferenciaAbs = Math.abs(diferencia);
                        diferenciaSign = diferencia > 0 ? ' (+)' : ' (-)';
                        diferenciaClass = diferencia > 0 ? 'positiva' : 'negativa';
                        diferenciaValue = secondsToTime(diferenciaAbs);
                        diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                        isDiferenciaEditable = true;
                    } else {
                        diferenciaValue = '00:00:00';
                        diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                        if (isFirstRider) {
                            isDiferenciaEditable = false;
                        }
                    }
                } else {
                    diferenciaHtml = `<span class="diferencia vacia editable" data-value="">--:--:--</span>`;
                    isDiferenciaEditable = true;
                }
            } else if (horaRealSegundos > 0 && horaPrevistaSegundos > 0) {
                const diferencia = horaRealSegundos - horaPrevistaSegundos;
                if (diferencia !== 0) {
                    const diferenciaAbs = Math.abs(diferencia);
                    diferenciaSign = diferencia > 0 ? ' (+)' : ' (-)';
                    diferenciaClass = diferencia > 0 ? 'positiva' : 'negativa';
                    diferenciaValue = secondsToTime(diferenciaAbs);
                    diferenciaHtml = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaValue}">${diferenciaValue}${diferenciaSign}</span>`;
                    isDiferenciaEditable = true;
                } else {
                    diferenciaValue = '00:00:00';
                    diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                    if (isFirstRider) {
                        isDiferenciaEditable = false;
                    }
                }
            } else {
                if (isFirstRider) {
                    // Primer corredor - siempre 00:00:00
                    diferenciaValue = '00:00:00';
                    diferenciaHtml = `<span class="diferencia cero" data-value="00:00:00">00:00:00</span>`;
                    isDiferenciaEditable = false;
                } else {
                    // Otro corredor sin datos - mostrar vacío y editable
                    diferenciaHtml = `<span class="diferencia vacia editable" data-value="">--:--:--</span>`;
                    isDiferenciaEditable = true;
                }
            }
        }
        
        // Verificar datos críticos (solo en debug)
        if (DEBUG_MODE && (!rider.horaSalida || !rider.cronoSalida)) {
            console.warn(`Corredor ${index + 1} (dorsal ${rider.dorsal}) tiene datos incompletos:`, {
                horaSalida: rider.horaSalida,
                cronoSalida: rider.cronoSalida
            });
            errorsCount++;
        }
        
        // Formatear campos importados - si están vacíos, mostrar vacío
        const horaImportadoDisplay = rider.horaSalidaImportado || '';
        const cronoImportadoDisplay = rider.cronoSalidaImportado || '';
        
        // Generar HTML de la fila con campos editables/no editables
        html += `
        <tr data-index="${getOriginalIndex(rider.order, rider.dorsal)}">
            <!-- ORDEN - NO EDITABLE -->
            <td class="number-cell not-editable" data-field="order">${rider.order || ''}</td>
            
            <!-- DORSAL - EDITABLE -->
            <td class="number-cell editable" data-field="dorsal">${rider.dorsal || ''}</td>
            
            <!-- CRONO SALIDA - NO EDITABLE -->
            <td class="time-cell sortable not-editable" data-sort="cronoSalida">${rider.cronoSalida || '00:00:00'}</td>
            
            <!-- HORA SALIDA - NO EDITABLE -->
            <td class="time-cell sortable not-editable" data-sort="horaSalida">${rider.horaSalida || '00:00:00'}</td>
            
            <!-- DIFERENCIA - EDITABLE (excepto primer corredor) -->
            <td class="diferencia-cell sortable ${isDiferenciaEditable ? 'editable' : 'not-editable'}" 
                data-field="diferencia" 
                data-sort="diferencia"
                data-is-first="${isFirstRider}"
                data-original-value="${diferenciaValue}">
                ${diferenciaHtml}
            </td>
            
            <!-- NOMBRE - EDITABLE -->
            <td class="name-cell editable" data-field="nombre">${escapeHtml(rider.nombre || '')}</td>
            
            <!-- APELLIDOS - EDITABLE -->
            <td class="name-cell editable" data-field="apellidos">${escapeHtml(rider.apellidos || '')}</td>
            
            <!-- CATEGORÍA - EDITABLE - NUEVO -->
            <td class="editable" data-field="categoria">${escapeHtml(rider.categoria || '')}</td>

            <!-- EQUIPO - EDITABLE - NUEVO -->
            <td class="editable" data-field="equipo">${escapeHtml(rider.equipo || '')}</td>

            <!-- LICENCIA - EDITABLE - NUEVO -->
            <td class="editable" data-field="licencia">${escapeHtml(rider.licencia || '')}</td>
            
            <!-- CHIP - EDITABLE -->
            <td class="editable" data-field="chip">${escapeHtml(rider.chip || '')}</td>
            
            <!-- RESTANTE DE CAMPOS - NO EDITABLES -->
            <td class="time-cell not-editable">${rider.horaSalidaReal || ''}</td>
            <td class="time-cell not-editable">${rider.cronoSalidaReal || ''}</td>
            <td class="time-cell sortable not-editable" data-sort="horaSalidaPrevista">${rider.horaSalidaPrevista || rider.horaSalida || '00:00:00'}</td>
            <td class="time-cell sortable not-editable" data-sort="cronoSalidaPrevista">${rider.cronoSalidaPrevista || rider.cronoSalida || '00:00:00'}</td>
            
            <!-- CAMPOS IMPORTADOS - SIEMPRE VACÍOS PARA NUEVOS CORREDORES -->
            <td class="time-cell not-editable importado-cell">
                ${horaImportadoDisplay}
            </td>
            <td class="time-cell not-editable importado-cell">
                ${cronoImportadoDisplay}
            </td>
            
            <td class="number-cell sortable not-editable" data-sort="cronoSegundos">${rider.cronoSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="horaSegundos">${rider.horaSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="cronoSalidaRealSegundos">${rider.cronoSalidaRealSegundos || 0}</td>
            <td class="number-cell sortable not-editable" data-sort="horaSalidaRealSegundos">${rider.horaSalidaRealSegundos || 0}</td>
        </tr>
        `;
    });
    
    // Insertar HTML (forma más eficiente)
    if (html) {
        tableBody.innerHTML = html;
        
        // Usar event delegation en lugar de listeners individuales
        setupEventDelegation();
        
        // Actualizar indicadores de ordenación
        updateStartOrderSortIndicators();
        
        // Añadir estilos de filas alternas
        addAlternatingRowStyles();
        
        // Añadir estilos para celdas importadas vacías
        addImportadoCellStyles();
    }
    
    if (DEBUG_MODE) {
        console.log("=== updateStartOrderTable completada ===");
        console.log(`Procesados: ${processedRiders} corredores`);
        console.log(`Errores: ${errorsCount}`);
        console.log(`Celdas en tabla: ${tableBody.children.length}`);
    }
}

// Función auxiliar para añadir estilos a celdas importadas
function addImportadoCellStyles() {
    // Verificar si ya existen los estilos
    if (document.getElementById('importado-cell-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'importado-cell-styles';
    style.textContent = `
        .importado-cell {
            font-style: italic;
            color: #adb5bd;
        }
        
        .importado-cell:empty::before {
            content: "--";
            color: #adb5bd;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// VARIABLES GLOBALES PARA THROTTLING
// ============================================

// Variables para throttling de updateStartOrderTable
let updateStartOrderTablePending = false;
let updateStartOrderTableTimeout = null;
let lastUpdateTime = 0; // <-- AÑADIR ESTA LÍNEA

// 🔴 NUEVAS VARIABLES PARA PROTECCIÓN
let updateStartOrderTableExecuting = false;  // Evita ejecuciones simultáneas
let lastForceUpdateTime = 0;                // Controla updates forzados
const MIN_FORCE_UPDATE_INTERVAL = 100;      // Mínimo 100ms entre updates forzados

const UPDATE_THROTTLE_DELAY = 50; // 50ms mínimo entre actualizaciones

// ============================================
// VERSIÓN THROTTLED DE updateStartOrderTable
// ============================================
// ============================================
// VERSIÓN THROTTLED MEJORADA DE updateStartOrderTable
// ============================================
function updateStartOrderTableThrottled(force = false) {
    const now = Date.now();
    
    // 🔴 PROTECCIÓN 1: Evitar ejecuciones simultáneas
    if (updateStartOrderTableExecuting) {
        console.warn("⚠️ updateStartOrderTable ya está ejecutándose, omitiendo llamada duplicada");
        
        // Si es forzado y está ejecutando, programar para después
        if (force) {
            console.log("⚠️ Forzado mientras se ejecuta, programando nueva ejecución");
            setTimeout(() => {
                updateStartOrderTableThrottled(true);
            }, UPDATE_THROTTLE_DELAY);
        }
        return;
    }
    
    // 🔴 PROTECCIÓN 2: Controlar updates forzados muy frecuentes
    if (force) {
        const timeSinceLastForceUpdate = now - lastForceUpdateTime;
        if (timeSinceLastForceUpdate < MIN_FORCE_UPDATE_INTERVAL) {
            console.warn(`⚠️ Updates forzados demasiado frecuentes (${timeSinceLastForceUpdate}ms), posponiendo...`);
            
            // Posponer este update forzado
            setTimeout(() => {
                updateStartOrderTableThrottled(true);
            }, MIN_FORCE_UPDATE_INTERVAL - timeSinceLastForceUpdate);
            return;
        }
        lastForceUpdateTime = now;
    }
    
    const timeSinceLastUpdate = now - lastUpdateTime;
    
    // Si es forzada o ha pasado suficiente tiempo, ejecutar inmediatamente
    if (force || timeSinceLastUpdate > UPDATE_THROTTLE_DELAY || !lastUpdateTime) {
        console.log("updateStartOrderTableThrottled: Ejecución " + (force ? "forzada" : "inmediata"));
        
        // Limpiar timeout anterior si existe
        if (updateStartOrderTableTimeout) {
            clearTimeout(updateStartOrderTableTimeout);
            updateStartOrderTableTimeout = null;
        }
        
        // Resetear estado de pendiente
        updateStartOrderTablePending = false;
        
        // Marcar como ejecutando
        updateStartOrderTableExecuting = true;
        
        // Ejecutar directamente con manejo de errores
        try {
            updateStartOrderTable();
        } catch (error) {
            console.error("❌ Error en updateStartOrderTable:", error);
        } finally {
            // Desmarcar después de un pequeño delay
            setTimeout(() => {
                updateStartOrderTableExecuting = false;
            }, 10);
        }
        
        lastUpdateTime = now;
        return;
    }
    
    // 🔴 PROTECCIÓN 3: Si ya hay una actualización pendiente
    if (updateStartOrderTablePending) {
        console.log("updateStartOrderTableThrottled: Ya hay actualización pendiente");
        
        // Si es forzado y ya hay uno pendiente, reemplazarlo
        if (force && updateStartOrderTableTimeout) {
            console.log("updateStartOrderTableThrottled: Reemplazando update pendiente con uno forzado");
            clearTimeout(updateStartOrderTableTimeout);
            updateStartOrderTableTimeout = null;
            
            // Programar nuevo timeout inmediato
            updateStartOrderTableTimeout = setTimeout(() => {
                executeUpdateStartOrderTable();
            }, 10);
        }
        return;
    }
    
    // Marcar como pendiente
    updateStartOrderTablePending = true;
    console.log("updateStartOrderTableThrottled: Programando ejecución en", UPDATE_THROTTLE_DELAY, "ms");
    
    // Programar la ejecución
    updateStartOrderTableTimeout = setTimeout(() => {
        executeUpdateStartOrderTable();
    }, UPDATE_THROTTLE_DELAY);
}

// ============================================
// FUNCIÓN AUXILIAR PARA EJECUCIÓN CONTROLADA
// ============================================
function executeUpdateStartOrderTable() {
    console.log("updateStartOrderTableThrottled: Ejecutando versión throttled...");
    
    // 🔴 Verificar nuevamente antes de ejecutar
    if (updateStartOrderTableExecuting) {
        console.warn("⚠️ Ya se está ejecutando, cancelando esta llamada");
        updateStartOrderTablePending = false;
        updateStartOrderTableTimeout = null;
        return;
    }
    
    // Marcar como ejecutando
    updateStartOrderTableExecuting = true;
    
    try {
        updateStartOrderTable();
    } catch (error) {
        console.error("❌ Error en updateStartOrderTable throttled:", error);
    } finally {
        // Desmarcar después de un pequeño delay
        setTimeout(() => {
            updateStartOrderTableExecuting = false;
        }, 10);
    }
    
    // Resetear estado
    lastUpdateTime = Date.now();
    updateStartOrderTablePending = false;
    updateStartOrderTableTimeout = null;
}

// ============================================
// FUNCIÓN PARA EJECUCIÓN CRÍTICA
// ============================================

function updateStartOrderTableCritical() {
    console.log("updateStartOrderTable: Ejecución CRÍTICA (inmediata)");
    
    // Cancelar cualquier ejecución pendiente
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    
    // Ejecutar inmediatamente
    updateStartOrderTable();
    lastUpdateTime = Date.now();
    updateStartOrderTablePending = false;
}

// ============================================
// FUNCIÓN DE FUERZA (para casos críticos)
// ============================================

function updateStartOrderTableImmediate() {
    console.log("updateStartOrderTableImmediate: Ejecución inmediata forzada");
    
    // Limpiar timeout si existe
    if (updateStartOrderTableTimeout) {
        clearTimeout(updateStartOrderTableTimeout);
        updateStartOrderTableTimeout = null;
    }
    
    // Resetear estado de throttling
    updateStartOrderTablePending = false;
    lastUpdateTime = 0;
    
    // Ejecutar inmediatamente
    try {
        updateStartOrderTable();
    } catch (error) {
        console.error("Error en updateStartOrderTableImmediate:", error);
        // Intentar de nuevo con un pequeño delay
        setTimeout(() => {
            updateStartOrderTable();
        }, 50);
    }
}

// ===========================================
// FUNCIONES AUXILIARES OPTIMIZADAS
// ===========================================

// Event delegation para manejar clics en celdas editables
function setupEventDelegation() {
    const tableBody = document.getElementById('start-order-table-body');
    if (!tableBody) return;
    
    // Eliminar listeners anteriores para evitar duplicados
    tableBody.removeEventListener('click', handleTableClick);
    
    // Añadir un solo listener para toda la tabla
    tableBody.addEventListener('click', handleTableClick);
}

// Handler único para todos los clics en la tabla
// ============================================
// FUNCIÓN handleTableClick CORREGIDA
// ============================================
function handleTableClick(event) {
    console.log("=== handleTableClick llamada ===");
    console.log("Elemento clicado:", event.target);
    console.log("Clase del elemento:", event.target.className);
    console.log("Tag del elemento:", event.target.tagName);
    
    const t = translations[appState.currentLanguage];
    
    // 1. Verificar si es un clic en un span de diferencia
    const target = event.target;
    
    // Si es un span con clase 'diferencia'
    if (target.classList && target.classList.contains('diferencia')) {
        console.log("Clic en elemento con clase 'diferencia'");
        
        // Obtener la celda padre
        const cell = target.closest('td');
        if (!cell) {
            console.error("No se encontró la celda padre");
            return;
        }
        
        console.log("Celda encontrada:", cell);
        console.log("¿Celda es editable?", cell.classList.contains('editable'));
        
        // Verificar si la celda padre es editable
        if (cell.classList.contains('editable')) {
            console.log("Celda padre es editable, procediendo...");
            
            if (cell.classList.contains('editing')) {
                console.log("Ya está en edición, saliendo");
                return;
            }
            
            const row = cell.closest('tr');
            if (!row) {
                console.error("No se encontró la fila padre");
                return;
            }
            
            const index = parseInt(row.getAttribute('data-index'));
            console.log("Índice del corredor:", index);
            
            const isFirstRider = cell.getAttribute('data-is-first') === 'true';
            console.log("Es primer corredor?", isFirstRider);
            
            // Si es el primer corredor, no permitir edición
            if (isFirstRider) {
                console.log("Primer corredor - no editable");
                showMessage(t.firstRiderNoDifference || 'El primer corredor no puede tener diferencia', 'info');
                return;
            }
            
            // Obtener valor actual
            let currentValue = target.getAttribute('data-value') || '';
            console.log("Valor actual (data-value):", currentValue);
            
            if (currentValue === '--:--:--' || currentValue === '') {
                currentValue = '';
                console.log("Valor limpiado a vacío");
            } else {
                // Limpiar signos si existen
                currentValue = currentValue.replace(/ \([+-]\)/g, '').trim();
                console.log("Valor después de limpiar signos:", currentValue);
            }
            
            // Iniciar edición
            console.log("Iniciando edición con valor:", currentValue);
            startDiferenciaEditing(cell, index, currentValue);
            return;
        }
    }
    
    // 2. Verificar si es un clic en una celda editable
    const cell = event.target.closest('.editable');
    console.log("Celda editable encontrada?", cell);
    
    if (!cell) {
        console.log("No es una celda editable, saliendo");
        return;
    }
    
    console.log("Celda encontrada:", cell);
    console.log("Celda tiene clase editing?", cell.classList.contains('editing'));
    
    if (cell.classList.contains('editing')) {
        console.log("Ya está en edición, saliendo");
        return;
    }
    
    event.stopPropagation();
    
    const field = cell.getAttribute('data-field');
    console.log("Campo de la celda:", field);
    
    const allowedFields = ['dorsal', 'nombre', 'apellidos', 'categoria', 'equipo', 'licencia', 'chip'];
    
    // Solo permitir edición de campos específicos (excluyendo diferencia que ya manejamos)
    if (!allowedFields.includes(field)) {
        console.log("Campo no permitido para edición:", field);
        return;
    }
    
    console.log("Campo permitido, procediendo...");
    
    const row = cell.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));
    console.log("Índice del corredor:", index);
    
    // Comenzar edición normal
    console.log("Iniciando edición normal para campo:", field);
    startCellEditing(cell, index, field);
}


function startCellEditingForDiferencia(cell, index, field, currentValue) {
    const originalValue = cell.innerHTML;
    
    // Crear input para edición
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'cell-edit-input';
    input.placeholder = 'HH:MM:SS';
    input.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
    
    // Guardar contexto de edición
    cell.setAttribute('data-original-value', originalValue);
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    
    // Enfocar y seleccionar
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
    
    // Configurar eventos del input
    input.addEventListener('blur', function() {
        finishCellEditingForDiferencia(cell, index, field, this.value, originalValue);
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishCellEditingForDiferencia(cell, index, field, this.value, originalValue);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelCellEditing(cell, originalValue);
        }
    });
}

// Función para escapar HTML (seguridad)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para evitar múltiples llamadas (throttle)
const UPDATE_THROTTLE_MS = 50; // 50ms mínimo entre actualizaciones


// Función para añadir estilos de filas alternas (si no existe)
function addAlternatingRowStyles() {
    const rows = document.querySelectorAll('#start-order-table-body tr');
    rows.forEach((row, index) => {
        row.classList.remove('even', 'odd');
        if (index % 2 === 0) {
            row.classList.add('even');
        } else {
            row.classList.add('odd');
        }
    });
}

// Función para obtener el índice original
function getOriginalIndex(order, dorsal) {
    if (!startOrderData || startOrderData.length === 0) return 0;
    
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}
// Función auxiliar para obtener el índice original
function getOriginalIndex(order, dorsal) {
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}

// Función para ordenar los datos

// Actualiza la función sortStartOrderData en Crono_CRI_js_Salidas.js
function sortStartOrderData(data) {
    return data.sort((a, b) => {
        let valueA, valueB;
        
        switch(startOrderSortState.column) {
            case 'order':
                valueA = parseInt(a.order) || 0;
                valueB = parseInt(b.order) || 0;
                break;
            case 'dorsal':
                valueA = parseInt(a.dorsal) || 0;
                valueB = parseInt(b.dorsal) || 0;
                break;
            case 'cronoSalida':
                valueA = a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSalida':
                valueA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'diferencia':
                // Calcular diferencia: Hora Real - Hora Prevista
                const horaRealA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                const horaPrevistaA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                const diferenciaA = horaRealA - horaPrevistaA;
                
                const horaRealB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                const horaPrevistaB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                const diferenciaB = horaRealB - horaPrevistaB;
                
                valueA = diferenciaA;
                valueB = diferenciaB;
                break;
            case 'nombre':
                valueA = (a.nombre || '').toLowerCase();
                valueB = (b.nombre || '').toLowerCase();
                break;
            case 'apellidos':
                valueA = (a.apellidos || '').toLowerCase();
                valueB = (b.apellidos || '').toLowerCase();
                break;
            case 'chip':
                valueA = (a.chip || '').toLowerCase();
                valueB = (b.chip || '').toLowerCase();
                break;
            case 'horaSalidaReal':
                valueA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                valueB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                break;
            case 'cronoSalidaReal':
                valueA = a.cronoSalidaRealSegundos || timeToSeconds(a.cronoSalidaReal) || 0;
                valueB = b.cronoSalidaRealSegundos || timeToSeconds(b.cronoSalidaReal) || 0;
                break;
            case 'horaSalidaPrevista':
                valueA = timeToSeconds(a.horaSalidaPrevista) || a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = timeToSeconds(b.horaSalidaPrevista) || b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'cronoSalidaPrevista':
                valueA = timeToSeconds(a.cronoSalidaPrevista) || a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = timeToSeconds(b.cronoSalidaPrevista) || b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSalidaImportado':
                valueA = timeToSeconds(a.horaSalidaImportado) || 0;
                valueB = timeToSeconds(b.horaSalidaImportado) || 0;
                break;
            case 'cronoSalidaImportado':
                valueA = timeToSeconds(a.cronoSalidaImportado) || 0;
                valueB = timeToSeconds(b.cronoSalidaImportado) || 0;
                break;
            case 'cronoSegundos':
                valueA = a.cronoSegundos || timeToSeconds(a.cronoSalida) || 0;
                valueB = b.cronoSegundos || timeToSeconds(b.cronoSalida) || 0;
                break;
            case 'horaSegundos':
                valueA = a.horaSegundos || timeToSeconds(a.horaSalida) || 0;
                valueB = b.horaSegundos || timeToSeconds(b.horaSalida) || 0;
                break;
            case 'cronoSalidaRealSegundos':
                valueA = a.cronoSalidaRealSegundos || timeToSeconds(a.cronoSalidaReal) || 0;
                valueB = b.cronoSalidaRealSegundos || timeToSeconds(b.cronoSalidaReal) || 0;
                break;
            case 'horaSalidaRealSegundos':
                valueA = a.horaSalidaRealSegundos || timeToSeconds(a.horaSalidaReal) || 0;
                valueB = b.horaSalidaRealSegundos || timeToSeconds(b.horaSalidaReal) || 0;
                break;
            default:
                valueA = parseInt(a.order) || 0;
                valueB = parseInt(b.order) || 0;
        }
        
        if (startOrderSortState.direction === 'asc') {
            return valueA > valueB ? 1 : (valueA < valueB ? -1 : 0);
        } else {
            return valueA < valueB ? 1 : (valueA > valueB ? -1 : 0);
        }
    });
}

// ============================================
// FUNCIONES AUXILIARES DE SALIDAS
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

function pauseCountdownVisual() {
    appState.countdownPaused = true;
    appState.configModalOpen = true;
}

function resumeCountdownVisual() {
    appState.countdownPaused = false;
    appState.configModalOpen = false;
}

function canModifyDuringCountdown() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.countdownActive) return true;
    
    if (appState.countdownValue <= 15) {
        showMessage(t.waitCountdownEnd, 'warning');
        return false;
    }
    
    return true;
}

// ============================================
// MÓDULO DE SALIDAS - CON INPUT DE TIEMPO MEJORADO
// ============================================

// ============================================
// VARIABLES DE ESTADO PARA INPUT DE TIEMPO
// ============================================
let originalTimeValue = '';
let timeInputInProgress = false;

// ============================================
// INICIALIZACIÓN DE INPUT DE TIEMPO
// ============================================
function setupTimeInputs() {

    // Cambiar input type="time" a text para permitir segundos en móviles
    const firstStartTime = document.getElementById('first-start-time');
    if (firstStartTime) {
        // Guardar el tipo original si es necesario
        if (firstStartTime.type === 'time') {
            firstStartTime.type = 'text';
            firstStartTime.classList.add('time-input');
        }
        
        // Configurar placeholder y validación
        firstStartTime.placeholder = 'HH:MM:SS';
        firstStartTime.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
        
        // Guardar valor original
        originalTimeValue = firstStartTime.value;
        
        // Configurar eventos
        setupTimeInputEvents(firstStartTime);
    }
}

function setupTimeInputEvents(input) {
    // Formatear al perder foco
    input.addEventListener('blur', function() {
        formatTimeInput(this);
        handleFirstStartTimeBlur();
    });
    
    // Autoformatear mientras escribe
    input.addEventListener('input', function(e) {
        autoFormatTimeInput(this, e);
    });
    
    // Capturar teclas especiales
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = originalTimeValue;
            this.blur();
        } else if (e.key === 'Enter') {
            this.blur();
        }
    });
    
    // Guardar valor original al enfocar
    input.addEventListener('focus', function() {
        originalTimeValue = this.value;
        timeInputInProgress = true;
    });
}

// ============================================
// FUNCIONES DE FORMATEO DE TIEMPO
// ============================================
function formatTimeInput(input) {
    let value = input.value.trim();
    
    if (!value) {
        input.value = '00:00:00';
        return;
    }
    
    // Si ya tiene formato HH:MM, agregar :00
    if (/^\d{1,2}:\d{2}$/.test(value)) {
        const parts = value.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            input.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
            return;
        }
    }
    
    // Quitar caracteres no numéricos
    value = value.replace(/[^0-9]/g, '');
    
    // Formatear según longitud
    if (value.length === 4) {
        // CORRECCIÓN: Interpretar como HHMM, no como MMSS
        const hours = parseInt(value.substring(0, 2));
        const minutes = parseInt(value.substring(2, 4));
        
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            input.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
        } else {
            input.value = '09:00:00'; // Valor por defecto
        }
    } 
    else if (value.length === 6) {
        // Formato HHMMSS → HH:MM:SS
        input.value = `${value.substring(0, 2)}:${value.substring(2, 4)}:${value.substring(4, 6)}`;
    } 
    else if (value.length <= 2) {
        // Formato HH (solo horas)
        const hours = parseInt(value) || 0;
        input.value = `${hours.toString().padStart(2, '0')}:00:00`;
    } 
    else {
        // Formato por defecto
        value = value.padStart(6, '0');
        input.value = `${value.substring(0, 2)}:${value.substring(2, 4)}:${value.substring(4, 6)}`;
    }
    
    // Validar el tiempo resultante
    if (!validateTime(input.value)) {
        input.classList.add('invalid-time');
        showTimeValidationMessage(input, 'Formato inválido. Use HH:MM:SS');
    } else {
        input.classList.remove('invalid-time');
    }
}

function autoFormatTimeInput(input, e) {
    let value = input.value;
    
    // Insertar automáticamente : después de 2 y 4 dígitos
    if (/^\d{2}$/.test(value) && !value.includes(':')) {
        input.value = value + ':';
    } else if (/^\d{2}:\d{2}$/.test(value) && value.match(/:/g).length === 1) {
        input.value = value + ':';
    }
    
    // Limitar a 8 caracteres (HH:MM:SS)
    if (value.length > 8) {
        input.value = value.substring(0, 8);
    }
}


/************ BORRAR  */