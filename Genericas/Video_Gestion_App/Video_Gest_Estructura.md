# VideoGest - Documentación Completa Actualizada

## Descripción General
VideoGest es una aplicación PWA (Progressive Web App) para la gestión de archivos de vídeo utilizando FFMPEG. La aplicación funciona offline y está preparada para múltiples idiomas.

## Versión
**Versión Actual:** 1.0.2  
**Última Actualización:** 18/12/2025  
**Autor:** Roberto Benet - rbenet71@gmail.com

## Características Principales
✅ **Reducción automática de tamaño de video** con tres calidades:
   - Calidad PC (H.265/HEVC) - Máxima compresión manteniendo calidad
   - Calidad Tablet (H.264) - Balance calidad/tamaño
   - Calidad Móvil (H.264) - Tamaño reducido para dispositivos móviles

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
├── VideoGest_Styles.css    # Estilos CSS
├── VideoGest_App.js        # Lógica principal de la aplicación
├── VideoGest_Translations.js # Sistema de traducción (4 idiomas)
├── VideoGest_Storage.js    # Gestión de almacenamiento local
├── VideoGest_FFMPEG.js     # Generación de comandos FFMPEG
├── VideoGest_UI.js         # Gestión de interfaz de usuario
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
- Todos los paneles de interfaz (principal, reducción, ayuda, idiomas, FFMPEG, progreso)
- Referencias a todos los archivos CSS y JavaScript
- Metadatos para PWA (manifest, theme-color, icons)
- **Cambio importante**: Eliminado botón "Copiar Comando" - ahora es automático
- Footer con información de copyright y versión
- **NUEVO**: Botón "Instalar App" para instalación PWA
- **NUEVO**: Selector de idiomas con banderas interactivas

### 2. VideoGest_Styles.css
**Propósito**: Estilos visuales y diseño responsive  
**Características**:
- Variables CSS para fácil personalización de colores
- Diseño flexbox/grid para layouts responsivos
- Estilos específicos para cada tipo de panel
- Animaciones para transiciones y mensajes
- Media queries para diferentes tamaños de pantalla
- Sistema de colores coherente con el branding
- **NUEVO**: Estilos para botón de instalación PWA con animaciones
- **NUEVO**: Estilos para selector de idiomas con banderas

### 3. VideoGest_Translations.js
**Propósito**: Sistema de internacionalización multi-idioma  
**Características**:
- Clase `VideoGestTranslations` para manejo centralizado
- Soporte para 4 idiomas: Español, Catalán, Inglés, Francés
- Detección automática del idioma del navegador
- Persistencia del idioma seleccionado en localStorage
- Métodos para cambiar y aplicar traducciones dinámicamente
- Eventos para notificar cambios de idioma
- **NUEVO**: Traducción completa para instalación PWA en todos los idiomas
- **NUEVO**: Texto del botón "Instalar App" traducido

### 4. VideoGest_Storage.js
**Propósito**: Gestión de almacenamiento persistente  
**Características**:
- Clase `VideoGestStorage` con métodos para localStorage/sessionStorage
- Configuración por defecto con valores predefinidos
- Historial de comandos ejecutados (últimos 10)
- Exportación/importación de configuración completa
- Datos temporales en sessionStorage
- Métodos para limpiar datos específicos o completos

### 5. VideoGest_FFMPEG.js
**Propósito**: Generación y manejo de comandos FFMPEG  
**Características**:
- **ACTUALIZADO**: Comandos de dos líneas que no usan `&&`
- **NUEVO**: Descarga automática de ffmpeg.exe si no existe
- **NUEVO**: Tres calidades preconfiguradas (PC, Tablet, Móvil)
- **NUEVO**: Nombres de salida automáticos (`_PC.mp4`, `_Tablet.mp4`, `_Movil.mp4`)
- Validación de operaciones y parámetros
- Estimación de tiempo de procesamiento
- Configuraciones recomendadas por operación
- URL configurable para descarga de ffmpeg.exe

### 6. VideoGest_UI.js
**Propósito**: Gestión completa de la interfaz de usuario  
**Características**:
- **ACTUALIZADO**: Copia automática al portapapeles al hacer clic en "Ejecutar"
- **ELIMINADO**: Botón "Copiar Comando" - ahora es automático
- **NUEVO**: Flujo de usuario simplificado
- **NUEVO**: Sistema de mensajes toast mejorado
- Manejo de todos los eventos de interfaz
- Control de navegación entre paneles
- Sistema de instalación PWA
- Barra de progreso dinámica
- Validación de formularios

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

### 9. VideoGest_Manifest.json
**Propósito**: Configuración de Progressive Web App  
**Características**:
- Configuración completa para instalación como app nativa
- Iconos en múltiples tamaños para diferentes dispositivos
- Shortcuts para operaciones frecuentes
- Configuración de orientación y display
- Metadatos para descubrimiento en tiendas de apps
- **ACTUALIZADO**: Información de versión completa

## Flujo de Trabajo Actualizado

### Para Reducir Tamaño de Vídeo:
1. **Seleccionar operación** "Reducir Tamaño" desde el panel principal
2. **Seleccionar archivo** de video (cualquier formato soportado por FFMPEG)
3. **Elegir calidad**:
   - **PC**: H.265/HEVC para máxima compresión con calidad
   - **Tablet**: H.264 balanceado para tablets
   - **Móvil**: H.264 optimizado para dispositivos móviles
4. **Hacer clic en "Ejecutar"**:
   - ✅ **Se genera el comando FFMPEG automáticamente**
   - ✅ **Se copia AUTOMÁTICAMENTE al portapapeles** (sin botón adicional)
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
   - Segunda línea: Procesa el video con la calidad seleccionada
   - Mantiene el archivo original intacto
   - Genera nuevo archivo con sufijo correspondiente

### Para Instalar como Aplicación (PWA):
1. **En Chrome para Windows**:
   - Opción 1: Buscar icono 📦 a la derecha de la barra de direcciones → Hacer clic → "Instalar VideoGest"
   - Opción 2: Hacer clic en menú (⋮) → "Instalar VideoGest"
   - Opción 3: Usar botón "Instalar App" en la aplicación

2. **En otros navegadores/sistemas**:
   - Buscar opción "Instalar" en el menú del navegador
   - Seguir instrucciones específicas que muestra la aplicación

## Comandos FFMPEG Generados (Ejemplos)

### Calidad PC (H.265/HEVC):
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -vcodec libx265 -crf 28 "video_original_PC.mp4"
```

### Calidad Tablet (H.264):
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -crf 28 "video_original_Tablet.mp4"
```

### Calidad Móvil (H.264):
```batch
if not exist "ffmpeg.exe" powershell -Command "Invoke-WebRequest -Uri 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe' -OutFile 'ffmpeg.exe'"
ffmpeg -y -i "video_original.mp4" -crf 28 -vf "scale='min(640,iw)':-2" "video_original_Movil.mp4"
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

### Parámetros FFMPEG por Calidad:
- **PC (H.265)**: `-vcodec libx265 -crf 28` - Codec HEVC, CRF 28
- **Tablet (H.264)**: `-crf 28` - Codec H.264, CRF 28
- **Móvil (H.264)**: `-crf 28 -vf "scale='min(640,iw)':-2"` - Resolución máxima 640px

### Variables Configurables:
```javascript
// En VideoGest_FFMPEG.js
this.ffmpegURL = 'https://rbenet71.github.io/Web/Genericas/Video_Gestion_App/ffmpeg.exe';
this.outputSuffixes = {
    pc: '_PC',
    tablet: '_Tablet',
    mobile: '_Movil'
};
this.qualitySettings = {
    pc: '-vcodec libx265 -crf 28',
    tablet: '-crf 28',
    mobile: '-crf 28 -vf "scale=\'min(640,iw)\':-2"'
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
6. Probar instalación PWA en diferentes navegadores

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
    "installApp": "Instalar App",  // ¡NO OLVIDAR ESTA CLAVE!
    // ... todas las claves necesarias
}
```

2. En `VideoGest.html`, agregar bandera en el selector de idiomas:
```html
<img src="https://flagcdn.com/w40/xx.png" class="flag" id="flag-xx" data-lang="nuevo_idioma">
```

3. En `VideoGest_App.js`, actualizar `showManualInstallInstructions()` para el nuevo idioma

### Añadir Nueva Operación de Video:
1. En `VideoGest.html`, agregar botón en la grilla de operaciones
2. En `VideoGest_Translations.js`, agregar traducciones
3. En `VideoGest_FFMPEG.js`, agregar configuración en `ffmpegCommands`
4. En `VideoGest_UI.js`, manejar el evento en `handleOperationSelect()`

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
1. Incrementar número en `VideoGest_App.js`
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
   - Recortar (cut) con interfaz visual
   - Unir múltiples videos
   - Extraer audio
   - Añadir subtítulos

2. **Mejoras de Interfaz**:
   - Vista previa de video antes/después
   - Estimación de tamaño de salida
   - Historial de operaciones realizadas

3. **Funcionalidades Avanzadas**:
   - Procesamiento por lotes
   - Plantillas de configuración
   - Integración con cloud storage opcional

### Optimizaciones Técnicas:
- WebAssembly para procesamiento ligero en navegador
- Workers para operaciones pesadas sin bloquear UI
- Mejor manejo de errores y recuperación

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

## Resumen de Cambios Implementados

### Cambios Principales (Última Actualización):
1. ✅ **Copia automática al portapapeles** - Eliminado botón redundante
2. ✅ **Descarga automática de FFMPEG** - Sin intervención manual
3. ✅ **Comandos de dos líneas** - Más robustos que usando `&&`
4. ✅ **Detección de modo local** - Service Worker solo en HTTP/HTTPS
5. ✅ **Nombres automáticos de salida** - Sufijos por calidad
6. ✅ **Sistema de debug integrado** - Ctrl+Shift+D para información
7. ✅ **Flujo de usuario simplificado** - Menos pasos, más intuitivo
8. ✅ **Sistema completo de instalación PWA** - Con detección de Chrome en Windows
9. ✅ **Instrucciones específicas por navegador** - Mejor experiencia de usuario
10. ✅ **Traducciones completas** - Botón "Instalar App" en 4 idiomas

### Ventajas de la Nueva Implementación:
- **Más fácil para el usuario**: Solo 2 clics para copiar y continuar
- **Más robusto**: Comandos que funcionan en más versiones de Windows
- **Más automático**: FFMPEG se descarga solo si es necesario
- **Mejor experiencia**: Mensajes claros, instrucciones paso a paso
- **Más profesional**: Interfaz pulida, sin elementos redundantes
- **Instalación nativa**: Funciona como aplicación de Windows
- **Offline completo**: Trabaja sin conexión a internet
- **Multi-idioma**: Soporte completo para 4 idiomas

### Código Eliminado/Simplificado:
- ❌ Botón "Copiar Comando" en HTML y CSS
- ❌ Event listener para copiar en UI.js
- ❌ Lógica de `&&` en comandos FFMPEG
- ❌ Verificación manual de existencia de FFMPEG

### Código Añadido/Mejorado:
- ✅ Copia automática en `executeReduceOperation()`
- ✅ Comando de dos líneas en `generateCommand()`
- ✅ Detección de protocolo en `registerServiceWorker()`
- ✅ Sistema de debug en `VideoGest_App.js`
- ✅ Mejores mensajes de instrucción en traducciones
- ✅ Sistema completo de instalación PWA
- ✅ Detección de navegador y sistema operativo
- ✅ Instrucciones específicas para Chrome en Windows
- ✅ Animaciones para botón de instalación

---

**Fecha de última revisión**: 18/12/2025  
**Próxima revisión programada**: 18/03/2026  
**Estado del proyecto**: ✅ Completo y funcional  
**Nivel de estabilidad**: ⭐⭐⭐⭐⭐ (5/5)

---

*Documentación generada automáticamente basada en la estructura actual del proyecto VideoGest v1.0.3*