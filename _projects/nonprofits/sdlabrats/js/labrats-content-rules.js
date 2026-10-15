// Pure helpers for turning the backend's page bundle into a page. No DOM or network access,
// so tests can import this file directly.

// The backend path for the page the browser is on: "/sdlabrats_frontend/camps/" -> "/camps/".
export function pagePathFrom(pathname, baseurl = "") {
  const path = baseurl && pathname.startsWith(baseurl) ? pathname.slice(baseurl.length) : pathname;
  const clean = path.replace(/index\.html$/, "");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

// Site paths from the backend are root-relative ("/camps/"); the site may live under a baseurl.
export function withBaseurl(path, baseurl = "") {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return path;
  return `${baseurl}${path}`;
}

// lookup({ address: { city: "Carlsbad" } }, "address.city") -> "Carlsbad"
export function lookup(source, key) {
  return key.split(".").reduce((value, part) => (value == null ? undefined : value[part]), source);
}

// "mailto:{charter_email}" -> "mailto:jerry@sdlabrats.org". Unknown keys become empty text.
export function fillTemplate(template, source) {
  return template.replace(/\{([\w.]+)\}/g, (_, key) => {
    const value = lookup(source, key);
    return value == null ? "" : String(value);
  });
}

export function documentTitle(page, org) {
  return page.template === "home" ? `${org.name} | ${org.tagline}` : `${page.title} | ${org.name}`;
}

// The section a page belongs to, and which of its tabs to highlight. A child page that is not
// listed (a monthly registration page) highlights its `parent` tab.
export function sectionFor(page, sections) {
  const section = sections.find((item) => item.id === page.section) || null;
  return { section, activeUrl: page.parent || page.path };
}

function bySchedule(a, b) {
  const orderA = a.schedule_order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.schedule_order ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB || String(a.term).localeCompare(String(b.term)) || String(a.grades).localeCompare(String(b.grades));
}

// Open sessions, optionally for one program, in the order staff set for the schedule.
export function openSessions(sessions, program) {
  return sessions.filter((session) => session.status === "open" && (!program || session.program === program)).sort(bySchedule);
}

export function closedSessions(sessions, program) {
  return sessions.filter((session) => session.status === "closed" && (!program || session.program === program))
    .sort((a, b) => String(a.grades).localeCompare(String(b.grades)) || String(a.term).localeCompare(String(b.term)));
}

// All of a session's meeting dates in one line, for the compact schedule table.
export function sessionDates(session) {
  return (session.times || []).map((row) => row.dates).filter(Boolean).join(" and ");
}

export function programsFor(programs, audience) {
  return audience ? programs.filter((program) => program.audience === audience) : programs;
}

// Whether the seasonal notice belongs on this page (not on the page it links to).
export function showAnnouncement(announcement, path) {
  return Boolean(announcement && announcement.show && announcement.text && announcement.url !== path);
}
