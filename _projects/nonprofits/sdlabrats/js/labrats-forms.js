
 // Sends LabRats forms (contact, scholarship, partnership, video topics,
 // newsletter, survey) to the Flask backend and shows field errors and
 // a status line. Markup comes from the form-*.html includes;
 // rules live in labrats-form-data.js.

import { pythonURI, fetchOptions } from "../../api/config.js";
import { collectPayload, validatePayload, greetingName } from "./labrats-form-data.js";

const INQUIRY_ENDPOINT = `${pythonURI}/api/labrats/inquiries`;

const SUCCESS_MESSAGES = {
  contact: "We got your message, and we'll reply by email.",
  scholarship: "We'll email you about using your scholarship. If you don't hear from us within 2 days, please call.",
  partnership: "We'll send partnership details to your email.",
  video_topic: "Your idea is on our list for the next videos.",
  newsletter: "You're on the list.",
  survey: "Your feedback has been submitted successfully.",
};

function successMessage(kind, payload) {
  const name = greetingName(payload);
  return `${name ? `Thanks, ${name}.` : "Thanks."} ${SUCCESS_MESSAGES[kind]}`;
}

// Error keys that belong to a group of controls rather than one input.
const GROUP_ERRORS = { programs: "programs", eligibility: "eligibility" };

export function initForms(root = document) {
  root.querySelectorAll("form[data-labrats-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitForm(form);
    });
  });
}

async function submitForm(form) {
  const kind = form.dataset.labratsForm;
  const payload = collectPayload(new FormData(form));
  const errors = validatePayload(kind, payload);

  showErrors(form, errors);
  if (Object.keys(errors).length > 0) {
    setStatus(form, "error", "Please fix the highlighted fields.");
    focusFirstError(form);
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  setStatus(form, "pending", "Sending...");

  try {
    const response = await fetch(INQUIRY_ENDPOINT, {
      ...fetchOptions,
      method: "POST",
      body: JSON.stringify({ form: kind, ...payload }),
    });
    const body = await response.json().catch(() => ({}));

    if (response.status === 400 && body.errors) {
      showErrors(form, body.errors);
      setStatus(form, "error", "Please fix the highlighted fields.");
      focusFirstError(form);
      return;
    }

    if (!response.ok) {
      throw new Error(`Inquiry request failed with status ${response.status}`);
    }

    if (form.dataset.successUrl) {
      window.location.assign(form.dataset.successUrl);
      return;
    }

    form.reset();
    setStatus(form, "success", successMessage(kind, payload));
  } catch (error) {
    console.error("LabRats form could not be sent:", error);
    const phone = form.querySelector("[data-labrats-phone]")?.dataset.labratsPhone || "";
    setStatus(
      form,
      "error",
      `We couldn't send this right now. Please try again or call ${phone}.`.trim()
    );
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}

export function showErrors(form, errors) {
  form.querySelectorAll(".labrats__field-error").forEach((element) => {
    element.hidden = true;
    element.textContent = "";
  });

  form.querySelectorAll("[aria-invalid]").forEach((element) =>
    element.removeAttribute("aria-invalid")
  );

  for (const [field, message] of Object.entries(errors)) {
    const target = GROUP_ERRORS[field]
      ? form.querySelector(`[data-labrats-group="${GROUP_ERRORS[field]}"]`)
      : form.querySelector(`[name="${field}"]`);

    if (!target) continue;

    target.setAttribute("aria-invalid", "true");

    const describedBy = (target.getAttribute("aria-describedby") || "").split(" ");
    const errorElement = describedBy
      .map((id) => id && form.querySelector(`#${CSS.escape(id)}`))
      .find((element) => element && element.classList.contains("labrats__field-error"));

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = false;
    }
  }
}

export function focusFirstError(form) {
  const invalid = form.querySelector('[aria-invalid="true"]');
  if (!invalid) return;

  const focusable = invalid.matches("fieldset")
    ? invalid.querySelector("input")
    : invalid;

  focusable?.focus();
}

export function setStatus(form, state, message) {
  const status = form.querySelector(".labrats__form-status");
  status.dataset.state = state;
  status.textContent = message;
}
