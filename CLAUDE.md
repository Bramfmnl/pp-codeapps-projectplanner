# Dataverse Workspace

## Environment
- **URL:** https://projectplanner.crm4.dynamics.com
- **Solution:** vibe
- **Publisher Prefix:** vibe
- **PAC Auth Profile:** nonprod

## Repo Layout
- `/solutions/vibe/` — unpacked solution source files (source of truth)
- `/plugins/` — C# Dataverse plugin projects
- `/.dataverse/` — plugin skills, scripts, and templates (committed, no credentials)
- `.env` — local environment config (not committed, gitignored)
- `.vscode/settings.json` — MCP server config (not committed, gitignored)

## Workflows

**Pull from environment to repo:**
```
pac solution export --name vibe --path ./solutions/vibe.zip --managed false
pac solution unpack --zipfile ./solutions/vibe.zip --folder ./solutions/vibe
rm ./solutions/vibe.zip
git add ./solutions/vibe && git commit -m "chore: pull vibe" && git push
```

**Push from repo to environment:**
```
pac solution pack --zipfile ./solutions/vibe.zip --folder ./solutions/vibe
pac solution import --path ./solutions/vibe.zip --environment https://projectplanner.crm4.dynamics.com --async --activate-plugins
rm ./solutions/vibe.zip
```

**Validate after push (using Python SDK):**

```python
from auth import get_client

client = get_client("dv-data")

# Check table exists
info = client.tables.get("<logical_name>")
print(f"[{'PASS' if info else 'FAIL'}] Table '<logical_name>'")

# Check import errors
pages = client.records.get("msdyn_solutionhistory", filter="msdyn_status eq 1",
    select=["msdyn_name", "msdyn_exceptionmessage"], orderby=["msdyn_starttime desc"], top=5)
errors = [e for page in pages for e in page]
print(f"[{'FAIL' if errors else 'PASS'}] {len(errors)} failed import(s)")
```

## Metadata Conventions
- Table prefix: `vibe_` (from `.env`; also visible in `solutions/vibe/Other/Solution.xml`)
- All GUIDs in form and view XML must be unique — generate with `python -c "import uuid; print(str(uuid.uuid4()).upper())"`
- Business rules are stored as JSON in `Entities/<table>/Workflows/`

## C# Plugins
- Projects live in `/plugins/<PluginName>/`
- All assemblies must be strong-named (`.snk` key file, gitignored)
- Register via `scripts/register_plugin.py` (first time) or `pac plugin push --pluginId` (updates)
- See `/plugins/README.md` for the full build and registration steps
