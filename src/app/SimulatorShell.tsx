import { ReactNode } from "react";
import {
  SIMULATION_SPEED_OPTIONS,
  SimulationSpeed,
} from "../engine/simulation/SimulationSession";
import { Surface } from "../engine/navigation/navigation";
import { ScenarioOption } from "./buildScenarioOptions";
import { formatSimulationTime } from "./formatSimulationTime";

type SimulatorShellProps = {
  selectedScenarioId: string;
  scenarioOptions: ScenarioOption[];
  activeSurface: Surface;
  severity: string;
  monitoringAvailable: boolean;
  currentTime: string;
  isPlaying: boolean;
  speed: SimulationSpeed;
  onSelectScenario: (scenarioId: string) => void;
  onSelectSurface: (surface: Surface) => void;
  onPause: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSetSpeed: (speed: SimulationSpeed) => void;
  children: ReactNode;
};

export function SimulatorShell({
  selectedScenarioId,
  scenarioOptions,
  activeSurface,
  severity,
  monitoringAvailable,
  currentTime,
  isPlaying,
  speed,
  onSelectScenario,
  onSelectSurface,
  onPause,
  onPlay,
  onReset,
  onSetSpeed,
  children,
}: SimulatorShellProps) {
  const activeOption =
    scenarioOptions.find((option) => option.id === selectedScenarioId) ?? scenarioOptions[0];

  return (
    <div className="simulator-desktop">
      <header className="workspace-topbar">
        <div className="workspace-brand">
          <span className="rail-kicker">Incident Response</span>
          <strong>Training Simulator</strong>
        </div>
        <div className="workspace-launcher">
          <ToolButton
            active={activeSurface === "slack"}
            label="Slack"
            detail="Alert intake"
            onClick={() => onSelectSurface("slack")}
          />
          <ToolButton
            active={activeSurface === "pagerduty"}
            label="PagerDuty"
            detail="Incident response"
            onClick={() => onSelectSurface("pagerduty")}
          />
          <ToolButton
            active={activeSurface === "monitoring"}
            label="Monitoring"
            detail={monitoringAvailable ? "Evidence review" : "Locked until acknowledged"}
            disabled={!monitoringAvailable}
            onClick={() => onSelectSurface("monitoring")}
          />
        </div>
        <div className="workspace-status">
          <div className="workspace-status-copy">
            <span className={`status-dot status-${severity.toLowerCase()}`} />
            <strong>{severity}</strong>
          </div>
          <small>
            {monitoringAvailable
              ? "Monitoring unlocked"
              : "Acknowledge incident to unlock monitoring"}
          </small>
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
              onChange={(event) => onSelectScenario(event.target.value)}
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

        <section className="simulation-bar">
          <div className="simulation-group">
            <span className="panel-label">Simulation</span>
            <strong>{formatSimulationTime(currentTime)}</strong>
          </div>
          <div className="simulation-actions">
            <button type="button" className="primary-action" onClick={isPlaying ? onPause : onPlay}>
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

        <section className="surface-stage">{children}</section>
      </main>
    </div>
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
