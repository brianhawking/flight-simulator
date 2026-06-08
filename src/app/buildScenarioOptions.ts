import { backendTimeoutEvidencePackage } from "../domain/evidence/backendTimeoutEvidencePackage";
import { discoverOfferActivationEvidencePackage } from "../domain/evidence/discoverOfferActivationEvidencePackage";
import { mobileEnumMappingEvidencePackage } from "../domain/evidence/mobileEnumMappingEvidencePackage";
import { backendTimeoutScenario } from "../domain/scenarios/backendTimeoutScenario";
import { discoverOfferActivationScenario } from "../domain/scenarios/discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "../domain/scenarios/mobileEnumMappingScenario";
import { EvidencePackage } from "../domain/types/evidence";
import { generateMetricStreams } from "../engine/generation/MetricStreamGenerator";
import { generateEvidence } from "../engine/generation/RuleBasedEvidenceGenerator";
import { generateTimeIndexedEvents } from "../engine/generation/TimeIndexedEventGenerator";
import { SimulationEvidenceSource } from "../engine/simulation/SimulationSession";

export type ScenarioOption = {
  id: string;
  label: string;
  mode: "authored" | "generated";
  evidencePackage: EvidencePackage;
  simulationSource: SimulationEvidenceSource;
};

export function buildScenarioOptions(): ScenarioOption[] {
  return [
    {
      id: "generated-backend-timeout",
      label: "Generated: Backend Timeout",
      mode: "generated",
      evidencePackage: generateEvidence(backendTimeoutScenario),
      simulationSource: {
        mode: "stream",
        scenario: backendTimeoutScenario,
        metricStreams: generateMetricStreams(backendTimeoutScenario),
        timeIndexedEvents: generateTimeIndexedEvents(backendTimeoutScenario),
      },
    },
    {
      id: "generated-mobile-enum-mapping",
      label: "Generated: Mobile Enum Mapping",
      mode: "generated",
      evidencePackage: generateEvidence(mobileEnumMappingScenario),
      simulationSource: {
        mode: "static",
        evidencePackage: generateEvidence(mobileEnumMappingScenario),
      },
    },
    {
      id: "generated-discover-offer-activation",
      label: "Generated: Discover Offer Activation",
      mode: "generated",
      evidencePackage: generateEvidence(discoverOfferActivationScenario),
      simulationSource: {
        mode: "static",
        evidencePackage: generateEvidence(discoverOfferActivationScenario),
      },
    },
    {
      id: "backend-timeout",
      label: "Authored: Backend Timeout",
      mode: "authored",
      evidencePackage: backendTimeoutEvidencePackage,
      simulationSource: {
        mode: "static",
        evidencePackage: backendTimeoutEvidencePackage,
      },
    },
    {
      id: "mobile-enum-mapping",
      label: "Authored: Mobile Enum Mapping",
      mode: "authored",
      evidencePackage: mobileEnumMappingEvidencePackage,
      simulationSource: {
        mode: "static",
        evidencePackage: mobileEnumMappingEvidencePackage,
      },
    },
    {
      id: "discover-offer-activation",
      label: "Authored: Discover Offer Activation",
      mode: "authored",
      evidencePackage: discoverOfferActivationEvidencePackage,
      simulationSource: {
        mode: "static",
        evidencePackage: discoverOfferActivationEvidencePackage,
      },
    },
  ];
}
