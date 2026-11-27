export const RISK_LEVELS = Object.freeze(["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const DEFAULT_POLICY = Object.freeze({
  predictionHorizonSec: 5,
  lowClearanceM: 7,
  mediumClearanceM: 4,
  highClearanceM: 1.5,
  criticalTimeSec: 2,
  highTimeSec: 3,
  mediumTimeSec: 4,
});

export const VEHICLE_DIMENSIONS = Object.freeze({
  car: { lengthM: 4.5, widthM: 1.8 },
  motorcycle: { lengthM: 2.1, widthM: 0.85 },
  bus: { lengthM: 11.5, widthM: 2.5 },
  truck: { lengthM: 8.5, widthM: 2.5 },
  commercial: { lengthM: 6.2, widthM: 2.2 },
});

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

export function validateVehicleState(vehicle, label = "vehicle") {
  const errors = [];
  if (!vehicle || typeof vehicle !== "object") return [`${label}: state is missing.`];
  if (typeof vehicle.id !== "string" || !vehicle.id.trim()) errors.push(`${label}: ID is required.`);
  if (!Object.hasOwn(VEHICLE_DIMENSIONS, vehicle.type)) errors.push(`${label}: unsupported vehicle class.`);

  for (const key of ["x", "z", "vx", "vz", "lengthM", "widthM"]) {
    if (!isFiniteNumber(vehicle[key])) errors.push(`${label}: ${key} must be a finite number.`);
  }
  if (["x", "z"].every((key) => isFiniteNumber(vehicle[key]))) {
    if (Math.abs(vehicle.x) > 100_000 || Math.abs(vehicle.z) > 100_000) errors.push(`${label}: position is outside the supported ±100 km test area.`);
  }
  if (["vx", "vz"].every((key) => isFiniteNumber(vehicle[key]))) {
    if (Math.abs(vehicle.vx) > 100 || Math.abs(vehicle.vz) > 100) errors.push(`${label}: velocity must be within ±100 m/s.`);
  }
  if (isFiniteNumber(vehicle.lengthM) && (vehicle.lengthM < 0.4 || vehicle.lengthM > 30)) errors.push(`${label}: length must be between 0.4 m and 30 m.`);
  if (isFiniteNumber(vehicle.widthM) && (vehicle.widthM < 0.4 || vehicle.widthM > 5)) errors.push(`${label}: width must be between 0.4 m and 5 m.`);
  return errors;
}

function envelopeRadius(vehicle) {
  // A circumscribed circle is intentionally conservative; this is not a vehicle-shape collision model.
  return Math.hypot(vehicle.lengthM, vehicle.widthM) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function classifyRisk({ clearanceM, cpaTimeSec, policy }) {
  if (clearanceM <= 0) {
    return cpaTimeSec <= policy.criticalTimeSec ? "CRITICAL" : "HIGH";
  }
  if (clearanceM <= policy.highClearanceM && cpaTimeSec <= policy.highTimeSec) return "HIGH";
  if (clearanceM <= policy.mediumClearanceM && cpaTimeSec <= policy.mediumTimeSec) return "MEDIUM";
  if (clearanceM <= policy.lowClearanceM) return "LOW";
  return "SAFE";
}

export function evaluateEncounter(vehicleA, vehicleB, options = {}) {
  const policy = { ...DEFAULT_POLICY, ...options };
  const horizon = policy.predictionHorizonSec;
  if (!isFiniteNumber(horizon) || horizon <= 0 || horizon > 30) {
    return { ok: false, errors: ["Prediction horizon must be greater than 0 and no more than 30 seconds."] };
  }
  for (const key of ["lowClearanceM", "mediumClearanceM", "highClearanceM", "criticalTimeSec", "highTimeSec", "mediumTimeSec"]) {
    if (!isFiniteNumber(policy[key]) || policy[key] < 0) {
      return { ok: false, errors: [`Risk policy value ${key} must be a non-negative finite number.`] };
    }
  }
  if (!(policy.lowClearanceM >= policy.mediumClearanceM && policy.mediumClearanceM >= policy.highClearanceM)) {
    return { ok: false, errors: ["Clearance thresholds must be ordered: low ≥ medium ≥ high."] };
  }

  const errors = [
    ...validateVehicleState(vehicleA, "Vehicle A"),
    ...validateVehicleState(vehicleB, "Vehicle B"),
  ];
  if (vehicleA?.id && vehicleA.id === vehicleB?.id) errors.push("Vehicle IDs must be different.");
  if (errors.length) return { ok: false, errors };

  const rx = vehicleB.x - vehicleA.x;
  const rz = vehicleB.z - vehicleA.z;
  const vx = vehicleB.vx - vehicleA.vx;
  const vz = vehicleB.vz - vehicleA.vz;
  const initialDistanceM = Math.hypot(rx, rz);
  const relativeSpeedMps = Math.hypot(vx, vz);
  const relativeSpeedSq = vx * vx + vz * vz;
  const rawCpaTime = relativeSpeedSq > 1e-8 ? -((rx * vx) + (rz * vz)) / relativeSpeedSq : 0;
  const cpaTimeSec = clamp(rawCpaTime, 0, horizon);
  const cpaX = rx + vx * cpaTimeSec;
  const cpaZ = rz + vz * cpaTimeSec;
  const centreDistanceAtCpaM = Math.hypot(cpaX, cpaZ);
  const combinedRadiusM = envelopeRadius(vehicleA) + envelopeRadius(vehicleB);
  const clearanceM = centreDistanceAtCpaM - combinedRadiusM;
  const closingSpeedMps = initialDistanceM > 1e-8 ? -((rx * vx) + (rz * vz)) / initialDistanceM : 0;
  const timeToContactSec = closingSpeedMps > 1e-6 ? initialDistanceM / closingSpeedMps : null;
  const risk = classifyRisk({ clearanceM, cpaTimeSec, policy });
  const predictedOverlap = clearanceM <= 0;
  const withinHorizon = rawCpaTime >= 0 && rawCpaTime <= horizon;

  return {
    ok: true,
    vehicleA: vehicleA.id,
    vehicleB: vehicleB.id,
    risk,
    model: "constant_velocity_cpa_v1",
    horizonSec: horizon,
    initialDistanceM,
    relativeSpeedMps,
    closingSpeedMps,
    timeToContactSec,
    cpaTimeSec,
    rawCpaTimeSec: rawCpaTime,
    centreDistanceAtCpaM,
    combinedEnvelopeRadiusM: combinedRadiusM,
    clearanceM,
    predictedOverlap,
    withinHorizon,
    predictedRelativeAtCpa: { x: cpaX, z: cpaZ },
    predictedPositionAAtCpa: { x: vehicleA.x + vehicleA.vx * cpaTimeSec, z: vehicleA.z + vehicleA.vz * cpaTimeSec },
    predictedPositionBAtCpa: { x: vehicleB.x + vehicleB.vx * cpaTimeSec, z: vehicleB.z + vehicleB.vz * cpaTimeSec },
    policy: { ...policy },
    assumptions: [
      "Both vehicles maintain constant velocity over the selected horizon.",
      "Vehicle footprints are approximated by conservative circumscribed circles.",
      "A geometric risk band is not a calibrated collision probability.",
      "Coordinates must share one calibrated map frame in metres (X east, Z north).",
    ],
  };
}

export function formatSeconds(value, digits = 2) {
  return value === null || value === undefined || !Number.isFinite(value) ? "—" : `${value.toFixed(digits)} s`;
}

export function formatMetres(value, digits = 1) {
  return !Number.isFinite(value) ? "—" : `${value.toFixed(digits)} m`;
}
