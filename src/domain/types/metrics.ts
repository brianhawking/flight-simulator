import { LogRecord, TimelineMarker, TraceRecord } from "./evidence";

export type MetricPoint = {
  timestamp: string;
  value: number;
};

export type MetricStream = {
  id: string;
  metric: string;
  unit: "percent" | "count" | "ms";
  resolution: "1m";
  points: MetricPoint[];
  dimensions?: Record<string, string>;
};

export type AlertThreshold = {
  id: string;
  metric: string;
  operator: "<" | ">" | "<=" | ">=";
  threshold: number;
  sustainMinutes?: number;
};

export type IncidentPhase = {
  id: string;
  label: string;
  start: string;
  end?: string;
  kind: "baseline" | "degradation" | "peak" | "recovery";
};

export type TimeIndexedEvent =
  | {
      id: string;
      timestamp: string;
      type: "log";
      payload: LogRecord;
    }
  | {
      id: string;
      timestamp: string;
      type: "trace";
      payload: TraceRecord;
    }
  | {
      id: string;
      timestamp: string;
      type: "timeline_marker";
      payload: TimelineMarker;
    };

export type MetricStreamBundle = {
  scenarioId: string;
  window: {
    start: string;
    end: string;
    timezone: string;
  };
  streams: MetricStream[];
  thresholds: AlertThreshold[];
  phases: IncidentPhase[];
};
