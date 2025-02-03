# sorteo_app/views/download_templates.py

import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class DownloadParticipantesTemplate(APIView):
    """
    Devuelve un archivo CSV con la plantilla para participantes.
    Orden de columnas: ['id', 'nombre', 'apellido', 'area', 'dominio', 'cargo', 'email', 'localidad', 'provincia']
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        filename = "participantes_template.csv"
        headers = ['id', 'nombre', 'apellido', 'area', 'dominio', 'cargo', 'email', 'localidad', 'provincia']
        example_rows = [
            ['1', 'Juan', 'Pérez', 'Ventas', 'Negocio', 'Ejecutivo', 'juan.perez@example.com', 'La Plata', 'Buenos Aires'],
            ['2', 'María', 'González', 'Marketing', 'Digital', 'Analista', 'maria.gonzalez@example.com', 'Mar del Plata', 'Buenos Aires']
        ]
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(headers)
        for row in example_rows:
            writer.writerow(row)
        return response

class DownloadListaNegraTemplate(APIView):
    """
    Devuelve un archivo CSV con la plantilla para la lista negra.
    Se utiliza el mismo orden de columnas que para participantes, lo que permite incluir además del ID el nombre y los demás datos.
    """
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        filename = "lista_negra_template.csv"
        headers = ['id', 'nombre', 'apellido', 'area', 'dominio', 'cargo', 'email', 'localidad', 'provincia']
        example_rows = [
            ['10', 'Pedro', 'Suárez', 'Finanzas', 'Negocio', 'Analista', 'pedro.suarez@example.com', 'Buenos Aires', 'Buenos Aires'],
            ['11', 'Luciana', 'Rodríguez', 'Marketing', 'Digital', 'Coordinadora', 'luciana.rodriguez@example.com', 'Mar del Plata', 'Buenos Aires']
        ]
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)
        writer.writerow(headers)
        for row in example_rows:
            writer.writerow(row)
        return response
