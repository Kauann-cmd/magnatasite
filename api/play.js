// ========================================
// FANTASY MUSIC - JavaScript
// ========================================

const DOMAIN = 'https://magnatamusicas.vercel.app';

// ----------------------------------------
// Toast System
// ----------------------------------------
let toastTimeout = null;

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    // Clear any existing timeout
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    // Update message
    toastMessage.textContent = message || 'Link da música copiado!';
    
    // Remove show class first (for re-triggering)
    toast.classList.remove('show');
    
    // Force reflow
    void toast.offsetWidth;
    
    // Show toast
    toast.classList.add('show');
    
    // Auto-hide after 2 seconds
    toastTimeout = setTimeout(() => {
        hideToast();
    }, 2000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
        toastTimeout = null;
    }
}

// ----------------------------------------
// Copy Functions
// ----------------------------------------
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (success) {
                resolve();
            } else {
                reject(new Error('Copy command failed'));
            }
        } catch (err) {
            document.body.removeChild(textarea);
            reject(err);
        }
    });
}

function copyNormalLink(id) {
    const link = `https://${DOMAIN}/play?id=${id}`;
    
    copyToClipboard(link)
        .then(() => {
            showToast('Link da música copiado!');
        })
        .catch(() => {
            showToast('Erro ao copiar o link.');
        });
}

function copyBassLink(id) {
    const link = `https://${DOMAIN}/play?id=${id}&bass=true&level=2`;
    
    copyToClipboard(link)
        .then(() => {
            showToast('Link com grave copiado!');
        })
        .catch(() => {
            showToast('Erro ao copiar o link.');
        });
}

// ----------------------------------------
// Navbar Scroll Effect
// ----------------------------------------
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ----------------------------------------
// Mobile Menu Toggle
// ----------------------------------------
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu when clicking a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
    });
});

// Close menu when clicking overlay area
navMenu.addEventListener('click', (e) => {
    if (e.target === navMenu) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
    }
});

// ----------------------------------------
// Search Functionality
// ----------------------------------------
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicCards = document.querySelectorAll('.music-card');

function filterMusic() {
    const query = searchInput.value.toLowerCase().trim();
    
    musicCards.forEach(card => {
        const title = card.querySelector('.music-title').textContent.toLowerCase();
        const artist = card.querySelector('.music-artist').textContent.toLowerCase();
        
        if (query === '' || title.includes(query) || artist.includes(query)) {
            card.style.display = '';
            card.style.animation = 'fadeInUp 0.3s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', filterMusic);

searchBtn.addEventListener('click', () => {
    filterMusic();
    
    // Scroll to music section if there's a query
    if (searchInput.value.trim()) {
        document.querySelector('.most-played').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        filterMusic();
        if (searchInput.value.trim()) {
            document.querySelector('.most-played').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// ----------------------------------------
// Active Nav Link on Scroll
// ----------------------------------------
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ----------------------------------------
// Intersection Observer for Animations
// ----------------------------------------
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe music cards
document.querySelectorAll('.music-card, .step-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${index * 0.1}s`;
    observer.observe(el);
});
