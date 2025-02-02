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
import './Sorteo.css';

function SortableItem(props) {
  const { id, nombre_item, cantidad, index } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
  // Campos del sorteo
  const [nombreSorteo, setNombreSorteo] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Filtros
  const [usarFiltros, setUsarFiltros] = useState(false);
  const [provincias, setProvincias] = useState([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  const [localidades, setLocalidades] = useState([]);
  const [localidadSeleccionada, setLocalidadSeleccionada] = useState('');

  // Premios agregados para el sorteo
  const [items, setItems] = useState([]);
  const [availablePremios, setAvailablePremios] = useState([]);
  const [selectedPremioId, setSelectedPremioId] = useState('');
  const [selectedPremioCantidad, setSelectedPremioCantidad] = useState(1);

  // Resultado del sorteo
  const [resultado, setResultado] = useState(null);

  // Indicador de carga
  const [cargando, setCargando] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Cargar provincias
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
      setProvincias([]);
      setProvinciaSeleccionada('');
      setLocalidades([]);
      setLocalidadSeleccionada('');
    }
  }, [usarFiltros]);

  // Cargar localidades
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

  // Cargar premios disponibles
  useEffect(() => {
    fetchAvailablePremios();
  }, []);

  const fetchAvailablePremios = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/premios/');
      const data = await response.json();
      const available = data.filter(p => p.stock > 0);
      setAvailablePremios(available);
    } catch (error) {
      console.error('Error al obtener los premios:', error);
      toast.error('Error al obtener los premios.');
    }
  };

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
    setItems([...items, {
      id: premio.id,
      nombre_item: premio.nombre,
      cantidad: selectedPremioCantidad
    }]);
    setAvailablePremios(availablePremios.filter(p => p.id !== premio.id));
    setSelectedPremioId('');
    setSelectedPremioCantidad(1);
    toast.success(`Premio "${premio.nombre}" agregado al sorteo.`);
  };

  const eliminarPremioDelSorteo = (id) => {
    const premio = items.find(p => p.id === id);
    if (!premio) return;
    setItems(items.filter(p => p.id !== id));
    setAvailablePremios([...availablePremios, {
      id: premio.id,
      nombre: premio.nombre_item,
      stock: premio.cantidad // Ajusta según tu lógica de stock
    }]);
    toast.info(`Premio "${premio.nombre_item}" eliminado del sorteo.`);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      setItems(arrayMove(items, oldIndex, newIndex));
    }
  };

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
    console.log("Enviando solicitud con payload:", payload);
    setCargando(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/sortear/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
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

  return (
    <div className="sorteo-container">
      <h1>Realizar Sorteo</h1>
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
                <option key={idx} value={prov}>{prov}</option>
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
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
        </>
      )}
      <hr />
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
        <button onClick={agregarPremioAlSorteo} style={{ marginLeft: '10px' }}>
          Agregar Premio
        </button>
      </div>
      {items.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
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
      {items.length > 0 && (
        <div className="sorteo-section">
          <h3>Lista de Premios en el Sorteo</h3>
          <ul className="sorteo-list">
            {items.map(item => (
              <li key={item.id} className="sorteo-item">
                {item.nombre_item} - Cantidad: {item.cantidad}
                <button onClick={() => eliminarPremioDelSorteo(item.id)} className="eliminar-btn">
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <hr />
      <div className="sorteo-section">
        <button onClick={handleSortear} className="sortear-btn" disabled={cargando}>
          {cargando ? <ClipLoader size={20} color="#ffffff" /> : 'Sortear'}
        </button>
      </div>
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
    </div>
  );
}

export default Sorteo;
