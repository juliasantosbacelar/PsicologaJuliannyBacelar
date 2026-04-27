document.addEventListener('DOMContentLoaded', () => {
    
    const navToggle = document.getElementById('navToggle');
    // Mudei de .nav-menu para .nav-links para bater com seu CSS
    const navMenu = document.querySelector('.nav-links'); 

    if (navToggle && navMenu) { // Verificação dupla de segurança
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('ativo');
            navMenu.classList.toggle('aberto');
            document.body.classList.toggle('no-scroll');
        });
    }

    // Ajustado também aqui para buscar os links dentro de .nav-links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('ativo');
            navMenu.classList.remove('aberto');
            document.body.classList.remove('no-scroll'); // Lembrar de devolver o scroll
        });
    });
});