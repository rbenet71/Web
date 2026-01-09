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
    
    // Extraer horas, minutos y segundos de "Salida Primero"
    const timeParts = firstStartTime.split(':');
    let hours = 0, minutes = 0, seconds = 0;
    
    if (timeParts.length >= 1) hours = parseInt(timeParts[0]) || 0;
    if (timeParts.length >= 2) minutes = parseInt(timeParts[1]) || 0;
    if (timeParts.length >= 3) seconds = parseInt(timeParts[2]) || 0;
    
    // 🔥 NUEVO: Restar 1 minuto (60 segundos) a la hora de salida
    // Convertir todo a segundos, restar 60, y volver a convertir
    const totalSegundos = hours * 3600 + minutes * 60 + seconds;
    const totalSegundosMenosMinuto = totalSegundos - 60;
    
    if (totalSegundosMenosMinuto < 0) {
        // Si al restar 1 minuto se vuelve negativo, ajustar al día anterior
        hours = 23;
        minutes = 59;
        seconds = 0;
    } else {
        // Convertir de vuelta a horas, minutos, segundos
        hours = Math.floor(totalSegundosMenosMinuto / 3600);
        const minutosRestantes = totalSegundosMenosMinuto % 3600;
        minutes = Math.floor(minutosRestantes / 60);
        seconds = minutosRestantes % 60;
    }
    
    console.log("🕐 Cálculo de cuenta atrás:");
    console.log("  - Salida Primero original:", firstStartTime);
    console.log("  - Salida Primero - 1 min:", `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    
    const now = new Date();
    const horaSalidaMenosMinuto = new Date(now);
    horaSalidaMenosMinuto.setHours(hours, minutes, seconds, 0);
    
    // Si la hora ya pasó hoy, calcular para mañana
    if (horaSalidaMenosMinuto < now) {
        horaSalidaMenosMinuto.setDate(horaSalidaMenosMinuto.getDate() + 1);
        console.log("  - La hora ya pasó hoy, calculando para mañana");
    }
    
    const diffMs = horaSalidaMenosMinuto - now;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // Manejar caso especial cuando ya pasó la hora
    if (diffSeconds < 0) {
        console.log("⚠️ La cuenta atrás es negativa, mostrando 00:00:00");
        document.getElementById('time-difference-display').textContent = "00:00:00";
        updateStartOrderCardTitle();
        return;
    }
    
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffMinutes = Math.floor((diffSeconds % 3600) / 60);
    const diffSecs = diffSeconds % 60;
    
    const diffString = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSecs.toString().padStart(2, '0')}`;
    document.getElementById('time-difference-display').textContent = diffString;
    updateStartOrderCardTitle();
    
    console.log(`  - Hora actual: ${now.toTimeString().split(' ')[0]}`);
    console.log(`  - Diferencia calculada: ${diffString} (${diffSeconds} segundos)`);
    
    // 🔥 NUEVA FUNCIONALIDAD: Iniciar cuenta atrás automáticamente cuando llegue a 00:00:00
    if (diffString === "00:00:00" && diffSeconds <= 0) {
        console.log("⏰ 'Cuenta atrás en:' llegó a 00:00:00 - Verificando inicio automático...");
        
        // Verificar que la cuenta atrás no esté ya activa
        if (window.appState && !window.appState.countdownActive) {
            console.log("✅ Condiciones cumplidas, iniciando cuenta atrás automáticamente...");
            
            // Verificar que la función startCountdown existe
            if (typeof startCountdown === 'function') {
                // Pequeño delay para asegurar que todo está listo
                setTimeout(() => {
                    startCountdown();
                    console.log("✅ Cuenta atrás iniciada automáticamente desde updateTimeDifference()");
                }, 100);
            } else {
                console.error("❌ Función startCountdown no disponible");
            }
        } else {
            console.log("⚠️ Cuenta atrás ya activa o appState no disponible, omitiendo inicio automático");
        }
    }
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
// ============================================
// CONFIGURAR LISTENERS DE ACCIONES DE MODALES
// ============================================
function setupModalActionListeners() {
    console.log("Configurando listeners de acciones de modales...");
    
    // Verificar si ya se configuró
    if (window.modalActionListenersConfigured) {
        console.log("Listeners de acciones de modales ya configurados");
        return;
    }

    // Marcar como configurado inmediatamente
    window.modalActionListenersConfigured = true;
    
    // 1. Botón de crear carrera
    const createRaceBtn = document.getElementById('create-race-btn');
    if (createRaceBtn) {
        console.log("✅ Configurando create-race-btn");
        
        // Remover listener anterior si existe
        createRaceBtn.removeEventListener('click', handleCreateRace);
        
        // Definir handler
        function handleCreateRace(e) {
            e.preventDefault();
            console.log("Crear carrera clickeado");
            
            // Verificar que la función existe
            if (typeof createNewRace === 'function') {
                console.log("✅ Llamando a createNewRace()");
                createNewRace();
            } else {
                console.error("❌ Función createNewRace no disponible");
                const t = translations[appState.currentLanguage];
                showMessage(t.errorCreatingRace || 'Error creando carrera', 'error');
            }
        }
        
        // Añadir listener
        createRaceBtn.addEventListener('click', handleCreateRace);
        
        // Guardar referencia para poder removerla después
        window.handleCreateRace = handleCreateRace;
    } else {
        console.log("⚠️ create-race-btn no encontrado");
    }
    
    // 2. Botón de cancelar creación de carrera
    const cancelCreateRaceBtn = document.getElementById('cancel-create-race-btn');
    if (cancelCreateRaceBtn) {
        console.log("✅ Configurando cancel-create-race-btn");
        cancelCreateRaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar creación de carrera clickeado");
            document.getElementById('new-race-modal').classList.remove('active');
        });
    }
    
    // 3. Botón de confirmar eliminación de carrera
    const deleteRaceConfirmBtn = document.getElementById('delete-race-confirm-btn');
    if (deleteRaceConfirmBtn) {
        console.log("✅ Configurando delete-race-confirm-btn");
        
        // Remover listener anterior si existe
        deleteRaceConfirmBtn.removeEventListener('click', handleDeleteRaceConfirm);
        
        // Definir handler
        function handleDeleteRaceConfirm(e) {
            e.preventDefault();
            console.log("Confirmar eliminación de carrera clickeado");
            
            // Verificar que la función existe
            if (typeof deleteCurrentRace === 'function') {
                console.log("✅ Llamando a deleteCurrentRace()");
                deleteCurrentRace();
            } else {
                console.error("❌ Función deleteCurrentRace no disponible");
                const t = translations[appState.currentLanguage];
                showMessage(t.errorDeletingRace || 'Error eliminando carrera', 'error');
            }
        }
        
        // Añadir listener
        deleteRaceConfirmBtn.addEventListener('click', handleDeleteRaceConfirm);
        
        // Guardar referencia para poder removerla después
        window.handleDeleteRaceConfirm = handleDeleteRaceConfirm;
    } else {
        console.log("⚠️ delete-race-confirm-btn no encontrado");
    }
    
    // 4. Botón de cancelar eliminación de carrera
    const cancelDeleteRaceBtn = document.getElementById('cancel-delete-race-btn');
    if (cancelDeleteRaceBtn) {
        console.log("✅ Configurando cancel-delete-race-btn");
        cancelDeleteRaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar eliminación de carrera clickeado");
            document.getElementById('delete-race-modal').classList.remove('active');
        });
    }
    
    // 5. Botón de confirmar limpieza de salidas
    const clearDeparturesConfirmBtn = document.getElementById('clear-departures-confirm-btn');
    if (clearDeparturesConfirmBtn) {
        console.log("✅ Configurando clear-departures-confirm-btn");
        clearDeparturesConfirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Confirmar limpieza de salidas clickeado");
            
            // Verificar que la función existe
            if (typeof clearRaceDepartures === 'function') {
                clearRaceDepartures();
            }
            
            document.getElementById('clear-departures-modal').classList.remove('active');
        });
    }
    
    // 6. Botón de cancelar limpieza de salidas
    const cancelClearDeparturesBtn = document.getElementById('cancel-clear-departures-btn');
    if (cancelClearDeparturesBtn) {
        console.log("✅ Configurando cancel-clear-departures-btn");
        cancelClearDeparturesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar limpieza de salidas clickeado");
            document.getElementById('clear-departures-modal').classList.remove('active');
        });
    }
    
    // 7. Botón de enviar sugerencia
    const sendSuggestionBtn = document.getElementById('send-suggestion-btn');
    if (sendSuggestionBtn) {
        console.log("✅ Configurando send-suggestion-btn");
        sendSuggestionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Enviar sugerencia clickeado");
            
            // Verificar que la función existe
            if (typeof sendSuggestion === 'function') {
                sendSuggestion();
            }
        });
    }
    
    // 8. Botón de cancelar sugerencia
    const cancelSuggestionBtn = document.getElementById('cancel-suggestion-btn');
    if (cancelSuggestionBtn) {
        console.log("✅ Configurando cancel-suggestion-btn");
        cancelSuggestionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar sugerencia clickeado");
            document.getElementById('suggestions-modal').classList.remove('active');
        });
    }
    
    // 9. Botón de confirmar reinicio completo
    const restartConfirmBtn = document.getElementById('restart-confirm-btn');
    if (restartConfirmBtn) {
        console.log("✅ Configurando restart-confirm-btn");
        restartConfirmBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Confirmar reinicio completo clickeado");
            
            // Verificar que la función existe
            if (typeof handleCompleteRestart === 'function') {
                handleCompleteRestart();
            }
        });
    }
    
    // 10. Botón de cancelar reinicio
    const cancelRestartBtn = document.getElementById('cancel-restart-btn');
    if (cancelRestartBtn) {
        console.log("✅ Configurando cancel-restart-btn");
        cancelRestartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar reinicio clickeado");
            document.getElementById('restart-confirm-modal').classList.remove('active');
        });
    }
    
    // 11. Botón OK de ayuda
    const helpModalOk = document.getElementById('help-modal-ok');
    if (helpModalOk) {
        console.log("✅ Configurando help-modal-ok");
        helpModalOk.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("OK ayuda clickeado");
            document.getElementById('help-modal').classList.remove('active');
        });
    }
    
    // 12. Botón de nueva carrera en la tarjeta
    const newRaceCardBtn = document.getElementById('new-race-card-btn');
    if (newRaceCardBtn) {
        console.log("✅ Configurando new-race-card-btn");
        newRaceCardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Nueva carrera (card) clickeado");
            
            // Verificar que la función existe
            if (typeof showNewRaceModal === 'function') {
                showNewRaceModal();
            }
        });
    }
    
    // 13. Botón de editar carrera
    const editRaceBtn = document.getElementById('edit-race-btn');
    if (editRaceBtn) {
        console.log("✅ Configurando edit-race-btn");
        editRaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Editar carrera clickeado");
            
            // Verificar que la función existe
            if (typeof editRaceDetails === 'function') {
                editRaceDetails();
            }
        });
    }
    
    // 14. Botón de guardar edición de carrera
    const saveEditRaceBtn = document.getElementById('save-edit-race-btn');
    if (saveEditRaceBtn) {
        console.log("✅ Configurando save-edit-race-btn");
        saveEditRaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Guardar edición de carrera clickeado");
            
            // Verificar que la función existe
            if (typeof saveEditedRace === 'function') {
                saveEditedRace();
            }
        });
    }
    
    // 15. Botón de cancelar edición de carrera
    const cancelEditRaceBtn = document.getElementById('cancel-edit-race-btn');
    if (cancelEditRaceBtn) {
        console.log("✅ Configurando cancel-edit-race-btn");
        cancelEditRaceBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Cancelar edición de carrera clickeado");
            document.getElementById('edit-race-modal').classList.remove('active');
        });
    }
    
    // 16. Botón de importar orden de salida
    const importOrderBtn = document.getElementById('import-order-btn');
    if (importOrderBtn) {
        console.log("✅ Configurando import-order-btn con prevención de múltiples listeners");
        
        // **SOLUCIÓN CRÍTICA: Reemplazar el botón para eliminar TODOS los listeners**
        const newBtn = importOrderBtn.cloneNode(true); // Clonar manteniendo atributos
        importOrderBtn.parentNode.replaceChild(newBtn, importOrderBtn);
        
        console.log("✅ Botón import-order-btn clonado - listeners HTML antiguos eliminados");
        
        // Obtener la referencia actualizada
        const currentImportBtn = document.getElementById('import-order-btn');
        
        // Configurar UN ÚNICO listener
        let isImportClickInProgress = false;
        
        currentImportBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (isImportClickInProgress) {
                console.log("⚠️ Click en importación ya en progreso, ignorando");
                return;
            }
            
            isImportClickInProgress = true;
            console.log("🖱️ ÚNICO listener de import-order-btn ejecutado");
            
            // Verificar que la función existe
            if (typeof importStartOrder === 'function') {
                importStartOrder();
            }
            
            // Permitir siguiente click después de 1 segundo
            setTimeout(() => {
                isImportClickInProgress = false;
                console.log("✅ Listener de importación listo para nuevo click");
            }, 1000);
        });
        
        console.log("✅ import-order-btn configurado con prevención de duplicados");
    }
    
    // 17. Botón de crear plantilla Excel
    const createTemplateBtn = document.getElementById('create-template-btn');
    if (createTemplateBtn) {
        console.log("✅ Configurando create-template-btn");
        createTemplateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Crear plantilla Excel clickeado");
            
            // Verificar que la función existe
            if (typeof createStartOrderTemplate === 'function') {
                createStartOrderTemplate();
            }
        });
    }
    
    // 18. Botón de eliminar orden de salida
    const deleteOrderBtn = document.getElementById('delete-order-btn');
    if (deleteOrderBtn) {
        console.log("✅ Configurando delete-order-btn");
        deleteOrderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Eliminar orden de salida clickeado");
            
            // Verificar que la función existe
            if (typeof deleteStartOrder === 'function') {
                deleteStartOrder();
            }
        });
    }
    
    // 19. Botón de añadir corredor
    const addRiderBtn = document.getElementById('add-rider-btn');
    if (addRiderBtn) {
        console.log("✅ Configurando add-rider-btn");
        addRiderBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Añadir corredor clickeado");
            
            // Verificar que la función existe
            if (typeof addNewRider === 'function') {
                addNewRider();
            }
        });
    }
    
    // Marcar como configurado
    window.modalActionListenersConfigured = true;
    console.log("✅ Listeners de acciones de modales configurados");
    
    // Función para debug: mostrar qué botones están configurados
    if (window.debugModalButtons) {
        debugModalButtons();
    }
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

// ============================================
// FUNCIÓN PARA ACTUALIZAR ESTADO DE BOTONES DE CARRERA
// ============================================
function updateRaceActionButtonsState() {
    console.log("🔄 Actualizando estado de botones de carrera...");
    
    // Botones que dependen de tener carrera seleccionada
    const buttonsToUpdate = [
        { id: 'delete-race-btn', type: 'danger' },
        { id: 'delete-race-confirm-btn', type: 'danger' },
        { id: 'edit-race-btn', type: 'secondary' },
        { id: 'clear-departures-btn', type: 'warning' },
        { id: 'backup-race-btn', type: 'info' },
        { id: 'restore-race-btn', type: 'info' },
        { id: 'export-order-btn', type: 'success' }
    ];
    
    const hasCurrentRace = !!appState.currentRace;
    
    buttonsToUpdate.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
            if (hasCurrentRace) {
                element.disabled = false;
                element.classList.remove('disabled');
                element.title = element.getAttribute('data-original-title') || '';
            } else {
                element.disabled = true;
                element.classList.add('disabled');
                
                // Guardar título original si no está guardado
                if (!element.getAttribute('data-original-title')) {
                    element.setAttribute('data-original-title', element.title);
                }
                
                element.title = "Selecciona una carrera primero";
            }
        }
    });
    
    console.log(`✅ Botones de carrera ${hasCurrentRace ? 'HABILITADOS' : 'DESHABILITADOS'}`);
}

// ============================================
// CONFIGURAR SELECTOR DE CARRERAS
// ============================================
function setupRacesSelectListener() {
    const racesSelect = document.getElementById('races-select');
    
    if (!racesSelect) {
        console.error("❌ Selector de carreras no encontrado");
        return;
    }
    
    console.log("Configurando event listener para selector de carreras...");
    
    // Remover listeners antiguos si existen
    racesSelect.removeEventListener('change', handleRacesSelectChange);
    
    // Añadir nuevo listener
    racesSelect.addEventListener('change', handleRacesSelectChange);
    
    console.log("✅ Listener de selector de carreras configurado");
}

function handleRacesSelectChange(event) {
    const selectedRaceId = parseInt(event.target.value);
    
    if (selectedRaceId === 0) {
        // "Selecciona una carrera" - no hacer nada
        console.log("Seleccionada opción 'Selecciona una carrera'");
        return;
    }
    
    console.log("🔄 Cambiando a carrera ID:", selectedRaceId);
    handleRaceChange(selectedRaceId);
}

// Añadir esta función al final de UI.js para depuración y limpieza
function checkDuplicateImportListeners() {
    console.log("🔍 Verificando listeners duplicados en import-order-btn...");
    
    const importBtn = document.getElementById('import-order-btn');
    if (!importBtn) {
        console.log("⚠️ Botón import-order-btn no encontrado");
        return;
    }
    
    // Obtener todos los event listeners (usando hack para debugging)
    const listeners = getEventListeners ? getEventListeners(importBtn) : null;
    
    if (listeners && listeners.click) {
        console.log(`⚠️ Encontrados ${listeners.click.length} listeners de click en import-order-btn`);
        
        if (listeners.click.length > 1) {
            console.log("🚨 MÚLTIPLES LISTENERS DETECTADOS - Limpiando...");
            
            // Clonar y reemplazar el botón para eliminar todos los listeners
            const newBtn = importBtn.cloneNode(true);
            importBtn.parentNode.replaceChild(newBtn, importBtn);
            
            console.log("✅ Botón clonado - listeners antiguos eliminados");
            
            // Ahora configurar un único listener
            setupSingleImportListener();
        }
    } else {
        console.log("✅ Solo un listener o no se puede verificar (getEventListeners no disponible)");
    }
}

function setupSingleImportListener() {
    const importBtn = document.getElementById('import-order-btn');
    if (!importBtn) return;
    
    let isImporting = false;
    
    importBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isImporting) {
            console.log("🔄 Importación ya en progreso, ignorando click");
            return;
        }
        
        isImporting = true;
        console.log("📥 Único listener de importación ejecutado");
        
        if (typeof importStartOrder === 'function') {
            importStartOrder();
        }
        
        setTimeout(() => {
            isImporting = false;
        }, 1000);
    });
}

// Llamar esta función después de inicializar la aplicación
// setTimeout(checkDuplicateImportListeners, 1000);