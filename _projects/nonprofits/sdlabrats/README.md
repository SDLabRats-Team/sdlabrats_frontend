# San Diego LabRats website

The public website for San Diego LabRats (sdlabrats.org), rebuilt as a registered
OCS project. Planning lives in
[pkdev0101/sdlabrats_frontend#1](https://github.com/pkdev0101/sdlabrats_frontend/issues/1).

## How the project is wired

| Piece | Source (edit here) | Published to (generated, git-ignored) |
|-------|--------------------|----------------------------------------|
| Pages | `navigation/*.md` | `_posts/projects/sdlabrats/` |
| Page templates and partials | `navigation/*.html` | `_includes/projects/sdlabrats/` |
| Styles | `sass/` | `_sass/projects/sdlabrats/`, compiled into `/assets/css/style.css` |
| Scripts | `js/` | `/assets/js/projects/sdlabrats/` |
| Images | `images/` | `/images/projects/sdlabrats/` |

Two files sit outside the project folder because Jekyll only reads them from fixed
locations:

- `_layouts/sdlabrats.html`: the page shell (head, header, footer).
- `_data/sdlabrats.yml`: organization facts, navigation, and the program catalog.
  Phone number, address, EIN, and social links are written once here.

Downloadable PDFs (impact report, at-home lab procedures) live in
`assets/pdfs/sdlabrats/`.

Build with the normal workflow: `make` (or `make build`). The project is registered
in `_projects/.makeprojects` as `nonprofits/sdlabrats`.

### Backend

Forms post to the Flask backend (`sdlabrats_backend`):

- `POST /api/labrats/inquiries` stores contact, scholarship, partnership,
  video-topic, and newsletter submissions, and emails staff when SMTP is configured.
- `GET /api/programs/` returns the program catalog the backend validates against.

`js/labrats-forms.js` reads the backend address from `assets/js/api/config.js`
(`pythonURI`), so local development talks to `localhost:8587`.

Payments and registration stay on Donorbox (out of scope for the rebuild). A
registration page sets `donorbox_campaign` in its front matter and the template
embeds the matching Donorbox form.

## Page templates

Every page sets `layout: sdlabrats` plus a `template`:

| `template` | Used for | Key front matter |
|------------|----------|------------------|
| `page` (default) | Hubs and combined pages | `section`, `description`, `contents` ("On this page" bar) |
| `program` | The five program pages; one shared information order | `program` (catalog slug), `facts` |
| `registration` | Monthly afterschool and camp registration pages | `session` block, `donorbox_campaign` |
| `archive` | Past events and retired pages that still have URLs | `archive_note`, `current_url` |
| `redirect` | Live URLs that were empty, moved, or merged into a combined page | `redirect_to` (may include a `#section`) |

### Combined pages

The main navigation has four destinations. Related topics share one page, split into sections
with an "On this page" bar (`contents:` front matter, `navigation/page-contents.html`):

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
- `/admin/`: Admin-only sign-in, then tabs for accounts (create, change role, reset password,
  delete), website form submissions (filter, mark handled), and assignments (post, open or
  close, read turn-ins, leave feedback) (`js/labrats-admin.js`).

Shared pieces: `js/labrats-api.js` (backend calls through `assets/js/api/config.js`),
`js/labrats-auth.js` (session), `js/labrats-dom.js` (builds user content as text, never HTML),
`js/labrats-session-rules.js` (pure helpers, tested in `tests/test_sdlabrats_session_rules.mjs`).
The backend enforces every permission again; the pages only decide what to show.

The header's "Sign in" link becomes "My assignments" or "Admin console" once someone signs in.
A `labrats-signed-in` flag in localStorage records that this browser has signed in, so pages only
ask `/api/id` when someone might be signed in; families who never sign in make no sign-in calls.

Sign-in needs the backend's cookie to reach the browser:

- Local: run the backend on 8587 (`python main.py`) and the site with `make`; sign in at
  `http://localhost:4500/sign-in/` (or `127.0.0.1`). `config.js` calls the backend on the
  page's own host, so the backend's `SameSite=Lax` cookie stays same-site.
- Deployed: the backend that `config.js` points to (`flask.opencodingsociety.com`) must run
  this backend's code and list the site's origin in its CORS `allowed_origins`.

Pages can load extra modules with `scripts: [file.js]` in front matter.

### Keeping the schedule current

`/schedule/` lists every registration page whose front matter has
`session.status: open`. To open next month's afterschool sessions, edit the
registration page for that month (dates, `donorbox_campaign`) and set
`status: open`; set last month's page to `closed`. No other page needs editing.

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
