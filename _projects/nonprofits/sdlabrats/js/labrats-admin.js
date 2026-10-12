// /admin/: LabRats staff console. Admin-only sign-in, then three tabs: accounts, website form
// submissions, and assignments with their turn-ins. Every action is enforced again by the backend.
import { apiRequest, BackendUnavailableError } from "./labrats-api.js";
import { getCurrentUser, initSignInForm, initSignOutButtons } from "./labrats-auth.js";
import { showErrors, setStatus, focusFirstError } from "./labrats-forms.js";
import { formatDate, formatDateTime, summarizeDetails } from "./labrats-session-rules.js";
import { el, table, emptyState, toggleSwitch } from "./labrats-dom.js";

const root = document.querySelector("[data-labrats-admin]");
const consoleView = root.querySelector("[data-labrats-console]");
const statusLine = root.querySelector("[data-admin-status]");
let currentUser = null;

function announce(message) {
  statusLine.textContent = message;
}

// Runs an API call and reports failures in the console status line. Returns the result or null.
async function call(path, options, failureMessage) {
  try {
    const result = await apiRequest(path, options);
    if (!result.ok && result.status !== 400) {
      announce(result.data?.message || `${failureMessage} (error ${result.status}).`);
    }
    return result;
  } catch (error) {
    if (!(error instanceof BackendUnavailableError)) throw error;
    announce("We couldn't reach the LabRats server. Please try again.");
    return null;
  }
}

// ---------- Tabs ----------

function initTabs() {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute("aria-selected", String(selected));
      other.tabIndex = selected ? 0 : -1;
      document.getElementById(other.getAttribute("aria-controls")).hidden = !selected;
    });
    tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (step) select(tabs[(index + step + tabs.length) % tabs.length]);
      if (event.key === "Home") select(tabs[0]);
      if (event.key === "End") select(tabs[tabs.length - 1]);
    });
  });
}

// ---------- Users ----------

const ROLE_LABELS = { User: "Student or family", Teacher: "Teacher", Admin: "Admin" };

function roleSelect(user) {
  const select = el("select", {
    class: "ocs__input labrats__compact-input", "aria-label": `Role for ${user.name}`,
    disabled: user.uid === currentUser.uid,
  }, Object.entries(ROLE_LABELS).map(([value, label]) => el("option", { value, selected: value === user.role }, label)));
  select.addEventListener("change", async () => {
    const result = await call(`/api/labrats/users/${encodeURIComponent(user.uid)}`, { method: "PUT", body: { role: select.value } }, "Role not changed");
    if (result?.ok) {
      announce(`${user.name} is now ${ROLE_LABELS[select.value]}.`);
      user.role = select.value;
    } else {
      if (result?.status === 400) announce(Object.values(result.data.errors).join(" "));
      select.value = user.role;
    }
  });
  return select;
}

// Upstream Flask refuses inactive accounts at sign-in. Accounts made here start active; accounts
// made elsewhere (such as OCS mentor sign-ups) wait for an admin to switch them on.
function activeToggle(user) {
  const toggle = toggleSwitch("Active", {
    checked: user.active, disabled: user.uid === currentUser.uid, name: `${user.name} can sign in`,
  });
  const input = toggle.firstChild;
  input.addEventListener("change", async () => {
    const result = await call(`/api/labrats/users/${encodeURIComponent(user.uid)}`, { method: "PUT", body: { active: input.checked } }, "Account not updated");
    if (result?.ok) {
      user.active = result.data.active;
      announce(`${user.name} ${user.active ? "can sign in now" : "can no longer sign in"}.`);
    } else {
      if (result?.status === 400) announce(Object.values(result.data.errors).join(" "));
      input.checked = user.active;
    }
  });
  return toggle;
}

function resetPassword(user) {
  const input = el("input", {
    class: "ocs__input labrats__compact-input", type: "password", autocomplete: "new-password",
    minlength: 8, "aria-label": `New password for ${user.name}`, placeholder: "New password",
  });
  const form = el("form", { class: "labrats__inline-form", novalidate: true },
    input, el("button", { class: "ocs__btn accent", type: "submit" }, "Save"));
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await call(`/api/labrats/users/${encodeURIComponent(user.uid)}`, { method: "PUT", body: { password: input.value } }, "Password not changed");
    if (result?.ok) {
      form.reset();
      form.closest("details").open = false;
      announce(`Password reset for ${user.name}. Share it with them directly.`);
    } else if (result?.status === 400) {
      announce(Object.values(result.data.errors).join(" "));
      input.focus();
    }
  });
  return el("details", { class: "labrats__row-action" }, el("summary", {}, "Reset password"), form);
}

function deleteButton(user) {
  if (user.uid === currentUser.uid) return el("span", { class: "labrats__hint" }, "You");
  return el("button", {
    class: "labrats__text-button labrats__text-button--danger", type: "button",
    onclick: async () => {
      if (!window.confirm(`Delete ${user.name} (${user.uid})? Their turned-in work is deleted too.`)) return;
      const result = await call(`/api/labrats/users/${encodeURIComponent(user.uid)}`, { method: "DELETE" }, "Account not deleted");
      if (result?.ok) {
        announce(`Deleted ${user.name}.`);
        loadUsers();
      }
    },
  }, "Delete");
}

async function loadUsers() {
  const container = root.querySelector("[data-admin-users]");
  const query = root.querySelector("[data-admin-user-search]").value.trim();
  const result = await call(`/api/labrats/users${query ? `?q=${encodeURIComponent(query)}` : ""}`, {}, "Accounts not loaded");
  if (!result?.ok) return;
  container.replaceChildren(result.data.length
    ? table("LabRats accounts", ["Name", "Username", "Email", "Role", "Sign-in", "Actions"], result.data.map((user) => [
      user.name, user.uid, user.email && user.email !== "?" ? user.email : "",
      roleSelect(user),
      activeToggle(user),
      el("div", { class: "labrats__row-actions" }, resetPassword(user), deleteButton(user)),
    ]))
    : emptyState(query ? "No accounts match that search." : "No accounts yet."));
}

function initUsers() {
  const form = root.querySelector('[data-admin-form="user"]');
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(form));
    setStatus(form, "pending", "Creating account...");
    const result = await call("/api/labrats/users", { method: "POST", body }, "Account not created");
    if (result?.ok) {
      showErrors(form, {});
      form.reset();
      setStatus(form, "success", `Created ${result.data.name} (${result.data.uid}).`);
      loadUsers();
    } else if (result && [400, 409].includes(result.status) && result.data?.errors) {
      showErrors(form, result.data.errors);
      setStatus(form, "error", "Please fix the highlighted fields.");
      focusFirstError(form);
    } else {
      setStatus(form, "error", "The account wasn't created.");
    }
  });
  let timer;
  root.querySelector("[data-admin-user-search]").addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(loadUsers, 250);
  });
}

// ---------- Form submissions ----------

function statusButton(inquiry) {
  const button = el("button", { class: "ocs__btn accent", type: "button" });
  const paint = () => {
    button.textContent = inquiry.status === "handled" ? "Handled" : "New";
    button.setAttribute("aria-label", `${button.textContent}. Mark ${inquiry.first_name}'s ${inquiry.form} submission as ${inquiry.status === "handled" ? "new" : "handled"}`);
    button.classList.toggle("fill", inquiry.status === "new");
  };
  paint();
  button.addEventListener("click", async () => {
    const next = inquiry.status === "handled" ? "new" : "handled";
    const result = await call(`/api/labrats/inquiries/${inquiry.id}`, { method: "PUT", body: { status: next } }, "Status not changed");
    if (result?.ok) {
      inquiry.status = result.data.status;
      paint();
    }
  });
  return button;
}

async function loadSubmissions() {
  const params = new URLSearchParams();
  root.querySelectorAll("[data-admin-submission-filter]").forEach((select) => {
    if (select.value) params.set(select.dataset.adminSubmissionFilter, select.value);
  });
  const result = await call(`/api/labrats/inquiries${params.size ? `?${params}` : ""}`, {}, "Submissions not loaded");
  if (!result?.ok) return;
  root.querySelector("[data-admin-submissions]").replaceChildren(result.data.length
    ? table("Website form submissions", ["Received", "Form", "Name", "Email", "Phone", "Details", "Status"], result.data.map((inquiry) => [
      formatDateTime(inquiry.created_at), inquiry.form.replace("_", " "),
      `${inquiry.first_name} ${inquiry.last_name}`,
      el("a", { href: `mailto:${inquiry.email}` }, inquiry.email),
      inquiry.phone || "",
      el("span", { class: "labrats__details" }, summarizeDetails(inquiry.details)),
      statusButton(inquiry),
    ]))
    : emptyState("No submissions match these filters."));
}

// ---------- Assignments and turn-ins ----------

function turnInCard(turnin) {
  const feedback = el("textarea", {
    class: "ocs__input", rows: 3, maxlength: 5000, "aria-label": `Feedback for ${turnin.student?.name}`,
  }, turnin.feedback || "");
  const save = async (status) => {
    const result = await call(`/api/labrats/turnins/${turnin.id}`, { method: "PUT", body: { feedback: feedback.value, ...(status && { status }) } }, "Feedback not saved");
    if (result?.ok) {
      Object.assign(turnin, result.data);
      card.dataset.state = turnin.status;
      stateLabel.textContent = turnin.status === "reviewed" ? "Reviewed" : "Needs review";
      announce(`Saved feedback for ${turnin.student?.name}.`);
    }
  };
  const stateLabel = el("span", { class: "labrats__grade" }, turnin.status === "reviewed" ? "Reviewed" : "Needs review");
  const card = el("article", { class: "labrats__turnin", dataset: { state: turnin.status } },
    el("div", { class: "labrats__session-head" },
      el("h4", {}, `${turnin.student?.name || "Deleted account"} `, el("span", { class: "labrats__hint" }, turnin.student?.uid || "")),
      stateLabel),
    el("p", { class: "labrats__hint" }, `Turned in ${formatDateTime(turnin.submitted_at)}`),
    turnin.response ? el("p", { class: "labrats__assignment-instructions" }, turnin.response) : null,
    turnin.link ? el("p", {}, el("a", { href: turnin.link, rel: "noopener noreferrer", target: "_blank" }, "Open the linked work")) : null,
    el("div", { class: "labrats__field" }, feedback),
    el("div", { class: "ocs__links" },
      el("button", { class: "ocs__btn signal fill", type: "button", onclick: () => save("reviewed") }, "Save and mark reviewed"),
      el("button", { class: "ocs__btn accent", type: "button", onclick: () => save() }, "Save feedback only")));
  return card;
}

function openToggle(assignment) {
  const toggle = toggleSwitch("Open for turn-ins", { checked: assignment.is_open });
  const input = toggle.firstChild;
  input.addEventListener("change", async () => {
    const result = await call(`/api/labrats/assignments/${assignment.id}`, { method: "PUT", body: { is_open: input.checked } }, "Assignment not updated");
    if (result?.ok) {
      assignment.is_open = result.data.is_open;
      announce(`"${assignment.title}" is now ${assignment.is_open ? "open" : "closed"} for turn-ins.`);
    } else {
      input.checked = assignment.is_open;
    }
  });
  return toggle;
}

function assignmentCard(assignment) {
  const turnins = el("div", { class: "labrats__turnins", hidden: true });
  const toggle = el("button", { class: "ocs__btn accent", type: "button", "aria-expanded": "false" },
    `Turn-ins (${assignment.turnin_count})`);
  toggle.addEventListener("click", async () => {
    const opening = turnins.hidden;
    toggle.setAttribute("aria-expanded", String(opening));
    turnins.hidden = !opening;
    if (!opening) return;
    const result = await call(`/api/labrats/assignments/${assignment.id}/turnins`, {}, "Turn-ins not loaded");
    if (result?.ok) {
      turnins.replaceChildren(...(result.data.length ? result.data.map(turnInCard) : [emptyState("Nobody has turned this in yet.")]));
    }
  });
  const remove = el("button", {
    class: "labrats__text-button labrats__text-button--danger", type: "button",
    onclick: async () => {
      if (!window.confirm(`Delete "${assignment.title}" and all ${assignment.turnin_count} turn-ins?`)) return;
      const result = await call(`/api/labrats/assignments/${assignment.id}`, { method: "DELETE" }, "Assignment not deleted");
      if (result?.ok) {
        announce(`Deleted "${assignment.title}".`);
        loadAssignments();
      }
    },
  }, "Delete assignment");

  return el("article", { class: "labrats__assignment" },
    el("div", { class: "labrats__session-head" }, el("h3", {}, assignment.title), openToggle(assignment)),
    el("p", { class: "labrats__meta" },
      el("span", {}, assignment.due_date ? `Due ${formatDate(assignment.due_date)}` : "No due date"),
      el("span", {}, `${assignment.turnin_count} turned in, ${assignment.reviewed_count} reviewed`)),
    el("p", { class: "labrats__assignment-instructions" }, assignment.instructions),
    el("div", { class: "ocs__links" }, toggle, remove),
    turnins);
}

async function loadAssignments() {
  const result = await call("/api/labrats/assignments", {}, "Assignments not loaded");
  if (!result?.ok) return;
  root.querySelector("[data-admin-assignments]").replaceChildren(...(result.data.length
    ? result.data.map(assignmentCard)
    : [emptyState("No assignments yet. Post one above.")]));
}

function initAssignments() {
  const form = root.querySelector('[data-admin-form="assignment"]');
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = {
      title: form.elements.title.value,
      instructions: form.elements.instructions.value,
      due_date: form.elements.due_date.value || null,
      is_open: form.elements.is_open.checked,
    };
    setStatus(form, "pending", "Posting...");
    const result = await call("/api/labrats/assignments", { method: "POST", body }, "Assignment not posted");
    if (result?.ok) {
      showErrors(form, {});
      form.reset();
      setStatus(form, "success", `Posted "${result.data.title}".`);
      loadAssignments();
    } else if (result?.status === 400) {
      showErrors(form, result.data.errors);
      setStatus(form, "error", "Please fix the highlighted fields.");
      focusFirstError(form);
    } else {
      setStatus(form, "error", "The assignment wasn't posted.");
    }
  });
}

// ---------- Start ----------

function showConsole(user) {
  currentUser = user;
  root.querySelector("[data-labrats-admin-signin]").hidden = true;
  consoleView.querySelector("[data-labrats-user-name]").textContent = user.name;
  consoleView.hidden = false;
  loadUsers();
  loadSubmissions();
  loadAssignments();
}

async function start() {
  initTabs();
  initUsers();
  initAssignments();
  initSignOutButtons(root);
  root.querySelectorAll("[data-admin-submission-filter]").forEach((select) => select.addEventListener("change", loadSubmissions));

  const signin = root.querySelector("[data-labrats-admin-signin]");
  initSignInForm(signin.querySelector("[data-labrats-signin]"), { requiredRole: "Admin", onSignedIn: showConsole });
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    if (!(error instanceof BackendUnavailableError)) throw error;
  }
  root.querySelector("[data-labrats-loading]").hidden = true;
  if (user?.role === "Admin") {
    showConsole(user);
  } else {
    signin.hidden = false;
  }
}

start();
