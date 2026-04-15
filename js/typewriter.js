import { CONFIG } from './utils.js';

export function initTaglineTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    const cfg = CONFIG.typewriter;
    const phrases = cfg.phrases;
    let phraseIndex = 0;
    let charIndex = 0;
    let isErasing = false;

    if (!document.getElementById('typewriter-css')) {
        const style = document.createElement('style');
        style.id = 'typewriter-css';
        style.innerHTML = `
            [data-typewriter] {
                border-right: 2px solid var(--color-accent, #64ffda);
                padding-right: 2px;
                animation: tw-blink 0.7s step-end infinite;
            }
            @keyframes tw-blink {
                50% { border-color: transparent; }
            }
        `;
        document.head.appendChild(style);
    }

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
        const baseTime = 2000;
        const dynamicTypeSpeed = Math.max(40, baseTime / graphemes.length);
        const dynamicEraseSpeed = dynamicTypeSpeed * 0.5;

        if (!isErasing) {
            if (charIndex <= graphemes.length) {
                el.textContent = graphemes.slice(0, charIndex).join('');
                charIndex++;
                setTimeout(tick, dynamicTypeSpeed);
            } else {
                isErasing = true;
                setTimeout(tick, cfg.holdDelay);
            }
        } else {
            if (charIndex > 0) {
                charIndex--;
                el.textContent = graphemes.slice(0, charIndex).join('');
                setTimeout(tick, dynamicEraseSpeed);
            } else {
                isErasing = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, cfg.pauseDelay);
            }
        }
    }
    setTimeout(tick, 800);
}

export function initSplitFlapHeadings() {
    const headings = document.querySelectorAll('[data-scramble]');
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (!document.getElementById('split-flap-css')) {
        const style = document.createElement('style');
        style.id = 'split-flap-css';
        style.innerHTML = `
            .split-flap-wrapper { display: inline-flex; white-space: nowrap; vertical-align: bottom; }
            .sf-char { display: inline-flex; flex-direction: column; position: relative; height: 1.2em; line-height: 1.2em; overflow: hidden; vertical-align: bottom; width: var(--w-eng); transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
            .split-flap-wrapper.active .sf-char { width: var(--w-kan); }
            .sf-space { display: inline-block; width: 0.3em; }
            .sf-reel { display: flex; flex-direction: column; position: relative; top: 0; left: 0; min-width: 100%; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); will-change: transform; }
            .sf-glyph { height: 1.2em; display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 100%; }
        `;
        document.head.appendChild(style);
    }

    function getGraphemes(text) {
        if (window.Intl && Intl.Segmenter) {
            const segmenter = new Intl.Segmenter('kn', { granularity: 'grapheme' });
            return Array.from(segmenter.segment(text)).map(s => s.segment);
        }
        return text.split('');
    }

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
            if (heading.querySelector('.split-flap-wrapper')) return;

            const originalText = heading.textContent.trim().replace(/\s+/g, ' ');
            const translation = CONFIG.splitFlap.translations[originalText];

            if (!translation) return;

            const engGraphemes = getGraphemes(originalText);
            const kanGraphemes = getGraphemes(translation);

            heading.innerHTML = '';
            const wrapper = document.createElement('span');
            wrapper.className = 'split-flap-wrapper';
            heading.appendChild(wrapper);

            const maxLen = Math.max(engGraphemes.length, kanGraphemes.length);
            const reels = [];

            for (let i = 0; i < maxLen; i++) {
                const engChar = engGraphemes[i] || '';
                const kanChar = kanGraphemes[i] || '';

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

                const wEng = Math.ceil(measureWidth(engChar, heading));
                const wKan = Math.ceil(measureWidth(kanChar, heading));

                charEl.style.setProperty('--w-eng', `${wEng}px`);
                charEl.style.setProperty('--w-kan', `${wKan}px`);

                [engChar, kanChar].forEach(char => {
                    const g = document.createElement('span');
                    g.className = 'sf-glyph';
                    g.textContent = char;
                    reelEl.appendChild(g);
                });

                charEl.appendChild(reelEl);
                wrapper.appendChild(charEl);

                const delay = `${reels.length * CONFIG.splitFlap.speed}s`;
                reelEl.style.transitionDelay = delay;
                charEl.style.transitionDelay = delay;

                reels.push({ reel: reelEl });
            }

            function toggle(toKannada) {
                if (toKannada) wrapper.classList.add('active');
                else wrapper.classList.remove('active');

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