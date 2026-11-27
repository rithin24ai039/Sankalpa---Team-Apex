# Browser Risk Baseline

## Inputs

Two vehicle states in one shared metric map frame: position `(x, z)` in metres and velocity `(vx, vz)` in metres per second. The console uses class-specific default vehicle dimensions for cars, motorcycles/scooters, buses, trucks and commercial vehicles.

## Constant-velocity closest approach

Let relative position be `r = pB - pA` and relative velocity be `v = vB - vA`. The unconstrained closest-approach time is:

`t* = - dot(r, v) / dot(v, v)`

The tool clamps this value to the configured prediction interval `[0, horizon]`, then computes the relative position at that time and its centre-to-centre separation.

Each vehicle is approximated by a circumscribed circle with radius `sqrt(length² + width²) / 2`. The estimated clearance is the centre separation at CPA minus the sum of the two radii. This intentionally conservative proxy is not a rotated rectangle or a physics collision model.

A separate line-of-sight closing-speed estimate is shown as `initial separation / closing speed`, only when the relative motion is closing. It is not treated as evidence of path intersection; CPA and clearance remain separate outputs.

## Default heuristic bands

| Classification | Geometric trigger |
|---|---|
| CRITICAL | Estimated envelope overlap and CPA within 2 seconds |
| HIGH | Estimated envelope overlap after 2 seconds, or clearance ≤ 1.5 m within 3 seconds |
| MEDIUM | Clearance ≤ 4 m within 4 seconds |
| LOW | Clearance ≤ 7 m |
| SAFE | None of the above |

The prediction horizon defaults to 5 seconds. These thresholds are starting research settings for inspecting the algorithm; they are not supported by calibrated crash data or validated safety standards. They are not collision probabilities.

## Known limitations

- Constant velocity ignores braking, acceleration, steering and lane changes.
- No road graph, lane constraints, curve geometry or occlusion model is used in the calculation.
- No camera calibration or coordinate transform is performed; the user must provide valid shared map coordinates.
- No tracking history or sensor confidence is available in manual fixtures.
- No uncertainty propagation, probabilistic risk model or vehicle dynamics is implemented.
