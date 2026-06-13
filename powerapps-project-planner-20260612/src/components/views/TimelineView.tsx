import { useMemo } from 'react'
import type { Vibe_tasks } from '../../generated/models/Vibe_tasksModel'
import type { Vibe_projectphases } from '../../generated/models/Vibe_projectphasesModel'

const DAY_PX  = 26
const ROW_H   = 32
const PHASE_H = 28
const LEFT_W  = 220

const STATUS_COLORS: Record<number, string> = {
  100000000: '#94a3b8',
  100000001: '#f59e0b',
  100000002: '#ef4444',
  100000003: '#10b981',
}

function startOfDay(ms: number) {
  const d = new Date(ms)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

interface Props {
  tasks: Vibe_tasks[]
  phases: Vibe_projectphases[]
  phaseById: Record<string, string>
}

export function TimelineView({ tasks, phaseById }: Props) {
  const { rangeStart, totalDays } = useMemo(() => {
    const dates: number[] = []
    for (const t of tasks) {
      if (t.vibe_startdate) dates.push(startOfDay(new Date(t.vibe_startdate).getTime()))
      if (t.vibe_duedate)   dates.push(startOfDay(new Date(t.vibe_duedate).getTime()))
    }
    if (dates.length === 0) {
      const now = startOfDay(Date.now())
      return { rangeStart: now, totalDays: 28 }
    }
    const minMs = Math.min(...dates) - 7 * 86400000
    const maxMs = Math.max(...dates) + 7 * 86400000
    // snap start to nearest Monday
    const d = new Date(minMs)
    const dow = (d.getDay() + 6) % 7
    const snapped = startOfDay(minMs) - dow * 86400000
    const end = Math.max(maxMs, snapped + 28 * 86400000)
    const days = Math.ceil((end - snapped) / 86400000)
    return { rangeStart: snapped, totalDays: days }
  }, [tasks])

  const weeks = useMemo(() => {
    const result: Array<{ label: string; day: number }> = []
    for (let d = 0; d < totalDays; d += 7) {
      const dt = new Date(rangeStart + d * 86400000)
      const label = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      result.push({ label, day: d })
    }
    return result
  }, [rangeStart, totalDays])

  const todayDay = Math.round((startOfDay(Date.now()) - rangeStart) / 86400000)
  const totalWidth = totalDays * DAY_PX

  const groups = useMemo(() => {
    const noPhase: Vibe_tasks[] = []
    const byPhase: Record<string, Vibe_tasks[]> = {}
    for (const t of tasks) {
      if (t._vibe_phaseid_value) {
        ;(byPhase[t._vibe_phaseid_value] ??= []).push(t)
      } else {
        noPhase.push(t)
      }
    }
    const result: Array<{ phaseId: string | null; label: string; tasks: Vibe_tasks[] }> = []
    if (noPhase.length) result.push({ phaseId: null, label: 'No Phase', tasks: noPhase })
    for (const [phaseId, pts] of Object.entries(byPhase)) {
      result.push({ phaseId, label: phaseById[phaseId] ?? phaseId, tasks: pts })
    }
    return result
  }, [tasks, phaseById])

  function barPos(t: Vibe_tasks): { left: number; width: number } | null {
    if (!t.vibe_duedate) return null
    const dueDay   = Math.round((startOfDay(new Date(t.vibe_duedate).getTime()) - rangeStart) / 86400000)
    const startDay = t.vibe_startdate
      ? Math.round((startOfDay(new Date(t.vibe_startdate).getTime()) - rangeStart) / 86400000)
      : dueDay
    return {
      left:  startDay * DAY_PX,
      width: Math.max(DAY_PX, (dueDay - startDay + 1) * DAY_PX),
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="view-empty-state">
        <p>No tasks yet — add tasks with start and due dates to see the timeline.</p>
      </div>
    )
  }

  return (
    <div className="tl-view">
      {/* Single scrollable container — rows sticky horizontally, header row sticky vertically */}
      <div className="tl-body">
        {/* Scale / header row — sticks to top */}
        <div className="tl-row tl-header-row" style={{ height: PHASE_H }}>
          <div className="tl-left-cell tl-header-cell" style={{ width: LEFT_W, height: PHASE_H }}>
            <span className="tl-cell-label">Task</span>
          </div>
          <div className="tl-bar-cell" style={{ width: totalWidth, height: PHASE_H }}>
            {weeks.map((w) => (
              <div key={w.day} className="tl-week-tick" style={{ left: w.day * DAY_PX }}>
                {w.label}
              </div>
            ))}
            {/* Alternating week shading in header */}
            {weeks.map((w) => (
              <div
                key={`bg-${w.day}`}
                className={`tl-week-bg${Math.floor(w.day / 7) % 2 === 1 ? ' alt' : ''}`}
                style={{ left: w.day * DAY_PX, width: 7 * DAY_PX }}
              />
            ))}
          </div>
        </div>

        {/* Task groups */}
        {groups.map((g) => (
          <div key={g.phaseId ?? '__none'}>
            {/* Phase header */}
            <div className="tl-row tl-phase-row" style={{ height: PHASE_H }}>
              <div className="tl-left-cell tl-phase-label" style={{ width: LEFT_W, height: PHASE_H }}>
                {g.label}
              </div>
              <div className="tl-bar-cell tl-phase-bar-cell" style={{ width: totalWidth, height: PHASE_H }}>
                {weeks.map((w) => (
                  <div
                    key={w.day}
                    className={`tl-week-bg${Math.floor(w.day / 7) % 2 === 1 ? ' alt' : ''}`}
                    style={{ left: w.day * DAY_PX, width: 7 * DAY_PX }}
                  />
                ))}
              </div>
            </div>

            {/* Task rows */}
            {g.tasks.map((t) => {
              const bar = barPos(t)
              const color = STATUS_COLORS[t.vibe_taskstatus ?? 100000000]
              return (
                <div key={t.vibe_taskid} className="tl-row" style={{ height: ROW_H }}>
                  <div
                    className="tl-left-cell tl-task-label"
                    style={{ width: LEFT_W, height: ROW_H }}
                    title={t.vibe_name ?? ''}
                  >
                    <span
                      className="tl-task-dot"
                      style={{ background: color }}
                    />
                    {t.vibe_name ?? '(Unnamed)'}
                  </div>
                  <div className="tl-bar-cell" style={{ width: totalWidth, height: ROW_H }}>
                    {/* Week shading */}
                    {weeks.map((w) => (
                      <div
                        key={w.day}
                        className={`tl-week-bg${Math.floor(w.day / 7) % 2 === 1 ? ' alt' : ''}`}
                        style={{ left: w.day * DAY_PX, width: 7 * DAY_PX }}
                      />
                    ))}
                    {/* Today line */}
                    {todayDay >= 0 && todayDay <= totalDays && (
                      <div className="tl-today-line" style={{ left: todayDay * DAY_PX }} />
                    )}
                    {/* Task bar */}
                    {bar && (
                      <div
                        className="tl-bar"
                        style={{ left: bar.left, width: bar.width, background: color }}
                        title={`${t.vibe_name ?? ''}${t.vibe_startdate ? ` · ${t.vibe_startdate.slice(0, 10)}` : ''} → ${t.vibe_duedate?.slice(0, 10) ?? ''}`}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
