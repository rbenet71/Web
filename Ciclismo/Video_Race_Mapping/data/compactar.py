#!/usr/bin/env python3
# build_carrera.py
# Genera data/carrera.js embebiendo GPX/KMZ/XLSX en Base64 (MP4 NO embebidos)
# python compactar.py  --nombre "Volta Ciclista a Catalunya" --logo volta.png


import os
import sys
import base64
import json
from datetime import datetime

EXTS = {
    ".mp4": "mp4",
    ".gpx": "gpx",
    ".kmz": "kmz",
    ".kml": "kml",
    ".xlsx": "xlsx",
    ".xls": "xls",
}

MIME = {
    ".gpx": "application/gpx+xml",
    ".kmz": "application/vnd.google-earth.kmz",
    ".kml": "application/vnd.google-earth.kml+xml",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
}

def b64_from_file(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")

def natural_key(s):
    import re
    return [int(t) if t.isdigit() else t for t in re.findall(r"\d+|\D+", s)]

def main():
    if len(sys.argv) < 2:
        print("Uso:")
        print("  python build_carrera.py <directorio> [--nombre \"Mi carrera\"] [--logo logo.png] [--out carrera.js]")
        sys.exit(1)

    data_dir = os.path.abspath(sys.argv[1])
    nombre = "Carrera"
    logo = None
    out_name = "carrera.js"

    args = sys.argv[2:]
    i = 0
    while i < len(args):
        if args[i] == "--nombre":
            nombre = args[i + 1]
            i += 2
        elif args[i] == "--logo":
            logo = args[i + 1]
            i += 2
        elif args[i] == "--out":
            out_name = args[i + 1]
            i += 2
        else:
            i += 1

    if not os.path.isdir(data_dir):
        print("ERROR: no existe el directorio:", data_dir)
        sys.exit(1)

    files = [f for f in os.listdir(data_dir) if os.path.isfile(os.path.join(data_dir, f))]

    by_base = {}
    for f in files:
        ext = os.path.splitext(f)[1].lower()
        if ext not in EXTS:
            continue
        base = os.path.splitext(f)[0]
        by_base.setdefault(base, {})[ext] = f

    etapas = []
    videos = []
    warnings = []

    for base in sorted(by_base.keys(), key=natural_key):
        entry = by_base[base]
        if ".mp4" not in entry:
            continue

        etapa = {
            "id": base,
            "video": entry[".mp4"]
        }
        videos.append(entry[".mp4"])

        for ext in [".gpx", ".kmz", ".kml", ".xlsx", ".xls"]:
            if ext in entry:
                path = os.path.join(data_dir, entry[ext])
                etapa[f"{EXTS[ext]}_b64"] = b64_from_file(path)
                etapa[f"{EXTS[ext]}_mime"] = MIME.get(ext)
                etapa[f"{EXTS[ext]}_name"] = entry[ext]

        if ".gpx" not in entry:
            warnings.append(f"Aviso: {base} tiene MP4 pero no GPX")
        if ".xlsx" not in entry and ".xls" not in entry:
            warnings.append(f"Aviso: {base} tiene MP4 pero no XLSX/XLS")
        if ".kmz" not in entry and ".kml" not in entry:
            warnings.append(f"Aviso: {base} no tiene KMZ/KML (opcional)")

        etapas.append(etapa)

    if not etapas:
        print("ERROR: no se encontraron etapas (MP4)")
        sys.exit(1)

    cfg = {
        "nombre": nombre,
        "videos": videos,
        "etapas": etapas,
        from datetime import timezone
        "generatedAt": datetime.now(timezone.utc).isoformat()

    }
    if logo:
        cfg["logo"] = logo

    out_path = os.path.join(data_dir, out_name)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write("/* Auto-generado por build_carrera.py. NO editar a mano. */\n")
        f.write("window.CARRERA_CONFIG = ")
        json.dump(cfg, f, indent=2)
        f.write(";\n")

    print("OK -> generado:", out_path)
    print("Etapas:", len(etapas))
    if warnings:
        print("\n--- Avisos ---")
        for w in warnings:
            print(w)

if __name__ == "__main__":
    main()
