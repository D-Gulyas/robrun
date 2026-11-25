"""Rendert die Blaupausen-PDFs zu WebP-Seitenbildern + Textindex (data/blaupausen.js).

Nutzung:  python tools/render-pdfs.py <pdf> [<pdf> ...]
Neue PDFs einfach mit angeben – die Reihenfolge bestimmt die Reihenfolge auf der Seite.
"""
import json
import re
import sys
from pathlib import Path

import pymupdf  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "pages"
ZOOM = 2.2  # ~160 dpi – scharf auch beim Hineinzoomen

META = {
    "Anbauraum": {"code": "grow", "title": "Anbauraum", "sub": "Operation: Grüner Daumen", "color": "#2fd36b", "icon": "🌿",
                  "desc": "Grow Room: Büsche, Tische, Upgrades, Ausbauplan und Ertrag.",
                  "chapters": ["Lagebild", "Was du anbauen kannst", "So funktioniert der Kreislauf", "Raumkarte (schematisch)",
                               "Woher du alles bekommst", "Wo du Büsche findest", "Ausbauplan", "Wirtschaftlichkeit", "Risiken"]},
    "Police-Radio": {"code": "radio", "title": "Polizeifunk & Radio", "sub": "Operation: Mithören", "color": "#ffcb3e", "icon": "📻",
                     "desc": "Beide „Police Radio“-Items: Polizeifunk (Handgerät) und Polizeiradio (Auto-Upgrade) – Kosten, Freischaltung, Loot und Einsatz.",
                     "chapters": ["Was das Police Radio ist", "Beide Versionen im Vergleich", "So bekommst du es",
                                  "Was die Polizei selbst hat", "Einsatz: So nutzt du es", "Was nicht belegt ist"]},
    "Schluesselraeume": {"code": "keys", "title": "Schlüsselräume", "sub": "Operation: Schlüsseldienst", "color": "#fe1e7c", "icon": "🗝️",
                         "desc": "Lila, goldene & exotische Schlüssel – und wie viele Bohrer du brauchst.",
                         "chapters": ["Die Kurzfassung", "Alle Schlüssel nach Seltenheit", "Lila Räume (Epic)", "Goldene Räume (Legendary)",
                                      "Exotische Schlüssel (ID-Karten)", "Gesamtbedarf", "Wichtig: Wird der Mini-Bohrer verbraucht?",
                                      "Mini-Bohrer: Fakten", "Was nicht sicher belegt ist"]},
}


def find_chapters(pdf, names):
    """Sucht 'NN · ' Überschriften und gibt Seite + relative Höhe zurück."""
    out = []
    for n, name in enumerate(names, 1):
        needle = f"{n:02d} · {name.split()[0].upper()}"
        hit = None
        for pi, page in enumerate(pdf):
            rects = page.search_for(needle)
            if rects:
                hit = {"n": f"{n:02d}", "t": name, "page": pi, "y": round(rects[0].y0 / page.rect.height, 4)}
                break
        if hit is None:
            raise SystemExit(f"Kapitel nicht gefunden: {needle}")
        out.append(hit)
    return out


def main(paths):
    docs = []
    for p in map(Path, paths):
        key = re.sub(r"^ROB-RUN_Blaupause_", "", p.stem)
        meta = META.get(key, {"code": key.lower(), "title": key, "sub": "", "color": "#c5fb31", "icon": "📄"})
        target = OUT / meta["code"]
        target.mkdir(parents=True, exist_ok=True)
        pdf = pymupdf.open(p)
        pages = []
        for i, page in enumerate(pdf):
            pix = page.get_pixmap(matrix=pymupdf.Matrix(ZOOM, ZOOM), alpha=False)
            img = target / f"{i + 1:02d}.webp"
            pix.pil_save(img, format="WEBP", quality=86, method=6)
            text = re.sub(r"\s+", " ", page.get_text()).strip()
            pages.append({"img": f"pages/{meta['code']}/{img.name}", "w": pix.width, "h": pix.height, "text": text})
        first = re.sub(r"\s+", " ", pdf[0].get_text()).strip()
        m = re.search(r"Stand:\s*([\d.]+)", first)
        chapters = find_chapters(pdf, meta.get("chapters", []))
        docs.append({**{k: v for k, v in meta.items() if k != "chapters"}, "chapters": chapters,
                     "stand": m.group(1) if m else "", "pages": pages})
        print(f"{p.name}: {len(pages)} Seiten -> {target.relative_to(ROOT)}")
    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "blaupausen.js").write_text(
        "/* Automatisch erzeugt von tools/render-pdfs.py */\nwindow.BLAUPAUSEN = "
        + json.dumps(docs, ensure_ascii=False) + ";\n", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1:])
