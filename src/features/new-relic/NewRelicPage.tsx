import { useMemo, useState } from "react";
import { EvidencePackage } from "../../types/evidence";
import { ChartsPanel } from "./components/ChartsPanel";
import { BreakdownsPanel } from "./components/BreakdownsPanel";
import { LogsPanel } from "./components/LogsPanel";
import { SummaryCards } from "./components/SummaryCards";
import { TimelinePanel } from "./components/TimelinePanel";
import { TracesPanel } from "./components/TracesPanel";
import {
  buildMonitoringViewModel,
  DashboardTab,
  MONITORING_TABS,
} from "./monitoringLayout";

type NewRelicPageProps = {
  evidencePackage: EvidencePackage;
};

export function NewRelicPage({ evidencePackage }: NewRelicPageProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("api");
  const criticalCard = evidencePackage.summaryCards.find((card) => card.status === "critical");
  const dashboardTitle = deriveDashboardTitle(evidencePackage, criticalCard?.label);
  const alertTime = deriveAlertTime(evidencePackage);
  const trainingId = deriveTrainingId(evidencePackage.scenarioId);
  const viewModel = useMemo(
    () => buildMonitoringViewModel(evidencePackage, activeTab),
    [activeTab, evidencePackage],
  );

  return (
    <main className="new-relic-shell">
      <header className="nr-topbar">
        <div className="nr-topbar-title">
          <h1>{dashboardTitle}</h1>
          <div className="nr-meta-row">
            <span className="nr-meta-chip">Live window: {formatWindow(evidencePackage.window.start, evidencePackage.window.end)} {evidencePackage.window.timezone}</span>
            <span className="nr-meta-chip">Alert fired: {alertTime}</span>
            <span className="nr-meta-chip">Status: ACTIVE</span>
            <span className="nr-training-pill">{trainingId}</span>
          </div>
        </div>
        <div className="nr-badge-row">
          <span className="nr-pill critical">Alert fired</span>
          <span className="nr-pill open">Open incident</span>
          <span className="nr-pill neutral">{evidencePackage.metadata?.environment ?? "unknown"}</span>
        </div>
      </header>

      <SummaryCards cards={evidencePackage.summaryCards} />

      <section className="nr-tabs" aria-label="Monitoring views">
        {MONITORING_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "nr-tab active" : "nr-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            <strong>{tab.label}</strong>
            <span>{tab.subtitle}</span>
          </button>
        ))}
      </section>

      <section className="nr-dashboard-grid">
        <div className="nr-main-column">
          <div className="nr-section-heading">
            <div>
              <span className="panel-label">Dashboard section</span>
              <h2>{MONITORING_TABS.find((tab) => tab.id === activeTab)?.label}</h2>
            </div>
            <span className="nr-pill neutral">{evidencePackage.metadata?.serviceName ?? "service"}</span>
          </div>
          <ChartsPanel
            charts={viewModel.charts}
            serviceName={evidencePackage.metadata?.serviceName ?? "Service"}
            activeTab={activeTab}
            alertTime={alertTime}
          />
          {viewModel.breakdowns.length > 0 ? (
            <BreakdownsPanel breakdowns={viewModel.breakdowns} />
          ) : null}
        </div>

        {viewModel.showOperationsColumn ? (
          <aside className="nr-side-column">
            <TimelinePanel markers={viewModel.timelineMarkers} />
            <LogsPanel logs={viewModel.logs} />
            <TracesPanel traces={viewModel.traces} />
          </aside>
        ) : null}
      </section>
    </main>
  );
}

function deriveDashboardTitle(evidencePackage: EvidencePackage, criticalLabel?: string) {
  const service = evidencePackage.metadata?.serviceName ?? "Mobile";

  if (criticalLabel && /success rate/i.test(criticalLabel)) {
    return `PEMX Account Summary - ${service} ${criticalLabel} < 93%`;
  }

  if (criticalLabel) {
    return `PEMX Account Summary - ${service} ${criticalLabel}`;
  }

  return `PEMX Account Summary - Incident Monitor`;
}

function deriveAlertTime(evidencePackage: EvidencePackage) {
  const marker = evidencePackage.timelineMarkers[0]?.timestamp ?? evidencePackage.window.start;
  return formatTimestamp(marker);
}

function deriveTrainingId(scenarioId: string) {
  return scenarioId.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 12) || "QTRAINING001";
}

function formatWindow(start: string, end: string) {
  return `${formatTimestamp(start)} - ${formatTimestamp(end)}`;
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
