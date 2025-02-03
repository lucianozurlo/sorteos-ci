# sorteo_app/views/views_lists.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import Participante, ListaNegra

class ListLoadedData(APIView):
    """
    Devuelve el contenido actual:
      - Participantes: todos los registros de Participante.
      - Blacklist: cada registro de ListaNegra con todos sus datos.
    """
    def get(self, request):
        participantes = list(Participante.objects.values())
        blacklist = list(ListaNegra.objects.values())
        return Response({
            'participantes': participantes,
            'blacklist': blacklist,
        }, status=status.HTTP_200_OK)

class ClearParticipantes(APIView):
    """
    Elimina todos los registros de Participante.
    """
    def delete(self, request):
        deleted, _ = Participante.objects.all().delete()
        return Response({
            'message': 'Participantes eliminados',
            'deleted': deleted
        }, status=status.HTTP_200_OK)

class ClearListaNegra(APIView):
    """
    Elimina todos los registros de la Lista Negra.
    """
    def delete(self, request):
        deleted, _ = ListaNegra.objects.all().delete()
        return Response({
            'message': 'Lista negra eliminada',
            'deleted': deleted
        }, status=status.HTTP_200_OK)