package br.com.carrental.veiculo.dto;

import java.math.BigDecimal;

import br.com.carrental.veiculo.CategoriaVeiculo;
import br.com.carrental.veiculo.SituacaoVeiculo;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Dados de entrada para cadastro e edição de veículo. Placa aceita valor com ou sem hífen. */
public record VeiculoRequest(

        @Schema(example = "ABC-1D23")
        @NotBlank(message = "Informe a placa.")
        @Pattern(regexp = "^[A-Za-z]{3}-?\\d[A-Za-z0-9]\\d{2}$",
                message = "Placa inválida. Use o padrão ABC1234 ou ABC1D23.")
        String placa,

        @Schema(example = "Fiat Pulse 1.3")
        @NotBlank(message = "Informe o modelo.")
        @Size(max = 120, message = "O modelo deve ter no máximo 120 caracteres.")
        String modelo,

        @Schema(example = "SUV")
        @NotNull(message = "Informe a categoria.")
        CategoriaVeiculo categoria,

        @Schema(example = "189.90")
        @NotNull(message = "Informe o valor da diária.")
        @Positive(message = "O valor da diária deve ser maior que zero.")
        @Digits(integer = 10, fraction = 2, message = "O valor da diária deve ter no máximo 2 casas decimais.")
        BigDecimal valorDiaria,

        @Schema(example = "DISPONIVEL")
        @NotNull(message = "Informe a situação.")
        SituacaoVeiculo situacao) {
}

