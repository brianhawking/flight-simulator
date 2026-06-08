import { describe, expect, it } from "vitest";
import { buildScenarioOptions } from "./buildScenarioOptions";

describe("buildScenarioOptions", () => {
  it("includes generated backend timeout as stream-backed", () => {
    const options = buildScenarioOptions();
    const backend = options.find((option) => option.id === "generated-backend-timeout");

    expect(backend).toBeDefined();
    expect(backend?.mode).toBe("generated");
    expect(backend?.simulationSource.mode).toBe("stream");
  });

  it("keeps other generated and authored scenarios on static evidence", () => {
    const options = buildScenarioOptions();

    expect(
      options.find((option) => option.id === "generated-mobile-enum-mapping")?.simulationSource.mode,
    ).toBe("static");
    expect(
      options.find((option) => option.id === "generated-discover-offer-activation")?.simulationSource.mode,
    ).toBe("static");
    expect(options.find((option) => option.id === "backend-timeout")?.simulationSource.mode).toBe(
      "static",
    );
  });
});
