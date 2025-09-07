// Mobile Audio Debug Tool
// Add this to browser console on mobile device to diagnose audio issues

console.log("🔍 MOBILE AUDIO DIAGNOSTIC TOOL");
console.log("================================");

// 1. Basic device detection
console.log("📱 Device Information:");
console.log("User Agent:", navigator.userAgent);
console.log("Is Mobile (AudioManager):", window.audioManager?.isMobile());
console.log("Touch Support:", 'ontouchstart' in window);
console.log("Max Touch Points:", navigator.maxTouchPoints);
console.log("Screen Size:", window.innerWidth + "x" + window.innerHeight);

// 2. AudioContext status
console.log("\n🔊 AudioContext Information:");
if (window.audioManager?.audioContext) {
    const ctx = window.audioManager.audioContext;
    console.log("AudioContext State:", ctx.state);
    console.log("AudioContext Sample Rate:", ctx.sampleRate);
    console.log("AudioContext Current Time:", ctx.currentTime);
    console.log("AudioContext Destination:", ctx.destination);
} else {
    console.log("❌ No AudioContext found");
}

// 3. Speech Synthesis status
console.log("\n🗣️ Speech Synthesis Information:");
if (window.speechSynthesis) {
    console.log("Speech Synthesis Available:", true);
    console.log("Speech Synthesis Speaking:", window.speechSynthesis.speaking);
    console.log("Speech Synthesis Pending:", window.speechSynthesis.pending);
    console.log("Speech Synthesis Paused:", window.speechSynthesis.paused);
    
    const voices = window.speechSynthesis.getVoices();
    console.log("Available Voices:", voices.length);
    voices.forEach(voice => {
        console.log(`  - ${voice.name} (${voice.lang}) ${voice.default ? '[DEFAULT]' : ''}`);
    });
} else {
    console.log("❌ Speech Synthesis not available");
}

// 4. AudioManager status
console.log("\n🎛️ AudioManager Status:");
if (window.audioManager) {
    console.log("Initialized:", window.audioManager.isInitialized);
    console.log("TTS Enabled:", window.audioManager.ttsEnabled);
    console.log("SFX Enabled:", window.audioManager.sfxEnabled);
    console.log("Is Muted:", window.audioManager.isMuted);
    console.log("Is Speaking:", window.audioManager.isSpeaking);
    console.log("Current Language:", window.audioManager.currentLanguage);
    console.log("Volume:", window.audioManager.volume);
    console.log("Sound Buffers:", window.audioManager.soundBuffers?.size || 0);
} else {
    console.log("❌ AudioManager not found");
}

// 5. Test functions
console.log("\n🧪 Test Functions Available:");
console.log("Run these commands to test audio:");
console.log("testMobileAudio() - Test audio unlock");
console.log("testTTS() - Test text-to-speech");
console.log("testSFX() - Test sound effects");
console.log("forceAudioUnlock() - Force audio unlock");

// Test function definitions
window.testMobileAudio = async function() {
    console.log("🧪 Testing mobile audio unlock...");
    
    if (window.audioManager?.audioContext?.state === 'suspended') {
        try {
            await window.audioManager.audioContext.resume();
            console.log("✅ AudioContext resumed");
        } catch (error) {
            console.log("❌ Failed to resume AudioContext:", error);
        }
    }
    
    window.audioManager?.unlockAudioAPI();
    window.audioManager?.unlockSpeechSynthesis();
    
    console.log("AudioContext state after unlock:", window.audioManager?.audioContext?.state);
};

window.testTTS = function() {
    console.log("🧪 Testing TTS...");
    if (window.audioManager) {
        window.audioManager.speak("Mobile audio test message", "en", true);
    } else {
        console.log("❌ AudioManager not available");
    }
};

window.testSFX = function() {
    console.log("🧪 Testing sound effects...");
    if (window.audioManager) {
        window.audioManager.playSFX('correct_answer');
    } else {
        console.log("❌ AudioManager not available");
    }
};

window.forceAudioUnlock = function() {
    console.log("🧪 Force unlocking audio...");
    
    // Simulate user interaction
    const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: [new Touch({
            identifier: 0,
            target: document.body,
            clientX: 100,
            clientY: 100
        })]
    });
    
    document.dispatchEvent(event);
    
    // Also dispatch gameStarted event
    window.dispatchEvent(new CustomEvent('gameStarted'));
    
    console.log("Events dispatched. Check AudioContext state.");
};

// 6. Event listener test
console.log("\n👂 Event Listener Test:");
const testEvents = ['touchstart', 'touchend', 'click', 'pointerdown'];
testEvents.forEach(eventType => {
    document.addEventListener(eventType, function testListener(e) {
        console.log(`📝 Event detected: ${eventType}`, e);
        document.removeEventListener(eventType, testListener);
    }, { once: true, passive: true });
});

console.log("🎯 Tap the screen to test event detection...");

console.log("\n✅ Diagnostic complete! Check the output above for issues.");
console.log("💡 Common issues:");
console.log("   - AudioContext state stuck in 'suspended'");
console.log("   - No voices available for TTS");
console.log("   - Event listeners not firing");
console.log("   - AudioManager not properly initialized");
