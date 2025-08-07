import { createRoot } from 'react-dom/client';
import '@fontsource/inter';
import './index.css';
import { AppRouter } from '@/app/router';
import { AppProviders } from '@/app/providers/AppProviders';

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <AppRouter />
  </AppProviders>
);
