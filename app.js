// Configuração da URL base da API do backend
const API_URL = 'http://127.0.0.1:8000';

/*
  --------------------------------------------------------------------------------------
  1. SISTEMA DE ROTEAMENTO (Alternar visibilidade das telas)
  --------------------------------------------------------------------------------------
*/
function navegarPara(idDaTela) {
    // Seleciona todas as seções dentro do <main>
    const secoes = document.querySelectorAll('main section');
    
    // Oculta todas as seções adicionando a classe utilitária
    secoes.forEach(secao => {
        secao.classList.add('secao-oculta');
    });
    
    // Mostra apenas a seção solicitada
    const telaAtiva = document.getElementById(idDaTela);
    if (telaAtiva) {
        telaAtiva.classList.remove('secao-oculta');
    }

    // Carrega os dados específicos da tela que acabou de ficar ativa
    if (idDaTela === 'tela-usuario') renderizarTabelaUsuarios();
    if (idDaTela === 'tela-modalidade') renderizarTabelaModalidades();
    if (idDaTela === 'tela-matricula') renderizarTabelaMatrículas();
}

// Atribui os eventos de clique aos botões do menu do seu HTML
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

    // Monta a estrutura do card
    let html = `
            <div class="container-usuario">

    `;

    // Alimenta os dados dos usuários dentro do card
    usuarios.forEach(user => {
        let email 
        if (user.email === null) {
            email ='Não informado'
        } else {
            email = user.email
    }
        html += `
            
                <div class="card-usuario">
                <div class="conteudo-card">
                    <h3>${user.nome}</h3>
                    <p><i class="fa-solid fa-envelope"></i> ${user.email}</p>
                    <p><i class="fa-solid fa-phone"></i> ${user.telefone}</p>
                    <p class="tag-tipo">${user.tipo_usuario}</p>
                </div>
                <button class="btn-deletar" onclick="deletarUsuario(${user.id_usuario})">
                    <i class="fa-solid fa-trash-can"></i>
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

    //Formata a data de início da matrícula para o padrão brasileiro (dd/mm/yyyy)
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
  Controle do Modal de Cadastro
  --------------------------------------------------------------------------------------
*/
function abrirModal() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.remove('modal-oculto'); // Remove o disfarce e exibe o modal
}

function fecharModal() {
    const modal = document.getElementById('modal-usuario');
    modal.classList.add('modal-oculto'); // Adiciona a classe que esconde o modal
    
    // Boa prática: limpa o formulário caso o usuário feche sem salvar
    document.getElementById('form-cadastro-usuario').reset();
}
/*
---------------------------------------------------------------------------------------
METÓDOS PARA CADASTRAMENTO / INSERÇÃO DE DADOS
---------------------------------------------------------------------------------------

*/
document.getElementById('form-cadastro-usuario')?.addEventListener('submit', async (event) =>{
    event.preventDefault()

    const nomeInserido = document.getElementById('input-nome').value;
    const emailInserido = document.getElementById('input-email').value;
    const telefoneInserido = document.getElementById('input-telefone').value;
    const dataNascimentoInserido = document.getElementById('input-data-nasc').value
    const tipoUsuarioInserido = document.querySelector('input[name="tipo_usuario"]:checked').value

    const novoUsuario = {
        nome: nomeInserido,
        email: emailInserido,
        telefone: telefoneInserido,
        tipo_usuario: tipoUsuarioInserido,
        data_nascimento: dataNascimentoInserido
    };

    try{
        const response = await fetch (`${API_URL}/usuarios`,{
            method: 'POST',
            headers:{
                'Content-Type':'application/json'
            },
            body: JSON.stringify(novoUsuario)
        });
        if (response.ok){
            alert('Usuário cadastrado com sucesso!')
            fecharModal();
            renderizarTabelaUsuarios();
        }else{
            const erroApi = await response.json();
            alert(`Erro no cadastro: ${erroApi.detail || 'Verifique as informações.'}`);
        }

    }catch (error) {
        console.error('Erro ao realizar o POST:', error);
        alert('Não foi possível conectar ao servidor back-end.');
    }
});

/*
  --------------------------------------------------------------------------------------
  4. INICIALIZAÇÃO DO SISTEMA
  --------------------------------------------------------------------------------------
*/
// Quando a página abre, carrega por padrão a tela de usuários
navegarPara('tela-usuario');

/*
--------------------------------------------------------------------------------------
  5. DELEÇÃO DE USUÁRIOS
  --------------------------------------------------------------------------------------
*/
async function deletarUsuario(id_usuario) {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
        return; // Sai da função se o usuário cancelar a ação
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            alert('Usuário deletado com sucesso!');
            renderizarTabelaUsuarios(); // Atualiza a tabela após a exclusão
        } else {
            const erroApi = await response.json();
            alert(`Erro ao deletar usuário: ${erroApi.detail || 'Verifique as informações.'}`);
        }
    } catch (error) {
        console.error('Erro ao realizar o DELETE:', error);
        alert('Não foi possível conectar ao servidor back-end.');
    }
}