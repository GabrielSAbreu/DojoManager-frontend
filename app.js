// Configuração da URL base da API do backend
const API_URL = 'http://127.0.0.1:8000';

/*
  --------------------------------------------------------------------------------------
  1. SISTEMA DE ROTEAMENTO (Alternar visibilidade das telas)
  --------------------------------------------------------------------------------------
*/
function fecharTodosModais() {
    fecharModal();
    fecharModalModalidade();
    fecharModalMatricula();
}

function navegarPara(idDaTela) {
    fecharTodosModais();

    const secoes = document.querySelectorAll('main section');
    secoes.forEach(secao => {
        secao.classList.add('secao-oculta');
    });

    const telaAtiva = document.getElementById(idDaTela);
    if (telaAtiva) {
        telaAtiva.classList.remove('secao-oculta');
    }

    document.querySelectorAll('.item-nav').forEach(item => {
        item.classList.remove('item-nav-ativo');
    });

    const itemAtivo = document.querySelector(`.item-nav[data-target="${idDaTela}"]`);

    if (itemAtivo) {
        itemAtivo.classList.add('item-nav-ativo');
    }

    if (idDaTela === 'tela-usuario') renderizarTabelaUsuarios();
    if (idDaTela === 'tela-modalidade') renderizarTabelaModalidades();
    if (idDaTela === 'tela-matricula') renderizarTabelaMatrículas();
}

document.getElementById('id-usuario').addEventListener('click', () => navegarPara('tela-usuario'));
document.getElementById('id-modalidade').addEventListener('click', () => navegarPara('tela-modalidade'));
document.getElementById('id-matricula').addEventListener('click', () => navegarPara('tela-matricula'));

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
  3. FUNÇÕES DE RENDERIZAÇÃO 
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
                <div class="card-actions">
                    <button class="btn-editar" onclick="editarUsuario(${user.id_usuario})">
                        <i class="fa-regular fa-fw fa-pen-to-square icone-padrao"></i>
                    </button>
                    <button class="btn-deletar" onclick="deletarUsuario(${user.id_usuario})">
                        <i class="fa-solid fa-fw fa-trash-can icone-padrao"></i>
                    </button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
};

const renderizarTabelaModalidades = async () => {
    const container = document.getElementById('lista-modalidades'); 
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
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
    `;

    modalidades.forEach(mod => {
        html += `
            <tr>
                <td>${mod.id_modalidade}</td>
                <td><strong>${mod.nome_modalidade}</strong></td>
                <td>
                    <button class="btn-editar-tabela" onclick="editarModalidade(${mod.id_modalidade})">
                        <i class="fa-regular fa-pen-to-square icone-padrao"></i>
                    </button>
                    <button class="btn-deletar-tabela" onclick="deletarModalidade(${mod.id_modalidade})">
                        <i class="fa-solid fa-trash-can icone-padrao"></i>
                    </button>
                </td>
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
                    <th>Pessoa</th>
                    <th>Modalidade</th>
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
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
};

/*
  --------------------------------------------------------------------------------------
  4. CONTROLE DOS MODAIS
  --------------------------------------------------------------------------------------
*/
function abrirModal() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.remove('modal-oculto');

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
    form.onsubmit = null;
}

function abrirModalModalidade() {
    const modal = document.getElementById('modal-modalidade');
    modal.classList.remove('modal-oculto');

    const form = document.getElementById('form-cadastro-modalidade');
    form.onsubmit = async (event) => {
        event.preventDefault();
        await executarCadastroModalidade();
    };
}

function fecharModalModalidade() {
    const modal = document.getElementById('modal-modalidade');
    modal.classList.add('modal-oculto');
    
    const form = document.getElementById('form-cadastro-modalidade');
    form.reset();
    form.onsubmit = null;
}

// Controle do Modal de Matrícula (Comportamento igual aos anteriores)
function abrirModalMatricula() {
    const modal = document.getElementById('modal-matricula');
    modal.classList.remove('modal-oculto');

    // Inicializa carregando os selects dinamicamente ao abrir
    atualizarSelectUsuariosPorTipo();
    carregarModalidadesNoSelect();

    const form = document.getElementById('form-cadastro-matricula');
    form.onsubmit = async (event) => {
        event.preventDefault();
        await executarCadastroMatricula();
    };
}

function fecharModalMatricula() {
    const modal = document.getElementById('modal-matricula');
    modal.classList.add('modal-oculto');
    
    const form = document.getElementById('form-cadastro-matricula');
    form.reset();
    form.onsubmit = null;
}

/*
  --------------------------------------------------------------------------------------
  4.1 LÓGICA DE FILTROS DINÂMICOS PARA SELEÇÃO DA MATRÍCULA
  --------------------------------------------------------------------------------------
*/
async function atualizarSelectUsuariosPorTipo() {
    const selectPessoa = document.getElementById('select-usuario-matricula');
    selectPessoa.innerHTML = '<option value="">Carregando...</option>';

    // Pega o valor do botão de rádio selecionado (aluno ou professor)
    const tipoSelecionado = document.querySelector('input[name="filtro_tipo_usuario"]:checked').value;
    
    // Busca a lista completa do back-end
    const todosUsuarios = await fetchUsuarios();

    // Filtra para bater com o tipo selecionado pelo usuário
    const usuariosFiltrados = todosUsuarios.filter(user => user.tipo_usuario.toLowerCase() === tipoSelecionado.toLowerCase());

    if (usuariosFiltrados.length === 0) {
        selectPessoa.innerHTML = `<option value="">Nenhum ${tipoSelecionado} cadastrado</option>`;
        return;
    }

    let options = `<option value="">Selecione o ${tipoSelecionado}...</option>`;
    usuariosFiltrados.forEach(user => {
        options += `<option value="${user.id_usuario}">${user.nome}</option>`;
    });
    
    selectPessoa.innerHTML = options;
}

async function carregarModalidadesNoSelect() {
    const selectMod = document.getElementById('select-modalidade-matricula');
    selectMod.innerHTML = '<option value="">Carregando...</option>';

    const modalidades = await fetchModalidades();

    if (modalidades.length === 0) {
        selectMod.innerHTML = '<option value="">Nenhuma modalidade disponível</option>';
        return;
    }

    let options = '<option value="">Selecione uma modalidade...</option>';
    modalidades.forEach(mod => {
        options += `<option value="${mod.id_modalidade}">${mod.nome_modalidade}</option>`;
    });

    selectMod.innerHTML = options;
}

/*
---------------------------------------------------------------------------------------
  5. OPERAÇÕES DE SALVAMENTO DE USUÁRIOS
---------------------------------------------------------------------------------------
*/
function obterDadosDoFormulario() {
    return {
        nome: document.getElementById('input-nome').value,
        email: document.getElementById('input-email').value,
        telefone: document.getElementById('input-telefone').value,
        tipo_usuario: document.querySelector('input[name="tipo_usuario"]:checked').value.toLowerCase(),
        data_nascimento: document.getElementById('input-data-nasc').value
    };
}

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

async function executarEdicao(id_usuario) {
    const usuarioAtualizado = obterDadosDoFormulario();
    try {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioAtualizado)
        });

        if (response.ok) {
            alert('Usuário atualizado com sucesso com sucesso!');
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
---------------------------------------------------------------------------------------
  6. OPERAÇÕES DE SALVAMENTO DE MODALIDADES 
---------------------------------------------------------------------------------------
*/
function obterDadosDaModalidade() {
    return {
        nome_modalidade: document.getElementById('input-nome-modalidade').value
    };
}

async function executarCadastroModalidade() {
    const novaModalidade = obterDadosDaModalidade();
    try {
        const response = await fetch(`${API_URL}/modalidades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaModalidade)
        });

        if (response.ok) {
            alert('Modalidade cadastrada com sucesso!');
            fecharModalModalidade();
            renderizarTabelaModalidades();
        } else {
            const erroApi = await response.json();
            alert(`Erro no cadastro: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o POST de modalidade:', error);
        alert('Não foi possível conectar ao servidor.');
    }
}

async function executarEdicaoModalidade(id_modalidade) {
    const modalidadeAtualizada = obterDadosDaModalidade();
    try {
        const response = await fetch(`${API_URL}/modalidades/${id_modalidade}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(modalidadeAtualizada)
        });

        if (response.ok) {
            alert('Modalidade actualizada com sucesso!');
            fecharModalModalidade();
            renderizarTabelaModalidades();
        } else {
            const erroApi = await response.json();
            alert(`Erro ao atualizar: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o PUT de modalidade:', error);
        alert('Não foi possível conectar ao servidor.');
    }
}

/*
---------------------------------------------------------------------------------------
  6.1 OPERAÇÕES DE SALVAMENTO DE MATRÍCULAS 
---------------------------------------------------------------------------------------
*/
function obterDadosDaMatricula() {
    return {
        fk_usuario_id_usuario: parseInt(document.getElementById('select-usuario-matricula').value),
        fk_modalidade_id: parseInt(document.getElementById('select-modalidade-matricula').value)
    };
}

async function executarCadastroMatricula() {
    const novaMatricula = obterDadosDaMatricula();
    try {
        const response = await fetch(`${API_URL}/praticas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novaMatricula)
        });

        if (response.ok) {
            alert('Matrícula realizada com sucesso!');
            fecharModalMatricula();
            renderizarTabelaMatrículas();
        } else {
            const erroApi = await response.json();
            alert(`Erro na matrícula: ${erroApi.detail || 'Verifique os dados.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o POST de matrícula:', error);
        alert('Não foi possível registrar a matrícula.');
    }
}

/*
--------------------------------------------------------------------------------------
  7. Ações de Deleção e Edição
--------------------------------------------------------------------------------------
*/
async function deletarUsuario(id_usuario) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;
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

        document.getElementById('input-nome').value = usuario.nome;
        document.getElementById('input-email').value = usuario.email || '';
        document.getElementById('input-telefone').value = usuario.telefone || '';
        document.getElementById('input-data-nasc').value = usuario.data_nascimento || '';
        document.querySelector(`input[name="tipo_usuario"][value="${usuario.tipo_usuario}"]`).checked = true;

        document.getElementById('modal-usuario').classList.remove('modal-oculto');

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

async function deletarModalidade(id_modalidade) {
    if (!confirm('Tem certeza que deseja deletar esta modalidade?')) return;
    try {
        const response = await fetch(`${API_URL}/modalidades/${id_modalidade}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Modalidade deletada com sucesso!');
            renderizarTabelaModalidades();
        } else {
            const erroApi = await response.json();
            alert(`Erro ao deletar: ${erroApi.detail || 'Verifique se existem matrículas vinculadas.'}`);
        }
    } catch (error) {
        console.error('Erro ao deletar modalidade:', error);
        alert('Erro ao conectar com o back-end.');
    }
}

async function editarModalidade(id_modalidade) {
    try {
        const response = await fetch(`${API_URL}/modalidades/${id_modalidade}`, { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao buscar modalidade.');
        
        const mod = await response.json();
        document.getElementById('input-nome-modalidade').value = mod.nome_modalidade;

        document.getElementById('modal-modalidade').classList.remove('modal-oculto');

        const form = document.getElementById('form-cadastro-modalidade');
        form.onsubmit = async (event) => {
            event.preventDefault();
            await executarEdicaoModalidade(id_modalidade);
        };
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        alert('Não foi possível carregar os dados da modalidade.');
    }
}

/*
  --------------------------------------------------------------------------------------
  8. INICIALIZAÇÃO DO SISTEMA E OUVINTES DE EVENTOS
  --------------------------------------------------------------------------------------
*/
// Configura a escuta reativa da mudança dos botões de rádio do modal de matrícula
document.querySelectorAll('input[name="filtro_tipo_usuario"]').forEach(radio => {
    radio.addEventListener('change', atualizarSelectUsuariosPorTipo);
});

// Define a tela padrão inicial
navegarPara('tela-usuario');