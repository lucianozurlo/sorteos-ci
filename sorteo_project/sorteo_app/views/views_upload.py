# sorteo_app/views/views_upload.py

import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from io import TextIOWrapper
from django.contrib.auth.models import User
from ..models import RegistroActividad, UserProfile

class UploadCSVView(APIView):
    """
    Endpoint para subir usuarios.csv y lista_negra.csv via POST.
    """
    def post(self, request, format=None):
        # Espera: files={'usuarios': <File>, 'lista_negra': <File>}
        file_usuarios = request.FILES.get('usuarios')
        file_lista_negra = request.FILES.get('lista_negra')

        if not file_usuarios or not file_lista_negra:
            return Response(
                {'error': 'Faltan archivos usuarios o lista_negra.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Parsear lista negra
        blacklist_ids = set()
        try:
            text_file_ln = TextIOWrapper(file_lista_negra.file, encoding='utf-8')
            reader_ln = csv.DictReader(text_file_ln)
            for row in reader_ln:
                try:
                    blacklist_ids.add(int(row['ID']))
                except ValueError:
                    return Response(
                        {'error': f'ID inválido en lista_negra: {row.get("ID")}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
        except Exception as e:
            return Response({'error': f'Error al procesar lista_negra.csv: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Cargar usuarios
        contador = 0
        errores = []
        try:
            text_file_u = TextIOWrapper(file_usuarios.file, encoding='utf-8')
            reader_u = csv.DictReader(text_file_u)

            with transaction.atomic():
                for row in reader_u:
                    try:
                        user_id = int(row['ID'])
                        if user_id in blacklist_ids:
                            continue

                        # Obtener o crear el usuario
                        user, created = User.objects.update_or_create(
                            id=user_id,
                            defaults={
                                'username': row['Username'],  # Asegúrate de que el CSV tenga una columna 'Username'
                                'first_name': row['Nombre'],
                                'last_name': row['Apellido'],
                                'email': row['Email'],
                            }
                        )

                        # Actualizar o crear el perfil
                        UserProfile.objects.update_or_create(
                            user=user,
                            defaults={
                                'localidad': row['Localidad'],
                                'provincia': row['Provincia']
                            }
                        )

                        contador += 1
                    except KeyError as e:
                        errores.append({'row': row, 'error': f'Campo faltante: {e}'})
                    except ValueError:
                        errores.append({'row': row, 'error': f'ID inválido: {row.get("ID")}'})
                    except Exception as e:
                        errores.append({'row': row, 'error': str(e)})

        except Exception as e:
            return Response({'error': f'Error al procesar usuarios.csv: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Registrar actividad
        RegistroActividad.objects.create(
            evento=f"Se cargaron/actualizaron {contador} usuarios. Excluidos {len(blacklist_ids)} IDs."
        )

        response_data = {
            'mensaje': f'Se cargaron {contador} usuarios.',
            'excluidos': len(blacklist_ids),
            'errores': errores  # Lista de errores encontrados
        }

        return Response(response_data, status=status.HTTP_200_OK)
