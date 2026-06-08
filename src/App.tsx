import { ReactNode, useMemo, useState } from "react";
import { backendTimeoutEvidencePackage } from "./evidence/backendTimeoutEvidencePackage";
import { discoverOfferActivationEvidencePackage } from "./evidence/discoverOfferActivationEvidencePackage";
import { mobileEnumMappingEvidencePackage } from "./evidence/mobileEnumMappingEvidencePackage";
import { NewRelicPage } from "./features/new-relic/NewRelicPage";
import { generateMetricStreams } from "./generators/MetricStreamGenerator";
import { generateEvidence } from "./generators/RuleBasedEvidenceGenerator";
import { generateTimeIndexedEvents } from "./generators/TimeIndexedEventGenerator";
import { buildPagerDutyActivity } from "./pagerduty/buildPagerDutyActivity";
import { backendTimeoutScenario } from "./scenarios/backendTimeoutScenario";
import { discoverOfferActivationScenario } from "./scenarios/discoverOfferActivationScenario";
import { mobileEnumMappingScenario } from "./scenarios/mobileEnumMappingScenario";
import {
  SIMULATION_SPEED_OPTIONS,
  SimulationEvidenceSource,
  SimulationSpeed,
} from "./simulation/SimulationSession";
import { useSimulationSession } from "./simulation/useSimulationSession";
import {
  acknowledgeIncident,
  canOpenMonitoring,
  createInitialNavigationState,
  openPagerDuty,
  selectSurface,
} from "./simulator/navigation";
import { buildSlackMessages } from "./slack/buildSlackMessages";
import { EvidencePackage } from "./types/evidence";

type ScenarioOption = {
  id: string;
  label: string;
  mode: "authored" | "generated";
  evidencePackage: EvidencePackage;
  simulationSource: SimulationEvidenceSource;
};

export default function App() {
  const [selectedScenarioId, setSelectedScenarioId] = useState("generated-backend-timeout");
  const [navigation, setNavigation] = useState(createInitialNavigationState);

  const scenarioOptions = useMemo<ScenarioOption[]>(
    () => [
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
    ],
    [],
  );

  const activeOption =
    scenarioOptions.find((entry) => entry.id === selectedScenarioId) ?? scenarioOptions[0];
  const evidencePackage = activeOption.evidencePackage;
  const simulationSession = useSimulationSession(activeOption.simulationSource);
  const visibleEvidence = simulationSession.visibleEvidence;
  const alertTitle = deriveAlertTitle(evidencePackage);
  const severity = deriveSeverity(evidencePackage);
  const alertTimestampIso = deriveAlertTimestampIso(evidencePackage);
  const alertTimestamp = formatSimulationTime(alertTimestampIso);
  const alertThreshold = deriveAlertThreshold(evidencePackage);
  const monitoringAvailable = canOpenMonitoring(navigation);

  return (
    <div className="simulator-desktop">
      <header className="workspace-topbar">
        <div className="workspace-brand">
          <span className="rail-kicker">Incident Response</span>
          <strong>Training Simulator</strong>
        </div>
        <div className="workspace-launcher">
          <ToolButton
            active={navigation.surface === "slack"}
            label="Slack"
            detail="Alert intake"
            onClick={() => setNavigation((previous) => selectSurface(previous, "slack"))}
          />
          <ToolButton
            active={navigation.surface === "pagerduty"}
            label="PagerDuty"
            detail="Incident response"
            onClick={() => setNavigation((previous) => selectSurface(previous, "pagerduty"))}
          />
          <ToolButton
            active={navigation.surface === "monitoring"}
            label="Monitoring"
            detail={monitoringAvailable ? "Evidence review" : "Locked until acknowledged"}
            disabled={!monitoringAvailable}
            onClick={() => setNavigation((previous) => selectSurface(previous, "monitoring"))}
          />
        </div>
        <div className="workspace-status">
          <div className="workspace-status-copy">
            <span className={`status-dot status-${severity.toLowerCase()}`} />
            <strong>{severity}</strong>
          </div>
          <small>{monitoringAvailable ? "Monitoring unlocked" : "Acknowledge incident to unlock monitoring"}</small>
        </div>
      </header>

      <main className="simulator-main">
        <header className="workspace-subbar">
          <div className="workspace-session">
            <p className="eyebrow">Incident Session</p>
            <h1>Live Response Simulation</h1>
          </div>
          <div className="debug-panel">
            <label htmlFor="scenario-debug">Debug Scenario</label>
            <select
              id="scenario-debug"
              value={selectedScenarioId}
              onChange={(event) => {
                setSelectedScenarioId(event.target.value);
                setNavigation(createInitialNavigationState());
              }}
            >
              {scenarioOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <small>{activeOption.mode}</small>
          </div>
        </header>
        <SimulationControlBar
          currentTime={simulationSession.currentTime}
          isPlaying={simulationSession.isPlaying}
          speed={simulationSession.speed}
          onPause={simulationSession.pause}
          onPlay={simulationSession.play}
          onReset={simulationSession.reset}
          onSetSpeed={simulationSession.setSpeed}
        />

        <section className="surface-stage">
          {navigation.surface === "slack" ? (
            <ToolWindow appName="Slack" appUrl="workspace/slack" accent="slack">
              <SlackSurface
                alertTitle={alertTitle}
                severity={severity}
                alertThreshold={alertThreshold}
                alertTimestamp={alertTimestamp}
                alertTimestampIso={alertTimestampIso}
                currentTime={simulationSession.currentTime}
                acknowledged={navigation.acknowledged}
                onOpenIncident={() => setNavigation((previous) => openPagerDuty(previous))}
              />
            </ToolWindow>
          ) : null}

          {navigation.surface === "pagerduty" ? (
            <ToolWindow appName="PagerDuty" appUrl="workspace/pagerduty" accent="pagerduty">
              <PagerDutySurface
                alertTitle={alertTitle}
                severity={severity}
                alertTimestamp={alertTimestamp}
                alertTimestampIso={alertTimestampIso}
                alertThreshold={alertThreshold}
                currentTime={simulationSession.currentTime}
                acknowledged={navigation.acknowledged}
                monitoringVisited={navigation.monitoringVisited}
                evidencePackage={visibleEvidence}
                onAcknowledge={() => setNavigation((previous) => acknowledgeIncident(previous))}
                onOpenMonitoring={() =>
                  setNavigation((previous) => selectSurface(previous, "monitoring"))
                }
              />
            </ToolWindow>
          ) : null}

          {navigation.surface === "monitoring" ? (
            <ToolWindow appName="Monitoring" appUrl="workspace/monitoring" accent="monitoring">
              <div className="monitoring-shell">
                <NewRelicPage evidencePackage={visibleEvidence} />
              </div>
            </ToolWindow>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function SimulationControlBar({
  currentTime,
  isPlaying,
  speed,
  onPause,
  onPlay,
  onReset,
  onSetSpeed,
}: {
  currentTime: string;
  isPlaying: boolean;
  speed: SimulationSpeed;
  onPause: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
}) {
  return (
    <section className="simulation-bar">
      <div className="simulation-group">
        <span className="panel-label">Simulation</span>
        <strong>{formatSimulationTime(currentTime)}</strong>
      </div>
      <div className="simulation-actions">
        <button
          type="button"
          className="primary-action"
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button type="button" className="secondary-action" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className="simulation-group align-end">
        <label htmlFor="simulation-speed" className="panel-label">
          Speed
        </label>
        <select
          id="simulation-speed"
          value={speed}
          onChange={(event) => onSetSpeed(Number(event.target.value) as SimulationSpeed)}
        >
          {SIMULATION_SPEED_OPTIONS.map((speedOption) => (
            <option key={speedOption} value={speedOption}>
              {speedOption}x
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

function ToolButton({
  active,
  label,
  detail,
  disabled = false,
  onClick,
}: {
  active: boolean;
  label: string;
  detail: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "tool-button active" : "tool-button"}
      onClick={onClick}
      disabled={disabled}
    >
      <strong>{label}</strong>
      <span>{detail}</span>
    </button>
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

function SlackSurface({
  alertTitle,
  severity,
  alertThreshold,
  alertTimestamp,
  alertTimestampIso,
  currentTime,
  acknowledged,
  onOpenIncident,
}: {
  alertTitle: string;
  severity: string;
  alertThreshold: string;
  alertTimestamp: string;
  alertTimestampIso: string;
  currentTime: string;
  acknowledged: boolean;
  onOpenIncident: () => void;
}) {
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
                    {message.lines.map((line, index) => (
                      index === 0 && message.kind === "bot" ? <h2 key={line}>{line}</h2> : <p key={line}>{line}</p>
                    ))}
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

function PagerDutySurface({
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
}: {
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
}) {
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
          <span className={acknowledged ? "incident-badge pd-status-badge normal" : "incident-badge pd-status-badge warning"}>
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
        <button type="button" className="primary-action" onClick={onAcknowledge} disabled={acknowledged}>
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

function deriveAlertTitle(evidencePackage: EvidencePackage) {
  const criticalCard = evidencePackage.summaryCards.find((card) => card.status === "critical");
  const service = evidencePackage.metadata?.serviceName ?? "Mobile";

  if (criticalCard?.label.toLowerCase().includes("success")) {
    return `PEMX Account Summary - ${service} ${criticalCard.label} < 93%`;
  }

  if (criticalCard) {
    return `PEMX Account Summary - ${service} ${criticalCard.label}`;
  }

  return `PEMX Account Summary - Incident Monitor`;
}

function deriveSeverity(evidencePackage: EvidencePackage) {
  const criticalCount = evidencePackage.summaryCards.filter((card) => card.status === "critical").length;

  if (criticalCount >= 3) {
    return "SEV1";
  }

  if (criticalCount >= 2) {
    return "SEV2";
  }

  return "SEV3";
}

function deriveAlertTimestampIso(evidencePackage: EvidencePackage) {
  return evidencePackage.timelineMarkers[0]?.timestamp ?? evidencePackage.window.start;
}

function deriveAlertThreshold(evidencePackage: EvidencePackage) {
  const successCard = evidencePackage.summaryCards.find((card) =>
    /success/i.test(card.label),
  );

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

function avatarFor(author: string) {
  return author
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
