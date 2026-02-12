/*
 * Fantasy Music - app.js
 * Busca real na API + toast + clipboard + navegação
 * SEM dependência de serverless functions
 */

(function() {
    'use strict';

    // ============================================
    // CONFIG - URLs diretas da API
    // ============================================
    var API = 'https://api-music.fantasyresources.net';
    // URL base para os links copiados (play sem grave)
    var PLAY_URL = API + '/play-client';
    // URL base para os links copiados (play com grave)
    var BASS_URL = API + '/bass-client';
    // URL de busca
    var SEARCH_URL = API + '/search';

    // ============================================
    // DOM
    // ============================================
    var navbar = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    var searchInput = document.getElementById('searchInput');
    var searchBtn = document.getElementById('searchBtn');
    var noResults = document.getElementById('noResults');
    var loadingSpinner = document.getElementById('loadingSpinner');
    var musicList = document.getElementById('musicList');
    var searchResultsSection = document.getElementById('searchResults');
    var searchResultsList = document.getElementById('searchResultsList');
    var searchResultsInfo = document.getElementById('searchResultsInfo');
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');
    var toastClose = document.getElementById('toastClose');
    var navLinks = document.querySelectorAll('.nav-link');

    var toastTimeout = null;
    var searchTimeout = null;
    var isSearching = false;

    // ============================================
    // TOAST
    // ============================================
    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMessage.textContent = message || 'Link da música copiado!';
        toast.classList.remove('show');
        void toast.offsetWidth;
        toast.classList.add('show');
        toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
            toastTimeout = null;
        }, 2000);
    }

    toastClose.addEventListener('click', function() {
        toast.classList.remove('show');
        if (toastTimeout) { clearTimeout(toastTimeout); toastTimeout = null; }
    });

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
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        try {
            var ok = document.execCommand('copy');
            showToast(ok ? successMsg : 'Erro ao copiar.');
        } catch(e) {
            showToast('Erro ao copiar.');
        }
        document.body.removeChild(ta);
    }

    // ============================================
    // CRIAR HTML DE UM CARD DE MÚSICA
    // ============================================
    function createMusicCardHTML(music, index) {
        var id = music.id;
        var title = music.title || 'Sem título';
        var artist = music.author || 'Artista desconhecido';
        var thumb = music.richThumb || ('https://img.youtube.com/vi/' + id + '/mqdefault.jpg');
        var duration = music.duration_view || '';
        var rank = index + 1;

        return '' +
        '<div class="music-card" data-id="' + id + '" data-title="' + escapeAttr(title) + '" data-artist="' + escapeAttr(artist) + '">' +
            '<div class="music-card-left">' +
                '<div class="music-rank">#' + rank + '</div>' +
                '<div class="music-cover" data-id="' + id + '">' +
                    '<img src="' + escapeAttr(thumb) + '" alt="' + escapeAttr(title) + '">' +
                    '<div class="cover-overlay">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
                    '</div>' +
                '</div>' +
                '<div class="music-info">' +
                    '<h4 class="music-title">' + escapeHTML(title) + '</h4>' +
                    '<p class="music-artist">' + escapeHTML(artist) + '</p>' +
                    (duration ? '<p class="music-duration">' + escapeHTML(duration) + '</p>' : '') +
                '</div>' +
            '</div>' +
            '<div class="music-card-right">' +
                '<button class="action-btn" data-action="open" data-id="' + id + '" title="Abrir música">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
                    '<span class="btn-tooltip">Abrir música</span>' +
                '</button>' +
                '<button class="action-btn" data-action="bass" data-id="' + id + '" title="Copiar link com grave">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 20V4"/></svg>' +
                    '<span class="btn-tooltip">Link com grave</span>' +
                '</button>' +
                '<button class="action-btn" data-action="copy" data-id="' + id + '" title="Copiar link">' +
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>' +
                    '<span class="btn-tooltip">Copiar link</span>' +
                '</button>' +
            '</div>' +
        '</div>';
    }

    function escapeHTML(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return String(str).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    // ============================================
    // BUSCA NA API REAL
    // ============================================
    function searchMusic(query) {
        if (isSearching) return;
        if (!query || !query.trim()) {
            // Se vazio, esconde resultados e mostra lista padrão
            searchResultsSection.style.display = 'none';
            noResults.style.display = 'none';
            musicList.style.display = '';
            return;
        }

        isSearching = true;
        searchBtn.disabled = true;

        // Mostra loading
        loadingSpinner.style.display = 'flex';
        noResults.style.display = 'none';
        searchResultsSection.style.display = 'none';

        var url = SEARCH_URL + '?src=' + encodeURIComponent(query.trim()) + '&limit=20';

        fetch(url)
            .then(function(response) {
                if (!response.ok) throw new Error('Erro na API: ' + response.status);
                return response.json();
            })
            .then(function(data) {
                loadingSpinner.style.display = 'none';
                isSearching = false;
                searchBtn.disabled = false;

                if (!data || !Array.isArray(data) || data.length === 0) {
                    // Sem resultados
                    searchResultsSection.style.display = 'none';
                    noResults.style.display = 'flex';
                    return;
                }

                // Gerar cards dos resultados
                var html = '';
                for (var i = 0; i < data.length; i++) {
                    html += createMusicCardHTML(data[i], i);
                }

                searchResultsList.innerHTML = html;
                searchResultsInfo.textContent = data.length + ' música' + (data.length > 1 ? 's' : '') + ' encontrada' + (data.length > 1 ? 's' : '') + ' para "' + query.trim() + '"';
                searchResultsSection.style.display = '';
                noResults.style.display = 'none';

                // Scroll para resultados
                searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            })
            .catch(function(err) {
                console.error('Erro na busca:', err);
                loadingSpinner.style.display = 'none';
                isSearching = false;
                searchBtn.disabled = false;
                noResults.style.display = 'flex';
                noResults.querySelector('h4').textContent = 'Erro ao buscar';
                noResults.querySelector('p').textContent = 'Verifique sua conexão e tente novamente';
            });
    }

    // ============================================
    // EVENTOS DE BUSCA
    // ============================================
    searchBtn.addEventListener('click', function() {
        searchMusic(searchInput.value);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchMusic(searchInput.value);
        }
    });

    // Limpar busca quando input fica vazio
    searchInput.addEventListener('input', function() {
        if (!searchInput.value.trim()) {
            searchResultsSection.style.display = 'none';
            noResults.style.display = 'none';
            // Resetar texto do noResults
            var nrH4 = noResults.querySelector('h4');
            var nrP = noResults.querySelector('p');
            if (nrH4) nrH4.textContent = 'Nenhuma música encontrada';
            if (nrP) nrP.textContent = 'Tente buscar com outro termo';
        }
    });

    // ============================================
    // AÇÕES DOS BOTÕES (Event Delegation global)
    // ============================================
    document.addEventListener('click', function(e) {
        // Botões de ação
        var btn = e.target.closest('[data-action]');
        if (btn) {
            var action = btn.getAttribute('data-action');
            var id = btn.getAttribute('data-id');
            if (!action || !id) return;

            e.preventDefault();
            e.stopPropagation();

            if (action === 'open') {
                // Abre a música em nova guia (sem grave)
                window.open(PLAY_URL + '?id=' + id, '_blank');
            }
            else if (action === 'bass') {
                // Copia link com grave (direto para a API)
                var bassLink = BASS_URL + '?id=' + id;
                copyToClipboard(bassLink, 'Link com grave copiado!');
            }
            else if (action === 'copy') {
                // Copia link normal (direto para a API)
                var normalLink = PLAY_URL + '?id=' + id;
                copyToClipboard(normalLink, 'Link da música copiado!');
            }
            return;
        }

        // Clique na capa da música
        var cover = e.target.closest('.music-cover');
        if (cover) {
            var coverId = cover.getAttribute('data-id');
            if (!coverId) {
                // Tenta pegar do card pai
                var parentCard = cover.closest('.music-card');
                if (parentCard) coverId = parentCard.getAttribute('data-id');
            }
            if (coverId) {
                window.open(PLAY_URL + '?id=' + coverId, '_blank');
            }
        }
    });

    // ============================================
    // NAVBAR
    // ============================================
    window.addEventListener('scroll', function() {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ============================================
    // MOBILE MENU
    // ============================================
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
    });

    for (var i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.style.overflow = '';
        });
    }

    // ============================================
    // ACTIVE NAV ON SCROLL
    // ============================================
    var sections = document.querySelectorAll('section[id], footer[id]');

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY || window.pageYOffset;
        var current = '';

        for (var k = 0; k < sections.length; k++) {
            if (scrollPos >= sections[k].offsetTop - 120) {
                current = sections[k].getAttribute('id');
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
    // SCROLL ANIMATIONS
    // ============================================
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function(entries) {
            for (var m = 0; m < entries.length; m++) {
                if (entries[m].isIntersecting) {
                    entries[m].target.classList.add('animate-in');
                    observer.unobserve(entries[m].target);
                }
            }
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        var els = document.querySelectorAll('.music-card, .step-card');
        for (var n = 0; n < els.length; n++) {
            els[n].classList.add('animate-hidden');
            observer.observe(els[n]);
        }
    }

    // ============================================
    // LOG
    // ============================================
    console.log(
        '%c Fantasy Music %c v2.0 - Carregado! ',
        'background:#9b7aff;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:bold',
        'background:#1a1a2e;color:#fff;padding:4px 8px;border-radius:0 4px 4px 0'
    );

})();
