import './App.css'

function App() {
  const months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];

  return (
    <div className="app-container">
      <header className="header">
        <h1>Moredan 2026</h1>
        <div className="controls">
          {/* Controls will go here */}
          <button>Add Event</button>
          <button>Manage Categories</button>
        </div>
      </header>
      
      <main className="calendar-grid">
        {months.map((month) => (
          <div key={month} className="month-container">
            <div className="month-title">{month}</div>
            <div className="days-grid">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="day-cell day-header">{d}</div>
              ))}
              {/* Dummy days for now */}
              {Array.from({ length: 31 }).map((_, i) => (
                <div key={i} className="day-cell">{i + 1}</div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default App
