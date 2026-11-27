# Deployment Status

- Project: `v2v-visionaries-scenario-lab`
- Production URL: https://v2v-visionaries-scenario-lab.vercel.app/
- Hosting: Vercel static deployment
- Database: none required for temporary manual/video test fixtures
- Browser data: current tab only; downloadable JSON exports

## Current deployment

The production page is a single self-contained HTML file. It does not fetch separate application bundle assets on startup, which avoids the earlier bundle-loader failure. TensorFlow.js and COCO-SSD are fetched from jsDelivr only after the user requests model loading.

## Git deployment

The page is uploaded directly to Vercel from committed static source because the Vercel GitHub integration is not yet connected. Future GitHub commits therefore do not automatically redeploy until the repository is connected in Vercel Project Settings.

## Safety and implementation boundary

This is a research scenario harness. Manual risk assessment uses manually entered constant-velocity states. Video mode uses generic COCO-SSD, not Team Apex's YOLO weights, and returns pixel-space detections. It does not connect to a camera, Unity runtime, UDP transport, metric trajectory predictor or calibrated collision-risk engine. Do not use it for real driving or safety decisions.
