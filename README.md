# Yasser Ahmed - Personal Portfolio

A minimal, single-scroll personal portfolio website for an ML & Data Science aspirant.

## Features

- **CLI-style landing animation** with skip option (button + Esc key)
- **Kannada text scramble effect** on section headings (hover)
- **Single HTML page** - lightweight and fast
- **Editable content** via JSON files (no code changes needed)
- **Auto-generated projects** from GitHub repositories
- **Fully responsive** - works on laptop and mobile
- **Accessible** - keyboard navigable, reduced motion support, WCAG AA contrast

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks, minimal dependencies
- **Fonts** - Inter (body), JetBrains Mono (CLI), Noto Sans Kannada (scramble effect)

## Directory Structure

```
/
├── README.md              # This file
├── index.html             # Main HTML page
├── assets/
│   ├── css/
│   │   └── styles.css     # All styles with CSS variables
│   ├── js/
│   │   └── main.js        # All JavaScript
│   ├── data/
│   │   ├── content.json   # Editable text content
│   │   └── projects.json  # Project data (auto-generated)
│   ├── fonts/             # (optional) Self-hosted fonts
│   └── img/               # Images (profile photo, etc.)
└── scripts/
    └── fetch-projects.js  # Script to regenerate projects.json
```

## Quick Start

1. Open `index.html` in a browser, or
2. Run a local server:
   ```bash
   # Python
   python -m http.server 8000
   
   # Node.js (if you have npx)
   npx serve
   ```
3. Visit `http://localhost:8000`

## Editing Content

All editable text lives in `assets/data/content.json`:

- `name` - Your display name
- `tagline` - One-line description
- `email` - Contact email
- `about` - Array of paragraphs for the About section
- `cliIntro.lines` - Lines for the CLI typing animation

**No JavaScript knowledge required to edit content.**

## Updating Projects

Projects are stored in `assets/data/projects.json` and can be regenerated from GitHub:

```bash
node scripts/fetch-projects.js
```

See `MAINTENANCE.md` for detailed instructions.

## Deployment

See `DEPLOY.md` for instructions on:
- GitHub Pages
- Netlify
- Vercel

## Customization

### Colors
Edit CSS variables in `assets/css/styles.css`:
```css
:root {
  --color-accent: #2dd4bf;  /* Teal accent */
  --color-bg: #0a0f14;      /* Dark background */
  /* ... */
}
```

### Disabling Animations
See `MAINTENANCE.md` for instructions on disabling:
- CLI intro
- Scramble hover effect
- All animations

## License

MIT - Feel free to use this as a template for your own portfolio.
