import { describe, expect, it } from "vitest";
import { backendTimeoutEvidencePackage } from "../evidence/backendTimeoutEvidencePackage";
import { discoverOfferActivationEvidencePackage } from "../evidence/discoverOfferActivationEvidencePackage";
import { mobileEnumMappingEvidencePackage } from "../evidence/mobileEnumMappingEvidencePackage";
import { backendTimeoutScenario } from "./backendTimeoutScenario";
import { discoverOfferActivationScenario } from "./discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "./mobileEnumMappingScenario";
import { ExpectedEvidenceType, RootCauseDomain } from "../types/scenario";

const scenarios = [
  {
    name: "backendTimeoutScenario",
    scenario: backendTimeoutScenario,
    evidencePackage: backendTimeoutEvidencePackage,
  },
  {
    name: "mobileEnumMappingScenario",
    scenario: mobileEnumMappingScenario,
    evidencePackage: mobileEnumMappingEvidencePackage,
  },
  {
    name: "discoverOfferActivationScenario",
    scenario: discoverOfferActivationScenario,
    evidencePackage: discoverOfferActivationEvidencePackage,
  },
] as const;

describe.each(scenarios)("$name", ({ scenario, evidencePackage }) => {
  it("has a valid top-level shape", () => {
    expect(scenario.id).toBeTruthy();
    expect(scenario.title).toBeTruthy();
    expect(scenario.summary).toBeTruthy();
    expect(scenario.difficulty).toBeTruthy();
    expect(scenario.incidentType).toBeTruthy();
    expect(scenario.rootCauseDomain).toBeTruthy();
    expect(scenario.serviceContext.primaryService).toBeTruthy();
    expect(scenario.windowHint.start).toBeTruthy();
    expect(scenario.windowHint.durationMinutes).toBeGreaterThan(0);
    expect(scenario.windowHint.timezone).toBeTruthy();
    expect(scenario.severityHint.severity).toBeTruthy();
    expect(Array.isArray(scenario.learningObjectives)).toBe(true);
    expect(Array.isArray(scenario.initialFacts)).toBe(true);
    expect(Array.isArray(scenario.discoverableFacts)).toBe(true);
    expect(Array.isArray(scenario.signals)).toBe(true);
    expect(Array.isArray(scenario.signalParameters)).toBe(true);
    expect(Array.isArray(scenario.affectedSegments)).toBe(true);
    expect(Array.isArray(scenario.timelineHints)).toBe(true);
    expect(Array.isArray(scenario.expectedEvidence)).toBe(true);
    expect(Array.isArray(scenario.expectedActions)).toBe(true);
  });

  it("has learning objectives, root cause domain, and expected evidence", () => {
    expect(scenario.learningObjectives.length).toBeGreaterThan(0);
    expect(validRootCauseDomains).toContain(scenario.rootCauseDomain);
    expect(scenario.expectedEvidence.length).toBeGreaterThan(0);
    scenario.expectedEvidence.forEach((evidenceType) => {
      expect(validExpectedEvidenceTypes).toContain(evidenceType);
    });
  });

  it("uses generic affected segments instead of hardcoded scenario fields", () => {
    scenario.affectedSegments.forEach((segment) => {
      expect(segment.dimension).toBeTruthy();
      expect(segment.affected.length).toBeGreaterThan(0);
    });
  });

  it("links cleanly back to the authored evidence package by scenario id", () => {
    expect(evidencePackage.scenarioId).toBe(scenario.id);
  });
});

describe("scenario coverage", () => {
  it("covers backend, mobile client, and product configuration root cause domains", () => {
    const domains = scenarios.map(({ scenario }) => scenario.rootCauseDomain);

    expect(domains).toContain("backend");
    expect(domains).toContain("mobile_client");
    expect(domains).toContain("product_config");
  });

  it("keeps expected evidence generic across the three scenarios", () => {
    scenarios.forEach(({ scenario }) => {
      expect(scenario.expectedEvidence.some((evidenceType) => evidenceType.includes("_"))).toBe(true);
    });
  });

  it("gives the backend timeout scenario structured generation hints", () => {
    expect(backendTimeoutScenario.signalParameters.length).toBeGreaterThan(0);
    expect(
      backendTimeoutScenario.signalParameters.some((parameter) => parameter.type === "success_rate_drop"),
    ).toBe(true);
    expect(
      backendTimeoutScenario.signalParameters.some((parameter) => parameter.type === "status_code_spike"),
    ).toBe(true);
    expect(
      backendTimeoutScenario.signalParameters.some((parameter) => parameter.type === "downstream_timeout"),
    ).toBe(true);
    expect(backendTimeoutScenario.timelineHints.length).toBeGreaterThan(0);
  });

  it("gives the mobile enum mapping scenario structured log and request hints", () => {
    expect(
      mobileEnumMappingScenario.signalParameters.some((parameter) => parameter.type === "log_pattern"),
    ).toBe(true);
    expect(
      mobileEnumMappingScenario.signalParameters.some((parameter) => parameter.type === "request_outcome"),
    ).toBe(true);
    expect(
      mobileEnumMappingScenario.signalParameters.filter((parameter) => parameter.type === "segment_impact").length,
    ).toBeGreaterThan(1);
  });

  it("gives the Discover offer activation scenario structured business-rule hints", () => {
    expect(
      discoverOfferActivationScenario.signalParameters.some((parameter) => parameter.type === "log_pattern"),
    ).toBe(true);
    expect(
      discoverOfferActivationScenario.signalParameters.some((parameter) => parameter.type === "request_outcome"),
    ).toBe(true);
    expect(
      discoverOfferActivationScenario.signalParameters.some(
        (parameter) => parameter.type === "segment_impact" && parameter.dimension === "product_type",
      ),
    ).toBe(true);
  });
});

const validRootCauseDomains: RootCauseDomain[] = [
  "backend",
  "mobile_client",
  "product_config",
  "platform_os",
  "mixed",
  "unknown",
];

const validExpectedEvidenceTypes: ExpectedEvidenceType[] = [
  "api_health",
  "status_codes",
  "feature_logs",
  "business_rule_logs",
  "traces",
  "segment_breakdown",
  "release_marker",
  "config_marker",
];
