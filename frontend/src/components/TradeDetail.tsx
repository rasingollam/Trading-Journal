import { useState } from 'react';
import type { Trade } from '../types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  heading: {
    color: 'var(--accent-gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    marginBottom: '4px',
  },
  imageBox: {
    width: '100%',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid var(--border)',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    display: 'block',
  },
  imageSkeleton: {
    width: '100%',
    height: '200px',
    background: 'var(--bg-surface)',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  value: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
  },
  notes: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
  },
  date: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginBottom: '8px',
  },
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'zoom-out',
  },
  overlayImg: {
    maxWidth: '95vw',
    maxHeight: '95vh',
    objectFit: 'contain' as const,
  },
};

interface TradeDetailProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TradeDetail({ trade, onEdit, onDelete, onClose }: TradeDetailProps) {
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const resultR = trade.resultR ? parseFloat(trade.resultR) : null;
  const resultColor = resultR !== null ? (resultR >= 0 ? 'var(--success)' : 'var(--accent-red)') : 'var(--text-secondary)';

  return (
    <div style={styles.container}>
      <div style={styles.actions}>
        <button onClick={() => onEdit(trade)}>Edit</button>
        <button className="btn-danger" onClick={() => onDelete(trade)}>Delete</button>
      </div>

      <div style={styles.imageBox} onClick={() => setFullscreen(trade.openScreenshotUrl)}>
        <img
          src={trade.openScreenshotUrl}
          alt="Open screenshot"
          style={styles.image}
          onLoad={(e) => {
            (e.target as HTMLImageElement).style.display = 'block';
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {trade.closeScreenshotUrl && (
        <div style={styles.imageBox} onClick={() => setFullscreen(trade.closeScreenshotUrl)}>
          <img
            src={trade.closeScreenshotUrl}
            alt="Close screenshot"
            style={styles.image}
            onLoad={(e) => {
              (e.target as HTMLImageElement).style.display = 'block';
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div>
        <div style={styles.label}>Pair</div>
        <div style={styles.value}>{trade.pair || <span style={{ color: 'var(--text-secondary)' }}>Not specified</span>}</div>
      </div>

      <div>
        <div style={styles.label}>Result</div>
        <div style={{ ...styles.value, color: resultColor }}>
          {resultR !== null ? `${resultR > 0 ? '+' : ''}${resultR.toFixed(2)} R` : 'Not recorded'}
        </div>
      </div>

      {trade.notes && (
        <div>
          <div style={styles.label}>Notes</div>
          <div style={styles.notes}>{trade.notes}</div>
        </div>
      )}

      <div>
        <div style={styles.label}>Created</div>
        <div style={styles.date}>{formatDate(trade.createdAt)}</div>
      </div>

      <div>
        <div style={styles.label}>Updated</div>
        <div style={styles.date}>{formatDate(trade.updatedAt)}</div>
      </div>

      {fullscreen && (
        <div style={styles.overlay} onClick={() => setFullscreen(null)}>
          <img src={fullscreen} alt="Fullscreen" style={styles.overlayImg} />
        </div>
      )}
    </div>
  );
}
