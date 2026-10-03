import { useEffect, useState } from 'react'; import { useParams, Link } from 'react-router-dom'; import { api, assetUrl } from '../api.js'; import Portfolio from '../components/Portfolio.jsx';
const meta = (k, v, attr = 'property') => { let m = document.head.querySelector(`meta[${attr}="${k}"]`); if (!m) { m = document.createElement('meta'); m.setAttribute(attr, k); document.head.appendChild(m); } m.content = v || ''; };
export default function Public() {
  const { username, pid } = useParams(), [d, setD] = useState(), [err, setErr] = useState(), base = `/portfolio/${username}`;
  useEffect(() => {
    let active = true;
    setD(null); setErr(null);
    api(`/public/${username}${pid ? '/projects/' + pid : ''}`)
      .then(result => { if (active) setD(result); })
      .catch(() => { if (active) setErr('This portfolio is private or does not exist.'); });
    return () => { active = false; };
  }, [username, pid]);
  useEffect(() => { if (!d) return; const t = d.project ? `${d.project.title} – ${d.user.name}` : `${d.user.name} | ${d.user.headline || 'Portfolio'}`, desc = d.project?.summary || d.user.bio || d.user.headline;
    document.title = t; meta('description', desc, 'name'); meta('og:title', t); meta('og:description', desc); meta('og:image', assetUrl(d.project?.thumbnail || d.user.avatar)); meta('twitter:card', 'summary_large_image', 'name'); }, [d]);
  useEffect(() => { if (!d) return; const u = d.user, el = document.createElement('script'); el.type = 'application/ld+json';
    el.text = JSON.stringify(d.project ? { '@context': 'https://schema.org', '@type': 'CreativeWork', name: d.project.title, description: d.project.summary, image: d.project.thumbnail, keywords: (d.project.tags || []).join(', '), author: { '@type': 'Person', name: u.name } }
      : { '@context': 'https://schema.org', '@type': 'Person', name: u.name, jobTitle: u.headline, image: assetUrl(u.avatar), description: u.bio, sameAs: [u.github, u.linkedin].filter(Boolean) });
    document.head.appendChild(el); return () => el.remove(); }, [d]);
  if (err) return <div className="center">{err}</div>; if (!d) return <div className="skel" />;
  if (!d.project) return <Portfolio {...d} projects={d.projects} base={base} />;
  const p = d.project, t = d.portfolio.theme || {};
  return <div className="pf minimal" data-dark={t.mode === 'dark' ? '1' : '0'} style={{ '--accent': t.accent }}><article><Link to={base}>← {d.user.name}</Link><h1>{p.title}</h1><p>{p.summary}</p>
    {p.thumbnail && <img className="wide" src={assetUrl(p.thumbnail)} alt="" />}{p.images?.map(i => <img className="wide" key={i} src={assetUrl(i)} alt="" />)}
    <div className="tags">{p.tags?.map(g => <span key={g}>{g}</span>)}</div><p>{p.description}</p>
    {[['Role', p.role], ['Team', p.team], ['Duration', p.duration], ['Challenges', p.challenges], ['Solutions', p.solutions]].filter(x => x[1]).map(([k, v]) => <p key={k}><b>{k}:</b> {v}</p>)}
    {!!p.features?.length && <ul>{p.features.map(f => <li key={f}>{f}</li>)}</ul>}{p.repoUrl && <a className="btn" href={p.repoUrl}>Source code</a>} {p.demoUrl && <a className="btn" href={p.demoUrl}>Live demo</a>}</article></div>;
}
