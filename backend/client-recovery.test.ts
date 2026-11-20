import {test,expect} from 'bun:test';
import {createDatabase} from './database';
import {createHandler} from './api';
import * as api from '../frontend/src/api';

test('cliente conserva o mesmo pedido após resposta perdida e permite verificar depois de fechar o formulário',async()=>{
  const db=createDatabase(':memory:'),handler=createHandler(db);
  const saved={fetch:globalThis.fetch,window:globalThis.window,storage:globalThis.sessionStorage};
  const values=new Map<string,string>();
  Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v)}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
  let lost=true;
  globalThis.fetch=(async(url:string,options:RequestInit)=>{
    const response=await handler(new Request('http://localhost'+url,options));
    if(lost&&['POST','PUT','PATCH','DELETE'].includes(options.method||'GET')){lost=false;throw new TypeError('simulação de perda depois do commit');}
    return response;
  }) as typeof fetch;
  try{
    await expect(api.createTask({title:'Pedido preservado',description:'Rascunho',subject_id:null,category_id:1,priority_id:2,due_date:null})).rejects.toThrow('pode ter sido salvo');
    const [pending]=api.pendingMutations();expect(pending.body).toContain('Rascunho');
    const result=await api.retryMutation(pending) as {id:number};
    expect(result.id).toBeGreaterThan(0);expect(api.pendingMutations()).toHaveLength(0);
    expect(db.query('SELECT * FROM tasks WHERE title=?').all('Pedido preservado')).toHaveLength(1);
    lost=true;await expect(api.addComment(result.id,'Repetição segura')).rejects.toThrow('resultado');
    const comment=await api.addComment(result.id,'Repetição segura');expect(comment.text).toBe('Repetição segura');
    expect(db.query('SELECT * FROM comments WHERE task_id=?').all(result.id)).toHaveLength(1);
    // A later deliberate identical comment remains possible after confirmation.
    await api.addComment(result.id,'Repetição segura');expect(db.query('SELECT * FROM comments WHERE task_id=?').all(result.id)).toHaveLength(2);
    lost=true;await expect(api.updateTaskStatus(result.id,'done')).rejects.toThrow('pode ter sido salvo');
    expect(api.pendingMutations()[0].label).toContain('para Concluída');
    await api.retryMutation(api.pendingMutations()[0]);
    expect((db.query('SELECT status FROM tasks WHERE id=?').get(result.id) as any).status).toBe('done');
    await expect(api.createSubject('')).rejects.toThrow('não foi aplicado');expect(api.pendingMutations()).toHaveLength(0);
    const working=globalThis.fetch;
    globalThis.fetch=(async()=>new Response(null,{status:204})) as typeof fetch;
    await expect(api.createSubject('Servidor anterior')).rejects.toThrow('não confirmou suporte');
    expect(db.query('SELECT * FROM subjects WHERE name=?').all('Servidor anterior')).toHaveLength(0);
    globalThis.fetch=working;
    values.set('todo.mutations.pending.v1','corrompido');
    await expect(api.createSubject('Não enviar')).rejects.toThrow();expect(db.query('SELECT * FROM subjects WHERE name=?').all('Não enviar')).toHaveLength(0);
  }finally{
    globalThis.fetch=saved.fetch;
    Object.defineProperty(globalThis,'window',{configurable:true,value:saved.window});
    Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:saved.storage});db.close();
  }
});
