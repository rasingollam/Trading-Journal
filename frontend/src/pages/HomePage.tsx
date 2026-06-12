import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStrategies } from '../hooks/useStrategies';
import StrategyCard, { StrategyCardSkeleton } from '../components/StrategyCard';
import StrategyDialog from '../components/StrategyDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { getMetrics } from '../api/trades';
import type { Strategy } from '../types';

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
  systemLabel: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  },
  title: {
    color: 'var(--accent-gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '28px',
    letterSpacing: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
};

export default function HomePage() {
  const { strategies, loading, error, createStrategy, updateStrategy, deleteStrategy, refresh } = useStrategies();
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [deletingStrategy, setDeletingStrategy] = useState<Strategy | null>(null);
  const [metricsMap, setMetricsMap] = useState<Record<number, { winRate: number; profitFactor: number | null; drawdown: number; sharpeRatio: number | null }>>({});

  useEffect(() => {
    if (strategies.length > 0) {
      strategies.forEach((s) => {
        getMetrics(s.id)
          .then((m) => {
            setMetricsMap((prev) => ({ ...prev, [s.id]: m }));
          })
          .catch(() => {});
      });
    }
  }, [strategies]);

  const handleSave = async (data: { name: string; description?: string }) => {
    if (editingStrategy) {
      await updateStrategy(editingStrategy.id, data);
    } else {
      await createStrategy(data);
    }
  };

  const handleDelete = async () => {
    if (!deletingStrategy) return;
    await deleteStrategy(deletingStrategy.id);
    setDeletingStrategy(null);
  };

  const openCreate = () => {
    setEditingStrategy(null);
    setDialogOpen(true);
  };

  const openEdit = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingStrategy(null);
  };

  return (
    <div>
      <div style={styles.header}>
        <div style={styles.accentBar} />
        <div style={styles.systemLabel}>■ TRADING JOURNAL</div>
        <h1 style={styles.title}>Strategies</h1>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '16px' }}>
          <span>{error}</span>
          <button onClick={refresh}>Retry</button>
        </div>
      )}

      {loading && (
        <div style={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <StrategyCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && strategies.length === 0 && (
        <div className="empty-state">
          <h3>No strategies yet</h3>
          <p>Create your first strategy to start journaling.</p>
          <button onClick={openCreate}>Create Strategy</button>
        </div>
      )}

      {!loading && !error && strategies.length > 0 && (
        <div style={styles.grid}>
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              winRate={metricsMap[strategy.id]?.winRate}
              profitFactor={metricsMap[strategy.id]?.profitFactor}
              drawdown={metricsMap[strategy.id]?.drawdown}
              sharpeRatio={metricsMap[strategy.id]?.sharpeRatio}
              onEdit={openEdit}
              onDelete={setDeletingStrategy}
              onClick={(s) => navigate(`/strategies/${s.id}`)}
            />
          ))}
        </div>
      )}

      <button className="fab" onClick={openCreate} title="Add strategy">
        +
      </button>

      <StrategyDialog
        isOpen={dialogOpen}
        onClose={closeDialog}
        onSave={handleSave}
        strategy={editingStrategy}
      />

      <ConfirmDialog
        isOpen={!!deletingStrategy}
        title="Delete Strategy"
        message={`Are you sure you want to delete "${deletingStrategy?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingStrategy(null)}
      />
    </div>
  );
}
