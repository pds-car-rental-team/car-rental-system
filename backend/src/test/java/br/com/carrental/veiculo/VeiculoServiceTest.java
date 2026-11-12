package br.com.carrental.veiculo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;
import br.com.carrental.veiculo.VeiculoRepository.ContagemPorSituacao;
import br.com.carrental.veiculo.dto.DisponibilidadeResumoResponse;
import br.com.carrental.veiculo.dto.VeiculoRequest;
import br.com.carrental.veiculo.dto.VeiculoResponse;

@ExtendWith(MockitoExtension.class)
class VeiculoServiceTest {

    private static final Pageable PAGINA = PageRequest.of(0, 20);

    @Mock
    private VeiculoRepository repository;

    @InjectMocks
    private VeiculoService service;

    private static VeiculoRequest requestValido() {
        return new VeiculoRequest(
                "abc-1d23",
                "  Fiat Pulse 1.3  ",
                CategoriaVeiculo.SUV,
                new BigDecimal("189.90"),
                SituacaoVeiculo.DISPONIVEL);
    }

    private static Veiculo veiculoExistente() {
        return new Veiculo(
                "ABC1D23",
                "Fiat Pulse 1.3",
                CategoriaVeiculo.SUV,
                new BigDecimal("189.90"),
                SituacaoVeiculo.DISPONIVEL);
    }

    private static ContagemPorSituacao contagem(SituacaoVeiculo situacao, long quantidade) {
        return new ContagemPorSituacao() {
            @Override
            public SituacaoVeiculo getSituacao() {
                return situacao;
            }

            @Override
            public long getQuantidade() {
                return quantidade;
            }
        };
    }

    @Test
    void listarFiltraPorSituacaoECategoriaNormalizandoTermoDeBusca() {
        when(repository.filtrar(
                SituacaoVeiculo.DISPONIVEL,
                CategoriaVeiculo.SUV,
                "abc-1d23",
                "ABC1D23",
                PAGINA))
                .thenReturn(new PageImpl<>(List.of(veiculoExistente())));

        Page<VeiculoResponse> pagina = service.listar(
                SituacaoVeiculo.DISPONIVEL,
                CategoriaVeiculo.SUV,
                "  abc-1d23  ",
                PAGINA);

        assertThat(pagina.getContent()).hasSize(1);
        assertThat(pagina.getContent().getFirst().placa()).isEqualTo("ABC1D23");
        verify(repository).filtrar(
                SituacaoVeiculo.DISPONIVEL,
                CategoriaVeiculo.SUV,
                "abc-1d23",
                "ABC1D23",
                PAGINA);
    }

    @Test
    void listarSemFiltrosTrataBuscaNulaComoVazia() {
        when(repository.filtrar(null, null, "", "", PAGINA))
                .thenReturn(new PageImpl<>(List.of(veiculoExistente())));

        Page<VeiculoResponse> pagina = service.listar(null, null, null, PAGINA);

        assertThat(pagina.getContent()).hasSize(1);
        verify(repository).filtrar(null, null, "", "", PAGINA);
    }

    @Test
    void consultarResumoDisponibilidadeCalculaTotalEPorSituacao() {
        when(repository.contarPorSituacao(null)).thenReturn(List.of(
                contagem(SituacaoVeiculo.DISPONIVEL, 7L),
                contagem(SituacaoVeiculo.ALUGADO, 3L),
                contagem(SituacaoVeiculo.EM_MANUTENCAO, 2L)));

        DisponibilidadeResumoResponse resumo = service.consultarResumoDisponibilidade(null);

        assertThat(resumo.total()).isEqualTo(12L);
        assertThat(resumo.disponiveis()).isEqualTo(7L);
        assertThat(resumo.alugados()).isEqualTo(3L);
        assertThat(resumo.emManutencao()).isEqualTo(2L);
    }

    @Test
    void consultarResumoDisponibilidadePreencheZeroParaSituacoesSemVeiculos() {
        when(repository.contarPorSituacao(CategoriaVeiculo.SUV)).thenReturn(List.of(
                contagem(SituacaoVeiculo.DISPONIVEL, 4L)));

        DisponibilidadeResumoResponse resumo = service.consultarResumoDisponibilidade(CategoriaVeiculo.SUV);

        assertThat(resumo.total()).isEqualTo(4L);
        assertThat(resumo.disponiveis()).isEqualTo(4L);
        assertThat(resumo.alugados()).isZero();
        assertThat(resumo.emManutencao()).isZero();
        verify(repository).contarPorSituacao(CategoriaVeiculo.SUV);
    }

    @Test
    void criarSalvaVeiculoComPlacaEMaiusculaSemMascara() {
        when(repository.existsByPlaca("ABC1D23")).thenReturn(false);
        when(repository.save(any(Veiculo.class))).thenAnswer(invocacao -> invocacao.getArgument(0));

        VeiculoResponse resposta = service.criar(requestValido());

        ArgumentCaptor<Veiculo> salvo = ArgumentCaptor.forClass(Veiculo.class);
        verify(repository).save(salvo.capture());
        assertThat(salvo.getValue().getPlaca()).isEqualTo("ABC1D23");
        assertThat(salvo.getValue().getModelo()).isEqualTo("Fiat Pulse 1.3");
        assertThat(salvo.getValue().getCategoria()).isEqualTo(CategoriaVeiculo.SUV);
        assertThat(salvo.getValue().getSituacao()).isEqualTo(SituacaoVeiculo.DISPONIVEL);
        assertThat(resposta.placa()).isEqualTo("ABC1D23");
    }

    @Test
    void criarBloqueiaPlacaDuplicada() {
        when(repository.existsByPlaca("ABC1D23")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(requestValido()))
                .isInstanceOf(ConflitoException.class)
                .hasMessageContaining("placa");
        verify(repository, never()).save(any());
    }

    @Test
    void buscarPorIdRetornaVeiculo() {
        when(repository.findById(1L)).thenReturn(Optional.of(veiculoExistente()));

        assertThat(service.buscarPorId(1L).modelo()).isEqualTo("Fiat Pulse 1.3");
    }

    @Test
    void buscarPorIdInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99L))
                .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void atualizarAlteraDadosESituacaoDoVeiculo() {
        Veiculo veiculo = veiculoExistente();
        when(repository.findById(1L)).thenReturn(Optional.of(veiculo));
        when(repository.existsByPlacaAndIdNot("XYZ9K88", 1L)).thenReturn(false);
        when(repository.saveAndFlush(veiculo)).thenReturn(veiculo);

        VeiculoResponse resposta = service.atualizar(1L, new VeiculoRequest(
                "xyz-9k88",
                "Toyota Corolla 2.0",
                CategoriaVeiculo.SEDAN,
                new BigDecimal("249.90"),
                SituacaoVeiculo.EM_MANUTENCAO));

        assertThat(resposta.placa()).isEqualTo("XYZ9K88");
        assertThat(resposta.modelo()).isEqualTo("Toyota Corolla 2.0");
        assertThat(resposta.categoria()).isEqualTo(CategoriaVeiculo.SEDAN);
        assertThat(resposta.situacao()).isEqualTo(SituacaoVeiculo.EM_MANUTENCAO);
    }

    @Test
    void atualizarBloqueiaPlacaDeOutroVeiculo() {
        when(repository.findById(1L)).thenReturn(Optional.of(veiculoExistente()));
        when(repository.existsByPlacaAndIdNot("ABC1D23", 1L)).thenReturn(true);

        assertThatThrownBy(() -> service.atualizar(1L, requestValido()))
                .isInstanceOf(ConflitoException.class);
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void excluirRemoveVeiculo() {
        Veiculo veiculo = veiculoExistente();
        when(repository.findById(1L)).thenReturn(Optional.of(veiculo));

        service.excluir(1L);

        verify(repository).delete(veiculo);
    }

    @Test
    void atualizarInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99L, requestValido()))
            .isInstanceOf(RecursoNaoEncontradoException.class);
    }

    @Test
    void excluirInexistenteLancaNaoEncontrado() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.excluir(99L))
            .isInstanceOf(RecursoNaoEncontradoException.class);
        verify(repository, never()).delete(any());
    }
}

