# argi – Website mit Kursbuchung

Töpferkurse von Argi in der Werkstatt im Keller des Kafi Hoi Zäme, Baden. Next.js 16 (App Router), Postgres über
`pg` mit reinem SQL, kein ORM, keine UI-Bibliothek. Design «A · Ton & Licht» (Cormorant Garamond + Karla, Sand und
Terrakotta), Tokens in `src/app/globals.css`.

Next.js 16 weicht von älteren Versionen ab (async `params`, `PageProps`/`RouteContext` aus `next typegen`):
im Zweifel `node_modules/next/dist/docs/` lesen.

## Befehle (immer in CT 103 über `werkstatt`)

```bash
werkstatt 'cd /root/werk/argi && npm ci'
werkstatt 'cd /root/werk/argi && npm test'          # node:test, reine Logik
werkstatt 'cd /root/werk/argi && npm run typecheck'
werkstatt 'cd /root/werk/argi && npm run build'
werkstatt 'cd /root/werk/argi && npm run seed:dev'  # Beispieldaten, nur lokale DB
werkstatt start argi /root/werk/argi 'npm start -- -p 3100'   # nach build; http://192.168.1.164:3100
```

Dev-Datenbank `argi`/`argi` in CT 103, Werte in `/root/werk/.dev-env/argi.env` (als `.env.local` kopieren).
Admin lokal: `/admin`, Passwort `argi-dev`.

## Aufbau

- `db/*.sql`: Migrationen, laufen beim Start (`src/instrumentation.ts` → `lib/start.ts`), jede Datei einmal.
- `lib/plaetze.ts`: Regeln für Plätze und Eingaben (getestet). Belegt = paid + reserved + pending vor Ablauf.
- `lib/buchung.ts`: Buchen (Termin per `FOR UPDATE` gesperrt), Bestätigung, Storno mit Rückerstattung, Erinnerung 48 h vorher.
- `lib/stripe.ts`: Stripe Checkout über REST (Karte + TWINT, CHF), Webhook-Signatur selbst geprüft.
  Ohne `STRIPE_SECRET_KEY` werden Buchungen nur reserviert («bezahlt wird vor Ort»).
- `lib/mail.ts`: nodemailer über `SMTP_URL`; ohne nur Log.
- Verwaltung unter `/admin` (ein Passwort, signiertes Cookie), Seiten in `src/app/admin/(geschuetzt)/`.

## Umgebung (Produktion)

`DATABASE_URL`, `APP_URL`, `AUTH_SECRET` (≥ 32 Zeichen), `ADMIN_PASSWORD`, `ADMIN_EMAIL`, `SMTP_URL`, `MAIL_FROM`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Geheimnisse nur zur Laufzeit (`is_buildtime: false`).
Stripe-Webhook auf `<APP_URL>/api/stripe/webhook`, Ereignisse `checkout.session.completed`,
`checkout.session.expired`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`.

## Offen (Etappe 2/3 laut Konzept)

Gutscheine online, Warteliste mit automatischer Nachricht, Storno-Link für Kundinnen, Meldung «Stücke abholbereit»,
Newsletter. Texte in [eckigen Klammern] liefert Argi.
