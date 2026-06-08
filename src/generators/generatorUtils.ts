import { ScenarioModel, SignalParameter } from "../types/scenario";

export function getRequiredMetricSignal(
  scenario: ScenarioModel,
  metric: string,
): Extract<SignalParameter, { type: "success_rate_drop" }> {
  const parameter = getSignalParameters(scenario, "success_rate_drop").find((signal) => signal.metric === metric);

  if (!parameter) {
    throw new Error(`Missing required success_rate_drop metric: ${metric}`);
  }

  return parameter;
}

export function getRequiredSegmentImpact(
  scenario: ScenarioModel,
  dimension: string,
): Extract<SignalParameter, { type: "segment_impact" }> {
  const parameter = getSignalParameters(scenario, "segment_impact").find((signal) => signal.dimension === dimension);

  if (!parameter) {
    throw new Error(`Missing required segment_impact dimension: ${dimension}`);
  }

  return parameter;
}

export function getRequiredSignalParameter<T extends SignalParameter["type"]>(
  scenario: ScenarioModel,
  type: T,
): Extract<SignalParameter, { type: T }> {
  const parameter = scenario.signalParameters.find(
    (candidate): candidate is Extract<SignalParameter, { type: T }> => candidate.type === type,
  );

  if (!parameter) {
    throw new Error(`Missing required signal parameter: ${type}`);
  }

  return parameter;
}

export function getSignalParameters<T extends SignalParameter["type"]>(
  scenario: ScenarioModel,
  type: T,
): Array<Extract<SignalParameter, { type: T }>> {
  return scenario.signalParameters.filter(
    (candidate): candidate is Extract<SignalParameter, { type: T }> => candidate.type === type,
  );
}

export function buildTimeSeriesTimestamps(startTime: Date, endTime: Date, pointCount: number) {
  const durationMs = endTime.getTime() - startTime.getTime();
  const stepMs = durationMs / (pointCount - 1);

  return Array.from({ length: pointCount }, (_, index) =>
    new Date(startTime.getTime() + stepMs * index).toISOString(),
  );
}

export function interpolateSeries(from: number, to: number, timestamps: string[]) {
  return timestamps.map((_, index) => roundToOneDecimal(interpolateValue(from, to, index, timestamps.length)));
}

export function interpolateCount(from: number, peak: number, index: number, totalCount: number) {
  const curve = [0, 0.12, 0.82, 1, 0.78];
  const normalized = curve[index] ?? index / Math.max(totalCount - 1, 1);

  return Math.max(0, Math.round(from + (peak - from) * normalized));
}

export function interpolateValue(from: number, to: number, index: number, totalCount: number) {
  const ratio = totalCount <= 1 ? 1 : index / (totalCount - 1);

  return from + (to - from) * ratio;
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function formatSignedPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${roundToOneDecimal(value).toFixed(1)}`;
}

export function formatSignedSeconds(value: number) {
  return `${value >= 0 ? "+" : ""}${roundToOneDecimal(value).toFixed(1)}`;
}
