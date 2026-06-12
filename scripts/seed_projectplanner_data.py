import os
import sys

sys.path.insert(0, os.path.join(os.getcwd(), "scripts"))
from auth import get_client, load_env


def q(v: str) -> str:
    return v.replace("'", "''")


def first_record(client, table, filter_expr, select_cols):
    pages = client.records.get(table, filter=filter_expr, select=select_cols, top=1)
    for page in pages:
        if page:
            return page[0]
    return None


def ensure_named_record(client, table, name_field, name_value, payload):
    existing = first_record(
        client,
        table,
        f"{name_field} eq '{q(name_value)}'",
        [name_field, f"{table}id"],
    )
    if existing:
        rec_id = existing.get(f"{table}id")
        print(f"[SKIP] {table}: {name_value} ({rec_id})", flush=True)
        return rec_id
    rec_id = client.records.create(table, payload)
    print(f"[CREATE] {table}: {name_value} ({rec_id})", flush=True)
    return rec_id


def bind(entity_set, record_id):
    return f"/{entity_set}({record_id})"


def main():
    load_env()
    client = get_client("dv-data")

    # Resolve entity set names once.
    tables = {
        "role": client.tables.get("vibe_projectrole")["entity_set_name"],
        "template": client.tables.get("vibe_projecttemplate")["entity_set_name"],
        "phase_template": client.tables.get("vibe_phasetemplate")["entity_set_name"],
        "task_template": client.tables.get("vibe_tasktemplate")["entity_set_name"],
    }

    # 1) Seed default project roles.
    roles = [
        ("Project Manager", "Leads planning and delivery.", 150, False),
        ("Team Member", "Executes assigned tasks.", 100, False),
        ("Stakeholder", "Read-only stakeholder participant.", 0, True),
    ]
    role_ids = {}
    for name, desc, rate, is_stakeholder in roles:
        role_ids[name] = ensure_named_record(
            client,
            "vibe_projectrole",
            "vibe_name",
            name,
            {
                "vibe_name": name,
                "vibe_description": desc,
                "vibe_defaulthourlyrate": rate,
                "vibe_isstakeholderrole": is_stakeholder,
            },
        )

    # 2) Seed one standard project template.
    template_name = "Standard Implementation"
    template_id = ensure_named_record(
        client,
        "vibe_projecttemplate",
        "vibe_name",
        template_name,
        {
            "vibe_name": template_name,
            "vibe_description": "Default template for implementation projects.",
            "vibe_isactive": True,
        },
    )

    # 3) Seed phase templates under template.
    phase_defs = [
        ("Kickoff", 1, 7),
        ("Design", 2, 14),
        ("Build", 3, 30),
        ("Test", 4, 14),
        ("Go-Live", 5, 7),
    ]
    phase_ids = {}
    for phase_name, order, duration in phase_defs:
        existing = first_record(
            client,
            "vibe_phasetemplate",
            f"vibe_name eq '{q(phase_name)}' and _vibe_projecttemplateid_value eq {template_id}",
            ["vibe_name", "vibe_phasetemplateid"],
        )
        if existing:
            phase_id = existing["vibe_phasetemplateid"]
            print(f"[SKIP] vibe_phasetemplate: {phase_name} ({phase_id})", flush=True)
        else:
            phase_id = client.records.create(
                "vibe_phasetemplate",
                {
                    "vibe_name": phase_name,
                    "vibe_order": order,
                    "vibe_defaultdurationdays": duration,
                    "vibe_projecttemplateid@odata.bind": bind(tables["template"], template_id),
                },
            )
            print(f"[CREATE] vibe_phasetemplate: {phase_name} ({phase_id})", flush=True)
        phase_ids[phase_name] = phase_id

    # 4) Seed role templates.
    role_template_defs = [
        ("Project Manager Slot", "Project Manager", 1),
        ("Team Member Slot", "Team Member", 3),
        ("Stakeholder Slot", "Stakeholder", 2),
    ]
    for rt_name, role_name, headcount in role_template_defs:
        existing = first_record(
            client,
            "vibe_roletemplate",
            f"vibe_name eq '{q(rt_name)}' and _vibe_projecttemplateid_value eq {template_id}",
            ["vibe_name", "vibe_roletemplateid"],
        )
        if existing:
            print(f"[SKIP] vibe_roletemplate: {rt_name} ({existing['vibe_roletemplateid']})", flush=True)
            continue
        rec_id = client.records.create(
            "vibe_roletemplate",
            {
                "vibe_name": rt_name,
                "vibe_projecttemplateid@odata.bind": bind(tables["template"], template_id),
                "vibe_projectroleid@odata.bind": bind(tables["role"], role_ids[role_name]),
                "vibe_suggestedheadcount": headcount,
            },
        )
        print(f"[CREATE] vibe_roletemplate: {rt_name} ({rec_id})", flush=True)

    # 5) Seed task templates.
    task_defs = [
        ("Project Charter", "Kickoff", 8, 100000001, "Project Manager", 1),
        ("Requirements Workshop", "Design", 16, 100000002, "Project Manager", 1),
        ("Configure Core Features", "Build", 40, 100000002, "Team Member", 1),
        ("System Integration Test", "Test", 24, 100000002, "Team Member", 1),
        ("Cutover Checklist", "Go-Live", 12, 100000003, "Project Manager", 1),
    ]
    for task_name, phase_name, hours, priority, role_name, order in task_defs:
        phase_id = phase_ids[phase_name]
        existing = first_record(
            client,
            "vibe_tasktemplate",
            f"vibe_name eq '{q(task_name)}' and _vibe_phasetemplateid_value eq {phase_id}",
            ["vibe_name", "vibe_tasktemplateid"],
        )
        if existing:
            print(f"[SKIP] vibe_tasktemplate: {task_name} ({existing['vibe_tasktemplateid']})", flush=True)
            continue
        rec_id = client.records.create(
            "vibe_tasktemplate",
            {
                "vibe_name": task_name,
                "vibe_phasetemplateid@odata.bind": bind(tables["phase_template"], phase_id),
                "vibe_defaultestimatedhours": hours,
                "vibe_defaultpriority": priority,
                "vibe_defaultroleid@odata.bind": bind(tables["role"], role_ids[role_name]),
                "vibe_order": order,
            },
        )
        print(f"[CREATE] vibe_tasktemplate: {task_name} ({rec_id})", flush=True)

    print("[DONE] Reference data seeded.", flush=True)


if __name__ == "__main__":
    main()
