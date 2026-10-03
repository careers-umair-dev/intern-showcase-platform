import { useEffect, useState } from 'react'; import { LayoutDashboard, FolderKanban, Palette, User, Sun, Moon, LogOut } from 'lucide-react'; import { Ctx, useAuth } from './context/AuthContext.jsx';
import { Routes, Route, Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { Login, Register } from './pages/Auth.jsx'; import Dashboard from './pages/Dashboard.jsx'; import Projects from './pages/Projects.jsx'; import Editor from './pages/Editor.jsx'; import Profile from './pages/Profile.jsx'; import Public from './pages/Public.jsx';
export default function App() {
  const [user, setUser] = useState(null), [ready, setReady] = useState(false);
  useEffect(() => { localStorage.getItem('t') ? api('/auth/me').then(setUser).catch(() => localStorage.removeItem('t')).finally(() => setReady(true)) : setReady(true); }, []);
  const login = ({ token, user }) => { localStorage.setItem('t', token); setUser(user); };
  const logout = () => { localStorage.removeItem('t'); setUser(null); };
  if (!ready) return <div className="center">Loading…</div>;
  return <Ctx.Provider value={{ user, setUser, login, logout }}><Routes>
    <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} /><Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
    <Route path="/portfolio/:username" element={<Public />} /><Route path="/portfolio/:username/:pid" element={<Public />} />
    <Route element={user ? <Shell /> : <Navigate to="/login" />}><Route path="/" element={<Dashboard />} /><Route path="/projects" element={<Projects />} /><Route path="/editor" element={<Editor />} /><Route path="/profile" element={<Profile />} /></Route>
    <Route path="*" element={<div className="center">Page not found</div>} /></Routes></Ctx.Provider>;
}
function Shell() {
  const { user, logout } = useAuth(), nav = useNavigate(), [dark, setDark] = useState(localStorage.d === '1');
  useEffect(() => { document.documentElement.dataset.dark = dark ? '1' : '0'; localStorage.d = dark ? '1' : '0'; }, [dark]);
  return <div className="shell"><aside><div className="brand"><span className="logo">S</span> Showcase</div>
    <nav>{[['/', 'Dashboard', LayoutDashboard], ['/projects', 'Projects', FolderKanban], ['/editor', 'Portfolio editor', Palette], ['/profile', 'Profile', User]].map(([to, l, I]) => <NavLink key={to} to={to} end><I size={17} /> {l}</NavLink>)}</nav><div className="grow" />
    <div className="me">{user.avatar ? <img src={user.avatar} alt="" /> : <span className="ini">{user.name[0]}</span>}<div><b>{user.name}</b><small>@{user.username}</small></div></div>
    <button className="ghost" onClick={() => setDark(!dark)}>{dark ? <Sun size={15} /> : <Moon size={15} />} {dark ? 'Light mode' : 'Dark mode'}</button>
    <button className="ghost" onClick={() => { logout(); nav('/login'); }}><LogOut size={15} /> Log out</button></aside><main><Outlet /></main></div>;
}
