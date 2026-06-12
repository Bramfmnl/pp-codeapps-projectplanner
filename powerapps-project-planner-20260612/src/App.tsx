import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Field,
  FluentProvider,
  Input,
  makeStyles,
  mergeClasses,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components'
import './App.css'
import type {
  Vibe_projects,
  Vibe_projectsBase,
} from './generated/models/Vibe_projectsModel'
import type {
  Vibe_tasks,
  Vibe_tasksBase,
} from './generated/models/Vibe_tasksModel'
import type {
  Vibe_projectteammembers,
  Vibe_projectteammembersBase,
} from './generated/models/Vibe_projectteammembersModel'
import type {
  Vibe_budgetlines,
  Vibe_budgetlinesBase,
} from './generated/models/Vibe_budgetlinesModel'
import type {
  Vibe_risks,
  Vibe_risksBase,
} from './generated/models/Vibe_risksModel'
import type {
  Vibe_issues,
  Vibe_issuesBase,
} from './generated/models/Vibe_issuesModel'
import type {
  Vibe_deliverables,
  Vibe_deliverablesBase,
} from './generated/models/Vibe_deliverablesModel'
import type {
  Vibe_timeentries,
  Vibe_timeentriesBase,
} from './generated/models/Vibe_timeentriesModel'
import type {
  Vibe_decisionlogs,
  Vibe_decisionlogsBase,
} from './generated/models/Vibe_decisionlogsModel'
import type {
  Vibe_meetingnotes,
  Vibe_meetingnotesBase,
} from './generated/models/Vibe_meetingnotesModel'
import type {
  Vibe_projectroles,
  Vibe_projectrolesBase,
} from './generated/models/Vibe_projectrolesModel'
import type {
  Vibe_projecttemplates,
  Vibe_projecttemplatesBase,
} from './generated/models/Vibe_projecttemplatesModel'
import type { Vibe_resourceallocations } from './generated/models/Vibe_resourceallocationsModel'
import type { Vibe_activityfeedentries } from './generated/models/Vibe_activityfeedentriesModel'
import type { Vibe_invoices } from './generated/models/Vibe_invoicesModel'
import {
  Vibe_budgetlinesvibe_category,
} from './generated/models/Vibe_budgetlinesModel'
import {
  Vibe_deliverablesvibe_deliverablestatus,
} from './generated/models/Vibe_deliverablesModel'
import { Vibe_issuesvibe_issuestatus, Vibe_issuesvibe_severity } from './generated/models/Vibe_issuesModel'
import { Vibe_risksvibe_impact, Vibe_risksvibe_probability, Vibe_risksvibe_riskstatus } from './generated/models/Vibe_risksModel'
import { Vibe_tasksvibe_priority, Vibe_tasksvibe_taskstatus } from './generated/models/Vibe_tasksModel'
import { Vibe_projectsService } from './generated/services/Vibe_projectsService'
import { Vibe_tasksService } from './generated/services/Vibe_tasksService'
import { Vibe_projectteammembersService } from './generated/services/Vibe_projectteammembersService'
import { Vibe_budgetlinesService } from './generated/services/Vibe_budgetlinesService'
import { Vibe_risksService } from './generated/services/Vibe_risksService'
import { Vibe_issuesService } from './generated/services/Vibe_issuesService'
import { Vibe_deliverablesService } from './generated/services/Vibe_deliverablesService'
import { Vibe_timeentriesService } from './generated/services/Vibe_timeentriesService'
import { Vibe_decisionlogsService } from './generated/services/Vibe_decisionlogsService'
import { Vibe_meetingnotesService } from './generated/services/Vibe_meetingnotesService'
import { Vibe_projectrolesService } from './generated/services/Vibe_projectrolesService'
import { Vibe_projecttemplatesService } from './generated/services/Vibe_projecttemplatesService'
import { Vibe_resourceallocationsService } from './generated/services/Vibe_resourceallocationsService'
import { Vibe_activityfeedentriesService } from './generated/services/Vibe_activityfeedentriesService'
import { Vibe_invoicesService } from './generated/services/Vibe_invoicesService'

type AppTab =
  | 'home'
  | 'portfolio'
  | 'overview'
  | 'tasks'
  | 'team'
  | 'planning'
  | 'budget'
  | 'raid'
  | 'deliverables'
  | 'time'
  | 'communication'
  | 'documents'
  | 'stakeholders'
  | 'settings'

type Notice = { type: 'success' | 'error'; message: string } | null

const NAV_GROUPS: { label: string; items: { value: AppTab; label: string }[] }[] = [
  {
    label: 'Overview',
    items: [
      { value: 'home', label: 'Project List' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'overview', label: 'Overview' },
    ],
  },
  {
    label: 'Execution',
    items: [
      { value: 'tasks', label: 'Tasks' },
      { value: 'team', label: 'Team' },
      { value: 'planning', label: 'Planning' },
      { value: 'budget', label: 'Budget' },
    ],
  },
  {
    label: 'Risk & Delivery',
    items: [
      { value: 'raid', label: 'RAID Log' },
      { value: 'deliverables', label: 'Deliverables' },
      { value: 'time', label: 'Time Entry' },
    ],
  },
  {
    label: 'Communication',
    items: [
      { value: 'communication', label: 'Comms & Feed' },
      { value: 'documents', label: 'Documents' },
      { value: 'stakeholders', label: 'Stakeholders' },
    ],
  },
  {
    label: 'Config',
    items: [
      { value: 'settings', label: 'Settings' },
    ],
  },
]

const TAB_LABELS: Record<AppTab, string> = {
  home: 'Project List',
  portfolio: 'Portfolio',
  overview: 'Overview',
  tasks: 'Tasks',
  team: 'Team',
  planning: 'Planning',
  budget: 'Budget',
  raid: 'RAID Log',
  deliverables: 'Deliverables',
  time: 'Time Entry',
  communication: 'Comms & Feed',
  documents: 'Documents',
  stakeholders: 'Stakeholders',
  settings: 'Settings',
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      fontSize: '11px',
      fontWeight: 500,
      fontFamily: 'var(--font-mono)',
      color,
      background: `${color}18`,
      border: `1px solid ${color}35`,
      borderRadius: '4px',
      padding: '2px 8px',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  )
}

function statusColor(name: string | undefined): string {
  const n = (name ?? '').toLowerCase()
  if (n.includes('complet') || n.includes('done') || n.includes('closed') || n.includes('paid')) return 'var(--c-green)'
  if (n.includes('progress') || n.includes('review') || n.includes('open') || n.includes('planning')) return 'var(--c-blue)'
  if (n.includes('hold') || n.includes('pending') || n.includes('medium') || n.includes('monitor')) return 'var(--c-amber)'
  if (n.includes('cancel') || n.includes('blocked') || n.includes('critical') || n.includes('high') || n.includes('overdue')) return 'var(--c-red)'
  if (n.includes('mitigat') || n.includes('accept') || n.includes('transfer')) return 'var(--c-purple)'
  return 'var(--c-text-2)'
}

const styles = makeStyles({
  root: {
    minHeight: '100vh',
    fontFamily: 'var(--font-body)',
    backgroundColor: 'var(--c-bg-0)',
    color: 'var(--c-text-1)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '256px 1fr',
    height: '100vh',
    overflow: 'hidden',
  },
  sidebar: {
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: 'var(--c-bg-1)',
    borderRight: '1px solid var(--c-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarLogo: {
    padding: '22px 20px 16px',
    borderBottom: '1px solid var(--c-border)',
    flexShrink: 0,
  },
  logoText: {
    display: 'block',
    fontFamily: 'var(--font-serif)',
    fontStyle: 'italic',
    fontSize: '20px',
    color: 'var(--c-text-1)',
    lineHeight: 1.2,
  },
  logoSub: {
    display: 'block',
    marginTop: '5px',
    fontFamily: 'var(--font-mono)',
    fontSize: '9px',
    letterSpacing: '0.2em',
    color: 'var(--c-accent)',
    textTransform: 'uppercase',
  },
  sidebarBody: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '6px',
    paddingBottom: '6px',
  },
  sidebarSection: {
    padding: '8px 12px 4px',
  },
  sidebarSectionLabel: {
    display: 'block',
    fontSize: '9px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'var(--c-text-3)',
    padding: '0 8px 5px',
  },
  navBtn: {
    display: 'block',
    width: '100%',
    padding: '7px 10px',
    marginBottom: '1px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: 'var(--c-text-2)',
    fontSize: '13px',
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    cursor: 'pointer',
    textAlign: 'left',
    ':hover': {
      backgroundColor: 'var(--c-bg-3)',
      color: 'var(--c-text-1)',
    },
  },
  navBtnActive: {
    backgroundColor: 'var(--c-accent-dim)',
    color: 'var(--c-accent)',
    fontWeight: 500,
    ':hover': {
      backgroundColor: 'var(--c-accent-dim)',
      color: 'var(--c-accent)',
    },
  },
  projBtn: {
    display: 'block',
    width: '100%',
    padding: '5px 10px',
    marginBottom: '1px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: 'transparent',
    color: 'var(--c-text-2)',
    fontSize: '12px',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    ':hover': {
      backgroundColor: 'var(--c-bg-3)',
      color: 'var(--c-text-1)',
    },
  },
  projBtnActive: {
    backgroundColor: 'var(--c-accent-dim)',
    color: 'var(--c-accent)',
    ':hover': {
      backgroundColor: 'var(--c-accent-dim)',
      color: 'var(--c-accent)',
    },
  },
  sidebarFooter: {
    padding: '12px 14px',
    borderTop: '1px solid var(--c-border)',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  content: {
    height: '100vh',
    overflowY: 'auto',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
    margin: 0,
  },
  pageCtx: {
    fontSize: '11px',
    color: 'var(--c-text-2)',
    fontFamily: 'var(--font-mono)',
    marginTop: '3px',
  },
  notice: {
    padding: '9px 14px',
    borderRadius: '6px',
    fontSize: '13px',
  },
  noticeSuccess: {
    backgroundColor: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.22)',
    color: 'var(--c-green)',
  },
  noticeError: {
    backgroundColor: 'rgba(244,63,94,0.08)',
    border: '1px solid rgba(244,63,94,0.22)',
    color: 'var(--c-red)',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '14px',
  },
  kpiCard: {
    position: 'relative',
    padding: '18px 18px 18px 22px',
    backgroundColor: 'var(--c-bg-2)',
    border: '1px solid var(--c-border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  kpiStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '3px',
  },
  kpiLabel: {
    display: 'block',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--c-text-2)',
    marginBottom: '8px',
  },
  kpiValue: {
    display: 'block',
    fontSize: '28px',
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
    color: 'var(--c-text-1)',
    lineHeight: 1,
  },
  panel: {
    backgroundColor: 'var(--c-bg-2)',
    border: '1px solid var(--c-border)',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  panelHead: {
    padding: '13px 18px',
    borderBottom: '1px solid var(--c-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'var(--c-text-1)',
    letterSpacing: '-0.01em',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  formZone: {
    padding: '14px 18px',
    borderTop: '1px solid var(--c-border)',
    backgroundColor: 'var(--c-bg-1)',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '10px',
  },
  formActions: {
    padding: '10px 18px',
    borderTop: '1px solid var(--c-border)',
    backgroundColor: 'var(--c-bg-1)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  colStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  rowClickable: {
    cursor: 'pointer',
  },
  monoCell: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  },
})

const bind = (entitySet: string, id: string) => `/${entitySet}(${id})`
const asCreatePayload = <T,>(payload: Partial<T>): T => payload as T
const entries = <T extends Record<number, string>>(values: T) =>
  Object.entries(values) as Array<[string, string]>

function parseNumber(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function App() {
  const s = styles()

  const [darkMode, setDarkMode] = useState(true)
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const [notice, setNotice] = useState<Notice>(null)
  const [loading, setLoading] = useState(false)

  const [projects, setProjects] = useState<Vibe_projects[]>([])
  const [tasks, setTasks] = useState<Vibe_tasks[]>([])
  const [teamMembers, setTeamMembers] = useState<Vibe_projectteammembers[]>([])
  const [budgetLines, setBudgetLines] = useState<Vibe_budgetlines[]>([])
  const [risks, setRisks] = useState<Vibe_risks[]>([])
  const [issues, setIssues] = useState<Vibe_issues[]>([])
  const [deliverables, setDeliverables] = useState<Vibe_deliverables[]>([])
  const [timeEntries, setTimeEntries] = useState<Vibe_timeentries[]>([])
  const [decisions, setDecisions] = useState<Vibe_decisionlogs[]>([])
  const [meetingNotes, setMeetingNotes] = useState<Vibe_meetingnotes[]>([])
  const [roles, setRoles] = useState<Vibe_projectroles[]>([])
  const [templates, setTemplates] = useState<Vibe_projecttemplates[]>([])
  const [allocations, setAllocations] = useState<Vibe_resourceallocations[]>([])
  const [feed, setFeed] = useState<Vibe_activityfeedentries[]>([])
  const [invoices, setInvoices] = useState<Vibe_invoices[]>([])

  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const [projectForm, setProjectForm] = useState({
    id: '',
    name: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    templateId: '',
  })
  const [taskForm, setTaskForm] = useState({
    id: '',
    name: '',
    projectId: '',
    dueDate: '',
    priority: '100000001',
    status: '100000000',
  })
  const [teamForm, setTeamForm] = useState({
    id: '',
    name: '',
    projectId: '',
    roleId: '',
    allocation: '100',
    hourlyRate: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })
  const [budgetForm, setBudgetForm] = useState({
    id: '',
    name: '',
    projectId: '',
    estimated: '',
    actual: '',
    category: '100000005',
  })
  const [riskForm, setRiskForm] = useState({
    id: '',
    title: '',
    projectId: '',
    probability: '100000002',
    impact: '100000002',
    status: '100000000',
  })
  const [issueForm, setIssueForm] = useState({
    id: '',
    title: '',
    projectId: '',
    severity: '100000001',
    status: '100000000',
  })
  const [deliverableForm, setDeliverableForm] = useState({
    id: '',
    name: '',
    projectId: '',
    dueDate: '',
    status: '100000000',
    documentLink: '',
    responsibleId: '',
  })
  const [timeForm, setTimeForm] = useState({
    id: '',
    name: '',
    projectId: '',
    taskId: '',
    teamMemberId: '',
    date: '',
    hours: '',
  })
  const [decisionForm, setDecisionForm] = useState({
    id: '',
    title: '',
    projectId: '',
    madeById: '',
    date: '',
  })
  const [meetingForm, setMeetingForm] = useState({
    id: '',
    title: '',
    projectId: '',
    date: '',
  })
  const [roleForm, setRoleForm] = useState({
    id: '',
    name: '',
    defaultRate: '',
    isStakeholder: false,
  })
  const [templateForm, setTemplateForm] = useState({
    id: '',
    name: '',
    isActive: true,
  })

  const projectById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of projects) {
      map[p.vibe_projectid] = p.vibe_name ?? '(Unnamed Project)'
    }
    return map
  }, [projects])

  const currentProjectName = selectedProjectId ? (projectById[selectedProjectId] ?? selectedProjectId) : 'All projects'

  const filteredTasks = useMemo(
    () => tasks.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [tasks, selectedProjectId],
  )
  const filteredTeam = useMemo(
    () => teamMembers.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [teamMembers, selectedProjectId],
  )
  const filteredBudget = useMemo(
    () => budgetLines.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [budgetLines, selectedProjectId],
  )
  const filteredRisks = useMemo(
    () => risks.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [risks, selectedProjectId],
  )
  const filteredIssues = useMemo(
    () => issues.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [issues, selectedProjectId],
  )
  const filteredDeliverables = useMemo(
    () => deliverables.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [deliverables, selectedProjectId],
  )
  const filteredTime = useMemo(
    () => timeEntries.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [timeEntries, selectedProjectId],
  )
  const filteredDecisions = useMemo(
    () => decisions.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [decisions, selectedProjectId],
  )
  const filteredMeetings = useMemo(
    () => meetingNotes.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId),
    [meetingNotes, selectedProjectId],
  )

  const activeProjects = projects.filter((p) => p.statecode === 0).length
  const openRisks = risks.filter((r) => r.vibe_riskstatus !== 100000002 && r.vibe_riskstatus !== 100000003).length
  const overdueTasks = tasks.filter((t) => {
    if (!t.vibe_duedate) return false
    if (t.vibe_taskstatus === 100000003) return false
    return new Date(t.vibe_duedate).getTime() < Date.now()
  }).length
  const budgetTotal = projects.reduce((sum, p) => sum + (p.vibe_totalbudget ?? 0), 0)
  const budgetSpent = projects.reduce((sum, p) => sum + (p.vibe_budgetspent ?? 0), 0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData() }, [])

  async function execute(action: () => Promise<void>, successMessage: string) {
    setNotice(null)
    try {
      await action()
      setNotice({ type: 'success', message: successMessage })
      await loadData()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error'
      setNotice({ type: 'error', message })
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const [
        projectResult,
        taskResult,
        teamResult,
        budgetResult,
        riskResult,
        issueResult,
        deliverableResult,
        timeResult,
        decisionResult,
        meetingResult,
        roleResult,
        templateResult,
        allocationResult,
        feedResult,
        invoiceResult,
      ] = await Promise.all([
        Vibe_projectsService.getAll({
          select: [
            'vibe_projectid',
            'vibe_name',
            'vibe_startdate',
            'vibe_enddate',
            'vibe_totalbudget',
            'vibe_budgetspent',
            'vibe_budgetremaining',
            'vibe_sharepointfolderurl',
            '_vibe_templatesourceid_value',
            'statecode',
          ],
          orderBy: ['vibe_name asc'],
          top: 1000,
        }),
        Vibe_tasksService.getAll({
          select: [
            'vibe_taskid',
            'vibe_name',
            '_vibe_projectid_value',
            'vibe_taskstatus',
            'vibe_priority',
            'vibe_duedate',
          ],
          orderBy: ['vibe_name asc'],
          top: 1000,
        }),
        Vibe_projectteammembersService.getAll({
          select: [
            'vibe_projectteammemberid',
            'vibe_name',
            '_vibe_projectid_value',
            '_vibe_roleid_value',
            'vibe_roleidname',
            'vibe_allocationpercentage',
            'vibe_hourlyrate',
            'vibe_startdate',
            'vibe_enddate',
            'vibe_isactive',
            'vibe_contactidname',
            'vibe_useridname',
          ],
          top: 1000,
        }),
        Vibe_budgetlinesService.getAll({
          select: [
            'vibe_budgetlineid',
            'vibe_name',
            '_vibe_projectid_value',
            'vibe_estimatedamount',
            'vibe_actualamount',
            'vibe_category',
          ],
          top: 1000,
        }),
        Vibe_risksService.getAll({
          select: [
            'vibe_riskid',
            'vibe_title',
            '_vibe_projectid_value',
            'vibe_probability',
            'vibe_impact',
            'vibe_riskscore',
            'vibe_riskstatus',
          ],
          top: 1000,
        }),
        Vibe_issuesService.getAll({
          select: [
            'vibe_issueid',
            'vibe_title',
            '_vibe_projectid_value',
            'vibe_issuestatus',
            'vibe_severity',
          ],
          top: 1000,
        }),
        Vibe_deliverablesService.getAll({
          select: [
            'vibe_deliverableid',
            'vibe_name',
            '_vibe_projectid_value',
            '_vibe_responsibleid_value',
            'vibe_responsibleidname',
            'vibe_duedate',
            'vibe_deliverablestatus',
            'vibe_documentlink',
          ],
          top: 1000,
        }),
        Vibe_timeentriesService.getAll({
          select: [
            'vibe_timeentryid',
            'vibe_name',
            '_vibe_projectid_value',
            '_vibe_taskid_value',
            '_vibe_teammemberid_value',
            'vibe_taskidname',
            'vibe_teammemberidname',
            'vibe_date',
            'vibe_hours',
          ],
          orderBy: ['vibe_date desc'],
          top: 1000,
        }),
        Vibe_decisionlogsService.getAll({
          select: [
            'vibe_decisionlogid',
            'vibe_title',
            '_vibe_projectid_value',
            '_vibe_madebyid_value',
            'vibe_madebyidname',
            'vibe_date',
          ],
          orderBy: ['vibe_date desc'],
          top: 1000,
        }),
        Vibe_meetingnotesService.getAll({
          select: [
            'vibe_meetingnoteid',
            'vibe_title',
            '_vibe_projectid_value',
            'vibe_date',
          ],
          orderBy: ['vibe_date desc'],
          top: 1000,
        }),
        Vibe_projectrolesService.getAll({
          select: [
            'vibe_projectroleid',
            'vibe_name',
            'vibe_defaulthourlyrate',
            'vibe_isstakeholderrole',
          ],
          orderBy: ['vibe_name asc'],
          top: 1000,
        }),
        Vibe_projecttemplatesService.getAll({
          select: ['vibe_projecttemplateid', 'vibe_name', 'vibe_isactive'],
          orderBy: ['vibe_name asc'],
          top: 1000,
        }),
        Vibe_resourceallocationsService.getAll({
          select: [
            'vibe_resourceallocationid',
            'vibe_name',
            '_vibe_projectid_value',
            'vibe_projectteammemberidname',
            'vibe_weekstartdate',
            'vibe_plannedhours',
            'vibe_actualhours',
          ],
          top: 1000,
        }),
        Vibe_activityfeedentriesService.getAll({
          select: [
            'vibe_activityfeedentryid',
            'vibe_timestamp',
            '_vibe_projectid_value',
            'vibe_eventtype',
            'vibe_description',
            'vibe_actoridname',
          ],
          orderBy: ['vibe_timestamp desc'],
          top: 200,
        }),
        Vibe_invoicesService.getAll({
          select: [
            'vibe_invoiceid',
            'vibe_invoicenumber',
            '_vibe_projectid_value',
            'vibe_amount',
            'vibe_dateissued',
            'vibe_duedate',
            'vibe_datepaid',
          ],
          top: 1000,
        }),
      ])

      setProjects(projectResult.data ?? [])
      setTasks(taskResult.data ?? [])
      setTeamMembers(teamResult.data ?? [])
      setBudgetLines(budgetResult.data ?? [])
      setRisks(riskResult.data ?? [])
      setIssues(issueResult.data ?? [])
      setDeliverables(deliverableResult.data ?? [])
      setTimeEntries(timeResult.data ?? [])
      setDecisions(decisionResult.data ?? [])
      setMeetingNotes(meetingResult.data ?? [])
      setRoles(roleResult.data ?? [])
      setTemplates(templateResult.data ?? [])
      setAllocations(allocationResult.data ?? [])
      setFeed(feedResult.data ?? [])
      setInvoices(invoiceResult.data ?? [])

      if (!selectedProjectId && (projectResult.data?.length ?? 0) > 0) {
        setSelectedProjectId(projectResult.data?.[0].vibe_projectid ?? '')
      }
    } finally {
      setLoading(false)
    }
  }

  function resetProjectForm() {
    setProjectForm({ id: '', name: '', startDate: '', endDate: '', totalBudget: '', templateId: '' })
  }
  function resetTaskForm() {
    setTaskForm({ id: '', name: '', projectId: selectedProjectId, dueDate: '', priority: '100000001', status: '100000000' })
  }
  function resetTeamForm() {
    setTeamForm({ id: '', name: '', projectId: selectedProjectId, roleId: '', allocation: '100', hourlyRate: '', startDate: '', endDate: '', isActive: true })
  }
  function resetBudgetForm() {
    setBudgetForm({ id: '', name: '', projectId: selectedProjectId, estimated: '', actual: '', category: '100000005' })
  }
  function resetRiskForm() {
    setRiskForm({ id: '', title: '', projectId: selectedProjectId, probability: '100000002', impact: '100000002', status: '100000000' })
  }
  function resetIssueForm() {
    setIssueForm({ id: '', title: '', projectId: selectedProjectId, severity: '100000001', status: '100000000' })
  }
  function resetDeliverableForm() {
    setDeliverableForm({ id: '', name: '', projectId: selectedProjectId, dueDate: '', status: '100000000', documentLink: '', responsibleId: '' })
  }
  function resetTimeForm() {
    setTimeForm({ id: '', name: '', projectId: selectedProjectId, taskId: '', teamMemberId: '', date: '', hours: '' })
  }
  function resetDecisionForm() {
    setDecisionForm({ id: '', title: '', projectId: selectedProjectId, madeById: '', date: '' })
  }
  function resetMeetingForm() {
    setMeetingForm({ id: '', title: '', projectId: selectedProjectId, date: '' })
  }
  function resetRoleForm() {
    setRoleForm({ id: '', name: '', defaultRate: '', isStakeholder: false })
  }
  function resetTemplateForm() {
    setTemplateForm({ id: '', name: '', isActive: true })
  }

  async function upsertProject() {
    const payload: Partial<Vibe_projectsBase> = {
      vibe_name: projectForm.name,
      vibe_startdate: projectForm.startDate || undefined,
      vibe_enddate: projectForm.endDate || undefined,
      vibe_totalbudget: parseNumber(projectForm.totalBudget),
      'vibe_templatesourceid@odata.bind': projectForm.templateId ? bind('vibe_projecttemplates', projectForm.templateId) : undefined,
    }
    if (projectForm.id) {
      await execute(async () => { await Vibe_projectsService.update(projectForm.id, payload) }, 'Project updated.')
    } else {
      await execute(async () => { await Vibe_projectsService.create(asCreatePayload<Omit<Vibe_projectsBase, 'vibe_projectid'>>(payload)) }, 'Project created.')
    }
    resetProjectForm()
  }

  async function deleteProject() {
    if (!projectForm.id) return
    await execute(async () => { await Vibe_projectsService.delete(projectForm.id) }, 'Project deleted.')
    resetProjectForm()
  }

  async function upsertTask() {
    const payload: Partial<Vibe_tasksBase> = {
      vibe_name: taskForm.name,
      vibe_duedate: taskForm.dueDate || undefined,
      vibe_priority: Number(taskForm.priority) as Vibe_tasksBase['vibe_priority'],
      vibe_taskstatus: Number(taskForm.status) as Vibe_tasksBase['vibe_taskstatus'],
      'vibe_projectid@odata.bind': taskForm.projectId ? bind('vibe_projects', taskForm.projectId) : undefined,
    }
    if (taskForm.id) {
      await execute(async () => { await Vibe_tasksService.update(taskForm.id, payload) }, 'Task updated.')
    } else {
      await execute(async () => { await Vibe_tasksService.create(asCreatePayload<Omit<Vibe_tasksBase, 'vibe_taskid'>>(payload)) }, 'Task created.')
    }
    resetTaskForm()
  }

  async function deleteTask() {
    if (!taskForm.id) return
    await execute(async () => { await Vibe_tasksService.delete(taskForm.id) }, 'Task deleted.')
    resetTaskForm()
  }

  async function upsertTeam() {
    const payload: Partial<Vibe_projectteammembersBase> = {
      vibe_name: teamForm.name,
      vibe_allocationpercentage: parseNumber(teamForm.allocation),
      vibe_hourlyrate: parseNumber(teamForm.hourlyRate),
      vibe_startdate: teamForm.startDate || undefined,
      vibe_enddate: teamForm.endDate || undefined,
      vibe_isactive: teamForm.isActive,
      'vibe_projectid@odata.bind': teamForm.projectId ? bind('vibe_projects', teamForm.projectId) : undefined,
      'vibe_roleid@odata.bind': teamForm.roleId ? bind('vibe_projectroles', teamForm.roleId) : undefined,
    }
    if (teamForm.id) {
      await execute(async () => { await Vibe_projectteammembersService.update(teamForm.id, payload) }, 'Team member updated.')
    } else {
      await execute(async () => { await Vibe_projectteammembersService.create(asCreatePayload<Omit<Vibe_projectteammembersBase, 'vibe_projectteammemberid'>>(payload)) }, 'Team member created.')
    }
    resetTeamForm()
  }

  async function deleteTeam() {
    if (!teamForm.id) return
    await execute(async () => { await Vibe_projectteammembersService.delete(teamForm.id) }, 'Team member deleted.')
    resetTeamForm()
  }

  async function upsertBudget() {
    const payload: Partial<Vibe_budgetlinesBase> = {
      vibe_name: budgetForm.name,
      vibe_estimatedamount: parseNumber(budgetForm.estimated),
      vibe_actualamount: parseNumber(budgetForm.actual),
      vibe_category: Number(budgetForm.category) as Vibe_budgetlinesBase['vibe_category'],
      'vibe_projectid@odata.bind': budgetForm.projectId ? bind('vibe_projects', budgetForm.projectId) : undefined,
    }
    if (budgetForm.id) {
      await execute(async () => { await Vibe_budgetlinesService.update(budgetForm.id, payload) }, 'Budget line updated.')
    } else {
      await execute(async () => { await Vibe_budgetlinesService.create(asCreatePayload<Omit<Vibe_budgetlinesBase, 'vibe_budgetlineid'>>(payload)) }, 'Budget line created.')
    }
    resetBudgetForm()
  }

  async function deleteBudget() {
    if (!budgetForm.id) return
    await execute(async () => { await Vibe_budgetlinesService.delete(budgetForm.id) }, 'Budget line deleted.')
    resetBudgetForm()
  }

  async function upsertRisk() {
    const payload: Partial<Vibe_risksBase> = {
      vibe_title: riskForm.title,
      vibe_probability: Number(riskForm.probability) as Vibe_risksBase['vibe_probability'],
      vibe_impact: Number(riskForm.impact) as Vibe_risksBase['vibe_impact'],
      vibe_riskstatus: Number(riskForm.status) as Vibe_risksBase['vibe_riskstatus'],
      'vibe_projectid@odata.bind': riskForm.projectId ? bind('vibe_projects', riskForm.projectId) : undefined,
    }
    if (riskForm.id) {
      await execute(async () => { await Vibe_risksService.update(riskForm.id, payload) }, 'Risk updated.')
    } else {
      await execute(async () => { await Vibe_risksService.create(asCreatePayload<Omit<Vibe_risksBase, 'vibe_riskid'>>(payload)) }, 'Risk created.')
    }
    resetRiskForm()
  }

  async function deleteRisk() {
    if (!riskForm.id) return
    await execute(async () => { await Vibe_risksService.delete(riskForm.id) }, 'Risk deleted.')
    resetRiskForm()
  }

  async function upsertIssue() {
    const payload: Partial<Vibe_issuesBase> = {
      vibe_title: issueForm.title,
      vibe_severity: Number(issueForm.severity) as Vibe_issuesBase['vibe_severity'],
      vibe_issuestatus: Number(issueForm.status) as Vibe_issuesBase['vibe_issuestatus'],
      'vibe_projectid@odata.bind': issueForm.projectId ? bind('vibe_projects', issueForm.projectId) : undefined,
    }
    if (issueForm.id) {
      await execute(async () => { await Vibe_issuesService.update(issueForm.id, payload) }, 'Issue updated.')
    } else {
      await execute(async () => { await Vibe_issuesService.create(asCreatePayload<Omit<Vibe_issuesBase, 'vibe_issueid'>>(payload)) }, 'Issue created.')
    }
    resetIssueForm()
  }

  async function deleteIssue() {
    if (!issueForm.id) return
    await execute(async () => { await Vibe_issuesService.delete(issueForm.id) }, 'Issue deleted.')
    resetIssueForm()
  }

  async function upsertDeliverable() {
    const payload: Partial<Vibe_deliverablesBase> = {
      vibe_name: deliverableForm.name,
      vibe_duedate: deliverableForm.dueDate || undefined,
      vibe_deliverablestatus: Number(deliverableForm.status) as Vibe_deliverablesBase['vibe_deliverablestatus'],
      vibe_documentlink: deliverableForm.documentLink || undefined,
      'vibe_projectid@odata.bind': deliverableForm.projectId ? bind('vibe_projects', deliverableForm.projectId) : undefined,
      'vibe_responsibleid@odata.bind': deliverableForm.responsibleId ? bind('vibe_projectteammembers', deliverableForm.responsibleId) : undefined,
    }
    if (deliverableForm.id) {
      await execute(async () => { await Vibe_deliverablesService.update(deliverableForm.id, payload) }, 'Deliverable updated.')
    } else {
      await execute(async () => { await Vibe_deliverablesService.create(asCreatePayload<Omit<Vibe_deliverablesBase, 'vibe_deliverableid'>>(payload)) }, 'Deliverable created.')
    }
    resetDeliverableForm()
  }

  async function deleteDeliverable() {
    if (!deliverableForm.id) return
    await execute(async () => { await Vibe_deliverablesService.delete(deliverableForm.id) }, 'Deliverable deleted.')
    resetDeliverableForm()
  }

  async function upsertTime() {
    const payload: Partial<Vibe_timeentriesBase> = {
      vibe_name: timeForm.name,
      vibe_date: timeForm.date || undefined,
      vibe_hours: parseNumber(timeForm.hours),
      'vibe_projectid@odata.bind': timeForm.projectId ? bind('vibe_projects', timeForm.projectId) : undefined,
      'vibe_taskid@odata.bind': timeForm.taskId ? bind('vibe_tasks', timeForm.taskId) : undefined,
      'vibe_teammemberid@odata.bind': timeForm.teamMemberId ? bind('vibe_projectteammembers', timeForm.teamMemberId) : undefined,
    }
    if (timeForm.id) {
      await execute(async () => { await Vibe_timeentriesService.update(timeForm.id, payload) }, 'Time entry updated.')
    } else {
      await execute(async () => { await Vibe_timeentriesService.create(asCreatePayload<Omit<Vibe_timeentriesBase, 'vibe_timeentryid'>>(payload)) }, 'Time entry created.')
    }
    resetTimeForm()
  }

  async function deleteTime() {
    if (!timeForm.id) return
    await execute(async () => { await Vibe_timeentriesService.delete(timeForm.id) }, 'Time entry deleted.')
    resetTimeForm()
  }

  async function upsertDecision() {
    const payload: Partial<Vibe_decisionlogsBase> = {
      vibe_title: decisionForm.title,
      vibe_date: decisionForm.date || undefined,
      'vibe_projectid@odata.bind': decisionForm.projectId ? bind('vibe_projects', decisionForm.projectId) : undefined,
      'vibe_madebyid@odata.bind': decisionForm.madeById ? bind('vibe_projectteammembers', decisionForm.madeById) : undefined,
    }
    if (decisionForm.id) {
      await execute(async () => { await Vibe_decisionlogsService.update(decisionForm.id, payload) }, 'Decision updated.')
    } else {
      await execute(async () => { await Vibe_decisionlogsService.create(asCreatePayload<Omit<Vibe_decisionlogsBase, 'vibe_decisionlogid'>>(payload)) }, 'Decision created.')
    }
    resetDecisionForm()
  }

  async function deleteDecision() {
    if (!decisionForm.id) return
    await execute(async () => { await Vibe_decisionlogsService.delete(decisionForm.id) }, 'Decision deleted.')
    resetDecisionForm()
  }

  async function upsertMeeting() {
    const payload: Partial<Vibe_meetingnotesBase> = {
      vibe_title: meetingForm.title,
      vibe_date: meetingForm.date || undefined,
      'vibe_projectid@odata.bind': meetingForm.projectId ? bind('vibe_projects', meetingForm.projectId) : undefined,
    }
    if (meetingForm.id) {
      await execute(async () => { await Vibe_meetingnotesService.update(meetingForm.id, payload) }, 'Meeting note updated.')
    } else {
      await execute(async () => { await Vibe_meetingnotesService.create(asCreatePayload<Omit<Vibe_meetingnotesBase, 'vibe_meetingnoteid'>>(payload)) }, 'Meeting note created.')
    }
    resetMeetingForm()
  }

  async function deleteMeeting() {
    if (!meetingForm.id) return
    await execute(async () => { await Vibe_meetingnotesService.delete(meetingForm.id) }, 'Meeting note deleted.')
    resetMeetingForm()
  }

  async function upsertRole() {
    const payload: Partial<Vibe_projectrolesBase> = {
      vibe_name: roleForm.name,
      vibe_defaulthourlyrate: parseNumber(roleForm.defaultRate),
      vibe_isstakeholderrole: roleForm.isStakeholder,
    }
    if (roleForm.id) {
      await execute(async () => { await Vibe_projectrolesService.update(roleForm.id, payload) }, 'Role updated.')
    } else {
      await execute(async () => { await Vibe_projectrolesService.create(asCreatePayload<Omit<Vibe_projectrolesBase, 'vibe_projectroleid'>>(payload)) }, 'Role created.')
    }
    resetRoleForm()
  }

  async function deleteRole() {
    if (!roleForm.id) return
    await execute(async () => { await Vibe_projectrolesService.delete(roleForm.id) }, 'Role deleted.')
    resetRoleForm()
  }

  async function upsertTemplate() {
    const payload: Partial<Vibe_projecttemplatesBase> = {
      vibe_name: templateForm.name,
      vibe_isactive: templateForm.isActive,
    }
    if (templateForm.id) {
      await execute(async () => { await Vibe_projecttemplatesService.update(templateForm.id, payload) }, 'Template updated.')
    } else {
      await execute(async () => { await Vibe_projecttemplatesService.create(asCreatePayload<Omit<Vibe_projecttemplatesBase, 'vibe_projecttemplateid'>>(payload)) }, 'Template created.')
    }
    resetTemplateForm()
  }

  async function deleteTemplate() {
    if (!templateForm.id) return
    await execute(async () => { await Vibe_projecttemplatesService.delete(templateForm.id) }, 'Template deleted.')
    resetTemplateForm()
  }

  const theme = darkMode ? webDarkTheme : webLightTheme

  const renderHome = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Projects</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {projects.length} total
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Start</TableHeaderCell>
              <TableHeaderCell>End</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Budget</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.vibe_projectid}
                className={s.rowClickable}
                onClick={() => {
                  setSelectedProjectId(project.vibe_projectid)
                  setProjectForm({
                    id: project.vibe_projectid,
                    name: project.vibe_name ?? '',
                    startDate: project.vibe_startdate?.slice(0, 10) ?? '',
                    endDate: project.vibe_enddate?.slice(0, 10) ?? '',
                    totalBudget: `${project.vibe_totalbudget ?? ''}`,
                    templateId: project._vibe_templatesourceid_value ?? '',
                  })
                }}
              >
                <TableCell>{project.vibe_name}</TableCell>
                <TableCell className={s.monoCell}>{project.vibe_startdate?.slice(0, 10) ?? '—'}</TableCell>
                <TableCell className={s.monoCell}>{project.vibe_enddate?.slice(0, 10) ?? '—'}</TableCell>
                <TableCell>
                  <StatusPill
                    label={project.statecode === 0 ? 'Active' : 'Inactive'}
                    color={project.statecode === 0 ? 'var(--c-green)' : 'var(--c-text-2)'}
                  />
                </TableCell>
                <TableCell className={s.monoCell}>
                  {project.vibe_totalbudget != null ? project.vibe_totalbudget.toLocaleString() : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={s.formZone}>
        <Field label="Name"><Input value={projectForm.name} onChange={(_, d) => setProjectForm((p) => ({ ...p, name: d.value }))} /></Field>
        <Field label="Start date"><Input type="date" value={projectForm.startDate} onChange={(_, d) => setProjectForm((p) => ({ ...p, startDate: d.value }))} /></Field>
        <Field label="End date"><Input type="date" value={projectForm.endDate} onChange={(_, d) => setProjectForm((p) => ({ ...p, endDate: d.value }))} /></Field>
        <Field label="Total budget"><Input value={projectForm.totalBudget} onChange={(_, d) => setProjectForm((p) => ({ ...p, totalBudget: d.value }))} /></Field>
        <Field label="Template">
          <Select value={projectForm.templateId} onChange={(_, d) => setProjectForm((p) => ({ ...p, templateId: d.value }))}>
            <option value="">None</option>
            {templates.map((t) => (
              <option key={t.vibe_projecttemplateid} value={t.vibe_projecttemplateid}>{t.vibe_name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className={s.formActions}>
        <Button appearance="primary" onClick={upsertProject}>{projectForm.id ? 'Update' : 'Create'} Project</Button>
        <Button appearance="secondary" onClick={resetProjectForm}>Clear</Button>
        <Button appearance="outline" disabled={!projectForm.id} onClick={deleteProject}>Delete</Button>
      </div>
    </div>
  )

  const renderPortfolio = () => (
    <div className={s.kpiGrid}>
      <div className={s.kpiCard}>
        <div className={s.kpiStripe} style={{ background: 'var(--c-blue)' }} />
        <span className={s.kpiLabel}>Active Projects</span>
        <span className={s.kpiValue}>{activeProjects}</span>
      </div>
      <div className={s.kpiCard}>
        <div className={s.kpiStripe} style={{ background: 'var(--c-red)' }} />
        <span className={s.kpiLabel}>Overdue Tasks</span>
        <span className={s.kpiValue}>{overdueTasks}</span>
      </div>
      <div className={s.kpiCard}>
        <div className={s.kpiStripe} style={{ background: 'var(--c-amber)' }} />
        <span className={s.kpiLabel}>Open Risks</span>
        <span className={s.kpiValue}>{openRisks}</span>
      </div>
      <div className={s.kpiCard}>
        <div className={s.kpiStripe} style={{ background: 'var(--c-accent)' }} />
        <span className={s.kpiLabel}>Budget Burn</span>
        <span className={s.kpiValue}>{budgetTotal ? Math.round((budgetSpent / budgetTotal) * 100) : 0}%</span>
      </div>
    </div>
  )

  const renderOverview = () => {
    const totalHours = filteredTime.reduce((sum, t) => sum + (t.vibe_hours ?? 0), 0)
    const budgetPct = budgetTotal ? Math.round((budgetSpent / budgetTotal) * 100) : 0
    return (
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiStripe} style={{ background: 'var(--c-blue)' }} />
          <span className={s.kpiLabel}>Tasks</span>
          <span className={s.kpiValue}>{filteredTasks.length}</span>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiStripe} style={{ background: 'var(--c-green)' }} />
          <span className={s.kpiLabel}>Team Members</span>
          <span className={s.kpiValue}>{filteredTeam.length}</span>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiStripe} style={{ background: 'var(--c-accent)' }} />
          <span className={s.kpiLabel}>Budget Burn</span>
          <span className={s.kpiValue}>{budgetPct}%</span>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiStripe} style={{ background: 'var(--c-purple)' }} />
          <span className={s.kpiLabel}>Hours Logged</span>
          <span className={s.kpiValue}>{totalHours.toFixed(0)}</span>
        </div>
      </div>
    )
  }

  const renderTasks = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Tasks</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {filteredTasks.length} items
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Priority</TableHeaderCell>
              <TableHeaderCell>Due</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.vibe_taskid} className={s.rowClickable} onClick={() => setTaskForm({
                id: task.vibe_taskid,
                name: task.vibe_name ?? '',
                projectId: task._vibe_projectid_value ?? '',
                dueDate: task.vibe_duedate?.slice(0, 10) ?? '',
                priority: `${task.vibe_priority ?? 100000001}`,
                status: `${task.vibe_taskstatus ?? 100000000}`,
              })}>
                <TableCell>{task.vibe_name}</TableCell>
                <TableCell>{task._vibe_projectid_value ? (projectById[task._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                <TableCell><StatusPill label={task.vibe_taskstatusname ?? '—'} color={statusColor(task.vibe_taskstatusname)} /></TableCell>
                <TableCell><StatusPill label={task.vibe_priorityname ?? '—'} color={statusColor(task.vibe_priorityname)} /></TableCell>
                <TableCell className={s.monoCell}>{task.vibe_duedate?.slice(0, 10) ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={s.formZone}>
        <Field label="Task name"><Input value={taskForm.name} onChange={(_, d) => setTaskForm((p) => ({ ...p, name: d.value }))} /></Field>
        <Field label="Project"><Select value={taskForm.projectId} onChange={(_, d) => setTaskForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
        <Field label="Due date"><Input type="date" value={taskForm.dueDate} onChange={(_, d) => setTaskForm((p) => ({ ...p, dueDate: d.value }))} /></Field>
        <Field label="Status"><Select value={taskForm.status} onChange={(_, d) => setTaskForm((p) => ({ ...p, status: d.value }))}>{entries(Vibe_tasksvibe_taskstatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        <Field label="Priority"><Select value={taskForm.priority} onChange={(_, d) => setTaskForm((p) => ({ ...p, priority: d.value }))}>{entries(Vibe_tasksvibe_priority).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
      </div>
      <div className={s.formActions}>
        <Button appearance="primary" onClick={upsertTask}>{taskForm.id ? 'Update' : 'Create'} Task</Button>
        <Button onClick={resetTaskForm}>Clear</Button>
        <Button disabled={!taskForm.id} onClick={deleteTask}>Delete</Button>
      </div>
    </div>
  )

  const renderTeam = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Team Members</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {filteredTeam.length} members
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Allocation</TableHeaderCell>
              <TableHeaderCell>Rate / hr</TableHeaderCell>
              <TableHeaderCell>Active</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeam.map((m) => (
              <TableRow key={m.vibe_projectteammemberid} className={s.rowClickable} onClick={() => setTeamForm({
                id: m.vibe_projectteammemberid,
                name: m.vibe_name ?? '',
                projectId: m._vibe_projectid_value ?? '',
                roleId: m._vibe_roleid_value ?? '',
                allocation: `${m.vibe_allocationpercentage ?? ''}`,
                hourlyRate: `${m.vibe_hourlyrate ?? ''}`,
                startDate: m.vibe_startdate?.slice(0, 10) ?? '',
                endDate: m.vibe_enddate?.slice(0, 10) ?? '',
                isActive: m.vibe_isactive ?? true,
              })}>
                <TableCell>{m.vibe_name}</TableCell>
                <TableCell>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                <TableCell>{m.vibe_roleidname ?? '—'}</TableCell>
                <TableCell className={s.monoCell}>{m.vibe_allocationpercentage != null ? `${m.vibe_allocationpercentage}%` : '—'}</TableCell>
                <TableCell className={s.monoCell}>{m.vibe_hourlyrate ?? '—'}</TableCell>
                <TableCell>
                  <StatusPill label={m.vibe_isactive ? 'Active' : 'Inactive'} color={m.vibe_isactive ? 'var(--c-green)' : 'var(--c-text-2)'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={s.formZone}>
        <Field label="Name"><Input value={teamForm.name} onChange={(_, d) => setTeamForm((p) => ({ ...p, name: d.value }))} /></Field>
        <Field label="Project"><Select value={teamForm.projectId} onChange={(_, d) => setTeamForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
        <Field label="Role"><Select value={teamForm.roleId} onChange={(_, d) => setTeamForm((p) => ({ ...p, roleId: d.value }))}>{roles.map((r) => <option key={r.vibe_projectroleid} value={r.vibe_projectroleid}>{r.vibe_name}</option>)}</Select></Field>
        <Field label="Allocation %"><Input value={teamForm.allocation} onChange={(_, d) => setTeamForm((p) => ({ ...p, allocation: d.value }))} /></Field>
        <Field label="Hourly rate"><Input value={teamForm.hourlyRate} onChange={(_, d) => setTeamForm((p) => ({ ...p, hourlyRate: d.value }))} /></Field>
        <Field label="Start date"><Input type="date" value={teamForm.startDate} onChange={(_, d) => setTeamForm((p) => ({ ...p, startDate: d.value }))} /></Field>
        <Field label="End date"><Input type="date" value={teamForm.endDate} onChange={(_, d) => setTeamForm((p) => ({ ...p, endDate: d.value }))} /></Field>
        <Field label="Active"><Switch checked={teamForm.isActive} onChange={(_, d) => setTeamForm((p) => ({ ...p, isActive: d.checked }))} /></Field>
      </div>
      <div className={s.formActions}>
        <Button appearance="primary" onClick={upsertTeam}>{teamForm.id ? 'Update' : 'Create'} Team Member</Button>
        <Button onClick={resetTeamForm}>Clear</Button>
        <Button disabled={!teamForm.id} onClick={deleteTeam}>Delete</Button>
      </div>
    </div>
  )

  const renderPlanning = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Resource Planning</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {allocations.filter((a) => !selectedProjectId || a._vibe_projectid_value === selectedProjectId).length} allocations
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Allocation</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Member</TableHeaderCell>
              <TableHeaderCell>Week Start</TableHeaderCell>
              <TableHeaderCell>Planned hrs</TableHeaderCell>
              <TableHeaderCell>Actual hrs</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.filter((a) => !selectedProjectId || a._vibe_projectid_value === selectedProjectId).map((a) => (
              <TableRow key={a.vibe_resourceallocationid}>
                <TableCell>{a.vibe_name}</TableCell>
                <TableCell>{a._vibe_projectid_value ? (projectById[a._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                <TableCell>{a.vibe_projectteammemberidname}</TableCell>
                <TableCell className={s.monoCell}>{a.vibe_weekstartdate?.slice(0, 10)}</TableCell>
                <TableCell>
                  <Badge color={(a.vibe_plannedhours ?? 0) > 40 ? 'danger' : (a.vibe_plannedhours ?? 0) === 40 ? 'informative' : 'success'}>
                    {a.vibe_plannedhours ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className={s.monoCell}>{a.vibe_actualhours ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const renderBudget = () => (
    <div className={s.colStack}>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Budget Lines</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
            {filteredBudget.length} lines
          </span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Estimated</TableHeaderCell>
                <TableHeaderCell>Actual</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBudget.map((line) => (
                <TableRow key={line.vibe_budgetlineid} className={s.rowClickable} onClick={() => setBudgetForm({
                  id: line.vibe_budgetlineid,
                  name: line.vibe_name ?? '',
                  projectId: line._vibe_projectid_value ?? '',
                  estimated: `${line.vibe_estimatedamount ?? ''}`,
                  actual: `${line.vibe_actualamount ?? ''}`,
                  category: `${line.vibe_category ?? 100000005}`,
                })}>
                  <TableCell>{line.vibe_name}</TableCell>
                  <TableCell>{line._vibe_projectid_value ? (projectById[line._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                  <TableCell>{line.vibe_categoryname}</TableCell>
                  <TableCell className={s.monoCell}>{line.vibe_estimatedamount?.toLocaleString() ?? '—'}</TableCell>
                  <TableCell className={s.monoCell}>{line.vibe_actualamount?.toLocaleString() ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={s.formZone}>
          <Field label="Name"><Input value={budgetForm.name} onChange={(_, d) => setBudgetForm((p) => ({ ...p, name: d.value }))} /></Field>
          <Field label="Project"><Select value={budgetForm.projectId} onChange={(_, d) => setBudgetForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
          <Field label="Category"><Select value={budgetForm.category} onChange={(_, d) => setBudgetForm((p) => ({ ...p, category: d.value }))}>{entries(Vibe_budgetlinesvibe_category).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Estimated"><Input value={budgetForm.estimated} onChange={(_, d) => setBudgetForm((p) => ({ ...p, estimated: d.value }))} /></Field>
          <Field label="Actual"><Input value={budgetForm.actual} onChange={(_, d) => setBudgetForm((p) => ({ ...p, actual: d.value }))} /></Field>
        </div>
        <div className={s.formActions}>
          <Button appearance="primary" onClick={upsertBudget}>{budgetForm.id ? 'Update' : 'Create'} Budget Line</Button>
          <Button onClick={resetBudgetForm}>Clear</Button>
          <Button disabled={!budgetForm.id} onClick={deleteBudget}>Delete</Button>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Invoices</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
            {invoices.filter((i) => !selectedProjectId || i._vibe_projectid_value === selectedProjectId).length} invoices
          </span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Invoice #</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Issued</TableHeaderCell>
                <TableHeaderCell>Due</TableHeaderCell>
                <TableHeaderCell>Paid</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.filter((i) => !selectedProjectId || i._vibe_projectid_value === selectedProjectId).map((i) => (
                <TableRow key={i.vibe_invoiceid}>
                  <TableCell className={s.monoCell}>{i.vibe_invoicenumber}</TableCell>
                  <TableCell>{i._vibe_projectid_value ? (projectById[i._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                  <TableCell className={s.monoCell}>{i.vibe_dateissued?.slice(0, 10) ?? '—'}</TableCell>
                  <TableCell className={s.monoCell}>{i.vibe_duedate?.slice(0, 10) ?? '—'}</TableCell>
                  <TableCell>
                    {i.vibe_datepaid
                      ? <StatusPill label={i.vibe_datepaid.slice(0, 10)} color="var(--c-green)" />
                      : <StatusPill label="Unpaid" color="var(--c-amber)" />}
                  </TableCell>
                  <TableCell className={s.monoCell}>{i.vibe_amount?.toLocaleString() ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )

  const renderRaid = () => (
    <div className={s.twoCol}>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Risks</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{filteredRisks.length}</span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.map((risk) => (
                <TableRow key={risk.vibe_riskid} className={s.rowClickable} onClick={() => setRiskForm({
                  id: risk.vibe_riskid,
                  title: risk.vibe_title ?? '',
                  projectId: risk._vibe_projectid_value ?? '',
                  probability: `${risk.vibe_probability ?? 100000002}`,
                  impact: `${risk.vibe_impact ?? 100000002}`,
                  status: `${risk.vibe_riskstatus ?? 100000000}`,
                })}>
                  <TableCell>{risk.vibe_title}</TableCell>
                  <TableCell><StatusPill label={risk.vibe_riskstatusname ?? '—'} color={statusColor(risk.vibe_riskstatusname)} /></TableCell>
                  <TableCell className={s.monoCell}>{risk.vibe_riskscore ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={s.formZone}>
          <Field label="Title"><Input value={riskForm.title} onChange={(_, d) => setRiskForm((p) => ({ ...p, title: d.value }))} /></Field>
          <Field label="Project"><Select value={riskForm.projectId} onChange={(_, d) => setRiskForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
          <Field label="Probability"><Select value={riskForm.probability} onChange={(_, d) => setRiskForm((p) => ({ ...p, probability: d.value }))}>{entries(Vibe_risksvibe_probability).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Impact"><Select value={riskForm.impact} onChange={(_, d) => setRiskForm((p) => ({ ...p, impact: d.value }))}>{entries(Vibe_risksvibe_impact).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Status"><Select value={riskForm.status} onChange={(_, d) => setRiskForm((p) => ({ ...p, status: d.value }))}>{entries(Vibe_risksvibe_riskstatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        </div>
        <div className={s.formActions}>
          <Button appearance="primary" onClick={upsertRisk}>{riskForm.id ? 'Update' : 'Create'} Risk</Button>
          <Button onClick={resetRiskForm}>Clear</Button>
          <Button disabled={!riskForm.id} onClick={deleteRisk}>Delete</Button>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Issues</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{filteredIssues.length}</span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Severity</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <TableRow key={issue.vibe_issueid} className={s.rowClickable} onClick={() => setIssueForm({
                  id: issue.vibe_issueid,
                  title: issue.vibe_title ?? '',
                  projectId: issue._vibe_projectid_value ?? '',
                  severity: `${issue.vibe_severity ?? 100000001}`,
                  status: `${issue.vibe_issuestatus ?? 100000000}`,
                })}>
                  <TableCell>{issue.vibe_title}</TableCell>
                  <TableCell><StatusPill label={issue.vibe_severityname ?? '—'} color={statusColor(issue.vibe_severityname)} /></TableCell>
                  <TableCell><StatusPill label={issue.vibe_issuestatusname ?? '—'} color={statusColor(issue.vibe_issuestatusname)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={s.formZone}>
          <Field label="Title"><Input value={issueForm.title} onChange={(_, d) => setIssueForm((p) => ({ ...p, title: d.value }))} /></Field>
          <Field label="Project"><Select value={issueForm.projectId} onChange={(_, d) => setIssueForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
          <Field label="Severity"><Select value={issueForm.severity} onChange={(_, d) => setIssueForm((p) => ({ ...p, severity: d.value }))}>{entries(Vibe_issuesvibe_severity).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
          <Field label="Status"><Select value={issueForm.status} onChange={(_, d) => setIssueForm((p) => ({ ...p, status: d.value }))}>{entries(Vibe_issuesvibe_issuestatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        </div>
        <div className={s.formActions}>
          <Button appearance="primary" onClick={upsertIssue}>{issueForm.id ? 'Update' : 'Create'} Issue</Button>
          <Button onClick={resetIssueForm}>Clear</Button>
          <Button disabled={!issueForm.id} onClick={deleteIssue}>Delete</Button>
        </div>
      </div>
    </div>
  )

  const renderDeliverables = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Deliverables</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {filteredDeliverables.length} items
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Responsible</TableHeaderCell>
              <TableHeaderCell>Due</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDeliverables.map((d) => (
              <TableRow key={d.vibe_deliverableid} className={s.rowClickable} onClick={() => setDeliverableForm({
                id: d.vibe_deliverableid,
                name: d.vibe_name ?? '',
                projectId: d._vibe_projectid_value ?? '',
                dueDate: d.vibe_duedate?.slice(0, 10) ?? '',
                status: `${d.vibe_deliverablestatus ?? 100000000}`,
                documentLink: d.vibe_documentlink ?? '',
                responsibleId: d._vibe_responsibleid_value ?? '',
              })}>
                <TableCell>{d.vibe_name}</TableCell>
                <TableCell>{d._vibe_projectid_value ? (projectById[d._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                <TableCell>{d.vibe_responsibleidname ?? '—'}</TableCell>
                <TableCell className={s.monoCell}>{d.vibe_duedate?.slice(0, 10) ?? '—'}</TableCell>
                <TableCell><StatusPill label={d.vibe_deliverablestatusname ?? '—'} color={statusColor(d.vibe_deliverablestatusname)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={s.formZone}>
        <Field label="Name"><Input value={deliverableForm.name} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, name: d.value }))} /></Field>
        <Field label="Project"><Select value={deliverableForm.projectId} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
        <Field label="Responsible"><Select value={deliverableForm.responsibleId} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, responsibleId: d.value }))}><option value="">None</option>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</Select></Field>
        <Field label="Due date"><Input type="date" value={deliverableForm.dueDate} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, dueDate: d.value }))} /></Field>
        <Field label="Status"><Select value={deliverableForm.status} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, status: d.value }))}>{entries(Vibe_deliverablesvibe_deliverablestatus).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</Select></Field>
        <Field label="Document link"><Input value={deliverableForm.documentLink} onChange={(_, d) => setDeliverableForm((p) => ({ ...p, documentLink: d.value }))} /></Field>
      </div>
      <div className={s.formActions}>
        <Button appearance="primary" onClick={upsertDeliverable}>{deliverableForm.id ? 'Update' : 'Create'} Deliverable</Button>
        <Button onClick={resetDeliverableForm}>Clear</Button>
        <Button disabled={!deliverableForm.id} onClick={deleteDeliverable}>Delete</Button>
      </div>
    </div>
  )

  const renderTime = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Time Entries</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          {filteredTime.reduce((s, t) => s + (t.vibe_hours ?? 0), 0).toFixed(1)} hrs logged
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Task</TableHeaderCell>
              <TableHeaderCell>Member</TableHeaderCell>
              <TableHeaderCell>Date</TableHeaderCell>
              <TableHeaderCell>Hours</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTime.map((t) => (
              <TableRow key={t.vibe_timeentryid} className={s.rowClickable} onClick={() => setTimeForm({
                id: t.vibe_timeentryid,
                name: t.vibe_name ?? '',
                projectId: t._vibe_projectid_value ?? '',
                taskId: t._vibe_taskid_value ?? '',
                teamMemberId: t._vibe_teammemberid_value ?? '',
                date: t.vibe_date?.slice(0, 10) ?? '',
                hours: `${t.vibe_hours ?? ''}`,
              })}>
                <TableCell>{t.vibe_name}</TableCell>
                <TableCell>{t._vibe_projectid_value ? (projectById[t._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                <TableCell>{t.vibe_taskidname ?? '—'}</TableCell>
                <TableCell>{t.vibe_teammemberidname ?? '—'}</TableCell>
                <TableCell className={s.monoCell}>{t.vibe_date?.slice(0, 10) ?? '—'}</TableCell>
                <TableCell className={s.monoCell}>{t.vibe_hours ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className={s.formZone}>
        <Field label="Entry name"><Input value={timeForm.name} onChange={(_, d) => setTimeForm((p) => ({ ...p, name: d.value }))} /></Field>
        <Field label="Project"><Select value={timeForm.projectId} onChange={(_, d) => setTimeForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
        <Field label="Task"><Select value={timeForm.taskId} onChange={(_, d) => setTimeForm((p) => ({ ...p, taskId: d.value }))}>{tasks.map((t) => <option key={t.vibe_taskid} value={t.vibe_taskid}>{t.vibe_name}</option>)}</Select></Field>
        <Field label="Team member"><Select value={timeForm.teamMemberId} onChange={(_, d) => setTimeForm((p) => ({ ...p, teamMemberId: d.value }))}>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</Select></Field>
        <Field label="Date"><Input type="date" value={timeForm.date} onChange={(_, d) => setTimeForm((p) => ({ ...p, date: d.value }))} /></Field>
        <Field label="Hours"><Input value={timeForm.hours} onChange={(_, d) => setTimeForm((p) => ({ ...p, hours: d.value }))} /></Field>
      </div>
      <div className={s.formActions}>
        <Button appearance="primary" onClick={upsertTime}>{timeForm.id ? 'Update' : 'Create'} Time Entry</Button>
        <Button onClick={resetTimeForm}>Clear</Button>
        <Button disabled={!timeForm.id} onClick={deleteTime}>Delete</Button>
      </div>
    </div>
  )

  const renderCommunication = () => (
    <div className={s.colStack}>
      <div className={s.twoCol}>
        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Decision Log</span>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{filteredDecisions.length}</span>
          </div>
          <div className={s.tableWrap}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Made By</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDecisions.map((d) => (
                  <TableRow key={d.vibe_decisionlogid} className={s.rowClickable} onClick={() => setDecisionForm({
                    id: d.vibe_decisionlogid,
                    title: d.vibe_title ?? '',
                    projectId: d._vibe_projectid_value ?? '',
                    madeById: d._vibe_madebyid_value ?? '',
                    date: d.vibe_date?.slice(0, 10) ?? '',
                  })}>
                    <TableCell>{d.vibe_title}</TableCell>
                    <TableCell>{d.vibe_madebyidname ?? '—'}</TableCell>
                    <TableCell className={s.monoCell}>{d.vibe_date?.slice(0, 10) ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={s.formZone}>
            <Field label="Title"><Input value={decisionForm.title} onChange={(_, d) => setDecisionForm((p) => ({ ...p, title: d.value }))} /></Field>
            <Field label="Project"><Select value={decisionForm.projectId} onChange={(_, d) => setDecisionForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
            <Field label="Made by"><Select value={decisionForm.madeById} onChange={(_, d) => setDecisionForm((p) => ({ ...p, madeById: d.value }))}><option value="">None</option>{teamMembers.map((m) => <option key={m.vibe_projectteammemberid} value={m.vibe_projectteammemberid}>{m.vibe_name}</option>)}</Select></Field>
            <Field label="Date"><Input type="date" value={decisionForm.date} onChange={(_, d) => setDecisionForm((p) => ({ ...p, date: d.value }))} /></Field>
          </div>
          <div className={s.formActions}>
            <Button appearance="primary" onClick={upsertDecision}>{decisionForm.id ? 'Update' : 'Create'} Decision</Button>
            <Button onClick={resetDecisionForm}>Clear</Button>
            <Button disabled={!decisionForm.id} onClick={deleteDecision}>Delete</Button>
          </div>
        </div>

        <div className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelTitle}>Meeting Notes</span>
            <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{filteredMeetings.length}</span>
          </div>
          <div className={s.tableWrap}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Title</TableHeaderCell>
                  <TableHeaderCell>Project</TableHeaderCell>
                  <TableHeaderCell>Date</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.map((m) => (
                  <TableRow key={m.vibe_meetingnoteid} className={s.rowClickable} onClick={() => setMeetingForm({
                    id: m.vibe_meetingnoteid,
                    title: m.vibe_title ?? '',
                    projectId: m._vibe_projectid_value ?? '',
                    date: m.vibe_date?.slice(0, 10) ?? '',
                  })}>
                    <TableCell>{m.vibe_title}</TableCell>
                    <TableCell>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                    <TableCell className={s.monoCell}>{m.vibe_date?.slice(0, 10) ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className={s.formZone}>
            <Field label="Title"><Input value={meetingForm.title} onChange={(_, d) => setMeetingForm((p) => ({ ...p, title: d.value }))} /></Field>
            <Field label="Project"><Select value={meetingForm.projectId} onChange={(_, d) => setMeetingForm((p) => ({ ...p, projectId: d.value }))}>{projects.map((p) => <option key={p.vibe_projectid} value={p.vibe_projectid}>{p.vibe_name}</option>)}</Select></Field>
            <Field label="Date"><Input type="date" value={meetingForm.date} onChange={(_, d) => setMeetingForm((p) => ({ ...p, date: d.value }))} /></Field>
          </div>
          <div className={s.formActions}>
            <Button appearance="primary" onClick={upsertMeeting}>{meetingForm.id ? 'Update' : 'Create'} Meeting Note</Button>
            <Button onClick={resetMeetingForm}>Clear</Button>
            <Button disabled={!meetingForm.id} onClick={deleteMeeting}>Delete</Button>
          </div>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Activity Feed</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
            {feed.filter((f) => !selectedProjectId || f._vibe_projectid_value === selectedProjectId).length} events
          </span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Timestamp</TableHeaderCell>
                <TableHeaderCell>Project</TableHeaderCell>
                <TableHeaderCell>Event</TableHeaderCell>
                <TableHeaderCell>Actor</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feed.filter((f) => !selectedProjectId || f._vibe_projectid_value === selectedProjectId).map((f) => (
                <TableRow key={f.vibe_activityfeedentryid}>
                  <TableCell className={s.monoCell}>{f.vibe_timestamp?.slice(0, 19).replace('T', ' ')}</TableCell>
                  <TableCell>{f._vibe_projectid_value ? (projectById[f._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                  <TableCell>{f.vibe_eventtypename}</TableCell>
                  <TableCell>{f.vibe_actoridname}</TableCell>
                  <TableCell>{f.vibe_description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )

  const renderDocuments = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Documents</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>SharePoint folders</span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>SharePoint Folder</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.filter((p) => !selectedProjectId || p.vibe_projectid === selectedProjectId).map((p) => (
              <TableRow key={p.vibe_projectid}>
                <TableCell>{p.vibe_name}</TableCell>
                <TableCell>
                  {p.vibe_sharepointfolderurl
                    ? <a href={p.vibe_sharepointfolderurl} target="_blank" rel="noreferrer">{p.vibe_sharepointfolderurl}</a>
                    : <span style={{ color: 'var(--c-text-3)' }}>—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const renderStakeholders = () => (
    <div className={s.panel}>
      <div className={s.panelHead}>
        <span className={s.panelTitle}>Stakeholders</span>
        <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>
          Stakeholder roles only
        </span>
      </div>
      <div className={s.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Project</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Contact / User</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers
              .filter((m) => m._vibe_roleid_value && roles.some((r) => r.vibe_projectroleid === m._vibe_roleid_value && r.vibe_isstakeholderrole))
              .filter((m) => !selectedProjectId || m._vibe_projectid_value === selectedProjectId)
              .map((m) => (
                <TableRow key={m.vibe_projectteammemberid}>
                  <TableCell>{m.vibe_name}</TableCell>
                  <TableCell>{m._vibe_projectid_value ? (projectById[m._vibe_projectid_value] ?? '—') : '—'}</TableCell>
                  <TableCell>{m.vibe_roleidname}</TableCell>
                  <TableCell>{m.vibe_contactidname ?? m.vibe_useridname ?? '—'}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className={s.twoCol}>
      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Project Roles</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{roles.length}</span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Default Rate</TableHeaderCell>
                <TableHeaderCell>Stakeholder</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((r) => (
                <TableRow key={r.vibe_projectroleid} className={s.rowClickable} onClick={() => setRoleForm({
                  id: r.vibe_projectroleid,
                  name: r.vibe_name ?? '',
                  defaultRate: `${r.vibe_defaulthourlyrate ?? ''}`,
                  isStakeholder: r.vibe_isstakeholderrole ?? false,
                })}>
                  <TableCell>{r.vibe_name}</TableCell>
                  <TableCell className={s.monoCell}>{r.vibe_defaulthourlyrate ?? '—'}</TableCell>
                  <TableCell>
                    {r.vibe_isstakeholderrole
                      ? <StatusPill label="Yes" color="var(--c-accent)" />
                      : <span style={{ color: 'var(--c-text-3)', fontSize: '12px' }}>No</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={s.formZone}>
          <Field label="Name"><Input value={roleForm.name} onChange={(_, d) => setRoleForm((p) => ({ ...p, name: d.value }))} /></Field>
          <Field label="Default hourly rate"><Input value={roleForm.defaultRate} onChange={(_, d) => setRoleForm((p) => ({ ...p, defaultRate: d.value }))} /></Field>
          <Field label="Stakeholder role"><Switch checked={roleForm.isStakeholder} onChange={(_, d) => setRoleForm((p) => ({ ...p, isStakeholder: d.checked }))} /></Field>
        </div>
        <div className={s.formActions}>
          <Button appearance="primary" onClick={upsertRole}>{roleForm.id ? 'Update' : 'Create'} Role</Button>
          <Button onClick={resetRoleForm}>Clear</Button>
          <Button disabled={!roleForm.id} onClick={deleteRole}>Delete</Button>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.panelHead}>
          <span className={s.panelTitle}>Project Templates</span>
          <span style={{ fontSize: '12px', color: 'var(--c-text-2)', fontFamily: 'var(--font-mono)' }}>{templates.length}</span>
        </div>
        <div className={s.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Active</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.vibe_projecttemplateid} className={s.rowClickable} onClick={() => setTemplateForm({
                  id: t.vibe_projecttemplateid,
                  name: t.vibe_name ?? '',
                  isActive: t.vibe_isactive ?? true,
                })}>
                  <TableCell>{t.vibe_name}</TableCell>
                  <TableCell>
                    {t.vibe_isactive
                      ? <StatusPill label="Active" color="var(--c-green)" />
                      : <StatusPill label="Inactive" color="var(--c-text-2)" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className={s.formZone}>
          <Field label="Name"><Input value={templateForm.name} onChange={(_, d) => setTemplateForm((p) => ({ ...p, name: d.value }))} /></Field>
          <Field label="Active"><Switch checked={templateForm.isActive} onChange={(_, d) => setTemplateForm((p) => ({ ...p, isActive: d.checked }))} /></Field>
        </div>
        <div className={s.formActions}>
          <Button appearance="primary" onClick={upsertTemplate}>{templateForm.id ? 'Update' : 'Create'} Template</Button>
          <Button onClick={resetTemplateForm}>Clear</Button>
          <Button disabled={!templateForm.id} onClick={deleteTemplate}>Delete</Button>
        </div>
      </div>
    </div>
  )

  return (
    <FluentProvider theme={theme}>
      <div className={mergeClasses(s.root, !darkMode ? 'light-mode' : undefined)}>
        <div className={s.layout}>
          <aside className={s.sidebar}>
            <div className={s.sidebarLogo}>
              <span className={s.logoText}>Project Planner</span>
              <span className={s.logoSub}>◆ Dataverse · Live</span>
            </div>

            <div className={s.sidebarBody}>
              <div className={s.sidebarSection}>
                <span className={s.sidebarSectionLabel}>Context</span>
                <button
                  className={mergeClasses(s.projBtn, !selectedProjectId ? s.projBtnActive : undefined)}
                  onClick={() => setSelectedProjectId('')}
                >
                  All projects
                </button>
                {projects.map((project) => (
                  <button
                    key={project.vibe_projectid}
                    className={mergeClasses(s.projBtn, selectedProjectId === project.vibe_projectid ? s.projBtnActive : undefined)}
                    onClick={() => setSelectedProjectId(project.vibe_projectid)}
                  >
                    {project.vibe_name}
                  </button>
                ))}
              </div>

              {NAV_GROUPS.map((group) => (
                <div key={group.label} className={s.sidebarSection}>
                  <span className={s.sidebarSectionLabel}>{group.label}</span>
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      className={mergeClasses(s.navBtn, activeTab === item.value ? s.navBtnActive : undefined)}
                      onClick={() => setActiveTab(item.value)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className={s.sidebarFooter}>
              <Switch checked={darkMode} onChange={(_, d) => setDarkMode(d.checked)} label="Dark mode" />
              <Button
                appearance="primary"
                onClick={loadData}
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Loading…' : 'Refresh Data'}
              </Button>
            </div>
          </aside>

          <main className={s.content}>
            <div className={s.pageHeader}>
              <div>
                <div className={s.pageTitle}>{TAB_LABELS[activeTab]}</div>
                <div className={s.pageCtx}>
                  {currentProjectName}{loading ? ' · Loading…' : ''}
                </div>
              </div>
            </div>

            {notice && (
              <div className={mergeClasses(s.notice, notice.type === 'success' ? s.noticeSuccess : s.noticeError)}>
                {notice.message}
              </div>
            )}

            {activeTab === 'home' && renderHome()}
            {activeTab === 'portfolio' && renderPortfolio()}
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'tasks' && renderTasks()}
            {activeTab === 'team' && renderTeam()}
            {activeTab === 'planning' && renderPlanning()}
            {activeTab === 'budget' && renderBudget()}
            {activeTab === 'raid' && renderRaid()}
            {activeTab === 'deliverables' && renderDeliverables()}
            {activeTab === 'time' && renderTime()}
            {activeTab === 'communication' && renderCommunication()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'stakeholders' && renderStakeholders()}
            {activeTab === 'settings' && renderSettings()}
          </main>
        </div>
      </div>
    </FluentProvider>
  )
}

export default App
