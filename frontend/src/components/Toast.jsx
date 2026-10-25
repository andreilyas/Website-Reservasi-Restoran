import { useEffect } from 'react';

export default function Toast({ type = 'success', message, onClose }) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`} role="status">
      <span className="toast-icon">{type === 'success' ? '✓' : '!'}</span>
      <span>{message}</span>
      <button onClick={onClose} aria-label="Tutup notifikasi">×</button>
    </div>
  );
}
