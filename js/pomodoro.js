// Pomodoro Timer Module
(function () {
  let timerInterval = null;
  let workDuration = 25 * 60;
  let shortBreakDuration = 5 * 60;
  let longBreakDuration = 15 * 60;

  let currentDuration = workDuration;
  let timeLeft = workDuration;
  let currentMode = 'work'; // 'work', 'short', 'long'
  let isRunning = false;
  let totalFocusMinutes = parseInt(localStorage.getItem('studyflow_focus_mins') || '0');

  // Web Audio Context for Sound Generation
  let audioCtx = null;
  let activeSoundNode = null;
  let activeGainNode = null;
  let currentSoundName = null;

  function init() {
    loadSettings();
    updateDisplay();
    setupEventListeners();
  }

  function loadSettings() {
    const cfgWork = document.getElementById('cfg-work');
    const cfgShort = document.getElementById('cfg-short');
    const cfgLong = document.getElementById('cfg-long');

    const savedWork = localStorage.getItem('studyflow_cfg_work');
    const savedShort = localStorage.getItem('studyflow_cfg_short');
    const savedLong = localStorage.getItem('studyflow_cfg_long');

    if (savedWork) cfgWork.value = savedWork;
    if (savedShort) cfgShort.value = savedShort;
    if (savedLong) cfgLong.value = savedLong;

    workDuration = parseInt(cfgWork.value) * 60;
    shortBreakDuration = parseInt(cfgShort.value) * 60;
    longBreakDuration = parseInt(cfgLong.value) * 60;

    resetTimer();
  }

  function saveSettings() {
    const cfgWork = document.getElementById('cfg-work');
    const cfgShort = document.getElementById('cfg-short');
    const cfgLong = document.getElementById('cfg-long');

    localStorage.setItem('studyflow_cfg_work', cfgWork.value);
    localStorage.setItem('studyflow_cfg_short', cfgShort.value);
    localStorage.setItem('studyflow_cfg_long', cfgLong.value);

    workDuration = parseInt(cfgWork.value) * 60;
    shortBreakDuration = parseInt(cfgShort.value) * 60;
    longBreakDuration = parseInt(cfgLong.value) * 60;

    resetTimer();
  }

  function setupEventListeners() {
    document.getElementById('timer-play-pause').addEventListener('click', toggleTimer);
    document.getElementById('timer-reset').addEventListener('click', resetTimer);
    document.getElementById('timer-skip').addEventListener('click', skipMode);
    document.getElementById('apply-timer-settings').addEventListener('click', () => {
      saveSettings();
      alert('Timer settings applied!');
    });

    // Presets
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        setMode(e.target.dataset.mode);
      });
    });

    // Sounds
    document.querySelectorAll('.btn-sound').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const soundType = e.currentTarget.dataset.sound;
        toggleSound(soundType, e.currentTarget);
      });
    });

    document.getElementById('ambient-volume').addEventListener('input', (e) => {
      if (activeGainNode) {
        activeGainNode.gain.setValueAtTime(e.target.value, audioCtx.currentTime);
      }
    });
  }

  function setMode(mode) {
    currentMode = mode;
    if (mode === 'work') {
      currentDuration = workDuration;
      document.getElementById('timer-mode-label').innerText = 'FOCUS SESSION';
      document.getElementById('timer-progress-bar').style.stroke = 'var(--accent-purple)';
    } else if (mode === 'short') {
      currentDuration = shortBreakDuration;
      document.getElementById('timer-mode-label').innerText = 'SHORT BREAK';
      document.getElementById('timer-progress-bar').style.stroke = 'var(--accent-teal)';
    } else if (mode === 'long') {
      currentDuration = longBreakDuration;
      document.getElementById('timer-mode-label').innerText = 'LONG BREAK';
      document.getElementById('timer-progress-bar').style.stroke = 'var(--accent-orange)';
    }
    timeLeft = currentDuration;
    pauseTimer();
    updateDisplay();
  }

  function toggleTimer() {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      document.getElementById('play-pause-icon').setAttribute('data-lucide', 'pause');
      lucide.createIcons();
      timerInterval = setInterval(() => {
        timeLeft--;
        if (currentMode === 'work' && (currentDuration - timeLeft) % 60 === 0 && (currentDuration - timeLeft) > 0) {
          totalFocusMinutes++;
          localStorage.setItem('studyflow_focus_mins', totalFocusMinutes.toString());
          if (window.StudyFlowApp && window.StudyFlowApp.updateStats) {
            window.StudyFlowApp.updateStats();
          }
        }
        updateDisplay();
        if (timeLeft <= 0) {
          timerFinished();
        }
      }, 1000);
    }
  }

  function pauseTimer() {
    isRunning = false;
    document.getElementById('play-pause-icon').setAttribute('data-lucide', 'play');
    lucide.createIcons();
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }

  function resetTimer() {
    pauseTimer();
    timeLeft = currentDuration;
    updateDisplay();
  }

  function skipMode() {
    if (currentMode === 'work') {
      setMode('short');
    } else if (currentMode === 'short') {
      setMode('long');
    } else {
      setMode('work');
    }
  }

  function timerFinished() {
    pauseTimer();
    playCompletionSound();
    alert(currentMode === 'work' ? 'Focus session completed! Take a break.' : 'Break is over! Time to focus.');
    skipMode();
  }

  function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    document.getElementById('timer-time-display').innerText = timeStr;

    // Progress circle (dasharray: 553, dashoffset = 553 * (1 - pct))
    const pct = timeLeft / currentDuration;
    const offset = 553 * (1 - pct);
    document.getElementById('timer-progress-bar').style.strokeDashoffset = offset;
  }

  // Synthesis of soundscapes using Web Audio API
  function initAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function toggleSound(soundName, buttonEl) {
    initAudioCtx();

    if (currentSoundName === soundName) {
      // Toggle off
      stopSound();
      buttonEl.classList.remove('active');
    } else {
      // Stop current
      stopSound();
      document.querySelectorAll('.btn-sound').forEach(b => b.classList.remove('active'));

      // Play new
      currentSoundName = soundName;
      buttonEl.classList.add('active');
      playSound(soundName);
    }
  }

  function stopSound() {
    if (activeSoundNode) {
      try { activeSoundNode.stop(); } catch(e) {}
      activeSoundNode = null;
    }
    currentSoundName = null;
  }

  function playSound(name) {
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoiseNode = audioCtx.createBufferSource();
    whiteNoiseNode.buffer = noiseBuffer;
    whiteNoiseNode.loop = true;

    activeGainNode = audioCtx.createGain();
    const volumeVal = parseFloat(document.getElementById('ambient-volume').value);
    activeGainNode.gain.setValueAtTime(volumeVal, audioCtx.currentTime);

    // Apply Filter based on sound type
    const filter = audioCtx.createBiquadFilter();

    if (name === 'noise') {
      // Direct white noise
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(8000, audioCtx.currentTime);
      whiteNoiseNode.connect(filter);
      filter.connect(activeGainNode);
    } else if (name === 'rain') {
      // Soft rainfall (pinkish filter + crackling nodes)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

      whiteNoiseNode.connect(filter);
      filter.connect(activeGainNode);

      // Add a slight crackle/volume modulation
      const mod = audioCtx.createOscillator();
      mod.type = 'sine';
      mod.frequency.value = 5.0; // Hz
      const modGain = audioCtx.createGain();
      modGain.gain.value = 0.15;
      mod.connect(modGain);
      modGain.connect(activeGainNode.gain);
      mod.start();
    } else if (name === 'waves') {
      // Ocean wave modulation
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);

      whiteNoiseNode.connect(filter);
      filter.connect(activeGainNode);

      // Low frequency oscillator (LFO) for wave rise and fall (approx 0.12Hz)
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(activeGainNode.gain);
      lfo.start();
    } else if (name === 'cafe') {
      // Low rumble + soft bell noises
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, audioCtx.currentTime);
      whiteNoiseNode.connect(filter);
      filter.connect(activeGainNode);

      // Add random soft cafe chatter clatters
      const chatterTimer = setInterval(() => {
        if (currentSoundName !== 'cafe') {
          clearInterval(chatterTimer);
          return;
        }
        playSoftClink();
      }, 4000);
    }

    activeGainNode.connect(audioCtx.destination);
    whiteNoiseNode.start();
    activeSoundNode = whiteNoiseNode;
  }

  function playSoftClink() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    // Random high frequencies for cups/plates clinking
    osc.frequency.setValueAtTime(1500 + Math.random() * 2000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
  }

  function playCompletionSound() {
    initAudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
    osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
    osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45); // C6
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.9);
  }

  window.StudyFlowPomodoro = {
    init,
    playCompletionSound
  };
})();
