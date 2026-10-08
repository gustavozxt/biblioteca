// Leitura inicial de dados no LocalStorage
let livros = JSON.parse(localStorage.getItem('bib_livros')) || [
    { id: 1, titulo: "A Divina Comédia", autor: "Dante Alighieri", genero: "Clássico", ano: 1321, status: "Disponível" }
];

let usuarios = JSON.parse(localStorage.getItem('bib_usuarios')) || [
    { id: 1, nome: "João Silva", email: "joao@email.com", telefone: "(11) 98765-4321" }
];

let emprestimos = JSON.parse(localStorage.getItem('bib_emprestimos')) || [];

function salvarDados() {
    localStorage.setItem('bib_livros', JSON.stringify(livros));
    localStorage.setItem('bib_usuarios', JSON.stringify(usuarios));
    localStorage.setItem('bib_emprestimos', JSON.stringify(emprestimos));
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    document.getElementById('total-livros').innerText = livros.length;
    document.getElementById('total-usuarios').innerText = usuarios.length;
    
    const ativos = emprestimos.filter(e => e.status === "Em aberto").length;
    document.getElementById('total-emprestimos-ativos').innerText = ativos;
}

// Navegação entre abas
function showSection(sectionName) {
    const secLivros = document.getElementById('sec-livros');
    const secUsuarios = document.getElementById('sec-usuarios');
    const secEmprestimos = document.getElementById('sec-emprestimos');

    const btnLivros = document.getElementById('btn-tab-livros');
    const btnUsuarios = document.getElementById('btn-tab-usuarios');
    const btnEmprestimos = document.getElementById('btn-tab-emprestimos');

    secLivros.classList.add('hidden');
    secUsuarios.classList.add('hidden');
    secEmprestimos.classList.add('hidden');

    btnLivros.classList.remove('active');
    btnUsuarios.classList.remove('active');
    btnEmprestimos.classList.remove('active');

    if (sectionName === 'livros') {
        secLivros.classList.remove('hidden');
        btnLivros.classList.add('active');
        renderLivros();
    } else if (sectionName === 'usuarios') {
        secUsuarios.classList.remove('hidden');
        btnUsuarios.classList.add('active');
        renderUsuarios();
    } else if (sectionName === 'emprestimos') {
        secEmprestimos.classList.remove('hidden');
        btnEmprestimos.classList.add('active');
        atualizarSelectsEmprestimo();
        renderEmprestimos();
    }
}

// --- LIVROS ---
document.getElementById('form-livro').addEventListener('submit', function(e) {
    e.preventDefault();

    const novoLivro = {
        id: Date.now(),
        titulo: document.getElementById('livro-titulo').value,
        autor: document.getElementById('livro-autor').value,
        genero: document.getElementById('livro-genero').value,
        ano: document.getElementById('livro-ano').value,
        status: "Disponível"
    };

    livros.push(novoLivro);
    salvarDados();
    this.reset();
    renderLivros();
});

function renderLivros() {
    const lista = document.getElementById('lista-livros');
    const termoInput = document.getElementById('search-livros');
    const termo = termoInput ? termoInput.value.toLowerCase() : '';
    lista.innerHTML = '';

    const filtrados = livros.filter(l => 
        l.titulo.toLowerCase().includes(termo) || l.autor.toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="empty-msg">Nenhum livro cadastrado ou encontrado.</p>';
        return;
    }

    filtrados.forEach(livro => {
        const isDisponivel = livro.status === 'Disponível';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h4>📖 ${livro.titulo}</h4>
            <p><strong>Autor:</strong> ${livro.autor}</p>
            <p><strong>Gênero:</strong> ${livro.genero}</p>
            <p><strong>Ano:</strong> ${livro.ano}</p>
            <p><strong>Status:</strong> <span class="badge ${isDisponivel ? 'badge-green' : 'badge-red'}">${livro.status}</span></p>
            <button class="btn btn-danger" onclick="excluirLivro(${livro.id})">Excluir Livro</button>
        `;
        lista.appendChild(card);
    });
}

function excluirLivro(id) {
    livros = livros.filter(l => l.id !== id);
    salvarDados();
    renderLivros();
}

// --- USUÁRIOS ---
document.getElementById('form-usuario').addEventListener('submit', function(e) {
    e.preventDefault();

    const novoUsuario = {
        id: Date.now(),
        nome: document.getElementById('usuario-nome').value,
        email: document.getElementById('usuario-email').value,
        telefone: document.getElementById('usuario-telefone').value
    };

    usuarios.push(novoUsuario);
    salvarDados();
    this.reset();
    renderUsuarios();
});

function renderUsuarios() {
    const lista = document.getElementById('lista-usuarios');
    const termoInput = document.getElementById('search-usuarios');
    const termo = termoInput ? termoInput.value.toLowerCase() : '';
    lista.innerHTML = '';

    const filtrados = usuarios.filter(u => 
        u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
    );

    if (filtrados.length === 0) {
        lista.innerHTML = '<p class="empty-msg">Nenhum usuário cadastrado ou encontrado.</p>';
        return;
    }

    filtrados.forEach(usuario => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h4>👤 ${usuario.nome}</h4>
            <p><strong>E-mail:</strong> ${usuario.email}</p>
            <p><strong>Telefone:</strong> ${usuario.telefone}</p>
            <button class="btn btn-danger" onclick="excluirUsuario(${usuario.id})">Excluir Usuário</button>
        `;
        lista.appendChild(card);
    });
}

function excluirUsuario(id) {
    usuarios = usuarios.filter(u => u.id !== id);
    salvarDados();
    renderUsuarios();
}

// --- EMPRÉSTIMOS ---
function atualizarSelectsEmprestimo() {
    const selectUser = document.getElementById('select-usuario');
    const selectBook = document.getElementById('select-livro');

    selectUser.innerHTML = '<option value="">Escolha um usuário...</option>';
    usuarios.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = u.nome;
        selectUser.appendChild(opt);
    });

    selectBook.innerHTML = '<option value="">Escolha um livro...</option>';
    livros.filter(l => l.status === "Disponível").forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.titulo;
        selectBook.appendChild(opt);
    });
}

document.getElementById('form-emprestimo').addEventListener('submit', function(e) {
    e.preventDefault();

    const usuarioId = Number(document.getElementById('select-usuario').value);
    const livroId = Number(document.getElementById('select-livro').value);
    const dataEmprestimo = document.getElementById('data-emprestimo').value;

    const usuario = usuarios.find(u => u.id === usuarioId);
    const livro = livros.find(l => l.id === livroId);

    if (!usuario || !livro) return;

    livro.status = "Emprestado";

    const novoEmprestimo = {
        id: Date.now(),
        tituloLivro: livro.titulo,
        autorLivro: livro.autor,
        nomeUsuario: usuario.nome,
        dataEmprestimo: dataEmprestimo,
        dataDevolucao: "-",
        status: "Em aberto",
        livroId: livro.id
    };

    emprestimos.push(novoEmprestimo);
    salvarDados();
    this.reset();
    atualizarSelectsEmprestimo();
    renderEmprestimos();
});

function renderEmprestimos() {
    const lista = document.getElementById('lista-emprestimos');
    lista.innerHTML = '';

    if (emprestimos.length === 0) {
        lista.innerHTML = '<p class="empty-msg">Nenhum empréstimo registrado até o momento.</p>';
        return;
    }

    emprestimos.forEach(emp => {
        const emAberto = emp.status === 'Em aberto';
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h4>📖 Livro: ${emp.tituloLivro}</h4>
            <p><strong>Autor:</strong> ${emp.autorLivro}</p>
            <p><strong>Usuário:</strong> ${emp.nomeUsuario}</p>
            <p><strong>Data de Empréstimo:</strong> ${emp.dataEmprestimo}</p>
            <p><strong>Data de Devolução:</strong> ${emp.dataDevolucao}</p>
            <p><strong>Status:</strong> <span class="badge ${emAberto ? 'badge-red' : 'badge-blue'}">${emp.status}</span></p>
            ${emAberto ? `<button class="btn btn-action" onclick="devolverLivro(${emp.id})">Registrar Devolução</button>` : ''}
        `;
        lista.appendChild(card);
    });
}

function devolverLivro(emprestimoId) {
    const emp = emprestimos.find(e => e.id === emprestimoId);
    if (!emp) return;

    emp.status = "Devolvido";
    emp.dataDevolucao = new Date().toISOString().split('T')[0];

    const livro = livros.find(l => l.id === emp.livroId);
    if (livro) {
        livro.status = "Disponível";
    }

    salvarDados();
    renderLivros();
    renderEmprestimos();
}

// Inicialização
renderLivros();
renderUsuarios();
renderEmprestimos();
atualizarEstatisticas();