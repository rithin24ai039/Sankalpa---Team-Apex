# V2V Visionaries Scenario Lab

A self-contained browser test interface with two modes: manual/V2V input and local video processing.

## Run

Open `index.html` in a recent browser or serve this directory:

```bash
python -m http.server 8080
```

Visit `http://localhost:8080`.

The main page has no separate application-bundle fetch at startup. Video-mode model files are downloaded from jsDelivr only after clicking **Load vehicle detector**.

## Manual / V2V input

Enter local and remote vehicle states in the same metric map frame, or generate and validate a versioned V2V JSON fixture. The baseline estimates constant-velocity closest approach and conservative vehicle-envelope clearance.

## Upload & process video

1. Switch to **Upload & process video**.
2. Select a browser-supported local video file (up to 300 MB).
3. Click **Load vehicle detector**. The first load requires internet access to jsDelivr for TensorFlow.js and COCO-SSD.
4. Adjust confidence threshold, frame sampling interval and processing width.
5. Click **Start processing**. The browser overlays supported road-user detections and reports timestamps, classes, confidence, temporary centroid-associated IDs and pixel-space movement.
6. Export detection results to JSON.

Video is decoded and processed locally in the browser. The clip is not uploaded to Vercel or Supabase.

## Detector and limitations

Video mode uses generic COCO-SSD `lite_mobilenet_v2` weights. It is not an integration of Team Apex's YOLO weights. A lightweight nearest-centroid association is used for temporary IDs; it is not ByteTrack or SORT.

Image-space pixel speed is not physical speed. Video mode does not infer metric coordinates, trajectories, TTC or collision risk. These require camera calibration, ground-plane mapping, shared coordinate-frame alignment, road/lane context and validated tracking.

See `../docs/VIDEO_INPUT_PIPELINE.md` for the research boundary. This is not a certified automotive safety system.
