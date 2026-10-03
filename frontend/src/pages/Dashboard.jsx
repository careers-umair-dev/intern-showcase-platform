import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom'; import { Plus, Palette, Eye, Share2 } from 'lucide-react';
import { api } from '../api.js'; import { useAuth } from '../context/AuthContext.jsx'; import Share from '../components/Share.jsx'; import Ring from '../components/Ring.jsx';
export default function Dashboard() {
  const { user } = useAuth(), [s, setS] = useState(), [err, setErr] = useState(), [share, setShare] = useState(false);
  useEffect(() => { api('/stats').then(setS).catch(e => setErr(e.message)); }, []);
  if (err) return <p className="err">{err}</p>; if (!s) return <div className="skel" />;
  const filled = ['name', 'headline', 'bio', 'avatar', 'github', 'linkedin', 'contact', 'education'].filter(k => user[k]).length + (user.skills?.length ? 1 : 0), pct = Math.round(filled / 9 * 100);
  const max = Math.max(1, ...s.days.map(d => d.v)), W = 560, H = 150, pts = s.days.map((d, i) => [i * W / 13, H - 14 - d.v / max * (H - 40)]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' '), pubPct = s.total ? Math.round(s.published / s.total * 100) : 0, topMax = Math.max(1, ...s.top.map(t => t.views));
  return <>
    <section className="heroCard"><div><h1>Hello, {user.name.split(' ')[0]}</h1><p>{pct < 100 ? `Your profile is ${pct}% complete. Fill the rest so recruiters see the full picture.` : 'Your profile is complete and ready to share.'}</p>
      <div className="row"><Link className="btn" to="/projects"><Plus size={16} /> Add project</Link><Link className="btn" to="/editor"><Palette size={16} /> Edit portfolio</Link>
        <a className="btn" target="_blank" rel="noreferrer" href={`/portfolio/${user.username}`}><Eye size={16} /> Preview</a><button onClick={() => setShare(true)}><Share2 size={16} /> Share</button></div></div><Ring value={pct} label="Profile" big /></section>
    <section className="strip">{[['Projects', s.total], ['Published', s.published], ['Drafts', s.draft], ['Featured', s.featured], ['Views, 14 days', s.views14d]].map(([l, v]) => <div key={l}><b>{v}</b><span>{l}</span></div>)}</section>
    <div className="two"><div className="card"><h3>Views, last 14 days</h3><svg className="area" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Portfolio views per day"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".35" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line} L${W} ${H} L0 ${H} Z`} fill="url(#g)" /><path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />{pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--accent)"><title>{s.days[i].d}: {s.days[i].v}</title></circle>)}</svg>
      <div className="axis"><span>{s.days[0].d}</span><span>{s.days[13].d}</span></div></div>
      <div className="card center-col"><h3>Published share</h3><Ring value={pubPct} label={`${s.published} of ${s.total}`} /></div></div>
    <div className="two even"><div className="card"><h3>Most viewed projects</h3>{s.top.length ? s.top.map(t => <div className="hbar" key={t.id}><span>{t.title}</span><i style={{ width: Math.max(4, t.views / topMax * 100) + '%' }} /><b>{t.views}</b></div>) : <p className="mute">Add a project to start tracking.</p>}</div>
      <div className="card"><h3>Recent activity</h3>{s.recent.length ? <ul className="feed">{s.recent.map((r, i) => <li key={i}>{r.type === 'portfolio' ? 'Portfolio viewed' : 'Project viewed'}<small>{new Date(r.at).toLocaleString()}</small></li>)}</ul> : <p className="mute">No visits yet. Publish your portfolio and share the link.</p>}</div></div>
    {share && <Share username={user.username} live={s.live} onClose={() => setShare(false)} />}</>;
}
