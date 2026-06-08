import { expect } from "vitest";
import { BreakdownRow, ChartDefinition, EvidencePackage, TimelineMarker, TraceRecord } from "../types/evidence";

export function assertEvidencePackageContract(evidencePackage: EvidencePackage) {
  expect(evidencePackage.id).toBeTruthy();
  expect(evidencePackage.version).toBeTruthy();
  expect(evidencePackage.title).toBeTruthy();
  expect(evidencePackage.scenarioId).toBeTruthy();
  expect(evidencePackage.window).toEqual(
    expect.objectContaining({
      start: expect.any(String),
      end: expect.any(String),
      timezone: expect.any(String),
    }),
  );

  expect(Array.isArray(evidencePackage.summaryCards)).toBe(true);
  expect(Array.isArray(evidencePackage.charts)).toBe(true);
  expect(Array.isArray(evidencePackage.breakdowns)).toBe(true);
  expect(Array.isArray(evidencePackage.logs)).toBe(true);
  expect(Array.isArray(evidencePackage.traces)).toBe(true);
  expect(Array.isArray(evidencePackage.timelineMarkers)).toBe(true);

  expectUniqueIds(evidencePackage.summaryCards.map((item) => item.id));
  expectUniqueIds(evidencePackage.charts.map((item) => item.id));
  expectUniqueIds(evidencePackage.breakdowns.map((item) => item.id));
  expectUniqueIds(evidencePackage.logs.map((item) => item.id));
  expectUniqueIds(evidencePackage.traces.map((item) => item.id));
  expectUniqueIds(evidencePackage.timelineMarkers.map((item) => item.id));

  evidencePackage.charts.forEach((chart) => {
    expect(chart.series.length).toBeGreaterThan(0);

    chart.series.forEach((series) => {
      expect(series.points.length).toBeGreaterThan(0);

      series.points.forEach((point) => {
        expect(isValidDate(point.timestamp)).toBe(true);

        if (chart.unit === "percent") {
          expect(point.value).toBeGreaterThanOrEqual(0);
          expect(point.value).toBeLessThanOrEqual(100);
        }

        if (isNonNegativeChart(chart)) {
          expect(point.value).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  const start = Date.parse(evidencePackage.window.start);
  const end = Date.parse(evidencePackage.window.end);
  const validCategories: TimelineMarker["category"][] = ["symptom", "investigation", "cause", "impact"];

  evidencePackage.timelineMarkers.forEach((marker) => {
    const timestamp = Date.parse(marker.timestamp);

    expect(Number.isNaN(timestamp)).toBe(false);
    expect(timestamp).toBeGreaterThanOrEqual(start);
    expect(timestamp).toBeLessThanOrEqual(end);
    expect(validCategories).toContain(marker.category);
  });

  const sortedTimestamps = evidencePackage.timelineMarkers
    .map((marker) => Date.parse(marker.timestamp))
    .sort((left, right) => left - right);

  expect(sortedTimestamps).toHaveLength(evidencePackage.timelineMarkers.length);
  expect(sortedTimestamps.every((timestamp) => Number.isNaN(timestamp) === false)).toBe(true);

  evidencePackage.traces.forEach((trace) => {
    assertTraceValidity(trace);
  });

  const validStatuses: Array<BreakdownRow["status"]> = ["normal", "warning", "critical", undefined];

  evidencePackage.breakdowns.forEach((breakdown) => {
    expect(breakdown.dimension).toBeTruthy();
    expect(breakdown.rows.length).toBeGreaterThan(0);

    breakdown.rows.forEach((row) => {
      expect(validStatuses).toContain(row.status);
    });
  });
}

function expectUniqueIds(ids: string[]) {
  expect(ids.length).toBe(new Set(ids).size);
}

function isValidDate(timestamp: string) {
  return Number.isNaN(Date.parse(timestamp)) === false;
}

function isNonNegativeChart(chart: ChartDefinition) {
  return chart.kind === "stacked-bar" || chart.unit === "count";
}

function assertTraceValidity(trace: TraceRecord) {
  expect(trace.spans.length).toBeGreaterThan(0);

  const spanIds = new Set(trace.spans.map((span) => span.id));

  trace.spans.forEach((span) => {
    if (span.parentId) {
      expect(spanIds.has(span.parentId)).toBe(true);
    }
  });

  if (trace.status === "error" || trace.status === "timeout") {
    expect(trace.spans.some((span) => span.status === trace.status)).toBe(true);
  }
}
