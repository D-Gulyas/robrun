# ROB RUN – Blaupausen

Statische Webseite zum Lesen der ROB-RUN-Blaupausen direkt im Browser, ohne PDF-Download.

**📐 Live: https://d-gulyas.github.io/robrun/blaupausen/**

Teil des ROB-RUN-Sammel-Repos – Übersicht: https://d-gulyas.github.io/robrun/ · [zurück zur Repo-Übersicht](../README.md)

- **Dossiers:** Anbauraum · Polizeifunk & Radio · Schlüsselräume · Sammeltisch
- Kapitel-Navigation mit Sprung an die richtige Stelle, Seitenvorschau, Fortschrittsbalken
- Volltextsuche über alle Blaupausen (`/`)
- Zoom (`+` / `−` / `0`, Strg + Mausrad), Vollbild (`F`), Seiten blättern (`←` / `→`)
- Teilbare Links auf eine Seite, z. B. `#keys/3`
- Kein PDF auf der Seite: Die Seiten werden als Bilder angezeigt. Rechtsklick, Ziehen, Strg+S und Drucken sind gesperrt.
  Das hält Gelegenheits-Downloads ab, ist aber kein echter Kopierschutz.

## Lokal öffnen

`index.html` doppelklicken. Es wird kein Server benötigt.

## Neue oder geänderte Blaupausen

Python 3 mit PyMuPDF (`pip install pymupdf pillow`):

```bash
python tools/render-pdfs.py Anbauraum.pdf Police-Radio.pdf Schluesselraeume.pdf Sammeltisch.pdf
```

Das Skript erzeugt `pages/<code>/NN.webp` und `data/blaupausen.js`. Titel, Farben und Kapitel stehen oben im Skript (`META`).

## Veröffentlichen

Die Seite liegt im Unterordner `blaupausen/` des Repos und wird über GitHub Pages automatisch mit veröffentlicht.
Änderungen committen und pushen – nach etwa einer Minute sind sie live.
