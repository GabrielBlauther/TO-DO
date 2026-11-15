import { useEffect, useRef, useState } from 'react';
import type { Task, SessionFormData } from '../types';
import { formatDate, localToday } from '../../../shared/planning';
import { suggestFocus, localTime, freeSlot, snapshot, validMinutes, newCycle, remaining, recoverTimer, changeTimer, timerText,
  type FocusAction, type FocusRequest, type FocusTimer } from '../../../shared/focus';
import { readTimer, readPending, writeTimer, writePending, TIMER_KEY, PENDING_KEY } from '../focus-storage';
import * as api from '../api';
import Modal from './Modal';

type Draft = { taskId:string; sourceId:string; action:FocusAction|''; minutes:number; current:SessionFormData; previous:SessionFormData; confirmed:boolean };
const emptyPlan = ():SessionFormData => ({planned_date:localToday(),start_time:localTime(),duration_minutes:25});
function fromPending(p:FocusRequest):Draft {
  return {taskId:String(p.task_id),sourceId:p.origin?String(p.origin.id):'none',action:p.action,minutes:p.minutes,
    current:p.current || emptyPlan(),previous:p.previous || emptyPlan(),confirmed:p.confirm_after_due};
}
function PlanFields({prefix,plan,onChange,showDuration=true}:{prefix:string;plan:SessionFormData;onChange:(patch:Partial<SessionFormData>)=>void;showDuration?:boolean}) {
  return <div className="focus-plan-fields">
    <div className="form-group"><label htmlFor={`${prefix}-date`}>Data de estudo</label><input id={`${prefix}-date`} type="date" required value={plan.planned_date} onChange={e=>onChange({planned_date:e.target.value})} /></div>
    <div className="form-group"><label htmlFor={`${prefix}-time`}>Horário inicial (opcional)</label><input id={`${prefix}-time`} type="time" value={plan.start_time || ''} onChange={e=>onChange({start_time:e.target.value || null})} /></div>
    {showDuration ? <div className="form-group"><label htmlFor={`${prefix}-duration`}>Duração do planejamento (minutos)</label><input id={`${prefix}-duration`} type="number" required min="1" step="1" value={Number.isNaN(plan.duration_minutes)?'':plan.duration_minutes} onChange={e=>onChange({duration_minutes:e.target.valueAsNumber})} /></div>
      : <p>Duração preservada: {plan.duration_minutes} min.</p>}
  </div>;
}

export default function FocusControl({tasks,disabled,onCreate,onUpdated,onRefresh}:{tasks:Task[];disabled:boolean;onCreate:()=>void;onUpdated:(task:Task)=>void;onRefresh:()=>Promise<void>}) {
  const [open,setOpen]=useState(false),[timer,setTimer]=useState<FocusTimer|null>(null),[pending,setPending]=useState<FocusRequest|null>(null);
  const [draft,setDraft]=useState<Draft|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now());
  const [nextMinutes,setNextMinutes]=useState(25);
  const [slotHint,setSlotHint]=useState('');
  const busyRef=useRef(false);
  const available=tasks.filter(t=>t.status!=='done');
  const sources=available.flatMap(task=>task.sessions.filter(s=>s.planned_date===localToday()).map(session=>({task,session}))).sort((a,b)=>a.session.id-b.session.id);
  const suggestion=suggestFocus(tasks,localToday(),localTime());
  function restore() {
    try {setTimer(readTimer(localStorage));const p=readPending(localStorage);setPending(p);if(p)setDraft(fromPending(p));}
    catch(err){setError(`Não foi possível recuperar o Foco: ${(err as Error).message}`);}
  }
  useEffect(()=>{
    restore();
    const sync=(e:StorageEvent)=>{if([TIMER_KEY,PENDING_KEY,null].includes(e.key))restore();};
    window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);
  },[]);
  function mutateTimer(change:(t:FocusTimer)=>FocusTimer|null) {
    try {
      const fresh=readTimer(localStorage);
      if(!fresh){setTimer(null);return;}
      const next=change(fresh);writeTimer(localStorage,next);setTimer(next);setError('');
    }catch(err){setError(`Não foi possível guardar o timer: ${(err as Error).message}`);}
  }
  useEffect(()=>{
    const interval=window.setInterval(()=>{
      const time=Date.now();setNow(time);
      if(timer?.status==='running' && remaining(timer,time)===0) mutateTimer(t=>recoverTimer(t,time));
    },250);
    return()=>window.clearInterval(interval);
  },[timer?.key,timer?.status,timer?.deadline]);
  function show() {
    setError('');
    try {
      const active=readTimer(localStorage),waiting=readPending(localStorage);
      setTimer(active);setPending(waiting);
      if(waiting)setDraft(fromPending(waiting));
      else if(!active){
        const plan=emptyPlan();
        setDraft({taskId:suggestion?String(suggestion.task.id):'',sourceId:sources.length>1?'':suggestion?.session?String(suggestion.session.id):'none',
          action:'',minutes:25,current:plan,previous:{...plan,duration_minutes:suggestion?.session?.duration_minutes || 25},confirmed:false});
      }
      setNextMinutes(active?.minutes || 25);
    }catch(err){setError((err as Error).message);}
    setOpen(true);
  }
  function change(patch:Partial<Draft>) {setDraft(old=>old?{...old,...patch,confirmed:false}:old);setError('');}
  const selected=tasks.find(t=>t.id===Number(draft?.taskId));
  const pendingTask=pending?.origin?tasks.find(t=>t.id===pending.origin!.task_id):null;
  const source=pending?.origin?{session:pending.origin,task:pendingTask || {id:pending.origin.task_id,title:`Atividade anterior indisponível (#${pending.origin.task_id})`,due_date:null,sessions:[]}}
    :sources.find(s=>s.session.id===Number(draft?.sourceId));
  const action:FocusAction=source?source.task.id===selected?.id?'same':draft?.action as FocusAction:'new';
  const currentTask=tasks.find(t=>t.id===timer?.task_id);
  const affectedPrevious=source?.task.sessions.filter(s=>s.id!==source.session.id).length || 0;
  const currentPlan=source?source.session:draft?.current;
  const afterDue=!!draft && (
    ((action==='new'||action==='reschedule'||action==='unplan') && !!selected?.due_date && !!currentPlan && currentPlan.planned_date>selected.due_date)
    || (action==='reschedule' && !!source?.task.due_date && draft.previous.planned_date>source.task.due_date));
  function chooseAction(value:FocusAction) {
    if(value==='reschedule' && source) {
      const slot=freeSlot(tasks,snapshot(source.session),localToday(),localTime());
      setSlotHint(slot?'Intervalo sugerido sem sobreposição com os registros atuais. Revise sua disponibilidade.':'Não foi encontrado intervalo na busca automática. Defina data e horário manualmente ou escolha outra opção.');
      change({action:value,previous:slot || {...emptyPlan(),duration_minutes:source.session.duration_minutes}});
    }else change({action:value});
  }
  async function confirm() {
    if(busyRef.current || !draft)return;
    busyRef.current=true;setBusy(true);setError('');
    try {
      if(!navigator.locks)throw new Error('Use um navegador com Web Locks em localhost para garantir um único Foco entre abas.');
      await navigator.locks.request('todo-focus-start',async()=>{
        const active=readTimer(localStorage);
        if(active){setTimer(active);throw new Error('Já existe um estudo recuperado. Continue ou encerre esse estudo antes de iniciar outro.');}
        const stored=readPending(localStorage);
        if(stored && stored.key!==pending?.key){setPending(stored);setDraft(fromPending(stored));throw new Error('Há uma confirmação pendente em outra aba. Verifique esse pedido antes de criar outro.');}
        let request=stored;
        if(!request){
          if(!selected || selected.status==='done')throw new Error('Escolha uma atividade não concluída.');
          if(!draft.sourceId)throw new Error('Escolha explicitamente a sessão de origem ou Sem sessão de origem.');
          if(draft.sourceId!=='none' && !source)throw new Error('Atualize as sessões de origem e revise a escolha.');
          if(source && source.task.id!==selected.id && !draft.action)throw new Error('Escolha o destino do planejamento anterior.');
          if(!validMinutes(draft.minutes))throw new Error('O ciclo deve ter de 1 a 180 minutos inteiros.');
          if(afterDue && !draft.confirmed)throw new Error('Revise as datas após o prazo ou confirme o aviso.');
          request={key:crypto.randomUUID(),task_id:selected.id,origin:source?snapshot(source.session):null,action,minutes:draft.minutes,
            current:action==='new'?draft.current:null,previous:action==='reschedule'?draft.previous:null,confirm_after_due:draft.confirmed};
          writePending(localStorage,request);setPending(request);
        }
        try {
          const result=await api.confirmFocus(request);
          const next=newCycle(result,'study',Date.now());
          writeTimer(localStorage,next);setTimer(next);setNextMinutes(next.minutes);setNow(Date.now());
          writePending(localStorage,null);setPending(null);
          try{await onRefresh();}catch{setError('Planejamento confirmado. Não foi possível atualizar o quadro; use Atualizar atividades.');}
        }catch(err){
          if(err instanceof api.ApiError && err.status<500){writePending(localStorage,null);setPending(null);}
          throw err;
        }
      });
    }catch(err){setError((err as Error).message);}
    finally{busyRef.current=false;setBusy(false);}
  }
  function close() {if(busyRef.current)return;setOpen(false);if(!timer&&!pending)setDraft(null);}
  function clearStudy() {
    try {writePending(localStorage,null);writeTimer(localStorage,null);setTimer(null);setPending(null);setDraft(null);setOpen(false);setError('');}
    catch(err){setError(`Não foi possível encerrar o estado local: ${(err as Error).message}`);}
  }
  const phaseStatus=timer ? `${timer.phase==='study'?'Estudo':'Pausa curta'}: ${timer.status==='running'?'em andamento':timer.status==='paused'?'pausado':timer.endedEarly?'encerrado antecipadamente':'tempo concluído'}.` : '';
  return <>
    <button id="focus-button" className="btn-new-task" disabled={disabled} onClick={show} aria-label="Abrir modo Foco">
      Foco{timer && <span aria-hidden="true"> · {timerText(timer,now)}</span>}{!timer&&pending?' · verificar confirmação':''}
    </button>
    {!open && error && <span role="alert" className="focus-inline-error">{error}</span>}
    {open && <Modal title="Modo Foco" large fallbackFocusId="focus-button" onClose={close}>
      {timer ? <>
        <h3>{currentTask?.title || `Atividade indisponível (#${timer.task_id})`}</h3><p>Disciplina: {currentTask?.subject_name || 'Sem disciplina'}</p>
        <p role="status" aria-live="polite">{phaseStatus} Encerrar o timer não conclui a atividade.</p>
        <output className="focus-clock" aria-label="Tempo restante" aria-live="off">{timerText(timer,now)}</output>
        <progress className="focus-progress" aria-label="Progresso do ciclo" aria-live="off" max={timer.totalMs} value={timer.totalMs-remaining(timer,now)} />
        {timer.status!=='finished' ? <div className="focus-actions">
          {timer.status==='running'?<button className="btn btn-primary" onClick={()=>mutateTimer(t=>changeTimer(t,'pause',Date.now()))}>Pausar</button>
            :<button className="btn btn-primary" onClick={()=>mutateTimer(t=>changeTimer(t,'resume',Date.now()))}>Retomar</button>}
          <button className="btn btn-secondary" onClick={()=>mutateTimer(t=>changeTimer(t,'end',Date.now()))}>Encerrar ciclo</button>
          <button className="btn btn-secondary" onClick={close}>Minimizar Foco</button>
        </div> : <>
          <p>Escolha o próximo passo. Nenhum ciclo começa automaticamente.</p>
          <div className="form-group"><label htmlFor="next-cycle">Próximo ciclo de estudo (1 a 180 minutos)</label><input id="next-cycle" type="number" min="1" max="180" step="1" value={Number.isNaN(nextMinutes)?'':nextMinutes} onChange={e=>setNextMinutes(e.target.valueAsNumber)} /></div>
          <div className="focus-actions">
            <button className="btn btn-primary" disabled={!currentTask||currentTask.status==='done'} onClick={()=>mutateTimer(t=>{
              if(t.status!=='finished')throw new Error('Um ciclo já está em andamento.');
              return newCycle({...t,minutes:nextMinutes},'study',Date.now());
            })}>Outro ciclo de estudo</button>
            <button className="btn btn-secondary" onClick={()=>mutateTimer(t=>{
              if(t.status!=='finished')throw new Error('Um ciclo já está em andamento.');
              return newCycle(t,'break',Date.now());
            })}>Iniciar pausa de 5 minutos</button>
            <button className="btn btn-secondary" onClick={clearStudy}>Retornar ao planejamento</button>
          </div>
          {currentTask?.status==='done'?<p role="status">Atividade concluída por confirmação explícita.</p>:<button className="btn btn-success" disabled={busy||!currentTask} onClick={async()=>{
            if(busyRef.current)return;busyRef.current=true;setBusy(true);setError('');
            try{onUpdated(await api.updateTaskStatus(timer.task_id,'done'));}catch(err){setError((err as Error).message);}finally{busyRef.current=false;setBusy(false);}
          }}>Concluir atividade</button>}
        </>}
        <p className="help-text">Minimizar/Escape preserva o timer. Retornar ao planejamento não desfaz alterações já confirmadas. O estado é recuperado neste navegador após recarregar.</p>
      </> : draft && <>
        {!pending && suggestion && <div className="focus-suggestion"><h3>Sugestão: {suggestion.task.title}</h3><p>{suggestion.task.subject_name || 'Sem disciplina'} · {suggestion.reason}</p>
          {suggestion.session && <button className="btn btn-secondary" onClick={()=>change({taskId:String(suggestion.task.id),sourceId:String(suggestion.session!.id),action:''})}>Usar sessão sugerida #{suggestion.session.id} · {suggestion.session.start_time || 'Sem horário'}</button>}</div>}
        {!pending&&!suggestion&&available.length>0 && <p>Não há sugestão com data. Escolha uma atividade manualmente.</p>}
        {available.length===0 && !pending ? <><p>Não há atividades não concluídas disponíveis.</p><button className="btn btn-primary" onClick={()=>{close();onCreate();}}>Cadastrar atividade</button></> : <form onSubmit={e=>{e.preventDefault();void confirm();}}>
          {pending && <p className="warning-message">Confirmação pendente: a gravação pode já ter ocorrido. Verifique o mesmo pedido para recuperar o resultado sem duplicar. Suas escolhas estão preservadas.</p>}
          <fieldset disabled={busy||!!pending}>
            <div className="form-group"><label htmlFor="focus-task">Atividade para estudar agora</label><select id="focus-task" value={draft.taskId} onChange={e=>change({taskId:e.target.value,action:''})} required>
              <option value="">Escolha uma atividade</option>{pending&&!available.some(t=>t.id===pending.task_id)&&<option value={pending.task_id}>{selected?.title || `Atividade #${pending.task_id}`} · pedido pendente</option>}{available.map(t=><option key={t.id} value={t.id}>{t.title} · {t.subject_name || 'Sem disciplina'}</option>)}</select></div>
            <div className="form-group"><label htmlFor="focus-source">Sessão de origem que será considerada</label><select id="focus-source" value={draft.sourceId} onChange={e=>change({sourceId:e.target.value,action:''})} required>
              <option value="">Escolha explicitamente a origem</option><option value="none">Sem sessão de origem — incluir planejamento</option>
              {pending?.origin&&source&&!sources.some(s=>s.session.id===pending.origin!.id)&&<option value={pending.origin.id}>#{pending.origin.id} · {source.task.title} · {formatDate(pending.origin.planned_date)} · {pending.origin.start_time || 'Sem horário'} · origem do pedido pendente</option>}
              {sources.map(({task,session:s})=><option key={s.id} value={s.id}>#{s.id} · {task.title} · {formatDate(s.planned_date)} · {s.start_time || 'Sem horário'} · {s.duration_minutes} min</option>)}</select></div>
            {source&&selected&&source.task.id!==selected.id && <fieldset className="focus-destination"><legend>Destino do estudo anterior: {source.task.title}</legend>
              {([['keep','Estudar agora sem alterar o planejamento original'],['reschedule','Substituir a sessão e reagendar o estudo anterior'],['unplan','Substituir a sessão e deixar o estudo anterior sem data']] as const).map(([value,label])=><label key={value} className="checkbox-label"><input type="radio" name="focus-action" value={value} checked={draft.action===value} onChange={()=>chooseAction(value)} />{label}</label>)}
            </fieldset>}
            {source&&action==='reschedule' && <section><h3>Reagendar {source.task.title}</h3>
              <p className="help-text">Sugestão: primeiro intervalo sem sessões cadastradas nos próximos 7 dias, entre 08h e 20h, em passos de 15 minutos. Não representa sua disponibilidade pessoal; revise ou ajuste.</p>
              {slotHint && <p className="help-text">{slotHint}</p>}
              <details className="focus-existing"><summary>Ver sessões cadastradas no dia do reagendamento</summary>
                <ul>{tasks.flatMap(t=>t.sessions.filter(s=>s.planned_date===draft.previous.planned_date).map(s=><li key={s.id}>#{s.id} · {t.title} · {s.start_time || 'Sem horário (não bloqueia horários)'} · {s.duration_minutes} min</li>))}</ul>
                {!tasks.some(t=>t.sessions.some(s=>s.planned_date===draft.previous.planned_date))&&<p>Não há sessões cadastradas nesse dia.</p>}
              </details>
              <PlanFields prefix="focus-previous" plan={draft.previous} showDuration={false} onChange={patch=>change({previous:{...draft.previous,...patch}})} /></section>}
            {draft.sourceId==='none' && <section><h3>Planejamento a incluir para o estudo atual</h3><PlanFields prefix="focus-current" plan={draft.current} onChange={patch=>change({current:{...draft.current,...patch}})} /></section>}
            <div className="form-group"><label htmlFor="focus-minutes">Duração do ciclo de estudo (1 a 180 minutos)</label><input id="focus-minutes" type="number" required min="1" max="180" step="1" value={Number.isNaN(draft.minutes)?'':draft.minutes} onChange={e=>change({minutes:e.target.valueAsNumber})} /></div>
            <p className="help-text">Padrão: estudo de 25 minutos e pausa curta de 5. O ciclo não precisa consumir a duração inteira do planejamento.</p>
            {afterDue && <div className="warning-message"><p>Há estudo após o prazo indicado no resumo. Você pode revisar antes de confirmar.</p><label className="checkbox-label"><input type="checkbox" checked={draft.confirmed} onChange={e=>setDraft({...draft,confirmed:e.target.checked})} /> Confirmo conscientemente o estudo após o prazo.</label></div>}
          </fieldset>
          <section className="focus-summary" aria-labelledby="focus-summary-title"><h3 id="focus-summary-title">Resumo antes de confirmar</h3>
            <p>Estudar agora: {selected?.title || 'selecione uma atividade'} · {selected?.subject_name || 'Sem disciplina'}. Prazo: {formatDate(selected?.due_date || null)}. Ciclo: {draft.minutes} min.</p>
            {!draft.sourceId?<p>Escolha a sessão de origem ou informe que não há origem.</p>:source?<>
              <p>Origem #{source.session.id}: {source.task.title}, {formatDate(source.session.planned_date)}, {source.session.start_time || 'Sem horário'}, {source.session.duration_minutes} min. Prazo anterior: {formatDate(source.task.due_date)}.</p>
              {action==='same'?<p>Usar a sessão existente. Nenhuma alteração no planejamento.</p>:action==='keep'?<p>A sessão original fica intacta. O estudo atual não cria um novo agendamento.</p>:action==='reschedule'?<p>O intervalo original passará para {selected?.title}. {source.task.title} será reagendada para {formatDate(draft.previous.planned_date)}, {draft.previous.start_time || 'Sem horário'}. Seus prazos serão mantidos.</p>:action==='unplan'?<p>Somente o agendamento #{source.session.id} será removido e substituído pelo estudo atual. A atividade {source.task.title} será preservada; {affectedPrevious} outra(s) sessão(ões) permanecem nas suas datas. {affectedPrevious?'Ela continuará planejada nessas datas.':'Ela ficará sem planejamento.'}</p>:<p>Escolha o destino do estudo anterior.</p>}
            </>:<p>Incluir uma sessão para a atividade atual em {formatDate(draft.current.planned_date)}, {draft.current.start_time || 'Sem horário'}, {draft.current.duration_minutes} min. O prazo não muda.</p>}
          </section>
          <div className="form-actions"><button type="button" className="btn btn-secondary" disabled={busy} onClick={close}>{pending?'Fechar e verificar depois':'Cancelar'}</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Confirmando…':pending?'Verificar confirmação pendente':'Confirmar e iniciar foco'}</button></div>
        </form>}
      </>}
      {error && <p className="error-message" role="alert">{error}</p>}
      {!pending && <button className="btn btn-secondary focus-refresh" disabled={busy} onClick={()=>{setError('');onRefresh().catch(err=>setError(err.message));}}>Atualizar atividades</button>}
      {!timer && (!draft || available.length===0) && <button className="btn btn-secondary" onClick={close}>Fechar</button>}
    </Modal>}
  </>;
}
