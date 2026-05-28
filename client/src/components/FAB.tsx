import { Ico } from './icons';

export function FAB({ show, onClick }: { show: boolean, onClick: () => void }) {
  return (
    <button
      className="fab"
      onClick={onClick}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0px) scale(1)" : "translateY(24px) scale(0.9)",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {Ico.plus}
    </button>
  );
}
