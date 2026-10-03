import { useEffect } from 'react';
export default function Toast({ msg, clear }) {
  useEffect(() => { if (!msg) return; const t = setTimeout(clear, 3500); return () => clearTimeout(t); }, [msg]);
  return msg ? <p className="toast" role="status" onClick={clear}>{msg}</p> : null;
}
