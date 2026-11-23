package br.com.carrental.locacao.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import br.com.carrental.locacao.Locacao;
import br.com.carrental.locacao.StatusLocacao;

public record LocacaoResponse(
        Long id,
        Long clienteId,
        String clienteNome,
        Long veiculoId,
        String veiculoPlaca,
        String veiculoModelo,
        LocalDate dataRetirada,
        LocalDate dataPrevistaDevolucao,
        LocalDate dataDevolucao,
        BigDecimal valorDiaria,
        BigDecimal valorPrevisto,
        BigDecimal valorFinal,
        StatusLocacao status,
        boolean atrasada,
        Instant criadoEm,
        Instant atualizadoEm) {

    public static LocacaoResponse de(Locacao locacao) {
        return new LocacaoResponse(
                locacao.getId(),
                locacao.getCliente().getId(),
                locacao.getCliente().getNome(),
                locacao.getVeiculo().getId(),
                locacao.getVeiculo().getPlaca(),
                locacao.getVeiculo().getModelo(),
                locacao.getDataRetirada(),
                locacao.getDataPrevistaDevolucao(),
                locacao.getDataDevolucao(),
                locacao.getValorDiaria(),
                locacao.getValorPrevisto(),
                locacao.getValorFinal(),
                locacao.getStatus(),
                locacao.estaAtrasada(LocalDate.now()),
                locacao.getCriadoEm(),
                locacao.getAtualizadoEm());
    }
}
