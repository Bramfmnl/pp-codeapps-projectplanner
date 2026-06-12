import { useState } from 'react'
import { Modal } from '../ui/Modal'
import type { Vibe_decisionlogs } from '../../generated/models/Vibe_decisionlogsModel'
import type { Vibe_meetingnotes } from '../../generated/models/Vibe_meetingnotesModel'
import type { Vibe_activityfeedentries } from '../../generated/models/Vibe_activityfeedentriesModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'

interface DecisionForm { id: string; title: string; projectId: string; madeById: string; date: string }
interface MeetingForm { id: string; title: string; projectId: string; date: string }

interface Props {
  decisions: Vibe_decisionlogs[]; meetingNotes: Vibe_meetingnotes[]; feed: Vibe_activityfeedentries[]
  projects: Vibe_projects[]; teamMembers: Vibe_projectteammembers[]
  projectById: Record<string, string>
  decisionForm: DecisionForm; setDecisionForm: (f: DecisionForm | ((p: DecisionForm) => DecisionForm)) => void
  upsertDecision: () => Promise<void>; deleteDecision: () => Promise<void>; resetDecisionForm: () => void
  meetingForm: MeetingForm; setMeetingForm: (f: MeetingForm | ((p: MeetingForm) => MeetingForm)) => void
  upsertMeeting: () => Promise<void>; deleteMeeting: () => Promise<void>; resetMeetingForm: () => void
}

export function CommunicationsView({ decisions, meetingNotes, feed, projects, teamMembers, projectById, decisionForm, setDecisionForm, upsertDecision, deleteDecision, resetDecisionForm, meetingForm, setMeetingForm, upsertMeeting, deleteMeeting, resetMeetingForm }: Props) {
  const [decisionModal, setDecisionModal] = useState(false)
  const [meetingModal, setMeetingModal] = useState(false)

  return (
    <div className="f-col-stack">
      <div className="f-two-col">
        <div className="f-panel">
          <div className="f-panel-head">
            <span className="f-panel-title">Decision Log</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{decisions.length}</span>
              <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetDecisionForm(); setDecisionModal(true) }}>+ New</button>
            </div>
          </div>
          <table className="f-table">
            <thead><tr><th>Title</th><th>Made By</th><th>Date</th></tr></thead>
            <tbody>
              {decisions.map((d) => (
                <tr key={d.vibe_decisionlogid} className="clickable" onClick={() => { setDecisionForm({ id: d.vibe_decisionlogid, title: d.vibe_title ?? '', projectId: d._vibe_projectid_value ?? '', madeById: d._vibe_madebyid_value ?? '', date: d.vibe_date?.slice(0, 10) ?? '' }); setDecisionModal(true) }}>
                  <td>{d.vibe_title}</td>
                  <td>{d.vibe_madebyidname ?? '—'}</td>
                  <td className="mono">{d.vibe_date?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Modal open={decisionModal} onClose={() => { setDecisionModal(false); resetDecisionForm() }} title={decisionForm.id ? 'Edit Decision' : 'New Decision'}>
            <div className="modal-body">
              <div className="f-field"><label className="f-label">Title</label><input className="f-input" value={decisionForm.title} onChange={(e) => setDecisionForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={decisionForm.projectId} onChange={(e) => setDecisionForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
              <div className="f-field"><label className="f-label">Made by</label><select className="f-select" value={decisionForm.madeById} onChange={(e) => setDecisionForm((p) => ({ ...p, madeById: e.target.value }))}><option value="">None</option>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</select></div>
              <div className="f-field"><label className="f-label">Date</label><input className="f-input" type="date" value={decisionForm.date} onChange={(e) => setDecisionForm((p) => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button className="f-btn f-btn-primary" onClick={async () => { await upsertDecision(); setDecisionModal(false) }}>{decisionForm.id ? 'Update' : 'Create'} Decision</button>
              <button className="f-btn" onClick={() => { setDecisionModal(false); resetDecisionForm() }}>Cancel</button>
              {decisionForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteDecision(); setDecisionModal(false) }}>Delete</button>}
            </div>
          </Modal>
        </div>

        <div className="f-panel">
          <div className="f-panel-head">
            <span className="f-panel-title">Meeting Notes</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{meetingNotes.length}</span>
              <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetMeetingForm(); setMeetingModal(true) }}>+ New</button>
            </div>
          </div>
          <table className="f-table">
            <thead><tr><th>Title</th><th>Project</th><th>Date</th></tr></thead>
            <tbody>
              {meetingNotes.map((m) => (
                <tr key={m.vibe_meetingnoteid} className="clickable" onClick={() => { setMeetingForm({ id: m.vibe_meetingnoteid, title: m.vibe_title ?? '', projectId: m._vibe_projectid_value ?? '', date: m.vibe_date?.slice(0, 10) ?? '' }); setMeetingModal(true) }}>
                  <td>{m.vibe_title}</td>
                  <td>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</td>
                  <td className="mono">{m.vibe_date?.slice(0, 10) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Modal open={meetingModal} onClose={() => { setMeetingModal(false); resetMeetingForm() }} title={meetingForm.id ? 'Edit Meeting Note' : 'New Meeting Note'}>
            <div className="modal-body">
              <div className="f-field"><label className="f-label">Title</label><input className="f-input" value={meetingForm.title} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div className="f-field"><label className="f-label">Project</label><select className="f-select" value={meetingForm.projectId} onChange={(e) => setMeetingForm((p) => ({ ...p, projectId: e.target.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</select></div>
              <div className="f-field"><label className="f-label">Date</label><input className="f-input" type="date" value={meetingForm.date} onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button className="f-btn f-btn-primary" onClick={async () => { await upsertMeeting(); setMeetingModal(false) }}>{meetingForm.id ? 'Update' : 'Create'} Meeting Note</button>
              <button className="f-btn" onClick={() => { setMeetingModal(false); resetMeetingForm() }}>Cancel</button>
              {meetingForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteMeeting(); setMeetingModal(false) }}>Delete</button>}
            </div>
          </Modal>
        </div>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Activity Feed</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{feed.length} events</span>
        </div>
        <table className="f-table">
          <thead><tr><th>Timestamp</th><th>Project</th><th>Event</th><th>Actor</th><th>Description</th></tr></thead>
          <tbody>
            {feed.map((f) => (
              <tr key={f.vibe_activityfeedentryid}>
                <td className="mono">{f.vibe_timestamp?.slice(0, 19).replace('T', ' ')}</td>
                <td>{f._vibe_projectid_value ? (projectById[f._vibe_projectid_value] ?? '—') : '—'}</td>
                <td>{f.vibe_eventtypename}</td>
                <td>{f.vibe_actoridname}</td>
                <td>{f.vibe_description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
