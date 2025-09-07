// Game Scene - Main quiz gameplay
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        this.currentQuestion = null;
        this.currentOptions = [];
        this.selectedAnswer = null;
        this.isAnswerLocked = false;
        this.score = 0;
        this.streak = 0;
        this.timeRemaining = 0;
        this.timer = null;
        this.lifelines = { ...GameConfig.config.LIFELINES };
        
        // UI elements
        this.questionText = null;
        this.optionButtons = [];
        this.timerText = null;
        this.scoreText = null;
        this.progressText = null;
        this.lifelineButtons = [];
    }
    
    create() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, config.COLORS.BACKGROUND);
        
        // Create UI elements
        this.createHeader();
        this.createQuestionArea();
        this.createAnswerOptions();
        this.createLifelines();
        this.createFooter();
        
        // Start first question
        this.loadNextQuestion();
        
        // Create background effects
        this.createGameEffects();
    }
    
    createHeader() {
        const { width } = this.scale;
        const config = GameConfig.config;
        
        // Progress and score bar
        const headerBg = this.add.rectangle(width / 2, 50, width * 0.95, 80, 0x1a1a2e, 0.8);
        headerBg.setStrokeStyle(2, config.COLORS.PRIMARY);
        
        // Progress
        this.progressText = this.add.text(width * 0.1, 35, '', {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        });
        
        // Score
        this.scoreText = this.add.text(width * 0.5, 35, 'Score: 0', {
            fontSize: '18px',
            fontFamily: 'Orbitron, monospace',
            fill: config.COLORS.GOLD.toString(16)
        }).setOrigin(0.5, 0);
        
        // Timer
        this.timerText = this.add.text(width * 0.9, 35, '', {
            fontSize: '20px',
            fontFamily: 'Orbitron, monospace',
            fill: '#ffffff'
        }).setOrigin(1, 0);
        
        // Difficulty indicator
        this.difficultyText = this.add.text(width * 0.1, 60, '', {
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        });
    }
    
    createQuestionArea() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Question background
        const questionBg = this.add.rectangle(width / 2, height * 0.25, width * 0.9, 120, 0x2a2a3e, 0.9);
        questionBg.setStrokeStyle(2, config.COLORS.PRIMARY);
        
        // Question text
        this.questionText = this.add.text(width / 2, height * 0.25, '', {
            fontSize: '22px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.8 }
        }).setOrigin(0.5);
        
        // Question number indicator
        this.questionNumberText = this.add.text(width * 0.06, height * 0.19, '', {
            fontSize: '16px',
            fontFamily: 'Orbitron, monospace',
            fill: config.COLORS.GOLD.toString(16)
        });
    }
    
    createAnswerOptions() {
        const { width, height } = this.scale;
        
        // Create 4 answer buttons in a 2x2 grid
        const startY = height * 0.45;
        const spacing = 120;
        const buttonWidth = width * 0.4;
        const buttonHeight = 80;
        
        const positions = [
            { x: width * 0.25, y: startY, label: 'A' },
            { x: width * 0.75, y: startY, label: 'B' },
            { x: width * 0.25, y: startY + spacing, label: 'C' },
            { x: width * 0.75, y: startY + spacing, label: 'D' }
        ];
        
        this.optionButtons = positions.map((pos, index) => {
            const button = this.createAnswerButton(pos.x, pos.y, buttonWidth, buttonHeight, pos.label, index);
            return button;
        });
    }
    
    createAnswerButton(x, y, width, height, label, index) {
        const config = GameConfig.config;
        const container = this.add.container(x, y);
        
        // Button background
        const bg = this.add.rectangle(0, 0, width, height, 0x3a3a4e, 0.8);
        bg.setStrokeStyle(2, config.COLORS.SECONDARY);
        
        // Label (A, B, C, D)
        const labelText = this.add.text(-width * 0.4, 0, label, {
            fontSize: '24px',
            fontFamily: 'Orbitron, monospace',
            fill: config.COLORS.WARNING.toString(16)
        }).setOrigin(0.5);
        
        // Answer text
        const answerText = this.add.text(0, 0, '', {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5);
        
        container.add([bg, labelText, answerText]);
        
        // Make interactive
        bg.setInteractive({ useHandCursor: true });
        
        // Store references
        container.bg = bg;
        container.labelText = labelText;
        container.answerText = answerText;
        container.index = index;
        container.originalColor = 0x3a3a4e;
        
        // Hover effects
        bg.on('pointerover', () => {
            if (!this.isAnswerLocked && !container.isEliminated) {
                bg.setFillStyle(config.COLORS.PRIMARY, 0.6);
                container.setScale(1.02);
            }
        });
        
        bg.on('pointerout', () => {
            if (!this.isAnswerLocked && this.selectedAnswer !== index && !container.isEliminated) {
                bg.setFillStyle(container.originalColor, 0.8);
                container.setScale(1.0);
            }
        });
        
        bg.on('pointerdown', () => {
            if (!this.isAnswerLocked && !container.isEliminated) {
                this.selectAnswer(index);
            }
        });
        
        return container;
    }
    
    createLifelines() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        const lifelineY = height * 0.75;
        const lifelineSpacing = 120;
        const startX = width / 2 - lifelineSpacing;
        
        const lifelines = [
            { key: 'FIFTY_FIFTY', label: '50:50', color: config.COLORS.WARNING },
            { key: 'SKIP_QUESTION', label: 'Skip', color: config.COLORS.PRIMARY },
            { key: 'ASK_AUDIENCE', label: 'Audience', color: config.COLORS.SUCCESS }
        ];
        
        this.lifelineButtons = lifelines.map((lifeline, index) => {
            const x = startX + (index * lifelineSpacing);
            const button = this.createLifelineButton(x, lifelineY, lifeline);
            return button;
        });
    }
    
    createLifelineButton(x, y, lifeline) {
        const container = this.add.container(x, y);
        
        // Button background
        const bg = this.add.circle(0, 0, 30, lifeline.color, 0.8);
        bg.setStrokeStyle(2, 0xffffff);
        
        // Label
        const label = this.add.text(0, 0, lifeline.label, {
            fontSize: '12px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Uses indicator
        const uses = this.lifelines[lifeline.key].uses;
        const usesText = this.add.text(0, 25, `x${uses}`, {
            fontSize: '10px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        container.add([bg, label, usesText]);
        
        // Store references
        container.bg = bg;
        container.label = label;
        container.usesText = usesText;
        container.lifelineKey = lifeline.key;
        container.originalColor = lifeline.color;
        
        // Make interactive
        bg.setInteractive({ useHandCursor: true });
        
        bg.on('pointerover', () => {
            if (this.lifelines[lifeline.key].uses > 0) {
                bg.setFillStyle(lifeline.color);
                container.setScale(1.1);
            }
        });
        
        bg.on('pointerout', () => {
            if (this.lifelines[lifeline.key].uses > 0) {
                bg.setFillStyle(lifeline.color, 0.8);
                container.setScale(1.0);
            }
        });
        
        bg.on('pointerdown', () => {
            if (this.lifelines[lifeline.key].uses > 0 && !this.isAnswerLocked) {
                this.useLifeline(lifeline.key);
            }
        });
        
        this.updateLifelineButton(container);
        
        return container;
    }
    
    createFooter() {
        const { width, height } = this.scale;
        
        // Menu button
        const menuButton = this.add.text(width * 0.05, height * 0.95, '← Menu', {
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0, 1);
        
        menuButton.setInteractive({ useHandCursor: true });
        menuButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Quit button
        const quitButton = this.add.text(width * 0.95, height * 0.95, 'Quit Game →', {
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(1, 1);
        
        quitButton.setInteractive({ useHandCursor: true });
        quitButton.on('pointerdown', () => {
            this.endGame(false);
        });
    }
    
    createGameEffects() {
        const { width, height } = this.scale;
        
        // Spotlight effect
        const spotlight = this.add.circle(width / 2, height * 0.25, 200, 0xffffff, 0.05);
        
        this.tweens.add({
            targets: spotlight,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.1,
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    loadNextQuestion() {
        if (!window.questionManager || !window.questionManager.hasMoreQuestions()) {
            this.endGame(true);
            return;
        }
        
        this.currentQuestion = window.questionManager.getCurrentQuestion();
        this.currentOptions = window.questionManager.getCurrentQuestionOptions();
        
        if (!this.currentQuestion) {
            this.endGame(false);
            return;
        }
        
        // Reset state
        this.selectedAnswer = null;
        this.isAnswerLocked = false;
        this.timeRemaining = GameConfig.config.TIMER_DURATION;
        
        // Update UI
        this.updateQuestionDisplay();
        this.updateProgressDisplay();
        this.resetAnswerButtons();
        this.startTimer();
        
        // Play question reveal sound
        if (window.audioManager) {
            window.audioManager.playSFX('question_reveal');
            
            // Speak question if TTS is enabled
            setTimeout(() => {
                window.audioManager.speak(this.currentQuestion.question);
            }, 500);
        }
        
        // Animate question appearance
        this.animateQuestionReveal();
    }
    
    updateQuestionDisplay() {
        const progress = window.questionManager.getProgress();
        
        this.questionText.setText(this.currentQuestion.question);
        this.questionNumberText.setText(`Question ${progress.current}/${progress.total}`);
        this.difficultyText.setText(`Difficulty: ${this.currentQuestion.difficulty.toUpperCase()}`);
        
        // Update answer options
        this.optionButtons.forEach((button, index) => {
            if (index < this.currentOptions.length) {
                button.answerText.setText(this.currentOptions[index]);
                button.setVisible(true);
            } else {
                button.setVisible(false);
            }
        });
    }
    
    updateProgressDisplay() {
        const progress = window.questionManager.getProgress();
        this.progressText.setText(`Progress: ${progress.current}/${progress.total}`);
        this.scoreText.setText(`Score: ${this.score}`);
    }
    
    resetAnswerButtons() {
        this.optionButtons.forEach((button) => {
            button.bg.setFillStyle(button.originalColor, 0.8);
            button.bg.setStrokeStyle(2, GameConfig.config.COLORS.SECONDARY);
            button.setScale(1.0);
            button.isEliminated = false;
            button.setAlpha(1.0);
        });
    }
    
    startTimer() {
        if (this.timer) {
            this.timer.destroy();
        }
        
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            repeat: GameConfig.config.TIMER_DURATION - 1
        });
        
        this.updateTimerDisplay();
    }
    
    updateTimer() {
        this.timeRemaining--;
        this.updateTimerDisplay();
        
        // Warning sounds
        if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
            if (window.audioManager) {
                window.audioManager.playSFX('timer_warning');
            }
        }
        
        // Time's up
        if (this.timeRemaining <= 0) {
            this.timeUp();
        }
    }
    
    updateTimerDisplay() {
        const config = GameConfig.config;
        let color = '#ffffff';
        
        if (this.timeRemaining <= 5) {
            color = '#ff4444';
        } else if (this.timeRemaining <= 10) {
            color = '#ffaa00';
        }
        
        this.timerText.setText(`${this.timeRemaining}s`);
        this.timerText.setFill(color);
        
        // Pulse effect when time is low
        if (this.timeRemaining <= 5) {
            this.tweens.add({
                targets: this.timerText,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true
            });
        }
    }
    
    animateQuestionReveal() {
        // Animate question text
        this.questionText.setAlpha(0);
        this.tweens.add({
            targets: this.questionText,
            alpha: 1,
            duration: GameConfig.config.ANIMATIONS.QUESTION_REVEAL,
            ease: 'Power2'
        });
        
        // Animate answer buttons
        this.optionButtons.forEach((button, index) => {
            button.setAlpha(0);
            button.setScale(0.8);
            
            this.tweens.add({
                targets: button,
                alpha: 1,
                scaleX: 1,
                scaleY: 1,
                duration: 600,
                delay: index * 150,
                ease: 'Back.easeOut'
            });
        });
    }
    
    selectAnswer(answerIndex) {
        if (this.isAnswerLocked) return;
        
        this.selectedAnswer = answerIndex;
        const selectedButton = this.optionButtons[answerIndex];
        
        // Visual feedback
        selectedButton.bg.setFillStyle(GameConfig.config.COLORS.WARNING, 0.8);
        selectedButton.setScale(1.05);
        
        // Play sound
        if (window.audioManager) {
            window.audioManager.playSFX('answer_select');
        }
        
        // Auto-submit after short delay or require confirmation
        this.time.delayedCall(1000, () => {
            this.lockAnswer();
        });
    }
    
    lockAnswer() {
        if (this.selectedAnswer === null) return;
        
        this.isAnswerLocked = true;
        
        // Stop timer
        if (this.timer) {
            this.timer.destroy();
        }
        
        // Check if answer is correct
        const selectedAnswerText = this.currentOptions[this.selectedAnswer];
        const isCorrect = window.questionManager.isCorrectAnswer(selectedAnswerText);
        
        this.showAnswerResult(isCorrect);
    }
    
    showAnswerResult(isCorrect) {
        const config = GameConfig.config;
        const selectedButton = this.optionButtons[this.selectedAnswer];
        
        // Find correct answer button
        const correctAnswerText = this.currentQuestion.correctAnswer;
        const correctAnswerIndex = this.currentOptions.indexOf(correctAnswerText);
        const correctButton = this.optionButtons[correctAnswerIndex];
        
        if (isCorrect) {
            // Correct answer
            selectedButton.bg.setFillStyle(config.COLORS.SUCCESS);
            this.updateScore(true);
            
            if (window.audioManager) {
                window.audioManager.playSFX('correct_answer');
                window.audioManager.speak('Correct!');
            }
            
            this.streak++;
        } else {
            // Wrong answer
            selectedButton.bg.setFillStyle(config.COLORS.DANGER);
            correctButton.bg.setFillStyle(config.COLORS.SUCCESS);
            
            if (window.audioManager) {
                window.audioManager.playSFX('wrong_answer');
                window.audioManager.speak('Incorrect. The correct answer is ' + correctAnswerText);
            }
            
            this.streak = 0;
            
            // Shake wrong answer
            this.tweens.add({
                targets: selectedButton,
                x: selectedButton.x + 10,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }
        
        // Highlight correct answer
        this.tweens.add({
            targets: correctButton,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: GameConfig.config.ANIMATIONS.RESULT_REVEAL,
            yoyo: true
        });
        
        // Continue to next question after delay
        this.time.delayedCall(3000, () => {
            if (isCorrect || this.currentQuestion.questionNumber < 5) {
                // Continue if correct or if early in the game
                window.questionManager.getNextQuestion();
                this.loadNextQuestion();
            } else {
                // Game over on wrong answer (later in game)
                this.endGame(false);
            }
        });
    }
    
    updateScore(isCorrect) {
        if (!isCorrect) return;
        
        const difficulty = this.currentQuestion.difficulty;
        const hasStreak = this.streak > 1;
        const points = GameConfig.getPointsForQuestion(difficulty, hasStreak);
        
        this.score += points;
        this.updateProgressDisplay();
        
        // Animate score increase
        const scoreIncrease = this.add.text(this.scoreText.x, this.scoreText.y - 30, `+${points}`, {
            fontSize: '16px',
            fontFamily: 'Orbitron, monospace',
            fill: GameConfig.config.COLORS.SUCCESS.toString(16)
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: scoreIncrease,
            y: scoreIncrease.y - 50,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                scoreIncrease.destroy();
            }
        });
    }
    
    useLifeline(lifelineKey) {
        if (this.lifelines[lifelineKey].uses <= 0) return;
        
        this.lifelines[lifelineKey].uses--;
        
        if (window.audioManager) {
            window.audioManager.playSFX('lifeline_use');
        }
        
        switch (lifelineKey) {
            case 'FIFTY_FIFTY':
                this.useFiftyFifty();
                break;
            case 'SKIP_QUESTION':
                this.skipQuestion();
                break;
            case 'ASK_AUDIENCE':
                this.askAudience();
                break;
        }
        
        this.updateLifelineButtons();
    }
    
    useFiftyFifty() {
        const correctAnswer = this.currentQuestion.correctAnswer;
        const incorrectAnswers = this.currentOptions.filter(option => option !== correctAnswer);
        
        // Randomly select 2 incorrect answers to eliminate
        const toEliminate = Phaser.Utils.Array.Shuffle(incorrectAnswers).slice(0, 2);
        
        this.optionButtons.forEach((button, index) => {
            const optionText = this.currentOptions[index];
            if (toEliminate.includes(optionText)) {
                button.isEliminated = true;
                button.setAlpha(0.3);
                button.bg.setFillStyle(0x555555);
            }
        });
    }
    
    skipQuestion() {
        // Move to next question without penalty
        window.questionManager.getNextQuestion();
        this.loadNextQuestion();
    }
    
    askAudience() {
        // Simulate audience response
        const correctAnswer = this.currentQuestion.correctAnswer;
        const correctIndex = this.currentOptions.indexOf(correctAnswer);
        
        // Generate audience percentages (weighted toward correct answer)
        const percentages = [0, 0, 0, 0];
        let remaining = 100;
        
        // Correct answer gets 40-70%
        percentages[correctIndex] = Phaser.Math.Between(40, 70);
        remaining -= percentages[correctIndex];
        
        // Distribute remaining among other options
        for (let i = 0; i < 4; i++) {
            if (i !== correctIndex && remaining > 0) {
                const amount = Phaser.Math.Between(0, remaining);
                percentages[i] = amount;
                remaining -= amount;
            }
        }
        
        // Add any remainder to a random option
        if (remaining > 0) {
            const randomIndex = Phaser.Math.Between(0, 3);
            percentages[randomIndex] += remaining;
        }
        
        this.showAudienceResults(percentages);
    }
    
    showAudienceResults(percentages) {
        const { width, height } = this.scale;
        
        // Create audience results overlay
        const overlay = this.add.container(width / 2, height / 2);
        
        const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
        bg.setStrokeStyle(2, GameConfig.config.COLORS.PRIMARY);
        
        const title = this.add.text(0, -120, 'Audience Says:', {
            fontSize: '24px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Show percentages
        const labels = ['A', 'B', 'C', 'D'];
        labels.forEach((label, index) => {
            const y = -60 + (index * 30);
            const percentage = percentages[index] || 0;
            
            this.add.text(-150, y, `${label}: ${percentage}%`, {
                fontSize: '18px',
                fontFamily: 'Roboto, sans-serif',
                fill: '#ffffff'
            });
            
            // Bar visualization
            const barWidth = (percentage / 100) * 200;
            this.add.rectangle(-50 + barWidth / 2, y, barWidth, 20, GameConfig.config.COLORS.PRIMARY);
        });
        
        overlay.add([bg, title]);
        overlay.setDepth(200);
        
        // Auto-close after 4 seconds
        this.time.delayedCall(4000, () => {
            overlay.destroy();
        });
    }
    
    updateLifelineButtons() {
        this.lifelineButtons.forEach(button => {
            this.updateLifelineButton(button);
        });
    }
    
    updateLifelineButton(button) {
        const uses = this.lifelines[button.lifelineKey].uses;
        button.usesText.setText(`x${uses}`);
        
        if (uses <= 0) {
            button.setAlpha(0.3);
            button.bg.setFillStyle(0x555555);
        }
    }
    
    timeUp() {
        if (this.isAnswerLocked) return;
        
        // Treat as wrong answer
        this.isAnswerLocked = true;
        
        if (window.audioManager) {
            window.audioManager.playSFX('timer_warning');
            window.audioManager.speak('Time is up!');
        }
        
        // Show correct answer
        const correctAnswerText = this.currentQuestion.correctAnswer;
        const correctAnswerIndex = this.currentOptions.indexOf(correctAnswerText);
        const correctButton = this.optionButtons[correctAnswerIndex];
        
        correctButton.bg.setFillStyle(GameConfig.config.COLORS.SUCCESS);
        
        this.streak = 0;
        
        // Continue after delay
        this.time.delayedCall(3000, () => {
            if (this.currentQuestion.questionNumber < 5) {
                // Continue if early in the game
                window.questionManager.getNextQuestion();
                this.loadNextQuestion();
            } else {
                // Game over on time up (later in game)
                this.endGame(false);
            }
        });
    }
    
    endGame(isVictory) {
        // Stop timer
        if (this.timer) {
            this.timer.destroy();
        }
        
        // Stop all audio
        if (window.audioManager) {
            window.audioManager.stopAll();
            
            if (isVictory) {
                window.audioManager.playSFX('victory');
                window.audioManager.speak('Congratulations! You completed the quiz!');
            } else {
                window.audioManager.playSFX('game_over');
                window.audioManager.speak('Game over!');
            }
        }
        
        // Pass game data to game over scene
        this.scene.start('GameOverScene', {
            score: this.score,
            isVictory: isVictory,
            questionsAnswered: window.questionManager.getProgress().current - 1,
            totalQuestions: window.questionManager.getProgress().total
        });
    }
}
