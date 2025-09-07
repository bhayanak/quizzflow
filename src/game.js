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
            console.log('Creating Phaser configuration...');
            const phaserConfig = this.createPhaserConfig();
            console.log('Phaser config created:', phaserConfig);
            
            // Create game instance
            console.log('Creating Phaser game instance...');
            this.game = new Phaser.Game(phaserConfig);
            console.log('Phaser game instance created:', !!this.game);
            
            // Set up global references
            this.setupGlobalReferences();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('QuizFlow Game initialized successfully!');
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            // Add fallback timeout in case something goes wrong
            setTimeout(() => {
                if (document.getElementById('loadingScreen').style.display !== 'none') {
                    console.log('Fallback: Force hiding loading screen');
                    this.hideLoadingScreen();
                }
            }, 2000);
            
        } catch (error) {
            console.error('Failed to initialize QuizFlow Game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }
    
    async initializeManagers() {
        // Initialize TranslationManager
        console.log('Initializing TranslationManager...');
        window.translationManager = new TranslationManager();
        await window.translationManager.initialize();
        
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
            parent: 'gameContainer',
            backgroundColor: config.PHASER.backgroundColor,
            physics: config.PHASER.physics,
            scene: [MenuScene, GameScene, GameOverScene],
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 600,
                    height: 400
                },
                max: {
                    width: 1400,
                    height: 1000
                },
                zoom: 1
            },
            dom: {
                createContainer: true
            },
            audio: {
                disableWebAudio: false
            },
            callbacks: {
                postBoot: (game) => {
                    console.log('🚀 Phaser game booted successfully');
                    console.log('Available scenes:', game.scene.scenes.map(s => s.scene.key));
                }
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
            // Set initial button state
            this.updateLanguageButton();
            
            languageBtn.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
        
        // Listen for language change events
        window.addEventListener('languageChanged', () => {
            this.updateLanguageButton();
        });
    }
    
    toggleLanguage() {
        if (!window.translationManager) return;
        
        const currentLang = window.translationManager.getCurrentLanguage();
        const newLang = currentLang === 'en' ? 'hi' : 'en';
        
        if (window.translationManager.setLanguage(newLang)) {
            // Update audio manager language too
            if (window.audioManager) {
                window.audioManager.setLanguage(newLang);
            }
            
            // Update any active scenes
            this.updateActiveScenes();
        }
    }
    
    updateLanguageButton() {
        const languageBtn = document.getElementById('languageBtn');
        if (languageBtn && window.translationManager) {
            const currentLang = window.translationManager.getCurrentLanguage();
            languageBtn.textContent = currentLang.toUpperCase();
            languageBtn.title = `Switch to ${currentLang === 'en' ? 'Hindi' : 'English'}`;
        }
    }
    
    updateActiveScenes() {
        if (!this.game) return;
        
        // Update MenuScene if active
        const menuScene = this.game.scene.getScene('MenuScene');
        if (menuScene && menuScene.scene.isActive() && menuScene.updateLanguage) {
            menuScene.updateLanguage();
        }
        
        // Update GameScene if active
        const gameScene = this.game.scene.getScene('GameScene');
        if (gameScene && gameScene.scene.isActive() && gameScene.updateLanguage) {
            gameScene.updateLanguage();
        }
        
        // Update GameOverScene if active
        const gameOverScene = this.game.scene.getScene('GameOverScene');
        if (gameOverScene && gameOverScene.scene.isActive() && gameOverScene.updateLanguage) {
            gameOverScene.updateLanguage();
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
        console.log('Attempting to hide loading screen...');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            console.log('Loading screen found, hiding...');
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('Loading screen hidden');
            }, 500);
        } else {
            console.warn('Loading screen element not found');
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
    try {
        console.log('DOM loaded, initializing QuizFlow...');
        console.log('Phaser version:', Phaser.VERSION);
        console.log('GameConfig available:', typeof GameConfig !== 'undefined');
        console.log('AudioManager available:', typeof AudioManager !== 'undefined');
        console.log('QuestionManager available:', typeof QuestionManager !== 'undefined');
        console.log('MenuScene available:', typeof MenuScene !== 'undefined');
        
        // Show skip button after 5 seconds
        setTimeout(() => {
            const skipBtn = document.getElementById('skipLoadingBtn');
            if (skipBtn && document.getElementById('loadingScreen').style.display !== 'none') {
                skipBtn.style.display = 'block';
                skipBtn.onclick = () => {
                    console.log('User clicked skip loading');
                    document.getElementById('loadingScreen').style.display = 'none';
                };
            }
        }, 5000);
        
        const quizFlow = new QuizFlowGame();
        await quizFlow.initialize();
    } catch (error) {
        console.error('Critical error during game initialization:', error);
        
        // Show error in loading screen
        const loadingContent = document.querySelector('.loading-content');
        if (loadingContent) {
            loadingContent.innerHTML = `
                <h1>QuizFlow</h1>
                <div style="color: #ff4444; font-size: 1.2rem; margin: 2rem 0;">
                    ❌ Failed to load game: ${error.message}
                </div>
                <div style="color: #cccccc; font-size: 0.9rem; margin: 1rem 0;">
                    Check console for details (F12)
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
