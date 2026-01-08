import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
import sys

# --------------------------------------------------
# Utilidades
# --------------------------------------------------

def run(cmd):
    subprocess.run(cmd, check=True)

def get_video_creation_time(mp4):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format_tags=creation_time",
        "-of", "default=nk=1:nw=1",
        mp4
    ]
    out = subprocess.check_output(cmd).decode().strip()
    return datetime.fromisoformat(out.replace("Z", "+00:00"))

def srt_time(seconds):
    if seconds < 0:
        seconds = 0
    ms = int((seconds % 1) * 1000)
    s = int(seconds)
    h = s // 3600
    m = (s % 3600) // 60
    s = s % 60
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

# --------------------------------------------------
# GPX → SRT
# --------------------------------------------------

def gpx_to_srt(gpx_path, video_start, srt_path):
    tree = ET.parse(gpx_path)
    root = tree.getroot()

    ns = {"gpx": root.tag.split("}")[0].strip("{")}
    pts = root.findall(".//gpx:trkpt", ns)

    with open(srt_path, "w", encoding="utf-8") as f:
        idx = 1
        for p1, p2 in zip(pts, pts[1:]):
            t1 = datetime.fromisoformat(
                p1.find("gpx:time", ns).text.replace("Z", "+00:00")
            )
            t2 = datetime.fromisoformat(
                p2.find("gpx:time", ns).text.replace("Z", "+00:00")
            )

            s1 = (t1 - video_start).total_seconds()
            s2 = (t2 - video_start).total_seconds()

            if s2 <= 0:
                continue

            lat = p1.attrib["lat"]
            lon = p1.attrib["lon"]
            ele = p1.find("gpx:ele", ns)
            ele = ele.text if ele is not None else ""

            f.write(f"{idx}\n")
            f.write(f"{srt_time(s1)} --> {srt_time(s2)}\n")
            f.write(f"LAT={lat}  LON={lon}  ELE={ele}\n\n")
            idx += 1

# --------------------------------------------------
# Insertar SRT en MP4
# --------------------------------------------------

def embed_srt(mp4_in, srt, mp4_out):
    cmd = [
        "ffmpeg", "-y",
        "-i", mp4_in,
        "-i", srt,
        "-map", "0:v",
        "-map", "0:a?",
        "-map", "1:0",
        "-c", "copy",
        "-c:s", "mov_text",
        mp4_out
    ]
    run(cmd)

# --------------------------------------------------
# Procesar un MP4
# --------------------------------------------------

def process_mp4(mp4):
    gpx = mp4.with_suffix(".gpx")

    if not gpx.exists():
        print(f"⚠️  GPX no encontrado para {mp4.name}, se omite")
        return

    out = mp4.with_name(mp4.stem + "_GPS.mp4")
    srt = mp4.with_suffix(".gps.srt")

    if out.exists():
        print(f"⏭️  Ya existe {out.name}, se omite")
        return

    print(f"\n🎬 Procesando {mp4.name}")
    print("📹 Leyendo creation_time…")
    video_start = get_video_creation_time(str(mp4))

    print("🧭 Generando SRT…")
    gpx_to_srt(gpx, video_start, srt)

    print("📦 Insertando SRT…")
    embed_srt(str(mp4), str(srt), str(out))

    print(f"✅ Finalizado: {out.name}")

# --------------------------------------------------
# MAIN (directorio actual)
# --------------------------------------------------

def main():
    base_dir = Path(__file__).resolve().parent
    mp4_files = sorted(base_dir.glob("*.mp4"))

    if not mp4_files:
        print("❌ No se encontraron MP4 en el directorio")
        sys.exit(1)

    print(f"📂 Directorio: {base_dir}")
    print(f"🎞️  MP4 encontrados: {len(mp4_files)}")

    for mp4 in mp4_files:
        process_mp4(mp4)

    print("\n🏁 Proceso completo")

if __name__ == "__main__":
    main()
