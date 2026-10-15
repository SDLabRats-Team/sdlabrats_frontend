// Entry point for every LabRats page (loaded as a module from _layouts/sdlabrats.html).
// The frontend stores no content: this asks the backend for the page bundle
// (GET /api/labrats/page?path=...) and renders the header, page, and footer from it.
import { baseurl } from "../../api/config.js";
import { apiRequest, BackendUnavailableError } from "./labrats-api.js";
import { initForms } from "./labrats-forms.js";
import { readStorage, writeStorage } from "./labrats-storage.js";
import { initSessionLink } from "./labrats-auth.js";
import { bindOrg } from "./labrats-html.js";
import { pagePathFrom, withBaseurl } from "./labrats-content-rules.js";
import { renderPlaceholders } from "./labrats-widgets.js";
import { renderAnnouncement, renderFooter, renderHead, renderHeader, renderMain, renderUnavailable } from "./labrats-templates.js";

const THEME_KEY = "labrats-theme";
const DISMISSED_PREFIX = "labrats-dismissed-";

function initMenu() {
  const header = document.querySelector(".labrats__header");
  const toggle = header?.querySelector("[data-labrats-menu-toggle]");
  if (!toggle) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    header.toggleAttribute("data-open", open);
  };

  header.setAttribute("data-menu-ready", "");
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.hasAttribute("data-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function initAnnouncement() {
  const notice = document.querySelector("[data-labrats-announcement]");
  if (!notice) return;
  const key = DISMISSED_PREFIX + notice.dataset.labratsAnnouncement;
  if (readStorage(key)) {
    notice.hidden = true;
    return;
  }
  notice.querySelector("[data-labrats-dismiss]")?.addEventListener("click", () => {
    notice.hidden = true;
    writeStorage(key, "1");
  });
}

function initThemeToggle() {
  const toggle = document.querySelector("[data-labrats-theme-toggle]");
  const saved = readStorage(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    document.body.dataset.theme = saved;
  }
  if (!toggle) return;

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  toggle.checked = document.body.dataset.theme ? document.body.dataset.theme === "dark" : prefersDark;
  toggle.addEventListener("change", () => {
    const theme = toggle.checked ? "dark" : "light";
    document.body.dataset.theme = theme;
    writeStorage(THEME_KEY, theme);
  });
}

// Marks the "On this page" link for the section nearest the top of the viewport.
function initContents() {
  const links = [...document.querySelectorAll("[data-labrats-contents] a")];
  const sections = links.map((link) => document.getElementById(link.hash.slice(1))).filter(Boolean);
  if (sections.length === 0 || !("IntersectionObserver" in window)) return;

  const setCurrent = (id) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) {
        link.setAttribute("aria-current", "true");
        link.scrollIntoView({ block: "nearest", inline: "nearest" });
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setCurrent(visible[0].target.id);
    },
    { rootMargin: "-140px 0px -60% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}

// Forms are interface, so their markup ships with the layout as <template>s; their choices
// (program interests, scholarship programs) come from the bundle.
function fillForms(root, ctx) {
  root.querySelectorAll("[data-labrats-form-slot]").forEach((slot) => {
    const template = document.getElementById(`labrats-form-${slot.dataset.labratsFormSlot}`);
    if (template) slot.replaceWith(template.content.cloneNode(true));
  });
  root.querySelectorAll('select[name="interest"]').forEach((select) => {
    const other = select.querySelector('option[value="other"]');
    ctx.programs.forEach((program) => select.insertBefore(new Option(program.short, program.slug), other));
  });
  root.querySelectorAll('[data-labrats-choices="programs"]').forEach((group) => {
    group.replaceChildren(...ctx.site.scholarship_programs.map((choice) => {
      const label = document.createElement("label");
      const input = Object.assign(document.createElement("input"), { type: "checkbox", name: "programs", value: choice.value });
      label.append(input, ` ${choice.label}`);
      return label;
    }));
  });
  root.querySelectorAll('input[name="source_page"]').forEach((input) => { input.value = ctx.page.path; });
}

// The page bundle for this address; an unknown address gets the not-found page.
async function loadBundle() {
  const path = pagePathFrom(window.location.pathname, baseurl);
  const result = await apiRequest(`/api/labrats/page?path=${encodeURIComponent(path)}`);
  if (result.ok) return result.data;
  if (result.status === 404) {
    const missing = await apiRequest(`/api/labrats/page?path=${encodeURIComponent("/404.html")}`);
    if (missing.ok) return missing.data;
  }
  throw new BackendUnavailableError(`Page bundle failed (${result.status})`);
}

function renderSite(bundle) {
  const ctx = { ...bundle, baseurl, url: (path) => withBaseurl(path, baseurl) };
  const main = document.getElementById("main");
  const app = main.querySelector("[data-labrats-app]");
  renderHead(ctx);
  document.querySelector("[data-labrats-announcement-slot]").replaceChildren(renderAnnouncement(ctx) || "");
  renderHeader(document.querySelector(".labrats__header"), ctx);
  renderFooter(document.querySelector(".labrats__footer"), ctx);
  main.replaceChildren(...renderMain(ctx, app && app.childElementCount ? app : null).filter(Boolean));
  [main, document.querySelector(".labrats__footer")].forEach((root) => {
    renderPlaceholders(root, ctx);
    fillForms(root, ctx);
  });
  bindOrg(document.body, ctx.site.org, baseurl);
  document.body.toggleAttribute("data-labrats-ready", true);
  main.removeAttribute("aria-busy");
  if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
}

async function start() {
  const main = document.getElementById("main");
  try {
    renderSite(await loadBundle());
  } catch (error) {
    if (!(error instanceof BackendUnavailableError)) throw error;
    main.replaceChildren(renderUnavailable(() => window.location.reload()));
    main.removeAttribute("aria-busy");
    return;
  }
  initContents();
  initAnnouncement();
  initForms();
  initSessionLink();
}

initThemeToggle();
initMenu();
start();
