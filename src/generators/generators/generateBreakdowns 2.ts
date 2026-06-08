import { EvidencePackage } from "../../types/evidence";
import { ScenarioModel } from "../../types/scenario";
import { getRequiredSegmentImpact, roundToOneDecimal } from "../generatorUtils";

export function generateBreakdowns(scenario: ScenarioModel): EvidencePackage["breakdowns"] {
  switch (scenario.id) {
    case "scenario_backend_api_timeout":
      return generateBackendBreakdowns(scenario);
    case "scenario_mobile_enum_mapping_failure":
      return generateMobileBreakdowns(scenario);
    case "scenario_discover_offer_activation_failure":
      return generateDiscoverBreakdowns(scenario);
    default:
      throw new Error(`Unsupported scenario for breakdown generation: ${scenario.id}`);
  }
}

function generateBackendBreakdowns(scenario: ScenarioModel): EvidencePackage["breakdowns"] {
  const segmentImpact = getRequiredSegmentImpact(scenario, "platform");
  const affectedPlatforms = scenario.serviceContext.affectedPlatforms ?? segmentImpact.affected;
  const impactedPercent = roundToOneDecimal(segmentImpact.impactedPercent);

  return [
    {
      id: "platform-breakdown-table",
      title: "Platform Breakdown",
      dimension: "platform",
      unit: "percent",
      rows: affectedPlatforms.map((platform, index) => ({
        label: platform,
        value: `${(impactedPercent + index * -0.8).toFixed(1)}%`,
        status: "critical",
        metadata: {
          requestVolume: index === 0 ? 12340 : 11960,
          errorRate: `${(17 + index * 0.2).toFixed(1)}%`,
        },
      })),
    },
  ];
}

function generateMobileBreakdowns(scenario: ScenarioModel): EvidencePackage["breakdowns"] {
  const platformImpact = getRequiredSegmentImpact(scenario, "platform");
  const appVersionImpact = getRequiredSegmentImpact(scenario, "app_version");

  return [
    {
      id: "platform-breakdown",
      title: "Platform Breakdown",
      dimension: "platform",
      unit: "percent",
      rows: [
        {
          label: platformImpact.affected[0] ?? "Impacted",
          value: `${platformImpact.impactedPercent.toFixed(1)}%`,
          status: "critical",
          metadata: {
            featureFailureRate: `${roundToOneDecimal(100 - appVersionImpact.impactedPercent).toFixed(1)}%`,
            apiSuccessRate: `${platformImpact.baselinePercent.toFixed(1)}%`,
          },
        },
        {
          label: platformImpact.unaffected?.[0] ?? "Baseline",
          value: `${(platformImpact.baselinePercent - 0.5).toFixed(1)}%`,
          status: "normal",
          metadata: {
            featureFailureRate: "1.6%",
            apiSuccessRate: `${(platformImpact.baselinePercent + 0.1).toFixed(1)}%`,
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
          label: appVersionImpact.affected[0] ?? "affected",
          value: `${appVersionImpact.impactedPercent.toFixed(1)}%`,
          status: "critical",
          metadata: {
            affectedUsers: 4821,
            osVersion: "18.0",
          },
        },
        {
          label: appVersionImpact.unaffected?.[0] ?? "baseline",
          value: `${appVersionImpact.baselinePercent.toFixed(1)}%`,
          status: "normal",
          metadata: {
            affectedUsers: 1937,
            osVersion: "17.6",
          },
        },
      ],
    },
  ];
}

function generateDiscoverBreakdowns(scenario: ScenarioModel): EvidencePackage["breakdowns"] {
  const productImpact = getRequiredSegmentImpact(scenario, "product_type");
  const cardSegmentImpact = getRequiredSegmentImpact(scenario, "card_segment");

  return [
    {
      id: "product-type-breakdown",
      title: "Product Type Breakdown",
      dimension: "product_type",
      unit: "percent",
      rows: [
        {
          label: productImpact.affected[0] ?? "Affected",
          value: `${productImpact.impactedPercent.toFixed(1)}%`,
          status: "critical",
          metadata: {
            activationFailureRate: "41.5%",
            statusCode: 403,
          },
        },
        ...(productImpact.unaffected ?? []).map((label, index) => ({
          label,
          value: `${(productImpact.baselinePercent - index * 0.2).toFixed(1)}%`,
          status: "normal" as const,
          metadata: {
            activationFailureRate: index === 0 ? "1.4%" : "1.7%",
            statusCode: 200,
          },
        })),
      ],
    },
    {
      id: "card-segment-breakdown",
      title: "Card Segment Breakdown",
      dimension: "card_segment",
      unit: "percent",
      rows: [
        {
          label: cardSegmentImpact.affected[0] ?? "Affected",
          value: `${cardSegmentImpact.impactedPercent.toFixed(1)}%`,
          status: "critical",
          metadata: {
            quarter: "Q3",
            activationStatus: "rejected",
          },
        },
        {
          label: cardSegmentImpact.unaffected?.[0] ?? "Baseline",
          value: `${cardSegmentImpact.baselinePercent.toFixed(1)}%`,
          status: "normal",
          metadata: {
            quarter: "Q3",
            activationStatus: "activated",
          },
        },
      ],
    },
  ];
}
