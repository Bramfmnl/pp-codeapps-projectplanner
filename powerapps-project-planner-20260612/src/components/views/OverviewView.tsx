import { CheckSquare, Users, TrendingUp, Clock } from 'lucide-react'

interface Props {
  taskCount: number
  teamCount: number
  budgetBurnPct: number
  hoursLogged: number
}

export function OverviewView({ taskCount, teamCount, budgetBurnPct, hoursLogged }: Props) {
  return (
    <div className="f-kpi-grid">
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-blue)' }} />
        <CheckSquare size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Tasks</span>
        <span className="f-kpi-value">{taskCount}</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-green)' }} />
        <Users size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Team Members</span>
        <span className="f-kpi-value">{teamCount}</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-accent)' }} />
        <TrendingUp size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Budget Burn</span>
        <span className="f-kpi-value">{budgetBurnPct}%</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-purple)' }} />
        <Clock size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Hours Logged</span>
        <span className="f-kpi-value">{hoursLogged.toFixed(0)}</span>
      </div>
    </div>
  )
}
