import { SummaryCard } from "../../../types/evidence";

type SummaryCardsProps = {
  cards: SummaryCard[];
};

export function SummaryCards({ cards }: SummaryCardsProps) {
  return (
    <section className="nr-kpi-grid">
      {cards.map((card) => (
        <article key={card.id} className={`nr-kpi-card status-${card.status ?? "normal"}`}>
          <div className="nr-kpi-head">
            <span className="panel-label">{card.label}</span>
            <span className={`nr-mini-dot status-${card.status ?? "normal"}`} />
          </div>
          <strong>{card.value}</strong>
          <div className="nr-kpi-footer">
            <small>{card.delta ? `${card.delta} vs baseline` : "Observed during incident window"}</small>
            <span className="nr-kpi-caption">{card.status === "critical" ? "Alerting" : "Observed"}</span>
          </div>
        </article>
      ))}
    </section>
  );
}
