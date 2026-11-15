import { useState } from 'react';
import Modal from './Modal';
import { Subject } from '../types';
import { createSubject } from '../api';

export default function SubjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (subject: Subject) => void }) {
  const [name, setName] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  return <Modal title="Cadastrar disciplina" onClose={() => { if (!busy) onClose(); }}>
    <form onSubmit={async event => {
      event.preventDefault(); if (busy) return; setError(''); setBusy(true);
      try { onCreated(await createSubject(name)); onClose(); }
      catch (err) { setError((err as Error).message); } finally { setBusy(false); }
    }}><fieldset disabled={busy}>
      <div className="form-group"><label htmlFor="subject-name">Nome da disciplina *</label>
        <input id="subject-name" value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
      {error && <p role="alert" className="error-message">{error}</p>}
      <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy}>Cancelar</button>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando…' : 'Cadastrar disciplina'}</button></div>
    </fieldset></form>
  </Modal>;
}
