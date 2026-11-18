# Project Apex

Project Apex is a Next.js community platform for AI music and video drops, virtual artists, series, creator dashboards, battles, charts, and awards.

## Run locally

1. Install Node.js 20 or later.
2. Run `npm ci`.
3. Copy `.env.example` to `.env.local` and enter your Supabase and Stripe settings.
4. Start the app with `npm run dev` and open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run build
```

## Services to configure

- **Supabase Auth:** The sign-in, registration, creator dashboard, and content submission flows use Supabase Auth. Enable email/password sign-in and configure email confirmation and redirect URLs for your site.
- **Supabase database:** The app expects `films`, `series`, `actors`, and `comments` tables with the fields referenced by the app. Add Row Level Security policies so users can only create or edit their own records, while public reads expose only approved content.
- **Stripe:** Featured placement is a one-time **$15 per film** payment. Configure Stripe Checkout and point a webhook endpoint at `/api/webhook` with the `checkout.session.completed` event enabled. The webhook verifies payment before marking that specific film as featured.

Payment activation and database policies must be tested against the actual Supabase and Stripe projects before public launch. The local source package does not include or verify those external service settings.

## Keep credentials private

Never include `.env.local`, service-role keys, Stripe secrets, `.next`, or `node_modules` in a project archive. The `.env.example` file contains placeholders only. If a real secret was included in an archive shared outside a trusted environment, rotate it in the service dashboard.
