import { useState } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, loading: externalLoading }: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = externalLoading ?? internalLoading;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setInternalLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{message}</p>
        {error && <div className="error-banner" style={{ marginBottom: '12px' }}>{error}</div>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn-danger" type="button" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? <span className="spinner" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
