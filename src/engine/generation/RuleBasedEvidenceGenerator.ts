import { EvidencePackage } from "../../domain/types/evidence";
import { ScenarioModel } from "../../domain/types/scenario";
import { addMinutes, getRequiredSegmentImpact } from "./generatorUtils";
import { generateBreakdowns } from "./evidence-builders/generateBreakdowns";
import { generateCharts } from "./evidence-builders/generateCharts";
import { generateLogs } from "./evidence-builders/generateLogs";
import { generateSummaryCards } from "./evidence-builders/generateSummaryCards";
import { generateTimelineMarkers } from "./evidence-builders/generateTimelineMarkers";
import { generateTraces } from "./evidence-builders/generateTraces";

export function generateEvidence(scenario: ScenarioModel): EvidencePackage {
  assertSupportedScenario(scenario);

  const startTime = new Date(scenario.windowHint.start);
  const endTime = addMinutes(startTime, scenario.windowHint.durationMinutes);
  const affectedPlatforms =
    scenario.serviceContext.affectedPlatforms ??
    getRequiredSegmentImpact(scenario, "platform").affected;

  return {
    id: `generated_${scenario.id}_v1`,
    version: "1",
    title: `${scenario.title} (Generated)`,
    scenarioId: scenario.id,
    window: {
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      timezone: scenario.windowHint.timezone,
    },
    metadata: {
      serviceName: scenario.serviceContext.primaryService,
      environment: scenario.serviceContext.environment,
      ownerTeam: scenario.serviceContext.ownerTeam,
      platforms: affectedPlatforms,
    },
    summaryCards: generateSummaryCards(scenario),
    charts: generateCharts(scenario),
    breakdowns: generateBreakdowns(scenario),
    logs: generateLogs(scenario),
    traces: generateTraces(scenario),
    timelineMarkers: generateTimelineMarkers(startTime, scenario.timelineHints),
  };
}

function assertSupportedScenario(scenario: ScenarioModel) {
  const hasSuccessMetric = scenario.signalParameters.some(
    (parameter) => parameter.type === "success_rate_drop",
  );
  const hasLogOrTimeout =
    scenario.signalParameters.some((parameter) => parameter.type === "log_pattern") ||
    scenario.signalParameters.some((parameter) => parameter.type === "downstream_timeout");
  const hasTraceSeed =
    scenario.signalParameters.some((parameter) => parameter.type === "request_outcome") ||
    scenario.signalParameters.some((parameter) => parameter.type === "downstream_timeout");
  const hasSegments = scenario.signalParameters.some((parameter) => parameter.type === "segment_impact");

  if (!hasSuccessMetric || !hasLogOrTimeout || !hasTraceSeed || !hasSegments) {
    throw new Error(`Unsupported scenario for rule-based generation: ${scenario.id}`);
  }
}
