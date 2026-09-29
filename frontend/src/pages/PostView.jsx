import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, Img, Spinner, ErrorBox, PostCard, toast, fmt, confirmDelete, useTitle } from '../components/ui';

function CommentNode({ c, all, depth, reload, postId }) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false); const [editing, setEditing] = useState(false); const [text, setText] = useState('');
  const kids = all.filter((x) => String(x.parent) === String(c._id));
  const mine = user && user.id === c.author?._id;
  const report = async () => { if (!user) return toast('Please login first', 'err'); const reason = window.prompt('Report reason: Spam / Offensive content / Misleading content / Harassment / Other'); if (!reason) return; try { await api.post(`/reports/comment/${c._id}`, { reason }); toast('Report submitted'); } catch (e) { toast(errMsg(e), 'err'); } };
  const run = async (fn, ok) => { try { await fn(); ok && toast(ok); reload(); } catch (e) { toast(errMsg(e), 'err'); } };
  const needLogin = () => !user && toast('Please login first', 'err');
  return (
    <div className="comment" style={{ marginLeft: Math.min(depth, 4) * 18 }}>
      <div className="meta"><Avatar user={c.author} /><strong>@{c.author?.username}</strong><span className="muted small">{fmt(c.createdAt)}{c.updatedAt !== c.createdAt && ' (edited)'}</span></div>
      {editing ? (
        <div><textarea value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn sm" onClick={() => run(() => api.put(`/comments/${c._id}`, { content: text }).then(() => setEditing(false)), 'Comment updated')}>Save</button>
          <button className="link" onClick={() => setEditing(false)}>Cancel</button></div>
      ) : <p>{c.content}</p>}
      <div className="actions">
        <button className={`link ${c.liked ? 'liked' : ''}`} onClick={() => user ? run(() => api.post(`/comments/${c._id}/like`)) : needLogin()}>♥ {c.likeCount}</button>
        <button className="link" onClick={() => user ? setReplying(!replying) : needLogin()}>Reply</button>
        {mine && <button className="link" onClick={() => { setText(c.content); setEditing(true); }}>Edit</button>}
        {user && <button className="link" onClick={report}>Report</button>}
        {(mine || user?.role === 'ADMIN') && <button className="link danger" onClick={() => confirmDelete('comment') && run(() => api.delete(`/comments/${c._id}`), 'Comment deleted')}>Delete</button>}
      </div>
      {replying && <CommentForm postId={postId} parent={c._id} reload={() => { setReplying(false); reload(); }} />}
      {kids.map((k) => <CommentNode key={k._id} c={k} all={all} depth={depth + 1} reload={reload} postId={postId} />)}
    </div>
  );
}

function CommentForm({ postId, parent, reload }) {
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); if (!text.trim()) return; setBusy(true);
    try { await api.post(`/posts/${postId}/comments`, { content: text, parent }); setText(''); toast('Comment posted'); reload(); }
    catch (err) { toast(errMsg(err), 'err'); } finally { setBusy(false); }
  };
  return (<form onSubmit={submit}><textarea placeholder={parent ? 'Write a reply...' : 'Share your thoughts...'} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
    <button className="btn sm" disabled={busy}>{busy ? 'Posting...' : parent ? 'Reply' : 'Comment'}</button></form>);
}

export default function PostView() {
  const { slug } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [post, setPost] = useState(null); const [error, setError] = useState(''); const [comments, setComments] = useState(null); const [progress, setProgress] = useState(0);
  useTitle(post?.title);
  useEffect(() => {
    setPost(null); setError(''); window.scrollTo(0, 0);
    api.get(`/posts/slug/${slug}`).then((r) => setPost(r.data)).catch((e) => setError(e.response?.status === 404 ? 'Post not found (404)' : errMsg(e)));
  }, [slug, user?.id]);
  const loadComments = () => post && api.get(`/posts/${post._id}/comments`).then((r) => setComments(r.data)).catch(() => setComments([]));
  useEffect(() => { if (post?.status === 'published') loadComments(); }, [post?._id, user?.id]);
  useEffect(() => {
    const on = () => { const h = document.documentElement; setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100); };
    window.addEventListener('scroll', on); return () => window.removeEventListener('scroll', on);
  }, []);

  if (error) return <div className="page"><ErrorBox text={error} /><Link to="/">← Back to articles</Link></div>;
  if (!post) return <Spinner />;
  const toggle = async (kind) => {
    if (!user) return toast('Please login first', 'err');
    try {
      if (kind === 'like') { const r = await (post.liked ? api.delete : api.post)(`/posts/${post._id}/like`); setPost({ ...post, liked: r.data.liked, likeCount: r.data.likeCount }); }
      else { const r = await (post.bookmarked ? api.delete : api.post)(`/posts/${post._id}/bookmark`); setPost({ ...post, bookmarked: r.data.bookmarked }); toast(r.data.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks'); }
    } catch (e) { toast(errMsg(e), 'err'); }
  };
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) return navigator.share({ title: post.title, url }).catch(() => {});
    await navigator.clipboard.writeText(url); toast('Link copied');
  };
  const del = async () => { if (!confirmDelete('post')) return; try { await api.delete(`/posts/${post._id}`); toast('Post deleted'); nav('/dashboard'); } catch (e) { toast(errMsg(e), 'err'); } };
  const report = async () => { if (!user) return toast('Please login first', 'err'); const reason = window.prompt('Report reason: Spam / Offensive content / Misleading content / Harassment / Other'); if (!reason) return; try { await api.post(`/reports/post/${post._id}`, { reason }); toast('Report submitted'); } catch (e) { toast(errMsg(e), 'err'); } };
  const canEdit = user && user.id === post.author?._id;

  return (
    <>
      <div className="progress" style={{ width: `${progress}%` }} />
      <article className="page narrow">
        <div className="meta">{post.category && <Link className="chip" to={`/?category=${post.category.slug}`}>{post.category.name}</Link>}{post.status === 'draft' && <span className="chip draft">Draft</span>}</div>
        <h1>{post.title}</h1>
        <div className="meta"><Avatar user={post.author} size={40} /><div><Link to={`/profile/${post.author?.username}`}><strong>{post.author?.name}</strong></Link> <span className="muted">@{post.author?.username}</span>
          <div className="muted small">{fmt(post.publishedAt || post.createdAt)}{post.updatedAt !== post.createdAt && ` · Updated ${fmt(post.updatedAt)}`} · {post.readingTime} min read · {post.wordCount} words · 👁 {post.views}</div></div></div>
        <div className="hero-img"><Img src={post.featuredImage} alt={post.title} /></div>
        <div className="content">{post.content}</div>
        <div className="chips">{post.tags.map((t) => <Link key={t} className="chip" to={`/?tag=${t}`}>#{t}</Link>)}</div>
        <div className="actions bar">
          <button className={`btn ghost ${post.liked ? 'liked' : ''}`} onClick={() => toggle('like')}>♥ {post.likeCount}</button>
          <button className={`btn ghost ${post.bookmarked ? 'liked' : ''}`} onClick={() => toggle('bookmark')}>{post.bookmarked ? '★ Saved' : '☆ Save'}</button>
          <button className="btn ghost" onClick={share}>Share</button>
          {user && <button className="btn ghost" onClick={report}>Report</button>}
          {canEdit && <Link className="btn ghost" to={`/edit-post/${post._id}`}>Edit</Link>}
          {(canEdit || user?.role === 'ADMIN') && <button className="btn danger" onClick={del}>Delete</button>}
        </div>
        {post.status === 'published' && (
          <section>
            <h2>Comments ({post.commentCount})</h2>
            {user ? <CommentForm postId={post._id} reload={() => { loadComments(); setPost((p) => ({ ...p, commentCount: p.commentCount + 1 })); }} /> : <p className="muted"><Link to="/login">Login</Link> to join the conversation.</p>}
            {!comments ? <Spinner /> : comments.length === 0 ? <p className="muted">No comments yet. Be the first!</p> :
              comments.filter((c) => !c.parent).map((c) => <CommentNode key={c._id} c={c} all={comments} depth={0} postId={post._id} reload={() => { loadComments(); api.get(`/posts/slug/${slug}`).then((r) => setPost((p) => ({ ...p, commentCount: r.data.commentCount }))); }} />)}
          </section>
        )}
        {post.related?.length > 0 && <section><h2>Related articles</h2><div className="grid">{post.related.map((p) => <PostCard key={p._id} post={p} />)}</div></section>}
      </article>
      <button className="totop" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>
    </>
  );
}
