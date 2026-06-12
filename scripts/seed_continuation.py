import os, sys
sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client

client = get_client("dv-data")

def create_all(table, records):
    return [client.records.create(table, r) for r in records]

print("=== Seed continuation (risks onwards) ===\n")

# IDs from the partial seed run
crm_id    = "a4f1196b-9b66-f111-ab0d-7ced8d44e4b1"
cloud_id  = "a5f1196b-9b66-f111-ab0d-7ced8d44e4b1"
portal_id = "a6f1196b-9b66-f111-ab0d-7ced8d44e4b1"

crm_pm      = "9bc11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Sophie Claes
crm_dev1    = "9cc11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Liam Janssen
crm_dev2    = "9dc11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Fatima El-Amin
crm_ba      = "9ec11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Petra Vos
crm_sponsor = "9fc11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Marc Dubois
cloud_pm    = "a0c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Ravi Sharma
cloud_dev1  = "a1c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Ingrid Larsen
cloud_dev2  = "a2c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Thomas Braun
cloud_sc    = "a3c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Amira Nkosi
portal_pm   = "a4c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Elena Popescu
portal_dev  = "a5c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Kwame Osei
portal_ux   = "a6c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Nora Fitzgerald
portal_qa   = "a7c11b71-9b66-f111-ab0d-7ced8d44e4b1"  # Jun Watanabe

task_ids = [
    "eac11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 0  Requirements gathering
    "ebc11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 1  Data model design
    "ecc11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 2  API development - Phase 1
    "edc11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 3  Frontend build
    "eec11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 4  Integration testing
    "efc11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 5  UAT & sign-off
    "f0c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 6  Cloud readiness assessment
    "f1c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 7  Network architecture design
    "f2c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 8  Lift & shift — batch 1
    "f3c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 9  Lift & shift — batch 2
    "f4c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 10 Performance tuning
    "f5c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 11 UX research & wireframes
    "f6c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 12 Design system setup
    "f7c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 13 Authentication module
    "f8c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 14 Dashboard & reporting
    "f9c11b71-9b66-f111-ab0d-7ced8d44e4b1",  # 15 Accessibility audit
]

# ── Risks ─────────────────────────────────────────────────────────────────────
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

# ── Issues ────────────────────────────────────────────────────────────────────
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

# ── Deliverables ──────────────────────────────────────────────────────────────
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

# ── Decision Logs ─────────────────────────────────────────────────────────────
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

# ── Meeting Notes ─────────────────────────────────────────────────────────────
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

# ── Time Entries ──────────────────────────────────────────────────────────────
print("Creating time entries...")
time_records = [
    {"vibe_name": "CRM — requirements review",     "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[0]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_ba})",    "vibe_date": "2026-01-20", "vibe_hours": 8.0},
    {"vibe_name": "CRM — data model review",       "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[1]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",  "vibe_date": "2026-02-15", "vibe_hours": 7.5},
    {"vibe_name": "CRM — API coding day 1",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[2]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev1})",  "vibe_date": "2026-04-01", "vibe_hours": 8.0},
    {"vibe_name": "CRM — API coding day 2",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[2]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev2})",  "vibe_date": "2026-04-02", "vibe_hours": 8.0},
    {"vibe_name": "CRM — frontend kickoff",        "vibe_projectid@odata.bind": f"/vibe_projects({crm_id})",    "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[3]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({crm_dev2})",  "vibe_date": "2026-05-05", "vibe_hours": 6.0},
    {"vibe_name": "Cloud — assessment day 1",      "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[6]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})", "vibe_date": "2026-02-03", "vibe_hours": 8.0},
    {"vibe_name": "Cloud — network design",        "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[7]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev2})", "vibe_date": "2026-03-10", "vibe_hours": 7.0},
    {"vibe_name": "Cloud — lift batch 1 sprint",   "vibe_projectid@odata.bind": f"/vibe_projects({cloud_id})",  "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[8]})",  "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({cloud_dev1})", "vibe_date": "2026-04-14", "vibe_hours": 8.0},
    {"vibe_name": "Portal — UX interviews",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[11]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_date": "2026-03-05", "vibe_hours": 6.5},
    {"vibe_name": "Portal — wireframe day 1",      "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[11]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_ux})", "vibe_date": "2026-03-12", "vibe_hours": 8.0},
    {"vibe_name": "Portal — auth module start",    "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[13]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_dev})", "vibe_date": "2026-05-06", "vibe_hours": 7.5},
    {"vibe_name": "Portal — QA smoke test",        "vibe_projectid@odata.bind": f"/vibe_projects({portal_id})", "vibe_taskid@odata.bind": f"/vibe_tasks({task_ids[12]})", "vibe_teammemberid@odata.bind": f"/vibe_projectteammembers({portal_qa})", "vibe_date": "2026-04-28", "vibe_hours": 4.0},
]
time_ids = create_all("vibe_timeentry", time_records)
print(f"  ✓ {len(time_ids)} time entries created")

# ── Activity Feed ─────────────────────────────────────────────────────────────
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

print("\n=== Continuation seed complete ===")
print(f"  Risks:          {len(risk_ids)}")
print(f"  Issues:         {len(issue_ids)}")
print(f"  Deliverables:   {len(deliverable_ids)}")
print(f"  Decision logs:  {len(decision_ids)}")
print(f"  Meeting notes:  {len(meeting_ids)}")
print(f"  Time entries:   {len(time_ids)}")
print(f"  Feed entries:   {len(feed_ids)}")
