/*
 * Fantasy Music - app.js
 * Handles: toast, clipboard, search, navbar, mobile menu, animations
 */

(function() {
    'use strict';

    // ============================================
    // CONFIG
    // ============================================
    var DOMAIN = 'magnatamusicas.vercel.app';
    var API_BASE = 'https://api-music.fantasyresources.net';

    // ============================================
    // DOM ELEMENTS
    // ============================================
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var searchInput = document.getElementById('searchInput');
    var searchBtn = document.getElementById('searchBtn');
    var noResults = document.getElementById('noResults');
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');
    var toastClose = document.getElementById('toastClose');
    var musicCards = document.querySelectorAll('.music-card');
    var navLinks = document.querySelectorAll('.nav-link');

    var toastTimeout = null;

    // ============================================
    // TOAST
    // ============================================
    function showToast(message) {
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastMessage.textContent = message || 'Link da música copiado!';

        // Remove and re-add for re-trigger
        toast.classList.remove('show');
        void toast.offsetWidth; // force reflow
        toast.classList.add('show');

        toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
            toastTimeout = null;
        }, 2000);
    }

    function hideToast() {
        toast.classList.remove('show');
        if (toastTimeout) {
            clearTimeout(toastTimeout);
            toastTimeout = null;
        }
    }

    toastClose.addEventListener('click', hideToast);

    // ============================================
    // CLIPBOARD
    // ============================================
    function copyToClipboard(text, successMsg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                showToast(successMsg);
            }).catch(function() {
                fallbackCopy(text, successMsg);
            });
        } else {
            fallbackCopy(text, successMsg);
        }
    }

    function fallbackCopy(text, successMsg) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            var ok = document.execCommand('copy');
            showToast(ok ? successMsg : 'Erro ao copiar o link.');
        } catch (e) {
            showToast('Erro ao copiar o link.');
        }

        document.body.removeChild(textarea);
    }

    // ============================================
    // BUTTON ACTIONS (Event Delegation)
    // ============================================
    document.addEventListener('click', function(e) {
        // Check if clicked on action button or its child
        var btn = e.target.closest('[data-action]');
        if (!btn) return;

        var action = btn.getAttribute('data-action');
        var id = btn.getAttribute('data-id');

        if (!action || !id) return;

        e.preventDefault();
        e.stopPropagation();

        if (action === 'open') {
            // Open music in new tab using the play-client API
            window.open(API_BASE + '/play-client?id=' + id, '_blank');
        }
        else if (action === 'bass') {
            // Copy link with bass
            var bassLink = 'https://' + DOMAIN + '/play?id=' + id + '&bass=true&level=2';
            copyToClipboard(bassLink, 'Link com grave copiado!');
        }
        else if (action === 'copy') {
            // Copy normal link
            var normalLink = 'https://' + DOMAIN + '/play?id=' + id;
            copyToClipboard(normalLink, 'Link da música copiado!');
        }
    });

    // Also handle cover click -> open music
    document.addEventListener('click', function(e) {
        var cover = e.target.closest('.music-cover');
        if (!cover) return;

        var card = cover.closest('.music-card');
        if (!card) return;

        var id = card.getAttribute('data-id');
        if (id) {
            window.open(API_BASE + '/play-client?id=' + id, '_blank');
        }
    });

    // ============================================
    // NAVBAR SCROLL
    // ============================================
    var lastScroll = 0;

    window.addEventListener('scroll', function() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = scrollY;
    });

    // ============================================
    // MOBILE MENU
    // ============================================
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on nav link click
    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', closeMenu);
    }

    function closeMenu() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    // ============================================
    // SEARCH / FILTER
    // ============================================
    function filterMusic() {
        var query = searchInput.value.toLowerCase().trim();
        var visibleCount = 0;

        for (var i = 0; i < musicCards.length; i++) {
            var card = musicCards[i];
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var artist = (card.getAttribute('data-artist') || '').toLowerCase();

            if (query === '' || title.indexOf(query) !== -1 || artist.indexOf(query) !== -1) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        }

        // Show/hide "no results" message
        if (visibleCount === 0 && query !== '') {
            noResults.style.display = 'flex';
        } else {
            noResults.style.display = 'none';
        }
    }

    // Filter on every keystroke
    searchInput.addEventListener('input', filterMusic);

    // Search button click
    searchBtn.addEventListener('click', function() {
        filterMusic();
        scrollToResults();
    });

    // Enter key
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            filterMusic();
            scrollToResults();
        }
    });

    function scrollToResults() {
        if (searchInput.value.trim()) {
            var section = document.querySelector('.most-played');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    var allSections = document.querySelectorAll('section[id], footer[id]');

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY || window.pageYOffset;
        var current = '';

        for (var k = 0; k < allSections.length; k++) {
            var section = allSections[k];
            var sectionTop = section.offsetTop - 120;
            if (scrollPos >= sectionTop) {
                current = section.getAttribute('id');
            }
        }

        for (var l = 0; l < navLinks.length; l++) {
            navLinks[l].classList.remove('active');
            if (navLinks[l].getAttribute('href') === '#' + current) {
                navLinks[l].classList.add('active');
            }
        }
    });

    // ============================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ============================================
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            for (var m = 0; m < entries.length; m++) {
                if (entries[m].isIntersecting) {
                    entries[m].target.classList.add('animate-in');
                    observer.unobserve(entries[m].target);
                }
            }
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        var animElements = document.querySelectorAll('.music-card, .step-card');
        for (var n = 0; n < animElements.length; n++) {
            animElements[n].classList.add('animate-hidden');
            observer.observe(animElements[n]);
        }
    }

    // ============================================
    // LOADED
    // ============================================
    console.log(
        '%c Fantasy Music %c Carregado! ',
        'background:#9b7aff;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold;',
        'background:#1a1a2e;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0;'
    );

})();
