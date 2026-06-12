import os
import sys
import time
from enum import IntEnum

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client, load_env


class Priority(IntEnum):
    LOW = 100000000
    MEDIUM = 100000001
    HIGH = 100000002
    CRITICAL = 100000003


class ApprovalStatus(IntEnum):
    NOT_REQUIRED = 100000000
    PENDING = 100000001
    APPROVED = 100000002
    REJECTED = 100000003


class BudgetCategory(IntEnum):
    LICENSES = 100000000
    INFRASTRUCTURE = 100000001
    TRAVEL = 100000002
    TRAINING = 100000003
    EXTERNAL_SERVICES = 100000004
    OTHER = 100000005


class BudgetLineStatus(IntEnum):
    PLANNED = 100000000
    APPROVED = 100000001
    SPENT = 100000002


class RiskScale(IntEnum):
    ONE = 100000000
    TWO = 100000001
    THREE = 100000002
    FOUR = 100000003
    FIVE = 100000004


class RiskStatus(IntEnum):
    OPEN = 100000000
    MITIGATING = 100000001
    CLOSED = 100000002
    ACCEPTED = 100000003


class IssueSeverity(IntEnum):
    LOW = 100000000
    MEDIUM = 100000001
    HIGH = 100000002
    CRITICAL = 100000003


class IssueStatus(IntEnum):
    OPEN = 100000000
    IN_PROGRESS = 100000001
    RESOLVED = 100000002
    CLOSED = 100000003


class DeliverableStatus(IntEnum):
    DRAFT = 100000000
    IN_REVIEW = 100000001
    APPROVED = 100000002
    DELIVERED = 100000003


class ActivityEventType(IntEnum):
    STATUS_CHANGE = 100000000
    TEAM_CHANGE = 100000001
    PHASE_COMPLETED = 100000002
    BUDGET_THRESHOLD = 100000003
    RISK_CREATED = 100000004
    MILESTONE_REACHED = 100000005
    DELIVERABLE_SUBMITTED = 100000006
    DECISION_MADE = 100000007


class TaskStatus(IntEnum):
    TODO = 100000000
    IN_PROGRESS = 100000001
    BLOCKED = 100000002
    DONE = 100000003


def ensure_table(client, schema_name, columns, solution, primary_column, display_name):
    existing = client.tables.get(schema_name)
    if existing:
        print(f"[SKIP] Table exists: {schema_name}", flush=True)
        return existing

    for attempt in range(1, 6):
        try:
            created = client.tables.create(
                schema_name,
                columns,
                solution=solution,
                primary_column=primary_column,
                display_name=display_name,
            )
            print(f"[CREATE] Table created: {schema_name}", flush=True)
            return created
        except Exception as exc:
            message = str(exc)
            transient_markers = [
                "entitycustomization",
                "another solution at the same time",
                "0x80040216",
                "0x80060891",
            ]
            if any(marker in message.lower() for marker in transient_markers) and attempt < 5:
                delay = 10 * attempt
                print(
                    f"[RETRY] Table {schema_name} attempt {attempt} failed due to metadata lock/cache: {message}",
                    flush=True,
                )
                print(f"[RETRY] Waiting {delay}s before retry...", flush=True)
                time.sleep(delay)
                existing_after_wait = client.tables.get(schema_name)
                if existing_after_wait:
                    print(f"[SKIP] Table exists after wait: {schema_name}", flush=True)
                    return existing_after_wait
                continue
            raise


def ensure_lookup(client, referencing_table, lookup_field_name, referenced_table, display_name, solution):
    for attempt in range(1, 6):
        try:
            result = client.tables.create_lookup_field(
                referencing_table=referencing_table,
                lookup_field_name=lookup_field_name,
                referenced_table=referenced_table,
                display_name=display_name,
                solution=solution,
            )
            print(
                f"[CREATE] Lookup created: {referencing_table}.{lookup_field_name} -> {referenced_table}",
                flush=True,
            )
            return result
        except Exception as exc:
            message = str(exc)
            if "already exists" in message.lower() or "0x80040237" in message.lower():
                print(
                    f"[SKIP] Lookup already exists: {referencing_table}.{lookup_field_name}",
                    flush=True,
                )
                return None
            transient_markers = [
                "entitycustomization",
                "another solution at the same time",
                "0x80040216",
                "0x80060891",
                "failure in generation filtered",
            ]
            if any(marker in message.lower() for marker in transient_markers) and attempt < 5:
                delay = 10 * attempt
                print(
                    f"[RETRY] Lookup {referencing_table}.{lookup_field_name} attempt {attempt} failed: {message}",
                    flush=True,
                )
                print(f"[RETRY] Waiting {delay}s before retry...", flush=True)
                time.sleep(delay)
                continue
            raise


def main():
    load_env()
    dataverse_url = os.environ.get("DATAVERSE_URL", "").rstrip("/")
    solution = os.environ.get("SOLUTION_NAME", "").strip()

    if not dataverse_url:
        raise RuntimeError("DATAVERSE_URL is missing in .env")
    if not solution:
        raise RuntimeError("SOLUTION_NAME is missing in .env")

    print(f"[INFO] Target environment: {dataverse_url}", flush=True)
    print(f"[INFO] Target solution: {solution}", flush=True)
    print("[INFO] Assumption: proceeding with configured environment/solution because user is offline.", flush=True)

    client = get_client("dv-metadata")

    batches = [
        [
            ("vibe_projectrole", "Project Role", "vibe_name", {
                "vibe_description": "text",
                "vibe_defaulthourlyrate": "money",
                "vibe_isstakeholderrole": "bool",
            }),
            ("vibe_projecttemplate", "Project Template", "vibe_name", {
                "vibe_description": "text",
                "vibe_isactive": "bool",
            }),
        ],
        [
            ("vibe_phasetemplate", "Phase Template", "vibe_name", {
                "vibe_order": "int",
                "vibe_defaultdurationdays": "int",
            }),
            ("vibe_roletemplate", "Role Template", "vibe_name", {
                "vibe_suggestedheadcount": "int",
            }),
        ],
        [
            ("vibe_tasktemplate", "Task Template", "vibe_name", {
                "vibe_defaultestimatedhours": "decimal",
                "vibe_defaultpriority": Priority,
                "vibe_order": "int",
            }),
            ("vibe_project", "Project", "vibe_name", {
                "vibe_description": "text",
                "vibe_startdate": "date",
                "vibe_enddate": "date",
                "vibe_totalbudget": "money",
                "vibe_budgetspent": "money",
                "vibe_budgetremaining": "money",
                "vibe_sharepointfolderurl": "string",
            }),
        ],
        [
            ("vibe_projectphase", "Project Phase", "vibe_name", {
                "vibe_order": "int",
                "vibe_startdate": "date",
                "vibe_enddate": "date",
                "vibe_requiresapproval": "bool",
                "vibe_approvalstatus": ApprovalStatus,
            }),
            ("vibe_projectteammember", "Project Team Member", "vibe_name", {
                "vibe_hourlyrate": "money",
                "vibe_allocationpercentage": "int",
                "vibe_startdate": "date",
                "vibe_enddate": "date",
                "vibe_isactive": "bool",
            }),
            ("vibe_budgetline", "Budget Line", "vibe_name", {
                "vibe_category": BudgetCategory,
                "vibe_description": "string",
                "vibe_estimatedamount": "money",
                "vibe_actualamount": "money",
                "vibe_budgetlinestatus": BudgetLineStatus,
            }),
            ("vibe_budgetchangerequest", "Budget Change Request", "vibe_name", {
                "vibe_requestedamount": "money",
                "vibe_justification": "text",
                "vibe_daterequested": "date",
                "vibe_dateresolved": "date",
            }),
            ("vibe_invoice", "Invoice", "vibe_invoicenumber", {
                "vibe_amount": "money",
                "vibe_dateissued": "date",
                "vibe_duedate": "date",
                "vibe_datepaid": "date",
                "vibe_notes": "string",
            }),
            ("vibe_risk", "Risk", "vibe_title", {
                "vibe_description": "text",
                "vibe_probability": RiskScale,
                "vibe_impact": RiskScale,
                "vibe_riskscore": "int",
                "vibe_mitigationplan": "text",
                "vibe_riskstatus": RiskStatus,
            }),
            ("vibe_issue", "Issue", "vibe_title", {
                "vibe_description": "text",
                "vibe_severity": IssueSeverity,
                "vibe_issuestatus": IssueStatus,
                "vibe_resolution": "text",
                "vibe_impactonbudget": "money",
                "vibe_impactontimelinedays": "int",
            }),
            ("vibe_decisionlog", "Decision Log", "vibe_title", {
                "vibe_description": "text",
                "vibe_rationale": "text",
                "vibe_date": "date",
            }),
            ("vibe_deliverable", "Deliverable", "vibe_name", {
                "vibe_duedate": "date",
                "vibe_deliverablestatus": DeliverableStatus,
                "vibe_documentlink": "string",
            }),
            ("vibe_activityfeedentry", "Activity Feed Entry", "vibe_name", {
                "vibe_timestamp": "datetime",
                "vibe_eventtype": ActivityEventType,
                "vibe_description": "string",
                "vibe_relatedrecordurl": "string",
            }),
        ],
        [
            ("vibe_task", "Task", "vibe_name", {
                "vibe_taskstatus": TaskStatus,
                "vibe_priority": Priority,
                "vibe_startdate": "date",
                "vibe_duedate": "date",
                "vibe_estimatedhours": "decimal",
                "vibe_actualhours": "decimal",
                "vibe_estimatedcost": "money",
                "vibe_actualcost": "money",
                "vibe_description": "text",
                "vibe_ismilestone": "bool",
            }),
            ("vibe_resourceallocation", "Resource Allocation", "vibe_name", {
                "vibe_weekstartdate": "date",
                "vibe_plannedhours": "decimal",
                "vibe_actualhours": "decimal",
                "vibe_notes": "string",
            }),
            ("vibe_timeentry", "Time Entry", "vibe_name", {
                "vibe_date": "date",
                "vibe_hours": "decimal",
                "vibe_description": "string",
            }),
            ("vibe_meetingnote", "Meeting Note", "vibe_title", {
                "vibe_date": "date",
                "vibe_notes": "text",
            }),
        ],
        [
            ("vibe_taskchecklistitem", "Task Checklist Item", "vibe_title", {
                "vibe_iscompleted": "bool",
                "vibe_order": "int",
            }),
            ("vibe_meetingattendee", "Meeting Attendee", "vibe_name", {}),
            ("vibe_meetingactionitem", "Meeting Action Item", "vibe_description", {
                "vibe_iscompleted": "bool",
            }),
        ],
    ]

    for i, batch in enumerate(batches, start=1):
        print(f"[INFO] Creating batch {i} ({len(batch)} tables)...", flush=True)
        for schema_name, display_name, primary_column, columns in batch:
            ensure_table(
                client,
                schema_name=schema_name,
                columns=columns,
                solution=solution,
                primary_column=primary_column,
                display_name=display_name,
            )
        print(f"[INFO] Batch {i} complete. Waiting for metadata propagation...", flush=True)
        time.sleep(10)

    lookup_defs = [
        ("vibe_phasetemplate", "vibe_projecttemplateid", "vibe_projecttemplate", "Project Template"),
        ("vibe_roletemplate", "vibe_projecttemplateid", "vibe_projecttemplate", "Project Template"),
        ("vibe_roletemplate", "vibe_projectroleid", "vibe_projectrole", "Project Role"),
        ("vibe_tasktemplate", "vibe_phasetemplateid", "vibe_phasetemplate", "Phase Template"),
        ("vibe_tasktemplate", "vibe_defaultroleid", "vibe_projectrole", "Default Role"),
        ("vibe_project", "vibe_clientid", "account", "Client"),
        ("vibe_project", "vibe_ownerid", "systemuser", "Owner"),
        ("vibe_project", "vibe_templatesourceid", "vibe_projecttemplate", "Template Source"),
        ("vibe_projectphase", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_projectteammember", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_projectteammember", "vibe_contactid", "contact", "Contact"),
        ("vibe_projectteammember", "vibe_userid", "systemuser", "User"),
        ("vibe_projectteammember", "vibe_roleid", "vibe_projectrole", "Role"),
        ("vibe_budgetline", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_budgetline", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_budgetchangerequest", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_budgetchangerequest", "vibe_requestedbyid", "systemuser", "Requested By"),
        ("vibe_budgetchangerequest", "vibe_approvedbyid", "systemuser", "Approved By"),
        ("vibe_invoice", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_risk", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_risk", "vibe_ownerid", "vibe_projectteammember", "Owner"),
        ("vibe_risk", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_issue", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_issue", "vibe_reportedbyid", "vibe_projectteammember", "Reported By"),
        ("vibe_issue", "vibe_assignedtoid", "vibe_projectteammember", "Assigned To"),
        ("vibe_issue", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_decisionlog", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_decisionlog", "vibe_madebyid", "vibe_projectteammember", "Made By"),
        ("vibe_decisionlog", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_deliverable", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_deliverable", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_deliverable", "vibe_responsibleid", "vibe_projectteammember", "Responsible"),
        ("vibe_activityfeedentry", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_activityfeedentry", "vibe_actorid", "systemuser", "Actor"),
        ("vibe_task", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_task", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_task", "vibe_assignedtoid", "vibe_projectteammember", "Assigned To"),
        ("vibe_task", "vibe_predecessorid", "vibe_task", "Predecessor"),
        ("vibe_resourceallocation", "vibe_projectteammemberid", "vibe_projectteammember", "Project Team Member"),
        ("vibe_resourceallocation", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_timeentry", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_timeentry", "vibe_taskid", "vibe_task", "Task"),
        ("vibe_timeentry", "vibe_teammemberid", "vibe_projectteammember", "Team Member"),
        ("vibe_meetingnote", "vibe_projectid", "vibe_project", "Project"),
        ("vibe_meetingnote", "vibe_phaseid", "vibe_projectphase", "Phase"),
        ("vibe_taskchecklistitem", "vibe_taskid", "vibe_task", "Task"),
        ("vibe_meetingattendee", "vibe_meetingnoteid", "vibe_meetingnote", "Meeting Note"),
        ("vibe_meetingattendee", "vibe_teammemberid", "vibe_projectteammember", "Team Member"),
        ("vibe_meetingactionitem", "vibe_meetingnoteid", "vibe_meetingnote", "Meeting Note"),
        ("vibe_meetingactionitem", "vibe_assignedtoid", "vibe_projectteammember", "Assigned To"),
        ("vibe_meetingactionitem", "vibe_linkedtaskid", "vibe_task", "Linked Task"),
    ]

    print("[INFO] Creating lookups...", flush=True)
    lookup_failures = []
    for referencing_table, lookup_field_name, referenced_table, display_name in lookup_defs:
        try:
            ensure_lookup(
                client,
                referencing_table=referencing_table,
                lookup_field_name=lookup_field_name,
                referenced_table=referenced_table,
                display_name=display_name,
                solution=solution,
            )
        except Exception as exc:
            lookup_failures.append((referencing_table, lookup_field_name, str(exc)))
            print(
                f"[ERROR] Lookup failed and will be reported: {referencing_table}.{lookup_field_name}: {exc}",
                flush=True,
            )

    if lookup_failures:
        print("[WARN] Some lookups failed:", flush=True)
        for table, lookup, err in lookup_failures:
            print(f"  - {table}.{lookup}: {err}", flush=True)
        raise RuntimeError(f"{len(lookup_failures)} lookup(s) failed")

    print("[DONE] Metadata execution complete for all planned tables and lookups.", flush=True)
    print(
        "[NOTE] Status Reason/statecode mappings and global option sets may require a follow-up Web API pass for advanced metadata control.",
        flush=True,
    )


if __name__ == "__main__":
    main()
