// Study Planner / To-Do List Module
(function () {
  let tasks = [];
  let currentFilter = 'all';

  function init() {
    loadTasks();
    setupEventListeners();
    renderTasks();
  }

  function loadTasks() {
    const stored = localStorage.getItem('studyflow_tasks');
    if (stored) {
      tasks = JSON.parse(stored);
    } else {
      // Seed initial tasks if empty
      tasks = [
        { id: '1', title: 'Prepare Chemistry Deck', subject: 'Chemistry', priority: 'high', due: '', completed: false },
        { id: '2', title: 'Take Math Trigonometry Quiz', subject: 'Math', priority: 'medium', due: '', completed: false }
      ];
      saveTasks();
    }
  }

  function saveTasks() {
    localStorage.setItem('studyflow_tasks', JSON.stringify(tasks));
    if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
      window.StudyFlowApp.updateStats();
    }
  }

  function setupEventListeners() {
    const form = document.getElementById('add-task-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addTask();
    });

    document.getElementById('clear-completed-btn').addEventListener('click', clearCompleted);

    // Filters
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        renderTasks();
      });
    });
  }

  function addTask() {
    const titleInput = document.getElementById('task-title');
    const subjectInput = document.getElementById('task-subject');
    const prioritySelect = document.getElementById('task-priority');
    const dueInput = document.getElementById('task-due');

    const newTask = {
      id: Date.now().toString(),
      title: titleInput.value.trim(),
      subject: subjectInput.value.trim() || 'General',
      priority: prioritySelect.value,
      due: dueInput.value,
      completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    // Reset Form
    titleInput.value = '';
    subjectInput.value = '';
    prioritySelect.value = 'medium';
    dueInput.value = '';
  }

  function toggleTaskComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
  }

  function renderTasks() {
    const container = document.getElementById('tasks-container');
    container.innerHTML = '';

    const filtered = tasks.filter(t => {
      if (currentFilter === 'pending') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<p class="empty-state">No ${currentFilter !== 'all' ? currentFilter : ''} tasks found.</p>`;
      return;
    }

    // Sort: High priority first, then medium, then low
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    filtered.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

    filtered.forEach(task => {
      const card = document.createElement('div');
      card.className = `task-card-item ${task.completed ? 'completed' : ''}`;

      let dateString = '';
      if (task.due) {
        const dateObj = new Date(task.due);
        dateString = dateObj.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
      }

      card.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
          ${task.completed ? '<i data-lucide="check" style="width:14px;height:14px"></i>' : ''}
        </div>
        <div class="task-card-content">
          <div class="task-card-title">${escapeHTML(task.title)}</div>
          <div class="task-tags-row">
            <span class="task-tag tag-subject">${escapeHTML(task.subject)}</span>
            <span class="task-tag tag-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
            ${dateString ? `<span class="task-due-tag"><i data-lucide="clock" style="width:10px;height:10px"></i> ${dateString}</span>` : ''}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-delete-task" data-id="${task.id}">
            <i data-lucide="trash-2" style="width:16px;height:16px"></i>
          </button>
        </div>
      `;

      // Event listeners
      card.querySelector('.task-checkbox').addEventListener('click', () => toggleTaskComplete(task.id));
      card.querySelector('.btn-delete-task').addEventListener('click', () => deleteTask(task.id));

      container.appendChild(card);
    });

    lucide.createIcons();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Expose tasks and functions to other modules
  window.StudyFlowPlanner = {
    init,
    getTasks: () => tasks,
    renderTasks
  };
})();
