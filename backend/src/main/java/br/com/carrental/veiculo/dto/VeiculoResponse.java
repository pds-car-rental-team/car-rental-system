package br.com.carrental.veiculo.dto;

import java.math.BigDecimal;
import java.time.Instant;

import br.com.carrental.veiculo.CategoriaVeiculo;
import br.com.carrental.veiculo.SituacaoVeiculo;
import br.com.carrental.veiculo.Veiculo;

/** Placa sai sem máscara e em maiúsculas; a formatação visual é responsabilidade do frontend. */
public record VeiculoResponse(
        Long id,
        String placa,
        String modelo,
        CategoriaVeiculo categoria,
        BigDecimal valorDiaria,
        SituacaoVeiculo situacao,
        Instant criadoEm,
        Instant atualizadoEm) {

    public static VeiculoResponse de(Veiculo veiculo) {
        return new VeiculoResponse(
                veiculo.getId(),
                veiculo.getPlaca(),
                veiculo.getModelo(),
                veiculo.getCategoria(),
                veiculo.getValorDiaria(),
                veiculo.getSituacao(),
                veiculo.getCriadoEm(),
                veiculo.getAtualizadoEm());
    }
}

