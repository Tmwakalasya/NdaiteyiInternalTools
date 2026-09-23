# Changelog

## 2026-09-23 — Faster portal

### Changed
- **Instant feedback on click:** the portal shows a loading outline while a
  page loads, instead of doing nothing until it's ready.
- **Local login checks:** `proxy.ts` and `getSessionProfile()` verify the
  login token locally (`getClaims()`) instead of calling Supabase Auth on
  every click. A session signed out elsewhere now stays valid until its token
  expires (up to 1 hour).
- **Cached videos:** homepage films and posters are cached by browsers for 7
  days and by Vercel's CDN for 30. If you replace a video, give it a new file
  name.

## 2026-09-23 — Website enquiries

### New
- **Enquiry form** on the homepage. Visitors say whether they're buying,
  selling or proposing a partnership, plus the commodity, country and a
  message. It replaces the "sign in" link that stood in for a contact email.
- **Enquiries inbox** for admins (sidebar → Enquiries), with Open, Converted,
  Declined and All filters. On each enquiry, admins can reply by email, mark
  it in review, decline it, or **convert it to a project** with the four
  SEZ Africa phases already set up.
- Admins are notified through the activity feed and bell, and by email when
  Resend is configured (replying to that email goes to the person who
  enquired).

### Security
- The public can't read or write the enquiries table directly. Submissions
  go through `/api/enquiries`, which validates them, filters bots (a hidden
  field plus a minimum fill time) and allows 3 per hour per visitor. Visitor
  IPs are stored only as salted hashes.
- Members never see enquiries, in the inbox, the feed or notifications.

### Changed
- Project creation moved to `lib/projects.ts`, shared by "New project" and
  "Convert to project".

### Deploying
- Run `supabase/05_enquiries.sql` on the live database before merging.

## 2026-09-23 — Metal price ticker

### New
- **Metal price ticker** under the homepage film and on the dashboard: copper,
  gold, platinum, palladium, nickel, silver, zinc and aluminium in USD, with
  daily change where the feed provides it. Prices come from Metals.Dev,
  refresh hourly and are labelled "Indicative" with the time they were
  updated.
- The ticker pauses on hover, and stays still for visitors who have turned on
  reduced motion.
- It needs `METALS_DEV_API_KEY` (README step 6b). Without the key, or when
  the feed fails or goes stale, the ticker is hidden and the homepage shows
  the countries strip instead.

## 2026-09-22 — Website and portal refresh

### New
- **Public homepage** at `/`. It covers what the consortium does, the four-phase
  SEZ Africa protocol, where members operate, and a link into the member portal.
  Background films come from Pexels (free licence) and live in `public/media/`.
- **Redesigned sign-in and set-password pages** with mining footage and a
  "Back to the website" link.
- **Dashboard stats panel** that brings members, projects, documents, news and
  Schedule 1 compliance together in one place.

### Changed
- One design system for the homepage and the portal: warm paper, coal ink, a
  laterite-rust accent and the Geist typeface. It replaces the indigo/pink
  gradients and Inter.
- Dark sidebar with the `enm consortium` wordmark.
- The dashboard's recent activity now shows the latest 8 items.
- Tags are neutral by default. Rust is kept for "Active" and "Current phase".

### Fixed
- Headings using `text-base` were invisible because the `base` colour token
  collided with Tailwind's `text-base` font size. The token is now `canvas`.
- The "Active" badge on project pages was unreadable (it used dark-theme colours).

### Notes for deploying
- `proxy.ts` now lets signed-out visitors see `/` and video files. All other
  pages still require sign-in.
- `lib/config.ts` has a new `contactEmail` setting. While it is empty, the
  homepage's contact section links to the portal instead of an email address.
