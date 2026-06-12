import json
import os
import sys
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_plugin_headers, get_token, load_env


TABLES = [
    "vibe_projectrole",
    "vibe_projecttemplate",
    "vibe_phasetemplate",
    "vibe_roletemplate",
    "vibe_tasktemplate",
    "vibe_project",
    "vibe_projectphase",
    "vibe_projectteammember",
    "vibe_budgetline",
    "vibe_budgetchangerequest",
    "vibe_invoice",
    "vibe_risk",
    "vibe_issue",
    "vibe_decisionlog",
    "vibe_deliverable",
    "vibe_activityfeedentry",
    "vibe_task",
    "vibe_resourceallocation",
    "vibe_timeentry",
    "vibe_meetingnote",
    "vibe_taskchecklistitem",
    "vibe_meetingattendee",
    "vibe_meetingactionitem",
]


def fetch_json(url, headers):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def main():
    load_env()
    env = os.environ["DATAVERSE_URL"].rstrip("/")
    token = get_token()
    headers = get_plugin_headers("dv-metadata", token)
    headers.update(
        {
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Accept": "application/json",
        }
    )

    print("=== TABLE PRESENCE ===", flush=True)
    for t in TABLES:
        encoded = urllib.parse.quote(t)
        url = f"{env}/api/data/v9.2/EntityDefinitions(LogicalName='{encoded}')?$select=LogicalName"
        try:
            payload = fetch_json(url, headers)
            print(f"[OK] {payload.get('LogicalName')}", flush=True)
        except Exception as exc:
            print(f"[MISSING] {t}: {exc}", flush=True)

    print("\n=== LOOKUP COLUMNS (CURRENT) ===", flush=True)
    key_tables = [
        "vibe_project",
        "vibe_budgetchangerequest",
        "vibe_invoice",
        "vibe_decisionlog",
        "vibe_projectteammember",
    ]
    for t in key_tables:
        encoded = urllib.parse.quote(t)
        url = (
            f"{env}/api/data/v9.2/EntityDefinitions(LogicalName='{encoded}')"
            "?$select=LogicalName&$expand=Attributes($select=LogicalName,AttributeType)"
        )
        payload = fetch_json(url, headers)
        lookups = [
            a.get("LogicalName")
            for a in payload.get("Attributes", [])
            if a.get("AttributeType") == "Lookup"
        ]
        print(f"{t}: {', '.join(sorted(lookups)) if lookups else '(none)'}", flush=True)


if __name__ == "__main__":
    main()
