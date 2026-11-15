import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <Modal title="Confirmar exclusão" onClose={()=>{if(!busy)onCancel();}}>
    <p>{message}</p>{error && <p className="error-message" role="alert">{error}</p>}
    <div className="form-actions"><button className="btn btn-secondary" disabled={busy} onClick={onCancel}>Cancelar</button>
      <button className="btn btn-danger" disabled={busy} onClick={async()=>{
        if(busy)return;setBusy(true);setError('');try{await onConfirm();}catch(err){setError((err as Error).message);}finally{setBusy(false);}
      }}>{busy ? 'Excluindo…' : 'Excluir'}</button></div>
  </Modal>;
}
