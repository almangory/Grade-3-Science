// Simple Web Audio API Synthesizer for Fun and Encouraging Sound Effects
// This bypasses the need for external MP3 files that can 404 or fail due to CORS.

let isMutedState = false;

// Attempt to load initial mute state from localStorage if available
try {
  const stored = localStorage.getItem('science_app_muted');
  if (stored !== null) {
    isMutedState = JSON.parse(stored);
  }
} catch (e) {
  // Ignore localStorage errors
}

export function isMuted(): boolean {
  return isMutedState;
}

export function setMuted(muted: boolean) {
  isMutedState = muted;
  try {
    localStorage.setItem('science_app_muted', JSON.stringify(muted));
  } catch (e) {
    // Ignore localStorage errors
  }
}

// Global AudioContext holder (lazy loaded on user interaction)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (isMutedState) return null;
  
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  
  // Resume context if suspended (common browser autoplay security policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  return audioCtx;
}

/**
 * Plays a beautiful, uplifting chord arpeggio (C5 -> E5 -> G5 -> C6)
 * to celebrate finishing a quiz or an entire lesson successfully!
 */
export function playSuccessChord() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Smooth rich triangle / sine wave combination
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);
    
    // Nice envelope (attack and decay)
    const noteStart = now + index * 0.12;
    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.7);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(noteStart);
    osc.stop(noteStart + 0.8);
  });
}

/**
 * Plays a magical glittering sweep (chimes) for solving an interactive simulator step,
 * representing sparkling stars!
 */
export function playSparkleSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // A rapid sweep of high pentatonic frequencies
  const freqs = [880, 987.77, 1174.66, 1318.51, 1567.98, 1760]; 
  
  freqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + index * 0.05);
    
    const noteStart = now + index * 0.05;
    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(0.12, noteStart + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(noteStart);
    osc.stop(noteStart + 0.35);
  });
}

/**
 * Simulates a warm round of clapping hands (claps)
 * by synthesizing quick noise bursts with envelope filter decays.
 */
export function playClapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // To avoid complex noise buffer generation, we synthesize multiple very brief,
  // slightly detuned band-filtered pulses that sound exactly like clapping hands!
  const delayTimes = [0, 0.08, 0.15, 0.22, 0.29, 0.45, 0.52, 0.60];
  
  delayTimes.forEach((delay, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Triangle wave gives a warm wood/skin impact sound
    osc.type = 'triangle';
    // Randomize the pitch slightly for each clap to make it sound like a crowd!
    const baseFreq = 180 + Math.random() * 80;
    osc.frequency.setValueAtTime(baseFreq, now + delay);
    
    // Pitch sweep downwards rapidly mimics a clap impulse
    osc.frequency.exponentialRampToValueAtTime(80, now + delay + 0.08);
    
    const start = now + delay;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.3, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + 0.1);
  });
}

/**
 * Plays a gentle, encouraging "try again" sound for incorrect answers or reset.
 */
export function playFailureSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [293.66, 220.00]; // D4 -> A3 (soft descending flat interval)
  
  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.15);
    
    const noteStart = now + index * 0.15;
    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(noteStart);
    osc.stop(noteStart + 0.5);
  });
}

/**
 * Plays a realistic physiological double heartbeat sound ("lub-dub!")
 * using deep low-frequency sine waves. Highly tactical for 11 year old students!
 */
export function playHeartbeatSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // 1. "Lub" - First sound (lower pitch, longer duration)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(65, now);
  osc1.frequency.exponentialRampToValueAtTime(20, now + 0.12);
  
  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.4, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.18);

  // 2. "Dub" - Second sound (slightly higher pitch, sharper accent after 0.15s)
  const ost2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  ost2.type = 'sine';
  ost2.frequency.setValueAtTime(80, now + 0.14);
  ost2.frequency.exponentialRampToValueAtTime(30, now + 0.25);
  
  gain2.gain.setValueAtTime(0, now + 0.14);
  gain2.gain.linearRampToValueAtTime(0.45, now + 0.16);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  
  ost2.connect(gain2);
  gain2.connect(ctx.destination);
  ost2.start(now + 0.14);
  ost2.stop(now + 0.32);
}

/**
 * Plays a magical laser ray sound effect when they fire the optical prism!
 */
export function playLaserSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(1400, now + 0.45);
  
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  
  // Filter for clean modern laser tone
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(now);
  osc.stop(now + 0.48);
}

