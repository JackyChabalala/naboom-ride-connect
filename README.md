# Naboom Ride Connect

A fixed-price ride-hailing platform built for **Naboomspruit (Mookgophong)** — a hometown project for a place where Uber and Bolt do not operate.

## Why this exists

In Naboomspruit / Mookgophong there is no Uber. People still need rides, so locals started organising their own lifts and charging **fixed prices** for common routes.

That informal system works, but it is hard to manage: who is available, who is trusted, what the fare is, and how to keep things fair. **Naboom Ride Connect** turns that local practice into a simple digital platform — same fixed-price idea people already know, with passenger requests, driver acceptance, admin verification, and ratings after the trip.

This is a working prototype for the town. It is not a clone of Uber’s dynamic pricing model. It is built around how transport already works here.

---

## How it works

The app has three sides:

| Role | What they do |
|------|----------------|
| **Passenger** | Log in, pick a route, enter a pickup point, request a ride, follow status, rate the driver |
| **Driver** | Register, get approved by admin, go available, accept rides, start and complete trips |
| **Admin** | Verify drivers, watch active/completed rides, see ratings, review emergency alerts |

### Routes & pricing (fixed)

| Route | Code | Price |
|-------|------|-------|
| Town → Township | `TOWN_TOWNSHIP` | R60 |
| Within Township | `WITHIN_TOWNSHIP` | R30 |

Prices are defined in `src/lib/pricing.ts` and match the fixed-fare approach already used locally.

### Typical flow

1. A passenger opens the app, logs in, chooses a route and pickup point, then requests a ride.
2. Available approved drivers see the request and can accept it.
3. The driver starts the trip, then marks it complete when they arrive.
4. The passenger rates the driver.
5. Admins can approve new drivers and monitor rides and emergencies from the dashboard.

Real-time status updates use simple polling (no WebSockets yet).

---

## How to use it (demo)

### 1. Install and run

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Test accounts

**Mock OTP for all logins:** `123456`

**Passengers**

| Name | Phone |
|------|-------|
| Thabo Molefe | 0821110001 |
| Lerato Dlamini | 0821110002 |

**Drivers (approved & available)**

| Name | Phone |
|------|-------|
| Sipho Nkosi | 0832220001 |
| Nomsa Khumalo | 0832220002 |

**Driver (pending approval)**

| Name | Phone |
|------|-------|
| Bongani Mthembu | 0832220003 |

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin) — no login required in this prototype.

### 3. Walk through a ride

1. Open the home page → **I'm a Passenger**.
2. Log in as Thabo (`0821110001`) with OTP `123456`.
3. Pick **Town → Township (R60)** or **Within Township (R30)**, enter a pickup point, request a ride.
4. In another browser/tab, log in as driver Sipho (`0832220001`), toggle **Available**, and accept the request.
5. On the driver side: **Start** → **Complete** the ride. The passenger screen updates automatically.
6. Rate the driver; check averages on the admin dashboard.
7. Tap **Emergency** on an active ride and confirm it appears in the admin Emergency Log.
8. Approve pending driver Bongani from `/admin` to test verification.

---

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui** + **lucide-react**
- **Prisma** + **SQLite**
- Polling for live ride status (no WebSockets)

---

## Project structure

```
src/app/
  page.tsx                 # Home — passenger / driver / admin portals
  passenger/               # Login, home, ride status, history
  driver/                  # Login, register, dashboard
  admin/                   # Stats, drivers, rides, emergencies
  api/                     # REST endpoints
src/components/            # UI components
src/lib/                   # prisma, auth, pricing, utils
prisma/
  schema.prisma
  seed.ts
```

---

## Not included yet (on purpose)

- Real payments, SMS/OTP, maps/GPS, WebSockets
- Production auth / security hardening
- Live deployment config

This is a local demo prototype for Naboomspruit / Mookgophong — run it with `npm run dev`.

---

## Licence / status

Personal hometown project in active development. Feedback from people who live in or visit Mookgophong is welcome.
