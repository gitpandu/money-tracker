import { Ico } from './icons';
import { BudgetCycle } from '../types';
import { Strings } from '../utils/i18n';

interface Props {
  tabs: string[];
  tabIcons: Record<string, keyof typeof Ico>;
  tabLabels: Record<string, string>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeCycle?: BudgetCycle;
  t: Strings;
}

export function Sidebar({ tabs, tabIcons, tabLabels, activeTab, onTabChange, activeCycle, t }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">Money <span>Tracker</span></div>
      {tabs.map(id => (
        <button key={id} className={`sidebar-nav-item ${activeTab === id ? "active" : ""}`} onClick={() => onTabChange(id)}>
          {Ico[tabIcons[id]]} {tabLabels[id]}
        </button>
      ))}
      <div className="sidebar-cycle">
        {activeCycle?.label}<br />
        <span style={{ color: "var(--sage)" }}>● {t.cycleActive}</span>
      </div>
    </nav>
  );
}
