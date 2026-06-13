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

interface InvoiceForm {
  id: string; invoiceNumber: string; projectId: string; amount: string
  dateIssued: string; dueDate: string; datePaid: string; notes: string
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
  invoiceForm: InvoiceForm
  setInvoiceForm: (f: InvoiceForm | ((p: InvoiceForm) => InvoiceForm)) => void
  upsertInvoice: () => Promise<void>
  deleteInvoice: () => Promise<void>
  resetInvoiceForm: () => void
}

export function BudgetView({
  budgetLines, invoices, projects, projectById,
  budgetForm, setBudgetForm, upsertBudget, deleteBudget, resetBudgetForm,
  invoiceForm, setInvoiceForm, upsertInvoice, deleteInvoice, resetInvoiceForm,
}: Props) {
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  function openEditBudget(line: Vibe_budgetlines) {
    setBudgetForm({ id: line.vibe_budgetlineid, name: line.vibe_name ?? '', projectId: line._vibe_projectid_value ?? '', estimated: `${line.vibe_estimatedamount ?? ''}`, actual: `${line.vibe_actualamount ?? ''}`, category: `${line.vibe_category ?? 100000005}` })
    setBudgetModalOpen(true)
  }

  function openEditInvoice(inv: Vibe_invoices) {
    setInvoiceForm({
      id: inv.vibe_invoiceid,
      invoiceNumber: inv.vibe_invoicenumber ?? '',
      projectId: inv._vibe_projectid_value ?? '',
      amount: `${inv.vibe_amount ?? ''}`,
      dateIssued: inv.vibe_dateissued?.slice(0, 10) ?? '',
      dueDate: inv.vibe_duedate?.slice(0, 10) ?? '',
      datePaid: inv.vibe_datepaid?.slice(0, 10) ?? '',
      notes: inv.vibe_notes ?? '',
    })
    setInvoiceModalOpen(true)
  }

  function closeBudgetModal() { setBudgetModalOpen(false); resetBudgetForm() }
  function closeInvoiceModal() { setInvoiceModalOpen(false); resetInvoiceForm() }

  async function handleSaveBudget() { await upsertBudget(); setBudgetModalOpen(false) }
  async function handleDeleteBudget() { await deleteBudget(); setBudgetModalOpen(false) }
  async function handleSaveInvoice() { await upsertInvoice(); setInvoiceModalOpen(false) }
  async function handleDeleteInvoice() { await deleteInvoice(); setInvoiceModalOpen(false) }

  const totalEstimated = budgetLines.reduce((s, l) => s + (l.vibe_estimatedamount ?? 0), 0)
  const totalActual = budgetLines.reduce((s, l) => s + (l.vibe_actualamount ?? 0), 0)
  const totalInvoiced = invoices.reduce((s, i) => s + (i.vibe_amount ?? 0), 0)
  const totalPaid = invoices.filter((i) => i.vibe_datepaid).reduce((s, i) => s + (i.vibe_amount ?? 0), 0)

  return (
    <div className="f-col-stack">
      <div className="f-kpi-row">
        <div className="f-kpi-mini"><span className="f-kpi-mini-label">Estimated</span><span className="f-kpi-mini-value">{totalEstimated.toLocaleString()}</span></div>
        <div className="f-kpi-mini"><span className="f-kpi-mini-label">Actual Spend</span><span className="f-kpi-mini-value">{totalActual.toLocaleString()}</span></div>
        <div className="f-kpi-mini"><span className="f-kpi-mini-label">Total Invoiced</span><span className="f-kpi-mini-value">{totalInvoiced.toLocaleString()}</span></div>
        <div className="f-kpi-mini"><span className="f-kpi-mini-label">Paid</span><span className="f-kpi-mini-value" style={{ color: 'var(--c-green)' }}>{totalPaid.toLocaleString()}</span></div>
        <div className="f-kpi-mini"><span className="f-kpi-mini-label">Outstanding</span><span className="f-kpi-mini-value" style={{ color: 'var(--c-amber)' }}>{(totalInvoiced - totalPaid).toLocaleString()}</span></div>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Budget Lines</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{budgetLines.length} lines</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetBudgetForm(); setBudgetModalOpen(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Name</th><th>Project</th><th>Category</th><th>Estimated</th><th>Actual</th><th>Variance</th></tr></thead>
          <tbody>
            {budgetLines.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '20px' }}>No budget lines yet — click + New to add one</td></tr>
            )}
            {budgetLines.map((line) => {
              const variance = (line.vibe_estimatedamount ?? 0) - (line.vibe_actualamount ?? 0)
              return (
                <tr key={line.vibe_budgetlineid} className="clickable" onClick={() => openEditBudget(line)}>
                  <td>{line.vibe_name}</td>
                  <td>{line._vibe_projectid_value ? (projectById[line._vibe_projectid_value] ?? '—') : '—'}</td>
                  <td>{line.vibe_categoryname ?? '—'}</td>
                  <td className="mono">{line.vibe_estimatedamount?.toLocaleString() ?? '—'}</td>
                  <td className="mono">{line.vibe_actualamount?.toLocaleString() ?? '—'}</td>
                  <td className="mono" style={{ color: variance >= 0 ? 'var(--c-green)' : 'var(--c-red)' }}>
                    {variance >= 0 ? '+' : ''}{variance.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Invoices</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{invoices.length} invoices</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetInvoiceForm(); setInvoiceModalOpen(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Invoice #</th><th>Project</th><th>Issued</th><th>Due</th><th>Status</th><th>Amount</th><th>Notes</th></tr></thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '20px' }}>No invoices yet — click + New to create one</td></tr>
            )}
            {invoices.map((i) => (
              <tr key={i.vibe_invoiceid} className="clickable" onClick={() => openEditInvoice(i)}>
                <td className="mono">{i.vibe_invoicenumber ?? '—'}</td>
                <td>{i._vibe_projectid_value ? (projectById[i._vibe_projectid_value] ?? '—') : '—'}</td>
                <td className="mono">{i.vibe_dateissued?.slice(0, 10) ?? '—'}</td>
                <td className="mono">{i.vibe_duedate?.slice(0, 10) ?? '—'}</td>
                <td>{i.vibe_datepaid ? <Badge label={`Paid ${i.vibe_datepaid.slice(0, 10)}`} color="var(--c-green)" /> : <Badge label="Unpaid" color="var(--c-amber)" />}</td>
                <td className="mono">{i.vibe_amount?.toLocaleString() ?? '—'}</td>
                <td style={{ color: 'var(--c-text-3)', fontSize: 12 }}>{i.vibe_notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={budgetModalOpen} onClose={closeBudgetModal} title={budgetForm.id ? 'Edit Budget Line' : 'New Budget Line'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={budgetForm.name} onChange={(e) => setBudgetForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field">
            <label className="f-label">Project</label>
            <select className="f-select" value={budgetForm.projectId} onChange={(e) => setBudgetForm((p) => ({ ...p, projectId: e.target.value }))}>
              <option value="">— Select project —</option>
              {projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}
            </select>
          </div>
          <div className="f-field"><label className="f-label">Category</label><select className="f-select" value={budgetForm.category} onChange={(e) => setBudgetForm((p) => ({ ...p, category: e.target.value }))}>{entries(Vibe_budgetlinesvibe_category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Estimated</label><input className="f-input" type="number" value={budgetForm.estimated} onChange={(e) => setBudgetForm((p) => ({ ...p, estimated: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Actual</label><input className="f-input" type="number" value={budgetForm.actual} onChange={(e) => setBudgetForm((p) => ({ ...p, actual: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSaveBudget}>{budgetForm.id ? 'Update' : 'Create'} Budget Line</button>
          <button className="f-btn" onClick={closeBudgetModal}>Cancel</button>
          {budgetForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDeleteBudget}>Delete</button>}
        </div>
      </Modal>

      <Modal open={invoiceModalOpen} onClose={closeInvoiceModal} title={invoiceForm.id ? 'Edit Invoice' : 'New Invoice'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Invoice number</label><input className="f-input" placeholder="INV-001" value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceNumber: e.target.value }))} /></div>
          <div className="f-field">
            <label className="f-label">Project</label>
            <select className="f-select" value={invoiceForm.projectId} onChange={(e) => setInvoiceForm((p) => ({ ...p, projectId: e.target.value }))}>
              <option value="">— Select project —</option>
              {projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}
            </select>
          </div>
          <div className="f-field"><label className="f-label">Amount</label><input className="f-input" type="number" value={invoiceForm.amount} onChange={(e) => setInvoiceForm((p) => ({ ...p, amount: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Date issued</label><input className="f-input" type="date" value={invoiceForm.dateIssued} onChange={(e) => setInvoiceForm((p) => ({ ...p, dateIssued: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Due date</label><input className="f-input" type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Date paid <span style={{ color: 'var(--c-text-3)', fontWeight: 400 }}>(leave blank if unpaid)</span></label><input className="f-input" type="date" value={invoiceForm.datePaid} onChange={(e) => setInvoiceForm((p) => ({ ...p, datePaid: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Notes</label><input className="f-input" value={invoiceForm.notes} onChange={(e) => setInvoiceForm((p) => ({ ...p, notes: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSaveInvoice}>{invoiceForm.id ? 'Update' : 'Create'} Invoice</button>
          <button className="f-btn" onClick={closeInvoiceModal}>Cancel</button>
          {invoiceForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDeleteInvoice}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
