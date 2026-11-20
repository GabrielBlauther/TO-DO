import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {timerText,type FocusTimer} from '../../../shared/focus';
import {boundPanel,cornerPosition,type PanelPosition,type PanelCorner} from '../focus-panel-position';

function viewport(){const v=window.visualViewport;return {left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||innerWidth,height:v?.height||innerHeight};}

export default function FocusPanel({visible,timer,now,taskName,message,error,onTogglePause,onRestore,focusOnShow}:{
  visible:boolean;timer:FocusTimer|null;now:number;taskName:string;message:string;error:string;onTogglePause:()=>void;onRestore:()=>void;focusOnShow:boolean;
}) {
  const ref=useRef<HTMLElement>(null),moveButton=useRef<HTMLButtonElement>(null);
  const [position,setPosition]=useState<PanelPosition|null>(null),[view,setView]=useState(viewport);
  const [movingOptions,setMovingOptions]=useState(false),[corner,setCorner]=useState<PanelCorner|'custom'>('bottom-right');
  const drag=useRef<{id:number;x:number;y:number;origin:PanelPosition;moved:boolean}|null>(null),ignoreClick=useRef(false);
  useEffect(()=>{if(visible&&position&&focusOnShow)document.getElementById('restore-focus-panel')?.focus();},[visible,!!position,focusOnShow]);
  useLayoutEffect(()=>{
    if(!visible)return;
    function fit(){
      const bounds=viewport();setView(bounds);
      const size=ref.current!.getBoundingClientRect();
      setPosition(old=>{
        const next=corner!=='custom'?cornerPosition(corner,size,bounds):old?boundPanel(old,size,bounds):cornerPosition('bottom-right',size,bounds);
        return old?.x===next.x&&old?.y===next.y?old:next;
      });
    }
    fit();const observer=new ResizeObserver(fit);observer.observe(ref.current!);
    window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);window.visualViewport?.addEventListener('scroll',fit);
    return()=>{observer.disconnect();window.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('resize',fit);window.visualViewport?.removeEventListener('scroll',fit);};
  },[visible,corner]);
  function move(next:PanelPosition){setPosition(boundPanel(next,ref.current!.getBoundingClientRect(),viewport()));setCorner('custom');}
  function finishOptions(){setMovingOptions(false);moveButton.current?.focus();}
  return <aside ref={ref} hidden={!visible} className="focus-panel" aria-label="Painel do Foco"
    style={{left:position?.x||0,top:position?.y||0,visibility:position?'visible':'hidden',maxWidth:Math.max(1,view.width-16),maxHeight:Math.max(1,view.height-16)}}
    onKeyDown={e=>{
      if(e.key==='Escape'&&drag.current){move(drag.current.origin);drag.current=null;ignoreClick.current=true;e.preventDefault();e.stopPropagation();}
      else if(e.key==='Escape'&&movingOptions){finishOptions();e.preventDefault();e.stopPropagation();}
    }}>
    <div className="focus-panel-heading"><button ref={moveButton} type="button" className="focus-panel-handle" aria-label="Mover painel do Foco" aria-expanded={movingOptions} aria-controls="focus-panel-position" title="Arraste para mover. Use as setas no teclado ou clique para escolher a posição."
      onClick={e=>{if(ignoreClick.current&&e.detail!==0){ignoreClick.current=false;return;}ignoreClick.current=false;setMovingOptions(v=>!v);}}
      onKeyDown={e=>{
        const directions:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
        if(directions[e.key]&&position){e.preventDefault();const [x,y]=directions[e.key],step=e.shiftKey?48:16;move({x:position.x+x*step,y:position.y+y*step});}
      }}
      onPointerDown={e=>{if(e.button!==0||!position)return;ignoreClick.current=false;drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,origin:position,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}}
      onPointerMove={e=>{const current=drag.current;if(!current||current.id!==e.pointerId)return;const x=e.clientX-current.x,y=e.clientY-current.y;
        if(Math.abs(x)+Math.abs(y)>4)current.moved=true;if(current.moved)move({x:current.origin.x+x,y:current.origin.y+y});}}
      onPointerUp={e=>{
        const current=drag.current;
        if(current&&e.pointerType==='touch'&&!current.moved){setMovingOptions(v=>!v);ignoreClick.current=true;}
        else if(current)ignoreClick.current=current.moved;
        drag.current=null;
      }}
      onPointerCancel={()=>{if(drag.current)move(drag.current.origin);drag.current=null;ignoreClick.current=true;}}
      onLostPointerCapture={()=>{drag.current=null;}}><span aria-hidden="true">⠿</span> Foco · mover</button>
      <span className="focus-panel-phase">{timer?timer.phase==='study'?'Estudo':'Pausa':'Preparação'}</span></div>
    <p className="focus-panel-task" title={taskName}>{taskName}</p>
    {timer&&<output className="focus-panel-clock" aria-label="Tempo restante no painel" aria-live="off">{timerText(timer,now)}</output>}
    <p id="focus-window-state" role="status" className="focus-panel-status">{message}</p>
    {error&&<p className="error-message" role="alert">{error}</p>}
    <div className="focus-panel-actions">
      {timer&&timer.status!=='finished'&&<button type="button" className="btn btn-primary" onClick={onTogglePause}>{timer.status==='running'?'Pausar':'Retomar'}</button>}
      <button id="restore-focus-panel" type="button" className={`btn ${timer&&timer.status!=='finished'?'btn-secondary':'btn-primary'}`} onClick={onRestore}>{timer?.status==='finished'?'Ver resultado':'Restaurar Foco'}</button>
    </div>
    {movingOptions&&<div id="focus-panel-position" className="focus-panel-position"><label htmlFor="focus-panel-corner">Posição do painel</label>
      <select id="focus-panel-corner" value={corner} onChange={e=>{const value=e.target.value as PanelCorner;setCorner(value);setPosition(cornerPosition(value,ref.current!.getBoundingClientRect(),viewport()));}}>
        {corner==='custom'&&<option value="custom" disabled>Posição ajustada manualmente</option>}
        <option value="top-left">Superior esquerda</option><option value="top-right">Superior direita</option><option value="bottom-left">Inferior esquerda</option><option value="bottom-right">Inferior direita</option>
      </select><p className="help-text">Arraste pelo título ou use as setas com o botão Mover painel em foco. Shift + seta move mais. Escape cancela um arraste ou fecha estas opções.</p><button type="button" className="btn btn-secondary" onClick={finishOptions}>Concluir posição</button></div>}
  </aside>;
}
