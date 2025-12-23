// ============================================
// MÓDULO DE INTERFAZ DE USUARIO
// ============================================
// DESCRIPCIÓN: Gestión completa de la interfaz y componentes visuales
// RESPONSABILIDADES:
// 1. Sistema de tarjetas expandibles con persistencia
// 2. Selector de modo deslizante (salidas/llegadas)
// 3. Gestión de modales y cierres automatizados
// 4. Actualización dinámica de títulos y displays
// 5. Redimensionamiento responsive del countdown
// 6. Sistema de notificaciones y mensajes
//
// FUNCIONES CRÍTICAS EXPORTADAS:
// - setupCardToggles() - Configura tarjetas expandibles
// - initModeSlider() - Inicializa selector de modo
// - setupModalEventListeners() - Gestión automática de modales
// - adjustCountdownSize() - Redimensiona countdown responsive
// - showMessage() - Sistema de notificaciones
// - updateRaceManagementCardTitle() - Título dinámico de carrera
//
// DEPENDENCIAS:
// - appState (global) - Estado de la aplicación
// - translations (global) - Traducciones
// - window.localStorage - Persistencia de estados UI
//
// ARCHIVOS RELACIONADOS:
// → Main.js: Inicialización principal
// → Storage_Pwa.js: Usa updateRaceManagementCardTitle()
// → Todos los módulos: Proporciona componentes UI
// ============================================

// ============================================
// MÓDULO DE INTERFAZ DE USUARIO
// ============================================
let uiInitialized = {
    cardToggles: false,
    modeSlider: false,
    modalEvents: false,
    modalActions: false,
    pdfExport: false
};
// ============================================
// FUNCIONES DE TARJETAS EXPANDIBLES
// ============================================
function setupCardToggles() {
    if (uiInitialized.cardToggles) {
        console.log("Card toggles ya configurados");
        return;
    }
    uiInitialized.cardToggles = true;
    console.log("Configurando botones de minimizar/expandir...");
    
    // Cargar estado guardado de tarjetas minimizadas
    loadCardStates();
    
    // Añadir event listeners a todos los botones de toggle
    document.querySelectorAll('.card-toggle-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const targetClass = this.getAttribute('data-target');
            const card = document.querySelector(`.${targetClass}`);
            
            if (!card) return;
            
            const cardBody = card.querySelector('.card-body');
            const icon = this.querySelector('i');
            const indicator = card.querySelector('.card-collapse-indicator');
            
            if (cardBody.classList.contains('collapsed')) {
                // Expandir
                cardBody.classList.remove('collapsed');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
                if (indicator) indicator.classList.remove('collapsed');
                
                // Guardar estado
                saveCardState(targetClass, false);
            } else {
                // Minimizar
                cardBody.classList.add('collapsed');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
                if (indicator) indicator.classList.add('collapsed');
                
                // Guardar estado
                saveCardState(targetClass, true);
            }
        });
    });
    
    console.log("Botones de minimizar/expandir configurados.");
}

function saveCardState(cardClass, isCollapsed) {
    const cardStates = JSON.parse(localStorage.getItem('card-states') || '{}');
    cardStates[cardClass] = isCollapsed;
    localStorage.setItem('card-states', JSON.stringify(cardStates));
}

function loadCardStates() {
    const cardStates = JSON.parse(localStorage.getItem('card-states') || '{}');
    
    Object.keys(cardStates).forEach(cardClass => {
        const card = document.querySelector(`.${cardClass}`);
        if (!card) return;
        
        const cardBody = card.querySelector('.card-body');
        const toggleBtn = card.querySelector('.card-toggle-btn');
        const indicator = card.querySelector('.card-collapse-indicator');
        
        if (cardBody && toggleBtn && cardStates[cardClass]) {
            cardBody.classList.add('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
            if (indicator) indicator.classList.add('collapsed');
        }
    });
}

function toggleAllCards(action) {
    // action: 'expand' o 'collapse'
    document.querySelectorAll('.app-card').forEach(card => {
        const cardBody = card.querySelector('.card-body');
        const toggleBtn = card.querySelector('.card-toggle-btn');
        const indicator = card.querySelector('.card-collapse-indicator');
        
        if (!cardBody || !toggleBtn) return;
        
        const cardClass = card.className.split(' ').find(cn => cn.includes('-card'));
        if (!cardClass) return;
        
        if (action === 'collapse' && !cardBody.classList.contains('collapsed')) {
            cardBody.classList.add('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
            if (indicator) indicator.classList.add('collapsed');
            saveCardState(cardClass, true);
        } else if (action === 'expand' && cardBody.classList.contains('collapsed')) {
            cardBody.classList.remove('collapsed');
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
            if (indicator) indicator.classList.remove('collapsed');
            saveCardState(cardClass, false);
        }
    });
}

// ============================================
// FUNCIONES DE TÍTULOS DE TARJETAS
// ============================================
function updateCardTitles() {
    updateRaceManagementCardTitle();
    updateModeSelectorCardTitle();
    updateStartOrderCardTitle();
}

function updateRaceManagementCardTitle() {
    const cardTitleElement = document.querySelector('#card-race-title');
    if (!cardTitleElement) return;
    
    const t = translations[appState.currentLanguage];
    let raceName = appState.currentRace ? appState.currentRace.name : '';
    
    // Si no hay carrera seleccionada, mostrar solo el título básico
    if (!raceName || raceName.trim() === '') {
        cardTitleElement.textContent = t.cardRaceTitle || 'Gestión de Carrera';
    } else {
        // Formato: "Gestión de Carrera - Nombre de la carrera"
        cardTitleElement.textContent = `${t.cardRaceTitle || 'Gestión de Carrera'} - ${raceName}`;
    }
}

function updateModeSelectorCardTitle() {
    console.log("Actualizando título del selector de modo...");
    
    // Esperar a que el DOM esté listo
    if (!document.getElementById('mode-selector-title')) {
        console.warn("Elemento #mode-selector-title no disponible aún");
        return;
    }
    
    // Buscar el título
    const cardTitleElement = document.getElementById('mode-selector-title');
    if (!cardTitleElement) {
        console.error("No se pudo encontrar el elemento del título del selector de modo");
        return;
    }
    
    const t = translations[appState.currentLanguage];
    
    // Determinar el modo activo de manera más precisa
    let modeText = '';
    
    // Verificar qué contenido está visible usando múltiples métodos
    const modeSlider = document.querySelector('.mode-slider');
    const activeModeOption = document.querySelector('.mode-slider-option.active');
    
    if (modeSlider && activeModeOption) {
        // Usar el modo del slider como fuente principal
        const mode = activeModeOption.getAttribute('data-mode');
        modeText = (mode === 'salida') ? t.modeSalidaTitle : t.modeLlegadasTitle;
        console.log(`Modo detectado desde slider: ${mode} -> ${modeText}`);
    } else {
        // Fallback: verificar contenido visible
        const salidaContent = document.getElementById('mode-salida-content');
        if (salidaContent && salidaContent.classList.contains('active')) {
            modeText = t.modeSalidaTitle || 'Salidas';
        } else {
            modeText = t.modeLlegadasTitle || 'Llegadas';
        }
        console.log(`Modo detectado desde contenido: ${modeText}`);
    }
    
    // Formato: "Modo de Operación - [Salidas/Llegadas]"
    const newTitle = `${t.modeSelectorTitle || 'Modo de Operación'} - ${modeText}`;
    cardTitleElement.textContent = newTitle;
    
    console.log(`Título actualizado: "${newTitle}" (Idioma: ${appState.currentLanguage}, Modo: ${modeText})`);
}

function updateStartOrderCardTitle() {
    const cardTitleElement = document.querySelector('#card-start-order-title');
    if (!cardTitleElement) return;
    
    const t = translations[appState.currentLanguage];
    const timeDifference = document.getElementById('time-difference-display')?.textContent || '00:00:00';
    const firstStartTime = document.getElementById('first-start-time')?.value || '09:00:00';
    
    // Formato: "Orden de Salida (HH:MM | HH:MM:SS)"
    cardTitleElement.textContent = `${t.cardStartOrderTitle || 'Orden de Salida'} (${firstStartTime} | ${timeDifference})`;
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN CUANDO CAMBIAN DATOS
// ============================================
function onRaceChanged() {
    updateRaceManagementCardTitle();
}

function onModeChanged() {
    updateModeSelectorCardTitle();
}

function onTimesChanged() {
    updateStartOrderCardTitle();
}

// ============================================
// SELECTOR DE MODO DESLIZANTE
// ============================================
function initModeSlider() {
    if (uiInitialized.modeSlider) {
        console.log("Mode slider ya inicializado");
        return;
    }
    uiInitialized.modeSlider = true;
    const slider = document.querySelector('.mode-slider');
    const options = document.querySelectorAll('.mode-slider-option');
    const salidaContent = document.getElementById('mode-salida-content');
    const llegadasContent = document.getElementById('mode-llegadas-content');
    
    console.log("Inicializando selector de modo...");
    
    // Variable para prevenir inicialización múltiple
    let isInitializing = false;
    
    // Cargar modo guardado
    const savedMode = localStorage.getItem('app-mode') || 'salida';
    console.log(`Selector de modo: modo guardado (app-mode) = ${savedMode}`);
    
    // Función para cambiar modo
    const changeModeInternal = function(mode, isInitialLoad = false) {
        if (isInitializing && !isInitialLoad) {
            console.log("Selector de modo: ignorando cambio durante inicialización");
            return;
        }
        
        console.log(`Selector de modo: cambiando a ${mode} (inicial: ${isInitialLoad})`);
        
        // Actualizar estado visual del slider
        options.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        if (slider) slider.dataset.mode = mode;
        
        // Mostrar/ocultar contenido
        if (mode === 'salida') {
            if (salidaContent) salidaContent.classList.add('active');
            if (llegadasContent) llegadasContent.classList.remove('active');
        } else {
            if (salidaContent) salidaContent.classList.remove('active');
            if (llegadasContent) llegadasContent.classList.add('active');
        }
        
        // Guardar preferencia (solo si no es carga inicial)
        if (!isInitialLoad) {
            localStorage.setItem('app-mode', mode);
        }
        
        // Actualizar título
        setTimeout(() => {
            updateModeSelectorCardTitle();
        }, 50);
    };
    
    // Añadir event listeners
    options.forEach(option => {
        option.addEventListener('click', function() {
            const mode = this.dataset.mode;
            changeModeInternal.call(this, mode, false);
        });
    });
    
    // Marcar que estamos en proceso de inicialización
    isInitializing = true;
    
    // Aplicar modo guardado SIN usar click() para evitar múltiples eventos
    setTimeout(() => {
        const savedOption = document.querySelector(`.mode-slider-option[data-mode="${savedMode}"]`);
        if (savedOption) {
            // Aplicar directamente sin disparar eventos
            options.forEach(opt => opt.classList.remove('active'));
            savedOption.classList.add('active');
            if (slider) slider.dataset.mode = savedMode;
            
            // Mostrar contenido correspondiente
            if (savedMode === 'salida') {
                if (salidaContent) salidaContent.classList.add('active');
                if (llegadasContent) llegadasContent.classList.remove('active');
            } else {
                if (salidaContent) salidaContent.classList.remove('active');
                if (llegadasContent) llegadasContent.classList.add('active');
            }
            
            console.log(`Selector de modo: modo ${savedMode} establecido directamente`);
        } else {
            // Establecer salida por defecto
            const defaultOption = document.querySelector('.mode-slider-option[data-mode="salida"]');
            if (defaultOption) {
                options.forEach(opt => opt.classList.remove('active'));
                defaultOption.classList.add('active');
                if (slider) slider.dataset.mode = 'salida';
                if (salidaContent) salidaContent.classList.add('active');
                if (llegadasContent) llegadasContent.classList.remove('active');
                console.log("Selector de modo: salida establecida por defecto");
            }
        }
        
        // Finalizar inicialización y actualizar título
        isInitializing = false;
        setTimeout(() => {
            updateModeSelectorCardTitle();
        }, 100);
    }, 50);
    
    console.log("Selector de modo inicializado");
}

// ============================================
// FUNCIONES DE REDIMENSIONAMIENTO
// ============================================
function adjustCountdownSize() {
    const display = document.getElementById('countdown-display');
    if (!display) return;
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isAggressive = document.getElementById('countdown-screen').classList.contains('aggressive-numbers');
    
    let fontSize;
    const minDimension = Math.min(screenWidth, screenHeight);
    
    if (isAggressive) {
        if (minDimension < 400) {
            fontSize = minDimension * 0.35;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.25;
        } else {
            fontSize = minDimension * 0.20;
        }
    } else {
        if (minDimension < 400) {
            fontSize = minDimension * 0.30;
        } else if (minDimension < 768) {
            fontSize = minDimension * 0.25;
        } else if (minDimension < 1024) {
            fontSize = minDimension * 0.20;
        } else {
            fontSize = minDimension * 0.15;
        }
    }
    
    fontSize = Math.max(80, Math.min(fontSize, 500));
    display.style.fontSize = `${fontSize}px`;
    display.style.lineHeight = `${fontSize * 0.9}px`;
}

function adjustInfoCornersSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const minDimension = Math.min(screenWidth, screenHeight);
    
    const infoCorners = document.querySelectorAll('.info-corner');
    infoCorners.forEach(corner => {
        if (minDimension < 400) {
            corner.style.maxWidth = '40vw';
        } else if (minDimension < 768) {
            corner.style.maxWidth = '35vw';
        } else if (minDimension < 1024) {
            corner.style.maxWidth = '30vw';
        } else {
            corner.style.maxWidth = '25vw';
        }
        
        if (minDimension < 400) {
            corner.style.padding = '0.6vw 1vw';
        } else if (minDimension < 768) {
            corner.style.padding = '0.7vw 1.1vw';
        } else {
            corner.style.padding = '0.8vw 1.2vw';
        }
    });
}

function setupCountdownResize() {
    window.addEventListener('load', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('resize', function() {
        adjustCountdownSize();
        adjustInfoCornersSize();
    });
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            adjustCountdownSize();
            adjustInfoCornersSize();
        }, 300);
    });
}

// ============================================
// FUNCIONES DE SELECCIÓN DE CARRERA
// ============================================
function renderRacesSelect() {
    const select = document.getElementById('race-select');
    select.innerHTML = '<option value="">-- Selecciona una carrera --</option>';
    
    appState.races.forEach((race, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = race.name;
        if (appState.currentRace && race.id === appState.currentRace.id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// ============================================
// FUNCIONES DE ACTUALIZACIÓN DE TIEMPO
// ============================================
function updateSystemTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    document.getElementById('current-system-time-display').textContent = timeString;
    updateTimeDifference();
}

function updateTimeDifference() {
    const firstStartTime = document.getElementById('first-start-time').value;
    if (!firstStartTime) return;
    
    // Extraer horas, minutos y segundos
    const timeParts = firstStartTime.split(':');
    let hours = 0, minutes = 0, seconds = 0;
    
    if (timeParts.length >= 1) hours = parseInt(timeParts[0]) || 0;
    if (timeParts.length >= 2) minutes = parseInt(timeParts[1]) || 0;
    if (timeParts.length >= 3) seconds = parseInt(timeParts[2]) || 0;
    
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, seconds, 0);
    
    if (startTime < now) {
        startTime.setDate(startTime.getDate() + 1);
    }
    
    const diffMs = startTime - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffMinutes = Math.floor((diffSeconds % 3600) / 60);
    const diffSecs = diffSeconds % 60;
    
    const diffString = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
    document.getElementById('time-difference-display').textContent = diffString;
    updateStartOrderCardTitle();
}

function updateCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    const countdownDisplay = document.getElementById('current-time-value');
    if (countdownDisplay) countdownDisplay.textContent = timeStr;
    
    const systemTimeDisplay = document.getElementById('current-system-time');
    if (systemTimeDisplay) systemTimeDisplay.textContent = timeStr;
}

function updateTotalTime() {
    if (!appState.raceStartTime) return;
    
    const elapsed = Math.floor((Date.now() - appState.raceStartTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    const display = document.getElementById('total-time-value');
    display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// FUNCIONES DE NOTIFICACIONES
// ============================================
function showMessage(text, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        console.error("Elemento #message no encontrado");
        return;
    }
    
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}


// ============================================
// FUNCIONES DE CAMBIO DE MODO
// ============================================
// Variable global para controlar si estamos en medio de un cambio de modo
let isModeChanging = false;

function changeMode(mode) {
    // Prevenir ciclos infinitos
    if (isModeChanging) {
        console.log("Ya hay un cambio de modo en progreso, ignorando...");
        return;
    }
    
    isModeChanging = true;
    
    const t = translations[appState.currentLanguage];
    
    console.log(`Cambiando a modo: ${mode} desde changeMode()`);
    
    // Encontrar la opción del slider
    const targetOption = document.querySelector(`.mode-slider-option[data-mode="${mode}"]`);
    if (targetOption) {
        // Simular clic
        targetOption.click();
    } else {
        console.error(`Opción para modo ${mode} no encontrada`);
    }
    
    // Mostrar mensaje
    const modeName = mode === 'salida' ? t.modeSalidaTitle : t.modeLlegadasTitle;
    showMessage(t.modeChanged.replace('{mode}', modeName), 'info');
    
    // Permitir siguiente cambio después de un tiempo
    setTimeout(() => {
        isModeChanging = false;
    }, 500);
    
    console.log(`Modo cambiado correctamente a: ${mode}`);
}

// ============================================
// FUNCIONES DE DEPURACIÓN
// ============================================
function debugModeState() {
    console.log("=== DEPURACIÓN DE ESTADO DE MODO ===");
    
    // Verificar slider
    const slider = document.querySelector('.mode-slider');
    const activeOption = document.querySelector('.mode-slider-option.active');
    console.log("Slider data-mode:", slider ? slider.dataset.mode : "No encontrado");
    console.log("Opción activa:", activeOption ? activeOption.dataset.mode : "No encontrada");
    
    // Verificar contenido visible
    const salidaContent = document.getElementById('mode-salida-content');
    const llegadasContent = document.getElementById('mode-llegadas-content');
    console.log("Contenido salida activo:", salidaContent ? salidaContent.classList.contains('active') : "No encontrado");
    console.log("Contenido llegadas activo:", llegadasContent ? llegadasContent.classList.contains('active') : "No encontrado");
    
    // Verificar localStorage
    console.log("app-mode en localStorage:", localStorage.getItem('app-mode'));
    console.log("selectedMode en localStorage:", localStorage.getItem('selectedMode'));
    
    console.log("=== FIN DEPURACIÓN ===");
}
// ============================================
// FUNCIONES DE MANEJO DE MODALES (MOVIDAS A UI.js)
// ============================================
function setupModalEventListeners() {
    if (uiInitialized.modalEvents) {
        console.log("Modal event listeners ya configurados");
        return;
    }
    uiInitialized.modalEvents = true;
    console.log("Configurando listeners de modales...");
    
    // Función genérica para cerrar modales
    const closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            console.log(`Modal ${modalId} cerrado`);
        }
    };
    
    // Botones de cierre (×)
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = this.closest('.modal');
            if (modal) {
                const modalId = modal.id;
                modal.classList.remove('active');
                console.log(`Modal ${modalId} cerrado (botón ×)`);
            }
        });
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                const modalId = this.id;
                this.classList.remove('active');
                console.log(`Modal ${modalId} cerrado (clic fuera)`);
            }
        });
    });
    
    // Mapeo de botones de cancelar a sus modales
    const cancelButtons = {
        // Carreras
        'delete-race-cancel-btn': 'delete-race-modal',
        'delete-race-modal-close': 'delete-race-modal',
        'new-race-modal-close': 'new-race-modal',
        'cancel-create-race-btn': 'new-race-modal',
        
        // Salidas
        'clear-departures-cancel-btn': 'clear-departures-modal',
        'clear-departures-modal-close': 'clear-departures-modal',
        
        // Reinicio
        'restart-modal-close': 'restart-confirm-modal',
        'restart-cancel-btn': 'restart-confirm-modal',
        
        // Sugerencias
        'suggestions-modal-close': 'suggestions-modal',
        'cancel-suggestion-btn': 'suggestions-modal',
        
        // Llegadas
        'register-llegada-modal-close': 'register-llegada-modal',
        'cancel-llegada-btn': 'register-llegada-modal',
        
        // Importación
        'import-salidas-modal-close': 'import-salidas-modal',
        'cancel-import-salidas-btn': 'import-salidas-modal',
        
        // Clasificación
        'ranking-modal-close': 'ranking-modal',
        'close-ranking-btn': 'ranking-modal',
        
        // Configuración durante cuenta atrás
        'config-during-countdown-close': 'config-during-countdown-modal',
        
        // Ajuste de tiempos
        'adjust-times-close': 'adjust-times-modal',
        'cancel-adjustments-btn': 'adjust-times-modal',
        
        // Plantilla
        'template-config-modal-close': 'template-config-modal',
        'cancel-template-btn': 'template-config-modal',
        
        // Ayuda
        'help-modal-close': 'help-modal',
        'help-modal-ok': 'help-modal'
    };
    
    // Asignar listeners a todos los botones de cancelar
    Object.keys(cancelButtons).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const modalId = cancelButtons[buttonId];
                closeModal(modalId);
                console.log(`Modal ${modalId} cerrado (botón ${buttonId})`);
            });
        } else {
            console.warn(`⚠️ Botón ${buttonId} no encontrado en el DOM`);
        }
    });
    
    // Atajo de teclado ESC para cerrar modales abiertos
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal.active');
            if (openModal) {
                const modalId = openModal.id;
                openModal.classList.remove('active');
                console.log(`Modal ${modalId} cerrado (tecla ESC)`);
            }
        }
    });
    
    console.log("✅ Listeners de modales configurados correctamente");
}

// ============================================
// FUNCIÓN DE DEPURACIÓN DE MODALES
// ============================================
function debugModalButtons() {
    console.log("=== DEPURACIÓN DE BOTONES DE MODAL ===");
    
    // Lista completa de botones que deberían existir
    const expectedButtons = [
        'delete-race-cancel-btn', 'delete-race-modal-close',
        'clear-departures-cancel-btn', 'clear-departures-modal-close',
        'restart-cancel-btn', 'restart-modal-close',
        'cancel-suggestion-btn', 'suggestions-modal-close',
        'cancel-llegada-btn', 'register-llegada-modal-close',
        'cancel-import-salidas-btn', 'import-salidas-modal-close',
        'close-ranking-btn', 'ranking-modal-close',
        'cancel-adjustments-btn', 'adjust-times-close',
        'cancel-template-btn', 'template-config-modal-close',
        'help-modal-ok', 'help-modal-close'
    ];
    
    let found = 0;
    let missing = 0;
    
    expectedButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            console.log(`✅ ${buttonId} - ENCONTRADO`);
            found++;
        } else {
            console.warn(`❌ ${buttonId} - NO ENCONTRADO`);
            missing++;
        }
    });
    
    console.log(`\nResumen: ${found} encontrados, ${missing} faltantes`);
    console.log("=== FIN DEPURACIÓN ===");
}

// ============================================
// FUNCIONES DE ACCIONES DE MODALES
// ============================================
function setupModalActionListeners() {
    if (uiInitialized.modalActions) {
        console.log("Modal action listeners ya configurados");
        return;
    }
    uiInitialized.modalActions = true;
    console.log("Configurando listeners de acciones de modales...");
    
    // Verificar que las funciones existen
    if (typeof createNewRace !== 'function') {
        console.error("❌ createNewRace no está disponible");
    }
    if (typeof deleteCurrentRace !== 'function') {
        console.error("❌ deleteCurrentRace no está disponible");
    }
    if (typeof clearRaceDepartures !== 'function') {
        console.error("❌ clearRaceDepartures no está disponible");
    }
    if (typeof sendSuggestion !== 'function') {
        console.error("❌ sendSuggestion no está disponible");
    }
    if (typeof handleCompleteRestart !== 'function') {
        console.error("❌ handleCompleteRestart no está disponible");
    }
    
    // Botón de crear carrera
    const createRaceBtn = document.getElementById('create-race-btn');
    if (createRaceBtn) {
        console.log("✅ Configurando create-race-btn");
        createRaceBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Crear carrera clickeado");
            if (typeof createNewRace === 'function') {
                createNewRace();
            } else {
                console.error("createNewRace no es una función");
            }
        });
    } else {
        console.warn("⚠️ Botón create-race-btn no encontrado");
    }
    
    // Botón de eliminar carrera
    const deleteRaceConfirmBtn = document.getElementById('delete-race-confirm-btn');
    if (deleteRaceConfirmBtn) {
        console.log("✅ Configurando delete-race-confirm-btn");
        deleteRaceConfirmBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Eliminar carrera clickeado");
            if (typeof deleteCurrentRace === 'function') {
                deleteCurrentRace();
            }
        });
    }
    
    // Botón de limpiar salidas
    const clearDeparturesBtn = document.getElementById('clear-departures-confirm-btn');
    if (clearDeparturesBtn) {
        console.log("✅ Configurando clear-departures-confirm-btn");
        clearDeparturesBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Limpiar salidas clickeado");
            if (typeof clearRaceDepartures === 'function') {
                clearRaceDepartures();
            }
        });
    }
    
    // Botón de enviar sugerencias
    const sendSuggestionBtn = document.getElementById('send-suggestion-btn');
    if (sendSuggestionBtn) {
        console.log("✅ Configurando send-suggestion-btn");
        sendSuggestionBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Enviar sugerencia clickeado");
            if (typeof sendSuggestion === 'function') {
                sendSuggestion();
            }
        });
    }
    
    // Botón de reiniciar completamente
    const restartConfirmBtn = document.getElementById('restart-confirm-btn');
    if (restartConfirmBtn) {
        console.log("✅ Configurando restart-confirm-btn");
        restartConfirmBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Reiniciar completamente clickeado");
            if (typeof handleCompleteRestart === 'function') {
                handleCompleteRestart();
            }
        });
    }
    
    // Botón de ayuda (OK)
    const helpModalOkBtn = document.getElementById('help-modal-ok');
    if (helpModalOkBtn) {
        console.log("✅ Configurando help-modal-ok");
        helpModalOkBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Cerrar ayuda clickeado");
            document.getElementById('help-modal').classList.remove('active');
        });
    }
    
    console.log("✅ Listeners de acciones de modales configurados");
}


// ============================================
// FUNCIONES DE IDIOMA - AÑADIR A Main.js o UI.js
// ============================================

function setupLanguageButtons() {
    console.log("Configurando botones de idioma...");
    
    // Obtener todos los botones de idioma
    const languageButtons = document.querySelectorAll('.flag');
    
    // Para cada botón de idioma
    languageButtons.forEach(button => {
        // Quitar cualquier listener anterior
        button.removeEventListener('click', handleLanguageChange);
        // Añadir nuevo listener
        button.addEventListener('click', handleLanguageChange);
    });
    
    // También configurar el botón de ayuda
    const helpButton = document.getElementById('help-icon-header');
    if (helpButton) {
        helpButton.removeEventListener('click', showHelpModal);
        helpButton.addEventListener('click', showHelpModal);
    }
    
    console.log("Botones de idioma configurados:", languageButtons.length);
}

function handleLanguageChange(event) {
    const lang = event.currentTarget.getAttribute('data-lang');
    console.log("Cambiando idioma a:", lang);
    
    // Verificar que el idioma existe en las traducciones
    if (!translations[lang]) {
        console.error("Idioma no encontrado:", lang);
        return;
    }
    
    // Cambiar el idioma actual
    appState.currentLanguage = lang;
    
    // Guardar preferencia en localStorage
    localStorage.setItem('countdown-language', lang);
    
    // Actualizar bandera activa visualmente
    updateActiveLanguageFlag(lang);
    
    // Actualizar toda la interfaz en el nuevo idioma
    updateLanguageUI();
    
    // Recargar datos de la carrera para actualizar textos dinámicos
    if (typeof loadRaceData === 'function') {
        loadRaceData();
    }
    
    console.log("Idioma cambiado exitosamente a:", lang);
}

function updateActiveLanguageFlag(lang) {
    // Remover clase active de todas las banderas
    const allFlags = document.querySelectorAll('.flag');
    allFlags.forEach(flag => {
        flag.classList.remove('active');
    });
    
    // Añadir clase active a la bandera seleccionada
    const activeFlag = document.getElementById(`flag-${lang}`);
    if (activeFlag) {
        activeFlag.classList.add('active');
    }
}

function showHelpModal() {
    const helpModal = document.getElementById('help-modal');
    if (helpModal) {
        helpModal.classList.add('active');
    }
}

