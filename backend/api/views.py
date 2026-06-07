from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password, check_password
from .models import Usuario, Proprietarios, Quadras, Equipamentos, Agendamentos, Avaliacoes, Pagamentos, AluguelEquipamentos
from .serializers import (UsuarioSerializer, ProprietariosSerializer, QuadrasSerializer, 
                          EquipamentosSerializer, AgendamentosSerializer, AvaliacoesSerializer, 
                          PagamentosSerializer, AluguelEquipamentosSerializer)

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    def get_queryset(self):
        queryset = Usuario.objects.all()
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email=email)
        return queryset

    def perform_create(self, serializer):
        senha = self.request.data.get('senha')
        if senha:
            serializer.save(senha=make_password(senha))
        else:
            serializer.save()

    def perform_update(self, serializer):
        senha = self.request.data.get('senha')
        if senha:
            serializer.save(senha=make_password(senha))
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        senha = request.data.get('senha')
        if not email or not senha:
            return Response({"error": "E-mail e senha são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.get(email=email)
            # Se a senha for nula no banco (migrado antigo), permite login com verificação especial ou previne.
            # Vamos usar check_password, mas se user.senha for vazio e senha digitada for vazia ou 'teste' (do seed antigo)
            if not user.senha:
                # Caso legados sem senha
                if senha == 'teste':
                    # Cria a senha hashada agora para proteger o legado
                    user.senha = make_password('teste')
                    user.save()
                    serializer = self.get_serializer(user)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response({"error": "Usuário legado sem senha configurada"}, status=status.HTTP_400_BAD_REQUEST)
                
            if check_password(senha, user.senha):
                serializer = self.get_serializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Senha incorreta"}, status=status.HTTP_400_BAD_REQUEST)
        except Usuario.DoesNotExist:
            return Response({"error": "Usuário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

class ProprietariosViewSet(viewsets.ModelViewSet):
    queryset = Proprietarios.objects.all()
    serializer_class = ProprietariosSerializer
    def get_queryset(self):
        queryset = Proprietarios.objects.all()
        email = self.request.query_params.get('email')
        if email:
            queryset = queryset.filter(email=email)
        return queryset

    def perform_create(self, serializer):
        senha = self.request.data.get('senha')
        if senha:
            serializer.save(senha=make_password(senha))
        else:
            serializer.save()

    def perform_update(self, serializer):
        senha = self.request.data.get('senha')
        if senha:
            serializer.save(senha=make_password(senha))
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        senha = request.data.get('senha')
        if not email or not senha:
            return Response({"error": "E-mail e senha são obrigatórios"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            owner = Proprietarios.objects.get(email=email)
            if not owner.senha:
                # Caso legados sem senha
                if senha == 'teste':
                    owner.senha = make_password('teste')
                    owner.save()
                    serializer = self.get_serializer(owner)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response({"error": "Proprietário legado sem senha configurada"}, status=status.HTTP_400_BAD_REQUEST)

            if check_password(senha, owner.senha):
                serializer = self.get_serializer(owner)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Senha incorreta"}, status=status.HTTP_400_BAD_REQUEST)
        except Proprietarios.DoesNotExist:
            return Response({"error": "Proprietário não encontrado"}, status=status.HTTP_404_NOT_FOUND)

class QuadrasViewSet(viewsets.ModelViewSet):
    queryset = Quadras.objects.all()
    serializer_class = QuadrasSerializer
    def get_queryset(self):
        queryset = Quadras.objects.all()
        id_proprietario = self.request.query_params.get('id_proprietario')
        if id_proprietario and id_proprietario.isdigit():
            queryset = queryset.filter(id_proprietario=id_proprietario)
        return queryset

class EquipamentosViewSet(viewsets.ModelViewSet):
    queryset = Equipamentos.objects.all()
    serializer_class = EquipamentosSerializer
    def get_queryset(self):
        queryset = Equipamentos.objects.all()
        id_quadra = self.request.query_params.get('id_quadra')
        if id_quadra and id_quadra.isdigit():
            queryset = queryset.filter(id_quadra=id_quadra)
        return queryset

class AgendamentosViewSet(viewsets.ModelViewSet):
    queryset = Agendamentos.objects.all()
    serializer_class = AgendamentosSerializer
    def get_queryset(self):
        queryset = Agendamentos.objects.all()
        id_usuario = self.request.query_params.get('id_usuario')
        id_quadra = self.request.query_params.get('id_quadra')
        if id_usuario and id_usuario.isdigit():
            queryset = queryset.filter(id_usuario=id_usuario)
        if id_quadra and id_quadra.isdigit():
            queryset = queryset.filter(id_quadra=id_quadra)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = 'Cancelada'
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AvaliacoesViewSet(viewsets.ModelViewSet):
    queryset = Avaliacoes.objects.all()
    serializer_class = AvaliacoesSerializer
    def get_queryset(self):
        queryset = Avaliacoes.objects.all()
        id_quadra = self.request.query_params.get('id_quadra')
        if id_quadra and id_quadra.isdigit():
            queryset = queryset.filter(id_quadra=id_quadra)
        return queryset

class PagamentosViewSet(viewsets.ModelViewSet):
    queryset = Pagamentos.objects.all()
    serializer_class = PagamentosSerializer
    def get_queryset(self):
        queryset = Pagamentos.objects.all()
        id_agendamento = self.request.query_params.get('id_agendamento')
        if id_agendamento and id_agendamento.isdigit():
            queryset = queryset.filter(id_agendamento=id_agendamento)
        return queryset

class AluguelEquipamentosViewSet(viewsets.ModelViewSet):
    queryset = AluguelEquipamentos.objects.all()
    serializer_class = AluguelEquipamentosSerializer
    def get_queryset(self):
        queryset = AluguelEquipamentos.objects.all()
        id_agendamento = self.request.query_params.get('id_agendamento')
        if id_agendamento and id_agendamento.isdigit():
            queryset = queryset.filter(id_agendamento=id_agendamento)
        return queryset