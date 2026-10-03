import { useEffect, useState } from 'react'; import { api, upload } from '../api.js'; import Toast from '../components/Toast.jsx'; import { useAuth } from '../context/AuthContext.jsx'; import Portfolio from '../components/Portfolio.jsx'; import Share from '../components/Share.jsx';
export default function Editor() {
  const { user } = useAuth(), [p, setP] = useState(), [projects, setProjects] = useState([]), [themes, setThemes] = useState([]), [msg, setMsg] = useState(''), [share, setShare] = useState(false);
  useEffect(() => {
    let active = true;
    api('/portfolio').then(result => { if (active) setP(result); }).catch(e => { if (active) setMsg(e.message); });
    api('/projects').then(result => { if (active) setProjects(result); }).catch(e => { if (active) setMsg(e.message); });
    api('/themes').then(result => { if (active) setThemes(result); }).catch(e => { if (active) setMsg(e.message); });
    return () => { active = false; };
  }, []);
  if (!p) return <div className="card">{msg ? <p className="err">{msg}</p> : <div className="skel" />}</div>;
  const sh = (k, v) => setP({ ...p, hero: { ...p.hero, [k]: v } }), th = (k, v) => setP({ ...p, theme: { ...p.theme, [k]: v } });
  const img = async (fn, e) => { const file = e.target.files[0]; if (!file) return; try { fn(await upload(file)); } catch (x) { setMsg(x.message); } };
  const save = async (pub = p.published) => { try { const np = await api('/portfolio', { method: 'PUT', body: { ...p, published: pub } }); setP(np); setMsg(pub !== p.published ? (pub ? 'Published' : 'Unpublished') : 'Saved'); } catch (x) { setMsg(x.message); } };
  const exp = p.experience || [], setExp = (i, k, v) => setP({ ...p, experience: exp.map((x, j) => j === i ? { ...x, [k]: v } : x) });
  const ORD = ['about', 'skills', 'projects', 'experience', 'achievements', 'contact'], ach = p.achievements || [], order = [...(p.order || []).filter(k => ORD.includes(k)), ...ORD.filter(k => !(p.order || []).includes(k))];
  const move = (i, d) => { const n = [...order]; if (!n[i + d]) return; [n[i], n[i + d]] = [n[i + d], n[i]]; setP({ ...p, order: n }); };
  const setAch = (i, k, v) => setP({ ...p, achievements: ach.map((x, j) => j === i ? { ...x, [k]: v } : x) });
  const sel = (k, label, opts) => <label>{label} <select value={p.theme?.[k] || opts[0]} onChange={e => th(k, e.target.value)}>{opts.map(o => <option key={o}>{o}</option>)}</select></label>;
  return <><h2>Portfolio editor</h2><Toast msg={msg} clear={() => setMsg('')} />
    <div className="edgrid"><div className="card form">
      <h3>Hero</h3><input placeholder="Hero title" value={p.hero?.title || ''} onChange={e => sh('title', e.target.value)} /><input placeholder="Hero subtitle" value={p.hero?.subtitle || ''} onChange={e => sh('subtitle', e.target.value)} />
      <label>Cover image <input type="file" accept="image/*" onChange={e => img(url => sh('cover', url), e)} /></label>
      <h3>Experience</h3>{exp.map((x, i) => <div key={i}>{['role', 'company', 'period', 'text'].map(k => <input key={k} placeholder={k} value={x[k] || ''} onChange={e => setExp(i, k, e.target.value)} />)}
        <button type="button" className="ghost" onClick={() => setP({ ...p, experience: exp.filter((_, j) => j !== i) })}>Remove</button></div>)}<button type="button" className="ghost" onClick={() => setP({ ...p, experience: [...exp, {}] })}>Add experience</button>
      <h3>Achievements & certificates</h3>{ach.map((x, i) => <div key={i}>{['title', 'issuer', 'year'].map(k => <input key={k} placeholder={k} value={x[k] || ''} onChange={e => setAch(i, k, e.target.value)} />)}
        <button type="button" className="ghost" onClick={() => setP({ ...p, achievements: ach.filter((_, j) => j !== i) })}>Remove</button></div>)}<button type="button" className="ghost" onClick={() => setP({ ...p, achievements: [...ach, {}] })}>Add achievement</button>
      <h3>Look</h3><label>Preset <select defaultValue="" onChange={e => { const t = themes.find(x => x.name === e.target.value); if (t) { const { _id, __v, name, ...rest } = t; setP({ ...p, theme: { ...p.theme, ...rest } }); } }}><option value="">Choose a preset…</option>{themes.map(t => <option key={t._id}>{t.name}</option>)}</select></label>
      <label>Template <select value={p.theme?.template} onChange={e => th('template', e.target.value)}><option value="minimal">Minimal</option><option value="bold">Bold</option><option value="split">Split</option><option value="classic">Classic</option><option value="mono">Mono</option><option value="sunset">Sunset</option></select></label>
      {sel("font", "Typography", ["sans", "serif", "mono"])}{sel("btn", "Buttons", ["rounded", "pill", "square"])}{sel("bg", "Background", ["plain", "gradient", "dots"])}{sel("layout", "Project cards", ["grid", "list"])}
      <label>Accent <input type="color" value={p.theme?.accent || '#6d5efc'} onChange={e => th('accent', e.target.value)} /></label><label>Mode <select value={p.theme?.mode} onChange={e => th('mode', e.target.value)}><option value="light">Light</option><option value="dark">Dark</option></select></label>
      <h3>Sections</h3>{order.map((k, i) => <div className="row" key={k}><label className="grow"><input type="checkbox" checked={p.sections?.[k] !== false} onChange={e => setP({ ...p, sections: { ...p.sections, [k]: e.target.checked } })} /> {k}</label><button type="button" className="ghost" aria-label={`Move ${k} up`} onClick={() => move(i, -1)}>↑</button><button type="button" className="ghost" aria-label={`Move ${k} down`} onClick={() => move(i, 1)}>↓</button></div>)}
      <div className="row"><button onClick={() => save()}>Save changes</button><button onClick={() => save(!p.published)}>{p.published ? 'Make private' : 'Publish'}</button><button className="ghost" onClick={() => setShare(true)}>Share</button></div></div>
      <div className="card live"><h3>Live preview {p.published ? '(public)' : '(private)'}</h3><Portfolio user={user} portfolio={p} projects={projects.filter(x => x.status === 'published')} base={`/portfolio/${user.username}`} /></div></div>
    {share && <Share username={user.username} live={p.published} onClose={() => setShare(false)} />}</>;
}
