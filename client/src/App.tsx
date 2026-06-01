import { useState, useRef, useEffect } from 'react';
import { useStrings } from './utils/i18n';
import { useCycles } from './hooks/useCycles';
import { useCategories } from './hooks/useCategories';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useGoals } from './hooks/useGoals';
import { useSettings } from './hooks/useSettings';
import { txnsInCycle } from './utils/dates';
import { Ico } from './components/icons';
import { setApiHandlers } from './utils/api';
import { AppProvider } from './context/AppProvider';
import { useAppContext } from './context/useAppContext';

// Components
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { BottomNavigation } from './components/BottomNavigation';
import { FAB } from './components/FAB';
import { TransactionModal } from './components/TransactionModal';
import { LoadingScreen } from './components/LoadingScreen';
import { ErrorToast } from './components/ErrorToast';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const TAB_IDS = ["dashboard", "budgets", "goals", "reports", "settings"];
const TAB_ICONS: Record<string, keyof typeof Ico> = {
  dashboard: "home", budgets: "budget", goals: "goal", reports: "chart", settings: "cog"
};

function AppContent() {
  const [tab, setTab] = useState("dashboard");
  const {
    lang, setLang,
    darkMode, setDarkMode,
    shortCurrency, setShortCurrency,
    cycleDay, setCycleDay,
    carryOver, setCarryOver,
    copyBudgets, setCopyBudgets
  } = useSettings();

  const { loading, error, startLoading, stopLoading, setError } = useAppContext();

  useEffect(() => {
    setApiHandlers({
      onStart: startLoading,
      onEnd: stopLoading,
      onError: (msg) => setError(msg)
    });
  }, [startLoading, stopLoading, setError]);

  const [fabOpen, setFabOpen] = useState(false);
  const [showFab, setShowFab] = useState(true);
  const scrollRef = useRef(0);

  const t = useStrings(lang);
  const TAB_LBL: Record<string, string> = { dashboard: t.home, budgets: t.budgets, goals: t.goals, reports: t.reports, settings: t.settings };

  // Data Hooks
  const { cycles, activeCycleId, setActiveCycleId } = useCycles(cycleDay);
  const { categories, save: saveCategory, remove: removeCategory } = useCategories();
  const { transactions, create: createTxn, update: updateTxn, remove: removeTxn } = useTransactions();
  const { budgets, save: saveBudget, toggleActive: toggleBudgetActive } = useBudgets(activeCycleId);
  const { goals, save: saveGoal, remove: removeGoal, contribute: contributeGoal } = useGoals();

  const activeCycle = cycles.find(c => c.id.toString() === activeCycleId);
  const currentTxns = txnsInCycle(transactions, activeCycle);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const currentScroll = e.currentTarget.scrollTop;
    const previousScroll = scrollRef.current;
    const isScrollingUp = currentScroll < previousScroll;
    const isNearTop = currentScroll < 40;
    setShowFab(isScrollingUp || isNearTop);
    scrollRef.current = currentScroll;
  }

  return (
    <div className="shell">
      <Sidebar
        tabs={TAB_IDS}
        tabIcons={TAB_ICONS}
        tabLabels={TAB_LBL}
        activeTab={tab}
        onTabChange={setTab}
        activeCycle={activeCycle}
        t={t}
      />

      <div className="main-col">
        <Topbar
          title={tab === "dashboard" ? t.home : TAB_LBL[tab]}
          showCycleSelector={tab === "dashboard"}
          cycles={cycles}
          activeCycleId={activeCycleId}
          onCycleChange={setActiveCycleId}
        />

        <div className="scroll-area" onScroll={handleScroll}>
          {tab === "dashboard" && (
            <DashboardPage
              txns={currentTxns}
              categories={categories}
              t={t}
              shortCurrency={shortCurrency}
              onSaveTxn={async (tx, receipt, removeReceipt) => {
                if (tx.id) await updateTxn(tx.id, tx, receipt, removeReceipt);
                else await createTxn(tx, receipt);
              }}
              onDeleteTxn={removeTxn}
            />
          )}

          {tab === "budgets" && (
            <BudgetsPage
              currentTxns={currentTxns}
              allTxns={transactions}
              categories={categories}
              budgets={budgets}
              allCycles={cycles}
              activeCycleId={activeCycleId}
              t={t}
              shortCurrency={shortCurrency}
              onSaveBudget={saveBudget}
              onToggleActive={toggleBudgetActive}
            />
          )}

          {tab === "goals" && (
            <GoalsPage
              goals={goals}
              t={t}
              shortCurrency={shortCurrency}
              onSaveGoal={saveGoal}
              onDeleteGoal={removeGoal}
              onContribute={contributeGoal}
            />
          )}

          {tab === "reports" && (
            <ReportsPage
              allTxns={transactions}
              categories={categories}
              activeCycle={activeCycle}
              t={t}
              shortCurrency={shortCurrency}
            />
          )}

          {tab === "settings" && (
            <SettingsPage
              categories={categories}
              cycles={cycles}
              activeCycleId={activeCycleId}
              allTxns={transactions}
              lang={lang}
              setLang={setLang}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              shortCurrency={shortCurrency}
              setShortCurrency={setShortCurrency}
              cycleDay={cycleDay}
              setCycleDay={setCycleDay}
              carryOver={carryOver}
              setCarryOver={setCarryOver}
              copyBudgets={copyBudgets}
              setCopyBudgets={setCopyBudgets}
              t={t}
              onSaveCategory={saveCategory}
              onDeleteCategory={removeCategory}
            />
          )}
        </div>
      </div>

      {tab === "dashboard" && (
        <FAB show={showFab} onClick={() => setFabOpen(true)} />
      )}

      {fabOpen && (
        <TransactionModal
          categories={categories}
          initial={null}
          t={t}
          onClose={() => setFabOpen(false)}
          onSave={async (tx, receipt) => {
            await createTxn(tx, receipt);
            setFabOpen(false);
          }}
        />
      )}

      <BottomNavigation
        tabs={TAB_IDS}
        tabIcons={TAB_ICONS}
        tabLabels={TAB_LBL}
        activeTab={tab}
        onTabChange={setTab}
      />

      {loading && <LoadingScreen />}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
