import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
import sys

GPX_FMT = "gpx.fmt"   # ruta al gpx.fmt

# --------------------------------------------------
# Helpers
# --------------------------------------------------

def run(cmd):
    subprocess.run(cmd, check=True)

def capture(cmd):
    return subprocess.check_output(cmd).decode().strip()

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
# Paso 1: creation_time del vídeo
# --------------------------------------------------

def get_video_start(mp4):
    out = capture([
        "ffprobe", "-v", "error",
        "-show_entries", "format_tags=creation_time",
        "-of", "default=nk=1:nw=1",
        mp4
    ])
    return datetime.fromisoformat(out.replace("Z", "+00:00"))

# --------------------------------------------------
# Paso 2: extraer GPX desde MP4 (ExifTool)
# --------------------------------------------------

def extract_gpx(mp4, gpx_out):
    run([
        "exiftool",
        "-ee",
        "-p", GPX_FMT,
        mp4
    ])
    with open(gpx_out, "w", encoding="utf-8") as f:
        f.write(capture([
            "exiftool",
            "-ee",
            "-p", GPX_FMT,
            mp4
        ]))

# --------------------------------------------------
# Paso 3: GPX → SRT
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
# Paso 4: insertar SRT en MP4
# --------------------------------------------------

def embed_srt(mp4_in, srt, mp4_out):
    run([
        "ffmpeg", "-y",
        "-i", mp4_in,
        "-i", srt,
        "-map", "0:v",
        "-map", "0:a?",
        "-map", "1:0",
        "-c", "copy",
        "-c:s", "mov_text",
        mp4_out
    ])

# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main(mp4):
    mp4 = Path(mp4)
    if not mp4.exists():
        print("❌ MP4 no encontrado")
        sys.exit(1)

    gpx = mp4.with_suffix(".auto.gpx")
    srt = mp4.with_suffix(".auto.srt")
    out = mp4.with_name(mp4.stem + "_GPS.mp4")

    print("📹 Leyendo creation_time…")
    video_start = get_video_start(str(mp4))

    print("🧭 Extrayendo GPS con ExifTool…")
    extract_gpx(str(mp4), gpx)

    print("📝 Convirtiendo GPX → SRT…")
    gpx_to_srt(gpx, video_start, srt)

    print("📦 Reinsertando SRT en MP4…")
    embed_srt(str(mp4), str(srt), str(out))

    print("✅ Proceso completado")
    print(f"   ▶ MP4 final : {out}")
    print(f"   ▶ GPX usado : {gpx}")
    print(f"   ▶ SRT usado : {srt}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Uso:")
        print("  python mp4_gps_reembed.py video.mp4")
        sys.exit(1)

    main(sys.argv[1])
