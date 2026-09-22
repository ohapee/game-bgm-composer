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

  // スケールごとのピッチ周波数テーブル (Hz) とベース音の定義
  getScaleData(keyId) {
    // keyId が直接渡されても、またはプレフィックスなしでも解決できるようにする
    const normalizedKey = (keyId || 'bright_major').toLowerCase();

    if (normalizedKey.includes('kawaii') || normalizedKey === 'kawaii_major7') {
      // Fメジャー7th (甘くドリーミーなKawaii・パステル感: F, A, C, E, G, A, C, E)
      return {
        freqs: [349.23, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50, 1318.51],
        rootBass: 174.61,   // F3
        fifthBass: 261.63   // C4
      };
    }

    if (normalizedKey.includes('minor') || normalizedKey === 'tense_minor') {
      // Aマイナー (暗く緊迫したダンジョン・戦闘)
      return {
        freqs: [220.00, 261.63, 293.66, 329.63, 349.23, 440.00, 523.25, 659.25],
        rootBass: 110.00,   // A2
        fifthBass: 164.81   // E3
      };
    }

    if (normalizedKey.includes('penta') || normalizedKey === 'cute_penta') {
      // D民謡/和風陽旋法 (和風・かわいい・ポップ感: D, F, G, A, C, D)
      return {
        freqs: [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99],
        rootBass: 146.83,   // D3
        fifthBass: 220.00   // A3
      };
    }

    if (normalizedKey.includes('dim') || normalizedKey === 'eerie_dim') {
      // Bディミニッシュ (短3度の積み重ねによる不穏・怪奇・ボス戦)
      return {
        freqs: [246.94, 293.66, 349.23, 415.30, 493.88, 587.33, 698.46, 830.61],
        rootBass: 123.47,   // B2
        fifthBass: 174.61   // F3 (減5度による強烈な不協和音)
      };
    }

    if (normalizedKey.includes('dorian') || normalizedKey === 'heroic_dorian') {
      // Dドリアン旋法 (中世ファンタジー・勇壮・冒険)
      return {
        freqs: [220.00, 246.94, 261.63, 293.66, 329.63, 392.00, 440.00, 493.88],
        rootBass: 146.83,   // D3
        fifthBass: 220.00   // A3
      };
    }

    // デフォルト: Cメジャー (明るいメジャー、高揚感)
    return {
      freqs: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25],
      rootBass: 130.81,     // C3
      fifthBass: 196.00     // G3
    };
  }

  // 8bit矩形波リードの単音再生
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
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.45, time);
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

  // 8bitノイズスネア (ホワイトノイズ + ハイパスフィルター)
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
      const bpm = Math.max(50, Number(state.tempo) || 120);
      // 16分音符の秒数
      const stepDuration = (60 / bpm) / 4;
      const now = this.ctx.currentTime;
      const step = this.currentStep;

      // 現在選択されている調性データ（音階・ベース周波数）を毎ステップ取得
      const scaleData = this.getScaleData(state.key);
      const freqs = scaleData.freqs;

      const isSparse = state.moods && (state.moods.has('sparse_notes') || state.moods.has('minimalism'));
      const isKawaii = state.moods && state.moods.has('hyper_kawaii');

      // 16ステップ（4拍分）のシーケンスパターン
      if (isSparse) {
        // --- ミニマム・音数最小限パターン (間と余白を贅沢に活かしたサウンド) ---
        // 1. ドラム: 1小節に1回の極めて控えめなソフトキックと、遠くのハイハットのみ
        if (step === 0) {
          this.playKick(now);
        } else if (step === 8) {
          this.playHihat(now);
        }

        // 2. ベース: 小節頭でのみふわっと優しく支える
        if (step === 0) {
          this.playTriangleBass(scaleData.rootBass, now, stepDuration * 6);
        }

        // 3. メロディ: 16分音符を埋め尽くさず、ポツリ…ポツリ…と余白を残して響かせる
        // 16ステップ中、わずか3音のみ発音
        if (step === 2 || step === 6 || step === 12) {
          const sparseIdx = step === 2 ? 0 : (step === 6 ? 4 : 7);
          let freq = freqs[sparseIdx % freqs.length];
          if (isKawaii) freq *= 1.5; // よりキュートで透明感のあるピッチ
          this.playSquareTone(freq, now, stepDuration * 2.5, 0.14);
        }
      } else {
        // --- 通常の8bitアーケードパターン ---
        // 1. ドラムパターン
        if (step % 4 === 0) {
          // 拍の頭: キック
          if (step === 0 || step === 8) this.playKick(now);
          // 2拍目・4拍目: スネア
          if (step === 4 || step === 12) this.playSnare(now);
        }
        if (step % 2 === 0) {
          this.playHihat(now);
        }

        // 2. ベースパターン (8分音符間隔でルート音と第5音を刻む)
        if (step % 2 === 0) {
          const bassNote = (step === 8 || step === 10) ? scaleData.fifthBass : scaleData.rootBass;
          this.playTriangleBass(bassNote, now, stepDuration * 1.8);
        }

        // 3. アルペジオメロディ (16分音符でスケール音をピコピコ刻む)
        const arpeggioIdx = [0, 2, 4, 7, 5, 4, 2, 1, 0, 3, 5, 7, 6, 4, 3, 1][step % 16];
        let freq = freqs[arpeggioIdx % freqs.length];
        if (isKawaii) freq *= (step % 4 === 0 ? 1 : 1.25);
        this.playSquareTone(freq, now, stepDuration * 0.9, 0.18);
      }

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
