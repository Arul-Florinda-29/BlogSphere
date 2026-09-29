import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { Spinner, ErrorBox, toast, confirmDelete, fmt, useTitle } from '../components/ui';

export default function Admin() {
  useTitle('Admin');
  const [tab, setTab] = useState('dashboard'); const [data, setData] = useState(null); const [error, setError] = useState(''); const [name, setName] = useState('');
  const load = () => {
    setData(null); setError('');
    const url = { dashboard: '/admin/dashboard', users: '/admin/users', posts: '/admin/posts', comments: '/admin/comments', categories: '/categories', reports: '/admin/reports' }[tab];
    api.get(url).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  };
  useEffect(load, [tab]);
  const act = async (fn, ok) => { try { await fn(); toast(ok); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      <div className="chips">{['dashboard', 'users', 'posts', 'comments', 'categories', 'reports'].map((t) => <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t}</button>)}</div>
      {error ? <ErrorBox text={error} /> : !data ? <Spinner /> : (
        <div className="table-wrap">
          {tab === 'dashboard' && <div className="stats">{Object.entries(data).map(([k, v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}</div>}
          {tab === 'users' && <table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead><tbody>{data.map((u) => (
            <tr key={u._id}><td>{u.name} (@{u.username})</td><td>{u.email}</td><td>{u.role}</td><td>{fmt(u.createdAt)}</td><td>{u.suspended ? 'Suspended' : 'Active'}</td>
              <td>{u.role !== 'ADMIN' && <button className="link" onClick={() => act(() => api.put(`/admin/users/${u._id}/suspend`), u.suspended ? 'User activated' : 'User suspended')}>{u.suspended ? 'Activate' : 'Suspend'}</button>}</td></tr>))}</tbody></table>}
          {tab === 'posts' && <table><thead><tr><th>Title</th><th>Author</th><th>Status</th><th>Views</th><th /></tr></thead><tbody>{data.map((p) => (
            <tr key={p._id}><td><Link to={`/post/${p.slug}`}>{p.title}</Link></td><td>@{p.author?.username}</td><td>{p.status}</td><td>{p.views}</td>
              <td><button className="link danger" onClick={() => confirmDelete('post') && act(() => api.delete(`/posts/${p._id}`), 'Post deleted')}>Delete</button></td></tr>))}</tbody></table>}
          {tab === 'comments' && <table><thead><tr><th>Comment</th><th>Author</th><th>On post</th><th /></tr></thead><tbody>{data.map((c) => (
            <tr key={c._id}><td>{c.content}</td><td>@{c.author?.username}</td><td>{c.post?.title}</td>
              <td><button className="link danger" onClick={() => confirmDelete('comment') && act(() => api.delete(`/comments/${c._id}`), 'Comment deleted')}>Delete</button></td></tr>))}</tbody></table>}
          {tab === 'reports' && <table><thead><tr><th>Type</th><th>Reason</th><th>Reporter</th><th>Target</th><th>Status</th><th /></tr></thead><tbody>{data.map((r) => <tr key={r._id}><td>{r.post ? 'Post' : 'Comment'}</td><td>{r.reason}</td><td>@{r.reporter?.username}</td><td>{r.post ? <Link to={`/post/${r.post.slug}`}>{r.post.title}</Link> : r.comment?.content}</td><td>{r.status}</td><td>{r.status === 'open' && <><button className="link" onClick={() => act(() => api.put(`/admin/reports/${r._id}`, { status: 'resolved' }), 'Report resolved')}>Resolve</button>{' '}<button className="link" onClick={() => act(() => api.put(`/admin/reports/${r._id}`, { status: 'dismissed' }), 'Report dismissed')}>Dismiss</button></>}</td></tr>)}</tbody></table>}
          {tab === 'categories' && (<>
            <form className="row" onSubmit={(e) => { e.preventDefault(); act(() => api.post('/categories', { name }).then(() => setName('')), 'Category added'); }}>
              <input placeholder="New category" value={name} onChange={(e) => setName(e.target.value)} required /><button className="btn sm">Add</button></form>
            <table><tbody>{data.map((c) => <tr key={c._id}><td>{c.name}</td><td><button className="link danger" onClick={() => confirmDelete('category') && act(() => api.delete(`/categories/${c._id}`), 'Category deleted')}>Delete</button></td></tr>)}</tbody></table></>)}
        </div>)}
    </div>
  );
}
