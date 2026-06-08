import { LogRecord } from "../../../types/evidence";

type LogsPanelProps = {
  logs: LogRecord[];
};

export function LogsPanel({ logs }: LogsPanelProps) {
  return (
    <article className="nr-panel">
      <div className="nr-panel-header">
        <div>
          <span className="panel-label">Observed behavior</span>
          <h2>Event stream</h2>
        </div>
      </div>
      <div className="nr-log-list">
        {logs.length === 0 ? <EmptyPanelState message="No logs have been revealed yet." /> : null}
        {logs.map((log) => (
          <div key={log.id} className="nr-log-row">
            <div className="nr-log-row-top">
              <span className={`nr-log-level level-${log.level.toLowerCase()}`}>{log.level}</span>
              <strong>{log.service}</strong>
              <span className="subtle">{formatTimestamp(log.timestamp)}</span>
            </div>
            <p>{log.message}</p>
            {log.attributes ? (
              <code>{Object.entries(log.attributes).map(([key, value]) => `${key}=${String(value)}`).join(" ")}</code>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
}

function EmptyPanelState({ message }: { message: string }) {
  return (
    <div className="nr-empty-state">
      <span className="panel-label">Simulation</span>
      <p>{message}</p>
    </div>
  );
}
