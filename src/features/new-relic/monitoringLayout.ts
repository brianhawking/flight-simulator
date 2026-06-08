import { EvidencePackage } from "../../types/evidence";

export type DashboardTab = "api" | "feature" | "backend";

export type MonitoringTabDefinition = {
  id: DashboardTab;
  label: string;
  subtitle: string;
};

export type MonitoringViewModel = {
  charts: EvidencePackage["charts"];
  breakdowns: EvidencePackage["breakdowns"];
  logs: EvidencePackage["logs"];
  traces: EvidencePackage["traces"];
  timelineMarkers: EvidencePackage["timelineMarkers"];
  showOperationsColumn: boolean;
};

export const MONITORING_TABS: MonitoringTabDefinition[] = [
  {
    id: "api",
    label: "API Health",
    subtitle: "Success, latency, and status signals",
  },
  {
    id: "feature",
    label: "Feature Impact",
    subtitle: "Segments, products, and client comparisons",
  },
  {
    id: "backend",
    label: "Backend / OTEL",
    subtitle: "Trace evidence and service events",
  },
];

export function buildMonitoringViewModel(
  evidencePackage: EvidencePackage,
  activeTab: DashboardTab,
): MonitoringViewModel {
  const charts = evidencePackage.charts.filter((chart) => matchesTab(chart.id, chart.title, activeTab));

  if (activeTab === "api") {
    return {
      charts,
      breakdowns: [],
      logs: [],
      traces: [],
      timelineMarkers: [],
      showOperationsColumn: false,
    };
  }

  if (activeTab === "feature") {
    return {
      charts,
      breakdowns: evidencePackage.breakdowns,
      logs: [],
      traces: [],
      timelineMarkers: [],
      showOperationsColumn: false,
    };
  }

  const backendCharts = charts.length > 0 ? charts : evidencePackage.charts.filter((chart) => /latency|status/i.test(chart.title));

  return {
    charts: backendCharts,
    breakdowns: [],
    logs: evidencePackage.logs,
    traces: evidencePackage.traces,
    timelineMarkers: evidencePackage.timelineMarkers,
    showOperationsColumn: true,
  };
}

function matchesTab(chartId: string, chartTitle: string, tab: DashboardTab) {
  const source = `${chartId} ${chartTitle}`.toLowerCase();

  if (tab === "api") {
    return /(success|status|latency)/.test(source);
  }

  if (tab === "feature") {
    return /(feature|platform|version|activation|failure|impact|segment|product)/.test(source);
  }

  return /(latency|status|backend|response|service)/.test(source);
}
