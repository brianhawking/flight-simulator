import { EvidencePackage } from "../../domain/types/evidence";
import { buildPagerDutyActivity } from "./buildPagerDutyActivity";
import { formatSimulationTime } from "../../app/formatSimulationTime";

type PagerDutySurfaceProps = {
  alertTitle: string;
  severity: string;
  alertTimestamp: string;
  alertTimestampIso: string;
  alertThreshold: string;
  currentTime: string;
  acknowledged: boolean;
  monitoringVisited: boolean;
  evidencePackage: EvidencePackage;
  onAcknowledge: () => void;
  onOpenMonitoring: () => void;
};

export function PagerDutySurface({
  alertTitle,
  severity,
  alertTimestamp,
  alertTimestampIso,
  alertThreshold,
  currentTime,
  acknowledged,
  monitoringVisited,
  evidencePackage,
  onAcknowledge,
  onOpenMonitoring,
}: PagerDutySurfaceProps) {
  const activityItems = buildPagerDutyActivity({
    alertTitle,
    alertTimestamp: alertTimestampIso,
    currentTime,
    acknowledged,
    monitoringVisited,
  });

  return (
    <div className="surface-shell pagerduty-shell">
      <div className="pd-header">
        <div>
          <p className="eyebrow">PagerDuty Incident</p>
          <h2>{alertTitle}</h2>
        </div>
        <div className="pd-badge-row">
          <span className={`incident-badge severity-${severity.toLowerCase()}`}>{severity}</span>
          <span
            className={
              acknowledged
                ? "incident-badge pd-status-badge normal"
                : "incident-badge pd-status-badge warning"
            }
          >
            {acknowledged ? "Acknowledged" : "Triggered"}
          </span>
        </div>
      </div>
      <div className="pd-grid">
        <article className="pd-card">
          <span className="panel-label">Service</span>
          <strong>{evidencePackage.metadata?.serviceName ?? "unknown"}</strong>
          <p>{evidencePackage.metadata?.environment ?? "unknown"} environment</p>
        </article>
        <article className="pd-card">
          <span className="panel-label">Alert condition</span>
          <strong>{alertThreshold}</strong>
          <p>Monitoring threshold crossed</p>
        </article>
        <article className="pd-card">
          <span className="panel-label">Created</span>
          <strong>{alertTimestamp}</strong>
          <p>Monitoring alert received</p>
        </article>
      </div>
      <div className="pd-shell-grid">
        <div className="pd-activity">
          <div className="pd-section-header">
            <div>
              <span className="panel-label">Incident activity</span>
              <h3>Activity feed</h3>
            </div>
          </div>
          <div className="pd-timeline">
            {activityItems.map((item) => (
              <div key={item.id} className="pd-event">
                <span className={`pd-event-dot ${item.tone}`} />
                <div className="pd-event-copy">
                  <div className="pd-event-top">
                    <strong>{item.title}</strong>
                    <span>{formatSimulationTime(item.timestamp)}</span>
                  </div>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="pd-sidecard">
          <span className="panel-label">Incident state</span>
          <strong>{acknowledged ? "Responder active" : "Awaiting acknowledgment"}</strong>
          <p>
            {acknowledged
              ? "Monitoring is available for live evidence review."
              : "Acknowledge the incident to unlock the monitoring workspace."}
          </p>
        </aside>
      </div>
      <div className="pd-actions">
        <button
          type="button"
          className="primary-action"
          onClick={onAcknowledge}
          disabled={acknowledged}
        >
          {acknowledged ? "Acknowledged" : "Acknowledge Incident"}
        </button>
        <button
          type="button"
          className={acknowledged ? "primary-action" : "secondary-action"}
          onClick={onOpenMonitoring}
          disabled={!acknowledged}
        >
          {acknowledged ? "Open Monitoring" : "Acknowledge to Open Monitoring"}
        </button>
      </div>
    </div>
  );
}
