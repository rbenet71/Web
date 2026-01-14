// ============================================
// ARCHIVO: Crono_CRI_js_Salidas_3.js
// ============================================
// DESCRIPCIÓN: Gestión de cambios globales y modales
// RESPONSABILIDADES:
//   1. Cambio de hora de inicio con confirmación modal
//   2. Actualización en cascada de todas las horas de salida
//   3. Añadir corredores con modal de posición (principio, medio, final)
//   4. Vista previa en tiempo real de cambios
//   5. Ordenación de tabla con indicadores visuales
//   6. Recálculo automático de corredores siguientes
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - handleFirstStartTimeBlur()   - Maneja cambio de hora inicial
//   - showTimeChangeConfirmation() - Modal para confirmar cambios
//   - addNewRider()                - Añade nuevo corredor con modal
//   - createNewRiderAtPosition()   - Inserta corredor en posición específica
// 
// VARIABLES GLOBALES PROPIAS:
//   - originalTimeValue            - Valor original del input de tiempo
//   - timeInputInProgress          - Control de edición en progreso
// 
// CARACTERÍSTICAS ÚNICAS:
//   ✓ Modal con scroll independiente para formularios largos
//   ✓ Cálculo automático de horas basado en posición
//   ✓ Preservación de campos reales e importados
// 
// ARCHIVOS RELACIONADOS:
//   ← Salidas_1.js: Usa formatTimeValue(), timeToSeconds()
//   ← Salidas_2.js: Llama a updateStartOrderUI()
//   → Salidas_4.js: Usa recalculateFollowingRiders()
// ============================================

// ============================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ============================================

// ✅ FUNCIÓN ÚNICA DE VALIDACIÓN DE POSICIÓN (para todo el módulo)
function validatePositionInput(input, maxPosition) {
    // Permitir vacío completamente
    if (input.value === '' || input.value === null) {
        input.classList.remove('input-error', 'input-warning');
        return { valid: true, position: null };
    }
    
    // Solo números - limpiar cualquier carácter no numérico
    const numericValue = input.value.replace(/[^0-9]/g, '');
    if (numericValue !== input.value) {
        input.value = numericValue; // Corregir automáticamente
    }
    
    const position = parseInt(numericValue);
    
    // Si no es un número válido
    if (isNaN(position)) {
        input.classList.add('input-error');
        input.classList.remove('input-warning');
        return { valid: false, position: null };
    }
    
    // Validar rango
    if (position < 1 || position > maxPosition) {
        input.classList.add('input-error');
        input.classList.remove('input-warning');
        return { valid: false, position: position };
    } 
    else if (position === maxPosition) {
        input.classList.add('input-warning');
        input.classList.remove('input-error');
        return { valid: true, position: position };
    } 
    else {
        input.classList.remove('input-error', 'input-warning');
        return { valid: true, position: position };
    }
}

// ✅ FUNCIÓN DE TECLADO PERMISIVA
function handlePositionKeydown(event, maxPosition) {
    const key = event.key;
    const input = event.target;
    
    // PERMITIR TODAS las teclas de control y edición
    const controlKeys = [
        'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight',
        'ArrowUp', 'ArrowDown', 'Home', 'End', 'Escape', 'Enter',
        'Control', 'Alt', 'Shift', 'Meta', 'ContextMenu',
        'Insert', 'PageUp', 'PageDown'
    ];
    
    // Si es una tecla de control, permitir siempre
    if (controlKeys.includes(key)) {
        return true;
    }
    
    // Permitir Ctrl/Alt/Meta + cualquier tecla
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return true;
    }
    
    // Solo permitir números
    if (!/^\d$/.test(key)) {
        event.preventDefault();
        return false;
    }
    
    // Si estamos aquí, es un número
    const newValue = input.value + key;
    
    // Verificar que no exceda el máximo
    if (newValue && parseInt(newValue) > maxPosition) {
        event.preventDefault();
        showMessage(`Máximo: ${maxPosition}`, 'warning', 1500);
        return false;
    }
    
    return true;
}

// ============================================
// MANEJADORES DE CAMBIO DE HORA
// ============================================
function handleFirstStartTimeBlur() {
    const input = document.getElementById('first-start-time');
    const newValue = input.value;
    
    console.log('handleFirstStartTimeBlur called');
    console.log('Nuevo valor:', newValue);
    console.log('Valor original:', originalTimeValue);
    console.log('Tiempo en progreso:', timeInputInProgress);
    
    // Si ya estamos procesando, salir
    if (timeInputInProgress === false) {
        console.log('Ya no está en progreso, saliendo...');
        return;
    }
    
    // Marcar que ya estamos procesando
    timeInputInProgress = false;
    
    // Si el valor no cambió o es inválido, no hacer nada
    if (newValue === originalTimeValue) {
        console.log('Valor no cambió, saliendo...');
        return;
    }
    
    // Validar el formato
    if (!validateTime(newValue)) {
        console.log('Formato inválido, restaurando...');
        input.value = originalTimeValue;
        
        const t = translations[appState.currentLanguage];
        showMessage(t.enterValidTime || 'Formato de hora inválido. Use HH:MM o HH:MM:SS', 'error');
        return;
    }
    
    // Si no hay datos en la tabla, actualizar directamente
    if (!startOrderData || startOrderData.length === 0) {
        console.log('No hay datos en tabla, actualizando directamente...');
        
        // ✅ CORRECCIÓN: ACTUALIZAR EL INPUT también
        const input = document.getElementById('first-start-time');
        input.value = newValue;
        
        // ✅ Actualizar la variable
        originalTimeValue = newValue;
        
        // ✅ Actualizar la carrera actual también
        if (appState.currentRace) {
            appState.currentRace.firstStartTime = newValue;
            
            // ✅ Guardar el cambio
            if (typeof saveRaceData === 'function') {
                setTimeout(() => {
                    saveRaceData();
                    console.log(`✅ Hora de inicio guardada en carrera: "${appState.currentRace.name}"`);
                    
                    // ✅ Mostrar mensaje de confirmación
                    const t = translations[appState.currentLanguage];
                    showMessage(t.timeUpdated || 'Hora de inicio actualizada', 'success');
                }, 100);
            }
        }
        
        return;
    }
    
    // Mostrar modal de confirmación
    console.log('Mostrando modal de confirmación...');
    showTimeChangeConfirmation(newValue, originalTimeValue);
}

// ============================================
// FUNCIÓN DE CONFIRMACIÓN DE CAMBIO DE HORA
// ============================================
function showTimeChangeConfirmation(newTime, oldTime) {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de confirmación simplificado
    const modal = document.createElement('div');
    modal.id = 'time-change-confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.timeChangeTitle || 'Cambiar hora de inicio'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="time-change-comparison">
                    <div class="time-change-old">
                        <span class="time-change-label">Hora actual:</span>
                        <span class="time-change-value old-value">${oldTime}</span>
                    </div>
                    <div class="time-change-new">
                        <span class="time-change-label">Nueva hora:</span>
                        <span class="time-change-value new-value">${newTime}</span>
                    </div>
                </div>
                <div class="time-change-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${t.timeChangeWarning || '¿Estás seguro que quieres actualizar todas las horas de salida?'}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-time-change-btn">
                    <i class="fas fa-check"></i>
                    ${t.confirmChange || 'Sí, actualizar todo'}
                </button>
                <button class="btn btn-danger" id="cancel-time-change-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelChange || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupTimeChangeModalEvents(modal, newTime, oldTime);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function setupTimeChangeModalEvents(modal, newTime, oldTime) {
    const confirmBtn = modal.querySelector('#confirm-time-change-btn');
    const cancelBtn = modal.querySelector('#cancel-time-change-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar - actualizar toda la tabla
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Actualizar el valor en el input
        const input = document.getElementById('first-start-time');
        input.value = newTime;
        originalTimeValue = newTime;
        
        // Actualizar todas las horas
        updateAllStartTimes(newTime, oldTime);
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
        
        // Mostrar mensaje
        const t = translations[appState.currentLanguage];
        showMessage(t.allTimesUpdated || 'Todas las horas de salida actualizadas', 'success');
    });
    
    // Cancelar - restaurar valor original
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const input = document.getElementById('first-start-time');
        input.value = oldTime;
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
        
        const t = translations[appState.currentLanguage];
        showMessage(t.timeChangeCancelled || 'Cambio cancelado', 'info');
    });
    
    // Cerrar modal con la X
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const input = document.getElementById('first-start-time');
        input.value = oldTime;
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        timeInputInProgress = false;
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            const input = document.getElementById('first-start-time');
            input.value = oldTime;
            
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
            
            timeInputInProgress = false;
        }
    });
    
    // Prevenir que el evento se propague al contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Añadir estilos si no existen
    addTimeChangeStyles();
}

function updateAllStartTimes(newTime, oldTime) {
    console.log('Actualizando todas las horas de salida...');
    
    if (!validateTime(newTime) || !startOrderData || startOrderData.length === 0) {
        return;
    }
    
    const oldFirstSeconds = timeToSeconds(oldTime);
    const newFirstSeconds = timeToSeconds(newTime);
    
    // Calcular diferencia entre nueva y vieja hora
    const diferenciaSeconds = newFirstSeconds - oldFirstSeconds;
    
    console.log(`Diferencia: ${oldTime} → ${newTime} = ${diferenciaSeconds} segundos`);
    
    // Aplicar nueva hora a todos los corredores
    startOrderData.forEach((rider, index) => {
        // Actualizar hora principal
        const oldHoraSeconds = rider.horaSegundos || timeToSeconds(rider.horaSalida) || 0;
        rider.horaSegundos = oldHoraSeconds + diferenciaSeconds;
        rider.horaSalida = secondsToTime(rider.horaSegundos);
        
        // Actualizar hora prevista si es igual a la anterior
        const oldPrevistaSeconds = timeToSeconds(rider.horaSalidaPrevista) || 0;
        if (oldPrevistaSeconds === oldHoraSeconds || 
            rider.horaSalidaPrevista === rider.horaSalida) {
        }
        
        console.log(`Corredor ${index + 1}: ${secondsToTime(oldHoraSeconds)} → ${rider.horaSalida}`);
    });
    
    // Actualizar valores
    originalTimeValue = newTime;
    document.getElementById('first-start-time').value = newTime;
    
    // ✅ ACTUALIZAR UI con force=true para refrescar inmediatamente
    updateStartOrderUI();
    
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    console.log('Actualización completada');
}



function validateTime(timeStr) {
    if (!timeStr) return false;
    
    // Permitir HH:MM o HH:MM:SS
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return regex.test(timeStr);
}


// ============================================
// ESTILOS PARA EL MODAL DE CONFIRMACIÓN
// ============================================
function addTimeChangeStyles() {
    if (document.getElementById('time-change-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'time-change-styles';
    style.textContent = `
        .time-change-comparison {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
        }
        
        .time-change-old, .time-change-new {
            text-align: center;
        }
        
        .time-change-label {
            display: block;
            font-size: 0.9rem;
            color: var(--gray);
            margin-bottom: 5px;
        }
        
        .time-change-value {
            display: block;
            font-size: 1.8rem;
            font-weight: 700;
            font-family: 'Courier New', monospace;
        }
        
        .old-value {
            color: var(--danger);
            text-decoration: line-through;
        }
        
        .new-value {
            color: var(--success);
        }
        
        .time-change-warning {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 15px;
            margin: 15px 0;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .time-change-warning i {
            color: #f39c12;
            font-size: 1.5rem;
            margin-top: 2px;
        }
        
        .time-change-details {
            background: #e8f4fd;
            padding: 15px;
            border-radius: var(--border-radius);
            margin-top: 15px;
        }
        
        .time-change-details p {
            margin: 8px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .time-change-details i {
            color: var(--primary);
            width: 20px;
            text-align: center;
        }
        
        .time-change-details strong {
            margin-left: 5px;
        }
        
        .invalid-time {
            border-color: var(--danger) !important;
            background-color: #fff5f5 !important;
        }
        
        .time-validation-message {
            color: var(--danger);
            font-size: 0.85rem;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
    `;
    
    document.head.appendChild(style);
}

function showTimeValidationMessage(input, message) {
    // Eliminar mensaje anterior si existe
    const existingMessage = input.nextElementSibling;
    if (existingMessage && existingMessage.classList.contains('time-validation-message')) {
        existingMessage.remove();
    }
    
    // Crear nuevo mensaje
    const messageEl = document.createElement('div');
    messageEl.className = 'time-validation-message';
    messageEl.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    
    input.parentNode.insertBefore(messageEl, input.nextSibling);
    
    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        if (messageEl && messageEl.parentNode) {
            messageEl.remove();
        }
    }, 3000);
};


// ============================================
// FUNCIONES DE ORDENACIÓN PARA TABLA DE ORDEN DE SALIDA
// ============================================

function setupStartOrderTableSorting() {
    
    const sortableHeaders = document.querySelectorAll('.start-order-table th.sortable');
    
    if (sortableHeaders.length === 0) {
        console.warn("⚠️ No se encontraron encabezados con clase 'sortable'");
        console.warn("Los encabezados deben tener: class='sortable' y data-sort='nombre_campo'");
    }
    
    sortableHeaders.forEach((th, index) => {
        const column = th.getAttribute('data-sort');
        const text = th.textContent.trim();
        
        th.addEventListener('click', function() {
            console.log(`Clic en columna: ${column} (${text})`);
            console.log(`Estado actual: columna=${startOrderSortState.column}, dirección=${startOrderSortState.direction}`);
            
            if (startOrderSortState.column === column) {
                startOrderSortState.direction = startOrderSortState.direction === 'asc' ? 'desc' : 'asc';
            } else {
                startOrderSortState.column = column;
                startOrderSortState.direction = 'asc';
            }
            
            console.log(`Nuevo estado: columna=${startOrderSortState.column}, dirección=${startOrderSortState.direction}`);
            
            updateStartOrderTableThrottled(); 
        });
    });
    
    console.log("Ordenación configurada");
}

function updateStartOrderSortIndicators() {
    document.querySelectorAll('.start-order-table th.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
        const column = th.getAttribute('data-sort');
        if (column === startOrderSortState.column) {
            th.classList.add(startOrderSortState.direction);
        }
    });
}



function createFirstRider() {
    const t = translations[appState.currentLanguage];
    
    // Obtener hora de inicio
    const horaInicio = document.getElementById('first-start-time').value || '09:00:00';
    
    // Crear primer corredor
    const newRider = {
        order: 1,
        dorsal: 1,
        cronoSalida: '00:00:00',
        horaSalida: horaInicio,
        nombre: '',
        apellidos: '',
        chip: '',
        horaSalidaReal: horaInicio,
        cronoSalidaReal: '00:00:00',
        cronoSalidaRealSegundos: 0,
        horaSalidaRealSegundos: timeToSeconds(horaInicio),
        horaSalidaPrevista: horaInicio,
        cronoSalidaPrevista: '00:00:00',
        horaSalidaImportado: horaInicio,
        cronoSalidaImportado: '00:00:00',
        cronoSegundos: 0,
        horaSegundos: timeToSeconds(horaInicio)
    };
    
    startOrderData = [newRider];
    updateStartOrderUI();
    
    showMessage(t.firstRiderCreated, 'success');
}

function showRiderPositionModal() {
    const t = translations[appState.currentLanguage];
    
    // 🔥 GUARDA EL LENGTH INICIAL
    const initialLength = startOrderData.length;
    console.log(`🔍 showRiderPositionModal - initialLength guardado: ${initialLength}`);
    
    // Crear el modal
    const modal = document.createElement('div');
    modal.id = 'rider-position-modal';
    modal.className = 'modal';
    
    // 🔥 AÑADE EL DATASET
    modal.dataset.initialLength = initialLength;
    modal.dataset.maxPosition = initialLength + 1;
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${t.addRider || 'Añadir Corredor'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="add-rider-form">
                    <!-- Sección de posición -->
                    <div class="form-section">
                        <h4><i class="fas fa-map-marker-alt"></i> ${t.position || 'Posición'}</h4>
                        <div class="form-group">
                            <label for="rider-position-select">${t.selectPosition || 'Seleccionar posición:'}</label>
                            <select id="rider-position-select" class="form-control">
                                <option value="end">${t.addAtEnd || 'Añadir al final'}</option>
                                <option value="beginning">${t.addAtBeginning || 'Añadir al principio'}</option>
                                <option value="specific">${t.addAtSpecificPosition || 'Posición específica...'}</option>
                            </select>
                        </div>
                        <!-- ✅ CAMPO DE POSICIÓN CORREGIDO - SIN ATRIBUTOS PROBLEMÁTICOS -->
                        <div id="specific-position-container" class="form-group" style="display: none;">
                            <label for="specific-position-input">${t.positionNumber || 'Número de posición:'}</label>
                            <input type="text" 
                                   id="specific-position-input" 
                                   class="form-control specific-position-input" 
                                   placeholder="${initialLength + 1}"
                                   data-max-position="${initialLength + 1}">
                            <small class="form-text" style="color: var(--gray); font-size: 0.85rem; display: block; margin-top: 5px;">
                                ${t.positionRange || 'Rango válido:'} 1 - ${initialLength + 1}
                            </small>
                        </div>
                    </div>
                    
                    <!-- Sección de datos del corredor -->
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> ${t.riderData || 'Datos del Corredor'}</h4>
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="rider-dorsal"><i class="fas fa-hashtag"></i> ${t.dorsal || 'Dorsal'}:</label>
                                <input type="number" id="rider-dorsal" class="form-control" 
                                       min="1" value="${findNextAvailableDorsal()}">
                            </div>
                            <div class="form-group half-width">
                                <label for="rider-name"><i class="fas fa-user"></i> ${t.name || 'Nombre'}:</label>
                                <input type="text" id="rider-name" class="form-control" 
                                       placeholder="${t.name || 'Nombre'}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="rider-surname"><i class="fas fa-users"></i> ${t.surname || 'Apellidos'}:</label>
                                <input type="text" id="rider-surname" class="form-control" 
                                       placeholder="${t.surname || 'Apellidos'}">
                            </div>
                            <div class="form-group half-width">
                                <label for="rider-chip"><i class="fas fa-microchip"></i> ${t.chip || 'Chip'}:</label>
                                <input type="text" id="rider-chip" class="form-control" 
                                       placeholder="${t.chip || 'Código del chip'}">
                            </div>
                        </div>
                        
                        <!-- NUEVOS CAMPOS: categoria, equipo, licencia -->
                        <div class="form-row">
                            <div class="form-group half-width">
                                <label for="rider-categoria"><i class="fas fa-tag"></i> ${t.category || 'Categoría'}:</label>
                                <input type="text" id="rider-categoria" class="form-control" 
                                       placeholder="${t.category || 'Categoría'}">
                            </div>
                            <div class="form-group half-width">
                                <label for="rider-equipo"><i class="fas fa-users"></i> ${t.team || 'Equipo'}:</label>
                                <input type="text" id="rider-equipo" class="form-control" 
                                       placeholder="${t.team || 'Equipo'}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="rider-licencia"><i class="fas fa-id-card"></i> ${t.license || 'Licencia'}:</label>
                            <input type="text" id="rider-licencia" class="form-control" 
                                   placeholder="${t.license || 'Número de licencia'}">
                        </div>
                    </div>
                    
                    <!-- Vista previa -->
                    <div class="form-section">
                        <h4><i class="fas fa-eye"></i> ${t.preview || 'Vista Previa'}</h4>
                        <div class="rider-preview">
                            <div class="preview-grid">
                                <div class="preview-item">
                                    <strong>${t.position || 'Posición'}</strong>
                                    <div id="preview-position" class="preview-value">${initialLength + 1}</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.dorsal || 'Dorsal'}</strong>
                                    <div id="preview-dorsal" class="preview-value">${findNextAvailableDorsal()}</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.startTime || 'Hora Salida'}</strong>
                                    <div id="preview-time" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                                <div class="preview-item">
                                    <strong>Crono Salida</strong>
                                    <div id="preview-crono" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.name || 'Nombre'}</strong>
                                    <div id="preview-name" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.surname || 'Apellidos'}</strong>
                                    <div id="preview-surname" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.category || 'Categoría'}</strong>
                                    <div id="preview-categoria" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.team || 'Equipo'}</strong>
                                    <div id="preview-equipo" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.license || 'Licencia'}</strong>
                                    <div id="preview-licencia" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>${t.chip || 'Chip'}</strong>
                                    <div id="preview-chip" class="preview-value">--</div>
                                </div>
                                <div class="preview-item">
                                    <strong>Diferencia</strong>
                                    <div id="preview-diferencia" class="preview-value">
                                        <!-- Se calculará dinámicamente -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Información adicional -->
                    <div class="position-info">
                        <i class="fas fa-info-circle"></i>
                        <p>${t.positionInfo || 'La hora de salida se calculará automáticamente basándose en la posición y el intervalo establecido.'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-add-rider-btn">
                    <i class="fas fa-plus"></i>
                    ${t.addRiderButton || 'Añadir Corredor'}
                </button>
                <button class="btn btn-danger" id="cancel-add-rider-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelButtonText || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // ✅ CONFIGURACIÓN ESPECIAL DESPUÉS DE CREAR EL MODAL
    setTimeout(() => {
        // ✅ LIMPIEZA AGRESIVA DEL CAMPO DE POSICIÓN
        const positionInput = document.getElementById('specific-position-input');
        if (positionInput) {
            console.log('🔄 Limpiando campo de posición...');
            
            // 1. Eliminar atributos problemáticos
            positionInput.removeAttribute('pattern');
            positionInput.removeAttribute('inputmode');
            positionInput.removeAttribute('max');
            positionInput.removeAttribute('min');
            positionInput.removeAttribute('value');
            
            // 2. Forzar campo vacío
            positionInput.value = '';
            
            // 3. Añadir evento simple de validación
            positionInput.addEventListener('input', function() {
                // Solo permitir números, pero permitir borrar completamente
                const numericValue = this.value.replace(/[^0-9]/g, '');
                if (this.value !== numericValue) {
                    this.value = numericValue;
                }
                
                // Validar rango si hay valor
                if (this.value) {
                    const max = parseInt(this.dataset.maxPosition);
                    const position = parseInt(this.value);
                    
                    if (position > max) {
                        this.value = max.toString();
                        showMessage(`Posición máxima: ${max}`, 'warning', 1500);
                    }
                }
            });
            
            // 4. Añadir evento de teclado permisivo
            positionInput.addEventListener('keydown', function(event) {
                handlePositionKeydown(event, parseInt(this.dataset.maxPosition));
            });
            
            console.log('✅ Campo de posición listo:', {
                value: positionInput.value,
                attributes: Array.from(positionInput.attributes).map(a => a.name)
            });
        }
        
        // Configurar eventos del modal
        setupRiderPositionModalEvents(modal);
        
        // Mostrar el modal
        modal.classList.add('active');
        document.getElementById('rider-dorsal').focus();
    }, 50);
    
    // ✅ ESTILOS CSS
    const style = document.createElement('style');
    style.textContent = `
        .input-error {
            border-color: var(--danger) !important;
            box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25) !important;
        }
        .input-warning {
            border-color: var(--warning) !important;
            box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.25) !important;
        }
        .specific-position-input {
            font-family: monospace;
            font-size: 1.1rem;
            text-align: center;
        }
    `;
    document.head.appendChild(style);
}

// ✅ FUNCIÓN COMPLETA Y CORREGIDA setupRiderPositionModalEvents
function setupRiderPositionModalEvents(modalElement) {
    const t = translations[appState.currentLanguage];
    
    // 1. Botón cerrar modal
    const closeBtn = modalElement.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modalElement.remove();
        });
    }
    
    // 2. Botón cancelar
    const cancelBtn = modalElement.querySelector('#cancel-add-rider-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            modalElement.remove();
        });
    }
    
    // 3. Selector de posición - MOSTRAR/OCULTAR campo específico
    const positionSelect = modalElement.querySelector('#rider-position-select');
    const specificContainer = modalElement.querySelector('#specific-position-container');
    
    if (positionSelect && specificContainer) {
        // ✅ EJECUTAR INMEDIATAMENTE para estado inicial
        if (positionSelect.value === 'specific') {
            specificContainer.style.display = 'block';
        } else {
            specificContainer.style.display = 'none';
        }
        
        positionSelect.addEventListener('change', function() {
            if (this.value === 'specific') {
                specificContainer.style.display = 'block';
                // Enfocar el campo de posición
                setTimeout(() => {
                    const positionInput = document.getElementById('specific-position-input');
                    if (positionInput) positionInput.focus();
                }, 100);
            } else {
                specificContainer.style.display = 'none';
            }
            // Actualizar vista previa
            if (typeof updateRiderPreview === 'function') {
                updateRiderPreview();
            }
        });
    }
    
    // 4. ✅ EVENTO SIMPLIFICADO PARA EL CAMPO DE POSICIÓN
    const positionInput = modalElement.querySelector('#specific-position-input');
    if (positionInput && !positionInput.hasAttribute('data-events-configured')) {
        positionInput.setAttribute('data-events-configured', 'true');
        
        // Solo añadir evento Enter (los otros ya están configurados en showRiderPositionModal)
        positionInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const confirmBtn = document.getElementById('confirm-add-rider-btn');
                if (confirmBtn) confirmBtn.click();
            }
        });
    }
    
    // 5. Botón confirmar - CON VALIDACIÓN MEJORADA
    const confirmBtn = modalElement.querySelector('#confirm-add-rider-btn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function(e) {
            e.preventDefault(); // ✅ PREVENIR COMPORTAMIENTO POR DEFECTO
            
            // OBTENER DATOS DEL MODAL
            const dorsal = document.getElementById('rider-dorsal').value || '';
            const nombre = document.getElementById('rider-name').value || '';
            const apellidos = document.getElementById('rider-surname').value || '';
            const categoria = document.getElementById('rider-categoria').value || '';
            const equipo = document.getElementById('rider-equipo').value || '';
            const licencia = document.getElementById('rider-licencia').value || '';
            const chip = document.getElementById('rider-chip').value || '';
            
            // Validar datos mínimos
            if (!dorsal || dorsal.trim() === '') {
                showMessage(t.dorsalRequired || 'El dorsal es obligatorio', 'error');
                document.getElementById('rider-dorsal').focus();
                return false;
            }
            
            // DETERMINAR LA POSICIÓN
            let selectedPosition = null;
            const positionSelect = document.getElementById('rider-position-select');
            const maxPosition = parseInt(modalElement.dataset.maxPosition);
            
            if (positionSelect) {
                if (positionSelect.value === 'specific') {
                    // 🔥 POSICIÓN ESPECÍFICA - NO PERMITIR VACÍO
                    const positionInput = document.getElementById('specific-position-input');
                    
                    if (!positionInput.value || positionInput.value.trim() === '') {
                        showMessage(t.positionRequired || 'Debes introducir un número de posición', 'error');
                        positionInput.focus();
                        return false;
                    }
                    
                    // ✅ USA LA FUNCIÓN GLOBAL PARA VALIDAR
                    const validation = validatePositionInput(positionInput, maxPosition);
                    if (!validation.valid) {
                        showMessage(t.positionError || 'Por favor, introduce una posición válida (1-' + maxPosition + ')', 'error');
                        return false;
                    }
                    
                    selectedPosition = validation.position;
                    
                } else if (positionSelect.value === 'end') {
                    // Añadir al final
                    selectedPosition = maxPosition; // startOrderData.length + 1
                    
                } else if (positionSelect.value === 'beginning') {
                    // Añadir al principio
                    selectedPosition = 1;
                }
            }
            
            // Crear objeto con los datos del corredor
            const riderData = {
                dorsal: parseInt(dorsal),
                nombre: nombre.trim(),
                apellidos: apellidos.trim(),
                categoria: categoria.trim(),
                equipo: equipo.trim(),
                licencia: licencia.trim(),
                chip: chip.trim()
            };
            
            console.log(`🔍 Añadiendo corredor en posición: ${selectedPosition}`, riderData);
            
            // Si pasa todas las validaciones, crear el corredor
            if (typeof createNewRiderAtPosition === 'function') {
                // ✅ LLAMAR CON POSICIÓN Y DATOS
                createNewRiderAtPosition(selectedPosition, riderData);
            } else {
                console.error('❌ Función createNewRiderAtPosition no encontrada');
                showMessage('Error: No se pudo crear el corredor', 'error');
            }
            
            modalElement.remove();
            return false;
        });
    }
    
    // 6. Event listeners para actualizar vista previa en tiempo real
    const inputsToWatch = ['rider-dorsal', 'rider-name', 'rider-surname', 'rider-chip', 
                          'rider-categoria', 'rider-equipo', 'rider-licencia'];
    
    inputsToWatch.forEach(id => {
        const input = modalElement.querySelector(`#${id}`);
        if (input) {
            input.addEventListener('input', function() {
                if (typeof updateRiderPreview === 'function') {
                    updateRiderPreview();
                }
            });
        }
    });
    
    // ✅ AÑADIR EVENTO PARA ENTER EN CUALQUIER CAMPO
    const allInputs = modalElement.querySelectorAll('input');
    allInputs.forEach(input => {
        if (!input.hasAttribute('data-enter-configured')) {
            input.setAttribute('data-enter-configured', 'true');
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (confirmBtn) confirmBtn.click();
                }
            });
        }
    });
}


function findNextAvailableDorsal() {
    if (!startOrderData || startOrderData.length === 0) {
        return 1;
    }
    
    // Buscar el dorsal más alto
    let maxDorsal = 0;
    startOrderData.forEach(rider => {
        if (rider.dorsal > maxDorsal) {
            maxDorsal = rider.dorsal;
        }
    });
    
    return maxDorsal + 1;
}

function updateRiderPreview() {
    console.log(`🔍 updateRiderPreview llamada - timestamp: ${Date.now()}`);
    
    const modal = document.getElementById('rider-position-modal');
    if (!modal) {
        console.log(`❌ Modal no encontrado en updateRiderPreview`);
        return;
    }
    
    // 🔥 OBTENER EL INITIAL LENGTH DEL MODAL
    const modalInitialLength = parseInt(modal.dataset.initialLength) || startOrderData.length;
    console.log(`🔍 Usando modalInitialLength: ${modalInitialLength} (actual: ${startOrderData.length})`);
    
    // Elementos de posición
    const positionSelect = modal.querySelector('#rider-position-select');
    const specificInput = modal.querySelector('#specific-position-input');
    
    // 🔥 ACTUALIZAR EL MAX DEL INPUT ESPECÍFICO (IMPORTANTE)
    if (specificInput) {
        // Si hay un modalInitialLength, usarlo, sino usar startOrderData.length
        const maxPosition = modalInitialLength + 1;
        if (parseInt(specificInput.max) !== maxPosition) {
            specificInput.max = maxPosition;
            console.log(`🔍 specificInput.max actualizado a: ${maxPosition}`);
        }
        
        // Si el valor actual es mayor que el nuevo máximo, ajustarlo
        const currentValue = parseInt(specificInput.value);
        if (currentValue > maxPosition) {
            specificInput.value = maxPosition;
            console.log(`🔍 specificInput.value ajustado a: ${maxPosition}`);
        }
    }
    
    // Elementos del formulario
    const dorsalInput = modal.querySelector('#rider-dorsal');
    const nameInput = modal.querySelector('#rider-name');
    const surnameInput = modal.querySelector('#rider-surname');
    const chipInput = modal.querySelector('#rider-chip');
    
    // Elementos de vista previa
    const previewPosition = modal.querySelector('#preview-position');
    const previewDorsal = modal.querySelector('#preview-dorsal');
    const previewTime = modal.querySelector('#preview-time');
    const previewCrono = modal.querySelector('#preview-crono');
    const previewName = modal.querySelector('#preview-name');
    const previewSurname = modal.querySelector('#preview-surname');
    const previewChip = modal.querySelector('#preview-chip');
    const previewDiferencia = modal.querySelector('#preview-diferencia');
    
    // Calcular posición - 🔥 USA modalInitialLength
    let position;
    const positionType = positionSelect ? positionSelect.value : 'end';
    
    if (positionType === 'end') {
        position = modalInitialLength + 1;
    } else if (positionType === 'beginning') {
        position = 1;
    } else if (positionType === 'specific') {
        position = specificInput ? parseInt(specificInput.value) || modalInitialLength + 1 : modalInitialLength + 1;
        if (position < 1) position = 1;
        if (position > modalInitialLength + 1) position = modalInitialLength + 1;
    } else {
        position = modalInitialLength + 1;
    }
    
    // Actualizar vista previa de posición
    if (previewPosition) {
        previewPosition.textContent = position;
    }
    
    // Actualizar vista previa de datos
    if (previewDorsal) {
        previewDorsal.textContent = (dorsalInput && dorsalInput.value) ? dorsalInput.value : position;
    }
    
    if (previewName) {
        previewName.textContent = (nameInput && nameInput.value) ? nameInput.value : '--';
    }
    
    if (previewSurname) {
        previewSurname.textContent = (surnameInput && surnameInput.value) ? surnameInput.value : '--';
    }
    
    if (previewChip) {
        previewChip.textContent = (chipInput && chipInput.value) ? chipInput.value : '--';
    }
    
    // Calcular la hora de salida y crono para esta posición
    let horaSalida = '00:00:00';
    let cronoSalida = '00:00:00';
    let diferencia = '00:00:00';
    
    // 🔥 IMPORTANTE: Para cálculos de tiempos, usa startOrderData REAL
    // pero para posición, usa modalInitialLength
    if (startOrderData.length > 0) {
        if (position === 1) {
            // PRIMER CORREDOR
            cronoSalida = '00:00:00';
            horaSalida = document.getElementById('first-start-time') ? document.getElementById('first-start-time').value || '09:00:00' : '09:00:00';
            diferencia = '00:00:00';
            
            // Si ya hay corredores, mostrar la diferencia que tendría el corredor desplazado
            const primerCorredorActual = startOrderData[0];
            if (primerCorredorActual && primerCorredorActual.diferencia && 
                primerCorredorActual.diferencia !== '' && 
                primerCorredorActual.diferencia !== '00:00:00') {
                
                diferencia = primerCorredorActual.diferencia;
                console.log('Vista previa - Posición 1: Mostrando diferencia del corredor desplazado:', diferencia);
            }
        } else if (position <= startOrderData.length) {
            // Insertar en medio - usar el corredor anterior como referencia
            const corredorAnterior = startOrderData[position - 2];
            
            // Determinar diferencia a usar
            if (position - 1 < startOrderData.length) {
                // Si hay un corredor después de esta posición, usar SU diferencia
                const siguienteCorredor = startOrderData[position - 1];
                diferencia = siguienteCorredor.diferencia || '00:01:00';
            } else {
                // Si es el último, usar la diferencia del anterior
                diferencia = corredorAnterior.diferencia || '00:01:00';
            }
            
            // Limpiar signos de la diferencia para cálculos
            const diferenciaLimpia = diferencia.replace(/ \([+-]\)/g, '').trim();
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // Calcular crono salida: crono del anterior + diferencia
            const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
            const cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Calcular hora salida: hora del anterior + diferencia
            const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
            const horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
        } else {
            // Añadir al final - usar el último corredor como referencia
            const ultimoCorredor = startOrderData[startOrderData.length - 1];
            
            // Usar la diferencia del último corredor
            diferencia = ultimoCorredor.diferencia || '00:01:00';
            
            // Limpiar signos de la diferencia para cálculos
            const diferenciaLimpia = diferencia.replace(/ \([+-]\)/g, '').trim();
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // Calcular crono salida: crono del último + diferencia
            const cronoAnteriorSegundos = ultimoCorredor.cronoSegundos || timeToSeconds(ultimoCorredor.cronoSalida) || 0;
            const cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Calcular hora salida: hora del último + diferencia
            const horaAnteriorSegundos = ultimoCorredor.horaSegundos || timeToSeconds(ultimoCorredor.horaSalida) || 0;
            const horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
        }
    } else {
        // NO HAY CORREDORES EXISTENTES (primer corredor de la tabla)
        cronoSalida = '00:00:00';
        horaSalida = document.getElementById('first-start-time') ? document.getElementById('first-start-time').value || '09:00:00' : '09:00:00';
        diferencia = '00:00:00';
    }
    
    // Actualizar vista previa de tiempos
    if (previewTime) {
        previewTime.textContent = horaSalida;
    }
    
    if (previewCrono) {
        previewCrono.textContent = cronoSalida;
    }
    
    if (previewDiferencia) {
        // Mostrar diferencia con formato
        let diferenciaDisplay = diferencia;
        if (diferencia === '00:00:00' || !diferencia) {
            diferenciaDisplay = '00:00:00';
        } else if (!diferencia.includes('(+)') && !diferencia.includes('(-)')) {
            // Si no tiene signo, añadirlo como positivo por defecto
            diferenciaDisplay = diferencia + ' (+)';
        }
        previewDiferencia.textContent = diferenciaDisplay;
    }
    
    // Actualizar specific input con el valor calculado
    if (specificInput && positionType === 'specific') {
        specificInput.value = position;
    }
    
    console.log(`🔍 Posición final calculada: ${position} (usando modalInitialLength: ${modalInitialLength})`);
    console.log('Vista previa actualizada para posición', position, ':', {
        horaSalida,
        cronoSalida,
        diferencia
    });
}


function createNewRiderAtPosition(position, riderData = {}) {
    console.log(`=== createNewRiderAtPosition llamada para posición ${position} ===`);
    
    const t = translations[appState.currentLanguage];
    
    // Validar posición
    if (position < 1) position = 1;
    if (position > startOrderData.length + 1) position = startOrderData.length + 1;
    
    console.log(`Posición validada: ${position}, total corredores actual: ${startOrderData.length}`);
    
    // 🔥 GUARDAR DIFERENCIAS ORIGINALES ANTES DE INSERTAR
    const diferenciasOriginales = [...startOrderData.map(r => r.diferencia)];
    console.log('📋 Diferencias originales guardadas:', diferenciasOriginales);
    
    // Variables para el nuevo corredor
    let cronoSalida = '00:00:00';
    let horaSalida = '09:00:00';
    let diferencia = '00:01:00 (+)'; // Diferencia por defecto
    let cronoSegundos = 0;
    let horaSegundos = 0;
    
    // Si hay corredores existentes, calcular basándose en ellos
    if (startOrderData.length > 0) {
        if (position === 1) {
            // 🔥 CASO ESPECIAL: AÑADIR EN POSICIÓN 1
            // Insertar al principio - usar la hora de inicio del input
            horaSalida = document.getElementById('first-start-time').value || '09:00:00';
            horaSegundos = timeToSeconds(horaSalida);
            diferencia = '00:00:00';
            
            console.log(`🔥 Añadiendo al PRINCIPIO. Hora: ${horaSalida}`);
            console.log(`🔥 Se usarán las diferencias originales para los desplazados`);
            
        } else {
            // Insertar en medio o al final (CASO NORMAL)
            const corredorAnterior = startOrderData[position - 2];
            
            // ✅ USAR la diferencia del registro anterior
            diferencia = corredorAnterior.diferencia || '00:01:00 (+)';
            
            // Calcular diferencia en segundos (limpiar signos + o -)
            let diferenciaLimpia = diferencia;
            if (diferencia.includes('(+)')) {
                diferenciaLimpia = diferencia.replace('(+)', '').trim();
            } else if (diferencia.includes('(-)')) {
                diferenciaLimpia = diferencia.replace('(-)', '').trim();
            }
            
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // ✅ Calcular nuevos valores basados en el anterior + diferencia
            // Crono salida: crono del anterior + diferencia
            const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
            cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            cronoSalida = secondsToTime(cronoSegundos);
            
            // Hora salida: hora del anterior + diferencia
            const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
            horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            horaSalida = secondsToTime(horaSegundos);
            
            console.log(`Añadiendo en posición ${position}. Usando diferencia del anterior: ${diferencia}`);
            console.log(`  Anterior: hora=${secondsToTime(horaAnteriorSegundos)}, crono=${secondsToTime(cronoAnteriorSegundos)}`);
            console.log(`  Nuevo: hora=${horaSalida}, crono=${cronoSalida}, diferencia=${diferenciaSegundos}s`);
        }
    } else {
        // Primer corredor de la tabla
        horaSalida = document.getElementById('first-start-time').value || '09:00:00';
        horaSegundos = timeToSeconds(horaSalida);
        diferencia = '00:00:00';
        console.log(`Primer corredor de la tabla. Hora: ${horaSalida}`);
    }
    
    // 🔥 OBTENER DATOS DE LOS CAMPOS DEL MODAL SI NO VIENEN EN riderData
    // (Esto asegura que cuando se llame desde el modal, se capturen los nuevos campos)
    let categoria = riderData.categoria || '';
    let equipo = riderData.equipo || '';
    let licencia = riderData.licencia || '';
    
    // Si los campos están vacíos, intentar obtenerlos de los inputs del modal
    if (!categoria && document.getElementById('rider-categoria')) {
        categoria = document.getElementById('rider-categoria').value.trim();
    }
    if (!equipo && document.getElementById('rider-equipo')) {
        equipo = document.getElementById('rider-equipo').value.trim();
    }
    if (!licencia && document.getElementById('rider-licencia')) {
        licencia = document.getElementById('rider-licencia').value.trim();
    }
    
    // Crear nuevo corredor (CON CAMPOS COMPLETOS)
    const nuevoCorredor = {
        order: position,
        dorsal: riderData.dorsal || position,
        
        // Campos principales (calculados arriba)
        cronoSalida: cronoSalida,
        horaSalida: horaSalida,
        diferencia: diferencia,
        
        // Datos personales (INCLUYENDO NUEVOS CAMPOS)
        nombre: riderData.nombre || '',
        apellidos: riderData.apellidos || '',
        categoria: categoria,              // ← NUEVO
        equipo: equipo,                    // ← NUEVO
        licencia: licencia,                // ← NUEVO
        chip: riderData.chip || '',
        
        // Campos reales - VACÍOS
        horaSalidaReal: '',
        cronoSalidaReal: '',
        cronoSalidaRealSegundos: 0,
        horaSalidaRealSegundos: 0,
        
        // Campos previstas - iguales a los principales
        horaSalidaPrevista: horaSalida,
        cronoSalidaPrevista: cronoSalida,
        
        // Campos importados - ✅ SIEMPRE VACÍOS para nuevos corredores
        horaSalidaImportado: '',
        cronoSalidaImportado: '',
        
        // Segundos (ya calculados arriba)
        cronoSegundos: cronoSegundos,
        horaSegundos: horaSegundos,
        diferenciaSegundos: timeToSeconds(diferencia.replace(/ \([+-]\)/g, '').trim()) || 0
    };
    
    console.log('Nuevo corredor creado:', {
        order: nuevoCorredor.order,
        dorsal: nuevoCorredor.dorsal,
        horaSalida: nuevoCorredor.horaSalida,
        cronoSalida: nuevoCorredor.cronoSalida,
        diferencia: nuevoCorredor.diferencia,
        categoria: nuevoCorredor.categoria,
        equipo: nuevoCorredor.equipo,
        licencia: nuevoCorredor.licencia,
        horaSalidaImportado: nuevoCorredor.horaSalidaImportado,
        cronoSalidaImportado: nuevoCorredor.cronoSalidaImportado
    });
    
    // 🔥 INSERTAR CORREDOR
    startOrderData.splice(position - 1, 0, nuevoCorredor);
    
    // Recalcular órdenes de todos los corredores
    for (let i = 0; i < startOrderData.length; i++) {
        startOrderData[i].order = i + 1;
    }
    
    // 🔥 MANEJO ESPECIAL PARA POSICIÓN 1 - ASIGNAR DIFERENCIAS CORRECTAS
    if (position === 1 && startOrderData.length > 1) {
        console.log('🔥 MANEJO ESPECIAL PARA POSICIÓN 1');
        
        // 1. El corredor en posición 2 recibe la diferencia D2 (del corredor que estará en posición 3)
        if (diferenciasOriginales.length >= 2) {
            // diferenciasOriginales[1] es D2 (diferencia del corredor que estaba en posición 2)
            const D2 = diferenciasOriginales[1] || '00:01:00 (+)';
            startOrderData[1].diferencia = D2;
            console.log(`   🔄 Posición 2 asignada D2 = ${D2}`);
            
            // 2. Los corredores en posiciones 3+ mantienen sus diferencias originales
            for (let i = 2; i < startOrderData.length; i++) {
                if (diferenciasOriginales[i]) {
                    startOrderData[i].diferencia = diferenciasOriginales[i];
                    console.log(`   🔄 Posición ${i + 1} mantiene diferencia original = ${diferenciasOriginales[i]}`);
                }
            }
        } else if (diferenciasOriginales.length === 1) {
            // Solo había un corredor antes
            const unicaDiferencia = diferenciasOriginales[0] || '00:01:00 (+)';
            startOrderData[1].diferencia = unicaDiferencia;
            console.log(`   🔄 Solo había un corredor: Posición 2 asignada = ${unicaDiferencia}`);
        }
        
        // 3. 🔥 RECALCULAR TODOS LOS TIEMPOS USANDO LA FUNCIÓN EXISTENTE recalculateFollowingRiders
        // Simplemente llamamos a recalculateFollowingRiders desde la posición 2
        console.log(`🔄 Recalculando todos los tiempos desde posición 2`);
        recalculateFollowingRiders(2);
        
    } else {
        // ✅ CASO NORMAL: Recalcular corredores posteriores si los hay y NO es la última posición
        if (position < startOrderData.length - 1) {
            console.log(`🔄 Recalculando corredores desde posición ${position + 1} (hay corredores posteriores)`);
            recalculateFollowingRiders(position + 1);
        } else {
            console.log(`✅ Añadido en posición ${position} (última o penúltima), no hay corredores posteriores para recalcular`);
        }
    }
    
    // ✅ Actualizar UI
    updateStartOrderUI();
    
    // ✅ Guardar datos
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    // Mostrar mensaje
    const message = t.riderAddedAtPosition ? t.riderAddedAtPosition.replace('{position}', position) : `Corredor añadido en posición ${position}`;
    showMessage(message, 'success');
    
    console.log(`=== createNewRiderAtPosition completada ===`);
    
    return nuevoCorredor;
}

function recalculateFollowingRiders(fromPosition) {
    console.log(`🔍🔍🔍 === recalculateFollowingRiders INICIANDO ===`);
    console.log(`🔍 Parámetro fromPosition: ${fromPosition}`);
    console.log(`🔍 startOrderData.length: ${startOrderData.length}`);
    
    // 🔥 DIAGNÓSTICO 1: Verificar si debería ejecutarse
    if (fromPosition >= startOrderData.length) {
        console.log(`❌❌❌ DIAGNÓSTICO 1: NO debería ejecutarse`);
        console.log(`❌ fromPosition (${fromPosition}) >= length (${startOrderData.length})`);
        console.log(`❌ Esta función NO debería haberse llamado`);
        return;
    }
    
    console.log(`✅ DIAGNÓSTICO 1: Condición OK, puede ejecutarse`);
    
    // Ajustar fromPosition para que sea base 0
    const startIndex = Math.max(0, fromPosition - 1);
    console.log(`🔍 startIndex calculado: ${startIndex} (fromPosition ${fromPosition} - 1)`);
    
    // 🔥 DIAGNÓSTICO 2: Verificar índices
    console.log(`🔍 DIAGNÓSTICO 2: Bucle desde i=${startIndex} hasta i<${startOrderData.length}`);
    
    let corredoresProcesados = 0;
    
    for (let i = startIndex; i < startOrderData.length; i++) {
        corredoresProcesados++;
        console.log(`\n🔍 Iteración ${corredoresProcesados}: i=${i}`);
        
        // 🔥 DIAGNÓSTICO 3: Verificar acceso a array
        if (i >= startOrderData.length) {
            console.log(`❌❌❌ ERROR: i (${i}) >= length (${startOrderData.length})`);
            break;
        }
        
        if (i < 1) {
            console.log(`⚠️ i=${i} < 1, saltando (no hay corredor anterior)`);
            continue;
        }
        
        const corredorActual = startOrderData[i];
        const corredorAnterior = startOrderData[i - 1];
        
        // 🔥 DIAGNÓSTICO 4: Verificar corredores
        if (!corredorActual) {
            console.log(`❌❌❌ ERROR: corredorActual no existe en índice ${i}`);
            continue;
        }
        if (!corredorAnterior) {
            console.log(`❌❌❌ ERROR: corredorAnterior no existe en índice ${i-1}`);
            continue;
        }
        
        console.log(`🔍 Procesando: Corredor ${i} (order ${corredorActual.order})`);
        console.log(`🔍 Anterior: Corredor ${i-1} (order ${corredorAnterior.order})`);
        
        // 1. Actualizar orden
        const ordenViejo = corredorActual.order;
        corredorActual.order = i + 1;
        console.log(`📝 Orden cambiado: ${ordenViejo} -> ${corredorActual.order}`);
        
        // 2. USAR la diferencia del corredor actual (NO cambiarla)
        const diferenciaVieja = corredorActual.diferencia;
        if (!corredorActual.diferencia || corredorActual.diferencia === '' || corredorActual.diferencia === '00:00:00') {
            corredorActual.diferencia = corredorAnterior.diferencia || '00:01:00 (+)';
            console.log(`📝 Diferencia asignada: "${diferenciaVieja}" -> "${corredorActual.diferencia}"`);
        }
        
        let diferencia = corredorActual.diferencia;
        
        // 3. Calcular diferencia en segundos (limpiar signos)
        let diferenciaLimpia = diferencia;
        if (diferencia.includes('(+)')) {
            diferenciaLimpia = diferencia.replace('(+)', '').trim();
        } else if (diferencia.includes('(-)')) {
            diferenciaLimpia = diferencia.replace('(-)', '').trim();
        }
        
        const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
        console.log(`🔍 Diferencia en segundos: ${diferenciaSegundos}s`);
        
        // 4. Calcular nuevos valores basados en el anterior + diferencia
        const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
        const cronoViejo = corredorActual.cronoSalida;
        corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
        corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
        console.log(`📝 Crono cambiado: ${cronoViejo} -> ${corredorActual.cronoSalida} (${cronoAnteriorSegundos}s + ${diferenciaSegundos}s)`);
        
        const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
        const horaVieja = corredorActual.horaSalida;
        corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
        corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
        console.log(`📝 Hora cambiada: ${horaVieja} -> ${corredorActual.horaSalida} (${horaAnteriorSegundos}s + ${diferenciaSegundos}s)`);
        
        // 5. Actualizar campos previstas
        corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
        corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
        
        // 6. Actualizar diferenciaSegundos
        if (!corredorActual.diferenciaSegundos || corredorActual.diferenciaSegundos === 0) {
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
            console.log(`📝 diferenciaSegundos asignado: ${corredorActual.diferenciaSegundos}`);
        }
        
        console.log(`✅ Corredor ${corredorActual.order} procesado`);
    }
    
    console.log(`\n🔍🔍🔍 === recalculateFollowingRiders COMPLETADO ===`);
    console.log(`🔍 Total corredores procesados: ${corredoresProcesados}`);
    console.log(`🔍 Total corredores en array: ${startOrderData.length}`);
    console.log(`🔍 Diferencia: ${startOrderData.length - corredoresProcesados} corredores NO procesados`);
    
    // ✅ Actualizar UI después del recálculo
    updateStartOrderUI();
}

function addRiderPositionStyles() {
    if (document.getElementById('rider-position-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'rider-position-styles';
    style.textContent = `
        /* Modal principal - SIN scroll */
        #rider-position-modal .modal-content {
            display: flex;
            flex-direction: column;
            max-height: 90vh;
        }
        
        /* Cuerpo del modal - CON scroll */
        #rider-position-modal .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            min-height: 0; /* Importante para flexbox */
        }
        
        /* Formulario interno - SIN scroll */
        .add-rider-form {
            max-height: none;
            overflow-y: visible;
        }
        
        /* Eliminar scrollbars innecesarios */
        .add-rider-form::-webkit-scrollbar {
            display: none;
        }
        
        .form-section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .form-section:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .form-section h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
        }
        
        .form-row {
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .half-width {
            flex: 1;
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 5px;
            font-weight: 600;
            color: var(--gray-dark);
        }
        
        .form-group label i {
            color: var(--primary);
            width: 16px;
            text-align: center;
        }
        
        .rider-preview {
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border-left: 4px solid var(--success);
            margin-top: 10px;
        }
        
        .preview-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .preview-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .preview-item strong {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .preview-value {
            font-size: 1rem;
            font-weight: 600;
            font-family: 'Courier New', monospace;
            padding: 5px 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #dee2e6;
            word-break: break-word;
            min-height: 36px;
            display: flex;
            align-items: center;
        }
        
        #preview-position, #preview-dorsal {
            color: var(--primary);
        }
        
        #preview-time {
            color: var(--success);
        }
        
        #preview-name, #preview-surname {
            color: var(--info);
        }
        
        #preview-chip {
            color: var(--warning);
        }
        
        .position-info {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 10px;
            margin: 10px 0;
            background: #e8f4fd;
            border-radius: var(--border-radius);
            color: var(--primary-dark);
        }
        
        .position-info i {
            color: var(--primary);
            margin-top: 2px;
        }
        
        .position-info p {
            margin: 0;
            font-size: 0.9rem;
        }
        
        /* Scrollbar personalizada para el modal */
        #rider-position-modal .modal-body::-webkit-scrollbar {
            width: 8px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
            margin: 5px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        #rider-position-modal .modal-body::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Footer fijo en la parte inferior */
        #rider-position-modal .modal-footer {
            margin-top: auto;
            padding: 20px;
            border-top: 1px solid #eee;
            background: white;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        /* Ajustes responsive */
        @media (max-width: 768px) {
            #rider-position-modal .modal-content {
                max-height: 95vh;
                margin: 10px;
                width: calc(100% - 20px);
            }
            
            .preview-grid {
                grid-template-columns: 1fr;
            }
            
            .form-row {
                flex-direction: column;
                gap: 15px;
            }
            
            .half-width {
                width: 100%;
            }
            
            #rider-position-modal .modal-footer {
                flex-direction: column;
            }
            
            #rider-position-modal .modal-footer button {
                width: 100%;
            }
        }
        
        /* Para pantallas muy pequeñas */
        @media (max-height: 600px) {
            #rider-position-modal .modal-content {
                max-height: 85vh;
            }
            
            .form-section {
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            
            .form-group {
                margin-bottom: 10px;
            }
        }
        
        /* Para pantallas grandes */
        @media (min-height: 800px) {
            #rider-position-modal .modal-content {
                max-height: 700px;
            }
        }
    `;
    
    document.head.appendChild(style);
} 


/******* BORRAR POR REPETIAS... */
/* REPETIDA EN UTILIDADES
function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
// Funciones auxiliares (si no existen)
function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '') return 0;
    
    // Asegurar formato HH:MM:SS
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        formattedTime = '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        // Formato HH:MM -> agregar :00
        parts.push('00');
    }
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
}
// ============================================
// FUNCIONES DE ORDEN DE SALIDA (CONTINUACIÓN)
// ============================================

function addNewRider() {
    const t = translations[appState.currentLanguage];
    
    // Si no hay datos en la tabla, crear el primer corredor
    if (!startOrderData || startOrderData.length === 0) {
        createFirstRider();
        return;
    }
    
    // Mostrar modal para seleccionar posición
    showRiderPositionModal();
}

*/