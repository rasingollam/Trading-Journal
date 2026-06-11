import type { Strategy, EquityPoint } from '../types';
import Sparkline from './Sparkline';

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  name: {
    color: 'var(--accent-gold)',
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  metricsRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  metric: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
  },
  metricLabel: {
    color: 'var(--text-secondary)',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  metricValue: {
    fontSize: '13px',
  },
  chartRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '4px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  actionBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s ease',
  },
  skeleton: {
    height: '20px',
    marginBottom: '8px',
    background: 'linear-gradient(90deg, var(--bg-surface) 25%, var(--bg-secondary) 50%, var(--bg-surface) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    borderRadius: '4px',
  },
};

interface StrategyCardProps {
  strategy: Strategy;
  winRate?: number;
  profitFactor?: number | null;
  drawdown?: number;
  sharpeRatio?: number | null;
  equity?: EquityPoint[];
  onEdit: (strategy: Strategy) => void;
  onDelete: (strategy: Strategy) => void;
  onClick: (strategy: Strategy) => void;
}

export default function StrategyCard({ strategy, winRate, profitFactor, drawdown, sharpeRatio, equity, onEdit, onDelete, onClick }: StrategyCardProps) {
  const handleCardClick = () => onClick(strategy);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(strategy);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(strategy);
  };

  const winRateColor = winRate !== undefined ? (winRate > 50 ? 'var(--success)' : winRate > 0 ? 'var(--accent-gold)' : 'var(--text-secondary)') : 'var(--text-secondary)';
  const eqColor = equity && equity.length > 1 ? (equity[equity.length - 1].value >= 0 ? 'var(--success)' : 'var(--accent-red)') : 'var(--accent-gold)';

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-gold)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={styles.name}>{strategy.name}</div>
      {strategy.description && (
        <div style={styles.description}>
          {strategy.description.length > 100
            ? strategy.description.slice(0, 100) + '...'
            : strategy.description}
        </div>
      )}
      <div style={styles.metricsRow}>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Win Rate</div>
          <div style={{ ...styles.metricValue, color: winRateColor }}>
            {winRate !== undefined ? `${winRate.toFixed(1)}%` : '--'}
          </div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Profit Factor</div>
          <div style={{ ...styles.metricValue, color: 'var(--text-primary)' }}>
            {profitFactor !== undefined && profitFactor !== null ? profitFactor.toFixed(2) : '--'}
          </div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Drawdown</div>
          <div style={{ ...styles.metricValue, color: 'var(--accent-red)' }}>
            {drawdown !== undefined ? `${drawdown.toFixed(1)}%` : '--'}
          </div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Sharpe</div>
          <div style={{ ...styles.metricValue, color: 'var(--text-primary)' }}>
            {sharpeRatio !== undefined && sharpeRatio !== null ? sharpeRatio.toFixed(2) : '--'}
          </div>
        </div>
      </div>
      {equity && equity.length > 0 && (
        <div style={styles.chartRow}>
          <Sparkline data={equity} color={eqColor} />
        </div>
      )}
      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={handleEdit}>Edit</button>
        <button style={styles.actionBtn} onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}

export function StrategyCardSkeleton() {
  return (
    <div style={{ ...styles.card, cursor: 'default' } as React.CSSProperties}>
      <div style={{ ...styles.skeleton, width: '60%', height: '22px' }} />
      <div style={{ ...styles.skeleton, width: '90%' }} />
      <div style={{ ...styles.skeleton, width: '40%', height: '16px' }} />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <div style={{ ...styles.skeleton, width: '50px', height: '28px' }} />
        <div style={{ ...styles.skeleton, width: '60px', height: '28px' }} />
      </div>
    </div>
  );
}
