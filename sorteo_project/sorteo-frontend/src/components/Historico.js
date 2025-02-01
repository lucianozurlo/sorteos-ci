// sorteo-frontend/src/components/Historico.js

import React, {useState, useEffect} from 'react';
import {toast} from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './Historico.css'; // Asegúrate de tener estilos adecuados

function Historico () {
  const [sorteos, setSorteos] = useState ([]);
  const [resultados, setResultados] = useState ([]);
  const [actividad, setActividad] = useState ([]);
  const [cargandoSorteos, setCargandoSorteos] = useState (false);
  const [cargandoResultados, setCargandoResultados] = useState (false);
  const [cargandoActividad, setCargandoActividad] = useState (false);

  // WebSocket
  useEffect (() => {
    const socket = new WebSocket ('ws://127.0.0.1:8000/ws/sorteos/');

    socket.onopen = () => {
      console.log ('Conexión WebSocket establecida');
    };

    socket.onmessage = e => {
      const data = JSON.parse (e.data);
      if (data.type === 'sorteo') {
        const nuevoSorteo = data.sorteo;
        setSorteos (prevSorteos => [nuevoSorteo, ...prevSorteos]);
        toast.info (`Nuevo sorteo realizado: ${nuevoSorteo.nombre}`);
        // Opcional: Actualizar resultados y actividad si es necesario
        fetchResultados ();
        fetchActividad ();
      }
    };

    socket.onerror = e => {
      console.error ('Error en WebSocket:', e);
      toast.error ('Error en la conexión WebSocket.');
    };

    socket.onclose = () => {
      console.log ('WebSocket cerrado');
    };

    // Cleanup on unmount
    return () => {
      socket.close ();
    };
  }, []);

  // Fetch Sorteos
  const fetchSorteos = async () => {
    setCargandoSorteos (true);
    try {
      const response = await fetch ('http://127.0.0.1:8000/api/sorteos/');
      const data = await response.json ();
      setSorteos (data);
    } catch (error) {
      console.error ('Error al obtener sorteos:', error);
      toast.error ('Error al obtener sorteos.');
    } finally {
      setCargandoSorteos (false);
    }
  };

  // Fetch Resultados
  const fetchResultados = async () => {
    setCargandoResultados (true);
    try {
      const response = await fetch (
        'http://127.0.0.1:8000/api/resultados_sorteo/'
      );
      const data = await response.json ();
      setResultados (data);
    } catch (error) {
      console.error ('Error al obtener resultados:', error);
      toast.error ('Error al obtener resultados.');
    } finally {
      setCargandoResultados (false);
    }
  };

  // Fetch Actividad
  const fetchActividad = async () => {
    setCargandoActividad (true);
    try {
      const response = await fetch (
        'http://127.0.0.1:8000/api/registro_actividad/'
      );
      const data = await response.json ();
      setActividad (data);
    } catch (error) {
      console.error ('Error al obtener actividad:', error);
      toast.error ('Error al obtener actividad.');
    } finally {
      setCargandoActividad (false);
    }
  };

  useEffect (() => {
    fetchSorteos ();
    fetchResultados ();
    fetchActividad ();
  }, []);

  return (
    <div className="historico-container">
      <h2>Histórico de Sorteos y Actividades</h2>

      {/* Lista de Sorteos */}
      <div className="historico-section">
        <h3>Lista de Sorteos</h3>
        {cargandoSorteos
          ? <ClipLoader size={50} color="#123abc" />
          : <table className="historico-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Fecha y Hora</th>
                </tr>
              </thead>
              <tbody>
                {sorteos.map (sorteo => (
                  <tr key={sorteo.id}>
                    <td>{sorteo.id}</td>
                    <td>{sorteo.nombre}</td>
                    <td>{sorteo.descripcion}</td>
                    <td>{new Date (sorteo.fecha_hora).toLocaleString ()}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      <hr />

      {/* Lista de Resultados */}
      <div className="historico-section">
        <h3>Resultados de Sorteos</h3>
        {cargandoResultados
          ? <ClipLoader size={50} color="#123abc" />
          : <table className="historico-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sorteo</th>
                  <th>Usuario</th>
                  <th>Premio</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map (resultado => (
                  <tr key={resultado.id}>
                    <td>{resultado.id}</td>
                    <td>{resultado.sorteo.nombre}</td>
                    <td>
                      {resultado.usuario.first_name}
                      {' '}
                      {resultado.usuario.last_name}
                    </td>
                    <td>{resultado.premio.nombre}</td>
                    <td>{new Date (resultado.fecha).toLocaleString ()}</td>
                  </tr>
                ))}
              </tbody>
            </table>}
      </div>

      <hr />

      {/* Lista de Actividad */}
      <div className="historico-section">
        <h3>Registro de Actividades</h3>
        {cargandoActividad
          ? <ClipLoader size={50} color="#123abc" />
          : <ul className="actividad-list">
              {actividad.map (act => (
                <li key={act.id}>
                  {new Date (act.fecha_hora).toLocaleString ()} - {act.evento}
                </li>
              ))}
            </ul>}
      </div>
    </div>
  );
}

export default Historico;
