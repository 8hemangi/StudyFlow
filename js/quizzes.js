// Quiz Maker & Interactive Gameplay Module
(function () {
  let quizzes = [];
  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let score = 0;
  let userSelectedOption = null;

  // Builder state
  let builderQuestions = [];

  function init() {
    loadQuizzes();
    setupEventListeners();
    renderQuizzes();
  }

  function loadQuizzes() {
    const stored = localStorage.getItem('studyflow_quizzes');
    if (stored) {
      quizzes = JSON.parse(stored);
    } else {
      // Seed initial quizzes
      quizzes = [
        {
          id: 'quiz-1',
          name: 'General Science Quiz',
          subject: 'Science',
          questions: [
            {
              question: 'Which planet is known as the Red Planet?',
              options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
              correct: 1
            },
            {
              question: 'What is the chemical symbol for Water?',
              options: ['H2O', 'CO2', 'O2', 'NaCl'],
              correct: 0
            },
            {
              question: 'Which gas do plants absorb during photosynthesis?',
              options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'],
              correct: 2
            },
            {
              question: 'What is the powerhouse of the cell?',
              options: ['Nucleus', 'Ribosome', 'Chloroplast', 'Mitochondria'],
              correct: 3
            },
            {
              question: 'What is the closest star to Earth?',
              options: ['Proxima Centauri', 'The Sun', 'Sirius', 'Betelgeuse'],
              correct: 1
            },
            {
              question: 'What is the hardest natural substance on Earth?',
              options: ['Gold', 'Iron', 'Diamond', 'Quartz'],
              correct: 2
            },
            {
              question: 'How many bones are in an adult human body?',
              options: ['206', '208', '210', '300'],
              correct: 0
            },
            {
              question: 'What is the speed of light?',
              options: ['150,000 km/s', '299,792 km/s', '1,080 km/s', '3,000 km/s'],
              correct: 1
            },
            {
              question: 'Which element has the atomic number 1?',
              options: ['Hydrogen', 'Helium', 'Oxygen', 'Carbon'],
              correct: 0
            },
            {
              question: 'Which is the largest mammal on Earth?',
              options: ['Elephant', 'Giraffe', 'Blue Whale', 'Megalodon'],
              correct: 2
            }
          ]
        }
      ];
      saveQuizzes();
    }
  }

  function saveQuizzes() {
    localStorage.setItem('studyflow_quizzes', JSON.stringify(quizzes));
  }

  function setupEventListeners() {
    // Navigate to Quiz builder
    document.getElementById('open-create-quiz-view').addEventListener('click', () => {
      builderQuestions = [];
      document.getElementById('quiz-name').value = '';
      document.getElementById('quiz-subject').value = '';
      document.getElementById('quizzes-home').classList.add('hidden');
      document.getElementById('quiz-builder').classList.remove('hidden');
      renderBuilderPreview();
    });

    document.getElementById('builder-back-btn').addEventListener('click', showQuizzesHome);

    // Question builder subform: Add question to temp list
    document.getElementById('btn-add-q-to-list').addEventListener('click', addQuestionToBuilder);

    // Save entire quiz
    document.getElementById('btn-save-entire-quiz').addEventListener('click', saveEntireQuiz);

    // Quiz gameplay controls
    document.getElementById('quiz-quit-btn').addEventListener('click', () => {
      if (confirm('Are you sure you want to quit this quiz? Progress will be lost.')) {
        showQuizzesHome();
      }
    });

    document.getElementById('play-next-btn').addEventListener('click', nextQuestion);

    // Summary buttons
    document.getElementById('summary-retry-btn').addEventListener('click', () => {
      startQuizSession(currentQuiz.id);
    });
    document.getElementById('summary-close-btn').addEventListener('click', showQuizzesHome);
  }

  function renderQuizzes() {
    const container = document.getElementById('quizzes-container');
    container.innerHTML = '';

    if (quizzes.length === 0) {
      container.innerHTML = '<p class="empty-state">No custom quizzes created yet. Make one above!</p>';
      return;
    }

    quizzes.forEach(quiz => {
      const card = document.createElement('div');
      card.className = 'quiz-card';
      card.innerHTML = `
        <div class="quiz-title">${escapeHTML(quiz.name)}</div>
        <div class="quiz-desc">Subject: ${escapeHTML(quiz.subject || 'General')} | ${quiz.questions.length} Questions</div>
        <div class="quiz-footer">
          <button class="btn btn-primary btn-block btn-start-quiz" data-id="${quiz.id}">
            <i data-lucide="play" style="width:14px;height:14px"></i> Start Quiz
          </button>
          <button class="btn-delete-quiz" data-id="${quiz.id}" title="Delete Quiz" style="margin-left: 12px;">
            <i data-lucide="trash-2" style="width:18px;height:18px"></i>
          </button>
        </div>
      `;

      card.querySelector('.btn-start-quiz').addEventListener('click', () => startQuizSession(quiz.id));
      card.querySelector('.btn-delete-quiz').addEventListener('click', () => deleteQuiz(quiz.id));

      container.appendChild(card);
    });

    lucide.createIcons();
  }

  function deleteQuiz(id) {
    if (confirm('Are you sure you want to delete this quiz?')) {
      quizzes = quizzes.filter(q => q.id !== id);
      saveQuizzes();
      renderQuizzes();
      if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
        window.StudyFlowApp.updateStats();
      }
    }
  }

  function showQuizzesHome() {
    document.getElementById('quiz-builder').classList.add('hidden');
    document.getElementById('quiz-gameplay').classList.add('hidden');
    document.getElementById('quiz-summary').classList.add('hidden');
    document.getElementById('quizzes-home').classList.remove('hidden');
    renderQuizzes();
  }

  // --- BUILDER LOGIC ---
  function addQuestionToBuilder() {
    const qText = document.getElementById('q-text').value.trim();
    const optA = document.getElementById('q-opt-a').value.trim();
    const optB = document.getElementById('q-opt-b').value.trim();
    const optC = document.getElementById('q-opt-c').value.trim();
    const optD = document.getElementById('q-opt-d').value.trim();
    const correctIdx = parseInt(document.getElementById('q-correct').value);

    if (!qText || !optA || !optB || !optC || !optD) {
      alert('Please fill out the question and all 4 options.');
      return;
    }

    const newQ = {
      question: qText,
      options: [optA, optB, optC, optD],
      correct: correctIdx
    };

    builderQuestions.push(newQ);
    renderBuilderPreview();

    // Clear question fields only
    document.getElementById('q-text').value = '';
    document.getElementById('q-opt-a').value = '';
    document.getElementById('q-opt-b').value = '';
    document.getElementById('q-opt-c').value = '';
    document.getElementById('q-opt-d').value = '';
    document.getElementById('q-correct').value = '0';
  }

  function renderBuilderPreview() {
    document.getElementById('builder-q-count').innerText = builderQuestions.length;
    const container = document.getElementById('builder-questions-preview');
    container.innerHTML = '';

    if (builderQuestions.length === 0) {
      container.innerHTML = '<p class="empty-state">No questions added to this quiz yet.</p>';
      return;
    }

    builderQuestions.forEach((q, qIndex) => {
      const item = document.createElement('div');
      item.className = 'preview-question-item';
      item.innerHTML = `
        <div class="preview-question-title">${qIndex + 1}. ${escapeHTML(q.question)}</div>
        <div class="preview-options-grid">
          <div class="preview-option ${q.correct === 0 ? 'correct' : ''}">A: ${escapeHTML(q.options[0])}</div>
          <div class="preview-option ${q.correct === 1 ? 'correct' : ''}">B: ${escapeHTML(q.options[1])}</div>
          <div class="preview-option ${q.correct === 2 ? 'correct' : ''}">C: ${escapeHTML(q.options[2])}</div>
          <div class="preview-option ${q.correct === 3 ? 'correct' : ''}">D: ${escapeHTML(q.options[3])}</div>
        </div>
        <button class="btn-remove-q" data-index="${qIndex}"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>
      `;

      item.querySelector('.btn-remove-q').addEventListener('click', () => {
        builderQuestions.splice(qIndex, 1);
        renderBuilderPreview();
      });

      container.appendChild(item);
    });

    lucide.createIcons();
  }

  function saveEntireQuiz() {
    const quizName = document.getElementById('quiz-name').value.trim();
    const quizSubject = document.getElementById('quiz-subject').value.trim() || 'General';

    if (!quizName) {
      alert('Please enter a Quiz Name.');
      return;
    }

    if (builderQuestions.length === 0) {
      alert('Please add at least one question to the quiz.');
      return;
    }

    const newQuiz = {
      id: 'quiz-' + Date.now(),
      name: quizName,
      subject: quizSubject,
      questions: builderQuestions
    };

    quizzes.push(newQuiz);
    saveQuizzes();
    showQuizzesHome();

    if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
      window.StudyFlowApp.updateStats();
    }
  }

  // --- GAMEPLAY PLAY LOGIC ---
  function startQuizSession(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;

    currentQuiz = quiz;
    currentQuestionIndex = 0;
    score = 0;
    userSelectedOption = null;

    document.getElementById('play-quiz-title').innerText = quiz.name;
    document.getElementById('quizzes-home').classList.add('hidden');
    document.getElementById('quiz-summary').classList.add('hidden');
    document.getElementById('quiz-gameplay').classList.remove('hidden');

    showQuestion(0);
  }

  function showQuestion(index) {
    const q = currentQuiz.questions[index];
    document.getElementById('play-question-text').innerText = q.question;

    const total = currentQuiz.questions.length;
    document.getElementById('play-progress-counter').innerText = `Question ${index + 1} of ${total}`;
    document.getElementById('play-progress-bar').style.width = `${((index + 1) / total) * 100}%`;

    // Clear feedback
    document.getElementById('play-feedback').classList.add('hidden');
    userSelectedOption = null;

    // Render Options
    const optContainer = document.getElementById('play-options-container');
    optContainer.innerHTML = '';

    q.options.forEach((opt, optIndex) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerText = opt;
      btn.addEventListener('click', () => selectOption(optIndex, btn));
      optContainer.appendChild(btn);
    });
  }

  function selectOption(optionIndex, buttonEl) {
    if (userSelectedOption !== null) return; // Prevent double clicking
    userSelectedOption = optionIndex;

    const q = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = optionIndex === q.correct;

    if (isCorrect) {
      score++;
      buttonEl.classList.add('selected-correct');
      document.getElementById('play-feedback-text').innerText = 'Correct!';
      document.getElementById('play-feedback-text').style.color = 'var(--accent-teal)';
    } else {
      buttonEl.classList.add('selected-incorrect');
      // Highlight the correct answer too
      const btns = document.querySelectorAll('.quiz-option-btn');
      btns[q.correct].classList.add('selected-correct');

      document.getElementById('play-feedback-text').innerText = 'Incorrect!';
      document.getElementById('play-feedback-text').style.color = 'var(--accent-red)';
    }

    document.getElementById('play-feedback').classList.remove('hidden');
  }

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
      showQuestion(currentQuestionIndex);
    } else {
      showQuizSummary();
    }
  }

  function showQuizSummary() {
    document.getElementById('quiz-gameplay').classList.add('hidden');
    document.getElementById('quiz-summary').classList.remove('hidden');

    document.getElementById('summary-quiz-name').innerText = currentQuiz.name;
    document.getElementById('summary-score').innerText = score;
    document.getElementById('summary-total').innerText = currentQuiz.questions.length;

    const percentage = Math.round((score / currentQuiz.questions.length) * 100);
    document.getElementById('summary-percentage').innerText = `${percentage}% Score`;

    // Track total quizzes taken
    let totalTaken = parseInt(localStorage.getItem('studyflow_quizzes_taken') || '0');
    totalTaken++;
    localStorage.setItem('studyflow_quizzes_taken', totalTaken.toString());

    if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
      window.StudyFlowApp.updateStats();
    }
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  window.StudyFlowQuizzes = {
    init,
    getQuizzesCount: () => quizzes.length
  };
})();
