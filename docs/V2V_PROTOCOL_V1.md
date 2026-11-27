# V2V Message Protocol — Draft v1

This is a research message shape for manually testing a cooperative vehicle-state exchange. The browser console parses a JSON fixture; it does not open a UDP socket or prove that a remote vehicle sent the message.

## Required fields

| Field | Type | Meaning |
|---|---|---|
| `protocol_version` | integer | Must be `1` |
| `vehicle_id` | string | Stable sender identity within the scenario |
| `timestamp` | number | Unix timestamp in seconds |
| `coordinate_frame` | string | Must be `map_meters_x_east_z_north` |
| `vehicle_type` | string | `car`, `motorcycle`, `bus`, `truck`, or `commercial` |
| `position` | object | `x`, `z` in metres in the shared map frame |
| `velocity` | object | `x`, `z` in metres per second in the same frame |
| `dimensions` | object | `length_m`, `width_m` |
| `heading_deg` | number | Heading metadata; not currently used by the baseline |
| `source` | string | `MANUAL_TEST_FIXTURE` in generated examples |

Example:

```json
{
  "protocol_version": 1,
  "vehicle_id": "vehicle_B",
  "timestamp": 1795770000.0,
  "coordinate_frame": "map_meters_x_east_z_north",
  "vehicle_type": "truck",
  "position": { "x": 4.0, "z": 40.0 },
  "velocity": { "x": -1.0, "z": -8.0 },
  "dimensions": { "length_m": 8.5, "width_m": 2.5 },
  "heading_deg": 187,
  "source": "MANUAL_TEST_FIXTURE"
}
```

## Validation rules

- Reject unsupported protocol versions, vehicle classes, missing values and malformed JSON.
- Reject pixel coordinates or coordinates declared in a different frame. Coordinates from unrelated cameras must not be compared as though they share a map.
- Reject messages older than the configured freshness limit (default 3 seconds) and timestamps more than 2 seconds in the future.
- A successful JSON parse does not imply UDP delivery, authentication, sender identity verification, ordering, reliability or cryptographic integrity.

## Not standardized automotive V2V

This draft is an application-level prototype message. It is not equivalent to IEEE 802.11p / ITS-G5 / C-V2X or a certified production V2V protocol. Transport, authentication, message signing, privacy, congestion management, replay protection and time synchronisation remain future work.
