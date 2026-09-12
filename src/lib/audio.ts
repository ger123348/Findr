'use client';

/**
 * Utility to play soft, Apple-like synthesized UI sounds
 * using the native Web Audio API.
 */

// Singleton AudioContext to prevent exceeding hardware limits on rapid clicks
let sharedContext: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!sharedContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedContext = new AudioContextClass();
    }
  }
  // Resume context if it was suspended by browser autoplay policies
  if (sharedContext && sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {});
  }
  return sharedContext;
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Increased gain for better volume scaling across devices
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.8, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Soft chime: C5 then E5
    playNote(523.25, now, 0.4); 
    playNote(659.25, now + 0.12, 0.6);
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // slightly harsher tone
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Increased gain
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.6, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Two low, quick descending notes
    playNote(250, now, 0.3);
    playNote(200, now + 0.15, 0.4);
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}

export function playWhooshSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    
    // Create white noise
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Bandpass filter to create the "whoosh" sweep
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.4);
    
    // Increased volume envelope for whoosh
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.6, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.4);
  } catch (e) {
    console.error("Audio playback failed:", e);
  }
}
