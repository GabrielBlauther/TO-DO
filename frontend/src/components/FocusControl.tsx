import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Task, SessionFormData } from '../types';
import { formatDate, localToday, sessionInterval } from '../../../shared/planning';
import { suggestFocus, localTime, freeSlot, snapshot, validMinutes, newCycle, remaining, recoverTimer, changeTimer, timerText, focusWindowMessage,
  type FocusAction, type FocusRequest, type FocusTimer } from '../../../shared/focus';
import { readTimer, readPending, writeTimer, writePending, TIMER_KEY, PENDING_KEY } from '../focus-storage';
import * as api from '../api';
import Modal from './Modal';
import FocusPanel from './FocusPanel';

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

export default function FocusControl({tasks,disabled,onCreate,onUpdated,onRefresh,statusContainer}:{tasks:Task[];disabled:boolean;onCreate:()=>void;onUpdated:(task:Task)=>void;onRefresh:()=>Promise<void>;statusContainer:HTMLElement|null}) {
  const [open,setOpen]=useState(false),[timer,setTimer]=useState<FocusTimer|null>(null),[pending,setPending]=useState<FocusRequest|null>(null);
  const [draft,setDraft]=useState<Draft|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[now,setNow]=useState(Date.now());
  const [nextMinutes,setNextMinutes]=useState(25);
  const [slotHint,setSlotHint]=useState('');
  const [step,setStep]=useState(1),[nextAction,setNextAction]=useState('');
  const [completeUncertain,setCompleteUncertain]=useState(false);
  const [windowExpanded,setWindowExpanded]=useState(false);
  const [refreshing,setRefreshing]=useState(false),[refreshIssue,setRefreshIssue]=useState(false),[notice,setNotice]=useState('');
  const refreshLock=useRef(false);
  const returnToPanel=useRef(false);
  useEffect(()=>{if(open&&!timer)document.getElementById('focus-step')?.focus();},[step,open,!!timer]);
  const busyRef=useRef(false);
  const available=tasks.filter(t=>t.status!=='done');
  const sources=available.flatMap(task=>task.sessions.filter(s=>s.planned_date===localToday()).map(session=>({task,session}))).sort((a,b)=>a.session.id-b.session.id);
  const suggestion=suggestFocus(tasks,localToday(),localTime());
  useEffect(()=>{
    if(!open||timer||pending||!draft)return;
    if(draft.sourceId&&draft.sourceId!=='none'&&!sources.some(s=>String(s.session.id)===draft.sourceId)){
      change({sourceId:'',action:''});setStep(1);setError('O estudo escolhido não está mais disponível para hoje. As outras escolhas foram mantidas. Escolha outro estudo ou planeje um novo antes de continuar.');
    }else if(draft.taskId&&!available.some(t=>String(t.id)===draft.taskId)){
      change({taskId:'',action:''});setStep(1);setError('A atividade escolhida não está disponível para estudar. As demais escolhas foram mantidas. Escolha outra atividade antes de continuar.');
    }
  },[tasks,open,!!timer,!!pending]);
  function restore() {
    try {setTimer(readTimer(localStorage));const p=readPending(localStorage);setPending(p);if(p){setDraft(fromPending(p));setStep(3);}}
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
    returnToPanel.current=false;
    try {
      const active=readTimer(localStorage),waiting=readPending(localStorage);
      setTimer(active);setPending(waiting);
      if(waiting){setDraft(fromPending(waiting));setStep(3);}
      else if(!active&&!draft){
        setStep(1);setSlotHint('');
        const plan=emptyPlan();
        setDraft({taskId:suggestion?String(suggestion.task.id):'',sourceId:sources.length>1?'':suggestion?.session?String(suggestion.session.id):'none',
          action:'',minutes:25,current:plan,previous:{...plan,duration_minutes:suggestion?.session?.duration_minutes || 25},confirmed:false});
      }
      if(!nextAction)setNextMinutes(active?.minutes || 25);
    }catch(err){setError((err as Error).message);}
    setOpen(true);
  }
  function change(patch:Partial<Draft>) {setDraft(old=>old?{...old,...patch,confirmed:false}:old);setError('');setNotice('');}
  const selected=tasks.find(t=>t.id===Number(draft?.taskId));
  const pendingTask=pending?.origin?tasks.find(t=>t.id===pending.origin!.task_id):null;
  const source=pending?.origin?{session:pending.origin,task:pendingTask || {id:pending.origin.task_id,title:'Atividade anterior indisponível — confira o planejamento',due_date:null,sessions:[]}}
    :sources.find(s=>s.session.id===Number(draft?.sourceId));
  const action:FocusAction=source?source.task.id===selected?.id?'same':draft?.action as FocusAction:'new';
  const currentTask=tasks.find(t=>t.id===timer?.task_id);
  const canStudy=!!currentTask&&currentTask.status!=='done';
  const nextOptions=timer?[
    ...(timer.endedEarly&&timer.remainingMs>0?['resume']:[]),
    ...(timer.phase==='study'?['break']:[]),...(canStudy?['study']:[]),'end']:[];
  const chosenNext=nextOptions.includes(nextAction)?nextAction:!canStudy?'end':timer?.phase==='study'?'break':'study';
  useEffect(()=>{if(currentTask?.status==='done')setCompleteUncertain(false);},[currentTask?.status]);
  const affectedPrevious=source?.task.sessions.filter(s=>s.id!==source.session.id).length || 0;
  const currentPlan=source?source.session:draft?.current;
  const afterDue=!!draft && (
    ((action==='new'||action==='reschedule'||action==='unplan') && !!selected?.due_date && !!currentPlan && currentPlan.planned_date>selected.due_date)
    || (action==='reschedule' && !!source?.task.due_date && draft.previous.planned_date>source.task.due_date));
  function chooseAction(value:FocusAction) {
    if(value==='reschedule' && source && !slotHint) {
      const slot=freeSlot(tasks,snapshot(source.session),localToday(),localTime());
      setSlotHint(slot?'Intervalo sugerido sem sobreposição com os registros atuais. Revise sua disponibilidade.':'Não foi encontrado intervalo na busca automática. Defina data e horário manualmente ou escolha outra opção.');
      change({action:value,previous:slot || {...emptyPlan(),duration_minutes:source.session.duration_minutes}});
    }else change({action:value});
  }
  async function refreshActivities(){
    if(refreshLock.current)return;refreshLock.current=true;setRefreshing(true);setError('');setNotice('');
    try{await onRefresh();setRefreshIssue(false);setNotice('Lista de atividades atualizada.');}
    catch(err){setRefreshIssue(true);setError(`Não foi possível atualizar a lista. ${(err as Error).message} Suas escolhas e o timer foram mantidos. Use Atualizar lista de atividades para tentar novamente.`);}
    finally{refreshLock.current=false;setRefreshing(false);}
  }
  async function completeActivity(){
    if(!timer||busyRef.current)return;busyRef.current=true;setBusy(true);setError('');
    try{onUpdated(await api.updateTaskStatus(timer.task_id,'done'));setCompleteUncertain(false);setNotice('');}
    catch(err){setError((err as Error).message);setCompleteUncertain(err instanceof api.UncertainError);}
    finally{busyRef.current=false;setBusy(false);}
  }
  async function confirm() {
    if(busyRef.current || !draft)return;
    busyRef.current=true;setBusy(true);setError('');setNotice('');
    try {
      if(!navigator.locks)throw new Error('Use um navegador com Web Locks em localhost para garantir um único Foco entre abas.');
      await navigator.locks.request('todo-focus-start',async()=>{
        const active=readTimer(localStorage);
        if(active){setTimer(active);throw new Error('Já existe um estudo recuperado. Continue ou encerre esse estudo antes de iniciar outro.');}
        const stored=readPending(localStorage);
        if(stored && stored.key!==pending?.key){setPending(stored);setDraft(fromPending(stored));setStep(3);throw new Error('Há uma confirmação pendente em outra aba. Verifique esse pedido antes de criar outro.');}
        let request=stored;
        if(!request){
          if(!selected || selected.status==='done')throw new Error('Escolha uma atividade não concluída.');
          if(!draft.sourceId)throw new Error('Escolha qual estudo de hoje será usado ou substituído, ou escolha planejar um novo estudo. Nenhuma alteração foi enviada.');
          if(draft.sourceId!=='none' && !source)throw new Error('O estudo escolhido não está mais na lista. Volte à escolha, abra Ajuda e atualização da lista e atualize antes de confirmar.');
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
          try{await onRefresh();setRefreshIssue(false);}catch{setRefreshIssue(true);setError('Planejamento confirmado e timer iniciado. A consulta do quadro falhou. Use Atualizar lista de atividades para conferir os dados salvos; não inicie o estudo novamente.');}
        }catch(err){
          if(err instanceof api.ApiError && err.status<500){writePending(localStorage,null);setPending(null);}
          throw err;
        }
      });
    }catch(err){setError(err instanceof api.ApiError&&err.status<500?`${err.message} Use Voltar para corrigir as escolhas.`:(err as Error).message);}
    finally{busyRef.current=false;setBusy(false);}
  }
  function close() {if(busyRef.current)return;returnToPanel.current=true;setOpen(false);}
  function discard(){if(busyRef.current||pending)return;setDraft(null);setSlotHint('');setStep(1);setOpen(false);setError('');setNotice('');}
  function advance(){
    setError('');
    if(step===1){
      if(!selected||!draft?.sourceId){setError('Escolha a atividade e indique qual estudo usar, ou escolha planejar um novo estudo. As escolhas ainda não foram enviadas.');return;}
      setStep(source?.task.id===selected.id?3:2);
    }else{
      if(source&&!draft?.action){setError('Escolha o que fazer com o estudo anterior. Você pode manter o planejamento sem alterar nada.');return;}
      try{const plan=source?draft!.previous:draft!.current;if(!source||action==='reschedule')sessionInterval(plan.planned_date,plan.start_time,plan.duration_minutes);}
      catch(err){setError(`Não foi possível revisar o planejamento. ${(err as Error).message} As escolhas foram mantidas; corrija os campos ou volte.`);return;}
      setStep(3);
    }
  }
  function clearStudy() {
    try {writePending(localStorage,null);writeTimer(localStorage,null);setTimer(null);setPending(null);setDraft(null);setNextAction('');setCompleteUncertain(false);setOpen(false);setError('');setNotice('');}
    catch(err){setError(`Não foi possível encerrar o estado local: ${(err as Error).message}`);}
  }
  const phaseStatus=timer ? `${timer.phase==='study'?'Estudo':'Pausa curta'}: ${timer.status==='running'?'em andamento':timer.status==='paused'?'pausado':timer.endedEarly?'encerrado antecipadamente':'tempo concluído'}.` : '';
  const minimizedMessage=timer
    ? timer.status==='running'?`${timer.phase==='study'?'Estudo':'Pausa'} em andamento. O timer continua contando.`
      :timer.status==='paused'?`${timer.phase==='study'?'Estudo pausado':'Pausa pausada'}. O timer permanece parado.`
      :`Ciclo ${timer.phase==='study'?'de estudo':'de pausa'} ${timer.endedEarly?'encerrado antes do fim':'concluído'}. O timer está parado.`
    :pending?'Confirmação pendente. Reabra o Foco para verificar o pedido.':draft?'Preparação guardada nesta página. Reabra o Foco para continuar.':'Não foi possível recuperar o Foco. Restaure para consultar o problema.';
  const windowMessage=timer?focusWindowMessage(timer):pending?'O pedido pode já ter sido salvo. Minimizar mantém a confirmação pendente para verificar depois pelo Foco; não cancela a gravação.':draft?'As escolhas ficam guardadas nesta página para você voltar pelo Foco. Minimizar não confirma nem altera o planejamento.':error?'O estado do Foco não pôde ser recuperado. Minimizar não remove dados já salvos.':'Não há preparação de estudo em andamento. Minimizar mantém o planejamento salvo.';
  return <>
    <button id="focus-button" className="btn-new-task" disabled={disabled} onClick={show} aria-label="Abrir modo Foco" aria-expanded={open} aria-describedby={!open&&(timer||pending||draft)?'focus-window-state':undefined} title={timer||pending||draft?'Restaurar janela do Foco':'Abrir modo Foco'}>
      Foco{timer && <span aria-hidden="true"> · {timerText(timer,now)}</span>}{!timer&&pending?' · verificar confirmação':''}
    </button>
    {statusContainer&&(timer||pending||draft||error)&&createPortal(<FocusPanel visible={!open} timer={timer} now={now}
      focusOnShow={returnToPanel.current}
      taskName={timer?currentTask?.title||'Atividade indisponível':selected?.title||(draft||pending?'Preparação do estudo':'Recuperação do Foco')} message={minimizedMessage} error={error}
      onTogglePause={()=>mutateTimer(t=>changeTimer(t,t.status==='running'?'pause':'resume',Date.now()))} onRestore={show} />,statusContainer)}
    {open && <Modal title="Modo Foco" large fallbackFocusId="focus-button" onClose={close} busy={busy}
      expanded={windowExpanded} onExpandedChange={setWindowExpanded} onMinimize={close} minimizeTitle={windowMessage}
      closeLabel="Minimizar Foco" exitTitle={!timer&&!pending&&draft?'Minimizar ou descartar a preparação?':'Minimizar o Foco?'}
      exitLabel={pending?'Minimizar e verificar depois':!timer&&draft?'Minimizar e guardar':'Minimizar Foco'} discardLabel="Descartar preparação" onDiscard={!timer&&!pending&&draft?discard:undefined}
      closeMessage={timer?windowMessage:pending||!draft?windowMessage:'Minimizar mantém suas escolhas nesta página para retomar pelo Foco. Descartar preparação limpa somente este rascunho. O planejamento salvo permanece.'}>
      {requestClose=><div className="focus-content">
      {timer ? <>
        <section className="focus-activity" aria-label="Atividade em foco"><h3>{currentTask?.title || 'Atividade indisponível — confira o planejamento'}</h3><p>{currentTask?.subject_name || 'Sem disciplina'}</p>
        </section>
        {timer.status==='finished'?<section className={`focus-result ${timer.endedEarly?'is-interrupted':'is-success'}`} aria-label="Resultado do ciclo"><h3 role="status">
          <svg className="feedback-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false">{timer.endedEarly?<><circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/></>:<><circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/></>}</svg>
          {timer.phase==='break'?'Pausa': 'Ciclo de estudo'} {timer.endedEarly?timer.phase==='break'?'encerrada antes do fim':'encerrado antes do fim':timer.phase==='break'?'concluída':'concluído'}</h3><p role="status">{currentTask?.status==='done'?'Atividade concluída. O planejamento salvo foi mantido.':`A atividade continua ${currentTask?.status==='in_progress'?'em progresso':currentTask?'a fazer':'indisponível'}; conclua-a somente se terminou o trabalho.`}</p>
          {currentTask&&currentTask.status!=='done'&&<button className="btn focus-text-button" disabled={busy} onClick={()=>void completeActivity()}>{busy?'Confirmando conclusão…':completeUncertain?'Verificar conclusão da atividade':'Marcar atividade como concluída'}</button>}
        </section>:<>
          <p className="focus-phase" role="status" aria-live="polite">{phaseStatus}</p>
          <output className="focus-clock" aria-label="Tempo restante" aria-live="off">{timerText(timer,now)}</output>
          <progress className="focus-progress" aria-label="Progresso do ciclo" aria-live="off" max={timer.totalMs} value={timer.totalMs-remaining(timer,now)} />
        </>}
        {timer.status!=='finished' ? <div className="focus-footer">
          {timer.status==='running'?<button className="btn btn-primary" onClick={()=>mutateTimer(t=>changeTimer(t,'pause',Date.now()))}>Pausar</button>
            :<button className="btn btn-primary" onClick={()=>mutateTimer(t=>changeTimer(t,'resume',Date.now()))}>Retomar</button>}
          <button className="btn btn-secondary" onClick={()=>{setNextAction('');mutateTimer(t=>changeTimer(t,'end',Date.now()));}}>Encerrar ciclo</button>
        </div> : <form onSubmit={e=>{
          e.preventDefault();setError('');
          if(chosenNext==='end'){clearStudy();return;}
          if(chosenNext==='study'&&(!currentTask||currentTask.status==='done')){setError('Esta atividade não está disponível para outro ciclo. Encerre o estudo para escolher outra.');return;}
          if(chosenNext==='study'&&!validMinutes(nextMinutes)){setError('Informe de 1 a 180 minutos inteiros. Nenhum ciclo começou; corrija a duração ou escolha outro próximo passo.');return;}
          mutateTimer(t=>{
            if(t.status!=='finished')throw new Error('Um ciclo já está em andamento.');
            const next=chosenNext==='resume'?changeTimer(t,'resume',Date.now()):newCycle({...t,minutes:chosenNext==='study'?nextMinutes:t.minutes},chosenNext==='break'?'break':'study',Date.now());
            setNextAction('');return next;
          });
        }}>
          <div className="form-group"><label htmlFor="focus-next-action">Próximo passo</label><select id="focus-next-action" value={chosenNext} disabled={busy||completeUncertain} aria-describedby="focus-next-help" onChange={e=>{setNextAction(e.target.value);setError('');}}>
            {timer.endedEarly&&timer.remainingMs>0&&<option value="resume">Retomar o tempo restante deste ciclo</option>}
            {currentTask&&currentTask.status!=='done'&&<option value="study">Fazer outro ciclo de estudo</option>}
            {timer.phase==='study'&&<option value="break">Fazer uma pausa de 5 minutos</option>}<option value="end">Encerrar o estudo e voltar ao planejamento</option>
          </select></div>
          {chosenNext==='study'&&<div className="form-group"><label htmlFor="next-cycle">Duração do novo ciclo (1 a 180 minutos)</label><input id="next-cycle" type="number" required min="1" max="180" step="1" value={Number.isNaN(nextMinutes)?'':nextMinutes} disabled={busy||completeUncertain} onChange={e=>setNextMinutes(e.target.valueAsNumber)} /></div>}
          <p id="focus-next-help" className="help-text">{completeUncertain?'A conclusão da atividade pode já ter sido salva. Use Verificar conclusão da atividade acima antes de iniciar outro ciclo. Você pode minimizar para verificar depois.':chosenNext==='end'?'Encerra o estudo no timer e mantém o planejamento salvo.':chosenNext==='break'?'A pausa começa somente ao confirmar.':chosenNext==='study'?'Revise a duração antes de iniciar o novo ciclo.':'Retoma somente o tempo restante do ciclo interrompido.'}</p>
          <div className="focus-footer"><button type="button" className="btn btn-secondary" disabled={busy} onClick={requestClose}>Minimizar</button><button type="submit" className="btn btn-primary" disabled={busy||completeUncertain}>{chosenNext==='end'?'Encerrar estudo':chosenNext==='break'?'Iniciar pausa de 5 minutos':chosenNext==='study'?'Iniciar novo ciclo':'Retomar ciclo'}</button></div>
        </form>}
        {timer.status!=='finished'&&<p className="help-text focus-window-help">{windowMessage} Encerrar um ciclo não conclui a atividade.</p>}
      </> : draft && <>
        <h3 id="focus-step" tabIndex={-1}>{step===1?'Escolher atividade':step===2?'Ajustar planejamento':'Revisar e iniciar'}</h3>
        {!pending && step===1 && suggestion && <div className="focus-suggestion"><h3>Sugestão: {suggestion.task.title}</h3><p>{suggestion.task.subject_name || 'Sem disciplina'} · {suggestion.reason}</p>
          {suggestion.session && <button className="btn btn-secondary" onClick={()=>{setSlotHint('');change({taskId:String(suggestion.task.id),sourceId:String(suggestion.session!.id),action:''});}}>Usar estudo sugerido · {formatDate(suggestion.session.planned_date)} · {suggestion.session.start_time || 'Sem horário'} · {suggestion.session.duration_minutes} min</button>}</div>}
        {!pending&&step===1&&!suggestion&&available.length>0 && <p>Não há sugestão com data. Escolha uma atividade manualmente.</p>}
        {available.length===0 && !pending ? <><p>Não há atividades não concluídas disponíveis.</p><div className="focus-footer"><button className="btn btn-secondary" onClick={requestClose}>Minimizar</button><button className="btn btn-primary" onClick={()=>{discard();onCreate();}}>Cadastrar atividade</button></div></> : <form className="focus-form" onSubmit={e=>{e.preventDefault();if(step<3)advance();else void confirm();}}>
          {pending && <p className="warning-message">Confirmação pendente: a gravação pode já ter ocorrido. Verifique o mesmo pedido para recuperar o resultado sem duplicar. Suas escolhas estão preservadas.</p>}
          <fieldset disabled={busy||!!pending}>
            {step===1&&<>
            <div className="form-group"><label htmlFor="focus-task">Atividade para estudar agora</label><select id="focus-task" value={draft.taskId} onChange={e=>change({taskId:e.target.value,action:''})} required>
              <option value="">Escolha uma atividade</option>{available.map(t=><option key={t.id} value={t.id}>{t.title} · {t.subject_name || 'Sem disciplina'}</option>)}</select></div>
            {(sources.length>0||!draft.sourceId)&&<div className="form-group"><label htmlFor="focus-source">Qual estudo de hoje você quer usar ou substituir?</label><select id="focus-source" value={draft.sourceId} onChange={e=>{setSlotHint('');change({sourceId:e.target.value,action:''});}} required>
              <option value="">Escolha um estudo ou planeje um novo</option><option value="none">Nenhum destes — planejar um novo estudo</option>
              {sources.map(({task,session:s})=><option key={s.id} value={s.id}>{task.title} · {task.subject_name||'Sem disciplina'} · {formatDate(s.planned_date)} · {s.start_time || 'Sem horário'} · {s.duration_minutes} min</option>)}</select><p className="help-text">Se escolher outra atividade, você decidirá a seguir se mantém ou reorganiza este estudo. Nada será alterado antes da revisão.</p></div>}
            {!sources.length&&<p>Não há estudo planejado para hoje. A próxima etapa permite planejar o estudo desta atividade.</p>}
            <details className="focus-existing"><summary>Ajuda e atualização da lista</summary><p className="help-text">Atividade é o trabalho que você vai estudar; disciplina é a matéria. O estudo planejado reserva data e duração; o ciclo de foco é um intervalo do timer. Nenhum deles muda o prazo da atividade.</p><button type="button" className="btn btn-secondary" disabled={busy||refreshing} onClick={()=>void refreshActivities()}>{refreshing?'Atualizando lista…':'Atualizar lista de atividades'}</button></details>
            </>}
            {step===2&&<>
            {source&&selected&&source.task.id!==selected.id && <fieldset className="focus-destination"><legend>O que fazer com {source.task.title}?</legend>
              <p>{formatDate(source.session.planned_date)} · {source.session.start_time||'Sem horário'} · {source.session.duration_minutes} min. Você vai estudar {selected.title}.</p>
              {([['keep','Manter esse estudo como está; usar apenas o timer para a outra atividade'],['reschedule','Usar esse horário para a outra atividade e reagendar o estudo anterior'],['unplan','Usar esse horário para a outra atividade e remover apenas o agendamento anterior']] as const).map(([value,label])=><label key={value} className="checkbox-label"><input type="radio" name="focus-action" value={value} checked={draft.action===value} onChange={()=>chooseAction(value)} />{label}</label>)}
            </fieldset>}
            {source&&action==='reschedule' && <section><h3>Reagendar {source.task.title}</h3>
              <p className="help-text">Sugestão: primeiro intervalo sem sessões cadastradas nos próximos 7 dias, entre 08h e 20h, em passos de 15 minutos. Não representa sua disponibilidade pessoal; revise ou ajuste.</p>
              {slotHint && <p className="help-text">{slotHint}</p>}
              <details className="focus-existing"><summary>Ver sessões cadastradas no dia do reagendamento</summary>
                <ul>{tasks.flatMap(t=>t.sessions.filter(s=>s.planned_date===draft.previous.planned_date).map(s=><li key={s.id}>{t.title} · {s.start_time || 'Sem horário (não bloqueia horários)'} · {s.duration_minutes} min</li>))}</ul>
                {!tasks.some(t=>t.sessions.some(s=>s.planned_date===draft.previous.planned_date))&&<p>Não há sessões cadastradas nesse dia.</p>}
              </details>
              <PlanFields prefix="focus-previous" plan={draft.previous} showDuration={false} onChange={patch=>change({previous:{...draft.previous,...patch}})} /></section>}
            {draft.sourceId==='none' && <section><h3>Quando estudar {selected?.title}?</h3><p className="help-text">Será incluído um estudo planejado. Você pode usar vários ciclos de foco nessa duração; o prazo da atividade não muda.</p><PlanFields prefix="focus-current" plan={draft.current} onChange={patch=>change({current:{...draft.current,...patch}})} /></section>}
            </>}
            {step===3&&<>
            <section className="focus-summary" aria-labelledby="focus-summary-title"><h3 id="focus-summary-title">Seu estudo</h3>
              <dl className="focus-facts"><div><dt>Atividade</dt><dd>{selected?.title || 'selecione uma atividade'}</dd></div><div><dt>Disciplina</dt><dd>{selected?.subject_name || 'Sem disciplina'}</dd></div><div><dt>Prazo da atividade</dt><dd>{formatDate(selected?.due_date || null)}</dd></div><div><dt>Estudo planejado</dt><dd>{action==='keep'?'Só timer, sem novo agendamento':`${formatDate(currentPlan?.planned_date || null)} · ${currentPlan?.start_time || 'Sem horário'} · ${currentPlan?.duration_minutes || 0} min`}</dd></div></dl>
              {!draft.sourceId?<p>Volte e escolha qual estudo usar, ou planeje um novo.</p>:source?<>
                {action==='same'?<p>O planejamento existente será mantido.</p>:action==='keep'?<p>O estudo de {source.task.title} em {formatDate(source.session.planned_date)}, {source.session.start_time || 'sem horário'}, permanece como está.</p>:action==='reschedule'?<><p>Este horário será usado para a atividade acima.</p><p>{source.task.title} passará para {formatDate(draft.previous.planned_date)}, {draft.previous.start_time || 'sem horário'}, {draft.previous.duration_minutes} min. Prazo: {formatDate(source.task.due_date)} (mantido).</p></>:action==='unplan'?<p>Este horário será usado para a atividade acima. Somente o agendamento de {source.task.title} de {formatDate(source.session.planned_date)}, {source.session.start_time || 'sem horário'}, será removido. A atividade e seu prazo ({formatDate(source.task.due_date)}) permanecem; {affectedPrevious?`${affectedPrevious} outro(s) estudo(s) continuam planejados.`:'ela ficará sem planejamento.'}</p>:<p>Volte para decidir o que fazer com o estudo anterior.</p>}
              </>:<p>Será criado este estudo planejado. O prazo da atividade permanece.</p>}
            </section>
            <div className="form-group"><label htmlFor="focus-minutes">Duração do ciclo de estudo (1 a 180 minutos)</label><input id="focus-minutes" type="number" required min="1" max="180" step="1" value={Number.isNaN(draft.minutes)?'':draft.minutes} onChange={e=>change({minutes:e.target.valueAsNumber})} /></div>
            <p className="help-text">Um ciclo usa o timer; não precisa ocupar todo o estudo planejado. Pausa curta: 5 minutos.</p>
            {afterDue && <div className="warning-message"><p>Há estudo após o prazo indicado no resumo. Você pode revisar antes de confirmar.</p><label className="checkbox-label"><input type="checkbox" checked={draft.confirmed} onChange={e=>setDraft({...draft,confirmed:e.target.checked})} /> Confirmo conscientemente o estudo após o prazo.</label></div>}
            </>}
          </fieldset>
          {notice&&<p className="help-text" role="status">{notice}</p>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {refreshIssue&&step!==1&&<button type="button" className="btn btn-secondary" disabled={refreshing||busy} onClick={()=>void refreshActivities()}>{refreshing?'Atualizando lista…':'Atualizar lista de atividades'}</button>}
          <div className="focus-footer">
            {!pending&&step>1&&<button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>setStep(step===3&&source?.task.id===selected?.id?1:step-1)}>Voltar</button>}
            <button type="button" className="btn btn-secondary" disabled={busy} onClick={requestClose}>Minimizar</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Confirmando…':pending?'Verificar confirmação':step<3?'Continuar':'Iniciar foco'}</button>
          </div>
        </form>}
      </>}
      {error && (timer||!draft||(!available.length&&!pending)) && <p className="error-message" role="alert">{error}</p>}
      {timer&&notice&&<p className="help-text" role="status">{notice}</p>}
      {timer&&refreshIssue&&<button type="button" className="btn btn-secondary" disabled={refreshing||busy} onClick={()=>void refreshActivities()}>{refreshing?'Atualizando lista…':'Atualizar lista de atividades'}</button>}
      {!timer&&!draft&&<div className="focus-footer"><button className="btn btn-secondary" onClick={requestClose}>Minimizar</button></div>}
      </div>}
    </Modal>}
  </>;
}
