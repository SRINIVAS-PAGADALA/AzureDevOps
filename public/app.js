const incidentList = document.querySelector("#incident-list");
const message = document.querySelector("#message");
const form = document.querySelector("#incident-form");
const submitButton = document.querySelector("#submit-button");
const searchInput = document.querySelector("#search-input");
const severityFilter = document.querySelector("#severity-filter");
const statusFilter = document.querySelector("#status-filter");

let incidents = [];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers }
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "The request could not be completed.");
  }
  return result;
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function updateDashboard() {
  document.querySelector("#total-count").textContent = incidents.length;
  document.querySelector("#open-count").textContent = incidents.filter((item) => item.status === "Open").length;
  document.querySelector("#investigating-count").textContent = incidents.filter((item) => item.status === "Investigating").length;
  document.querySelector("#resolved-count").textContent = incidents.filter((item) => item.status === "Resolved").length;
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function renderComments(incident, area) {
  area.replaceChildren();
  if (incident.comments.length === 0) {
    area.append(makeElement("p", "comment-item", "No comments yet."));
  } else {
    for (const comment of incident.comments) {
      const item = makeElement("p", "comment-item", comment.text);
      item.append(makeElement("span", "comment-date", formatDate(comment.createdAt)));
      area.append(item);
    }
  }

  const commentForm = makeElement("form", "comment-form");
  const input = document.createElement("input");
  input.type = "text";
  input.name = "comment";
  input.maxLength = 2000;
  input.placeholder = "Add a comment...";
  input.setAttribute("aria-label", `Add a comment to ${incident.title}`);
  input.required = true;
  const button = makeElement("button", "", "Send");
  button.type = "submit";
  commentForm.append(input, button);
  commentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    button.disabled = true;
    try {
      await request(`/api/incidents/${incident.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ text: input.value })
      });
      await loadIncidents();
    } catch (error) {
      showMessage(error.message);
      button.disabled = false;
    }
  });
  area.append(commentForm);
}

function renderIncident(incident) {
  const card = makeElement("article", "incident-card");
  const topLine = makeElement("div", "incident-topline");
  const titleAndDescription = document.createElement("div");
  titleAndDescription.append(makeElement("h3", "incident-title", incident.title));
  if (incident.description) {
    titleAndDescription.append(makeElement("p", "incident-description", incident.description));
  }

  const badges = makeElement("div", "badges");
  badges.append(makeElement("span", `badge severity-${incident.severity.toLowerCase()}`, incident.severity));
  badges.append(makeElement("span", `badge status-${incident.status.toLowerCase()}`, incident.status));
  topLine.append(titleAndDescription, badges);

  const meta = makeElement("div", "incident-meta");
  const owner = document.createElement("span");
  const avatar = makeElement("span", "owner-avatar", incident.owner.trim().charAt(0).toUpperCase());
  owner.append(avatar, document.createTextNode(incident.owner));
  const created = makeElement("span", "", `Created ${formatDate(incident.createdAt)}`);

  const statusLabel = makeElement("label", "status-control");
  const statusText = makeElement("span", "", "Status");
  const statusSelect = document.createElement("select");
  statusSelect.setAttribute("aria-label", `Status for ${incident.title}`);
  for (const status of ["Open", "Investigating", "Resolved"]) {
    const option = makeElement("option", "", status);
    option.value = status;
    option.selected = status === incident.status;
    statusSelect.append(option);
  }
  statusSelect.addEventListener("change", async () => {
    statusSelect.disabled = true;
    try {
      await request(`/api/incidents/${incident.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusSelect.value })
      });
      await loadIncidents();
    } catch (error) {
      showMessage(error.message);
      statusSelect.value = incident.status;
      statusSelect.disabled = false;
    }
  });
  statusLabel.append(statusText, statusSelect);

  const commentsToggle = makeElement("button", "comments-toggle", `Comments (${incident.comments.length})`);
  commentsToggle.type = "button";
  commentsToggle.setAttribute("aria-expanded", "false");
  const commentsArea = makeElement("div", "comments-area");
  commentsArea.hidden = true;
  commentsToggle.addEventListener("click", () => {
    const isExpanded = commentsToggle.getAttribute("aria-expanded") === "true";
    commentsToggle.setAttribute("aria-expanded", String(!isExpanded));
    commentsArea.hidden = isExpanded;
    if (!isExpanded) renderComments(incident, commentsArea);
  });

  meta.append(owner, created, statusLabel, commentsToggle);
  card.append(topLine, meta, commentsArea);
  return card;
}

function renderIncidents() {
  const query = searchInput.value.trim().toLowerCase();
  const severity = severityFilter.value;
  const status = statusFilter.value;
  const visible = incidents.filter((incident) =>
    incident.title.toLowerCase().includes(query) &&
    (!severity || incident.severity === severity) &&
    (!status || incident.status === status)
  );

  document.querySelector("#visible-count").textContent = visible.length;
  incidentList.replaceChildren();
  if (visible.length === 0) {
    const empty = makeElement("div", "empty-state");
    empty.append(makeElement("span", "empty-icon", "✓"));
    empty.append(makeElement("strong", "", incidents.length ? "No matching incidents" : "You're all clear"));
    empty.append(makeElement("p", "", incidents.length
      ? "Try adjusting your search or filters."
      : "There are no incidents yet. Create one to get started."));
    incidentList.append(empty);
    return;
  }
  for (const incident of visible) {
    incidentList.append(renderIncident(incident));
  }
}

async function loadIncidents() {
  showMessage("");
  try {
    incidents = await request("/api/incidents");
    updateDashboard();
    renderIncidents();
  } catch (error) {
    showMessage(error.message);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  showMessage("");
  const values = new FormData(form);
  try {
    await request("/api/incidents", {
      method: "POST",
      body: JSON.stringify({
        title: values.get("title"),
        description: values.get("description"),
        severity: values.get("severity"),
        owner: values.get("owner")
      })
    });
    form.reset();
    await loadIncidents();
  } catch (error) {
    showMessage(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

searchInput.addEventListener("input", renderIncidents);
severityFilter.addEventListener("change", renderIncidents);
statusFilter.addEventListener("change", renderIncidents);
document.querySelector("#refresh-button").addEventListener("click", loadIncidents);

loadIncidents();
