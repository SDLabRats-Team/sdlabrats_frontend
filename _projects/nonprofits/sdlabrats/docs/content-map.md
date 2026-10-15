# sdlabrats.org content map

Every page published on sdlabrats.org (75, from the WordPress pages API on 2026-10-06) and where it
lives in the rebuild. URLs are unchanged, so existing links, flyers, and QR codes keep working.

Every page's content now lives in the Flask backend (`labrats_pages`, seeded from
`sdlabrats_backend/model/labrats_seed/pages.json`); the frontend only keeps each page's route.
Regenerate this table from that seed if pages are added.

## Templates

- **page**: hub or content page in the shared design.
- **program**: the shared program layout (what it is, facts, a session, schedule, paying, questions).
- **registration**: a session or event page with its Donorbox form. `open` sessions are listed on
  `/schedule/`; `closed` ones keep their details, hide the payment form, and point to the schedule.
- **archive**: past events and retired pages, with a note explaining what changed.
- **redirect**: the live page was empty, a test page, or merged into a combined page; the URL
  forwards, to a `#section` when the content now lives inside a combined page.

## Live pages

| URL | Live title | New title | Section | Template | Route file |
|-----|-----------|-----------|---------|----------|--------|
| `/4-8-stem-center-registration/` | 4-8 STEM Center Registration 4 April | Afterschool, grades 4-8: April 2025 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration.md` |
| `/4-8-stem-center-registration-2/` | 4-8 STEM Center Registration 1 January | Afterschool, grades 4-8: January 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-2.md` |
| `/4-8-stem-center-registration-3/` | 4-8 STEM Center Registration 3 March | Afterschool, grades 4-8: March 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-3.md` |
| `/4-8-stem-center-registration-3-2/` | 4-8 STEM Center Registration 2 February | Afterschool, grades 4-8: February 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-3-2.md` |
| `/4-8-stem-center-registration-4/` | 4-8 STEM Center Registration 5 May | Afterschool, grades 4-8: May 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-4.md` |
| `/4-8-stem-center-registration-4-2/` | 4-8 STEM Center Registration 8 August | Afterschool, grades 4-8: August 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-4-2.md` |
| `/4-8-stem-center-registration-4-2-2/` | 4-8 STEM Center Registration 9 September | Afterschool, grades 4-8: September 2026 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-4-2-2.md` |
| `/4-8-stem-center-registration-4-2-2-2/` | 4-8 STEM Center Registration October | Afterschool, grades 4-8: October 2026 | Schedule & Pricing | registration (open) | `navigation/4-8-stem-center-registration-4-2-2-2.md` |
| `/4-8-stem-center-registration-4-2-2-2-2/` | 4-8 STEM Center Registration November | Afterschool, grades 4-8: November 2025 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-4-2-2-2-2.md` |
| `/4-8-stem-center-registration-4-2-2-2-2-2/` | 4-8 STEM Center Registration December | Afterschool, grades 4-8: December 2025 | Schedule & Pricing | registration (closed) | `navigation/4-8-stem-center-registration-4-2-2-2-2-2.md` |
| `/about-us/` | About Us | About and support | About & Support | page | `navigation/about-us.md` |
| `/assemblies-demo-lab-stations/` | Assemblies / Demo Lab Stations | Assemblies and demo lab stations | Programs | program | `navigation/assemblies-demo-lab-stations.md` |
| `/brainstemtv/` | BrainSTEMtv | BrainSTEMtv | (none) | redirect to `/stemathome/#brainstemtv` | `navigation/brainstemtv.md` |
| `/build-your-own-crystal/` | Build Your Own Crystal | Build your own crystal | (none) | redirect to `/stemathome/#procedures` | `navigation/build-your-own-crystal.md` |
| `/calendar/` | Calendar | Summer 2022 partner camps | Schedule & Pricing | archive | `navigation/calendar.md` |
| `/camps/` | Register for fun hands-on STEM Camps Today | Break and summer camps | Programs | program | `navigation/camps.md` |
| `/cart/` | Cart | Cart | Schedule & Pricing | archive | `navigation/cart.md` |
| `/checkout/` | Checkout | Checkout | Schedule & Pricing | archive | `navigation/checkout.md` |
| `/contact/` | Contact | Donate and contact | Donate & Contact | page | `navigation/contact.md` |
| `/corporate-partnerships/` | Corporate Partnerships | Corporate partnerships | (none) | redirect to `/contact/#partnerships` | `navigation/corporate-partnerships.md` |
| `/courses-workshops/` | Courses & Workshops | Courses and workshops | Programs | program | `navigation/courses-workshops.md` |
| `/education/` | Education | Education | (none) | redirect to `/programs/` | `navigation/education.md` |
| `/fall-camp-k-3/` | Exciting Fall STEM Camps for grades K-3Register Today | Thanksgiving break camp, grades K-3 | Schedule & Pricing | registration (open) | `navigation/fall-camp-k-3.md` |
| `/fall-camps-3-6/` | Exciting Fall STEM Camps for grades 3rd-6th Register today | Thanksgiving break camp, grades 3-6 | Schedule & Pricing | registration (open) | `navigation/fall-camps-3-6.md` |
| `/flyers-to-share/` | flyers to share | Flyers to share | (none) | redirect to `/about-us/#flyers` | `navigation/flyers-to-share.md` |
| `/free-bike-give-away/` | FREE Bike Give Away | Free bike giveaway | Donate & Contact | archive | `navigation/free-bike-give-away.md` |
| `/free-open-house-register-today/` | Free Open House register today | Free open house | Schedule & Pricing | registration (open) | `navigation/free-open-house-register-today.md` |
| `/giving-tuesday/` | Giving Tuesday Help us up the STEM statistics today | Giving Tuesday | Donate & Contact | page | `navigation/giving-tuesday.md` |
| `/` | Home | Home | (none) | home | `navigation/home.md` |
| `/k-3-stem-center-registration/` | K-3 STEM Center Registration 4 April | Afterschool, grades K-3: April 2025 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration.md` |
| `/k-3-stem-center-registration-2/` | K-3 STEM Center Registration 1 January | Afterschool, grades K-3: January 2026 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-2.md` |
| `/k-3-stem-center-registration-2-2/` | K-3 STEM Center Registration 2 February | Afterschool, grades K-3: February 2026 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-2-2.md` |
| `/k-3-stem-center-registration-3/` | K-3 STEM Center Registration 3 March | Afterschool, grades K-3: March 2025 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-3.md` |
| `/k-3-stem-center-registration-5/` | K-3 STEM Center Registration 5 May | Afterschool, grades K-3: May 2025 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-5.md` |
| `/k-3-stem-center-registration-5-3/` | K-3 STEM Center Registration August | Afterschool, grades K-3: August 2026 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-5-3.md` |
| `/k-3-stem-center-registration-5-3-2/` | K-3 STEM Center Registration September | Afterschool, grades K-3: September 2026 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-5-3-2.md` |
| `/k-3-stem-center-registration-5-3-2-2/` | K-3 STEM Center Registration October | Afterschool, grades K-3: October 2026 | Schedule & Pricing | registration (open) | `navigation/k-3-stem-center-registration-5-3-2-2.md` |
| `/k-3-stem-center-registration-5-3-2-2-2/` | K-3 STEM Center Registration November | Afterschool, grades K-3: November 2025 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-5-3-2-2-2.md` |
| `/k-3-stem-center-registration-5-3-2-2-2-2/` | K-3 STEM Center Registration December | Afterschool, grades K-3: December 2025 | Schedule & Pricing | registration (closed) | `navigation/k-3-stem-center-registration-5-3-2-2-2-2.md` |
| `/labrats-team/` | LabRats Team | LabRats team | (none) | redirect to `/about-us/#team` | `navigation/labrats-team.md` |
| `/my-account/` | My account | My account | Schedule & Pricing | archive | `navigation/my-account.md` |
| `/our-teaching-methods/` | Our Teaching Methods | Our teaching methods | About & Support | page | `navigation/our-teaching-methods.md` |
| `/pac-bio-5k-fundraiser/` | Pac Bio 5K Fundraiser | PacBio 5K fundraiser | Donate & Contact | archive | `navigation/pac-bio-5k-fundraiser.md` |
| `/philosophy/` | Philosophy | Philosophy | (none) | redirect to `/about-us/#philosophy` | `navigation/philosophy.md` |
| `/press/` | Press | Press | (none) | redirect to `/about-us/#press` | `navigation/press.md` |
| `/register-today-for-thrive-classes/` | Register Today for Thrive classes | Thrive classes | Schedule & Pricing | page | `navigation/register-today-for-thrive-classes.md` |
| `/scholarships/` | Scholarships | Scholarships | About & Support | page | `navigation/scholarships.md` |
| `/shop/` | Shop | Shop | Schedule & Pricing | archive | `navigation/shop.md` |
| `/sorry/` | Sorry! | Expired link | (none) | page | `navigation/sorry.md` |
| `/spring-break-camp-2/` | Register Today for fun spring break camps grades 3-6 | Spring break camp, grades 3-6 | Schedule & Pricing | registration (closed) | `navigation/spring-break-camp-2.md` |
| `/spring-break-camp-2-2/` | Register Today for fun SUMMER camps grades 3-6 part 1 | Summer camp, grades 3-6 (part 1) | Schedule & Pricing | registration (closed) | `navigation/spring-break-camp-2-2.md` |
| `/spring-break-camp-2-2-2/` | Register Today for fun SUMMER camps grades 3-6 part 2 | Summer camp, grades 3-6 (part 2) | Schedule & Pricing | registration (closed) | `navigation/spring-break-camp-2-2-2.md` |
| `/spring-break-camps/` | Exciting Spring Break STEM Camps Register Today | Spring break STEM camps | Schedule & Pricing | page | `navigation/spring-break-camps.md` |
| `/spring-break-camps-1/` | Register Today for fun spring break STEM camps grades K-3 | Spring break camp, grades K-3 | Schedule & Pricing | registration (closed) | `navigation/spring-break-camps-1.md` |
| `/spring-break-camps-1-2/` | Register Today for fun Summer STEM camps grades K-3 part 1 | Summer camp, grades K-3 (part 1) | Schedule & Pricing | registration (closed) | `navigation/spring-break-camps-1-2.md` |
| `/spring-break-camps-1-2-2/` | Register Today for fun Summer STEM camps grades K-3 part 2 | Summer camp, grades K-3 (part 2) | Schedule & Pricing | registration (closed) | `navigation/spring-break-camps-1-2-2.md` |
| `/stem-discovery-center/` | STEM Discovery Center OLD | STEAM Discovery Center, fall 2021 | Schedule & Pricing | archive | `navigation/stem-discovery-center.md` |
| `/stem-discovery-center-2-2/` | STEM Discovery Center September | STEM Discovery Saturdays, September 2023 | Schedule & Pricing | archive | `navigation/stem-discovery-center-2-2.md` |
| `/stem-discovery-center-2-3-2/` | Register Today for the afterschool STEM Discovery Center | Afterschool at the STEM Discovery Center | Programs | program | `navigation/stem-discovery-center-2-3-2.md` |
| `/stemathome/` | STEM At Home | STEM at Home | Programs | program | `navigation/stemathome.md` |
| `/summer-camps-2/` | Register Today Summer Camp Sensational STEM Camp | Sensational Science Camp | Schedule & Pricing | registration (closed) | `navigation/summer-camps-2.md` |
| `/summer-camps-5/` | Register Today Summer Camp Forensic Science Camp | Forensic Science Camp | Schedule & Pricing | registration (closed) | `navigation/summer-camps-5.md` |
| `/summer-stem-camps/` | Exciting Summer STEM Camps Register Today | Summer STEM camps | Schedule & Pricing | page | `navigation/summer-stem-camps.md` |
| `/test/` | TEST | Test page | (none) | redirect to `/` | `navigation/test.md` |
| `/thank-you/` | Press Copy | Order received | Schedule & Pricing | archive | `navigation/thank-you.md` |
| `/thank-you-newsletter-response/` | Thank you newsletter response | Thanks for subscribing | Donate & Contact | page | `navigation/thank-you-newsletter-response.md` |
| `/thrive-payment-processing-only/` | Thrive payment processing only | Thrive payment form | Schedule & Pricing | registration (open) | `navigation/thrive-payment-processing-only.md` |
| `/video-link/` | Video Link | LabRats video | (none) | redirect to `/about-us/#video` | `navigation/video-link.md` |
| `/ways-to-donate/` | Donate Today | Donate | (none) | redirect to `/contact/#donate` | `navigation/ways-to-donate.md` |
| `/ways-to-donate-2/` | Approved Vendors for Charter Schools | Charter school funding | (none) | redirect to `/about-us/#charter` | `navigation/ways-to-donate-2.md` |
| `/why-learn-science/` | Why Learn Science? | Why learn science? | About & Support | page | `navigation/why-learn-science.md` |
| `/wine-festival-fundraiser/` | Wine Festival Fundraiser | Wine festival fundraiser | Donate & Contact | archive | `navigation/wine-festival-fundraiser.md` |
| `/winter-camps-3-6/` | Exciting Winter STEM Camps for Grades 3-6 Register Today | Winter break camp, grades 3-6 | Schedule & Pricing | registration (open) | `navigation/winter-camps-3-6.md` |
| `/winter-camps-k3/` | Exciting Winter STEM Camps for grades K-3 Register Today | Winter break camp, grades K-3 | Schedule & Pricing | registration (open) | `navigation/winter-camps-k3.md` |
| `/winter-steam-discover-camp-2021/` | TING Presents Winter STEAM Discover Camp | Winter STEAM Discovery Camp 2021 | Schedule & Pricing | archive | `navigation/winter-steam-discover-camp-2021.md` |

## Pages added in the rebuild

Hubs required by the navigation, the sign-in, account, and admin pages, a branded 404, and
redirects for URLs that the live site linked to but that returned errors.

| URL | Title | Section | Template | Source |
|-----|-------|---------|----------|--------|
| `/404.html` | Page not found | (none) | page | `navigation/not-found.md` |
| `/account/` | My assignments | (none) | page | `navigation/account.md` |
| `/admin/` | Admin console | (none) | page | `navigation/admin.md` |
| `/fall-stem-camp/` | Fall STEM camp | (none) | redirect to `/camps/` | `navigation/redirect-fall-stem-camp.md` |
| `/product/steam-discovery-camp-winter-grades-4-8/` | STEAM Discovery Camp, grades 4-8 | (none) | redirect to `/winter-steam-discover-camp-2021/` | `navigation/redirect-winter-camp-4-8-product.md` |
| `/product/steam-discovery-camp-winter-grades-k-3/` | STEAM Discovery Camp, grades K-3 | (none) | redirect to `/winter-steam-discover-camp-2021/` | `navigation/redirect-winter-camp-k-3-product.md` |
| `/programs/` | Programs | Programs | page | `navigation/programs.md` |
| `/register/` | Register | (none) | redirect to `/schedule/` | `navigation/redirect-register.md` |
| `/request-a-class-form/` | Request a class | (none) | redirect to `/contact/` | `navigation/redirect-request-a-class-form.md` |
| `/schedule/` | Schedule and pricing | Schedule & Pricing | page | `navigation/schedule.md` |
| `/sign-in/` | Sign in | (none) | page | `navigation/sign-in.md` |
| `/stem-discovery-center-2/` | STEM Discovery Center | (none) | redirect to `/stem-discovery-center-2-2/` | `navigation/stem-discovery-center-2.md` |
| `/summer-camps/` | Summer camps | (none) | redirect to `/summer-stem-camps/` | `navigation/redirect-summer-camps.md` |
| `/support/` | Paying for programs | (none) | redirect to `/about-us/#help-paying` | `navigation/support.md` |
| `/winter-stem-camp/` | Winter STEM camp | (none) | redirect to `/camps/` | `navigation/redirect-winter-stem-camp.md` |

## Where shared content lives

Repeated blocks on the old site now have one source each:

| Content | Old site | Now |
|---------|----------|-----|
| Phone, address, EIN, social links | Typed on many pages | Backend `org` and `social` settings, placed with `data-labrats-org` |
| Afterschool session description | 20 registration pages | Backend block `afterschool_session` |
| "Why parents/kids choose LabRats camps" | 10 camp pages | Backend block `camp_why` |
| Camp daily schedules | 10 camp pages | Backend `camp_days` setting |
| Scholarship and charter summary | Home and most registration pages | Backend blocks `help_paying_families` and `help_paying_schools` |
| Program summaries | Home, plus desktop and mobile copies | Backend `labrats_programs` table |
| Current sessions | Hand-edited hub pages | Backend `labrats_sessions` table, opened and closed in the admin console |
| Team bios | Team page and Courses page | About and support, `#team` |
| Video-topic request form | STEM at Home and BrainSTEMtv | STEM at Home only (`navigation/form-video-topic.html`, placed by the backend page) |
| Support, charter funding, team, philosophy, press, flyers | Seven separate pages | One page, `/about-us/`, with an "On this page" bar |
| Contact, donating, corporate sponsorship | Three separate pages | One page, `/contact/` |
