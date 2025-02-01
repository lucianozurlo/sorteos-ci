# sorteo_app/management/commands/load_premios.py

from django.core.management.base import BaseCommand
from sorteo_app.models import Premio
import random

class Command(BaseCommand):
    help = 'Carga 10 premios de prueba con stock aleatorio'

    def handle(self, *args, **kwargs):
        sample_premios = [
            'TV 42 pulgadas',
            'Smartphone Samsung Galaxy',
            'Laptop HP 15"',
            'Tablet iPad Pro',
            'Cámara Canon EOS',
            'Audífonos Bose',
            'Smartwatch Apple',
            'Televisor LG 55 pulgadas',
            'Consola PlayStation 5',
            'Bicicleta de montaña'
        ]

        for nombre in sample_premios:
            stock = random.randint(1, 10)
            premio, created = Premio.objects.get_or_create(nombre=nombre, defaults={'stock': stock})
            if created:
                self.stdout.write(self.style.SUCCESS(f'Creado premio: {nombre} con stock {stock}'))
            else:
                self.stdout.write(f'El premio {nombre} ya existe con stock {premio.stock}')
