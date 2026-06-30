// Flashcard Decks and Study Module
(function () {
  let decks = [];
  let currentDeckId = null;
  let studySessionCards = [];
  let currentStudyIndex = 0;

  function init() {
    loadDecks();
    setupEventListeners();
    renderDecks();
  }

  function loadDecks() {
    const stored = localStorage.getItem('studyflow_decks');
    if (stored) {
      decks = JSON.parse(stored);
    } else {
      // Seed initial decks
      decks = [
        {
          id: 'deck-1',
          name: 'Spanish Basics',
          description: 'Key vocabulary words and phrases',
          cards: [
            { front: 'Hello', back: 'Hola' },
            { front: 'Thank you', back: 'Gracias' },
            { front: 'Goodbye', back: 'Adiós' },
            { front: 'Please', back: 'Por favor' }
          ]
        },
        {
          id: 'deck-2',
          name: 'Computer Science Concepts',
          description: 'Basic architecture and theory definitions',
          cards: [
            { front: 'CPU', back: 'Central Processing Unit - The brain of the computer.' },
            { front: 'RAM', back: 'Random Access Memory - Temporary fast storage.' },
            { front: 'Binary', back: 'Base-2 numeral system representing data using 0 and 1.' }
          ]
        }
      ];
      saveDecks();
    }
  }

  function saveDecks() {
    localStorage.setItem('studyflow_decks', JSON.stringify(decks));
  }

  function setupEventListeners() {
    // Open Deck creation modal
    document.getElementById('open-create-deck-modal').addEventListener('click', () => {
      document.getElementById('create-deck-modal').classList.remove('hidden');
    });

    // Close Deck creation modal
    const closeModal = () => {
      document.getElementById('create-deck-modal').classList.add('hidden');
      document.getElementById('create-deck-form').reset();
    };
    document.getElementById('close-deck-modal-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-deck-modal-btn').addEventListener('click', closeModal);

    // Create Deck Form Submit
    document.getElementById('create-deck-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('deck-name').value.trim();
      const desc = document.getElementById('deck-description').value.trim();

      const newDeck = {
        id: 'deck-' + Date.now(),
        name,
        description: desc || 'No description provided.',
        cards: []
      };

      decks.push(newDeck);
      saveDecks();
      renderDecks();
      closeModal();
    });

    // Flip Card Click Action
    const flipWrapper = document.querySelector('.card-flip-wrapper');
    flipWrapper.addEventListener('click', toggleCardFlip);
    document.getElementById('study-flip-btn').addEventListener('click', toggleCardFlip);

    // Study Rating buttons
    document.querySelectorAll('#rating-controls button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        handleCardRating(e.currentTarget.dataset.grade);
      });
    });

    // Navigation back buttons
    document.getElementById('study-back-btn').addEventListener('click', showDecksHome);
    document.getElementById('manage-back-btn').addEventListener('click', showDecksHome);

    // Card creation form (inside manage view)
    document.getElementById('add-card-form').addEventListener('submit', (e) => {
      e.preventDefault();
      addNewCardToDeck();
    });
  }

  function renderDecks() {
    const container = document.getElementById('decks-container');
    container.innerHTML = '';

    if (decks.length === 0) {
      container.innerHTML = '<p class="empty-state">No decks created yet. Add one to get started!</p>';
      return;
    }

    decks.forEach(deck => {
      const card = document.createElement('div');
      card.className = 'deck-card';
      card.innerHTML = `
        <div>
          <div class="deck-title">${escapeHTML(deck.name)}</div>
          <div class="deck-desc">${escapeHTML(deck.description)}</div>
        </div>
        <div class="deck-footer">
          <span class="deck-stats">${deck.cards.length} cards</span>
          <div class="deck-actions">
            <button class="btn btn-secondary btn-small btn-manage" data-id="${deck.id}">
              <i data-lucide="edit-3" style="width:12px;height:12px"></i> Edit
            </button>
            <button class="btn btn-primary btn-small btn-study" data-id="${deck.id}">
              <i data-lucide="play" style="width:12px;height:12px"></i> Study
            </button>
            <button class="btn-delete-deck" data-id="${deck.id}" title="Delete Deck">
              <i data-lucide="trash-2" style="width:16px;height:16px"></i>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.btn-manage').addEventListener('click', () => openManageDeck(deck.id));
      card.querySelector('.btn-study').addEventListener('click', () => startStudySession(deck.id));
      card.querySelector('.btn-delete-deck').addEventListener('click', () => deleteDeck(deck.id));

      container.appendChild(card);
    });

    lucide.createIcons();
  }

  function deleteDeck(id) {
    if (confirm('Are you sure you want to delete this deck?')) {
      decks = decks.filter(d => d.id !== id);
      saveDecks();
      renderDecks();
    }
  }

  // --- STUDY SYSTEM ---
  function startStudySession(deckId) {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    if (deck.cards.length === 0) {
      alert('This deck has no cards! Add cards first.');
      openManageDeck(deckId);
      return;
    }

    currentDeckId = deckId;
    studySessionCards = [...deck.cards]; // clone cards
    currentStudyIndex = 0;

    document.getElementById('study-deck-title').innerText = deck.name;
    document.getElementById('flashcards-home').classList.add('hidden');
    document.getElementById('flashcards-study').classList.remove('hidden');

    showCard(0);
  }

  function showCard(index) {
    // Reset flip state
    document.getElementById('study-flip-card').classList.remove('flipped');
    document.getElementById('rating-controls').classList.add('hidden');
    document.getElementById('study-flip-btn').classList.remove('hidden');

    const card = studySessionCards[index];
    document.getElementById('study-front-text').innerText = card.front;
    document.getElementById('study-back-text').innerText = card.back;

    // Progress
    const total = studySessionCards.length;
    document.getElementById('study-progress-counter').innerText = `Card ${index + 1} of ${total}`;
    document.getElementById('study-progress-bar').style.width = `${((index + 1) / total) * 100}%`;
  }

  function toggleCardFlip() {
    const innerCard = document.getElementById('study-flip-card');
    innerCard.classList.toggle('flipped');

    const isFlipped = innerCard.classList.contains('flipped');
    if (isFlipped) {
      document.getElementById('rating-controls').classList.remove('hidden');
      document.getElementById('study-flip-btn').classList.add('hidden');
    } else {
      document.getElementById('rating-controls').classList.add('hidden');
      document.getElementById('study-flip-btn').classList.remove('hidden');
    }
  }

  function handleCardRating(grade) {
    // Simulate Spaced Repetition / Flow
    if (grade === 'hard') {
      // Put card at the end of the session to ask again
      const currentCard = studySessionCards[currentStudyIndex];
      studySessionCards.push(currentCard);
    }

    currentStudyIndex++;

    if (currentStudyIndex < studySessionCards.length) {
      showCard(currentStudyIndex);
    } else {
      alert('Deck study session completed! Great job!');
      showDecksHome();
    }
  }

  function showDecksHome() {
    document.getElementById('flashcards-study').classList.add('hidden');
    document.getElementById('flashcards-manage').classList.add('hidden');
    document.getElementById('flashcards-home').classList.remove('hidden');
    renderDecks();
  }

  // --- MANAGE DECKS SYSTEM ---
  function openManageDeck(deckId) {
    currentDeckId = deckId;
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return;

    document.getElementById('manage-deck-title').innerText = `Manage Deck: ${deck.name}`;
    document.getElementById('flashcards-home').classList.add('hidden');
    document.getElementById('flashcards-manage').classList.remove('hidden');

    renderManageCards();
  }

  function renderManageCards() {
    const deck = decks.find(d => d.id === currentDeckId);
    if (!deck) return;

    document.getElementById('manage-cards-count').innerText = deck.cards.length;
    const container = document.getElementById('manage-cards-list');
    container.innerHTML = '';

    if (deck.cards.length === 0) {
      container.innerHTML = '<p class="empty-state">No cards in this deck yet.</p>';
      return;
    }

    deck.cards.forEach((card, index) => {
      const row = document.createElement('div');
      row.className = 'card-row-item';
      row.innerHTML = `
        <div class="card-row-details">
          <div class="card-row-front">${escapeHTML(card.front)}</div>
          <div class="card-row-back">${escapeHTML(card.back)}</div>
        </div>
        <button class="btn-delete-task btn-delete-card" data-index="${index}">
          <i data-lucide="trash-2" style="width:16px;height:16px"></i>
        </button>
      `;

      row.querySelector('.btn-delete-card').addEventListener('click', () => deleteCard(index));
      container.appendChild(row);
    });

    lucide.createIcons();
  }

  function addNewCardToDeck() {
    const deck = decks.find(d => d.id === currentDeckId);
    if (!deck) return;

    const frontInput = document.getElementById('card-front');
    const backInput = document.getElementById('card-back');

    const newCard = {
      front: frontInput.value.trim(),
      back: backInput.value.trim()
    };

    deck.cards.push(newCard);
    saveDecks();
    renderManageCards();

    // Reset inputs
    frontInput.value = '';
    backInput.value = '';
    frontInput.focus();
  }

  function deleteCard(index) {
    const deck = decks.find(d => d.id === currentDeckId);
    if (!deck) return;

    deck.cards.splice(index, 1);
    saveDecks();
    renderManageCards();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  window.StudyFlowFlashcards = {
    init,
    getDecksCount: () => decks.length
  };
})();
