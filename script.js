document.addEventListener('DOMContentLoaded', function () { 
    const bookForm = document.getElementById('bookForm');
    const autorForm = document.getElementById('AutorForm');
    const bookResults = document.getElementById('bookResults');
    const authorResults = document.getElementById('authorResults');  // Novo elemento para exibir autores
    const searchInput = document.getElementById('searchInput'); // Corrigido o ID

    const API_BASE = 'http://localhost:5000/api'; // base da API para livros e autores

    // Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('Service Worker registrado!', reg))
                .catch(err => console.error('Erro no SW', err));
        });
    }

    // Clique na área do input falso ativa o input real
    document.querySelector('.file-input-container').addEventListener('click', () => {
        document.getElementById('imageFile').click();
    });

    // Mostrar o nome do arquivo selecionado no input de texto
    document.getElementById('imageFile').addEventListener('change', (e) => {
        const fileName = e.target.files[0]?.name || '';
        document.getElementById('imageURL').value = fileName;
    });

    // ---------- Submeter formulário de livro ----------
    bookForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const genre = document.getElementById('genre').value;
        const author = document.getElementById('author').value;
        const synopsis = document.getElementById('synopsis').value;
        const imageFile = document.getElementById('imageFile').files[0];

        if (name && genre && author && imageFile && synopsis) {
            const formData = new FormData();
            formData.append('nome', name);
            formData.append('genero', genre);
            formData.append('autor', author);
            formData.append('sinopse', synopsis);
            formData.append('imagem', imageFile);

            try {
                const response = await fetch(`${API_BASE}/livros`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert('📚 Livro cadastrado com sucesso!');
                    bookForm.reset();
                    document.getElementById('imageURL').value = '';
                    fetchBooks();
                } else {
                    alert(`Erro ao cadastrar: ${data.erro || 'Erro desconhecido'}`);
                }

            } catch (error) {
                console.error('Erro ao salvar livro:', error);
                alert('❌ Erro ao salvar livro!');
            }
        } else {
            alert('⚠️ Por favor, preencha todos os campos obrigatórios.');
        }
    });

    // ---------- Submeter formulário de autor ----------
    autorForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const nome = document.getElementById('nameAutor').value;
        const livros = document.getElementById('namelivros').value;
        const biografia = document.getElementById('bioAutor').value;

        if (nome && livros && biografia) {
            try {
                const response = await fetch(`${API_BASE}/autores`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome,
                        livros,
                        biografia
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('✍️ Autor cadastrado com sucesso!');
                    autorForm.reset();
                    fetchAutores();  // Recarrega a lista de autores
                } else {
                    alert(`Erro ao cadastrar autor: ${data.erro || 'Erro desconhecido'}`);
                }

            } catch (error) {
                console.error('Erro ao cadastrar autor:', error);
                alert('❌ Erro ao cadastrar autor!');
            }
        } else {
            alert('⚠️ Preencha todos os campos do autor.');
        }
    });

    // ---------- Buscar livros ----------
    searchInput.addEventListener('input', async () => {
        const termo = searchInput.value.trim();
        if (termo === '') {
            fetchBooks();
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/livros/nome/${encodeURIComponent(termo)}`);
            if (response.ok) {
                const book = await response.json();
                displayBooks([book]);
            } else {
                bookResults.innerHTML = '<p>Nenhum livro encontrado.</p>';
            }
        } catch (error) {
            console.error('Erro ao buscar livro:', error);
        }
    });

    // ---------- Buscar todos os livros ----------
    async function fetchBooks() {
        try {
            const response = await fetch(`${API_BASE}/livros`);
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
        }
    }

    // ---------- Exibir livros ----------
    function displayBooks(books) {
        bookResults.innerHTML = '';
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <img src="${book.imagem}" alt="${book.nome}" class="book-cover">
                <div class="book-info">
                    <p class="book-title"><strong>${book.nome}</strong></p>
                    <p class="book-genre">Gênero: ${book.genero}</p>
                    <p class="book-author">Autor: ${book.autor?.nome || book.autor || 'Desconhecido'}</p>
                    <p class="book-synopsis">${book.sinopse}</p>
                </div>
            `;
            bookResults.appendChild(bookItem);
        });
    }

    // ---------- Buscar todos os autores ----------
    async function fetchAutores() {
        try {
            const response = await fetch(`${API_BASE}/autores`);
            const autores = await response.json();
            displayAutores(autores);
        } catch (error) {
            console.error('Erro ao buscar autores:', error);
        }
    }

    // ---------- Exibir autores ----------
    function displayAutores(autores) {
        authorResults.innerHTML = '';
        autores.forEach(autor => {
            const autorItem = document.createElement('div');
            autorItem.className = 'author-item';
            autorItem.innerHTML = `
                <div class="author-info">
                    <p class="author-name"><strong>${autor.nome}</strong></p>
                    <p class="author-livros">Livros: ${autor.livros}</p>
                    <p class="author-biografia">${autor.biografia}</p>
                </div>
            `;
            authorResults.appendChild(autorItem);
        });
    }

    // ---------- Inicialização ----------
    fetchBooks();
    fetchAutores();  // Adicionando a chamada para buscar os autores
});
