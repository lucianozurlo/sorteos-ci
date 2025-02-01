# sorteo_app/admin.py

from django.contrib import admin
from .models import Premio, Sorteo, SorteoPremio, ResultadoSorteo, RegistroActividad, UserProfile

@admin.register(Premio)
class PremioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'stock')
    search_fields = ('nombre',)
