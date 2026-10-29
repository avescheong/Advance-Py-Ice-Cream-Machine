/* ==========================================================================
   MODULE: WEB AUDIO SYNTHESIZER
   Pure Web Audio API Sound Effects Synthesizer with Extensible Sound Registry.
   ========================================================================== */

(function (window) {
  "use strict";

  let soundEnabled = true;
  let audioCtx = null;
  const soundRegistry = {};

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Register built-in sound synthesizers
  soundRegistry["pop"] = function (ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.11);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  };

  soundRegistry["step"] = function (ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(520, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  soundRegistry["win"] = function (ctx) {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(freq, now + idx * 0.08);
      g.gain.setValueAtTime(0.12, now + idx * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);
      o.start(now + idx * 0.08);
      o.stop(now + idx * 0.08 + 0.22);
    });
  };

  soundRegistry["err"] = function (ctx) {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.18);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  function playSound(type) {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const synth = soundRegistry[type];
      if (synth) {
        synth(ctx);
      }
    } catch (e) {
      // Ignore audio errors on restricted/muted browsers
    }
  }

  function registerSound(name, synthFn) {
    if (typeof synthFn === "function") {
      soundRegistry[name] = synthFn;
    }
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
  }

  function isSoundEnabled() {
    return soundEnabled;
  }

  function setSoundEnabled(val) {
    soundEnabled = !!val;
  }

  // Export module API and global aliases
  window.SoundEngine = {
    play: playSound,
    toggle: toggleSound,
    isEnabled: isSoundEnabled,
    setEnabled: setSoundEnabled,
    registerSound: registerSound
  };

  window.playSound = playSound;
  window.soundEnabled = soundEnabled;
})(window);
