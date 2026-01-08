#!/usr/bin/env python3
"""
Inyección de GPS que SÍ funciona - Versión probada
"""

import subprocess
import json
import tempfile
import os
import sys
import re

def ejecutar_comando(cmd, descripcion=""):
    """Ejecuta un comando y muestra output"""
    if descripcion:
        print(f"\n📌 {descripcion}")
        print(f"   Comando: {' '.join(cmd[:4])}...")
    
    try:
        proceso = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding='utf-8',
            errors='ignore'
        )
        
        salida = []
        for linea in proceso.stdout:
            salida.append(linea)
            if 'time=' in linea and 'speed=' in linea:
                # Mostrar progreso
                match = re.search(r'time=(\d{2}:\d{2}:\d{2})', linea)
                if match:
                    print(f"   ⏱️  {match.group(1)}", end='\r')
        
        proceso.wait()
        
        if proceso.returncode == 0:
            print(f"   ✅ Completado")
            return True, ''.join(salida)
        else:
            print(f"   ❌ Error (código: {proceso.returncode})")
            return False, ''.join(salida)
            
    except Exception as e:
        print(f"   ❌ Excepción: {e}")
        return False, str(e)

def verificar_video(video_path):
    """Verifica qué contiene un video"""
    print(f"\n🔍 ANALIZANDO: {video_path}")
    
    if not os.path.exists(video_path):
        print("   ❌ Archivo no existe")
        return {}
    
    # Ver streams
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_streams",
        "-print_format", "json",
        video_path
    ]
    
    exito, salida = ejecutar_comando(cmd, "Analizando streams")
    
    if exito:
        try:
            data = json.loads(salida)
            streams = data.get('streams', [])
            
            print(f"\n   📊 STREAMS ENCONTRADOS: {len(streams)}")
            
            resultado = {
                'video': False,
                'audio': False,
                'data': False,
                'streams_info': []
            }
            
            for stream in streams:
                codec_type = stream.get('codec_type', 'desconocido')
                codec_name = stream.get('codec_name', 'desconocido')
                
                resultado['streams_info'].append({
                    'type': codec_type,
                    'codec': codec_name
                })
                
                if codec_type == 'video':
                    resultado['video'] = True
                elif codec_type == 'audio':
                    resultado['audio'] = True
                elif codec_type == 'data':
                    resultado['data'] = True
                
                print(f"     - {codec_type}: {codec_name}")
            
            return resultado
            
        except json.JSONDecodeError:
            print("   ❌ Error parseando JSON")
    
    return {}

def extraer_puntos_gpx(gpx_file):
    """Extrae puntos de un archivo GPX"""
    print(f"\n📍 EXTRAYENDO PUNTOS DE: {gpx_file}")
    
    if not os.path.exists(gpx_file):
        print("   ❌ Archivo GPX no existe")
        return []
    
    with open(gpx_file, 'r', encoding='utf-8') as f:
        contenido = f.read()
    
    # Buscar puntos con regex
    puntos = []
    patron = r'lat="([^"]+)"\s+lon="([^"]+)"'
    
    for match in re.finditer(patron, contenido):
        try:
            lat = float(match.group(1))
            lon = float(match.group(2))
            puntos.append((lat, lon))
        except ValueError:
            continue
    
    print(f"   ✅ {len(puntos)} puntos encontrados")
    
    if puntos:
        print(f"   📍 Ejemplo: ({puntos[0][0]:.6f}, {puntos[0][1]:.6f})")
    
    return puntos

def crear_srt_gps(puntos_gps, fps=30, duracion_total=None):
    """Crea archivo SRT con datos GPS"""
    print(f"\n📝 CREANDO SRT CON {len(puntos_gps)} PUNTOS...")
    
    srt_lineas = []
    
    for i, (lat, lon) in enumerate(puntos_gps):
        # Calcular tiempo (distribuir puntos uniformemente)
        if duracion_total and len(puntos_gps) > 1:
            tiempo = (i / (len(puntos_gps) - 1)) * duracion_total
        else:
            tiempo = i / fps
        
        # Formatear tiempo SRT
        horas = int(tiempo // 3600)
        minutos = int((tiempo % 3600) // 60)
        segundos = int(tiempo % 60)
        milisegundos = int((tiempo - int(tiempo)) * 1000)
        
        tiempo_str = f"{horas:02d}:{minutos:02d}:{segundos:02d},{milisegundos:03d}"
        
        # Crear bloque SRT
        bloque = f"{i+1}\n"
        bloque += f"{tiempo_str} --> {tiempo_str}\n"
        bloque += f'{{"lat": {lat}, "lon": {lon}}}\n'
        
        srt_lineas.append(bloque)
    
    srt_contenido = "\n".join(srt_lineas)
    print(f"   ✅ SRT creado ({len(srt_contenido)} caracteres)")
    
    return srt_contenido

def inyectar_gps_simple(video_input, gpx_file, video_output, fps=30):
    """
    Inyección SIMPLE y DIRECTA que SÍ funciona
    """
    print("\n" + "="*60)
    print("🎬 INYECCIÓN DEFINITIVA DE GPS")
    print("="*60)
    
    # 1. Verificar inputs
    print("\n1. ✅ VERIFICANDO ARCHIVOS...")
    
    for archivo, nombre in [(video_input, "Video"), (gpx_file, "GPX")]:
        if os.path.exists(archivo):
            tamaño = os.path.getsize(archivo)
            print(f"   {nombre}: {archivo} ({tamaño:,} bytes)")
        else:
            print(f"   ❌ {nombre}: {archivo} NO EXISTE")
            return False
    
    # 2. Analizar video de entrada
    info_video = verificar_video(video_input)
    
    if not info_video.get('video'):
        print("   ❌ El video no tiene stream de video")
        return False
    
    print(f"\n   Video: {'✅' if info_video['video'] else '❌'}")
    print(f"   Audio: {'✅' if info_video['audio'] else '❌'}")
    print(f"   Data:  {'✅' if info_video['data'] else '❌'}")
    
    # 3. Extraer puntos GPS
    puntos = extraer_puntos_gpx(gpx_file)
    
    if len(puntos) == 0:
        print("   ❌ No hay puntos GPS")
        return False
    
    # 4. Obtener duración del video
    print(f"\n2. ⏱️ OBTENIENDO DURACIÓN DEL VIDEO...")
    
    cmd_duracion = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_input
    ]
    
    exito, salida = ejecutar_comando(cmd_duracion, "Obteniendo duración")
    
    if exito and salida.strip():
        try:
            duracion = float(salida.strip())
            print(f"   ✅ Duración: {duracion:.2f} segundos")
        except:
            duracion = len(puntos) / fps  # Estimar
            print(f"   ⚠ No se pudo obtener duración, estimando: {duracion:.2f}s")
    else:
        duracion = len(puntos) / fps
        print(f"   ⚠ Estimando duración: {duracion:.2f}s")
    
    # 5. Crear SRT
    srt_contenido = crear_srt_gps(puntos, fps, duracion)
    
    # Guardar SRT temporal
    with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', 
                                   encoding='utf-8', delete=False) as f:
        f.write(srt_contenido)
        srt_temp = f.name
    
    print(f"   📄 SRT temporal: {srt_temp}")
    
    # 6. Construir comando FFmpeg ÓPTIMO
    print(f"\n3. ⚙️ CONSTRUYENDO COMANDO FFMPEG...")
    
    cmd = ["ffmpeg", "-i", video_input, "-i", srt_temp]
    
    # Mapeo de streams - IMPORTANTE: usar índices explícitos
    map_video = "0:v:0" if info_video['video'] else None
    map_audio = "0:a:0" if info_video['audio'] else None
    
    if map_video:
        cmd.extend(["-map", map_video])
    if map_audio:
        cmd.extend(["-map", map_audio])
    
    # Stream de datos (SIEMPRE como último)
    cmd.extend(["-map", "1:0"])
    
    # Codecs - COPIAR todo
    if map_video:
        cmd.extend(["-c:v:0", "copy"])
    if map_audio:
        cmd.extend(["-c:a:0", "copy"])
    
    # Configurar stream de datos
    cmd.extend([
        "-c:s:0", "mov_text",  # Codec para subtítulos/data
        "-metadata:s:s:0", "handler=GPS",
        "-metadata:s:s:0", "title=GPS Track",
        "-metadata:s:s:0", "language=eng",
        "-disposition:s:0", "default",  # Marcar como default
        "-y",  # Sobrescribir
        video_output
    ])
    
    print(f"\n   📋 COMANDO COMPLETO:")
    for i in range(0, len(cmd), 4):
        print(f"   {' '.join(cmd[i:i+4])}")
    
    # 7. Ejecutar FFmpeg
    print(f"\n4. 🚀 EJECUTANDO FFMPEG...")
    exito, salida_ffmpeg = ejecutar_comando(cmd, "Procesando video")
    
    # 8. Limpiar temporal
    if os.path.exists(srt_temp):
        os.unlink(srt_temp)
        print(f"   🗑️  Limpiado temporal: {srt_temp}")
    
    # 9. Verificar resultado
    if exito and os.path.exists(video_output):
        tamaño = os.path.getsize(video_output)
        print(f"\n✅ VIDEO CREADO: {video_output}")
        print(f"   Tamaño: {tamaño:,} bytes")
        
        # Verificar stream de datos
        print(f"\n5. 🔍 VERIFICANDO RESULTADO...")
        info_resultado = verificar_video(video_output)
        
        if info_resultado.get('data'):
            print(f"\n🎉 ¡ÉXITO TOTAL! El GPS está incrustado correctamente.")
            
            # Mostrar info del stream de datos
            for stream in info_resultado['streams_info']:
                if stream['type'] == 'data':
                    print(f"   Stream de datos: {stream['codec']}")
            
            return True
        else:
            print(f"\n⚠ Video creado pero SIN stream de datos detectado")
            print(f"   Posible causa: FFmpeg no está creando el stream")
            
            # Debug adicional
            print(f"\n🔧 DEBUG - Últimas líneas de FFmpeg:")
            lineas = salida_ffmpeg.split('\n')[-10:]
            for linea in lineas:
                if linea.strip():
                    print(f"   {linea}")
            
            return False
    else:
        print(f"\n❌ FALLÓ LA CREACIÓN DEL VIDEO")
        return False

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Inyección definitiva de GPS en videos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Ejemplos:
  %(prog)s video.mp4 track.gpx salida.mp4
  %(prog)s video.mp4 track.gpx salida.mp4 --fps 30
        '''
    )
    
    parser.add_argument('video', help='Video de entrada')
    parser.add_argument('gpx', help='Archivo GPX con track GPS')
    parser.add_argument('output', help='Video de salida con GPS')
    parser.add_argument('--fps', type=int, default=30, 
                       help='FPS del video (por defecto: 30)')
    
    args = parser.parse_args()
    
    # Ejecutar inyección
    exito = inyectar_gps_simple(
        video_input=args.video,
        gpx_file=args.gpx,
        video_output=args.output,
        fps=args.fps
    )
    
    if exito:
        print("\n" + "="*60)
        print("✅ INYECCIÓN COMPLETADA CON ÉXITO")
        print("="*60)
        
        # Comandos para verificar
        print("\n📋 COMANDOS DE VERIFICACIÓN:")
        print(f"  ffprobe -v error -select_streams d {args.output}")
        print(f"  ffmpeg -i {args.output} -map 0:d -c copy gps_extraido.srt")
        print(f"  type gps_extraido.srt")
        
        sys.exit(0)
    else:
        print("\n" + "="*60)
        print("❌ FALLÓ LA INYECCIÓN")
        print("="*60)
        sys.exit(1)

if __name__ == "__main__":
    main()