import { useState, useEffect } from 'react';
import { Task, Comment } from '../types';
import * as api from '../api';
import { formatDate } from '../../../shared/planning';
import {useAttempt} from '../useAttempt';
import Modal from './Modal';
import SessionEditor from './SessionEditor';

export default function TaskDetailModal({ task, onClose, onDelete, onUpdated, initialDate, initialSessionId }: {
  task: Task; onClose: () => void; onDelete: () => void; onUpdated: (task: Task) => void;
  initialDate?: string; initialSessionId?: number;
}) {
  const [comments,setComments]=useState<Comment[]>([]),[text,setText]=useState('');
  const [commentsLoading,setCommentsLoading]=useState(true),[commentsError,setCommentsError]=useState('');
  const [sessionBusy,setSessionBusy]=useState(false),[sessionDraft,setSessionDraft]=useState(false);
  const [message,setMessage]=useState(''),[removeComment,setRemoveComment]=useState<number|null>(null),[leaving,setLeaving]=useState(false);
  const {busy:writing,error,setError,uncertain,run}=useAttempt();
  const busy=writing||sessionBusy,dirty=sessionDraft||!!text.trim();
  async function loadComments(){
    setCommentsLoading(true);setCommentsError('');
    try{setComments(await api.getComments(task.id));}
    catch(err){setCommentsError((err as Error).message);}
    finally{setCommentsLoading(false);}
  }
  useEffect(()=>{void loadComments();},[task.id]);
  function close(){if(busy)return;if(dirty&&!uncertain)setLeaving(true);else onClose();}
  return <Modal title={task.title} large fallbackFocusId="view-mode" onClose={close}>
    {leaving&&<div className="warning-message" role="alert"><p>Há edição de estudo ou comentário não enviado. Deseja descartar esse rascunho e fechar? O que já foi salvo será mantido.</p>
      <button className="btn btn-primary" onClick={()=>setLeaving(false)}>Continuar editando</button>{' '}<button className="btn btn-secondary" onClick={onClose}>Descartar rascunho e fechar</button></div>}
    <div className="task-detail-badges"><span className="badge badge-priority">{task.priority_emoji} {task.priority_name}</span>
      <span className="badge badge-category">{task.category_emoji} {task.category_name}</span>
      <span className="badge badge-status">{{todo:'A fazer',in_progress:'Em progresso',done:'Concluída'}[task.status]}</span></div>
    <p className="card-line">Disciplina: {task.subject_name||'Sem disciplina'}</p>
    {task.description&&<p className="task-detail-description">{task.description}</p>}
    <p className="card-line">Prazo da atividade: {formatDate(task.due_date)}</p>
    <div className="task-detail-actions">
      <button className="btn btn-secondary" disabled={busy||uncertain} onClick={()=>{setMessage('');void run(async()=>{onUpdated(await api.updateTaskStatus(task.id,task.status==='done'?'todo':'done'));setMessage(task.status==='done'?'Atividade reaberta.':'Atividade concluída. Você pode reabri-la aqui.');});}}>{task.status==='done'?'Reabrir atividade':'Marcar como concluída'}</button>
      <button className="btn btn-secondary" disabled={busy} onClick={close}>{uncertain?'Fechar e verificar depois':'Fechar'}</button>
    </div>
    <SessionEditor task={task} onUpdated={onUpdated} onBusyChange={setSessionBusy} onDraftChange={setSessionDraft} initialDate={initialDate} initialSessionId={initialSessionId}/>
    <section className="comments-section" aria-labelledby="comments-title"><h3 id="comments-title">Comentários{!commentsLoading&&!commentsError?` (${comments.length})`:''}</h3>
      {commentsLoading&&<p role="status">Carregando comentários…</p>}
      {commentsError&&<div className="error-message" role="alert"><p>{commentsError} A lista de comentários não foi confirmada.</p><button className="btn btn-secondary" disabled={commentsLoading} onClick={()=>void loadComments()}>Recarregar comentários</button></div>}
      {!commentsLoading&&!commentsError&&!comments.length&&<p>Nenhum comentário enviado.</p>}
      <form onSubmit={event=>{
        event.preventDefault();setMessage('');void run(async()=>{const comment=await api.addComment(task.id,text);setComments(old=>[comment,...old.filter(c=>c.id!==comment.id)]);setText('');setMessage('Comentário adicionado.');});
      }}><label htmlFor="new-comment">Novo comentário</label><div className="comment-form"><input id="new-comment" value={text} onChange={e=>setText(e.target.value)} required disabled={busy||uncertain}/>
        <button disabled={busy}>{writing?'Enviando…':uncertain?'Verificar resultado':'Enviar comentário'}</button></div></form>
      <ul className="comment-list">{comments.map(c=><li className="comment-item" key={c.id}><p>{c.text}</p>
        <small>{formatDate(c.created_at.slice(0,10))}</small><button disabled={busy||uncertain} aria-label={`Excluir comentário: ${c.text}`} onClick={()=>{setRemoveComment(c.id);setMessage('');setError('');}}>Excluir</button>
        {removeComment===c.id&&<div className="warning-message"><p>Excluir o comentário “{c.text}”? Não será possível recuperá-lo depois da confirmação.</p>
          <button className="btn btn-secondary" disabled={busy||uncertain} onClick={()=>setRemoveComment(null)}>Manter comentário</button>{' '}
          <button className="btn btn-danger" disabled={busy} onClick={()=>void run(async()=>{await api.deleteComment(c.id);setComments(old=>old.filter(x=>x.id!==c.id));setRemoveComment(null);setMessage('Comentário excluído.');document.getElementById('new-comment')?.focus();})}>{uncertain?'Verificar resultado':'Confirmar exclusão do comentário'}</button></div>}
      </li>)}</ul>
    </section>
    {error&&<p role="alert" className="error-message">{error}</p>}
    {uncertain&&<button className="btn btn-primary" disabled={busy} onClick={()=>void run(async()=>{})}>Verificar resultado do pedido</button>}
    {message&&<p role="status" className="success-message">{message}</p>}
    <footer className="detail-footer"><p className="help-text">Excluir a atividade também remove seus comentários e estudos planejados. Você poderá cancelar antes de confirmar.</p>
      <button className="btn btn-secondary" disabled={busy||uncertain||dirty} onClick={onDelete}>Excluir atividade</button>
      {dirty&&<p className="help-text">Termine ou cancele o rascunho antes de excluir a atividade.</p>}</footer>
  </Modal>;
}
