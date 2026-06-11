import { ReactNode, useEffect } from 'react';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 999,
    transition: 'opacity 0.3s ease',
  },
  tray: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    width: '480px',
    maxWidth: '100vw',
    background: 'var(--bg-card)',
    borderLeft: '1px solid var(--border)',
    zIndex: 1000,
    overflowY: 'auto',
    transition: 'transform 0.3s ease',
    padding: '24px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
};

interface SideTrayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function SideTray({ isOpen, onClose, children }: SideTrayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        style={styles.overlay}
        onClick={onClose}
        role="presentation"
      />
      <div style={styles.tray}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          &times;
        </button>
        {children}
      </div>
    </>
  );
}
