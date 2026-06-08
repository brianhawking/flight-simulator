import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";

export function generateTraces(scenario: ScenarioModel): EvidencePackage["traces"] {
  const timeoutSignal = scenario.signalParameters.find((parameter) => parameter.type === "downstream_timeout");
  if (timeoutSignal?.type === "downstream_timeout") {
    return [
      {
        id: "trace_1",
        timestamp: "2026-06-07T14:10:04Z",
        traceName: `GET ${timeoutSignal.route}`,
        service: scenario.serviceContext.primaryService,
        durationMs: timeoutSignal.durationMs + 210,
        status: "timeout",
        observedBehavior: `Request spends most of its time waiting on ${timeoutSignal.dependency}`,
        spans: [
          {
            id: "span_1",
            service: scenario.serviceContext.primaryService,
            operation: `GET ${timeoutSignal.route}`,
            durationMs: timeoutSignal.durationMs + 210,
            status: "timeout",
          },
          {
            id: "span_2",
            parentId: "span_1",
            service: timeoutSignal.dependency,
            operation: inferOperationName(timeoutSignal.route, scenario.serviceContext.primaryService),
            durationMs: timeoutSignal.durationMs,
            status: "timeout",
            attributes: {
              downstream: "user-profile-db",
            },
          },
        ],
      },
    ];
  }

  const requestOutcome = scenario.signalParameters.find((parameter) => parameter.type === "request_outcome");
  if (requestOutcome?.type === "request_outcome") {
    return [
      {
        id: "trace_1",
        timestamp: buildTraceTimestamp(scenario),
        traceName: `${requestOutcome.method} ${requestOutcome.route}`,
        service: scenario.serviceContext.primaryService,
        durationMs: requestOutcome.durationMs,
        status: requestOutcome.status,
        observedBehavior: inferObservedBehavior(requestOutcome.status, requestOutcome.statusCode),
        spans: [
          {
            id: "span_1",
            service: "api-gateway",
            operation: `${requestOutcome.method} ${requestOutcome.route}`,
            durationMs: requestOutcome.durationMs,
            status: requestOutcome.status,
            attributes: {
              statusCode: requestOutcome.statusCode,
            },
          },
          {
            id: "span_2",
            parentId: "span_1",
            service: scenario.serviceContext.primaryService,
            operation: inferOperationName(requestOutcome.route, scenario.serviceContext.primaryService),
            durationMs: Math.max(requestOutcome.durationMs - 61, 40),
            status: requestOutcome.status,
            attributes: {
              statusCode: requestOutcome.statusCode,
              ...(requestOutcome.attributes ?? {}),
            },
          },
        ],
      },
    ];
  }

  return [];
}

function inferOperationName(route: string, service: string) {
  if (route.includes("rewards")) {
    return "fetchRewardsContent";
  }

  if (route.includes("offers")) {
    return "evaluateOfferEligibility";
  }

  if (service.includes("profile")) {
    return "fetchProfiles";
  }

  return "handleRequest";
}

function inferObservedBehavior(status: "ok" | "error" | "timeout", statusCode: number) {
  if (status === "timeout") {
    return "Request exceeds normal execution time and times out before completion";
  }

  if (status === "ok" && statusCode >= 400) {
    return `Request completes normally and returns an application-level ${statusCode} response without infrastructure errors`;
  }

  return "Request completes successfully with a 200 response and normal latency";
}

function buildTraceTimestamp(scenario: ScenarioModel) {
  const startTime = Date.parse(scenario.windowHint.start);
  const impactHint = scenario.timelineHints.find((hint) => hint.category === "symptom" || hint.category === "cause");
  const baseMs =
    impactHint !== undefined ? startTime + impactHint.minuteOffset * 60 * 1000 : startTime + 10 * 60 * 1000;

  return new Date(baseMs + 41 * 1000).toISOString();
}
