import { describe, expect, it } from "vitest";
import { backendTimeoutEvidencePackage } from "../domain/evidence/backendTimeoutEvidencePackage";
import { buildIncidentPresentation } from "./buildIncidentPresentation";

describe("buildIncidentPresentation", () => {
  it("builds neutral alert presentation data without diagnosis fields", () => {
    const presentation = buildIncidentPresentation(backendTimeoutEvidencePackage, false);

    expect(presentation.title).toContain("PEMX Account Summary");
    expect(presentation.severity).toBe("SEV1");
    expect(presentation.status).toBe("Triggered");
    expect(presentation.serviceName).toBeTruthy();
    expect(presentation.environment).toBeTruthy();
    expect("rootCause" in presentation).toBe(false);
    expect("diagnosis" in presentation).toBe(false);
  });

  it("reflects acknowledgement status", () => {
    const presentation = buildIncidentPresentation(backendTimeoutEvidencePackage, true);

    expect(presentation.status).toBe("Acknowledged");
  });
});
