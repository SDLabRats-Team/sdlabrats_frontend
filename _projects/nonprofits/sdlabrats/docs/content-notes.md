# Content notes for LabRats staff

Problems found in the live sdlabrats.org content during the rebuild (October 2026). Nothing here
was guessed into the new site: where the evidence was clear the fix is noted, and everything else
needs an answer from LabRats before it can be completed.

## Needs an answer

| # | Page | Issue | What the new site does |
|---|------|-------|------------------------|
| 1 | Afterschool | The older afterschool group is "Grades 4-8" on the home page and the registration pages, but "Grade 3-6" on the afterschool hub and "3rd-6th" on the October 2026 flyer. | Uses **4-8**, matching the registration pages. If 3-6 is correct, change `grades` on those sessions (`PUT /api/labrats/sessions/<id>`) and on the afterschool program in the backend. |
| 2 | Thrive payment | The page says "Follow this link to the Thrive registration page" but has no link. | Says to register through Thrive and offers phone help. Add the Thrive URL to `thrive-payment-processing-only.md` and `register-today-for-thrive-classes.md`. |
| 3 | Free open house | Dates are still the template placeholder "[Insert Dates, e.g., Friday, Oct 18 - Sunday, Oct 20]". | Omits the dates and points to the Donorbox form for times. Add real dates to `free-open-house-register-today.md`. |
| 4 | Team | Jason Merrill's bio is "Something about Jason!" and there is no photo. | Shows name and title only. Send a bio and photo. |
| 5 | Assemblies | "Demo Lab Stations" repeats the assembly paragraph word for word. | Shows the assembly text once, plus a short line asking schools to contact you about stations. Send a real description. |
| 6 | Holiday camps | No price is published outside the Donorbox forms. | Schedule says "Shown on the registration form". Add a price to `schedule.md` and `camps.md` if you want it listed. |
| 7 | Corporate partnerships | "More than 75% of Millennial employees..." has no source. | Kept, attributed to the previous site. Add a source or remove it. |
| 8 | Video link | `/video-link/` is a bare Vimeo URL with no title or description, and the video refused to embed in automated testing (HTTP 403). | Embeds the video with a "Watch on Vimeo" link. Check the video's embed settings and send a title. |
| 9 | Contact email | The impact report lists jason@sdlabrats.org; the charter page lists jerry@sdlabrats.org; no general address is published. | Shows jerry@ only for charter questions, and the form for everything else. |

## Fixed using evidence on the live site

| Page | Live problem | Fix and evidence |
|------|--------------|------------------|
| Afterschool hub | Address "Suite A113" | **A112**, used on every other page and the home page. |
| K-3 October registration | Saturday dates "10/10, 10/17, 10/25, 10/31"; Oct 25, 2026 is a Sunday | **Oct 24**, matching the Saturday pattern and the 4-8 October page. |
| Fall camps (K-3 and 3-6) | Body says "For Students Grades K-2" | Grades from each page's title and the camps hub (K-3, 3-6). |
| Winter camp K-3 | Body says "For Students Grades 3-6" | K-3, from the page title and slug. |
| Fall and winter camps | "Give your child an unforgettable spring" | Shared camp copy no longer names a season. |
| Holiday camps hub | Winter K-3, winter 3-6, and "Apply" scholarship links went to themify.me | Linked to `/winter-camps-k3/`, `/winter-camps-3-6/`, `/scholarships/`. |
| Bike giveaway | Links to `/fall-stem-camp/` and `/winter-stem-camp/` (404) | Linked to the real camp pages; both old URLs now redirect to `/camps/`. |
| Theme summer camps | "Other summer camps" linked `/summer-camps/` (404) | Linked to `/summer-stem-camps/`; the old URL redirects there. |
| 2021 Discovery Center | "View Schedule & Sign Up" and "fill out this form" linked dead URLs | Archived page; `/register/` and `/request-a-class-form/` redirect to the schedule and contact pages. |
| 4-8 "March" registration | Lists February dates and a "May Dates HERE!" placeholder link | Dates kept as published with a note; placeholder link removed. |
| Spring break hub | Schedule image `2026/02/Website-camp-schedules.png` returns 404 | Image omitted; the two age groups are listed as a table. |

## Decisions made in the rebuild

- **Combined pages (October 7, 2026).** Support and About became one page (`/about-us/`), and
  Donate and Contact became one page (`/contact/`), each split into sections with an "On this
  page" bar; BrainSTEMtv and the crystal lab joined STEM at Home. Every merged URL redirects to its
  section. All text, lists, forms, quotes, and outbound links were kept; prose was tightened, the
  two sponsorship flyers became links, and one decorative photo was dropped from the charter section.

- **Years on past sessions.** Monthly registration pages listed dates without a year. The year was
  found by matching weekdays (for example, "Wednesday 11/5" only fits 2025). Only the October 2026
  afterschool pages and the Thanksgiving and winter 2026 camps are marked `open`.
- **Prices** come from the October 2026 afterschool flyer ($45 a day, $160 a month) and the summer
  2026 part 2 flyer ($375 a week). Fall 2021 and fall 2023 prices appear only on their archived pages.
- **Impact report figures and quotes** on the About and home pages come from the 2023-24 impact
  report PDF; quotes have spelling and punctuation corrected and are marked as such.
- **Images of text** (the Discovery Center resources sheet, the October 2026 and summer 2026
  flyers) were transcribed into HTML so screen readers and search can read them. The originals are
  still linked.
- **Animated GIFs** on the afterschool page (71 MB together) were replaced by single frames.
  Downloadable PDFs were recompressed from 37 MB to 7 MB.
- **The 30-second 2021 winter camp video** (28 MB MP4 in WordPress uploads) was not migrated.
  Upload it to YouTube if it should stay online.
- **Auto-opening holiday camp popup** became a dismissible announcement bar
  (the backend `announcement` setting, edited in the admin console's "Schedule & notice" tab).
- **WooCommerce pages** (`/shop/`, `/cart/`, `/checkout/`, `/my-account/`, `/thank-you/`) had no
  store behind them; they now explain that registration happens on each session page.
- **Contact form choices** were Courses, Workshops, Assembly, Demo Lab Station, and Other. They now
  list every program, so families can use the form too.
- **Empty or test pages**: `/education/` (empty) redirects to `/programs/`; `/test/` (a draft hero
  with "ENROILL NOW") redirects to the home page; `/about-us/` (empty) is now the About hub.

## External links to re-check

These links from the live site timed out or errored during migration testing on 2026-10-06. They
are kept, but someone should click through them:

- sandiegocounty.gov/auditor/nrp.html (Districts 2, 4, 5 grants)
- cushenterprises.com/application.html (Cushman Foundation)
- beckmancoulterfoundation.org/grant/
- sci-ed-ga.org/funding-guidelines-for-non-profits (General Atomics)
- sdfoundation.org/grantseekers/ (blocked automated requests)
- Summer 2022 partner sign-ups on hisawyer.com and inplay.org (inplay returned 404; archived page)
- 2024 wine festival ticket page on ticketspice.com (archived page)

## Before going live

- Production form submissions go to `pythonURI` in `assets/js/api/config.js`
  (`https://flask.opencodingsociety.com`), which hosts the LabRats backend. Its CORS list
  (`sdlabrats_backend/__init__.py`) includes sdlabrats.org and the GitHub Pages preview.
- `CNAME` still says `pages.opencodingsociety.com`; change it to `www.sdlabrats.org` when the domain
  moves to GitHub Pages.
- Form submissions are stored by the backend and listed for admins at `/labrats/inquiries/`. Like the
  old WPForms, the backend can email each submission to staff: set `LABRATS_NOTIFY_TO` and the
  `SMTP_*` variables in the backend `.env` (see the backend README) with LabRats' mail account.
- **Accounts:** change the backend's default admin password (`ADMIN_PASSWORD` in `.env`) before
  giving anyone the `/admin/` address, then create staff and student accounts from the console.
- **Sign-in cookie:** the backend sets its sign-in cookie on `.opencodingsociety.com`. A site served
  from another domain (github.io or sdlabrats.org) relies on the browser accepting that cross-site
  cookie; Safari and other browsers that block third-party cookies won't keep people signed in. The
  sign-in page says so when it happens. Serving the site and API from the same domain avoids this.
