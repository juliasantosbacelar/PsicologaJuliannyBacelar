// Login de demonstração: e-mail e senha ficam visíveis no código.
const EMAIL = 'juliannybacelarlima@gmail.com';
const SENHA = 'Teste@123';

// Se já entrou antes, vai direto para o painel
if (localStorage.getItem('logado') || sessionStorage.getItem('logado')) {
    location.replace('painel/index.html');
}

const form = document.getElementById('login-form');
const campoEmail = document.getElementById('email');
const campoSenha = document.getElementById('senha');
const manter = document.getElementById('manter');
const erro = document.getElementById('login-erro');
const mostrar = document.getElementById('mostrar-senha');

mostrar.addEventListener('click', () => {
    if (campoSenha.type === 'password') {
        campoSenha.type = 'text';
        mostrar.textContent = 'Ocultar';
    } else {
        campoSenha.type = 'password';
        mostrar.textContent = 'Mostrar';
    }
});

form.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const email = campoEmail.value.trim().toLowerCase();
    const senha = campoSenha.value;

    if (email === '' || senha === '') {
        erro.textContent = 'Preencha o e-mail e a senha.';
        return;
    }

    if (email !== EMAIL || senha !== SENHA) {
        erro.textContent = 'E-mail ou senha incorretos.';
        campoSenha.value = '';
        campoSenha.focus();
        return;
    }

    // "Manter conectado" guarda o login mesmo depois de fechar o navegador
    if (manter.checked) {
        localStorage.setItem('logado', 'sim');
    } else {
        sessionStorage.setItem('logado', 'sim');
    }

    location.href = 'painel/index.html';
});

form.addEventListener('input', () => {
    erro.textContent = '';
});
