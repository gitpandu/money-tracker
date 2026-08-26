import { Ico } from './icons';

interface Props {
  tabs: string[];
  tabIcons: Record<string, keyof typeof Ico>;
  tabLabels: Record<string, string>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ tabs, tabIcons, tabLabels, activeTab, onTabChange }: Props) {
  return (
    <nav className="bottom-nav">
      {tabs.map(id => (
        <button key={id} className={`nav-tab ${activeTab === id ? "active" : ""}`} onClick={() => onTabChange(id)}>
          {Ico[tabIcons[id]]}
          {tabLabels[id]}
        </button>
      ))}
    </nav>
  );
}
