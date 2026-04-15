export const CONFIG = {
    contentPath: './data/content.json',
    projectsPath: './data/projects.json',
    certificationsPath: './data/certifications.json',
    typingSpeed: 30,
    splitFlap: {
        speed: 0.05,
        translations: {
            'About': 'ಬಗ್ಗೆ',
            'Projects': 'ಯೋಜನೆಗಳು',
            'Contact': 'ಸಂಪರ್ಕ'
        }
    },
    typewriter: {
        phrases: [
            'exploring data-driven intelligence',
            'ಡೇಟಾ ಚಾಲಿತ ಬುದ್ಧಿಮತ್ತೆಯನ್ನು ಅನ್ವೇಷಿಸುವುದು'
        ],
        typeSpeed: 60,
        eraseSpeed: 30,
        holdDelay: 2000,
        pauseDelay: 500
    }
};

export function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Not found: ' + url);
        return await response.json();
    } catch (error) {
        console.error('JSON load failed', error);
        return null;
    }
}