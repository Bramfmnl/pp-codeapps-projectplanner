import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client, get_plugin_headers, get_token, load_env


DATE_COLUMNS = {
    "vibe_project": ["vibe_startdate", "vibe_enddate"],
    "vibe_projectphase": ["vibe_startdate", "vibe_enddate"],
    "vibe_projectteammember": ["vibe_startdate", "vibe_enddate"],
    "vibe_budgetchangerequest": ["vibe_daterequested", "vibe_dateresolved"],
    "vibe_invoice": ["vibe_dateissued", "vibe_duedate", "vibe_datepaid"],
    "vibe_decisionlog": ["vibe_date"],
    "vibe_deliverable": ["vibe_duedate"],
    "vibe_task": ["vibe_startdate", "vibe_duedate"],
    "vibe_resourceallocation": ["vibe_weekstartdate"],
    "vibe_timeentry": ["vibe_date"],
    "vibe_meetingnote": ["vibe_date"],
}


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
        f"/Attributes(LogicalName='{a}')?$select=LogicalName"
    )
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req):
            return True
    except Exception:
        return False


def main():
    load_env()
    env = os.environ["DATAVERSE_URL"].rstrip("/")
    client = get_client("dv-metadata")
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

    for table, cols in DATE_COLUMNS.items():
        for col in cols:
            print(f"[CHECK] {table}.{col}", flush=True)
            if not attr_exists(env, headers, table, col):
                print(f"[SKIP] Missing: {table}.{col}", flush=True)
                continue

            deleted = False
            try:
                delete_attr(env, headers, table, col)
                deleted = True
                print(f"[DELETE] {table}.{col}", flush=True)
                time.sleep(2)
            except urllib.error.HTTPError as exc:
                body = exc.read().decode("utf-8", errors="ignore")
                print(f"[WARN] Delete failed for {table}.{col}: HTTP {exc.code} {body}", flush=True)
            except Exception as exc:
                print(f"[WARN] Delete failed for {table}.{col}: {exc}", flush=True)

            if not deleted:
                continue

            try:
                client.tables.add_columns(table, {col: "datetime"})
                print(f"[ADD] Recreated datetime: {table}.{col}", flush=True)
            except Exception as exc:
                print(f"[ERROR] Recreate failed for {table}.{col}: {exc}", flush=True)

    print("[DONE] Date column repair pass complete.", flush=True)


if __name__ == "__main__":
    main()
