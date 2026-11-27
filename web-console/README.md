# V2V Visionaries Scenario Lab

A no-build static test interface for manually entering temporary vehicle states and V2V message fixtures.

## Use

Open `index.html` in a current browser or serve this directory locally:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## What it tests

- Manual local and remote vehicle states in a shared metric map coordinate frame.
- Constant-velocity closest point of approach and a conservative vehicle-envelope clearance estimate.
- Explicit SAFE / LOW / MEDIUM / HIGH / CRITICAL heuristic categories.
- V2V message v1 JSON fixture generation, parsing, timestamp freshness and coordinate-frame checks.
- Six reproducible scenario presets and an exportable event log.

## Data and safety

Inputs are temporary and the event log is stored only in the current tab's `sessionStorage`. There is no backend or database. This app does not capture video, load YOLO, track real vehicles, read Unity ground truth, create a UDP socket or authenticate remote senders. Its risk bands are inspectable baseline heuristics, not collision probabilities or a certified safety system.
