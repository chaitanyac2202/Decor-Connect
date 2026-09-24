# DecorConnect

**B2B Home Decor Buyer Finder & Cold Outreach Platform**

DecorConnect helps US home decor sellers discover potential business buyers (retail stores, boutiques, interior designers, furniture shops, home staging companies) and send them personalized outreach emails — all from one dashboard.

> This is NOT a marketplace. It is a B2B lead-discovery and cold-outreach automation tool. Sellers enter their product details, the system searches real business data via live APIs, and lets the seller email any or all discovered buyers with one click.

---

## Features

- 🔍 **Live Buyer Discovery** — Searches Foursquare Places API and OpenStreetMap Overpass API in real-time for matching businesses
- 📧 **One-Click Email Outreach** — Compose and send personalized emails to selected buyers via Gmail SMTP
- 🎯 **Smart Category Mapping** — Maps your product type to the right business categories automatically
- 📊 **Outreach Dashboard** — Track all your past searches and email campaigns
- 🛡️ **CAN-SPAM Compliant** — Every email includes seller identity and opt-out mechanism
- 🌐 **Email Discovery** — Automatically scrapes public business websites to find contact emails
- 🚫 **No Fake Data** — All buyer data is fetched live from APIs, never hardcoded or mocked

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React, Tailwind CSS |
| Animations | Framer Motion |
| Icons | lucide-react |
| Email | Nodemailer + Gmail SMTP |
| Buyer Data | Foursquare Places API + OpenStreetMap Overpass API |
| Storage | Browser localStorage |
| Hosting | Vercel (free tier) |

---

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free Gmail account
- A free Foursquare developer account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Assignment-2
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials:

#### TomTom Maps API Key (FREE, no credit card)

1. Go to [TomTom Developers](https://developer.tomtom.com/)
2. Register for a free account
3. Copy your API Key from the dashboard (free tier: 2,500 calls/day)

#### Gmail App Password (FREE, no credit card)

1. Open [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Generate a password for "Mail" → "Other (DecorConnect)"
5. Copy the 16-character password

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
  page.js                    → Landing page (hero, how-it-works, CTA)
  find-buyers/page.js        → Seller input form
  results/page.js            → Buyer results grid with selection
  dashboard/page.js          → Sent history dashboard
  api/find-buyers/route.js   → Buyer discovery backend (Foursquare + Overpass)
  api/send-emails/route.js   → Email sending backend (Nodemailer)
  layout.js                  → Root layout with providers
  globals.css                → Custom styles + Tailwind

components/
  AnimatedBackground.jsx     → Floating gradient blobs
  BuyerCard.jsx              → Glassmorphism buyer result card
  EmailModal.jsx             → Email compose/preview/send modal
  Footer.jsx                 → App footer
  LoadingSkeleton.jsx        → Skeleton loading cards
  Navbar.jsx                 → Sticky navigation bar
  SearchForm.jsx             → Seller product input form
  Toast.jsx                  → Toast notification system

context/
  AppContext.jsx              → Global state (seller info, results, history)

lib/
  foursquareClient.js        → Foursquare Places API client
  overpassClient.js          → OpenStreetMap Overpass API client
  emailScraper.js            → Website email address scraper
  emailSender.js             → Nodemailer Gmail transport
```

---

## Deploy to Vercel (Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repo
3. Add the 3 environment variables in Vercel dashboard → Settings → Environment Variables
4. Deploy — your app is live!

No credit card is required for Vercel's Hobby tier.

---

## Legal & Compliance

- **CAN-SPAM Act**: Every outreach email includes the seller's real business identity and a working opt-out mechanism ("reply STOP to unsubscribe")
- **robots.txt**: The email scraper respects robots.txt — sites that disallow scraping are skipped
- **Gmail Limits**: Sending is capped at 40 emails per batch to stay within Gmail's daily limits (~500/day)
- **No Spam**: This tool is designed for legitimate B2B outreach, not mass spam. Use responsibly.

---

## Environment Variables

| Variable | Description | How to Get |
|----------|-------------|-----------|
| `FOURSQUARE_API_KEY` | Foursquare Places API key | [Foursquare Developers](https://foursquare.com/developers/signup) — free |
| `GMAIL_USER` | Gmail address for sending | Any Gmail account |
| `GMAIL_APP_PASSWORD` | Gmail App Password (16 chars) | [Google App Passwords](https://myaccount.google.com/apppasswords) — free |

---

## License

MIT
