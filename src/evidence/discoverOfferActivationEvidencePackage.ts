import { EvidencePackage } from "../types/evidence";

export const discoverOfferActivationEvidencePackage: EvidencePackage = {
  id: "evidence_discover_offer_activation_v1",
  version: "1",
  title: "Discover Offer Activation Failure Evidence",
  scenarioId: "scenario_discover_offer_activation_failure",
  window: {
    start: "2026-06-07T16:00:00Z",
    end: "2026-06-07T16:25:00Z",
    timezone: "UTC",
  },
  metadata: {
    serviceName: "offers-api",
    environment: "production",
    ownerTeam: "offers-platform",
    platforms: ["iOS", "Android"],
  },
  summaryCards: [
    {
      id: "api_success_rate",
      label: "API Success Rate",
      value: "97.2%",
      delta: "-1.1%",
      status: "normal",
    },
    {
      id: "activation_failure_rate",
      label: "Activation Failure Rate",
      value: "41.5%",
      delta: "+38.2%",
      status: "critical",
    },
    {
      id: "affected_product",
      label: "Affected Product",
      value: "Discover",
      status: "critical",
    },
    {
      id: "customer_impact",
      label: "Customer Impact",
      value: "Offer visible, activation blocked",
      status: "warning",
    },
  ],
  charts: [
    {
      id: "activation-success-rate",
      title: "Offer Activation Success Rate",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "activation_success",
          label: "Activation Success Rate",
          color: "#44d17a",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 96.8 },
            { timestamp: "2026-06-07T16:05:00Z", value: 94.9 },
            { timestamp: "2026-06-07T16:10:00Z", value: 81.2 },
            { timestamp: "2026-06-07T16:15:00Z", value: 63.4 },
            { timestamp: "2026-06-07T16:20:00Z", value: 57.8 },
          ],
        },
      ],
    },
    {
      id: "activation-403-spike",
      title: "403 Responses",
      kind: "stacked-bar",
      unit: "count",
      series: [
        {
          id: "success_200",
          label: "200",
          color: "#2ec4ff",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 420 },
            { timestamp: "2026-06-07T16:05:00Z", value: 415 },
            { timestamp: "2026-06-07T16:10:00Z", value: 332 },
            { timestamp: "2026-06-07T16:15:00Z", value: 251 },
            { timestamp: "2026-06-07T16:20:00Z", value: 228 },
          ],
        },
        {
          id: "forbidden_403",
          label: "403",
          color: "#ff4d6d",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 9 },
            { timestamp: "2026-06-07T16:05:00Z", value: 18 },
            { timestamp: "2026-06-07T16:10:00Z", value: 96 },
            { timestamp: "2026-06-07T16:15:00Z", value: 151 },
            { timestamp: "2026-06-07T16:20:00Z", value: 172 },
          ],
        },
      ],
    },
    {
      id: "activation-outcome-comparison",
      title: "Activation Outcome Comparison",
      kind: "line",
      unit: "percent",
      series: [
        {
          id: "discover_success",
          label: "Discover Success Rate",
          color: "#ffd166",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 95.7 },
            { timestamp: "2026-06-07T16:05:00Z", value: 89.8 },
            { timestamp: "2026-06-07T16:10:00Z", value: 68.4 },
            { timestamp: "2026-06-07T16:15:00Z", value: 51.2 },
            { timestamp: "2026-06-07T16:20:00Z", value: 44.9 },
          ],
        },
        {
          id: "visa_success",
          label: "Visa Success Rate",
          color: "#6ee7b7",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 98.3 },
            { timestamp: "2026-06-07T16:05:00Z", value: 98.1 },
            { timestamp: "2026-06-07T16:10:00Z", value: 98.0 },
            { timestamp: "2026-06-07T16:15:00Z", value: 97.9 },
            { timestamp: "2026-06-07T16:20:00Z", value: 98.0 },
          ],
        },
        {
          id: "mastercard_success",
          label: "Mastercard Success Rate",
          color: "#9bdbff",
          points: [
            { timestamp: "2026-06-07T16:00:00Z", value: 98.1 },
            { timestamp: "2026-06-07T16:05:00Z", value: 97.8 },
            { timestamp: "2026-06-07T16:10:00Z", value: 97.9 },
            { timestamp: "2026-06-07T16:15:00Z", value: 97.7 },
            { timestamp: "2026-06-07T16:20:00Z", value: 97.8 },
          ],
        },
      ],
    },
  ],
  breakdowns: [
    {
      id: "product-type-breakdown",
      title: "Product Type Breakdown",
      dimension: "product_type",
      unit: "percent",
      rows: [
        {
          label: "Discover",
          value: "44.9%",
          status: "critical",
          metadata: {
            activationFailureRate: "41.5%",
            statusCode: 403,
          },
        },
        {
          label: "Visa",
          value: "98.0%",
          status: "normal",
          metadata: {
            activationFailureRate: "1.4%",
            statusCode: 200,
          },
        },
        {
          label: "Mastercard",
          value: "97.8%",
          status: "normal",
          metadata: {
            activationFailureRate: "1.7%",
            statusCode: 200,
          },
        },
      ],
    },
    {
      id: "card-segment-breakdown",
      title: "Card Segment Breakdown",
      dimension: "card_segment",
      unit: "percent",
      rows: [
        {
          label: "Discover Cashback",
          value: "42.7%",
          status: "critical",
          metadata: {
            quarter: "Q3",
            activationStatus: "rejected",
          },
        },
        {
          label: "Visa Everyday",
          value: "98.1%",
          status: "normal",
          metadata: {
            quarter: "Q3",
            activationStatus: "activated",
          },
        },
      ],
    },
  ],
  logs: [
    {
      id: "log_1",
      timestamp: "2026-06-07T16:10:31Z",
      level: "ERROR",
      service: "offers-api",
      message: "activation rejected: offer_code_invalid for Discover user",
      attributes: {
        productType: "Discover",
        offerId: "DISC-Q3-5PCT",
        activationStatus: "rejected",
        statusCode: 403,
        errorCode: "offer_code_invalid",
      },
    },
    {
      id: "log_2",
      timestamp: "2026-06-07T16:12:18Z",
      level: "ERROR",
      service: "offers-api",
      message: "eligibility mismatch during quarter transition",
      attributes: {
        productType: "Discover",
        offerId: "DISC-Q3-5PCT",
        activationStatus: "rejected",
        statusCode: 403,
        errorCode: "offer_not_eligible",
      },
    },
    {
      id: "log_3",
      timestamp: "2026-06-07T16:13:47Z",
      level: "WARN",
      service: "offers-api",
      message: "invalid offer period detected on activation request",
      attributes: {
        productType: "Discover",
        offerId: "DISC-Q3-5PCT",
        activationStatus: "rejected",
        statusCode: 403,
        errorCode: "invalid_offer_period",
      },
    },
  ],
  traces: [
    {
      id: "trace_1",
      timestamp: "2026-06-07T16:11:09Z",
      traceName: "POST /v1/offers/activate",
      service: "offers-api",
      durationMs: 214,
      status: "ok",
      observedBehavior: "Request completes normally and returns an application-level 403 response without infrastructure errors",
      spans: [
        {
          id: "span_1",
          service: "api-gateway",
          operation: "POST /v1/offers/activate",
          durationMs: 214,
          status: "ok",
          attributes: {
            statusCode: 403,
          },
        },
        {
          id: "span_2",
          parentId: "span_1",
          service: "offers-api",
          operation: "evaluateOfferEligibility",
          durationMs: 141,
          status: "ok",
          attributes: {
            productType: "Discover",
            ruleResult: "rejected",
          },
        },
      ],
    },
  ],
  timelineMarkers: [
    {
      id: "marker_1",
      timestamp: "2026-06-07T16:02:00Z",
      label: "Quarter transition configuration begins",
      category: "investigation",
    },
    {
      id: "marker_2",
      timestamp: "2026-06-07T16:10:00Z",
      label: "Discover activation failures appear",
      category: "symptom",
    },
    {
      id: "marker_3",
      timestamp: "2026-06-07T16:12:00Z",
      label: "403 spike observed on activation endpoint",
      category: "impact",
    },
    {
      id: "marker_4",
      timestamp: "2026-06-07T16:14:00Z",
      label: "Product segmentation identifies Discover-only failures",
      category: "cause",
    },
  ],
};
