/**
 * 簡易8bit音源プレビューエンジン (Web Audio API)
 * 選択中のテンポ・スケールに合わせてリアルタイムにチップチューンを合成・試聴
 */

class AudioPreviewEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.currentStep = 0;
    this.masterGain = null;
    this.volume = 0.2; // 安全な初期音量
    this.noiseBuffer = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.createNoiseBuffer();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  createNoiseBuffer() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.0;
    this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // スケールごとのピッチ周波数テーブル (Hz)
  getScaleFrequencies(scaleType) {
    switch (scaleType) {
      case 'minor':
        // Aマイナーペンタ/ナチュラルマイナー: A3, C4, D4, E4, G4, A4, C5, E5
        return [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 659.25];
      case 'cute_penta':
        // C陽音ペンタトニック: C4, D4, E4, G4, A4, C5, D5, G5
        return [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 783.99];
      case 'diminished':
        // Bディミニッシュ: B3, D4, F4, Ab4, B4, D5, F5, Ab5
        return [246.94, 293.66, 349.23, 415.30, 493.88, 587.33, 698.46, 830.61];
      case 'dorian':
        // Dドリアン: D3, F3, G3, A3, C4, D4, F4, A4
        return [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 440.00];
      case 'major':
      default:
        // Cメジャーペンタ: C4, E4, G4, A4, B4, C5, E5, G5
        return [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 659.25, 783.99];
    }
  }

  // 8bit矩形波の単音再生
  playSquareTone(freq, time, duration, gainLevel = 0.25) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainLevel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // 8bit三角波ベースの再生
  playTriangleBass(freq, time, duration) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq / 2, time); // 1オクターブ下

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // 8bitキックドラム (ピッチ急降下サイン波)
  playKick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.12);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  // 8bitノイズスネア (ホワイトノイズ + 短いエンベロープ)
  playSnare(time) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.1);
  }

  // 8bitハイハット
  playHihat(time) {
    if (!this.ctx || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  // ループ再生の開始
  start(getStateFn, onStepCallback) {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const scheduleNext = () => {
      if (!this.isPlaying) return;

      const state = getStateFn();
      const bpm = Number(state.tempo) || 120;
      // 16分音符の秒数
      const stepDuration = (60 / bpm) / 4;
      const now = this.ctx.currentTime;
      const step = this.currentStep;

      const scaleType = state.key ? state.key.replace('bright_', '').replace('tense_', '').replace('cute_', '').replace('eerie_', '').replace('heroic_', '') : 'major';
      const freqs = this.getScaleFrequencies(scaleType);

      // 16ステップ（4拍分）のシーケンスパターン
      // ドラムパターン
      if (step % 4 === 0) {
        // 拍の頭: キック
        if (step === 0 || step === 8) this.playKick(now);
        if (step === 4 || step === 12) this.playSnare(now);
      }
      if (step % 2 === 0) {
        this.playHihat(now);
      }

      // ベースパターン (8分音符間隔)
      if (step % 2 === 0) {
        const rootFreq = freqs[0];
        const fifthFreq = freqs[2] || freqs[0];
        const bassNote = (step === 8 || step === 10) ? fifthFreq : rootFreq;
        this.playTriangleBass(bassNote, now, stepDuration * 1.8);
      }

      // アルペジオメロディ (16分音符)
      const arpeggioIdx = [0, 2, 4, 7, 5, 4, 2, 1, 0, 3, 5, 7, 6, 4, 3, 1][step % 16];
      const freq = freqs[arpeggioIdx % freqs.length];
      this.playSquareTone(freq, now, stepDuration * 0.9, 0.18);

      if (onStepCallback) {
        onStepCallback(step % 16);
      }

      this.currentStep = (this.currentStep + 1) % 16;
      this.timerId = setTimeout(scheduleNext, stepDuration * 1000);
    };

    scheduleNext();
  }

  // 再生停止
  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle(getStateFn, onStepCallback, onStateChange) {
    if (this.isPlaying) {
      this.stop();
      if (onStateChange) onStateChange(false);
    } else {
      this.start(getStateFn, onStepCallback);
      if (onStateChange) onStateChange(true);
    }
  }
}

export const audioPreview = new AudioPreviewEngine();
