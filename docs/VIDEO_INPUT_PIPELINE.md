# Video Input Pipeline — Browser Prototype

## Input modes

- **Manual / V2V data:** temporary vehicle states or a V2V JSON fixture, evaluated by the constant-velocity closest-approach baseline.
- **Upload & process video:** a local video file is decoded by the browser and sampled for object detection.

## Processing stages

1. The selected local file is represented by a temporary browser object URL. Video bytes are not uploaded.
2. TensorFlow.js and COCO-SSD load from jsDelivr on demand. The model variant is `lite_mobilenet_v2`.
3. Frames are downscaled to a configurable maximum width (480, 640 or 960 px).
4. Inference runs at a configurable sampling interval (0.2, 0.35, 0.6 or 1.0 seconds) and confidence threshold.
5. Predictions are filtered to car, motorcycle, bus, truck, bicycle and person.
6. A nearest-centroid association links nearby same-class boxes across processed frames and assigns temporary track IDs.
7. Bounding boxes and labels are drawn over the video. Summary metrics and recent detections are displayed and can be exported to JSON.

## Explicit limitations

- The model uses generic COCO-SSD weights; it is not an integration of Team Apex's YOLO weights.
- Small, distant, occluded or unusual road users may be missed or misclassified.
- Centroid association is a lightweight demonstration tracker, not ByteTrack or SORT.
- Reported displacement and velocity are in image pixels. They are not physical speed.
- Video mode does not calculate metric position, trajectory, TTC or collision risk.
- Connecting detections to the metric risk engine requires camera calibration, lens handling, ground-plane mapping, shared coordinate-frame definition, lane/road context, reliable tracking and validation.
- Browser performance depends on available CPU/GPU, memory, model backend, resolution and frame sampling interval.
- The model is loaded from an external CDN and first use requires internet access.

## Validation status

The video JavaScript passes syntax checking, required UI element IDs were checked, no duplicate HTML IDs were found, and all 8 existing manual risk/V2V tests pass. The detector/model was not exercised against a real uploaded clip in an actual browser in this environment, so device-specific inference performance remains unmeasured.
