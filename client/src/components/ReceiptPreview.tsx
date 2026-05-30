import { Ico } from './icons';
import { Strings } from '../utils/i18n';

interface Props {
  path: string;
  t: Strings;
  onClose: () => void;
}

export function ReceiptPreview({ path, t, onClose }: Props) {
  const isPdf = path.toLowerCase().endsWith('.pdf') || path.startsWith('data:application/pdf');
  
  let src = path;
  if (!path.startsWith('data:') && !path.startsWith('http://') && !path.startsWith('https://') && !path.startsWith('/')) {
    src = path.startsWith('receipts/') ? `/${path}` : `/receipts/${path}`;
  }

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <button className="receipt-overlay-close" onClick={e => { e.stopPropagation(); onClose(); }}>{Ico.close}</button>
      <div className="receipt-overlay-title">{t.receiptPreview}</div>
      {isPdf ? (
        <iframe className="receipt-img" src={src} title="receipt" onClick={e => e.stopPropagation()} style={{ border: 'none', background: '#fff', width: '100%', maxWidth: '800px', height: '80vh' }} />
      ) : (
        <img className="receipt-img" src={src} alt="receipt" onClick={e => e.stopPropagation()} />
      )}
    </div>
  );
}
