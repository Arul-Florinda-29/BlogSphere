import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { Spinner, ErrorBox, Empty, useTitle } from '../components/ui';
export default function Analytics() {
  useTitle('Analytics');
  const [data, setData] = useState(null); const [error, setError] = useState('');
  useEffect(() => { api.get('/analytics/me').then((r) => setData(r.data)).catch((e) => setError(errMsg(e))); }, []);
  if (error) return <div className="page"><ErrorBox text={error} /></div>;
  if (!data) return <Spinner />;
  return <div className="page"><div className="between row"><div><h1>Writing analytics</h1><p className="muted">Understand how readers interact with your published work.</p></div><Link className="btn ghost sm" to="/dashboard">Back to dashboard</Link></div>
    <div className="stats">{Object.entries(data.totals).map(([k,v]) => <div className="stat" key={k}><b>{v}</b><span>{k}</span></div>)}</div>
    <section className="box"><h2>Top articles</h2>{data.top.length === 0 ? <Empty text="Publish an article to see analytics." /> : <div className="table-wrap"><table><thead><tr><th>Article</th><th>Views</th><th>Likes</th></tr></thead><tbody>{data.top.map((p) => <tr key={p._id}><td>{p.title}</td><td>{p.views}</td><td>{p.likes}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
