# Video Gestión - Documentación de Estructura

## Descripción General
Video Gestión es una aplicación PWA (Progressive Web App) para procesamiento de videos utilizando FFMPEG directamente en el navegador. La aplicación funciona offline una vez instalada y está preparada para múltiples idiomas.

## Estructura de Archivos

### 1. Video_Gestion.html
Archivo HTML principal que contiene:
- Estructura completa de la aplicación
- 6 modales principales (uno por función)
- Sistema de navegación y menús
- Elementos de interfaz para todas las funcionalidades

### 2. Video_Gestion_manifest.json
Manifest de PWA que define:
- Nombre, descripción y metadatos de la aplicación
- Iconos para diferentes tamaños
- Configuración de pantalla completa (standalone)
- Shortcuts para funciones principales

### 3. Video_Gestion_serviceWorker.js
Service Worker para funcionalidad offline:
- Cache de recursos estáticos
- Gestión de actualizaciones
- Interceptación de solicitudes de red

### 4. Video_Gestion_styles.css
Estilos CSS completos:
- Diseño responsive
- Temas claro/oscuro
- Animaciones y transiciones
- Estilos específicos para cada modal

### 5. Video_Gestion_translaciones.js
Sistema de traducción multilingüe:
- Soporte para Español, Catalán, Inglés y Francés
- Cambio dinámico de idioma
- Persistencia de preferencias

### 6. Video_Gestion_app.js
Núcleo principal de la aplicación:
- Inicialización de componentes
- Gestión de eventos globales
- Coordinación entre módulos
- Control de flujo de la aplicación

### 7. Video_Gestion_procesadorVideo.js
Procesamiento de video con FFMPEG:
- 6 funciones principales de procesamiento
- Integración con FFMPEG.wasm
- Manejo de archivos y formatos
- Preservación de metadatos GPS

### 8. Video_Gestion_almacenamiento.js
Gestión de almacenamiento local:
- Sesiones de trabajo
- Preferencias de usuario
- Historial de archivos
- Sistema de backup/restauración

### 9. Video_Gestion_ui.js
Gestión de interfaz de usuario:
- Control de modales y diálogos
- Validación de formularios
- Actualización dinámica de interfaz
- Componentes reutilizables

## Funcionalidades Principales

### 1. Reducir Tamaño de Video
- Opciones: PC, Tablet, Móvil
- Preserva metadatos GPS
- Barra de progreso
- Nombre automático con sufijo

### 2. Cortar Video
- Selección de tiempos específicos
- Validación de formato HH:MM:SS
- Información de duración automática
- Carpeta destino configurable

### 3. Convertir Formato
- Formatos soportados: MP4, MOV, AVI
- Conversión con máxima calidad
- Preservación de metadatos

### 4. Revertir Video
- Inversión completa de frames
- Procesamiento en el navegador
- Salida con sufijo "_Invertido"

### 5. Convertir a JPG con GPS
- Extracción de fotogramas
- Intervalos configurables (segundos)
- Tamaños: 4K, 1024px, 512px
- Nombres con timestamp HHMMSSS
- Indicación de datos GPS disponibles

### 6. Unir Videos
- Sistema de sesiones guardadas
- Tabla con controles completos
- Múltiples cortes por video
- Reproducción integrada
- Copias de seguridad
- Unión preservando metadatos GPS

## Flujo de Trabajo Típico

### Para procesamiento simple (ej: Reducir tamaño):
1. Usuario selecciona función en menú principal
2. Selecciona archivo de video
3. Configura opciones (calidad)
4. Carpeta destino se auto-completa
5. Inicia procesamiento
6. Barra de progreso muestra avance
7. Archivo se descarga automáticamente

### Para unión de videos:
1. Crear o cargar sesión existente
2. Añadir archivos o carpetas
3. Ordenar y configurar cortes
4. Guardar sesión (opcional)
5. Especificar archivo de salida
6. Ejecutar unión
7. Descargar resultado

## Persistencia de Datos

### Almacenamiento Local:
- Sesiones de trabajo guardadas
- Preferencias de idioma y tema
- Historial de archivos recientes
- Últimas carpetas utilizadas

### Preferencias por Usuario:
- Idioma seleccionado
- Tema (claro/oscuro)
- Configuración de notificaciones
- Opciones por defecto para cada función

## Consideraciones Técnicas

### 1. Compatibilidad
- Navegadores modernos (Chrome, Firefox, Edge)
- Funciona en Windows, macOS, Linux, móviles
- Requiere WebAssembly y File API

### 2. Limitaciones
- Procesamiento en navegador puede ser lento para videos grandes
- Memoria limitada por el navegador
- Algunas funciones avanzadas de FFMPEG no disponibles

### 3. Optimizaciones
- Carga diferida de componentes
- Cache agresivo mediante Service Worker
- Procesamiento por lotes para múltiples archivos

## Mantenimiento y Actualizaciones

### Para añadir nuevas funcionalidades:
1. Agregar opción en menú principal (Video_Gestion.html)
2. Crear modal correspondiente (en mismo archivo)
3. Añadir traducciones (Video_Gestion_translaciones.js)
4. Implementar lógica de procesamiento (Video_Gestion_procesadorVideo.js)
5. Actualizar documentación

### Para modificar existentes:
1. Localizar función en archivo correspondiente
2. Realizar cambios necesarios
3. Verificar compatibilidad con traducciones
4. Probar en diferentes navegadores

### Actualización de versiones:
1. Incrementar número de versión en:
   - Manifest (short_name puede incluir versión)
   - Copyright en footer
   - Service Worker (CACHE_NAME)
2. Actualizar documentación
3. Probar funcionamiento offline

## Consideraciones de Seguridad

### 1. Procesamiento Local
- Todo el procesamiento ocurre en el navegador
- No se envían archivos a servidores externos
- Datos permanecen en el dispositivo del usuario

### 2. Permisos
- Acceso al sistema de archivos (lectura/escritura)
- Almacenamiento persistente
- Ejecución de WebAssembly

### 3. Privacidad
- Sin tracking ni analytics integrados
- Datos de usuario solo en localStorage
- Opción de limpiar todos los datos

## Solución de Problemas

### Problemas Comunes:

1. **FFMPEG no se carga:**
   - Verificar conexión a internet (para carga inicial)
   - Comprobar soporte de WebAssembly
   - Revisar consola para errores

2. **Procesamiento muy lento:**
   - Reducir tamaño/resolución de entrada
   - Dividir videos grandes en segmentos
   - Cerrar otras pestañas del navegador

3. **Error al guardar archivos:**
   - Verificar permisos del navegador
   - Comprobar espacio en disco
   - Usar nombres de archivo válidos

### Recuperación de Datos:
- Sistema de backup automático para sesiones
- Exportación manual de configuración
- Restauración desde archivos JSON

## Notas de Desarrollo

### Convenciones de Código:
- Nombres de archivos en Español
- Comentarios en Español
- Variables y funciones en Inglés (convención JS)
- Identación con 4 espacios

### Pruebas:
- Probar en múltiples navegadores
- Verificar funcionamiento offline
- Probar con diferentes formatos de video
- Validar preservación de metadatos GPS

### Performance:
- Lazy loading de componentes pesados
- Cache de resultados intermedios
- Limpieza periódica de archivos temporales

---

*Última actualización: 18/12/2025*
*Versión actual: V_18_12_2025*
*Desarrollado por: Roberto Benet - rbenet71@gmail.com*