// sorteo-frontend/src/components/ListasCargadas.js
import React, {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import {API_BASE_URL} from '../config';
import './ListasCargadas.css';

function ListasCargadas () {
  const [datos, setDatos] = useState (null);
  const [cargando, setCargando] = useState (false);
  const [borrandoParticipantes, setBorrandoParticipantes] = useState (false);
  const [borrandoBlacklist, setBorrandoBlacklist] = useState (false);

  const fetchLists = async () => {
    setCargando (true);
    try {
      const response = await fetch (`${API_BASE_URL}/api/lists/`);
      const data = await response.json ();
      setDatos (data);
    } catch (error) {
      toast.error ('Error al obtener las listas.');
    } finally {
      setCargando (false);
    }
  };

  const clearParticipantes = async () => {
    if (!window.confirm ('¿Estás seguro de borrar todos los participantes?'))
      return;
    setBorrandoParticipantes (true);
    try {
      const response = await fetch (
        `${API_BASE_URL}/api/lists/clear/participantes/`,
        {method: 'DELETE'}
      );
      const data = await response.json ();
      toast.info (data.message);
      fetchLists ();
    } catch (error) {
      toast.error ('Error al borrar los participantes.');
    } finally {
      setBorrandoParticipantes (false);
    }
  };

  const clearBlacklist = async () => {
    if (!window.confirm ('¿Estás seguro de borrar la lista negra?')) return;
    setBorrandoBlacklist (true);
    try {
      const response = await fetch (
        `${API_BASE_URL}/api/lists/clear/blacklist/`,
        {method: 'DELETE'}
      );
      const data = await response.json ();
      toast.info (data.message);
      fetchLists ();
    } catch (error) {
      toast.error ('Error al borrar la lista negra.');
    } finally {
      setBorrandoBlacklist (false);
    }
  };

  useEffect (() => {
    fetchLists ();
  }, []);

  return (
    <div className="listas-container">
      <h2>Listas Cargadas</h2>
      <div className="botones">
        <button onClick={fetchLists}>Refrescar Listas</button>
      </div>
      {cargando
        ? <ClipLoader size={50} color="#123abc" />
        : datos
            ? <div className="listas-contenido">
                {/* Tabla de Participantes */}
                <div className="tabla-section">
                  <h3>Participantes</h3>
                  <button
                    onClick={clearParticipantes}
                    disabled={borrandoParticipantes}
                  >
                    {borrandoParticipantes
                      ? 'Borrando...'
                      : 'Borrar Participantes'}
                  </button>
                  {datos.participantes && datos.participantes.length > 0
                    ? <table className="tabla">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Área</th>
                            <th>Dominio</th>
                            <th>Cargo</th>
                            <th>Email</th>
                            <th>Localidad</th>
                            <th>Provincia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datos.participantes.map (p => (
                            <tr key={p.id}>
                              <td>{p.id}</td>
                              <td>{p.nombre}</td>
                              <td>{p.apellido}</td>
                              <td>{p.area}</td>
                              <td>{p.dominio}</td>
                              <td>{p.cargo}</td>
                              <td>{p.email}</td>
                              <td>{p.localidad}</td>
                              <td>{p.provincia}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    : <p>No hay participantes cargados.</p>}
                </div>
                {/* Tabla de Lista Negra */}
                <div className="tabla-section">
                  <h3>Lista Negra</h3>
                  <button onClick={clearBlacklist} disabled={borrandoBlacklist}>
                    {borrandoBlacklist ? 'Borrando...' : 'Borrar Lista Negra'}
                  </button>
                  {datos.blacklist && datos.blacklist.length > 0
                    ? <table className="tabla">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Área</th>
                            <th>Dominio</th>
                            <th>Cargo</th>
                            <th>Email</th>
                            <th>Localidad</th>
                            <th>Provincia</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datos.blacklist.map (item => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              <td>{item.nombre}</td>
                              <td>{item.apellido}</td>
                              <td>{item.area}</td>
                              <td>{item.dominio}</td>
                              <td>{item.cargo}</td>
                              <td>{item.email}</td>
                              <td>{item.localidad}</td>
                              <td>{item.provincia}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    : <p>No hay registros en la lista negra.</p>}
                </div>
              </div>
            : <p>No se encontraron datos.</p>}
    </div>
  );
}

export default ListasCargadas;
