// ============================================
// ARCHIVO: Crono_CRI_js_Salidas_1.js
// ============================================
// DESCRIPCIÓN: Núcleo del módulo de salidas
// RESPONSABILIDADES:
//   1. Sistema completo de cuenta atrás con sonidos y modos visuales
//   2. Gestión de salidas registradas (departures) con tabla ordenable
//   3. Sistema de intervalos múltiples para diferentes rangos de corredores
//   4. Plantillas Excel para orden de salida (generación e importación)
//   5. Procesamiento de datos importados con corrección de formatos
//   6. Funciones auxiliares de formato de tiempo para PDF/Excel
// 
// FUNCIONES CRÍTICAS EXPORTADAS:
//   - registerDeparture()        - Registra salida de corredor
//   - processImportedOrderData() - Procesa Excel importado
//   - createExcelTemplate()      - Genera plantilla Excel
// 
// DEPENDENCIAS: 
//   - appState (global)          - Estado de la aplicación
//   - translations (global)      - Traducciones
//   - XLSX (global)              - Librería Excel
// 
// ARCHIVOS RELACIONADOS:
//   → Salidas_2.js: Usa updateStartOrderUI()
//   → Salidas_3.js: Usa formatTimeValue(), timeToSeconds()
//   → Salidas_4.js: Usa secondsToTime()
// ============================================

// ============================================
// FUNCIONES DE ORDEN DE SALIDA
// ============================================
function createStartOrderTemplate() {
    const t = translations[appState.currentLanguage];
    
    // Mostrar modal de configuración
    document.getElementById('template-config-modal').classList.add('active');
    
    // Configurar botones del modal
    document.getElementById('generate-template-btn').onclick = function() {
        generateTemplateFromUserInput();
    };
    
    document.getElementById('cancel-template-btn').onclick = function() {
        document.getElementById('template-config-modal').classList.remove('active');
    };
    
    document.getElementById('template-config-modal-close').onclick = function() {
        document.getElementById('template-config-modal').classList.remove('active');
    };
}

function generateTemplateFromUserInput() {
    const t = translations[appState.currentLanguage];
    
    // Obtener valores del usuario
    const numCorredores = parseInt(document.getElementById('template-num-corredores').value) || 10;
    const intervalo = document.getElementById('template-intervalo').value || '00:01:00';
    const horaInicio = document.getElementById('template-hora-inicio').value || '09:00:00';
    
    // Validar valores
    if (numCorredores <= 0 || numCorredores > 1000) {
        showMessage(t.enterValidRiders, 'error');
        return;
    }
    
    if (!isValidTime(intervalo)) {
        showMessage(t.enterValidInterval, 'error');
        return;
    }
    
    if (!isValidTime(horaInicio)) {
        showMessage(t.enterValidStartTime, 'error');
        return;
    }
    
    // Cerrar modal
    document.getElementById('template-config-modal').classList.remove('active');
    
    // Crear plantilla Excel
    createExcelTemplate(numCorredores, intervalo, horaInicio);
}


// ============================================
// FUNCIÓN AUXILIAR PARA FORMATEAR TIEMPO PARA PDF (BASE 60)
// ============================================

function formatTimeForPDF(totalSeconds) {
    if (!totalSeconds && totalSeconds !== 0) return '00:00';
    
    // Asegurarnos de que sea un número entero
    const secs = Math.abs(Math.round(totalSeconds));
    
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    
    if (hours > 0) {
        // Si hay horas: formato H:MM:SS
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (minutes > 0 || seconds > 0) {
        // Si solo minutos y segundos: formato MM:SS
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
        // Cero segundos
        return '00:00';
    }
}

// ============================================
// FUNCIÓN PARA PROCESAR DATOS IMPORTADOS Y CORREGIR COLUMNA TIME
// ============================================

function processImportedOrderData(jsonData) {
    const t = translations[appState.currentLanguage];
    
    // 1. VERIFICAR QUE HAY CARRERA ACTUAL
    if (!appState.currentRace) {
        console.error("❌ ERROR: No hay carrera seleccionada para importar datos");
        showMessage("Selecciona una carrera antes de importar", 'error');
        return;
    }
    
    console.log(`📥 Importando datos para carrera: ${appState.currentRace.name} (ID: ${appState.currentRace.id})`);
    
    const headers = jsonData[0];
    const columnIndexes = {};
    
    // Mapear índices de columnas
    headers.forEach((header, index) => {
        if (header) {
            const cleanHeader = header.toString().trim();
            columnIndexes[cleanHeader] = index;
        }
    });
    
    // Procesar filas
    const importedData = [];
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const rider = createRiderFromRow(row, columnIndexes, i);
        importedData.push(rider);
    }
    
    // Ordenar por número de orden
    importedData.sort((a, b) => a.order - b.order);
    
    // ============ VALIDACIÓN 3.0.1: PRIMER CRONO DEBE SER 00:00:00 ============
    if (importedData.length > 0) {
        const primerCorredor = importedData[0];
        const primerCrono = primerCorredor.cronoSalida || primerCorredor.cronoSalidaImportado;
        
        // DEPURACIÓN: Mostrar información detallada
        console.log("🔍 VALIDACIÓN 3.0.1 - Primer corredor (después de applyImportRules):", {
            orden: primerCorredor.order,
            cronoSalida: primerCorredor.cronoSalida,
            cronoSalidaImportado: primerCorredor.cronoSalidaImportado,
            cronoSegundos: primerCorredor.cronoSegundos,
            // Verificar si hay discrepancia entre lo importado y lo calculado
            hayDiscrepancia: (primerCorredor.cronoSalida !== primerCorredor.cronoSalidaImportado && 
                             primerCorredor.cronoSalidaImportado !== '')
        });
        
        // Verificar si el primer crono no es 00:00:00 (ahora respetando valores del Excel)
        const esCronoValido = (primerCrono === "00:00:00" || 
                              primerCrono === "0:00:00" || 
                              primerCrono === "00:00" ||
                              primerCrono === "0:00" ||
                              primerCorredor.cronoSegundos === 0);
        
        if (primerCrono && primerCrono.trim() !== "" && !esCronoValido) {
            // Mostrar mensaje con información clara
            const confirmMessage = t.confirmFirstCrono 
                ? t.confirmFirstCrono.replace('{crono}', primerCrono)
                : `El primer corredor tiene crono "${primerCrono}", no "00:00:00".\n\n¿Qué deseas hacer?\n\n1. Importar tal como está (mantener ${primerCrono})\n2. Normalizar: cambiar solo el primer corredor a 00:00:00\n\nSelecciona "Aceptar" para normalizar o "Cancelar" para importar tal como está.`;
            
            // Mostrar confirmación al usuario
            const userConfirmed = confirm(confirmMessage);
            
            if (userConfirmed) {
                // OPCIÓN 2: Normalizar - Solo cambiar el primer corredor a 00:00:00
                console.log(`🔄 Normalizando: primer corredor de ${primerCrono} → 00:00:00`);
                
                // Cambiar solo el primer corredor
                primerCorredor.cronoSalida = "00:00:00";
                if (primerCorredor.cronoSegundos !== undefined) {
                    primerCorredor.cronoSegundos = 0;
                }
                
                // Asegurar que cronoSalidaImportado también se actualice si existe
                if (primerCorredor.cronoSalidaImportado) {
                    primerCorredor.cronoSalidaImportado = "00:00:00";
                }
                
                console.log(`✅ Solo primer corredor normalizado a 00:00:00`);
                showMessage(`Normalizado: primer corredor ahora es 00:00:00`, 'success');
            } else {
                // OPCIÓN 1: Importar tal como está
                console.log(`⚠️ Importando tal como está: primer crono mantiene ${primerCrono}`);
                showMessage(`Importación completada sin cambios`, 'info');
            }
        } else {
            console.log(`✅ Primer crono válido: ${primerCrono || '(vacío)'}`);
        }
    }
    
    // ASIGNAR A VARIABLE GLOBAL
    startOrderData = importedData;
    
    console.log(`📊 Datos procesados: ${startOrderData.length} corredores para "${appState.currentRace.name}"`);
    
    // ============ GUARDADO EN CARRERA ESPECÍFICA ============
    console.log("💾 GUARDANDO EN CARRERA ESPECÍFICA...");
    
    try {
        // 1. ACTUALIZAR CARRERA ACTUAL EN MEMORIA
        appState.currentRace.startOrder = [...startOrderData];
        appState.currentRace.lastModified = new Date().toISOString();
        appState.currentRace.totalRiders = startOrderData.length;
        
        console.log(`✅ Datos asignados a carrera en memoria: ${startOrderData.length} corredores`);
        
        // 2. GUARDAR EN LOCALSTORAGE ESPECÍFICO DE LA CARRERA
        const raceKey = `race-${appState.currentRace.id}`;
        
        // Obtener datos existentes de la carrera
        let raceData = {};
        const existingData = localStorage.getItem(raceKey);
        if (existingData) {
            try {
                raceData = JSON.parse(existingData);
                console.log(`✅ Datos existentes encontrados para ${raceKey}`);
            } catch (e) {
                console.warn("⚠️ Error parseando datos existentes, creando nuevo");
            }
        }
        
        // Actualizar SOLO el startOrderData (mantener otros datos como salidas, etc.)
        raceData.startOrderData = [...startOrderData];
        raceData.lastImport = new Date().toISOString();
        
        // Guardar en carrera específica
        localStorage.setItem(raceKey, JSON.stringify(raceData));
        console.log(`✅ Guardado en carrera específica (${raceKey}): ${startOrderData.length} corredores`);
        
        // 3. ACTUALIZAR EN ARRAY DE CARRERAS
        const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
        if (raceIndex !== -1) {
            appState.races[raceIndex] = { ...appState.currentRace };
            console.log("✅ Carrera actualizada en array de carreras");
            
            // Guardar array completo
            localStorage.setItem('countdown-races', JSON.stringify(appState.races));
            console.log("✅ Array de carreras guardado");
        }
        
        // 4. LLAMAR A saveRaceData() PARA SINCORNIZACIÓN COMPLETA
        if (typeof saveRaceData === 'function') {
            console.log("💾 Sincronizando con saveRaceData()...");
            saveRaceData();
            console.log("✅ Sincronización completa");
        }
        
        // 5. ELIMINAR DATOS GLOBALES ANTIGUOS (¡EVITA MEZCLA!)
        localStorage.removeItem('cri_start_order_data');
        localStorage.removeItem('start-order-data');
        localStorage.removeItem('cri_start_order_backup_' + Date.now());
        localStorage.removeItem('cri_start_order_data_final');
        console.log("🗑️ Datos globales antiguos eliminados");
        
        console.log("✅ IMPORTACIÓN COMPLETA para carrera específica");
        
    } catch (error) {
        console.error("❌ Error guardando datos en carrera:", error);
        showMessage("Error guardando datos importados", 'error');
        return;
    }
    
    // ============ ACTUALIZACIÓN DE UI ============
    console.log("🔄 Actualizando UI...");
    
    // Actualizar hora de inicio
    if (startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        let horaPrimeraSalida = primerCorredor.horaSalida || primerCorredor.horaSalidaImportado || '09:00:00';
        
        horaPrimeraSalida = formatTimeValue(horaPrimeraSalida);
        
        const firstStartTimeInput = document.getElementById('first-start-time');
        if (firstStartTimeInput) {
            firstStartTimeInput.value = horaPrimeraSalida;
            console.log(`✅ Hora de inicio actualizada: ${horaPrimeraSalida}`);
        }
    }
    
    // Actualizar total de corredores
    const totalCorredores = startOrderData.length;
    
    // Actualizar elementos de total
    const updateElements = [
        'total-corredores-display',
        'total-riders',
        'total-riders-display'
    ];
    
    updateElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'INPUT') {
                element.value = totalCorredores;
            } else {
                element.textContent = totalCorredores;
            }
            console.log(`✅ ${id} = ${totalCorredores}`);
        }
    });
    
    // Forzar actualización de tabla
    console.log("🔄 Actualizando tabla...");
    if (typeof updateStartOrderTable === 'function') {
        // Limpiar throttling pendiente
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
            window.updateStartOrderTableTimeout = null;
        }
        
        updateStartOrderTable();
        console.log("✅ Tabla actualizada");
    }
    
    // Mostrar mensaje
    const message = t.orderImported 
        ? t.orderImported.replace('{count}', startOrderData.length)
        : `Se importaron ${startOrderData.length} corredores a "${appState.currentRace.name}"`;
    
    showMessage(message, 'success');
}

// ============================================
// ✅ NUEVA FUNCIÓN PARA ACTUALIZAR UI DESPUÉS DE IMPORTAR
// ============================================
function updateImportUIAfterProcessing() {
    console.log("🔄 Actualizando UI después de importación...");
    
    // Verificar que hay datos para procesar
    if (!startOrderData || startOrderData.length === 0) {
        console.warn("⚠️ No hay datos para actualizar la UI");
        return;
    }
    
    // Verificar que hay carrera actual
    if (!appState.currentRace) {
        console.error("❌ No hay carrera seleccionada para actualizar UI");
        return;
    }
    
    console.log(`🎯 Actualizando UI para carrera: "${appState.currentRace.name}" (${startOrderData.length} corredores)`);
    
    // 1. Actualizar hora de inicio desde el primer corredor
    if (startOrderData.length > 0) {
        const primerCorredor = startOrderData[0];
        let horaPrimeraSalida = primerCorredor.horaSalida || 
                               primerCorredor.horaSalidaImportado || 
                               primerCorredor.horaSalidaPrevista || 
                               '09:00:00';
        
        // Formatear hora correctamente
        horaPrimeraSalida = formatTimeValue(horaPrimeraSalida);
        
        // Actualizar input de hora de inicio
        const firstStartTimeInput = document.getElementById('first-start-time');
        if (firstStartTimeInput) {
            const horaActual = firstStartTimeInput.value;
            if (horaActual !== horaPrimeraSalida) {
                firstStartTimeInput.value = horaPrimeraSalida;
                console.log(`✅ Hora de inicio actualizada: ${horaPrimeraSalida}`);
                
                // Disparar evento de cambio para actualizar cálculos
                firstStartTimeInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
        
        // También actualizar el campo de hora de salida del primer corredor si existe
        const firstRiderTimeCell = document.querySelector('.start-order-table tbody tr:first-child .hora-salida-cell');
        if (firstRiderTimeCell) {
            firstRiderTimeCell.textContent = horaPrimeraSalida;
        }
    }
    
    // 2. Actualizar total de corredores en múltiples lugares
    const totalCorredores = startOrderData.length;
    console.log(`📊 Total de corredores: ${totalCorredores}`);
    
    // Lista de elementos a actualizar
    const updateElements = [
        { id: 'total-corredores-display', type: 'text' },
        { id: 'total-riders', type: 'input' },
        { id: 'total-riders-display', type: 'text' },
        { id: 'total-corredores-value', type: 'text' },
        { id: 'riders-count', type: 'text' }
    ];
    
    updateElements.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            if (item.type === 'input' && element.tagName === 'INPUT') {
                if (element.value !== totalCorredores.toString()) {
                    element.value = totalCorredores;
                    console.log(`✅ Input ${item.id} actualizado a: ${totalCorredores}`);
                }
            } else {
                if (element.textContent !== totalCorredores.toString()) {
                    element.textContent = totalCorredores;
                    console.log(`✅ Elemento ${item.id} actualizado a: ${totalCorredores}`);
                }
            }
        }
    });
    
    // 3. Actualizar contador en el botón de exportar si existe
    const exportBtn = document.getElementById('export-order-btn');
    if (exportBtn) {
        const badge = exportBtn.querySelector('.badge') || document.createElement('span');
        if (!badge.classList.contains('badge')) {
            badge.className = 'badge';
            exportBtn.appendChild(badge);
        }
        badge.textContent = totalCorredores;
        badge.style.display = totalCorredores > 0 ? 'inline-block' : 'none';
    }
    
    // 4. Actualizar tabla INMEDIATAMENTE (sin throttling para respuesta inmediata)
    console.log("🔄 Actualizando tabla de orden de salida...");
    
    if (typeof updateStartOrderTable === 'function') {
        // Limpiar cualquier throttling pendiente
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
            window.updateStartOrderTableTimeout = null;
        }
        
        // Llamar directamente para respuesta inmediata
        updateStartOrderTable();
        console.log("✅ Tabla actualizada inmediatamente");
        
    } else if (typeof updateStartOrderTableThrottled === 'function') {
        console.log("🔄 Usando versión throttled...");
        
        // Limpiar timeouts existentes
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
        }
        
        // Forzar actualización inmediata
        updateStartOrderTableThrottled(true);
    }
    
    // 5. Actualizar diferencia de tiempo si la función existe
    if (typeof updateTimeDifference === 'function') {
        setTimeout(() => {
            updateTimeDifference();
            console.log("✅ Diferencia de tiempo actualizada");
        }, 150);
    }
    
    // 6. Actualizar display del próximo corredor
    if (typeof updateNextCorredorDisplay === 'function') {
        setTimeout(() => {
            updateNextCorredorDisplay();
            console.log("✅ Display de próximo corredor actualizado");
        }, 200);
    }
    
    // 7. Guardar FINAL en la CARRERA ESPECÍFICA (NO en localStorage global)
    setTimeout(() => {
        try {
            if (appState.currentRace) {
                // Actualizar en memoria
                appState.currentRace.startOrder = [...startOrderData];
                appState.currentRace.totalRiders = startOrderData.length;
                appState.currentRace.lastModified = new Date().toISOString();
                
                // Guardar usando saveRaceData (que guarda en la carrera específica)
                if (typeof saveRaceData === 'function') {
                    saveRaceData();
                    console.log(`✅ Guardado final en carrera: "${appState.currentRace.name}"`);
                } else {
                    // Fallback: guardar manualmente en carrera específica
                    const raceKey = `race-${appState.currentRace.id}`;
                    const existingData = localStorage.getItem(raceKey);
                    let raceData = {};
                    
                    if (existingData) {
                        try {
                            raceData = JSON.parse(existingData);
                        } catch (e) {
                            console.warn("⚠️ Error parseando datos existentes");
                        }
                    }
                    
                    raceData.startOrderData = [...startOrderData];
                    raceData.lastUpdate = new Date().toISOString();
                    
                    localStorage.setItem(raceKey, JSON.stringify(raceData));
                    console.log(`✅ Guardado manual en ${raceKey}`);
                }
                
                // ELIMINAR cualquier dato global antiguo (evitar mezcla)
                localStorage.removeItem('cri_start_order_data_final');
                console.log("🗑️ Datos globales antiguos eliminados");
            }
        } catch (error) {
            console.error("❌ Error en guardado final:", error);
        }
    }, 1000);
    
    // 8. Actualizar título de la tarjeta de gestión
    if (typeof updateRaceManagementCardTitle === 'function') {
        setTimeout(() => {
            updateRaceManagementCardTitle();
            console.log("✅ Título de gestión actualizado");
        }, 300);
    }
    
    // 9. Actualizar estadísticas si existen
    if (typeof updateStartOrderStats === 'function') {
        setTimeout(() => {
            updateStartOrderStats();
            console.log("✅ Estadísticas actualizadas");
        }, 400);
    }
    
    console.log("✅ UI completamente actualizada después de importación");
    
    // 10. Mostrar notificación final
    setTimeout(() => {
        const t = translations[appState.currentLanguage];
        const successMsg = t.importComplete || 'Importación completada correctamente';
        showMessage(`${successMsg} - ${totalCorredores} corredores en "${appState.currentRace.name}"`, 'success', 4000);
    }, 1500);
}
// ============================================
// ✅ FUNCIÓN AUXILIAR PARA FORMATEAR HORA
// ============================================
function formatTimeValue(timeStr) {
    if (!timeStr || timeStr === '') return '00:00:00';
    
    // Convertir a string si es necesario
    timeStr = String(timeStr).trim();
    
    // Si ya está en formato HH:MM:SS, devolverlo
    if (/^\d{1,2}:\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const seconds = parts[2].padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Si está en formato HH:MM, añadir segundos
    if (/^\d{1,2}:\d{1,2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}:00`;
    }
    
    // Si es un número, asumir que son segundos desde medianoche
    if (/^\d+$/.test(timeStr)) {
        const totalSeconds = parseInt(timeStr);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
    
    // Por defecto, devolver 09:00:00
    return '09:00:00';
}
// ============================================
// ✅ AÑADE ESTA NUEVA FUNCIÓN PARA GUARDAR DATOS
// ============================================
function saveImportedDataToStorage() {
    console.log("💾 Guardando datos importados en CARRERA...");
    
    // VERIFICAR QUE HAY CARRERA
    if (!appState.currentRace) {
        console.error("❌ No hay carrera seleccionada");
        return false;
    }
    
    try {
        // 1. Actualizar la carrera actual
        appState.currentRace.startOrder = [...startOrderData];
        
        // 2. Guardar usando saveRaceData (que guarda en la carrera específica)
        if (typeof saveRaceData === 'function') {
            saveRaceData();
            console.log(`✅ Datos guardados en carrera: "${appState.currentRace.name}"`);
        }
        
        // 3. NO guardar en localStorage global - ¡eso causa mezcla!
        // localStorage.removeItem('cri_start_order_data'); // Eliminar si existe
        
        return true;
        
    } catch (error) {
        console.error("❌ Error guardando datos:", error);
        return false;
    }
}
// ============================================
// FUNCIÓN PARA CORREGIR COLUMNA TIME IMPORTADA
// ============================================

function correctImportedTimeColumn(startOrderData, jsonData, columnIndexes) {
    const timeIndex = columnIndexes['TIME'];
    
    startOrderData.forEach((rider, index) => {
        const rowIndex = index + 1; // +1 porque el índice 0 son los headers
        if (rowIndex < jsonData.length) {
            const row = jsonData[rowIndex];
            if (row && timeIndex < row.length) {
                const timeValue = row[timeIndex];
                
                if (timeValue) {
                    // Intentar parsear el tiempo
                    let correctedTime;
                    
                    if (typeof timeValue === 'number') {
                        // Si es número, asumir que son segundos
                        correctedTime = formatTimeForPDF(timeValue);
                    } else if (typeof timeValue === 'string') {
                        // Si es texto, parsearlo
                        const parsedSeconds = parseTimeString(timeValue);
                        correctedTime = formatTimeForPDF(parsedSeconds);
                    } else if (typeof timeValue === 'object' && timeValue.t === 'n') {
                        // Si es objeto de Excel
                        const excelValue = timeValue.v;
                        // Convertir de días Excel a segundos
                        const seconds = Math.round(excelValue * 86400);
                        correctedTime = formatTimeForPDF(seconds);
                    }
                    
                    // Guardar el tiempo corregido
                    if (correctedTime) {
                        rider.timeDisplay = correctedTime;
                        console.log(`Corredor ${rider.order}: TIME corregido de "${timeValue}" a "${correctedTime}"`);
                    }
                }
            }
        }
    });
}

// ============================================
// FUNCIÓN PARA PARSEAR CADENAS DE TIEMPO
// ============================================

function parseTimeString(timeStr) {
    if (!timeStr) return 0;
    
    // Quitar espacios
    timeStr = timeStr.toString().trim();
    
    // Intentar diferentes formatos
    
    // Formato "01:00" (minutos:segundos)
    if (/^\d{1,3}:\d{2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return (minutes * 60) + seconds;
    }
    
    // Formato "1:00:00" (horas:minutos:segundos)
    if (/^\d{1,3}:\d{2}:\d{2}$/.test(timeStr)) {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseInt(parts[2]) || 0;
        return (hours * 3600) + (minutes * 60) + seconds;
    }
    
    // Si es solo un número, asumir minutos
    if (/^\d+$/.test(timeStr)) {
        const minutes = parseInt(timeStr) || 0;
        return minutes * 60;
    }
    
    return 0;
}

function createExcelTemplate(numCorredores, intervalo, horaInicio) {
    const t = translations[appState.currentLanguage];
    
    // Convertir a segundos para cálculos
    const intervaloSeconds = timeToSeconds(intervalo);
    const horaInicioSeconds = timeToSeconds(horaInicio);
    
    // Crear encabezados
    const headers = [
        'Orden', 'Dorsal', 'Crono Salida', 'Hora Salida', 'Diferencia', 'Nombre', 'Apellidos', 'Chip', 
        'Hora Salida Real', 'Crono Salida Real', 
        'Hora Salida Prevista', 'Crono Salida Prevista', 
        'Hora Salida Importado', 'Crono Salida Importado', 
        'Crono Segundos', 'Hora Segundos',
        'Crono Salida Real Segundos', 'Hora Salida Real Segundos'
    ];
    
    // Crear los datos
    const data = [headers];
    
    for (let i = 1; i <= numCorredores; i++) {
        const row = new Array(headers.length).fill('');
        const excelRow = i + 1;
        
        // Orden (A)
        row[0] = i;
        
        // Dorsal (B) - VACÍO
        row[1] = '';  // <-- Cambiado: Vacío en lugar de número
        
        // Crono Salida (C) - FÓRMULA: =SI(A2=1,0,C1+E2)
        if (i === 1) {
            row[2] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[2] = { 
                t: 'n', 
                f: `IF(${XLSX.utils.encode_col(0)}${excelRow}=1,0,${XLSX.utils.encode_col(2)}${excelRow-1}+${XLSX.utils.encode_col(4)}${excelRow})`,
                z: 'hh:mm:ss' 
            };
        }
        
        // Hora Salida (D) - FÓRMULA: =SI(A2=1,hora_inicio,D1+E2)
        if (i === 1) {
            const horaExcel = horaInicioSeconds / 86400;
            row[3] = { t: 'n', v: horaExcel, z: 'hh:mm:ss' };
        } else {
            row[3] = { 
                t: 'n', 
                f: `IF(${XLSX.utils.encode_col(0)}${excelRow}=1,${horaInicioSeconds/86400},${XLSX.utils.encode_col(3)}${excelRow-1}+${XLSX.utils.encode_col(4)}${excelRow})`,
                z: 'hh:mm:ss' 
            };
        }
        
        // Diferencia (E) - VALOR: intervalo (en formato tiempo Excel)
        if (i === 1) {
            row[4] = { t: 'n', v: 0, z: 'hh:mm:ss' };
        } else {
            row[4] = { t: 'n', v: intervaloSeconds / 86400, z: 'hh:mm:ss' };
        }
        
        // Nombre, Apellidos, Chip (F, G, H) - VACÍOS
        row[5] = '';
        row[6] = '';
        row[7] = '';
        
        // Hora Salida Real (I) - VACÍO (para llenar manualmente)
        row[8] = '';
        
        // Crono Salida Real (J) - VACÍO (para llenar manualmente)
        row[9] = '';
        
        // Hora Salida Prevista (K) - VACÍO (para llenar manualmente)
        row[10] = '';
        
        // Crono Salida Prevista (L) - VACÍO (para llenar manualmente)
        row[11] = '';
        
        // Hora Salida Importado (M) - VACÍO
        row[12] = '';
        
        // Crono Salida Importado (N) - VACÍO
        row[13] = '';
        
        // Crono Segundos (O) - FÓRMULA: =HORA(C2)*3600+MINUTO(C2)*60+SEGUNDO(C2)
        row[14] = { 
            t: 'n', 
            f: `HOUR(${XLSX.utils.encode_col(2)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(2)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(2)}${excelRow})`
        };
        
        // Hora Segundos (P) - FÓRMULA: =HORA(D2)*3600+MINUTO(D2)*60+SEGUNDO(D2)
        row[15] = { 
            t: 'n', 
            f: `HOUR(${XLSX.utils.encode_col(3)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(3)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(3)}${excelRow})`
        };
        
        // Crono Salida Real Segundos (Q) - FÓRMULA: =SI(J2="",0,HORA(J2)*3600+MINUTO(J2)*60+SEGUNDO(J2))
        row[16] = { 
            t: 'n', 
            f: `IF(${XLSX.utils.encode_col(9)}${excelRow}="",0,HOUR(${XLSX.utils.encode_col(9)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(9)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(9)}${excelRow}))`
        };
        
        // Hora Salida Real Segundos (R) - FÓRMULA: =SI(I2="",0,HORA(I2)*3600+MINUTO(I2)*60+SEGUNDO(I2))
        row[17] = { 
            t: 'n', 
            f: `IF(${XLSX.utils.encode_col(8)}${excelRow}="",0,HOUR(${XLSX.utils.encode_col(8)}${excelRow})*3600+MINUTE(${XLSX.utils.encode_col(8)}${excelRow})*60+SECOND(${XLSX.utils.encode_col(8)}${excelRow}))`
        };
        
        data.push(row);
    }
    
    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(data, { cellStyles: true });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plantilla Salida");
    
    // Ajustar anchos
    const colWidths = [
        {wch: 8}, {wch: 8}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 15}, {wch: 20}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 12}, {wch: 12}, {wch: 12}, {wch: 12},
        {wch: 12}, {wch: 12}, {wch: 10}, {wch: 10}
    ];
    ws['!cols'] = colWidths;
    
    // Auto-filtro
    ws['!autofilter'] = {
        ref: XLSX.utils.encode_range({
            s: { r: 0, c: 0 },
            e: { r: numCorredores, c: headers.length - 1 }
        })
    };
    
    // Generar nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `plantilla_orden_salida_${numCorredores}_corredores_${dateStr}.xlsx`;
    
    // Guardar archivo
    XLSX.writeFile(wb, filename);
    
    // Mostrar mensaje de éxito
    const message = t.templateCreatedCustom
        .replace('{count}', numCorredores)
        .replace('{interval}', intervalo)
        .replace('{startTime}', horaInicio);
    
    showMessage(message, 'success');
}

// Función auxiliar para convertir tiempo a segundos (debe existir)
function timeToSeconds(timeStr) {
    if (!timeStr) return 0;
    
    // Asegurar formato HH:MM:SS
    let formattedTime = timeStr;
    if (!formattedTime.includes(':')) {
        return parseInt(timeStr) || 0;
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

// Función auxiliar para convertir tiempo a valor de Excel
function timeToExcelValue(timeStr) {
    // En Excel, 1 = 24 horas, 1/24 = 1 hora, 1/1440 = 1 minuto, 1/86400 = 1 segundo
    const totalSeconds = timeToSeconds(timeStr);
    return totalSeconds / 86400; // 86400 segundos en un día
}

function importStartOrder() {
    console.log("🚨 =============== importStartOrder() INICIANDO ===============");
    console.log("🚨 Llamada #" + (window.importCallCount = (window.importCallCount || 0) + 1));
    console.log("🚨 Stack trace:", new Error().stack);
    const t = translations[appState.currentLanguage];
    
    // VERIFICAR SI HAY CARRERA SELECCIONADA
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst || 'Selecciona una carrera primero', 'error');
        return;
    }
    
    console.log("📥 Iniciando importación para carrera:", appState.currentRace.name);
    
    // Verificar si ya hay datos en la tabla PARA LA CARRERA ACTUAL
    const currentDataForRace = getCurrentDataForCurrentRace();
    
    if (currentDataForRace && currentDataForRace.length > 0) {
        // Mostrar modal de confirmación solo si hay datos PARA ESTA CARRERA
        showImportConfirmationModal(currentDataForRace);
        return;
    }
    
    // Si no hay datos para esta carrera, proceder directamente
    proceedWithImport();
}

function getCurrentDataForCurrentRace() {
    if (!appState.currentRace) {
        return [];
    }
    
    // Verificar si startOrderData pertenece a la carrera actual
    // Comparar con los datos guardados en la carrera
    if (appState.currentRace.startOrder && appState.currentRace.startOrder.length > 0) {
        return appState.currentRace.startOrder;
    }
    
    // Si startOrderData existe pero no está en la carrera, verificar si es para esta carrera
    if (startOrderData && startOrderData.length > 0) {
        // Verificar si los datos en memoria corresponden a la carrera actual
        // Podrías añadir una propiedad raceId a cada corredor si es necesario
        return startOrderData;
    }
    
    return [];
}

function showImportConfirmationModal(currentData) {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de confirmación ESPECÍFICO PARA LA CARRERA ACTUAL
    const modal = document.createElement('div');
    modal.id = 'import-confirmation-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> ${t.importWarningTitle || '¡Atención!'}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="warning-message">
                    <div class="warning-icon">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="warning-text">
                        <p><strong>${t.importWarning || 'Los datos actuales se borrarán'}</strong></p>
                        <p>Carrera actual: <strong>${appState.currentRace ? appState.currentRace.name : 'Sin carrera'}</strong></p>
                        <p>Actualmente tienes <span class="rider-count">${currentData.length}</span> ${t.importWarningRiders || 'corredores en la tabla'} para esta carrera.</p>
                        <p>${t.importWarningQuestion || '¿Estás seguro de que quieres continuar con la importación?'}</p>
                    </div>
                </div>
                
                <div class="data-preview">
                    <h4><i class="fas fa-list"></i> ${t.currentDataPreview || 'Vista previa de datos actuales'}</h4>
                    <div class="preview-table-container">
                        <table class="preview-table">
                            <thead>
                                <tr>
                                    <th>Orden</th>
                                    <th>Dorsal</th>
                                    <th>Nombre</th>
                                    <th>Hora Salida</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${getCurrentDataPreview(currentData)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-import-btn">
                    <i class="fas fa-file-import"></i>
                    ${t.confirmImport || 'Sí, importar y reemplazar'}
                </button>
                <button class="btn btn-danger" id="cancel-import-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelImport || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupImportConfirmationModalEvents(modal);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Añadir estilos si no existen
    addImportConfirmationStyles();
}
function getCurrentDataPreview() {
    // Mostrar solo los primeros 5 corredores como vista previa
    const previewCount = Math.min(5, startOrderData.length);
    let html = '';
    
    for (let i = 0; i < previewCount; i++) {
        const rider = startOrderData[i];
        html += `
        <tr>
            <td>${rider.order}</td>
            <td>${rider.dorsal}</td>
            <td>${rider.nombre || ''} ${rider.apellidos || ''}</td>
            <td>${rider.horaSalida || '00:00:00'}</td>
        </tr>
        `;
    }
    
    if (startOrderData.length > 5) {
        html += `
        <tr>
            <td colspan="4" class="preview-more">
                <i class="fas fa-ellipsis-h"></i>
                ${startOrderData.length - 5} ${translations[appState.currentLanguage].moreRiders || 'más corredores...'}
            </td>
        </tr>
        `;
    }
    
    return html;
}

function setupImportConfirmationModalEvents(modal) {
    const confirmBtn = modal.querySelector('#confirm-import-btn');
    const cancelBtn = modal.querySelector('#cancel-import-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar importación
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        // Proceder con la importación
        setTimeout(proceedWithImport, 50);
    });
    
    // Cancelar importación
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.importCancelled || 'Importación cancelada', 'info');
    });
    
    // Cerrar con la X
    closeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            setTimeout(() => {
                if (this.parentNode) {
                    this.remove();
                }
            }, 300);
        }
    });
    
    // Prevenir que el evento se propague al contenido
    modal.querySelector('.modal-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}


// En Salidas_1.js, modificar la función proceedWithImport() (línea ~994):

function proceedWithImport() {
        console.log("🚨 =============== proceedWithImport() INICIANDO ===============");
    console.log("🚨 Llamada #" + (window.proceedImportCount = (window.proceedImportCount || 0) + 1));
    const t = translations[appState.currentLanguage];
    
    // VERIFICAR SI YA HAY UN INPUT FILE ABIERTO
    if (window.importFileInput && document.body.contains(window.importFileInput)) {
        console.log("⚠️ Ya hay un input file abierto, ignorando llamado duplicado");
        return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.style.display = 'none';
    
    // Guardar referencia global para verificar duplicados
    window.importFileInput = input;
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            // Limpiar referencia si no se seleccionó archivo
            window.importFileInput = null;
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                
                if (jsonData.length < 2) {
                    showMessage(t.fileEmpty, 'error');
                    return;
                }
                
                // Procesar los datos
                processImportedOrderData(jsonData);
                
                // Mostrar mensaje de éxito
                const message = t.orderImported 
                    ? t.orderImported.replace('{count}', startOrderData.length)
                    : `Se importaron ${startOrderData.length} corredores correctamente`;
                
                showMessage(message, 'success');
                
            } catch (error) {
                console.error('Error importing file:', error);
                showMessage(t.importError, 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    };
    
    input.onclick = () => {
        // Limpiar referencia al cerrar el diálogo
        setTimeout(() => {
            if (!input.files || input.files.length === 0) {
                window.importFileInput = null;
                // Remover el input del DOM después de usar
                setTimeout(() => {
                    if (input.parentNode) {
                        input.parentNode.removeChild(input);
                    }
                }, 100);
            }
        }, 1000);
    };
    
    // Añadir al DOM y hacer click
    document.body.appendChild(input);
    input.click();
    
    // Remover después de usar
    setTimeout(() => {
        if (input.parentNode && (!input.files || input.files.length === 0)) {
            input.parentNode.removeChild(input);
            window.importFileInput = null;
        }
    }, 5000); // Remover después de 5 segundos por si acaso
}


function addImportConfirmationStyles() {
    if (document.getElementById('import-confirmation-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'import-confirmation-styles';
    style.textContent = `
        #import-confirmation-modal .modal-content {
            max-width: 700px;
        }
        
        .warning-message {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 20px;
            margin-bottom: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .warning-icon {
            font-size: 2rem;
            color: #f39c12;
        }
        
        .warning-text {
            flex: 1;
        }
        
        .warning-text p {
            margin: 5px 0;
        }
        
        .warning-text strong {
            font-size: 1.1rem;
        }
        
        .rider-count {
            font-weight: 700;
            color: var(--danger);
            font-size: 1.2rem;
        }
        
        .data-preview {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .data-preview h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .preview-table-container {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            border-radius: var(--border-radius);
            background: white;
        }
        
        .preview-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .preview-table th {
            background: #e9ecef;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: var(--gray-dark);
            position: sticky;
            top: 0;
            border-bottom: 2px solid #dee2e6;
        }
        
        .preview-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .preview-table tr:last-child td {
            border-bottom: none;
        }
        
        .preview-more {
            text-align: center;
            font-style: italic;
            color: var(--gray);
            background: #f8f9fa;
        }
        
        .preview-more i {
            margin-right: 5px;
        }
        
        /* Scrollbar personalizada */
        .preview-table-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .preview-table-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }
        
        .preview-table-container::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    `;
    
    document.head.appendChild(style);
}


function createRiderFromRow(row, columnIndexes, index) {
    // Función helper para obtener valores con manejo de tipos de Excel
    const getExcelValue = (columnName, defaultValue = '') => {
        const colIndex = columnIndexes[columnName];
        if (colIndex === undefined || colIndex >= row.length) {
            return defaultValue;
        }
        
        const value = row[colIndex];
        
        // Si es undefined, null o vacío, devolver valor por defecto
        if (value === undefined || value === null || value === '') {
            return defaultValue;
        }
        
        // Si es un objeto de Excel (como {t: 'n', v: 0.5}), extraer el valor
        if (typeof value === 'object' && value !== null && value.t === 'n') {
            return value.v; // Valor numérico de Excel
        }
        
        // Si es un número, manejarlo como tiempo de Excel si es menor que 1
        if (typeof value === 'number') {
            if (value < 1 && value > 0) {
                // Es un tiempo de Excel, convertirlo a string HH:MM:SS
                const seconds = Math.round(value * 86400);
                return secondsToTime(seconds);
            } else if (columnName.includes('Segundos') || columnName === 'Diferencia') {
                // Es una columna de segundos o diferencia, devolver como número
                return value;
            } else {
                // Para otros números, convertir a string
                return String(value);
            }
        }
        
        // Para cualquier otro caso, convertir a string
        return String(value).trim();
    };
    
    // Leer la hora de salida del Excel - priorizar "Hora Salida"
    let horaSalidaExcel = getExcelValue('Hora Salida', '');
    
    // Si no hay "Hora Salida", intentar con "Hora Salida Importado"
    if (!horaSalidaExcel || horaSalidaExcel === '') {
        horaSalidaExcel = getExcelValue('Hora Salida Importado', '');
    }
    
    // Si sigue vacío, usar valor por defecto basado en el orden
    if (!horaSalidaExcel || horaSalidaExcel === '') {
        // Calcular hora basada en posición (9:00:00 + (index-1)*60 segundos)
        const baseSeconds = 9 * 3600; // 9:00:00 en segundos
        const positionSeconds = (index - 1) * 60; // ¡CORRECCIÓN: index-1 en lugar de index!
        horaSalidaExcel = secondsToTime(baseSeconds + positionSeconds);
    }
    
    // Asegurar formato HH:MM:SS
    horaSalidaExcel = formatTimeValue(horaSalidaExcel);
    
    // OBTENER TODOS LOS CAMPOS DEL EXCEL (AÑADIDO)
    const cronoSalidaExcel = getExcelValue('Crono Salida', '00:00:00');
    const diferenciaExcel = getExcelValue('Diferencia', '00:00:00');
    const nombreExcel = getExcelValue('Nombre', '');           // AÑADIDO
    const apellidosExcel = getExcelValue('Apellidos', '');     // AÑADIDO
    const chipExcel = getExcelValue('Chip', '');               // AÑADIDO
    
    const rider = {
        order: parseInt(getExcelValue('Orden', index + 1)) || (index + 1),
        dorsal: parseInt(getExcelValue('Dorsal', index + 1)) || (index + 1),
        
        // Campos principales - usar la hora procesada
        cronoSalida: formatTimeValue(cronoSalidaExcel),
        horaSalida: horaSalidaExcel, // ✅ Usar la hora procesada
        diferencia: formatTimeValue(diferenciaExcel),
        
        // Campos de datos personales (AÑADIDOS)
        nombre: nombreExcel,        // AÑADIDO
        apellidos: apellidosExcel,  // AÑADIDO
        chip: chipExcel,            // AÑADIDO
        
        // Campos reales vacíos inicialmente
        horaSalidaReal: '',
        cronoSalidaReal: '',
        horaSalidaRealSegundos: 0,
        cronoSalidaRealSegundos: 0,
        
        // Campos previstos (inicialmente iguales a los principales)
        horaSalidaPrevista: formatTimeValue(horaSalidaExcel),
        cronoSalidaPrevista: formatTimeValue(cronoSalidaExcel),
        
        // Campos importados (guardar lo que viene del Excel)
        horaSalidaImportado: horaSalidaExcel,
        cronoSalidaImportado: formatTimeValue(cronoSalidaExcel),
        
        // Campos en segundos para cálculos
        cronoSegundos: timeToSeconds(formatTimeValue(cronoSalidaExcel)),
        horaSegundos: timeToSeconds(horaSalidaExcel),
        
        // Diferencia en segundos (si hay diferencia, calcularla)
        diferenciaSegundos: 0
    };
    
    // Aplicar reglas de importación
    applyImportRules(rider, index);
    
    return rider;
}

function applyImportRules(rider, index) {
    // 1. Guardar los datos importados en los campos "Importado" (solo si no existen ya)
    if ((rider.horaSalida && rider.horaSalida !== '00:00:00' && rider.horaSalida !== '') &&
        (!rider.horaSalidaImportado || rider.horaSalidaImportado === '')) {
        rider.horaSalidaImportado = rider.horaSalida;
    }
    if ((rider.cronoSalida && rider.cronoSalida !== '00:00:00' && rider.cronoSalida !== '') &&
        (!rider.cronoSalidaImportado || rider.cronoSalidaImportado === '')) {
        rider.cronoSalidaImportado = rider.cronoSalida;
    }
    
    // 2. Campos reales deben estar VACÍOS inicialmente (a menos que vengan del Excel)
    if (!rider.horaSalidaReal || rider.horaSalidaReal === '') {
        rider.horaSalidaReal = '';
        rider.horaSalidaRealSegundos = 0;
    }
    if (!rider.cronoSalidaReal || rider.cronoSalidaReal === '') {
        rider.cronoSalidaReal = '';
        rider.cronoSalidaRealSegundos = 0;
    }
    
    // 3. IMPORTANTE: ¡NO SOBREESCRIBIR valores existentes del Excel!
    // Solo calcular si el campo está realmente vacío
    if (!rider.horaSalida || rider.horaSalida === '') {
        rider.horaSalida = calculateStartTime(index);
    }
    // CORRECCIÓN CRÍTICA: Respetar "00:00:00" del Excel
    if (!rider.cronoSalida || rider.cronoSalida === '') {
        rider.cronoSalida = secondsToTime(index * 60);
    }
    
    // 4. Calcular diferencia si no existe
    if ((!rider.diferencia || rider.diferencia === '' || rider.diferencia === '00:00:00') &&
        rider.horaSalidaReal && rider.horaSalidaReal !== '' &&
        rider.horaSalida && rider.horaSalida !== '') {
        
        const horaRealSegs = timeToSeconds(rider.horaSalidaReal);
        const horaPrevistaSegs = timeToSeconds(rider.horaSalida);
        
        if (horaRealSegs > 0 && horaPrevistaSegs > 0) {
            const diffSegundos = horaRealSegs - horaPrevistaSegs;
            rider.diferencia = secondsToTime(Math.abs(diffSegundos)) + 
                              (diffSegundos > 0 ? ' (+)' : diffSegundos < 0 ? ' (-)' : '');
            rider.diferenciaSegundos = diffSegundos;
        }
    }
    
    // 5. Campos previstas se llenan con los valores principales si están vacíos
    if (!rider.horaSalidaPrevista || rider.horaSalidaPrevista === '00:00:00' || rider.horaSalidaPrevista === '') {
        rider.horaSalidaPrevista = rider.horaSalida;
    }
    if (!rider.cronoSalidaPrevista || rider.cronoSalidaPrevista === '00:00:00' || rider.cronoSalidaPrevista === '') {
        rider.cronoSalidaPrevista = rider.cronoSalida;
    }
    
    // 6. Calcular segundos de los campos principales si faltan
    if (!rider.cronoSegundos || rider.cronoSegundos === 0) {
        rider.cronoSegundos = timeToSeconds(rider.cronoSalida);
    }
    if (!rider.horaSegundos || rider.horaSegundos === 0) {
        rider.horaSegundos = timeToSeconds(rider.horaSalida);
    }
    if (!rider.diferenciaSegundos && rider.diferencia && rider.diferencia !== '') {
        // Extraer segundos de la diferencia (formato: "00:01:00 (+)")
        const diffMatch = rider.diferencia.match(/(\d{2}:\d{2}:\d{2})/);
        if (diffMatch) {
            rider.diferenciaSegundos = timeToSeconds(diffMatch[1]);
            // Aplicar signo
            if (rider.diferencia.includes('(-)')) {
                rider.diferenciaSegundos = -Math.abs(rider.diferenciaSegundos);
            } else if (rider.diferencia.includes('(+)')) {
                rider.diferenciaSegundos = Math.abs(rider.diferenciaSegundos);
            }
        }
    }
    
    // 7. Asegurar que los campos importados están bien formateados
    if (rider.horaSalidaImportado && rider.horaSalidaImportado !== '') {
        rider.horaSalidaImportado = formatTimeValue(rider.horaSalidaImportado);
    } else {
        rider.horaSalidaImportado = '';
    }
    
    if (rider.cronoSalidaImportado && rider.cronoSalidaImportado !== '') {
        rider.cronoSalidaImportado = formatTimeValue(rider.cronoSalidaImportado);
    } else {
        rider.cronoSalidaImportado = '';
    }
}

function updateStartOrderUI() {
    console.log("=== updateStartOrderUI llamada ===");
    console.log("startOrderData.length:", startOrderData.length);
    
    // 🔴 PROTECCIÓN CONTRA MÚLTIPLES LLAMADAS SIMULTÁNEAS
    if (window.updatingStartOrderUI) {
        console.warn("⚠️ updateStartOrderUI ya está ejecutándose, omitiendo llamada duplicada");
        return;
    }
    
    window.updatingStartOrderUI = true;
    
    try {
        if (startOrderData.length > 0) {
            const primerCorredor = startOrderData[0];
            
            // Actualizar hora de inicio desde el primer corredor
            let horaPrimeraSalida = primerCorredor.horaSalida || 
                                   primerCorredor.horaSalidaImportado || 
                                   primerCorredor.horaSalidaPrevista || 
                                   '09:00:00';
            
            // Formatear hora correctamente
            horaPrimeraSalida = formatTimeValue(horaPrimeraSalida);
            
            // Actualizar input de hora de inicio
            const firstStartTimeInput = document.getElementById('first-start-time');
            if (firstStartTimeInput) {
                const horaActual = firstStartTimeInput.value;
                if (horaActual !== horaPrimeraSalida) {
                    firstStartTimeInput.value = horaPrimeraSalida;
                    console.log(`✅ Hora de inicio actualizada: ${horaPrimeraSalida}`);
                    
                    // Disparar evento de cambio para actualizar cálculos
                    firstStartTimeInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            
            // También actualizar el campo de hora de salida del primer corredor si existe
            const firstRiderTimeCell = document.querySelector('.start-order-table tbody tr:first-child .hora-salida-cell');
            if (firstRiderTimeCell) {
                firstRiderTimeCell.textContent = horaPrimeraSalida;
            }
        }
        
        // Actualizar total de corredores en múltiples lugares
        const totalCorredores = startOrderData.length;
        console.log(`📊 Total de corredores: ${totalCorredores}`);
        
        // Lista de elementos a actualizar
        const updateElements = [
            { id: 'total-corredores-display', type: 'text' },
            { id: 'total-riders', type: 'input' },
            { id: 'total-riders-display', type: 'text' },
            { id: 'total-corredores-value', type: 'text' },
            { id: 'riders-count', type: 'text' }
        ];
        
        updateElements.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                if (item.type === 'input' && element.tagName === 'INPUT') {
                    if (element.value !== totalCorredores.toString()) {
                        element.value = totalCorredores;
                        console.log(`✅ Input ${item.id} actualizado a: ${totalCorredores}`);
                    }
                } else {
                    if (element.textContent !== totalCorredores.toString()) {
                        element.textContent = totalCorredores;
                        console.log(`✅ Elemento ${item.id} actualizado a: ${totalCorredores}`);
                    }
                }
            }
        });
        
        // Actualizar contador en el botón de exportar si existe
        const exportBtn = document.getElementById('export-order-btn');
        if (exportBtn) {
            const badge = exportBtn.querySelector('.badge') || document.createElement('span');
            if (!badge.classList.contains('badge')) {
                badge.className = 'badge';
                exportBtn.appendChild(badge);
            }
            badge.textContent = totalCorredores;
            badge.style.display = totalCorredores > 0 ? 'inline-block' : 'none';
        }
        
        // 🔴 PROTECCIÓN: Controlar la llamada a updateStartOrderTableThrottled
        if (typeof updateStartOrderTableThrottled === 'function' && !window.skipTableUpdate) {
            // Marcar para evitar llamadas recursivas
            window.skipTableUpdate = true;
            
            // Limpiar cualquier throttling pendiente para evitar acumulación
            if (window.updateStartOrderTableTimeout) {
                clearTimeout(window.updateStartOrderTableTimeout);
                window.updateStartOrderTableTimeout = null;
            }
            
            // Pequeño delay para asegurar que todos los datos están actualizados
            setTimeout(() => {
                // Usar la versión "force" para ejecución inmediata
                updateStartOrderTableThrottled(true);
                console.log("✅ Tabla actualizada inmediatamente");
                
                // Quitar la marca después de actualizar
                setTimeout(() => {
                    window.skipTableUpdate = false;
                }, 100);
            }, 50);
        }
        
        // Actualizar diferencia de tiempo si la función existe
        if (typeof updateTimeDifference === 'function') {
            setTimeout(() => {
                updateTimeDifference();
                console.log("✅ Diferencia de tiempo actualizada");
            }, 150);
        }
        
        // Actualizar display del próximo corredor
        if (typeof updateNextCorredorDisplay === 'function') {
            setTimeout(() => {
                updateNextCorredorDisplay();
                console.log("✅ Display de próximo corredor actualizado");
            }, 200);
        }
        
        // Guardar FINAL en la CARRERA ESPECÍFICA (NO en localStorage global)
        setTimeout(() => {
            try {
                if (appState.currentRace) {
                    // Actualizar en memoria
                    appState.currentRace.startOrder = [...startOrderData];
                    appState.currentRace.totalRiders = startOrderData.length;
                    appState.currentRace.lastModified = new Date().toISOString();
                    
                    // Guardar usando saveRaceData (que guarda en la carrera específica)
                    if (typeof saveRaceData === 'function') {
                        saveRaceData();
                        console.log(`✅ Guardado final en carrera: "${appState.currentRace.name}"`);
                    } else {
                        // Fallback: guardar manualmente en carrera específica
                        const raceKey = `race-${appState.currentRace.id}`;
                        const existingData = localStorage.getItem(raceKey);
                        let raceData = {};
                        
                        if (existingData) {
                            try {
                                raceData = JSON.parse(existingData);
                            } catch (e) {
                                console.warn("⚠️ Error parseando datos existentes");
                            }
                        }
                        
                        raceData.startOrderData = [...startOrderData];
                        raceData.lastUpdate = new Date().toISOString();
                        
                        localStorage.setItem(raceKey, JSON.stringify(raceData));
                        console.log(`✅ Guardado manual en ${raceKey}`);
                    }
                    
                    // ELIMINAR cualquier dato global antiguo (evitar mezcla)
                    localStorage.removeItem('cri_start_order_data_final');
                    console.log("🗑️ Datos globales antiguos eliminados");
                }
            } catch (error) {
                console.error("❌ Error en guardado final:", error);
            }
        }, 1000);
        
        /*
        // Actualizar título de la tarjeta de gestión
        if (typeof updateRaceManagementCardTitle === 'function') {
            setTimeout(() => {
                updateRaceManagementCardTitle();
                console.log("✅ Título de gestión actualizado");
            }, 300);
        }
        */
        
        // Actualizar estadísticas si existen
        if (typeof updateStartOrderStats === 'function') {
            setTimeout(() => {
                updateStartOrderStats();
                console.log("✅ Estadísticas actualizadas");
            }, 400);
        }
        
        console.log("✅ UI completamente actualizada");
        
    } catch (error) {
        console.error("❌ Error en updateStartOrderUI:", error);
    } finally {
        // 🔴 LIMPIAR LA PROTECCIÓN DESPUÉS DE UN TIEMPO
        setTimeout(() => {
            window.updatingStartOrderUI = false;
            console.log("🔄 Protección de updateStartOrderUI desactivada");
        }, 100);
    }
    
    console.log("=== updateStartOrderUI completada ===");
}

// ============================================
// FUNCIÓN PARA LIMPIAR DATOS AL CAMBIAR DE CARRERA
// ============================================
function clearDataOnRaceChange() {
    console.log("🔄 Limpiando datos para cambio de carrera...");
    
    // Limpiar datos globales
    startOrderData = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    appState.intervals = [];
    
    // Limpiar localStorage global
    localStorage.removeItem('start-order-data');
    localStorage.removeItem('cri_start_order_data');
    localStorage.removeItem('countdown-app-state');
    
    // Actualizar UI
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled(true);
    }
    
    if (typeof renderDeparturesList === 'function') {
        renderDeparturesList();
    }
    
    // Resetear inputs
    const inputsToReset = [
        'first-start-time',
        'total-riders',
        'start-position'
    ];
    
    inputsToReset.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'first-start-time') {
                element.value = "09:00:00";
            } else if (id === 'total-riders') {
                element.value = 1;
            } else if (id === 'start-position') {
                element.value = 1;
            }
        }
    });
    
    // Actualizar contador de salidos
    const departedCountElement = document.getElementById('departed-count');
    if (departedCountElement) {
        departedCountElement.textContent = '0';
    }
    
    console.log("✅ Datos limpiados para nueva carrera");
}