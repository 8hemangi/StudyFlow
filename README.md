# 📚 StudyFlow — Ultimate Study Planner & Productivity Suite

> **StudyMentor** is a premium, fully client-side Single Page Application (SPA) built with **HTML5, Vanilla CSS, and JavaScript** — no build tools, no frameworks, no backend required. All data is persisted locally in your browser's `localStorage`.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No dependencies](https://img.shields.io/badge/Dependencies-None-green.svg)](#)

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Live clock, daily quotes, stats overview, task & alarm previews |
| ✅ **Study Planner** | Priority-tagged to-do list with categories and due dates |
| ⏱️ **Pomodoro Timer** | Circular SVG countdown with 3 modes + Web Audio API ambient sounds |
| 🃏 **Flashcards** | Deck-based 3D flip cards with spaced repetition self-assessment |
| 🧠 **Quiz Maker** | Create and play custom 10+ question multiple-choice quizzes |
| 🔔 **Reminders** | Custom alarm scheduler with synthesized beep alerts |

---

## 🗂️ Project Structure

```
studyflow/
├── index.html          # Main SPA shell — sidebar, views, modals
├── style.css           # Design system — CSS variables, glassmorphism, animations
├── app.js              # Core orchestrator — navigation, clock, stats, theme
└── js/
    ├── pomodoro.js     # Timer logic + Web Audio API soundscapes
    ├── planner.js      # Task CRUD + filter logic
    ├── flashcards.js   # Deck management + 3D card flip study sessions
    ├── quizzes.js      # Quiz builder + interactive play + scoring
    └── reminders.js    # Alarm scheduling + triggered notification system
```

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    A["index.html (SPA Shell)"] --> B["style.css (Design System)"]
    A --> C["app.js (Core Orchestrator)"]
    C --> D["pomodoro.js"]
    C --> E["planner.js"]
    C --> F["flashcards.js"]
    C --> G["quizzes.js"]
    C --> H["reminders.js"]
    
    C --> I["localStorage (Persistence)"]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    style A fill:#7c3aed,color:#fff
    style C fill:#0d9488,color:#fff
    style I fill:#f97316,color:#fff
```

---

## 🔄 Application Navigation Flow

```mermaid
flowchart TD
    START([User Opens App]) --> INIT["app.js → init()"]
    INIT --> LOAD["Load all Modules\n(Pomodoro, Planner, Flashcards, Quizzes, Reminders)"]
    LOAD --> DASH["Dashboard View"]
    DASH --> NAV{Sidebar Navigation Click}
    
    NAV --> PLAN["📋 Planner View"]
    NAV --> POMO["⏱️ Pomodoro View"]
    NAV --> FLASH["🃏 Flashcards View"]
    NAV --> QUIZ["🧠 Quizzes View"]
    NAV --> REM["🔔 Reminders View"]
    
    PLAN --> DASH
    POMO --> DASH
    FLASH --> DASH
    QUIZ --> DASH
    REM --> DASH
    
    style START fill:#8b5cf6,color:#fff
    style DASH fill:#0d9488,color:#fff
```

---

## ⏱️ Pomodoro Timer Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as "Timer UI"
    participant JS as "pomodoro.js"
    participant Audio as "Web Audio API"

    User->>UI: Click "Focus" preset
    UI->>JS: setMode('work'), duration = 25min
    User->>UI: Click ▶ Play
    JS->>JS: setInterval (1s tick)
    JS->>UI: Update SVG strokeDashOffset
    JS->>UI: Update countdown display

    opt Ambient Sound
        User->>UI: Click "Rain" button
        UI->>JS: toggleSound('rain')
        JS->>Audio: createBufferSource() + BiquadFilter
        Audio-->>User: Synthesized rain audio
    end

    JS->>JS: timeLeft = 0 → timerFinished()
    JS->>Audio: playCompletionSound() (C5→E5→G5→C6 arpeggio)
    JS->>UI: alert + auto-skip to next mode
```

---

## ✅ Task Planner Workflow

```mermaid
flowchart LR
    ADD["User fills Task Form\n(Title, Subject, Priority, Due Date)"] --> SAVE["planner.js → addTask()"]
    SAVE --> LS["localStorage.setItem\n'studyflow_tasks'"]
    LS --> RENDER["renderTasks()"]
    RENDER --> FILTER{Filter Tab Active}
    FILTER -->|All| ALL["Show all tasks"]
    FILTER -->|Pending| PEND["Show uncompleted tasks"]
    FILTER -->|Completed| COMP["Show completed tasks"]
    
    RENDER --> SORT["Sort by Priority\nHigh → Medium → Low"]
    SORT --> DISPLAY["Task Cards with Tags\n(Subject, Priority, Due Date)"]
    DISPLAY --> TOGGLE["Click Checkbox → toggle completed"]
    DISPLAY --> DELETE["Click Trash → delete task"]
    TOGGLE --> LS
    DELETE --> LS
```

---

## 🃏 Flashcard System Workflow

```mermaid
stateDiagram-v2
    [*] --> DecksHome : Open Flashcards Tab
    DecksHome --> ManageDeck : Click "Edit"
    DecksHome --> StudySession : Click "Study"
    DecksHome --> CreateDeck : Click "New Deck"

    ManageDeck --> AddCard : Fill front/back form
    AddCard --> ManageDeck : Card saved to deck
    ManageDeck --> DecksHome : Click "Back"

    StudySession --> CardFront : Show question side
    CardFront --> CardBack : Click card / Flip button
    CardBack --> RatingEasy : Click "Easy"
    CardBack --> RatingGood : Click "Good"
    CardBack --> RatingHard : Click "Hard"

    RatingEasy --> NextCard : Advance index
    RatingGood --> NextCard
    RatingHard --> AppendCard : Re-append card to session end

    NextCard --> CardFront : More cards remain
    AppendCard --> NextCard
    NextCard --> SessionComplete : No more cards
    SessionComplete --> DecksHome : Congratulation → back
```

---

## 🧠 Quiz Maker & Play Workflow

```mermaid
flowchart TD
    HOME["Quizzes Home"] --> CREATE["Click 'Create Quiz'"]
    HOME --> PLAY["Click 'Start Quiz'"]
    
    CREATE --> META["Fill Quiz Name + Subject"]
    META --> BUILDER["Question Builder Form\n(Question + 4 Options + Correct Answer)"]
    BUILDER --> ADDQ["Click 'Add Question to Quiz'"]
    ADDQ --> PREVIEW["Preview Panel Updates"]
    PREVIEW --> ADDQ
    PREVIEW --> SAVE["Click 'Save Quiz'"]
    SAVE --> PERSIST["localStorage.setItem\n'studyflow_quizzes'"]
    PERSIST --> HOME

    PLAY --> Q1["Show Question 1\nRender 4 option buttons"]
    Q1 --> SELECT["User selects an option"]
    SELECT --> VALIDATE{"Correct?"}
    VALIDATE -->|Yes| GREEN["Highlight green ✅\nScore++"]
    VALIDATE -->|No| RED["Highlight red ❌\nReveal correct answer"]
    GREEN --> NEXT["Click Next Question"]
    RED --> NEXT
    NEXT --> Q1
    NEXT --> SUMMARY["Score Summary Screen\n(X / Total, % Score)"]
    SUMMARY --> RETRY["Retry Quiz"]
    SUMMARY --> HOME
```

---

## 🔔 Reminder System Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as "Reminders UI"
    participant JS as "reminders.js"
    participant Timer as "setInterval (5s)"
    participant Audio as "Web Audio API"

    User->>UI: Fill label + time, click "Set Alarm"
    UI->>JS: addReminder()
    JS->>JS: Push to reminders[]
    JS->>JS: localStorage.save()
    JS->>UI: renderReminders()

    loop Every 5 Seconds
        Timer->>JS: Check current HH:MM vs each alarm time
        JS->>JS: If match and not triggered → triggerAlarm()
        JS->>UI: Show alarm overlay with label
        JS->>Audio: Synthesize repeating 880Hz beep
        Audio-->>User: Audio alert fires
        User->>UI: Click "Dismiss"
        UI->>JS: hideOverlay(), mark alarm.triggered = true
    end
```

---

## 🎨 Design System

The app uses a **CSS custom properties design system** with full dark/light mode support:

```css
:root {
  --accent-purple:  #8b5cf6; /* Primary CTA, active nav */
  --accent-teal:    #14b8a6; /* Success, ambient sounds */
  --accent-orange:  #f97316; /* Long break, warnings */
  --accent-red:     #ef4444; /* Danger actions, errors */
  --bg-glass:       rgba(25, 28, 44, 0.45); /* Card backgrounds */
  --border-glass:   rgba(255, 255, 255, 0.07); /* Glassmorphism border */
}
```

### Component Hierarchy

```mermaid
graph LR
    APP["App Container"] --> SIDEBAR["Sidebar\n(Nav + Brand + Theme Toggle)"]
    APP --> MAIN["Main Content"]
    MAIN --> HEADER["Top Header\n(Title + Clock)"]
    MAIN --> VIEWS["View Panels"]
    VIEWS --> V1["Dashboard"]
    VIEWS --> V2["Planner"]
    VIEWS --> V3["Pomodoro"]
    VIEWS --> V4["Flashcards"]
    VIEWS --> V5["Quizzes"]
    VIEWS --> V6["Reminders"]
    APP --> MODALS["Modal Overlays\n(Create Deck, Alarm Alert)"]
```

---

## 🔊 Web Audio API Soundscapes

The Pomodoro module generates **4 synthetic ambient soundscapes** using the Web Audio API — no audio files needed, works 100% offline:

| Sound | Technique |
|---|---|
| 🌧️ **Rain** | Bandpass-filtered white noise + 5Hz LFO volume modulation |
| 🌊 **White Noise** | Lowpass-filtered white noise buffer at 8kHz |
| 🌊 **Ocean Waves** | Lowpass noise + ultra-slow 0.12Hz sine LFO (rise/fall) |
| ☕ **Cafe Buzz** | Low-frequency rumble + random synthetic clinking sounds every 4s |

---

## 💾 Data Persistence Model

All data is stored in `localStorage` under the following keys:

| Key | Module | Content |
|---|---|---|
| `studyflow_tasks` | Planner | Array of task objects |
| `studyflow_decks` | Flashcards | Array of deck objects with nested cards |
| `studyflow_quizzes` | Quizzes | Array of quiz objects with nested questions |
| `studyflow_reminders` | Reminders | Array of reminder objects |
| `studyflow_focus_mins` | Pomodoro | Total focus minutes logged |
| `studyflow_quizzes_taken` | Quizzes | Count of quiz sessions played |
| `studyflow_theme` | App | `'dark'` or `'light'` |
| `studyflow_cfg_work` | Pomodoro | Focus duration (minutes) |
| `studyflow_cfg_short` | Pomodoro | Short break duration |
| `studyflow_cfg_long` | Pomodoro | Long break duration |

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- No Node.js, no npm, no build step required!

### Run Locally
```bash
# Clone the repository
git clone https://github.com/hemangi8/studymentor.git

# Navigate to the folder
cd studymentor

# Open index.html in your browser
# Windows:
start index.html

# macOS:
open index.html

# Linux:
xdg-open index.html
```

That's it! The app runs completely in the browser with no server needed.

---

## 📖 User Guide

### 1. Dashboard
- View your **Focus Time**, **Tasks Completed**, and **Quizzes Taken** at a glance.
- See your top pending tasks and upcoming alarms.
- Toggle **Dark / Light Mode** from the sidebar footer.

### 2. Study Planner (To-Do)
- Fill in the task form (title, subject, priority, due date) and click **Add Task**.
- Use the filter tabs — **All / Pending / Completed** — to sort your list.
- Click the **checkbox** to mark tasks done, the **trash icon** to delete.
- Use **Clear Completed** to bulk-remove done tasks.

### 3. Pomodoro Timer
- Choose a preset: **Focus (25 min)**, **Short Break (5 min)**, or **Long Break (15 min)**.
- Customize durations in the **Timer Configuration** panel on the right.
- Click a sound button to start an ambient soundscape, adjust volume with the slider.
- Press ▶ to start, ⏸ to pause, ↺ to reset, ⏭ to skip modes.

### 4. Flashcards
- Click **New Deck** to create a flashcard deck.
- Open a deck with **Edit** to add front/back card pairs.
- Click **Study** to enter the flipping session.
  - Click the card or the **Flip Card** button to reveal the answer.
  - Rate yourself: **Hard** (re-added to session), **Good**, or **Easy**.

### 5. Quiz Maker
- Click **Create Quiz**, enter a name and subject.
- Build questions: type the question, fill 4 options, select the correct one.
- Click **Add Question to Quiz** for each question (build as many as you want).
- Click **Save Quiz** when done.
- Back on the home screen, click **Start Quiz** to play.
- Select answers and use **Next Question** to progress.
- View your score and percentage on the **Summary Screen**.

### 6. Reminders
- Enter an alarm label and time (HH:MM format).
- Click **Set Alarm**. The app checks every 5 seconds.
- When an alarm fires, an animated overlay appears with a repeating audio alert.
- Click **Dismiss Alarm** to close it.

---

## 🛠️ Technology Stack

| Technology | Usage |
|---|---|
| **HTML5** | Semantic structure, modals, forms |
| **CSS3** | Glassmorphism, CSS Variables, Keyframes, Grid/Flexbox |
| **Vanilla JavaScript** | Module pattern (IIFE), DOM manipulation, event handling |
| **Web Audio API** | Synthetic ambient sounds, alarm beeps, completion chimes |
| **localStorage API** | Client-side data persistence |
| **Lucide Icons** | Icon library (CDN) |
| **Google Fonts** | Inter + Outfit typefaces |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👩‍💻 Author

**Hemangi Patil**  
📧 hemangipatil9423@gmail.com  
🐙 [@hemangi8](https://github.com/hemangi8)

---

> *Built with ❤️ as a premium study productivity tool. No frameworks. No dependencies. Just pure web fundamentals.*
