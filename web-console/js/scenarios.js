import { VEHICLE_DIMENSIONS } from "./risk-engine.js";
import { createV2VMessage } from "./v2v-protocol.js";

export const SCENARIOS = Object.freeze({
  "blind-curve": {
    name: "Blind curve approach",
    source: "v2v",
    visibility: "blind",
    roadCondition: "curve",
    ego: { id: "vehicle_A", type: "car", headingDeg: 7, x: -4, z: 0, vx: 1, vz: 8 },
    other: { id: "vehicle_B", type: "truck", headingDeg: 187, x: 4, z: 40, vx: -1, vz: -8 },
    note: "Two vehicles approach an obstructed curve from opposite directions. The remote state is a manual V2V fixture, not a live radio packet.",
  },
  crossing: {
    name: "Crossing paths",
    source: "local",
    visibility: "clear",
    roadCondition: "intersection",
    ego: { id: "vehicle_A", type: "car", headingDeg: 90, x: -12, z: 0, vx: 6, vz: 0 },
    other: { id: "vehicle_B", type: "motorcycle", headingDeg: 0, x: 0, z: -12, vx: 0, vz: 6 },
    note: "A car and motorcycle approach a shared crossing point at right angles.",
  },
  "rear-approach": {
    name: "Rear approach / closing speed",
    source: "local",
    visibility: "clear",
    roadCondition: "overtaking",
    ego: { id: "vehicle_A", type: "car", headingDeg: 0, x: 0, z: 0, vx: 0, vz: 8 },
    other: { id: "vehicle_B", type: "truck", headingDeg: 0, x: 0, z: 28, vx: 0, vz: 2 },
    note: "A faster vehicle approaches from behind in the same lane. The states are manually supplied; no real track IDs are inferred.",
  },
  "safe-follow": {
    name: "Safe vehicle following",
    source: "local",
    visibility: "clear",
    roadCondition: "straight",
    ego: { id: "vehicle_A", type: "car", headingDeg: 0, x: 0, z: 0, vx: 0, vz: 10 },
    other: { id: "vehicle_B", type: "bus", headingDeg: 0, x: 3, z: 42, vx: 0, vz: 8 },
    note: "Vehicles travel in the same direction with a large separation. The current horizon is too short for the closing speed to create a predicted encounter.",
  },
  "near-miss": {
    name: "Predicted near miss",
    source: "local",
    visibility: "restricted",
    roadCondition: "intersection",
    ego: { id: "vehicle_A", type: "car", headingDeg: 90, x: -12, z: 0, vx: 6, vz: 0 },
    other: { id: "vehicle_B", type: "motorcycle", headingDeg: 0, x: 14, z: -18, vx: 0, vz: 6 },
    note: "Crossing trajectories pass close to one another. Circumscribed vehicle circles provide a conservative footprint estimate.",
  },
  "stale-v2v": {
    name: "Stale V2V packet",
    source: "v2v",
    visibility: "blind",
    roadCondition: "curve",
    ego: { id: "vehicle_A", type: "car", headingDeg: 0, x: 0, z: 0, vx: 0, vz: 7 },
    other: { id: "vehicle_B", type: "truck", headingDeg: 180, x: 0, z: 24, vx: 0, vz: -6 },
    staleBySec: 15,
    note: "The remote packet timestamp is intentionally old. The cooperative assessment must reject stale data rather than treating it as current.",
  },
});

export function withDimensions(vehicle) {
  const dimensions = VEHICLE_DIMENSIONS[vehicle.type];
  return { ...vehicle, lengthM: dimensions.lengthM, widthM: dimensions.widthM };
}

export function scenarioPacket(scenario, nowSec = Date.now() / 1000) {
  const other = withDimensions(scenario.other);
  return createV2VMessage(other, nowSec - (scenario.staleBySec ?? 0));
}
