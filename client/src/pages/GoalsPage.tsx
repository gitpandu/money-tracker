import { useState } from 'react';
import { Goal } from '../types';
import { Strings } from '../utils/i18n';
import { GoalCard } from '../components/GoalCard';
import { GoalModal } from '../components/GoalModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  goals: Goal[];
  t: Strings;
  onSaveGoal: (goal: Partial<Goal>) => void;
  onDeleteGoal: (id: number) => void;
  onContribute: (id: number, amount: number) => void;
}

export function GoalsPage({ goals, t, onSaveGoal, onDeleteGoal, onContribute }: Props) {
  const [modal, setModal] = useState<{ mode: 'add' | 'edit', goal?: Goal } | null>(null);
  const [confirm, setConfirm] = useState<Goal | null>(null);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span className="section-lbl" style={{ margin: 0 }}>{t.goalsTitle}</span>
        <button className="add-btn" onClick={() => setModal({ mode: "add" })}>{t.addCat}</button>
      </div>

      {goals.length === 0 && <div className="empty-state">{t.noGoals}</div>}

      {goals.map(g => (
        <GoalCard
          key={g.id}
          goal={g}
          t={t}
          onEdit={(goal) => setModal({ mode: 'edit', goal })}
          onDelete={(id) => setConfirm(g)}
          onContribute={onContribute}
        />
      ))}

      {modal && (
        <GoalModal
          initial={modal.mode === "edit" ? modal.goal || null : null}
          t={t}
          onClose={() => setModal(null)}
          onSave={g => { onSaveGoal(g); setModal(null); }}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={t.deleteConfirmTitle(confirm.name)}
          body={""}
          t={t}
          onClose={() => setConfirm(null)}
          onConfirm={() => { onDeleteGoal(confirm.id); setConfirm(null); }}
        />
      )}
    </div>
  );
}
