package br.com.carrental.locacao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.com.carrental.cliente.Cliente;
import br.com.carrental.cliente.ClienteService;
import br.com.carrental.locacao.dto.LocacaoRequest;
import br.com.carrental.locacao.dto.LocacaoResponse;
import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.DadosInvalidosException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;
import br.com.carrental.veiculo.CategoriaVeiculo;
import br.com.carrental.veiculo.SituacaoVeiculo;
import br.com.carrental.veiculo.Veiculo;
import br.com.carrental.veiculo.VeiculoService;

@ExtendWith(MockitoExtension.class)
class LocacaoServiceTest {

    @Mock
    private LocacaoRepository repository;

    @Mock
    private ClienteService clienteService;

    @Mock
    private VeiculoService veiculoService;

    @InjectMocks
    private LocacaoService service;

    private static Cliente clienteExistente() {
        return new Cliente("Maria da Silva", "52998224725", "maria@exemplo.com", "34999990000");
    }

    private static Veiculo veiculoComSituacao(SituacaoVeiculo situacao) {
        return new Veiculo("BRA2E19", "Renault Kwid 1.0 Zen", CategoriaVeiculo.ECONOMICO,
                new BigDecimal("120.00"), situacao);
    }

    @Test
    void registrarCriaLocacaoEAlteraSituacaoDoVeiculoParaAlugado() {
        LocalDate retirada = LocalDate.now().plusDays(1);
        LocalDate devolucao = retirada.plusDays(4);
        Cliente cliente = clienteExistente();
        Veiculo veiculo = veiculoComSituacao(SituacaoVeiculo.DISPONIVEL);

        when(clienteService.obter(1L)).thenReturn(cliente);
        when(veiculoService.obter(2L)).thenReturn(veiculo);
        when(repository.save(any(Locacao.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        LocacaoResponse resposta = service.registrar(new LocacaoRequest(1L, 2L, retirada, devolucao));

        ArgumentCaptor<Locacao> salvo = ArgumentCaptor.forClass(Locacao.class);
        verify(repository).save(salvo.capture());

        Locacao locacao = salvo.getValue();
        assertThat(locacao.getCliente()).isSameAs(cliente);
        assertThat(locacao.getVeiculo()).isSameAs(veiculo);
        assertThat(locacao.getDataRetirada()).isEqualTo(retirada);
        assertThat(locacao.getDataPrevistaDevolucao()).isEqualTo(devolucao);
        assertThat(locacao.getValorDiaria()).isEqualByComparingTo("120.00");
        assertThat(locacao.getValorPrevisto()).isEqualByComparingTo("480.00");
        assertThat(locacao.getStatus()).isEqualTo(StatusLocacao.ABERTA);
        assertThat(veiculo.getSituacao()).isEqualTo(SituacaoVeiculo.ALUGADO);

        assertThat(resposta.status()).isEqualTo(StatusLocacao.ABERTA);
        assertThat(resposta.valorPrevisto()).isEqualByComparingTo("480.00");
        assertThat(resposta.clienteNome()).isEqualTo("Maria da Silva");
        assertThat(resposta.veiculoPlaca()).isEqualTo("BRA2E19");
    }

    @Test
    void registrarCalculaUmaDiariaQuandoRetiradaEDevolucaoSaoNoMesmoDia() {
        LocalDate hoje = LocalDate.now();
        Cliente cliente = clienteExistente();
        Veiculo veiculo = veiculoComSituacao(SituacaoVeiculo.DISPONIVEL);

        when(clienteService.obter(1L)).thenReturn(cliente);
        when(veiculoService.obter(2L)).thenReturn(veiculo);
        when(repository.save(any(Locacao.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        LocacaoResponse resposta = service.registrar(new LocacaoRequest(1L, 2L, hoje, hoje));

        assertThat(resposta.valorPrevisto()).isEqualByComparingTo("120.00");
    }

    @Test
    void registrarBloqueiaVeiculoJaAlugado() {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);

        when(clienteService.obter(1L)).thenReturn(clienteExistente());
        when(veiculoService.obter(2L)).thenReturn(veiculoComSituacao(SituacaoVeiculo.ALUGADO));

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(1L, 2L, retirada, devolucao)))
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("disponível");

        verify(repository, never()).save(any());
    }

    @Test
    void registrarBloqueiaVeiculoEmManutencao() {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);

        when(clienteService.obter(1L)).thenReturn(clienteExistente());
        when(veiculoService.obter(2L)).thenReturn(veiculoComSituacao(SituacaoVeiculo.EM_MANUTENCAO));

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(1L, 2L, retirada, devolucao)))
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("disponível");

        verify(repository, never()).save(any());
    }

    @Test
    void registrarRejeitaDevolucaoAnteriorARetirada() {
        LocalDate retirada = LocalDate.now().plusDays(3);
        LocalDate devolucao = retirada.minusDays(1);

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(1L, 2L, retirada, devolucao)))
                .isInstanceOf(DadosInvalidosException.class)
                .hasMessageContaining("devolução");

        verify(clienteService, never()).obter(any());
        verify(veiculoService, never()).obter(any());
        verify(repository, never()).save(any());
    }

    @Test
    void registrarRejeitaDataRetiradaNoPassado() {
        LocalDate retirada = LocalDate.now().minusDays(1);
        LocalDate devolucao = LocalDate.now().plusDays(2);

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(1L, 2L, retirada, devolucao)))
                .isInstanceOf(DadosInvalidosException.class)
                .hasMessageContaining("retirada");

        verify(clienteService, never()).obter(any());
        verify(veiculoService, never()).obter(any());
        verify(repository, never()).save(any());
    }

    @Test
    void registrarLancaNaoEncontradoQuandoClienteNaoExiste() {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);

        when(clienteService.obter(99L)).thenThrow(new RecursoNaoEncontradoException("Cliente não encontrado."));

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(99L, 2L, retirada, devolucao)))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void registrarLancaNaoEncontradoQuandoVeiculoNaoExiste() {
        LocalDate retirada = LocalDate.now();
        LocalDate devolucao = retirada.plusDays(2);

        when(clienteService.obter(1L)).thenReturn(clienteExistente());
        when(veiculoService.obter(99L)).thenThrow(new RecursoNaoEncontradoException("Veículo não encontrado."));

        assertThatThrownBy(() -> service.registrar(new LocacaoRequest(1L, 99L, retirada, devolucao)))
                .isInstanceOf(RecursoNaoEncontradoException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void buscarPorIdInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }
}
