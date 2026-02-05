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
// Scramble Headings (Task 3 & 7)
// ===================================

function initScrambleHeadings() {
    const headings = document.querySelectorAll('[data-scramble]');
    // Check if primary input mechanism can hover (false for most phones/tablets)
    const isTouch = window.matchMedia('(hover: none)').matches;

    headings.forEach(heading => {
        const originalText = heading.textContent;
        let isAnimating = false;
        let timer = null;

        // Shared Animation Logic
        function playAnimation() {
            if (isAnimating || prefersReducedMotion()) return;
            isAnimating = true;

            const startTime = Date.now();
            const duration = CONFIG.scramble.duration;

            function animate() {
                if (!isAnimating) {
                    heading.textContent = originalText;
                    return;
                }

                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                if (progress < 1) {
                    // Scramble effect
                    const scrambled = originalText.split('').map((char, i) => {
                        if (char === ' ') return ' ';
                        if (Math.random() < (1 - progress)) {
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
        }

        if (isTouch) {
            // Mobile/Touch: Scroll Trigger using Intersection Observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Cooldown: Wait 200ms before triggering to avoid fast-scroll activation
                        timer = setTimeout(() => {
                            // Only play if still intersecting (logic implies we haven't cleared timeout)
                            playAnimation();
                        }, 200);
                    } else {
                        // If scrolled out, cancel upcoming animation
                        if (timer) {
                            clearTimeout(timer);
                            timer = null;
                        }
                        // Stop current animation for performance and clean reset
                        isAnimating = false;
                        heading.textContent = originalText;
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% visible

            observer.observe(heading);

        } else {
            // Desktop: Hover Trigger (with 100ms debounce)
            heading.addEventListener('mouseenter', () => {
                // Debounce: Wait 100ms before starting
                timer = setTimeout(playAnimation, 100);
            });

            heading.addEventListener('mouseleave', () => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                isAnimating = false;
                heading.textContent = originalText;
            });
        }
    });
}

// ===================================
// Load Content from JSON (Task 4)
// ===================================

// SVG Icons
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

        // Populate Contact Email
        const emailLink = document.getElementById('contact-email');
        if (emailLink && content.email) {
            emailLink.href = `mailto:${content.email}`;
            emailLink.innerText = content.email;
        }

        // Populate Socials
        const socialsContainer = document.getElementById('socials-container');
        if (socialsContainer && content.socials) {
            socialsContainer.innerHTML = content.socials.map(social => `
                <a href="${social.url}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${social.name}">
                    ${ICONS[social.name] || ICONS.Default}
                </a>
            `).join('');
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
