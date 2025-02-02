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
    premio = models.ForeignKey(Premio, on_delete=models.CASCADE, related_name='sorteopremios')
    orden_item = models.PositiveIntegerField()
    cantidad = models.PositiveIntegerField()

    class Meta:
        unique_together = ('sorteo', 'premio')
        ordering = ['orden_item']

    def __str__(self):
        return f'{self.premio.nombre} en {self.sorteo.nombre} - Orden: {self.orden_item}, Cantidad: {self.cantidad}'

class ResultadoSorteo(models.Model):
    sorteo = models.ForeignKey(Sorteo, on_delete=models.CASCADE)
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    premio = models.ForeignKey(Premio, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.usuario} ganó {self.premio} en {self.sorteo}'

class RegistroActividad(models.Model):
    evento = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.evento} at {self.fecha_hora}'
