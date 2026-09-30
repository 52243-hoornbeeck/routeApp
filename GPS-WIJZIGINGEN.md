# Live GPS herstellen — versie gps-live-3

De kaartstip volgt weer geaccepteerde GPS-metingen. De route wordt bij het tekenen opnieuw vanaf de bewegende stip berekend. Er is geen verplichte kalibratie of vertrekpuntkeuze.

De eerste bruikbare meting krijgt standaard het oude geschatte startpunt (400,272). Een gekozen lokaal kan dat startpunt vervangen. De oorspronkelijke geschatte schaal (12 pixels/meter) en noordrichting zijn behouden. De PNG bevat geen geografische referentie: deze functie toont relatieve GPS-beweging en bewijst niet dat je op dat lokaal, die verdieping of die plek in het gebouw bent.

Metingen tot 40 meter onzekerheid worden voor geschatte beweging gebruikt; boven 15 meter verschijnt een waarschuwing. Slechtere, oude en ongeldige metingen worden afgewezen. Een grote plotselinge sprong moet bevestigd worden. De ontvangsttijd wordt ook bijgewerkt wanneer een te onnauwkeurige meting wordt afgewezen. Een verbinding die 30 seconden geen verse meting doorgeeft wordt opnieuw gestart zolang de app zichtbaar is.

17 geautomatiseerde tests controleren onder meer zichtbare stipbeweging zonder vertrekpuntkeuze, wandelbeweging, stilstand, sprongen, herstarten en het herstellen van een stille locatieverbinding. Uitvoeren: node tests/gps.test.cjs.

## Test op iPhone

Open de gepubliceerde site opnieuw, herlaad en controleer of 'Bekend vertrekpunt (optioneel)' zichtbaar is. Start GPS met precieze locatie toegestaan. Loop buiten 10 meter; de stip en 'Laatste ontvangen meting' moeten veranderen zodra iOS verse bruikbare metingen doorgeeft. Binnen kan GPS onvoldoende betrouwbaar zijn. Een positie buiten de PNG wordt gemeld, niet tegen de kaartrand vastgezet. Nog niet getest op een fysieke iPhone.
