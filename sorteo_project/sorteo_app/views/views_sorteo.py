# sorteo_app/views/views_sorteo.py

import random
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView
from django.contrib.auth.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

from ..models import RegistroActividad, Sorteo, SorteoPremio, ResultadoSorteo, Premio
from ..serializers import (
    SorteoSerializer,
    ResultadoSorteoSerializer,
    RegistroActividadSerializer,
    PremioSerializer,
    SorteoPremioSerializer,
    UserSerializer
)

class PremioViewSet(viewsets.ModelViewSet):
    queryset = Premio.objects.all()
    serializer_class = PremioSerializer

@api_view(['POST'])
def realizar_sorteo(request):
    print("Datos recibidos en el backend:", request.data)  # Para depuración
    serializer = SorteoSerializer(data=request.data)
    if serializer.is_valid():
        try:
            sorteo = serializer.save()
        except Exception as e:
            print("Error en save():", e)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Filtrar usuarios según filtros (si se envían)
        provincia = request.data.get('provincia')
        localidad = request.data.get('localidad')
        queryset = User.objects.all()
        if provincia:
            queryset = queryset.filter(profile__provincia__iexact=provincia)
        if localidad:
            queryset = queryset.filter(profile__localidad__iexact=localidad)
        usuarios_disponibles = list(queryset)
        if not usuarios_disponibles:
            return Response({'error': 'No hay usuarios que cumplan el filtro.'},
                            status=status.HTTP_400_BAD_REQUEST)

        total_premios = sum(p['cantidad'] for p in request.data.get('premios', []))
        if total_premios > len(usuarios_disponibles):
            return Response({'error': 'No hay suficientes usuarios para la cantidad total de premios.'},
                            status=status.HTTP_400_BAD_REQUEST)

        random.shuffle(usuarios_disponibles)
        ganadores_info = []
        premios_sorted = SorteoPremio.objects.filter(sorteo=sorteo).order_by('orden_item')

        for sorteo_premio in premios_sorted:
            cantidad = sorteo_premio.cantidad
            premio = sorteo_premio.premio
            if cantidad > len(usuarios_disponibles):
                return Response({'error': f'No hay suficientes usuarios para asignar el premio {premio.nombre}.'},
                                status=status.HTTP_400_BAD_REQUEST)
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

        RegistroActividad.objects.create(
            evento=f"Sorteo (ID={sorteo.id}) '{sorteo.nombre}' con {premios_sorted.count()} premios y un total de {total_premios} ganadores."
        )

        # (Si no usas WebSocket, omite la notificación)
        # channel_layer = get_channel_layer()
        # sorteo_data = SorteoSerializer(sorteo).data
        # async_to_sync(channel_layer.group_send)(
        #     'sorteos',
        #     {'type': 'send_sorteo', 'sorteo': sorteo_data}
        # )

        data_response = {
            'sorteo_id': sorteo.id,
            'nombre_sorteo': sorteo.nombre,
            'items': ganadores_info
        }
        return Response(data_response, status=status.HTTP_200_OK)
    else:
        print("Errores de validación:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ListadoSorteos(ListAPIView):
    queryset = Sorteo.objects.all().order_by('-fecha_hora')
    serializer_class = SorteoSerializer

class ListadoResultadosSorteo(ListAPIView):
    queryset = ResultadoSorteo.objects.all()
    serializer_class = ResultadoSorteoSerializer

class ListadoRegistroActividad(ListAPIView):
    queryset = RegistroActividad.objects.all().order_by('-fecha_hora')
    serializer_class = RegistroActividadSerializer
