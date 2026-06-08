import { describe, expect, it } from "vitest";
import { backendTimeoutScenario } from "../../../domain/scenarios/backendTimeoutScenario";
import { discoverOfferActivationScenario } from "../../../domain/scenarios/discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "../../../domain/scenarios/mobileEnumMappingScenario";
import { generateBreakdowns } from "./generateBreakdowns";

describe("generateBreakdowns", () => {
  it("produces platform breakdowns for backend timeout", () => {
    const breakdowns = generateBreakdowns(backendTimeoutScenario);

    expect(breakdowns).toHaveLength(1);
    expect(breakdowns[0]?.dimension).toBe("platform");
    expect(breakdowns[0]?.rows.every((row) => row.status === "critical")).toBe(true);
  });

  it("produces platform and app-version breakdowns for mobile enum mapping", () => {
    const breakdowns = generateBreakdowns(mobileEnumMappingScenario);
    const platformBreakdown = breakdowns.find((breakdown) => breakdown.dimension === "platform");
    const appVersionBreakdown = breakdowns.find((breakdown) => breakdown.dimension === "app_version");

    expect(platformBreakdown?.rows.some((row) => row.label === "iOS" && row.status === "critical")).toBe(true);
    expect(platformBreakdown?.rows.some((row) => row.label === "Android" && row.status === "normal")).toBe(true);
    expect(appVersionBreakdown?.rows.some((row) => row.label === "6.5.0" && row.status === "critical")).toBe(true);
  });

  it("produces Discover-centered product breakdowns for offer activation", () => {
    const breakdowns = generateBreakdowns(discoverOfferActivationScenario);
    const productBreakdown = breakdowns.find((breakdown) => breakdown.dimension === "product_type");

    expect(productBreakdown?.rows.some((row) => row.label === "Discover" && row.status === "critical")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Visa" && row.status === "normal")).toBe(true);
    expect(productBreakdown?.rows.some((row) => row.label === "Mastercard" && row.status === "normal")).toBe(
      true,
    );
  });
});
