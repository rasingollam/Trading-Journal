import { ReactNode } from 'react';

const styles: Record<string, React.CSSProperties> = {
  header: {
    background: 'var(--bg-secondary)',
    borderBottom: '2px solid var(--accent-gold)',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 12px rgba(255, 215, 0, 0.15)',
  },
  headerIcon: {
    fontSize: '24px',
    color: 'var(--accent-gold)',
  },
  headerTitle: {
    color: 'var(--accent-gold)',
    fontFamily: 'var(--font-mono)',
    fontSize: '20px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textTransform: 'uppercase' as const,
  },
  main: {
    minHeight: 'calc(100vh - 57px)',
    padding: '24px',
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div>
      <header style={styles.header}>
        <span style={styles.headerIcon}>&#9733;</span>
        <span style={styles.headerTitle}>Trading Journal</span>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  );
}
