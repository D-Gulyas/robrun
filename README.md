# ROB RUN – Interaktive Karte von Looty Bay

Eine schnelle, komplett statische Karte von Looty Bay mit **allen 629 Markern** in 39 Kategorien –
inklusive **aller 53 Mülltonnen**, die man als Zivilist leeren kann.

**🗺️ Live: https://d-gulyas.github.io/robrun-map/**

**📐 Blaupausen: https://d-gulyas.github.io/robrun-map/blaupausen/** ([Ordner `blaupausen/`](blaupausen/))

## Funktionen

- 🗑️ **Mülltonnen-Modus** für Zivilisten: alle 53 Tonnen hervorgehoben, nummeriert, mit Inhalt (9–18× Müll, 9 Griffe, ≈ $10/Stück)
- 🧭 **Routenplaner**: berechnet eine kurze Sammelroute durch alle offenen Tonnen (Nächster-Nachbar + 2-opt) mit nummerierten Stopps
- ✅ **Fortschritt**: Tonnen/Behälter als geleert markieren, Geleerte ausblenden, „Nächste Tonne“-Sprung – alles im Browser gespeichert
- 🔎 **Suche** über Namen, Kategorien und Beschreibungen (Deutsch & Englisch), Pfeiltasten + Enter
- 🏙️ **Ansichten**: Zivilist · Standard · Räuber · Alle · Keine
- 🏦 **Gebäude-Details**: Tresore, Schränke, Kameras, Zivilisten usw. pro Gebäude – alles auf Deutsch
- 📌 **Eigene Notizen**: Rechtsklick (mobil: lange drücken) auf die Karte
- 🔗 **Teilbare Links** zu jedem Marker (`#m=trash-12`)
- 📱 Mobil-tauglich, Vollbild, Markergröße einstellbar, Tastenkürzel (`/` `T` `R` `N` `F`)

## Lokal öffnen

Einfach `index.html` doppelklicken – es wird kein Server benötigt.

## Auf GitHub Pages veröffentlichen

1. Den Inhalt dieses Ordners in dein Repository hochladen.
2. Auf GitHub: **Settings → Pages → Branch: `main` / Ordner `/ (root)`** → Speichern.
3. Nach ca. einer Minute ist die Karte unter `https://<name>.github.io/<repo>/` erreichbar.

## Daten aktualisieren

Wenn ROB RUN ein Update bekommt, lädt dieses Skript die aktuellen Marker neu (Node.js 18+):

```bash
node tools/update-data.mjs
```

## Aufbau

```
index.html          Seite
css/style.css       Design
js/app.js           Kartenlogik (Leaflet)
js/i18n.js          Deutsche Texte, Farben, Symbole
data/map-data.js    Markerdaten (automatisch erzeugt)
tiles/{z}/{x}/{y}.webp   Kartenkacheln (Zoom 0–3)
tools/update-data.mjs    Daten-Updater
```

## Quellen

Markerdaten und Kartengrafik stammen von [wikily.gg – ROB RUN Interactive Map](https://wikily.gg/rob-run/interactive-map)
(Stand: Update vom 17. November 2026). Kartengrafik © ROB RUN. Inoffizielles Fan-Projekt.
