import type { Vibe_projectteammembers } from '../../generated/models/Vibe_projectteammembersModel'
import type { Vibe_projectroles } from '../../generated/models/Vibe_projectrolesModel'

interface Props {
  teamMembers: Vibe_projectteammembers[]
  roles: Vibe_projectroles[]
  projectById: Record<string, string>
}

export function StakeholdersView({ teamMembers, roles, projectById }: Props) {
  const stakeholders = teamMembers.filter(
    (m) => m._vibe_roleid_value && roles.some((r) => r.vibe_projectroleid === m._vibe_roleid_value && r.vibe_isstakeholderrole),
  )

  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Stakeholders</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>Stakeholder roles only</span>
      </div>
      <table className="f-table">
        <thead><tr><th>Name</th><th>Project</th><th>Role</th><th>Contact / User</th></tr></thead>
        <tbody>
          {stakeholders.map((m) => (
            <tr key={m.vibe_projectteammemberid}>
              <td>{m.vibe_name}</td>
              <td>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</td>
              <td>{m.vibe_roleidname}</td>
              <td>{m.vibe_contactidname ?? m.vibe_useridname ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
