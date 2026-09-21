/**
 * ストレージ管理モジュール (localStorage / JSON入出力 / URL共有)
 */

const LAST_STATE_KEY = 'gamebgm-composer-laststate-v2';
const PRESETS_KEY = 'gamebgm-composer-presets-v2';

/**
 * 状態をシリアライズ可能なプレーンオブジェクトに変換
 */
export function serializeState(state) {
  return {
    moods: [...state.moods],
    insts: [...state.insts],
    sfx: [...state.sfx],
    density: state.density,
    restraintLevel: state.restraintLevel,
    restraint: [...state.restraint],
    negatives: [...state.negatives],
    key: state.key,
    tempo: Number(state.tempo),
    duration: state.duration,
    lang: state.lang,
    aiTarget: state.aiTarget,
    embedTimeline: Boolean(state.embedTimeline)
  };
}

/**
 * 直前の作業状態を保存
 */
export function saveLastState(state) {
  try {
    localStorage.setItem(LAST_STATE_KEY, JSON.stringify(serializeState(state)));
  } catch (e) {
    console.warn('ローカルストレージへの保存に失敗しました:', e);
  }
}

/**
 * 直前の作業状態を読み込み
 */
export function loadLastState() {
  try {
    const raw = localStorage.getItem(LAST_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * プリセット一覧の取得
 */
export function getPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

/**
 * プリセットの保存
 */
export function savePreset(name, state) {
  if (!name || !name.trim()) return false;
  const presets = getPresets();
  presets[name.trim()] = serializeState(state);
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (e) {
    console.error('プリセットの保存に失敗しました:', e);
    return false;
  }
}

/**
 * プリセットの削除
 */
export function deletePreset(name) {
  const presets = getPresets();
  if (presets[name]) {
    delete presets[name];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  }
  return false;
}

/**
 * プリセット全件をJSONファイルとしてダウンロード（エクスポート）
 */
export function exportPresetsAsJSON() {
  const presets = getPresets();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
  const downloadAnchor = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `gamebgm_presets_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * JSONファイルからプリセットを一括取り込み（インポート）
 */
export function importPresetsFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (typeof imported === 'object' && imported !== null) {
        const current = getPresets();
        const merged = { ...current, ...imported };
        localStorage.setItem(PRESETS_KEY, JSON.stringify(merged));
        callback(true, Object.keys(imported).length);
      } else {
        callback(false, 0, '無効なJSONフォーマットです');
      }
    } catch (err) {
      callback(false, 0, 'JSONの解析に失敗しました');
    }
  };
  reader.onerror = () => callback(false, 0, 'ファイルの読み込みに失敗しました');
  reader.readAsText(file);
}

/**
 * URLハッシュ形式による共有リンクの生成
 */
export function getShareURL(state) {
  const serialized = serializeState(state);
  const jsonStr = JSON.stringify(serialized);
  const base64 = btoa(encodeURIComponent(jsonStr));
  const url = new URL(window.location.href);
  url.hash = `cfg=${base64}`;
  return url.toString();
}

/**
 * URLハッシュからの状態復元
 */
export function loadFromURLHash() {
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#cfg=')) {
      const base64 = hash.replace('#cfg=', '');
      const jsonStr = decodeURIComponent(atob(base64));
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn('URLパラメータからの復元に失敗しました:', e);
  }
  return null;
}
