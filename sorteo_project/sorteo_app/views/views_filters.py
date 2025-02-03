# sorteo_app/views/views_filters.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Participante  # Asegurate de importar Participante, no User

@api_view(['GET'])
def listar_provincias(request):
    # Obtener provincias únicas de Participante
    provincias = Participante.objects.values_list('provincia', flat=True).distinct()
    provincias_list = sorted(provincias)
    return Response(provincias_list, status=status.HTTP_200_OK)

@api_view(['GET'])
def listar_localidades(request):
    provincia = request.GET.get('provincia')
    if provincia:
        localidades = Participante.objects.filter(provincia__iexact=provincia).values_list('localidad', flat=True).distinct()
    else:
        localidades = Participante.objects.values_list('localidad', flat=True).distinct()
    localidades_list = sorted(localidades)
    return Response(localidades_list, status=status.HTTP_200_OK)
