import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import type { Trade, Metrics, EquityPoint } from '../types';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    gap: '12px',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '8px',
    flexShrink: 0,
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
    flex: 1,
    minHeight: 0,
  },
  chartCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  chartTitle: {
    color: 'var(--text-secondary)',
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    marginBottom: '12px',
    flexShrink: 0,
  },
  chartWrapper: {
    width: '100%',
    flex: 1,
    minHeight: 0,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    flexShrink: 0,
  },
  statPill: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  statValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 'bold',
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

  const binLabels = ['<-2', '-2~-1', '-1~0', '0~1', '1~2', '2~3', '>3'];
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const sortedTrades = [...trades]
    .filter((t) => t.resultR !== null && !isNaN(parseFloat(t.resultR)))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const equityData = equity.map((pt, i) => ({
    date: sortedTrades[i] ? formatDate(sortedTrades[i].createdAt) : String(pt.index),
    equity: pt.value,
    resultR: sortedTrades[i] ? parseFloat(sortedTrades[i].resultR!) : 0,
  }));

  const statItems = [
    { label: 'Avg Win', value: `+${stats.avgWin.toFixed(2)}R`, color: 'var(--success)' },
    { label: 'Avg Loss', value: `${stats.avgLoss.toFixed(2)}R`, color: 'var(--accent-red)' },
    { label: 'W/L Ratio', value: stats.winLossRatio === Infinity ? '∞' : stats.winLossRatio.toFixed(2), color: 'var(--accent-cyan)' },
    { label: 'Best', value: `+${stats.bestTrade.toFixed(2)}R`, color: 'var(--success)' },
    { label: 'Worst', value: `${stats.worstTrade.toFixed(2)}R`, color: 'var(--accent-red)' },
    { label: 'Consecutive Win', value: String(stats.maxConW), color: 'var(--success)' },
    { label: 'Consecutive Loss', value: String(stats.maxConL), color: 'var(--accent-red)' },
  ];

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
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                    stroke="var(--border)"
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--border)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'var(--text-secondary)' }}
                    formatter={(value) => [Number(value).toFixed(2) + 'R', 'Equity']}
                  />
                  <Line type="monotone" dataKey="equity" stroke="var(--accent-gold)" strokeWidth={2} dot={false} />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="none"
                    dot={{ r: 4, strokeWidth: 0, fill: 'var(--accent-gold)' }}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>R-Distribution</div>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.rDistData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} stroke="var(--border)" />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} stroke="var(--border)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'var(--text-secondary)' }}
                  itemStyle={{ color: 'var(--text-secondary)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.08)' }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} activeBar={(props: { index: number }) => {
                  const { index, ...rest } = props;
                  return <rect {...rest} fill={stats.rDistData[index]?.fill || 'var(--success)'} />;
                }}>
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
        {statItems.map((item) => (
          <div key={item.label} style={styles.statPill}>
            <span style={styles.statLabel}>{item.label}</span>
            <span style={{ ...styles.statValue, color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
