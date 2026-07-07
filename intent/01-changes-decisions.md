# GitToResume Changes & Decisions Log

This document lists all the development changes made and technical decisions taken while building the GitToResume application.

---

## 1. Project Scaffolding & Configuration

### Decisions & Implementations
*   **Vite Scaffolding**: Initialized the frontend using `npx create-vite@latest ./ --template react-ts` inside the `frontend/` directory to leverage React with TypeScript.
*   **Package Manager**: Utilized `pnpm` (v11.0.9) to manage node packages for its fast resolution speeds, lockfile stability, and shared caching capabilities.
*   **Path Aliases**:
    *   Mapped `@/*` to `./src/*` by updating `tsconfig.app.json` and adding `baseUrl` and `paths`.
    *   Added path resolution config to `vite.config.ts` using Node's `path` library to ensure components can import using `@/` syntax.
*   **Tailwind CSS v4 Integration**:
    *   Installed `tailwindcss` and `@tailwindcss/vite` (v4.3.2).
    *   Configured `vite.config.ts` to load the `@tailwindcss/vite` plugin.
    *   Updated `src/index.css` to import Tailwind via the v4 `@import "tailwindcss";` directive and defined custom theme parameters using the new `@theme` CSS syntax.

---

## 2. Frontend Development & UX

### Decisions & Implementations
*   **Monochrome Design Tokens**: Configured Tailwind variables in `src/index.css` to enforce a clean layout:
    *   Background: Pure White (`#FFFFFF`)
    *   Borders: Light Gray (`#EAEAEA`)
    *   Primary Text: Near Black (`#111111`)
    *   Secondary Text: Medium Gray (`#6B7280`)
    *   Buttons: Solid Black with white text and smooth scale micro-animations.
*   **Inline Document Editor**:
    *   Created a custom `EditableText` React component in `src/App.tsx`. It toggles into an input/textarea when clicked and blurs to save, mimicking a Notion-like inline editor experience.
    *   Structured list item management (experience bullets, projects, skills) to support additions, edits, and deletions with hover-triggered control icons.
*   **Zustand Global State**:
    *   Implemented `src/store/useResumeStore.ts` to host local edits of the current resume draft.
    *   Engineered async triggers within the store for calling FastAPI endpoints to generate the resume draft and download the exported PDF.
    *   Added state for progressive loading steps to reassure the user while Gemini analyzes repository data.
*   **Footer Removal**: Removed the landing page footer in `src/App.tsx` to streamline the user entry form per user request.

---

## 3. Backend Development

### Decisions & Implementations
*   **FastAPI Engine**: Created `backend/main.py` with FastAPI to expose two core endpoints:
    *   `POST /api/resume/generate`: Connects to GitHub API and aggregates user data, then pipes it to Gemini to get a structured JSON draft.
    *   `POST /api/resume/export`: Renders the edited resume JSON data to HTML using Jinja2 templates and compiles it to a vector PDF using WeasyPrint.
*   **GitHub Aggregator**: Built `backend/services/github.py` using `httpx.AsyncClient` to asynchronously pull profile statistics, public repositories, and README contents.
*   **Gemini Structured JSON Outputs**: Built `backend/services/ai.py` utilizing the direct Gemini REST endpoint. Configured `responseSchema` constraints to force Gemini 2.5 Flash to return valid JSON that conforms exactly to our TypeScript/Pydantic resume interface.
*   **WeasyPrint System Configuration**:
    *   Built `backend/services/pdf.py` to handle HTML to PDF conversions.
    *   Successfully resolved the system-level rendering library crash (gobject-2.0 load failure) by using Homebrew to install `cairo`, `pango`, `gdk-pixbuf`, and `libffi`.
*   **Git Config & Cleanups**: Created a `backend/.gitignore` file to ensure build environments (`.venv`), bytecodes (`__pycache__`), API secrets (`.env`), and downloaded PDFs are excluded from commits.

---

## 4. TypeScript & Build Issues Resolved

*   **TS5101: baseUrl Deprecation**:
    *   *Issue*: Modern TypeScript versions raise a deprecation warning/error for `baseUrl` when using bundler resolution.
    *   *Fix*: Appended `"ignoreDeprecations": "6.0"` to compiler options in `tsconfig.app.json` to safely bypass this without breaking path resolutions.
*   **TS1484: Verbatim Module Syntax**:
    *   *Issue*: With `verbatimModuleSyntax` enabled in Vite's default config, standard imports of interfaces/types raise compilation errors.
    *   *Fix*: Updated all TS type imports in `App.tsx` and `useResumeStore.ts` to explicitly use `import type` syntax.
*   **TS6192: Unused Imports**:
    *   *Issue*: Strict linting/compilation checks failed due to unused type imports in `App.tsx`.
    *   *Fix*: Deleted the unused type declarations from the frontend entrypoint file.
*   **Missing lucide-react Github Icon**:
    *   *Issue*: Lucide React v1.0.0+ deprecated and removed brand logos (like `Github`, `Slack`, `Discord`) from its standard export list.
    *   *Fix*: Removed the import and wrote a custom inline SVG `Github` component directly in `App.tsx` utilizing Lucide's 2px stroke styling to maintain visual consistency.
