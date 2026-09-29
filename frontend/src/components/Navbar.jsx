import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from './ui';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (user) api.get('/notifications').then((r) => setUnread(r.data.unread)).catch(() => {}); else setUnread(0); }, [user?.id]);
  const [dark, setDark] = useState(localStorage.getItem('theme') !== 'light');
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  const out = () => { logout(); toast('Logged out'); nav('/'); setOpen(false); };
  const close = () => setOpen(false);
  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={close}>Blog<span>Sphere</span></Link>
      <button className="burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</button>
      <nav className={open ? 'open' : ''} onClick={close}>
        <NavLink to="/">Articles</NavLink>
        {user ? (<>
          <NavLink to="/create-post">Write</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/bookmarks">Bookmarks</NavLink>
          <NavLink to="/notifications">Notifications {unread > 0 && <span className="badge">{unread}</span>}</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user.role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          <button className="link" onClick={out}>Logout ({user.username})</button>
        </>) : (<><NavLink to="/login">Login</NavLink><Link className="btn" to="/register">Sign up</Link></>)}
        <button className="link" aria-label="Toggle theme" onClick={(e) => { e.stopPropagation(); setDark(!dark); }}>{dark ? '☀️' : '🌙'}</button>
      </nav>
    </header>
  );
}
