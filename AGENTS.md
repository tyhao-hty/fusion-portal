# Repository Guidelines

## Project Structure & Module Organization
Pages under the root (`index.html`, `history.html`, etc.) consume shared partials from `components/` and data sources in `data/`. JavaScript helpers in `components/common.js` inject the header, footer, and per-page metadata; keep reusable UI in this folder. Global styling lives in `styles.css`, while images belong in `assets/`. Add new JSON-driven content in `data/` so it can be rendered consistently across pages.

## Build, Test, and Development Commands
This project is a static site; no build step is required. Use a lightweight server for local preview, for example:
```bash
python3 -m http.server 8080
```
Run the command from the repository root and visit `http://localhost:8080`. Refresh the page after modifying HTML, CSS, JSON, or components to confirm changes loaded.

## Coding Style & Naming Conventions
Match existing formatting: 4-space indentation in HTML/CSS and 2 spaces in JavaScript. Favor semantic HTML tags, descriptive class names (e.g., `module-card`), and lower-case, hyphenated filenames. Reuse the component loader by targeting placeholders with `data-component` attributes. Keep copy in simplified Chinese to align with current content, and ensure metadata strings defined in `components/meta.js` stay synchronized with page titles.

## Testing Guidelines
Automated tests are not configured; rely on manual verification. After updates, open the browser console to confirm component fetches succeed and no accessibility warnings appear. Exercise critical flows: navigation toggle on mobile breakpoints, smooth scrolling for in-page anchors, and dynamic year rendering in the footer. Validate JSON edits with a linter or `python -m json.tool data/<file>.json` to avoid malformed data.

## Commit & Pull Request Guidelines
The repository currently lacks tracked history; adopt short, descriptive Conventional Commit messages such as `feat: extend timeline data` or `fix: repair smooth scroll focus`. For pull requests, include a concise summary of the change, affected pages or data files, validation steps (manual checks performed), and screenshots or screen recordings when visual updates are made. Link to any relevant issues or TODO items to maintain traceability.

## Content & Data Updates
When expanding factual sections, cite reputable sources and update related entries across pages (e.g., ensure `history.html` additions align with `data/timeline.json`). Keep JSON arrays chronologically ordered and prefer ISO-style dates (`YYYY-MM`) for new timeline markers. Review copy for tone consistency and terminology before publishing.
