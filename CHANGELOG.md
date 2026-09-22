# Changelog

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
