/* ==========================================================================
   CLIMA-G · Main JS
   ========================================================================== */

(function () {
    'use strict';

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
            const servicio = data.servicio || 'tu consulta';
            const mensaje = data.mensaje || '';

            const texto =
                `Hola! Soy ${nombre}.%0A` +
                `Servicio: ${servicio}%0A` +
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
        const slides = track.querySelectorAll('.carousel-slide');
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let index = 0;
        let auto;

        // Crear dots
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.dot');

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

        // Pausar si la card no está visible
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
        const desc = card.querySelector('.proyecto-body > p');
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
            const heading = document.createElement('h4');
            heading.textContent = 'Detalles del proyecto';
            modalExtras.appendChild(heading);
            const ul = extras.querySelector('ul');
            if (ul) {
                modalExtras.appendChild(ul.cloneNode(true));
            }
        }

        // Inicializar carousel dentro del modal (si lo tiene)
        const modalCarousel = modalMedia.querySelector('[data-carousel]');
        if (modalCarousel) {
            modalCarouselInit = initCarousel(modalCarousel);
        } else {
            modalCarouselInit = null;
        }

        proyectoModal.classList.add('open');
        proyectoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeProyectoModal() {
        if (!proyectoModal) return;
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

    // Inicializador genérico de carrusel (reutilizable para el modal)
    function initCarousel(carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = track.querySelectorAll('.carousel-slide');
        const prev = carousel.querySelector('.carousel-prev');
        const next = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let index = 0;
        let auto;

        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.dot');

        function syncMedia() {
            slides.forEach((slide, i) => {
                const v = slide.querySelector('video');
                if (!v) return;
                if (i === index) { v.play().catch(() => {}); }
                else { v.pause(); v.currentTime = 0; }
            });
        }

        function goTo(i) {
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
    }
})();
