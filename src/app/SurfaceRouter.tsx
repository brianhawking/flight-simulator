import { ReactNode } from "react";
import { NewRelicPage } from "../features/new-relic/NewRelicPage";
import { PagerDutySurface } from "../features/pagerduty/PagerDutySurface";
import { SlackSurface } from "../features/slack/SlackSurface";
import { EvidencePackage } from "../domain/types/evidence";
import { IncidentPresentation } from "./buildIncidentPresentation";
import { Surface } from "../engine/navigation/navigation";

type SurfaceRouterProps = {
  surface: Surface;
  incident: IncidentPresentation;
  currentTime: string;
  acknowledged: boolean;
  monitoringVisited: boolean;
  visibleEvidence: EvidencePackage;
  onOpenIncident: () => void;
  onAcknowledge: () => void;
  onOpenMonitoring: () => void;
};

export function SurfaceRouter({
  surface,
  incident,
  currentTime,
  acknowledged,
  monitoringVisited,
  visibleEvidence,
  onOpenIncident,
  onAcknowledge,
  onOpenMonitoring,
}: SurfaceRouterProps) {
  if (surface === "slack") {
    return (
      <ToolWindow appName="Slack" appUrl="workspace/slack" accent="slack">
        <SlackSurface
          alertTitle={incident.title}
          severity={incident.severity}
          alertThreshold={incident.thresholdText}
          alertTimestamp={incident.triggeredAtLabel}
          alertTimestampIso={incident.triggeredAtIso}
          currentTime={currentTime}
          acknowledged={acknowledged}
          onOpenIncident={onOpenIncident}
        />
      </ToolWindow>
    );
  }

  if (surface === "pagerduty") {
    return (
      <ToolWindow appName="PagerDuty" appUrl="workspace/pagerduty" accent="pagerduty">
        <PagerDutySurface
          alertTitle={incident.title}
          severity={incident.severity}
          alertTimestamp={incident.triggeredAtLabel}
          alertTimestampIso={incident.triggeredAtIso}
          alertThreshold={incident.thresholdText}
          currentTime={currentTime}
          acknowledged={acknowledged}
          monitoringVisited={monitoringVisited}
          evidencePackage={visibleEvidence}
          onAcknowledge={onAcknowledge}
          onOpenMonitoring={onOpenMonitoring}
        />
      </ToolWindow>
    );
  }

  return (
    <ToolWindow appName="Monitoring" appUrl="workspace/monitoring" accent="monitoring">
      <div className="monitoring-shell">
        <NewRelicPage evidencePackage={visibleEvidence} />
      </div>
    </ToolWindow>
  );
}

function ToolWindow({
  appName,
  appUrl,
  accent,
  children,
}: {
  appName: string;
  appUrl: string;
  accent: "slack" | "pagerduty" | "monitoring";
  children: ReactNode;
}) {
  return (
    <section className={`tool-window tool-${accent}`}>
      <div className="tool-window-chrome">
        <div className="tool-window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="tool-window-tabs">
          <div className="tool-window-tab active">
            <strong>{appName}</strong>
          </div>
        </div>
        <div className="tool-window-url">{appUrl}</div>
      </div>
      <div className="tool-window-body">{children}</div>
    </section>
  );
}
