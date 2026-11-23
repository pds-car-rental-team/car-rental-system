package br.com.carrental.locacao;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.carrental.cliente.Cliente;
import br.com.carrental.cliente.ClienteService;
import br.com.carrental.locacao.dto.LocacaoRequest;
import br.com.carrental.locacao.dto.LocacaoResponse;
import br.com.carrental.shared.exception.ConflitoException;
import br.com.carrental.shared.exception.DadosInvalidosException;
import br.com.carrental.shared.exception.RecursoNaoEncontradoException;
import br.com.carrental.shared.util.Texto;
import br.com.carrental.veiculo.SituacaoVeiculo;
import br.com.carrental.veiculo.Veiculo;
import br.com.carrental.veiculo.VeiculoService;

@Service
@Transactional(readOnly = true)
public class LocacaoService {

    private final LocacaoRepository repository;
    private final ClienteService clienteService;
    private final VeiculoService veiculoService;

    public LocacaoService(
            LocacaoRepository repository,
            ClienteService clienteService,
            VeiculoService veiculoService) {
        this.repository = repository;
        this.clienteService = clienteService;
        this.veiculoService = veiculoService;
    }

    @Transactional
    public LocacaoResponse registrar(LocacaoRequest request) {
        validarDatas(request.dataRetirada(), request.dataPrevistaDevolucao());

        Cliente cliente = clienteService.obter(request.clienteId());
        Veiculo veiculo = veiculoService.obter(request.veiculoId());

        if (veiculo.getSituacao() != SituacaoVeiculo.DISPONIVEL) {
            throw new ConflitoException("Veículo não está disponível para locação.");
        }

        long diarias = Math.max(1L, ChronoUnit.DAYS.between(request.dataRetirada(), request.dataPrevistaDevolucao()));
        BigDecimal valorDiaria = veiculo.getValorDiaria();
        BigDecimal valorPrevisto = valorDiaria.multiply(BigDecimal.valueOf(diarias));

        veiculo.alterarSituacao(SituacaoVeiculo.ALUGADO);

        Locacao locacao = new Locacao(
                cliente,
                veiculo,
                request.dataRetirada(),
                request.dataPrevistaDevolucao(),
                valorDiaria,
                valorPrevisto,
                StatusLocacao.ABERTA);

        return LocacaoResponse.de(repository.save(locacao));
    }

    public LocacaoResponse buscarPorId(Long id) {
        Locacao locacao = repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Locação não encontrada."));
        return LocacaoResponse.de(locacao);
    }

    public Page<LocacaoResponse> listar(FiltroStatusLocacao status, String busca, Pageable pageable) {
        StatusLocacao statusEntidade = switch (status) {
            case ABERTA, ATRASADA -> StatusLocacao.ABERTA;
            case FINALIZADA -> StatusLocacao.FINALIZADA;
            case CANCELADA -> StatusLocacao.CANCELADA;
            case null -> null;
        };
        boolean somenteNoPrazo = status == FiltroStatusLocacao.ABERTA;
        boolean somenteAtrasadas = status == FiltroStatusLocacao.ATRASADA;
        String termo = busca == null ? "" : busca.trim();
        String buscaCpf = Texto.apenasDigitos(termo);
        String buscaPlaca = normalizarPlaca(termo);

        return repository
                .filtrar(
                        statusEntidade,
                        somenteNoPrazo,
                        somenteAtrasadas,
                        LocalDate.now(),
                        termo,
                        buscaCpf,
                        buscaPlaca,
                        pageable)
                .map(LocacaoResponse::de);
    }

    private static String normalizarPlaca(String valor) {
        return valor == null ? "" : valor.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
    }

    private static void validarDatas(LocalDate dataRetirada, LocalDate dataPrevistaDevolucao) {
        if (dataRetirada.isBefore(LocalDate.now())) {
            throw new DadosInvalidosException("A data de retirada não pode ser anterior à data atual.");
        }
        if (dataPrevistaDevolucao.isBefore(dataRetirada)) {
            throw new DadosInvalidosException("A data prevista de devolução não pode ser anterior à data de retirada.");
        }
    }
}
