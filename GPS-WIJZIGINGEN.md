# GPS en iPhone

Deze versie vraagt precieze locatie aan en filtert ongeldige, oude en zeer onnauwkeurige metingen. Kleine schommelingen bij stilstand worden onderdrukt. Grote sprongen moeten door meerdere metingen bevestigd worden. Starten, stoppen, weigering en hervatten zijn afgehandeld zonder oude callbacks opnieuw te gebruiken.

De PNG heeft geen geografische coördinaten. De oude versie plaatste elke gebruiker automatisch op hetzelfde verzonnen punt en gebruikte een geschatte schaal en richting. Deze versie doet dat niet. GPS-coördinaten blijven beschikbaar in het informatiepaneel. Voor de bestaande lokaalroutes kies je een vertrekpunt. Hiervoor hoef je niets te kalibreren; het is een vaste route, geen live binnenhuisnavigatie. De bestaande lokaal- en gangcoördinaten zijn behouden en niet ter plaatse ingemeten.

## Publiceren en testen

Publiceer index.html, location-core.js en sw.js samen met de bestaande overige bestanden op dezelfde HTTPS-locatie. Alleen opslaan op de computer verandert de versie op de telefoon niet. Er is vanuit deze chat niets online gepubliceerd.

1. Open de HTTPS-site in Safari en herlaad de app. Controleer of 'GPS opnieuw zoeken' en de keuzelijst 'Vertrekpunt' zichtbaar zijn.
2. Start de locatie en sta op je iPhone precieze locatie toe voor deze website.
3. Test buiten: 60 seconden stilstaan, daarna 30 meter lopen. Vergelijk de getoonde onzekerheid en coördinaten; binnenshuis kan de locatie onvoldoende betrouwbaar zijn.
4. Stop tijdens het zoeken: de status moet Uit blijven. Start opnieuw, zet de app kort op de achtergrond en open hem weer.
5. Zonder nieuwe bruikbare meting verschijnt na 15 seconden 'Verouderde positie'. Bij onnauwkeurige metingen blijft de laatst bruikbare positie staan met een waarschuwing.
6. Kies een vertrekpunt en bestemming om de vaste route te zien. De rode stip geeft het gekozen vertrekpunt aan, niet een gemeten gps-positie.

13 geautomatiseerde tests geslaagd; routeweergave in de ingebouwde browser gecontroleerd. Nog niet op een fysieke iPhone getest. De onzekerheid van de telefoon wordt niet kleiner voorgesteld door filtering. Accurate automatische positie op deze PNG is met de beschikbare gegevens niet gerealiseerd.

Technische referentie: https://www.w3.org/TR/geolocation/ (hoge nauwkeurigheid is een verzoek aan de browser, geen garantie).
