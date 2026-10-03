import { useEffect, useRef, useState } from 'react'; import { Link } from 'react-router-dom'; import { api } from '../api.js'; import { useAuth } from '../context/AuthContext.jsx';
let googleScriptPromise;
function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!googleScriptPromise) googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.getElementById('google-identity-services') || document.createElement('script');
    const created = !script.id;
    let settled = false;
    const finish = error => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
      if (error) {
        googleScriptPromise = undefined;
        reject(error);
      } else resolve();
    };
    const onLoad = () => window.google?.accounts?.id
      ? finish()
      : finish(new Error('Google sign-in script loaded but could not initialize. Please reload and try again.'));
    const onError = () => finish(new Error('Google sign-in could not load. Check your connection and try again.'));
    const timer = setTimeout(() => finish(new Error('Google sign-in is taking too long to load. Check your connection and try again.')), 8000);
    if (created) {
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
    }
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (created) document.head.appendChild(script);
  });
  return googleScriptPromise;
}
function Form({ reg }) {
  const { login } = useAuth(), [f, setF] = useState({}), [err, setErr] = useState(''), [busy, setBusy] = useState(false), [googleStatus, setGoogleStatus] = useState('loading'), [googleClientId, setGoogleClientId] = useState(''), googleButton = useRef(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const go = async e => { e.preventDefault(); setBusy(true); setErr(''); try { login(await api(reg ? '/auth/register' : '/auth/login', { method: 'POST', body: f })); } catch (x) { setErr(x.message); setBusy(false); } };
  useEffect(() => {
    let active = true;
    const setup = async () => {
      const controller = new AbortController();
      const configTimeout = setTimeout(() => controller.abort(), 8000);
      try {
        const { clientId } = await api('/auth/google/config', { signal: controller.signal });
        if (!active) return;
        if (!clientId || clientId.includes('put-your-google-oauth-client-id-here')) { setGoogleStatus('unconfigured'); return; }
        await loadGoogleScript();
        if (!active) return;
        setGoogleClientId(clientId);
        setGoogleStatus('ready');
      } catch (error) {
        if (active) {
          setErr(error.name === 'AbortError'
            ? 'Google sign-in setup timed out. Check that the backend is running, then reload this page.'
            : error.message);
          setGoogleStatus('error');
        }
      } finally {
        clearTimeout(configTimeout);
      }
    };
    setup();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (googleStatus !== 'ready' || !googleClientId || !googleButton.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async response => {
          if (!response.credential) { setErr('Google sign-in did not return a credential. Please try again.'); return; }
          setBusy(true); setErr('');
          try { login(await api('/auth/google', { method: 'POST', body: { credential: response.credential } })); }
          catch (error) { setErr(error.message); setBusy(false); }
        },
      });
      const renderButton = () => {
        if (!googleButton.current) return;
        const width = Math.max(180, Math.min(320, Math.floor(googleButton.current.clientWidth)));
        window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width });
      };
      renderButton();
      const observer = new ResizeObserver(renderButton);
      observer.observe(googleButton.current);
      return () => observer.disconnect();
    } catch {
      setGoogleStatus('error');
      setErr('Google sign-in could not be initialized. Check your OAuth client ID and try again.');
    }
  }, [googleStatus, googleClientId, login]);
  return <div className="authwrap"><div className="brandpane"><div className="brand"><span className="logo">S</span> Showcase</div>
    <div><h1>Your projects, in front of the people who hire.</h1><p>Build a portfolio in minutes, publish it at one link, and see who is looking.</p></div>
    <div className="mock"><i className="m1" /><i className="m2" /><div><b /><b /><b /></div></div></div>
    <div className="authform"><form className="auth" onSubmit={go}><h2>{reg ? 'Create your account' : 'Welcome back'}</h2>
      {reg && <><label>Full name<input autoComplete="name" onChange={set('name')} required /></label><label>Username<input autoComplete="username" minLength={3} maxLength={30} pattern="[A-Za-z0-9_-]{3,30}" title="Use 3-30 letters or numbers; underscores and hyphens are also allowed" placeholder="3-30 letters or numbers" onChange={set('username')} required /></label></>}
      <label>Email<input type="email" autoComplete="email" onChange={set('email')} required /></label><label>Password<input type="password" autoComplete={reg ? 'new-password' : 'current-password'} minLength={reg ? 8 : undefined} placeholder="8+ characters" onChange={set('password')} required /></label>
      {err && <p className="err" role="alert">{err}</p>}<button disabled={busy}>{busy ? 'Please wait…' : reg ? 'Create account' : 'Log in'}</button>
      <div className="auth-divider"><span>or continue with</span></div>
      {googleStatus === 'loading' && <p className="mute" role="status">Loading Google sign-in…</p>}
      {googleStatus === 'ready' && <div className="google-button" ref={googleButton} aria-label="Continue with Google" />}
      {googleStatus === 'unconfigured' && <p className="mute">Google sign-in is not configured yet. Add GOOGLE_CLIENT_ID to backend/.env.</p>}
      {googleStatus === 'error' && <p className="err" role="alert">Google sign-in is unavailable right now. You can still use your email and password.</p>}
      <p className="mute">{reg ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Create an account</Link></>}</p></form></div></div>;
}
export const Login = () => <Form />; export const Register = () => <Form reg />;
