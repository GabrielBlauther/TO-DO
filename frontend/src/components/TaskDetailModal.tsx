import { useState, useEffect } from 'react';
import { Task, Comment } from '../types';
import * as api from '../api';
import { formatDate } from '../../../shared/planning';
import Modal from './Modal';
import SessionEditor from './SessionEditor';

export default function TaskDetailModal({ task, onClose, onDelete, onUpdated }: {
  task: Task; onClose: () => void; onDelete: () => void; onUpdated: (task: Task) => void;
}) {
  const [comments, setComments] = useState<Comment[]>([]), [text, setText] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  useEffect(() => { let active=true; api.getComments(task.id).then(rows => {if(active)setComments(rows);}).catch(err=>{if(active)setError(err.message);});return()=>{active=false;}; }, [task.id]);
  return <Modal title={task.title} large onClose={() => {if(!busy)onClose();}}>
    <div className="task-detail-badges"><span className="badge badge-priority">{task.priority_emoji} {task.priority_name}</span>
      <span className="badge badge-category">{task.category_emoji} {task.category_name}</span>
      <span className="badge badge-status">{{todo:'A fazer',in_progress:'Em progresso',done:'Concluída'}[task.status]}</span></div>
    <p className="card-line">Disciplina: {task.subject_name || 'Sem disciplina'}</p>
    {task.description && <p className="task-detail-description">{task.description}</p>}
    <p className="card-line">Prazo da atividade: {formatDate(task.due_date)}</p>
    <p className="card-line">Criada em: {formatDate(task.created_at.slice(0,10))}</p>
    <div className="task-detail-actions">
      {task.status !== 'done' && <button className="btn btn-success" disabled={busy} onClick={async () => {
        setBusy(true);setError('');try{onUpdated(await api.updateTaskStatus(task.id,'done'));setMessage('Atividade concluída.');}catch(err){setError((err as Error).message);}finally{setBusy(false);}
      }}>Marcar como concluída</button>}
      <button className="btn btn-danger" disabled={busy} onClick={onDelete}>Excluir atividade</button>
      <button className="btn btn-secondary" disabled={busy} onClick={onClose}>Fechar</button></div>
    <SessionEditor task={task} onUpdated={onUpdated} onBusyChange={setBusy} />
    <section className="comments-section" aria-labelledby="comments-title"><h3 id="comments-title">Comentários ({comments.length})</h3>
      <form onSubmit={async event => {
        event.preventDefault();if(busy)return;setBusy(true);setError('');
        try { const comment=await api.addComment(task.id,text);setComments(old=>[comment,...old]);setText('');setMessage('Comentário adicionado.'); }
        catch(err){setError((err as Error).message);}finally{setBusy(false);}
      }}><label htmlFor="new-comment">Novo comentário</label><div className="comment-form"><input id="new-comment" value={text} onChange={e=>setText(e.target.value)} required />
        <button disabled={busy}>Enviar comentário</button></div></form>
      <ul className="comment-list">{comments.map(c=><li className="comment-item" key={c.id}><p>{c.text}</p>
        <small>{formatDate(c.created_at.slice(0,10))}</small><button disabled={busy} aria-label={`Excluir comentário: ${c.text}`} onClick={async()=>{
          setBusy(true);setError('');try{await api.deleteComment(c.id);setComments(old=>old.filter(x=>x.id!==c.id));}catch(err){setError((err as Error).message);}finally{setBusy(false);}
        }}>Excluir</button></li>)}</ul></section>
    {error && <p role="alert" className="error-message">{error}</p>}{message && <p role="status" className="success-message">{message}</p>}
  </Modal>;
}
