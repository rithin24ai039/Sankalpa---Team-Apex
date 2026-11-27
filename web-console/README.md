# V2V Visionaries Scenario Lab

A browser-based manual/V2V and video-input test harness.

## Run

Open `index.html` in a recent browser or serve this folder:

```bash
python -m http.server 8080
```

Visit `http://localhost:8080`.

## Manual / V2V input

Enter local and remote vehicle states in the shared metric coordinate frame, or generate and validate a versioned V2V JSON fixture. The baseline computes constant-velocity closest approach and a conservative vehicle-envelope clearance heuristic.

## Upload & process video

1. Switch the top input selector to **Upload & process video**.
2. Select an MP4/WebM or other browser-decodable video file (up to 300 MB).
3. Click **Load vehicle detector**. First use requires internet access to load TensorFlow.js and COCO-SSD from jsDelivr.
4. Adjust confidence threshold, frame width and processing interval.
5. Click **Start processing**. The UI overlays detections and reports frame times, classes, confidence, short-lived IDs and pixel-space motion.
6. Export detections as JSON.

Video is processed locally in the browser and is not uploaded to a server. A local file stays within the current browser tab.

## Detector and limitations

The video mode uses generic COCO-SSD `lite_mobilenet_v2` weights through TensorFlow.js. It does not load Team Apex's YOLO weights. The prototype recognises car, motorcycle, bus, truck, bicycle and person labels. Its lightweight nearest-centroid tracker is not ByteTrack or SORT.

Image-space pixel velocity is not physical speed. This mode does not infer metric coordinates, trajectories, TTC or collision risk. Those need camera calibration, ground-plane projection, shared coordinate-frame alignment, road/lane context and validated tracking. Performance depends on the browser and hardware; reduce width or inference frequency for slower devices.

See `docs/VIDEO_INPUT_PIPELINE.md` for the pipeline and validation boundary.
