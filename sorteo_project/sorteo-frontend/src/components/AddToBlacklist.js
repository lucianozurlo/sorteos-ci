// sorteo-frontend/src/components/AddToBlacklist.js
import React, {useState} from 'react';
import {toast} from 'react-toastify';
import {API_BASE_URL} from '../config';
import './AddToBlacklist.css';

function AddToBlacklist () {
  const [participantId, setParticipantId] = useState ('');

  const handleAdd = async () => {
    if (!participantId) {
      toast.error ('Por favor, ingresa un ID.');
      return;
    }
    try {
      const response = await fetch (`${API_BASE_URL}/api/blacklist/add/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify ({id: participantId}),
      });
      const data = await response.json ();
      if (response.ok) {
        toast.success (data.message);
        setParticipantId ('');
      } else {
        toast.error (data.error || 'Error al agregar a la lista negra.');
      }
    } catch (err) {
      console.error (err);
      toast.error ('Error al agregar a la lista negra.');
    }
  };

  return (
    <div className="add-to-blacklist-container">
      <h3>Agregar a Lista Negra Individualmente</h3>
      <input
        type="number"
        value={participantId}
        onChange={e => setParticipantId (e.target.value)}
        placeholder="Ingrese ID del participante"
      />
      <button onClick={handleAdd}>Agregar</button>
    </div>
  );
}

export default AddToBlacklist;
