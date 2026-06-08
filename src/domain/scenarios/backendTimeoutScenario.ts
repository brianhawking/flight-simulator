import { ScenarioModel } from "../types/scenario";

export const backendTimeoutScenario: ScenarioModel = {
  id: "scenario_backend_api_timeout",
  title: "Backend API 500 Spike / Timeout",
  difficulty: "easy",
  incidentType: "backend_outage",
  rootCauseDomain: "backend",
  summary: "A backend dependency timeout causes elevated 500 and 504 responses across both mobile platforms.",
  serviceContext: {
    primaryService: "public-api",
    affectedPlatforms: ["iOS", "Android"],
    environment: "production",
    ownerTeam: "backend-team",
  },
  windowHint: {
    start: "2026-06-07T13:55:00Z",
    durationMinutes: 25,
    timezone: "UTC",
  },
  severityHint: {
    severity: "SEV1",
  },
  learningObjectives: [
    "Identify that success rate dropped materially",
    "Recognize the 500 and 504 spike as backend-facing signals",
    "Use traces to connect failures to a downstream timeout",
    "Escalate the incident to the backend owner",
  ],
  initialFacts: [
    {
      id: "fact_1",
      statement: "Users are reporting feed failures on both iOS and Android.",
      source: "briefing",
    },
    {
      id: "fact_2",
      statement: "The incident appears to affect a core API path rather than one client release.",
      source: "briefing",
    },
  ],
  discoverableFacts: [
    {
      id: "fact_3",
      statement: "Overall success rate drops while 500 and 504 responses increase sharply.",
      source: "investigation",
    },
    {
      id: "fact_4",
      statement: "iOS and Android are affected similarly, reducing the likelihood of a client-only issue.",
      source: "investigation",
    },
    {
      id: "fact_5",
      statement: "Traces show requests spending most of their time waiting on a downstream backend dependency.",
      source: "investigation",
    },
  ],
  signals: [
    {
      id: "signal_1",
      category: "metric",
      name: "api success rate",
      expectation: "degrades",
      details: "Success rate falls well below normal.",
    },
    {
      id: "signal_2",
      category: "metric",
      name: "status codes",
      expectation: "spikes",
      details: "500 and 504 counts increase materially.",
    },
    {
      id: "signal_3",
      category: "trace",
      name: "dependency wait time",
      expectation: "spikes",
      details: "Trace latency clusters around a downstream backend timeout.",
    },
    {
      id: "signal_4",
      category: "segment",
      name: "platform impact",
      expectation: "isolated",
      details: "No meaningful difference between iOS and Android impact.",
    },
  ],
  signalParameters: [
    {
      type: "success_rate_drop",
      metric: "success_rate",
      from: 99.4,
      to: 82.3,
      durationMinutes: 20,
    },
    {
      type: "latency_increase",
      metric: "p95_latency",
      fromMs: 1700,
      toMs: 4800,
      durationMinutes: 15,
    },
    {
      type: "status_code_spike",
      statusCode: 500,
      baseline: 6,
      peak: 141,
      durationMinutes: 15,
    },
    {
      type: "status_code_spike",
      statusCode: 504,
      baseline: 1,
      peak: 96,
      durationMinutes: 15,
    },
    {
      type: "segment_impact",
      dimension: "platform",
      affected: ["iOS", "Android"],
      baselinePercent: 99.4,
      impactedPercent: 81.3,
    },
    {
      type: "downstream_timeout",
      dependency: "user-profile-service",
      durationMs: 4500,
      route: "/v1/feed",
    },
  ],
  affectedSegments: [
    {
      dimension: "platform",
      affected: ["iOS", "Android"],
      unaffected: [],
      notes: "Both mobile platforms show similar degradation.",
    },
  ],
  timelineHints: [
    {
      id: "marker_1",
      minuteOffset: 10,
      label: "500/504 spike begins",
      category: "symptom",
    },
    {
      id: "marker_2",
      minuteOffset: 11,
      label: "Both mobile platforms begin failing",
      category: "impact",
    },
    {
      id: "marker_3",
      minuteOffset: 11.5,
      label: "Downstream timeout appears in traces",
      category: "cause",
    },
  ],
  expectedEvidence: ["api_health", "status_codes", "traces", "segment_breakdown"],
  expectedActions: [
    {
      type: "investigate",
      owner: "mobile_engineer",
      description: "Verify whether impact is shared across both mobile platforms.",
    },
    {
      type: "correlate",
      owner: "mobile_engineer",
      description: "Connect error spikes with backend trace behavior.",
    },
    {
      type: "escalate",
      owner: "backend_team",
      description: "Escalate the incident to the backend owner due to downstream timeout evidence.",
    },
  ],
};
