import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PostCard, Spinner, ErrorBox, toast, useTitle } from '../components/ui';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const own = !username || username === user?.username;
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const [form, setForm] = useState({ name: user?.name || '', username: user?.username || '', bio: user?.bio || '', avatar: user?.avatar || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  useTitle(own ? 'My profile' : username);
  const load = () => { setError(''); const req = own ? api.get(`/users/${user.username}`) : api.get(`/users/${username}`); req.then((r) => { setData(r.data); if (own) setForm({ name: user.name, username: user.username, bio: user.bio || '', avatar: user.avatar || '' }); }).catch((e) => setError(errMsg(e))); };
  useEffect(() => { if (user || !own) load(); }, [username, user?.id]);
  const save = async (e) => { e.preventDefault(); try { await api.put('/users/me/profile', form); toast('Profile updated'); window.location.href = `/profile/${form.username}`; } catch (e) { toast(errMsg(e), 'err'); } };
  const changePassword = async (e) => { e.preventDefault(); try { await api.put('/users/me/password', pw); setPw({ currentPassword: '', newPassword: '' }); toast('Password changed'); } catch (e) { toast(errMsg(e), 'err'); } };
  if (error) return <div className="page"><ErrorBox text={error} /></div>;
  if (!data) return <Spinner />;
  const { profile = data.user, posts = data.posts || [] } = own ? { profile: data.user, posts: data.posts } : data;
  return <div className="page">
    <section className="profile-head box">
      <div className="meta"><div className="avatar profile-avatar">{(profile.name || '?')[0].toUpperCase()}</div><div><h1>{profile.name}</h1><p className="muted">@{profile.username}</p></div></div>
      <p>{profile.bio || 'Writing, learning and sharing ideas on BlogSphere.'}</p>
      <div className="meta small muted">Joined {new Date(profile.createdAt).toLocaleDateString()} · {posts.length} published posts</div>
    </section>
    {own && <>
      <section className="form-card wide"><h2>Edit profile</h2><form onSubmit={save}>
        <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Username<input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Avatar URL<input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="Optional image URL" /></label>
        <label>Bio<textarea maxLength={300} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>
        <button className="btn">Save profile</button>
      </form></section>
      <section className="form-card wide"><h2>Change password</h2><form onSubmit={changePassword}>
        <label>Current password<input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></label>
        <label>New password<input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></label>
        <button className="btn">Change password</button>
      </form></section>
    </>}
    <div className="between row"><h2>{own ? 'My published articles' : 'Published articles'}</h2>{own && <Link className="btn sm" to="/create-post">Write article</Link>}</div>
    {posts.length ? <div className="grid">{posts.map((p) => <PostCard key={p._id} post={p} />)}</div> : <div className="empty">No published articles yet.</div>}
  </div>;
}
