import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import MentekPage from './MentekPage.jsx';
import { initialiseAnalytics, track } from './analytics.js';
import './styles.css';

const rootElement = document.getElementById('root');
const application = <StrictMode><MentekPage /></StrictMode>;

if (rootElement.hasChildNodes()) hydrateRoot(rootElement, application);
else createRoot(rootElement).render(application);

initialiseAnalytics();

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const target = event.target.closest('[data-analytics]');
  if (target) track(target.dataset.analytics);
});
