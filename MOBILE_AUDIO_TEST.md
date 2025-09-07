# Mobile Audio Testing Guide - iOS Safari

## Quick Test Checklist for iPhone Safari

### 1. Initial Load Test
- [ ] Open QuizFlow on iPhone Safari
- [ ] Check browser console for any audio-related errors
- [ ] Verify no audio plays automatically (expected behavior)

### 2. Audio Unlock Test
- [ ] Tap "Start New Game" button
- [ ] Check console for "AudioContext unlocked successfully" message
- [ ] Verify AudioContext.state changes from 'suspended' to 'running'

### 3. Sound Effects Test
- [ ] Hover over menu buttons (should trigger audio unlock attempt)
- [ ] Select quiz category - listen for button click sounds
- [ ] Answer a question correctly - verify success sound plays
- [ ] Answer incorrectly - verify error sound plays

### 4. Text-to-Speech Test
- [ ] Ensure TTS is enabled in game settings
- [ ] Start a quiz and verify question is read aloud
- [ ] Check that speech doesn't hang or timeout
- [ ] Test both English and Hindi TTS (if available)

### 5. Audio Context Recovery Test
- [ ] Switch to another app mid-game
- [ ] Return to Safari with QuizFlow
- [ ] Verify audio still works after app switch

## Expected Behaviors

### ✅ Working States
- AudioContext starts as 'suspended' on page load
- First user interaction unlocks audio successfully
- Sound effects play correctly after unlock
- TTS speaks questions with proper timing
- No audio-related console errors

### ❌ Issue Indicators
- Console errors about AudioContext or audio playback
- Silent sound effects after user interaction
- TTS not speaking or hanging indefinitely
- Audio stops working after app switching

## iOS Safari Specific Notes

1. **User Interaction Required**: Audio MUST be triggered by user interaction
2. **AudioContext Suspension**: May suspend when app goes to background
3. **TTS Limitations**: May have voice availability limitations
4. **Autoplay Policy**: Strict - no audio without user gesture

## Debug Console Commands

Test audio context state:
```javascript
console.log('AudioContext state:', window.gameInstance?.audioManager?.audioContext?.state);
```

Test audio unlock:
```javascript
window.gameInstance?.audioManager?.unlockAudioAPI();
```

Test TTS:
```javascript
window.gameInstance?.audioManager?.speak('Test message', 'en');
```

## Fixed Issues Summary

1. ✅ AudioContext suspension on iOS Safari
2. ✅ User interaction requirement for audio unlock
3. ✅ Silent audio file for context initialization
4. ✅ Event listeners for menu interactions
5. ✅ TTS timeout and error handling
6. ✅ Mobile device detection
7. ✅ Async sound effect methods with context checks
