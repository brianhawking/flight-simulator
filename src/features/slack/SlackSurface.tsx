import { buildSlackMessages } from "./buildSlackMessages";
import { formatSimulationTime } from "../../app/formatSimulationTime";

type SlackSurfaceProps = {
  alertTitle: string;
  severity: string;
  alertThreshold: string;
  alertTimestamp: string;
  alertTimestampIso: string;
  currentTime: string;
  acknowledged: boolean;
  onOpenIncident: () => void;
};

export function SlackSurface({
  alertTitle,
  severity,
  alertThreshold,
  alertTimestamp,
  alertTimestampIso,
  currentTime,
  acknowledged,
  onOpenIncident,
}: SlackSurfaceProps) {
  const messages = buildSlackMessages({
    alertTitle,
    severity,
    alertThreshold,
    alertTimestamp: alertTimestampIso,
    currentTime,
    acknowledged,
  });

  return (
    <div className="surface-shell slack-shell">
      <aside className="slack-sidebar">
        <div className="slack-workspace">
          <strong>PEMX Engineering</strong>
          <span>Incident workspace</span>
        </div>
        <div className="slack-channel-section">
          <span className="slack-section-label">Channels</span>
          <button type="button" className="slack-channel active">
            <strong># alerts</strong>
            <small>Alert feed</small>
          </button>
          <button type="button" className="slack-channel">
            <strong># frontend</strong>
            <small>Team channel</small>
          </button>
          <button type="button" className="slack-channel">
            <strong># backend</strong>
            <small>Team channel</small>
          </button>
        </div>
      </aside>
      <div className="slack-main">
        <div className="slack-header">
          <div>
            <strong># alerts</strong>
            <span>Automated incident notifications</span>
          </div>
          <span className={`slack-severity severity-${severity.toLowerCase()}`}>{severity}</span>
        </div>
        <div className="slack-channel-shell">
          <div className="slack-thread">
            {messages.map((message) => (
              <div key={message.id} className="slack-message">
                <div className={message.kind === "teammate" ? "slack-avatar user" : "slack-avatar"}>
                  {avatarFor(message.author)}
                </div>
                <div className={message.kind === "system" ? "slack-bubble system" : "slack-bubble"}>
                  <div className="slack-message-meta">
                    <strong>{message.author}</strong>
                    {message.kind === "bot" ? <span>{severity}</span> : null}
                    <span>{formatSimulationTime(message.timestamp)}</span>
                  </div>
                  <div className="slack-message-body">
                    {message.lines.map((line, index) =>
                      index === 0 && message.kind === "bot" ? (
                        <h2 key={line}>{line}</h2>
                      ) : (
                        <p key={line}>{line}</p>
                      ),
                    )}
                  </div>
                  {message.id === "alert-bot-message" ? (
                    <div className="slack-alert-facts">
                      <span>Severity: {severity}</span>
                      <span>{alertThreshold}</span>
                      <span>Triggered: {alertTimestamp}</span>
                    </div>
                  ) : null}
                  {message.ctaLabel ? (
                    <div className="slack-actions">
                      <button type="button" className="primary-action" onClick={onOpenIncident}>
                        {message.ctaLabel}
                      </button>
                      <span className="slack-chip">Alert routed to incident workflow</span>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="slack-composer-shell">
            <div className="slack-presence">
              <span className="panel-label">Channel status</span>
              <strong>{acknowledged ? "Incident acknowledged" : "Awaiting acknowledgment"}</strong>
            </div>
            <div className="slack-composer">
              <span className="slack-composer-placeholder">Message #alerts</span>
              <button type="button" className="slack-composer-button" disabled>
                Send
              </button>
            </div>
            <small>Chat replies are not wired yet. This channel stays neutral and time-aware.</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function avatarFor(author: string) {
  return author
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
