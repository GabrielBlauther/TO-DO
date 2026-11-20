import {test,expect,beforeEach,afterEach} from 'bun:test';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDatabase} from './database';
import {createHandler} from './api';
import {pendingStatusTasks,restoreTaskStatus,TASK_STATUSES} from '../frontend/src/kanban';
import type {Task} from '../frontend/src/types';

let db:ReturnType<typeof createDatabase>,handle:ReturnType<typeof createHandler>;
beforeEach(()=>{db=createDatabase(':memory:');handle=createHandler(db);});
afterEach(()=>db.close());
async function request(path:string,method='GET',data?:unknown,key=crypto.randomUUID()){
  const res=await handle(new Request('http://localhost/api'+path,{method,headers:{'Content-Type':'application/json','X-Request-Key':key},...(data===undefined?{}:{body:JSON.stringify(data)})}));
  return {status:res.status,data:await res.json() as any};
}

test('quadro aceita as seis transições e preserva disciplina, prazo, comentários e planejamento',async()=>{
  const subject=(await request('/subjects','POST',{name:'Disciplina do quadro'})).data;
  const task=(await request('/tasks','POST',{title:'Mover entre colunas',description:'Preservar',subject_id:subject.id,priority_id:1,category_id:2,due_date:'2026-12-01'})).data;
  await request(`/tasks/${task.id}/comments`,'POST',{text:'Não apagar'});
  const planned=(await request(`/tasks/${task.id}/sessions`,'POST',{planned_date:'2026-11-20',start_time:null,duration_minutes:50})).data;
  for(const from of TASK_STATUSES)for(const to of TASK_STATUSES){
    if(from===to)continue;
    await request(`/tasks/${task.id}/status`,'PATCH',{status:from});
    const result=await request(`/tasks/${task.id}/status`,'PATCH',{status:to});
    expect(result.status).toBe(200);expect(result.data.status).toBe(to);
    for(const field of ['title','description','subject_id','category_id','priority_id','due_date','sessions'])expect(result.data[field]).toEqual(planned[field]);
    expect((await request(`/tasks/${task.id}/comments`)).data).toHaveLength(1);
  }
  const before=(await request('/tasks/'+task.id)).data;
  expect((await request(`/tasks/${task.id}/status`,'PATCH',{status:'outra'})).status).toBe(400);
  expect((await request('/tasks/'+task.id)).data).toEqual(before);
});

test('rollback altera somente a situação tentada e preserva atualizações independentes',async()=>{
  const task=(await request('/tasks','POST',{title:'Antes'})).data as Task;
  const other=(await request('/tasks','POST',{title:'Outra'})).data as Task;
  const changed={...task,status:'done' as const,title:'Título atualizado',description:'Descrição atualizada'};
  const restored=restoreTaskStatus([changed,other],task.id,'done','todo');
  expect(restored[0]).toEqual({...changed,status:'todo'});expect(restored[1]).toBe(other);
  expect(restoreTaskStatus([{...changed,status:'in_progress'},other],task.id,'done','todo')[0].status).toBe('in_progress');
  expect([...pendingStatusTasks([{url:`/tasks/${task.id}/status`,method:'PATCH'},{url:`/tasks/${task.id}/status`,method:'PATCH'},{url:'/tasks/999/sessions',method:'POST'},{url:'/subjects',method:'POST'}])]).toEqual([task.id]);
});

test('situação e recibo persistem após reiniciar; repetir a mudança retorna o mesmo resultado',async()=>{
  const file=join(mkdtempSync(join(tmpdir(),'kanban-status-')),'test.db');
  let disk=createDatabase(file),handler=createHandler(disk);
  const key=crypto.randomUUID();
  const change=()=>handler(new Request('http://localhost/api/tasks/1/status',{method:'PATCH',headers:{'Content-Type':'application/json','X-Request-Key':key},body:JSON.stringify({status:'done'})}));
  try{
    const saved=await (await change()).json();
    disk.close();disk=createDatabase(file);handler=createHandler(disk);
    expect((disk.query('SELECT status FROM tasks WHERE id=1').get() as any).status).toBe('done');
    expect(await (await change()).json()).toEqual(saved);
    expect(disk.query('SELECT * FROM mutation_receipts WHERE request_key=?').all(key)).toHaveLength(1);
  }finally{disk.close();}
});
