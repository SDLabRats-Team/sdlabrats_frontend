import assert from "node:assert/strict";
import test from "node:test";

const { fillSearchList, searchItems, cleanQuery } = await import("../_projects/nonprofits/sdlabrats/js/labrats-search.js");

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

// Input checking (#15): bad input returns a message and never runs the search.
test("empty or space-only text asks the user to type something", () => {
  for (const text of ["", "   ", "\t\n", null, undefined]) {
    assert.deepEqual(searchItems(text), { error: "Please type something to search.", results: [] });
  }
});

test("text over 50 characters is too long; exactly 50 is allowed", () => {
  assert.deepEqual(searchItems("c".repeat(51)), { error: "Search is too long.", results: [] });
  assert.equal(searchItems("c".repeat(50)).error, "");
});

test("unsafe characters are removed before searching", () => {
  assert.equal(cleanQuery("<camp>;{}"), "camp");
  assert.deepEqual(titles(searchItems("<CAMP>;")), ["Camps", "Summer camps"]);
  assert.equal(searchItems("<>{};").error, "Please type something to search.");
});

test("runs of spaces inside the text count as one space", () => {
  assert.equal(cleanQuery("  Summer    CAMPS  "), "summer camps");
  assert.deepEqual(titles(searchItems("summer    camps")), ["Summer camps"]);
});
