import { CONFIG, prefersReducedMotion, sleep } from './utils.js';
import { initSplitFlapHeadings, initTaglineTypewriter } from './typewriter.js';
import { initGridBackground, initEasterBug, initScrollTransitions } from './observer.js';

let cliAnimationId = null;
let isIntroSkipped = false;

export async function initCLIIntro() {
    const intro = document.getElementById('cli-intro');
    const mainContent = document.getElementById('main-content');
    const skipBtn = document.getElementById('skip-intro');
    const cliOutput = document.getElementById('cli-output');
    const cursor = document.querySelector('.cli-cursor');

    if (!intro || !mainContent || !cliOutput) return;

    function finishIntro() {
        intro.classList.add('hidden');
        mainContent.removeAttribute('hidden');
        mainContent.style.opacity = '1';
        document.removeEventListener('keydown', handleEsc);

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
        if (e.key === 'Escape') skipIntro();
    }

    if (skipBtn) skipBtn.addEventListener('click', skipIntro);
    document.addEventListener('keydown', handleEsc);

    if (prefersReducedMotion()) {
        finishIntro();
        return;
    }

    // Try to fetch CLI lines from content.json, fallback if failed
    let lines = [];
    try {
        const res = await fetch(CONFIG.contentPath);
        const data = await res.json();
        lines = data.cliIntro && data.cliIntro.lines ?
            data.cliIntro.lines.map(line => ({ text: line, type: line.startsWith('$') ? 'command' : 'output', delay: line.startsWith('$') ? 0 : 150 })) :
            [
                { text: '$ whoami', type: 'command' },
                { text: 'yasser_ahmed', type: 'output', delay: 200 }
            ];
    } catch (e) {
        console.error("CLI load failed", e);
        lines = [
            { text: '$ whoami', type: 'command' },
            { text: 'yasser_ahmed', type: 'output', delay: 200 }
        ];
    }

    typeLines(cliOutput, cursor, lines, () => setTimeout(finishIntro, 500));
}

async function typeLines(output, cursor, lines, onComplete) {
    for (let i = 0; i < lines.length; i++) {
        if (isIntroSkipped) return;
        const line = lines[i];
        if (line.text === '') {
            output.textContent += '\n';
            await sleep(100);
            continue;
        }
        await typeLine(output, line.text, line.type === 'command' ? CONFIG.typingSpeed : CONFIG.typingSpeed * 0.5);
        output.textContent += '\n';
        if (line.delay) await sleep(line.delay);
    }
    await sleep(400);
    if (!isIntroSkipped) onComplete();
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
            cliAnimationId = requestAnimationFrame(() => setTimeout(typeChar, speed));
        }
        typeChar();
    });
}