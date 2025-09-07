// Game Configuration
class GameConfig {
    static get config() {
        return {
            // Game settings
            QUESTIONS_PER_SESSION: 15,
            TIMER_DURATION: 30, // seconds per question
            
            // Scoring
            POINTS_PER_CORRECT: 100,
            STREAK_MULTIPLIER: 1.5,
            DIFFICULTY_MULTIPLIERS: {
                easy: 1,
                medium: 2,
                hard: 3
            },
            
            // Difficulty progression
            DIFFICULTY_PROGRESSION: [
                { questionNumbers: [1, 2, 3, 4, 5], difficulty: 'easy' },
                { questionNumbers: [6, 7, 8, 9, 10], difficulty: 'medium' },
                { questionNumbers: [11, 12, 13, 14, 15], difficulty: 'hard' }
            ],
            
            // Lifelines
            LIFELINES: {
                FIFTY_FIFTY: { uses: 1, available: true },
                SKIP_QUESTION: { uses: 2, available: true },
                ASK_AUDIENCE: { uses: 1, available: true }
            },
            
            // Audio settings
            AUDIO: {
                TTS_ENABLED: true,
                SFX_ENABLED: true,
                DEFAULT_LANGUAGE: 'en',
                SUPPORTED_LANGUAGES: ['en', 'hi'],
                VOLUME: 0.7
            },
            
            // UI Colors
            COLORS: {
                PRIMARY: 0x007bff,
                SECONDARY: 0x6c757d,
                SUCCESS: 0x28a745,
                DANGER: 0xdc3545,
                WARNING: 0xffc107,
                BACKGROUND: 0x0a0a0a,
                TEXT_PRIMARY: 0xffffff,
                TEXT_SECONDARY: 0xcccccc,
                GOLD: 0xffd700,
                SILVER: 0xc0c0c0
            },
            
            // Animation durations (milliseconds)
            ANIMATIONS: {
                QUESTION_REVEAL: 1000,
                ANSWER_HIGHLIGHT: 500,
                ANSWER_LOCK: 800,
                RESULT_REVEAL: 1200,
                SCENE_TRANSITION: 600
            },
            
            // Phaser game configuration
            PHASER: {
                width: 1200,
                height: 800,
                backgroundColor: '#0a0a0a',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 0 },
                        debug: false
                    }
                }
            }
        };
    }
    
    static getDifficultyForQuestion(questionNumber) {
        const progression = this.config.DIFFICULTY_PROGRESSION;
        for (let level of progression) {
            if (level.questionNumbers.includes(questionNumber)) {
                return level.difficulty;
            }
        }
        return 'easy'; // fallback
    }
    
    static getPointsForQuestion(difficulty, hasStreak = false) {
        const base = this.config.POINTS_PER_CORRECT;
        const multiplier = this.config.DIFFICULTY_MULTIPLIERS[difficulty] || 1;
        const streakMultiplier = hasStreak ? this.config.STREAK_MULTIPLIER : 1;
        
        return Math.floor(base * multiplier * streakMultiplier);
    }
    
    static getRandomColor() {
        const colors = Object.values(this.config.COLORS);
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
