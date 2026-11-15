import { expect, test } from 'bun:test';
import { readTimer, readPending, writeTimer, writePending, TIMER_KEY } from '../frontend/src/focus-storage';
import { newCycle, type FocusRequest } from '../shared/focus';

function storage():Storage {
  const map=new Map<string,string>();
  return {getItem:k=>map.get(k)??null,setItem:(k,v)=>{map.set(k,v);},removeItem:k=>{map.delete(k);},clear:()=>map.clear(),key:i=>[...map.keys()][i]??null,get length(){return map.size;}};
}
test('recarregar recupera instante final e pausas, sem criar planejamento ou reiniciar ciclo',()=>{
  const store=storage(),timer=newCycle({key:'persist',task_id:1,session_id:2,minutes:25},'study',1000);
  writeTimer(store,timer);
  expect(readTimer(store,61000)?.deadline).toBe(timer.deadline);
  expect(readTimer(store,timer.deadline+1)?.status).toBe('finished');
  writeTimer(store,{...timer,status:'paused',remainingMs:30000});
  expect(readTimer(store,9999999)?.remainingMs).toBe(30000);
  writeTimer(store,null);expect(readTimer(store)).toBeNull();
});
test('pedido pendente é recuperado com mesma chave e escolhas para repetir sem duplicar',()=>{
  const store=storage();const pending:FocusRequest={key:'same-pending-key',task_id:1,origin:null,action:'new',current:{planned_date:'2026-11-15',start_time:null,duration_minutes:90},previous:null,minutes:25,confirm_after_due:false};
  writePending(store,pending);expect(readPending(store)).toEqual(pending);
  writePending(store,null);expect(readPending(store)).toBeNull();
});
test('armazenamento inválido ou indisponível não simula recuperação bem-sucedida',()=>{
  const store=storage();store.setItem(TIMER_KEY,'{}');expect(()=>readTimer(store)).toThrow('inválido');
  store.setItem(TIMER_KEY,'invalid-json');expect(()=>readTimer(store)).toThrow();
  const blocked={...store,setItem:()=>{throw new Error('Quota');}};
  expect(()=>writePending(blocked,{} as FocusRequest)).toThrow('Quota');
});
