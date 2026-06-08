import { TraceRecord } from "../../../domain/types/evidence";

type TracesPanelProps = {
  traces: TraceRecord[];
};

export function TracesPanel({ traces }: TracesPanelProps) {
  return (
    <article className="nr-panel">
      <div className="nr-panel-header">
        <div>
          <span className="panel-label">Observed behavior</span>
          <h2>Trace evidence</h2>
        </div>
      </div>
      <div className="nr-trace-stack">
        {traces.length === 0 ? <EmptyPanelState message="No traces are visible at the current simulation time." /> : null}
        {traces.map((trace) => (
          <div key={trace.id} className="nr-trace-card">
            <div className="nr-trace-top">
              <div>
                <strong>{trace.traceName}</strong>
                <p>
                  {trace.service} | {trace.durationMs}ms
                </p>
              </div>
              <span className={`nr-pill status-${trace.status}`}>{trace.status}</span>
            </div>
            <p className="trace-summary">{trace.observedBehavior ?? "No observed behavior"}</p>
            <div className="nr-span-list">
              {trace.spans.map((span) => (
                <div key={span.id} className="nr-span-row">
                  <div>
                    <strong>{span.service}</strong>
                    <p>{span.operation}</p>
                  </div>
                  <div className="nr-span-meta">
                    <span>{span.durationMs}ms</span>
                    <span className={`nr-pill status-${span.status}`}>{span.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function EmptyPanelState({ message }: { message: string }) {
  return (
    <div className="nr-empty-state">
      <span className="panel-label">Simulation</span>
      <p>{message}</p>
    </div>
  );
}
