/**
 * Personal Portfolio - Yasser Ahmed
 * Main JavaScript
 * 
 * This file handles:
 * - CLI intro animation (Task 1)
 * - Scrambled heading hover effects (Task 3)
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

    // Scramble effect settings
    scramble: {
        duration: 600,        // Total scramble time in ms (slower for readability)
        interval: 50,         // Update interval in ms
        // Kannada Unicode characters (U+0C80–U+0CFF)
        chars: 'ಅಆಇಈಉಊಋಎಏಐಒಓಔಕಖಗಘಙಚಛಜಝಞಟಠಡಢಣತಥದಧನಪಫಬಭಮಯರಲವಶಷಸಹಳ'
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

    // Skip intro function with smooth transition
    function skipIntro() {
        if (isIntroSkipped) return;
        isIntroSkipped = true;

        // Cancel any ongoing animation
        if (cliAnimationId) {
            cancelAnimationFrame(cliAnimationId);
        }

        // Fade out intro
        intro.style.opacity = '0';
        intro.style.transition = 'opacity 0.3s ease';

        setTimeout(() => {
            intro.classList.add('hidden');
            mainContent.removeAttribute('hidden');
            mainContent.style.opacity = '0';
            mainContent.style.transition = 'opacity 0.4s ease';

            // Trigger reflow then fade in
            requestAnimationFrame(() => {
                mainContent.style.opacity = '1';
            });
        }, 300);

        document.removeEventListener('keydown', handleEsc);
    }

    function handleEsc(e) {
        if (e.key === 'Escape') {
            skipIntro();
        }
    }

    // Skip button click
    if (skipBtn) {
        skipBtn.addEventListener('click', skipIntro);
    }

    // Esc key to skip
    document.addEventListener('keydown', handleEsc);

    // If reduced motion, skip immediately
    if (prefersReducedMotion()) {
        intro.classList.add('hidden');
        mainContent.removeAttribute('hidden');
        return;
    }

    // Start typing animation
    typeLines(cliOutput, cursor, CLI_LINES, skipIntro);
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

        // Type the line character by character
        await typeLine(output, line.text, line.type === 'command' ? CONFIG.typingSpeed : CONFIG.typingSpeed * 0.5);
        output.textContent += '\n';

        // Delay after line
        if (line.delay) {
            await sleep(line.delay);
        }
    }

    // Animation complete - wait a moment then transition
    await sleep(400);
    if (!isIntroSkipped) {
        onComplete();
    }
}

/**
 * Type a single line character by character
 */
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

/**
 * Promise-based sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// Scramble Headings (Task 3 - placeholder)
// ===================================

function initScrambleHeadings() {
    const headings = document.querySelectorAll('[data-scramble]');

    headings.forEach(heading => {
        const originalText = heading.textContent;
        let isAnimating = false;

        heading.addEventListener('mouseenter', () => {
            if (prefersReducedMotion() || isAnimating) return;

            isAnimating = true;
            const startTime = Date.now();
            const duration = CONFIG.scramble.duration;

            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // Scramble effect: replace some chars with Kannada
                    const scrambled = originalText.split('').map((char, i) => {
                        if (char === ' ') return ' ';
                        const scrambleChance = 1 - progress;
                        if (Math.random() < scrambleChance) {
                            return CONFIG.scramble.chars[Math.floor(Math.random() * CONFIG.scramble.chars.length)];
                        }
                        return char;
                    }).join('');

                    heading.textContent = scrambled;
                    requestAnimationFrame(animate);
                } else {
                    heading.textContent = originalText;
                    isAnimating = false;
                }
            }

            requestAnimationFrame(animate);
        });

        heading.addEventListener('mouseleave', () => {
            heading.textContent = originalText;
            isAnimating = false;
        });
    });
}

// ===================================
// Load Content from JSON (Task 4)
// ===================================

async function loadContent() {
    try {
        const response = await fetch(CONFIG.contentPath);
        if (!response.ok) throw new Error('Content not found');

        const content = await response.json();

        // Populate About section
        const aboutText = document.getElementById('about-text');
        if (aboutText && content.about) {
            aboutText.innerHTML = content.about.map(p => `<p>${p}</p>`).join('');
        }

        // Populate Skills
        const skills = document.getElementById('skills');
        if (skills && content.skills) {
            skills.innerHTML = content.skills.map(skill => `<span>${skill}</span>`).join('');
        }
    } catch (error) {
        console.warn('Could not load content.json:', error.message);
    }
}

// ===================================
// Load Projects from JSON (Task 5)
// ===================================

async function loadProjects() {
    try {
        const response = await fetch(CONFIG.projectsPath);
        if (!response.ok) throw new Error('Projects not found');

        const projects = await response.json();
        const grid = document.getElementById('projects-grid');

        if (!grid || !projects.length) return;

        grid.innerHTML = projects.map(project => `
      <article class="project-card">
        <h3 class="project-title">
          <a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a>
        </h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tech">
          ${project.tech.map(t => `<span>${t}</span>`).join('')}
        </div>
      </article>
    `).join('');
    } catch (error) {
        console.warn('Could not load projects.json:', error.message);
    }
}

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    initCLIIntro();
    initScrambleHeadings();
    loadContent();
    loadProjects();
});
