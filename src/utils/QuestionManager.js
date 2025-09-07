// Question Manager - Handles loading, randomizing, and serving questions
class QuestionManager {
    constructor() {
        this.allQuestions = [];
        this.sessionQuestions = [];
        this.currentQuestionIndex = 0;
        this.usedQuestionHashes = new Set();
        this.categories = new Map();
        this.isLoaded = false;
        this.currentLanguage = 'en';
    }

    // Set language for question loading
    setLanguage(language) {
        console.log(`QuestionManager: Setting language to ${language}`);
        this.currentLanguage = language;
        // Clear loaded questions to force reload in new language
        this.isLoaded = false;
        this.allQuestions = [];
        this.categories.clear();
    }
    
    async loadQuestions() {
        try {
            console.log('Starting question loading process...');
            console.log('Current URL:', window.location.href);
            console.log('Current Language:', this.currentLanguage);
            
            // List of data files to load (with language support)
            const languageSuffix = this.currentLanguage === 'hi' ? '_hi' : '';
            const dataFiles = [
                `animals_easy${languageSuffix}.json`, `animals_medium${languageSuffix}.json`, `animals_hard${languageSuffix}.json`,
                `art_easy${languageSuffix}.json`, `art_medium${languageSuffix}.json`, `art_hard${languageSuffix}.json`,
                `entertainment_easy${languageSuffix}.json`, `entertainment_medium${languageSuffix}.json`, `entertainment_hard${languageSuffix}.json`,
                `general_knowledge_easy${languageSuffix}.json`, `general_knowledge_medium${languageSuffix}.json`, `general_knowledge_hard${languageSuffix}.json`,
                `mathematics_easy${languageSuffix}.json`, `mathematics_medium${languageSuffix}.json`, `mathematics_hard${languageSuffix}.json`,
                `mythology_easy${languageSuffix}.json`, `mythology_medium${languageSuffix}.json`, `mythology_hard${languageSuffix}.json`,
                `politics_easy${languageSuffix}.json`, `politics_medium${languageSuffix}.json`, `politics_hard${languageSuffix}.json`,
                `science_easy${languageSuffix}.json`, `science_medium${languageSuffix}.json`, `science_hard${languageSuffix}.json`,
                `sports_easy${languageSuffix}.json`, `sports_medium${languageSuffix}.json`, `sports_hard${languageSuffix}.json`
            ];
            
            console.log(`Attempting to load ${dataFiles.length} question files for language: ${this.currentLanguage}...`);
            
            // Load all question files
            const loadPromises = dataFiles.map(async (file) => {
                try {
                    console.log(`Fetching: data/${file}`);
                    const response = await fetch(`data/${file}`);
                    if (!response.ok) {
                        // If Hindi file doesn't exist, fallback to English
                        if (this.currentLanguage === 'hi' && response.status === 404) {
                            const englishFile = file.replace('_hi.json', '.json');
                            console.warn(`Hindi file ${file} not found, falling back to ${englishFile}`);
                            const fallbackResponse = await fetch(`data/${englishFile}`);
                            if (fallbackResponse.ok) {
                                const questions = await fallbackResponse.json();
                                console.log(`✅ Loaded ${questions.length} questions from ${englishFile} (fallback)`);
                                return questions;
                            }
                        }
                        console.warn(`Failed to load ${file}: ${response.status} ${response.statusText}`);
                        return [];
                    }
                    const questions = await response.json();
                    console.log(`✅ Loaded ${questions.length} questions from ${file}`);
                    return questions;
                } catch (error) {
                    console.error(`❌ Error loading ${file}:`, error);
                    return [];
                }
            });
            
            const questionArrays = await Promise.all(loadPromises);
            
            // Flatten and process all questions
            this.allQuestions = questionArrays.flat().filter(q => this.validateQuestion(q));
            
            // Organize questions by category and difficulty
            this.organizeQuestions();
            
            console.log(`Total questions loaded: ${this.allQuestions.length}`);
            console.log('Categories:', Array.from(this.categories.keys()));
            
            this.isLoaded = true;
            return true;
            
        } catch (error) {
            console.error('Failed to load questions:', error);
            this.isLoaded = false;
            return false;
        }
    }
    
    validateQuestion(question) {
        // Validate required fields
        if (!question.id || !question.question || !question.correctAnswer || 
            !question.incorrectAnswers || !question.difficulty || !question.type) {
            return false;
        }
        
        // Validate multiple choice questions have enough options
        if (question.type === 'multiple' && question.incorrectAnswers.length < 3) {
            return false;
        }
        
        // Validate boolean questions
        if (question.type === 'boolean' && question.incorrectAnswers.length !== 1) {
            return false;
        }
        
        return true;
    }
    
    organizeQuestions() {
        this.categories.clear();
        
        for (const question of this.allQuestions) {
            const category = question.broadCategory || 'General';
            const difficulty = question.difficulty;
            
            if (!this.categories.has(category)) {
                this.categories.set(category, { easy: [], medium: [], hard: [] });
            }
            
            if (this.categories.get(category)[difficulty]) {
                this.categories.get(category)[difficulty].push(question);
            }
        }
    }
    
    generateSession() {
        if (!this.isLoaded) {
            console.error('Questions not loaded yet!');
            return false;
        }
        
        this.sessionQuestions = [];
        this.currentQuestionIndex = 0;
        this.usedQuestionHashes.clear();
        
        const config = GameConfig.config;
        const totalQuestions = config.QUESTIONS_PER_SESSION;
        
        // Generate questions based on difficulty progression
        for (let i = 1; i <= totalQuestions; i++) {
            const difficulty = GameConfig.getDifficultyForQuestion(i);
            const question = this.getRandomQuestionByDifficulty(difficulty);
            
            if (question) {
                this.sessionQuestions.push({
                    ...question,
                    questionNumber: i,
                    difficulty: difficulty
                });
                this.usedQuestionHashes.add(question.questionHash);
            } else {
                console.warn(`Could not find question for position ${i} with difficulty ${difficulty}`);
            }
        }
        
        console.log(`Generated session with ${this.sessionQuestions.length} questions`);
        return this.sessionQuestions.length > 0;
    }
    
    getRandomQuestionByDifficulty(difficulty) {
        const availableQuestions = this.allQuestions.filter(q => 
            q.difficulty === difficulty && !this.usedQuestionHashes.has(q.questionHash)
        );
        
        if (availableQuestions.length === 0) {
            // Fallback: get any question of any difficulty if specific difficulty is exhausted
            const fallbackQuestions = this.allQuestions.filter(q => 
                !this.usedQuestionHashes.has(q.questionHash)
            );
            if (fallbackQuestions.length > 0) {
                return fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
            }
            return null;
        }
        
        return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    
    getCurrentQuestion() {
        if (this.currentQuestionIndex < this.sessionQuestions.length) {
            return this.sessionQuestions[this.currentQuestionIndex];
        }
        return null;
    }
    
    getNextQuestion() {
        this.currentQuestionIndex++;
        return this.getCurrentQuestion();
    }
    
    hasMoreQuestions() {
        return this.currentQuestionIndex < this.sessionQuestions.length;
    }
    
    getProgress() {
        return {
            current: this.currentQuestionIndex + 1,
            total: this.sessionQuestions.length,
            percentage: ((this.currentQuestionIndex + 1) / this.sessionQuestions.length) * 100
        };
    }
    
    getSessionSummary() {
        return {
            totalQuestions: this.sessionQuestions.length,
            questionsAnswered: this.currentQuestionIndex,
            categoriesUsed: [...new Set(this.sessionQuestions.map(q => q.broadCategory))],
            difficultiesUsed: this.sessionQuestions.reduce((acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
            }, {})
        };
    }
    
    // Utility method to shuffle array
    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    // Get all answer options for current question (shuffled)
    getCurrentQuestionOptions() {
        const question = this.getCurrentQuestion();
        if (!question) return [];
        
        const options = [question.correctAnswer, ...question.incorrectAnswers];
        return this.shuffle(options);
    }
    
    // Check if an answer is correct
    isCorrectAnswer(answer) {
        const question = this.getCurrentQuestion();
        return question && question.correctAnswer === answer;
    }
    
    // Get statistics about loaded questions
    getStatistics() {
        const stats = {
            totalQuestions: this.allQuestions.length,
            categories: {},
            difficulties: { easy: 0, medium: 0, hard: 0 }
        };
        
        for (const question of this.allQuestions) {
            const category = question.broadCategory || 'Unknown';
            stats.categories[category] = (stats.categories[category] || 0) + 1;
            stats.difficulties[question.difficulty] = (stats.difficulties[question.difficulty] || 0) + 1;
        }
        
        return stats;
    }
}
