import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_risks } from '../../generated/models/Vibe_risksModel'
import { Vibe_risksvibe_impact, Vibe_risksvibe_probability, Vibe_risksvibe_riskstatus } from '../../generated/models/Vibe_risksModel'
import type { Vibe_issues } from '../../generated/models/Vibe_issuesModel'
import { Vibe_issuesvibe_issuestatus, Vibe_issuesvibe_severity } from '../../generated/models/Vibe_issuesModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'

const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

function statusColor(name: string | undefined): string {
  const n = (name ?? '').toLowerCase()
  if (n.includes('complet') || n.includes('done') || n.includes('closed') || n.includes('paid')) return 'var(--c-green)'
  if (n.includes('progress') || n.includes('review') || n.includes('open') || n.includes('planning')) return 'var(--c-blue)'
  if (n.includes('hold') || n.includes('pending') || n.includes('medium') || n.includes('monitor')) return 'var(--c-amber)'
  if (n.includes('cancel') || n.includes('blocked') || n.includes('critical') || n.includes('high') || n.includes('overdue')) return 'var(--c-red)'
  if (n.includes('mitigat') || n.includes('accept') || n.includes('transfer')) return 'var(--c-purple)'
  return 'var(--c-text-2)'
}

interface RiskForm { id: string; title: string; projectId: string; probability: string; impact: string; status: string }
interface IssueForm { id: string; title: string; projectId: string; severity: string; status: string }

interface Props {
  risks: Vibe_risks[]; issues: Vibe_issues[]; projects: Vibe_projects[]
  riskForm: RiskForm; setRiskForm: (f: RiskForm | ((p: RiskForm) => RiskForm)) => void; upsertRisk: () => Promise<void>; deleteRisk: () => Promise<void>; resetRiskForm: () => void
  issueForm: IssueForm; setIssueForm: (f: IssueForm | ((p: IssueForm) => IssueForm)) => void; upsertIssue: () => Promise<void>; deleteIssue: () => Promise<void>; resetIssueForm: () => void
}

export function RaidView({ risks, issues, projects, riskForm, setRiskForm, upsertRisk, deleteRisk, resetRiskForm, issueForm, setIssueForm, upsertIssue, deleteIssue, resetIssueForm }: Props) {
  const [riskModal, setRiskModal] = useState(false)
  const [issueModal, setIssueModal] = useState(false)

  return (
    <div className="f-two-col">
      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Risks</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{risks.length}</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetRiskForm(); setRiskModal(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Title</th><th>Status</th><th>Score</th></tr></thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.vibe_riskid} className="clickable" onClick={() => { setRiskForm({ id: risk.vibe_riskid, title: risk.vibe_title ?? '', projectId: risk._vibe_projectid_value ?? '', probability: `${risk.vibe_probability ?? 100000002}`, impact: `${risk.vibe_impact ?? 100000002}`, status: `${risk.vibe_riskstatus ?? 100000000}` }); setRiskModal(true) }}>
                <td>{risk.vibe_title}</td>
                <td><Badge label={risk.vibe_riskstatusname ?? '—'} color={statusColor(risk.vibe_riskstatusname)} /></td>
                <td className="mono">{risk.vibe_riskscore ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={riskModal} onClose={() => { setRiskModal(false); resetRiskForm() }} title={riskForm.id ? 'Edit Risk' : 'New Risk'}>
          <div className="modal-body">
            <div className="f-field"><label className="f-label">Title</label><input className="f-input" value={riskForm.title} onChange={(e) => setRiskForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={riskForm.projectId} onChange={(e) => setRiskForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
            <div className="f-field"><label className="f-label">Probability</label><select className="f-select" value={riskForm.probability} onChange={(e) => setRiskForm((p) => ({ ...p, probability: e.target.value }))}>{entries(Vibe_risksvibe_probability).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="f-field"><label className="f-label">Impact</label><select className="f-select" value={riskForm.impact} onChange={(e) => setRiskForm((p) => ({ ...p, impact: e.target.value }))}>{entries(Vibe_risksvibe_impact).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="f-field"><label className="f-label">Status</label><select className="f-select" value={riskForm.status} onChange={(e) => setRiskForm((p) => ({ ...p, status: e.target.value }))}>{entries(Vibe_risksvibe_riskstatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div className="modal-footer">
            <button className="f-btn f-btn-primary" onClick={async () => { await upsertRisk(); setRiskModal(false) }}>{riskForm.id ? 'Update' : 'Create'} Risk</button>
            <button className="f-btn" onClick={() => { setRiskModal(false); resetRiskForm() }}>Cancel</button>
            {riskForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteRisk(); setRiskModal(false) }}>Delete</button>}
          </div>
        </Modal>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Issues</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{issues.length}</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetIssueForm(); setIssueModal(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Title</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>
            {issues.map((issue) => (
              <tr key={issue.vibe_issueid} className="clickable" onClick={() => { setIssueForm({ id: issue.vibe_issueid, title: issue.vibe_title ?? '', projectId: issue._vibe_projectid_value ?? '', severity: `${issue.vibe_severity ?? 100000001}`, status: `${issue.vibe_issuestatus ?? 100000000}` }); setIssueModal(true) }}>
                <td>{issue.vibe_title}</td>
                <td><Badge label={issue.vibe_severityname ?? '—'} color={statusColor(issue.vibe_severityname)} /></td>
                <td><Badge label={issue.vibe_issuestatusname ?? '—'} color={statusColor(issue.vibe_issuestatusname)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={issueModal} onClose={() => { setIssueModal(false); resetIssueForm() }} title={issueForm.id ? 'Edit Issue' : 'New Issue'}>
          <div className="modal-body">
            <div className="f-field"><label className="f-label">Title</label><input className="f-input" value={issueForm.title} onChange={(e) => setIssueForm((p) => ({ ...p, title: e.target.value }))} /></div>
            <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={issueForm.projectId} onChange={(e) => setIssueForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
            <div className="f-field"><label className="f-label">Severity</label><select className="f-select" value={issueForm.severity} onChange={(e) => setIssueForm((p) => ({ ...p, severity: e.target.value }))}>{entries(Vibe_issuesvibe_severity).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div className="f-field"><label className="f-label">Status</label><select className="f-select" value={issueForm.status} onChange={(e) => setIssueForm((p) => ({ ...p, status: e.target.value }))}>{entries(Vibe_issuesvibe_issuestatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div className="modal-footer">
            <button className="f-btn f-btn-primary" onClick={async () => { await upsertIssue(); setIssueModal(false) }}>{issueForm.id ? 'Update' : 'Create'} Issue</button>
            <button className="f-btn" onClick={() => { setIssueModal(false); resetIssueForm() }}>Cancel</button>
            {issueForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteIssue(); setIssueModal(false) }}>Delete</button>}
          </div>
        </Modal>
      </div>
    </div>
  )
}
