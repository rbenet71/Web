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
    
    // Configurar event listeners específicos
    configurarEventListenersCuentaAtras();
    
    // Inicializar estado
    resetearSistemaCuentaAtras();
    
    cuentaAtrasInitialized = true;
    console.log("✅ Sistema de cuenta atrás inicializado correctamente");
}

function configurarEventListenersCuentaAtras() {
    // Botón de iniciar cuenta atrás MANUAL
    const startBtn = document.getElementById('start-countdown-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            // Iniciar cuenta atrás MANUAL (no automática)
            iniciarCuentaAtrasManual();
        });
    }
    
    // Botón de reiniciar/parar - 🔥 MODIFICADO
    const exitBtn = document.getElementById('exit-complete-btn');
    if (exitBtn) {
        // 🔥 SOLUCIÓN: Reemplazar completamente el botón para eliminar listeners antiguos
        const parent = exitBtn.parentNode;
        const newExitBtn = exitBtn.cloneNode(true); // Clonar
        parent.replaceChild(newExitBtn, exitBtn);   // Reemplazar
        
        // Configurar NUEVO listener en el botón clonado
        document.getElementById('exit-complete-btn').addEventListener('click', function(e) {
            e.preventDefault(); // 🔥 IMPORTANTE: Prevenir comportamiento por defecto
            e.stopPropagation(); // 🔥 IMPORTANTE: Detener propagación
            
            console.log("🔘 Botón REINICIAR TODO presionado - Abriendo modal personalizado");
            
            // 🔥 SOLO abrir el modal personalizado - NO usar confirm() nativo
            const modal = document.getElementById('restart-confirm-modal');
            if (modal) {
                console.log("✅ Modal restart-confirm-modal encontrado, abriendo...");
                modal.classList.add('active');
            } else {
                console.error("❌ ERROR: No se encontró modal restart-confirm-modal");
            }
        }, { once: false }); // 🔥 Asegurar que se puede llamar múltiples veces
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
    
    // Botón de configuración durante cuenta atrás
    const configToggleBtn = document.getElementById('config-toggle');
    if (configToggleBtn) {
        configToggleBtn.addEventListener('click', function() {
            const configModal = document.getElementById('config-during-countdown-modal');
            if (configModal) {
                configModal.classList.add('active');
            }
        });
    }
    
    // 🔥 NUEVO: Configurar sincronización dorsal↔posición
    const inputPosicion = document.getElementById('start-position');
    const inputDorsal = document.getElementById('manual-dorsal');
    
    if (inputPosicion && inputDorsal) {
        // Sincronizar: posición → dorsal
        inputPosicion.addEventListener('change', function() {
            const posicion = parseInt(this.value);
            if (posicion > 0) {
                sincronizarPosicionADorsal(posicion);
            }
        });
        
        // Sincronizar: dorsal → posición
        inputDorsal.addEventListener('change', function() {
            const dorsal = parseInt(this.value);
            if (dorsal > 0) {
                sincronizarDorsalAPosicion(dorsal);
            }
        });
    }
    
    // 🔥 MODIFICADO: Esperar a que el DOM esté completamente listo
    setTimeout(() => {
        configurarBotonesModalReinicio();
    }, 100);
}

// ============================================
// CONFIGURACIÓN MODAL DE REINICIO (NUEVO)
// ============================================

function configurarBotonesModalReinicio() {
    // Variable para controlar inicialización única
    if (typeof window.modalReinicioConfigurado === 'undefined') {
        window.modalReinicioConfigurado = false;
    }
    
    // Evitar inicialización duplicada
    if (window.modalReinicioConfigurado) {
        console.log("✅ Modal de reinicio ya configurado, omitiendo");
        return;
    }
    
    
    // Verificar que los elementos existen
    const modal = document.getElementById('restart-confirm-modal');
    const closeBtn = document.getElementById('restart-modal-close');
    const cancelBtn = document.getElementById('restart-cancel-btn');
    const confirmBtn = document.getElementById('restart-confirm-btn');
    
    if (!modal) {
        console.error("❌ ERROR: No se encontró modal restart-confirm-modal");
        return;
    }
    
    console.log("✅ Elementos encontrados:", {
        modal: !!modal,
        closeBtn: !!closeBtn,
        cancelBtn: !!cancelBtn,
        confirmBtn: !!confirmBtn
    });
    
    // Función para clonar y reemplazar un botón (elimina listeners antiguos)
    function reemplazarBotonConClon(id) {
        const botonOriginal = document.getElementById(id);
        if (!botonOriginal) return null;
        
        const nuevoBoton = botonOriginal.cloneNode(true);
        botonOriginal.parentNode.replaceChild(nuevoBoton, botonOriginal);
        return document.getElementById(id);
    }
    
    // 1. Botón de cerrar modal (X)
    if (closeBtn) {
        const nuevoCloseBtn = reemplazarBotonConClon('restart-modal-close');
        if (nuevoCloseBtn) {
            nuevoCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("❌ Cerrar modal (X) clickeado");
                modal.classList.remove('active');
            });
        }
    }
    
    // 2. Botón Cancelar
    if (cancelBtn) {
        const nuevoCancelBtn = reemplazarBotonConClon('restart-cancel-btn');
        if (nuevoCancelBtn) {
            nuevoCancelBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("❌ Cancelar clickeado");
                modal.classList.remove('active');
            });
        }
    }
    
    // 3. Botón Confirmar Reinicio
    if (confirmBtn) {
        const nuevoConfirmBtn = reemplazarBotonConClon('restart-confirm-btn');
        if (nuevoConfirmBtn) {
            nuevoConfirmBtn.addEventListener('click', function ejecutarReinicioHandler(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log("✅ Confirmar reinicio clickeado");
                modal.classList.remove('active');
                
                // Ejecutar reinicio completo
                if (typeof ejecutarReinicioCompleto === 'function') {
                    console.log("🔄 Ejecutando reinicio completo...");
                    ejecutarReinicioCompleto();
                } else {
                    console.error("❌ ERROR: función ejecutarReinicioCompleto no encontrada");
                    // Intentar cargar la función de otro lugar si existe
                    if (window.ejecutarReinicioCompleto) {
                        console.log("ℹ️ Encontrada función global, ejecutando...");
                        window.ejecutarReinicioCompleto();
                    }
                }
            });
        }
    }
    
    // 4. Cerrar modal al hacer clic fuera (solo configurar una vez)
    if (!modal.dataset.outsideClickConfigured) {
        modal.addEventListener('click', function modalOutsideClickHandler(e) {
            if (e.target === modal) {
                console.log("👆 Clic fuera del modal - cerrando");
                modal.classList.remove('active');
            }
        });
        modal.dataset.outsideClickConfigured = 'true';
    }
    
    // 5. Cerrar con tecla Escape (solo configurar una vez)
    if (!modal.dataset.escapeKeyConfigured) {
        const escapeKeyHandler = function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                console.log("⎋ Tecla Escape presionada - cerrando modal");
                modal.classList.remove('active');
            }
        };
        
        document.addEventListener('keydown', escapeKeyHandler);
        modal.dataset.escapeKeyHandler = escapeKeyHandler;
        modal.dataset.escapeKeyConfigured = 'true';
    }
    
    // Marcar como configurado
    window.modalReinicioConfigurado = true;
    console.log("✅ Botones del modal de reinicio configurados correctamente");
}

// Asegurar que la función esté disponible globalmente si es necesario
if (typeof window.configurarBotonesModalReinicio === 'undefined') {
    window.configurarBotonesModalReinicio = configurarBotonesModalReinicio;
}

// 🔥 Asegurar que se llame cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(configurarBotonesModalReinicio, 200);
    });
} else {
    setTimeout(configurarBotonesModalReinicio, 200);
}


// ============================================
// FUNCIONES DE SINCRONIZACIÓN DORSAL↔POSICIÓN
// ============================================

function sincronizarPosicionADorsal(posicion) {
    const startOrderData = obtenerStartOrderData();
    if (!startOrderData) {
        console.warn("⚠️ No hay datos de orden de salida para sincronizar");
        return;
    }
    
    const corredor = startOrderData.find(c => c.order === posicion);
    const inputDorsal = document.getElementById('manual-dorsal');
    
    if (corredor && corredor.dorsal && inputDorsal) {
        inputDorsal.value = corredor.dorsal;
    } else if (inputDorsal) {
        inputDorsal.value = posicion;
        console.log(`⚠️ No se encontró dorsal para posición ${posicion}, usando valor por defecto`);
    }
}

function sincronizarDorsalAPosicion(dorsal) {
    const startOrderData = obtenerStartOrderData();
    if (!startOrderData) {
        console.warn("⚠️ No hay datos de orden de salida para sincronizar");
        return;
    }
    
    const corredor = startOrderData.find(c => c.dorsal == dorsal);
    const inputPosicion = document.getElementById('start-position');
    
    if (corredor && corredor.order && inputPosicion) {
        inputPosicion.value = corredor.order;
    } else if (inputPosicion) {
        inputPosicion.value = dorsal;
        console.log(`⚠️ No se encontró posición para dorsal ${dorsal}, usando valor por defecto`);
    }
}

function ejecutarReinicioCompleto() {
    console.log("🔄 Ejecutando reinicio completo...");
    
    const t = translations[appState.currentLanguage];
    
    // 1. Detener cuenta atrás si está activa
    if (cuentaAtrasActiva) {
        stopCountdown();
    }
    
    // 2. Resetear todos los tiempos reales
    resetearTiemposReales();
    
    // 3. Resetear contadores
    appState.departedCount = 0;
    proximoCorredorIndex = 0;
    cronoCarreraSegundos = 0;
    
    // 4. Actualizar inputs
    const startPosition = document.getElementById('start-position');
    const manualDorsal = document.getElementById('manual-dorsal');
    const departedCountElement = document.getElementById('departed-count');
    
    if (startPosition) startPosition.value = 1;
    if (manualDorsal) manualDorsal.value = 1;
    if (departedCountElement) departedCountElement.textContent = "0";
    
    // 5. Actualizar cronómetro display
    actualizarCronoDisplay();
    actualizarHoraDisplay();
    
    // 🔥🔥🔥 CORRECCIÓN: Usar updateStartOrderTableImmediate() en lugar de updateStartOrderTable()
    console.log("🔄 Actualizando tabla de orden de salida (INMEDIATO)...");
    
    // Opción A: Usar updateStartOrderTableImmediate() (throttling nivel 3 - inmediato)
    if (typeof updateStartOrderTableImmediate === 'function') {
        console.log("✅ Llamando a updateStartOrderTableImmediate()...");
        updateStartOrderTableImmediate();
    }
    // Opción B: Usar updateStartOrderTableCritical() (throttling nivel 2 - crítico)
    else if (typeof updateStartOrderTableCritical === 'function') {
        console.log("✅ Llamando a updateStartOrderTableCritical()...");
        updateStartOrderTableCritical();
    }
    // Opción C: Usar updateStartOrderTable() normal (puede ser bloqueado por throttling)
    else if (typeof updateStartOrderTable === 'function') {
        console.log("⚠️ Llamando a updateStartOrderTable() (puede ser bloqueado por throttling)...");
        updateStartOrderTable();
    }
    // Opción D: Actualizar manualmente
    else {
        console.log("⚠️ Actualizando tabla manualmente...");
        actualizarTablaManualmente();
    }
    
    // 6. Mostrar mensaje de confirmación
    showMessage(t.resetCompleteMessage || 'Reinicio completo realizado', 'success');
    
    console.log("✅ Reinicio completo ejecutado");
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

    // 🔥 CRÍTICO: Inicializar countdownValue para que los sonidos funcionen
    appState.countdownValue = 0;

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
    
    // 🔥 NUEVO: Actualizar tabla visible cuando salimos de cuenta atrás
    console.log("🔄 Forzando actualización de tabla al salir de cuenta atrás...");
    
    // Delay para asegurar que la transición de pantalla se complete
    setTimeout(() => {
        // Opción 1: Actualización inmediata (máxima prioridad)
        if (typeof updateStartOrderTableImmediate === 'function') {
            console.log("✅ Llamando a updateStartOrderTableImmediate() desde stopCountdown()");
            updateStartOrderTableImmediate();
        }
        // Opción 2: Actualización crítica
        else if (typeof updateStartOrderTableCritical === 'function') {
            console.log("✅ Llamando a updateStartOrderTableCritical() desde stopCountdown()");
            updateStartOrderTableCritical();
        }
        // Opción 3: Actualización normal
        else if (typeof updateStartOrderTable === 'function') {
            console.log("⚠️ Llamando a updateStartOrderTable() desde stopCountdown()");
            updateStartOrderTable();
        }
        // Opción 4: Forzar actualización de UI
        else {
            console.log("🔄 Actualizando UI manualmente desde stopCountdown()");
            
            // Si existe la función updateStartOrderUI en Salidas_1.js
            if (typeof updateStartOrderUI === 'function') {
                console.log("✅ Llamando a updateStartOrderUI()");
                updateStartOrderUI();
            }
            // O intentar recargar los datos
            else if (typeof loadStartOrderData === 'function') {
                console.log("✅ Llamando a loadStartOrderData()");
                loadStartOrderData();
            }
            // Último recurso: recargar la página si nada funciona
            else {
                console.warn("⚠️ Ninguna función de actualización encontrada, mostrando alerta...");
                const t = translations[appState.currentLanguage];
                alert(t.refreshRequired || "Es necesario refrescar la página para ver los cambios. ¿Quieres recargar ahora?");
            }
        }
        
        // 🔥 ADICIONAL: También actualizar otros elementos de UI
        setTimeout(() => {
            // Actualizar display de corredores salidos
            const departedCountElement = document.getElementById('departed-count');
            if (departedCountElement && appState.departedCount !== undefined) {
                departedCountElement.textContent = appState.departedCount;
            }
            
            // Actualizar hora del sistema
            if (typeof updateCurrentTime === 'function') {
                updateCurrentTime();
            }
            
            console.log("✅ Tabla y UI actualizadas después de salir de cuenta atrás");
        }, 100);
        
    }, 400); // 400ms para asegurar que todo se haya renderizado correctamente
}

function updateCountdown() {
    if (!cuentaAtrasActiva) return;
    
    // Actualizar cuenta atrás
    tiempoCuentaAtrasActual--;
    
    // 🔥 CRÍTICO: Actualizar appState.countdownValue para que los sonidos funcionen
    // Esto permite que playSound('number') sepa qué número reproducir
    appState.countdownValue = tiempoCuentaAtrasActual;
    
    // Actualizar display
    updateCountdownDisplay();
    
    // Verificar si llegó a cero
    if (tiempoCuentaAtrasActual <= 0) {
        handleCountdownZero();
        return;
    }
    
    // 🔥 CAMBIOS RESTAURADOS: Efectos visuales para últimos segundos
    const countdownScreen = document.getElementById('countdown-screen');
    
    // A los 10 segundos: fondo amarillo
    if (tiempoCuentaAtrasActual === 10) {
        document.body.classList.remove('countdown-normal');
        document.body.classList.add('countdown-warning');
        
        // Remover modo agresivo si estaba activo
        if (countdownScreen) {
            countdownScreen.classList.remove('aggressive-numbers');
        }
        appState.aggressiveMode = false;
        
        if (typeof playSound === 'function') {
            playSound('warning');
        }
    } 
    // A los 5 segundos: fondo amarillo + modo agresivo
    else if (tiempoCuentaAtrasActual === 5) {
        document.body.classList.remove('countdown-warning');
        document.body.classList.add('countdown-critical');
        
        // Activar modo agresivo
        if (countdownScreen) {
            countdownScreen.classList.add('aggressive-numbers');
        }
        appState.aggressiveMode = true;
        
        if (typeof playSound === 'function') {
            playSound('critical');
        }
    } 
    // Últimos 4-1 segundos: mantener modo agresivo
    else if (tiempoCuentaAtrasActual < 5 && tiempoCuentaAtrasActual > 0) {
        // Reproducir sonido según tipo de audio
        if (typeof playSound === 'function') {
            if (appState.audioType === 'beep') {
                playSound('beep');
            } else if (appState.audioType === 'voice') {
                // 🔥 CORRECCIÓN: appState.countdownValue ya está actualizado arriba
                // así que playSound('number') sabrá reproducir el número correcto
                playSound('number');
            }
        }
        
        // Asegurar que el modo agresivo esté activo
        if (!appState.aggressiveMode && countdownScreen) {
            countdownScreen.classList.add('aggressive-numbers');
            appState.aggressiveMode = true;
        }
    }
    // Desactivar modo agresivo si pasamos de los 5 segundos
    else if (tiempoCuentaAtrasActual > 5 && appState.aggressiveMode) {
        if (countdownScreen) {
            countdownScreen.classList.remove('aggressive-numbers');
        }
        appState.aggressiveMode = false;
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
        iniciarCronoDeCarrera(0);
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
        
        /* console.log(`⏱️ Tiempo del cronómetro de carrera: ${cronoCarreraSegundos}s`);*/ 
        
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

// ============================================
// REGISTRO DE SALIDAS (SISTEMA CRI - ADAPTADO)
// ============================================

function registerDeparture() {
    const siguiente = obtenerProximoCorredor();
    if (!siguiente || !siguiente.corredor) {
        console.warn("⚠️ No hay corredor para registrar salida");
        return;
    }
    
    const corredor = siguiente.corredor;
    const index = siguiente.index;
    const dorsal = corredor.dorsal;
    
    console.log("📝 Registrando salida para corredor:", {
        dorsal: dorsal,
        nombre: corredor.nombre,
        apellidos: corredor.apellidos,
        cronoSalida: corredor.cronoSalida,
        ordenTabla: corredor.order,
        indiceArray: index
    });
    
    // 🔥 MODIFICACIÓN: OBTENER VALORES DIRECTAMENTE DE LA PANTALLA Y AÑADIR 1 SEGUNDO
    
    // 1. Obtener cronoSalidaReal desde total-time-value (lo que el usuario ve)
    const totalTimeElement = document.getElementById('total-time-value');
    let cronoSalidaRealPantalla = totalTimeElement ? totalTimeElement.textContent.trim() : '00:00:00';
    
    // 2. Obtener horaSalidaReal desde current-time-value (lo que el usuario ve)
    const currentTimeElement = document.getElementById('current-time-value');
    let horaSalidaRealPantalla = currentTimeElement ? currentTimeElement.textContent.trim() : '00:00:00';
    
    console.log("📊 Valores obtenidos de pantalla (ANTES de añadir 1s):", {
        totalTimeValue: cronoSalidaRealPantalla,
        currentTimeValue: horaSalidaRealPantalla
    });
    
    // 3. AÑADIR 1 SEGUNDO A AMBOS VALORES
    
    // Convertir cronoSalidaReal a segundos, añadir 1 segundo, y volver a formato HH:MM:SS
    let cronoSalidaRealSegundos = 0;
    let cronoSalidaReal = '00:00:00';
    
    if (cronoSalidaRealPantalla && cronoSalidaRealPantalla !== '00:00:00') {
        cronoSalidaRealSegundos = timeToSeconds(cronoSalidaRealPantalla);
        // AÑADIR 1 SEGUNDO
        cronoSalidaRealSegundos += 1;
        cronoSalidaReal = secondsToTime(cronoSalidaRealSegundos);
    } else {
        cronoSalidaReal = cronoSalidaRealPantalla;
    }
    
    // Convertir horaSalidaReal a segundos, añadir 1 segundo, y volver a formato HH:MM:SS
    let horaSalidaRealSegundos = 0;
    let horaSalidaReal = '00:00:00';
    
    if (horaSalidaRealPantalla && horaSalidaRealPantalla !== '00:00:00') {
        // Convertir formato HH:MM:SS a segundos desde medianoche
        const partes = horaSalidaRealPantalla.split(':');
        if (partes.length === 3) {
            const horas = parseInt(partes[0]) || 0;
            const minutos = parseInt(partes[1]) || 0;
            const segundos = parseInt(partes[2]) || 0;
            horaSalidaRealSegundos = (horas * 3600) + (minutos * 60) + segundos;
            // AÑADIR 1 SEGUNDO
            horaSalidaRealSegundos += 1;
            
            // Convertir de nuevo a HH:MM:SS
            const nuevasHoras = Math.floor(horaSalidaRealSegundos / 3600);
            const nuevosMinutos = Math.floor((horaSalidaRealSegundos % 3600) / 60);
            const nuevosSegundos = horaSalidaRealSegundos % 60;
            
            horaSalidaReal = `${nuevasHoras.toString().padStart(2, '0')}:${nuevosMinutos.toString().padStart(2, '0')}:${nuevosSegundos.toString().padStart(2, '0')}`;
        } else {
            horaSalidaReal = horaSalidaRealPantalla;
        }
    } else {
        horaSalidaReal = horaSalidaRealPantalla;
    }
    
    console.log("📊 Valores después de añadir 1 segundo:", {
        cronoSalidaRealPantalla: cronoSalidaRealPantalla,
        cronoSalidaRealFinal: cronoSalidaReal,
        horaSalidaRealPantalla: horaSalidaRealPantalla,
        horaSalidaRealFinal: horaSalidaReal
    });
    
    // 4. Asignar tiempos al corredor (valores de pantalla + 1 segundo)
    corredor.horaSalidaReal = horaSalidaReal;
    corredor.cronoSalidaReal = cronoSalidaReal;
    corredor.horaSalidaRealSegundos = horaSalidaRealSegundos;
    corredor.cronoSalidaRealSegundos = cronoSalidaRealSegundos;
    
    // 5. Marcar como salido
    corredor.salido = true;
    corredor.salidaRegistrada = true;
    
    // 6. Incrementar contador de salidos
    appState.departedCount = (appState.departedCount || 0) + 1;

    // 🔥 CRÍTICO: Actualizar proximoCorredorIndex para apuntar al siguiente corredor
    // Usamos index (del corredor que acaba de salir) + 1
    proximoCorredorIndex = index + 1;
    
    // 🔥 DEBUG: Información de depuración
    console.log("🔥 DEBUG registerDeparture():");
    console.log("  - Corredor que acaba de salir:", {
        dorsal: dorsal,
        ordenTabla: corredor.order,
        indiceArray: index
    });
    console.log("  - Tiempos registrados (pantalla + 1s):", {
        cronoSalidaReal: cronoSalidaReal,
        horaSalidaReal: horaSalidaReal,
        cronoSalidaRealSegundos: cronoSalidaRealSegundos,
        horaSalidaRealSegundos: horaSalidaRealSegundos
    });
    console.log("  - departedCount AHORA:", appState.departedCount);
    console.log("  - proximoCorredorIndex NUEVO:", proximoCorredorIndex);
    
    // 7. Actualizar UI
    actualizarDisplaySalidos();
    
    // Obtener datos para actualizar posición y dorsal
    const startOrderData = obtenerStartOrderData();
    
    // 🔥 CORREGIDO: Actualizar POSICIÓN (start-position) usando ORDER del próximo corredor
    const startPositionElement = document.getElementById('start-position');
    if (startPositionElement) {
        if (startOrderData && startOrderData.length > proximoCorredorIndex) {
            const proximoCorredor = startOrderData[proximoCorredorIndex];
            
            if (proximoCorredor && proximoCorredor.order) {
                // ✅ USAR EL ORDER REAL del próximo corredor (no índice + 1)
                startPositionElement.value = proximoCorredor.order;
                console.log("✅ POSICIÓN actualizada usando ORDER del próximo corredor:", {
                    order: proximoCorredor.order,
                    dorsal: proximoCorredor.dorsal,
                    nombre: proximoCorredor.nombre,
                    indiceArray: proximoCorredorIndex
                });
            } else {
                // Fallback: usar índice + 1
                startPositionElement.value = proximoCorredorIndex + 1;
                console.log("⚠️ POSICIÓN: Próximo corredor sin order, usando índice+1:", proximoCorredorIndex + 1);
            }
        } else {
            // No hay más corredores
            startPositionElement.value = 0;
            console.log("🏁 POSICIÓN: No hay más corredores, puesto a 0");
        }
    }
    
    // 🔥 CORREGIDO: Actualizar DORSAL (manual-dorsal) usando dorsal del próximo corredor
    const manualDorsalElement = document.getElementById('manual-dorsal');
    if (manualDorsalElement) {
        if (startOrderData && startOrderData.length > proximoCorredorIndex) {
            const proximoCorredor = startOrderData[proximoCorredorIndex];
            
            if (proximoCorredor && proximoCorredor.dorsal) {
                // ✅ USAR EL DORSAL REAL del próximo corredor
                manualDorsalElement.value = proximoCorredor.dorsal;
                console.log("✅ DORSAL actualizado para próximo corredor:", {
                    dorsal: proximoCorredor.dorsal,
                    nombre: proximoCorredor.nombre,
                    order: proximoCorredor.order,
                    indiceArray: proximoCorredorIndex
                });
            } else {
                // Si el próximo corredor no tiene dorsal definido, usar su ORDER
                manualDorsalElement.value = proximoCorredor.order || (proximoCorredorIndex + 1);
                console.log("⚠️ DORSAL: Próximo corredor sin dorsal, usando order:", proximoCorredor.order || (proximoCorredorIndex + 1));
            }
        } else {
            // No hay más corredores
            manualDorsalElement.value = 0;
            console.log("🏁 DORSAL: No hay más corredores, puesto a 0");
        }
    }
    
    console.log("✅ Salida registrada COMPLETA (valores de pantalla + 1s):", {
        corredorSalido: {
            dorsal: dorsal,
            order: corredor.order,
            nombre: corredor.nombre
        },
        proximoCorredor: startOrderData && startOrderData.length > proximoCorredorIndex ? {
            dorsal: startOrderData[proximoCorredorIndex].dorsal,
            order: startOrderData[proximoCorredorIndex].order,
            nombre: startOrderData[proximoCorredorIndex].nombre
        } : null,
        tiempos: {
            horaSalidaReal: horaSalidaReal,
            cronoSalidaReal: cronoSalidaReal
        },
        contadores: {
            departedCount: appState.departedCount,
            proximoCorredorIndex: proximoCorredorIndex
        }
    });
    
    // 8. Actualizar tabla visual
    actualizarTablaConSalidaRegistrada(dorsal, horaSalidaReal, cronoSalidaReal);
    
    // 9. Guardar datos
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    // También guardar en la estructura de carreras
    if (appState.currentRace) {
        saveRaceData();
    }
    
    saveAppState();
}



    // Función mejorada para actualizar la tabla
    function actualizarTablaConSalidaRegistrada(dorsal, horaSalidaReal, cronoSalidaReal) {
        console.log("🔄 actualizarTablaConSalidaRegistrada() para dorsal:", dorsal, {
            horaSalidaReal: horaSalidaReal,
            cronoSalidaReal: cronoSalidaReal
        });
        
        // 1. Verificar que los datos están en memoria
        const startOrderData = obtenerStartOrderData();
        if (startOrderData) {
            const corredor = startOrderData.find(c => c.dorsal == dorsal);
            if (corredor) {
                console.log("✅ Datos en memoria verificados para dorsal", dorsal, {
                    tieneHoraSalidaReal: !!corredor.horaSalidaReal,
                    tieneCronoSalidaReal: !!corredor.cronoSalidaReal
                });
            } else {
                console.warn("⚠️ Corredor no encontrado en startOrderData para dorsal", dorsal);
            }
        }
        
        // 2. 🔥🔥🔥 SOLUCIÓN PRINCIPAL: Actualizar tabla COMPLETA
        // Usamos setTimeout para asegurar que primero se guarden los datos
        
        setTimeout(() => {
            console.log("⏰ Actualizando tabla después de guardar datos...");
            
            // Prioridad 1: updateStartOrderTableImmediate (throttling nivel 3 - inmediato)
            if (typeof updateStartOrderTableImmediate === 'function') {
                console.log("✅ Llamando a updateStartOrderTableImmediate()...");
                updateStartOrderTableImmediate();
            }
            // Prioridad 2: updateStartOrderTableCritical (throttling nivel 2 - crítico)
            else if (typeof updateStartOrderTableCritical === 'function') {
                console.log("✅ Llamando a updateStartOrderTableCritical()...");
                updateStartOrderTableCritical();
            }
            // Prioridad 3: updateStartOrderTable (throttling nivel 1 - normal)
            else if (typeof updateStartOrderTable === 'function') {
                console.log("⚠️ Llamando a updateStartOrderTable()...");
                updateStartOrderTable();
            }
            // Prioridad 4: Método antiguo como fallback
            else {
                console.warn("⚠️ Ninguna función de actualización de tabla encontrada, usando método manual...");
                actualizarTablaManualmente(dorsal, horaSalidaReal, cronoSalidaReal);
            }
            
            console.log("✅ Proceso de actualización de tabla iniciado para dorsal", dorsal);
        }, 150); // 150ms de delay para asegurar que saveStartOrderData() y saveRaceData() terminen
        
        console.log("📊 Salida registrada procesada para dorsal", dorsal);
    }

    // 🔥 NUEVA FUNCIÓN AUXILIAR: Actualización manual como fallback
    function actualizarTablaManualmente(dorsal, horaSalidaReal, cronoSalidaReal) {
        console.log("🔄 actualizarTablaManualmente() para dorsal:", dorsal);
        
        // Buscar todas las tablas posibles
        const tablas = document.querySelectorAll('#start-order-table, .start-order-table, table');
        
        tablas.forEach((tabla, tablaIndex) => {
            const filas = tabla.querySelectorAll('tbody tr');
            
            filas.forEach(fila => {
                // Buscar celda de dorsal
                const celdaDorsal = fila.querySelector('.dorsal-cell, .dorsal, td:nth-child(2), [data-field="dorsal"]');
                if (celdaDorsal && celdaDorsal.textContent.trim() == dorsal) {
                    console.log("✅ Fila encontrada para dorsal", dorsal, "en tabla", tablaIndex);
                    
                    // Buscar celdas de horaSalidaReal (normalmente columna 9 o 10)
                    const horaRealCell = fila.querySelector('.hora-salida-real, [data-field="horaSalidaReal"], td:nth-child(9), td:nth-child(10)');
                    if (horaRealCell) {
                        horaRealCell.textContent = horaSalidaReal;
                        horaRealCell.classList.add('salida-registrada');
                    }
                    
                    // Buscar celdas de cronoSalidaReal (normalmente columna 10 o 11)
                    const cronoRealCell = fila.querySelector('.crono-salida-real, [data-field="cronoSalidaReal"], td:nth-child(10), td:nth-child(11)');
                    if (cronoRealCell) {
                        cronoRealCell.textContent = cronoSalidaReal;
                        cronoRealCell.classList.add('salida-registrada');
                    }
                    
                    // Marcar fila completa
                    fila.classList.add('corredor-salido', 'salida-registrada');
                    fila.style.backgroundColor = '#e8f5e9';
                    
                    console.log("✅ Fila actualizada manualmente para dorsal", dorsal);
                }
            });
        });
    }

// ============================================
// FUNCIONES DE INICIO MANUAL (MODIFICADAS)
// ============================================

function iniciarCuentaAtrasManual(dorsal = null) {
    console.log("🎯 Iniciando cuenta atrás manual...");
    
    const t = translations[appState.currentLanguage];
    
    // 🔥 MODIFICADO: Obtener dorsal del input si no viene como parámetro
    let dorsalABuscar = dorsal;
    if (!dorsalABuscar) {
        const inputDorsal = document.getElementById('manual-dorsal');
        if (inputDorsal && inputDorsal.value) {
            dorsalABuscar = parseInt(inputDorsal.value);
        }
    }
    
    // 🔥 MODIFICADO: Obtener tiempo previo configurable - BÚSQUEDA MEJORADA
    let preTimeSeconds = 60; // Valor por defecto
    let inputPreTime = null;

    // Intentar diferentes IDs/selectores posibles para el input de tiempo previo
    const possibleIds = ['pre-countdown-time', 'pre-countdown', 'countdown-pre-time', 'pre-time'];
    for (const id of possibleIds) {
        inputPreTime = document.getElementById(id);
        if (inputPreTime) {
            break;
        }
    }

    // Si no se encuentra por ID, buscar por placeholder o label
    if (!inputPreTime) {
        console.log("🔍 No se encontró input por ID, buscando por atributos...");
        const inputs = document.querySelectorAll('input[type="text"], input[type="time"], input[placeholder*="previo"], input[placeholder*="Previo"]');
        inputs.forEach(input => {
            if (input.placeholder && (input.placeholder.toLowerCase().includes('previo') || 
                                     input.placeholder.toLowerCase().includes('pre-countdown'))) {
                inputPreTime = input;
                console.log(`✅ Input de tiempo previo encontrado por placeholder: ${input.placeholder}`);
            }
        });
    }

    if (inputPreTime && inputPreTime.value && inputPreTime.value.trim() !== '') {

        try {
            preTimeSeconds = timeToSeconds(inputPreTime.value);            
            if (preTimeSeconds <= 0) {
                console.warn("⚠️ Tiempo previo es <= 0, usando valor por defecto (60s)");
                showMessage("El tiempo previo debe ser mayor que 0", 'warning');
                preTimeSeconds = 60;
            }
        } catch (e) {
            console.error("❌ Error convirtiendo tiempo previo:", e);
            showMessage("Error en formato de tiempo previo. Usando 60s por defecto", 'warning');
            preTimeSeconds = 60;
        }
    } else {
        if (inputPreTime) {
            console.log(`ℹ️ Input de tiempo previo encontrado pero vacío, usando valor por defecto (60s)`);
        } else {
            console.log(`ℹ️ No se encontró input de tiempo previo, usando valor por defecto (60s)`);
        }
    }
    
    console.log(`⏱️ Tiempo previo final a usar: ${preTimeSeconds}s`);
    
    // Resto del código existente pero usando preTimeSeconds en lugar de 60 fijo
    const startOrderData = obtenerStartOrderData();
    if (!startOrderData || startOrderData.length === 0) {
        showMessage("No hay datos de orden de salida", 'error');
        return;
    }
    
    // 🔥 MODIFICADO: Si no hay dorsal válido, buscar por posición
    let corredor = null;
    let corredorIndex = -1;
    
    if (dorsalABuscar && dorsalABuscar > 0) {
        // 1. Buscar por dorsal
        corredorIndex = startOrderData.findIndex(c => c.dorsal == dorsalABuscar);
        if (corredorIndex === -1) {
            showMessage(`No se encontró el dorsal ${dorsalABuscar}`, 'error');
            return;
        }
        corredor = startOrderData[corredorIndex];
    } else {
        // 2. Buscar por posición
        const inputPosicion = document.getElementById('start-position');
        let posicionABuscar = 1; // Valor por defecto
        
        if (inputPosicion && inputPosicion.value) {
            posicionABuscar = parseInt(inputPosicion.value);
        }
        
        if (posicionABuscar <= 0 || posicionABuscar > startOrderData.length) {
            showMessage(`Posición ${posicionABuscar} no válida. Debe estar entre 1 y ${startOrderData.length}`, 'error');
            return;
        }
        
        // Buscar por orden/posición
        corredorIndex = startOrderData.findIndex(c => c.order == posicionABuscar);
        if (corredorIndex === -1) {
            // Si no encuentra por order, usar posición como índice (0-based)
            corredorIndex = posicionABuscar - 1;
            if (corredorIndex >= 0 && corredorIndex < startOrderData.length) {
                corredor = startOrderData[corredorIndex];
            }
        } else {
            corredor = startOrderData[corredorIndex];
        }
        
        if (!corredor) {
            showMessage(`No se encontró corredor en posición ${posicionABuscar}`, 'error');
            return;
        }
        
        // Actualizar el input de dorsal con el dorsal encontrado
        const inputDorsal = document.getElementById('manual-dorsal');
        if (inputDorsal && corredor.dorsal) {
            inputDorsal.value = corredor.dorsal;
        }
        
        dorsalABuscar = corredor.dorsal; // Actualizar para mostrar en mensajes
    }
    
    console.log("📊 Corredor encontrado:", {
        dorsal: corredor.dorsal,
        orden: corredor.order,
        cronoSalida: corredor.cronoSalida,
        cronoSegundos: corredor.cronoSegundos,
        encontradoPor: dorsalABuscar && dorsalABuscar > 0 ? 'dorsal' : 'posición'
    });
    
    // 2. Establecer como próximo corredor a salir
    proximoCorredorIndex = corredorIndex;
    
    // 🔥 MODIFICADO: Usar tiempo previo configurable en lugar de 60 fijo
    // cronoCarreraSegundos = cronoSalida_corredor - tiempo_previo
    if (corredor.cronoSegundos && corredor.cronoSegundos > 0) {
        cronoCarreraSegundos = corredor.cronoSegundos - preTimeSeconds;
        if (cronoCarreraSegundos < 0) cronoCarreraSegundos = 0;
    } else if (corredor.cronoSalida && corredor.cronoSalida !== "00:00:00") {
        // Convertir cronoSalida a segundos si cronoSegundos no está disponible
        const segundosCronoSalida = timeToSeconds(corredor.cronoSalida);
        cronoCarreraSegundos = segundosCronoSalida - preTimeSeconds;
        if (cronoCarreraSegundos < 0) cronoCarreraSegundos = 0;
    } else {
        cronoCarreraSegundos = 0;
    }
    
    // 4. Número de corredores salidos será su valor de orden en la tabla menos 1
    appState.departedCount = corredor.order - 1;
    
    // 🔥 MODIFICADO: Usar tiempo previo configurable
    tiempoCuentaAtrasActual = preTimeSeconds;
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
    actualizarHoraDisplay();
    updateCountdownDisplay();
    actualizarDisplayProximoCorredor();
    
    // Iniciar intervalo
    if (intervaloCuentaAtras) {
        clearInterval(intervaloCuentaAtras);
    }
    
    intervaloCuentaAtras = setInterval(updateCountdown, 1000);
    
    // 🔥 NUEVO: Iniciar cronómetro de carrera si no está iniciado CON TIEMPO INICIAL
    if (!cronoDeCarreraIniciado) {
        iniciarCronoDeCarrera(cronoCarreraSegundos);
    }
    
    // Mantener pantalla activa
    if (typeof keepScreenAwake === 'function') {
        keepScreenAwake();
    }
    
    // 🔥 MODIFICADO: Mensaje con tiempo configurable
    showMessage(`Cuenta atrás manual iniciada para dorsal ${dorsalABuscar} (${preTimeSeconds}s)`, 'success');
    console.log("✅ Cuenta atrás manual iniciada:", {
        dorsal: dorsalABuscar,
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
    
    console.log("🔍 obtenerProximoCorredor() - Índice actual:", proximoCorredorIndex, 
                "de", startOrderData.length, "corredores totales");
    
    // Verificar si el índice actual es válido
    if (proximoCorredorIndex >= startOrderData.length) {
        console.log("🏁 Índice fuera de rango: todos los corredores procesados");
        return null;
    }
    
    const corredor = startOrderData[proximoCorredorIndex];
    
    // 🔥🔥🔥 NUEVA LÓGICA: SIEMPRE devolver el corredor en la posición actual
    // SIN verificar si ya tiene hora de salida, SIN saltar
    console.log(`✅ Próximo corredor: dorsal ${corredor.dorsal} en índice ${proximoCorredorIndex}`);
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
    console.log("🗑️ ResetearTiemposReales() llamado");
    
    // 1. Limpiar window.startOrderData
    if (window.startOrderData && Array.isArray(window.startOrderData)) {
        window.startOrderData.forEach(corredor => {
            corredor.horaSalidaReal = '';
            corredor.cronoSalidaReal = '';
            corredor.horaSalidaRealSegundos = 0;
            corredor.cronoSalidaRealSegundos = 0;
            corredor.salido = false;
            corredor.salidaRegistrada = false;
        });
        console.log("✅ window.startOrderData limpiado:", window.startOrderData.length, "corredores");
    }
    
    // 2. Limpiar appState.currentRace.startOrder
    if (appState.currentRace && appState.currentRace.startOrder && Array.isArray(appState.currentRace.startOrder)) {
        appState.currentRace.startOrder.forEach(corredor => {
            corredor.horaSalidaReal = '';
            corredor.cronoSalidaReal = '';
            corredor.horaSalidaRealSegundos = 0;
            corredor.cronoSalidaRealSegundos = 0;
            corredor.salido = false;
            corredor.salidaRegistrada = false;
        });
        console.log("✅ appState.currentRace.startOrder limpiado:", appState.currentRace.startOrder.length, "corredores");
    }
    
    // 3. Guardar cambios inmediatamente
    if (typeof saveStartOrderData === 'function') {
        saveStartOrderData();
    }
    
    if (typeof saveRaceData === 'function') {
        saveRaceData();
    }
    
    // 4. Limpiar localStorage también para esta carrera
    if (appState.currentRace && appState.currentRace.id) {
        const raceKey = `race-${appState.currentRace.id}`;
        const savedData = localStorage.getItem(raceKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.startOrder && Array.isArray(parsed.startOrder)) {
                    parsed.startOrder.forEach(corredor => {
                        corredor.horaSalidaReal = '';
                        corredor.cronoSalidaReal = '';
                        corredor.horaSalidaRealSegundos = 0;
                        corredor.cronoSalidaRealSegundos = 0;
                        corredor.salido = false;
                        corredor.salidaRegistrada = false;
                    });
                    localStorage.setItem(raceKey, JSON.stringify(parsed));
                    console.log("✅ localStorage limpiado para carrera:", raceKey);
                }
            } catch (e) {
                console.error("Error limpiando localStorage:", e);
            }
        }
    }
    
    console.log("🗑️ ResetearTiemposReales() completado");
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
}

function actualizarHoraDisplay() {
    const display = document.getElementById('current-time-value');
    if (!display) return;
    
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    
    display.textContent = `${horas}:${minutos}:${segundos}`;
}

function iniciarCronoDeCarrera(tiempoInicialSegundos = null) {
    cronoDeCarreraIniciado = true;
    
    // 🔥 NUEVO: Si se proporciona tiempo inicial, ajustar el startTime
    const tiempoInicial = tiempoInicialSegundos || cronoCarreraSegundos;
    const startTime = Date.now() - (tiempoInicial * 1000);
    
    function updateCronoSincronizado() {
        if (!cronoDeCarreraIniciado) return;
        
        const elapsedMs = Date.now() - startTime;
        cronoCarreraSegundos = Math.floor(elapsedMs / 1000);
        actualizarCronoDisplay();
        actualizarHoraDisplay();
        
        // 🔥 VERIFICAR SI HAY QUE PREPARAR SIGUIENTE CORREDOR
        const siguiente = obtenerProximoCorredor();
        if (siguiente && siguiente.corredor) {
            const tiempoRestante = calcularTiempoCuentaAtras(siguiente.corredor);
            
            // Si falta 1 minuto o menos y no hay cuenta atrás activa
            if (tiempoRestante <= 60 && tiempoRestante > 0 && !cuentaAtrasActiva) {               
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
    console.log(`⏱️ Cronómetro de carrera iniciado${tiempoInicialSegundos ? ' con tiempo inicial: ' + tiempoInicialSegundos + 's' : ''}`);
}

function prepararSiguienteCorredor() {
    // Incrementar índice para pasar al siguiente corredor
   
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
    if (!display) {
        console.warn("⚠️ Elemento next-corredor-time no encontrado");
        return;
    }
    
    // Obtener el siguiente corredor después del actual
    const siguiente = obtenerSiguienteCorredorDespuesDelActual();
    
    if (siguiente && siguiente.corredor) {
        const corredor = siguiente.corredor;
        
        // Obtener la diferencia del corredor
        let diferenciaValor = corredor.diferencia;
        
        // Convertir diferencia a segundos si es necesario
        let segundosDiferencia = 0;
        
        if (diferenciaValor) {
            if (typeof diferenciaValor === 'number') {
                segundosDiferencia = diferenciaValor;
            } else if (typeof diferenciaValor === 'string') {
                const diferenciaLimpia = diferenciaValor.split(' ')[0];
                segundosDiferencia = timeToSeconds(diferenciaLimpia);
            }
        }
        
        // Obtener el dorsal (usar order si no hay dorsal)
        const dorsal = corredor.dorsal || corredor.order || (siguiente.index + 1);
        
        // Formatear para mostrar: "20s (300)" o "1:00 (300)"
        if (segundosDiferencia > 0) {
            if (segundosDiferencia >= 60) {
                const minutes = Math.floor(segundosDiferencia / 60);
                const seconds = segundosDiferencia % 60;
                display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} (${dorsal})`;
            } else {
                display.textContent = `${segundosDiferencia}s (${dorsal})`;
            }
            
            console.log(`➡️ Próximo corredor actualizado: ${display.textContent}`, {
                dorsal: dorsal,
                segundosDiferencia: segundosDiferencia,
                order: corredor.order,
                index: siguiente.index
            });
        } else {
            // Si no hay diferencia válida, mostrar solo el dorsal
            display.textContent = `-- (${dorsal})`;
        }
    } else {
        display.textContent = "--";
        console.log("🏁 No hay más corredores después del actual");
    }
}

function actualizarDisplaySalidos() {
    const departedCountElement = document.getElementById('departed-count');
    if (!departedCountElement) {
        console.warn("⚠️ Elemento departed-count no encontrado");
        return;
    }
    
    const totalCorredores = obtenerTotalCorredores();
    const salidos = appState.departedCount || 0;
    
    // Formato: "1 de 10"
    departedCountElement.textContent = `${salidos} de ${totalCorredores}`;
    
    console.log(`📊 Display "Salidos" actualizado: ${salidos} de ${totalCorredores}`);
}

function obtenerSiguienteCorredorDespuesDelActual() {
    const startOrderData = obtenerStartOrderData();
    
    if (!startOrderData || startOrderData.length === 0) {
        console.log("⚠️ No hay datos de orden de salida");
        return null;
    }
    
    console.log(`🔍 obtenerSiguienteCorredorDespuesDelActual() - ` +
                `Índice actual: ${proximoCorredorIndex} ` +
                `(corredor ${proximoCorredorIndex + 1} de ${startOrderData.length})`);
    
    // Buscar el siguiente corredor después del actual
    const siguienteIndex = proximoCorredorIndex + 1;
    
    if (siguienteIndex < startOrderData.length) {
        const corredor = startOrderData[siguienteIndex];
        
        // 🔥 NUEVA LÓGICA: SIEMPRE devolver el siguiente, sin verificar si ya salió
        console.log(`✅ Siguiente corredor después del actual: ${corredor.dorsal} en índice ${siguienteIndex}`, {
            dorsal: corredor.dorsal,
            diferencia: corredor.diferencia,
            cronoSalida: corredor.cronoSalida
        });
        return {
            index: siguienteIndex,
            corredor: corredor
        };
    }
    
    console.log("🏁 No hay más corredores después del actual");
    return null;
}







// ============================================
// CONFIGURACIÓN DE BOTONES MODALES (SISTEMA AISLADO)
// ============================================

function configurarBotonesModalCountdown() {
    
    // 1. Botón de engranaje (config-toggle) - SOLO ESTE ES CRÍTICO
    const configToggleBtn = document.getElementById('config-toggle');
    if (configToggleBtn) {
        // Remover listeners antiguos para evitar duplicados
        const newBtn = configToggleBtn.cloneNode(true);
        configToggleBtn.parentNode.replaceChild(newBtn, configToggleBtn);
        
        document.getElementById('config-toggle').addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('config-during-countdown-modal');
            if (modal) {
                modal.classList.add('active');
            }
        });
    }
    
    // 2. Botón para cerrar modal de configuración
    const configCloseBtn = document.getElementById('config-during-countdown-close');
    if (configCloseBtn) {
        configCloseBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('config-during-countdown-modal');
            if (modal) modal.classList.remove('active');
        });
    }
    
    // 3. Botón "Continuar viendo"
    const resumeBtn = document.getElementById('resume-countdown-btn');
    if (resumeBtn) {
        resumeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('config-during-countdown-modal');
            if (modal) modal.classList.remove('active');
        });
    }
    
    // 4. Botón "Detener cuenta atrás" (SOLO CIERRA EL MODAL, NO LLAMA A stopCountdown)
    const stopBtn = document.getElementById('stop-countdown-btn');
    if (stopBtn) {
        stopBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = document.getElementById('config-during-countdown-modal');
            if (modal) modal.classList.remove('active');
            
            // Detener cuenta atrás con la función existente
            if (typeof stopCountdown === 'function') {
                stopCountdown();
            }
        });
    }
    
    console.log("✅ Botones modales configurados correctamente");
}

// ============================================
// INICIALIZACIÓN SEGURA
// ============================================

// Inicializar cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(configurarBotonesModalCountdown, 500);
});

// También inicializar después de que se inicie cuenta atrás
// (cuando se crea la pantalla de cuenta atrás)
let originalStartCountdown = window.startCountdown;
if (originalStartCountdown && typeof originalStartCountdown === 'function') {
    window.startCountdown = function() {
        const result = originalStartCountdown.apply(this, arguments);
        // Configurar botones después de iniciar cuenta atrás
        setTimeout(configurarBotonesModalCountdown, 300);
        return result;
    };
}

function obtenerTotalCorredores() {
    const totalRidersElement = document.getElementById('total-riders');
    if (totalRidersElement && totalRidersElement.value) {
        return parseInt(totalRidersElement.value) || 0;
    }
    
    // Fallback: contar desde startOrderData
    const startOrderData = obtenerStartOrderData();
    return startOrderData ? startOrderData.length : 0;
}

console.log("✅ Módulo de cuenta atrás cargado y listo");

/*************** BORRRAR POR REPETIDAS */