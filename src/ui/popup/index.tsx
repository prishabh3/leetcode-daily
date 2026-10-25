import { createRoot } from 'react-dom/client';
import { PopupApp } from './PopupApp';
import '../common/theme.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
