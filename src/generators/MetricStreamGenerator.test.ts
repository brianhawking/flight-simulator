import { describe, expect, it } from "vitest";
import { backendTimeoutScenario } from "../scenarios/backendTimeoutScenario";
import { generateMetricStreams } from "./MetricStreamGenerator";

describe("MetricStreamGenerator", () => {
  it("generates backend timeout metric streams with minute-level points", () => {
    const metricStreams = generateMetricStreams(backendTimeoutScenario);

    expect(metricStreams.scenarioId).toBe(backendTimeoutScenario.id);
    expect(metricStreams.streams).toHaveLength(5);

    const successRateStream = metricStreams.streams.find(
      (stream) => stream.metric === "success_rate",
    );
    const latencyStream = metricStreams.streams.find(
      (stream) => stream.metric === "p95_latency",
    );

    expect(successRateStream?.resolution).toBe("1m");
    expect(successRateStream?.points.length).toBeGreaterThan(20);
    expect(successRateStream?.points[0]?.value).toBe(99.4);
    expect(
      successRateStream?.points[(successRateStream?.points.length ?? 1) - 1]?.value,
    ).toBeGreaterThan(81);

    const firstTimestamp = Date.parse(successRateStream?.points[0]?.timestamp ?? "");
    const secondTimestamp = Date.parse(successRateStream?.points[1]?.timestamp ?? "");
    expect(secondTimestamp - firstTimestamp).toBe(60 * 1000);

    expect(latencyStream?.points.length).toBe(successRateStream?.points.length);
    expect(metricStreams.thresholds.some((threshold) => threshold.metric === "success_rate")).toBe(
      true,
    );
    expect(metricStreams.phases.length).toBeGreaterThan(0);
  });
});
