// Builds the site chrome and each page template from the backend's page bundle.
// The layout (_layouts/sdlabrats.html) is an empty shell; nothing here is stored in the frontend.
import { el } from "./labrats-dom.js";
import { htmlFragment } from "./labrats-html.js";
import { documentTitle, sectionFor, showAnnouncement } from "./labrats-content-rules.js";
import { blockNode, campDays, donorbox, sessionList, sessionTable } from "./labrats-widgets.js";

const ACCOUNT_PATHS = ["/sign-in/", "/account/", "/admin/"];

function setMeta(name, content) {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = el("meta", { name });
    document.head.append(tag);
  }
  tag.setAttribute("content", content);
}

export function renderHead(ctx) {
  const { page, site } = ctx;
  document.title = documentTitle(page, site.org);
  setMeta("description", page.description || site.org.description);
  if (page.noindex || page.template === "redirect") setMeta("robots", "noindex");
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = el("link", { rel: "canonical" });
    document.head.append(canonical);
  }
  canonical.href = `${site.org.url}${page.redirect_to || page.path}`;
}

export function renderAnnouncement(ctx) {
  const notice = ctx.site.announcement;
  if (!showAnnouncement(notice, ctx.page.path)) return null;
  return el("aside", { class: "labrats__announcement", "aria-label": "Announcement", dataset: { labratsAnnouncement: notice.id } },
    el("div", { class: "labrats__wrap labrats__announcement-row" },
      el("p", {}, notice.text, notice.link_text ? " " : null,
        notice.link_text ? el("a", { href: ctx.url(notice.url) }, notice.link_text) : null),
      el("button", { type: "button", class: "labrats__announcement-close", dataset: { labratsDismiss: "" } },
        el("span", { class: "labrats__visually-hidden" }, "Dismiss announcement"),
        el("span", { "aria-hidden": "true" }, "×"))));
}

// Fills the header skeleton: section links, the current-page markers, and the phone link.
export function renderHeader(header, ctx) {
  const { page, site } = ctx;
  header.querySelector("[data-labrats-sections]").replaceChildren(...site.sections.map((section) => el("li", {},
    el("a", {
      href: ctx.url(section.url),
      "aria-current": page.section === section.id ? (page.path === section.url ? "page" : "true") : undefined,
    }, section.title))));
  const brand = header.querySelector(".labrats__brand");
  if (page.path === "/") brand.setAttribute("aria-current", "page");
  const signin = header.querySelector("[data-labrats-session-link]");
  if (ACCOUNT_PATHS.includes(page.path)) signin.setAttribute("aria-current", "page");
}

// Fills the footer skeleton: about text, site map, and social links. Org facts are bound later.
export function renderFooter(footer, ctx) {
  const { site } = ctx;
  footer.querySelector("[data-labrats-footer-about]").replaceChildren(blockNode("footer_about", ctx));
  footer.querySelector("[data-labrats-footer-signup]").replaceChildren(blockNode("footer_signup", ctx));
  footer.querySelector("[data-labrats-sitemap]").replaceChildren(...site.sections.map((section) => el("div", {},
    el("h2", {}, section.title),
    el("ul", {}, [...section.pages, ...(section.anchors || [])].map((item) =>
      el("li", {}, el("a", { href: ctx.url(item.url) }, item.title)))))));
  footer.querySelector("[data-labrats-social]").replaceChildren(...(site.social || []).map((profile) =>
    el("li", {}, el("a", { href: profile.url, rel: "noopener" }, profile.name))));
  footer.querySelector("[data-labrats-year]").textContent = String(new Date().getFullYear());
}

// ---------- Page templates ----------

function pageHeader(ctx) {
  const { page } = ctx;
  const { section, activeUrl } = sectionFor(page, ctx.site.sections);
  return el("div", { class: "labrats__page-header" }, el("div", { class: "labrats__wrap" },
    section && section.pages.length > 1
      ? el("nav", { class: "labrats__tabs", "aria-label": section.title }, el("ul", {}, section.pages.map((item) => el("li", {},
        el("a", {
          href: ctx.url(item.url),
          "aria-current": item.url === page.path ? "page" : item.url === activeUrl ? "true" : undefined,
        }, item.title)))))
      : null,
    el("h1", {}, page.heading || page.title),
    page.lead ? el("p", { class: "ocs__lead" }, page.lead) : null));
}

function contentsBar(page) {
  if (!page.contents?.length) return null;
  return el("nav", { class: "labrats__contents", "aria-label": "On this page", dataset: { labratsContents: "" } },
    el("div", { class: "labrats__wrap" }, el("ul", {}, page.contents.map((item) =>
      el("li", {}, el("a", { href: `#${item.id}` }, item.title))))));
}

function body(ctx) {
  return htmlFragment(ctx.page.body, ctx.baseurl);
}

function helpAndQuestions(ctx) {
  return [ctx.page.help === "none" ? null : blockNode(`help_paying_${ctx.page.help || "families"}`, ctx), blockNode("questions", ctx)];
}

function wrap(...children) {
  return el("div", { class: "labrats__wrap labrats__body" }, ...children);
}

function programTemplate(ctx) {
  const { page } = ctx;
  const program = ctx.programs.find((item) => item.slug === page.program) || {};
  const signup = page.signup || {};
  return [pageHeader(ctx), wrap(
    el("section", { class: "labrats__section labrats__split labrats__split--center", "aria-label": "Key facts" },
      el("dl", { class: "labrats__facts" }, (page.facts || []).map((fact) => el("div", {}, el("dt", {}, fact.label), el("dd", {}, fact.value)))),
      el("figure", { class: "labrats__figure" }, el("img", {
        src: ctx.url(page.photo || program.image), alt: page.photo_alt || program.image_alt || "", width: 800, height: 533, loading: "eager",
      }))),
    body(ctx),
    el("section", { class: "labrats__section", "aria-labelledby": "signup-title" },
      el("h2", { id: "signup-title" }, signup.heading || "Schedule and sign-up"),
      signup.text ? el("p", {}, signup.text) : null,
      page.sessions ? sessionList({ program: page.program, compact: page.compact_sessions }, ctx) : null,
      signup.url ? el("div", { class: "ocs__links" },
        el("a", { class: `ocs__btn ${page.sessions ? "accent" : "signal fill"}`, href: ctx.url(signup.url) }, signup.link_text)) : null),
    ...helpAndQuestions(ctx))];
}

function registrationTemplate(ctx) {
  const { page, site } = ctx;
  const session = ctx.session || { term: page.title, times: [] };
  const closed = session.status !== "open";
  const address = site.org.address;
  return [pageHeader(ctx), wrap(
    closed ? el("div", { class: "labrats__notice", role: "note" },
      el("p", {}, el("strong", {}, `Registration for ${session.term} has closed.`), " These dates have passed."),
      el("p", {}, el("a", { href: ctx.url("/schedule/") }, "See what's open now"))) : null,
    el("div", { class: "labrats__split labrats__split--narrow-aside" },
      el("div", {},
        el("section", { class: "labrats__section", "aria-labelledby": "session-details" },
          el("h2", { id: "session-details", class: "labrats__visually-hidden" }, "Session details"),
          el("p", { class: "labrats__meta" },
            session.grades ? el("span", { class: "labrats__grade" }, `Grades ${session.grades}`) : null,
            el("span", {}, `${page.location || address.name}, ${page.address || address.street}, ${address.city}`)),
          body(ctx),
          session.times?.length ? [el("h3", {}, `${session.term} schedule`), sessionTable(session)] : null),
        page.day_plans ? el("section", { class: "labrats__section", "aria-labelledby": "camp-day" },
          el("h2", { id: "camp-day" }, "A day at camp"), campDays(page.day_plans, ctx)) : null,
        page.camp_why ? blockNode("camp_why", ctx) : null),
      session.donorbox_campaign && !closed ? el("aside", { "aria-labelledby": "register-title" },
        el("h2", { id: "register-title" }, page.register_heading || "Register"),
        donorbox({ campaign: session.donorbox_campaign }, ctx)) : null),
    ...helpAndQuestions(ctx))];
}

function archiveTemplate(ctx) {
  const { page } = ctx;
  return [pageHeader(ctx), wrap(
    el("div", { class: "labrats__notice", role: "note" },
      el("p", {}, el("strong", {}, page.archive_note)),
      page.current_url ? el("p", {}, el("a", { href: ctx.url(page.current_url) }, page.current_title)) : null),
    body(ctx))];
}

function redirectTemplate(ctx) {
  const target = ctx.url(ctx.page.redirect_to);
  window.location.replace(target);
  return [el("div", { class: "labrats__wrap labrats__redirect" },
    el("p", {}, "This page has moved to ", el("a", { href: target }, ctx.page.redirect_title || ctx.page.redirect_to), "."))];
}

// The nodes for <main>. Pages with their own interface (sign-in, account, admin) keep it below
// the heading: `app` is that element from the shell, or null.
export function renderMain(ctx, app) {
  switch (ctx.page.template) {
    case "home": return [body(ctx)];
    case "program": return programTemplate(ctx);
    case "registration": return registrationTemplate(ctx);
    case "archive": return archiveTemplate(ctx);
    case "redirect": return redirectTemplate(ctx);
    default: return [pageHeader(ctx), contentsBar(ctx.page), app || wrap(body(ctx))];
  }
}

// Shown when the page bundle can't be loaded at all.
export function renderUnavailable(retry) {
  return el("div", { class: "labrats__wrap labrats__body" }, el("div", { class: "labrats__notice", role: "alert" },
    el("p", {}, el("strong", {}, "We couldn't load this page.")),
    el("p", {}, "The LabRats server didn't answer. Check your connection and try again in a moment."),
    el("div", { class: "ocs__links" }, el("button", { class: "ocs__btn signal fill", type: "button", onclick: retry }, "Try again"))));
}
