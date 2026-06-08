export type SlackMessage = {
  id: string;
  author: string;
  kind: "bot" | "system" | "teammate";
  timestamp: string;
  lines: string[];
  ctaLabel?: string;
};

type BuildSlackMessagesInput = {
  alertTitle: string;
  severity: string;
  alertThreshold: string;
  alertTimestamp: string;
  currentTime: string;
  acknowledged: boolean;
};

export function buildSlackMessages({
  alertTitle,
  severity,
  alertThreshold,
  alertTimestamp,
  currentTime,
  acknowledged,
}: BuildSlackMessagesInput): SlackMessage[] {
  const messages: SlackMessage[] = [
    {
      id: "alert-bot-message",
      author: "New Relic Alerts",
      kind: "bot",
      timestamp: alertTimestamp,
      lines: [
        alertTitle,
        `Severity: ${severity}`,
        alertThreshold,
      ],
      ctaLabel: "Open PagerDuty Incident",
    },
  ];

  if (!acknowledged) {
    return messages;
  }

  const alertTimeMs = Date.parse(alertTimestamp);
  const currentTimeMs = Date.parse(currentTime);

  const followUps: SlackMessage[] = [
    {
      id: "acknowledged-system-message",
      author: "Incident Bot",
      kind: "system",
      timestamp: toOffsetIso(alertTimeMs, 60),
      lines: ["PagerDuty incident acknowledged."],
    },
    {
      id: "follow-up-customer-impact",
      author: "Alex",
      kind: "teammate",
      timestamp: toOffsetIso(alertTimeMs, 180),
      lines: ["Do we know customer impact yet?"],
    },
    {
      id: "follow-up-status-update",
      author: "Jordan",
      kind: "teammate",
      timestamp: toOffsetIso(alertTimeMs, 300),
      lines: ["Please post an update when you have one."],
    },
  ];

  return messages.concat(
    followUps.filter((message) => Date.parse(message.timestamp) <= currentTimeMs),
  );
}

function toOffsetIso(timestampMs: number, secondsOffset: number) {
  return new Date(timestampMs + secondsOffset * 1000).toISOString();
}
