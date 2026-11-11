package br.com.carrental.cliente.dto;

import java.time.Instant;

import br.com.carrental.cliente.Cliente;

/** CPF e telefone saem somente com dígitos; a máscara é responsabilidade do frontend. */
public record ClienteResponse(
        Long id,
        String nome,
        String cpf,
        String email,
        String telefone,
        Instant criadoEm,
        Instant atualizadoEm) {

    public static ClienteResponse de(Cliente cliente) {
        return new ClienteResponse(cliente.getId(), cliente.getNome(), cliente.getCpf(), cliente.getEmail(),
                cliente.getTelefone(), cliente.getCriadoEm(), cliente.getAtualizadoEm());
    }
}
