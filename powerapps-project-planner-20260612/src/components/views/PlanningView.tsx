import { useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Vibe_resourceallocations } from '../../generated/models/Vibe_resourceallocationsModel'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'

interface AllocationForm {
  id: string; name: string; projectId: string; teamMemberId: string
  weekStartDate: string; plannedHours: string; actualHours: string
}

interface Props {
  allocations: Vibe_resourceallocations[]
  teamMembers: Vibe_projectteammembers[]
  projects: Vibe_projects[]
  projectById: Record<string, string>
  allocationForm: AllocationForm
  setAllocationForm: (f: AllocationForm | ((p: AllocationForm) => AllocationForm)) => void
  upsertAllocation: () => Promise<void>
  deleteAllocation: () => Promise<void>
  resetAllocationForm: () => void
}

export function PlanningView({
  allocations, teamMembers, projects, projectById,
  allocationForm, setAllocationForm, upsertAllocation, deleteAllocation, resetAllocationForm,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openEdit(a: Vibe_resourceallocations) {
    setAllocationForm({
      id: a.vibe_resourceallocationid,
      name: a.vibe_name ?? '',
      projectId: a._vibe_projectid_value ?? '',
      teamMemberId: a._vibe_projectteammemberid_value ?? '',
      weekStartDate: a.vibe_weekstartdate?.slice(0, 10) ?? '',
      plannedHours: `${a.vibe_plannedhours ?? ''}`,
      actualHours: `${a.vibe_actualhours ?? ''}`,
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); resetAllocationForm() }
  async function handleSave() { await upsertAllocation(); setModalOpen(false) }
  async function handleDelete() { await deleteAllocation(); setModalOpen(false) }

  const totalPlanned = allocations.reduce((s, a) => s + (a.vibe_plannedhours ?? 0), 0)
  const totalActual = allocations.reduce((s, a) => s + (a.vibe_actualhours ?? 0), 0)

  const filteredMembers = allocationForm.projectId
    ? teamMembers.filter((m) => m._vibe_projectid_value === allocationForm.projectId)
    : teamMembers

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Resource Planning</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
            {allocations.length} allocations · {totalPlanned}h planned · {totalActual}h actual
          </span>
          <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetAllocationForm(); setModalOpen(true) }}>+ New</button>
        </div>
      </div>
      <div>
        <table className="f-table">
          <thead>
            <tr>
              <th>Name</th><th>Project</th><th>Member</th><th>Week Start</th><th>Planned hrs</th><th>Actual hrs</th><th>Utilisation</th>
            </tr>
          </thead>
          <tbody>
            {allocations.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '20px' }}>No allocations yet — click + New to plan resource time</td></tr>
            )}
            {allocations.map((a) => {
              const util = a.vibe_plannedhours ? Math.round(((a.vibe_actualhours ?? 0) / a.vibe_plannedhours) * 100) : 0
              return (
                <tr key={a.vibe_resourceallocationid} className="clickable" onClick={() => openEdit(a)}>
                  <td>{a.vibe_name ?? '—'}</td>
                  <td>{a._vibe_projectid_value ? (projectById[a._vibe_projectid_value] ?? '—') : '—'}</td>
                  <td>{a.vibe_projectteammemberidname ?? '—'}</td>
                  <td className="mono">{a.vibe_weekstartdate?.slice(0, 10) ?? '—'}</td>
                  <td>
                    <span className={`f-badge ${(a.vibe_plannedhours ?? 0) > 40 ? 'f-badge-danger' : (a.vibe_plannedhours ?? 0) === 40 ? 'f-badge-info' : 'f-badge-success'}`}>
                      {a.vibe_plannedhours ?? 0}h
                    </span>
                  </td>
                  <td className="mono">{a.vibe_actualhours ?? 0}h</td>
                  <td className="mono" style={{ color: util > 100 ? 'var(--c-red)' : util >= 80 ? 'var(--c-amber)' : 'var(--c-green)' }}>
                    {a.vibe_plannedhours ? `${util}%` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={allocationForm.id ? 'Edit Allocation' : 'New Allocation'}>
        <div className="modal-body">
          <div className="f-field">
            <label className="f-label">Label / description</label>
            <input className="f-input" placeholder="e.g. Week 24 Dev Sprint" value={allocationForm.name} onChange={(e) => setAllocationForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Project</label>
            <select className="f-select" value={allocationForm.projectId} onChange={(e) => setAllocationForm((p) => ({ ...p, projectId: e.target.value, teamMemberId: '' }))}>
              <option value="">— Select project —</option>
              {projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Team member</label>
            <select className="f-select" value={allocationForm.teamMemberId} onChange={(e) => setAllocationForm((p) => ({ ...p, teamMemberId: e.target.value }))}>
              <option value="">— Select member —</option>
              {filteredMembers.map((m) => {
                const name = m.vibe_contactidname ?? m.vibe_useridname ?? m.vibe_name ?? '(Unknown)'
                return <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{name}</option>
              })}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Week start date</label>
            <input className="f-input" type="date" value={allocationForm.weekStartDate} onChange={(e) => setAllocationForm((p) => ({ ...p, weekStartDate: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Planned hours</label>
            <input className="f-input" type="number" min="0" value={allocationForm.plannedHours} onChange={(e) => setAllocationForm((p) => ({ ...p, plannedHours: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Actual hours</label>
            <input className="f-input" type="number" min="0" value={allocationForm.actualHours} onChange={(e) => setAllocationForm((p) => ({ ...p, actualHours: e.target.value }))} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>{allocationForm.id ? 'Update' : 'Create'} Allocation</button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {allocationForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
