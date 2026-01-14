import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';

const rootElement = document.getElementById('root')!;
if (!rootElement) {
  console.error('Failed to find root element with id "root"');
  throw new Error('Root element not found. Make sure your HTML contains <div id="root"></div>');
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render React application:', error);
  throw error;
}
