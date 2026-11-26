# GymLog

[![CI/CD](https://github.com/neoxk/RIRS-Vaje-Gymlog/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/neoxk/RIRS-Vaje-Gymlog/actions/workflows/ci-cd.yml)

**Nameščena aplikacija:** https://frontend-production-62175dcd.up.railway.app (testni uporabniki so navedeni spodaj)

GymLog je spletna aplikacija za spremljanje treningov v telovadnici. Trener sestavi načrt vadbe in ga dodeli članu, član načrt sprejme in po treningu vnese vaje (teža in ponovitve), aplikacija pa samodejno zazna osebne rekorde.

Uporabniške vloge: član, trener, skrbnik.

## Stanje projekta

Implementirane so funkcionalnosti MVP (uporabniške zgodbe US-01 do US-08):

- Registracija in prijava z vlogami (US-01, US-02)
- Knjižnica vaj s filtrom po mišični skupini (US-03)
- Sestavljanje načrta vadbe, trener lahko osnutek tudi izbriše (US-04)
- Dodelitev načrta članu in sprejem načrta (US-05, US-06)
- Vnos treninga s serijami (US-07)
- Samodejno zaznavanje osebnih rekordov (US-08)

Poleg MVP je implementirana tudi zgodovina treningov (US-09). Funkcionalnosti izven MVP še niso implementirane: napredek po vajah, komentarji trenerja, zaključek in urejanje načrta ter upravljanje uporabnikov in vaj za skrbnika.

## Tehnologije

- Frontend: React, Vite, React Router
- Backend: Node.js, Express (REST API, JSON)
- Podatkovna baza: MongoDB, Mongoose
- Avtentikacija: express-session, connect-mongo, bcryptjs
- Lokalni razvoj: macOS, Homebrew, npm

## Zahteve

Postopek je napisan za macOS. Potrebujete:

- [Homebrew](https://brew.sh)
- Node.js: `brew install node`
- MongoDB: `brew tap mongodb/brew` in `brew install mongodb-community`

## Lokalni zagon

1. Zaženite podatkovno bazo:

   ```
   brew services start mongodb-community
   ```

2. Backend. V mapi `backend` namestite pakete, pripravite nastavitve, naložite začetne podatke in zaženite strežnik:

   ```
   cd backend
   npm install
   cp .env.example .env
   npm run seed
   npm run dev
   ```

   API teče na `http://localhost:3000`. Datoteka `.env` vsebuje `PORT`, `MONGODB_URI` in `SESSION_SECRET`. Za lokalni razvoj zadoščajo vrednosti iz `.env.example`.

3. Frontend. V drugem terminalu v mapi `frontend`:

   ```
   cd frontend
   npm install
   npm run dev
   ```

4. Odprite `http://localhost:5173`. Frontend zahteve na `/api` posreduje na backend (proxy v Vite).

## Testni uporabniki

Ukaz `npm run seed` ustvari tri uporabnike. Geslo vseh je `Geslo123!`.

- član: `clan@gymlog.si`
- trener: `trener@gymlog.si`
- skrbnik: `admin@gymlog.si`

Ob vsakem zagonu skripta ponastavi knjižnico vaj (21 vaj) in ta tri uporabnike. Novi uporabniki, ki se registrirajo v aplikaciji, so vedno člani.

## Poskusni potek

1. Prijavite se kot trener, odprite **Moji načrti**, ustvarite nov načrt in ga dodelite članu.
2. Odjavite se in se prijavite kot član. V **Moji načrti** načrt sprejmite.
3. V **Nov trening** vnesite trening, po želji povezan z načrtom. Če je teža višja od prejšnjih vnosov iste vaje, aplikacija prikaže nov osebni rekord.

## CI/CD

Cevovod je v [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml). Sproži se ob vsakem pull requestu v `main` in ob vsakem pushu na `main`.

| Job | Kaj naredi |
|---|---|
| **lint** | ESLint za backend (`backend/eslint.config.js`) in frontend (`frontend/eslint.config.js`). Ob napaki job pade. |
| **build** | Namesti odvisnosti (npm cache prek `actions/setup-node`), zgradi frontend (`vite build`) in pripravi produkcijski paket backenda. Oba paketa shrani kot artefakta `backend` in `frontend`. |
| **test** | Zažene 29 testov (Vitest): 21 za API backenda na MongoDB (servis `mongo` v CI) in 8 za React komponente. Poročilo o pokritosti shrani kot artefakt `coverage`. |
| **deploy** | Samo ob pushu na `main` in samo, če so `lint`, `build` in `test` uspešni. V okolju `production` prenese artefakte iz joba build in jih z `railway up` namesti na Railway, nato preveri `/api/health`. |

Namestitev na [Railway](https://railway.com) ima tri servise:

- **MongoDB** – podatkovna baza.
- **backend** – Express API. `MONGODB_URI` je referenca na servis MongoDB, `SESSION_SECRET` je nastavljen v Railwayu.
- **frontend** – Caddy streže zgrajeni `dist/` in zahteve na `/api` posreduje na backend. URL backenda je v okoljski spremenljivki `BACKEND_URL` ([`deploy/frontend/Caddyfile`](deploy/frontend/Caddyfile)).

Token za namestitev (`RAILWAY_TOKEN`) je shranjen kot secret okolja `production`. Veja `main` je zaščitena, za združitev morajo uspeti preverbe `lint`, `build` in `test`.

### Testi lokalno

```
cd backend && npm test        # rabi MongoDB, privzeto mongodb://127.0.0.1:27017/gymlog-test (ali MONGODB_TEST_URI)
cd frontend && npm test
```

Z `npm run test:coverage` se ustvari še poročilo o pokritosti v mapi `coverage/`.

## Dokumentacija

Vsa dokumentacija je v mapi [docs/](docs/):

- [01 – Zasnova rešitve](docs/01-zasnova-resitve.md)
- [02 – Funkcionalnosti in obseg](docs/02-funkcionalnosti-in-obseg.md)
- [03 – Podatkovni model](docs/03-podatkovni-model.md)
- [04 – Arhitektura in tehnološki sklad](docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 – Uporabniške zgodbe](docs/05-uporabniske-zgodbe.md)
- [06 – Wireframes](docs/06-wireframes.md)
- [07 – Pregled prevzetega projekta](docs/07-pregled-projekta.md)
- [Arhitekturne odločitve (ADR)](docs/adr/)

## Struktura repozitorija

```
README.md
.gitignore
frontend/   React aplikacija
backend/    Express API
docs/       dokumentacija, wireframes, adr
deploy/     Dockerfila in Caddyfile za namestitev na Railway
.github/    workflow CI/CD
```

## Razvojni proces

Razvoj poteka po strategiji GitHub Flow: veja `main` je zaščitena, spremembe pridejo vanjo samo prek pull requestov iz razvojnih vej. Naloge so razčlenjene v GitHub Issues in spremljane na GitHub Project boardu.
