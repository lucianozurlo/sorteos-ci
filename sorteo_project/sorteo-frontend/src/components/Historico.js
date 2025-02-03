// sorteo-frontend/src/components/Historico.js

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './Historico.css';

function Historico() {
  // Datos generales
  const [sorteos, setSorteos] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [cargandoSorteos, setCargandoSorteos] = useState(false);
  const [cargandoResultados, setCargandoResultados] = useState(false);
  const [cargandoActividad, setCargandoActividad] = useState(false);

  // ================================
  // FILTROS Y ORDENAMIENTO PARA RESULTADOS
  // ================================
  const [filtroSorteo, setFiltroSorteo] = useState('');
  const [filtroParticipante, setFiltroParticipante] = useState('');
  const [filtroPremio, setFiltroPremio] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const [opcionesSorteo, setOpcionesSorteo] = useState([]);
  const [opcionesParticipante, setOpcionesParticipante] = useState([]);
  const [opcionesPremio, setOpcionesPremio] = useState([]);
  const [opcionesFecha, setOpcionesFecha] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'desc' });

  // ================================
  // FILTROS Y ORDENAMIENTO PARA LISTA DE SORTEOS
  // ================================
  // Filtrado por: nombre, descripción y fecha (formateada)
  const [filtroSorteoNombre, setFiltroSorteoNombre] = useState('');
  const [filtroSorteoDescripcion, setFiltroSorteoDescripcion] = useState('');
  const [filtroSorteoFecha, setFiltroSorteoFecha] = useState('');

  const [opcionesSorteoNombre, setOpcionesSorteoNombre] = useState([]);
  const [opcionesSorteoFecha, setOpcionesSorteoFecha] = useState([]);

  const [sortConfigSorteo, setSortConfigSorteo] = useState({ key: 'fecha_hora', direction: 'desc' });

  // ================================
  // FETCH DE DATOS
  // ================================

  const fetchSorteos = async () => {
    setCargandoSorteos(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/sorteos/');
      const data = await response.json();
      // Ordenamos de más nuevo a más viejo según fecha_hora
      const sorteosOrdenados = data.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
      setSorteos(sorteosOrdenados);
    } catch (error) {
      console.error('Error al obtener sorteos:', error);
      toast.error('Error al obtener sorteos.');
    } finally {
      setCargandoSorteos(false);
    }
  };

  const fetchResultados = async () => {
    setCargandoResultados(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/resultados_sorteo/');
      const data = await response.json();
      // Ordenamos de más nuevo a más viejo según fecha
      const resultadosOrdenados = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setResultados(resultadosOrdenados);
    } catch (error) {
      console.error('Error al obtener resultados:', error);
      toast.error('Error al obtener resultados.');
    } finally {
      setCargandoResultados(false);
    }
  };

  const fetchActividad = async () => {
    setCargandoActividad(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/registro_actividad/');
      const data = await response.json();
      setActividad(data);
    } catch (error) {
      console.error('Error al obtener actividad:', error);
      toast.error('Error al obtener actividad.');
    } finally {
      setCargandoActividad(false);
    }
  };

  useEffect(() => {
    fetchSorteos();
    fetchResultados();
    fetchActividad();
  }, []);

  // ================================
  // OPCIONES DE FILTRO PARA RESULTADOS
  // ================================
  useEffect(() => {
    // Opciones para sorteo
    const nombresSorteo = Array.from(
      new Set(resultados.map(r => r.sorteo && r.sorteo.nombre).filter(Boolean))
    );
    setOpcionesSorteo(nombresSorteo);

    // Opciones para participante (nombre y apellido concatenados)
    const nombresParticipante = Array.from(
      new Set(
        resultados
          .map(r => (r.participante ? `${r.participante.nombre} ${r.participante.apellido}` : ''))
          .filter(Boolean)
      )
    );
    setOpcionesParticipante(nombresParticipante);

    // Opciones para premio
    const nombresPremio = Array.from(
      new Set(resultados.map(r => r.premio && r.premio.nombre).filter(Boolean))
    );
    setOpcionesPremio(nombresPremio);

    // Opciones para fecha (YYYY-MM-DD)
    const fechasUnicas = Array.from(
      new Set(
        resultados
          .map(r => {
            const d = new Date(r.fecha);
            return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
          })
          .filter(Boolean)
      )
    );
    setOpcionesFecha(fechasUnicas);
  }, [resultados]);

  // ================================
  // FILTRADO Y ORDENAMIENTO PARA RESULTADOS
  // ================================
  const resultadosFiltrados = useMemo(() => {
    return resultados.filter(r => {
      const matchSorteo = filtroSorteo ? (r.sorteo && r.sorteo.nombre === filtroSorteo) : true;
      const participanteNombre = r.participante ? `${r.participante.nombre} ${r.participante.apellido}` : '';
      const matchParticipante = filtroParticipante ? (participanteNombre === filtroParticipante) : true;
      const matchPremio = filtroPremio ? (r.premio && r.premio.nombre === filtroPremio) : true;
      const d = new Date(r.fecha);
      const fechaFormateada = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
      const matchFecha = filtroFecha ? (fechaFormateada === filtroFecha) : true;
      return matchSorteo && matchParticipante && matchPremio && matchFecha;
    });
  }, [resultados, filtroSorteo, filtroParticipante, filtroPremio, filtroFecha]);

  const sortedResultados = useMemo(() => {
    let sortableItems = [...resultadosFiltrados];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal, bVal;
        switch (sortConfig.key) {
          case 'id':
            aVal = a.id;
            bVal = b.id;
            break;
          case 'sorteo':
            aVal = a.sorteo?.nombre || '';
            bVal = b.sorteo?.nombre || '';
            break;
          case 'participante':
            aVal = a.participante ? `${a.participante.nombre} ${a.participante.apellido}` : '';
            bVal = b.participante ? `${b.participante.nombre} ${b.participante.apellido}` : '';
            break;
          case 'premio':
            aVal = a.premio?.nombre || '';
            bVal = b.premio?.nombre || '';
            break;
          case 'fecha':
            aVal = new Date(a.fecha);
            bVal = new Date(b.fecha);
            break;
          default:
            return 0;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [resultadosFiltrados, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const clearFilters = () => {
    setFiltroSorteo('');
    setFiltroParticipante('');
    setFiltroPremio('');
    setFiltroFecha('');
  };

  // ================================
  // OPCIONES DE FILTRO PARA LISTA DE SORTEOS
  // ================================
  useEffect(() => {
    // Opciones para Nombre
    const nombres = Array.from(new Set(sorteos.map(s => s.nombre).filter(Boolean)));
    setOpcionesSorteoNombre(nombres);

    // Opciones para Fecha (formateadas como YYYY-MM-DD)
    const fechas = Array.from(
      new Set(
        sorteos.map(s => {
          const d = new Date(s.fecha_hora);
          return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
        }).filter(Boolean)
      )
    );
    setOpcionesSorteoFecha(fechas);
  }, [sorteos]);

  // ================================
  // FILTRADO Y ORDENAMIENTO PARA LISTA DE SORTEOS
  // ================================
  const sorteosFiltrados = useMemo(() => {
    return sorteos.filter(s => {
      const matchNombre = filtroSorteoNombre ? s.nombre === filtroSorteoNombre : true;
      const matchDescripcion = filtroSorteoDescripcion
        ? s.descripcion.toLowerCase().includes(filtroSorteoDescripcion.toLowerCase())
        : true;
      const d = new Date(s.fecha_hora);
      const fechaFormateada = `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
      const matchFecha = filtroSorteoFecha ? fechaFormateada === filtroSorteoFecha : true;
      return matchNombre && matchDescripcion && matchFecha;
    });
  }, [sorteos, filtroSorteoNombre, filtroSorteoDescripcion, filtroSorteoFecha]);

  const sortedSorteos = useMemo(() => {
    let sortableItems = [...sorteosFiltrados];
    if (sortConfigSorteo !== null) {
      sortableItems.sort((a, b) => {
        let aVal, bVal;
        switch (sortConfigSorteo.key) {
          case 'id':
            aVal = a.id;
            bVal = b.id;
            break;
          case 'nombre':
            aVal = a.nombre || '';
            bVal = b.nombre || '';
            break;
          case 'descripcion':
            aVal = a.descripcion || '';
            bVal = b.descripcion || '';
            break;
          case 'fecha_hora':
            aVal = new Date(a.fecha_hora);
            bVal = new Date(b.fecha_hora);
            break;
          default:
            return 0;
        }
        if (aVal < bVal) return sortConfigSorteo.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfigSorteo.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [sorteosFiltrados, sortConfigSorteo]);

  const requestSortSorteo = (key) => {
    let direction = 'asc';
    if (sortConfigSorteo.key === key && sortConfigSorteo.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfigSorteo({ key, direction });
  };

  const clearSorteoFilters = () => {
    setFiltroSorteoNombre('');
    setFiltroSorteoDescripcion('');
    setFiltroSorteoFecha('');
  };

  // ================================
  // RENDERIZACIÓN
  // ================================
  return (
    <div className="historico-container">
      <h2>Histórico de Sorteos y Actividades</h2>

      {/* FILTROS Y ORDENAMIENTO PARA RESULTADOS */}
      <div className="filtros-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <div className="filtro">
          <label>Sorteo:</label>
          <select value={filtroSorteo} onChange={(e) => setFiltroSorteo(e.target.value)}>
            <option value="">Todos</option>
            {opcionesSorteo.map((nombre, idx) => (
              <option key={idx} value={nombre}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <label>Participante:</label>
          <select value={filtroParticipante} onChange={(e) => setFiltroParticipante(e.target.value)}>
            <option value="">Todos</option>
            {opcionesParticipante.map((nombre, idx) => (
              <option key={idx} value={nombre}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <label>Premio:</label>
          <select value={filtroPremio} onChange={(e) => setFiltroPremio(e.target.value)}>
            <option value="">Todos</option>
            {opcionesPremio.map((nombre, idx) => (
              <option key={idx} value={nombre}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <label>Fecha:</label>
          <select value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)}>
            <option value="">Todas</option>
            {opcionesFecha.map((fecha, idx) => (
              <option key={idx} value={fecha}>{fecha}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <button onClick={clearFilters}>Eliminar Filtros</button>
        </div>
      </div>

      <div className="historico-section">
        <h3>Resultados de Sorteos</h3>
        {cargandoResultados ? (
          <ClipLoader size={50} color="#123abc" />
        ) : (
          <table className="historico-table">
            <thead>
              <tr>
                <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>
                  ID {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSort('sorteo')} style={{ cursor: 'pointer' }}>
                  Sorteo {sortConfig.key === 'sorteo' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSort('participante')} style={{ cursor: 'pointer' }}>
                  Participante {sortConfig.key === 'participante' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSort('premio')} style={{ cursor: 'pointer' }}>
                  Premio {sortConfig.key === 'premio' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSort('fecha')} style={{ cursor: 'pointer' }}>
                  Fecha {sortConfig.key === 'fecha' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResultados.map(resultado => (
                <tr key={resultado.id}>
                  <td>{resultado.id}</td>
                  <td>{resultado.sorteo && resultado.sorteo.nombre ? resultado.sorteo.nombre : 'Sin nombre'}</td>
                  <td>
                    {(resultado.participante && resultado.participante.nombre) || 'Sin participante'}{' '}
                    {(resultado.participante && resultado.participante.apellido) || ''}
                  </td>
                  <td>{resultado.premio && resultado.premio.nombre ? resultado.premio.nombre : 'Sin premio'}</td>
                  <td>{new Date(resultado.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr />

      {/* FILTROS Y ORDENAMIENTO PARA LISTA DE SORTEOS */}
      <div className="filtros-container" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
        <div className="filtro">
          <label>Nombre:</label>
          <select value={filtroSorteoNombre} onChange={(e) => setFiltroSorteoNombre(e.target.value)}>
            <option value="">Todos</option>
            {opcionesSorteoNombre.map((nombre, idx) => (
              <option key={idx} value={nombre}>{nombre}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <label>Descripción:</label>
          <input
            type="text"
            value={filtroSorteoDescripcion}
            onChange={(e) => setFiltroSorteoDescripcion(e.target.value)}
            placeholder="Buscar descripción..."
          />
        </div>
        <div className="filtro">
          <label>Fecha:</label>
          <select value={filtroSorteoFecha} onChange={(e) => setFiltroSorteoFecha(e.target.value)}>
            <option value="">Todas</option>
            {opcionesSorteoFecha.map((fecha, idx) => (
              <option key={idx} value={fecha}>{fecha}</option>
            ))}
          </select>
        </div>
        <div className="filtro">
          <button onClick={clearSorteoFilters}>Eliminar Filtros</button>
        </div>
      </div>

      <div className="historico-section">
        <h3>Lista de Sorteos</h3>
        {cargandoSorteos ? (
          <ClipLoader size={50} color="#123abc" />
        ) : (
          <table className="historico-table">
            <thead>
              <tr>
                <th onClick={() => requestSortSorteo('id')} style={{ cursor: 'pointer' }}>
                  ID {sortConfigSorteo.key === 'id' ? (sortConfigSorteo.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSortSorteo('nombre')} style={{ cursor: 'pointer' }}>
                  Nombre {sortConfigSorteo.key === 'nombre' ? (sortConfigSorteo.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSortSorteo('descripcion')} style={{ cursor: 'pointer' }}>
                  Descripción {sortConfigSorteo.key === 'descripcion' ? (sortConfigSorteo.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th onClick={() => requestSortSorteo('fecha_hora')} style={{ cursor: 'pointer' }}>
                  Fecha y Hora {sortConfigSorteo.key === 'fecha_hora' ? (sortConfigSorteo.direction === 'asc' ? '▲' : '▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSorteos.map(sorteo => (
                <tr key={sorteo.id}>
                  <td>{sorteo.id}</td>
                  <td>{sorteo.nombre || 'Sin nombre'}</td>
                  <td>{sorteo.descripcion || '-'}</td>
                  <td>{new Date(sorteo.fecha_hora).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <hr />

      {/* REGISTRO DE ACTIVIDADES */}
      <div className="historico-section">
        <h3>Registro de Actividades</h3>
        {cargandoActividad ? (
          <ClipLoader size={50} color="#123abc" />
        ) : (
          <ul className="actividad-list">
            {actividad.map(act => (
              <li key={act.id}>
                {new Date(act.fecha_hora).toLocaleString()} - {act.evento}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Historico;
