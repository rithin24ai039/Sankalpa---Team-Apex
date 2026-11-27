import test from "node:test";
import assert from "node:assert/strict";
import { evaluateEncounter, VEHICLE_DIMENSIONS } from "../js/risk-engine.js";
import { parseV2VMessage, createV2VMessage, COORDINATE_FRAME } from "../js/v2v-protocol.js";

function vehicle(id, type, x, z, vx, vz) {
  const dimensions = VEHICLE_DIMENSIONS[type];
  return { id, type, x, z, vx, vz, lengthM: dimensions.lengthM, widthM: dimensions.widthM };
}

test("crossing trajectories identify a predicted footprint overlap", () => {
  const result = evaluateEncounter(
    vehicle("A", "car", -12, 0, 6, 0),
    vehicle("B", "motorcycle", 0, -12, 0, 6),
    { predictionHorizonSec: 5 },
  );
  assert.equal(result.ok, true);
  assert.equal(result.predictedOverlap, true);
  assert.equal(result.cpaTimeSec, 2);
  assert.equal(result.risk, "CRITICAL");
});

test("safe following remains safe inside a short prediction horizon", () => {
  const result = evaluateEncounter(
    vehicle("A", "car", 0, 0, 0, 10),
    vehicle("B", "bus", 3, 42, 0, 8),
    { predictionHorizonSec: 5 },
  );
  assert.equal(result.ok, true);
  assert.equal(result.predictedOverlap, false);
  assert.equal(result.risk, "SAFE");
});

test("identical IDs are rejected instead of silently compared", () => {
  const result = evaluateEncounter(
    vehicle("same", "car", 0, 0, 0, 1),
    vehicle("same", "car", 0, 20, 0, -1),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /different/);
});

test("invalid risk policy ordering is rejected", () => {
  const result = evaluateEncounter(
    vehicle("A", "car", 0, 0, 0, 1),
    vehicle("B", "car", 0, 20, 0, -1),
    { lowClearanceM: 2, mediumClearanceM: 4, highClearanceM: 1 },
  );
  assert.equal(result.ok, false);
});

test("V2V message round-trips in the agreed coordinate frame", () => {
  const packet = createV2VMessage(vehicle("B", "truck", 4, 25, -1, -5), 1000);
  const result = parseV2VMessage(JSON.stringify(packet), { nowSec: 1000, maxAgeSec: 3 });
  assert.equal(packet.coordinate_frame, COORDINATE_FRAME);
  assert.equal(result.ok, true);
  assert.equal(result.vehicle.id, "B");
});

test("stale V2V messages are rejected", () => {
  const packet = createV2VMessage(vehicle("B", "truck", 4, 25, -1, -5), 990);
  const result = parseV2VMessage(JSON.stringify(packet), { nowSec: 1000, maxAgeSec: 3 });
  assert.equal(result.ok, false);
  assert.equal(result.status, "STALE");
});

test("wrong coordinate frames fail closed", () => {
  const packet = createV2VMessage(vehicle("B", "truck", 4, 25, -1, -5), 1000);
  packet.coordinate_frame = "pixels_from_another_camera";
  const result = parseV2VMessage(JSON.stringify(packet), { nowSec: 1000 });
  assert.equal(result.ok, false);
  assert.equal(result.status, "INVALID");
  assert.match(result.errors.join(" "), /coordinate_frame/);
});

test("malformed JSON is identified as malformed", () => {
  const result = parseV2VMessage("{not-json", { nowSec: 1000 });
  assert.equal(result.ok, false);
  assert.equal(result.status, "MALFORMED");
});
