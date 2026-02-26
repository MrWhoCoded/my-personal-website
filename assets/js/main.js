/**
 * Personal Portfolio - Yasser Ahmed
 * Main JavaScript
 * 
 * This file handles:
 * - CLI intro animation (Task 1)
 * - Split-Flap Headings (Task 8)
 * - Content loading from JSON (Task 4, 5)
 */

'use strict';

// ===================================
// Configuration
// ===================================

const CONFIG = {
    // Paths to content files
    contentPath: 'assets/data/content.json',
    projectsPath: 'assets/data/projects.json',

    // CLI typing speed (ms per character)
    typingSpeed: 30,

    // Split-Flap Animation Settings (Slot Machine)
    splitFlap: {
        speed: 0.05,       // Stagger delay per char (s)
        translations: {
            'About': 'ಬಗ್ಗೆ',
            'Projects': 'ಯೋಜನೆಗಳು',
            'Contact': 'ಸಂಪರ್ಕ'
        }
    },

    // Typewriter Animation for Tagline
    typewriter: {
        phrases: [
            'exploring data-driven intelligence',
            'ಡೇಟಾ ಚಾಲಿತ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ಅನ್ವೇಷಿಸುವುದು'
        ],
        typeSpeed: 60,      // ms per character (typing)
        eraseSpeed: 30,     // ms per character (erasing)
        holdDelay: 2000,    // ms to hold text before erasing
        pauseDelay: 500     // ms pause after erase before next phrase
    }
};

// ===================================
// Utility: Check for reduced motion
// ===================================

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ===================================
// CLI Intro (Task 1)
// Terminal-style typing animation
// ===================================

// CLI intro lines (can be customized in content.json)
const CLI_LINES = [
    { text: '$ whoami', type: 'command' },
    { text: 'yasser_ahmed', type: 'output', delay: 200 },
    { text: '', type: 'blank' },
    { text: '$ cat interests.txt', type: 'command' },
    { text: 'Machine Learning & Data Science aspirant', type: 'output', delay: 150 },
    { text: 'exploring data-driven intelligence.', type: 'output', delay: 100 },
    { text: '', type: 'blank' },
    { text: '$ ls skills/', type: 'command' },
    { text: 'python  machine-learning  data-analysis  deep-learning', type: 'output', delay: 150 },
    { text: '', type: 'blank' },
    { text: '$ ./load_portfolio.sh', type: 'command' },
    { text: 'Initializing...', type: 'output', delay: 300 },
];

// State management
let cliAnimationId = null;
let isIntroSkipped = false;

function initCLIIntro() {
    const intro = document.getElementById('cli-intro');
    const mainContent = document.getElementById('main-content');
    const skipBtn = document.getElementById('skip-intro');
    const cliOutput = document.getElementById('cli-output');
    const cursor = document.querySelector('.cli-cursor');

    if (!intro || !mainContent || !cliOutput) return;

    // Transition to Main Content
    function finishIntro() {
        intro.classList.add('hidden');
        mainContent.removeAttribute('hidden');
        mainContent.style.opacity = '1';
        document.removeEventListener('keydown', handleEsc);

        // IMPORTANT: Initialize animations AFTER content is visible
        // otherwise getBoundingClientRect() returns 0 width.
        requestAnimationFrame(() => {
            initSplitFlapHeadings();
            initTaglineTypewriter();
            initGridBackground();
            initEasterBug();
            initScrollTransitions();
        });
    }

    function skipIntro() {
        if (isIntroSkipped) return;
        isIntroSkipped = true;

        if (cliAnimationId) cancelAnimationFrame(cliAnimationId);

        intro.style.opacity = '0';
        intro.style.transition = 'opacity 0.3s ease';

        setTimeout(finishIntro, 300);
    }

    function handleEsc(e) {
        if (e.key === 'Escape') {
            skipIntro();
        }
    }

    if (skipBtn) skipBtn.addEventListener('click', skipIntro);
    document.addEventListener('keydown', handleEsc);

    if (prefersReducedMotion()) {
        finishIntro();
        return;
    }

    // Start typing animation
    typeLines(cliOutput, cursor, CLI_LINES, () => {
        // Natural completion
        setTimeout(finishIntro, 500);
    });
}

/**
 * Type out CLI lines one by one
 */
async function typeLines(output, cursor, lines, onComplete) {
    for (let i = 0; i < lines.length; i++) {
        if (isIntroSkipped) return;

        const line = lines[i];

        if (line.type === 'blank') {
            output.textContent += '\n';
            await sleep(100);
            continue;
        }

        await typeLine(output, line.text, line.type === 'command' ? CONFIG.typingSpeed : CONFIG.typingSpeed * 0.5);
        output.textContent += '\n';

        if (line.delay) await sleep(line.delay);
    }

    await sleep(400);
    if (!isIntroSkipped) {
        onComplete();
    }
}

function typeLine(output, text, speed) {
    return new Promise((resolve) => {
        let charIndex = 0;
        function typeChar() {
            if (isIntroSkipped || charIndex >= text.length) {
                resolve();
                return;
            }
            output.textContent += text[charIndex];
            charIndex++;
            cliAnimationId = requestAnimationFrame(() => {
                setTimeout(typeChar, speed);
            });
        }
        typeChar();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// Split-Flap Headings (Task 8)
// ===================================

function initSplitFlapHeadings() {
    const headings = document.querySelectorAll('[data-scramble]');
    const isTouch = window.matchMedia('(hover: none)').matches;

    // Inject CSS for Split-Flap Animation
    if (!document.getElementById('split-flap-css')) {
        const style = document.createElement('style');
        style.id = 'split-flap-css';
        style.innerHTML = `
            .split-flap-wrapper {
                display: inline-flex; 
                white-space: nowrap;
                vertical-align: bottom;
            }
            .sf-char {
                display: inline-flex;
                flex-direction: column;
                position: relative;
                height: 1.2em; 
                line-height: 1.2em;
                overflow: hidden;   
                vertical-align: bottom;
                width: var(--w-eng);
                transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .split-flap-wrapper.active .sf-char {
                width: var(--w-kan);
            }
            .sf-space {
                display: inline-block;
                width: 0.3em;
            }
            .sf-reel {
                display: flex;
                flex-direction: column;
                position: relative;
                top: 0;
                left: 0;
                min-width: 100%;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                will-change: transform;
            }
            .sf-glyph {
                height: 1.2em;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    // Helper: Split text into graphemes (handling Kannada ligatures)
    function getGraphemes(text) {
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text)).map(s => s.segment);
        }
        return text.split(''); // Fallback
    }

    // Helper: Measure width of a text string in the context of the heading
    function measureWidth(text, contextElement) {
        if (!text) return 0;
        const span = document.createElement('span');
        span.textContent = text;
        span.style.opacity = '0';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'nowrap';
        contextElement.appendChild(span);
        const w = span.getBoundingClientRect().width;
        contextElement.removeChild(span);
        return w;
    }

    document.fonts.ready.then(() => {
        headings.forEach(heading => {
            // Check if already initialized to avoid double running
            if (heading.querySelector('.split-flap-wrapper')) return;

            // Normalize whitespace (multi-line HTML collapses to single spaces)
            const originalText = heading.textContent.trim().replace(/\s+/g, ' ');
            const translation = CONFIG.splitFlap.translations[originalText];

            if (!translation) return;

            const engGraphemes = getGraphemes(originalText);
            const kanGraphemes = getGraphemes(translation);

            // 1. Setup Wrapper
            heading.innerHTML = '';
            const wrapper = document.createElement('span');
            wrapper.className = 'split-flap-wrapper';
            heading.appendChild(wrapper);

            // 2. Build Reels
            const maxLen = Math.max(engGraphemes.length, kanGraphemes.length);
            const reels = [];

            for (let i = 0; i < maxLen; i++) {
                const engChar = engGraphemes[i] || '';
                const kanChar = kanGraphemes[i] || '';

                // Handle spaces as plain inline elements (no reel, no animation)
                if (engChar === ' ' || kanChar === ' ') {
                    const spaceEl = document.createElement('span');
                    spaceEl.className = 'sf-space';
                    wrapper.appendChild(spaceEl);
                    continue;
                }

                const charEl = document.createElement('span');
                charEl.className = 'sf-char';

                const reelEl = document.createElement('div');
                reelEl.className = 'sf-reel';

                // Measure widths
                const wEng = Math.ceil(measureWidth(engChar, heading));
                const wKan = Math.ceil(measureWidth(kanChar, heading));

                charEl.style.setProperty('--w-eng', `${wEng}px`);
                charEl.style.setProperty('--w-kan', `${wKan}px`);

                const sequence = [engChar, kanChar];

                sequence.forEach(char => {
                    const g = document.createElement('span');
                    g.className = 'sf-glyph';
                    g.textContent = char;
                    reelEl.appendChild(g);
                });

                charEl.appendChild(reelEl);
                wrapper.appendChild(charEl);

                // Stagger (use reel count, not char index, to avoid gaps in timing)
                const delay = `${reels.length * CONFIG.splitFlap.speed}s`;
                reelEl.style.transitionDelay = delay;
                charEl.style.transitionDelay = delay;

                reels.push({ reel: reelEl });
            }

            function toggle(toKannada) {
                if (toKannada) wrapper.classList.add('active');
                else wrapper.classList.remove('active');

                // If sequence is [Eng, Kan], we just move -1.2em
                const offset = toKannada ? `-${1.2}em` : '0em';
                reels.forEach(obj => {
                    obj.reel.style.transform = `translateY(${offset})`;
                });
            }

            if (isTouch) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => toggle(true), 200);
                            setTimeout(() => toggle(false), 2500);
                        }
                    });
                }, { threshold: 0.5 });
                observer.observe(heading);
            } else {
                heading.addEventListener('mouseenter', () => toggle(true));
                heading.addEventListener('mouseleave', () => toggle(false));
            }
        });
    });
}

// ===================================
// Load Content from JSON (Task 4)
// ===================================

const ICONS = {
    GitHub: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    LinkedIn: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    Default: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.355 1.088 1.195 1.037 1.195 1.037l-.155.513c-2.846.563-3.954-1.346-3.273-1.288z"/></svg>'
};

async function loadContent() {
    try {
        const response = await fetch(CONFIG.contentPath);
        if (!response.ok) throw new Error('Content not found');

        const content = await response.json();

        const aboutText = document.getElementById('about-text');
        if (aboutText && content.about) aboutText.innerHTML = content.about.map(p => `<p>${p}</p>`).join('');

        const skillsGrid = document.getElementById('skills-grid');
        if (skillsGrid && content.directories) {
            skillsGrid.innerHTML = content.directories.map(dir => `
                <div class="skills-column">
                    <div class="dir-header">
                        <span class="prompt">$ ls -la </span>${dir.path}
                    </div>
                    <div class="ls-header">
                        <span>NAME</span>
                        <span>SIZE</span>
                        <span>PERMS</span>
                    </div>
                    <hr class="ls-separator">
                    <div class="skills-list">
                        ${(dir.items || []).map(item => {
                const statusHtml = item.status
                    ? `<span class="status-tag status-tag--${item.status.toLowerCase()}">${item.status}</span>`
                    : '';
                return `
                            <div class="ls-row">
                                <div class="skill-tag" tabindex="0">
                                    <span>${item.name}</span>
                                    ${statusHtml}
                                    <div class="bracket top-left"></div>
                                    <div class="bracket top-right"></div>
                                    <div class="bracket bottom-left"></div>
                                    <div class="bracket bottom-right"></div>
                                </div>
                                <span class="ls-size">${item.size || ''}</span>
                                <span class="ls-perms">${item.permissions || ''}</span>
                            </div>`;
            }).join('')}
                    </div>
                </div>
            `).join('');

            // Initialize Animation Trigger
            initSkillsBrackets();
        }

        const emailLink = document.getElementById('contact-email');
        if (emailLink && content.email) { emailLink.href = `mailto:${content.email}`; emailLink.innerText = content.email; }

        const socialsContainer = document.getElementById('socials-container');
        if (socialsContainer && content.socials) {
            socialsContainer.innerHTML = content.socials.map(social => `
                <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${social.name}">
                    ${ICONS[social.name] || ICONS.Default}
                </a>
            `).join('');
        }
    } catch (error) { console.warn('Could not load content.json:', error.message); }
}

// ===================================
// Skills Bracket Animation (Task 9)
// ===================================

function initSkillsBrackets() {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) return; // Desktop uses CSS :hover

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered trigger for each tag in the visible column
                const tags = entry.target.querySelectorAll('.skill-tag');
                tags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.classList.add('active');
                        // Remove active class after some time?
                        // User said: "settle so the user can see the effect". 
                        // Leaving it active implies "selected" look. 
                        // Let's keep it active or toggle it. 
                        // "Trigger once... and then settle". 
                        // Settle usually means finish animation. 
                        // Since animation is "bracket expansion", keeping .active keeps brackets expanded.
                        // I'll keep it active.
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skills-column').forEach(col => {
        observer.observe(col);
    });
}

async function loadProjects() {
    try {
        const response = await fetch(CONFIG.projectsPath);
        if (!response.ok) throw new Error('Projects not found');
        const projects = await response.json();
        const grid = document.getElementById('projects-grid');
        if (!grid || !projects.length) return;

        const githubIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
        const arrowIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.75 2h3.5a.75.75 0 010 1.5H5.56l6.22 6.22a.75.75 0 11-1.06 1.06L4.5 4.56v1.69a.75.75 0 01-1.5 0v-3.5A.75.75 0 013.75 2z"/></svg>`;

        grid.innerHTML = projects.map(project => `
      <article class="project-card" tabindex="0">
        <div class="project-header">
          <h3 class="project-title"><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a></h3>
          <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link-btn" aria-label="View ${project.title} on GitHub">${githubIcon}</a>
        </div>
        <p class="project-desc">${project.description}</p>
        <div class="project-tech">${project.tech.map(t => `<span>${t}</span>`).join('')}</div>
        <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-action">View Project ${arrowIcon}</a>
      </article>`).join('');
    } catch (error) { console.warn('Could not load projects.json:', error.message); }
}

// ===================================
// Tagline Typewriter (Task 8b)
// ===================================

function initTaglineTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    const cfg = CONFIG.typewriter;
    const phrases = cfg.phrases;
    let phraseIndex = 0;
    let charIndex = 0;
    let isErasing = false;

    // Inject CSS for blinking cursor
    if (!document.getElementById('typewriter-css')) {
        const style = document.createElement('style');
        style.id = 'typewriter-css';
        style.innerHTML = `
            [data-typewriter] {
                border-right: 2px solid var(--accent, #64ffda);
                padding-right: 2px;
                animation: tw-blink 0.7s step-end infinite;
            }
            @keyframes tw-blink {
                50% { border-color: transparent; }
            }
        `;
        document.head.appendChild(style);
    }

    // Helper: get graphemes for correct Kannada character handling
    function getGraphemes(text) {
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text)).map(s => s.segment);
        }
        return text.split('');
    }

    function tick() {
        const currentPhrase = phrases[phraseIndex];
        const graphemes = getGraphemes(currentPhrase);

        // Calculate dynamic speed: longer phrases type slower per char
        // This ensures both phrases take roughly the same total time
        const baseTime = 2000; // Target time in ms for typing a phrase
        const dynamicTypeSpeed = Math.max(40, baseTime / graphemes.length);
        const dynamicEraseSpeed = dynamicTypeSpeed * 0.5;

        if (!isErasing) {
            // Typing
            if (charIndex <= graphemes.length) {
                el.textContent = graphemes.slice(0, charIndex).join('');
                charIndex++;
                setTimeout(tick, dynamicTypeSpeed);
            } else {
                // Done typing — hold, then start erasing
                isErasing = true;
                setTimeout(tick, cfg.holdDelay);
            }
        } else {
            // Erasing
            if (charIndex > 0) {
                charIndex--;
                el.textContent = graphemes.slice(0, charIndex).join('');
                setTimeout(tick, dynamicEraseSpeed);
            } else {
                // Done erasing — move to next phrase
                isErasing = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, cfg.pauseDelay);
            }
        }
    }

    // Start after a short delay
    setTimeout(tick, 800);
}
// ===================================
// Easter Egg: Developer Console Greeting
// ===================================

function printConsoleEasterEgg() {
    const asciiArt = `
 __   __                           _    _                     _ 
 \\ \\ / /__ _ ___ ___ ___ _ _      /_\\  | |_  _ __  ___ __| |
  \\ V / _\` (_-<_-</ -_) '_|    / _ \\ | ' \\| '  \\/ -_) _\` |
   |_|\\__,_/__/__/\\___|_|      /_/ \\_\\|_||_|_|_|_|\\___\\__,_|
`;

    const accentStyle = 'color: #2dd4bf; font-family: monospace; font-size: 14px; font-weight: bold;';
    const subtleStyle = 'color: #6b7280; font-family: monospace; font-size: 11px;';
    const statusStyle = 'color: #2dd4bf; font-family: monospace; font-size: 12px;';

    console.log('%c' + asciiArt, accentStyle);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', subtleStyle);
    console.log('%c  ⚡ System Status: ONLINE', statusStyle);
    console.log('%c  🧠 ML & Data Science Portfolio', statusStyle);
    console.log('%c  🔧 Built with: Vanilla JS • CSS3 • JSON', subtleStyle);
    console.log('%c  📫 yasser.ahmed.dev@gmail.com', subtleStyle);
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', subtleStyle);
    console.log('%c  ← You found the Easter Egg! Nice detective work. 🕵️', 'color: #2dd4bf; font-style: italic; font-size: 11px;');
}

// ===================================
// Grid Background (Task 12)
// ===================================

// ===================================
// Grid Background (Task 12)
// ===================================

function initGridBackground() {
    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let mouseX = -9999;
    let mouseY = -9999;
    let animId = null;
    const GRID_SIZE = 40;
    const GLOW_RADIUS = 250;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw base grid (faint)
        ctx.beginPath();
        for (let x = GRID_SIZE; x < canvas.width; x += GRID_SIZE) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = GRID_SIZE; y < canvas.height; y += GRID_SIZE) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.strokeStyle = 'rgba(139, 146, 153, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 2. Draw highlight grid (bright) - Masked by "flashlight"
        ctx.save();
        ctx.beginPath();
        // Only draw lines near mouse to optimize? 
        // For simplicity, redraw all (canvas handles clipping efficiently)
        // actually, optimization: only draw lines within GLOW_RADIUS of mouse
        const startX = Math.floor((mouseX - GLOW_RADIUS) / GRID_SIZE) * GRID_SIZE;
        const endX = mouseX + GLOW_RADIUS;
        const startY = Math.floor((mouseY - GLOW_RADIUS) / GRID_SIZE) * GRID_SIZE;
        const endY = mouseY + GLOW_RADIUS;

        for (let x = Math.max(GRID_SIZE, startX); x < Math.min(canvas.width, endX); x += GRID_SIZE) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        for (let y = Math.max(GRID_SIZE, startY); y < Math.min(canvas.height, endY); y += GRID_SIZE) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }

        ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)'; // Accent color
        ctx.lineWidth = 1;
        ctx.stroke();

        // 3. Mask the bright grid with radial gradient
        ctx.globalCompositeOperation = 'destination-in';
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, GLOW_RADIUS);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.restore();

        animId = requestAnimationFrame(draw);
    }
    draw();

    // Expose stop/start for scroll transitions
    canvas._gridStop = () => { cancelAnimationFrame(animId); animId = null; };
    canvas._gridStart = () => { if (!animId) draw(); };
}

// ===================================
// Easter Egg Bug (Task 12)
// ===================================

function initEasterBug() {
    const bug = document.getElementById('easter-bug');
    const hero = document.getElementById('hero');
    if (!bug || !hero) return;

    // --- 1. Smart Placement ---
    bug.addEventListener('click', () => {
        bug.classList.add('bug-caught');
        console.log('%c🐛 Bug caught! Nice reflexes.', 'color: #2dd4bf; font-weight: bold; font-family: monospace;');
        showToast('🪲 Bug caught! Nice reflexes.');
    });

    const heading = hero.querySelector('.hero-name');
    if (!heading) return;

    const rect = heading.getBoundingClientRect();
    const margin = 30; // space from heading edge
    const edgePad = 40; // min distance from viewport edge

    // Pick random quadrant
    const quadrants = [
        { x: rect.left - margin - 20, y: rect.top - margin - 20 },       // top-left
        { x: rect.right + margin, y: rect.top - margin - 20 },           // top-right
        { x: rect.left - margin - 20, y: rect.bottom + margin },         // bottom-left
        { x: rect.right + margin, y: rect.bottom + margin }              // bottom-right
    ];
    const pos = quadrants[Math.floor(Math.random() * quadrants.length)];

    // Clamp to viewport
    const clampedX = Math.max(edgePad, Math.min(window.innerWidth - edgePad - 20, pos.x));
    const clampedY = Math.max(edgePad, Math.min(window.innerHeight - edgePad - 20, pos.y));

    bug.style.left = clampedX + 'px';
    bug.style.top = clampedY + 'px';

    // --- 2. State ---
    let discovered = false;
    const bugX = clampedX + 10; // center of bug
    const bugY = clampedY + 10;
    const REVEAL_DIST = 200;
    const GLOW_DIST = 80;

    // --- 3. Proximity Logic ---
    document.addEventListener('mousemove', (e) => {
        if (bug.classList.contains('bug-hidden')) return;

        const dx = e.clientX - bugX;
        const dy = e.clientY - bugY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REVEAL_DIST) {
            // Fade in proportionally
            const proximity = 1 - (dist / REVEAL_DIST);
            bug.style.opacity = Math.min(1, proximity * 1.5);

            if (!discovered) {
                discovered = true;
                bug.classList.remove('bug-pulse');
            }

            // Strong glow when very close
            if (dist < GLOW_DIST) {
                bug.classList.add('bug-glow');
            } else {
                bug.classList.remove('bug-glow');
            }
        } else {
            // If pulse is active, keep it faintly visible
            if (bug.classList.contains('bug-pulse')) {
                bug.style.opacity = '0.5';
            } else {
                bug.style.opacity = '0';
            }
            bug.classList.remove('bug-glow');
        }
    });

    // --- 4. Discoverability Pulse (6s timeout) ---
    setTimeout(() => {
        if (!discovered && !bug.classList.contains('bug-hidden')) {
            bug.classList.add('bug-pulse');
            bug.style.opacity = '0.3'; // faint visibility for pulse
        }
    }, 6000);

    // Expose hide/show for scroll transitions
    bug._hide = () => { bug.classList.add('bug-hidden'); };
    bug._show = () => {
        bug.classList.remove('bug-hidden');
        if (!discovered) {
            bug.style.opacity = '0';
        }
    };
}

// ===================================
// Toast Notification (Debug/Feedback)
// ===================================

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ===================================
// Navigation Scroll-Spy (Task 16)
// ===================================

function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    if (!navLinks.length) return;

    const sections = ['hero', 'about', 'projects', 'contact'];
    const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const matches = link.getAttribute('data-section') === id;
                    link.classList.toggle('active', matches);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    });

    sectionEls.forEach(section => observer.observe(section));
}

// ===================================
// Scroll Transitions (Task 12)
// ===================================

function initScrollTransitions() {
    const canvas = document.getElementById('grid-canvas');
    const bug = document.getElementById('easter-bug');
    const about = document.getElementById('about');
    if (!about) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // If About is entering viewport (scrolling down) -> Hide Grid/Bug
            if (entry.isIntersecting) {
                if (canvas) {
                    canvas.classList.add('grid-hidden');
                    if (canvas._gridStop) canvas._gridStop();
                }
                if (bug && bug._hide) bug._hide();
            } else {
                // If About is NOT intersecting
                // We need to check if we are ABOVE or BELOW it.
                // But generally for this single-page site, not intersecting means we are either at top or way below.
                // If boundingClientRect.top is positive, we are above it (at Hero).
                if (entry.boundingClientRect.top > 0) {
                    if (canvas) {
                        canvas.classList.remove('grid-hidden');
                        if (canvas._gridStart) canvas._gridStart();
                    }
                    if (bug && bug._show) bug._show();
                }
            }
        });
    }, {
        threshold: 0.1 // Interact when 10% of About is visible
    });

    observer.observe(about);
}

document.addEventListener('DOMContentLoaded', () => {
    printConsoleEasterEgg();
    initCLIIntro();
    // initSplitFlapHeadings & initTaglineTypewriter invoked by initCLIIntro after animation
    loadContent();
    loadProjects();
    initScrollSpy();
});
