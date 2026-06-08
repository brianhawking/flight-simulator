import { ChartDefinition } from "../../../domain/types/evidence";

type ChartsPanelProps = {
  charts: ChartDefinition[];
  serviceName: string;
  activeTab: "api" | "feature" | "backend";
  alertTime: string;
};

const CHART_WIDTH = 760;
const CHART_HEIGHT = 260;
const PADDING = 40;

export function ChartsPanel({ charts, serviceName, activeTab, alertTime }: ChartsPanelProps) {
  return (
    <section className={activeTab === "feature" ? "nr-chart-grid feature" : "nr-chart-grid"}>
      {charts.map((chart) => (
        <article key={chart.id} className={`nr-panel ${panelClassName(chart, activeTab)}`}>
          <div className="nr-panel-header">
            <div>
              <span className="panel-label">{panelLabelFor(chart)}</span>
              <h2>{chart.title}</h2>
              <p className="nr-panel-subtitle">{buildSubtitle(chart, serviceName)}</p>
            </div>
            <div className="nr-panel-stat">
              <span>{buildStatLabel(chart)}</span>
              <strong>{buildStatValue(chart)}</strong>
            </div>
          </div>
          {chart.kind === "stacked-bar" ? (
            <StackedBarChart chart={chart} alertTime={alertTime} />
          ) : (
            <LineChart chart={chart} alertTime={alertTime} />
          )}
        </article>
      ))}
    </section>
  );
}

function LineChart({ chart, alertTime }: { chart: ChartDefinition; alertTime: string }) {
  const allPoints = chart.series.flatMap((series) => series.points);
  if (allPoints.length === 0) {
    return <ChartEmptyState message="Waiting for the first chart points in this incident window." />;
  }

  const values = allPoints.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const threshold = inferThreshold(chart);
  const thresholdFloor = threshold ?? min;
  const thresholdCeiling = threshold ?? max;
  const domainMin = chart.unit === "percent" ? Math.max(0, Math.min(min, thresholdFloor) - 6) : Math.max(0, min * 0.85);
  const domainMax = chart.unit === "percent" ? Math.min(100, Math.max(max, thresholdCeiling) + 6) : max * 1.15;
  const firstAlertIndex = inferAlertIndex(chart);
  const xStep = chart.series[0]?.points.length && chart.series[0].points.length > 1
    ? (CHART_WIDTH - PADDING * 2) / (chart.series[0].points.length - 1)
    : 0;
  const fillSeries = shouldFillSeries(chart);

  return (
    <div className="nr-chart-shell">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="nr-line-chart" role="img" aria-label={chart.title}>
        <rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} rx="14" className="nr-chart-bg" />
        {buildGridLines(domainMin, domainMax).map((value) => {
          const y = getY(value, domainMin, domainMax);
          return (
            <g key={value}>
              <line x1={PADDING} y1={y} x2={CHART_WIDTH - PADDING} y2={y} className="nr-grid-line" />
              <text x="8" y={y + 4} className="nr-axis-label">
                {formatValue(value, chart.unit)}
              </text>
            </g>
          );
        })}
        {threshold !== null ? (
          <>
            <line
              x1={PADDING}
              y1={getY(threshold, domainMin, domainMax)}
              x2={CHART_WIDTH - PADDING}
              y2={getY(threshold, domainMin, domainMax)}
              className="nr-threshold-line"
            />
            <text x={CHART_WIDTH - 160} y={getY(threshold, domainMin, domainMax) - 8} className="nr-threshold-label">
              Threshold ({formatValue(threshold, chart.unit)})
            </text>
          </>
        ) : null}
        {firstAlertIndex >= 0 ? (
          <>
            <line
              x1={PADDING + xStep * firstAlertIndex}
              y1={PADDING / 2}
              x2={PADDING + xStep * firstAlertIndex}
              y2={CHART_HEIGHT - PADDING}
              className="nr-alert-marker"
            />
            <text x={PADDING + xStep * firstAlertIndex + 6} y={24} className="nr-alert-label">
              ALERT FIRED
            </text>
          </>
        ) : null}
        {chart.series.map((series) => {
          const linePath = series.points
            .map((point, index) => {
              const x = PADDING + index * xStep;
              const y = getY(point.value, domainMin, domainMax);
              return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
          const areaPath =
            fillSeries && series.points.length > 0
              ? `${linePath} L ${PADDING + (series.points.length - 1) * xStep} ${CHART_HEIGHT - PADDING} L ${PADDING} ${CHART_HEIGHT - PADDING} Z`
              : "";

          return (
            <g key={series.id}>
              {fillSeries ? (
                <path d={areaPath} fill={withOpacity(series.color ?? "#2ec4ff", 0.18)} stroke="none" />
              ) : null}
              <path d={linePath} fill="none" stroke={series.color ?? "#2ec4ff"} strokeWidth="3" strokeLinejoin="round" />
              {series.points.map((point, index) => (
                <circle
                  key={point.timestamp}
                  cx={PADDING + index * xStep}
                  cy={getY(point.value, domainMin, domainMax)}
                  r="3.5"
                  fill={series.color ?? "#2ec4ff"}
                />
              ))}
            </g>
          );
        })}
        {chart.series[0]?.points.map((point, index) => (
          <text key={point.timestamp} x={PADDING + index * xStep} y={CHART_HEIGHT - 10} textAnchor="middle" className="nr-axis-label">
            {formatTick(point.timestamp)}
          </text>
        ))}
      </svg>
      <div className="nr-chart-footer">
        <span>Time series</span>
        <span>{alertTime} UTC alert window</span>
      </div>
      <div className="nr-chart-legend">
        {chart.series.map((series) => (
          <div key={series.id} className="nr-legend-item">
            <span className="legend-dot" style={{ backgroundColor: series.color ?? "#2ec4ff" }} />
            <strong>{series.label}</strong>
          </div>
        ))}
        {threshold !== null ? (
          <div className="nr-legend-item">
            <span className="legend-line threshold" />
            <strong>Threshold ({formatValue(threshold, chart.unit)})</strong>
          </div>
        ) : null}
        {firstAlertIndex >= 0 ? (
          <div className="nr-legend-item">
            <span className="legend-line alert" />
            <strong>Alert Fired</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function StackedBarChart({ chart, alertTime }: { chart: ChartDefinition; alertTime: string }) {
  const timestamps = chart.series[0]?.points.map((point) => point.timestamp) ?? [];
  if (timestamps.length === 0) {
    return <ChartEmptyState message="No total counts have been revealed yet." />;
  }

  const stackedValues = timestamps.map((_, pointIndex) =>
    chart.series.reduce((sum, series) => sum + (series.points[pointIndex]?.value ?? 0), 0),
  );
  const maxTotal = Math.max(...stackedValues, 1);
  const firstAlertIndex = inferAlertIndex(chart);
  const availableWidth = CHART_WIDTH - PADDING * 2;
  const columnWidth = availableWidth / Math.max(timestamps.length, 1);
  const barWidth = Math.max(18, columnWidth * 0.62);

  return (
    <div className="nr-chart-shell">
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="nr-line-chart" role="img" aria-label={chart.title}>
        <rect x="0" y="0" width={CHART_WIDTH} height={CHART_HEIGHT} rx="14" className="nr-chart-bg" />
        {buildCountGridLines(maxTotal).map((value) => {
          const y = getY(value, 0, maxTotal);
          return (
            <g key={value}>
              <line x1={PADDING} y1={y} x2={CHART_WIDTH - PADDING} y2={y} className="nr-grid-line" />
              <text x="8" y={y + 4} className="nr-axis-label">
                {formatValue(value, chart.unit)}
              </text>
            </g>
          );
        })}
        {firstAlertIndex >= 0 ? (
          <>
            <line
              x1={PADDING + columnWidth * firstAlertIndex + columnWidth / 2}
              y1={PADDING / 2}
              x2={PADDING + columnWidth * firstAlertIndex + columnWidth / 2}
              y2={CHART_HEIGHT - PADDING}
              className="nr-alert-marker"
            />
            <text
              x={PADDING + columnWidth * firstAlertIndex + columnWidth / 2 + 6}
              y={24}
              className="nr-alert-label"
            >
              ALERT FIRED
            </text>
          </>
        ) : null}
        {timestamps.map((timestamp, pointIndex) => {
          const x = PADDING + columnWidth * pointIndex + (columnWidth - barWidth) / 2;
          let runningHeight = 0;

          return (
            <g key={timestamp}>
              {chart.series.map((series) => {
                const value = series.points[pointIndex]?.value ?? 0;
                const segmentHeight = ((CHART_HEIGHT - PADDING * 2) * value) / maxTotal;
                const y = CHART_HEIGHT - PADDING - runningHeight - segmentHeight;
                runningHeight += segmentHeight;

                return (
                  <rect
                    key={series.id}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={Math.max(segmentHeight, 0)}
                    rx="6"
                    fill={series.color ?? "#2ec4ff"}
                  />
                );
              })}
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 10}
                textAnchor="middle"
                className="nr-axis-label"
              >
                {formatTick(timestamp)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="nr-chart-footer">
        <span>Total counts</span>
        <span>{alertTime} UTC alert window</span>
      </div>
      <div className="nr-chart-legend">
        {chart.series.map((series) => (
          <div key={series.id} className="nr-legend-item">
            <span className="legend-dot" style={{ backgroundColor: series.color ?? "#2ec4ff" }} />
            <strong>{series.label}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function inferThreshold(chart: ChartDefinition) {
  if (chart.unit !== "percent") {
    return null;
  }

  if (/success/i.test(chart.title)) {
    return 93;
  }

  return null;
}

function inferAlertIndex(chart: ChartDefinition) {
  const primarySeries = chart.series[0];
  if (!primarySeries) {
    return -1;
  }

  const threshold = inferThreshold(chart);
  if (threshold !== null) {
    return primarySeries.points.findIndex((point) => point.value < threshold);
  }

  if (chart.kind === "stacked-bar") {
    return 2;
  }

  return primarySeries.points.length > 2 ? 2 : -1;
}

function getY(value: number, min: number, max: number) {
  const ratio = (value - min) / Math.max(max - min, 1);
  return CHART_HEIGHT - PADDING - ratio * (CHART_HEIGHT - PADDING * 2);
}

function buildGridLines(min: number, max: number) {
  const step = (max - min) / 4;
  return Array.from({ length: 5 }, (_, index) => round(min + step * index));
}

function buildCountGridLines(max: number) {
  const step = max / 4;
  return Array.from({ length: 5 }, (_, index) => round(step * index));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function formatTick(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function formatValue(value: number, unit: ChartDefinition["unit"]) {
  if (unit === "percent") {
    return `${value.toFixed(0)}%`;
  }

  if (unit === "ms") {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }

    return `${Math.round(value)}ms`;
  }

  return Math.round(value).toString();
}

function buildStatValue(chart: ChartDefinition) {
  if (chart.kind === "stacked-bar") {
    const lastTotal = chart.series.reduce(
      (sum, series) => sum + (series.points[series.points.length - 1]?.value ?? 0),
      0,
    );
    return lastTotal.toString();
  }

  const primary = chart.series[0];
  const lastValue = primary?.points[primary.points.length - 1]?.value ?? 0;
  return formatValue(lastValue, chart.unit);
}

function buildStatLabel(chart: ChartDefinition) {
  if (/success/i.test(chart.title)) {
    return "Latest visible point";
  }

  if (/latency|response/i.test(chart.title)) {
    return "Latest visible point";
  }

  if (chart.kind === "stacked-bar") {
    return "Total";
  }

  return "Current";
}

function buildSubtitle(chart: ChartDefinition, serviceName: string) {
  if (/success/i.test(chart.title)) {
    return `Observed ${serviceName} behavior over time (${chart.unit})`;
  }

  if (/latency|response/i.test(chart.title)) {
    return `Observed latency trend for ${serviceName} (${chart.unit})`;
  }

  if (/status/i.test(chart.title)) {
    return `Observed response totals for ${serviceName}`;
  }

  return `${serviceName} - incident window`;
}

function panelLabelFor(chart: ChartDefinition) {
  if (/latency|response/i.test(chart.title)) {
    return "Response time";
  }

  if (/status/i.test(chart.title)) {
    return "Request outcomes";
  }

  if (/platform|version|segment|product/i.test(chart.title)) {
    return "Segment comparison";
  }

  return "Time series";
}

function shouldFillSeries(chart: ChartDefinition) {
  return chart.unit !== "percent" || /error|failure|impact|session|latency/i.test(chart.title);
}

function withOpacity(hexColor: string, opacity: number) {
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6) {
    return hexColor;
  }

  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="nr-chart-empty">
      <span className="panel-label">Simulation</span>
      <p>{message}</p>
    </div>
  );
}

function panelClassName(chart: ChartDefinition, activeTab: ChartsPanelProps["activeTab"]) {
  if (activeTab === "api" && /success/i.test(chart.title)) {
    return "nr-panel-span-wide";
  }

  if (activeTab === "backend" && /latency/i.test(chart.title)) {
    return "nr-panel-span-wide";
  }

  return "";
}
