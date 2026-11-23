package br.com.carrental.locacao.dto;

import java.time.LocalDate;

import br.com.carrental.veiculo.SituacaoVeiculo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record DevolucaoRequest(
    @Schema(example = "2026-11-26")
    @NotNull(message = "Informe a data de devolução.")
    LocalDate dataDevolucao,

    @Schema(example = "DISPONIVEL")
    @NotNull(message = "Informe a situação do veículo após a devolução.")
    SituacaoVeiculo situacaoVeiculo) {
}
