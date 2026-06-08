import { describe, expect, it } from "vitest";
import {
  acknowledgeIncident,
  canOpenMonitoring,
  createInitialNavigationState,
  openMonitoring,
  openPagerDuty,
  resetNavigationForScenario,
  selectSurface,
} from "./navigation";

describe("simulator navigation", () => {
  it("starts in Slack", () => {
    expect(createInitialNavigationState()).toEqual({
      surface: "slack",
      acknowledged: false,
      monitoringVisited: false,
    });
  });

  it("moves from Slack to PagerDuty and then to Monitoring after acknowledgment", () => {
    const pagerDutyState = openPagerDuty(createInitialNavigationState());
    expect(pagerDutyState.surface).toBe("pagerduty");
    expect(canOpenMonitoring(pagerDutyState)).toBe(false);

    const blockedMonitoringState = openMonitoring(pagerDutyState);
    expect(blockedMonitoringState.surface).toBe("pagerduty");

    const acknowledgedState = acknowledgeIncident(pagerDutyState);
    expect(acknowledgedState.acknowledged).toBe(true);

    const monitoringState = openMonitoring(acknowledgedState);
    expect(monitoringState.surface).toBe("monitoring");
    expect(monitoringState.monitoringVisited).toBe(true);
  });

  it("resets to Slack when the scenario changes", () => {
    const activeState = selectSurface(
      acknowledgeIncident(openPagerDuty(createInitialNavigationState())),
      "monitoring",
    );

    expect(activeState.surface).toBe("monitoring");
    expect(resetNavigationForScenario()).toEqual({
      surface: "slack",
      acknowledged: false,
      monitoringVisited: false,
    });
  });
});
