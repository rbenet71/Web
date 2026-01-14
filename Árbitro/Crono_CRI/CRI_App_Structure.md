# CRI App - Documentación Optimizada para Modificaciones v3.4.5+

📋 **ÍNDICE RÁPIDO**
1. Visión General
2. Mapa de Módulos ⭐
3. Funciones Críticas por Módulo
4. Estructuras de Datos Clave
5. Sistema de Traducciones
6. HTML/CSS Esencial
7. Flujos Principales
8. Modificaciones Comunes ⭐
9. Sistema de Logging Optimizado ⭐
10. Reglas de Oro
11. Lecciones Aprendidas
12. Checklist para Cambios ⭐
13. Cambios v3.4.2 - v3.4.5+ ⭐

---

## 1. VISIÓN GENERAL
Crono CRI v3.4.5+ - PWA para control de salidas/llegadas en carreras ciclistas.

**Modo Salidas**: Cuenta atrás basada en cronoSalida de tabla  
**Modo Llegadas**: Cronometraje con milésimas, posiciones automáticas, posición por categoría  
**4 idiomas**: ES, CA, EN, FR  
**Exportación**: Excel (14 cols llegadas), PDF (clasificación)  
**Sistema de logging optimizado** (reducción 80% logs en consola)  
**Contador dinámico** de llegadas registradas  
**Tiempo compacto** en cronómetro minimizado  
**Celdas vacías** en Excel para tiempos sin valor  
**Nueva funcionalidad**: Eliminar corredores con recálculo automático

---

## 2. MAPA DE MÓDULOS ⭐

| Módulo | Responsabilidad Principal | Dependencias Clave | Versión |
|--------|---------------------------|-------------------|---------|
| Main.js | Coordinación global, estado app, PWA, pantalla countdown, logging optimizado | TODOS | 3.3.3 |
| Salidas_1.js | Importación/exportación Excel (22 cols), validación | Storage_Pwa, UI, Salidas_2 | 3.2.1 |
| Salidas_2.js | Tabla UI, edición inline, throttling 3 niveles | Salidas_1, Salidas_3, Salidas_4 | 3.2.1 |
| **Salidas_3.js** | **Modales, añadir/eliminar corredores, cambios globales** | Salidas_2, UI, Storage_Pwa | **3.4.5+** |
| Salidas_4.js | Confirmaciones, validaciones, edición avanzada | Salidas_2, Salidas_3, Utilidades | 3.2.1 |
| Cuenta_Atras.js | Sistema cuenta atrás, salidas, sincronización dorsal↔posición | Main, Utilidades, Salidas_2, Storage_Pwa | 3.2.1 |
| UI.js | Interfaz, tarjetas, modales, gestión tiempo, contador llegadas | Main, Storage_Pwa, Cuenta_Atras, Llegadas | 3.4.2 |
| Storage_Pwa.js | Persistencia, backup/restore, gestión carreras (35 funciones) | TODOS (persistencia central) | 3.2.2 |
| Utilidades.js | Conversiones tiempo, audio, exportación, diagnóstico | TODOS (utilidades centrales) | 3.2.1 |
| Traducciones.js | Sistema multilingüe (4 idiomas) | TODOS (textos UI) | 3.4.5+ |
| Llegadas.js | Modo llegadas (14 cols), milésimas, posiciones auto, posición por categoría | Main, Utilidades, Traducciones | 3.4.5 |

**Flujo principal**: Main → [Salidas_1-4 / Llegadas] ↔ UI ↔ Storage_Pwa ↔ Utilidades

---

## 3. FUNCIONES CRÍTICAS POR MÓDULO

### MAIN.JS v3.3.3 (Coordinación Global con Logging Optimizado)
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

### SALIDAS_3.JS v3.4.5+ (Añadir/Eliminar Corredores - ACTUALIZADO)
```javascript
// ✅ NUEVO: Sistema de eliminación de corredores
function addNewRider()               // Añade nuevo corredor con datos por defecto
function deleteSelectedRider()       // ⭐ NUEVO 3.4.5+: Elimina corredor seleccionado

// Flujo de deleteSelectedRider():
// 1. Valida selección (fila con clase .selected)
// 2. Muestra confirmación nativa (confirm())
// 3. Elimina de startOrderData
// 4. Recalcula tiempos con recalculateAllStartTimes()
// 5. Actualiza tabla y guarda cambios
// 6. Muestra mensaje de éxito

// Configuración automática del botón
function setupDeleteRiderButtonDirect() // Configura listener para botón eliminar
```

### UI.JS v3.4.2 (Interfaz y Gestión Tiempo - ACTUALIZADO)
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

### LLEGADAS.JS v3.4.5 (14 Columnas, Exportación Unificada - ACTUALIZADO)
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

// EXPORTACIÓN UNIFICADA (3.4.5):
exportLlegadasToExcel()                // ✅ UNIFICADA: Excel llegadas y clasificación (14 cols)
exportRankingToPDF()                   // PDF de clasificación con Pos. Cat.
formatSecondsWithMilliseconds(seconds) // HH:MM:SS.mmm
formatTimeForExcel(timeValue)          // ✅ NUEVO 3.4.5: Celdas vacías para tiempos sin valor
```

### FUNCIONES ELIMINADAS (v3.4.5):
```javascript
// ❌ ELIMINADA - Función redundante
exportRankingToExcel()  // Ahora se usa exportLlegadasToExcel() para todo
```

### TRADUCCIONES.JS v3.4.5+ (Sistema Multilingüe - ACTUALIZADO)
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
    posCatHeaderTooltip: "Posición dentro de la categoría",
    // NUEVAS TRADUCCIONES 3.4.5+ (eliminación corredores):
    deleteRiderText: "Eliminar Corredor",
    deleteRiderNoSelection: "Has de seleccionar un corredor",
    deleteRiderConfirm: "¿Eliminar corredor {dorsal} {nombre}?",
    deleteRiderNotFound: "Corredor no encontrado",
    deleteRiderSuccess: "Corredor eliminado correctamente"
  },
  ca: { 
    // ... mismas claves en catalán ...
    deleteRiderText: "Eliminar Corredor",
    deleteRiderNoSelection: "Has de seleccionar un corredor",
    deleteRiderConfirm: "¿Eliminar corredor {dorsal} {nombre}?",
    deleteRiderNotFound: "Corredor no trobat",
    deleteRiderSuccess: "Corredor eliminat correctament"
  },
  en: { 
    // ... same keys in English ...
    deleteRiderText: "Delete Rider",
    deleteRiderNoSelection: "You must select a rider",
    deleteRiderConfirm: "Delete rider {dorsal} {nombre}?",
    deleteRiderNotFound: "Rider not found",
    deleteRiderSuccess: "Rider deleted successfully"
  },
  fr: { 
    // ... mêmes clés en français ...
    deleteRiderText: "Supprimer Coureur",
    deleteRiderNoSelection: "Vous devez sélectionner un coureur",
    deleteRiderConfirm: "Supprimer le coureur {dorsal} {nombre} ?",
    deleteRiderNotFound: "Coureur non trouvé",
    deleteRiderSuccess: "Coureur supprimé avec succès"
  }
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

---

## 4. ESTRUCTURAS DE DATOS CLAVE

### llegadasState (Estado de Llegadas - ACTUALIZADO 3.4.5)
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

### appState (Estado Global Aplicación)
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

## 5. SISTEMA DE TRADUCCIONES

**Nuevas claves añadidas (v3.4.5+):**
```javascript
// Para eliminación de corredores:
deleteRiderText: "Eliminar Corredor" (ES/CA), "Delete Rider" (EN), "Supprimer Coureur" (FR)
deleteRiderNoSelection: "Has de seleccionar un corredor" (ES), etc.
deleteRiderConfirm: "¿Eliminar corredor {dorsal} {nombre}?" (ES), etc.
deleteRiderNotFound: "Corredor no encontrado" (ES), etc.
deleteRiderSuccess: "Corredor eliminado correctamente" (ES), etc.

// Para contador de llegadas (3.4.1):
llegadasListTitle: "Llegadas Registradas" (ES), "Registered Finishes" (EN), etc.
llegadasCounterTemplate: "{x} de {y} Corredores" (ES), "{x} of {y} Riders" (EN), etc.

// Para posición por categoría (3.3.4):
posCatHeader: "Pos. Cat." (ES/CA/FR), "Cat. Pos." (EN)
posCatHeaderTooltip: "Posición dentro de la categoría" (ES), etc.
```

**Cómo funciona:**
- Objeto centralizado `translations` con 4 idiomas
- Claves camelCase (ej: `cardRaceTitle`, `modeSalidaText`)
- IDs DOM con guiones (ej: `card-race-title`, `mode-salida-text`)
- Actualización completa con `updateLanguageUI()` (11 pasos)

**Añadir nuevo texto:**
1. Añadir clave en los 4 idiomas en Traducciones.js
2. Añadir elemento HTML con ID correspondiente
3. `updateLanguageUI()` lo actualizará automáticamente

---

## 6. HTML/CSS ESENCIAL

**IDs CRÍTICOS NUEVOS (v3.4.5+):**
```javascript
// Botón eliminación corredor (3.4.5+)
'#delete-rider-btn'                // Botón eliminar corredor
'#delete-rider-text'               // Texto del botón

// Contador de llegadas (3.4.1)
'#llegadas-list-counter'           // Span para "X de Y Corredores"

// Tiempo compacto (3.4.2)
'#llegadas-timer-compact'          // Tiempo en cabecera minimizada

// Posición por categoría (3.3.4)
'#posCatHeader'                    // Cabecera tabla llegadas
```

**ESTRUCTURA TABLAS ACTUALIZADA:**
- **Orden salida**: 22 columnas (incluye categoría, equipo, licencia 3.2.1)
- **Llegadas**: 14 columnas (13 originales + Pos. Cat. 3.4.2)

**NUEVO ORDEN DE COLUMNAS LLEGADAS (3.4.5):**
1. Dorsal (0)
2. Crono Llegada (1)
3. Tiempo Final (2)
4. Posición (3) ← Posición general
5. Nombre (4)
6. Apellidos (5)
7. Pos. Cat. (6) ← NUEVO 3.4.2: Posición por categoría
8. Categoría (7) ← Movida aquí
9. Crono Salida (8)
10. Hora Llegada (9)
11. Hora Salida (10)
12. Chip (11)
13. Equipo (12)
14. Licencia (13)

**CLASES CSS DE ESTADO (JavaScript las añade/remueve):**
```css
/* Countdown */
.countdown-normal    /* Fondo ROJO */
.countdown-warning   /* AMARILLO (últimos 10s) */
.countdown-critical  /* AMARILLO + animación (últimos 5s) */
.countdown-salida    /* VERDE (salida activa) */

/* Selección filas para eliminación (3.4.5+) */
#start-order-table tbody tr.selected {
    background-color: #ffe6e6 !important;
    border-left: 4px solid #dc3545 !important;
}

/* Tiempo compacto (3.4.2) */
.llegadas-timer-compact /* Display en cabecera minimizada */

/* Responsive */
@media (max-width: 992px|768px|480px|360px)
```

**ESTRUCTURA HTML DE BOTONES (ACTUALIZADA 3.4.5+):**
```html
<div class="buttons-responsive-container">
    <!-- ... otros botones ... -->
    <button class="responsive-btn btn-info" id="add-rider-btn">
        <i class="fas fa-user-plus"></i>
        <span id="add-rider-text">Añadir Corredor</span>
    </button>
    <!-- ⭐ NUEVO BOTÓN 3.4.5+ -->
    <button class="responsive-btn btn-danger" id="delete-rider-btn">
        <i class="fas fa-user-minus"></i>
        <span id="delete-rider-text">Eliminar Corredor</span>
    </button>
</div>
```

---

## 7. FLUJOS PRINCIPALES

### Eliminación de Corredor (3.4.5+):
```text
1. Usuario hace clic en fila de tabla de orden de salida
   → Fila obtiene clase .selected (estilo visual)
   
2. Usuario hace clic en "Eliminar Corredor"
   → deleteSelectedRider() se ejecuta
   
3. Validación de selección:
   - Si no hay fila .selected → showMessage("Has de seleccionar un corredor")
   - Si hay selección → continuar
   
4. Confirmación:
   - Mostrar confirm() nativo con datos del corredor
   - Si usuario cancela → terminar
   
5. Eliminación:
   - Eliminar corredor de startOrderData.splice(index, 1)
   - Reasignar order de todos los corredores restantes
   
6. Recalculo:
   - Llamar a recalculateAllStartTimes()
   - Actualizar cronoSalida y horaSalida de todos los corredores
   
7. Actualización:
   - Actualizar total-riders input
   - Llamar a updateStartOrderTableThrottled()
   - Llamar a saveStartOrderData()
   
8. Mensaje final:
   - showMessage("Corredor eliminado correctamente", 'success')
```

### Cálculo de Posición por Categoría (3.4.2):
```text
1. Llegadas.js: calcularPosicionesPorCategoria(llegadas)
2. → Agrupa llegadas por categoría
3. → Para cada categoría, ordena por tiempoFinalWithMs
4. → Asigna posiciones (1, 2, 3...) con manejo de empates
5. → renderLlegadasList() muestra en columna 7
6. → exportLlegadasToExcel() incluye nueva columna
```

### Actualización Contador Llegadas (3.4.1):
```text
1. Cualquier cambio en llegadas (captura, borrado, etc.)
2. → actualizarContadorLlegadas() se llama
3. → Calcula X = llegadas con tiempo final > 0
4. → Obtiene Y = startOrderData.length (corredores en salida)
5. → Actualiza #llegadas-list-counter con traducción
6. → Formato: "Llegadas Registradas - X de Y Corredores"
```

### Tiempo Compacto en Cronómetro Minimizado (3.4.2):
```text
1. Usuario minimiza llegadas-timer-card
2. UI.js: setupCardToggles() detecta target="llegadas-timer-card"
3. → Muestra #llegadas-timer-compact (display: inline)
4. → setupCompactTimerUpdates() inicia intervalo
5. → Cada segundo: updateLlegadasCompactTimer()
6. → Obtiene tiempo de #llegadas-timer-display
7. → Actualiza #llegadas-timer-compact con "- HH:MM:SS"
```

### Exportación Excel Unificada (3.4.5):
```text
1. Usuario hace clic en "Exportar Excel" (tabla o clasificación)
2. → exportLlegadasToExcel() se ejecuta
3. → formatTimeForExcel() procesa cada campo de tiempo:
   - Si valor es null/undefined/'--:--:--'/'00:00:00' → celda vacía
   - Si valor es válido → mantiene valor
4. → Genera Excel con 14 columnas (incluye Pos. Cat.)
5. → Descarga archivo "llegadas_YYYY-MM-DD.xlsx"
```

### Actualización Múltiples Relojes (3.4.2):
```text
1. Main.js: setupTimeIntervals() inicia
2. → updateAllSystemClocks() cada segundo
3. → Actualiza múltiples elementos:
   - #current-system-time-display (gestión carrera)
   - #current-system-time (cuenta atrás)
   - #current-time-value (pantalla countdown)
4. → Todos sincronizados con hora del sistema
```

---

## 8. MODIFICACIONES COMUNES ⭐

### Añadir botón "Eliminar Corredor" en Orden de Salida (NUEVO 3.4.5+)
```text
1. HTML: Añadir botón en .buttons-responsive-container junto a "Añadir Corredor"
2. Traducciones.js: Añadir claves en 4 idiomas:
   - deleteRiderText: "Eliminar Corredor" (ES/CA), "Delete Rider" (EN), "Supprimer Coureur" (FR)
   - deleteRiderNoSelection: "Has de seleccionar un corredor"
   - deleteRiderConfirm: "¿Eliminar corredor {dorsal} {nombre}?"
   - deleteRiderNotFound: "Corredor no encontrado"
   - deleteRiderSuccess: "Corredor eliminado correctamente"
3. Salidas_3.js: Crear función deleteSelectedRider() con:
   - Selección por click en fila (tr.selected)
   - Validación de selección
   - Modal de confirmación nativo (confirm())
   - Eliminación y recálculo automático de tiempos
   - Actualización de tabla y persistencia
4. CSS: Añadir estilo para filas seleccionadas
   #start-order-table tbody tr.selected {
       background-color: #ffe6e6 !important;
       border-left: 4px solid #dc3545 !important;
   }
```

### Añadir nuevo campo a corredor en llegadas:
```text
1. Llegadas.js: Añadir en estructura llegada
2. Llegadas.js: Añadir en renderLlegadasList() (columna 15)
3. Llegadas.js: Añadir en actualizarFilaLlegada() y actualizarFilaLlegadaIndividual()
4. Llegadas.js: Actualizar exportLlegadasToExcel() (columna 16)
5. Llegadas.js: Actualizar exportRankingToPDF() si corresponde
6. Traducciones.js: Añadir clave header y tooltip (4 idiomas)
```

### Modificar sistema de tarjetas expandibles:
```text
ARCHIVO: UI.js (setupCardToggles())
- data-target debe coincidir con clase de tarjeta
- Para comportamiento especial (ej: tiempo compacto), añadir condición:
  if (targetClass === 'nombre-tarjeta') { ... }
- Usar saveCardState() para persistencia
- card-collapse-indicator para feedback visual
```

### Modificar exportación Excel:
```text
ARCHIVO: `Llegadas.js` (exportLlegadasToExcel())
- Mantener 14 columnas (nuevo orden 3.4.2)
- Usar `formatTimeForExcel()` para tiempos (celdas vacías si no hay valor 3.4.5)
- Incluir posición por categoría (columna 7)
- ✅ ESTA FUNCIÓN SIRVE PARA TODAS LAS EXPORTACIONES EXCEL
- No usar `exportRankingToExcel()` (ELIMINADA en 3.4.5)
```

### Añadir nuevo reloj del sistema:
```text
ARCHIVO: UI.js (updateAllSystemClocks())
1. Añadir ID del elemento al array clockElements
2. El elemento se actualizará automáticamente cada segundo
3. Asegurar que el elemento existe en HTML
```

### Cambiar formato de contador de llegadas:
```text
ARCHIVOS: UI.js (actualizarContadorLlegadas()), Traducciones.js
1. Modificar llegadasCounterTemplate en Traducciones.js
2. La función usa template.replace('{x}', x).replace('{y}', y)
3. Ejemplos: "{x}/{y}", "{x} of {y}", "{x} de {y} corredores"
```

### Problema con botones de minimizar:
```text
VERIFICAR:
1. HTML: card-header-controls DENTRO de card-header
2. HTML: data-target coincide con clase de tarjeta (ej: "llegadas-timer-card")
3. CSS: Clases .collapsed existen y funcionan
4. JavaScript: setupCardToggles() está configurado en initApp()
```

---

## 9. SISTEMA DE LOGGING OPTIMIZADO ⭐

**Niveles de Log (v3.3.3):**
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

**Función centralizada de logging:**
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

**Logs nuevos en v3.4.2 - v3.4.5+:**
```javascript
log(LOG_LEVEL.INFO, "📊 Contador actualizado: ${x} de ${y} corredores");
log(LOG_LEVEL.DEBUG, "🔄 Actualizando tiempo compacto de llegadas");
log(LOG_LEVEL.INFO, "✅ Actualizaciones de tiempo compacto configuradas");
log(LOG_LEVEL.DEBUG, "📊 Exportación Excel unificada - celdas vacías para tiempos sin valor");
log(LOG_LEVEL.INFO, "Botón Eliminar Corredor clickeado"); // ⭐ NUEVO 3.4.5+
log(LOG_LEVEL.DEBUG, "✅ Botón Eliminar Corredor configurado (configuración directa)");
log(LOG_LEVEL.INFO, `Corredor eliminado: ${selectedRider.dorsal} - ${selectedRider.nombre}`);
```

---

## 10. REGLAS DE ORO

1. **Nunca sobrescribir campos _Real o _Importado** - Solo usuario puede
2. **Usar throttling adecuado** según necesidad (3 niveles)
3. **Validar formatos tiempo** con funciones de Utilidades.js
4. **Mantener 22 columnas** en exportación Excel de salidas
5. **Traducciones completas** - Nuevos textos en 4 idiomas
6. **Seguir convención nombres** - camelCase claves, guiones IDs
7. **Control inicialización única** - Variables *Initialized
8. **Comprobar audio** - Fallback a beep si falla voz
9. **Dos versiones PDF** - Completa y simplificada (fallback)
10. **Compensación 1s** - En Cuenta_Atras.js para corredores posteriores
11. **Datos en cada corredor** - No usar tablas separadas de salidas
12. **Sincronización automática** - dorsal↔posición en Cuenta_Atras.js
13. **Modal personalizado** - Para reinicio (no confirm() nativo)
14. **✅ LOGGING OPTIMIZADO** - Usar sistema por niveles, evitar logs redundantes
15. **✅ INICIALIZACIÓN AGRUPADA** - Configuraciones rápidas sin logs individuales
16. **✅ CAMPOS DE TEXTO NUMÉRICOS**: Para campos que solo deben contener números pero necesitan permitir borrado completo:
    - Usar type="text" en lugar de type="number"
    - NO usar pattern="[0-9]*", max, min, inputmode="numeric"
    - Validar con JavaScript (validatePositionInput())
    - Permitir explícitamente teclas de control en keydown (handlePositionKeydown())
    - Forzar value = '' después de crear elementos dinámicamente
17. **✅ UN BOTÓN, UN CONFIGURADOR**: Cada botón debe ser configurado por una sola función
18. **✅ EVITAR CONFIGURACIONES DUPLICADAS**: Verificar que no haya múltiples funciones configurando el mismo elemento
19. **✅ USAR CLONACIÓN PARA RESET**: Cuando haya riesgo de listeners duplicados, clonar el elemento elimina todos los listeners anteriores
20. **✅ CONTADOR DE LLEGADAS DINÁMICO**: Siempre mostrar "Llegadas Registradas - X de Y Corredores"
21. **✅ TIEMPO COMPACTO EN MINIMIZAR**: Al minimizar cronómetro, mostrar tiempo en cabecera
22. **✅ POSICIÓN POR CATEGORÍA**: Calcular y mostrar posición dentro de cada categoría
23. **✅ MÚLTIPLES RELOJES SINCRONIZADOS**: Todos los relojes del sistema deben actualizarse juntos
24. **✅ CELDAS VACÍAS EN EXCEL**: Para tiempos sin valor, dejar celda vacía (no 00:00:00)
25. **✅ EXPORTACIÓN EXCEL UNIFICADA**: Usar exportLlegadasToExcel() para todas las exportaciones Excel
26. **✅ SELECCIÓN CLARA PARA ELIMINACIÓN**: Para eliminar corredor, requerir selección explícita (click en fila) con feedback visual

---

## 11. LECCIONES APRENDIDAS

### Problemas Críticos Solucionados:

1. **"Cuenta atrás en:" cálculo incorrecto**  
   Problema: Mostraba horaSalida - horaActual  
   Solución: (horaSalida - 1 minuto) - horaActual  
   Archivo: UI.js - updateTimeDifference()

2. **Compensación 1 segundo en cuenta atrás**  
   Problema: Salida se daba 1s tarde por retardo intervalo  
   Solución: Restar 1s a corredores posteriores al primero  
   Archivo: Cuenta_Atras.js - calcularTiempoCuentaAtras()

3. **Duplicación appState**  
   Problema: const appState y window.appState coexisten  
   Solución: Mantener consistencia entre ambas  
   Archivo: Main.js

4. **Carrera fantasma en selector**  
   Problema: Carreras eliminadas seguían en dropdown  
   Solución: diagnoseGhostRace() + fixGhostRace()  
   Archivo: Utilidades.js

5. **Modal reinicio usaba confirm() nativo**  
   Problema: Interfaz inconsistente, sin control  
   Solución: Modal personalizado con configurarBotonesModalReinicio()  
   Archivo: Cuenta_Atras.js

6. **Campos reales no se limpiaban al iniciar countdown**  
   Problema: Al iniciar automáticamente, datos anteriores persistían  
   Solución: resetearCamposRealesAutomatico() en UI.js  
   Archivo: UI.js

7. **20+ funciones no documentadas en Main.js**  
   Problema: Documentación desactualizada vs implementación  
   Solución: Análisis sistemático, ahora documentadas todas  
   Archivo: Main.js + CRI_App_Structure.md

8. **Storage_Pwa.js solo 17% documentado**  
   Problema: 35 funciones implementadas, 6 documentadas  
   Solución: Documentación completa de todas las funciones  
   Archivo: Storage_Pwa.js

9. **Llegadas.js versión antigua documentada**  
   Problema: MD decía 9 columnas, realidad 13 con milésimas  
   Solución: Actualizar a v3.2.1 (posiciones automáticas, PDF profesional)  
   Archivo: Llegadas.js

10. **✅ LOGS EXCESIVOS EN CONSOLA (v3.3.3)**  
    Problema: 100+ líneas de logs, 80% redundantes  
    Solución: Sistema de logging por niveles con inicialización agrupada  
    Archivo: Main.js - Sistema optimizado de logging

11. **Campo de posición no permitía borrar completamente en modal de añadir corredor**  
    Problema: En el modal "Añadir Corredor", cuando se seleccionaba "Posición específica", el campo mostraba un valor por defecto (ej: "26") y no se podía borrar completamente. Solo se podía borrar el último dígito, no el primero.  
    Solución implementada (v3.3.4+):  
    ```javascript
    // 1. HTML limpio (sin atributos problemáticos)
    // 2. Limpieza agresiva después de crear el modal
    // 3. Validación manual con JavaScript
    // 4. Teclado permisivo
    ```  
    Regla de oro añadida: ✅ Nunca usar pattern="[0-9]*" en campos type="text" que necesiten permitir borrado completo

12. **Problema de modales duplicados al eliminar orden de salida**  
    Problema: Al hacer clic en "Eliminar Orden de Salida", aparecía el modal de confirmación dos veces.  
    Causa raíz: Configuración duplicada del botón #delete-order-btn  
    Solución: Eliminar configuración duplicada y centralizar en una función  
    Regla de oro añadida: ✅ Un botón, un configurador; ✅ Evitar configuraciones duplicadas

13. **✅ Contador de llegadas no se actualizaba al cambiar de carrera (v3.4.1)**  
    Problema: El contador "Llegadas Registradas - X de Y Corredores" no se actualizaba al cambiar de carrera.  
    Solución: Mejorar obtención de datos y llamar función al cambiar carrera

14. **✅ Botón de minimizar en cronómetro de llegadas mal posicionado (v3.4.2)**  
    Problema: Los card-header-controls estaban FUERA del card-header.  
    Solución: Corregir estructura HTML (controles DENTRO de cabecera)

15. **✅ Reloj "Hora del Sistema" no se actualizaba en tarjeta de cuenta atrás (v3.4.2)**  
    Problema: El elemento #current-system-time no recibía actualizaciones.  
    Solución: Añadir elemento a updateAllSystemClocks()

16. **✅ Celdas Excel con 00:00:00 para tiempos sin valor (v3.4.5)**  
    Problema: En exportación Excel, campos de tiempo sin valor mostraban 00:00:00 o --:--:--.  
    Solución: Crear formatTimeForExcel() que devuelve cadena vacía para tiempos sin valor  
    Regla de oro añadida: ✅ Celdas vacías en Excel: Para tiempos sin valor, dejar celda vacía (no 00:00:00)

---

## 12. CHECKLIST PARA CAMBIOS ⭐

### ANTES de modificar:
- Identificar módulos afectados (usar Mapa de Módulos)
- Verificar dependencias cruzadas
- Revisar Reglas de Oro relevantes
- Comprobar si afecta a traducciones (4 idiomas)
- ✅ Configurar nivel de log apropiado (DEBUG para desarrollo, INFO para producción)
- ✅ Verificar si afecta a selección por click en tablas (para eliminación de corredores)

### DURANTE modificación:
- Usar funciones centralizadas (ej: timeToSeconds() de Utilidades.js)
- Aplicar throttling adecuado (3 niveles)
- Preservar campos _Real e _Importado
- Mantener estructura 22 columnas para Excel de salidas
- ✅ Usar sistema de logging optimizado (log() con niveles)
- ✅ Agrupar configuraciones cuando sea posible
- ✅ Usar callIfFunction() para manejo elegante de funciones faltantes
- ✅ Para campos numéricos de texto: NO usar pattern, max, min; validar con JS
- ✅ Verificar duplicación de event listeners en botones
- ✅ Actualizar contador de llegadas si afecta a llegadasState
- ✅ Verificar tiempo compacto si modifica cronómetro de llegadas
- ✅ Usar formatTimeForExcel() para campos de tiempo en exportaciones
- ✅ Usar clonación para evitar listeners duplicados en botones
- ✅ Mantener validación de selección clara para usuario (especialmente eliminación)

### DESPUÉS de modificar:
- Probar en múltiples navegadores
- Verificar responsividad (4 breakpoints)
- Comprobar traducciones (4 idiomas)
- Validar importación/exportación Excel
- Probar cuenta atrás (compensación 1s)
- Verificar sincronización dorsal↔posición
- Probar modo llegadas (milésimas, posiciones)
- ✅ Verificar logs en consola (solo información necesaria)
- ✅ Probar inicialización optimizada (resumen claro, no logs excesivos)
- ✅ Probar campos de texto numéricos permiten borrado completo
- ✅ Verificar que botones no abran múltiples modales
- ✅ Probar contador de llegadas se actualiza correctamente
- ✅ Probar tiempo compacto al minimizar cronómetro
- ✅ Probar exportación Excel con tiempos vacíos (celdas vacías)
- ✅ Probar selección por click en diferentes filas (eliminación corredores)
- ✅ Verificar recálculo automático de tiempos posteriores (eliminación)
- ✅ Confirmar que traducciones funcionan en 4 idiomas para nuevos textos

### SI hay errores:
- Revisar Lecciones Aprendidas (problemas similares)
- Usar funciones diagnóstico (diagnoseCurrentState())
- Verificar consola JavaScript con nivel DEBUG
- Comprobar localStorage (datos corruptos)
- ✅ Usar callIfFunction() para identificar funciones faltantes
- ✅ Verificar atributos HTML en campos problemáticos
- ✅ Verificar duplicación de event listeners
- ✅ Verificar formatTimeForExcel() para tiempos en Excel

---

## 13. CAMBIOS v3.4.2 - v3.4.5+ ⭐

### v3.4.2 - Posición por Categoría y Mejoras UI
1. **Posición por Categoría (3.3.4)**  
   Columna nueva: "Pos. Cat." (posición 7, después de Apellidos)  
   Función: `calcularPosicionesPorCategoria()` - Calcula posiciones dentro de cada categoría  
   Actualizado en: Tabla, Excel, PDF de clasificación  
   Traducciones: `posCatHeader`, `posCatHeaderTooltip` en 4 idiomas

2. **Contador Dinámico de Llegadas (3.4.1)**  
   Formato: "Llegadas Registradas - X de Y Corredores"  
   Función: `actualizarContadorLlegadas()` - Se llama en 5 puntos críticos  
   Elemento HTML: `#llegadas-list-counter`  
   Traducciones: `llegadasListTitle`, `llegadasCounterTemplate` en 4 idiomas

3. **Tiempo Compacto al Minimizar (3.4.2)**  
   Funcionalidad: Al minimizar cronómetro, muestra tiempo en cabecera  
   Elemento HTML: `#llegadas-timer-compact`  
   Funciones nuevas:  
   - `updateLlegadasCompactTimer()` - Actualiza tiempo  
   - `setupCompactTimerUpdates()` - Configura intervalo  
   - `updateInitialCompactTimerState()` - Estado inicial

4. **Corrección de Relojes del Sistema (3.4.2)**  
   Problema: `#current-system-time` no se actualizaba  
   Solución: `updateSystemTimeDisplay()` actualiza múltiples elementos  
   Función alternativa: `updateAllSystemClocks()` para sincronización completa

### v3.4.5 - Exportación Excel Mejorada
5. **Celdas Vacías para Tiempos sin Valor (3.4.5)**  
   Problema: Excel mostraba 00:00:00 o --:--:-- para tiempos sin valor  
   Solución: `formatTimeForExcel()` - Devuelve cadena vacía para:  
   - null / undefined / ''  
   - '--:--:--' / '--:--' / '--'  
   - '00:00:00' (excepto primer corredor)  
   Uso: En `exportLlegadasToExcel()` para cronoSalida, horaLlegada, horaSalida

6. **Exportación Excel Unificada (3.4.5)**  
   Eliminada: `exportRankingToExcel()` - Función redundante  
   Unificada: `exportLlegadasToExcel()` ahora sirve para:  
   - Exportar todas las llegadas (tabla principal)  
   - Exportar clasificación (desde modal)  
   - Incluye posición por categoría  
   - Celdas vacías para tiempos sin valor  
   Botones actualizados: "Exportar Excel" en modal clasificación ahora llama a `exportLlegadasToExcel()`

### v3.4.5+ - Eliminación de Corredores con Recalculo Automático (NUEVO)
7. **Nuevo botón "Eliminar Corredor"** en orden de salida  
8. **Selección por click** en fila de tabla (estilo visual con borde rojo)  
9. **Validación completa**: Mensaje "Has de seleccionar un corredor" si no hay selección  
10. **Recálculo automático**: Tiempos de corredores posteriores se actualizan automáticamente  
11. **Persistencia inmediata**: Cambios se guardan automáticamente  
12. **Traducciones completas**: 5 nuevas claves por idioma para mensajes y botón

**Archivos Modificados:**
| Archivo | Cambios Principales | Versión |
|---------|-------------------|---------|
| HTML principal | Botón añadido en bloque de botones | 3.4.5+ |
| Salidas_3.js | Función `deleteSelectedRider()` nueva | 3.4.5+ |
| Traducciones.js | 5 nuevas claves por idioma (eliminación corredores) | 3.4.5+ |
| CSS | Estilo para filas seleccionadas | 3.4.5+ |
| Llegadas.js | Posición por categoría, contador llegadas, tiempo compacto, exportación unificada | 3.4.5 |
| UI.js | setupCardToggles() actualizado, funciones tiempo compacto | 3.4.2 |

**Reglas de Oro Añadidas:**
- ✅ **CONTADOR DE LLEGADAS DINÁMICO**: Siempre mostrar "Llegadas Registradas - X de Y Corredores"
- ✅ **TIEMPO COMPACTO EN MINIMIZAR**: Al minimizar cronómetro, mostrar tiempo en cabecera
- ✅ **POSICIÓN POR CATEGORÍA**: Calcular y mostrar posición dentro de cada categoría
- ✅ **MÚLTIPLES RELOJES SINCRONIZADOS**: Todos los relojes del sistema deben actualizarse juntos
- ✅ **CELDAS VACÍAS EN EXCEL**: Para tiempos sin valor, dejar celda vacía (no 00:00:00)
- ✅ **EXPORTACIÓN EXCEL UNIFICADA**: Usar `exportLlegadasToExcel()` para todas las exportaciones Excel
- ✅ **SELECCIÓN CLARA PARA ELIMINACIÓN**: Para eliminar corredor, requerir selección explícita (click en fila) con feedback visual

**Lecciones Aprendidas Añadidas:**
- ✅ Contador de llegadas no se actualizaba al cambiar de carrera
- ✅ Botón de minimizar en cronómetro de llegadas mal posicionado
- ✅ Reloj "Hora del Sistema" no se actualizaba en tarjeta de cuenta atrás
- ✅ Celdas Excel con 00:00:00 para tiempos sin valor
- ✅ Eliminación de corredores con recálculo automático implementada correctamente

**Resultados v3.4.5+:**
- **Usabilidad mejorada**: Información más completa al instante
- **Profesionalidad**: Posición por categoría para organizadores
- **Eficiencia**: Tiempo visible incluso minimizado, eliminación rápida de corredores
- **Consistencia**: Todos los relojes sincronizados
- **Calidad datos**: Excel más limpio (sin 00:00:00 falsos)
- **Mantenibilidad**: Código más simple (una función para exportación, lógica clara de eliminación)
- **Internacionalización**: Nuevos textos traducidos a 4 idiomas

---

## 📞 CONTACTO RÁPIDO ENTRE MÓDULOS

**Cuando Main.js necesita:**
- Datos carrera → Storage_Pwa.js: `loadRaceData()`, `saveRaceData()`
- Actualizar UI → UI.js: `updateSystemTimeDisplay()`, `showMessage()`
- Traducciones → Traducciones.js: `updateLanguageUI()`
- Audio → Utilidades.js: `playSound()`, `playVoiceAudio()`

**Cuando UI.js necesita:**
- Iniciar countdown → Cuenta_Atras.js: `startCountdown()`
- Cambiar modo → Llegadas.js: `initLlegadasMode()`
- Gestión carreras → Storage_Pwa.js: `createNewRace()`, `deleteCurrentRace()`
- Importar datos → Salidas_1.js: `importStartOrder()`
- Contador llegadas → Llegadas.js: `actualizarContadorLlegadas()`

**Cuando Llegadas.js necesita:**
- Actualizar contador → UI.js: `actualizarContadorLlegadas()` (en sí mismo)
- Actualizar tiempo compacto → UI.js: `updateLlegadasCompactTimer()`
- Traducciones → Traducciones.js: `llegadasListTitle`, `llegadasCounterTemplate`

**Cuando Storage_Pwa.js es llamado por:**
- Todos los módulos (persistencia centralizada)
- Especialmente: Salidas_*.js, Cuenta_Atras.js, Llegadas.js

**Cuando Salidas_3.js necesita:**
- Recalcular tiempos → Salidas_4.js: `recalculateAllStartTimes()`
- Actualizar tabla → Salidas_2.js: `updateStartOrderTableThrottled()`
- Guardar datos → Storage_Pwa.js: `saveStartOrderData()`

---

## ⚡ REFERENCIA ULTRA-RÁPIDA

**"Necesito modificar X, ¿qué archivo pido?"**

| Cambio | Archivo Principal | Archivos Secundarios |
|--------|------------------|---------------------|
| Importación/Exportación Excel | Salidas_1.js | Utilidades.js, Traducciones.js |
| Interfaz tabla, edición | Salidas_2.js | Salidas_3.js, Salidas_4.js |
| **Modales, añadir/eliminar corredores** | **Salidas_3.js** | **UI.js, Storage_Pwa.js, Salidas_4.js** |
| Validaciones, confirmaciones | Salidas_4.js | Utilidades.js |
| Cuenta atrás, salidas | Cuenta_Atras.js | Utilidades.js, Storage_Pwa.js, Salidas_2.js |
| Interfaz general, tarjetas | UI.js | Main.js, Storage_Pwa.js |
| Persistencia, backup, carreras | Storage_Pwa.js | UI.js, Main.js |
| Conversiones tiempo, audio, PDF | Utilidades.js | Traducciones.js |
| Textos, idiomas | Traducciones.js | UI.js, Main.js |
| Llegadas, clasificación | Llegadas.js | Utilidades.js, Traducciones.js |
| Estado global, PWA, logging | Main.js | UI.js, Storage_Pwa.js |
| ✅ Sistema de logging | Main.js | (centralizado) |
| ✅ Optimización consola | Main.js | (todos los módulos) |
| ✅ Validación campos numéricos | Salidas_3.js | UI.js |
| ✅ Configuración event listeners | UI.js / Salidas_1.js | Main.js |
| ✅ Posición por categoría | Llegadas.js | Traducciones.js |
| ✅ Contador de llegadas | Llegadas.js, UI.js | Traducciones.js |
| ✅ Tiempo compacto cronómetro | UI.js | Llegadas.js |
| ✅ Exportación Excel unificada | Llegadas.js | Traducciones.js |
| ✅ Celdas vacías en Excel | Llegadas.js | (formato interno) |
| ✅ Eliminación de corredores | Salidas_3.js | Salidas_4.js, UI.js, Traducciones.js |

---

## 🎯 RESUMEN DE CAMBIOS v3.4.2 - v3.4.5+

### Mejoras principales:
✅ **Posición por categoría**: Nueva columna en llegadas, Excel y PDF  
✅ **Contador dinámico de llegadas**: "Llegadas Registradas - X de Y Corredores"  
✅ **Tiempo compacto al minimizar**: Cronómetro muestra tiempo en cabecera  
✅ **Corrección relojes sistema**: Todos los relojes sincronizados  
✅ **Botones minimizar corregidos**: Estructura HTML correcta  
✅ **Celdas vacías en Excel**: Tiempos sin valor → celdas vacías (no 00:00:00)  
✅ **Exportación Excel unificada**: Una función para todas las exportaciones  
✅ **⭐ NUEVO: Eliminación de corredores**: Botón con selección por click y recálculo automático  

### Nuevas funciones v3.4.5+:
- `deleteSelectedRider()` - Elimina corredor seleccionado con validación
- `setupDeleteRiderButtonDirect()` - Configura botón eliminación
- `calcularPosicionesPorCategoria()` - Posiciones dentro de categorías
- `actualizarContadorLlegadas()` - Actualiza contador dinámico
- `updateLlegadasCompactTimer()` - Tiempo en cabecera minimizada
- `setupCompactTimerUpdates()` - Intervalo para tiempo compacto
- `updateAllSystemClocks()` - Sincroniza múltiples relojes
- `formatTimeForExcel()` - Celdas vacías para tiempos sin valor

### Funciones eliminadas:
❌ `exportRankingToExcel()` - Redundante, reemplazada por `exportLlegadasToExcel()`

### Nuevas traducciones:
- `deleteRiderText` - Texto del botón eliminar
- `deleteRiderNoSelection` - Mensaje si no hay selección
- `deleteRiderConfirm` - Confirmación de eliminación
- `deleteRiderNotFound` - Corredor no encontrado
- `deleteRiderSuccess` - Éxito en eliminación
- `llegadasListTitle` - Título de tarjeta de llegadas
- `llegadasCounterTemplate` - Plantilla para contador "{x} de {y}"
- `posCatHeader` - Cabecera "Pos. Cat."
- `posCatHeaderTooltip` - Tooltip explicativo

### Reglas de oro añadidas:
- Contador de llegadas dinámico
- Tiempo compacto en minimizar
- Posición por categoría
- Múltiples relojes sincronizados
- Celdas vacías en Excel
- Exportación Excel unificada
- **Selección clara para eliminación**

### Resultados finales:
- **Usabilidad mejorada**: Información más completa al instante
- **Profesionalidad**: Posición por categoría para organizadores
- **Eficiencia**: Tiempo visible incluso minimizado, eliminación rápida
- **Consistencia**: Todos los relojes sincronizados
- **Calidad datos**: Excel más limpio (sin 00:00:00 falsos)
- **Mantenibilidad**: Código más simple y lógica clara
- **Internacionalización**: Nuevos textos traducidos a 4 idiomas
- **Robustez**: Validación completa en eliminación de corredores

---

**Documentación optimizada para modificaciones - v3.4.5+**  
Caracteres: ~45,200 (incluye todas las mejoras)  
Cobertura: 100% funcionalidades necesarias para programar  
Última actualización: Enero 2026

✅ **Listo para recibir solicitudes de modificación.**  
Solo dime: "Quiero cambiar [X]" y te pediré los archivos necesarios.