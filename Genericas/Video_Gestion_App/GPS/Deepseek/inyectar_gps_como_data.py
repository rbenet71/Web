#!/usr/bin/env python3
"""
Inyecta GPS como stream de DATA (no subtitle)
"""

import subprocess
import tempfile
import os
import re

def inyectar_gps_como_data(video_input, gpx_file, video_output):
    """Inyecta GPS como stream de datos, no como subtítulo"""
    
    print("🎬 INYECTANDO GPS COMO STREAM DE DATOS")
    
    # 1. Extraer puntos del GPX
    with open(gpx_file, 'r') as f:
        contenido = f.read()
    
    puntos = []
    for match in re.finditer(r'lat="([^"]+)"\s+lon="([^"]+)"', contenido):
        puntos.append((float(match.group(1)), float(match.group(2))))
    
    print(f"📍 Puntos GPS: {len(puntos)}")
    
    # 2. Crear archivo de datos en formato propio
    datos_content = ""
    for i, (lat, lon) in enumerate(puntos):
        datos_content += f"{i},{lat:.6f},{lon:.6f}\n"
    
    # Guardar temporal
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write(datos_content)
        datos_temp = f.name
    
    # 3. Comando FFmpeg para crear stream de DATOS
    cmd = [
        "ffmpeg",
        "-i", video_input,
        "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
        "-i", datos_temp,
        "-map", "0:v", "-map", "1:a", "-map", "2",
        "-c:v", "copy",
        "-c:a", "aac",
        "-c:d", "copy",  # Copiar datos sin re-encoding
        "-metadata:s:d:0", "handler=GPS Data",
        "-metadata:s:d:0", "title=GPS Coordinates",
        "-metadata:s:d:0", "mimetype=application/gps+csv",
        "-disposition:d:0", "attached_pic",
        "-y",
        video_output
    ]
    
    print(f"🚀 Ejecutando FFmpeg...")
    resultado = subprocess.run(cmd, capture_output=True, text=True)
    
    # Limpiar
    os.unlink(datos_temp)
    
    if resultado.returncode == 0:
        print(f"✅ Video creado: {video_output}")
        return True
    else:
        print(f"❌ Error: {resultado.stderr[:200]}")
        return False

# Ejecutar
if __name__ == "__main__":
    inyectar_gps_como_data("video.mp4", "GRMN2288.gpx", "video_gps_data.mp4")