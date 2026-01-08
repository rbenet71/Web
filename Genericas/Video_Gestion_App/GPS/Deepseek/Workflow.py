# Ejemplo de uso programático
from gps_video_toolkit import VideoGPSToolkit

# Inicializar toolkit
toolkit = VideoGPSToolkit()

# 1. Extraer GPS de video Ambarella
gpx_file = toolkit.extract_gpx_from_video("GRMN2288.MP4")

# 2. Inyectar en nuevo video con formato estándar
toolkit.inject_gps_to_video(
    video_input="video_sin_gps.mp4",
    gpx_file=gpx_file,
    video_output="video_con_gps_estandar.mp4",
    fps=29.97,
    metadata_title="Ruta en bicicleta"
)

# 3. Concatenar múltiples videos
toolkit.concatenate_videos_with_gps(
    video_files=["video1_gps.mp4", "video2_gps.mp4", "video3_gps.mp4"],
    output_file="viaje_completo.mp4"
)

# 4. Cortar segmento
toolkit.cut_video_with_gps(
    video_input="viaje_completo.mp4",
    start_time="00:15:30",
    duration="00:05:00",
    output_file="mejor_segmento.mp4"
)

# 5. Extraer GPS para análisis
json_track = toolkit.extract_gps_from_video("mejor_segmento.mp4")