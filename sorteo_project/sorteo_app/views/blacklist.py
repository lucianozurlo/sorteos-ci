# sorteo_app/views/blacklist.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..models import ListaNegra

class AddToBlacklist(APIView):
    """
    Permite agregar individualmente un participante a la lista negra.
    Se espera recibir un JSON con el campo "id". Si solo se proporciona el ID,
    los demás campos se establecerán en "-".
    """
    def post(self, request, format=None):
        participant_id = request.data.get('id')
        if not participant_id:
            return Response({"error": "Falta el id del participante."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            participant_id = int(participant_id)
        except ValueError:
            return Response({"error": "El id debe ser un número."}, status=status.HTTP_400_BAD_REQUEST)
        obj, created = ListaNegra.objects.update_or_create(
            id=participant_id,
            defaults={
                'nombre': '-',
                'apellido': '-',
                'area': '-',
                'dominio': '-',
                'cargo': '-',
                'email': '-',
                'localidad': '-',
                'provincia': '-',
            }
        )
        if created:
            return Response({"message": "Participante agregado a la lista negra."}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Participante ya se encontraba en la lista negra."}, status=status.HTTP_200_OK)
