// sorteo-frontend/src/components/AdminRedirect.js

// Ya no importamos React, ya que no se utiliza.
// import React from 'react';

function AdminRedirect () {
  // Redirige al panel de administración de Django
  window.location.href = 'http://localhost:8000/admin/';
  return null;
}

export default AdminRedirect;
