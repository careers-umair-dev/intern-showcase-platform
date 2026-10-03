import { useEffect, useState, useCallback } from 'react'; import { api, upload, assetUrl } from '../api.js'; import { Star } from 'lucide-react'; import Toast from '../components/Toast.jsx'; import Confirm from '../components/Confirm.jsx';
const blank = { title: '', summary: '', description: '', tags: [], status: 'draft', featured: false, category: '', repoUrl: '', demoUrl: '', features: [], images: [] };
export default function Projects() {
  const [list, setList] = useState(null), [f, setF] = useState({ q: '', tag: '', category: '', sort: 'order' }), [all, setAll] = useState([]), [del, setDel] = useState(null), [edit, setEdit] = useState(null), [msg, setMsg] = useState('');
  const load = useCallback(() => api('/projects?' + new URLSearchParams(f)).then(d => { setList(d); if (!f.q && !f.tag && !f.category) setAll(d); }).catch(e => setMsg(e.message)), [f]);
  useEffect(() => { load(); }, [load]);
  const canReorder = f.sort === 'order' && !f.q && !f.tag && !f.category;
  const persistOrder = async items => {
    const results = await Promise.allSettled(items.map((x, k) => api('/projects/' + x._id, { method: 'PUT', body: { order: k } })));
    const failed = results.find(result => result.status === 'rejected');
    if (failed) { setMsg(failed.reason.message); load(); }
  };
  const move = (i, d) => { const n = [...list]; if (!n[i + d]) return; [n[i], n[i + d]] = [n[i + d], n[i]]; setList(n); persistOrder(n); };
  const act = async (fn, ok) => { try { await fn(); setMsg(ok); load(); } catch (e) { setMsg(e.message); } };
  const tags = [...new Set(all.flatMap(p => p.tags))], cats = [...new Set(all.map(p => p.category).filter(Boolean))];
  return <><h2>Projects</h2><Toast msg={msg} clear={() => setMsg('')} />
    <div className="row project-filters"><input placeholder="Search by title" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
      <select value={f.tag} onChange={e => setF({ ...f, tag: e.target.value })}><option value="">All technologies</option>{tags.map(t => <option key={t}>{t}</option>)}</select>
      <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}><option value="">All categories</option>{cats.map(t => <option key={t}>{t}</option>)}</select>
      <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })}><option value="order">Custom order</option><option value="newest">Newest</option><option value="title">Title A–Z</option></select>
      <button onClick={() => setEdit({ ...blank })}>New project</button></div>
    {!list ? <div className="skel" /> : !list.length ? <div className="card empty">No projects match. Add your first project, or clear the filters.</div> :
      <div className="grid">{list.map((p, i) => <div className="card pc" key={p._id} draggable={canReorder} onDragStart={e => canReorder && e.dataTransfer.setData('i', i)} onDragOver={e => canReorder && e.preventDefault()}
        onDrop={e => { if (!canReorder) return; const a = Number(e.dataTransfer.getData('i')); if (!Number.isInteger(a) || a < 0 || a >= list.length) return; const n = [...list]; n.splice(i, 0, n.splice(a, 1)[0]); setList(n); persistOrder(n); }}>
        <div className="thumbbox" style={p.thumbnail ? { backgroundImage: `url(${assetUrl(p.thumbnail)})` } : {}}>{p.featured && <span className="pill star"><Star size={12} /> Featured</span>}<span className={'pill ' + p.status}>{p.status}</span></div><h3>{p.title}</h3><p className="mute">{p.summary}</p><div className="tags">{p.tags.slice(0, 4).map(t => <span key={t}>{t}</span>)}</div>
        <div className="row project-actions">{canReorder && <><button className="ghost" aria-label="Move up" onClick={() => move(i, -1)}>↑</button><button className="ghost" aria-label="Move down" onClick={() => move(i, 1)}>↓</button></>}<button className="ghost" onClick={() => setEdit(p)}>Edit</button>
          <button className="ghost" onClick={() => act(() => api(`/projects/${p._id}/duplicate`, { method: 'POST' }), 'Duplicated')}>Duplicate</button>
          <button className="ghost" onClick={() => act(() => api('/projects/' + p._id, { method: 'PUT', body: { featured: !p.featured } }), 'Updated')}>{p.featured ? 'Unfeature' : 'Feature'}</button>
          <button className="ghost danger" onClick={() => setDel(p)}>Delete</button></div></div>)}</div>}
    {del && <Confirm text={`Delete "${del.title}"?`} onNo={() => setDel(null)} onYes={() => { const d = del; setDel(null); act(() => api('/projects/' + d._id, { method: 'DELETE' }), 'Deleted'); }} />}
    {edit && <Form p={edit} onClose={() => setEdit(null)} onSave={async d => { await (d._id ? api('/projects/' + d._id, { method: 'PUT', body: d }) : api('/projects', { method: 'POST', body: d })); setEdit(null); setMsg('Saved'); load(); }} />}</>;
}
function Form({ p, onSave, onClose }) {
  const [d, setD] = useState(p), [err, setErr] = useState(''), set = k => e => setD({ ...d, [k]: e.target.value }), csv = k => e => setD({ ...d, [k]: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
  const pick = async (e, multi) => { const files = [...e.target.files]; if (!files.length) return; try { const urls = await Promise.all(files.map(upload)); setD(multi ? { ...d, images: [...d.images, ...urls] } : { ...d, thumbnail: urls[0] }); } catch (x) { setErr(x.message); } };
  return <div className="modal drawer"><form className="card form" onSubmit={async e => { e.preventDefault(); try { await onSave(d); } catch (x) { setErr(x.message); } }}><h3>{d._id ? 'Edit' : 'New'} project</h3>
    <input placeholder="Title" value={d.title} onChange={set('title')} required /><input placeholder="Short description" value={d.summary || ''} onChange={set('summary')} />
    <textarea placeholder="Detailed description" value={d.description || ''} onChange={set('description')} /><input placeholder="Technologies (comma separated)" value={d.tags.join(', ')} onChange={csv('tags')} />
    <input placeholder="Category" value={d.category || ''} onChange={set('category')} /><input placeholder="GitHub URL" value={d.repoUrl || ''} onChange={set('repoUrl')} /><input placeholder="Live demo URL" value={d.demoUrl || ''} onChange={set('demoUrl')} />
    <input placeholder="Features (comma separated)" value={d.features.join(', ')} onChange={csv('features')} />
    {['role', 'team', 'duration', 'challenges', 'solutions'].map(k => <input key={k} placeholder={k[0].toUpperCase() + k.slice(1)} value={d[k] || ''} onChange={set(k)} />)}
    <label>Thumbnail <input type="file" accept="image/*" onChange={e => pick(e)} /></label>{d.thumbnail && <img className="wide" src={assetUrl(d.thumbnail)} alt="" />}
    <label>Screenshots <input type="file" accept="image/*" multiple onChange={e => pick(e, true)} /></label><div className="row">{d.images.map(i => <span key={i} className="thumb"><img src={assetUrl(i)} alt="" /><button type="button" className="ghost" aria-label="Remove screenshot" onClick={() => setD({ ...d, images: d.images.filter(x => x !== i) })}>×</button></span>)}</div>
    <label>Status <select value={d.status} onChange={set('status')}><option value="draft">Draft</option><option value="published">Published</option></select></label>
    <label><input type="checkbox" checked={!!d.featured} onChange={e => setD({ ...d, featured: e.target.checked })} /> Featured project</label>
    {err && <p className="err">{err}</p>}<div className="row"><button>Save project</button><button type="button" className="ghost" onClick={onClose}>Cancel</button></div></form></div>;
}
