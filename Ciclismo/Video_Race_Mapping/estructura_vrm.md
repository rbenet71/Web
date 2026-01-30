# Video Race Mapping (VRM)
## Documentación técnica y funcional completa

---

## 0. Versionado

- **vXX**: versión técnica interna del HTML durante iteraciones (ej: v19f, v22).
- **VRM 2.X**: versión visible en la cabecera del producto (ej: VRM 2.2).
- Regla acordada: cuando se hace un cambio, se parte de una base (p.ej. v22) y se publica como **VRM 2.X**.
- Convención para variantes: si se prueban alternativas, se usan sufijos **a, b, c…** sobre la misma base.

---

## 1. Descripción general

### 1.1 Estado actual (baseline)
- Fecha de esta documentación: **2026-01-30**
- Baseline funcional reciente: **VRM 2.10+** (según cabecera del HTML actual)
- Último cambio relevante: **Modo paquete (carrera.js embebido Base64) + compatibilidad file:// + restauración modo carpeta**

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
````

* Todos los archivos del modo carpeta deben cargarse desde esa selección.

### 2.2 CORS en ejecución local (`file://`)

* En `file://` el navegador **bloquea `fetch()`** hacia archivos locales (`*.gpx`, `*.xlsx`, `*.kmz`, etc.).
* Por tanto:

  * ✅ Leer archivos como `File` (vía `<input webkitdirectory>`) funciona.
  * ❌ `fetch("data/e1.gpx")` desde `file://` falla por CORS.
* Implicación: para soportar “paquete” en `file://`, los datos deben ir **embebidos** (Base64 / texto) o servirse por HTTP.

### 2.3 Autocarga condicional

* Sí es posible autocargar archivos **solo si el usuario ya expuso la carpeta**.
* Se usa el basename del vídeo para buscar GPX / Excel asociados.

---

## 3. Estructura visual (layout)

### 3.1 Cabecera (header fijo)

Contiene:

* Logo (`logo.jpg` o `data/<logo>` si hay carrera externa)
* Nombre de la app: **Video Race Mapping (VRM)** o nombre de carrera si existe `data/carrera.js`
* Botón para ocultar/mostrar la zona de operaciones
* Línea secundaria con:

  * `Video: <nombre>`
  * o `Carrera: <datos>` si hay Excel de cabecera

### 3.1.1 Elementos de cabecera (detalles)

* A la derecha: botón/chevron para **ocultar/mostrar** la zona de operaciones.
* Se muestra el **nombre de versión** (ej: *VRM 2.2* / *VRM 2.3*).
* La línea secundaria muestra **Carrera:** con datos del Excel (si existe), o **Video:** si no.

### 3.2 Zona de operaciones (`#controls`)

* Botones, selectores y acciones
* Puede colapsarse
* **NO tocar layout global sin permiso explícito**

### 3.3 Área principal

Incluye:

* Vídeo
* Mapa Leaflet
* Tabla de rutómetro
* Perfil de elevación (canvas)

### 3.4 Pie fijo (footer)

```
© 2026 Roberto Benet - rbenet71@gmail.com
```

* Posición fija
* El contenido reserva espacio para no quedar oculto

---

## 4. Flujo principal de la aplicación (dos modos)

### 4.1 Modo A — Carpeta (modo clásico)

1. Usuario selecciona una carpeta
2. Se indexan archivos por extensión y basename
3. Usuario selecciona un MP4
4. Se carga el vídeo
5. Autocarga opcional de:

   * GPX/KML/KMZ
   * Excel
6. Se dibuja el track, el mapa y el perfil
7. Se sincronizan:

   * Vídeo ↔ Track ↔ Tabla ↔ Perfil

### 4.2 Modo B — Paquete (carrera.js embebido, compatible file://)

1. Existe `data/carrera.js`
2. VRM carga `carrera.js` por `<script src="data/carrera.js">` (compatible con `file://`)
3. El selector de vídeos se rellena (e1…e7) con una opción inicial: **"Elige MP4"**
4. Usuario elige un vídeo desde el selector
5. VRM reproduce el MP4 desde `data/<video>.mp4`
6. VRM crea `File` en memoria desde Base64 (`gpx_b64`, `xlsx_b64`, `kmz_b64`) y reutiliza el pipeline clásico:

   * parse GPX
   * load Excel con `xlsx`
   * load KMZ/KML
7. Se sincronizan:

   * Vídeo ↔ Track ↔ Tabla ↔ Perfil

---

## 5. Modelos de datos internos

### 5.1 Track (`trackPts[]`)

Cada punto contiene:

* lat, lon
* ele (opcional)
* time / tOffset
* dist (metros acumulados)

### 5.2 Rutómetro (`rutometreWpts[]`)

* Distancia (ajustada)
* Tiempo
* Texto / observaciones

### 5.3 Cabecera de carrera (`stageHeader`)

Objeto con campos Excel:

* Codi_Num_Etapa
* Nom_Etapa
* km
* Sortida_Neutralitzada_Km
* Sortida_Neutralitzada_Hora
* Sortida_Real_Hora
* Velocitat_2

---

## 6. Neutralización de kilómetros

### Concepto

El track incluye un tramo neutralizado previo al km 0 real.

### Implementación

* Se lee `Sortida_Neutralitzada_Km` del Excel
* Se guarda en:

  ```js
  neutralizedKmOffset
  ```

### Cálculo correcto (v19f+)

```js
adjustedKm = (distMeters / 1000) - neutralizedKmOffset
```

* Se **permiten km negativos**
* km < 0 → tramo neutralizado
* km = 0 → inicio real
* km > 0 → carrera

### Visualización

* Km negativos se muestran en rojo
* Etiqueta `N` (neutralizada) en HUD y perfil

---

## 7. Funciones críticas

### loadExcelFile(file)

* Lee Excel con `xlsx`
* Detecta hoja de cabecera por nombre que **contenga** "cabecera"
* Soporta dos formatos:

  * Fila cabecera + fila datos
  * Clave / valor en dos columnas
* Guarda offset de neutralización
* Renderiza titular de carrera
* Carga rutómetro

### loadTrackFile(file)

* Parse GPX / KML / KMZ
* Calcula distancias acumuladas
* Dibuja track en mapa
* Dibuja perfil de elevación

### syncToPoint(point)

* Centra mapa
* Actualiza marcador
* Actualiza HUD
* Actualiza perfil
* Marca fila activa del rutómetro

### drawElevationProfile()

* Dibuja perfil
* Cursor sincronizado
* Cambio de color si km < 0

---

## 8. Sincronización

### Desde el vídeo

Evento:

```js
video.addEventListener('timeupdate', ...)
```

* Busca punto de track más cercano
* Llama a `syncToPoint()`
* Resalta fila

### Desde la tabla

* Click en fila → salto a vídeo + mapa

---

## 9. Mapas base

### 9.1 Online (como hasta ahora)

* OpenStreetMap (OSM)
* Google (online)
* Google Terrain (online)
* ESRI
* ICGC Topo (online)
* ICGC Orto (online)

### 9.2 Offline (ICGC)

* A partir de **VRM 2.3** se soporta un modo **Offline (carpeta `mapas offline/`)** con:

  * `ICGC Topo (offline)` → `mapas offline/icgc_topo/{z}/{x}/{y}.png` (maxZoom 18)
  * `ICGC Orto (offline)` → `mapas offline/icgc_orto/{z}/{x}/{y}.jpg` (maxZoom 19)
* **Google NO** se usa offline (por permisos/licencia).

---

## 10. Reglas de oro para futuras modificaciones

1. **Un solo cambio cada vez**
2. **Nunca tocar layout sin pedir permiso**
3. No mezclar:

   * header + footer + grid + flex en el mismo paso
4. Siempre devolver **HTML completo** (si se solicita)
5. Si algo rompe sincronía → rollback inmediato
6. **Un solo handler** para `mp4Select.change` (evitar duplicados que “pisen” el modo carpeta o el modo paquete)

---

## 11. Filosofía del proyecto

VRM es:

* Herramienta técnica
* Pensada para análisis real de carrera
* Flexible, no “bonita primero”
* La sincronización manda sobre el diseño

---

## 12. GPS embebido en MP4 (Dashcam / móvil)

### 12.1 Objetivo

Soportar vídeos que **incluyen GPS embebido al final del MP4** (p.ej. grabaciones de móvil/dashcam), de forma que:

* Si el vídeo trae GPS embebido → se usa ese GPS.
* Si no trae GPS embebido → se usa el **GPX/KML/KMZ** seleccionado o autocargado.

### 12.2 Flujo

1. Usuario selecciona el MP4.
2. VRM analiza el final del archivo (cola) buscando el bloque GPS (según formato de la app de grabación).
3. Si se encuentra y parsea correctamente:

   * Se construye `trackPts[]` con esos puntos.
   * Se recalcula distancia acumulada y elevación si existe.
4. Si no se encuentra:

   * Se mantiene el flujo clásico con GPX/KML/KMZ.

### 12.3 Archivos de referencia

* Ejemplo MP4 con GPS embebido: `RBB_20260102_1342_S01.mp4`
* Código de la app de grabación: `Dashcam_App.js` (sirve para entender el formato y la firma del bloque GPS).
* Baseline web: a partir de **VRM 2.2** este comportamiento está integrado.

---

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

   * `mapas offline/icgc_topo`
   * `mapas offline/icgc_orto`
6. Zooms recomendados:

   * Topo: **6–18**
   * Orto: **6–19**

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

* Topo Z6–18: ~**6–10 GB**
* Orto Z6–19: ~**25–40 GB**
* Total típico: **30–50 GB** (varía por compresión y cobertura real exportada).

### 13.6 iOS / iPad notas

* El uso offline consiste en abrir el HTML y cargar imágenes locales.
* Dependiendo del método de apertura, iOS puede ser restrictivo con rutas locales. Si Safari con `file://` limita, suele funcionar mejor abrir el HTML desde una app tipo **Documents** (WebView).

---

## 14. Modo paquete (carrera.js embebido Base64)

### 14.1 Objetivo

Permitir entregar a un usuario un paquete “listo para usar”:

* `VRM.html`
* `data/`

  * `e1.mp4 ... e7.mp4`
  * `carrera.js` (con GPX/KMZ/XLSX embebidos Base64)
* Ejecutable incluso desde `file://` sin CORS.

### 14.2 Estructura esperada

```
VRM.html
data/
  carrera.js
  e1.mp4 e1.gpx e1.xlsx e1.kmz
  e2.mp4 e2.gpx e2.xlsx ...
```

### 14.3 Formato de `carrera.js`

`window.CARRERA_CONFIG` contiene:

* `nombre`, `logo`
* `videos` (orden)
* `etapas[]` (por base del mp4) con:

  * `id`, `video`
  * `gpx_b64` / `kmz_b64` / `kml_b64` / `xlsx_b64` (y `_mime`, `_name`)

### 14.4 Generación automática (Python)

Se usa un script tipo `compactar.py` / `build_carrera.py`:

* Lee el directorio `data/`
* Agrupa por basename
* **No embebe mp4**
* Embebe en Base64: GPX/KMZ/KML/XLSX/XLS
* Genera `data/carrera.js`

### 14.5 Reglas de compatibilidad

* En modo paquete se evita `fetch()` y se crean `File` en memoria desde Base64.
* Para no romper el modo carpeta:

  * Debe existir **un único** `mp4Select.addEventListener("change", ...)`
  * El handler decide:

    * “paquete” si la etapa trae `_b64`
    * “carpeta” si existe `mp4Files.get(name)` y cargas GPX/KMZ/XLSX desde los `File` de la carpeta

---

Fin de documentación.

```