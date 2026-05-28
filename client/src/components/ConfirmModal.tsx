import { Strings } from '../utils/i18n';

interface Props {
  title: string;
  body: string;
  t: Strings;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({ title, body, t, onClose, onConfirm }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{title}</div>
        <p style={{ fontSize: 14, color: "var(--ink2)", marginBottom: 20, lineHeight: 1.5 }}>{body}</p>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{t.delete}</button>
        </div>
      </div>
    </div>
  );
}
