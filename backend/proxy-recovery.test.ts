import {test,expect} from 'bun:test';
import {fileURLToPath} from 'node:url';
import {createServer} from '../frontend/node_modules/vite';
import {createDatabase} from './database';
import {createHandler} from './api';
import * as api from '../frontend/src/api';

test('cadastro e recuperação atravessam o proxy real do Vite, que intercepta OPTIONS',async()=>{
  const db=createDatabase(':memory:');
  const backend=Bun.serve({port:0,hostname:'127.0.0.1',fetch:createHandler(db)});
  const vite=await createServer({
    configFile:false,root:fileURLToPath(new URL('../frontend',import.meta.url)),
    appType:'custom',logLevel:'silent',optimizeDeps:{noDiscovery:true,include:[]},
    server:{host:'127.0.0.1',port:0,proxy:{'/api':{target:`http://127.0.0.1:${backend.port}`,changeOrigin:true}}},
  });
  const original={fetch:globalThis.fetch,window:globalThis.window,storage:globalThis.sessionStorage};
  let lost=false;
  const requests:{path:string;method:string}[]=[];
  const values=new Map<string,string>();
  try{
    await vite.listen();
    const address=vite.httpServer!.address();
    if(!address||typeof address==='string')throw new Error('Vite sem porta TCP');
    const base=`http://127.0.0.1:${address.port}`;
    const preflight=await original.fetch(base+'/api/tasks',{method:'OPTIONS'});
    expect(preflight.status).toBe(204);expect(preflight.headers.get('X-Write-Recovery')).toBeNull();
    const capabilities=await original.fetch(base+'/api/categories');
    expect(capabilities.status).toBe(200);expect(capabilities.headers.get('X-Write-Recovery')).toBe('1');
    Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:(k:string)=>values.get(k)||null,setItem:(k:string,v:string)=>values.set(k,v)}});
    Object.defineProperty(globalThis,'window',{configurable:true,value:new EventTarget()});
    globalThis.fetch=(async(url:string,options:RequestInit)=>{
      requests.push({path:url,method:options.method||'GET'});
      const response=await original.fetch(new URL(url,base),options);
      if(lost&&options.method==='POST'){lost=false;throw new TypeError('resposta perdida após commit através do proxy');}
      return response;
    }) as typeof fetch;
    const subject=await api.createSubject('Disciplina de teste do proxy');
    expect(subject.name).toBe('Disciplina de teste do proxy');expect(api.pendingMutations()).toHaveLength(0);
    expect(requests[0]).toEqual({path:'/api/categories',method:'GET'});
    expect(requests.some(r=>r.method==='OPTIONS')).toBe(false);
    lost=true;
    await expect(api.createSubject('Resposta perdida no proxy')).rejects.toThrow('pode ter sido salvo');
    expect(api.pendingMutations()).toHaveLength(1);
    await api.retryMutation(api.pendingMutations()[0]);
    expect(db.query('SELECT * FROM subjects WHERE name=?').all('Resposta perdida no proxy')).toHaveLength(1);
    expect(api.pendingMutations()).toHaveLength(0);
  }finally{
    globalThis.fetch=original.fetch;
    Object.defineProperty(globalThis,'window',{configurable:true,value:original.window});
    Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:original.storage});
    await vite.close();backend.stop(true);db.close();
  }
},15000);
