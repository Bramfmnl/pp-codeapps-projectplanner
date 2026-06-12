import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'

interface Props {
  projects: Vibe_projects[]
}

export function DocumentsView({ projects }: Props) {
  return (
    <div className="f-panel">
      <div className="f-panel-head">
        <span className="f-panel-title">Documents</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>SharePoint folders</span>
      </div>
      <table className="f-table">
        <thead><tr><th>Project</th><th>SharePoint Folder</th></tr></thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.vibe_projectid}>
              <td>{p.vibe_name}</td>
              <td>
                {p.vibe_sharepointfolderurl
                  ? <a href={p.vibe_sharepointfolderurl} target="_blank" rel="noreferrer">{p.vibe_sharepointfolderurl}</a>
                  : <span style={{ color: 'var(--c-text-3)' }}>—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
