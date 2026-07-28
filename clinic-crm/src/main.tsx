import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { applyDenseMode } from './lib/denseMode';
import App from './App';

applyDenseMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
