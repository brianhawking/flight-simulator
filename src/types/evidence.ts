export type EvidencePackage = {
  id: string;
  version: string;
  title: string;
  scenarioId: string;
  window: {
    start: string;
    end: string;
    timezone: string;
  };
  summaryCards: SummaryCard[];
  charts: ChartDefinition[];
  breakdowns: BreakdownDefinition[];
  logs: LogRecord[];
  traces: TraceRecord[];
  timelineMarkers: TimelineMarker[];
  metadata?: {
    serviceName?: string;
    environment?: string;
    ownerTeam?: string;
    platforms?: string[];
  };
};

export type SummaryCard = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  status?: "normal" | "warning" | "critical";
};

export type ChartDefinition = {
  id: string;
  title: string;
  kind: "line" | "area" | "stacked-bar";
  unit: "percent" | "count" | "ms";
  series: ChartSeries[];
};

export type ChartSeries = {
  id: string;
  label: string;
  color?: string;
  points: Array<{
    timestamp: string;
    value: number;
  }>;
};

export type LogRecord = {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR";
  service: string;
  message: string;
  attributes?: Record<string, string | number | boolean>;
};

export type TraceRecord = {
  id: string;
  timestamp: string;
  traceName: string;
  service: string;
  durationMs: number;
  status: "ok" | "error" | "timeout";
  observedBehavior?: string;
  spans: TraceSpan[];
};

export type TraceSpan = {
  id: string;
  parentId?: string;
  service: string;
  operation: string;
  durationMs: number;
  status: "ok" | "error" | "timeout";
  attributes?: Record<string, string | number | boolean>;
};

export type TimelineMarker = {
  id: string;
  timestamp: string;
  label: string;
  category: "symptom" | "investigation" | "cause" | "impact";
};

export type BreakdownDefinition = {
  id: string;
  title: string;
  dimension: string;
  unit?: "percent" | "count" | "ms";
  rows: BreakdownRow[];
};

export type BreakdownRow = {
  label: string;
  value: string | number;
  status?: "normal" | "warning" | "critical";
  metadata?: Record<string, string | number | boolean>;
};
