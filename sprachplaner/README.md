# Sprachplaner fürs Handy

Eigenständige App auf Grundlage der beigefügten Sprachplaner-HTML. Die bestehende Auftragsverwaltung im Repository bleibt separat.

## Installieren

- **Android ab Version 7:** Unter [GitHub Releases](https://github.com/jonnybecker121-cmyk/asdewq/releases) die Datei `Sprachplaner.apk` laden, öffnen und die Installation für diesen Browser erlauben.
- **iPhone (nach Aktivierung von GitHub Pages):** [Sprachplaner öffnen](https://jonnybecker121-cmyk.github.io/asdewq/sprachplaner/www/) in Safari → Teilen → Zum Home-Bildschirm. Die Seite einmal online vollständig öffnen; anschließend sind Planer und manuelle Eingabe offline verfügbar.
- Auf Android ist auch die Installation als Web-App über das Browsermenü möglich.

## Einmalig GitHub Pages aktivieren

Die GitHub-Verbindung durfte Pages nicht aktivieren (HTTP 403). Im Repository unter **Settings → Pages → Build and deployment → Deploy from a branch** den Branch `coderabbit/convert-html-mobile-app/a3e178db` und `/ (root)` auswählen und speichern. Nach erfolgreichem Pages-Deployment funktioniert der iPhone-Link oben. Nach dem Zusammenführen des Pull Requests kann die Quelle auf `main` umgestellt werden. Vor jeder späteren Veröffentlichung den Cache-Versionsnamen in `www/sw.js` erhöhen. Die neue Version wird nach Schließen und erneutem Öffnen der App aktiv.

## Funktionen und Grenzen

Termine mit Datum/Uhrzeit, To-dos, Listen mit Unterpunkten, Abhaken, Bearbeiten, Löschen und deutsche Spracheingabe aus der HTML bleiben erhalten. Der Plus-Knopf öffnet die manuelle Eingabe. Beispiele: „Zahnarzt morgen um 15 Uhr“, „Müll rausbringen“, „Einkaufsliste Milch und Brot“.

Profile und Einträge liegen **nur auf dem jeweiligen Gerät/in diesem Browser**. Keine Cloud, kein geräteübergreifender Login, keine E-Mail, keine Passwort-Wiederherstellung. Profilpasswörter sind keine Datenverschlüsselung. Browserdaten löschen oder App deinstallieren kann die Einträge entfernen. Bereits in der separaten Test-HTML gespeicherte Daten werden nicht automatisch übernommen. Es gibt keine Erinnerungsbenachrichtigungen oder Systemkalender-Synchronisierung.

Android verwendet die Spracherkennung des Geräts und fragt nach Mikrofonzugriff. Eine installierte Spracherkennung und gegebenenfalls Internet werden benötigt. Auf iPhone hängt Spracheingabe von Safari/iOS ab; bei fehlender Unterstützung den Satz tippen oder das Diktiermikrofon der Tastatur nutzen. Sprachdaten können vom jeweiligen Betriebssystem/Sprachdienst verarbeitet werden. Die Web-App ist keine native IPA/App-Store-Veröffentlichung.

## Entwicklung

```sh
cd sprachplaner
npm ci
npm test
npm run dev
npm run sync
cd android
./gradlew assembleDebug
```

Node 24, JDK 21, Android SDK 36 und Build Tools 35.0.0. `www/` enthält die aus der Original-HTML extrahierten und formatierten Quellen samt eingebettetem Capacitor-Laufzeitcode. `npm run build` kopiert die Web-App nach `dist/` und versieht den Offline-Cache mit einem Inhalts-Hash. GitHub Actions erzeugt eine Debug-APK und das Web-Paket als Build-Artefakte. Debug-APKs sind nicht als Updates der signierten Release-APK installierbar.

Signierte lokale Builds benötigen `SP_SIGNING_FILE` (privater Keystore), `SP_SIGNING_PASSWORD` und Alias `sprachplaner`:

```sh
npm run sync
cd android
./gradlew assembleRelease
```

Keystore und Passwort gehören nicht ins Repository. Für Updates denselben Schlüssel behalten und `versionCode` in `android/app/build.gradle` erhöhen. Der erste Veröffentlichungsschlüssel wird privat in der Build-Umgebung verwahrt. GitHub hat das automatische Setzen der Secrets verweigert (fehlende Berechtigung). Für signierte manuelle Workflow-Läufe müssen `SP_KEYSTORE_BASE64` und `SP_SIGNING_PASSWORD` noch in den Repository-Secrets hinterlegt werden. Ohne diesen Schlüssel sind spätere Updates der Release-APK nicht möglich.

## Prüfungen

`npm test` prüft deutsche Datumserkennung, Aufgaben/Listen, lokale Profile, CRUD, kaskadierendes Löschen und Speicherfehler. Browserprüfung ergänzt die Bedienung bei Handybreite und den Offline-Cache. Mikrofonberechtigungen und echte Spracherkennung müssen zusätzlich auf den Zielhandys geprüft werden.

## PC-Desktop-Version (Windows)

Windows 10/11 (64 Bit): Im [Desktop-Release](https://github.com/jonnybecker121-cmyk/asdewq/releases/tag/sprachplaner-desktop-v1.1.0) die Datei **Sprachplaner-Setup-1.1.0.exe** herunterladen und starten. Der Installationsassistent erstellt Einträge im Startmenü und auf dem Desktop. Die App läuft danach ohne Browser und ohne GitHub Pages, auch offline.

Termine, To-dos, Listen und die Auswertung deutscher Sätze sind enthalten. Ab Version **1.1.0** startet ein Klick auf das Mikrofon direkt die Aufnahme: kurz warten, bis „Ich höre zu …“ erscheint, sprechen und mit **Fertig** übernehmen. Nach einer Sprechpause wird der Satz auch automatisch eingetragen. Das mitgelieferte deutsche Vosk-Sprachmodell erkennt die Sprache lokal und offline. **Windows + H ist nicht erforderlich.** Das erste Laden des Modells kann einige Sekunden dauern. Unter **Lieber tippen** kannst du bei Bedarf zur Texteingabe wechseln. Windows muss Desktop-Apps den Mikrofonzugriff erlauben.

PC-Profile und Daten liegen unter `%APPDATA%\Sprachplaner`. Sie werden nicht mit dem Handy oder einer Browser-Version synchronisiert. Die App ist nicht mit einem kommerziellen Windows-Codezertifikat signiert; Windows kann beim ersten Start einen Hinweis auf einen unbekannten Herausgeber anzeigen. Unter **Hilfe → Über Sprachplaner** stehen Hinweise zur Speicherung und Spracheingabe.

### Desktop entwickeln und prüfen

```sh
cd sprachplaner/desktop
npm ci
npm test
npm start
npm run build:win
```

Node 24. Die Electron-Laufzeit und der Windows-Installer verwenden eine eigene Lockdatei. `prepare:web` übernimmt die aktuellen gemeinsamen Quellen aus `www/`; generierte Desktop-Dateien liegen in `desktop/web/`. Die Fensteroberfläche läuft ohne Node-Zugriff und lädt nur mitgelieferte Dateien über einen festen lokalen App-Ursprung. Profile bleiben bei App-Neustarts und Updates erhalten.

`npm run test:runtime` prüft das echte Desktop-Fenster, Profile, Aufgaben, Listen, die Abschottung des Fensters sowie gespeicherte Daten nach einem vollständigen App-Neustart. Eine synthetische deutsche WAV-Datei wird als Testmikrofon eingespeist und durch das echte WASM-Sprachmodell erkannt; der daraus angelegte Zahnarzttermin muss morgen um 15 Uhr liegen. Unter Linux benötigt diese Prüfung eine Anzeige, beispielsweise `xvfb-run -a npm run test:runtime`. GitHub Actions führt diese Prüfungen auf Windows aus und baut den Installer als Artefakt **Sprachplaner-Windows-Setup**. Die vorhandenen Android- und Web-Builds laufen weiterhin separat.

### Offline-Sprachmodell

Beim Desktop-Build wird `vosk-model-small-de-0.15` (45 MB, Apache-2.0) von der offiziellen Vosk-Modellseite geladen. Der Build prüft die fest hinterlegte SHA256-Prüfsumme und packt die Modelldateien in den Installer. Zur Laufzeit werden weder Modell noch Audiodaten aus dem Internet übertragen. Der mitgelieferte Worker verarbeitet die Mikrofonaufnahme; die App-Oberfläche selbst behält ihre gesperrten Netzwerkverbindungen und bekommt keinen Node-Zugriff. Nur Audio vom lokalen App-Ursprung wird freigegeben; Kamera und fremde Seiten bleiben gesperrt. Bibliothek, Modellquelle, Integrationsänderung und Lizenz stehen in `desktop/THIRD_PARTY_NOTICES.txt`.

Die frühere 1.0-Version kann direkt mit dem neuen Installer aktualisiert werden; dasselbe lokale Datenverzeichnis bleibt erhalten. Tests verwenden ausschließlich synthetische Stimme, keine echten Benutzeraufnahmen. Die Verständlichkeit des eigenen Mikrofons bitte zusätzlich am PC prüfen.
