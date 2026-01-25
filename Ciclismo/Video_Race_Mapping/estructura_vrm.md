# Video Race Mapping (VRM)
## Documentación técnica y funcional completa

---

## 0. Versionado

- **vXX**: versión técnica interna del HTML durante iteraciones (ej: v19f, v22).
- **VRM 2.X**: versión visible en la cabecera del producto (ej: VRM 2.2).
- Regla acordada: cuando se hace un cambio, se parte de una base (p.ej. v22) y se publica como **VRM 2.X**.
- Convención para variantes: si se prueban alternativas, se usan sufijos **a, b, c…** sobre la misma base.

## 1. Descripción general

### 1.1 Estado actual (baseline)
- Fecha de esta documentación: **2026-01-24**
- Baseline funcional reciente: **VRM 2.2** (HTML v22)
- Último cambio relevante: **VRM 2.3** (mapas offline ICGC mediante tiles locales)
- Importante: el proyecto conserva el historial interno por “vXX” y el nombre visible por “2.X”.


**Video Race Mapping (VRM)** es una aplicación web en un único archivo HTML diseñada para sincronizar:

- Vídeo (MP4)
- Track GPS (GPX / KML / KMZ)
- Rutómetro desde Excel
- Mapa interactivo (Leaflet)
- Perfil de elevación
- Tabla sincronizada de puntos

El objetivo principal es permitir el análisis de una etapa ciclista sincronizando el vídeo con la posición real sobre el recorrido.

---

## 2. Restricciones del navegador (aprendizajes clave)

### 2.1 Acceso al sistema de archivos
- El navegador **NO permite** listar carpetas automáticamente.
- El usuario debe seleccionar una carpeta mediante:
  ```html
  <input type="file" webkitdirectory>
  ```
- Todos los archivos deben cargarse desde esa selección.

### 2.2 Autocarga condicional
- Sí es posible autocargar archivos **solo si el usuario ya expuso la carpeta**.
- Se usa el basename del vídeo para buscar GPX / Excel asociados.

---

## 3. Estructura visual (layout)

### 3.1 Cabecera (header fijo)
Contiene:
- Logo (`logo.jpg`)
- Nombre de la app: **Video Race Mapping (VRM)**
- Botón para ocultar/mostrar la zona de operaciones
- Línea secundaria con:
  - `Video: <nombre>`
  - o `Carrera: <datos>` si hay Excel de cabecera

### 3.1.1 Elementos de cabecera (detalles)
- A la derecha: botón/chevron para **ocultar/mostrar** la zona de operaciones.
- Se muestra el **nombre de versión** (ej: *VRM 2.2* / *VRM 2.3*).
- La línea secundaria muestra **Carrera:** con datos del Excel (si existe), o **Video:** si no.

### 3.2 Zona de operaciones (`#controls`)
- Botones, selectores y acciones
- Puede colapsarse
- **NO tocar layout global sin permiso explícito**

### 3.3 Área principal
Incluye:
- Vídeo
- Mapa Leaflet
- Tabla de rutómetro
- Perfil de elevación (canvas)

### 3.4 Pie fijo (footer)
```
© 2026 Roberto Benet - rbenet71@gmail.com
```
- Posición fija
- El contenido reserva espacio para no quedar oculto

---

## 4. Flujo principal de la aplicación

1. Usuario selecciona una carpeta
2. Se indexan archivos por extensión y basename
3. Usuario selecciona un MP4
4. Se carga el vídeo
5. Autocarga opcional de:
   - GPX/KML/KMZ
   - Excel
6. Se dibuja el track, el mapa y el perfil
7. Se sincronizan:
   - Vídeo ↔ Track ↔ Tabla ↔ Perfil

---

## 5. Modelos de datos internos

### 5.1 Track (`trackPts[]`)
Cada punto contiene:
- lat, lon
- ele (opcional)
- time / tOffset
- dist (metros acumulados)

### 5.2 Rutómetro (`rutometreWpts[]`)
- Distancia (ajustada)
- Tiempo
- Texto / observaciones

### 5.3 Cabecera de carrera (`stageHeader`)
Objeto con campos Excel:
- Codi_Num_Etapa
- Nom_Etapa
- km
- Sortida_Neutralitzada_Km
- Sortida_Neutralitzada_Hora
- Sortida_Real_Hora
- Velocitat_2

---

## 6. Neutralización de kilómetros

### Concepto
El track incluye un tramo neutralizado previo al km 0 real.

### Implementación
- Se lee `Sortida_Neutralitzada_Km` del Excel
- Se guarda en:
  ```js
  neutralizedKmOffset
  ```

### Cálculo correcto (v19f+)
```js
adjustedKm = (distMeters / 1000) - neutralizedKmOffset
```

- Se **permiten km negativos**
- km < 0 → tramo neutralizado
- km = 0 → inicio real
- km > 0 → carrera

### Visualización
- Km negativos se muestran en rojo
- Etiqueta `N` (neutralizada) en HUD y perfil

---

## 7. Funciones críticas

### loadExcelFile(file)
- Lee Excel con `xlsx`
- Detecta hoja de cabecera por nombre que **contenga** "cabecera"
- Soporta dos formatos:
  - Fila cabecera + fila datos
  - Clave / valor en dos columnas
- Guarda offset de neutralización
- Renderiza titular de carrera
- Carga rutómetro

### loadTrackFile(file)
- Parse GPX / KML / KMZ
- Calcula distancias acumuladas
- Dibuja track en mapa
- Dibuja perfil de elevación

### syncToPoint(point)
- Centra mapa
- Actualiza marcador
- Actualiza HUD
- Actualiza perfil
- Marca fila activa del rutómetro

### drawElevationProfile()
- Dibuja perfil
- Cursor sincronizado
- Cambio de color si km < 0

---

## 8. Sincronización

### Desde el vídeo
Evento:
```js
video.addEventListener('timeupdate', ...)
```

- Busca punto de track más cercano
- Llama a `syncToPoint()`
- Resalta fila

### Desde la tabla
- Click en fila → salto a vídeo + mapa

---

## 9. Mapas base

### 9.1 Online (como hasta ahora)
- OpenStreetMap (OSM)
- Google (online)
- Google Terrain (online)
- ESRI
- ICGC Topo (online)
- ICGC Orto (online)

### 9.2 Offline (ICGC)
- A partir de **VRM 2.3** se soporta un modo **Offline (carpeta `mapas offline/`)** con:
  - `ICGC Topo (offline)` → `mapas offline/icgc_topo/{z}/{x}/{y}.png` (maxZoom 18)
  - `ICGC Orto (offline)` → `mapas offline/icgc_orto/{z}/{x}/{y}.jpg` (maxZoom 19)
- **Google NO** se usa offline (por permisos/licencia).

---

## 10. Reglas de oro para futuras modificaciones

1. **Un solo cambio cada vez**
2. **Nunca tocar layout sin pedir permiso**
3. No mezclar:
   - header + footer + grid + flex en el mismo paso
4. Siempre devolver **HTML completo**
5. Si algo rompe sincronía → rollback inmediato

---

## 11. Filosofía del proyecto

VRM es:
- Herramienta técnica
- Pensada para análisis real de carrera
- Flexible, no “bonita primero”
- La sincronización manda sobre el diseño

---

Fin de documentación.


## 12. GPS embebido en MP4 (Dashcam / móvil)

### 12.1 Objetivo
Soportar vídeos que **incluyen GPS embebido al final del MP4** (p.ej. grabaciones de móvil/dashcam), de forma que:
- Si el vídeo trae GPS embebido → se usa ese GPS.
- Si no trae GPS embebido → se usa el **GPX/KML/KMZ** seleccionado o autocargado.

### 12.2 Flujo
1. Usuario selecciona el MP4.
2. VRM analiza el final del archivo (cola) buscando el bloque GPS (según formato de la app de grabación).
3. Si se encuentra y parsea correctamente:
   - Se construye `trackPts[]` con esos puntos.
   - Se recalcula distancia acumulada y elevación si existe.
4. Si no se encuentra:
   - Se mantiene el flujo clásico con GPX/KML/KMZ.

### 12.3 Archivos de referencia
- Ejemplo MP4 con GPS embebido: `RBB_20260102_1342_S01.mp4`
- Código de la app de grabación: `Dashcam_App.js` (sirve para entender el formato y la firma del bloque GPS).
- Baseline web: a partir de **VRM 2.2** este comportamiento está integrado.


## 13. Mapas offline (ICGC)

### 13.1 Estructura esperada por VRM
En la misma carpeta donde está el HTML de VRM:
```
mapas offline/
├── icgc_topo/
│   └── {z}/{x}/{y}.png
└── icgc_orto/
    └── {z}/{x}/{y}.jpg
```

### 13.2 Método A (recomendado) — QGIS exportando XYZ tiles
1. En QGIS, asegúrate de trabajar en **EPSG:3857**.
2. Añade las capas ICGC como **XYZ Tiles** (Topo y Orto).
3. Define la extensión a exportar (ideal: polígono de Catalunya) para no generar tiles de más.
4. Menú: **Proyecto → Importar/Exportar → Generar teselas XYZ (MBTiles)**.
5. Elige **salida en estructura XYZ (carpetas)** y carpeta destino:
   - `mapas offline/icgc_topo`
   - `mapas offline/icgc_orto`
6. Zooms recomendados:
   - Topo: **6–18**
   - Orto: **6–19**

### 13.3 Método B — GDAL (gdal2tiles.py) generando estructura XYZ
Herramientas: GDAL (Windows: OSGeo4W; macOS: `brew install gdal`).

**Topo (PNG) Z6–18**
```bash
gdal2tiles.py -z 6-18 -r bilinear -w none \
"https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wms/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=topo&CRS=EPSG:3857&FORMAT=image/png" \
"mapas offline/icgc_topo"
```

**Orto (JPG) Z6–19**
```bash
gdal2tiles.py -z 6-19 -r bilinear -w none \
"https://geoserveis.icgc.cat/icc_mapesmultibase/utm/wms/service?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=orto&CRS=EPSG:3857&FORMAT=image/jpeg" \
"mapas offline/icgc_orto"
```

### 13.4 Método C (futuro/ideal) — PMTiles
PMTiles empaqueta todo en un solo archivo (más cómodo de copiar), pero requiere integrar lector PMTiles en el HTML.
En el roadmap se planteó como opción ideal, pero el modo implementado en **VRM 2.3** es el de **tiles en carpeta**.

### 13.5 Tamaño esperado
Para Catalunya completa y máximo detalle:
- Topo Z6–18: ~**6–10 GB**
- Orto Z6–19: ~**25–40 GB**
- Total típico: **30–50 GB** (varía por compresión y cobertura real exportada).

### 13.6 iOS / iPad notas
- El uso offline consiste en abrir el HTML y cargar imágenes locales.
- Dependiendo del método de apertura, iOS puede ser restrictivo con rutas locales. Si Safari con `file://` limita, suele funcionar mejor abrir el HTML desde una app tipo **Documents** (WebView).
Sí 👍, buena idea dejar todo esto **consolidado en el MD**, porque aquí hay muchos *aprendizajes reales de PWA* que no son obvios hasta que te pegas con ello.

He revisado el `estructura_vrm.md` que has subido  y **no recoge todavía** todo lo que hemos aprendido sobre:

* instalación PWA real
* `beforeinstallprompt`
* manifest mínimo válido
* favicon
* Service Worker separado
* avisos “engañosos” de Chrome DevTools

Te propongo **añadir un nuevo capítulo completo**, sin tocar lo existente, algo así:

---

# 14. PWA (instalación como aplicación)

Este capítulo recoge **aprendizajes reales tras depurar la instalación PWA en Windows / Chrome / Edge e iOS**.

---

## 14.1 Requisitos mínimos para que VRM sea instalable

Para que Chrome/Edge ofrezcan *Instalar aplicación* se necesitan **todos**:

1. Servido por **HTTP/HTTPS** (no `file://`)
2. `manifest.json` válido
3. `Service Worker` registrado y activo
4. `display: "standalone"` en el manifest
5. Icono válido **existente**
6. `start_url` accesible
7. **No errores JS en carga**

---

## 14.2 Manifest.json (caso real VRM)

### Estado final correcto

```json
{
  "name": "Video Race Mapping",
  "short_name": "VRM",
  "id": "vrm",
  "start_url": "/VRM.html",
  "display": "standalone",
  "background_color": "#111827",
  "theme_color": "#111827",
  "description": "Video Race Mapping (VRM): sincroniza vídeo con GPX/KML y mapa.",
  "icons": [
    {
      "src": "logo.jpg",
      "sizes": "192x192",
      "type": "image/jpeg",
      "purpose": "any"
    },
    {
      "src": "logo.jpg",
      "sizes": "512x512",
      "type": "image/jpeg",
      "purpose": "any"
    }
  ]
}
```

### Aprendizajes clave

* **No inventar iconos**: si solo existe `logo.jpg`, usarlo.
* Chrome acepta JPG como icono.
* `id` ayuda a evitar duplicados de instalación.
* `start_url` debe coincidir con la ruta real servida.

---

## 14.3 `<head>` correcto para PWA (HTML)

Estado final recomendado en `VRM.html`:

```html
<link rel="manifest" href="VRM_manifest.json">

<meta name="theme-color" content="#111111">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<link rel="apple-touch-icon" href="logo.jpg" />
<link rel="icon" href="logo.jpg">
```

### Notas importantes

* `<meta name="apple-mobile-web-app-capable">` **está deprecado**
* Chrome muestra warning si no existe:

  ```html
  <meta name="mobile-web-app-capable" content="yes">
  ```
* Las etiquetas **NO necesitan “barras de cierre” obligatorias**, pero es buena práctica usar:

  ```html
  <link ... />
  ```

---

## 14.4 Favicon (error 404 explicado)

### Problema visto

```
favicon.ico 404 (File not found)
```

### Solución simple

Opción A (recomendada):

```html
<link rel="icon" href="logo.jpg">
```

Opción B:

* Crear `favicon.ico`
* O copiar `logo.jpg` como `favicon.ico`

> Este error **no impide la instalación PWA**, solo es ruido de consola.

---

## 14.5 Service Worker (archivo separado)

### Regla de oro

➡️ **El Service Worker debe estar en un archivo independiente**
Ejemplo correcto:

```
/VRM.html
/vrm_sw.js
/VRM_manifest.json
/logo.jpg
```

Nunca concatenar el SW dentro del HTML.

---

## 14.6 Registro del Service Worker

Código final funcional:

```js
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('vrm_sw.js');
}
```

### Aprendizajes

* No funciona en `file://`
* DevTools → *Update on reload* provoca **spam de reinstalaciones**
* Cada recarga forzada genera:

  ```
  Service Worker was updated because "Update on reload" was checked
  ```

Esto **no es un bug de VRM**, es DevTools.

---

## 14.7 beforeinstallprompt (aviso engañoso explicado)

Mensaje visto:

```
Banner not shown: beforeinstallpromptevent.preventDefault() called.
```

### Qué significa realmente

* **NO es un error**
* Significa:

  * Has capturado el evento
  * Chrome **no muestra el banner automático**
  * Espera que tú llames a `.prompt()`

### Implementación correcta (la que tienes)

```js
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = '';
});
```

Y luego, **solo al hacer clic**:

```js
await deferredPrompt.prompt();
```

### Conclusión

✔ Comportamiento correcto
✔ UX controlada
✔ El warning se puede ignorar

---

## 14.8 iOS (Safari) – realidades

* iOS **NO usa** `beforeinstallprompt`
* No hay banner automático
* Instalación solo vía:

  ```
  Compartir → Añadir a pantalla de inicio
  ```
* Correcto mostrar **modal de ayuda manual**, como hace VRM.

---

## 14.9 Checklist rápido (cuando algo no se instala)

1. ¿Está servido por `http://`?
2. ¿El manifest carga sin error?
3. ¿El icono existe?
4. ¿Hay SW activo en *Application → Service Workers*?
5. ¿No estás en modo incógnito?
6. ¿DevTools no tiene “Update on reload” activado?
7. ¿No hay errores JS en consola?

---

## 14.10 Estado actual de VRM

✔ Instalable en **Windows (Chrome / Edge)**
✔ Instalable en **Android**
✔ Añadible a inicio en **iOS**
✔ Control manual del botón instalar
✔ Actualización por SW funcional

