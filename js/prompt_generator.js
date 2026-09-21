/**
 * プロンプト生成およびタイムライン計算エンジン
 */
import { MOODS, INSTRUMENTS, SFX, KEYS, DENSITY, RESTRAINT_OPTS, RESTRAINT_LEVELS, DURATIONS, NEGATIVE_OPTIONS } from './data.js';

/**
 * リストを自然な文に結合
 */
function joinList(arr, lang) {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (lang === 'ja') return arr.join('、');
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

function pick(items, ids) {
  return ids.map(id => items.find(i => i.id === id)).filter(Boolean);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

/**
 * 構成タイムラインのデータ生成
 */
export function buildTimelineData(state) {
  const durationDef = DURATIONS.find(d => d.id === state.duration) || DURATIONS[2];
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const lang = state.lang;
  const useSfx = state.density !== 'none' && sfx.length > 0;
  const restrained = state.restraintLevel !== 'none' || state.restraint.size > 0;

  const coreInsts = insts.length ? insts : [{ ja: '8bit矩形波リード', en: 'an 8-bit square lead' }];
  const sfxA = sfx[0] || { ja: '決定/カーソル音', en: 'a menu-confirm blip' };
  const sfxB = sfx[1] || sfx[0] || { ja: 'キラキラ音', en: 'a sparkle chime' };

  if (durationDef.sec === null) {
    return {
      isSeamless: true,
      sections: [],
      message: lang === 'ja'
        ? 'シームレスループ前提のため固定のタイムラインはありません。プロンプトのみ音楽生成AIに渡してください。'
        : 'No fixed timeline — this track is designed for seamless looping. Pass the prompt directly to the music AI.'
    };
  }

  let sections = [];
  if (durationDef.stinger) {
    sections = lang === 'ja' ? [
      { label: 'アタック (立ち上がり)', ratio: 0.35, desc: `${coreInsts.map(i => i.ja).join('・')}で一気に立ち上がる。` },
      { label: 'ピーク (最高潮)', ratio: 0.35, desc: useSfx ? `盛り上がりの頂点に${sfxA.ja}を配置。` : '一番の盛り上がりとメロディの提示。' },
      { label: '着地 (終了・余韻)', ratio: 0.30, desc: useSfx ? `短く着地し${sfxB.ja}で締める。` : '潔く短く着地して完結。' }
    ] : [
      { label: 'Attack (Entrance)', ratio: 0.35, desc: `Sharp entrance driven by ${coreInsts.map(i => i.en).join(', ')}.` },
      { label: 'Peak (Highlight)', ratio: 0.35, desc: useSfx ? `High energy accent with ${sfxA.en}.` : 'Peak focal point and main motif.' },
      { label: 'Landing (Cadence)', ratio: 0.30, desc: useSfx ? `Crisp resolution accented with ${sfxB.en}.` : 'Clean and crisp final resolution.' }
    ];
  } else {
    sections = lang === 'ja' ? [
      { label: 'イントロ (導入)', ratio: 0.15, desc: `${coreInsts.map(i => i.ja).join('・')}が入ってくる短い導入部。` },
      { label: 'メインループ (主旋律)', ratio: 0.50, desc: useSfx ? `安定したリズムと主題。時々${sfxA.ja}が挟まる。` : '安定したリズムと主旋律のループ。' },
      { label: '変化/フィル (展開)', ratio: 0.20, desc: restrained
        ? (useSfx ? `盛り上げすぎず一部音色のみ抜き差し、${sfxB.ja}を控えめなアクセントに。` : '音圧やテンポは変えず、一部の音色のみ控えめに抜き差しして変化をつける。')
        : (useSfx ? `音色を抜き差しして適度に変化をつけ、${sfxB.ja}で装飾。` : '楽器のレイヤーを適度に切り替えてバリエーションを提示。') },
      { label: 'ループ地点 (折り返し)', ratio: 0.15, desc: '先頭へシームレスに繋ぐための短いブリッジ処理。' }
    ] : [
      { label: 'Intro (Stinger)', ratio: 0.15, desc: `Short opening layer starting with ${coreInsts.map(i => i.en).join(', ')}.` },
      { label: 'Main Loop (Theme)', ratio: 0.50, desc: useSfx ? `Steady game groove, sprinkled occasionally with ${sfxA.en}.` : 'Steady thematic groove and melody.' },
      { label: 'Variation / Fill', ratio: 0.20, desc: restrained
        ? (useSfx ? `Light instrument changes without raising intensity, subtly accented by ${sfxB.en}.` : 'Subtle timbre variation without increasing dynamics or intensity.')
        : (useSfx ? `Dynamic layer rotation accented by ${sfxB.en}.` : 'Moderate arrangement variation.') },
      { label: 'Loop Point (Turnaround)', ratio: 0.15, desc: 'Smooth bridge designed to cycle back to the beginning seamlessly.' }
    ];
  }

  let currentTime = 0;
  const computedSections = sections.map(sec => {
    const startSec = currentTime;
    const duration = durationDef.sec * sec.ratio;
    currentTime += duration;
    return {
      ...sec,
      timeFormatted: fmtTime(startSec),
      durationSec: Math.round(duration)
    };
  });

  return {
    isSeamless: false,
    sections: computedSections,
    totalSeconds: durationDef.sec
  };
}

/**
 * プロンプト本文の組み立て
 */
export function buildPrompt(state) {
  const moods = pick(MOODS, [...state.moods]);
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const key = KEYS[state.key] || KEYS.bright_major;
  const density = DENSITY[state.density] || DENSITY.occasional;
  const restraintOpts = pick(RESTRAINT_OPTS, [...state.restraint]);
  const restraintLevelText = RESTRAINT_LEVELS[state.restraintLevel] || RESTRAINT_LEVELS.none;
  const hasRestraint = state.restraintLevel !== 'none' || restraintOpts.length > 0;
  const aiTarget = state.aiTarget || 'flow';

  let prompt = '';

  const title = (state.trackTitle || '').trim();

  if (state.lang === 'ja') {
    const moodText = moods.length ? moods.map(m => m.ja).join('・') : '落ち着いたゲームミュージック';
    const instText = insts.length ? joinList(insts.map(i => i.ja), 'ja') : 'レトロなチップチューン編成';
    const sfxText = sfx.length && state.density !== 'none'
      ? `、${density.ja}${joinList(sfx.map(s => s.ja), 'ja')}のような効果音を挟む`
      : '';
    
    let restraintText = '';
    if (hasRestraint) {
      const base = restraintLevelText.ja || '不要な盛り上がりは作らないでほしい。';
      const extra = restraintOpts.length ? `具体的には、${joinList(restraintOpts.map(r => r.ja), 'ja')}こと。` : '';
      restraintText = ` ${base}${extra}`;
    }

    const titlePrefix = title ? `曲名「${title}」の世界観を表現した、` : '';

    if (aiTarget === 'suno_udio') {
      const headerTitle = title ? `[タイトル: ${title}] ` : '';
      prompt = `${headerTitle}[スタイル: 8-bit チップチューン, ${state.tempo} BPM, ${key.baseNote}調]\n` +
        `${titlePrefix}ゲームBGM。雰囲気は${moodText}。` +
        `編成: ${instText}。${key.ja}を使用${sfxText}。${restraintText}`;
    } else {
      prompt = `${titlePrefix}テンポ${state.tempo}BPMのゲームBGM。${moodText}な雰囲気。` +
        `編成は${instText}を中心に、${key.ja}を使用${sfxText}。${restraintText}`;
    }

    // タイムラインの埋め込みオプションが有効な場合
    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\n【構成タイムライン指示】\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  } else {
    // 英語プロンプト
    const moodText = moods.length ? joinList(moods.map(m => m.enShort), 'en') : 'a classic video game vibe';
    const instText = insts.length ? joinList(insts.map(i => i.en), 'en') : 'retro chiptune instrumentation';
    const sfxText = sfx.length && state.density !== 'none'
      ? ` ${density.en.charAt(0).toUpperCase() + density.en.slice(1)}, sprinkle in ${joinList(sfx.map(s => s.en), 'en')}.`
      : '';
    
    let restraintText = '';
    if (hasRestraint) {
      const base = restraintLevelText.en || 'Please avoid building up to an unnecessary climax.';
      const extra = restraintOpts.length ? ` Specifically: ${joinList(restraintOpts.map(r => r.en), 'en')}.` : '';
      restraintText = ` ${base}${extra}`;
    }

    const titleThemed = title ? ` themed around "${title}",` : '';

    if (aiTarget === 'suno_udio') {
      const headerTitle = title ? `[Title: ${title}] ` : '';
      prompt = `${headerTitle}[Genre: 8-bit Chiptune, Video Game OST] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote} ${key.scaleType}]\n` +
        `A video game track${titleThemed} with ${moodText}. Built around ${instText}, featuring ${key.en}.${sfxText}${restraintText}`;
    } else {
      prompt = `A ${state.tempo} BPM video game background music track${titleThemed} with ${moodText}. ` +
        `Built around ${instText}, with ${key.en}.${sfxText}${restraintText}`;
    }

    // タイムライン埋め込み
    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\nStructure Timeline:\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  }

  return prompt.trim();
}

/**
 * ネガティブプロンプトの組み立て
 */
export function buildNegativePrompt(state) {
  const selectedNegatives = pick(NEGATIVE_OPTIONS, [...state.negatives]);
  if (selectedNegatives.length === 0) return '';

  if (state.lang === 'ja') {
    return selectedNegatives.map(n => n.ja).join('、') + 'は含めないこと。';
  }
  return selectedNegatives.map(n => n.en).join(', ');
}
