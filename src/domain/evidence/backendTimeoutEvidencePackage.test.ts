import { describe, expect, it } from "vitest";
import { backendTimeoutEvidencePackage } from "./backendTimeoutEvidencePackage";
import { discoverOfferActivationEvidencePackage } from "./discoverOfferActivationEvidencePackage";
import { mobileEnumMappingEvidencePackage } from "./mobileEnumMappingEvidencePackage";
import { assertEvidencePackageContract } from "../../test/evidenceContractAssertions";

describe.each([
  ["backendTimeoutEvidencePackage", backendTimeoutEvidencePackage],
  ["mobileEnumMappingEvidencePackage", mobileEnumMappingEvidencePackage],
  ["discoverOfferActivationEvidencePackage", discoverOfferActivationEvidencePackage],
] as const)("%s", (_name, evidencePackage) => {
  it("satisfies the shared evidence package contract", () => {
    assertEvidencePackageContract(evidencePackage);
  });

  it("has summary cards, charts, and logs that reflect the authored scenario", () => {
    expect(evidencePackage.summaryCards.length).toBeGreaterThan(0);
    expect(evidencePackage.charts.length).toBeGreaterThan(0);
    expect(evidencePackage.logs.length).toBeGreaterThan(0);
  });
});

describe("mobileEnumMappingEvidencePackage scenario cues", () => {
  const evidencePackage = mobileEnumMappingEvidencePackage;

  it("looks like a mobile/client issue rather than a backend outage", () => {
    const apiSuccessRateCard = evidencePackage.summaryCards.find((card) => card.id === "api_success_rate");
    const tileFailureCard = evidencePackage.summaryCards.find((card) => card.id === "tile_failure_rate");
    const platformBreakdown = evidencePackage.breakdowns.find((breakdown) => breakdown.dimension === "platform");

    expect(apiSuccessRateCard?.status).not.toBe("critical");
    expect(tileFailureCard?.status).toBe("critical");
    expect(evidencePackage.logs.some((log) => log.attributes?.errorType === "enum_decoding_failed")).toBe(true);
    expect(platformBreakdown?.rows.some((row) => row.label === "iOS" && row.status === "critical")).toBe(true);
    expect(evidencePackage.traces.every((trace) => trace.status === "ok")).toBe(true);
  });
});

describe("discoverOfferActivationEvidencePackage scenario cues", () => {
  const evidencePackage = discoverOfferActivationEvidencePackage;

  it("looks like a product segmentation or eligibility issue rather than an outage", () => {
    const apiSuccessRateCard = evidencePackage.summaryCards.find((card) => card.id === "api_success_rate");
    const activationFailureCard = evidencePackage.summaryCards.find(
      (card) => card.id === "activation_failure_rate",
    );
    const productBreakdown = evidencePackage.breakdowns.find(
      (breakdown) => breakdown.dimension === "product_type",
    );

    expect(apiSuccessRateCard?.status).toBe("normal");
    expect(activationFailureCard?.status).toBe("critical");
    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "offer_code_invalid")).toBe(true);
    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "offer_not_eligible")).toBe(true);
    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "invalid_offer_period")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Discover" && row.status === "critical")).toBe(
      true,
    );
    expect(productBreakdown?.rows.some((row) => row.label === "Visa" && row.status === "normal")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Mastercard" && row.status === "normal")).toBe(
      true,
    );
    expect(evidencePackage.traces.every((trace) => trace.status === "ok")).toBe(true);
  });
});
