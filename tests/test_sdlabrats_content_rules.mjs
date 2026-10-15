import assert from "node:assert/strict";
import test from "node:test";

const {
  pagePathFrom, withBaseurl, lookup, fillTemplate, documentTitle, sectionFor,
  openSessions, closedSessions, sessionDates, programsFor, showAnnouncement,
} = await import("../_projects/nonprofits/sdlabrats/js/labrats-content-rules.js");

const org = { name: "San Diego LabRats", tagline: "Real scientists teaching science", charter_email: "jerry@sdlabrats.org", address: { city: "Carlsbad" } };

test("the browser address becomes the backend page path", () => {
  assert.equal(pagePathFrom("/sdlabrats_frontend/camps/", "/sdlabrats_frontend"), "/camps/");
  assert.equal(pagePathFrom("/sdlabrats_frontend/", "/sdlabrats_frontend"), "/");
  assert.equal(pagePathFrom("/camps/index.html"), "/camps/");
  assert.equal(pagePathFrom("/404.html"), "/404.html");
});

test("site paths get the baseurl; other links are left alone", () => {
  assert.equal(withBaseurl("/camps/", "/base"), "/base/camps/");
  for (const link of ["https://donorbox.org", "//cdn.example/x.js", "#donate", "tel:+17604504717", undefined]) {
    assert.equal(withBaseurl(link, "/base"), link);
  }
});

test("organization facts fill text and attribute templates", () => {
  assert.equal(lookup(org, "address.city"), "Carlsbad");
  assert.equal(lookup(org, "address.missing.deeper"), undefined);
  assert.equal(fillTemplate("mailto:{charter_email}", org), "mailto:jerry@sdlabrats.org");
  assert.equal(fillTemplate("{unknown}", org), "");
});

test("document titles", () => {
  assert.equal(documentTitle({ template: "home", title: "Home" }, org), "San Diego LabRats | Real scientists teaching science");
  assert.equal(documentTitle({ template: "program", title: "Camps" }, org), "Camps | San Diego LabRats");
});

test("a child page highlights its parent tab", () => {
  const sections = [{ id: "schedule", pages: [{ url: "/schedule/" }] }];
  assert.deepEqual(sectionFor({ section: "schedule", parent: "/schedule/", path: "/fall-camp-k-3/" }, sections),
    { section: sections[0], activeUrl: "/schedule/" });
  assert.equal(sectionFor({ path: "/sign-in/" }, sections).section, null);
});

const sessions = [
  { path: "/b/", program: "camps", term: "Winter break", grades: "K-3", status: "open", schedule_order: 40, times: [{ dates: "Dec 21-23" }, { dates: "Dec 28-30" }] },
  { path: "/a/", program: "camps", term: "Thanksgiving break", grades: "K-3", status: "open", schedule_order: 30, times: [] },
  { path: "/c/", program: "event", term: "Open house", status: "open", schedule_order: null, times: [] },
  { path: "/d/", program: "afterschool", term: "April 2025", grades: "K-3", status: "closed", times: [] },
];

test("open sessions follow the staff's schedule order, unordered ones last", () => {
  assert.deepEqual(openSessions(sessions).map((s) => s.path), ["/a/", "/b/", "/c/"]);
  assert.deepEqual(openSessions(sessions, "camps").map((s) => s.path), ["/a/", "/b/"]);
  assert.deepEqual(closedSessions(sessions, "afterschool").map((s) => s.path), ["/d/"]);
});

test("a session's dates read as one line", () => {
  assert.equal(sessionDates(sessions[0]), "Dec 21-23 and Dec 28-30");
  assert.equal(sessionDates({}), "");
});

test("programs filter by audience", () => {
  const programs = [{ slug: "camps", audience: "families" }, { slug: "assemblies", audience: "schools" }];
  assert.deepEqual(programsFor(programs, "schools").map((p) => p.slug), ["assemblies"]);
  assert.equal(programsFor(programs).length, 2);
});

test("the notice hides on the page it links to, or when turned off", () => {
  const notice = { show: true, text: "Camps are open", url: "/camps/" };
  assert.equal(showAnnouncement(notice, "/"), true);
  assert.equal(showAnnouncement(notice, "/camps/"), false);
  assert.equal(showAnnouncement({ ...notice, show: false }, "/"), false);
  assert.equal(showAnnouncement(null, "/"), false);
});
