package br.com.carrental.veiculo.dto;

/** Resumo de disponibilidade da frota com a contagem de veículos por situação. */
public record DisponibilidadeResumoResponse(
        long total,
        long disponiveis,
        long alugados,
        long emManutencao) {
}

