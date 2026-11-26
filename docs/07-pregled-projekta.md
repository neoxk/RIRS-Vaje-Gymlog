# 07 – Pregled prevzetega projekta

Projekt GymLog sem prevzel iz repozitorija [SimeonJovanovski32/RIRS-Vaje-Gymlog](https://github.com/SimeonJovanovski32/RIRS-Vaje-Gymlog). Pregledal sem dokumentacijo (01–06, ADR 0001–0010), kodo backenda in frontenda ter aplikacijo zagnal lokalno (Express + Vite, baza MongoDB). Potek trener → član (sestava načrta, dodelitev, sprejem, vnos treninga, rekord) deluje.

## Implementirane funkcionalnosti MVP

| Funkcionalnost | Stanje | Opomba |
|---|---|---|
| F1 Registracija in prijava | ✅ | Seje s piškotki (`express-session`, `connect-mongo`), gesla z bcrypt, vloga ob registraciji je vedno član. |
| F2 Knjižnica vaj | ✅ | Seznam s filtrom po mišični skupini in opisom izvedbe, 21 vaj iz `seed`. |
| F3 Sestavljanje načrta | ✅ | Dnevi, vaje, serije (1–10) in ponovitve (1–50), validacija na backendu, osnutek je mogoče tudi izbrisati. |
| F4 Dodelitev in sprejem načrta | ✅ | Življenjski cikel osnutek → dodeljen → aktiven, preverjanje lastništva (403). |
| F5 Vnos treninga | ✅ | Več vaj in serij, povezava z aktivnim načrtom ni obvezna. |
| F6 Osebni rekordi | ✅ | Zaznani ob shranjevanju, prikazani po shranjevanju in v zgodovini. |

Poleg MVP je implementirana tudi **F7 Zgodovina treningov** (US-09: stranjenje po 10, podrobnosti, 403 za tuje treninge), čeprav README pravi, da še ni. Ostale funkcionalnosti izven MVP (F8–F13) niso implementirane. V meniju so zanje strani z napisom »Ta stran še ni na voljo« (Napredek, Člani, Treningi članov, Uporabniki).

Pravice so preverjene na backendu (`requireAuth`, `requireRole`, preverjanje lastnika vira), kot določa ADR-0008. Frontend skrije samo meni in zaščitene strani.

## Ujemanje z uporabniškimi zgodbami

Pregledal sem pet zgodb, pri izbiri sem dal prednost domensko specifičnim (F4–F6). Kriterije sem preveril v kodi, v delujoči aplikaciji in jih pokril z avtomatskimi testi (`backend/tests`, `frontend/src/test`).

### US-01 Registracija – zadošča
- ✅ Obvezno ime, veljaven e-poštni naslov in geslo z vsaj 8 znaki. Napake se prikažejo ob posameznem polju.
- ✅ Podvojen e-poštni naslov vrne »E-poštni naslov je že registriran« (409).
- ✅ Nov uporabnik je vedno član, tudi če odjemalec pošlje drugo vlogo. Po registraciji gre na prijavo.
- ✅ Geslo je shranjeno kot bcrypt zgostitev.

### US-04 Sestavljanje načrta vadbe – zadošča
- ✅ Načrt rabi naziv in vsaj en dan z vsaj eno vajo, napake so izpisane po dnevih in vajah.
- ✅ Serije 1–10 in ponovitve 1–50 se preverjajo na backendu. Vaja mora obstajati v knjižnici.
- ✅ Dneve in vaje je mogoče dodajati in odstranjevati.
- ✅ Shranjen načrt je osnutek in ga vidi samo avtor. Član in skrbnik strani ne moreta odpreti (403 oz. »Ni dostopa«).

### US-05 Dodelitev načrta članu – zadošča
- ✅ Za izbiro so na voljo samo člani, ki niso blokirani (`/api/clani`).
- ✅ Dodeliti je mogoče samo osnutek, sicer »Dodeliti je mogoče samo osnutek načrta«.
- ✅ Dodeljen načrt se pojavi na seznamu člana.
- ✅ Načrta drugega trenerja ni mogoče dodeliti (403).

### US-07 Vnos treninga – zadošča
- ✅ Datum je privzeto današnji in ga je mogoče spremeniti.
- ✅ Več vaj, vsaj ena serija, teža (0, 500] kg in ponovitve 1–100. Napake se izpišejo, trening se ne shrani.
- ✅ Povezava z aktivnim načrtom ni obvezna. Neaktiven načrt vrne 409, tuj načrt 403.
- ✅ Shranjen trening je viden v zgodovini.

### US-08 Samodejno zaznavanje osebnih rekordov – zadošča
- ✅ Najvišja teža na vajo se primerja z najvišjo težo iste vaje v prejšnjih treningih istega člana.
- ✅ Prvi vnos je izhodišče, enaka teža ni rekord.
- ✅ Po shranjevanju se izpiše »Nov osebni rekord: <vaja> – <teža> kg«, vaja dobi oznako REKORD.
- ✅ Oznaka rekorda je vidna tudi v zgodovini.
- ⚠️ Rekord se računa glede na treninge z datumom do vključno izbranega. Če član naknadno vnese starejši trening, se rekordi pri kasnejših treningih ne preračunajo. Kriteriji tega ne zahtevajo, ADR-0006 pa ta pristop izbere zavestno.

### Ostale MVP zgodbe na kratko
- **US-02 Prijava in odjava** zadošča: isto sporočilo za napačno geslo in neobstoječ račun, blokiran račun ima svoje sporočilo, po odjavi seja ne velja več.
- **US-03 Knjižnica vaj** zadošča. Manjša nedoslednost: stran je v meniju tudi za skrbnika, zgodba pa jo navaja samo za člana.
- **US-06 Sprejem načrta** zadošča: gumb »Sprejmi« samo pri dodeljenih načrtih, tuj načrt vrne 403.

## Ugotovitve ob prevzemu

- Projekt ni imel testov, backend ni imel linterja. Frontend ESLint je javljal 3 napake. Vse to je urejeno v okviru 2. dela naloge (CI/CD).
- README navaja lokalni zagon samo za macOS (Homebrew). Aplikacija deluje tudi z MongoDB v Dockerju ali oblaku, dovolj je nastaviti `MONGODB_URI`.
- Frontend uporablja relativne poti `/api`, kar v razvoju reši Vite proxy (ADR-0003). Za produkcijo je potreben strežnik, ki `/api` posreduje na backend.

## Zaključek

Vse MVP funkcionalnosti (F1–F6) so implementirane, pregledane uporabniške zgodbe (US-01, US-04, US-05, US-07, US-08) so izpolnjene v celoti. Implementirana je tudi zgodovina treningov (F7), ki ni del MVP. Koda je pregledna, preverjanje pravic in podatkov je dosledno na backendu.
