export type PagerDutyActivityItem = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  tone: "critical" | "warning" | "normal";
};

type BuildPagerDutyActivityInput = {
  alertTitle: string;
  alertTimestamp: string;
  currentTime: string;
  acknowledged: boolean;
  monitoringVisited: boolean;
};

export function buildPagerDutyActivity({
  alertTitle,
  alertTimestamp,
  currentTime,
  acknowledged,
  monitoringVisited,
}: BuildPagerDutyActivityInput): PagerDutyActivityItem[] {
  const items: PagerDutyActivityItem[] = [
    {
      id: "pd-alert-triggered",
      timestamp: alertTimestamp,
      title: "Alert triggered",
      detail: alertTitle,
      tone: "critical",
    },
  ];

  const currentTimeMs = Date.parse(currentTime);
  const alertTimeMs = Date.parse(alertTimestamp);

  if (acknowledged && currentTimeMs >= alertTimeMs + 60_000) {
    items.push({
      id: "pd-acknowledged",
      timestamp: new Date(alertTimeMs + 60_000).toISOString(),
      title: "Incident acknowledged",
      detail: "Responder has accepted the incident in PagerDuty.",
      tone: "normal",
    });
  }

  if (acknowledged && currentTimeMs >= alertTimeMs + 180_000) {
    items.push({
      id: "pd-investigation",
      timestamp: new Date(alertTimeMs + 180_000).toISOString(),
      title: "Investigation in progress",
      detail: "Responder is reviewing monitoring evidence.",
      tone: "warning",
    });
  }

  if (monitoringVisited && currentTimeMs >= alertTimeMs + 240_000) {
    items.push({
      id: "pd-monitoring-opened",
      timestamp: new Date(alertTimeMs + 240_000).toISOString(),
      title: "Monitoring opened",
      detail: "Monitoring workspace opened for live evidence review.",
      tone: "normal",
    });
  }

  return items;
}
