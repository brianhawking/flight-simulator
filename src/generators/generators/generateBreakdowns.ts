import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel, SignalParameter } from "../../types/scenario";
import { getSignalParameters, roundToOneDecimal } from "../generatorUtils";

export function generateBreakdowns(scenario: ScenarioModel): EvidencePackage["breakdowns"] {
  const impacts = getSignalParameters(scenario, "segment_impact");

  return impacts.map((impact) => buildBreakdownFromImpact(impact, scenario));
}

function buildBreakdownFromImpact(
  impact: Extract<SignalParameter, { type: "segment_impact" }>,
  scenario: ScenarioModel,
): EvidencePackage["breakdowns"][number] {
  switch (impact.dimension) {
    case "platform":
      return {
        id: scenario.rootCauseDomain === "backend" ? "platform-breakdown-table" : "platform-breakdown",
        title: "Platform Breakdown",
        dimension: "platform",
        unit: "percent",
        rows: buildPlatformRows(impact, scenario),
      };
    case "app_version":
      return {
        id: "app-version-breakdown",
        title: "App Version Breakdown",
        dimension: "app_version",
        unit: "percent",
        rows: buildAppVersionRows(impact),
      };
    case "product_type":
      return {
        id: "product-type-breakdown",
        title: "Product Type Breakdown",
        dimension: "product_type",
        unit: "percent",
        rows: buildProductTypeRows(impact),
      };
    case "card_segment":
      return {
        id: "card-segment-breakdown",
        title: "Card Segment Breakdown",
        dimension: "card_segment",
        unit: "percent",
        rows: buildCardSegmentRows(impact),
      };
    default:
      return {
        id: `${impact.dimension}-breakdown`,
        title: toTitle(impact.dimension),
        dimension: impact.dimension,
        unit: "percent",
        rows: [
          ...impact.affected.map((label) => ({
            label,
            value: `${impact.impactedPercent.toFixed(1)}%`,
            status: "critical" as const,
          })),
          ...(impact.unaffected ?? []).map((label) => ({
            label,
            value: `${impact.baselinePercent.toFixed(1)}%`,
            status: "normal" as const,
          })),
        ],
      };
  }
}

function buildPlatformRows(
  impact: Extract<SignalParameter, { type: "segment_impact" }>,
  scenario: ScenarioModel,
) {
  if (scenario.rootCauseDomain === "backend") {
    const platforms = scenario.serviceContext.affectedPlatforms ?? impact.affected;

    return platforms.map((platform, index) => ({
      label: platform,
      value: `${(roundToOneDecimal(impact.impactedPercent) + index * -0.8).toFixed(1)}%`,
      status: "critical" as const,
      metadata: {
        requestVolume: index === 0 ? 12340 : 11960,
        errorRate: `${(17 + index * 0.2).toFixed(1)}%`,
      },
    }));
  }

  return [
    {
      label: impact.affected[0] ?? "Impacted",
      value: `${impact.impactedPercent.toFixed(1)}%`,
      status: "critical" as const,
      metadata: {
        featureFailureRate: `${roundToOneDecimal(100 - impact.impactedPercent).toFixed(1)}%`,
        apiSuccessRate: `${impact.baselinePercent.toFixed(1)}%`,
      },
    },
    {
      label: impact.unaffected?.[0] ?? "Baseline",
      value: `${(impact.baselinePercent - 0.5).toFixed(1)}%`,
      status: "normal" as const,
      metadata: {
        featureFailureRate: "1.6%",
        apiSuccessRate: `${(impact.baselinePercent + 0.1).toFixed(1)}%`,
      },
    },
  ];
}

function buildAppVersionRows(impact: Extract<SignalParameter, { type: "segment_impact" }>) {
  return [
    {
      label: impact.affected[0] ?? "affected",
      value: `${impact.impactedPercent.toFixed(1)}%`,
      status: "critical" as const,
      metadata: {
        affectedUsers: 4821,
        osVersion: "18.0",
      },
    },
    {
      label: impact.unaffected?.[0] ?? "baseline",
      value: `${impact.baselinePercent.toFixed(1)}%`,
      status: "normal" as const,
      metadata: {
        affectedUsers: 1937,
        osVersion: "17.6",
      },
    },
  ];
}

function buildProductTypeRows(impact: Extract<SignalParameter, { type: "segment_impact" }>) {
  return [
    {
      label: impact.affected[0] ?? "Affected",
      value: `${impact.impactedPercent.toFixed(1)}%`,
      status: "critical" as const,
      metadata: {
        activationFailureRate: "41.5%",
        statusCode: 403,
      },
    },
    ...(impact.unaffected ?? []).map((label, index) => ({
      label,
      value: `${(impact.baselinePercent - index * 0.2).toFixed(1)}%`,
      status: "normal" as const,
      metadata: {
        activationFailureRate: index === 0 ? "1.4%" : "1.7%",
        statusCode: 200,
      },
    })),
  ];
}

function buildCardSegmentRows(impact: Extract<SignalParameter, { type: "segment_impact" }>) {
  return [
    {
      label: impact.affected[0] ?? "Affected",
      value: `${impact.impactedPercent.toFixed(1)}%`,
      status: "critical" as const,
      metadata: {
        quarter: "Q3",
        activationStatus: "rejected",
      },
    },
    {
      label: impact.unaffected?.[0] ?? "Baseline",
      value: `${impact.baselinePercent.toFixed(1)}%`,
      status: "normal" as const,
      metadata: {
        quarter: "Q3",
        activationStatus: "activated",
      },
    },
  ];
}

function toTitle(dimension: string) {
  return dimension
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
