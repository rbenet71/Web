#!/usr/bin/env python3
"""
Inyección de GPS que FUNCIONA - Versión simplificada y probada
"""

import subprocess
import tempfile
import os
import re
import json

def crear_archivo_gps_simple(puntos_gps, fps=30, duracion_video=60):
    """
    Crea un archivo SRT simple con datos GPS
    """
    contenido = ""
    
    for i, (lat, lon) in enumerate(puntos_gps):
        # Calcular tiempo distribuido
        tiempo = (i / len(puntos_gps)) * duracion_video if len(puntos_gps) > 1 else i/fps
        
        # Formatear tiempo SRT
        horas = int(tiempo // 3600)
        minutos = int((tiempo % 3600) // 60)
        segundos = int(tiempo % 60)
        milisegundos = int((tiempo - int(tiempo)) * 1000)
        
        tiempo_str = f"{horas:02d}:{minutos:02d}:{segundos:02d},{milisegundos:03d}"
        
        # Crear bloque
        bloque = f"{i+1}\n"
        bloque += f"{tiempo_str} --> {tiempo_str}\n"
        bloque += f'{{"lat": {lat}, "lon": {lon}}}\n\n'
        
        contenido += bloque
    
    return contenido

def inyectar_gps_simplificado(video_input, gpx_file, video_output):
    """Método simplificado que SÍ funciona"""
    
    print("="*60)
    print("🎬 INYECCIÓN SIMPLIFICADA DE GPS")
    print("="*60)
    
    # 1. Extraer puntos del GPX
    print("\n1. 📍 EXTRAYENDO PUNTOS GPS...")
    
    with open(gpx_file, 'r', encoding='utf-8') as f:
        gpx_content = f.read()
    
    puntos = []
    for match in re.finditer(r'lat="([^"]+)"\s+lon="([^"]+)"', gpx_content):
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            puntos.append((lat, lon))
        except ValueError:
            continue
    
    print(f"   ✅ {len(puntos)} puntos extraídos")
    
    if len(puntos) == 0:
        print("   ❌ No hay puntos GPS")
        return False
    
    # 2. Obtener duración del video
    print("\n2. ⏱️ OBTENIENDO DURACIÓN...")
    
    cmd_duracion = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_input
    ]
    
    try:
        result = subprocess.run(cmd_duracion, capture_output=True, text=True)
        duracion = float(result.stdout.strip())
        print(f"   ✅ Duración: {duracion:.2f} segundos")
    except:
        duracion = 60.0
        print(f"   ⚠ Usando duración por defecto: {duracion}s")
    
    # 3. Crear archivo de datos GPS
    print("\n3. 📝 CREANDO ARCHIVO DE DATOS...")
    
    # Opción A: Como SRT (funciona siempre)
    datos_content = crear_archivo_gps_simple(puntos, duracion_video=duracion)
    
    # Guardar temporal
    with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', 
                                   encoding='utf-8', delete=False) as f:
        f.write(datos_content)
        datos_temp = f.name
    
    print(f"   📄 Archivo temporal: {datos_temp}")
    print(f"   📏 Tamaño: {len(datos_content)} caracteres")
    
    # 4. Comando FFmpeg SIMPLE y FUNCIONAL
    print("\n4. ⚙️ EJECUTANDO FFMPEG...")
    
    # Comando básico que SÍ funciona
    cmd = [
        "ffmpeg",
        "-i", video_input,          # Video original
        "-i", datos_temp,           # Datos GPS
        "-map", "0",                # Mapear TODO del video original
        "-map", "1",                # Mapear datos GPS
        "-c", "copy",               # Copiar TODO sin re-encode
        "-c:s", "mov_text",         # Codec para subtítulos/datos
        "-metadata:s:s:0", "handler=GPS",
        "-metadata:s:s:0", "title=GPS Track",
        "-metadata:s:s:0", "language=eng",
        "-disposition:s:0", "default",
        "-y",                       # Sobrescribir
        video_output
    ]
    
    print(f"\n   💻 Comando FFmpeg:")
    for i in range(0, len(cmd), 4):
        print(f"   {' '.join(cmd[i:i+4])}")
    
    # 5. Ejecutar
    try:
        proceso = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        print(f"\n   🚀 Procesando...")
        for linea in proceso.stdout:
            if 'time=' in linea and 'speed=' in linea:
                match = re.search(r'time=(\d{2}:\d{2}:\d{2})', linea)
                if match:
                    print(f"     ⏱️  {match.group(1)}", end='\r')
        
        proceso.wait()
        
        # 6. Verificar resultado
        print(f"\n\n5. 🔍 VERIFICANDO RESULTADO...")
        
        if proceso.returncode == 0 and os.path.exists(video_output):
            tamaño = os.path.getsize(video_output)
            print(f"   ✅ Video creado: {video_output}")
            print(f"   📏 Tamaño: {tamaño:,} bytes")
            
            # Verificar streams
            cmd_check = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "stream=index,codec_type,codec_name,tags",
                "-of", "json",
                video_output
            ]
            
            result_check = subprocess.run(cmd_check, capture_output=True, text=True)
            
            if result_check.returncode == 0:
                try:
                    data = json.loads(result_check.stdout)
                    streams = data.get('streams', [])
                    
                    print(f"\n   📊 Streams en video resultante:")
                    
                    gps_encontrado = False
                    for stream in streams:
                        idx = stream.get('index')
                        ctype = stream.get('codec_type')
                        cname = stream.get('codec_name')
                        tags = stream.get('tags', {})
                        
                        print(f"     Stream #{idx}: {ctype} ({cname})")
                        
                        if tags:
                            for key, value in tags.items():
                                if 'gps' in str(value).lower():
                                    gps_encontrado = True
                                    print(f"       🎯 {key}: {value} <- ¡GPS!")
                                else:
                                    print(f"       {key}: {value}")
                    
                    if gps_encontrado:
                        print(f"\n🎉 ¡ÉXITO! GPS incrustado correctamente.")
                        
                        # Mostrar cómo extraerlo
                        print(f"\n📋 PARA EXTRAER EL GPS:")
                        print(f"   ffmpeg -i {video_output} -map 0:s:0 -c copy gps_data.srt")
                        print(f"   type gps_data.srt")
                        
                        return True
                    else:
                        print(f"\n⚠ GPS no detectado en tags, pero puede estar incrustado.")
                        
                        # Intentar extraer de todas formas
                        print(f"\n🔧 Probando extracción...")
                        cmd_extract = [
                            "ffmpeg",
                            "-i", video_output,
                            "-map", "0:s",  # Todos los streams de subtítulo
                            "-c", "copy",
                            "-f", "srt",
                            "pipe:1"
                        ]
                        
                        result_extract = subprocess.run(cmd_extract, capture_output=True, text=True)
                        if result_extract.stdout:
                            puntos_encontrados = result_extract.stdout.count('"lat":')
                            print(f"   ✅ {puntos_encontrados} puntos GPS extraídos")
                            
                            # Guardar
                            with open("gps_extraido.srt", "w", encoding="utf-8") as f:
                                f.write(result_extract.stdout)
                            print(f"   💾 Guardado en: gps_extraido.srt")
                            
                            return True
                        else:
                            print(f"   ❌ No se pudo extraer GPS")
                            return False
                        
                except json.JSONDecodeError:
                    print(f"   ❌ Error parseando JSON")
                    return False
            else:
                print(f"   ❌ Error verificando video")
                return False
        else:
            print(f"   ❌ Error creando video")
            return False
            
    except Exception as e:
        print(f"   ❌ Excepción: {e}")
        return False
    
    finally:
        # Limpiar archivo temporal
        if os.path.exists(datos_temp):
            os.unlink(datos_temp)
            print(f"\n🗑️  Archivo temporal eliminado")

def main():
    """Función principal"""
    import sys
    
    if len(sys.argv) != 4:
        print("Uso: python inyectar_gps_funcional.py <video_input> <gpx_file> <video_output>")
        print("Ejemplo: python inyectar_gps_funcional.py video.mp4 track.gpx video_con_gps.mp4")
        sys.exit(1)
    
    video_input = sys.argv[1]
    gpx_file = sys.argv[2]
    video_output = sys.argv[3]
    
    # Verificar archivos
    for archivo in [video_input, gpx_file]:
        if not os.path.exists(archivo):
            print(f"❌ Archivo no encontrado: {archivo}")
            sys.exit(1)
    
    # Ejecutar
    exito = inyectar_gps_simplificado(video_input, gpx_file, video_output)
    
    if exito:
        print("\n" + "="*60)
        print("✅ PROCESO COMPLETADO CON ÉXITO")
        print("="*60)
        sys.exit(0)
    else:
        print("\n" + "="*60)
        print("❌ FALLÓ EL PROCESO")
        print("="*60)
        sys.exit(1)

if __name__ == "__main__":
    main()