import { assetUrl } from '../api.js';
import { Link } from 'react-router-dom';
const FONTS = { sans: 'inherit', serif: 'Georgia, serif', mono: 'ui-monospace, monospace' };
const ORD = ['about', 'skills', 'projects', 'experience', 'achievements', 'contact'];
export default function Portfolio({ user, portfolio: p, projects, base }) {
  const t = p.theme || {}, s = p.sections || {}, feat = projects.filter(x => x.featured), list = feat.length ? feat : projects, order = [...(p.order || []).filter(k => ORD.includes(k)), ...ORD.filter(k => !(p.order || []).includes(k))];
  const parts = {
    about: user.bio && <section id="about"><h2>About</h2><p>{user.bio}</p>{user.internship && <p><b>Internship:</b> {user.internship}</p>}{user.education && <><h3>Education</h3><ul>{user.education.split('\n').filter(Boolean).map((l, i) => <li key={i}>{l}</li>)}</ul></>}</section>,
    skills: !!user.skills?.length && <section id="skills"><h2>Skills</h2><div className="tags big">{user.skills.map(k => <span key={k}>{k}</span>)}</div></section>,
    projects: <section id="projects"><h2>{feat.length ? 'Featured projects' : 'Projects'}</h2>{list.length ? <div className="grid">{list.map(x => <Link key={x._id} to={`${base}/${x._id}`} className="pcard">
      {x.thumbnail ? <img src={assetUrl(x.thumbnail)} alt="" /> : <div className="pimg" />}<div className="pb"><h3>{x.title}</h3><p>{x.summary}</p><div className="tags">{x.tags?.map(g => <span key={g}>{g}</span>)}</div></div></Link>)}</div> : <p>No projects yet.</p>}</section>,
    experience: !!p.experience?.length && <section id="experience"><h2>Experience</h2><ol className="tl">{p.experience.map((e, i) => <li key={i}><b>{e.role}</b><span>{e.company} · {e.period}</span><p>{e.text}</p></li>)}</ol></section>,
    achievements: !!p.achievements?.length && <section id="achievements"><h2>Achievements</h2><ul className="ach">{p.achievements.map((a, i) => <li key={i}><b>{a.title}</b><span>{a.issuer} {a.year}</span></li>)}</ul></section>,
    contact: <section id="contact"><h2>Get in touch</h2><p>{user.contact}</p><div className="cta">{user.github && <a className="btn" href={user.github}>GitHub</a>}{user.linkedin && <a className="btn" href={user.linkedin}>LinkedIn</a>}</div></section>,
  };
  const shown = order.filter(k => s[k] !== false && parts[k]);
  return <div className={`pf ${t.template || 'minimal'}`} data-dark={t.mode === 'dark' ? '1' : '0'} data-btn={t.btn} data-bg={t.bg} data-layout={t.layout} style={{ '--accent': t.accent || '#6d5efc', fontFamily: FONTS[t.font] }}>
    <nav className="pnav"><b>{user.name}</b>{shown.map(k => <a key={k} href={`#${k}`}>{k}</a>)}</nav>
    <header className="hero" style={p.hero?.cover ? { backgroundImage: `linear-gradient(#0009,#0009),url(${assetUrl(p.hero.cover)})`, color: '#fff' } : {}}><div className="hero-in">
      {user.avatar && <img className="av" src={assetUrl(user.avatar)} alt={user.name} />}<div><h1>{p.hero?.title || user.name}</h1><p>{p.hero?.subtitle || user.headline}</p>
        <div className="cta">{s.projects !== false && <a className="btn" href="#projects">View projects</a>}{s.contact !== false && <a className="btn alt" href="#contact">Contact me</a>}</div></div></div></header>
    {shown.map(k => <div key={k}>{parts[k]}</div>)}
  </div>;
}
