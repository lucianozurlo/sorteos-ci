# sorteo_app/models.py

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    localidad = models.CharField(max_length=255)
    provincia = models.CharField(max_length=255)

    def __str__(self):
        return f'Perfil de {self.user.username}'

class Participante(models.Model):
    id = models.IntegerField(primary_key=True)
    nombre = models.CharField(max_length=255)
    apellido = models.CharField(max_length=255)
    area = models.CharField(max_length=255, blank=True, null=True)
    dominio = models.CharField(max_length=255, blank=True, null=True)
    cargo = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField()
    localidad = models.CharField(max_length=255)
    provincia = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

@receiver(post_save, sender=User)
def crear_guardar_perfil(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    instance.profile.save()

class Premio(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.nombre

class Sorteo(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True)
    premios = models.ManyToManyField(Premio, through='SorteoPremio')
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

class SorteoPremio(models.Model):
    sorteo = models.ForeignKey(Sorteo, on_delete=models.CASCADE, related_name='sorteopremios')
    premio = models.ForeignKey(Premio, on_delete=models.CASCADE)  # Quitamos el related_name aquí
    orden_item = models.PositiveIntegerField()
    cantidad = models.PositiveIntegerField()

    class Meta:
        unique_together = ('sorteo', 'premio')
        ordering = ['orden_item']

    def __str__(self):
        return f'{self.premio.nombre} en {self.sorteo.nombre} - Orden: {self.orden_item}, Cantidad: {self.cantidad}'


class ResultadoSorteo(models.Model):
    sorteo = models.ForeignKey(Sorteo, on_delete=models.CASCADE)
    participante = models.ForeignKey(Participante, on_delete=models.CASCADE)
    premio = models.ForeignKey(Premio, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.participante} ganó {self.premio} en {self.sorteo}"

class RegistroActividad(models.Model):
    evento = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.evento} at {self.fecha_hora}"

class ListaNegra(models.Model):
    # Usamos la misma estructura que Participante, pero sin relación directa.
    id = models.IntegerField(primary_key=True)  # ID del participante (único)
    nombre = models.CharField(max_length=255, blank=True, default="-")
    apellido = models.CharField(max_length=255, blank=True, default="-")
    area = models.CharField(max_length=255, blank=True, default="-")
    dominio = models.CharField(max_length=255, blank=True, default="-")
    cargo = models.CharField(max_length=255, blank=True, default="-")
    # Para email, usamos CharField para permitir el valor "-" como default.
    email = models.CharField(max_length=255, blank=True, default="-")
    localidad = models.CharField(max_length=255, blank=True, default="-")
    provincia = models.CharField(max_length=255, blank=True, default="-")

    def __str__(self):
        return f"{self.id} - {self.nombre} {self.apellido}"