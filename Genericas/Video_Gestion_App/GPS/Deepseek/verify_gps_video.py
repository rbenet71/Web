#!/usr/bin/env python3
"""
verify_gps_video.py - Verifica estructura GPS en video
"""

import subprocess
import json

def check_video_gps(video_path):
    """Analiza completamente un video para GPS"""
    
    # 1. Ver con ffprobe
    cmd = ["ffprobe", "-v", "quiet", "-print_format", "json", 
           "-show_format", "-show_streams", video_path]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ No se puede leer el video: {video_path}")
        return
    
    data = json.loads(result.stdout)
    
    print(f"\n📊 ANÁLISIS DE: {video_path}")
    print("=" * 50)
    
    # Streams
    print(f"Streams encontrados:")
    for stream in data.get('streams', []):
        stype = stream.get('codec_type', 'unknown')
        scodec = stream.get('codec_name', 'unknown')
        print(f"  - {stype}: {scodec}")
        
        # Metadata específica
        if 'tags' in stream:
            tags = stream['tags']
            if 'handler' in tags:
                print(f"    Handler: {tags['handler']}")
            if 'title' in tags:
                print(f"    Title: {tags['title']}")
    
    # 2. Buscar metadata GPS
    print(f"\n🔍 Buscando metadata GPS...")
    
    # ExifTool si está disponible
    try:
        cmd = ["exiftool", "-G", "-n", "-j", video_path]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            exif_data = json.loads(result.stdout)[0]
            
            gps_keys = [k for k in exif_data.keys() if 'gps' in k.lower()]
            if gps_keys:
                print("✅ Metadata GPS encontrada (Exif):")
                for key in gps_keys[:5]:  # Mostrar primeros 5
                    print(f"  {key}: {exif_data[key]}")
            else:
                print("❌ No hay metadata GPS en Exif")
    except:
        print("⚠ exiftool no disponible")
    
    # 3. Verificar con nuestro toolkit
    print(f"\n🎯 Verificación final:")
    
    # Stream de datos?
    data_streams = [s for s in data.get('streams', []) 
                   if s.get('codec_type') == 'data']
    
    if data_streams:
        print(f"✅ Tiene {len(data_streams)} stream(s) de datos")
        for ds in data_streams:
            handler = ds.get('tags', {}).get('handler', 'Desconocido')
            print(f"  - Handler: {handler}")
    else:
        print("❌ No tiene streams de datos (GPS estandarizado)")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Uso: python verify_gps_video.py <video1> <video2> ...")
        sys.exit(1)
    
    for video in sys.argv[1:]:
        check_video_gps(video)
        print("\n" + "=" * 50 + "\n")