import { createRoot } from 'react-dom/client';
import { OptionsApp } from './OptionsApp';
import '../common/theme.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
