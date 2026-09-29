import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PostCard, Spinner, Empty, ErrorBox, toast, confirmDelete, useTitle } from '../components/ui';

export default function Dashboard({ tab: initial = 'posts' }) {
  useTitle('Dashboard');
  const { user } = useAuth();
  const [tab, setTab] = useState(initial); const [posts, setPosts] = useState(null); const [marks, setMarks] = useState(null); const [error, setError] = useState('');
  const load = () => {
    api.get('/posts/mine').then((r) => setPosts(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/posts/bookmarks/all').then((r) => setMarks(r.data)).catch((e) => setError(errMsg(e)));
  };
  useEffect(load, []);
  const del = async (id) => { if (!confirmDelete('post')) return; try { await api.delete(`/posts/${id}`); toast('Post deleted'); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  const unmark = async (id) => { try { await api.delete(`/posts/${id}/bookmark`); toast('Removed from bookmarks'); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  if (error) return <div className="page"><ErrorBox text={error} /></div>;
  if (!posts || !marks) return <Spinner />;
  const pub = posts.filter((p) => p.status === 'published');
  const stat = [['Posts', posts.length], ['Published', pub.length], ['Drafts', posts.length - pub.length], ['Views', posts.reduce((a, p) => a + p.views, 0)], ['Likes', posts.reduce((a, p) => a + p.likeCount, 0)]];
  const list = tab === 'posts' ? posts : tab === 'drafts' ? posts.filter((p) => p.status === 'draft') : marks;
  return (
    <div className="page">
      <h1>Welcome, {user.name.split(' ')[0]} 👋</h1>
      <div className="stats">{stat.map(([l, v]) => <div className="stat" key={l}><b>{v}</b><span>{l}</span></div>)}</div>
      <div className="row"><Link className="btn" to="/create-post">+ Create post</Link><Link className="btn ghost" to="/analytics">View analytics</Link><Link className="btn ghost" to="/profile">My profile</Link></div>
      <div className="chips">{[['posts', 'My posts'], ['drafts', 'Drafts'], ['bookmarks', 'Bookmarks']].map(([k, l]) => <button key={k} className={`chip ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{l}</button>)}</div>
      {list.length === 0 ? <Empty text={tab === 'bookmarks' ? 'No bookmarks yet' : tab === 'drafts' ? 'No drafts' : "You haven't published any posts yet"} /> : (
        <div className="grid">{list.map((p) => (
          <div key={p._id}><PostCard post={p} />
            <div className="row">{tab === 'bookmarks' ? <button className="link danger" onClick={() => unmark(p._id)}>Remove</button> : (<><Link className="link" to={`/edit-post/${p._id}`}>Edit</Link><button className="link danger" onClick={() => del(p._id)}>Delete</button></>)}</div>
          </div>))}</div>)}
    </div>
  );
}
