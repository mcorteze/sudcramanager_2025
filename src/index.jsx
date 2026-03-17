import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import { appConfig } from './config/appConfig';

const container = document.getElementById('root');
const root = createRoot(container);

appConfig.load().finally(() => {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  reportWebVitals();
});
