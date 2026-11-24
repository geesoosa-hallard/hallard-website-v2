import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import MentekPage from './MentekPage.jsx';

export function render(url = '/') {
  return renderToString(url === '/mentek.html' ? <MentekPage /> : <App />);
}
