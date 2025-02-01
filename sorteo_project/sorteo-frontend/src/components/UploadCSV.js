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
