# Incident Desk

A small, local incident and service management app built with Node.js and plain browser JavaScript. Incident data is stored in a JSON file; no external database, account, or service is required.

## Requirements

- Node.js 18 or newer
- npm (included with Node.js)

## Run locally

1. Open a terminal in the project directory.
2. Start the server:

   ```sh
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000).

The server listens on `0.0.0.0` by default. Set `PORT` to change the port, for example `PORT=8080 npm start`. On PowerShell, use `$env:PORT=8080; npm start`.

## Features

- Create incidents with a title, description, severity, and owner.
- Move incidents between Open, Investigating, and Resolved.
- Add comments to an incident.
- Search by title and filter by severity or status.
- View live counts for total and each incident status.
- Keep data between restarts in `data/incidents.json`.

## Health check

`GET /api/health` returns `200` and `{"status":"ok"}` when the app is running. The dashboard also links to this endpoint.

## API

- `GET /api/incidents` — list incidents; optional `q`, `severity`, and `status` query parameters.
- `POST /api/incidents` — create an incident with `title`, `description`, `severity`, and `owner`.
- `PATCH /api/incidents/:id` — update an incident status.
- `POST /api/incidents/:id/comments` — add a comment with a `text` value.
- `GET /api/health` — health check.

All API request and response bodies use JSON. The server uses Node.js built-in modules and has no package dependencies.
