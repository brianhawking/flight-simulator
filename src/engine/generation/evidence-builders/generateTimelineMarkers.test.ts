import { describe, expect, it } from "vitest";
import { mobileEnumMappingScenario } from "../../../domain/scenarios/mobileEnumMappingScenario";
import { generateTimelineMarkers } from "./generateTimelineMarkers";

describe("generateTimelineMarkers", () => {
  it("converts timeline hints into renderable markers", () => {
    const markers = generateTimelineMarkers(
      new Date(mobileEnumMappingScenario.windowHint.start),
      mobileEnumMappingScenario.timelineHints,
    );

    expect(markers).toHaveLength(mobileEnumMappingScenario.timelineHints.length);
    expect(markers.map((marker) => marker.label)).toEqual(
      mobileEnumMappingScenario.timelineHints.map((hint) => hint.label),
    );
    expect(markers.every((marker) => Date.parse(marker.timestamp) > 0)).toBe(true);
  });
});
