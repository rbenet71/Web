// ============================================
// MÓDULO DE ALMACENAMIENTO Y PWA
// ============================================
// DESCRIPCIÓN: Módulo central de persistencia de datos y funcionalidad PWA
// RESPONSABILIDADES:
// 1. Gestión completa de almacenamiento localStorage para carreras y configuraciones
// 2. Sistema de copias de seguridad y restauración por carrera individual
// 3. Funcionalidades PWA (Service Worker, instalación, actualizaciones)
// 4. Gestión de carreras (crear, editar, eliminar, limpiar datos)
// 5. Orden de salida con confirmaciones visuales y estadísticas
// 6. Integración con otros módulos para sincronización de datos
//
// FUNCIONES CRÍTICAS EXPORTADAS:
// - loadRaceData() - Carga datos específicos de carrera
// - saveRaceData() - Guarda carrera actual con todos sus datos
// - createRaceBackup() - Genera copia de seguridad de carrera individual
// - restoreRaceFromBackup() - Restaura carrera desde archivo JSON
// - editRaceDetails() - Editor completo de detalles de carrera
// - updateRaceManagementCardTitle() - Actualiza título dinámico de gestión
//
// DEPENDENCIAS:
// - appState (global) - Estado principal de la aplicación
// - translations (global) - Sistema de traducción
// - startOrderData (global) - Datos de orden de salida
// - llegadasState (global) - Estado del módulo de llegadas
//
// ARCHIVOS RELACIONADOS:
// → Main.js: Usa loadRaceData(), loadStartOrderData()
// → UI.js: Usa updateRaceManagementCardTitle()
// → Salidas_1.js: Usa saveRaceData()
// → Llegadas.js: Guarda datos en carrera
// ============================================

// ============================================
// MÓDULO DE ALMACENAMIENTO Y PWA
// ============================================

// ============================================
// FUNCIONES DE PERSISTENCIA DE DATOS
// ============================================

// Cargar preferencia de idioma
function loadLanguagePreference() {
    const savedLang = localStorage.getItem('countdown-language');
    if (savedLang && translations[savedLang]) {
        appState.currentLanguage = savedLang;
    }
}

// Cargar carreras desde almacenamiento
function loadRacesFromStorage() {
    const savedRaces = localStorage.getItem('countdown-races');
    if (savedRaces) {
        appState.races = JSON.parse(savedRaces);
    }
    
    const savedCurrentRace = localStorage.getItem('countdown-current-race');
    if (savedCurrentRace) {
        appState.currentRace = JSON.parse(savedCurrentRace);
    }
}

// Cargar estado de la aplicación
function loadAppState() {
    const savedState = localStorage.getItem('countdown-app-state');
    if (savedState) {
        const state = JSON.parse(savedState);
        
        appState.departedCount = state.departedCount || 0;
        appState.nextCorredorTime = state.nextCorredorTime || 60;
        appState.intervals = state.intervals || [];
        appState.currentIntervalIndex = state.currentIntervalIndex || 0;
        appState.accumulatedTime = state.accumulatedTime || 0;
        appState.raceStartTime = state.raceStartTime || null;
        
        if (state.departureTimes && state.departureTimes.length > 0 && state.raceStartTime) {
            appState.departureTimes = state.departureTimes.map(departure => {
                if (departure.timeValue) return departure;
                
                const elapsedSeconds = Math.floor((departure.timestamp - state.raceStartTime) / 1000);
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60);
                const seconds = elapsedSeconds % 60;
                
                return {
                    ...departure,
                    timeValue: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
                    elapsedSeconds: elapsedSeconds
                };
            });
        } else {
            appState.departureTimes = state.departureTimes || [];
        }
        
        appState.countdownActive = false;
        appState.countdownValue = 0;
        appState.countdownPaused = false;
        
        document.getElementById('start-position').value = appState.departedCount + 1;
        
        console.log("Estado cargado, salidos:", appState.departedCount);
    }
}

// Cargar datos de la carrera actual
function loadRaceData() {
    if (!appState.currentRace) {
        console.log("No hay carrera seleccionada para cargar datos");
        return;
    }
    
    console.log("🚀 =========================================");
    console.log("🚀 CARGA DE DATOS PARA CARRERA:", appState.currentRace.name);
    console.log("🚀 ID:", appState.currentRace.id);
    console.log("🚀 =========================================");
    
    console.log("Cargando datos para carrera:", appState.currentRace.name);
    
    // Cargar datos específicos de la carrera
    const raceKey = `race-${appState.currentRace.id}`;
    const raceData = localStorage.getItem(raceKey);
    
    if (raceData) {
        try {
            const data = JSON.parse(raceData);
            
            // Cargar datos básicos
            appState.raceStartTime = data.raceStartTime || '';
            appState.departureTimes = data.departureTimes || [];
            appState.departedCount = data.departedCount || 0;
            appState.intervals = data.intervals || [];
            
            // CRÍTICO: CARGAR startOrderData DESDE LA CARRERA
            // Prioridad 1: startOrderData del archivo de carrera
            if (data.startOrderData && data.startOrderData.length > 0) {
                startOrderData = [...data.startOrderData];
                appState.currentRace.startOrder = [...data.startOrderData];
                console.log("Cargados", startOrderData.length, "corredores desde datos de carrera (startOrderData)");
            } 
            // Prioridad 2: startOrder del archivo de carrera (formato alternativo)
            else if (data.startOrder && data.startOrder.length > 0) {
                startOrderData = [...data.startOrder];
                appState.currentRace.startOrder = [...data.startOrder];
                console.log("Cargados", startOrderData.length, "corredores desde datos de carrera (startOrder)");
            }
            // Prioridad 3: startOrder de la carrera actual en memoria
            else if (appState.currentRace.startOrder && appState.currentRace.startOrder.length > 0) {
                startOrderData = [...appState.currentRace.startOrder];
                console.log("Cargados", startOrderData.length, "corredores desde carrera en memoria");
            }
            // Sin datos
            else {
                startOrderData = [];
                appState.currentRace.startOrder = [];
                console.log("Sin datos de orden de salida para esta carrera");
            }
            
            console.log("Datos de carrera cargados:");
            console.log("- Hora inicio:", appState.raceStartTime);
            console.log("- Salidas:", appState.departedCount);
            console.log("- Orden de salida:", startOrderData.length);
            
            // CRÍTICO: ACTUALIZAR CAMPOS DE CONFIGURACIÓN
            // 1. Actualizar "Salida Primero:" (first-start-time)
            const firstStartTimeInput = document.getElementById('first-start-time');
            if (firstStartTimeInput) {
                // Primero buscar en datos de carrera específicos
                if (data.firstStartTime) {
                    firstStartTimeInput.value = data.firstStartTime;
                    console.log("Actualizado first-start-time desde datos de carrera:", data.firstStartTime);
                } 
                // Luego buscar en la carrera actual
                else if (appState.currentRace.firstStartTime) {
                    firstStartTimeInput.value = appState.currentRace.firstStartTime;
                    console.log("Actualizado first-start-time desde carrera actual:", appState.currentRace.firstStartTime);
                }
                // Finalmente, valor por defecto
                else {
                    firstStartTimeInput.value = "09:00:00";
                    console.log("Establecido first-start-time por defecto: 09:00:00");
                }
            }
            
            // 2. Actualizar "Total Corredores:" (total-riders)
            const totalRidersInput = document.getElementById('total-riders');
            if (totalRidersInput) {
                totalRidersInput.value = startOrderData.length > 0 ? startOrderData.length : 1;
                console.log("Actualizado total-riders:", totalRidersInput.value);
            }
            
            // 3. Actualizar hora inicio si existe
            if (document.getElementById('start-time')) {
                document.getElementById('start-time').value = appState.raceStartTime || '';
            }
            
            // 4. Actualizar contador de salidos
            document.getElementById('departed-count').textContent = appState.departedCount;
            
            // 5. Actualizar posición inicial
            const startPositionInput = document.getElementById('start-position');
            if (startPositionInput) {
                startPositionInput.value = appState.departedCount + 1;
            }
            
            // 6. Actualizar intervalos si existen
            if (data.intervals && data.intervals.length > 0) {
                appState.intervals = [...data.intervals];
                console.log("Intervalos cargados:", data.intervals.length);
            }
            
            // Actualizar tabla inmediatamente si hay datos
            if (startOrderData.length > 0) {
                console.log("Actualizando tabla con datos cargados...");
                if (typeof updateStartOrderTableThrottled === 'function') {
                    setTimeout(() => {
                        updateStartOrderTableThrottled(true);
                    }, 50);
                }
            }
            
            // Actualizar lista de salidas
            if (typeof renderDeparturesList === 'function') {
                renderDeparturesList();
            }
            
            console.log("✅ UI actualizada para carrera:", appState.currentRace.name);
            console.log("   - Total corredores:", startOrderData.length);
            console.log("   - Hora primer salida:", document.getElementById('first-start-time')?.value);
            console.log("   - Salidas realizadas:", appState.departedCount);
            
        } catch (error) {
            console.error("Error cargando datos de carrera:", error);
            console.log("Inicializando datos vacíos");
            initializeEmptyData();
        }
    } else {
        console.log("No hay datos guardados para esta carrera. Inicializando vacío.");
        initializeEmptyData();
    }
    
    // Siempre actualizar el título de la tarjeta
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    // Actualizar estado de botones después de cargar
    if (typeof updateRaceActionButtonsState === 'function') {
        updateRaceActionButtonsState();
    }
    
    if (typeof updateDeleteRaceButtonState === 'function') {
        updateDeleteRaceButtonState();
    }
}

function initializeEmptyData() {
    console.log("Inicializando datos vacíos para nueva carrera...");
    
    // Inicializar datos vacíos
    startOrderData = [];
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    appState.intervals = [];
    
    // Actualizar UI con datos vacíos
    const firstStartTimeInput = document.getElementById('first-start-time');
    if (firstStartTimeInput) {
        // Intentar obtener de la carrera actual primero
        if (appState.currentRace && appState.currentRace.firstStartTime) {
            firstStartTimeInput.value = appState.currentRace.firstStartTime;
        } else {
            firstStartTimeInput.value = "09:00:00";
        }
        console.log("first-start-time establecido a:", firstStartTimeInput.value);
    }
    
    const totalRidersInput = document.getElementById('total-riders');
    if (totalRidersInput) {
        totalRidersInput.value = 1;
        console.log("total-riders establecido a: 1");
    }
    
    document.getElementById('departed-count').textContent = '0';
    
    const startPositionInput = document.getElementById('start-position');
    if (startPositionInput) {
        startPositionInput.value = 1;
    }
    
    const startTimeInput = document.getElementById('start-time');
    if (startTimeInput) {
        startTimeInput.value = '';
    }
    
    // Actualizar tabla vacía
    if (typeof updateStartOrderTableThrottled === 'function') {
        setTimeout(() => {
            updateStartOrderTableThrottled(true);
        }, 50);
    }
    
    console.log("✅ Datos vacíos inicializados correctamente");
}




// Cargar datos del orden de salida
// En Storage_Pwa.js - Función loadStartOrderData modificada
// FUNCIÓN MEJORADA PARA CARGAR DATOS DE ORDEN DE SALIDA
function loadStartOrderData() {
    console.log("Cargando datos de orden de salida...");
    
    if (!appState.currentRace) {
        // SI NO HAY CARRERA, LIMPIAR TODO
        startOrderData = [];
        console.log("⚠️ No hay carrera seleccionada, limpiando datos");
        
        // ACTUALIZAR TABLA VACÍA
        if (typeof updateStartOrderTableThrottled === 'function') {
            updateStartOrderTableThrottled(true);
        }
        return;
    }
    
    console.log("Para carrera:", appState.currentRace.name, "ID:", appState.currentRace.id);
    
    // ESTRATEGIA MEJORADA: SOLO CARGAR DATOS DE LA CARRERA ACTUAL
    const raceKey = `race-${appState.currentRace.id}`;
    const raceData = localStorage.getItem(raceKey);
    
    if (raceData) {
        try {
            const data = JSON.parse(raceData);
            
            // CARGAR DATOS ESPECÍFICOS DE ESTA CARRERA
            if (data.startOrderData && data.startOrderData.length > 0) {
                startOrderData = [...data.startOrderData];
                appState.currentRace.startOrder = [...data.startOrderData];
                console.log(`✅ Cargado desde carrera específica: ${startOrderData.length} corredores`);
            } else {
                // CARRERA SIN DATOS - LIMPIAR
                startOrderData = [];
                appState.currentRace.startOrder = [];
                console.log("⚠️ Carrera sin datos de orden de salida");
            }
            
            // ACTUALIZAR OTROS DATOS DE LA CARRERA
            if (data.departureTimes) {
                appState.departureTimes = [...data.departureTimes];
            }
            
            if (data.departedCount !== undefined) {
                appState.departedCount = data.departedCount;
            }
            
        } catch (error) {
            console.error("❌ Error parsing race data:", error);
            startOrderData = [];
            appState.currentRace.startOrder = [];
        }
    } else {
        // NO HAY DATOS PARA ESTA CARRERA - LIMPIAR TODO
        startOrderData = [];
        appState.currentRace.startOrder = [];
        appState.departureTimes = [];
        appState.departedCount = 0;
        console.log("⚠️ No hay datos guardados para esta carrera");
    }
    
    // LIMPIAR DATOS GLOBALES QUE NO PERTENECEN A ESTA CARRERA
    localStorage.removeItem('start-order-data');
    localStorage.removeItem('cri_start_order_data');
    
    console.log(`📊 Orden de salida cargado para "${appState.currentRace.name}": ${startOrderData.length} corredores`);
    
    // ACTUALIZAR UI
    if (typeof updateStartOrderUI === 'function') {
        updateStartOrderUI();
    }
    
    // Forzar actualización de tabla
    if (typeof updateStartOrderTableThrottled === 'function') {
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
            window.updateStartOrderTableTimeout = null;
        }
        
        updateStartOrderTableThrottled(true);
        console.log("✅ Tabla actualizada inmediatamente");
    }
}


// Guardar estado de la aplicación
function saveAppState() {
    if (appState.countdownActive) {
        localStorage.setItem('countdown-app-state', JSON.stringify({
            countdownActive: appState.countdownActive,
            countdownValue: appState.countdownValue,
            departedCount: appState.departedCount,
            nextCorredorTime: appState.nextCorredorTime,
            departureTimes: appState.departureTimes,
            raceStartTime: appState.raceStartTime,
            accumulatedTime: appState.accumulatedTime,
            countdownPaused: appState.countdownPaused
        }));
    } else {
        localStorage.removeItem('countdown-app-state');
    }
}

// Guardar datos de la carrera
// FUNCIÓN DE GUARDADO CORREGIDA
function saveRaceData() {
    if (!appState.currentRace) {
        console.log("No hay carrera actual para guardar datos");
        return;
    }
    
    console.log("💾 Guardando carrera:", appState.currentRace.name, "ID:", appState.currentRace.id);
    
    // BUSCAR CARRERA EN ARRAY - CON MANEJO DE ERRORES
    let raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    
    if (raceIndex === -1) {
        console.log("⚠️ Carrera no encontrada en array, buscando alternativa...");
        
        // Intentar encontrar por nombre como fallback
        raceIndex = appState.races.findIndex(r => r.name === appState.currentRace.name);
        
        if (raceIndex === -1) {
            console.log("⚠️ Carrera no existe en array, CREANDOLA...");
            
            // Crear carrera básica si no existe
            const newRace = {
                id: appState.currentRace.id || Date.now(),
                name: appState.currentRace.name || "Carrera sin nombre",
                date: appState.currentRace.date || new Date().toISOString().split('T')[0],
                firstStartTime: appState.currentRace.firstStartTime || "09:00:00",
                createdAt: appState.currentRace.createdAt || new Date().toISOString(),
                lastModified: new Date().toISOString(),
                startOrder: [],
                departures: [],
                intervals: []
            };
            
            appState.races.push(newRace);
            raceIndex = appState.races.length - 1;
            appState.currentRace = newRace;
            console.log("✅ Nueva carrera creada en array");
        } else {
            console.log("✅ Carrera encontrada por nombre, actualizando ID");
            // Actualizar ID para que coincida
            appState.races[raceIndex].id = appState.currentRace.id;
        }
    }
    
    // GUARDAR HORA DE INICIO ACTUAL
    const currentFirstStartTime = document.getElementById('first-start-time')?.value || "09:00:00";
    
    // CRÍTICO: GUARDAR startOrderData EN LA CARRERA ACTUAL
    let orderToSave = [];
    
    console.log("💾 Estado antes de guardar:", {
        startOrderDataLength: startOrderData ? startOrderData.length : 0,
        carreraStartOrderLength: appState.currentRace.startOrder ? appState.currentRace.startOrder.length : 0,
        carreraName: appState.currentRace.name
    });
    
    // CASO 1: startOrderData tiene datos
    if (startOrderData && startOrderData.length > 0) {
        orderToSave = [...startOrderData];
        appState.currentRace.startOrder = [...startOrderData];
        console.log("💾 Guardados", orderToSave.length, "corredores desde startOrderData");
    } 
    // CASO 2: startOrderData vacío PERO la carrera tiene datos
    else if (appState.currentRace.startOrder && appState.currentRace.startOrder.length > 0) {
        orderToSave = [...appState.currentRace.startOrder];
        console.log("💾 Manteniendo datos existentes de la carrera:", orderToSave.length, "corredores");
    }
    // CASO 3: Ambos vacíos
    else {
        orderToSave = [];
        appState.currentRace.startOrder = [];
        console.log("💾 Sin datos de orden de salida para guardar");
    }
    
    // Crear carrera actualizada
    const updatedRace = {
        ...appState.currentRace,
        firstStartTime: currentFirstStartTime,
        departures: appState.departureTimes ? [...appState.departureTimes] : [],
        intervals: appState.intervals ? [...appState.intervals] : [],
        startOrder: orderToSave,
        lastModified: new Date().toISOString()
    };
    
    // Actualizar array y carrera actual
    appState.races[raceIndex] = updatedRace;
    appState.currentRace = updatedRace;
    
    // Guardar en localStorage específico de la carrera
    const raceKey = `race-${appState.currentRace.id}`;
    const raceDataToSave = {
        raceStartTime: appState.raceStartTime || null,
        departureTimes: appState.departureTimes || [],
        departedCount: appState.departedCount || 0,
        intervals: appState.intervals || [],
        startOrderData: orderToSave
    };
    
    localStorage.setItem(raceKey, JSON.stringify(raceDataToSave));
    console.log("💾 Datos guardados en localStorage:", raceKey);
    
    // Guardar array de carreras
    saveRacesToStorage();
    
    console.log("✅ Datos guardados para:", appState.currentRace.name);
    console.log("   - Corredores:", orderToSave.length);
}

// Guardar todas las carreras
function saveRacesToStorage() {
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    if (appState.currentRace) {
        localStorage.setItem('countdown-current-race', JSON.stringify(appState.currentRace));
    }
    console.log("Carreras guardadas en localStorage:", appState.races.length);
}

// Guardar datos del orden de salida
function saveStartOrderData() {
    if (appState.currentRace) {
        const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
        if (raceIndex !== -1) {
            appState.races[raceIndex].startOrder = startOrderData;
            saveRacesToStorage();
        }
    }
    localStorage.setItem('start-order-data', JSON.stringify(startOrderData));
}

// ============================================
// FUNCIONES DE GESTIÓN DE CARRERAS
// ============================================
// ============================================
// FUNCIÓN CORREGIDA PARA CREAR NUEVA CARRERA
// ============================================
function createNewRace() {
    const t = translations[appState.currentLanguage];
    
    console.log("Creando nueva carrera...");
    
    // Obtener valores del formulario CON VERIFICACIÓN
    const nameInput = document.getElementById('new-race-name');
    const dateInput = document.getElementById('new-race-date');
    const categoryInput = document.getElementById('new-race-category');
    const organizerInput = document.getElementById('new-race-organizer');
    const locationInput = document.getElementById('new-race-location');
    const descriptionInput = document.getElementById('new-race-description');
    
    // Verificar que los elementos existen
    if (!nameInput || !dateInput) {
        console.error("❌ Elementos del formulario no encontrados");
        showMessage("Error: Formulario incompleto", 'error');
        return;
    }
    
    const name = nameInput.value.trim();
    const date = dateInput.value;
    const category = categoryInput ? categoryInput.value : '';
    const organizer = organizerInput ? organizerInput.value.trim() : '';
    const location = locationInput ? locationInput.value.trim() : '';
    const description = descriptionInput ? descriptionInput.value.trim() : '';
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName || 'Introduce un nombre para la carrera', 'error');
        nameInput.focus();
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate || 'Introduce una fecha válida', 'error');
        dateInput.focus();
        return;
    }
    
    // Obtener modalidad
    let modality = 'CRI';
    let otherModality = '';
    
    const modalityInput = document.querySelector('input[name="modality"]:checked');
    if (modalityInput) {
        modality = modalityInput.value;
        
        if (modality === 'Otras') {
            const otherModalityInput = document.getElementById('new-race-other-modality');
            if (otherModalityInput) {
                otherModality = otherModalityInput.value.trim();
                if (otherModality) {
                    modality = otherModality;
                }
            }
        }
    }
    
    // Obtener hora de inicio predeterminada
    const firstStartTimeInput = document.getElementById('first-start-time');
    const firstStartTime = firstStartTimeInput ? firstStartTimeInput.value : "09:00:00";
    
    // Crear objeto de carrera - INICIALIZAR CORRECTAMENTE
    const newRace = {
        id: Date.now(),
        name: name,
        date: date,
        category: category,
        organizer: organizer,
        location: location,
        modality: modality,
        description: description,
        firstStartTime: firstStartTime,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        departures: [],
        intervals: [],
        startOrder: [],
        metadata: {
            originalModality: modalityInput ? modalityInput.value : 'CRI',
            otherModality: otherModality
        }
    };
    
    console.log("✅ Nueva carrera creada:", newRace);
    
    // Añadir a la lista de carreras
    appState.races.push(newRace);
    appState.currentRace = newRace;
    
    // Resetear datos de estado
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    
    // Resetear datos de orden de salida
    startOrderData = [];
    
    // Actualizar campo total de corredores
    const totalRidersInput = document.getElementById('total-riders');
    if (totalRidersInput) {
        totalRidersInput.value = 1;
    }
    
    // Actualizar UI
    const departedCountElement = document.getElementById('departed-count');
    if (departedCountElement) {
        departedCountElement.textContent = 0;
    }
    
    const startPositionInput = document.getElementById('start-position');
    if (startPositionInput) {
        startPositionInput.value = 1;
    }
    
    // Actualizar tabla
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled();
    }
    
    // Actualizar lista de salidas
    if (typeof renderDeparturesList === 'function') {
        renderDeparturesList();
    }
    
    // Guardar y actualizar
    saveRacesToStorage();
    
    // Actualizar selector de carreras
    if (typeof renderRacesSelect === 'function') {
        renderRacesSelect();
    }
    
    // Actualizar título de la tarjeta de gestión
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    // Actualizar estado de botones
    if (typeof updateDeleteRaceButtonState === 'function') {
        updateDeleteRaceButtonState();
    }
    
    if (typeof updateRaceActionButtonsState === 'function') {
        updateRaceActionButtonsState();
    }
    
    // Cerrar modal y limpiar formulario
    const newRaceModal = document.getElementById('new-race-modal');
    if (newRaceModal) {
        newRaceModal.classList.remove('active');
    }
    
    // Resetear formulario
    if (typeof resetRaceForm === 'function') {
        resetRaceForm();
    }
    
    // Mostrar mensaje de éxito
    showMessage(t.raceCreated || 'Carrera creada correctamente', 'success');
    
    console.log("✅ Proceso de creación completado:", {
        carrera: newRace.name,
        id: newRace.id,
        carrerasTotales: appState.races.length
    });
}


// ============================================
// NUEVA FUNCIÓN: MOSTRAR MODAL PARA CREAR NUEVA CARRERA
// ============================================
function showNewRaceModal() {
    console.log("Mostrando modal para nueva carrera...");
    
    const t = translations[appState.currentLanguage];
    
    // Mostrar el modal de nueva carrera
    const newRaceModal = document.getElementById('new-race-modal');
    if (!newRaceModal) {
        console.error("Modal de nueva carrera no encontrado en el HTML");
        showMessage(t.errorCreatingRace || 'Modal no encontrado', 'error');
        return;
    }
    
    // Limpiar formulario
    const raceForm = document.getElementById('new-race-form');
    if (raceForm) {
        raceForm.reset();
        
        // Establecer valores por defecto
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('race-date');
        if (dateInput) dateInput.value = today;
        
        // Establecer hora de inicio por defecto
        const startTimeInput = document.getElementById('race-start-time');
        if (startTimeInput) startTimeInput.value = '09:00:00';
        
        // Deshabilitar el botón de guardar hasta que se llene el nombre
        const saveBtn = document.getElementById('create-race-btn');
        if (saveBtn) saveBtn.disabled = true;
    }
    
    // Mostrar modal
    newRaceModal.classList.add('active');
    
    // Configurar validación en tiempo real para habilitar/deshabilitar botón
    const nameInput = document.getElementById('race-name');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const saveBtn = document.getElementById('create-race-btn');
            if (saveBtn) {
                saveBtn.disabled = !this.value.trim();
            }
        });
    }
    
    console.log("Modal de nueva carrera mostrado");
}


function resetRaceForm() {
    // Limpiar todos los campos del formulario
    document.getElementById('new-race-name').value = '';
    document.getElementById('new-race-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('new-race-category').value = '';
    document.getElementById('new-race-organizer').value = '';
    document.getElementById('new-race-location').value = '';
    document.getElementById('new-race-description').value = '';
    
    // Resetear modalidad a CRI por defecto
    document.getElementById('modality-cri').checked = true;
    document.getElementById('new-race-other-modality').value = '';
    document.getElementById('other-modality-container').style.display = 'none';
}


// ============================================
// FUNCIÓN CORREGIDA PARA ELIMINAR CARRERA
// ============================================
// ============================================
// FUNCIÓN COMPLETAMENTE CORREGIDA PARA ELIMINAR CARRERA
// ============================================
function deleteCurrentRace() {
    console.log("🗑️ INICIANDO ELIMINACIÓN DE CARRERA...");
    
    if (!appState.currentRace) {
        console.error("❌ No hay carrera seleccionada para eliminar");
        const t = translations[appState.currentLanguage];
        showMessage(t.selectRaceFirst || 'Selecciona una carrera primero', 'error');
        return;
    }
    
    const t = translations[appState.currentLanguage];
    const raceName = appState.currentRace.name;
    const raceId = appState.currentRace.id;
    
    console.log("Carrera a eliminar:", raceName, "ID:", raceId);
    console.log("Total carreras antes:", appState.races.length);
    
    // 1. Buscar carrera en array por ID (ESTO ES CRÍTICO)
    const raceIndex = appState.races.findIndex(r => {
        // Buscar por ID primero
        if (r.id === raceId) return true;
        // Si no encuentra por ID, buscar por nombre (fallback)
        if (r.name === raceName) return true;
        return false;
    });
    
    if (raceIndex === -1) {
        console.error("❌ Carrera no encontrada en array");
        console.log("Estado actual de carreras:", appState.races);
        showMessage(`Error: No se pudo encontrar la carrera "${raceName}"`, 'error');
        return;
    }
    
    console.log("✅ Carrera encontrada en posición:", raceIndex, "ID:", appState.races[raceIndex].id);
    
    // 2. Eliminar del array
    const deletedRace = appState.races.splice(raceIndex, 1)[0];
    console.log("✅ Carrera eliminada del array:", deletedRace.name);
    console.log("Total carreras después:", appState.races.length);
    
    // 3. Eliminar datos específicos de la carrera de localStorage
    const raceKey = `race-${raceId}`;
    localStorage.removeItem(raceKey);
    console.log("🗑️ Datos de carrera eliminados de localStorage:", raceKey);
    
    // 4. Limpiar estado si la carrera eliminada era la actual
    appState.currentRace = null;
    startOrderData = [];
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    appState.raceStartTime = null;
    appState.countdownActive = false;
    appState.countdownValue = 0;
    appState.countdownPaused = false;
    
    // 5. Detener procesos activos
    if (appState.countdownActive) {
        console.log("⏹️ Deteniendo cuenta atrás activa...");
        if (typeof stopCountdown === 'function') {
            stopCountdown();
        }
        
        const countdownScreen = document.getElementById('countdown-screen');
        if (countdownScreen) {
            countdownScreen.classList.remove('active');
        }
        
        document.querySelectorAll('.hide-on-countdown').forEach(el => {
            el.style.display = '';
        });
    }
    
    // 6. Resetear UI - LIMPIAR TODOS LOS CAMPOS
    console.log("🔄 Reseteando UI...");
    
    // Lista de elementos a resetear
    const elementsToReset = [
        { id: 'first-start-time', defaultValue: '09:00:00' },
        { id: 'total-riders', defaultValue: '1' },
        { id: 'start-position', defaultValue: '1' },
        { id: 'interval-minutes', defaultValue: '1' },
        { id: 'interval-seconds', defaultValue: '0' }
    ];
    
    elementsToReset.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.value = item.defaultValue;
            console.log(`✅ ${item.id} resetado a: ${item.defaultValue}`);
        }
    });
    
    const departedCountElement = document.getElementById('departed-count');
    if (departedCountElement) {
        departedCountElement.textContent = '0';
        console.log("✅ departed-count resetado a 0");
    }
    
    const totalTimeElement = document.getElementById('total-time-value');
    if (totalTimeElement) {
        totalTimeElement.textContent = '00:00:00';
    }
    
    // 7. Forzar actualización de tabla (VACÍA)
    if (typeof updateStartOrderTableThrottled === 'function') {
        // Limpiar timeout si existe
        if (window.updateStartOrderTableTimeout) {
            clearTimeout(window.updateStartOrderTableTimeout);
            window.updateStartOrderTableTimeout = null;
        }
        
        // Forzar actualización inmediata
        setTimeout(() => {
            updateStartOrderTableThrottled(true);
            console.log("✅ Tabla actualizada a vacío");
        }, 10);
    }
    
    // 8. Actualizar lista de salidas
    if (typeof renderDeparturesList === 'function') {
        renderDeparturesList();
        console.log("✅ Lista de salidas actualizada");
    }
    
    // 9. Guardar cambios en localStorage (CRÍTICO)
    console.log("💾 Guardando cambios en localStorage...");
    
    // Guardar array actualizado de carreras
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    console.log("✅ Array de carreras guardado:", appState.races.length, "carreras");
    
    // Eliminar carrera actual del localStorage
    localStorage.removeItem('countdown-current-race');
    console.log("✅ Carrera actual eliminada de localStorage");
    
    // Eliminar datos globales antiguos
    localStorage.removeItem('start-order-data');
    localStorage.removeItem('cri_start_order_data');
    localStorage.removeItem('countdown-app-state');
    
    // 10. Actualizar selector de carreras (IMPORTANTE)
    if (typeof renderRacesSelect === 'function') {
        // Esperar un momento para asegurar que el DOM está actualizado
        setTimeout(() => {
            renderRacesSelect();
            console.log("✅ Selector de carreras actualizado");
        }, 50);
    }
    
    // 11. Actualizar título de gestión (EVITAR CICLO INFINITO)
    if (typeof updateRaceManagementCardTitle === 'function') {
        // Usar setTimeout para evitar recursión
        setTimeout(() => {
            updateRaceManagementCardTitle();
            console.log("✅ Título de gestión actualizado");
        }, 100);
    }
    
    // 12. Cerrar modal
    const deleteModal = document.getElementById('delete-race-modal');
    if (deleteModal) {
        deleteModal.classList.remove('active');
        console.log("✅ Modal cerrado");
    }
    
    appState.currentRace = null;
    
    // Actualizar botones
    updateDeleteRaceButtonState();
    updateRaceActionButtonsState();

    // 13. Mostrar mensaje de éxito
    const successMsg = t.raceDeleted ? t.raceDeleted.replace('{name}', raceName) : `Carrera "${raceName}" eliminada correctamente`;
    showMessage(successMsg, 'success');
    
    console.log("✅ ELIMINACIÓN COMPLETADA CORRECTAMENTE");
    console.log("Estado final:", {
        carreras: appState.races.length,
        carreraActual: appState.currentRace ? appState.currentRace.name : "Ninguna",
        startOrderData: startOrderData.length,
        departureTimes: appState.departureTimes.length
    });
}

function clearRaceDepartures() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.raceStartTime = null;
    document.getElementById('start-position').value = 1;
    document.getElementById('departed-count').textContent = 0;
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    saveRaceData();
    renderDeparturesList();
    
    showMessage(t.departuresCleared, 'success');
}

// ============================================
// FUNCIONES DE PWA (PROGRESSIVE WEB APP)
// ============================================
function setupServiceWorker() {
    console.log("🔄 Configurando ServiceWorker para Crono CRI v2.4.4...");
    
    // Verificar si el navegador soporta Service Workers
    if (!('serviceWorker' in navigator)) {
        console.log('❌ Este navegador no soporta Service Workers');
        return;
    }
    
    // Verificar el protocolo actual
    const protocol = window.location.protocol;
    const isFileProtocol = protocol === 'file:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isHttps = protocol === 'https:';
    
    // Los Service Workers NO funcionan con file://
    if (isFileProtocol) {
        console.log('ℹ️ ServiceWorker no disponible para protocolo file://');
        console.log('   La aplicación funcionará, pero sin funciones PWA offline.');
        return;
    }
    
    // Solo registrar si estamos en localhost o HTTPS
    if (isLocalhost || isHttps) {
        // 🔥 CAMBIO PRINCIPAL: Registrar el SW específico de Crono CRI
        const swFile = 'Crono_CRI_ws.js?v=2.4.4';
        console.log(`📁 Registrando ServiceWorker: ${swFile}`);
        
        navigator.serviceWorker.register(swFile)
            .then(registration => {
                console.log('✅ ServiceWorker Crono CRI v2.4.4 registrado exitosamente:', registration.scope);
                
                // 🔥 NUEVO: Forzar actualización inmediata
                console.log('🔄 Forzando actualización del ServiceWorker...');
                registration.update();
                
                // Verificar actualizaciones
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Nueva versión del ServiceWorker encontrada');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        console.log(`📊 Estado del nuevo ServiceWorker: ${newWorker.state}`);
                        
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('📱 Nueva versión lista para instalar');
                            appState.updateAvailable = true;
                            
                            // Mostrar notificación al usuario
                            if (typeof showUpdateNotification === 'function') {
                                showUpdateNotification();
                            } else {
                                console.log('💡 Nueva versión disponible. Recarga la página.');
                            }
                        } else if (newWorker.state === 'activated') {
                            console.log('✅ Nuevo ServiceWorker activado');
                            
                            // 🔥 IMPORTANTE: Limpiar cachés antiguos de localStorage
                            cleanupOldCaches();
                        }
                    });
                });
                
                // 🔥 NUEVO: Escuchar mensajes del ServiceWorker
                navigator.serviceWorker.addEventListener('message', event => {
                    console.log('📨 Mensaje recibido del ServiceWorker:', event.data);
                    
                    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                        console.log('🚀 Actualización disponible - forzando recarga');
                        window.location.reload();
                    }
                });
                
                // 🔥 NUEVO: Verificar versión periódicamente
                setInterval(() => {
                    console.log('⏰ Verificando actualizaciones del ServiceWorker...');
                    registration.update();
                }, 30 * 60 * 1000); // Cada 30 minutos
                
                console.log('✅ ServiceWorker configurado correctamente');
                
            })
            .catch(error => {
                console.error('❌ Error registrando ServiceWorker:', error);
                console.log('⚠️ Detalles del error:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
                
                // 🔥 NUEVO: Intentar sin parámetro de versión como fallback
                console.log('🔄 Intentando registrar sin parámetro de versión...');
                navigator.serviceWorker.register('Crono_CRI_ws.js')
                    .then(backupReg => {
                        console.log('✅ ServiceWorker registrado (sin parámetro versión):', backupReg.scope);
                    })
                    .catch(backupError => {
                        console.error('❌ Error con registro de backup:', backupError);
                    });
            });
        
        // 🔥 NUEVO: Controlador para actualizaciones manuales
        window.forceServiceWorkerUpdate = function() {
            console.log('🔄 Forzando actualización manual del ServiceWorker...');
            navigator.serviceWorker.getRegistration()
                .then(registration => {
                    if (registration) {
                        registration.update();
                        console.log('✅ Actualización forzada solicitada');
                    }
                });
        };
        
    } else {
        console.warn('⚠️ ServiceWorker requiere HTTPS o localhost');
        console.log('   Protocolo actual:', protocol);
        console.log('   La aplicación funcionará, pero sin funciones PWA offline.');
    }
}

// 🔥 NUEVA FUNCIÓN AUXILIAR: Limpiar cachés antiguos
function cleanupOldCaches() {
    console.log('🧹 Limpiando cachés antiguos...');
    
    // Limpiar localStorage de versiones antiguas
    const currentVersion = '2.4.4';
    const keysToKeep = [
        'app-mode',
        'card-expanded-race-management',
        'card-expanded-start-order',
        'card-expanded-countdown',
        'countdown-audio-type',
        'countdown-current-race',
        `race-${appState.currentRace ? appState.currentRace.id : 'current'}`,
        'races-list'
    ];
    
    Object.keys(localStorage).forEach(key => {
        // Eliminar claves que no están en la lista de mantener
        if (!keysToKeep.includes(key) && 
            !key.startsWith('race-') && 
            !key.startsWith('backup-') &&
            key !== 'language-preference') {
            console.log(`🗑️ Eliminando clave antigua: ${key}`);
            localStorage.removeItem(key);
        }
    });
    
    console.log('✅ Limpieza de cachés completada');
}

function setupPWA() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.style.display = 'flex';
        }
    });
}

function installPWA() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                const t = translations[appState.currentLanguage];
                showMessage('Aplicación instalada', 'success');
            }
            appState.deferredPrompt = null;
        });
    }
}

function showUpdateNotification() {
    // Podrías añadir aquí una notificación visual al usuario
    // de que hay una nueva versión disponible
    console.log("Nueva versión disponible. Recarga la página para actualizar.");
    
    // Ejemplo de notificación simple
    const t = translations[appState.currentLanguage];
    showMessage(t.updateAvailable || "Nueva versión disponible", 'info');
}

// ============================================
// FUNCIONES DE SUGERENCIAS
// ============================================
function sendSuggestion() {
    const t = translations[appState.currentLanguage];
    
    const email = document.getElementById('suggestion-email').value.trim();
    const text = document.getElementById('suggestion-text').value.trim();
    
    if (!text) {
        showMessage(t.suggestionTextLabel, 'error');
        return;
    }
    
    console.log('Sugerencia enviada:', { email, text });
    
    document.getElementById('suggestions-modal').classList.remove('active');
    document.getElementById('suggestion-email').value = '';
    document.getElementById('suggestion-text').value = '';
    
    showMessage(t.suggestionSent || 'Sugerencia enviada', 'success');
}

// ============================================
// FUNCIONES DE MODALES
// ============================================

function handleCompleteRestart() {
    const t = translations[appState.currentLanguage];
    
    if (appState.countdownActive) {
        stopCountdown();
        document.getElementById('countdown-screen').classList.remove('active');
        document.querySelectorAll('.hide-on-countdown').forEach(el => {
            el.style.display = '';
        });
    }
    
    // Detener cronómetro de llegadas si está activo
    if (llegadasState.timerActive) {
        stopLlegadasTimer();
    }
    
    // Resetear todos los estados
    appState.departedCount = 0;
    appState.departureTimes = [];
    llegadasState.llegadas = [];
    llegadasState.currentTime = 0;
    llegadasState.startTime = null;
    
    if (appState.currentRace) {
        appState.currentRace.departures = [];
        saveRaceData();
    }
    
    appState.nextCorredorTime = 60;
    appState.currentIntervalIndex = 0;
    appState.accumulatedTime = 0;
    appState.raceStartTime = null;
    appState.countdownActive = false;
    appState.countdownPaused = false;
    
    // Actualizar UI
    document.getElementById('departed-count').textContent = '0';
    document.getElementById('start-position').value = 1;
    updateNextCorredorDisplay();
    
    renderDeparturesList();
    renderLlegadasList();
    document.getElementById('total-time-value').textContent = '00:00:00';
    
    // Actualizar cronómetro de llegadas
    document.getElementById('llegadas-timer-display').textContent = '00:00:00';
    
    // Limpiar almacenamiento
    localStorage.removeItem('countdown-app-state');
    localStorage.removeItem('llegadas-state');
    
    document.getElementById('restart-confirm-modal').classList.remove('active');
    
    showMessage(t.sessionRestarted, 'success');
    console.log("Sesión reiniciada, TODOS los datos borrados");
}

// ============================================
// FUNCIONES DE ORDEN DE SALIDA
// ============================================
function deleteStartOrder() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst || 'Selecciona una carrera primero', 'error');
        return;
    }
    
    if (startOrderData.length === 0 && 
        (!appState.currentRace.startOrder || appState.currentRace.startOrder.length === 0)) {
        showMessage(t.listAlreadyEmpty || 'La lista ya está vacía', 'info');
        return;
    }
    
    // Crear modal de confirmación
    createDeleteOrderConfirmationModal();
}

function createDeleteOrderConfirmationModal() {
    const t = translations[appState.currentLanguage];
    
    // Calcular estadísticas REALES (considerando ambos posibles orígenes)
    const currentData = startOrderData && startOrderData.length > 0 
        ? startOrderData 
        : (appState.currentRace.startOrder || []);
    
    const riderCount = currentData.length;
    
    if (riderCount === 0) {
        showMessage(t.listAlreadyEmpty || 'La lista ya está vacía', 'info');
        return;
    }
    
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.id = 'delete-order-confirm-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-exclamation-triangle"></i> ${t.deleteOrderTitle || 'Eliminar Orden de Salida'}</h3>
                <button class="modal-close" id="delete-order-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="delete-confirm-message">
                    <div class="warning-icon-large">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="warning-content">
                        <p class="warning-title">${t.confirmDeleteOrder || '¿Estás seguro de que quieres eliminar TODO el orden de salida?'}</p>
                        <p class="warning-subtitle">${t.deleteWarning || 'Esta acción no se puede deshacer.'}</p>
                        
                        <div class="delete-stats">
                            <div class="stat-item">
                                <i class="fas fa-users"></i>
                                <span class="stat-label">Corredores:</span>
                                <span class="stat-value">${riderCount}</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-flag-checkered"></i>
                                <span class="stat-label">Carrera:</span>
                                <span class="stat-value">${appState.currentRace ? appState.currentRace.name : 'Sin carrera'}</span>
                            </div>
                        </div>
                        
                        <div class="data-preview-small">
                            <h4>Vista previa de datos a eliminar:</h4>
                            <div class="preview-scroll">
                                ${getOrderPreviewForModal(currentData)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" id="confirm-delete-order-btn">
                    <i class="fas fa-trash"></i>
                    ${t.confirmDelete || 'Sí, eliminar todo'}
                </button>
                <button class="btn btn-secondary" id="cancel-delete-order-btn">
                    <i class="fas fa-times"></i>
                    ${t.cancelButtonText || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupDeleteOrderModalEvents(modal, currentData);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Añadir estilos si no existen
    addDeleteOrderModalStyles();
}

function setupDeleteOrderModalEvents(modal, currentData) {
    const confirmBtn = modal.querySelector('#confirm-delete-order-btn');
    const cancelBtn = modal.querySelector('#cancel-delete-order-btn');
    const closeBtn = modal.querySelector('#delete-order-close');
    
    // Confirmar eliminación - VERSIÓN CORREGIDA
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const t = translations[appState.currentLanguage];
        
        // 1. ELIMINAR DE AMBAS FUENTES
        startOrderData = []; // Limpiar datos globales
        
        if (appState.currentRace) {
            appState.currentRace.startOrder = []; // Limpiar datos de la carrera
            console.log("🗑️ Orden de salida eliminado de la carrera:", appState.currentRace.name);
        }
        
        // 2. Actualizar UI inmediatamente
        document.getElementById('total-riders').value = 1;
        
        if (typeof updateStartOrderTableThrottled === 'function') {
            updateStartOrderTableThrottled(true); // Forzar actualización
        }
        
        // 3. GUARDAR LOS CAMBIOS - Esto es CRÍTICO
        if (typeof saveRaceData === 'function') {
            console.log("💾 Guardando cambios después de eliminar orden...");
            saveRaceData(); // Esto guardará ambos como vacíos
        }
        
        // 4. También eliminar de localStorage global (para compatibilidad)
        localStorage.removeItem('start-order-data');
        localStorage.removeItem('cri_start_order_data');
        
        // 5. Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        // 6. Mostrar mensaje de éxito
        const successMessage = t.orderDeleted ? 
            t.orderDeleted.replace('{count}', currentData.length) : 
            `Orden de salida eliminado (${currentData.length} corredores)`;
        
        showMessage(successMessage, 'success');
        
        console.log("✅ Orden de salida eliminado completamente:", {
            carrera: appState.currentRace ? appState.currentRace.name : 'Sin carrera',
            corredoresEliminados: currentData.length,
            startOrderData: startOrderData.length,
            carreraStartOrder: appState.currentRace ? appState.currentRace.startOrder.length : 0
        });
    });
    
    // Cancelar eliminación
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.deleteCancelled || 'Eliminación cancelada', 'info');
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

function getOrderPreviewForModal(data) {
    if (!data || data.length === 0) {
        return '<div class="preview-empty">No hay datos para mostrar</div>';
    }
    
    // Mostrar solo los primeros 3 corredores como vista previa
    const previewCount = Math.min(3, data.length);
    let html = '<table class="mini-preview-table">';
    
    for (let i = 0; i < previewCount; i++) {
        const rider = data[i];
        html += `
        <tr>
            <td class="preview-order">${rider.order || ''}</td>
            <td class="preview-dorsal">${rider.dorsal || ''}</td>
            <td class="preview-name">${rider.nombre || ''} ${rider.apellidos || ''}</td>
            <td class="preview-time">${rider.horaSalida || ''}</td>
        </tr>
        `;
    }
    
    html += '</table>';
    
    if (data.length > 3) {
        html += `
        <div class="preview-more-info">
            <i class="fas fa-ellipsis-h"></i>
            ${data.length - 3} ${translations[appState.currentLanguage].moreRiders || 'más corredores...'}
        </div>
        `;
    }
    
    return html;
}

function addDeleteOrderModalStyles() {
    if (document.getElementById('delete-order-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'delete-order-modal-styles';
    style.textContent = `
        /* Estilos para el modal de eliminar orden */
        #delete-order-confirm-modal .modal-content {
            max-width: 500px;
        }
        
        .delete-confirm-message {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px 10px;
        }
        
        .warning-icon-large {
            font-size: 3.5rem;
            color: #dc3545;
            margin-bottom: 20px;
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(220, 53, 69, 0.1);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .warning-content {
            width: 100%;
        }
        
        .warning-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--danger);
            margin-bottom: 10px;
        }
        
        .warning-subtitle {
            font-size: 1rem;
            color: var(--gray);
            margin-bottom: 25px;
        }
        
        .delete-stats {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        
        .stat-item i {
            font-size: 1.8rem;
            color: var(--danger);
        }
        
        .stat-label {
            font-size: 0.9rem;
            color: var(--gray);
        }
        
        .stat-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--danger);
        }
        
        .data-preview-small {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            border: 1px solid #dee2e6;
        }
        
        .data-preview-small h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--gray-dark);
            font-size: 1rem;
            text-align: center;
        }
        
        .preview-scroll {
            max-height: 150px;
            overflow-y: auto;
            padding: 5px;
        }
        
        .mini-preview-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        
        .mini-preview-table tr {
            border-bottom: 1px solid #dee2e6;
        }
        
        .mini-preview-table tr:last-child {
            border-bottom: none;
        }
        
        .mini-preview-table td {
            padding: 8px 5px;
            text-align: left;
        }
        
        .preview-order {
            width: 20%;
            font-weight: 600;
            color: var(--primary);
        }
        
        .preview-dorsal {
            width: 15%;
            font-weight: 600;
            color: var(--info);
        }
        
        .preview-name {
            width: 45%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: var(--dark);
        }
        
        .preview-time {
            width: 20%;
            font-family: 'Courier New', monospace;
            color: var(--success);
        }
        
        .preview-more-info {
            text-align: center;
            padding: 10px;
            color: var(--gray);
            font-style: italic;
            font-size: 0.9rem;
        }
        
        .preview-more-info i {
            margin-right: 5px;
        }
        
        /* Scrollbar personalizada */
        .preview-scroll::-webkit-scrollbar {
            width: 6px;
        }
        
        .preview-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
        }
        
        .preview-scroll::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        
        .preview-scroll::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
        
        /* Modal footer específico */
        #delete-order-confirm-modal .modal-footer {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding: 20px;
            border-top: 1px solid #dee2e6;
        }
        
        /* Responsive */
        @media (max-width: 600px) {
            #delete-order-confirm-modal .modal-content {
                margin: 15px;
                width: calc(100% - 30px);
            }
            
            .delete-stats {
                flex-direction: column;
                gap: 20px;
            }
            
            #delete-order-confirm-modal .modal-footer {
                flex-direction: column;
            }
            
            #delete-order-confirm-modal .modal-footer button {
                width: 100%;
            }
        }
    `;
    
    document.head.appendChild(style);
}

function addNewRider() {
    const t = translations[appState.currentLanguage];
    const totalRiders = parseInt(document.getElementById('total-riders').value) || 1;
    
    const newRider = {
        order: startOrderData.length + 1,
        dorsal: 100 + startOrderData.length + 1,
        nombre: '',
        apellidos: '',
        chip: 'CHIP' + (100 + startOrderData.length + 1).toString().padStart(3, '0'),
        horaSalida: calculateStartTime(startOrderData.length),
        cronoSalida: secondsToTime(startOrderData.length * 60),
        horaSalidaReal: '',
        cronoSalidaReal: '',
        horaSalidaPrevista: '',
        cronoSalidaPrevista: '',
        horaSalidaImportado: '',
        cronoSalidaImportado: '',
        cronoSegundos: startOrderData.length * 60,
        horaSegundos: timeToSeconds(calculateStartTime(startOrderData.length))
    };
    
    startOrderData.push(newRider);
    document.getElementById('total-riders').value = startOrderData.length;
    updateStartOrderTableThrottled();
    saveStartOrderData();
    
    showMessage(t.riderAdded, 'success');
}

function updateStartOrderTimes() {
    updateTimeDifference();
    
    // Recalcular horas de salida para todos los corredores
    startOrderData.forEach((rider, index) => {
        rider.horaSalida = calculateStartTime(index);
        rider.horaSegundos = timeToSeconds(rider.horaSalida);
    });
    
    updateStartOrderTableThrottled();
    
    // Guardar automáticamente si hay una carrera seleccionada
    if (appState.currentRace) {
        saveRaceData();
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR
// ============================================
// Este evento se configura en CRI_main_config.js
// document.addEventListener('DOMContentLoaded', initApp);

// Guardar estado antes de cerrar
window.addEventListener('beforeunload', () => {
    if (appState.countdownActive) saveLastUpdate();
});

// ============================================
// MÓDULO DE COPIA DE SEGURIDAD
// ============================================

// ============================================
// MÓDULO DE COPIA DE SEGURIDAD POR CARRERA
// ============================================

// ============================================
// FUNCIONES DE COPIA DE SEGURIDAD
// ============================================

function setupBackupEventListeners() {
    console.log("Configurando listeners de copia de seguridad...");
    
    // Botón de copia de seguridad
    const backupBtn = document.getElementById('backup-race-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', createRaceBackup);
    }
    
    // Botón de restauración
    const restoreBtn = document.getElementById('restore-race-btn');
    if (restoreBtn) {
        restoreBtn.addEventListener('click', restoreRaceFromBackup);
    }
    
    console.log("Listeners de copia de seguridad configurados");
}

function createRaceBackup() {
    const t = translations[appState.currentLanguage];
    
    // Verificar si hay una carrera seleccionada
    if (!appState.currentRace) {
        showMessage(t.noRaceSelected || 'No hay carrera seleccionada', 'warning');
        return;
    }
    
    // Mostrar mensaje de progreso
    showMessage(t.creatingBackup || 'Creando copia de seguridad...', 'info');
    
    // Buscar la carrera completa en el array de carreras
    const raceInArray = appState.races.find(r => r.id === appState.currentRace.id);
    
    if (!raceInArray) {
        showMessage('No se encontraron datos completos de la carrera', 'error');
        return;
    }
    
    // Preparar datos COMPLETOS de la carrera
    const raceBackupData = {
        version: '1.0',
        appName: 'Crono CRI',
        exportDate: new Date().toISOString(),
        exportVersion: 'V_19_12_2025',
        dataType: 'single-race',
        race: {
            // Copiar TODOS los datos de la carrera del array
            id: raceInArray.id,
            name: raceInArray.name,
            date: raceInArray.date || new Date().toISOString().split('T')[0],
            category: raceInArray.category || '',
            organizer: raceInArray.organizer || '',
            location: raceInArray.location || '',
            modality: raceInArray.modality || 'CRI',
            description: raceInArray.description || '',
            firstStartTime: raceInArray.firstStartTime || '09:00:00',
            createdAt: raceInArray.createdAt,
            lastModified: new Date().toISOString(),
            departures: raceInArray.departures ? [...raceInArray.departures] : [],
            intervals: raceInArray.intervals ? [...raceInArray.intervals] : [],
            startOrder: raceInArray.startOrder ? [...raceInArray.startOrder] : [],
            metadata: raceInArray.metadata || {},
            
            // Incluir todos los datos adicionales que pueda tener
            ...(raceInArray.llegadas && { llegadas: [...raceInArray.llegadas] })
        },
        // Incluir también datos del estado actual relacionados con esta carrera
        currentState: {
            departureTimes: appState.departureTimes ? [...appState.departureTimes] : [],
            departedCount: appState.departedCount,
            raceStartTime: appState.raceStartTime,
            nextCorredorTime: appState.nextCorredorTime,
            countdownActive: appState.countdownActive,
            countdownPaused: appState.countdownPaused,
            countdownValue: appState.countdownValue
        },
        metadata: {
            raceName: raceInArray.name,
            raceDate: raceInArray.date,
            raceCategory: raceInArray.category,
            raceModality: raceInArray.modality,
            totalDepartures: raceInArray.departures ? raceInArray.departures.length : 0,
            totalInStartOrder: raceInArray.startOrder ? raceInArray.startOrder.length : 0,
            backupDate: new Date().toLocaleDateString('es-ES'),
            backupTime: new Date().toLocaleTimeString('es-ES')
        }
    };
    
    // Incluir datos de llegadas del estado global si existen para esta carrera
    if (llegadasState.llegadas && llegadasState.llegadas.length > 0) {
        // Filtrar llegadas por carrera (si tienes un campo de identificación de carrera)
        const raceLlegadas = llegadasState.llegadas.filter(llegada => {
            // Añadir lógica de filtrado si es necesario
            return true; // Por ahora incluye todas
        });
        
        if (raceLlegadas.length > 0) {
            raceBackupData.race.llegadas = [...raceLlegadas];
            raceBackupData.metadata.totalLlegadas = raceLlegadas.length;
        }
    }
    
    // Contar estadísticas
    const totalDepartures = raceBackupData.race.departures.length;
    const totalInOrder = raceBackupData.race.startOrder.length;
    const totalLlegadas = raceBackupData.race.llegadas ? raceBackupData.race.llegadas.length : 0;
    
    // Crear nombre del archivo
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4);
    const safeRaceName = raceInArray.name
        .replace(/[^a-z0-9]/gi, '_')
        .substring(0, 30);
    const filename = `crono_cri_${safeRaceName}_${dateStr}_${timeStr}.json`;
    
    // Crear Blob y descargar
    const blob = new Blob([JSON.stringify(raceBackupData, null, 2)], { 
        type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Mostrar mensaje de éxito - CORREGIDO
    const successMessage = t.backupCreated ? 
        t.backupCreated.replace('{filename}', filename) : 
        `Copia de seguridad creada: ${filename}`;
    
    let detailMessage = `${totalDepartures} salidas`;
    
    if (totalInOrder > 0) {
        detailMessage += `, ${totalInOrder} en orden de salida`;
    }
    
    if (totalLlegadas > 0) {
        detailMessage += `, ${totalLlegadas} llegadas`;
    }
    
    // Añadir información básica de la carrera
    detailMessage += ` | ${raceInArray.name}`;
    if (raceInArray.date) {
        detailMessage += ` (${raceInArray.date})`;
    }
    if (raceInArray.category) {
        detailMessage += ` - ${raceInArray.category}`;
    }
    
    showMessage(`${successMessage} - ${detailMessage}`, 'success');
    
    console.log("Copia de seguridad de carrera creada:", filename);
    console.log("Carrera:", raceInArray.name, "ID:", raceInArray.id);
    console.log("Datos incluidos:", raceBackupData.metadata);
    
    // Mostrar detalles en consola para depuración
    console.log("Detalles completos de la carrera guardada:", {
        nombre: raceInArray.name,
        fecha: raceInArray.date,
        categoria: raceInArray.category,
        modalidad: raceInArray.modality,
        organizador: raceInArray.organizer,
        ubicacion: raceInArray.location,
        descripcion: raceInArray.description,
        horaInicio: raceInArray.firstStartTime,
        salidas: totalDepartures,
        ordenSalida: totalInOrder,
        llegadas: totalLlegadas
    });
}

function restoreRaceFromBackup() {
    const t = translations[appState.currentLanguage];
    
    // Crear input de archivo
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Mostrar mensaje de progreso
        showMessage(t.restoringData, 'info');
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const backupData = JSON.parse(event.target.result);
                
                // Validar archivo de backup
                if (!isValidRaceBackupFile(backupData)) {
                    showMessage(t.invalidBackupFile, 'error');
                    return;
                }
                
                // Verificar que sea una copia de carrera individual
                if (backupData.dataType !== 'single-race') {
                    showMessage('Este archivo no es una copia de carrera individual', 'error');
                    return;
                }
                
                // Mostrar confirmación con opciones
                showRaceRestoreOptions(backupData);
                
            } catch (error) {
                console.error('Error parsing backup file:', error);
                showMessage(t.restoreError, 'error');
            }
        };
        
        reader.onerror = () => {
            showMessage(t.restoreError, 'error');
        };
        
        reader.readAsText(file);
    };
    
    document.body.appendChild(input);
    input.click();
    
    // Limpiar input
    setTimeout(() => {
        if (input.parentNode) {
            document.body.removeChild(input);
        }
    }, 1000);
}

function isValidRaceBackupFile(data) {
    return data && 
           data.version && 
           data.appName === 'Crono CRI' &&
           data.dataType === 'single-race' &&
           data.race && 
           data.race.name;
}

function showRaceRestoreOptions(backupData) {
    const t = translations[appState.currentLanguage];
    
    // Crear modal de opciones
    const modal = document.createElement('div');
    modal.id = 'race-restore-options-modal';
    modal.className = 'modal';
    
    const raceName = backupData.race.name;
    const totalDepartures = backupData.race.departures ? backupData.race.departures.length : 0;
    const totalInOrder = backupData.race.startOrder ? backupData.race.startOrder.length : 0;
    const totalLlegadas = backupData.race.llegadas ? backupData.race.llegadas.length : 0;
    const backupDate = formatBackupDate(backupData.exportDate);
    
    // Verificar si ya existe una carrera con este nombre
    const existingRaceIndex = appState.races.findIndex(r => r.name === raceName);
    const raceExists = existingRaceIndex !== -1;
    
    modal.innerHTML = `
        <div class="modal-content medium-modal">
            <div class="modal-header">
                <h3>${t.restoreTitle} - ${raceName}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="restore-race-info">
                    <div class="restore-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>${t.restoreWarning}</p>
                    </div>
                    
                    <div class="restore-details">
                        <h4>Información de la copia:</h4>
                        <p><i class="fas fa-flag-checkered"></i> Carrera: <strong>${raceName}</strong></p>
                        <p><i class="fas fa-clock"></i> Salidas registradas: <strong>${totalDepartures}</strong></p>
                        <p><i class="fas fa-list-ol"></i> En orden de salida: <strong>${totalInOrder}</strong></p>
                        ${totalLlegadas > 0 ? `<p><i class="fas fa-flag-checkered"></i> Llegadas: <strong>${totalLlegadas}</strong></p>` : ''}
                        <p><i class="fas fa-calendar"></i> Fecha backup: <strong>${backupDate}</strong></p>
                    </div>
                    
                    ${raceExists ? `
                    <div class="restore-existing-warning">
                        <i class="fas fa-exclamation-circle"></i>
                        <p><strong>¡Atención!</strong> Ya existe una carrera con el nombre "${raceName}".</p>
                    </div>
                    
                    <div class="restore-options">
                        <h4>Opciones de restauración:</h4>
                        <div class="radio-group">
                            <label class="radio-option">
                                <input type="radio" name="restore-option" value="replace" checked>
                                <span class="radio-label">Reemplazar carrera existente</span>
                                <span class="radio-description">Sobrescribirá la carrera "${raceName}" actual</span>
                            </label>
                            <label class="radio-option">
                                <input type="radio" name="restore-option" value="rename">
                                <span class="radio-label">Crear como nueva carrera</span>
                                <span class="radio-description">Se creará como "${raceName} (restaurada)"</span>
                            </label>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="restore-data-selection">
                        <h4>¿Qué datos restaurar?</h4>
                        <div class="checkbox-group">
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="departures" checked>
                                <span class="checkbox-label">Datos de salidas (${totalDepartures})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="startOrder" ${totalInOrder > 0 ? 'checked' : ''} ${totalInOrder === 0 ? 'disabled' : ''}>
                                <span class="checkbox-label">Orden de salida (${totalInOrder})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="llegadas" ${totalLlegadas > 0 ? 'checked' : ''} ${totalLlegadas === 0 ? 'disabled' : ''}>
                                <span class="checkbox-label">Datos de llegadas (${totalLlegadas})</span>
                            </label>
                            <label class="checkbox-option">
                                <input type="checkbox" name="restore-data" value="config" checked>
                                <span class="checkbox-label">Configuración (hora inicio, etc.)</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-success" id="confirm-race-restore-btn">
                    <i class="fas fa-check"></i> ${t.confirmRestore?.split('?')[0] || 'Confirmar Restauración'}
                </button>
                <button class="btn btn-danger" id="cancel-race-restore-btn">
                    <i class="fas fa-times"></i> ${t.cancel || 'Cancelar'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos del modal
    setupRaceRestoreModalEvents(modal, backupData, raceExists, existingRaceIndex);
    
    // Mostrar el modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function setupRaceRestoreModalEvents(modal, backupData, raceExists, existingRaceIndex) {
    const confirmBtn = modal.querySelector('#confirm-race-restore-btn');
    const cancelBtn = modal.querySelector('#cancel-race-restore-btn');
    const closeBtn = modal.querySelector('.modal-close');
    
    // Confirmar restauración
    confirmBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        // Obtener opciones seleccionadas
        const restoreOption = modal.querySelector('input[name="restore-option"]:checked')?.value || 'replace';
        const selectedData = Array.from(modal.querySelectorAll('input[name="restore-data"]:checked'))
            .map(cb => cb.value);
        
        // Realizar la restauración
        performRaceRestore(backupData, restoreOption, selectedData, existingRaceIndex);
        
        // Cerrar modal
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    });
    
    // Cancelar
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
        
        const t = translations[appState.currentLanguage];
        showMessage(t.timeChangeCancelled || 'Operación cancelada', 'info');
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
    
    // Añadir estilos
    addRaceRestoreModalStyles();
}

function performRaceRestore(backupData, restoreOption, selectedData, existingRaceIndex) {
    const t = translations[appState.currentLanguage];
    
    try {
        // Detener procesos activos si están relacionados con esta carrera
        if (appState.countdownActive && appState.currentRace) {
            const currentRaceName = appState.currentRace.name;
            const backupRaceName = backupData.race.name;
            
            if (currentRaceName === backupRaceName || 
                (restoreOption === 'replace' && existingRaceIndex !== -1 && 
                 appState.races[existingRaceIndex].name === backupRaceName)) {
                stopCountdown();
            }
        }
        
        // Preparar datos restaurados COMPLETOS
        let restoredRace = {
            id: backupData.race.id,
            name: backupData.race.name,
            date: backupData.race.date || new Date().toISOString().split('T')[0],
            category: backupData.race.category || '',
            organizer: backupData.race.organizer || '',
            location: backupData.race.location || '',
            modality: backupData.race.modality || 'CRI',
            description: backupData.race.description || '',
            firstStartTime: backupData.race.firstStartTime || '09:00:00',
            createdAt: backupData.race.createdAt,
            lastModified: new Date().toISOString(),
            metadata: backupData.race.metadata || {}
        };
        
        // Aplicar datos seleccionados
        if (selectedData.includes('departures')) {
            restoredRace.departures = backupData.race.departures ? [...backupData.race.departures] : [];
        } else {
            restoredRace.departures = [];
        }
        
        if (selectedData.includes('startOrder')) {
            restoredRace.startOrder = backupData.race.startOrder ? [...backupData.race.startOrder] : [];
        } else {
            restoredRace.startOrder = [];
        }
        
        if (selectedData.includes('llegadas') && backupData.race.llegadas) {
            restoredRace.llegadas = [...backupData.race.llegadas];
        }
        
        if (selectedData.includes('config')) {
            restoredRace.intervals = backupData.race.intervals ? [...backupData.race.intervals] : [];
            // También restaurar configuración si existe
            if (backupData.race.firstStartTime) {
                restoredRace.firstStartTime = backupData.race.firstStartTime;
            }
        } else {
            restoredRace.intervals = [];
        }
        
        // Manejar opciones de restauración
        if (restoreOption === 'rename' || (existingRaceIndex === -1)) {
            // Crear nueva carrera con nombre modificado
            if (restoreOption === 'rename') {
                restoredRace.name = `${backupData.race.name} (restaurada ${new Date().toLocaleDateString('es-ES')})`;
            }
            restoredRace.id = Date.now(); // Nuevo ID
            restoredRace.createdAt = new Date().toISOString();
            
            appState.races.push(restoredRace);
            appState.currentRace = restoredRace;
            
        } else if (restoreOption === 'replace' && existingRaceIndex !== -1) {
            // Reemplazar carrera existente
            const originalId = appState.races[existingRaceIndex].id;
            const originalCreatedAt = appState.races[existingRaceIndex].createdAt;
            
            // Preservar ID y fecha de creación original
            restoredRace.id = originalId;
            restoredRace.createdAt = originalCreatedAt;
            
            appState.races[existingRaceIndex] = restoredRace;
            
            // Si esta era la carrera actual, actualizarla
            if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
                appState.currentRace = restoredRace;
            }
        }
        
        // Si esta carrera restaurada es la actual, cargar sus datos
        if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
            // Cargar datos específicos del estado actual
            if (selectedData.includes('departures') && backupData.currentState) {
                appState.departureTimes = backupData.currentState.departureTimes ? 
                    [...backupData.currentState.departureTimes] : [];
                appState.departedCount = backupData.currentState.departedCount || 0;
                appState.raceStartTime = backupData.currentState.raceStartTime || null;
                appState.nextCorredorTime = backupData.currentState.nextCorredorTime || 60;
            }
            
            // Cargar datos de llegadas si se seleccionaron
            if (selectedData.includes('llegadas') && backupData.race.llegadas) {
                // Actualizar estado de llegadas
                if (!llegadasState.llegadas) {
                    llegadasState.llegadas = [];
                }
                // Filtrar llegadas existentes de esta carrera y añadir las nuevas
                llegadasState.llegadas = [
                    ...llegadasState.llegadas.filter(l => 
                        !backupData.race.llegadas.some(bl => bl.dorsal === l.dorsal)
                    ),
                    ...backupData.race.llegadas
                ];
            }
            
            // Cargar datos de orden de salida
            if (selectedData.includes('startOrder') && backupData.race.startOrder) {
                startOrderData = [...backupData.race.startOrder];
            }
            
            // Actualizar campos en la UI si es necesario
            if (selectedData.includes('config')) {
                // Actualizar hora de inicio en el input
                const firstStartTimeInput = document.getElementById('first-start-time');
                if (firstStartTimeInput && restoredRace.firstStartTime) {
                    firstStartTimeInput.value = restoredRace.firstStartTime;
                }
            }
            
            // AÑADIR ESTO: Actualizar título de la tarjeta de gestión
            if (typeof updateRaceManagementCardTitle === 'function') {
                updateRaceManagementCardTitle();
            }
        }
        
        // Guardar en localStorage
        saveRacesToStorage();
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
        
        // Actualizar UI
        renderRacesSelect();
        
        if (appState.currentRace && appState.currentRace.id === restoredRace.id) {
            loadRaceData();
            renderDeparturesList();
            renderLlegadasList();
            updateStartOrderTableThrottled();
            updateRaceManagementCardTitle();
        }
        
        // Mostrar mensaje de éxito
        let successDetails = [];
        if (selectedData.includes('departures')) {
            successDetails.push(`${restoredRace.departures.length} salidas`);
        }
        if (selectedData.includes('startOrder') && restoredRace.startOrder.length > 0) {
            successDetails.push(`${restoredRace.startOrder.length} en orden de salida`);
        }
        if (selectedData.includes('llegadas') && restoredRace.llegadas && restoredRace.llegadas.length > 0) {
            successDetails.push(`${restoredRace.llegadas.length} llegadas`);
        }
        
        const successMessage = `${t.restoreSuccess} - ${restoredRace.name}`;
        const detailMessage = successDetails.length > 0 ? `(${successDetails.join(', ')})` : '';
        
        showMessage(`${successMessage} ${detailMessage}`, 'success');
        
        console.log("Carrera restaurada COMPLETA:", {
            nombre: restoredRace.name,
            fecha: restoredRace.date,
            categoria: restoredRace.category,
            modalidad: restoredRace.modality,
            salidas: restoredRace.departures.length,
            ordenSalida: restoredRace.startOrder.length,
            llegadas: restoredRace.llegadas ? restoredRace.llegadas.length : 0
        });
        
    } catch (error) {
        console.error('Error restoring race data:', error);
        showMessage(t.restoreError, 'error');
    }
}

function formatBackupDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function addRaceRestoreModalStyles() {
    if (document.getElementById('race-restore-modal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'race-restore-modal-styles';
    style.textContent = `
        .restore-race-info {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .restore-warning {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: var(--border-radius);
            color: #856404;
        }
        
        .restore-existing-warning {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 15px;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: var(--border-radius);
            color: #721c24;
        }
        
        .restore-warning i,
        .restore-existing-warning i {
            font-size: 1.5rem;
            margin-top: 2px;
            flex-shrink: 0;
        }
        
        .restore-warning i {
            color: #f39c12;
        }
        
        .restore-existing-warning i {
            color: #e74c3c;
        }
        
        .restore-details {
            padding: 15px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
        }
        
        .restore-details h4,
        .restore-options h4,
        .restore-data-selection h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: var(--dark);
            font-size: 1.1rem;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 8px;
        }
        
        .restore-details p {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
            color: var(--gray);
        }
        
        .restore-details i {
            color: var(--primary);
            width: 20px;
            text-align: center;
        }
        
        .restore-details strong {
            color: var(--dark);
            margin-left: 5px;
        }
        
        /* Opciones de radio */
        .radio-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin: 15px 0;
        }
        
        .radio-option {
            display: flex;
            flex-direction: column;
            padding: 12px;
            background: #f8f9fa;
            border: 2px solid #dee2e6;
            border-radius: var(--border-radius);
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .radio-option:hover {
            border-color: var(--primary);
            background: #e8f4fd;
        }
        
        .radio-option input[type="radio"]:checked + .radio-label {
            color: var(--primary);
            font-weight: 600;
        }
        
        .radio-option input[type="radio"]:checked ~ .radio-description {
            color: var(--dark);
        }
        
        .radio-label {
            font-weight: 500;
            margin-bottom: 4px;
        }
        
        .radio-description {
            font-size: 0.9rem;
            color: var(--gray);
            margin-left: 24px;
        }
        
        /* Opciones de checkbox */
        .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 15px 0;
        }
        
        .checkbox-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
        
        .checkbox-option:hover {
            background: #e8f4fd;
        }
        
        .checkbox-option input[type="checkbox"]:disabled + .checkbox-label {
            color: #adb5bd;
            cursor: not-allowed;
        }
        
        .checkbox-label {
            font-weight: 500;
        }
        
        .medium-modal {
            max-width: 600px;
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Añadir esta función al archivo principal (Main.js)
function initBackupModule() {
    // Verificar si ya se inicializó
    if (window.backupModuleInitialized) {
        console.log("Módulo de backup ya inicializado");
        return;
    }
    
    if (typeof setupBackupEventListeners === 'function') {
        setupBackupEventListeners();
        window.backupModuleInitialized = true;
        console.log("Módulo de backup inicializado");
    }
}

function setupRaceFormEvents() {
    // Verificar si ya se configuró
    if (window.raceFormEventsConfigured) {
        console.log("Eventos del formulario de carrera ya configurados");
        return;
    }
    
    console.log("Configurando eventos del formulario de carrera...");
    
    // Mostrar/ocultar campo de "Otras modalidades"
    document.querySelectorAll('input[name="modality"]').forEach(input => {
        input.addEventListener('change', function() {
            const otherContainer = document.getElementById('other-modality-container');
            if (this.value === 'Otras') {
                otherContainer.style.display = 'block';
                document.getElementById('new-race-other-modality').focus();
            } else {
                otherContainer.style.display = 'none';
                document.getElementById('new-race-other-modality').value = '';
            }
        });
    });
    
    // Validación en tiempo real del nombre
    const nameInput = document.getElementById('new-race-name');
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('invalid-input');
            } else {
                this.classList.remove('invalid-input');
            }
        });
    }
    
    window.raceFormEventsConfigured = true;
    console.log("Eventos del formulario de carrera configurados");
}

// ============================================
// FUNCIÓN PARA EDITAR DETALLES DE LA CARRERA
// ============================================
function editRaceDetails() {
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst || 'Selecciona una carrera primero', 'error');
        return;
    }
    
    const race = appState.currentRace;
    const modal = document.getElementById('edit-race-modal');
    
    if (!modal) {
        console.error("Modal de edición de carrera no encontrado");
        showMessage("Error: No se puede abrir el editor", 'error');
        return;
    }
    
    // Llenar el formulario con los datos actuales
    document.getElementById('edit-race-name').value = race.name;
    document.getElementById('edit-race-category').value = race.category || '';
    document.getElementById('edit-race-organizer').value = race.organizer || '';
    document.getElementById('edit-race-location').value = race.location || '';
    document.getElementById('edit-race-date').value = race.date || new Date().toISOString().split('T')[0];
    document.getElementById('edit-race-description').value = race.description || '';
    
    // Configurar modalidad
    const modality = race.modality || 'CRI';
    const originalModality = race.metadata?.originalModality || 'CRI';
    
    // Resetear todos los radios primero
    document.querySelectorAll('input[name="edit-modality"]').forEach(radio => {
        radio.checked = false;
    });
    
    if (originalModality === 'CRI') {
        document.getElementById('edit-modality-cri').checked = true;
    } else if (originalModality === 'CRE') {
        document.getElementById('edit-modality-cre').checked = true;
    } else if (originalModality === 'Descenso') {
        document.getElementById('edit-modality-descenso').checked = true;
    } else if (originalModality === 'Otras') {
        document.getElementById('edit-modality-otras').checked = true;
        document.getElementById('edit-race-other-modality').value = modality;
        document.getElementById('edit-other-modality-container').style.display = 'block';
    } else {
        // Si es una modalidad personalizada
        document.getElementById('edit-modality-otras').checked = true;
        document.getElementById('edit-race-other-modality').value = modality;
        document.getElementById('edit-other-modality-container').style.display = 'block';
    }
    
    // Mostrar/ocultar campo de otras modalidades
    const otherContainer = document.getElementById('edit-other-modality-container');
    if (originalModality === 'Otras' || !['CRI', 'CRE', 'Descenso'].includes(originalModality)) {
        otherContainer.style.display = 'block';
    } else {
        otherContainer.style.display = 'none';
    }
    
    // Mostrar información de creación
    if (race.createdAt) {
        const createdDate = new Date(race.createdAt);
        document.getElementById('edit-race-created-at').textContent = 
            createdDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    }
    
    if (race.lastModified) {
        const modifiedDate = new Date(race.lastModified);
        document.getElementById('edit-race-last-modified').textContent = 
            modifiedDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
    }
    
    // Configurar eventos de modalidad
    document.querySelectorAll('input[name="edit-modality"]').forEach(input => {
        input.addEventListener('change', function() {
            const otherEditContainer = document.getElementById('edit-other-modality-container');
            if (this.value === 'Otras') {
                otherEditContainer.style.display = 'block';
                document.getElementById('edit-race-other-modality').focus();
            } else {
                otherEditContainer.style.display = 'none';
                document.getElementById('edit-race-other-modality').value = '';
            }
        });
    });
    
    // Configurar botón de guardar
    const saveBtn = modal.querySelector('#save-edit-race-btn');
    if (saveBtn) {
        saveBtn.onclick = saveEditedRace;
    }
    
    // Configurar botón de cancelar
    const cancelBtn = modal.querySelector('#cancel-edit-race-btn');
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            modal.classList.remove('active');
        };
    }
    
    // Configurar cierre del modal
    const closeBtn = modal.querySelector('#edit-race-modal-close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.classList.remove('active');
        };
    }
    
    // Cerrar al hacer clic fuera
    modal.onclick = function(e) {
        if (e.target === this) {
            modal.classList.remove('active');
        }
    };
    
    // Mostrar modal
    modal.classList.add('active');
    document.getElementById('edit-race-name').focus();
    
    console.log("Editando carrera:", race.name, "ID:", race.id);
}
// ============================================
// FUNCIÓN PARA GUARDAR CARRERA EDITADA (CON VALIDACIÓN)
// ============================================
function saveEditedRace() {
    const t = translations[appState.currentLanguage];
    const modal = document.getElementById('edit-race-modal');
    
    // Verificar que el modal existe
    if (!modal) {
        console.error("Modal de edición no encontrado");
        showMessage("Error: No se puede guardar los cambios", 'error');
        return;
    }
    
    // Obtener elementos con verificación
    const nameElement = document.getElementById('edit-race-name');
    const categoryElement = document.getElementById('edit-race-category');
    const organizerElement = document.getElementById('edit-race-organizer');
    const locationElement = document.getElementById('edit-race-location');
    const dateElement = document.getElementById('edit-race-date');
    const descriptionElement = document.getElementById('edit-race-description');
    const otherModalityElement = document.getElementById('edit-race-other-modality');
    
    // Verificar que todos los elementos requeridos existen
    if (!nameElement || !dateElement) {
        console.error("Elementos del formulario no encontrados");
        console.log("Elementos encontrados:", {
            nameElement: !!nameElement,
            categoryElement: !!categoryElement,
            organizerElement: !!organizerElement,
            locationElement: !!locationElement,
            dateElement: !!dateElement,
            descriptionElement: !!descriptionElement,
            otherModalityElement: !!otherModalityElement
        });
        showMessage("Error: Formulario incompleto", 'error');
        return;
    }
    
    // Obtener valores del formulario
    const name = nameElement.value.trim();
    const category = categoryElement ? categoryElement.value.trim() : '';
    const organizer = organizerElement ? organizerElement.value.trim() : '';
    const location = locationElement ? locationElement.value.trim() : '';
    const date = dateElement.value;
    const description = descriptionElement ? descriptionElement.value.trim() : '';
    
    // Obtener modalidad
    const modalityInput = document.querySelector('input[name="edit-modality"]:checked');
    let modality = modalityInput ? modalityInput.value : 'CRI';
    let otherModality = '';
    
    if (modality === 'Otras' && otherModalityElement) {
        otherModality = otherModalityElement.value.trim();
        if (otherModality) {
            modality = otherModality;
        }
    }
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName || 'Introduce un nombre para la carrera', 'error');
        nameElement.focus();
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate || 'Introduce una fecha válida', 'error');
        dateElement.focus();
        return;
    }
    
    // Buscar el índice de la carrera actual
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    
    if (raceIndex === -1) {
        showMessage(t.raceNotFound || 'Carrera no encontrada', 'error');
        modal.classList.remove('active');
        return;
    }
    
    // Crear copia actualizada de la carrera
    const updatedRace = {
        ...appState.currentRace, // Mantener todas las propiedades existentes
        name: name,
        category: category,
        organizer: organizer,
        location: location,
        date: date,
        modality: modality,
        description: description,
        lastModified: new Date().toISOString()
    };
    
    // Actualizar metadata si existe
    if (!updatedRace.metadata) {
        updatedRace.metadata = {};
    }
    updatedRace.metadata.originalModality = modalityInput ? modalityInput.value : 'CRI';
    updatedRace.metadata.otherModality = otherModality;
    
    // Actualizar la carrera en el array
    appState.races[raceIndex] = updatedRace;
    
    // Actualizar la carrera actual
    appState.currentRace = updatedRace;
    
    // Guardar en localStorage
    saveRacesToStorage();
    
    // Actualizar el selector de carreras
    renderRacesSelect();
    
    // AÑADIR ESTO: Actualizar título de la tarjeta de gestión
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    // Cerrar modal
    modal.classList.remove('active');
    
    // Mostrar mensaje de éxito
    showMessage(t.raceUpdated || 'Carrera actualizada correctamente', 'success');
    
    console.log(`Carrera "${name}" actualizada correctamente`, {
        id: updatedRace.id,
        name: updatedRace.name,
        date: updatedRace.date,
        category: updatedRace.category,
        modality: updatedRace.modality
    });
}
function saveRaceChanges() {
    const t = translations[appState.currentLanguage];
    
    // Obtener valores del formulario
    const name = document.getElementById('new-race-name').value.trim();
    const date = document.getElementById('new-race-date').value;
    const category = document.getElementById('new-race-category').value;
    const organizer = document.getElementById('new-race-organizer').value.trim();
    const location = document.getElementById('new-race-location').value.trim();
    const description = document.getElementById('new-race-description').value.trim();
    
    // Obtener modalidad
    const modalityInput = document.querySelector('input[name="modality"]:checked');
    let modality = modalityInput ? modalityInput.value : 'CRI';
    let otherModality = '';
    
    if (modality === 'Otras') {
        otherModality = document.getElementById('new-race-other-modality').value.trim();
        if (otherModality) {
            modality = otherModality;
        }
    }
    
    // Validaciones
    if (!name) {
        showMessage(t.enterRaceName, 'error');
        return;
    }
    
    if (!date) {
        showMessage(t.enterValidDate, 'error');
        return;
    }
    
    // Actualizar carrera actual
    appState.currentRace.name = name;
    appState.currentRace.date = date;
    appState.currentRace.category = category;
    appState.currentRace.organizer = organizer;
    appState.currentRace.location = location;
    appState.currentRace.modality = modality;
    appState.currentRace.description = description;
    appState.currentRace.lastModified = new Date().toISOString();
    
    if (!appState.currentRace.metadata) {
        appState.currentRace.metadata = {};
    }
    appState.currentRace.metadata.originalModality = modalityInput ? modalityInput.value : 'CRI';
    appState.currentRace.metadata.otherModality = otherModality;
    
    // Actualizar en el array de carreras
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races[raceIndex] = { ...appState.currentRace };
    }
    
    // Guardar cambios
    saveRacesToStorage();
    renderRacesSelect();
    
    // AÑADIR ESTO: Actualizar título de la tarjeta de gestión
    if (typeof updateRaceManagementCardTitle === 'function') {
        updateRaceManagementCardTitle();
    }
    
    // Cerrar modal y resetear
    document.getElementById('new-race-modal').classList.remove('active');
    resetRaceForm();
    
    // Restaurar botón original
    const createBtn = document.getElementById('create-race-btn');
    createBtn.textContent = t.createRace || 'Crear carrera';
    createBtn.onclick = createNewRace;
    
    // Actualizar título del modal
    document.getElementById('new-race-modal-title').textContent = t.newRaceModalTitle || 'Nueva carrera';
    
    // Mostrar mensaje de éxito
    showMessage(t.raceUpdated || 'Carrera actualizada correctamente', 'success');
    
    // Actualizar título de la tarjeta
    updateRaceManagementCardTitle();
    
    console.log("Carrera actualizada:", appState.currentRace);
}
// ========
// 
// ============================================
// FUNCIÓN CORREGIDA PARA ACTUALIZAR TÍTULO (EVITA CICLO INFINITO)
// ============================================
function updateRaceManagementCardTitle() {
    const titleElement = document.getElementById('card-race-title');
    
    if (!titleElement) {
        console.log("⚠️ Elemento del título de gestión no encontrado");
        return;
    }
    
    // Verificar si ya estamos actualizando (prevenir recursión)
    if (window.isUpdatingRaceTitle) {
        console.log("⚠️ Ya se está actualizando el título, evitando recursión");
        return;
    }
    
    window.isUpdatingRaceTitle = true;
    
    try {
        if (appState.currentRace && appState.currentRace.name) {
            const t = translations[appState.currentLanguage];
            
            // Crear el título simple
            let titleHTML = `<i class="fas fa-flag-checkered"></i> ${appState.currentRace.name}`;
            
            // Añadir fecha si existe
            if (appState.currentRace.date) {
                titleHTML += ` <span class="race-date">(${appState.currentRace.date})</span>`;
            }
            
            titleElement.innerHTML = titleHTML;
            titleElement.classList.add('race-title-active');
            
            console.log("📝 Título de gestión actualizado:", appState.currentRace.name);
        } else {
            // Si no hay carrera seleccionada, mostrar el título por defecto
            const t = translations[appState.currentLanguage];
            titleElement.innerHTML = `<i class="fas fa-flag-checkered"></i> ${t.raceManagement || 'Gestión de Carrera'}`;
            titleElement.classList.remove('race-title-active');
            
            console.log("📝 Título de gestión restablecido (sin carrera)");
        }
    } catch (error) {
        console.error("❌ Error actualizando título:", error);
    } finally {
        // Liberar el bloqueo después de un breve retraso
        setTimeout(() => {
            window.isUpdatingRaceTitle = false;
        }, 100);
    }
}
// ============================================
// AÑADIR ESTILOS PARA EL TÍTULO DE GESTIÓN
// ============================================
function addRaceManagementCardStyles() {
    if (document.getElementById('race-management-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'race-management-styles';
    style.textContent = `
        /* Estilos para el título de gestión de carrera */
        #rcard-race-title{
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0;
            padding: 10px 0;
            transition: all 0.3s ease;
        }
        
        #card-race-title.race-title-active {
            color: var(--primary);
            font-weight: 600;
        }
        
        #card-race-title.race-title-active i {
            font-size: 1.2em;
        }
        
        .race-date {
            font-size: 0.85em;
            color: var(--gray);
            font-weight: normal;
            margin-left: 5px;
        }
        
        .llegadas-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--success);
            color: white;
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 10px;
            font-weight: 600;
            vertical-align: middle;
        }
        
        .llegadas-badge i {
            font-size: 0.9em;
        }
        
        .active-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: var(--danger);
            color: white;
            font-size: 0.75em;
            padding: 2px 8px;
            border-radius: 12px;
            margin-left: 10px;
            font-weight: 600;
            vertical-align: middle;
            animation: pulse 1.5s infinite;
        }
        
        .active-badge i {
            font-size: 0.9em;
        }
        
        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
    `;
    
    document.head.appendChild(style);
    console.log("Estilos del título de gestión añadidos");
}

// ============================================
// ACTUALIZAR INICIALIZACIÓN
// ============================================
// Añadir esta llamada a la inicialización de la aplicación
// En la función initApp (en tu archivo principal) o en DOMContentLoaded:

function initRaceManagementCard() {
    console.log("Inicializando tarjeta de gestión de carrera...");
    
    // Añadir estilos
    addRaceManagementCardStyles();
    
    // Actualizar título inicial
    updateRaceManagementCardTitle();
    
    // Establecer intervalo para actualizar dinámicamente (opcional)
    setInterval(updateRaceManagementCardTitle, 5000);
    
    console.log("Tarjeta de gestión de carrera inicializada");
}

// FUNCIÓN PARA GUARDAR CAMBIOS EN ORDEN DE SALIDA
function saveStartOrderChanges() {
    console.log("Guardando cambios en orden de salida...");
    
    if (!appState.currentRace) {
        console.log("No hay carrera actual, guardando solo en localStorage");
        if (startOrderData.length > 0) {
            localStorage.setItem('start-order-data', JSON.stringify(startOrderData));
        }
        return;
    }
    
    // Guardar en la carrera actual
    appState.currentRace.startOrder = [...startOrderData];
    
    // Guardar en localStorage específico de la carrera
    const raceKey = `race-${appState.currentRace.id}`;
    const existingData = localStorage.getItem(raceKey);
    
    if (existingData) {
        try {
            const data = JSON.parse(existingData);
            data.startOrderData = [...startOrderData];
            localStorage.setItem(raceKey, JSON.stringify(data));
        } catch (error) {
            console.error("Error actualizando datos de carrera:", error);
        }
    }
    
    // También guardar en la estructura general
    saveRaceData();
    
    console.log("Cambios en orden de salida guardados:", startOrderData.length, "corredores");
}

// FUNCIÓN PARA GUARDAR CAMBIOS EN ORDEN DE SALIDA (VERSIÓN MEJORADA)
function saveStartOrderChanges() {
    console.log("Guardando cambios en orden de salida...");
    
    if (!appState.currentRace) {
        console.log("No hay carrera actual, no se puede guardar");
        showMessage("No hay carrera seleccionada para guardar cambios", 'warning');
        return;
    }
    
    // Validar que hay datos para guardar
    if (!startOrderData || startOrderData.length === 0) {
        console.log("No hay datos de orden de salida para guardar");
        return;
    }
    
    // 1. Guardar en la carrera actual en memoria
    appState.currentRace.startOrder = [...startOrderData];
    console.log("Datos guardados en carrera actual (memoria):", startOrderData.length, "corredores");
    
    // 2. Actualizar en el array de carreras
    const raceIndex = appState.races.findIndex(r => r.id === appState.currentRace.id);
    if (raceIndex !== -1) {
        appState.races[raceIndex].startOrder = [...startOrderData];
        console.log("Carrera actualizada en array de carreras");
    }
    
    // 3. Guardar en localStorage específico de la carrera
    const raceKey = `race-${appState.currentRace.id}`;
    const existingData = localStorage.getItem(raceKey);
    
    if (existingData) {
        try {
            const data = JSON.parse(existingData);
            data.startOrderData = [...startOrderData];
            localStorage.setItem(raceKey, JSON.stringify(data));
            console.log("Datos guardados en localStorage específico:", raceKey);
        } catch (error) {
            console.error("Error actualizando datos de carrera en localStorage:", error);
        }
    } else {
        // Crear nuevo registro si no existe
        const newRaceData = {
            startOrderData: [...startOrderData],
            departureTimes: appState.departureTimes || [],
            departedCount: appState.departedCount || 0,
            raceStartTime: appState.raceStartTime || null,
            intervals: appState.intervals || []
        };
        localStorage.setItem(raceKey, JSON.stringify(newRaceData));
        console.log("Nuevo registro creado en localStorage:", raceKey);
    }
    
    // 4. Guardar en la estructura general
    saveRacesToStorage();
    
    // 5. Mostrar confirmación
    console.log("✅ Cambios en orden de salida guardados correctamente");
    console.log("- Carrera:", appState.currentRace.name);
    console.log("- Corredores:", startOrderData.length);
    
    // Opcional: mostrar mensaje al usuario
    const t = translations[appState.currentLanguage];
    showMessage(t.orderSaved || 'Orden de salida guardado correctamente', 'success');
}

// ============================================
// FUNCIÓN PARA LIMPIAR COMPLETAMENTE EL ESTADO
// ============================================
function cleanAppState() {
    console.log("🧹 Limpiando estado completo de la aplicación...");
    
    // Limpiar estado de la aplicación
    appState.currentRace = null;
    appState.races = appState.races || [];
    startOrderData = [];
    appState.departureTimes = [];
    appState.departedCount = 0;
    appState.intervals = [];
    appState.raceStartTime = null;
    appState.countdownActive = false;
    appState.countdownValue = 0;
    appState.countdownPaused = false;
    
    // Limpiar localStorage específico
    localStorage.removeItem('countdown-current-race');
    localStorage.removeItem('start-order-data');
    localStorage.removeItem('cri_start_order_data');
    localStorage.removeItem('countdown-app-state');
    
    // Guardar array vacío o actualizado de carreras
    localStorage.setItem('countdown-races', JSON.stringify(appState.races));
    
    console.log("✅ Estado limpiado completamente");
}

// ============================================
// FUNCIÓN DE DIAGNÓSTICO
// ============================================
function diagnoseRaceDeletion() {
    console.log("🔍 === DIAGNÓSTICO COMPLETO DE CARRERAS ===");
    
    // 1. Estado de la aplicación
    console.log("1. ESTADO DE LA APLICACIÓN:");
    console.log("   - Carrera actual:", appState.currentRace ? `${appState.currentRace.name} (ID: ${appState.currentRace.id})` : "Ninguna");
    console.log("   - Total carreras en array:", appState.races.length);
    
    // 2. Lista detallada de carreras
    console.log("2. LISTA DE CARRERAS:");
    appState.races.forEach((race, index) => {
        console.log(`   ${index + 1}. ${race.name} (ID: ${race.id}) - ${race.date || 'Sin fecha'}`);
    });
    
    // 3. Estado de localStorage
    console.log("3. LOCALSTORAGE:");
    console.log("   - 'countdown-races':", localStorage.getItem('countdown-races') ? `${JSON.parse(localStorage.getItem('countdown-races')).length} carreras` : "No existe");
    console.log("   - 'countdown-current-race':", localStorage.getItem('countdown-current-race') ? "Existe" : "No existe");
    
    // 4. Estado de botones
    console.log("4. ESTADO DE BOTONES:");
    const buttonsToCheck = ['delete-race-btn', 'edit-race-btn', 'export-order-btn'];
    buttonsToCheck.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`   - ${id}: ${btn.disabled ? 'DESHABILITADO' : 'HABILITADO'} ${btn.disabled ? '(title: ' + btn.title + ')' : ''}`);
        }
    });
    
    // 5. Sincronización
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    console.log("5. SINCRONIZACIÓN:");
    console.log("   - Memoria vs localStorage:", appState.races.length === savedRaces.length ? "OK" : "DESINCRONIZADO");
    console.log("   - Carreras en memoria:", appState.races.length);
    console.log("   - Carreras en localStorage:", savedRaces.length);
    
    console.log("=== DIAGNÓSTICO COMPLETADO ===");
}

// ============================================
// FUNCIÓN PARA ACTUALIZAR ESTADO DEL BOTÓN DE BORRAR CARRERA
// ============================================
function updateDeleteRaceButtonState() {
    const deleteRaceBtn = document.getElementById('delete-race-btn');
    const deleteRaceConfirmBtn = document.getElementById('delete-race-confirm-btn');
    
    if (!deleteRaceBtn || !deleteRaceConfirmBtn) {
        console.log("Botones de eliminar carrera no encontrados");
        return;
    }
    
    if (appState.currentRace) {
        // Hay carrera seleccionada - habilitar botón
        deleteRaceBtn.disabled = false;
        deleteRaceBtn.classList.remove('disabled');
        deleteRaceBtn.title = "Eliminar carrera actual";
        
        deleteRaceConfirmBtn.disabled = false;
        deleteRaceConfirmBtn.classList.remove('disabled');
        
        console.log("✅ Botón de eliminar carrera HABILITADO para:", appState.currentRace.name);
    } else {
        // No hay carrera seleccionada - deshabilitar botón
        deleteRaceBtn.disabled = true;
        deleteRaceBtn.classList.add('disabled');
        deleteRaceBtn.title = "Selecciona una carrera primero";
        
        deleteRaceConfirmBtn.disabled = true;
        deleteRaceConfirmBtn.classList.add('disabled');
        
        console.log("⚠️ Botón de eliminar carrera DESHABILITADO (sin carrera seleccionada)");
    }
}

// ============================================
// AÑADIR ESTILOS PARA BOTONES DESHABILITADOS
// ============================================
function addDisabledButtonStyles() {
    if (document.getElementById('disabled-button-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'disabled-button-styles';
    style.textContent = `
        /* Estilos para botones deshabilitados */
        .btn.disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }
        
        .btn-danger.disabled {
            background-color: #dc3545;
            opacity: 0.5;
        }
        
        .btn-success.disabled {
            background-color: #28a745;
            opacity: 0.5;
        }
        
        /* Indicador visual para botón de eliminar deshabilitado */
        #delete-race-btn.disabled::before {
            content: "⚠️ ";
            margin-right: 5px;
        }
    `;
    
    document.head.appendChild(style);
    console.log("Estilos de botones deshabilitados añadidos");
}

// ============================================
// ============================================
// FUNCIÓN MEJORADA PARA RENDERIZAR SELECTOR
// ============================================
// ============================================
// RENDERIZAR SELECTOR CON VERIFICACIÓN DE SINCRO
// ============================================
function renderRacesSelect() {
    console.log("🔄 Renderizando selector de carreras con verificación...");
    
    let racesSelect = document.getElementById('race-select');
    
    if (!racesSelect) {
        console.error("❌ Selector de carreras no encontrado");
        return;
    }
    
    // VERIFICAR SINCRO: Lo que hay en memoria vs lo que hay en localStorage
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    
    if (appState.races.length !== savedRaces.length) {
        console.warn("⚠️ DESINCRONIZACIÓN detectada:");
        console.log(`   - Memoria: ${appState.races.length} carreras`);
        console.log(`   - localStorage: ${savedRaces.length} carreras`);
        
        // Forzar sincronización
        appState.races = savedRaces;
        console.log("✅ Sincronización forzada");
    }
    
    // Guardar selección actual ANTES de limpiar
    const currentSelection = racesSelect.value;
    const currentRaceId = appState.currentRace ? appState.currentRace.id : null;
    
    // LIMPIAR completamente el selector
    racesSelect.innerHTML = '';
    
    // Opción por defecto SIEMPRE
    const defaultOption = document.createElement('option');
    defaultOption.value = "0";
    defaultOption.textContent = "Selecciona una carrera...";
    defaultOption.disabled = true;
    defaultOption.selected = true; // Siempre seleccionada por defecto
    racesSelect.appendChild(defaultOption);
    
    // Si no hay carreras, mostrar mensaje especial
    if (appState.races.length === 0) {
        console.log("ℹ️ No hay carreras para mostrar");
        
        // Opcional: Añadir opción informativa
        const infoOption = document.createElement('option');
        infoOption.value = "0";
        infoOption.textContent = "No hay carreras - Crea una nueva";
        infoOption.disabled = true;
        racesSelect.appendChild(infoOption);
        
        // Forzar selección de la opción por defecto
        racesSelect.value = "0";
        
        console.log("✅ Selector vacío configurado");
        return;
    }
    
    // Añadir carreras (más recientes primero)
    const sortedRaces = [...appState.races].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    
    console.log(`📋 Añadiendo ${sortedRaces.length} carreras al selector:`);
    
    sortedRaces.forEach((race, index) => {
        const option = document.createElement('option');
        option.value = race.id;
        
        // Texto de la opción
        let optionText = race.name;
        if (race.date) {
            optionText += ` (${race.date})`;
        }
        if (race.category) {
            optionText += ` - ${race.category}`;
        }
        
        option.textContent = optionText;
        
        // Marcar como seleccionada si es la carrera actual
        const shouldSelect = currentRaceId === race.id;
        option.selected = shouldSelect;
        
        if (shouldSelect) {
            console.log(`🎯 [${index + 1}] ${race.name} - SELECCIONADA`);
        } else {
            console.log(`   [${index + 1}] ${race.name}`);
        }
        
        racesSelect.appendChild(option);
    });
    
    // Si no hay carrera seleccionada pero el selector tenía algo, forzar selección por defecto
    if (!currentRaceId && currentSelection && currentSelection !== "0") {
        console.log(`⚠️ Selección anterior (${currentSelection}) no válida, forzando selección por defecto`);
        racesSelect.value = "0";
        racesSelect.selectedIndex = 0;
    }
    
    console.log(`✅ Selector actualizado: ${sortedRaces.length} carreras, selección actual: ${racesSelect.value}`);
    
    // Configurar event listener
    setupRacesSelectListener();
}



// ============================================
// CONFIGURAR LISTENER PARA SELECTOR DE CARRERAS
// ============================================
function setupRacesSelectListener(selectElement) {
    if (!selectElement) {
        selectElement = document.getElementById('races-select') || 
                       document.getElementById('race-select') ||
                       document.querySelector('.card-race-management select');
    }
    
    if (!selectElement) {
        console.error("❌ No se pudo encontrar el selector para configurar listener");
        return;
    }
    
    console.log("🎯 Configurando event listener para selector de carreras:", selectElement.id || 'sin ID');
    
    // Remover listeners antiguos
    selectElement.removeEventListener('change', handleRacesSelectChange);
    
    // Añadir nuevo listener
    selectElement.addEventListener('change', handleRacesSelectChange);
    
    console.log("✅ Listener de selector de carreras configurado");
}

// ============================================
// LIMPIAR CARRERAS HUÉRFANAS
// ============================================
function cleanOrphanedRaces() {
    console.log("🧹 Limpiando carreras huérfanas...");
    
    // Cargar carreras desde localStorage para comparar
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    const savedRaceIds = savedRaces.map(r => r.id);
    
    // Filtrar carreras que existen en memoria pero no en localStorage
    const validRaces = appState.races.filter(race => {
        const existsInStorage = savedRaceIds.includes(race.id);
        if (!existsInStorage) {
            console.log(`🗑️ Eliminando carrera huérfana: ${race.name} (ID: ${race.id})`);
        }
        return existsInStorage;
    });
    
    // Actualizar array si hubo cambios
    if (validRaces.length !== appState.races.length) {
        appState.races = validRaces;
        saveRacesToStorage();
        console.log(`✅ Carreras limpiadas: ${appState.races.length} válidas`);
    } else {
        console.log("✅ Todas las carreras son válidas");
    }
}

// ============================================
// FORZAR SINCRONIZACIÓN COMPLETA
// ============================================
function forceFullSync() {
    console.log("🔄 Forzando sincronización completa...");
    
    // 1. Limpiar carreras huérfanas
    cleanOrphanedRaces();
    
    // 2. Recargar desde localStorage
    const savedRaces = JSON.parse(localStorage.getItem('countdown-races') || '[]');
    appState.races = savedRaces;
    
    // 3. Si hay carrera actual, verificar que aún existe
    if (appState.currentRace) {
        const stillExists = appState.races.some(r => r.id === appState.currentRace.id);
        if (!stillExists) {
            console.log("⚠️ Carrera actual ya no existe, limpiando...");
            appState.currentRace = null;
            localStorage.removeItem('countdown-current-race');
        }
    }
    
    // 4. Actualizar selector
    renderRacesSelect();
    
    // 5. Actualizar UI
    updateRaceManagementCardTitle();
    updateRaceActionButtonsState();
    
    console.log("✅ Sincronización completa finalizada");
    console.log(`   - Carreras: ${appState.races.length}`);
    console.log(`   - Carrera actual: ${appState.currentRace ? appState.currentRace.name : 'Ninguna'}`);
}