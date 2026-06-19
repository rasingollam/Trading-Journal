import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTrades, useMetrics, useEquity } from '../hooks/useTrades';
import MetricsPanel from '../components/MetricsPanel';
import AnalyticsPanel from '../components/AnalyticsPanel';
import TradeTable from '../components/TradeTable';
import TradeForm from '../components/TradeForm';
import TradeDetail from '../components/TradeDetail';
import SideTray from '../components/SideTray';
import ConfirmDialog from '../components/ConfirmDialog';
import { listStrategies } from '../api/strategies';
import type { Strategy, Trade } from '../types';

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '24px',
  },
  accentBar: {
    height: '2px',
    background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-cyan))',
    marginBottom: '16px',
    borderRadius: '1px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '12px',
  },
  backLink: {
    display: 'inline-block',
    color: 'var(--accent-cyan)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    textDecoration: 'none',
    marginBottom: '8px',
  },
  title: {
    color: 'var(--accent-gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '20px',
    letterSpacing: '1px',
  },
  tabSeparator: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    opacity: 0.5,
  },
  tabToggle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    background: 'none',
    border: 'none',
    color: 'var(--accent-cyan)',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    textDecorationColor: 'var(--border)',
    transition: 'color 0.2s ease',
  },
  notFound: {
    textAlign: 'center' as const,
    padding: '80px 20px',
  },
  notFoundTitle: {
    color: 'var(--accent-gold)',
    fontSize: '24px',
    marginBottom: '12px',
  },
};

export default function StrategyJournalPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const strategyId = id ? parseInt(id, 10) : undefined;

  const { trades, loading: tradesLoading, error: tradesError, createTrade, updateTrade, deleteTrade, refresh: refreshTrades } = useTrades(strategyId);
  const { metrics, loading: metricsLoading, error: metricsError, refresh: refreshMetrics } = useMetrics(strategyId);

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [strategyLoading, setStrategyLoading] = useState(true);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  const [trayOpen, setTrayOpen] = useState(false);
  const [trayMode, setTrayMode] = useState<'detail' | 'form'>('detail');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingTrade, setDeletingTrade] = useState<Trade | null>(null);
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics'>('journal');

  const { equity, loading: equityLoading } = useEquity(strategyId);

  useEffect(() => {
    if (strategyId === undefined) return;
    setStrategyLoading(true);
    setStrategyError(null);
    listStrategies()
      .then((strategies) => {
        const found = strategies.find((s) => s.id === strategyId);
        if (found) {
          setStrategy(found);
        } else {
          setStrategyError('Strategy not found');
        }
      })
      .catch((err: unknown) => {
        setStrategyError(err instanceof Error ? err.message : 'Failed to load strategy');
      })
      .finally(() => setStrategyLoading(false));
  }, [strategyId]);

  const openTradeDetail = (trade: Trade) => {
    setSelectedTrade(trade);
    setEditingTrade(null);
    setTrayMode('detail');
    setTrayOpen(true);
  };

  const openAddTrade = () => {
    setSelectedTrade(null);
    setEditingTrade(null);
    setTrayMode('form');
    setFormError(null);
    setFormSaving(false);
    setTrayOpen(true);
  };

  const openEditTrade = (trade: Trade) => {
    setSelectedTrade(trade);
    setEditingTrade(trade);
    setTrayMode('form');
    setFormError(null);
    setFormSaving(false);
    setTrayOpen(true);
  };

  const handleFormSave = async (formData: FormData) => {
    setFormSaving(true);
    setFormError(null);
    try {
      if (editingTrade) {
        await updateTrade(editingTrade.id, formData);
      } else {
        await createTrade(formData);
      }
      await refreshMetrics();
      setTrayOpen(false);
      setEditingTrade(null);
      setSelectedTrade(null);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save trade');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteTrade = async () => {
    if (!deletingTrade || strategyId === undefined) return;
    await deleteTrade(deletingTrade.id);
    await refreshMetrics();
    setDeletingTrade(null);
    setTrayOpen(false);
    setSelectedTrade(null);
    setEditingTrade(null);
  };

  if (strategyLoading) {
    return (
      <div>
        <div className="skeleton" style={{ ...styles.accentBar }} />
        <div className="skeleton" style={{ width: '180px', height: '11px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px' }} />
          ))}
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '44px', marginBottom: '4px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (strategyError && strategyError === 'Strategy not found') {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.notFoundTitle}>Strategy not found</h2>
        <Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
      </div>
    );
  }

  if (strategyError) {
    return (
      <div>
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <span>{strategyError}</span>
          <button onClick={() => navigate(0)}>Retry</button>
        </div>
        <Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={styles.header}>
        <div style={styles.accentBar} />
        <Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
        <div style={styles.titleRow}>
          <span style={styles.title}>{strategy?.name || 'Journal'}</span>
          <span style={styles.tabSeparator}>|</span>
          <button
            style={styles.tabToggle}
            onClick={() => setActiveTab(activeTab === 'journal' ? 'analytics' : 'journal')}
          >
            {activeTab === 'journal' ? 'Analytics' : 'Journal'}
          </button>
        </div>
      </div>

      <div style={{ flex: activeTab === 'analytics' ? 1 : undefined, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {activeTab === 'journal' && (
          <MetricsPanel
            metrics={metrics}
            isLoading={metricsLoading}
            error={metricsError}
          />
        )}

        {activeTab === 'journal' ? (
          <>
            <TradeTable
              trades={trades}
              onSelect={openTradeDetail}
              isLoading={tradesLoading}
              error={tradesError}
            />

            <button className="fab" onClick={openAddTrade} title="Add trade">
              +
            </button>
          </>
        ) : (
          <AnalyticsPanel
            trades={trades}
            metrics={metrics}
            equity={equity}
            metricsLoading={metricsLoading}
            equityLoading={equityLoading}
          />
        )}
      </div>

      <SideTray isOpen={trayOpen} onClose={() => setTrayOpen(false)}>
        {trayMode === 'detail' && selectedTrade && (
          <TradeDetail
            trade={selectedTrade}
            onEdit={openEditTrade}
            onDelete={setDeletingTrade}
            onClose={() => setTrayOpen(false)}
          />
        )}
        {trayMode === 'form' && (
          <TradeForm
            trade={editingTrade}
            onSave={handleFormSave}
            onCancel={() => setTrayOpen(false)}
            saving={formSaving}
            error={formError}
          />
        )}
      </SideTray>

      <ConfirmDialog
        isOpen={!!deletingTrade}
        title="Delete Trade"
        message="Are you sure you want to delete this trade? This action cannot be undone."
        onConfirm={handleDeleteTrade}
        onCancel={() => setDeletingTrade(null)}
      />
    </div>
  );
}
