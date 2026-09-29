import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { Spinner, toast, useTitle, Img } from '../components/ui';

export default function Editor() {
  const { id } = useParams(); const nav = useNavigate();
  useTitle(id ? 'Edit post' : 'Write a post');
  const [f, setF] = useState({ title: '', excerpt: '', content: '', featuredImage: '', category: '', tags: '' });
  const [cats, setCats] = useState([]); const [loading, setLoading] = useState(!!id); const [busy, setBusy] = useState(false); const [preview, setPreview] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)); }, []);
  useEffect(() => {
    if (!id) return;
    api.get(`/posts/${id}`).then((r) => setF({ ...r.data, category: r.data.category || '', tags: (r.data.tags || []).join(', '), featuredImage: r.data.featuredImage || '' }))
      .catch((e) => { toast(errMsg(e), 'err'); nav('/dashboard'); }).finally(() => setLoading(false));
  }, [id]);
  const words = f.content.trim().split(/\s+/).filter(Boolean).length;
  const save = async (status) => {
    if (!f.title.trim() || !f.content.trim()) return toast('Title and content are required', 'err');
    setBusy(true);
    try {
      const body = { title: f.title, excerpt: f.excerpt, content: f.content, featuredImage: f.featuredImage, category: f.category, tags: f.tags, status };
      const r = id ? await api.put(`/posts/${id}`, body) : await api.post('/posts', body);
      toast(status === 'published' ? 'Post published!' : 'Draft saved');
      nav(status === 'published' ? `/post/${r.data.slug}` : '/dashboard');
    } catch (e) { toast(errMsg(e), 'err'); } finally { setBusy(false); }
  };
  if (loading) return <Spinner />;
  return (
    <div className="page narrow">
      <h1>{id ? 'Edit post' : 'Write a post'}</h1>
      <label>Title<input value={f.title} onChange={set('title')} maxLength={150} /></label>
      <label>Featured image URL<input placeholder="https://..." value={f.featuredImage} onChange={set('featuredImage')} /></label>
      {f.featuredImage && <div className="hero-img small"><Img src={f.featuredImage} alt="Preview" /></div>}
      <label>Excerpt<input value={f.excerpt} onChange={set('excerpt')} maxLength={200} placeholder="Short summary (optional)" /></label>
      <div className="row">
        <label style={{ flex: 1 }}>Category<select value={f.category} onChange={set('category')}><option value="">None</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
        <label style={{ flex: 1 }}>Tags (comma separated)<input value={f.tags} onChange={set('tags')} placeholder="react, node" /></label>
      </div>
      <div className="row between"><span className="muted small">{words} words · ~{Math.max(1, Math.ceil(words / 200))} min read</span>
        <button className="link" onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button></div>
      {preview ? <div className="content box">{f.content || 'Nothing to preview'}</div> : <textarea className="big" placeholder="Write your article..." value={f.content} onChange={set('content')} />}
      <div className="row"><button className="btn ghost" disabled={busy} onClick={() => save('draft')}>Save draft</button><button className="btn" disabled={busy} onClick={() => save('published')}>{busy ? 'Saving...' : 'Publish'}</button></div>
    </div>
  );
}
