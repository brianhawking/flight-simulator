import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";
import { getRequiredSignalParameter, getSignalParameters } from "../generatorUtils";

export function generateLogs(scenario: ScenarioModel): EvidencePackage["logs"] {
  switch (scenario.id) {
    case "scenario_backend_api_timeout":
      return generateBackendLogs(scenario);
    case "scenario_mobile_enum_mapping_failure":
      return generateMobileLogs(scenario);
    case "scenario_discover_offer_activation_failure":
      return generateDiscoverLogs(scenario);
    default:
      throw new Error(`Unsupported scenario for log generation: ${scenario.id}`);
  }
}

function generateBackendLogs(scenario: ScenarioModel): EvidencePackage["logs"] {
  const affectedPlatforms =
    scenario.serviceContext.affectedPlatforms ??
    scenario.affectedSegments.find((segment) => segment.dimension === "platform")?.affected ??
    ["iOS", "Android"];
  const timeoutSignal = getRequiredSignalParameter(scenario, "downstream_timeout");
  const statusCodeSignals = getSignalParameters(scenario, "status_code_spike");
  const firstStatusCode = statusCodeSignals[1]?.statusCode ?? statusCodeSignals[0]?.statusCode ?? 504;
  const secondStatusCode = statusCodeSignals[0]?.statusCode ?? 500;

  return [
    {
      id: "log_1",
      timestamp: "2026-06-07T14:09:10Z",
      level: "ERROR",
      service: scenario.serviceContext.primaryService,
      message: `Upstream request failed: timeout waiting for ${timeoutSignal.dependency}`,
      attributes: {
        route: timeoutSignal.route,
        platform: affectedPlatforms[0] ?? "iOS",
        statusCode: firstStatusCode,
      },
    },
    {
      id: "log_2",
      timestamp: "2026-06-07T14:09:42Z",
      level: "ERROR",
      service: scenario.serviceContext.primaryService,
      message: "Dependency timeout bubbled to 500 response",
      attributes: {
        route: timeoutSignal.route,
        platform: affectedPlatforms[1] ?? affectedPlatforms[0] ?? "Android",
        statusCode: secondStatusCode,
      },
    },
    {
      id: "log_3",
      timestamp: "2026-06-07T14:10:16Z",
      level: "WARN",
      service: scenario.serviceContext.primaryService,
      message: "Retry budget exhausted for downstream profile lookup",
      attributes: {
        route: timeoutSignal.route,
        downstreamService: timeoutSignal.dependency,
      },
    },
  ];
}

function generateMobileLogs(scenario: ScenarioModel): EvidencePackage["logs"] {
  const logPatterns = getSignalParameters(scenario, "log_pattern");

  return logPatterns.map((pattern, index) => ({
    id: `log_${index + 1}`,
    timestamp:
      ["2026-06-07T15:11:22Z", "2026-06-07T15:12:05Z", "2026-06-07T15:14:40Z"][index] ??
      "2026-06-07T15:15:00Z",
    level: pattern.level,
    service: pattern.service,
    message: pattern.message,
    attributes: pattern.attributes,
  }));
}

function generateDiscoverLogs(scenario: ScenarioModel): EvidencePackage["logs"] {
  const logPatterns = getSignalParameters(scenario, "log_pattern");

  return logPatterns.map((pattern, index) => ({
    id: `log_${index + 1}`,
    timestamp:
      ["2026-06-07T16:10:31Z", "2026-06-07T16:12:18Z", "2026-06-07T16:13:47Z"][index] ??
      "2026-06-07T16:15:00Z",
    level: pattern.level,
    service: pattern.service,
    message: pattern.message,
    attributes: pattern.attributes,
  }));
}
