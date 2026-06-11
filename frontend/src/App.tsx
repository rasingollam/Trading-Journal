import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StrategyJournalPage from './pages/StrategyJournalPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/strategies/:id" element={<StrategyJournalPage />} />
      </Routes>
    </Layout>
  );
}
