import { FolderKanban, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react'
import type { AppTab } from '../../App'

interface Props {
  activeProjects: number
  overdueTasks: number
  openRisks: number
  budgetBurnPct: number
  onNavigate: (tab: AppTab) => void
}

export function PortfolioView({ activeProjects, overdueTasks, openRisks, budgetBurnPct, onNavigate }: Props) {
  return (
    <div className="f-col-stack">
      <div className="f-kpi-grid">
        <div className="f-kpi-card f-kpi-card-clickable" onClick={() => onNavigate('home')}>
          <div className="f-kpi-stripe" style={{ background: 'var(--c-blue)' }} />
          <FolderKanban size={32} className="f-kpi-icon" />
          <span className="f-kpi-label">Active Projects</span>
          <span className="f-kpi-value">{activeProjects}</span>
          <span className="f-kpi-hint">View projects →</span>
        </div>
        <div className="f-kpi-card f-kpi-card-clickable" style={{ '--stripe-color': 'var(--c-red)' } as React.CSSProperties} onClick={() => onNavigate('tasks')}>
          <div className="f-kpi-stripe" style={{ background: 'var(--c-red)' }} />
          <AlertTriangle size={32} className="f-kpi-icon" />
          <span className="f-kpi-label">Overdue Tasks</span>
          <span className="f-kpi-value" style={{ color: overdueTasks > 0 ? 'var(--c-red)' : undefined }}>{overdueTasks}</span>
          <span className="f-kpi-hint">View tasks →</span>
        </div>
        <div className="f-kpi-card f-kpi-card-clickable" onClick={() => onNavigate('raid')}>
          <div className="f-kpi-stripe" style={{ background: 'var(--c-amber)' }} />
          <ShieldAlert size={32} className="f-kpi-icon" />
          <span className="f-kpi-label">Open Risks</span>
          <span className="f-kpi-value" style={{ color: openRisks > 0 ? 'var(--c-amber)' : undefined }}>{openRisks}</span>
          <span className="f-kpi-hint">View RAID log →</span>
        </div>
        <div className="f-kpi-card f-kpi-card-clickable" onClick={() => onNavigate('budget')}>
          <div className="f-kpi-stripe" style={{ background: 'var(--c-accent)' }} />
          <TrendingUp size={32} className="f-kpi-icon" />
          <span className="f-kpi-label">Budget Burn</span>
          <span className="f-kpi-value" style={{ color: budgetBurnPct > 90 ? 'var(--c-red)' : budgetBurnPct > 70 ? 'var(--c-amber)' : undefined }}>{budgetBurnPct}%</span>
          <span className="f-kpi-hint">View budget →</span>
        </div>
      </div>
    </div>
  )
}
