# VideoGest - Documentación Completa Actualizada

## Descripción General
VideoGest es una aplicación PWA (Progressive Web App) para la gestión de archivos de vídeo utilizando FFMPEG. La aplicación funciona offline y está preparada para múltiples idiomas.

## Versión
**Versión Actual:** 1.0.4  
**Última Actualización:** 05/01/2026  
**Autor:** Roberto Benet - rbenet71@gmail.com

## Características Principales
✅ **Reducción automática de tamaño de video** con tres calidades:
   - Calidad PC (H.265/HEVC) - Máxima compresión manteniendo calidad
   - Calidad Tablet (H.264) - Balance calidad/tamaño
   - Calidad Móvil (H.264) - Tamaño reducido para dispositivos móviles

✅ **Cortar video** - Extraer fragmento específico con preservación de metadatos
   - Formato de tiempo HH:MM:SS
   - Campos de inicio y fin
   - Obtención automática de duración

✅ **Convertir formato de video** - 10 formatos soportados:
   - MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V, MPG, MPEG
   - Selector visual de formatos
   - Preservación de metadatos (incluyendo GPS)

✅ **Revertir video** - Playback inverso
   - Opción para preservar metadatos
   - Opción para incluir audio revertido

✅ **Descarga automática de ffmpeg.exe** desde servidor público  
✅ **Copia automática al portapapeles** - sin botón "Copiar Comando"  
✅ **Multi-idioma** - Español, Catalán, Inglés, Francés  
✅ **Funcionamiento offline** (PWA)  
✅ **Interfaz intuitiva** con guía paso a paso  
✅ **Actualizaciones automáticas** vía Service Worker  
✅ **Almacenamiento persistente** de configuraciones  
✅ **Instalación como aplicación nativa** (PWA) con soporte para Chrome en Windows  

## Estructura de Archivos

### Directorio Raíz
```
VideoGest/
├── assets/                  # Recursos estáticos
│   ├── icons/              # Iconos PWA (72x72, 96x96, 128x128, etc.)
│   └── pictos/             # Iconos adicionales
├── VideoGest.html          # Archivo HTML principal
├── VideoGest_Styles.css    # Estilos CSS (sin barra de progreso)
├── VideoGest_App.js        # Lógica principal de la aplicación
├── VideoGest_Translations.js # Sistema de traducción (4 idiomas, sin progreso)
├── VideoGest_Storage.js    # Gestión de almacenamiento local
├── VideoGest_FFMPEG.js     # Generación de comandos FFMPEG (todas operaciones)
├── VideoGest_UI.js         # Gestión de interfaz de usuario (sin progreso)
├── VideoGest_ServiceWorker.js # Service Worker para PWA
├── VideoGest_Manifest.json # Manifest de PWA
└── VideoGest_Estructura.md # Este documento
```

### Dependencias Externas
- **ffmpeg.exe**: Se descarga automáticamente desde: `https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe`
- **PowerShell**: Requerido para descargar ffmpeg.exe (viene con Windows 7+)
- **Windows Command Prompt**: Para ejecutar los comandos FFMPEG

## Descripción Detallada de Archivos

### 1. VideoGest.html
**Propósito**: Punto de entrada principal de la aplicación PWA  
**Características**:
- Estructura HTML semántica y accesible
- **6 paneles de interfaz**:
  1. Panel principal (selección de operación)
  2. Panel de reducción de tamaño
  3. **NUEVO**: Panel de cortar video con campos de tiempo
  4. **NUEVO**: Panel de convertir video con selector de formatos
  5. **NUEVO**: Panel de revertir video con opciones
  6. Panel de instrucciones FFMPEG (compartido)
- **ELIMINADO**: Panel de progreso (sin sentido para procesamiento externo)
- Referencias a todos los archivos CSS y JavaScript
- Metadatos para PWA (manifest, theme-color, icons)
- **Cambio importante**: Eliminado botón "Copiar Comando" - ahora es automático
- Footer con información de copyright y versión 1.0.4
- **NUEVO**: Botón "Instalar App" para instalación PWA
- **NUEVO**: Selector de idiomas con banderas interactivas

### 2. VideoGest_Styles.css
**Propósito**: Estilos visuales y diseño responsive  
**Características**:
- Variables CSS para fácil personalización de colores
- Diseño flexbox/grid para layouts responsivos
- Estilos específicos para cada tipo de panel
- **ELIMINADO**: Todos los estilos relacionados con barra de progreso
- Animaciones para transiciones y mensajes
- Media queries para diferentes tamaños de pantalla
- Sistema de colores coherente con el branding
- **NUEVO**: Estilos para botón de instalación PWA con animaciones
- **NUEVO**: Estilos para selector de idiomas con banderas
- **NUEVO**: Estilos para campos de tiempo (HH:MM:SS)
- **NUEVO**: Estilos para selector de formatos (grid visual)

### 3. VideoGest_Translations.js
**Propósito**: Sistema de internacionalización multi-idioma  
**Características**:
- Clase `VideoGestTranslations` para manejo centralizado
- Soporte para 4 idiomas: Español, Catalán, Inglés, Francés
- **NUEVO**: Traducciones completas para:
  - Campos de tiempo (inicio, fin, duración)
  - Formatos de video (10 formatos con descripciones)
  - Operaciones específicas (cortar, convertir, revertir)
  - Mensajes de validación específicos
- **ELIMINADO**: Traducciones relacionadas con barra de progreso
- Detección automática del idioma del navegador
- Persistencia del idioma seleccionado en localStorage
- Métodos para cambiar y aplicar traducciones dinámicamente
- Eventos para notificar cambios de idioma

### 4. VideoGest_Storage.js
**Propósito**: Gestión de almacenamiento persistente  
**Características**:
- Clase `VideoGestStorage` con métodos para localStorage/sessionStorage
- Configuración por defecto con valores predefinidos
- Historial de comandos ejecutados (últimos 10)
- Exportación/importación de configuración completa
- Datos temporales en sessionStorage
- Métodos para limpiar datos específicos o completos
- **SIN CAMBIOS**: Mantiene funcionalidad existente

### 5. VideoGest_FFMPEG.js
**Propósito**: Generación y manejo de comandos FFMPEG para todas las operaciones  
**Características**:
- **NUEVO**: Soporte completo para 4 operaciones:
  1. `reduce` - Reducción de tamaño (3 calidades)
  2. `cut` - Corte de video con tiempos específicos
  3. `convert` - Conversión entre 10 formatos
  4. `reverse` - Reversión de video
- **NUEVO**: Sufijos automáticos por operación:
  - `_PC`, `_Tablet`, `_Movil` para reducir
  - `_Cortado` para cortar
  - `_Convertido` para convertir
  - `_Reverse` para revertir
- **NUEVO**: Lista de 10 formatos soportados con codecs apropiados
- **NUEVO**: Métodos específicos para cada operación:
  - `generateReduceCommand()`
  - `generateCutCommand(startTime, endTime)`
  - `generateConvertCommand(format)`
  - `generateReverseCommand()`
- **NUEVO**: Validación de formato de tiempo HH:MM:SS
- **NUEVO**: Preservación de metadatos en todos los comandos
- Comandos de dos líneas que no usan `&&`
- Descarga automática de ffmpeg.exe si no existe
- Validación de operaciones y parámetros

### 6. VideoGest_UI.js
**Propósito**: Gestión completa de la interfaz de usuario  
**Características**:
- **NUEVO**: Manejo de 4 operaciones completas
- **NUEVO**: Métodos para nuevos paneles:
  - `showCutPanel()` - Panel de cortar con campos de tiempo
  - `showConvertPanel()` - Panel de convertir con selector de formatos
  - `showReversePanel()` - Panel de revertir con opciones
- **NUEVO**: Manejadores de ejecución:
  - `handleExecuteCut()` - Valida tiempos y genera comando
  - `handleExecuteConvert()` - Valida formato y genera comando
  - `handleExecuteReverse()` - Genera comando de reversión
- **NUEVO**: Selector de formatos dinámico (carga desde FFMPEG)
- **NUEVO**: Manejo de campos de tiempo HH:MM:SS
- **NUEVO**: Botón "Obtener Duración" para cortar video
- **NUEVO**: Selector de directorio destino para convertir
- **ELIMINADO**: Toda la funcionalidad de barra de progreso
  - Método `updateProgress()` eliminado
  - Método `showProgressPanel()` eliminado
  - Referencias a elementos de progreso eliminadas
- **MANTENIDO**: Copia automática al portapapeles en `handleContinue()`
- **MANTENIDO**: Flujo de usuario simplificado
- Manejo de todos los eventos de interfaz
- Control de navegación entre paneles
- Sistema de mensajes toast mejorado
- Sistema de instalación PWA

### 7. VideoGest_App.js
**Propósito**: Inicialización y ciclo de vida de la aplicación  
**Características**:
- **ACTUALIZADO**: Detección automática de modo archivo local
- **ACTUALIZADO**: Service Worker condicional (solo en HTTP/HTTPS)
- **NUEVO**: Sistema de debug integrado (Ctrl+Shift+D)
- **NUEVO**: Sistema completo de instalación PWA con detección de Chrome en Windows
- **NUEVO**: Instrucciones específicas por navegador y sistema operativo
- Manejo de eventos de red (online/offline)
- Registro de Service Worker con actualizaciones periódicas
- Manejo de parámetros de URL
- Métodos para exportar datos de la aplicación
- Utilidades de formato y manejo de fechas
- **SIN CAMBIOS**: Funcionalidad existente mantenida

### 8. VideoGest_ServiceWorker.js
**Propósito**: Funcionalidad offline y caching  
**Características**:
- Dos caches: estático (archivos de app) y dinámico (recursos)
- Estrategia Cache First para archivos estáticos
- Estrategia Network First para recursos dinámicos
- Limpieza automática de caches antiguos
- Manejo de mensajes desde la aplicación
- Soporte para sincronización en background
- Notificaciones push (configurable)
- **SIN CAMBIOS**: Funcionalidad existente mantenida

### 9. VideoGest_Manifest.json
**Propósito**: Configuración de Progressive Web App  
**Características**:
- Configuración completa para instalación como app nativa
- Iconos en múltiples tamaños para diferentes dispositivos
- Shortcuts para operaciones frecuentes
- Configuración de orientación y display
- Metadatos para descubrimiento en tiendas de apps
- **ACTUALIZADO**: Información de versión completa
- **SIN CAMBIOS**: Funcionalidad existente mantenida

## Flujo de Trabajo Actualizado

### Patrón General para Todas las Operaciones:
1. **Seleccionar operación** desde el panel principal
2. **Seleccionar archivo** de video
3. **Configurar parámetros específicos**:
   - Reducir: Calidad (PC, Tablet, Móvil)
   - Cortar: Tiempo inicio y fin (HH:MM:SS)
   - Convertir: Formato destino y directorio
   - Revertir: Opciones de metadatos y audio
4. **Hacer clic en "Ejecutar" o "Convertir"**:
   - ✅ **Se genera el comando FFMPEG automáticamente**
   - ✅ **Se copia AUTOMÁTICAMENTE al portapapeles**
   - Se muestra panel con instrucciones paso a paso
5. **Hacer clic en "Continuar"**:
   - Se abre diálogo para seleccionar carpeta de destino
   - Seleccionar la carpeta donde está el video original
   - Se recuerda al usuario que el comando YA ESTÁ COPIADO
6. **En el explorador de Windows**:
   - Navegar a la carpeta del video
   - En la barra de dirección escribir: `CMD`
   - Presionar Enter para abrir terminal
7. **En la terminal CMD**:
   - Pegar el comando (Ctrl+V) - **ya está en el portapapeles**
   - Presionar Enter para ejecutar
8. **El comando ejecuta automáticamente**:
   - Primera línea: Verifica si ffmpeg.exe existe
   - Si no existe, lo descarga automáticamente usando PowerShell
   - Segunda línea: Procesa el video con los parámetros seleccionados
   - Mantiene el archivo original intacto
   - Genera nuevo archivo con sufijo correspondiente

### Para Cortar Video:
1. **Seleccionar "Cortar Video"**
2. **Seleccionar archivo** → Se muestra duración automáticamente
3. **Configurar tiempos**:
   - Inicio: HH:MM:SS (ej: 00:01:30)
   - Fin: HH:MM:SS (ej: 00:02:45) o dejar vacío para fin del video
4. **Hacer clic en "Convertir"** → Sigue flujo general

### Para Convertir Video:
1. **Seleccionar "Convertir Video"**
2. **Seleccionar archivo**
3. **Elegir formato** de los 10 disponibles
4. **Seleccionar directorio destino** (opcional, por defecto misma carpeta)
5. **Hacer clic en "Convertir"** → Sigue flujo general

### Para Revertir Video:
1. **Seleccionar "Revertir Video"**
2. **Seleccionar archivo**
3. **Configurar opciones**:
   - ✅ Preservar metadatos (recomendado)
   - ✅ Incluir audio revertido (recomendado)
4. **Hacer clic en "Convertir"** → Sigue flujo general

## Comandos FFMPEG Generados (Ejemplos)

### Reducir - Calidad PC (H.265/HEVC):
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -vcodec libx265 -crf 28 "video_original_PC.mp4"
```

### Cortar - De 00:01:30 a 00:02:45:
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -ss 00:01:30 -to 00:02:45 -c copy -map_metadata 0 -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a "video_original_Cortado.mp4"
```

### Convertir - A formato MOV:
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -c:v mpeg4 -c:a aac -map_metadata 0 -map_metadata:s:v 0:s:v -map_metadata:s:a 0:s:a "video_original_Convertido.mov"
```

### Revertir - Con metadatos y audio:
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -vf reverse -af areverse -map_metadata 0 "video_original_Reverse.mp4"
```

## Instalación PWA - Características Implementadas

### Detección Automática:
- ✅ **Detección de sistema operativo** (Windows, macOS, Linux, Android, iOS)
- ✅ **Detección de navegador** (Chrome, Firefox, Safari, Edge, Opera)
- ✅ **Detección de Chrome en Windows** para instrucciones específicas
- ✅ **Verificación de PWA ya instalada**

### Interfaz de Usuario:
- ✅ **Botón "Instalar App"** traducido en 4 idiomas
- ✅ **Animaciones de atención** (pulse) para el botón
- ✅ **Instrucciones específicas** por navegador y sistema
- ✅ **Mensajes contextuales** que explican dónde encontrar el icono de Chrome

### Funcionalidad:
- ✅ **Evento beforeinstallprompt** capturado y manejado
- ✅ **Instalación manual** cuando no hay prompt automático
- ✅ **Feedback visual** durante la instalación
- ✅ **Manejo de errores** y cancelaciones

### Experiencia de Usuario:
- ✅ **Explicación del icono 📦** de Chrome en Windows
- ✅ **Instrucciones paso a paso** con imágenes descriptivas
- ✅ **Beneficios de PWA** explicados al usuario
- ✅ **Idioma automático** según preferencias del usuario

## Configuraciones Técnicas

### Parámetros FFMPEG por Operación:
- **Reducir (PC)**: `-vcodec libx265 -crf 28` - Codec HEVC, CRF 28
- **Reducir (Tablet)**: `-crf 28` - Codec H.264, CRF 28
- **Reducir (Móvil)**: `-crf 28 -vf "scale='min(640,iw)':-2"` - Resolución máxima 640px
- **Cortar**: `-ss [inicio] -to [fin] -c copy -map_metadata 0` - Copy stream, preservar metadatos
- **Convertir (MP4)**: `-c:v libx264 -c:a aac -map_metadata 0` - Codecs estándar
- **Convertir (MOV)**: `-c:v mpeg4 -c:a aac -map_metadata 0` - Codecs QuickTime
- **Revertir**: `-vf reverse -af areverse -map_metadata 0` - Reverse video/audio

### Variables Configurables en `VideoGest_FFMPEG.js`:
```javascript
this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
this.outputSuffixes = {
    reduce: { pc: '_PC', tablet: '_Tablet', mobile: '_Movil' },
    cut: '_Cortado',
    convert: '_Convertido',
    reverse: '_Reverse'
};
this.supportedFormats = {
    'mp4': 'mp4', 'mov': 'mov', 'avi': 'avi', 'mkv': 'matroska',
    'webm': 'webm', 'flv': 'flv', 'wmv': 'asf', 'm4v': 'mp4',
    'mpg': 'mpeg', 'mpeg': 'mpeg'
};
```

## Instrucciones de Implementación

### 1. Configuración Inicial:
```bash
# Crear estructura de directorios
mkdir -p VideoGest/assets/{icons,pictos}

# Colocar archivos en sus ubicaciones correspondientes
# (Los archivos ya están listados en este documento)
```

### 2. Generar Iconos PWA:
- Crear icono principal en 512x512px
- Generar versiones en tamaños: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Guardar en `assets/icons/` con nombres consistentes
- Formato PNG con transparencia si es necesario

### 3. Configurar Servidor Web (para PWA):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js con http-server
npx http-server -p 8000
```

### 4. Testing:
1. Abrir `http://localhost:8000/VideoGest.html`
2. Verificar instalación como PWA
3. Probar funcionamiento offline
4. Validar descarga automática de ffmpeg.exe
5. Verificar copia automática al portapapeles
6. Probar las 4 operaciones principales:
   - Reducir tamaño (3 calidades)
   - Cortar video (con tiempos)
   - Convertir formato (10 formatos)
   - Revertir video (con opciones)
7. Probar instalación PWA en diferentes navegadores

## Solución de Problemas

### Problemas Comunes y Soluciones:

1. **Service Worker no se registra**:
   - Verificar que se accede por HTTP/HTTPS, no `file://`
   - Usar servidor web local para testing
   - Ver consola del navegador para errores

2. **FFMPEG no se descarga**:
   - Verificar conexión a internet
   - Asegurarse que PowerShell está disponible
   - Verificar que la URL de ffmpeg.exe es accesible

3. **Comando no se copia automáticamente**:
   - Verificar permisos del portapapeles del navegador
   - Probar en Chrome/Edge (mejor soporte)
   - Usar modo HTTP/HTTPS (no local file)

4. **Aplicación no funciona offline**:
   - Verificar registro de Service Worker
   - Esperar a que se cacheen los archivos
   - Recargar la página una vez instalada

5. **Botón "Instalar App" no aparece**:
   - Verificar que no es modo archivo local (`file://`)
   - Asegurar que el manifest está correctamente configurado
   - Verificar criterios PWA en la consola del navegador

6. **Formatos no aparecen en el selector**:
   - Verificar que `VideoGest_FFMPEG.js` se cargó correctamente
   - Revisar consola del navegador para errores
   - Verificar que `getSupportedFormatsForConversion()` devuelve datos

### Debugging:
- **Consola del navegador**: F12 > Console
- **Service Worker**: F12 > Application > Service Workers
- **Storage**: F12 > Application > Local Storage
- **Debug integrado**: Ctrl+Shift+D en la aplicación
- **Información PWA**: Ver logs en consola para estado de instalación

## Personalización y Extensión

### Añadir Nuevo Idioma:
1. En `VideoGest_Translations.js`, agregar nuevo objeto en `this.translations`:
```javascript
nuevo_idioma: {
    "appTitle": "Título en nuevo idioma",
    "selectLanguage": "Seleccionar idioma",
    "installApp": "Instalar App",
    // ... todas las claves necesarias (ver estructura actual)
}
```

2. En `VideoGest.html`, agregar bandera en el selector de idiomas:
```html
<img src="https://flagcdn.com/w40/xx.png" class="flag" id="flag-xx" data-lang="nuevo_idioma">
```

3. En `VideoGest_App.js`, actualizar `showManualInstallInstructions()` para el nuevo idioma

### Añadir Nuevo Formato de Video:
1. En `VideoGest_FFMPEG.js`, agregar en `supportedFormats`:
```javascript
'formato_nuevo': 'codec_ffmpeg'
```

2. En `VideoGest_Translations.js`, agregar traducciones para el nuevo formato en los 4 idiomas:
```javascript
"formatNUEVO": "NUEVO - Descripción del formato",
```

3. El formato aparecerá automáticamente en el selector

### Cambiar URL de FFMPEG:
1. Modificar `this.ffmpegURL` en `VideoGest_FFMPEG.js`
2. Asegurarse que el nuevo servidor permite CORS si es necesario

## Consideraciones de Seguridad

### Limitaciones del Navegador:
- No se puede ejecutar FFMPEG directamente en el navegador
- Requiere intervención manual del usuario para ejecutar comandos
- Acceso al sistema de archivos limitado por APIs del navegador
- **Instalación PWA requiere interacción explícita del usuario**

### Seguridad de Descargas:
- FFMPEG se descarga desde URL confiable (tu servidor GitHub)
- Verificación de existencia previa antes de descargar
- PowerShell con políticas de ejecución estándar

### Datos del Usuario:
- Archivos de video NO se suben a ningún servidor
- Todo el procesamiento es local en la máquina del usuario
- Configuración guardada solo en localStorage del navegador

### Instalación PWA Segura:
- Requiere consentimiento explícito del usuario
- No se puede automatizar la instalación
- El usuario siempre tiene control total

## Compatibilidad

### Navegadores Soportados:
- ✅ Chrome 80+ (mejor soporte PWA)
- ✅ Firefox 75+
- ✅ Edge 80+ (Chromium)
- ⚠️ Safari 14+ (limitaciones de PWA)
- ❌ Internet Explorer (no soportado)

### Sistemas Operativos:
- ✅ Windows 7, 8, 10, 11 (soporte completo)
- ⚠️ macOS (requiere instalación manual de FFMPEG)
- ⚠️ Linux (requiere instalación manual de FFMPEG)
- ⚠️ Android/iOS (solo visualización, no ejecución FFMPEG)

### Requisitos Mínimos:
- 100MB espacio libre para FFMPEG y videos
- PowerShell 3.0+ (viene con Windows 7+)
- Permisos de escritura en carpeta de destino
- Navegador moderno para PWA

## Mantenimiento

### Actualización de Versión:
1. Incrementar número en `VideoGest_App.js` y `VideoGest.html`
2. Actualizar nombres de cache en `VideoGest_ServiceWorker.js`
3. Modificar fecha en footer de `VideoGest.html`
4. Actualizar `VideoGest_Manifest.json`
5. Actualizar este documento

### Monitoreo de Uso:
- Consola del navegador para errores
- Analytics opcional (no implementado)
- Feedback de usuarios por email

### Backup de Configuración:
La aplicación incluye funciones de exportación/importación:
- Exportar: Guarda toda la configuración en JSON
- Importar: Restaura desde archivo JSON exportado
- Local: Los datos persisten en localStorage del navegador

## Roadmap y Mejoras Futuras

### Planeado para Próximas Versiones:
1. **Más operaciones de video**:
   - Extraer audio de video
   - Añadir subtítulos
   - Rotar video
   - Cambiar velocidad

2. **Mejoras de Interfaz**:
   - Vista previa de video antes/después
   - Estimación de tamaño de salida
   - Historial de operaciones realizadas
   - Editor visual para cortar (timeline)

3. **Funcionalidades Avanzadas**:
   - Procesamiento por lotes
   - Plantillas de configuración
   - Integración con cloud storage opcional
   - Detección automática de codecs

### Optimizaciones Técnicas:
- WebAssembly para procesamiento ligero en navegador
- Workers para operaciones pesadas sin bloquear UI
- Mejor manejo de errores y recuperación
- Cache inteligente de formatos soportados

## Recursos y Referencias

### Documentación Oficial:
- **FFMPEG**: https://ffmpeg.org/documentation.html
- **PWA**: https://web.dev/progressive-web-apps/
- **Service Workers**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Web App Manifest**: https://developer.mozilla.org/en-US/docs/Web/Manifest

### Herramientas de Desarrollo:
- **Generador de iconos PWA**: https://www.pwabuilder.com/imageGenerator
- **Validador de Manifest**: https://manifest-validator.appspot.com/
- **Test de Lighthouse**: En Chrome DevTools > Lighthouse
- **PWA Builder**: https://www.pwabuilder.com/

### Repositorio del Proyecto:
- **Código fuente**: Estructura descrita en este documento
- **Iconos**: Deben generarse según especificaciones
- **FFMPEG**: Se descarga automáticamente desde tu servidor

## Soporte y Contacto

**Autor**: Roberto Benet  
**Email**: rbenet71@gmail.com  
**GitHub**: https://rbenet71.github.io/Web/  
**Repositorio**: https://github.com/rbenet71/Web/tree/main/Genericas/Video_Gestion_App

### Canales de Soporte:
1. **Issues en GitHub**: Para bugs y solicitudes de características
2. **Email directo**: Para consultas privadas o ayuda personalizada
3. **Documentación**: Este archivo y comentarios en el código

### Política de Actualizaciones:
- **Versiones menores**: Correcciones de bugs, cada 1-2 meses
- **Versiones mayores**: Nuevas características, cada 3-6 meses
- **Security patches**: Tan pronto como sea posible

---

## Resumen de Cambios Implementados (Versión 1.0.4)

### Nuevas Funcionalidades Añadidas:
1. ✅ **Cortar Video** - Extraer fragmento con tiempos HH:MM:SS
2. ✅ **Convertir Video** - Entre 10 formatos con preservación de metadatos
3. ✅ **Revertir Video** - Playback inverso con opciones
4. ✅ **Selector visual de formatos** - Grid con descripciones
5. ✅ **Campos de tiempo validados** - Formato HH:MM:SS
6. ✅ **Preservación de metadatos** - Incluyendo datos GPS en todas las operaciones

### Mejoras de Interfaz:
1. ✅ **Paneles específicos** para cada operación
2. ✅ **Diseño consistente** con el patrón existente
3. ✅ **Traducciones completas** para nuevas funcionalidades (4 idiomas)
4. ✅ **Mensajes contextuales** mejorados
5. ✅ **Validaciones en tiempo real** para formatos y tiempos

### Optimizaciones Técnicas:
1. ✅ **Arquitectura modular** en `VideoGest_FFMPEG.js`
2. ✅ **Sufijos automáticos** por operación
3. ✅ **Codecs apropiados** por formato de salida
4. ✅ **Comandos optimizados** para preservar calidad y metadatos

### Eliminaciones (Decisiones de diseño):
1. ❌ **Barra de progreso eliminada** - Sin sentido para procesamiento externo
2. ❌ **Panel de progreso eliminado** del HTML y CSS
3. ❌ **Traducciones de progreso eliminadas** de los 4 idiomas
4. ❌ **Métodos de progreso eliminados** de la UI

### Ventajas de la Nueva Implementación:
- **Más completo**: 4 operaciones principales implementadas
- **Más profesional**: Interfaz pulida y consistente
- **Más usable**: Patrón uniforme para todas las operaciones
- **Más fiable**: Validaciones y mensajes de error mejorados
- **Más internacional**: Soporte completo de 4 idiomas
- **Más mantenible**: Código modular y bien organizado

### Estructura de Comandos Mantenida:
- ✅ **Dos líneas**: Descarga + comando FFMPEG
- ✅ **Copia automática**: Al hacer clic en "Continuar"
- ✅ **Sufijos automáticos**: Por operación y calidad
- ✅ **Preservación original**: Archivo original no se modifica
- ✅ **Metadatos preservados**: Incluyendo GPS en todos los casos

---

**Fecha de última revisión**: 05/01/2026  
**Próxima revisión programada**: 18/03/2026  
**Estado del proyecto**: ✅ Completo y funcional  
**Nivel de estabilidad**: ⭐⭐⭐⭐⭐ (5/5)

---

*Documentación generada automáticamente basada en la estructura actual del proyecto VideoGest v1.0.4*