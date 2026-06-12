import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_projectroles } from '../../generated/models/Vibe_projectrolesModel'
import type { Vibe_projecttemplates } from '../../generated/models/Vibe_projecttemplatesModel'

interface RoleForm { id: string; name: string; defaultRate: string; isStakeholder: boolean }
interface TemplateForm { id: string; name: string; isActive: boolean }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="f-toggle" onClick={() => onChange(!checked)}>
      <div className={`f-toggle-track${checked ? ' on' : ''}`}>
        <div className="f-toggle-thumb" />
      </div>
    </label>
  )
}

interface Props {
  roles: Vibe_projectroles[]; templates: Vibe_projecttemplates[]
  roleForm: RoleForm; setRoleForm: (f: RoleForm | ((p: RoleForm) => RoleForm)) => void
  upsertRole: () => Promise<void>; deleteRole: () => Promise<void>; resetRoleForm: () => void
  templateForm: TemplateForm; setTemplateForm: (f: TemplateForm | ((p: TemplateForm) => TemplateForm)) => void
  upsertTemplate: () => Promise<void>; deleteTemplate: () => Promise<void>; resetTemplateForm: () => void
}

export function SettingsView({ roles, templates, roleForm, setRoleForm, upsertRole, deleteRole, resetRoleForm, templateForm, setTemplateForm, upsertTemplate, deleteTemplate, resetTemplateForm }: Props) {
  const [roleModal, setRoleModal] = useState(false)
  const [templateModal, setTemplateModal] = useState(false)

  return (
    <div className="f-two-col">
      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Project Roles</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{roles.length}</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetRoleForm(); setRoleModal(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Name</th><th>Default Rate</th><th>Stakeholder</th></tr></thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.vibe_projectroleid} className="clickable" onClick={() => { setRoleForm({ id: r.vibe_projectroleid, name: r.vibe_name ?? '', defaultRate: `${r.vibe_defaulthourlyrate ?? ''}`, isStakeholder: r.vibe_isstakeholderrole ?? false }); setRoleModal(true) }}>
                <td>{r.vibe_name}</td>
                <td className="mono">{r.vibe_defaulthourlyrate ?? '—'}</td>
                <td>{r.vibe_isstakeholderrole ? <Badge label="Yes" color="var(--c-accent)" /> : <span style={{ color: 'var(--c-text-3)', fontSize: '12px' }}>No</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={roleModal} onClose={() => { setRoleModal(false); resetRoleForm() }} title={roleForm.id ? 'Edit Role' : 'New Role'}>
          <div className="modal-body">
            <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={roleForm.name} onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="f-field"><label className="f-label">Default hourly rate</label><input className="f-input" value={roleForm.defaultRate} onChange={(e) => setRoleForm((p) => ({ ...p, defaultRate: e.target.value }))} /></div>
            <div className="f-field"><label className="f-label">Stakeholder role</label><Toggle checked={roleForm.isStakeholder} onChange={(v) => setRoleForm((p) => ({ ...p, isStakeholder: v }))} /></div>
          </div>
          <div className="modal-footer">
            <button className="f-btn f-btn-primary" onClick={async () => { await upsertRole(); setRoleModal(false) }}>{roleForm.id ? 'Update' : 'Create'} Role</button>
            <button className="f-btn" onClick={() => { setRoleModal(false); resetRoleForm() }}>Cancel</button>
            {roleForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteRole(); setRoleModal(false) }}>Delete</button>}
          </div>
        </Modal>
      </div>

      <div className="f-panel">
        <div className="f-panel-head">
          <span className="f-panel-title">Project Templates</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{templates.length}</span>
            <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetTemplateForm(); setTemplateModal(true) }}>+ New</button>
          </div>
        </div>
        <table className="f-table">
          <thead><tr><th>Name</th><th>Active</th></tr></thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.vibe_projecttemplateid} className="clickable" onClick={() => { setTemplateForm({ id: t.vibe_projecttemplateid, name: t.vibe_name ?? '', isActive: t.vibe_isactive ?? true }); setTemplateModal(true) }}>
                <td>{t.vibe_name}</td>
                <td>{t.vibe_isactive ? <Badge label="Active" color="var(--c-green)" /> : <Badge label="Inactive" color="var(--c-text-2)" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Modal open={templateModal} onClose={() => { setTemplateModal(false); resetTemplateForm() }} title={templateForm.id ? 'Edit Template' : 'New Template'}>
          <div className="modal-body">
            <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} /></div>
            <div className="f-field"><label className="f-label">Active</label><Toggle checked={templateForm.isActive} onChange={(v) => setTemplateForm((p) => ({ ...p, isActive: v }))} /></div>
          </div>
          <div className="modal-footer">
            <button className="f-btn f-btn-primary" onClick={async () => { await upsertTemplate(); setTemplateModal(false) }}>{templateForm.id ? 'Update' : 'Create'} Template</button>
            <button className="f-btn" onClick={() => { setTemplateModal(false); resetTemplateForm() }}>Cancel</button>
            {templateForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteTemplate(); setTemplateModal(false) }}>Delete</button>}
          </div>
        </Modal>
      </div>
    </div>
  )
}
