import type { Metrics } from '../types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    flexShrink: 0,
  },
  value: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  skeleton: {
    height: '48px',
  },
  error: {
    gridColumn: '1 / -1',
  },
};

interface MetricsPanelProps {
  metrics: Metrics | null;
  isLoading: boolean;
  error: string | null;
}

export default function MetricsPanel({ metrics, isLoading, error }: MetricsPanelProps) {
  if (error) {
    return (
      <div style={{ ...styles.container } as React.CSSProperties}>
        <div className="error-banner" style={styles.error}>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={styles.container}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton" style={styles.skeleton} />
        ))}
      </div>
    );
  }

  const items = [
    {
      label: 'Trades',
      value: metrics ? String(metrics.tradeCount) : '--',
      color: 'var(--accent-cyan)',
    },
    {
      label: 'Win Rate',
      value: metrics ? `${metrics.winRate.toFixed(1)}%` : '--',
      color: metrics ? (metrics.winRate > 50 ? 'var(--success)' : 'var(--accent-gold)') : 'var(--text-secondary)',
    },
    {
      label: 'Profit Factor',
      value: metrics?.profitFactor !== null && metrics?.profitFactor !== undefined ? metrics.profitFactor.toFixed(2) : '--',
      color: metrics?.profitFactor !== null && metrics?.profitFactor !== undefined
        ? (metrics.profitFactor >= 1.0 ? 'var(--success)' : 'var(--accent-red)')
        : 'var(--text-secondary)',
    },
    {
      label: 'Max DD (R)',
      value: metrics ? metrics.drawdown.toFixed(2) : '--',
      color: 'var(--accent-red)',
    },
    {
      label: 'Sharpe Ratio',
      value: metrics?.sharpeRatio !== null && metrics?.sharpeRatio !== undefined ? metrics.sharpeRatio.toFixed(2) : '--',
      color: metrics?.sharpeRatio !== null && metrics?.sharpeRatio !== undefined
        ? (metrics.sharpeRatio > 1 ? 'var(--success)' : 'var(--accent-gold)')
        : 'var(--text-secondary)',
    },
    {
      label: 'Balance (R)',
      value: metrics ? metrics.balanceR.toFixed(2) : '--',
      color: metrics
        ? (metrics.balanceR > 0 ? 'var(--success)' : metrics.balanceR < 0 ? 'var(--accent-red)' : 'var(--accent-gold)')
        : 'var(--text-secondary)',
    },
  ];

  return (
    <div style={styles.container}>
      {items.map((item) => (
        <div key={item.label} style={styles.card}>
          <div style={styles.label}>{item.label}</div>
          <div style={{ ...styles.value, color: item.color }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}
