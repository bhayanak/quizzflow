/**
 * Translation Manager for QuizFlow
 * Handles language switching and text translations
 */
class TranslationManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.loadPromise = null;
    }

    async initialize() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.loadTranslations();
        return this.loadPromise;
    }

    async loadTranslations() {
        try {
            console.log('Loading translations...');
            const response = await fetch('./data/translations.json');
            
            if (!response.ok) {
                throw new Error(`Failed to load translations: ${response.status}`);
            }
            
            this.translations = await response.json();
            console.log('Translations loaded successfully');
            
            // Load saved language preference
            const savedLanguage = localStorage.getItem('quizflow_language');
            if (savedLanguage && this.isLanguageSupported(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load translations:', error);
            // Use English as fallback
            this.translations = {
                ui_labels: {
                    en: {
                        welcome: "Welcome to QuizFlow",
                        start_game: "Start Game",
                        settings: "Settings",
                        loading: "Loading...",
                        error_loading: "Error loading translations"
                    }
                }
            };
            return false;
        }
    }

    // Get translated text for UI labels
    getLabel(key, language = null) {
        const lang = language || this.currentLanguage;
        
        try {
            const label = this.translations.ui_labels?.[lang]?.[key];
            
            if (label) {
                return label;
            }
            
            // Fallback to English if translation not found
            if (lang !== this.fallbackLanguage) {
                const fallback = this.translations.ui_labels?.[this.fallbackLanguage]?.[key];
                if (fallback) {
                    console.warn(`Translation missing for '${key}' in ${lang}, using fallback`);
                    return fallback;
                }
            }
            
            // If all else fails, return the key itself
            console.warn(`Translation missing for '${key}' in all languages`);
            return key;
            
        } catch (error) {
            console.error('Error getting translation:', error);
            return key;
        }
    }

    // Set current language
    setLanguage(language) {
        if (this.isLanguageSupported(language)) {
            const oldLanguage = this.currentLanguage;
            this.currentLanguage = language;
            
            // Save preference
            localStorage.setItem('quizflow_language', language);
            
            console.log(`Language changed from ${oldLanguage} to ${language}`);
            
            // Trigger custom event for components to update
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { 
                    oldLanguage, 
                    newLanguage: language 
                }
            }));
            
            return true;
        } else {
            console.warn(`Language '${language}' is not supported`);
            return false;
        }
    }

    // Get current language
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // Check if language is supported
    isLanguageSupported(language) {
        return this.translations.ui_labels && 
               this.translations.ui_labels.hasOwnProperty(language);
    }

    // Get list of supported languages
    getSupportedLanguages() {
        return Object.keys(this.translations.ui_labels || {});
    }

    // Get language display name
    getLanguageDisplayName(language) {
        const displayNames = {
            'en': 'English',
            'hi': 'हिंदी'
        };
        
        return displayNames[language] || language;
    }

    // Get translated question text (for future use with translated questions)
    getQuestionText(questionId, language = null) {
        const lang = language || this.currentLanguage;
        
        // For now, return the original question text
        // In the future, this could look up translated questions
        return null; // Indicates no translation available
    }

    // Format currency for different languages
    formatCurrency(amount, language = null) {
        const lang = language || this.currentLanguage;
        
        // Format currency based on language
        if (lang === 'hi') {
            return `₹${amount.toLocaleString('hi-IN')}`;
        } else {
            return `₹${amount.toLocaleString('en-IN')}`;
        }
    }

    // Format numbers for different languages
    formatNumber(number, language = null) {
        const lang = language || this.currentLanguage;
        
        if (lang === 'hi') {
            return number.toLocaleString('hi-IN');
        } else {
            return number.toLocaleString('en-IN');
        }
    }

    // Get RTL (Right-to-Left) support info
    isRTL(language = null) {
        const lang = language || this.currentLanguage;
        // Hindi is LTR, but this method is here for future RTL language support
        return false;
    }

    // Get language code for speech synthesis
    getSpeechLanguageCode(language = null) {
        const lang = language || this.currentLanguage;
        
        const speechCodes = {
            'en': 'en-US',
            'hi': 'hi-IN'
        };
        
        return speechCodes[lang] || 'en-US';
    }

    // Create localized error messages
    getErrorMessage(errorType, language = null) {
        const errorMessages = {
            'en': {
                'network': 'Network error. Please check your connection.',
                'loading': 'Failed to load content. Please try again.',
                'audio': 'Audio playback failed.',
                'storage': 'Failed to save data.',
                'generic': 'An error occurred. Please try again.'
            },
            'hi': {
                'network': 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
                'loading': 'सामग्री लोड करने में असफल। कृपया पुनः प्रयास करें।',
                'audio': 'ऑडियो प्लेबैक असफल।',
                'storage': 'डेटा सेव करने में असफल।',
                'generic': 'एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
            }
        };
        
        const lang = language || this.currentLanguage;
        
        return errorMessages[lang]?.[errorType] || 
               errorMessages[this.fallbackLanguage]?.[errorType] ||
               'An error occurred';
    }

    // Debug method to log translation stats
    getTranslationStats() {
        const stats = {
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.getSupportedLanguages(),
            totalLabels: 0,
            translatedLabels: {}
        };

        if (this.translations.ui_labels) {
            // Count labels for each language
            Object.keys(this.translations.ui_labels).forEach(lang => {
                const labelCount = Object.keys(this.translations.ui_labels[lang]).length;
                stats.translatedLabels[lang] = labelCount;
                
                if (lang === 'en') {
                    stats.totalLabels = labelCount;
                }
            });
        }

        return stats;
    }
}

// Export for use in other modules
window.TranslationManager = TranslationManager;
