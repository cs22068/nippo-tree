// ===== app.js =====
// UI更新・イベントハンドラ・初期化を担当する

let appData = loadData();

// ===== 季節テーマ =====
function applySeasonTheme() {
  const m = new Date().getMonth();
  const body = document.body;
  body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
  if      (m >= 2 && m <= 4)  body.classList.add('season-spring');
  else if (m >= 5 && m <= 7)  body.classList.add('season-summer');
  else if (m >= 8 && m <= 10) body.classList.add('season-autumn');
  else                         body.classList.add('season-winter');
}

// ===== 星を生成 =====
function createStars() {
  const container = document.getElementById('stars');
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*60}%;--d:${2+Math.random()*4}s;--delay:${Math.random()*4}s;`;
    container.appendChild(s);
  }
}

// ===== トースト =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== 花びら =====
function spawnPetals() {
  const emojis = ['🌸','🌺','🌼','✿','❀'];
  for (let i = 0; i < 20; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'petal';
      p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      p.style.left = Math.random() * 100 + 'vw';
      p.style.animationDuration = (1.5 + Math.random() * 2) + 's';
      p.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3500);
    }, i * 80);
  }
}

// ===== テストモードバッジ =====
function updateTestModeBadge() {
  const badge = document.getElementById('testModeBadge');
  if (!badge) return;
  badge.style.display = appData.testMode ? 'inline-block' : 'none';
}

// ===== メインUI更新 =====
function updateUI() {
  appData = loadData();
  const totalTarget = appData.targetCount || 156;
  const sentCount   = appData.sentDates.length;
  const progress    = Math.min(sentCount / totalTarget, 1);

  // 木の描画
  drawTree(document.getElementById('treeCanvas'), progress);

  // ステージ・プログレス
  const stage = getStageInfo(progress);
  document.getElementById('stageLabel').textContent    = stage.label;
  document.getElementById('progressPct').textContent   = Math.round(progress * 100) + '%';
  document.getElementById('progressFill').style.width  = (progress * 100) + '%';
  document.getElementById('sentCount').textContent     = sentCount;
  document.getElementById('totalCount').textContent    = totalTarget;

  // 統計
  document.getElementById('streakValue').textContent = countThisMonthSent(appData.sentDates);
  const elapsed = countElapsedReportDays();
  document.getElementById('rateValue').textContent   = elapsed > 0 ? Math.min(Math.round(sentCount / elapsed * 100), 100) : 0;

  // TODAY'S REPORT
  _updateTodaySection(stage);

  // 通知アイコン
  _updateNotifyIcon();

  // カレンダー
  renderCalendar(appData.sentDates, today());
}

function _updateTodaySection(stage) {
  const todayStr       = today();
  const todayIsReport  = isReportDay(todayStr);
  const alreadySent    = appData.sentDates.includes(todayStr);
  const dot  = document.getElementById('todayDot');
  const text = document.getElementById('todayText');
  const area = document.getElementById('actionArea');

  if (appData.testMode) {
    dot.className  = 'today-dot pending';
    text.textContent = 'テストモード中';
    area.innerHTML = `<button class="btn-sent" onclick="markSent()" style="background:rgba(255,155,181,0.25);box-shadow:none;border:1px solid rgba(255,155,181,0.4);">🌸 記録します（テスト）</button>`;
  } else if (!todayIsReport) {
    dot.className  = 'today-dot notday';
    text.textContent = '今日は送信日ではありません 😴';
    area.innerHTML = `<button class="btn-disabled">📅 次回: ${getNextReportDay()}</button>`;
  } else if (alreadySent) {
    dot.className  = 'today-dot sent';
    text.textContent = '今日の日報を送信済み ✅';
    area.innerHTML = `<button class="btn-sent">🌸 送信済み！木が育ちました</button>`;
  } else {
    dot.className  = 'today-dot pending';
    text.textContent = '今日の日報がまだです！';
    area.innerHTML = `
      <button class="btn-outlook" onclick="openOutlook()">📧 Outlookで日報を送る</button>
      <div style="height:8px"></div>
      <button class="btn-sent" onclick="markSent()" style="background:rgba(255,255,255,0.1);box-shadow:none;border:1px solid var(--card-border);">✅ 送った！記録する</button>`;
    const bubble = document.getElementById('speechBubble');
    bubble.innerHTML = stage.msg.replace(/\n/g, '<br>');
    setTimeout(() => bubble.classList.add('show'), 300);
  }
}

function _updateNotifyIcon() {
  const btn = document.getElementById('notifyBtn');
  if (!btn) return;
  const isOn = appData.notifyEnabled && Notification.permission === 'granted';
  btn.textContent = isOn ? '🔔' : '🔕';
  btn.title = isOn ? '通知ON（クリックで無効化）' : '通知OFF（クリックで有効化）';
}

// ===== Outlook =====
function openOutlook() {
  const email = appData.outlookEmail;
  const url = email
    ? `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent('日報 ' + today())}`
    : 'https://outlook.office.com/';
  window.open(url, '_blank');
  showToast('📧 Outlookを開きました！送信後に「✅ 送った！」を押してね');
}

// ===== 記録 =====
function markSent() {
  const target = appData.targetCount || 156;
  if (appData.testMode) {
    if (appData.sentDates.length >= target) {
      showToast('🌸 目標達成済み！これ以上は記録できません'); return;
    }
    appData.sentDates.push(generateFakeDate(appData.sentDates));
    saveData(appData);
    showToast(`🌸 テスト記録！通算 ${appData.sentDates.length}/${target} 回`);
  } else {
    const t = today();
    if (appData.sentDates.includes(t)) return;
    appData.sentDates.push(t);
    saveData(appData);
    showToast('🌸 日報を記録しました！木が育ちます！');
    document.getElementById('speechBubble').classList.remove('show');
  }
  spawnPetals();
  updateUI();
}

// ===== 通知 =====
async function toggleNotification() {
  if (appData.notifyEnabled) {
    appData.notifyEnabled = false;
    saveData(appData);
    updateUI();
    showToast('🔕 通知を無効にしました');
    return;
  }
  if (!('Notification' in window)) { showToast('❌ このブラウザは通知非対応です'); return; }
  const perm = await requestNotificationPermission();
  if (perm === 'granted') {
    appData.notifyEnabled = true;
    saveData(appData);
    scheduleNotifications(() => appData, today);
    updateUI();
    showToast('🔔 通知を有効にしました！月・水・金 18:00にお知らせします');
    sendNotification('🌸 日報の木', 'テスト通知です！設定完了 🌸');
  } else {
    showToast('❌ 通知の許可が必要です');
  }
}

// ===== 設定モーダル =====
function openSettings() {
  const fy = getFiscalYear();
  const autoCount = countReportDaysInFiscalYear(fy);
  appData.targetCount = autoCount;
  saveData(appData);
  document.getElementById('targetInfo').textContent   = `${fy}年4月〜${fy+1}年3月の月・水・金：${autoCount}回（自動計算）`;
  document.getElementById('outlookEmail').value       = appData.outlookEmail || '';
  document.getElementById('testModeToggle').checked  = appData.testMode || false;
  cancelReset();
  document.getElementById('modalOverlay').classList.add('open');
}

function closeSettings() {
  appData.outlookEmail = document.getElementById('outlookEmail').value.trim();
  saveData(appData);
  document.getElementById('modalOverlay').classList.remove('open');
  updateUI();
  showToast('✅ 設定を保存しました');
}

function cancelSettings() {
  document.getElementById('modalOverlay').classList.remove('open');
}

function overlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) cancelSettings();
}

function toggleTestMode() {
  appData.testMode = document.getElementById('testModeToggle').checked;
  saveData(appData);
  updateTestModeBadge();
  showToast(appData.testMode ? 'テストモードON：記録ボタンが常時表示されます' : 'テストモードOFF：通常モードに戻りました');
}

// ===== リセット =====
function confirmReset() {
  document.getElementById('resetArea').style.display   = 'none';
  document.getElementById('resetConfirm').style.display = 'block';
}
function cancelReset() {
  document.getElementById('resetArea').style.display   = 'block';
  document.getElementById('resetConfirm').style.display = 'none';
}
function doReset() {
  appData = resetData();
  document.getElementById('modalOverlay').classList.remove('open');
  updateUI();
  showToast('🗑️ リセットしました');
}

// ===== 初期化 =====
(function init() {
  createStars();
  applySeasonTheme();
  updateUI();
  updateTestModeBadge();
  if (appData.notifyEnabled) scheduleNotifications(() => appData, today);
  setInterval(updateUI, 60000); // 毎分リフレッシュ
})();
