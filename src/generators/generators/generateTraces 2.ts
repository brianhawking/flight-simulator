import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";
import { getRequiredSignalParameter } from "../generatorUtils";

export function generateTraces(scenario: ScenarioModel): EvidencePackage["traces"] {
  switch (scenario.id) {
    case "scenario_backend_api_timeout":
      return generateBackendTraces(scenario);
    case "scenario_mobile_enum_mapping_failure":
      return generateMobileTraces(scenario);
    case "scenario_discover_offer_activation_failure":
      return generateDiscoverTraces(scenario);
    default:
      throw new Error(`Unsupported scenario for trace generation: ${scenario.id}`);
  }
}

function generateBackendTraces(scenario: ScenarioModel): EvidencePackage["traces"] {
  const timeoutSignal = getRequiredSignalParameter(scenario, "downstream_timeout");

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
          operation: "fetchProfiles",
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

function generateMobileTraces(scenario: ScenarioModel): EvidencePackage["traces"] {
  const requestOutcome = getRequiredSignalParameter(scenario, "request_outcome");

  return [
    {
      id: "trace_1",
      timestamp: "2026-06-07T15:10:41Z",
      traceName: `${requestOutcome.method} ${requestOutcome.route}`,
      service: scenario.serviceContext.primaryService,
      durationMs: requestOutcome.durationMs,
      status: requestOutcome.status,
      observedBehavior: "Request completes successfully with a 200 response and normal latency",
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
          operation: "fetchRewardsContent",
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

function generateDiscoverTraces(scenario: ScenarioModel): EvidencePackage["traces"] {
  const requestOutcome = getRequiredSignalParameter(scenario, "request_outcome");

  return [
    {
      id: "trace_1",
      timestamp: "2026-06-07T16:11:09Z",
      traceName: `${requestOutcome.method} ${requestOutcome.route}`,
      service: scenario.serviceContext.primaryService,
      durationMs: requestOutcome.durationMs,
      status: requestOutcome.status,
      observedBehavior: "Request completes normally and returns an application-level 403 response without infrastructure errors",
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
          operation: "evaluateOfferEligibility",
          durationMs: Math.max(requestOutcome.durationMs - 73, 40),
          status: requestOutcome.status,
          attributes: {
            ...(requestOutcome.attributes ?? {}),
          },
        },
      ],
    },
  ];
}
