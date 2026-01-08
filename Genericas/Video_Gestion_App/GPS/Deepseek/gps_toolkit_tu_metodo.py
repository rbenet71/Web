#!/usr/bin/env python3
"""
Kit GPS para videos - Versión usando TU método de extracción
"""

import subprocess
import json
import tempfile
import os
import sys
import re
from pathlib import Path
from datetime import datetime, timedelta
import xml.etree.ElementTree as ET

class VideoGPSToolkit:
    def __init__(self, ffmpeg_path="ffmpeg", ffprobe_path="ffprobe", exiftool_path="exiftool"):
        self.ffmpeg = ffmpeg_path
        self.ffprobe = ffprobe_path
        self.exiftool = exiftool_path
    
    def extract_gpx_tu_metodo(self, video_pattern="*.mp4", output_dir=".", fmt_file="gpx.fmt"):
        """
        Extrae GPS usando TU método probado: exiftool -p gpx.fmt -ee -ext mp4 -w .gpx *.mp4
        """
        print(f"📤 Extrayendo GPS con TU método...")
        print(f"   Patrón: {video_pattern}")
        print(f"   Formato: {fmt_file}")
        
        # Verificar que existe gpx.fmt
        if not os.path.exists(fmt_file):
            print(f"❌ Archivo {fmt_file} no encontrado")
            return []
        
        # Crear directorio de salida si no existe
        os.makedirs(output_dir, exist_ok=True)
        
        # Comando EXACTAMENTE como tú lo haces
        cmd = [
            self.exiftool,
            "-p", fmt_file,
            "-ee",
            "-ext", "mp4",
            "-w", ".gpx",
            video_pattern
        ]
        
        print(f"📋 Comando: {' '.join(cmd)}")
        
        try:
            # Ejecutar
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='ignore',
                cwd=output_dir  # Ejecutar en el directorio de salida
            )
            
            if result.returncode != 0:
                print(f"⚠ exiftool retornó código {result.returncode}")
                print(f"Stderr: {result.stderr[:200]}")
            
            # Buscar archivos .gpx creados
            gpx_files = []
            for ext in ['.gpx', '.GPX']:
                gpx_files.extend(Path(output_dir).glob(f"*{ext}"))
            
            print(f"\n✅ Archivos GPX creados: {len(gpx_files)}")
            for gpx in gpx_files:
                size = gpx.stat().st_size
                print(f"   • {gpx.name} ({size:,} bytes)")
                
                # Verificar contenido
                with open(gpx, 'r', encoding='utf-8') as f:
                    content = f.read(500)
                    puntos = content.count('<trkpt')
                    print(f"     Puntos GPS: {puntos}")
            
            return [str(gpx) for gpx in gpx_files]
            
        except FileNotFoundError:
            print("❌ exiftool no encontrado. Descarga de: https://exiftool.org/")
            print("   Coloca exiftool.exe en este directorio")
            return []
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def extract_gpx_from_single_video(self, video_path, fmt_file="gpx.fmt"):
        """
        Extrae GPS de un solo video (método alternativo)
        """
        print(f"📤 Extrayendo GPS de: {video_path}")
        
        # Nombre del archivo GPX (mismo nombre que el video)
        gpx_path = Path(video_path).with_suffix('.gpx')
        
        # Tu método adaptado para un solo archivo
        cmd = [
            self.exiftool,
            "-p", fmt_file,
            "-ee",
            video_path
        ]
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='ignore'
            )
            
            if result.returncode != 0:
                print(f"❌ Error exiftool: {result.stderr[:200]}")
                return None
            
            # Guardar en archivo
            with open(gpx_path, 'w', encoding='utf-8') as f:
                f.write(result.stdout)
            
            # Verificar
            size = os.path.getsize(gpx_path)
            with open(gpx_path, 'r') as f:
                puntos = f.read().count('<trkpt')
            
            print(f"✅ GPX creado: {gpx_path}")
            print(f"   Tamaño: {size:,} bytes")
            print(f"   Puntos GPS: {puntos}")
            
            return str(gpx_path)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def parse_gpx_file(self, gpx_file):
        """
        Parsea archivo GPX - Versión robusta
        """
        print(f"📖 Parseando: {gpx_file}")
        
        try:
            with open(gpx_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Método 1: Usar ElementTree con namespace
            try:
                # Registrar namespace
                ET.register_namespace('', "http://www.topografix.com/GPX/1/0")
                
                root = ET.fromstring(content)
                
                # Buscar puntos con diferentes métodos
                puntos = []
                
                # Método A: Buscar directamente (sin namespace)
                for trkpt in root.findall('.//trkpt'):
                    puntos.append(self._extraer_punto(trkpt))
                
                # Método B: Si no encontró, buscar con namespace
                if not puntos:
                    ns = {'gpx': 'http://www.topografix.com/GPX/1/0'}
                    for trkpt in root.findall('.//gpx:trkpt', ns):
                        puntos.append(self._extraer_punto(trkpt))
                
                print(f"✅ Parseados {len(puntos)} puntos (ElementTree)")
                return puntos
                
            except ET.ParseError:
                # Método 2: Parseo manual con regex
                print("⚠ Usando parseo regex...")
                return self._parse_gpx_manualmente(content)
                
        except Exception as e:
            print(f"❌ Error parseando: {e}")
            return []
    
    def _extraer_punto(self, trkpt_element):
        """Extrae datos de un elemento trkpt"""
        lat = trkpt_element.get('lat')
        lon = trkpt_element.get('lon')
        
        ele = '0'
        time_str = ''
        
        # Extraer elevación
        ele_elem = trkpt_element.find('ele')
        if ele_elem is not None and ele_elem.text:
            ele = ele_elem.text
        
        # Extraer tiempo
        time_elem = trkpt_element.find('time')
        if time_elem is not None and time_elem.text:
            time_str = time_elem.text
        
        return {
            'lat': float(lat) if lat else 0,
            'lon': float(lon) if lon else 0,
            'ele': float(ele) if ele else 0,
            'time': time_str
        }
    
    def _parse_gpx_manualmente(self, content):
        """Parseo manual con regex"""
        puntos = []
        
        # Patrón para puntos GPS
        patron = r'<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"[^>]*>'
        
        for match in re.finditer(patron, content):
            lat = match.group(1)
            lon = match.group(2)
            
            # Buscar en el texto después del punto
            start = match.end()
            substring = content[start:start + 300]
            
            # Elevación
            ele_match = re.search(r'<ele>([^<]+)</ele>', substring)
            ele = ele_match.group(1) if ele_match else '0'
            
            # Tiempo
            time_match = re.search(r'<time>([^<]+)</time>', substring)
            time_str = time_match.group(1) if time_match else ''
            
            try:
                puntos.append({
                    'lat': float(lat),
                    'lon': float(lon),
                    'ele': float(ele),
                    'time': time_str
                })
            except ValueError:
                continue
        
        print(f"✅ Parseados {len(puntos)} puntos (regex)")
        return puntos
    
    def inject_gps_to_video(self, video_input, gpx_file, video_output, 
                           fps=30, metadata_title="GPS Track"):
        """
        Inyecta GPS como stream de datos en video
        """
        print(f"\n🎬 INYECTANDO GPS")
        print(f"   Video: {video_input}")
        print(f"   GPX: {gpx_file}")
        print(f"   Salida: {video_output}")
        
        # Parsear GPX
        puntos = self.parse_gpx_file(gpx_file)
        
        if not puntos:
            print("❌ No hay puntos GPS")
            return False
        
        print(f"📊 {len(puntos)} puntos listos para inyectar")
        
        # Crear SRT temporal
        srt_content = self._crear_srt(puntos, fps)
        
        srt_temp = None
        try:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.srt', 
                                           encoding='utf-8', delete=False) as f:
                f.write(srt_content)
                srt_temp = f.name
            
            # Comando FFmpeg
            cmd = [
                self.ffmpeg,
                '-i', video_input,
                '-i', srt_temp,
                '-map', '0:v', '-map', '0:a', '-map', '1',
                '-c:v', 'copy',
                '-c:a', 'copy',
                '-c:s', 'mov_text',
                '-metadata:s:s:0', 'handler=GPS',
                '-metadata:s:s:0', f'title={metadata_title}',
                '-metadata:s:s:0', 'language=eng',
                '-y',
                video_output
            ]
            
            print(f"\n🚀 Ejecutando FFmpeg...")
            exito = self._ejecutar_ffmpeg(cmd)
            
            if exito and os.path.exists(video_output):
                size = os.path.getsize(video_output)
                print(f"\n✅ VIDEO CREADO: {video_output}")
                print(f"   Tamaño: {size:,} bytes")
                
                # Verificar
                if self.verificar_gps_stream(video_output):
                    print("✅ Stream GPS verificado")
                else:
                    print("⚠ Stream GPS no detectado (pero video creado)")
                
                return True
            else:
                print("\n❌ Error creando video")
                return False
                
        finally:
            if srt_temp and os.path.exists(srt_temp):
                os.unlink(srt_temp)
    
    def _crear_srt(self, puntos, fps):
        """Crea contenido SRT desde puntos GPS"""
        srt_bloques = []
        
        for i, punto in enumerate(puntos):
            # Tiempos
            inicio = i / fps
            fin = inicio + (1/fps)
            
            # Formatear tiempos
            def seg_a_srt(segundos):
                h = int(segundos // 3600)
                m = int((segundos % 3600) // 60)
                s = int(segundos % 60)
                ms = int((segundos - int(segundos)) * 1000)
                return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
            
            # Contenido JSON
            contenido = json.dumps({
                'lat': punto['lat'],
                'lon': punto['lon'],
                'ele': punto['ele'],
                'time': punto['time'],
                'frame': i,
                'time_sec': inicio
            }, ensure_ascii=False)
            
            # Bloque SRT
            bloque = f"{i+1}\n"
            bloque += f"{seg_a_srt(inicio)} --> {seg_a_srt(fin)}\n"
            bloque += f"{contenido}\n\n"
            
            srt_bloques.append(bloque)
        
        return "".join(srt_bloques)
    
    def _ejecutar_ffmpeg(self, cmd):
        """Ejecuta FFmpeg con feedback"""
        try:
            proceso = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                errors='ignore'
            )
            
            for linea in iter(proceso.stdout.readline, ''):
                if 'time=' in linea and 'speed=' in linea:
                    # Mostrar progreso
                    match = re.search(r'time=(\d{2}:\d{2}:\d{2}\.\d{2})', linea)
                    if match:
                        print(f"  Progreso: {match.group(1)}", end='\r')
                elif 'error' in linea.lower():
                    print(f"\n⚠ {linea.strip()}")
            
            proceso.stdout.close()
            retorno = proceso.wait()
            
            return retorno == 0
            
        except Exception as e:
            print(f"❌ Error FFmpeg: {e}")
            return False
    
    def verificar_gps_stream(self, video_path):
        """Verifica si el video tiene stream GPS"""
        cmd = [
            self.ffprobe,
            '-v', 'error',
            '-select_streams', 'd',
            '-show_entries', 'stream=codec_type,codec_name',
            '-of', 'json',
            video_path
        ]
        
        try:
            resultado = subprocess.run(cmd, capture_output=True, text=True)
            if resultado.returncode == 0:
                datos = json.loads(resultado.stdout)
                return len(datos.get('streams', [])) > 0
        except:
            pass
        
        return False

# ============================================================================
# INTERFAZ PRINCIPAL
# ============================================================================

def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Kit GPS para videos - Usando TU método de extracción',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Ejemplos (usando TU método):
  %(prog)s extract-all                  # Extrae GPS de todos los MP4
  %(prog)s extract-single GRMN2288.MP4  # Extrae de un video
  %(prog)s inject video.mp4 track.gpx -o salida.mp4
  %(prog)s verify video_final.mp4
        '''
    )
    
    subparsers = parser.add_subparsers(dest='comando', help='Comando')
    
    # Extraer todos los videos
    extract_all_parser = subparsers.add_parser('extract-all', 
        help='Extrae GPS de todos los videos MP4 (TU método)')
    extract_all_parser.add_argument('--patron', default='*.mp4', 
        help='Patrón de búsqueda (ej: *.MP4)')
    extract_all_parser.add_argument('--dir', default='.', 
        help='Directorio de trabajo')
    extract_all_parser.add_argument('--fmt', default='gpx.fmt', 
        help='Archivo gpx.fmt')
    
    # Extraer video único
    extract_single_parser = subparsers.add_parser('extract-single',
        help='Extrae GPS de un solo video')
    extract_single_parser.add_argument('video', help='Video de entrada')
    extract_single_parser.add_argument('--fmt', default='gpx.fmt',
        help='Archivo gpx.fmt')
    
    # Inyectar
    inject_parser = subparsers.add_parser('inject', help='Inyectar GPS en video')
    inject_parser.add_argument('video', help='Video de entrada')
    inject_parser.add_argument('gpx', help='Archivo GPX')
    inject_parser.add_argument('-o', '--output', required=True, help='Video de salida')
    inject_parser.add_argument('--fps', type=int, default=30, help='FPS del video')
    
    # Verificar
    verify_parser = subparsers.add_parser('verify', help='Verificar archivo')
    verify_parser.add_argument('archivo', help='Video o GPX a verificar')
    
    args = parser.parse_args()
    
    if not args.comando:
        parser.print_help()
        return
    
    toolkit = VideoGPSToolkit()
    
    if args.comando == 'extract-all':
        # TU MÉTODO EXACTO
        gpx_files = toolkit.extract_gpx_tu_metodo(
            video_pattern=args.patron,
            output_dir=args.dir,
            fmt_file=args.fmt
        )
        
        if gpx_files:
            print(f"\n🎉 Extracción completada!")
            print(f"   Archivos GPX creados: {len(gpx_files)}")
    
    elif args.comando == 'extract-single':
        gpx_file = toolkit.extract_gpx_from_single_video(
            video_path=args.video,
            fmt_file=args.fmt
        )
        
        if gpx_file:
            print(f"\n🎉 GPX listo: {gpx_file}")
    
    elif args.comando == 'inject':
        exito = toolkit.inject_gps_to_video(
            video_input=args.video,
            gpx_file=args.gpx,
            video_output=args.output,
            fps=args.fps
        )
        
        if exito:
            print(f"\n✅ Video con GPS creado: {args.output}")
        else:
            print(f"\n❌ Error inyectando GPS")
    
    elif args.comando == 'verify':
        archivo = args.archivo
        if archivo.lower().endswith('.gpx'):
            # Verificar GPX
            puntos = toolkit.parse_gpx_file(archivo)
            print(f"\n📊 GPX: {archivo}")
            print(f"   Puntos: {len(puntos)}")
            if puntos:
                print(f"   Primer punto: Lat={puntos[0]['lat']:.6f}, Lon={puntos[0]['lon']:.6f}")
        else:
            # Verificar video
            tiene_gps = toolkit.verificar_gps_stream(archivo)
            if tiene_gps:
                print(f"✅ {archivo} tiene stream GPS")
            else:
                print(f"❌ {archivo} NO tiene stream GPS")

if __name__ == "__main__":
    main()