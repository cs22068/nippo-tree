// ===== utils.js =====
// 日付・年度計算などの純粋な関数をまとめる

/** 今日の日付を "YYYY-MM-DD" 形式で返す */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

/** 指定日が送信日（月・水・金）かどうか */
function isReportDay(dateStr) {
  const dow = new Date(dateStr).getDay();
  return dow === 1 || dow === 3 || dow === 5;
}

/** 次の送信日を "M月D日（曜）" 形式で返す */
function getNextReportDay() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  for (let i = 0; i < 14; i++) {
    const dow = d.getDay();
    if (dow === 1 || dow === 3 || dow === 5) {
      const label = ['日','月','火','水','木','金','土'][dow];
      return `${d.getMonth()+1}月${d.getDate()}日（${label}）`;
    }
    d.setDate(d.getDate() + 1);
  }
  return '次の月・水・金';
}

/** 日付が月・水・金かどうか（Date オブジェクト版） */
function isWeekday135(d) {
  const dow = d.getDay();
  return dow === 1 || dow === 3 || dow === 5;
}

/** 今年の経過した月・水・金の日数 */
function countElapsedReportDays() {
  const now = new Date();
  const year = now.getFullYear();
  let count = 0;
  const d = new Date(year, 0, 1);
  while (d <= now) {
    if (isWeekday135(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/** 4月始まりの現在年度を返す */
function getFiscalYear() {
  const now = new Date();
  return now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
}

/** 指定年度の月・水・金の総日数（4月〜翌3月） */
function countReportDaysInFiscalYear(fy) {
  const start = new Date(fy,   3, 1);
  const end   = new Date(fy+1, 2, 31);
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    if (isWeekday135(d)) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/** 今月の送信回数を返す */
function countThisMonthSent(sentDates) {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  return sentDates.filter(d => d.startsWith(ym)).length;
}

/** テスト用のユニーク日付キーを生成 */
function generateFakeDate(sentDates) {
  const count = sentDates.filter(d => d.startsWith('test-')).length;
  return `test-${count}`;
}
