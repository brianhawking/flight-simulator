import { TimelineMarker } from "../../../domain/types/evidence";

type TimelinePanelProps = {
  markers: TimelineMarker[];
};

export function TimelinePanel({ markers }: TimelinePanelProps) {
  return (
    <article className="nr-panel">
      <div className="nr-panel-header">
        <div>
          <span className="panel-label">Signal timeline</span>
          <h2>Incident signals</h2>
        </div>
      </div>
      <div className="nr-timeline">
        {markers.length === 0 ? <EmptyPanelState message="No timeline markers have been revealed yet." /> : null}
        {markers.map((marker) => (
          <div key={marker.id} className="nr-timeline-item">
            <span className={`nr-timeline-dot status-${mapCategoryToStatus(marker.category)}`} />
            <div>
              <strong>{toNeutralDisplayLabel(marker)}</strong>
              <small>{formatTimestamp(marker.timestamp)}</small>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function mapCategoryToStatus(category: TimelineMarker["category"]) {
  switch (category) {
    case "cause":
      return "critical";
    case "impact":
      return "warning";
    case "symptom":
      return "warning";
    case "investigation":
      return "normal";
    default:
      return "normal";
  }
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function toNeutralDisplayLabel(marker: TimelineMarker) {
  switch (marker.category) {
    case "cause":
      return "Trace anomaly observed";
    case "impact":
      return "Segment difference observed";
    case "symptom":
      return "Error rate changed";
    case "investigation":
      return "Additional logs available";
    default:
      return "Incident signal observed";
  }
}

function EmptyPanelState({ message }: { message: string }) {
  return (
    <div className="nr-empty-state">
      <span className="panel-label">Simulation</span>
      <p>{message}</p>
    </div>
  );
}
