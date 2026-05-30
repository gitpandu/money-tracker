import { Ico } from './icons';
import { BudgetCycle } from '../types';

interface Props {
  title: string;
  showCycleSelector?: boolean;
  cycles: BudgetCycle[];
  activeCycleId: string;
  onCycleChange: (id: string) => void;
}

export function Topbar({ title, showCycleSelector, cycles, activeCycleId, onCycleChange }: Props) {
  return (
    <div className="topbar">
      <div className="topbar-row1">
        <div>
          <div className="topbar-title">{title}</div>
        </div>
      </div>

      {showCycleSelector && (
        <div className="select-wrap">
          <select className="field-input" value={activeCycleId} onChange={(e) => onCycleChange(e.target.value)} style={{ width: "100%" }}>
            {cycles.map((c) => (<option key={c.id} value={c.id}> {c.label} </option>))}
          </select>
          <div className="select-arrow">{Ico.chevron}</div>
        </div>
      )}
    </div>
  );
}
