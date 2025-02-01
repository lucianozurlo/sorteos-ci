# sorteo_app/views/views_filters.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User

@api_view(['GET'])
def listar_provincias(request):
    """
    Retorna la lista de todas las provincias únicas 
    que existen en el perfil de Usuario.
    """
    provincias = User.objects.values_list('profile__provincia', flat=True).distinct()
    provincias_list = sorted(provincias)
    return Response(provincias_list, status=status.HTTP_200_OK)

@api_view(['GET'])
def listar_localidades(request):
    """
    GET /api/localidades/?provincia=Buenos Aires

    Retorna la lista de localidades únicas para la provincia
    indicada (opcional). Si no se pasa provincia, retorna
    todas las localidades únicas.
    """
    provincia = request.GET.get('provincia')

    if provincia:
        localidades = User.objects.filter(
            profile__provincia__iexact=provincia
        ).values_list('profile__localidad', flat=True).distinct()
    else:
        localidades = User.objects.values_list('profile__localidad', flat=True).distinct()

    localidades_list = sorted(localidades)
    return Response(localidades_list, status=status.HTTP_200_OK)