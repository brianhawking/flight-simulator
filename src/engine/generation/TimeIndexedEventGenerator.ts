import { generateLogs } from "./evidence-builders/generateLogs";
import { generateTimelineMarkers } from "./evidence-builders/generateTimelineMarkers";
import { generateTraces } from "./evidence-builders/generateTraces";
import { TimeIndexedEvent } from "../../domain/types/metrics";
import { ScenarioModel } from "../../domain/types/scenario";

export function generateTimeIndexedEvents(scenario: ScenarioModel): TimeIndexedEvent[] {
  assertSupportedScenario(scenario);

  const startTime = new Date(scenario.windowHint.start);
  const timelineEvents: TimeIndexedEvent[] = generateTimelineMarkers(startTime, scenario.timelineHints).map(
    (marker) => ({
      id: `event_${marker.id}`,
      timestamp: marker.timestamp,
      type: "timeline_marker",
      payload: marker,
    }),
  );
  const logEvents: TimeIndexedEvent[] = generateLogs(scenario).map((log) => ({
    id: `event_${log.id}`,
    timestamp: log.timestamp,
    type: "log",
    payload: log,
  }));
  const traceEvents: TimeIndexedEvent[] = generateTraces(scenario).map((trace) => ({
    id: `event_${trace.id}`,
    timestamp: trace.timestamp,
    type: "trace",
    payload: trace,
  }));

  return [...timelineEvents, ...logEvents, ...traceEvents].sort(
    (left, right) => Date.parse(left.timestamp) - Date.parse(right.timestamp),
  );
}

function assertSupportedScenario(scenario: ScenarioModel) {
  if (scenario.id !== "scenario_backend_api_timeout") {
    throw new Error(`Unsupported scenario for time-indexed event generation: ${scenario.id}`);
  }
}
