# 📄 Requirements Document  
## Quiz Game – *Millionaire Style* (HTML + Phaser 3)

---

## 🎯 Project Overview
A browser-based quiz game inspired by **Who Wants to Be a Millionaire** built with **HTML + Phaser 3**.  
Focus: flashy UI/animations, immersive audio (TTS in Hindi & English + SFX), robust question bank (target ≈5,000 unique questions) sourced from OpenTDB and other sources, with fallback generation for Indian context when needed.

---

## ✅ Goals
- Create an engaging single-player quiz with Millionaire-style progression and effects.  
- Ensure dynamic, randomized, non-repeating sessions.  
- Build a reusable question ingestion pipeline to collect, deduplicate and store questions in JSON files by category & difficulty.  
- Provide audio TTS (Hindi & English) + SFX for UI events.  
- Ship MVP quickly and expand to 5k questions.

---

## 🏗 Tech Stack
- **Game engine:** Phaser 3 (v3.x)  
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)  
- **Storage:** JSON files (static data folder) for questions  
- **TTS options:** Browser Web Speech API (free) for Hindi & English  
- **Hosting:** GitHub Pages / Netlify / Vercel for front-end; Render / Fly / Heroku for backend if needed  

---

## 📂 Question Data Model
Each question object MUST contain these fields:

<pre><code>{
  "id": "68bcb56d14b5fd2b035e70e8",
  "question": "How many legs do butterflies have?",
  "correctAnswer": "6",
  "incorrectAnswers": ["2", "4", "0"],
  "broadCategory": "Animals",
  "subCategory": "Insects",
  "difficulty": "easy",
  "type": "multiple",
  "questionHash": "3bf14c6a8b06e9a384a05513ffb18587ae6b9efdf76a627f8b1d9b2dc295d2ee"
}
</code></pre>

**Notes:**  
- `id`: UUID or unique string  
- `question`: normalized string  
- `questionHash`: SHA-256 hash of question + answer (for dedupe)  
- `type`: `"multiple"` or `"boolean"`  
- Optional: `source`, `sourceUrl`, `year`, `language`  

---

## 📌 File Naming & Directory Layout
- data folder is already present with required data(questions)
- **File naming:** `<broadCategory>_<difficulty>.json`  
  - Example: `Animals_easy.json`, `History_hard.json`
- there is also a _consolidated_summary.json and _updated_summary.json which contains summaries for these jsons.

- **Directory structure:**
```plaintext
/project-root
  /public
    index.html
    /assets
      /audio
      /sfx
      /images
  /data
    Animals_easy.json
    Animals_medium.json
    History_hard.json
  /src
    /scenes
    /ui
    game.js
  ingest.js
  README.md
```


## 🔁 Session & Randomization
- Generate N questions per session (e.g., 15)  
- No repeats within a session (track `questionHash`)  
- Global dedupe across dataset  
- Shuffle with RNG  
- Progressive difficulty (easy → medium → hard)  

---

## 🔍 Data Acquisition (this is static and generated one time)
### Primary source
- [Open Trivia DB](https://opentdb.com/api.php)  

### Additional sources
- QuizAPI.io  
- The Trivia API  
- Wikidata / Wikipedia facts (use it and generate) 
- Curated public datasets  
- Indian GK (curated by copilot LLM)  

### Fallback
- Generate via LLM (history, geography, politics, Bollywood, cricket, current affairs and other categories we have)  
- Auto-validate + manual spot-check  

---

## 🛠 Data Ingestion Pipeline
1. Fetch from APIs  
2. Normalize text (HTML decode, trim, punctuation)  
3. Canonicalize answers  
4. Compute hash (SHA-256)  
5. Deduplicate  
6. Validate (at least 4 valid options)  
7. Enrich (category, difficulty)  
8. Store as JSON by `<category>_<difficulty>`  

---

## 🎲 Game Rules & Features
- Millionaire-style flow: start → Q&A → lock answer → feedback → next  
- Scoring: points per correct answer, elimination on wrong answer  
- Bonus for streaks  
- Game over screen with summary  

---

## 🔊 Audio & Speech
- **Text-to-Speech:** Hindi & English (Web Speech API or cloud TTS)  
- **Effects:** suspense for new question, success for correct, buzzer for wrong  
- **Background music:** optional toggle  

---

## 🚀 Phase-Wise Roadmap
### Phase 1 – Core MVP
- Phaser 3 project setup  
- Fetch & display questions  
- Randomization + no repeats  
- Basic scoring & game over  

### Phase 2 – Millionaire Theme
- UI styling (flashy effects, spotlight)  
- Question ladder (easy → hard)  
- Lifelines (50:50, skip, ask audience)  
- Timer per question  

### Phase 3 – Audio & Language
- Add Hindi/English TTS (window.speechSynthesis) 
- Sync question display with audio  
- Add SFX & background music  

### Phase 4 – Data Expansion
- Grow dataset to 5k questions  
- Add Indian GK (history, geography, polity, cricket, Bollywood)  
- Deduplicate with hashes  

### Phase 5 – Enhancements
- Multiplayer challenge  
- Leaderboards & profiles  
- Daily challenges  
- Adaptive difficulty  
- Offline mode (preloaded JSON)  

---
