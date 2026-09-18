# 5 Star CiNUma

A lightweight static homepage for a film and entertainment YouTube channel. It uses plain HTML, CSS, and JavaScript, so there is no package installation or database.

## Project structure

```text
app/
  index.html    Page content and semantic sections
  styles.css    Responsive layout, colors, typography, and animations
  script.js     Mobile navigation and current footer year
  Dockerfile    Optional Nginx container for local or Kubernetes practice
  .dockerignore Files excluded from the container build context
```

## Run locally

From this `app` folder, use any one of these options:

### Option 1: Python

```bash
python -m http.server 8080
```

Open http://localhost:8080 in a browser.

### Option 2: Node.js

```bash
npx serve .
```

Open the URL printed in the terminal.

### Option 3: Docker

```bash
docker build -t 5-star-cinuma .
docker run --rm -p 8080:80 5-star-cinuma
```

Open http://localhost:8080.

The sample video and social links currently point to their public homepages. Replace them with the channel's real URLs when they are available.