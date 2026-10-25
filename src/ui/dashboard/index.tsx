import { createRoot } from 'react-dom/client';
import { DashboardApp } from './DashboardApp';
import '../common/theme.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<DashboardApp />);
}
