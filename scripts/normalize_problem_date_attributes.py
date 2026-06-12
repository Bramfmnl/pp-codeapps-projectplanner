import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_plugin_headers, get_token, load_env


PROBLEM_DATE_COLS = [
    ("vibe_project", "vibe_startdate"),
    ("vibe_project", "vibe_enddate"),
    ("vibe_budgetchangerequest", "vibe_daterequested"),
    ("vibe_budgetchangerequest", "vibe_dateresolved"),
    ("vibe_invoice", "vibe_dateissued"),
    ("vibe_invoice", "vibe_duedate"),
    ("vibe_invoice", "vibe_datepaid"),
]


def post_json(url, headers, body):
    data = json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, headers=headers, method="POST", data=data)
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode("utf-8", errors="ignore")


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
            "Content-Type": "application/json",
        }
    )

    url = f"{env}/api/data/v9.2/UpdateAttribute"

    for table, col in PROBLEM_DATE_COLS:
        body = {
            "EntityName": table,
            "MergeLabels": True,
            "Attribute": {
                "@odata.type": "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata",
                "LogicalName": col,
                "SchemaName": col,
                "DisplayName": {
                    "@odata.type": "Microsoft.Dynamics.CRM.Label",
                    "LocalizedLabels": [
                        {
                            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
                            "Label": col,
                            "LanguageCode": 1033,
                        }
                    ],
                },
                "Format": "DateAndTime",
                "DateTimeBehavior": {"Value": "UserLocal"},
            },
        }
        try:
            post_json(url, headers, body)
            print(f"[UPDATE] Normalized datetime behavior: {table}.{col}", flush=True)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="ignore")
            print(f"[WARN] Failed to normalize {table}.{col}: HTTP {exc.code} {detail}", flush=True)
        except Exception as exc:
            print(f"[WARN] Failed to normalize {table}.{col}: {exc}", flush=True)

    print("[DONE] Date normalization pass complete.", flush=True)


if __name__ == "__main__":
    main()
