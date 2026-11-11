CREATE TABLE cliente (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          VARCHAR(120) NOT NULL,
    cpf           VARCHAR(11)  NOT NULL,
    email         VARCHAR(254) NOT NULL,
    telefone      VARCHAR(11)  NOT NULL,
    criado_em     TIMESTAMPTZ  NOT NULL,
    atualizado_em TIMESTAMPTZ  NOT NULL,
    CONSTRAINT uk_cliente_cpf UNIQUE (cpf),
    CONSTRAINT ck_cliente_cpf_digitos CHECK (cpf ~ '^[0-9]{11}$'),
    CONSTRAINT ck_cliente_telefone_digitos CHECK (telefone ~ '^[0-9]{10,11}$')
);

-- A listagem é ordenada por nome.
CREATE INDEX ix_cliente_nome ON cliente (nome);
