// Sign-in state for LabRats pages, built on the backend's existing JWT cookie endpoints:
// POST /api/authenticate (sign in), GET /api/id (who am I), DELETE /api/authenticate (sign out).
import { baseurl } from "../../api/config.js";
import { apiRequest, BackendUnavailableError } from "./labrats-api.js";
import { safeNextPath, homeForRole, sessionLink } from "./labrats-session-rules.js";
import { readStorage, writeStorage, removeStorage } from "./labrats-storage.js";

// Set while this browser holds a sign-in, so pages only ask the backend who is signed in
// when someone might be. Visitors who never sign in make no sign-in requests.
const SIGNED_IN_KEY = "labrats-signed-in";

// Who holds the sign-in cookie: { user } when signed in, { inactive: true } when the password
// was right but the account still needs an admin to activate it (upstream Flask answers 403).
async function readSession() {
  const { ok, status, data } = await apiRequest("/api/id");
  const user = ok && data ? data : null;
  if (user) {
    writeStorage(SIGNED_IN_KEY, "1");
  } else {
    removeStorage(SIGNED_IN_KEY);
  }
  return { user, inactive: status === 403 };
}

// The signed-in user ({ uid, name, role, ... }) or null when nobody is signed in.
export async function getCurrentUser() {
  return (await readSession()).user;
}

export async function signOut() {
  await apiRequest("/api/authenticate", { method: "DELETE" }).catch(() => {});
  removeStorage(SIGNED_IN_KEY);
  window.location.assign(`${baseurl}/sign-in/`);
}

// Points the header's "Sign in" link at the signed-in person's page.
export async function initSessionLink() {
  const link = document.querySelector("[data-labrats-session-link]");
  if (!link || !readStorage(SIGNED_IN_KEY)) return;
  try {
    const { href, label } = sessionLink(await getCurrentUser(), baseurl);
    link.href = href;
    link.textContent = label;
  } catch (error) {
    // Backend unreachable: the link keeps pointing at the sign-in page.
    if (!(error instanceof BackendUnavailableError)) throw error;
  }
}

// The LabRats phone number printed into the sign-in form (signin-form.html).
function phoneFor(form) {
  return form.querySelector("[data-labrats-phone]")?.dataset.labratsPhone || "LabRats";
}

function setStatus(form, state, message) {
  const status = form.querySelector(".labrats__form-status");
  status.dataset.state = state;
  status.textContent = message;
}

// Wires a sign-in form (markup from signin-form.html). `onSignedIn(user)` decides what happens
// next; by default the person goes to ?next= (if safe) or their role's home page.
export function initSignInForm(form, { requiredRole = form.dataset.requiredRole || "", onSignedIn } = {}) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = form.elements.uid.value.trim();
    const password = form.elements.password.value;
    if (!uid || !password) {
      setStatus(form, "error", "Enter your username and password.");
      (uid ? form.elements.password : form.elements.uid).focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setStatus(form, "pending", "Signing in...");
    try {
      const { ok, status } = await apiRequest("/api/authenticate", { method: "POST", body: { uid, password } });
      if (!ok) {
        setStatus(form, "error", status === 401 ? "That username and password don't match." : "Sign-in failed. Please try again.");
        return;
      }
      const { user, inactive } = await readSession();
      if (inactive) {
        setStatus(form, "error", `This account isn't active yet. LabRats staff need to switch it on; call ${phoneFor(form)} if you're waiting.`);
        return;
      }
      if (!user) {
        setStatus(form, "error", "Signed in, but this browser blocked the sign-in cookie. Allow cookies for this site and try again.");
        return;
      }
      if (requiredRole && user.role !== requiredRole) {
        setStatus(form, "error", `This page needs a ${requiredRole} account. You're signed in as ${user.name}.`);
        return;
      }
      form.reset();
      if (onSignedIn) {
        onSignedIn(user);
      } else {
        const next = safeNextPath(new URLSearchParams(window.location.search).get("next"), baseurl);
        window.location.assign(next || homeForRole(user.role, baseurl));
      }
    } catch (error) {
      if (!(error instanceof BackendUnavailableError)) throw error;
      setStatus(form, "error", `We couldn't reach the sign-in server. Please try again later or call ${phoneFor(form)}.`);
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
  });
}

export function initSignOutButtons(root = document) {
  root.querySelectorAll("[data-labrats-sign-out]").forEach((button) => {
    button.addEventListener("click", signOut);
  });
}
