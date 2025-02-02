from rest_framework import serializers
from django.contrib.auth.models import User
from .models import RegistroActividad, Sorteo, SorteoPremio, ResultadoSorteo, Premio, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['localidad', 'provincia']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'profile']

class RegistroActividadSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistroActividad
        fields = '__all__'

class PremioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Premio
        fields = ['id', 'nombre', 'stock']

class SorteoPremioSerializer(serializers.ModelSerializer):
    premio = PremioSerializer(read_only=True)
    premio_id = serializers.PrimaryKeyRelatedField(
        queryset=Premio.objects.all(),
        source='premio',
        write_only=True
    )

    class Meta:
        model = SorteoPremio
        fields = ['premio', 'premio_id', 'orden_item', 'cantidad']

class SorteoSerializer(serializers.ModelSerializer):
    # Usamos el nombre "premios" para que coincida con el payload del frontend.
    premios = SorteoPremioSerializer(many=True)

    class Meta:
        model = Sorteo
        fields = ['id', 'nombre', 'descripcion', 'fecha_hora', 'premios']

    def create(self, validated_data):
        premios_data = validated_data.pop('premios')
        sorteo = Sorteo.objects.create(**validated_data)
        for premio_data in premios_data:
            premio = premio_data['premio']
            orden_item = premio_data['orden_item']
            cantidad = premio_data['cantidad']

            # Verificar stock
            if premio.stock < cantidad:
                raise serializers.ValidationError(
                    f'No hay suficiente stock para el premio {premio.nombre}'
                )

            # Reducir stock
            premio.stock -= cantidad
            premio.save()

            # Crear la relación
            SorteoPremio.objects.create(
                sorteo=sorteo,
                premio=premio,
                orden_item=orden_item,
                cantidad=cantidad
            )
        return sorteo

class ResultadoSorteoSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    premio = PremioSerializer(read_only=True)

    class Meta:
        model = ResultadoSorteo
        fields = ['id', 'sorteo', 'usuario', 'premio', 'fecha']
