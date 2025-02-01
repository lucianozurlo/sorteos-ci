// sorteo-frontend/src/App.js

import React from 'react';
import {BrowserRouter as Router, Route, Routes, Link} from 'react-router-dom';
import Sorteo from './components/Sorteo';
import PremioManager from './components/PremioManager';
import UploadCSV from './components/UploadCSV';
import Historico from './components/Historico';
import AdminRedirect from './components/AdminRedirect'; // Importa el componente AdminRedirect
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Asegúrate de tener estilos para una mejor apariencia

function App () {
  return (
    <Router>
      <div>
        {/* Navegación Principal */}
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/premios">Gestor de Premios</Link></li>
            <li><Link to="/upload-csv">Upload CSV</Link></li>
            <li><Link to="/historico">Histórico</Link></li>
            <li><Link to="/admin">Admin</Link></li>
            {' '}
            {/* Añade el enlace a /admin */}
          </ul>
        </nav>
        <hr />

        {/* Contenedor de Rutas */}
        <Routes>
          <Route path="/" element={<Sorteo />} />
          <Route path="/premios" element={<PremioManager />} />
          <Route path="/upload-csv" element={<UploadCSV />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/admin" element={<AdminRedirect />} />
          {' '}
          {/* Añade la ruta para /admin */}
        </Routes>

        {/* Contenedor de Notificaciones */}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
