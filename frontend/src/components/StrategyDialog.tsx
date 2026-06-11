import { useState, useEffect } from 'react';
import type { Strategy } from '../types';

interface StrategyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => Promise<void>;
  strategy?: Strategy | null;
}

export default function StrategyDialog({ isOpen, onClose, onSave, strategy }: StrategyDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(strategy?.name || '');
      setDescription(strategy?.description || '');
      setError(null);
      setSaving(false);
    }
  }, [isOpen, strategy]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ name: name.trim(), description: description.trim() || undefined });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save strategy');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{strategy ? 'Edit Strategy' : 'New Strategy'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="strategy-name">Name</label>
            <input
              id="strategy-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saving}
              placeholder="e.g., Breakout Strategy"
            />
          </div>
          <div className="form-group">
            <label htmlFor="strategy-desc">Description (optional)</label>
            <textarea
              id="strategy-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Describe your strategy rules..."
              rows={4}
            />
          </div>
          {error && <div className="error-banner">{error}</div>}
          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()}>
              {saving ? <span className="spinner" /> : strategy ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
