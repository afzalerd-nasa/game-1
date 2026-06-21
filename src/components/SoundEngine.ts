// Procedural Web Audio API sound generator for child-safe playful sounds and musical loops.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private currentNotes: string[] = ['C4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5'];
  private isPlayingMusic: boolean = false;
  private volume: number = 0.5; // default scale 0 to 1

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(percent: number) {
    this.volume = Math.max(0, Math.min(1, percent / 100));
  }

  // Play a simple custom oscillator frequency sequence
  private playTone(freqs: number[], durations: number[], type: OscillatorType = 'sine', slide: boolean = false) {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.02);

    let totalDuration = 0;
    freqs.forEach((freq, i) => {
      const noteTime = now + totalDuration;
      const duration = durations[i] || 0.1;
      
      if (slide && i > 0) {
        osc.frequency.exponentialRampToValueAtTime(freq, noteTime + duration);
      } else {
        osc.frequency.setValueAtTime(freq, noteTime);
      }
      totalDuration += duration;
    });

    // Fade out smoothly
    gainNode.gain.setValueAtTime(this.volume * 0.4, now + totalDuration - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

    osc.start(now);
    osc.stop(now + totalDuration + 0.05);
  }

  playJump() {
    // Upward pitch bend (cartoon balloon bounce)
    this.playTone([200, 600], [0.15], 'triangle', true);
  }

  playCollectCoin() {
    // Double high beep (classic NES style)
    this.playTone([880, 1320], [0.08, 0.15], 'sine');
  }

  playCollectStar() {
    // Beautiful twinkling scale
    this.playTone([523.25, 659.25, 783.99, 1046.50], [0.06, 0.06, 0.06, 0.2], 'triangle');
  }

  playCorrect() {
    // Joyful major chord transition
    this.playTone([523.25, 783.99, 1046.50], [0.1, 0.1, 0.3], 'sine');
  }

  playIncorrect() {
    // Disappointed slide-down sound
    this.playTone([220, 147], [0.2, 0.2], 'sawtooth', true);
  }

  playPop() {
    // Short pop (white noise burst + short sine)
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    gainNode.gain.setValueAtTime(this.volume * 0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playSplash() {
    // Gurgling water splash using low frequency sweep
    this.playTone([120, 80, 160], [0.08, 0.08, 0.1], 'triangle', true);
  }

  playRewardBadge() {
    // Celestial heroic fanfare!
    this.playTone([261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50], [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.5], 'sine');
  }

  playRideAnimal() {
    // Interactive cute animal click / trot sound
    this.playTone([220, 330, 220], [0.08, 0.08, 0.08], 'sine');
  }

  // Magical procedural background sound loops
  startBackgroundMusic() {
    if (this.isPlayingMusic) return;
    this.initContext();
    this.isPlayingMusic = true;

    // Standard scale frequencies matching C Major Pentatonic (peaceful, happy, infant-safe)
    const noteFreqs: { [key: string]: number } = {
      C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.00, A4: 440.00,
      C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.00
    };

    // Beautiful rhythmic sequence
    const melodyPattern = [
      'C4', 'E4', 'G4', 'E4', 'A4', 'G4', 'E4', 'D4',
      'C4', 'E4', 'G4', 'A4', 'C5', 'A4', 'G4', 'E4',
      'D4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'C4'
    ];

    let step = 0;
    
    // Play sweet continuous nursery ambient track in background
    this.musicInterval = setInterval(() => {
      this.initContext();
      if (!this.ctx || !this.isPlayingMusic) return;

      const now = this.ctx.currentTime;
      // Skip sometimes to create interesting rhythmic structures
      if (step % 4 === 1 && Math.random() > 0.6) {
        step = (step + 1) % melodyPattern.length;
        return;
      }

      const note = melodyPattern[step];
      const freq = noteFreqs[note];
      
      const osc = this.ctx.createOscillator();
      const oscHarmonic = this.ctx.createOscillator(); // Add warm harmony
      const filter = this.ctx.createBiquadFilter();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle'; // Sweet flute-like sound
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(freq * 1.5, now); // perfect fifth overtone

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc.connect(filter);
      oscHarmonic.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      const noteDuration = 0.35;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.12, now + 0.05);
      gainNode.gain.setValueAtTime(this.volume * 0.12, now + noteDuration - 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + noteDuration);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + noteDuration);
      oscHarmonic.stop(now + noteDuration);

      // Play background bass rhythm on the beat occasionally
      if (step % 4 === 0) {
        const bassFreq = freq / 2;
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassGain.gain.setValueAtTime(0, now);
        bassGain.gain.linearRampToValueAtTime(this.volume * 0.15, now + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        bassOsc.start(now);
        bassOsc.stop(now + 0.45);
      }

      step = (step + 1) % melodyPattern.length;
    }, 450); // happy tempo
  }

  stopBackgroundMusic() {
    this.isPlayingMusic = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Synthesize customized text response utilizing Web Speech Synthesis (Child-friendly audio instructions, completely secure offline!)
  speak(text: string, voiceGuidanceEnabled: boolean) {
    if (!voiceGuidanceEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop talking first
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1.3; // Higher kid-friendly pitch
      utterance.rate = 0.9;  // Slightly slower, clear articulation
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const sound = new SoundEngine();
