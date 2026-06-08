import { describe, expect, it } from "vitest";
import { mobileEnumMappingEvidencePackage } from "../../domain/evidence/mobileEnumMappingEvidencePackage";
import { buildEvidenceView } from "../generation/EvidenceViewBuilder";
import { generateMetricStreams } from "../generation/MetricStreamGenerator";
import { generateTimeIndexedEvents } from "../generation/TimeIndexedEventGenerator";
import { backendTimeoutScenario } from "../../domain/scenarios/backendTimeoutScenario";
import { buildVisibleEvidenceForSession } from "./useSimulationSession";

describe("buildVisibleEvidenceForSession", () => {
  it("uses stream-backed evidence for generated backend timeout", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);
    const streamSnapshot = JSON.stringify(metricStreams);
    const eventSnapshot = JSON.stringify(timeIndexedEvents);

    const visibleEvidence = buildVisibleEvidenceForSession(
      {
        mode: "stream",
        scenario: backendTimeoutScenario,
        metricStreams,
        timeIndexedEvents,
      },
      "2026-06-07T14:05:00Z",
    );

    const successRateChart = visibleEvidence.charts.find((chart) => chart.id === "success-rate");
    const latencyChart = visibleEvidence.charts.find((chart) => chart.id === "p95-latency");

    expect(latencyChart).toBeTruthy();
    expect(successRateChart?.series[0]?.points.length).toBeGreaterThan(2);
    expect(JSON.stringify(metricStreams)).toBe(streamSnapshot);
    expect(JSON.stringify(timeIndexedEvents)).toBe(eventSnapshot);
  });

  it("uses static evidence filtering for other scenarios", () => {
    const visibleEvidence = buildVisibleEvidenceForSession(
      {
        mode: "static",
        evidencePackage: mobileEnumMappingEvidencePackage,
      },
      "2026-06-07T14:09:30Z",
    );
    const apiSuccessChart = visibleEvidence.charts.find((chart) => chart.id === "api-success-rate");

    expect(apiSuccessChart?.series[0]?.points.length).toBeLessThan(
      mobileEnumMappingEvidencePackage.charts.find((chart) => chart.id === "api-success-rate")?.series[0]
        ?.points.length ?? Number.MAX_SAFE_INTEGER,
    );
    expect(visibleEvidence.charts.some((chart) => chart.id === "p95-latency")).toBe(false);
  });

  it("reveals additional backend timeout chart points as currentTime advances", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);
    const earlyEvidence = buildEvidenceView({
      scenario: backendTimeoutScenario,
      metricStreams,
      timeIndexedEvents,
      currentTime: "2026-06-07T14:02:00Z",
    });
    const laterEvidence = buildEvidenceView({
      scenario: backendTimeoutScenario,
      metricStreams,
      timeIndexedEvents,
      currentTime: "2026-06-07T14:12:00Z",
    });

    const earlyPoints =
      earlyEvidence.charts.find((chart) => chart.id === "success-rate")?.series[0]?.points.length ?? 0;
    const laterPoints =
      laterEvidence.charts.find((chart) => chart.id === "success-rate")?.series[0]?.points.length ?? 0;

    expect(laterPoints).toBeGreaterThan(earlyPoints);
    expect(
      laterEvidence.charts
        .find((chart) => chart.id === "success-rate")
        ?.series[0]?.points.every((point) => Date.parse(point.timestamp) <= Date.parse("2026-06-07T14:12:00Z")),
    ).toBe(true);
  });

  it("hides future backend timeout log, trace, and timeline events", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);

    const visibleEvidence = buildVisibleEvidenceForSession(
      {
        mode: "stream",
        scenario: backendTimeoutScenario,
        metricStreams,
        timeIndexedEvents,
      },
      "2026-06-07T14:05:00Z",
    );

    expect(visibleEvidence.logs).toHaveLength(0);
    expect(visibleEvidence.traces).toHaveLength(0);
    expect(visibleEvidence.timelineMarkers).toHaveLength(1);
    expect(visibleEvidence.timelineMarkers[0]?.timestamp).toBe("2026-06-07T14:05:00.000Z");
  });
});
