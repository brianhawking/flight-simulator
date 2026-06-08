import { EvidencePackage } from "../types/evidence";

export const backendTimeoutEvidencePackage: EvidencePackage = {
  id: "evidence_backend_api_timeout_v1",
  version: "1",
  title: "Backend API Timeout Evidence",
  scenarioId: "scenario_backend_api_timeout",
  window: {
    start: "2026-06-07T13:55:00Z",
    end: "2026-06-07T14:20:00Z",
    timezone: "UTC",
  },
  metadata: {
    serviceName: "public-api",
    environment: "production",
    ownerTeam: "mobile-platform",
    platforms: ["iOS", "Android"],
  },
  summaryCards: [
    {
      id: "success_rate",
      label: "Success Rate",
      value: "81.2%",
      delta: "-18.1%",
      status: "critical",
    },
    {
      id: "p95_latency",
      label: "P95 Latency",
      value: "4.8s",
      delta: "+3.1s",
      status: "critical",
    },
    {
      id: "error_rate",
      label: "Error Rate",
      value: "17.6%",
      delta: "+15.9%",
      status: "critical",
    },
    {
      id: "affected_platforms",
      label: "Affected Platforms",
      value: "iOS + Android",
      status: "warning",
    },
  ],
  charts: [
    {
      id: "success-rate",
      title: "Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "all_clients",
          label: "All Clients",
          color: "#44d17a",
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 99.4 },
            { timestamp: "2026-06-07T14:05:00Z", value: 97.8 },
            { timestamp: "2026-06-07T14:10:00Z", value: 84.1 },
            { timestamp: "2026-06-07T14:15:00Z", value: 80.9 },
            { timestamp: "2026-06-07T14:20:00Z", value: 82.3 },
          ],
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
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 1180 },
            { timestamp: "2026-06-07T14:05:00Z", value: 1110 },
            { timestamp: "2026-06-07T14:10:00Z", value: 760 },
            { timestamp: "2026-06-07T14:15:00Z", value: 710 },
            { timestamp: "2026-06-07T14:20:00Z", value: 740 },
          ],
        },
        {
          id: "500",
          label: "500",
          color: "#ff7a45",
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 6 },
            { timestamp: "2026-06-07T14:05:00Z", value: 18 },
            { timestamp: "2026-06-07T14:10:00Z", value: 122 },
            { timestamp: "2026-06-07T14:15:00Z", value: 141 },
            { timestamp: "2026-06-07T14:20:00Z", value: 110 },
          ],
        },
        {
          id: "504",
          label: "504",
          color: "#ff4d6d",
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 1 },
            { timestamp: "2026-06-07T14:05:00Z", value: 7 },
            { timestamp: "2026-06-07T14:10:00Z", value: 84 },
            { timestamp: "2026-06-07T14:15:00Z", value: 96 },
            { timestamp: "2026-06-07T14:20:00Z", value: 88 },
          ],
        },
      ],
    },
    {
      id: "platform-breakdown",
      title: "Platform Breakdown",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "ios",
          label: "iOS Success Rate",
          color: "#6ee7b7",
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 99.3 },
            { timestamp: "2026-06-07T14:05:00Z", value: 97.4 },
            { timestamp: "2026-06-07T14:10:00Z", value: 84.6 },
            { timestamp: "2026-06-07T14:15:00Z", value: 81.1 },
            { timestamp: "2026-06-07T14:20:00Z", value: 82.0 },
          ],
        },
        {
          id: "android",
          label: "Android Success Rate",
          color: "#ffd166",
          points: [
            { timestamp: "2026-06-07T14:00:00Z", value: 99.5 },
            { timestamp: "2026-06-07T14:05:00Z", value: 98.0 },
            { timestamp: "2026-06-07T14:10:00Z", value: 83.9 },
            { timestamp: "2026-06-07T14:15:00Z", value: 80.7 },
            { timestamp: "2026-06-07T14:20:00Z", value: 82.5 },
          ],
        },
      ],
    },
  ],
  breakdowns: [
    {
      id: "platform-breakdown-table",
      title: "Platform Breakdown",
      dimension: "platform",
      unit: "percent",
      rows: [
        {
          label: "iOS",
          value: "81.9%",
          status: "critical",
          metadata: {
            requestVolume: 12480,
            errorRate: "17.1%",
          },
        },
        {
          label: "Android",
          value: "80.6%",
          status: "critical",
          metadata: {
            requestVolume: 11890,
            errorRate: "18.2%",
          },
        },
      ],
    },
    {
      id: "app-version-breakdown",
      title: "App Version Breakdown",
      dimension: "app_version",
      unit: "percent",
      rows: [
        {
          label: "iOS 6.4.0",
          value: "82.1%",
          status: "critical",
        },
        {
          label: "Android 6.4.0",
          value: "80.4%",
          status: "critical",
        },
      ],
    },
  ],
  logs: [
    {
      id: "log_1",
      timestamp: "2026-06-07T14:09:12Z",
      level: "ERROR",
      service: "public-api",
      message: "Upstream request failed: timeout waiting for user-profile-service",
      attributes: {
        route: "/v1/feed",
        platform: "iOS",
        statusCode: 504,
      },
    },
    {
      id: "log_2",
      timestamp: "2026-06-07T14:09:43Z",
      level: "ERROR",
      service: "public-api",
      message: "Dependency timeout bubbled to 500 response",
      attributes: {
        route: "/v1/feed",
        platform: "Android",
        statusCode: 500,
      },
    },
    {
      id: "log_3",
      timestamp: "2026-06-07T14:10:14Z",
      level: "WARN",
      service: "public-api",
      message: "Retry budget exhausted for downstream profile lookup",
      attributes: {
        route: "/v1/feed",
        downstreamService: "user-profile-service",
      },
    },
  ],
  traces: [
    {
      id: "trace_1",
      timestamp: "2026-06-07T14:10:02Z",
      traceName: "GET /v1/feed",
      service: "public-api",
      durationMs: 4880,
      status: "timeout",
      observedBehavior: "Request spends most of its time waiting on a downstream dependency",
      spans: [
        {
          id: "span_1",
          service: "public-api",
          operation: "GET /v1/feed",
          durationMs: 4880,
          status: "timeout",
        },
        {
          id: "span_2",
          parentId: "span_1",
          service: "user-profile-service",
          operation: "fetchProfiles",
          durationMs: 4500,
          status: "timeout",
          attributes: {
            downstream: "user-profile-db",
          },
        },
      ],
    },
  ],
  timelineMarkers: [
    {
      id: "marker_1",
      timestamp: "2026-06-07T14:05:00Z",
      label: "500/504 spike begins",
      category: "symptom",
    },
    {
      id: "marker_2",
      timestamp: "2026-06-07T14:06:00Z",
      label: "Both mobile platforms begin failing",
      category: "impact",
    },
    {
      id: "marker_3",
      timestamp: "2026-06-07T14:06:30Z",
      label: "Downstream timeout appears in traces",
      category: "cause",
    },
  ],
};
