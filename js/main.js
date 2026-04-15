import { fetchJSON, CONFIG } from './utils.js';
import { initCLIIntro } from './cli.js';
import { initSkillsBrackets, initScrollSpy, initSystemLayers, printConsoleEasterEgg } from './observer.js';

const ICONS = {
    GitHub: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    LinkedIn: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    Default: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.033 16.01c.564-1.789 1.632-3.932 1.821-4.474.273-.787-.211-1.136-1.74.209l-.34-.64c1.744-1.897 5.335-2.326 4.113.613-.763 1.835-1.309 3.074-1.621 4.03-.355 1.088 1.195 1.037 1.195 1.037l-.155.513c-2.846.563-3.954-1.346-3.273-1.288z"/></svg>'
};

async function loadContent() {
    const content = await fetchJSON(CONFIG.contentPath);
    if (!content) return;

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
}

async function loadProjects() {
    const projects = await fetchJSON(CONFIG.projectsPath);
    const grid = document.getElementById('projects-grid');
    if (!grid || !projects || !projects.length) return;

    const githubIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;
    const arrowIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.75 2h3.5a.75.75 0 010 1.5H5.56l6.22 6.22a.75.75 0 11-1.06 1.06L4.5 4.56v1.69a.75.75 0 01-1.5 0v-3.5A.75.75 0 013.75 2z"/></svg>`;
    const liveIcon = `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/></svg>`;

    grid.innerHTML = projects.map(project => {
        const liveHtml = project.live
            ? `<a href="${project.live}" target="_blank" rel="noopener noreferrer" class="project-action project-live">Live ${liveIcon}</a>`
            : '';
        return `
        <article class="project-card" tabindex="0">
            <div class="project-header">
                <h3 class="project-title"><a href="${project.url}" target="_blank" rel="noopener noreferrer">${project.title}</a></h3>
                <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-link-btn" aria-label="View ${project.title} on GitHub">${githubIcon}</a>
            </div>
            <p class="project-desc">${project.description}</p>
            <div class="project-tech">${project.tech.map(t => `<span>${t}</span>`).join('')}</div>
            <div class="project-actions">
                <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-action">View Project ${arrowIcon}</a>
                ${liveHtml}
            </div>
        </article>`;
    }).join('');
}

async function loadCertifications() {
    const certs = await fetchJSON(CONFIG.certificationsPath);
    const matrix = document.getElementById('cert-matrix');
    if (!matrix || !certs || !certs.length) return;

    matrix.innerHTML = certs.map(cert => {
        const isComing = cert.status === 'COMING SOON...';
        const statusClass = isComing ? 'cert-status--coming' : 'cert-status--certified';
        const cardClass = isComing ? 'cert-card cert-card--coming' : 'cert-card';
        const verifyHtml = !isComing && cert.verify_url && cert.verify_url !== '#'
            ? `<a href="${cert.verify_url}" target="_blank" rel="noopener noreferrer" class="cert-verify">verify →</a>`
            : '';

        return `
        <article class="${cardClass}" tabindex="0">
            <div class="cert-badge">
                <img src="${cert.badge_url}" alt="${cert.title} badge" loading="lazy">
            </div>
            <div class="cert-info">
                <h3 class="cert-title">${cert.title}</h3>
                <p class="cert-issuer">${cert.issuer}</p>
                <p class="cert-id">${cert.id}</p>
                <div class="cert-meta">
                    <span class="cert-status ${statusClass}">${cert.status}</span>
                    <span class="cert-year">${cert.year}</span>
                </div>
                ${verifyHtml}
            </div>
        </article>`;
    }).join('');

    const cards = matrix.querySelectorAll('.cert-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = Array.from(cards).indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 150);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

document.addEventListener('DOMContentLoaded', () => {
    printConsoleEasterEgg();
    initCLIIntro();
    loadContent();
    loadProjects();
    loadCertifications();
    initScrollSpy();
    initSystemLayers();
});