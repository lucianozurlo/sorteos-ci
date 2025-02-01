import logo from './logo.svg';
import './App.css';

import React from 'react';
import UploadCSV from './components/UploadCSV';
import Sorteo from './components/Sorteo';
import Historico from './components/Historico';

function App () {
  return (
    <div>
      <UploadCSV />
      <Sorteo />
      <Historico />
    </div>
  );
}

export default App;
