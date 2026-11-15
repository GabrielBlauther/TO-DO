import { useEffect, useId, useRef, ReactNode } from 'react';

export default function Modal({ title, onClose, children, large = false, fallbackFocusId }: {
  title: string; onClose: () => void; children: ReactNode; large?: boolean; fallbackFocusId?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const origin = document.activeElement as HTMLElement | null;
    dialog.showModal();
    return () => {
      dialog.close();
      if (origin?.isConnected) origin.focus();
      else if (fallbackFocusId) document.getElementById(fallbackFocusId)?.focus();
    };
  }, []);
  return <dialog ref={ref} className={`modal ${large ? 'modal-large' : ''}`} aria-labelledby={titleId}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const elements = Array.from(ref.current!.querySelectorAll<HTMLElement>('button, input, select, textarea, [tabindex]'))
        .filter(el => !el.matches(':disabled') && el.tabIndex >= 0 && el.getClientRects().length > 0);
      const first = elements[0], last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <h2 id={titleId}>{title}</h2>
    {children}
  </dialog>;
}
