/* Deutsche Texte, Farben und Symbole für alle Kategorien. */
window.I18N = {
  groups: {
    Places:               { de: 'Orte',               icon: '🏙️' },
    Services:             { de: 'Dienste',            icon: '🛎️' },
    'Security and clans': { de: 'Sicherheit & Clans', icon: '🛡️' },
    Containers:           { de: 'Behälter',           icon: '🗄️' },
    'Loot spots':         { de: 'Beute-Spots',        icon: '💰' },
  },

  // slug: [Deutscher Name, Symbol, Farbe, sammelbar?]
  categories: {
    'place-banks':              ['Banken', '🏦', '#ffcb3e'],
    'place-cafes':              ['Cafés', '☕', '#ffcb3e'],
    'place-convenience-stores': ['Supermärkte', '🛒', '#ffcb3e'],
    'place-cottages':           ['Villen & Cottages', '🏡', '#ffcb3e'],
    'place-electronics-stores': ['Elektronikläden', '📱', '#ffcb3e'],
    'place-equipment-stores':   ['Ausrüstungsläden', '🦺', '#ffcb3e'],
    'place-galleries':          ['Kunstgalerie', '🖼️', '#ffcb3e'],
    'place-gas-stations':       ['Tankstelle', '⛽', '#ffcb3e'],
    'place-gun-shops':          ['Waffenläden', '🔫', '#ffcb3e'],
    'place-hospitals':          ['Krankenhaus', '🏥', '#ffcb3e'],
    'place-hotels':             ['Hotels', '🏨', '#ffcb3e'],
    'place-jewelry-stores':     ['Juweliere', '💎', '#ffcb3e'],
    'place-pharmacies':         ['Apotheken', '💊', '#ffcb3e'],
    'place-police-stations':    ['Polizeiwache', '🚓', '#ffcb3e'],
    'place-strip-clubs':        ['Stripclub', '💃', '#ffcb3e'],

    'atm':              ['Geldautomaten', '🏧', '#b6f23a'],
    'fence':            ['Hehler', '🤝', '#b6f23a'],
    'parking-terminal': ['Parkautomaten', '🅿️', '#b6f23a'],
    'smugglers-van':    ['Schmuggler-Vans', '🚐', '#b6f23a'],

    'alarm-panel':   ['Alarmanlagen', '🚨', '#ff5a5a'],
    'clan-business': ['Clan-Geschäfte', '🏴', '#ff5a5a'],

    'atm-container': ['Geldkassetten (ATM)', '💵', '#a78bfa', true],
    'bank-cell':     ['Schließfächer', '🔐', '#a78bfa', true],
    'cupboard':      ['Schränke & Schubladen', '🗄️', '#a78bfa', true],
    'locked-room':   ['Verschlossene Räume', '🚪', '#a78bfa'],
    'safe':          ['Tresore', '🧰', '#a78bfa', true],
    'weapon-locker': ['Waffenschränke', '🪖', '#a78bfa', true],

    'alcohol':       ['Alkohol', '🍾', '#ff4f9a', true],
    'ammo-grenades': ['Munition & Granaten', '💣', '#ff4f9a', true],
    'bank-vault':    ['Bargeld & Gold (Bank)', '🪙', '#ff4f9a', true],
    'cash-register': ['Kassen', '🧾', '#ff4f9a', true],
    'electronics':   ['Elektronik', '💻', '#ff4f9a', true],
    'equipment':     ['Ausrüstung', '🎒', '#ff4f9a', true],
    'statues':       ['Figuren', '🗿', '#ff4f9a', true],
    'jewelry':       ['Schmuck', '💍', '#ff4f9a', true],
    'medicine':      ['Medikamente', '🩹', '#ff4f9a', true],
    'car-parts':     ['Ersatzteile', '🔧', '#ff4f9a', true],
    'drugs':         ['Substanzen', '🧪', '#ff4f9a', true],
    'trash':         ['Mülltonnen', '🗑️', '#2ee88a', true],
  },

  names: {
    'Alarm panel': 'Alarmanlage', 'Alcohol': 'Alkohol', 'Alcohol Rack': 'Alkohol-Regal',
    'Ammo or grenades': 'Munition oder Granaten', 'Munition Rack': 'Munitionsregal',
    'ATM': 'Geldautomat', 'Bank employee': 'Bankangestellter', 'ATM cash box': 'Geldkassette (ATM)',
    'Deposit box': 'Schließfach', 'Bank cash or gold': 'Bargeld oder Gold', 'Spare parts': 'Ersatzteile',
    'Spare Parts Rack': 'Ersatzteil-Regal', 'Cash register': 'Kasse', 'Clan business': 'Clan-Geschäft',
    'Cupboard or drawer': 'Schrank oder Schublade', 'Substances': 'Substanzen', 'Substances Rack': 'Substanzen-Regal',
    'Electronics': 'Elektronik', 'Equipment': 'Ausrüstung', 'Fence': 'Hehler', 'Jewelry': 'Schmuck',
    'Left hidden room': 'Linker versteckter Raum', 'Right hidden room': 'Rechter versteckter Raum',
    'Medications': 'Medikamente', 'Medications Rack': 'Medikamenten-Regal', 'Parking Terminal': 'Parkautomat',
    'Safe': 'Tresor', "Smuggler's Van": 'Schmuggler-Van', 'Figurines': 'Figuren', 'Trash can': 'Mülltonne',
    'Weapon locker': 'Waffenschrank', 'Convenience Store': 'Supermarkt', 'Cottage': 'Cottage',
    'Elite Cottage': 'Elite-Cottage', "Noble's Mansion": 'Adelsvilla', 'Electronics Store': 'Elektronikladen',
    'Equipment Store: East': 'Ausrüstungsladen Ost', 'Equipment Store: West': 'Ausrüstungsladen West',
    'Art Gallery': 'Kunstgalerie', 'Gas Station': 'Tankstelle', 'Gun Shop: East': 'Waffenladen Ost',
    'Gun Shop: West': 'Waffenladen West', 'Hospital': 'Krankenhaus', 'Jewelry Store: East': 'Juwelier Ost',
    'Jewelry Store: West': 'Juwelier West', 'Pharmacy': 'Apotheke', 'Police Station': 'Polizeiwache',
    'Strip Club': 'Stripclub', 'Looty Bay Bank': 'Looty Bay Bank',
  },

  sublabels: {
    'Loot spot': 'Beute-Spot', 'Container': 'Behälter',
    'Loot spot, underground': 'Beute-Spot · unterirdisch', 'Container, underground': 'Behälter · unterirdisch',
    'Underground, 4 m down': 'Unterirdisch · 4 m tief', 'Large Business': 'Großes Geschäft',
    'Small Business': 'Kleines Geschäft', 'Medium Business': 'Mittleres Geschäft', 'Building': 'Gebäude',
  },

  contents: {
    'Safes': 'Tresore', 'Safe': 'Tresor', 'Deposit Boxes': 'Schließfächer', 'Vault': 'Tresorraum',
    'Gold Bar Stacks': 'Goldbarren-Stapel', 'Cash Stacks': 'Bargeld-Stapel', 'Cash Stack': 'Bargeld-Stapel',
    'Bank Money Bags': 'Geldsäcke', 'Sellers': 'Verkäufer', 'Seller': 'Verkäufer', 'Bank Employee': 'Bankangestellter',
    'Surveillance Cameras': 'Überwachungskameras', 'Surveillance Camera': 'Überwachungskamera',
    'Metal Detectors': 'Metalldetektoren', 'Metal Detector': 'Metalldetektor', 'Office Cabinets': 'Büroschränke',
    'Office Cabinet': 'Büroschrank', 'Alcohol': 'Alkohol', 'Cash Registers': 'Kassen', 'Cash Register': 'Kasse',
    'Electrical Panel': 'Stromkasten', 'Civilian': 'Zivilist', 'Civilians': 'Zivilisten', 'Cabinets': 'Schränke',
    'Cabinet': 'Schrank', 'Secured Computer': 'Gesicherter Computer', 'Secured Computers': 'Gesicherte Computer',
    'Tool Cabinet': 'Werkzeugschrank', 'Tool Cabinets': 'Werkzeugschränke', 'Substances': 'Substanzen',
    'Spare Parts': 'Ersatzteile', 'Bedside Tables': 'Nachttische', 'Figurines': 'Figuren', 'Electronics': 'Elektronik',
    'Equipment': 'Ausrüstung', 'Munition': 'Munition', 'Jewelry': 'Schmuck', 'Medications': 'Medikamente',
    'Cupboards': 'Schränke', 'Grenades': 'Granaten', 'Dressers': 'Kommoden',
  },

  descriptions: {
    'Withdraw Cash': 'Hier kannst du Bargeld abheben.',
    "Opening one takes 1.5 s. Deposit boxes can't be drilled, and no key opens them.":
      'Öffnen dauert 1,5 s. Schließfächer lassen sich nicht aufbohren und kein Schlüssel passt.',
    'In the right hidden room in the cellar under the Gas Station, behind a locked door that opens with the Room Key for the right hidden room.':
      'Im rechten versteckten Raum im Keller unter der Tankstelle – hinter einer verschlossenen Tür, die der Raumschlüssel für den rechten Raum öffnet.',
    'In the left hidden room in the cellar under the Gas Station, behind a locked door that opens with the Room Key for the left hidden room.':
      'Im linken versteckten Raum im Keller unter der Tankstelle – hinter einer verschlossenen Tür, die der Raumschlüssel für den linken Raum öffnet.',
    'Here you can sell items. Prices depend on your item sale bonus.':
      'Hier verkaufst du Gegenstände. Der Preis hängt von deinem Verkaufsbonus für Gegenstände ab.',
    'In the cellar of the Gas Station in Downtown. Take the stairs down from the repair garage (the side with the car lifts); this locked metal door opens with the Room Key for the left hidden room. Its room lies right under the car lifts. Inside: cupboard or drawer, safe and substances.':
      'Im Keller der Tankstelle in Downtown. Nimm die Treppe aus der Werkstatt (Seite mit den Hebebühnen) nach unten; diese Metalltür öffnet der Raumschlüssel für den linken Raum. Der Raum liegt direkt unter den Hebebühnen. Inhalt: Schrank/Schublade, Tresor und Substanzen.',
    'In the cellar of the Gas Station in Downtown. Take the stairs down from the repair garage (the side with the car lifts); this locked metal door opens with the Room Key for the right hidden room. It is on the other side of the stairs from the car lifts, toward the shop. Inside: bank cash or gold, cupboard or drawer, safe and spare parts.':
      'Im Keller der Tankstelle in Downtown. Nimm die Treppe aus der Werkstatt (Seite mit den Hebebühnen) nach unten; diese Metalltür öffnet der Raumschlüssel für den rechten Raum. Sie liegt auf der anderen Seite der Treppe, Richtung Shop. Inhalt: Bargeld/Gold, Schrank/Schublade, Tresor und Ersatzteile.',
    'The Central Bank of Looty Bay. Behind the doors of the city’s largest bank lies a massive vault. There’s definitely something worth stealing in there.':
      'Die Zentralbank von Looty Bay. Hinter den Türen der größten Bank der Stadt liegt ein riesiger Tresorraum – hier gibt es definitiv etwas zu holen.',
    'A small, cozy café on the pier.': 'Ein kleines, gemütliches Café am Pier.',
    'A cozy burger place in the business district of Looty Bay.': 'Ein gemütlicher Burgerladen im Geschäftsviertel von Looty Bay.',
    'A convenience store in the resort area of Looty Bay.': 'Ein Supermarkt im Urlaubsviertel von Looty Bay.',
    'A convenience store in the business district of Looty Bay, next to the bridge.': 'Ein Supermarkt im Geschäftsviertel, direkt an der Brücke.',
    'A convenience store in the business district of Looty Bay.': 'Ein Supermarkt im Geschäftsviertel von Looty Bay.',
    'A cottage in an elite neighborhood. Rumor has it that its owner was very fond of all kinds of exotic plants.':
      'Ein Cottage im Nobelviertel. Gerüchten zufolge liebte der Besitzer exotische Pflanzen.',
    'A cottage in an elite neighborhood of Looty Bay.': 'Ein Cottage im Nobelviertel von Looty Bay.',
    'A house that embodies the highest standard of luxury and respectability.': 'Ein Haus, das Luxus und Ansehen auf höchstem Niveau verkörpert.',
    'A luxurious and expensive mansion in an elite neighborhood.': 'Eine luxuriöse, teure Villa im Nobelviertel.',
    'The eastern branch of the Emporium store. It sells smartphones, laptops, as well as other electronics and household appliances.':
      'Die Ost-Filiale von Emporium: Smartphones, Laptops, Elektronik und Haushaltsgeräte.',
    'The western branch of the Emporium store. It sells smartphones, laptops, as well as other electronics and household appliances.':
      'Die West-Filiale von Emporium: Smartphones, Laptops, Elektronik und Haushaltsgeräte.',
    'Here you can purchase munitions and protective gear.': 'Hier kaufst du Munition und Schutzausrüstung.',
    'The central art gallery in Looty Bay, displaying priceless works of art.': 'Die zentrale Kunstgalerie von Looty Bay mit unbezahlbaren Kunstwerken.',
    "This gas station with a repair shop is the officer's favorite hangout spot.": 'Tankstelle mit Werkstatt – der Lieblingstreffpunkt der Polizei.',
    'The eastern branch of the Coastal Eagle gun shop with a large selection of weapons.': 'Die Ost-Filiale von Coastal Eagle mit großer Waffenauswahl.',
    'The western branch of the Coastal Eagle gun shop with a large selection of weapons.': 'Die West-Filiale von Coastal Eagle mit großer Waffenauswahl.',
    "Looty Bay's general hospital.": 'Das Krankenhaus von Looty Bay.',
    'The most prestigious hotel in Looty Bay. Accommodates the most influential people.': 'Das renommierteste Hotel von Looty Bay – hier wohnen die einflussreichsten Leute.',
    'The blue Reef Hotel overlooking the ocean.': 'Das blaue Reef Hotel mit Meerblick.',
    'The yellow Seasons Hotel overlooking the pier.': 'Das gelbe Seasons Hotel mit Blick auf den Pier.',
    'The eastern branch of the Brittany jewelry store selling unique jewelry.': 'Die Ost-Filiale des Juweliers Brittany mit einzigartigem Schmuck.',
    'The western branch of the Brittany jewelry store selling unique jewelry.': 'Die West-Filiale des Juweliers Brittany mit einzigartigem Schmuck.',
    'A branch of the major Looty Bay pharmacy chain in the resort area.': 'Eine Filiale der großen Apothekenkette im Urlaubsviertel.',
    'Central Police Department of Looty Bay. A bastion of law and order where you can join the force or pick up a powerful arsenal from the confiscated goods warehouse.':
      'Das Polizeipräsidium von Looty Bay. Hier kannst du der Polizei beitreten oder dich im Asservatenlager mit schweren Waffen eindecken.',
    'A club where you can relax both your soul and your senses.': 'Ein Club zum Entspannen für Körper und Seele.',
    'Here you can sell cargo. Prices depend on your cargo sale bonus.': 'Hier verkaufst du Fracht. Der Preis hängt von deinem Fracht-Verkaufsbonus ab.',
  },
};
