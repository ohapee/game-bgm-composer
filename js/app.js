/**
 * ゲームBGMスクリプトコンポーザー - メインアプリケーション制御
 */

import {
  MOODS,
  INSTRUMENTS,
  SFX,
  KEYS,
  DENSITY,
  RESTRAINT_OPTS,
  RESTRAINT_LEVELS,
  DURATIONS,
  NEGATIVE_OPTIONS,
  AI_TARGETS
} from './data.js';

import { buildPrompt, buildNegativePrompt, buildTimelineData } from './prompt_generator.js';
import { audioPreview } from './audio_preview.js';
import {
  saveLastState,
  loadLastState,
  getPresets,
  savePreset,
  deletePreset,
  exportPresetsAsJSON,
  importPresetsFromJSON,
  getShareURL,
  loadFromURLHash
} from './storage.js';

// アプリケーションの状態
const state = {
  moods: new Set(['field']),
  insts: new Set(['square_lead', 'arpeggio', 'fm_bass', 'retro_drums']),
  sfx: new Set(['pico', 'coin', 'jump']),
  density: 'occasional',
  restraintLevel: 'none',
  restraint: new Set(),
  negatives: new Set(['vocals']),
  key: 'bright_major',
  tempo: 120,
  duration: '60',
  lang: 'en',
  aiTarget: 'flow',
  embedTimeline: false
};

// UI通知トースト
function flash(msg) {
  const f = document.getElementById('flash');
  if (!f) return;
  f.textContent = msg;
  f.classList.add('show');
  setTimeout(() => f.classList.remove('show'), 1600);
}

// チップ要素群の生成
function buildChips(container, items, stateSet, onChange) {
  container.innerHTML = '';
  items.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (stateSet.has(item.id) ? ' on' : '');
    b.textContent = item.ja;
    b.title = item.en || '';
    b.addEventListener('click', () => {
      if (stateSet.has(item.id)) {
        stateSet.delete(item.id);
      } else {
        stateSet.add(item.id);
      }
      b.classList.toggle('on');
      onChange();
    });
    container.appendChild(b);
  });
}

// タイムライン描画
function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;

  const tl = buildTimelineData(state);
  container.innerHTML = '';

  if (tl.isSeamless) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = tl.message;
    container.appendChild(note);
    return;
  }

  tl.sections.forEach(sec => {
    const row = document.createElement('div');
    row.className = 'screen-row';
    row.innerHTML = `
      <div class="screen-time pixel">${sec.timeFormatted}</div>
      <div class="screen-body">
        <span class="lab">${sec.label}</span>
        <span class="desc">${sec.desc}</span>
      </div>
    `;
    container.appendChild(row);
  });
}

// プロンプト及びネガティブプロンプトの生成
function generate() {
  const promptOut = document.getElementById('promptOut');
  const negativeOut = document.getElementById('negativeOut');
  const negativeSection = document.getElementById('negativeSection');

  const mainText = buildPrompt(state);
  const negText = buildNegativePrompt(state);

  promptOut.value = mainText;
  promptOut.dataset.generated = '1';

  if (negativeOut) {
    negativeOut.value = negText;
    if (negativeSection) {
      negativeSection.style.display = negText ? 'block' : 'none';
    }
  }

  renderTimeline();
}

function maybeRegenerate() {
  saveLastState(state);
  if (document.getElementById('promptOut').dataset.generated === '1') {
    generate();
  }
}

// プリセットUIの再描画
function renderPresets() {
  const container = document.getElementById('presetChips');
  if (!container) return;
  container.innerHTML = '';

  const presets = getPresets();
  const names = Object.keys(presets);

  if (names.length === 0) {
    const note = document.createElement('span');
    note.className = 'preset-empty';
    note.textContent = '保存されたプリセットはありません';
    container.appendChild(note);
    return;
  }

  names.forEach(name => {
    const item = document.createElement('span');
    item.className = 'preset-item';

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = name;
    b.addEventListener('click', () => {
      applyState(presets[name]);
      generate();
      saveLastState(state);
      flash(`「${name}」を読み込みました`);
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'preset-del';
    del.textContent = '×';
    del.title = '削除';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePreset(name);
      renderPresets();
      flash(`「${name}」を削除しました`);
    });

    item.appendChild(b);
    item.appendChild(del);
    container.appendChild(item);
  });
}

// 状態の適用とUIの同期
function applyState(obj) {
  if (!obj) return;
  state.moods = new Set(obj.moods || []);
  state.insts = new Set(obj.insts || []);
  state.sfx = new Set(obj.sfx || []);
  state.density = obj.density || 'occasional';
  state.restraintLevel = obj.restraintLevel || 'none';
  state.restraint = new Set(obj.restraint || []);
  state.negatives = new Set(obj.negatives || ['vocals']);
  state.key = obj.key || 'bright_major';
  state.tempo = Number(obj.tempo) || 120;
  state.duration = obj.duration || '60';
  state.lang = obj.lang || 'en';
  state.aiTarget = obj.aiTarget || 'flow';
  state.embedTimeline = Boolean(obj.embedTimeline);

  // UIコントロールの同期
  buildChips(document.getElementById('moodChips'), MOODS, state.moods, maybeRegenerate);
  buildChips(document.getElementById('instChips'), INSTRUMENTS, state.insts, maybeRegenerate);
  buildChips(document.getElementById('sfxChips'), SFX, state.sfx, maybeRegenerate);
  buildChips(document.getElementById('restraintChips'), RESTRAINT_OPTS, state.restraint, maybeRegenerate);
  buildChips(document.getElementById('negativeChips'), NEGATIVE_OPTIONS, state.negatives, maybeRegenerate);

  // 長さチップ
  const durationContainer = document.getElementById('durationChips');
  durationContainer.innerHTML = '';
  DURATIONS.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.duration === d.id ? ' on' : '');
    b.textContent = d.label;
    b.addEventListener('click', () => {
      state.duration = d.id;
      [...durationContainer.children].forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      maybeRegenerate();
    });
    durationContainer.appendChild(b);
  });

  document.getElementById('sfxDensity').value = state.density;
  document.getElementById('restraintSelect').value = state.restraintLevel;
  document.getElementById('keySelect').value = state.key;
  document.getElementById('aiTargetSelect').value = state.aiTarget;
  document.getElementById('embedTimelineCheck').checked = state.embedTimeline;

  const tempoRange = document.getElementById('tempoRange');
  const tempoReadout = document.getElementById('tempoReadout');
  tempoRange.value = state.tempo;
  tempoReadout.innerHTML = state.tempo + '<span> BPM</span>';

  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === state.lang);
  });
}

// アプリケーションの初期化
function init() {
  // 保存された状態またはURLパラメータからの読み込み
  const urlState = loadFromURLHash();
  const lastState = loadLastState();
  applyState(urlState || lastState || state);

  // イベントリスナーの登録
  const tempoRange = document.getElementById('tempoRange');
  const tempoReadout = document.getElementById('tempoReadout');
  tempoRange.addEventListener('input', () => {
    state.tempo = tempoRange.value;
    tempoReadout.innerHTML = state.tempo + '<span> BPM</span>';
    maybeRegenerate();
  });

  document.getElementById('sfxDensity').addEventListener('change', (e) => {
    state.density = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('keySelect').addEventListener('change', (e) => {
    state.key = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('restraintSelect').addEventListener('change', (e) => {
    state.restraintLevel = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('aiTargetSelect').addEventListener('change', (e) => {
    state.aiTarget = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('embedTimelineCheck').addEventListener('change', (e) => {
    state.embedTimeline = e.target.checked;
    maybeRegenerate();
  });

  // 言語切替
  document.querySelectorAll('#langToggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#langToggle button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.lang = btn.dataset.lang;
      saveLastState(state);
      generate();
    });
  });

  // スクリプト生成ボタン
  document.getElementById('genBtn').addEventListener('click', generate);

  // 🎲 おまかせ生成
  document.getElementById('randomBtn').addEventListener('click', () => {
    function sampleIds(items, min, max) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      const shuffled = [...items].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, n).map(i => i.id);
    }

    state.moods = new Set(sampleIds(MOODS, 1, 2));
    state.insts = new Set(sampleIds(INSTRUMENTS, 3, 5));
    state.sfx = new Set(sampleIds(SFX, 1, 3));
    state.tempo = 75 + Math.floor(Math.random() * 80);
    const keyIds = Object.keys(KEYS);
    state.key = keyIds[Math.floor(Math.random() * keyIds.length)];

    applyState(state);
    generate();
    saveLastState(state);
    flash('🎲 おまかせ設定を適用しました');
  });

  // リセット
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.moods = new Set(['field']);
    state.insts = new Set(['square_lead', 'arpeggio', 'fm_bass', 'retro_drums']);
    state.sfx = new Set(['pico', 'coin', 'jump']);
    state.density = 'occasional';
    state.restraintLevel = 'none';
    state.restraint = new Set();
    state.negatives = new Set(['vocals']);
    state.key = 'bright_major';
    state.tempo = 120;
    state.duration = '60';
    state.embedTimeline = false;

    applyState(state);
    generate();
    saveLastState(state);
    flash('設定を初期化しました');
  });

  // プリセット保存
  document.getElementById('savePresetBtn').addEventListener('click', () => {
    const input = document.getElementById('presetNameInput');
    const name = input.value.trim();
    if (!name) {
      flash('プリセット名を入力してください');
      return;
    }
    if (savePreset(name, state)) {
      input.value = '';
      renderPresets();
      flash(`「${name}」を保存しました`);
    } else {
      flash('保存に失敗しました');
    }
  });

  // プリセット書き出し
  document.getElementById('exportPresetBtn').addEventListener('click', () => {
    exportPresetsAsJSON();
    flash('プリセットを書き出しました');
  });

  // プリセット読み込み
  const fileInput = document.getElementById('importPresetFile');
  document.getElementById('importPresetBtn').addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importPresetsFromJSON(file, (success, count, errMsg) => {
        if (success) {
          renderPresets();
          flash(`${count} 件のプリセットを取り込みました`);
        } else {
          flash(errMsg || '読み込みに失敗しました');
        }
        fileInput.value = '';
      });
    }
  });

  // URL共有
  document.getElementById('shareUrlBtn').addEventListener('click', async () => {
    const url = getShareURL(state);
    try {
      await navigator.clipboard.writeText(url);
      flash('共有用URLをコピーしました！');
    } catch (e) {
      prompt('以下のURLをコピーしてください:', url);
    }
  });

  // プロンプトコピー
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const out = document.getElementById('promptOut');
    if (!out.value) {
      flash('先にスクリプトを生成してください');
      return;
    }
    try {
      await navigator.clipboard.writeText(out.value);
      flash('プロンプトをコピーしました！');
    } catch (e) {
      out.select();
      document.execCommand('copy');
      flash('コピーしました！');
    }
  });

  // ネガティブプロンプトコピー
  document.getElementById('copyNegBtn')?.addEventListener('click', async () => {
    const out = document.getElementById('negativeOut');
    if (!out.value) return;
    try {
      await navigator.clipboard.writeText(out.value);
      flash('ネガティブ指示をコピーしました！');
    } catch (e) {
      out.select();
      document.execCommand('copy');
      flash('コピーしました！');
    }
  });

  // 簡易8bit音源プレビュアー
  const previewToggleBtn = document.getElementById('previewToggleBtn');
  const previewVolume = document.getElementById('previewVolume');
  const stepLeds = document.querySelectorAll('.step-led');

  previewVolume.addEventListener('input', (e) => {
    audioPreview.setVolume(parseFloat(e.target.value));
  });

  previewToggleBtn.addEventListener('click', () => {
    audioPreview.toggle(
      () => state,
      (activeStep) => {
        stepLeds.forEach((led, idx) => {
          led.classList.toggle('active', idx === activeStep);
        });
      },
      (isPlaying) => {
        if (isPlaying) {
          previewToggleBtn.textContent = '■ 停止';
          previewToggleBtn.classList.add('playing');
        } else {
          previewToggleBtn.textContent = '▶ 8bit音源で試聴 (BPM・調性確認)';
          previewToggleBtn.classList.remove('playing');
          stepLeds.forEach(led => led.classList.remove('active'));
        }
      }
    );
  });

  // CRTスキャンライン切り替え
  const crtBtn = document.getElementById('crtBtn');
  let crtActive = false;
  crtBtn.addEventListener('click', () => {
    crtActive = !crtActive;
    document.body.classList.toggle('crt-enabled', crtActive);
    crtBtn.textContent = crtActive ? 'CRT: ON' : 'CRT: OFF';
    crtBtn.classList.toggle('on', crtActive);
  });

  // テーマ切り替え (AUTO / DARK / LIGHT)
  const themeBtn = document.getElementById('themeBtn');
  let manualTheme = null;
  themeBtn.addEventListener('click', () => {
    if (manualTheme === 'dark') {
      manualTheme = 'light';
    } else if (manualTheme === 'light') {
      manualTheme = null;
    } else {
      manualTheme = 'dark';
    }

    if (manualTheme) {
      document.documentElement.setAttribute('data-theme', manualTheme);
      themeBtn.textContent = manualTheme === 'dark' ? 'DARK SCREEN' : 'LIGHT SCREEN';
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeBtn.textContent = 'AUTO SCREEN';
    }
  });

  renderPresets();
  generate();
  saveLastState(state);
}

// DOM読み込み完了時に起動
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
