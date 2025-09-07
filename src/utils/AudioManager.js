// Audio Manager - Handles TTS, SFX, and background music
class AudioManager {
    constructor() {
        this.ttsEnabled = GameConfig.config.AUDIO.TTS_ENABLED;
        this.sfxEnabled = GameConfig.config.AUDIO.SFX_ENABLED;
        this.currentLanguage = GameConfig.config.AUDIO.DEFAULT_LANGUAGE;
        this.volume = GameConfig.config.AUDIO.VOLUME;
        this.isMuted = false;
        
        // Initialize Web Speech API
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.isInitialized = false;
        
        // Sound effect contexts
        this.audioContext = null;
        this.soundBuffers = new Map();
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Initialize AudioContext for sound effects
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load voices for TTS
            await this.loadVoices();
            
            // Preload sound effects
            await this.preloadSoundEffects();
            
            this.isInitialized = true;
            console.log('AudioManager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AudioManager:', error);
        }
    }
    
    async loadVoices() {
        return new Promise((resolve) => {
            // Load voices
            const loadVoices = () => {
                this.voices = this.synth.getVoices();
                console.log(`Loaded ${this.voices.length} TTS voices`);
                
                // Log available languages
                const languages = [...new Set(this.voices.map(v => v.lang.substring(0, 2)))];
                console.log('Available TTS languages:', languages);
                
                resolve();
            };
            
            // Voices might not be loaded immediately
            if (this.voices.length > 0) {
                loadVoices();
            } else {
                this.synth.onvoiceschanged = loadVoices;
                // Fallback timeout
                setTimeout(loadVoices, 1000);
            }
        });
    }
    
    async preloadSoundEffects() {
        // Create synthetic sound effects using Web Audio API
        const effects = {
            'question_reveal': () => this.createTone(440, 0.5, 'sine'),
            'answer_select': () => this.createTone(660, 0.2, 'square'),
            'correct_answer': () => this.createChord([523, 659, 784], 1.0),
            'wrong_answer': () => this.createTone(200, 1.0, 'sawtooth'),
            'lifeline_use': () => this.createTone(880, 0.3, 'triangle'),
            'timer_tick': () => this.createTone(800, 0.1, 'square'),
            'timer_warning': () => this.createTone(1000, 0.2, 'triangle'),
            'game_over': () => this.createSequence([400, 350, 300, 250], 0.5),
            'victory': () => this.createChord([523, 659, 784, 1047], 2.0)
        };
        
        for (const [name, generator] of Object.entries(effects)) {
            try {
                this.soundBuffers.set(name, generator);
                console.log(`Preloaded sound effect: ${name}`);
            } catch (error) {
                console.warn(`Failed to preload ${name}:`, error);
            }
        }
    }
    
    // Create a simple tone
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    // Create a chord (multiple frequencies)
    createChord(frequencies, duration) {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
                    
                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                }, index * 100);
            });
        };
    }
    
    // Create a sequence of tones
    createSequence(frequencies, duration) {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    this.createTone(freq, duration / frequencies.length)();
                }, index * (duration * 1000 / frequencies.length));
            });
        };
    }
    
    // Play a sound effect
    playSFX(name) {
        if (!this.sfxEnabled || this.isMuted || !this.soundBuffers.has(name)) {
            return;
        }
        
        try {
            const soundGenerator = this.soundBuffers.get(name);
            soundGenerator();
        } catch (error) {
            console.warn(`Failed to play sound effect ${name}:`, error);
        }
    }
    
    // Text-to-Speech functionality
    speak(text, language = null) {
        if (!this.ttsEnabled || this.isMuted || !this.synth) {
            return Promise.resolve();
        }
        
        return new Promise((resolve, reject) => {
            // Cancel any ongoing speech
            this.synth.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            const targetLang = language || this.currentLanguage;
            
            // Find appropriate voice
            const voice = this.findVoice(targetLang);
            if (voice) {
                utterance.voice = voice;
            }
            
            utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = this.volume;
            
            utterance.onend = () => resolve();
            utterance.onerror = (error) => {
                console.warn('TTS error:', error);
                resolve(); // Don't fail the game if TTS fails
            };
            
            // Add a timeout to prevent hanging
            setTimeout(() => {
                this.synth.cancel();
                resolve();
            }, 10000);
            
            this.synth.speak(utterance);
        });
    }
    
    findVoice(language) {
        // Try to find a voice for the specified language
        const langPrefix = language === 'hi' ? 'hi' : 'en';
        
        // First, try to find a voice that starts with the language code
        let voice = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
        
        // If not found, try to find any voice containing the language
        if (!voice) {
            voice = this.voices.find(v => v.lang.toLowerCase().includes(langPrefix));
        }
        
        // Fallback to first available voice
        if (!voice && this.voices.length > 0) {
            voice = this.voices[0];
        }
        
        return voice;
    }
    
    // Stop all audio
    stopAll() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
    
    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAll();
        }
        return this.isMuted;
    }
    
    // Set volume (0-1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
    
    // Toggle TTS
    toggleTTS() {
        this.ttsEnabled = !this.ttsEnabled;
        if (!this.ttsEnabled) {
            this.stopAll();
        }
        return this.ttsEnabled;
    }
    
    // Toggle SFX
    toggleSFX() {
        this.sfxEnabled = !this.sfxEnabled;
        return this.sfxEnabled;
    }
    
    // Switch language
    switchLanguage() {
        const supportedLangs = GameConfig.config.AUDIO.SUPPORTED_LANGUAGES;
        const currentIndex = supportedLangs.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % supportedLangs.length;
        this.currentLanguage = supportedLangs[nextIndex];
        
        console.log(`Language switched to: ${this.currentLanguage}`);
        return this.currentLanguage;
    }
    
    // Get current language display text
    getCurrentLanguageDisplay() {
        return this.currentLanguage.toUpperCase();
    }
    
    // Async version that waits for audio context to be ready
    async ensureAudioContext() {
        if (!this.audioContext) return false;
        
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
                return false;
            }
        }
        
        return this.audioContext.state === 'running';
    }
    
    // Get audio status
    getStatus() {
        return {
            initialized: this.isInitialized,
            muted: this.isMuted,
            ttsEnabled: this.ttsEnabled,
            sfxEnabled: this.sfxEnabled,
            language: this.currentLanguage,
            volume: this.volume,
            voicesLoaded: this.voices.length,
            audioContextState: this.audioContext?.state || 'not initialized'
        };
    }
}
