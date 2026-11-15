import {test,expect} from 'bun:test';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createDatabase} from './database';
import {createHandler} from './api';

test('recibos persistem e repetir criação, comentário, sessão e exclusão não duplica efeitos',async()=>{
  const file=join(mkdtempSync(join(tmpdir(),'ihc-recovery-')),'test.db');
  let db=createDatabase(file),handle=createHandler(db);
  async function send(path:string,method:string,body?:unknown,key=crypto.randomUUID()){
    const response=await handle(new Request('http://localhost/api'+path,{method,headers:{'Content-Type':'application/json','X-Request-Key':key},...(body===undefined?{}:{body:JSON.stringify(body)})}));
    return {status:response.status,data:await response.json() as any};
  }
  try{
    const key=crypto.randomUUID(),data={title:'Preservar após resposta perdida'};
    const first=await send('/tasks','POST',data,key);
    db.close();db=createDatabase(file);handle=createHandler(db);
    expect(await send('/tasks','POST',data,key)).toEqual(first);
    expect(db.query('SELECT * FROM tasks WHERE title=?').all(data.title)).toHaveLength(1);
    expect((await send('/tasks','POST',{title:'outro'},key)).status).toBe(409);
    const id=first.data.id;
    for(const [path,body] of [[`/tasks/${id}/comments`,{text:'Anotação'}],[`/tasks/${id}/sessions`,{planned_date:'2026-11-15',start_time:null,duration_minutes:50}]] as const){
      const k=crypto.randomUUID(),result=await send(path,'POST',body,k);
      expect(result.status).toBe(201);expect(await send(path,'POST',body,k)).toEqual(result);
    }
    expect(db.query('SELECT * FROM comments WHERE task_id=?').all(id)).toHaveLength(1);
    expect(db.query('SELECT * FROM study_sessions WHERE task_id=?').all(id)).toHaveLength(1);
    const deletion=crypto.randomUUID();expect((await send('/tasks/'+id,'DELETE',undefined,deletion)).status).toBe(200);
    expect((await send('/tasks/'+id,'DELETE',undefined,deletion)).data).toEqual({success:true});
    expect(db.query('SELECT * FROM comments WHERE task_id=?').all(id)).toHaveLength(0);
  }finally{db.close();}
});

test('validação e falha de armazenamento do recibo revertem a mutação inteira',async()=>{
  const db=createDatabase(':memory:'),handle=createHandler(db);
  const key=crypto.randomUUID();
  const send=(title:string)=>handle(new Request('http://localhost/api/tasks',{method:'POST',headers:{'Content-Type':'application/json','X-Request-Key':key},body:JSON.stringify({title})}));
  try{
    expect((await send('')).status).toBe(400);
    expect(db.query('SELECT * FROM mutation_receipts').all()).toHaveLength(0);
    db.exec("CREATE TRIGGER fail_receipt BEFORE INSERT ON mutation_receipts BEGIN SELECT RAISE(ABORT,'falha simulada'); END");
    expect((await send('Não persistir metade')).status).toBe(500);
    expect(db.query('SELECT * FROM tasks WHERE title=?').all('Não persistir metade')).toHaveLength(0);
    db.exec('DROP TRIGGER fail_receipt');
    expect((await send('Correção após falha')).status).toBe(201);
  }finally{db.close();}
});
