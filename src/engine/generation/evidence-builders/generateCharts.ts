import { EvidencePackage } from "../../../domain/types/evidence";
import { ScenarioModel, SignalParameter } from "../../../domain/types/scenario";
import {
  buildTimeSeriesTimestamps,
  getRequiredMetricSignal,
  getRequiredSegmentImpact,
  getSignalParameters,
  interpolateCount,
  interpolateSeries,
  interpolateValue,
  roundToOneDecimal,
} from "../generatorUtils";

export function generateCharts(scenario: ScenarioModel): EvidencePackage["charts"] {
  const startTime = new Date(scenario.windowHint.start);
  const endTime = new Date(startTime.getTime() + scenario.windowHint.durationMinutes * 60 * 1000);
  const chartTimestamps = buildTimeSeriesTimestamps(startTime, endTime, 5);
  const charts: EvidencePackage["charts"] = [];

  const apiHealthMetric = findMetricSignal(scenario, "api_success_rate");
  if (apiHealthMetric) {
    charts.push(buildSingleMetricChart("api-success-rate", "API Success Rate", "Offers API", "#44d17a", apiHealthMetric, chartTimestamps));
  }

  if (hasSignalType(scenario, "latency_increase")) {
    const successRateMetric = getRequiredMetricSignal(scenario, "success_rate");
    charts.push(buildSingleMetricChart("success-rate", "Success Rate", "All Clients", "#44d17a", successRateMetric, chartTimestamps));
  }

  const featureMetric = findMetricSignal(scenario, "feature_tile_success_rate");
  if (featureMetric) {
    const featureSuccessSeries = interpolateSeries(featureMetric.from, featureMetric.to, chartTimestamps);
    charts.push({
      id: "tile-failure-rate",
      title: "Rewards Tile Failure Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "rewards_tile_failures",
          label: "Tile Failure Rate",
          color: "#ff4d6d",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(100 - featureSuccessSeries[index]),
          })),
        },
      ],
    });
  }

  const activationMetric = findMetricSignal(scenario, "activation_success_rate");
  if (activationMetric) {
    charts.push(buildSingleMetricChart("activation-success-rate", "Offer Activation Success Rate", "Activation Success Rate", "#ffd166", activationMetric, chartTimestamps));
  }

  const statusCodeSignals = getSignalParameters(scenario, "status_code_spike");
  if (statusCodeSignals.length > 0) {
    charts.push(buildStatusCodeChart(statusCodeSignals, chartTimestamps));
  }

  const appVersionImpact = findSegmentImpact(scenario, "app_version");
  if (appVersionImpact && featureMetric) {
    const platformImpact = getRequiredSegmentImpact(scenario, "platform");
    const unaffectedAppVersion = appVersionImpact.unaffected?.[0] ?? "previous";
    const featureSuccessSeries = interpolateSeries(featureMetric.from, featureMetric.to, chartTimestamps);

    charts.push({
      id: "app-version-comparison",
      title: "App Version Comparison",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: appVersionImpact.affected[0]?.toLowerCase().replace(/\W+/g, "_") ?? "affected_version",
          label: `${platformImpact.affected[0] ?? "Impacted"} ${appVersionImpact.affected[0]} Tile Success Rate`,
          color: "#ffd166",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: featureSuccessSeries[index],
          })),
        },
        {
          id: unaffectedAppVersion.toLowerCase().replace(/\W+/g, "_"),
          label: `${platformImpact.affected[0] ?? "Baseline"} ${unaffectedAppVersion} Tile Success Rate`,
          color: "#2ec4ff",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(
                appVersionImpact.baselinePercent,
                appVersionImpact.baselinePercent - 0.6,
                index,
                chartTimestamps.length,
              ),
            ),
          })),
        },
      ],
    });
  }

  const productImpact = findSegmentImpact(scenario, "product_type");
  if (productImpact && activationMetric) {
    charts.push({
      id: "activation-outcome-comparison",
      title: "Activation Outcome Comparison",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "discover_success",
          label: `${productImpact.affected[0] ?? "Affected"} Success Rate`,
          color: "#ffb703",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(
                productImpact.baselinePercent - 2.3,
                productImpact.impactedPercent,
                index,
                chartTimestamps.length,
              ),
            ),
          })),
        },
        ...(productImpact.unaffected ?? []).map((label, index) => ({
          id: label.toLowerCase().replace(/\W+/g, "_") + "_success",
          label: `${label} Success Rate`,
          color: index === 0 ? "#6ee7b7" : "#9bdbff",
          points: chartTimestamps.map((timestamp, pointIndex) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(
                productImpact.baselinePercent + (index === 0 ? 0.3 : 0.1),
                productImpact.baselinePercent - (index === 0 ? 0 : 0.2),
                pointIndex,
                chartTimestamps.length,
              ),
            ),
          })),
        })),
      ],
    });
  }

  if (hasSignalType(scenario, "latency_increase")) {
    const platformImpact = getRequiredSegmentImpact(scenario, "platform");
    charts.push({
      id: "platform-breakdown",
      title: "Platform Breakdown",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "ios",
          label: "iOS Success Rate",
          color: "#6ee7b7",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(
                platformImpact.baselinePercent - 0.1,
                platformImpact.impactedPercent,
                index,
                chartTimestamps.length,
              ),
            ),
          })),
        },
        {
          id: "android",
          label: "Android Success Rate",
          color: "#ffd166",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(
                platformImpact.baselinePercent + 0.1,
                platformImpact.impactedPercent + 0.7,
                index,
                chartTimestamps.length,
              ),
            ),
          })),
        },
      ],
    });
  }

  return charts;
}

function buildSingleMetricChart(
  id: string,
  title: string,
  label: string,
  color: string,
  metricSignal: Extract<SignalParameter, { type: "success_rate_drop" }>,
  chartTimestamps: string[],
): EvidencePackage["charts"][number] {
  const series = interpolateSeries(metricSignal.from, metricSignal.to, chartTimestamps);

  return {
    id,
    title,
    kind: "line",
    unit: "percent",
    series: [
      {
        id: label.toLowerCase().replace(/\W+/g, "_"),
        label,
        color,
        points: chartTimestamps.map((timestamp, index) => ({
          timestamp,
          value: series[index],
        })),
      },
    ],
  };
}

function buildStatusCodeChart(
  statusCodeSignals: Array<Extract<SignalParameter, { type: "status_code_spike" }>>,
  chartTimestamps: string[],
): EvidencePackage["charts"][number] {
  const has403Only = statusCodeSignals.length === 1 && statusCodeSignals[0]?.statusCode === 403;
  const base200Series = has403Only ? [420, 415, 332, 251, 228] : [1180, 1110, 790, 720, 748];

  return {
    id: has403Only ? "activation-403-spike" : "status-codes",
    title: has403Only ? "403 Responses" : "Status Codes",
    kind: "stacked-bar",
    unit: "count",
    series: [
      {
        id: "200",
        label: "200",
        color: "#2ec4ff",
        points: chartTimestamps.map((timestamp, index) => ({
          timestamp,
          value: base200Series[index],
        })),
      },
      ...statusCodeSignals.map((signal, index) => ({
        id: String(signal.statusCode),
        label: String(signal.statusCode),
        color: has403Only || index > 0 ? "#ff4d6d" : "#ff7a45",
        points: chartTimestamps.map((timestamp, pointIndex) => ({
          timestamp,
          value: interpolateCount(signal.baseline, signal.peak, pointIndex, chartTimestamps.length),
        })),
      })),
    ],
  };
}

function findMetricSignal(scenario: ScenarioModel, metric: string) {
  return scenario.signalParameters.find(
    (parameter): parameter is Extract<SignalParameter, { type: "success_rate_drop" }> =>
      parameter.type === "success_rate_drop" && parameter.metric === metric,
  );
}

function findSegmentImpact(scenario: ScenarioModel, dimension: string) {
  return scenario.signalParameters.find(
    (parameter): parameter is Extract<SignalParameter, { type: "segment_impact" }> =>
      parameter.type === "segment_impact" && parameter.dimension === dimension,
  );
}

function hasSignalType<T extends SignalParameter["type"]>(scenario: ScenarioModel, type: T) {
  return scenario.signalParameters.some((parameter) => parameter.type === type);
}
