#!/usr/bin/env python3
"""
Extrae correctamente el GPS del video
"""

import subprocess
import json
import sys

def extraer_gps_del_video(video_path, output_file="gps_extraido.srt"):
    """Extrae el GPS del video correctamente"""
    
    print(f"🔍 EXTRAYENDO GPS DE: {video_path}")
    print("="*60)
    
    # 1. Analizar streams
    cmd_analyze = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "stream=index,codec_type,codec_name,tags",
        "-of", "json",
        video_path
    ]
    
    result = subprocess.run(cmd_analyze, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Error analizando video: {result.stderr[:200]}")
        return False
    
    try:
        data = json.loads(result.stdout)
        streams = data.get('streams', [])
        
        print(f"📊 Streams encontrados: {len(streams)}")
        
        # Buscar streams de subtítulo
        subtitle_streams = []
        for stream in streams:
            if stream.get('codec_type') == 'subtitle':
                idx = stream.get('index')
                tags = stream.get('tags', {})
                handler = tags.get('handler_name', '').strip()
                title = tags.get('name', tags.get('title', ''))
                
                subtitle_streams.append({
                    'index': idx,
                    'handler': handler,
                    'title': title,
                    'is_gps': 'gps' in handler.lower() or 'gps' in title.lower() or 'subtitlehandler' in handler.lower()
                })
        
        print(f"\n🎯 Streams de subtítulo encontrados: {len(subtitle_streams)}")
        
        if not subtitle_streams:
            print("❌ No hay streams de subtítulo")
            return False
        
        # Mostrar info
        for i, sub in enumerate(subtitle_streams):
            marca = "✅ GPS" if sub['is_gps'] else "📝 Original"
            print(f"\n  Stream #{sub['index']} ({marca}):")
            print(f"    Handler: '{sub['handler']}'")
            print(f"    Title: '{sub['title']}'")
        
        # 2. Elegir cuál extraer (nuestro GPS)
        stream_a_extraer = None
        
        for sub in subtitle_streams:
            if sub['is_gps']:
                stream_a_extraer = sub['index']
                break
        
        if stream_a_extraer is None:
            # Si no se detecta como GPS, usar el último añadido
            stream_a_extraer = subtitle_streams[-1]['index']
            print(f"\n⚠ GPS no detectado por tags, usando último stream: #{stream_a_extraer}")
        else:
            print(f"\n✅ Extrayendo stream GPS: #{stream_a_extraer}")
        
        # 3. Extraer
        cmd_extract = [
            "ffmpeg",
            "-i", video_path,
            "-map", f"0:{stream_a_extraer}",
            "-c", "copy",
            output_file
        ]
        
        print(f"\n🚀 Extrayendo...")
        result_extract = subprocess.run(cmd_extract, capture_output=True, text=True)
        
        if result_extract.returncode == 0:
            # Verificar contenido
            with open(output_file, 'r', encoding='utf-8') as f:
                contenido = f.read()
            
            if contenido:
                # Contar puntos
                import re
                puntos = re.findall(r'"lat":\s*([\d\.]+).*?"lon":\s*([\d\.]+)', contenido)
                
                print(f"\n🎉 ¡ÉXITO! GPS extraído: {output_file}")
                print(f"📊 Puntos encontrados: {len(puntos)}")
                
                if puntos:
                    print(f"📍 Ejemplos:")
                    for i in range(min(3, len(puntos))):
                        print(f"  {i+1}: Lat={puntos[i][0]}, Lon={puntos[i][1]}")
                
                return True
            else:
                print(f"❌ Archivo extraído vacío")
                return False
        else:
            print(f"❌ Error extrayendo: {result_extract.stderr[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Uso: python extraer_gps_correcto.py <video.mp4> [salida.srt]")
        sys.exit(1)
    
    video = sys.argv[1]
    salida = sys.argv[2] if len(sys.argv) > 2 else "gps_extraido.srt"
    
    exito = extraer_gps_del_video(video, salida)
    
    if exito:
        print("\n" + "="*60)
        print("✅ GPS EXTRAÍDO CORRECTAMENTE")
        print("="*60)
        sys.exit(0)
    else:
        print("\n" + "="*60)
        print("❌ FALLÓ LA EXTRACCIÓN")
        print("="*60)
        sys.exit(1)

if __name__ == "__main__":
    main()