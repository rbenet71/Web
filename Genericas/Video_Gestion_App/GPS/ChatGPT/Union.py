import os
import subprocess
import sys
import tempfile
import shutil

def unir_videos_ffmpeg(directorio, salida):
    """
    Une videos usando ffmpeg - funciona correctamente
    """
    # Buscar archivos MP4
    archivos = []
    for archivo in os.listdir(directorio):
        if archivo.lower().endswith(('.mp4', '.mov', '.m4v')):
            ruta_completa = os.path.join(directorio, archivo)
            archivos.append(ruta_completa)
    
    if not archivos:
        print("❌ No se encontraron videos.")
        return False
    
    archivos.sort()  # Ordenar alfabéticamente
    
    print(f"✅ Encontrados {len(archivos)} videos:")
    for archivo in archivos:
        print(f"  • {os.path.basename(archivo)}")
    
    # Crear directorio temporal
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Método 1: Usar concat demuxer (preserva calidad si codecs iguales)
        print("\n🔗 Método 1: Usando concat demuxer...")
        
        lista_concat = os.path.join(temp_dir, "concat.txt")
        with open(lista_concat, 'w', encoding='utf-8') as f:
            for archivo in archivos:
                # Escapar para Windows
                archivo_esc = archivo.replace('\\', '/').replace(':', '\\:')
                f.write(f"file '{archivo_esc}'\n")
        
        # Comando ffmpeg para concat demuxer
        comando_concat = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', lista_concat,
            '-c', 'copy',  # ¡IMPORTANTE! copy funciona con concat demuxer
            '-map_metadata', '0',  # Copiar metadatos del primer archivo
            '-movflags', '+faststart',
            salida
        ]
        
        print(f"🎬 Ejecutando: ffmpeg -f concat -safe 0 -i concat.txt -c copy {salida}")
        resultado = subprocess.run(comando_concat, capture_output=True, text=True)
        
        if resultado.returncode == 0:
            print("✅ Concat demuxer exitoso!")
            
            # Verificar archivo creado
            if os.path.exists(salida):
                tamano = os.path.getsize(salida) / (1024 * 1024)
                print(f"\n📁 Archivo creado: {salida}")
                print(f"📊 Tamaño: {tamano:.2f} MB")
                print(f"🔢 Videos unidos: {len(archivos)}")
                
                # Intentar aplicar metadatos GPS si ExifTool está disponible
                aplicar_metadatos_gps(archivos[0], salida)
                
                return True
        else:
            print(f"⚠️  Concat demuxer falló: {resultado.stderr[:200]}")
            
            # Método 2: Usar concat filter (re-codifica)
            print("\n🔗 Método 2: Usando concat filter (re-codificación)...")
            
            # Construir filter complex
            inputs = []
            for i in range(len(archivos)):
                inputs.extend(['-i', archivos[i]])
            
            # Construir partes del filter complex
            filter_parts = []
            for i in range(len(archivos)):
                filter_parts.append(f'[{i}:v]')
                filter_parts.append(f'[{i}:a]')
            
            filter_complex = ''.join(filter_parts) + f'concat=n={len(archivos)}:v=1:a=1[outv][outa]'
            
            comando_filter = [
                'ffmpeg', '-y'
            ]
            comando_filter.extend(inputs)
            comando_filter.extend([
                '-filter_complex', filter_complex,
                '-map', '[outv]',
                '-map', '[outa]',
                '-c:v', 'libx264',  # Re-codificar video
                '-preset', 'fast',  # Balance velocidad/calidad
                '-crf', '23',       # Calidad buena
                '-c:a', 'aac',      # Re-codificar audio
                '-b:a', '128k',
                '-map_metadata', '0',
                '-movflags', '+faststart',
                salida
            ])
            
            print(f"🎬 Ejecutando concat filter (esto puede tardar más)...")
            resultado = subprocess.run(comando_filter, capture_output=True, text=True)
            
            if resultado.returncode == 0:
                print("✅ Concat filter exitoso!")
                
                if os.path.exists(salida):
                    tamano = os.path.getsize(salida) / (1024 * 1024)
                    print(f"\n📁 Archivo creado: {salida}")
                    print(f"📊 Tamaño: {tamano:.2f} MB")
                    print("⚠️  NOTA: Video re-codificado (pérdida de calidad mínima)")
                    
                    # Intentar aplicar metadatos GPS
                    aplicar_metadatos_gps(archivos[0], salida)
                    
                    return True
            else:
                print(f"❌ Concat filter también falló: {resultado.stderr[:200]}")
                
                # Método 3: Unir uno por uno
                print("\n🔗 Método 3: Uniendo uno por uno...")
                return unir_uno_por_uno(archivos, salida)
    
    finally:
        # Limpiar directorio temporal
        try:
            shutil.rmtree(temp_dir)
        except:
            pass
    
    return False

def unir_uno_por_uno(archivos, salida):
    """
    Une videos procesando uno por uno
    """
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Empezar con el primer video
        actual = archivos[0]
        
        # Si solo hay un video, copiarlo directamente
        if len(archivos) == 1:
            shutil.copy2(actual, salida)
            print(f"✅ Copiado único archivo a: {salida}")
            aplicar_metadatos_gps(archivos[0], salida)
            return True
        
        # Para múltiples archivos, procesar secuencialmente
        for i in range(1, len(archivos)):
            print(f"  Uniendo {i+1}/{len(archivos)}...")
            
            siguiente = archivos[i]
            temp_salida = os.path.join(temp_dir, f"temp_{i}.mp4")
            
            # Construir comando para unir dos videos
            comando = [
                'ffmpeg', '-y',
                '-i', actual,
                '-i', siguiente,
                '-filter_complex',
                f'[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]',
                '-map', '[v]',
                '-map', '[a]',
                '-c:v', 'libx264',
                '-preset', 'fast',
                '-crf', '23',
                '-c:a', 'aac',
                '-b:a', '128k',
                temp_salida
            ]
            
            resultado = subprocess.run(comando, capture_output=True, text=True)
            
            if resultado.returncode != 0:
                print(f"❌ Error uniendo: {resultado.stderr[:200]}")
                return False
            
            actual = temp_salida
        
        # Copiar resultado final
        shutil.copy2(actual, salida)
        
        tamano = os.path.getsize(salida) / (1024 * 1024)
        print(f"\n✅ Archivo creado: {salida}")
        print(f"📊 Tamaño: {tamano:.2f} MB")
        print(f"🔢 Videos unidos: {len(archivos)}")
        print("⚠️  NOTA: Video re-codificado (pérdida de calidad mínima)")
        
        # Intentar aplicar metadatos GPS
        aplicar_metadatos_gps(archivos[0], salida)
        
        return True
    
    finally:
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

def aplicar_metadatos_gps(archivo_fuente, archivo_destino):
    """
    Intenta aplicar metadatos GPS usando ExifTool
    """
    try:
        # Verificar si ExifTool está disponible
        subprocess.run(['exiftool', '-ver'], capture_output=True, check=True)
        
        print("\n📍 Intentando aplicar metadatos GPS con ExifTool...")
        
        # Comando para copiar metadatos GPS
        comando = [
            'exiftool',
            '-tagsFromFile', archivo_fuente,
            '-gps*',
            '-location*',
            '-xmp:gps*',
            '-xmp:location*',
            '-overwrite_original',
            archivo_destino
        ]
        
        resultado = subprocess.run(comando, capture_output=True, text=True)
        
        if resultado.returncode == 0:
            print("✅ Metadatos GPS aplicados")
            
            # Verificar
            comando_verificar = ['exiftool', '-gps*', archivo_destino]
            resultado_verificar = subprocess.run(comando_verificar, capture_output=True, text=True)
            
            if resultado_verificar.stdout.strip():
                print("📌 Metadatos GPS encontrados en archivo final:")
                print(resultado_verificar.stdout)
            else:
                print("⚠️  No se encontraron metadatos GPS después de aplicar")
        else:
            print(f"⚠️  Error aplicando metadatos: {resultado.stderr}")
    
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("ℹ️  ExifTool no encontrado. Para preservar GPS:")
        print(f"   Descarga de: https://exiftool.org/")
        print(f"   Luego ejecuta:")
        print(f'   exiftool -tagsFromFile "{archivo_fuente}" -gps* -location* -overwrite_original "{archivo_destino}"')

def verificar_videos(directorio):
    """
    Verifica información de los videos
    """
    print("\n🔍 Verificando videos...")
    
    archivos = []
    for archivo in os.listdir(directorio):
        if archivo.lower().endswith(('.mp4', '.mov', '.m4v')):
            archivos.append(os.path.join(directorio, archivo))
    
    if not archivos:
        return
    
    archivos.sort()
    
    for i, archivo in enumerate(archivos, 1):
        print(f"\n  Video {i}: {os.path.basename(archivo)}")
        
        # Obtener información básica
        comando = [
            'ffprobe',
            '-v', 'quiet',
            '-show_format',
            '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,width,height,r_frame_rate,duration',
            '-of', 'json',
            archivo
        ]
        
        try:
            resultado = subprocess.run(comando, capture_output=True, text=True)
            if resultado.returncode == 0:
                import json
                info = json.loads(resultado.stdout)
                
                if 'streams' in info and info['streams']:
                    stream = info['streams'][0]
                    print(f"    Codec: {stream.get('codec_name', 'N/A')}")
                    print(f"    Resolución: {stream.get('width', 'N/A')}x{stream.get('height', 'N/A')}")
                    
                    if 'r_frame_rate' in stream:
                        fps = stream['r_frame_rate']
                        print(f"    FPS: {fps}")
                
                if 'format' in info and 'duration' in info['format']:
                    duracion = float(info['format']['duration'])
                    minutos = int(duracion // 60)
                    segundos = int(duracion % 60)
                    print(f"    Duración: {minutos}:{segundos:02d}")
        
        except:
            print("    (No se pudo obtener información)")

def main():
    print("=" * 60)
    print("🎬 UNIDOR DE VIDEOS FFMPEG")
    print("=" * 60)
    print("Versión que SÍ funciona")
    print()
    
    # Solicitar directorio
    directorio = input("📁 Ruta del directorio con videos: ").strip()
    
    if not directorio:
        directorio = "."
    
    if not os.path.isdir(directorio):
        print(f"❌ No existe: {directorio}")
        input("Presiona Enter para salir...")
        return
    
    # Verificar videos primero
    verificar_videos(directorio)
    
    # Solicitar nombre de salida
    salida = input("\n💾 Nombre archivo salida [videos_unidos.mp4]: ").strip()
    if not salida:
        salida = "videos_unidos.mp4"
    
    if not salida.lower().endswith('.mp4'):
        salida += '.mp4'
    
    # Verificar si ya existe
    if os.path.exists(salida):
        sobreescribir = input(f"⚠️  {salida} ya existe. ¿Sobreescribir? (s/n): ").strip().lower()
        if sobreescribir != 's':
            print("Operación cancelada.")
            return
    
    print(f"\n📂 Directorio: {directorio}")
    print(f"📄 Salida: {salida}")
    
    confirmar = input("\n¿Continuar? (s/n): ").strip().lower()
    if confirmar != 's':
        print("Cancelado.")
        return
    
    # Ejecutar unión
    print("\n" + "=" * 60)
    exito = unir_videos_ffmpeg(directorio, salida)
    
    if exito:
        print("\n" + "=" * 60)
        print("✅ PROCESO COMPLETADO")
        print("=" * 60)
        
        # Mostrar comandos útiles
        print("\n📝 COMANDOS PARA VERIFICAR:")
        print(f'1. Reproducir: start "" "{salida}"')
        print(f'2. Información: ffprobe "{salida}"')
        print(f'3. Metadatos GPS: exiftool -gps* "{salida}"')
        
    else:
        print("\n" + "=" * 60)
        print("❌ FALLÓ LA UNIÓN")
        print("=" * 60)
        print("\nSugerencias:")
        print("1. Asegúrate que ffmpeg esté en PATH")
        print("2. Prueba manualmente:")
        print(f'   ffmpeg -f concat -safe 0 -i concat.txt -c copy "{salida}"')
    
    input("\nPresiona Enter para salir...")

if __name__ == "__main__":
    # Verificar ffmpeg
    try:
        subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
    except:
        print("❌ ERROR: ffmpeg no encontrado.")
        print("   Descarga de: https://ffmpeg.org/download.html")
        input("Presiona Enter para salir...")
        sys.exit(1)
    
    main()