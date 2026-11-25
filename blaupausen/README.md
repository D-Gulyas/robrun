# ROB RUN – Blaupausen

Statische Webseite zum Lesen der ROB-RUN-Blaupausen direkt im Browser, ohne PDF-Download.

- **Dossiers:** Anbauraum · Polizeifunk & Radio · Schlüsselräume
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
python tools/render-pdfs.py Anbauraum.pdf Police-Radio.pdf Schluesselraeume.pdf
```

Das Skript erzeugt `pages/<code>/NN.webp` und `data/blaupausen.js`. Titel, Farben und Kapitel stehen oben im Skript (`META`).

## Veröffentlichen

Erst nach Freigabe. Danach Ordnerinhalt in ein GitHub-Repo laden und **Settings → Pages → main / root** aktivieren.
