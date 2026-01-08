import os
import subprocess
import tempfile
import shutil
from pathlib import Path

def merge_videos_with_exiftool_gps(input_dir, output_file):
    """
    Une videos y preserva metadatos GPS usando ExifTool (más confiable)
    """
    # Buscar archivos de video
    video_files = []
    for ext in ['*.mp4', '*.MP4', '*.mov', '*.MOV', '*.m4v', '*.M4V']:
        video_files.extend(list(Path(input_dir).glob(ext)))
    
    video_files = sorted([str(f) for f in video_files])
    
    if not video_files:
        print("No se encontraron archivos de video.")
        return False
    
    print(f"Encontrados {len(video_files)} videos:")
    for vf in video_files:
        print(f"  • {os.path.basename(vf)}")
    
    # Crear directorio temporal
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Paso 1: Crear lista de concatenación
        concat_file = os.path.join(temp_dir, "concat.txt")
        with open(concat_file, 'w', encoding='utf-8') as f:
            for video in video_files:
                # Escapar para Windows
                video_escaped = video.replace('\\', '/').replace(':', '\\:')
                f.write(f"file '{video_escaped}'\n")
        
        # Paso 2: Unir videos con ffmpeg
        temp_video = os.path.join(temp_dir, "temp_merged.mp4")
        print("\nUniendo videos con ffmpeg...")
        
        cmd_ffmpeg = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', concat_file,
            '-c', 'copy',
            '-map', '0',
            '-movflags', '+faststart',
            temp_video
        ]
        
        result = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error ffmpeg: {result.stderr}")
            return False
        
        # Paso 3: Extraer metadatos GPS de cada archivo con ExifTool
        print("\nExtrayendo metadatos GPS con ExifTool...")
        all_metadata_files = []
        
        for i, video in enumerate(video_files):
            metadata_file = os.path.join(temp_dir, f"metadata_{i:03d}.txt")
            
            # Extraer metadatos GPS específicos
            cmd_exif = [
                'exiftool',
                '-G1', '-a', '-s',  # Formato detallado
                '-gps*',  # Solo metadatos GPS
                '-location*',
                '-xmp:gps*',
                '-xmp:location*',
                '-quicktime:location*',
                video
            ]
            
            try:
                result = subprocess.run(cmd_exif, capture_output=True, text=True)
                if result.returncode == 0 and result.stdout.strip():
                    with open(metadata_file, 'w', encoding='utf-8') as f:
                        f.write(f"; Metadatos de: {os.path.basename(video)}\n")
                        f.write(result.stdout)
                    all_metadata_files.append(metadata_file)
                    print(f"  ✓ {os.path.basename(video)}: Tiene metadatos GPS")
                else:
                    print(f"  ✗ {os.path.basename(video)}: Sin metadatos GPS")
            except FileNotFoundError:
                print(f"  ⚠️  ExifTool no encontrado para {os.path.basename(video)}")
                continue
        
        # Paso 4: Si hay metadatos GPS, combinarlos
        if all_metadata_files:
            print(f"\nCombinando {len(all_metadata_files)} conjuntos de metadatos GPS...")
            
            # Crear archivo de metadatos combinados
            combined_metadata = os.path.join(temp_dir, "all_gps_metadata.txt")
            with open(combined_metadata, 'w', encoding='utf-8') as out_f:
                out_f.write("; METADATOS GPS COMBINADOS\n")
                out_f.write(f"; De {len(all_metadata_files)} archivos de video\n\n")
                
                for meta_file in all_metadata_files:
                    with open(meta_file, 'r', encoding='utf-8') as in_f:
                        out_f.write(in_f.read())
                        out_f.write("\n" + "="*50 + "\n\n")
            
            # Paso 5: Aplicar metadatos combinados al video
            print("Aplicando metadatos GPS combinados al video final...")
            
            cmd_apply_metadata = [
                'exiftool',
                '-tagsFromFile', combined_metadata,
                '-overwrite_original',
                temp_video
            ]
            
            try:
                result = subprocess.run(cmd_apply_metadata, capture_output=True, text=True)
                if result.returncode == 0:
                    print("✅ Metadatos GPS aplicados exitosamente")
                else:
                    print(f"⚠️  Error aplicando metadatos: {result.stderr}")
            except FileNotFoundError:
                print("⚠️  ExifTool no encontrado, no se aplicaron metadatos GPS")
        
        # Paso 6: Mover el archivo final
        shutil.copy2(temp_video, output_file)
        
        # Verificación final
        print(f"\n✅ Video creado: {output_file}")
        
        # Verificar si tiene metadatos GPS
        verify_cmd = ['exiftool', '-gps*', output_file]
        try:
            result = subprocess.run(verify_cmd, capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip():
                print("✅ El archivo final contiene metadatos GPS:")
                print(result.stdout)
            else:
                print("⚠️  El archivo final NO contiene metadatos GPS")
        except:
            print("⚠️  No se pudo verificar metadatos GPS (ExifTool no disponible)")
        
        return True
    
    finally:
        # Limpiar
        try:
            shutil.rmtree(temp_dir)
        except:
            pass

def main_exiftool():
    print("=" * 60)
    print("UNIÓN DE VIDEOS CON EXIFTOOL (MEJOR PARA GPS)")
    print("=" * 60)
    
    input_dir = input("📁 Ruta del directorio con videos: ").strip()
    
    if not os.path.isdir(input_dir):
        print("❌ Directorio no válido.")
        return
    
    output_file = input("💾 Nombre archivo salida [videos_unidos_gps.mp4]: ").strip()
    if not output_file:
        output_file = "videos_unidos_gps.mp4"
    if not output_file.endswith('.mp4'):
        output_file += '.mp4'
    
    # Verificar ExifTool
    try:
        subprocess.run(['exiftool', '-ver'], capture_output=True, check=True)
    except:
        print("\n❌ ADVERTENCIA: ExifTool no está instalado.")
        print("   Los metadatos GPS no se preservarán correctamente.")
        print("   Descarga de: https://exiftool.org/")
        confirm = input("¿Continuar de todos modos? (s/n): ").strip().lower()
        if confirm != 's':
            return
    
    merge_videos_with_exiftool_gps(input_dir, output_file)
    input("\nPresiona Enter para salir...")

if __name__ == "__main__":
    # Ejecutar la versión con ExifTool (mejor para GPS)
    main_exiftool()