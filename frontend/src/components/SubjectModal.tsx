import { useState } from 'react';
import Modal from './Modal';
import { Subject } from '../types';
import { createSubject } from '../api';
import {useAttempt} from '../useAttempt';

export default function SubjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (subject: Subject) => void }) {
  const [name, setName] = useState('');
  const {error,busy,uncertain,run}=useAttempt();
  return <Modal title="Cadastrar disciplina" onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={async event => {
      event.preventDefault();await run(async()=>{onCreated(await createSubject(name));onClose();});
    }}><fieldset disabled={busy||uncertain}>
      <div className="form-group"><label htmlFor="subject-name">Nome da disciplina *</label>
        <input id="subject-name" value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
    </fieldset>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>{uncertain?'Fechar e verificar depois':'Cancelar'}</button>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : uncertain?'Verificar resultado':'Cadastrar disciplina'}</button></div>
    </form>
  </Modal>;
}
