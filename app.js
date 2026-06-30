// StudyFlow Core Application Orchestrator
(function () {
  const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Your talent determines what you can do. Your motivation determines how much you are willing to do.", author: "Lou Holtz" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
  ];

  function init() {
    setupTheme();
    setupNavigation();
    setupClock();
    setupQuotes();

    // Initialize all sub-modules
    if (window.StudyFlowPomodoro) window.StudyFlowPomodoro.init();
    if (window.StudyFlowPlanner) window.StudyFlowPlanner.init();
    if (window.StudyFlowFlashcards) window.StudyFlowFlashcards.init();
    if (window.StudyFlowQuizzes) window.StudyFlowQuizzes.init();
    if (window.StudyFlowReminders) window.StudyFlowReminders.init();

    updateStats();
    updateDashboardPeeks();

    // Re-render icons on startup
    lucide.createIcons();
  }

  // --- THEME MANAGEMENT ---
  function setupTheme() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('studyflow_theme') || 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleUI(savedTheme);

    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('studyflow_theme', newTheme);
      updateThemeToggleUI(newTheme);
    });
  }

  function updateThemeToggleUI(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (theme === 'light') {
      btn.innerHTML = `<i data-lucide="sun"></i><span>Light Mode</span>`;
    } else {
      btn.innerHTML = `<i data-lucide="moon"></i><span>Dark Mode</span>`;
    }
    lucide.createIcons();
  }

  // --- TAB NAVIGATION ---
  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewPanels = document.querySelectorAll('.view-panel');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.dataset.tab;

        // Update active class on nav
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update active class on views
        viewPanels.forEach(panel => {
          panel.classList.remove('active');
          if (panel.id === `view-${targetTab}`) {
            panel.classList.add('active');
          }
        });

        // Set Page Title in Header
        const titleText = item.querySelector('span').innerText;
        document.getElementById('page-title').innerText = titleText;
        
        // Custom header subtitles
        const subtitles = {
          dashboard: "Welcome back! Ready to excel today?",
          planner: "Organize your study path and goals.",
          pomodoro: "Maximize concentration using structured break patterns.",
          flashcards: "Reinforce terminology using interactive retrieval.",
          quizzes: "Verify your readiness with customizable tests.",
          reminders: "Control your alerts and plan study slots."
        };
        document.getElementById('page-subtitle').innerText = subtitles[targetTab] || '';

        // If switching to dashboard, reload widgets
        if (targetTab === 'dashboard') {
          updateStats();
          updateDashboardPeeks();
        }
      });
    });
  }

  // --- DYNAMIC CLOCK WIDGET ---
  function setupClock() {
    const timeEl = document.getElementById('header-time');
    const dateEl = document.getElementById('header-date');

    const updateClock = () => {
      const now = new Date();
      timeEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      dateEl.innerText = now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    };

    updateClock();
    setInterval(updateClock, 30000); // Update clock every 30 seconds
  }

  // --- RANDOM MOTIVATIONAL QUOTE ---
  function setupQuotes() {
    const randomIdx = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIdx];
    document.getElementById('motivational-quote').innerText = `"${quote.text}"`;
    document.getElementById('motivational-author').innerText = `- ${quote.author}`;
  }

  // --- STATISTICS CALCULATOR ---
  function updateStats() {
    // 1. Focus Time
    const focusMins = localStorage.getItem('studyflow_focus_mins') || '0';
    document.getElementById('dash-focus-time').innerText = `${focusMins}m`;

    // 2. Tasks Completed
    if (window.StudyFlowPlanner) {
      const tasks = window.StudyFlowPlanner.getTasks();
      const completed = tasks.filter(t => t.completed).length;
      document.getElementById('dash-tasks-done').innerText = `${completed} / ${tasks.length}`;
    }

    // 3. Quizzes Taken
    const quizzesTaken = localStorage.getItem('studyflow_quizzes_taken') || '0';
    document.getElementById('dash-quizzes-taken').innerText = quizzesTaken;
  }

  // --- DASHBOARD WIDGETS RENDERING ---
  function updateDashboardPeeks() {
    // Render Today's Top Tasks Peek
    const taskContainer = document.getElementById('dash-task-list');
    taskContainer.innerHTML = '';

    if (window.StudyFlowPlanner) {
      const tasks = window.StudyFlowPlanner.getTasks();
      const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3); // Get first 3 pending

      if (pendingTasks.length === 0) {
        taskContainer.innerHTML = '<p class="empty-state">No pending tasks for today!</p>';
      } else {
        pendingTasks.forEach(task => {
          const item = document.createElement('div');
          item.className = 'peek-item';
          item.innerHTML = `
            <span style="font-weight: 500;">${escapeHTML(task.title)}</span>
            <span class="task-tag priority-${task.priority}" style="font-size:10px;">${task.priority.toUpperCase()}</span>
          `;
          taskContainer.appendChild(item);
        });
      }
    }

    // Render Active Alarms Peek
    const reminderContainer = document.getElementById('dash-reminder-list');
    reminderContainer.innerHTML = '';

    if (window.StudyFlowReminders) {
      const alarms = window.StudyFlowReminders.getReminders().slice(0, 3); // Top 3 alarms

      if (alarms.length === 0) {
        reminderContainer.innerHTML = '<p class="empty-state">No upcoming alarms scheduled.</p>';
      } else {
        alarms.forEach(alarm => {
          const item = document.createElement('div');
          item.className = 'peek-item';
          item.innerHTML = `
            <span style="font-weight: 500;">${escapeHTML(alarm.label)}</span>
            <span style="font-size: 12px; color: var(--text-muted);">${formatTime12h(alarm.time)}</span>
          `;
          reminderContainer.appendChild(item);
        });
      }
    }
  }

  function formatTime12h(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${minutes} ${ampm}`;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Handle load event
  window.addEventListener('DOMContentLoaded', init);

  // Expose global app controller
  window.StudyFlowApp = {
    updateStats,
    updateDashboardPeeks
  };
})();
