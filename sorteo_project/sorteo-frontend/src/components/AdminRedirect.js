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
