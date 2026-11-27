import { VEHICLE_DIMENSIONS, validateVehicleState } from "./risk-engine.js";

export const V2V_PROTOCOL_VERSION = 1;
export const COORDINATE_FRAME = "map_meters_x_east_z_north";

export function createV2VMessage(vehicle, timestamp = Date.now() / 1000) {
  const dimensions = VEHICLE_DIMENSIONS[vehicle.type];
  return {
    protocol_version: V2V_PROTOCOL_VERSION,
    vehicle_id: vehicle.id,
    timestamp,
    coordinate_frame: COORDINATE_FRAME,
    vehicle_type: vehicle.type,
    position: { x: vehicle.x, z: vehicle.z },
    velocity: { x: vehicle.vx, z: vehicle.vz },
    dimensions: {
      length_m: vehicle.lengthM ?? dimensions?.lengthM,
      width_m: vehicle.widthM ?? dimensions?.widthM,
    },
    heading_deg: Number.isFinite(vehicle.headingDeg) ? vehicle.headingDeg : 0,
    source: "MANUAL_TEST_FIXTURE",
  };
}

export function parseV2VMessage(text, options = {}) {
  const nowSec = options.nowSec ?? Date.now() / 1000;
  const maxAgeSec = options.maxAgeSec ?? 3;
  const futureToleranceSec = options.futureToleranceSec ?? 2;
  let packet;
  try {
    packet = JSON.parse(text);
  } catch {
    return { ok: false, status: "MALFORMED", errors: ["Payload is not valid JSON."] };
  }
  if (!packet || typeof packet !== "object" || Array.isArray(packet)) {
    return { ok: false, status: "INVALID", errors: ["Payload must be a JSON object."] };
  }

  const errors = [];
  if (packet.protocol_version !== V2V_PROTOCOL_VERSION) errors.push(`protocol_version must equal ${V2V_PROTOCOL_VERSION}.`);
  if (typeof packet.vehicle_id !== "string" || !packet.vehicle_id.trim()) errors.push("vehicle_id must be a non-empty string.");
  if (packet.coordinate_frame !== COORDINATE_FRAME) errors.push(`coordinate_frame must be ${COORDINATE_FRAME}.`);
  if (!Number.isFinite(packet.timestamp)) errors.push("timestamp must be a Unix timestamp in seconds.");
  if (!packet.position || !Number.isFinite(packet.position.x) || !Number.isFinite(packet.position.z)) errors.push("position must contain finite x and z coordinates in metres.");
  if (!packet.velocity || !Number.isFinite(packet.velocity.x) || !Number.isFinite(packet.velocity.z)) errors.push("velocity must contain finite x and z components in metres per second.");
  if (!Object.hasOwn(VEHICLE_DIMENSIONS, packet.vehicle_type)) errors.push("vehicle_type is not supported by this prototype protocol.");

  const defaultDimensions = VEHICLE_DIMENSIONS[packet.vehicle_type];
  const dimensions = packet.dimensions ?? {};
  const vehicle = {
    id: packet.vehicle_id,
    type: packet.vehicle_type,
    x: packet.position?.x,
    z: packet.position?.z,
    vx: packet.velocity?.x,
    vz: packet.velocity?.z,
    lengthM: dimensions.length_m ?? defaultDimensions?.lengthM,
    widthM: dimensions.width_m ?? defaultDimensions?.widthM,
    headingDeg: packet.heading_deg ?? 0,
    timestamp: packet.timestamp,
  };
  if (errors.length === 0) errors.push(...validateVehicleState(vehicle, "V2V vehicle"));
  if (errors.length) return { ok: false, status: "INVALID", errors, packet };

  const ageSec = nowSec - packet.timestamp;
  if (ageSec > maxAgeSec) {
    return {
      ok: false,
      status: "STALE",
      errors: [`Packet age is ${ageSec.toFixed(2)} s, exceeding the ${maxAgeSec.toFixed(2)} s limit.`],
      ageSec,
      vehicle,
      packet,
    };
  }
  if (ageSec < -futureToleranceSec) {
    return {
      ok: false,
      status: "FUTURE_TIMESTAMP",
      errors: [`Packet timestamp is ${Math.abs(ageSec).toFixed(2)} s in the future; check clock synchronisation.`],
      ageSec,
      vehicle,
      packet,
    };
  }

  return { ok: true, status: "FRESH", ageSec: Math.max(0, ageSec), vehicle, packet };
}
