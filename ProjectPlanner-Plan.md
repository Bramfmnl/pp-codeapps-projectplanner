# Project Planner — Power Platform Code App (Delivery Plan)

## 1. Environment & Operating Rules

### Environment
- **Dataverse URL**: `https://projectplanner.crm4.dynamics.com`
- **Tenant ID**: `dca35af0-6dbc-497f-b7bb-ebd34e5aa624`
- **MCP Client ID**: `aebc6443-996d-45c2-90f0-388ff96faa56`
- **Solution**: `vibe` (already created)
- **Publisher Prefix**: `vibe` (every custom schema name starts with `vibe_`)
- **PAC Auth Profile**: `nonprod`
- **Dataverse Plugin**: dataverse@awesome-copilot v1.5.0

### Non-negotiable rules
1. **Environment-first** — create metadata in Dataverse via API/skills, then pull into repo. Never hand-author solution XML to create components.
2. **Single solution** — all tables, columns, relationships, and components live in **`vibe`**.
3. **Prefix consistency** — no `new_` and no mixed prefixes. Every custom component uses `vibe_`.
4. **Unmanaged in dev** — managed packages only for downstream environments.
5. **Validate after every batch** — confirm tables, columns, lookups, and choices before moving on.

---

## 2. Product Outcome & Success Criteria

### Outcome
A project delivery management app covering template-based project setup, phase/task execution, time and budget tracking, RAID and deliverables management, resource planning, and stakeholder visibility.

### MVP success criteria
1. A PM can create a fully populated project from a template in under 3 minutes.
2. Team members can log time and update assigned tasks.
3. A PM can see budget remaining, overdue tasks, and open risks on one screen.
4. Stakeholders have read-only access to project health and deliverables.
5. Core automation runs unattended (overdue alerts, phase approvals, weekly digest).

### In scope (MVP) / Out of scope
- **In**: Dataverse schema, seed/template data, 3 security roles, Code App, 5 flows.
- **Out**: i18n, AI forecasting, external ERP integration, mobile-first redesign.

---

## 3. Build Phases, Tooling & Exit Gates

### Phase 1 — Dataverse Tables & Relationships
- **Agent**: Default · **Skill**: dv-metadata
- **Authoring method**: create all tables, columns, relationships, and choices through the **Dataverse MCP server** (`list_tables`, `create_table`, `update_table`, etc.). Do not create components via hand-edited XML or the maker portal. Use the SDK/Web API only for the advanced cases the MCP server does not cover (see §4 standards).
- **Batching**: create tables in 6 dependency-ordered batches; finish each batch before the next.
- **Exit gate**: all tables exist with `vibe_` prefix; lookups + choices present; components in `vibe`.

### Phase 2 — Seed Reference Data
- **Agent**: Default · **Skill**: dv-data
- **What**: default Project Roles + one complete Project Template (phases, tasks, role templates).
- **Exit gate**: a project can be instantiated from the template with no missing references.

### Phase 3 — Security Roles
- **Agent**: Default · **Skill**: dv-security
- **Exit gate**: PM, Team Member, and Stakeholder roles behave per the matrix in §7.

### Phase 4 — Code App
- **Agent**: code-app-architect · **Stack**: React 18+ / Fluent UI v9 / TypeScript / Vite / Dataverse Web API
- **Exit gate**: core screens functional with stable CRUD, filters, error & empty states.

### Phase 5 — Power Automate Flows
- **Built manually** in the maker portal.
- **Exit gate**: 5 flows active, owned, and tested on real records (happy + failure path).

---

## 4. Data Model — Detailed (Batch Creation Order)

### Dataverse authoring standards (apply to every table below)
- **Create via the MCP server** — all tables, columns, relationships, and choice sets are authored through the **Dataverse MCP server**. Hand-written solution XML and manual maker-portal creation are not allowed for new components.
- **Use built-in state fields for status** — do **not** create a custom `Status` choice column when a record's lifecycle maps to record state. Every Dataverse table is auto-created with **`statecode` (Status)** and **`statuscode` (Status Reason)**. Add your lifecycle values as **Status Reason options** mapped to the correct `Active`/`Inactive` state, instead of a separate custom choice. The per-table "Status" choices listed below are the **Status Reason** values to configure on the auto-generated `statuscode` field.
- **Global (environment) choice sets** — define choices as **global option sets** (prefixed `vibe_`) wherever the values are reused or are domain-standard (e.g., Priority, Severity, Approval Status, Budget Category, Probability/Impact rating). Use a **local** choice only when the values are genuinely unique to one column. Global sets keep values consistent across tables and the app.
- **Naming & ownership** — `vibe_` prefix on every schema name; user/team-owned tables unless a clear reason for org-owned; meaningful primary name columns.
- **Lookups & relationships** — create relationships explicitly with descriptive schema names; mark required vs optional per the tables below.
- **Advanced cases via SDK/Web API** — when the MCP server cannot express something (e.g., certain calculated/rollup fields, polymorphic lookups, or fine-grained option-set metadata), fall back to the dv-metadata SDK/Web API patterns, but still target solution `vibe`.

> Legend: **PK** = primary name column. Lookups note target table and optionality. Choice options listed inline; "Status" rows = **Status Reason** values on the built-in `statuscode` field. Global option sets are flagged **(global)**. All schema names prefixed `vibe_`.

### Batch 1 — Foundation (no custom-table dependencies)

#### 1. Project Role — `vibe_projectrole`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Description | Multiline text | |
| Default Hourly Rate | Currency | optional |
| Is Stakeholder Role | Boolean | default false |

#### 2. Project Template — `vibe_projecttemplate`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Description | Multiline text | |
| Is Active | Boolean | default true |

---

### Batch 2 — Template children (depend on Batch 1)

#### 3. Phase Template — `vibe_phasetemplate`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project Template | Lookup → Project Template | required |
| Order | Whole number | |
| Default Duration Days | Whole number | optional |

#### 4. Role Template — `vibe_roletemplate`
| Column | Type | Notes |
|---|---|---|
| Project Template | Lookup → Project Template | required |
| Project Role | Lookup → Project Role | required |
| Suggested Headcount | Whole number | default 1 |

---

### Batch 3 — Task Template + Project

#### 5. Task Template — `vibe_tasktemplate`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Phase Template | Lookup → Phase Template | required |
| Default Estimated Hours | Decimal | optional |
| Default Priority | Choice **(global: `vibe_priority`)** | Low \| Medium \| High \| Critical |
| Default Role | Lookup → Project Role | optional |
| Order | Whole number | |

#### 6. Project — `vibe_project`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Description | Multiline text | |
| Client | Lookup → Account | optional |
| Status | **Status Reason** (built-in `statuscode`) | Draft \| Active \| On Hold \| Completed \| Cancelled (map Completed/Cancelled → Inactive) |
| Start Date | Date | |
| End Date | Date | |
| Total Budget | Currency | |
| Budget Spent | Currency | calculated/maintained |
| Budget Remaining | Currency | calculated/maintained |
| Owner | Lookup → User | |
| Template Source | Lookup → Project Template | nullable |
| SharePoint Folder URL | URL | nullable |

---

### Batch 4 — Core project children (depend on Project + Project Role)

#### 7. Project Phase — `vibe_projectphase`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Order | Whole number | |
| Start Date | Date | |
| End Date | Date | |
| Status | **Status Reason** (built-in `statuscode`) | Not Started \| In Progress \| Completed \| Skipped (map Completed/Skipped → Inactive) |
| Requires Approval | Boolean | default false |
| Approval Status | Choice **(global: `vibe_approvalstatus`)** | Not Required \| Pending \| Approved \| Rejected |

#### 8. Project Team Member — `vibe_projectteammember`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Contact | Lookup → Contact | nullable (XOR with User) |
| User | Lookup → User | nullable (XOR with Contact) |
| Role | Lookup → Project Role | required |
| Hourly Rate | Currency | |
| Allocation Percentage | Whole number | 0–100 |
| Start Date | Date | |
| End Date | Date | |
| Is Active | Boolean | default true |

#### 9. Budget Line — `vibe_budgetline`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Phase | Lookup → Project Phase | optional |
| Category | Choice **(global: `vibe_budgetcategory`)** | Licenses \| Infrastructure \| Travel \| Training \| External Services \| Other |
| Description | Text | |
| Estimated Amount | Currency | |
| Actual Amount | Currency | |
| Status | **Status Reason** (built-in `statuscode`) | Planned \| Approved \| Spent |

#### 10. Budget Change Request — `vibe_budgetchangerequest`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Requested Amount | Currency | required |
| Justification | Multiline text | required |
| Requested By | Lookup → User | |
| Approved By | Lookup → User | nullable |
| Date Requested | Date | |
| Date Resolved | Date | nullable |
| Status | **Status Reason** (built-in `statuscode`) | Pending \| Approved \| Rejected (map Approved/Rejected → Inactive) |

#### 11. Invoice — `vibe_invoice`
| Column | Type | Notes |
|---|---|---|
| Invoice Number | Text | required (PK) |
| Project | Lookup → Project | required |
| Amount | Currency | required |
| Date Issued | Date | |
| Due Date | Date | |
| Date Paid | Date | nullable |
| Status | **Status Reason** (built-in `statuscode`) | Draft \| Sent \| Paid \| Overdue (map Paid → Inactive) |
| Notes | Text | |

#### 12. Risk — `vibe_risk`
| Column | Type | Notes |
|---|---|---|
| Title | Text | required (PK) |
| Project | Lookup → Project | required |
| Description | Multiline text | |
| Probability | Choice **(global: `vibe_ratingscale`)** | 1 \| 2 \| 3 \| 4 \| 5 |
| Impact | Choice **(global: `vibe_ratingscale`)** | 1 \| 2 \| 3 \| 4 \| 5 |
| Risk Score | Whole number | Probability × Impact |
| Mitigation Plan | Multiline text | |
| Owner | Lookup → Project Team Member | |
| Status | **Status Reason** (built-in `statuscode`) | Open \| Mitigating \| Closed \| Accepted (map Closed/Accepted → Inactive) |
| Phase | Lookup → Project Phase | optional |

#### 13. Issue — `vibe_issue`
| Column | Type | Notes |
|---|---|---|
| Title | Text | required (PK) |
| Project | Lookup → Project | required |
| Description | Multiline text | |
| Severity | Choice **(global: `vibe_severity`)** | Low \| Medium \| High \| Critical |
| Reported By | Lookup → Project Team Member | |
| Assigned To | Lookup → Project Team Member | |
| Status | **Status Reason** (built-in `statuscode`) | Open \| In Progress \| Resolved \| Closed (map Resolved/Closed → Inactive) |
| Resolution | Multiline text | |
| Impact on Budget | Currency | optional |
| Impact on Timeline Days | Whole number | optional |
| Phase | Lookup → Project Phase | optional |

#### 14. Decision Log — `vibe_decisionlog`
| Column | Type | Notes |
|---|---|---|
| Title | Text | required (PK) |
| Project | Lookup → Project | required |
| Description | Multiline text | |
| Rationale | Multiline text | |
| Made By | Lookup → Project Team Member | |
| Date | Date | |
| Phase | Lookup → Project Phase | optional |

#### 15. Deliverable — `vibe_deliverable`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Phase | Lookup → Project Phase | optional |
| Responsible | Lookup → Project Team Member | |
| Due Date | Date | |
| Status | **Status Reason** (built-in `statuscode`) | Draft \| In Review \| Approved \| Delivered (map Delivered → Inactive) |
| Document Link | URL | optional |

#### 16. Activity Feed Entry — `vibe_activityfeedentry`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Timestamp | DateTime | auto-set |
| Event Type | Choice | Status Change \| Team Change \| Phase Completed \| Budget Threshold \| Risk Created \| Milestone Reached \| Deliverable Submitted \| Decision Made |
| Description | Text | |
| Related Record URL | Text | optional |
| Actor | Lookup → User | |

---

### Batch 5 — Execution tracking (depend on Project Team Member)

#### 17. Task — `vibe_task`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Phase | Lookup → Project Phase | |
| Assigned To | Lookup → Project Team Member | |
| Status | **Status Reason** (built-in `statuscode`) | To Do \| In Progress \| Blocked \| Done (map Done → Inactive) |
| Priority | Choice **(global: `vibe_priority`)** | Low \| Medium \| High \| Critical |
| Start Date | Date | |
| Due Date | Date | |
| Estimated Hours | Decimal | |
| Actual Hours | Decimal | sum of Time Entries |
| Estimated Cost | Currency | |
| Actual Cost | Currency | |
| Description | Multiline text | |
| Predecessor | Lookup → Task | self-referential, optional |
| Is Milestone | Boolean | default false |

#### 18. Resource Allocation — `vibe_resourceallocation`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project Team Member | Lookup → Project Team Member | required |
| Project | Lookup → Project | required |
| Week Start Date | Date | required |
| Planned Hours | Decimal | |
| Actual Hours | Decimal | |
| Notes | Text | |

#### 19. Time Entry — `vibe_timeentry`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Project | Lookup → Project | required |
| Task | Lookup → Task | required |
| Team Member | Lookup → Project Team Member | required |
| Date | Date | required |
| Hours | Decimal | required, > 0 and ≤ 24 |
| Description | Text | |

#### 20. Meeting Note — `vibe_meetingnote`
| Column | Type | Notes |
|---|---|---|
| Title | Text | required (PK) |
| Project | Lookup → Project | required |
| Date | Date | required |
| Notes | Multiline text (rich) | |
| Phase | Lookup → Project Phase | optional |

---

### Batch 6 — Junction & child tables

#### 21. Task Checklist Item — `vibe_taskchecklistitem`
| Column | Type | Notes |
|---|---|---|
| Title | Text | required (PK) |
| Task | Lookup → Task | required |
| Is Completed | Boolean | default false |
| Order | Whole number | |

#### 22. Meeting Attendee — `vibe_meetingattendee`
| Column | Type | Notes |
|---|---|---|
| Name | Text | required (PK) |
| Meeting Note | Lookup → Meeting Note | required |
| Team Member | Lookup → Project Team Member | required |

#### 23. Meeting Action Item — `vibe_meetingactionitem`
| Column | Type | Notes |
|---|---|---|
| Description | Text | required (PK) |
| Meeting Note | Lookup → Meeting Note | required |
| Assigned To | Lookup → Project Team Member | optional |
| Linked Task | Lookup → Task | optional |
| Is Completed | Boolean | default false |

---

## 5. Relationships Map

- **Project** 1:N → Project Phase, Task, Project Team Member, Resource Allocation, Time Entry, Budget Line, Budget Change Request, Invoice, Risk, Issue, Decision Log, Meeting Note, Deliverable, Activity Feed Entry
- **Project Template** 1:N → Phase Template, Role Template
- **Phase Template** 1:N → Task Template
- **Project Phase** 1:N → Task, Budget Line, Risk, Issue, Decision Log, Meeting Note, Deliverable
- **Task** 1:N → Task Checklist Item, Time Entry · N:1 → Task (predecessor, self-referential) · N:1 → Project Team Member (assigned to)
- **Project Team Member** N:1 → Project Role, Contact (nullable), User (nullable) · 1:N → Resource Allocation, Time Entry
- **Risk** N:1 → Project Team Member (owner)
- **Issue** N:1 → Project Team Member (reported by, assigned to)
- **Decision Log** N:1 → Project Team Member (made by)
- **Deliverable** N:1 → Project Team Member (responsible)
- **Meeting Note** 1:N → Meeting Attendee, Meeting Action Item
- **Meeting Attendee** N:1 → Project Team Member
- **Meeting Action Item** N:1 → Project Team Member (assigned to), Task (linked task, nullable)

---

## 6. Business Logic

### Validation
- Task Due Date ≥ Start Date.
- Task dates within Phase range (warn, don't block).
- Phase dates within Project range (warn, don't block).
- Project Team Member: exactly one of Contact or User (XOR).
- Resource Allocation: warn if total planned hours > 40/week across all projects.
- Budget Change Request: only project owner may approve/reject.
- Time Entry hours > 0 and ≤ 24 per day.

### Calculations
- `Budget Spent = sum(Task.Actual Cost) + sum(Budget Line.Actual Amount)`
- `Budget Remaining = Total Budget − Budget Spent`
- `Task Estimated Cost = Estimated Hours × coalesce(Team Member.Hourly Rate, Role.Default Hourly Rate)`
- `Task Actual Cost = Actual Hours × coalesce(Team Member.Hourly Rate, Role.Default Hourly Rate)`
- `Task Actual Hours = sum(Time Entry.Hours)`
- `Risk Score = Probability × Impact`

### Auto-generated Activity Feed events
Create an Activity Feed Entry when: project status changes · phase status changes · milestone task marked Done · team member added/removed · budget threshold crossed (50/75/90/100%) · risk created with score ≥ 15 · deliverable set to Delivered · decision logged · budget change request approved.

### Template instantiation
1. Create Project record with Template Source set.
2. Each Phase Template → Project Phase (copy name, order).
3. Each Task Template → Task under matching phase (copy name, hours, priority, order).
4. Each Role Template → Project Team Member stub (role pre-filled, no person assigned).

### Status cascades
- Project → Completed: close all open phases and non-Done tasks.
- All tasks Done in a phase → auto-complete phase.
- Phase with Requires Approval: completion sets Approval Status = Pending and blocks until approved.

---

## 7. Security Model

| Role | Read | Create/Update | Delete | Special |
|---|---|---|---|---|
| **Project Manager** | All project tables | All project tables | All project tables | Approves budget & phase gates |
| **Team Member** | Most project data | Own time entries, assigned tasks, own action items | Own draft records only | No budget approval |
| **Stakeholder** | Project health, deliverables, meeting notes (read-only) | None | None | No operational edits |

---

## 8. UI Requirements

### General
- Fluent UI v9 only (no v8). Light/dark toggle. Desktop-optimized (1440px+).
- Left sidebar: project list + nav. Main area: tabbed layout per project.
- All data via Dataverse Web API. Loading skeletons, empty states with CTAs, toast notifications.

### Screens & tabs
1. **Project List (Home)** — card/table grid; columns Name, Client, Status badge, Date Range, Budget Health, Risk Count, Overdue Tasks; filter by Status/Client; sort by Name/Start Date/Status; quick-create with template picker (auto-populates phases, tasks, suggested roles).
2. **Portfolio Dashboard** — cross-project health (budget % vs timeline %, on track/at risk/overdue, highest open risk, % tasks complete); burn-rate sparklines; Resource Pool grid (people × weeks, color-coded < 40h / 40h / > 40h).
3. **Overview** — summary card; budget donut (labor vs non-labor); phase progress bar; burn-rate S-curve; KPI row (members, tasks, % done, overdue, open risks/issues); activity feed.
4. **Phases & Tasks** — phases list + tasks for selection; Kanban (To Do/In Progress/Blocked/Done) with drag-and-drop default; Gantt toggle (bars, dependency arrows, milestone diamonds, critical-path highlight); task side panel (detail/edit, checklist, time entries, predecessor/successor).
5. **Team** — table (Name, Role, Allocation %, Rate, Start/End, Active), grouped by role; add/remove dialog; member drill-down (tasks, allocation, time, totals); utilization mini-chart.
6. **Planning** — weekly resource grid (members × weeks), inline-editable planned hours, color by allocation, totals row/column, week navigator, What-If mode (in-memory, discard/apply).
7. **Budget** — summary cards (Total, Labor, Non-Labor, Remaining, Change Requests); budget lines table with inline edit; bar chart by category; change requests (create/approve/reject); invoice tracking (overdue color-coded); burn-rate S-curve with projection.
8. **RAID Log** — Risks (table + 5×5 heat map, side panel), Issues (table with severity/assignee/impact, side panel), Dependencies (simple external list).
9. **Deliverables** — table (Name, Phase, Responsible, Due, Status badge, Document Link); filter by Phase/Status; add/edit dialog.
10. **Documents** — embedded SharePoint browser for project folder; upload/download/preview; folder structure mirrors phases.
11. **Communication** — Decision Log (expandable), Meeting Notes (by date; attendees, rich notes, action items, "Create Task from Action Item"), full activity feed with event filter.
12. **Time Entry** — weekly timesheet (tasks × days), editable hours, per-day/per-task totals, manager filter by member.
13. **Stakeholders** — filtered to roles where Is Stakeholder Role = true (Name, Role, Email, Phone); quick-add dialog.
14. **Settings (dialog/flyout)** — manage Project Roles (CRUD); manage Project Templates with nested phase/task/role templates; gear icon in sidebar.

---

## 9. Power Automate Flows (maker portal)

1. **Overdue Task Alert** (daily) — tasks Status ≠ Done & Due Date < today → Teams card to Assigned To + Owner (task, project, days overdue, link).
2. **Phase Gate Approval** (trigger: Approval Status = Pending) — approval to Owner; approve → Approved + Phase Completed; reject → Rejected + revert to In Progress.
3. **Weekly Status Digest** (Monday AM) — per active project: completed last week, due this week, overdue, budget snapshot, open risks/issues → Teams/email to Owner + stakeholders.
4. **Milestone Notification** (trigger: Task Done & Is Milestone) — Teams notice to stakeholders (milestone, project, date).
5. **SharePoint Folder Provisioning** (trigger: Project created) — create folder + per-phase sub-folders; update Project.SharePoint Folder URL.

**Quality bar**: each flow has an owner, retry policy, and a failure-notification path with meaningful error context.

---

## 10. Tech Stack & Constraints

### Stack
React 18+ · Fluent UI v9 (`@fluentui/react-components`) · TypeScript strict · Vite · Dataverse Web API · charts (recharts or `@fluentui/react-charting`) · Gantt (`@dhx/gantt-react` or custom) · heat map (custom CSS grid). No external backend.

### Constraints
- Code App deployed via solution `vibe`.
- Ambient Dataverse auth (no separate auth flow).
- All schema names use `vibe_`.
- No Fluent UI v8. Lazy-load Gantt/charts/heat map. Bundle < 5 MB. English only.

---

## 11. Implementation Order

### Dataverse (Default agent + dataverse skills)
1. Batch 1: Project Role, Project Template
2. Batch 2: Phase Template, Role Template
3. Batch 3: Task Template, Project
4. Batch 4: Project Phase, Project Team Member, Budget Line, Budget Change Request, Invoice, Risk, Issue, Decision Log, Deliverable, Activity Feed Entry
5. Batch 5: Task, Resource Allocation, Time Entry, Meeting Note
6. Batch 6: Task Checklist Item, Meeting Attendee, Meeting Action Item
7. Seed reference data (dv-data): default roles, sample template
8. Security roles (dv-security): Project Manager, Team Member, Stakeholder

### Code App (code-app-architect)
9. Scaffold shell + routing
10. Project List (home) with template-based creation
11. Overview tab
12. Team tab
13. Phases & Tasks tab (Kanban first)
14. Time Entry tab
15. Budget tab
16. Planning tab
17. RAID Log tab
18. Deliverables tab
19. Documents tab
20. Communication tab
21. Stakeholders tab
22. Portfolio Dashboard
23. Phases & Tasks: add Gantt view
24. Settings dialog
25. Polish: dark mode, loading/error/empty states

### Power Automate (maker portal)
26. SharePoint Folder Provisioning
27. Overdue Task Alert
28. Phase Gate Approval
29. Milestone Notification
30. Weekly Status Digest

---

## 12. Definition of Done

### Dataverse
- All 23 tables and columns exist as designed; relationships resolve; choice values correct; everything in solution `vibe`.
- All components were created via the **MCP server** (not hand-authored XML).
- Lifecycle fields use the built-in **`statecode`/`statuscode`** (Status / Status Reason) rather than custom status choices.
- Reusable choices exist as **global option sets** (`vibe_` prefixed); local choices used only where values are column-unique.

### App
- Core PM and Team Member scenarios pass; role-based visibility correct; no blocking runtime errors in normal flows.

### Automation
- Each flow passes happy + failure path; notifications reach intended recipients.

---

## 13. Risks & Mitigations

1. **Schema drift** — always pull env → repo after structural changes.
2. **Prefix inconsistency** — reject any non-`vibe_` schema creation.
3. **Flow orphaning** — shared owner account; document run-only users.
4. **Performance on large datasets** — server-side filtering, pagination, lazy-loading.
5. **Security over-permissioning** — test each role with representative accounts.

---

## 14. Immediate Next Actions

1. Pull current `vibe` solution baseline into `solutions\vibe`.
2. Create Batch 1 tables and validate.
3. Continue Batches 2–6 in order, validating after each.
4. Seed roles + sample template, then start the Code App scaffold (Project List + Overview first).
