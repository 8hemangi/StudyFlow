// Alarms and Reminders Module
(function () {
  let reminders = [];
  let alarmCheckInterval = null;
  let isAlarmPlaying = false;

  function init() {
    loadReminders();
    setupEventListeners();
    renderReminders();
    startAlarmCheckLoop();
  }

  function loadReminders() {
    const stored = localStorage.getItem('studyflow_reminders');
    if (stored) {
      reminders = JSON.parse(stored);
    } else {
      reminders = [
        { id: 'rem-1', label: 'Evening Review Session', time: '18:00', triggered: false }
      ];
      saveReminders();
    }
  }

  function saveReminders() {
    localStorage.setItem('studyflow_reminders', JSON.stringify(reminders));
    if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
      window.StudyFlowApp.updateStats();
    }
  }

  function setupEventListeners() {
    document.getElementById('add-reminder-form').addEventListener('submit', (e) => {
      e.preventDefault();
      addReminder();
    });

    document.getElementById('alarm-dismiss-btn').addEventListener('click', dismissActiveAlarm);
  }

  function addReminder() {
    const labelInput = document.getElementById('reminder-label');
    const timeInput = document.getElementById('reminder-time');

    const newReminder = {
      id: 'rem-' + Date.now(),
      label: labelInput.value.trim(),
      time: timeInput.value,
      triggered: false
    };

    reminders.push(newReminder);
    saveReminders();
    renderReminders();

    // Reset fields
    labelInput.value = '';
    timeInput.value = '';
  }

  function deleteReminder(id) {
    reminders = reminders.filter(r => r.id !== id);
    saveReminders();
    renderReminders();
  }

  function renderReminders() {
    const container = document.getElementById('reminders-container');
    container.innerHTML = '';

    if (reminders.length === 0) {
      container.innerHTML = '<p class="empty-state">No alarms set. Schedule one above!</p>';
      return;
    }

    // Sort reminders by time
    reminders.sort((a, b) => a.time.localeCompare(b.time));

    reminders.forEach(rem => {
      const card = document.createElement('div');
      card.className = 'reminder-item';
      card.innerHTML = `
        <div class="reminder-info">
          <div class="reminder-bell-icon"><i data-lucide="bell"></i></div>
          <div>
            <div class="reminder-label-text">${escapeHTML(rem.label)}</div>
            <div class="reminder-time-text">${formatTime12h(rem.time)}</div>
          </div>
        </div>
        <button class="btn-delete-task btn-delete-reminder" data-id="${rem.id}" title="Delete Alarm">
          <i data-lucide="trash-2" style="width:16px;height:16px"></i>
        </button>
      `;

      card.querySelector('.btn-delete-reminder').addEventListener('click', () => deleteReminder(rem.id));
      container.appendChild(card);
    });

    lucide.createIcons();
  }

  function formatTime12h(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 should be 12
    return `${h}:${minutes} ${ampm}`;
  }

  // --- ALARM TICKING LOOP ---
  function startAlarmCheckLoop() {
    if (alarmCheckInterval) clearInterval(alarmCheckInterval);

    alarmCheckInterval = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const timeNow = `${currentHours}:${currentMinutes}`;

      reminders.forEach(rem => {
        // Trigger if time matches and it hasn't been triggered in this minute
        if (rem.time === timeNow && !rem.triggered) {
          triggerAlarm(rem);
        }

        // Reset the trigger flag when time passes
        if (rem.time !== timeNow && rem.triggered) {
          rem.triggered = false;
        }
      });
    }, 5000); // Check every 5 seconds
  }

  function triggerAlarm(reminder) {
    reminder.triggered = true;
    saveReminders();

    document.getElementById('trigger-alarm-title').innerText = reminder.label;
    document.getElementById('alarm-trigger-overlay').classList.remove('hidden');

    startAlarmSound();
  }

  function startAlarmSound() {
    // Generate synthetic beep alarm sequence using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      isAlarmPlaying = true;

      const playBeep = () => {
        if (!isAlarmPlaying) return; // Stop loop when dismissed

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note

        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);

        // Schedule next beep only if still playing
        setTimeout(playBeep, 800);
      };

      playBeep();
    } catch (e) {
      console.log('AudioContext error: ', e);
    }
  }

  function dismissActiveAlarm() {
    document.getElementById('alarm-trigger-overlay').classList.add('hidden');
    // Stop the sound loop by clearing the flag
    isAlarmPlaying = false;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  window.StudyFlowReminders = {
    init,
    getReminders: () => reminders
  };
})();
