document.addEventListener('DOMContentLoaded', () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-links');

    const setMenuOpen = (open) => {
        if (!navToggle || !navMenu) return;
        navToggle.classList.toggle('ativo', open);
        navMenu.classList.toggle('aberto', open);
        document.body.classList.toggle('no-scroll', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const willOpen = !navMenu.classList.contains('aberto');
            setMenuOpen(willOpen);
        });
    }

    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => setMenuOpen(false));
    });

    const navModalClose = document.getElementById('navModalClose');
    navModalClose?.addEventListener('click', () => setMenuOpen(false));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu?.classList.contains('aberto')) {
            setMenuOpen(false);
        }
    });

    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        if (prefersReducedMotion) {
            revealElements.forEach((el) => {
                el.classList.add('is-visible');
            });
        } else {
            const revealObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    });
                },
                {
                    root: null,
                    rootMargin: '0px 0px -8% 0px',
                    threshold: 0.08,
                },
            );

            revealElements.forEach((el) => {
                revealObserver.observe(el);
            });
        }
    }

    const servicosAccordion = document.querySelector('.servicos-accordion');
    if (servicosAccordion && !prefersReducedMotion) {
        servicosAccordion.classList.add('servicos-accordion--js-motion');

        const servicoItems = servicosAccordion.querySelectorAll('.servico-item');
        servicoItems.forEach((details) => {
            const panel = details.querySelector('.servico-panel');
            const summary = details.querySelector('.servico-summary');
            if (!panel || !summary) return;

            panel.style.maxHeight = '0px';

            let isClosing = false;

            const expandToContentHeight = () => {
                panel.style.maxHeight = `${panel.scrollHeight}px`;
            };

            const onMaxHeightTransitionEnd = (event) => {
                if (event.target !== panel || event.propertyName !== 'max-height') return;
                if (!details.open) return;
                panel.style.maxHeight = 'none';
                panel.removeEventListener('transitionend', onMaxHeightTransitionEnd);
            };

            summary.addEventListener('click', (event) => {
                if (!details.open) return;
                if (isClosing) {
                    event.preventDefault();
                    return;
                }

                isClosing = true;
                event.preventDefault();

                panel.style.maxHeight = `${panel.scrollHeight}px`;

                void panel.offsetHeight;

                panel.classList.add('servico-panel--closing');

                requestAnimationFrame(() => {
                    panel.style.maxHeight = '0px';
                });

                const finishClose = (ev) => {
                    if (ev.target !== panel || ev.propertyName !== 'max-height') return;
                    panel.removeEventListener('transitionend', finishClose);
                    panel.classList.remove('servico-panel--closing');
                    details.removeAttribute('open');
                    panel.style.maxHeight = '0px';
                    isClosing = false;
                };

                panel.addEventListener('transitionend', finishClose);
            });

            details.addEventListener('toggle', () => {
                if (!details.open) {
                    panel.removeEventListener('transitionend', onMaxHeightTransitionEnd);
                    panel.classList.remove('servico-panel--closing');
                    panel.style.maxHeight = '0px';
                    isClosing = false;
                    return;
                }

                panel.classList.remove('servico-panel--closing');
                panel.style.maxHeight = '0px';
                void panel.offsetHeight;
                requestAnimationFrame(() => {
                    expandToContentHeight();
                    panel.removeEventListener('transitionend', onMaxHeightTransitionEnd);
                    panel.addEventListener('transitionend', onMaxHeightTransitionEnd);
                });
            });
        });
    }
});