import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";
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
  switch (scenario.id) {
    case "scenario_backend_api_timeout":
      return generateBackendCharts(scenario);
    case "scenario_mobile_enum_mapping_failure":
      return generateMobileCharts(scenario);
    case "scenario_discover_offer_activation_failure":
      return generateDiscoverCharts(scenario);
    default:
      throw new Error(`Unsupported scenario for chart generation: ${scenario.id}`);
  }
}

function generateBackendCharts(scenario: ScenarioModel): EvidencePackage["charts"] {
  const startTime = new Date(scenario.windowHint.start);
  const endTime = new Date(startTime.getTime() + scenario.windowHint.durationMinutes * 60 * 1000);
  const chartTimestamps = buildTimeSeriesTimestamps(startTime, endTime, 5);
  const successRateDrop = getRequiredMetricSignal(scenario, "success_rate");
  const successSeries = interpolateSeries(successRateDrop.from, successRateDrop.to, chartTimestamps);
  const statusCodeSignals = getSignalParameters(scenario, "status_code_spike");
  const segmentImpact = getRequiredSegmentImpact(scenario, "platform");

  return [
    {
      id: "success-rate",
      title: "Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "all_clients",
          label: "All Clients",
          color: "#44d17a",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: successSeries[index],
          })),
        },
      ],
    },
    {
      id: "status-codes",
      title: "Status Codes",
      kind: "stacked-bar",
      unit: "count",
      series: [
        {
          id: "200",
          label: "200",
          color: "#2ec4ff",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: [1180, 1110, 790, 720, 748][index],
          })),
        },
        ...statusCodeSignals.map((signal, index) => ({
          id: String(signal.statusCode),
          label: String(signal.statusCode),
          color: index === 0 ? "#ff7a45" : "#ff4d6d",
          points: chartTimestamps.map((timestamp, pointIndex) => ({
            timestamp,
            value: interpolateCount(signal.baseline, signal.peak, pointIndex, chartTimestamps.length),
          })),
        })),
      ],
    },
    {
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
                segmentImpact.baselinePercent - 0.1,
                segmentImpact.impactedPercent,
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
                segmentImpact.baselinePercent + 0.1,
                segmentImpact.impactedPercent + 0.7,
                index,
                chartTimestamps.length,
              ),
            ),
          })),
        },
      ],
    },
  ];
}

function generateMobileCharts(scenario: ScenarioModel): EvidencePackage["charts"] {
  const startTime = new Date(scenario.windowHint.start);
  const endTime = new Date(startTime.getTime() + scenario.windowHint.durationMinutes * 60 * 1000);
  const chartTimestamps = buildTimeSeriesTimestamps(startTime, endTime, 5);
  const apiHealthSignal = getRequiredMetricSignal(scenario, "api_success_rate");
  const featureSignal = getRequiredMetricSignal(scenario, "feature_tile_success_rate");
  const appVersionImpact = getRequiredSegmentImpact(scenario, "app_version");
  const platformImpact = getRequiredSegmentImpact(scenario, "platform");
  const apiSeries = interpolateSeries(apiHealthSignal.from, apiHealthSignal.to, chartTimestamps);
  const featureSuccessSeries = interpolateSeries(featureSignal.from, featureSignal.to, chartTimestamps);
  const featureFailureSeries = featureSuccessSeries.map((value) => roundToOneDecimal(100 - value));
  const unaffectedAppVersion = appVersionImpact.unaffected?.[0] ?? "previous";

  return [
    {
      id: "api-success-rate",
      title: "API Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "rewards_api",
          label: "Rewards API",
          color: "#44d17a",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: apiSeries[index],
          })),
        },
      ],
    },
    {
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
            value: featureFailureSeries[index],
          })),
        },
      ],
    },
    {
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
    },
  ];
}

function generateDiscoverCharts(scenario: ScenarioModel): EvidencePackage["charts"] {
  const startTime = new Date(scenario.windowHint.start);
  const endTime = new Date(startTime.getTime() + scenario.windowHint.durationMinutes * 60 * 1000);
  const chartTimestamps = buildTimeSeriesTimestamps(startTime, endTime, 5);
  const apiHealthSignal = getRequiredMetricSignal(scenario, "api_success_rate");
  const activationSignal = getRequiredMetricSignal(scenario, "activation_success_rate");
  const productImpact = getRequiredSegmentImpact(scenario, "product_type");
  const statusCodeSignals = getSignalParameters(scenario, "status_code_spike");
  const apiSeries = interpolateSeries(apiHealthSignal.from, apiHealthSignal.to, chartTimestamps);
  const activationSeries = interpolateSeries(activationSignal.from, activationSignal.to, chartTimestamps);

  return [
    {
      id: "api-success-rate",
      title: "API Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "offers_api",
          label: "Offers API",
          color: "#44d17a",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: apiSeries[index],
          })),
        },
      ],
    },
    {
      id: "activation-success-rate",
      title: "Offer Activation Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "activation_success",
          label: "Activation Success Rate",
          color: "#ffd166",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: activationSeries[index],
          })),
        },
      ],
    },
    {
      id: "activation-403-spike",
      title: "403 Responses",
      kind: "stacked-bar",
      unit: "count",
      series: [
        {
          id: "200",
          label: "200",
          color: "#2ec4ff",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: [420, 415, 332, 251, 228][index],
          })),
        },
        ...statusCodeSignals.map((signal) => ({
          id: String(signal.statusCode),
          label: String(signal.statusCode),
          color: "#ff4d6d",
          points: chartTimestamps.map((timestamp, pointIndex) => ({
            timestamp,
            value: interpolateCount(signal.baseline, signal.peak, pointIndex, chartTimestamps.length),
          })),
        })),
      ],
    },
    {
      id: "activation-outcome-comparison",
      title: "Activation Outcome Comparison",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "discover_success",
          label: "Discover Success Rate",
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
        {
          id: "visa_success",
          label: "Visa Success Rate",
          color: "#6ee7b7",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(productImpact.baselinePercent + 0.3, productImpact.baselinePercent, index, chartTimestamps.length),
            ),
          })),
        },
        {
          id: "mastercard_success",
          label: "Mastercard Success Rate",
          color: "#9bdbff",
          points: chartTimestamps.map((timestamp, index) => ({
            timestamp,
            value: roundToOneDecimal(
              interpolateValue(productImpact.baselinePercent + 0.1, productImpact.baselinePercent - 0.2, index, chartTimestamps.length),
            ),
          })),
        },
      ],
    },
  ];
}
