// audio.js - Web Audio API Sound Effects

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let isMuted = false;
let bgmInterval = null;
let isBgmPlaying = false;

// Modern chill arpeggio (Am7 -> Fmaj7 -> Gmaj -> Em7)
const bgmNotes = [
    220.00, 261.63, 329.63, 392.00, // Am7
    174.61, 220.00, 261.63, 349.23, // Fmaj7
    196.00, 246.94, 293.66, 392.00, // Gmaj
    164.81, 196.00, 246.94, 329.63  // Em7
];

// Bass notes corresponding to the root of the arpeggio, plays every 4 notes
const bassNotes = [110.00, 87.31, 98.00, 82.41]; // A2, F2, G2, E2

const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
masterGain.gain.value = 0.6; // slightly louder overall mix

function toggleMute() {
    isMuted = !isMuted;
    if (isMuted) {
        masterGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        stopBGM();
    } else {
        masterGain.gain.exponentialRampToValueAtTime(0.6, audioCtx.currentTime + 0.1);
        startBGM();
    }
    return isMuted;
}

// Added 'attack' parameter to create softer, ambient notes instead of harsh plucks
function playTone(freq, type, duration, vol, attack = 0.01) {
    if (isMuted) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    // Envelope: Soft attack, exponential decay
    gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(vol, audioCtx.currentTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration + 0.1);
}

function playTurnSound(player) {
    if (player === 'X') {
        playTone(880, 'sine', 0.2, 0.4);
        setTimeout(() => playTone(1108, 'sine', 0.3, 0.4), 80);
    } else {
        playTone(440, 'sine', 0.2, 0.4);
        setTimeout(() => playTone(349, 'sine', 0.3, 0.4), 80);
    }
}

function playWinSound() {
    stopBGM();
    const melody = [440, 554, 659, 880, 1108]; // Triumphant major arpeggio extended!
    melody.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 'triangle', 0.4, 0.5, 0.05), i * 120);
    });
    setTimeout(() => {
        playTone(880, 'square', 1.0, 0.4, 0.05); // High triumphant synth
        playTone(440, 'sine', 1.0, 0.6, 0.05);   // Bass support
    }, melody.length * 120);
}

function playDrawSound() {
    stopBGM();
    playTone(300, 'sawtooth', 0.4, 0.3);
    setTimeout(() => playTone(250, 'sawtooth', 0.6, 0.3), 300);
}

function startBGM() {
    if (isMuted || isBgmPlaying) return;
    isBgmPlaying = true;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    let step = 0;
    bgmInterval = setInterval(() => {
        // High soft arpeggio note with a long duration to create an overlapping pad/reverb effect
        playTone(bgmNotes[step], 'sine', 1.5, 0.15, 0.1);
        
        // Bass note every 4 steps (start of a new measure/chord)
        if (step % 4 === 0) {
            playTone(bassNotes[step / 4], 'triangle', 2.0, 0.2, 0.2);
        }
        
        step = (step + 1) % bgmNotes.length;
    }, 300); // 300ms step for a chill, continuous flow
}

function stopBGM() {
    isBgmPlaying = false;
    clearInterval(bgmInterval);
}

// Try to automatically start music (browsers may still require an interaction)
window.addEventListener('DOMContentLoaded', () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startBGM();
});

// Fallback to start audio on the very first click if blocked by browser
const startAudioOnInteract = () => {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    startBGM();
    document.removeEventListener('click', startAudioOnInteract);
};
document.addEventListener('click', startAudioOnInteract);

// Keyboard shortcut 'M' to mute/unmute
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        const muted = toggleMute();
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.innerHTML = muted ? '🔇 Sound Off (M)' : '🔊 Sound On (M)';
        }
    }
});
