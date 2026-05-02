const GAMES_DATA = [
    { id: 1, title: "Pokémon Espada", platform: "Nintendo Switch", date: "Noviembre 15, 2019", image: "img/Pokemon espada.jpg", criticScore: 80, userScore: 4.8, category: "Juego" },
    { id: 2, title: "The Legend of Zelda Breath of the wild", platform: "Nintendo Switch", date: "Marzo 3, 2017", image: "img/The Legend of Zelda Breath of the Wild.jpg", criticScore: 97, userScore: 8.7, category: "Juego" },
    { id: 3, title: "God of War Ragnarök", platform: "PlayStation 5", date: "Noviembre 9, 2022", image: "img/GodofWarRagnarök.jpg", criticScore: 94, userScore: 8.2, category: "Juego" },
    { id: 4, title: "Elden Ring", platform: "Multiplataforma", date: "Febrero 25, 2022", image: "img/Eldenring.jpg", criticScore: 96, userScore: 7.9, category: "Juego" },
    { id: 5, title: "Hogwarts Legacy", platform: "Multiplataforma", date: "Febrero 10, 2023", image: "img/Hogwardslegacy.jpg", criticScore: 84, userScore: 6.5, category: "Juego" },
    { id: 6, title: "Spider-Man 2", platform: "PlayStation 5", date: "Octubre 20, 2023", image: "img/Spiderman2.jpg", criticScore: 90, userScore: 8.1, category: "Juego" }
];

const MOVIES_DATA = [
    { id: 101, title: "Oppenheimer", category: "Película", image: "img/oppenheimer.jpg", criticScore: 93, userScore: 8.4 },
    { id: 102, title: "Barbie", category: "Película", image: "img/Barbie.jpg", criticScore: 88, userScore: 7.2 },
    { id: 103, title: "Dune: Parte 2", category: "Película", image: "img/Duneparttwo.jpg", criticScore: 92, userScore: 8.5 },
    { id: 104, title: "The Batman", category: "Película", image: "img/Thebatman.jpg", criticScore: 85, userScore: 7.8 },
    { id: 105, title: "Everything Everywhere", category: "Película", image: "img/Todo En Todas Partes Al Mismo Tiempo.jpg", criticScore: 95, userScore: 8.0 }
];

let currentRating = 0;
let currentEditRating = 0;
let editingReviewId = null;

function getUsers() {
    return JSON.parse(localStorage.getItem('cm_users') || '[]');
}

function saveUsers(users) {
    localStorage.setItem('cm_users', JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('cm_currentUser') || 'null');
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('cm_currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('cm_currentUser');
    }
}

function getReviews() {
    return JSON.parse(localStorage.getItem('cm_reviews') || '[]');
}

function saveReviews(reviews) {
    localStorage.setItem('cm_reviews', JSON.stringify(reviews));
}

function openAuthModal() {
    document.getElementById('authModal').classList.add('active');
    switchAuthTab('register');
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
}

function switchAuthTab(tab) {
    const regForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const tabReg = document.getElementById('tabRegister');
    const tabLogin = document.getElementById('tabLogin');

    if (tab === 'register') {
        regForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
        tabReg.classList.add('active');
        tabLogin.classList.remove('active');
    } else {
        regForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        tabReg.classList.remove('active');
        tabLogin.classList.add('active');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!email || !username || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        alert('Este correo ya está registrado');
        return;
    }

    const newUser = { id: Date.now(), email, username, password };
    users.push(newUser);
    saveUsers(users);

    setCurrentUser({ id: newUser.id, email: newUser.email, username: newUser.username });
    closeAuthModal();
    updateAuthUI();
    showView('profile');
    alert('¡Registro exitoso! Bienvenido, ' + username);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Por favor completa todos los campos');
        return;
    }

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert('Correo o contraseña incorrectos');
        return;
    }

    setCurrentUser({ id: user.id, email: user.email, username: user.username });
    closeAuthModal();
    updateAuthUI();
    showView('profile');
}

function logout() {
    setCurrentUser(null);
    updateAuthUI();
    showView('home');
}

function updateAuthUI() {
    const user = getCurrentUser();
    const authBtn = document.getElementById('authButton');

    if (user) {
        authBtn.innerHTML = `<button class="btn btn-outline-light btn-sm" onclick="logout()">Cerrar sesión</button>`;
    } else {
        authBtn.innerHTML = `<button class="btn btn-register" onclick="openAuthModal()">Registrar</button>`;
    }
}

function showView(viewName) {
    document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));

    const viewMap = {
        'home': 'homeView',
        'profile': 'profileView',
        'createReview': 'createReviewView',
        'gameDetail': 'gameDetailView'
    };

    const viewId = viewMap[viewName];
    if (viewId) {
        const viewEl = document.getElementById(viewId);
        viewEl.classList.remove('hidden');
        viewEl.classList.add('fade-in');
    }

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    if (viewName === 'home') {
        renderHome();
    } else if (viewName === 'profile') {
        if (!getCurrentUser()) {
            openAuthModal();
            return;
        }
        renderProfile();
    } else if (viewName === 'createReview') {
        if (!getCurrentUser()) {
            openAuthModal();
            return;
        }
        resetReviewForm();
    }

    window.scrollTo(0, 0);
}

function getScoreClass(score) {
    if (score >= 75) return 'score-green';
    if (score >= 50) return 'score-yellow';
    return 'score-red';
}

function renderHome() {
    const novedadesContainer = document.getElementById('novedadesContainer');
    const juegosContainer = document.getElementById('juegosContainer');

    novedadesContainer.innerHTML = MOVIES_DATA.map(movie => `
    <div class="col-md-4 col-lg-2 col-6 mb-3">
        <div class="game-card" onclick="showGameDetail(${movie.id}, 'movie')">
            <div class="placeholder-img" style="height: 250px;">
                ${movie.image
            ? `<img src="${movie.image}" class="w-100 h-100">`
            : `<i class="bi bi-film"></i>`}
            </div>
            
            <div class="p-2">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <small class="text-muted">${movie.category}</small>
                        <h6 class="mb-1 fw-bold">${movie.title}</h6>
                    </div>
                    <div class="score-badge ${getScoreClass(movie.criticScore)}" style="width: 36px; height: 36px; font-size: 0.9rem;">
                        ${movie.criticScore}
                    </div>
                </div>
                <p class="text-muted small mb-0">descripción de las reseñas</p>
            </div>
        </div>
    </div>
`).join('');

    juegosContainer.innerHTML = GAMES_DATA.map(game => `
    <div class="col-md-6 col-lg-2 col-6 mb-3">
        <div class="game-card" onclick="showGameDetail(${game.id}, 'game')">
            <div class="placeholder-img" style="height: 250px;">
                ${game.image
            ? `<img src="${game.image}" class="w-100 h-100">`
            : `<i class="bi bi-controller"></i>`}
            </div>
            <div class="p-2">
                <h6 class="mb-2 fw-bold">${game.title}</h6>
                <div class="d-flex align-items-center gap-3">
                    <div class="score-badge ${getScoreClass(game.criticScore)}" style="width: 36px; height: 36px; font-size: 0.8rem;">
                        ${game.criticScore}
                    </div>
                    <small class="text-muted">Descripción de las reseñas</small>
                </div>
            </div>
        </div>
    </div>
`).join('');
}

function showGameDetail(id, type) {
    const data = type === 'game'
        ? GAMES_DATA.find(g => g.id === id)
        : MOVIES_DATA.find(m => m.id === id);
    if (!data) return;

    document.getElementById('detailGameTitle').textContent = data.title;
    document.getElementById('detailGamePlatform').textContent = data.platform || data.category;
    document.getElementById('detailCriticScore').textContent = data.criticScore;
    document.getElementById('detailCriticScore').className = `score-badge ${getScoreClass(data.criticScore)}`;
    document.getElementById('detailUserScore').textContent = data.userScore;
    document.getElementById('detailGameImg').innerHTML = data.image
        ? `<img src="${data.image}" class="w-100 h-100 rounded-3"
       onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'bi bi-controller\\'></i>';">`
        : `<i class="bi bi-controller"></i>`;

    const reviews = getReviews().filter(r => r.gameTitle === data.title);
    const detailReviewsList = document.getElementById('detailReviewsList');

    if (reviews.length === 0) {
        detailReviewsList.innerHTML = '<p class="text-muted">No hay reseñas aún. ¡Sé el primero en reseñar!</p>';
    } else {
        detailReviewsList.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="fw-bold mb-1">${r.title}</h5>
                        <p class="text-muted mb-1">Por: ${r.author}</p>
                        <p>${r.description}</p>
                    </div>
                    <div class="score-badge ${getScoreClass(r.rating * 20)}" style="width: 45px; height: 45px;">${r.rating}</div>
                </div>
            </div>
        `).join('');
    }

    showView('gameDetail');
}

function renderProfile() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('profileName').textContent = user.username;

    const reviews = getReviews().filter(r => r.userId === user.id);
    document.getElementById('reviewCount').textContent = reviews.length;

    const container = document.getElementById('userReviewsList');

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-journal-text" style="font-size: 3rem; color: #dee2e6;"></i>
                <p class="text-muted mt-3">No has creado ninguna reseña aún.</p>
                <button class="btn btn-dark" onclick="showView('createReview')">Crear mi primera reseña</button>
            </div>
        `;
        return;
    }

    container.innerHTML = `<div class="row">${reviews.map(r => `
        <div class="col-md-6 col-lg-4 mb-3">
            <div class="review-card h-100">
                <div class="d-flex gap-3">
                    <div class="placeholder-img flex-shrink-0" style="width: 80px; height: 80px; border-radius: 8px;">
                        <i class="bi bi-controller"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="fw-bold mb-1">${r.title}</h6>
                        <p class="text-muted small mb-1 text-truncate-2">${r.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="score-badge ${getScoreClass(r.rating * 20)}" style="width: 36px; height: 36px; font-size: 0.9rem;">${r.rating}</div>
                            <div>
                                <button class="btn btn-outline-primary btn-action btn-sm" onclick="openEditModal(${r.id})">Editar</button>
                                <button class="btn btn-outline-danger btn-action btn-sm" onclick="deleteReview(${r.id})">Eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('')}</div>`;
}

function setRating(value) {
    currentRating = value;
    document.getElementById('reviewRating').value = value;
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach((star, index) => {
        star.classList.toggle('bi-star-fill', index < value);
        star.classList.toggle('bi-star', index >= value);
    });
    document.getElementById('ratingError').classList.add('hidden');
}

function resetReviewForm() {
    document.getElementById('reviewForm').reset();
    currentRating = 0;
    document.getElementById('reviewRating').value = 0;
    document.querySelectorAll('#starRating i').forEach(star => {
        star.classList.remove('bi-star-fill');
        star.classList.add('bi-star');
    });
    document.getElementById('ratingError').classList.add('hidden');
}

function handleCreateReview(e) {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
        openAuthModal();
        return;
    }

    const title = document.getElementById('reviewTitle').value.trim();
    const description = document.getElementById('reviewDesc').value.trim();
    const rating = parseInt(document.getElementById('reviewRating').value);

    if (!title || !description) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (rating === 0) {
        document.getElementById('ratingError').classList.remove('hidden');
        return;
    }

    const reviews = getReviews();
    const game = GAMES_DATA.find(g => g.title === title);
    const newReview = {
        id: Date.now(),
        userId: user.id,
        author: user.username,
        title,
        description,
        rating,
        gameTitle: title,
        date: new Date().toLocaleDateString('es-ES'),
        image: game ? game.image : null,
    };

    reviews.push(newReview);
    saveReviews(reviews);

    alert('¡Reseña publicada exitosamente!');
    resetReviewForm();
    showView('profile');
}

function setEditRating(value) {
    currentEditRating = value;
    document.getElementById('editRating').value = value;
    const stars = document.querySelectorAll('#editStarRating i');
    stars.forEach((star, index) => {
        star.classList.toggle('bi-star-fill', index < value);
        star.classList.toggle('bi-star', index >= value);
    });
}

function openEditModal(reviewId) {
    const reviews = getReviews();
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    editingReviewId = reviewId;
    document.getElementById('editReviewId').value = reviewId;
    document.getElementById('editTitle').value = review.title;
    document.getElementById('editDesc').value = review.description;
    setEditRating(review.rating);

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    editingReviewId = null;
}

function handleEditReview(e) {
    e.preventDefault();

    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDesc').value.trim();
    const rating = parseInt(document.getElementById('editRating').value);

    if (!title || !description || rating === 0) {
        alert('Por favor completa todos los campos');
        return;
    }

    let reviews = getReviews();
    const index = reviews.findIndex(r => r.id === editingReviewId);

    if (index !== -1) {
        reviews[index] = { ...reviews[index], title, description, rating, gameTitle: title };
        saveReviews(reviews);
        closeEditModal();
        renderProfile();
        alert('Reseña actualizada correctamente');
    }
}

function deleteReview(reviewId) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reseña?')) return;

    let reviews = getReviews();
    reviews = reviews.filter(r => r.id !== reviewId);
    saveReviews(reviews);
    renderProfile();
}

document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();
    renderHome();
    showView('home');
});
