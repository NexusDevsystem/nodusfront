import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './components/landing/i18n/LanguageContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import './index.css';

// Clean Up Console - Removes annoying library messages
if (typeof window !== 'undefined') {
  const originalLog = console.log;
  console.log = (...args) => {
    if (typeof args[0] === 'string' && (
      args[0].includes('i18next') || 
      args[0].includes('Locize') || 
      args[0].includes('React DevTools')
    )) return;
    originalLog(...args);
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="632892081798-gothfv2nqj6a6k4gfukltishejnq0f9d.apps.googleusercontent.com">
      <LanguageProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </I18nextProvider>
      </LanguageProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);