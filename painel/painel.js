// Sem login, volta para a tela de acesso
if (!localStorage.getItem('logado') && !sessionStorage.getItem('logado')) {
    location.replace('../internal.html');
}

// Aplica o tema salvo antes de a página aparecer
const temaSalvo = localStorage.getItem('tema');
if (temaSalvo) {
    document.documentElement.dataset.tema = temaSalvo;
}

const titulos = {
    'visao-geral': 'Visão geral',
    'agenda': 'Agenda',
    'solicitacoes': 'Solicitações',
    'pacientes': 'Pacientes',
    'atendimentos': 'Atendimentos',
    'relatorios': 'Relatórios',
    'disponibilidade': 'Disponibilidade',
    'configuracoes': 'Configurações'
};

let tempoAviso;

// Mostra uma mensagem rápida no canto da tela
function avisar(texto) {
    const aviso = document.getElementById('aviso');
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(tempoAviso);
    tempoAviso = setTimeout(() => aviso.classList.remove('visivel'), 3000);
}

// Troca o texto de um elemento marcado com data-campo
function preencher(area, campo, texto) {
    area.querySelector('[data-campo="' + campo + '"]').textContent = texto;
}

// Marca qual item da lista está selecionado
function selecionar(lista, botao) {
    lista.querySelectorAll('.item-selecao').forEach((item) => {
        item.setAttribute('aria-pressed', item === botao);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Menu e troca de telas
    const sidebar = document.getElementById('sidebar');
    const menuBotao = document.getElementById('menu-botao');

    function fecharMenu() {
        sidebar.classList.remove('aberta');
        menuBotao.setAttribute('aria-expanded', 'false');
    }

    function mostrarTela() {
        let id = location.hash.replace('#', '');
        if (!titulos[id]) {
            id = 'visao-geral';
        }

        document.querySelectorAll('.tela').forEach((tela) => {
            tela.hidden = tela.dataset.tela !== id;
        });

        document.querySelectorAll('.menu a').forEach((link) => {
            if (link.getAttribute('href') === '#' + id) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });

        document.getElementById('migalha-atual').textContent = titulos[id];
        document.title = titulos[id] + ' — Painel Julianny Bacelar';
        fecharMenu();
    }

    mostrarTela();

    window.addEventListener('hashchange', () => {
        mostrarTela();
        window.scrollTo(0, 0);
        document.querySelector('.tela:not([hidden]) h1').focus();
    });

    menuBotao.addEventListener('click', () => {
        const aberto = sidebar.classList.toggle('aberta');
        menuBotao.setAttribute('aria-expanded', aberto);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            fecharMenu();
        }
    });

    document.addEventListener('click', (evento) => {
        if (!sidebar.contains(evento.target) && !menuBotao.contains(evento.target)) {
            fecharMenu();
        }

        const botaoAviso = evento.target.closest('[data-toast]');
        if (botaoAviso) {
            avisar(botaoAviso.dataset.toast);
        }
    });

    document.getElementById('sair').addEventListener('click', () => {
        localStorage.removeItem('logado');
        sessionStorage.removeItem('logado');
        location.href = '../internal.html';
    });

    // Solicitações
    const detalhe = document.getElementById('detalhe-solicitacao');
    let filtro = 'pendente';
    let selecionada = null;

    function abrirSolicitacao(card) {
        selecionada = card;
        document.querySelectorAll('.solicitacao').forEach((item) => item.removeAttribute('aria-current'));
        detalhe.hidden = !card;
        if (!card) {
            return;
        }

        card.setAttribute('aria-current', 'true');
        const dados = card.dataset;
        const alteracao = dados.tipo === 'alteracao';

        preencher(detalhe, 'titulo', alteracao ? 'Revisar alteração' : 'Revisar agendamento');
        preencher(detalhe, 'nome', dados.nome);
        preencher(detalhe, 'servico', dados.servico);
        preencher(detalhe, 'atual', dados.atual || '');
        preencher(detalhe, 'solicitado', dados.solicitado);
        preencher(detalhe, 'motivo', dados.motivo);
        preencher(detalhe, 'autorizar', alteracao ? 'Autorizar alteração' : 'Aprovar agendamento');

        detalhe.querySelector('[data-campo="atual-bloco"]').hidden = !alteracao;
        detalhe.querySelector('[data-campo="alerta"]').hidden = !alteracao;
        detalhe.querySelector('[data-campo="acoes"]').hidden = dados.status !== 'pendente';
    }

    function filtrarSolicitacoes() {
        let primeira = null;
        document.querySelectorAll('.solicitacao').forEach((card) => {
            card.hidden = card.dataset.status !== filtro;
            if (!card.hidden && !primeira) {
                primeira = card;
            }
        });

        const pendentes = document.querySelectorAll('.solicitacao[data-status="pendente"]').length;
        document.getElementById('aba-pendentes-total').textContent = pendentes;
        document.getElementById('contador-solicitacoes').textContent = pendentes;
        document.getElementById('lista-vazia').hidden = primeira !== null;

        abrirSolicitacao(primeira);
    }

    function decidir(status) {
        selecionada.dataset.status = status;
        if (status === 'aprovada') {
            selecionada.querySelector('[data-analisar]').textContent = 'Aprovada';
            avisar('Solicitação de ' + selecionada.dataset.nome + ' aprovada.');
        } else {
            selecionada.querySelector('[data-analisar]').textContent = 'Recusada';
            avisar('Solicitação de ' + selecionada.dataset.nome + ' recusada.');
        }
        filtrarSolicitacoes();
    }

    const abas = document.querySelectorAll('.aba');
    abas.forEach((aba) => {
        aba.addEventListener('click', () => {
            abas.forEach((outra) => outra.setAttribute('aria-selected', outra === aba));
            filtro = aba.dataset.filtro;
            filtrarSolicitacoes();
        });
    });

    document.getElementById('lista-solicitacoes').addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-analisar]');
        if (botao) {
            abrirSolicitacao(botao.closest('.solicitacao'));
        }
    });

    detalhe.querySelector('[data-campo="autorizar"]').addEventListener('click', () => decidir('aprovada'));
    detalhe.querySelector('[data-campo="recusar"]').addEventListener('click', () => decidir('recusada'));

    filtrarSolicitacoes();

    // Pacientes
    const listaPacientes = document.getElementById('lista-pacientes');
    const ficha = document.getElementById('ficha-paciente');
    const busca = document.getElementById('busca-paciente');

    listaPacientes.addEventListener('click', (evento) => {
        const botao = evento.target.closest('.item-selecao');
        if (!botao) {
            return;
        }
        selecionar(listaPacientes, botao);
        preencher(ficha, 'nome', botao.dataset.nome);
        preencher(ficha, 'desde', 'Paciente desde ' + botao.dataset.desde + ' · ' + botao.dataset.perfil);
        preencher(ficha, 'servico', botao.dataset.servico);
        preencher(ficha, 'proxima', botao.dataset.proxima);
    });

    busca.addEventListener('input', () => {
        const termo = busca.value.trim().toLowerCase();
        let total = 0;
        listaPacientes.querySelectorAll('li').forEach((item) => {
            item.hidden = !item.textContent.toLowerCase().includes(termo);
            if (!item.hidden) {
                total++;
            }
        });
        document.getElementById('contagem-pacientes').textContent = 'Exibindo ' + total + ' de 32 pacientes ativos';
    });

    // Atendimentos
    const listaAtendimentos = document.getElementById('lista-atendimentos');
    const formAtendimento = document.getElementById('form-atendimento');
    let atendimento = listaAtendimentos.querySelector('[aria-pressed="true"]');

    listaAtendimentos.addEventListener('click', (evento) => {
        const botao = evento.target.closest('.item-selecao');
        if (!botao) {
            return;
        }
        atendimento = botao;
        selecionar(listaAtendimentos, botao);
        preencher(formAtendimento, 'nome', botao.dataset.nome);
        preencher(formAtendimento, 'servico', botao.dataset.servico);
        preencher(formAtendimento, 'status', botao.querySelector('.situacao').textContent);
        formAtendimento.elements.inicio.value = botao.dataset.inicio;
        formAtendimento.elements.termino.value = botao.dataset.termino;
    });

    formAtendimento.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const situacoes = {
            compareceu: 'Realizado',
            faltou: 'Não compareceu',
            cancelado: 'Cancelado'
        };
        const situacao = situacoes[formAtendimento.elements.comparecimento.value];
        atendimento.querySelector('.situacao').textContent = situacao;
        preencher(formAtendimento, 'status', situacao);
        avisar('Atendimento de ' + atendimento.dataset.nome + ' salvo.');
    });

    // Disponibilidade
    const tabelaDias = document.getElementById('tabela-dias');

    tabelaDias.addEventListener('change', (evento) => {
        if (evento.target.type !== 'checkbox') {
            return;
        }
        const linha = evento.target.closest('tr');
        const ligado = evento.target.checked;
        linha.classList.toggle('desligado', !ligado);
        linha.querySelectorAll('.periodo').forEach((periodo) => {
            periodo.disabled = !ligado;
        });
    });

    tabelaDias.addEventListener('click', (evento) => {
        const botao = evento.target.closest('[data-editar]');
        if (!botao) {
            return;
        }
        const editando = botao.textContent === 'Concluir';
        botao.closest('tr').querySelectorAll('.periodo').forEach((periodo) => {
            periodo.readOnly = editando;
        });
        botao.textContent = editando ? 'Editar' : 'Concluir';
    });

    // Configurações: tema de cores
    document.querySelectorAll('input[name="tema"]').forEach((opcao) => {
        opcao.checked = opcao.value === (temaSalvo || 'padrao');
        opcao.addEventListener('change', () => {
            if (opcao.value === 'padrao') {
                delete document.documentElement.dataset.tema;
                localStorage.removeItem('tema');
            } else {
                document.documentElement.dataset.tema = opcao.value;
                localStorage.setItem('tema', opcao.value);
            }
        });
    });
});
