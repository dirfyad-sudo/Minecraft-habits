/**
 * synthesized Minecraft retro sound effects using pure Web Audio API
 */

let audioCtx: AudioContext | null = null;
let bgMusicInterval: any = null;
let isMusicPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// 1. Wood Pop (Classic Block Click) - short, poppy
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    // Ignore context blocked
  }
}

// 2. XP Level Up Chime - classic high-pitched rising crystal ding
export function playXPChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;
    
    // Play a series of 5 high frequency notes quickly rising
    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98]; // Mi, Sol, Si, Mi, Sol
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const noteTime = now + index * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    });
  } catch (e) {
    // Ignore
  }
}

// 3. Remove/Defeat sound (Classic Oof/Tear)
export function playHurtSound() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  } catch (e) {
    // Ignore
  }
}

// 4. Cozy Retro Lofi Piano study music tracker - procedurally generated blocks of sound
export function startStudyMelody() {
  if (isMusicPlaying) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    isMusicPlaying = true;

    // Classic minecraft-like calm pentatonic notes
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7 (C E G B)
      [349.23, 440.00, 523.25, 659.25], // Fmaj7 (F A C E)
      [293.66, 349.23, 440.00, 587.33], // Dmin7 (D F A D)
      [392.00, 493.88, 587.33, 783.99]  // G7    (G B D G)
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      const now = ctx.currentTime;
      const currentChord = chords[chordIndex];

      // Soft, lingering synth notes to capture the beautiful calm of Minecraft OST
      currentChord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Stagger note triggers slightly
        const playTime = now + (i * 0.25) + (Math.random() * 0.1);
        osc.frequency.setValueAtTime(freq, playTime);

        // Slow attack and long release
        gain.gain.setValueAtTime(0, playTime);
        gain.gain.linearRampToValueAtTime(0.08, playTime + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, playTime + 4.0);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(playTime);
        osc.stop(playTime + 4.2);
      });

      // Advance
      chordIndex = (chordIndex + 1) % chords.length;
    };

    // Trigger immediately
    playChordStep();
    // Loop every 5.5 seconds
    bgMusicInterval = setInterval(playChordStep, 5500);
  } catch (e) {
    // Ignore
  }
}

export function stopStudyMelody() {
  isMusicPlaying = false;
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
}

export function toggleStudyMelody(): boolean {
  if (isMusicPlaying) {
    stopStudyMelody();
    return false;
  } else {
    startStudyMelody();
    return true;
  }
}

export function isMelodyPlaying(): boolean {
  return isMusicPlaying;
}
