# VideoGrabadora GPS+ con OneDrive

Aplicación web progresiva (PWA) para grabar videos con datos GPS superpuestos y sincronización automática con OneDrive.

## 🚀 Características

- ✅ Grabación de video con cámara frontal/trasera
- ✅ Superposición de datos GPS (coordenadas, velocidad, altitud)
- ✅ Sincronización automática con OneDrive
- ✅ Modos de almacenamiento: Local, OneDrive automático, OneDrive manual
- ✅ Galería dual: Videos locales vs videos en OneDrive
- ✅ Eliminación automática local después de subir (opcional)
- ✅ PWA: Instalable en iOS y Android
- ✅ Funciona offline (grabación local)

## 📋 Requisitos

1. **Cuenta de Microsoft Azure** para obtener Client ID de OneDrive
2. **Navegador moderno** con soporte para:
   - MediaRecorder API
   - Geolocation API
   - IndexedDB
   - Service Workers

## 🔧 Configuración

### 1. Registrar aplicación en Azure
1. Ve a [portal.azure.com](https://portal.azure.com)
2. Azure Active Directory → Registros de aplicaciones → Nueva registro
3. Nombre: `VideoGrabadora GPS+`
4. Tipos de cuenta soportados: `Cuentas en cualquier directorio organizacional`
5. URI de redirección: Web → `https://tudominio.com/` (o localhost para desarrollo)
6. Copia el **Application (client) ID**

### 2. Configurar permisos de API
1. En tu aplicación registrada → Permisos de API
2. Agregar permisos → Microsoft Graph → Permisos delegados
3. Seleccionar:
   - `Files.ReadWrite`
   - `User.Read`
   - `offline_access`
4. Hacer clic en "Conceder consentimiento del administrador"

### 3. Actualizar Client ID
En `script.js`, línea 18:
```javascript
ONEDRIVE_CLIENT_ID: 'TU_CLIENT_ID_AQUI', // ← Reemplazar con tu Client ID