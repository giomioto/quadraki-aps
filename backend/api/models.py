from django.db import models

class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=120, blank=True, null=True)
    data_cadastro = models.DateField(blank=True, null=True)
    senha = models.CharField(max_length=255, blank=True, null=True)
    cpf = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        db_table = 'usuario'

class Proprietarios(models.Model):
    id_proprietario = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=120, blank=True, null=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    cpf = models.CharField(max_length=20, blank=True, null=True)
    senha = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = 'proprietarios'

class Quadras(models.Model):
    id_quadra = models.AutoField(primary_key=True)
    id_proprietario = models.ForeignKey(Proprietarios, models.DO_NOTHING, db_column='id_proprietario')
    nome = models.CharField(max_length=100, blank=True, null=True)
    esporte = models.CharField(max_length=40, blank=True, null=True)
    valor = models.FloatField(blank=True, null=True)
    endereco = models.CharField(max_length=120, blank=True, null=True)
    cnpj = models.BigIntegerField(blank=True, null=True)

    class Meta:
        db_table = 'quadras'

class Equipamentos(models.Model):
    id_equipamento = models.AutoField(primary_key=True)
    id_quadra = models.ForeignKey(Quadras, models.DO_NOTHING, db_column='id_quadra')
    descricao = models.CharField(max_length=100, blank=True, null=True)
    valor = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'equipamentos'

class Agendamentos(models.Model):
    id_agendamento = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='id_usuario')
    id_quadra = models.ForeignKey(Quadras, models.DO_NOTHING, db_column='id_quadra')
    data_agendamento = models.DateField(blank=True, null=True)
    hora_inicio = models.CharField(max_length=10, blank=True, null=True)
    hora_fim = models.CharField(max_length=10, blank=True, null=True)
    valor = models.FloatField(blank=True, null=True)
    status = models.CharField(max_length=20, default='Ativa', blank=True, null=True)

    class Meta:
        db_table = 'agendamentos'

class Avaliacoes(models.Model):
    id_avaliacao = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='id_usuario')
    id_quadra = models.ForeignKey(Quadras, models.DO_NOTHING, db_column='id_quadra')
    nota = models.IntegerField(blank=True, null=True)
    comentario = models.CharField(max_length=255, blank=True, null=True)
    data_avaliacao = models.DateField(blank=True, null=True)

    class Meta:
        db_table = 'avaliacoes'

class Pagamentos(models.Model):
    id_pagamento = models.AutoField(primary_key=True)
    id_agendamento = models.ForeignKey(Agendamentos, models.CASCADE, db_column='id_agendamento')
    data_pagamento = models.DateField(blank=True, null=True)
    valor = models.FloatField(blank=True, null=True)
    forma_pagamento = models.CharField(max_length=30, blank=True, null=True)

    class Meta:
        db_table = 'pagamentos'

class AluguelEquipamentos(models.Model):
    id_agendamento = models.ForeignKey(Agendamentos, models.CASCADE, db_column='id_agendamento')
    id_equipamento = models.ForeignKey(Equipamentos, models.DO_NOTHING, db_column='id_equipamento')
    quantidade = models.IntegerField(blank=True, null=True)
    valor = models.FloatField(blank=True, null=True)

    class Meta:
        db_table = 'aluguel_equipamentos'