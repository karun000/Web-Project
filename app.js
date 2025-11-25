// script.js - Full Fixed Version

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const loading = document.getElementById('loading');
const modal = document.getElementById('bookModal');
const closeModalBtn = document.querySelector('.close');

// Close modal properly (fixes scroll issue!)
closeModalBtn.onclick = closeModal;
window.onclick = (e) => {
    if (e.target === modal) closeModal();
};

function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Disable background scroll
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';   // Re-enable scrolling ← THIS FIXES THE BUG!
}

// Search on Enter or button click
searchInput.addEventListener('keypress', e => e.key === 'Enter' && searchBooks());
searchBtn.addEventListener('click', searchBooks);

// Load random popular books on page load
window.addEventListener('load', showRandomBooks);

// Popular topics to show on homepage
const randomQueries = [
    "classic literature", "science fiction", "fantasy", "mystery", "romance",
    "philosophy", "history", "biography", "psychology", "art", "poetry",
    "harry potter", "lord of the rings", "pride and prejudice", "1984", "dune"
];

async function showRandomBooks() {
    loading.style.display = 'block';
    resultsDiv.innerHTML = '<p style="text-align:center; color:white; font-size:1.3rem; grid-column:1/-1; padding:3rem;">Discover amazing books...</p>';

    const selected = randomQueries.sort(() => Math.random() - 0.5).slice(0, 3);
    const allBooks = [];

    for (const q of selected) {
        try {
            const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`);
            const data = await res.json();
            if (data.docs) {
                const goodBooks = data.docs
                    .filter(b => b.cover_i && b.title && b.author_name)
                    .slice(0, 5);
                allBooks.push(...goodBooks);
            }
        } catch (err) {
            console.log("One query failed, continuing...");
        }
    }

    const finalBooks = allBooks.sort(() => Math.random() - 0.5).slice(0, 12);
    displayBooks(finalBooks);
    loading.style.display = 'none';
}

async function searchBooks() {
    const query = searchInput.value.trim();
    if (!query) {
        alert("Please enter a book title, author, or topic!");
        return;
    }

    loading.style.display = 'block';
    resultsDiv.innerHTML = '';

    try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=24`);
        const data = await res.json();

        if (!data.docs || data.docs.length === 0) {
            resultsDiv.innerHTML = `<p style="text-align:center; color:white; padding:4rem; grid-column:1/-1;">
                No books found for "<strong>${escapeHtml(query)}</strong>"
            </p>`;
            loading.style.display = 'none';
            return;
        }

        displayBooks(data.docs.slice(0, 24));
    } catch (err) {
        resultsDiv.innerHTML = `<p style="text-align:center; color:white; padding:4rem;">Error loading books. Please try again.</p>`;
        console.error(err);
    } finally {
        loading.style.display = 'none';
    }
}

function displayBooks(books) {
    resultsDiv.innerHTML = '';

    books.forEach(book => {
        const coverUrl = book.cover_i 
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
            : null;

        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
            <div class="book-cover">
                ${coverUrl 
                    ? `<img src="${coverUrl}" loading="lazy" alt="${escapeHtml(book.title)}">`
                    : '<div class="no-cover">Book</div>'
                }
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title || 'Unknown Title')}</h3>
                <p class="book-author">${escapeHtml(book.author_name?.join(', ') || 'Unknown Author')}</p>
                <p class="book-year">Published: ${book.first_publish_year || 'N/A'}</p>
                <button class="read-more" data-key="${book.key || ''}">View Details</button>
            </div>
        `;

        card.querySelector('.read-more').onclick = () => {
            if (book.key) showBookDetails(book.key);
        };

        resultsDiv.appendChild(card);
    });
}

async function showBookDetails(key) {
    openModal();

    // Reset modal
    document.getElementById('modalCover').src = '';
    document.getElementById('noCoverModal').style.display = 'block';
    document.getElementById('modalDescription').textContent = 'Loading book details...';
    document.getElementById('modalSubjects').innerHTML = '';

    try {
        const res = await fetch(`https://openlibrary.org${key}.json`);
        const book = await res.json();

        // Title & Author
        document.getElementById('modalTitle').textContent = book.title || 'Unknown Title';

        let authorNames = 'Unknown Author';
        if (book.authors && book.authors.length > 0) {
            const authorPromises = book.authors.map(a => 
                fetch(`https://openlibrary.org${a.author.key}.json`).then(r => r.json())
            );
            const authors = await Promise.all(authorPromises);
            authorNames = authors.map(a => a.name).join(', ');
        }
        document.getElementById('modalAuthor').textContent = authorNames;

        // Cover
        if (book.covers && book.covers[0]) {
            document.getElementById('modalCover').src = `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
            document.getElementById('noCoverModal').style.display = 'none';
        }

        // Details
        document.getElementById('modalYear').textContent = 
            book.first_publish_date ? `First Published: ${book.first_publish_date}` : '';
        document.getElementById('modalPublisher').textContent = 
            book.publishers ? `Publisher: ${book.publishers.join(', ')}` : '';
        document.getElementById('modalPages').textContent = 
            book.number_of_pages ? `Pages: ${book.number_of_pages}` : '';
        document.getElementById('modalISBN').textContent = 
            book.isbn?.[0] ? `ISBN: ${book.isbn[0]}` : '';

        // Subjects
        const subjectsDiv = document.getElementById('modalSubjects');
        if (book.subjects) {
            book.subjects.slice(0, 12).forEach(subject => {
                const span = document.createElement('span');
                span.textContent = subject;
                subjectsDiv.appendChild(span);
            });
        }

        // Description
        let description = 'No description available.';
        if (book.description) {
            description = typeof book.description === 'object' 
                ? book.description.value 
                : book.description;
        }
        document.getElementById('modalDescription').innerHTML = 
            description.replace(/\n/g, '<br>');

        // Action Links
        document.getElementById('readLink').href = `https://openlibrary.org${key}/borrow`;
        document.getElementById('olLink').href = `https://openlibrary.org${key}`;

    } catch (err) {
        document.getElementById('modalDescription').textContent = 
            'Failed to load book details. Please try again later.';
        console.error('Error loading book:', err);
    }
}

// Safe HTML escaping
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}