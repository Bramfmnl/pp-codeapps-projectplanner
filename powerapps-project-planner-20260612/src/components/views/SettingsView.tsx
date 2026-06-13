import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import type { Vibe_projectroles } from '../../generated/models/Vibe_projectrolesModel'
import type { Vibe_projecttemplates } from '../../generated/models/Vibe_projecttemplatesModel'
import type { Vibe_phasetemplates } from '../../generated/models/Vibe_phasetemplatesModel'
import type { Vibe_tasktemplates } from '../../generated/models/Vibe_tasktemplatesModel'
import { Vibe_tasktemplatesvibe_defaultpriority } from '../../generated/models/Vibe_tasktemplatesModel'

const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

interface RoleForm { id: string; name: string; defaultRate: string; isStakeholder: boolean }
interface TemplateForm { id: string; name: string; description: string; isActive: boolean }
interface PhaseTemplateForm { id: string; name: string; order: string; defaultDurationDays: string; templateId: string }
interface TaskTemplateForm { id: string; name: string; order: string; defaultEstimatedHours: string; defaultPriority: string; phaseTemplateId: string }

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
  roles: Vibe_projectroles[]
  templates: Vibe_projecttemplates[]
  phaseTemplates: Vibe_phasetemplates[]
  taskTemplates: Vibe_tasktemplates[]
  roleForm: RoleForm
  setRoleForm: (f: RoleForm | ((p: RoleForm) => RoleForm)) => void
  upsertRole: () => Promise<void>
  deleteRole: () => Promise<void>
  resetRoleForm: () => void
  templateForm: TemplateForm
  setTemplateForm: (f: TemplateForm | ((p: TemplateForm) => TemplateForm)) => void
  upsertTemplate: () => Promise<void>
  deleteTemplate: () => Promise<void>
  resetTemplateForm: () => void
  phaseTemplateForm: PhaseTemplateForm
  setPhaseTemplateForm: (f: PhaseTemplateForm | ((p: PhaseTemplateForm) => PhaseTemplateForm)) => void
  upsertPhaseTemplate: () => Promise<void>
  deletePhaseTemplate: () => Promise<void>
  resetPhaseTemplateForm: (templateId?: string) => void
  taskTemplateForm: TaskTemplateForm
  setTaskTemplateForm: (f: TaskTemplateForm | ((p: TaskTemplateForm) => TaskTemplateForm)) => void
  upsertTaskTemplate: () => Promise<void>
  deleteTaskTemplate: () => Promise<void>
  resetTaskTemplateForm: (phaseTemplateId?: string) => void
}

export function SettingsView({
  roles, templates, phaseTemplates, taskTemplates,
  roleForm, setRoleForm, upsertRole, deleteRole, resetRoleForm,
  templateForm, setTemplateForm, upsertTemplate, deleteTemplate, resetTemplateForm,
  phaseTemplateForm, setPhaseTemplateForm, upsertPhaseTemplate, deletePhaseTemplate, resetPhaseTemplateForm,
  taskTemplateForm, setTaskTemplateForm, upsertTaskTemplate, deleteTaskTemplate, resetTaskTemplateForm,
}: Props) {
  const [roleModal, setRoleModal] = useState(false)
  const [templateModal, setTemplateModal] = useState(false)
  const [phaseModal, setPhaseModal] = useState(false)
  const [taskModal, setTaskModal] = useState(false)
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set())
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())

  function toggleTemplate(id: string) {
    setExpandedTemplates((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function togglePhase(id: string) {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="f-col-stack">
      <div className="f-two-col">
        {/* Project Roles */}
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
              {roles.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '16px' }}>No roles yet</td></tr>
              )}
              {roles.map((r) => (
                <tr key={r.vibe_projectroleid} className="clickable" onClick={() => { setRoleForm({ id: r.vibe_projectroleid, name: r.vibe_name ?? '', defaultRate: `${r.vibe_defaulthourlyrate ?? ''}`, isStakeholder: r.vibe_isstakeholderrole ?? false }); setRoleModal(true) }}>
                  <td>{r.vibe_name}</td>
                  <td className="mono">{r.vibe_defaulthourlyrate ?? '—'}</td>
                  <td>{r.vibe_isstakeholderrole ? <Badge label="Yes" color="var(--c-accent)" /> : <span style={{ color: 'var(--c-text-3)', fontSize: '12px' }}>No</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Template overview */}
        <div className="f-panel">
          <div className="f-panel-head">
            <span className="f-panel-title">Project Templates</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{templates.length}</span>
              <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => { resetTemplateForm(); setTemplateModal(true) }}>+ New</button>
            </div>
          </div>
          <table className="f-table">
            <thead><tr><th>Name</th><th>Phases</th><th>Tasks</th><th>Active</th></tr></thead>
            <tbody>
              {templates.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--c-text-3)', padding: '16px' }}>No templates yet</td></tr>
              )}
              {templates.map((t) => {
                const phases = phaseTemplates.filter((pt) => pt._vibe_projecttemplateid_value === t.vibe_projecttemplateid)
                const taskCount = taskTemplates.filter((tt) => phases.some((p) => p.vibe_phasetemplateid === tt._vibe_phasetemplateid_value)).length
                return (
                  <tr key={t.vibe_projecttemplateid} className="clickable" onClick={() => { setTemplateForm({ id: t.vibe_projecttemplateid, name: t.vibe_name ?? '', description: t.vibe_description ?? '', isActive: t.vibe_isactive ?? true }); setTemplateModal(true) }}>
                    <td>{t.vibe_name}</td>
                    <td className="mono">{phases.length}</td>
                    <td className="mono">{taskCount}</td>
                    <td>{t.vibe_isactive ? <Badge label="Active" color="var(--c-green)" /> : <Badge label="Inactive" color="var(--c-text-2)" />}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Template builder */}
      {templates.length > 0 && (
        <div className="f-panel">
          <div className="f-panel-head">
            <span className="f-panel-title">Template Builder</span>
            <span style={{ fontSize: '12px', color: 'var(--c-text-3)' }}>Click a template to expand · Add phases and tasks to build the template structure</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {templates.map((t) => {
              const tPhases = phaseTemplates
                .filter((pt) => pt._vibe_projecttemplateid_value === t.vibe_projecttemplateid)
                .sort((a, b) => (a.vibe_order ?? 0) - (b.vibe_order ?? 0))
              const isExpanded = expandedTemplates.has(t.vibe_projecttemplateid)

              return (
                <div key={t.vibe_projecttemplateid} className="tpl-tree-template">
                  <div className="tpl-tree-header" onClick={() => toggleTemplate(t.vibe_projecttemplateid)}>
                    <span className="tpl-tree-chevron">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                    <span className="tpl-tree-name">{t.vibe_name}</span>
                    <Badge label={t.vibe_isactive ? 'Active' : 'Inactive'} color={t.vibe_isactive ? 'var(--c-green)' : 'var(--c-text-2)'} />
                    <span className="tpl-tree-count">{tPhases.length} phases</span>
                    {isExpanded && (
                      <button
                        className="f-btn-ghost"
                        style={{ marginLeft: 'auto', fontSize: 11 }}
                        onClick={(e) => { e.stopPropagation(); resetPhaseTemplateForm(t.vibe_projecttemplateid); setPhaseModal(true) }}
                      >
                        <Plus size={11} /> Add phase
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="tpl-tree-phases">
                      {tPhases.length === 0 && (
                        <div className="tpl-tree-empty">No phases yet — click "Add phase" to build this template</div>
                      )}
                      {tPhases.map((pt) => {
                        const ptTasks = taskTemplates
                          .filter((tt) => tt._vibe_phasetemplateid_value === pt.vibe_phasetemplateid)
                          .sort((a, b) => (a.vibe_order ?? 0) - (b.vibe_order ?? 0))
                        const phaseExpanded = expandedPhases.has(pt.vibe_phasetemplateid)

                        return (
                          <div key={pt.vibe_phasetemplateid} className="tpl-tree-phase">
                            <div className="tpl-tree-phase-header" onClick={() => togglePhase(pt.vibe_phasetemplateid)}>
                              <span className="tpl-tree-chevron">
                                {phaseExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                              </span>
                              <span className="tpl-tree-phase-name">{pt.vibe_name}</span>
                              {pt.vibe_order != null && <span className="tpl-tree-meta">#{pt.vibe_order}</span>}
                              {pt.vibe_defaultdurationdays != null && <span className="tpl-tree-meta">{pt.vibe_defaultdurationdays}d</span>}
                              <span className="tpl-tree-count">{ptTasks.length} tasks</span>
                              <button
                                className="f-btn-ghost"
                                style={{ fontSize: 11 }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPhaseTemplateForm({ id: pt.vibe_phasetemplateid, name: pt.vibe_name ?? '', order: `${pt.vibe_order ?? ''}`, defaultDurationDays: `${pt.vibe_defaultdurationdays ?? ''}`, templateId: t.vibe_projecttemplateid })
                                  setPhaseModal(true)
                                }}
                              >
                                Edit
                              </button>
                              {phaseExpanded && (
                                <button
                                  className="f-btn-ghost"
                                  style={{ fontSize: 11 }}
                                  onClick={(e) => { e.stopPropagation(); resetTaskTemplateForm(pt.vibe_phasetemplateid); setTaskModal(true) }}
                                >
                                  <Plus size={11} /> Add task
                                </button>
                              )}
                            </div>

                            {phaseExpanded && (
                              <div className="tpl-tree-tasks">
                                {ptTasks.length === 0 && (
                                  <div className="tpl-tree-empty">No tasks in this phase yet</div>
                                )}
                                {ptTasks.map((tt) => (
                                  <div key={tt.vibe_tasktemplateid} className="tpl-tree-task">
                                    <span className="tpl-tree-task-name">{tt.vibe_name}</span>
                                    {tt.vibe_order != null && <span className="tpl-tree-meta">#{tt.vibe_order}</span>}
                                    {tt.vibe_defaultestimatedhours != null && <span className="tpl-tree-meta">{tt.vibe_defaultestimatedhours}h</span>}
                                    {tt.vibe_defaultpriority != null && (
                                      <span className="tpl-tree-meta">{Vibe_tasktemplatesvibe_defaultpriority[tt.vibe_defaultpriority as keyof typeof Vibe_tasktemplatesvibe_defaultpriority]}</span>
                                    )}
                                    <button
                                      className="f-btn-ghost"
                                      style={{ marginLeft: 'auto', fontSize: 11 }}
                                      onClick={() => {
                                        setTaskTemplateForm({
                                          id: tt.vibe_tasktemplateid,
                                          name: tt.vibe_name ?? '',
                                          order: `${tt.vibe_order ?? ''}`,
                                          defaultEstimatedHours: `${tt.vibe_defaultestimatedhours ?? ''}`,
                                          defaultPriority: `${tt.vibe_defaultpriority ?? 100000001}`,
                                          phaseTemplateId: pt.vibe_phasetemplateid,
                                        })
                                        setTaskModal(true)
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Role modal */}
      <Modal open={roleModal} onClose={() => { setRoleModal(false); resetRoleForm() }} title={roleForm.id ? 'Edit Role' : 'New Role'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={roleForm.name} onChange={(e) => setRoleForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Default hourly rate</label><input className="f-input" type="number" min="0" value={roleForm.defaultRate} onChange={(e) => setRoleForm((p) => ({ ...p, defaultRate: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Stakeholder role</label><Toggle checked={roleForm.isStakeholder} onChange={(v) => setRoleForm((p) => ({ ...p, isStakeholder: v }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={async () => { await upsertRole(); setRoleModal(false) }}>{roleForm.id ? 'Update' : 'Create'} Role</button>
          <button className="f-btn" onClick={() => { setRoleModal(false); resetRoleForm() }}>Cancel</button>
          {roleForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteRole(); setRoleModal(false) }}>Delete</button>}
        </div>
      </Modal>

      {/* Template modal */}
      <Modal open={templateModal} onClose={() => { setTemplateModal(false); resetTemplateForm() }} title={templateForm.id ? 'Edit Template' : 'New Template'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Name</label><input className="f-input" value={templateForm.name} onChange={(e) => setTemplateForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Description</label><input className="f-input" value={templateForm.description} onChange={(e) => setTemplateForm((p) => ({ ...p, description: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Active</label><Toggle checked={templateForm.isActive} onChange={(v) => setTemplateForm((p) => ({ ...p, isActive: v }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={async () => { await upsertTemplate(); setTemplateModal(false) }}>{templateForm.id ? 'Update' : 'Create'} Template</button>
          <button className="f-btn" onClick={() => { setTemplateModal(false); resetTemplateForm() }}>Cancel</button>
          {templateForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteTemplate(); setTemplateModal(false) }}>Delete</button>}
        </div>
      </Modal>

      {/* Phase template modal */}
      <Modal open={phaseModal} onClose={() => { setPhaseModal(false); resetPhaseTemplateForm() }} title={phaseTemplateForm.id ? 'Edit Phase' : 'New Phase'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Phase name</label><input className="f-input" placeholder="e.g. Discovery, Design, Build…" value={phaseTemplateForm.name} onChange={(e) => setPhaseTemplateForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Order</label><input className="f-input" type="number" min="1" placeholder="1" value={phaseTemplateForm.order} onChange={(e) => setPhaseTemplateForm((p) => ({ ...p, order: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Default duration (days)</label><input className="f-input" type="number" min="1" value={phaseTemplateForm.defaultDurationDays} onChange={(e) => setPhaseTemplateForm((p) => ({ ...p, defaultDurationDays: e.target.value }))} /></div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={async () => { await upsertPhaseTemplate(); setPhaseModal(false) }}>{phaseTemplateForm.id ? 'Update' : 'Create'} Phase</button>
          <button className="f-btn" onClick={() => { setPhaseModal(false); resetPhaseTemplateForm() }}>Cancel</button>
          {phaseTemplateForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deletePhaseTemplate(); setPhaseModal(false) }}>Delete</button>}
        </div>
      </Modal>

      {/* Task template modal */}
      <Modal open={taskModal} onClose={() => { setTaskModal(false); resetTaskTemplateForm() }} title={taskTemplateForm.id ? 'Edit Task Template' : 'New Task Template'}>
        <div className="modal-body">
          <div className="f-field"><label className="f-label">Task name</label><input className="f-input" placeholder="e.g. Stakeholder kickoff meeting" value={taskTemplateForm.name} onChange={(e) => setTaskTemplateForm((p) => ({ ...p, name: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Order</label><input className="f-input" type="number" min="1" value={taskTemplateForm.order} onChange={(e) => setTaskTemplateForm((p) => ({ ...p, order: e.target.value }))} /></div>
          <div className="f-field"><label className="f-label">Default estimated hours</label><input className="f-input" type="number" min="0" step="0.5" value={taskTemplateForm.defaultEstimatedHours} onChange={(e) => setTaskTemplateForm((p) => ({ ...p, defaultEstimatedHours: e.target.value }))} /></div>
          <div className="f-field">
            <label className="f-label">Default priority</label>
            <select className="f-select" value={taskTemplateForm.defaultPriority} onChange={(e) => setTaskTemplateForm((p) => ({ ...p, defaultPriority: e.target.value }))}>
              {entries(Vibe_tasktemplatesvibe_defaultpriority).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={async () => { await upsertTaskTemplate(); setTaskModal(false) }}>{taskTemplateForm.id ? 'Update' : 'Create'} Task</button>
          <button className="f-btn" onClick={() => { setTaskModal(false); resetTaskTemplateForm() }}>Cancel</button>
          {taskTemplateForm.id && <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={async () => { await deleteTaskTemplate(); setTaskModal(false) }}>Delete</button>}
        </div>
      </Modal>
    </div>
  )
}
