import { EvidencePackage } from "../../../domain/types/evidence";
import { ScenarioModel } from "../../../domain/types/scenario";
import { getSignalParameters } from "../generatorUtils";

export function generateLogs(scenario: ScenarioModel): EvidencePackage["logs"] {
  const logPatterns = getSignalParameters(scenario, "log_pattern");
  if (logPatterns.length > 0) {
    return logPatterns.map((pattern, index) => ({
      id: `log_${index + 1}`,
      timestamp: buildPatternTimestamp(scenario, index),
      level: pattern.level,
      service: pattern.service,
      message: pattern.message,
      attributes: pattern.attributes,
    }));
  }

  const timeoutSignal = scenario.signalParameters.find((parameter) => parameter.type === "downstream_timeout");
  if (timeoutSignal?.type === "downstream_timeout") {
    const affectedPlatforms =
      scenario.serviceContext.affectedPlatforms ??
      scenario.affectedSegments.find((segment) => segment.dimension === "platform")?.affected ??
      ["iOS", "Android"];
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

  return [];
}

function buildPatternTimestamp(scenario: ScenarioModel, index: number) {
  const startTime = Date.parse(scenario.windowHint.start);
  const causeOrImpactHint = scenario.timelineHints.find(
    (hint) => hint.category === "cause" || hint.category === "impact",
  );
  const baseMs =
    causeOrImpactHint !== undefined
      ? startTime + causeOrImpactHint.minuteOffset * 60 * 1000
      : startTime + (10 + index * 2) * 60 * 1000;

  return new Date(baseMs + index * 37 * 1000).toISOString();
}
