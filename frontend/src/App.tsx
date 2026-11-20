import { useState, useEffect, useRef, type DragEvent } from 'react';
import { Task, Category, Priority, Subject, TaskStatus, TaskFormData } from './types';
import { Period, periodRange, localToday, formatDate } from '../../shared/planning';
import * as api from './api';
import TaskCard from './components/TaskCard';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailModal from './components/TaskDetailModal';
import ConfirmDialog from './components/ConfirmDialog';
import SubjectModal from './components/SubjectModal';
import StudyCalendar from './components/StudyCalendar';
import FocusControl from './components/FocusControl';
import RecoveryNotice from './components/RecoveryNotice';
import { initialMonth } from './calendar';
import {pendingStatusTasks,restoreTaskStatus,STATUS_LABELS} from './kanban';

export default function App() {
  const [focusStatusContainer,setFocusStatusContainer]=useState<HTMLDivElement|null>(null);
  const [tasks,setTasks]=useState<Task[]>([]),[categories,setCategories]=useState<Category[]>([]),[priorities,setPriorities]=useState<Priority[]>([]),[subjects,setSubjects]=useState<Subject[]>([]);
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [showForm,setShowForm]=useState(false),[editing,setEditing]=useState<Task|null>(null),[subjectOpen,setSubjectOpen]=useState(false);
  const [selectedId,setSelectedId]=useState<number|null>(null),[deleteId,setDeleteId]=useState<number|null>(null);
  const [period,setPeriod]=useState<Period>('all'),[start,setStart]=useState(localToday()),[end,setEnd]=useState(localToday());
  const [movingId,setMovingId]=useState<number|null>(null),[draggedId,setDraggedId]=useState<number|null>(null),[dropTarget,setDropTarget]=useState<TaskStatus|null>(null);
  const [pendingStatuses,setPendingStatuses]=useState(new Set<number>()),[recoveryUnavailable,setRecoveryUnavailable]=useState(false);
  const [moveFocus,setMoveFocus]=useState<{elementId:string}|null>(null);
  const moveLock=useRef(false);
  const [view,setView]=useState<'board'|'calendar'>('board');
  const [calendarMonth,setCalendarMonth]=useState(localToday().slice(0,7));
  const [planningDate,setPlanningDate]=useState<string|undefined>();
  const [sessionId,setSessionId]=useState<number|undefined>();
  const [loaded,setLoaded]=useState(false);
  function openDetails(id:number, date?:string, session?:number) {
    setPlanningDate(date);setSessionId(session);setSelectedId(id);
  }
  async function load() {
    setLoading(true);setError('');setMessage('');
    try{const [t,c,p,s]=await Promise.all([api.getTasks(),api.getCategories(),api.getPriorities(),api.getSubjects()]);setTasks(t);setCategories(c);setPriorities(p);setSubjects(s);setLoaded(true);return true;}
    catch(err){setError((err as Error).message);return false;}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  useEffect(()=>{
    const sync=()=>{try{setPendingStatuses(pendingStatusTasks(api.pendingMutations()));setRecoveryUnavailable(false);}catch{setRecoveryUnavailable(true);}};
    sync();window.addEventListener('todo-mutations',sync);return()=>window.removeEventListener('todo-mutations',sync);
  },[]);
  useEffect(()=>{if(moveFocus)document.getElementById(moveFocus.elementId)?.focus();},[moveFocus]);
  const update=(task:Task)=>setTasks(old=>old.some(t=>t.id===task.id) ? old.map(t=>t.id===task.id ? task : t) : [...old,task]);
  function clearDrag(){setDraggedId(null);setDropTarget(null);}
  async function moveTask(id:number,status:TaskStatus){
    const before=tasks.find(task=>task.id===id);
    if(!before||before.status===status||moveLock.current||pendingStatuses.has(id)||recoveryUnavailable)return;
    moveLock.current=true;setMovingId(id);clearDrag();setError('');setMessage(`Movendo “${before.title}” para ${STATUS_LABELS[status]}…`);
    setTasks(current=>current.map(task=>task.id===id?{...task,status}:task));
    setMoveFocus({elementId:`task-card-${id}`});
    try{
      const saved=await api.updateTaskStatus(id,status);update(saved);setMessage(`“${saved.title}” movida para ${STATUS_LABELS[saved.status]}.`);
      setMoveFocus({elementId:`task-move-${id}`});
    }catch(err){
      setTasks(current=>restoreTaskStatus(current,id,status,before.status));setMessage('');
      let uncertain=err instanceof api.UncertainError;
      try{uncertain=uncertain||pendingStatusTasks(api.pendingMutations()).has(id);}catch{uncertain=true;}
      setError(uncertain?`Não foi possível confirmar a mudança de “${before.title}” para ${STATUS_LABELS[status]}. O cartão voltou provisoriamente para ${STATUS_LABELS[before.status]}, mas a situação no servidor pode ter mudado. Use Verificar resultado no aviso de pedidos pendentes antes de mover novamente.`
        :`Não foi possível mover “${before.title}” para ${STATUS_LABELS[status]}. O cartão voltou para ${STATUS_LABELS[before.status]}. ${(err as Error).message}`);
      setMoveFocus({elementId:'page-error'});
    }finally{moveLock.current=false;setMovingId(null);}
  }
  function dragStart(task:Task,event:DragEvent<HTMLElement>){
    if(moveLock.current||pendingStatuses.has(task.id)||recoveryUnavailable){event.preventDefault();return;}
    event.dataTransfer.setData('application/x-todo-task',String(task.id));event.dataTransfer.effectAllowed='move';setDraggedId(task.id);
  }
  function dragOver(status:TaskStatus,event:DragEvent<HTMLElement>){
    if(draggedId===null||moveLock.current||tasks.find(task=>task.id===draggedId)?.status===status)return;
    event.preventDefault();event.dataTransfer.dropEffect='move';setDropTarget(status);
  }
  let range: {start?:string;end?:string}={},filterError='';
  try{range=periodRange(period,localToday(),start,end);}catch(err){filterError=(err as Error).message;}
  useEffect(()=>{
    if(!filterError)setCalendarMonth(initialMonth(range,localToday()));
  },[period,range.start,range.end,filterError]);
  const visible=filterError ? [] : tasks.filter(t=>period==='unplanned' ? t.sessions.length===0 : !range.start || t.sessions.some(s=>s.planned_date>=range.start! && s.planned_date<=range.end!));
  const done=visible.filter(t=>t.status==='done').length,selected=tasks.find(t=>t.id===selectedId);
  const columns: {key:TaskStatus;title:string;className:string}[]=[{key:'todo',title:'📋 A fazer',className:'column-todo'},{key:'in_progress',title:'⚡ Em progresso',className:'column-in-progress'},{key:'done',title:'✅ Concluídas',className:'column-done'}];
  async function submit(data:TaskFormData){const task=editing ? await api.updateTask(editing.id,data) : await api.createTask(data);update(task);setShowForm(false);setMessage('Atividade salva.');}
  return <>
    <header className="header"><h1>📝 Gestão de Tarefas</h1><div className="header-stats" aria-live="polite">
      <span>Concluídas: {loaded&&!filterError?done:'—'}</span><span>Pendentes: {loaded&&!filterError?visible.length-done:'—'}</span><span>Total: {loaded&&!filterError?visible.length:'—'}</span></div>
      <div className="header-actions"><button className="btn-new-task" disabled={!loaded} onClick={()=>setSubjectOpen(true)}>+ Disciplina</button>
        <FocusControl statusContainer={focusStatusContainer} tasks={tasks} disabled={loading||!loaded} onUpdated={update} onRefresh={async()=>setTasks(await api.getTasks())} onCreate={()=>{setEditing(null);setShowForm(true);}} />
        <button className="btn-new-task" disabled={!loaded} onClick={()=>{setEditing(null);setShowForm(true);}}>+ Nova atividade</button></div></header>
    <div ref={setFocusStatusContainer} className="focus-status-container" />
    <section className="period-filter" aria-label="Filtro de planejamento"><div className="form-group"><label htmlFor="period">Período de estudo</label>
      <select id="period" value={period} onChange={e=>setPeriod(e.target.value as Period)}>
        <option value="all">Todas</option><option value="today">Hoje</option><option value="month">Este mês</option><option value="semester">Este semestre</option><option value="custom">Personalizado</option><option value="unplanned">Sem planejamento</option></select></div>
      {period==='custom' && <div className="custom-range"><div className="form-group"><label htmlFor="range-start">Data inicial</label><input id="range-start" type="date" value={start} onChange={e=>setStart(e.target.value)} /></div>
        <div className="form-group"><label htmlFor="range-end">Data final</label><input id="range-end" type="date" value={end} onChange={e=>setEnd(e.target.value)} /></div></div>}
      <p className="help-text" role="status">{filterError ? 'Período não aplicado.' : range.start ? `Intervalo aplicado: ${formatDate(range.start)} a ${formatDate(range.end!)} (inclusive).` : period==='unplanned' ? 'Atividades sem sessões de estudo.' : 'Todas as atividades, com ou sem planejamento.'}</p>
      {period==='semester' && <p className="help-text">Semestre civil: janeiro a junho ou julho a dezembro. Convenção do protótipo, não calendário oficial da UCS.</p>}
      {filterError && <p className="error-message" role="alert">{filterError}</p>}
      <div className="form-group"><label htmlFor="view-mode">Visualização</label><select id="view-mode" value={view} onChange={e=>setView(e.target.value as 'board'|'calendar')}>
        <option value="board">Quadro</option><option value="calendar">Calendário</option></select></div></section>
    <RecoveryNotice onRecovered={async()=>{const refreshed=await load();setMessage(refreshed?'Resultado verificado. Os dados foram recarregados.':'Pedido confirmado. A consulta dos dados falhou; use Recarregar dados para conferir o estado atual.');}} />
    {error && <div id="page-error" tabIndex={-1} role="alert" className="error-message page-message">{error} <button className="btn btn-secondary" onClick={()=>void load()}>Recarregar dados</button></div>}
    {message && <p className="success-message page-message" role="status">{message}</p>}
    {loading ? <p className="loading" role="status">Carregando atividades…</p> : loaded && <>
      {!filterError && visible.length===0 && <p role="status" className="page-message">Nenhuma atividade neste período. Escolha Todas para consultar as demais.</p>}
      {view==='calendar' ? !filterError && <main><StudyCalendar tasks={tasks} visible={visible} range={range} month={calendarMonth} unplanned={period==='unplanned'}
        onMonthChange={setCalendarMonth} onOpen={(id,sid)=>openDetails(id,undefined,sid)} onPlan={(id,date)=>openDetails(id,date)} /></main>
      : <main className="kanban-board" aria-label="Quadro de atividades"><p id="board-instructions" className="board-instructions">Arraste uma atividade para outra coluna ou use Mover para… no cartão, por teclado ou toque.</p>{columns.map(col=><section className={`kanban-column ${col.className} ${dropTarget===col.key?'is-drop-target':''}`} key={col.key} aria-label={col.title}
        onDragOver={event=>dragOver(col.key,event)} onDragEnter={event=>dragOver(col.key,event)}
        onDragLeave={event=>{if(!(event.relatedTarget instanceof Node)||!event.currentTarget.contains(event.relatedTarget))setDropTarget(current=>current===col.key?null:current);}}
        onDrop={event=>{
          event.preventDefault();const id=Number(event.dataTransfer.getData('application/x-todo-task'));const allowed=id===draggedId;
          clearDrag();if(allowed)void moveTask(id,col.key);
        }}>
        <div className="column-header"><h2>{col.title}</h2><span className="column-count">{visible.filter(t=>t.status===col.key).length}</span></div>
        <p className="kanban-drop-hint">{dropTarget===col.key?`Solte aqui para mover para ${STATUS_LABELS[col.key]}.`:''}</p>
        {visible.filter(t=>t.status===col.key).map(t=><TaskCard key={t.id} task={t} onView={()=>openDetails(t.id)} onEdit={()=>{setEditing(t);setShowForm(true);}} onDelete={()=>setDeleteId(t.id)}
          busy={movingId===t.id} disabled={movingId!==null||pendingStatuses.has(t.id)||recoveryUnavailable} pending={pendingStatuses.has(t.id)&&movingId===null} dragging={draggedId===t.id}
          onMove={status=>void moveTask(t.id,status)} onDragStart={event=>dragStart(t,event)} onDragEnd={clearDrag} />)}
        {visible.filter(t=>t.status===col.key).length===0 && <p className="empty-column">Nenhuma atividade</p>}</section>)}</main>}
    </>}
    {showForm && <TaskFormModal task={editing} categories={categories} priorities={priorities} subjects={subjects} onSubjectCreated={s=>setSubjects(old=>[...old,s])} onSubmit={submit} onClose={()=>setShowForm(false)} />}
    {subjectOpen && <SubjectModal onClose={()=>setSubjectOpen(false)} onCreated={s=>{setSubjects(old=>[...old,s].sort((a,b)=>a.name.localeCompare(b.name)));setMessage('Disciplina cadastrada.');}} />}
    {selected && <TaskDetailModal key={selected.id} task={selected} initialDate={planningDate} initialSessionId={sessionId} onClose={()=>setSelectedId(null)} onDelete={()=>setDeleteId(selected.id)} onUpdated={update} />}
    {deleteId!==null && <ConfirmDialog message={`Excluir “${tasks.find(t=>t.id===deleteId)?.title}”, seus comentários e ${tasks.find(t=>t.id===deleteId)?.sessions.length || 0} estudo(s) planejado(s)? Esta ação não pode ser desfeita.`} onCancel={()=>setDeleteId(null)} onConfirm={async()=>{
      await api.deleteTask(deleteId);setTasks(old=>old.filter(t=>t.id!==deleteId));if(selectedId===deleteId)setSelectedId(null);setDeleteId(null);setMessage('Atividade excluída.');
    }} />}
  </>;
}
