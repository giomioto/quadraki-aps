from rest_framework import serializers
from .models import Usuario, Proprietarios, Quadras, Equipamentos, Agendamentos, Avaliacoes, Pagamentos, AluguelEquipamentos

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = '__all__'

class ProprietariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proprietarios
        fields = '__all__'

class QuadrasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quadras
        fields = '__all__'

class EquipamentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipamentos
        fields = '__all__'

class AgendamentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agendamentos
        fields = '__all__'

class AvaliacoesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Avaliacoes
        fields = '__all__'

class PagamentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pagamentos
        fields = '__all__'

class AluguelEquipamentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = AluguelEquipamentos
        fields = '__all__'