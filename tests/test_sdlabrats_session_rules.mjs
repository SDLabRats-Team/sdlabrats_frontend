import assert from "node:assert/strict";
import test from "node:test";

const { safeNextPath, homeForRole, sessionLink, formatDate, describeDue, describeTurnIn, summarizeDetails } = await import(
  "../_projects/nonprofits/sdlabrats/js/labrats-session-rules.js"
);

test("safeNextPath only allows same-site paths under the site base", () => {
  assert.equal(safeNextPath("/account/"), "/account/");
  assert.equal(safeNextPath("/sdlabrats_frontend/admin/", "/sdlabrats_frontend"), "/sdlabrats_frontend/admin/");
  assert.equal(safeNextPath("/admin/", "/sdlabrats_frontend"), null);
  for (const unsafe of ["https://evil.example", "//evil.example/x", "/\\evil.example", "javascript:alert(1)", null]) {
    assert.equal(safeNextPath(unsafe), null, String(unsafe));
  }
});

test("admins land on the console, everyone else on their assignments", () => {
  assert.equal(homeForRole("Admin", "/base"), "/base/admin/");
  assert.equal(homeForRole("User"), "/account/");
  assert.equal(homeForRole("Teacher"), "/account/");
});

test("date-only values are read as calendar dates", () => {
  assert.equal(formatDate("2026-10-31"), "Oct 31, 2026");
  assert.equal(formatDate(null), "");
});

test("due wording compares against today", () => {
  assert.equal(describeDue(null, "2026-10-08"), "No due date");
  assert.equal(describeDue("2026-10-08", "2026-10-08"), "Due today");
  assert.equal(describeDue("2026-10-01", "2026-10-08"), "Was due Oct 1, 2026");
  assert.equal(describeDue("2026-10-31", "2026-10-08"), "Due Oct 31, 2026");
});

test("turn-in status reflects review state", () => {
  assert.equal(describeTurnIn(null).state, "todo");
  assert.equal(describeTurnIn({ status: "reviewed" }).label, "Reviewed");
  assert.match(describeTurnIn({ status: "submitted", submitted_at: "2026-10-08T17:00:00" }).label, /^Turned in Oct 8, 2026/);
});

test("inquiry details read as one line", () => {
  assert.equal(summarizeDetails({ student_grade: "3", programs: ["afterschool", "winter-camps"] }),
    "student grade: 3 · programs: afterschool, winter-camps");
});

test("header link follows the signed-in role", () => {
  assert.deepEqual(sessionLink(null, "/base"), { href: "/base/sign-in/", label: "Sign in" });
  assert.deepEqual(sessionLink({ role: "Admin" }), { href: "/admin/", label: "Admin console" });
  assert.deepEqual(sessionLink({ role: "User" }), { href: "/account/", label: "My assignments" });
});
