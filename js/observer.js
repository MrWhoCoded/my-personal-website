import { showToast } from './utils.js';

export function initGridBackground() {
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

        ctx.save();
        ctx.beginPath();
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

        ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();

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

    canvas._gridStop = () => { cancelAnimationFrame(animId); animId = null; };
    canvas._gridStart = () => { if (!animId) draw(); };
}

export function initEasterBug() {
    const bug = document.getElementById('easter-bug');
    const hero = document.getElementById('hero');
    if (!bug || !hero) return;

    bug.addEventListener('click', () => {
        const bugRect = bug.getBoundingClientRect();
        bug.classList.add('bug-caught');
        console.log('%c🐛 Bug caught! Nice reflexes.', 'color: #2dd4bf; font-weight: bold; font-family: monospace;');
        showToast('🪲 Bug caught! Nice reflexes.', { x: bugRect.left, y: bugRect.top });
    });

    const heading = hero.querySelector('.hero-name');
    if (!heading) return;

    const rect = heading.getBoundingClientRect();
    const margin = 30;
    const edgePad = 40;

    const quadrants = [
        { x: rect.left - margin - 20, y: rect.top - margin - 20 },
        { x: rect.right + margin, y: rect.top - margin - 20 },
        { x: rect.left - margin - 20, y: rect.bottom + margin },
        { x: rect.right + margin, y: rect.bottom + margin }
    ];
    const pos = quadrants[Math.floor(Math.random() * quadrants.length)];

    const clampedX = Math.max(edgePad, Math.min(window.innerWidth - edgePad - 20, pos.x));
    const clampedY = Math.max(edgePad, Math.min(window.innerHeight - edgePad - 20, pos.y));

    bug.style.left = clampedX + 'px';
    bug.style.top = clampedY + 'px';

    let discovered = false;
    const bugX = clampedX + 10;
    const bugY = clampedY + 10;
    const REVEAL_DIST = 200;
    const GLOW_DIST = 80;

    document.addEventListener('mousemove', (e) => {
        if (bug.classList.contains('bug-hidden')) return;

        const dx = e.clientX - bugX;
        const dy = e.clientY - bugY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REVEAL_DIST) {
            const proximity = 1 - (dist / REVEAL_DIST);
            bug.style.opacity = Math.min(1, proximity * 1.5);

            if (!discovered) {
                discovered = true;
                bug.classList.remove('bug-pulse');
            }

            if (dist < GLOW_DIST) {
                bug.classList.add('bug-glow');
            } else {
                bug.classList.remove('bug-glow');
            }
        } else {
            if (bug.classList.contains('bug-pulse')) {
                bug.style.opacity = '0.5';
            } else {
                bug.style.opacity = '0';
            }
            bug.classList.remove('bug-glow');
        }
    });

    setTimeout(() => {
        if (!discovered && !bug.classList.contains('bug-hidden')) {
            bug.classList.add('bug-pulse');
            bug.style.opacity = '0.3';
        }
    }, 6000);

    bug._hide = () => { bug.classList.add('bug-hidden'); };
    bug._show = () => {
        bug.classList.remove('bug-hidden');
        if (!discovered) {
            bug.style.opacity = '0';
        }
    };
}

export function initSystemLayers() {
    const mainContent = document.getElementById('main-content');
    const watermarks = document.querySelectorAll('.watermark');
    const hero = document.getElementById('hero');
    if (!mainContent || !hero) return;

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            watermarks.forEach((wm, i) => {
                const speed = 0.05 + (i * 0.03);
                const baseRotation = wm.classList.contains('wm-1') ? -12
                    : wm.classList.contains('wm-2') ? 8 : -5;
                wm.style.transform = `rotate(${baseRotation}deg) translateY(${scrollY * speed}px)`;
            });
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                mainContent.classList.add('layers-active');
            } else if (entry.intersectionRatio > 0.8) {
                mainContent.classList.remove('layers-active');
            }
        });
    }, { threshold: [0, 0.8] });

    observer.observe(hero);
}

export function initScrollSpy() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    if (!navLinks.length) return;

    const sections = ['hero', 'about', 'projects', 'certifications', 'contact'];
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
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    sectionEls.forEach(section => observer.observe(section));
}

export function initScrollTransitions() {
    const canvas = document.getElementById('grid-canvas');
    const bug = document.getElementById('easter-bug');
    const about = document.getElementById('about');
    if (!about) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (canvas) {
                    canvas.classList.add('grid-hidden');
                    if (canvas._gridStop) canvas._gridStop();
                }
                if (bug && bug._hide) bug._hide();
            } else {
                if (entry.boundingClientRect.top > 0) {
                    if (canvas) {
                        canvas.classList.remove('grid-hidden');
                        if (canvas._gridStart) canvas._gridStart();
                    }
                    if (bug && bug._show) bug._show();
                }
            }
        });
    }, { threshold: 0.1 });

    observer.observe(about);
}

export function initSkillsBrackets() {
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tags = entry.target.querySelectorAll('.skill-tag');
                tags.forEach((tag, index) => {
                    setTimeout(() => tag.classList.add('active'), index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skills-column').forEach(col => observer.observe(col));
}

export function printConsoleEasterEgg() {
    const asciiArt = `
 __   __                           _    _                     _ 
 \ \ / /__ _ ___ ___ ___ _ _      /_\  | |_  _ __  ___ __| |
  \ V / _\` (_-<_-</ -_) '_|    / _ \ | ' \| '  \/ -_) _\` |
   |_|\__,_/__/__/\___|_|      /_/ \_\|_||_|_|_|_|\___\__,_|
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

export function initCommandLauncher() {
    const launcher = document.getElementById('cmd-launcher');
    const backdrop = document.getElementById('cmd-palette-backdrop');
    const modal = document.getElementById('cmd-palette-modal');
    const closeBtn = document.getElementById('cmd-palette-close');
    const input = document.getElementById('cmd-palette-input');
    const output = document.getElementById('cmd-palette-output');

    if (!launcher || !backdrop) return;

    function openPalette() {
        backdrop.hidden = false;
        backdrop.setAttribute('aria-hidden', 'false');
        backdrop.offsetHeight;
        backdrop.classList.add('open');
        if (input) {
            setTimeout(() => input.focus(), 50);
        }
        document.addEventListener('keydown', handleKeyDown);
    }

    function closePalette() {
        backdrop.classList.remove('open');
        document.removeEventListener('keydown', handleKeyDown);
        setTimeout(() => {
            backdrop.hidden = true;
            backdrop.setAttribute('aria-hidden', 'true');
        }, 250);
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            closePalette();
        }
    }

    function appendOutputLine(text, className = '') {
        if (!output) return;
        const entry = document.createElement('div');
        entry.className = `cmd-output-entry ${className}`.trim();
        entry.textContent = text;
        output.appendChild(entry);
        output.scrollTop = output.scrollHeight;
    }

    function scrollToSection(id) {
        const el = document.getElementById(id);
        if (el) {
            closePalette();
            el.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function triggerResumeDownload() {
        const link = document.createElement('a');
        link.href = './resume/YasserAhmedMohammed_BMSCE.pdf';
        link.download = 'YasserAhmedMohammed_BMSCE.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const COMMANDS = {
        help: () => `Available Commands\n\nabout\nprojects\nskills\ncontact\nresume\nclear`,
        about: () => {
            scrollToSection('about');
            return null;
        },
        projects: () => {
            scrollToSection('projects');
            return null;
        },
        skills: () => {
            scrollToSection('skills-grid');
            return null;
        },
        contact: () => {
            scrollToSection('contact');
            return null;
        },
        resume: () => {
            triggerResumeDownload();
            return null;
        },
        clear: () => {
            if (output) output.innerHTML = '';
            return null;
        }
    };

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const raw = input.value.trim();
                input.value = '';
                if (!raw) return;

                const cmd = raw.toLowerCase();

                // Render typed command in output stream
                appendOutputLine(`$ ${raw}`, 'cmd-output-cmd');

                if (cmd === 'clear') {
                    if (output) output.innerHTML = '';
                    return;
                }

                if (COMMANDS[cmd]) {
                    const result = COMMANDS[cmd]();
                    if (result) {
                        appendOutputLine(result, 'cmd-output-text');
                    }
                } else {
                    appendOutputLine(`Command not found.\nType "help".`, 'cmd-output-error');
                }
            }
        });
    }

    launcher.addEventListener('click', (e) => {
        e.stopPropagation();
        openPalette();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closePalette);
    }

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            closePalette();
        }
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}