import { describe, expect, it } from "vitest";
import { generateEvidence } from "./RuleBasedEvidenceGenerator";
import { backendTimeoutScenario } from "../scenarios/backendTimeoutScenario";
import { discoverOfferActivationScenario } from "../scenarios/discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "../scenarios/mobileEnumMappingScenario";
import { assertEvidencePackageContract } from "../evidence/evidenceContractAssertions";

describe("RuleBasedEvidenceGenerator", () => {
  it("generates a valid evidence package for the backend timeout scenario", () => {
    const evidencePackage = generateEvidence(backendTimeoutScenario);

    assertEvidencePackageContract(evidencePackage);
    expect(evidencePackage.scenarioId).toBe(backendTimeoutScenario.id);
    expect(evidencePackage.charts.length).toBeGreaterThan(0);
    expect(evidencePackage.logs.length).toBeGreaterThan(0);
    expect(evidencePackage.traces.length).toBeGreaterThan(0);
    expect(evidencePackage.timelineMarkers.length).toBeGreaterThan(0);
    expect(evidencePackage.breakdowns.length).toBeGreaterThan(0);
  });

  it("consumes backend scenario signal parameters and window hints", () => {
    const evidencePackage = generateEvidence(backendTimeoutScenario);
    const successRateChart = evidencePackage.charts.find((chart) => chart.id === "success-rate");
    const timeoutTrace = evidencePackage.traces[0];
    const successRatePoints = successRateChart?.series[0]?.points ?? [];

    expect(evidencePackage.metadata?.serviceName).toBe(backendTimeoutScenario.serviceContext.primaryService);
    expect(Date.parse(evidencePackage.window.start)).toBe(Date.parse(backendTimeoutScenario.windowHint.start));
    expect(evidencePackage.window.timezone).toBe(backendTimeoutScenario.windowHint.timezone);
    expect(successRatePoints[0]?.value).toBe(
      backendTimeoutScenario.signalParameters.find((parameter) => parameter.type === "success_rate_drop")?.from,
    );
    expect(successRatePoints[successRatePoints.length - 1]?.value).toBe(
      backendTimeoutScenario.signalParameters.find((parameter) => parameter.type === "success_rate_drop")?.to,
    );
    expect(timeoutTrace?.spans.some((span) => span.durationMs === 4500 && span.status === "timeout")).toBe(true);
  });

  it("contains the expected backend timeout evidence families", () => {
    const evidencePackage = generateEvidence(backendTimeoutScenario);

    expect(evidencePackage.charts.some((chart) => chart.title === "Success Rate")).toBe(true);
    expect(evidencePackage.charts.some((chart) => chart.title === "Status Codes")).toBe(true);
    expect(evidencePackage.traces.some((trace) => trace.status === "timeout")).toBe(true);
    expect(evidencePackage.logs.some((log) => String(log.message).toLowerCase().includes("timeout"))).toBe(true);
    expect(evidencePackage.breakdowns.some((breakdown) => breakdown.dimension === "platform")).toBe(true);
  });

  it("uses timeline hints to build the rendered timeline markers", () => {
    const evidencePackage = generateEvidence(backendTimeoutScenario);

    expect(evidencePackage.timelineMarkers).toHaveLength(backendTimeoutScenario.timelineHints.length);
    expect(evidencePackage.timelineMarkers.map((marker) => marker.label)).toEqual(
      backendTimeoutScenario.timelineHints.map((hint) => hint.label),
    );
  });

  it("generates valid mobile enum mapping evidence from scenario hints", () => {
    const evidencePackage = generateEvidence(mobileEnumMappingScenario);

    assertEvidencePackageContract(evidencePackage);
    expect(evidencePackage.scenarioId).toBe(mobileEnumMappingScenario.id);
    expect(evidencePackage.logs.length).toBeGreaterThan(0);
    expect(evidencePackage.breakdowns.length).toBeGreaterThan(0);
    expect(evidencePackage.charts.length).toBeGreaterThan(0);
    expect(evidencePackage.timelineMarkers.length).toBeGreaterThan(0);
    expect(evidencePackage.traces.every((trace) => trace.status === "ok")).toBe(true);
  });

  it("produces mobile evidence that looks like a client mapping issue", () => {
    const evidencePackage = generateEvidence(mobileEnumMappingScenario);
    const apiSuccessRateCard = evidencePackage.summaryCards.find((card) => card.id === "api_success_rate");
    const platformBreakdown = evidencePackage.breakdowns.find((breakdown) => breakdown.dimension === "platform");

    expect(apiSuccessRateCard?.status).toBe("normal");
    expect(evidencePackage.logs.some((log) => log.attributes?.errorType === "enum_decoding_failed")).toBe(true);
    expect(evidencePackage.logs.some((log) => log.attributes?.unknownValue === "cash_boost_plus")).toBe(true);
    expect(platformBreakdown?.rows.some((row) => row.label === "iOS" && row.status === "critical")).toBe(true);
    expect(platformBreakdown?.rows.some((row) => row.label === "Android" && row.status === "normal")).toBe(true);
    expect(evidencePackage.charts.some((chart) => chart.title === "API Success Rate")).toBe(true);
    expect(evidencePackage.charts.some((chart) => chart.title === "Rewards Tile Failure Rate")).toBe(true);
  });

  it("generates valid Discover offer activation evidence from scenario hints", () => {
    const evidencePackage = generateEvidence(discoverOfferActivationScenario);

    assertEvidencePackageContract(evidencePackage);
    expect(evidencePackage.logs.length).toBeGreaterThan(0);
    expect(evidencePackage.breakdowns.length).toBeGreaterThan(0);
    expect(evidencePackage.charts.length).toBeGreaterThan(0);
    expect(evidencePackage.timelineMarkers.length).toBeGreaterThan(0);
    expect(evidencePackage.traces.every((trace) => trace.status === "ok")).toBe(true);
  });

  it("produces Discover-segmented business incident evidence", () => {
    const evidencePackage = generateEvidence(discoverOfferActivationScenario);
    const productBreakdown = evidencePackage.breakdowns.find((breakdown) => breakdown.dimension === "product_type");

    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "offer_code_invalid")).toBe(true);
    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "offer_not_eligible")).toBe(true);
    expect(evidencePackage.logs.some((log) => log.attributes?.errorCode === "invalid_offer_period")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Discover" && row.status === "critical")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Visa" && row.status === "normal")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Mastercard" && row.status === "normal")).toBe(
      true,
    );
    expect(evidencePackage.charts.some((chart) => chart.title === "Offer Activation Success Rate")).toBe(true);
    expect(evidencePackage.charts.some((chart) => chart.title === "403 Responses")).toBe(true);
  });

  it("throws for unsupported scenarios", () => {
    expect(() =>
      generateEvidence({
        ...discoverOfferActivationScenario,
        signalParameters: [],
        timelineHints: [],
        id: "scenario_unsupported_demo",
      }),
    ).toThrow(
      "Unsupported scenario for rule-based generation",
    );
  });
});
