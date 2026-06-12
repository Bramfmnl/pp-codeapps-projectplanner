import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_budgetlines } from '../../generated/models/Vibe_budgetlinesModel'
import { Vibe_budgetlinesvibe_category } from '../../generated/models/Vibe_budgetlinesModel'
import type { Vibe_invoices } from '../../generated/models/Vibe_invoicesModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'

const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

interface BudgetForm {
  id: string; name: string; projectId: string; estimated: string; actual: string; category: string
}

interface Props {
  budgetLines: Vibe_budgetlines[]
  invoices: Vibe_invoices[]
  projects: Vibe_projects[]
  projectById: Record<string, string>
  budgetForm: BudgetForm
  setBudgetForm: (f: BudgetForm | ((p: BudgetForm) => BudgetForm)) => void
  upsertBudget: () => Promise<void>
  deleteBudget: () => Promise<void>
  resetBudgetForm: () => void
}

export function BudgetView({ budgetLines, invoices, projects, projectById, budgetForm, setBudgetForm, upsertBudget, deleteBudget, resetBudgetForm }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openEdit(line: Vibe_budgetlines) {
    setBudgetForm({ id: line.vibe_budgetlineid, name: line.vibe_name ?? '', projectId: line._vibe_projectid_value ?? '', estimated: `${line.vibe_estimatedamount ?? ''}`, actual: `${line.vibe_actualamount ?? ''}`, category: `${line.vibe_category ?? 100000005}` })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); resetBudgetForm() }
  async function handleSave() { await upsertBudget(); setModalOpen(false) }
  async function handleDelete() { await deleteBudget(); setModalOpen(false) }

  return (
    <div className="f-col-stack">
      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Budget Lines</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{budgetLines.length} lines</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetBudgetForm(); setModalOpen(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Name</th><th>Project</th><th>Category</th><th>Estimated</th><th>Actual</th></tr></thead>
          <tbody>
            {budgetLines.map((line) => (
              <tr key={line.vibe_budgetlineid} className="clickable" onClick={() => openEdit(line)}>
                <td>{line.vibe_name}</td>
                <td>{line._vibe_projectid_value ? (projectById[line._vibe_projectid_value] ?? '—') : '—'}</td>
                <td>{line.vibe_categoryname}</td>
                <td className="mono">{line.vibe_estimatedamount?.toLocaleString() ?? '—'}</td>
                <td className="mono">{line.vibe_actualamount?.toLocaleString() ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Invoices</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{invoices.length} invoices</span>
        </div>
        <table className="f-table">
          <thead><tr><th>Invoice #</th><th>Project</th><th>Issued</th><th>Due</th><th>Paid</th><th>Amount</th></tr></thead>
          <tbody>
            {invoices.map((i) => (
              <tr key={i.vibe_invoiceid}>
                <td className="mono">{i.vibe_invoicenumber}</td>
                <td>{i._vibe_projectid_value ? (projectById[i._vibe_projectid_value] ?? '—') : '—'}</td>
                <td className="mono">{i.vibe_dateissued?.slice(0, 10) ?? '—'}</td>
                <td className="mono">{i.vibe_duedate?.slice(0, 10) ?? '—'}</td>
                <td>{i.vibe_datepaid ? <Badge label={i.vibe_datepaid.slice(0, 10)} color="var(--c-green)" /> : <Badge label="Unpaid" color="var(--c-amber)" />}</td>
                <td className="mono">{i.vibe_amount?.toLocaleString() ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={budgetForm.id ? 'Edit Budget Line' : 'New Budget Line'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={budgetForm.name} onChange={(e) => setBudgetForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={budgetForm.projectId} onChange={(e) => setBudgetForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Category</label><select className="f-select" value={budgetForm.category} onChange={(e) => setBudgetForm((p) => ({ ...p, category: e.target.value }))}>{entries(Vibe_budgetlinesvibe_category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Estimated</label><input className="f-input" value={budgetForm.estimated} onChange={(e) => setBudgetForm((p) => ({ ...p, estimated: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Actual</label><input className="f-input" value={budgetForm.actual} onChange={(e) => setBudgetForm((p) => ({ ...p, actual: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>{budgetForm.id ? 'Update' : 'Create'} Budget Line</button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {budgetForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
