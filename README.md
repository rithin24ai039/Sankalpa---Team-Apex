# V2V Visionaries — Team Apex

Research workspace for the integrated road-safety and cooperative collision-avoidance prototype.

**Live temporary-input test console:** https://v2v-visionaries-scenario-lab.vercel.app/

## What's in this repository

- **`web-console/`** — static browser-based Scenario Lab. Enter temporary vehicle states, compare a local observation with a versioned V2V test packet, inspect closest-approach geometry, and run built-in checks.
- **`docs/`** — Unity simulation audit, V2V message draft, baseline risk-engine assumptions and deployment notes.

The Unity island-city simulation was supplied as a separate project archive in the task. Its audit is recorded in `docs/SIMULATION_AUDIT.md`; the complete cleaned Unity project is included in the downloadable source bundle supplied with this task. The browser console is not a Unity plug-in and does not connect to the Unity runtime.

## Run the console locally

Open `web-console/index.html` in a modern browser. No build process, API key, server, or database is required. To serve it over HTTP:

```bash
cd web-console
python -m http.server 8080
```

Visit `http://localhost:8080`.

## Run automated tests

Requires Node.js 18 or newer:

```bash
cd web-console
npm test
```

## Data handling

Test inputs are temporary browser values. The recent event log is kept in the current tab's `sessionStorage` and can be exported to JSON. There is no account, backend or Supabase database because this workflow is for disposable test fixtures rather than persistent shared records.

## Research boundary

The console calculates a constant-velocity closest-point-of-approach baseline from manually entered values. It is not a camera, YOLO, tracking, trajectory-learning or live UDP implementation. Risk bands are explicit geometric heuristics, not calibrated probabilities. This is not a certified automotive safety system and must not be used for real driving decisions.

## Deployment note

The current Vercel production deployment was uploaded directly from the committed static files. The GitHub integration is not connected to this Vercel project yet, so pushing later Git commits will **not** automatically redeploy it until GitHub is connected in Vercel Project Settings.
