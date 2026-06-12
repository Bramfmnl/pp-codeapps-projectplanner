import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_deliverables } from '../../generated/models/Vibe_deliverablesModel'
import { Vibe_deliverablesvibe_deliverablestatus } from '../../generated/models/Vibe_deliverablesModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'

const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

function statusColor(name: string | undefined): string {
  const n = (name ?? '').toLowerCase()
  if (n.includes('complet') || n.includes('done') || n.includes('closed')) return 'var(--c-green)'
  if (n.includes('progress') || n.includes('review')) return 'var(--c-blue)'
  if (n.includes('hold') || n.includes('pending')) return 'var(--c-amber)'
  if (n.includes('cancel')) return 'var(--c-red)'
  return 'var(--c-text-2)'
}

interface DeliverableForm { id: string; name: string; projectId: string; dueDate: string; status: string; documentLink: string; responsibleId: string }

interface Props {
  deliverables: Vibe_deliverables[]; projects: Vibe_projects[]; teamMembers: Vibe_projectteammembers[]
  projectById: Record<string, string>
  deliverableForm: DeliverableForm; setDeliverableForm: (f: DeliverableForm | ((p: DeliverableForm) => DeliverableForm)) => void
  upsertDeliverable: () => Promise<void>; deleteDeliverable: () => Promise<void>; resetDeliverableForm: () => void
}

export function DeliverablesView({ deliverables, projects, teamMembers, projectById, deliverableForm, setDeliverableForm, upsertDeliverable, deleteDeliverable, resetDeliverableForm }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openEdit(d: Vibe_deliverables) {
    setDeliverableForm({ id: d.vibe_deliverableid, name: d.vibe_name ?? '', projectId: d._vibe_projectid_value ?? '', dueDate: d.vibe_duedate?.slice(0, 10) ?? '', status: `${d.vibe_deliverablestatus ?? 100000000}`, documentLink: d.vibe_documentlink ?? '', responsibleId: d._vibe_responsibleid_value ?? '' })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); resetDeliverableForm() }
  async function handleSave() { await upsertDeliverable(); setModalOpen(false) }
  async function handleDelete() { await deleteDeliverable(); setModalOpen(false) }

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Deliverables</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{deliverables.length} items</span>
          <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetDeliverableForm(); setModalOpen(true) }}>+ New</button>
        </div>
      </div>
      <table className="f-table">
        <thead><tr><th>Name</th><th>Project</th><th>Responsible</th><th>Due</th><th>Status</th></tr></thead>
        <tbody>
          {deliverables.map((d) => (
            <tr key={d.vibe_deliverableid} className="clickable" onClick={() => openEdit(d)}>
              <td>{d.vibe_name}</td>
              <td>{d._vibe_projectid_value ? (projectById[d._vibe_projectid_value] ?? '—') : '—'}</td>
              <td>{d.vibe_responsibleidname ?? '—'}</td>
              <td className="mono">{d.vibe_duedate?.slice(0, 10) ?? '—'}</td>
              <td><Badge label={d.vibe_deliverablestatusname ?? '—'} color={statusColor(d.vibe_deliverablestatusname)} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={modalOpen} onClose={closeModal} title={deliverableForm.id ? 'Edit Deliverable' : 'New Deliverable'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={deliverableForm.name} onChange={(e) => setDeliverableForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={deliverableForm.projectId} onChange={(e) => setDeliverableForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Responsible</label><select className="f-select" value={deliverableForm.responsibleId} onChange={(e) => setDeliverableForm((p) => ({ ...p, responsibleId: e.target.value }))}><option value="">None</option>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Due date</label><input className="f-input" type="date" value={deliverableForm.dueDate} onChange={(e) => setDeliverableForm((p) => ({ ...p, dueDate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Status</label><select className="f-select" value={deliverableForm.status} onChange={(e) => setDeliverableForm((p) => ({ ...p, status: e.target.value }))}>{entries(Vibe_deliverablesvibe_deliverablestatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Document link</label><input className="f-input" value={deliverableForm.documentLink} onChange={(e) => setDeliverableForm((p) => ({ ...p, documentLink: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>{deliverableForm.id ? 'Update' : 'Create'} Deliverable</button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {deliverableForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
