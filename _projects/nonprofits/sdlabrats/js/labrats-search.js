// Footer search bar (AP CSP Create Task, issue #14).
// The list it searches is filled from the backend's page bundle (site.sections), the same
// site map the footer shows, so the frontend keeps no page data of its own.

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

// The procedure: takes the typed text (query) and returns the items whose title matches it.
export function searchItems(query) {
  // Step 1: clean the text so "  CAMPS " and "camps" are the same search.
  const cleaned = String(query).trim().toLowerCase();

  // Step 2: go through every item in the list and keep the ones that match.
  const results = [];
  for (const item of searchList) {
    if (item.title.toLowerCase().includes(cleaned)) {
      results.push(item);
    }
  }

  // Step 3: hand back what was found.
  return { error: "", results };
}

// Shows the procedure's answer under the search bar: a list of links, or "No results found."
function showAnswer(form, answer, url) {
  const status = form.querySelector("[data-labrats-search-status]");
  const list = form.querySelector("[data-labrats-search-results]");

  list.replaceChildren();
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
