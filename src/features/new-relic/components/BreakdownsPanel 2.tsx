import { BreakdownDefinition } from "../../../types/evidence";

type BreakdownsPanelProps = {
  breakdowns: BreakdownDefinition[];
};

export function BreakdownsPanel({ breakdowns }: BreakdownsPanelProps) {
  return (
    <section className="chart-stack">
      {breakdowns.map((breakdown) => (
        <article key={breakdown.id} className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">Breakdown</span>
              <h2>{breakdown.title}</h2>
            </div>
            <span className="pill">{breakdown.dimension}</span>
          </div>
          <div className="breakdown-table">
            {breakdown.rows.map((row) => (
              <div key={row.label} className={`breakdown-row status-${row.status ?? "normal"}`}>
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
                <strong>{formatValue(row.value, breakdown.unit)}</strong>
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
