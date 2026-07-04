// Configuração da URL base da API do backend
const API_URL = 'http://127.0.0.1:8000';

/*
  --------------------------------------------------------------------------------------
  1. SISTEMA DE ROTEAMENTO (Alternar visibilidade das telas)
  --------------------------------------------------------------------------------------
*/
function navegarPara(idDaTela) {
    const secoes = document.querySelectorAll('main section');
    secoes.forEach(secao => {
        secao.classList.add('secao-oculta');
    });
    
    const telaAtiva = document.getElementById(idDaTela);
    if (telaAtiva) {
        telaAtiva.classList.remove('secao-oculta');
    }

    if (idDaTela === 'tela-usuario') renderizarTabelaUsuarios();
    if (idDaTela === 'tela-modalidade') renderizarTabelaModalidades();
    if (idDaTela === 'tela-matricula') renderizarTabelaMatrículas();
}

document.getElementById('id-usuario').addEventListener('click', () => navegarPara('tela-usuario'));
document.getElementById('id-modalidade').addEventListener('click', () => navegarPara('tela-modalidade'));
document.getElementById('idmatricula').addEventListener('click', () => navegarPara('tela-matricula'));

/*
  --------------------------------------------------------------------------------------
  2. FUNÇÕES DE BUSCA DE DADOS (GET via Fetch)
  --------------------------------------------------------------------------------------
*/
const fetchUsuarios = async () => {
    try {
        const response = await fetch(`${API_URL}/usuarios`, { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        return [];
    }
};

const fetchModalidades = async () => {
    try {
        const response = await fetch(`${API_URL}/modalidades`, { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar modalidades:', error);
        return [];
    }
};

const fetchMatriculas = async () => {
    try {
        const response = await fetch(`${API_URL}/praticas`, { method: 'GET' });
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar matrículas:', error);
        return [];
    }
};

/*
  --------------------------------------------------------------------------------------
  3. FUNÇÕES DE RENDERIZAÇÃO (Construir as tabelas dinamicamente)
  --------------------------------------------------------------------------------------
*/
const renderizarTabelaUsuarios = async () => {
    const container = document.getElementById('lista-usuarios');
    container.innerHTML = '<p>Carregando usuários...</p>';
    
    const usuarios = await fetchUsuarios();
    
    if (usuarios.length === 0) {
        container.innerHTML = '<p class="aviso-vazio">Nenhum usuário cadastrado.</p>';
        return;
    }

    let html = `<div class="container-usuario">`;

    usuarios.forEach(user => {
        html += `
            <div class="card-usuario">
                <div class="conteudo-card">
                    <h3>${user.nome}</h3>
                    <p><i class="fa-solid fa-envelope"></i> ${user.email || 'Não informado'}</p>
                    <p><i class="fa-solid fa-phone"></i> ${user.telefone}</p>
                    <p class="tag-tipo">${user.tipo_usuario}</p>
                </div>
                <button class="btn-editar" onclick="editarUsuario(${user.id_usuario})">
                    <i class="fa-regular fa-fw fa-pen-to-square icone-padrao"></i>
                </button>
                <button class="btn-deletar" onclick="deletarUsuario(${user.id_usuario})">
                    <i class="fa-solid fa-fw fa-trash-can icone-padrao"></i>
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
};

const renderizarTabelaModalidades = async () => {
    const container = document.getElementById('lista-moadalidades'); 
    container.innerHTML = '<p>Carregando modalidades...</p>';
    
    const modalidades = await fetchModalidades();
    
    if (modalidades.length === 0) {
        container.innerHTML = '<p class="aviso-vazio">Nenhuma modalidade cadastrada.</p>';
        return;
    }

    let html = `
        <table class="tabela-dojo">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome da Modalidade</th>
                </tr>
            </thead>
            <tbody>
    `;

    modalidades.forEach(mod => {
        html += `
            <tr>
                <td>${mod.id_modalidade}</td>
                <td>${mod.nome_modalidade}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

const renderizarTabelaMatrículas = async () => {
    const container = document.getElementById('lista-matriculas');
    container.innerHTML = '<p>Carregando matrículas...</p>';
    
    const matriculas = await fetchMatriculas();
    
    if (matriculas.length === 0) {
        container.innerHTML = '<p class="aviso-vazio">Nenhuma matrícula registrada.</p>';
        return;
    }

    let html = `
        <table class="tabela-dojo">
            <thead>
                <tr>
                    <th>Aluno</th>
                    <th>Modalidade</th>
                    <th>Data de Início</th>
                </tr>
            </thead>
            <tbody>
    `;

    matriculas.forEach(mat => {
        const dataFormatada = new Date(mat.data_inicio).toLocaleDateString('pt-BR');
        html += `
            <tr>
                <td><strong>${mat.usuario.nome}</strong></td>
                <td>${mat.modalidade.nome_modalidade}</td>
                <td>${dataFormatada}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

/*
  --------------------------------------------------------------------------------------
  4. CONTROLE DO MODAL DE CADASTRO
  --------------------------------------------------------------------------------------
*/
function abrirModal() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.remove('modal-oculto');

    // Ao abrir normalmente via botão "+", o form assume comportamento de CADASTRO (POST)
    const form = document.getElementById('form-cadastro-usuario');
    form.onsubmit = async (event) => {
        event.preventDefault();
        await executarCadastro();
    };
}

function fecharModal() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.add('modal-oculto');
    
    const form = document.getElementById('form-cadastro-usuario');
    form.reset();
    form.onsubmit = null; // Remove a função associada para evitar lixo em memória
}

/*
---------------------------------------------------------------------------------------
  5. OPERAÇÕES DE SALVAMENTO DE DADOS (Alinhadas ao SRP / SOLID)
---------------------------------------------------------------------------------------
*/

// Função pura para extrair e organizar os valores dos inputs do formulário
function obterDadosDoFormulario() {
    return {
        nome: document.getElementById('input-nome').value,
        email: document.getElementById('input-email').value,
        telefone: document.getElementById('input-telefone').value,
        tipo_usuario: document.querySelector('input[name="tipo_usuario"]:checked').value.toLowerCase(),
        data_nascimento: document.getElementById('input-data-nasc').value
    };
}

// Responsabilidade Única: Tratar exclusivamente da criação do recurso
async function executarCadastro() {
    const novoUsuario = obterDadosDoFormulario();

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoUsuario)
        });

        if (response.ok) {
            alert('Usuário cadastrado com sucesso!');
            fecharModal();
            renderizarTabelaUsuarios();
        } else {
            const erroApi = await response.json();
            alert(`Erro no cadastro: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o POST:', error);
        alert('Não foi possível conectar ao servidor back-end.');
    }
}

// Responsabilidade Única: Tratar exclusivamente da atualização do recurso
async function executarEdicao(id_usuario) {
    const usuarioAtualizado = obterDadosDoFormulario();

    try {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioAtualizado)
        });

        if (response.ok) {
            alert('Usuário atualizado com sucesso!');
            fecharModal();
            renderizarTabelaUsuarios();
        } else {
            const erroApi = await response.json();
            alert(`Erro ao atualizar usuário: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o PUT:', error);
        alert('Não foi possível conectar ao servidor back-end.');
    }
}

/*
--------------------------------------------------------------------------------------
  6. REMOÇÃO E EDIÇÃO (Gatilhadores de Interface)
--------------------------------------------------------------------------------------
*/
async function deletarUsuario(id_usuario) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Usuário deletado com sucesso!');
            renderizarTabelaUsuarios();
        } else {
            const erroApi = await response.json();
            alert(`Erro ao deletar usuário: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o DELETE:', error);
        alert('Não foi possível conectar ao servidor back-end.');
    }
}

async function editarUsuario(id_usuario) {
    try {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao buscar usuário para edição.');
        
        const usuario = await response.json();

        // Alimenta o formulário visual
        document.getElementById('input-nome').value = usuario.nome;
        document.getElementById('input-email').value = usuario.email || '';
        document.getElementById('input-telefone').value = usuario.telefone || '';
        document.getElementById('input-data-nasc').value = usuario.data_nascimento || '';
        document.querySelector(`input[name="tipo_usuario"][value="${usuario.tipo_usuario}"]`).checked = true;

        // Exibe o modal de forma direta
        document.getElementById('modal-usuario').classList.remove('modal-oculto');

        // Configura dinamicamente o gatilho do submit para executar o PUT
        const form = document.getElementById('form-cadastro-usuario');
        form.onsubmit = async (event) => {
            event.preventDefault();
            await executarEdicao(id_usuario);
        };

    } catch (error) {
        console.error('Erro ao buscar usuário para edição:', error);
        alert('Não foi possível buscar os dados do usuário.');
    }
}

/*
  --------------------------------------------------------------------------------------
  7. INICIALIZAÇÃO DO SISTEMA
  --------------------------------------------------------------------------------------
*/
navegarPara('tela-usuario');