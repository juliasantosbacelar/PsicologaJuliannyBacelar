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

    const contatoForm = document.getElementById('contato-form');
    const contatoFormStatus = document.getElementById('contato-form-status');
    contatoForm?.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(contatoForm);
        const nome = String(formData.get('nome'));
        const mensagem = [
            `Nome: ${nome}`,
            `Celular: ${String(formData.get('celular') || 'Não informado')}`,
            `E-mail: ${String(formData.get('email'))}`,
            `Modalidade: ${String(formData.get('modalidade'))}`,
            `Público: ${String(formData.get('publico'))}`,
            '',
            'Mensagem:',
            String(formData.get('mensagem')),
        ].join('\n');

        const whatsappUrl = `https://wa.me/5513981469770?text=${encodeURIComponent(mensagem)}`;
        const whatsappWindow = window.open(whatsappUrl, '_blank');

        if (!whatsappWindow) {
            if (contatoFormStatus) {
                contatoFormStatus.textContent = 'O navegador bloqueou a nova aba. Abrindo o WhatsApp nesta página.';
            }
            window.location.assign(whatsappUrl);
            return;
        }

        whatsappWindow.opener = null;
        if (contatoFormStatus) {
            contatoFormStatus.textContent = 'O WhatsApp foi aberto com a mensagem pronta. Revise e confirme o envio por lá.';
        }
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

//Botões de alto contraste e aumento/diminui fonte

const contraste = document.getElementById("contraste");
const aumentar = document.getElementById("aumentar-fonte");
const diminuir = document.getElementById("diminuir-fonte");

let tamanhoFonte = 16;

// Alto contraste
contraste.addEventListener("click", () => {
    document.body.classList.toggle("alto-contraste");
});

// Aumentar fonte
aumentar.addEventListener("click", () => {
    if (tamanhoFonte < 24) {
        tamanhoFonte += 2;
        document.documentElement.style.fontSize = tamanhoFonte + "px";
    }
});

// Diminuir fonte
diminuir.addEventListener("click", () => {
    if (tamanhoFonte > 12) {
        tamanhoFonte -= 2;
        document.documentElement.style.fontSize = tamanhoFonte + "px";
    }
});