# Mobile Audio Troubleshooting Guide

## Quick Mobile Audio Test

**On your mobile device, open the browser console and run:**

```javascript
// Quick audio diagnosis
console.log('Device:', navigator.userAgent);
console.log('Is Mobile:', window.audioManager?.isMobile());
console.log('AudioContext State:', window.audioManager?.audioContext?.state);
console.log('TTS Available:', 'speechSynthesis' in window);
console.log('Voices Count:', window.speechSynthesis?.getVoices().length || 0);

// Force unlock mobile audio
window.audioManager?.forceMobileAudioUnlock();
```

## Step-by-Step Mobile Audio Fix

### Step 1: Manual AudioContext Resume
```javascript
// Try to manually resume AudioContext
if (window.audioManager?.audioContext?.state === 'suspended') {
    window.audioManager.audioContext.resume().then(() => {
        console.log('✅ AudioContext manually resumed');
        console.log('New state:', window.audioManager.audioContext.state);
    });
}
```

### Step 2: Force Audio Unlock
```javascript
// Force unlock all audio systems
window.audioManager?.unlockAudioAPI();
window.audioManager?.unlockSpeechSynthesis();
```

### Step 3: Test Individual Components
```javascript
// Test sound effects
window.audioManager?.playSFX('correct_answer');

// Test text-to-speech
window.audioManager?.speak('Mobile audio test', 'en', true);
```

### Step 4: Simulate User Interaction
```javascript
// Simulate touch event (some browsers need this)
const touchEvent = new TouchEvent('touchstart', {
    bubbles: true,
    cancelable: true
});
document.dispatchEvent(touchEvent);

// Dispatch game started event
window.dispatchEvent(new CustomEvent('gameStarted'));
```

## Common Mobile Audio Issues & Solutions

### Issue 1: AudioContext Stuck in 'suspended'
**Symptoms**: `audioContext.state` shows 'suspended' even after user interaction
**Solution**: 
```javascript
// Force resume with retry
async function forceResume() {
    for (let i = 0; i < 3; i++) {
        if (window.audioManager.audioContext.state === 'suspended') {
            await window.audioManager.audioContext.resume();
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    console.log('Final state:', window.audioManager.audioContext.state);
}
forceResume();
```

### Issue 2: No Voices Available
**Symptoms**: TTS doesn't work, `getVoices()` returns empty array
**Solution**:
```javascript
// Reload voices
window.speechSynthesis.getVoices(); // Trigger voice loading
setTimeout(() => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Voices loaded:', voices.length);
    window.audioManager.loadVoices(); // Reload in AudioManager
}, 1000);
```

### Issue 3: Sound Effects Not Playing
**Symptoms**: No sound effects despite AudioContext being 'running'
**Solution**:
```javascript
// Check if sound buffers are loaded
console.log('Sound buffers:', Array.from(window.audioManager.soundBuffers.keys()));

// Test sound generation directly
window.audioManager.createEnhancedTone(440, 0.5)();
```

### Issue 4: Mobile Browser Specific Issues

#### iOS Safari
```javascript
// iOS Safari sometimes needs multiple unlock attempts
document.addEventListener('touchstart', function iOSUnlock() {
    window.audioManager?.forceMobileAudioUnlock();
    document.removeEventListener('touchstart', iOSUnlock);
}, { once: true });
```

#### Android Chrome
```javascript
// Android Chrome may need gesture-based unlock
document.addEventListener('click', function androidUnlock() {
    window.audioManager?.audioContext?.resume();
    window.audioManager?.unlockAudioAPI();
    document.removeEventListener('click', androidUnlock);
}, { once: true });
```

## Real-Time Mobile Debug Monitor

Add this to console to monitor audio state in real-time:

```javascript
// Real-time audio monitoring
function startAudioMonitor() {
    const monitor = setInterval(() => {
        const status = {
            audioContextState: window.audioManager?.audioContext?.state,
            isSpeaking: window.audioManager?.isSpeaking,
            ttsEnabled: window.audioManager?.ttsEnabled,
            sfxEnabled: window.audioManager?.sfxEnabled,
            isMuted: window.audioManager?.isMuted,
            voicesCount: window.speechSynthesis?.getVoices().length || 0
        };
        console.log('🔊 Audio Status:', status);
    }, 2000);
    
    // Stop monitoring after 30 seconds
    setTimeout(() => clearInterval(monitor), 30000);
}

startAudioMonitor();
```

## Nuclear Option: Complete Audio Reset

If nothing else works, try this complete reset:

```javascript
async function nuclearAudioReset() {
    console.log('🚨 NUCLEAR AUDIO RESET - This will recreate everything');
    
    // Stop all audio
    window.audioManager?.stopAll();
    
    // Cancel speech synthesis
    window.speechSynthesis?.cancel();
    
    // Close existing AudioContext
    if (window.audioManager?.audioContext) {
        await window.audioManager.audioContext.close();
    }
    
    // Recreate AudioContext
    window.audioManager.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Reinitialize audio
    await window.audioManager.initialize();
    
    // Force unlock
    await window.audioManager.forceMobileAudioUnlock();
    
    console.log('🔄 Audio system reset complete');
}

// Call this only if everything else fails
// nuclearAudioReset();
```

## Browser Console Commands Summary

**Quick test commands for mobile debugging:**

```javascript
// 1. Check status
window.audioManager?.getStatus();

// 2. Force unlock
window.audioManager?.forceMobileAudioUnlock();

// 3. Test SFX
window.audioManager?.playSFX('correct_answer');

// 4. Test TTS
window.audioManager?.speak('Test', 'en', true);

// 5. Check AudioContext
console.log(window.audioManager?.audioContext?.state);

// 6. List voices
console.log(window.speechSynthesis?.getVoices().map(v => v.name));
```

---

**Try these steps in order until audio works! Most mobile audio issues are resolved by steps 1-3.**
