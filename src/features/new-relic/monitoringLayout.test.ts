import { describe, expect, it } from "vitest";
import { backendTimeoutEvidencePackage } from "../../evidence/backendTimeoutEvidencePackage";
import {
  buildMonitoringViewModel,
  MONITORING_TABS,
} from "./monitoringLayout";

describe("monitoringLayout", () => {
  it("defines the expected trainee-facing tabs", () => {
    expect(MONITORING_TABS.map((tab) => tab.label)).toEqual([
      "API Health",
      "Feature Impact",
      "Backend / OTEL",
    ]);
  });

  it("groups API Health around chart panels", () => {
    const viewModel = buildMonitoringViewModel(backendTimeoutEvidencePackage, "api");

    expect(viewModel.charts.length).toBeGreaterThan(0);
    expect(viewModel.showOperationsColumn).toBe(false);
  });

  it("groups Backend / OTEL around traces and service evidence", () => {
    const viewModel = buildMonitoringViewModel(backendTimeoutEvidencePackage, "backend");

    expect(viewModel.traces.length).toBeGreaterThan(0);
    expect(viewModel.logs.length).toBeGreaterThan(0);
    expect(viewModel.showOperationsColumn).toBe(true);
  });

  it("keeps tab labels and subtitles free of root-cause spoiler terms", () => {
    const visibleText = MONITORING_TABS.flatMap((tab) => [tab.label, tab.subtitle]).join(" ").toLowerCase();

    expect(visibleText).not.toContain("root cause");
    expect(visibleText).not.toContain("diagnosis");
    expect(visibleText).not.toContain("backend failure");
    expect(visibleText).not.toContain("correct team");
  });
});
