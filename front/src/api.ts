import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
          <Toaster
  position="bottom-right"
  toastOptions={{
    duration: 4000,
    style: {
      fontSize: '15px',
      padding: '12px 16px',
      background: '#333',
      color: '#fff',
      borderRadius: '8px',
    },
    success: {
      style: {
        background: '#22c55e', // Tailwind green-500
      },
      icon: '✅',
    },
    error: {
      style: {
        background: '#ef4444', // Tailwind red-500
      },
      icon: '❌',
    },
  }}
/>

      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);