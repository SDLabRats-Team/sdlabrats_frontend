// Footer search bar (AP CSP Create Task, issues #14 and #15).
// The list it searches is filled from the backend's page bundle (site.sections), the same
// site map the footer shows, so the frontend keeps no page data of its own.
// Every search is checked first (#15): bad input shows a message and never runs a search.

// The longest search allowed, and the characters taken out so the text is safe to use.
const MAX_SEARCH_LENGTH = 50;
const UNSAFE_CHARACTERS = /[<>{};]/g;

// The list: every page and section link on the site, filled once the bundle arrives.
let searchList = [];

// Fills the list from the backend navigation. Each item is one link: its title, address, and section.
export function fillSearchList(sections) {
  searchList = [];
  for (const section of sections) {
    const links = [...section.pages, ...(section.anchors || [])];
    for (const link of links) {
      searchList.push({ title: link.title, url: link.url, section: section.title });
    }
  }
}

// Cleans typed text: removes unsafe characters, trims the ends, turns runs of spaces
// into one space, and makes it lowercase so "  Summer   CAMPS " matches "Summer camps".
export function cleanQuery(text) {
  return String(text ?? "")
    .replace(UNSAFE_CHARACTERS, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

// The procedure: takes the typed text (query) and returns the items whose title matches it,
// or an error message when the text can't be searched.
export function searchItems(query) {
  // Step 1: clean the text.
  const cleaned = cleanQuery(query);

  // Step 2: check it. Bad input stops here, before any search runs.
  if (cleaned === "") {
    return { error: "Please type something to search.", results: [] };
  }
  if (cleaned.length > MAX_SEARCH_LENGTH) {
    return { error: "Search is too long.", results: [] };
  }

  // Step 3: go through every item in the list and keep the ones that match.
  const results = [];
  for (const item of searchList) {
    if (item.title.toLowerCase().includes(cleaned)) {
      results.push(item);
    }
  }

  // Step 4: hand back what was found.
  return { error: "", results };
}

// Shows the procedure's answer under the search bar: an error, a list of links, or "No results found."
function showAnswer(form, answer, url) {
  const input = form.elements.q;
  const error = form.querySelector("#labrats-search-error");
  const status = form.querySelector("[data-labrats-search-status]");
  const list = form.querySelector("[data-labrats-search-results]");

  list.replaceChildren();
  status.textContent = "";
  if (answer.error) {
    error.textContent = answer.error;
    error.hidden = false;
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }
  error.hidden = true;
  input.removeAttribute("aria-invalid");

  if (answer.results.length === 0) {
    status.textContent = "No results found.";
    return;
  }
  status.textContent = `${answer.results.length} found.`;
  for (const item of answer.results) {
    const link = document.createElement("a");
    link.href = url(item.url);
    link.textContent = item.title;
    const row = document.createElement("li");
    row.append(link, ` (${item.section})`);
    list.append(row);
  }
}

// Fills the list, then runs the search each time the button is clicked or Enter is pressed.
export function initSearch(form, ctx) {
  if (!form) return;
  fillSearchList(ctx.site.sections);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = searchItems(form.elements.q.value);
    showAnswer(form, answer, ctx.url);
  });
}
