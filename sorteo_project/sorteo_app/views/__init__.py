# sorteo_app/views/__init__.py

# Importar vistas de filtros
from .views_filters import listar_provincias, listar_localidades

# Importar vistas de sorteo
from .views_sorteo import (
    realizar_sorteo,
    ListadoSorteos,
    ListadoResultadosSorteo,
    ListadoRegistroActividad
)

# Importar vistas de subida de CSV
from .views_upload import UploadCSVView

__all__ = [
    'listar_provincias',
    'listar_localidades',
    'realizar_sorteo',
    'ListadoSorteos',
    'ListadoResultadosSorteo',
    'ListadoRegistroActividad',
    'UploadCSVView'
]
