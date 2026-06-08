import { describe, expect, it } from "vitest";
import { buildPagerDutyActivity } from "./buildPagerDutyActivity";

describe("buildPagerDutyActivity", () => {
  const baseInput = {
    alertTitle: "PEMX Account Summary - public-api Success Rate < 93%",
    alertTimestamp: "2026-06-07T14:05:00.000Z",
  };

  it("starts triggered with only alert facts before acknowledgement", () => {
    const items = buildPagerDutyActivity({
      ...baseInput,
      currentTime: "2026-06-07T14:06:00.000Z",
      acknowledged: false,
      monitoringVisited: false,
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe("Alert triggered");
  });

  it("adds neutral operational events after acknowledgement and monitoring access", () => {
    const acknowledgedItems = buildPagerDutyActivity({
      ...baseInput,
      currentTime: "2026-06-07T14:09:00.000Z",
      acknowledged: true,
      monitoringVisited: false,
    });
    const monitoringItems = buildPagerDutyActivity({
      ...baseInput,
      currentTime: "2026-06-07T14:10:00.000Z",
      acknowledged: true,
      monitoringVisited: true,
    });

    expect(acknowledgedItems.some((item) => item.title === "Incident acknowledged")).toBe(true);
    expect(acknowledgedItems.some((item) => item.title === "Investigation in progress")).toBe(true);
    expect(monitoringItems.some((item) => item.title === "Monitoring opened")).toBe(true);
  });

  it("keeps visible text free of diagnosis spoilers", () => {
    const items = buildPagerDutyActivity({
      ...baseInput,
      currentTime: "2026-06-07T14:10:00.000Z",
      acknowledged: true,
      monitoringVisited: true,
    });
    const visibleText = items.flatMap((item) => [item.title, item.detail]).join(" ").toLowerCase();

    expect(visibleText).not.toContain("root cause");
    expect(visibleText).not.toContain("backend-team");
    expect(visibleText).not.toContain("downstream timeout");
    expect(visibleText).not.toContain("discover");
    expect(visibleText).not.toContain("enum decoding");
  });
});
