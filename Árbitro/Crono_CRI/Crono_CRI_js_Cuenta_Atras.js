// ============================================
// ARCHIVO: Crono_CRI_js_Cuenta_Atras.js
// ============================================
// DESCRIPCIÓN: Módulo especializado para el sistema de cuenta atrás
// RESPONSABILIDADES:
//   1. Sistema de cuenta atrás basado en cronoSalida de la tabla
//   2. Gestión de salidas con tiempos reales
//   3. Inicio manual con dorsal específico
//   4. Cálculo automático de tiempos entre corredores
//   
// DEPENDENCIAS:
//   ← Main.js: Recibe appState y startOrderData
//   ← Utilidades.js: Funciones de tiempo y audio
//   → Storage_Pwa.js: Guarda datos de salidas
//   → UI.js: Muestra información en pantalla
// ============================================

// Variables específicas del módulo
let cuentaAtrasInitialized = false;
let proximoCorredorIndex = 0;
let cronoCarreraSegundos = 0;
let cuentaAtrasActiva = false;
let intervaloCuentaAtras = null;
let tiempoCuentaAtrasActual = 0;

// ============================================
// INICIALIZACIÓN
// ============================================

function inicializarSistemaCuentaAtras() {
    if (cuentaAtrasInitialized) {
        console.log("✅ Sistema de cuenta atrás ya inicializado");
        return;
    }
    
    console.log("🔄 Inicializando sistema de cuenta atrás...");
    
    // Configurar event listeners específicos
    configurarEventListenersCuentaAtras();
    
    // Inicializar estado
    resetearSistemaCuentaAtras();
    
    cuentaAtrasInitialized = true;
    console.log("✅ Sistema de cuenta atrás inicializado correctamente");
}

function configurarEventListenersCuentaAtras() {
    console.log("Configurando event listeners para cuenta atrás...");
    
    // Botón de iniciar cuenta atrás
    const startBtn = document.getElementById('start-countdown-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            startCountdown();
        });
    }
    
    // Botón de reiniciar/parar
    const exitBtn = document.getElementById('exit-complete-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            stopCountdown();
        });
    }
    
    // Configuración de tiempo entre salidas
    const intervalMinutes = document.getElementById('interval-minutes');
    const intervalSeconds = document.getElementById('interval-seconds');
    
    if (intervalMinutes) {
        intervalMinutes.addEventListener('change', updateCadenceTime);
    }
    if (intervalSeconds) {
        intervalSeconds.addEventListener('change', updateCadenceTime);
    }
}

function resetearSistemaCuentaAtras() {
    proximoCorredorIndex = 0;
    cronoCarreraSegundos = 0;
    cuentaAtrasActiva = false;
    tiempoCuentaAtrasActual = 0;
    
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
        intervaloCuentaAtras = null;
    }
    
    console.log("🔄 Sistema de cuenta atrás reseteado");
}

// ============================================
// FUNCIONES DE CUENTA ATRÁS (NUEVO SISTEMA)
// ============================================

function startCountdown() {
    console.log("🔄 Iniciando cuenta atrás (nuevo sistema)...");
    console.log("startOrderData disponible:", window.startOrderData ? "Sí, " + window.startOrderData.length + " corredores" : "No");
    
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    if (!window.startOrderData || window.startOrderData.length === 0) {
        showMessage("No hay datos de orden de salida. Importa o crea un orden de salida primero.", 'error');
        return;
    }
    
    // 1. Cuando el contador llega a 00:00 se inicia cuenta atrás de 60 segundos
    // 2. El contador de salidos se pone a 0
    appState.departedCount = 0;
    proximoCorredorIndex = 0;
    
    // 3. Todos los tiempos de salida real y crono salida real se ponen vacíos
    resetearTiemposReales();
    
    // 4. Primer corredor será el primer registro de la tabla
    const primerCorredor = window.startOrderData[0];
    if (!primerCorredor) {
        showMessage("Error: No hay corredores en el orden de salida", 'error');
        return;
    }
    
    // 5. Mostrar hora y tiempo del crono de la carrera
    cronoCarreraSegundos = 0;
    actualizarCronoDisplay();
    actualizarHoraDisplay();
    
    // 6. El tiempo del crono a cero durante cuenta atrás
    cuentaAtrasActiva = true;
    tiempoCuentaAtrasActual = 60; // Cuenta atrás de 60 segundos por defecto
    
    // Configurar tiempo de cuenta atrás según el primer corredor
    if (primerCorredor.cronoSegundos && primerCorredor.cronoSegundos > 0) {
        tiempoCuentaAtrasActual = primerCorredor.cronoSegundos;
    }
    
    // Ocultar elementos durante cuenta atrás
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = 'none';
    });
    
    // Activar pantalla de cuenta atrás
    const countdownScreen = document.getElementById('countdown-screen');
    if (countdownScreen) {
        countdownScreen.classList.add('active');
    }
    
    // Resetear estilos
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    
    // Actualizar displays
    updateCountdownDisplay();
    updateNextCorredorDisplay();
    
    // Iniciar intervalo
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
    }
    
    intervaloCuentaAtras = setInterval(updateCountdown, 1000);
    
    // Mantener pantalla activa
    if (typeof keepScreenAwake === 'function') {
        keepScreenAwake();
    }
    
    showMessage("Cuenta atrás iniciada. Primer corredor en " + tiempoCuentaAtrasActual + " segundos", 'success');
}

function stopCountdown() {
    console.log("🛑 Deteniendo cuenta atrás...");
    
    cuentaAtrasActiva = false;
    
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
        intervaloCuentaAtras = null;
    }
    
    // Restaurar pantalla normal
    const countdownScreen = document.getElementById('countdown-screen');
    if (countdownScreen) {
        countdownScreen.classList.remove('active');
    }
    
    // Mostrar elementos ocultos
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = '';
    });
    
    console.log("✅ Cuenta atrás detenida");
}

function updateCountdown() {
    if (!cuentaAtrasActiva) return;
    
    // Actualizar cuenta atrás
    tiempoCuentaAtrasActual--;
    
    // Actualizar display
    updateCountdownDisplay();
    
    // Verificar si llegó a cero
    if (tiempoCuentaAtrasActual <= 0) {
        handleCountdownZero();
        return;
    }
    
    // Cambios visuales según el tiempo
    if (tiempoCuentaAtrasActual === 10) {
        document.body.classList.remove('countdown-normal');
        document.body.classList.add('countdown-warning');
        if (typeof playSound === 'function') {
            playSound('warning');
        }
    } else if (tiempoCuentaAtrasActual === 5) {
        document.body.classList.remove('countdown-warning');
        document.body.classList.add('countdown-critical');
        if (typeof playSound === 'function') {
            playSound('critical');
        }
    } else if (tiempoCuentaAtrasActual < 5 && tiempoCuentaAtrasActual > 0) {
        if (typeof playSound === 'function') {
            if (appState.audioType === 'beep') {
                playSound('beep');
            } else if (appState.audioType === 'voice') {
                playSound('number');
            }
        }
    }
}

function handleCountdownZero() {
    console.log("🎯 Cuenta atrás llegó a cero");
    
    // 7. Cuando cuenta atrás llega a cero, crono de carrera empieza a contar
    cuentaAtrasActiva = false;
    
    // Mostrar SALIDA
    const countdownScreen = document.getElementById('countdown-screen');
    if (countdownScreen) {
        countdownScreen.classList.add('countdown-salida-active');
    }
    
    document.body.classList.remove('countdown-critical', 'countdown-warning', 'countdown-normal');
    document.body.classList.add('countdown-salida');
    
    const salidaDisplay = document.getElementById('salida-display');
    if (salidaDisplay) {
        salidaDisplay.classList.add('show');
    }
    
    // Reproducir sonido de salida
    if (typeof playSound === 'function') {
        playSound('salida');
    }
    
    // 8. Asignar horaSalidaReal y cronoSalidaReal al corredor que sale
    registerDeparture();
    
    // Iniciar crono de carrera
    iniciarCronoDeCarrera();
    
    // Ocultar "SALIDA" después de 2 segundos
    setTimeout(() => {
        if (salidaDisplay) {
            salidaDisplay.classList.remove('show');
        }
        if (countdownScreen) {
            countdownScreen.classList.remove('countdown-salida-active');
        }
        
        // Preparar siguiente corredor
        prepararSiguienteCorredor();
    }, 2000);
}

function updateCountdownDisplay() {
    const display = document.getElementById('countdown-display');
    if (!display) return;
    
    if (tiempoCuentaAtrasActual >= 60) {
        const minutes = Math.floor(tiempoCuentaAtrasActual / 60);
        const seconds = tiempoCuentaAtrasActual % 60;
        display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        display.textContent = tiempoCuentaAtrasActual.toString();
    }
    
    // Ajustar tamaño si es necesario
    if (typeof adjustCountdownSize === 'function') {
        adjustCountdownSize();
    }
}

function updateNextCorredorDisplay() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    
    const siguienteCorredor = obtenerProximoCorredor();
    
    if (siguienteCorredor && siguienteCorredor.corredor) {
        const tiempo = calcularTiempoCuentaAtras(siguienteCorredor.corredor);
        
        if (tiempo >= 60) {
            const minutes = Math.floor(tiempo / 60);
            const seconds = tiempo % 60;
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            display.textContent = tiempo + "s";
        }
        
        console.log(`Próximo corredor: ${siguienteCorredor.corredor.dorsal} - Sale en ${tiempo}s`);
    } else {
        display.textContent = "--";
    }
}

function updateCurrentInterval() {
    // Esta función ya no es necesaria en el nuevo sistema
    // Los intervalos se calculan dinámicamente
    console.log("updateCurrentInterval - Función obsoleta en nuevo sistema");
}

function updateCadenceTime() {
    const minutes = parseInt(document.getElementById('interval-minutes').value) || 0;
    const seconds = parseInt(document.getElementById('interval-seconds').value) || 0;
    const totalSeconds = minutes * 60 + seconds;
    
    console.log("Intervalo configurado:", minutes, "min", seconds, "seg");
    
    // Esto se usará solo para el modo manual/emergencia
    appState.nextCorredorTime = totalSeconds;
    
    updateNextCorredorDisplay();
}

// ============================================
// REGISTRO DE SALIDAS (NUEVO SISTEMA)
// ============================================

function registerDeparture() {
    const siguiente = obtenerProximoCorredor();
    if (!siguiente || !siguiente.corredor) {
        console.error("No hay corredor para registrar salida");
        return;
    }
    
    const corredor = siguiente.corredor;
    const index = siguiente.index;
    
    console.log("📝 Registrando salida del corredor:", corredor.dorsal, "índice:", index);
    
    // 8. Asignar horaSalidaReal y cronoSalidaReal
    const ahora = new Date();
    const horaActual = ahora.toTimeString().split(' ')[0]; // HH:MM:SS
    
    corredor.horaSalidaReal = horaActual;
    corredor.cronoSalidaReal = secondsToTime(cronoCarreraSegundos);
    corredor.horaSalidaRealSegundos = timeToSeconds(horaActual);
    corredor.cronoSalidaRealSegundos = cronoCarreraSegundos;
    
    // Actualizar en startOrderData
    window.startOrderData[index] = corredor;
    
    // Actualizar contador de salidos
    appState.departedCount++;
    
    // Actualizar UI
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled(true);
    }
    
    console.log("✅ Salida registrada:", {
        dorsal: corredor.dorsal,
        horaReal: corredor.horaSalidaReal,
        cronoReal: corredor.cronoSalidaReal
    });
}

// ============================================
// FUNCIONES DE INICIO MANUAL
// ============================================

function iniciarCuentaAtrasManual(dorsal) {
    console.log("🎯 Iniciando cuenta atrás manual para dorsal:", dorsal);
    
    // 1. Buscar corredor por dorsal en startOrderData
    const corredorIndex = window.startOrderData.findIndex(c => c.dorsal == dorsal);
    if (corredorIndex === -1) {
        showMessage(`No se encontró el dorsal ${dorsal}`, 'error');
        return;
    }
    
    const corredor = window.startOrderData[corredorIndex];
    
    // 2. Establecer como próximo corredor a salir
    proximoCorredorIndex = corredorIndex;
    
    // 3. Calcular crono de carrera = cronoSalida del corredor - 60 segundos
    cronoCarreraSegundos = corredor.cronoSegundos - 60;
    if (cronoCarreraSegundos < 0) cronoCarreraSegundos = 0;
    
    // 4. Número de salidos = orden del corredor - 1
    appState.departedCount = corredor.order - 1;
    
    // 5. Iniciar cuenta atrás de 60 segundos
    tiempoCuentaAtrasActual = 60;
    cuentaAtrasActiva = true;
    
    // Actualizar displays
    actualizarCronoDisplay();
    updateCountdownDisplay();
    updateNextCorredorDisplay();
    
    showMessage(`Cuenta atrás manual iniciada para dorsal ${dorsal}`, 'success');
}

function obtenerProximoCorredor() {
    if (!window.startOrderData || window.startOrderData.length === 0) {
        console.warn("⚠️ No hay datos de orden de salida");
        return null;
    }
    
    // Buscar el próximo corredor que no tenga horaSalidaReal
    for (let i = 0; i < window.startOrderData.length; i++) {
        const corredor = window.startOrderData[i];
        if (!corredor.horaSalidaReal || corredor.horaSalidaReal === '') {
            return {
                index: i,
                corredor: corredor
            };
        }
    }
    
    // Si todos tienen hora de salida, usar el último
    const ultimoIndex = window.startOrderData.length - 1;
    return {
        index: ultimoIndex,
        corredor: window.startOrderData[ultimoIndex]
    };
}

function calcularTiempoCuentaAtras(corredor) {
    if (!corredor || !corredor.cronoSegundos) {
        console.warn("⚠️ No se puede calcular tiempo: datos de corredor incompletos");
        return 60; // Valor por defecto
    }
    
    // Tiempo = cronoSalida del corredor - crono de carrera actual
    const tiempo = corredor.cronoSegundos - cronoCarreraSegundos;
    
    // Si es negativo o menor que 0, usar 60 segundos por defecto
    if (tiempo <= 0) {
        return 60;
    }
    
    return tiempo;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function resetearTiemposReales() {
    if (!window.startOrderData) return;
    
    console.log("🔄 Reseteando tiempos reales de todos los corredores...");
    
    window.startOrderData.forEach(corredor => {
        corredor.horaSalidaReal = '';
        corredor.cronoSalidaReal = '';
        corredor.horaSalidaRealSegundos = 0;
        corredor.cronoSalidaRealSegundos = 0;
    });
    
    console.log("✅ Tiempos reales reseteados");
}

function actualizarCronoDisplay() {
    const display = document.getElementById('total-time-value');
    if (!display) return;
    
    const tiempoFormateado = secondsToTime(cronoCarreraSegundos);
    display.textContent = tiempoFormateado;
}

function actualizarHoraDisplay() {
    const display = document.getElementById('current-time-value');
    if (!display) return;
    
    const ahora = new Date();
    const horaStr = ahora.toLocaleTimeString('es-ES', { hour12: false });
    display.textContent = horaStr;
}

function iniciarCronoDeCarrera() {
    console.log("⏱️ Iniciando crono de carrera...");
    
    // Iniciar intervalo para incrementar crono de carrera cada segundo
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
    }
    
    intervaloCuentaAtras = setInterval(() => {
        cronoCarreraSegundos++;
        actualizarCronoDisplay();
        
        // Verificar si hay siguiente corredor listo para salir
        const siguiente = obtenerProximoCorredor();
        if (siguiente && siguiente.corredor) {
            const tiempoParaSiguiente = calcularTiempoCuentaAtras(siguiente.corredor);
            
            if (tiempoParaSiguiente <= 60) {
                // Si falta 1 minuto o menos para el siguiente corredor, iniciar cuenta atrás
                if (!cuentaAtrasActiva && tiempoParaSiguiente > 0) {
                    console.log(`⚠️ Falta ${tiempoParaSiguiente}s para el siguiente corredor, iniciando cuenta atrás`);
                    cuentaAtrasActiva = true;
                    tiempoCuentaAtrasActual = tiempoParaSiguiente;
                    clearInterval(intervaloCuentaAtras);
                    intervaloCuentaAtras = setInterval(updateCountdown, 1000);
                }
            }
        }
    }, 1000);
}

function prepararSiguienteCorredor() {
    const siguiente = obtenerProximoCorredor();
    if (!siguiente || !siguiente.corredor) {
        console.log("🏁 No hay más corredores por salir");
        showMessage("¡Todos los corredores han salido!", 'success');
        stopCountdown();
        return;
    }
    
    console.log("➡️ Preparando siguiente corredor:", siguiente.corredor.dorsal);
    
    // Actualizar displays para el siguiente corredor
    updateNextCorredorDisplay();
}

// ============================================
// FUNCIONES DE TIEMPO (placeholder - se deben mover de Utilidades.js)
// ============================================

function secondsToTime(seconds) {
    if (typeof window.secondsToTime === 'function') {
        return window.secondsToTime(seconds);
    }
    
    // Implementación básica si no existe
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function timeToSeconds(timeStr) {
    if (typeof window.timeToSeconds === 'function') {
        return window.timeToSeconds(timeStr);
    }
    
    // Implementación básica si no existe
    if (!timeStr) return 0;
    
    const parts = timeStr.split(':');
    if (parts.length === 3) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    } else if (parts.length === 2) {
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
    }
    
    return 0;
}

function formatTimeValue(timeStr) {
    if (typeof window.formatTimeValue === 'function') {
        return window.formatTimeValue(timeStr);
    }
    
    // Implementación básica
    if (!timeStr) return '00:00:00';
    return timeStr;
}

console.log("✅ Módulo de cuenta atrás cargado y listo");