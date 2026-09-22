/**
 * ゲームBGMスクリプトコンポーザー - 設定データ定義
 */

// シーン・ムード定義
export const MOODS = [
  { id: 'field', ja: 'フィールド(のどかな冒険)', en: 'a peaceful overworld adventure feel', enShort: 'a peaceful overworld feel' },
  { id: 'dungeon', ja: 'ダンジョン(緊張・探索)', en: 'a tense dungeon-crawling atmosphere', enShort: 'tense dungeon atmosphere' },
  { id: 'boss', ja: 'ボス戦(疾走・緊迫)', en: 'an intense, high-speed boss-battle energy', enShort: 'boss-battle intensity' },
  { id: 'battle', ja: '通常戦闘(軽快・リズミカル)', en: 'a brisk, rhythmic combat and battle groove', enShort: 'brisk battle groove' },
  { id: 'puzzle', ja: 'パズル(コミカル・思考)', en: 'a cute, bouncy puzzle-game charm', enShort: 'cute puzzle charm' },
  { id: 'title', ja: 'タイトル画面(雄大・高揚感)', en: 'a triumphant, uplifting title-screen feel', enShort: 'uplifting title-screen feel' },
  { id: 'town', ja: '町/村/拠点(のんびり・安心)', en: 'a laid-back town or menu-screen mood', enShort: 'laid-back town mood' },
  { id: 'shop', ja: 'ショップ(陽気・軽快)', en: 'a cheerful, catchy in-game shop music vibe', enShort: 'cheerful shop vibe' },
  { id: 'cave', ja: '洞窟/地下(静寂・神秘的)', en: 'a mysterious, echoey cavern ambiance', enShort: 'mysterious cavern feel' },
  { id: 'victory', ja: '勝利ファンファーレ(歓喜)', en: 'a short, celebratory victory-fanfare energy', enShort: 'victory-fanfare energy' },
  { id: 'gameover', ja: 'ゲームオーバー(哀愁・悔恨)', en: 'a melancholy, short game-over tune', enShort: 'melancholic game-over feel' },
  { id: 'ending', ja: 'エンディング(感動・余韻)', en: 'an emotional, nostalgic ending-credits feel', enShort: 'emotional ending feel' },
  { id: 'hyper_kawaii', ja: 'Hyper-kawaii(超絶かわいい)', en: 'an ultra-cute, hyper-kawaii aesthetic with sweet, sparkling, and bubbly playful charm', enShort: 'ultra-cute hyper-kawaii charm' },
  { id: 'sparse_notes', ja: '音の数を極力減らす(余白・隙間)', en: 'extremely sparse note density, maximizing silence, breathing room, and minimalist space between minimal delicate notes', enShort: 'extremely sparse note density with lots of space' },
  { id: 'minimalism', ja: 'ミニマム系(シンプル・ミニマル)', en: 'a refined minimalist aesthetic, stripped-down pure instrumentation, clean and uncluttered space', enShort: 'minimalist stripped-down simplicity' }
];

// 楽器・音色定義
export const INSTRUMENTS = [
  { id: 'square_lead', ja: '8bit矩形波リード', en: 'an 8-bit square-wave lead' },
  { id: 'triangle_bass', ja: '8bit三角波ベース', en: 'a round 8-bit triangle-wave bass' },
  { id: 'arpeggio', ja: '8bitアルペジオ', en: 'fast chiptune arpeggios' },
  { id: 'fm_bass', ja: 'FMシンセベース', en: 'punchy FM synth bass' },
  { id: 'chip_pad', ja: 'チップチューンパッド', en: 'a soft chiptune pad' },
  { id: 'retro_drums', ja: 'レトロドラムマシン', en: 'a crisp retro drum-machine beat' },
  { id: 'noise_drums', ja: '8bitホワイトノイズドラム', en: 'crunchy 8-bit white noise percussion' },
  { id: 'marimba', ja: 'マリンバ/木琴', en: 'a bright acoustic-style marimba' },
  { id: 'pluck_synth', ja: 'プラック系シンセ', en: 'plucky synth arpeggios' },
  { id: 'bell', ja: 'ベル/チャイム', en: 'sparkling bell chimes' },
  { id: 'strings', ja: '軽めのオーケストラストリングス', en: 'light orchestral strings' },
  { id: 'saw_synth', ja: 'ノコギリ波シンセ', en: 'a buzzy sawtooth synth' },
  { id: 'toy_piano', ja: 'トイピアノ/オルゴール', en: 'sweet toy piano & music box tones' },
  { id: 'bubble_sine', ja: 'ぷくぷくサイン波/ピュアトーン', en: 'bubbly cute pure-sine water drops' }
];

// 効果音（SFX）定義
export const SFX = [
  { id: 'pico', ja: 'ピコピコ音', en: 'playful 8-bit blip accents' },
  { id: 'puyon', ja: 'ぷよ〜ん(バウンス)', en: 'a springy "boing" sound effect' },
  { id: 'coin', ja: 'コイン獲得音', en: 'a bright coin-collect chime' },
  { id: 'jump', ja: 'ジャンプ音', en: 'a quick jump swoosh' },
  { id: 'powerup', ja: 'パワーアップ音', en: 'a rising power-up arpeggio' },
  { id: 'warp', ja: 'ワープ/テレポート音', en: 'a descending warp/teleport sweep' },
  { id: 'select', ja: '決定/カーソル音', en: 'a short menu-confirm blip' },
  { id: 'levelup', ja: 'レベルアップ音', en: 'a triumphant level-up fanfare blip' },
  { id: 'explosion', ja: '爆発音', en: 'a punchy 8-bit explosion hit' },
  { id: 'sparkle', ja: 'キラキラ音', en: 'a twinkling sparkle chime' },
  { id: 'heart_chime', ja: 'ハートキラキラ音(キュート)', en: 'a sweet pastel heart sparkle chime' },
  { id: 'damage', ja: 'ダメージ音', en: 'a harsh damage buzz' },
  { id: 'alarm', ja: '警告アラート音', en: 'a pulsating retro warning beep' }
];

// 和声・調性定義
export const KEYS = {
  bright_major:  { ja: '明るいメジャーの高揚感あるハーモニー', en: 'bright, uplifting major-key harmony', baseNote: 'C', scaleType: 'major' },
  kawaii_major7: { ja: '甘くドリーミーなメジャー7th (Hyper-kawaii)', en: 'sweet, dreamy major 7th harmony with pastel aesthetic', baseNote: 'F', scaleType: 'major7' },
  tense_minor:   { ja: '緊張感のあるマイナー調ハーモニー', en: 'tense minor-key harmony', baseNote: 'A', scaleType: 'minor' },
  cute_penta:    { ja: '和風でかわいいペンタトニックのメロディ', en: 'a cute, pentatonic melody', baseNote: 'C', scaleType: 'pentatonic' },
  eerie_dim:     { ja: '不穏なディミニッシュスケールの緊張感', en: 'unsettling, diminished-scale tension', baseNote: 'B', scaleType: 'diminished' },
  heroic_dorian: { ja: '勇壮で冒険心あふれるドリアン旋法', en: 'an adventurous, heroic Dorian modal vibe', baseNote: 'D', scaleType: 'dorian' }
};

// 効果音の挿入頻度
export const DENSITY = {
  none: { ja: '効果音は使わない', en: 'no added sound effects' },
  occasional: { ja: 'たまに挿入する', en: 'occasionally' },
  frequent: { ja: '頻繁に散りばめる', en: 'frequently' }
};

// 盛り上がり抑制指示
export const RESTRAINT_OPTS = [
  { id: 'flat_dynamics', ja: 'ダイナミクス(音量差)を一定に保つ', en: 'keep the dynamics constant throughout' },
  { id: 'no_buildup', ja: '急激なクレッシェンドやビルドアップを避ける', en: 'avoid dramatic build-ups, drops, or crescendos' },
  { id: 'no_fills', ja: 'ドラムフィルインを最小限で控えめに', en: 'keep drum fills minimal, subtle, and restrained' },
  { id: 'no_key_change', ja: '転調や劇的な展開を作らない', en: 'avoid sudden key changes or dramatic developments' },
  { id: 'loop_consistent', ja: '最初から最後まで均一な強度を保つ', en: 'maintain the same intensity throughout, with no rising arc' },
  { id: 'minimal_layers', ja: '途中で楽器数を増やしすぎない', en: 'keep instrument layers consistent without cluttering over time' },
  { id: 'sparse_space', ja: '音数を最小限に絞り、余白(スキマ)を重視する', en: 'strictly minimize active voices, leaving plenty of empty space and silence' }
];

// 盛り上がり抑制レベル
export const RESTRAINT_LEVELS = {
  none:   { ja: '', en: '' },
  mild:   { ja: '盛り上がりはゆるやかに抑え、不要なクライマックスへの高まりは避けてほしい。', en: 'Keep the overall energy fairly restrained; avoid unnecessary escalation toward a big climax.' },
  strict: { ja: '盛り上がりを作らず、曲全体を通してほぼフラットな強度を保ってほしい。大きなクレッシェンドや展開は不要。', en: 'Keep the energy essentially flat and unchanging throughout — no dramatic build-ups, swells, or climaxes.' }
};

// ネガティブプロンプト（除外指定）の選択肢
export const NEGATIVE_OPTIONS = [
  { id: 'vocals', ja: 'ボーカル・歌声・人の声', en: 'vocals, singing, voice, speech' },
  { id: 'modern_edm', ja: '現代的なEDM・重低音ドロップ', en: 'heavy EDM drops, modern sub-bass, dubstep wobbles' },
  { id: 'trap_beats', ja: 'トラップビート・現代的なハイハット連打', en: 'trap hi-hat rolls, modern trap beats' },
  { id: 'distortion', ja: '強い歪み・過度なオーバードライブ', en: 'heavy distortion, harsh overdrive, noisy clipping' },
  { id: 'orchestral_epic', ja: '重厚すぎる実写映画風オーケストラ', en: 'heavy cinematic orchestral blast, dramatic brass swells' },
  { id: 'busy_dense', ja: '密度の高すぎる音・騒がしいパーカッション', en: 'dense layers, busy complex arrangement, noisy aggressive percussion' },
  { id: 'dark_tones', ja: '暗い響き・不穏なコード進行', en: 'dark scary mood, dissonant tension, heavy aggressive tones' },
  { id: 'fade_out', ja: 'フェードアウト（末尾の自然減衰）', en: 'fade out at the end, trailing off' }
];

// トラック長（タイムライン用）
export const DURATIONS = [
  { id: '15', label: '15秒(ジングル/演出)', sec: 15, stinger: true },
  { id: '30', label: '30秒ループ(小規模)', sec: 30 },
  { id: '60', label: '60秒ループ(標準)', sec: 60 },
  { id: '90', label: '90秒ループ(長め)', sec: 90 },
  { id: '120', label: '120秒ループ(大曲)', sec: 120 },
  { id: 'loop', label: 'ループ(尺指定なし)', sec: null }
];

// 対象AIフォーマット
export const AI_TARGETS = [
  { id: 'flow', label: 'Google Flow Music', desc: 'Flow Music向けに最適化された指示スタイル' },
  { id: 'suno_udio', label: 'Suno / Udio 共通', desc: '[Style: 8-bit] などのタグ併用形式' },
  { id: 'plain', label: 'シンプル文章形式', desc: '一般的なプロンプト用' }
];

// レトロゲーム風曲名ジェネレーター用ワード
export const TITLE_SUGGESTIONS = [
  '始まりの街角',
  '勇者の旅立ち',
  '古代神殿の亡霊',
  '星降る夜の隠れ里',
  '決戦のコロシアム',
  '月夜の忍び道',
  '灼熱の溶岩回廊',
  '忘れられた地下迷宮',
  '大森林の精霊たち',
  '安らぎの宿屋カフェ',
  '電脳都市の夜ドライブ',
  '勝利のファンファーレ',
  '機械仕掛けの心臓部',
  '果てしなき荒野をゆく',
  '黄金のピラミッド',
  '怪奇屋敷のダンスナイト',
  '深海都市アトランティス',
  '大空をかける飛空艇',
  'ラストバトル〜運命の審判',
  '黄昏のエンディングロール',
  'こんぺいとうの夢の国',
  'ふわふわマシュマロ雲のお茶会',
  '仔猫のひるねとピコピコワルツ',
  'すいーと・ぴこぴこ・るーむ',
  'パステルキャンディ・ポップ',
  'しずかな夜のトイボックス',
  '星屑ドロップのステップ'
];

// 標準プリセット定義
export const DEFAULT_PRESETS = {
  '🎀 Hyper-kawaii ミニマル': {
    trackTitle: 'こんぺいとうの夢の国',
    moods: ['hyper_kawaii', 'sparse_notes', 'minimalism'],
    insts: ['bell', 'pluck_synth', 'triangle_bass', 'toy_piano'],
    sfx: ['sparkle', 'heart_chime', 'pico'],
    density: 'occasional',
    restraintLevel: 'strict',
    restraint: ['minimal_layers', 'flat_dynamics', 'sparse_space'],
    negatives: ['vocals', 'modern_edm', 'distortion', 'orchestral_epic', 'busy_dense', 'dark_tones'],
    key: 'kawaii_major7',
    tempo: 96,
    duration: '60',
    lang: 'ja',
    aiTarget: 'flow',
    embedTimeline: false
  },
  '🌸 パステルパズル (かわいい)': {
    trackTitle: 'パステルキャンディ・ポップ',
    moods: ['puzzle', 'hyper_kawaii'],
    insts: ['marimba', 'pluck_synth', 'toy_piano', 'triangle_bass'],
    sfx: ['puyon', 'sparkle'],
    density: 'occasional',
    restraintLevel: 'mild',
    restraint: ['no_buildup'],
    negatives: ['vocals', 'modern_edm', 'distortion'],
    key: 'cute_penta',
    tempo: 108,
    duration: '60',
    lang: 'ja',
    aiTarget: 'flow',
    embedTimeline: false
  },
  '🏰 王道フィールド冒険': {
    trackTitle: '始まりの街角',
    moods: ['field'],
    insts: ['square_lead', 'arpeggio', 'fm_bass', 'retro_drums'],
    sfx: ['coin', 'jump', 'pico'],
    density: 'occasional',
    restraintLevel: 'none',
    restraint: [],
    negatives: ['vocals'],
    key: 'bright_major',
    tempo: 120,
    duration: '60',
    lang: 'ja',
    aiTarget: 'flow',
    embedTimeline: false
  },
  '⚡ 緊迫ボスバトル': {
    trackTitle: '決戦のコロシアム',
    moods: ['boss', 'battle'],
    insts: ['saw_synth', 'fm_bass', 'noise_drums', 'arpeggio'],
    sfx: ['explosion', 'alarm'],
    density: 'occasional',
    restraintLevel: 'none',
    restraint: [],
    negatives: ['vocals', 'fade_out'],
    key: 'eerie_dim',
    tempo: 145,
    duration: '60',
    lang: 'ja',
    aiTarget: 'flow',
    embedTimeline: false
  }
};
