// Game Over Scene - Results and options to play again
class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        this.gameData = {
            score: data.score || 0,
            isVictory: data.isVictory || false,
            questionsAnswered: data.questionsAnswered || 0,
            totalQuestions: data.totalQuestions || 15
        };
    }
    
    create() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Background
        this.add.rectangle(width / 2, height / 2, width, height, config.COLORS.BACKGROUND);
        
        // Create results display
        this.createResultsDisplay();
        this.createStatistics();
        this.createActionButtons();
        this.createBackgroundEffects();
        
        // Play entrance animation
        this.animateEntrance();
    }
    
    createResultsDisplay() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Main title
        const titleText = this.gameData.isVictory ? 'Congratulations!' : 'Game Over';
        const titleColor = this.gameData.isVictory ? config.COLORS.SUCCESS : config.COLORS.DANGER;
        
        this.titleText = this.add.text(width / 2, height * 0.15, titleText, {
            fontSize: '64px',
            fontFamily: 'Orbitron, monospace',
            fill: titleColor.toString(16),
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Subtitle
        const subtitleText = this.gameData.isVictory ? 
            'You completed the quiz!' : 
            'Better luck next time!';
            
        this.subtitleText = this.add.text(width / 2, height * 0.25, subtitleText, {
            fontSize: '24px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Score display
        this.scoreText = this.add.text(width / 2, height * 0.35, `Final Score: ${this.gameData.score}`, {
            fontSize: '36px',
            fontFamily: 'Orbitron, monospace',
            fill: config.COLORS.GOLD.toString(16),
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
    }
    
    createStatistics() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        // Statistics background
        const statsBg = this.add.rectangle(width / 2, height * 0.55, width * 0.8, 200, 0x1a1a2e, 0.8);
        statsBg.setStrokeStyle(2, config.COLORS.PRIMARY);
        
        // Statistics title
        this.add.text(width / 2, height * 0.47, 'Game Statistics', {
            fontSize: '24px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Calculate statistics
        const accuracy = this.gameData.totalQuestions > 0 ? 
            Math.round((this.gameData.questionsAnswered / this.gameData.totalQuestions) * 100) : 0;
        
        const performance = this.getPerformanceRating();
        
        // Display statistics
        const stats = [
            `Questions Answered: ${this.gameData.questionsAnswered}/${this.gameData.totalQuestions}`,
            `Accuracy: ${accuracy}%`,
            `Performance: ${performance.text}`,
            this.gameData.isVictory ? '🏆 Quiz Completed!' : '💪 Try Again!'
        ];
        
        stats.forEach((stat, index) => {
            this.add.text(width / 2, height * 0.52 + (index * 25), stat, {
                fontSize: '18px',
                fontFamily: 'Roboto, sans-serif',
                fill: index === 2 ? performance.color : '#cccccc',
                align: 'center'
            }).setOrigin(0.5);
        });
        
        // Store stats for animation
        this.statsElements = this.children.list.slice(-4);
    }
    
    getPerformanceRating() {
        const config = GameConfig.config;
        const percentage = (this.gameData.questionsAnswered / this.gameData.totalQuestions) * 100;
        
        if (percentage >= 90) {
            return { text: 'Excellent! 🌟', color: config.COLORS.SUCCESS.toString(16) };
        } else if (percentage >= 75) {
            return { text: 'Great! 👍', color: config.COLORS.PRIMARY.toString(16) };
        } else if (percentage >= 50) {
            return { text: 'Good! 👌', color: config.COLORS.WARNING.toString(16) };
        } else if (percentage >= 25) {
            return { text: 'Keep Trying! 💪', color: '#ff8800' };
        } else {
            return { text: 'Practice More! 📚', color: config.COLORS.DANGER.toString(16) };
        }
    }
    
    createActionButtons() {
        const { width, height } = this.scale;
        const config = GameConfig.config;
        
        const buttonY = height * 0.75;
        const buttonSpacing = 120;
        
        // Play Again Button
        this.playAgainButton = this.createButton(
            width / 2 - buttonSpacing, 
            buttonY, 
            'Play Again', 
            config.COLORS.SUCCESS
        );
        this.playAgainButton.on('pointerdown', () => {
            this.playAgain();
        });
        
        // Menu Button
        this.menuButton = this.createButton(
            width / 2, 
            buttonY, 
            'Main Menu', 
            config.COLORS.PRIMARY
        );
        this.menuButton.on('pointerdown', () => {
            this.returnToMenu();
        });
        
        // Share Score Button (placeholder for future social features)
        this.shareButton = this.createButton(
            width / 2 + buttonSpacing, 
            buttonY, 
            'Share Score', 
            config.COLORS.WARNING
        );
        this.shareButton.on('pointerdown', () => {
            this.shareScore();
        });
        
        // Store buttons for animation
        this.actionButtons = [this.playAgainButton, this.menuButton, this.shareButton];
    }
    
    createButton(x, y, text, color) {
        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.rectangle(0, 0, 140, 45, color, 0.8);
        bg.setStrokeStyle(2, 0xffffff, 0.5);
        
        // Button text
        const label = this.add.text(0, 0, text, {
            fontSize: '16px',
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
        
        if (this.gameData.isVictory) {
            // Victory confetti effect
            this.createConfetti();
        } else {
            // Subtle floating particles for game over
            this.createFloatingParticles();
        }
        
        // Animated background gradient
        const gradientOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.1);
        
        this.tweens.add({
            targets: gradientOverlay,
            alpha: 0.3,
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }
    
    createConfetti() {
        const { width, height } = this.scale;
        const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xf0932b, 0xeb4d4b, 0x6c5ce7];
        
        // Create confetti particles
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, -50);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const size = Phaser.Math.Between(3, 8);
            
            const confetti = this.add.rectangle(x, y, size, size, color);
            confetti.setRotation(Phaser.Math.Between(0, Math.PI * 2));
            
            // Falling animation
            this.tweens.add({
                targets: confetti,
                y: height + 100,
                rotation: confetti.rotation + Math.PI * 4,
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeIn',
                delay: Phaser.Math.Between(0, 2000),
                onComplete: () => {
                    confetti.destroy();
                }
            });
            
            // Slight horizontal drift
            this.tweens.add({
                targets: confetti,
                x: x + Phaser.Math.Between(-100, 100),
                duration: Phaser.Math.Between(3000, 6000),
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    createFloatingParticles() {
        const { width, height } = this.scale;
        
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(2, 4);
            
            const particle = this.add.circle(x, y, size, 0x444444, 0.3);
            
            // Floating animation
            this.tweens.add({
                targets: particle,
                y: y - 50,
                x: x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: Phaser.Math.Between(4000, 8000),
                ease: 'Sine.easeOut',
                repeat: -1,
                delay: Phaser.Math.Between(0, 4000),
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, width);
                    particle.y = height + 20;
                    particle.alpha = 0.3;
                }
            });
        }
    }
    
    animateEntrance() {
        // Animate title entrance
        this.titleText.setScale(0);
        this.tweens.add({
            targets: this.titleText,
            scaleX: 1,
            scaleY: 1,
            duration: 800,
            ease: 'Back.easeOut'
        });
        
        // Animate subtitle
        this.subtitleText.setAlpha(0);
        this.tweens.add({
            targets: this.subtitleText,
            alpha: 1,
            duration: 600,
            delay: 400
        });
        
        // Animate score
        this.scoreText.setScale(0);
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1,
            scaleY: 1,
            duration: 600,
            delay: 800,
            ease: 'Back.easeOut'
        });
        
        // Animate statistics
        if (this.statsElements) {
            this.statsElements.forEach((element, index) => {
                element.setAlpha(0);
                element.x -= 50;
                
                this.tweens.add({
                    targets: element,
                    alpha: 1,
                    x: element.x + 50,
                    duration: 400,
                    delay: 1200 + (index * 100),
                    ease: 'Power2.easeOut'
                });
            });
        }
        
        // Animate buttons
        this.actionButtons.forEach((button, index) => {
            button.setAlpha(0);
            button.y += 30;
            
            this.tweens.add({
                targets: button,
                alpha: 1,
                y: button.y - 30,
                duration: 500,
                delay: 1800 + (index * 150),
                ease: 'Back.easeOut'
            });
        });
    }
    
    playAgain() {
        // Generate new session and start game
        if (window.questionManager && window.questionManager.generateSession()) {
            this.scene.start('GameScene');
        } else {
            this.showMessage('Failed to generate new questions. Please try again.');
        }
    }
    
    returnToMenu() {
        this.scene.start('MenuScene');
    }
    
    shareScore() {
        // Simple score sharing (can be expanded for social media integration)
        const shareText = `I scored ${this.gameData.score} points in QuizFlow! 🎯\n` +
                         `Answered ${this.gameData.questionsAnswered}/${this.gameData.totalQuestions} questions correctly.\n` +
                         `${this.gameData.isVictory ? 'Quiz completed! 🏆' : 'Practice makes perfect! 💪'}`;
        
        // Try to use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'QuizFlow Score',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(text) {
        // Fallback: copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showMessage('Score copied to clipboard!');
            }).catch(() => {
                this.showMessage('Unable to copy score. Share manually!');
            });
        } else {
            // Create a temporary text area to copy text
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                this.showMessage('Score copied to clipboard!');
            } catch (err) {
                this.showMessage('Unable to copy score. Share manually!');
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    showMessage(message, duration = 3000) {
        const { width, height } = this.scale;
        
        const messageText = this.add.text(width / 2, height * 0.9, message, {
            fontSize: '16px',
            fontFamily: 'Roboto, sans-serif',
            fill: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 15, y: 8 }
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
