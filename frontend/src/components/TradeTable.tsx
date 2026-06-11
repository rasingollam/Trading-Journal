import type { Trade } from '../types';

const styles: Record<string, React.CSSProperties> = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid var(--accent-gold)',
    color: 'var(--accent-gold)',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    fontSize: '12px',
  },
  td: {
    padding: '10px 12px',
    borderBottom: '1px solid var(--border)',
  },
  row: {
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  thumbsWrapper: {
    display: 'flex',
    gap: '6px',
  },
  thumbGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
  },
  thumbLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  thumbnail: {
    width: '60px',
    height: '40px',
    objectFit: 'cover' as const,
    borderRadius: '4px',
    border: '1px solid var(--border)',
  },
  skeletonRow: {
    height: '44px',
    marginBottom: '4px',
  },
  skeleton: {
    background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-secondary) 50%, var(--bg-surface) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: '4px',
  },
};

interface TradeTableProps {
  trades: Trade[];
  onSelect: (trade: Trade) => void;
  isLoading: boolean;
  error: string | null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function TradeTableRow({ trade, onSelect }: { trade: Trade; onSelect: (trade: Trade) => void }) {
  const resultR = trade.resultR ? parseFloat(trade.resultR) : null;
  const resultColor = resultR !== null ? (resultR >= 0 ? 'var(--success)' : 'var(--accent-red)') : 'var(--text-secondary)';

  return (
    <tr
      style={styles.row}
      onClick={() => onSelect(trade)}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
    >
      <td style={styles.td}>{formatDate(trade.createdAt)}</td>
      <td style={{ ...styles.td, color: resultColor }}>
        {resultR !== null ? `${resultR > 0 ? '+' : ''}${resultR.toFixed(2)}R` : '--'}
      </td>
      <td style={styles.td}>
        <div style={styles.thumbsWrapper}>
          <div style={styles.thumbGroup}>
            <span style={styles.thumbLabel}>Open</span>
            <img
              src={trade.openScreenshotUrl}
              alt="open"
              style={styles.thumbnail}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          {trade.closeScreenshotUrl ? (
            <div style={styles.thumbGroup}>
              <span style={styles.thumbLabel}>Close</span>
              <img
                src={trade.closeScreenshotUrl}
                alt="close"
                style={styles.thumbnail}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div style={styles.thumbGroup}>
              <span style={styles.thumbLabel}>Close</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>--</span>
            </div>
          )}
        </div>
      </td>
      <td style={styles.td}>
        {trade.notes ? (
          trade.notes.length > 50 ? trade.notes.slice(0, 50) + '...' : trade.notes
        ) : (
          <span style={{ color: 'var(--text-secondary)' }}>--</span>
        )}
      </td>
    </tr>
  );
}

export default function TradeTable({ trades, onSelect, isLoading, error }: TradeTableProps) {
  if (error) {
    return (
      <div className="error-banner">
        <span>{error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ ...styles.skeletonRow, width: '100%' }}
          />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="empty-state">
        <h3>No trades yet</h3>
        <p>Add your first trade to start journaling.</p>
      </div>
    );
  }

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Date</th>
          <th style={styles.th}>Result</th>
          <th style={styles.th}>Screenshots</th>
          <th style={styles.th}>Notes</th>
        </tr>
      </thead>
      <tbody>
        {trades.map((trade) => (
          <TradeTableRow key={trade.id} trade={trade} onSelect={onSelect} />
        ))}
      </tbody>
    </table>
  );
}
