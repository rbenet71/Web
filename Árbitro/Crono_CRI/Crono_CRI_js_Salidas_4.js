// ============================================
// ARCHIVO: Crono_CRI_js_Salidas_4.js
// ============================================
// DESCRIPCIÓN: Sistema avanzado de edición y confirmación de cambios
// RESPONSABILIDADES:
//   1. Modal de confirmación para cambios de diferencia
//   2. Actualización en cascada inteligente preservando campos importantes
//   3. Sistema de validación mejorado para formatos de tiempo
//   4. Estilos específicos para modales y edición
//   5. Escape de HTML para seguridad
//   6. Funciones auxiliares de conversión tiempo↔segundos
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - guardarDiferencia()              - Guarda diferencia con confirmación modal
//   - actualizarTiemposDesdeCorredor() - Recalcula desde posición específica
//   - reorganizeRiders()               - Reorganiza corredores al cambiar orden
//   - recalculateAllStartTimes()       - Recalcula todas las horas
// 
// PROTECCIONES IMPLEMENTADAS:
//   ✓ Modales de confirmación para cambios críticos
//   ✓ Preservación de campos importados y reales
//   ✓ Validación estricta de formatos de entrada
//   ✓ Control de múltiples llamadas simultáneas
// 
// ARCHIVOS RELACIONADOS:
//   ← Salidas_1.js: Usa secondsToTime()
//   ← Salidas_2.js: Recibe llamadas de startDiferenciaEditing()
//   ← Salidas_3.js: Es llamado por recalculateFollowingRiders()
//   → Todos: Proporciona funciones auxiliares de formato
// ============================================
// ============================================
// FUNCIÓN PARA MANEJAR CELDAS EDITABLES (MODIFICADA)
// ============================================

function handleTableCellClick(e) {
    // SOLO permitir edición de campos específicos
    const allowedFields = ['dorsal', 'diferencia', 'nombre', 'apellidos', 'chip', 'categoria', 'equipo', 'licencia'];

    
    const cell = e.target;
    
    // Verificar si es un campo editable permitido
    if (!cell.classList.contains('editable') || !cell.hasAttribute('data-field')) {
        return;
    }
    
    const field = cell.getAttribute('data-field');
    
    // Si no está en la lista de campos permitidos, no permitir edición
    if (!allowedFields.includes(field)) {
        return;
    }
    
    // Si ya está editando, no hacer nada
    if (cell.classList.contains('editing')) return;
    
    const row = cell.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));
    
    // Comenzar edición
    if (field === 'diferencia') {
        // Manejo especial para diferencia
        handleTableCellClickForDiferencia(cell, cell.querySelector('.diferencia') || cell);
    } else {
        startCellEditing(cell, index, field);
    }
}

function startCellEditing(cell, index, field) {
    const originalValue = cell.textContent.trim();
    
    // Crear input para edición
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    input.className = 'cell-edit-input';
    
    // Estilos específicos según el campo
    if (field === 'order' || field === 'dorsal') {
        input.type = 'number';
        input.min = '1';
    } else if (field.includes('time') || field.includes('crono')) {
        input.placeholder = 'HH:MM:SS';
        input.pattern = '([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]';
    }
    
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
        finishCellEditing(cell, index, field, this.value);
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishCellEditing(cell, index, field, this.value);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelCellEditing(cell, originalValue);
        }
    });
}

function finishCellEditing(cell, index, field, newValue) {
    const originalValue = cell.getAttribute('data-original-value');
    
    // Si no hubo cambios, cancelar
    if (newValue === originalValue) {
        cancelCellEditing(cell, originalValue);
        return;
    }
    
    // Validar según el campo
    if (!validateFieldValue(field, newValue)) {
        const t = translations[appState.currentLanguage];
        showMessage(t.invalidValue || 'Valor inválido', 'error');
        cancelCellEditing(cell, originalValue);
        return;
    }
    
    // Actualizar los datos
    if (index >= 0 && index < startOrderData.length) {
        const rider = startOrderData[index];
        
        // Guardar valor anterior para cálculos
        const oldValue = rider[field];
        
        // Actualizar campo
        if (field === 'order' || field === 'dorsal') {
            rider[field] = parseInt(newValue) || 0;
        } else if (field.includes('time') || field.includes('crono')) {
            // Asegurar formato HH:MM:SS
            if (newValue && !newValue.includes(':')) {
                // Si solo es un número, interpretar como segundos
                const seconds = parseInt(newValue) || 0;
                if (seconds > 0) {
                    newValue = secondsToTime(seconds);
                } else {
                    newValue = '00:00:00';
                }
            } else if (newValue && newValue.length === 5) {
                // Formato HH:MM -> agregar :00
                newValue += ':00';
            }
            rider[field] = newValue;
        } else {
            rider[field] = newValue;
        }
        
        // Si es un campo de tiempo, actualizar campos relacionados
        if (field === 'horaSalida') {
            // Actualizar segundos
            rider.horaSegundos = timeToSeconds(newValue);
            
            // Actualizar hora prevista si está vacía
            if (!rider.horaSalidaPrevista || rider.horaSalidaPrevista === '00:00:00') {
                rider.horaSalidaPrevista = newValue;
            }
            
            // Actualizar hora real si es igual a la anterior
            if (rider.horaSalidaReal === oldValue) {
                rider.horaSalidaReal = newValue;
                rider.horaSalidaRealSegundos = rider.horaSegundos;
            }
            
            // Recalcular corredores siguientes si cambió la hora
            if (newValue !== oldValue) {
                recalculateFollowingRiders(index + 2); // +2 porque index es base 0
            }
        } 
        else if (field === 'order') {
            // Si cambia el orden, reorganizar la lista
            reorganizeRiders(index, parseInt(newValue));
        }
        else if (field === 'cronoSalida') {
            rider.cronoSegundos = timeToSeconds(newValue);
            
            // Actualizar crono previsto si está vacío
            if (!rider.cronoSalidaPrevista || rider.cronoSalidaPrevista === '00:00:00') {
                rider.cronoSalidaPrevista = newValue;
            }
            
            // Actualizar crono real si es igual al anterior
            if (rider.cronoSalidaReal === oldValue) {
                rider.cronoSalidaReal = newValue;
                rider.cronoSalidaRealSegundos = rider.cronoSegundos;
            }
        }
        else if (field === 'horaSalidaReal') {
            rider.horaSalidaRealSegundos = timeToSeconds(newValue);
        }
        else if (field === 'cronoSalidaReal') {
            rider.cronoSalidaRealSegundos = timeToSeconds(newValue);
        }
        else if (field === 'dorsal') {
            // Actualizar display si dorsal sigue secuencia
            if (rider.dorsal === index + 1) {
                rider.dorsal = parseInt(newValue);
            }
        }
        
        // Actualizar UI completamente
        updateStartOrderUI();
        
        // Guardar datos
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
    }
    
    // Finalizar edición visualmente
    cell.classList.remove('editing');
    cell.removeAttribute('data-original-value');
    cell.textContent = newValue;
}

function cancelCellEditing(cell, originalValue) {
    cell.classList.remove('editing');
    cell.removeAttribute('data-original-value');
    cell.textContent = originalValue;
}

function validateFieldValue(field, value) {
    if (!value && value !== '') return false;
    
    if (field === 'order' || field === 'dorsal') {
        const num = parseInt(value);
        return !isNaN(num) && num > 0;
    } else if (field.includes('time') || field.includes('crono')) {
        return validateTime(value);
    }
    
    return true;
}

function reorganizeRiders(changedIndex, newOrder) {
    console.log(`Reorganizando corredores: índice ${changedIndex} -> orden ${newOrder}`);
    
    if (newOrder < 1) newOrder = 1;
    if (newOrder > startOrderData.length) newOrder = startOrderData.length;
    
    const rider = startOrderData[changedIndex];
    const currentOrder = rider.order;
    
    // Si el orden no cambió realmente
    if (currentOrder === newOrder) {
        console.log('Orden no cambió, saliendo...');
        return;
    }
    
    console.log(`Moviendo corredor ${rider.dorsal} de orden ${currentOrder} a ${newOrder}`);
    
    // Remover el corredor de su posición actual
    startOrderData.splice(changedIndex, 1);
    
    // Encontrar nueva posición basada en el nuevo orden
    const newIndex = newOrder - 1;
    
    // Insertar en nueva posición
    startOrderData.splice(newIndex, 0, rider);
    
    // Recalcular todos los órdenes
    startOrderData.forEach((r, index) => {
        const oldOrder = r.order;
        r.order = index + 1;
        
        console.log(`Corredor ${r.dorsal}: orden ${oldOrder} -> ${r.order}`);
        
        // Si el dorsal sigue la secuencia, actualizarlo
        if (r.dorsal === oldOrder || r.dorsal === 0) {
            r.dorsal = r.order;
        }
    });
    
    // Recalcular todas las horas basadas en el nuevo orden
    recalculateAllStartTimes();
    
    console.log('Reorganización completada');
}

function recalculateAllStartTimes() {
    console.log('Recalculando TODAS las horas de salida...');
    
    if (startOrderData.length === 0) return;
    
    // Obtener hora de inicio del input
    const firstTimeInput = document.getElementById('first-start-time');
    const firstTime = firstTimeInput ? firstTimeInput.value : '09:00:00';
    
    // Validar formato
    let formattedFirstTime = firstTime;
    if (!formattedFirstTime.includes(':')) {
        formattedFirstTime = '09:00:00';
    } else if (formattedFirstTime.length === 5) {
        formattedFirstTime += ':00';
    }
    
    console.log(`Hora de inicio: ${formattedFirstTime}`);
    
    // Calcular para cada corredor
    startOrderData.forEach((corredor, index) => {
        // Calcular diferencia acumulada en segundos
        const diferenciaSegundos = index * 60; // 60 segundos por posición de diferencia
        
        // Calcular hora de salida
        const horaSegundos = timeToSeconds(formattedFirstTime) + diferenciaSegundos;
        
        // Actualizar campos del corredor
        corredor.horaSalida = secondsToTime(horaSegundos);
        corredor.horaSegundos = horaSegundos;
        
        // Crono salida (tiempo desde el inicio de la carrera)
        corredor.cronoSalida = secondsToTime(diferenciaSegundos);
        corredor.cronoSegundos = diferenciaSegundos;
        
        // Actualizar campos previstos si están vacíos
        if (!corredor.horaSalidaPrevista || corredor.horaSalidaPrevista === '00:00:00') {
            corredor.horaSalidaPrevista = corredor.horaSalida;
        }
        
        if (!corredor.cronoSalidaPrevista || corredor.cronoSalidaPrevista === '00:00:00') {
            corredor.cronoSalidaPrevista = corredor.cronoSalida;
        }
        
        // Actualizar campos reales si están vacíos
        if (!corredor.horaSalidaReal || corredor.horaSalidaReal === '00:00:00') {
            corredor.horaSalidaReal = corredor.horaSalida;
            corredor.horaSalidaRealSegundos = horaSegundos;
        }
        
        if (!corredor.cronoSalidaReal || corredor.cronoSalidaReal === '00:00:00') {
            corredor.cronoSalidaReal = corredor.cronoSalida;
            corredor.cronoSalidaRealSegundos = diferenciaSegundos;
        }
        
        console.log(`Corredor ${index + 1} (${corredor.dorsal}): ${corredor.horaSalida}`);
    });
    
    console.log('Recálculo completo de horas');
}

function setupRiderModalResize() {
    let resizeTimer;
    
    function adjustModalHeight() {
        const modal = document.getElementById('rider-position-modal');
        if (!modal || !modal.classList.contains('active')) return;
        
        const viewportHeight = window.innerHeight;
        const headerHeight = modal.querySelector('.modal-header')?.offsetHeight || 60;
        const footerHeight = modal.querySelector('.modal-footer')?.offsetHeight || 70;
        const padding = 40; // Padding vertical adicional
        
        const maxBodyHeight = viewportHeight - headerHeight - footerHeight - padding;
        
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.maxHeight = `${Math.max(200, maxBodyHeight)}px`;
        }
    }
    
    // Ajustar al cargar
    setTimeout(adjustModalHeight, 100);
    
    // Ajustar al redimensionar ventana
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustModalHeight, 250);
    });
    
    // Ajustar cuando el modal se hace visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const modal = document.getElementById('rider-position-modal');
                if (modal && modal.classList.contains('active')) {
                    setTimeout(adjustModalHeight, 50);
                }
            }
        });
    });
    
    const modal = document.getElementById('rider-position-modal');
    if (modal) {
        observer.observe(modal, { attributes: true });
    }
}

function calculateStartTimeForPosition(position) {
    if (startOrderData.length === 0) {
        return document.getElementById('first-start-time').value || '09:00:00';
    }
    
    let horaSalida;
    
    if (position === 1) {
        // Primer corredor
        horaSalida = document.getElementById('first-start-time').value || '09:00:00';
    } else if (position <= startOrderData.length) {
        // Insertar en medio
        const corredorAnterior = startOrderData[position - 2];
        horaSalida = corredorAnterior.horaSalida;
    } else {
        // Al final
        const ultimoCorredor = startOrderData[startOrderData.length - 1];
        
        // Calcular diferencia del último intervalo
        let intervalo = 60; // 1 minuto por defecto
        if (startOrderData.length > 1) {
            const ultimoSegundos = timeToSeconds(ultimoCorredor.horaSalida);
            const penultimoSegundos = timeToSeconds(startOrderData[startOrderData.length - 2].horaSalida);
            intervalo = ultimoSegundos - penultimoSegundos;
        }
        
        const nuevaHoraSegundos = timeToSeconds(ultimoCorredor.horaSalida) + intervalo;
        horaSalida = secondsToTime(nuevaHoraSegundos);
    }
    
    return horaSalida;
}

// Añade esto en la función addAlternatingRowStyles o en otro lugar donde añadas estilos
function addCellEditStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .not-editable {
            background-color: #f5f5f5 !important;
            color: #666 !important;
            cursor: not-allowed !important;
            user-select: none !important;
        }
        
        .editable {
            cursor: pointer !important;
            transition: background-color 0.2s !important;
        }
        
        .editable:hover {
            background-color: #e3f2fd !important;
        }
        
        .editing {
            background-color: #fff3cd !important;
            padding: 0 !important;
        }
        
        .cell-edit-input {
            width: 100% !important;
            height: 100% !important;
            border: 2px solid #4dabf7 !important;
            padding: 4px 8px !important;
            font-size: inherit !important;
            font-family: inherit !important;
            box-sizing: border-box !important;
        }
        
        .diferencia.editable {
            cursor: pointer !important;
            border: 1px dashed #ccc !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
        }
        
        .diferencia.editable:hover {
            background-color: #e3f2fd !important;
            border-color: #4dabf7 !important;
        }
        
        /* Colores para diferencias */
        .diferencia.positiva {
            color: #28a745 !important;
            font-weight: bold !important;
        }
        
        .diferencia.negativa {
            color: #dc3545 !important;
            font-weight: bold !important;
        }
        
        .diferencia.cero {
            color: #6c757d !important;
        }
        
        .diferencia.vacia {
            color: #adb5bd !important;
            font-style: italic !important;
        }
    `;
    document.head.appendChild(style);
}

// Llama a esta función durante la inicialización
addCellEditStyles();

function addDiferenciaEditStyles() {
    if (document.getElementById('diferencia-edit-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'diferencia-edit-styles';
    style.textContent = `
        .diferencia-edit-container {
            display: flex;
            align-items: center;
            gap: 3px;
            padding: 2px;
            background-color: #fff3cd;
        }
        
        .diferencia.editable {
            cursor: pointer !important;
            border: 1px dashed #ccc !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            min-width: 80px !important;
            display: inline-block !important;
            text-align: center !important;
            font-family: 'Courier New', monospace !important;
            font-weight: bold !important;
            transition: all 0.2s !important;
        }
        
        .diferencia.editable:hover {
            background-color: #e3f2fd !important;
            border-color: #4dabf7 !important;
            transform: scale(1.02);
        }
        
        .diferencia.positiva {
            background-color: #d4edda !important;
            color: #155724 !important;
            border: 1px solid #c3e6cb !important;
        }
        
        .diferencia.negativa {
            background-color: #f8d7da !important;
            color: #721c24 !important;
            border: 1px solid #f5c6cb !important;
        }
        
        .diferencia.cero {
            background-color: #e9ecef !important;
            color: #6c757d !important;
            border: 1px solid #dee2e6 !important;
        }
        
        .diferencia.vacia {
            background-color: #f8f9fa !important;
            color: #adb5bd !important;
            border: 1px dashed #dee2e6 !important;
            font-style: italic !important;
        }
        
        /* Estilos para botones de edición */
        .diferencia-btn {
            min-width: 28px;
            height: 28px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }
        
        .diferencia-btn:hover {
            transform: scale(1.1);
            opacity: 0.9;
        }
        
        .diferencia-btn.positivo {
            background-color: #28a745;
            color: white;
        }
        
        .diferencia-btn.negativo {
            background-color: #dc3545;
            color: white;
        }
        
        .diferencia-btn.cero {
            background-color: #6c757d;
            color: white;
        }
        
        .diferencia-btn.aceptar {
            background-color: #007bff;
            color: white;
        }
        
        .diferencia-btn.cancelar {
            background-color: #ffc107;
            color: #212529;
        }
    `;
    document.head.appendChild(style);
    console.log("Estilos de diferencia añadidos");
}

// Llama a esta función durante la inicialización
addDiferenciaEditStyles();

function formatTimeValue(timeValue) {
    if (!timeValue) return '00:00:00';
    
    // Si ya es string, asegurarse que tenga el formato correcto
    if (typeof timeValue === 'string') {
        const parts = timeValue.split(':');
        if (parts.length === 2) {
            // Formato HH:MM -> agregar segundos
            return timeValue + ':00';
        } else if (parts.length === 3) {
            // Ya tiene formato HH:MM:SS
            return timeValue;
        }
    }
    
    // Si es número, asumir segundos
    if (typeof timeValue === 'number') {
        return secondsToTime(timeValue);
    }
    
    return '00:00:00';
}

function isRealFieldEmpty(fieldValue) {
    // Un campo real se considera vacío si:
    // 1. Es undefined o null
    // 2. Es string vacío
    // 3. Es '00:00:00' (para campos de tiempo)
    return !fieldValue || 
           fieldValue === '' || 
           fieldValue === '00:00:00' ||
           (typeof fieldValue === 'string' && fieldValue.trim() === '');
}
function isFieldPreserved(fieldName, fieldValue, defaultValue = '') {
    // Determina si un campo debe preservarse (no modificarse)
    const preserved = fieldValue && fieldValue !== '' && fieldValue !== defaultValue;
    
    if (preserved) {
        console.log(`  ${fieldName}: PRESERVADO "${fieldValue}"`);
    } else {
        console.log(`  ${fieldName}: VACÍO/por defecto (no se modifica)`);
    }
    
    return preserved;
}

// Versión simplificada usando la función auxiliar:
function recalculateFollowingRidersSimplified(fromPosition) {
    console.log(`Recalculando corredores desde posición ${fromPosition}...`);
    
    if (fromPosition >= startOrderData.length) {
        console.log('No hay corredores para recalcular');
        return;
    }
    
    for (let i = fromPosition; i < startOrderData.length; i++) {
        const corredorActual = startOrderData[i];
        const corredorAnterior = startOrderData[i - 1];
        
        // 1. Actualizar orden
        corredorActual.order = i + 1;
        
        // 2. Determinar diferencia
        let diferencia = corredorActual.diferencia;
        if (!diferencia || diferencia === '' || diferencia === '00:00:00') {
            diferencia = corredorAnterior.diferencia || '00:01:00';
            corredorActual.diferencia = diferencia;
        }
        
        // 3. Calcular diferencia en segundos
        let diferenciaLimpia = diferencia;
        if (diferencia.includes('(+)')) {
            diferenciaLimpia = diferencia.replace('(+)', '').trim();
        } else if (diferencia.includes('(-)')) {
            diferenciaLimpia = diferencia.replace('(-)', '').trim();
        }
        
        const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
        
        // 4. Calcular nuevos valores principales
        const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
        const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
        
        // Crono salida
        corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
        corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
        
        // Hora salida
        corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
        corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
        
        // 5. Actualizar campos previstas
        corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
        corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
        
        // 6. Campos reales SE PRESERVAN - NO SE MODIFICAN
        // horaSalidaReal, cronoSalidaReal, horaSalidaRealSegundos, cronoSalidaRealSegundos
        // permanecen con sus valores actuales
        
        // 7. Campos importados SE PRESERVAN - NO SE MODIFICAN
        // horaSalidaImportado, cronoSalidaImportado permanecen con sus valores actuales
        
        // 8. Actualizar dorsal si sigue secuencia automática
        if (corredorActual.dorsal === i) {
            corredorActual.dorsal = i + 1;
        }
        
        // 9. Actualizar diferenciaSegundos
        if (!corredorActual.diferenciaSegundos || corredorActual.diferenciaSegundos === 0) {
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
        }
    }
    
    console.log(`Recálculo completado. Campos reales e importados preservados.`);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function secondsToTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeStr) {
    if (!timeStr || timeStr === '') return 0;
    
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        formattedTime = '00:00:00';
    }
    
    const parts = formattedTime.split(':');
    if (parts.length === 2) {
        parts.push('00');
    }
    
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    
    return (hours * 3600) + (minutes * 60) + seconds;
}

// Función para obtener el índice original
function getOriginalIndex(order, dorsal) {
    if (!startOrderData || startOrderData.length === 0) return 0;
    
    const originalIndex = startOrderData.findIndex(rider => 
        rider.order == order && rider.dorsal == dorsal
    );
    return originalIndex !== -1 ? originalIndex : 0;
}

// ============================================
// FUNCIÓN PARA AÑADIR ESTILOS DEL MODAL
// ============================================

function addDiferenciaChangeStyles() {
    if (document.getElementById('diferencia-change-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'diferencia-change-styles';
    style.textContent = `
        #diferencia-change-confirm-modal .modal-content {
            max-width: 550px;
        }
        
        .change-summary {
            padding: 10px;
        }
        
        .change-summary h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary);
            border-bottom: 2px solid var(--primary);
            padding-bottom: 8px;
        }
        
        .change-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: var(--border-radius);
            margin-bottom: 20px;
        }
        
        .change-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .change-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        
        .change-label {
            font-weight: 600;
            color: var(--gray-dark);
            flex: 1;
        }
        
        .change-value {
            font-weight: 700;
            font-family: 'Courier New', monospace;
            padding: 6px 10px;
            border-radius: 4px;
            min-width: 120px;
            text-align: center;
        }
        
        .change-value.old {
            background-color: #f8d7da;
            color: #721c24;
            text-decoration: line-through;
        }
        
        .change-value.new {
            background-color: #d4edda;
            color: #155724;
        }
        
        .affected-riders {
            background: #f0f7ff;
            padding: 15px;
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            border-left: 4px solid var(--info);
        }
        
        .affected-riders h5 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--info-dark);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .affected-list {
            margin-top: 10px;
        }
        
        .affected-list p {
            margin: 0 0 15px 0;
            font-size: 0.9rem;
            color: var(--gray-dark);
        }
        
        .field-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .field-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #dee2e6;
        }
        
        .field-item i {
            color: var(--success);
            font-size: 1.1rem;
        }
        
        .field-item span {
            font-weight: 600;
            color: var(--gray-dark);
        }
        
        .warning-text {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 10px;
            background: #fff3cd;
            border-radius: 4px;
            color: #856404;
            font-size: 0.9rem;
            margin-top: 10px;
        }
        
        .warning-text i {
            color: #f39c12;
            margin-top: 2px;
        }
        
        .confirmation-question {
            padding: 15px;
            background: #e8f4fd;
            border-radius: var(--border-radius);
            margin-top: 15px;
            text-align: center;
        }
        
        .confirmation-question p {
            margin: 0 0 10px 0;
        }
        
        .confirmation-question p:last-child {
            margin-bottom: 0;
            color: var(--gray);
            font-size: 0.9rem;
        }
        
        #diferencia-change-confirm-modal .modal-footer {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        @media (max-width: 576px) {
            .change-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
            
            .change-value {
                align-self: stretch;
                text-align: center;
            }
            
            .field-grid {
                grid-template-columns: 1fr;
            }
            
            #diferencia-change-confirm-modal .modal-footer {
                flex-direction: column;
            }
            
            #diferencia-change-confirm-modal .modal-footer button {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// FUNCIÓN GUARDAR DIFERENCIA CORREGIDA
// ============================================

function guardarDiferencia(index) {
    console.log("=== guardarDiferencia llamada ===");
    console.log("Índice:", index);
    
    const t = translations[appState.currentLanguage];
    
    // Obtener el input y su valor
    const inputElement = document.querySelector(`.diferencia-input[data-index="${index}"]`);
    if (!inputElement) {
        console.error("Input no encontrado para índice:", index);
        return;
    }
    
    // Obtener la celda para restaurar si es necesario
    const cell = document.querySelector(`.diferencia-cell[data-index="${index}"]`);
    const originalHTML = cell ? cell.getAttribute('data-original-html') : null;
    const originalValue = cell ? cell.getAttribute('data-original-value') : null;
    
    let valor = inputElement.value.trim();
    console.log("Valor del input:", valor);
    
    // Si el input está vacío, establecer diferencia a 0
    if (valor === '' || valor === '00:00:00' || valor === '0') {
        valor = '00:00:00';
        console.log("Valor vacío, establecido a 00:00:00");
    }
    
    // Validar el formato si hay valor
    let segundos = 0;
    let formatoValido = true;
    let mensajeError = '';
    
    if (valor && valor !== '00:00:00') {
        console.log("Validando valor:", valor);
        
        // Intentar parsear diferentes formatos
        // Formato "MM:SS"
        if (/^\d{1,3}:\d{2}$/.test(valor)) {
            const partes = valor.split(':');
            const minutos = parseInt(partes[0]) || 0;
            const segs = parseInt(partes[1]) || 0;
            segundos = (minutos * 60) + segs;
            console.log("Formato MM:SS detectado:", minutos, "min", segs, "seg ->", segundos, "segundos");
        }
        // Formato "HH:MM:SS"
        else if (/^\d{1,3}:\d{2}:\d{2}$/.test(valor)) {
            const partes = valor.split(':');
            const horas = parseInt(partes[0]) || 0;
            const minutos = parseInt(partes[1]) || 0;
            const segs = parseInt(partes[2]) || 0;
            segundos = (horas * 3600) + (minutos * 60) + segs;
            console.log("Formato HH:MM:SS detectado:", horas, "h", minutos, "min", segs, "seg ->", segundos, "segundos");
        }
        // Solo número (asumir segundos)
        else if (/^\d+$/.test(valor)) {
            segundos = parseInt(valor) || 0;
            console.log("Número detectado, interpretado como segundos:", segundos);
        } else {
            formatoValido = false;
            mensajeError = t.enterValidTime || 'Formato inválido. Use MM:SS o HH:MM:SS';
            console.log("Formato no reconocido:", valor);
        }
    }
    
    // Si el formato no es válido, mostrar error
    if (!formatoValido) {
        showMessage(mensajeError, 'error');
        // Restaurar celda
        if (cell && originalHTML) {
            cell.classList.remove('editing');
            cell.innerHTML = originalHTML;
        }
        return;
    }
    
    // Preparar el valor para mostrar
    let valorFormateado = valor;
    if (valor && valor !== '00:00:00' && segundos > 0) {
        // Convertir segundos a formato HH:MM:SS
        const horas = Math.floor(segundos / 3600);
        const minutos = Math.floor((segundos % 3600) / 60);
        const segs = segundos % 60;
        valorFormateado = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
        console.log("Convertido a formato HH:MM:SS:", valorFormateado);
    }
    
    // Determinar signo
    let signo = '+';
    const userInput = inputElement.value.trim();
    if (userInput.startsWith('-') || userInput.includes('(-)')) {
        signo = '-';
        console.log("Signo negativo detectado");
    } else if (userInput.startsWith('+') || userInput.includes('(+)')) {
        signo = '+';
        console.log("Signo positivo detectado");
    }
    
    // Determinar texto a mostrar (con o sin signo)
    let textoDiferencia;
    if (valorFormateado === '00:00:00') {
        textoDiferencia = '00:00:00';
    } else {
        if (userInput.includes('(+)') || userInput.includes('(-)')) {
            textoDiferencia = valorFormateado + (signo === '+' ? ' (+)' : ' (-)');
        } else if (userInput.startsWith('+') || userInput.startsWith('-')) {
            textoDiferencia = valorFormateado + (signo === '+' ? ' (+)' : ' (-)');
        } else {
            textoDiferencia = valorFormateado + ' (+)';
        }
    }
    
    // Obtener datos actuales del corredor
    if (index < 0 || index >= startOrderData.length) {
        console.error("Índice fuera de rango:", index);
        showMessage('Error: Índice de corredor inválido', 'error');
        if (cell && originalHTML) {
            cell.classList.remove('editing');
            cell.innerHTML = originalHTML;
        }
        return;
    }
    
    const riderActual = startOrderData[index];
    const diferenciaActual = riderActual.diferencia || '00:00:00';
    
    // Si la diferencia no cambió, no hacer nada
    if (textoDiferencia === diferenciaActual) {
        console.log("Diferencia no cambió, saliendo...");
        // Restaurar celda
        if (cell) {
            cell.classList.remove('editing');
            const diferenciaClass = diferenciaActual.includes('(-)') ? 'negativa' : 
                                  diferenciaActual.includes('(+)') ? 'positiva' : 
                                  diferenciaActual === '00:00:00' ? 'cero' : 'vacia';
            let displayValue = diferenciaActual;
            if (diferenciaActual === '' || diferenciaActual === '--:--:--') {
                displayValue = '--:--:--';
            }
            cell.innerHTML = `<span class="diferencia ${diferenciaClass}" data-value="${diferenciaActual}">${displayValue}</span>`;
        }
        return;
    }
    
    // ============================================
    // MOSTRAR MODAL DE CONFIRMACIÓN
    // ============================================
    
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.id = 'diferencia-change-confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> ${t.confirmDifferenceChange || 'Confirmar Cambio de Diferencia'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="change-summary">
                    <h4>${t.changeSummary || 'Resumen del Cambio'}</h4>
                    
                    <div class="change-details">
                        <div class="change-row">
                            <span class="change-label">${t.rider || 'Corredor'}:</span>
                            <span class="change-value">${riderActual.order} - ${riderActual.nombre || ''} ${riderActual.apellidos || ''} (Dorsal: ${riderActual.dorsal})</span>
                        </div>
                        
                        <div class="change-row">
                            <span class="change-label">${t.currentDifference || 'Diferencia Actual'}:</span>
                            <span class="change-value old">${diferenciaActual}</span>
                        </div>
                        
                        <div class="change-row">
                            <span class="change-label">${t.newDifference || 'Nueva Diferencia'}:</span>
                            <span class="change-value new">${textoDiferencia}</span>
                        </div>
                    </div>
                    
                    <div class="affected-riders">
                        <h5><i class="fas fa-users"></i> ${t.whatWillChange || '¿Qué se actualizará?'}</h5>
                        <div class="affected-list">
                            <p>${t.followingFieldsWillUpdate || 'Se actualizarán los siguientes campos:'}</p>
                            <div class="field-grid">
                                <div class="field-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${t.startTime || 'Hora Salida'}</span>
                                </div>
                                <div class="field-item">
                                    <i class="fas fa-stopwatch"></i>
                                    <span>${t.cronoStart || 'Crono Salida'}</span>
                                </div>
                                <div class="field-item">
                                    <i class="fas fa-clock"></i>
                                    <span>${t.expectedStartTime || 'Hora Salida Prevista'}</span>
                                </div>
                                <div class="field-item">
                                    <i class="fas fa-stopwatch"></i>
                                    <span>${t.expectedCrono || 'Crono Salida Prevista'}</span>
                                </div>
                            </div>
                            <p class="warning-text">
                                <i class="fas fa-exclamation-circle"></i>
                                ${t.allFollowingRidersWillUpdate || 'Estos cambios también afectarán a todos los corredores siguientes.'}
                            </p>
                        </div>
                    </div>
                    
                    <div class="confirmation-question">
                        <p><strong>${t.keepChangeQuestion || '¿Quieres mantener este cambio?'}</strong></p>
                        <p>${t.keepChangeDescription || 'Si confirmas, se actualizarán todas las horas de salida y crono de salida basadas en la nueva diferencia.'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-difference-change-btn">
                    <i class="fas fa-check"></i>
                    ${t.yesKeepChange || 'Sí, mantener cambio'}
                </button>
                <button class="btn btn-danger" id="discard-difference-change-btn">
                    <i class="fas fa-times"></i>
                    ${t.noDiscardChange || 'No, descartar cambio'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Añadir estilos si no existen
    addDiferenciaChangeStyles();
    
    // Configurar eventos del modal
    const confirmBtn = modal.querySelector('#confirm-difference-change-btn');
    const discardBtn = modal.querySelector('#discard-difference-change-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Función para cerrar y limpiar el modal
    const cerrarModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    };
    
    // Función para aplicar los cambios (SÍ, mantener cambio)
    const aplicarCambios = () => {
        console.log("Aplicando cambios de diferencia...");
        
        // Actualizar datos del corredor actual
        const rider = startOrderData[index];
        
        // Guardar diferencia
        if (valorFormateado === '00:00:00') {
            rider.diferencia = '00:00:00';
            rider.diferenciaSegundos = 0;
            console.log("Diferencia establecida a 00:00:00");
        } else {
            rider.diferencia = textoDiferencia;
            rider.diferenciaSegundos = segundos * (signo === '+' ? 1 : -1);
            console.log("Diferencia establecida:", rider.diferencia, "Segundos:", rider.diferenciaSegundos);
        }
        
        // Recalcular los tiempos de este corredor y los siguientes
        console.log("Recalculando tiempos desde corredor", index + 1);
        actualizarTiemposDesdeCorredor(index);
        
        // ✅ Actualizar UI y guardar
        console.log("Actualizando UI...");
        updateStartOrderUI();
        if (typeof saveStartOrderData === 'function') {
            console.log("Guardando datos...");
            saveStartOrderData();
        }
        
        showMessage(t.differenceUpdated || 'Diferencia actualizada correctamente', 'success');
        console.log("Operación completada con éxito");
        
        cerrarModal();
    };
    
    // Función para descartar los cambios (NO, descartar cambio)
    const descartarCambios = () => {
        console.log("Descartando cambios de diferencia");
        // Restaurar celda al valor anterior
        if (cell) {
            cell.classList.remove('editing');
            // Restaurar el valor anterior
            const originalValue = diferenciaActual;
            const diferenciaClass = originalValue.includes('(-)') ? 'negativa' : 
                                  originalValue.includes('(+)') ? 'positiva' : 
                                  originalValue === '00:00:00' ? 'cero' : 'vacia';
            
            let displayValue = originalValue;
            if (originalValue === '' || originalValue === '--:--:--') {
                displayValue = '--:--:--';
            }
            
            cell.innerHTML = `<span class="diferencia ${diferenciaClass}" data-value="${originalValue}">${displayValue}</span>`;
        }
        
        cerrarModal();
        showMessage(t.changeDiscarded || 'Cambio descartado', 'info');
    };
    
    // Configurar eventos
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        aplicarCambios();
    });
    
    discardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        descartarCambios();
    });
    
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        descartarCambios();
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            descartarCambios();
        }
    });
    
    // Prevenir propagación en el contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

// ============================================
// FUNCIÓN MEJORADA PARA ACTUALIZAR TIEMPOS
// ============================================

function actualizarTiemposDesdeCorredor(startIndex) {
    console.log(`=== actualizarTiemposDesdeCorredor llamada desde índice ${startIndex} ===`);
    
    if (startIndex < 0 || startIndex >= startOrderData.length) {
        console.error("Índice inicial inválido:", startIndex);
        return;
    }
    
    // Empezar desde el corredor actual (no desde el siguiente)
    for (let i = startIndex; i < startOrderData.length; i++) {
        const corredorActual = startOrderData[i];
        const corredorAnterior = i > 0 ? startOrderData[i - 1] : null;
        
        console.log(`Procesando corredor ${i + 1} (Dorsal: ${corredorActual.dorsal})`);
        
        // Si es el primer corredor
        if (i === 0) {
            // Primer corredor siempre tiene diferencia 00:00:00
            corredorActual.diferencia = '00:00:00';
            corredorActual.diferenciaSegundos = 0;
            
            // Hora de inicio del primer corredor (se toma del input)
            const firstStartTime = document.getElementById('first-start-time').value || '09:00:00';
            corredorActual.horaSegundos = timeToSeconds(firstStartTime);
            corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
            
            // Crono siempre 00:00:00 para primer corredor
            corredorActual.cronoSegundos = 0;
            corredorActual.cronoSalida = '00:00:00';
            
            // Actualizar campos previstos
            corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
            corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
            
            console.log(`  Primer corredor: Hora: ${corredorActual.horaSalida}, Crono: ${corredorActual.cronoSalida}`);
            
        } else if (corredorAnterior) {
            // Obtener diferencia del corredor actual
            let diferencia = corredorActual.diferencia;
            
            // Si no tiene diferencia, usar valor por defecto (1 minuto)
            if (!diferencia || diferencia === '' || diferencia === '00:00:00') {
                diferencia = '00:01:00 (+)'; // Valor por defecto
                corredorActual.diferencia = diferencia;
                console.log(`  Usando diferencia por defecto: ${diferencia}`);
            }
            
            // Calcular diferencia en segundos
            let diferenciaLimpia = diferencia;
            if (diferencia.includes('(+)')) {
                diferenciaLimpia = diferencia.replace('(+)', '').trim();
            } else if (diferencia.includes('(-)')) {
                diferenciaLimpia = diferencia.replace('(-)', '').trim();
            }
            
            const diferenciaSegundos = timeToSeconds(diferenciaLimpia) || 60;
            
            // Actualizar diferenciaSegundos (con signo)
            corredorActual.diferenciaSegundos = diferenciaSegundos;
            if (diferencia.includes('(-)')) {
                corredorActual.diferenciaSegundos = -Math.abs(corredorActual.diferenciaSegundos);
            }
            
            // Calcular nuevos tiempos basados en el corredor anterior
            // Hora Salida: hora del anterior + diferencia
            const horaAnteriorSegundos = corredorAnterior.horaSegundos || timeToSeconds(corredorAnterior.horaSalida) || 0;
            corredorActual.horaSegundos = horaAnteriorSegundos + diferenciaSegundos;
            corredorActual.horaSalida = secondsToTime(corredorActual.horaSegundos);
            
            // Crono Salida: crono del anterior + diferencia
            const cronoAnteriorSegundos = corredorAnterior.cronoSegundos || timeToSeconds(corredorAnterior.cronoSalida) || 0;
            corredorActual.cronoSegundos = cronoAnteriorSegundos + diferenciaSegundos;
            corredorActual.cronoSalida = secondsToTime(corredorActual.cronoSegundos);
            
            // Actualizar campos previstos
            corredorActual.horaSalidaPrevista = corredorActual.horaSalida;
            corredorActual.cronoSalidaPrevista = corredorActual.cronoSalida;
            
            console.log(`  Hora: ${corredorActual.horaSalida} (${horaAnteriorSegundos}s + ${diferenciaSegundos}s)`);
            console.log(`  Crono: ${corredorActual.cronoSalida} (${cronoAnteriorSegundos}s + ${diferenciaSegundos}s)`);
        }
    }
    
    console.log(`=== actualizarTiemposDesdeCorredor completada para ${startOrderData.length - startIndex} corredores ===`);
}

// ============================================
// MODIFICAR startDiferenciaEditing para evitar múltiples llamadas
// ============================================

function startDiferenciaEditing(cell, index, currentValue) {
    console.log("=== startDiferenciaEditing llamada ===");
    console.log("Celda:", cell);
    console.log("Índice:", index);
    console.log("Valor actual:", currentValue);
    
    // Si ya está editando, salir
    if (cell.classList.contains('editing')) {
        console.log("Ya está en edición, saliendo");
        return;
    }
    
    // Guardar HTML original
    const originalHTML = cell.innerHTML;
    const originalValue = cell.querySelector('.diferencia')?.getAttribute('data-value') || currentValue;
    
    // Guardar en la celda para restaurar si es necesario
    cell.setAttribute('data-original-html', originalHTML);
    cell.setAttribute('data-original-value', originalValue);
    
    console.log("HTML original guardado:", originalHTML);
    console.log("Valor original guardado:", originalValue);
    
    // Crear input simple para edición directa
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    input.className = 'diferencia-input';
    input.placeholder = 'MM:SS o HH:MM:SS';
    input.setAttribute('data-index', index);
    input.style.cssText = 'width: 100%; height: 100%; padding: 4px 8px; border: 2px solid #4dabf7; border-radius: 4px; font-family: "Courier New", monospace; font-size: 14px; box-sizing: border-box;';
    console.log("Input creado con valor:", currentValue);
    
    // Reemplazar contenido de la celda
    cell.innerHTML = '';
    cell.appendChild(input);
    cell.classList.add('editing');
    console.log("Celda actualizada con modo edición");
    
    // Variable para controlar múltiples llamadas
    let guardando = false;
    
    // Enfocar el input y seleccionar todo el texto
    setTimeout(() => {
        input.focus();
        input.select();
        console.log("Input enfocado y seleccionado");
    }, 10);
    
    // Función para guardar la diferencia (llamará al modal)
    const finalizarEdicion = () => {
        if (guardando) {
            console.log("Ya se está guardando, ignorando llamada duplicada");
            return;
        }
        
        guardando = true;
        console.log("Finalizando edición...");
        
        // Pequeño delay para evitar múltiples llamadas
        setTimeout(() => {
            guardarDiferencia(index);
            guardando = false;
        }, 100);
    };
    
    // Función para cancelar edición
    const cancelarEdicion = () => {
        console.log("Cancelando edición...");
        // Restaurar valor original
        cell.classList.remove('editing');
        cell.innerHTML = originalHTML;
    };
    
    // Eventos del input
    input.addEventListener('keydown', (e) => {
        console.log("Tecla presionada en input:", e.key);
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log("Enter presionado - guardando");
            finalizarEdicion();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            console.log("Escape presionado - cancelando");
            cancelarEdicion();
        }
    });
    
    input.addEventListener('blur', () => {
        console.log("Input perdió el foco - guardando automáticamente");
        // Pequeño delay para manejar clics en otras celdas
        setTimeout(() => {
            if (cell.classList.contains('editing')) {
                finalizarEdicion();
            }
        }, 200); // Aumentado a 200ms para dar tiempo
    });
    
    console.log("=== startDiferenciaEditing completada ===");
}