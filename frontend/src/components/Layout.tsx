import { ReactNode } from 'react';

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: '100vh',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main style={styles.main}>{children}</main>
  );
}
