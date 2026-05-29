import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // 預載入 calendar-events-2026-05-29.ics 的初始資料
  const initialEvents = [
    { id: 'cal-0', summary: '【學期課程】本學期開始', start: '2026-08-01', category: '學期課程', description: '' },
    { id: 'cal-1', summary: '【重要截止】舊生初選第1學期課程', start: '2026-08-04', category: '重要截止', description: '含研究所新生，至8/10' },
    { id: 'cal-2', summary: '【行政會議】校教師評審委員會會議', start: '2026-08-05', category: '行政會議', description: '115學年度' },
    { id: 'cal-3', summary: '【教學活動】新任系所主管研習會', start: '2026-08-12', category: '教學活動', description: '115學年度' },
    { id: 'cal-4', summary: '【重要截止】網路查詢註冊', start: '2026-08-13', category: '重要截止', description: '至10月2日' },
    { id: 'cal-5', summary: '【教學活動】新進職員教育訓練', start: '2026-08-25', category: '教學活動', description: '全面品質管理教育訓練' },
    { id: 'cal-6', summary: '【招生相關】招生委員會會議', start: '2026-08-26', category: '招生相關', description: '' },
    { id: 'cal-7', summary: '【重要截止】學士班/研究所新生選課', start: '2026-08-26', category: '重要截止', description: '至9月3日' }
  ];

  const [events, setEvents] = useState(initialEvents);
  // 將初始月份設定為 2026 年 8 月以配合資料
  const [viewDate, setViewDate] = useState(new Date(2026, 7, 1)); 

  // 讀書規劃狀態
  const [studyPlans, setStudyPlans] = useState([]);
  const [newStudy, setNewStudy] = useState({ title: '', targetDate: '', isDone: false });

  // 消費記錄狀態
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ date: '', item: '', amount: '', category: '飲食' });
  const expenseCats = ['飲食', '交通', '娛樂', '生活', '其他'];

  // 定義分類顏色映射表
  const getCategoryStyle = (category) => {
    const colorMap = {
      '工作': { bg: '#3498db', text: '#fff' },
      '私人': { bg: '#2ecc71', text: '#fff' },
      '重要': { bg: '#e74c3c', text: '#fff' },
      '休閒': { bg: '#f1c40f', text: '#fff' },
      '學期課程': { bg: '#9b59b6', text: '#fff' },
      '重要截止': { bg: '#e67e22', text: '#fff' },
      '行政會議': { bg: '#34495e', text: '#fff' },
      '教學活動': { bg: '#1abc9c', text: '#fff' },
      '學生活動': { bg: '#ff7979', text: '#fff' },
      '招生相關': { bg: '#d35400', text: '#fff' },
      '假日': { bg: '#ff4757', text: '#fff' },
      '匯入': { bg: '#95a5a6', text: '#fff' }
    };
    return colorMap[category] || { bg: '#f4f4f4', text: '#666' }; // 預設灰色
  };

  // 定義消費類別顏色映射表
  const getExpenseStyle = (category) => {
    const map = {
      '飲食': { bg: '#ff7675', text: '#fff' },
      '交通': { bg: '#74b9ff', text: '#fff' },
      '娛樂': { bg: '#a29bfe', text: '#fff' },
      '生活': { bg: '#55efc4', text: '#fff' },
      '其他': { bg: '#b2bec3', text: '#fff' }
    };
    return map[category] || { bg: '#eee', text: '#666' };
  };

  const [newEvent, setNewEvent] = useState({
    summary: '',
    start: '',
    end: '',
    description: '',
    category: '工作'
  });
  const [categories, setCategories] = useState(['工作', '私人', '重要', '休閒', '學期課程', '重要截止', '行政會議', '教學活動', '招生相關', '學生活動', '假日']);
  const [newCatName, setNewCatName] = useState('');
  
  // 請在此處貼上你的 Google Apps Script Web App URL
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbwEcdUtnl6kHgIherZfhsr4QtQtepKIaMMClzEU2B635oeW2Y2MeWXhNIckaLjuY1Ce8Q/exec'; // 替換為部署後的網址

  // 新增事項
  const addEvent = () => {
    if (!newEvent.summary || !newEvent.start) return alert('請填寫標題與時間');
    setEvents([...events, { ...newEvent, id: Date.now() }]);
    setNewEvent({ summary: '', start: '', end: '', description: '', category: '工作' });
  };

  // 新增讀書計畫
  const addStudy = () => {
    if (!newStudy.title || !newStudy.targetDate) return alert('請填寫內容與日期');
    setStudyPlans([...studyPlans, { ...newStudy, id: Date.now() }]);
    setNewStudy({ title: '', targetDate: '', isDone: false });
  };

  // 新增消費記錄
  const addExpense = () => {
    if (!newExpense.item || !newExpense.amount || !newExpense.date) return alert('請填寫內容、金額與日期');
    setExpenses([...expenses, { ...newExpense, id: Date.now() }]);
    setNewExpense({ date: '', item: '', amount: '', category: '飲食' });
  };

  // 新增分類
  const addCategory = () => {
    if (newCatName && !categories.includes(newCatName)) {
      setCategories([...categories, newCatName]);
      setNewCatName('');
    }
  };

  // 匯出 ICS 檔案
  const exportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Calendar App//TW\n";
    
    events.forEach(event => {
      const start = event.start.replace(/[-:]/g, '') + "00Z";
      const end = (event.end || event.start).replace(/[-:]/g, '') + "00Z";
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${event.summary}\n`;
      icsContent += `DTSTART:${start}\n`;
      icsContent += `DTEND:${end}\n`;
      icsContent += `DESCRIPTION:${event.description} [分類:${event.category}]\n`;
      icsContent += "END:VEVENT\n";
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar-events-${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
  };

  // 匯入 ICS 檔案
  const importICS = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const vevents = text.split("BEGIN:VEVENT");
      const imported = vevents.slice(1).map(v => {
        // 優化解析邏輯以支援 DTSTART;VALUE=DATE 格式
        const summary = v.match(/SUMMARY:(.*)/)?.[1]?.trim() || "未命名事項";
        const startMatch = v.match(/DTSTART(?:;[^:]*)?:(\d{8})/);
        const startRaw = startMatch ? startMatch[1] : "";
        const description = v.match(/DESCRIPTION:(.*)/)?.[1]?.trim() || "";
        
        // 優先讀取 CATEGORIES 欄位，若無則標記為匯入
        const categoriesMatch = v.match(/CATEGORIES:(.*)/)?.[1]?.trim();
        const category = categoriesMatch || "匯入";

        let startFormatted = "";
        if (startRaw.length === 8) {
          startFormatted = `${startRaw.substring(0, 4)}-${startRaw.substring(4, 6)}-${startRaw.substring(6, 8)}`;
        } else {
          startFormatted = new Date().toISOString().split('T')[0];
        }

        return { id: Math.random(), summary, start: startFormatted, description, category };
      });
      setEvents(prev => [...prev, ...imported]);
    };
    reader.readAsText(file);
  };

  // 儲存至 Google Sheets
  const saveToSheets = async () => {
    if (!GAS_URL || GAS_URL.includes('YOUR_')) {
      return alert('請先在程式碼中設定 Google Apps Script URL');
    }
    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors', // GAS Web App 限制
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          studyPlans,
          expenses
        })
      });
      alert('資料已傳送至 Google Sheets (請檢查試算表)');
    } catch (error) {
      console.error(error);
      alert('儲存失敗');
    }
  };

  // 從 Google Sheets 讀取資料
  const loadFromSheets = async () => {
    if (!GAS_URL || GAS_URL.includes('YOUR_')) return alert('請先設定 URL');
    try {
      const response = await fetch(GAS_URL);
      const data = await response.json();
      if (data.events) setEvents(data.events);
      if (data.studyPlans) {
        // 處理布林值轉型
        setStudyPlans(data.studyPlans.map(p => ({
          ...p,
          isDone: p.isDone === "true" || p.isDone === true
        })));
      }
      if (data.expenses) setExpenses(data.expenses);
      alert('已從 Google Sheets 載入資料');
    } catch (error) {
      console.error(error);
      alert('載入失敗，請確認 GAS 是否已部署為「任何人」可存取');
    }
  };

  // 日曆邏輯計算
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthYearLabel = `${year}年 ${month + 1}月`;

  const changeMonth = (offset) => {
    setViewDate(new Date(year, month + offset, 1));
  };

  // 檢查是否為今天
  const checkIsToday = (day) => {
    const now = new Date();
    return (
      day === now.getDate() &&
      month === now.getMonth() &&
      year === now.getFullYear()
    );
  };

  // 點擊日曆儲存格
  const handleCellClick = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewEvent({ ...newEvent, start: dateStr });
    
    // 捲動到新增表單區塊
    document.querySelector('.form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 取得特定日期的行程
  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start === dateStr);
  };

  // 計算本月總消費 (需移到 expenseBreakdown 之前)
  const totalExpense = expenses
    .filter(ex => {
      const d = new Date(ex.date);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, curr) => sum + Number(curr.amount), 0);

  // 消費類別統計 (用於視覺化進度條，加入月份過濾以確保百分比正確)
  const expenseBreakdown = expenseCats.map(cat => {
    const amount = expenses
      .filter(ex => ex.category === cat && 
        new Date(ex.date).getMonth() === month && new Date(ex.date).getFullYear() === year)
      .reduce((sum, curr) => sum + Number(curr.amount), 0);
    return { cat, amount, percent: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 };
  }).filter(b => b.amount > 0);

  // 讀書計畫狀態邏輯
  const getStudyStatus = (targetDate, isDone) => {
    if (isDone) return { text: '已完成', color: '#2ecc71', bg: '#e8fdf0' };
    const today = new Date().toISOString().split('T')[0];
    if (targetDate < today) return { text: '已逾期', color: '#e74c3c', bg: '#fde8e8' };
    if (targetDate === today) return { text: '今天截止', color: '#f39c12', bg: '#fef9e7' };
    return { text: '進行中', color: '#3498db', bg: '#e8f4fd' };
  };

  // 計算讀書計畫進度
  const studyProgress = studyPlans.length > 0 
    ? Math.round((studyPlans.filter(p => p.isDone).length / studyPlans.length) * 100) 
    : 0;

  // 計算平均每日消費
  const avgExpense = daysInMonth > 0 ? Math.round(totalExpense / daysInMonth) : 0;

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  return (
    <div className="app-container">
      <h1>行事曆管理系統</h1>
      
      <div className="toolbar">
        <div className="import-export">
          <label className="btn-secondary">
            匯入 ICS
            <input type="file" accept=".ics" onChange={importICS} style={{ display: 'none' }} />
          </label>
          <button onClick={exportICS}>匯出 ICS</button>
          <button onClick={loadFromSheets}>從 Sheets 載入</button>
          <button className="btn-primary" onClick={saveToSheets}>同步到 Google Sheets</button>
        </div>
      </div>

      <section className="form-section">
        <h3>新增行程</h3>
        <div className="input-group">
          <input type="text" placeholder="事項名稱" value={newEvent.summary} onChange={e => setNewEvent({...newEvent, summary: e.target.value})} />
          <input type="date" value={newEvent.start} onChange={e => setNewEvent({...newEvent, start: e.target.value})} />
          <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button onClick={addEvent}>加入行程</button>
        </div>
        
        <div>
          <input type="text" placeholder="新分類名稱" value={newCatName} onChange={e => setNewCatName(e.target.value)} />
          <button onClick={addCategory}>新增分類</button>
        </div>
      </section>

      <section className="month-calendar">
        <div className="calendar-nav">
          <button onClick={() => changeMonth(-1)}>&lt; 上個月</button>
          <h2>{monthYearLabel}</h2>
          <button onClick={() => changeMonth(1)}>下個月 &gt;</button>
        </div>
        <div className="calendar-grid-wrapper">
          <div className="calendar-header-days">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-days-grid">
            {daysArray.map((day, idx) => {
              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;
              return (
                <div 
                  key={idx} 
                  className={`calendar-cell ${day === null ? 'empty' : ''} ${day && checkIsToday(day) ? 'is-today' : ''} ${isSunday ? 'sunday' : ''} ${isSaturday ? 'saturday' : ''}`}
                  onClick={() => handleCellClick(day)}
                >
                  {day && (
                    <>
                      <span className="day-number">{day}</span>
                      <div className="cell-events">
                        {getEventsForDay(day).map(e => (
                          <div 
                            key={e.id} 
                            className="mini-event"
                            style={{ 
                              backgroundColor: getCategoryStyle(e.category).bg, 
                              color: getCategoryStyle(e.category).text 
                            }}
                          >
                            {e.summary}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="extra-features">
        <section className="study-section">
          <div className="section-header">
            <div className="title-with-icon">
              <h2>📚 讀書規劃</h2>
              <span className="progress-badge">{studyProgress}% 完成</span>
            </div>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${studyProgress}%` }}></div>
          </div>
          <div className="feature-input-group">
            <input type="text" placeholder="讀書進度/目標" value={newStudy.title} onChange={e => setNewStudy({...newStudy, title: e.target.value})} />
            <input type="date" value={newStudy.targetDate} onChange={e => setNewStudy({...newStudy, targetDate: e.target.value})} />
            <button className="btn-primary" onClick={addStudy}>新增計畫</button>
          </div>
          <ul className="feature-list">
            {studyPlans.map((plan) => {
              const status = getStudyStatus(plan.targetDate, plan.isDone);
              return (
                <li key={plan.id} className={`study-item-card ${plan.isDone ? 'completed' : ''}`}>
                  <div className="item-main">
                    <span className="status-tag" style={{ color: status.color, backgroundColor: status.bg, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {status.text}
                    </span>
                    <span className="item-date">{plan.targetDate}</span>
                  </div>
                  <div className="item-content">
                    <input type="checkbox" checked={plan.isDone} onChange={() => {
                      setStudyPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isDone: !p.isDone } : p));
                    }} />
                    <span className="item-text">{plan.title}</span>
                    <button className="btn-delete" onClick={() => setStudyPlans(prev => prev.filter(p => p.id !== plan.id))}>&times;</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="expense-section">
          <div className="section-header">
            <h2>💰 每日消費</h2>
          </div>
          <div className="expense-summary">
            <div className="stat-card">
              <span className="stat-label">本月累計</span>
              <span className="stat-value">NT$ {totalExpense}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">日平均</span>
              <span className="stat-value">NT$ {avgExpense}</span>
            </div>
          </div>
          <div className="input-group">
            <input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
            <input type="text" placeholder="品項" value={newExpense.item} onChange={e => setNewExpense({...newExpense, item: e.target.value})} />
            <input type="number" placeholder="金額" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
            <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value})}>
              {expenseCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn-primary" onClick={addExpense}>記錄</button>
          </div>
          <div className="expense-grid-container">
            <table>
              <thead>
                <tr>
                  <th>日期</th>
                  <th>品項</th>
                  <th>類別</th>
                  <th>金額</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...expenses]
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .slice(0, 10)
                  .map((ex) => (
                    <tr key={ex.id}>
                      <td>{ex.date}</td>
                      <td>{ex.item}</td>
                      <td>
                        <span
                          className="badge"
                          style={{ backgroundColor: getExpenseStyle(ex.category).bg, color: getExpenseStyle(ex.category).text }}
                        >
                          {ex.category}
                        </span>
                      </td>
                      <td>NT$ {ex.amount}</td>
                      <td>
                        <button className="btn-delete" onClick={() => setExpenses(prev => prev.filter(e => e.id !== ex.id))}>&times;</button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="calendar-list">
        <h2>我的行程 ({events.length})</h2>
        <div className="event-grid">
          {[...events]
            .sort((a, b) => new Date(a.start) - new Date(b.start))
            .map(event => (
              <div key={event.id} className="event-card" style={{ borderLeftColor: getCategoryStyle(event.category).text }}>
                <div className="event-date">{event.start}</div>
                <div className="event-info">
                  <div className="event-summary">{event.summary}</div>
                  {event.description && <div className="event-desc">{event.description}</div>}
                </div>
                <div className="event-footer">
                  <span 
                    className="badge" 
                    style={{ backgroundColor: getCategoryStyle(event.category).bg, color: getCategoryStyle(event.category).text }}
                  >
                    {event.category}
                  </span>
                  <button 
                    className="btn-delete" 
                    onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}

export default App
