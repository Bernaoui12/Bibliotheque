
let books = JSON.parse(localStorage.getItem('books')) || [
    { id: 1, title: "L'Étranger", author: "Albert Camus", year: 1942, genre: "Roman" },
    { id: 2, title: "1984", author: "George Orwell", year: 1949, genre: "Science-Fiction" }
];
let authors = JSON.parse(localStorage.getItem('authors')) || ["Albert Camus", "George Orwell"];
let myChart = null;

// Vérifier l'authentification
if (!localStorage.getItem('bibliotheca_current_user')) {
    window.location.href = 'login.html';
}

// Afficher le nom d'utilisateur
const currentUser = JSON.parse(localStorage.getItem('bibliotheca_current_user'));
if (currentUser && document.getElementById('currentUsername')) {
    document.getElementById('currentUsername').textContent = currentUser.username;
}

// Fonction de déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        localStorage.removeItem('bibliotheca_current_user');
        window.location.href = 'login.html';
    }
}

// Fonction pour mettre à jour l'horloge
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('fr-FR');
    const clockElement = document.getElementById('clock');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}

// Démarrer l'horloge
setInterval(updateClock, 1000);
updateClock();



document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-section');
        
        document.querySelectorAll('.spa-section').forEach(s => s.classList.add('d-none'));
        document.getElementById(target).classList.remove('d-none');
        
        document.querySelectorAll('[data-section]').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        if(target === 'dashboard') initDashboard();
        render();
    });
});


const bookForm = document.getElementById('bookForm');
const bookModal = new bootstrap.Modal(document.getElementById('bookModal'));

bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('bookId').value;
    const newBook = {
        id: id ? parseInt(id) : Date.now(),
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        year: parseInt(document.getElementById('bookYear').value),
        genre: document.getElementById('bookGenre').value
    };

    if (id) {
        const index = books.findIndex(b => b.id == id);
        books[index] = newBook;
    } else {
        books.push(newBook);
    }

    saveAndRender();
    bookModal.hide();
    bookForm.reset();
});

function deleteBook(id) {
    if (confirm('Supprimer ce livre ?')) {
        books = books.filter(b => b.id != id);
        saveAndRender();
    }
}

function editBook(id) {
    const b = books.find(book => book.id == id);
    document.getElementById('bookId').value = b.id;
    document.getElementById('bookTitle').value = b.title;
    document.getElementById('bookAuthor').value = b.author;
    document.getElementById('bookYear').value = b.year;
    document.getElementById('bookGenre').value = b.genre;
    bookModal.show();
}


const authorForm = document.getElementById('authorForm');
authorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('authorName').value;
    if(!authors.includes(name)) {
        authors.push(name);
        saveAndRender();
        bootstrap.Modal.getInstance(document.getElementById('authorModal')).hide();
        authorForm.reset();
    }
});

function deleteAuthor(name) {
    authors = authors.filter(a => a !== name);
    saveAndRender();
}


function initDashboard() {
    updateKPIs();
    initChart();
    fetchExternalInfo();
}

function updateKPIs() {
    document.getElementById('kpi-books').innerText = books.length;
    document.getElementById('kpi-authors').innerText = authors.length;
    if(books.length > 0) {
        const last = books[books.length - 1];
        document.getElementById('kpi-last-date').innerText = last.title;
    }
}

function initChart() {
    const ctx = document.getElementById('booksChart').getContext('2d');
    const genres = [...new Set(books.map(b => b.genre))];
    const counts = genres.map(g => books.filter(b => b.genre === g).length);

    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: genres,
            datasets: [{
                label: 'Nombre de livres',
                data: counts,
                backgroundColor: '#4e73df'
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } } }
    });
}


async function fetchExternalInfo() {
    const apiContainer = document.getElementById('api-data');
    try {
      
        const response = await fetch('https://openlibrary.org/works/OL26301W.json');
        const data = await response.json();
        apiContainer.innerHTML = `
            <p><strong>Livre du jour (API):</strong> ${data.title}</p>
            <p><strong>Description:</strong> ${data.description?.value?.substring(0, 100) || "Pas de description"}...</p>
        `;
    } catch (error) {
        apiContainer.innerHTML = "Impossible de charger les données API.";
        console.error("Erreur API:", error);
    }
}


function saveAndRender() {
    localStorage.setItem('books', JSON.stringify(books));
    localStorage.setItem('authors', JSON.stringify(authors));
    render();
}

function render() {
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>${b.title}</td>
            <td>${b.author}</td>
            <td>${b.year}</td>
            <td><span class="badge bg-secondary">${b.genre}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-warning" onclick="editBook(${b.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBook(${b.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');

    initDashboard();
    render();
    updateClock(); // Appel initial pour afficher l'heure immédiatement

    const authList = document.getElementById('authors-list');
    authList.innerHTML = authors.map(a => `
        <div class="col-md-4 mb-3">
            <div class="card p-3 d-flex flex-row justify-content-between align-items-center border-0 shadow-sm">
                <span><i class="fas fa-user me-2 text-primary"></i>${a}</span>
                <button class="btn btn-sm text-danger" onclick="deleteAuthor('${a}')"><i class="fas fa-times"></i></button>
            </div>
        </div>
    `).join('');

    updateKPIs();
}




initDashboard();
render();