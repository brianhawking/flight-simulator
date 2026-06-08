import { filterEvidenceForTime } from "../simulation/filterEvidenceForTime";
import {
  BreakdownDefinition,
  ChartDefinition,
  EvidencePackage,
  SummaryCard,
} from "../types/evidence";
import { MetricStreamBundle, TimeIndexedEvent } from "../types/metrics";
import { ScenarioModel } from "../types/scenario";
import { generateEvidence } from "./RuleBasedEvidenceGenerator";
import { generateBreakdowns } from "./generators/generateBreakdowns";
import { formatSignedPercent, formatSignedSeconds, roundToOneDecimal } from "./generatorUtils";

type BuildEvidenceViewInput = {
  scenario: ScenarioModel;
  metricStreams: MetricStreamBundle;
  currentTime: string;
  timeIndexedEvents?: TimeIndexedEvent[];
};

export function buildEvidenceView({
  scenario,
  metricStreams,
  currentTime,
  timeIndexedEvents,
}: BuildEvidenceViewInput): EvidencePackage {
  if (scenario.id === "scenario_backend_api_timeout" && timeIndexedEvents) {
    return buildBackendTimeoutEvidenceView({
      scenario,
      metricStreams,
      timeIndexedEvents,
      currentTime,
    });
  }

  const baseEvidence = generateEvidence(scenario);
  const streamBackedCharts = buildStreamBackedCharts(metricStreams, baseEvidence);

  const evidencePackage: EvidencePackage = {
    ...baseEvidence,
    charts: [
      ...baseEvidence.charts.map((chart) => {
        const replacement = streamBackedCharts.find((candidate) => candidate.id === chart.id);
        return replacement ?? chart;
      }),
      ...streamBackedCharts.filter(
        (candidate) => baseEvidence.charts.some((chart) => chart.id === candidate.id) === false,
      ),
    ],
  };

  return filterEvidenceForTime(evidencePackage, currentTime);
}

function buildBackendTimeoutEvidenceView({
  scenario,
  metricStreams,
  timeIndexedEvents,
  currentTime,
}: Required<BuildEvidenceViewInput>): EvidencePackage {
  const visibleEvents = timeIndexedEvents.filter(
    (event) => Date.parse(event.timestamp) <= Date.parse(currentTime),
  );
  const visibleCharts = buildStreamBackedCharts(metricStreams).map((chart) => ({
    ...chart,
    series: chart.series.map((series) => ({
      ...series,
      points: series.points
        .filter((point) => Date.parse(point.timestamp) <= Date.parse(currentTime))
        .map((point) => ({ ...point })),
    })),
  }));
  const summaryCards = buildBackendTimeoutSummaryCards(metricStreams, visibleCharts, scenario);

  return {
    id: `stream_${scenario.id}_v1`,
    version: "1",
    title: `${scenario.title} (Stream View)`,
    scenarioId: scenario.id,
    window: {
      start: metricStreams.window.start,
      end: metricStreams.window.end,
      timezone: metricStreams.window.timezone,
    },
    summaryCards,
    charts: visibleCharts,
    breakdowns: cloneBreakdowns(generateBreakdowns(scenario)),
    logs: visibleEvents
      .filter((event): event is Extract<TimeIndexedEvent, { type: "log" }> => event.type === "log")
      .map((event) => ({
        ...event.payload,
        attributes: event.payload.attributes ? { ...event.payload.attributes } : undefined,
      })),
    traces: visibleEvents
      .filter((event): event is Extract<TimeIndexedEvent, { type: "trace" }> => event.type === "trace")
      .map((event) => ({
        ...event.payload,
        spans: event.payload.spans.map((span) => ({
          ...span,
          attributes: span.attributes ? { ...span.attributes } : undefined,
        })),
      })),
    timelineMarkers: visibleEvents
      .filter(
        (event): event is Extract<TimeIndexedEvent, { type: "timeline_marker" }> =>
          event.type === "timeline_marker",
      )
      .map((event) => ({ ...event.payload })),
    metadata: {
      serviceName: scenario.serviceContext.primaryService,
      environment: scenario.serviceContext.environment,
      ownerTeam: scenario.serviceContext.ownerTeam,
      platforms: scenario.serviceContext.affectedPlatforms
        ? [...scenario.serviceContext.affectedPlatforms]
        : undefined,
    },
  };
}

function buildStreamBackedCharts(
  metricStreams: MetricStreamBundle,
  baseEvidence?: EvidencePackage,
): EvidencePackage["charts"] {
  const successRateStream = getRequiredStream(metricStreams, "success_rate");
  const latencyStream = getRequiredStream(metricStreams, "p95_latency");
  const status200Stream = getRequiredStream(metricStreams, "status_code_200");
  const status500Stream = getRequiredStream(metricStreams, "status_code_500");
  const status504Stream = getRequiredStream(metricStreams, "status_code_504");

  return [
    {
      id: "success-rate",
      title: "Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "all_clients",
          label: "All Clients",
          color:
            baseEvidence?.charts.find((chart) => chart.id === "success-rate")?.series[0]?.color ??
            "#44d17a",
          points: successRateStream.points.map((point) => ({ ...point })),
        },
      ],
    },
    {
      id: "p95-latency",
      title: "P95 Latency",
      kind: "line",
      unit: "ms",
      series: [
        {
          id: "p95_latency",
          label: "P95 Latency",
          color: "#f5c86d",
          points: latencyStream.points.map((point) => ({ ...point })),
        },
      ],
    },
    {
      id: "status-codes",
      title: "Status Codes",
      kind: "stacked-bar",
      unit: "count",
      series: [
        {
          id: "200",
          label: "200",
          color: "#2ec4ff",
          points: status200Stream.points.map((point) => ({ ...point })),
        },
        {
          id: "500",
          label: "500",
          color: "#ff7a45",
          points: status500Stream.points.map((point) => ({ ...point })),
        },
        {
          id: "504",
          label: "504",
          color: "#ff4d6d",
          points: status504Stream.points.map((point) => ({ ...point })),
        },
      ],
    },
  ];
}

function buildBackendTimeoutSummaryCards(
  metricStreams: MetricStreamBundle,
  visibleCharts: EvidencePackage["charts"],
  scenario: ScenarioModel,
): SummaryCard[] {
  const successStream = getRequiredStream(metricStreams, "success_rate");
  const latencyStream = getRequiredStream(metricStreams, "p95_latency");
  const status200Stream = getRequiredStream(metricStreams, "status_code_200");
  const status500Stream = getRequiredStream(metricStreams, "status_code_500");
  const status504Stream = getRequiredStream(metricStreams, "status_code_504");

  const successStart = successStream.points[0]?.value ?? 0;
  const successLatest = getLastVisibleValue(visibleCharts, "success-rate") ?? successStart;
  const latencyStart = latencyStream.points[0]?.value ?? 0;
  const latencyLatest = getLastVisibleValue(visibleCharts, "p95-latency") ?? latencyStart;
  const latest200 = getLastVisibleSeriesValue(visibleCharts, "status-codes", "200") ?? status200Stream.points[0]?.value ?? 0;
  const latest500 = getLastVisibleSeriesValue(visibleCharts, "status-codes", "500") ?? status500Stream.points[0]?.value ?? 0;
  const latest504 = getLastVisibleSeriesValue(visibleCharts, "status-codes", "504") ?? status504Stream.points[0]?.value ?? 0;
  const baseline200 = status200Stream.points[0]?.value ?? latest200;
  const baseline500 = status500Stream.points[0]?.value ?? latest500;
  const baseline504 = status504Stream.points[0]?.value ?? latest504;
  const latestErrorRate = calculateErrorRate(latest200, latest500, latest504);
  const baselineErrorRate = calculateErrorRate(baseline200, baseline500, baseline504);

  return [
    {
      id: "success_rate",
      label: "Success Rate",
      value: `${successLatest.toFixed(1)}%`,
      delta: `${formatSignedPercent(successLatest - successStart)}%`,
      status: successLatest < 93 ? "critical" : "warning",
    },
    {
      id: "p95_latency",
      label: "P95 Latency",
      value: formatLatencyValue(latencyLatest),
      delta: `${formatSignedSeconds(roundToOneDecimal((latencyLatest - latencyStart) / 1000))}s`,
      status: latencyLatest >= 3000 ? "critical" : "warning",
    },
    {
      id: "error_rate",
      label: "Error Rate",
      value: `${latestErrorRate.toFixed(1)}%`,
      delta: `${formatSignedPercent(latestErrorRate - baselineErrorRate)}%`,
      status: latestErrorRate >= 10 ? "critical" : "warning",
    },
    {
      id: "affected_platforms",
      label: "Affected Platforms",
      value: (scenario.serviceContext.affectedPlatforms ?? ["iOS", "Android"]).join(" + "),
      status: "warning",
    },
  ];
}

function cloneBreakdowns(breakdowns: BreakdownDefinition[]) {
  return breakdowns.map((breakdown) => ({
    ...breakdown,
    rows: breakdown.rows.map((row) => ({
      ...row,
      metadata: row.metadata ? { ...row.metadata } : undefined,
    })),
  }));
}

function calculateErrorRate(status200: number, status500: number, status504: number) {
  const total = status200 + status500 + status504;
  if (total <= 0) {
    return 0;
  }

  return roundToOneDecimal(((status500 + status504) / total) * 100);
}

function formatLatencyValue(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}s`;
  }

  return `${Math.round(value)}ms`;
}

function getLastVisibleValue(charts: ChartDefinition[], chartId: string) {
  const points = charts
    .find((chart) => chart.id === chartId)
    ?.series[0]?.points;

  return points?.[points.length - 1]?.value ?? null;
}

function getLastVisibleSeriesValue(
  charts: ChartDefinition[],
  chartId: string,
  seriesId: string,
) {
  const points = charts
    .find((chart) => chart.id === chartId)
    ?.series.find((series) => series.id === seriesId)?.points;

  return points?.[points.length - 1]?.value ?? null;
}

function getRequiredStream(metricStreams: MetricStreamBundle, metric: string) {
  const stream = metricStreams.streams.find((candidate) => candidate.metric === metric);

  if (!stream) {
    throw new Error(`Missing required metric stream: ${metric}`);
  }

  return stream;
}
