CREATE TABLE usuario (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(120),
    data_cadastro DATE,
    cpf VARCHAR(20)
);

CREATE TABLE proprietarios (
    id_proprietario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome VARCHAR(100),
    email VARCHAR(120),
    telefone VARCHAR(20),
    cpf VARCHAR(20)
);

CREATE TABLE quadras (
    id_quadra INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_proprietario INT NOT NULL,
    nome VARCHAR(100),
    esporte VARCHAR(40),
    valor NUMERIC(10,2),
    endereco VARCHAR(120),
    cnpj BIGINT,

    CONSTRAINT fk_quadra_proprietario
        FOREIGN KEY (id_proprietario)
        REFERENCES proprietarios(id_proprietario)
);

CREATE TABLE equipamentos (
    id_equipamento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_quadra INT NOT NULL,
    descricao VARCHAR(100),
    valor NUMERIC(10,2),

    CONSTRAINT fk_equip_quadra
        FOREIGN KEY (id_quadra)
        REFERENCES quadras(id_quadra)
);

CREATE TABLE agendamentos (
    id_agendamento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_quadra INT NOT NULL,
    data_agendamento DATE,
    hora_inicio VARCHAR(10),
    hora_fim VARCHAR(10),
    valor NUMERIC(10,2),

    CONSTRAINT fk_ag_user
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario),

    CONSTRAINT fk_ag_quadra
        FOREIGN KEY (id_quadra)
        REFERENCES quadras(id_quadra)
);

CREATE TABLE avaliacoes (
    id_avaliacao INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_quadra INT NOT NULL,
    nota INT,
    comentario VARCHAR(255),
    data_avaliacao DATE,

    CONSTRAINT fk_av_user
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario),

    CONSTRAINT fk_av_quadra
        FOREIGN KEY (id_quadra)
        REFERENCES quadras(id_quadra)
);

CREATE TABLE pagamentos (
    id_pagamento INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_agendamento INT NOT NULL,
    data_pagamento DATE,
    valor NUMERIC(10,2),
    forma_pagamento VARCHAR(30),

    CONSTRAINT fk_pag_agendamento
        FOREIGN KEY (id_agendamento)
        REFERENCES agendamentos(id_agendamento)
);

CREATE TABLE aluguel_equipamentos (
    id_agendamento INT NOT NULL,
    id_equipamento INT NOT NULL,
    quantidade INT,
    valor NUMERIC(10,2),

    PRIMARY KEY (id_agendamento, id_equipamento),

    CONSTRAINT fk_ae_agendamento
        FOREIGN KEY (id_agendamento)
        REFERENCES agendamentos(id_agendamento),

    CONSTRAINT fk_ae_equipamento
        FOREIGN KEY (id_equipamento)
        REFERENCES equipamentos(id_equipamento)
);