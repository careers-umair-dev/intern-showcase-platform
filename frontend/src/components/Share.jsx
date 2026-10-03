import { useState } from 'react'; import { QRCodeSVG } from 'qrcode.react';
export default function Share({ username, live, onClose }) {
  const url = `${location.origin}/share/${username}`, [ok, setOk] = useState(false), [copyError, setCopyError] = useState(''), enc = encodeURIComponent(url);
  return <div className="modal" onClick={onClose}><div className="card" onClick={e => e.stopPropagation()}><h3>Share your portfolio</h3>
    {!live && <p className="err">Your portfolio is private. Publish it in the editor so others can open this link.</p>}
    <input readOnly value={url} /><button onClick={() => navigator.clipboard.writeText(url).then(() => { setCopyError(''); setOk(true); setTimeout(() => setOk(false), 1500); }).catch(() => setCopyError('Could not copy automatically. Select and copy the link.'))}>{ok ? 'Copied' : 'Copy link'}</button>
    {copyError && <p className="err" role="alert">{copyError}</p>}
    <div className="row"><a className="btn" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`}>LinkedIn</a><a className="btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${enc}`}>WhatsApp</a><a className="btn" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?url=${enc}`}>X</a><a className="btn" target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}>Facebook</a></div>
    <QRCodeSVG value={url} size={140} /><button className="ghost" onClick={onClose}>Close</button></div></div>;
}
