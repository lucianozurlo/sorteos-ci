import csv
from django.core.management.base import BaseCommand, CommandError
from sorteo_app.models import Usuario, RegistroActividad

class Command(BaseCommand):
    help = 'Carga datos de usuarios desde CSV y excluye IDs en la lista negra.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--usuarios',
            type=str,
            help='Ruta al archivo CSV de usuarios'
        )
        parser.add_argument(
            '--lista_negra',
            type=str,
            help='Ruta al archivo CSV de lista negra'
        )

    def handle(self, *args, **options):
        ruta_usuarios = options['usuarios'] or 'usuarios.csv'
        ruta_lista_negra = options['lista_negra'] or 'lista_negra.csv'

        # 1. Leer IDs de la lista negra
        blacklist_ids = set()
        try:
            with open(ruta_lista_negra, 'r', encoding='utf-8') as f_black:
                reader = csv.DictReader(f_black)
                for row in reader:
                    blacklist_ids.add(int(row['ID']))
        except FileNotFoundError:
            raise CommandError(f"No se encontró el archivo de lista negra: {ruta_lista_negra}")

        # 2. Leer y crear/actualizar usuarios (excluyendo los que estén en la lista negra)
        try:
            with open(ruta_usuarios, 'r', encoding='utf-8') as f_users:
                reader = csv.DictReader(f_users)
                contador = 0
                for row in reader:
                    user_id = int(row['ID'])
                    if user_id in blacklist_ids:
                        # Ignorar usuario en lista negra
                        continue

                    Usuario.objects.update_or_create(
                        id=user_id,
                        defaults={
                            'nombre': row['Nombre'],
                            'apellido': row['Apellido'],
                            'email': row['Email'],
                            'localidad': row['Localidad'],
                            'provincia': row['Provincia']
                        }
                    )
                    contador += 1

                self.stdout.write(self.style.SUCCESS(
                    f'Se cargaron/actualizaron {contador} usuarios.'
                ))

                # Registrar evento
                RegistroActividad.objects.create(
                    evento=f"Carga de usuarios desde {ruta_usuarios}; excluidos {len(blacklist_ids)} IDs de lista negra."
                )
        except FileNotFoundError:
            raise CommandError(f"No se encontró el archivo de usuarios: {ruta_usuarios}")
