# sorteo_app/views/views_upload.py

import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from io import TextIOWrapper
from ..models import RegistroActividad, Participante, ListaNegra

class UploadCSVView(APIView):
    """
    Permite subir de a un archivo:
      - usuarios.csv: Crea/actualiza Participante.
      - lista_negra.csv: Crea/actualiza ListaNegra con los datos completos del CSV.
    """
    def post(self, request, format=None):
        file_usuarios = request.FILES.get('usuarios')
        file_lista_negra = request.FILES.get('lista_negra')

        mensaje = {}
        total_excluidos = 0

        # Procesar CSV de lista negra (si se envía)
        if file_lista_negra:
            try:
                text_file_ln = TextIOWrapper(file_lista_negra.file, encoding='utf-8')
                reader_ln = csv.DictReader(text_file_ln)
                count_ln = 0
                errores_ln = []
                for row in reader_ln:
                    try:
                        user_id = int(row['ID'])
                        ListaNegra.objects.update_or_create(
                            id=user_id,
                            defaults={
                                'nombre': row.get('Nombre', '-').strip() or '-',
                                'apellido': row.get('Apellido', '-').strip() or '-',
                                'area': row.get('Area', '-').strip() or '-',
                                'dominio': row.get('Dominio', '-').strip() or '-',
                                'cargo': row.get('Cargo', '-').strip() or '-',
                                'email': row.get('Email', '-').strip() or '-',
                                'localidad': row.get('Localidad', '-').strip() or '-',
                                'provincia': row.get('Provincia', '-').strip() or '-',
                            }
                        )
                        count_ln += 1
                    except ValueError:
                        errores_ln.append(f"ID inválido en lista_negra: {row.get('ID')}")
                mensaje['lista_negra'] = f"Se procesaron {count_ln} registros en la lista negra."
                if errores_ln:
                    mensaje['errores_lista_negra'] = errores_ln
            except Exception as e:
                return Response({'error': f"Error al procesar lista_negra.csv: {str(e)}"},
                                status=status.HTTP_400_BAD_REQUEST)

        # Procesar CSV de usuarios (si se envía)
        if file_usuarios:
            contador = 0
            errores = []
            try:
                text_file_u = TextIOWrapper(file_usuarios.file, encoding='utf-8')
                reader_u = csv.DictReader(text_file_u)
                with transaction.atomic():
                    for row in reader_u:
                        try:
                            user_id = int(row['ID'])
                            # Si el usuario ya se encuentra en la lista negra, se omite
                            if ListaNegra.objects.filter(id=user_id).exists():
                                total_excluidos += 1
                                continue
                            Participante.objects.update_or_create(
                                id=user_id,
                                defaults={
                                    'nombre': row['Nombre'],
                                    'apellido': row['Apellido'],
                                    'area': row.get('Area', ''),
                                    'dominio': row.get('Dominio', ''),
                                    'cargo': row.get('Cargo', ''),
                                    'email': row['Email'],
                                    'localidad': row['Localidad'],
                                    'provincia': row['Provincia'],
                                }
                            )
                            contador += 1
                        except KeyError as e:
                            errores.append({'row': row, 'error': f'Campo faltante: {e}'})
                        except ValueError:
                            errores.append({'row': row, 'error': f'ID inválido: {row.get("ID")}'})
                        except Exception as e:
                            errores.append({'row': row, 'error': str(e)})
                RegistroActividad.objects.create(
                    evento=f"Carga de participantes desde CSV; se cargaron/actualizaron {contador} participantes. Excluidos {total_excluidos} por estar en la lista negra."
                )
                mensaje['usuarios'] = f"Se cargaron {contador} participantes. Excluidos {total_excluidos} registros (por estar en la lista negra)."
                if errores:
                    mensaje['errores_usuarios'] = errores
            except Exception as e:
                return Response({'error': f"Error al procesar usuarios.csv: {str(e)}"},
                                status=status.HTTP_400_BAD_REQUEST)

        if not file_usuarios and not file_lista_negra:
            return Response({'error': 'Debe enviar al menos uno de los archivos: usuarios o lista_negra.'},
                            status=status.HTTP_400_BAD_REQUEST)

        return Response(mensaje, status=status.HTTP_200_OK)
