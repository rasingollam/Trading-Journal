import type { Strategy, EquityPoint } from '../types';
import Sparkline from './Sparkline';

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: 'var(--accent-gold)',
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
  },
  tradeCount: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    background: 'var(--bg-surface)',
    padding: '2px 10px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
  },
  description: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    lineHeight: '1.5',
    marginTop: '-6px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    opacity: 0.5,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  metric: {
    background: 'var(--bg-surface)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontFamily: 'var(--font-mono)',
  },
  metricLabel: {
    color: 'var(--text-secondary)',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    marginBottom: '4px',
  },
  metricValue: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
  },
  chartRow: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '4px',
  },
  actionBtn: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    padding: '6px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold' as const,
    letterSpacing: '0.5px',
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
        e.currentTarget.style.boxShadow = '0 0 16px rgba(255, 215, 0, 0.25)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <div style={styles.name}>{strategy.name}</div>
      {strategy.description && (
        <div style={styles.description}>
          {strategy.description.length > 120
            ? strategy.description.slice(0, 120) + '...'
            : strategy.description}
        </div>
      )}
      <div style={styles.divider} />
      <div style={styles.metricsGrid}>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Win Rate</div>
          <div style={{ ...styles.metricValue, color: winRateColor }}>
            {winRate !== undefined ? `${winRate.toFixed(1)}%` : '--'}
          </div>
        </div>
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Profit Factor</div>
          <div style={{ ...styles.metricValue, color: profitFactor !== null && profitFactor !== undefined && profitFactor >= 1 ? 'var(--success)' : 'var(--text-primary)' }}>
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
          <div style={{ ...styles.metricValue, color: sharpeRatio !== null && sharpeRatio !== undefined && sharpeRatio >= 1 ? 'var(--success)' : 'var(--text-primary)' }}>
            {sharpeRatio !== undefined && sharpeRatio !== null ? sharpeRatio.toFixed(2) : '--'}
          </div>
        </div>
      </div>
      {equity && equity.length > 0 && (
        <div style={styles.chartRow}>
          <Sparkline data={equity} color={eqColor} width={140} height={60} />
        </div>
      )}
      <div style={styles.footer}>
        <button
          style={styles.actionBtn}
          onClick={handleEdit}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >Edit</button>
        <button
          style={styles.actionBtn}
          className="btn-danger-outline"
          onClick={handleDelete}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-red)'; e.currentTarget.style.color = 'var(--accent-red)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >Delete</button>
      </div>
    </div>
  );
}

export function StrategyCardSkeleton() {
  return (
    <div style={{ ...styles.card, cursor: 'default' } as React.CSSProperties}>
      <div style={{ ...styles.skeleton, width: '55%', height: '24px' }} />
      <div style={{ ...styles.skeleton, width: '85%', height: '14px' }} />
      <div style={{ ...styles.skeleton, width: '100%', height: '1px', marginBottom: '0' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ ...styles.skeleton, height: '48px', marginBottom: 0 }} />
        ))}
      </div>
      <div style={{ ...styles.skeleton, width: '140px', height: '40px', margin: '0 auto' }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <div style={{ ...styles.skeleton, width: '55px', height: '30px', marginBottom: 0 }} />
        <div style={{ ...styles.skeleton, width: '65px', height: '30px', marginBottom: 0 }} />
      </div>
    </div>
  );
}
