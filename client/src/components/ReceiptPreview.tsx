import { Ico } from './icons';
import { Strings } from '../utils/i18n';

interface Props {
  path: string;
  t: Strings;
  onClose: () => void;
}

export function ReceiptPreview({ path, t, onClose }: Props) {
  const src = path.startsWith('data:image') ? path : `/api/receipts/${path.split('/').pop()}`;

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <button className="receipt-overlay-close" onClick={onClose}>{Ico.close}</button>
      <div className="receipt-overlay-title">{t.receiptPreview}</div>
      <img className="receipt-img" src={src} alt="receipt" onClick={e => e.stopPropagation()} />
    </div>
  );
}
