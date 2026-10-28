import assert from "node:assert/strict";
import test from "node:test";

const { collectPayload, validatePayload, greetingName, isKnownForm, validateField } = await import(
  "../_projects/nonprofits/sdlabrats/js/labrats-form-data.js"
);

const scholarship = {
  student_first_name: "Leo", student_last_name: "Lopez", student_grade: "3", student_school: "Park Elementary",
  parent_first_name: "Ana", parent_last_name: "Lopez", email: "ana@example.com", phone: "(760) 555-0100",
  programs: ["afterschool"], income_under_limit: "yes",
};

test("collectPayload trims values and gathers checkbox groups into arrays", () => {
  const payload = collectPayload([
    ["first_name", "  Ana "],
    ["programs", "afterschool"],
    ["programs", "winter-camps"],
  ]);
  assert.deepEqual(payload, { first_name: "Ana", programs: ["afterschool", "winter-camps"] });
});

test("contact form reports each missing required field", () => {
  const errors = validatePayload("contact", { email: "ana@example.com" });
  assert.deepEqual(Object.keys(errors).sort(), ["first_name", "interest", "last_name"]);
});

test("email must look like an address", () => {
  const errors = validatePayload("newsletter", { first_name: "Ana", last_name: "Lopez", email: "ana" });
  assert.ok(errors.email);
});

test("scholarship qualifies with income under the limit", () => {
  assert.deepEqual(validatePayload("scholarship", scholarship), {});
});

test("scholarship qualifies as a military family even above the income limit", () => {
  const errors = validatePayload("scholarship", { ...scholarship, income_under_limit: "no", military_family: "yes" });
  assert.deepEqual(errors, {});
});

test("scholarship without either qualifying answer explains the rule", () => {
  const errors = validatePayload("scholarship", { ...scholarship, income_under_limit: "no", military_family: "no" });
  assert.match(errors.eligibility, /\$89,000/);
});

test("scholarship needs a program and a full phone number", () => {
  const errors = validatePayload("scholarship", { ...scholarship, programs: [], phone: "555-0100" });
  assert.ok(errors.programs);
  assert.ok(errors.phone);
});

test("unknown forms are a programming error", () => {
  assert.equal(isKnownForm("pottery_class"), false);
  assert.throws(() => validatePayload("pottery_class", {}), /Unknown LabRats form/);
});

test("greeting prefers the parent's name on scholarship applications", () => {
  assert.equal(greetingName(scholarship), "Ana");
  assert.equal(greetingName({ first_name: "Sam" }), "Sam");
  assert.equal(greetingName({}), "");
});

// validateField(value, type), issue #15: each kind of field is checked against its list of rules.
test('"hello" fails as an email and "name@example.com" passes', () => {
  assert.equal(validateField("hello", "email"), "An email address needs an @, like name@example.com.");
  assert.equal(validateField("name@example.com", "email"), "");
});

test("email rules run in order and report the first failure", () => {
  assert.equal(validateField("na me@example.com", "email"), "An email address can't have spaces.");
  assert.equal(validateField("name@example", "email"), "Please enter an email address like name@example.com.");
  assert.equal(validateField("a@b.c@d", "email"), "Please enter an email address like name@example.com.");
  assert.equal(validateField("  name@example.com  ", "email"), "", "outside spaces are trimmed first");
});

test("a phone number needs 10 digits", () => {
  assert.equal(validateField("555-0100", "phone"), "Please enter a phone number with area code.");
  assert.equal(validateField("(760) 555-0100", "phone"), "");
});

test("a kind of field with no rules always passes", () => {
  assert.equal(validateField("anything", "message"), "");
});

// Website survey: three boxes, name optional, at least one answer.
test("an empty survey asks for at least one answer", () => {
  assert.deepEqual(validatePayload("survey", { name: "Ana" }), { liked: "Tell us what you liked or what we could improve." });
});

test("a survey with one answer and no name is valid", () => {
  assert.deepEqual(validatePayload("survey", { improvements: "Bigger photos" }), {});
  assert.equal(greetingName({ name: "Ana", liked: "Menus" }), "Ana");
  assert.equal(greetingName({ liked: "Menus" }), "");
});
