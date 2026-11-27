# V2V Visionaries — Team Apex

Research workspace for the integrated road-safety and cooperative collision-avoidance prototype.

**Live Scenario Lab:** https://v2v-visionaries-scenario-lab.vercel.app/

## What's included

- `web-console/` — a browser Scenario Lab with two input modes: manual/V2V test data and local video upload with browser-side object detection.
- `docs/` — the Unity simulation audit, V2V message draft, baseline risk-engine assumptions, video pipeline notes and deployment status.

The Unity island-city simulation was supplied as a separate project archive. Its audit is recorded in `docs/SIMULATION_AUDIT.md`; the full Unity project is included in the downloadable project ZIP supplied in this conversation.

## Run the web console

Open `web-console/index.html` in a recent browser, or serve it locally:

```bash
cd web-console
python -m http.server 8080
```

Visit `http://localhost:8080`.

## Input modes

**Manual / V2V data** uses temporary vehicle states or a versioned JSON fixture and the constant-velocity closest-approach baseline.

**Upload & process video** accepts a browser-supported local video file (up to 300 MB). It loads TensorFlow.js and the COCO-SSD `lite_mobilenet_v2` detector from jsDelivr and runs frame inference in the browser. It overlays detected cars, motorcycles, buses, trucks, bicycles and people, associates detections using short-lived centroid tracks, and exports detection metadata.

The first model load requires internet. Video content stays in the browser tab; the clip is not uploaded to Vercel or Supabase.

## Run automated tests

Requires Node.js 18 or newer:

```bash
cd web-console
npm test
```

## Research boundaries

COCO-SSD is a generic model, not Team Apex's YOLO weights. Video mode reports bounding boxes, confidence, short-lived track IDs and pixel-space displacement. It does not infer physical speed, metric coordinates, trajectories, TTC or collision risk. Those require camera calibration, ground-plane mapping, road/lane context and validated tracking. The centroid association is a lightweight prototype, not ByteTrack or SORT.

The Unity project is a simulation foundation. As documented in `docs/SIMULATION_AUDIT.md`, the team's camera capture, YOLO integration, metric movement estimation, trajectory prediction, collision assessment and real UDP V2V transport still require implementation and validation in the Unity/runtime system.

This is not a certified automotive safety system. Do not use it for real driving or safety decisions.

## Deployment

The current Vercel deployment is uploaded directly from static files. GitHub auto-deploy is not connected yet; see `docs/DEPLOYMENT_STATUS.md` before assuming that future Git pushes automatically update the live site.
