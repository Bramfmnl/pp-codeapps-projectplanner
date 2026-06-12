import { FolderKanban, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react'

interface Props {
  activeProjects: number
  overdueTasks: number
  openRisks: number
  budgetBurnPct: number
}

export function PortfolioView({ activeProjects, overdueTasks, openRisks, budgetBurnPct }: Props) {
  return (
    <div className="f-kpi-grid">
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-blue)' }} />
        <FolderKanban size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Active Projects</span>
        <span className="f-kpi-value">{activeProjects}</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-red)' }} />
        <AlertTriangle size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Overdue Tasks</span>
        <span className="f-kpi-value">{overdueTasks}</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-amber)' }} />
        <ShieldAlert size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Open Risks</span>
        <span className="f-kpi-value">{openRisks}</span>
      </div>
      <div className="f-kpi-card">
        <div className="f-kpi-stripe" style={{ background: 'var(--c-accent)' }} />
        <TrendingUp size={32} className="f-kpi-icon" />
        <span className="f-kpi-label">Budget Burn</span>
        <span className="f-kpi-value">{budgetBurnPct}%</span>
      </div>
    </div>
  )
}
