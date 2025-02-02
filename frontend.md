sorteo-frontend/package.json:
{
  "name": "sorteo-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/modifiers": "^9.0.0",
    "@dnd-kit/sortable": "^10.0.0",
    "ajv": "^8.17.1",
    "cra-template": "1.2.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-dropzone": "^14.3.5",
    "react-router-dom": "^7.1.3",
    "react-scripts": "5.0.1",
    "react-spinners": "^0.15.0",
    "react-toastify": "^11.0.3",
    "web-vitals": "^4.2.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "proxy": "http://localhost:8000"
}


**************************
sorteo-frontend/src/index.js:
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

**************************
sorteo-frontend/src/App.js:
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


**************************
sorteo-frontend/src/components/Sorteo.js:
// sorteo-frontend/src/components/Sorteo.js

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './Sorteo.css'; // Asegúrate de tener estilos para una mejor apariencia

// Componente para cada Item Ordenable
function SortableItem(props) {
  const { id, nombre_item, cantidad, index } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '8px',
    marginBottom: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#fff',
    cursor: 'grab'
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>{index + 1}°</strong> {nombre_item} - Cantidad: {cantidad}
    </li>
  );
}

function Sorteo() {
  // 1) Campos básicos del sorteo
  const [nombreSorteo, setNombreSorteo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // 2) Filtros
  const [usarFiltros, setUsarFiltros] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');

  // 3) Items (premios) con drag & drop
  // Estructura: [{ id: number, nombre_item: string, cantidad: number }, ...]
  const [items, setItems] = useState([]);
  const [availablePremios, setAvailablePremios] = useState([]);
  const [selectedPremioId, setSelectedPremioId] = useState('');
  const [selectedPremioCantidad, setSelectedPremioCantidad] = useState(1);

  // 4) Resultado del sorteo
  const [resultado, setResultado] = useState(null);

  // 5) Indicador de carga
  const [cargando, setCargando] = useState(false);

  // 6) Estado para almacenar sorteos recibidos vía WebSocket
  const [sorteos, setSorteos] = useState([]);

  // Sensores para dnd-kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  //------------------------------------------------------------
  // Cargar listado de provincias cuando se habilitan filtros
  //------------------------------------------------------------
  useEffect(() => {
    if (usarFiltros) {
      fetch('http://127.0.0.1:8000/api/provincias/')
        .then(res => res.json())
        .then(data => setProvincias(data))
        .catch(err => {
          console.error(err);
          toast.error('Error al cargar provincias.');
        });
    } else {
      // Si no usamos filtros, limpiamos
      setProvincias([]);
      setProvinciaSeleccionada('');
      setLocalidades([]);
      setLocalidadSeleccionada('');
    }
  }, [usarFiltros]);

  //------------------------------------------------------------
  // Cargar listado de localidades cuando cambia provincia
  //------------------------------------------------------------
  useEffect(() => {
    if (usarFiltros && provinciaSeleccionada) {
      fetch(`http://127.0.0.1:8000/api/localidades/?provincia=${provinciaSeleccionada}`)
        .then(res => res.json())
        .then(data => setLocalidades(data))
        .catch(err => {
          console.error(err);
          toast.error('Error al cargar localidades.');
        });
    } else {
      setLocalidades([]);
      setLocalidadSeleccionada('');
    }
  }, [usarFiltros, provinciaSeleccionada]);

  //------------------------------------------------------------
  // Cargar listado de premios disponibles
  //------------------------------------------------------------
  useEffect(() => {
    fetchAvailablePremios();
  }, []);

  const fetchAvailablePremios = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/premios/');
      const data = await response.json();
      // Filtrar premios con stock > 0
      const available = data.filter(p => p.stock > 0);
      setAvailablePremios(available);
    } catch (error) {
      console.error('Error al obtener los premios:', error);
      toast.error('Error al obtener los premios.');
    }
  };

  //------------------------------------------------------------
  // Agregar un premio seleccionado al sorteo
  //------------------------------------------------------------
  const agregarPremioAlSorteo = () => {
    if (!selectedPremioId) {
      toast.error('Por favor, selecciona un premio.');
      return;
    }

    const premio = availablePremios.find(p => p.id === parseInt(selectedPremioId));
    if (!premio) {
      toast.error('Premio no encontrado.');
      return;
    }

    if (selectedPremioCantidad < 1) {
      toast.error('La cantidad debe ser al menos 1.');
      return;
    }

    if (selectedPremioCantidad > premio.stock) {
      toast.error(`No hay suficiente stock para el premio ${premio.nombre}. Stock disponible: ${premio.stock}`);
      return;
    }

    // Agregar al sorteo
    setItems([...items, {
      id: premio.id,
      nombre_item: premio.nombre,
      cantidad: selectedPremioCantidad
    }]);

    // Reducir el stock en la lista disponible
    setAvailablePremios(availablePremios.filter(p => p.id !== premio.id));

    // Reset selection
    setSelectedPremioId('');
    setSelectedPremioCantidad(1);

    toast.success(`Premio "${premio.nombre}" agregado al sorteo.`);
  };

  //------------------------------------------------------------
  // Eliminar un premio del sorteo
  //------------------------------------------------------------
  const eliminarPremioDelSorteo = (id) => {
    const premio = items.find(p => p.id === id);
    if (!premio) return;

    // Eliminar del sorteo
    setItems(items.filter(p => p.id !== id));

    // Agregar de vuelta al disponible con la cantidad previamente asignada
    setAvailablePremios([...availablePremios, {
      id: premio.id,
      nombre: premio.nombre_item,
      stock: premio.cantidad // Asume que el stock disponible se incrementa en la cantidad eliminada
    }]);

    toast.info(`Premio "${premio.nombre_item}" eliminado del sorteo.`);
  };

  //------------------------------------------------------------
  // Manejar el final del Drag & Drop
  //------------------------------------------------------------
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

  //------------------------------------------------------------
  // Realizar sorteo (POST a /api/sortear/)
  //------------------------------------------------------------
  const handleSortear = async () => {
    if (items.length === 0) {
      toast.error('Por favor, agrega al menos un premio para sortear.');
      return;
    }

    if (!window.confirm(`Realizar sorteo con ${items.length} premios.`)) {
      return;
    }

    const premiosConOrden = items.map((it, index) => ({
      premio_id: it.id,
      orden_item: index + 1,
      cantidad: it.cantidad
    }));

    const payload = {
      nombre: nombreSorteo,
      descripcion: descripcion,
      premios: premiosConOrden
    };

    if (usarFiltros) {
      payload.provincia = provinciaSeleccionada;
      payload.localidad = localidadSeleccionada;
    }

    console.log("Enviando solicitud con payload:", payload);  // <-- Agregado

    setCargando(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/sortear/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Respuesta del servidor:", data);  // <-- Agregado

      if (response.ok) {
        setResultado(data);
        fetchAvailablePremios();
        setNombreSorteo('');
        setDescripcion('');
        setItems([]);
        toast.success('Sorteo realizado exitosamente.');
      } else {
        toast.error(data.error || 'Error al sortear');
        setResultado(null);
      }
    } catch (err) {
      console.error("Error de conexión:", err);
      toast.error('Error de conexión');
      setResultado(null);
    } finally {
      setCargando(false);
    }
  };

  //------------------------------------------------------------
  // Conexión WebSocket
  //------------------------------------------------------------
  useEffect(() => {
    // Establecer conexión WebSocket
    const socket = new WebSocket('ws://localhost:8000/ws/sorteos/');

    socket.onopen = () => {
      console.log('Conectado al WebSocket');
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'sorteo') {
        // Mostrar una notificación
        toast.info(`Nuevo sorteo creado: ${data.sorteo.nombre}`);
        // Actualizar la lista de sorteos
        setSorteos(prevSorteos => [data.sorteo, ...prevSorteos]);
      }
    };

    socket.onerror = (e) => {
      console.error('Error en WebSocket:', e);
    };

    socket.onclose = () => {
      console.log('WebSocket cerrado');
    };

    // Cerrar la conexión al desmontar el componente
    return () => {
      socket.close();
    };
  }, []);

  return (
    <div className="sorteo-container">
      <h1>Realizar Sorteo</h1>

      {/* Datos del sorteo */}
      <div className="sorteo-section">
        <label>Nombre del sorteo:</label>
        <input
          type="text"
          value={nombreSorteo}
          onChange={(e) => setNombreSorteo(e.target.value)}
          placeholder="Nombre del sorteo"
        />
      </div>

      <div className="sorteo-section">
        <label>Descripción:</label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción del sorteo"
        />
      </div>

      <hr />

      {/* Checkbox para habilitar filtros */}
      <div className="sorteo-section">
        <label>
          <input
            type="checkbox"
            checked={usarFiltros}
            onChange={() => setUsarFiltros(!usarFiltros)}
          />
          ¿Aplicar filtros de provincia/localidad?
        </label>
      </div>

      {usarFiltros && (
        <>
          <div className="sorteo-section">
            <label>Provincia:</label>
            <select
              value={provinciaSeleccionada}
              onChange={(e) => setProvinciaSeleccionada(e.target.value)}
            >
              <option value="">-- Seleccionar provincia --</option>
              {provincias.map((prov, idx) => (
                <option key={idx} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="sorteo-section">
            <label>Localidad:</label>
            <select
              value={localidadSeleccionada}
              onChange={(e) => setLocalidadSeleccionada(e.target.value)}
              disabled={!provinciaSeleccionada}
            >
              <option value="">-- Seleccionar localidad --</option>
              {localidades.map((loc, idx) => (
                <option key={idx} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <hr />

      {/* Agregar Premios al Sorteo */}
      <h3>Agregar Premios al Sorteo</h3>
      <div className="sorteo-section">
        <label>Selecciona un premio:</label>
        <select
          value={selectedPremioId}
          onChange={(e) => setSelectedPremioId(e.target.value)}
        >
          <option value="">-- Seleccionar premio --</option>
          {availablePremios.map(premio => (
            <option key={premio.id} value={premio.id}>
              {premio.nombre} (Stock: {premio.stock})
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Cantidad"
          value={selectedPremioCantidad}
          onChange={(e) => setSelectedPremioCantidad(Number(e.target.value))}
          min="1"
          style={{ marginLeft: '10px', width: '60px' }}
        />
        <button onClick={agregarPremioAlSorteo} style={{ marginLeft: '10px' }}>Agregar Premio</button>
      </div>

      {/* Lista de Premios en el Sorteo con Drag & Drop */}
      {items.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext
            items={items.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="sorteo-list">
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  nombre_item={item.nombre_item}
                  cantidad={item.cantidad}
                  index={index}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* Lista de Premios en el Sorteo con Opciones para Eliminar */}
      {items.length > 0 && (
        <div className="sorteo-section">
          <h3>Lista de Premios en el Sorteo</h3>
          <ul className="sorteo-list">
            {items.map(item => (
              <li key={item.id} className="sorteo-item">
                {item.nombre_item} - Cantidad: {item.cantidad}
                <button onClick={() => eliminarPremioDelSorteo(item.id)} className="eliminar-btn">Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr />

      {/* Botón para Realizar el Sorteo */}
      <div className="sorteo-section">
        <button onClick={handleSortear} className="sortear-btn" disabled={cargando}>
          {cargando ? <ClipLoader size={20} color="#ffffff" /> : 'Sortear'}
        </button>
      </div>

      {/* Resultado del Sorteo */}
      {resultado && (
        <div className="sorteo-result">
          <h2>Resultado del Sorteo</h2>
          <p>ID: {resultado.sorteo_id} - Nombre: {resultado.nombre_sorteo}</p>

          {resultado.items && resultado.items.length > 0 ? (
            <ul>
              {resultado.items.map((itemObj, i) => (
                <li key={i}>
                  <strong>{itemObj.orden_item}° Premio:</strong> {itemObj.nombre_item}
                  <ul>
                    {itemObj.ganadores.map((ganador, j) => (
                      <li key={j}>
                        Ganador: {ganador.nombre} {ganador.apellido} ({ganador.email})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin items en la respuesta.</p>
          )}
        </div>
      )}

      {/* Lista de Sorteos Recibidos vía WebSocket */}
      {sorteos.length > 0 && (
        <div className="sorteo-section">
          <h2>Últimos Sorteos</h2>
          <ul>
            {sorteos.map(sorteo => (
              <li key={sorteo.id}>
                {sorteo.nombre} - {new Date(sorteo.fecha_hora).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Sorteo;


**************************
sorteo-frontend/src/components/Historico.js:
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


**************************
sorteo-frontend/src/components/AdminRedirect.js:
// sorteo-frontend/src/components/AdminRedirect.js

import React, { useEffect } from 'react';

function AdminRedirect() {
  useEffect(() => {
    // Redirige al panel de administración de Django
    window.location.href = 'http://localhost:8000/admin/';
  }, []);

  return null; // No renderiza nada
}

export default AdminRedirect;


**************************
sorteo-frontend/src/components/App.js:
// sorteo-frontend/src/components/App.js

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


**************************
sorteo-frontend/src/components/Home.js:
// sorteo-frontend/src/components/Home.js

import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Bienvenido al Sistema de Sorteos</h1>
      <nav>
        <ul>
          <li><Link to="/premios">Gestor de Premios</Link></li>
          <li><Link to="/upload-csv">Upload CSV</Link></li>
          <li><Link to="/historico">Histórico</Link></li>
          <li><Link to="/admin">Admin</Link></li> {/* Opcional: Enlace al AdminRedirect */}
        </ul>
      </nav>
    </div>
  );
}

export default Home;


**************************
sorteo-frontend/src/components/PremioManager.js:
// sorteo-frontend/src/components/PremioManager.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './PremioManager.css'; // Asegúrate de tener estilos adecuados

function PremioManager() {
  const [premios, setPremios] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoStock, setNuevoStock] = useState(1);
  const [editPremioId, setEditPremioId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editStock, setEditStock] = useState(1);
  const [cargando, setCargando] = useState(false);

  // Fetch premios
  const fetchPremios = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/premios/');
      if (!response.ok) {
        throw new Error('Error al obtener los premios');
      }
      const data = await response.json();
      setPremios(data);
    } catch (error) {
      console.error('Error al obtener los premios:', error);
      toast.error('Error al obtener los premios.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchPremios();
  }, []);

  // Agregar premio
  const agregarPremio = async () => {
    if (!nuevoNombre.trim()) {
      toast.error('Por favor, ingresa un nombre para el premio.');
      return;
    }

    if (nuevoStock < 1) {
      toast.error('El stock debe ser al menos 1.');
      return;
    }

    try {
      const response = await fetch('/api/premios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre, stock: nuevoStock }),
      });
      if (response.ok) {
        const nuevoPremio = await response.json();
        setPremios([...premios, nuevoPremio]);
        setNuevoNombre('');
        setNuevoStock(1);
        toast.success(`Premio "${nuevoPremio.nombre}" agregado exitosamente.`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al agregar el premio.');
      }
    } catch (error) {
      console.error('Error al agregar el premio:', error);
      toast.error('Error al agregar el premio.');
    }
  };

  // Editar premio
  const iniciarEdicion = (premio) => {
    setEditPremioId(premio.id);
    setEditNombre(premio.nombre);
    setEditStock(premio.stock);
  };

  const cancelarEdicion = () => {
    setEditPremioId(null);
    setEditNombre('');
    setEditStock(1);
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) {
      toast.error('Por favor, ingresa un nombre para el premio.');
      return;
    }

    if (editStock < 0) {
      toast.error('El stock no puede ser negativo.');
      return;
    }

    try {
      const response = await fetch(`/api/premios/${editPremioId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: editNombre, stock: editStock }),
      });
      if (response.ok) {
        const updatedPremio = await response.json();
        setPremios(premios.map(p => p.id === editPremioId ? updatedPremio : p));
        cancelarEdicion();
        toast.success(`Premio "${updatedPremio.nombre}" actualizado exitosamente.`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al actualizar el premio.');
      }
    } catch (error) {
      console.error('Error al actualizar el premio:', error);
      toast.error('Error al actualizar el premio.');
    }
  };

  // Eliminar premio
  const eliminarPremio = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este premio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/premios/${id}/`, {
        method: 'DELETE',
      });
      if (response.status === 204) {
        setPremios(premios.filter(p => p.id !== id));
        toast.info('Premio eliminado exitosamente.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Error al eliminar el premio.');
      }
    } catch (error) {
      console.error('Error al eliminar el premio:', error);
      toast.error('Error al eliminar el premio.');
    }
  };

  return (
    <div className="premio-manager-container">
      <h2>Gestor de Premios</h2>

      {/* Agregar Nuevo Premio */}
      <div className="premio-manager-section">
        <h3>Agregar Nuevo Premio</h3>
        <input
          type="text"
          placeholder="Nombre del premio"
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
        />
        <input
          type="number"
          placeholder="Stock"
          value={nuevoStock}
          onChange={(e) => setNuevoStock(Number(e.target.value))}
          min="1"
        />
        <button onClick={agregarPremio}>Agregar Premio</button>
      </div>

      <hr />

      {/* Lista de Premios */}
      <div className="premio-manager-section">
        <h3>Lista de Premios</h3>
        {cargando ? (
          <ClipLoader size={50} color="#123abc" />
        ) : (
          <table className="premio-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {premios.map(premio => (
                <tr key={premio.id}>
                  <td>
                    {editPremioId === premio.id ? (
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                      />
                    ) : (
                      premio.nombre
                    )}
                  </td>
                  <td>
                    {editPremioId === premio.id ? (
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(Number(e.target.value))}
                        min="0"
                      />
                    ) : (
                      premio.stock
                    )}
                  </td>
                  <td>
                    {editPremioId === premio.id ? (
                      <>
                        <button onClick={guardarEdicion}>Guardar</button>
                        <button onClick={cancelarEdicion} className="cancelar-btn">Cancelar</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => iniciarEdicion(premio)}>Editar</button>
                        <button onClick={() => eliminarPremio(premio.id)} className="eliminar-btn">Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default PremioManager;


**************************
sorteo-frontend/src/components/UploadCSV.js:
// sorteo-frontend/src/components/UploadCSV.js

import React, {useCallback, useState} from 'react';
import {useDropzone} from 'react-dropzone';
import {toast} from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './UploadCSV.css'; // Asegúrate de crear este archivo para estilos

function UploadCSV () {
  const [filesUsuarios, setFilesUsuarios] = useState (null);
  const [filesListaNegra, setFilesListaNegra] = useState (null);
  const [mensaje, setMensaje] = useState ('');
  const [cargando, setCargando] = useState (false);

  const onDropUsuarios = useCallback (acceptedFiles => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setFilesUsuarios (file);
      toast.success (
        `Archivo de usuarios "${file.name}" cargado correctamente.`
      );
    } else {
      toast.error ('Por favor, sube un archivo CSV válido para usuarios.');
    }
  }, []);

  const onDropListaNegra = useCallback (acceptedFiles => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      setFilesListaNegra (file);
      toast.success (
        `Archivo de lista negra "${file.name}" cargado correctamente.`
      );
    } else {
      toast.error ('Por favor, sube un archivo CSV válido para lista negra.');
    }
  }, []);

  const {
    getRootProps: getRootPropsUsuarios,
    getInputProps: getInputPropsUsuarios,
    isDragActive: isDragActiveUsuarios,
  } = useDropzone ({onDrop: onDropUsuarios, accept: {'text/csv': ['.csv']}});

  const {
    getRootProps: getRootPropsListaNegra,
    getInputProps: getInputPropsListaNegra,
    isDragActive: isDragActiveListaNegra,
  } = useDropzone ({onDrop: onDropListaNegra, accept: {'text/csv': ['.csv']}});

  const handleUpload = async () => {
    if (!filesUsuarios || !filesListaNegra) {
      toast.error (
        'Por favor, arrastra ambos archivos: usuarios y lista negra.'
      );
      return;
    }

    setCargando (true);
    setMensaje ('');
    toast.info ('Subiendo archivos CSV...');

    // Preparar datos para enviar al backend Django
    const formData = new FormData ();
    formData.append ('usuarios', filesUsuarios);
    formData.append ('lista_negra', filesListaNegra);

    try {
      const response = await fetch ('http://localhost:8000/api/upload_csv/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json ();
      console.log (data);
      if (response.ok) {
        setMensaje (
          `Éxito: ${data.mensaje}. Excluidos: ${data.excluidos} IDs.`
        );
        setFilesUsuarios (null);
        setFilesListaNegra (null);
        toast.success (`${data.mensaje}. Excluidos: ${data.excluidos} IDs.`);
      } else {
        setMensaje (`Error: ${data.error}`);
        toast.error (`Error: ${data.error}`);
      }
    } catch (err) {
      console.error (err);
      setMensaje ('Error al subir CSV.');
      toast.error ('Error al subir CSV.');
    } finally {
      setCargando (false);
    }
  };

  return (
    <div className="upload-csv-container">
      <h2>Subir Archivos CSV</h2>

      {/* Dropzone para Usuarios */}
      <div
        {...getRootPropsUsuarios ()}
        className={`dropzone ${isDragActiveUsuarios ? 'active' : ''}`}
      >
        <input {...getInputPropsUsuarios ()} />
        {filesUsuarios
          ? <p>{filesUsuarios.name}</p>
          : <p>Arrastra aquí el CSV de usuarios o haz clic para seleccionar</p>}
      </div>

      {/* Dropzone para Lista Negra */}
      <div
        {...getRootPropsListaNegra ()}
        className={`dropzone ${isDragActiveListaNegra ? 'active' : ''}`}
      >
        <input {...getInputPropsListaNegra ()} />
        {filesListaNegra
          ? <p>{filesListaNegra.name}</p>
          : <p>
              Arrastra aquí el CSV de lista negra o haz clic para seleccionar
            </p>}
      </div>

      {/* Botón para Subir Archivos */}
      <button
        onClick={handleUpload}
        className="upload-button"
        disabled={cargando}
      >
        {cargando ? <ClipLoader size={20} color="#ffffff" /> : 'Subir CSV'}
      </button>

      {/* Mensaje de Resultado */}
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}

export default UploadCSV;


