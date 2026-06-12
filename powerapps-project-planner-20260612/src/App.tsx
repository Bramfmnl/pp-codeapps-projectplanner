import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Vibe_projects, Vibe_projectsBase } from './generated/models/Vibe_projectsModel'
import type { Vibe_tasks, Vibe_tasksBase } from './generated/models/Vibe_tasksModel'
import type { Vibe_projectteammembers, Vibe_projectteammembersBase } from './generated/models/Vibe_projectteammembersModel'
import type { Vibe_budgetlines, Vibe_budgetlinesBase } from './generated/models/Vibe_budgetlinesModel'
import type { Vibe_risks, Vibe_risksBase } from './generated/models/Vibe_risksModel'
import type { Vibe_issues, Vibe_issuesBase } from './generated/models/Vibe_issuesModel'
import type { Vibe_deliverables, Vibe_deliverablesBase } from './generated/models/Vibe_deliverablesModel'
import type { Vibe_timeentries, Vibe_timeentriesBase } from './generated/models/Vibe_timeentriesModel'
import type { Vibe_decisionlogs, Vibe_decisionlogsBase } from './generated/models/Vibe_decisionlogsModel'
import type { Vibe_meetingnotes, Vibe_meetingnotesBase } from './generated/models/Vibe_meetingnotesModel'
import type { Vibe_projectroles, Vibe_projectrolesBase } from './generated/models/Vibe_projectrolesModel'
import type { Vibe_projecttemplates, Vibe_projecttemplatesBase } from './generated/models/Vibe_projecttemplatesModel'
import type { Vibe_resourceallocations } from './generated/models/Vibe_resourceallocationsModel'
import type { Vibe_activityfeedentries } from './generated/models/Vibe_activityfeedentriesModel'
import type { Vibe_invoices } from './generated/models/Vibe_invoicesModel'
import type { Vibe_projectphases } from './generated/models/Vibe_projectphasesModel'
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
import { Vibe_projectphasesService } from './generated/services/Vibe_projectphasesService'
import { Sidebar } from './components/layout/Sidebar'
import { TaskSpreadsheetView } from './components/views/TaskSpreadsheetView'
import { ProjectsView } from './components/views/ProjectsView'
import { PortfolioView } from './components/views/PortfolioView'
import { OverviewView } from './components/views/OverviewView'
import { TeamView } from './components/views/TeamView'
import { PlanningView } from './components/views/PlanningView'
import { BudgetView } from './components/views/BudgetView'
import { RaidView } from './components/views/RaidView'
import { DeliverablesView } from './components/views/DeliverablesView'
import { TimeView } from './components/views/TimeView'
import { CommunicationsView } from './components/views/CommunicationsView'
import { DocumentsView } from './components/views/DocumentsView'
import { StakeholdersView } from './components/views/StakeholdersView'
import { SettingsView } from './components/views/SettingsView'

type AppTab =
  | 'home' | 'portfolio' | 'overview' | 'tasks' | 'team'
  | 'planning' | 'budget' | 'raid' | 'deliverables' | 'time'
  | 'communication' | 'documents' | 'stakeholders' | 'settings'

const TAB_LABELS: Record<AppTab, string> = {
  home: 'Projects', portfolio: 'Portfolio', overview: 'Overview',
  tasks: 'Tasks', team: 'Team', planning: 'Planning', budget: 'Budget',
  raid: 'RAID Log', deliverables: 'Deliverables', time: 'Time Entry',
  communication: 'Comms & Feed', documents: 'Documents',
  stakeholders: 'Stakeholders', settings: 'Settings',
}

type Notice = { type: 'success' | 'error'; message: string } | null

const bind = (entitySet: string, id: string) => `/${entitySet}(${id})`
const asCreatePayload = <T,>(payload: Partial<T>): T => payload as T

function parseNumber(value: string): number | undefined {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function App() {
  const [darkMode, setDarkMode] = useState(false)
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
  const [phases, setPhases] = useState<Vibe_projectphases[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const [projectForm, setProjectForm] = useState({ id: '', name: '', startDate: '', endDate: '', totalBudget: '', templateId: '' })
  const [taskForm, setTaskForm] = useState({ id: '', name: '', projectId: '', dueDate: '', assigneeId: '', priority: '100000001', status: '100000000' })
  const [teamForm, setTeamForm] = useState({ id: '', name: '', projectId: '', roleId: '', allocation: '100', hourlyRate: '', startDate: '', endDate: '', isActive: true })
  const [budgetForm, setBudgetForm] = useState({ id: '', name: '', projectId: '', estimated: '', actual: '', category: '100000005' })
  const [riskForm, setRiskForm] = useState({ id: '', title: '', projectId: '', probability: '100000002', impact: '100000002', status: '100000000' })
  const [issueForm, setIssueForm] = useState({ id: '', title: '', projectId: '', severity: '100000001', status: '100000000' })
  const [deliverableForm, setDeliverableForm] = useState({ id: '', name: '', projectId: '', dueDate: '', status: '100000000', documentLink: '', responsibleId: '' })
  const [timeForm, setTimeForm] = useState({ id: '', name: '', projectId: '', taskId: '', teamMemberId: '', date: '', hours: '' })
  const [decisionForm, setDecisionForm] = useState({ id: '', title: '', projectId: '', madeById: '', date: '' })
  const [meetingForm, setMeetingForm] = useState({ id: '', title: '', projectId: '', date: '' })
  const [roleForm, setRoleForm] = useState({ id: '', name: '', defaultRate: '', isStakeholder: false })
  const [templateForm, setTemplateForm] = useState({ id: '', name: '', isActive: true })

  const projectById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of projects) map[p.vibe_projectid] = p.vibe_name ?? '(Unnamed Project)'
    return map
  }, [projects])

  const currentProjectName = selectedProjectId ? (projectById[selectedProjectId] ?? selectedProjectId) : 'All projects'

  const filteredTasks = useMemo(() => tasks.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [tasks, selectedProjectId])
  const filteredTeam = useMemo(() => teamMembers.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [teamMembers, selectedProjectId])
  const filteredBudget = useMemo(() => budgetLines.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [budgetLines, selectedProjectId])
  const filteredRisks = useMemo(() => risks.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [risks, selectedProjectId])
  const filteredIssues = useMemo(() => issues.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [issues, selectedProjectId])
  const filteredDeliverables = useMemo(() => deliverables.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [deliverables, selectedProjectId])
  const filteredTime = useMemo(() => timeEntries.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [timeEntries, selectedProjectId])
  const filteredDecisions = useMemo(() => decisions.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [decisions, selectedProjectId])
  const filteredMeetings = useMemo(() => meetingNotes.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [meetingNotes, selectedProjectId])
  const filteredFeed = useMemo(() => feed.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [feed, selectedProjectId])
  const filteredAllocations = useMemo(() => allocations.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [allocations, selectedProjectId])
  const filteredInvoices = useMemo(() => invoices.filter((x) => !selectedProjectId || x._vibe_projectid_value === selectedProjectId), [invoices, selectedProjectId])
  const filteredProjects = useMemo(() => projects.filter((p) => !selectedProjectId || p.vibe_projectid === selectedProjectId), [projects, selectedProjectId])

  const activeProjects = projects.filter((p) => p.statecode === 0).length
  const openRisks = risks.filter((r) => r.vibe_riskstatus !== 100000002 && r.vibe_riskstatus !== 100000003).length
  const overdueTasks = tasks.filter((t) => { if (!t.vibe_duedate) return false; if (t.vibe_taskstatus === 100000003) return false; return new Date(t.vibe_duedate).getTime() < Date.now() }).length
  const budgetTotal = projects.reduce((sum, p) => sum + (p.vibe_totalbudget ?? 0), 0)
  const budgetSpent = projects.reduce((sum, p) => sum + (p.vibe_budgetspent ?? 0), 0)
  const budgetBurnPct = budgetTotal ? Math.round((budgetSpent / budgetTotal) * 100) : 0

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
        projectResult, taskResult, teamResult, budgetResult, riskResult, issueResult,
        deliverableResult, timeResult, decisionResult, meetingResult, roleResult,
        templateResult, allocationResult, feedResult, invoiceResult, phaseResult,
      ] = await Promise.all([
        Vibe_projectsService.getAll({ select: ['vibe_projectid', 'vibe_name', 'vibe_startdate', 'vibe_enddate', 'vibe_totalbudget', 'vibe_budgetspent', 'vibe_budgetremaining', 'vibe_sharepointfolderurl', '_vibe_templatesourceid_value', 'statecode'], orderBy: ['vibe_name asc'], top: 1000 }),
        Vibe_tasksService.getAll({ select: ['vibe_taskid', 'vibe_name', 'vibe_description', '_vibe_projectid_value', '_vibe_phaseid_value', 'vibe_phaseidname', '_vibe_assignedtoid_value', 'vibe_assignedtoidname', 'vibe_taskstatus', 'vibe_priority', 'vibe_duedate', 'vibe_startdate', 'vibe_actualhours', 'vibe_estimatedhours'], orderBy: ['vibe_name asc'], top: 1000 }),
        Vibe_projectteammembersService.getAll({ select: ['vibe_projectteammemberid', 'vibe_name', '_vibe_projectid_value', '_vibe_roleid_value', 'vibe_roleidname', 'vibe_allocationpercentage', 'vibe_hourlyrate', 'vibe_startdate', 'vibe_enddate', 'vibe_isactive', 'vibe_contactidname', 'vibe_useridname'], top: 1000 }),
        Vibe_budgetlinesService.getAll({ select: ['vibe_budgetlineid', 'vibe_name', '_vibe_projectid_value', 'vibe_estimatedamount', 'vibe_actualamount', 'vibe_category'], top: 1000 }),
        Vibe_risksService.getAll({ select: ['vibe_riskid', 'vibe_title', '_vibe_projectid_value', 'vibe_probability', 'vibe_impact', 'vibe_riskscore', 'vibe_riskstatus'], top: 1000 }),
        Vibe_issuesService.getAll({ select: ['vibe_issueid', 'vibe_title', '_vibe_projectid_value', 'vibe_issuestatus', 'vibe_severity'], top: 1000 }),
        Vibe_deliverablesService.getAll({ select: ['vibe_deliverableid', 'vibe_name', '_vibe_projectid_value', '_vibe_responsibleid_value', 'vibe_responsibleidname', 'vibe_duedate', 'vibe_deliverablestatus', 'vibe_documentlink'], top: 1000 }),
        Vibe_timeentriesService.getAll({ select: ['vibe_timeentryid', 'vibe_name', '_vibe_projectid_value', '_vibe_taskid_value', '_vibe_teammemberid_value', 'vibe_taskidname', 'vibe_teammemberidname', 'vibe_date', 'vibe_hours'], orderBy: ['vibe_date desc'], top: 1000 }),
        Vibe_decisionlogsService.getAll({ select: ['vibe_decisionlogid', 'vibe_title', '_vibe_projectid_value', '_vibe_madebyid_value', 'vibe_madebyidname', 'vibe_date'], orderBy: ['vibe_date desc'], top: 1000 }),
        Vibe_meetingnotesService.getAll({ select: ['vibe_meetingnoteid', 'vibe_title', '_vibe_projectid_value', 'vibe_date'], orderBy: ['vibe_date desc'], top: 1000 }),
        Vibe_projectrolesService.getAll({ select: ['vibe_projectroleid', 'vibe_name', 'vibe_defaulthourlyrate', 'vibe_isstakeholderrole'], orderBy: ['vibe_name asc'], top: 1000 }),
        Vibe_projecttemplatesService.getAll({ select: ['vibe_projecttemplateid', 'vibe_name', 'vibe_isactive'], orderBy: ['vibe_name asc'], top: 1000 }),
        Vibe_resourceallocationsService.getAll({ select: ['vibe_resourceallocationid', 'vibe_name', '_vibe_projectid_value', 'vibe_projectteammemberidname', 'vibe_weekstartdate', 'vibe_plannedhours', 'vibe_actualhours'], top: 1000 }),
        Vibe_activityfeedentriesService.getAll({ select: ['vibe_activityfeedentryid', 'vibe_timestamp', '_vibe_projectid_value', 'vibe_eventtype', 'vibe_description', 'vibe_actoridname'], orderBy: ['vibe_timestamp desc'], top: 200 }),
        Vibe_invoicesService.getAll({ select: ['vibe_invoiceid', 'vibe_invoicenumber', '_vibe_projectid_value', 'vibe_amount', 'vibe_dateissued', 'vibe_duedate', 'vibe_datepaid'], top: 1000 }),
        Vibe_projectphasesService.getAll({ select: ['vibe_projectphaseid', 'vibe_name', '_vibe_projectid_value', 'vibe_order'], orderBy: ['vibe_order asc'], top: 500 }),
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
      setPhases(phaseResult.data ?? [])

      if (!selectedProjectId && (projectResult.data?.length ?? 0) > 0) {
        setSelectedProjectId(projectResult.data?.[0].vibe_projectid ?? '')
      }
    } finally {
      setLoading(false)
    }
  }

  function resetProjectForm() { setProjectForm({ id: '', name: '', startDate: '', endDate: '', totalBudget: '', templateId: '' }) }
  function resetTaskForm() { setTaskForm({ id: '', name: '', projectId: selectedProjectId, dueDate: '', assigneeId: '', priority: '100000001', status: '100000000' }) }
  function resetTeamForm() { setTeamForm({ id: '', name: '', projectId: selectedProjectId, roleId: '', allocation: '100', hourlyRate: '', startDate: '', endDate: '', isActive: true }) }
  function resetBudgetForm() { setBudgetForm({ id: '', name: '', projectId: selectedProjectId, estimated: '', actual: '', category: '100000005' }) }
  function resetRiskForm() { setRiskForm({ id: '', title: '', projectId: selectedProjectId, probability: '100000002', impact: '100000002', status: '100000000' }) }
  function resetIssueForm() { setIssueForm({ id: '', title: '', projectId: selectedProjectId, severity: '100000001', status: '100000000' }) }
  function resetDeliverableForm() { setDeliverableForm({ id: '', name: '', projectId: selectedProjectId, dueDate: '', status: '100000000', documentLink: '', responsibleId: '' }) }
  function resetTimeForm() { setTimeForm({ id: '', name: '', projectId: selectedProjectId, taskId: '', teamMemberId: '', date: '', hours: '' }) }
  function resetDecisionForm() { setDecisionForm({ id: '', title: '', projectId: selectedProjectId, madeById: '', date: '' }) }
  function resetMeetingForm() { setMeetingForm({ id: '', title: '', projectId: selectedProjectId, date: '' }) }
  function resetRoleForm() { setRoleForm({ id: '', name: '', defaultRate: '', isStakeholder: false }) }
  function resetTemplateForm() { setTemplateForm({ id: '', name: '', isActive: true }) }

  async function upsertProject() {
    const payload: Partial<Vibe_projectsBase> = { vibe_name: projectForm.name, vibe_startdate: projectForm.startDate || undefined, vibe_enddate: projectForm.endDate || undefined, vibe_totalbudget: parseNumber(projectForm.totalBudget), 'vibe_templatesourceid@odata.bind': projectForm.templateId ? bind('vibe_projecttemplates', projectForm.templateId) : undefined }
    if (projectForm.id) await execute(async () => { await Vibe_projectsService.update(projectForm.id, payload) }, 'Project updated.')
    else await execute(async () => { await Vibe_projectsService.create(asCreatePayload<Omit<Vibe_projectsBase, 'vibe_projectid'>>(payload)) }, 'Project created.')
    resetProjectForm()
  }

  async function deleteProject() {
    if (!projectForm.id) return
    await execute(async () => { await Vibe_projectsService.delete(projectForm.id) }, 'Project deleted.')
    resetProjectForm()
  }

  async function upsertTask() {
    const payload: Partial<Vibe_tasksBase> = { vibe_name: taskForm.name, vibe_duedate: taskForm.dueDate || undefined, vibe_priority: Number(taskForm.priority) as Vibe_tasksBase['vibe_priority'], vibe_taskstatus: Number(taskForm.status) as Vibe_tasksBase['vibe_taskstatus'], 'vibe_projectid@odata.bind': taskForm.projectId ? bind('vibe_projects', taskForm.projectId) : undefined, 'vibe_assignedtoid@odata.bind': taskForm.assigneeId ? bind('vibe_projectteammembers', taskForm.assigneeId) : undefined }
    if (taskForm.id) await execute(async () => { await Vibe_tasksService.update(taskForm.id, payload) }, 'Task updated.')
    else await execute(async () => { await Vibe_tasksService.create(asCreatePayload<Omit<Vibe_tasksBase, 'vibe_taskid'>>(payload)) }, 'Task created.')
    resetTaskForm()
  }

  async function deleteTask() {
    if (!taskForm.id) return
    await execute(async () => { await Vibe_tasksService.delete(taskForm.id) }, 'Task deleted.')
    resetTaskForm()
  }

  async function upsertTeam() {
    const payload: Partial<Vibe_projectteammembersBase> = { vibe_name: teamForm.name, vibe_allocationpercentage: parseNumber(teamForm.allocation), vibe_hourlyrate: parseNumber(teamForm.hourlyRate), vibe_startdate: teamForm.startDate || undefined, vibe_enddate: teamForm.endDate || undefined, vibe_isactive: teamForm.isActive, 'vibe_projectid@odata.bind': teamForm.projectId ? bind('vibe_projects', teamForm.projectId) : undefined, 'vibe_roleid@odata.bind': teamForm.roleId ? bind('vibe_projectroles', teamForm.roleId) : undefined }
    if (teamForm.id) await execute(async () => { await Vibe_projectteammembersService.update(teamForm.id, payload) }, 'Team member updated.')
    else await execute(async () => { await Vibe_projectteammembersService.create(asCreatePayload<Omit<Vibe_projectteammembersBase, 'vibe_projectteammemberid'>>(payload)) }, 'Team member created.')
    resetTeamForm()
  }

  async function deleteTeam() {
    if (!teamForm.id) return
    await execute(async () => { await Vibe_projectteammembersService.delete(teamForm.id) }, 'Team member deleted.')
    resetTeamForm()
  }

  async function upsertBudget() {
    const payload: Partial<Vibe_budgetlinesBase> = { vibe_name: budgetForm.name, vibe_estimatedamount: parseNumber(budgetForm.estimated), vibe_actualamount: parseNumber(budgetForm.actual), vibe_category: Number(budgetForm.category) as Vibe_budgetlinesBase['vibe_category'], 'vibe_projectid@odata.bind': budgetForm.projectId ? bind('vibe_projects', budgetForm.projectId) : undefined }
    if (budgetForm.id) await execute(async () => { await Vibe_budgetlinesService.update(budgetForm.id, payload) }, 'Budget line updated.')
    else await execute(async () => { await Vibe_budgetlinesService.create(asCreatePayload<Omit<Vibe_budgetlinesBase, 'vibe_budgetlineid'>>(payload)) }, 'Budget line created.')
    resetBudgetForm()
  }

  async function deleteBudget() {
    if (!budgetForm.id) return
    await execute(async () => { await Vibe_budgetlinesService.delete(budgetForm.id) }, 'Budget line deleted.')
    resetBudgetForm()
  }

  async function upsertRisk() {
    const payload: Partial<Vibe_risksBase> = { vibe_title: riskForm.title, vibe_probability: Number(riskForm.probability) as Vibe_risksBase['vibe_probability'], vibe_impact: Number(riskForm.impact) as Vibe_risksBase['vibe_impact'], vibe_riskstatus: Number(riskForm.status) as Vibe_risksBase['vibe_riskstatus'], 'vibe_projectid@odata.bind': riskForm.projectId ? bind('vibe_projects', riskForm.projectId) : undefined }
    if (riskForm.id) await execute(async () => { await Vibe_risksService.update(riskForm.id, payload) }, 'Risk updated.')
    else await execute(async () => { await Vibe_risksService.create(asCreatePayload<Omit<Vibe_risksBase, 'vibe_riskid'>>(payload)) }, 'Risk created.')
    resetRiskForm()
  }

  async function deleteRisk() {
    if (!riskForm.id) return
    await execute(async () => { await Vibe_risksService.delete(riskForm.id) }, 'Risk deleted.')
    resetRiskForm()
  }

  async function upsertIssue() {
    const payload: Partial<Vibe_issuesBase> = { vibe_title: issueForm.title, vibe_severity: Number(issueForm.severity) as Vibe_issuesBase['vibe_severity'], vibe_issuestatus: Number(issueForm.status) as Vibe_issuesBase['vibe_issuestatus'], 'vibe_projectid@odata.bind': issueForm.projectId ? bind('vibe_projects', issueForm.projectId) : undefined }
    if (issueForm.id) await execute(async () => { await Vibe_issuesService.update(issueForm.id, payload) }, 'Issue updated.')
    else await execute(async () => { await Vibe_issuesService.create(asCreatePayload<Omit<Vibe_issuesBase, 'vibe_issueid'>>(payload)) }, 'Issue created.')
    resetIssueForm()
  }

  async function deleteIssue() {
    if (!issueForm.id) return
    await execute(async () => { await Vibe_issuesService.delete(issueForm.id) }, 'Issue deleted.')
    resetIssueForm()
  }

  async function upsertDeliverable() {
    const payload: Partial<Vibe_deliverablesBase> = { vibe_name: deliverableForm.name, vibe_duedate: deliverableForm.dueDate || undefined, vibe_deliverablestatus: Number(deliverableForm.status) as Vibe_deliverablesBase['vibe_deliverablestatus'], vibe_documentlink: deliverableForm.documentLink || undefined, 'vibe_projectid@odata.bind': deliverableForm.projectId ? bind('vibe_projects', deliverableForm.projectId) : undefined, 'vibe_responsibleid@odata.bind': deliverableForm.responsibleId ? bind('vibe_projectteammembers', deliverableForm.responsibleId) : undefined }
    if (deliverableForm.id) await execute(async () => { await Vibe_deliverablesService.update(deliverableForm.id, payload) }, 'Deliverable updated.')
    else await execute(async () => { await Vibe_deliverablesService.create(asCreatePayload<Omit<Vibe_deliverablesBase, 'vibe_deliverableid'>>(payload)) }, 'Deliverable created.')
    resetDeliverableForm()
  }

  async function deleteDeliverable() {
    if (!deliverableForm.id) return
    await execute(async () => { await Vibe_deliverablesService.delete(deliverableForm.id) }, 'Deliverable deleted.')
    resetDeliverableForm()
  }

  async function upsertTime() {
    const payload: Partial<Vibe_timeentriesBase> = { vibe_name: timeForm.name, vibe_date: timeForm.date || undefined, vibe_hours: parseNumber(timeForm.hours), 'vibe_projectid@odata.bind': timeForm.projectId ? bind('vibe_projects', timeForm.projectId) : undefined, 'vibe_taskid@odata.bind': timeForm.taskId ? bind('vibe_tasks', timeForm.taskId) : undefined, 'vibe_teammemberid@odata.bind': timeForm.teamMemberId ? bind('vibe_projectteammembers', timeForm.teamMemberId) : undefined }
    if (timeForm.id) await execute(async () => { await Vibe_timeentriesService.update(timeForm.id, payload) }, 'Time entry updated.')
    else await execute(async () => { await Vibe_timeentriesService.create(asCreatePayload<Omit<Vibe_timeentriesBase, 'vibe_timeentryid'>>(payload)) }, 'Time entry created.')
    resetTimeForm()
  }

  async function deleteTime() {
    if (!timeForm.id) return
    await execute(async () => { await Vibe_timeentriesService.delete(timeForm.id) }, 'Time entry deleted.')
    resetTimeForm()
  }

  async function upsertDecision() {
    const payload: Partial<Vibe_decisionlogsBase> = { vibe_title: decisionForm.title, vibe_date: decisionForm.date || undefined, 'vibe_projectid@odata.bind': decisionForm.projectId ? bind('vibe_projects', decisionForm.projectId) : undefined, 'vibe_madebyid@odata.bind': decisionForm.madeById ? bind('vibe_projectteammembers', decisionForm.madeById) : undefined }
    if (decisionForm.id) await execute(async () => { await Vibe_decisionlogsService.update(decisionForm.id, payload) }, 'Decision updated.')
    else await execute(async () => { await Vibe_decisionlogsService.create(asCreatePayload<Omit<Vibe_decisionlogsBase, 'vibe_decisionlogid'>>(payload)) }, 'Decision created.')
    resetDecisionForm()
  }

  async function deleteDecision() {
    if (!decisionForm.id) return
    await execute(async () => { await Vibe_decisionlogsService.delete(decisionForm.id) }, 'Decision deleted.')
    resetDecisionForm()
  }

  async function upsertMeeting() {
    const payload: Partial<Vibe_meetingnotesBase> = { vibe_title: meetingForm.title, vibe_date: meetingForm.date || undefined, 'vibe_projectid@odata.bind': meetingForm.projectId ? bind('vibe_projects', meetingForm.projectId) : undefined }
    if (meetingForm.id) await execute(async () => { await Vibe_meetingnotesService.update(meetingForm.id, payload) }, 'Meeting note updated.')
    else await execute(async () => { await Vibe_meetingnotesService.create(asCreatePayload<Omit<Vibe_meetingnotesBase, 'vibe_meetingnoteid'>>(payload)) }, 'Meeting note created.')
    resetMeetingForm()
  }

  async function deleteMeeting() {
    if (!meetingForm.id) return
    await execute(async () => { await Vibe_meetingnotesService.delete(meetingForm.id) }, 'Meeting note deleted.')
    resetMeetingForm()
  }

  async function upsertRole() {
    const payload: Partial<Vibe_projectrolesBase> = { vibe_name: roleForm.name, vibe_defaulthourlyrate: parseNumber(roleForm.defaultRate), vibe_isstakeholderrole: roleForm.isStakeholder }
    if (roleForm.id) await execute(async () => { await Vibe_projectrolesService.update(roleForm.id, payload) }, 'Role updated.')
    else await execute(async () => { await Vibe_projectrolesService.create(asCreatePayload<Omit<Vibe_projectrolesBase, 'vibe_projectroleid'>>(payload)) }, 'Role created.')
    resetRoleForm()
  }

  async function deleteRole() {
    if (!roleForm.id) return
    await execute(async () => { await Vibe_projectrolesService.delete(roleForm.id) }, 'Role deleted.')
    resetRoleForm()
  }

  async function upsertTemplate() {
    const payload: Partial<Vibe_projecttemplatesBase> = { vibe_name: templateForm.name, vibe_isactive: templateForm.isActive }
    if (templateForm.id) await execute(async () => { await Vibe_projecttemplatesService.update(templateForm.id, payload) }, 'Template updated.')
    else await execute(async () => { await Vibe_projecttemplatesService.create(asCreatePayload<Omit<Vibe_projecttemplatesBase, 'vibe_projecttemplateid'>>(payload)) }, 'Template created.')
    resetTemplateForm()
  }

  async function deleteTemplate() {
    if (!templateForm.id) return
    await execute(async () => { await Vibe_projecttemplatesService.delete(templateForm.id) }, 'Template deleted.')
    resetTemplateForm()
  }

  return (
    <div className={`app-root${darkMode ? ' dark-mode' : ''}`}>
      <div className="app-layout">
        <Sidebar
          projects={projects}
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          loading={loading}
          loadData={loadData}
        />

        <main className="app-content">
          <div className="page-header">
            <div>
              <div className="page-breadcrumb">
                {selectedProjectId ? (
                  <>
                    <span className="breadcrumb-link" onClick={() => setSelectedProjectId('')}>Projects</span>
                    <span className="breadcrumb-sep">›</span>
                    <span className="breadcrumb-current">{currentProjectName}</span>
                  </>
                ) : (
                  <span className="breadcrumb-current">Projects</span>
                )}
              </div>
              <div className="page-title">{TAB_LABELS[activeTab]}</div>
            </div>
          </div>

          {selectedProjectId && (() => {
            const proj = projects.find((p) => p.vibe_projectid === selectedProjectId)
            if (!proj) return null
            return (
              <div className="project-context-bar">
                <span className="project-context-dot" style={{ background: proj.statecode === 0 ? 'var(--c-green)' : 'var(--c-text-3)' }} />
                <span className="project-context-name">{proj.vibe_name}</span>
                {proj.vibe_startdate && proj.vibe_enddate && (
                  <span className="project-context-dates">
                    {proj.vibe_startdate.slice(0, 10)} → {proj.vibe_enddate.slice(0, 10)}
                  </span>
                )}
                <span className="project-context-divider" />
                <span className="project-context-stat"><strong>{filteredTasks.length}</strong> tasks</span>
                <span className="project-context-stat"><strong>{filteredTeam.length}</strong> members</span>
                {loading && <span className="project-context-loading">Loading…</span>}
              </div>
            )
          })()}

          {notice && (
            <div className={`f-notice f-notice-${notice.type}`}>{notice.message}</div>
          )}

          {activeTab === 'home' && (
            <ProjectsView
              projects={projects}
              templates={templates}
              projectForm={projectForm}
              setProjectForm={setProjectForm}
              upsertProject={upsertProject}
              deleteProject={deleteProject}
              resetProjectForm={resetProjectForm}
              setSelectedProjectId={setSelectedProjectId}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioView
              activeProjects={activeProjects}
              overdueTasks={overdueTasks}
              openRisks={openRisks}
              budgetBurnPct={budgetBurnPct}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewView
              taskCount={filteredTasks.length}
              teamCount={filteredTeam.length}
              budgetBurnPct={budgetBurnPct}
              hoursLogged={filteredTime.reduce((s, t) => s + (t.vibe_hours ?? 0), 0)}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskSpreadsheetView
              tasks={filteredTasks}
              teamMembers={filteredTeam}
              projects={projects}
              phases={phases}
              selectedProjectId={selectedProjectId}
              currentProjectName={currentProjectName}
              taskForm={taskForm}
              setTaskForm={setTaskForm}
              upsertTask={upsertTask}
              deleteTask={deleteTask}
              resetTaskForm={resetTaskForm}
            />
          )}

          {activeTab === 'team' && (
            <TeamView
              teamMembers={filteredTeam}
              projects={projects}
              roles={roles}
              projectById={projectById}
              teamForm={teamForm}
              setTeamForm={setTeamForm}
              upsertTeam={upsertTeam}
              deleteTeam={deleteTeam}
              resetTeamForm={resetTeamForm}
            />
          )}

          {activeTab === 'planning' && (
            <PlanningView allocations={filteredAllocations} projectById={projectById} />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              budgetLines={filteredBudget}
              invoices={filteredInvoices}
              projects={projects}
              projectById={projectById}
              budgetForm={budgetForm}
              setBudgetForm={setBudgetForm}
              upsertBudget={upsertBudget}
              deleteBudget={deleteBudget}
              resetBudgetForm={resetBudgetForm}
            />
          )}

          {activeTab === 'raid' && (
            <RaidView
              risks={filteredRisks}
              issues={filteredIssues}
              projects={projects}
              riskForm={riskForm}
              setRiskForm={setRiskForm}
              upsertRisk={upsertRisk}
              deleteRisk={deleteRisk}
              resetRiskForm={resetRiskForm}
              issueForm={issueForm}
              setIssueForm={setIssueForm}
              upsertIssue={upsertIssue}
              deleteIssue={deleteIssue}
              resetIssueForm={resetIssueForm}
            />
          )}

          {activeTab === 'deliverables' && (
            <DeliverablesView
              deliverables={filteredDeliverables}
              projects={projects}
              teamMembers={teamMembers}
              projectById={projectById}
              deliverableForm={deliverableForm}
              setDeliverableForm={setDeliverableForm}
              upsertDeliverable={upsertDeliverable}
              deleteDeliverable={deleteDeliverable}
              resetDeliverableForm={resetDeliverableForm}
            />
          )}

          {activeTab === 'time' && (
            <TimeView
              timeEntries={filteredTime}
              projects={projects}
              tasks={tasks}
              teamMembers={teamMembers}
              projectById={projectById}
              timeForm={timeForm}
              setTimeForm={setTimeForm}
              upsertTime={upsertTime}
              deleteTime={deleteTime}
              resetTimeForm={resetTimeForm}
            />
          )}

          {activeTab === 'communication' && (
            <CommunicationsView
              decisions={filteredDecisions}
              meetingNotes={filteredMeetings}
              feed={filteredFeed}
              projects={projects}
              teamMembers={teamMembers}
              projectById={projectById}
              decisionForm={decisionForm}
              setDecisionForm={setDecisionForm}
              upsertDecision={upsertDecision}
              deleteDecision={deleteDecision}
              resetDecisionForm={resetDecisionForm}
              meetingForm={meetingForm}
              setMeetingForm={setMeetingForm}
              upsertMeeting={upsertMeeting}
              deleteMeeting={deleteMeeting}
              resetMeetingForm={resetMeetingForm}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentsView projects={filteredProjects} />
          )}

          {activeTab === 'stakeholders' && (
            <StakeholdersView
              teamMembers={filteredTeam}
              roles={roles}
              projectById={projectById}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              roles={roles}
              templates={templates}
              roleForm={roleForm}
              setRoleForm={setRoleForm}
              upsertRole={upsertRole}
              deleteRole={deleteRole}
              resetRoleForm={resetRoleForm}
              templateForm={templateForm}
              setTemplateForm={setTemplateForm}
              upsertTemplate={upsertTemplate}
              deleteTemplate={deleteTemplate}
              resetTemplateForm={resetTemplateForm}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
