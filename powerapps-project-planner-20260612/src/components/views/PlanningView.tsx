import type { Vibe_resourceallocations } from '../../generated/models/Vibe_resourceallocationsModel'

interface Props {
  allocations: Vibe_resourceallocations[]
  projectById: Record<string, string>
}

export function PlanningView({ allocations, projectById }: Props) {
  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Resource Planning</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {allocations.length} allocations
        </span>
      </div>
      <div>
        <table className="f-table">
          <thead>
            <tr>
              <th>Allocation</th><th>Project</th><th>Member</th><th>Week Start</th><th>Planned hrs</th><th>Actual hrs</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a) => (
              <tr key={a.vibe_resourceallocationid}>
                <td>{a.vibe_name}</td>
                <td>{a._vibe_projectid_value ? (projectById[a._vibe_projectid_value] ?? '—') : '—'}</td>
                <td>{a.vibe_projectteammemberidname}</td>
                <td className="mono">{a.vibe_weekstartdate?.slice(0, 10)}</td>
                <td>
                  <span className={`f-badge ${(a.vibe_plannedhours ?? 0) > 40 ? 'f-badge-danger' : (a.vibe_plannedhours ?? 0) === 40 ? 'f-badge-info' : 'f-badge-success'}`}>
                    {a.vibe_plannedhours ?? 0}
                  </span>
                </td>
                <td className="mono">{a.vibe_actualhours ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
