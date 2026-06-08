import { BreakdownDefinition } from "../../../types/evidence";

type BreakdownsPanelProps = {
  breakdowns: BreakdownDefinition[];
};

export function BreakdownsPanel({ breakdowns }: BreakdownsPanelProps) {
  return (
    <section className="nr-panel-stack">
      {breakdowns.map((breakdown) => (
        <article key={breakdown.id} className="nr-panel">
          <div className="nr-panel-header">
            <div>
              <span className="panel-label">Segment comparison</span>
              <h2>{breakdown.title}</h2>
            </div>
            <span className="nr-pill neutral">{breakdown.dimension}</span>
          </div>
          <div className="nr-breakdown-table">
            <div className="nr-breakdown-head">
              <span>Segment</span>
              <span>Current</span>
            </div>
            {breakdown.rows.map((row) => (
              <div key={row.label} className="nr-breakdown-row">
                <div>
                  <strong>{row.label}</strong>
                  {row.metadata ? (
                    <div className="breakdown-meta">
                      {Object.entries(row.metadata)
                        .map(([key, value]) => `${key}: ${String(value)}`)
                        .join(" | ")}
                    </div>
                  ) : null}
                </div>
                <span className={`nr-breakdown-value status-${row.status ?? "normal"}`}>
                  {formatValue(row.value, breakdown.unit)}
                </span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

function formatValue(value: string | number, unit?: BreakdownDefinition["unit"]) {
  if (typeof value === "string") {
    return value;
  }

  if (unit === "percent") {
    return `${value.toFixed(1)}%`;
  }

  if (unit === "ms") {
    return `${value}ms`;
  }

  return value.toString();
}
