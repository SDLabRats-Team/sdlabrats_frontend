// Builds DOM nodes for the account and admin pages. Strings become text nodes, never HTML,
// so names, responses, and messages typed by users can't inject markup.

// el("p", { class: "x", dataset: { id: 3 }, onclick: fn }, "text", childNode, ...)
export function el(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (name === "dataset") {
      Object.assign(node.dataset, value);
    } else if (name.startsWith("on") && typeof value === "function") {
      node.addEventListener(name.slice(2), value);
    } else if (name in node && name !== "list" && typeof value !== "string") {
      node[name] = value;
    } else {
      node.setAttribute(name === "className" ? "class" : name, value === true ? "" : value);
    }
  }
  for (const child of children.flat()) {
    if (child === undefined || child === null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

// A table with a header row; `rows` is a list of arrays of cell contents (strings or nodes).
export function table(caption, headings, rows) {
  return el("div", { class: "ocs__table-wrap" },
    el("table", { class: "ocs__table" },
      el("caption", { class: "labrats__visually-hidden" }, caption),
      el("thead", {}, el("tr", {}, headings.map((heading) => el("th", { scope: "col" }, heading)))),
      el("tbody", {}, rows.map((cells) => el("tr", {}, cells.map((cell) => el("td", {}, cell)))))));
}

// An OCS toggle switch (ocs__toggle grammar). The checkbox is the label's first child.
export function toggleSwitch(labelText, { checked = false, disabled = false, name } = {}) {
  return el("label", { class: "ocs__toggle" },
    el("input", { class: "ocs__toggle-input", type: "checkbox", role: "switch", checked, disabled, "aria-label": name }),
    el("span", { class: "ocs__toggle-track", "aria-hidden": "true" }),
    el("span", { class: "ocs__toggle-label" }, labelText));
}

export function emptyState(message) {
  return el("p", { class: "labrats__hint" }, message);
}
