import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { errMsg } from '../services/api';
import { toast, useTitle } from '../components/ui';

export function Login() {
  useTitle('Login');
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ identifier: '', password: '' }); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await login(f.identifier, f.password); toast('Welcome back!'); nav('/dashboard'); }
    catch (err) { toast(errMsg(err), 'err'); } finally { setBusy(false); }
  };
  return (
    <form className="form-card" onSubmit={submit}>
      <h1>Login</h1>
      <label>Email or username<input required value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} /></label>
      <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
      <p>New here? <Link to="/register">Create an account</Link></p>
    </form>
  );
}

export function Register() {
  useTitle('Register');
  const { register } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', username: '', email: '', password: '', confirm: '' }); const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return toast('Passwords do not match', 'err');
    setBusy(true);
    try { await register({ name: f.name, username: f.username, email: f.email, password: f.password }); toast('Account created!'); nav('/dashboard'); }
    catch (err) { toast(errMsg(err), 'err'); } finally { setBusy(false); }
  };
  return (
    <form className="form-card" onSubmit={submit}>
      <h1>Create account</h1>
      <label>Name<input required value={f.name} onChange={set('name')} /></label>
      <label>Username<input required value={f.username} onChange={set('username')} /></label>
      <label>Email<input type="email" required value={f.email} onChange={set('email')} /></label>
      <label>Password<input type="password" required minLength={8} value={f.password} onChange={set('password')} /></label>
      <small>8+ characters, with at least one letter and one number.</small>
      <label>Confirm password<input type="password" required value={f.confirm} onChange={set('confirm')} /></label>
      <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      <p>Have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}
