import { useEffect, useId, useRef, useState, ReactNode } from 'react';

export default function Modal({ title, onClose, onConfirmClose, closeMessage, busy = false, children, large = false, fallbackFocusId,
  expanded, onExpandedChange, onMinimize, minimizeTitle }: {
  title: string; onClose: () => void; children: ReactNode; large?: boolean; fallbackFocusId?: string;
  onConfirmClose?:()=>void; closeMessage?:string; busy?:boolean;
  expanded?:boolean; onExpandedChange?:(expanded:boolean)=>void; onMinimize?:()=>void; minimizeTitle?:string;
}) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId();
  const exitTitleId=useId(),exitDescriptionId=useId();
  const [exitRequested,setExitRequested]=useState(false);
  const [localExpanded,setLocalExpanded]=useState(false);
  const isExpanded=expanded??localExpanded;
  function toggleExpanded(){
    const next=!isExpanded;
    if(onExpandedChange)onExpandedChange(next);else setLocalExpanded(next);
  }
  const continueRef=useRef<HTMLButtonElement>(null),closeRef=useRef<HTMLButtonElement>(null);
  const returnFocus=useRef<HTMLElement|null>(null),pointerOrigin=useRef<HTMLElement|null>(null),pointerOutside=useRef(false);
  function requestExit(origin=document.activeElement as HTMLElement|null){
    if(busy||exitRequested)return;
    returnFocus.current=origin;setExitRequested(true);
  }
  function continueHere(){
    setExitRequested(false);
    requestAnimationFrame(()=>{
      const previous=returnFocus.current;
      if(previous?.isConnected&&previous!==ref.current&&previous.getClientRects().length&&!previous.matches(':disabled'))previous.focus();
      else closeRef.current?.focus();
    });
  }
  function outside(x:number,y:number){
    const bounds=ref.current!.getBoundingClientRect();
    return x<bounds.left||x>bounds.right||y<bounds.top||y>bounds.bottom;
  }
  useEffect(()=>{
    if(exitRequested){ref.current!.scrollTop=0;continueRef.current?.focus();}
  },[exitRequested]);
  useEffect(() => {
    const dialog = ref.current!;
    const origin = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (origin?.isConnected) origin.focus();
      else if (fallbackFocusId) document.getElementById(fallbackFocusId)?.focus();
    };
  }, []);
  useEffect(()=>{
    const dialog=ref.current!;
    const observer=new MutationObserver(()=>{
      const alerts=Array.from(dialog.querySelectorAll<HTMLElement>('[role="alert"]'));
      const alert=alerts.reverse().find(el=>el.getClientRects().length&&el.textContent&&el.dataset.focusedText!==el.textContent);
      const dialogs=Array.from(document.querySelectorAll('dialog[open]'));
      if(!alert || dialog!==dialogs[dialogs.length-1])return;
      alert.dataset.focusedText=alert.textContent||'';alert.tabIndex=-1;
      requestAnimationFrame(()=>{if(alert.isConnected){alert.focus();alert.scrollIntoView({block:'nearest'});}});
    });
    observer.observe(dialog,{childList:true,subtree:true,characterData:true});
    return()=>observer.disconnect();
  },[]);
  return <dialog ref={ref} className={`modal ${large ? 'modal-large' : ''} ${isExpanded?'modal-expanded':''}`}
    role={exitRequested?'alertdialog':undefined} aria-labelledby={exitRequested?exitTitleId:titleId} aria-describedby={exitRequested?exitDescriptionId:undefined}
    onPointerDown={event=>{
      pointerOutside.current=event.target===event.currentTarget&&outside(event.clientX,event.clientY);
      pointerOrigin.current=pointerOutside.current?document.activeElement as HTMLElement|null:null;
    }}
    onClick={event=>{
      if(event.target===event.currentTarget&&pointerOutside.current&&outside(event.clientX,event.clientY))requestExit(pointerOrigin.current);
      pointerOutside.current=false;
    }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const elements = Array.from(ref.current!.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]'))
        .filter(el => !el.matches(':disabled') && el.tabIndex >= 0 && el.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if(!elements.includes(document.activeElement as HTMLElement)){event.preventDefault();(event.shiftKey?last:first).focus();}
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault();event.stopPropagation();if(exitRequested)continueHere();else requestExit(); }}>
    <div className="modal-header"><h2 id={titleId}>{title}</h2>
      <div className="modal-window-controls" role="group" aria-label={`Controles da janela ${title}`}>
        {onMinimize&&<button type="button" className="modal-window-control" aria-label={`Minimizar janela ${title}`} title={exitRequested?'Decida se deseja continuar ou sair do diálogo':minimizeTitle||'Minimizar janela'} disabled={busy||exitRequested} onClick={()=>{if(!busy&&!exitRequested)onMinimize();}}><span aria-hidden="true">−</span></button>}
        <button type="button" className="modal-window-control" aria-label={isExpanded?`Restaurar tamanho de ${title}`:`Expandir ${title}`} title={isExpanded?'Restaurar tamanho':'Expandir janela'} aria-pressed={isExpanded} onClick={toggleExpanded}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">{isExpanded?<><path d="M8 4h12v12"/><rect x="4" y="8" width="12" height="12" rx="1"/></>:<rect x="4" y="4" width="16" height="16" rx="1"/>}</svg>
        </button>
        <button ref={closeRef} type="button" className="modal-close" aria-label={`Fechar ${title}`} title="Fechar janela" disabled={busy} onClick={event=>{event.stopPropagation();requestExit();}}><span aria-hidden="true">×</span></button>
      </div>
    </div>
    <div hidden={exitRequested}>{children}</div>
    {exitRequested&&<section className="modal-exit-confirmation">
      <h3 id={exitTitleId}>Sair de “{title}”?</h3>
      <p id={exitDescriptionId} aria-live="polite">{closeMessage||'Deseja sair deste diálogo? Dados ainda não enviados poderão ser descartados. O que já foi salvo será mantido.'}</p>
      <div className="form-actions"><button ref={continueRef} type="button" className="btn btn-primary" onClick={continueHere}>Continuar aqui</button>
        <button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>{if(!busy)(onConfirmClose||onClose)();}}>Sair do diálogo</button></div>
    </section>}
    {busy&&<p className="help-text" role="status">Pedido em andamento. Aguarde o resultado antes de sair.</p>}
  </dialog>;
}
