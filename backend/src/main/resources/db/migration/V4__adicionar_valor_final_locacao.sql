ALTER TABLE locacao ADD COLUMN valor_final NUMERIC(12,2);
ALTER TABLE locacao ADD CONSTRAINT ck_locacao_valor_final_positivo
  CHECK (valor_final IS NULL OR valor_final > 0);
