// Turns page HTML from the backend into DOM nodes, and fills in organization facts.
// Page bodies are written by LabRats staff (backend seed data), not by visitors; even so, scripts,
// inline event handlers, javascript: links, and iframes from unknown hosts are removed here.
import { fillTemplate, lookup, withBaseurl } from "./labrats-content-rules.js";

const BLOCKED_ELEMENTS = "script, style, object, embed, link, meta, base, form";
const IFRAME_HOSTS = ["www.youtube-nocookie.com", "player.vimeo.com", "drive.google.com", "donorbox.org"];
const URL_ATTRIBUTES = ["href", "src"];

function allowedIframe(src) {
  try {
    return IFRAME_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

// HTML string -> DocumentFragment, cleaned and with site links under the baseurl.
export function htmlFragment(html, baseurl = "") {
  const template = document.createElement("template");
  template.innerHTML = html || "";
  const fragment = template.content;
  fragment.querySelectorAll(BLOCKED_ELEMENTS).forEach((node) => node.remove());
  fragment.querySelectorAll("iframe").forEach((frame) => {
    if (!allowedIframe(frame.getAttribute("src"))) frame.remove();
  });
  fragment.querySelectorAll("*").forEach((node) => {
    for (const attribute of [...node.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || (URL_ATTRIBUTES.includes(name) && /^\s*javascript:/i.test(attribute.value))) {
        node.removeAttribute(attribute.name);
      } else if (URL_ATTRIBUTES.includes(name)) {
        node.setAttribute(attribute.name, withBaseurl(attribute.value, baseurl));
      }
    }
  });
  return fragment;
}

// Fills placeholders with facts from the backend's `org` setting:
//   <span data-labrats-org="phone">          text
//   data-labrats-org-href="{phone_href}"     an attribute (site paths get the baseurl)
//   data-labrats-phone                       the phone number forms quote in error messages
export function bindOrg(root, org, baseurl = "") {
  root.querySelectorAll("[data-labrats-org]").forEach((node) => {
    node.textContent = lookup(org, node.dataset.labratsOrg) ?? "";
  });
  root.querySelectorAll("*").forEach((node) => {
    for (const attribute of [...node.attributes]) {
      if (!attribute.name.startsWith("data-labrats-org-")) continue;
      const target = attribute.name.slice("data-labrats-org-".length);
      node.setAttribute(target, withBaseurl(fillTemplate(attribute.value, org), baseurl));
    }
  });
  root.querySelectorAll("[data-labrats-phone]").forEach((node) => {
    node.dataset.labratsPhone = org.phone || "";
  });
}
