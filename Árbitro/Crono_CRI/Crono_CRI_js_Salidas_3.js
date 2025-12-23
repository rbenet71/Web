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
        originalTimeValue = newValue;
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

function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
    console.log("Configurando ordenación para tabla de orden de salida...");
    
    const sortableHeaders = document.querySelectorAll('.start-order-table th.sortable');
    console.log(`Encontrados ${sortableHeaders.length} encabezados ordenables`);
    
    if (sortableHeaders.length === 0) {
        console.warn("⚠️ No se encontraron encabezados con clase 'sortable'");
        console.warn("Los encabezados deben tener: class='sortable' y data-sort='nombre_campo'");
    }
    
    sortableHeaders.forEach((th, index) => {
        const column = th.getAttribute('data-sort');
        const text = th.textContent.trim();
        console.log(`Encabezado ${index + 1}: "${text}" -> data-sort="${column}"`);
        
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
    
    // Crear el modal - Asegúrate de que tenga TODOS estos elementos:
    const modal = document.createElement('div');
    modal.id = 'rider-position-modal';
    modal.className = 'modal';
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
                        <div id="specific-position-container" class="form-group" style="display: none;">
                            <label for="specific-position-input">${t.positionNumber || 'Número de posición:'}</label>
                            <input type="number" id="specific-position-input" class="form-control" 
                                   min="1" max="${startOrderData.length + 1}" 
                                   value="${startOrderData.length + 1}">
                        </div>
                    </div>
                    
                    <!-- Sección de datos del corredor -->
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> ${t.riderData || 'Datos del Corredor'}</h4>
                        <div class="form-row">
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-dorsal"><i class="fas fa-hashtag"></i> ${t.dorsal || 'Dorsal'}:</label>
                                    <input type="number" id="rider-dorsal" class="form-control" 
                                           min="1" value="${findNextAvailableDorsal()}">
                                </div>
                            </div>
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-name"><i class="fas fa-user"></i> ${t.name || 'Nombre'}:</label>
                                    <input type="text" id="rider-name" class="form-control" 
                                           placeholder="${t.name || 'Nombre'}">
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-surname"><i class="fas fa-users"></i> ${t.surname || 'Apellidos'}:</label>
                                    <input type="text" id="rider-surname" class="form-control" 
                                           placeholder="${t.surname || 'Apellidos'}">
                                </div>
                            </div>
                            <div class="half-width">
                                <div class="form-group">
                                    <label for="rider-chip"><i class="fas fa-microchip"></i> ${t.chip || 'Chip'}:</label>
                                    <input type="text" id="rider-chip" class="form-control" 
                                           placeholder="${t.chip || 'Código del chip'}">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Vista previa -->
                    <div class="form-section">
                        <h4><i class="fas fa-eye"></i> ${t.preview || 'Vista Previa'}</h4>
                        <div class="rider-preview">
                            <div class="preview-grid">
                                <div class="preview-item">
                                    <strong>${t.position || 'Posición'}</strong>
                                    <div id="preview-position" class="preview-value">${startOrderData.length + 1}</div>
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
    
    // Configurar eventos del modal
    setupRiderPositionModalEvents(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
        document.getElementById('rider-dorsal').focus();
    }, 10);
}

function setupRiderPositionModalEvents(modal) {
    const t = translations[appState.currentLanguage];
    
    // Elementos del formulario
    const positionSelect = modal.querySelector('#rider-position-select');
    const specificContainer = modal.querySelector('#specific-position-container');
    const specificInput = modal.querySelector('#specific-position-input');
    const dorsalInput = modal.querySelector('#rider-dorsal');
    const nameInput = modal.querySelector('#rider-name');
    const surnameInput = modal.querySelector('#rider-surname');
    const chipInput = modal.querySelector('#rider-chip');
    
    // Botones
    const confirmBtn = modal.querySelector('#confirm-add-rider-btn');
    const cancelBtn = modal.querySelector('#cancel-add-rider-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Función auxiliar para inicializar vista previa
    function initializeRiderPreview() {
        // Establecer valores por defecto si no existen
        if (positionSelect) {
            positionSelect.value = 'end';
        }
        
        if (specificInput) {
            specificInput.value = startOrderData.length + 1;
            specificInput.max = startOrderData.length + 1;
            specificInput.min = 1;
        }
        
        if (dorsalInput) {
            dorsalInput.value = findNextAvailableDorsal();
        }
        
        // Actualizar vista previa
        updateRiderPreview();
    }
    
    // Inicializar vista previa
    initializeRiderPreview();
    
    // Actualizar cuando cambia la selección de posición
    if (positionSelect) {
        positionSelect.addEventListener('change', function() {
            if (this.value === 'specific') {
                if (specificContainer) specificContainer.style.display = 'block';
                if (specificInput) specificInput.focus();
            } else {
                if (specificContainer) specificContainer.style.display = 'none';
            }
            updateRiderPreview();
        });
    }
    
    // Actualizar cuando cambian los inputs
    [specificInput, dorsalInput, nameInput, surnameInput, chipInput].forEach(input => {
        if (input) {
            input.addEventListener('input', updateRiderPreview);
            input.addEventListener('change', updateRiderPreview);
        }
    });
    
    // ============================================
    // CONFIGURACIÓN DE BOTONES DE CONFIRMAR Y CANCELAR
    // ============================================
    
    // Confirmar - Añadir corredor
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón confirmar clickeado");
            
            // Obtener datos del formulario
            const positionType = positionSelect ? positionSelect.value : 'end';
            let position;
            
            if (positionType === 'end') {
                position = startOrderData.length + 1;
            } else if (positionType === 'beginning') {
                position = 1;
            } else if (positionType === 'specific') {
                position = specificInput ? parseInt(specificInput.value) || startOrderData.length + 1 : startOrderData.length + 1;
                if (position < 1) position = 1;
                if (position > startOrderData.length + 1) position = startOrderData.length + 1;
            } else {
                position = startOrderData.length + 1;
            }
            
            // Obtener datos del corredor
            const riderData = {
                dorsal: parseInt(dorsalInput.value) || position,
                nombre: nameInput.value.trim(),
                apellidos: surnameInput.value.trim(),
                chip: chipInput.value.trim()
            };
            
            console.log("Datos del corredor:", riderData);
            console.log("Posición:", position);
            
            // Validar dorsal
            const dorsalExistente = startOrderData.find(rider => rider.dorsal == riderData.dorsal);
            if (dorsalExistente) {
                showMessage(`El dorsal ${riderData.dorsal} ya está asignado a otro corredor`, 'warning');
                return;
            }
            
            // Cerrar modal
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            // Añadir corredor
            createNewRiderAtPosition(position, riderData);
        });
    }
    
    // Cancelar - Cerrar modal
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón cancelar clickeado");
            
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        });
    }
    
    // Cerrar con la X
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log("Botón cerrar clickeado");
            
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        });
    }
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
            
            showMessage('Operación cancelada', 'info');
        }
    });
    
    // Prevenir que el evento se propague al contenido
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Añadir estilos si no existen
    addRiderPositionStyles();
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
    const modal = document.getElementById('rider-position-modal');
    if (!modal) return;
    
    // Elementos de posición
    const positionSelect = modal.querySelector('#rider-position-select');
    const specificInput = modal.querySelector('#specific-position-input');
    
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
    
    // Calcular posición
    let position;
    const positionType = positionSelect ? positionSelect.value : 'end';
    
    if (positionType === 'end') {
        position = startOrderData.length + 1;
    } else if (positionType === 'beginning') {
        position = 1;
    } else if (positionType === 'specific') {
        position = specificInput ? parseInt(specificInput.value) || startOrderData.length + 1 : startOrderData.length + 1;
        if (position < 1) position = 1;
        if (position > startOrderData.length + 1) position = startOrderData.length + 1;
    } else {
        position = startOrderData.length + 1;
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
    if (specificInput) {
        specificInput.max = startOrderData.length + 1;
        if (positionType === 'specific') {
            specificInput.value = position;
        }
    }
    
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
    
    // Variables para el nuevo corredor
    let cronoSalida = '00:00:00';
    let horaSalida = '09:00:00';
    let diferencia = '00:01:00 (+)'; // Diferencia por defecto
    let cronoSegundos = 0;
    let horaSegundos = 0;
    
    // Si hay corredores existentes, calcular basándose en ellos
    if (startOrderData.length > 0) {
        if (position === 1) {
            // Insertar al principio - usar la hora de inicio del input
            horaSalida = document.getElementById('first-start-time').value || '09:00:00';
            horaSegundos = timeToSeconds(horaSalida);
            diferencia = '00:00:00';
            
            console.log(`Añadiendo al principio. Hora: ${horaSalida}`);
        } else {
            // Insertar en medio o al final
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
    
    // Crear nuevo corredor
    const nuevoCorredor = {
        order: position,
        dorsal: riderData.dorsal || position,
        
        // Campos principales (calculados arriba)
        cronoSalida: cronoSalida,
        horaSalida: horaSalida,
        diferencia: diferencia,
        
        // Datos personales
        nombre: riderData.nombre || '',
        apellidos: riderData.apellidos || '',
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
        horaSalidaImportado: nuevoCorredor.horaSalidaImportado,  // ✅ VACÍO
        cronoSalidaImportado: nuevoCorredor.cronoSalidaImportado // ✅ VACÍO
    });
    
    // Insertar corredor
    startOrderData.splice(position - 1, 0, nuevoCorredor);
    
    // Recalcular órdenes de todos los corredores
    for (let i = 0; i < startOrderData.length; i++) {
        startOrderData[i].order = i + 1;
    }
    
    // ✅ Recalcular corredores posteriores si los hay
    if (position < startOrderData.length) {
        recalculateFollowingRiders(position + 1);
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
    console.log(`=== Recalculando corredores desde posición ${fromPosition} ===`);
    
    if (fromPosition > startOrderData.length) {
        console.log('No hay corredores para recalcular');
        return;
    }
    
    // Ajustar fromPosition para que sea base 0
    const startIndex = Math.max(1, fromPosition - 1); // Empezar desde el corredor después del insertado
    
    for (let i = startIndex; i < startOrderData.length; i++) {
        const corredorActual = startOrderData[i];
        const corredorAnterior = startOrderData[i - 1];
        
        // 1. Actualizar orden
        corredorActual.order = i + 1;
        
        // 2. ✅ USAR la diferencia del corredor actual (NO cambiarla)
        // Si no tiene diferencia, usar la del anterior
        if (!corredorActual.diferencia || corredorActual.diferencia === '' || corredorActual.diferencia === '00:00:00') {
            corredorActual.diferencia = corredorAnterior.diferencia || '00:01:00 (+)';
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
        
        // 4. Calcular nuevos valores basados en el anterior + diferencia
        // Crono salida: crono del anterior + diferencia
        const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
        corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
        corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
        
        // Hora salida: hora del anterior + diferencia
        const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
        corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
        corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
        
        // 5. ✅ Actualizar campos previstas (iguales a los principales)
        corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
        corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
        
        // 6. ✅ NO modificar campos importados - PRESERVAR valores existentes
        console.log(`  ${corredorActual.order}: horaSalidaImportado="${corredorActual.horaSalidaImportado}", cronoSalidaImportado="${corredorActual.cronoSalidaImportado}"`);
        
        // 7. ✅ NO modificar campos reales - PRESERVAR valores existentes
        console.log(`  ${corredorActual.order}: horaSalidaReal="${corredorActual.horaSalidaReal}", cronoSalidaReal="${corredorActual.cronoSalidaReal}"`);
        
        // 8. Actualizar diferenciaSegundos
        if (!corredorActual.diferenciaSegundos || corredorActual.diferenciaSegundos === 0) {
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
        }
        
        console.log(`Corredor ${i + 1} recalculado: ${corredorActual.horaSalida} (+${diferencia})`);
    }
    
    console.log(`=== Recalculo completado para ${startOrderData.length - startIndex} corredores ===`);
    
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
