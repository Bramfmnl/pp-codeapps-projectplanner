import { useMemo, useState } from 'react'
import { LayoutGrid, Calendar, Kanban, Table2, Plus, Search } from 'lucide-react'
import type { Vibe_tasks } from '../../generated/models/Vibe_tasksModel'
import { Vibe_tasksvibe_priority, Vibe_tasksvibe_taskstatus } from '../../generated/models/Vibe_tasksModel'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'
import type { Vibe_projectphases } from '../../generated/models/Vibe_projectphasesModel'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { ProgressBar } from '../ui/ProgressBar'
import { PriorityFlag } from '../ui/PriorityFlag'
import { Modal } from '../ui/Modal'

const STATUS_ORDER = [100000001, 100000002, 100000000, 100000003] as const

const STATUS_CONFIG: Record<number, { label: string; color: string }> = {
  100000001: { label: 'In Progress', color: '#f59e0b' },
  100000002: { label: 'Blocked', color: '#ef4444' },
  100000000: { label: 'To Do', color: '#94a3b8' },
  100000003: { label: 'Done', color: '#10b981' },
}

function computeProgress(actual?: number, estimated?: number): number {
  if (!actual || !estimated || estimated === 0) return 0
  return Math.min(100, Math.round((actual / estimated) * 100))
}

function dueDateClass(dueDate?: string, status?: number): string {
  if (!dueDate || status === 100000003) return 'task-due-normal'
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  if (due < now) return 'task-due-overdue'
  if (due - now < 3 * 24 * 60 * 60 * 1000) return 'task-due-soon'
  return 'task-due-normal'
}

const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

interface TaskForm {
  id: string
  name: string
  projectId: string
  dueDate: string
  priority: string
  status: string
}

interface Props {
  tasks: Vibe_tasks[]
  projects: Vibe_projects[]
  phases: Vibe_projectphases[]
  selectedProjectId: string
  currentProjectName: string
  taskForm: TaskForm
  setTaskForm: (f: TaskForm | ((prev: TaskForm) => TaskForm)) => void
  upsertTask: () => Promise<void>
  deleteTask: () => Promise<void>
  resetTaskForm: () => void
}

export function TaskSpreadsheetView({
  tasks,
  projects,
  phases,
  selectedProjectId,
  currentProjectName,
  taskForm,
  setTaskForm,
  upsertTask,
  deleteTask,
  resetTaskForm,
}: Props) {
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set())
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  function toggleGroup(status: number) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      next.has(status) ? next.delete(status) : next.add(status)
      return next
    })
  }

  function togglePhase(key: string) {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function openNew(status?: number) {
    resetTaskForm()
    if (status != null) {
      setTaskForm((prev) => ({ ...prev, status: String(status) }))
    }
    setModalOpen(true)
  }

  function openEdit(task: Vibe_tasks) {
    setTaskForm({
      id: task.vibe_taskid,
      name: task.vibe_name ?? '',
      projectId: task._vibe_projectid_value ?? '',
      dueDate: task.vibe_duedate?.slice(0, 10) ?? '',
      priority: String(task.vibe_priority ?? 100000001),
      status: String(task.vibe_taskstatus ?? 100000000),
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    resetTaskForm()
  }

  async function handleSave() {
    await upsertTask()
    setModalOpen(false)
  }

  async function handleDelete() {
    await deleteTask()
    setModalOpen(false)
  }

  const projectPhases = useMemo(
    () => phases.filter((p) => !selectedProjectId || p._vibe_projectid_value === selectedProjectId),
    [phases, selectedProjectId],
  )

  const phaseById = useMemo(() => {
    const m: Record<string, string> = {}
    for (const p of projectPhases) m[p.vibe_projectphaseid] = p.vibe_name ?? '(Unnamed Phase)'
    return m
  }, [projectPhases])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return tasks.filter((t) => !q || (t.vibe_name ?? '').toLowerCase().includes(q))
  }, [tasks, search])

  const rows: React.ReactNode[] = []

  for (const statusCode of STATUS_ORDER) {
    const groupTasks = filtered.filter((t) => (t.vibe_taskstatus ?? 100000000) === statusCode)
    const cfg = STATUS_CONFIG[statusCode]
    const collapsed = collapsedGroups.has(statusCode)

    rows.push(
      <tr key={`group-${statusCode}`} className="task-group-header">
        <td colSpan={8}>
          <div className="task-group-header-inner">
            <button
              className="task-group-toggle"
              onClick={() => toggleGroup(statusCode)}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▶' : '▼'}
            </button>
            <Badge label={cfg.label} color={cfg.color} />
            <span className="task-count">{groupTasks.length}</span>
            <button className="f-btn-ghost" onClick={() => openNew(statusCode)}>
              <Plus size={11} /> Add task
            </button>
          </div>
        </td>
      </tr>,
    )

    if (!collapsed) {
      // Group by phase
      const byPhase: Record<string, Vibe_tasks[]> = {}
      const noPhase: Vibe_tasks[] = []
      for (const t of groupTasks) {
        if (t._vibe_phaseid_value) {
          ;(byPhase[t._vibe_phaseid_value] ??= []).push(t)
        } else {
          noPhase.push(t)
        }
      }

      // Tasks with no phase first
      for (const t of noPhase) {
        rows.push(<TaskRow key={t.vibe_taskid} task={t} onEdit={openEdit} />)
      }

      // Phase groups
      for (const [phaseId, phaseTasks] of Object.entries(byPhase)) {
        const phaseKey = `${statusCode}-${phaseId}`
        const phaseCollapsed = collapsedPhases.has(phaseKey)
        rows.push(
          <tr key={`phase-${phaseKey}`} className="task-phase-row">
            <td colSpan={8}>
              <div className="task-phase-inner">
                <button
                  className="task-group-toggle"
                  onClick={() => togglePhase(phaseKey)}
                  style={{ fontSize: '9px' }}
                >
                  {phaseCollapsed ? '▶' : '▼'}
                </button>
                <span className="task-phase-name">{phaseById[phaseId] ?? phaseId}</span>
                <span className="task-count">{phaseTasks.length}</span>
              </div>
            </td>
          </tr>,
        )
        if (!phaseCollapsed) {
          for (const t of phaseTasks) {
            rows.push(<TaskRow key={t.vibe_taskid} task={t} onEdit={openEdit} />)
          }
        }
      }

      rows.push(
        <tr key={`add-${statusCode}`} className="task-add-row">
          <td colSpan={8}>
            <button className="f-btn-ghost" onClick={() => openNew(statusCode)}>
              <Plus size={11} /> Add task
            </button>
          </td>
        </tr>,
      )
    }
  }

  return (
    <div className="f-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="task-view-header">
        <div className="task-view-breadcrumb">
          Projects › <strong>{currentProjectName}</strong>
        </div>
        <button className="f-btn f-btn-primary" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => openNew()}>
          <Plus size={13} /> Add Task
        </button>
      </div>

      <div className="task-view-tabs">
        <button className="task-tab-btn active">
          <Table2 size={13} /> Spreadsheet
        </button>
        <button className="task-tab-btn" title="Coming soon">
          <Calendar size={13} /> Timeline
        </button>
        <button className="task-tab-btn" title="Coming soon">
          <LayoutGrid size={13} /> Calendar
        </button>
        <button className="task-tab-btn" title="Coming soon">
          <Kanban size={13} /> Board
        </button>
      </div>

      <div className="task-search-bar">
        <Search size={14} style={{ color: 'var(--c-text-3)', flexShrink: 0 }} />
        <input
          className="task-search-input"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="task-table-wrap" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}></th>
              <th>Task Name</th>
              <th>Assignee</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Progress</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={taskForm.id ? 'Edit Task' : 'New Task'}
      >
        <div className="modal-body">
          <div className="f-field">
            <label className="f-label">Task name</label>
            <input
              className="f-input"
              value={taskForm.name}
              onChange={(e) => setTaskForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Project</label>
            <select
              className="f-select"
              value={taskForm.projectId}
              onChange={(e) => setTaskForm((p) => ({ ...p, projectId: e.target.value }))}
            >
              {projects.map((p) => (
                <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>
              ))}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Due date</label>
            <input
              className="f-input"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>
          <div className="f-field">
            <label className="f-label">Status</label>
            <select
              className="f-select"
              value={taskForm.status}
              onChange={(e) => setTaskForm((p) => ({ ...p, status: e.target.value }))}
            >
              {entries(Vibe_tasksvibe_taskstatus).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="f-field">
            <label className="f-label">Priority</label>
            <select
              className="f-select"
              value={taskForm.priority}
              onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}
            >
              {entries(Vibe_tasksvibe_priority).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="f-btn f-btn-primary" onClick={handleSave}>
            {taskForm.id ? 'Update' : 'Create'} Task
          </button>
          <button className="f-btn" onClick={closeModal}>Cancel</button>
          {taskForm.id && (
            <button className="f-btn f-btn-danger" style={{ marginLeft: 'auto' }} onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </Modal>
    </div>
  )
}

function TaskRow({ task, onEdit }: { task: Vibe_tasks; onEdit: (t: Vibe_tasks) => void }) {
  const progress = computeProgress(task.vibe_actualhours, task.vibe_estimatedhours)
  const dueCls = dueDateClass(task.vibe_duedate, task.vibe_taskstatus)
  return (
    <tr className="task-row" style={{ cursor: 'pointer' }}>
      <td onClick={(e) => e.stopPropagation()} style={{ paddingLeft: 12 }}>
        <input type="checkbox" style={{ cursor: 'pointer' }} />
      </td>
      <td className="task-name-cell" onClick={() => onEdit(task)}>
        {task.vibe_name ?? '(Unnamed)'}
      </td>
      <td onClick={() => onEdit(task)}>
        {task.vibe_assignedtoidname ? (
          <Avatar name={task.vibe_assignedtoidname} />
        ) : (
          <span style={{ color: 'var(--c-text-3)', fontSize: 12 }}>—</span>
        )}
      </td>
      <td className={dueCls} onClick={() => onEdit(task)}>
        {task.vibe_duedate?.slice(0, 10) ?? '—'}
      </td>
      <td onClick={() => onEdit(task)}>
        <PriorityFlag priority={task.vibe_priority} />
      </td>
      <td onClick={() => onEdit(task)}>
        <ProgressBar value={progress} />
      </td>
      <td>
        <button
          className="f-btn-ghost"
          style={{ padding: '3px 6px' }}
          onClick={() => onEdit(task)}
          title="Edit"
        >
          ···
        </button>
      </td>
    </tr>
  )
}
