// StatsGrid.jsx - DRY: single source for the 4-stat grid used across all admin pages
import AnimatedCounter from "../Utilities/AnimatedCounter";

const FLAME = (
  <div className="card-fire">
    {[0,1,2,3,4].map(i => <div key={i} className={`cflame cf${i+1}`} />)}
  </div>
);

const BUBBLES = (
  <div className="bubbles">
    {[0,1,2,3,4,5,6].map(i => (
      <span key={i} className="bubble" style={{
        left: `${5 + i*13}%`,
        animationDelay: `${i*0.3}s`,
        animationDuration: `${2 + i*0.22}s`,
        width: `${6 + i%3*2}px`,
        height: `${6 + i%3*2}px`,
      }} />
    ))}
  </div>
);

/**
 * cards: Array of { cls, label, value, special }
 * special: "fire" | "bubbles" | "none"
 * showStats: boolean
 */
export default function StatsGrid({ cards, showStats }) {
  return (
    <div className="sgrid">
      {cards.map((c, i) => (
        <div className={`sc ${c.cls} hov-target`} key={i}>
          <div className="sc-blob" />
          <div className="sc-deco" />
          <div className="sc-label">{c.label}</div>
          <div className="sc-val">
            {showStats
                ? <AnimatedCounter value={c.value} useCommas={c.useCommas} suffix={c.suffix} />
                : "0"}
          </div>
          {c.special === "fire"    && FLAME}
          {c.special === "bubbles" && BUBBLES}
        </div>
      ))}
    </div>
  );
}