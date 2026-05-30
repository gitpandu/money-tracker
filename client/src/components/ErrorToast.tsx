import React from 'react';
import { Ico } from './icons';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  return (
    <div className="error-toast">
      <div className="error-toast-icon">
        {Ico.alert}
      </div>
      <div className="error-toast-content">
        <div className="error-toast-title">Error</div>
        <div className="error-toast-msg">{message}</div>
      </div>
      <button className="error-toast-close" onClick={onClose}>
        {Ico.close}
      </button>
    </div>
  );
};
