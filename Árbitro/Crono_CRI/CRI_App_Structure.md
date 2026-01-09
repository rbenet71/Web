# CRI App Structure Documentation - COMPLETAMENTE ACTUALIZADO CON MÓDULO DE UTILIDADES

## Visión General
Crono CRI es una aplicación web progresiva (PWA) para el control de salidas y llegadas en carreras ciclistas y eventos deportivos. La aplicación proporciona un sistema completo de gestión de carreras con cuenta atrás visual, registro de salidas/llegadas, y funcionalidades de exportación.

## 📁 **ESTRUCTURA DE ARCHIVOS COMPLETA - ACTUALIZADA**

### **ARCHIVOS PRINCIPALES**

#### **1. Crono_CRI.html** - Punto de entrada principal
```
RESPONSABILIDADES:
- Estructura completa de la aplicación web
- Inclusión de todos los recursos (CSS, JS, bibliotecas)
- Definición de modales, tarjetas y componentes UI
- Metadatos para PWA y Google Analytics

ELEMENTOS CLAVE:
- Header con logo y selector de idioma (4 idiomas)
- Tarjetas de configuración de carrera
- Selector de modo Salida/Llegadas
- Tabla de orden de salida (19 columnas complejas)
- Pantalla de cuenta atrás en pantalla completa
- Footer con botones de utilidad
- 15+ modales para diversas funcionalidades
- Sistema de mensajes flotantes

DEPENDENCIAS EXTERNAS:
- Font Awesome 6.4.0 (iconos)
- XLSX 0.18.5 (exportación Excel)
- jsPDF 2.5.1 + AutoTable (exportación PDF)
- Google Analytics (G-CV925PMBQV)
```

#### **2. Crono_CRI.css** - Estilos principales (1738 líneas)
```
SECCIONES ORGANIZADAS:
1. RESET Y VARIABLES - Estilos base y variables CSS
2. ANIMACIONES - Todas las animaciones de la aplicación
3. HEADER - Logo, selector de idioma, ayuda
4. TARJETAS - Estructura común de tarjetas
5. SELECTOR DE MODO - Salida vs Llegadas
6. FORMULARIOS - Campos de entrada y etiquetas
7. BOTONES - Estilos generales y específicos
8. ORDEN DE SALIDA - Tabla compleja (19 columnas)
9. CUENTA ATRÁS - Pantalla completa con estados
10. MODO LLEGADAS - Cronómetro y tablas
11. FOOTER - Pie de página con utilidades
12. MODALES - 15+ ventanas emergentes
13. RESPONSIVE - 4 breakpoints específicos

CARACTERÍSTICAS:
- Sistema responsive (992px, 768px, 480px, 360px)
- Variables CSS para colores y constantes
- 4 estados de cuenta atrás con animaciones:
  * countdown-normal: Fondo ROJO
  * countdown-warning: Fondo AMARILLO (últimos 10s)
  * countdown-critical: AMARILLO + animación (últimos 5s)
  * countdown-salida: Fondo VERDE (salida activa)
```

### 📁 **MÓDULOS JAVASCRIPT - ESTRUCTURA COMPLETA REVISADA**

#### **3. Crono_CRI_js_Main.js** - Núcleo de la aplicación
```
RESPONSABILIDADES:
- Definición de estados globales de la aplicación
- Inicialización coordinada de todos los módulos
- Configuración de event listeners principales
- Gestión de dependencias y orden de inicialización
- Atajos de teclado globales

ESTADOS GLOBALES:
- appState: Estado principal (carrera, countdown, audio, etc.)
- llegadasState: Estado específico del módulo de llegadas
- sortState: Estado de ordenación de tablas
- startOrderData: Datos de orden de salida (array)

FUNCIONES CRÍTICAS:
- initApp(): Inicialización principal coordinada
- setupEventListeners(): Configura listeners globales
- setupStartOrderEventListeners(): Listeners específicos de orden
- handleRaceChange(): Gestor de cambio de carrera

DEPENDENCIAS:
- ← Todos los módulos dependen de Main.js
- → Todos los módulos son llamados desde aquí
- ↔ Storage_Pwa.js: Coordinación para persistencia
```

#### **MÓDULO DE SALIDAS (Completado - 4 partes)**

#### **4. Crono_CRI_js_Salidas_1.js** - Núcleo del módulo de salidas
```
RESPONSABILIDADES:
1. Sistema completo de cuenta atrás con sonidos y modos visuales
2. Gestión de salidas registradas (departures) con tabla ordenable
3. Sistema de intervalos múltiples para diferentes rangos de corredores
4. Plantillas Excel para orden de salida (generación e importación)
5. Procesamiento de datos importados con corrección de formatos
6. Funciones auxiliares de formato de tiempo para PDF/Excel

FUNCIONES CRÍTICAS:
- startCountdown() - Inicia cuenta atrás
- registerDeparture() - Registra salida de corredor
- processImportedOrderData() - Procesa Excel importado
- createExcelTemplate() - Genera plantilla Excel
- formatTimeForPDF() - Formatea tiempo para exportación
- createRiderFromRow() - Crea objeto corredor desde datos Excel

DEPENDENCIAS:
- ← Main.js: Recibe appState y traducciones
- → Salidas_2.js: Proporciona datos procesados
- → Storage_Pwa.js: Guarda datos de salidas
- → UI.js: Muestra mensajes de confirmación
```

#### **5. Crono_CRI_js_Salidas_2.js** - Sistema de edición y visualización
```
RESPONSABILIDADES:
1. Renderizado optimizado de tabla con sistema de throttling de 3 niveles
2. Sistema de eventos delegados para edición eficiente
3. Edición en línea de campos (dorsal, nombre, diferencia, etc.)
4. Gestión de diferencia con signos (+) y (-)
5. Inputs de tiempo mejorados para móviles
6. Ordenación de columnas con indicadores visuales

FUNCIONES CRÍTICAS:
- updateStartOrderTable() - Renderiza tabla principal
- handleTableClick() - Maneja clics para edición con sistema de logs mejorado
- startDiferenciaEditing() - Edición especial de diferencia
- setupTimeInputs() - Configura inputs de tiempo

SISTEMA DE THROTTLING DE 3 NIVELES:
1. updateStartOrderTableThrottled() - Throttling estándar (50ms mínimo)
2. updateStartOrderTableCritical() - Ejecución crítica inmediata
3. updateStartOrderTableImmediate() - Ejecución forzada inmediata

VARIABLES DE THROTTLING:
- updateStartOrderTablePending: Control de ejecución pendiente
- updateStartOrderTableTimeout: Control de timeout
- lastUpdateTime: Timestamp de última actualización
- UPDATE_THROTTLE_DELAY: 50ms (delay mínimo)

OPTIMIZACIONES:
✓ Throttling de 3 niveles para diferentes necesidades
✓ Event delegation para evitar múltiples listeners
✓ Validación en tiempo real de formatos
✓ Sistema de cancelación con Escape
✓ Sistema de logs detallado para depuración

DEPENDENCIAS:
- ← Salidas_1.js: Recibe datos procesados de importación
- → Salidas_3.js: Llama a recalculateFollowingRiders()
- → Salidas_4.js: Llama a guardarDiferencia() y actualizarTiemposDesdeCorredor()
- → Storage_Pwa.js: Guarda cambios en datos
```

#### **6. Crono_CRI_js_Salidas_3.js** - Gestión de cambios globales y modales
```
RESPONSABILIDADES:
1. Cambio de hora de inicio con confirmación modal detallada
2. Actualización en cascada de todas las horas de salida
3. Añadir corredores con modal de posición (principio, medio, final)
4. Vista previa en tiempo real de cambios con cálculo automático
5. Ordenación de tabla con indicadores visuales
6. Recálculo automático de corredores siguientes
7. Sistema de estilos dinámicos para modales

FUNCIONES CRÍTICAS:
- handleFirstStartTimeBlur() - Maneja cambio de hora inicial con validación
- showTimeChangeConfirmation() - Modal detallado para confirmar cambios
- addNewRider() - Añade nuevo corredor con modal complejo
- createNewRiderAtPosition() - Inserta corredor en posición específica
- recalculateFollowingRiders() - Recalcula corredores posteriores con preservación de datos
- updateRiderPreview() - Vista previa dinámica en tiempo real
- setupStartOrderTableSorting() - Configuración de ordenación de tabla

CARACTERÍSTICAS ÚNICAS DEL MODAL DE AÑADIR CORREDOR:
✓ Scroll independiente para formularios largos
✓ Vista previa en tiempo real de todos los campos
✓ Cálculo automático de horas basado en posición
✓ Preservación de campos reales e importados (SIEMPRE VACÍOS para nuevos)
✓ Validación de dorsal único
✓ Sistema de posiciones (principio, medio, final)

SISTEMA DE PRESERVACIÓN DE DATOS:
- Campos "horaSalidaImportado" y "cronoSalidaImportado": ✅ SIEMPRE VACÍOS para nuevos corredores
- Campos "horaSalidaReal" y "cronoSalidaReal": ✅ VACÍOS para nuevos corredores
- Campos "horaSalidaPrevista" y "cronoSalidaPrevista": Iguales a los principales

DEPENDENCIAS:
- ← Salidas_2.js: Recibe llamadas de edición
- → Salidas_4.js: Llama a reorganizeRiders()
- → UI.js: Usa funciones de modal y notificación
- → Storage_Pwa.js: Guarda datos actualizados
```

#### **7. Crono_CRI_js_Salidas_4.js** - Sistema avanzado de edición y confirmación de cambios
```
DESCRIPCIÓN: Módulo avanzado de edición con modal de confirmación para cambios críticos
RESPONSABILIDADES:
1. Modal de confirmación para cambios de diferencia con vista previa detallada
2. Sistema inteligente de validación de formatos de tiempo (MM:SS, HH:MM:SS, segundos)
3. Control de múltiples llamadas simultáneas para evitar duplicados
4. Preservación de campos reales e importados durante recálculos
5. Funciones auxiliares de conversión tiempo↔segundos mejoradas
6. Sistema de estilos dinámicos para modales de confirmación

FUNCIONES CRÍTICAS EXPORTADAS:
- guardarDiferencia() - Guarda diferencia con confirmación modal detallada
- actualizarTiemposDesdeCorredor() - Recalcula desde posición específica preservando campos importantes
- reorganizeRiders() - Reorganiza corredores al cambiar orden
- recalculateAllStartTimes() - Recalcula todas las horas
- startDiferenciaEditing() - Inicia edición de diferencia con control de duplicados

PROTECCIONES IMPLEMENTADAS:
✓ Modal de confirmación con vista previa detallada de cambios
✓ Validación de múltiples formatos de tiempo (MM:SS, HH:MM:SS, segundos)
✓ Control de signos (+) y (-) para diferencias
✓ Prevención de múltiples llamadas simultáneas (variable `guardando`)
✓ Preservación de campos _Real e _Importado durante recálculos
✓ Sistema de escape HTML para seguridad

SISTEMA DE MODAL DE CONFIRMACIÓN:
- Vista previa detallada: diferencia anterior vs nueva
- Listado de campos que se actualizarán
- Información de corredores afectados
- Opciones claras: "Sí, mantener cambio" / "No, descartar cambio"
- Estilos CSS dinámicos incluidos

FUNCIONES AUXILIARES IMPORTANTES:
- secondsToTime() - Convierte segundos a formato HH:MM:SS
- timeToSeconds() - Convierte formato tiempo a segundos (soporta múltiples formatos)
- validateTime() - Valida formatos de tiempo
- escapeHtml() - Previene ataques XSS
- formatTimeValue() - Normaliza formatos de tiempo

CARACTERÍSTICAS DE EDICIÓN MEJORADA:
✓ Input directo con validación en tiempo real
✓ Soporte para atajos: Enter (guardar), Escape (cancelar)
✓ Auto-guardado al perder foco
✓ Indicadores visuales de estado (editing, positivo, negativo)
✓ Control de duplicados con variable de estado

DEPENDENCIAS:
← Salidas_2.js: Recibe llamadas de startDiferenciaEditing()
← Salidas_3.js: Es llamado por recalculateFollowingRiders()
→ Todos: Proporciona funciones auxiliares de formato
→ Storage_Pwa.js: Guarda datos después de cambios
```

#### **8. Crono_CRI_js_UI.js** - Módulo de Interfaz de Usuario
```
DESCRIPCIÓN: Gestión completa de la interfaz y componentes visuales
RESPONSABILIDADES:
1. Sistema de tarjetas expandibles con persistencia en localStorage
2. Selector de modo deslizante (salidas/llegadas) con prevención de ciclos infinitos
3. Gestión centralizada de modales y cierres automatizados
4. Actualización dinámica de títulos y displays
5. Redimensionamiento responsive del countdown en 4 breakpoints
6. Sistema de notificaciones `showMessage()` con 3 tipos (info, success, error)
7. Depuración mejorada de estado de modo y botones de modal

SISTEMAS DE ESTADO UI:
- uiInitialized{}: Controla inicialización única de componentes
  * cardToggles: Tarjetas expandibles
  * modeSlider: Selector de modo
  * modalEvents: Listeners de modales
  * modalActions: Acciones de modales
- isModeChanging: Previene ciclos infinitos en cambio de modo

FUNCIONES CRÍTICAS EXPORTADAS:
- setupCardToggles() - Configura tarjetas expandibles con persistencia
- initModeSlider() - Inicializa selector de modo con carga de preferencias
- setupModalEventListeners() - Gestión automática de cierre de 15+ modales
- setupModalActionListeners() - Configura acciones específicas de modales
- adjustCountdownSize() - Redimensiona countdown responsive
- showMessage() - Sistema de notificaciones de 3 segundos
- updateRaceManagementCardTitle() - Título dinámico de carrera
- updateModeSelectorCardTitle() - Título dinámico de selector de modo
- updateStartOrderCardTitle() - Título dinámico de orden de salida

GESTIÓN DE MODALES MEJORADA:
✓ Mapeo centralizado de botones de cancelar (15+ modales)
✓ Cierre automático con Escape
✓ Cierre al hacer clic fuera del contenido
✓ Sistema de depuración `debugModalButtons()` para verificar integridad
✓ Prevención de propagación de eventos

SELECTOR DE MODO MEJORADO:
✓ Prevención de ciclos infinitos con `isModeChanging`
✓ Carga de preferencia guardada (`app-mode` en localStorage)
✓ Actualización automática de título al cambiar modo
✓ Logs detallados para depuración

FUNCIONES DE ACTUALIZACIÓN DINÁMICA:
- onRaceChanged() - Actualiza UI al cambiar carrera
- onModeChanged() - Actualiza UI al cambiar modo
- onTimesChanged() - Actualiza UI al cambiar tiempos
- updateSystemTimeDisplay() - Muestra hora del sistema
- updateTimeDifference() - Calcula diferencia hasta inicio

DEPENDENCIAS:
- ← Main.js: Recibe appState para estado
- ← Storage_Pwa.js: Actualiza título con datos de carrera
- → Todos los módulos: Proporciona componentes UI
- → Salidas módulos: Coordina actualizaciones de interfaz
```

#### **9. Crono_CRI_js_Storage_Pwa.js** - Módulo de Almacenamiento y PWA
```
DESCRIPCIÓN: Módulo central de persistencia de datos y funcionalidad PWA
RESPONSABILIDADES:
1. Gestión completa de localStorage para carreras, configuraciones y estado
2. Sistema de copias de seguridad y restauración por carrera individual
3. Funcionalidades PWA (Service Worker, instalación, actualizaciones)
4. Gestión de carreras (crear, editar, eliminar, limpiar datos) con formularios completos
5. Orden de salida con confirmaciones visuales y estadísticas detalladas
6. Integración con otros módulos para sincronización de datos

FUNCIONES CRÍTICAS EXPORTADAS:
- loadRaceData() - Carga datos específicos de carrera desde múltiples fuentes
- saveRaceData() - Guarda carrera actual con todos sus datos (estructura completa)
- createRaceBackup() - Genera copia de seguridad de carrera individual con metadatos
- restoreRaceFromBackup() - Restaura carrera desde archivo JSON con opciones
- editRaceDetails() - Editor completo de detalles de carrera con validación
- updateRaceManagementCardTitle() - Actualiza título dinámico de gestión
- showNewRaceModal() - Muestra modal para crear nueva carrera
- deleteStartOrder() - Elimina orden de salida con confirmación detallada

SISTEMA DE CARGA MEJORADO:
✓ Carga desde múltiples fuentes: carrera actual, localStorage global, claves específicas
✓ Verificación de integridad de datos
✓ Logs detallados de proceso de carga
✓ Inicialización de datos vacíos cuando es necesario
✓ Actualización automática de UI después de carga

SISTEMA DE GUARDADO ROBUSTO:
✓ Guardado en carrera actual y estructura general
✓ Preservación de campos importantes durante actualizaciones
✓ Múltiples puntos de guardado para redundancia
✓ Validación de estructura de datos antes de guardar
✓ Logs de confirmación de guardado exitoso

CARACTERÍSTICAS DE COPIA DE SEGURIDAD:
✓ Exportación/importación por carrera individual
✓ Selección granular de datos a restaurar (salidas, orden, llegadas, configuración)
✓ Validación de archivos de backup con metadatos
✓ Estadísticas detalladas de lo que se va a restaurar
✓ Opciones de resolución de conflictos (reemplazar/renombrar)
✓ Modal de confirmación con vista previa de cambios

GESTIÓN DE CARRERAS COMPLETA:
✓ Creación con formulario completo (nombre, fecha, categoría, organizador, ubicación, modalidad, descripción)
✓ Edición con preservación de metadatos originales
✓ Eliminación con confirmación modal
✓ Limpieza de datos específicos (salidas)
✓ Persistencia de modalidades (CRI, CRE, Descenso, Otras)
✓ Actualización dinámica de títulos y selectores

FUNCIONALIDADES PWA:
✓ Registro de Service Worker con verificación de protocolo
✓ Instalación progresiva con deferred prompt
✓ Actualizaciones automáticas de caché
✓ Notificación de nuevas versiones disponibles
✓ Funcionamiento offline para recursos estáticos

DEPENDENCIAS:
← Main.js: Usa loadRaceData(), loadStartOrderData()
← UI.js: Proporciona updateRaceManagementCardTitle() para actualización
→ Salidas_1.js: Usa saveRaceData() para guardar cambios
→ Llegadas.js: Guarda datos en carrera
```

#### **10. Crono_CRI_js_Utilidades.js** - Módulo central de utilidades (ACTUALIZADO)
```
DESCRIPCIÓN: Módulo central de utilidades para sistema de cronometraje
RESPONSABILIDADES:
1. Manejo de conversiones tiempo ↔ segundos ↔ Excel
2. Sistema de audio multilingüe (beep/voz/none)
3. Exportación a Excel y PDF con formatos profesionales
4. Utilidades generales de mantenimiento y persistencia
5. Funciones auxiliares de formato y validación

FUNCIONES CRÍTICAS EXPORTADAS:
- timeToSeconds() / secondsToTime() - Conversiones tiempo↔segundos
- exportToExcel() - Exporta datos de salidas
- exportStartOrder() - Exporta orden con 19 columnas (INCLUYENDO DIFERENCIA)
- generateStartOrderPDF() / generateSimpleStartOrderPDF() - Genera PDF profesional
- playSound() / playVoiceAudio() - Sistema de audio
- initAudioOnInteraction() - Inicializa contexto de audio

SISTEMA DE AUDIO:
✓ Tres modos: beep, voice, none
✓ 4 idiomas: es, en, ca, fr
✓ Precarga inteligente de archivos OGG
✓ Fallback a beep si falla voz
✓ Verificación de archivos disponibles
✓ Precarga automática en inicialización
✓ Test completo con secuencia de carrera

EXPORTACIONES:
✓ Excel: 19 columnas con diferencias (+/-) formateadas
✓ PDF: Diseño profesional con colores alternados por cambio de diferencia
✓ Validación estricta de formatos de tiempo
✓ Carga dinámica de jsPDF cuando es necesario

PROTECCIONES IMPLEMENTADAS:
✓ Validación regex para formatos HH:MM:SS
✓ Manejo de errores en reproducción de audio
✓ Limpieza de datos antiguos en localStorage
✓ Precarga de librerías dinámicas (jsPDF)
✓ Control de inicialización única (window.pdfModuleInitialized)
✓ Sistema de throttling para renderizado de tabla

ESTRUCTURA DE EXPORTACIÓN EXCEL (19 COLUMNAS):
1. Orden
2. Dorsal
3. Crono Salida
4. Hora Salida
5. Diferencia (con signos (+)/(-))
6. Nombre
7. Apellidos
8. Chip
9. Hora Salida Real
10. Crono Salida Real
11. Hora Salida Prevista
12. Crono Salida Prevista
13. Hora Salida Importado
14. Crono Salida Importado
15. Crono Segundos
16. Hora Segundos
17. Crono Salida Real Segundos
18. Hora Salida Real Segundos
19. Diferencia Segundos

SISTEMA DE GENERACIÓN DE PDF:
✓ Dos versiones: completa (generateStartOrderPDF) y simplificada (generateSimpleStartOrderPDF)
✓ Diseño profesional con colores alternados por cambio de diferencia
✓ Formato A4 con márgenes optimizados
✓ Cabecera completa con información de carrera
✓ Pie de página con fecha y número de página
✓ Truncamiento inteligente de texto largo
✓ Colores de fila alternados según cambio de diferencia

FUNCIONES DE MANEJO DE TIEMPO:
- timeToSeconds() - Convierte formato HH:MM:SS a segundos
- secondsToTime() - Convierte segundos a formato HH:MM:SS
- formatTimeWithSeconds() - Asegura formato HH:MM:SS completo
- calculateStartTime() - Calcula hora de salida basada en índice
- isValidTime() - Valida formato de tiempo con regex
- timeToExcelValue() - Convierte tiempo a valor decimal de Excel
- formatTimeValue() - Formatea valor para Excel/PDF

FUNCIONES DE MANTENIMIENTO DE PANTALLA:
- keepScreenAwake() - Previene que se apague la pantalla durante cuenta atrás
- cleanupOldData() - Limpia claves antiguas de localStorage
- saveLastUpdate() - Guarda timestamp de última actualización

FUNCIONES AUXILIARES:
- formatTimeForDisplay() - Formatea tiempo según formato solicitado
- secondsToMMSS() - Convierte segundos a formato MM:SS
- parsePDFTime() - Parsea tiempos desde PDF
- getOriginalIndex() - Obtiene índice original del corredor
- formatDateForDisplay() - Formatea fecha legiblemente
- formatDateShort() - Formato corto de fecha

INICIALIZACIÓN DE MÓDULOS:
- initPDFModule() - Inicializa módulo PDF con control de inicialización única
- setupPDFExportButton() - Configura botón de exportación PDF
- setupAudioEventListeners() - Configura eventos de audio
- loadAudioPreferences() - Carga preferencias de audio desde localStorage

VERIFICACIÓN Y DEPURACIÓN:
- verifyAudioFiles() - Verifica existencia de archivos de audio
- checkAvailableAudioFiles() - Comprueba formatos de audio disponibles
- showExpectedFilenames() - Muestra nombres de archivos esperados
- testCurrentAudio() - Prueba completa del sistema de audio actual

DEPENDENCIAS:
← Todos los módulos: Usan funciones de utilidad
→ Salidas_*.js: Proporciona conversiones tiempo
→ UI_*.js: Usa funciones de sonido y formato
→ Storage_Pwa.js: Usa funciones de persistencia
```

#### **11. Crono_CRI_js_Traducciones.js** - Sistema multilingüe
```
DESCRIPCIÓN: Sistema completo de traducción multilingüe para toda la aplicación
RESPONSABILIDADES:
1. Gestión centralizada de todos los textos de la interfaz
2. Soporte para 4 idiomas: Español (es), Catalán (ca), Inglés (en), Francés (fr)
3. Traducción dinámica de toda la interfaz y componentes
4. Sistema unificado de actualización de UI con `updateLanguageUI()`

ESTRUCTURA DEL OBJETO TRANSLATIONS:
- Cada idioma contiene ~600 claves de traducción organizadas por funcionalidad
- Organización modular por secciones de la aplicación
- Incluye textos dinámicos con parámetros (ej: "{count} corredores")
- HTML seguro para listas y contenido estructurado

IDIOMAS SOPORTADOS:
- Español (es): Idioma principal con ~600 claves
- Catalán (ca): Traducción completa equivalente
- Inglés (en): Traducción completa equivalente
- Francés (fr): Traducción completa equivalente

SECCIONES PRINCIPALES DE TRADUCCIÓN:
1. Títulos generales y tarjetas principales
2. Botones y controles de carrera
3. Configuración de audio y tiempo
4. Posición inicial y cuenta atrás
5. Lista de salidas y llegadas
6. Footer y modales de ayuda
7. Orden de salida (19 columnas + tooltips)
8. Mensajes de estado, error y éxito
9. Configuración de plantillas y exportación
10. Gestión de carreras extendida (categorías, modalidades)
11. Funcionalidades avanzadas (copia seguridad, PDF)
12. Sistema de tooltips para columnas de tabla
13. Modales de importación y confirmación
14. Modo llegadas completo
15. Mensajes de validación y warnings

FUNCIONALIDADES AVANZADAS:
✓ Sistema de tooltips para columnas de tabla (explicación de cada campo)
✓ Textos dinámicos con parámetros reemplazables
✓ HTML seguro para contenido estructurado en modales
✓ Formato de fechas y horas por idioma
✓ Mensajes de confirmación contextuales
✓ Validaciones específicas por idioma

FUNCIONES CRÍTICAS:
- updateLanguageUI(): Función unificada que actualiza toda la interfaz
- updateAppTitle(): Actualiza título de la aplicación
- updateRaceManagementCard(): Actualiza tarjeta de gestión de carrera
- updateStartOrderCard(): Actualiza tarjeta de orden de salida
- updateModeContent(): Actualiza contenido según modo (salidas/llegadas)
- updateFooter(): Actualiza pie de página
- updateModalTexts(): Actualiza textos de todos los modales
- updateTableHeaders(): Actualiza cabeceras de tabla (19 columnas)
- updateTableTooltips(): Actualiza tooltips de columnas
- setTextIfExists(): Función auxiliar genérica para actualización

PROTECCIONES IMPLEMENTADAS:
✓ Verificación de existencia de elementos antes de actualizar
✓ Preservación de íconos en botones
✓ Manejo de placeholders en inputs
✓ Control de inicialización de tooltips
✓ Actualización dinámica durante ejecución

DEPENDENCIAS:
← Main.js: Usa appState.currentLanguage para determinar idioma
→ Todos los módulos: Proporciona textos traducidos para toda la UI
→ UI.js: Coordina actualización de componentes de interfaz
→ Storage_Pwa.js: Usa textos para mensajes y notificaciones

MÓDULOS QUE UTILIZAN TRADUCCIONES:
- Main.js: Inicialización y manejo de estado
- UI.js: Mensajes, notificaciones, componentes visuales
- Storage_Pwa.js: Mensajes de éxito/error en operaciones
- Salidas_*.js: Textos de modales, confirmaciones, validaciones
- Utilidades.js: Exportación, formato de tiempo, audio
- Llegadas.js: Modo llegadas completo

EJEMPLO DE ESTRUCTURA POR IDIOMA:
es: {
    appTitle: "Crono CRI - en Construcción",
    cardRaceTitle: "Gestión de Carrera",
    // ... ~600 claves más organizadas por funcionalidad
},
ca: {
    appTitle: "Crono CRI - en construcció",
    cardRaceTitle: "Gestió de Cursa",
    // ... estructura equivalente
},
en: {
    appTitle: "Crono CRI - under construction",
    cardRaceTitle: "Race Management",
    // ... estructura equivalente
},
fr: {
    appTitle: "Crono CRI - under construction",
    cardRaceTitle: "Gestion de Course",
    // ... estructura equivalente
}
```

#### **12. Crono_CRI_js_Llegadas.js** - Módulo de llegadas
```
RESPONSABILIDADES:
- Cronómetro independiente para registro de llegadas
- Sistema de registro manual y rápido
- Importación de datos de salidas para cálculo automático
- Clasificación automática por tiempos crono
- Exportación a Excel de llegadas y clasificación

FUNCIONES CLAVE:
- startLlegadasTimer() - Inicia cronómetro
- showQuickRegisterLlegada() - Registro rápido con dorsal
- importSalidasForLlegadas() - Importa datos de salidas
- showRankingModal() - Muestra clasificación ordenada
- exportLlegadasToExcel() - Exporta llegadas a Excel
```

#### **13. Crono_CRI_ws.js** - Service Worker para PWA
```
RESPONSABILIDADES:
- Cache de recursos estáticos para funcionamiento offline
- Instalación como aplicación PWA
- Actualizaciones automáticas de caché
- Servicio de recursos en modo offline

CACHE: 'crono-cri-v1' incluye:
- Todos los archivos HTML, CSS, JS
- Imágenes y recursos locales
- Librerías CDN (Font Awesome, XLSX)
```

### 📁 **RECURSOS ESTÁTICOS**

#### **14. Crono_CRI_manifest.json** - Configuración PWA
```
- Información de la aplicación (nombre, descripción)
- Iconos para diferentes tamaños (192x192, 512x512)
- Configuración de pantalla completa
- Colores del tema
```

#### **15. Recursos de audio** (en directorio audio/)
```
SISTEMA DE ARCHIVOS ESPERADOS (CONVENCIÓN):
- 0.ogg = audio de SALIDA/SORTIDA/GO/DÉPART
- 1.ogg = audio de UNO/ONE/UN
- 2.ogg = audio de DOS/TWO/DEUX
- 3.ogg = audio de TRES/THREE/TROIS
- 4.ogg = audio de CUATRO/FOUR/QUATRE
- 5.ogg = audio de CINCO/FIVE/CINC/CINQ
- 6.ogg = audio de SEIS/SIX/SIS
- 7.ogg = audio de SIETE/SEVEN/SET/SEPT
- 8.ogg = audio de OCHO/EIGHT/HUIT
- 9.ogg = audio de NUEVE/NINE/NOU/NEUF
- 10.ogg = audio de DIEZ/TEN/DEU/DIX

ESQUEMA DE NOMBRES: {idioma}_{numero}.ogg
Ejemplos:
- es_10.ogg → "diez" (Español)
- en_5.ogg → "five" (Inglés)
- ca_0.ogg → "sortida" (Catalán)
- fr_1.ogg → "un" (Francés)

TOTAL: 4 idiomas × 11 números = 44 archivos .ogg
```

## 🔄 **INTERACCIONES ENTRE MÓDULOS - ACTUALIZADO COMPLETO**

```
HTML (UI) ↔ CSS (Estilos)
      ↓
Main.js (Coordinador Principal)
      ↓
├── Salidas_1.js (Core: Cuenta atrás, importación Excel)
│   ├──→ Salidas_2.js (Proporciona datos procesados)
│   ├──→ Storage_Pwa.js (Guarda datos de salidas)
│   └──→ UI.js (Muestra mensajes)
│
├── Salidas_2.js (UI: Tabla, edición, sistema de throttling de 3 niveles)
│   ├──← Salidas_1.js (Recibe datos importados)
│   ├──→ Salidas_3.js (Llama recalculations)
│   ├──→ Salidas_4.js (Llama funciones de guardado)
│   └──→ Storage_Pwa.js (Guarda cambios)
│
├── Salidas_3.js (Gestión: Modales, añadir corredores, vista previa dinámica)
│   ├──← Salidas_2.js (Recibe llamadas de edición)
│   ├──→ Salidas_4.js (Llama reorganizeRiders)
│   ├──→ UI.js (Usa funciones de modal)
│   └──→ Storage_Pwa.js (Guarda datos actualizados)
│
├── Salidas_4.js (Edición avanzada: Confirmaciones, validaciones)
│   ├──← Salidas_2.js (Recibe startDiferenciaEditing)
│   ├──← Salidas_3.js (Recibe recalculateFollowingRiders)
│   ├──→ Todos (Proporciona helpers de formato)
│   └──→ Storage_Pwa.js (Guarda después de cambios)
│
├── UI.js (Componentes de interfaz)
│   ├──← Main.js (Recibe appState)
│   ├──← Storage_Pwa.js (Actualiza títulos)
│   ├──→ Todos (Proporciona componentes UI)
│   └──→ Salidas módulos (Coordina actualizaciones)
│
├── Utilidades.js (Funciones centrales - ACTUALIZADO)
│   ├──← Todos (Usan funciones de utilidad)
│   ├──→ Salidas_*.js (Proporciona conversiones tiempo)
│   ├──→ UI.js (Funciones de sonido y formato)
│   ├──→ Traducciones.js (Usa textos para exportación)
│   └──→ Main.js (Proporciona funciones de audio)
│
├── Traducciones.js (Sistema multilingüe)
│   ├──← Main.js (Determina idioma actual)
│   ├──→ Todos (Proporciona textos traducidos)
│   └──→ UI.js (Coordina actualización de interfaz)
│
├── Storage_Pwa.js (Persistencia y PWA)
│   ├──← Main.js (Carga datos)
│   ├──→ UI.js (Actualiza título de gestión)
│   ├──→ Salidas_1.js (Guarda cambios)
│   └──→ Llegadas.js (Guarda datos de llegadas)
│
└── Llegadas.js (Gestión llegadas)
```

## 📊 **ESTRUCTURA DE DATOS CLAVE - ACTUALIZADA COMPLETA**

#### Estado de la aplicación (`appState`):
```javascript
{
  // Configuración general
  audioType: 'beep' | 'voice' | 'none',
  currentLanguage: 'es' | 'ca' | 'en' | 'fr',
  soundEnabled: boolean,
  aggressiveMode: boolean,
  
  // Gestión de carreras
  currentRace: { 
    id: number,
    name: string,
    date: string,
    category: string,
    organizer: string,
    location: string,
    modality: string,
    description: string,
    firstStartTime: string,
    createdAt: string,
    lastModified: string,
    departures: array,
    intervals: array,
    startOrder: array,
    metadata: object
  },
  races: [], // Array de todas las carreras
  
  // Estado de salidas
  countdownActive: boolean,
  countdownValue: number,
  departureTimes: [], // Registro de salidas
  departedCount: number,
  intervals: [], // Intervalos múltiples
  currentIntervalIndex: number,
  accumulatedTime: number,
  countdownPaused: boolean,
  configModalOpen: boolean,
  raceStartTime: number | null,
  
  // Audio y caché
  audioContext: AudioContext,
  voiceAudioCache: object, // Precarga de audios de voz
  
  // PWA
  deferredPrompt: any,
  updateAvailable: boolean
}
```

#### Datos de corredor (`startOrderData` - ESTRUCTURA COMPLETA 19 COLUMNAS):
```javascript
{
  // Identificación básica
  order: number,           // 1 - Orden de salida (1, 2, 3...)
  dorsal: number,          // 2 - Número de dorsal
  nombre: string,          // 6 - Nombre
  apellidos: string,       // 7 - Apellidos
  chip: string,            // 8 - Número de chip
  
  // Tiempos principales
  cronoSalida: string,     // 3 - Tiempo desde inicio (crono)
  horaSalida: string,      // 4 - Hora absoluta de salida
  diferencia: string,      // 5 - Diferencia con signo (+)/(-)
  
  // Campos reales (registro efectivo)
  horaSalidaReal: string,          // 9
  cronoSalidaReal: string,         // 10
  horaSalidaRealSegundos: number,  // 18
  cronoSalidaRealSegundos: number, // 17
  
  // Campos previstos (calculados)
  horaSalidaPrevista: string,      // 11
  cronoSalidaPrevista: string,     // 12
  
  // Campos importados (desde Excel)
  horaSalidaImportado: string,     // 13
  cronoSalidaImportado: string,    // 14
  
  // Campos en segundos (para cálculos internos)
  cronoSegundos: number,           // 15
  horaSegundos: number,            // 16
  
  // Diferencia en segundos (para cálculos)
  diferenciaSegundos: number,      // 19
  
  // Campos adicionales para edición
  editing: boolean                // Para modo edición (transitorio)
}
```

#### Estado de audio (`Utilidades.js`):
```javascript
{
  audioType: 'beep' | 'voice' | 'none',
  voiceAudioCache: {
    es: { 0: Audio, 1: Audio, ..., 10: Audio },
    en: { 0: Audio, 1: Audio, ..., 10: Audio },
    ca: { 0: Audio, 1: Audio, ..., 10: Audio },
    fr: { 0: Audio, 1: Audio, ..., 10: Audio }
  },
  audioContext: AudioContext
}
```

## 🚨 **ÁREAS CRÍTICAS DE ATENCIÓN - ACTUALIZADO**

1. **Sistema de throttling de 3 niveles:** `updateStartOrderTableThrottled()`, `updateStartOrderTableCritical()`, `updateStartOrderTableImmediate()` en Salidas_2.js
2. **Importación de Excel:** `processImportedOrderData()` en Salidas_1.js maneja formatos complejos
3. **Edición en línea:** Sistema de event delegation con logs mejorados en Salidas_2.js (`handleTableClick()`)
4. **Modales de confirmación y vista previa:** Implementados en Salidas_3.js (`showRiderPositionModal()`, `updateRiderPreview()`)
5. **Gestión de estado:** `window.appInitialized` en Main.js controla inicialización única
6. **Preservación de datos:** Campos `_Real` e `_Importado` nunca se sobrescriben automáticamente
7. **Control de múltiples llamadas:** Variables `guardando`, `isModeChanging` previenen duplicados
8. **Exportación Excel/PDF:** `exportStartOrder()` y `generateStartOrderPDF()` en Utilidades.js
9. **Sistema de audio:** `playVoiceAudio()` y `preloadVoiceAudios()` en Utilidades.js
10. **Sistema de traducciones:** `updateLanguageUI()` en Traducciones.js actualiza toda la interfaz
11. **Gestión de modales:** `setupModalEventListeners()` y `setupModalActionListeners()` en UI.js
12. **Tooltips de columnas:** `updateTableTooltips()` en Traducciones.js para explicación de campos
13. **Sistema de estilos dinámicos:** `addTimeChangeStyles()` y `addRiderPositionStyles()` en Salidas_3.js para modales
14. **Modal de confirmación de diferencia:** `guardarDiferencia()` en Salidas_4.js con vista previa detallada
15. **Carga robusta de datos:** `loadRaceData()` y `loadStartOrderData()` en Storage_Pwa.js con múltiples fuentes
16. **Sistema de audio multilingüe:** `playVoiceAudio()`, `preloadVoiceAudios()`, `verifyAudioFiles()` en Utilidades.js
17. **Generación de PDF:** `generateStartOrderPDF()` y `generateSimpleStartOrderPDF()` en Utilidades.js
18. **Conversiones de tiempo:** `timeToSeconds()`, `secondsToTime()`, `formatTimeValue()` en Utilidades.js
19. **Mantenimiento de pantalla:** `keepScreenAwake()` en Utilidades.js para cuenta atrás activa
20. **Limpieza de datos antiguos:** `cleanupOldData()` en Utilidades.js

## 📝 **CONVENIOS DE DESARROLLO - ACTUALIZADO**

1. **Comentarios:** Cada archivo tiene cabecera con responsabilidades y dependencias
2. **Throttling de 3 niveles:** Uso obligatorio según necesidad:
   - `Throttled()`: Actualizaciones normales de UI
   - `Critical()`: Respuesta inmediata a acciones del usuario
   - `Immediate()`: Actualizaciones forzadas tras cambios críticos
3. **Event Delegation:** Para tablas grandes, evitar listeners individuales
4. **Modales:** Siempre incluir botones de confirmar/cancelar y manejo de Escape
5. **Validación:** Validación en tiempo real para inputs de tiempo
6. **Preservación:** Campos reales e importados NUNCA se sobrescriban automáticamente
7. **Inicialización única:** Cada módulo verifica si ya fue inicializado (`uiInitialized`, `appInitialized`, `pdfModuleInitialized`)
8. **Exportación:** Mantener estructura de 19 columnas para Excel y formato profesional para PDF
9. **Audio:** Seguir convención de nombres: `{idioma}_{numero}.ogg` donde `0.ogg` es "SALIDA"/"GO"/etc.
10. **Traducciones:** Usar siempre claves del objeto `translations` y nunca texto hardcodeado
11. **Tooltips:** Incluir tooltips explicativos para todas las columnas de tabla complejas
12. **Sistema de logs:** Usar logs detallados en funciones críticas como `handleTableClick()` para depuración
13. **Estilos dinámicos:** Añadir estilos específicos para modales complejos para evitar conflictos
14. **Control de duplicados:** Usar variables de estado (`guardando`, `isModeChanging`) para prevenir múltiples llamadas
15. **Validación de formatos:** Soporte para múltiples formatos de tiempo (MM:SS, HH:MM:SS, segundos)
16. **Sistema de audio:** Siempre incluir fallback a beep si falla la voz, precargar archivos
17. **Generación de PDF:** Proporcionar versión simplificada como fallback, cargar jsPDF dinámicamente
18. **Conversiones de tiempo:** Usar funciones centralizadas de Utilidades.js para consistencia
19. **Manejo de errores:** Capturar y mostrar errores en reproducción de audio y generación de PDF
20. **Compatibilidad:** Asegurar funcionamiento en múltiples navegadores y dispositivos móviles

## 🔍 **DEPURACIÓN COMÚN - ACTUALIZADO**

### **PROBLEMAS COMUNES Y SOLUCIONES:**

- **Tabla no se actualiza o se actualiza lentamente** → Usar función adecuada de throttling:
  - Normal: `updateStartOrderTableThrottled()`
  - Crítico: `updateStartOrderTableCritical()`
  - Forzado: `updateStartOrderTableImmediate()`
- **Importación Excel falla** → Verificar `processImportedOrderData()` en Salidas_1.js
- **Edición de diferencia no funciona** → Verificar `handleTableClick()` en Salidas_2.js y `guardarDiferencia()` en Salidas_4.js
- **Modal de añadir corredor no muestra vista previa** → Verificar `updateRiderPreview()` en Salidas_3.js
- **Cambio de hora no actualiza todos** → Verificar `recalculateAllStartTimes()` en Salidas_4.js
- **Datos no se guardan** → Verificar `saveRaceData()` en Storage_Pwa.js
- **Título de tarjeta no actualiza** → Verificar `updateRaceManagementCardTitle()` en UI.js y Storage_Pwa.js
- **Múltiples modales abiertos** → Verificar `setupModalEventListeners()` en UI.js
- **Exportación Excel no incluye diferencia** → Verificar `exportStartOrder()` en Utilidades.js
- **Audio no funciona** → Verificar `playVoiceAudio()` y `preloadVoiceAudios()` en Utilidades.js
- **PDF no se genera** → Verificar `generateStartOrderPDF()` y `setupPDFExportButton()` en Utilidades.js
- **Textos en idioma incorrecto** → Verificar `updateLanguageUI()` en Traducciones.js
- **Tooltips no aparecen** → Verificar `updateTableTooltips()` en Traducciones.js
- **Campos importados se pierden** → Verificar que `horaSalidaImportado` y `cronoSalidaImportado` se mantengan vacíos en `createNewRiderAtPosition()` (Salidas_3.js)
- **Estilos de modal no se aplican** → Verificar funciones `add*Styles()` en Salidas_3.js
- **Datos de carrera no se cargan** → Verificar `loadRaceData()` y `loadStartOrderData()` en Storage_Pwa.js
- **Modal de diferencia no muestra** → Verificar `guardarDiferencia()` en Salidas_4.js con variable `guardando`
- **Audio de voz no reproduce** → Verificar `verifyAudioFiles()` en Utilidades.js y existencia de archivos .ogg
- **PDF no carga librería** → Verificar `loadJSPDFLibrary()` en Utilidades.js
- **Conversiones de tiempo incorrectas** → Verificar `timeToSeconds()` y `secondsToTime()` en Utilidades.js
- **Pantalla se apaga durante cuenta atrás** → Verificar `keepScreenAwake()` en Utilidades.js
- **Exportación Excel con formato incorrecto** → Verificar `formatTimeValue()` en Utilidades.js

### **MÓDULOS QUE SUELEN INTERACTUAR:**

1. **Cualquier cambio en estructura de datos** → Main.js, todos los módulos Salidas_*.js, Storage_Pwa.js, Utilidades.js
2. **Cambios en UI/UX** → UI.js, CSS, HTML, Traducciones.js
3. **Modales nuevos o modificados** → Salidas_3.js, UI.js, HTML, CSS, Traducciones.js
4. **Validación o formato de tiempo** → Salidas_4.js, Utilidades.js
5. **Persistencia de datos** → Storage_Pwa.js, Main.js
6. **Exportación/Importación** → Utilidades.js, Salidas_1.js
7. **Sistema de audio** → Utilidades.js, Main.js, Traducciones.js (nombres de archivos)
8. **Gestión de carreras** → Storage_Pwa.js, UI.js, Main.js, Traducciones.js
9. **Sistema multilingüe** → Traducciones.js, todos los módulos que muestran texto
10. **Sistema de throttling y rendimiento** → Salidas_2.js principalmente
11. **Edición de diferencia** → Salidas_2.js, Salidas_4.js
12. **Modal de confirmación** → Salidas_4.js, UI.js, Traducciones.js
13. **Generación de PDF** → Utilidades.js, UI.js, Traducciones.js
14. **Conversiones de tiempo** → Utilidades.js, Salidas_1.js, Salidas_4.js
15. **Configuración de audio** → Utilidades.js, UI.js, Main.js

## 🔧 **FLUJO PARA MODIFICACIONES - GUÍA PRÁCTICA ACTUALIZADA**

### **CUANDO SE SOLICITA UN CAMBIO:**

1. **Identificar el área afectada:**
   - Configuración básica y cuenta atrás → `Salidas_1.js`
   - Interfaz de tabla, edición básica, throttling → `Salidas_2.js`
   - Modales, gestión de cambios, vista previa → `Salidas_3.js`
   - Edición avanzada, validaciones, confirmaciones → `Salidas_4.js`
   - Interfaz general, tarjetas, modales → `UI.js`
   - Persistencia, backup, gestión de carreras → `Storage_Pwa.js`
   - Utilidades, audio, exportación, conversiones tiempo → `Utilidades.js`
   - Sistema multilingüe → `Traducciones.js`
   - Coordinación general → `Main.js`

2. **Procedimiento recomendado:**
   ```
   Cliente solicita: "Cambiar X en la funcionalidad Y"
   
   Paso 1: Tú identificas: "Esto afecta al módulo Z según estructura.md"
   Paso 2: Pides: "Envíame Crono_CRI_js_Z.js"
   Paso 3: Verificas dependencias: "Esto también afecta a W, envíamelo también"
   Paso 4: Implementas el cambio
   Paso 5: Verificas que no rompa otras funcionalidades relacionadas
   ```

3. **Archivos que suelen cambiar juntos:**
   - `Salidas_2.js`, `Salidas_3.js`, `Salidas_4.js` (sistema completo de edición)
   - `UI.js` y `Storage_Pwa.js` (interfaz y persistencia)
   - `Main.js` y módulos específicos (coordinación y funcionalidad)
   - `Salidas_1.js` y `Salidas_4.js` (formato de tiempo y cálculos)
   - `Utilidades.js` y `Salidas_*.js` (funciones compartidas)
   - `UI.js` y `Utilidades.js` (exportación PDF/Excel)
   - `Traducciones.js` y cualquier módulo que muestre texto al usuario
   - `Utilidades.js` y `Traducciones.js` (sistema de audio multilingüe)
   - `Storage_Pwa.js` y `UI.js` (gestión de títulos y estado)

### **EJEMPLOS PRÁCTICOS ACTUALIZADOS:**

**Ejemplo 1: Añadir nuevo campo a la tabla de corredores**
1. Modificar estructura en `Salidas_1.js` (`createRiderFromRow`)
2. Actualizar renderizado en `Salidas_2.js` (`updateStartOrderTable`)
3. Actualizar edición en `Salidas_2.js` (`handleTableClick`)
4. Actualizar validación en `Salidas_4.js` (`validateFieldValue`)
5. Actualizar modales en `Salidas_3.js` (si es editable)
6. Actualizar persistencia en `Storage_Pwa.js`
7. Actualizar exportación en `Utilidades.js` (`exportStartOrder`)
8. Actualizar traducciones en `Traducciones.js` (cabecera de columna y tooltip)

**Ejemplo 2: Modificar sistema de audio**
1. Modificar `Utilidades.js` (`playVoiceAudio`, `preloadVoiceAudios`)
2. Actualizar configuración en `UI.js` (botones de selección de audio)
3. Actualizar `Main.js` para inicialización correcta
4. Verificar archivos de audio en directorio `audio/`
5. Actualizar `Traducciones.js` para textos relacionados
6. Probar con `testCurrentAudio()` y `verifyAudioFiles()`

**Ejemplo 3: Mejorar generación de PDF**
1. Modificar `Utilidades.js` (`generateStartOrderPDF`, `generateSimpleStartOrderPDF`)
2. Actualizar `UI.js` para configuración de botón
3. Verificar carga dinámica con `loadJSPDFLibrary()`
4. Actualizar `Traducciones.js` para textos del PDF
5. Probar con diferentes tamaños de datos

**Ejemplo 4: Cambiar conversiones de tiempo**
1. Modificar `Utilidades.js` (`timeToSeconds`, `secondsToTime`, `formatTimeValue`)
2. Verificar que `Salidas_1.js` y `Salidas_4.js` usen las mismas funciones
3. Actualizar validaciones en `Salidas_4.js`
4. Probar con diferentes formatos (MM:SS, HH:MM:SS, segundos)

**Ejemplo 5: Añadir nuevo idioma**
1. Añadir nuevo objeto en `Traducciones.js` (ej: `de: { ... }`)
2. Actualizar selector de idioma en `Main.js` y `UI.js`
3. Añadir archivos de audio en directorio `audio/` (`de_10.ogg`, etc.)
4. Actualizar `Utilidades.js` para reconocer el nuevo idioma en el sistema de audio
5. Añadir bandera/icono en el HTML para el selector de idioma

**Ejemplo 6: Modificar exportación Excel**
1. Actualizar `Utilidades.js` (`exportStartOrder`)
2. Verificar estructura de 19 columnas
3. Actualizar `Traducciones.js` para cabeceras de columna
4. Probar con datos reales

## 📋 **CHECKLIST PARA CAMBIOS - ACTUALIZADO**

- [ ] ¿El cambio afecta a la estructura de datos? → Actualizar todos los módulos de salidas (1-4) y Utilidades.js
- [ ] ¿Requiere nueva traducción? → Actualizar `Traducciones.js` para los 4 idiomas
- [ ] ¿Afecta a la UI/UX? → Actualizar `UI.js`, CSS y HTML
- [ ] ¿Requiere persistencia? → Actualizar `Storage_Pwa.js`
- [ ] ¿Afecta al rendimiento? → Implementar throttling adecuado
- [ ] ¿Tiene manejo de errores? → Incluir `showMessage()` apropiado
- [ ] ¿Requiere confirmación del usuario? → Usar patrón de modal adecuado
- [ ] ¿Preserva datos existentes? → Verificar que campos importantes no se sobrescriban
- [ ] ¿Es una inicialización? → Verificar variables `*Initialized` para evitar duplicados
- [ ] ¿Afecta a exportación/importación? → Actualizar `Utilidades.js`
- [ ] ¿Afecta al sistema de audio? → Actualizar `Utilidades.js`
- [ ] ¿Requiere nuevos archivos de audio? → Actualizar directorio `audio/`
- [ ] ¿Afecta a tooltips o explicaciones? → Actualizar `updateTableTooltips()`
- [ ] ¿Requiere nuevos textos en interfaz? → Añadir claves en los 4 idiomas
- [ ] ¿Requiere logs para depuración? → Añadir sistema de logs adecuado
- [ ] ¿Requiere control de duplicados? → Usar variable de estado
- [ ] ¿Afecta a copias de seguridad? → Actualizar `Storage_Pwa.js`
- [ ] ¿Requiere conversiones de tiempo? → Usar funciones de `Utilidades.js`
- [ ] ¿Afecta a generación de PDF? → Actualizar `Utilidades.js` y `UI.js`

## 🎯 **REGLAS DE ORO PARA DESARROLLO**

1. **Nunca sobrescribir campos `_Real` o `_Importado`** - Solo el usuario puede modificarlos
2. **Usar sistema de throttling de 3 niveles según necesidad**
3. **Verificar inicialización única** - Cada módulo debe controlar si ya fue inicializado
4. **Siempre proporcionar opción de cancelar** - En modales y ediciones
5. **Validar formatos de entrada** - Especialmente tiempos y números
6. **Mantener compatibilidad con datos existentes** - No romper carreras guardadas
7. **Usar el sistema de traducciones** - Nunca texto hardcodeado
8. **Mantener estructura de 19 columnas para exportación Excel**
9. **Seguir convención de nombres para archivos de audio** - `{idioma}_{numero}.ogg`
10. **Proporcionar feedback visual al usuario** - Usar `showMessage()` para confirmaciones y errores
11. **Incluir tooltips explicativos** - Para columnas complejas y funcionalidades no obvias
12. **Traducciones completas** - Cualquier nuevo texto debe añadirse en los 4 idiomas
13. **Consistencia en nombres de claves** - Usar convención camelCase en `Traducciones.js`
14. **Añadir estilos dinámicos para modales complejos**
15. **Incluir logs para funciones críticas** - Facilitar depuración
16. **Controlar múltiples llamadas** - Usar variables de estado para prevenir duplicados
17. **Soporte múltiples formatos de tiempo** - Aceptar MM:SS, HH:MM:SS y segundos
18. **Usar funciones centralizadas de Utilidades.js para conversiones de tiempo**
19. **Incluir fallback en sistema de audio** - Beep si falla la voz
20. **Cargar librerías externas dinámicamente cuando sea necesario**

## 📞 **PROTOCOLO DE COMUNICACIÓN PARA CAMBIOS**

Cuando necesites hacer un cambio:

1. **Cliente:** "Necesito cambiar [descripción breve del cambio]"
2. **Asistente:** Según la descripción, identifica los módulos afectados usando CRI_App_Structure.md
3. **Asistente:** "Este cambio afecta a [módulo X]. Envíame Crono_CRI_js_X.js. También puede afectar a [módulo Y], envíamelo también si está disponible."
4. **Cliente:** Envía los archivos solicitados
5. **Asistente:** Implementa el cambio y verifica dependencias
6. **Asistente:** Si se necesitan más archivos: "Este cambio también requiere modificar [módulo Z]. Envíamelo para completar la implementación."
7. **Asistente:** **ESPECIAL PARA TRADUCCIONES:** "Este cambio requiere actualizar traducciones. Envíame Crono_CRI_js_Traducciones.js para añadir los nuevos textos."
8. **Asistente:** Entrega el código modificado con comentarios explicando los cambios

**Ejemplo con Utilidades.js:**
- Cliente: "Quiero cambiar el formato de exportación Excel"
- Asistente: "Esto afecta a Utilidades.js (exportStartOrder). Envíamelo para modificar la función de exportación."

**Ejemplo con sistema de audio:**
- Cliente: "El audio no funciona en algunos dispositivos"
- Asistente: "Esto afecta a Utilidades.js (sistema de audio). Envíamelo para revisar las funciones de reproducción y precarga."

**Ejemplo con PDF:**
- Cliente: "El PDF generado no tiene buen formato"
- Asistente: "Esto afecta a Utilidades.js (generateStartOrderPDF) y posiblemente UI.js (setupPDFExportButton). Envíame esos archivos."

## 🔄 **MEJORAS IMPLEMENTADAS EN UTILIDADES.JS**

### **SISTEMA DE AUDIO COMPLETO:**
- ✓ Precarga inteligente de archivos OGG por idioma
- ✓ Fallback automático a beep si falla la voz
- ✓ Verificación de archivos disponibles con logs detallados
- ✓ Test completo con secuencia de carrera
- ✓ Configuración de preferencias persistentes

### **EXPORTACIÓN EXCEL MEJORADA:**
- ✓ Estructura de 19 columnas incluyendo diferencia
- ✓ Formato profesional con estilos y auto-filtro
- ✓ Conversiones correctas entre tiempo y valores Excel
- ✓ Manejo de signos (+) y (-) en diferencias

### **GENERACIÓN DE PDF PROFESIONAL:**
- ✓ Dos versiones: completa y simplificada
- ✓ Diseño A4 optimizado con colores alternados por diferencia
- ✓ Truncamiento inteligente de texto largo
- ✓ Carga dinámica de jsPDF cuando es necesario
- ✓ Control de inicialización única

### **CONVERSIONES DE TIEMPO ROBUSTAS:**
- ✓ Funciones centralizadas `timeToSeconds()` y `secondsToTime()`
- ✓ Soporte múltiples formatos (HH:MM:SS, MM:SS, segundos)
- ✓ Validación con regex para formatos correctos
- ✓ Conversiones a/desde valores Excel

### **MANTENIMIENTO Y UTILIDADES:**
- ✓ Prevención de apagado de pantalla durante cuenta atrás
- ✓ Limpieza de datos antiguos de localStorage
- ✓ Funciones auxiliares de formato de fecha y tiempo
- ✓ Sistema de inicialización modular

---

*Última actualización: Documentación completamente actualizada con el módulo Utilidades.js*
*Versión de aplicación: V_19_12_2025*
*Módulos documentados: Main, Salidas (1-4), UI, Storage_Pwa, Utilidades, Traducciones*
*Funcionalidades clave: Sistema de audio, exportación Excel/PDF, conversiones tiempo, throttling de 3 niveles*


# LECCIONES APRENDIDAS - CRI APP

## **PROBLEMAS Y SOLUCIONES**

### **1. Eliminación de Carreras Incompleta**
**Problema:** Borrar una carrera dejaba datos residuales
**Solución:** Limpiar COMPLETAMENTE el estado y localStorage
**Archivos:** `Storage_Pwa.js` - Función `deleteCurrentRace()`

### **2. Carreras Fantasma en Selector**
**Problema:** Carreras eliminadas seguían en el dropdown
**Solución:** Función `fixGhostRace()` que valida existencia
**Archivos:** `Storage_Pwa.js` - `diagnoseGhostRace()` y `fixGhostRace()`

### **3. Importación sin Carrera Seleccionada**
**Problema:** Permitía importar sin carrera activa
**Solución:** Validar `appState.currentRace` antes de importar
**Archivos:** `Salidas_1.js` - `importStartOrder()`

### **4. Datos Mezclados entre Carreras**
**Problema:** Corredores de una carrera aparecían en otra
**Solución:** Cargar datos ESPECÍFICOS por ID de carrera
**Archivos:** `Storage_Pwa.js` - `loadStartOrderData()`

### **5. Botones Habilitados Incorrectamente**
**Problema:** Botones activos sin carrera seleccionada
**Solución:** Funciones `updateDeleteRaceButtonState()` y `updateRaceActionButtonsState()`
**Archivos:** `UI.js` y `Storage_Pwa.js`

### **6. Error al Crear Nueva Carrera**
**Problema:** Variable `newRace` no inicializada
**Solución:** Asegurar inicialización correcta en `createNewRace()`
**Archivos:** `Storage_Pwa.js`

### **7. Selector no Encontrado**
**Problema:** `renderRacesSelect()` buscaba ID incorrecto
**Solución:** Buscar múltiples IDs posibles (`race-select`, `races-select`)
**Archivos:** `Storage_Pwa.js`

### **8. Sincronización Memoria/LocalStorage**
**Problema:** Datos desincronizados
**Solución:** Función `forceFullSync()` para forzar coherencia
**Archivos:** `Storage_Pwa.js`

## **FUNCIONES CRÍTICAS AÑADIDAS**

### **En Storage_Pwa.js:**
1. `cleanOrphanedRaces()` - Elimina carreras huérfanas
2. `forceFullSync()` - Sincroniza memoria y localStorage
3. `diagnoseGhostRace()` - Detecta carreras fantasma
4. `fixGhostRace()` - Elimina opciones inválidas del selector
5. `clearAllRaces()` - Limpia TODAS las carreras

### **En UI.js:**
1. `updateDeleteRaceButtonState()` - Controla botón eliminar
2. `updateRaceActionButtonsState()` - Controla todos los botones de carrera
3. `addDisabledButtonStyles()` - Estilos para botones deshabilitados

## **MEJORES PRÁCTICAS IMPLEMENTADAS**

### **1. Validación de Estado**
- Siempre verificar `appState.currentRace` antes de operaciones
- Usar `updateRaceActionButtonsState()` tras cambios

### **2. Sincronización**
- Forzar sincronía entre `appState.races` y localStorage
- Usar `forceFullSync()` tras operaciones críticas

### **3. Limpieza Completa**
- Al eliminar: limpiar array, localStorage, estado y UI
- Usar `clearAllRaces()` para reset total

### **4. Manejo de Errores**
- Try-catch en operaciones localStorage
- Logs detallados para diagnóstico
- `showMessage()` para feedback al usuario

### **5. UI Reactiva**
- Botones se habilitan/deshabilitan automáticamente
- Selector se actualiza inmediatamente
- Feedback visual claro

## **COMANDOS DIAGNÓSTICO**

```javascript
// Ver estado actual
diagnoseCurrentState()

// Detectar carreras fantasma
diagnoseGhostRace()

// Forzar sincronización
forceFullSync()

// Limpiar problemas
fixGhostRace()

// Reset total
clearAllRaces()
```

## **ARCHIVOS CLAVE A REVISAR SI HAY PROBLEMAS**

1. `Storage_Pwa.js` - Gestión de carreras y datos
2. `UI.js` - Estado de botones e interfaz
3. `Main.js` - Coordinación general
4. `Salidas_1.js` - Importación y validaciones

## **FLUJO DE SOLUCIÓN RECOMENDADO**

1. **Diagnosticar:** Ejecutar `diagnoseCurrentState()`
2. **Identificar:** Ver qué componente falla
3. **Sincronizar:** `forceFullSync()` si hay desincronía
4. **Limpiar:** `fixGhostRace()` o `clearAllRaces()` si es necesario
5. **Verificar:** Confirmar que UI se actualiza correctamente

## **ERRORES COMUNES Y SOLUCIÓN RÁPIDA**

| Error | Solución |
|-------|----------|
| "No hay carrera seleccionada" | Verificar `appState.currentRace` |
| Carrera no aparece en selector | Ejecutar `renderRacesSelect()` |
| Botones no se habilitan | `updateRaceActionButtonsState()` |
| Datos mezclados entre carreras | `forceFullSync()` |
| No se puede eliminar carrera | `clearAllRaces()` + recargar |

**Regla de oro:** Después de cualquier operación de carrera, llamar a:
1. `renderRacesSelect()`
2. `updateRaceActionButtonsState()`
3. `updateRaceManagementCardTitle()`

Esto asegura coherencia en toda la aplicación.

// Verificar en consola
console.log("Tiene onclick?", document.getElementById('import-order-btn').hasAttribute('onclick'));

ERROR: Campos de Carrera no se Actualizan al Cambiar de Carrera
Descripción del Problema
Al seleccionar una carrera diferente en el selector, algunos campos críticos de la interfaz no se actualizan correctamente, específicamente:

"Salida Primero:" - El campo first-start-time mantiene el valor de la carrera anterior

"Total Corredores:" - El campo total-riders no refleja el número real de corredores de la nueva carrera

Causa Raíz
La función loadRaceData() en Storage_Pwa.js cargaba los datos principales de la carrera (orden de salida, salidas realizadas, hora de inicio), pero NO actualizaba los campos de configuración en la UI:

first-start-time - Hora de la primera salida

total-riders - Número total de corredores en el orden de salida

Áreas Afectadas
Storage_Pwa.js - Función loadRaceData()

Storage_Pwa.js - Función initializeEmptyData()

Síntomas
Al cambiar de carrera, el selector funciona pero los campos de configuración quedan "pegados" a la carrera anterior

Si la nueva carrera tiene diferente hora de inicio, no se refleja en "Salida Primero:"

Si la nueva carrera tiene diferente número de corredores, no se refleja en "Total Corredores:"

El orden de salida y las salidas realizadas SÍ se actualizan correctamente

Solución Implementada
Se modificó loadRaceData() para que actualice TODOS los campos de configuración:

En loadRaceData():
javascript
// 1. Actualizar "Salida Primero:" (first-start-time)
if (firstStartTimeInput) {
    // Prioridad: 1) carrera actual, 2) datos guardados, 3) valor por defecto
    if (appState.currentRace.firstStartTime) {
        firstStartTimeInput.value = appState.currentRace.firstStartTime;
    } else if (data.firstStartTime) {
        firstStartTimeInput.value = data.firstStartTime;
    } else {
        firstStartTimeInput.value = "09:00:00";
    }
}

// 2. Actualizar "Total Corredores:" (total-riders)
if (totalRidersInput) {
    totalRidersInput.value = startOrderData.length > 0 ? startOrderData.length : 1;
}
En initializeEmptyData():
javascript
// Actualizar también en caso de datos vacíos
if (firstStartTimeInput) {
    if (appState.currentRace && appState.currentRace.firstStartTime) {
        firstStartTimeInput.value = appState.currentRace.firstStartTime;
    } else {
        firstStartTimeInput.value = "09:00:00";
    }
}

if (totalRidersInput) {
    totalRidersInput.value = 1;
}
Lecciones Aprendidas
Carga completa: Al cargar datos de una carrera, siempre actualizar TODOS los campos relacionados en la UI

Jerarquía de fuentes: Establecer prioridad clara para obtener valores (carrera actual > datos guardados > valor por defecto)

Consistencia entre funciones: loadRaceData() y initializeEmptyData() deben actualizar los mismos campos

Logs de diagnóstico: Incluir logs específicos para cada campo actualizado facilita la depuración

Prevención Futura
Siempre verificar que al cambiar de carrera se actualicen estos campos críticos:

first-start-time (Salida Primero)

total-riders (Total Corredores)

departed-count (Salidos - ya funcionaba)

start-position (Próxima posición - ya funcionaba)

Tabla de orden de salida (ya funcionaba)

Código de Diagnóstico Rápido
Para verificar si este error reaparece, ejecutar en consola:

javascript
// Después de cambiar de carrera, verificar:
console.log("first-start-time:", document.getElementById('first-start-time').value);
console.log("total-riders:", document.getElementById('total-riders').value);
console.log("startOrderData length:", startOrderData.length);
console.log("carrera actual:", appState.currentRace?.name);
Fecha de corrección: [Fecha actual]
Módulo afectado: Storage_Pwa.js
Funciones corregidas: loadRaceData(), initializeEmptyData()
Estado: RESUELTO ✅

¿QUÉ APRENDIMOS?
El problema tenía dos causas:
Faltaba la traducción diferenciaHeader en catalán
La función updateTableHeaders original no manejaba todas las columnas
La solución fue:
Agregar la traducción faltante al objeto translations.ca
Reemplazar completamente la función buggy con una versión robusta
El sistema ahora es más robusto:
Muestra logs informativos
Maneja todas las 18 columnas
Es más fácil de depurar en el futuro

# 🔧 Aprendizajes: Problema de Actualización de Tiempo

## 📌 **Problema**
Hora del día y cuenta atrás no se actualizaban en tiempo real.

## 🎯 **Causa**
- Se intentaban llamar funciones inexistentes en `Main.js`
- `setupTimeIntervals()` y `setupCountdownResize()` no existían
- No había intervalos activos para actualizar los displays

## ✅ **Solución Implementada**

### **1. Verificar funciones antes de usar**
```javascript
if (typeof updateSystemTimeDisplay === 'function') {
    updateSystemTimeDisplay();
    setInterval(updateSystemTimeDisplay, 1000);
}
```

### **2. Crear funciones faltantes**
```javascript
function updateSystemTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour12: false 
    });
    
    const timeElement = document.getElementById('system-time');
    if (timeElement) timeElement.textContent = timeString;
}
```

### **3. Manejo condicional de countdown**
```javascript
function updateCountdownIfActive() {
    if (appState.countdownActive && typeof updateCountdownDisplay === 'function') {
        updateCountdownDisplay();
    }
}
setInterval(updateCountdownIfActive, 1000);
```

## 📋 **Buenas Prácticas Aprendidas**

1. **Verificar funciones antes de llamarlas**
2. **Crear funciones de respaldo** cuando las esperadas faltan
3. **Logging claro** para debugging
4. **Timing adecuado** - ejecutar después de inicialización completa

## ⚡ **Resultado**
- ✅ Hora del sistema se actualiza cada segundo
- ✅ Cuenta atrás funciona en tiempo real
- ✅ Sin errores en consola
- ✅ Código más robusto con verificaciones


Anotaciones parciales para incorporar 

# 📝 Nota para la documentación (CRI_App_Structure.md)

Añade esta sección en **"LECCIONES APRENDIDAS"** o en **"PROBLEMAS Y SOLUCIONES"**:

---

## **🔧 CORRECCIÓN: Cálculo de "Cuenta atrás en:"**

### **Problema**
El display "Cuenta atrás en:" mostraba valores incorrectos (ej: 23:57:07) porque calculaba la diferencia entre la hora de salida y la hora actual directamente.

### **Causa**
La función `updateTimeDifference()` en `UI.js` calculaba:
```
diferencia = horaSalida - horaActual
```

Pero debería calcular:
```
diferencia = (horaSalida - 1 minuto) - horaActual
```

### **Solución**
Modificar `updateTimeDifference()` en `UI.js` (líneas ~286-329):
1. Restar 60 segundos a `firstStartTime` antes del cálculo
2. Convertir todo a segundos → restar 60 → convertir de vuelta a HH:MM:SS
3. Manejar casos límite (diferencia negativa → mostrar "00:00:00")

### **Lógica implementada**
```javascript
// Cálculo correcto:
totalSegundos = horas*3600 + minutos*60 + segundos
totalSegundosMenosMinuto = totalSegundos - 60
diferencia = totalSegundosMenosMinuto - horaActualEnSegundos
```

### **Ejemplo práctico**
- **Salida Primero:** 19:31:00
- **Hora actual:** 19:33:52
- **Cálculo:** (19:31:00 - 1min) = 19:30:00 → 19:30:00 - 19:33:52 = -3:52 → Muestra "00:00:00"

### **Archivos afectados**
- `Crono_CRI_js_UI.js` - Función `updateTimeDifference()`
- La misma lógica debe usarse en `startCountdown()` para consistencia

### **Lección aprendida**
Siempre verificar la lógica de negocio: "Cuenta atrás en:" se refiere al tiempo hasta que se inicie la cuenta atrás de 1 minuto, no hasta la salida real del primer corredor.

---

**¿Quieres que añada algo más a la descripción?**