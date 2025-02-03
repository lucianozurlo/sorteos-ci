// sorteo-frontend/src/components/PremioManager.js

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ClipLoader from 'react-spinners/ClipLoader';
import './PremioManager.css';
import { API_BASE_URL } from '../config';

function PremioManager() {
  const [premios, setPremios] = useState([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoStock, setNuevoStock] = useState(1);
  const [editPremioId, setEditPremioId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editStock, setEditStock] = useState(1);
  const [cargando, setCargando] = useState(false);

  const fetchPremios = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/premios/`);
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
      const response = await fetch(`${API_BASE_URL}/api/premios/`, {
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
      const response = await fetch(`${API_BASE_URL}/api/premios/${editPremioId}/`, {
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

  const eliminarPremio = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este premio?')) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/premios/${id}/`, {
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
