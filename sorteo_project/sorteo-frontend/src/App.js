// sorteo-frontend/src/App.js

import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Home from './components/Home';
import Sorteo from './components/Sorteo';
import PremioManager from './components/PremioManager';
import UploadCSV from './components/UploadCSV';
import Historico from './components/Historico';
import AdminRedirect from './components/AdminRedirect';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App () {
  return (
    <Router>
      <div>
        {/* Navegación Principal */}
        <nav>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/sorteo">Sorteo</Link></li>
            <li><Link to="/premios">Gestor de Premios</Link></li>
            <li><Link to="/upload-csv">Upload CSV</Link></li>
            <li><Link to="/historico">Histórico</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>
        <hr />
        {/* Rutas de la Aplicación */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sorteo" element={<Sorteo />} />
          <Route path="/premios" element={<PremioManager />} />
          <Route path="/upload-csv" element={<UploadCSV />} />
          <Route path="/historico" element={<Historico />} />
          <Route path="/admin" element={<AdminRedirect />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
