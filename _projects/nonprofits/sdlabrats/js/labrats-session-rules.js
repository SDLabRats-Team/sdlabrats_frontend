// Pure helpers for LabRats sign-in, the student account page, and the admin console.
// No DOM or network access, so tests can import this file directly.

// Only same-site paths are allowed as a post-sign-in destination (no open redirects).
export function safeNextPath(next, baseurl = "") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  return next.startsWith(baseurl) ? next : null;
}

// Where a person lands after signing in when no destination was requested.
export function homeForRole(role, baseurl = "") {
  return `${baseurl}${role === "Admin" ? "/admin/" : "/account/"}`;
}

// The header's account link: where a signed-in person goes, or the sign-in page.
export function sessionLink(user, baseurl = "") {
  if (!user) return { href: `${baseurl}/sign-in/`, label: "Sign in" };
  return { href: homeForRole(user.role, baseurl), label: user.role === "Admin" ? "Admin console" : "My assignments" };
}

const DATE_FORMAT = { month: "short", day: "numeric", year: "numeric" };

// "2026-10-31" -> "Oct 31, 2026". Date-only strings are read as calendar dates, not UTC instants.
export function formatDate(iso) {
  if (!iso) return "";
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", DATE_FORMAT);
}

// Backend timestamps are UTC without a zone suffix.
export function formatDateTime(iso) {
  if (!iso) return "";
  const stamp = /[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`;
  return new Date(stamp).toLocaleString("en-US", { ...DATE_FORMAT, hour: "numeric", minute: "2-digit" });
}

// Status line for a student's assignment card.
export function describeTurnIn(turnin) {
  if (!turnin) return { state: "todo", label: "Not turned in yet" };
  if (turnin.status === "reviewed") return { state: "reviewed", label: "Reviewed" };
  return { state: "submitted", label: `Turned in ${formatDateTime(turnin.submitted_at)}` };
}

// Due-date wording relative to today ("2026-10-08"), for students.
export function describeDue(dueIso, todayIso) {
  if (!dueIso) return "No due date";
  if (dueIso < todayIso) return `Was due ${formatDate(dueIso)}`;
  if (dueIso === todayIso) return "Due today";
  return `Due ${formatDate(dueIso)}`;
}

// Summary of inquiry details for the admin table, e.g. "interest: afterschool · message: Hi".
export function summarizeDetails(details) {
  return Object.entries(details || {})
    .map(([key, value]) => `${key.replace(/_/g, " ")}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join(" · ");
}
