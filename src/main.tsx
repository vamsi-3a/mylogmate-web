import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// Dark mode was removed — clean up any leftover state from previous versions
// so the page never renders in the dark theme.
document.documentElement.classList.remove('dark');
try { localStorage.removeItem('mlm-theme'); } catch { /* ignore */ }

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
