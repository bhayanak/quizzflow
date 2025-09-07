// Question Manager - Handles loading, randomizing, and serving questions
class QuestionManager {
    constructor() {
        this.allQuestions = [];
        this.sessionQuestions = [];
        this.currentQuestionIndex = 0;
        this.usedQuestionHashes = new Set();
        this.categories = new Map();
        this.isLoaded = false;
    }
    
    async loadQuestions() {
        try {
            console.log('Loading questions from data files...');
            
            // List of data files to load
            const dataFiles = [
                'animals_easy.json', 'animals_medium.json', 'animals_hard.json',
                'art_easy.json', 'art_medium.json', 'art_hard.json',
                'entertainment_easy.json', 'entertainment_medium.json', 'entertainment_hard.json',
                'general_knowledge_easy.json', 'general_knowledge_medium.json', 'general_knowledge_hard.json',
                'mathematics_easy.json', 'mathematics_medium.json', 'mathematics_hard.json',
                'mythology_easy.json', 'mythology_medium.json', 'mythology_hard.json',
                'politics_easy.json', 'politics_medium.json', 'politics_hard.json',
                'science_easy.json', 'science_medium.json', 'science_hard.json',
                'sports_easy.json', 'sports_medium.json', 'sports_hard.json'
            ];
            
            // Load all question files
            const loadPromises = dataFiles.map(async (file) => {
                try {
                    const response = await fetch(`../data/${file}`);
                    if (!response.ok) {
                        console.warn(`Failed to load ${file}: ${response.status}`);
                        return [];
                    }
                    const questions = await response.json();
                    console.log(`Loaded ${questions.length} questions from ${file}`);
                    return questions;
                } catch (error) {
                    console.warn(`Error loading ${file}:`, error);
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
