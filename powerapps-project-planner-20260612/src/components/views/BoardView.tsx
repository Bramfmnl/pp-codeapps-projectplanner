import { Plus } from 'lucide-react'
import type { Vibe_tasks } from '../../generated/models/Vibe_tasksModel'
import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'
import type { Vibe_projectphases } from '../../generated/models/Vibe_projectphasesModel'
import { Avatar } from '../ui/Avatar'
import { PriorityFlag } from '../ui/PriorityFlag'

const STATUS_ORDER = [100000001, 100000002, 100000000, 100000003] as const

const STATUS_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  100000001: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  100000002: { label: 'Blocked',     color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  100000000: { label: 'To Do',       color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  100000003: { label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
}

function dueBadge(dueDate?: string, status?: number) {
  if (!dueDate || status === 100000003) return null
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  const label = dueDate.slice(0, 10)
  if (due < now) return <span className="board-card-due overdue">{label}</span>
  if (due - now < 3 * 24 * 60 * 60 * 1000) return <span className="board-card-due soon">{label}</span>
  return <span className="board-card-due">{label}</span>
}

interface Props {
  tasks: Vibe_tasks[]
  teamMembers: Vibe_projectteammembers[]
  phases: Vibe_projectphases[]
  phaseById: Record<string, string>
  onEdit: (task: Vibe_tasks) => void
  onNew: (status?: number) => void
}

export function BoardView({ tasks, teamMembers, phaseById, onEdit, onNew }: Props) {
  const memberById = Object.fromEntries(
    teamMembers.map((m) => [m.vibe_projectteammemberid, m.vibe_contactidname ?? m.vibe_useridname ?? m.vibe_name ?? ''])
  )

  return (
    <div className="board-view">
      <div className="board-columns">
        {STATUS_ORDER.map((statusCode) => {
          const cfg = STATUS_CONFIG[statusCode]
          const colTasks = tasks.filter((t) => (t.vibe_taskstatus ?? 100000000) === statusCode)
          return (
            <div key={statusCode} className="board-col">
              <div className="board-col-header" style={{ borderTopColor: cfg.color }}>
                <div className="board-col-header-left">
                  <span className="board-col-dot" style={{ background: cfg.color }} />
                  <span className="board-col-title">{cfg.label}</span>
                  <span className="board-col-count">{colTasks.length}</span>
                </div>
                <button
                  className="f-btn-ghost"
                  style={{ padding: '3px 6px' }}
                  onClick={() => onNew(statusCode)}
                  title={`Add ${cfg.label} task`}
                >
                  <Plus size={13} />
                </button>
              </div>

              <div className="board-col-body">
                {colTasks.length === 0 ? (
                  <div className="board-col-empty">
                    No tasks yet
                    <button className="board-col-empty-btn" onClick={() => onNew(statusCode)}>
                      + Add task
                    </button>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const assigneeName = task._vibe_assignedtoid_value
                      ? memberById[task._vibe_assignedtoid_value]
                      : task.vibe_assignedtoidname
                    return (
                      <div key={task.vibe_taskid} className="board-card" onClick={() => onEdit(task)}>
                        <div className="board-card-title">{task.vibe_name ?? '(Unnamed)'}</div>
                        {task._vibe_phaseid_value && (
                          <div className="board-card-phase">{phaseById[task._vibe_phaseid_value] ?? ''}</div>
                        )}
                        <div className="board-card-footer">
                          <div className="board-card-footer-left">
                            {assigneeName ? (
                              <Avatar name={assigneeName} />
                            ) : (
                              <div className="board-card-no-assignee" title="Unassigned" />
                            )}
                          </div>
                          <div className="board-card-footer-right">
                            <PriorityFlag priority={task.vibe_priority} />
                            {dueBadge(task.vibe_duedate, task.vibe_taskstatus)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
