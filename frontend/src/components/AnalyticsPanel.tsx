import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import type { Trade, Metrics, EquityPoint } from '../types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
  },
  metricCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: 'var(--text-secondary)',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
  },
  metricValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  chartCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
  },
  chartTitle: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  chartWrapper: {
    width: '100%',
    height: '200px',
  },
  statsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  statPill: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '6px 12px',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    whiteSpace: 'nowrap' as const,
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginRight: '6px',
  },
};

function getMetricColor(metrics: Metrics | null, key: string, value: number): string {
  if (metrics === null) return 'var(--text-secondary)';
  switch (key) {
    case 'winRate': return value > 50 ? 'var(--success)' : 'var(--accent-gold)';
    case 'profitFactor': return value >= 1 ? 'var(--success)' : 'var(--accent-red)';
    case 'drawdown': return 'var(--accent-red)';
    case 'sharpeRatio': return value > 1 ? 'var(--success)' : 'var(--accent-gold)';
    case 'balanceR': return value > 0 ? 'var(--success)' : value < 0 ? 'var(--accent-red)' : 'var(--accent-gold)';
    case 'tradeCount': return 'var(--accent-cyan)';
    default: return 'var(--text-secondary)';
  }
}

interface AnalyticsPanelProps {
  trades: Trade[];
  metrics: Metrics | null;
  equity: EquityPoint[];
  metricsLoading: boolean;
  equityLoading: boolean;
}

function computeStats(trades: Trade[]) {
  const rValues = trades
    .map((t) => parseFloat(t.resultR || ''))
    .filter((v) => !isNaN(v));

  const wins = rValues.filter((v) => v > 0);
  const losses = rValues.filter((v) => v < 0);

  const avgWin = wins.length > 0 ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const bestTrade = rValues.length > 0 ? Math.max(...rValues) : 0;
  const worstTrade = rValues.length > 0 ? Math.min(...rValues) : 0;
  const winLossRatio = avgLoss !== 0 ? avgWin / Math.abs(avgLoss) : avgWin > 0 ? Infinity : 0;

  let conW = 0, conL = 0, maxConW = 0, maxConL = 0;
  for (const v of rValues) {
    if (v > 0) { conW++; conL = 0; maxConW = Math.max(maxConW, conW); }
    else if (v < 0) { conL++; conW = 0; maxConL = Math.max(maxConL, conL); }
    else { conW = 0; conL = 0; }
  }

  const bins = [-3, -1, 0, 1, 3];
  const binLabels = ['<-2', '-2--1', '-1-0', '0-1', '1-2', '2-3', '>3'];
  const distribution = Array(7).fill(0);
  for (const v of rValues) {
    if (v < -2) distribution[0]++;
    else if (v < -1) distribution[1]++;
    else if (v < 0) distribution[2]++;
    else if (v < 1) distribution[3]++;
    else if (v < 2) distribution[4]++;
    else if (v < 3) distribution[5]++;
    else distribution[6]++;
  }

  const rDistData = binLabels.map((label, i) => ({
    label,
    count: distribution[i],
    fill: i < 3 ? 'var(--accent-red)' : 'var(--success)',
  }));

  return { avgWin, avgLoss, bestTrade, worstTrade, winLossRatio, maxConW, maxConL, rDistData };
}

export default function AnalyticsPanel({ trades, metrics, equity, metricsLoading, equityLoading }: AnalyticsPanelProps) {
  const stats = computeStats(trades);

  const metricItems = metrics ? [
    { label: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, key: 'winRate' },
    { label: 'Profit Factor', value: metrics.profitFactor !== null ? metrics.profitFactor.toFixed(2) : '--', key: 'profitFactor' },
    { label: 'Max DD', value: `${metrics.drawdown.toFixed(2)}R`, key: 'drawdown' },
    { label: 'Sharpe', value: metrics.sharpeRatio !== null ? metrics.sharpeRatio.toFixed(2) : '--', key: 'sharpeRatio' },
    { label: 'Trades', value: String(metrics.tradeCount), key: 'tradeCount' },
    { label: 'Net P&L', value: `${metrics.balanceR > 0 ? '+' : ''}${metrics.balanceR.toFixed(2)}R`, key: 'balanceR' },
  ] : [];

  const equityData = equity.map((pt) => ({ index: pt.index, equity: pt.value }));

  return (
    <div style={styles.container}>
      <div style={styles.metricsRow}>
        {metricsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '40px', borderRadius: '6px' }} />
          ))
        ) : (
          metricItems.map((item) => (
            <div key={item.key} style={styles.metricCard}>
              <span style={styles.metricLabel}>{item.label}</span>
              <span style={{ ...styles.metricValue, color: getMetricColor(metrics, item.key, parseFloat(item.value) || 0) }}>
                {item.value}
              </span>
            </div>
          ))
        )}
      </div>

      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Equity Curve</div>
          <div style={styles.chartWrapper}>
            {equityLoading ? (
              <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '4px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="index" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--border)" />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--border)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                    itemStyle={{ color: 'var(--accent-gold)' }}
                  />
                  <Line type="monotone" dataKey="equity" stroke="var(--accent-gold)" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>R-Distribution</div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.rDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} stroke="var(--border)" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                  itemStyle={{ color: 'var(--accent-gold)' }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {stats.rDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.statsRow}>
        <span style={{ ...styles.statPill, color: 'var(--success)' }}>
          <span style={styles.statLabel}>Avg Win</span>+{stats.avgWin.toFixed(2)}R
        </span>
        <span style={{ ...styles.statPill, color: 'var(--accent-red)' }}>
          <span style={styles.statLabel}>Avg Loss</span>{stats.avgLoss.toFixed(2)}R
        </span>
        <span style={styles.statPill}>
          <span style={styles.statLabel}>W/L Ratio</span>{stats.winLossRatio === Infinity ? '∞' : stats.winLossRatio.toFixed(2)}
        </span>
        <span style={{ ...styles.statPill, color: 'var(--success)' }}>
          <span style={styles.statLabel}>Best</span>+{stats.bestTrade.toFixed(2)}R
        </span>
        <span style={{ ...styles.statPill, color: 'var(--accent-red)' }}>
          <span style={styles.statLabel}>Worst</span>{stats.worstTrade.toFixed(2)}R
        </span>
        <span style={styles.statPill}>
          <span style={styles.statLabel}>Con W</span>{stats.maxConW}
        </span>
        <span style={styles.statPill}>
          <span style={styles.statLabel}>Con L</span>{stats.maxConL}
        </span>
      </div>
    </div>
  );
}
