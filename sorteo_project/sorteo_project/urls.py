# sorteo_project/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from sorteo_app.views import (
    UploadCSVView,
    realizar_sorteo,
    ListadoSorteos,
    ListadoResultadosSorteo,
    ListadoRegistroActividad,
    listar_provincias, 
    listar_localidades
)
from sorteo_app.views.views_sorteo import PremioViewSet

router = routers.DefaultRouter()
router.register(r'premios', PremioViewSet, basename='premio')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/upload_csv/', UploadCSVView.as_view(), name='upload_csv'),
    path('api/sortear/', realizar_sorteo, name='realizar_sorteo'),
    path('api/sorteos/', ListadoSorteos.as_view(), name='listado_sorteos'),
    path('api/resultados_sorteo/', ListadoResultadosSorteo.as_view(), name='listado_resultados_sorteo'),
    path('api/registro_actividad/', ListadoRegistroActividad.as_view(), name='listado_registro_actividad'),
    path('api/provincias/', listar_provincias, name='listar_provincias'),
    path('api/localidades/', listar_localidades, name='listar_localidades'),
    path('api/', include(router.urls)),
]
