# sorteo_app/views/views_sorteo.py

import random
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

# Importa tus modelos
from ..models import RegistroActividad, Sorteo, SorteoPremio, ResultadoSorteo, Premio
from django.contrib.auth.models import User

# Importa tus serializers
from ..serializers import (
    SorteoSerializer,
    ResultadoSorteoSerializer,
    RegistroActividadSerializer,
    PremioSerializer,
    SorteoPremioSerializer,
    UserSerializer
)

# ViewSet para gestionar Premios
class PremioViewSet(viewsets.ModelViewSet):
    queryset = Premio.objects.all()
    serializer_class = PremioSerializer

# API para realizar el sorteo
@api_view(['POST'])
def realizar_sorteo(request):
    """
    Recibe un JSON con la siguiente estructura:
    {
      "nombre": "Sorteo Especial 2025",
      "descripcion": "Fin de año con varios premios.",
      "provincia": "Santa Fe",  # opcional
      "localidad": "Rosario",   # opcional
      "premios": [
        {"premio_id": 1, "orden_item": 1, "cantidad": 2},
        {"premio_id": 2, "orden_item": 2, "cantidad": 1},
        {"premio_id": 3, "orden_item": 3, "cantidad": 1}
      ]
    }
    """
    print("Datos recibidos en el backend:", request.data)  # <-- Agregado

    serializer = SorteoSerializer(data=request.data)
    if serializer.is_valid():
        try:
            sorteo = serializer.save()
        except serializers.ValidationError as e:
            return Response({'error': e.detail}, status=status.HTTP_400_BAD_REQUEST)

        # Realizar el sorteo
        # Filtrar usuarios según provincia y localidad si se especifican
        provincia = request.data.get('provincia')
        localidad = request.data.get('localidad')

        queryset = User.objects.all()
        if provincia:
            queryset = queryset.filter(profile__provincia__iexact=provincia)
        if localidad:
            queryset = queryset.filter(profile__localidad__iexact=localidad)

        usuarios_disponibles = list(queryset)

        if not usuarios_disponibles:
            return Response({'error': 'No hay usuarios que cumplan el filtro.'}, status=status.HTTP_400_BAD_REQUEST)

        # Calcular la suma total de premios
        total_premios = sum(p['cantidad'] for p in request.data.get('premios', []))
        if total_premios > len(usuarios_disponibles):
            return Response({'error': 'No hay suficientes usuarios para la cantidad total de premios.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mezclar usuarios para aleatoriedad
        random.shuffle(usuarios_disponibles)

        # Asignar ganadores
        ganadores_info = []
        premios_sorted = SorteoPremio.objects.filter(sorteo=sorteo).order_by('orden_item')

        for sorteo_premio in premios_sorted:
            cantidad = sorteo_premio.cantidad
            premio = sorteo_premio.premio

            if cantidad > len(usuarios_disponibles):
                return Response({'error': f'No hay suficientes usuarios para asignar el premio {premio.nombre}.'}, status=status.HTTP_400_BAD_REQUEST)

            ganadores = usuarios_disponibles[:cantidad]
            usuarios_disponibles = usuarios_disponibles[cantidad:]

            ganadores_data = []
            for ganador in ganadores:
                ResultadoSorteo.objects.create(
                    sorteo=sorteo,
                    usuario=ganador,
                    premio=premio
                )
                ganadores_data.append({
                    'id_ganador': ganador.id,
                    'nombre': ganador.first_name,
                    'apellido': ganador.last_name,
                    'email': ganador.email,
                })

            ganadores_info.append({
                'nombre_item': premio.nombre,
                'orden_item': sorteo_premio.orden_item,
                'cantidad': cantidad,
                'ganadores': ganadores_data
            })

        # Registrar actividad en RegistroActividad
        RegistroActividad.objects.create(
            evento=f"Sorteo (ID={sorteo.id}) '{sorteo.nombre}' con {premios_sorted.count()} premios y un total de {total_premios} ganadores."
        )

        # Notificar a los clientes conectados vía WebSocket
        channel_layer = get_channel_layer()
        sorteo_data = SorteoSerializer(sorteo).data
        async_to_sync(channel_layer.group_send)(
            'sorteos',
            {
                'type': 'send_sorteo',
                'sorteo': sorteo_data
            }
        )

        # Preparar la respuesta
        data_response = {
            'sorteo_id': sorteo.id,
            'nombre_sorteo': sorteo.nombre,
            'items': ganadores_info
        }

        return Response(data_response, status=status.HTTP_200_OK)
    else:
        print("Errores de validación:", serializer.errors)  # <-- Agregado
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Vistas para Listado de Sorteos, Resultados y Actividad
class ListadoSorteos(ListAPIView):
    """
    Devuelve la lista de todos los sorteos, ordenados por fecha_hora descendente.
    GET /api/sorteos/
    """
    queryset = Sorteo.objects.all().order_by('-fecha_hora')
    serializer_class = SorteoSerializer

class ListadoResultadosSorteo(ListAPIView):
    """
    Devuelve la lista de todos los objetos ResultadoSorteo
    (cada registro asocia un sorteo con un usuario ganador y el premio).
    GET /api/resultados_sorteo/
    """
    queryset = ResultadoSorteo.objects.all()
    serializer_class = ResultadoSorteoSerializer

class ListadoRegistroActividad(ListAPIView):
    """
    Muestra el historial de eventos (cargas de usuarios, sorteos realizados, etc.)
    GET /api/registro_actividad/
    """
    queryset = RegistroActividad.objects.all().order_by('-fecha_hora')
    serializer_class = RegistroActividadSerializer
