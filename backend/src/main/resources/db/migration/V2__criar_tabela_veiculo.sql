CREATE TABLE veiculo (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    placa         VARCHAR(7)    NOT NULL,
    modelo        VARCHAR(120)  NOT NULL,
    categoria     VARCHAR(30)   NOT NULL,
    valor_diaria  NUMERIC(12,2) NOT NULL,
    situacao      VARCHAR(20)   NOT NULL,
    criado_em     TIMESTAMPTZ   NOT NULL,
    atualizado_em TIMESTAMPTZ   NOT NULL,
    CONSTRAINT uk_veiculo_placa UNIQUE (placa),
    CONSTRAINT ck_veiculo_placa_formato CHECK (placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
    CONSTRAINT ck_veiculo_categoria CHECK (categoria IN ('ECONOMICO', 'HATCH', 'SEDAN', 'SUV', 'UTILITARIO')),
    CONSTRAINT ck_veiculo_situacao CHECK (situacao IN ('DISPONIVEL', 'ALUGADO', 'EM_MANUTENCAO')),
    CONSTRAINT ck_veiculo_valor_diaria_positivo CHECK (valor_diaria > 0)
);

-- Índices para ordenação e filtros de disponibilidade.
CREATE INDEX ix_veiculo_modelo ON veiculo (modelo);
CREATE INDEX ix_veiculo_situacao ON veiculo (situacao);
CREATE INDEX ix_veiculo_categoria ON veiculo (categoria);

