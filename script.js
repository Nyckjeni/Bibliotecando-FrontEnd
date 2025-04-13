document.addEventListener('DOMContentLoaded', function() {
    const bookForm = document.getElementById('bookForm');
    const bookResults = document.getElementById('bookResults');
    
    // Manipulação do Formulário
    bookForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const genre = document.getElementById('genre').value;
        const author = document.getElementById('author').value;
        const synopsis = document.getElementById('synopsis').value;
        const imageFile = document.getElementById('imageFile').files[0];

        if (name && genre && imageFile && synopsis) {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('genre', genre);
            formData.append('author', author);
            formData.append('synopsis', synopsis);
            formData.append('image', imageFile);

            // Enviar os dados para o backend
            try {
                const response = await fetch('http://localhost:3000/books', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    alert('Livro cadastrado com sucesso!');
                    fetchBooks();
                } else {
                    alert('Erro ao cadastrar livro!');
                }
            } catch (error) {
                console.error('Erro ao salvar livro:', error);
                alert('Erro ao salvar livro!');
            }
        } else {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });

    // Função para buscar e exibir livros
    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:3000/books');
            const books = await response.json();
            displayBooks(books);
        } catch (error) {
            console.error('Erro ao buscar livros:', error);
        }
    }

    // Função para exibir os livros
    function displayBooks(books) {
        bookResults.innerHTML = '';
        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <img src="${book.image}" alt="${book.name}" class="book-cover">
                <div class="book-info">
                    <p class="book-title">${book.name}</p>
                    <p class="book-genre">${book.genre}</p>
                    <p class="book-author">${book.author}</p>
                    <p class="book-synopsis">${book.synopsis}</p>
                </div>
            `;
            bookResults.appendChild(bookItem);
        });
    }

    // Carregar livros ao iniciar
    fetchBooks();
});
