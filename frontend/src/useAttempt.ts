import {useRef,useState} from 'react';
import {UncertainError} from './api';

/** Retains the original operation until an uncertain response is reconciled. */
export function useAttempt(){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const [retry,setRetry]=useState<(()=>Promise<void>)|null>(null);
  const lock=useRef(false);
  async function run(operation:()=>Promise<void>){
    if(lock.current)return;
    lock.current=true;setBusy(true);setError('');
    const job=retry||operation;
    try{await job();setRetry(null);}
    catch(err){setError((err as Error).message);setRetry(err instanceof UncertainError?()=>job:null);}
    finally{lock.current=false;setBusy(false);}
  }
  return {busy,error,setError,uncertain:!!retry,run};
}
