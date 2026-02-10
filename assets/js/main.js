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
        // Translations for sections
        translations: {
            'About': 'ಬಗ್ಗೆ',
            'Projects': 'ಯೋಜನೆಗಳು',
            'Contact': 'ಸಂಪರ್ಕ'
            // Add more as needed
        }
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

        // IMPORTANT: Initialize Split-Flap AFTER content is visible
        // otherwise getBoundingClientRect() returns 0 width.
        requestAnimationFrame(() => {
            initSplitFlapHeadings();
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
                transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            .split-flap-wrapper.active .sf-char {
                width: var(--w-kan);
            }
            .sf-reel {
                display: flex;
                flex-direction: column;
                position: relative;
                top: 0;
                left: 0;
                min-width: 100%;
                transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
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

            const originalText = heading.textContent.trim();
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
                const charEl = document.createElement('span');
                charEl.className = 'sf-char';

                const reelEl = document.createElement('div');
                reelEl.className = 'sf-reel';

                const engChar = engGraphemes[i] || '';
                const kanChar = kanGraphemes[i] || '';

                // Measure widths
                const wEng = Math.ceil(measureWidth(engChar, heading));
                const wKan = Math.ceil(measureWidth(kanChar, heading));

                // Note: if wEng/wKan is 0 (due to empty string), css width becomes 0px.
                charEl.style.setProperty('--w-eng', `${wEng}px`);
                charEl.style.setProperty('--w-kan', `${wKan}px`);

                // Sequence: Just [English, Kannada]
                // This removes the "Random" spin and just creates a direct slide transition
                // which feels cleaner and solves the spacing/random-char concerns.
                const sequence = [engChar, kanChar];

                sequence.forEach(char => {
                    const g = document.createElement('span');
                    g.className = 'sf-glyph';
                    g.textContent = char;
                    reelEl.appendChild(g);
                });

                charEl.appendChild(reelEl);
                wrapper.appendChild(charEl);

                // Stagger
                const delay = `${i * CONFIG.splitFlap.speed}s`;
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

        const skills = document.getElementById('skills');
        if (skills && content.skills) skills.innerHTML = content.skills.map(skill => `<span>${skill}</span>`).join('');

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

async function loadProjects() {
    try {
        const response = await fetch(CONFIG.projectsPath);
        if (!response.ok) throw new Error('Projects not found');
        const projects = await response.json();
        const grid = document.getElementById('projects-grid');
        if (!grid || !projects.length) return;
        grid.innerHTML = projects.map(project => `
      <article class="project-card">
        <h3 class="project-title"><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a></h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tech">${project.tech.map(t => `<span>${t}</span>`).join('')}</div>
      </article>`).join('');
    } catch (error) { console.warn('Could not load projects.json:', error.message); }
}

document.addEventListener('DOMContentLoaded', () => {
    initCLIIntro();
    // initSplitFlapHeadings invoked by initCLIIntro after animation
    loadContent();
    loadProjects();
});
