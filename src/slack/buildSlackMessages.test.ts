import { describe, expect, it } from "vitest";
import { buildSlackMessages } from "./buildSlackMessages";

describe("buildSlackMessages", () => {
  const baseInput = {
    alertTitle: "PEMX Account Summary - public-api Success Rate < 93%",
    severity: "SEV1",
    alertThreshold: "Threshold breached: success rate below 93%",
    alertTimestamp: "2026-06-07T14:05:00.000Z",
  };

  it("shows only the alert message before acknowledgement", () => {
    const messages = buildSlackMessages({
      ...baseInput,
      currentTime: "2026-06-07T14:08:00.000Z",
      acknowledged: false,
    });

    expect(messages).toHaveLength(1);
    expect(messages[0]?.author).toBe("New Relic Alerts");
  });

  it("reveals follow-up messages only after acknowledgement and time progression", () => {
    const earlyMessages = buildSlackMessages({
      ...baseInput,
      currentTime: "2026-06-07T14:05:30.000Z",
      acknowledged: true,
    });
    const laterMessages = buildSlackMessages({
      ...baseInput,
      currentTime: "2026-06-07T14:10:30.000Z",
      acknowledged: true,
    });

    expect(earlyMessages).toHaveLength(1);
    expect(laterMessages.length).toBeGreaterThan(earlyMessages.length);
    expect(laterMessages.some((message) => message.lines.join(" ").includes("customer impact"))).toBe(true);
  });

  it("keeps Slack text neutral and free of diagnosis spoilers", () => {
    const messages = buildSlackMessages({
      ...baseInput,
      currentTime: "2026-06-07T14:10:30.000Z",
      acknowledged: true,
    });
    const visibleText = messages.flatMap((message) => [message.author, ...message.lines]).join(" ").toLowerCase();

    expect(visibleText).not.toContain("backend-team");
    expect(visibleText).not.toContain("root cause");
    expect(visibleText).not.toContain("downstream timeout");
    expect(visibleText).not.toContain("enum decoding");
    expect(visibleText).not.toContain("discover");
  });
});
