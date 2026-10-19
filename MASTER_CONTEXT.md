# Master Technical & Contextual Documentation
> **Target Audience**: AI Coding Agents & Engineers  
> **Repository**: `MrWhoCoded/my-personal-website`  
> **Owner**: Yasser Ahmed (Machine Learning & Data Science Student at BMSCE, Bangalore)  
> **Last Updated**: July 2026

---

## 1. Executive Summary & Project Purpose

This codebase is a **personal developer portfolio website** for **Yasser Ahmed**, an aspiring Machine Learning & Data Science engineer. 

The website is crafted as a lightweight, zero-dependency **static web application** built with standard web technologies (HTML5, Vanilla CSS3, ES Modules JavaScript). It features a distinct **cyberpunk / CLI / UNIX terminal aesthetic** combined with modern micro-interactions, canvas animations, dynamic JSON content rendering, and Kannada language localization features.

### Primary Objectives
1. Showcase ML & Data Science projects, technical skill set, and certifications.
2. Present a distinctive technical persona via terminal simulations, system logs, CLI intros, split-flap multilingual headers, and hidden easter eggs.
3. Maintain zero runtime build dependencies (no Babel, Webpack, or framework runtimes needed)—runs directly via static web servers or GitHub Pages.

---

## 2. Directory & Repository Structure

```
d:\projects\personal website/
├── index.html                  # Main DOM entrypoint & layout structure
├── MASTER_CONTEXT.md           # Master context documentation (this file)
├── WEBSITE_DESIGN_REPORT.txt   # Detailed design specification report
├── LICENSE                     # MIT License
├── data/                       # Dynamic JSON data stores
│   ├── content.json            # Profile info, bio, terminal skill directories, CLI intro lines
│   ├── projects.json           # Featured portfolio projects & tech tags
│   └── certifications.json     # Badges, verification links, and certification metadata
├── css/                        # Modular CSS stylesheets
│   ├── main.css                # Base styles, CSS variables, typography, layout, & section styles
│   ├── terminal.css            # Styling for full-screen CLI terminal intro
│   ├── animations.css          # Keyframes, watermarks, toast notifications, easter egg styles
│   └── mobile.css              # Responsive layout overrides & media queries
├── js/                         # Modular JavaScript (ES Modules)
│   ├── main.js                 # App entry point, DOM initialization & dynamic JSON renderer
│   ├── cli.js                  # CLI intro boot sequence & skip handler logic
│   ├── typewriter.js           # Grapheme-aware typewriter & Split-Flap heading scramble engines
│   ├── observer.js             # Canvas grid, Easter egg bug, scroll spy, parallax system layers
│   └── utils.js                # Configuration, fetch helpers, reduced motion check, toast system
├── assets/                     # Media & asset directory
│   ├── icons/                  # Favicons and UI icons
│   └── images/                 # Profile images, certification badges, fallback 404 image
└── resume/                     # Downloadable PDF resume assets
    └── YasserAhmedMohammed_BMSCE.pdf
```

---

## 3. Core Feature Set & User Experience Flow

```
[Page Load] ──> [CLI Intro Animation (cli-intro)]
                     │
         ┌───────────┴───────────┐
  (Skip / Esc / Complete)  (Reduced Motion)
         │                       │
         └───────────┬───────────┘
                     ▼
             [Main Content (`#main-content`)]
                     │
   ┌─────────────────┼─────────────────┬─────────────────┐
   ▼                 ▼                 ▼                 ▼
[Hero Section]   [About Section]   [Projects]    [Certifications & Contact]
 - Typewriter     - UNIX `ls`      - Card Grid    - Matrix Display
   Tagline          Skills Grid      - Live &       - Social Links
 - Grid Canvas    - Split-Flap       GitHub Links - Download Resume
 - Easter Bug       Kannada Scramble
```

1. **CLI Terminal Boot Sequence (`#cli-intro`)**:
   - Full-screen terminal overlay simulating a UNIX session executing `whoami`, `cat about.txt`, and `ls skills/`.
   - Supports keypress skipping (`Esc` key or click button) and respects `prefers-reduced-motion`.
2. **Interactive Canvas Grid Background (`#grid-canvas`)**:
   - Dynamic 40px grid with a mouse-following cyan radial illumination spotlight effect (`#2dd4bf`).
   - Automatically pauses rendering when scrolled past the hero section to optimize CPU/GPU usage.
3. **Catchable Easter Egg Bug (`#easter-bug`)**:
   - SVG bug hidden near the main hero heading that fades in on mouse proximity and glows when close.
   - Clicking triggers a custom toast notification and console message.
4. **Split-Flap / Scramble Multilingual Headings (`data-scramble`)**:
   - Section headings ("About", "Projects", "Certifications", "Contact") dynamically flip/reel into Kannada translations (e.g. `ಬಗ್ಗೆ`, `ಯೋಜನೆಗಳು`, `ಪ್ರಮಾಣಪತ್ರಗಳು`, `ಸಂಪರ್ಕ`) on hover (desktop) or scroll viewport entry (touch/mobile).
   - Uses `Intl.Segmenter` for accurate grapheme cluster splitting.
5. **UNIX Directory Skill Grid (`#skills-grid`)**:
   - Displays tech stack modeled as UNIX directory listings (`ls -la ~/runtimes_and_logic`, `~/ml_data_engine`, `~/infrastructure_v0.2`).
   - Includes permissions, file sizes, and status badges (`DEPLOYED`, `LEARNING`, `ACTIVE`).
6. **System Watermarks & Ambient Parallax Layer (`#sys-watermarks`)**:
   - Fixed rotated text watermarks (`INIT_CORE_DUMP`, `LATENT_SPACE_ACTIVE`, `EPOCH_OVERFLOW`) with differential scroll parallax speeds.
7. **Dynamic Portfolio & Certification Cards**:
   - Rendered asynchronously from `projects.json` and `certifications.json`.
   - Cards reveal progressively with `IntersectionObserver` stagger delays.

---

## 4. Technical Architecture & Module Responsibilities

### JavaScript Architecture (ES Modules)

The script pipeline is loaded via `<script type="module" src="./js/main.js">` in `index.html`.

- **`js/utils.js`**:
  - Global `CONFIG` object containing JSON file paths, typing speeds, split-flap Kannada dictionary mappings, and tagline phrases.
  - Helper utility functions: `fetchJSON(url)`, `sleep(ms)`, `prefersReducedMotion()`, `showToast(msg, options?)` (supports contextual viewport-clamped positioning).
- **`js/cli.js`**:
  - `initCLIIntro()`: Controls terminal line-by-line typing animation, keyboard hooks for `Esc`, and transitioning control to the main site upon completion or skip.
- **`js/typewriter.js`**:
  - `initTaglineTypewriter()`: Infinite typewriter loop alternating between English and Kannada phrases for the hero tagline using grapheme segmenters.
  - `initSplitFlapHeadings()`: Transforms headings with `[data-scramble]` into 3D vertical reel animation elements with font measurement hooks.
- **`js/observer.js`**:
  - `initGridBackground()`: Canvas HTML5 2D context renderer handling grid drawing and radial mouse gradient logic.
  - `initEasterBug()`: Distance math calculations (`Math.sqrt`) tracking cursor proximity to reveal and highlight the SVG bug.
  - `initSystemLayers()` & `initScrollSpy()`: `IntersectionObserver` instances driving scroll active states in top navigation and ambient layer visibility.
  - `initScrollTransitions()`: Pauses canvas animation loop (`_gridStop`) when user scrolls past the hero section.
  - `initCommandLauncher()`: Controls floating launcher (`#cmd-launcher`) and terminal interface (`#cmd-palette-modal`) supporting `help`, `about`, `projects`, `skills`, `contact`, `resume`, and `clear` commands.
  - `printConsoleEasterEgg()`: Renders ASCII banner art and system metadata into browser developer tools console.
- **`js/main.js`**:
  - Orchestrates DOM bootstrapping on `DOMContentLoaded`.
  - Asynchronously fetches data from `./data/content.json`, `./data/projects.json`, and `./data/certifications.json`.
  - Populates DOM elements (`#about-text`, `#skills-grid`, `#projects-grid`, `#cert-matrix`, `#socials-container`, `#contact-email`).

---

## 5. CSS System & Visual Design Specification

The design utilizes a **dark terminal theme** with curated HSL/HEX color tokens.

### Key CSS Variables (`css/main.css`)
```css
:root {
  --bg-primary: #0a0c10;       /* Main dark background */
  --bg-secondary: #12161f;     /* Card background */
  --bg-tertiary: #1a202c;      /* Subtle hover/accent surfaces */
  --text-primary: #e2e8f0;     /* High contrast body text */
  --text-secondary: #94a3b8;   /* Muted text & metadata */
  --accent-cyan: #2dd4bf;      /* Primary cyan accent highlight */
  --accent-teal: #14b8a6;      /* Secondary teal accent */
  --accent-green: #22c55e;     /* Status deployed green */
  --font-mono: 'Space Mono', monospace;
  --font-cli: 'JetBrains Mono', monospace;
  --font-heading: 'Share Tech Mono', monospace;
}
```

### Typography Hierarchy
- **CLI & Code Elements**: `JetBrains Mono`
- **Headings & Technical Metrics**: `Share Tech Mono`
- **Body & Paragraphs**: `Space Mono`
- **Kannada Fallback & Script**: `Noto Sans Kannada`

---

## 6. Data Schemas & API Contracts

All dynamic content is decoupled into JSON files in `/data/`:

### `data/content.json`
- `name` (string): Developer name ("Yasser Ahmed").
- `tagline` (string): Hero description tagline.
- `email` (string): Contact email address.
- `socials` (array): List of `{ name, url }` objects.
- `about` (array of strings): Paragraphs rendered in the About section.
- `directories` (array): Mock UNIX directory representation for AI Engineering skills (`~/runtimes_and_logic`, `~/ml_data_engine`, `~/infrastructure_v0.2`):
  - `path`: Directory path (e.g. `"~/ml_data_engine"`).
  - `items`: Array of `{ name, permissions, size, status? }`.
- `cliIntro` (object): Contains `lines` (array of terminal command/output strings).

### `data/projects.json`
Array of project items:
```json
{
  "title": "ClassLogger-RAG",
  "description": "Built a Retrieval-Augmented Generation (RAG) study assistant...",
  "tech": ["Python", "Flask", "AstraDB", "OpenRouter", "LangChain", "PyMuPDF"],
  "url": "https://github.com/MrWhoCoded/ClassLogger-RAG",
  "status": "[ ACTIVE_DEV ]", // Optional status badge (e.g. terminal indicator)
  "statusTooltip": "Indexing knowledge base...", // Optional hover terminal message
  "live": "https://example.com" // Optional live url
}
```

### `data/certifications.json`
Array of certification items:
```json
{
  "title": "Nutanix Certified Associate",
  "issuer": "Nutanix",
  "id": "NCA-2026-001",
  "badge_url": "./assets/images/nutanix-certified-associate-6.png",
  "verify_url": "https://www.credly.com/...",
  "status": "CERTIFIED", // Or "COMING SOON..."
  "year": "2026"
}
```

---

## 7. Guidelines for Future AI Agents & Modifications

When extending or maintaining this codebase, observe the following rules:

1. **Maintain Zero-Dependency Vanilla Architecture**:
   - Do NOT introduce build bundlers (Webpack, Vite), transpilers, or heavy frameworks (React, Vue) unless requested explicitly by the user.
   - Write standard modern JavaScript using ES Modules (`import`/`export`).
2. **Preserve Dynamic Data Decoupling**:
   - Content changes (adding a new project, updating bio, adding a skill or certification) must be made in `data/*.json`, NOT hardcoded into `index.html`.
3. **Respect Performance Optimizations**:
   - Ensure the canvas grid drawing loop is properly unobserved or paused (`_gridStop()`) when offscreen.
   - Use `requestAnimationFrame` for smooth animations and DOM updates.
4. **Unicode & Multi-language Considerations**:
   - Use `Intl.Segmenter` or grapheme-aware string manipulation when slicing or animating strings containing Kannada script (`kn`), as simple `.length` or `.split('')` breaks surrogate pairs/conjuncts.
5. **Accessibility & Reduced Motion**:
   - Always verify `prefersReducedMotion()` in `js/utils.js` before executing intensive CSS or JavaScript intro sequences.
   - Maintain `aria-*` tags (`aria-live`, `aria-label`, `aria-hidden`) across terminal elements and navigation items.

---

## 8. Verification & Running Locally

To preview or test the website locally:
- Launch any simple HTTP static web server from the project root directory:
  - Python: `python -m http.server 8000`
  - Node `npx`: `npx serve .`
  - VS Code Live Server extension.
- Access via `http://localhost:8000/`.
