#!/usr/bin/env python3
"""
Quita de img/sobre.jpg: sello de lacre, texto «Clique para abrir» e icono del dedo.
Rellena con inpainting (OpenCV) para dejar solo el papel en relieve.

Copia de seguridad la primera vez: img/sobre-antes-limpieza.jpg

Requiere: pip install opencv-python-headless numpy
"""
from __future__ import annotations

import shutil
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "img" / "sobre.jpg"
OUT = ROOT / "img" / "sobre.jpg"
SNAP = ROOT / "img" / "sobre-antes-limpieza.jpg"


def main() -> int:
    if not SRC.is_file():
        print("No existe", SRC, file=sys.stderr)
        return 1

    if not SNAP.is_file():
        shutil.copy2(SRC, SNAP)
        print("Copia de seguridad:", SNAP)

    # Siempre partir del JPG original guardado (no del resultado ya inpintado)
    source_path = SNAP if SNAP.is_file() else SRC
    bgr = cv2.imread(str(source_path))
    if bgr is None:
        print("No se pudo leer", SRC, file=sys.stderr)
        return 1

    H, W = bgr.shape[:2]
    cx = W // 2
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    mask = np.zeros((H, W), np.uint8)

    # Lacre completo (elipse generosa por el borde festoneado)
    cy_seal = int(round(H * 0.395))
    ax = int(round(min(W, H) * 0.14))
    ay = int(round(min(W, H) * 0.11))
    cv2.ellipse(mask, (cx, cy_seal), (ax, ay), 0, 0, 360, 255, thickness=-1)

    # Texto + icono: máscara ancha + trazos oscuros
    x0, x1 = int(round(W * 0.10)), int(round(W * 0.90))
    y0, y1 = int(round(H * 0.452)), int(round(H * 0.88))
    roi = gray[y0:y1, x0:x1]
    bs = max(15, int(round(min(W, H) * 0.034))) | 1
    ink = cv2.adaptiveThreshold(
        roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, bs, 2
    )
    ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    ink = cv2.dilate(ink, np.ones((5, 5), np.uint8), iterations=2)
    mask[y0:y1, x0:x1] = cv2.bitwise_or(mask[y0:y1, x0:x1], ink)

    k = np.ones((5, 5), np.uint8)
    mask = cv2.dilate(mask, k, iterations=1)
    mask = cv2.GaussianBlur(mask, (5, 5), 0)
    _, mask = cv2.threshold(mask, 42, 255, cv2.THRESH_BINARY)

    radius = max(5, int(round(min(W, H) * 0.013)))
    out = cv2.inpaint(bgr, mask, radius, cv2.INPAINT_NS)

    ok = cv2.imwrite(str(OUT), out, [cv2.IMWRITE_JPEG_QUALITY, 93])
    if not ok:
        print("No se pudo guardar", OUT, file=sys.stderr)
        return 1
    print("Guardado:", OUT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
