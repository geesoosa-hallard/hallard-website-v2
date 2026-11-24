import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import MentekPage from './MentekPage.jsx';
import FoundingCirclePage from './FoundingCirclePage.jsx';

export function render(url = '/') {
  if (url === '/mentek.html') return renderToString(<MentekPage />);
  if (url === '/founding-circle.html') return renderToString(<FoundingCirclePage />);
  return renderToString(<App />);
}