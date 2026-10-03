import { useState } from 'react';
import { api, upload, assetUrl } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Toast from '../components/Toast.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(user);
  const [password, setPassword] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = key => event => setProfile({ ...profile, [key]: event.target.value });

  const saveProfile = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const saved = await api('/auth/me', { method: 'PUT', body: profile });
      setProfile(saved);
      setUser(saved);
      setMsg('Profile saved');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };

  const pickAvatar = async event => {
    const file = event.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const avatar = await upload(file);
      setProfile(current => ({ ...current, avatar }));
      setMsg('Photo uploaded. Save your profile to publish the change.');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  const changePassword = async event => {
    event.preventDefault();
    if (password.next !== password.confirm) {
      setMsg('New passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/password', { method: 'PUT', body: { current: password.current, next: password.next } });
      setPassword({ current: '', next: '', confirm: '' });
      setMsg('Password changed');
    } catch (error) {
      setMsg(error.message);
    } finally {
      setBusy(false);
    }
  };

  return <>
    <h2>Profile</h2>
    <p className="mute">Manage your account details and the personal information shown on your portfolio.</p>
    <Toast msg={msg} clear={() => setMsg('')} />
    <div className="profile-grid">
      <form className="card form" onSubmit={saveProfile}>
        <h3>Public profile</h3>
        <div className="profile-photo">
          {profile.avatar ? <img src={assetUrl(profile.avatar)} alt="Profile" /> : <span className="ini">{profile.name?.[0]?.toUpperCase() || '?'}</span>}
          <label>Profile photo<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickAvatar} /></label>
        </div>
        <label>Full name<input autoComplete="name" maxLength={80} value={profile.name || ''} onChange={set('name')} required /></label>
        <label>Professional headline<input maxLength={140} placeholder="e.g. Frontend developer and CS student" value={profile.headline || ''} onChange={set('headline')} /></label>
        <label>About you<textarea maxLength={2000} placeholder="Introduce yourself and the work you enjoy." value={profile.bio || ''} onChange={set('bio')} /></label>
        <label>Skills <small className="mute">Separate skills with commas</small><input placeholder="React, Node.js, UI design" value={(profile.skills || []).join(', ')} onChange={event => setProfile({ ...profile, skills: event.target.value.split(',').map(skill => skill.trim()).filter(Boolean) })} /></label>
        <label>Education <small className="mute">One entry per line</small><textarea maxLength={1000} value={profile.education || ''} onChange={set('education')} /></label>
        <label>Internship<input maxLength={300} placeholder="Role or organization" value={profile.internship || ''} onChange={set('internship')} /></label>
        <label>Contact email or phone<input maxLength={200} autoComplete="tel" value={profile.contact || ''} onChange={set('contact')} /></label>
        <label>GitHub URL<input type="url" placeholder="https://github.com/your-name" value={profile.github || ''} onChange={set('github')} /></label>
        <label>LinkedIn URL<input type="url" placeholder="https://www.linkedin.com/in/your-name" value={profile.linkedin || ''} onChange={set('linkedin')} /></label>
        <button disabled={busy}>{busy ? 'Please wait…' : 'Save profile'}</button>
      </form>
      <div className="profile-side">
        <section className="card form">
          <h3>Account details</h3>
          <label>Email<input value={user.email || ''} readOnly /></label>
          <label>Username<input value={user.username || ''} readOnly /></label>
          <p className="mute">Email and username cannot be changed here.</p>
        </section>
        <form className="card form" onSubmit={changePassword}>
          <h3>{user.hasPassword ? 'Change password' : 'Set a password'}</h3>
          {user.hasPassword && <label>Current password<input type="password" autoComplete="current-password" value={password.current} onChange={event => setPassword({ ...password, current: event.target.value })} required /></label>}
          <label>New password<input type="password" autoComplete="new-password" minLength={8} value={password.next} onChange={event => setPassword({ ...password, next: event.target.value })} required /></label>
          <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={password.confirm} onChange={event => setPassword({ ...password, confirm: event.target.value })} required /></label>
          <button className="ghost" disabled={busy}>{user.hasPassword ? 'Update password' : 'Set password'}</button>
        </form>
      </div>
    </div>
  </>;
}
