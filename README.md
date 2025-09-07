# QuizFlow - Millionaire Style Quiz Game

A browser-based quiz game inspired by **Who Wants to Be a Millionaire** built with **HTML5 + Phaser 3**. Features immersive audio (TTS in Hindi & English + SFX), robust question bank, and flashy millionaire-style UI/animations.

## 🎯 Features

### Core Gameplay
- **15 Progressive Questions**: Easy → Medium → Hard difficulty progression
- **Millionaire-Style Interface**: Flashy UI with animations and effects
- **Multiple Choice Questions**: 4 options per question with single correct answer
- **Timer System**: 30 seconds per question with visual warnings
- **Scoring System**: Points based on difficulty with streak bonuses

### Lifelines
- **50:50**: Remove 2 incorrect answers (1 use)
- **Skip Question**: Skip current question without penalty (2 uses)  
- **Ask Audience**: Show simulated audience vote percentages (1 use)

### Audio Features
- **Text-to-Speech**: Questions read aloud in Hindi or English
- **Sound Effects**: Interactive UI sounds and feedback
- **Language Toggle**: Switch between English and Hindi TTS
- **Audio Controls**: Mute/unmute and language switching

### Question Database
- **335+ Questions** across 9 categories
- **3 Difficulty Levels**: Easy, Medium, Hard
- **Deduplication**: Hash-based system prevents repeats
- **Categories**: Animals, Art, Entertainment, General Knowledge, Mathematics, Mythology, Politics, Science, Sports

## 🚀 Quick Start

### Running Locally

1. **Clone or download** this project
2. **Start a local server** (required for loading JSON data):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: Navigate to `http://localhost:8000/`

## 🎮 How to Play

1. **Start Game**: Click "Start New Game" from the main menu
2. **Answer Questions**: Select from 4 multiple choice options
3. **Use Lifelines**: Click lifeline buttons when needed
4. **Beat the Clock**: Answer within 30 seconds per question
5. **Progress Through Levels**: Complete all 15 questions to win!

### Scoring
- **Easy Questions**: 100 points
- **Medium Questions**: 200 points  
- **Hard Questions**: 300 points
- **Streak Bonus**: 1.5x multiplier for consecutive correct answers

### Controls
- **Mouse/Touch**: Click/tap to select answers and navigate
- **Keyboard Shortcuts**:
  - `M` - Toggle mute/unmute
  - `L` - Switch language (English/Hindi)
  - `ESC` - Return to menu
  - `Space` - (reserved for future use)

## 🎵 Audio System

### Text-to-Speech (TTS)
- **Languages**: English (US), Hindi (India)
- **Features**: Question reading, result announcements
- **Fallback**: Silent mode if TTS unavailable

### Sound Effects
- Question reveal, answer selection, correct/incorrect feedback
- Timer warnings, lifeline usage, victory/game over sounds
- Generated using Web Audio API (no external files needed)

## 🔧 Customization

### Adding Questions
1. Create JSON files in `/data/` following the naming pattern: `category_difficulty.json`
2. Follow the question data format specified above
3. Questions are automatically loaded on game start

### Modifying Game Rules
Edit values in `src/utils/GameConfig.js`:
- Question count per session
- Timer duration
- Point values
- Lifeline usage limits

### Styling Changes
Modify `styles.css` for visual customization:
- Colors and themes
- Fonts and typography  
- Animations and effects
- Responsive breakpoints

## 🐛 Debugging

### Console Commands
Use `QuizFlowDebug` object in browser console:
```javascript
// Get game statistics
QuizFlowDebug.getStats()

// Test audio
QuizFlowDebug.speakTest("Hello World")
QuizFlowDebug.playSFX("correct_answer")

// Game control
QuizFlowDebug.restart()
QuizFlowDebug.pause()
QuizFlowDebug.resume()
```

### Common Issues
1. **Questions not loading**: Ensure you're running a local server (not file://)
2. **No audio**: Check browser permissions and audio settings
3. **Mobile issues**: Ensure HTTPS for production deployment
4. **Performance**: Clear browser cache if game feels slow

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions welcome! Please feel free to:
- Add more questions to the database
- Improve UI/UX design
- Fix bugs or add features
- Translate to additional languages

## 📞 Support

For questions or issues:
1. Check the debugging section above
2. Review browser console for error messages
3. Ensure you're running a local server for development

---

**Enjoy playing QuizFlow!** 🎯🏆
