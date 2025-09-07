// Audio Manager - Handles TTS, SFX, and background music
class AudioManager {
    constructor() {
        this.ttsEnabled = GameConfig.config.AUDIO.TTS_ENABLED;
        this.sfxEnabled = GameConfig.config.AUDIO.SFX_ENABLED;
        this.currentLanguage = GameConfig.config.AUDIO.DEFAULT_LANGUAGE;
        this.volume = GameConfig.config.AUDIO.VOLUME;
        this.isMuted = false;
        this.isSpeaking = false;
        this.allowSFXDuringTTS = true;
        
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
            console.log('🔊 Starting AudioManager initialization...');
            
            // Initialize AudioContext for sound effects
            console.log('Creating AudioContext...');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('AudioContext created:', this.audioContext.state);
            
            // For mobile devices (especially iOS Safari), we need to resume AudioContext after user interaction
            this.setupMobileAudioFix();

            // Load voices for TTS
            console.log('Loading TTS voices...');
            await this.loadVoices();
            
            // Preload sound effects
            console.log('Preloading sound effects...');
            await this.preloadSoundEffects();
            
            // Listen for language changes
            window.addEventListener('languageChanged', (event) => {
                console.log('AudioManager: Language changed to', event.detail.newLanguage);
                this.setLanguage(event.detail.newLanguage);
            });

            this.isInitialized = true;
            console.log('✅ AudioManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize AudioManager:', error);
            // Don't throw error - audio is not critical for game functionality
            this.isInitialized = false;
        }
    }
    
    // Enhanced mobile device detection
    isMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'iphone', 'ipad', 'ipod', 'android', 'webos', 'blackberry',
            'windows phone', 'opera mini', 'iemobile'
        ];

        // Check user agent
        const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));

        // Check for touch capability
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        // Check screen size (mobile-like dimensions)
        const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 768;

        return isMobileUA || (hasTouch && isSmallScreen);
    }

    // Setup mobile audio fix for iOS Safari and other mobile browsers
    setupMobileAudioFix() {
        const isMobile = this.isMobile();
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isMobile) {
            console.log('🔊 Mobile device detected:', { isMobile, isIOS, isAndroid });
            console.log('🔊 Setting up enhanced mobile audio fix...');

            // Create a function to resume audio context on first user interaction
            const resumeAudioContext = async (event) => {
                console.log('🔊 User interaction detected:', event.type);

                if (this.audioContext && this.audioContext.state === 'suspended') {
                    try {
                        await this.audioContext.resume();
                        console.log('✅ AudioContext resumed after user interaction');
                        console.log('✅ AudioContext state:', this.audioContext.state);

                        // Play a silent audio to unlock Web Audio API on iOS
                        setTimeout(() => {
                            this.unlockAudioAPI();
                        }, 100);

                        // Also try to reload TTS voices for mobile
                        this.loadVoices();

                        // Remove the event listeners after first activation
                        this.removeMobileEventListeners();

                        // Dispatch custom event to notify that audio is unlocked
                        window.dispatchEvent(new CustomEvent('audioUnlocked'));

                    } catch (error) {
                        console.warn('Failed to resume AudioContext:', error);
                    }
                } else if (this.audioContext) {
                    console.log('🔊 AudioContext already running:', this.audioContext.state);
                    this.unlockAudioAPI();
                    this.removeMobileEventListeners();
                }
            };

            // Store reference for removal
            this.mobileAudioUnlockHandler = resumeAudioContext;

            // Add multiple event listeners for better coverage
            const events = ['touchstart', 'touchend', 'click', 'tap', 'pointerdown'];
            events.forEach(eventType => {
                document.addEventListener(eventType, resumeAudioContext, {
                    once: false, // Allow multiple attempts
                    passive: true
                });
            });

            // Also try to resume when game starts
            window.addEventListener('gameStarted', resumeAudioContext, { once: true });

            // Try again when window gains focus (for app switching)
            window.addEventListener('focus', resumeAudioContext, { once: false });
        }
    }

    // Remove mobile event listeners
    removeMobileEventListeners() {
        if (this.mobileAudioUnlockHandler) {
            const events = ['touchstart', 'touchend', 'click', 'tap', 'pointerdown'];
            events.forEach(eventType => {
                document.removeEventListener(eventType, this.mobileAudioUnlockHandler);
            });
            window.removeEventListener('gameStarted', this.mobileAudioUnlockHandler);
            window.removeEventListener('focus', this.mobileAudioUnlockHandler);
        }
    }

    // Enhanced unlock Web Audio API on iOS and mobile browsers
    unlockAudioAPI() {
        if (!this.audioContext) {
            console.warn('No AudioContext available for unlocking');
            return;
        }

        try {
            console.log('🔊 Attempting to unlock Web Audio API...');
            console.log('🔊 AudioContext state before unlock:', this.audioContext.state);

            // Create multiple silent audio sources for better compatibility
            const sources = [];

            // Method 1: Oscillator with gain (most common)
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);

            sources.push({ oscillator, gainNode });

            // Method 2: Empty buffer (for better iOS compatibility)
            const buffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
            const bufferSource = this.audioContext.createBufferSource();
            const bufferGain = this.audioContext.createGain();

            bufferSource.buffer = buffer;
            bufferSource.connect(bufferGain);
            bufferGain.connect(this.audioContext.destination);
            bufferGain.gain.setValueAtTime(0, this.audioContext.currentTime);

            bufferSource.start(this.audioContext.currentTime);

            sources.push({ bufferSource, bufferGain });

            console.log('🔊 Silent audio played to unlock Web Audio API');
            console.log('🔊 AudioContext state after unlock:', this.audioContext.state);

            // Also unlock speech synthesis
            this.unlockSpeechSynthesis();

        } catch (error) {
            console.warn('Failed to unlock audio API:', error);
        }
    }

    // Unlock speech synthesis on mobile
    unlockSpeechSynthesis() {
        if (!this.synth || !('speechSynthesis' in window)) {
            console.warn('Speech synthesis not available');
            return;
        }

        try {
            console.log('🔊 Unlocking speech synthesis...');

            // Create a very short, quiet utterance to unlock TTS
            const unlockUtterance = new SpeechSynthesisUtterance(' ');
            unlockUtterance.volume = 0.01;
            unlockUtterance.rate = 10;
            unlockUtterance.pitch = 0.1;

            unlockUtterance.onstart = () => {
                console.log('🔊 Speech synthesis unlocked successfully');
                // Immediately cancel the unlock utterance
                this.synth.cancel();
            };

            unlockUtterance.onerror = (error) => {
                console.warn('Speech synthesis unlock error:', error);
            };

            this.synth.speak(unlockUtterance);

        } catch (error) {
            console.warn('Failed to unlock speech synthesis:', error);
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
        // Create enhanced synthetic sound effects using Web Audio API
        const effects = {
            'question_reveal': () => this.createEnhancedTone(440, 0.8, 'sine', 'reveal'),
            'answer_select': () => this.createEnhancedTone(800, 0.15, 'sine', 'select'),
            'correct_answer': () => this.createSuccessChord(),
            'wrong_answer': () => this.createErrorSound(),
            'lifeline_use': () => this.createSparkleEffect(),
            'timer_tick': () => this.createEnhancedTone(600, 0.08, 'triangle', 'tick'),
            'timer_warning': () => this.createPulsingTone(1000, 0.3),
            'game_over': () => this.createGameOverSequence(),
            'victory': () => this.createVictoryFanfare(),
            'level_up': () => this.createLevelUpSound(),
            'final_answer': () => this.createTensionBuild(),
            'menu_hover': () => this.createEnhancedTone(750, 0.1, 'sine', 'hover')
        };
        
        for (const [name, generator] of Object.entries(effects)) {
            try {
                this.soundBuffers.set(name, generator);
                console.log(`Preloaded enhanced sound effect: ${name}`);
            } catch (error) {
                console.warn(`Failed to preload ${name}:`, error);
            }
        }
    }
    
    // Enhanced tone creation with filters and envelopes
    createEnhancedTone(frequency, duration, type = 'sine', style = 'default') {
        return () => {
            if (!this.audioContext || this.audioContext.state !== 'running' || this.isMuted || !this.sfxEnabled) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filterNode = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            oscillator.frequency.setValueAtTime(frequency, now);
            oscillator.type = type;
            
            // Configure filter based on style
            switch(style) {
                case 'reveal':
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(2000, now);
                    filterNode.frequency.exponentialRampToValueAtTime(4000, now + duration);
                    break;
                case 'select':
                    filterNode.type = 'bandpass';
                    filterNode.frequency.setValueAtTime(1500, now);
                    filterNode.Q.setValueAtTime(10, now);
                    break;
                case 'tick':
                    filterNode.type = 'highpass';
                    filterNode.frequency.setValueAtTime(300, now);
                    break;
                case 'hover':
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(3000, now);
                    break;
                default:
                    filterNode.type = 'lowpass';
                    filterNode.frequency.setValueAtTime(5000, now);
            }
            
            // Enhanced envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
        };
    }
    
    // Success chord with harmony
    createSuccessChord() {
        return () => {
            if (!this.audioContext || this.audioContext.state !== 'running' || this.isMuted || !this.sfxEnabled) return;
            
            const frequencies = [523.25, 659.25, 783.99]; // C5 major chord
            const now = this.audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(3000, now);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
                    
                    osc.start(now);
                    osc.stop(now + 1.2);
                }, index * 80);
            });
        };
    }
    
    // Error sound with descending tone
    createErrorSound() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.exponentialRampToValueAtTime(200, now + 0.5);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            
            osc.start(now);
            osc.stop(now + 0.5);
        };
    }
    
    // Sparkle effect for lifelines
    createSparkleEffect() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const frequencies = [1000, 1200, 1500, 1800, 2000];
            const now = this.audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    
                    filter.type = 'bandpass';
                    filter.frequency.setValueAtTime(freq * 1.5, now);
                    filter.Q.setValueAtTime(8, now);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(this.volume * 0.1, now + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                    
                    osc.start(now);
                    osc.stop(now + 0.3);
                }, index * 60);
            });
        };
    }
    
    // Pulsing tone for warnings
    createPulsingTone(frequency, duration) {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const tremolo = this.audioContext.createOscillator();
            const tremoloGain = this.audioContext.createGain();
            
            osc.connect(gain);
            tremolo.connect(tremoloGain);
            tremoloGain.connect(gain.gain);
            gain.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(frequency, now);
            
            tremolo.type = 'sine';
            tremolo.frequency.setValueAtTime(8, now); // 8 Hz tremolo
            tremoloGain.gain.setValueAtTime(this.volume * 0.1, now);
            
            gain.gain.setValueAtTime(this.volume * 0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            osc.start(now);
            tremolo.start(now);
            osc.stop(now + duration);
            tremolo.stop(now + duration);
        };
    }
    
    // Victory fanfare
    createVictoryFanfare() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const melody = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            const now = this.audioContext.currentTime;
            
            melody.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    const filter = this.audioContext.createBiquadFilter();
                    
                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now);
                    
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(4000, now);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                    
                    osc.start(now);
                    osc.stop(now + 0.4);
                }, index * 150);
            });
        };
    }
    
    // Level up sound
    createLevelUpSound() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
            const now = this.audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                const filter = this.audioContext.createBiquadFilter();
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.audioContext.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + index * 0.1);
                
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(6000, now);
                
                gain.gain.setValueAtTime(0, now + index * 0.1);
                gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + index * 0.1 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.6);
                
                osc.start(now + index * 0.1);
                osc.stop(now + index * 0.1 + 0.6);
            });
        };
    }
    
    // Game over sequence
    createGameOverSequence() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const frequencies = [440, 415.30, 392, 369.99]; // A4 to F#4
            const now = this.audioContext.currentTime;
            
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, now);
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                    
                    osc.start(now);
                    osc.stop(now + 0.5);
                }, index * 300);
            });
        };
    }
    
    // Tension build for final answer
    createTensionBuild() {
        return () => {
            if (!this.audioContext || this.isMuted || !this.sfxEnabled) return;
            
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(130.81, now); // C3
            osc.frequency.exponentialRampToValueAtTime(261.63, now + 2); // C4
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, now);
            filter.frequency.exponentialRampToValueAtTime(1200, now + 2);
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.1);
            gain.gain.setValueAtTime(this.volume * 0.2, now + 1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
            
            osc.start(now);
            osc.stop(now + 2);
        };
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
    async playSFX(name) {
        if (!this.sfxEnabled || this.isMuted || !this.soundBuffers.has(name)) {
            return;
        }
        
        // Ensure AudioContext is ready (important for mobile)
        const isReady = await this.ensureAudioContext();
        if (!isReady) {
            console.warn(`AudioContext not ready for playing ${name}`);
            return;
        }

        try {
            const soundGenerator = this.soundBuffers.get(name);
            soundGenerator();
        } catch (error) {
            console.warn(`Failed to play sound effect ${name}:`, error);
        }
    }
    
    // Text-to-Speech functionality with improved quality and mobile fixes
    speak(text, language = null, forceInterrupt = false) {
        if (!this.ttsEnabled || this.isMuted || !this.synth) {
            return Promise.resolve();
        }
        
        // Don't interrupt ongoing speech unless forced
        if (this.isSpeaking && !forceInterrupt) {
            console.log('TTS already speaking, skipping:', text.substring(0, 50));
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // iOS Safari TTS fix: Cancel and wait a bit before starting new speech
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (forceInterrupt || !this.isSpeaking) {
                this.synth.cancel();

                // iOS needs a small delay after cancel before new speech
                if (isIOS) {
                    setTimeout(() => {
                        this.startSpeech(text, language, resolve, reject);
                    }, 100);
                } else {
                    this.startSpeech(text, language, resolve, reject);
                }
            } else {
                this.startSpeech(text, language, resolve, reject);
            }
        });
    }

    // Helper method to start speech synthesis
    startSpeech(text, language, resolve, reject) {
        this.isSpeaking = true;

        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = language || this.currentLanguage;

        // Find appropriate voice with better selection
        const voice = this.findBestVoice(targetLang);
        if (voice) {
            utterance.voice = voice;
            console.log(`Using voice: ${voice.name} (${voice.lang})`);
        }

        // Enhanced speech settings for better quality
        utterance.lang = targetLang === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.85;        // Slightly slower for clarity
        utterance.pitch = 1.1;        // Slightly higher pitch for warmth
        utterance.volume = this.volume;

        // Add slight pause before important words
        const enhancedText = this.enhanceTextForSpeech(text, targetLang);
        utterance.text = enhancedText;

        utterance.onend = () => {
            this.isSpeaking = false;
            resolve();
        };
        utterance.onerror = (error) => {
            console.warn('TTS error:', error);
            this.isSpeaking = false;
            resolve(); // Don't fail the game if TTS fails
        };

        // Add a timeout to prevent hanging
        setTimeout(() => {
            if (this.isSpeaking) {
                this.synth.cancel();
                this.isSpeaking = false;
                resolve();
            }
        }, 15000); // Increased timeout for longer questions

        this.synth.speak(utterance);
    }
    
    // Enhanced voice selection for better quality
    findBestVoice(language) {
        console.log(`AudioManager: Finding voice for language ${language}`);
        console.log(`Available voices:`, this.voices.map(v => `${v.name} (${v.lang})`));

        const langPrefix = language === 'hi' ? 'hi' : 'en';
        
        // Preferred voice names for better quality
        const preferredVoices = {
            'en': ['Google US English', 'Microsoft Zira', 'Alex', 'Samantha', 'Karen'],
            'hi': ['Google हिन्दी', 'Microsoft Hemant', 'Microsoft Kalpana', 'Lekha', 'Google Hindi']
        };
        
        // First, try to find a preferred high-quality voice
        const voiceList = preferredVoices[language] || preferredVoices['en'];
        for (const voiceName of voiceList) {
            const voice = this.voices.find(v => v.name.includes(voiceName));
            if (voice) {
                console.log(`AudioManager: Found preferred voice: ${voice.name} (${voice.lang})`);
                return voice;
            }
        }
        
        // Fallback: find any voice that starts with the language code
        let voice = this.voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
        if (voice) {
            console.log(`AudioManager: Found fallback voice: ${voice.name} (${voice.lang})`);
            return voice;
        }
        
        // If not found, try to find any voice containing the language
        voice = this.voices.find(v => v.lang.toLowerCase().includes(langPrefix));
        if (voice) {
            console.log(`AudioManager: Found secondary fallback voice: ${voice.name} (${voice.lang})`);
            return voice;
        }
        
        // Final fallback: use system default
        if (this.voices.length > 0) {
            voice = this.voices.find(v => v.default) || this.voices[0];
            console.log(`AudioManager: Using final fallback voice: ${voice.name} (${voice.lang})`);
            return voice;
        }
        
        console.warn(`AudioManager: No voices available for language ${language}`);
        return null;
    }
    
    // Enhance text for better speech quality
    enhanceTextForSpeech(text, language) {
        let enhanced = text;
        
        if (language === 'hi') {
            // For Hindi, add pauses after common question words
            enhanced = enhanced.replace(/क्या/g, 'क्या, ');
            enhanced = enhanced.replace(/कौन/g, 'कौन, ');
            enhanced = enhanced.replace(/कहाँ/g, 'कहाँ, ');
            enhanced = enhanced.replace(/कब/g, 'कब, ');
        } else {
            // For English, add natural pauses
            enhanced = enhanced.replace(/\?/g, '?');
            enhanced = enhanced.replace(/\./g, '. ');
            enhanced = enhanced.replace(/,/g, ', ');
            
            // Add pauses after question words
            enhanced = enhanced.replace(/\b(What|Where|When|Who|How|Why)\b/gi, '$1, ');
            
            // Handle numbers for better pronunciation
            enhanced = enhanced.replace(/\b(\d+)\b/g, ' $1 ');
        }
        
        return enhanced.trim();
    }
    
    // Stop all audio
    stopAll() {
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
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
    
    // Set language for TTS
    setLanguage(language) {
        console.log(`AudioManager: Setting language to ${language}`);

        // Stop any current speech
        if (this.synth) {
            this.synth.cancel();
            this.isSpeaking = false;
        }

        this.currentLanguage = language;

        // Test the voice for the new language
        const voice = this.findBestVoice(language);
        if (voice) {
            console.log(`AudioManager: Found voice for ${language}: ${voice.name} (${voice.lang})`);

            // Test speech with the new voice
            this.testVoice(language, voice);

            return true;
        } else {
            console.warn(`AudioManager: No suitable voice found for ${language}`);
            return false;
        }
    }

    // Test voice with a sample phrase
    testVoice(language, voice) {
        if (!this.ttsEnabled || this.isMuted) return;

        const testPhrases = {
            'en': 'Language switched to English',
            'hi': 'भाषा हिंदी में बदल गई'
        };

        const testPhrase = testPhrases[language] || testPhrases['en'];

        // Create test utterance
        const utterance = new SpeechSynthesisUtterance(testPhrase);
        utterance.voice = voice;
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = this.volume * 0.7; // Quieter test

        utterance.onstart = () => {
            console.log(`AudioManager: Test voice started for ${language}`);
        };

        utterance.onend = () => {
            console.log(`AudioManager: Test voice completed for ${language}`);
        };

        utterance.onerror = (error) => {
            console.warn(`AudioManager: Test voice error for ${language}:`, error);
        };

        // Short delay to ensure previous speech is fully cancelled
        setTimeout(() => {
            this.synth.speak(utterance);
        }, 100);
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
