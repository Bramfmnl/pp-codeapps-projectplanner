import json
import os
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client, get_plugin_headers, get_token, load_env
from PowerPlatform.Dataverse.models.labels import Label, LocalizedLabel
from PowerPlatform.Dataverse.models.relationship import (
    LookupAttributeMetadata,
    OneToManyRelationshipMetadata,
)


DATE_FIXES = [
    ("vibe_project", "vibe_enddate"),
    ("vibe_budgetchangerequest", "vibe_daterequested"),
    ("vibe_invoice", "vibe_dateissued"),
    ("vibe_decisionlog", "vibe_date"),
]


LOOKUPS = [
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


def fetch_json(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def delete_attr(env, headers, table, attr):
    t = urllib.parse.quote(table)
    a = urllib.parse.quote(attr)
    url = f"{env}/api/data/v9.2/EntityDefinitions(LogicalName='{t}')/Attributes(LogicalName='{a}')"
    req = urllib.request.Request(url, headers=headers, method="DELETE")
    with urllib.request.urlopen(req):
        return


def attr_exists(env, headers, table, attr):
    t = urllib.parse.quote(table)
    a = urllib.parse.quote(attr)
    url = (
        f"{env}/api/data/v9.2/EntityDefinitions(LogicalName='{t}')"
        f"/Attributes(LogicalName='{a}')?$select=LogicalName,AttributeType"
    )
    try:
        payload = fetch_json(url, headers)
        return payload.get("LogicalName") == attr
    except Exception:
        return False


def relationship_schema_name(table, lookup):
    base = f"vibe_rel_{table[5:]}_{lookup[5:]}"
    return base[:100]


def ensure_systemuser_lookup(client, table, lookup, display_name, solution):
    lookup_meta = LookupAttributeMetadata(
        schema_name=lookup,
        display_name=Label(
            localized_labels=[LocalizedLabel(label=display_name, language_code=1033)]
        ),
    )
    rel = OneToManyRelationshipMetadata(
        schema_name=relationship_schema_name(table, lookup),
        referenced_entity="systemuser",
        referencing_entity=table,
        referenced_attribute="systemuserid",
    )
    return client.tables.create_one_to_many_relationship(
        lookup=lookup_meta,
        relationship=rel,
        solution=solution,
    )


def main():
    load_env()
    env = os.environ["DATAVERSE_URL"].rstrip("/")
    solution = os.environ["SOLUTION_NAME"]
    token = get_token()
    headers = get_plugin_headers("dv-metadata", token)
    headers.update(
        {
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "MSCRM.SolutionUniqueName": solution,
        }
    )
    client = get_client("dv-metadata")

    print("[STEP] Repairing problematic date columns...", flush=True)
    for table, col in DATE_FIXES:
        if not attr_exists(env, headers, table, col):
            print(f"[SKIP] Date column missing unexpectedly: {table}.{col}", flush=True)
            continue
        try:
            delete_attr(env, headers, table, col)
            time.sleep(2)
            client.tables.add_columns(table, {col: "datetime"})
            print(f"[FIX] Recreated as datetime: {table}.{col}", flush=True)
        except Exception as exc:
            print(f"[WARN] Date fix skipped for {table}.{col}: {exc}", flush=True)

    print("[STEP] Ensuring all required lookups...", flush=True)
    failures = []
    for table, lookup, ref, label in LOOKUPS:
        if attr_exists(env, headers, table, lookup):
            print(f"[SKIP] Lookup exists: {table}.{lookup}", flush=True)
            continue
        for attempt in range(1, 5):
            try:
                if ref == "systemuser":
                    ensure_systemuser_lookup(client, table, lookup, label, solution)
                else:
                    client.tables.create_lookup_field(
                        referencing_table=table,
                        lookup_field_name=lookup,
                        referenced_table=ref,
                        display_name=label,
                        solution=solution,
                    )
                print(f"[CREATE] Lookup created: {table}.{lookup} -> {ref}", flush=True)
                break
            except Exception as exc:
                msg = str(exc)
                if "already exists" in msg.lower() or "not unique within an entity" in msg.lower():
                    print(f"[SKIP] Lookup already present by metadata: {table}.{lookup}", flush=True)
                    break
                if attempt < 4 and (
                    "entitycustomization" in msg.lower()
                    or "another solution at the same time" in msg.lower()
                    or "failure in generation filtered" in msg.lower()
                ):
                    wait = 10 * attempt
                    print(f"[RETRY] {table}.{lookup} after transient error: {msg}", flush=True)
                    time.sleep(wait)
                    continue
                failures.append((table, lookup, msg))
                print(f"[FAIL] {table}.{lookup}: {msg}", flush=True)
                break

    if failures:
        print("[SUMMARY] Remaining lookup failures:", flush=True)
        for t, l, m in failures:
            print(f"  - {t}.{l}: {m}", flush=True)
        raise RuntimeError(f"{len(failures)} lookup(s) still failed")

    print("[DONE] All required lookups ensured.", flush=True)


if __name__ == "__main__":
    main()
