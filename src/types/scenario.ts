export type ScenarioModel = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  incidentType: IncidentType;
  rootCauseDomain: RootCauseDomain;
  summary: string;
  serviceContext: ServiceContext;
  windowHint: WindowHint;
  severityHint: SeverityHint;
  learningObjectives: string[];
  initialFacts: ScenarioFact[];
  discoverableFacts: ScenarioFact[];
  signals: ScenarioSignal[];
  signalParameters: SignalParameter[];
  affectedSegments: AffectedSegment[];
  timelineHints: TimelineHint[];
  expectedEvidence: ExpectedEvidenceType[];
  expectedActions: ExpectedAction[];
};

export type IncidentType =
  | "backend_outage"
  | "client_regression"
  | "business_logic_failure"
  | "configuration_issue"
  | "mixed_incident";

export type RootCauseDomain =
  | "backend"
  | "mobile_client"
  | "product_config"
  | "platform_os"
  | "mixed"
  | "unknown";

export type ScenarioFact = {
  id: string;
  statement: string;
  source?: "briefing" | "investigation";
};

export type ScenarioSignal = {
  id: string;
  category: "metric" | "log" | "trace" | "segment" | "release" | "configuration";
  name: string;
  expectation: "healthy" | "degrades" | "spikes" | "isolated" | "normal";
  details: string;
};

export type AffectedSegment = {
  dimension: "platform" | "app_version" | "os_version" | "device_model" | "product_type" | string;
  affected: string[];
  unaffected?: string[];
  notes?: string;
};

export type ExpectedEvidenceType =
  | "api_health"
  | "status_codes"
  | "feature_logs"
  | "business_rule_logs"
  | "traces"
  | "segment_breakdown"
  | "release_marker"
  | "config_marker";

export type ExpectedAction = {
  type: "investigate" | "correlate" | "escalate" | "confirm_scope";
  owner: string;
  description: string;
};

export type ServiceContext = {
  primaryService: string;
  affectedPlatforms?: string[];
  environment?: string;
  ownerTeam?: string;
};

export type WindowHint = {
  start: string;
  durationMinutes: number;
  timezone: string;
};

export type SeverityHint = {
  severity: "SEV1" | "SEV2" | "SEV3";
};

export type SignalParameter =
  | {
      type: "success_rate_drop";
      metric: string;
      from: number;
      to: number;
      durationMinutes: number;
    }
  | {
      type: "latency_increase";
      metric: string;
      fromMs: number;
      toMs: number;
      durationMinutes: number;
    }
  | {
      type: "status_code_spike";
      statusCode: number;
      baseline: number;
      peak: number;
      durationMinutes: number;
    }
  | {
      type: "segment_impact";
      dimension: string;
      affected: string[];
      unaffected?: string[];
      baselinePercent: number;
      impactedPercent: number;
    }
  | {
      type: "downstream_timeout";
      dependency: string;
      durationMs: number;
      route: string;
    }
  | {
      type: "log_pattern";
      service: string;
      level: "INFO" | "WARN" | "ERROR";
      message: string;
      trend: "steady" | "increasing" | "spiking";
      attributes: Record<string, string | number | boolean>;
    }
  | {
      type: "request_outcome";
      service: string;
      method: "GET" | "POST" | "PUT" | "DELETE";
      route: string;
      status: "ok" | "error" | "timeout";
      statusCode: number;
      durationMs: number;
      attributes?: Record<string, string | number | boolean>;
    };

export type TimelineHint = {
  id: string;
  minuteOffset: number;
  category: "symptom" | "investigation" | "cause" | "impact";
  label: string;
};
