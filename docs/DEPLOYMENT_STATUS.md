# Deployment Status

- Project: `v2v-visionaries-scenario-lab`
- Production URL: https://v2v-visionaries-scenario-lab.vercel.app/
- Hosting: Vercel static deployment
- Database: none required for temporary manual test fixtures
- Inputs: browser state; the current tab's event log uses `sessionStorage`

## Current deployment boundary

The production deployment was created directly from static source files. The Vercel Git integration was not connected because the connected Vercel team does not yet have the GitHub integration installed. Therefore, **future commits to GitHub do not currently trigger automatic Vercel deployments**.

To enable automatic deployments later:
1. Install/authorize the Vercel GitHub integration for the GitHub account that owns `rithin24ai039/Sankalpa---Team-Apex`.
2. Connect the repository in Vercel project settings (or create a Git-linked Vercel project).
3. Select `root` as the production branch and `web-console` as the root directory if using that folder as the deploy root.
4. Push a test commit and confirm that Vercel creates a new deployment.

## Safety and implementation boundary

This is a research scenario harness. It does not access a camera, run YOLO, maintain real vehicle tracks, connect to Unity, send/receive UDP, or make driving decisions. It uses manually entered, illustrative states and a documented constant-velocity closest-approach heuristic.
