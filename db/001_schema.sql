-- Kursarten: Vorlage für Termine (Text, Dauer, Preis, Plätze)
CREATE TABLE IF NOT EXISTS courses (
  id            serial PRIMARY KEY,
  slug          text NOT NULL UNIQUE,
  title         text NOT NULL,
  teaser        text NOT NULL DEFAULT '',
  description   text NOT NULL DEFAULT '',
  includes      text NOT NULL DEFAULT '',
  duration_min  integer NOT NULL DEFAULT 180 CHECK (duration_min > 0),
  price_cents   integer NOT NULL CHECK (price_cents >= 0),
  capacity      integer NOT NULL CHECK (capacity > 0),
  image         text NOT NULL DEFAULT '/bilder/drehscheibe.jpg',
  active        boolean NOT NULL DEFAULT true,
  sort          integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Termine: ein Kurs an einem Datum. Preis und Plätze werden beim Anlegen
-- aus der Kursart übernommen und können je Termin abweichen.
CREATE TABLE IF NOT EXISTS sessions (
  id            serial PRIMARY KEY,
  course_id     integer NOT NULL REFERENCES courses(id),
  starts_at     timestamptz NOT NULL,
  ends_at       timestamptz NOT NULL,
  price_cents   integer NOT NULL CHECK (price_cents >= 0),
  capacity      integer NOT NULL CHECK (capacity > 0),
  note          text NOT NULL DEFAULT '',
  cancelled_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS sessions_starts_at ON sessions (starts_at);

-- Buchungen. status:
--   pending   wartet auf Stripe (hält die Plätze bis expires_at)
--   paid      bezahlt
--   reserved  ohne Online-Zahlung reserviert (bezahlt wird vor Ort)
--   expired   Zahlung nicht abgeschlossen
--   cancelled storniert (refunded_at gesetzt, wenn Geld zurück ging)
CREATE TABLE IF NOT EXISTS bookings (
  id                 serial PRIMARY KEY,
  session_id         integer NOT NULL REFERENCES sessions(id),
  token              text NOT NULL UNIQUE,
  name               text NOT NULL,
  email              text NOT NULL,
  phone              text NOT NULL DEFAULT '',
  message            text NOT NULL DEFAULT '',
  seats              integer NOT NULL CHECK (seats > 0),
  amount_cents       integer NOT NULL CHECK (amount_cents >= 0),
  status             text NOT NULL CHECK (status IN ('pending','paid','reserved','expired','cancelled')),
  expires_at         timestamptz,
  stripe_session_id  text UNIQUE,
  stripe_payment_intent text,
  paid_at            timestamptz,
  cancelled_at       timestamptz,
  refunded_at        timestamptz,
  confirmation_sent_at timestamptz,
  reminder_sent_at   timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS bookings_session ON bookings (session_id);
