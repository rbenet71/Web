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
    const primerCorredor = startOrderData[0];
    if (!primerCorredor) {
        showMessage("Error: No hay corredores en el orden de salida", 'error');
        return;
    }
    
    console.log("📊 Primer corredor:", primerCorredor.dorsal, "- cronoSalida:", primerCorredor.cronoSalida);
    
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
    if (primerCorredor.cronoSalida && primerCorredor.cronoSalida !== "00:00:00") {
        // Usar la función calcularTiempoCuentaAtras para consistencia
        tiempoCuentaAtrasActual = calcularTiempoCuentaAtras(primerCorredor);
        console.log("⏱️ Tiempo de cuenta atrás calculado:", tiempoCuentaAtrasActual, "segundos");
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
    mostrarInfoCorredorEnPantalla(primerCorredor);
    
    // Actualizar displays
    updateCountdownDisplay();
    
    // MOSTRAR DIFERENCIA DEL SEGUNDO CORREDOR (posición 1)
    actualizarDisplayProximoCorredor();
    
    // Iniciar intervalo
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
    }
    
    intervaloCuentaAtras = setInterval(updateCountdown, 1000);
    
    // Mantener pantalla activa
    if (typeof keepScreenAwake === 'function') {
        keepScreenAwake();
    }
    
    // Verificar si hay segundo corredor para mostrar su diferencia
    if (startOrderData.length > 1) {
        const segundoCorredor = startOrderData[1];
        console.log("✅ Cuenta atrás iniciada. Corredor actual: dorsal", primerCorredor.dorsal, 
                    "| Próximo corredor (dorsal", segundoCorredor.dorsal, 
                    ") diferencia:", segundoCorredor.diferencia);
    } else {
        console.log("✅ Cuenta atrás iniciada. Único corredor: dorsal", primerCorredor.dorsal);
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
    
    // 1. Mostrar SALIDA
    cuentaAtrasActiva = false;
    
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
    
    // 2. Asignar horaSalidaReal y cronoSalidaReal al corredor que sale
    registerDeparture();
    
    // 3. Iniciar crono de carrera (esto debe pasar DESPUÉS de que el corredor sale)
    if (!cronoDeCarreraIniciado) {
        iniciarCronoDeCarrera();
    }
    
    // 4. Ocultar "SALIDA" después de 2 segundos
    setTimeout(() => {
        if (salidaDisplay) {
            salidaDisplay.classList.remove('show');
        }
        if (countdownScreen) {
            countdownScreen.classList.remove('countdown-salida-active');
        }
        
        // NOTA: NO añadimos segundos manualmente aquí
        // El cronómetro de carrera (iniciarCronoDeCarrera) ya está avanzando
        // y calcularTiempoCuentaAtras usará ese tiempo exacto
        
        console.log(`⏱️ Tiempo del cronómetro de carrera: ${cronoCarreraSegundos}s`);
        
        // 5. Preparar siguiente corredor
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
        
        // POSICIÓN MODIFICADA: En la parte inferior, centrado horizontalmente
        corredorInfoDisplay.style.cssText = `
            position: fixed;
            bottom: 20px; /* Pequeña distancia desde el fondo */
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 18px;
            text-align: center;
            z-index: 1000;
            min-width: 300px;
            max-width: 80%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        const countdownScreen = document.getElementById('countdown-screen');
        if (countdownScreen) {
            countdownScreen.appendChild(corredorInfoDisplay);
        }
    }
    
    // FORMATO MODIFICADO: Una sola línea sin "Dorsal:"
    const nombreCompleto = [corredor.nombre || '', corredor.apellidos || ''].filter(Boolean).join(' ');
    corredorInfoDisplay.innerHTML = `
        <div style="display: inline-block; margin: 0 10px;">
            <span style="font-weight: bold; font-size: 20px;">${corredor.dorsal}</span>
        </div>
        <div style="display: inline-block; border-left: 2px solid rgba(255,255,255,0.3); padding-left: 12px; margin-left: 12px;">
            <span style="font-size: 24px;">${nombreCompleto || 'Sin nombre'}</span>
        </div>
    `;
    
    corredorInfoDisplay.style.display = 'block';
}

function ocultarInfoCorredorEnPantalla() {
    const corredorInfoDisplay = document.getElementById('corredor-info-display');
    if (corredorInfoDisplay) {
        corredorInfoDisplay.style.display = 'none';
    }
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
    if (!siguiente || !siguiente.corredor) return;
    
    const corredor = siguiente.corredor;
    const index = siguiente.index;
    
    // ... (código existente para asignar tiempos) ...
    
    // 🔥 INCREMENTAR CONTADOR DE SALIDOS
    if (window.appState) {
        window.appState.departedCount = (window.appState.departedCount || 0) + 1;
        console.log("✅ Corredores salidos:", window.appState.departedCount);
    }
    
    // 🔥 ACTUALIZAR DISPLAY INMEDIATAMENTE
    const departedCountElement = document.getElementById('departed-count');
    if (departedCountElement) {
        departedCountElement.textContent = window.appState.departedCount || "1";
        console.log("✅ Display de salidos actualizado a:", departedCountElement.textContent);
    }
    
    // Guardar cambios
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
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
    // CAMBIO: Usar actualizarDisplayProximoCorredor() en lugar de updateNextCorredorDisplay()
    actualizarDisplayProximoCorredor();
    
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
    
    console.log("🔍 Buscando próximo corredor en índice", proximoCorredorIndex);
    
    // Verificar si el índice actual es válido
    if (proximoCorredorIndex >= startOrderData.length) {
        console.log("🏁 Todos los corredores ya han sido procesados");
        return null;
    }
    
    const corredor = startOrderData[proximoCorredorIndex];
    
    // Verificar si este corredor ya tiene hora de salida
    if (corredor.horaSalidaReal && corredor.horaSalidaReal !== '') {
        console.log(`⚠️ Corredor ${corredor.dorsal} ya tiene hora de salida, buscando siguiente...`);
        
        // Buscar el siguiente corredor sin hora de salida
        for (let i = proximoCorredorIndex + 1; i < startOrderData.length; i++) {
            const siguienteCorredor = startOrderData[i];
            if (!siguienteCorredor.horaSalidaReal || siguienteCorredor.horaSalidaReal === '') {
                proximoCorredorIndex = i;
                console.log(`✅ Próximo corredor encontrado: ${siguienteCorredor.dorsal} en índice ${i}`);
                return {
                    index: i,
                    corredor: siguienteCorredor
                };
            }
        }
        
        console.log("🏁 No hay más corredores sin hora de salida");
        return null;
    }
    
    console.log(`✅ Próximo corredor: ${corredor.dorsal} en índice ${proximoCorredorIndex}`);
    return {
        index: proximoCorredorIndex,
        corredor: corredor
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
    console.log("  - appState.departedCount:", appState.departedCount);
    
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
    
    // Determinar si es el primer corredor
    const esPrimerCorredor = appState.departedCount === 0;
    
    // FÓRMULA: Solo restar 1 segundo de compensación si NO es el primer corredor
    let tiempo = 0;
    
    if (!esPrimerCorredor) {
        tiempo = segundosCronoSalida - cronoCarreraSegundos - 1;
        console.log("  - Tiempo calculado (NO primer corredor, -1s):", segundosCronoSalida, "-", cronoCarreraSegundos, "- 1s =", tiempo, "segundos");
    } else {
        tiempo = segundosCronoSalida - cronoCarreraSegundos;
        console.log("  - Tiempo calculado (primer corredor, sin -1s):", segundosCronoSalida, "-", cronoCarreraSegundos, "=", tiempo, "segundos");
    }
    
    // Validaciones
    if (tiempo <= 0) {
        console.warn("⚠️ Tiempo calculado es <= 0, usando 60s por defecto");
        return 60;
    }
    
    if (tiempo > 3600) {
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
    cronoDeCarreraIniciado = true;
    const startTime = Date.now();
    
    function updateCronoSincronizado() {
        if (!cronoDeCarreraIniciado) return;
        
        const elapsedMs = Date.now() - startTime;
        cronoCarreraSegundos = Math.floor(elapsedMs / 1000);
        actualizarCronoDisplay();
        
        // 🔥 VERIFICAR SI HAY QUE PREPARAR SIGUIENTE CORREDOR
        const siguiente = obtenerProximoCorredor();
        if (siguiente && siguiente.corredor) {
            const tiempoRestante = calcularTiempoCuentaAtras(siguiente.corredor);
            
            // Si falta 1 minuto o menos y no hay cuenta atrás activa
            if (tiempoRestante <= 60 && tiempoRestante > 0 && !cuentaAtrasActiva) {
                console.log(`⏰ Falta ${tiempoRestante}s para siguiente corredor, iniciando cuenta atrás`);
                
                cuentaAtrasActiva = true;
                tiempoCuentaAtrasActual = tiempoRestante;
                mostrarInfoCorredorEnPantalla(siguiente.corredor);
                updateCountdownDisplay();
                
                // Mostrar diferencia del siguiente-siguiente
                actualizarDisplayProximoCorredor();
            }
        }
        
        requestAnimationFrame(updateCronoSincronizado);
    }
    
    updateCronoSincronizado();
}

function prepararSiguienteCorredor() {
    // Incrementar índice para pasar al siguiente corredor
    proximoCorredorIndex++;
    
    console.log("🔍 Buscando siguiente corredor después del índice", proximoCorredorIndex);
    
    const siguiente = obtenerProximoCorredor();
    if (!siguiente || !siguiente.corredor) {
        console.log("🏁 No hay más corredores por salir");
        showMessage("¡Todos los corredores han salido!", 'success');
        
        // Detener cronómetro
        if (intervaloCuentaAtras) {
            clearInterval(intervaloCuentaAtras);
            intervaloCuentaAtras = null;
        }
        
        // Mostrar "--" en el display del próximo corredor
        const nextDisplay = document.getElementById('next-corredor-time');
        if (nextDisplay) {
            nextDisplay.textContent = "--";
        }
        return;
    }
    
    console.log("➡️ Preparando siguiente corredor:", siguiente.corredor.dorsal, 
                "en índice", siguiente.index, "proximoCorredorIndex actual:", proximoCorredorIndex);
    
    // Asegurarnos de que proximoCorredorIndex coincide con el índice del corredor
    if (proximoCorredorIndex !== siguiente.index) {
        console.log(`🔄 Ajustando proximoCorredorIndex de ${proximoCorredorIndex} a ${siguiente.index}`);
        proximoCorredorIndex = siguiente.index;
    }
    
    // 1. Mostrar información del siguiente corredor
    mostrarInfoCorredorEnPantalla(siguiente.corredor);
    
    // 2. Calcular tiempo de cuenta atrás usando la función especializada
    let tiempoCuentaAtras = calcularTiempoCuentaAtras(siguiente.corredor);
    
    console.log(`⏱️ Tiempo de cuenta atrás para ${siguiente.corredor.dorsal}: ${tiempoCuentaAtras}s`);
    
    // 3. Iniciar nueva cuenta atrás
    cuentaAtrasActiva = true;
    tiempoCuentaAtrasActual = tiempoCuentaAtras;
    
    // 4. Resetear estilos visuales
    document.body.classList.remove('countdown-warning', 'countdown-critical', 'countdown-salida');
    document.body.classList.add('countdown-normal');
    
    // 5. Actualizar display de cuenta atrás actual
    updateCountdownDisplay();
    
    // 6. MOSTRAR DIFERENCIA DEL SIGUIENTE-SIGUIENTE CORREDOR
    actualizarDisplayProximoCorredor();
    
    console.log(`✅ Preparado corredor ${siguiente.corredor.dorsal} para salir en ${tiempoCuentaAtrasActual} segundos`);
    
    // Verificar qué corredor se mostrará como "próximo"
    const siguienteDeSiguiente = obtenerSiguienteCorredorDespuesDelActual();
    if (siguienteDeSiguiente && siguienteDeSiguiente.corredor) {
        console.log(`📊 Próximo corredor (para mostrar diferencia): dorsal ${siguienteDeSiguiente.corredor.dorsal}, diferencia: ${siguienteDeSiguiente.corredor.diferencia}`);
    }
}

function actualizarDisplayProximoCorredor() {
    const display = document.getElementById('next-corredor-time');
    if (!display) return;
    
    // Obtener el siguiente corredor (el que sale después del actual)
    const siguiente = obtenerSiguienteCorredorDespuesDelActual();
    
    if (siguiente && siguiente.corredor) {
        // Obtener la diferencia del corredor
        let diferenciaValor = siguiente.corredor.diferencia;
        
        console.log(`📊 Procesando diferencia para corredor ${siguiente.corredor.dorsal}:`, diferenciaValor);
        
        // Convertir diferencia a segundos si es necesario
        let segundosDiferencia = 0;
        
        if (diferenciaValor) {
            if (typeof diferenciaValor === 'number') {
                segundosDiferencia = diferenciaValor;
                console.log(`✅ Diferencia como número: ${segundosDiferencia}s`);
            } else if (typeof diferenciaValor === 'string') {
                const diferenciaLimpia = diferenciaValor.split(' ')[0];
                segundosDiferencia = timeToSeconds(diferenciaLimpia);
                console.log(`✅ Diferencia convertida: "${diferenciaValor}" -> "${diferenciaLimpia}" -> ${segundosDiferencia}s`);
            }
        }
        
        // Formatear para mostrar
        if (segundosDiferencia > 0) {
            if (segundosDiferencia >= 60) {
                const minutes = Math.floor(segundosDiferencia / 60);
                const seconds = segundosDiferencia % 60;
                display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            } else {
                display.textContent = segundosDiferencia + "s";
            }
            console.log(`➡️ Próximo corredor (${siguiente.corredor.dorsal}) sale en: ${display.textContent} (${segundosDiferencia}s)`);
        } else {
            display.textContent = "--";
        }
    } else {
        display.textContent = "--";
        console.log("🏁 No hay más corredores después del actual");
    }
}

function obtenerSiguienteCorredorDespuesDelActual() {
    const startOrderData = obtenerStartOrderData();
    
    if (!startOrderData || startOrderData.length === 0) {
        console.log("⚠️ No hay datos de orden de salida");
        return null;
    }
    
    console.log(`🔍 Buscando siguiente corredor después del índice ${proximoCorredorIndex} (total: ${startOrderData.length})`);
    
    // Buscar el siguiente corredor después del actual
    const siguienteIndex = proximoCorredorIndex + 1;
    
    if (siguienteIndex < startOrderData.length) {
        const corredor = startOrderData[siguienteIndex];
        
        // Verificar que el corredor existe y no tiene hora de salida real
        if (corredor && (!corredor.horaSalidaReal || corredor.horaSalidaReal === '')) {
            console.log(`✅ Siguiente corredor encontrado: ${corredor.dorsal} en índice ${siguienteIndex}`, {
                diferencia: corredor.diferencia,
                cronoSalida: corredor.cronoSalida,
                horaSalidaReal: corredor.horaSalidaReal
            });
            return {
                index: siguienteIndex,
                corredor: corredor
            };
        } else {
            console.log(`⏭️ Corredor ${corredor.dorsal} ya tiene hora de salida, buscando siguiente...`);
            
            // Buscar el siguiente corredor sin hora de salida
            for (let i = siguienteIndex + 1; i < startOrderData.length; i++) {
                const siguienteCorredor = startOrderData[i];
                if (siguienteCorredor && (!siguienteCorredor.horaSalidaReal || siguienteCorredor.horaSalidaReal === '')) {
                    console.log(`✅ Siguiente corredor disponible: ${siguienteCorredor.dorsal} en índice ${i}`);
                    return {
                        index: i,
                        corredor: siguienteCorredor
                    };
                }
            }
            
            console.log("🏁 No hay más corredores sin hora de salida");
            return null;
        }
    }
    
    console.log("🏁 No hay más corredores después del actual");
    return null;
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
    
    // Implementación mejorada
    if (!timeStr || timeStr === '' || timeStr === '00:00:00') {
        return 0;
    }
    
    // Limpiar el string (eliminar espacios, paréntesis, etc.)
    const cleanedStr = String(timeStr).trim().split(' ')[0];
    
    const parts = cleanedStr.split(':');
    
    // Validar que tengamos partes válidas
    if (parts.length < 2 || parts.length > 3) {
        console.warn(`⚠️ Formato de tiempo inválido: "${timeStr}"`);
        return 0;
    }
    
    try {
        let horas = 0, minutos = 0, segundos = 0;
        
        if (parts.length === 3) {
            horas = parseInt(parts[0]) || 0;
            minutos = parseInt(parts[1]) || 0;
            segundos = parseInt(parts[2]) || 0;
        } else if (parts.length === 2) {
            // Asumir formato MM:SS
            minutos = parseInt(parts[0]) || 0;
            segundos = parseInt(parts[1]) || 0;
        }
        
        const totalSegundos = horas * 3600 + minutos * 60 + segundos;
        console.log(`⏱️ Conversión: "${timeStr}" -> "${cleanedStr}" -> ${totalSegundos}s`);
        return totalSegundos;
    } catch (e) {
        console.error(`❌ Error convirtiendo tiempo "${timeStr}":`, e);
        return 0;
    }
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