import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Vibe_tasks } from '../../generated/models/Vibe_tasksModel'

const STATUS_COLORS: Record<number, string> = {
  100000001: '#f59e0b',
  100000002: '#ef4444',
  100000000: '#94a3b8',
  100000003: '#10b981',
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface Props {
  tasks: Vibe_tasks[]
  onEdit: (task: Vibe_tasks) => void
  onNew: (status?: number) => void
}

export function CalendarView({ tasks, onEdit, onNew }: Props) {
  const [monthDate, setMonthDate] = useState(() => startOfMonth(new Date()))

  function prevMonth() { setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }
  function goToday()   { setMonthDate(startOfMonth(new Date())) }

  const year  = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const todayStr = isoDate(new Date())

  const tasksByDate = new Map<string, Vibe_tasks[]>()
  for (const t of tasks) {
    if (!t.vibe_duedate) continue
    const key = t.vibe_duedate.slice(0, 10)
    if (!tasksByDate.has(key)) tasksByDate.set(key, [])
    tasksByDate.get(key)!.push(t)
  }

  // Build grid: Monday-first weeks
  const firstDay = new Date(year, month, 1)
  // dayOfWeek: 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7

  const cells: Array<{ date: Date | null; dateStr: string | null }> = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ date: null, dateStr: null })
    } else {
      const d = new Date(year, month, dayNum)
      cells.push({ date: d, dateStr: isoDate(d) })
    }
  }

  return (
    <div className="cal-view">
      <div className="cal-nav">
        <button className="f-btn" onClick={prevMonth}><ChevronLeft size={14} /></button>
        <span className="cal-nav-label">{MONTH_NAMES[month]} {year}</span>
        <button className="f-btn" onClick={nextMonth}><ChevronRight size={14} /></button>
        <button className="f-btn" style={{ marginLeft: 8 }} onClick={goToday}>Today</button>
      </div>

      <div className="cal-weekdays">
        {DAY_LABELS.map((d) => <div key={d} className="cal-weekday">{d}</div>)}
      </div>

      <div className="cal-grid" style={{ gridTemplateRows: `repeat(${totalCells / 7}, minmax(100px, 1fr))` }}>
        {cells.map((cell, i) => {
          const isToday = cell.dateStr === todayStr
          const dayTasks = cell.dateStr ? (tasksByDate.get(cell.dateStr) ?? []) : []
          const shown = dayTasks.slice(0, 3)
          const overflow = dayTasks.length - shown.length

          return (
            <div
              key={i}
              className={`cal-day${!cell.date ? ' cal-day-outside' : ''}${isToday ? ' cal-day-today' : ''}`}
              onClick={() => cell.date && onNew(100000000)}
            >
              {cell.date && (
                <>
                  <span className="cal-day-num">{cell.date.getDate()}</span>
                  <div className="cal-tasks">
                    {shown.map((t) => (
                      <div
                        key={t.vibe_taskid}
                        className="cal-task-chip"
                        style={{ borderLeftColor: STATUS_COLORS[t.vibe_taskstatus ?? 100000000] }}
                        onClick={(e) => { e.stopPropagation(); onEdit(t) }}
                        title={t.vibe_name ?? ''}
                      >
                        {t.vibe_name ?? '(Unnamed)'}
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div className="cal-overflow">+{overflow} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
