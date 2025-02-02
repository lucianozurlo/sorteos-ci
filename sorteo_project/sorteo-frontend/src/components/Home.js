// sorteo-frontend/src/components/Home.js

import React from 'react';
import {Link} from 'react-router-dom';

function Home () {
  return (
    <div>
      <h1>Bienvenido al Sistema de Sorteos</h1>
      <ul>
        <li><Link to="/sorteo">Realizar Sorteo</Link></li>
        <li><Link to="/premios">Gestor de Premios</Link></li>
        <li><Link to="/upload-csv">Upload CSV</Link></li>
        <li><Link to="/historico">Histórico</Link></li>
        <li><Link to="/admin">Admin</Link></li>
      </ul>
    </div>
  );
}

export default Home;
