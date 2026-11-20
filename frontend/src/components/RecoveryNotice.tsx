import {useEffect,useState} from 'react';
import * as api from '../api';

export default function RecoveryNotice({onRecovered}:{onRecovered:()=>Promise<void>}){
  const [items,setItems]=useState<api.PendingMutation[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{
    const refresh=()=>{try{setItems(api.pendingMutations());}catch(err){setError((err as Error).message);}};
    refresh();window.addEventListener('todo-mutations',refresh);return()=>window.removeEventListener('todo-mutations',refresh);
  },[]);
  if(!items.length&&!error)return null;
  return <aside className="warning-message page-message" aria-label="Pedidos aguardando confirmação">
    {items.length>0&&<><h2>Confira os pedidos sem confirmação</h2>
      <p>Uma gravação pode ter ocorrido. Não repita a alteração por outro caminho: verifique o mesmo pedido abaixo. Fechar um formulário não cancela uma requisição já enviada.</p>
      <ul>{items.map(item=><li key={item.key}>{item.label} <button className="btn btn-secondary" disabled={busy} onClick={async()=>{
        setBusy(true);setError('');try{await api.retryMutation(item);await onRecovered();}catch(err){setError((err as Error).message);}finally{setBusy(false);}
      }}>{busy?'Verificando…':'Verificar resultado'}</button></li>)}</ul></>}
    {error&&<p role="alert" className="error-message">{error}</p>}
  </aside>;
}
