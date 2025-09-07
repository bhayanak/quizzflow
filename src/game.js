// Main Game File - Initializes and configures the Phaser game
class QuizFlowGame {
    constructor() {
        this.game = null;
        this.isInitialized = false;
    }
    
    async initialize() {
        try {
            console.log('Initializing QuizFlow Game...');
            
            // Initialize managers
            await this.initializeManagers();
            
            // Configure Phaser
            const phaserConfig = this.createPhaserConfig();
            
            // Create game instance
            this.game = new Phaser.Game(phaserConfig);
            
            // Set up global references
            this.setupGlobalReferences();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('QuizFlow Game initialized successfully!');
            
            // Hide loading screen
            this.hideLoadingScreen();
            
        } catch (error) {
            console.error('Failed to initialize QuizFlow Game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }
    
    async initializeManagers() {
        // Initialize AudioManager
        console.log('Initializing AudioManager...');
        window.audioManager = new AudioManager();
        
        // Initialize QuestionManager and load questions
        console.log('Initializing QuestionManager...');
        window.questionManager = new QuestionManager();
        
        const questionsLoaded = await window.questionManager.loadQuestions();
        if (!questionsLoaded) {
            throw new Error('Failed to load questions');
        }
        
        console.log('Managers initialized successfully');
    }
    
    createPhaserConfig() {
        const config = GameConfig.config;
        
        return {
            type: Phaser.AUTO,
            width: config.PHASER.width,
            height: config.PHASER.height,
            parent: 'gameCanvas',
            backgroundColor: config.PHASER.backgroundColor,
            physics: config.PHASER.physics,
            scene: [MenuScene, GameScene, GameOverScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 800,
                    height: 600
                },
                max: {
                    width: 1600,
                    height: 1200
                }
            },
            dom: {
                createContainer: true
            },
            audio: {
                disableWebAudio: false
            }
        };
    }
    
    setupGlobalReferences() {
        // Make game instance globally accessible for debugging
        window.quizFlowGame = this;
        window.phaserGame = this.game;
        
        // Add game configuration to global scope
        window.GameConfig = GameConfig;
    }
    
    setupEventListeners() {
        // Audio control buttons
        this.setupAudioControls();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Window events
        this.setupWindowEvents();
        
        // Mobile touch events
        this.setupMobileEvents();
    }
    
    setupAudioControls() {
        const muteBtn = document.getElementById('muteBtn');
        const languageBtn = document.getElementById('languageBtn');
        
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = window.audioManager.toggleMute();
                muteBtn.textContent = isMuted ? '🔇' : '🔊';
                muteBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
            });
        }
        
        if (languageBtn) {
            languageBtn.addEventListener('click', () => {
                const newLanguage = window.audioManager.switchLanguage();
                languageBtn.textContent = newLanguage.toUpperCase();
                languageBtn.title = `Current Language: ${newLanguage === 'en' ? 'English' : 'Hindi'}`;
            });
        }
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'm':
                case 'M':
                    // Toggle mute
                    if (window.audioManager) {
                        window.audioManager.toggleMute();
                        document.getElementById('muteBtn')?.click();
                    }
                    break;
                    
                case 'l':
                case 'L':
                    // Switch language
                    if (window.audioManager) {
                        document.getElementById('languageBtn')?.click();
                    }
                    break;
                    
                case 'Escape':
                    // Return to menu (if in game)
                    if (this.game && this.game.scene.isActive('GameScene')) {
                        this.game.scene.start('MenuScene');
                    }
                    break;
                    
                case ' ':
                    // Prevent spacebar from scrolling page
                    if (this.game && this.game.scene.isActive('GameScene')) {
                        event.preventDefault();
                    }
                    break;
            }
        });
    }
    
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.scale.refresh();
            }
        });
        
        // Handle window focus/blur for audio management
        window.addEventListener('blur', () => {
            if (window.audioManager) {
                window.audioManager.stopAll();
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && window.audioManager) {
                window.audioManager.stopAll();
            }
        });
    }
    
    setupMobileEvents() {
        // Prevent mobile zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Handle mobile orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (this.game) {
                    this.game.scale.refresh();
                }
            }, 500);
        });
        
        // Enable audio context on first touch (mobile requirement)
        document.addEventListener('touchstart', () => {
            if (window.audioManager) {
                window.audioManager.ensureAudioContext();
            }
        }, { once: true });
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }
    
    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            const loadingContent = loadingScreen.querySelector('.loading-content');
            if (loadingContent) {
                loadingContent.innerHTML = `
                    <h1>QuizFlow</h1>
                    <div style="color: #ff4444; font-size: 1.2rem; margin: 2rem 0;">
                        ❌ ${message}
                    </div>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">Reload Page</button>
                `;
            }
        }
    }
    
    // Public methods for external control
    pauseGame() {
        if (this.game && this.game.scene.isActive('GameScene')) {
            this.game.scene.pause('GameScene');
        }
    }
    
    resumeGame() {
        if (this.game && this.game.scene.isPaused('GameScene')) {
            this.game.scene.resume('GameScene');
        }
    }
    
    restartGame() {
        if (this.game) {
            this.game.scene.start('MenuScene');
        }
    }
    
    getGameStats() {
        if (!window.questionManager) return null;
        
        return {
            questionsLoaded: window.questionManager.getStatistics(),
            audioStatus: window.audioManager ? window.audioManager.getStatus() : null,
            gameInitialized: this.isInitialized,
            currentScene: this.game ? this.game.scene.getActiveScene()?.scene?.key : null
        };
    }
    
    // Debug methods
    enableDebugMode() {
        if (this.game) {
            this.game.config.physics.arcade.debug = true;
        }
        console.log('Debug mode enabled');
    }
    
    disableDebugMode() {
        if (this.game) {
            this.game.config.physics.arcade.debug = false;
        }
        console.log('Debug mode disabled');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing QuizFlow...');
    
    const quizFlow = new QuizFlowGame();
    await quizFlow.initialize();
});

// Expose useful functions globally for console debugging
window.QuizFlowDebug = {
    getStats: () => window.quizFlowGame?.getGameStats(),
    restart: () => window.quizFlowGame?.restartGame(),
    pause: () => window.quizFlowGame?.pauseGame(),
    resume: () => window.quizFlowGame?.resumeGame(),
    enableDebug: () => window.quizFlowGame?.enableDebugMode(),
    disableDebug: () => window.quizFlowGame?.disableDebugMode(),
    generateQuestions: () => window.questionManager?.generateSession(),
    getAudioStatus: () => window.audioManager?.getStatus(),
    toggleAudio: () => window.audioManager?.toggleMute(),
    speakTest: (text) => window.audioManager?.speak(text || 'This is a test'),
    playSFX: (name) => window.audioManager?.playSFX(name || 'question_reveal')
};

console.log('QuizFlow initialized! Use QuizFlowDebug in console for debugging.');
