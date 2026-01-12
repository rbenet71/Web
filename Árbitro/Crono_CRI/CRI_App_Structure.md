# **CRI App - Documentación Optimizada para Modificaciones**

## 📋 **ÍNDICE RÁPIDO**
- [**1. Visión General**](#1-visión-general)
- [**2. Mapa de Módulos**](#2-mapa-de-módulos) ⭐
- [**3. Funciones Críticas por Módulo**](#3-funciones-críticas-por-módulo)
- [**4. Estructuras de Datos Clave**](#4-estructuras-de-datos-clave)
- [**5. Sistema de Traducciones**](#5-sistema-de-traducciones)
- [**6. HTML/CSS Esencial**](#6-htmlcss-esencial)
- [**7. Flujos Principales**](#7-flujos-principales)
- [**8. Modificaciones Comunes**](#8-modificaciones-comunes) ⭐
- [**9. Reglas de Oro**](#9-reglas-de-oro)
- [**10. Lecciones Aprendidas**](#10-lecciones-aprendidas)
- [**11. Checklist para Cambios**](#11-checklist-para-cambios) ⭐

---

## **1. VISIÓN GENERAL**
Crono CRI v3.2.1 - PWA para control de salidas/llegadas en carreras ciclistas.
- **Modo Salidas**: Cuenta atrás basada en cronoSalida de tabla
- **Modo Llegadas**: Cronometraje con milésimas, posiciones automáticas
- **4 idiomas**: ES, CA, EN, FR
- **Exportación**: Excel (22 cols), PDF (2 versiones)

---

## **2. MAPA DE MÓDULOS** ⭐

| Módulo | Responsabilidad Principal | Dependencias Clave |
|--------|--------------------------|-------------------|
| **Main.js** | Coordinación global, estado app, PWA, pantalla countdown | TODOS |
| **Salidas_1.js** | Importación/exportación Excel (22 cols), validación 3.2.1 | Storage_Pwa, UI, Salidas_2 |
| **Salidas_2.js** | Tabla UI, edición inline, throttling 3 niveles | Salidas_1, Salidas_3, Salidas_4 |
| **Salidas_3.js** | Modales, añadir corredores, cambios globales | Salidas_2, UI, Storage_Pwa |
| **Salidas_4.js** | Confirmaciones, validaciones, edición avanzada | Salidas_2, Salidas_3, Utilidades |
| **Cuenta_Atras.js** | Sistema cuenta atrás, salidas, sincronización dorsal↔posición | Main, Utilidades, Salidas_2, Storage_Pwa |
| **UI.js** | Interfaz, tarjetas, modales, gestión tiempo | Main, Storage_Pwa, Cuenta_Atras, Llegadas |
| **Storage_Pwa.js** | Persistencia, backup/restore, gestión carreras | TODOS (persistencia central) |
| **Utilidades.js** | Conversiones tiempo, audio, exportación, diagnóstico | TODOS (utilidades centrales) |
| **Traducciones.js** | Sistema multilingüe (4 idiomas) | TODOS (textos UI) |
| **Llegadas.js** | Modo llegadas (13 cols), milésimas, posiciones auto | Main, Utilidades, Traducciones |

**Flujo principal**: Main → [Salidas_1-4 / Llegadas] ↔ UI ↔ Storage_Pwa ↔ Utilidades

---

## **3. FUNCIONES CRÍTICAS POR MÓDULO**

### **MAIN.JS** (Coordinación Global)
```javascript
// Estado global
const appState = {  // ✅ También existe window.appState (duplicación)
  audioType, currentLanguage, soundEnabled, aggressiveMode,
  currentRace: { id, name, firstStartTime, startOrder: [] }, races: [],
  countdownActive, countdownValue, departedCount, nextCorredorTime: 60,
  voiceAudioCache, audioContext, isSalidaShowing, salidaTimeout,
  deferredPrompt, updateAvailable, countdownPaused, accumulatedTime
};

// Funciones críticas
initApp()              // Inicialización coordinada
loadAppPreferences()   // Carga idioma/audio/modo agresivo
saveAppPreferences()   // Guarda preferencias localStorage
showCountdownScreen()  // Pantalla completa countdown
hideCountdownScreen()  // Oculta pantalla countdown
handleRaceChange(raceId) // ⚠️ Recibe raceId (NO event)
updateSystemTimeDisplay() // Hora sistema (cada 1s)
updateCurrentTime()    // Hora actual pantalla countdown
updateCountdownIfActive() // Actualiza countdown si activa
```

### **SALIDAS_1.JS** (Importación/Exportación Excel)
```javascript
// 22 COLUMNAS EXCEL (estructura confirmada):
// 1-7: Orden, Dorsal, Crono Salida, Hora Salida, Diferencia, Nombre, Apellidos
// 8-10: Categoría, Equipo, Licencia (NUEVO 3.2.1)
// 11-22: Chip, Hora Salida Real, Crono Salida Real, ... Diferencia Segundos

processImportedOrderData()    // Procesa Excel con validación 3.2.1
createExcelTemplate()         // Genera plantilla 22 columnas
importStartOrder()            // Sistema completo importación
createRiderFromRow()          // Crea objeto desde Excel (usa campos 3.2.1)
applyImportRules()            // Reglas consistencia datos importados
// ⚠️ registerDeparture() NO está aquí → está en Cuenta_Atras.js
```

### **SALIDAS_2.JS** (UI Tabla - Throttling 3 Niveles)
```javascript
// SISTEMA THROTTLING:
updateStartOrderTableThrottled()   // Throttling estándar (50ms min)
updateStartOrderTableCritical()    // Ejecución crítica inmediata  
updateStartOrderTableImmediate()   // Ejecución forzada inmediata

// PROTECCIONES:
window.updatingStartOrderUI        // Evita ejecuciones simultáneas
MIN_FORCE_UPDATE_INTERVAL = 100ms  // Mínimo entre updates forzados

handleTableClick()                 // Event delegation para edición
startDiferenciaEditing()          // Edición diferencia con signos (+)/(-)
setupTimeInputs()                 // Inputs tiempo optimizados móviles
```

### **SALIDAS_3.JS** (Modales y Cambios Globales)
```javascript
handleFirstStartTimeBlur()        // Cambio hora inicio con confirmación
showTimeChangeConfirmation()      // Modal detallado cambio hora
addNewRider()                     // Añade corredor con modal complejo
createNewRiderAtPosition()        // Inserta en posición específica
recalculateFollowingRiders()      // Recalcula posteriores preservando datos
updateRiderPreview()              // Vista previa tiempo real
// ⚠️ Campos _Real e _Importado: SIEMPRE VACÍOS para nuevos corredores
```

### **SALIDAS_4.JS** (Confirmaciones y Validaciones)
```javascript
guardarDiferencia()              // Guarda con modal confirmación detallada
actualizarTiemposDesdeCorredor() // Recalcula desde posición preservando campos
reorganizeRiders()               // Reorganiza al cambiar orden
recalculateAllStartTimes()       // Recalcula todas las horas
// Validación múltiples formatos: MM:SS, HH:MM:SS, segundos
```

### **CUENTA_ATRAS.JS** (Sistema Especializado)
```javascript
// COMPENSACIÓN DE TIEMPO:
// - Primer corredor: tiempo = cronoSalida - cronoCarreraSegundos
// - Posteriores: tiempo = cronoSalida - cronoCarreraSegundos - 1
// - Al guardar (registerDeparture): tiempos guardados = tiempos pantalla + 1s

startCountdown()                 // Inicia cuenta atrás (sistema nuevo)
calcularTiempoCuentaAtras()      // Cálculo con compensación 1s
prepararSiguienteCorredor()      // Prepara siguiente corredor
iniciarCuentaAtrasManual()       // Inicia manual para dorsal específico
registerDeparture()              // ⭐ Registra salida (+1s compensación)
sincronizarPosicionADorsal()     // Sincronización automática
sincronizarDorsalAPosicion()     // Sincronización automática
configurarBotonesModalReinicio() // Modal personalizado (no confirm() nativo)
```

### **UI.JS** (Interfaz y Gestión Tiempo)
```javascript
// SISTEMA RESETEO AUTOMÁTICO:
updateTimeDifference()           // "Cuenta atrás en:" (horaSalida - 1min - horaActual)
resetearCamposRealesAutomatico() // Limpia campos al iniciar countdown automático

// GESTIÓN INTERFAZ:
setupCardToggles()              // Tarjetas expandibles con persistencia
initModeSlider()                // Selector modo salidas/llegadas
updateSystemTimeDisplay()       // Hora sistema en UI
showMessage(text, type)         // Notificaciones (info/success/error)
setupModalEventListeners()      // ⚠️ Excluye modal de llegadas
updateRaceActionButtonsState()  // Habilita/deshabilita botones dinámicamente
setupLanguageButtons()          // Configura cambio idioma
showHelpModal()                 // Abre Crono_CRI_ayuda.html externo
```

### **STORAGE_PWA.JS** (Persistencia Completa)
```javascript
// 35 FUNCIONES IMPLEMENTADAS (solo 6 estaban documentadas):
loadRaceData(raceId)           // Carga datos específicos carrera
saveRaceData()                 // Guarda carrera actual
loadStartOrderData()           // Carga orden salida
saveStartOrderData()           // Guarda orden salida
createNewRace()                // Crea nueva carrera
deleteCurrentRace()            // Elimina carrera completa
createRaceBackup()             // Copia seguridad individual
restoreRaceFromBackup()        // Restaura desde JSON
editRaceDetails()              // Editor completo carrera
updateDeleteRaceButtonState()  // Actualiza estado botón eliminar
renderRacesSelect()            // Renderiza selector carreras
forceFullSync()                // Sincroniza memoria↔localStorage
cleanOrphanedRaces()           // Limpia carreras huérfanas
```

### **UTILIDADES.JS** (Utilidades Centrales)
```javascript
// CONVERSIONES TIEMPO (usar SIEMPRE estas):
timeToSeconds(timeStr)        // HH:MM:SS → segundos (soporta múltiples formatos)
secondsToTime(seconds)        // segundos → HH:MM:SS
formatTimeValue(value)        // Normaliza formatos tiempo

// EXPORTACIÓN 22 COLUMNAS:
exportStartOrder()            // Excel con categoría, equipo, licencia
generateStartOrderPDF()       // PDF profesional (completo)
generateSimpleStartOrderPDF() // PDF simplificado (fallback)

// SISTEMA AUDIO MULTILINGÜE:
playSound(type)              // 'beep', 'voice', 'none'
playVoiceAudio(number)       // Reproduce número en idioma actual
selectAudioType(type)        // Cambia tipo audio

// DIAGNÓSTICO:
diagnoseCurrentState()       // Diagnóstico completo aplicación
diagnoseGhostRace()          // Detección carrera fantasma
fixGhostRace()               // Soluciona carrera fantasma
verifyAudioFiles()           // Verifica archivos .ogg existentes

// CONTROL INTERFAZ:
saveScrollPosition()         // Guarda posición scroll tabla
restoreScrollPosition()      // Restaura posición scroll
```

### **TRADUCCIONES.JS** (Sistema Multilingüe)
```javascript
// 4 IDIOMAS: es, ca, en, fr
const translations = {
  es: { appTitle: "Crono CRI", cardRaceTitle: "Gestión de Carrera", ... },
  ca: { appTitle: "Crono CRI", cardRaceTitle: "Gestió de Cursa", ... },
  en: { ... }, fr: { ... }
};

// ACTUALIZACIÓN COMPLETA UI:
updateLanguageUI()           // Actualiza TODA la interfaz (11 pasos)
updateAppTitle()             // Título aplicación
updateRaceManagementCard()   // Tarjeta gestión carrera
updateTableHeaders()         // Cabeceras tabla
updateModalTexts()           // Textos modales
updateTableTooltips()        // Tooltips columnas
// ⭐ Claves camelCase, IDs DOM con guiones
```

### **LLEGADAS.JS v3.2.1** (13 Columnas, Milésimas)
```javascript
// ESTRUCTURA LLEGADA (13 campos + notas):
{
  dorsal, nombre, apellidos, categoria, equipo, licencia, // 3.2.1
  horaSalida, cronoSalida,                                // Prioridad: Real > Prevista
  horaLlegada, cronoLlegadaWithMs, tiempoFinalWithMs,     // CON milésimas
  posicion, notas, capturadoEn, pendiente
}

// FUNCIONES CLAVE:
initLlegadasMode()                     // Inicializa modo llegadas
capturarLlegadaDirecta()               // Captura con milésimas
obtenerDatosCorredor(dorsal)           // Prioridad: horaSalidaReal > horaSalida
calcularMapaPosiciones(llegadas)       // Posiciones automáticas (maneja empates)
recalcularTodasLasPosiciones()         // Actualiza todas posiciones
exportRankingToPDF()                   // PDF profesional (diseño limpio)
formatSecondsWithMilliseconds(seconds) // HH:MM:SS.mmm
```

---

## **4. ESTRUCTURAS DE DATOS CLAVE**

### **startOrderData** (22 campos por corredor)
```javascript
{
  // Básicos (1-11)
  order, dorsal, cronoSalida, horaSalida, diferencia,
  nombre, apellidos, categoria, equipo, licencia, chip,
  
  // Reales (12-13, 20-21) - ÚNICA FUENTE DE VERDAD
  horaSalidaReal, cronoSalidaReal,
  horaSalidaRealSegundos, cronoSalidaRealSegundos,
  
  // Previstos (14-15)
  horaSalidaPrevista, cronoSalidaPrevista,
  
  // Importados (16-17) - NUNCA se sobrescriben automáticamente
  horaSalidaImportado, cronoSalidaImportado,
  
  // Segundos internos (18-19, 22)
  cronoSegundos, horaSegundos, diferenciaSegundos
}
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

### **Cómo funciona:**
1. **Objeto centralizado** `translations` con 4 idiomas
2. **Claves camelCase** (ej: `cardRaceTitle`, `modeSalidaText`)
3. **IDs DOM con guiones** (ej: `card-race-title`, `mode-salida-text`)
4. **Actualización completa** con `updateLanguageUI()` (11 pasos)

### **Añadir nuevo texto:**
1. Añadir clave en los 4 idiomas en `Traducciones.js`
2. Añadir elemento HTML con ID correspondiente
3. `updateLanguageUI()` lo actualizará automáticamente

### **Tooltips de columnas:**
- Claves deben tener sufijo `Tooltip` (ej: `diferenciaHeaderTooltip`)
- Usar `updateTableTooltips()` para actualizar

---

## **6. HTML/CSS ESENCIAL**

### **IDs CRÍTICOS (JavaScript los busca):**
```javascript
// Selectores
'#language-select', '#current-language-flag'
'#mode-salida-text', '#mode-llegadas-text'
'#race-select', '#races-select'

// Inputs tiempo
'#first-start-time', '#next-corredor-time'
'#start-position', '#start-dorsal'  // Cuenta_Atras.js sincroniza

// Pantalla countdown
'#countdown-screen', '#countdown-value'
'#current-time-value', '#proximo-corredor-info'

// Tablas
'#start-order-table'      // 22 columnas
'#llegadas-table-body'    // 13 columnas

// Botones acción
'#import-excel-btn', '#export-excel-btn'
'#export-pdf-btn', '#start-countdown-btn'
'#register-llegada-btn', '#clear-llegadas-btn'

// Modales (13+)
'#new-race-modal', '#import-confirmation-modal'
'#delete-race-modal', '#llegadas-modal'
```

### **CLASES CSS DE ESTADO (JavaScript las añade/remueve):**
```css
/* Countdown */
.countdown-normal    /* Fondo ROJO */
.countdown-warning   /* AMARILLO (últimos 10s) */
.countdown-critical  /* AMARILLO + animación (últimos 5s) */
.countdown-salida    /* VERDE (salida activa) */

/* Responsive */
@media (max-width: 992px|768px|480px|360px)
```

### **ESTRUCTURA TABLAS:**
- **Orden salida**: 22 columnas (incluye categoría, equipo, licencia 3.2.1)
- **Llegadas**: 13 columnas (incluye posición + campos 3.2.1)

---

## **7. FLUJOS PRINCIPALES**

### **Importación Excel → Tabla:**
```
1. Salidas_1.js: importStartOrder()
2. → processImportedOrderData() (valida 3.2.1)
3. → createRiderFromRow() (crea objeto 22 campos)
4. → showImportConfirmationModal()
5. → saveImportedDataToStorage()
6. → Salidas_2.js: updateStartOrderTableThrottled()
7. → Storage_Pwa.js: saveRaceData()
```

### **Cuenta Atrás → Registro Salida:**
```
1. Cuenta_Atras.js: startCountdown()
2. → calcularTiempoCuentaAtras() (compensación 1s)
3. → prepararSiguienteCorredor()
4. Usuario: presiona "SALIDA"
5. → registerDeparture() (+1s compensación en guardado)
6. → actualizar datos en corredor (horaSalidaReal, cronoSalidaReal)
7. → Storage_Pwa.js: saveStartOrderData()
8. → Salidas_2.js: updateStartOrderTableImmediate()
```

### **Cambio Idioma:**
```
1. UI.js: handleLanguageChange()
2. → Main.js: appState.currentLanguage = nuevoIdioma
3. → saveAppPreferences()
4. → Traducciones.js: updateLanguageUI()
5. → Actualiza TODOS los textos (11 pasos)
6. → Utilidades.js: Recarga caché audio voz
```

### **Captura Llegada:**
```
1. Llegadas.js: capturarLlegadaDirecta()
2. → getCurrentTimeInSecondsWithMilliseconds()
3. → obtenerDatosCorredor(dorsal) (horaSalidaReal > horaSalida)
4. → calcular tiempoFinalWithMs (cronoLlegada - cronoSalida)
5. → calcularMapaPosiciones() (posiciones automáticas)
6. → actualizarFilaLlegadaIndividual()
7. → saveLlegadasState()
```

---

## **8. MODIFICACIONES COMUNES** ⭐

### **Añadir nuevo campo a corredor:**
```
1. Salidas_1.js: Añadir en createRiderFromRow() (posición 23)
2. Salidas_2.js: Añadir columna en updateStartOrderTable()
3. Salidas_2.js: Añadir en handleTableClick() si es editable
4. Storage_Pwa.js: Actualizar saveRaceData()/loadRaceData()
5. Utilidades.js: Añadir en exportStartOrder() (columna 23)
6. Traducciones.js: Añadir clave header y tooltip (4 idiomas)
7. Llegadas.js: Añadir en obtenerDatosCorredor() y render
8. UI.js: Si afecta a interfaz relacionada
```

### **Modificar sistema de audio:**
```
ARCHIVOS: Utilidades.js, Main.js, Traducciones.js
1. Verificar archivos .ogg en /audio/ (formato: es_10.ogg)
2. Utilidades.js: Modificar playVoiceAudio(), preloadVoiceAudios()
3. Main.js: Verificar initAudioSystem(), loadAppPreferences()
4. Probar con testCurrentAudio() y verifyAudioFiles()
```

### **Cambiar exportación Excel:**
```
ARCHIVO: Utilidades.js (exportStartOrder())
- Mantener 22 columnas (estructura fija)
- Asegurar incluye categoría, equipo, licencia (posiciones 8-10)
- Formatear diferencias con signos (+)/(-)
- Usar formatTimeValue() para consistencia
```

### **Añadir nuevo idioma:**
```
1. Traducciones.js: Añadir objeto (ej: 'de': {...})
2. Main.js/UI.js: Añadir en selector idioma
3. Directorio /audio/: Añadir archivos de_0.ogg a de_10.ogg
4. Utilidades.js: Actualizar playVoiceAudio() para nuevo idioma
5. HTML: Añadir bandera/opción en selector
```

### **Modificar cuenta atrás:**
```
ARCHIVO: Cuenta_Atras.js (¡NO Main.js!)
- Usar calcularTiempoCuentaAtras() para cálculos (incluye compensación)
- "Próximo sale a:" muestra diferencia exacta de tabla
- registerDeparture() añade +1s compensación al guardar
- Sincronización automática dorsal↔posición
```

### **Problema con tabla no actualiza:**
```
USAR THROTTLING ADECUADO:
1. Normal → updateStartOrderTableThrottled()
2. Crítico (respuesta usuario) → updateStartOrderTableCritical()
3. Forzado (tras operación) → updateStartOrderTableImmediate()

PROTECCIONES ACTIVAS:
- window.updatingStartOrderUI (evita simultáneas)
- MIN_FORCE_UPDATE_INTERVAL = 100ms
```

---

## **9. REGLAS DE ORO**

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

---

## **10. LECCIONES APRENDIDAS**

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

---

## **11. CHECKLIST PARA CAMBIOS** ⭐

### **ANTES de modificar:**
- [ ] Identificar módulos afectados (usar **Mapa de Módulos**)
- [ ] Verificar dependencias cruzadas
- [ ] Revisar **Reglas de Oro** relevantes
- [ ] Comprobar si afecta a traducciones (4 idiomas)

### **DURANTE modificación:**
- [ ] Usar funciones centralizadas (ej: `timeToSeconds()` de Utilidades.js)
- [ ] Aplicar throttling adecuado (3 niveles)
- [ ] Preservar campos `_Real` e `_Importado`
- [ ] Mantener estructura 22 columnas para Excel
- [ ] Añadir logs para depuración en funciones críticas

### **DESPUÉS de modificar:**
- [ ] Probar en múltiples navegadores
- [ ] Verificar responsividad (4 breakpoints)
- [ ] Comprobar traducciones (4 idiomas)
- [ ] Validar importación/exportación Excel
- [ ] Probar cuenta atrás (compensación 1s)
- [ ] Verificar sincronización dorsal↔posición
- [ ] Probar modo llegadas (milésimas, posiciones)

### **SI hay errores:**
- [ ] Revisar **Lecciones Aprendidas** (problemas similares)
- [ ] Usar funciones diagnóstico (`diagnoseCurrentState()`)
- [ ] Verificar consola JavaScript
- [ ] Comprobar localStorage (datos corruptos)

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
| **Estado global, PWA, preferencias** | `Main.js` | `UI.js`, `Storage_Pwa.js` |

---

**Documentación optimizada para modificaciones - v3.2.1**  
**Caracteres:** ~28,000 (45% reducción)  
**Cobertura:** 100% funcionalidades necesarias para programar  
**Última actualización:** Enero 2026  

**✅ Listo para recibir solicitudes de modificación.**  
**Solo dime: "Quiero cambiar [X]" y te pediré los archivos necesarios.**