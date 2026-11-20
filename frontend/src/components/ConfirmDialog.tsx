import {useAttempt} from '../useAttempt';
import Modal from './Modal';

export default function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => Promise<void>; onCancel: () => void;
}) {
  const {busy,error,uncertain,run}=useAttempt();
  return <Modal title="Confirmar exclusão" busy={busy} onClose={()=>{if(!busy)onCancel();}}
    closeMessage={uncertain?'A exclusão pode ter ocorrido. Sair não cancela o pedido enviado; verifique o resultado pelo aviso na tela principal.':'Deseja sair da confirmação de exclusão? O item será mantido; nenhuma exclusão será enviada ao sair.'}>
    <p>{message}</p>{error && <p className="error-message" role="alert">{error}</p>}
    <div className="form-actions"><button className="btn btn-secondary" disabled={busy} onClick={onCancel}>{uncertain?'Fechar e verificar depois':'Cancelar'}</button>
      <button className="btn btn-danger" disabled={busy} onClick={async()=>{
        void run(onConfirm);
      }}>{busy ? 'Excluindo…' : uncertain?'Verificar resultado':'Excluir'}</button></div>
  </Modal>;
}
