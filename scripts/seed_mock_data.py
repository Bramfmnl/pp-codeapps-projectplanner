import os, sys, time
sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client

client = get_client("dv-data")

def create_all(table, records):
    """Create records individually to avoid CreateMultiple metadata errors."""
    return [client.records.create(table, r) for r in records]

print("=== Project Planner — Mock Data Seed ===\n")

# ── Level 0: Project Roles ────────────────────────────────────────────────────
# Note: Boolean field vibe_isstakeholderrole doesn't work with CreateMultiple,
# so we create roles one at a time.
print("Creating project roles...")
role_records = [
    {"vibe_name": "Project Manager",     "vibe_defaulthourlyrate": 120.0, "vibe_isstakeholderrole": False},
    {"vibe_name": "Business Analyst",    "vibe_defaulthourlyrate": 95.0,  "vibe_isstakeholderrole": False},
    {"vibe_name": "Developer",           "vibe_defaulthourlyrate": 110.0, "vibe_isstakeholderrole": False},
    {"vibe_name": "QA Engineer",         "vibe_defaulthourlyrate": 85.0,  "vibe_isstakeholderrole": False},
    {"vibe_name": "UX Designer",         "vibe_defaulthourlyrate": 100.0, "vibe_isstakeholderrole": False},
    {"vibe_name": "Sponsor",             "vibe_defaulthourlyrate": 200.0, "vibe_isstakeholderrole": True},
    {"vibe_name": "Steering Committee",  "vibe_defaulthourlyrate": 150.0, "vibe_isstakeholderrole": True},
]
role_ids = create_all("vibe_projectrole", role_records)
print(f"  ✓ {len(role_ids)} roles created")

# Role ID map by index
pm_id, ba_id, dev_id, qa_id, ux_id, sponsor_id, sc_id = role_ids

# ── Level 0: Project Templates ───────────────────────────────────────────────
print("Creating project templates...")
tmpl_records = [
    {"vibe_name": "Software Delivery",   "vibe_isactive": True},
    {"vibe_name": "Infrastructure Upgrade", "vibe_isactive": True},
    {"vibe_name": "Digital Transformation", "vibe_isactive": True},
]
tmpl_ids = create_all("vibe_projecttemplate", tmpl_records)
print(f"  ✓ {len(tmpl_ids)} templates created")
sw_tmpl_id, infra_tmpl_id, dt_tmpl_id = tmpl_ids

# ── Level 1: Projects ─────────────────────────────────────────────────────────
print("Creating projects...")
project_records = [
    {
        "vibe_name": "CRM Platform Rebuild",
        "vibe_startdate": "2026-01-15",
        "vibe_enddate": "2026-09-30",
        "vibe_totalbudget": 480000.0,
        "vibe_budgetspent": 142000.0,
        "vibe_templatesourceid@odata.bind": f"/vibe_projecttemplates({sw_tmpl_id})",
    },
    {
        "vibe_name": "Cloud Migration",
        "vibe_startdate": "2026-02-01",
        "vibe_enddate": "2026-07-31",
        "vibe_totalbudget": 210000.0,
        "vibe_budgetspent": 87500.0,
        "vibe_templatesourceid@odata.bind": f"/vibe_projecttemplates({infra_tmpl_id})",
    },
    {
        "vibe_name": "Customer Portal",
        "vibe_startdate": "2026-03-01",
        "vibe_enddate": "2026-12-31",
        "vibe_totalbudget": 320000.0,
        "vibe_budgetspent": 41000.0,
        "vibe_templatesourceid@odata.bind": f"/vibe_projecttemplates({dt_tmpl_id})",
    },
]
project_ids = create_all("vibe_project", project_records)
print(f"  ✓ {len(project_ids)} projects created")
crm_id, cloud_id, portal_id = project_ids

# ── Level 2: Team Members ─────────────────────────────────────────────────────
print("Creating team members...")
team_records = [
    # CRM project
    {"vibe_name": "Sophie Claes",      "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_roleid@odata.bind": f"/vibe_projectroles({pm_id})",      "vibe_allocationpercentage": 100, "vibe_hourlyrate": 125.0, "vibe_isactive": True,  "vibe_startdate": "2026-01-15"},
    {"vibe_name": "Liam Janssen",       "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_roleid@odata.bind": f"/vibe_projectroles({dev_id})",     "vibe_allocationpercentage": 100, "vibe_hourlyrate": 110.0, "vibe_isactive": True,  "vibe_startdate": "2026-01-20"},
    {"vibe_name": "Fatima El-Amin",     "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_roleid@odata.bind": f"/vibe_projectroles({dev_id})",     "vibe_allocationpercentage": 80,  "vibe_hourlyrate": 110.0, "vibe_isactive": True,  "vibe_startdate": "2026-01-20"},
    {"vibe_name": "Petra Vos",          "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_roleid@odata.bind": f"/vibe_projectroles({ba_id})",      "vibe_allocationpercentage": 60,  "vibe_hourlyrate": 95.0,  "vibe_isactive": True,  "vibe_startdate": "2026-01-15"},
    {"vibe_name": "Marc Dubois",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_roleid@odata.bind": f"/vibe_projectroles({sponsor_id})", "vibe_allocationpercentage": 10,  "vibe_hourlyrate": 200.0, "vibe_isactive": True,  "vibe_startdate": "2026-01-15"},
    # Cloud project
    {"vibe_name": "Ravi Sharma",        "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_roleid@odata.bind": f"/vibe_projectroles({pm_id})",      "vibe_allocationpercentage": 100, "vibe_hourlyrate": 120.0, "vibe_isactive": True,  "vibe_startdate": "2026-02-01"},
    {"vibe_name": "Ingrid Larsen",      "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_roleid@odata.bind": f"/vibe_projectroles({dev_id})",     "vibe_allocationpercentage": 100, "vibe_hourlyrate": 115.0, "vibe_isactive": True,  "vibe_startdate": "2026-02-01"},
    {"vibe_name": "Thomas Braun",       "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_roleid@odata.bind": f"/vibe_projectroles({dev_id})",     "vibe_allocationpercentage": 100, "vibe_hourlyrate": 108.0, "vibe_isactive": True,  "vibe_startdate": "2026-02-10"},
    {"vibe_name": "Amira Nkosi",        "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_roleid@odata.bind": f"/vibe_projectroles({sc_id})",      "vibe_allocationpercentage": 5,   "vibe_hourlyrate": 150.0, "vibe_isactive": True,  "vibe_startdate": "2026-02-01"},
    # Portal project
    {"vibe_name": "Elena Popescu",      "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_roleid@odata.bind": f"/vibe_projectroles({pm_id})",      "vibe_allocationpercentage": 100, "vibe_hourlyrate": 118.0, "vibe_isactive": True,  "vibe_startdate": "2026-03-01"},
    {"vibe_name": "Kwame Osei",         "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_roleid@odata.bind": f"/vibe_projectroles({dev_id})",     "vibe_allocationpercentage": 100, "vibe_hourlyrate": 112.0, "vibe_isactive": True,  "vibe_startdate": "2026-03-01"},
    {"vibe_name": "Nora Fitzgerald",    "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_roleid@odata.bind": f"/vibe_projectroles({ux_id})",      "vibe_allocationpercentage": 80,  "vibe_hourlyrate": 100.0, "vibe_isactive": True,  "vibe_startdate": "2026-03-01"},
    {"vibe_name": "Jun Watanabe",       "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_roleid@odata.bind": f"/vibe_projectroles({qa_id})",      "vibe_allocationpercentage": 60,  "vibe_hourlyrate": 88.0,  "vibe_isactive": False, "vibe_startdate": "2026-03-15", "vibe_enddate": "2026-05-31"},
]
team_ids = create_all("vibe_projectteammember", team_records)
print(f"  ✓ {len(team_ids)} team members created")

# Named refs
crm_pm, crm_dev1, crm_dev2, crm_ba, crm_sponsor = team_ids[0:5]
cloud_pm, cloud_dev1, cloud_dev2, cloud_sc = team_ids[5:9]
portal_pm, portal_dev, portal_ux, portal_qa = team_ids[9:13]

# ── Level 2: Tasks ────────────────────────────────────────────────────────────
print("Creating tasks...")
task_records = [
    # CRM tasks
    {"vibe_name": "Requirements gathering",      "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000003, "vibe_priority": 100000002, "vibe_duedate": "2026-02-14", "vibe_estimatedhours": 40,  "vibe_actualhours": 38},
    {"vibe_name": "Data model design",            "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000003, "vibe_priority": 100000002, "vibe_duedate": "2026-03-07", "vibe_estimatedhours": 60,  "vibe_actualhours": 65},
    {"vibe_name": "API development - Phase 1",    "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000001, "vibe_priority": 100000002, "vibe_duedate": "2026-05-30", "vibe_estimatedhours": 120, "vibe_actualhours": 72},
    {"vibe_name": "Frontend build",               "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000001, "vibe_priority": 100000001, "vibe_duedate": "2026-06-30", "vibe_estimatedhours": 200, "vibe_actualhours": 40},
    {"vibe_name": "Integration testing",          "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000000, "vibe_priority": 100000002, "vibe_duedate": "2026-08-15", "vibe_estimatedhours": 80},
    {"vibe_name": "UAT & sign-off",               "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskstatus": 100000000, "vibe_priority": 100000003, "vibe_duedate": "2026-09-15", "vibe_estimatedhours": 40},
    # Cloud tasks
    {"vibe_name": "Cloud readiness assessment",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskstatus": 100000003, "vibe_priority": 100000002, "vibe_duedate": "2026-02-28", "vibe_estimatedhours": 32,  "vibe_actualhours": 30},
    {"vibe_name": "Network architecture design",  "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskstatus": 100000003, "vibe_priority": 100000002, "vibe_duedate": "2026-03-31", "vibe_estimatedhours": 48,  "vibe_actualhours": 52},
    {"vibe_name": "Lift & shift — batch 1",       "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskstatus": 100000001, "vibe_priority": 100000002, "vibe_duedate": "2026-05-15", "vibe_estimatedhours": 96,  "vibe_actualhours": 45},
    {"vibe_name": "Lift & shift — batch 2",       "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskstatus": 100000000, "vibe_priority": 100000001, "vibe_duedate": "2026-06-30", "vibe_estimatedhours": 96},
    {"vibe_name": "Performance tuning",           "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskstatus": 100000000, "vibe_priority": 100000001, "vibe_duedate": "2026-07-15", "vibe_estimatedhours": 40},
    # Portal tasks
    {"vibe_name": "UX research & wireframes",     "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskstatus": 100000003, "vibe_priority": 100000002, "vibe_duedate": "2026-03-31", "vibe_estimatedhours": 56,  "vibe_actualhours": 54},
    {"vibe_name": "Design system setup",          "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskstatus": 100000001, "vibe_priority": 100000001, "vibe_duedate": "2026-04-30", "vibe_estimatedhours": 40,  "vibe_actualhours": 18},
    {"vibe_name": "Authentication module",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskstatus": 100000001, "vibe_priority": 100000003, "vibe_duedate": "2026-05-31", "vibe_estimatedhours": 80,  "vibe_actualhours": 22},
    {"vibe_name": "Dashboard & reporting",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskstatus": 100000000, "vibe_priority": 100000001, "vibe_duedate": "2026-07-31", "vibe_estimatedhours": 120},
    {"vibe_name": "Accessibility audit",          "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskstatus": 100000000, "vibe_priority": 100000001, "vibe_duedate": "2026-10-31", "vibe_estimatedhours": 32},
]
task_ids = create_all("vibe_task", task_records)
print(f"  ✓ {len(task_ids)} tasks created")

# ── Level 2: Budget Lines ─────────────────────────────────────────────────────
print("Creating budget lines...")
budget_records = [
    # CRM
    {"vibe_name": "CRM — Dev licences",       "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_category": 100000000, "vibe_estimatedamount": 45000,  "vibe_actualamount": 45000},
    {"vibe_name": "CRM — Cloud infra",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_category": 100000001, "vibe_estimatedamount": 80000,  "vibe_actualamount": 62000},
    {"vibe_name": "CRM — External consulting","vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_category": 100000004, "vibe_estimatedamount": 120000, "vibe_actualamount": 35000},
    {"vibe_name": "CRM — Training",           "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_category": 100000003, "vibe_estimatedamount": 18000,  "vibe_actualamount": 0},
    # Cloud
    {"vibe_name": "Cloud — Azure subscription","vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})", "vibe_category": 100000001, "vibe_estimatedamount": 90000,  "vibe_actualamount": 52000},
    {"vibe_name": "Cloud — Migration tools",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})", "vibe_category": 100000000, "vibe_estimatedamount": 22000,  "vibe_actualamount": 22000},
    {"vibe_name": "Cloud — Travel",            "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})", "vibe_category": 100000002, "vibe_estimatedamount": 8000,   "vibe_actualamount": 3500},
    # Portal
    {"vibe_name": "Portal — Design tools",    "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_category": 100000000, "vibe_estimatedamount": 12000,  "vibe_actualamount": 12000},
    {"vibe_name": "Portal — Hosting",         "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_category": 100000001, "vibe_estimatedamount": 36000,  "vibe_actualamount": 9000},
    {"vibe_name": "Portal — UX research",     "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_category": 100000004, "vibe_estimatedamount": 25000,  "vibe_actualamount": 20000},
]
budget_ids = create_all("vibe_budgetline", budget_records)
print(f"  ✓ {len(budget_ids)} budget lines created")

# ── Level 2: Risks ────────────────────────────────────────────────────────────
print("Creating risks...")
risk_records = [
    {"vibe_title": "Key developer unavailability",    "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_probability": 100000001, "vibe_impact": 100000003, "vibe_riskstatus": 100000001},
    {"vibe_title": "Scope creep from stakeholders",   "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_probability": 100000002, "vibe_impact": 100000002, "vibe_riskstatus": 100000000},
    {"vibe_title": "Third-party API instability",     "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_probability": 100000001, "vibe_impact": 100000004, "vibe_riskstatus": 100000000},
    {"vibe_title": "Cloud cost overrun",              "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_probability": 100000002, "vibe_impact": 100000002, "vibe_riskstatus": 100000001},
    {"vibe_title": "Legacy system incompatibility",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_probability": 100000001, "vibe_impact": 100000003, "vibe_riskstatus": 100000000},
    {"vibe_title": "Data loss during migration",      "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_probability": 100000000, "vibe_impact": 100000004, "vibe_riskstatus": 100000003},
    {"vibe_title": "WCAG compliance gaps",            "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_probability": 100000002, "vibe_impact": 100000002, "vibe_riskstatus": 100000000},
    {"vibe_title": "Low user adoption post-launch",   "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_probability": 100000001, "vibe_impact": 100000002, "vibe_riskstatus": 100000000},
]
risk_ids = create_all("vibe_risk", risk_records)
print(f"  ✓ {len(risk_ids)} risks created")

# ── Level 2: Issues ───────────────────────────────────────────────────────────
print("Creating issues...")
issue_records = [
    {"vibe_title": "Build pipeline broken on feature branch",  "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_severity": 100000002, "vibe_issuestatus": 100000001},
    {"vibe_title": "UAT environment not provisioned",          "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_severity": 100000002, "vibe_issuestatus": 100000000},
    {"vibe_title": "VPN connectivity to on-prem DC",           "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_severity": 100000003, "vibe_issuestatus": 100000001},
    {"vibe_title": "DNS propagation delay post cutover",       "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_severity": 100000001, "vibe_issuestatus": 100000002},
    {"vibe_title": "Mobile viewport layout breaks at 320px",   "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_severity": 100000001, "vibe_issuestatus": 100000001},
    {"vibe_title": "SSO integration returning 403 on logout",  "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_severity": 100000002, "vibe_issuestatus": 100000000},
]
issue_ids = create_all("vibe_issue", issue_records)
print(f"  ✓ {len(issue_ids)} issues created")

# ── Level 2: Deliverables ─────────────────────────────────────────────────────
print("Creating deliverables...")
deliverable_records = [
    {"vibe_name": "Business Requirements Document",  "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({crm_ba})",     "vibe_duedate": "2026-02-14", "vibe_deliverablestatus": 100000002},
    {"vibe_name": "Technical Architecture Doc",      "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",   "vibe_duedate": "2026-03-15", "vibe_deliverablestatus": 100000002},
    {"vibe_name": "API Specification v1.0",          "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",   "vibe_duedate": "2026-05-01", "vibe_deliverablestatus": 100000001},
    {"vibe_name": "Tested Production Release",       "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({crm_pm})",    "vibe_duedate": "2026-09-30", "vibe_deliverablestatus": 100000000},
    {"vibe_name": "Cloud Architecture Blueprint",    "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})", "vibe_duedate": "2026-03-31", "vibe_deliverablestatus": 100000002},
    {"vibe_name": "Migration Runbook",               "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({cloud_pm})",  "vibe_duedate": "2026-04-30", "vibe_deliverablestatus": 100000002},
    {"vibe_name": "Post-Migration Test Report",      "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({cloud_dev2})", "vibe_duedate": "2026-07-31", "vibe_deliverablestatus": 100000000},
    {"vibe_name": "UX Prototype — v1",               "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_duedate": "2026-04-15", "vibe_deliverablestatus": 100000002},
    {"vibe_name": "Accessibility Report",            "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({portal_qa})", "vibe_duedate": "2026-11-15", "vibe_deliverablestatus": 100000000},
    {"vibe_name": "Launch-Ready Portal",             "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_responsibleid@odata.bind": f"/vibe_projectteammembers({portal_pm})", "vibe_duedate": "2026-12-31", "vibe_deliverablestatus": 100000000},
]
deliverable_ids = create_all("vibe_deliverable", deliverable_records)
print(f"  ✓ {len(deliverable_ids)} deliverables created")

# ── Level 2: Decision Logs ────────────────────────────────────────────────────
print("Creating decision logs...")
decision_records = [
    {"vibe_title": "Use React for frontend over Angular",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({crm_pm})",    "vibe_date": "2026-01-22"},
    {"vibe_title": "Adopt event-driven API pattern",             "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",  "vibe_date": "2026-02-10"},
    {"vibe_title": "Delay Phase 2 by 3 weeks",                   "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({crm_pm})",    "vibe_date": "2026-04-03"},
    {"vibe_title": "Use Azure over AWS for hosting",             "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({cloud_pm})",  "vibe_date": "2026-02-05"},
    {"vibe_title": "Adopt hub-and-spoke VNet topology",          "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})","vibe_date": "2026-02-20"},
    {"vibe_title": "Go with Figma as primary design tool",       "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_date": "2026-03-05"},
    {"vibe_title": "Implement WCAG 2.2 AA as baseline",          "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_madebyid@odata.bind": f"/vibe_projectteammembers({portal_pm})", "vibe_date": "2026-03-12"},
]
decision_ids = create_all("vibe_decisionlog", decision_records)
print(f"  ✓ {len(decision_ids)} decision logs created")

# ── Level 2: Meeting Notes ────────────────────────────────────────────────────
print("Creating meeting notes...")
meeting_records = [
    {"vibe_title": "Kick-off meeting",              "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_date": "2026-01-15"},
    {"vibe_title": "Sprint 1 Review",               "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_date": "2026-02-07"},
    {"vibe_title": "Stakeholder demo — v0.3",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_date": "2026-04-18"},
    {"vibe_title": "Cloud kick-off",                "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_date": "2026-02-01"},
    {"vibe_title": "Migration rehearsal debrief",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_date": "2026-04-25"},
    {"vibe_title": "Portal kick-off",               "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_date": "2026-03-01"},
    {"vibe_title": "UX review session",             "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_date": "2026-04-10"},
]
meeting_ids = create_all("vibe_meetingnote", meeting_records)
print(f"  ✓ {len(meeting_ids)} meeting notes created")

# ── Level 3: Time Entries ─────────────────────────────────────────────────────
print("Creating time entries...")
time_records = [
    # CRM
    {"vibe_name": "CRM — requirements review",     "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[0]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_ba})",    "vibe_date": "2026-01-20", "vibe_hours": 8.0},
    {"vibe_name": "CRM — data model review",       "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[1]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",  "vibe_date": "2026-02-15", "vibe_hours": 7.5},
    {"vibe_name": "CRM — API coding day 1",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[2]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",  "vibe_date": "2026-04-01", "vibe_hours": 8.0},
    {"vibe_name": "CRM — API coding day 2",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[2]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev2})",  "vibe_date": "2026-04-02", "vibe_hours": 8.0},
    {"vibe_name": "CRM — frontend kickoff",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[3]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev2})",  "vibe_date": "2026-05-05", "vibe_hours": 6.0},
    # Cloud
    {"vibe_name": "Cloud — assessment day 1",      "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[6]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})", "vibe_date": "2026-02-03", "vibe_hours": 8.0},
    {"vibe_name": "Cloud — network design",        "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[7]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev2})", "vibe_date": "2026-03-10", "vibe_hours": 7.0},
    {"vibe_name": "Cloud — lift batch 1 sprint",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[8]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})", "vibe_date": "2026-04-14", "vibe_hours": 8.0},
    # Portal
    {"vibe_name": "Portal — UX interviews",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[11]})","vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_date": "2026-03-05", "vibe_hours": 6.5},
    {"vibe_name": "Portal — wireframe day 1",      "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[11]})","vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_date": "2026-03-12", "vibe_hours": 8.0},
    {"vibe_name": "Portal — auth module start",    "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[13]})","vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_dev})", "vibe_date": "2026-05-06", "vibe_hours": 7.5},
    {"vibe_name": "Portal — QA smoke test",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[12]})","vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_qa})", "vibe_date": "2026-04-28", "vibe_hours": 4.0},
]
time_ids = create_all("vibe_timeentry", time_records)
print(f"  ✓ {len(time_ids)} time entries created")

# ── Level 2: Activity Feed ────────────────────────────────────────────────────
print("Creating activity feed entries...")
feed_records = [
    {"vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_description": "Project kicked off. Team onboarded.",               "vibe_timestamp": "2026-01-15T09:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_description": "BRD approved by stakeholders.",                     "vibe_timestamp": "2026-02-14T14:30:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_description": "Risk: API instability flagged, mitigation started.","vibe_timestamp": "2026-03-20T11:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_description": "Phase 2 delayed by 3 weeks — approved.",           "vibe_timestamp": "2026-04-03T16:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_description": "Cloud readiness assessment complete.",              "vibe_timestamp": "2026-02-28T17:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_description": "VPN issue escalated to infrastructure team.",       "vibe_timestamp": "2026-03-15T10:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_description": "Batch 1 migration started.",                       "vibe_timestamp": "2026-04-20T08:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_description": "Portal project kicked off.",                       "vibe_timestamp": "2026-03-01T09:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_description": "UX prototype approved by Product Owner.",          "vibe_timestamp": "2026-04-15T15:00:00Z"},
    {"vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_description": "SSO issue logged — blocking auth module.",         "vibe_timestamp": "2026-05-10T11:30:00Z"},
]
feed_ids = create_all("vibe_activityfeedentry", feed_records)
print(f"  ✓ {len(feed_ids)} feed entries created")

print("\n=== Seed complete ===")
print(f"  Roles:          {len(role_ids)}")
print(f"  Templates:      {len(tmpl_ids)}")
print(f"  Projects:       {len(project_ids)}")
print(f"  Team members:   {len(team_ids)}")
print(f"  Tasks:          {len(task_ids)}")
print(f"  Budget lines:   {len(budget_ids)}")
print(f"  Risks:          {len(risk_ids)}")
print(f"  Issues:         {len(issue_ids)}")
print(f"  Deliverables:   {len(deliverable_ids)}")
print(f"  Decision logs:  {len(decision_ids)}")
print(f"  Meeting notes:  {len(meeting_ids)}")
print(f"  Time entries:   {len(time_ids)}")
print(f"  Feed entries:   {len(feed_ids)}")
