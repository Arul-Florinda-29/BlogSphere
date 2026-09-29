import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { Spinner, ErrorBox, Empty, toast, fmt, useTitle } from '../components/ui';
export default function Notifications() {
  useTitle('Notifications');
  const [data, setData] = useState(null); const [error, setError] = useState('');
  const load = () => api.get('/notifications').then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => {
  load();
}, []);
  const read = async (id) => { try { await api.put(`/notifications/${id}/read`); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  const all = async () => { try { await api.put('/notifications/read-all'); load(); } catch (e) { toast(errMsg(e), 'err'); } };
  if (error) return <div className="page"><ErrorBox text={error} /></div>;
  if (!data) return <Spinner />;
  return <div className="page narrow"><div className="between row"><h1>Notifications {data.unread > 0 && <span className="chip on">{data.unread} new</span>}</h1>{data.items.length > 0 && <button className="btn ghost sm" onClick={all}>Mark all read</button>}</div>
    {data.items.length === 0 ? <Empty text="No notifications yet" /> : <div className="notification-list">{data.items.map((n) => <div className={`notification ${n.read ? '' : 'unread'}`} key={n._id} onClick={() => !n.read && read(n._id)}>
      <div><strong>{n.message}</strong><div className="muted small">{fmt(n.createdAt)} {n.relatedPost && <>· <Link to={`/post/${n.relatedPost.slug}`}>{n.relatedPost.title}</Link></>}</div></div>
      {!n.read && <span className="dot" />}
    </div>)}</div>}
  </div>;
}
