import { MetricStream, MetricStreamBundle } from "../types/metrics";
import { ScenarioModel } from "../types/scenario";
import {
  addMinutes,
  getRequiredMetricSignal,
  getRequiredSignalParameter,
  roundToOneDecimal,
} from "./generatorUtils";

export function generateMetricStreams(scenario: ScenarioModel): MetricStreamBundle {
  assertSupportedScenario(scenario);

  const startTime = new Date(scenario.windowHint.start);
  const timestamps = buildMinuteTimestamps(startTime, scenario.windowHint.durationMinutes);
  const endTime = timestamps[timestamps.length - 1] ?? startTime.toISOString();

  const successRateSignal = getRequiredMetricSignal(scenario, "success_rate");
  const latencySignal = getRequiredSignalParameter(scenario, "latency_increase");
  const status500Signal = getRequiredStatusCodeSpike(scenario, 500);
  const status504Signal = getRequiredStatusCodeSpike(scenario, 504);

  const successRateValues = buildSuccessRateSeries(
    timestamps.length,
    successRateSignal.from,
    successRateSignal.to,
  );
  const latencyValues = buildLatencySeries(
    timestamps.length,
    latencySignal.fromMs,
    latencySignal.toMs,
  );
  const status500Values = buildSpikeSeries(
    timestamps.length,
    status500Signal.baseline,
    status500Signal.peak,
  );
  const status504Values = buildSpikeSeries(
    timestamps.length,
    status504Signal.baseline,
    status504Signal.peak,
  );
  const status200Values = buildStatus200Series(
    timestamps.length,
    1180,
    status500Values,
    status504Values,
  );

  return {
    scenarioId: scenario.id,
    window: {
      start: scenario.windowHint.start,
      end: endTime,
      timezone: scenario.windowHint.timezone,
    },
    streams: [
      buildStream("success_rate", "success_rate", "percent", timestamps, successRateValues),
      buildStream("p95_latency", "p95_latency", "ms", timestamps, latencyValues),
      buildStream("status_code_200", "status_code_200", "count", timestamps, status200Values),
      buildStream("status_code_500", "status_code_500", "count", timestamps, status500Values),
      buildStream("status_code_504", "status_code_504", "count", timestamps, status504Values),
    ],
    thresholds: [
      {
        id: "threshold_success_rate_93",
        metric: "success_rate",
        operator: "<",
        threshold: 93,
        sustainMinutes: 1,
      },
    ],
    phases: [
      {
        id: "baseline",
        label: "Baseline traffic",
        start: timestamps[0],
        end: timestamps[9],
        kind: "baseline",
      },
      {
        id: "degradation",
        label: "Error rate rising",
        start: timestamps[10],
        end: timestamps[18],
        kind: "degradation",
      },
      {
        id: "peak",
        label: "Incident peak",
        start: timestamps[19],
        end: timestamps[22],
        kind: "peak",
      },
      {
        id: "recovery",
        label: "Partial recovery",
        start: timestamps[23],
        end: timestamps[timestamps.length - 1],
        kind: "recovery",
      },
    ],
  };
}

function assertSupportedScenario(scenario: ScenarioModel) {
  if (scenario.id !== "scenario_backend_api_timeout") {
    throw new Error(`Unsupported scenario for metric stream generation: ${scenario.id}`);
  }
}

function buildMinuteTimestamps(startTime: Date, durationMinutes: number) {
  return Array.from({ length: durationMinutes + 1 }, (_, index) =>
    addMinutes(startTime, index).toISOString(),
  );
}

function buildStream(
  id: string,
  metric: string,
  unit: MetricStream["unit"],
  timestamps: string[],
  values: number[],
): MetricStream {
  return {
    id,
    metric,
    unit,
    resolution: "1m",
    points: timestamps.map((timestamp, index) => ({
      timestamp,
      value: values[index] ?? values[values.length - 1] ?? 0,
    })),
  };
}

function buildSuccessRateSeries(pointCount: number, from: number, to: number) {
  const preIncidentCount = 10;
  const degradationEndIndex = 20;

  return Array.from({ length: pointCount }, (_, index) => {
    if (index < preIncidentCount) {
      return roundToOneDecimal(from - index * 0.12);
    }

    if (index <= degradationEndIndex) {
      const ratio = (index - preIncidentCount) / Math.max(degradationEndIndex - preIncidentCount, 1);
      const eased = easeOut(ratio);
      return roundToOneDecimal((from - 1.4) + (to - (from - 1.4)) * eased);
    }

    const recoveryRatio = (index - degradationEndIndex) / Math.max(pointCount - 1 - degradationEndIndex, 1);
    return roundToOneDecimal(to - 1 + recoveryRatio * 1.2);
  });
}

function buildLatencySeries(pointCount: number, fromMs: number, toMs: number) {
  const rampStart = 8;
  const rampEnd = 20;

  return Array.from({ length: pointCount }, (_, index) => {
    if (index < rampStart) {
      return Math.round(fromMs + index * 35);
    }

    if (index <= rampEnd) {
      const ratio = (index - rampStart) / Math.max(rampEnd - rampStart, 1);
      const eased = easeIn(ratio);
      return Math.round((fromMs + 250) + (toMs - (fromMs + 250)) * eased);
    }

    const settleRatio = (index - rampEnd) / Math.max(pointCount - 1 - rampEnd, 1);
    return Math.round(toMs - 250 + settleRatio * 180);
  });
}

function buildSpikeSeries(pointCount: number, baseline: number, peak: number) {
  const spikeStart = 10;
  const spikePeak = 20;

  return Array.from({ length: pointCount }, (_, index) => {
    if (index < spikeStart) {
      return baseline;
    }

    if (index <= spikePeak) {
      const ratio = (index - spikeStart) / Math.max(spikePeak - spikeStart, 1);
      return Math.round(baseline + (peak - baseline) * easeOut(ratio));
    }

    const settleRatio = (index - spikePeak) / Math.max(pointCount - 1 - spikePeak, 1);
    return Math.round(peak - settleRatio * (peak * 0.22));
  });
}

function buildStatus200Series(
  pointCount: number,
  baseline: number,
  status500Values: number[],
  status504Values: number[],
) {
  return Array.from({ length: pointCount }, (_, index) => {
    const errorLoad = (status500Values[index] ?? 0) + (status504Values[index] ?? 0);
    const decay = index < 10 ? index * 5 : 50 + (index - 10) * 18;
    return Math.max(120, Math.round(baseline - decay - errorLoad * 1.8));
  });
}

function getRequiredStatusCodeSpike(scenario: ScenarioModel, statusCode: number) {
  const signal = scenario.signalParameters.find(
    (
      parameter,
    ): parameter is Extract<
      ScenarioModel["signalParameters"][number],
      { type: "status_code_spike" }
    > => parameter.type === "status_code_spike" && parameter.statusCode === statusCode,
  );

  if (!signal) {
    throw new Error(`Missing required status_code_spike signal: ${statusCode}`);
  }

  return signal;
}

function easeOut(value: number) {
  return 1 - Math.pow(1 - value, 2);
}

function easeIn(value: number) {
  return value * value;
}
