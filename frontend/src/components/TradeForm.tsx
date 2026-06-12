import { useState, useEffect, useRef } from 'react';
import type { Trade } from '../types';

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  heading: {
    color: 'var(--accent-gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    marginBottom: '8px',
  },
  fileInput: {
    padding: '8px',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginTop: '4px',
  },
  preview: {
    width: '100%',
    height: '100px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '8px',
  },
};

interface TradeFormProps {
  trade?: Trade | null;
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

export default function TradeForm({ trade, onSave, onCancel, saving, error }: TradeFormProps) {
  const [openFile, setOpenFile] = useState<File | null>(null);
  const [closeFile, setCloseFile] = useState<File | null>(null);
  const [resultR, setResultR] = useState('');
  const [notes, setNotes] = useState('');
  const [pair, setPair] = useState('');
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const [closePreview, setClosePreview] = useState<string | null>(null);
  const openRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (trade) {
      setResultR(trade.resultR || '');
      setNotes(trade.notes || '');
      setPair(trade.pair || '');
      setOpenPreview(trade.openScreenshotUrl);
      setClosePreview(trade.closeScreenshotUrl);
    } else {
      setResultR('');
      setNotes('');
      setPair('');
      setOpenFile(null);
      setCloseFile(null);
      setOpenPreview(null);
      setClosePreview(null);
    }
  }, [trade]);

  const handleOpenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOpenFile(file);
      setOpenPreview(URL.createObjectURL(file));
    }
  };

  const handleCloseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCloseFile(file);
      setClosePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    if (openFile) fd.append('openScreenshot', openFile);
    if (closeFile) fd.append('closeScreenshot', closeFile);
    if (resultR) fd.append('resultR', resultR);
    if (notes) fd.append('notes', notes);
    if (pair) fd.append('pair', pair);
    await onSave(fd);
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h2 style={styles.heading}>{trade ? 'Edit Trade' : 'New Trade'}</h2>

      <div className="form-group">
        <label htmlFor="pair">Pair</label>
        <select id="pair" value={pair} onChange={(e) => setPair(e.target.value)} disabled={saving}>
          <option value="">-- Not specified --</option>
          <option value="BTC/USDT">BTC/USDT</option>
          <option value="ETH/USDT">ETH/USDT</option>
          <option value="BNB/USDT">BNB/USDT</option>
        </select>
      </div>

      <div className="form-group">
        <label>Open Screenshot</label>
        <input
          ref={openRef}
          type="file"
          accept="image/*"
          onChange={handleOpenFileChange}
          style={styles.fileInput}
          disabled={saving}
        />
        {openPreview && (
          <div style={styles.previewGrid}>
            <img src={openPreview} alt="Open preview" style={styles.preview} />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Close Screenshot</label>
        <input
          ref={closeRef}
          type="file"
          accept="image/*"
          onChange={handleCloseFileChange}
          style={styles.fileInput}
          disabled={saving}
        />
        {closePreview && (
          <div style={styles.previewGrid}>
            <img src={closePreview} alt="Close preview" style={styles.preview} />
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="resultR">Result (R)</label>
        <input
          id="resultR"
          type="number"
          step="0.01"
          value={resultR}
          onChange={(e) => setResultR(e.target.value)}
          disabled={saving}
          placeholder="e.g., 1.5 (positive = win)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={saving}
          placeholder="What did you observe?"
          rows={4}
        />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div style={styles.actions}>
        <button type="button" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button type="submit" disabled={saving}>
          {saving ? <span className="spinner" /> : trade ? 'Update' : 'Add Trade'}
        </button>
      </div>
    </form>
  );
}
