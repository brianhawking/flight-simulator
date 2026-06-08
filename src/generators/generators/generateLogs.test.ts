import { describe, expect, it } from "vitest";
import { discoverOfferActivationScenario } from "../../scenarios/discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "../../scenarios/mobileEnumMappingScenario";
import { generateLogs } from "./generateLogs";

describe("generateLogs", () => {
  it("produces mapping-failure logs from mobile log patterns", () => {
    const logs = generateLogs(mobileEnumMappingScenario);

    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some((log) => log.attributes?.errorType === "enum_decoding_failed")).toBe(true);
    expect(logs.some((log) => log.attributes?.unknownValue === "cash_boost_plus")).toBe(true);
    expect(logs.some((log) => log.attributes?.feature === "rewards_tile")).toBe(true);
  });

  it("produces business-rule failure logs for offer activation", () => {
    const logs = generateLogs(discoverOfferActivationScenario);

    expect(logs.some((log) => log.attributes?.errorCode === "offer_code_invalid")).toBe(true);
    expect(logs.some((log) => log.attributes?.errorCode === "offer_not_eligible")).toBe(true);
    expect(logs.some((log) => log.attributes?.errorCode === "invalid_offer_period")).toBe(true);
    expect(logs.some((log) => log.attributes?.productType === "Discover")).toBe(true);
  });
});
