package br.com.carrental.cliente.dto;

import org.hibernate.validator.constraints.br.CPF;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Dados de entrada para cadastro e edição. CPF e telefone aceitam valor com ou sem máscara. */
public record ClienteRequest(

        @Schema(example = "Maria da Silva")
        @NotBlank(message = "Informe o nome.")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres.")
        String nome,

        @Schema(example = "529.982.247-25")
        @NotBlank(message = "Informe o CPF.")
        @CPF(message = "CPF inválido.")
        String cpf,

        @Schema(example = "maria@exemplo.com")
        @NotBlank(message = "Informe o e-mail.")
        @Email(message = "E-mail inválido.")
        @Size(max = 254, message = "O e-mail deve ter no máximo 254 caracteres.")
        String email,

        @Schema(example = "(34) 99999-0000")
        @NotBlank(message = "Informe o telefone.")
        @Pattern(regexp = "^\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}$",
                message = "Telefone inválido. Informe DDD e número.")
        String telefone) {
}
