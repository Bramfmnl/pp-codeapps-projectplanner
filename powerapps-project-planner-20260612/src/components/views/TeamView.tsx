import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_projectroles } from '../../generated/models/Vibe_projectrolesModel'

interface TeamForm {
  id: string
  name: string
  projectId: string
  roleId: string
  allocation: string
  hourlyRate: string
  startDate: string
  endDate: string
  isActive: boolean
}

interface Props {
  teamMembers: Vibe_projectteammembers[]
  projects: Vibe_projects[]
  roles: Vibe_projectroles[]
  projectById: Record<string, string>
  teamForm: TeamForm
  setTeamForm: (f: TeamForm | ((p: TeamForm) => TeamForm)) => void
  upsertTeam: () => Promise<void>
  deleteTeam: () => Promise<void>
  resetTeamForm: () => void
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="f-toggle" onClick={() => onChange(!checked)}>
      <div className={`f-toggle-track${checked ? ' on' : ''}`}>
        <div className="f-toggle-thumb" />
      </div>
    </label>
  )
}

export function TeamView({ teamMembers, projects, roles, projectById, teamForm, setTeamForm, upsertTeam, deleteTeam, resetTeamForm }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openEdit(m: Vibe_projectteammembers) {
    setTeamForm({
      id: m.vibe_projectteammemberid,
      name: m.vibe_contactidname ?? m.vibe_useridname ?? m.vibe_name ?? '',
      projectId: m._vibe_projectid_value ?? '',
      roleId: m._vibe_roleid_value ?? '',
      allocation: `${m.vibe_allocationpercentage ?? ''}`,
      hourlyRate: `${m.vibe_hourlyrate ?? ''}`,
      startDate: m.vibe_startdate?.slice(0, 10) ?? '',
      endDate: m.vibe_enddate?.slice(0, 10) ?? '',
      isActive: m.vibe_isactive ?? true,
    })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); resetTeamForm() }
  async function handleSave() { await upsertTeam(); setModalOpen(false) }
  async function handleDelete() { await deleteTeam(); setModalOpen(false) }

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Team Members</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{teamMembers.length} members</span>
          <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetTeamForm(); setModalOpen(true) }}>+ New</button>
        </div>
      </div>
      <div>
        <table className="f-table">
          <thead>
            <tr>
              <th>Name</th><th>Project</th><th>Role</th><th>Allocation</th><th>Rate / hr</th><th>Active</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '20px' }}>No team members yet — click + New to add one</td></tr>
            )}
            {teamMembers.map((m) => (
              <tr key={m.vibe_projectteammemberid} className="clickable" onClick={() => openEdit(m)}>
                <td>{m.vibe_contactidname ?? m.vibe_useridname ?? m.vibe_name ?? '—'}</td>
                <td>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</td>
                <td>{m.vibe_roleidname ?? '—'}</td>
                <td className="mono">{m.vibe_allocationpercentage != null ? `${m.vibe_allocationpercentage}%` : '—'}</td>
                <td className="mono">{m.vibe_hourlyrate ?? '—'}</td>
                <td><Badge label={m.vibe_isactive ? 'Active' : 'Inactive'} color={m.vibe_isactive ? 'var(--c-green)' : 'var(--c-text-2)'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={teamForm.id ? 'Edit Team Member' : 'New Team Member'}>
        <div className="modal-body">
          <div className="f-field">
            <label className="f-label">Name <span style={{ color: 'var(--c-red)', fontSize: 11 }}>*</span></label>
            <input className="f-input" placeholder="Full name" value={teamForm.name} onChange={(e) => setTeamForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Project <span style={{ color: 'var(--c-red)', fontSize: 11 }}>*</span></label>
            <select className="f-select" value={teamForm.projectId} onChange={(e) => setTeamForm((p) => ({ ...p, projectId: e.target.value }))}>
              <option value="">— Select project —</option>
              {projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Role</label>
            <select className="f-select" value={teamForm.roleId} onChange={(e) => setTeamForm((p) => ({ ...p, roleId: e.target.value }))}>
              <option value="">— No role —</option>
              {roles.map((r) => <option key={r.vibe_projectroleid} value={r.vibe_projectroleid}>{r.vibe_name}</option>)}
            </select>
          </div>
          <div className="f-field"><label className="f-label">Allocation %</label><input className="f-input" type="number" min="0" max="100" value={teamForm.allocation} onChange={(e) => setTeamForm((p) => ({ ...p, allocation: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Hourly rate</label><input className="f-input" type="number" min="0" value={teamForm.hourlyRate} onChange={(e) => setTeamForm((p) => ({ ...p, hourlyRate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Start date</label><input className="f-input" type="date" value={teamForm.startDate} onChange={(e) => setTeamForm((p) => ({ ...p, startDate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">End date</label><input className="f-input" type="date" value={teamForm.endDate} onChange={(e) => setTeamForm((p) => ({ ...p, endDate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Active</label><Toggle checked={teamForm.isActive} onChange={(v) => setTeamForm((p) => ({ ...p, isActive: v }))} /></div>
        </div>
        <div className="modal-footer">
          {(!teamForm.name || !teamForm.projectId) && (
            <span style={{ fontSize: 12, color: 'var(--c-text-3)', alignSelf: 'center' }}>Name and project are required</span>
          )}
          <button
            className="f-btn f-btn-primary"
            disabled={!teamForm.name || !teamForm.projectId}
            onClick={handleSave}
          >
            {teamForm.id ? 'Update' : 'Create'} Member
          </button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {teamForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
