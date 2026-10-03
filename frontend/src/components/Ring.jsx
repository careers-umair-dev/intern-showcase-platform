export default function Ring({ value, label, big }) {
  const r = 44, c = 2 * Math.PI * r;
  return <div className={'ring' + (big ? ' big' : '')}><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r={r} className="rt" /><circle cx="50" cy="50" r={r} className="rv" strokeDasharray={`${c * value / 100} ${c}`} transform="rotate(-90 50 50)" /></svg><div><b>{value}%</b><small>{label}</small></div></div>;
}
