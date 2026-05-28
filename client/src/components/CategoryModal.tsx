import { useState } from 'react';
import { Category } from '../types';
import { Strings } from '../utils/i18n';
import { Ico } from './icons';

const EMOJI_OPTIONS = ["🍜", "🍽️", "🚗", "🏠", "💼", "💻", "🏥", "📚", "🎮", "✈️", "👗", "💊", "🐾", "🎁", "🏋️", "☕", "🍕", "🛍️", "🎵", "📱", "🏦", "🎓", "🌿", "🧴", "🛒", "🛡️", "🎯", "🏖️", "💍", "🚀", "🌟", "🎸"];
const COLOR_OPTIONS = [
  "#e85d3a", "#f0944d", "#e8b84b", "#e85d7a",
  "#2eaa72", "#45c48a", "#6dd49a", "#3a9e5a",
  "#4a7fc4", "#6b9fe0", "#8b7ee0", "#b0a6e8",
  "#2ab8a8", "#45d4c2", "#4ab8d4", "#6acce0",
  "#d45a8a", "#e07ab0", "#c45ac4", "#a45ae0",
  "#8a6a4a", "#b08a6a", "#c2674e", "#9e6b5f",
];

interface Props {
  initial: Category | null;
  categories: Category[];
  t: Strings;
  onClose: () => void;
  onSave: (cat: Partial<Category>) => void;
}

export function CategoryModal({ initial, categories, t, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState<"income" | "expense">(initial?.type || "expense");
  const [icon, setIcon] = useState(initial?.icon || "🛒");
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[0]);
  const [parentId, setPar] = useState(initial?.parent_id?.toString() || "");

  const parentOpts = categories.filter(c => c.type === type && !c.parent_id && c.id !== initial?.id);
  const isSub = !!parentId;

  function save() {
    if (!name) return;
    onSave({ 
      id: initial?.id, 
      name, 
      type, 
      icon: isSub ? null : icon, 
      color, 
      parent_id: parentId ? parseInt(parentId) : null 
    });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editCategory : t.addCategory}</div>
        
        <div className="field">
          <div className="type-toggle">
            <button className={`type-btn inc ${type === "income" ? "on" : ""}`} onClick={() => { setType("income"); setPar(""); }}>{t.income}</button>
            <button className={`type-btn exp ${type === "expense" ? "on" : ""}`} onClick={() => { setType("expense"); setPar(""); }}>{t.expense}</button>
          </div>
        </div>

        <div className="field">
          <label className="field-label">{t.parent}</label>
          <div className="select-wrap">
            <select className="field-input" value={parentId} onChange={e => setPar(e.target.value)}>
              <option value="">{t.noneTopLevel}</option>
              {parentOpts.map(p => <option key={p.id} value={p.id}>{p.icon || ""} {p.name}</option>)}
            </select>
            <div className="select-arrow">{Ico.chevron}</div>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Name</label>
          <input className="field-input" type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>

        {!isSub && (
          <div className="field">
            <label className="field-label">{t.icon}</label>
            <div className="emoji-grid">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} className={`emoji-opt ${icon === e ? "on" : ""}`} onClick={() => setIcon(e)}>{e}</button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <label className="field-label">{isSub ? t.accentColor : t.color}</label>
          <div className="color-grid">
            {COLOR_OPTIONS.map(c => (
              <button key={c} className={`color-sw ${color === c ? "on" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}
