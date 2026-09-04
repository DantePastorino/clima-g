/* ==========================================================================
   CLIMA-G · Main JS
   ========================================================================== */

(function () {
    'use strict';

    // Evitar que el navegador restaure la posición de scroll al recargar
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // ---------- Navbar scroll ----------
    const navbar = document.getElementById('navbar');
    const scrollTop = document.getElementById('scrollTop');

    function onScroll() {
        const scrollY = window.scrollY;

        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 40);
        }

        if (scrollTop) {
            scrollTop.classList.toggle('visible', scrollY > 600);
        }

        // Active section link
        updateActiveLink();
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ---------- Mobile menu ----------
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('open');
            document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
        });

        // Cerrar al clickear un link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // ---------- Smooth scroll ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 80;
                const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // ---------- Active link on scroll ----------
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = '';
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    // ---------- Reveal animations ----------
    const reveals = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    // Stagger delay
                    const delay = Array.from(entry.target.parentElement?.children || [])
                        .filter(el => el.classList.contains('reveal'))
                        .indexOf(entry.target) * 80;

                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, Math.min(delay, 400));

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

        reveals.forEach(el => observer.observe(el));
    } else {
        reveals.forEach(el => el.classList.add('visible'));
    }

    // ---------- Counter animation ----------
    const counters = document.querySelectorAll('[data-count]');

    if ('IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => counterObserver.observe(c));
    } else {
        counters.forEach(c => { c.textContent = c.getAttribute('data-count'); });
    }

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(tick);
    }

    // ---------- Scroll to top ----------
    if (scrollTop) {
        scrollTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ---------- Form submit ----------
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = Object.fromEntries(new FormData(contactForm).entries());
            const nombre = data.nombre || 'amigo/a';
            const email = data.email || 'no indicado';
            const telefono = data.telefono || 'no indicado';
            const servicio = data.servicio || 'sin especificar';
            const mensaje = data.mensaje || '';

            const texto =
                `Hola! Soy ${nombre}.\n` +
                `Email: ${email}\n` +
                `Teléfono: ${telefono}\n` +
                `Servicio: ${servicio}\n` +
                `Mensaje: ${mensaje}`;

            const url = `https://wa.me/5493516882083?text=${encodeURIComponent(texto)}`;

            // Feedback visual
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Enviado!';
            btn.style.background = 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)';

            setTimeout(() => {
                window.open(url, '_blank');
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '';
                    contactForm.reset();
                }, 600);
            }, 600);
        });
    }

    // ---------- Año dinámico ----------
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // ---------- Parallax suave en hero ----------
    const heroOrbs = document.querySelectorAll('.hero-orb');

    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;

            heroOrbs.forEach((orb, i) => {
                const factor = (i + 1) * 0.5;
                orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
        }, { passive: true });
    }

    // ---------- Cerrar menú al redimensionar ----------
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu) {
            navMenu.classList.remove('open');
            if (navToggle) navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // ---------- Carousel de proyectos ----------
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        let slides = Array.from(track.querySelectorAll('.carousel-slide'));
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let index = 0;
        let auto;
        let dots = [];

        function rebuildDots() {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === index ? ' active' : '');
                dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
            dots = dotsContainer.querySelectorAll('.dot');
        }

        rebuildDots();

        function syncMedia() {
            slides.forEach((slide, i) => {
                const v = slide.querySelector('video');
                if (!v) return;
                if (i === index) { v.play().catch(() => {}); }
                else { v.pause(); v.currentTime = 0; }
            });
        }

        // Cuando un video termina, pasa al siguiente slide (para mantener la duración completa sin loop)
        slides.forEach((slide, i) => {
            const v = slide.querySelector('video');
            if (!v) return;
            v.addEventListener('ended', () => {
                if (i === index) goTo(index + 1);
            });
        });

        function goTo(i) {
            if (!slides.length) return;
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, di) => d.classList.toggle('active', di === index));
            syncMedia();
        }

        function startAuto() {
            stopAuto();
            auto = setInterval(() => goTo(index + 1), 4000);
        }

        function stopAuto() {
            if (auto) clearInterval(auto);
        }

        prev.addEventListener('click', () => { goTo(index - 1); startAuto(); });
        next.addEventListener('click', () => { goTo(index + 1); startAuto(); });

        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        // Swipe táctil
        let startX = 0;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
            startAuto();
        });

        // Filtrar slides vacíos (imágenes rotas) después de que se carguen
        const settlePromises = slides.map(slide => new Promise(resolve => {
            const media = slide.querySelector('img') || slide.querySelector('video');
            if (!media) { resolve(); return; }
            const done = () => resolve();
            if (media.tagName === 'IMG') {
                if (media.complete) done();
                else {
                    media.addEventListener('load', done, { once: true });
                    media.addEventListener('error', done, { once: true });
                }
            } else {
                if (media.readyState >= 1) done();
                else {
                    media.addEventListener('loadeddata', done, { once: true });
                    media.addEventListener('error', done, { once: true });
                }
            }
        }));

        Promise.all(settlePromises).then(() => {
            const validSlides = slides.filter(slide => {
                const media = slide.querySelector('img') || slide.querySelector('video');
                if (!media) return false;
                if (media.style.display === 'none') return false;
                if (media.tagName === 'IMG' && media.naturalWidth === 0) return false;
                if (media.tagName === 'VIDEO' && media.videoWidth === 0) return false;
                return true;
            });
            if (validSlides.length === slides.length) return;

            slides.forEach(slide => {
                if (!validSlides.includes(slide)) slide.style.display = 'none';
            });
            slides = validSlides;
            index = Math.min(index, slides.length - 1);
            if (index < 0) index = 0;
            rebuildDots();
            track.style.transform = `translateX(-${index * 100}%)`;
            if (auto) { stopAuto(); startAuto(); }
        });

        // Cargar src de videos lazy (data-src) solo cuando el carrusel entra en viewport
        function loadLazyVideos() {
            slides.forEach(s => {
                const v = s.querySelector('video');
                if (v && !v.src && v.dataset.src) {
                    v.src = v.dataset.src;
                    v.autoplay = true;
                    v.load();
                }
            });
        }

        // Pausar si la card no está visible
        if ('IntersectionObserver' in window) {
            const visObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { loadLazyVideos(); startAuto(); syncMedia(); }
                    else { stopAuto(); slides.forEach(s => { const v = s.querySelector('video'); if (v) v.pause(); }); }
                });
            }, { threshold: 0.3 });
            visObserver.observe(carousel);
        } else {
            loadLazyVideos();
            startAuto();
        }

        // Estado inicial
        syncMedia();
    });

    // ---------- Init ----------
    onScroll();

    // ---------- Modal de proyectos ----------
    const proyectoModal = document.getElementById('proyectoModal');
    const modalMedia = document.getElementById('proyectoModalMedia');
    const modalTag = document.getElementById('proyectoModalTag');
    const modalTitle = document.getElementById('proyectoModalTitle');
    const modalLocations = document.getElementById('proyectoModalLocations');
    const modalDesc = document.getElementById('proyectoModalDesc');
    const modalExtras = document.getElementById('proyectoModalExtras');
    let modalCarouselInit = null;

    function cloneImageMarkup(card) {
        const imageWrap = card.querySelector('.proyecto-image');
        if (!imageWrap) return '';
        const clone = imageWrap.cloneNode(true);
        clone.classList.remove('reveal');
        return clone.outerHTML;
    }

    function openProyectoModal(card) {
        if (!proyectoModal) return;

        const tag = card.querySelector('.proyecto-tag');
        const title = card.querySelector('.proyecto-body h3');
        const desc = card.querySelector('.proyecto-body > p:not(.proyecto-loc)');
        const extras = card.querySelector('.proyecto-extras');

        modalMedia.innerHTML = cloneImageMarkup(card);
        modalTag.textContent = tag ? tag.textContent.trim() : '';
        modalTitle.textContent = title ? title.textContent.trim() : '';

        // Ubicaciones: aceptar tanto .proyecto-loc (uno) como .proyecto-locs (varios)
        modalLocations.innerHTML = '';
        const locsWrap = card.querySelector('.proyecto-locs');
        if (locsWrap) {
            locsWrap.querySelectorAll('.proyecto-loc').forEach(loc => {
                const span = document.createElement('span');
                span.className = 'proyecto-loc';
                span.innerHTML = loc.innerHTML;
                modalLocations.appendChild(span);
            });
        } else {
            const loc = card.querySelector('.proyecto-body > .proyecto-loc');
            if (loc) {
                const span = document.createElement('span');
                span.className = 'proyecto-loc';
                span.innerHTML = loc.innerHTML;
                modalLocations.appendChild(span);
            }
        }

        modalDesc.textContent = desc ? desc.textContent.trim() : '';

        modalExtras.innerHTML = '';
        if (extras) {
            const ul = extras.querySelector('ul');
            if (ul) {
                const items = Array.from(ul.querySelectorAll('li'));
                const total = items.length;

                const featured = items.slice(0, 3);
                const rest = items.slice(3);

                let lastBlock = [];
                let middle = rest;
                if (rest.length >= 3) {
                    lastBlock = rest.slice(-3);
                    middle = rest.slice(0, -3);
                } else if (rest.length === 2) {
                    lastBlock = rest;
                    middle = [];
                }

                if (featured.length) {
                    const featuredWrap = document.createElement('div');
                    featuredWrap.className = 'modal-featured-cards';
                    featured.forEach((item, i) => {
                        const card = document.createElement('div');
                        card.className = 'modal-card modal-card-featured';

                        const contentClone = item.cloneNode(true);
                        const strongInClone = contentClone.querySelector('strong');
                        if (strongInClone) strongInClone.remove();
                        const contentHTML = contentClone.innerHTML.trim();

                        const originalStrong = item.querySelector('strong');
                        const badgeText = originalStrong
                            ? originalStrong.textContent.trim()
                            : `0${i + 1}`;

                        let iconHTML = '';
                        if (badgeText.toLowerCase() === 'en proceso') {
                            card.classList.add('modal-card-in-progress');
                            iconHTML = '<div class="modal-card-icon"><i class="fa-solid fa-helmet-safety"></i></div>';
                        }

                        card.innerHTML =
                            `<div class="modal-card-badge">${badgeText}</div>` +
                            `<div class="modal-card-content">${contentHTML}</div>` +
                            iconHTML;
                        featuredWrap.appendChild(card);
                    });
                    modalExtras.appendChild(featuredWrap);
                }

                if (middle.length) {
                    const middleWrap = document.createElement('div');
                    middleWrap.className = 'modal-detail-cards';
                    middle.forEach(item => {
                        const card = document.createElement('div');
                        const strongInItem = item.querySelector('strong');
                        const isEnProceso = strongInItem && strongInItem.textContent.trim().toLowerCase() === 'en proceso';

                        if (isEnProceso) {
                            // Card destacada tipo "En proceso" (mismo estilo
                            // que Domo Siglo 21) en versión reducida para
                            // mantener su posición en el flujo (4to item).
                            card.className = 'modal-card modal-card-featured modal-card-featured-sm modal-card-in-progress';
                            const contentClone = item.cloneNode(true);
                            const strongInClone = contentClone.querySelector('strong');
                            if (strongInClone) strongInClone.remove();
                            const contentHTML = contentClone.innerHTML.trim();
                            card.innerHTML =
                                `<div class="modal-card-badge">En proceso</div>` +
                                `<div class="modal-card-content">${contentHTML}</div>` +
                                '<div class="modal-card-icon"><i class="fa-solid fa-helmet-safety"></i></div>';
                        } else {
                            const isText = item.classList.contains('proyecto-detalle');
                            card.className = isText
                                ? 'modal-card modal-card-text'
                                : 'modal-card modal-card-detail';
                            card.innerHTML = `<div class="modal-card-content">${item.innerHTML}</div>`;
                        }
                        middleWrap.appendChild(card);
                    });
                    modalExtras.appendChild(middleWrap);
                }

                if (lastBlock.length >= 2) {
                    const lastWrap = document.createElement('div');
                    lastWrap.className = 'modal-last-cards';
                    if (lastBlock.length === 3) {
                        lastWrap.classList.add('modal-last-cards-trio');
                    }
                    lastBlock.forEach((item, i) => {
                        const card = document.createElement('div');
                        card.className = 'modal-card modal-card-last';
                        card.innerHTML = `<div class="modal-card-content">${item.innerHTML}</div>`;
                        lastWrap.appendChild(card);
                        if (i < lastBlock.length - 1) {
                            const divider = document.createElement('div');
                            divider.className = 'modal-card-divider';
                            divider.innerHTML = '<span class="modal-card-divider-dot"></span>';
                            lastWrap.appendChild(divider);
                        }
                    });
                    modalExtras.appendChild(lastWrap);
                }
            }
        }

        // Inicializar carousel dentro del modal (si lo tiene)
        const modalCarousel = modalMedia.querySelector('[data-carousel]');
        if (modalCarousel) {
            modalCarouselInit = initCarousel(modalCarousel);
            detectImageOrientation();
        } else {
            modalCarouselInit = null;
        }

        // Resetear scroll del modal para que cada card se vea desde el principio
        const modalInfoEl = document.getElementById('proyectoModalInfo');
        if (modalInfoEl) {
            modalInfoEl.scrollTop = 0;
            updateModalScrollHint();
            modalInfoEl.addEventListener('scroll', updateModalScrollHint, { passive: true });
        }

        proyectoModal.classList.add('open');
        proyectoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function updateModalScrollHint() {
        const modalInfoEl = document.getElementById('proyectoModalInfo');
        const hint = document.getElementById('proyectoModalScrollHint');
        if (!modalInfoEl || !hint) return;
        const reachedBottom = modalInfoEl.scrollTop + modalInfoEl.clientHeight >= modalInfoEl.scrollHeight - 8;
        hint.classList.toggle('hidden', reachedBottom);
    }

    function closeProyectoModal() {
        if (!proyectoModal) return;
        const modalInfoEl = document.getElementById('proyectoModalInfo');
        if (modalInfoEl) {
            modalInfoEl.removeEventListener('scroll', updateModalScrollHint);
            modalInfoEl.scrollTop = 0;
        }
        const hint = document.getElementById('proyectoModalScrollHint');
        if (hint) hint.classList.add('hidden');
        proyectoModal.classList.remove('open');
        proyectoModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        // Limpiar medios para detener videos
        setTimeout(() => {
            modalMedia.innerHTML = '';
            if (modalCarouselInit && modalCarouselInit.stopAuto) modalCarouselInit.stopAuto();
            modalCarouselInit = null;
        }, 400);
    }

    // Detectar orientación de cada slide del modal para aplicar edge-to-edge en verticales
    function detectImageOrientation() {
        const slides = modalMedia.querySelectorAll('.carousel-slide');
        slides.forEach(slide => {
            const media = slide.querySelector('img') || slide.querySelector('video');
            if (!media || slide.dataset.orientationChecked) return;
            slide.dataset.orientationChecked = '1';

            const applyOrientation = () => {
                const width = media.naturalWidth || media.videoWidth || 0;
                const height = media.naturalHeight || media.videoHeight || 0;
                if (width > 0 && height > width) {
                    slide.classList.add('carousel-slide-vertical');
                }
            };

            if (media.tagName === 'IMG') {
                if (media.complete && media.naturalWidth > 0) {
                    applyOrientation();
                } else {
                    media.addEventListener('load', applyOrientation, { once: true });
                }
            } else if (media.tagName === 'VIDEO') {
                if (media.readyState >= 1 && media.videoWidth > 0) {
                    applyOrientation();
                } else {
                    media.addEventListener('loadedmetadata', applyOrientation, { once: true });
                }
            }
        });
    }

    // Inicializador genérico de carrusel (reutilizable para el modal)
    function initCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        let slides = Array.from(track.querySelectorAll('.carousel-slide'));
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let index = 0;
        let auto;
        let dots = [];

        // Cargar src de videos lazy (data-src) — el modal siempre los necesita
        slides.forEach(s => {
            const v = s.querySelector('video');
            if (v && !v.src && v.dataset.src) {
                v.src = v.dataset.src;
                v.autoplay = true;
                v.load();
            }
        });

        function rebuildDots() {
            dotsContainer.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.className = 'dot' + (i === index ? ' active' : '');
                dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            });
            dots = dotsContainer.querySelectorAll('.dot');
        }

        rebuildDots();

        function syncMedia() {
            slides.forEach((slide, i) => {
                const v = slide.querySelector('video');
                if (!v) return;
                if (i === index) { v.play().catch(() => {}); }
                else { v.pause(); v.currentTime = 0; }
            });
        }

        function goTo(i) {
            if (!slides.length) return;
            index = (i + slides.length) % slides.length;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((d, di) => d.classList.toggle('active', di === index));
            syncMedia();
        }

        function startAuto() { stopAuto(); auto = setInterval(() => goTo(index + 1), 4000); }
        function stopAuto() { if (auto) clearInterval(auto); }

        prev.addEventListener('click', () => { goTo(index - 1); startAuto(); });
        next.addEventListener('click', () => { goTo(index + 1); startAuto(); });
        carousel.addEventListener('mouseenter', stopAuto);
        carousel.addEventListener('mouseleave', startAuto);

        let startX = 0;
        track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAuto(); }, { passive: true });
        track.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
            startAuto();
        });

        // Filtrar slides vacíos (imágenes rotas) después de que se carguen
        const settlePromises = slides.map(slide => new Promise(resolve => {
            const media = slide.querySelector('img') || slide.querySelector('video');
            if (!media) { resolve(); return; }
            const done = () => resolve();
            if (media.tagName === 'IMG') {
                if (media.complete) done();
                else {
                    media.addEventListener('load', done, { once: true });
                    media.addEventListener('error', done, { once: true });
                }
            } else {
                if (media.readyState >= 1) done();
                else {
                    media.addEventListener('loadeddata', done, { once: true });
                    media.addEventListener('error', done, { once: true });
                }
            }
        }));

        Promise.all(settlePromises).then(() => {
            const validSlides = slides.filter(slide => {
                const media = slide.querySelector('img') || slide.querySelector('video');
                if (!media) return false;
                if (media.style.display === 'none') return false;
                if (media.tagName === 'IMG' && media.naturalWidth === 0) return false;
                if (media.tagName === 'VIDEO' && media.videoWidth === 0) return false;
                return true;
            });
            if (validSlides.length === slides.length) return;

            slides.forEach(slide => {
                if (!validSlides.includes(slide)) slide.style.display = 'none';
            });
            slides = validSlides;
            index = Math.min(index, slides.length - 1);
            if (index < 0) index = 0;
            rebuildDots();
            track.style.transform = `translateX(-${index * 100}%)`;
            if (auto) { stopAuto(); startAuto(); }
        });

        syncMedia();
        if ('IntersectionObserver' in window) {
            const visObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) { startAuto(); syncMedia(); }
                    else { stopAuto(); slides.forEach(s => { const v = s.querySelector('video'); if (v) v.pause(); }); }
                });
            }, { threshold: 0.3 });
            visObserver.observe(carousel);
        } else {
            startAuto();
        }

        return { goTo, startAuto, stopAuto };
    }

    // Asignar eventos a los botones "Ver más"
    document.querySelectorAll('[data-ver-mas]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const card = btn.closest('.proyecto-card');
            if (card) openProyectoModal(card);
        });
    });

    // Abrir modal al hacer click en cualquier parte de la card
    document.querySelectorAll('.proyecto-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;
            openProyectoModal(card);
        });
    });

    // Cerrar modal: botón "Volver" y overlay
    if (proyectoModal) {
        proyectoModal.querySelectorAll('[data-modal-close]').forEach(el => {
            el.addEventListener('click', closeProyectoModal);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && proyectoModal.classList.contains('open')) {
                closeProyectoModal();
            }
        });

        // Botón con flecha hacia abajo: scroll dentro del modal-info
        const modalInfo = proyectoModal.querySelector('.proyecto-modal-info');
        const scrollBtn = proyectoModal.querySelector('#proyectoModalScrollDown');
        if (modalInfo && scrollBtn) {
            scrollBtn.addEventListener('click', () => {
                modalInfo.scrollBy({ top: modalInfo.clientHeight * 0.8, behavior: 'smooth' });
            });
        }
    }
})();
