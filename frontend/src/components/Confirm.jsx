export default function Confirm({ text, onYes, onNo, yes = 'Delete' }) {
  return <div className="modal" role="dialog" aria-modal="true"><div className="card"><h3>{text}</h3><div className="row"><button className="danger-solid" onClick={onYes}>{yes}</button><button className="ghost" onClick={onNo}>Cancel</button></div></div></div>;
}
