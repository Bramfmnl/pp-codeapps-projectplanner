import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CalendarDays,
  DollarSign,
  AlertTriangle,
  Package,
  Clock,
  MessageSquare,
  FileText,
  Users2,
  Settings2,
  BarChart3,
} from 'lucide-react'
import type { Vibe_projects } from '../../generated/models/Vibe_projectsModel'

type AppTab =
  | 'home' | 'portfolio' | 'overview' | 'tasks' | 'team'
  | 'planning' | 'budget' | 'raid' | 'deliverables' | 'time'
  | 'communication' | 'documents' | 'stakeholders' | 'settings'

interface NavItem { value: AppTab; label: string; icon: React.ReactNode }

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { value: 'home', label: 'Projects', icon: <FolderKanban size={14} /> },
      { value: 'portfolio', label: 'Portfolio', icon: <BarChart3 size={14} /> },
      { value: 'overview', label: 'Overview', icon: <LayoutDashboard size={14} /> },
    ],
  },
  {
    label: 'Execution',
    items: [
      { value: 'tasks', label: 'Tasks', icon: <CheckSquare size={14} /> },
      { value: 'team', label: 'Team', icon: <Users size={14} /> },
      { value: 'planning', label: 'Planning', icon: <CalendarDays size={14} /> },
      { value: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
    ],
  },
  {
    label: 'Risk & Delivery',
    items: [
      { value: 'raid', label: 'RAID Log', icon: <AlertTriangle size={14} /> },
      { value: 'deliverables', label: 'Deliverables', icon: <Package size={14} /> },
      { value: 'time', label: 'Time Entry', icon: <Clock size={14} /> },
    ],
  },
  {
    label: 'Communication',
    items: [
      { value: 'communication', label: 'Comms & Feed', icon: <MessageSquare size={14} /> },
      { value: 'documents', label: 'Documents', icon: <FileText size={14} /> },
      { value: 'stakeholders', label: 'Stakeholders', icon: <Users2 size={14} /> },
    ],
  },
  {
    label: 'Config',
    items: [
      { value: 'settings', label: 'Settings', icon: <Settings2 size={14} /> },
    ],
  },
]

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="f-toggle" onClick={() => onChange(!checked)}>
      <div className={`f-toggle-track${checked ? ' on' : ''}`}>
        <div className="f-toggle-thumb" />
      </div>
      {label && <span>{label}</span>}
    </label>
  )
}

interface SidebarProps {
  projects: Vibe_projects[]
  selectedProjectId: string
  setSelectedProjectId: (id: string) => void
  activeTab: AppTab
  setActiveTab: (tab: AppTab) => void
  darkMode: boolean
  setDarkMode: (v: boolean) => void
  loading: boolean
  loadData: () => void
}

export function Sidebar({
  projects,
  selectedProjectId,
  setSelectedProjectId,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  loading,
  loadData,
}: SidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-text">Project Planner</span>
        <span className="sidebar-logo-sub">◆ Dataverse · Live</span>
      </div>

      <div className="sidebar-body">
        <div className="sidebar-section">
          <span className="sidebar-section-label">Context</span>
          <button
            className={`sidebar-proj-btn${!selectedProjectId ? ' active' : ''}`}
            onClick={() => setSelectedProjectId('')}
          >
            <span className="sidebar-proj-dot" style={{ background: 'var(--c-text-3)' }} />
            All projects
          </button>
          {projects.map((project) => (
            <button
              key={project.vibe_projectid}
              className={`sidebar-proj-btn${selectedProjectId === project.vibe_projectid ? ' active' : ''}`}
              onClick={() => setSelectedProjectId(project.vibe_projectid)}
            >
              <span
                className="sidebar-proj-dot"
                style={{ background: project.statecode === 0 ? 'var(--c-green)' : 'var(--c-text-3)' }}
              />
              {project.vibe_name}
            </button>
          ))}
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-section">
            <span className="sidebar-section-label">{group.label}</span>
            {group.items.map((item) => (
              <button
                key={item.value}
                className={`sidebar-nav-btn${activeTab === item.value ? ' active' : ''}`}
                onClick={() => setActiveTab(item.value)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Toggle checked={darkMode} onChange={setDarkMode} label="Dark mode" />
        <button
          className="f-btn f-btn-primary f-btn-full"
          onClick={loadData}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Refresh Data'}
        </button>
      </div>
    </aside>
  )
}
