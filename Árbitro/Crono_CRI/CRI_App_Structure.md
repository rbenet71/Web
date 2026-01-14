# **CRI App - Documentación Optimizada para Modificaciones v3.4.2**

## 📋 **ÍNDICE RÁPIDO**
- [**1. Visión General**](#1-visión-general)
- [**2. Mapa de Módulos**](#2-mapa-de-módulos) ⭐
- [**3. Funciones Críticas por Módulo**](#3-funciones-críticas-por-módulo)
- [**4. Estructuras de Datos Clave**](#4-estructuras-de-datos-clave)
- [**5. Sistema de Traducciones**](#5-sistema-de-traducciones)
- [**6. HTML/CSS Esencial**](#6-htmlcss-esencial)
- [**7. Flujos Principales**](#7-flujos-princiales)
- [**8. Modificaciones Comunes**](#8-modificaciones-comunes) ⭐
- [**9. Sistema de Logging Optimizado**](#9-sistema-de-logging-optimizado) ⭐
- [**10. Reglas de Oro**](#10-reglas-de-oro)
- [**11. Lecciones Aprendidas**](#11-lecciones-aprendidas)
- [**12. Checklist para Cambios**](#12-checklist-para-cambios) ⭐
- [**13. Cambios v3.4.2**](#13-cambios-v342) ⭐

---

## **1. VISIÓN GENERAL**
Crono CRI v3.4.2 - PWA para control de salidas/llegadas en carreras ciclistas.
- **Modo Salidas**: Cuenta atrás basada en cronoSalida de tabla
- **Modo Llegadas**: Cronometraje con milésimas, posiciones automáticas, posición por categoría
- **4 idiomas**: ES, CA, EN, FR
- **Exportación**: Excel (22 cols), PDF (2 versiones)
- **Sistema de logging optimizado** (reducción 80% logs en consola)
- **Contador dinámico** de llegadas registradas
- **Tiempo compacto** en cronómetro minimizado

---

## **2. MAPA DE MÓDULOS** ⭐

| Módulo | Responsabilidad Principal | Dependencias Clave | Versión |
|--------|--------------------------|-------------------|---------|
| **Main.js** | Coordinación global, estado app, PWA, pantalla countdown, logging optimizado | TODOS | 3.3.3 |
| **Salidas_1.js** | Importación/exportación Excel (22 cols), validación 3.2.1 | Storage_Pwa, UI, Salidas_2 | 3.2.1 |
| **Salidas_2.js** | Tabla UI, edición inline, throttling 3 niveles | Salidas_1, Salidas_3, Salidas_4 | 3.2.1 |
| **Salidas_3.js** | Modales, añadir corredores, cambios globales | Salidas_2, UI, Storage_Pwa | 3.2.1 |
| **Salidas_4.js** | Confirmaciones, validaciones, edición avanzada | Salidas_2, Salidas_3, Utilidades | 3.2.1 |
| **Cuenta_Atras.js** | Sistema cuenta atrás, salidas, sincronización dorsal↔posición | Main, Utilidades, Salidas_2, Storage_Pwa | 3.2.1 |
| **UI.js** | Interfaz, tarjetas, modales, gestión tiempo, contador llegadas | Main, Storage_Pwa, Cuenta_Atras, Llegadas | 3.4.2 |
| **Storage_Pwa.js** | Persistencia, backup/restore, gestión carreras (35 funciones) | TODOS (persistencia central) | 3.2.2 |
| **Utilidades.js** | Conversiones tiempo, audio, exportación, diagnóstico | TODOS (utilidades centrales) | 3.2.1 |
| **Traducciones.js** | Sistema multilingüe (4 idiomas) | TODOS (textos UI) | 3.4.2 |
| **Llegadas.js** | Modo llegadas (14 cols), milésimas, posiciones auto, posición por categoría | Main, Utilidades, Traducciones | 3.4.2 |

**Flujo principal**: Main → [Salidas_1-4 / Llegadas] ↔ UI ↔ Storage_Pwa ↔ Utilidades

---

## **3. FUNCIONES CRÍTICAS POR MÓDULO**

### **MAIN.JS v3.3.3** (Coordinación Global con Logging Optimizado)
```javascript
// ✅ NUEVO: Sistema de logging por niveles
const LOG_LEVEL = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO; // Cambiar según entorno

function log(level, message, data = null) // Sistema centralizado
function callIfFunction(fn, fallbackMessage) // Llama funciones solo si existen

// Estado global optimizado
const appState = {
  audioType, currentLanguage, soundEnabled, aggressiveMode,
  currentRace: { id, name, firstStartTime, startOrder: [] }, races: [],
  countdownActive, countdownValue, departedCount, nextCorredorTime: 60,
  voiceAudioCache, audioContext, isSalidaShowing, salidaTimeout,
  deferredPrompt, updateAvailable, countdownPaused, accumulatedTime
};

// Funciones críticas OPTIMIZADAS
initApp()              // Inicialización con logging optimizado (80% menos logs)
setupEventListeners()  // Configuración agrupada con manejo de errores
setupTimeIntervals()   // Gestión centralizada de intervalos de tiempo
handleRaceChange(raceId) // Recibe solo raceId
openHelpFile()         // Abre Crono_CRI_ayuda.html externo
```

### **UI.JS v3.4.2** (Interfaz y Gestión Tiempo - ACTUALIZADO)
```javascript
// SISTEMA RESETEO AUTOMÁTICO:
updateSystemTimeDisplay()           // Actualiza TODOS los relojes del sistema
updateAllSystemClocks()             // NUEVO 3.4.2: Actualiza múltiples elementos

// SISTEMA DE TARJETAS EXPANDIBLES - ACTUALIZADO 3.4.2:
setupCardToggles()                  // Manejo especial para cronómetro de llegadas
updateLlegadasCompactTimer()        // Actualiza tiempo compacto al minimizar
setupCompactTimerUpdates()          // Intervalo para tiempo compacto
updateInitialCompactTimerState()    // Estado inicial al cargar

// GESTIÓN INTERFAZ OPTIMIZADA:
setupCardToggles()                  // Tarjetas expandibles con persistencia
initModeSlider()                    // Selector modo salidas/llegadas
showMessage(text, type)             // Notificaciones (info/success/error)
setupModalEventListeners()          // ⚠️ Excluye modal de llegadas
updateRaceActionButtonsState()      // Habilita/deshabilita botones dinámicamente
setupLanguageButtons()              // Configura cambio idioma
openHelpFile()                      // Abre Crono_CRI_ayuda.html externo

// ✅ SISTEMA TIEMPO SIN INTERVALOS (optimización):
setupStaticTimeDisplay()            // Configura hora estática
```

### **LLEGADAS.JS v3.4.2** (14 Columnas, Posición por Categoría - ACTUALIZADO)
```javascript
// ESTRUCTURA LLEGADA (14 campos + notas):
{
  dorsal, nombre, apellidos, categoria, equipo, licencia,
  horaSalida, cronoSalida,                                // Prioridad: Real > Prevista
  horaLlegada, cronoLlegadaWithMs, tiempoFinalWithMs,     // CON milésimas
  posicion, posicionCategoria, notas, capturadoEn, pendiente  // NUEVO: posicionCategoria
}

// FUNCIONES CLAVE:
initLlegadasMode()                     // Inicializa modo llegadas
capturarLlegadaDirecta()               // Captura con milésimas
obtenerDatosCorredor(dorsal)           // Prioridad: horaSalidaReal > horaSalida
calcularMapaPosiciones(llegadas)       // Posiciones generales automáticas

// NUEVAS FUNCIONES 3.4.1/3.4.2:
calcularPosicionesPorCategoria()       // Posiciones dentro de cada categoría
actualizarContadorLlegadas()           // "Llegadas Registradas - X de Y Corredores"
exportRankingToPDF()                   // PDF profesional con Pos. Cat.
formatSecondsWithMilliseconds(seconds) // HH:MM:SS.mmm
```

### **TRADUCCIONES.JS v3.4.2** (Sistema Multilingüe - ACTUALIZADO)
```javascript
// 4 IDIOMAS: es, ca, en, fr
const translations = {
  es: { 
    appTitle: "Crono CRI", 
    cardRaceTitle: "Gestión de Carrera",
    // NUEVAS TRADUCCIONES 3.4.1:
    llegadasListTitle: "Llegadas Registradas",
    llegadasCounterTemplate: "{x} de {y} Corredores",
    // NUEVAS TRADUCCIONES 3.3.4:
    posCatHeader: "Pos. Cat.",
    posCatHeaderTooltip: "Posición dentro de la categoría"
  },
  ca: { ... }, en: { ... }, fr: { ... }
};

// ACTUALIZACIÓN COMPLETA UI:
updateLanguageUI()           // Actualiza TODA la interfaz (11 pasos)
updateAppTitle()             // Título aplicación
updateRaceManagementCard()   // Tarjeta gestión carrera
updateTableHeaders()         // Cabeceras tabla (incluye Pos. Cat.)
updateModalTexts()           // Textos modales
updateTableTooltips()        // Tooltips columnas
// ⭐ Claves camelCase, IDs DOM con guiones
```

### **FUNCIONES NUEVAS EN LLEGADAS.JS v3.4.2:**
```javascript
// ========== POSICIÓN POR CATEGORÍA (3.3.4) ==========
calcularPosicionesPorCategoria(llegadas) // Calcula posiciones dentro de cada categoría

// ========== CONTADOR DE LLEGADAS (3.4.1) ==========
actualizarContadorLlegadas()             // Actualiza "Llegadas Registradas - X de Y"

// ========== TIEMPO COMPACTO (3.4.2) ==========
updateLlegadasCompactTimer()             // Actualiza tiempo en cabecera minimizada
setupCompactTimerUpdates()               // Configura intervalo de actualización
updateInitialCompactTimerState()         // Estado inicial al cargar

// ========== EXPORTACIONES ACTUALIZADAS ==========
exportLlegadasToExcel()                  // Excel con columna Pos. Cat. (nueva columna 7)
exportRankingToExcel()                   // Clasificación con Pos. Cat.
exportRankingToPDF()                     // PDF con Pos. Cat. (columna nueva)
```

---

## **4. ESTRUCTURAS DE DATOS CLAVE**

### **llegadasState** (Estado de Llegadas - ACTUALIZADO 3.4.2)
```javascript
window.llegadasState = {
  llegadas: [
    {
      id, timestamp, dorsal, nombre, apellidos, chip,
      categoria, equipo, licencia,                     // Campos 3.2.1
      horaSalida, cronoSalida, cronoSalidaSegundos,
      horaLlegada, cronoLlegadaWithMs, tiempoFinalWithMs,
      posicion,                                        // Posición general
      posicionCategoria,                               // NUEVO 3.4.2: Posición por categoría
      notas, capturadoEn, pendiente
    }
  ],
  importedSalidas: [],
  currentTime: 0
};
```

### **appState** (Estado Global Aplicación)
```javascript
{
  // Configuración
  audioType: 'beep'|'voice'|'none',
  currentLanguage: 'es'|'ca'|'en'|'fr',
  soundEnabled: boolean,
  aggressiveMode: boolean,
  voiceAudioCache: {},  // Precarga audios voz
  
  // Carreras
  currentRace: {
    id, name, date, firstStartTime,
    startOrder: [],     // Array de objetos corredor
    departures: [],     // ⚠️ Ya NO se usa (datos en cada corredor)
    intervals: []
  },
  races: [],           // Todas las carreras
  
  // Estado countdown
  countdownActive, countdownValue, departedCount,
  nextCorredorTime: 60,  // Tiempo entre corredores
  isSalidaShowing, salidaTimeout,
  
  // PWA
  deferredPrompt, updateAvailable
}
```

---

## **5. SISTEMA DE TRADUCCIONES**

### **Nuevas claves añadidas (v3.4.2):**
```javascript
// Para contador de llegadas (3.4.1):
llegadasListTitle: "Llegadas Registradas" (ES), "Registered Finishes" (EN), etc.
llegadasCounterTemplate: "{x} de {y} Corredores" (ES), "{x} of {y} Riders" (EN), etc.

// Para posición por categoría (3.3.4):
posCatHeader: "Pos. Cat." (ES/CA/FR), "Cat. Pos." (EN)
posCatHeaderTooltip: "Posición dentro de la categoría" (ES), etc.
```

### **Cómo funciona:**
1. **Objeto centralizado** `translations` con 4 idiomas
2. **Claves camelCase** (ej: `cardRaceTitle`, `modeSalidaText`)
3. **IDs DOM con guiones** (ej: `card-race-title`, `mode-salida-text`)
4. **Actualización completa** con `updateLanguageUI()` (11 pasos)

### **Añadir nuevo texto:**
1. Añadir clave en los 4 idiomas en `Traducciones.js`
2. Añadir elemento HTML con ID correspondiente
3. `updateLanguageUI()` lo actualizará automáticamente

---

## **6. HTML/CSS ESENCIAL**

### **IDs CRÍTICOS NUEVOS (v3.4.2):**
```javascript
// Contador de llegadas (3.4.1)
'#llegadas-list-counter'          // Span para "X de Y Corredores"

// Tiempo compacto (3.4.2)
'#llegadas-timer-compact'         // Tiempo en cabecera minimizada

// Posición por categoría (3.3.4)
'#posCatHeader'                   // Cabecera tabla llegadas
```

### **ESTRUCTURA TABLAS ACTUALIZADA:**
- **Orden salida**: 22 columnas (incluye categoría, equipo, licencia 3.2.1)
- **Llegadas**: 14 columnas (13 originales + Pos. Cat. 3.4.2)

**NUEVO ORDEN DE COLUMNAS LLEGADAS (3.4.2):**
1. Dorsal (0)
2. Crono Llegada (1)
3. Tiempo Final (2)
4. Posición (3) ← Posición general
5. Nombre (4)
6. Apellidos (5)
7. **Pos. Cat. (6)** ← **NUEVO 3.4.2: Posición por categoría**
8. Categoría (7) ← Movida aquí
9. Crono Salida (8)
10. Hora Llegada (9)
11. Hora Salida (10)
12. Chip (11)
13. Equipo (12)
14. Licencia (13)

### **CLASES CSS DE ESTADO (JavaScript las añade/remueve):**
```css
/* Countdown */
.countdown-normal    /* Fondo ROJO */
.countdown-warning   /* AMARILLO (últimos 10s) */
.countdown-critical  /* AMARILLO + animación (últimos 5s) */
.countdown-salida    /* VERDE (salida activa) */

/* Tiempo compacto (3.4.2) */
.llegadas-timer-compact /* Display en cabecera minimizada */

/* Responsive */
@media (max-width: 992px|768px|480px|360px)
```

---

## **7. FLUJOS PRINCIPALES**

### **Cálculo de Posición por Categoría (3.4.2):**
```
1. Llegadas.js: calcularPosicionesPorCategoria(llegadas)
2. → Agrupa llegadas por categoría
3. → Para cada categoría, ordena por tiempoFinalWithMs
4. → Asigna posiciones (1, 2, 3...) con manejo de empates
5. → renderLlegadasList() muestra en columna 7
6. → exportLlegadasToExcel() incluye nueva columna
```

### **Actualización Contador Llegadas (3.4.1):**
```
1. Cualquier cambio en llegadas (captura, borrado, etc.)
2. → actualizarContadorLlegadas() se llama
3. → Calcula X = llegadas con tiempo final > 0
4. → Obtiene Y = startOrderData.length (corredores en salida)
5. → Actualiza #llegadas-list-counter con traducción
6. → Formato: "Llegadas Registradas - X de Y Corredores"
```

### **Tiempo Compacto en Cronómetro Minimizado (3.4.2):**
```
1. Usuario minimiza llegadas-timer-card
2. UI.js: setupCardToggles() detecta target="llegadas-timer-card"
3. → Muestra #llegadas-timer-compact (display: inline)
4. → setupCompactTimerUpdates() inicia intervalo
5. → Cada segundo: updateLlegadasCompactTimer()
6. → Obtiene tiempo de #llegadas-timer-display
7. → Actualiza #llegadas-timer-compact con "- HH:MM:SS"
```

### **Actualización Múltiples Relojes (3.4.2):**
```
1. Main.js: setupTimeIntervals() inicia
2. → updateAllSystemClocks() cada segundo
3. → Actualiza múltiples elementos:
   - #current-system-time-display (gestión carrera)
   - #current-system-time (cuenta atrás)
   - #current-time-value (pantalla countdown)
4. → Todos sincronizados con hora del sistema
```

---

## **8. MODIFICACIONES COMUNES** ⭐

### **Añadir nuevo campo a corredor en llegadas:**
```
1. Llegadas.js: Añadir en estructura llegada
2. Llegadas.js: Añadir en renderLlegadasList() (columna 15)
3. Llegadas.js: Añadir en actualizarFilaLlegada() y actualizarFilaLlegadaIndividual()
4. Llegadas.js: Actualizar exportLlegadasToExcel() (columna 16)
5. Llegadas.js: Actualizar exportRankingToExcel() si corresponde
6. Llegadas.js: Actualizar exportRankingToPDF() si corresponde
7. Traducciones.js: Añadir clave header y tooltip (4 idiomas)
```

### **Modificar sistema de tarjetas expandibles:**
```
ARCHIVO: UI.js (setupCardToggles())
- data-target debe coincidir con clase de tarjeta
- Para comportamiento especial (ej: tiempo compacto), añadir condición:
  if (targetClass === 'nombre-tarjeta') { ... }
- Usar saveCardState() para persistencia
- card-collapse-indicator para feedback visual
```

### **Añadir nuevo reloj del sistema:**
```
ARCHIVO: UI.js (updateAllSystemClocks())
1. Añadir ID del elemento al array clockElements
2. El elemento se actualizará automáticamente cada segundo
3. Asegurar que el elemento existe en HTML
```

### **Cambiar formato de contador de llegadas:**
```
ARCHIVOS: UI.js (actualizarContadorLlegadas()), Traducciones.js
1. Modificar llegadasCounterTemplate en Traducciones.js
2. La función usa template.replace('{x}', x).replace('{y}', y)
3. Ejemplos: "{x}/{y}", "{x} of {y}", "{x} de {y} corredores"
```

### **Problema con botones de minimizar:**
```
VERIFICAR:
1. HTML: card-header-controls DENTRO de card-header
2. HTML: data-target coincide con clase de tarjeta (ej: "llegadas-timer-card")
3. CSS: Clases .collapsed existen y funcionan
4. JavaScript: setupCardToggles() está configurado en initApp()
```

---

## **9. SISTEMA DE LOGGING OPTIMIZADO** ⭐

### **Niveles de Log (v3.3.3):**
```javascript
const LOG_LEVEL = {
    ERROR: 0,   // 🚨 Solo errores críticos (funciones fallan, datos corruptos)
    WARN: 1,    // ⚠️ Problemas recuperables (elementos no encontrados)
    INFO: 2,    // ✅ Confirmaciones importantes (carga completada, cambios guardados)
    DEBUG: 3    // 🔍 Solo desarrollo (detalles internos, múltiples ejecuciones)
};

// Cambiar según entorno:
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;    // PRODUCCIÓN (solo errores y confirmaciones)
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG;   // DESARROLLO (todos los logs)
```

### **Función centralizada de logging:**
```javascript
function log(level, message, data = null) {
    if (level <= CURRENT_LOG_LEVEL) {
        const prefixes = ['🚨', '⚠️', '✅', '🔍'];
        const prefix = prefixes[level] || '';
        
        if (data) {
            console.log(`${prefix} ${message}`, data);
        } else {
            console.log(`${prefix} ${message}`);
        }
    }
}

// Uso en código:
log(LOG_LEVEL.INFO, "Inicializando aplicación Crono CRI...");
log(LOG_LEVEL.ERROR, "Error cargando carrera actual:", error);
log(LOG_LEVEL.DEBUG, `startOrderData disponible: ${!!startOrderData}`);
```

### **Logs nuevos en v3.4.2:**
```javascript
log(LOG_LEVEL.INFO, "📊 Contador actualizado: ${x} de ${y} corredores");
log(LOG_LEVEL.DEBUG, "🔄 Actualizando tiempo compacto de llegadas");
log(LOG_LEVEL.INFO, "✅ Actualizaciones de tiempo compacto configuradas");
```

---

## **10. REGLAS DE ORO**

1. **Nunca sobrescribir** campos `_Real` o `_Importado` - Solo usuario puede
2. **Usar throttling adecuado** según necesidad (3 niveles)
3. **Validar formatos tiempo** con funciones de Utilidades.js
4. **Mantener 22 columnas** en exportación Excel (incluye 3.2.1)
5. **Traducciones completas** - Nuevos textos en 4 idiomas
6. **Seguir convención nombres** - camelCase claves, guiones IDs
7. **Control inicialización única** - Variables `*Initialized`
8. **Comprobar audio** - Fallback a beep si falla voz
9. **Dos versiones PDF** - Completa y simplificada (fallback)
10. **Compensación 1s** - En Cuenta_Atras.js para corredores posteriores
11. **Datos en cada corredor** - No usar tablas separadas de salidas
12. **Sincronización automática** - dorsal↔posición en Cuenta_Atras.js
13. **Modal personalizado** - Para reinicio (no confirm() nativo)
14. **✅ LOGGING OPTIMIZADO** - Usar sistema por niveles, evitar logs redundantes
15. **✅ INICIALIZACIÓN AGRUPADA** - Configuraciones rápidas sin logs individuales
16. **✅ CAMPOS DE TEXTO NUMÉRICOS**: Para campos que solo deben contener números pero necesitan permitir borrado completo:
    - Usar `type="text"` en lugar de `type="number"`
    - **NO usar** `pattern="[0-9]*"`, `max`, `min`, `inputmode="numeric"`
    - Validar con JavaScript (`validatePositionInput()`)
    - Permitir explícitamente teclas de control en `keydown` (`handlePositionKeydown()`)
    - Forzar `value = ''` después de crear elementos dinámicamente
17. **✅ UN BOTÓN, UN CONFIGURADOR**: Cada botón debe ser configurado por una sola función
18. **✅ EVITAR CONFIGURACIONES DUPLICADAS**: Verificar que no haya múltiples funciones configurando el mismo elemento
19. **✅ USAR CLONACIÓN PARA RESET**: Cuando haya riesgo de listeners duplicados, clonar el elemento elimina todos los listeners anteriores
20. **✅ CONTADOR DE LLEGADAS DINÁMICO**: Siempre mostrar "Llegadas Registradas - X de Y Corredores"
21. **✅ TIEMPO COMPACTO EN MINIMIZAR**: Al minimizar cronómetro, mostrar tiempo en cabecera
22. **✅ POSICIÓN POR CATEGORÍA**: Calcular y mostrar posición dentro de cada categoría
23. **✅ MÚLTIPLES RELOJES SINCRONIZADOS**: Todos los relojes del sistema deben actualizarse juntos

---

## **11. LECCIONES APRENDIDAS**

### **Problemas Críticos Solucionados:**

#### **1. "Cuenta atrás en:" cálculo incorrecto**
**Problema:** Mostraba `horaSalida - horaActual`  
**Solución:** `(horaSalida - 1 minuto) - horaActual`  
**Archivo:** `UI.js` - `updateTimeDifference()`

#### **2. Compensación 1 segundo en cuenta atrás**
**Problema:** Salida se daba 1s tarde por retardo intervalo  
**Solución:** Restar 1s a corredores posteriores al primero  
**Archivo:** `Cuenta_Atras.js` - `calcularTiempoCuentaAtras()`

#### **3. Duplicación appState**
**Problema:** `const appState` y `window.appState` coexisten  
**Solución:** Mantener consistencia entre ambas  
**Archivo:** `Main.js`

#### **4. Carrera fantasma en selector**
**Problema:** Carreras eliminadas seguían en dropdown  
**Solución:** `diagnoseGhostRace()` + `fixGhostRace()`  
**Archivo:** `Utilidades.js`

#### **5. Modal reinicio usaba confirm() nativo**
**Problema:** Interfaz inconsistente, sin control  
**Solución:** Modal personalizado con `configurarBotonesModalReinicio()`  
**Archivo:** `Cuenta_Atras.js`

#### **6. Campos reales no se limpiaban al iniciar countdown**
**Problema:** Al iniciar automáticamente, datos anteriores persistían  
**Solución:** `resetearCamposRealesAutomatico()` en `UI.js`  
**Archivo:** `UI.js`

#### **7. 20+ funciones no documentadas en Main.js**
**Problema:** Documentación desactualizada vs implementación  
**Solución:** Análisis sistemático, ahora documentadas todas  
**Archivo:** `Main.js` + `CRI_App_Structure.md`

#### **8. Storage_Pwa.js solo 17% documentado**
**Problema:** 35 funciones implementadas, 6 documentadas  
**Solución:** Documentación completa de todas las funciones  
**Archivo:** `Storage_Pwa.js`

#### **9. Llegadas.js versión antigua documentada**
**Problema:** MD decía 9 columnas, realidad 13 con milésimas  
**Solución:** Actualizar a v3.2.1 (posiciones automáticas, PDF profesional)  
**Archivo:** `Llegadas.js`

#### **10. ✅ LOGS EXCESIVOS EN CONSOLA (v3.3.3)**
**Problema:** 100+ líneas de logs, 80% redundantes  
**Solución:** Sistema de logging por niveles con inicialización agrupada  
**Archivo:** `Main.js` - Sistema optimizado de logging

#### **11. Campo de posición no permitía borrar completamente en modal de añadir corredor**
**Problema:** En el modal "Añadir Corredor", cuando se seleccionaba "Posición específica", el campo mostraba un valor por defecto (ej: "26") y no se podía borrar completamente. Solo se podía borrar el último dígito, no el primero.

**Causa raíz:**
1. **Atributos HTML conflictivos:** `pattern="[0-9]*"` en inputs type="text" causa comportamiento inconsistente en algunos navegadores
2. **Atributo incorrecto:** `max="26"` solo funciona en inputs type="number", no en type="text"
3. **Restricción de teclado:** `inputmode="numeric"` puede forzar teclados móviles que bloquean teclas como Backspace completa
4. **Valor por defecto bloqueado:** El campo tenía un valor inicial que algunos navegadores protegen

**Solución implementada (v3.3.4+):**
```javascript
// 1. HTML limpio (sin atributos problemáticos)
<input type="text" 
       id="specific-position-input" 
       class="form-control specific-position-input" 
       placeholder="26"
       data-max-position="26">

// 2. Limpieza agresiva después de crear el modal
setTimeout(() => {
    const positionInput = document.getElementById('specific-position-input');
    if (positionInput) {
        positionInput.removeAttribute('pattern');
        positionInput.removeAttribute('inputmode');
        positionInput.removeAttribute('max');
        positionInput.removeAttribute('min');
        positionInput.value = ''; // Forzar vacío
    }
}, 50);

// 3. Validación manual con JavaScript
function validatePositionInput(input, maxPosition) {
    // Permitir vacío completamente
    if (input.value === '' || input.value === null) {
        return { valid: true, position: null };
    }
    // ... validación personalizada
}

// 4. Teclado permisivo
function handlePositionKeydown(event, maxPosition) {
    // Permitir TODAS las teclas de control
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', ...];
    if (controlKeys.includes(event.key)) {
        return true;
    }
    // ... resto de validación
}
```

**Archivos modificados:**
- `Salidas_3.js`: `showRiderPositionModal()`, `setupRiderPositionModalEvents()`
- **Funciones nuevas:** `validatePositionInput()`, `handlePositionKeydown()` (en sección auxiliar)

**Regla de oro añadida:**
- ✅ **Nunca usar** `pattern="[0-9]*"` en campos type="text" que necesiten permitir borrado completo
- ✅ **No mezclar** atributos de type="number" (min, max) con type="text"
- ✅ **Validar con JavaScript** en lugar de depender de validación HTML
- ✅ **Permitir teclas de control** explícitamente en manejadores de teclado

**Estado:** ✅ COMPLETAMENTE SOLUCIONADO en v3.3.4

#### **12. Problema de modales duplicados al eliminar orden de salida**
**Problema:** Al hacer clic en "Eliminar Orden de Salida", aparecía el modal de confirmación dos veces.

**Causa raíz:**
- **Configuración duplicada**: El botón `#delete-order-btn` tenía dos event listeners
- `setupModalActionListeners()` configuraba el botón con clonación para eliminar listeners antiguos
- `setupStartOrderEventListeners()` también configuraba el mismo botón sin prevención de duplicados
- **Ambas funciones** se llamaban desde `initApp()` en el array `quickConfigs`

**Solución implementada:**
1. **Eliminar configuración duplicada**: Remover `delete-order-btn` de `setupStartOrderEventListeners()`
2. **Centralizar en una función**: Dejar que solo `setupModalActionListeners()` maneje este botón
3. **Mantener solución robusta**: `setupModalActionListeners()` clona el botón para eliminar listeners antiguos

**Código modificado:**
```javascript
// En setupStartOrderEventListeners() - ANTES:
const orderListeners = [
    { id: 'create-template-btn', handler: createStartOrderTemplate, name: 'createStartOrderTemplate' },
    { id: 'import-order-btn', handler: importStartOrder, name: 'importStartOrder' },
    { id: 'delete-order-btn', handler: deleteStartOrder, name: 'deleteStartOrder' }, // ❌ ELIMINADO
    // ...
];

// En setupModalActionListeners() - MANTENIDO (solución robusta):
const deleteOrderBtn = document.getElementById('delete-order-btn');
if (deleteOrderBtn) {
    // Clonar botón para eliminar todos los listeners anteriores
    const newBtn = deleteOrderBtn.cloneNode(true);
    deleteOrderBtn.parentNode.replaceChild(newBtn, deleteOrderBtn);
    // Configurar UN único listener con prevención de duplicados
    // ...
}
```

**Archivos afectados:**
- `Salidas_1.js` o donde esté `setupStartOrderEventListeners()`
- `UI.js` o donde esté `setupModalActionListeners()`
- `Main.js` - `initApp()` llama a ambas funciones

**Regla de oro añadida:** 
- ✅ **Un botón, un configurador**: Cada botón debe ser configurado por una sola función
- ✅ **Evitar configuraciones duplicadas**: Verificar que no haya múltiples funciones configurando el mismo elemento
- ✅ **Usar clonación para reset**: Cuando haya riesgo de listeners duplicados, clonar el elemento elimina todos los listeners anteriores
- ✅ **Centralizar configuración de botones**: Agrupar configuración de botones relacionados en la misma función

**Estado:** ✅ SOLUCIONADO en v3.3.4

#### **13. ✅ Contador de llegadas no se actualizaba al cambiar de carrera (v3.4.1)**
**Problema:** El contador "Llegadas Registradas - X de Y Corredores" no se actualizaba al cambiar de carrera.

**Causa raíz:**
- `actualizarContadorLlegadas()` usaba `startOrderData` que podía no estar actualizado
- No se llamaba la función al cambiar de carrera

**Solución implementada:**
1. **Mejorar obtención de Y**: Intentar múltiples fuentes (`startOrderData`, `appState.currentRace.startOrder`, `appState.races`)
2. **Llamar función al cambiar carrera**: En `handleRaceChange()` o similar

**Archivos modificados:**
- `Llegadas.js`: `actualizarContadorLlegadas()` mejorada
- `Main.js` o `UI.js`: Añadir llamada al cambiar carrera

**Estado:** ✅ SOLUCIONADO en v3.4.1

#### **14. ✅ Botón de minimizar en cronómetro de llegadas mal posicionado (v3.4.2)**
**Problema:** Los `card-header-controls` estaban FUERA del `card-header`.

**Causa raíz:**
- Estructura HTML incorrecta
- CSS diseñado para controles DENTRO de la cabecera

**Solución:**
```html
<!-- INCORRECTO -->
<div class="app-card">
    <div class="card-header-controls">...</div> <!-- FUERA -->
    <div class="card-header">...</div>
</div>

<!-- CORRECTO -->
<div class="app-card">
    <div class="card-header">
        <div class="card-header-controls">...</div> <!-- DENTRO -->
        <h2>...</h2>
    </div>
</div>
```

**Estado:** ✅ SOLUCIONADO en v3.4.2

#### **15. ✅ Reloj "Hora del Sistema" no se actualizaba en tarjeta de cuenta atrás (v3.4.2)**
**Problema:** El elemento `#current-system-time` no recibía actualizaciones.

**Causa raíz:**
- `updateSystemTimeDisplay()` solo actualizaba `#current-system-time-display`
- No había intervalo configurado para el elemento de cuenta atrás

**Solución:**
```javascript
// En updateSystemTimeDisplay() o nueva función updateAllSystemClocks()
const countdownElement = document.getElementById('current-system-time');
if (countdownElement) {
    countdownElement.textContent = timeString;
}
```

**Estado:** ✅ SOLUCIONADO en v3.4.2

---

## **12. CHECKLIST PARA CAMBIOS** ⭐

### **ANTES de modificar:**
- [ ] Identificar módulos afectados (usar **Mapa de Módulos**)
- [ ] Verificar dependencias cruzadas
- [ ] Revisar **Reglas de Oro** relevantes
- [ ] Comprobar si afecta a traducciones (4 idiomas)
- [ ] **✅ Configurar nivel de log apropiado** (DEBUG para desarrollo, INFO para producción)

### **DURANTE modificación:**
- [ ] Usar funciones centralizadas (ej: `timeToSeconds()` de Utilidades.js)
- [ ] Aplicar throttling adecuado (3 niveles)
- [ ] Preservar campos `_Real` e `_Importado`
- [ ] Mantener estructura 22 columnas para Excel
- [ ] **✅ Usar sistema de logging optimizado** (`log()` con niveles)
- [ ] **✅ Agrupar configuraciones** cuando sea posible
- [ ] **✅ Usar `callIfFunction()`** para manejo elegante de funciones faltantes
- [ ] **✅ Para campos numéricos de texto**: NO usar `pattern`, `max`, `min`; validar con JS
- [ ] **✅ Verificar duplicación de event listeners** en botones
- [ ] **✅ Actualizar contador de llegadas** si afecta a llegadasState
- [ ] **✅ Verificar tiempo compacto** si modifica cronómetro de llegadas

### **DESPUÉS de modificar:**
- [ ] Probar en múltiples navegadores
- [ ] Verificar responsividad (4 breakpoints)
- [ ] Comprobar traducciones (4 idiomas)
- [ ] Validar importación/exportación Excel
- [ ] Probar cuenta atrás (compensación 1s)
- [ ] Verificar sincronización dorsal↔posición
- [ ] Probar modo llegadas (milésimas, posiciones)
- [ ] **✅ Verificar logs en consola** (solo información necesaria)
- [ ] **✅ Probar inicialización optimizada** (resumen claro, no logs excesivos)
- [ ] **✅ Probar campos de texto numéricos** permiten borrado completo
- [ ] **✅ Verificar que botones no abran múltiples modales**
- [ ] **✅ Probar contador de llegadas** se actualiza correctamente
- [ ] **✅ Probar tiempo compacto** al minimizar cronómetro

### **SI hay errores:**
- [ ] Revisar **Lecciones Aprendidas** (problemas similares)
- [ ] Usar funciones diagnóstico (`diagnoseCurrentState()`)
- [ ] Verificar consola JavaScript con nivel DEBUG
- [ ] Comprobar localStorage (datos corruptos)
- [ ] **✅ Usar `callIfFunction()`** para identificar funciones faltantes
- [ ] **✅ Verificar atributos HTML** en campos problemáticos
- [ ] **✅ Verificar duplicación de event listeners**

---

## **13. CAMBIOS v3.4.2** ⭐

### **Nuevas Funcionalidades:**

#### **1. Posición por Categoría (3.3.4)**
- **Columna nueva**: "Pos. Cat." (posición 7, después de Apellidos)
- **Función**: `calcularPosicionesPorCategoria()` - Calcula posiciones dentro de cada categoría
- **Actualizado en**: Tabla, Excel, PDF de clasificación
- **Traducciones**: `posCatHeader`, `posCatHeaderTooltip` en 4 idiomas

#### **2. Contador Dinámico de Llegadas (3.4.1)**
- **Formato**: "Llegadas Registradas - X de Y Corredores"
- **Función**: `actualizarContadorLlegadas()` - Se llama en 5 puntos críticos
- **Elemento HTML**: `#llegadas-list-counter`
- **Traducciones**: `llegadasListTitle`, `llegadasCounterTemplate` en 4 idiomas

#### **3. Tiempo Compacto al Minimizar (3.4.2)**
- **Funcionalidad**: Al minimizar cronómetro, muestra tiempo en cabecera
- **Elemento HTML**: `#llegadas-timer-compact`
- **Funciones nuevas**: 
  - `updateLlegadasCompactTimer()` - Actualiza tiempo
  - `setupCompactTimerUpdates()` - Configura intervalo
  - `updateInitialCompactTimerState()` - Estado inicial

#### **4. Corrección de Relojes del Sistema (3.4.2)**
- **Problema**: `#current-system-time` no se actualizaba
- **Solución**: `updateSystemTimeDisplay()` actualiza múltiples elementos
- **Función alternativa**: `updateAllSystemClocks()` para sincronización completa

### **Archivos Modificados:**

| Archivo | Cambios Principales | Versión |
|---------|-------------------|---------|
| **Llegadas.js** | Posición por categoría, contador llegadas, tiempo compacto | 3.4.2 |
| **UI.js** | `setupCardToggles()` actualizado, funciones tiempo compacto | 3.4.2 |
| **Traducciones.js** | Nuevas claves para Pos. Cat. y contador | 3.4.2 |
| **HTML principal** | Estructura corregida, elementos nuevos | 3.4.2 |

### **Reglas de Oro Añadidas:**
20. **✅ CONTADOR DE LLEGADAS DINÁMICO**: Siempre mostrar "Llegadas Registradas - X de Y Corredores"
21. **✅ TIEMPO COMPACTO EN MINIMIZAR**: Al minimizar cronómetro, mostrar tiempo en cabecera
22. **✅ POSICIÓN POR CATEGORÍA**: Calcular y mostrar posición dentro de cada categoría
23. **✅ MÚLTIPLES RELOJES SINCRONIZADOS**: Todos los relojes del sistema deben actualizarse juntos

### **Lecciones Aprendidas Añadidas:**
13. ✅ Contador de llegadas no se actualizaba al cambiar de carrera
14. ✅ Botón de minimizar en cronómetro de llegadas mal posicionado
15. ✅ Reloj "Hora del Sistema" no se actualizaba en tarjeta de cuenta atrás

---

## **📞 CONTACTO RÁPIDO ENTRE MÓDULOS**

### **Cuando Main.js necesita:**
- **Datos carrera** → `Storage_Pwa.js`: `loadRaceData()`, `saveRaceData()`
- **Actualizar UI** → `UI.js`: `updateSystemTimeDisplay()`, `showMessage()`
- **Traducciones** → `Traducciones.js`: `updateLanguageUI()`
- **Audio** → `Utilidades.js`: `playSound()`, `playVoiceAudio()`

### **Cuando UI.js necesita:**
- **Iniciar countdown** → `Cuenta_Atras.js`: `startCountdown()`
- **Cambiar modo** → `Llegadas.js`: `initLlegadasMode()`
- **Gestión carreras** → `Storage_Pwa.js`: `createNewRace()`, `deleteCurrentRace()`
- **Importar datos** → `Salidas_1.js`: `importStartOrder()`
- **Contador llegadas** → `Llegadas.js`: `actualizarContadorLlegadas()`

### **Cuando Llegadas.js necesita:**
- **Actualizar contador** → `UI.js`: `actualizarContadorLlegadas()` (en sí mismo)
- **Actualizar tiempo compacto** → `UI.js`: `updateLlegadasCompactTimer()`
- **Traducciones** → `Traducciones.js`: `llegadasListTitle`, `llegadasCounterTemplate`

### **Cuando Storage_Pwa.js es llamado por:**
- **Todos los módulos** (persistencia centralizada)
- **Especialmente**: Salidas_*.js, Cuenta_Atras.js, Llegadas.js

---

## **⚡ REFERENCIA ULTRA-RÁPIDA**

### **"Necesito modificar X, ¿qué archivo pido?"**

| Cambio | Archivo Principal | Archivos Secundarios |
|--------|------------------|---------------------|
| **Importación/Exportación Excel** | `Salidas_1.js` | `Utilidades.js`, `Traducciones.js` |
| **Interfaz tabla, edición** | `Salidas_2.js` | `Salidas_3.js`, `Salidas_4.js` |
| **Modales, añadir corredores** | `Salidas_3.js` | `UI.js`, `Storage_Pwa.js` |
| **Validaciones, confirmaciones** | `Salidas_4.js` | `Utilidades.js` |
| **Cuenta atrás, salidas** | `Cuenta_Atras.js` | `Utilidades.js`, `Storage_Pwa.js`, `Salidas_2.js` |
| **Interfaz general, tarjetas** | `UI.js` | `Main.js`, `Storage_Pwa.js` |
| **Persistencia, backup, carreras** | `Storage_Pwa.js` | `UI.js`, `Main.js` |
| **Conversiones tiempo, audio, PDF** | `Utilidades.js` | `Traducciones.js` |
| **Textos, idiomas** | `Traducciones.js` | `UI.js`, `Main.js` |
| **Llegadas, clasificación** | `Llegadas.js` | `Utilidades.js`, `Traducciones.js` |
| **Estado global, PWA, logging** | `Main.js` | `UI.js`, `Storage_Pwa.js` |
| **✅ Sistema de logging** | `Main.js` | (centralizado) |
| **✅ Optimización consola** | `Main.js` | (todos los módulos) |
| **✅ Validación campos numéricos** | `Salidas_3.js` | `UI.js` |
| **✅ Configuración event listeners** | `UI.js` / `Salidas_1.js` | `Main.js` |
| **✅ Posición por categoría** | `Llegadas.js` | `Traducciones.js` |
| **✅ Contador de llegadas** | `Llegadas.js`, `UI.js` | `Traducciones.js` |
| **✅ Tiempo compacto cronómetro** | `UI.js` | `Llegadas.js` |

---

## **🎯 RESUMEN DE CAMBIOS v3.4.2**

### **Mejoras principales:**
1. **✅ Posición por categoría**: Nueva columna en llegadas, Excel y PDF
2. **✅ Contador dinámico de llegadas**: "Llegadas Registradas - X de Y Corredores"
3. **✅ Tiempo compacto al minimizar**: Cronómetro muestra tiempo en cabecera
4. **✅ Corrección relojes sistema**: Todos los relojes sincronizados
5. **✅ Botones minimizar corregidos**: Estructura HTML correcta

### **Nuevas funciones:**
1. `calcularPosicionesPorCategoria()` - Posiciones dentro de categorías
2. `actualizarContadorLlegadas()` - Actualiza contador dinámico
3. `updateLlegadasCompactTimer()` - Tiempo en cabecera minimizada
4. `setupCompactTimerUpdates()` - Intervalo para tiempo compacto
5. `updateAllSystemClocks()` - Sincroniza múltiples relojes

### **Nuevas traducciones:**
1. `llegadasListTitle` - Título de tarjeta de llegadas
2. `llegadasCounterTemplate` - Plantilla para contador "{x} de {y}"
3. `posCatHeader` - Cabecera "Pos. Cat."
4. `posCatHeaderTooltip` - Tooltip explicativo

### **Reglas de oro añadidas:**
1. **Contador de llegadas dinámico**
2. **Tiempo compacto en minimizar**
3. **Posición por categoría**
4. **Múltiples relojes sincronizados**

### **Resultados:**
- **Usabilidad mejorada**: Información más completa al instante
- **Profesionalidad**: Posición por categoría para organizadores
- **Eficiencia**: Tiempo visible incluso minimizado
- **Consistencia**: Todos los relojes sincronizados
- **Internacionalización**: Nuevos textos traducidos a 4 idiomas

**Documentación optimizada para modificaciones - v3.4.2**  
**Caracteres:** ~40,500 (incluye todas las mejoras)  
**Cobertura:** 100% funcionalidades necesarias para programar  
**Última actualización:** Enero 2026  

**✅ Listo para recibir solicitudes de modificación.**  
**Solo dime: "Quiero cambiar [X]" y te pediré los archivos necesarios.**

---

**PROTOCOLO COMPLETO PARA MODIFICACIONES DE APPS PWA**

## **CONTEXTO TÉCNICO IMPORTANTE**
1. **Limitación de mensajes:** Superamos frecuentemente el límite de mensajes en el chat
2. **Consecuencia directa:** Los procesos de modificación se interrumpen a mitad de camino  
3. **Problemas resultantes:**
   - Archivos cada vez más grandes con código no utilizado o mal aprovechado
   - Archivos que no puedo enviarte por exceso de tamaño

## **PROTOCOLO DE COMUNICACIÓN PRINCIPAL**
- **Una opción a la vez:** Solo presentaré UNA propuesta/opción en cada mensaje
- **Confirmación obligatoria:** Esperaré tu "visto bueno" explícito para cada paso
- **Flujo secuencial:** Opción 1 → Tu respuesta → Opción 2 → Tu respuesta
- **Preguntas con pausa:** Cuando te haga una pregunta, esperaré tu respuesta antes de continuar

## **FLUJO DE TRABAJO PARA MODIFICACIONES**

### **FASE 1: CONFIRMACIÓN INICIAL**
1. Me describirás la modificación solicitada
2. Yo repetiré exactamente lo que he entendido
3. **Esperaré tu confirmación** antes de pasar a la Fase 2

### **FASE 2: SOLICITUD DE ARCHIVOS**
1. Te pediré SOLO los archivos/funciones específicas que necesito ver
2. **Esperaré a que me los envíes** antes de analizarlos
3. No asumiré ni adivinaré qué código necesito

### **FASE 3: ANÁLISIS Y PROPUESTA ÚNICA**
1. Analizaré los archivos recibidos
2. Te presentaré UNA sola propuesta de modificación:
   - Archivo(s) a modificar
   - Razón del cambio
   - **Nada más** - sin opciones alternativas
3. **Esperaré tu "visto bueno"** antes de cualquier acción

### **FASE 4: EJECUCIÓN DIRIGIDA**
Con tu aprobación, procederé según estos criterios:

**ESCENARIO A - Función pequeña o cambio completo:**
- Te enviaré la NUEVA función completa
- Instrucción: "SUSTITUIR [nombre función] por esta nueva versión"
- **Esperaré confirmación** de que lo has implementado

**ESCENARIO B - Cambio específico/puntual:**
- Te indicaré EXACTAMENTE: "SUSTITUIR [líneas X a Y] por [este nuevo código]"
- El cambio será autocontenido, sin instrucciones de "mantener código anterior"
- **Esperaré confirmación** de implementación

**ESCENARIO C - Archivo muy grande:**
- Te propondré dividir el trabajo en partes manejables
- **Cada parte por separado** con su propia confirmación
- Priorizaremos eliminar código no utilizado primero

### **FASE 5: DOCUMENTACIÓN FINAL**
1. Tras confirmación de cambios implementados
2. Te enviaré la NUEVA versión completa del archivo modificado
3. Actualizaré el fichero MD con estructura actualizada
4. **Esperaré tu validación** final

## **REGLAS TÉCNICAS OBLIGATORIAS**
1. **CamelCase estricto** para variables/funciones
2. **Preparado para traducción** desde el diseño
3. **Sin código redundante** o duplicado
4. **Eliminación proactiva** de código no utilizado
5. **Instrucciones claras** y autocontenidas
6. **Para campos numéricos de texto**: Validación JS, no atributos HTML conflictivos
7. **Un botón, un configurador**: Evitar múltiples funciones configurando el mismo elemento

## **CONFIRMACIÓN EN CADA INTERACCIÓN**
Después de cada propuesta o pregunta, mi mensaje incluirá:
- "¿He entendido correctamente [resumen]?"
- O: "¿Puedo proceder con [acción específica]?"
- **Y esperaré tu respuesta antes de continuar**