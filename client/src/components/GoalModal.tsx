import { useState } from 'react';
import { Goal } from '../types';
import { Strings } from '../utils/i18n';

const COLOR_OPTIONS = [
  "#e85d3a", "#f0944d", "#e8b84b", "#e85d7a",
  "#2eaa72", "#45c48a", "#6dd49a", "#3a9e5a",
  "#4a7fc4", "#6b9fe0", "#8b7ee0", "#b0a6e8",
  "#2ab8a8", "#45d4c2", "#4ab8d4", "#6acce0",
  "#d45a8a", "#e07ab0", "#c45ac4", "#a45ae0",
  "#8a6a4a", "#b08a6a", "#c2674e", "#9e6b5f",
];

const EMOJI_OPTIONS = ["🛡️", "✈️", "💻", "🏠", "🚗", "🎓", "💍", "🏥", "🚀", "🌟", "🎸", "🏖️"];

interface Props {
  initial: Goal | null;
  t: Strings;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
}

export function GoalModal({ initial, t, onClose, onSave }: Props) {
  const [name, setName] = useState(initial?.name || "");
  const [target, setTarget] = useState(initial?.target?.toString() || "");
  const [saved, setSaved] = useState(initial?.saved?.toString() || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [icon, setIcon] = useState(initial?.icon || "🎯");
  const [color, setColor] = useState(initial?.color || COLOR_OPTIONS[4]);

  function save() {
    if (!name || !target) return;
    onSave({ 
      id: initial?.id, 
      name, 
      target: parseInt(target), 
      saved: saved ? parseInt(saved) : 0, 
      deadline: deadline || null, 
      icon, 
      color 
    });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editGoal : t.newGoal}</div>
        
        <div className="field">
          <label className="field-label">{t.goalName}</label>
          <input className="field-input" type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
        
        <div className="field-row">
          <div className="field">
            <label className="field-label">{t.target}</label>
            <input className="field-input" type="number" value={target} onChange={e => setTarget(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">{t.saved}</label>
            <input className="field-input" type="number" value={saved} onChange={e => setSaved(e.target.value)} />
          </div>
        </div>

        <div className="field">
          <label className="field-label">{t.deadline}</label>
          <input className="field-input" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label">{t.goalIcon}</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} className={`emoji-opt ${icon === e ? "on" : ""}`} onClick={() => setIcon(e)}>{e}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">{t.goalColor}</label>
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
