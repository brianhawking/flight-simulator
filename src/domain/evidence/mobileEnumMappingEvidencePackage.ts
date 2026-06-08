import { EvidencePackage } from "../types/evidence";

export const mobileEnumMappingEvidencePackage: EvidencePackage = {
  id: "evidence_mobile_enum_mapping_v1",
  version: "1",
  title: "Mobile Enum Mapping Failure Evidence",
  scenarioId: "scenario_mobile_enum_mapping_failure",
  window: {
    start: "2026-06-07T15:00:00Z",
    end: "2026-06-07T15:25:00Z",
    timezone: "UTC",
  },
  metadata: {
    serviceName: "rewards-api",
    environment: "production",
    ownerTeam: "mobile-app",
    platforms: ["iOS", "Android"],
  },
  summaryCards: [
    {
      id: "api_success_rate",
      label: "API Success Rate",
      value: "98.9%",
      delta: "-0.4%",
      status: "normal",
    },
    {
      id: "tile_failure_rate",
      label: "Feature Tile Failure Rate",
      value: "36.8%",
      delta: "+33.9%",
      status: "critical",
    },
    {
      id: "affected_platform",
      label: "Affected Platform",
      value: "iOS",
      status: "critical",
    },
    {
      id: "affected_segment",
      label: "Affected App Version",
      value: "iOS 6.5.0",
      status: "warning",
    },
  ],
  charts: [
    {
      id: "api-success-rate",
      title: "API Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "rewards_api",
          label: "Rewards API",
          color: "#44d17a",
          points: [
            { timestamp: "2026-06-07T15:00:00Z", value: 99.3 },
            { timestamp: "2026-06-07T15:05:00Z", value: 99.1 },
            { timestamp: "2026-06-07T15:10:00Z", value: 98.8 },
            { timestamp: "2026-06-07T15:15:00Z", value: 98.9 },
            { timestamp: "2026-06-07T15:20:00Z", value: 98.7 },
          ],
        },
      ],
    },
    {
      id: "tile-failure-rate",
      title: "Rewards Tile Failure Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "rewards_tile_failures",
          label: "Tile Failure Rate",
          color: "#ff4d6d",
          points: [
            { timestamp: "2026-06-07T15:00:00Z", value: 2.1 },
            { timestamp: "2026-06-07T15:05:00Z", value: 4.8 },
            { timestamp: "2026-06-07T15:10:00Z", value: 18.4 },
            { timestamp: "2026-06-07T15:15:00Z", value: 31.2 },
            { timestamp: "2026-06-07T15:20:00Z", value: 38.6 },
          ],
        },
      ],
    },
    {
      id: "app-version-comparison",
      title: "App Version Comparison",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "ios_650",
          label: "iOS 6.5.0 Tile Success Rate",
          color: "#ffd166",
          points: [
            { timestamp: "2026-06-07T15:00:00Z", value: 97.8 },
            { timestamp: "2026-06-07T15:05:00Z", value: 92.4 },
            { timestamp: "2026-06-07T15:10:00Z", value: 79.1 },
            { timestamp: "2026-06-07T15:15:00Z", value: 66.8 },
            { timestamp: "2026-06-07T15:20:00Z", value: 61.4 },
          ],
        },
        {
          id: "ios_641",
          label: "iOS 6.4.1 Tile Success Rate",
          color: "#2ec4ff",
          points: [
            { timestamp: "2026-06-07T15:00:00Z", value: 98.9 },
            { timestamp: "2026-06-07T15:05:00Z", value: 98.6 },
            { timestamp: "2026-06-07T15:10:00Z", value: 98.7 },
            { timestamp: "2026-06-07T15:15:00Z", value: 98.5 },
            { timestamp: "2026-06-07T15:20:00Z", value: 98.3 },
          ],
        },
      ],
    },
  ],
  breakdowns: [
    {
      id: "platform-breakdown",
      title: "Platform Breakdown",
      dimension: "platform",
      unit: "percent",
      rows: [
        {
          label: "iOS",
          value: "63.2%",
          status: "critical",
          metadata: {
            featureFailureRate: "36.8%",
            apiSuccessRate: "98.8%",
          },
        },
        {
          label: "Android",
          value: "98.4%",
          status: "normal",
          metadata: {
            featureFailureRate: "1.6%",
            apiSuccessRate: "99.0%",
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
          label: "iOS 6.5.0",
          value: "61.4%",
          status: "critical",
          metadata: {
            affectedUsers: 4821,
            osVersion: "iOS 18.0",
          },
        },
        {
          label: "iOS 6.4.1",
          value: "98.3%",
          status: "normal",
          metadata: {
            affectedUsers: 1937,
            osVersion: "iOS 17.6",
          },
        },
      ],
    },
  ],
  logs: [
    {
      id: "log_1",
      timestamp: "2026-06-07T15:11:22Z",
      level: "ERROR",
      service: "ios-app",
      message: "rewards_tile mapping_failed for response payload",
      attributes: {
        feature: "rewards_tile",
        eventName: "mapping_failed",
        errorType: "enum_decoding_failed",
        unknownValue: "cash_boost_plus",
        appVersion: "6.5.0",
        osVersion: "18.0",
        platform: "iOS",
      },
    },
    {
      id: "log_2",
      timestamp: "2026-06-07T15:12:05Z",
      level: "ERROR",
      service: "ios-app",
      message: "rewards_tile tile_failed and hidden after decoding error",
      attributes: {
        feature: "rewards_tile",
        eventName: "tile_failed",
        errorType: "enum_decoding_failed",
        unknownValue: "cash_boost_plus",
        appVersion: "6.5.0",
        osVersion: "18.0",
        platform: "iOS",
      },
    },
    {
      id: "log_3",
      timestamp: "2026-06-07T15:14:40Z",
      level: "WARN",
      service: "ios-app",
      message: "tile render fallback invoked after unknown enum case",
      attributes: {
        feature: "rewards_tile",
        eventName: "tile_failed",
        errorType: "enum_decoding_failed",
        unknownValue: "cash_boost_plus",
        appVersion: "6.5.0",
        osVersion: "18.0",
        platform: "iOS",
      },
    },
  ],
  traces: [
    {
      id: "trace_1",
      timestamp: "2026-06-07T15:10:41Z",
      traceName: "GET /v1/rewards/home",
      service: "rewards-api",
      durationMs: 182,
      status: "ok",
      observedBehavior: "Request completes successfully with a 200 response and normal latency",
      spans: [
        {
          id: "span_1",
          service: "api-gateway",
          operation: "GET /v1/rewards/home",
          durationMs: 182,
          status: "ok",
          attributes: {
            statusCode: 200,
          },
        },
        {
          id: "span_2",
          parentId: "span_1",
          service: "rewards-api",
          operation: "fetchRewardsContent",
          durationMs: 121,
          status: "ok",
          attributes: {
            statusCode: 200,
            responseField: "cash_boost_plus",
          },
        },
      ],
    },
  ],
  timelineMarkers: [
    {
      id: "marker_1",
      timestamp: "2026-06-07T15:03:00Z",
      label: "iOS 6.5.0 release ramp begins",
      category: "investigation",
    },
    {
      id: "marker_2",
      timestamp: "2026-06-07T15:10:00Z",
      label: "Rewards tile failures increase",
      category: "symptom",
    },
    {
      id: "marker_3",
      timestamp: "2026-06-07T15:12:00Z",
      label: "Logs show enum decoding failures for rewards_tile",
      category: "cause",
    },
    {
      id: "marker_4",
      timestamp: "2026-06-07T15:15:00Z",
      label: "Issue appears isolated to iOS 6.5.0 users",
      category: "impact",
    },
  ],
};
