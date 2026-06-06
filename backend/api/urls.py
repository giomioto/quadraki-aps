from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (UsuarioViewSet, ProprietariosViewSet, QuadrasViewSet, 
                    EquipamentosViewSet, AgendamentosViewSet, AvaliacoesViewSet, 
                    PagamentosViewSet, AluguelEquipamentosViewSet)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'proprietarios', ProprietariosViewSet)
router.register(r'quadras', QuadrasViewSet)
router.register(r'equipamentos', EquipamentosViewSet)
router.register(r'agendamentos', AgendamentosViewSet)
router.register(r'avaliacoes', AvaliacoesViewSet)
router.register(r'pagamentos', PagamentosViewSet)
router.register(r'aluguel-equipamentos', AluguelEquipamentosViewSet)

urlpatterns = [
    path('', include(router.urls)),
]