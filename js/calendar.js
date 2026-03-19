// ===== calendar.js =====
// 今月のカレンダーを描画する

function renderCalendar(sentDates, todayStr, accentColor) {
  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();
  const monthNames = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];

  document.getElementById('calTitle').textContent = `${year}年 ${monthNames[month]} の記録`;

  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  // 曜日ラベル
  ['日','月','火','水','木','金','土'].forEach(label => {
    const el = document.createElement('div');
    el.className = 'cal-day-label';
    el.textContent = label;
    if (['月','水','金'].includes(label)) el.style.color = 'var(--accent)';
    grid.appendChild(el);
  });

  // 月初の空白
  const firstDow = new Date(year, month, 1).getDay();
  for (let i = 0; i < firstDow; i++) {
    grid.appendChild(document.createElement('div'));
  }

  // 日付セル
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isReport = isReportDay(dateStr);
    const isSent   = sentDates.includes(dateStr);
    const isToday  = dateStr === todayStr;
    const isFuture = new Date(dateStr) > new Date();

    const el = document.createElement('div');
    el.textContent = d;

    if (!isReport) {
      el.className = 'cal-day noday';
    } else if (isFuture) {
      el.className = 'cal-day future';
    } else if (isSent) {
      el.className = 'cal-day sent';
      el.textContent = '🌸';
    } else {
      el.className = 'cal-day missed';
      el.style.color = 'rgba(200,50,50,0.5)';
    }

    if (isToday) el.style.border = '1.5px solid var(--accent)';
    grid.appendChild(el);
  }
}
