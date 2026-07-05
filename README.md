# Mining Consortium — Member Portal

An internal website for the consortium: a member directory your mom can manage
herself, plus a news page and email newsletter. Built with Next.js (React),
Supabase (database + logins), and optionally Resend (email).

Everything is invitation-only: nobody can see anything without signing in.

---

## 1. Create the database (Supabase) — one time, ~10 minutes

1. Go to [supabase.com](https://supabase.com), sign up (free), and click
   **New project**. Give it a name (e.g. `mining-consortium`), set a strong
   database password (save it somewhere safe), and pick a region close to
   most members (e.g. Europe or South Africa).
2. When the project is ready, open **SQL Editor** (left sidebar), paste the
   whole contents of [`supabase/schema.sql`](supabase/schema.sql), and click
   **Run**. This creates the tables and security rules.
3. Still in the SQL Editor, paste and run
   [`supabase/seed.sql`](supabase/seed.sql). This imports the 6 members from
   the Excel sheet.
4. Paste and run
   [`supabase/02_projects_documents.sql`](supabase/02_projects_documents.sql).
   This adds the **Projects** tracker (the SEZ Africa phases), the **Documents**
   file store, and its private storage bucket. Until this is run, those two
   pages just show an empty state.
5. Paste and run
   [`supabase/03_member_documents.sql`](supabase/03_member_documents.sql).
   This adds the per-member **Schedule 1 due-diligence uploads** on member
   profiles (private bucket; a member sees only the files they uploaded,
   admins see all).

## 2. Connect this website to the database

1. In Supabase: **Project Settings → API keys** (and **Data API** for the URL).
2. Copy these three values into `.env.local` in this folder, replacing the
   placeholders:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` / `publishable` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` / `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this one secret)

## 3. Fix the email links (invite & password reset)

In Supabase: **Authentication → Emails / Email Templates**.

- **Invite user** template — replace the link (`href="..."`) with:

  ```
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/set-password
  ```

- **Reset password** template — replace the link with:

  ```
  {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/set-password
  ```

Then in **Authentication → URL Configuration**, set the **Site URL** to
`http://localhost:3000` for now (change it to the real address after
deploying — see step 7).

## 4. Create the administrator account (your mom)

1. In Supabase: **Authentication → Users → Add user → Create new user**.
   Enter her email and a password, and tick **Auto confirm user**.
2. In the **SQL Editor**, run (with her real email):

   ```sql
   update profiles set role = 'admin' where email = 'her-email@example.com';
   ```

3. Recommended: in **Authentication → Sign In / Providers**, turn **off**
   "Allow new users to sign up". Members then can only join by being
   invited from inside the site.

## 5. Run the website

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with the admin account.

As the admin she can: add/edit/remove members (Members → Add member),
invite a member to log in (button on their profile page), and post news
(News → Post an update).

## 6. Turn on the email newsletter (optional)

Without this, news posts still appear on the site — they just aren't emailed.

1. Sign up at [resend.com](https://resend.com) (free tier) and create an
   **API key**. Put it in `.env.local` as `RESEND_API_KEY`.
2. To email real members you must verify a domain in Resend
   (**Domains → Add domain**) and set `NEWSLETTER_FROM_EMAIL` to an address
   on that domain, e.g. `news@yourdomain.com`. Until a domain is verified,
   Resend only delivers to the email address you signed up with (good for
   testing).

## 7. Put it online (Vercel)

1. Push this folder to GitHub, then import the repository at
   [vercel.com](https://vercel.com).
2. In the Vercel project settings, add the same environment variables as
   `.env.local`.
3. After the first deploy, go back to Supabase **Authentication → URL
   Configuration** and change the Site URL to your Vercel address
   (e.g. `https://mining-consortium.vercel.app`) so email links point to
   the live site.

---

## Notes from the Excel import

- One email address looks like a typo and was imported as written:
  `lukondehyppolite@otlook.com` — probably should be `@outlook.com`.
  Please confirm and correct it on the member's Edit page.
- **Never store passport numbers or banking details in this database.**
  One CV in the sheet mentioned sending those — that sentence was left out
  of the import on purpose.

## Where things live

| What | Where |
| --- | --- |
| Database schema & security rules | `supabase/schema.sql` |
| Starting member data | `supabase/seed.sql` |
| Projects & documents tables + bucket | `supabase/02_projects_documents.sql` |
| Member Schedule 1 documents + bucket | `supabase/03_member_documents.sql` |
| Site name + the SEZ project phase template | `lib/config.ts` |
| Colours & fonts | `app/globals.css` |
| Pages | `app/(app)/…` (dashboard, members, projects, documents, news) |
| Invite, newsletter & project APIs | `app/api/…` |

## What members can do

- **Members** — everyone can browse the directory. Admins add, edit, invite,
  and remove members. Each profile has a **Schedule 1 documents** checklist
  (certified ID, certificate of incorporation, proof of authority, bank
  letter, specimen signature, company profile) that members upload against;
  these files are private — a member sees only their own uploads, admins see
  all. Edit the checklist in `requiredMemberDocuments` in `lib/config.ts`.
- **Projects** — any signed-in member can add a project. Each one starts with
  the SEZ Africa four phases; tick items off, mark a phase complete, mark the
  whole project complete, or add your own phases and items.
- **Documents** — any member can upload files (private; download links expire
  after an hour) and optionally link a file to a project.
- **News** — admins post updates (optionally emailed) and can edit or delete
  them; everyone can read.

To change the phases used for **new** projects, edit `defaultTransactionStages`
in `lib/config.ts` (existing projects keep their own copy).
