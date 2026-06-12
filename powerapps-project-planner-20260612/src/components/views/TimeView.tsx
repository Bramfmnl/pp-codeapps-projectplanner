import { useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Vibe_timeentries } from '../../generated/models/Vibe_timeentriesModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_tasks } from '../../generated/models/Vibe_tasksModel'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'

interface TimeForm { id: string; name: string; projectId: string; taskId: string; teamMemberId: string; date: string; hours: string }

interface Props {
  timeEntries: Vibe_timeentries[]; projects: Vibe_projects[]; tasks: Vibe_tasks[]; teamMembers: Vibe_projectteammembers[]
  projectById: Record<string, string>
  timeForm: TimeForm; setTimeForm: (f: TimeForm | ((p: TimeForm) => TimeForm)) => void
  upsertTime: () => Promise<void>; deleteTime: () => Promise<void>; resetTimeForm: () => void
}

export function TimeView({ timeEntries, projects, tasks, teamMembers, projectById, timeForm, setTimeForm, upsertTime, deleteTime, resetTimeForm }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const totalHours = timeEntries.reduce((s, t) => s + (t.vibe_hours ?? 0), 0)

  function openEdit(t: Vibe_timeentries) {
    setTimeForm({ id: t.vibe_timeentryid, name: t.vibe_name ?? '', projectId: t._vibe_projectid_value ?? '', taskId: t._vibe_taskid_value ?? '', teamMemberId: t._vibe_teammemberid_value ?? '', date: t.vibe_date?.slice(0, 10) ?? '', hours: `${t.vibe_hours ?? ''}` })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); resetTimeForm() }
  async function handleSave() { await upsertTime(); setModalOpen(false) }
  async function handleDelete() { await deleteTime(); setModalOpen(false) }

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Time Entries</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{totalHours.toFixed(1)} hrs logged</span>
          <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetTimeForm(); setModalOpen(true) }}>+ New</button>
        </div>
      </div>
      <table className="f-table">
        <thead><tr><th>Name</th><th>Project</th><th>Task</th><th>Member</th><th>Date</th><th>Hours</th></tr></thead>
        <tbody>
          {timeEntries.map((t) => (
            <tr key={t.vibe_timeentryid} className="clickable" onClick={() => openEdit(t)}>
              <td>{t.vibe_name}</td>
              <td>{t._vibe_projectid_value ? (projectById[t._vibe_projectid_value] ?? '—') : '—'}</td>
              <td>{t.vibe_taskidname ?? '—'}</td>
              <td>{t.vibe_teammemberidname ?? '—'}</td>
              <td className="mono">{t.vibe_date?.slice(0, 10) ?? '—'}</td>
              <td className="mono">{t.vibe_hours ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={modalOpen} onClose={closeModal} title={timeForm.id ? 'Edit Time Entry' : 'New Time Entry'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Entry name</label><input className="f-input" value={timeForm.name} onChange={(e) => setTimeForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={timeForm.projectId} onChange={(e) => setTimeForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Task</label><select className="f-select" value={timeForm.taskId} onChange={(e) => setTimeForm((p) => ({ ...p, taskId: e.target.value }))}><option value="">None</option>{tasks.map((t) => <option key={t.vibe_taskid} value={t.vibe_taskid}>{t.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Team member</label><select className="f-select" value={timeForm.teamMemberId} onChange={(e) => setTimeForm((p) => ({ ...p, teamMemberId: e.target.value }))}><option value="">None</option>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</select></div>
          <div className="f-field"><label className="f-label">Date</label><input className="f-input" type="date" value={timeForm.date} onChange={(e) => setTimeForm((p) => ({ ...p, date: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Hours</label><input className="f-input" value={timeForm.hours} onChange={(e) => setTimeForm((p) => ({ ...p, hours: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>{timeForm.id ? 'Update' : 'Create'} Entry</button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {timeForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
