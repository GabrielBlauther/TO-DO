import { useState, useEffect } from 'react';
import { Task, Category, Priority, Subject, TaskStatus, TaskFormData } from './types';
import { Period, periodRange, localToday, formatDate } from '../../shared/planning';
import * as api from './api';
import TaskCard from './components/TaskCard';
import TaskFormModal from './components/TaskFormModal';
import TaskDetailModal from './components/TaskDetailModal';
import ConfirmDialog from './components/ConfirmDialog';
import SubjectModal from './components/SubjectModal';
import StudyCalendar from './components/StudyCalendar';
import { initialMonth } from './calendar';

export default function App() {
  const [tasks,setTasks]=useState<Task[]>([]),[categories,setCategories]=useState<Category[]>([]),[priorities,setPriorities]=useState<Priority[]>([]),[subjects,setSubjects]=useState<Subject[]>([]);
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [showForm,setShowForm]=useState(false),[editing,setEditing]=useState<Task|null>(null),[subjectOpen,setSubjectOpen]=useState(false);
  const [selectedId,setSelectedId]=useState<number|null>(null),[deleteId,setDeleteId]=useState<number|null>(null);
  const [period,setPeriod]=useState<Period>('all'),[start,setStart]=useState(localToday()),[end,setEnd]=useState(localToday());
  const [statusBusy,setStatusBusy]=useState(false);
  const [view,setView]=useState<'board'|'calendar'>('board');
  const [calendarMonth,setCalendarMonth]=useState(localToday().slice(0,7));
  const [planningDate,setPlanningDate]=useState<string|undefined>();
  const [sessionId,setSessionId]=useState<number|undefined>();
  function openDetails(id:number, date?:string, session?:number) {
    setPlanningDate(date);setSessionId(session);setSelectedId(id);
  }
  async function load() {
    setLoading(true);setError('');
    try{const [t,c,p,s]=await Promise.all([api.getTasks(),api.getCategories(),api.getPriorities(),api.getSubjects()]);setTasks(t);setCategories(c);setPriorities(p);setSubjects(s);}
    catch(err){setError((err as Error).message);}finally{setLoading(false);}
  }
  useEffect(()=>{void load();},[]);
  const update=(task:Task)=>setTasks(old=>old.some(t=>t.id===task.id) ? old.map(t=>t.id===task.id ? task : t) : [...old,task]);
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
      <span>Concluídas: {done}</span><span>Pendentes: {visible.length-done}</span><span>Total: {visible.length}</span></div>
      <div className="header-actions"><button className="btn-new-task" onClick={()=>setSubjectOpen(true)}>+ Disciplina</button>
        <button className="btn-new-task" onClick={()=>{setEditing(null);setShowForm(true);}}>+ Nova atividade</button></div></header>
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
    {error && <div role="alert" className="error-message page-message">{error} <button className="btn btn-secondary" onClick={()=>void load()}>Tentar novamente</button></div>}
    {message && <p className="success-message page-message" role="status">{message}</p>}
    {loading ? <p className="loading">Carregando atividades…</p> : <>
      {!filterError && visible.length===0 && <p role="status" className="page-message">Nenhuma atividade neste período. Escolha Todas para consultar as demais.</p>}
      {view==='calendar' ? !filterError && <main><StudyCalendar tasks={tasks} visible={visible} range={range} month={calendarMonth} unplanned={period==='unplanned'}
        onMonthChange={setCalendarMonth} onOpen={(id,sid)=>openDetails(id,undefined,sid)} onPlan={(id,date)=>openDetails(id,date)} /></main>
      : <main className="kanban-board">{columns.map(col=><section className={`kanban-column ${col.className}`} key={col.key} aria-label={col.title}>
        <div className="column-header"><h2>{col.title}</h2><span className="column-count">{visible.filter(t=>t.status===col.key).length}</span></div>
        {visible.filter(t=>t.status===col.key).map(t=><TaskCard key={t.id} task={t} onView={()=>openDetails(t.id)} onEdit={()=>{setEditing(t);setShowForm(true);}} onDelete={()=>setDeleteId(t.id)}
          statusLabel={t.status==='todo'?'Iniciar':t.status==='in_progress'?'Concluir':'Reabrir'} onStatusChange={()=>{
            if(statusBusy)return;setStatusBusy(true);setError('');api.updateTaskStatus(t.id,t.status==='todo'?'in_progress':t.status==='in_progress'?'done':'todo').then(update).catch(err=>setError(err.message)).finally(()=>setStatusBusy(false));
          }} />)}
        {visible.filter(t=>t.status===col.key).length===0 && <p className="empty-column">Nenhuma atividade</p>}</section>)}</main>}
    </>}
    {showForm && <TaskFormModal task={editing} categories={categories} priorities={priorities} subjects={subjects} onSubmit={submit} onClose={()=>setShowForm(false)} />}
    {subjectOpen && <SubjectModal onClose={()=>setSubjectOpen(false)} onCreated={s=>{setSubjects(old=>[...old,s].sort((a,b)=>a.name.localeCompare(b.name)));setMessage('Disciplina cadastrada.');}} />}
    {selected && <TaskDetailModal key={selected.id} task={selected} initialDate={planningDate} initialSessionId={sessionId} onClose={()=>setSelectedId(null)} onDelete={()=>setDeleteId(selected.id)} onUpdated={update} />}
    {deleteId!==null && <ConfirmDialog message="Excluir esta atividade e seus comentários e sessões? Esta ação não pode ser desfeita." onCancel={()=>setDeleteId(null)} onConfirm={async()=>{
      await api.deleteTask(deleteId);setTasks(old=>old.filter(t=>t.id!==deleteId));if(selectedId===deleteId)setSelectedId(null);setDeleteId(null);setMessage('Atividade excluída.');
    }} />}
  </>;
}
