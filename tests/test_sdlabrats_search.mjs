import assert from "node:assert/strict";
import test from "node:test";

const { fillSearchList, searchItems } = await import("../_projects/nonprofits/sdlabrats/js/labrats-search.js");

// A small site map shaped like the backend's site.sections.
fillSearchList([
  { title: "Programs", pages: [{ title: "Camps", url: "/camps/" }, { title: "STEM at Home", url: "/stemathome/" }] },
  { title: "Schedule & Pricing", pages: [{ title: "Summer camps", url: "/summer-stem-camps/" }] },
  { title: "About & Support", pages: [{ title: "About & support", url: "/about-us/" }], anchors: [{ title: "Team", url: "/about-us/#team" }] },
]);

const titles = (answer) => answer.results.map((item) => item.title);

test("a search finds every page whose title matches, in list order", () => {
  assert.deepEqual(titles(searchItems("camp")), ["Camps", "Summer camps"]);
});

test("section anchors are searched too", () => {
  assert.deepEqual(titles(searchItems("team")), ["Team"]);
});

test("uppercase, lowercase, and outside spaces are treated the same", () => {
  assert.deepEqual(titles(searchItems("  CAMPS ")), ["Camps", "Summer camps"]);
});

test("a search with no match returns no results and no error", () => {
  const answer = searchItems("zzz");
  assert.deepEqual(answer.results, []);
  assert.equal(answer.error, "");
});
