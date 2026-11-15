import { beforeEach, afterEach, expect, test } from 'bun:test';
import { createDatabase } from './database';
import { createHandler } from './api';
import { confirmFocus } from './focus';
import { snapshot, suggestFocus, freeSlot, newCycle, remaining, changeTimer, recoverTimer, validMinutes, type FocusRequest } from '../shared/focus';
import type { Task } from '../frontend/src/types';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let db: ReturnType<typeof createDatabase>;
let handle: ReturnType<typeof createHandler>;
let tasks: Task[];
beforeEach(async()=>{
  db=createDatabase(':memory:');handle=createHandler(db);
  db.exec('DELETE FROM tasks');
  db.exec(`INSERT INTO tasks(id,title,priority_id,category_id,due_date) VALUES(101,'Cálculo',2,1,'2026-11-15'),(102,'Programação',1,1,'2026-11-20');
    INSERT INTO study_sessions(id,task_id,planned_date,start_time,duration_minutes) VALUES(201,101,'2026-11-15','10:00',60),(202,101,'2026-11-16',NULL,90);`);
  tasks=await (await handle(new Request('http://test/api/tasks'))).json() as Task[];
});
afterEach(()=>db.close());
const origin=()=>snapshot(db.query('SELECT * FROM study_sessions WHERE id=201').get() as any);
const rows=()=>db.query('SELECT * FROM study_sessions ORDER BY id').all() as any[];
function body(action: FocusRequest['action']='keep'):FocusRequest {
  return {key:crypto.randomUUID(),task_id:102,origin:origin(),action,minutes:25,confirm_after_due:false,current:null,
    previous:action==='reschedule'?{planned_date:'2026-11-15',start_time:'11:00',duration_minutes:60}:null};
}
async function post(data:any) {
  const r=await handle(new Request('http://test/api/focus/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}));
  return {status:r.status,data:await r.json() as any};
}
test('sugestão prioriza sessão em andamento, próxima, passada, sem horário; exclui concluídas',()=>{
  expect(suggestFocus(tasks,'2026-11-15','10:30')?.task.id).toBe(101);
  const others=tasks.map(t=>({...t,sessions:t.id===102?[{id:300,task_id:102,planned_date:'2026-11-15',start_time:'11:30',duration_minutes:30}]:t.sessions}));
  expect(suggestFocus(others,'2026-11-15','11:00')?.task.id).toBe(102);
  expect(suggestFocus(others.map(t=>({...t,status:t.id===101?'done':'todo'})) as Task[],'2026-11-15','10:30')?.task.id).toBe(102);
  expect(suggestFocus(tasks,'2026-11-15','12:30')?.task.id).toBe(101);
  expect(suggestFocus(tasks,'2026-11-16','12:30')?.session?.id).toBe(202);
});
test('sem sessão de hoje: vencidas antes das futuras, com desempates determinísticos e escolha manual',()=>{
  expect(suggestFocus(tasks,'2026-11-18','09:00')?.task.id).toBe(101);
  expect(suggestFocus(tasks,'2026-11-14','09:00')?.task.id).toBe(101);
  expect(suggestFocus(tasks.map(t=>({...t,due_date:null,sessions:[]})),'2026-11-18','09:00')).toBeNull();
  const tied=tasks.map(t=>({...t,due_date:'2026-11-20',priority_level:2,sessions:[]}));
  expect(suggestFocus(tied.reverse(),'2026-11-18','09:00')?.task.id).toBe(101);
});
test('horário livre considera intervalos cadastrados e o slot substituído, sem supor disponibilidade',()=>{
  const slot=freeSlot(tasks,origin(),'2026-11-15','10:30');
  expect(slot).toEqual({planned_date:'2026-11-15',start_time:'11:00',duration_minutes:60});
  expect(freeSlot(tasks,{...origin(),duration_minutes:721},'2026-11-15','10:30')).toBeNull();
});
test('mesma atividade e manter planejamento não criam nem alteram sessões',()=>{
  const before=rows();
  const direct=body('same');direct.task_id=101;
  expect(confirmFocus(db,direct).session_id).toBe(201);
  expect(confirmFocus(db,body()).session_id).toBeNull();
  expect(rows()).toEqual(before);
});
test('reagendar preserva identificador, outras sessões, atividades e prazos; novo estudo usa slot original',()=>{
  const result=confirmFocus(db,body('reschedule'));
  expect(result.session_id).not.toBe(201);
  expect(rows().find(s=>s.id===201)?.start_time).toBe('11:00');
  expect(rows().find(s=>s.id===202)?.planned_date).toBe('2026-11-16');
  expect(rows().find(s=>s.id===result.session_id)).toMatchObject({task_id:102,start_time:'10:00',duration_minutes:60});
  expect(db.query('SELECT id,due_date FROM tasks ORDER BY id').all()).toEqual([{id:101,due_date:'2026-11-15'},{id:102,due_date:'2026-11-20'}]);
});
test('deixar sem data remove somente a sessão substituída e preserva outras datas da atividade',()=>{
  confirmFocus(db,body('unplan'));
  expect(rows().some(s=>s.id===201)).toBe(false);
  expect(rows().find(s=>s.id===202)?.task_id).toBe(101);
  expect(db.query('SELECT * FROM tasks').all()).toHaveLength(2);
});
test('confirmação repetida retorna recibo, inclusive após origem removida, sem duplicar; chave diferente de pedido rejeitada',()=>{
  const request=body('unplan'),first=confirmFocus(db,request),before=rows();
  expect(confirmFocus(db,JSON.parse(JSON.stringify(request)))).toEqual(first);
  expect(rows()).toEqual(before);
  expect(()=>confirmFocus(db,{...request,minutes:30})).toThrow('outras escolhas');
});
test('recibo e planejamento persistem ao reabrir o banco e repetir após reinicialização',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'todo-focus-')),'test.db');
  let disk=createDatabase(path);
  const request:FocusRequest={key:crypto.randomUUID(),task_id:1,origin:null,action:'new',minutes:25,confirm_after_due:true,current:{planned_date:'2026-11-15',start_time:null,duration_minutes:90},previous:null};
  const result=confirmFocus(disk,request);disk.close();disk=createDatabase(path);
  expect(confirmFocus(disk,request)).toEqual(result);
  expect(disk.query('SELECT * FROM study_sessions').all()).toHaveLength(1);
  expect(disk.query('SELECT * FROM focus_confirmations').all()).toHaveLength(1);
  disk.close();
});
test('conflitos inclusive entre reagendamento e substituição revertem todas as gravações',()=>{
  const before=rows(),request=body('reschedule');request.previous!.start_time='10:30';
  expect(()=>confirmFocus(db,request)).toThrow('Conflito');
  expect(rows()).toEqual(before);
  expect(db.query('SELECT * FROM focus_confirmations').all()).toEqual([]);
});
test('falha na segunda gravação faz rollback da primeira e permite repetir com a mesma chave',()=>{
  const request=body('reschedule'),before=rows();
  db.exec("CREATE TRIGGER fail_focus BEFORE INSERT ON study_sessions BEGIN SELECT RAISE(ABORT,'Falha simulada'); END;");
  expect(()=>confirmFocus(db,request)).toThrow('Falha simulada');expect(rows()).toEqual(before);
  expect(db.query('SELECT * FROM focus_confirmations').all()).toEqual([]);
  db.exec('DROP TRIGGER fail_focus');expect(confirmFocus(db,request).task_id).toBe(102);
});
test('origem alterada exige revisão, e atividade concluída não pode iniciar',async()=>{
  const request=body();db.exec("UPDATE study_sessions SET start_time='09:00' WHERE id=201");
  expect((await post(request)).status).toBe(409);
  db.exec("UPDATE tasks SET status='done' WHERE id=102");expect((await post(body())).status).toBe(409);
});
test('inclusão sem origem valida intervalo, duração, limite do ciclo e aviso após prazo',async()=>{
  const request:FocusRequest={...body('new'),origin:null,current:{planned_date:'2026-11-21',start_time:'09:00',duration_minutes:90}};
  expect((await post(request)).status).toBe(422);
  expect(rows()).toHaveLength(2);
  expect((await post({...request,confirm_after_due:true})).status).toBe(200);
  expect((await post({...request,key:crypto.randomUUID(),confirm_after_due:true})).status).toBe(409);
  expect((await post({...request,minutes:181})).status).toBe(400);
  expect((await post({...request,origin:{id:'x'}})).status).toBe(400);
});
test('reagendamento após prazo exige confirmação e preserva prazo quando aceito',()=>{
  const request=body('reschedule');request.previous!.planned_date='2026-11-17';
  expect(()=>confirmFocus(db,request)).toThrow('após o prazo');expect(rows()).toHaveLength(2);
  confirmFocus(db,{...request,confirm_after_due:true});
  expect((db.query('SELECT due_date FROM tasks WHERE id=101').get() as any).due_date).toBe('2026-11-15');
});
test('timer usa instante final; pausa/retomada e recuperação não reiniciam nem concluem atividades',()=>{
  const result={key:'test',task_id:101,session_id:201,minutes:25};
  const t=newCycle(result,'study',1000);
  expect(remaining(t,61000)).toBe(24*60000);
  const paused=changeTimer(t,'pause',61000);
  expect(remaining(paused,9000000)).toBe(24*60000);
  expect(recoverTimer(JSON.parse(JSON.stringify(paused)),9000000)).toEqual(paused);
  const resumed=changeTimer(paused,'resume',100000);
  expect(remaining(resumed,160000)).toBe(23*60000);
  expect(recoverTimer(resumed,resumed.deadline+1)?.status).toBe('finished');
  expect(changeTimer(resumed,'pause',resumed.deadline+1).status).toBe('finished');
  expect(newCycle(result,'break',0).totalMs).toBe(5*60000);
  expect(changeTimer(t,'end',5000).endedEarly).toBe(true);
  expect(recoverTimer({},0)).toBeNull();
  for (const n of [0,181,-1,2.5])expect(validMinutes(n)).toBe(false);
  expect(rows()).toHaveLength(2);
});
