
// Pure helpers for LabRats forms: turn form entries into a request payload and
// check it before sending. No DOM access, so tests can import this file directly.
// The Flask backend (model/labrats_inquiry.py) applies the same rules again.

// The list of rules for each kind of field (issue #15).
export const FIELD_RULES = {
  email: [
    { check: (value) => value.includes("@"), message: "An email address needs an @, like name@example.com." },
    { check: (value) => !/\s/.test(value), message: "An email address can't have spaces." },
    { check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: "Please enter an email address like name@example.com." },
  ],
  phone: [
    { check: (value) => value.replace(/\D/g, "").length >= 10, message: "Please enter a phone number with area code." },
  ],
};

// Returns the first validation error for a field, or "" if valid.
export function validateField(value, type) {
  const cleaned = String(value ?? "").trim();

  for (const rule of FIELD_RULES[type] || []) {
    if (!rule.check(cleaned)) {
      return rule.message;
    }
  }

  return "";
}

// Fields that may hold several values (checkbox groups).
const MULTI_VALUE_FIELDS = new Set(["programs"]);

const NAME_FIELDS = ["first_name", "last_name"];

// Required fields per form.
export const FORM_RULES = {
  contact: {
    required: {
      first_name: "first name",
      last_name: "last name",
      email: "email",
      interest: "what you're asking about",
    },
  },

  newsletter: {
    required: {
      first_name: "first name",
      last_name: "last name",
      email: "email",
    },
  },

  video_topic: {
    required: {
      first_name: "first name",
      last_name: "last name",
      email: "email",
      subjects: "subjects",
    },
  },

  partnership: {
    required: {
      company: "company name",
      first_name: "first name",
      last_name: "last name",
      job_title: "title",
      email: "business email",
    },
  },

  survey: {
    required: {
      first_name: "first name",
      last_name: "last name",
      email: "email",
      program: "program",
      rating: "rating",
    },
  },

  scholarship: {
    required: {
      student_first_name: "student's first name",
      student_last_name: "student's last name",
      student_grade: "grade",
      student_school: "school",
      parent_first_name: "parent's first name",
      parent_last_name: "parent's last name",
      email: "email",
      phone: "phone",
    },
  },
};

export function isKnownForm(kind) {
  return Object.hasOwn(FORM_RULES, kind);
}

// Turn form entries into a request payload.
export function collectPayload(entries) {
  const payload = {};

  for (const [name, rawValue] of entries) {
    const value = typeof rawValue === "string"
      ? rawValue.trim()
      : rawValue;

    if (MULTI_VALUE_FIELDS.has(name)) {
      payload[name] = [...(payload[name] || []), value];
    } else {
      payload[name] = value;
    }
  }

  return payload;
}

// Returns { fieldName: message } for every problem.
export function validatePayload(kind, payload) {
  if (!isKnownForm(kind)) {
    throw new Error(`Unknown LabRats form "${kind}"`);
  }

  const errors = {};

  // Check required fields.
  for (const [field, label] of Object.entries(FORM_RULES[kind].required)) {
    if (!payload[field]) {
      errors[field] = `Please enter your ${label}.`;
    }
  }

  // Validate email and phone fields.
  for (const type of Object.keys(FIELD_RULES)) {
    const message = payload[type]
      ? validateField(payload[type], type)
      : "";

    if (message) {
      errors[type] = message;
    }
  }

  // Scholarship-specific validation.
  if (kind === "scholarship") {
    Object.assign(errors, validateScholarship(payload));
  }

  // Survey-specific validation.
  if (kind === "survey") {
    const allowedPrograms = [
      "After-School STEM",
      "Summer Camps",
      "Workshops",
    ];

    const allowedRatings = ["1", "2", "3", "4", "5"];

    if (!allowedPrograms.includes(payload.program)) {
      errors.program = "Please select a valid program.";
    }

    if (!allowedRatings.includes(payload.rating)) {
      errors.rating = "Please select a rating from 1 to 5.";
    }
  }

  return errors;
}

function validateScholarship(payload) {
  const errors = {};

  if (!payload.programs || payload.programs.length === 0) {
    errors.programs = "Choose at least one program.";
  }

  if (!payload.income_under_limit) {
    errors.eligibility = "Please answer the household income question.";
  } else if (
    payload.income_under_limit !== "yes" &&
    payload.military_family !== "yes"
  ) {
    errors.eligibility =
      "Scholarships are for households under $89,000 a year or military families. " +
      "If your situation is different, contact us and we will talk it through.";
  }

  return errors;
}

// First name to greet the person with after a successful submission.
export function greetingName(payload) {
  const field = ["parent_first_name", ...NAME_FIELDS, "name"].find(
    (name) => payload[name]
  );

  return field ? payload[field] : "";
}
