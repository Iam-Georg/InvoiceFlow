export interface Industry {
  slug: string;
  name: string;
  category: "kreative" | "tech" | "beratung" | "handwerk";
  benefit: string;
  icon: string;
  heroTitle: string;
  heroSubtitle: string;
  painPoints: [string, string, string];
  pressureScoreHook: string;
  features: [string, string, string, string];
  testimonialQuote: string;
  metaDescription: string;
  keywords: string[];
  avgInvoiceAmount: string;
  avgPaymentDays: number;
}

export const INDUSTRIES: Industry[] = [
  {
    slug: "fotografen",
    name: "Fotografen",
    category: "kreative",
    benefit: "Nutzungsrechte & Shootings in einer Rechnung",
    icon: "Camera",
    heroTitle: "Rechnungen für Fotografen — in 60 Sekunden",
    heroSubtitle:
      "Du fotografierst Hochzeiten, Events und Produkte. Faktura kümmert sich um deine Rechnungen, damit du dich aufs Bild konzentrieren kannst.",
    painPoints: [
      "Kunden zahlen erst Wochen nach dem Shooting — besonders bei Events",
      "Komplexe Rechnungen mit Anfahrt, Bearbeitung und Bildrechten",
      "Keine Zeit für Buchhaltung zwischen Shootings und Postproduktion",
    ],
    pressureScoreHook:
      "Der Zahlungsdruck-Score zeigt dir nach jedem Shooting sofort, welcher Kunde erfahrungsgemäß spät zahlt — bevor du überhaupt die Bearbeitung startest.",
    features: [
      "PDF-Rechnungen im professionellen Look für dein Fotografie-Business",
      "Automatische Zahlungserinnerungen nach dem Shooting",
      "Mehrere Positionen: Shooting, Bearbeitung, Bildrechte, Anfahrt",
      "DATEV-Export für deinen Steuerberater am Jahresende",
    ],
    testimonialQuote:
      "Früher habe ich Rechnungen zwischen zwei Shootings geschrieben — jetzt brauche ich 60 Sekunden mit Faktura.",
    metaDescription:
      "Rechnungsprogramm für Fotografen — Rechnungen in 60 Sekunden erstellen, automatische Zahlungserinnerungen und smarter Zahlungsdruck-Score. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm fotografen",
      "rechnung fotograf vorlage",
      "fotografie rechnung schreiben",
      "rechnungssoftware fotografen",
    ],
    avgInvoiceAmount: "800 – 3.000 €",
    avgPaymentDays: 23,
  },
  {
    slug: "webdesigner",
    name: "Webdesigner",
    category: "kreative",
    benefit: "Abschlagszahlungen für jede Projektphase",
    icon: "Globe",
    heroTitle: "Rechnungen für Webdesigner — in 60 Sekunden",
    heroSubtitle:
      "Du baust Websites und Shops. Faktura baut deine Rechnungen — mit Abschlagszahlungen, Stundensätzen und allem, was Webprojekte brauchen.",
    painPoints: [
      "Projekte ziehen sich — Kunden verzögern Abnahme und Zahlung",
      "Abschlagszahlungen und Meilenstein-Rechnungen sind manuell aufwändig",
      "Scope Creep führt zu Nachträgen, die schwer abzurechnen sind",
    ],
    pressureScoreHook:
      "Dein Pressure Score warnt dich automatisch, wenn ein Webprojekt-Kunde historisch langsam zahlt — damit du frühzeitig Vorkasse vereinbarst.",
    features: [
      "Positionen für Konzeption, Design, Entwicklung und Hosting",
      "Wiederkehrende Rechnungen für Wartungsverträge und Hosting",
      "KI-Rechnungserstellung: Projektbeschreibung rein, Rechnung raus",
      "Professionelle PDF-Vorlagen für Kundenpräsentationen",
    ],
    testimonialQuote:
      "Meine Wartungsverträge laufen jetzt komplett automatisch — Faktura erstellt und versendet die Monatsrechnung von allein.",
    metaDescription:
      "Rechnungsprogramm für Webdesigner — Projektabrechnungen, wiederkehrende Hosting-Rechnungen und automatische Mahnungen. Kostenlos testen.",
    keywords: [
      "rechnungsprogramm webdesigner",
      "rechnung webdesign vorlage",
      "freelancer webdesign rechnung",
      "rechnungssoftware webentwicklung",
    ],
    avgInvoiceAmount: "2.000 – 8.000 €",
    avgPaymentDays: 28,
  },
  {
    slug: "it-berater",
    name: "IT-Berater",
    category: "tech",
    benefit: "Tagessätze + DATEV-Export für Konzern-Kunden",
    icon: "Monitor",
    heroTitle: "Rechnungen für IT-Berater — in 60 Sekunden",
    heroSubtitle:
      "Dein Tagessatz steht, dein Projekt läuft. Faktura rechnet deine Stunden ab — GoBD-konform und mit einem Klick beim Steuerberater.",
    painPoints: [
      "Große Konzerne zahlen systematisch erst nach 60+ Tagen",
      "Stundenbasierte Abrechnungen mit verschiedenen Tagessätzen",
      "GoBD-Konformität ist Pflicht bei Betriebsprüfungen",
    ],
    pressureScoreHook:
      "Konzern-Kunden haben eigene Zahlungsrhythmen. Dein Pressure Score lernt das Muster jedes Kunden und warnt dich nur, wenn es wirklich überfällig wird.",
    features: [
      "Stundensätze und Tagessätze sauber als Positionen abbilden",
      "GoBD-konforme Rechnungen für die Betriebsprüfung",
      "DATEV-Export direkt an deinen Steuerberater",
      "Automatische Erinnerungen mit eskalierenden Mahnstufen",
    ],
    testimonialQuote:
      "Als IT-Berater mit 3 Konzern-Kunden spare ich mir den Steuerberater für die Rechnungstellung — Faktura + DATEV-Export reicht.",
    metaDescription:
      "Rechnungsprogramm für IT-Berater und Freelancer — Tagessätze, GoBD-konform, DATEV-Export. Automatische Mahnungen für Konzern-Kunden.",
    keywords: [
      "rechnungsprogramm it berater",
      "it freelancer rechnung",
      "it consulting rechnung vorlage",
      "rechnungssoftware berater",
    ],
    avgInvoiceAmount: "5.000 – 15.000 €",
    avgPaymentDays: 35,
  },
  {
    slug: "texter",
    name: "Texter & Copywriter",
    category: "kreative",
    benefit: "Blitz-Rechnungen für viele kleine Aufträge",
    icon: "PenTool",
    heroTitle: "Rechnungen für Texter — in 60 Sekunden",
    heroSubtitle:
      "Du schreibst Texte, die verkaufen. Faktura schreibt Rechnungen, die schnell bezahlt werden — inklusive Wort-Preise und Pauschalbeträge.",
    painPoints: [
      "Viele kleine Aufträge bedeuten viele Rechnungen pro Monat",
      "Kunden vergessen die Zahlung bei kleinen Beträgen",
      "Mischung aus Pauschal- und Wortpreis-Abrechnungen",
    ],
    pressureScoreHook:
      "Gerade bei vielen kleinen Rechnungen verlierst du den Überblick. Der Pressure Score priorisiert automatisch, welche Rechnung deine Aufmerksamkeit braucht.",
    features: [
      "Blitz-Rechnungen für kleine Textaufträge in unter einer Minute",
      "Automatische Zahlungserinnerungen — nie wieder manuell nachhaken",
      "KI-Rechnungserstellung: Auftragsbeschreibung eingeben, Rechnung fertig",
      "Alle Rechnungen auf einen Blick im übersichtlichen Dashboard",
    ],
    testimonialQuote:
      "Ich schreibe 15-20 Rechnungen pro Monat. Früher ein halber Tag, jetzt 20 Minuten mit Faktura.",
    metaDescription:
      "Rechnungsprogramm für Texter und Copywriter — schnelle Rechnungen für Wortpreise und Pauschalen. Automatische Mahnungen. Kostenlos.",
    keywords: [
      "rechnungsprogramm texter",
      "copywriter rechnung schreiben",
      "texter rechnung vorlage",
      "freelance texter rechnungssoftware",
    ],
    avgInvoiceAmount: "300 – 1.500 €",
    avgPaymentDays: 18,
  },
  {
    slug: "grafikdesigner",
    name: "Grafikdesigner",
    category: "kreative",
    benefit: "Entwurf, Reinzeichnung & Nutzungsrechte abrechnen",
    icon: "Palette",
    heroTitle: "Rechnungen für Grafikdesigner — in 60 Sekunden",
    heroSubtitle:
      "Du gestaltest Logos, Flyer und Brandings. Faktura gestaltet deine Rechnungen — mit dem gleichen Anspruch an Professionalität.",
    painPoints: [
      "Kunden wollen erst sehen, dann zahlen — Revisionsschleifen verzögern alles",
      "Nutzungsrechte und Lizenzen machen die Abrechnung komplex",
      "Unklare Briefings führen zu Mehraufwand, der schwer abrechenbar ist",
    ],
    pressureScoreHook:
      "Der Pressure Score erkennt Kunden, die nach der Abnahme systematisch die Zahlung verzögern — damit du vorher Vorkasse vereinbarst.",
    features: [
      "Positionen für Entwurf, Reinzeichnung, Nutzungsrechte und Druckdaten",
      "Professionelle PDF-Rechnungen, die zu deinem Branding passen",
      "Wiederkehrende Rechnungen für Retainer-Kunden",
      "Zahlungsdruck-Score für dein Kunden-Portfolio",
    ],
    testimonialQuote:
      "Meine Rechnungen sehen jetzt genauso professionell aus wie meine Designs — das macht einen Unterschied beim Kunden.",
    metaDescription:
      "Rechnungsprogramm für Grafikdesigner — professionelle PDF-Rechnungen, Nutzungsrechte abrechnen, automatische Mahnungen. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm grafikdesigner",
      "grafikdesign rechnung schreiben",
      "designer rechnung vorlage",
      "rechnungssoftware designer",
    ],
    avgInvoiceAmount: "500 – 5.000 €",
    avgPaymentDays: 25,
  },
  {
    slug: "architekten",
    name: "Architekten",
    category: "handwerk",
    benefit: "HOAI-Phasen und Abschlagsrechnungen meistern",
    icon: "Building2",
    heroTitle: "Rechnungen für Architekten — in 60 Sekunden",
    heroSubtitle:
      "HOAI-Phasen, Abschlagszahlungen und lange Projektlaufzeiten. Faktura bildet deine komplexe Abrechnungsstruktur einfach ab.",
    painPoints: [
      "Projekte laufen über Monate — Liquidität ist ein ständiges Thema",
      "HOAI-Phasen erfordern strukturierte Abschlagsrechnungen",
      "Bauherren zahlen oft erst nach Bauabnahme",
    ],
    pressureScoreHook:
      "Bei Projekten über mehrere Monate zeigt dir der Pressure Score, welche Abschlagsrechnung Aufmerksamkeit braucht — bevor dein Cashflow leidet.",
    features: [
      "Abschlagsrechnungen für jede Projektphase einzeln erstellen",
      "GoBD-konforme Rechnungen für Bauamt und Steuerprüfung",
      "Dashboard mit Cashflow-Überblick über alle laufenden Projekte",
      "DATEV-Export für die Steuererklärung",
    ],
    testimonialQuote:
      "Als Architekt brauche ich den Überblick über 5-10 parallele Projekte. Fakturas Dashboard zeigt mir sofort, wo Geld fehlt.",
    metaDescription:
      "Rechnungsprogramm für Architekten — Abschlagsrechnungen, HOAI-Phasen, GoBD-konform. Cashflow-Dashboard und DATEV-Export.",
    keywords: [
      "rechnungsprogramm architekten",
      "architekt rechnung schreiben",
      "hoai rechnung software",
      "rechnungssoftware architektur",
    ],
    avgInvoiceAmount: "3.000 – 20.000 €",
    avgPaymentDays: 40,
  },
  {
    slug: "coaches",
    name: "Coaches & Trainer",
    category: "beratung",
    benefit: "Coaching-Pakete und Sessions automatisch abrechnen",
    icon: "Heart",
    heroTitle: "Rechnungen für Coaches — in 60 Sekunden",
    heroSubtitle:
      "Du coachst Menschen zu besseren Ergebnissen. Faktura bringt deine Finanzen zu besseren Ergebnissen — mit automatischen Rechnungen nach jeder Session.",
    painPoints: [
      "Einzelsessions und Pakete mischen — die Abrechnung wird unübersichtlich",
      "Kunden buchen Pakete und zahlen dann nicht vollständig",
      "Zwischen Coaching-Sessions bleibt keine Zeit für Papierkram",
    ],
    pressureScoreHook:
      "Coaching lebt von Vertrauen. Der Pressure Score zeigt dir diskret, welcher Coachee eine freundliche Zahlungserinnerung braucht — ohne die Beziehung zu belasten.",
    features: [
      "Rechnungen für Einzelsessions und Coaching-Pakete",
      "Wiederkehrende Rechnungen für laufende Coaching-Verträge",
      "Freundliche, automatische Zahlungserinnerungen",
      "Business Health Score für deinen Coaching-Umsatz",
    ],
    testimonialQuote:
      "Meine Coaching-Pakete laufen über 3 Monate — Faktura erinnert automatisch an die Monatsrate.",
    metaDescription:
      "Rechnungsprogramm für Coaches und Trainer — Session-Abrechnungen, Coaching-Pakete, automatische Erinnerungen. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm coaches",
      "coach rechnung schreiben",
      "coaching rechnung vorlage",
      "rechnungssoftware trainer",
    ],
    avgInvoiceAmount: "200 – 2.000 €",
    avgPaymentDays: 15,
  },
  {
    slug: "uebersetzer",
    name: "Übersetzer & Dolmetscher",
    category: "beratung",
    benefit: "Wortpreise, Zeilenpreise und Agentur-Mahnungen",
    icon: "Languages",
    heroTitle: "Rechnungen für Übersetzer — in 60 Sekunden",
    heroSubtitle:
      "Du übersetzt Texte und dolmetschst auf Konferenzen. Faktura übersetzt deinen Aufwand in professionelle Rechnungen.",
    painPoints: [
      "Wortpreis-Abrechnungen sind mühsam manuell zu kalkulieren",
      "Agenturen haben eigene Zahlungsziele — oft 45+ Tage",
      "Eilaufträge und Wochenendzuschläge komplizieren die Rechnung",
    ],
    pressureScoreHook:
      "Übersetzungsagenturen sind notorisch langsame Zahler. Dein Pressure Score trackt das Zahlungsverhalten jeder Agentur automatisch.",
    features: [
      "Wortpreise, Zeilenpreise und Pauschalen als Positionen",
      "Zuschläge für Eilaufträge und Wochenendarbeit abbilden",
      "Automatische Mahnungen an zahlungsverzögernde Agenturen",
      "Überblick über alle offenen Rechnungen im Dashboard",
    ],
    testimonialQuote:
      "Als Übersetzerin mit 8 Agentur-Kunden weiß ich dank Faktura immer, wer noch nicht bezahlt hat.",
    metaDescription:
      "Rechnungsprogramm für Übersetzer und Dolmetscher — Wortpreise, Zeilenpreise, automatische Mahnungen an Agenturen. Kostenlos.",
    keywords: [
      "rechnungsprogramm übersetzer",
      "übersetzer rechnung vorlage",
      "dolmetscher rechnung schreiben",
      "rechnungssoftware übersetzer",
    ],
    avgInvoiceAmount: "400 – 2.500 €",
    avgPaymentDays: 30,
  },
  {
    slug: "musiker",
    name: "Musiker & DJs",
    category: "kreative",
    benefit: "Gagen und Technikpauschalen nach jedem Gig",
    icon: "Music",
    heroTitle: "Rechnungen für Musiker — in 60 Sekunden",
    heroSubtitle:
      "Du machst Musik, spielst Gigs und produzierst Beats. Faktura sorgt dafür, dass du dafür auch bezahlt wirst.",
    painPoints: [
      "Veranstalter zahlen erst Wochen nach dem Auftritt",
      "Mischung aus Gagen, GEMA-Anteilen und Technikpauschalen",
      "Bar-Zahlungen und Rechnungen parallel führen ist chaotisch",
    ],
    pressureScoreHook:
      "Nach einem Festival-Wochenende verlierst du den Überblick. Der Pressure Score sagt dir Montag morgen, welcher Veranstalter nachgefasst werden muss.",
    features: [
      "Rechnungen für Gagen, Technik und Anfahrt in einer Position",
      "Schnelle Rechnungserstellung direkt nach dem Gig",
      "Automatische Erinnerungen an säumige Veranstalter",
      "Statistiken über dein Musik-Einkommen nach Monaten",
    ],
    testimonialQuote:
      "Endlich ein Tool, das so schnell ist wie mein Set — Rechnung in 60 Sekunden nach dem Gig.",
    metaDescription:
      "Rechnungsprogramm für Musiker und DJs — Gagen abrechnen, automatische Mahnungen an Veranstalter. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm musiker",
      "musiker rechnung schreiben",
      "dj rechnung vorlage",
      "gage rechnung musiker",
    ],
    avgInvoiceAmount: "300 – 3.000 €",
    avgPaymentDays: 20,
  },
  {
    slug: "videografen",
    name: "Videografen & Filmemacher",
    category: "kreative",
    benefit: "Pre- bis Post-Production in einer Rechnung",
    icon: "Video",
    heroTitle: "Rechnungen für Videografen — in 60 Sekunden",
    heroSubtitle:
      "Du produzierst Videos, Imagefilme und Social-Media-Content. Faktura produziert deine Rechnungen — mit einem Bruchteil des Aufwands.",
    painPoints: [
      "Projekte haben lange Postproduktionsphasen — die Rechnung kommt spät",
      "Verschiedene Leistungen: Dreh, Schnitt, Color Grading, Musik-Lizenz",
      "Kunden wollen erst das fertige Video sehen, bevor sie zahlen",
    ],
    pressureScoreHook:
      "Videoproduktionen binden viel Vorleistung. Der Pressure Score zeigt dir, welche Kunden historisch erst nach dem dritten Reminder zahlen.",
    features: [
      "Positionen für Pre-Production, Dreh, Post-Production und Lizenzen",
      "Abschlagszahlungen bei größeren Produktionen",
      "KI-Rechnungserstellung aus der Projektbeschreibung",
      "PDF-Rechnungen im professionellen Film-Look",
    ],
    testimonialQuote:
      "Meine Imagefilm-Kunden zahlen jetzt im Schnitt 12 Tage schneller — dank Fakturas automatischen Erinnerungen.",
    metaDescription:
      "Rechnungsprogramm für Videografen — Dreh, Schnitt und Lizenzen abrechnen. Automatische Mahnungen. Kostenlos testen.",
    keywords: [
      "rechnungsprogramm videograf",
      "videoproduktion rechnung vorlage",
      "filmemacher rechnung schreiben",
      "rechnungssoftware videoproduktion",
    ],
    avgInvoiceAmount: "1.500 – 10.000 €",
    avgPaymentDays: 30,
  },
  {
    slug: "programmierer",
    name: "Programmierer & Entwickler",
    category: "tech",
    benefit: "Sprint-Abrechnungen und Retainer automatisiert",
    icon: "Code",
    heroTitle: "Rechnungen für Entwickler — in 60 Sekunden",
    heroSubtitle:
      "Du schreibst Code, der Probleme löst. Faktura schreibt Rechnungen, die schnell bezahlt werden — mit Stundensätzen und Sprint-Abrechnungen.",
    painPoints: [
      "Stundenbasierte Abrechnung erfordert präzise Zeiterfassung",
      "Agile Projekte haben wechselnde Scopes — Nachträge sind die Regel",
      "Startups als Kunden haben oft knappe Kassen und zahlen spät",
    ],
    pressureScoreHook:
      "Startup-Kunden sind begeistert von deinem Code, aber schlecht im Zahlen. Der Pressure Score flaggt Startup-Kunden mit schlechter Zahlungshistorie automatisch.",
    features: [
      "Stundensätze und Sprint-Pauschalen als Positionen",
      "Wiederkehrende Rechnungen für Retainer und SLA-Verträge",
      "DATEV-Export für deinen Steuerberater",
      "GoBD-konforme Archivierung aller Rechnungen",
    ],
    testimonialQuote:
      "Als Solo-Entwickler mit 4 Kunden spare ich mir mit Faktura die Buchhaltungssoftware komplett.",
    metaDescription:
      "Rechnungsprogramm für Programmierer und Entwickler — Stundensätze, Sprint-Abrechnungen, GoBD-konform. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm programmierer",
      "entwickler rechnung vorlage",
      "freelancer programmierer rechnung",
      "rechnungssoftware entwickler",
    ],
    avgInvoiceAmount: "3.000 – 12.000 €",
    avgPaymentDays: 27,
  },
  {
    slug: "berater",
    name: "Unternehmensberater",
    category: "beratung",
    benefit: "Tagessätze und Reisekosten für Konzern-Kunden",
    icon: "Briefcase",
    heroTitle: "Rechnungen für Berater — in 60 Sekunden",
    heroSubtitle:
      "Du berätst Unternehmen zu Strategie und Prozessen. Faktura optimiert deinen eigenen Prozess — die Rechnungsstellung.",
    painPoints: [
      "Tagessätze über mehrere Wochen summieren sich zu großen Beträgen",
      "Konzerne haben 60-90 Tage Zahlungsziele — Cashflow wird zum Problem",
      "Reisekosten und Spesen müssen separat ausgewiesen werden",
    ],
    pressureScoreHook:
      "Bei 5-stelligen Rechnungen an Konzerne zählt jeder Tag. Der Pressure Score eskaliert automatisch, wenn ein Konzern-Kunde über sein übliches Zahlungsziel hinausgeht.",
    features: [
      "Tagessätze und Reisekosten in einer Rechnung",
      "GoBD-konforme Rechnungen für Betriebsprüfungen",
      "Business Health Score für deinen Beratungsumsatz",
      "Automatische Mahnungen mit professionellem Tonfall",
    ],
    testimonialQuote:
      "Meine Konzern-Kunden nehmen Faktura-Rechnungen ernst — das professionelle Layout macht den Unterschied.",
    metaDescription:
      "Rechnungsprogramm für Unternehmensberater — Tagessätze, Reisekosten, GoBD-konform. Mahnungen für Konzern-Kunden. Kostenlos.",
    keywords: [
      "rechnungsprogramm berater",
      "unternehmensberater rechnung",
      "consulting rechnung vorlage",
      "rechnungssoftware beratung",
    ],
    avgInvoiceAmount: "5.000 – 25.000 €",
    avgPaymentDays: 42,
  },
  {
    slug: "handwerker",
    name: "Handwerker & Monteure",
    category: "handwerk",
    benefit: "Material und Arbeitsstunden getrennt ausweisen",
    icon: "Wrench",
    heroTitle: "Rechnungen für Handwerker — in 60 Sekunden",
    heroSubtitle:
      "Du bist auf der Baustelle, nicht im Büro. Faktura erstellt deine Rechnungen schnell und einfach — auch vom Smartphone.",
    painPoints: [
      "Abends nach der Baustelle noch Rechnungen schreiben kostet Kraft",
      "Material- und Arbeitskosten separat ausweisen ist aufwändig",
      "Privatkunden vergessen die Zahlung — gewerbliche zahlen verspätet",
    ],
    pressureScoreHook:
      "Du hast keine Zeit, Zahlungseingänge zu prüfen. Der Pressure Score macht das automatisch und erinnert dich nur an die Fälle, die Handlung brauchen.",
    features: [
      "Material und Arbeitsstunden getrennt als Positionen ausweisen",
      "Schnelle Rechnungserstellung direkt nach dem Auftrag",
      "Automatische Zahlungserinnerungen an Privat- und Gewerbekunden",
      "Statistiken über dein Einkommen nach Auftragstyp",
    ],
    testimonialQuote:
      "Ich schreibe meine Rechnungen jetzt auf der Rückfahrt von der Baustelle — in unter 2 Minuten.",
    metaDescription:
      "Rechnungsprogramm für Handwerker — Material und Arbeit abrechnen, automatische Mahnungen. Einfach und schnell. Kostenlos.",
    keywords: [
      "rechnungsprogramm handwerker",
      "handwerker rechnung schreiben",
      "handwerkerrechnung vorlage",
      "rechnungssoftware handwerk",
    ],
    avgInvoiceAmount: "500 – 5.000 €",
    avgPaymentDays: 22,
  },
  {
    slug: "dozenten",
    name: "Dozenten & Trainer",
    category: "beratung",
    benefit: "Honorare an mehrere Institutionen gleichzeitig",
    icon: "GraduationCap",
    heroTitle: "Rechnungen für Dozenten — in 60 Sekunden",
    heroSubtitle:
      "Du unterrichtest an Hochschulen, Akademien oder in Unternehmen. Faktura rechnet deine Honorare sauber und schnell ab.",
    painPoints: [
      "Bildungseinrichtungen zahlen über Umwege — Buchhaltung, Dekanat, Verwaltung",
      "Honorarverträge haben unterschiedliche Stundensätze pro Institution",
      "Semesterende = Rechnungsflut an mehrere Institutionen gleichzeitig",
    ],
    pressureScoreHook:
      "Universitäten zahlen langsam, aber zuverlässig. Der Pressure Score unterscheidet zwischen 'normal langsam' und 'ungewöhnlich überfällig' — damit du nur nachhakst, wenn es nötig ist.",
    features: [
      "Stundensätze pro Institution als separate Rechnungen",
      "Wiederkehrende Rechnungen für laufende Lehraufträge",
      "Batch-Erstellung: Mehrere Rechnungen auf einmal",
      "DATEV-Export für die jährliche Steuererklärung",
    ],
    testimonialQuote:
      "Am Semesterende erstelle ich 8 Rechnungen in 10 Minuten — für 4 verschiedene Hochschulen.",
    metaDescription:
      "Rechnungsprogramm für Dozenten — Honorare an Hochschulen und Akademien abrechnen. Wiederkehrende Rechnungen. Kostenlos.",
    keywords: [
      "rechnungsprogramm dozenten",
      "dozent rechnung schreiben",
      "honorarrechnung dozent vorlage",
      "rechnungssoftware lehrbeauftragte",
    ],
    avgInvoiceAmount: "400 – 3.000 €",
    avgPaymentDays: 35,
  },
  {
    slug: "virtuelle-assistenten",
    name: "Virtuelle Assistenten",
    category: "beratung",
    benefit: "Retainer-Rechnungen automatisch jeden Monat",
    icon: "Headphones",
    heroTitle: "Rechnungen für Virtuelle Assistenten — in 60 Sekunden",
    heroSubtitle:
      "Du managst Kalender, E-Mails und Projekte für andere. Faktura managed deine Rechnungen — automatisch und professionell.",
    painPoints: [
      "Viele Kunden mit kleinen Monatspauschalen — jeder braucht eine Rechnung",
      "Stundenpakete abrechnen und Restguthaben tracken ist manuell",
      "Kunden im Ausland erfordern manchmal englische Rechnungen",
    ],
    pressureScoreHook:
      "Mit 10+ Kunden und monatlichen Rechnungen verlierst du schnell den Überblick. Der Pressure Score sortiert automatisch nach Dringlichkeit.",
    features: [
      "Wiederkehrende Rechnungen für alle Retainer-Kunden automatisch",
      "Stundenpakete und Monatspauschalen als Positionen",
      "Massenversand: Alle Monatsrechnungen auf einmal erstellen",
      "Übersichtliches Dashboard für dein VA-Business",
    ],
    testimonialQuote:
      "12 Kunden, 12 monatliche Rechnungen — Faktura erstellt und versendet alle automatisch am 1. des Monats.",
    metaDescription:
      "Rechnungsprogramm für Virtuelle Assistenten — Retainer-Rechnungen, Stundenpakete, automatischer Versand. Kostenlos starten.",
    keywords: [
      "rechnungsprogramm virtuelle assistentin",
      "va rechnung schreiben",
      "virtuelle assistenz rechnung vorlage",
      "rechnungssoftware virtuelle assistenten",
    ],
    avgInvoiceAmount: "200 – 1.200 €",
    avgPaymentDays: 14,
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return INDUSTRIES.find((i) => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return INDUSTRIES.map((i) => i.slug);
}

export const CATEGORY_CONFIG = {
  kreative: {
    label: "Kreative",
    headline: "Kreative Köpfe verdienen kreative Rechnungen",
    description: "Von Fotografie über Design bis Musik — Faktura versteht kreative Arbeit.",
  },
  tech: {
    label: "Tech & Digital",
    headline: "Stundensätze, Sprints und Retainer — automatisiert",
    description: "Faktura spricht deine Sprache — ob Tagessatz oder Sprint-Pauschale.",
  },
  beratung: {
    label: "Beratung & Coaching",
    headline: "Mehr Zeit für deine Klienten, weniger für Papierkram",
    description: "Sessions, Pakete und Honorare — alles in einem Tool.",
  },
  handwerk: {
    label: "Handwerk & Spezialisten",
    headline: "Rechnungen so solide wie deine Arbeit",
    description: "Material, Arbeitsstunden und Abschläge — klar und professionell.",
  },
} as const;

export type Category = keyof typeof CATEGORY_CONFIG;

export function getIndustriesByCategory(category: Category): Industry[] {
  return INDUSTRIES.filter((i) => i.category === category);
}
