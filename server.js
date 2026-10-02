const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const DATA_FILE = path.join(__dirname, "data", "incidents.json");
const PUBLIC_DIR = path.join(__dirname, "public");
const SEVERITIES = new Set(["Low", "Medium", "High", "Critical"]);
const STATUSES = new Set(["Open", "Investigating", "Resolved"]);
const STATIC_FILES = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]]
]);

function readIncidents() {
  try {
    const incidents = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    if (!Array.isArray(incidents)) {
      throw new Error("Incident data must be a JSON array.");
    }
    return incidents;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function saveIncidents(incidents) {
  const temporaryFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temporaryFile, `${JSON.stringify(incidents, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryFile, DATA_FILE);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > 1024 * 1024) {
        reject(Object.assign(new Error("Request body is too large."), { statusCode: 413 }));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Request body must be a JSON object.");
        }
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error("Request body must be a valid JSON object."), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

function requiredText(value, field, maxLength) {
  if (typeof value !== "string" || !value.trim()) {
    return `${field} is required.`;
  }
  if (value.trim().length > maxLength) {
    return `${field} must be ${maxLength} characters or fewer.`;
  }
  return null;
}

function handleApi(request, response, url) {
  if (url.pathname === "/api/health" && request.method === "GET") {
    return sendJson(response, 200, { status: "ok" });
  }

  if (url.pathname === "/api/incidents" && request.method === "GET") {
    const incidents = readIncidents();
    const query = (url.searchParams.get("q") || "").trim().toLowerCase();
    const severity = url.searchParams.get("severity");
    const status = url.searchParams.get("status");
    return sendJson(response, 200, incidents.filter((incident) =>
      (!query || incident.title.toLowerCase().includes(query)) &&
      (!severity || incident.severity === severity) &&
      (!status || incident.status === status)
    ));
  }

  if (url.pathname === "/api/incidents" && request.method === "POST") {
    return readBody(request).then((body) => {
      const titleError = requiredText(body.title, "Title", 160);
      const ownerError = requiredText(body.owner, "Owner", 100);
      if (titleError || ownerError) {
        return sendJson(response, 400, { error: titleError || ownerError });
      }
      if (typeof body.description !== "string" || body.description.length > 5000) {
        return sendJson(response, 400, { error: "Description must be 5000 characters or fewer." });
      }
      if (!SEVERITIES.has(body.severity)) {
        return sendJson(response, 400, { error: "Severity must be Low, Medium, High, or Critical." });
      }

      const incident = {
        id: randomUUID(),
        title: body.title.trim(),
        description: body.description.trim(),
        severity: body.severity,
        owner: body.owner.trim(),
        status: "Open",
        comments: [],
        createdAt: new Date().toISOString()
      };
      const incidents = readIncidents();
      incidents.unshift(incident);
      saveIncidents(incidents);
      return sendJson(response, 201, incident);
    });
  }

  const incidentRoute = url.pathname.match(/^\/api\/incidents\/([a-f0-9-]+)(?:\/(comments))?$/i);
  if (!incidentRoute) {
    return sendJson(response, 404, { error: "Not found." });
  }

  const [, id, subresource] = incidentRoute;
  const incidents = readIncidents();
  const incident = incidents.find((item) => item.id === id);
  if (!incident) {
    return sendJson(response, 404, { error: "Incident not found." });
  }

  if (!subresource && request.method === "PATCH") {
    return readBody(request).then((body) => {
      if (!STATUSES.has(body.status)) {
        return sendJson(response, 400, { error: "Status must be Open, Investigating, or Resolved." });
      }
      incident.status = body.status;
      incident.updatedAt = new Date().toISOString();
      saveIncidents(incidents);
      return sendJson(response, 200, incident);
    });
  }

  if (subresource === "comments" && request.method === "POST") {
    return readBody(request).then((body) => {
      const textError = requiredText(body.text, "Comment", 2000);
      if (textError) {
        return sendJson(response, 400, { error: textError });
      }
      const comment = {
        id: randomUUID(),
        text: body.text.trim(),
        createdAt: new Date().toISOString()
      };
      incident.comments.push(comment);
      saveIncidents(incidents);
      return sendJson(response, 201, comment);
    });
  }

  return sendJson(response, 405, { error: "Method not allowed." });
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (url.pathname.startsWith("/api/")) {
    try {
      Promise.resolve(handleApi(request, response, url)).catch((error) => {
        if (!response.headersSent) {
          sendJson(response, error.statusCode || 500, {
            error: error.statusCode ? error.message : "The request could not be completed."
          });
        } else {
          response.destroy(error);
        }
        if (!error.statusCode) {
          console.error("API request failed:", error);
        }
      });
    } catch (error) {
      console.error("API request failed:", error);
      sendJson(response, 500, { error: "The request could not be completed." });
    }
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end();
    return;
  }

  const staticFile = STATIC_FILES.get(url.pathname);
  if (!staticFile) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found.");
    return;
  }

  const [fileName, contentType] = staticFile;
  fs.readFile(path.join(PUBLIC_DIR, fileName), (error, content) => {
    if (error) {
      console.error("Could not read public file:", error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Could not load the application.");
      return;
    }
    response.writeHead(200, { "Content-Type": contentType });
    response.end(request.method === "HEAD" ? undefined : content);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Incident management app listening on http://${HOST}:${PORT}`);
});
