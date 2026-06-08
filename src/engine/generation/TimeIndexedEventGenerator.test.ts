import { describe, expect, it } from "vitest";
import { backendTimeoutScenario } from "../../domain/scenarios/backendTimeoutScenario";
import { generateTimeIndexedEvents } from "./TimeIndexedEventGenerator";

describe("TimeIndexedEventGenerator", () => {
  it("creates log, trace, and timeline events for backend timeout", () => {
    const events = generateTimeIndexedEvents(backendTimeoutScenario);

    expect(events.some((event) => event.type === "log")).toBe(true);
    expect(events.some((event) => event.type === "trace")).toBe(true);
    expect(events.some((event) => event.type === "timeline_marker")).toBe(true);
    expect(
      events.every(
        (event, index) =>
          index === 0 || Date.parse(events[index - 1]?.timestamp ?? "") <= Date.parse(event.timestamp),
      ),
    ).toBe(true);
  });
});
