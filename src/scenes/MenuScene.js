// Menu Scene - Main menu with game options
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }
    
    preload() {
        // Create simple colored rectangles as placeholders for buttons
        this.load.image('button', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }
    
    create() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, config.COLORS.BACKGROUND);
        
        // Title
        const title = this.add.text(width / 2, height * 0.2, 'QuizFlow', {
            fontSize: '72px',
            fontFamily: 'Orbitron, monospace',
            fill: '#ffffff',
            stroke: '#007bff',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Subtitle
        this.add.text(width / 2, height * 0.3, 'You can be millionaire!', {
            fontSize: '24px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        // Game statistics
        this.createStatistics();
        
        // Menu buttons
        this.createMenuButtons();
        
        // Animated background elements
        this.createBackgroundEffects();
        
        // Audio controls info
        this.add.text(width * 0.05, height * 0.05, 'Audio Controls: Top Right Corner', {
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#666666'
        });
        
        // Version info
        this.add.text(width * 0.95, height * 0.95, 'v1.0.0', {
            fontSize: '12px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#666666'
        }).setOrigin(1);
    }
    
    createStatistics() {
        if (!window.questionManager || !window.questionManager.isLoaded) {
            return;
        }
        
        const { width, height } = this.scale;
        const stats = window.questionManager.getStatistics();
        
        // Statistics panel
        const statsY = height * 0.45;
        
        this.add.text(width / 2, statsY, 'Question Bank Statistics', {
            fontSize: '20px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        const totalText = `Total Questions: ${stats.totalQuestions}`;
        this.add.text(width / 2, statsY + 35, totalText, {
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        const difficultyText = `Easy: ${stats.difficulties.easy} | Medium: ${stats.difficulties.medium} | Hard: ${stats.difficulties.hard}`;
        this.add.text(width / 2, statsY + 60, difficultyText, {
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0.5);
        
        const categoryText = `Categories: ${Object.keys(stats.categories).length}`;
        this.add.text(width / 2, statsY + 85, categoryText, {
            fontSize: '14px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc'
        }).setOrigin(0.5);
    }
    
    createMenuButtons() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        const buttonY = height * 0.65;
        const buttonSpacing = 80;
        
        // Start Game Button
        const startButton = this.createButton(width / 2, buttonY, 'Start New Game', config.COLORS.PRIMARY);
        startButton.on('pointerdown', () => {
            this.startNewGame();
        });
        
        // Instructions Button
        const instructionsButton = this.createButton(width / 2, buttonY + buttonSpacing, 'How to Play', config.COLORS.SECONDARY);
        instructionsButton.on('pointerdown', () => {
            this.showInstructions();
        });
        
        // Settings Button
        const settingsButton = this.createButton(width / 2, buttonY + buttonSpacing * 2, 'Settings', config.COLORS.WARNING);
        settingsButton.on('pointerdown', () => {
            this.showSettings();
        });
    }
    
    createButton(x, y, text, color) {
        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.rectangle(0, 0, 300, 50, color, 0.8);
        bg.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Button text
        const label = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.add([bg, label]);
        
        // Make interactive
        bg.setInteractive({ useHandCursor: true });
        
        // Hover effects
        bg.on('pointerover', () => {
            bg.setFillStyle(color, 1.0);
            button.setScale(1.05);
            if (window.audioManager) {
                window.audioManager.playSFX('answer_select');
            }
        });
        
        bg.on('pointerout', () => {
            bg.setFillStyle(color, 0.8);
            button.setScale(1.0);
        });
        
        bg.on('pointerdown', () => {
            button.setScale(0.95);
            if (window.audioManager) {
                window.audioManager.playSFX('lifeline_use');
            }
        });
        
        bg.on('pointerup', () => {
            button.setScale(1.05);
        });
        
        return bg;
    }
    
    createBackgroundEffects() {
        const { width, height } = this.scale;
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 6);
            
            const particle = this.add.circle(x, y, size, 0x007bff, 0.3);
            
            // Floating animation
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeOut',
                repeat: -1,
                delay: Phaser.Math.Between(0, 3000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = height + 50;
                    particle.alpha = 0.3;
                }
            });
        }
        
        // Pulsing title effect
        const titleElements = this.children.list.filter(child => 
            child.type === 'Text' && child.text === 'QuizFlow'
        );
        
        if (titleElements.length > 0) {
            this.tweens.add({
                targets: titleElements[0],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 2000,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    async startNewGame() {
        // Check if questions are loaded
        if (!window.questionManager || !window.questionManager.isLoaded) {
            this.showMessage('Loading questions, please wait...');
            return;
        }
        
        // Generate new session
        const success = window.questionManager.generateSession();
        if (!success) {
            this.showMessage('Failed to generate questions. Please try again.');
            return;
        }
        
        // Play start sound
        if (window.audioManager) {
            window.audioManager.playSFX('question_reveal');
        }
        
        // Transition to game scene
        this.scene.start('GameScene');
    }
    
    showInstructions() {
        const { width, height } = this.scale;
        
        // Create instructions overlay
        const overlay = this.add.container(width / 2, height / 2);
        
        // Background
        const bg = this.add.rectangle(0, 0, width * 0.8, height * 0.8, 0x000000, 0.9);
        bg.setStrokeStyle(2, 0x007bff);
        
        // Title
        const title = this.add.text(0, -height * 0.3, 'How to Play', {
            fontSize: '32px',
            fontFamily: 'Orbitron, monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Instructions text
        const instructions = `
🎯 Answer 15 questions to win the quiz!

📊 Questions get harder as you progress:
   • Questions 1-5: Easy
   • Questions 6-10: Medium  
   • Questions 11-15: Hard

💰 Earn points for correct answers:
   • Easy: 100 points
   • Medium: 200 points
   • Hard: 300 points

🆘 Use lifelines to help you:
   • 50:50 - Remove 2 wrong answers (1 use)
   • Skip - Skip current question (2 uses)
   • Ask Audience - Show popular vote (1 use)

⏰ You have 30 seconds per question

🔊 Use audio controls (top right) to toggle sound and language

Good luck!`;
        
        const instructionsText = this.add.text(0, 0, instructions, {
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#cccccc',
            lineSpacing: 8,
            align: 'left'
        }).setOrigin(0.5);
        
        // Close button
        const closeButton = this.createButton(0, height * 0.3, 'Close', GameConfig.config.COLORS.DANGER);
        closeButton.on('pointerdown', () => {
            overlay.destroy();
        });
        
        overlay.add([bg, title, instructionsText, closeButton]);
        overlay.setDepth(100);
        
        // Make background clickable to close
        bg.setInteractive();
        bg.on('pointerdown', () => {
            overlay.destroy();
        });
    }
    
    showSettings() {
        const { width, height } = this.scale;
        
        // Create settings overlay
        const overlay = this.add.container(width / 2, height / 2);
        
        // Background
        const bg = this.add.rectangle(0, 0, width * 0.6, height * 0.7, 0x000000, 0.9);
        bg.setStrokeStyle(2, 0x007bff);
        
        // Title
        const title = this.add.text(0, -height * 0.25, 'Settings', {
            fontSize: '32px',
            fontFamily: 'Orbitron, monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Audio settings
        let yOffset = -100;
        
        if (window.audioManager) {
            const status = window.audioManager.getStatus();
            
            this.add.text(0, yOffset, 'Audio Settings', {
                fontSize: '20px',
                fontFamily: 'Roboto, sans-serif',
                fill: '#ffffff'
            }).setOrigin(0.5);
            yOffset += 40;
            
            // TTS Toggle
            const ttsButton = this.createButton(0, yOffset, `TTS: ${status.ttsEnabled ? 'ON' : 'OFF'}`, 
                status.ttsEnabled ? GameConfig.config.COLORS.SUCCESS : GameConfig.config.COLORS.DANGER);
            ttsButton.on('pointerdown', () => {
                window.audioManager.toggleTTS();
                overlay.destroy();
                this.showSettings(); // Refresh
            });
            yOffset += 60;
            
            // SFX Toggle
            const sfxButton = this.createButton(0, yOffset, `Sound Effects: ${status.sfxEnabled ? 'ON' : 'OFF'}`, 
                status.sfxEnabled ? GameConfig.config.COLORS.SUCCESS : GameConfig.config.COLORS.DANGER);
            sfxButton.on('pointerdown', () => {
                window.audioManager.toggleSFX();
                overlay.destroy();
                this.showSettings(); // Refresh
            });
            yOffset += 60;
            
            // Language Toggle
            const langButton = this.createButton(0, yOffset, `Language: ${status.language.toUpperCase()}`, 
                GameConfig.config.COLORS.WARNING);
            langButton.on('pointerdown', () => {
                window.audioManager.switchLanguage();
                overlay.destroy();
                this.showSettings(); // Refresh
            });
        }
        
        // Close button
        const closeButton = this.createButton(0, height * 0.25, 'Close', GameConfig.config.COLORS.SECONDARY);
        closeButton.on('pointerdown', () => {
            overlay.destroy();
        });
        
        overlay.add([bg, title, closeButton]);
        overlay.setDepth(100);
        
        // Make background clickable to close
        bg.setInteractive();
        bg.on('pointerdown', () => {
            overlay.destroy();
        });
    }
    
    showMessage(message, duration = 3000) {
        const { width, height } = this.scale;
        
        const messageText = this.add.text(width / 2, height * 0.85, message, {
            fontSize: '18px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
        
        // Fade out after duration
        this.tweens.add({
            targets: messageText,
            alpha: 0,
            duration: 500,
            delay: duration,
            onComplete: () => {
                messageText.destroy();
            }
        });
    }
}
