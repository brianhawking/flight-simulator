import { EvidencePackage, SummaryCard } from "../../domain/types/evidence";

export function filterEvidenceForTime(
  evidencePackage: EvidencePackage,
  currentTime: string,
): EvidencePackage {
  const currentTimeMs = Date.parse(currentTime);

  const visibleCharts = evidencePackage.charts.map((chart) => ({
    ...chart,
    series: chart.series.map((series) => ({
      ...series,
      points: series.points.filter((point) => Date.parse(point.timestamp) <= currentTimeMs),
    })),
  }));

  return {
    ...evidencePackage,
    summaryCards: deriveVisibleSummaryCards(evidencePackage.summaryCards, visibleCharts),
    charts: visibleCharts,
    breakdowns: evidencePackage.breakdowns.map((breakdown) => ({
      ...breakdown,
      rows: breakdown.rows.map((row) => ({
        ...row,
        metadata: row.metadata ? { ...row.metadata } : undefined,
      })),
    })),
    logs: evidencePackage.logs
      .filter((log) => Date.parse(log.timestamp) <= currentTimeMs)
      .map((log) => ({
        ...log,
        attributes: log.attributes ? { ...log.attributes } : undefined,
      })),
    traces: evidencePackage.traces
      .filter((trace) => Date.parse(trace.timestamp) <= currentTimeMs)
      .map((trace) => ({
        ...trace,
        spans: trace.spans.map((span) => ({
          ...span,
          attributes: span.attributes ? { ...span.attributes } : undefined,
        })),
      })),
    timelineMarkers: evidencePackage.timelineMarkers
      .filter((marker) => Date.parse(marker.timestamp) <= currentTimeMs)
      .map((marker) => ({ ...marker })),
    metadata: evidencePackage.metadata
      ? {
          ...evidencePackage.metadata,
          platforms: evidencePackage.metadata.platforms
            ? [...evidencePackage.metadata.platforms]
            : undefined,
        }
      : undefined,
  };
}

function deriveVisibleSummaryCards(
  summaryCards: EvidencePackage["summaryCards"],
  visibleCharts: EvidencePackage["charts"],
): SummaryCard[] {
  return summaryCards.map((card) => {
    const matchingValue = findMatchingChartValue(card.label, visibleCharts);

    if (matchingValue === null) {
      return { ...card };
    }

    return {
      ...card,
      value: matchingValue,
    };
  });
}

function findMatchingChartValue(
  label: string,
  visibleCharts: EvidencePackage["charts"],
): string | null {
  const normalizedLabel = normalize(label);

  const matchingChart = visibleCharts.find((chart) => {
    const normalizedTitle = normalize(chart.title);

    if (normalizedTitle.includes(normalizedLabel) || normalizedLabel.includes(normalizedTitle)) {
      return true;
    }

    if (
      /success/.test(normalizedLabel) &&
      /success/.test(normalizedTitle)
    ) {
      return true;
    }

    if (
      /(latency|response)/.test(normalizedLabel) &&
      /(latency|response)/.test(normalizedTitle)
    ) {
      return true;
    }

    if (
      /(error rate|failure rate)/.test(normalizedLabel) &&
      /(error|failure)/.test(normalizedTitle)
    ) {
      return true;
    }

    return false;
  });

  if (!matchingChart) {
    return null;
  }

  const visiblePoints = matchingChart.series.flatMap((series) => series.points);
  if (visiblePoints.length === 0) {
    return null;
  }

  if (matchingChart.series.length !== 1) {
    return null;
  }

  const series = matchingChart.series[0];
  const lastPoint = series.points[series.points.length - 1];
  if (!lastPoint) {
    return null;
  }

  return formatChartValue(lastPoint.value, matchingChart.unit);
}

function formatChartValue(value: number, unit: EvidencePackage["charts"][number]["unit"]) {
  if (unit === "percent") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "ms") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }

    return `${Math.round(value)}ms`;
  }

  return Math.round(value).toString();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
