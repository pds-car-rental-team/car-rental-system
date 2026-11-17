CREATE TABLE locacao (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id              BIGINT        NOT NULL,
    veiculo_id              BIGINT        NOT NULL,
    data_retirada           DATE          NOT NULL,
    data_prevista_devolucao DATE          NOT NULL,
    data_devolucao          DATE,
    valor_diaria            NUMERIC(12,2) NOT NULL,
    valor_previsto          NUMERIC(12,2) NOT NULL,
    status                  VARCHAR(20)   NOT NULL,
    criado_em               TIMESTAMPTZ   NOT NULL,
    atualizado_em           TIMESTAMPTZ   NOT NULL,
    CONSTRAINT fk_locacao_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id),
    CONSTRAINT fk_locacao_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculo (id),
    CONSTRAINT ck_locacao_status CHECK (status IN ('ABERTA', 'FINALIZADA', 'CANCELADA')),
    CONSTRAINT ck_locacao_datas CHECK (data_prevista_devolucao >= data_retirada),
    CONSTRAINT ck_locacao_data_devolucao CHECK (data_devolucao IS NULL OR data_devolucao >= data_retirada),
    CONSTRAINT ck_locacao_valor_diaria_positivo CHECK (valor_diaria > 0),
    CONSTRAINT ck_locacao_valor_previsto_positivo CHECK (valor_previsto > 0)
);

-- Índices para chaves estrangeiras, filtros e ordenação da listagem.
CREATE INDEX ix_locacao_cliente_id ON locacao (cliente_id);
CREATE INDEX ix_locacao_veiculo_id ON locacao (veiculo_id);
CREATE INDEX ix_locacao_status ON locacao (status);
CREATE INDEX ix_locacao_data_retirada ON locacao (data_retirada);
