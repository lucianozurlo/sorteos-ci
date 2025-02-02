// sorteo-frontend/src/components/AdminRedirect.js

import React, {useEffect} from 'react';

function AdminRedirect () {
  useEffect (() => {
    window.location.href = 'http://localhost:8000/admin/';
  }, []);

  return null;
}

export default AdminRedirect;
