# Matglädje — Handover till Claude Code

**Version:** 2 (uppdaterad efter klickbar prototyp)
**Syfte:** Detta dokument är underlag för att bygga Matglädje som en riktig app med Claude Code. Det ersätter/uppdaterar en tidigare handover som skrevs innan prototypen fanns — mycket som då var öppna frågor är nu konkreta produktbeslut, testade i en fungerande demo.

---

## 1. Vad är Matglädje

En matinköpsgemenskap i Göteborg/Mölndal-området. ~30–35 aktiva hushåll (~70–75 personer) handlar råvaror direkt från lokala gårdar och mejerier, utan mellanhänder. Kärnvärdet är **matglädje** och direkt producentrelation — medvetet inte hållbarhets- eller prisjämförelseretorik, även om lägre pris ("plånboksglädje") är en trevlig bieffekt.

**Organisationsform:** Minimal ideell förening som bara håller hyresavtal, försäkring och livsmedelsregistrering. **Betalningar går direkt mellan medlem och producent** — se avsnitt 4, detta är en hård begränsning, inte ett UX-val.

**Producentlöfte:** Matglädje tar aldrig mer än ca 15–20% av en enskild producents totala produktion, och prioriterar producenter som inte vill växa.

---

## 2. Vad som redan finns (källor för detta arbete)

| Artefakt | Vad den ger |
|---|---|
| `matgladje_skafferi_med_gardsguiden.xlsx` | Sortiment (42 varor / 15 kategorier), producentkandidater, kontaktuppgifter, behovsmodell (KE-koefficienter, kohortvärden per kategori) |
| `matgladje_app.html` (klickbar prototyp) | **Facit för UX, flöden och en stor del av affärslogiken** — se avsnitt 3 |
| `matgladje_landing.html` | Producentriktad landningssida med URL-personalisering |
| Producentbrev-mall | Merge-fält för personaliserat utskick |

Prototypen (`matgladje_app.html`) är en enda fristående HTML-fil, all logik i klientens JS, inget backend, ingen persistens, en hårdkodad "inloggad" användare. Den ska **inte** portas rakt av — men varje skärm, interaktion och regel i den är ett medvetet produktbeslut som Claude Code bör läsa innan den designar databasschema eller API.

---

## 3. Produktbeslut som är testade och låsta (från prototypen)

Dessa var öppna frågor i förra handover-versionen. De är nu besvarade genom att bygga och resonera igenom dem:

- **Perioder:** Rullande 2-veckorsperioder. Sista beställningsdag = periodslut minus 3 dagar (för leverans i periodens slut). Medlemmar kan handla för innevarande **och** nästa period parallellt.
- **Rabattmodell:** Per producent, inte global. Tröskelvärden 5 000 / 10 000 / 20 000 kr beställt hos en given gård under perioden → 10% / 13% / 15% rabatt på gårdens "målpris". Rabatten återställs varje period.
- **Personal shopper:** Föreslår varor för att täcka kategorier som ligger under ett KE-baserat referensvärde för perioden (se KE-modellen nedan), fyller bara på gapet — inte hela behovet på nytt varje gång.
- **Tallriksmodell / kategori-täckning:** Visuell donut/polar-chart där varje kategori-kil skalas mot ett riktvärde härlett ur behovsmodellen (kr/KE/kategori/månad × hushållets KE × periodandel av månad), inte mot hushållets egen största kategori. Klick/hover ska visa exakt belopp och täckningsgrad.
- **KE-modell i praktiken:** Ålder → koefficient (0–3: 0,2 · 4–10: 0,5 · 11–17: 0,75 · 18–64: 1,0 · 65+: 0,85). Summeras per hushåll. Driver både prognos vid registrering och tallriksreferensen.
- **Laga (matdagbok):** Systemet räknar "kvar i skafferiet" = beställt denna period minus mängd som redan gått åt i loggade rätter, **med mängd-koll per ingrediens** (inte allt-eller-inget). "Dagens rätter" ska genereras utifrån detta. En loggad rätt = en dagbokspost kopplad till period + datum.
- **Bjuda:** Ett hushåll bjuder ett eller flera andra hushåll på en specifik rätt/tid. Mottagaren ser inbjudan; efteråt kan båda lägga till bilder och kommentarer. Kan kopplas till en matdagboks-post.
- **Handlare — vad de anger vid ansökan:** Namn på gård/företag, adress, logga/bild, ansvarig (namn + mobil + e-post), en eller flera kategorier, betalmetod (Swish-nummer *eller* kontonummer — se avsnitt 4).
- **Handlare — vad de redigerar per vara:** minsta enhet, kilopris (förslag — kräver avstämning, ändrar inte kundpris automatiskt), bild(er), **periodnot** (fritext som syns för medlemmar som bläddrar i skafferiet just den perioden — t.ex. "slut på timjan tills nästa period").
- **Kapacitetstak:** Varje producent har ett uppskattat månadstak; UI varnar när beställningar närmar sig 15–20% av det.
- **Admin (lägsta nivå, kommer växa):** Antal medlemmar, se enskild medlem (hushåll, KE, inköp), inköp totalt per period (historik + innevarande + nästa, med faktiska datumintervall).

---

## 4. Kritisk begränsning: betalningsmodellen

**Matglädje ska aldrig hantera, hålla eller vidarebefordra pengar.** Appens roll i betalningen är enbart att **visa** producentens Swish-nummer eller kontonummer så att medlemmen betalar producenten direkt. Detta är inte en UX-detalj — det är anledningen till att föreningen kan förbli minimal (ingen bokföringsskyldighet för transaktioner den inte är part i).

**Konsekvens för Claude Code:** bygg aldrig in en betalningsflödes-, escrow- eller "plånbok i appen"-funktion, även om det skulle förenkla UX. Om något i kravbilden senare pekar åt det hållet — stanna upp och stäm av med ägaren innan implementation.

---

## 5. Föreslagen datamodell (härledd ur prototypens state-form)

Detta är en utgångspunkt, inte ett facit — verifiera mot verkliga producentsvar innan fälten låses (se avsnitt 7).

```
Household (Hushåll)
  id, namn, adress?, e-post, mobil, skapad_datum, roll [medlem]

HouseholdMember (Person i hushåll)
  id, household_id, namn?, ålder, ke_koefficient (beräknad)

Producer (Producent)
  id, namn, region/adress, logga_url, beskrivning, egen_webb,
  ansvarig_namn, ansvarig_mobil, ansvarig_epost,
  betalmetod [swish|konto], swish_nr?, konto_nr?,
  kapacitet_kr_per_manad, status [ansökt|godkänd|inaktiv]

Category (Kategori) — 15 st, fast lista (Grönsaker, Frukt & bär, ...)

Product (Vara)
  id (Produkt-ID, t.ex. GRÖ-01), category_id, namn, enhet,
  minsta_enhet, målpris, butikpris_referens, reko_referens

ProductProducerLink
  product_id, producer_id, kilopris_forslag?, periodnot_per_period[]

Period
  id, num, start_datum, slut_datum, deadline_datum

ProducerPeriodPool (rabattpott per producent och period)
  producer_id, period_id, summa_kr (avledd från OrderLine, men troligen
  värt att materialisera för prestanda + historik)

Order / OrderLine
  household_id, period_id, product_id, mängd, pris_vid_köptillfälle

CookLogEntry (Matdagbok)
  household_id, period_id, datum, rätt_namn,
  uses: [{product_id, mängd}]

Event (Bjuda)
  host_household_id, dish, datum, tid, meddelande,
  invitees: [household_id]
  photos: [url], comments: [{household_id, text, datum}]

AdminUser
  kopplad till förening, ej samma som Household
```

**Öppna designfrågor för datamodellen** (inte besvarade av prototypen, kräver ett beslut):

- Ska `ProducerPeriodPool` vara en materialiserad tabell (snabbt att läsa, kräver synk) eller alltid beräknas från `OrderLine` (alltid korrekt, kan bli tungt vid skala)? Vid 30–50 hushåll spelar det sannolikt ingen roll — beräkna vid behov, optimera senare om det behövs.
- Var lagras bilder (produkt, logga, event-foton)? Prototypen håller dem som base64 i minnet — det duger inte i skarpt läge. Behöver objektlagring (t.ex. S3-kompatibel) + URL i databasen.
- Notifieringar: Bjuda-inbjudningar och periodnoter behöver nå folk (e-post/SMS/push?). Ingen kanal är vald ännu.

---

## 6. Roller & inloggning

Prototypen har **ingen riktig auth** — bara en knapp som växlar vilken "persona" man tittar som. Skarp version behöver:

- **Gemenskapare:** kommer in via vouch/inbjudan från en befintlig gemenskapare (inte öppen registrering).
- **Handlare:** ansöker via formulär → **admin godkänner manuellt** innan kontot blir aktivt (prototypens formulär sparar inget, det är en förhandsvisning).
- **Admin:** separat roll, inte samma inloggning som ett hushåll.

Exakt inloggningsmetod (lösenord, magic link, BankID?) är inte beslutat — värt att hålla enkelt givet gruppens storlek.

---

## 7. Vad som fortfarande är antaganden — verifiera innan skarpt läge

Följande siffror i prototypen är rimliga gissningar för att göra demon levande, **inte** verifierade beslut:

- Rabatt-trösklarna (5 000/10 000/20 000 kr) och nivåerna (10/13/15%)
- Beställningsdeadline (periodslut minus 3 dagar)
- Producenters kapacitetstak (kr/månad per producent)
- Periodlängd (2 veckor) — kändes rätt i produktresonemanget, men aldrig stämt av med en producent

Rekommendation kvarstår från tidigare resonemang: **skicka producentbrevet och samla in riktiga svar om leveransfrekvens, minimivolymer och vad de själva behöver se, innan dessa siffror hårdkodas i skarp kod.** Prototypen är byggd för att kunna demonstreras och samla feedback parallellt med det — inte som ersättning för det.

---

## 8. Rekommenderad byggordning

1. **Datamodell + Admin-backend först.** Det är den riktiga verksamhetens ryggrad (vilka producenter, vad beställs, kapacitet). Bygg mot verkliga Skafferi/Producenter-data från Excel-arket, inte hårdkodat i kod.
2. **Tunn Medlem-vy** ovanpå samma data: Skafferi, Gemenskapare/Din sida, period-system.
3. **Tunn Handlare-vy**: sortimentredigering, periodnot, kapacitetsindikator.
4. **Laga & Bjuda** sist — de är fristående funktionalitet ovanpå kärnan, lägre risk, kan itereras fritt utan att röra betalnings- eller beställningslogiken.
5. AI-funktionerna (Fråga skafferiet, Dagens rätter, Laga denna rätt) kräver en egen backend-proxy mot Anthropics API med en riktig nyckel — de fungerar i prototypen bara för att Claude.ais artefakt-miljö proxar anropet.

---

## 9. Filer att ge Claude Code vid start

- Detta dokument
- `matgladje_app.html` (läs, porta inte rakt av)
- `matgladje_skafferi_med_gardsguiden.xlsx` (verklig sortiments-/producentdata — källa till sanning för Product/Producer)
- Producentbrev-mall + landningssida (kontext, inte kod att bygga vidare på)
