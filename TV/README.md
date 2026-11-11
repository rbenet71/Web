# TV Libre IPTV Web v13 — MPEG-TS estable

Esta versión integra el motor `mpegts.js` y el perfil **Estable** que funcionó en la prueba independiente:

- MPEG-TS directo, búfer inicial de 1 MB (`stashInitialSize: 1048576`).
- `enableStashBuffer: true` y `liveBufferLatencyChasing: false`.
- El motor MPEG-TS se desmonta al cerrar el reproductor o cambiar de canal.
- HLS.js sigue para `.m3u8`; HTML5 sigue para películas y episodios.
- Continúan Xtream, M3U, favoritos, EPG, bibliotecas guardadas y contraseñas opcionales.

## Abrir (sin Python)

1. Descomprime el ZIP en Windows.
2. Abre `index.html` con Google Chrome.
3. En Xtream, selecciona el servidor y elige **MPEG-TS directo sin extensión**. Si está guardado con HLS, cambia el formato y vuelve a conectar para actualizar las URLs de los canales.
4. Haz clic en un canal. El motor arranca automáticamente con el perfil Estable.

No requiere Python ni FFmpeg. Para obtener `mpegts.js` y `hls.js` necesita Internet. El servidor de IPTV debe permitir las solicitudes CORS desde el navegador.

## Seguridad

No compartas el HTML con conexiones guardadas en tu navegador ni los enlaces de streaming que contienen contraseñas. Si marcas "Recordar contraseña", se guarda sin cifrar en el almacenamiento local. Los JSON exportados no incluyen contraseñas.

## Limitaciones

Se ha comprobado la sintaxis JavaScript y el empaquetado. La reproducción real en cada proveedor/dispositivo debe probarse en el navegador. El perfil estable puede introducir algunos segundos de retraso respecto al directo.
