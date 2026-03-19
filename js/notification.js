// ===== notification.js =====
// ブラウザ通知の許可・スケジューリングを管理する

async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return await Notification.requestPermission();
}

function sendNotification(title, body) {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body });
}

/**
 * 月・水・金 18:00 に未送信であれば通知を出す
 * ブラウザが開いている間のみ動作（Service Worker なし）
 */
function scheduleNotifications(getAppData, todayFn) {
  const msgs = [
    '日報まだー？🌸 木が待ってるよ！',
    'ねえねえ、日報送った？🌳 枝が伸びるの待ってるよ〜',
    '18時だよ！日報の時間！🌸',
    '送ってないと木が枯れちゃう…（嘘）でも早く送って！',
  ];

  function checkAndNotify() {
    const data = getAppData();
    if (!data.notifyEnabled || Notification.permission !== 'granted') return;
    const now = new Date();
    const dow = now.getDay();
    if ((dow === 1 || dow === 3 || dow === 5) && now.getHours() === 18 && now.getMinutes() === 0) {
      const t = todayFn();
      if (!data.sentDates.includes(t)) {
        const msg = msgs[Math.floor(Math.random() * msgs.length)];
        sendNotification('🌸 日報の木', msg);
      }
    }
  }

  setInterval(checkAndNotify, 60000);
  checkAndNotify();
}
