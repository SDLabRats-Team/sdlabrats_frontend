// Lists and embeds built from the backend's page bundle. Page HTML marks where each goes with
// data-labrats-widget="name" (plus data-* options); shared HTML comes from data-labrats-block="key".
// `ctx` is { site, page, session, programs, sessions, url } (see labrats-site.js).
import { el, table } from "./labrats-dom.js";
import { htmlFragment } from "./labrats-html.js";
import { closedSessions, openSessions, programsFor, sessionDates } from "./labrats-content-rules.js";

// Shared HTML from the `blocks` setting (help paying, camp benefits, questions, footer text).
export function blockNode(key, ctx) {
  return htmlFragment(ctx.site.blocks?.[key] || "", ctx.baseurl);
}

export function sessionTable(session) {
  if (!session.times?.length) return null;
  return table(`${session.term} meeting times${session.grades ? `, grades ${session.grades}` : ""}`,
    ["Day", "Time", "Dates"], session.times.map((row) => [row.day, row.time, row.dates]));
}

export function campDays(plans, ctx) {
  const keys = (Array.isArray(plans) ? plans : String(plans || "").split(",")).map((key) => key.trim()).filter(Boolean);
  const days = keys.map((key) => ctx.site.camp_days?.[key]).filter(Boolean);
  if (!days.length) return null;
  return el("div", { class: "labrats__day-plans" }, days.map((plan) => el("div", {},
    el("h3", {}, plan.title),
    el("dl", { class: "labrats__day" }, plan.rows.flatMap(([time, activity]) => [el("dt", {}, time), el("dd", {}, activity)])))));
}

export function donorbox({ campaign, embed, title }, ctx) {
  const parts = campaign
    ? [el("script", { src: "https://donorbox.org/widgets.js?language=en-us", type: "module", async: true }),
      el("dbox-widget", { type: "event", campaign })]
    : [el("script", { src: "https://donorbox.org/widget.js", paypalExpress: "false", defer: true }),
      el("iframe", {
        src: `https://donorbox.org/embed/${encodeURIComponent(embed)}?language=en-us`, title: title || "Donation form",
        name: "donorbox", height: "900", allow: "payment", allowpaymentrequest: "allowpaymentrequest",
        seamless: "seamless", loading: "lazy", scrolling: "no",
      })];
  return el("div", { class: "labrats__widget" }, parts,
    el("p", { class: "labrats__hint" }, "Payments are processed by Donorbox. Trouble with the form? Call ",
      el("a", { href: ctx.site.org.phone_href }, ctx.site.org.phone), "."));
}

export function sessionList({ program, compact, headingLevel = 3 }, ctx) {
  const sessions = openSessions(ctx.sessions, program);
  if (!sessions.length) {
    return el("p", {}, "No sessions are open for registration right now. Join the email list at the bottom of this page and we'll tell you when the next ones open.");
  }
  if (compact) {
    return table("Open sessions", ["Session", "Grades", "Dates", "Time", el("span", { class: "labrats__visually-hidden" }, "Register")],
      sessions.map((session) => [session.term, session.grades || "", sessionDates(session), session.times?.[0]?.time || "",
        el("a", { href: ctx.url(session.path) }, "Register",
          el("span", { class: "labrats__visually-hidden" }, `: ${session.term}, grades ${session.grades}`))]));
  }
  return el("div", { class: "labrats__sessions" }, sessions.map((session) => el("article", { class: "labrats__session" },
    el("div", { class: "labrats__session-head" },
      el(`h${headingLevel}`, {}, session.term),
      session.grades ? el("span", { class: "labrats__grade" }, `Grades ${session.grades}`) : null),
    session.summary ? el("p", {}, session.summary) : null,
    sessionTable(session),
    el("div", { class: "ocs__links" },
      el("a", { class: "ocs__btn signal fill", href: ctx.url(session.path) },
        `Register: ${session.term}${session.grades ? `, grades ${session.grades}` : ""}`)))));
}

const WIDGETS = {
  "program-list": (options, ctx) => el("ul", { class: "labrats__programs" },
    programsFor(ctx.programs, options.audience).map((program) => el("li", { class: "labrats__program" },
      el("img", { src: ctx.url(program.image), alt: "", width: 400, height: 300, loading: "lazy" }),
      el("div", {},
        el(`h${options.headingLevel || 3}`, {}, el("a", { href: ctx.url(program.path) }, program.name)),
        el("p", { class: "labrats__meta" }, el("span", { class: "labrats__grade" }, `Grades ${program.grades}`), el("span", {}, program.when)),
        el("p", {}, program.summary))))),

  "session-list": (options, ctx) => sessionList({ program: options.program, compact: options.compact === "true" }, ctx),

  "past-sessions": (options, ctx) => {
    const sessions = closedSessions(ctx.sessions, options.program);
    return el("details", {},
      el("summary", {}, `Past ${options.program} months (${sessions.length})`),
      el("ul", { class: "labrats__list labrats__columns" }, sessions.map((session) => el("li", {},
        el("a", { href: ctx.url(session.path) }, `${session.term}${session.grades ? `, grades ${session.grades}` : ""}`)))));
  },

  "camp-days": (options, ctx) => campDays(options.plans, ctx),

  "press-clippings": (_, ctx) => el("div", { class: "ocs__grid ocs__grid--card" }, (ctx.page.clippings || []).map((clip) => {
    const src = ctx.url(`/images/projects/sdlabrats/press/${String(clip.file).toLowerCase()}.jpg`);
    return el("div", { class: "ocs__grid-cell" }, el("a", { class: "labrats__clipping", href: src },
      el("img", { src, alt: "", loading: "lazy", width: 232, height: 300 }),
      el("span", {}, clip.outlet), el("small", {}, clip.date)));
  })),

  flyers: (_, ctx) => el("ul", { class: "labrats__videos labrats__videos--compact" }, (ctx.page.flyers || []).map((id, index) => el("li", {},
    el("div", { class: "labrats__embed labrats__embed--document" },
      el("iframe", { src: `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`, title: `LabRats flyer ${index + 1}`, loading: "lazy" })),
    el("p", {}, el("a", { href: `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`, rel: "noopener" }, `Open flyer ${index + 1}`))))),

  "social-links": (_, ctx) => el("span", {}, (ctx.site.social || []).flatMap((profile, index) => [
    index ? ", " : null, el("a", { href: profile.url, rel: "noopener" }, profile.name)])),

  donorbox: (options, ctx) => donorbox(options, ctx),

  lost: (_, ctx) => el("div", {},
    el("div", { class: "ocs__links" },
      el("a", { class: "ocs__btn signal fill", href: ctx.url("/schedule/") }, "Schedule and registration"),
      el("a", { class: "ocs__btn accent", href: ctx.url("/") }, "Home page")),
    el("section", { class: "labrats__section" },
      el("h2", {}, "Popular pages"),
      el("ul", { class: "labrats__list labrats__columns" },
        ctx.site.sections.map((section) => el("li", {}, el("a", { href: ctx.url(section.url) }, section.title))),
        el("li", {}, el("a", { href: ctx.url("/scholarships/") }, "Scholarships"))),
      el("p", {}, "Still stuck? Call ", el("a", { href: ctx.site.org.phone_href }, ctx.site.org.phone), "."))),
};

// Replaces every block and widget placeholder inside `root`.
export function renderPlaceholders(root, ctx) {
  root.querySelectorAll("[data-labrats-block]").forEach((node) => node.replaceWith(blockNode(node.dataset.labratsBlock, ctx)));
  root.querySelectorAll("[data-labrats-widget]").forEach((node) => {
    const build = WIDGETS[node.dataset.labratsWidget];
    const built = build ? build({ ...node.dataset }, ctx) : null;
    if (built) {
      node.replaceWith(built);
    } else {
      node.remove();
    }
  });
}
