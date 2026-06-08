import { EvidencePackage } from "../domain/types/evidence";

export type IncidentPresentation = {
  title: string;
  severity: "SEV1" | "SEV2" | "SEV3";
  status: "Triggered" | "Acknowledged";
  triggeredAtIso: string;
  triggeredAtLabel: string;
  thresholdText: string;
  serviceName: string;
  environment: string;
};

export function buildIncidentPresentation(
  evidencePackage: EvidencePackage,
  acknowledged: boolean,
): IncidentPresentation {
  const criticalCard = evidencePackage.summaryCards.find((card) => card.status === "critical");
  const service = evidencePackage.metadata?.serviceName ?? "Mobile";
  const triggeredAtIso = evidencePackage.timelineMarkers[0]?.timestamp ?? evidencePackage.window.start;

  return {
    title: deriveAlertTitle(evidencePackage, criticalCard?.label, service),
    severity: deriveSeverity(evidencePackage),
    status: acknowledged ? "Acknowledged" : "Triggered",
    triggeredAtIso,
    triggeredAtLabel: formatSimulationTime(triggeredAtIso),
    thresholdText: deriveAlertThreshold(evidencePackage),
    serviceName: service,
    environment: evidencePackage.metadata?.environment ?? "unknown",
  };
}

function deriveAlertTitle(
  evidencePackage: EvidencePackage,
  criticalLabel: string | undefined,
  service: string,
) {
  if (criticalLabel?.toLowerCase().includes("success")) {
    return `PEMX Account Summary - ${service} ${criticalLabel} < 93%`;
  }

  if (criticalLabel) {
    return `PEMX Account Summary - ${service} ${criticalLabel}`;
  }

  return `PEMX Account Summary - Incident Monitor`;
}

function deriveSeverity(evidencePackage: EvidencePackage): IncidentPresentation["severity"] {
  const criticalCount = evidencePackage.summaryCards.filter((card) => card.status === "critical").length;

  if (criticalCount >= 3) {
    return "SEV1";
  }

  if (criticalCount >= 2) {
    return "SEV2";
  }

  return "SEV3";
}

function deriveAlertThreshold(evidencePackage: EvidencePackage) {
  const successCard = evidencePackage.summaryCards.find((card) => /success/i.test(card.label));

  if (successCard) {
    return "Threshold breached: success rate below 93%";
  }

  return "Threshold breached";
}

function formatSimulationTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}
