# 📘 Calculadora de Tiempos

Documentación técnica y funcional de la aplicación **Calculadora de Tiempos**, orientada a mantenimiento, ampliación y comprensión de la arquitectura.

---

## 1. 🎯 Objetivo de la aplicación

La aplicación permite realizar **cálculos relacionados con tiempos deportivos**, principalmente en ciclismo, tales como:

- Operaciones matemáticas básicas
- Conversión y manejo de tiempo (h · m · s)
- Cálculo de velocidad media (Promedio)
- Cálculo de duración de un recorrido (Duración)
- Cálculo de número de vueltas

Todo ello con:
- Interfaz tipo calculadora
- Soporte multidioma (ES / CA / EN / FR)
- Formato de tiempo propio
- Soporte PWA

---

## 2. 🧱 Estructura general del archivo

La aplicación se distribuye en un único archivo HTML:

```
Calculadora_Tiempos.html
```

Estructura principal:

```
<html>
 ├─ <head>
 │   ├─ Metadatos
 │   ├─ Estilos CSS
 │   ├─ Configuración PWA
 │   └─ Recursos externos
 │
 └─ <body>
     ├─ Interfaz de calculadora
     │   ├─ Header (idiomas + ayuda)
     │   ├─ Display
     │   ├─ Botonera
     │   └─ Footer
     │
     ├─ Modales
     │   ├─ Promedio
     │   ├─ Vueltas
     │   ├─ Duración
     │   ├─ Instalación
     │   └─ Sugerencias
     │
     └─ Lógica JavaScript
```

---

## 3. 🎛️ Interfaz de Usuario (UI)

### 3.1 Header

Elementos:
- Selector de idioma mediante banderas
- Texto indicativo: `Idioma / Language`
- Icono de ayuda (FontAwesome)

IDs relevantes:
- `flag-es`, `flag-ca`, `flag-en`, `flag-fr`
- `help-icon-header`

---

### 3.2 Display

Componentes:

| Elemento | ID | Descripción |
|--------|----|-------------|
| Modo | `displayModeIndicator` | Indica Modo Tiempo o Decimal |
| Operación | `currentOperation` | Texto explicativo del cálculo |
| Resultado | `currentInput` | Valor principal mostrado |
| Historial | `history` | Registro de operaciones |

---

### 3.3 Botonera

Tipos de botones:

- Numéricos (`data-number`)
- Operaciones (`data-operation`)
- Unidades de tiempo (`data-unit`)
- Memoria (`data-memory`)
- Especiales:
  - `averageBtn` → Cálculo Promedio
  - `lapsBtn` → Número de Vueltas
  - `durationBtn` → Duración

---

## 4. 🪟 Modales

Todos los modales comparten:
- Clase: `modal`
- Cierre por botón o clic externo

### 4.1 Modal Promedio

Calcula velocidad media:

```
Velocidad = Distancia / Tiempo
```

### 4.2 Modal Vueltas

Calcula número de vueltas posibles en un tiempo objetivo.

### 4.3 Modal Duración

Calcula tiempo necesario:

```
Tiempo = Distancia / Velocidad
```

Campos:
- Distancia (km)
- Velocidad media (km/h)

Resultado:
- Se muestra como tiempo (h m s)
- Se añade una línea al historial

---

## 5. 🌍 Sistema de idiomas

La internacionalización se gestiona mediante el objeto:

```
const translations = { es, ca, en, fr }
```

Cada idioma contiene:
- Textos de UI
- Etiquetas de botones
- Placeholders
- Mensajes de error

Función clave:

```
updateLanguage(lang)
```

Responsabilidades:
- Cambiar textos visibles
- Activar bandera
- Mantener coherencia en modales

---

## 6. 🧠 Lógica principal (JavaScript)

### 6.1 Clase `TimeCalculator`

Responsable del núcleo de la aplicación.

Estados internos:

```js
currentInput
currentOperation
mode              // decimal | time
waitingForNewInput
timeInput { h,m,s }
history[]
```

---

### 6.2 Métodos clave

| Método | Función |
|------|--------|
| `inputNumber()` | Entrada numérica |
| `setUnit()` | Construcción de tiempo |
| `formatTime()` | Segundos → h m s |
| `addToHistory()` | Añade línea al historial |
| `calculateAverage()` | Velocidad media |
| `calculateDuration()` | Tiempo necesario |
| `calculateLaps()` | Número de vueltas |

---

## 7. 🧮 Cálculo de Duración (detalle)

Flujo:

1. Leer distancia y velocidad
2. Convertir a segundos:
   ```js
   Math.round((distance / speed) * 3600)
   ```
3. Formatear con `formatTime()`
4. Añadir texto al historial:
   ```
   Duración: 130km / 86.67 km/h = 1h 30m 00s
   ```
5. Mostrar resultado en display

---

## 8. 🧾 Historial

- Almacena operaciones especiales
- Formato textual
- Scroll automático

Diseñado para:
- Transparencia de cálculo
- Uso arbitral / deportivo

---

## 9. 📱 PWA e instalación

Incluye:
- `manifest.json`
- Iconos
- Instalación en:
  - Android
  - iOS
  - Windows

Gestión mediante la clase:

```
AppInstaller
```

---

## 10. 🔧 Recomendaciones para futuras ampliaciones

- Exportar historial a PDF
- Modo oficial (redondeo deportivo)
- Unidades imperiales
- Tests unitarios del motor de tiempo
- Separación JS en módulos

---

## 11. 👤 Autor

**Roberto Benet**  
Email: rbenet71@gmail.com

---

📌 *Documento pensado como referencia técnica y base de mantenimiento del proyecto.*