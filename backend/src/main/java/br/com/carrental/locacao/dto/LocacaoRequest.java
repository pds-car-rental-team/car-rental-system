package br.com.carrental.locacao.dto;

import java.time.LocalDate;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record LocacaoRequest(
        @Schema(example = "1")
        @NotNull(message = "Selecione o cliente.")
        Long clienteId,

        @Schema(example = "1")
        @NotNull(message = "Selecione o veículo.")
        Long veiculoId,

        @Schema(example = "2026-11-20")
        @NotNull(message = "Informe a data de retirada.")
        LocalDate dataRetirada,

        @Schema(example = "2026-11-25")
        @NotNull(message = "Informe a data prevista de devolução.")
        LocalDate dataPrevistaDevolucao) {
}
