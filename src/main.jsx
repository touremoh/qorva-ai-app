import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import '@fontsource-variable/inter';
import './index.css';
import App from './App.jsx';
import { theme } from './theme';
import AppErrorBoundary from './shared/ui/AppErrorBoundary.jsx';
import './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </ThemeProvider>
  </StrictMode>,
)
