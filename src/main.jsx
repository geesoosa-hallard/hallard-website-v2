import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { initialiseAnalytics, track } from './analytics.js';
import './styles.css';

const rootElement = document.getElementById('root');
const application = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, application);
} else {
  createRoot(rootElement).render(application);
}

initialiseAnalytics();

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest('[data-analytics]');
  if (target) track(target.dataset.analytics);
});

document.addEventListener('submit', (event) => {
  if (!(event.target instanceof HTMLFormElement)) return;
  if (event.target.dataset.analytics) track(event.target.dataset.analytics);
});
