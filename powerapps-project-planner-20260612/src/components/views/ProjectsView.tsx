import { Badge } from '../ui/Badge'
import { Modal } from '../ui/Modal'
import { useState } from 'react'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_projecttemplates } from '../../generated/models/Vibe_projecttemplatesModel'

interface ProjectForm {
  id: string
  name: string
  startDate: string
  endDate: string
  totalBudget: string
  templateId: string
}

interface Props {
  projects: Vibe_projects[]
  templates: Vibe_projecttemplates[]
  projectForm: ProjectForm
  setProjectForm: (f: ProjectForm | ((p: ProjectForm) => ProjectForm)) => void
  upsertProject: () => Promise<void>
  deleteProject: () => Promise<void>
  resetProjectForm: () => void
  setSelectedProjectId: (id: string) => void
}

export function ProjectsView({
  projects,
  templates,
  projectForm,
  setProjectForm,
  upsertProject,
  deleteProject,
  resetProjectForm,
  setSelectedProjectId,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  function openEdit(project: Vibe_projects) {
    setSelectedProjectId(project.vibe_projectid)
    setProjectForm({
      id: project.vibe_projectid,
      name: project.vibe_name ?? '',
      startDate: project.vibe_startdate?.slice(0, 10) ?? '',
      endDate: project.vibe_enddate?.slice(0, 10) ?? '',
      totalBudget: `${project.vibe_totalbudget ?? ''}`,
      templateId: project._vibe_templatesourceid_value ?? '',
    })
    setModalOpen(true)
  }

  function openNew() {
    resetProjectForm()
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    resetProjectForm()
  }

  async function handleSave() {
    await upsertProject()
    setModalOpen(false)
  }

  async function handleDelete() {
    await deleteProject()
    setModalOpen(false)
  }

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Projects</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
            {projects.length} total
          </span>
          <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={openNew}>
            + New
          </button>
        </div>
      </div>
      <div>
        <table className="f-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.vibe_projectid} className="clickable" onClick={() => openEdit(project)}>
                <td>{project.vibe_name}</td>
                <td className="mono">{project.vibe_startdate?.slice(0, 10) ?? '—'}</td>
                <td className="mono">{project.vibe_enddate?.slice(0, 10) ?? '—'}</td>
                <td>
                  <Badge
                    label={project.statecode === 0 ? 'Active' : 'Inactive'}
                    color={project.statecode === 0 ? 'var(--c-green)' : 'var(--c-text-2)'}
                  />
                </td>
                <td className="mono">
                  {project.vibe_totalbudget != null ? project.vibe_totalbudget.toLocaleString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={projectForm.id ? 'Edit Project' : 'New Project'}>
        <div className="modal-body">
          <div className="f-field">
            <label className="f-label">Name</label>
            <input className="f-input" value={projectForm.name} onChange={(e) => setProjectForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Start date</label>
            <input className="f-input" type="date" value={projectForm.startDate} onChange={(e) => setProjectForm((p) => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">End date</label>
            <input className="f-input" type="date" value={projectForm.endDate} onChange={(e) => setProjectForm((p) => ({ ...p, endDate: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Total budget</label>
            <input className="f-input" value={projectForm.totalBudget} onChange={(e) => setProjectForm((p) => ({ ...p, totalBudget: e.target.value }))} />
          </div>
          <div className="f-field">
            <label className="f-label">Template</label>
            <select className="f-select" value={projectForm.templateId} onChange={(e) => setProjectForm((p) => ({ ...p, templateId: e.target.value }))}>
              <option value="">None</option>
              {templates.map((t) => (
                <option key={t.vibe_projecttemplateid} value={t.vibe_projecttemplateid}>{t.vibe_name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>{projectForm.id ? 'Update' : 'Create'} Project</button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {projectForm.id && (
            <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>Delete</button>
          )}
        </div>
      </Modal>
    </div>
  )
}
