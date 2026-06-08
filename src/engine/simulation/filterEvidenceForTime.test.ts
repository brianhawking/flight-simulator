import { describe, expect, it } from "vitest";
import { backendTimeoutEvidencePackage } from "../../domain/evidence/backendTimeoutEvidencePackage";
import { filterEvidenceForTime } from "./filterEvidenceForTime";

describe("filterEvidenceForTime", () => {
  it("hides chart points after the current simulation time", () => {
    const visibleEvidence = filterEvidenceForTime(
      backendTimeoutEvidencePackage,
      "2026-06-07T14:09:30Z",
    );
    const successRateChart = visibleEvidence.charts.find((chart) => chart.id === "success-rate");

    expect(successRateChart?.series[0]?.points).toHaveLength(2);
    expect(successRateChart?.series[0]?.points[1]?.timestamp).toBe("2026-06-07T14:05:00Z");
  });

  it("hides logs, traces, and timeline markers after the current simulation time", () => {
    const visibleEvidence = filterEvidenceForTime(
      backendTimeoutEvidencePackage,
      "2026-06-07T14:06:00Z",
    );

    expect(visibleEvidence.logs).toHaveLength(0);
    expect(visibleEvidence.traces).toHaveLength(0);
    expect(visibleEvidence.timelineMarkers.map((marker) => marker.id)).toEqual([
      "marker_1",
      "marker_2",
    ]);
  });

  it("can derive a latest visible summary value when a matching chart exists", () => {
    const visibleEvidence = filterEvidenceForTime(
      backendTimeoutEvidencePackage,
      "2026-06-07T14:09:30Z",
    );
    const successRateCard = visibleEvidence.summaryCards.find((card) => card.id === "success_rate");

    expect(successRateCard?.value).toBe("97.8%");
  });

  it("does not mutate the original evidence package", () => {
    const originalSnapshot = JSON.stringify(backendTimeoutEvidencePackage);

    filterEvidenceForTime(backendTimeoutEvidencePackage, "2026-06-07T14:09:30Z");

    expect(JSON.stringify(backendTimeoutEvidencePackage)).toBe(originalSnapshot);
  });
});
