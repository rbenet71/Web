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
let cronoDeCarreraIniciado = false;

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
    cronoDeCarreraIniciado = false;
    
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
    
    // IMPORTANTE: Obtener startOrderData de múltiples fuentes posibles
    const startOrderData = obtenerStartOrderData();
    console.log("startOrderData obtenido:", startOrderData ? "Sí, " + startOrderData.length + " corredores" : "No");
    
    const t = translations[appState.currentLanguage];
    
    if (!appState.currentRace) {
        showMessage(t.selectRaceFirst, 'error');
        return;
    }
    
    if (!startOrderData || startOrderData.length === 0) {
        showMessage("No hay datos de orden de salida. Importa o crea un orden de salida primero.", 'error');
        return;
    }
    
    // 1. Cuando el contador llega a 00:00 se inicia cuenta atrás de 60 segundos
    //    (Esto se manejará en handleCountdownZero)
    
    // 2. El contador de salidos se pone a 0
    appState.departedCount = 0;
    proximoCorredorIndex = 0;

    // 3. Todos los tiempos de salida real y crono salida real se ponen a valor vacío
    resetearTiemposReales();

    
    // 4. Primer corredor será el primer registro de la tabla
    const primerCorredor = obtenerProximoCorredor();
    if (!primerCorredor || !primerCorredor.corredor) {
        showMessage("Error: No hay corredores en el orden de salida", 'error');
        return;
    }
    
    console.log("📊 Primer corredor:", primerCorredor.corredor.dorsal, "- cronoSalida:", primerCorredor.corredor.cronoSalida);
    
    // 5. En la parte superior izquierda se muestra la Hora y el tiempo del crono de la carrera
    cronoCarreraSegundos = 0;
    cronoDeCarreraIniciado = false;
    actualizarCronoDisplay();
    actualizarHoraDisplay();
    
    // 6. El tiempo del crono siempre a cero durante está cuenta atrás
    //    (Ya está en cero por defecto)
    
    // Configurar cuenta atrás para el primer corredor
    cuentaAtrasActiva = true;
    
    // IMPORTANTE: Usar cronoSalida de la tabla para determinar tiempo de cuenta atrás
    if (primerCorredor.corredor.cronoSalida && primerCorredor.corredor.cronoSalida !== "00:00:00") {
        // Convertir cronoSalida (HH:MM:SS) a segundos
        tiempoCuentaAtrasActual = timeToSeconds(primerCorredor.corredor.cronoSalida);
        console.log("⏱️ Tiempo de cuenta atrás calculado desde cronoSalida:", primerCorredor.corredor.cronoSalida, "=", tiempoCuentaAtrasActual, "segundos");
    } else {
        // Si no tiene cronoSalida, usar 60 segundos por defecto
        tiempoCuentaAtrasActual = 60;
        console.log("⚠️ Usando tiempo por defecto (60s) porque cronoSalida no está definido");
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
    
    // Mostrar información del primer corredor en pantalla
    mostrarInfoCorredorEnPantalla(primerCorredor.corredor);
    
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
    cronoDeCarreraIniciado = false;
    
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
        intervaloCuentaAtras = null;
    }
    
    // Restaurar pantalla normal
    const countdownScreen = document.getElementById('countdown-screen');
    if (countdownScreen) {
        countdownScreen.classList.remove('active');
    }
    
    // Ocultar información del corredor
    ocultarInfoCorredorEnPantalla();
    
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
    
    // 7. Iniciar crono de carrera (esto debe pasar DESPUÉS de que el corredor sale)
    if (!cronoDeCarreraIniciado) {
        iniciarCronoDeCarrera();
    }
    
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
// NUEVAS FUNCIONES PARA MOSTRAR INFO DEL CORREDOR
// ============================================

function mostrarInfoCorredorEnPantalla(corredor) {
    console.log("📋 Mostrando información del corredor:", corredor.dorsal, corredor.nombre, corredor.apellidos);
    
    // Crear o actualizar el elemento para mostrar información del corredor
    let corredorInfoDisplay = document.getElementById('corredor-info-display');
    
    if (!corredorInfoDisplay) {
        corredorInfoDisplay = document.createElement('div');
        corredorInfoDisplay.id = 'corredor-info-display';
        corredorInfoDisplay.className = 'corredor-info-display';
        
        // Añadir estilos básicos
        corredorInfoDisplay.style.cssText = `
            position: absolute;
            bottom: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            text-align: center;
            z-index: 1000;
            min-width: 300px;
        `;
        
        const countdownScreen = document.getElementById('countdown-screen');
        if (countdownScreen) {
            countdownScreen.appendChild(corredorInfoDisplay);
        }
    }
    
    // Mostrar información del corredor
    corredorInfoDisplay.innerHTML = `
        <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">Dorsal: ${corredor.dorsal}</div>
        <div style="font-size: 28px;">${corredor.nombre || ''} ${corredor.apellidos || ''}</div>
    `;
    
    corredorInfoDisplay.style.display = 'block';
}

function ocultarInfoCorredorEnPantalla() {
    const corredorInfoDisplay = document.getElementById('corredor-info-display');
    if (corredorInfoDisplay) {
        corredorInfoDisplay.style.display = 'none';
    }
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
    
    // IMPORTANTE: cronoSalidaReal debe ser el tiempo actual del crono de carrera
    corredor.cronoSalidaReal = secondsToTime(cronoCarreraSegundos);
    corredor.horaSalidaRealSegundos = timeToSeconds(horaActual);
    corredor.cronoSalidaRealSegundos = cronoCarreraSegundos;
    
    // Actualizar en startOrderData
    const startOrderData = obtenerStartOrderData();
    if (startOrderData && index < startOrderData.length) {
        startOrderData[index] = corredor;
        
        // Guardar cambios
        if (typeof saveStartOrderData === 'function') {
            saveStartOrderData();
        }
    }
    
    // Actualizar contador de salidos
    appState.departedCount++;
    
    // Actualizar UI
    if (typeof updateStartOrderTableThrottled === 'function') {
        updateStartOrderTableThrottled(true);
    }
    
    console.log("✅ Salida registrada:", {
        dorsal: corredor.dorsal,
        horaReal: corredor.horaSalidaReal,
        cronoReal: corredor.cronoSalidaReal,
        cronoCarrera: cronoCarreraSegundos
    });
}

// ============================================
// FUNCIONES DE INICIO MANUAL (MODIFICADAS)
// ============================================

function iniciarCuentaAtrasManual(dorsal) {
    console.log("🎯 Iniciando cuenta atrás manual para dorsal:", dorsal);
    
    const t = translations[appState.currentLanguage];
    
    // Obtener startOrderData
    const startOrderData = obtenerStartOrderData();
    if (!startOrderData || startOrderData.length === 0) {
        showMessage("No hay datos de orden de salida", 'error');
        return;
    }
    
    // 1. Buscar corredor por dorsal en startOrderData
    const corredorIndex = startOrderData.findIndex(c => c.dorsal == dorsal);
    if (corredorIndex === -1) {
        showMessage(`No se encontró el dorsal ${dorsal}`, 'error');
        return;
    }
    
    const corredor = startOrderData[corredorIndex];
    
    console.log("📊 Corredor encontrado:", {
        dorsal: corredor.dorsal,
        orden: corredor.order,
        cronoSalida: corredor.cronoSalida,
        cronoSegundos: corredor.cronoSegundos
    });
    
    // 2. Establecer como próximo corredor a salir
    proximoCorredorIndex = corredorIndex;
    
    // 3. El tiempo del crono cuando se inicie la cuenta atrás será el valor del crono salida de ese corredor menos el minuto que sale antes.
    //    cronoCarreraSegundos = cronoSalida_corredor - 60 segundos
    if (corredor.cronoSegundos && corredor.cronoSegundos > 0) {
        cronoCarreraSegundos = corredor.cronoSegundos - 60;
        if (cronoCarreraSegundos < 0) cronoCarreraSegundos = 0;
    } else if (corredor.cronoSalida && corredor.cronoSalida !== "00:00:00") {
        // Convertir cronoSalida a segundos si cronoSegundos no está disponible
        const segundosCronoSalida = timeToSeconds(corredor.cronoSalida);
        cronoCarreraSegundos = segundosCronoSalida - 60;
        if (cronoCarreraSegundos < 0) cronoCarreraSegundos = 0;
    } else {
        cronoCarreraSegundos = 0;
    }
    
    // 4. Número de corredores salidos será su valor de orden en la tabla menos 1
    appState.departedCount = corredor.order - 1;
    
    // 5. Entonces a partir de que diga iniciar, se iniciará una cuenta atrás de un minuto.
    tiempoCuentaAtrasActual = 60;
    cuentaAtrasActiva = true;
    
    // Ocultar elementos durante cuenta atrás
    document.querySelectorAll('.hide-on-countdown').forEach(el => {
        el.style.display = 'none';
    });
    
    // Activar pantalla de cuenta atrás
    const countdownScreen = document.getElementById('countdown-screen');
    if (countdownScreen) {
        countdownScreen.classList.add('active');
    }
    
    // Mostrar información del corredor en pantalla
    mostrarInfoCorredorEnPantalla(corredor);
    
    // Resetear estilos
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    
    // Actualizar displays
    actualizarCronoDisplay();
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
    
    showMessage(`Cuenta atrás manual iniciada para dorsal ${dorsal}`, 'success');
    console.log("✅ Cuenta atrás manual iniciada:", {
        dorsal: dorsal,
        cronoCarrera: cronoCarreraSegundos,
        salidos: appState.departedCount,
        tiempoCuentaAtras: tiempoCuentaAtrasActual
    });
}

// ============================================
// FUNCIONES AUXILIARES MEJORADAS
// ============================================

function obtenerStartOrderData() {
    // Intentar obtener de múltiples fuentes en orden de prioridad
    if (window.startOrderData && Array.isArray(window.startOrderData) && window.startOrderData.length > 0) {
        console.log("📊 startOrderData obtenido de window.startOrderData:", window.startOrderData.length);
        return window.startOrderData;
    }
    
    // Si no está en window, intentar desde appState
    if (appState.currentRace && appState.currentRace.startOrder) {
        console.log("📊 startOrderData obtenido de appState.currentRace:", appState.currentRace.startOrder.length);
        return appState.currentRace.startOrder;
    }
    
    // Último intento: desde localStorage
    if (appState.currentRace) {
        const raceKey = `race-${appState.currentRace.id}`;
        const savedData = localStorage.getItem(raceKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.startOrder && Array.isArray(parsed.startOrder) && parsed.startOrder.length > 0) {
                    console.log("📊 startOrderData obtenido de localStorage:", parsed.startOrder.length);
                    return parsed.startOrder;
                }
            } catch (e) {
                console.error("Error parsing localStorage data:", e);
            }
        }
    }
    
    console.warn("⚠️ No se pudo obtener startOrderData de ninguna fuente");
    return null;
}

function obtenerProximoCorredor() {
    const startOrderData = obtenerStartOrderData();
    
    if (!startOrderData || startOrderData.length === 0) {
        console.warn("⚠️ No hay datos de orden de salida disponibles");
        return null;
    }
    
    console.log("🔍 Buscando próximo corredor en", startOrderData.length, "corredores");
    
    // Buscar el próximo corredor que no tenga horaSalidaReal
    for (let i = 0; i < startOrderData.length; i++) {
        const corredor = startOrderData[i];
        if (!corredor.horaSalidaReal || corredor.horaSalidaReal === '') {
            console.log("✅ Próximo corredor encontrado:", corredor.dorsal, "en índice", i);
            return {
                index: i,
                corredor: corredor
            };
        }
    }
    
    // Si todos tienen hora de salida, usar el último
    const ultimoIndex = startOrderData.length - 1;
    console.log("📌 Todos los corredores ya salieron, usando el último:", startOrderData[ultimoIndex].dorsal);
    return {
        index: ultimoIndex,
        corredor: startOrderData[ultimoIndex]
    };
}

function calcularTiempoCuentaAtras(corredor) {
    if (!corredor) {
        console.warn("⚠️ No se puede calcular tiempo: corredor no definido");
        return 60; // Valor por defecto
    }
    
    console.log("📊 Calculando tiempo de cuenta atrás para corredor:", corredor.dorsal);
    console.log("  - cronoSalida:", corredor.cronoSalida);
    console.log("  - cronoSegundos:", corredor.cronoSegundos);
    console.log("  - cronoCarreraSegundos actual:", cronoCarreraSegundos);
    
    // Obtener cronoSalida del corredor en segundos
    let segundosCronoSalida = 0;
    
    if (corredor.cronoSegundos && corredor.cronoSegundos > 0) {
        segundosCronoSalida = corredor.cronoSegundos;
    } else if (corredor.cronoSalida && corredor.cronoSalida !== "00:00:00") {
        segundosCronoSalida = timeToSeconds(corredor.cronoSalida);
    } else {
        console.warn("⚠️ Corredor no tiene cronoSalida definido");
        return 60; // Valor por defecto
    }
    
    // 9. El siguiente corredor... su cuenta atrás será la diferencia entre el valor de crono salida de la tabla menos el tiempo del crono de la carrera
    const tiempo = segundosCronoSalida - cronoCarreraSegundos;
    
    console.log("  - Tiempo calculado:", segundosCronoSalida, "-", cronoCarreraSegundos, "=", tiempo, "segundos");
    
    // Validaciones
    if (tiempo <= 0) {
        console.warn("⚠️ Tiempo calculado es <= 0, usando 60s por defecto");
        return 60;
    }
    
    if (tiempo > 3600) { // Más de 1 hora
        console.warn("⚠️ Tiempo calculado > 1h, usando 60s por defecto");
        return 60;
    }
    
    return tiempo;
}

function resetearTiemposReales() {
    // Usar window.startOrderData como fuente principal
    let startOrderData = window.startOrderData;
    
    // Si no está disponible, usar appState
    if (!startOrderData && window.appState && window.appState.currentRace && window.appState.currentRace.startOrder) {
        startOrderData = window.appState.currentRace.startOrder;
    }
    
    if (!startOrderData) return;
    
    startOrderData.forEach(corredor => {
        corredor.horaSalidaReal = '';
        corredor.cronoSalidaReal = '';
        corredor.horaSalidaRealSegundos = 0;
        corredor.cronoSalidaRealSegundos = 0;
    });
    
    // Guardar cambios
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
}

function actualizarCronoDisplay() {
    const display = document.getElementById('total-time-value');
    if (!display) return;
    
    // Formatear con precisión
    const horas = Math.floor(cronoCarreraSegundos / 3600);
    const minutos = Math.floor((cronoCarreraSegundos % 3600) / 60);
    const segundos = cronoCarreraSegundos % 60;
    
    display.textContent = 
        `${horas.toString().padStart(2, '0')}:` +
        `${minutos.toString().padStart(2, '0')}:` +
        `${segundos.toString().padStart(2, '0')}`;
    
    console.log(`⏱️ Cronómetro actualizado: ${display.textContent}`);
}

function actualizarHoraDisplay() {
    const display = document.getElementById('current-time-value');
    if (!display) return;
    
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    
    display.textContent = `${horas}:${minutos}:${segundos}`;
    
    console.log(`🕐 Hora actualizada: ${display.textContent}`);
}

function iniciarCronoDeCarrera() {
    console.log("⏱️ Iniciando cronómetro de carrera (sincronizado)...");
    
    cronoDeCarreraIniciado = true;
    
    // 🔥 CRÍTICO: Usar tiempo real para sincronización perfecta
    const startTime = Date.now();
    
    // Detener cualquier intervalo anterior
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
        intervaloCuentaAtras = null;
    }
    
    // Función de actualización sincronizada
    function updateCronoSincronizado() {
        if (!cronoDeCarreraIniciado) {
            console.log("⏱️ Cronómetro detenido");
            return;
        }
        
        // Calcular segundos transcurridos desde el inicio
        const elapsedMs = Date.now() - startTime;
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        // Actualizar variable global
        cronoCarreraSegundos = elapsedSeconds;
        
        // Actualizar display
        actualizarCronoDisplay();
        
        // 🔥 Sincronizar también con hora del sistema
        const ahora = new Date();
        const horaStr = ahora.toTimeString().split(' ')[0];
        const horaDisplay = document.getElementById('current-time-value');
        if (horaDisplay) horaDisplay.textContent = horaStr;
        
        // Programar siguiente actualización
        requestAnimationFrame(updateCronoSincronizado);
    }
    
    // Iniciar ciclo de actualización
    updateCronoSincronizado();
    
    console.log("✅ Cronómetro iniciado (sincronizado con tiempo real)");
}

function prepararSiguienteCorredor() {
    const siguiente = obtenerProximoCorredor();
    if (!siguiente || !siguiente.corredor) {
        console.log("🏁 No hay más corredores por salir");
        showMessage("¡Todos los corredores han salido!", 'success');
        
        // Detener cronómetro
        if (intervaloCuentaAtras) {
            clearInterval(intervaloCuentaAtras);
            intervaloCuentaAtras = null;
        }
        return;
    }
    
    console.log("➡️ Preparando siguiente corredor:", siguiente.corredor.dorsal);
    
    // Mostrar información del siguiente corredor
    mostrarInfoCorredorEnPantalla(siguiente.corredor);
    
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