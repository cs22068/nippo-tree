// ===== storage.js =====
// localStorageへのデータ保存・読み込みを一元管理する

const STORAGE_KEY = 'nippoTreeData_v1';

const defaultData = {
  sentDates:    [],
  targetCount:  156,
  outlookEmail: '',
  notifyEnabled: false,
  testMode:     false,
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultData, ...JSON.parse(raw) };
  } catch (e) {
    console.error('loadData error:', e);
  }
  return { ...defaultData };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('saveData error:', e);
  }
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...defaultData };
}
