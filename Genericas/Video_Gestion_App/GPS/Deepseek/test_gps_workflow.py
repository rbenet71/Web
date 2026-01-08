#!/usr/bin/env python3
"""
test_gps_workflow.py - Prueba completa del flujo
"""

from pathlib import Path
import sys

# Añadir el directorio actual al path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from gps_video_toolkit import VideoGPSToolkit
except ImportError:
    print("❌ No se puede importar VideoGPSToolkit")
    print("Asegúrate de que el archivo se llama gps_video_toolkit.py")
    sys.exit(1)

def test_complete_workflow():
    """Prueba completa del flujo"""
    print("=" * 60)
    print("PRUEBA COMPLETA DE FLUJO GPS")
    print("=" * 60)
    
    toolkit = VideoGPSToolkit()
    
    # 1. Verificar herramientas
    print("\n1. VERIFICANDO HERRAMIENTAS...")
    
    # Verificar FFmpeg
    try:
        import subprocess
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        print("✅ FFmpeg encontrado")
    except:
        print("❌ FFmpeg no encontrado")
        return
    
    # Verificar exiftool
    try:
        subprocess.run(["exiftool", "-ver"], capture_output=True, check=True)
        print("✅ exiftool encontrado")
    except:
        print("❌ exiftool no encontrado")
        print("Descarga de: https://exiftool.org/")
        print("Coloca exiftool.exe en este directorio o en PATH")
    
    # 2. Extraer GPS (usando TU gpx.fmt)
    print("\n2. EXTRACCIÓN DE GPS...")
    
    video_file = "GRMN2288.MP4"
    if not Path(video_file).exists():
        print(f"⚠ Video no encontrado: {video_file}")
        print("Usando video de prueba...")
        # Crear video de prueba simple
        create_test_video()
        video_file = "test_video.mp4"
    
    gpx_file = toolkit.extract_gpx_using_your_fmt(video_file)
    
    if not gpx_file or not Path(gpx_file).exists():
        print("❌ No se pudo extraer GPX")
        return
    
    # 3. Verificar GPX extraído
    print("\n3. VERIFICANDO GPX...")
    with open(gpx_file, 'r', encoding='utf-8') as f:
        content = f.read(1000)  # Primeros 1000 caracteres
    
    print(f"Contenido del GPX (primeros 1000 chars):")
    print("-" * 40)
    print(content)
    print("-" * 40)
    
    # 4. Inyectar en video de prueba
    print("\n4. INYECCIÓN EN VIDEO...")
    
    # Crear video de prueba si no existe
    test_input = "test_input_video.mp4"
    if not Path(test_input).exists():
        print("Creando video de prueba...")
        create_test_video(test_input, duration=10)
    
    output_video = "test_with_gps.mp4"
    
    success = toolkit.inject_gps_to_video(
        video_input=test_input,
        gpx_file=gpx_file,
        video_output=output_video,
        fps=30,
        metadata_title="Test GPS Track"
    )
    
    if success:
        print(f"\n✅ PRUEBA EXITOSA!")
        print(f"   Video con GPS creado: {output_video}")
        
        # Verificar
        has_gps = toolkit.verify_gps_stream(output_video)
        print(f"   Stream GPS presente: {'✅ SÍ' if has_gps else '❌ NO'}")
    else:
        print("\n❌ PRUEBA FALLIDA")

def create_test_video(filename="test_video.mp4", duration=5):
    """Crea un video de prueba simple"""
    import subprocess
    
    print(f"Creando video de prueba: {filename} ({duration}s)")
    
    cmd = [
        "ffmpeg",
        "-f", "lavfi",
        "-i", f"testsrc=duration={duration}:size=640x360:rate=30",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-f", "mp4",
        "-y",
        filename
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
        print(f"✅ Video de prueba creado: {filename}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error creando video: {e.stderr}")
        return False

if __name__ == "__main__":
    test_complete_workflow()