import { describe, expect, it, vi } from "vitest";
import { assertEvidencePackageContract } from "../evidence/evidenceContractAssertions";
import { backendTimeoutScenario } from "../scenarios/backendTimeoutScenario";
import { generateMetricStreams } from "./MetricStreamGenerator";
import { generateTimeIndexedEvents } from "./TimeIndexedEventGenerator";
import { buildEvidenceView } from "./EvidenceViewBuilder";
import * as ruleBasedEvidenceGenerator from "./RuleBasedEvidenceGenerator";

describe("EvidenceViewBuilder", () => {
  it("derives an evidence package that hides future chart points", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);
    const evidenceView = buildEvidenceView({
      scenario: backendTimeoutScenario,
      metricStreams,
      timeIndexedEvents,
      currentTime: "2026-06-07T14:05:00Z",
    });

    const successRateChart = evidenceView.charts.find((chart) => chart.id === "success-rate");
    const latencyChart = evidenceView.charts.find((chart) => chart.id === "p95-latency");

    expect(
      Date.parse(
        successRateChart?.series[0]?.points[(successRateChart?.series[0]?.points.length ?? 1) - 1]
          ?.timestamp ?? "",
      ),
    ).toBe(Date.parse("2026-06-07T14:05:00Z"));
    expect(successRateChart?.series[0]?.points.every((point) => point.timestamp <= "2026-06-07T14:05:00Z")).toBe(
      true,
    );
    expect(latencyChart?.series[0]?.points.length).toBeGreaterThan(0);
    expect(evidenceView.timelineMarkers.every((marker) => marker.timestamp <= "2026-06-07T14:05:00Z")).toBe(
      true,
    );
  });

  it("does not mutate metric streams and produces a contract-valid evidence package", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);
    const streamSnapshot = JSON.stringify(metricStreams);
    const eventSnapshot = JSON.stringify(timeIndexedEvents);

    const evidenceView = buildEvidenceView({
      scenario: backendTimeoutScenario,
      metricStreams,
      timeIndexedEvents,
      currentTime: "2026-06-07T14:20:00Z",
    });

    expect(JSON.stringify(metricStreams)).toBe(streamSnapshot);
    expect(JSON.stringify(timeIndexedEvents)).toBe(eventSnapshot);
    assertEvidencePackageContract(evidenceView);
    expect(evidenceView.charts.some((chart) => chart.id === "p95-latency")).toBe(true);
  });

  it("builds backend timeout evidence without calling the rule-based generator", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);
    const timeIndexedEvents = generateTimeIndexedEvents(backendTimeoutScenario);
    const generateEvidenceSpy = vi.spyOn(ruleBasedEvidenceGenerator, "generateEvidence");

    const evidenceView = buildEvidenceView({
      scenario: backendTimeoutScenario,
      metricStreams,
      timeIndexedEvents,
      currentTime: "2026-06-07T14:12:00Z",
    });

    expect(generateEvidenceSpy).not.toHaveBeenCalled();
    expect(evidenceView.logs.length).toBeGreaterThan(0);
    expect(evidenceView.traces.length).toBeGreaterThan(0);
    expect(evidenceView.timelineMarkers.length).toBeGreaterThan(0);
    expect(evidenceView.summaryCards.find((card) => card.id === "success_rate")?.value).not.toBe("82.3%");

    generateEvidenceSpy.mockRestore();
  });
});
