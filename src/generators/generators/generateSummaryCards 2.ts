import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";
import {
  formatSignedPercent,
  formatSignedSeconds,
  getRequiredMetricSignal,
  getRequiredSegmentImpact,
  getRequiredSignalParameter,
  getSignalParameters,
  roundToOneDecimal,
} from "../generatorUtils";

export function generateSummaryCards(scenario: ScenarioModel): EvidencePackage["summaryCards"] {
  switch (scenario.id) {
    case "scenario_backend_api_timeout":
      return generateBackendSummaryCards(scenario);
    case "scenario_mobile_enum_mapping_failure":
      return generateMobileSummaryCards(scenario);
    case "scenario_discover_offer_activation_failure":
      return generateDiscoverSummaryCards(scenario);
    default:
      throw new Error(`Unsupported scenario for summary card generation: ${scenario.id}`);
  }
}

function generateBackendSummaryCards(scenario: ScenarioModel): EvidencePackage["summaryCards"] {
  const successRateDrop = getRequiredMetricSignal(scenario, "success_rate");
  const latencyIncrease = getRequiredSignalParameter(scenario, "latency_increase");
  const statusCodeSignals = getSignalParameters(scenario, "status_code_spike");
  const segmentImpact = getRequiredSegmentImpact(scenario, "platform");
  const affectedPlatforms = scenario.serviceContext.affectedPlatforms ?? segmentImpact.affected;
  const successRateDelta = roundToOneDecimal(successRateDrop.to - successRateDrop.from);
  const latencyDeltaSeconds = roundToOneDecimal((latencyIncrease.toMs - latencyIncrease.fromMs) / 1000);
  const totalStatusPeak = statusCodeSignals.reduce((total, signal) => total + signal.peak, 0);
  const totalStatusBaseline = statusCodeSignals.reduce((total, signal) => total + signal.baseline, 0);
  const errorRate = roundToOneDecimal((totalStatusPeak / 1250) * 100);
  const errorRateDelta = roundToOneDecimal(((totalStatusPeak - totalStatusBaseline) / 1250) * 100);

  return [
    {
      id: "success_rate",
      label: "Success Rate",
      value: `${roundToOneDecimal(successRateDrop.to).toFixed(1)}%`,
      delta: `${formatSignedPercent(successRateDelta)}%`,
      status: "critical",
    },
    {
      id: "p95_latency",
      label: "P95 Latency",
      value: `${roundToOneDecimal(latencyIncrease.toMs / 1000).toFixed(1)}s`,
      delta: `${formatSignedSeconds(latencyDeltaSeconds)}s`,
      status: "critical",
    },
    {
      id: "error_rate",
      label: "Error Rate",
      value: `${errorRate.toFixed(1)}%`,
      delta: `${formatSignedPercent(errorRateDelta)}%`,
      status: "critical",
    },
    {
      id: "affected_platforms",
      label: "Affected Platforms",
      value: affectedPlatforms.join(" + "),
      status: "warning",
    },
  ];
}

function generateMobileSummaryCards(scenario: ScenarioModel): EvidencePackage["summaryCards"] {
  const apiHealthSignal = getRequiredMetricSignal(scenario, "api_success_rate");
  const featureSignal = getRequiredMetricSignal(scenario, "feature_tile_success_rate");
  const platformImpact = getRequiredSegmentImpact(scenario, "platform");
  const appVersionImpact = getRequiredSegmentImpact(scenario, "app_version");
  const apiDelta = roundToOneDecimal(apiHealthSignal.to - apiHealthSignal.from);
  const featureFailureRate = roundToOneDecimal(100 - featureSignal.to);
  const featureFailureDelta = roundToOneDecimal(featureFailureRate - (100 - featureSignal.from));

  return [
    {
      id: "api_success_rate",
      label: "API Success Rate",
      value: `${apiHealthSignal.to.toFixed(1)}%`,
      delta: `${formatSignedPercent(apiDelta)}%`,
      status: "normal",
    },
    {
      id: "tile_failure_rate",
      label: "Feature Tile Failure Rate",
      value: `${featureFailureRate.toFixed(1)}%`,
      delta: `${formatSignedPercent(featureFailureDelta)}%`,
      status: "critical",
    },
    {
      id: "affected_platform",
      label: "Affected Platform",
      value: platformImpact.affected.join(", "),
      status: "critical",
    },
    {
      id: "affected_segment",
      label: "Affected App Version",
      value: appVersionImpact.affected.join(", "),
      status: "warning",
    },
  ];
}

function generateDiscoverSummaryCards(scenario: ScenarioModel): EvidencePackage["summaryCards"] {
  const apiHealthSignal = getRequiredMetricSignal(scenario, "api_success_rate");
  const activationSignal = getRequiredMetricSignal(scenario, "activation_success_rate");
  const productImpact = getRequiredSegmentImpact(scenario, "product_type");
  const apiDelta = roundToOneDecimal(apiHealthSignal.to - apiHealthSignal.from);
  const activationFailureRate = roundToOneDecimal(100 - activationSignal.to);
  const activationFailureDelta = roundToOneDecimal(activationFailureRate - (100 - activationSignal.from));

  return [
    {
      id: "api_success_rate",
      label: "API Success Rate",
      value: `${apiHealthSignal.to.toFixed(1)}%`,
      delta: `${formatSignedPercent(apiDelta)}%`,
      status: "normal",
    },
    {
      id: "activation_failure_rate",
      label: "Activation Failure Rate",
      value: `${activationFailureRate.toFixed(1)}%`,
      delta: `${formatSignedPercent(activationFailureDelta)}%`,
      status: "critical",
    },
    {
      id: "affected_product",
      label: "Affected Product",
      value: productImpact.affected.join(", "),
      status: "critical",
    },
    {
      id: "customer_impact",
      label: "Customer Impact",
      value: "Offer visible, activation blocked",
      status: "warning",
    },
  ];
}
