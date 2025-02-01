// sorteo-frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa desde 'react-dom/client'
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById ('root');

// Crea el root utilizando ReactDOM.createRoot
const root = ReactDOM.createRoot (container);

// Renderiza la aplicación dentro del root
root.render (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Opcional: Puedes pasar una función para medir el rendimiento
reportWebVitals (console.log);
