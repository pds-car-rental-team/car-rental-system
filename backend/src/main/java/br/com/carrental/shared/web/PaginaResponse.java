package br.com.carrental.shared.web;

import java.util.List;

import org.springframework.data.domain.Page;

/** Contrato estável de paginação da API (não expomos o {@code Page} do Spring). */
public record PaginaResponse<T>(
        List<T> itens,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas) {

    public static <T> PaginaResponse<T> de(Page<T> page) {
        return new PaginaResponse<>(page.getContent(), page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
