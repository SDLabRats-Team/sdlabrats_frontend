# San Diego LabRats website

The public website for San Diego LabRats (sdlabrats.org), rebuilt as a registered
OCS project. Planning lives in
[pkdev0101/sdlabrats_frontend#1](https://github.com/pkdev0101/sdlabrats_frontend/issues/1).

## How the project is wired

The frontend stores no data. Every page is an empty shell; `js/labrats-site.js` asks the Flask
backend (`sdlabrats_backend`) for `GET /api/labrats/page?path=<this address>` and renders the
announcement, navigation, page, and footer from the response. Organization facts, navigation,
page text, program facts, camp day plans, and session dates and status all live in the backend's
database (seeded from `sdlabrats_backend/model/labrats_seed/*.json`).

| Piece | Source (edit here) | Published to (generated, git-ignored) |
|-------|--------------------|----------------------------------------|
| Page routes | `navigation/*.md` (only `layout`, `permalink`, and `scripts` for app pages) | `_posts/projects/sdlabrats/` |
| Header, footer, and form markup | `navigation/*.html` | `_includes/projects/sdlabrats/` |
| Renderer and page scripts | `js/` | `/assets/js/projects/sdlabrats/` |
| Styles | `sass/` | `/assets/css/projects/sdlabrats/main.css` |
| Images | `images/` | `/images/projects/sdlabrats/` |

`_layouts/sdlabrats.html` is the shell (head, empty header and footer, a loading state, and the
form `<template>`s). Downloadable PDFs live in `assets/pdfs/sdlabrats/`. Build with `make`; the
project is registered in `_projects/.makeprojects` as `nonprofits/sdlabrats`.

### Rendering

| Module | Job |
|--------|-----|
| `labrats-site.js` | Loads the page bundle (an unknown address gets the `/404.html` page), renders it, then wires the menu, theme, forms, and sign-in link. If the backend can't be reached, the page says so and offers "Try again". |
| `labrats-templates.js` | Header links, footer, announcement, `<title>` and description, and the page templates. |
| `labrats-widgets.js` | Lists built from the bundle: programs, open and past sessions, camp day plans, press clippings, flyers, social links, Donorbox embeds, and shared text blocks. |
| `labrats-html.js` | Inserts page HTML from the backend (drops scripts, event handlers, and unknown iframes; adds the baseurl to site links) and fills `data-labrats-org` placeholders with organization facts. |
| `labrats-content-rules.js` | Pure helpers, tested in `tests/test_sdlabrats_content_rules.mjs`. |

Page bodies in the backend use placeholders instead of copies of data, so a fact changes in one
place: `data-labrats-org="phone"` (text), `data-labrats-org-href="{phone_href}"` (an attribute),
`data-labrats-block="help_paying_families"` (shared HTML), `data-labrats-widget="session-list"`
(a list), and `data-labrats-form-slot="contact"` (a form; its markup is frontend interface, its
choices come from the backend).

### Backend endpoints

- `GET /api/labrats/page?path=` returns `{ site, page, session, programs, sessions }`.
- `POST /api/labrats/inquiries` stores contact, scholarship, partnership, video-topic,
  newsletter, and website survey submissions, and emails staff when SMTP is configured. The
  survey (`/survey/`, linked by a button at the bottom of the home page) has three boxes: an
  optional name ("Anonymous" when empty), what you liked, and what we could improve. Admins
  read responses under Form submissions, filtered by "Website survey".
- Admin only: `GET`/`PUT /api/labrats/sessions[/<id>]` and `GET`/`PUT /api/labrats/announcement`,
  used by the admin console's "Schedule & notice" tab.

Payments and registration stay on Donorbox. A session's `donorbox_campaign` (in the backend) picks
the embedded form; it shows only while the session is open.

### Top menu

The top menu follows the OCS pattern for site navigation: like `minima.nav_pages`, it is a list
in `_config.yml`, under `sdlabrats.nav`, rendered by `navigation/header.html` with Liquid. Because
it is built into every page, the menu shows even when the backend is unreachable. Issue #3 sets
the five items: Programs, Schedule & Pricing, Support (`/scholarships/`), About, and Enroll
(`/enroll/`, the open sessions, drawn as the `ocs__btn signal fill` button). Donate & Contact and
the phone number live in the footer. `labrats-site.js` marks the current item: the item for the
page itself, else its parent page, else its `section` (`activeNavItem()` in
`labrats-content-rules.js`). Below 60rem the menu folds behind the Menu button.

## Page templates

Each backend page record has a `template`:

| `template` | Used for | Key fields |
|------------|----------|------------|
| `default` | Hubs and combined pages | `section`, `description`, `contents` ("On this page" bar) |
| `home` | The home page | page HTML only |
| `program` | The five program pages; one shared information order | `program` (catalog slug), `facts`, `signup` |
| `registration` | Afterschool months, camps, events, payment forms | the matching session, `day_plans`, `camp_why` |
| `archive` | Past events and retired pages that still have URLs | `archive_note`, `current_url` |
| `redirect` | Live URLs that were empty, moved, or merged into a combined page | `redirect_to` (may include a `#section`) |

### Combined pages

The main navigation has four destinations. Related topics share one page, split into sections
with an "On this page" bar (the page's `contents` field):

- `/about-us/` About and support: who we are, impact, team, how we teach, help paying, charter
  schools, press, flyers. `/support/`, `/labrats-team/`, `/philosophy/`, `/press/`,
  `/flyers-to-share/`, `/video-link/`, and `/ways-to-donate-2/` redirect to its sections.
- `/contact/` Donate and contact: message form, donating, corporate partnerships, campaigns.
  `/ways-to-donate/` and `/corporate-partnerships/` redirect to its sections.
- `/stemathome/` also holds BrainSTEMtv and the crystal lab; `/brainstemtv/` and
  `/build-your-own-crystal/` redirect there.

The scholarship application, the two long essays (Why learn science, Our teaching methods), and
each program and registration page stay separate because each is a task or a long read.

### Accounts, assignments, and the admin console

Accounts use the backend's existing sign-in (`POST /api/authenticate`, `GET /api/id`); LabRats
staff create them, so there is no public sign-up.

- `/sign-in/`: students and staff sign in, then go to `?next=` (same-site paths only) or their
  home: `/admin/` for Admins, `/account/` for everyone else (`js/labrats-signin.js`).
- `/account/`: a student's open assignments with a turn-in form each, plus feedback once
  reviewed (`js/labrats-account.js`).
- `/admin/`: Admin-only sign-in, then tabs for accounts (create, change role, switch sign-in
  on or off, reset password, delete), website form submissions (filter, mark handled), and assignments (post, open or
  close, read turn-ins, leave feedback) (`js/labrats-admin.js`).

Shared pieces: `js/labrats-api.js` (backend calls through `assets/js/api/config.js`),
`js/labrats-auth.js` (session), `js/labrats-dom.js` (builds user content as text, never HTML),
`js/labrats-session-rules.js` (pure helpers, tested in `tests/test_sdlabrats_session_rules.mjs`).
The backend enforces every permission again; the pages only decide what to show.

The backend follows upstream Flask's account activation: an inactive account's password is
accepted, but `/api/id` answers 403, and the sign-in form says the account is waiting for staff.
Accounts created in the admin console start active.

The header's "Sign in" link becomes "My assignments" or "Admin console" once someone signs in.
A `labrats-signed-in` flag in localStorage records that this browser has signed in, so pages only
ask `/api/id` when someone might be signed in; families who never sign in make no sign-in calls.

Sign-in needs the backend's cookie to reach the browser:

- Local: run the backend on 8587 (`python main.py`) and the site with `make`; sign in at
  `http://localhost:4500/sign-in/` (or `127.0.0.1`). `config.js` calls the backend on the
  page's own host, so the backend's `SameSite=Lax` cookie stays same-site.
- Deployed: the backend that `config.js` points to (`flask.opencodingsociety.com`) must run
  this backend's code and list the site's origin in its CORS `allowed_origins`.

App pages (sign-in, account, admin) keep their interface in their `.md` body and load extra
modules with `scripts: [file.js]`; their heading and lead still come from the backend.

### Keeping the schedule current

`/schedule/` and the program pages list every session the backend marks `open`. In the admin
console, open the "Schedule & notice" tab and switch next month's sessions on and last month's
off; the change shows on the site at once. The same tab edits the notice above every page
(new wording gets a new id, so visitors who dismissed the old one see it). Dates, times, and the
Donorbox campaign can be changed through `PUT /api/labrats/sessions/<id>`.

## Design direction

Written down before building, per the project's anti-template guide.

- **Who and what:** parents of K-8 kids in North County San Diego deciding on a
  science program, then teachers booking assemblies, then donors.
- **Feeling:** curious. A working lab, not a brochure.
- **Color** (from the logo artwork, sampled):
  - Ink navy `#0E1B33`: text, header rule, the dark footer band.
  - Goggle orange `#F5A00A`: primary actions only, with navy text on it.
  - Lens blue `#1B5A9C` for links and focus; tint `#EEF6FC` for quiet surfaces.
- **Type:** Bricolage Grotesque (headings, weight 800/500) for the hand-lettered
  energy of the logo; Atkinson Hyperlegible Next (body) because parents read
  schedules on phones and this face was drawn for legibility.
- **Shape:** slightly rounded (6px controls, 8px surfaces), borders instead of
  shadows, no hover lift.
- **Layout:** left-aligned text with real program photos. Program pages share
  one order (what it is, facts, a session, schedule, paying, questions) so they
  can be compared. Schedules are timetables, not cards.
- **Motion:** state changes only (hover, focus, menu, form submit). Respects
  `prefers-reduced-motion`.

Colors are mapped onto the OCS preference tokens (`--pref-*`, `--panel`,
`--ui-border`, `--text-muted`) inside the `.labrats` scope, so OCS grammar
(`ocs__btn`, `ocs__card`, `ocs__input`, `ocs__table`, `ocs__toggle`) renders in
the brand palette. The literal hex values exist only in `sass/_tokens.scss`.

See `docs/content-map.md` for where every sdlabrats.org URL went, and
`docs/content-notes.md` for problems found in the live content that need an
answer from LabRats staff.
